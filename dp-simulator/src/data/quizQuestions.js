export const QUIZ_QUESTIONS = [
  {
    id: 1,
    category: 'Ch 0 · Two Laws',
    topic: 'Repeated subproblems',
    question: 'What makes a problem a good fit for dynamic programming instead of plain divide and conquer (like Merge Sort)?',
    options: [
      { text: 'DP needs trees, while divide and conquer needs arrays.', correct: false, explanation: 'Both work on lists, trees, grids and numbers. The data shape does not decide it.' },
      { text: 'The same smaller problems come up again and again, so saving their answers pays off.', correct: true, explanation: 'Right. Merge Sort splits into halves that never repeat, so there is nothing to save. DP shines when the same smaller question is asked many times.' },
      { text: 'DP always takes about N³ steps.', correct: false, explanation: 'DP speed depends on the problem: many DP solutions take about N or N² steps.' },
      { text: 'Divide and conquer saves answers in memory, DP does not.', correct: false, explanation: 'It is the other way round: DP saves answers (a memo or a table).' }
    ]
  },
  {
    id: 2,
    category: 'Ch 0 · Five Slots',
    topic: 'Slot 0: the last move',
    question: 'In this book, what is the first question you ask about a problem like "ways to reach step n"?',
    options: [
      { text: '"What is the very first move?"', correct: false, explanation: 'That can work for other ways of setting up the state, but this book defines dp[i] as "paths ending at i", so we look at how you arrived.' },
      { text: '"What was the last move that got me here?"', correct: true, explanation: 'Right. The last move tells you which smaller step you came from, and that smaller step is a problem you have already solved.' },
      { text: '"Which formula did someone post online?"', correct: false, explanation: 'Copying a formula skips understanding; you need to work out the choices yourself.' },
      { text: '"How do I write a loop as fast as possible?"', correct: false, explanation: 'This question is about thinking, not code. The loop comes later.' }
    ]
  },
  {
    id: 3,
    category: 'Ch 0 · Last-move choices',
    topic: 'Counting the choices',
    question: 'A frog can hop 1, 2 or 3 steps. For step i (with i ≥ 3), how many different "last moves" could have landed it there?',
    options: [
      { text: '1', correct: false, explanation: 'The frog has three hop sizes, so there is more than one way to arrive.' },
      { text: '2 (from i-1 and i-2)', correct: false, explanation: 'That is the 1-or-2 frog. A 3-step hop adds a third way in.' },
      { text: '3 (from i-1, i-2 and i-3)', correct: true, explanation: 'Right. The last hop was +1, +2 or +3, so it came from i-1, i-2 or i-3.' },
      { text: 'Unlimited', correct: false, explanation: 'Only three hop sizes exist, so only three last moves are possible.' }
    ]
  },
  {
    id: 4,
    category: 'Ch 0 · Challenge 3',
    topic: 'Working out a base value',
    question: 'For the frog that hops 1, 2 or 3 steps, how many ways reach step 3?',
    options: [
      { text: '3 (same as the 1-or-2 frog)', correct: false, explanation: 'That copies the old pattern. The 3-step hop adds one more path.' },
      { text: '4: dp[2] + dp[1] + dp[0] = 2 + 1 + 1', correct: true, explanation: 'Right. The paths are 1+1+1, 1+2, 2+1 and a single 3-step hop: 4 ways.' },
      { text: '5', correct: false, explanation: 'List them: 1+1+1, 1+2, 2+1, 3. That is only 4.' },
      { text: '6', correct: false, explanation: 'That counts some paths twice. Only 4 different hop sequences add up to 3.' }
    ]
  },
  {
    id: 5,
    category: 'Ch 0 · Combining choices',
    topic: 'Counting uses +',
    question: 'A problem asks "how many different ways reach step N?". How do you combine the answers from the possible last moves?',
    options: [
      { text: 'min of them', correct: false, explanation: 'min picks the cheapest route; it does not count routes.' },
      { text: 'max of them', correct: false, explanation: 'max picks the best route; it does not count routes.' },
      { text: 'Add them all (+)', correct: true, explanation: 'Right. Each last move gives a separate group of paths with no overlap, so adding the groups counts every path once.' },
      { text: 'Multiply them (×)', correct: false, explanation: 'The last moves are alternatives (this OR that), not steps done one after another, so they add.' }
    ]
  },
  {
    id: 6,
    category: 'Ch 0 · Combining choices',
    topic: 'Optimizing uses min / max',
    question: 'A problem asks "what is the minimum cost to reach step N?". How do you combine the answers from the possible last moves?',
    options: [
      { text: 'Add them (+)', correct: false, explanation: 'Adding counts ways. Here you want the single cheapest route.' },
      { text: 'Take the min', correct: true, explanation: 'Right. You pick the one best choice: min for lowest cost, max for highest reward.' },
      { text: 'Bitwise XOR', correct: false, explanation: 'XOR mixes bits; it has no meaning for costs.' },
      { text: 'Take the average', correct: false, explanation: 'An average is not the cost of any real route.' }
    ]
  },
  {
    id: 7,
    category: 'Ch 0 · Challenge 7',
    topic: 'Where is the answer? (can stop anywhere)',
    question: 'Each step pays gold[i] and the frog may stop on any step. Where is the answer for "most gold"?',
    options: [
      { text: 'dp[n], out of habit', correct: false, explanation: 'The frog does not have to reach step n, so the best total may end earlier.' },
      { text: 'The largest value in the whole table, max(dp)', correct: true, explanation: 'Right. When the path can end anywhere, check every cell and take the best. When the end is fixed, read that one cell.' },
      { text: 'dp[0]', correct: false, explanation: 'dp[0] is the starting point, before any gold is collected.' },
      { text: 'dp[n/2]', correct: false, explanation: 'Nothing in the problem points at the middle step.' }
    ]
  },
  {
    id: 8,
    category: 'Ch 0 · Five Slots',
    topic: 'Where is the answer? (fixed end)',
    question: 'The question is "how many ways reach exactly step N?". Which single cell holds the answer?',
    options: [
      { text: 'dp[n]', correct: true, explanation: 'Right. dp[n] means "ways to reach step n", which is exactly what was asked.' },
      { text: 'max(dp)', correct: false, explanation: 'Use max(dp) only when the path may end anywhere. Here the end is fixed at step n.' },
      { text: 'sum(dp)', correct: false, explanation: 'Summing would also count paths that stop before step n.' },
      { text: 'dp[0]', correct: false, explanation: 'dp[0] is the starting point, not the destination.' }
    ]
  },
  {
    id: 9,
    category: 'Ch 0 · Challenge 6',
    topic: 'The n = 1 crash',
    question: 'Why does "dp = [0]*(n+1); dp[1]=1; dp[2]=2; for i in range(3, n+1): ..." crash for n = 1?',
    options: [
      { text: 'Python lists cannot hold zeros.', correct: false, explanation: 'Lists hold zeros fine.' },
      { text: 'The list has only indexes 0 and 1, so dp[2] is out of range (IndexError).', correct: true, explanation: 'Right. [0]*(1+1) has length 2, so writing dp[2] fails before the loop even starts.' },
      { text: 'range(3, 2) loops forever.', correct: false, explanation: 'range(3, 2) is simply empty; the loop body never runs.' },
      { text: 'The function returns None.', correct: false, explanation: 'It never reaches a return; it crashes on the dp[2] line.' }
    ]
  },
  {
    id: 10,
    category: 'Ch 0 · Challenge 6',
    topic: 'Guarding small inputs',
    question: 'For the 1-or-2 frog (dp[0] = 1, dp[1] = 1, dp[2] = 2), which first line best avoids the small-n crash?',
    options: [
      { text: 'if n <= 2: return 1 if n == 0 else n', correct: true, explanation: 'Right. It returns 1, 1, 2 for n = 0, 1, 2 and skips building the list for those cases.' },
      { text: 'pass', correct: false, explanation: 'pass does nothing, so the crash still happens.' },
      { text: 'import sys; sys.setrecursionlimit(10000)', correct: false, explanation: 'This code has no recursion, so the recursion limit does not matter.' },
      { text: 'dp.append(0)', correct: false, explanation: 'Adding a slot hides the crash but does not give the right answer for small n.' }
    ]
  },
  {
    id: 11,
    category: 'Ch 1 · Approach',
    topic: 'How slow is plain recursion?',
    question: 'How does the work of plain recursive fib(n), with no saved answers, grow?',
    options: [
      { text: 'About n steps', correct: false, explanation: 'That is fib with saved answers (memo or table), not plain recursion.' },
      { text: 'About n² steps', correct: false, explanation: 'It grows much faster than n²: each extra n multiplies the work.' },
      { text: 'Exponentially: each +1 to n multiplies the work by about 1.6', correct: true, explanation: 'Right. Each call makes two more calls, so the number of calls explodes. O(2^n) is a safe upper bound.' },
      { text: 'About log n steps', correct: false, explanation: 'log n is how binary search grows, not recursion that branches in two.' }
    ]
  },
  {
    id: 12,
    category: 'Ch 1 · Approach',
    topic: 'How deep does recursion go?',
    question: 'How many calls are waiting at the same time (the call stack) in plain recursive fib(n)?',
    options: [
      { text: 'A fixed small number', correct: false, explanation: 'Each call waits for its child, so the number of waiting calls grows with n.' },
      { text: 'About n', correct: true, explanation: 'Right. There are many calls in total, but at any moment only one chain fib(n) → fib(n-1) → ... → fib(1) is waiting, about n long.' },
      { text: 'About 2^n', correct: false, explanation: 'Finished calls are removed from the stack, so they do not all wait at once.' },
      { text: 'About n!', correct: false, explanation: 'Nothing here grows like a factorial.' }
    ]
  },
  {
    id: 13,
    category: 'Ch 2 · Approach',
    topic: 'Top-down with a memo',
    question: 'With memoization, what does f(n) do before calculating anything?',
    options: [
      { text: 'Clears the memo', correct: false, explanation: 'That would throw away every saved answer.' },
      { text: 'Checks whether n is already in the memo and, if so, returns the saved answer', correct: true, explanation: 'Right. That one lookup skips all the recursive work f(n) would otherwise repeat.' },
      { text: 'Sorts the input', correct: false, explanation: 'Sorting has nothing to do with saving answers.' },
      { text: 'Raises an error', correct: false, explanation: 'Nothing is wrong yet; it just looks for a saved answer.' }
    ]
  },
  {
    id: 14,
    category: 'Ch 2 · Theory',
    topic: 'Estimating DP running time',
    question: 'What is a good way to estimate how long a DP solution takes?',
    options: [
      { text: 'Number of different states × work done per state (including trying all its choices)', correct: true, explanation: 'Right. The frog has n states with 2 choices each: about n steps. Longest increasing subsequence has n states and checks up to n earlier numbers each: about n².' },
      { text: 'Always 2^n', correct: false, explanation: 'Some algorithms take 2^n steps, but saving answers usually avoids that.' },
      { text: 'Always n × log n', correct: false, explanation: 'Some algorithms take n log n, but it is not a rule for DP.' },
      { text: 'Length of the array divided by 2', correct: false, explanation: 'That ignores how much work each state needs.' }
    ]
  },
  {
    id: 15,
    category: 'Ch 3 · Approach',
    topic: 'Loop order',
    question: 'Why does a table for dp[i] = dp[i-1] + dp[i-2] fill from small i to large i?',
    options: [
      { text: 'Python ranges can only count up.', correct: false, explanation: 'Python ranges can count down with a negative step.' },
      { text: 'dp[i] needs dp[i-1] and dp[i-2], so those must be filled first.', correct: true, explanation: 'Right. Always fill the values a cell depends on before the cell itself.' },
      { text: 'Memory is faster going forward.', correct: false, explanation: 'Order here is about getting the right answer, not speed.' },
      { text: 'Order does not matter.', correct: false, explanation: 'Going backward would read cells that are still 0.' }
    ]
  },
  {
    id: 16,
    category: 'Ch 3 · Correctness check',
    topic: 'Start, step, end',
    question: 'A loop-correctness check has three parts: true at the start, stays true each step, gives the answer at the end. Which part matches the base case?',
    options: [
      { text: 'Stays true each step', correct: false, explanation: 'That part matches the transition (the update rule).' },
      { text: 'True at the start', correct: true, explanation: 'Right. Before the loop runs, only the base cases are filled, and they must already be correct.' },
      { text: 'Gives the answer at the end', correct: false, explanation: 'That part matches reading the final answer cell.' },
      { text: 'None of them', correct: false, explanation: 'The base case is exactly what makes the start correct.' }
    ]
  },
  {
    id: 17,
    category: 'Ch 3 · Debugging',
    topic: 'Wrong answers everywhere',
    question: 'Your table code runs without crashing but every test answer is wrong. What should you do first?',
    options: [
      { text: 'Check the starting values (base cases)', correct: false, explanation: 'A wrong base case is a common cause, but a wrong rule or wrong final cell can do the same. You cannot tell from this alone.' },
      { text: 'Blame the computer', correct: false, explanation: 'Wrong answers come from the code, not the hardware.' },
      { text: 'Check the final cell you return', correct: false, explanation: 'Possible, for example returning dp[n-1] instead of dp[n], but not certain.' },
      { text: 'Work a small example by hand and compare it cell by cell; the first cell that differs shows the bug', correct: true, explanation: 'Right. Any of base case, update rule or returned cell can be wrong. The first differing cell tells you which.' }
    ]
  },
  {
    id: 18,
    category: 'Ch 3 · Debugging',
    topic: 'Small inputs pass, large fail',
    question: 'Your solution is right for n = 1 and 2 but wrong for n = 10. What is the best next step?',
    options: [
      { text: 'Assume the base case is wrong', correct: false, explanation: 'Small inputs pass, so the first base cases are probably fine, but a later hard-coded value could still be wrong.' },
      { text: 'Find the first n where it goes wrong and check how that value was built from earlier ones', correct: true, explanation: 'Right. Usually the update rule misses a choice or uses the wrong operator; the first wrong value shows exactly where.' },
      { text: 'Change the screen resolution', correct: false, explanation: 'The display has no effect on calculations.' },
      { text: 'Raise the recursion limit', correct: false, explanation: 'That only helps if the code is recursive and actually crashes, not when it returns a wrong number.' }
    ]
  },
  {
    id: 19,
    category: 'Ch 4 · Approach',
    topic: 'Keeping only what you need',
    question: 'For dp[i] = dp[i-1] + dp[i-2], how many earlier values do you need to keep while looping?',
    options: [
      { text: 'All n values', correct: false, explanation: 'Once you are at step i, values like dp[i-5] are never read again.' },
      { text: 'Just 2 (the last two answers)', correct: true, explanation: 'Right. Each new value only reads the two before it, so two variables are enough instead of a whole list.' },
      { text: '0', correct: false, explanation: 'You need the previous two values to add them.' },
      { text: 'n / 2', correct: false, explanation: 'The rule always looks back exactly 2 steps, whatever n is.' }
    ]
  },
  {
    id: 20,
    category: 'Ch 4 · Knapsack Trap',
    topic: 'Loop direction with one list',
    question: 'In 0/1 knapsack with a single list updated in place, why must the weight loop go from high to low?',
    options: [
      { text: 'Backward loops are faster.', correct: false, explanation: 'Direction does not change speed here; it changes the answer.' },
      { text: 'So each item is used at most once (high to low = 0/1; low to high = unlimited copies)', correct: true, explanation: 'Right. Going low to high, a cell you just updated with this item gets read again for a bigger weight, so the item is counted twice. Going high to low only reads values from before this item.' },
      { text: 'To avoid dividing by zero.', correct: false, explanation: 'There is no division in knapsack.' },
      { text: 'Python requires reversed().', correct: false, explanation: 'It is about which values are read, not Python syntax. (With two separate rows, either direction works.)' }
    ]
  },
  {
    id: 21,
    category: 'Ch 8 · Grid Pattern',
    topic: 'Where did I come from?',
    question: 'Moving only right or down, from which cells can you arrive at an inner cell (r, c), with r > 0 and c > 0?',
    options: [
      { text: '(r+1, c) and (r, c+1)', correct: false, explanation: 'Those are where you go next, not where you came from.' },
      { text: '(r-1, c) above and (r, c-1) on the left', correct: true, explanation: 'Right. A down move comes from above and a right move comes from the left.' },
      { text: 'All 8 neighbours', correct: false, explanation: 'Only right and down moves are allowed.' },
      { text: 'Only (0, 0)', correct: false, explanation: 'You arrive from a neighbouring cell, not straight from the start.' }
    ]
  },
  {
    id: 22,
    category: 'Ch 10 · LIS Pattern',
    topic: 'Why an inner loop?',
    question: 'In the standard n² longest increasing subsequence DP, why does each dp[i] need an inner loop?',
    options: [
      { text: 'The numbers are stored in a tree.', correct: false, explanation: 'They are in a plain list.' },
      { text: 'The number before nums[i] could be any earlier smaller number, so every earlier j must be checked', correct: true, explanation: 'Right. Frog and grid problems have a fixed few choices; here the choices depend on the data, so you scan up to i earlier numbers.' },
      { text: 'Python lists are slow.', correct: false, explanation: 'The number of choices to check sets the cost, not the language.' },
      { text: 'It uses recursion.', correct: false, explanation: 'The table version is a plain loop.' }
    ]
  },
  {
    id: 23,
    category: 'Ch 11 · State Machine',
    topic: 'How the cooldown is enforced',
    question: 'In stock trading with a 1-day cooldown, how does the three-state DP stop you buying the day after selling?',
    options: [
      { text: 'It allows buying the day after a sale.', correct: false, explanation: 'That is exactly the trade the cooldown forbids.' },
      { text: 'Buying is only allowed from REST, and the day after selling you are in SOLD, not REST', correct: true, explanation: 'Right. There is simply no way to go from SOLD straight to HOLD, so the rule is built into which states can follow which.' },
      { text: 'It resets the table to zero after each sale.', correct: false, explanation: 'That would erase the profit already earned.' },
      { text: 'It pauses the program for a day.', correct: false, explanation: 'Pausing does not change which trades are allowed.' }
    ]
  },
  {
    id: 24,
    category: 'Ch 12 · Interval DP',
    topic: 'Fill order for intervals',
    question: 'Why does filling interval DP by increasing interval length work?',
    options: [
      { text: 'Every interval [l, r] is built from shorter intervals, which are already solved', correct: true, explanation: 'Right. A split at k uses [l, k] and [k+1, r], both shorter. (Other orders also work, for example l from high to low with r from low to high.)' },
      { text: 'The matrices must be square.', correct: false, explanation: 'Matrix chain works with any compatible rectangles.' },
      { text: 'Interval lengths are always even.', correct: false, explanation: 'Lengths can be odd or even.' },
      { text: 'It saves memory.', correct: false, explanation: 'The table is the same size whatever order you fill it in.' }
    ]
  },
  {
    id: 25,
    category: 'Ch 15 · Bitmask DP',
    topic: 'A hint to track sets',
    question: 'Which size limit often suggests DP that remembers a set of chosen items as bits?',
    options: [
      { text: 'N ≤ 100,000', correct: false, explanation: 'That needs a fast algorithm, but does not point to any particular technique.' },
      { text: 'N ≤ 20', correct: true, explanation: 'Right. 20 items have 2^20 ≈ 1 million subsets, small enough to go through. Still count the work per subset.' },
      { text: 'N is negative', correct: false, explanation: 'A count of items cannot be negative.' },
      { text: 'N = 0', correct: false, explanation: 'With no items there is nothing to choose, so no DP is needed.' }
    ]
  }
];
