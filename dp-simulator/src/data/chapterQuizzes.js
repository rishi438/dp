import { QUIZ_QUESTIONS } from './quizQuestions.js';
import { chapterPractices } from './practice.js';

export const chapterOf = question => Number(question.category.match(/^Ch (\d+)\b/)?.[1] ?? -1);

// Each row: prompt, correct answer, two plausible traps, explanation.
// Stable chapter/index IDs preserve saved answers when other chapters expand.
const drills = {
  1: [
    ['With F(0)=0 and F(1)=1, what does plain recursive F(4) return?', '3', '5', '4', 'F(2)=1, F(3)=2, and F(4)=3. Staircase bases would give a different sequence.'],
    ['In the plain F(5) call tree, is F(3) evaluated more than once?', 'Yes: directly under F(5), and again under F(4)', 'No: functions automatically reuse returns', 'Only if F(3) is a base case', 'A returned value is not a cache. Each call expands its own subtree.'],
    ['What happens if recursive F(n) has no stopping condition?', 'It keeps recursing until the stack limit is reached', 'It automatically returns at zero', 'It becomes bottom-up DP', 'Every recursive branch needs a reachable base case. Negative arguments do not stop automatically.'],
    ['F(n) calls F(n-1) and F(n-2). Why is the usual recursive process guaranteed to reach a base for n≥0?', 'Each child has a smaller nonnegative argument until 0 or 1', 'Each return value is smaller', 'The number of function calls decreases', 'Termination depends on the arguments decreasing toward the bases, not on the returned values.'],
    ['For F(3), how many calls occur including the root and base calls?', '5', '3', '7', 'The calls are F(3), F(2), F(1), F(0), and another F(1).'],
    ['Does an exponential number of total calls mean all those frames are on the stack simultaneously?', 'No; only the current recursive path is active', 'Yes; every completed call stays on the stack', 'No; recursion uses no stack', 'Sibling subtrees run sequentially. Returned frames are removed before later work.'],
    ['For counting 1-or-2-hop staircase paths, what should ways(0) return?', '1: one empty path', '0: no hop was made', '-1: step zero is invalid', 'Counting completions needs one identity path at the destination/base, unlike Fibonacci F(0)=0.'],
  ],
  2: [
    ['A memoized function returns zero for some states. Is if memo[state] a safe cache check?', 'No; test whether the key exists', 'Yes; zero means not computed', 'Yes; DP answers are always positive', 'Zero and false can be valid cached results. Presence and truthiness are different.'],
    ['Which arguments belong in a memo key?', 'Every argument that can change the subproblem answer', 'Only the first argument', 'Only the argument with the largest value', 'Different logical states must not collide in the cache.'],
    ['Where should a memoized state store its answer?', 'After its dependencies have produced the completed answer', 'Before doing any work, using an arbitrary zero', 'Only when the whole program finishes', 'Caching an unfinished placeholder can make later calls reuse an incorrect answer.'],
    ['A coin-change cache depends on the coin list. Can it be reused unchanged for a different coin list?', 'No, unless the coin list is part of the cache identity', 'Yes; amounts alone always identify the same problem', 'Only if both lists have equal length', 'The same amount can have different answers for different coin sets. Clear or correctly scope the cache.'],
    ['Does adding memoization remove recursive stack depth?', 'No; top-down calls still use a stack', 'Yes; all recursion becomes a loop', 'Yes; a dictionary stores the stack', 'Caching removes repeated computations, but a first visit still follows recursive dependencies.'],
    ['How many distinct argument values can memoized F(n) need for n≥2?', 'n+1: 0 through n', '2^n', 'Exactly two', 'Many calls share the same argument; each distinct argument needs at most one computed cache entry.'],
    ['A two-dimensional state (i,j) is cached only by i. What is the likely defect?', 'Answers for different j values overwrite or reuse each other', 'The code only uses too much memory', 'The result stays correct but gets slower', 'If j affects available choices, dropping it merges different subproblems.'],
  ],
  3: [
    ['Before computing dp[i], what must be true in a correct bottom-up order?', 'Every dependency read by the transition is already valid', 'Every larger-index cell is filled', 'The entire table is sorted by value', 'A topological dependency order matters; numerical ordering of answers does not.'],
    ['For ways(0)=1 and hops {1,2}, what is the table through index 4?', '[1, 1, 2, 3, 5]', '[0, 1, 1, 2, 3]', '[1, 2, 3, 4, 5]', 'Apply ways(i)=ways(i-1)+ways(i-2) with the single-hop boundary at i=1.'],
    ['All dp cells are correct, but the function returns dp[n-1] when the task asks for step n. Which phase is wrong?', 'Termination', 'Initialization', 'Maintenance', 'The recurrence can be correct while the final lookup answers the wrong subproblem.'],
    ['For a table indexed 0..n inclusive, how many slots are required?', 'n+1', 'n', 'n-1', 'Counting both endpoints requires n+1 elements; the last valid index is length minus one.'],
    ['Can a bottom-up fill order run backwards?', 'Yes, when each state depends on states already filled in that order', 'No, all DP must run forwards', 'Yes, regardless of the recurrence', 'For suffix DP, larger indices can be dependencies. Derive the order from the arrows.'],
    ['Does bottom-up tabulation require recursive calls?', 'No; loops can evaluate the dependency order', 'Yes; each table cell needs its own recursive call', 'Only for one-dimensional DP', 'Tabulation explicitly schedules states instead of discovering them through a call stack.'],
    ['Why should boundary inputs be checked before writing dp[1]?', 'The table may contain only dp[0]', 'Writing dp[1] changes all cells', 'A loop always allocates extra space', 'For n=0, a length n+1 array has just one element. Base-case writes must respect its size.'],
  ],
  4: [
    ['With prev2=2 and prev1=3, what is the next value for a two-term sum recurrence?', '5', '6', '3', 'Compute curr=prev2+prev1 before shifting either dependency.'],
    ['Why is prev2=prev1; prev1=prev1+prev2 an incorrect sequential update?', 'It overwrites the old prev2 before the addition', 'It keeps too much memory', 'The recurrence requires multiplication', 'After the first assignment both variables hold old prev1. Use a temporary or simultaneous assignment.'],
    ['A rolling array keeps the answer but discards all predecessors. What becomes harder?', 'Reconstructing the actual chosen path', 'Returning the numeric optimum', 'Doing constant-time additions', 'Path reconstruction needs decision history or recomputation, beyond the rolled values.'],
    ['For unbounded coin combinations with coin outermost, which amount direction permits reusing that coin?', 'Ascending amounts', 'Descending amounts', 'Either always gives the same count', 'Ascending order can read the current coin generation; descending limits each coin to one use.'],
    ['When can an old DP row be discarded?', 'After no future transition needs it', 'As soon as the next row starts', 'Only after all input is deleted', 'Space optimization is a dependency-lifetime argument, not a fixed rule to keep two rows.'],
    ['A recurrence reads the previous five states. Do two rolling numbers always suffice?', 'No; the required dependency window is larger', 'Yes; every DP uses two numbers', 'Yes, if the loop is reversed', 'The recurrence determines how much prior information must remain available.'],
    ['Does replacing a full table with a rolling window automatically improve time complexity?', 'No; it primarily reduces storage', 'Yes; O(n) always becomes O(1)', 'Yes; all transitions disappear', 'The same states may still be evaluated with the same work per transition.'],
  ],
  5: [
    ['For coins [2,3,7], which predecessor amounts contribute to amount 9?', '7, 6, and 2', '2, 3, and 7', '11, 12, and 16', 'Undo the last chosen coin: the predecessor is amount minus that coin.'],
    ['What is dp[0] when counting coin combinations?', '1: choose no coins', '0: the amount has no coins', 'Infinity: zero is unreachable', 'There is exactly one combination making zero, so it seeds later counts.'],
    ['What is dp[0] when minimizing the number of coins?', '0: no coins are needed', '1: copy the counting base', 'Infinity', 'Optimization measures coin count, while combination DP measures the number of ways.'],
    ['With coins [1,2] and amount 3, how many unordered combinations exist?', '2', '3', '4', 'The combinations are {1,1,1} and {1,2}. Reordering {1,2} does not create another combination.'],
    ['Which loop order counts unordered combinations with unlimited coins?', 'Coins outermost; amounts ascending', 'Amounts outermost; coins inside', 'Coins outermost; amounts descending', 'Processing coin types in a fixed order prevents counting permutations; ascending allows reuse.'],
    ['How should an unreachable predecessor behave in minimum-coin DP?', 'It must not produce a finite candidate', 'Add one to -1 and treat zero as a valid cost', 'Count it as one solution', 'Use an infinity sentinel internally or explicitly skip unreachable states.'],
    ['In Word Break prefix DP, why is can[0] true?', 'The empty prefix needs zero words and is valid', 'Every input is segmentable', 'The first character must be a word', 'This base allows a dictionary word starting at position zero to create a valid prefix.'],
  ],
  6: [
    ['For nonempty maximum-subarray sum on [-5,-2,-8], what is the answer?', '-2', '0', '-15', 'The empty subarray is forbidden. The best nonempty choice is the single value -2.'],
    ['In Kadane DP, what does dp[i] mean?', 'Best nonempty subarray sum ending exactly at i', 'Best sum anywhere in the whole input', 'Sum of every positive element seen', 'Fixing the endpoint makes the last decision either extend the previous run or start fresh.'],
    ['For nums[i]=-2 and previous ending sum 4, what is the new ending sum?', '2', '4', '-2', 'max(-2,4-2)=2. The best overall sum may remain 4, but the ending-here state becomes 2.'],
    ['For [4,-10,3], what is the overall maximum-subarray sum?', '4', '3', '7', 'The answer may end before the final index. Values 4 and 3 cannot be combined across -10 without including it.'],
    ['When the previous ending sum is negative, what does Kadane prefer?', 'Start a new run at the current element', 'Always extend the old run', 'Delete the current element and continue the same run', 'Adding a negative previous sum is worse than taking the current element alone.'],
    ['For [2,-1,2], what is the maximum contiguous sum?', '3', '4', '2', 'The optimal run includes the negative middle value. Summing positives would incorrectly skip a required element.'],
    ['What must be tracked to return the subarray boundaries as well as its sum?', 'Candidate start plus best start/end when the optimum improves', 'Only the final dp value', 'Only the number of negative values', 'Restarting moves the candidate start; a new global best records the current range.'],
  ],
  7: [
    ['In LCS prefix DP, what are dp[0][j] and dp[i][0]?', '0: an empty sequence has no common characters', '1: count the empty path', 'Infinity', 'The state measures subsequence length, not the number of subsequences.'],
    ['When the last characters match in LCS, which dependency extends the answer?', '1 + dp[i-1][j-1]', '1 + dp[i][j-1]', 'dp[i-1][j] + dp[i][j-1]', 'Both matching characters are consumed, so both prefix lengths shrink.'],
    ['When the last characters differ in LCS, which transition is valid?', 'max(dp[i-1][j], dp[i][j-1])', 'dp[i-1][j-1] + 1', 'Reset to zero', 'Skip one endpoint and choose the longer subsequence. Resetting describes a different substring problem.'],
    ['What is the LCS length of ABCDE and ACE?', '3', '1', '5', 'ACE preserves order in both strings, although its characters are not contiguous in ABCDE.'],
    ['For edit distance, what is dp[0][j]?', 'j insertions', '0', '1', 'Turning the empty string into a length-j prefix needs j single-character insertions.'],
    ['For unequal final characters in unit-cost edit distance, what is the transition?', '1 + min(delete, insert, replace)', '1 + max(delete, insert, replace)', 'Sum all three alternatives', 'These are alternative edit sequences. Choose the least costly one.'],
    ['Can a single index usually identify an LCS subproblem?', 'No; the remaining positions in both sequences matter', 'Yes; only the longer sequence matters', 'Yes; sort both strings first', 'Two different positions in the second sequence can give different answers for the same first position.'],
  ],
  8: [
    ['For minimum path sum, what is the top-left base?', 'grid[0][0]', '0 regardless of its cost', '1 regardless of its cost', 'The path includes the starting cell, so its cost is counted.'],
    ['How many right/down paths cross a 1×4 grid?', '1', '4', '0', 'There is only one possible route: move right three times.'],
    ['How should the first row of minimum-path DP be filled?', 'Cumulative sums from the left', 'All zeros', 'The minimum of all grid values', 'There is no predecessor above the first row. Only the left-hand route is available.'],
    ['For a blocked cell in path-counting DP, what value should it receive?', '0', '1', 'The sum from neighbors regardless of the block', 'No legal route may enter a blocked cell, so it contributes no paths.'],
    ['How many right/down paths exist in a 2×3 empty grid?', '3', '6', '2', 'Each route contains two right moves and one down move; the down move has three possible positions.'],
    ['Why is row-by-row, left-to-right filling valid for right/down movement?', 'Above and left dependencies have already been computed', 'Grid values are sorted', 'All paths have equal cost', 'The traversal follows the dependency direction independently of the values stored in the grid.'],
    ['Where is the result if the destination is the bottom-right cell?', 'dp[rows-1][cols-1]', 'max over all table cells', 'Sum of every table cell', 'The endpoint is fixed. Intermediate destinations answer different questions.'],
  ],
  9: [
    ['In 0/1 knapsack, what does the 0/1 restriction mean?', 'Each item can be taken at most once', 'All item values are zero or one', 'Capacity must be one', 'The binary choice is whether to include each item, not its weight or value.'],
    ['Which row supplies both choices in a full 0/1 knapsack transition?', 'The previous item row', 'The current item row for the take choice', 'Any row with a larger value', 'Using the previous row prevents the same item from supplying itself again.'],
    ['An item weighs more than the current capacity. Which choice remains?', 'Skip it', 'Take a fraction of it', 'Use a negative array index', 'Ordinary 0/1 knapsack does not permit fractions or exceeding the capacity.'],
    ['One item has weight 2 and value 7; capacity is 4. What is the 0/1 optimum?', '7', '14', '0', 'There is only one copy. Getting 14 would solve the unbounded variant instead.'],
    ['In subset-sum DP, is target zero reachable with no items?', 'Yes, via the empty subset', 'No, because at least one item is required', 'Only if an input item equals zero', 'Unless the problem forbids empty subsets, selecting nothing sums to zero.'],
    ['For weights [1,2], values [2,3], capacity 2, what is the best value?', '3', '5', '4', 'Both items weigh 3 together. The weight-2 item alone beats the weight-1 item alone.'],
    ['Why does a rolled 0/1 capacity loop go downwards?', 'To read values from before the current item was used', 'To make negative weights valid', 'To sort the items', 'Ascending order could reuse an entry already updated with this item.'],
  ],
  10: [
    ['For strictly increasing LIS on [2,2,2], what is the length?', '1', '3', '0', 'Equal elements cannot extend a strictly increasing sequence.'],
    ['Which j values may precede i in standard LIS DP?', 'j<i and nums[j]<nums[i]', 'Any j with a smaller value, including future indices', 'Only j=i-1', 'Both original order and strict value growth must be preserved.'],
    ['Why is each nonempty LIS ending state initialized to 1?', 'The element itself is a length-one subsequence', 'Every input has one valid predecessor', 'The answer must be positive even for empty input', 'A state needs no predecessor to form its singleton subsequence.'],
    ['Why is max(dp) used instead of dp[n-1] for standard LIS?', 'The longest subsequence can end before the last index', 'The last cell is always uncomputed', 'The problem counts all subsequences', 'The endpoint is free, so inspect every ending-here state.'],
    ['What is the LIS length of [3,1,2]?', '2', '3', '1', 'The subsequence [1,2] is increasing. Sorting the input would change the problem.'],
    ['Can sorting the input first preserve the original LIS question?', 'No; sorting destroys the original position constraints', 'Yes; subsequences ignore order', 'Only when duplicates exist', 'Subsequences may skip positions, but cannot reorder them.'],
    ['In the O(n log n) tails algorithm, does tails itself always represent one valid subsequence?', 'No; each entry tracks a smallest possible tail for its length', 'Yes; append all tails to reconstruct the answer', 'No; tails stores counts instead of values', 'Entries can come from different candidate subsequences. Reconstruction needs predecessor information.'],
  ],
  11: [
    ['What is the holding-state value before buying any stock on day zero?', '-price[0] after choosing to buy', 'price[0]', 'Always zero after buying', 'Buying spends money; the running profit decreases by the purchase price.'],
    ['May a final answer include an unsold stock as completed cash profit?', 'No; choose a non-holding terminal state', 'Yes; add its purchase price again', 'Only when its price fell', 'Holding includes the cost of a purchase that has not been closed by a sale.'],
    ['In a three-state cooldown DP, buying today must come from which previous state?', 'Rest, not yesterday’s just-sold state', 'Any state, including just sold', 'Holding only', 'The missing sold-to-buy transition enforces the cooldown day.'],
    ['For prices [1,2,3,0,2] with one-day cooldown, what is the best profit?', '3', '4', '2', 'Buy at 1, sell at 2, rest at 3, buy at 0, sell at 2: total 1+2=3.'],
    ['Why should all next-day state values be computed from a saved previous-day snapshot?', 'To avoid mixing today’s updates with yesterday’s dependencies', 'To make the table sorted', 'To force exactly one transaction', 'In-place overwrites may create transitions that the state machine never allowed.'],
    ['What should an impossible state such as sold-before-any-sale contain in max-profit DP?', 'Negative infinity', 'Positive infinity', 'The largest input price', 'An impossible state must never win a maximum comparison.'],
    ['For prices [5,4,3], with trading optional, what is the best profit?', '0', '-2', '5', 'Choosing no transaction is legal and better than making a loss.'],
  ],
  12: [
    ['What is the matrix-chain base cost for a single matrix?', '0', 'Its number of entries', '1', 'An already existing matrix needs no multiplication to produce itself.'],
    ['Multiplying a 10×20 matrix by a 20×30 matrix costs how many scalar multiplications?', '6000', '600', '1200', 'The cost is rows-left × shared dimension × columns-right = 10×20×30.'],
    ['In matrix-chain DP, what decision makes the two subchains independent?', 'The final split between left and right products', 'The first matrix element computed', 'The largest dimension', 'After picking the final multiplication, each contiguous subchain can be optimized independently.'],
    ['Why choose the LAST balloon to burst inside an interval?', 'Its surviving boundary neighbors are then known', 'It always has the largest value', 'It eliminates the need for subproblems', 'Choosing the first burst changes later adjacency. The last burst has fixed outside boundaries.'],
    ['In open-interval Burst Balloons DP, what is the value when no balloon lies between the boundaries?', '0', '1', 'The product of the boundary values', 'There is no balloon left to burst, hence no additional coins.'],
    ['For n matrices, what is the usual matrix-chain DP time complexity?', 'O(n³)', 'O(n)', 'O(2^n) after tabulation', 'There are O(n²) intervals and up to O(n) split choices per interval.'],
    ['Is increasing interval length the only valid evaluation order?', 'No; any order that finishes both required subintervals first is valid', 'Yes; no other topological order can work', 'Every arbitrary order works', 'Length order is a convenient topological order. For example, suitable descending-left/ascending-right orders can also satisfy dependencies.'],
  ],
  13: [
    ['For longest palindromic subsequence, what is dp[i][i]?', '1', '0', '2', 'One character is a palindrome of length one.'],
    ['For an empty interval in LPS, what length is returned?', '0', '1', '-1', 'There are no characters in an empty subsequence.'],
    ['When matching endpoints enclose an interval in LPS, what transition is used?', '2 + best(inner interval)', '1 + best(inner interval)', 'Length of the entire interval regardless of its contents', 'The two matching endpoints contribute two characters around an optimal inner subsequence.'],
    ['When LPS endpoints differ, what should the transition do?', 'Take the larger result after dropping either endpoint', 'Add both results', 'Return zero for the entire interval', 'A subsequence can skip either end. These alternatives compete rather than being combined as lengths.'],
    ['What is the LPS length of bbbab?', '4', '3', '5', 'The subsequence bbbb is a palindrome, even though those four positions are not contiguous.'],
    ['Are longest palindromic substring and subsequence the same problem?', 'No; a substring must be contiguous', 'Yes; both permit arbitrary skips', 'Yes; both always return the same length', 'Deleting interior positions is allowed only in the subsequence problem.'],
    ['For palindromic-substring checking, when do equal endpoints prove the full interval is a palindrome?', 'When the inner interval is also palindromic, or the interval has length at most two', 'Always', 'Only if both endpoints are vowels', 'Equal endpoints alone do not certify all the characters between them.'],
  ],
  14: [
    ['For House Robber on a tree, which pair of values is useful at each node?', 'Best value when taking the node, and when skipping it', 'Minimum and maximum node depth', 'Only the sum of all node values', 'The parent must distinguish whether selecting a child would violate adjacency.'],
    ['If a node is robbed, which child states are allowed?', 'Skip each child', 'Rob each child', 'Choose each child’s maximum without restrictions', 'The parent-child exclusion is applied to every direct child.'],
    ['If a node is skipped, how are its children handled?', 'Independently choose each child’s better rob/skip value', 'Every descendant must also be skipped', 'Exactly one child must be robbed', 'Skipping the parent removes its restriction on the direct children; the subtrees remain independent.'],
    ['Which traversal naturally computes children before parents?', 'Postorder', 'Preorder without deferred work', 'Level order from root down without revisiting', 'A node’s transition needs completed results from its child subtrees.'],
    ['What pair should a missing child return for tree robbery?', '(0,0)', '(1,1)', '(infinity,infinity)', 'A nonexistent subtree contributes no money under either choice.'],
    ['For a root worth 3 with two leaf children worth 4 and 5, what is optimal?', 'Skip root and take both children: 9', 'Take all three: 12', 'Take root only: 3', 'The children are not adjacent to each other; both can be selected when the root is skipped.'],
    ['Can the root itself be forced into the optimal answer?', 'Only if the problem explicitly requires it', 'Yes, because it is processed last', 'Yes, because it contains both subtrees', 'Normally return max(rob(root),skip(root)); traversal order does not force selection.'],
  ],
  15: [
    ['What does a visited-set bitmask encode?', 'Which individual elements have been visited', 'Only the number of visited elements', 'The order in which every element was visited', 'Each bit belongs to one element. The mask distinguishes sets of equal size.'],
    ['How do you test whether city j is visited?', '(mask & (1 << j)) != 0', 'mask == j', 'mask + j != 0', 'Bitwise AND isolates that city’s bit.'],
    ['How do you add city j to a visited mask?', 'mask | (1 << j)', 'mask & (1 << j)', 'mask >> j', 'OR sets the selected bit while keeping all other visits unchanged.'],
    ['Why does TSP DP need last city in addition to visited mask?', 'Future travel cost depends on the current endpoint', 'The mask contains no city information', 'It is needed only to print the input', 'Two tours visiting the same set can end in different places with different next-edge costs.'],
    ['For four cities indexed 0..3, which mask means all have been visited?', '15 (1111₂)', '4 (0100₂)', '16 (10000₂)', 'The full mask is (1<<n)-1, setting the lowest n bits.'],
    ['In a TSP cycle starting at city 0, what remains after all cities are visited?', 'Pay the edge returning to city 0', 'Return zero unconditionally', 'Visit every city again', 'A Hamiltonian path and a tour differ by the final return edge.'],
    ['What is the standard Held–Karp DP time complexity?', 'O(n²·2^n)', 'O(2^n) regardless of transitions', 'O(n log n)', 'There are O(n·2^n) mask/endpoint states and up to n next-city choices per state.'],
  ],
  16: [
    ['What does tight=true mean in digit DP?', 'The chosen prefix exactly equals the bound’s prefix', 'The chosen digit must equal 9', 'The whole number has already been completed', 'A smaller prefix can use unrestricted later digits; an equal prefix must respect the next bound digit.'],
    ['Can a prefix that is already smaller than the bound become tight again later?', 'No', 'Yes, by choosing 9', 'Yes, whenever the next digit matches the bound', 'Later digits cannot erase an earlier strict difference between equal-length prefixes.'],
    ['For no-adjacent-equal digit counting, why can a started flag be necessary?', 'Leading padding zeros must not trigger adjacency restrictions', 'Zero is always forbidden', 'The bound is always negative', 'Padding zeros are not real digits of a shorter number. Treat them separately until the number starts.'],
    ['Counting integers in [0,4] with no digit 4 gives what answer?', '4', '3', '5', 'The valid values are 0,1,2,3. Zero is included by the stated range.'],
    ['If f(N) counts valid numbers in [0,N], how is the count in [L,R] obtained?', 'f(R)-f(L-1)', 'f(R)-f(L)', 'f(R)+f(L)', 'Subtract everything strictly below L, preserving L itself if it is valid. Define f(negative)=0.'],
    ['Why is caching by pos alone unsafe when tight changes the allowed suffix?', 'Capped and unrestricted suffixes can have different counts', 'Every position must have a different digit', 'Memoization never works for digit DP', 'The memo key must include every carried condition affecting legal completions.'],
    ['At the end of a valid digit walk, why can a counting base return 1?', 'One valid completion has been formed', 'One extra digit must be appended', 'Every integer has exactly one digit', 'The base counts completed candidates. Additional acceptance conditions, such as positivity, may change it.'],
  ],
  17: [
    ['A knight has eight equally likely moves but only two stay on the board. What probability goes to each legal move?', '1/8 of the current probability', '1/2 of the current probability', 'The full current probability', 'Illegal moves lose probability mass. Renormalizing over legal moves solves a different process.'],
    ['Starting inside the board, what is survival probability after zero moves?', '1', '0', '1/8', 'No move has yet had a chance to leave the board.'],
    ['For a knight on a 1×1 board after one move, what is survival probability?', '0', '1', '1/8', 'All eight possible destinations are outside the board.'],
    ['Can total on-board probability increase after another knight move?', 'No, if leaving the board is absorbing failure', 'Yes, because paths can merge', 'Yes, if the board has an even size', 'Merging paths sums existing probability; it cannot create new mass.'],
    ['Why use a fresh next board for each probability step?', 'To prevent newly updated cells from making an extra move in the same step', 'To round every result to an integer', 'To eliminate all zero probabilities', 'Every transition for step k+1 must use only the distribution after exactly k moves.'],
    ['In a forward distribution, where is the probability of staying anywhere on the board after k moves?', 'Sum of all on-board cells after step k', 'Only the starting square', 'The largest cell', 'Survival accepts every destination still inside the board.'],
    ['When checking floating-point probability results, what comparison is appropriate?', 'A small numerical tolerance', 'Always exact equality after decimal printing', 'Compare rounded integers only', 'Rounding errors can differ between mathematically equivalent computations.'],
  ],
  18: [
    ['In Jump Game VI, which predecessor indices may lead into i?', 'max(0,i-k) through i-1', 'All earlier indices regardless of k', 'i through i+k', 'The jump limit bounds the backward dependency window.'],
    ['For nums=[1,-1,-2,4,-7,3] and k=2, what is the best final score?', '7', '8', '6', 'One optimal path is indices 0→1→3→5: 1-1+4+3=7.'],
    ['What should a monotonic deque store for Jump Game VI?', 'Indices, ordered by decreasing DP score', 'Only input values with no indices', 'Indices sorted by their input values', 'Indices permit expiration by position; DP scores determine which candidate is best.'],
    ['Before computing dp[i], when does the front index expire?', 'When it is less than i-k', 'When it equals i-k', 'Only when it is zero', 'A jump of exactly k is allowed, so index i-k is still valid.'],
    ['Why may a newer candidate remove an older one with no larger DP score?', 'The newer candidate is at least as good and expires no earlier', 'Older indices are always illegal', 'Negative values can always be deleted', 'The old candidate is dominated for every future window in which it could be used.'],
    ['Why is the deque algorithm O(n) despite its inner while loop?', 'Each index is inserted once and removed at most once', 'While loops are constant time', 'The deque never contains more than two entries', 'Amortized analysis charges removals to distinct previous insertions.'],
    ['If the task requires reaching the last index, where is the answer?', 'dp[n-1], even if an earlier score is larger', 'max(dp) across all indices', 'The sum of positive input values', 'The endpoint is forced. Stopping early changes the problem.'],
  ],
};

const stateQuestions = Array.from({ length: 19 }, (_, chapter) => {
  const problem = chapterPractices(chapter)[0];
  const choices = [problem.state, 'The answer for the whole input, regardless of the indices', 'The number of loops already executed', 'The best answer using future states that are not yet solved'];
  const shift = chapter % 4;
  return { id: `state-${chapter}`, category: `Ch ${chapter} · State design`, question: `For ${problem.title}, which state definition matches the recurrence?`, options: choices.map((text, i) => ({ text, correct: i === 0 })).map((_, i, all) => all[(i + shift) % 4]), explanation: `${problem.state}. ${problem.recurrence}` };
});

const chapterDrills = Object.entries(drills).flatMap(([chapter, rows]) => rows.map(([question, answer, trap1, trap2, explanation], index) => {
  const choices = [answer, trap1, trap2].map((text, i) => ({ text, correct: i === 0 }));
  const shift = (Number(chapter) + index) % choices.length;
  return { id: `chapter-${chapter}-trap-${index + 1}`, category: `Ch ${chapter} · Trap drill`, question, explanation, options: choices.map((_, i) => choices[(i + shift) % choices.length]) };
}));

export const CHAPTER_QUIZZES = Object.fromEntries(Array.from({ length: 19 }, (_, chapter) => [chapter,
  [...QUIZ_QUESTIONS, ...stateQuestions, ...chapterDrills].filter(question => chapterOf(question) === chapter),
]));
export const getChapterQuestions = chapter => CHAPTER_QUIZZES[chapter] ?? [];

export function resetChapterMistakes(answers, mistakeIds) {
  const ids = new Set(mistakeIds.map(String));
  return Object.fromEntries(Object.entries(answers).filter(([id]) => !ids.has(id)));
}
