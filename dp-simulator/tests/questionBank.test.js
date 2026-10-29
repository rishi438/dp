import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseQuestionBank, validateSnippet, QUESTION_BANK_TEMPLATE } from '../src/data/questionBank.js';
import { executeSnippet, runProcess } from '../runner.js';
import { createServer } from '../server.js';

const sample = await readFile(new URL('../public/question-banks/jpmc-se3-python-fullstack.json', import.meta.url), 'utf8');
const hasPython = (await runProcess('python', ['--version'], { timeout: 3000 })).success;

test('question bank format accepts the template and sample, and rejects bad files', () => {
  assert.equal(parseQuestionBank(QUESTION_BANK_TEMPLATE).questions.length, 2);
  const bank = parseQuestionBank(sample);
  assert.ok(bank.questions.length >= 20);
  assert.throws(() => parseQuestionBank('{'), /not valid JSON/);
  assert.throws(() => parseQuestionBank({ questions: [] }), /format/);
  const one = { id: 'a', title: 'A', prompt: 'p' };
  assert.throws(() => parseQuestionBank({ format: bank.format, questions: [one, one] }), /duplicate id/);
  assert.throws(() => parseQuestionBank({ format: bank.format, questions: [{ ...one, tests: [{ call: 'f()' }] }] }), /expected/);
  assert.throws(() => validateSnippet({ code: 'x = 1', tests: [] }), /at least one test/);
});

test('every sample reference solution passes its own tests, and starters do not', { skip: !hasPython }, async () => {
  for (const q of parseQuestionBank(sample).questions.filter(q => q.tests.length)) {
    const good = await executeSnippet({ code: q.solution, tests: q.tests });
    assert.equal(good.passed, true, `${q.id}: ${JSON.stringify(good.results.filter(r => !r.passed))} ${good.stderr}`);
    assert.equal((await executeSnippet({ code: q.starter, tests: q.tests })).passed, false, `${q.id} starter should fail`);
  }
});

test('snippet API validates input and reports per-test results', { skip: !hasPython }, async () => {
  const server = createServer({ store: null });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/run-snippet`;
  const post = (body, origin = 'http://127.0.0.1:6179') => fetch(url, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  try {
    assert.equal((await post({ code: 'x=1', tests: [{ call: 'x', expected: '1' }] }, 'http://example.com')).status, 403);
    assert.equal((await post({ code: 'x=1', tests: 'nope' })).status, 400);
    const response = await post({ code: 'def f(n):\n    return n * 2\n', tests: [{ call: 'f(2)', expected: '4' }, { call: 'f(3)', expected: '5' }, { call: 'g()', expected: '1' }] });
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.deepEqual(data.results.map(r => r.passed), [true, false, false]);
    assert.match(data.results[2].error, /NameError/);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('bank submissions are saved with a UUID and can be read back by id', async () => {
  const { openStore } = await import('../reasoning-store.js');
  const { DatabaseSync } = await import('node:sqlite');
  const { mkdtempSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const path = (await import('node:path')).default;
  const directory = mkdtempSync(path.join(tmpdir(), 'dp-bank-store-'));
  const file = path.join(directory, 'reasoning.db');
  const store = openStore(file);
  const server = createServer({ store });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/bank/submit`;
  const question = parseQuestionBank(sample).questions.find(q => q.id === 'gil-concurrency');
  const post = (body, origin = 'http://127.0.0.1:6179') => fetch(url, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  try {
    assert.equal((await post({ bankTitle: 'b', question, kind: 'notes', answer: 'x' }, 'http://example.com')).status, 403);
    assert.equal((await post({ bankTitle: 'b', question, kind: 'notes', answer: '' })).status, 400);
    assert.equal((await post({ bankTitle: 'b', question: { id: 'bad id' }, kind: 'notes', answer: 'x' })).status, 400);
    const response = await post({ bankTitle: 'JPMC', question, kind: 'notes', answer: 'One thread runs bytecode at a time.' });
    assert.equal(response.status, 201);
    const { id } = await response.json();
    assert.match(id, /^[0-9a-f-]{36}$/);
    const db = new DatabaseSync(file, { readOnly: true });
    const row = db.prepare('SELECT * FROM bank_answers WHERE id = ?').get(id);
    db.close();
    assert.equal(row.user_answer, 'One thread runs bytecode at a time.');
    assert.equal(JSON.parse(row.question_json).answer, question.answer);
    assert.equal(row.passed, null);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); store.close(); rmSync(directory, { recursive: true, force: true }); }
});
