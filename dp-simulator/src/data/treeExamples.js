// Complete, valid inputs for learning the recurrence on a small tree.
// Branch counts follow the algorithm: knight probability still has eight moves.
const smallInputs = {
  stairs: { n: 3, hops: [1, 2] },
  fib: { n: 3 },
  'gold-stairs': { nums: [0, 2, 1] },
  'coin-min': { coins: [1, 2], amount: 3 },
  'coin-combinations': { coins: [1], amount: 2 },
  'word-break': { s: 'aaa', words: ['a', 'aa'] },
  kadane: { nums: [2, -1, 3] },
  lcs: { s1: 'a', s2: 'bc' },
  'edit-distance': { s1: 'a', s2: 'b' },
  'grid-min': { grid: [[1, 3], [2, 1]] },
  'grid-paths': { rows: 2, cols: 3 },
  knapsack: { weights: [1, 2], values: [2, 3], capacity: 2 },
  'subset-sum': { nums: [1, 2], target: 2 },
  lis: { nums: [1, 3, 2] },
  'stock-cooldown': { prices: [1, 2] },
  'matrix-chain': { dims: [2, 3, 4] },
  'burst-balloons': { nums: [2, 3] },
  lps: { s: 'ab' },
  'tree-rob': { nodes: [3] },
  tsp: { dist: [[0, 2, 3], [2, 0, 4], [3, 4, 0]] },
  'digit-no4': { n: 2 },
  'digit-adjacent': { n: 2 },
  knight: { size: 3, moves: 1, row: 0, col: 0 },
  'jump-k': { nums: [1, -1, 2, 3], k: 2 },
};

// Keep the large teaching examples completely drawable in both trace modes.
const largeInputs = {
  'coin-min': { coins: [1, 2], amount: 6 },
  'word-break': { s: 'aaaaa', words: ['a', 'aa'] },
};

export function treeExamples(problem) {
  const family = problem.id.startsWith('stairs-') ? 'stairs' : problem.id.startsWith('fib-') ? 'fib' : problem.id;
  const small = smallInputs[family];
  if (!small) throw new Error(`Missing small tree example for ${problem.id}`);
  return { small, large: largeInputs[family] || problem.examples[0] };
}
