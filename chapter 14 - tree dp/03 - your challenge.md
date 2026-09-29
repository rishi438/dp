# Chapter 14 · 03 — Your Challenges

Rules: five slots in order, before any code. Every state sentence contains the
word **GIVEN**. And answer this before writing anything:
*what fixed-size summary must a node hand its parent?*

Use this helper for all tests (level-order list, `None` = absent):

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def build(values):
    if not values or values[0] is None:
        return None
    nodes = [TreeNode(v) if v is not None else None for v in values]
    kids = iter(nodes[1:])
    for node in nodes:
        if node:
            node.left = next(kids, None)
            node.right = next(kids, None)
    return nodes[0]
```

---

## 1. (easy) Two sentences

For this tree:

```
      3
    /   \
   2     3
    \      \
     3      1
```

- Write the two state sentences for the **left child (`2`)**, each containing
  `GIVEN`.
- Its pair is `(2, 3)` — its `skip` beats its `rob`. Explain in one sentence
  what information a single number would have destroyed, and what the root
  would then have gotten wrong.

---

## 2. (easy) Base-case derivation

- What is the base case of this chapter? It is not an index.
- Derive **both** components from their own state sentences. Show the reasoning.
- Chapter 11 used `-inf` for an impossible world. Explain, in two sentences, why
  `rob(None) = 0` is correct here and `-inf` is not required. Your answer must
  mention **how the parent consumes the value**.

> Base cases are your #1 weak point. This one has no index to anchor it, so you
> cannot fall back on copying a pattern.

---

## 3. (medium) Hand-trace the pairs

Trace this tree by hand — post-order, no code. Write the `(rob, skip)` pair at
every node:

```
         3
       /   \
      4     5
     / \      \
    1   3      1
```

Then: state the answer, say **which mask the root used**, and list the exact
nodes robbed.

---

## 4. (medium) Implement it

Write `rob_tree(root)` returning the pair. Verify all of these:

```
[3, 2, 3, None, 3, None, 1]  -> 7
[3, 4, 5, 1, 3, None, 1]     -> 9
[1]                          -> 1
[2, 1, 3, None, 4]           -> 7
[]                           -> 0
```

Then answer: **how many times is each node visited?** Why is there no `memo`
anywhere in your code, and why was there one in Chapter 2?

---

## 5. (medium) TRAP — the coupled children

Someone writes:

```python
skip = max(l_rob + r_rob, l_skip + r_skip)
```

- What does this line *assume* about the two children?
- Which rule of Root's does it invent that he never stated?
- Find a tree of **at most 5 nodes** where this produces a wrong answer.
  Give the tree, the buggy output, and the correct output.
- Is the error an over-count or an under-count? Why does that direction follow
  from the bug?

---

## 6. (medium) TERMINATION — the free mask

- Why is `return rob(root)` wrong?
- On `[3, 2, 3, None, 3, None, 1]` it returns the right answer anyway. Compute
  `rob(root)` and `skip(root)` for that tree and explain *why it got lucky*.
- Give a tree where it is strictly wrong, with both numbers.
- Chapter 11 introduced the **legal-end filter**. Chapter 14 adds a variation.
  State the difference in one line: what is forced here, and what is free?

---

## 7. (medium) The overlap question

- Do the subproblems in this chapter **overlap**? Answer yes/no for the
  `(rob, skip)` formulation.
- Now write the single-number version (`best(node)` jumping to grandchildren)
  **without** a memo, and explain precisely which subproblem gets recomputed and
  by whom.
- Finish this sentence: *"Returning both masks is the memo, because ______."*
- If both laws are meant to hold for DP, in what sense is the pair version still
  dynamic programming? Two sentences.

---

## 8. (hard) A node that must remember two different things

**Binary Tree Maximum Path Sum.** A path may bend at exactly one node.

- Name the **two** quantities each node deals with. Say clearly which one is
  *returned to the parent* and which one is only *recorded*.
- Why can the bent value never be returned upward? Answer using the words
  "enter" and "leave".
- Why is `max(gain(child), 0)` there? Which mask from this chapter is that
  expression secretly implementing?
- What is the termination — a cell, or a survey? Justify it.
- Implement and verify:
  `[1,2,3]` → `6`, `[-10,9,20,None,None,15,7]` → `42`, `[-3]` → `-3`,
  `[2,-1]` → `2`.

---

## 9. (hard) Derive a new summary

**Diameter of a Binary Tree** — the number of *edges* on the longest path
between any two nodes.

- What must each node return? (One number. Name it precisely.)
- What must each node record? Write the expression.
- Derive the base case at the absent node.
- Why is the termination a survey and not the root's return value?
- Implement and verify: `[1,2,3,4,5]` → `3`, `[1,2]` → `1`, `[]` → `0`.

Then, in one sentence each, state what a node must return for:
- **Balanced Binary Tree** (and why `-1` is a useful sentinel)
- **Longest Univalue Path**

---

## 10. (hard) The rule that is about to break

The transition's `+` between two children is legal **only because a tree's
branches never rejoin**.

- Explain in two sentences what would go wrong if the "tree" had a node with
  two parents.
- Construct the smallest concrete example where adding two subtree answers
  double-counts a node's value. Give the number the buggy sum produces and the
  correct one.
- Predict: if positions can be revisited and the order you chose earlier still
  constrains you, what must the state remember instead of "which node am I at"?

> Answer that last one before you turn the page. Maska is going to ask it, and
> she will not repeat the question.

---

## After You Answer

I will diagnose, in this priority order:

1. **Base cases** — derived from the sentences at the *absent* node, and can you
   justify `0` over `-inf` by how the parent consumes it?
   *(known weak point #1)*
2. **Termination** — `max` over the root's masks, not `rob(root)`. Can you name
   what is forced and what is free? *(known weak point #2)*
3. **State sufficiency** — does your node return enough for its parent to act
   without looking down twice? This is the whole family.
4. **Choose vs combine** — `max` *inside* each child, `+` *between* children,
   and can you justify the `+` by disjointness?
5. **Mandatory vs optional** — is `node.val` confined to the `rob` branch?
6. **Order** — can you state why post-order recursion *is* the topological sort,
   without hand-waving?

Then we drill whichever bled most, and the candles in the burnt clearing get
lit.
