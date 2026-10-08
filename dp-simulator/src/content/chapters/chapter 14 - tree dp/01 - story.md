# Chapter 14: Solve a tree from the bottom up

**At each house, calculate two answers: the best total if you take its money, and the best total if you skip it.**

The houses form a tree. A house directly below another is its **child**; the house above is its **parent**. You cannot take money from both a parent and its direct child. Grandparent and grandchild are allowed.

## A small example

```text
      3
     / \
    2   3
     \   \
      3   1
```

Take the top `3` and the bottom `3` and `1`. They do not share a parent-child connection, so the total is **7**.

## What do we remember?

A **subtree** means one house and all the houses below it. For each subtree, return two numbers:

- `take`: the best total when we take money from its top house.
- `skip`: the best total when we skip its top house.

We need both. If we remember only the larger total, the parent cannot tell whether taking its own money would break the rule.

## How are the answers combined?

**Take this house:** add its money and the `skip` answers from its children. Skipping a child still lets us take money further below it.

**Skip this house:** choose the better answer for each child separately, then add those answers. The two branches share no houses.

Start at the bottom. A house worth `3` with no children returns `(3, 0)`. A missing child contributes `(0, 0)`.

For the left house worth `2`, taking gives `2`; skipping gives the bottom house's `3`. Its answer is `(2, 3)`.

Eventually the top house returns `(7, 6)`. The final answer is the larger value: **7**.

**Common mistake:** always taking the top house. It is optional too; compare its `take` and `skip` answers.

---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 14 · 01 — Story: Root, the Elder Tree

> Family: **Tree DP.**
> Thirteen chapters of arrays. Every one of them had an `i-1`, a `k`, a
> `length` — some *order* you had to get right. Root takes the order away.
>
> This is the chapter where the table stops being an array, and the fill order
> stops being your problem.

---

## The Grove

Reco leaves Mirra's pool and the path lifts out of the valley. The ground turns
to root — one vast tree, its branches forking upward and **never rejoining**.
Houses hang in the forks. A voice comes from the trunk.

```
              3          ← the root
            /   \
           2     3
            \      \
             3      1
```

**Root, the Elder Tree**, speaks slowly.

> "Rob my houses. But if you rob a house, you may not rob either of the houses
> **directly hanging from it**. Take as much as you can."

Reco recognises it instantly — House Robber, Chapter 0. He reaches for
`dp[i] = max(dp[i-1], dp[i-2] + nums[i])` and stops cold.

> "What is `i-1`?"

There is no `i-1`. The houses are not in a row. Node `3` on the left has one
child; node `3` on the right has one child; the root has two. **There is no
index at all.**

> ### "You have been arguing about fill order for thirteen chapters. Here there is nothing to argue about. There is only one order, and it is forced: **a parent cannot be answered until all of its children are.**"

That sentence is Chapter 14.

---

## The Fulcrum

> ### "At this node — did I rob it, or did I skip it?"

Two doors. That part is Chapter 11's mask, unchanged. What changed is *where
the sub-answers live*:

```
Ch 11   the previous mask is at index i-1            → look LEFT
Ch 14   the children's masks are BELOW me            → look DOWN
```

And the consequence:

```
If I ROB this node:   its children are FORBIDDEN.
                      I must take each child's SKIPPED value.
                      gain = node.val + left.skip + right.skip

If I SKIP this node:  its children are FREE — each one independently
                      does whatever is best for itself.
                      gain = max(left.rob, left.skip) + max(right.rob, right.skip)
```

> **Read the skip branch again.** It is `max(...) + max(...)` — a *choose* and a
> *combine* in the same expression, and they are not interchangeable:
>
> ```
> max   inside each child   →  the child picks its own better mask
> +     between children    →  the two subtrees are DISJOINT, so their
>                              loot ADDS. Nothing is double-counted.
> ```
>
> "Counting SUMS the doors. Optimizing PICKS one door." You have heard that
> since Chapter 5. Here both appear in one line — and the `+` is legal
> **only because the branches never rejoin.**

---

## The Two Laws, and the one that nearly breaks

```
Optimal Substructure   ✓ the best answer at a node is built from the best
                         answers at its children.
Overlapping Subproblems ✗ ... in a TREE, each subtree is visited exactly ONCE.
```

So is this even DP?

> **Yes — but it earns the name differently.** There is nothing to *memoise*,
> because nothing repeats. What makes it DP is the first law plus the state
> discipline: each node returns a **fixed-size summary** of its whole subtree,
> and the parent composes summaries without ever re-descending.
>
> The naive version *does* explode — and here is why. Write it as
> `rob(node) = max(node.val + rob(gc) for grandchildren, sum(rob(c)))` and a
> node's grandchildren get computed once by the node itself and *again* by its
> children. Now the subproblems overlap, and the recursion is exponential.
>
> **Returning both masks at once is what kills the repetition.** That is the
> memo, folded into the return value.

---

## The State — a pair, not a number

```
rob[v]  = the best loot from the subtree rooted at v, GIVEN that v IS robbed
skip[v] = the best loot from the subtree rooted at v, GIVEN that v is NOT robbed
```

The word `GIVEN` is Chapter 11's, and it is mandatory again. One number per
node cannot work, for exactly the reason Modus gave:

> `best[v] = 12` — *"may I rob v's parent?"* You cannot answer. The number has
> merged the robbed world and the skipped world into one.

Same disease. Third appearance. **A state that cannot answer the transition's
question is the wrong state.**

---

## Fill order: the post-order is the topological order

You spent Chapter 12 proving a length-driven loop was legal and Chapter 13
proving a descending loop was legal. Here:

```python
left  = solve(node.left)      # children first
right = solve(node.right)     # children first
# ...only now may I compute my own answer
```

> **That is the entire fill order.** A post-order DFS *is* a topological sort of
> the dependency graph, and the recursion discovers it for free. There is no
> ordering bug available to you in this chapter — which is precisely why it
> feels easy right until the state is wrong.

The Invariant Lens still applies; only the vocabulary moves:

```
Initialization   the empty child (None) — the base case
Maintenance      when I compute a node, BOTH children are already final
Termination      the recursion returns at the ROOT; the answer is there
```

---

## What changed?

| Chapter 13 (palindromes) | Chapter 14 (tree) |
|---|---|
| `dp[l][r]` — an array cell | a **pair returned from a function** |
| you choose the loop order | **post-order is forced**; there is no choice |
| sources are shorter windows | sources are **children** |
| subproblems overlap → memo needed | each subtree visited **once** |
| `O(n²)` | **`O(n)`** — one visit per node |
| termination: a named cell | termination: **the root's return value** |

---

## TRAP 1 — the base case is the *absent* node

There is no "index 0" here. The bottom of the recursion is `None`.

```python
if node is None:
    return (0, 0)        # (rob, skip)
```

**Derive it from the state sentence:** *"the best loot from an empty subtree,
given I rob the nothing that is there"* — you cannot rob what does not exist,
and there is no loot below. Both are `0`.

> **Why `(0, 0)` and not `(-inf, 0)`?** Chapter 11 taught you that an impossible
> world must get the sentinel. Isn't "rob the empty node" impossible?
>
> Look at how the value is *used*: a parent only ever reads
> `left.skip` and `max(left.rob, left.skip)`. With `rob = 0`, the `max` is
> unaffected and `skip = 0` is genuinely correct. `-inf` would also work, but
> `0` is correct here because the empty subtree contributes nothing to any
> legal sum — it is not an impossible *world*, it is an empty *one*.
>
> **The test is never "does this look like last chapter's base". It is "what
> does my state sentence say this value is, and how will it be consumed".**

---

## TRAP 2 — the skip branch is `max` per child, not `max` overall

```python
skip = max(left_rob + right_rob, left_skip + right_skip)     # WRONG
skip = max(left_rob, left_skip) + max(right_rob, right_skip) # RIGHT
```

The wrong line forces both children into the *same* mask. Nothing in Root's rule
says that. The left subtree may rob its top while the right subtree skips its
own — **they are independent, because they share no node.**

This is a genuinely easy mistake and it under-counts silently.

---

## TRAP 3 — the termination mask

```python
return max(root_rob, root_skip)      # RIGHT
return root_rob                      # WRONG
```

The root is a node like any other; nothing forces you to rob it. On the grove
above, robbing the root *is* optimal — so this bug hides. Change one number and
it stops hiding:

```
      3                          3
    /   \                      /   \
   2     3     answer 7       4     5      answer 9  ← the root is SKIPPED
    \      \                 / \      \
     3      1               1   3      1
```

> Termination is your known weak point, and this chapter dresses it as
> "obviously the root". The *node* is forced. The **mask is not.**
> That is Chapter 11's legal-end filter, wearing bark.

---

## Root settles back into the soil

> "Every problem where a node's answer is a fixed-size summary of its children's
> answers is mine. Rob the houses. Find the longest path. Count the sizes. Ask
> whether every subtree is balanced.
>
> You will never argue with me about loop order. You will only ever argue about
> **what each node must tell its parent** — and that is the only question worth
> arguing about anyway."

---

## Cliffhanger

Reco climbs down from the grove into a burnt clearing. A woman crouches inside
a ring of guttering candles, and she does not look up.

> "Root's children never met again. Mine do. I must visit **every** city, and
> from any city I may go to any other — the paths cross, and re-cross, and the
> order I chose an hour ago still constrains me now.
>
> I cannot remember a *position*. I must remember a **set**.
>
> And I will hold that whole set inside a single integer."

Next: **Maska the Bit-Witch**, and the day your state stopped being a number
and became a subset.

> Continue to `02 - worked example.md`.


</details>
