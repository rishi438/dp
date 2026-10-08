# Chapter 9: Work through taking or skipping an item

**Question:** A bag holds at most 7 weight units. Which whole items give the highest value? Each item can be taken only once.

```text
Item:    A  B  C  D
Weight:  1  3  4  5
Value:   1  4  5  7
```

B and C fit exactly: weight `3 + 4 = 7`, value `4 + 5 = 9`. The answer is **9**.

## 1. Say what one table entry means

`dp[i][w]` = largest total value using the first `i` items, with total weight **at most** `w`.

For example, `dp[2][3]` uses only A and B, with limit 3. Taking B gives value 4, so this entry is **4**.

Row 0 means no items. Row 1 introduces A, at list index 0. That is why row `i` reads `weights[i - 1]` and `values[i - 1]`.

## 2. Start at zero

With no items, the best value is 0 at every capacity. With positive weights, zero capacity also gives 0. Create a table filled with zeros.

## 3. Compare the two choices

For an item of weight `weight` and value `value`:

```text
skip = dp[i - 1][w]
take = dp[i - 1][w - weight] + value   (only if weight <= w)
```

Keep the larger value. Both choices use the **previous row**, which contains only earlier items. This prevents taking the current item twice.

At capacity 7, adding C gives:

```text
skip C: dp[2][7]     = 5
take C: dp[2][3] + 5 = 4 + 5 = 9
save 9
```

Next, adding D gives:

```text
skip D: dp[3][7]     = 9
take D: dp[3][2] + 7 = 1 + 7 = 8
keep 9
```

Taking D would leave too little room for B or C. The best answer can therefore skip the most valuable single item.

## 4. Run it

```python
def knapsack_01(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        weight, value = weights[i - 1], values[i - 1]
        for w in range(capacity + 1):
            skip = dp[i - 1][w]
            dp[i][w] = skip
            if weight <= w:
                take = dp[i - 1][w - weight] + value
                dp[i][w] = max(skip, take)
    return dp[n][capacity]

print(knapsack_01([1, 3, 4, 5], [1, 4, 5, 7], 7))  # 9
```

The final row includes all items. Its entry for capacity 7 contains the answer, **9**. The bag need not be full for a solution to be valid.

**Common mistake:** using the current row for the "take" calculation. That can reuse the item. First learn this version with separate rows; the optional details explain how to safely reduce it to one array.


---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 9 · 02 — Worked Example: 0/1 Knapsack

> Five slots, then the Invariant Lens. New this chapter: the second dimension
> is a **budget you spend**, the optional gain lives **inside** its branch, and
> the rolled array must iterate **backwards** or it silently solves a different
> problem.

---

## The Problem

> ```
> weights = [1, 3, 4, 5]
> values  = [1, 4, 5, 7]
> capacity W = 7
> ```
> Each relic may be taken **at most once**, and never in part.
> Maximise total value without exceeding the capacity. (Expected: `9`.)

---

## Slot 0 — FULCRUM

> **Ask yourself:** "Looking at the LAST relic: did I take it, or leave it?"

Not *"which relic first"* — that's forward and branches into `2ⁿ` futures.
Stand at the end and reverse the decision. Two doors, always two:

```
LEAVE relic i   →  capacity unchanged, one fewer relic to consider
TAKE  relic i   →  capacity SPENT by wt[i], one fewer relic, value gained
```

> **What's new:** in Chapter 8 the second index was a *position* and a move
> changed where you stood. Here the second index is a *resource*, and only one
> of the two doors bills you for it.

---

## Slot 1 — STATE

> `dp[i][w]` = the **maximum value obtainable using only the first `i` relics,
> with a capacity of exactly `w` stone available.**

Two dimensions, two different jobs:

```
i  = HOW FAR through the item list I am   (progress)
w  = HOW MUCH sack I still have           (resource)
```

**The off-by-one contract is back** (Chapter 8's holiday is over). We need a
row meaning *"no relics considered yet"*, so:

```
dp has (n+1) rows and (W+1) columns.
Row i = "the first i relics"  ⇒  row i talks about relic number i,
                                  which lives at index i-1.

        dp[i][w]   ←→   weights[i-1],  values[i-1]
```

> Write that contract as a comment above your loop. Every off-by-one bug in
> this family comes from skipping that one line.

---

## Slot 2 — TRANSITION

```python
leave = dp[i-1][w]                                  # no gain, no cost
take  = dp[i-1][w - weights[i-1]] + values[i-1]     # only if it fits
dp[i][w] = max(leave, take)
```

Three things to read off it:

**1. `i-1` in both doors.** Each relic is offered exactly once — that is
literally what "0/1" means. Reaching back to row `i-1` guarantees the relic
cannot be taken again inside its own decision.

**2. The gain is INSIDE the branch.** You only collect `values[i-1]` if you
actually take the relic, so it cannot be factored out:

```
MANDATORY cost  → OUTSIDE the min/max     Ch 8:  grid[r][c] + min(up, left)
OPTIONAL  gain  → INSIDE  the branch      Ch 9:  max(leave, take + values[i-1])
```

**3. `max`, not `+`.** *"Maximise the worth"* → optimize → **pick one door**.
The counting cousin at the bottom of this file uses `+` instead, and that one
word is the whole difference.

**The door that doesn't fit.** If `weights[i-1] > w`, then `w - weights[i-1]`
is negative — and Python will happily index from the end of the list and return
a real number. Silent, plausible, wrong. Guard it:

```python
if weights[i-1] <= w:
    dp[i][w] = max(leave, take)
else:
    dp[i][w] = leave            # the 'take' door does not exist
```

> Fifth chapter, same law: **a door that does not exist must never be
> selectable.**

---

## Slot 3 — BASE CASE  *(Initialization)*

**Derive it from the state sentence.**

> `dp[0][w]` = "best value from the first **0** relics with `w` capacity."
> No relics to choose from → you obtain nothing → **`0`, for every `w`.**

> `dp[i][0]` = "best value from `i` relics with **0** capacity."
> Nothing fits → **`0`.**

Row zero is a *claim*, not padding: *"with no items, every capacity is
worthless."* That claim is what makes row 1 computable.

```
It happens to be 0 here — and that is exactly why you must still derive it.
Same-shaped row zero, three different truths in this one chapter:

  0/1 Knapsack   dp[0][*] = 0        no items → no value
  Subset Sum     dp[0][0] = True     the empty set sums to 0
                 dp[0][t>0] = False  the empty set cannot reach a positive t
  Count Subsets  dp[0][0] = 1        exactly ONE way to make 0: take nothing
```

If you had copied row zero from Knapsack into Subset Sum, you'd get `False`
everywhere and the algorithm would return `False` for every input.

---

## Slot 4 — TERMINATION

> `dp[n][W]` — all `n` relics considered, full capacity on the table.

Not `max(dp[n])`, and it's worth knowing *why* rather than just obeying:
row `n` is **non-decreasing in `w`** (more capacity can never hurt — you can
always ignore it), so the largest value in that row is already at the far
right. `dp[n][W]` and `max(dp[n])` are equal here, but only one of them says
what you mean.

```
Ch 5 Coin Change  → dp[amount]        Ch 8 Min Path Sum → dp[R-1][C-1]
Ch 6 Kadane       → max(dp)           Ch 9 Knapsack     → dp[n][W]
Ch 7 LCS          → dp[m][n]
```

---

## Verify By Hand

Rows = relics added one at a time. Columns = capacity `0…7`.

```
                w:  0   1   2   3   4   5   6   7
  i=0  (none)       0   0   0   0   0   0   0   0     ← BASE
  i=1  A (w1,v1)    0   1   1   1   1   1   1   1
  i=2  B (w3,v4)    0   1   1   4   5   5   5   5
  i=3  C (w4,v5)    0   1   1   4   5   6   6   9
  i=4  D (w5,v7)    0   1   1   4   5   7   8   9     ← answer = dp[4][7] = 9
```

Four cells traced in full:

```
dp[2][3] = max( leave = dp[1][3] = 1,
                take  = dp[1][3-3] + 4 = dp[1][0] + 4 = 0 + 4 = 4 )  → 4
dp[2][2] = leave only  (B weighs 3 > 2, the take door does not exist)  → 1
dp[3][7] = max( leave = dp[2][7] = 5,
                take  = dp[2][7-4] + 5 = dp[2][3] + 5 = 4 + 5 = 9 )  → 9
dp[4][7] = max( leave = dp[3][7] = 9,
                take  = dp[3][7-5] + 7 = dp[3][2] + 7 = 1 + 7 = 8 )  → 9
```

The winning sack is `B + C`: weight `3+4 = 7`, value `4+5 = 9`.
Note that **D, the single most valuable relic, is not in the answer.** Greed by
value gives `D + A = 8`. This is the chapter in one line.

---

## The Code

```python
def knapsack_01(weights, values, capacity):
    # CONTRACT: row i = "the first i relics"  ->  relic i is weights[i-1], values[i-1]
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]       # STATE: dp[i][w] = best value, first i relics, capacity w
                                                            # BASE/INIT: row 0 and column 0 are 0 -> no relics or no room = no value
    for i in range(1, n + 1):
        wt, val = weights[i-1], values[i-1]
        for w in range(capacity + 1):
            leave = dp[i-1][w]                              # FULCRUM: did I take the LAST relic, or leave it?
            if wt <= w:
                take = dp[i-1][w - wt] + val                # TRANSITION: gain is OPTIONAL -> inside its own branch
                dp[i][w] = max(leave, take)                 #             i-1 on both doors -> relic used at most ONCE
            else:
                dp[i][w] = leave                            # the 'take' door does not exist -> never selectable
    return dp[n][capacity]                                  # TERMINATION: all relics considered, full capacity

print(knapsack_01([1, 3, 4, 5], [1, 4, 5, 7], 7))   # expected: 9    (B + C)
print(knapsack_01([2, 3], [3, 4], 6))               # expected: 7    (both, weight 5)
print(knapsack_01([10], [99], 5))                   # expected: 0    (nothing fits)
print(knapsack_01([], [], 5))                       # expected: 0    (no relics at all)
```

---

## The Invariant Lens

| Loop-invariant phase | DP name       | What it means here                                            |
|----------------------|---------------|---------------------------------------------------------------|
| **Initialization**   | Base Case     | Row 0 is the starting truth known without computation: with **zero relics**, every capacity yields value `0`. Derived from the state sentence, not copied. |
| **Maintenance**      | Transition    | Adding relic `i` preserves correctness: every cell of row `i` reads only row `i-1`, which is complete and final. Because both doors reach back a full row, relic `i` cannot contribute twice. |
| **Termination**      | State (final) | The outer loop ends at `i = n` (all relics offered) and the answer sits at `w = W` (full capacity). `dp[n][W]` **is** the state sentence evaluated at the full problem. |

**Source-cell check** (the habit from Chapters 7 and 8):

```
dp[i-1][w]        → previous row   ✓ complete
dp[i-1][w - wt]   → previous row   ✓ complete
```

Both doors live in the row above, so the inner loop's direction is
**irrelevant** in the 2D version. Ascending or descending, same answer.
**Remember that sentence** — the next section is about what happens when it
stops being true.

---

## TRAP — The Rolled Array Must Run Backwards

Both doors read row `i-1`, so one array is enough… *if* you keep row `i-1`
alive long enough to read it.

```python
def knapsack_01_rolled(weights, values, capacity):
    dp = [0] * (capacity + 1)                   # STATE, rolled: dp[w] = best value for capacity w
    for wt, val in zip(weights, values):        # BASE/INIT: all zeros = "no relics offered yet"
        for w in range(capacity, wt - 1, -1):   # BACKWARD: keeps dp[w-wt] in the PREVIOUS generation
            dp[w] = max(dp[w], dp[w - wt] + val)
        # stopping at wt-1 also removes the need for an 'if wt <= w' guard
    return dp[capacity]                         # TERMINATION: full capacity

print(knapsack_01_rolled([1, 3, 4, 5], [1, 4, 5, 7], 7))   # expected: 9
print(knapsack_01_rolled([2, 3], [3, 4], 6))               # expected: 7
```

**Why backward.** `dp[w - wt]` sits to the *left* of `dp[w]`.

```
BACKWARD (w descends)   dp[w-wt] has NOT been touched this pass
                        → it is still generation i-1  → "before this relic existed"
                        → relic used AT MOST ONCE                        0/1  ✓

FORWARD  (w ascends)    dp[w-wt] was ALREADY overwritten this pass
                        → it is generation i          → "this relic may already be in there"
                        → relic reusable without limit                   UNBOUNDED
```

Trace the backward pass on the example and you get the 2D table's rows back,
exactly:

```
start          0  0  0  0  0  0  0  0
after A(1,1)   0  1  1  1  1  1  1  1     ← identical to row i=1
after B(3,4)   0  1  1  4  5  5  5  5     ← identical to row i=2
after C(4,5)   0  1  1  4  5  6  6  9     ← identical to row i=3
after D(5,7)   0  1  1  4  5  7  8  9     ← identical to row i=4    answer 9
```

**Now flip the direction and watch it lie:**

```python
def knapsack_forward_bug(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for wt, val in zip(weights, values):
        for w in range(wt, capacity + 1):       # FORWARD -- this is UNBOUNDED knapsack
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[capacity]

print(knapsack_01_rolled([2, 3], [3, 4], 6))       # expected: 7   0/1:       one 2 + one 3
print(knapsack_forward_bug([2, 3], [3, 4], 6))     # expected: 9   UNBOUNDED: three 2s
```

> `7` vs `9`. **No exception. No warning. No crash.** The forward loop is a
> perfectly correct program — it just answers a question nobody asked. This is
> the single most dangerous bug class in DP, and the only defence is the habit
> you have been drilling since Chapter 7: *before writing a loop, ask which
> generation each source cell belongs to.*
>
> And the flip side: that "bug" **is** the correct solution to Unbounded
> Knapsack — and therefore to Corin's Coin Change in Chapter 5. Go back and
> look at Corin's loop. It ascends. Now you know why.

---

## Debugging With the Lens

```
Answer too LARGE, items seem duplicated  → Maintenance. Rolled loop runs
                                           forward; you solved Unbounded.
Answer too SMALL / always 0              → Initialization. Row 0 wrong, or you
                                           returned dp[0][W].
IndexError, or a weirdly good answer for → Maintenance. Missing `wt <= w`
  tiny capacities                          guard; negative index wrapped around.
Off by exactly one relic                 → Contract. You used weights[i] where
                                           the row means weights[i-1].
All cells right, answer wrong            → Termination. You read dp[n-1][W] or
                                           dp[n][W-1].
```

---

## The Counting Cousin — Count Subsets With a Given Sum

Same fulcrum, same two doors, same table shape. One verb changes:

```
"best value under capacity"   → max(leave, take)      OPTIMIZE: pick one door
"how many subsets sum to T"   → leave + take          COUNT:    sum the doors
```

And the base flips with it: `dp[0][0] = 1` — there is exactly **one** subset of
the empty set that sums to zero: the empty subset itself.

```python
def count_subsets(nums, target):
    dp = [0] * (target + 1)         # STATE, rolled: dp[t] = number of subsets summing to exactly t
    dp[0] = 1                       # BASE/INIT: ONE way to make 0 -> take nothing. Not 0.
    for x in nums:
        for t in range(target, x - 1, -1):   # BACKWARD: still 0/1 -> each number used at most once
            dp[t] += dp[t - x]               # TRANSITION: COUNT -> ADD the doors instead of picking one
    return dp[target]                        # TERMINATION: exactly the target, not "at most"

print(count_subsets([1, 1, 2, 3], 4))   # expected: 3    {1a,3} {1b,3} {1a,1b,2}
print(count_subsets([2, 4, 6], 5))      # expected: 0    unreachable
print(count_subsets([0, 1], 1))         # expected: 2    {1} and {0,1}
```

> **Choose vs combine, again, in its purest form.** `max` → `+`.
> `dp[0] = 0` → `dp[0] = 1`. Everything else is byte-identical.
> This is on your weak-point list. Read the two functions side by side twice.

---

## The Boolean Cousin — Subset Sum & Equal Partition

Can a subset hit the target exactly? Combine with `or`.

```python
def subset_sum(nums, target):
    dp = [False] * (target + 1)     # STATE, rolled: dp[t] = is sum t reachable?
    dp[0] = True                    # BASE/INIT: the EMPTY subset reaches 0. Derived, not copied.
    for x in nums:
        for t in range(target, x - 1, -1):    # BACKWARD: each number at most once
            dp[t] = dp[t] or dp[t - x]        # TRANSITION: boolean -> combine with OR
    return dp[target]                         # TERMINATION

def can_partition(nums):
    total = sum(nums)
    if total % 2:                   # an odd total can never split into two equal halves
        return False
    return subset_sum(nums, total // 2)        # REDUCTION: "split evenly" IS "hit total/2"

print(subset_sum([3, 34, 4, 12, 5, 2], 9))    # expected: True    4 + 5
print(subset_sum([3, 34, 4, 12, 5, 2], 30))   # expected: False
print(can_partition([1, 5, 11, 5]))           # expected: True    {11} vs {1,5,5}
print(can_partition([1, 2, 3, 5]))            # expected: False   total 11 is odd
```

> **`can_partition` is the real prize of this chapter.** The problem never
> mentions a sack, a weight, or a capacity. Recognising that *"split into two
> equal halves"* is *"reach `total/2` exactly"* is pattern recognition — the
> skill `pattern.md` exists to build. The DP was already written; the work was
> seeing the family.

---

## Complexity

```
Time   O(n × W)              every (item, capacity) pair, O(1) work (2 doors)
Space  O(n × W) → O(W)       roll to one array, iterate backwards
```

> **A warning you will need later.** `O(n × W)` is called *pseudo-polynomial*:
> it is polynomial in the *value* `W`, not in the number of *bits* used to
> write `W`. Double the digits of `W` and the runtime explodes. `W = 10⁹` with
> `n = 10` is hopeless here even though `n` is tiny. When capacity is huge and
> `n` is small, you need a different tool — Chapter 15's bitmask is one of them.

---

## The Takeaway

```
0. FULCRUM      "the LAST relic: take it or leave it?"  → two doors, always two
1. STATE        dp[i][w] = best value, first i relics, capacity w
                            i = progress,  w = RESOURCE you spend
2. TRANSITION   max(dp[i-1][w], dp[i-1][w-wt] + val)    → gain INSIDE the branch
                i-1 on BOTH doors                       → that is what "0/1" means
3. BASE         dp[0][*] = 0, DERIVED                   → and it is 1 / True in the cousins
4. TERMINATION  dp[n][W]                                → all items, full capacity
5. LENS         rolled array: BACKWARD = 0/1, FORWARD = unbounded. Not style. Semantics.
```

> Your turn: `03 - your challenge.md`. Challenge 4 hands you a forward loop
> that returns a perfectly reasonable wrong number and asks you to name the
> problem it actually solved.


</details>
