export const PROBLEMS = {
  frog12: {
    id: 'frog12',
    name: 'Chapter 0 · The Classic 1-2 Frog',
    subtitle: 'Climbing Stairs · 2 Doors',
    tag: 'Classic DP',
    hops: [1, 2],
    defaultN: 5,
    maxN: 7,
    description: 'The frog starts at Ground (0) and must reach step N, hopping either 1 or 2 steps at a time. How many distinct ways can it reach step N?',
    slots: {
      fulcrum: 'To land on step i, the very LAST hop was either a 1-step leap from (i-1) OR a 2-step leap from (i-2). Exactly 2 doors!',
      state: 'dp[i] = number of distinct valid ways the frog can reach step i',
      transition: 'dp[i] = dp[i-1] + dp[i-2]',
      base: 'dp[0] = 1 (1 way: stand on ground). dp[1] = 1 (hop [1]). dp[2] = dp[1] + dp[0] = 2 ([1,1] or [2]).',
      termination: 'Forced endpoint: dp[N] (the decree requires reaching the summit step N).'
    },
    isGold: false
  },
  frog123: {
    id: 'frog123',
    name: 'Chapter 0 Challenge 3 · The Tribonacci Frog',
    subtitle: '1, 2, or 3 Step Leaps · 3 Doors',
    tag: 'Multi-Door Fulcrum',
    hops: [1, 2, 3],
    defaultN: 5,
    maxN: 7,
    description: 'The frog learns a 3rd leap! It can now hop 1, 2, or 3 steps. The fulcrum expands from 2 doors to 3 doors.',
    slots: {
      fulcrum: 'What was the LAST hop? 1-step from (i-1), 2-step from (i-2), OR 3-step from (i-3). Exactly 3 doors!',
      state: 'dp[i] = number of distinct ways to reach step i using {1, 2, 3} hops',
      transition: 'dp[i] = dp[i-1] + dp[i-2] + dp[i-3]',
      base: 'dp[0]=1, dp[1]=1 ([1]), dp[2]=2 ([1,1],[2]), dp[3] = dp[2]+dp[1]+dp[0] = 2+1+1 = 4! (DERIVE, never copy!)',
      termination: 'Forced endpoint: dp[N] (frog is commanded to reach step N).'
    },
    isGold: false
  },
  gold: {
    id: 'gold',
    name: 'Chapter 0 Challenge 7 · The Gold Collector',
    subtitle: 'Termination Trap: max(dp) vs dp[N]',
    tag: 'Free Endpoint',
    hops: [1, 2],
    defaultN: 5,
    maxN: 6,
    goldValues: [0, 10, -5, 25, -15, 8, 30],
    description: 'Every step pays gold[i]. The King decrees: "The frog may STOP ANYWHERE. Maximize total gold!"',
    slots: {
      fulcrum: 'To stand on step i, choose the best incoming path from (i-1) or (i-2), then collect gold[i].',
      state: 'dp[i] = maximum gold collected on any valid path that terminates at step i',
      transition: 'dp[i] = gold[i] + max(dp[i-1], dp[i-2])',
      base: 'dp[0] = gold[0]. dp[1] = gold[1] + dp[0]. dp[2] = gold[2] + max(dp[1], dp[0]).',
      termination: 'FREE ENDPOINT: max(dp) across all steps! The frog can halt wherever the treasure is highest!'
    },
    isGold: true
  }
};

// Generates all distinct sequences of hops that sum to target
export function generateAllPaths(target, allowedHops) {
  const results = [];
  function backtrack(remaining, currentPath) {
    if (remaining === 0) {
      results.push([...currentPath]);
      return;
    }
    for (const hop of allowedHops) {
      if (remaining >= hop) {
        currentPath.push(hop);
        backtrack(remaining - hop, currentPath);
        currentPath.pop();
      }
    }
  }
  backtrack(target, []);
  return results;
}
