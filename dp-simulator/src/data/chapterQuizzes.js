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

// Append new rows after the original drills so saved question/option IDs stay stable.
const additionalDrills = {
  0: [
    ['Two histories reach the same step, but one has already used its single allowed long jump. Is the step alone a sufficient state?', 'No; also track whether the long jump was used', 'Yes; the position always determines every future choice', 'Yes; keep only the history with fewer moves', 'The remaining legal moves differ. A state must retain the information that affects future choices.'],
    ['If the question asks whether ANY legal route exists, how should alternative predecessor answers be combined?', 'Logical OR', 'Addition of route costs', 'Logical AND', 'One reachable predecessor is enough. AND would require every alternative to be reachable.'],
    ['A counting transition adds two branches that both include the same complete solution. What goes wrong?', 'That solution is counted twice', 'The solution is automatically deduplicated', 'The answer becomes a minimum cost', 'Summing branches counts correctly only when each solution belongs to exactly one branch, or overlap is corrected.'],
    ['A minimum-cost DP has a valid route costing 0 and an unreachable state. May both be represented by 0?', 'No; use a distinct unreachable marker such as infinity', 'Yes; zero always means unreachable', 'Yes; min can distinguish their histories', 'The transition must distinguish a free route from no route at all.'],
    ['A grid DP has R*C states and checks at most two predecessors per state. What is its time complexity?', 'O(R*C)', 'O(R+C)', 'O(2^(R*C))', 'There is constant work per state, so total work scales with the number of cells.'],
    ['A recurrence is correct but reads an unfinished dependency. Which part needs repair?', 'The evaluation order', 'Only the variable names', 'Only the final return statement', 'Even a correct formula produces wrong answers when its required values are not ready.'],
    ['A shortest-route problem gains a rule allowing at most two toll roads. What should you reconsider first?', 'Whether the state tracks toll roads already used', 'Whether every min should become max', 'Whether to sort the road costs', 'A new constraint can distinguish histories previously treated as the same state.'],
  ],
  1: [
    ['Plain fib evaluates fib(n-1) before fib(n-2). With bases 0 and 1, which base is reached first from fib(4)?', 'fib(1)', 'fib(0)', 'fib(2)', 'The first chain is fib(4), fib(3), fib(2), fib(1).'],
    ['For plain Fibonacci with T(0)=T(1)=1 call, which formula counts calls for n>=2?', 'T(n)=1+T(n-1)+T(n-2)', 'T(n)=T(n-1)+T(n-2)', 'T(n)=1+max(T(n-1),T(n-2))', 'Count the current invocation as well as both child subtrees. Maximum would measure a path, not total calls.'],
    ['With F(0)=0 and F(1)=1, what does F(2) return?', '1', '2', '0', 'F(2)=F(1)+F(0)=1+0. The argument is not the result.'],
    ['One child of a recursive call reaches a base case. What happens to an unevaluated sibling needed by the parent?', 'It must still be evaluated', 'It disappears because one branch stopped', 'It automatically has the same answer', 'A base case returns from that invocation; it does not finish every branch of the parent.'],
    ['If recursive Fibonacci evaluates the n-2 child first, what changes for valid n?', 'The visit order changes, but the returned Fibonacci number does not', 'The result doubles', 'Repeated subproblems disappear', 'Addition gives the same result in either child order. Both subtrees are still evaluated.'],
    ['A naive recursive function branches but never revisits the same state. Will memoization necessarily remove much work?', 'No; there may be little repeated work to reuse', 'Yes; it always changes exponential time to linear', 'Yes; it removes all first visits', 'Caching helps when identical subproblems recur; it does not avoid computing distinct states.'],
    ['A staircase counter allows hops 2 and 3. What should a branch with negative remaining steps return?', '0 ways', '1 way', 'The negative remaining distance', 'Overshooting the destination is not a valid completion. Remaining zero, by contrast, contributes one completion.'],
  ],
  2: [
    ['A memo dictionary is recreated inside every recursive invocation. What is lost?', 'Reuse of answers between calls', 'The ability to call the function', 'All base cases', 'The cache must be shared across calls belonging to the same problem instance.'],
    ['There are n distinct states, but each checks n possible choices. What is the memoized time bound?', 'O(n^2)', 'O(n)', 'O(log n)', 'Computing each state once still requires processing all its choices.'],
    ['Does caching only base cases eliminate repeated expansion of non-base Fibonacci states?', 'No; the larger repeated states are still recomputed', 'Yes; bases are the only repeated calls', 'Yes; every caller is implicitly cached', 'A cache entry applies to its own key, not automatically to callers that depend on it.'],
    ['State A recursively asks for B, which asks for A before either finishes. Does ordinary completed-answer memoization alone fix this cycle?', 'No; neither answer is cached yet', 'Yes; the second A is already a completed cache hit', 'Yes; all cycles have answer zero', 'A dependency cycle needs appropriate cycle handling or another formulation; a completed-answer cache is not enough.'],
    ['Only 20 of 1000 possible states are reachable from the requested start. Which states does top-down DP normally evaluate?', 'The reachable states it needs', 'All 1000 regardless of reachability', 'Exactly one state', 'Top-down evaluation follows dependencies from the requested state instead of scanning the whole state space.'],
    ['A cached subset-sum state returns false. What should a later lookup of that exact state do?', 'Reuse false without recomputing', 'Delete it because false is not an answer', 'Replace it with true', 'An impossible subproblem is still a completed result worth caching.'],
    ['A cached function reads an array that is later modified. Is its old cache necessarily valid?', 'No; changing the array can change the answers for the same keys', 'Yes; cached values adapt automatically', 'Yes; array length is the only relevant property', 'Clear or version the cache when external input affecting the recurrence changes.'],
  ],
  3: [
    ['A suffix recurrence reads dp[i+1], with dp[n] known. Which simple fill order works?', 'i from n-1 down to 0', 'i from 0 up to n-1', 'Any order because dp[n] is known', 'Each suffix must be ready before the state immediately before it is computed.'],
    ['With F(0)=0 and F(1)=1, a table loop uses i<n instead of i<=n. For n>=2, which needed cell is omitted?', 'dp[n]', 'dp[0]', 'dp[1]', 'The loop stops before the requested index, leaving the final Fibonacci value uncomputed.'],
    ['A counting recurrence sums three legal predecessors. Why must its accumulator be reset for each new state?', 'Otherwise totals from a different state leak into this one', 'To erase the base cases', 'To force the answer to be zero', 'Each state represents its own set of completions and needs a fresh sum.'],
    ['Ways to climb using only hops 2 or 3 start with ways(0)=1. What is ways(1)?', '0', '1', '2', 'Neither permitted hop can land on step 1 from a nonnegative predecessor.'],
    ['A minimum-cost table initializes every non-base cell to zero although all legal path costs are positive. What can happen?', 'Impossible zero-cost paths can win the minimum', 'Every answer becomes too large', 'Nothing; initialization never affects min', 'Use infinity for unreachable states so only actual paths produce finite candidates.'],
    ['Two states depend only on completed bases and not on each other. Must one particular state be filled first?', 'No; either order respects their dependencies', 'Yes; the smaller answer must come first', 'Yes; only left-to-right is legal', 'A dependency order can have several valid schedules when states are independent.'],
    ['For Fibonacci tabulation, what invariant should hold after completing loop index i?', 'dp[0] through dp[i] contain their correct Fibonacci values', 'Every later cell is already correct', 'All table values equal dp[i]', 'Correct bases establish the invariant, and each transition extends it by one cell.'],
  ],
  4: [
    ['In a one-row right/down grid DP scanned left to right, what does dp[c] hold just BEFORE updating column c?', 'The value from the previous row at column c', 'The current row value from column c-1', 'The final answer for every row', 'The current slot still represents above, while dp[c-1] has already become the current-row left value.'],
    ['Rolling LCS into one row needs the old diagonal. When should it be saved?', 'Before overwriting the old dp[j]', 'After the entire row is overwritten', 'Only when the characters differ', 'Save the previous-row value before replacement so the next column can read its diagonal.'],
    ['For recurrence d[i]=d[i-1]+d[i-3], a ring has three slots. When can slot i%3 be overwritten?', 'After its old value d[i-3] has been read for this transition', 'Before reading any dependency', 'It can never be reused', 'The reused slot still holds a needed predecessor until the new value has been computed.'],
    ['Two variables named previousRow and currentRow refer to the same mutable array. Does swapping their names isolate DP generations?', 'No; both still refer to the same array', 'Yes; different names guarantee different storage', 'Yes; swapping copies every cell', 'Separate generations need separate buffers or a carefully derived in-place update order.'],
    ['A rolling DP needs only the last two values, but the task asks for every prefix answer. Can two numbers alone store all requested outputs?', 'No; the outputs themselves require additional storage or streaming', 'Yes; rolling variables retain every overwritten value', 'Yes; return the last value for all prefixes', 'Auxiliary recurrence storage and storage for the requested output are different requirements.'],
    ['A 0/1 subset-sum update has one item of weight 2 and target 4. What mistake can an ascending one-row scan make?', 'Mark 4 reachable by using the same item twice', 'Mark target 0 unreachable', 'Require a negative item', 'The update at 4 can read the newly updated entry at 2, reusing the current item.'],
    ['A rolled two-term recurrence starts prev2=0 and prev1=1. If n=0, which value is the answer?', 'prev2, or a direct base-case return of 0', 'prev1 because it is always the result', 'prev1+prev2', 'The usual final prev1 return applies only after accounting for the n=0 boundary.'],
  ],
  5: [
    ['Using unlimited coins [1,3,4], what is the minimum number needed for amount 6?', '2', '3', '6', 'Use 3+3. Greedily taking 4 first leads to 4+1+1, which uses more coins.'],
    ['Using unlimited coins [2,4], can amount 7 be formed?', 'No', 'Yes, using two coins', 'Yes, using seven coins', 'Any sum of even coin values is even, so 7 is unreachable.'],
    ['Counting ORDERED sequences of coins [1,2] summing to 3 gives how many?', '3', '2', '1', 'The sequences are [1,1,1], [1,2], and [2,1]. Here order distinguishes solutions.'],
    ['A denomination list [1,1,2] describes coin VALUES, not distinct coin types. What should a combination counter do first?', 'Deduplicate equal denominations', 'Treat both 1 entries as different types', 'Discard denomination 2', 'Duplicate values otherwise count the same value-based combination through multiple type choices.'],
    ['Why must an unlimited-coin recursion reject denomination zero?', 'Taking it leaves the remaining amount unchanged', 'Zero always makes the answer negative', 'Zero removes all other denominations', 'A zero-valued choice prevents progress and can create infinitely many representations in counting variants.'],
    ['For Word Break on catsand with dictionary {cat, cats, and}, is choosing the first matching prefix always safe?', 'No; cat leaves sand, while cats leaves the valid word and', 'Yes; the shortest prefix is always optimal', 'Yes; matching any prefix proves the whole string works', 'Try alternative split points. A valid first word does not guarantee that the remaining suffix is segmentable.'],
    ['In Word Break, s[j:i] is in the dictionary but can[j] is false. Can that split establish can[i]?', 'No; the prefix before the word must also be segmentable', 'Yes; any dictionary substring is sufficient', 'Yes; set every shorter prefix to true', 'A valid final word must attach to an already valid prefix.'],
  ],
  6: [
    ['For [5,-2,3,-10,4], what is the maximum nonempty subarray sum?', '6', '12', '4', 'The best run is [5,-2,3], whose sum is 6. Separate positive runs cannot be joined freely.'],
    ['After processing [4,-6,3], what are the ending-here sum and the best-so-far sum?', '3 and 4', '4 and 4', '3 and 3', 'Ending sums are 4, -2, 3; the earlier global maximum of 4 remains best.'],
    ['For a nonempty maximum-subarray task on the single element [-7], how should the initial best be set?', '-7', '0', '7', 'Initializing to zero would admit an empty run, which this task forbids.'],
    ['An optimal subarray ends before the final index. Does standard Kadane still find it?', 'Yes; the global best is retained separately', 'No; it always returns a suffix', 'Only if all numbers are positive', 'The ending-here state changes at each index, while the global maximum preserves earlier candidates.'],
    ['If the previous ending sum is exactly zero, how do restarting and extending compare numerically?', 'They give the same new sum', 'Extending is always larger', 'Restarting is always larger', 'Both produce nums[i]. A requested tie-break on boundaries would need an explicit rule.'],
    ['For maximum PRODUCT subarray, why is keeping only the maximum ending product insufficient?', 'A negative number can turn a minimum negative product into the maximum', 'Products never depend on signs', 'The maximum product is always a single element', 'Track both extremes because multiplication by a negative value reverses their order.'],
    ['For a minimum-sum nonempty contiguous run, what is the ending-here recurrence?', 'min(nums[i], previousEnding+nums[i])', 'max(nums[i], previousEnding+nums[i])', 'min over all unrelated positive elements', 'The same extend-or-restart choices apply, but the objective chooses the smaller sum.'],
  ],
  7: [
    ['What is the LCS length of AB and BA?', '1', '2', '0', 'Either A or B can be kept, but their opposite order prevents a common subsequence of length two.'],
    ['In longest COMMON SUBSTRING DP, what happens at a character mismatch?', 'The matching suffix length at that cell becomes 0', 'Take the maximum of the upper and left cells', 'Add one to the diagonal', 'A substring must stay contiguous, so a mismatch breaks the common suffix at these endpoints.'],
    ['With unit insert/delete/replace costs, what is the edit distance from cat to cut?', '1', '2', '3', 'Replacing a with u completes the transformation in one edit.'],
    ['What is the unit-cost edit distance from abcd to the empty string?', '4', '0', '1', 'Each of the four characters must be deleted.'],
    ['What is the LCS length of AAA and AA?', '2', '3', '6', 'Each selected position is used once, so the shorter string limits the common subsequence length to two.'],
    ['A longest-common-substring DP has all its cells. Where is its answer?', 'The maximum over all cells', 'Always the bottom-right cell', 'The sum of its diagonal', 'The best common substring can end at any pair of positions, not necessarily at both string ends.'],
    ['A standard LCS table has string lengths m and n and constant work per cell. What is its time complexity?', 'O(m*n)', 'O(m+n)', 'O(2^(m+n))', 'Each pair of prefix lengths gives one state, with constant transition work.'],
  ],
  8: [
    ['In right/down path counting, the starting cell is blocked. What is the answer?', '0', '1', 'The number of columns', 'There is no legal starting path; initializing the blocked start to one would create false routes.'],
    ['For grid [[1,2],[3,4]], what is the minimum right/down path sum including both endpoints?', '7', '8', '5', 'Right then down costs 1+2+4=7; down then right costs 1+3+4=8.'],
    ['A 3x3 grid has its center blocked and no other obstacles. How many right/down paths connect opposite corners?', '2', '6', '0', 'Only the routes along the top/right boundary and the left/bottom boundary avoid the center.'],
    ['In a one-row path counter, what must happen when the current cell is blocked?', 'Set its entry to 0', 'Leave the previous-row count unchanged', 'Set its entry to 1', 'Leaving the old entry would allow paths from above to pass through the blocked cell.'],
    ['Do negative cell costs invalidate right/down minimum-path DP?', 'No; right/down dependencies are still acyclic', 'Yes; every negative value creates a cycle', 'Yes; costs must be sorted first', 'Movement restrictions prevent revisiting a cell, so negative values do not create dependency cycles.'],
    ['A right/down grid gains a legal diagonal down-right move. Which extra incoming dependency is needed?', 'dp[r-1][c-1]', 'dp[r+1][c+1]', 'dp[r][c]', 'Undoing the diagonal final move reaches the upper-left predecessor.'],
    ['A single-cell grid contains cost 9. What is its minimum path sum?', '9', '0', '18', 'Start and destination are the same cell, and its cost is counted once.'],
  ],
  9: [
    ['For nonnegative weights, why can an odd total sum never be split into two equal-sum subsets?', 'Each half would need a noninteger sum', 'Odd numbers cannot appear in subsets', 'Every subset must have even size', 'Equal integer sums add to an even total. This check can reject the instance before DP.'],
    ['In EXACT-fill maximum-value knapsack, how should positive capacities initially be represented before any items?', 'Unreachable, such as negative infinity', 'Zero, as in an at-most-capacity variant', 'The capacity itself', 'With no items only exact weight zero is reachable; empty selections cannot fill positive capacity.'],
    ['With two distinct items of weights [2,2], can 0/1 subset sum reach target 4?', 'Yes; take each item once', 'No; equal weights count as one item', 'Yes; reuse the first item twice', 'The restriction applies to item identities. Distinct items may have equal weights.'],
    ['For weights [2,3], values [4,5], and capacity 3, what is the 0/1 optimum?', '5', '9', '8', 'Only one item fits at a time. Taking the weight-3 item yields value 5.'],
    ['A nonnegative subset-sum problem has items [2,5] and target 3. What is the result?', 'False', 'True because 5-2=3', 'True because one item exceeds 3', 'Subset sum only adds selected items; subtracting one item from another is not a legal choice.'],
    ['When counting index-distinct subsets, what does adding one zero-valued item do to the count for each reachable sum?', 'Doubles it', 'Leaves it unchanged', 'Makes it zero', 'For every previous subset, excluding or including this distinct zero item gives two subsets with the same sum.'],
    ['Knapsack costs O(n*W). If W is written in binary, why is this called pseudopolynomial?', 'Runtime depends on the numeric capacity, not just the bits used to encode it', 'It always runs in O(log W)', 'It solves fractional knapsack only', 'A capacity needing b bits can be nearly 2^b, so an O(W) loop is not polynomial in b.'],
  ],
  10: [
    ['What is the strictly increasing LIS length of [5,4,3,2]?', '1', '4', '0', 'Any singleton works, but no earlier element can precede a later smaller value in an increasing sequence.'],
    ['What is the strictly increasing LIS length of [1,3,2,4]?', '3', '4', '2', 'Both [1,3,4] and [1,2,4] have length three. The dip from 3 to 2 prevents using all four.'],
    ['What should LIS return for an empty input?', '0', '1', '-1', 'There is no element from which to form even a singleton subsequence.'],
    ['In tails for STRICTLY increasing LIS, where should a new value x replace an entry?', 'At the first tail >= x', 'At the first tail > x', 'Always after every equal value', 'Replacing an equal tail prevents duplicates from incorrectly extending the strict subsequence length.'],
    ['For the LONGEST NONDECREASING subsequence, which comparison allows a predecessor j<i?', 'nums[j] <= nums[i]', 'nums[j] < nums[i]', 'nums[j] > nums[i]', 'Nondecreasing allows equality, unlike strictly increasing LIS.'],
    ['When a predecessor produces a strictly longer LIS ending at i, what should the count of best sequences ending at i become?', 'The count from that predecessor', 'The old count plus the predecessor count', 'Always 1', 'Shorter candidates are no longer optimal. Add counts only when another predecessor ties the best length.'],
    ['For [1,3,5,4,7], how many index-distinct longest increasing subsequences exist?', '2', '1', '5', 'The length-four sequences are [1,3,5,7] and [1,3,4,7].'],
  ],
  11: [
    ['After selling on day d with a one-day cooldown, what is the earliest day you may buy again?', 'd+2', 'd+1', 'd+3', 'Day d+1 is the mandatory rest day; buying resumes on d+2.'],
    ['With cooldown and prices [1,2], what is the maximum completed profit?', '1', '0', '2', 'Buy on day zero and sell on day one. No later buy is needed, so cooldown does not reduce this profit.'],
    ['Why may the final answer include the just-sold state?', 'It holds cash and no stock, even if cooldown would restrict a later buy', 'It still holds a share', 'It requires an extra sale', 'Cooldown limits future actions, not the validity of a completed sale on the last day.'],
    ['Using previous-day states, which transition creates soldToday?', 'holdYesterday + priceToday', 'restYesterday + priceToday', 'soldYesterday - priceToday', 'A sale requires a share already held; a resting state cannot sell a share it does not own.'],
    ['A transaction fee f is charged once per completed trade, on sale. Which sale transition is correct?', 'soldToday = holdYesterday + priceToday - f', 'soldToday = holdYesterday + priceToday + f', 'soldToday = holdYesterday + priceToday - 2*f', 'Charging the fee on sale subtracts it exactly once for that transaction.'],
    ['A stock problem now allows at most k completed trades. What additional state is generally needed?', 'The number of trades used or remaining', 'Only the highest historical price', 'Only the day parity', 'Two histories with the same holding status may have different future choices if their trade budgets differ.'],
    ['A stock DP handles a single day and requires selling after buying. With trades optional, what is the best profit?', '0', 'The price on that day', 'The negative of that price', 'No completed buy-then-later-sell trade fits within one day, so choose no transaction.'],
  ],
  12: [
    ['For matrices A:10x30, B:30x5, C:5x60, what is the cheapest total multiplication cost?', '4500', '27000', '3000', '(AB)C costs 10*30*5 + 10*5*60 = 4500. A(BC) costs 30*5*60 + 10*30*60 = 27000.'],
    ['For inclusive matrix interval [l,r] split into [l,k] and [k+1,r], which k values are legal?', 'l through r-1', 'l through r', 'Only k=r', 'Each side must contain a matrix. Splitting at r would leave the right side empty.'],
    ['A chain contains n matrices. How many dimensions are in its usual dimension array?', 'n+1', 'n', '2^n', 'Matrix i has shape dims[i] by dims[i+1], with adjacent matrices sharing a dimension.'],
    ['In open-interval Burst Balloons DP, choosing k last adds which local reward?', 'values[l]*values[k]*values[r]', 'values[k-1]*values[k]*values[k+1] from the original array', 'values[l]+values[k]+values[r]', 'All other balloons inside the interval are gone, so the surviving neighbors are the boundary balloons l and r.'],
    ['With one balloon of value 5 and padded boundary values 1, what is the maximum reward?', '5', '0', '25', 'The single burst earns 1*5*1=5.'],
    ['Why is choosing the locally cheapest matrix-pair multiplication not a general proof of an optimal chain order?', 'It can change the dimensions and costs of later multiplications', 'All parenthesizations cost the same', 'The final matrix dimensions depend on the parenthesization', 'Intermediate products affect subsequent costs, although the final product shape stays fixed. Compare complete split costs.'],
    ['An interval DP minimizes over every legal split k. How are the two subinterval costs combined for a fixed k?', 'Add both costs and the local merge cost', 'Take only the smaller subinterval cost', 'Multiply the two subinterval costs', 'Both subproblems must be performed for that split; only the choice between splits uses min.'],
  ],
  13: [
    ['What is the longest palindromic SUBSEQUENCE length of abca?', '3', '4', '1', 'Keep aba or aca by skipping one interior character. The full string is not a palindrome.'],
    ['What is the longest palindromic SUBSTRING length of abca?', '1', '3', '4', 'No adjacent pair matches and neither length-three window is a palindrome. Skipping interior characters is forbidden.'],
    ['For the two-character string aa, what is the longest palindromic subsequence length?', '2', '1', '0', 'The matching endpoints contribute two characters around an empty interval of length zero.'],
    ['For the string abc, what is the longest palindromic subsequence length?', '1', '2', '3', 'All characters differ, so any one character is optimal.'],
    ['In the usual interval LPS recurrence, which dependencies must be ready before [i,j]?', 'The needed shorter intervals inside [i,j]', 'Only intervals longer than [i,j]', 'Only [0,n-1]', 'Dropping endpoints or enclosing the inner interval requires results on strictly shorter intervals.'],
    ['What is the minimum number of cuts needed to partition aab into palindromic substrings?', '1', '2', '0', 'The partition aa|b uses one cut. Counting the two pieces as two cuts is an off-by-one error.'],
    ['Using only insertions, how many characters must be inserted at minimum to make a length-n string palindromic, if its LPS length is L?', 'n-L', 'L', 'n+L', 'The longest palindromic subsequence is already matched; the other n-L characters can be supplied with partners through insertions.'],
  ],
  14: [
    ['For tree robbery, a root has value 10 and two leaf children have values 1 and 2. What is the optimum?', '10', '13', '3', 'Taking the root excludes both children but beats their combined value of 3.'],
    ['A tree is a chain with values 4 -> 1 -> 5. What is the maximum nonadjacent-node sum?', '9', '10', '5', 'Take the root and grandchild. The exclusion applies to direct parent-child edges, not every ancestor pair.'],
    ['Two sibling nodes have the same value but different descendants. Is caching solely by node value safe?', 'No; the nodes can have different subtree answers', 'Yes; equal values imply equal subtrees', 'Yes; sibling answers must always match', 'Node identity or an equivalent complete subtree state is needed; the node value alone loses structure.'],
    ['For a tree node with many children, how is its take value computed?', 'node.value + sum(skip(child))', 'node.value + max(skip(child))', 'node.value + sum(take(child))', 'Every child must be skipped, and all independent child subtrees contribute to the total.'],
    ['A recursive tree DP has n nodes arranged in a chain. What can its stack depth be?', 'O(n)', 'Always O(log n)', 'O(1)', 'A tree need not be balanced. In a chain, recursive depth grows with the node count.'],
    ['Why can summing child-subtree optima double-count work if the same routine is applied to a graph with shared descendants?', 'The apparent child subtrees may overlap', 'Graphs cannot contain leaf nodes', 'The root value becomes negative', 'The tree recurrence relies on disjoint child subtrees; shared descendants break that independence.'],
    ['Tree robbery allows selecting no nodes, and every node value is negative. What is the best result?', '0', 'The sum of all values', 'The least negative node must be taken', 'Skipping every node is legal and better than any negative total.'],
  ],
  15: [
    ['Cities are numbered from 0. Which cities are in mask 0101 in binary?', 'Cities 0 and 2', 'Cities 1 and 3', 'Only city 5', 'The least significant bit represents city 0; the set bits are positions 0 and 2.'],
    ['For a tour fixed to start at city 0, which visited mask is used initially?', '1 << 0', '0', '(1 << n)-1', 'The starting city is already visited, so bit zero must be set.'],
    ['What happens if mask XOR (1<<j) is used when bit j is already set?', 'It clears bit j', 'It leaves bit j set', 'It sets every lower bit', 'XOR toggles. Use OR when the operation must preserve an already visited city.'],
    ['Three cities have symmetric distances d(0,1)=2, d(1,2)=3, d(0,2)=4. What is the cheapest tour starting and ending at 0?', '9', '5', '6', 'Either tour uses all three edges, costing 2+3+4=9. Stopping at the last new city omits the return edge.'],
    ['There are n tasks and a mask records which are assigned. How many different masks exist?', '2^n', 'n^2', 'n!', 'Each task independently has an unset or set bit. Assignment orders are not encoded by the mask.'],
    ['An assignment DP always assigns workers in order. If mask marks assigned jobs, which worker is next?', 'The worker indexed by the number of set bits in mask', 'The worker indexed by the numeric mask value', 'Always worker 0', 'Exactly one job is assigned per processed worker, so popcount(mask) gives the number of completed workers.'],
    ['A minimum-tour DP represents an absent edge. What cost should that edge contribute?', 'Infinity, or the transition should be skipped', '0', '-1 as a cheap valid edge', 'A missing edge is impossible, not a free or discounted connection.'],
  ],
  16: [
    ['The bound is 325 and tight is true after choosing prefix 3. Which second digits are allowed?', '0 through 2', '0 through 9', 'Only 2', 'Choosing a smaller digit is allowed and makes the prefix loose; exceeding 2 would exceed the bound.'],
    ['The bound is 325, but the first chosen digit is 2. What is the largest allowed second digit?', '9', '2', '5', 'The prefix is already smaller than 3, so later digits are unrestricted by the bound.'],
    ['What is the usual next-tight formula after choosing digit d at position pos?', 'tight && (d == bound[pos])', 'd == bound[pos]', 'tight || (d < bound[pos])', 'Matching the current bound digit preserves tightness only if all earlier digits also matched.'],
    ['How many integers in [0,10] contain no digit 4?', '10', '9', '11', 'There are eleven integers from 0 through 10; only 4 is excluded.'],
    ['While processing padded digits 0,0,7 for the number 7, should the padding pair 0,0 violate a no-adjacent-equal rule?', 'No; leading padding is not part of the represented number', 'Yes; every padded zero is a real digit', 'Yes; all one-digit numbers are invalid', 'The started flag distinguishes padding from actual digits before applying adjacency rules.'],
    ['To count numbers whose digit sum is divisible by 3, what compact running state is sufficient for the sum condition?', 'The digit sum modulo 3', 'Only the previous digit', 'The number of trailing zeros', 'Update remainder to (remainder+d)%3; the acceptance condition needs only this remainder.'],
    ['A digit DP excludes zero and finishes with started=false. How many valid numbers does that terminal state contribute?', '0', '1', '10', 'No nonzero digit was chosen, so the walk represents zero, which the stated problem excludes.'],
  ],
  17: [
    ['A knight starts in a corner of a 3x3 board. What is its survival probability after one random move among all eight directions?', '1/4', '1/2', '1', 'Exactly two of the eight moves stay on the board, giving 2/8=1/4.'],
    ['A knight starts at the center of a 3x3 board. What is its survival probability after one move?', '0', '1', '1/2', 'Every knight move changes one coordinate by two, leaving this board from its center.'],
    ['A cell currently has probability 0.4. One particular knight direction receives what probability mass?', '0.05', '0.4', '0.2', 'Each of eight equally likely directions receives 0.4/8=0.05, whether or not its destination is legal.'],
    ['Two distinct paths end at the same cell at the same time. How should their probabilities combine?', 'Add them', 'Take the larger one', 'Keep only the first path', 'The cell event includes both disjoint path histories, so their masses add.'],
    ['Why does a recursive knight-survival state need movesRemaining as well as row and column?', 'The survival probability can change with the time horizon', 'Coordinates never affect the result', 'Moves remaining is only needed to label the UI', 'Being at the same square with one move left is a different subproblem from being there with five moves left.'],
    ['What is the time complexity of k probability steps on an n-by-n board with eight fixed moves per cell?', 'O(k*n^2)', 'O(8^k)', 'O(k*n)', 'Each step visits n^2 cells and checks a constant eight moves.'],
    ['Starting inside the board, survival after k moves is p and failure is absorbing. What is the probability of having left by then?', '1-p', 'p/8', '1+p', 'Survival and having left are complementary events under this process.'],
  ],
  18: [
    ['In Jump Game VI with k=1, which path is forced?', 'Visit every index in order', 'Jump directly to the end', 'Visit only positive values', 'Every jump advances at most one position, so none of the intermediate indices can be skipped.'],
    ['For nums=[-2,-3,-1] and k=2, what is the best score when both endpoints must be visited?', '-3', '0', '-1', 'Jump directly from index 0 to 2, yielding -2 + -1 = -3. The starting value cannot be omitted.'],
    ['At index i=5 with k=2, which predecessor indices are legal?', '3 and 4', '2, 3, and 4', '4 and 5', 'A predecessor j must satisfy 1 <= i-j <= 2. The current index cannot precede itself.'],
    ['Must a negative DP score always be removed from the deque?', 'No; it can be the best legal predecessor', 'Yes; only positive scores can form a path', 'Yes; replace it with zero', 'A forced path can have negative intermediate scores. Removing all such states may destroy valid paths.'],
    ['Two deque candidates have equal DP scores. Why is retaining only the newer one safe?', 'It provides the same score and remains in future windows at least as long', 'Its input value must be larger', 'Equal scores prove the older index was illegal', 'The newer equal-score candidate dominates the older one by expiration time.'],
    ['Before evaluating dp[i], should index i already be inserted as a possible predecessor?', 'No; compute dp[i] from earlier legal indices first', 'Yes; every state may choose itself', 'Yes; initialize its score to infinity', 'Inserting the current state too early creates an invalid self-dependency.'],
    ['If a transition adds a cost depending on the jump distance i-j, is a deque ordered only by dp[j] automatically valid?', 'No; dominance must be proved for the new transition', 'Yes; every bounded-window recurrence has the same deque optimization', 'Yes; ignore the distance cost', 'The best predecessor may depend on both its score and its distance. The old dominance argument may no longer apply.'],
  ],
};

const stateQuestions = Array.from({ length: 19 }, (_, chapter) => {
  const problem = chapterPractices(chapter)[0];
  const choices = [problem.state, 'The answer for the whole input, regardless of the indices', 'The number of loops already executed', 'The best answer using future states that are not yet solved'];
  const shift = chapter % 4;
  return { id: `state-${chapter}`, category: `Ch ${chapter} · State design`, question: `For ${problem.title}, which state definition matches the recurrence?`, options: choices.map((text, i) => ({ text, correct: i === 0 })).map((_, i, all) => all[(i + shift) % 4]), explanation: `${problem.state}. ${problem.recurrence}` };
});

const chapterDrills = Array.from({ length: 19 }, (_, chapter) => {
  const rows = [...(drills[chapter] ?? []), ...additionalDrills[chapter]];
  return rows.map(([question, answer, trap1, trap2, explanation], index) => {
    const choices = [answer, trap1, trap2].map((text, i) => ({ text, correct: i === 0 }));
    const shift = (chapter + index) % choices.length;
    return { id: `chapter-${chapter}-trap-${index + 1}`, category: `Ch ${chapter} · Trap drill`, question, explanation, options: choices.map((_, i) => choices[(i + shift) % choices.length]) };
  });
}).flat();

export const CHAPTER_QUIZZES = Object.fromEntries(Array.from({ length: 19 }, (_, chapter) => [chapter,
  [...QUIZ_QUESTIONS, ...stateQuestions, ...chapterDrills].filter(question => chapterOf(question) === chapter),
]));
export const getChapterQuestions = chapter => CHAPTER_QUIZZES[chapter] ?? [];

export function resetChapterMistakes(answers, mistakeIds) {
  const ids = new Set(mistakeIds.map(String));
  return Object.fromEntries(Object.entries(answers).filter(([id]) => !ids.has(id)));
}
