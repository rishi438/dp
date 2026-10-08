# Chapter 6 · 02 — Worked Example: Maximum Subarray (Kadane)

> Five slots, then the Invariant Lens. Watch **slot 4** especially — it is the
> opposite of Corin's, and the reason is one sentence in the problem.

---

## The Problem

> `nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]`
> Find the **contiguous** subarray with the largest sum. Return that sum.
> (The subarray must contain at least one element.)

Two phrases do all the work:
- **contiguous** → Kade's family.
- **at least one element** → the base case cannot be `0`.

---

## Slot 0 — FULCRUM

> **Ask yourself:** "Does the streak ending at ME extend the previous streak, or start fresh?"

```
  EXTEND  →  dp[i-1] + nums[i]      (best run ending at i-1, plus me)
  RESTART →  nums[i]                (a brand-new run, just me)
```

Exactly two doors. Contiguity guarantees it.

---

## Slot 1 — STATE  *(the hard part)*

> `dp[i]` = the largest sum of a contiguous run **ENDING EXACTLY AT index `i`.**

**Why not the natural-sounding version?**

> ✗ `dp[i]` = best run anywhere within `nums[0..i]`

Try computing `dp[i]` from that `dp[i-1]`. You can't — it might describe a run
that ended five tiles ago, and a run that already ended **cannot be extended by
me.** The state failed to carry the fact the future needs: *does it touch my
doorstep?*

**"Ending exactly at i"** guarantees adjacency, which is exactly what makes the
transition expressible.

---

## Slot 2 — TRANSITION

```python
dp[i] = max(nums[i], dp[i-1] + nums[i])
```

`max` because the question says *"largest"* — an optimization, so **pick one
door**.

**An equivalent phrasing worth understanding:**

```python
dp[i] = nums[i] + max(0, dp[i-1])
```

Read it as: *"I always take my own tile (mandatory), and I inherit the past
only if the past is helping (optional)."*

> That's the **mandatory-vs-optional** rule: a mandatory cost sits **outside**
> the `max`; an optional gain sits **inside** it. Both forms are the same
> recurrence.

---

## Slot 3 — BASE CASE  *(Initialization)*

**Derive it from your own state definition. Do not copy `dp[0] = 0`.**

> `dp[0]` = "best run ending exactly at index 0."
> Only one run ends there: `nums[0]`.
> → `dp[0] = nums[0]`

Why `0` is a **bug**:

```
nums = [-3, -1, -2]
with dp[0] = 0  → answer 0   ✗ (an empty run — the problem forbids it)
with dp[0] = -3 → answer -1  ✓ (the least-bad single element)
```

> The problem said *"at least one element."* **That sentence is your base
> case.** Base cases are read out of the problem, never out of memory.

---

## Slot 4 — TERMINATION  *(the famous trap)*

> ### The answer is `max(dp)` — **NOT** `dp[-1]`.

Reason it from the state: `dp[i]` is *"best run ending at i."* So every index is
a **candidate ending point**. `dp[-1]` only surveys runs reaching the final
element.

```
nums   = [5, -100, 2]
dp     = [5,  -95, 2]

dp[-1]  = 2    ✗
max(dp) = 5    ✓   (the run [5])
```

```
Coin Change (Ch 5)  → dp[amount]   journey has a MANDATORY endpoint
Kadane      (Ch 6)  → max(dp)      journey may end ANYWHERE
```

> Slots 0–3 can be perfect and the problem is still wrong if slot 4 is wrong.
> **Always ask: does the problem force where the answer ends?**

---

## Verify By Hand

```
i  nums[i]   extend = dp[i-1]+nums[i]   restart = nums[i]   dp[i]   winner
0    -2              —                       —              -2     base
1     1        -2 + 1  = -1                   1               1     RESTART
2    -3         1 + -3 = -2                  -3              -2     extend
3     4        -2 + 4  =  2                   4               4     RESTART ←
4    -1         4 + -1 =  3                  -1               3     extend
5     2         3 + 2  =  5                   2               5     extend
6     1         5 + 1  =  6                   1               6     extend
7    -5         6 + -5 =  1                  -5               1     extend
8     4         1 + 4  =  5                   4               5     extend

dp = [-2, 1, -2, 4, 3, 5, 6, 1, 5]
max(dp) = 6   at index 6   →  the run [4, -1, 2, 1] = 6   ✓
```

Note `dp[-1] = 5`, but the answer is `6`. **The table proves the trap.**

---

## The Code

```python
def max_subarray(nums):
    dp = [0] * len(nums)                         # STATE: dp[i] = best run ENDING exactly at i
    dp[0] = nums[0]                              # BASE / INIT: only one run ends at index 0
    for i in range(1, len(nums)):                # FULCRUM: extend the previous run, or restart?
        dp[i] = max(nums[i], dp[i-1] + nums[i])  # TRANSITION: 2 doors, keep the better
    return max(dp)                               # TERMINATION: the run may end ANYWHERE

print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))   # expected: 6
print(max_subarray([5, -100, 2]))                      # expected: 5
print(max_subarray([-3, -1, -2]))                      # expected: -1  (all-negative)
```

---

## Space-Optimized (the real Kadane)

`dp[i]` reads only `dp[i-1]`, so the array collapses. But because termination
is `max(dp)` and we're discarding the array, we must **survey as we go** with a
second, separate variable:

```python
def kadane(nums):
    best_here = nums[0]      # STATE, rolled up: best run ENDING at the current index
    best_ever = nums[0]      # the running max(dp) — a DIFFERENT variable
    for x in nums[1:]:
        best_here = max(x, best_here + x)        # TRANSITION: extend or restart
        best_ever = max(best_ever, best_here)    # TERMINATION, done incrementally
    return best_ever

print(kadane([-2, 1, -3, 4, -1, 2, 1, -5, 4]))   # expected: 6
print(kadane([-3, -1, -2]))                      # expected: -1
```

> **The classic Kadane bug is using one variable for both.** `best_here` is a
> state cell; `best_ever` is the termination survey. Different questions.
> Never merge them.

---

## The Invariant Lens

| Loop-invariant phase | DP name       | What it means here                                           |
|----------------------|---------------|--------------------------------------------------------------|
| **Initialization**   | Base Case     | The starting truth known without computation: `dp[0] = nums[0]`, the only run ending at index 0. |
| **Maintenance**      | Transition    | One step forward preserves correctness. If `dp[i-1]` is the true best run ending at `i-1`, the best run ending at `i` is either that run extended or `nums[i]` alone — so `max` of the two is correct. |
| **Termination**      | State (final) | Loop ends → every `dp[i]` is correct. Since any run ends at *some* index, the global best is `max(dp)`. |

**Read the Termination row again.** In Ch 5 the same slot said *"return
`dp[amount]`"*; here it says *"return `max(dp)`."* The invariant proved every
cell correct — it is **your job** to then ask *which* correct cell answers the
question.

**Hidden requirement Maintenance exposes:** `dp[i-1]` must already be filled
when `dp[i]` is computed. The loop runs upward, so it is. ✓

---

## Debugging With the Lens

```
All-negative input returns 0?            → Initialization. You used dp[0] = 0.
Right on some arrays, wrong on others?   → Termination. You returned dp[-1].
Off only when a restart should happen?   → Maintenance. You wrote
                                           dp[i-1] + nums[i] without the max.
```

---

## Complexity

```
Time   O(n)            one pass, 2 fixed doors per cell
Space  O(n) → O(1)     rolled up into two scalars
```

---

## Sibling Problem — Max PRODUCT Subarray (why it's genuinely harder)

Swap `+` for `×` and the pattern breaks. Two negatives multiply into a large
positive, so **the minimum is a candidate for the future maximum.** One state
cell is no longer enough (TRAP 16 again) — you must track **two** per index:

```python
def max_product(nums):
    best = cur_max = cur_min = nums[0]   # STATE: best AND worst product ending here
    for x in nums[1:]:
        cand = (cur_max * x, cur_min * x, x)   # FULCRUM: extend from max, from min, or restart
        cur_max, cur_min = max(cand), min(cand)
        best = max(best, cur_max)              # TERMINATION: survey as we go
    return best

print(max_product([2, 3, -2, 4]))      # expected: 6
print(max_product([-2, 0, -1]))        # expected: 0
print(max_product([-2, 3, -4]))        # expected: 24   (all three: -2*3*-4)
```

> **The lesson:** when a rule (like a sign flip) lets a "bad" value become good
> later, your state needs another dimension. Same fulcrum, wider state.

---

## The Takeaway

```
0. FULCRUM      extend the run, or start fresh?    → always exactly 2 doors
1. STATE        "ENDING EXACTLY AT i"              → the phrase that makes it work
2. TRANSITION   max(nums[i], dp[i-1] + nums[i])    → one line
3. BASE         dp[0] = nums[0], DERIVED           → not 0; "at least one element"
4. TERMINATION  max(dp), NOT dp[-1]                → the run can end anywhere
5. LENS         Init / Maintain / Terminate        → proof, not hope
```

> Your turn: `03 - your challenge.md`. Challenge 5 hands you a *wrong* state
> and asks you to explain exactly why it cannot work. That is the skill.
