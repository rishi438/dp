import { chapterPractices } from './practice.js';

export const goldPractice = {
  id: 'gold-stairs', chapter: 0, title: 'The Gold Collector · choose where to stop',
  args: [{ name: 'nums', type: 'ints' }],
  prompt: 'Start at step 0, collect its reward, and hop 1 or 2 steps. You may stop anywhere. Return the largest collected total. Empty stairs return 0.',
  examples: [{ nums: [0, 10, -5, 25, -15, 8, 30] }, { nums: [0, 10, -50] }, { nums: [-5] }, { nums: [] }],
  state: 'best(i): largest collected total ending exactly at step i',
  recurrence: 'best(0) = nums[0]; best(i) = nums[i] + max(best(i-1), best(i-2)); answer = max(best(i))',
  evaluate: (a, visit) => {
    const go = i => visit([i], () => i === 0 ? a.nums[0] : a.nums[i] + Math.max(go(i - 1), i > 1 ? go(i - 2) : -Infinity));
    return a.nums.length ? Math.max(...a.nums.map((_, i) => go(i))) : 0;
  },
};

export const simulationPractices = chapter => chapter === 0 ? [...chapterPractices(chapter), goldPractice] : chapterPractices(chapter);

export function staircaseData(input, isGold = false) {
  const n = isGold ? input.nums.length - 1 : input.n;
  const hops = isGold ? [1, 2] : input.hops;
  const cells = [];
  for (let i = 0; i <= n; i++) {
    const doors = hops.filter(h => h <= i).map(hop => ({ from: i - hop, hop, prevVal: cells[i - hop].val, contribution: cells[i - hop].val, total: isGold ? input.nums[i] + cells[i - hop].val : undefined }));
    const val = i === 0 ? (isGold ? input.nums[0] : 1) : isGold ? Math.max(...doors.map(d => d.total)) : doors.reduce((sum, d) => sum + d.contribution, 0);
    cells.push({ val, doors: doors.map(d => ({ ...d, chosen: isGold && d.total === val })) });
  }
  const answer = isGold ? (cells.length ? Math.max(...cells.map(c => c.val)) : 0) : cells[n].val;
  return { n, cells, answer, terminationIndex: isGold ? cells.findIndex(c => c.val === answer) : n,
    problem: { id: 'stairs', hops, isGold, goldValues: isGold ? input.nums : undefined } };
}

export function staircaseCode(isGold) {
  return isGold ? [
    'def max_gold(nums):', '    if not nums: return 0', '    dp = [nums[0]]',
    '    for i in range(1, len(nums)):', '        dp.append(nums[i] + max(dp[max(0, i-2):i]))', '    return max(dp)',
  ] : [
    'def staircase_paths(n, hops):', '    dp = [0] * (n + 1)', '    dp[0] = 1',
    '    for i in range(1, n + 1):', '        dp[i] = sum(dp[i-h] for h in hops if h <= i)', '    return dp[n]',
  ];
}
