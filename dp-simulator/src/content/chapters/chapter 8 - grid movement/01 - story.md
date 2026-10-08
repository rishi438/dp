# Chapter 8: Find the cheapest route through a grid

**Start at the top-left cell and reach the bottom-right cell with the smallest total cost. Move only right or down.**

Every visited cell costs its number, including the start and finish:

```text
1  3  1
1  5  1
4  2  1
```

One cheapest route is across the top, then down the right edge: `1 + 3 + 1 + 1 + 1 = 7`.

## What are the choices?

Pick a cell and ask: **how could I have reached it?**

You could have come from the cell above or the cell to the left. Those are the only possibilities, because moves are limited to right and down.

If you already know the cheapest cost to reach each of those cells, take the cheaper one and add the cost of the current cell.

```text
cheapest cost here = this cell's cost + min(cost above, cost on left)
```

## What do we save?

`dp[r][c]` stores the cheapest total cost from the start to row `r`, column `c`, **including that cell**.

For the middle cell, the cheapest cost above is `4` and the cheapest cost on the left is `2`. Its own cost is `5`, so its answer is `5 + min(4, 2) = 7`.

## Where do we start and finish?

At the starting cell, the cost is simply `grid[0][0]`, which is **1** here.

Along the top row, you can only arrive from the left. Along the left edge, you can only arrive from above. Fill these edges, then calculate the remaining cells row by row.

Return the saved cost at the bottom-right cell: **7**.

**Common mistake:** looking only at the next cell's price. A cheap next step can lead to an expensive route. Compare the saved **total costs**, not just the neighbouring cell values.


---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 8 · 01 — Story: Gridlock, the Maze Warden

> Family: **Grid / 2D movement.**
> The Twin Scribes gave you a table. Gridlock gives you a table that *is* the
> map — and the `dp` cell sits directly on top of the terrain cell.

---

## The Toll Map

Reco reaches the Iron Valley. The cartographers hand him a map of square
tiles, each stamped with a toll in gold:

```
        →   →   →
    ┌───┬───┬───┐
  ↓ │ 1 │ 3 │ 1 │
    ├───┼───┼───┤
  ↓ │ 1 │ 5 │ 1 │
    ├───┼───┼───┤
  ↓ │ 4 │ 2 │ 1 │
    └───┴───┴───┘
```

**Gridlock, the Maze Warden**, blocks the entrance.

> "Enter top-left. Leave bottom-right. You may step **right**. You may step
> **down**. Nothing else. Ever. No left, no up, no diagonal.
> Pay the toll on every tile you stand on — including the first and the last.
> Find me the **cheapest** crossing."

---

## Why This Family Is the Friendliest in the Book

Reco braces for something worse than the Twin Scribes. It's *easier*, and for
one beautiful reason:

> **The table and the map are the same shape.** `dp[r][c]` sits right on top of
> `grid[r][c]`. No off-by-one contract. No phantom row. No "the first `i`
> characters" translation. A cell is a place.

After Chapter 7's `a[i-1]` headaches, this is a holiday. Enjoy it — Chapter 12
takes it away again.

---

## The Fulcrum: Look Backwards, Not Forwards

Reco's instinct is to stand at the entrance and ask *"where do I go next?"*
That's **forward**, and it branches: 2 choices, then 4, then 8 — exponential.

Gridlock stops him:

> "Wrong direction, boy. Stand on the tile you want to know about and ask:"
>
> ### "Which tile did I step FROM to land HERE?"

Because the warden permits only **right** and **down**, arriving at `(r, c)`
means you came from exactly one of two places:

```
            (r-1, c)
               │
               ↓  (a DOWN step)
 (r, c-1) ──→ (r, c)
          (a RIGHT step)
```

**Two doors. Always two.** The movement rule *is* the door list.

> **The general law this teaches:** in a grid problem, the allowed moves
> determine your doors — and you must **reverse** them. Moves are `right, down`
> → doors are `from-left, from-above`. If the problem also allowed diagonal
> moves, you'd have three doors: `(r-1,c)`, `(r,c-1)`, `(r-1,c-1)`.

---

## Mandatory vs Optional — Where the Toll Goes

Reco writes:

```python
dp[r][c] = min(dp[r-1][c] + grid[r][c], dp[r][c-1] + grid[r][c])   # ✗ clumsy
```

Correct, but it reveals he hasn't seen the structure. Gridlock corrects him:

```python
dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])                # ✓
```

> **The rule you already know, now in a grid:**
> - A **mandatory** cost goes **OUTSIDE** the `min`/`max`. You pay this tile's
>   toll no matter which door you came through. It's not a choice.
> - An **optional** gain goes **INSIDE** the chosen branch, because it only
>   materialises if you pick that branch.
>
> Here the toll is mandatory → outside. Factor it out. The code becomes shorter
> *and* the thinking becomes visible.

---

## The Edges — Where Doors Don't Exist

The top row has no tile above it. The left column has no tile to its left.
What should a missing door contribute?

Reco's first idea — *"treat it as 0"* — is a **bug**. A door worth `0` is the
*cheapest possible* door, so `min` will happily walk through a wall.

> **A non-existent door must be `float('inf')` in a `min` problem**
> (and `float('-inf')` in a `max` problem). Make it so bad it can never win.

```python
top  = dp[r-1][c] if r > 0 else float('inf')   # no tile above → no door
left = dp[r][c-1] if c > 0 else float('inf')   # no tile left  → no door
```

This is the same idea as Corin's `amount + 1` sentinel in Chapter 5, and the
same idea as `c <= x` guarding a too-large coin. **Three chapters, one
principle: a door that doesn't exist must never be selectable.**

---

## The Base Case (derive it — the corner is not zero)

Reco's fingers want `dp[0][0] = 0`. **Wrong.** Apply the state definition:

> `dp[0][0]` = "cheapest cost to *arrive at* the start tile."
> You are standing on it, so you have paid its toll.
> → `dp[0][0] = grid[0][0]`.

The problem said *"pay the toll on every tile you stand on — **including the
first**."* That sentence **is** the base case.

> Fourth chapter running: `dp[0] = 0` (Corin), `dp[0] = nums[0]` (Kade),
> `row/col of 0s` (Scribes), `grid[0][0]` (Gridlock). Same-looking cell, four
> different values, each read straight out of the problem statement.

---

## The Counting Cousin (same map, different decree)

Gridlock has a twin brother who asks a different question about the identical
map:

> "Not the cheapest path. **How many** distinct paths exist?"

Everything is the same except the combine step:

```
"cheapest path"     → min(...)     OPTIMIZE: pick one door
"how many paths"    → up + left    COUNT: sum all doors
```

And the base case changes with it: `dp[0][0] = 1` — *there is exactly one way
to be standing at the start* (do nothing).

> **Choose vs combine**, in its purest form. Same fulcrum, same doors, same
> grid. One word in the question flips `min` to `+` and `grid[0][0]` to `1`.

```
Unique Paths on a 3×3 grid:
    1   1   1
    1   2   3
    1   3   6     ← 6 distinct paths
```

Blocked cells (Unique Paths II)? A wall is a cell with **zero** ways to stand
on it: `dp[r][c] = 0`. The zeros propagate naturally. No special-casing needed.

---

## Termination

> `dp[R-1][C-1]` — the bottom-right corner.

The problem *names* the exit. The journey has a mandatory endpoint, so the
answer sits at that endpoint. Same logic as Corin's `dp[amount]`, and *not*
Kade's `max(dp)` — there is no freedom about where the path ends.

```
Ch 5  → dp[amount]      mandatory endpoint
Ch 6  → max(dp)         may end anywhere
Ch 7  → dp[m][n]        the corner dominates
Ch 8  → dp[R-1][C-1]    mandatory endpoint, named by the problem
```

---

## Cliffhanger

Gridlock's doors were fixed by geometry. But a merchant arrives with a sack
and a scale, and poses a question where the doors are decided by **you**:

> "Each relic has a weight and a worth. My sack holds only so much.
> Take it, or leave it — but you cannot take *half* a relic."

Next: **Sacky the Packmaster**, and the day the second dimension stopped being
a position and became a **resource you spend**.

> Continue to `02 - worked example.md`.


</details>
