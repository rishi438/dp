# Chapter 17 · 02 — Worked Example: Knight Probability in Chessboard

> Five slots, then the Invariant Lens. New this chapter: the cell holds a
> **probability**, the transition takes **every door at once with a weight**,
> and the table as a whole is a **distribution** you can check sums to ≤ 1.

---

## The Problem

> A knight starts at `(0, 0)` on a `3 × 3` board and makes **exactly `k = 2`**
> leaps. Each leap is chosen uniformly from the 8 knight moves, even if it goes
> off the board. Once off, it never returns.
>
> What is the probability it is still on the board after `k` leaps?
> (Expected: `0.0625`.)

---

## Slot 0 — FULCRUM

> **Ask yourself:** "The horse is on `(r, c)`. Where does it land next?"

Eight doors. **All of them, simultaneously, each carrying `1/8` of the
probability.**

```
                 ┌─ leap 1  ×1/8 ─┐
   dp[r][c] ─────┼─ leap 2  ×1/8 ─┼───► nxt[r'][c']
                 │      ...       │
                 └─ leap 8  ×1/8 ─┘

   Leaps that land off the board deposit their share NOWHERE.
   That lost mass IS the probability of falling off.
```

```
OPTIMIZE      pick one door                     max / min
COUNT         add the doors                     +
PROBABILITY   add the doors, each × its chance  Σ pᵢ · (…)     ← this chapter
```

> Sixteen chapters of `min`/`max`/`+` have trained your fingers. There is
> nothing to maximise here. **The horse does not choose.**

---

## Slot 1 — STATE

> `dp[r][c]` = the **probability that the knight is standing on square `(r, c)`
> at this moment** (after the leaps made so far).

Two things worth saying out loud:

**(1) The table is a distribution, not a collection of answers.**
Read across the whole grid at one instant and you have a complete description of
where the horse might be. That gives you a permanent invariant:

```
Σ over all cells of dp[r][c]  ≤  1
```

It starts at exactly `1` and **shrinks** as probability leaks off the board.
The shrinkage is not a bug — it is the answer.

**(2) `k` is the time axis, and it is rolled.**
The full state is `dp[k][r][c]`, but `dp[k]` only ever reads `dp[k-1]`, so the
window reaches exactly one generation back. That is Chapter 4's cloth, and it
reduces `O(k·n²)` space to `O(n²)`.

---

## Slot 2 — TRANSITION

Written as a **push** (spread this cell's mass to its eight destinations):

```python
for dr, dc in MOVES:                     # all 8 doors are ATTEMPTED
    nr, nc = r + dr, c + dc
    if 0 <= nr < n and 0 <= nc < n:      # only the legal ones are RECORDED
        nxt[nr][nc] += dp[r][c] / 8.0    # weighted sum: this arrow carries 1/8
```

| English | Symbol |
|---|---|
| "each of the 8 leaps" | `for dr, dc in MOVES` |
| "is equally likely" | `/ 8.0` |
| "mass arriving from *every* source adds up" | `+=` |
| "off the board is simply not recorded" | the `if` with no `else` |

**Where the `/8` must go — and this is the trap:**

```python
nxt[nr][nc] += dp[r][c] / 8.0      # RIGHT: the weight rides EACH arrow
nxt[nr][nc] += dp[r][c]            # WRONG: no weight at all
... ; return total / 8.0           # WRONG: one division for all eight doors
```

The last one is right only if all eight doors survive — which is exactly the
case this problem is about. It fails silently on every edge square.

**The renormalisation trap.** If you count the `m` legal moves and divide by `m`
instead of `8`, you are answering *"given the horse survives, where is it?"* —
and your function will return `1.0` for every input.

> Same discipline as Chapter 11's `- prices[i]`: **a weight belongs to one
> specific arrow, not to the node.**

---

## Slot 3 — BASE CASE  *(Initialization)*

```python
dp = [[0.0] * n for _ in range(n)]
dp[row][col] = 1.0
```

**Derive from the state sentence.** *"The probability the knight is on `(r,c)`
before any leap has happened"* — it is standing on the start square. That square
is `1.0`; every other square is `0.0`. A **point mass**.

> **There is no sentinel in this chapter.** Twelve chapters trained you to seed
> with `inf` (min) or `-inf` (max) so an impossible door could never be picked.
> Here nothing is *picked*, everything is *added* — and `0.0` is a perfectly
> real probability that adds harmlessly. Reaching for a sentinel means you have
> imported a habit from a family that does not apply.

Thirteenth chapter of base cases. Still no two alike:

```
Ch 5  dp[0] = 0 (min) / 1 (count)   Ch 12 dp[i][i] = 0
Ch 6  dp[0] = nums[0]               Ch 13 dp[i][i] = 1, dp[l>r] = 0
Ch 7  row/col of 0s                 Ch 14 (0, 0) at the absent node
Ch 8  dp[0][0] = grid[0][0]         Ch 15 dp[{0}][0] = 0, rest inf
Ch 9  dp[0][*] = 0                  Ch 16 return 1 at pos == n
Ch 10 dp[*] = 1                     Ch 17 dp[start] = 1.0, rest 0.0  ← a POINT MASS
Ch 11 -prices[0] / -inf / 0
```

---

## Slot 4 — TERMINATION

> ### `sum(sum(row) for row in dp)` — survey the **entire** final distribution.

Fortuna asked *"is it still on the board?"* — anywhere on the board. Every
surviving cell contributes.

```
ENDPOINT FORCED        Ch 5 · Ch 8 · Ch 12 · Ch 13
ENDPOINT FREE          Ch 6 max(dp) · Ch 10 max(dp)
LEGAL-END FILTER       Ch 11
FORCED NODE, FREE MASK Ch 14
SURVEY + FINAL COST    Ch 15
THE ROOT CALL          Ch 16
SUM THE WHOLE TABLE    Ch 17   ← new
```

> **`max(dp)` here would be a category error.** Chapter 6 and Chapter 10
> surveyed with `max` because the answer was *one* best endpoint. Here the
> endpoints are not competing alternatives — they are **mutually exclusive
> events of one experiment**, and the probability of *"any of them"* is their
> sum.
>
> This is the same `max`-vs-`+` distinction as Chapter 5, arriving at Slot 4
> instead of Slot 2. **Optimising surveys with `max`. Counting and probability
> survey with `+`.**

---

## Verify By Hand

The `3 × 3` board. Squares are labelled by `(row, col)`.

**Step 0 — the point mass.**

```
        1.0   0     0
        0     0     0
        0     0     0            Σ = 1.0
```

**Step 1 — leap from `(0,0)`.** Attempt all eight:

```
(0+1, 0+2) = (1, 2)   ON        (0-1, 0-2) = (-1,-2)  off
(0+2, 0+1) = (2, 1)   ON        (0-2, 0-1) = (-2,-1)  off
(0+2, 0-1) = (2,-1)   off       (0-2, 0+1) = (-2, 1)  off
(0+1, 0-2) = (1,-2)   off       (0-1, 0+2) = (-1, 2)  off

2 of 8 survive.
```

```
        0     0     0
        0     0     0.125        dp[1][2] = 1.0 / 8
        0     0.125 0            dp[2][1] = 1.0 / 8

Σ = 0.25       ← 75% of the horse has already fallen off
```

**Step 2 — leap from `(1,2)` and from `(2,1)`.**

```
from (1,2):  (2,0) ON   (0,0) ON   others off   → 2 of 8
from (2,1):  (0,0) ON   (0,2) ON   others off   → 2 of 8
```

```
(1,2) sends 0.125/8 = 0.015625  to (2,0)  and  0.015625 to (0,0)
(2,1) sends 0.015625            to (0,0)  and  0.015625 to (0,2)
```

```
        0.03125   0    0.015625        (0,0) received from BOTH sources
        0         0    0
        0.015625  0    0

Σ = 0.0625      ← the answer
```

> **Three things to see, and they are the whole chapter:**
>
> 1. **`(0,0)` got mass from two different sources and they ADDED.** Two
>    disjoint ways to be in the same place — Chapter 5's `+`, wearing a new hat.
>    Had you written `max` there, you would have got `0.046875`.
> 2. **The total shrank `1.0 → 0.25 → 0.0625`.** That leak is not an error; it
>    is exactly the probability of falling off, and it is what the question
>    asks about.
> 3. **`0.0625 = 4 / 64`.** Four surviving 2-leap sequences out of `8² = 64`.
>    Probability really is counting, divided.

> **A test worth keeping:** a knight on the centre of a `3 × 3` board has
> **zero** legal moves — all eight leaps leave the board. So
> `knight_probability(3, 1, 1, 1)` must be exactly `0.0`. If your code returns
> anything else, you renormalised.

---

## The Code

```python
MOVES = [(1, 2), (2, 1), (2, -1), (1, -2),
         (-1, -2), (-2, -1), (-2, 1), (-1, 2)]

def knight_probability(n, k, row, col):
    dp = [[0.0] * n for _ in range(n)]           # STATE: dp[r][c] = P(knight is on (r,c) now)
    dp[row][col] = 1.0                           # BASE: a POINT MASS at the start square
    for _ in range(k):                           # k is the time axis -- rolled, one generation deep
        nxt = [[0.0] * n for _ in range(n)]
        for r in range(n):
            for c in range(n):
                p = dp[r][c]
                if p == 0.0:                     # nothing here to spread
                    continue
                for dr, dc in MOVES:             # FULCRUM: all 8 leaps ATTEMPTED...
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < n and 0 <= nc < n:      # ...only legal ones RECORDED;
                        nxt[nr][nc] += p / 8.0           # the rest leak off the board
        dp = nxt                                 # TRANSITION: weighted sum, every door at once
    return sum(sum(r) for r in dp)               # TERMINATION: SUM the whole distribution

print(knight_probability(3, 2, 0, 0))    # expected: 0.0625
print(knight_probability(3, 1, 1, 1))    # expected: 0.0      centre of 3x3: no legal move
print(knight_probability(3, 3, 0, 0))    # expected: 0.015625
print(knight_probability(1, 0, 0, 0))    # expected: 1.0      zero leaps -> certainty
print(knight_probability(3, 0, 0, 0))    # expected: 1.0
print(knight_probability(8, 1, 0, 0))    # expected: 0.25     corner of a real board
print(knight_probability(8, 2, 0, 0))    # expected: 0.1875
```

### The integer twin — probability is counting, divided

```python
def knight_paths(n, k, row, col):
    dp = [[0] * n for _ in range(n)]             # STATE: dp[r][c] = NUMBER of leap-sequences ending here
    dp[row][col] = 1                             # BASE: one empty sequence
    for _ in range(k):
        nxt = [[0] * n for _ in range(n)]
        for r in range(n):
            for c in range(n):
                if dp[r][c] == 0:
                    continue
                for dr, dc in MOVES:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < n and 0 <= nc < n:
                        nxt[nr][nc] += dp[r][c]  # TRANSITION: identical, minus the weight
        dp = nxt
    return sum(map(sum, dp))                     # TERMINATION: total surviving sequences

print(knight_paths(3, 2, 0, 0))                     # expected: 4
print(knight_paths(3, 2, 0, 0) / 8 ** 2)            # expected: 0.0625
print(knight_paths(8, 2, 0, 0))                     # expected: 12
print(knight_paths(8, 2, 0, 0) / 8 ** 2)            # expected: 0.1875
```

> **Same table. The `/8.0` is the only difference.**
>
> When every door has equal weight, build the **integer** version and divide once
> at termination. Integers do not round, do not underflow over long horizons, and
> can be checked by hand — you can literally count the four surviving paths on
> the `3×3`.
>
> The float version earns its keep the moment the weights stop being equal:
> a loaded die, a `p`/`1-p` coin, or a transition matrix with distinct rates.
> **Then the weight must be carried explicitly on each arrow.**

---

## The Invariant Lens

| Loop-invariant phase | DP name | What it means here |
|---|---|---|
| **Initialization** | Base Case | `dp[row][col] = 1.0`, everything else `0.0`. The known-without-computation truth: before any leap, the knight is where it was placed. The distribution sums to exactly `1`. |
| **Maintenance** | Transition | If `dp` is the true distribution after `t` leaps, then after one push `nxt` is the true distribution after `t+1`: every cell's mass is split into eight equal parts, legal parts land, illegal parts leave. Mass from different sources **adds**, because arriving-from-A and arriving-from-B are disjoint events. |
| **Termination** | State (final) | After `k` pushes, `dp` is the distribution over on-board squares. "Still on the board" is the union of mutually exclusive events, so its probability is the **sum** of the table. |

**The invariant you can actually print:**

```python
assert sum(map(sum, dp)) <= 1.0 + 1e-9        # monotonically non-increasing
```

> No other chapter gives you a global correctness check this cheap. `Σ > 1` means
> you double-counted a door. `Σ` staying at `1.0` when the knight is near an edge
> means you renormalised. **Print it every step while debugging.**

---

## Debugging With the Lens

```
Always returns 1.0             -> MAINTENANCE. You divided by the number of LEGAL
                                  moves instead of 8. You renormalised away the
                                  very thing being measured.

Result > 1                     -> MAINTENANCE. The weight is missing, or you both
                                  += and then divided at the end.

Result far too small           -> MAINTENANCE. You divided by 8 once per STEP in
                                  addition to once per arrow.

knight_probability(3,1,1,1)    -> MAINTENANCE. The centre of a 3x3 has no legal
  is not 0.0                      move; a nonzero answer means renormalisation.

Answer is a single cell's      -> TERMINATION. You returned max(...) or dp[r][c].
  value, not the total            "Anywhere on the board" is a SUM of disjoint
                                  events, never a max.

Right for k=1, wrong for k>=2  -> MAINTENANCE. You wrote into `dp` while reading it
                                  instead of into a fresh `nxt`. Generation leak --
                                  Chapter 4 and Chapter 11 both warned you.

Drifts in the last few digits  -> floating point. Use the integer twin and divide
                                  by 8**k at the end, or compare with a tolerance.
```

> **The generation bug deserves special attention.** `dp[nr][nc] += dp[r][c]/8`
> in place lets a knight leap twice in one step. Chapter 4 called it the window;
> Chapter 11 called it reading a mask you already overwrote. Third appearance —
> **when a transition reads and writes the same axis, allocate a fresh layer.**

---

## Complexity

```
states     = k steps × n² squares
transition = O(8) = O(1)
TIME  = O(k · n²)
SPACE = O(n²)   -- rolled; the window reaches exactly one step back (Ch 4)
```

> `TIME = states × transition cost`, seventeen chapters unbroken.
>
> And note what is *absent*: no sentinel, no fill-order proof, no ordering
> debate. Time marches forward and that is the whole topology. **This family's
> difficulty is entirely in Slot 1 — deciding what the cell means — and in Slot 2
> — putting the weight on the right arrow.**

---

## Sibling: Expected Value (same table, a paying arrow)

Probability asks *"what is the chance?"*. Expectation asks *"what is the
average?"*. The transition is the same weighted sum, but each arrow may also
**pay** something:

```
P = Σ pᵢ · P_next                      probability
E = Σ pᵢ · (valueᵢ + E_next)           expected value
        ^^^^^^^^
        what this arrow pays you
```

> **Read the two lines side by side.** `valueᵢ` sits *inside* the weighted sum
> because the payment happens only if that arrow is taken. This is Chapter 9's
> "optional gain, INSIDE the branch" in probabilistic clothing.
>
> The classic base case: `E = 0` when the process is over — no steps remain, no
> further reward. **Derive it; do not copy `1.0` from the probability version.**
> A probability base is a point mass; an expectation base is a payoff.

---

## Sibling: Counting Under Randomness — Dice Roll Sum

> Roll `d` dice with `f` faces. How many ways to total exactly `target`?
> Probability = that count / `f^d`.

```python
def dice_sum_ways(dice, faces, target):
    MOD = 10 ** 9 + 7
    dp = [0] * (target + 1)                      # STATE: dp[t] = ways to reach total t so far
    dp[0] = 1                                    # BASE: ONE way to roll nothing and total 0
    for _ in range(dice):                        # one die at a time = one generation
        nxt = [0] * (target + 1)                 # fresh layer: a die may not be rolled twice
        for t in range(target + 1):
            if dp[t] == 0:
                continue
            for f in range(1, faces + 1):        # FULCRUM: what did THIS die show?
                if t + f <= target:
                    nxt[t + f] = (nxt[t + f] + dp[t]) % MOD    # TRANSITION: COUNT -> sum the doors
        dp = nxt
    return dp[target]                            # TERMINATION: the FORCED total

print(dice_sum_ways(1, 6, 3))        # expected: 1
print(dice_sum_ways(2, 6, 7))        # expected: 6
print(dice_sum_ways(30, 30, 500))    # expected: 222616187   (mod 1e9+7)
```

> `dp[0] = 1` — **one way to do nothing.** Chapter 5's Coin Change II and
> Chapter 16's `return 1` are the same truth. Three chapters, one base case,
> because all three are *counting*.
>
> And note the `MOD`: once you are counting rather than weighting, the numbers
> explode and you take them modulo a prime. A probability DP never needs this —
> it is bounded by `1` — but it *does* risk underflow over long horizons, which
> the integer version does not. **Pick the representation that matches the
> question.**

---

## The family roster

| Question | The cell holds | The transition |
|---|---|---|
| Knight Probability | P(on this square now) | `Σ (1/8) · source` |
| Knight Dialer | count of distinct numbers | `Σ source` (weights all 1) |
| Dice Roll Sum | count of ways to reach a total | `Σ source`, then `/ fᵈ` for P |
| Soup Servings | P(state) | 4 arrows at `1/4` each |
| New 21 Game | P(score is exactly `x`) | `Σ` over a **sliding window** |
| Expected steps to finish | E(steps from here) | `Σ pᵢ · (1 + E_next)` |
| Markov chain after `t` steps | the distribution | one matrix multiply per step |

---

## The problem Fortuna left you with

**New 21 Game.** Alice draws cards while her total is below `k`; each draw adds
a uniform `1 … maxPts`. What is the probability her final total is ≤ `n`?

The state is easy: `dp[x]` = probability of ever having exactly score `x`.
The transition is easy too:

```
dp[x] = (1 / maxPts) · Σ dp[j]     for the last maxPts values of j that are < k
```

And it is **too slow**, for a reason that has nothing to do with the DP:

```
dp[x]   sums dp[x-maxPts .. x-1]
dp[x+1] sums dp[x-maxPts+1 .. x]      ← the SAME numbers, minus one, plus one
```

You re-add `maxPts` values every step to compute a sum that changed by exactly
two elements. `O(n · maxPts)` where `O(n)` is sitting right there.

> **Your five slots are all correct and the algorithm is still wrong for the
> constraints.** That is a new kind of failure, and it is the last thing this
> book has to teach you.

The swordsman at the end of the hall is holding a rope knotted at both ends.

> Continue to `03 - your challenge.md`.
