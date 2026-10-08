# Chapter 9 · 03 — Your Challenge (Easy → Hard)

> Five slots before any code: FULCRUM → STATE → TRANSITION → BASE → TERMINATION.
> Write under each prompt, then say **"done"**.

---

## Challenge 1 (Easy) — Fill the sack by hand

```
weights = [2, 3, 4]
values  = [3, 4, 5]
capacity W = 5
```

1. Hand-fill the full `dp` table — 4 rows (`i = 0…3`) × 6 columns (`w = 0…5`).
2. For every cell, write which door won: `L` (leave) or `T` (take).
   Where the `take` door doesn't exist at all, write `—` and say why.
3. Read the answer off the table, then **reconstruct the chosen relics** by
   walking backwards from `dp[3][5]`: at each step, if `dp[i][w] == dp[i-1][w]`
   you left relic `i`; otherwise you took it and must move to
   `dp[i-1][w - wt]`. List the relics in the winning sack.
4. What does greedy-by-value pick, and what value does it get? Show that it
   loses.

**Your answer:**


---

## Challenge 2 (Easy) — Inside or outside?

Two transitions from consecutive chapters:

```python
dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])          # Ch 8
dp[i][w] = max(dp[i-1][w], dp[i-1][w - wt] + val)            # Ch 9
```

1. In one sentence each, say **why** the grid toll is outside the `min` and the
   relic value is inside the `max`. Use the words *mandatory* and *optional*.
2. Rewrite the Ch 9 line as if the value were mandatory — i.e. pull `+ val`
   outside the `max`. Run it in your head on `weights=[3], values=[4], W=1`.
   What number comes out, and what absurd thing does it claim happened?
3. Give the general rule in your own words, in one line. This one is on your
   weak-point list — I want *your* phrasing, not mine.

**Your answer:**


---

## Challenge 3 (Medium) — Derive the base, don't copy it

Three problems, one table shape. For **each**, state `dp[0][0]` and
`dp[0][t]` for `t > 0`, and **derive each from its own state sentence**. Do not
reference the other two.

```
(a) 0/1 Knapsack      dp[i][w] = best value using first i items, capacity w
(b) Subset Sum        dp[i][t] = can the first i numbers sum to exactly t?
(c) Count Subsets     dp[i][t] = how many subsets of the first i numbers sum to exactly t?
```

1. Fill this table:

| Problem | `dp[0][0]` | `dp[0][t>0]` | The one-sentence derivation |
|---------|-----------|--------------|------------------------------|
| (a)     |           |              |                              |
| (b)     |           |              |                              |
| (c)     |           |              |                              |

2. For (c), a student writes `dp[0] = 0`. What does `count_subsets([1,2], 3)`
   return, and **why is it that number specifically**?
3. `nums = [0, 1]`, target `1`. `count_subsets` returns `2`, not `1`.
   Is that a bug? Justify from the state sentence.

**Your answer:**


---

## Challenge 4 (Medium / TRAP) — Name the problem it actually solved

Here are two rolled arrays. They differ by the direction of one `for` loop.

```python
# A
for wt, val in zip(weights, values):
    for w in range(capacity, wt - 1, -1):
        dp[w] = max(dp[w], dp[w - wt] + val)

# B
for wt, val in zip(weights, values):
    for w in range(wt, capacity + 1):
        dp[w] = max(dp[w], dp[w - wt] + val)
```

On `weights = [2, 3]`, `values = [3, 4]`, `capacity = 6`:
A returns `7`, B returns `9`.

1. At the instant `dp[w]` is assigned in **A**, which generation does the
   right-hand `dp[w - wt]` belong to — *before* this item existed, or *after*?
   Prove it from the loop bounds, not from the answer.
2. Same question for **B**.
3. **B is not broken.** Name the exact problem B correctly solves, and show the
   item multiset that produces `9`.
4. Go back and open Chapter 5's Coin Change code. Which direction does its
   inner loop run, and which of A/B is it? Explain in one sentence why that is
   the *correct* choice there.
5. Now the hard part. Suppose the sack allows **at most 2 copies** of each
   relic. Neither A nor B solves that. Describe how you'd extend the state, and
   say what your new time complexity is.

**Your answer:**


---

## Challenge 5 (Hard) — Termination, and the sack that must be FULL

Sacky changes the rules:

> "I will not accept a sack with air in it. The relics you take must weigh
> **exactly** `W`, or you get nothing."

1. First, the original problem. Is `dp[n][W]` equal to `max(dp[n])`? Prove it
   or find a counterexample. (Hint: is row `n` monotonic in `w`? Why?)
2. Now the new rule. The transition does **not** change at all. Exactly one
   slot does. Which one, and what is its new value? Derive it — do not copy
   anything from part 1.
3. What must the function return when no exact-weight sack exists? Show how
   your base case makes that fall out automatically instead of needing an
   `if`.
4. Write the code. Test it on `weights=[2,3,5], values=[3,4,6], W=4`
   (unreachable) and `W=5` (two different ways to reach it — which wins?).
5. Fill the Lens table for the exact-weight version:

| Loop-invariant phase | Your version | Why it's true |
|----------------------|--------------|---------------|
| **Initialization**   |              |               |
| **Maintenance**      |              |               |
| **Termination**      |              |               |

**Your answer:**


---

## Challenge 6 (Hard) — See the family through the disguise

> **Target Sum.** Given `nums = [1, 1, 1, 1, 1]` and `target = 3`, put a `+` or
> a `-` in front of **every** number so the expression equals `target`. How
> many ways? (Expected: `5`.)

The words *sack*, *weight*, and *capacity* do not appear. It is still this
chapter.

1. Let `P` = the sum of the numbers you made positive, `N` = the sum of the
   numbers you made negative. Write the two equations relating `P`, `N`,
   `target`, and `total = sum(nums)`. Solve for `P`.
2. The problem is now *"count the subsets that sum to `P`"*. Which function
   from the worked example solves it unchanged?
3. **Two guards you must add before calling it.** What happens if `P` is not an
   integer? What if `target` is bigger than `total`? Give a concrete input for
   each.
4. Write the full solution and test it on the example, plus `nums=[1]`,
   `target=2` and `nums=[1]`, `target=1`.
5. In two sentences: what *cue* in the problem statement should have made you
   think "knapsack" before you did any algebra?

**Your answer:**


---

## Challenge 7 (Hard / TRAP) — When O(n·W) is a lie

1. `knapsack_01` is `O(n × W)`. For `n = 10` and `W = 1_000_000_000`, is that
   fast? Explain why `O(n × W)` is called **pseudo-polynomial**, using the
   number of *digits* in `W`.
2. Which of these two inputs is harder for this algorithm, and why is that
   answer counter-intuitive?
   ```
   (i)   n = 10_000,  W = 100
   (ii)  n = 10,      W = 100_000_000
   ```
3. For case (ii), `n = 10` means there are only `2¹⁰ = 1024` possible subsets.
   Describe an algorithm that ignores `W` entirely. What is its complexity, and
   at roughly what `n` does it stop being viable?
4. Chapter 5 claimed Coin Change was its own pattern. Now argue the opposite:
   state precisely which knapsack variant Coin Change is, map each of Corin's
   pieces onto a knapsack piece (`amount` ↔ ?, `coins` ↔ ?, `min` ↔ ?), and
   name the one structural difference that remains.

**Your answer:**


---

## After You Answer

I will check, in priority order:

1. **C4.1 and C4.2** — the generation proof. This is the chapter's whole point,
   it is the rehearsal you did in Chapter 8's Challenge 6, and it returns in
   Chapter 12. If you can't prove which generation a rolled cell holds, we stop
   and drill until you can.
2. **C3 and C5.2** — base-case derivation. Fifth chapter running on this. C3
   deliberately puts three near-identical row-zeros next to each other to see
   if you copy; C5.2 makes the base the *only* thing that changes. I expect
   clean derivations from the state sentence with zero cross-referencing.
3. **C5.1** — termination. `dp[n][W]` vs `max(dp[n])` — I want the monotonicity
   argument, not "that's just where the answer is".
4. **C2.3 and C6.5** — mandatory vs optional, and pattern recognition through a
   disguise. These are the two skills that transfer to every remaining chapter.
5. Drill whatever wobbled.
6. Then unlock **Chapter 10 — Lissa the Chainbuilder**, where the doors stop
   being two and become *every element you have already passed*, and where
   `dp[-1]` will be wrong for the first time in three chapters.

Write your answers. Then say **"done"**.
