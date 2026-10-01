export const QUIZ_QUESTIONS = [
  {
    id: 1,
    category: 'Ch 0 · Two Laws',
    topic: 'Optimal Substructure vs Overlapping Subproblems',
    question: 'Which condition distinguishes Dynamic Programming from plain Divide & Conquer (like Merge Sort)?',
    options: [
      { text: 'Dynamic Programming requires trees, while Divide & Conquer requires arrays.', correct: false, explanation: 'Incorrect. Both work on sequences, trees, grids, and numbers.' },
      { text: 'Overlapping Subproblems: DP solves problems where the exact same subproblems repeat many times.', correct: true, explanation: 'CORRECT! Divide & Conquer (like Merge Sort) divides into independent subproblems. DP is ONLY needed when subproblems overlap heavily.' },
      { text: 'Dynamic Programming always runs in O(N^3) time.', correct: false, explanation: 'Incorrect. DP can run in O(N), O(N^2), etc.' },
      { text: 'Divide & Conquer uses memory caches, while DP does not.', correct: false, explanation: 'The exact opposite: DP uses memory (memo/table), while basic divide & conquer does not.' }
    ]
  },
  {
    id: 2,
    category: 'Ch 0 · Five Slots',
    topic: 'Slot 0: The Fulcrum',
    question: 'What is the fundamental question you must ask in Slot 0 (The Fulcrum)?',
    options: [
      { text: '"What is the very first step the algorithm should take?"', correct: false, explanation: 'Trap! The FIRST step does not leave a clean subproblem. Always look backwards from the end!' },
      { text: '"What was the very LAST decision/move that landed me here?"', correct: true, explanation: 'BULLSEYE! The fulcrum pivots on the LAST move, because only the last move splits the problem into an already-solved subproblem plus a final step!' },
      { text: '"What formula does LeetCode discuss recommend?"', correct: false, explanation: 'Never copy solutions without deriving the doors.' },
      { text: '"How can I write a loop without thinking?"', correct: false, explanation: 'The fulcrum is a question, not code. Its answer produces the doors.' }
    ]
  },
  {
    id: 3,
    category: 'Ch 0 · Fulcrum Doors',
    topic: 'Door Count Identification',
    question: 'If a frog can hop 1, 2, OR 3 steps, how many "doors" (incoming transitions) exist for step i?',
    options: [
      { text: '1 door (hop i)', correct: false, explanation: 'Incorrect.' },
      { text: '2 doors (from i-1 and i-2)', correct: false, explanation: 'That was the classic 1-2 frog. A 3-step leap opens an extra door!' },
      { text: '3 doors (from i-1, i-2, and i-3)', correct: true, explanation: 'EXACTLY! The last move was either +1 from (i-1), +2 from (i-2), or +3 from (i-3). Exactly 3 doors.' },
      { text: 'Infinite doors', correct: false, explanation: 'The hop sizes are strictly {1, 2, 3}.' }
    ]
  },
  {
    id: 4,
    category: 'Ch 0 · Challenge 3',
    topic: 'Tribonacci Base Case Derivation',
    question: 'In the 1-2-3 Tribonacci frog, what is the derived value of dp[3]?',
    options: [
      { text: '3 (copied pattern from 1-2 hop)', correct: false, explanation: 'TRAP TRIGGERED! You copied instead of deriving. Look at Door 3!' },
      { text: '4 (derived: dp[2] + dp[1] + dp[0] = 2 + 1 + 1 = 4)', correct: true, explanation: 'PERFECT! Derived from all 3 doors: [1+1+1], [1+2], [2+1], and [3] jumping straight from ground = 4 distinct ways!' },
      { text: '5', correct: false, explanation: 'Too high for step 3.' },
      { text: '6', correct: false, explanation: 'Incorrect.' }
    ]
  },
  {
    id: 5,
    category: 'Ch 0 · Transition Operator',
    topic: 'Choose vs Combine',
    question: 'When a problem asks: "Count the total number of distinct ways to reach step N", which operator links the doors?',
    options: [
      { text: 'min(door1, door2)', correct: false, explanation: 'min is for finding the smallest/cheapest route, not counting ways.' },
      { text: 'max(door1, door2)', correct: false, explanation: 'max is for finding the most lucrative route, not counting ways.' },
      { text: 'Addition (+): sum all the doors', correct: true, explanation: 'SPOT ON! "Counting sums the doors. Optimizing picks one door." Since doors represent disjoint paths, adding them counts all routes.' },
      { text: 'Multiplication (*)', correct: false, explanation: 'Doors are alternate OR branches, not sequential steps.' }
    ]
  },
  {
    id: 6,
    category: 'Ch 0 · Transition Operator',
    topic: 'Optimization Operator',
    question: 'When a problem asks: "Find the minimum energy/cost to reach step N", which operator links the doors?',
    options: [
      { text: 'Addition (+)', correct: false, explanation: 'Addition counts ways. We want to pick the single best path.' },
      { text: 'min(door1, door2)', correct: true, explanation: 'CORRECT! In optimization problems, you PICK ONE DOOR with min (for lowest cost) or max (for highest reward).' },
      { text: 'bitwise XOR (^)', correct: false, explanation: 'Incorrect.' },
      { text: 'Average of doors', correct: false, explanation: 'Incorrect.' }
    ]
  },
  {
    id: 7,
    category: 'Ch 0 · Challenge 7',
    topic: 'Termination: Free Endpoint Trap',
    question: 'The King decrees: "Every step pays gold[i]. The frog may STOP ANYWHERE. Maximize total gold!" Where does the answer live?',
    options: [
      { text: 'Always dp[n] out of habit', correct: false, explanation: 'TRAP TRIGGERED! The frog is NOT required to reach step n! It can stop anywhere!' },
      { text: 'max(dp) surveyed across all cells', correct: true, explanation: 'MASTER CLASS! When endpoint is FREE, you survey the table with max(dp). When endpoint is FORCED, you return that specific cell.' },
      { text: 'dp[0]', correct: false, explanation: 'Step 0 is just the ground.' },
      { text: 'dp[n/2]', correct: false, explanation: 'Nonsense cell.' }
    ]
  },
  {
    id: 8,
    category: 'Ch 0 · Five Slots',
    topic: 'Termination: Forced Endpoint',
    question: 'When the problem states: "How many ways to reach the top step N?", where does the answer live?',
    options: [
      { text: 'dp[n]', correct: true, explanation: 'CORRECT! The decree forced the destination: the frog must end at step n. So read dp[n].' },
      { text: 'max(dp)', correct: false, explanation: 'max(dp) is for free endpoints. The destination is forced to step n here.' },
      { text: 'sum(dp)', correct: false, explanation: 'summing all cells would count paths ending at intermediate steps.' },
      { text: 'dp[0]', correct: false, explanation: 'dp[0] is the base ground.' }
    ]
  },
  {
    id: 9,
    category: 'Ch 0 · Challenge 6',
    topic: 'The n=1 Crash Trap',
    question: 'Why does "dp = [0]*(n+1); dp[1]=1; dp[2]=2; for i in range(3,n+1): ..." crash for n=1?',
    options: [
      { text: 'Python lists cannot hold zeros', correct: false, explanation: 'Python lists handle zeros normally.' },
      { text: 'IndexError: when n=1, array size is 2 (indices 0 and 1), so dp[2] is out of bounds!', correct: true, explanation: 'BULLSEYE! When n=1, [0]*(1+1) has only indices 0 and 1. Accessing dp[2] immediately throws IndexError.' },
      { text: 'range(3, 2) causes an infinite loop', correct: false, explanation: 'range(3, 2) is simply empty in Python; it terminates instantly.' },
      { text: 'The function returns None', correct: false, explanation: 'It never reaches return; it crashes on line 3.' }
    ]
  },
  {
    id: 10,
    category: 'Ch 0 · Challenge 6',
    topic: 'Edge Case Guard',
    question: 'What single line at the top of the function cleanest fixes the n=1 crash?',
    options: [
      { text: 'if n <= 2: return n', correct: true, explanation: 'CLEAN & IDIOMATIC! For n=1 it returns 1, for n=2 it returns 2, completely bypassing the array allocation.' },
      { text: 'pass', correct: false, explanation: 'pass does nothing.' },
      { text: 'import sys; sys.setrecursionlimit(10000)', correct: false, explanation: 'This is bottom-up, recursion limit is irrelevant.' },
      { text: 'dp.append(0)', correct: false, explanation: 'Ad-hoc patching.' }
    ]
  },
  {
    id: 11,
    category: 'Ch 1 · Approach',
    topic: 'Plain Recursion Time Complexity',
    question: 'What is the time complexity of plain naive recursion for fib(n) without memoization?',
    options: [
      { text: 'O(N)', correct: false, explanation: 'O(N) is with memoization or tabulation.' },
      { text: 'O(N^2)', correct: false, explanation: 'Incorrect.' },
      { text: 'O(2^N) exponential', correct: true, explanation: 'CORRECT! Every call branches into 2 calls, doubling the work at each level: 2^n operations!' },
      { text: 'O(log N)', correct: false, explanation: 'Logarithmic is binary search, not naive recursion.' }
    ]
  },
  {
    id: 12,
    category: 'Ch 1 · Approach',
    topic: 'Call Stack Height',
    question: 'What is the maximum call stack memory consumed by naive recursive fib(n)?',
    options: [
      { text: 'O(1)', correct: false, explanation: 'The call stack grows with depth.' },
      { text: 'O(N) linear stack depth', correct: true, explanation: 'CORRECT! Even though total calls are O(2^N), the stack only goes N frames deep along the left spine before returning.' },
      { text: 'O(2^N)', correct: false, explanation: 'Stack frames are freed as functions return, so stack memory is O(N), not O(2^N).' },
      { text: 'O(N!)', correct: false, explanation: 'Incorrect.' }
    ]
  },
  {
    id: 13,
    category: 'Ch 2 · Approach',
    topic: 'Top-Down Memoization',
    question: 'In top-down memoization, what does the algorithm do before calculating f(n)?',
    options: [
      { text: 'Clears the cache notebook', correct: false, explanation: 'Clearing the cache destroys all stored answers!' },
      { text: 'Checks if n is in the notebook; if yes, returns cache[n] in O(1)', correct: true, explanation: 'CORRECT! That single lookup avoids recalculating the entire subtree underneath f(n).' },
      { text: 'Sorts the inputs', correct: false, explanation: 'Sorting is unrelated.' },
      { text: 'Throws an exception', correct: false, explanation: 'Incorrect.' }
    ]
  },
  {
    id: 14,
    category: 'Ch 2 · Theory',
    topic: 'Sifu\'s DP Complexity Formula',
    question: 'What is the universal formula for the time complexity of any DP algorithm?',
    options: [
      { text: 'TIME = (Number of Distinct States) × (Cost of One Transition)', correct: true, explanation: 'SACRED RULE! Total Time = States × Transition. For 1D frog: N states × O(1) transition = O(N). For LIS: N states × O(N) transition = O(N^2).' },
      { text: 'TIME = 2^N', correct: false, explanation: 'That is unmemoized recursion.' },
      { text: 'TIME = N * log(N)', correct: false, explanation: 'That is sorting.' },
      { text: 'TIME = Length of array / 2', correct: false, explanation: 'Incorrect.' }
    ]
  },
  {
    id: 15,
    category: 'Ch 3 · Approach',
    topic: 'Bottom-Up Loop Order',
    question: 'Why MUST bottom-up tabulation for dp[i] = dp[i-1] + dp[i-2] iterate forward from 2 to N, never backwards?',
    options: [
      { text: 'Because Python ranges only work forward', correct: false, explanation: 'Python ranges can step backward with negative step.' },
      { text: 'Topological Sort: dp[i] depends on dp[i-1] and dp[i-2], which must be computed first', correct: true, explanation: 'EXACTLY! You cannot evaluate a state until all incoming directed edges on the DAG have been computed.' },
      { text: 'Because memory cache runs faster forward', correct: false, explanation: 'Loop order is a correctness requirement, not just hardware cache.' },
      { text: 'It actually can run backward with no change', correct: false, explanation: 'Running backward would read uninitialized zero values!' }
    ]
  },
  {
    id: 16,
    category: 'Ch 3 · The Lens',
    topic: 'The Invariant Lens',
    question: 'In the Invariant Lens (from Ch 3), which loop-invariant phase corresponds to the Base Case?',
    options: [
      { text: 'Maintenance', correct: false, explanation: 'Maintenance corresponds to the Transition step.' },
      { text: 'Initialization', correct: true, explanation: 'CORRECT! Initialization is the starting truth you know before the loop begins: your derived Base Cases.' },
      { text: 'Termination', correct: false, explanation: 'Termination corresponds to reading the final answer cell.' },
      { text: 'Garbage Collection', correct: false, explanation: 'Incorrect.' }
    ]
  },
  {
    id: 17,
    category: 'Ch 3 · Debugging',
    topic: 'Lens Debugger: Shape vs Answer',
    question: 'If your code runs with the right shape but outputs incorrect numbers on every single test case, where is the bug?',
    options: [
      { text: 'Initialization / Base Case: you copied or mistyped starting values', correct: true, explanation: 'DIAGNOSTIC RULE: Right shape + wrong numbers = INITIALIZATION (corrupted base case poison spreading up the table).' },
      { text: 'The CPU architecture', correct: false, explanation: 'It is a code bug.' },
      { text: 'Termination: you read the wrong index', correct: false, explanation: 'Wrong termination index usually crashes or returns 0/inf, not warped values.' },
      { text: 'The variable names are too short', correct: false, explanation: 'Variable names do not change arithmetic.' }
    ]
  },
  {
    id: 18,
    category: 'Ch 3 · Debugging',
    topic: 'Lens Debugger: Small vs Large N',
    question: 'If your solution passes small inputs (N=1, 2) but fails on larger N (N=10), where is the failure?',
    options: [
      { text: 'Initialization: base case is wrong', correct: false, explanation: 'If base cases were wrong, small N would have failed too.' },
      { text: 'Maintenance / Transition: missing a door, bad operator, or invalid loop order', correct: true, explanation: 'DIAGNOSTIC RULE: Small N works + Large N fails = MAINTENANCE. The step-to-step inductive leap dropped a door or broke the invariant.' },
      { text: 'The monitor resolution', correct: false, explanation: 'Irrelevant.' },
      { text: 'Recursion limit', correct: false, explanation: 'Bottom-up has no recursion limit.' }
    ]
  },
  {
    id: 19,
    category: 'Ch 4 · Approach',
    topic: 'Space Optimization Window',
    question: 'In dp[i] = dp[i-1] + dp[i-2], how many numbers do you actually need to keep in memory at once?',
    options: [
      { text: 'All N numbers', correct: false, explanation: 'You do not need earlier values like dp[i-5] once you are at step i.' },
      { text: 'Exactly 2 numbers (prev and curr)', correct: true, explanation: 'SPOT ON! The transition window only looks back 2 steps. Throw away the array and keep 2 numbers to drop space to O(1)!' },
      { text: '0 numbers', correct: false, explanation: 'You cannot compute the sum with 0 numbers.' },
      { text: 'N/2 numbers', correct: false, explanation: 'Window size is fixed at 2.' }
    ]
  },
  {
    id: 20,
    category: 'Ch 4 · Knapsack Trap',
    topic: 'Loop Direction in Rolled Arrays',
    question: 'In 0/1 Knapsack space optimization, why MUST the inner weight loop run BACKWARD (W down to weight[i])?',
    options: [
      { text: 'Because backward loops are faster in CPU cache', correct: false, explanation: 'Backward loops are not inherently faster.' },
      { text: 'To ensure each item is used at most ONCE (backward = 0/1, forward = unbounded knapsack)', correct: true, explanation: 'CRITICAL TRAP! Running forward overwrites previous generation values, allowing the same item to be picked repeatedly (unbounded). Backward preserves the previous generation!' },
      { text: 'To avoid zero division', correct: false, explanation: 'No division is involved.' },
      { text: 'Because Python requires reversed()', correct: false, explanation: 'It is a mathematical generation dependency, not Python syntax.' }
    ]
  },
  {
    id: 21,
    category: 'Ch 8 · Grid Pattern',
    topic: 'Grid Movement Doors',
    question: 'In Min Path Sum on a 2D grid moving only Right and Down, what are the doors into cell (r, c)?',
    options: [
      { text: 'From (r+1, c) and (r, c+1)', correct: false, explanation: 'Those are forward moves, not incoming moves!' },
      { text: 'From (r-1, c) [Above] and (r, c-1) [Left]', correct: true, explanation: 'CORRECT! To land at (r, c) moving only right/down, you came from either the top neighbor or left neighbor.' },
      { text: 'From all 8 diagonal neighbors', correct: false, explanation: 'Diagonal moves are not allowed.' },
      { text: 'Only from (0, 0)', correct: false, explanation: 'Subproblems step locally.' }
    ]
  },
  {
    id: 22,
    category: 'Ch 10 · LIS Pattern',
    topic: 'Data-Driven Doors',
    question: 'In Longest Increasing Subsequence (LIS), why is the transition cost O(N) per state instead of O(1)?',
    options: [
      { text: 'Because numbers are stored in a binary tree', correct: false, explanation: 'Standard DP table is a 1D array.' },
      { text: 'Because the doors are data-driven: you must inspect all j < i where nums[j] < nums[i]', correct: true, explanation: 'CORRECT! Fixed doors (frog, grid) take O(1). Data-driven doors require an inner loop over all valid predecessors, making transition O(N).' },
      { text: 'Because Python lists are slow', correct: false, explanation: 'Algorithmic door count sets the complexity, not list speed.' },
      { text: 'Because recursion is used', correct: false, explanation: 'LIS tabulation is bottom-up.' }
    ]
  },
  {
    id: 23,
    category: 'Ch 11 · State Machine',
    topic: 'The Mask / State Machine',
    question: 'In Stock Trading with Cooldown, how is the cooldown rule enforced in the DP formulation?',
    options: [
      { text: 'With a complex chain of 10 if-else statements inside the loop', correct: false, explanation: 'Messy guard clauses cause subtle bugs and corrupt states.' },
      { text: 'As a MISSING ARROW in the state machine (cannot transition directly from Sold to Buy on next day)', correct: true, explanation: 'MASTER LESSON! "The cooldown is not an if. It is a MISSING ARROW." Constraints get encoded directly into the state graph.' },
      { text: 'By resetting the array to zero', correct: false, explanation: 'Incorrect.' },
      { text: 'By pausing the thread with sleep()', correct: false, explanation: 'Never sleep in an algorithm.' }
    ]
  },
  {
    id: 24,
    category: 'Ch 12 · Interval DP',
    topic: 'Interval Fill Order',
    question: 'In Interval DP (Matrix Chain Multiplication, Burst Balloons), why must the outer loop iterate over INTERVAL LENGTH?',
    options: [
      { text: 'Row-major iteration is illegal because solving interval [l, r] requires all smaller lengths to be ready', correct: true, explanation: 'CORRECT! dp[l][r] cuts at k to combine dp[l][k] and dp[k+1][r]. Both halves have strictly smaller lengths, so shorter intervals must be solved first.' },
      { text: 'Because matrices must be square', correct: false, explanation: 'Matrix chain works on any rectangular compatible dimensions.' },
      { text: 'Because length is always an even number', correct: false, explanation: 'Length can be odd or even.' },
      { text: 'To save memory', correct: false, explanation: 'Interval DP remains O(N^2) space.' }
    ]
  },
  {
    id: 25,
    category: 'Ch 15 · Bitmask DP',
    topic: 'Bitmask Signal',
    question: 'What constraint in a problem description is the universal giveaway signal for Bitmask DP?',
    options: [
      { text: 'N <= 10^5', correct: false, explanation: 'N=10^5 is for O(N) or O(N log N) greedy/binary search.' },
      { text: 'N <= 20', correct: true, explanation: 'GOLDEN RULE! 2^N for N=20 is ~10^6, which fits within the standard 10^8 per-second CPU budget! N <= 20 screams Bitmask DP.' },
      { text: 'N is negative', correct: false, explanation: 'Lengths are non-negative.' },
      { text: 'N = 0', correct: false, explanation: 'Trivial.' }
    ]
  }
];
