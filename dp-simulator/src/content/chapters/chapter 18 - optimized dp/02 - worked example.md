# Chapter 18 · 02 — Worked Example: Jump Game VI

> Five slots, then the Invariant Lens. New this chapter: **nothing in the five
> slots changes.** The state, the transition, the base and the termination are
> all written first in the obvious `O(nk)` form — and then we change only *how
> the transition is evaluated*.

---

## The Problem

> `nums = [1, -1, -2, 4, -7, 3]`, `k = 2`.
>
> Start at index `0`. From index `i` you may jump to any index in
> `i+1 … i+k` that is still in bounds. You must reach the last index. Every
> index you **land on** adds its value to your score. Maximise the score.
> (Expected: `7` — the path `1 → -1 → 4 → 3`.)

---

## Slot 0 — FULCRUM

> ### "I am standing on index `i`. Which index did I jump FROM?"

```
doors = every j with   i - k  ≤  j  ≤  i - 1   and   j ≥ 0

dp[i] = nums[i] + max over those j of dp[j]
```

Lissa's fulcrum, almost exactly (Ch 10) — *"which one came just before me?"* —
but with a hard leash: the predecessor must be **within `k` steps**. That leash
is the entire chapter, because it makes the door list a **sliding window**.

```
Ch 10  doors = every j < i, filtered by VALUE     → an unavoidable O(n) scan
Ch 18  doors = every j in [i-k, i-1], no filter   → a CONTIGUOUS window
```

> **Contiguity is the gift.** A filtered-by-value set has no structure to
> exploit. A contiguous window that slides by one changes by exactly **two
> elements** per step — one in, one out.

---

## Slot 1 — STATE

> `dp[i]` = the **maximum score obtainable on a valid path from index `0` that
> ENDS EXACTLY at index `i`** (and therefore includes `nums[i]`).

"Ends exactly at" again — Kade (Ch 6), Gridlock (Ch 8), Lissa (Ch 10), Maska
(Ch 15), and now Swift. Fifth appearance. **Pin the endpoint or the transition
cannot ask about a predecessor.**

> **And this sentence does not change for the rest of the chapter.** Whatever
> the deque does, `dp[i]` means exactly this. If an "optimisation" forces you to
> rewrite Slot 1, it is not an optimisation — it is a different algorithm.

---

## Slot 2 — TRANSITION

```python
dp[i] = nums[i] + max(dp[max(0, i - k) : i])
```

| English | Symbol |
|---|---|
| "I must land here, so I always take this value" | `nums[i] +` |
| "I came from somewhere within `k` steps behind" | `dp[i-k : i]` |
| "take the best such origin" | `max(...)` |

**Mandatory vs optional, one last time.** `nums[i]` sits **outside** the `max`:
you land on `i` no matter which door you used, so the value is unconditional.
That is Chapter 8's `grid[r][c] + min(...)` shape.

```
Ch 8   grid[r][c] + min(up, left)      mandatory cost, OUTSIDE
Ch 9   max(leave, take + value)        optional gain,  INSIDE one branch
Ch 18  nums[i] + max(window)           mandatory gain, OUTSIDE
```

**This line is correct. It is also the bottleneck.** `max(...)` over `k` values,
`n` times, is `O(nk)` — and with `n = k = 10⁵` that is `10¹⁰`.

---

## Slot 3 — BASE CASE  *(Initialization)*

```python
dp[0] = nums[0]
```

**Derive from the state sentence.** *"The best score of a path that ends exactly
at index 0"* — the only such path is standing still on the start. You have not
jumped, and you still collect `nums[0]`.

> **Not `0`.** You *land* on index `0`, so its value counts even if it is
> negative. Compare Chapter 6: `dp[0] = nums[0]`, for precisely the same reason —
> a run must contain its own first element. Two chapters, twelve apart, same
> derivation. **That is not a licence to copy it; it is a coincidence you should
> verify each time.**

Fourteenth chapter of base cases:

```
Ch 5  dp[0] = 0 (min) / 1 (count)   Ch 12 dp[i][i] = 0
Ch 6  dp[0] = nums[0]               Ch 13 dp[i][i] = 1, dp[l>r] = 0
Ch 7  row/col of 0s                 Ch 14 (0, 0) at the absent node
Ch 8  dp[0][0] = grid[0][0]         Ch 15 dp[{0}][0] = 0, rest inf
Ch 9  dp[0][*] = 0                  Ch 16 return 1 at pos == n
Ch 10 dp[*] = 1                     Ch 17 dp[start] = 1.0 (point mass)
Ch 11 -prices[0] / -inf / 0         Ch 18 dp[0] = nums[0]
```

---

## Slot 4 — TERMINATION

> ### `dp[n-1]` — **not** `max(dp)`.

The problem says *"you must reach the last index."* The endpoint is **forced**.

```
ENDPOINT FORCED    Ch 5 · Ch 8 · Ch 12 · Ch 13 · Ch 18
ENDPOINT FREE      Ch 6 max(dp) · Ch 10 max(dp)
```

> **This is the exact trap Chapter 10 warned you about, with the sign flipped.**
> There, the endpoint was free and your fingers wanted `dp[-1]`. Here the
> endpoint is forced and — because the state sentence looks identical to Kade's
> and Lissa's — your fingers will want `max(dp)`.
>
> On this input `dp = [1, 0, -1, 4, -3, 7]`, so `max(dp) = 7` too. **Correct by
> accident.** Append one bad value:
>
> ```
> nums = [1, -1, -2, 4, -7, 3, -100],  k = 2
> dp   = [1,  0, -1, 4, -3, 7, -93]
> dp[-1] = -93   ← correct: you MUST land on the last index
> max(dp) = 7    ← wrong: that path stops early, which is not allowed
> ```
>
> **Read the problem statement, not the table shape.** Twelfth reminder; last
> one you get.

---

## Verify By Hand

```
index:    0    1    2    3    4    5
nums:     1   -1   -2    4   -7    3      k = 2
```

```
dp[0] = 1                                        BASE

dp[1] = -1 + max(dp[0])          = -1 + 1  =  0
dp[2] = -2 + max(dp[0], dp[1])   = -2 + 1  = -1
dp[3] =  4 + max(dp[1], dp[2])   =  4 + 0  =  4
dp[4] = -7 + max(dp[2], dp[3])   = -7 + 4  = -3
dp[5] =  3 + max(dp[3], dp[4])   =  3 + 4  =  7      ← answer = dp[5]
```

```
dp = [1, 0, -1, 4, -3, 7]        path: 0 → 1 → 3 → 5   (1 + -1 + 4 + 3 = 7)
```

> Note `dp[2] = -1` and `dp[4] = -3` are both correct cells that are never used
> by the winning path. **A cell being optimal for its own sentence does not make
> it part of the answer.** Chapter 15 made the same point; it is worth knowing
> in your bones.

### Now trace the deque doing the same work

Maintain indices whose `dp` values are strictly decreasing, front to back.

```
i=0   dp[0]=1.  push.                            dq = [0]        (values: 1)

i=1   expire front? dq[0]=0 < 1-2 = -1 ?  no
      max = dp[dq[0]] = dp[0] = 1
      dp[1] = -1 + 1 = 0
      pop back while dp[back] <= 0:  dp[0]=1 > 0  → stop
      push 1                                     dq = [0,1]      (1, 0)

i=2   expire front? 0 < 2-2 = 0 ?  no
      max = dp[0] = 1
      dp[2] = -2 + 1 = -1
      pop back while dp[back] <= -1: dp[1]=0 > -1 → stop
      push 2                                     dq = [0,1,2]    (1, 0, -1)

i=3   expire front? 0 < 3-2 = 1 ?  YES → pop 0   dq = [1,2]
      expire again? 1 < 1 ? no
      max = dp[1] = 0
      dp[3] = 4 + 0 = 4
      pop back while dp[back] <= 4:
            dp[2] = -1 ≤ 4  → pop                dq = [1]
            dp[1] =  0 ≤ 4  → pop                dq = []
      push 3                                     dq = [3]        (4)

i=4   expire front? 3 < 4-2 = 2 ? no
      max = dp[3] = 4
      dp[4] = -7 + 4 = -3
      pop back while dp[back] <= -3: dp[3]=4 > -3 → stop
      push 4                                     dq = [3,4]      (4, -3)

i=5   expire front? 3 < 5-2 = 3 ? no
      max = dp[3] = 4
      dp[5] = 3 + 4 = 7                          ← answer
```

> **Watch `i=3`.** `dp[3] = 4` arrives and annihilates *both* survivors. `dp[2]`
> and `dp[1]` were older **and** smaller — they will expire sooner and they are
> worth less, so no future window can ever prefer them. **That is the dominance
> rule, and it is the only idea in the deque.**
>
> Total pushes: 6. Total pops: 3. Every index enters once and leaves at most
> once → **amortised `O(1)` per step**, even though a single step popped twice.

---

## The Code

### First: the correct, slow version. Write this one first, always.

```python
def jump_game_vi_slow(nums, k):
    n = len(nums)
    dp = [0] * n                                   # STATE: dp[i] = best score ENDING EXACTLY at i
    dp[0] = nums[0]                                # BASE: you land on index 0; its value counts
    for i in range(1, n):                          # FULCRUM: which index did I jump FROM?
        window = dp[max(0, i - k):i]               #          every predecessor within k
        dp[i] = nums[i] + max(window)              # TRANSITION: mandatory nums[i], OUTSIDE the max
    return dp[n - 1]                               # TERMINATION: the last index is FORCED

print(jump_game_vi_slow([1, -1, -2, 4, -7, 3], 2))              # expected: 7
print(jump_game_vi_slow([10, -5, -2, 4, 0, 3], 3))              # expected: 17
print(jump_game_vi_slow([1, -5, -20, 4, -1, 3, -6, -3], 2))     # expected: 0
print(jump_game_vi_slow([5], 1))                                # expected: 5
print(jump_game_vi_slow([1, -1, -2, 4, -7, 3, -100], 2))        # expected: -93
```

> That last test is the termination trap made concrete: `max(dp)` would say `7`.
> **Keep it in your test list forever.**

### Then: the same five slots, a faster evaluation

```python
from collections import deque

def jump_game_vi(nums, k):
    n = len(nums)
    dp = [0] * n                                   # STATE: unchanged
    dp[0] = nums[0]                                # BASE: unchanged
    dq = deque([0])                                # indices, dp-values strictly decreasing front→back
    for i in range(1, n):
        while dq and dq[0] < i - k:                # 1. EXPIRE the front: out of the window
            dq.popleft()
        dp[i] = nums[i] + dp[dq[0]]                # 2. READ: the front IS max(dp[i-k..i-1])
        while dq and dp[dq[-1]] <= dp[i]:          # 3. EVICT the back: older AND smaller = dead
            dq.pop()
        dq.append(i)                               # 4. PUSH -- strictly after step 2
    return dp[n - 1]                               # TERMINATION: unchanged

print(jump_game_vi([1, -1, -2, 4, -7, 3], 2))              # expected: 7
print(jump_game_vi([10, -5, -2, 4, 0, 3], 3))              # expected: 17
print(jump_game_vi([1, -5, -20, 4, -1, 3, -6, -3], 2))     # expected: 0
print(jump_game_vi([5], 1))                                # expected: 5
print(jump_game_vi([1, -1, -2, 4, -7, 3, -100], 2))        # expected: -93
```

> **Put the two functions side by side and read the diff.**
> Slot 1, Slot 3 and Slot 4 are character-for-character identical. Slot 2 means
> the same thing. **The only change is how `max(window)` is obtained.** That is
> the definition of an optimisation, and it is how you tell one from a rewrite.

**The four steps, in this order, for a reason:**

```
1. expire the front   the window's left edge has moved right
2. READ the front     this is max(dp[i-k .. i-1])
3. evict the back     anything ≤ dp[i] can never win again
4. push i             i is a candidate for i+1, NOT for itself
```

> Swap 2 and 4 and `dp[i]` becomes a candidate for its own transition. The code
> still runs. It answers a different question. **Order is semantics, not
> style** — Chapters 4, 9, 11, 13 and 17 all taught this; this is the sixth and
> final costume.

### Prove they agree

```python
import random

def agree(trials=300):
    for _ in range(trials):
        n = random.randint(1, 30)
        k = random.randint(1, n)
        nums = [random.randint(-20, 20) for _ in range(n)]
        if jump_game_vi(nums, k) != jump_game_vi_slow(nums, k):
            return nums, k
    return True

print(agree())      # expected: True
```

> **Never ship the fast version without this.** Deque bugs are invisible by
> inspection and obvious under randomised comparison. Same discipline as
> Chapter 16's brute force.

---

## The Invariant Lens

The DP's lens is unchanged. What is new is a **second invariant**, belonging to
the data structure:

| Loop-invariant phase | DP name | What it means here |
|---|---|---|
| **Initialization** | Base Case | `dp[0] = nums[0]`, and `dq = [0]` — a one-element deque is trivially decreasing and trivially in range. |
| **Maintenance** | Transition | Two claims must hold before step `i` reads the front: **(a)** every index in `dq` lies in `[i-k, i-1]`, guaranteed by the front eviction; **(b)** their `dp` values are strictly decreasing, guaranteed by the back eviction. Together they make `dp[dq[0]]` exactly `max(dp[i-k..i-1])`. |
| **Termination** | State (final) | Every `dp[i]` is the best score ending exactly at `i`; the problem forces the path to end at `n-1`, so the answer is `dp[n-1]`. |

**The deque invariant, stated so you can check it:**

```
dq holds indices j₁ < j₂ < … < jₘ   with   i-k ≤ j₁   and   dp[j₁] > dp[j₂] > … > dp[jₘ]
```

> **Why the front is the max.** The values are decreasing, so the front is the
> largest *in the deque*. And nothing was ever discarded that could have beaten
> it: an index is only popped from the back when a **newer** index has a
> **greater-or-equal** value — a candidate that is both older and smaller is
> dominated forever, because it expires sooner and is worth less.
>
> That two-clause argument is the proof. If you can say it out loud, you own the
> deque. If you cannot, you are pattern-matching.

---

## Debugging With the Lens

```
Answer too large              -> MAINTENANCE (order). You pushed i before reading
                                 the front, so dp[i] fed its own transition.

Answer ignores k              -> MAINTENANCE. The front eviction is missing or the
                                 bound is off: it must be `dq[0] < i - k`.

IndexError on dq[0]           -> MAINTENANCE. You evicted the whole deque. With the
                                 correct order dq is never empty at step 2, because
                                 index i-1 was pushed on the previous iteration.

Answer is 7 instead of -93    -> TERMINATION. You returned max(dp). The last index
                                 is FORCED -- re-read the problem statement.

Answer is 0 for all-negative  -> BASE. You set dp[0] = 0. You LAND on index 0.
  inputs

Fast and slow disagree only   -> TRAP 3. `<` vs `<=` on the back eviction. Both give
  on inputs with ties            the same max; if they diverge, something else is
                                 wrong -- go find it, do not flip the operator.

Deque stores the wrong thing  -> TRAP 2. You appended dp[i] instead of i, so you can
                                 no longer test expiry.
```

---

## Complexity

```
                     states   ×   transition   =   TIME
slow version           n      ×      O(k)      =   O(n·k)
deque version          n      ×  O(1) amortised =  O(n)
SPACE                                              O(n) dp + O(k) deque
```

**Why "amortised".** One step popped twice; another popped zero times. But each
index is pushed exactly once and popped at most once across the entire run, so
the total pop count is `≤ n`. **Bound the total, not the step.**

```
n = k = 10⁵     slow: 10¹⁰ operations      deque: ~2 × 10⁵
```

> `TIME = states × transition cost` — eighteen chapters, unbroken. Every previous
> chapter attacked the left factor. **This one attacked the right, and changed
> nothing else.**

---

## Rope 1: Fortuna's homework — New 21 Game

The problem she left you: `dp[x]` = probability of ever holding exactly score
`x`. The transition sums the previous `maxPts` values that are below `k`:

```
dp[x] = (1 / maxPts) · Σ dp[j]     for j in [x-maxPts, x-1] with j < k
```

`O(n · maxPts)`. But a **sum** can be undone by subtraction — no deque needed.

```python
def new21_slow(n, k, maxPts):
    if k == 0 or n >= k + maxPts - 1:              # degenerate: you can never bust
        return 1.0
    dp = [0.0] * (n + 1)                           # STATE: dp[x] = P(score is ever exactly x)
    dp[0] = 1.0                                    # BASE: you start on 0 with certainty
    for i in range(1, n + 1):
        s = 0.0
        for j in range(max(0, i - maxPts), i):     # FULCRUM: which score did I draw FROM?
            if j < k:                              #          you only draw while below k
                s += dp[j]
        dp[i] = s / maxPts                         # TRANSITION: weighted SUM (Chapter 17)
    return sum(dp[k:n + 1])                        # TERMINATION: stopped (>= k) and not bust (<= n)

def new21(n, k, maxPts):
    if k == 0 or n >= k + maxPts - 1:
        return 1.0
    dp = [0.0] * (n + 1)
    dp[0] = 1.0
    window = 1.0                                   # ROPE 1: the running sum of dp[j], j < k, in range
    ans = 0.0
    for i in range(1, n + 1):
        dp[i] = window / maxPts                    # TRANSITION: identical meaning, O(1) evaluation
        if i < k:
            window += dp[i]                        # what ENTERED (only if it can be drawn from)
        else:
            ans += dp[i]                           # TERMINATION accumulated on the fly
        if 0 <= i - maxPts < k:
            window -= dp[i - maxPts]               # what LEFT
    return ans

print(new21_slow(21, 17, 10), new21(21, 17, 10))   # expected: 0.7327777870686082 0.7327777870686082
print(new21_slow(10, 1, 10),  new21(10, 1, 10))    # expected: 1.0 1.0
print(new21_slow(6, 1, 10),   new21(6, 1, 10))     # expected: 0.6000000000000001 0.6
```

> **Look at that last line.** The two versions disagree in the sixteenth decimal
> place — because they add the same numbers in a different order, and floating
> point addition is not associative. Neither is "wrong".
>
> **Compare probability DPs with a tolerance, never with `==`.** This is a real
> hazard of Chapter 17's family that Chapter 18's ropes make worse: a running sum
> accumulates rounding differently from a fresh sum each step. If drift matters,
> use the integer twin (Ch 17) or `math.isclose`.

> **Two lines replaced an inner loop: one for what entered, one for what left.**
> Swift's first rope, and it is the one you will reach for most often.
>
> Note the guard `if 0 <= i - maxPts < k` — the entering condition and the
> leaving condition must match *exactly*, or the window drifts. **Derive both
> from the same predicate (`j < k` and in range), never from symmetry.**

---

## Rope 2 elsewhere: Sliding Window Maximum

The same deque with the DP removed — worth writing once on its own, because
then you will recognise it inside a transition.

```python
from collections import deque

def sliding_window_max(nums, k):
    dq, out = deque(), []
    for i, x in enumerate(nums):
        while dq and dq[0] <= i - k:               # expire: left edge moved right
            dq.popleft()
        while dq and nums[dq[-1]] <= x:            # dominated: older AND smaller
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            out.append(nums[dq[0]])                # the front is the window max
    return out

print(sliding_window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))   # expected: [3, 3, 5, 5, 6, 7]
print(sliding_window_max([1], 1))                          # expected: [1]
print(sliding_window_max([9, 8, 7, 6], 2))                 # expected: [9, 8, 7]
```

> **Note the expiry bound differs from Jump Game VI** (`<= i - k` here,
> `< i - k` there). That is not a typo: here the window *includes* index `i`;
> there it *excludes* it. **Derive the bound from your own window definition
> every single time.** This is Chapter 12's inclusive/exclusive discipline,
> arriving one last time.

---

## Rope 3 elsewhere: LIS in `O(n log n)`

Chapter 10's LIS scanned every predecessor. Keep `tails[j]` = the **smallest
possible tail value** of an increasing subsequence of length `j+1` — that array
is always sorted, so the scan becomes a binary search.

```python
from bisect import bisect_left

def lis_fast(nums):
    tails = []                                     # tails[j] = smallest tail of an LIS of length j+1
    for x in nums:                                 #            ALWAYS SORTED -> binary searchable
        pos = bisect_left(tails, x)                # strict increase: bisect_left. (bisect_right = non-decreasing)
        if pos == len(tails):
            tails.append(x)                        # x extends the longest chain so far
        else:
            tails[pos] = x                         # x makes a length-(pos+1) chain end LOWER
    return len(tails)                              # TERMINATION: the LENGTH is the answer

print(lis_fast([10, 9, 2, 5, 3, 7, 101, 18]))   # expected: 4
print(lis_fast([0, 1, 0, 3, 2, 3]))             # expected: 4
print(lis_fast([7, 7, 7, 7]))                   # expected: 1
print(lis_fast([]))                             # expected: 0
```

> **This one is NOT the same DP made faster, and Swift says so plainly.**
> `tails` is a different state — its cells are not `dp[i]` and the array is
> **not** an increasing subsequence of `nums`. On `[10, 9, 2, 5, 3, 7, 101, 18]`
> the final `tails` is `[2, 3, 7, 18]`, which happens to be a real answer; on
> other inputs it is not a valid subsequence at all. Only its **length** is
> guaranteed.
>
> **Know what you traded.** You bought `O(n log n)` and you sold easy
> reconstruction. Chapter 10's `O(n²)` version with breadcrumbs is still the
> honest choice when you need the actual chain.

---

## The decision table

| Your transition scans… | Use | Cost |
|---|---|---|
| a sliding window, **summed** | a running sum (`+= in`, `-= out`) | `O(1)` |
| arbitrary ranges, **summed** | a prefix-sum array | `O(1)` per query |
| a sliding window, **max/min** | a monotonic deque | `O(1)` amortised |
| a sorted candidate list | binary search | `O(log n)` |
| "nearest smaller/greater to the left" | a monotonic **stack** | `O(1)` amortised |
| lines / linear costs, minimised | convex hull trick | `O(log n)` |
| an interval split with a **proved** monotone argmin | Knuth optimisation | drops one factor of `n` |
| a filtered-by-value set with no structure | **nothing. `O(n²)` is the price.** | — |

> **The last row is the most important one.** Not every transition can be
> accelerated. Chapter 10's LIS window is filtered by *value*, not by *position*,
> which is exactly why the `O(n log n)` version had to change the state instead
> of the evaluation. **Recognising that a trick does not exist is a skill.**

---

## The Final Checklist

Eighteen chapters, one procedure. This is the book, compressed:

```
0. FULCRUM       "What was the LAST decision that landed me here?"
                 The answer is a LIST OF DOORS.
                 Few fixed doors → one line.  Many data-driven doors → a loop.

1. STATE         dp[...] = ONE English sentence.
                 If it cannot answer the fulcrum's question, it is WRONG.
                 Pin the endpoint: "ending exactly at…", "given that…".

2. TRANSITION    The fulcrum, in symbols.
                   min/max  = CHOOSE one door        (optimizing)
                   +        = COMBINE / COUNT        (counting)
                   Σ pᵢ·(…) = WEIGHTED COMBINE       (probability)
                 Mandatory cost → OUTSIDE the choice.
                 Optional gain  → INSIDE one branch.

3. BASE CASE     DERIVE it from the state sentence. NEVER copy it.
                 Impossible world → sentinel (inf / -inf / 0 ways).
                 Counting → 1 ("one way to do nothing").
                 Probability → a point mass.

4. TERMINATION   WHERE does the answer live?
                   endpoint forced         → read that cell
                   endpoint free           → survey with max
                   some end-states illegal → filter, then survey
                   disjoint events         → SUM the table
                   a returned value        → the root of the recursion
                   + a cost outside the table (Ch 15)

   THEN, and only then:
5. COST          TIME = states × transition cost.
                 Is the right factor a scan over a structured set?
                 → sum / deque / binary search / stack / proved monotonicity
                 Is it unstructured? → that IS the price. Stop looking.

VERIFY           Initialization / Maintenance / Termination.
                 And a brute force. Always a brute force.
```

---

## The road back

> There is no Chapter 19. There is `03 - your challenge.md`, and then every
> `03 - your challenge.md` from Chapter 0 to Chapter 17 that you have not yet
> answered.
>
> You have the map. Now walk it.

> Continue to `03 - your challenge.md`.
