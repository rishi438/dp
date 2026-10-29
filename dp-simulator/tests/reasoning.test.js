import test from 'node:test';
import assert from 'node:assert/strict';
import { REASONING_FIELDS, isPlanApproved, answerErrors } from '../src/data/reasoning.js';
import { parseReview, reviewReasoning, ReviewUnavailable } from '../reasoning-review.js';
import { getPractice } from '../src/data/practice.js';
import { createServer } from '../server.js';
import { openStore } from '../reasoning-store.js';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const answers = Object.fromEntries(REASONING_FIELDS.map(({ id }) => [id, `Explanation of ${id}`]));
const assessment = () => ({ summary: 'Review complete.', fields: Object.fromEntries(REASONING_FIELDS.map(({ id }) => [id, { status: 'correct', feedback: 'Consistent with the other answers.' }])) });

test('completion alone never unlocks; review belongs to the exact exercise and all five answers', () => {
  assert.deepEqual(answerErrors(answers), {});
  assert.equal(isPlanApproved('lis', { answers }), false);
  const review = parseReview(assessment(), 'lis', answers, 'test');
  assert.equal(isPlanApproved('lis', { answers, review }), true);
  assert.equal(isPlanApproved('other', { answers, review }), false);
  for (const { id } of REASONING_FIELDS) {
    assert.equal(isPlanApproved('lis', { answers: { ...answers, [id]: 'Changed intention' }, review }), false);
    const raw = assessment(); raw.fields[id].status = 'unclear';
    assert.equal(isPlanApproved('lis', { answers, review: parseReview(raw, 'lis', answers, 'test') }), false);
    delete raw.fields[id]; assert.throws(() => parseReview(raw, 'lis', answers, 'test'), ReviewUnavailable);
  }
  assert.equal(isPlanApproved('lis', { answers, review: { ...review, version: 0 } }), false);
  assert.equal(isPlanApproved('lis', { answers, review: { ...review, summary: {} } }), false);
  assert.equal(isPlanApproved('lis', { answers, review: { ...review, fields: { ...review.fields, state: { status: 'correct' } } } }), false);
  assert.equal(isPlanApproved('lis', {}), false);
  assert.equal(Object.keys(answerErrors({})).length, 5);
  assert.ok(answerErrors({ ...answers, state: 'x'.repeat(2001) }).state);
});

test('local reviewer uses structured assessments and fails closed on unavailable or incomplete output', async () => {
  let calls = 0;
  const fetchImpl = async (url, options) => {
    calls++;
    assert.equal(url, 'http://127.0.0.1:11434/api/chat');
    const request = JSON.parse(options.body);
    assert.equal(request.stream, false); assert.equal(request.format.type, 'object');
    assert.equal(JSON.parse(request.messages[1].content).studentAnswers.state, answers.state);
    return Response.json({ done: true, message: { content: JSON.stringify(assessment()) } });
  };
  assert.equal((await reviewReasoning(getPractice('lis'), answers, undefined, { fetchImpl })).verdict, 'approved');
  await assert.rejects(reviewReasoning(getPractice('lis'), {}, undefined, { fetchImpl }));
  assert.equal(calls, 1);
  for (const result of [null, { done: true, message: { content: '{}' } }, { done: true, done_reason: 'length', message: { content: JSON.stringify(assessment()) } }, { done: false }]) {
    await assert.rejects(reviewReasoning(getPractice('lis'), answers, undefined, { fetchImpl: async () => result ? Response.json(result) : new Response('', { status: 503 }) }), ReviewUnavailable);
  }
});

test('review API validates input before inference, isolates concurrent work and recovers after failure', async () => {
  let calls = 0, release;
  const server = createServer({ store: null, reviewer: async (problem, received) => {
    calls++; assert.equal(problem.id, 'lis'); assert.deepEqual(received, answers);
    if (calls === 1) return new Promise(resolve => { release = () => resolve(parseReview(assessment(), problem.id, received, 'test')); });
    throw new ReviewUnavailable('Reviewer unavailable.');
  } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/reasoning/review`;
  const request = (body, origin = 'http://127.0.0.1:6179') => fetch(url, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  try {
    assert.equal((await request({}, 'http://example.com')).status, 403);
    assert.equal((await request('{')).status, 400);
    assert.equal((await request({ problemId: 'missing', answers })).status, 400);
    assert.equal((await request({ problemId: 'lis', answers: {} })).status, 400);
    assert.equal((await request('x'.repeat(70000))).status, 413);
    assert.equal(calls, 0);
    const pending = request({ problemId: 'lis', answers });
    while (!release) await new Promise(resolve => setTimeout(resolve, 5));
    assert.equal((await request({ problemId: 'lis', answers })).status, 429);
    release();
    const response = await pending;
    assert.equal(response.status, 200); assert.equal((await response.json()).review.verdict, 'approved');
    assert.equal((await request({ problemId: 'lis', answers })).status, 503);
    assert.equal((await request({ problemId: 'lis', answers })).status, 503);
  } finally { release?.(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('every submitted check is saved before review, and the review is attached when it succeeds', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'dp-store-'));
  const file = path.join(directory, 'reasoning.db');
  const store = openStore(file);
  let fail = false;
  const server = createServer({ store, reviewer: async (problem, received) => {
    if (fail) throw new ReviewUnavailable('Reviewer unavailable.');
    return parseReview(assessment(), problem.id, received, 'test');
  } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const post = () => fetch(`http://127.0.0.1:${server.address().port}/api/reasoning/review`, { method: 'POST', headers: { origin: 'http://127.0.0.1:6179', 'content-type': 'application/json' }, body: JSON.stringify({ problemId: 'lis', answers }) });
  try {
    assert.equal((await post()).status, 200);
    fail = true;
    assert.equal((await post()).status, 503);
    const db = new DatabaseSync(file, { readOnly: true });
    const rows = db.prepare('SELECT * FROM reasoning_checks ORDER BY id').all();
    db.close();
    assert.equal(rows.length, 2);
    assert.deepEqual(JSON.parse(rows[0].answers_json), answers);
    assert.equal(rows[0].problem_id, 'lis'); assert.equal(rows[0].verdict, 'approved');
    assert.equal(JSON.parse(rows[0].problem_json).title, getPractice('lis').title);
    assert.equal(rows[1].review_json, null); assert.equal(rows[1].verdict, null);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); store.close(); rmSync(directory, { recursive: true, force: true }); }
});
