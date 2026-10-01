// Shared contracts: the browser and runner use the same immutable function signatures.
const arg = (name, type) => ({ name, type });
const task = (id, chapter, title, args, prompt, examples, state, recurrence, evaluate) => ({
  id, chapter, title, args, prompt, examples, state, recurrence, evaluate,
});
const stairs = (a, visit) => {
  const go = n => visit([n], () => n === 0 ? 1 : a.hops.reduce((sum, h) => sum + (n >= h ? go(n - h) : 0), 0));
  return go(a.n);
};
const fib = (a, visit) => {
  const go = n => visit([n], () => n < 2 ? n : go(n - 1) + go(n - 2));
  return go(a.n);
};

export const PRACTICE = [
  ...[0, 1, 2, 3, 4].map(chapter => task(`stairs-${chapter}`, chapter,
    ['Count staircase paths', 'Recursive staircase paths', 'Memoized staircase paths', 'Tabulate staircase paths', 'Roll the staircase window'][chapter],
    [arg('n', 'int'), arg('hops', 'ints')],
    'Return the number of ordered paths to step n using the allowed positive hops. The empty path counts once. For Chapter 4, use only the last max(hops) states.',
    [{ n: 5, hops: [1, 2] }, { n: 5, hops: [1, 2, 3] }, { n: 0, hops: [1, 2] }, { n: 3, hops: [2] }],
    'ways(i): number of paths ending at step i', 'ways(0) = 1; ways(i) = sum(ways(i - hop)) for legal hops', stairs)),
  ...[1, 2, 3, 4].map(chapter => task(`fib-${chapter}`, chapter, 'Fibonacci: derive the base cases', [arg('n', 'int')],
    'Return Fibonacci F(n), with F(0) = 0 and F(1) = 1. Compare these bases with the staircase problem.',
    [{ n: 6 }, { n: 0 }, { n: 1 }, { n: 8 }], 'F(i): the ith Fibonacci number', 'F(i) = F(i-1) + F(i-2)', fib)),
  task('coin-min', 5, 'Fewest coins', [arg('coins', 'ints'), arg('amount', 'int')],
    'Return the fewest coins needed to make amount. Coins may be reused. Return -1 if unreachable.',
    [{ coins: [1, 2, 5], amount: 11 }, { coins: [2], amount: 3 }, { coins: [2, 3, 7], amount: 9 }, { coins: [1], amount: 0 }],
    'best(x): fewest coins forming x', 'best(0) = 0; best(x) = 1 + min(best(x-c))', (a, v) => {
      const go = x => v([x], () => x === 0 ? 0 : Math.min(Infinity, ...a.coins.filter(c => c <= x).map(c => 1 + go(x - c))));
      const answer = go(a.amount); return Number.isFinite(answer) ? answer : -1;
    }),
  task('coin-combinations', 5, 'Coin combinations', [arg('coins', 'ints'), arg('amount', 'int')],
    'Count unordered combinations forming amount with unlimited coins. [1,2] and [2,1] are the same combination.',
    [{ coins: [1, 2], amount: 3 }, { coins: [1, 2, 5], amount: 5 }, { coins: [2], amount: 3 }, { coins: [2], amount: 0 }],
    'ways(i,x): combinations using coin types i onward', 'ways(i,x) = ways(i+1,x) + ways(i,x-coins[i])', (a, v) => {
      const go = (i, x) => v([i, x], () => x === 0 ? 1 : i === a.coins.length ? 0 : go(i + 1, x) + (x >= a.coins[i] ? go(i, x - a.coins[i]) : 0));
      return go(0, a.amount);
    }),
  task('word-break', 5, 'Word Break', [arg('s', 'string'), arg('words', 'strings')],
    'Return whether s can be segmented into dictionary words. Words may be reused; the empty string is segmentable.',
    [{ s: 'leetcode', words: ['leet', 'code'] }, { s: 'catsandog', words: ['cats', 'dog', 'sand', 'and', 'cat'] }, { s: '', words: ['a'] }],
    'can(i): whether the suffix starting at i can be segmented', 'can(i) = OR can(i + word.length) over matching words', (a, v) => {
      const go = i => v([i], () => i === a.s.length || a.words.filter(w => a.s.startsWith(w, i)).map(w => go(i + w.length)).some(Boolean));
      return go(0);
    }),
  task('kadane', 6, 'Maximum contiguous sum', [arg('nums', 'ints')],
    'Return the largest sum of a nonempty contiguous subarray. For the empty input, return 0. All-negative input must return its largest element.',
    [{ nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, { nums: [-5, -2, -8] }, { nums: [] }, { nums: [7] }],
    'end(i): best nonempty sum ending exactly at i', 'end(i) = max(nums[i], nums[i]+end(i-1)); answer = max(end(i))', (a, v) => {
      const go = i => v([i], () => i === 0 ? a.nums[0] : Math.max(a.nums[i], a.nums[i] + go(i - 1)));
      return a.nums.length ? Math.max(...a.nums.map((_, i) => go(i))) : 0;
    }),
  task('lcs', 7, 'Longest common subsequence', [arg('s1', 'string'), arg('s2', 'string')],
    'Return the length of the longest common subsequence. Characters can be skipped but their order is preserved.',
    [{ s1: 'ABCDE', s2: 'ACE' }, { s1: 'abc', s2: 'def' }, { s1: '', s2: 'abc' }, { s1: 'aaa', s2: 'aa' }],
    'lcs(i,j): answer for prefixes of lengths i and j', 'match: 1+lcs(i-1,j-1); otherwise max(lcs(i-1,j),lcs(i,j-1))', (a, v) => {
      const go = (i, j) => v([i, j], () => !i || !j ? 0 : a.s1[i - 1] === a.s2[j - 1] ? 1 + go(i - 1, j - 1) : Math.max(go(i - 1, j), go(i, j - 1)));
      return go(a.s1.length, a.s2.length);
    }),
  task('edit-distance', 7, 'Edit distance', [arg('s1', 'string'), arg('s2', 'string')],
    'Return the minimum insertions, deletions, and replacements needed to transform s1 into s2; each costs 1.',
    [{ s1: 'horse', s2: 'ros' }, { s1: '', s2: 'abc' }, { s1: 'same', s2: 'same' }],
    'edit(i,j): edit distance between prefixes', 'match: edit(i-1,j-1); otherwise 1+min(delete,insert,replace)', (a, v) => {
      const go = (i, j) => v([i, j], () => !i ? j : !j ? i : a.s1[i - 1] === a.s2[j - 1] ? go(i - 1, j - 1) : 1 + Math.min(go(i - 1, j), go(i, j - 1), go(i - 1, j - 1)));
      return go(a.s1.length, a.s2.length);
    }),
  task('grid-min', 8, 'Minimum grid path sum', [arg('grid', 'matrix')],
    'Move only right or down from top-left to bottom-right. Return the smallest sum, including both endpoints.',
    [{ grid: [[1, 3, 1], [1, 5, 1], [4, 2, 1]] }, { grid: [[5]] }, { grid: [[1, 2, 3]] }],
    'cost(r,c): minimum sum to reach cell (r,c)', 'cost(r,c) = grid[r][c] + min(cost(r-1,c),cost(r,c-1))', (a, v) => {
      const go = (r, c) => v([r, c], () => !r && !c ? a.grid[0][0] : a.grid[r][c] + Math.min(r ? go(r - 1, c) : Infinity, c ? go(r, c - 1) : Infinity));
      return go(a.grid.length - 1, a.grid[0].length - 1);
    }),
  task('grid-paths', 8, 'Count grid paths', [arg('rows', 'int'), arg('cols', 'int')],
    'Count paths from top-left to bottom-right using only right and down moves.',
    [{ rows: 3, cols: 3 }, { rows: 1, cols: 5 }, { rows: 2, cols: 3 }],
    'ways(r,c): paths to cell (r,c)', 'ways(r,c) = ways(r-1,c) + ways(r,c-1); first row/column = 1', (a, v) => {
      const go = (r, c) => v([r, c], () => !r || !c ? 1 : go(r - 1, c) + go(r, c - 1));
      return go(a.rows - 1, a.cols - 1);
    }),
  task('knapsack', 9, '0/1 Knapsack', [arg('weights', 'ints'), arg('values', 'ints'), arg('capacity', 'int')],
    'Return the maximum value within capacity. Each item can be selected at most once. Taking no items is allowed.',
    [{ weights: [1, 2, 3, 4], values: [2, 4, 7, 10], capacity: 5 }, { weights: [2], values: [7], capacity: 4 }, { weights: [], values: [], capacity: 0 }],
    'best(i,w): best value using first i items within w', 'best(i,w) = max(skip item i, value[i] + take with reduced capacity)', (a, v) => {
      const go = (i, w) => v([i, w], () => !i ? 0 : Math.max(go(i - 1, w), w >= a.weights[i - 1] ? a.values[i - 1] + go(i - 1, w - a.weights[i - 1]) : -Infinity));
      return go(a.weights.length, a.capacity);
    }),
  task('subset-sum', 9, 'Subset sum', [arg('nums', 'ints'), arg('target', 'int')],
    'Return whether some subset sums to target. Each nonnegative input value may be used at most once.',
    [{ nums: [3, 4, 5], target: 9 }, { nums: [2], target: 4 }, { nums: [], target: 0 }],
    'can(i,x): whether first i items can form x', 'can(i,x) = can(i-1,x) OR can(i-1,x-nums[i-1])', (a, v) => {
      const go = (i, x) => v([i, x], () => x === 0 ? true : !i ? false : Boolean(Number(go(i - 1, x)) | Number(x >= a.nums[i - 1] && go(i - 1, x - a.nums[i - 1]))));
      return go(a.nums.length, a.target);
    }),
  task('lis', 10, 'Longest increasing subsequence', [arg('nums', 'ints')],
    'Return the length of the longest strictly increasing subsequence. Equal values cannot extend it.',
    [{ nums: [10, 9, 2, 5, 3, 7, 101, 18] }, { nums: [2, 2, 2] }, { nums: [] }, { nums: [3, 2, 1] }],
    'end(i): LIS length ending exactly at i', 'end(i) = 1 + max(end(j)) for j<i and nums[j]<nums[i]', (a, v) => {
      const go = i => v([i], () => 1 + Math.max(0, ...a.nums.slice(0, i).map((x, j) => x < a.nums[i] ? go(j) : 0)));
      return Math.max(0, ...a.nums.map((_, i) => go(i)));
    }),
  task('stock-cooldown', 11, 'Stock trading with cooldown', [arg('prices', 'ints')],
    'Maximize profit holding at most one stock. After selling, wait one day before buying again. Start with no stock; finish without stock.',
    [{ prices: [1, 2, 3, 0, 2] }, { prices: [5, 4, 3] }, { prices: [] }, { prices: [1, 2] }],
    'profit(day,holding): best future profit from this state', 'skip a day, buy, or sell and jump over the cooldown day', (a, v) => {
      const go = (i, hold) => v([i, hold], () => i >= a.prices.length ? (hold ? -Infinity : 0) : hold ? Math.max(go(i + 1, 1), a.prices[i] + go(i + 2, 0)) : Math.max(go(i + 1, 0), -a.prices[i] + go(i + 1, 1)));
      return go(0, 0);
    }),
  task('matrix-chain', 12, 'Matrix-chain multiplication', [arg('dims', 'ints')],
    'Matrix i has dimensions dims[i] × dims[i+1]. Return the fewest scalar multiplications needed to multiply the chain.',
    [{ dims: [10, 30, 5, 60] }, { dims: [10, 20] }, { dims: [10, 20, 30] }],
    'cost(l,r): minimum multiplication cost for matrices l through r', 'min over split k: cost(l,k)+cost(k+1,r)+dims[l]*dims[k+1]*dims[r+1]', (a, v) => {
      const go = (l, r) => v([l, r], () => l === r ? 0 : Math.min(...Array.from({ length: r - l }, (_, d) => { const k = l + d; return go(l, k) + go(k + 1, r) + a.dims[l] * a.dims[k + 1] * a.dims[r + 1]; })));
      return go(0, a.dims.length - 2);
    }),
  task('burst-balloons', 12, 'Burst Balloons', [arg('nums', 'ints')],
    'Burst every balloon. Bursting x earns left × x × right using its current neighbors (outside boundaries are 1). Return maximum coins.',
    [{ nums: [3, 1, 5, 8] }, { nums: [1, 5] }, { nums: [] }],
    'best(l,r): coins from balloons strictly between boundaries l,r', 'Choose the LAST balloon k: best(l,k)+best(k,r)+a[l]*a[k]*a[r]', (a, v) => {
      const b = [1, ...a.nums, 1];
      const go = (l, r) => v([l, r], () => r === l + 1 ? 0 : Math.max(...Array.from({ length: r - l - 1 }, (_, d) => { const k = l + d + 1; return go(l, k) + go(k, r) + b[l] * b[k] * b[r]; })));
      return go(0, b.length - 1);
    }),
  task('lps', 13, 'Longest palindromic subsequence', [arg('s', 'string')],
    'Return the longest palindromic subsequence length. Characters may be skipped; this is not the longest substring.',
    [{ s: 'bbbab' }, { s: 'cbbd' }, { s: '' }, { s: 'a' }],
    'best(l,r): LPS length inside inclusive interval [l,r]', 'matching ends: 2+best(l+1,r-1); otherwise max(best(l+1,r),best(l,r-1))', (a, v) => {
      const go = (l, r) => v([l, r], () => l > r ? 0 : l === r ? 1 : a.s[l] === a.s[r] ? 2 + go(l + 1, r - 1) : Math.max(go(l + 1, r), go(l, r - 1)));
      return go(0, a.s.length - 1);
    }),
  task('tree-rob', 14, 'House Robber on a tree', [arg('nodes', 'ints')],
    'Return maximum money without robbing parent and child together. Use heap-indexed nodes: children of i are 2i+1 and 2i+2; -1 marks a missing node. Values are nonnegative.',
    [{ nodes: [3, 4, 5, 1, 3, -1, 1] }, { nodes: [3, 2, 3, -1, 3, -1, 1] }, { nodes: [] }],
    'best(i,blocked): best subtree value; blocked means parent was robbed', 'skip = best(left,false)+best(right,false); take = value+best(left,true)+best(right,true)', (a, v) => {
      const go = (i, blocked) => v([i, blocked], () => i >= a.nodes.length || a.nodes[i] < 0 ? 0 : Math.max(go(2 * i + 1, 0) + go(2 * i + 2, 0), blocked ? -Infinity : a.nodes[i] + go(2 * i + 1, 1) + go(2 * i + 2, 1)));
      return go(0, 0);
    }),
  task('tsp', 15, 'Travelling salesman tour', [arg('dist', 'matrix')],
    'Start at city 0, visit every city once, then return to 0. Return minimum tour cost. dist is a square nonnegative matrix; one city costs 0.',
    [{ dist: [[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]] }, { dist: [[0]] }, { dist: [[0, 3], [4, 0]] }],
    'cost(mask,last): cheapest remaining tour from last after visiting mask', 'cost(mask,last) = min(dist[last][next]+cost(mask | 1<<next,next))', (a, v) => {
      const n = a.dist.length;
      const go = (mask, last) => v([mask, last], () => mask === (1 << n) - 1 ? a.dist[last][0] : Math.min(...a.dist.map((_, next) => mask & (1 << next) ? Infinity : a.dist[last][next] + go(mask | (1 << next), next))));
      return n === 1 ? 0 : go(1, 0);
    }),
  task('digit-no4', 16, 'Digit DP: no digit 4', [arg('n', 'int')],
    'Count integers in [0,n] containing no digit 4. Include zero. For n < 0 return 0. Leading zeros do not violate this rule.',
    [{ n: 100 }, { n: 4 }, { n: 1000 }, { n: 0 }, { n: -5 }],
    'count(pos,tight): number of valid suffixes under the prefix bound', 'Try every digit ≤ limit except 4; sum count(pos+1,nextTight). Completed suffix returns 1.', (a, v) => {
      if (a.n < 0) return 0;
      const d = String(a.n).split('').map(Number);
      const go = (pos, tight) => v([pos, tight], () => pos === d.length ? 1 : Array.from({ length: (tight ? d[pos] : 9) + 1 }, (_, x) => x === 4 ? 0 : go(pos + 1, Number(tight && x === d[pos]))).reduce((s, x) => s + x, 0));
      return go(0, 1);
    }),
  task('digit-adjacent', 16, 'Digit DP: no adjacent equal digits', [arg('n', 'int')],
    'Count integers in [0,n] with no equal adjacent digits. Include zero; return 0 for negative n. Ignore leading zeros.',
    [{ n: 21 }, { n: 99 }, { n: 100 }, { n: 1234 }, { n: 0 }, { n: -5 }],
    'count(pos,previous,tight,started): valid completions of this prefix', 'Skip equal adjacent digits only after the number has started; base returns 1.', (a, v) => {
      if (a.n < 0) return 0;
      const d = String(a.n).split('').map(Number);
      const go = (pos, prev, tight, started) => v([pos, prev, tight, started], () => pos === d.length ? 1 : Array.from({ length: (tight ? d[pos] : 9) + 1 }, (_, x) => started && prev === x ? 0 : go(pos + 1, x, Number(tight && x === d[pos]), Number(started || x !== 0))).reduce((s, x) => s + x, 0));
      return go(0, -1, 1, 0);
    }),
  task('knight', 17, 'Knight survival probability', [arg('size', 'int'), arg('moves', 'int'), arg('row', 'int'), arg('col', 'int')],
    'Return the probability that a knight remains on a size × size board after exactly moves moves. Each of its 8 moves is equally likely, even when it leaves the board.',
    [{ size: 3, moves: 2, row: 0, col: 0 }, { size: 1, moves: 1, row: 0, col: 0 }, { size: 3, moves: 0, row: 1, col: 1 }],
    'p(k,r,c): probability of surviving k more moves from (r,c)', 'Off board: 0; k=0: 1; otherwise sum(p(k-1,nextRow,nextCol))/8', (a, v) => {
      const jumps = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
      const go = (k, r, c) => v([k, r, c], () => r < 0 || c < 0 || r >= a.size || c >= a.size ? 0 : !k ? 1 : jumps.reduce((s, [dr, dc]) => s + go(k - 1, r + dr, c + dc) / 8, 0));
      return go(a.moves, a.row, a.col);
    }),
  task('jump-k', 18, 'Jump Game VI', [arg('nums', 'ints'), arg('k', 'int')],
    'Start at index 0 and finish at the final index, jumping 1..k positions forward. Return the largest sum of visited values. Empty input returns 0. Optimize with a monotonic deque after deriving the recurrence.',
    [{ nums: [1, -1, -2, 4, -7, 3], k: 2 }, { nums: [-1, -2, -3], k: 1 }, { nums: [5], k: 1 }, { nums: [], k: 2 }],
    'best(i): best score landing at i', 'best(i) = nums[i]+max(best(j)) for max(0,i-k)≤j<i; deque maintains this maximum', (a, v) => {
      const go = i => v([i], () => !i ? a.nums[0] : a.nums[i] + Math.max(...Array.from({ length: Math.min(i, a.k) }, (_, d) => go(i - d - 1))));
      return a.nums.length ? go(a.nums.length - 1) : 0;
    }),
];

export const getPractice = id => PRACTICE.find(p => p.id === id);
export const chapterPractices = chapter => PRACTICE.filter(p => p.chapter === chapter);
export const returnType = p => ['word-break', 'subset-sum'].includes(p.id) ? 'bool' : p.id === 'knight' ? 'float' : 'int';

export function validateInput(problem, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Enter a JSON object with the named inputs.');
  for (const { name, type } of problem.args) {
    const value = input[name];
    const isInt = x => Number.isInteger(x) && Math.abs(x) <= 1000000;
    const valid = type === 'int' ? isInt(value) : type === 'string' ? typeof value === 'string' && value.length <= 12 : type === 'ints' ? Array.isArray(value) && value.length <= 16 && value.every(isInt) : type === 'strings' ? Array.isArray(value) && value.length <= 12 && value.every(x => typeof x === 'string' && x.length > 0 && x.length <= 12) : Array.isArray(value) && value.length > 0 && value.length <= 6 && value.every(row => Array.isArray(row) && row.length > 0 && row.length <= 6 && row.length === value[0].length && row.every(isInt));
    if (!valid) throw new Error(`Invalid ${name}: expected ${type}; arrays ≤16 values, strings ≤12 characters, matrices ≤6×6.`);
  }
  const positive = key => { if (input[key]?.some(x => x <= 0) || new Set(input[key]).size !== input[key].length) throw new Error(`${key} must contain distinct positive integers.`); };
  if ('hops' in input) positive('hops');
  if ('coins' in input) positive('coins');
  if ('words' in input && new Set(input.words).size !== input.words.length) throw new Error('Dictionary words must be unique.');
  for (const key of ['amount', 'capacity', 'target']) if (key in input && (input[key] < 0 || input[key] > 40)) throw new Error(`${key} must be between 0 and 40.`);
  if ('n' in input && !problem.id.startsWith('digit') && (input.n < 0 || input.n > 20)) throw new Error('n must be between 0 and 20.');
  if ('dims' in input && (input.dims.length < 2 || input.dims.length > 8 || input.dims.some(x => x <= 0 || x > 100))) throw new Error('Use 2–8 positive dimensions, each ≤100.');
  if ('weights' in input && (input.weights.length !== input.values.length || input.weights.some(x => x <= 0))) throw new Error('Weights must be positive and match the number of values.');
  if (problem.id === 'subset-sum' && input.nums.some(x => x < 0)) throw new Error('Subset-sum inputs must be nonnegative.');
  if ('prices' in input && input.prices.some(x => x < 0)) throw new Error('Prices must be nonnegative.');
  if ('nodes' in input) {
    if (input.nodes.some((x, i) => x < -1 || (i > 0 && x >= 0 && input.nodes[Math.floor((i - 1) / 2)] === -1))) throw new Error('Use -1 for missing nodes; a missing parent cannot have children.');
  }
  if ('dist' in input && (input.dist.some((row, i) => row.length !== input.dist.length || row[i] !== 0 || row.some(x => x < 0)) || input.dist.length > 5)) throw new Error('Use a square distance matrix of 1–5 cities, nonnegative costs and a zero diagonal.');
  if ('k' in input && (input.k < 1 || input.k > 16)) throw new Error('k must be between 1 and 16.');
  for (const key of ['rows', 'cols', 'size']) if (key in input && (input[key] < 1 || input[key] > 6)) throw new Error(`${key} must be between 1 and 6.`);
  if ('moves' in input && (input.moves < 0 || input.moves > 5 || input.row < 0 || input.col < 0 || input.row >= input.size || input.col >= input.size)) throw new Error('Use 0–5 moves and a starting square inside the board.');
  return input;
}

export function runTrace(problem, input, { memoized = true, maxCalls = 2500 } = {}) {
  validateInput(problem, input);
  const memo = new Map(), events = [], nodes = [], stack = [];
  let hits = 0, calls = 0;
  const visit = (state, compute) => {
    if (++calls > maxCalls) throw new RangeError('Trace limit reached');
    const key = JSON.stringify(state), id = nodes.length;
    const cached = memoized && memo.has(key);
    const node = { id, key, state, parent: stack.at(-1) ?? null, depth: stack.length, cached };
    nodes.push(node);
    events.push({ kind: cached ? 'cache' : 'enter', id, key, state, value: cached ? memo.get(key) : undefined });
    if (cached) { hits++; node.value = memo.get(key); return node.value; }
    stack.push(id);
    const value = compute();
    stack.pop();
    memo.set(key, value); node.value = value;
    events.push({ kind: 'return', id, key, state, value });
    return value;
  };
  try {
    const result = problem.evaluate(input, visit);
    events.push({ kind: 'answer', key: 'answer', value: result, state: [] });
    return { result, events, nodes, hits, calls, states: memo.size, truncated: false };
  } catch (error) {
    if (!(error instanceof RangeError) || error.message !== 'Trace limit reached') throw error;
    return { events, nodes, hits, calls: maxCalls, states: memo.size, truncated: true };
  }
}

export const displayValue = value => value === Infinity ? '∞' : value === -Infinity ? '−∞' : typeof value === 'boolean' ? String(value) : Number.isInteger(value) ? String(value) : String(Number(value?.toFixed(8)));
