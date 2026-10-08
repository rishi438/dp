// Metadata for all 19 chapters of the Dynamic Programming Book
export const CHAPTERS = [
  {
    num: 0,
    folder: 'chapter 0 - basic info',
    title: 'DP Basics',
    subtitle: 'The Villain, The 2 Laws, The Five Slots',
    character: 'The Panda & Sifu',
    half: 'approach',
    problemId: 'frog12',
    icon: '🥋'
  },
  {
    num: 1,
    folder: 'chapter 1 - without memoization',
    title: 'Recursion: Repeating Work',
    subtitle: 'Break a problem into smaller calls',
    character: 'Reco the Computer',
    half: 'approach',
    problemId: 'frog12',
    icon: '⚡'
  },
  {
    num: 2,
    folder: 'chapter 2 - with memoization',
    title: 'Memoization: Save Answers',
    subtitle: 'Check saved answers before solving again',
    character: 'The Wizard',
    half: 'approach',
    problemId: 'frog12',
    icon: '📖'
  },
  {
    num: 3,
    folder: 'chapter 3 - bottom-up tabulation',
    title: 'Tabulation: Fill a Table',
    subtitle: 'Solve smaller cases first, then build up',
    character: 'Tabby the Mason',
    half: 'approach',
    problemId: 'frog12',
    icon: '🧱'
  },
  {
    num: 4,
    folder: 'chapter 4 - space optimized',
    title: 'Use Less Memory',
    subtitle: 'Keep only the answers you still need',
    character: 'The Cloth Weaver',
    half: 'approach',
    problemId: 'frog12',
    icon: '🪟'
  },
  {
    num: 5,
    folder: 'chapter 5 - choosing from a set',
    title: 'Choose from Reusable Options',
    subtitle: 'Try each coin and solve the amount left over',
    character: 'Corin the Coinsmith',
    half: 'pattern',
    problemId: 'coin',
    icon: '🪙'
  },
  {
    num: 6,
    folder: 'chapter 6 - best contiguous run',
    title: 'Best Consecutive Sum',
    subtitle: 'Keep the current run or start a new one',
    character: 'Kade the Streak-Runner',
    half: 'pattern',
    problemId: 'gold',
    icon: '🏃'
  },
  {
    num: 7,
    folder: 'chapter 7 - two sequences',
    title: 'Compare Two Sequences',
    subtitle: 'Track one position in each string',
    character: 'The Twin Scribes',
    half: 'pattern',
    problemId: 'lcs',
    icon: '📜'
  },
  {
    num: 8,
    folder: 'chapter 8 - grid movement',
    title: 'Paths Through a Grid',
    subtitle: 'Build each cell from the cells that can reach it',
    character: 'Gridlock the Maze Warden',
    half: 'pattern',
    problemId: 'grid',
    icon: '🗺️'
  },
  {
    num: 9,
    folder: 'chapter 9 - subset knapsack',
    title: 'Knapsack: Take or Skip',
    subtitle: 'Choose items without exceeding the weight limit',
    character: 'Sacky the Packmaster',
    half: 'pattern',
    problemId: 'knapsack',
    icon: '🎒'
  },
  {
    num: 10,
    folder: 'chapter 10 - ordered chain',
    title: 'Increasing Subsequences (LIS)',
    subtitle: 'Keep numbers in order; each chosen number must be larger',
    character: 'Lissa the Chainbuilder',
    half: 'pattern',
    problemId: 'lis',
    icon: '🔗'
  },
  {
    num: 11,
    folder: 'chapter 11 - state machine',
    title: 'Track What You Can Do Next',
    subtitle: 'Stock trading: holding, just sold, or ready to buy',
    character: 'Modus the Mask-Wearer',
    half: 'pattern',
    problemId: 'gold',
    icon: '🎭'
  },
  {
    num: 12,
    folder: 'chapter 12 - interval split',
    title: 'Split a Range',
    subtitle: 'Try each split and combine the two smaller answers',
    character: 'Vale the Splitter',
    half: 'pattern',
    problemId: 'ladder',
    icon: '✂️'
  },
  {
    num: 13,
    folder: 'chapter 13 - palindromes',
    title: 'Palindromes: Compare the Ends',
    subtitle: 'Find a sequence that reads the same forwards and backwards',
    character: 'Mirra the Mirror-Twin',
    half: 'pattern',
    problemId: 'ladder',
    icon: '🪞'
  },
  {
    num: 14,
    folder: 'chapter 14 - tree dp',
    title: 'DP on Trees',
    subtitle: 'Solve each child before combining answers at its parent',
    character: 'Root the Elder Tree',
    half: 'pattern',
    problemId: 'tree',
    icon: '🌲'
  },
  {
    num: 15,
    folder: 'chapter 15 - bitmask dp',
    title: 'Bitmask DP: Track a Set',
    subtitle: 'Record which places you have already visited',
    character: 'Maska the Bit-Witch',
    half: 'pattern',
    problemId: 'gold',
    icon: '🧙‍♀️'
  },
  {
    num: 16,
    folder: 'chapter 16 - digit dp',
    title: 'Digit DP: Build a Number',
    subtitle: 'Choose digits while staying within the limit',
    character: 'Digitus the Ledger Keeper',
    half: 'pattern',
    problemId: 'ladder',
    icon: '🔢'
  },
  {
    num: 17,
    folder: 'chapter 17 - probability dp',
    title: 'Probability DP',
    subtitle: 'Add the chances of the possible next moves',
    character: 'Fortuna the Dice-Walker',
    half: 'pattern',
    problemId: 'ladder',
    icon: '🎲'
  },
  {
    num: 18,
    folder: 'chapter 18 - optimized dp',
    title: 'Make DP Faster',
    subtitle: 'Keep the best recent answer instead of checking every one',
    character: 'Swift the Deque Ronin',
    half: 'pattern',
    problemId: 'ladder',
    icon: '⚔️'
  }
];
