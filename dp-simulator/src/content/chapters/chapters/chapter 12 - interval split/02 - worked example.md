# Chapter 12 · 02 — Worked Example: Matrix Chain Multiplication

> Five slots, then the Invariant Lens. New this chapter: a state with **two
> endpoints of one object**, a fill order driven by **interval length**, and a
> transition that both *chooses* and *combines* in the same line.

---

## The Problem

> `dims = [10, 30, 5, 60]` → three matrices: `A(10×30)`, `B(30×5)`, `C(5×60)`.
>
> Fusing `p×q` with `q×r` costs `p·q·r` scalar multiplications. You may not
> reorder, only re-parenthesise. Find the minimum total. (Expected: `4500`.)

---

## Slot 0 — FULCRUM

> **Ask yourself:** "Inside interval `[l, r]`, where was the **LAST** cut `k`?"

```
        l ──────── k │ k+1 ──────── r
        └─ solved ─┘ │ └─ solved ─┘
                     └── the final fusion, paid once
```

Doors: every `k` in `l … r-1`. Data-shaped, so it's a loop — but unlike
Chapter 10 the loop runs over **positions inside the interval**, not over
predecessors.

**Why the last cut?** Only the last cut leaves two halves that are each already
*completely finished*. Any earlier cut leaves them still entangled.

---

## Slot 1 — STATE

> `dp[l][r]` = the **minimum number of scalar multiplications needed to fuse
> matrices `l` through `r`, inclusive, into a single matrix.**

Say it out loud with "inclusive" in it. That word is Slot 1's contract with
Slot 2, and violating it is this chapter's #1 bug.

> `l` and `r` are **not** two progress dials (Chapter 9's `dp[i][w]` was that).
> They are the two ends of one stretch. Change either and you are describing a
> different object.

**Only the upper triangle is meaningful.** `dp[l][r]` with `l > r` describes an
interval that doesn't exist; it stays untouched.

---

## Slot 2 — TRANSITION

```python
dp[l][r] = min over k in [l, r-1] of (
              dp[l][k]                      # left half, fully fused
            + dp[k+1][r]                    # right half, fully fused
            + dims[l] * dims[k+1] * dims[r+1]   # the one final fusion
          )
```

**Where the merge cost comes from — derive it, never memorise it:**

```
matrix i has shape           dims[i]   × dims[i+1]
so the fused block [l..k]    dims[l]   × dims[k+1]
and the fused block [k+1..r] dims[k+1] × dims[r+1]
fusing them costs            dims[l] · dims[k+1] · dims[r+1]
```

**Choose vs combine, in one line:**

```
min over k of ( dp[l][k] + dp[k+1][r] + merge(k) )
 ^^^                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 CHOOSE: only one                COMBINE: this single parenthesisation
 parenthesisation                genuinely pays all three
 is ever used
```

**Mandatory vs optional:** the merge cost is *mandatory for a given `k`* — it
rides inside that candidate. Compare:

```
Ch 8   grid[r][c] + min(up, left)        one mandatory cost, OUTSIDE the choice
Ch 9   max(leave, take + value)          optional gain, INSIDE one branch
Ch 12  min over k of (a + b + merge(k))  merge depends on WHICH door -> INSIDE
```

Because `merge` depends on `k`, it **cannot** be factored outside the `min`.
That is the structural difference from Chapter 8.

---

## Slot 3 — BASE CASE  *(Initialization)*

**Derive it from the state sentence.** What does it cost to fuse matrices `i`
through `i` — a stretch of one block?

> Nothing. It is already a single matrix. Nothing to fuse.

```python
dp[i][i] = 0
```

Eighth chapter of base cases, still no two alike:

```
Ch 5  dp[0] = 0                Ch 9  dp[0][*] = 0
Ch 6  dp[0] = nums[0]          Ch 10 dp[*] = 1
Ch 7  row/col of 0s            Ch 11 -prices[0] / -inf / 0
Ch 8  dp[0][0] = grid[0][0]    Ch 12 dp[i][i] = 0   ← the whole DIAGONAL
```

The base is a **diagonal**, not an edge and not the whole grid. That is a
direct consequence of "the two indices are ends of one object": length-1
intervals are exactly the cells where `l == r`.

**The second initialisation — the `min` floor.** Before scanning cuts, seed the
cell with the sentinel:

```python
dp[l][r] = float('inf')     # no cut inspected yet; every real candidate beats it
```

> The sentinel law again: in a **min** problem the impossible/unvisited value is
> `+inf` (Ch 8 used it, Ch 11 used `-inf` for max). If a finished cell is still
> `inf`, your `k` loop never ran — that is an *Initialization/order* bug, and
> the lens will tell you so.

---

## Slot 4 — TERMINATION

> ### `dp[0][n-1]` — the whole stretch, and nothing less.

Vale demanded **all** the blocks fused. The endpoint is **forced on both sides**.

```
ENDPOINT FORCED     Ch 5 dp[amount] · Ch 8 dp[R-1][C-1] · Ch 9 dp[n][W] · Ch 12 dp[0][n-1]
ENDPOINT FREE       Ch 6 max(dp)    · Ch 10 max(dp)
LEGAL-END FILTER    Ch 11 max(sold, rest)
```

`min(dp[0])` is wrong and will often *look* right: the smallest entry in row 0
is `dp[0][0] = 0`. Reading the wrong cell here returns a clean, plausible,
completely fictional `0`.

> Watch out for `dp[0][-1]` in Python — it happens to be the same cell as
> `dp[0][n-1]`, so it works by accident here and will betray you the moment you
> pad the array (see Burst Balloons below, where `dp[0][-1]` is a *different*
> cell than the answer).

---

## Verify By Hand

Three matrices → intervals by length:

```
length 1  (BASE)
    dp[0][0] = dp[1][1] = dp[2][2] = 0

length 2  (one cut each)
    dp[0][1]: k=0 → 0 + 0 + dims[0]*dims[1]*dims[2] = 10*30*5  = 1500
    dp[1][2]: k=1 → 0 + 0 + dims[1]*dims[2]*dims[3] = 30*5*60  = 9000

length 3  (two cuts)
    dp[0][2]: k=0 → dp[0][0] + dp[1][2] + dims[0]*dims[1]*dims[3]
                  =    0     +  9000    +    10*30*60 = 18000     = 27000
              k=1 → dp[0][1] + dp[2][2] + dims[0]*dims[2]*dims[3]
                  =  1500    +    0     +    10*5*60  =  3000     =  4500
              min = 4500
```

```
answer = dp[0][2] = 4500
```

> **Look at what greed would have done.** The cheapest *single* fusion available
> at the start is `A·B` (1500) — and here that happens to be optimal. Now flip
> the dimensions to `[30, 1, 40, 10]`:
> `A·B = 30·1·40 = 1200`, `B·C = 1·40·10 = 400`. Greed takes `B·C`.
> `(A·B)·C = 1200 + 30·40·10 = 13200`. `A·(B·C) = 400 + 30·1·10 = 700`.
> Greed wins again — by luck. **The DP never relies on luck; that is the point.**

The final table (blank = never used):

```
        r=0     r=1     r=2
 l=0      0    1500    4500
 l=1      ·       0    9000
 l=2      ·       ·       0
```

Upper triangle only, base on the diagonal, answer in the top-right corner.

---

## The Code

```python
def matrix_chain(dims):
    n = len(dims) - 1                                    # number of matrices
    if n <= 1:                                           # BASE/guard: 0 or 1 matrix costs nothing
        return 0
    dp = [[0] * n for _ in range(n)]                     # STATE: dp[l][r] = min cost to fuse l..r inclusive
                                                         # BASE: dp[i][i] = 0 (the diagonal, already zero)
    for length in range(2, n + 1):                       # fill by INTERVAL LENGTH: all shorter ones are final
        for l in range(0, n - length + 1):
            r = l + length - 1
            dp[l][r] = float('inf')                      # sentinel floor for a min-problem
            for k in range(l, r):                        # FULCRUM: where was the LAST cut?
                merge = dims[l] * dims[k + 1] * dims[r + 1]
                dp[l][r] = min(dp[l][r],
                               dp[l][k] + dp[k + 1][r] + merge)   # TRANSITION: choose k, combine 3 costs
    return dp[0][n - 1]                                  # TERMINATION: the FORCED whole stretch

print(matrix_chain([10, 30, 5, 60]))       # expected: 4500
print(matrix_chain([10, 20, 30]))          # expected: 6000
print(matrix_chain([30, 1, 40, 10]))       # expected: 700
print(matrix_chain([40, 20, 30, 10, 30]))  # expected: 26000
print(matrix_chain([10, 30]))              # expected: 0     one matrix, nothing to fuse
print(matrix_chain([]))                    # expected: 0
```

### The same thing top-down (if the diagonal confuses you)

Recursion discovers the fill order for you — no length loop needed.

```python
from functools import lru_cache

def matrix_chain_topdown(dims):
    n = len(dims) - 1
    if n <= 1:
        return 0

    @lru_cache(maxsize=None)
    def best(l, r):                                      # STATE: same sentence, inclusive
        if l == r:                                       # BASE: a single matrix costs nothing
            return 0
        return min(best(l, k) + best(k + 1, r)           # TRANSITION: identical line
                   + dims[l] * dims[k + 1] * dims[r + 1]
                   for k in range(l, r))                 # FULCRUM: every cut is a door

    return best(0, n - 1)                                # TERMINATION: whole stretch

print(matrix_chain_topdown([10, 30, 5, 60]))       # expected: 4500
print(matrix_chain_topdown([40, 20, 30, 10, 30]))  # expected: 26000
```

> **Same transition line, different scaffolding.** Chapter 2's lesson, still
> true nine chapters later: top-down is a *direction*, not a pattern.

---

## Reconstructing the parentheses

Store the argmin, then walk the breadcrumbs — the general recipe from Ch 10.

```python
def matrix_chain_parens(dims):
    n = len(dims) - 1
    if n <= 0:
        return ""
    dp = [[0] * n for _ in range(n)]
    cut = [[-1] * n for _ in range(n)]                   # breadcrumb: the winning k
    for length in range(2, n + 1):
        for l in range(0, n - length + 1):
            r = l + length - 1
            dp[l][r] = float('inf')
            for k in range(l, r):
                cand = dp[l][k] + dp[k + 1][r] + dims[l] * dims[k + 1] * dims[r + 1]
                if cand < dp[l][r]:
                    dp[l][r] = cand
                    cut[l][r] = k                        # record WHICH door won
    def build(l, r):
        if l == r:
            return chr(ord('A') + l)
        k = cut[l][r]
        return "(" + build(l, k) + build(k + 1, r) + ")"
    return build(0, n - 1)

print(matrix_chain_parens([10, 30, 5, 60]))        # expected: ((AB)C)
print(matrix_chain_parens([30, 1, 40, 10]))        # expected: (A(BC))
print(matrix_chain_parens([40, 20, 30, 10, 30]))   # expected: ((A(BC))D)
```

---

## The Invariant Lens

| Loop-invariant phase | DP name | What it means here |
|---|---|---|
| **Initialization** | Base Case | The diagonal `dp[i][i] = 0` is the truth known without computation: one matrix needs no fusion. Each cell is additionally seeded to `inf` so the `min` has a floor no real candidate loses to. |
| **Maintenance** | Transition | When filling an interval of length `L`, **every** interval of length `< L` is already final. Both sources `dp[l][k]` and `dp[k+1][r]` are strictly shorter than `[l, r]` for every legal `k`, so the `min` over cuts is exactly the best parenthesisation of `[l, r]`. |
| **Termination** | State (final) | The loops end with every legal interval correct. The problem forces the full stretch, so the answer is the single cell `dp[0][n-1]` — the top-right corner. |

**Source-cell check:**

```
dp[l][r]  reads  dp[l][k]     length = k - l + 1   < r - l + 1   ✓ shorter
                 dp[k+1][r]   length = r - k       < r - l + 1   ✓ shorter
```

Both strictly shorter → the length loop is a valid topological order. **A
row-by-row loop is not**: it would compute `dp[0][2]` before `dp[1][2]` exists.

---

## Debugging With the Lens

```
Answer is inf                      -> INITIALIZATION / ORDER. The k loop never ran, or
                                      you looped by row instead of by length.

Answer is 0                        -> TERMINATION. You returned min(dp[0]) or dp[0][0].

Small n right, n >= 4 wrong        -> MAINTENANCE. Fill order. Row-major computes long
                                      intervals before the short ones they depend on.

Cost too low, roughly one          -> MAINTENANCE. You wrote dp[l][k] + dp[k][r]:
  multiplication short                matrix k is counted in both halves.

Cost wildly wrong, dimensions      -> MAINTENANCE. Merge indices. Re-derive from the
  look "shifted"                      shapes: dims[l] * dims[k+1] * dims[r+1].

Crash: list index out of range     -> the dims array has n+1 entries for n matrices.
                                      r+1 is legal; r+2 is not.

One matrix crashes                 -> BASE/guard. n <= 1 returns 0.
```

---

## Complexity

```
states     = O(n²) intervals  (the upper triangle)
transition = O(n) cuts per interval
TIME  = O(n²) × O(n) = O(n³)
SPACE = O(n²) — and it does NOT roll
```

> **Why it doesn't roll.** Chapter 4's cloth needed a *fixed-width window*.
> `dp[l][r]` reads sources scattered across the whole triangle at varying
> distances, so there is no constant number of rows to keep. `O(n²)` space is
> the honest price of the interval family.
>
> (Knuth's optimisation can cut matrix chain to `O(n²)` time by proving the
> optimal `k` is monotone. That is a *provable* narrowing of the door list —
> not something to assume. Chapter 18 revisits this idea properly.)

---

## Sibling: Burst Balloons (the padded variant)

> `nums = [3, 1, 5, 8]`. Bursting balloon `i` earns `left · nums[i] · right`,
> where `left`/`right` are its *current* neighbours. Burst all. (Expected: `167`.)

The naive fulcrum — *"which balloon do I burst FIRST?"* — is unusable: bursting
changes who everyone's neighbours are, so the two halves stay entangled.
Flip it:

> ### "Which balloon in this open interval is burst **LAST**?"

If `i` is last inside `(l, r)`, then when it pops its neighbours are exactly
`l` and `r` — they are still standing by definition. Now the halves are
independent. Pad with `1`s so the boundaries always exist.

```python
def burst_balloons(nums):
    vals = [1] + [x for x in nums] + [1]                 # padding: absent neighbours are worth 1
    n = len(vals)
    dp = [[0] * n for _ in range(n)]                     # STATE: dp[l][r] = best coins strictly BETWEEN l and r
                                                         # BASE: an empty open interval earns 0 (already zero)
    for length in range(2, n):                           # length = r - l, the gap width
        for l in range(0, n - length):
            r = l + length
            for i in range(l + 1, r):                    # FULCRUM: which balloon bursts LAST?
                dp[l][r] = max(dp[l][r],
                               dp[l][i] + dp[i][r]       # TRANSITION: note dp[l][i] + dp[i][r] --
                               + vals[l] * vals[i] * vals[r])  # OPEN interval, so i is shared, not doubled
    return dp[0][n - 1]                                  # TERMINATION: the whole padded stretch

print(burst_balloons([3, 1, 5, 8]))   # expected: 167
print(burst_balloons([1, 5]))         # expected: 10
print(burst_balloons([5]))            # expected: 5
print(burst_balloons([]))             # expected: 0
```

> **Read those two transitions side by side and the trap becomes obvious:**
>
> ```
> matrix chain   dp[l][k] + dp[k+1][r]     intervals are CLOSED (inclusive)
> burst balloons dp[l][i] + dp[i][r]       intervals are OPEN   (exclusive ends)
> ```
>
> Both are correct **for their own convention**. Copy one into the other and you
> silently double-count or skip an element. This is why Slot 1 must say the word
> "inclusive" or "exclusive" out loud, *every single time*.

---

## The family roster

| Problem | The stretch | The merge price |
|---|---|---|
| Matrix Chain | matrices `l..r` | `dims[l]·dims[k+1]·dims[r+1]` |
| Burst Balloons | balloons strictly between `l`,`r` | `vals[l]·vals[i]·vals[r]` |
| Optimal BST | keys `l..r` | sum of frequencies in the range |
| Polygon Triangulation | vertices `l..r` | area/perimeter of triangle `(l,k,r)` |
| Merge Stones / Minimum Cost to Cut a Stick | a segment | sum of the segment |

Same five slots every time. Only the merge price changes.

> Continue to `03 - your challenge.md`.
