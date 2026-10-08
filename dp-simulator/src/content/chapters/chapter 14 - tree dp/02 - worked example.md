# Chapter 14: House Robber on a tree

**Find the most money you can take without taking both a house and its direct child.** Use this tree:

```text
        3       top house
       / \
      2   3
       \   \
        3   1
```

We can take the top `3` and both bottom houses: `3 + 3 + 1 = 7`.

## The two saved answers

For each house, `solve` returns `(take, skip)`. Both totals cover that house and everything below it:

- `take` requires taking this house's money.
- `skip` requires skipping this house, but can still take its descendants.

A missing house returns `(0, 0)`. This lets a real house use the same calculation whether it has zero, one, or two children.

## Calculate children before parents

| House | If we take it | If we skip it | Returned pair |
|---|---:|---:|---|
| Bottom `3` | 3 | 0 | `(3, 0)` |
| Bottom `1` | 1 | 0 | `(1, 0)` |
| Left `2` | `2 + 0` | `max(3, 0)` | `(2, 3)` |
| Right `3` | `3 + 0` | `max(1, 0)` | `(3, 1)` |
| Top `3` | `3 + 3 + 1 = 7` | `max(2, 3) + max(3, 1) = 6` | `(7, 6)` |

The final answer is `max(7, 6) = 7`. Notice that taking the top house uses each child's **skip** answer, not zero. Those answers include money from the grandchildren.

## Runnable Python

A `Node` represents one house. `value` is its money; `left` and `right` are its children. `None` means no house exists there.

```python
class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


def rob_tree(root):
    def solve(node):
        if node is None:
            return 0, 0

        left_take, left_skip = solve(node.left)
        right_take, right_skip = solve(node.right)

        take = node.value + left_skip + right_skip
        skip = max(left_take, left_skip) + max(right_take, right_skip)
        return take, skip

    return max(solve(root))


root = Node(3,
            Node(2, right=Node(3)),
            Node(3, right=Node(1)))
print(rob_tree(root))  # 7
```

The recursive calls finish both children's pairs before calculating the parent's pair. Each house is processed once; no array is needed to store the answers.

**Common mistake:** when skipping a parent, forcing both children to make the same choice. Each branch chooses independently. In this example, skipping the top house means skipping the left `2` but taking the right `3`.

---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 14 · 02 — Worked Example: House Robber III

> Five slots, then the Invariant Lens. New this chapter: the table is a
> **returned pair**, the fill order is **forced** by post-order recursion, and
> the base case is an **absent** node.

---

## The Problem

> ```
>         3
>       /   \
>      2     3
>       \      \
>        3      1
> ```
>
> Rob nodes for their value. You may not rob a node and its direct child.
> Maximise the loot. (Expected: `7` — rob `3 (root) + 3 + 1`.)

---

## Slot 0 — FULCRUM

> **Ask yourself:** "At this node: rob it, or skip it?"

```
ROB v    → both children are FORBIDDEN.
           They must contribute their SKIPPED value.

SKIP v   → both children are FREE.
           Each independently takes whichever mask is better for itself.
```

Two doors, like Chapter 11 — but the sub-answers are **below**, not behind.

```
Ch 11   dp[i-1][mask]     look LEFT along a line
Ch 14   child's (rob,skip) look DOWN into a subtree
```

---

## Slot 1 — STATE

Two sentences per node. `GIVEN` is mandatory (Chapter 11's rule, permanent).

```
rob(v)  = the maximum loot obtainable from the subtree rooted at v,
          GIVEN that v itself IS robbed.
skip(v) = the maximum loot obtainable from the subtree rooted at v,
          GIVEN that v itself is NOT robbed.
```

We return them together as a pair. **That pair is the whole table for this
chapter** — there is no array anywhere.

**Why one number fails:** `best(v) = 12` cannot answer *"may I rob v's
parent?"*. It has merged the robbed world and the skipped world. Third time you
have met this; it should now be automatic.

---

## Slot 2 — TRANSITION

```python
rob(v)  = v.val + skip(left) + skip(right)
skip(v) = max(rob(left), skip(left)) + max(rob(right), skip(right))
```

| English | Symbol |
|---|---|
| "I take this house's money" | `v.val` |
| "so both children must stay unrobbed" | `skip(left) + skip(right)` |
| "each child freely picks its better mask" | `max(rob(c), skip(c))` |
| "the two subtrees share no node, so their loot adds" | `+` between children |

**Choose vs combine, in one line, and the `+` is the subtle one.**

```
skip(v) = max(rob(L), skip(L))  +  max(rob(R), skip(R))
          ^^^^^^^^^^^^^^^^^^^      ^^^^^^^^^^^^^^^^^^^
          CHOOSE: one mask         CHOOSE: one mask
          per child                per child
                          ^^^
                          COMBINE: disjoint subtrees, no double-count
```

> The `+` between the children is legal **only because a tree's branches never
> rejoin.** If the two subtrees could share a node, adding them would count that
> node twice. Hold on to this sentence — Chapter 15 is entirely about what
> happens when the paths *do* cross.

**Mandatory vs optional.** `v.val` is an *optional gain*: it exists only inside
the `rob` branch. That is Chapter 9's shape:

```
Ch 8   grid[r][c] + min(up, left)      mandatory cost,  OUTSIDE
Ch 9   max(leave, take + value)        optional gain,   INSIDE one branch
Ch 14  rob = v.val + ...               optional gain,   INSIDE one branch
       skip = ... (no v.val anywhere)
```

**TRAP — forcing both children into the same mask:**

```python
skip = max(rob(L) + rob(R), skip(L) + skip(R))     # WRONG
```

Nothing in the rule couples the two children. The left subtree may rob its top
while the right skips its own. This under-counts silently.

---

## Slot 3 — BASE CASE  *(Initialization)*

**There is no index 0. The bottom of the recursion is the absent node.**

```python
if node is None:
    return (0, 0)          # (rob, skip)
```

Derive both from their own sentences:

```
rob(None)  = "best loot from an EMPTY subtree, given I rob it"
             There is no node to rob and no loot below.  → 0
skip(None) = "best loot from an EMPTY subtree, given I don't rob it"
             There is nothing below.                      → 0
```

> **Why not `-inf` for `rob(None)`?** Chapter 11 used a sentinel for an
> impossible world. Check how the value is *consumed*: a parent reads
> `skip(child)` and `max(rob(child), skip(child))`. With `rob = 0` the `max` is
> unchanged and every sum stays correct. The empty subtree is not an
> *impossible* world — it is an *empty* one, and empty contributes `0`.
>
> The rule is not "sentinel when it looks impossible". The rule is: **derive
> from the sentence, then check how the parent consumes it.**

Tenth chapter of base cases. Still no two alike:

```
Ch 5  dp[0] = 0                Ch 10 dp[*] = 1
Ch 6  dp[0] = nums[0]          Ch 11 -prices[0] / -inf / 0
Ch 7  row/col of 0s            Ch 12 dp[i][i] = 0
Ch 8  dp[0][0] = grid[0][0]    Ch 13 dp[i][i] = 1, dp[l>r] = 0
Ch 9  dp[0][*] = 0             Ch 14 (0, 0) at the ABSENT node
```

---

## Slot 4 — TERMINATION

> ### `max(rob(root), skip(root))` — **not** `rob(root)`.

The *node* is forced — the answer is at the root, nowhere else. The **mask is
not**. Nothing says the root must be robbed.

```
ENDPOINT FORCED     Ch 5 dp[amount] · Ch 8 dp[R-1][C-1] · Ch 12/13 dp[0][n-1]
ENDPOINT FREE       Ch 6 max(dp)    · Ch 10 max(dp)
LEGAL-END FILTER    Ch 11 max(sold, rest)
FORCED NODE,        Ch 14 max(rob(root), skip(root))
  FREE MASK
```

On the worked tree, robbing the root *is* optimal, so `rob(root)` alone would
return the right number — by luck. The second example below kills it.

---

## Verify By Hand

```
              3            call it R
            /   \
           2     3         call them A (left), B (right)
            \      \
             3      1      call them C (A's right child), D (B's right child)
```

Post-order: **children before parents.** Leaves first.

```
C (val 3, no children)
    rob  = 3 + skip(None) + skip(None) = 3 + 0 + 0 = 3
    skip = max(0,0) + max(0,0)                     = 0
    → (3, 0)

D (val 1, no children)
    rob  = 1 + 0 + 0 = 1
    skip = 0
    → (1, 0)

A (val 2, left = None, right = C)
    rob  = 2 + skip(None) + skip(C) = 2 + 0 + 0 = 2
    skip = max(0,0) + max(rob C, skip C) = 0 + max(3, 0) = 3
    → (2, 3)                    ← skip BEATS rob here: 3 > 2

B (val 3, left = None, right = D)
    rob  = 3 + 0 + skip(D) = 3 + 0 + 0 = 3
    skip = 0 + max(rob D, skip D) = max(1, 0) = 1
    → (3, 1)

R (val 3, left = A, right = B)
    rob  = 3 + skip(A) + skip(B) = 3 + 3 + 1 = 7
    skip = max(rob A, skip A) + max(rob B, skip B)
         = max(2, 3)           + max(3, 1)
         = 3                   + 3            = 6
    → (7, 6)

answer = max(7, 6) = 7      rob R, skip A, skip B, rob C, rob D  →  3 + 3 + 1 = 7
```

> **Look at node `A`: `(2, 3)`.** Its `skip` value beats its `rob` value. That
> is exactly the information a single number would have destroyed — and it is
> what lets `R` choose correctly. `R.rob` consumes `A.skip = 3`, not `A.rob = 2`.

### The second tree — where `rob(root)` alone dies

```
         3
       /   \
      4     5
     / \      \
    1   3      1
```

```
leaves:  (1,0)  (3,0)  (1,0)
node 4:  rob = 4 + 0 + 0 = 4       skip = max(1,0) + max(3,0) = 4      → (4, 4)
node 5:  rob = 5 + 0 = 5           skip = max(1,0) = 1                 → (5, 1)
root 3:  rob  = 3 + skip(4) + skip(5) = 3 + 4 + 1 = 8
         skip = max(4,4) + max(5,1)   = 4 + 5     = 9   ← bigger
answer = max(8, 9) = 9      SKIP the root, rob 4 and 5.
```

**`rob(root)` would have returned `8`. The correct answer is `9`.**
That is the termination trap, caught.

---

## The Code

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def rob_tree(root):
    def solve(node):                                 # returns (rob, skip) for this subtree
        if node is None:                             # BASE: the ABSENT node
            return (0, 0)                            #       empty subtree yields nothing either way
        l_rob, l_skip = solve(node.left)             # post-order: children BEFORE me --
        r_rob, r_skip = solve(node.right)            # this IS the fill order, and it is forced
        rob  = node.val + l_skip + r_skip            # TRANSITION: I take mine -> children forbidden
        skip = max(l_rob, l_skip) + max(r_rob, r_skip)   # TRANSITION: each child picks its OWN best
        return (rob, skip)                           # STATE: the pair is the whole table
    return max(solve(root))                          # TERMINATION: node forced, MASK free

def build(values):
    """Level-order list with None for absent nodes -> TreeNode root."""
    if not values or values[0] is None:
        return None
    nodes = [TreeNode(v) if v is not None else None for v in values]
    kids = iter(nodes[1:])
    for node in nodes:
        if node:
            node.left = next(kids, None)
            node.right = next(kids, None)
    return nodes[0]

print(rob_tree(build([3, 2, 3, None, 3, None, 1])))   # expected: 7
print(rob_tree(build([3, 4, 5, 1, 3, None, 1])))      # expected: 9
print(rob_tree(build([1])))                           # expected: 1
print(rob_tree(build([2, 1, 3, None, 4])))            # expected: 7
print(rob_tree(build([])))                            # expected: 0
```

### The memoised version — and why the pair is better

If you insist on a single-number state, you must memoise or it explodes:

```python
def rob_tree_memo(root):
    memo = {}
    def best(node):                                  # STATE: best loot in this subtree, no mask
        if node is None:
            return 0
        if node in memo:                             # the notebook from Chapter 2
            return memo[node]
        take = node.val
        for child in (node.left, node.right):        # robbing me skips my children...
            if child:
                take += best(child.left) + best(child.right)   # ...so I jump to GRANDCHILDREN
        leave = best(node.left) + best(node.right)
        memo[node] = max(take, leave)
        return memo[node]
    return best(root)

print(rob_tree_memo(build([3, 2, 3, None, 3, None, 1])))   # expected: 7
print(rob_tree_memo(build([3, 4, 5, 1, 3, None, 1])))      # expected: 9
```

> **Both are correct. Only one is honest.**
>
> Remove the `memo` and this version is exponential: a node computes its
> grandchildren, and its children compute those same grandchildren again. The
> subproblems overlap **because the state threw away the mask**.
>
> The `(rob, skip)` version has *nothing to memoise* — each node is visited
> exactly once. **Returning both masks is the memo, folded into the state.**
> When a tree DP needs a cache, that is usually a signal your state is
> under-specified.

---

## The Invariant Lens

| Loop-invariant phase | DP name | What it means here |
|---|---|---|
| **Initialization** | Base Case | `solve(None) = (0, 0)` — the truth known without computation. An empty subtree contributes nothing under either mask. |
| **Maintenance** | Transition | When `solve(v)` computes its pair, `solve(left)` and `solve(right)` have **already returned**. Post-order recursion guarantees it; there is no ordering decision to make. Both masks are composed from final child masks. |
| **Termination** | State (final) | The recursion unwinds to the root, whose pair summarises the entire tree. The answer is `max` over the root's two masks — the node is forced, the mask is not. |

**Source-cell check:**

```
solve(v) reads solve(v.left), solve(v.right)   ← strictly smaller subtrees  ✓
```

> **The whole ordering debate evaporates.** Chapter 12 needed a length loop,
> Chapter 13 needed a descending loop, and both needed a *proof*. Here the call
> stack is the proof: a function cannot return before its callees do.

---

## Debugging With the Lens

```
Exponential / times out on a      -> STATE. You used one number per node and
  deep tree                          forgot the memo. Return the PAIR instead.

Under-counts on wide trees        -> MAINTENANCE. You wrote
                                     max(l_rob + r_rob, l_skip + r_skip),
                                     forcing both children into one mask.

Wrong only when skipping the      -> TERMINATION. You returned rob(root).
  root is optimal                    Test [3,4,5,1,3,null,1]: expect 9, you get 8.

Over-counts (robs parent AND      -> MAINTENANCE. The rob branch used
  child)                             max(l_rob, l_skip) instead of l_skip.

Crash on an empty tree            -> BASE. `None` must return (0, 0), and
                                     max((0,0)) = 0 handles the empty root.

RecursionError on a long chain    -> not a DP bug. Convert to an explicit
                                     stack-based post-order if n is large.
```

---

## Complexity

```
states     = one pair per node          = O(n)
transition = O(1) per node              (two doors, fixed)
TIME  = O(n)  -- every node visited exactly once
SPACE = O(h)  -- the recursion stack; h = tree height
                O(log n) balanced, O(n) degenerate
```

> Compare the chapters. `TIME = states × transition cost`, always:
>
> ```
> Ch 12   O(n²) states × O(n) doors  = O(n³)
> Ch 13   O(n²) states × O(1) doors  = O(n²)
> Ch 14   O(n)  states × O(1) doors  = O(n)
> ```
>
> And note the space line changed meaning: for the first time it is the **call
> stack**, not a table. There is no table to roll.

---

## Sibling: Binary Tree Maximum Path Sum

> Same grove, different question — and the state gets *much* subtler.

A "path" may bend at exactly one node (go up the left, through the node, down
the right). So each node must return something its parent can *extend*, while
separately recording something its parent cannot use.

```python
def max_path_sum(root):
    best = float('-inf')                             # TERMINATION accumulator: the bend may be ANYWHERE

    def gain(node):                                  # STATE: best DOWNWARD chain starting at node
        nonlocal best                                #        (usable by the parent -- ONE child only)
        if node is None:
            return 0                                 # BASE: an absent child offers no chain
        left  = max(gain(node.left), 0)              # a negative branch is refused, not taken
        right = max(gain(node.right), 0)             # -- this max(.., 0) IS the "skip" mask
        best = max(best, node.val + left + right)    # the BEND: both sides + me, NOT returnable
        return node.val + max(left, right)           # returnable: a parent can only extend ONE side

    gain(root)
    return best

print(max_path_sum(build([1, 2, 3])))                 # expected: 6
print(max_path_sum(build([-10, 9, 20, None, None, 15, 7])))   # expected: 42
print(max_path_sum(build([-3])))                      # expected: -3
print(max_path_sum(build([2, -1])))                   # expected: 2
```

> **Two different quantities, and confusing them is the classic bug.**
>
> ```
> node.val + left + right          the best path that BENDS here
>                                  → recorded in `best`, NEVER returned
> node.val + max(left, right)      the best path that CONTINUES upward
>                                  → returned, because a parent can only
>                                    enter and leave through one child
> ```
>
> Return the bent value and you will "build" a path that visits the node twice.
> This is the same discipline as `rob`/`skip`: **decide precisely what a node
> must tell its parent, and what it must merely remember.**
>
> Note the termination is a **survey** (`best`, an accumulator) because the bend
> may be at any node — Chapter 6 and Chapter 10's `max(dp)` in a new costume.

---

## The family roster

| Problem | What each node returns | The twist |
|---|---|---|
| House Robber III | `(rob, skip)` | a 2-mask machine on a tree |
| Max Path Sum | best downward chain | bend recorded, not returned |
| Diameter of Binary Tree | height | bend = `left + right` edges |
| Balanced Binary Tree | height, or `-1` | `-1` is the sentinel for "already failed" |
| Longest Univalue Path | chain length of equal values | children filtered by value |
| Tree Distances / Rerooting | subtree answer, then a second pass | the hard one: two DFS passes |

> The question is always the same: **what fixed-size summary must a node hand
> its parent, so the parent never has to look down twice?**

> Continue to `03 - your challenge.md`.


</details>
