import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { approvedPlan } from './reasoning-fixture.js';
import { getPractice } from '../src/data/practice.js';

test('chapter visualizations render their actual inputs without throwing', async () => {
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
  try {
    const pairs = {
      'stairs-3': 'Tabulation', 'stairs-4': 'SpaceOptimized', 'coin-min': 'CoinChange', kadane: 'Kadane', lcs: 'LCS',
      'grid-min': 'GridMovement', knapsack: 'Knapsack', lis: 'LIS', 'stock-cooldown': 'StateMachine',
      'matrix-chain': 'IntervalSplit', lps: 'Palindromic', 'tree-rob': 'TreeDP', tsp: 'Bitmask', knight: 'ProbabilityDP', 'jump-k': 'OptimizedDP',
    };
    for (const [id, component] of Object.entries(pairs)) {
      const { default: View } = await vite.ssrLoadModule(`/src/components/simulators/${component}Simulator.jsx`);
      for (const input of getPractice(id).examples) {
        if ((input.nums && !input.nums.length) || (input.prices && !input.prices.length) || (input.s === '') || (input.nodes && !input.nodes.length) || (input.dist?.length === 1) || (input.hops && JSON.stringify(input.hops) !== '[1,2]')) continue;
        const html = renderToString(React.createElement(View, { input }));
        assert.ok(html.length > 100, `${id} must render for ${JSON.stringify(input)}`);
        assert.ok(!html.includes('NaN'), `${id} must not display NaN`);
      }
    }
    const { default: Workspace } = await vite.ssrLoadModule('/src/components/ChallengeCodeWorkspace.jsx');
    const locked = renderToString(React.createElement(Workspace, { chapterNum: 16, selectedChapter: { num: 16 }, onPassed() {} }));
    assert.match(locked, /Explain your plan before coding/); assert.doesNotMatch(locked, /Solution function body/);
    assert.match(locked, /Skip review/);
    const previousStorage = globalThis.localStorage;
    globalThis.localStorage = { getItem: key => key === 'dp.v2.plan.digit-no4' ? JSON.stringify({ answers: {}, review: null, skipped: true }) : null };
    try {
      const skipped = renderToString(React.createElement(Workspace, { chapterNum: 16, selectedChapter: { num: 16 }, onPassed() {} }));
      assert.match(skipped, /Solution function body/); assert.match(skipped, /Review skipped/); assert.doesNotMatch(skipped, /Reasoning accepted/);
      const other = renderToString(React.createElement(Workspace, { chapterNum: 10, selectedChapter: { num: 10 }, onPassed() {} }));
      assert.doesNotMatch(other, /Solution function body/); assert.match(other, /Skip review/);
    } finally { if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage; }
    globalThis.localStorage = { getItem: key => key === 'dp.v2.plan.digit-no4' ? JSON.stringify(approvedPlan('digit-no4')) : null };
    let html;
    try { html = renderToString(React.createElement(Workspace, { chapterNum: 16, selectedChapter: { num: 16, folder: 'chapter 16 - digit dp' }, onPassed() {} })); } finally { if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage; }
    assert.match(html, /Solution function body/); assert.match(html, /Read-only test runner/);
    assert.match(html, /digit_no4/); assert.doesNotMatch(html, /solve_ch16/);
    const { default: Quiz, chapterOf } = await vite.ssrLoadModule('/src/components/QuizModal.jsx');
    assert.equal(chapterOf({ category: 'Ch 15 · Bitmask' }), 15);
    assert.match(renderToString(React.createElement(Quiz, { chapterNum: 18 })), /Jump Game VI/);
  } finally { await vite.close(); }
});
