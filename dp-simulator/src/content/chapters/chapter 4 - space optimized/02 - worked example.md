# Chapter 4 · 02 — Worked Example: Rolling the Table Away

> Three rolls of increasing danger: a 1D window, a 2D row-roll, and the
> knapsack roll where **loop direction changes which problem you solve.**

---

## The Only Question

> ### "How far back does my transition reach?"

That distance is your **window**. Keep exactly that much. Erase the rest.

---

## Roll 1 — House Robber (window = 2)

### Start from Chapter 3's bottom-up version

```python
def rob_table(nums):
    n = len(nums)
    if n == 1:
        return nums[0]
    dp = [0] * n
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])
    for i in range(2, n):
        dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    return dp[n-1]
```

### Measure the window

```
dp[i] reads dp[i-1] and dp[i-2]   →  window = 2  →  keep TWO variables
```

### Roll it

```python
def rob_rolled(nums):
    prev2 = 0          # dp[i-2]  — "best loot ending before the previous house"
    prev1 = 0          # dp[i-1]  — "best loot up to the previous house"
    for x in nums:
        cur   = max(prev1, prev2 + x)   # TRANSITION, unchanged: skip me | rob me
        prev2, prev1 = prev1, cur       # slide the window one house right
    return prev1                        # TERMINATION: prev1 now holds dp[n-1]

print(rob_rolled([2, 7, 9, 3, 1]))   # expected: 12
print(rob_rolled([2, 1, 1, 2]))      # expected: 4
print(rob_rolled([5]))               # expected: 5
print(rob_rolled([]))                # expected: 0
```

**Notice what the roll fixed for free.** The table version needed a special
`if n == 1` guard and two seeded cells. Starting both variables at `0` —
meaning *"no houses considered yet, no loot"* — makes `n = 0` and `n = 1` fall
out automatically. **Seeding with the empty-prefix value often removes edge
cases.**

### The naming discipline

```python
prev2 = 0    # this variable IS dp[i-2]
prev1 = 0    # this variable IS dp[i-1]
```

Write those comments every time. An array index documents itself; a variable
named `a` does not. And a wrong variable **won't crash — it will lie.**

### Why the simultaneous assignment matters

```python
prev2, prev1 = prev1, cur     # ✓ right side fully evaluated FIRST
```

```python
prev2 = prev1                 # ✗ prev1 is still the OLD value here — fine
prev1 = cur                   # ✗ ...but write these two lines in the other
                              #    order and prev2 gets the NEW value. Ruined.
```

Python's tuple assignment makes this safe. In Rust or C you'd need a `temp`.
**Know why it works — don't just copy the idiom.**

### The Lens, sharpened

| Phase | What it must prove now |
|-------|------------------------|
| **Initialization** | `prev2 = prev1 = 0` encodes *"no houses considered yet."* True before the loop. |
| **Maintenance** | The transition is correct **and** at the moment `cur` is computed, `prev1` still holds `dp[i-1]` and `prev2` still holds `dp[i-2]` — guaranteed because the swap happens *after*. |
| **Termination** | Loop ends → `prev1` holds `dp[n-1]`. That is the answer, because House Robber's `dp` is non-decreasing, so the last cell is the best. |

---

## Roll 2 — Unique Paths (2D → one row)

### The table version

```python
def paths_table(R, C):
    dp = [[0] * C for _ in range(R)]
    dp[0][0] = 1
    for r in range(R):
        for c in range(C):
            if r > 0: dp[r][c] += dp[r-1][c]
            if c > 0: dp[r][c] += dp[r][c-1]
    return dp[R-1][C-1]
```

### Measure the window

```
dp[r][c] reads dp[r-1][c]  → the PREVIOUS ROW
             and dp[r][c-1] → the CURRENT row, one to the left

window = 1 row  →  keep ONE row, if you're clever about it
```

### The key insight

Walk a single array left to right. At the moment you touch index `c`:

```
dp[c]      has NOT been overwritten yet  →  it still holds the ROW ABOVE   ↑
dp[c-1]    HAS been overwritten already  →  it holds the CURRENT row       ←
```

**One array, two generations, distinguished purely by loop direction.**
That is the whole trick — and in Roll 3 it becomes a landmine.

```python
def paths_rolled(R, C):
    dp = [1] * C          # INIT: row 0 — exactly one way to reach any cell in it
    for _ in range(1, R):
        for c in range(1, C):
            dp[c] += dp[c-1]    # dp[c] = ↑ (not yet overwritten), dp[c-1] = ← (already)
    return dp[C-1]

print(paths_rolled(3, 3))   # expected: 6
print(paths_rolled(3, 7))   # expected: 28
print(paths_rolled(1, 1))   # expected: 1
```

`O(R·C)` time, `O(C)` space. And **roll the smaller dimension** — if `R < C`,
transpose first.

---

## Roll 3 — 0/1 Knapsack (the dangerous one)

> Items with `weights` and `values`, capacity `cap`, **each item used at most
> once.** Maximise value.

### The 2D version

```python
def knapsack_2d(weights, values, cap):
    n = len(weights)
    dp = [[0] * (cap + 1) for _ in range(n + 1)]   # dp[i][w] = best from first i items, capacity w
    for i in range(1, n + 1):
        for w in range(cap + 1):
            dp[i][w] = dp[i-1][w]                              # skip item i
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i][w],
                               dp[i-1][w - weights[i-1]] + values[i-1])   # take item i
    return dp[n][cap]

print(knapsack_2d([1, 3, 4], [15, 20, 30], 4))   # expected: 35
```

### Measure the window

```
dp[i][w] reads dp[i-1][w] and dp[i-1][w - weight]
Both come from row i-1 ONLY — never from row i.

window = 1 row  →  roll to a single array
```

### The landmine

Both reads must come from row `i-1` — that is what *"each item used at most
once"* **means**. So when you roll to one array, `dp[w - weight]` must still
hold the **old** generation.

```python
for w in range(cap, weights[i]-1, -1):   # ← BACKWARD
    dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    #                  └────────┬────────┘
    #     going DOWNWARD, index w-weight is SMALLER than w,
    #     so it has NOT been touched yet this round → it's row i-1 ✓
```

Flip the direction and you silently solve a **different problem**:

```python
for w in range(weights[i], cap + 1):     # ← FORWARD
    dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    #                  └────────┬────────┘
    #     going UPWARD, index w-weight was ALREADY overwritten this round,
    #     so it may already contain item i → item i gets used AGAIN ✗
    #     → this is UNBOUNDED knapsack
```

> **One character. No crash. A plausible wrong number.** TRAP 7.

### Both, side by side — the difference is `-1`

```python
def knapsack_01(weights, values, cap):
    dp = [0] * (cap + 1)                          # INIT: capacity w, no items → value 0
    for wt, val in zip(weights, values):
        for w in range(cap, wt - 1, -1):          # BACKWARD → dp[w-wt] is still row i-1
            dp[w] = max(dp[w], dp[w - wt] + val)  # each item at most ONCE
    return dp[cap]

def knapsack_unbounded(weights, values, cap):
    dp = [0] * (cap + 1)
    for wt, val in zip(weights, values):
        for w in range(wt, cap + 1):              # FORWARD → dp[w-wt] may already include this item
            dp[w] = max(dp[w], dp[w - wt] + val)  # each item used UNLIMITED times
    return dp[cap]

print(knapsack_01([1, 3, 4], [15, 20, 30], 4))          # expected: 35   (items 1+2)
print(knapsack_unbounded([1, 3, 4], [15, 20, 30], 4))   # expected: 60   (item 1, four times)
```

`35` vs `60`. **Same five slots. Same transition line. Opposite loop
direction. Different problems.**

### The Lens catches it

| Phase | 0/1 (backward) | Forward (unbounded) |
|-------|----------------|---------------------|
| **Initialization** | `dp[w] = 0` — no items chosen. Same for both. | Same. |
| **Maintenance** | Reading `dp[w-wt]` **before** it is overwritten → it is row `i-1` → *"best without item i"* ✓ | Reading `dp[w-wt]` **after** it may have been overwritten → it is row `i` → *"best possibly including item i"* → reuse |
| **Termination** | `dp[cap]` | `dp[cap]` |

> The Maintenance row is where the whole bug lives, and the Lens makes you
> write it down. **This is why Chapter 3 taught you the Lens before Chapter 4
> handed you the razor.**

---

## The Recipe

```
1. Start from a correct BOTTOM-UP solution      (you cannot roll a notebook)
2. Measure the WINDOW: how far back do reads reach?
       k cells back      → keep k variables
       previous row only → keep 1 row
       arbitrarily far   → STOP. No reduction possible.
3. Name every variable with the dp cell it represents. In a comment.
4. Determine LOOP DIRECTION by asking, for each read:
       "do I need the OLD generation or the NEW one here?"
       OLD  → iterate so that cell is not yet overwritten
       NEW  → iterate so that it already is
5. Re-fill the LENS, and make Maintenance name the generation of every read.
6. Re-check TERMINATION — you can't max() a table you erased.
       If the answer is a survey, track it in a SEPARATE variable as you go.
7. Test both the tiny edge cases (n = 0, n = 1) and one known answer.
```

---

## Debugging Rolled DP

```
Answer too LARGE in a knapsack-shaped problem?  → direction. You reused items.
Answer too SMALL / stuck at the base value?     → direction. You read a cell
                                                  already overwritten.
Crashes on n = 0 or n = 1?                      → Initialization. Seed with the
                                                  EMPTY-prefix value instead.
Correct value, but you can't report the path?   → Expected. Rolling destroys
                                                  reconstruction. Keep the table.
```

---

## Complexity Summary

```
                    Time     Space    Reconstruction?
Ch 1 recursion      O(2ⁿ)    O(n)     yes (the call stack)
Ch 2 memoized       O(n)     O(n)     yes
Ch 3 bottom-up      O(n)     O(n)     yes
Ch 4 rolled         O(n)     O(1)     NO
```

> Time never improved from Ch 2 onward. Chapters 3 and 4 buy **robustness and
> memory**, not speed. Say that clearly in an interview and you'll sound like
> someone who understands the trade, not someone reciting it.

---

## The Takeaway

```
THE QUESTION      "how far back does my transition reach?"  → that's the window
THE DISCIPLINE    name each variable with the dp cell it IS
THE KILLER        loop direction decides WHICH GENERATION you read
THE LENS          Maintenance must now name the generation of every read
THE PRICE         you lose the ability to reconstruct the answer
THE RULE          bottom-up FIRST. You cannot roll a notebook.
```

> Your turn: `03 - your challenge.md`. Challenge 4 gives you two programs that
> differ by one character and asks which problem each one solves.
> Then **Chapter 5** begins the fifteen patterns.
