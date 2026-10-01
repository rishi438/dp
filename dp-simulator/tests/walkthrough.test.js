import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { PRACTICE, getPractice, runTrace } from '../src/data/practice.js';
import { codeStepTrace, traceCode } from '../src/data/traceCode.js';
import { goldPractice, staircaseData, simulationPractices } from '../src/data/staircase.js';
import { callTreeNodes, layoutCallTree } from '../src/data/callTree.js';
import { treeExamples } from '../src/data/treeExamples.js';

const normalize = value => value === Infinity ? 'Infinity' : value === -Infinity ? '-Infinity' : value;

test('every problem has complete small and larger examples with all branches drawable', () => {
  for (const problem of [...PRACTICE, goldPractice]) for (const memoized of [false, true]) {
    const examples = treeExamples(problem);
    const small = runTrace(problem, examples.small, { memoized });
    const large = runTrace(problem, examples.large, { memoized });
    assert.ok(small.calls > 1 && small.calls <= 9, `${problem.id}: small must be a real, readable tree`);
    assert.ok(large.calls > small.calls, `${problem.id}: large must demonstrate more calls`);
    for (const trace of [small, large]) {
      assert.equal(trace.truncated, false, problem.id);
      const tree = callTreeNodes(trace);
      const layout = layoutCallTree(tree);
      assert.equal(layout.length, trace.calls + 1, `${problem.id}: no cropped branches`);
      const ids = new Set(tree.map(node => node.id));
      assert.equal(tree.filter(node => node.parent === null).length, 1);
      assert.ok(tree.slice(1).every(node => ids.has(node.parent)));
      assert.equal(codeStepTrace(problem, trace, memoized).events.at(-1).kind, 'answer');
    }
  }
});

test('Chapter 10 connects all LIS endpoints to solve instead of showing an isolated first element', () => {
  const problem = getPractice('lis');
  const trace = runTrace(problem, treeExamples(problem).small);
  const tree = callTreeNodes(trace);
  const endpoints = tree.filter(node => node.parent === 'solve');
  assert.deepEqual(endpoints.map(node => node.state), [[0], [1], [2]]);
  assert.ok(tree.some(node => endpoints.some(endpoint => endpoint.id === node.parent)));
  assert.equal(trace.result, 2);
  assert.ok(trace.nodes.filter(node => node.parent === null).length === 3, 'original trace must stay unchanged');
});

test('code playback enters go, builds the key, checks memo, writes it and resumes each caller', () => {
  const problem = getPractice('coin-combinations');
  const trace = runTrace(problem, problem.examples[0]);
  const { events } = codeStepTrace(problem, trace);
  assert.deepEqual(events.slice(0, 10).map(event => event.kind),
    ['solve', 'init', 'define', 'invoke', 'call', 'key', 'lookup', 'enter', 'evaluate', 'call']);
  const leaf = events.findIndex(event => event.kind === 'store');
  assert.deepEqual(events.slice(leaf - 5, leaf + 3).map(event => event.kind),
    ['call', 'key', 'lookup', 'enter', 'evaluate', 'store', 'return', 'resume']);
  assert.equal(events[leaf + 2].id, trace.nodes.find(node => node.id === events[leaf].id).parent);
  assert.equal(events[leaf + 2].returnedValue, events[leaf].value);
  assert.equal(events[leaf + 2].value, undefined, 'a child result must not look like the completed parent value');
  for (let i = 0; i < events.length; i++) {
    if (events[i].kind !== 'cache') continue;
    assert.deepEqual(events.slice(i - 3, i + 2).map(event => event.kind), ['call', 'key', 'lookup', 'cache', 'resume']);
    assert.equal(events[i - 1].value, undefined, 'lookup must not expose a future result');
  }
  assert.ok(events.some(event => event.kind === 'cache'));
});

test('expanded code playback preserves every bounded state event and executable line in all examples', () => {
  for (const problem of [...PRACTICE, goldPractice]) for (const memoized of [false, true]) for (const input of problem.examples) {
    const trace = runTrace(problem, input, { memoized });
    const code = traceCode(problem, memoized);
    const expanded = codeStepTrace(problem, trace, memoized);
    const stateEvents = expanded.events.filter(event => ['enter', 'cache', 'return', 'answer'].includes(event.kind));
    assert.deepEqual(stateEvents.map(({ kind, id, key, state, value }) => ({ kind, id, key, state, value })),
      trace.events.map(({ kind, id, key, state, value }) => ({ kind, id, key, state, value })), problem.id);
    assert.ok(expanded.events.every(event => event.line >= 1 && event.line <= code.lines.length), problem.id);
    assert.equal(expanded.events.filter(event => event.kind === 'call').length, trace.nodes.length);
    assert.equal(expanded.events.filter(event => event.kind === 'store').length, memoized ? trace.events.filter(event => event.kind === 'return').length : 0);
    if (!memoized) assert.ok(expanded.events.every(event => !['init', 'key', 'lookup', 'store', 'cache'].includes(event.kind)));
  }
});

test('call trees branch downward without overlapping tiles, including forests and bounded traces', () => {
  for (const problem of [...PRACTICE, goldPractice]) for (const memoized of [false, true]) for (const input of problem.examples) {
    const trace = runTrace(problem, input, { memoized });
    const layout = layoutCallTree(trace.nodes);
    assert.equal(layout.length, Math.min(120, trace.nodes.length));
    const nodes = new Map(layout.map(node => [node.id, node]));
    for (const node of layout) {
      assert.ok(Number.isFinite(node.position.x) && Number.isFinite(node.position.y));
      const parent = nodes.get(node.parent);
      if (parent) assert.ok(node.position.y - parent.position.y >= 110);
      const siblings = layout.filter(other => other.depth === node.depth && other.id !== node.id);
      for (const sibling of siblings) assert.ok(Math.abs(node.position.x - sibling.position.x) >= 170, problem.id);
      const children = layout.filter(child => child.parent === node.id);
      if (children.length) assert.equal(node.position.x, (children[0].position.x + children.at(-1).position.x) / 2);
    }
    assert.ok(trace.nodes.every(node => node.position === undefined), 'layout must not mutate the playback trace');
  }
});

test('displayed Python follows the same state calls, cache hits and returns as every reference simulation', () => {
  const cases = [];
  for (const problem of [...PRACTICE, goldPractice]) for (const memoized of [false, true]) for (const input of problem.examples) {
    const code = traceCode(problem, memoized);
    const instrumented = code.lines.flatMap((line, i) => {
      const state = `[${code.params.join(', ')}]`;
      if (i + 1 === code.markers.enter) return [`        events.append(['enter', ${state}, None])`, line];
      if (i + 1 === code.markers.cache) return [`            events.append(['cache', ${state}, clean(memo[key])])`, line];
      if (i + 1 === code.markers.return) return [`        events.append(['return', ${state}, clean(value)])`, line];
      return [line];
    }).join('\n');
    const trace = runTrace(problem, input, { memoized, maxCalls: 100000 });
    assert.equal(trace.truncated, false);
    cases.push({ name: `${problem.id} ${memoized} ${JSON.stringify(input)}`, source: instrumented, input,
      expected: normalize(trace.result), events: trace.events.filter(e => e.kind !== 'answer').map(e => [e.kind, e.state, e.value === undefined ? null : normalize(e.value)]) });
  }
  const python = `import json, sys
def clean(value):
    return 'Infinity' if value == float('inf') else '-Infinity' if value == -float('inf') else value
results = []
for case in json.load(sys.stdin):
    events = []
    namespace = {'events': events, 'clean': clean}
    exec(case['source'], namespace)
    result = namespace['solve'](**case['input'])
    results.append({'result': clean(result), 'events': events})
json.dump(results, sys.stdout)
`;
  const result = spawnSync('python', ['-c', python], { input: JSON.stringify(cases), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 30000, windowsHide: true });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  const actual = JSON.parse(result.stdout);
  cases.forEach((c, i) => {
    assert.equal(actual[i].result, c.expected, c.name);
    assert.deepEqual(actual[i].events, c.events, c.name);
  });
});

test('restored staircase handles three hops, unreachable steps, ground and free endpoints', () => {
  for (const hops of [[1, 2], [1, 2, 3], [2], [], [25]]) for (const n of [0, 1, 2, 5, 20]) {
    const input = { n, hops }, data = staircaseData(input);
    assert.equal(data.answer, runTrace(getPractice('stairs-0'), input).result);
    assert.equal(data.cells.length, n + 1);
  }
  assert.equal(staircaseData({ nums: [0, 10, -50] }, true).answer, 10);
  assert.equal(staircaseData({ nums: [0, 10, -50] }, true).terminationIndex, 1);
  assert.equal(staircaseData({ nums: [-5] }, true).answer, -5);
  assert.equal(staircaseData({ nums: [] }, true).answer, 0);
  for (let chapter = 0; chapter < 19; chapter++) assert.ok(simulationPractices(chapter).every(p => p.chapter === chapter));
});

test('every chapter trace renders simulation and synchronized code together, including boundary inputs', async () => {
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' });
  try {
    const { default: Trace } = await vite.ssrLoadModule('/src/components/TraceExplorer.jsx');
    const { default: Staircase } = await vite.ssrLoadModule('/src/components/StaircaseSimulator.jsx');
    const { default: Code } = await vite.ssrLoadModule('/src/components/TraceCodeViewer.jsx');
    const { default: Chapter } = await vite.ssrLoadModule('/src/components/ChapterDesignatedSimulator.jsx');
    for (let chapterNum = 0; chapterNum <= 18; chapterNum++) for (const compare of [false, true]) {
      const html = renderToString(React.createElement(Chapter, { chapterNum, compare }));
      assert.doesNotMatch(html, /Explain your plan before coding/);
      assert.match(html, /Small tree/);
      assert.match(html, /Large tree/);
      assert.match(html, /With cache/);
      assert.match(html, /Without cache/);
      assert.match(html, /Cache hits in selected run/);
      assert.match(html, /Complete small example/);
      assert.match(html, /Synchronized reference code/);
      assert.match(html, /aria-label="Expand simulation"/);
      assert.match(html, /aria-label="Previous step"/);
      assert.match(html, /aria-label="Next step"/);
      assert.match(html, /aria-label="Simulation step"/);
      assert.match(html, /Pace <select aria-label="Playback speed"/);
      assert.doesNotMatch(html, /Small piece/);
    }
    for (const problem of [...PRACTICE, goldPractice]) for (const initialSize of ['small', 'large']) {
      const html = renderToString(React.createElement(Trace, { problem, input: problem.examples[0], initialSize }));
      assert.match(html, /Recursive call tree/);
      assert.match(html, /aria-current="step"/);
      assert.match(html, initialSize === 'small' ? /Small complete example/ : /Larger complete example/);
      assert.doesNotMatch(html, /drawing limit|NaN/);
    }
    for (const problem of [...PRACTICE, goldPractice]) for (const input of problem.examples) {
      const html = renderToString(React.createElement(Trace, { problem, input, memoized: problem.chapter !== 1 }));
      assert.match(html, /Synchronized reference code/);
      assert.match(html, /aria-current="step"/);
      assert.doesNotMatch(html, /NaN/);
    }
    for (const problem of [getPractice('stairs-0'), goldPractice]) for (const input of problem.examples) {
      const html = renderToString(React.createElement(Staircase, { problem, input }));
      assert.match(html, /Staircase DP table/);
      assert.match(html, /Synchronized reference code/);
      assert.match(html, /aria-label="Expand simulation"/);
      assert.match(html, /Pace <select aria-label="Playback speed"/);
      assert.doesNotMatch(html, /NaN/);
    }
    const hidden = renderToString(React.createElement(Code, { problem: getPractice('fib-2'), memoized: true, event: { kind: 'return', state: [8], value: 999999 }, hiddenValue: true }));
    assert.doesNotMatch(hidden, /999999/);
  } finally { await vite.close(); }
});
