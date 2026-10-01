# Chapter 8 · 02 — Worked Example: Minimum Path Sum

> Five slots, then the Invariant Lens. New this chapter: **non-existent doors**
> must be made unselectable, and the second half shows the same map answering a
> *counting* question instead of an *optimizing* one.

---

## The Problem

> `grid = [[1,3,1],`
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`[1,5,1],`
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`[4,2,1]]`
>
> Move only **right** or **down**, top-left to bottom-right.
> Minimise the sum of the tolls on the tiles you visit (start and end included).

---

## Slot 0 — FULCRUM

> ### "Which tile did I step FROM to land HERE?"

Do **not** ask "where do I go next" — forward branching is exponential.
Ask backwards, and the movement rule hands you the doors:

```
moves allowed:  right, down
⇒ doors (reversed): from ABOVE (r-1, c)   and   from LEFT (r, c-1)
```

Two doors. Always two, because two moves are legal.

> If diagonals were legal, you'd reverse *three* moves into *three* doors.
> **The movement rule IS the door list — just run it backwards.**

---

## Slot 1 — STATE

> `dp[r][c]` = the **cheapest total toll to ARRIVE at cell `(r, c)`**,
> including `grid[r][c]` itself.

Two things to notice:

- **"Arrive at"**, not "pass through" or "best anywhere". It's the same
  discipline as Kade's *"ending exactly at i"* — pin the endpoint down so the
  transition can attach to it.
- **No off-by-one.** After Chapter 7's `a[i-1]` contract, this is a relief:
  `dp[r][c]` sits directly on `grid[r][c]`. Same indices. Same shape.

---

## Slot 2 — TRANSITION

```python
dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])
```

**The toll sits OUTSIDE the `min`.** That's deliberate:

```
MANDATORY cost  → outside the min/max   (paid no matter which door)
OPTIONAL  gain  → inside the branch     (only if you pick that branch)
```

You pay `grid[r][c]` whichever door you came through, so factor it out. Writing
`min(dp[r-1][c] + grid[r][c], dp[r][c-1] + grid[r][c])` gives the same number
but hides the structure.

`min` and not `+` because the question says *"minimise"* — optimize, so **pick
one door.** (The counting twin below sums instead. Same doors, different verb.)

---

## Slot 3 — BASE CASE  *(Initialization)*

**Derive it from the state sentence.**

> `dp[0][0]` = "cheapest cost to arrive at the start tile."
> You're standing on it, so you've paid its toll.
> → `dp[0][0] = grid[0][0]`   — **not `0`.**

The problem said *"including the first tile."* That sentence is the base case.

**And the edges — the real lesson of this chapter.** The top row has nothing
above it; the left column has nothing to its left. What does a missing door
contribute?

> **Not `0`.** A door worth `0` is the *cheapest possible* door, so `min` would
> cheerfully walk through a wall.
>
> **A non-existent door must be `float('inf')` in a `min` problem**
> (`float('-inf')` in a `max` problem). Make it unwinnable.

```python
top  = dp[r-1][c] if r > 0 else float('inf')
left = dp[r][c-1] if c > 0 else float('inf')
```

> Same principle as Corin's `amount + 1` sentinel and his `c <= x` guard.
> **Three chapters, one law: a door that doesn't exist must never be
> selectable.**

---

## Slot 4 — TERMINATION

> `dp[R-1][C-1]` — the bottom-right corner.

The problem *names* the exit, so the journey has a mandatory endpoint. No
survey needed.

```
Ch 5 Coin Change  → dp[amount]      mandatory endpoint
Ch 6 Kadane       → max(dp)         may end anywhere
Ch 7 LCS          → dp[m][n]        the corner dominates
Ch 8 Min Path Sum → dp[R-1][C-1]    mandatory endpoint, named by the problem
```

---

## Verify By Hand

```
grid                 dp (cheapest cost to arrive)
┌───┬───┬───┐        ┌───┬───┬───┐
│ 1 │ 3 │ 1 │        │ 1 │ 4 │ 5 │    top row: only "from left" exists
├───┼───┼───┤        ├───┼───┼───┤
│ 1 │ 5 │ 1 │   →    │ 2 │ 7 │ 6 │
├───┼───┼───┤        ├───┼───┼───┤
│ 4 │ 2 │ 1 │        │ 6 │ 8 │ 7 │    ← answer = 7
└───┴───┴───┘        └───┴───┴───┘
```

Three cells traced in full:

```
dp[0][0] = 1                                   base
dp[0][1] = 3 + min(inf, 1)      = 4            no door above → inf
dp[1][0] = 1 + min(1, inf)      = 2            no door left  → inf
dp[1][1] = 5 + min(4, 2)        = 7            cheaper to come from the left
dp[2][2] = 1 + min(6, 8)        = 7            ← from above
```

The winning path: `1 → 3 → 1 → 1 → 1 = 7`. ✓

> Watch the `inf` doing its job in `dp[0][1]`. Had we used `0`, we'd have got
> `3 + 0 = 3` — a path that teleports in from outside the map.

---

## The Code

```python
def min_path_sum(grid):
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]                 # STATE: cheapest cost to ARRIVE at (r,c)
    dp[0][0] = grid[0][0]                                  # BASE/INIT: you stand on the start tile
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                continue
            top  = dp[r-1][c] if r > 0 else float('inf')   # FULCRUM: which tile did I step FROM?
            left = dp[r][c-1] if c > 0 else float('inf')   #          inf = that door does not exist
            dp[r][c] = grid[r][c] + min(top, left)         # TRANSITION: mandatory toll OUTSIDE the min
    return dp[rows-1][cols-1]                              # TERMINATION: the exit is named by the problem

print(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))   # expected: 7
print(min_path_sum([[1, 2, 3], [4, 5, 6]]))              # expected: 12   (1→2→3→6)
print(min_path_sum([[7]]))                               # expected: 7    (single tile)
```

---

## The Same Map, a Different Decree — Unique Paths

Now the twin question: **how many** distinct paths exist? Identical fulcrum,
identical doors. Only the verb changes.

```
"cheapest path"   → min(up, left)   OPTIMIZE: pick one door
"how many paths"  → up + left       COUNT:    sum all doors
```

And the base flips with it: `dp[0][0] = 1` — there is exactly **one** way to be
standing at the start (do nothing). Missing doors now contribute `0` ways, not
`inf` cost.

```python
def unique_paths(rows, cols, blocked=()):
    blocked = set(blocked)
    dp = [[0] * cols for _ in range(rows)]      # STATE: dp[r][c] = number of ways to reach (r,c)
    dp[0][0] = 0 if (0, 0) in blocked else 1    # BASE/INIT: exactly ONE way to stand at the start
    for r in range(rows):
        for c in range(cols):
            if (r, c) in blocked:
                dp[r][c] = 0                    # a wall: zero ways to stand here; zeros propagate
                continue
            if r == 0 and c == 0:
                continue
            up   = dp[r-1][c] if r > 0 else 0   # FULCRUM: same two doors as Min Path Sum
            left = dp[r][c-1] if c > 0 else 0   #          a missing door contributes 0 WAYS
            dp[r][c] = up + left                # TRANSITION: COUNT -> sum the doors, don't pick one
    return dp[rows-1][cols-1]                   # TERMINATION: the named exit

print(unique_paths(3, 3))                       # expected: 6
print(unique_paths(3, 7))                       # expected: 28
print(unique_paths(3, 3, blocked=[(1, 1)]))     # expected: 2   (centre wall)
```

> **Study the two functions side by side.** Same fulcrum, same doors, same
> shape. `min` → `+`. `grid[0][0]` → `1`. `inf` → `0`.
> That is "choose vs combine" in its cleanest possible form, and it is on your
> known weak-point list. Read it twice.

---

## The Invariant Lens

| Loop-invariant phase | DP name       | What it means here                                            |
|----------------------|---------------|---------------------------------------------------------------|
| **Initialization**   | Base Case     | The starting truth known without computation: `dp[0][0] = grid[0][0]`, because arriving at the start costs exactly its own toll. |
| **Maintenance**      | Transition    | One step forward preserves correctness. Computing `dp[r][c]` reads only `dp[r-1][c]` (previous row) and `dp[r][c-1]` (same row, previous column) — both already final under row-major order. Adding the mandatory toll to the cheaper one is therefore correct. |
| **Termination**      | State (final) | Loops end at `(R-1, C-1)`. That cell is correct, and the problem names it as the exit, so it *is* the answer. |

**Run the source-cell check again** (the habit from Chapter 7):

```
dp[r-1][c]   → previous row            ✓ filled
dp[r][c-1]   → same row, previous col  ✓ filled (inner loop ascends)
```

Row-major order satisfies both. ✓

> Keep running this check every chapter. In **Chapter 12** the obvious loop
> order *fails* it, and that failure is TRAP 6.

---

## Debugging With the Lens

```
Path seems to teleport / answer too small?  → Initialization. You used 0 for a
                                              missing door instead of inf.
Answer is short by grid[0][0]?              → Initialization. You set
                                              dp[0][0] = 0.
Counting version returns 0 everywhere?      → Initialization. dp[0][0] must be
                                              1 way, not 0 cost.
Correct top-left, garbage bottom-right?     → Maintenance. Loop order is wrong;
                                              you read a cell not yet filled.
```

---

## Space Optimization

`dp[r][c]` reads only the row above and the cell to its left — so a **single
row** suffices if you overwrite it left to right:

```python
def min_path_sum_1row(grid):
    cols = len(grid[0])
    dp = [float('inf')] * cols          # STATE, rolled: dp[c] = best cost to arrive in the CURRENT row
    dp[0] = 0                           # priming value so row 0 works out to a prefix sum
    for row in grid:
        dp[0] += row[0]                 # left column: only one door (from above)
        for c in range(1, cols):
            dp[c] = row[c] + min(dp[c], dp[c-1])   # dp[c] is still the row ABOVE; dp[c-1] is LEFT
    return dp[-1]

print(min_path_sum_1row([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))   # expected: 7
```

The trick: when you reach index `c`, `dp[c]` has **not yet** been overwritten,
so it still holds the value from the row above — while `dp[c-1]` *has* been
overwritten and holds the current row. Both doors, one array.

`O(R·C)` time, `O(C)` space.

---

## Complexity

```
Time   O(R × C)            every cell, O(1) work (2 fixed doors)
Space  O(R × C) → O(C)     roll to a single row
```

---

## The Takeaway

```
0. FULCRUM      "which tile did I step FROM?"  → reverse the allowed moves
1. STATE        dp[r][c] = cost to ARRIVE at (r,c)  → no off-by-one, ever
2. TRANSITION   grid[r][c] + min(up, left)     → mandatory cost OUTSIDE the min
3. BASE         dp[0][0] = grid[0][0], DERIVED → and missing doors = inf, not 0
4. TERMINATION  dp[R-1][C-1]                   → the problem names the exit
5. LENS         check both source cells are already filled under row-major
```

> Your turn: `03 - your challenge.md`. Challenge 4 changes the allowed moves
> and dares you to keep the same loop order.
