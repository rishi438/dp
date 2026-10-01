# Chapter 10 · 02 — Worked Example: Longest Increasing Subsequence

> Five slots, then the Invariant Lens. New this chapter: the fulcrum's answer
> is **a loop, not two doors**; the state must pin down its own endpoint; and
> termination goes back to `max(dp)` after three chapters of named exits.

---

## The Problem

> `nums = [10, 9, 2, 5, 3, 7, 101, 18]`
>
> Find the length of the longest **strictly increasing subsequence** — keep the
> original order, skip whatever you like, never reorder. (Expected: `4`.)

---

## Slot 0 — FULCRUM

> ### "My chain ends at index `i`. Which index came just BEFORE it?"

Answer it honestly and count the doors:

```
Any index j is a valid predecessor iff:
     j < i               it is to the LEFT        (order is the law)
     nums[j] < nums[i]   it is strictly smaller   (the increasing rule)

Plus one more door: NONE of them — index i starts the chain by itself.
```

That is **`0` to `i` doors, and the data decides how many.** Not a fixed pair.

```
Ch 8   doors fixed by GEOMETRY      2       → one line
Ch 9   doors fixed by the RULE      2       → one line
Ch 10  doors chosen by the DATA     0…i     → a LOOP
```

> The inner `for j in range(i)` you are about to write **is the fulcrum**. It
> is not scaffolding. It is the door list being enumerated one at a time.

---

## Slot 1 — STATE

> `dp[i]` = the **length of the longest strictly increasing subsequence that
> ENDS EXACTLY at index `i`** (so it always includes `nums[i]`).

**Why not the obvious state?** Try `dp[i] = "longest chain within the first i
elements"` and then ask: *can I extend it with `nums[i]`?* You can't answer —
that state knows a length but has forgotten **which value the chain ends on**,
and the entire rule is about that value.

> **A state that cannot answer the transition's question is the wrong state.**

Pinning the endpoint is now a three-time pattern:

```
Ch 6  Kade   "best run ENDING EXACTLY at i"
Ch 8  Grid   "cheapest cost to ARRIVE AT (r, c)"
Ch 10 Lissa  "longest chain ENDING EXACTLY at i"
```

The price you pay: `dp[i]` is no longer the answer for the prefix — which is
precisely why Slot 4 needs a survey.

---

## Slot 2 — TRANSITION

```python
for j in range(i):
    if nums[j] < nums[i]:
        dp[i] = max(dp[i], dp[j] + 1)
```

Read it as the fulcrum in symbols:

```
English                                        Symbol
--------------------------------------------   -------------------
"some earlier link j"                          for j in range(i)
"strictly shorter than link i"                 if nums[j] < nums[i]
"the best chain ending at j"                   dp[j]
"attach link i to it"                          + 1
"pick the best predecessor"                    max(...)
```

**`max`, not `+`.** *"Longest"* → optimize → **pick one door.** Summing would
count chains, which is a different problem (see *Number of LIS* below).

**`+ 1` is mandatory, and it is outside the choice** — you always gain exactly
one link (`nums[i]` itself) regardless of which predecessor you pick. Compare:

```
Ch 8  grid[r][c] + min(up, left)         mandatory cost, OUTSIDE
Ch 9  max(leave, take + values[i-1])     optional gain,  INSIDE
Ch 10 max over j of (dp[j] + 1)          mandatory +1 per door — every door pays it
```

**TRAP — one character.** `<` means *strictly* increasing. `<=` means
*non-decreasing*. On `[2, 2, 3]` that's `2` versus `3`. No error either way.
Read the problem's adjective before you type the operator.

---

## Slot 3 — BASE CASE  *(Initialization)*

**Derive from the state sentence.** What is `dp[i]` when **no** earlier index
qualifies?

> The chain ending at `i` is just `nums[i]` on its own → length **1**.

```python
dp = [1] * n        # every element is a chain of length one
```

**Not `0`.** `0` would claim *"no chain ends here"*, but one always does.

Two things are structurally new:

- The base is **every cell**, not an edge cell — because "no valid predecessor"
  can strike at any index, not only index `0`.
- The base and the transition **share a cell**. `dp[i]` starts at `1` and the
  loop only ever raises it. The initialisation is not just a starting value,
  it is the `max`'s *floor* — the "take no door" option, expressed as data.

```
Ch 5  dp[0] = 0             Ch 8  dp[0][0] = grid[0][0]
Ch 6  dp[0] = nums[0]       Ch 9  dp[0][*] = 0
Ch 7  row/col of 0s         Ch 10 dp[*] = 1   ← all cells, and it doubles as the floor
```

---

## Slot 4 — TERMINATION

> ### `max(dp)` — **not** `dp[-1]`.

`dp[i]` is the best chain *ending at `i`*. Lissa never demanded the chain end
on the last link, so the endpoint is **free** and you must survey.

```
ENDPOINT FORCED → read that cell        ENDPOINT FREE → survey with max()
  Ch 5  dp[amount]                        Ch 6  max(dp)
  Ch 8  dp[R-1][C-1]                      Ch 10 max(dp)
  Ch 9  dp[n][W]
```

**Why this is a genuine trap and not a formality.** On the given input,
`dp = [1, 1, 1, 2, 2, 3, 4, 4]`, so `dp[-1] = 4` — accidentally correct.
Append one small number and the luck runs out:

```
nums = [10, 9, 2, 5, 3, 7, 101, 18]      dp[-1] = 4   max(dp) = 4   ✓ by luck
nums = [10, 9, 2, 5, 3, 7, 101, 18, 1]   dp[-1] = 1   max(dp) = 4   ✗ / ✓
```

> Also: `max(dp)` on an **empty** input raises `ValueError`. The correct LIS of
> `[]` is `0`. Guard it — that's a real edge case, not a nicety.

---

## Verify By Hand

```
index:    0    1    2    3    4    5     6    7
nums:    10    9    2    5    3    7   101   18
dp:       1    1    1    2    2    3     4    4
```

Cell by cell:

```
dp[0] = 1                        nothing to the left
dp[1] = 1                        10 is not < 9  → no door
dp[2] = 1                        10, 9 both ≥ 2 → no door
dp[3] = 2                        doors: {2}          → dp[2]+1 = 2
dp[4] = 2                        doors: {2}          → dp[2]+1 = 2   (5 ≥ 3, not a door)
dp[5] = 3                        doors: {2, 5, 3}    → max(1,2,2)+1 = 3
dp[6] = 4                        doors: {10,9,2,5,3,7} → max(1,1,1,2,2,3)+1 = 4
dp[7] = 4                        doors: {10,9,2,5,3,7} (101 ≥ 18) → 3+1 = 4

answer = max(dp) = 4
```

Two different chains achieve it — `2 → 5 → 7 → 18` and `2 → 3 → 7 → 18`.
**The optimum is not unique, and that's fine.** DP returns the *value* of the
optimum; reconstruction returns *one* witness.

Note `101` has `dp[6] = 4` as well, but its chain (`2 → 3 → 7 → 101`) is a dead
end — nothing after it is larger. The table records it anyway, because `dp[6]`
answers a question about index 6 only.

---

## The Code

```python
def lis_length(nums):
    if not nums:                                     # TERMINATION guard: max([]) raises; LIS of [] is 0
        return 0
    n = len(nums)
    dp = [1] * n                                     # STATE: dp[i] = longest chain ENDING EXACTLY at i
                                                     # BASE/INIT: every element alone is a chain of length 1
    for i in range(n):
        for j in range(i):                           # FULCRUM: which index came just BEFORE i?
            if nums[j] < nums[i]:                    #          a door exists only if j is smaller (STRICTLY)
                dp[i] = max(dp[i], dp[j] + 1)        # TRANSITION: best predecessor + this link
    return max(dp)                                   # TERMINATION: the chain may end ANYWHERE -> survey

print(lis_length([10, 9, 2, 5, 3, 7, 101, 18]))   # expected: 4
print(lis_length([0, 1, 0, 3, 2, 3]))             # expected: 4
print(lis_length([7, 7, 7, 7]))                   # expected: 1    strict: equal is not increasing
print(lis_length([5, 4, 3, 2, 1]))                # expected: 1    fully decreasing
print(lis_length([]))                             # expected: 0
```

---

## Reconstructing the Chain (not just its length)

The table already contains the answer; you just need a breadcrumb per cell.

```python
def lis_sequence(nums):
    if not nums:
        return []
    n = len(nums)
    dp = [1] * n
    prev = [-1] * n                                  # breadcrumb: which j did dp[i] come from?
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i] and dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
                prev[i] = j                          # record the winning door, not just its value
    end = max(range(n), key=lambda i: dp[i])         # TERMINATION: where the best chain ends
    chain = []
    while end != -1:                                 # walk the breadcrumbs backwards
        chain.append(nums[end])
        end = prev[end]
    return chain[::-1]

print(lis_sequence([10, 9, 2, 5, 3, 7, 101, 18]))   # expected: [2, 5, 7, 101]
print(lis_sequence([0, 1, 0, 3, 2, 3]))             # expected: [0, 1, 2, 3]
```

> **Look at the first output.** `dp[6] = dp[7] = 4`, and `max(range(n), key=…)`
> returns the *first* index achieving the maximum — so it reconstructs
> `[2, 5, 7, 101]`, not `[2, 5, 7, 18]`. Both are length 4. Both are correct.
> **Reconstruction returns one witness, chosen by your tie-breaking rule; if
> you want a specific one, you must say so in the code.**

> **The general reconstruction recipe**, reusable in every chapter: store the
> argmax alongside the max, then walk backwards from the termination cell. The
> DP gives you the *value*; the breadcrumbs give you the *witness*.

---

## The Invariant Lens

| Loop-invariant phase | DP name       | What it means here                                            |
|----------------------|---------------|---------------------------------------------------------------|
| **Initialization**   | Base Case     | Before the inner loop runs, `dp[i] = 1` — the truth known without computation: `nums[i]` alone is a valid chain. It is also the `max`'s floor, i.e. the "no predecessor" door. |
| **Maintenance**      | Transition    | When computing `dp[i]`, every `j < i` is already final (the outer loop ascends and never revisits). So `max(dp[j] + 1)` over the legal doors is exactly the best chain ending at `i`. |
| **Termination**      | State (final) | The loop ends with every `dp[i]` correct for *its own* endpoint. No single cell is the answer, because the endpoint is unconstrained — hence `max(dp)`. |

**Source-cell check:**

```
dp[j] for all j < i   → strictly earlier indices   ✓ all final
```

Ascending `i` is the only order that works. Descend it and every `dp[j]` you
read is still `1`, and the function returns... `2`. Quietly.

---

## Debugging With the Lens

```
Always returns 1              → Initialization is fine but the comparison is
                                backwards (nums[j] > nums[i]) or j-loop empty.
Always returns 0              → Initialization. You wrote dp = [0] * n.
Off by one too large on ties  → Maintenance. You used <= (non-decreasing) when
                                the problem said strictly increasing.
Right on your test, wrong on  → Termination. You returned dp[-1]. Add a small
  a longer one                  number to the end of your test and watch it die.
ValueError: max() empty       → Termination. Guard nums == [].
```

---

## The `O(n log n)` Version — Patience, and a Warning

Sorting cards into piles ("patience sorting") gets the *length* in
`O(n log n)`. Keep an array `tails`, where `tails[k]` is the **smallest
possible tail value** of any increasing subsequence of length `k+1`:

```python
from bisect import bisect_left

def lis_length_fast(nums):
    tails = []                          # tails[k] = smallest tail among chains of length k+1
    for x in nums:
        k = bisect_left(tails, x)       # first tail >= x  (bisect_right -> non-decreasing variant)
        if k == len(tails):
            tails.append(x)             # x extends the longest chain so far
        else:
            tails[k] = x                # x makes a length-(k+1) chain end SMALLER -> more future room
    return len(tails)                   # TERMINATION: the LENGTH of tails, never its contents

print(lis_length_fast([10, 9, 2, 5, 3, 7, 101, 18]))   # expected: 4
print(lis_length_fast([0, 1, 0, 3, 2, 3]))             # expected: 4
print(lis_length_fast([7, 7, 7, 7]))                   # expected: 1
print(lis_length_fast([]))                             # expected: 0
```

Trace it:

```
10  → [10]
 9  → [9]                replace: a length-1 chain ending in 9 beats one ending in 10
 2  → [2]
 5  → [2, 5]             append
 3  → [2, 3]             replace index 1
 7  → [2, 3, 7]          append
101 → [2, 3, 7, 101]     append
 18 → [2, 3, 7, 18]      replace index 3
                         length 4  ✓
```

> ### TRAP — `tails` is NOT the answer chain.
> Its **length** is always right. Its **contents** may not be a subsequence of
> the input at all:
> ```
> nums = [1, 3, 5, 2]   →  tails = [1, 2, 5]
> But 1, 2, 5 appear at indices 0, 3, 2 — that is not left-to-right order.
> A real LIS here is [1, 3, 5].
> ```
> Never print `tails` and call it the chain. If you need the actual sequence,
> use the `O(n²)` breadcrumb version, or track parent indices alongside
> `bisect`.

**Why `bisect_left`?** It finds the first tail `>= x`, so an equal value
*replaces* rather than extends — which enforces **strictly** increasing.
Swap to `bisect_right` and you get the non-decreasing variant. Same one-character
trap as `<` vs `<=`, wearing a different hat.

---

## The Counting Cousin — Number of LIS

Same fulcrum, same doors. Carry a second array: how many chains achieve
`dp[i]`.

```python
def number_of_lis(nums):
    if not nums:
        return 0
    n = len(nums)
    dp = [1] * n                                # STATE 1: longest chain ending at i
    cnt = [1] * n                               # STATE 2: how many such chains   BASE: exactly one (itself)
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:
                if dp[j] + 1 > dp[i]:
                    dp[i] = dp[j] + 1
                    cnt[i] = cnt[j]             # a strictly better chain -> RESET the count
                elif dp[j] + 1 == dp[i]:
                    cnt[i] += cnt[j]            # a tie -> ACCUMULATE (choose became combine)
    best = max(dp)
    return sum(c for l, c in zip(dp, cnt) if l == best)   # TERMINATION: survey, then sum the winners

print(number_of_lis([1, 3, 5, 4, 7]))       # expected: 2    [1,3,4,7] and [1,3,5,7]
print(number_of_lis([2, 2, 2, 2, 2]))       # expected: 5    five chains of length 1
```

> **Choose vs combine in the same function.** `dp` picks (`>`), `cnt` sums
> (`+=`) — but only on ties. And note the termination is neither `max` nor a
> single cell: it is *"survey for the best, then combine all cells that tie."*
> A third termination shape, derived not copied.

---

## Complexity

```
lis_length       Time O(n²)        n states × O(n) doors each
                                   = (distinct states) × (cost of one transition)
lis_length_fast  Time O(n log n)   n elements × one binary search
Space            O(n) both
```

> The complexity formula from Chapter 2 finally does real work here. In
> Chapters 8 and 9 the transition was `O(1)`, so time *looked* like "number of
> cells". It never was. `TIME = states × transition cost`, and this chapter is
> where the second factor stops being 1.

---

## Siblings — the same table, different clothes

```
Max Sum Increasing Subsequence   dp[i] = best SUM ending at i    dp[j] + nums[i]
Longest Chain of Pairs           sort by first, then LIS on second
Russian Doll Envelopes           sort w asc, h DESC, then LIS on h  (the desc kills ties)
Longest Divisible Subset         nums[i] % nums[j] == 0 after sorting
Min Deletions to Sort            n - lis_length(nums)
Longest Bitonic Subsequence      LIS from the left + LIS from the right, combined at each i
```

```python
def max_sum_increasing(nums):
    if not nums:
        return 0
    dp = list(nums)                              # STATE: best SUM of a chain ending at i
                                                 # BASE: the element alone -> nums[i], NOT 1 and NOT 0
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + nums[i])
    return max(dp)

print(max_sum_increasing([1, 101, 2, 3, 100, 4, 5]))   # expected: 106   1+2+3+100
print(max_sum_increasing([10, 5, 4, 3]))               # expected: 10
```

> Look at the base case. Same fulcrum, same loop, same termination — but
> `dp = [1]*n` became `dp = list(nums)`, because the state now measures a
> **sum**, not a **count**. Copying the base from `lis_length` would have
> returned nonsense with no error. Sixth chapter, same lesson.

---

## The Takeaway

```
0. FULCRUM      "which index came just BEFORE i?"  → 0…i doors → A LOOP
1. STATE        dp[i] = longest chain ENDING EXACTLY at i
                pin the endpoint, or the transition has nothing to attach to
2. TRANSITION   max over legal j of (dp[j] + 1)    → `<` strict, `<=` non-decreasing
3. BASE         dp[i] = 1 for ALL i, DERIVED       → also acts as the max's floor
4. TERMINATION  max(dp)                            → endpoint is FREE, so survey
5. LENS         ascending i keeps every dp[j] final; TIME = states × transition cost
```

> Your turn: `03 - your challenge.md`. Challenge 3 hands you an input where
> `dp[-1]` is right by luck and asks you to break it yourself.
