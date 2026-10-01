import test from 'node:test';
import assert from 'node:assert/strict';
import { PRACTICE, chapterPractices, getPractice, runTrace, validateInput } from '../src/data/practice.js';
import { assembleSource } from '../src/data/runnerContract.js';
import { executeSolution, gradeResults, runProcess } from '../runner.js';
import { createServer } from '../server.js';

const expected = {
  'coin-min': [3, -1, 2, 0], 'coin-combinations': [2, 4, 0, 1], 'word-break': [true, false, true],
  kadane: [6, -2, 0, 7], lcs: [3, 0, 0, 2], 'edit-distance': [3, 3, 0], 'grid-min': [7, 5, 6], 'grid-paths': [6, 1, 3],
  knapsack: [12, 7, 0], 'subset-sum': [true, false, true], lis: [4, 1, 0, 1], 'stock-cooldown': [3, 0, 0, 1],
  'matrix-chain': [4500, 0, 6000], 'burst-balloons': [167, 10, 0], lps: [4, 2, 0, 1], 'tree-rob': [9, 7, 0],
  tsp: [80, 0, 7], 'digit-no4': [82, 4, 730, 1, 0], 'digit-adjacent': [21, 91, 91, 923, 1, 0], knight: [.0625, 0, 1], 'jump-k': [7, -6, 5, 0],
};

for (const problem of PRACTICE) test(`${problem.id}: exact examples, memo and recursion agree`, () => {
  const answers = problem.id.startsWith('stairs') ? [8, 13, 1, 0] : problem.id.startsWith('fib') ? [8, 0, 1, 21] : expected[problem.id];
  assert.ok(answers, 'Every practice exercise has independently specified expected answers');
  problem.examples.forEach((input, i) => {
    const memo = runTrace(problem, input, { maxCalls: 100000 });
    assert.equal(memo.result, answers[i]); assert.equal(memo.truncated, false);
    const plain = runTrace(problem, input, { memoized: false, maxCalls: 100000 });
    assert.equal(plain.truncated, false); assert.equal(plain.result, answers[i]);
  });
});

test('all chapters have explicit practice; bad inputs are rejected', () => {
  for (let chapter = 0; chapter < 19; chapter++) assert.ok(chapterPractices(chapter).length);
  for (const [id, input] of [['coin-min', { coins: [0], amount: 5 }], ['stairs-0', { n: -1, hops: [1] }], ['lcs', { s1: 1, s2: 'a' }], ['grid-min', { grid: [[1], [1, 2]] }], ['tree-rob', { nodes: [-1, 4] }], ['knight', { size: 3, moves: 2, row: 3, col: 0 }]]) assert.throws(() => validateInput(getPractice(id), input));
});

test('digit DP is truly recursive and memoized, including zero', () => {
  const p = getPractice('digit-no4'), trace = runTrace(p, { n: 999999 });
  assert.equal(trace.result, 9 ** 6); assert.ok(trace.hits > 0); assert.ok(trace.states <= 14);
  assert.ok(trace.nodes.some(n => n.depth > 1));
  for (let n = 0; n <= 350; n++) {
    const brute = Array.from({ length: n + 1 }, (_, i) => i).filter(i => !String(i).includes('4')).length;
    assert.equal(runTrace(p, { n }).result, brute);
    const adjacent = Array.from({ length: n + 1 }, (_, i) => i).filter(i => !/(\d)\1/.test(String(i))).length;
    assert.equal(runTrace(getPractice('digit-adjacent'), { n }).result, adjacent);
  }
});

test('plain recursion is bounded and memoization saves work', () => {
  const p = getPractice('fib-1'), input = { n: 20 };
  assert.equal(runTrace(p, input, { memoized: false, maxCalls: 100 }).truncated, true);
  const memo = runTrace(p, input); assert.equal(memo.result, 6765); assert.ok(memo.calls < 100);
});

test('exit zero alone never passes; bool and integer differ', () => {
  const p = getPractice('fib-1');
  assert.equal(gradeResults(p, { success: true, stdout: '', stderr: '' }).passed, false);
  assert.equal(gradeResults(p, { success: true, stdout: '__DP_RESULT__{"actual":true}', stderr: '' }).passed, false);
});

test('Python protected harness: correct, incorrect, and unfinished bodies', async () => {
  const p = getPractice('fib-1');
  const body = 'a, b = 0, 1\nfor _ in range(n):\n    a, b = b, a + b\nreturn a';
  const good = await executeSolution(p, 'python', body); assert.equal(good.passed, true, good.stderr);
  assert.equal((await executeSolution(p, 'python', 'return 1')).passed, false);
  assert.equal((await executeSolution(p, 'python', 'pass')).passed, false);
  const source = assembleSource(p, 'python', body);
  assert.ok(source.includes('def fib_1(n: int) -> int:'));
  assert.ok(source.includes('if __name__ == "__main__":'));
});

test('Rust protected harness handles numeric, boolean, string and nested-array inputs', async () => {
  for (const [id, body] of [
    ['fib-1', 'let (mut a, mut b) = (0, 1);\nfor _ in 0..n { let next = a + b; a = b; b = next; }\na'],
    ['word-break', 'let mut dp = vec![false; s.len()+1]; dp[0]=true;\nfor i in 1..=s.len() { for w in &words { if i>=w.len() && dp[i-w.len()] && &s[i-w.len()..i] == w { dp[i]=true; } } }\ndp[s.len()]'],
    ['grid-min', 'let mut d=grid;\nfor r in 0..d.len() { for c in 0..d[0].len() { if r+c>0 { let up=if r>0 {d[r-1][c]} else {i64::MAX}; let left=if c>0 {d[r][c-1]} else {i64::MAX}; d[r][c]+=up.min(left); } } }\nd[d.len()-1][d[0].len()-1]'],
    ['knight', 'fn p(n:i64,k:i64,r:i64,c:i64)->f64 { if r<0 || c<0 || r>=n || c>=n {return 0.0;} if k==0 {return 1.0;} let mut total=0.0; for (dr,dc) in [(1,2),(2,1),(-1,2),(-2,1),(1,-2),(2,-1),(-1,-2),(-2,-1)] {total+=p(n,k-1,r+dr,c+dc)/8.0;} total }\np(size,moves,row,col)'],
  ]) {
    const result = await executeSolution(getPractice(id), 'rust', body);
    assert.equal(result.passed, true, `${id}: ${result.stderr}`);
  }
});

test('runner bounds output and stops a timed-out process', async () => {
  const noisy = await runProcess('python', ['-c', 'print("x" * 100000)']);
  assert.equal(noisy.success, false); assert.ok(noisy.stdout.length <= 65536); assert.match(noisy.stderr, /Output limit/);
  const slow = await runProcess('python', ['-c', 'import time; time.sleep(5)'], { timeout: 200 });
  assert.equal(slow.success, false); assert.match(slow.stderr, /exceeded/);
  assert.ok(slow.timeMs < 2500, 'A timeout must terminate the process promptly, not wait for normal exit.');
});

test('API rejects remote origins, invalid IDs and malformed JSON', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/run`;
  try {
    const request = (origin, body) => fetch(url, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body });
    assert.equal((await request('http://example.com', '{}')).status, 403);
    assert.equal((await request('http://127.0.0.1:5173', '{')).status, 400);
    assert.equal((await request('http://127.0.0.1:5173', JSON.stringify({ problemId: 'missing', language: 'python', body: 'pass' }))).status, 400);
    assert.equal((await request('http://127.0.0.1:5173', 'x'.repeat(70000))).status, 413);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
