# pattern.md — The DP Pattern Field Guide

> Keep this open whenever you're stuck. Two jobs:
> (A) decide IF a problem is DP, and
> (B) identify WHICH family it belongs to, so you know the shape of the answer.
> This grows as you climb chapters. Bookmark it.

---

## PART A — Is This Even a DP Problem?

Run the 4 signals. The more that fire, the surer you are.

### Signal 1 — Trigger words
```
"how many ways ..."      → counting DP
"minimum / maximum ..."  → optimization DP
"is it possible ..."     → boolean (yes/no) DP
"longest / shortest ..." → optimization DP
```

### Signal 2 — A chain of choices
At each step you decide something, and the decision leaves a SMALLER version of
the same problem. (take/skip, hop 1 or 2, use this coin or not.)

### Signal 3 — Brute force explodes
Your first instinct is "try every combination" and it becomes 2ⁿ or n!.
DP rescues it because those combinations share sub-work.

### Signal 4 — The Two Laws
```
Optimal Substructure   → big answer built from smaller answers
Overlapping Subproblems → same smaller answer needed repeatedly
```
Both true → DP confirmed.

### The 10-second test
> "Can I define the answer for `n` from smaller sizes, AND do those repeat?"
> Yes + Yes → DP.

### When it is NOT DP (don't force it)
```
No repeats (each subproblem unique) → Divide & Conquer (merge sort)
Greedy choice always safe           → Greedy (e.g. activity selection)
Just need to visit nodes            → BFS/DFS, not DP
```

---

## PART B — Which DP Family? (Identify the Shape)

Once you know it's DP, match it to a family. Each family has a typical STATE
and TRANSITION shape so you're not starting from a blank page.

### Family 1 — Linear 1D, one choice per step
```
Feel:       move along a line, decide 1 or 2 (or a small fixed set) each step
Examples:   Fibonacci, Climbing Stairs, House Robber, Min Cost Stairs
STATE:      dp[i] = answer considering up to index i
TRANSITION: dp[i] = f(dp[i-1], dp[i-2], ...)
Signal:     "ways to reach", "max you can take without adjacency"
```

Simple example — Climbing Stairs (ways to reach step n, hop 1 or 2):
Question: "Input n = 4 (a staircase of 4 steps, hop 1 or 2). How many distinct ways to the top?"
```python
def climb(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)              # STATE: dp[i] = number of distinct ways to reach step i
    dp[1] = 1                       # BASE: one route to step 1  -> [1]
    dp[2] = 2                       # BASE: two routes to step 2 -> [1,1], [2]
    for i in range(3, n + 1):       # FULCRUM: "what was my LAST hop?" -> from i-1 or i-2. Only 2 doors.
        dp[i] = dp[i-1] + dp[i-2]   # TRANSITION: two disjoint groups of routes -> add
    return dp[n]                    # ANSWER: the journey must END on step n

print(climb(4))   # expected: 5
print(climb(5))   # expected: 8
```

#### Walkthrough — where STATE ends and TRANSITION begins

Read this once slowly. Every other family uses the exact same five moves.

**1. THE FULCRUM — "what was my LAST hop?"**

Not the first hop. The **last** one. The last decision is the hinge between
"the whole problem" and "a smaller copy of the same problem".

You're standing on step `n`. Where were you one instant ago?
```
  step n-1  ──hop 1──►  step n
  step n-2  ──hop 2──►  step n

Only two possibilities. You can only hop 1 or 2. There is no third door.
```
That sentence IS the pivot. Everything below just rewrites it in symbols.

**2. STATE — name the smaller problem**

The fulcrum made you say "ways to reach step n-1" and "ways to reach step n-2".
Anything you have to say twice deserves a name:
```
dp[i] = the number of distinct ways to reach step i
```
Say it in plain English out loud. If you can't, the state is wrong.
Note `dp[i]` is a COUNT, not a list of routes. We never store the paths.

**3. TRANSITION — the fulcrum, translated**

```
English                                  Symbol
-------------------------------------    ------------
"ways to reach step i-1"                 dp[i-1]
"ways to reach step i-2"                 dp[i-2]
"or"  (two separate groups of routes)    +

        dp[i] = dp[i-1] + dp[i-2]
```
Why `+` and not `*`? The two cases are mutually exclusive — a route ends with
a 1-hop OR a 2-hop, never both. Separate buckets → add.
("do A AND THEN B" would be `*`.)

Why no double-counting? Every route ending in a 1-hop differs from every route
ending in a 2-hop, because the final move differs. Zero overlap.

**4. BASE CASE — where it bottoms out**

The formula is circular until something is known outright. Derive the tiny
cases BY HAND (never copy them from another problem):
```
dp[1] = 1     → one route:   [1]
dp[2] = 2     → two routes:  [1,1]  and  [2]
```

**5. VERIFY by hand before trusting the code**
```
dp[1] = 1
dp[2] = 2
dp[3] = dp[2] + dp[1] = 3
dp[4] = dp[3] + dp[2] = 5     ← matches climb(4)
dp[5] = dp[4] + dp[3] = 8     ← matches climb(5)

Cross-check n=4 by listing routes:
  1+1+1+1 | 1+1+2 | 1+2+1 | 2+1+1 | 2+2   = 5 ✓
```

**Why the code looks the way it does**
```
[0] * (n + 1)      +1 so index n exists (a size-n list stops at n-1)
range(3, n + 1)    build UPWARD: dp[i-1] and dp[i-2] must already be filled
return dp[n]       the journey must END on step n  → NOT max(dp)
                   (contrast Kadane: best run ends anywhere → max(dp))
```

**The click**
```
FULCRUM      "what was my LAST move?"        → gives the branches
    ↓
STATE        dp[i] = ways to reach step i    → names each branch
    ↓
TRANSITION   dp[i] = dp[i-1] + dp[i-2]       → the fulcrum in symbols
    ↓
BASE         dp[1]=1, dp[2]=2                → where it stops
    ↓
ANSWER       dp[n]                           → where the journey must end
```

**Why it's DP at all** — draw the naive recursion for `climb(5)`:
```
              climb(5)
             /        \
       climb(4)      climb(3)
       /     \        /     \
  climb(3) climb(2) climb(2) climb(1)
```
`climb(3)` appears twice, `climb(2)` three times → overlapping subproblems.
The dp array computes each one ONCE: O(2ⁿ) collapses to O(n).

**Space reduction** — `dp[i]` only ever looks 2 slots back, so drop the array:
```python
def climb_o1(n):
    a, b = 1, 2                # STATE, rolled up: a = dp[i-2], b = dp[i-1]
    for _ in range(3, n + 1):
        a, b = b, a + b        # TRANSITION: same dp[i]=dp[i-1]+dp[i-2], window slid forward
    return b if n >= 2 else 1  # ANSWER

print(climb_o1(4))   # expected: 5
print(climb_o1(5))   # expected: 8
```

### Family 2 — Choosing from a SET
```
Feel:       you have a bag of options (coins, words) and pick repeatedly
Examples:   Coin Change (min coins), Coin Change II (count), Word Break
STATE:      dp[amount] or dp[i] = best/count to build target
TRANSITION: loop over each option: dp[x] = combine(dp[x - option])
Signal:     "using these coins/words", "make up an amount/string"
```

Simple example — Coin Change (fewest coins to make amount):
Question: "Input coins = [1, 2, 5], amount = 11. Fewest coins that sum to 11? (-1 if impossible)"
FULCRUM — "what was the LAST coin I dropped in?" If it was `c`, I was at `x - c`
and paid 1 more coin → `dp[x] = min(dp[x], dp[x-c] + 1)`. Try every `c`.
```python
def coin_change(coins, amount):
    dp = [amount + 1] * (amount + 1)   # STATE: dp[x] = fewest coins summing to exactly x (amount+1 = impossible)
    dp[0] = 0                          # BASE: 0 coins make amount 0
    for x in range(1, amount + 1):
        for c in coins:                # FULCRUM: "what was the LAST coin I dropped in?" try every c
            if c <= x:
                dp[x] = min(dp[x], dp[x - c] + 1)   # TRANSITION: state before that coin, +1 coin
    return dp[amount] if dp[amount] != amount + 1 else -1   # ANSWER: must land exactly on amount

print(coin_change([1, 2, 5], 11))   # expected: 3   (5 + 5 + 1)
print(coin_change([2], 3))          # expected: -1  (cannot make 3)
```

### Family 3 — Best contiguous run
```
Feel:       find the best UNBROKEN stretch inside an array
Examples:   Maximum Subarray (Kadane), Max Product Subarray
STATE:      dp[i] = best run ENDING exactly at index i
TRANSITION: dp[i] = max(nums[i], dp[i-1] + nums[i])
Answer:     max(dp)  (not dp[-1] — the best run can end anywhere!)
Signal:     "contiguous", "subarray", "consecutive"
```

Simple example — Maximum Subarray (best contiguous sum):
Question: "Input nums = [3, -1, 4, 1]. Find the contiguous slice with the largest total sum."
FULCRUM — "does the run ending at me EXTEND the previous run, or START fresh at me?"
Two doors only → `dp[i] = max(nums[i], dp[i-1] + nums[i])`.
```python
def max_subarray(nums):
    dp = [0] * len(nums)                         # STATE: dp[i] = best run ENDING exactly at index i
    dp[0] = nums[0]                              # BASE: the only run ending at 0 is nums[0] itself
    for i in range(1, len(nums)):                # FULCRUM: "extend the previous run, or start fresh?"
        dp[i] = max(nums[i], dp[i-1] + nums[i])  # TRANSITION: only 2 doors -> pick the better one
    return max(dp)                               # ANSWER: run ends ANYWHERE -> max(dp), not dp[-1]

print(max_subarray([3, -1, 4, 1]))                 # expected: 7
print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))  # expected: 6
```

### Family 4 — Two sequences compared
```
Feel:       align/compare two strings or arrays
Examples:   Longest Common Subsequence, Edit Distance, Interleaving String
STATE:      dp[i][j] = answer for first i of A and first j of B
TRANSITION: if match: dp[i-1][j-1] (+1); else combine neighbors
Signal:     "two strings", "common", "transform A into B"
```

Simple example — Longest Common Subsequence:
Question: "Input a = 'abcde', b = 'ace'. How long is the longest subsequence present in both?"
FULCRUM — "what happened to the LAST character of each string?" Either they matched
(consume both, +1) or one of them was thrown away (drop from A, or drop from B).
```python
def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]       # STATE: dp[i][j] = LCS of a[:i] vs b[:j] | BASE: 0 row/col
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i-1] == b[j-1]:                     # FULCRUM: "what happened to the LAST char of each?"
                dp[i][j] = dp[i-1][j-1] + 1          # TRANSITION: matched -> consume both, +1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])   # TRANSITION: discard one, try both ways
    return dp[m][n]                                  # ANSWER: both strings fully consumed

print(lcs("abcde", "ace"))   # expected: 3   ("ace")
print(lcs("abc", "xyz"))     # expected: 0   (nothing in common)
```

### Family 5 — Grid / 2D movement
```
Feel:       move through a matrix, usually right/down
Examples:   Unique Paths, Unique Paths II, Minimum Path Sum
STATE:      dp[r][c] = answer to reach cell (r, c)
TRANSITION: dp[r][c] = grid[r][c] + best(dp[r-1][c], dp[r][c-1])
Signal:     "grid", "matrix", "top-left to bottom-right"
```

Simple example — Minimum Path Sum (top-left to bottom-right, move right/down):
Question: "Input grid = [[1,3,1],[1,5,1],[4,2,1]]. Cheapest path top-left to bottom-right, moving only right or down?"
FULCRUM — "which cell did I step FROM to land here?" Only two doors: the cell above
or the cell to the left → `dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])`.
```python
def min_path_sum(grid):
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]                 # STATE: dp[r][c] = cheapest cost to ARRIVE at (r, c)
    dp[0][0] = grid[0][0]                                  # BASE: the start cell costs only itself
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                continue
            top  = dp[r-1][c] if r > 0 else float('inf')   # FULCRUM: "which cell did I step FROM?"
            left = dp[r][c-1] if c > 0 else float('inf')   #          only above or left; inf = no door
            dp[r][c] = grid[r][c] + min(top, left)         # TRANSITION: cheapest door + my own cost
    return dp[rows-1][cols-1]                              # ANSWER: the path must finish bottom-right

print(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))   # expected: 7   (1→3→1→1→1)
```

### Family 6 — Subset / Knapsack (choose to reach a target)
```
Feel:       pick a subset of items to hit a capacity/sum
Examples:   0/1 Knapsack, Partition Equal Subset Sum, Target Sum
STATE:      dp[i][cap] = best using first i items within capacity cap
TRANSITION: dp[i][cap] = max(skip: dp[i-1][cap],
                             take: dp[i-1][cap - w[i]] + v[i])
Signal:     "subset", "capacity", "reach exactly a sum"
```

Simple example — 0/1 Knapsack (max value within weight limit):
Question: "Input weights = [1,3,4], values = [15,20,30], cap = 4. Max value you can carry within capacity 4?"
FULCRUM — "what did I decide about the LAST item?" Take it (pay its weight, gain its
value) or skip it. Two doors, every time → `max(skip, take)`.
```python
def knapsack(weights, values, cap):
    n = len(weights)
    dp = [[0] * (cap + 1) for _ in range(n + 1)]   # STATE: dp[i][w] = max value, first i items, capacity w
    for i in range(1, n + 1):                      # BASE: row 0 and col 0 stay 0 (no items / no capacity)
        for w in range(cap + 1):
            skip = dp[i-1][w]                      # FULCRUM: "what did I decide about item i?"
            take = 0                               #          exactly 2 doors: skip it or take it
            if weights[i-1] <= w:
                take = dp[i-1][w - weights[i-1]] + values[i-1]
            dp[i][w] = max(skip, take)             # TRANSITION: the better of the two doors
    return dp[n][cap]                              # ANSWER: all items considered, full capacity

print(knapsack([1, 3, 4], [15, 20, 30], 4))   # expected: 35   (items 1 + 2)
```

---

## PART B2 — The Advanced Families (7–15)

Families 1–6 carry most easy/medium problems. Families 7–15 are where "hard"
lives. Same drill: recognise the FEEL, then reuse the STATE shape.

### Family 7 — Subsequence with an ordering rule (LIS family)
```
Feel:       pick items in order, each must respect a rule vs the PREVIOUS pick
Examples:   Longest Increasing Subsequence, Russian Doll Envelopes,
            Largest Divisible Subset, Max Length Chain, Box Stacking
STATE:      dp[i] = best subsequence ENDING at index i
TRANSITION: dp[i] = 1 + max(dp[j] for j < i if rule(nums[j], nums[i]))
Answer:     max(dp)   ← like Kadane, the best one can end anywhere
Signal:     "increasing", "each next must be bigger/divisible/fit inside"
Upgrade:    O(n²) → O(n log n) with patience sorting (bisect on tails array)
```

Simple example — Longest Increasing Subsequence:
Question: "Input nums = [10, 9, 2, 5, 3, 7, 101, 18]. Length of the longest strictly increasing subsequence?"
FULCRUM — "which element sat JUST BEFORE me in the subsequence?" Any earlier `j` that
obeys the rule → `dp[i] = 1 + max(dp[j])`. Unlike Kadane, the door isn't fixed at 1;
you must scan all valid `j`.
```python
from bisect import bisect_left

def lis_n2(nums):
    dp = [1] * len(nums)             # STATE: dp[i] = longest increasing subseq ENDING at i | BASE: 1 each
    for i in range(len(nums)):
        for j in range(i):           # FULCRUM: "who sat JUST BEFORE me?" -> scan every earlier j
            if nums[j] < nums[i]:    # the ordering rule (swap this out for other LIS variants)
                dp[i] = max(dp[i], dp[j] + 1)   # TRANSITION: extend the best valid predecessor
    return max(dp)                   # ANSWER: the LIS can end anywhere -> max(dp), not dp[-1]

def lis_fast(nums):
    tails = []                       # STATE: tails[k] = smallest possible tail of an LIS of length k+1
    for x in nums:
        p = bisect_left(tails, x)    # FULCRUM: "which length does x best extend?"
        if p == len(tails):
            tails.append(x)          # TRANSITION: x extends the longest chain so far
        else:
            tails[p] = x             # TRANSITION: x makes that length cheaper to extend later
    return len(tails)                # ANSWER: len(tails) IS the LIS length

print(lis_n2([10, 9, 2, 5, 3, 7, 101, 18]))    # expected: 4   (2,3,7,18)
print(lis_fast([10, 9, 2, 5, 3, 7, 101, 18]))  # expected: 4
```

### Family 8 — State machine (you are always in one MODE)
```
Feel:       at each step you're in a named state, and states transition
Examples:   Best Time to Buy/Sell Stock (cooldown, fee, k transactions),
            Paint House, Regex Matching, "no 3 consecutive" counting
STATE:      dp[i][s] = best answer at step i while in state s
TRANSITION: draw the state diagram FIRST, then copy each arrow into code
Signal:     "you may hold at most one", "cooldown", "at most k times"
Tip:        the number of states is small and fixed → O(n · states)
```

Simple example — Stock with cooldown (hold / sold / rest):
Question: "Input prices = [1, 2, 3, 0, 2]. Max profit, unlimited trades, but 1-day cooldown after selling?"
FULCRUM — "which MODE was I in yesterday, and which arrow led me here?" Each state has
a short list of incoming arrows; copy one arrow per line of code.
```python
def max_profit_cooldown(prices):
    hold = float('-inf')   # STATE: best profit while currently owning a share
    sold = float('-inf')   # STATE: best profit having sold today (tomorrow is a cooldown)
    rest = 0               # STATE + BASE: free to buy, nothing earned yet
    for p in prices:
        prev_hold, prev_sold, prev_rest = hold, sold, rest   # FULCRUM: "which MODE was I in YESTERDAY?"
        hold = max(prev_hold, prev_rest - p)   # TRANSITION: stay hold, or rest --buy--> hold
        sold = prev_hold + p                   # TRANSITION: hold --sell--> sold
        rest = max(prev_rest, prev_sold)       # TRANSITION: stay rest, or sold --cooldown over--> rest
    return max(sold, rest)                     # ANSWER: never end the day still holding a share

print(max_profit_cooldown([1, 2, 3, 0, 2]))   # expected: 3   (buy1 sell3, buy0 sell2)
```

### Family 9 — Interval DP (split a range into two)
```
Feel:       the answer for a range depends on WHERE you cut it
Examples:   Matrix Chain Multiplication, Burst Balloons, Minimum Cost Tree,
            Stone Game variants, Optimal BST
STATE:      dp[i][j] = best answer for the subarray i..j
TRANSITION: dp[i][j] = best over k in (i..j) of dp[i][k] + dp[k][j] + cost(i,k,j)
Loop order: BY LENGTH, shortest ranges first (never plain i then j!)
Signal:     "merge", "burst", "split", "combine adjacent", answer is dp[0][n-1]
Complexity: usually O(n³)
```

Simple example — Matrix Chain Multiplication:
Question: "Input dims = [10, 30, 5, 60] (matrices 10x30, 30x5, 5x60). Minimum scalar multiplications to multiply the chain?"
FULCRUM — "which multiplication happens LAST?" That final cut at `k` splits the range
into two independent halves → `dp[i][k] + dp[k+1][j] + cost`. Try every `k`.
```python
def matrix_chain(dims):
    n = len(dims) - 1                  # number of matrices
    dp = [[0] * n for _ in range(n)]   # STATE: dp[i][j] = min multiplies to collapse i..j | BASE: single = 0
    for length in range(2, n + 1):     # SHORTEST ranges FIRST, so the inner halves already exist
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float('inf')
            for k in range(i, j):      # FULCRUM: "which multiplication happens LAST?" -> cut at k
                cost = dp[i][k] + dp[k+1][j] + dims[i] * dims[k+1] * dims[j+1]   # TRANSITION: halves + final
                dp[i][j] = min(dp[i][j], cost)
    return dp[0][n-1]                  # ANSWER: the entire range, collapsed

print(matrix_chain([10, 30, 5, 60]))   # expected: 4500   ((A·B)·C)
```

### Family 10 — Palindromes & string partitioning
```
Feel:       expand/shrink from both ends of ONE string, or cut it into pieces
Examples:   Longest Palindromic Subsequence/Substring, Palindrome Partitioning II,
            Count Palindromic Substrings, Word Break II
STATE:      dp[i][j] = is/what about substring i..j      (interval-style)
            OR cuts[i] = min cuts for prefix of length i  (linear-style)
TRANSITION: s[i]==s[j] and dp[i+1][j-1] → dp[i][j] true
Loop order: i from the END downward, or by length (need the inner range first)
Signal:     "palindrome", "partition the string", "cut into valid pieces"
```

Simple example — Longest Palindromic Subsequence:
Question: "Input s = 'bbbab'. Length of the longest palindromic subsequence?"
FULCRUM — "do the two OUTERMOST characters match?" If yes, keep both and shrink inward
(+2). If no, one of them must be thrown away → drop the left or drop the right.
```python
def lps(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]   # STATE: dp[i][j] = longest palindromic subseq inside s[i..j]
    for i in range(n - 1, -1, -1):     # i goes BACKWARD so dp[i+1][...] is already computed
        dp[i][i] = 1                   # BASE: a single char is a palindrome of length 1
        for j in range(i + 1, n):
            if s[i] == s[j]:                             # FULCRUM: "do the two OUTERMOST chars match?"
                dp[i][j] = dp[i+1][j-1] + 2              # TRANSITION: keep both ends, shrink inward
            else:
                dp[i][j] = max(dp[i+1][j], dp[i][j-1])   # TRANSITION: throw one end away
    return dp[0][n-1]                  # ANSWER: the whole string

print(lps("bbbab"))   # expected: 4   ("bbbb")
print(lps("cbbd"))    # expected: 2   ("bb")
```

### Family 11 — Tree DP (DP along a DFS)
```
Feel:       answer for a node is built from answers of its CHILDREN
Examples:   House Robber III, Tree Diameter, Max Path Sum, Min Camera Cover,
            Independent Set on a tree
STATE:      dp[node][k] = answer for the subtree rooted at node, in mode k
TRANSITION: post-order DFS: compute children first, then combine upward
Answer:     dp[root][...]  OR a global max updated during the DFS
Signal:     "tree", "subtree", "no two adjacent nodes", "root to leaf"
Warning:    two different answers exist — "best in subtree" vs "best path
            through this node". Keep them separate.
```

Simple example — House Robber III (no two directly-linked houses):
Question: "Tree = 3 with children 2 and 3; 2 has right child 3; root's right child 3 has right child 1. Max sum with no two adjacent nodes?"
FULCRUM — "did I rob THIS node or not?" Robbing it forbids both children; skipping it
frees each child to do its own best. So every node returns TWO numbers, not one.
```python
class Node:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def rob_tree(root):
    def dfs(node):
        if not node:
            return (0, 0)              # STATE: (best if I ROB node, best if I SKIP it) | BASE: empty = (0,0)
        lr, ls = dfs(node.left)        # children FIRST (post-order) — answers flow upward
        rr, rs = dfs(node.right)
        rob  = node.val + ls + rs          # FULCRUM: "rob THIS node?" TRANSITION: yes -> children skipped
        skip = max(lr, ls) + max(rr, rs)   # TRANSITION: no -> each child free to do its own best
        return (rob, skip)
    return max(dfs(root))              # ANSWER: better of the two modes at the root

tree = Node(3, Node(2, None, Node(3)), Node(3, None, Node(1)))
print(rob_tree(tree))   # expected: 7   (3 + 3 + 1)
```

### Family 12 — Bitmask DP (the state IS a subset)
```
Feel:       n is TINY (n <= 20-22) and you must track WHICH items are used
Examples:   Travelling Salesman, Assignment Problem, Shortest Superstring,
            Partition to K Equal Sum Subsets, Matching / pairing problems
STATE:      dp[mask][i] = best having visited set `mask`, currently at i
TRANSITION: for each unused bit j: dp[mask | 1<<j][j] = dp[mask][i] + cost(i,j)
Signal:     "n <= 20", "visit every ...", "assign each person a task"
Complexity: O(2ⁿ · n²) — the tiny n is the giveaway that this is intended
Bit tricks: mask & (1<<j)  test | mask | (1<<j)  set | mask & ~(1<<j)  clear
```

Simple example — Travelling Salesman (shortest tour from city 0):
Question: "4 cities with the given distance matrix. Shortest route visiting every city once and returning to city 0?"
FULCRUM — "which city did I stand on JUST BEFORE arriving here?" Knowing the set I've
already burned (`mask`) plus where I am (`i`) is enough — the ORDER inside the mask
no longer matters. That collapse from n! to 2ⁿ is the whole win.
```python
def tsp(dist):
    n = len(dist)
    FULL = (1 << n) - 1
    dp = [[float('inf')] * n for _ in range(1 << n)]   # STATE: dp[mask][i] = cheapest route covering mask, now at i
    dp[1][0] = 0                            # BASE: on city 0, only city 0 visited, cost 0
    for mask in range(1 << n):              # masks ascend, so smaller visited-sets always finish first
        for i in range(n):
            if dp[mask][i] == float('inf') or not (mask & (1 << i)):
                continue                    # unreachable state, or i isn't actually inside this set
            for j in range(n):              # FULCRUM: "which city do I step to next?"
                if mask & (1 << j):
                    continue                # already burned
                nxt = mask | (1 << j)
                dp[nxt][j] = min(dp[nxt][j], dp[mask][i] + dist[i][j])   # TRANSITION (push forward)
    return min(dp[FULL][i] + dist[i][0] for i in range(1, n))   # ANSWER: all visited + hop home

d = [[0, 10, 15, 20],
     [10, 0, 35, 25],
     [15, 35, 0, 30],
     [20, 25, 30, 0]]
print(tsp(d))   # expected: 80   (0→1→3→2→0)
```

### Family 13 — Digit DP (count numbers with a digit rule)
```
Feel:       "how many numbers in [L, R] satisfy some DIGIT condition"
Examples:   count numbers without a '4', with digit sum divisible by k,
            with no two equal adjacent digits, numbers at most N
STATE:      dp[pos][tight][extra...]  built digit by digit, left to right
            tight = are we still hugging the upper bound N?
TRANSITION: for each allowed digit d at this position, recurse to pos+1
Trick:      answer for [L, R] = f(R) - f(L - 1)
Signal:     huge ranges (up to 10^18) but the RULE is about the digits
```

Simple example — count numbers in [1, N] that contain no digit '4':
Question: "Input N = 100. How many integers from 1 to 100 contain no digit 4?"
FULCRUM — "what digit do I write at THIS position?" The only thing the future cares
about is whether I'm still hugging the bound (`tight`) and whether I've started yet.
Everything to the left collapses into those flags.
```python
from functools import lru_cache

def count_no_four(n):
    s = str(n)

    @lru_cache(None)                        # STATE: go(pos,tight,started) = valid endings from here on
    def go(pos, tight, started):            #        (the memo table IS the dp array)
        if pos == len(s):
            return 1 if started else 0      # BASE: a finished number counts (skip the empty one)
        limit = int(s[pos]) if tight else 9 # tight -> cannot exceed N's digit at this position
        total = 0
        for d in range(0, limit + 1):       # FULCRUM: "what digit do I write at THIS position?"
            if d == 4:
                continue                    # the rule being enforced
            total += go(pos + 1, tight and d == limit, started or d > 0)   # TRANSITION: carry only what matters
        return total

    return go(0, True, False)               # ANSWER: start at the leftmost digit, still hugging N

print(count_no_four(100))   # expected: 81   (19 of 1..100 contain a '4')
```

### Family 14 — Probability / Expected value DP
```
Feel:       outcomes are random; you want a probability or an average
Examples:   Knight Probability on Chessboard, Soup Servings, New 21 Game,
            dice-roll expectations
STATE:      dp[step][state] = probability of being in `state` after `step`
TRANSITION: dp[next] += dp[cur] * p(cur → next)      (weights sum to 1)
Expected:   E[state] = sum over moves of p(move) * (cost + E[next state])
Signal:     "probability that", "expected number of", "on average"
Trap:       probabilities must total 1 — if they don't, your model is wrong.
```

Simple example — Knight Probability on an N×N board:
Question: "Input n = 3, k = 2, start (0, 0). Probability a knight is still on the board after 2 random moves?"
FULCRUM — "which square was I on one move ago?" Same question as always, but each door
carries a WEIGHT (1/8) instead of counting as 1 → multiply, then add.
```python
def knight_probability(n, k, row, col):
    moves = [(1,2),(2,1),(-1,2),(-2,1),(1,-2),(2,-1),(-1,-2),(-2,-1)]
    dp = [[0.0] * n for _ in range(n)]       # STATE: dp[r][c] = probability of standing on (r, c) right now
    dp[row][col] = 1.0                       # BASE: certainly on the start square before any move
    for _ in range(k):                       # one whole layer per move
        nxt = [[0.0] * n for _ in range(n)]
        for r in range(n):
            for c in range(n):
                if dp[r][c] == 0.0:
                    continue
                for dr, dc in moves:         # FULCRUM: "where do I jump next?" — 8 WEIGHTED doors
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < n and 0 <= nc < n:
                        nxt[nr][nc] += dp[r][c] / 8.0   # TRANSITION: multiply by p, then accumulate
        dp = nxt                             # off-board probability is simply never carried over
    return sum(map(sum, dp))                 # ANSWER: total probability mass still on the board

print(round(knight_probability(3, 2, 0, 0), 5))   # expected: 0.0625
```

### Family 15 — Optimized DP (same recurrence, faster transition)
```
Feel:       you HAVE a correct O(n²)/O(n³) DP but the limits demand faster
When:       n = 10^5 with an O(n²) recurrence → the transition must be sped up
Toolbox:
  prefix sums         dp[i] = sum of a window of dp  → O(1) per state
  monotonic deque     dp[i] = max/min over a sliding window  → O(1) amortized
  bisect / BIT / segtree  dp[i] = best over dp[j] with j matching a range
  bitset              boolean subset-sum, /64 speedup (Python: use big ints!)
  D&C optimization    opt[i] is monotonic → O(n² log n) → cuts a factor of n
  Knuth optimization  interval DP where opt[i][j-1] <= opt[i][j] <= opt[i+1][j]
  Convex Hull Trick   dp[i] = min(m_j * x_i + b_j) → lines, O(n log n)
Signal:     the naive DP is correct but TLEs; the recurrence has a clean
            "min/max/sum over a contiguous range of previous dp" shape.
```

Simple example — sliding-window max (the deque trick behind many speedups):
Question: "Input nums = [1, 3, -1, -3, 5, 3, 6, 7], window k = 3. Max of every window of size 3?"
FULCRUM — not "what was my last move?" but "can an OLDER, SMALLER value ever win again?"
No — so throw it away forever. That one insight turns an O(nk) scan into O(n).
```python
from collections import deque

def sliding_window_max(nums, k):
    dq = deque()                      # STATE: INDICES still able to win; their values stay decreasing
    out = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:   # FULCRUM: "can an OLDER, SMALLER value ever win again?" No.
            dq.pop()                      # TRANSITION (maintain): purge the dominated tail
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()                  # TRANSITION (maintain): the front expired out of the window
        if i >= k - 1:
            out.append(nums[dq[0]])       # ANSWER per window: the front is always the maximum
    return out

print(sliding_window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))
# expected: [3, 3, 5, 5, 6, 7]
```

Bonus — Python's bitset trick for subset-sum (Family 6 at huge scale):
Question: "Input nums = [3, 34, 4, 12, 5, 2], target = 9. Is some subset summing to exactly 9?"
FULCRUM — same as knapsack: "take this number or skip it?" But the whole boolean dp
row lives inside ONE integer, so `take` for every sum at once is a single `<< x`.
```python
def subset_sum_bitset(nums, target):
    bits = 1                          # STATE: bit s set = sum s reachable | BASE: only sum 0 reachable
    for x in nums:                    # FULCRUM: "take x or skip it?" - both doors, for every sum at once
        bits |= bits << x             # TRANSITION: skip = bits, take = bits shifted up by x
    return (bits >> target) & 1 == 1  # ANSWER: is the target bit set?

print(subset_sum_bitset([3, 34, 4, 12, 5, 2], 9))   # expected: True   (4+5)
print(subset_sum_bitset([1, 2, 5], 4))              # expected: False
```

---

## PART B3 — The Family Decision Tree

```
Is the input a TREE or GRAPH?
 ├── tree, answers flow child → parent .............. Family 11 (Tree DP)
 └── graph + must visit ALL nodes, n <= 20 .......... Family 12 (Bitmask)

Is the input TWO sequences? ......................... Family 4 (Two-sequence)

Is the input ONE sequence/array?
 ├── contiguous stretch ............................. Family 3 (Kadane)
 ├── ordered picks with a rule vs previous .......... Family 7 (LIS)
 ├── cut the range at k, combine halves ............. Family 9 (Interval)
 ├── you're in a MODE each step ..................... Family 8 (State machine)
 └── one choice per step, fixed hops ................ Family 1 (Linear 1D)

Is the input a GRID? ................................ Family 5 (Grid)

Is the input a SET of items + a target?
 ├── each item used ONCE ............................ Family 6 (0/1 Knapsack)
 └── items reusable infinitely ...................... Family 2 (Unbounded/Set)

Is the input ONE string, compared with itself? ...... Family 10 (Palindrome)

Is the input a huge NUMBER RANGE with a digit rule? . Family 13 (Digit DP)

Are the outcomes RANDOM? ............................ Family 14 (Probability)

Correct DP but too slow? ............................ Family 15 (Optimization)
```

---

## PART B4 — Complexity Cheat Sheet

```
+---------------------------+---------------+---------------------------------+
| Family                    | Typical time  | Space (after optimization)      |
+---------------------------+---------------+---------------------------------+
| 1  Linear 1D              | O(n)          | O(1)  (keep 2 variables)        |
| 2  Set / Unbounded        | O(n · target) | O(target)                       |
| 3  Kadane                 | O(n)          | O(1)                            |
| 4  Two sequences          | O(m · n)      | O(min(m, n))  (roll one row)    |
| 5  Grid                   | O(R · C)      | O(C)          (roll one row)    |
| 6  0/1 Knapsack           | O(n · cap)    | O(cap)  (iterate cap DOWNWARD)  |
| 7  LIS                    | O(n²)/O(n lg n)| O(n)                           |
| 8  State machine          | O(n · states) | O(states)                       |
| 9  Interval               | O(n³)         | O(n²)                           |
| 10 Palindrome             | O(n²)         | O(n²)                           |
| 11 Tree DP                | O(V)          | O(height)  (recursion stack)    |
| 12 Bitmask                | O(2ⁿ · n²)    | O(2ⁿ · n)                       |
| 13 Digit DP               | O(digits·10·S)| O(digits · S)                   |
| 14 Probability            | O(steps·states)| O(states)                      |
| 15 Optimized              | shaves one n  | varies                          |
+---------------------------+---------------+---------------------------------+
```

---

## PART C — The Universal Attack Plan

No matter the family, once identified:

```
1. REFLEX:      "what was the LAST decision?"  → gives your branches
2. STATE:       write dp[...] meaning in PLAIN ENGLISH
3. TRANSITION:  combine smaller dp's (trust the genie)
4. BASE CASE:   smallest answers you know directly
5. VERIFY:      trace by hand on a tiny input
6. CODE:        top-down first (natural), then bottom-up (fast)
7. ANSWER:      is it dp[-1], dp[n], or max(dp)? Think about WHERE it ends.
```

### The Fulcrum, per family (the question that unlocks the transition)

Step 1 above is the hinge. Ask the right version of it and the recurrence
writes itself. This is the whole cheat sheet in one screen:

```
 1 Linear 1D    "what was my LAST hop?"              → came from i-1 or i-2
 2 Set/Coins    "what was the LAST coin I used?"     → came from x - c, +1
 3 Kadane       "extend the run, or start fresh?"    → 2 doors only
 4 Two seq      "last char of each: match or drop?"  → diagonal, or up/left
 5 Grid         "which cell did I step FROM?"        → above or left
 6 Knapsack     "last item: take it or skip it?"     → 2 doors per item
 7 LIS          "who sat JUST BEFORE me?"            → scan all valid j
 8 State mach.  "which MODE was I in yesterday?"     → one arrow per line
 9 Interval     "which operation happens LAST?"      → the cut at k
10 Palindrome   "do the two OUTER chars match?"      → shrink, or drop one
11 Tree DP      "did I take THIS node or not?"       → 2 values per node
12 Bitmask      "which item did I use LAST?"         → mask + position
13 Digit DP     "what digit goes at THIS position?"  → still tight? started?
14 Probability  "where was I one step ago?"          → same, but weighted
15 Optimized    "can an old candidate EVER win again?" → if no, discard it
```

Two universal follow-ups after the fulcrum:
```
"How many doors are there?"   few & fixed → O(1) transition (families 1,3,5,6,8)
                              must scan   → O(n) transition (families 2,7,9,12)

"What must I REMEMBER so the past stops mattering?"   ← that IS your state.
     If two paths reach the same state but face different futures,
     the state is missing a dimension. (TRAP 16)
```

---

## PART D — Quick Lookup Table

```
+-------------------------------+---------------------------+------------------+
| Problem sounds like...        | Family                    | Answer location  |
+-------------------------------+---------------------------+------------------+
| "ways to climb / reach"       | 1D linear                 | dp[n]            |
| "max money, no adjacent"      | 1D linear (House Robber)  | dp[-1]           |
| "fewest coins for amount"     | Set (Coin Change)         | dp[amount]       |
| "best contiguous sum"         | Kadane                    | max(dp)          |
| "longest common / edit dist"  | Two sequences (2D)        | dp[m][n]         |
| "paths in a grid"             | Grid (2D)                 | dp[R-1][C-1]     |
| "subset reaching a sum"       | Knapsack                  | dp[N][target]    |
| "longest increasing / chain"  | LIS (Family 7)            | max(dp)          |
| "buy/sell, cooldown, at most k"| State machine (8)        | dp[n-1][free]    |
| "burst / merge / split range" | Interval (9)              | dp[0][n-1]       |
| "palindrome, partition string"| Palindrome (10)           | dp[0][n-1]       |
| "subtree, no two adjacent"    | Tree DP (11)              | max(dfs(root))   |
| "visit all, n <= 20"          | Bitmask (12)              | dp[FULL][*]      |
| "count numbers up to 10^18"   | Digit DP (13)             | f(R) - f(L-1)    |
| "probability / expected"      | Probability (14)          | sum(dp) or E[0]  |
| "correct DP but TLE"          | Optimization (15)         | same, faster     |
+-------------------------------+---------------------------+------------------+
```

---

## PART E — Traps That Fool Beginners

```
TRAP 1: No overlapping subproblems → NOT DP (e.g. factorial). Memory won't help.
TRAP 2: Kadane's answer is max(dp), NOT dp[-1]. Best run can end anywhere.
TRAP 3: Base case copied from a previous problem. ALWAYS re-derive per problem.
TRAP 4: Greedy looks like DP but a local choice may not be globally optimal.
        (Coin Change with odd coin sets breaks greedy — must use DP.)
```

### Advanced traps (families 7–15)

```
TRAP 5:  LIS answer is max(dp), not dp[-1] — same mistake as Kadane.
TRAP 6:  Interval DP looped as plain `for i: for j:` is WRONG. Loop BY LENGTH,
         so the inner ranges dp[i][k] and dp[k+1][j] already exist.
TRAP 7:  0/1 Knapsack rolled to 1D must iterate capacity DOWNWARD. Upward turns
         it into unbounded knapsack (each item reused).
TRAP 8:  Unbounded knapsack COUNTING: coins in the outer loop → combinations;
         amount in the outer loop → permutations. Different answers!
TRAP 9:  Tree DP confuses "best inside this subtree" with "best path through
         this node". Return one, track the other as a global.
TRAP 10: Bitmask DP with n > 22 will not fit. If n is large, it's NOT bitmask —
         you misread the family.
TRAP 11: Digit DP forgetting the `started` (leading-zero) flag counts phantom
         numbers like 007 as valid 3-digit numbers.
TRAP 12: Expected-value DP written as "average of dp[next]" when the branches
         have UNEQUAL probabilities. Always weight by p.
TRAP 13: Memoizing on a MUTABLE key (list, dict) — use tuples or plain ints.
TRAP 14: lru_cache on a recursion deeper than ~1000 → RecursionError.
         Raise the limit or convert to bottom-up.
TRAP 15: Using float('inf') as "impossible" and then adding to it silently
         produces inf — guard before you add, or use a large sentinel int.
TRAP 16: State missing a dimension. If two different paths reach the "same"
         state with different futures, the state is under-specified.
```

---

## PART F — Mastery Ladder (how to actually get to hard)

```
STAGE 1  Families 1-3    Fibonacci, Climb Stairs, House Robber, Coin Change,
                         Word Break, Kadane, Max Product Subarray
STAGE 2  Families 4-6    LCS, Edit Distance, Unique Paths II, Min Path Sum,
                         Partition Equal Subset Sum, Target Sum
STAGE 3  Families 7-8    LIS (both versions), Russian Doll Envelopes,
                         Stock with cooldown / fee / k transactions, Paint House
STAGE 4  Families 9-11   Burst Balloons, Matrix Chain, Palindrome Partition II,
                         Longest Palindromic Subsequence, House Robber III,
                         Binary Tree Max Path Sum
STAGE 5  Families 12-14  TSP, Partition to K Equal Sum Subsets,
                         Shortest Superstring, digit-count problems,
                         Knight Probability, New 21 Game, Soup Servings
STAGE 6  Family 15       Sliding-window-max DP, Jump Game VI, Constrained
                         Subsequence Sum, CHT / Knuth / D&C optimization
```

Drill for every problem, in this exact order:
```
1. Name the family out loud BEFORE writing code.
2. Write dp[...] meaning in one English sentence.
3. Write the recurrence on paper.
4. Solve top-down with memo.
5. Convert to bottom-up.
6. Reduce the space.
7. State the time/space complexity.
```
If you cannot do step 1 in 30 seconds, re-read PART B3.

---

> All 15 families are now covered — that is the full working taxonomy of DP.
> When a problem stumps you: run PART A (is it DP?), then PART B / B3
> (which family?), then PART C (attack). This guide is your compass.
