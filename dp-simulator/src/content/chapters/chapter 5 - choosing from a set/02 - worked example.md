# Chapter 5 example: Make 11 with the fewest coins

You have unlimited coins of values `[1, 2, 5]`. Make exactly 11 using the smallest number of coins. Return `-1` if the amount cannot be made.

**Answer: 3**, using `5 + 5 + 1`.

Assume coin values are positive integers and the target amount is a nonnegative integer.

## 1. Choices and stored meaning

Try each possible final coin.

`dp[x]` means "the fewest coins needed to make exactly x."

If the final coin is `c`, the earlier coins must make `x-c`. So this choice costs `dp[x-c] + 1` coins. The extra 1 counts the final coin.

For amount 11, compare:

```text
Last coin 1: dp[10] + 1
Last coin 2: dp[9]  + 1
Last coin 5: dp[6]  + 1
```

Keep the smallest result because the question asks for **fewest**.

## 2. Starting values

`dp[0] = 0`: no coins are needed for amount zero.

Use `amount + 1` as a marker for "impossible." Any valid solution uses at most `amount` coins because each coin is worth at least 1. Thus the marker cannot be a valid answer.

## 3. Fill smaller amounts first

| Amount | Best coin count | One way to make it |
|---|---|---|
| 0 | 0 | No coins |
| 1 | 1 | 1 |
| 2 | 1 | 2 |
| 5 | 1 | 5 |
| 6 | 2 | 5 + 1 |
| 9 | 3 | 5 + 2 + 2 |
| 10 | 2 | 5 + 5 |
| 11 | min(2 + 1, 3 + 1, 2 + 1) = 3 | 5 + 5 + 1 |

The program fills every amount; this table shows selected rows. Positive coin values ensure that `x-c` is smaller than `x` and has already been processed.

## 4. Code and final answer

```python
def coin_change(coins, amount):
    impossible = amount + 1
    dp = [impossible] * (amount + 1)
    dp[0] = 0
    for x in range(1, amount + 1):
        for coin in coins:
            if coin <= x:
                dp[x] = min(dp[x], dp[x - coin] + 1)
    return -1 if dp[amount] == impossible else dp[amount]

print(coin_change([1, 2, 5], 11))  # 3
print(coin_change([2], 3))         # -1
print(coin_change([1, 3, 4], 6))  # 2
print(coin_change([2], 0))         # 0
```

**Common mistake:** leaving out `coin <= x`. A coin larger than the amount cannot be used, and Python would interpret a negative index as a position near the end of the table.

With `m` coin types, the work is `O(amount * m)`; table storage is `O(amount)`.

---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 5 · 02 — Worked Example: Coin Change (Fewest Coins)

> The APPROACH half of the book is behind you. From here every worked example
> runs the **five slots**, then proves itself with the **Invariant Lens**.
> Both are recaps — what's new from now on is the *pattern*.

---

## Recap — The Five Slots (Ch 0) and the Lens (Ch 3)

```
0. FULCRUM       "What was the LAST decision that landed me here?"  → the doors
1. STATE         dp[...] = <one English sentence>
2. TRANSITION    dp[i] = combine(dp[smaller], ...)
3. BASE CASE     the smallest truths you know without computing
4. TERMINATION   dp[n]? max(dp)? — WHERE does the answer live?
```

| Loop-invariant phase | DP name       | What it means                                   |
|----------------------|---------------|-------------------------------------------------|
| **Initialization**   | Base Case     | The starting truth you know without computation |
| **Maintenance**      | Transition    | One step forward preserves correctness          |
| **Termination**      | State (final) | Loop ends → `dp[n]` holds the answer            |

---

## The Problem

> `coins = [1, 2, 5]`, `amount = 11`.
> Return the **fewest** coins summing to exactly 11. Return `-1` if impossible.

---

## Slot 0 — FULCRUM

> **Ask yourself:** "What was the LAST coin I dropped on the counter?"

Standing at a pile worth **11**, one instant ago I was at:

```
 last coin 1  →  I was at 10,  and paid 1 more coin
 last coin 2  →  I was at  9,  and paid 1 more coin
 last coin 5  →  I was at  6,  and paid 1 more coin
```

Three doors, from the `coins` array — so in code they become a **loop**.

**Sanity check:** does each door leave a *smaller version of the same
problem*? "Fewest coins to make 10" is the same question as "fewest coins to
make 11", just smaller. ✓ Optimal substructure confirmed.

---

## Slot 1 — STATE

> `dp[x]` = **the fewest coins that sum to exactly `x`.**

Notice what is NOT in the state: not *which* coins, not their *order*, not how
many of each. We throw all of that away, and it's safe, because **the future
doesn't care.** To extend a pile worth `x`, all I need is the *count* that got
me there.

> **That is the art of state design:** keep exactly what the future needs,
> discard everything else. Too little → wrong answers. Too much → the table
> explodes.

---

## Slot 2 — TRANSITION

```
English                                  Symbol
--------------------------------------   -----------------------
"fewest coins to make x - c"             dp[x - c]
"...and then I paid one more coin"       + 1
"try every coin c"                       for c in coins
"I want the FEWEST"                      min(...)

    dp[x] = min(dp[x - c] + 1  for every coin c with c <= x)
```

**Why `min` and not `+`?** The question says *"fewest."* That's an
optimization → **pick one door**. If it said *"how many ways,"* we'd **sum all
doors**. Choose vs combine.

**Why the guard `c <= x`?** A coin bigger than the pile can't have been the
last coin dropped. That door doesn't exist.

---

## Slot 3 — BASE CASE  *(Initialization)*

**Derive it. Do not copy it from another problem.**

> `dp[0] = 0` — to make an amount of **zero**, I need **zero coins.**

That is a definition, not a guess. Everything else starts as the sentinel:

```python
dp = [amount + 1] * (amount + 1)   # "impossible" — provably unreachable
dp[0] = 0                          # the one truth I own for free
```

The worst legal answer uses all 1-coins, costing exactly `amount`. So any real
answer is `<= amount`, and `amount + 1` can never be genuine. `min` will never
pick it unless nothing else exists — which is exactly what "impossible" means.

---

## Slot 4 — TERMINATION

> `dp[amount]`. **Not** `min(dp)`, **not** `dp[-1]`-as-an-afterthought.

The debt must be paid **exactly**. A pile worth 9 is not an acceptable answer
to an 11-gold debt, even if it used fewer coins. The journey has a mandatory
endpoint, so the answer sits at that endpoint.

```python
return dp[amount] if dp[amount] != amount + 1 else -1
```

> Next chapter: Kade's best run can end *anywhere*, so its answer is `max(dp)`.
> **Termination is decided by the problem statement, never by habit.**

---

## Verify By Hand (before writing code)

```
dp[0] = 0                                                  (base)
dp[1] = dp[0]+1 = 1                                        → [1]
dp[2] = min(dp[1]+1, dp[0]+1) = min(2, 1) = 1              → [2]
dp[3] = min(dp[2]+1, dp[1]+1) = min(2, 2) = 2              → [1,2]
dp[4] = min(dp[3]+1, dp[2]+1) = min(3, 2) = 2              → [2,2]
dp[5] = min(dp[4]+1, dp[3]+1, dp[0]+1) = min(3, 3, 1) = 1  → [5]
dp[6] = min(dp[5]+1, dp[4]+1, dp[1]+1) = min(2, 3, 2) = 2  → [1,5]
...
dp[11] = min(dp[10]+1, dp[9]+1, dp[6]+1) = min(3, 4, 3) = 3
```

Cross-check: `5 + 5 + 1 = 11`, three coins. ✓

Notice `dp[5]` — the 5-coin door beat both smaller doors instantly. The loop
does in one line what greedy needs luck to do.

---

## Only NOW, the Code

```python
def coin_change(coins, amount):
    dp = [amount + 1] * (amount + 1)   # STATE: dp[x] = fewest coins summing to exactly x
    dp[0] = 0                          # BASE / INITIALIZATION: 0 coins make 0
    for x in range(1, amount + 1):     # MAINTENANCE: grow the invariant one x at a time
        for c in coins:                # FULCRUM: "what was the LAST coin?" -> try every c
            if c <= x:                 # a coin bigger than x is not a real door
                dp[x] = min(dp[x], dp[x - c] + 1)   # TRANSITION: best door, +1 coin
    return dp[amount] if dp[amount] != amount + 1 else -1   # TERMINATION: must land EXACTLY

print(coin_change([1, 2, 5], 11))   # expected: 3    (5 + 5 + 1)
print(coin_change([2], 3))          # expected: -1   (odd is unreachable from 2s)
print(coin_change([1, 3, 4], 6))    # expected: 2    (3 + 3 — greedy would say 3)
```

---

## The Invariant Lens — Why This Loop Is CORRECT

Fill the table from Chapter 3 and you have a *proof*, not a hope:

| Loop-invariant phase | DP name       | What it means here                                        |
|----------------------|---------------|-----------------------------------------------------------|
| **Initialization**   | Base Case     | The starting truth you know without computation. Before the loop, `dp[0] = 0` is true. |
| **Maintenance**      | Transition    | One step forward preserves correctness. If `dp[0..x-1]` are correct, every `dp[x-c]` I read is correct, so `min(dp[x-c] + 1)` makes `dp[x]` correct too. |
| **Termination**      | State (final) | Loop ends → `dp[n]` holds the answer. Here the loop ends at `x = amount`, and `dp[amount]` is exactly what I return. |

Say the whole thing as one sentence:

> *"`dp[0..x-1]` correct **before** each pass; the transition carries that
> correctness **forward** to `dp[x]`; so when `x` reaches `amount`,
> `dp[amount]` is correct."*

**Two hidden requirements this table exposes:**

1. *Maintenance* only works if `dp[x-c]` is **already filled** when I read it.
   Since `c >= 1`, we know `x - c < x`, and the loop goes upward. ✓
   **This exact check is what catches interval-DP loop-order bugs in Ch 12.**
2. *Termination* only works if the loop actually **reaches** `amount`. Note
   `range(1, amount + 1)` — the `+1` is not decoration, it's the proof step.

---

## Debugging With the Lens

```
Answer off by a constant?                → Initialization. Re-derive dp[0].
Small amounts right, large ones wrong?   → Maintenance. A door is missing,
                                           or you read a cell not yet filled.
Every dp cell correct, return is wrong?  → Termination. You read the wrong cell.
```

Three failure modes, three places to look. Stop print-debugging blindly.

---

## Complexity

```
Time   O(amount × len(coins))   every cell tries every door
Space  O(amount)                dp[x-c] can reach far back, so no rolling here
```

---

## The Takeaway

```
0. FULCRUM      "what was the LAST decision?"      → the list of doors
1. STATE        dp[...] in one English sentence    → what a door leads to
2. TRANSITION   the fulcrum, in symbols            → min/max/sum over doors
3. BASE CASE    derive it, never copy it           → Initialization
4. TERMINATION  WHERE does the answer live?        → dp[amount], exactly
5. LENS         fill Init / Maintain / Terminate   → now you KNOW it's right
```

> Your turn: `03 - your challenge.md`. Two of the six punish you for copying a
> base case. Derive them.


</details>
