# Chapter 8 · 03 — Your Challenge (Easy → Hard)

> Five slots before any code: FULCRUM → STATE → TRANSITION → BASE → TERMINATION.
> Write under each prompt, then say **"done"**.

---

## Challenge 1 (Easy) — Fill the map

```
grid = [[2, 1, 3],
        [6, 5, 4],
        [7, 8, 1]]
```

Hand-fill the `dp` table for **Minimum Path Sum**. For every cell write which
door won: `↑` (from above) or `←` (from left).
Then trace the winning path back and list the tiles in order.

**Your answer:**


---

## Challenge 2 (Easy) — Why not zero?

In the worked example, a missing door was `float('inf')`.

1. Recompute `dp[0][1]` for `grid = [[1,3,1],...]` using `0` for the missing
   door instead of `inf`. What wrong number do you get?
2. Explain in one sentence what that wrong number *physically means* on the map.
3. In **Unique Paths** (the counting twin), a missing door **is** `0`. Why is
   `0` correct there and a bug here?

**Your answer:**


---

## Challenge 3 (Medium) — Derive the base, don't copy it

Problem: **Unique Paths II** — same grid, count paths, but some cells are
obstacles you cannot stand on.

```
grid = [[0, 0, 0],
        [0, 1, 0],       # 1 = obstacle
        [0, 0, 0]]
```

Do NOT write code yet. Answer only:

1. What is `dp[0][0]`? Derive it, and handle the nasty case where the **start
   itself** is an obstacle.
2. In the top row, what happens to every cell *after* an obstacle? Explain why
   you do **not** need a special rule for that — why does it fall out of the
   transition automatically?
3. Min Path Sum's base was `grid[0][0]`. This one is different. **Why does the
   same cell hold a different value?** One sentence, no reference to Min Path Sum.

**Your answer:**


---

## Challenge 4 (Medium / TRAP) — New movement rule, same loop order?

Gridlock relaxes: you may now step **right**, **down**, *or* **diagonally
down-right**.

1. Restate the fulcrum. How many doors now? List the exact `dp` cells.
2. Write the new transition.
3. **The trap:** does your existing row-major loop order (`for r:` then
   `for c:`, both ascending) still guarantee every source cell is already
   filled? Prove it cell by cell, or find the counterexample.
4. Now the warden allows stepping **up** as well. Does DP still work?
   Answer honestly and say **what breaks** — name the property the grid loses
   and what algorithm you'd need instead.

**Your answer:**


---

## Challenge 5 (Hard) — Triangle, the ragged grid

```
triangle = [   [2],
              [3,4],
             [6,5,7],
            [4,1,8,3]]
```

From a cell in row `r`, you may move to index `i` or `i+1` in row `r+1`.
Find the minimum top-to-bottom path sum. (Expected: `11` → `2+3+5+1`.)

1. Five slots. Watch the fulcrum carefully: which cells can reach `(r, i)`?
   It is **not** the same as a rectangular grid — write the indices out.
2. **Termination:** is it `dp[-1][-1]`, `dp[-1][0]`, or `min(dp[-1])`?
   Justify from the problem statement, not from habit.
3. Now solve it **bottom-up from the last row upward**. Show that this version
   needs no `inf` sentinels at all. Why does flipping direction remove them?

**Your answer:**


---

## Challenge 6 (Hard / TRAP) — Prove the rolled array

Here is the single-row optimization from the worked example:

```python
for row in grid:
    dp[0] += row[0]
    for c in range(1, cols):
        dp[c] = row[c] + min(dp[c], dp[c-1])
```

1. At the moment `dp[c]` is being assigned, **which row does the right-hand
   `dp[c]` belong to** — the current row or the one above? Prove it.
2. And `dp[c-1]` — which row? Prove it.
3. Now reverse the inner loop to `for c in range(cols-1, 0, -1)`. Which of the
   two doors goes stale, and what wrong answer results on
   `[[1,2],[3,4]]`?
4. Fill the Lens table for the rolled version specifically:

| Loop-invariant phase | Your code's version | Why it's true |
|----------------------|---------------------|---------------|
| **Initialization**   |                     |               |
| **Maintenance**      |                     |               |
| **Termination**      |                     |               |

> Rolled arrays are where loop direction becomes life-or-death. In
> **Chapter 9 (Knapsack)** you will meet a rolled array that must iterate
> **backwards**, and getting it wrong silently solves a *different problem*.
> This challenge is your rehearsal.

**Your answer:**


---

## After You Answer

I will check, in priority order:

1. **C2 and C3** — the sentinel principle (`inf` vs `0`) and base derivation.
   Fourth chapter running on base cases; I'm looking for a clean derivation
   with no glance at the previous chapter.
2. **C4.3 and C6** — loop-order proofs. These two are the direct rehearsal for
   Chapter 9's backward-iteration trap and Chapter 12's loop-by-length rule.
   If you can prove source cells are fresh, those chapters will be easy.
3. **C5.2** — termination on a ragged grid, where habit says "bottom-right"
   and the problem says otherwise.
4. Drill whatever wobbled.
5. Then unlock **Chapter 9 — Sacky the Packmaster**, where the second dimension
   stops being a *position* and becomes a **resource you spend**.

Write your answers. Then say **"done"**.
