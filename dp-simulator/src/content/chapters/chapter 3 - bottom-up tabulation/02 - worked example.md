# Chapter 3 example: Build a table for House Robber

Houses contain `[2, 7, 9, 3, 1]` coins. You may choose houses, but **you cannot choose two neighbors**. Find the largest total. You may skip every house; the amounts here are nonnegative.

**Answer: 12**, by choosing amounts `2 + 9 + 1`.

## 1. The choices at each house

When considering a house, either:

- **Skip it:** keep the best result from the houses before it.
- **Take it:** add its amount to the best result that excludes its immediate neighbor.

These cover every valid plan: the current house is either chosen or skipped.

## 2. What dp stores

`dp[i]` = the largest total using the first `i` houses.

Here `i` is a **count of houses**. The newest house's array index is `i-1`, so its amount is `nums[i-1]`.

## 3. Starting answers and calculation

`dp[0] = 0`: no houses means no coins.

`dp[1] = nums[0]`: with one nonnegative amount, choose that house.

For each later house:

```text
skip = dp[i-1]
take = dp[i-2] + nums[i-1]
dp[i] = max(skip, take)
```

`max` chooses the better complete plan. The addition happens only inside the "take" option because skipping the house gives us none of its coins.

## 4. Fill from left to right

| Houses considered | Skip | Take | Best total |
|---|---|---|---|
| None | ? | ? | 0 |
| 2 | ? | ? | 2 |
| 2, 7 | 2 | 0 + 7 | 7 |
| 2, 7, 9 | 7 | 2 + 9 | 11 |
| 2, 7, 9, 3 | 11 | 7 + 3 | 11 |
| All five | 11 | 11 + 1 | 12 |

Every calculation reads earlier cells. That is why this fill order works.

```python
def rob(nums):
    n = len(nums)
    if n == 0:
        return 0
    dp = [0] * (n + 1)
    dp[1] = nums[0]
    for i in range(2, n + 1):
        skip = dp[i - 1]
        take = dp[i - 2] + nums[i - 1]
        dp[i] = max(skip, take)
    return dp[n]

print(rob([2, 7, 9, 3, 1]))  # 12
print(rob([2, 1, 1, 2]))     # 4
print(rob([]))                # 0
```

## 5. Read the final answer

`dp[n]` considers all houses. It already includes the option to skip the last one.

**Common mistake:** using `dp[i-1] + nums[i-1]` for "take." That earlier plan may include the neighboring house. Reading `dp[i-2]` leaves that neighbor out.

The loop visits each house once: `O(n)` time and `O(n)` table space.

---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 3 · 02 — Worked Example: Flipping Top-Down Into Bottom-Up

> I flip one problem you know, then one you don't, and **prove both with the
> Invariant Lens**. By the end you should be able to convert any memoized
> solution mechanically.

---

## Part A — The Mechanical Flip (Fibonacci)

### Step 1 — Start from the memoized version

```python
def fib_td(n, memo=None):
    if memo is None:
        memo = {}
    if n in memo:
        return memo[n]
    if n <= 2:                    # BASE
        return 1
    memo[n] = fib_td(n-1, memo) + fib_td(n-2, memo)   # TRANSITION
    return memo[n]
```

### Step 2 — The four mechanical substitutions

```
1. memo{}            →  dp[] of the right size
2. base case `if`    →  direct assignment into dp
3. recursive calls   →  array reads
4. the ORDER         →  a for-loop that guarantees reads land on written cells
```

Only substitution **4** requires thought. The other three are typing.

### Step 3 — Determine the fill order

> **The Bottom-Up Question:** when I compute `dp[i]`, is every cell it reads
> already written?

```
dp[i] reads dp[i-1] and dp[i-2]     → both have SMALLER indices
therefore: iterate i ASCENDING       → they are always behind us ✓
```

### Step 4 — The flipped code

```python
def fib_bu(n):
    if n <= 2:
        return 1
    dp = [0] * (n + 1)              # STATE: dp[i] = the i-th Fibonacci number
    dp[1] = dp[2] = 1               # BASE / INITIALIZATION
    for i in range(3, n + 1):       # MAINTENANCE: ascending, so i-1 and i-2 are ready
        dp[i] = dp[i-1] + dp[i-2]   # TRANSITION — byte-identical to top-down
    return dp[n]                    # TERMINATION: the value we asked for

print(fib_bu(10))       # expected: 55
print(fib_bu(50))       # expected: 12586269025
print(fib_bu(100))      # expected: 354224848179261915075
```

And the thing top-down could never do:

```python
import sys
print(len(str(fib_bu(100000))))   # expected: 20899  (digits) — no RecursionError
print(sys.getrecursionlimit())    # ~1000 — the wall top-down hits
```

> Top-down dies around `n = 1000`. Bottom-up handles `n = 100000` without
> flinching, because **there is no stack.** That is the whole point of the
> chapter.

### Step 5 — Prove it with the Lens

| Loop-invariant phase | DP name       | What it means here                                                      |
|----------------------|---------------|-------------------------------------------------------------------------|
| **Initialization**   | Base Case     | The starting truth known without computation: `dp[1] = dp[2] = 1`, true by definition of Fibonacci. |
| **Maintenance**      | Transition    | One step forward preserves correctness. If `dp[1..i-1]` are correct, then `dp[i-1]` and `dp[i-2]` are correct, so their sum is the correct `dp[i]`. |
| **Termination**      | State (final) | Loop ends at `i = n`, so `dp[n]` is correct — and `dp[n]` is what we return. |

**The hidden requirement Maintenance exposes:** `i-1 < i` and `i-2 < i`, and
the loop ascends, so both reads land on written cells. ✓

---

## Part B — A Problem You Haven't Flipped: House Robber

> Houses in a row, each holding `nums[i]` gold. **You may not rob two adjacent
> houses.** Maximise the loot.
> `nums = [2, 7, 9, 3, 1]` → `12` (houses 0, 2, 4 → 2 + 9 + 1).

### The five slots

```
0. FULCRUM     "What did I decide about the LAST house?"
               ROB it   → then house i-1 was forbidden, so I come from i-2
               SKIP it  → then I keep whatever I had at i-1
               Two doors.

1. STATE       dp[i] = the maximum loot considering houses 0..i
               (considering — not necessarily robbing house i)

2. TRANSITION  dp[i] = max( dp[i-1],              # skip me
                            dp[i-2] + nums[i] )   # rob me (+ my gold)

3. BASE CASE   DERIVE it by applying the state sentence at small i:
                 dp[0] = nums[0]              only one house, rob it
                 dp[1] = max(nums[0], nums[1])  two houses, adjacent → take the better

4. TERMINATION dp[n-1] — "considering ALL houses". The last cell already
               accounts for every earlier possibility, so NOT max(dp).
```

> **Slot 2 is where your known weak point lives.** `max(...)` is *choose*;
> `+` is *combine*. Here they appear in one line: you **choose** between two
> doors, and inside the "rob" door you **combine** `dp[i-2]` with `nums[i]`.
>
> Also note: `nums[i]` sits **inside** the rob branch, not outside the `max`.
> It's an *optional* gain — you only collect it if you pick that door.
> (Contrast Chapter 8's grid toll, which is mandatory and sits outside.)

### Top-down first (recursion tells the truth)

```python
def rob_td(nums):
    n = len(nums)

    def dp(i, memo={}):
        if i < 0:                       # BASE: no houses left → no loot
            return 0
        if i in memo:
            return memo[i]
        memo[i] = max(dp(i-1), dp(i-2) + nums[i])   # FULCRUM: skip me, or rob me
        return memo[i]

    return dp(n - 1)                    # TERMINATION: considering ALL houses

print(rob_td([2, 7, 9, 3, 1]))   # expected: 12
```

### Now flip it

Fill order check: `dp[i]` reads `dp[i-1]` and `dp[i-2]` → smaller indices →
**iterate ascending.** ✓

```python
def rob_bu(nums):
    n = len(nums)
    if n == 1:
        return nums[0]
    dp = [0] * n                                     # STATE: dp[i] = best loot from houses 0..i
    dp[0] = nums[0]                                  # BASE: one house — rob it
    dp[1] = max(nums[0], nums[1])                    # BASE: two adjacent — take the better
    for i in range(2, n):                            # MAINTENANCE: ascending, i-1 and i-2 ready
        dp[i] = max(dp[i-1], dp[i-2] + nums[i])      # TRANSITION: skip me | rob me
    return dp[n-1]                                   # TERMINATION: all houses considered

print(rob_bu([2, 7, 9, 3, 1]))   # expected: 12
print(rob_bu([2, 1, 1, 2]))      # expected: 4    (houses 0 and 3)
print(rob_bu([5]))               # expected: 5
```

### Hand-trace (build trust)

`nums = [2, 7, 9, 3, 1]`

```
dp[0] = 2
dp[1] = max(2, 7)               = 7
dp[2] = max(dp[1], dp[0] + 9)   = max(7,  2 + 9) = 11      rob house 2
dp[3] = max(dp[2], dp[1] + 3)   = max(11, 7 + 3) = 11      skip house 3
dp[4] = max(dp[3], dp[2] + 1)   = max(11, 11 + 1) = 12     rob house 4

dp = [2, 7, 11, 11, 12]  →  answer dp[4] = 12   ✓  (houses 0, 2, 4)
```

> Note `dp[3] = dp[2]`: the "skip" door won, and the value simply **carried
> forward**. That carrying is exactly why termination is `dp[-1]` and not
> `max(dp)` here — the array is **non-decreasing**, so the last cell is
> already the maximum. Compare Kadane (Chapter 6), where restarts make the
> array go *down* and `max(dp)` becomes mandatory.

### Prove it with the Lens

| Loop-invariant phase | DP name       | What it means here                                                    |
|----------------------|---------------|------------------------------------------------------------------------|
| **Initialization**   | Base Case     | `dp[0]` and `dp[1]` are derived directly from the state sentence, not copied. Both true before the loop starts. |
| **Maintenance**      | Transition    | If `dp[0..i-1]` are correct, then the best plan covering houses `0..i` either ignores house `i` (`dp[i-1]`) or robs it (forcing `i-1` to be skipped, hence `dp[i-2] + nums[i]`). No third option exists, so the `max` is correct. |
| **Termination**      | State (final) | The loop ends at `i = n-1`, so `dp[n-1]` is the best over all houses — exactly what's returned. |

**Maintenance's hidden requirement:** `dp[i-1]`, `dp[i-2]` both have smaller
indices; the loop ascends. ✓

---

## The Conversion Recipe (use this every time)

```
1. Write/keep the top-down version         → it proves the recurrence is right
2. memo{}  →  dp[] sized to the state space
3. base case `if`  →  direct dp assignments
4. recursive calls  →  array reads
5. ASK THE BOTTOM-UP QUESTION:
      "when I compute dp[i], is every cell it reads already written?"
   → that answer IS your loop order (and its direction)
6. Fill the Lens table                     → Init / Maintain / Terminate
7. Sanity-check TERMINATION separately     → dp[n]? dp[-1]? max(dp)?
```

---

## Debugging With the Lens

```
Zeros appearing in the answer?          → MAINTENANCE. You read a cell before
                                          writing it. Fix the loop order.
Off only at the very start?             → INITIALIZATION. Re-derive the base.
IndexError at i = 1?                    → INITIALIZATION. dp[i-2] needs i >= 2;
                                          you must seed TWO cells, not one.
All cells right, answer wrong?          → TERMINATION. Wrong cell read.
```

> One of these three. Always. That's the value of the Lens — it turns
> "something's broken" into "one of three specific things is broken."

---

## Top-Down vs Bottom-Up: When to Pick Which

```
USE TOP-DOWN when...
  the state space is irregular or sparse (trees, bitmasks, digit positions)
  you only need a few of the states
  the fill order is genuinely hard to work out
  → Chapters 14 (tree), 16 (digit) are naturally top-down

USE BOTTOM-UP when...
  the state space is a clean array or grid
  you want raw speed (no call overhead)
  n is large enough to blow the recursion limit
  you intend to space-optimize (Ch 4) — this is REQUIRED
  → Chapters 5-9, 12, 13 are naturally bottom-up
```

---

## The Takeaway

```
The five slots NEVER change. Only the scaffolding does.

  memo{}       →  dp[]
  recursion    →  for-loop
  "ask first"  →  "fill first"
  free order   →  YOUR job now  ← the one real new skill

And you gained a proof:
  Initialization = Base Case      the truth before the loop
  Maintenance    = Transition     one step preserves correctness
  Termination    = State (final)  the loop ends, dp[n] is the answer
```

> Your turn: `03 - your challenge.md`. Challenge 5 hands you a loop that
> compiles, runs, returns a number — and is wrong. The Lens will find it in
> one line.


</details>
