# Chapter 11: Calculate stock profit with a waiting day

**Question:** Prices are `[1, 2, 3, 0, 2]`. You may hold at most one share, and you cannot buy on the day immediately after a sale. What is the largest profit?

A valid best plan is **buy at 1, sell at 2, wait, buy at 0, sell at 2**. The profit is `(2 - 1) + (2 - 0) = 3`.

## 1. Save three kinds of answer

At the end of a day:

| Saved answer | What it means |
|---|---|
| `hold` | Best cash balance while owning one share |
| `sold` | Best cash balance after selling today |
| `rest` | Best cash balance with no share and no sale today |

Each number describes a different possible history. They are not three actions taken together. A positive `hold` is possible if earlier trades earned more than the latest purchase cost.

## 2. Start on day 0

At price 1:

```text
hold = -1     buy one share
rest = 0      do nothing
sold = -inf   impossible: there was no previously owned share to sell
```

`-inf` means negative infinity. It marks an impossible situation so it cannot beat a real value in `max`.

## 3. Work out today's choices

Use only yesterday's answers:

```text
new_hold = max(hold, rest - price)  # keep holding, or buy
new_sold = hold + price            # sell
new_rest = max(rest, sold)         # stay without a share, or wait after a sale
```

Buying uses yesterday's `rest`, **never yesterday's `sold`**. A sale must first pass through a whole waiting day.

## 4. Follow the numbers

```text
Day   Price   hold   sold   rest
 0      1      -1   -inf     0
 1      2      -1      1     0
 2      3      -1      2     1
 3      0       1     -1     2
 4      2       1      3     2
```

On day 3, buying uses day 2's `rest = 1`: `1 - 0 = 1`. This comes from selling on **day 1**, then waiting on **day 2**.

On day 4, selling gives `1 + 2 = 3`. The final answer is `max(sold, rest) = max(3, 2) = 3`.

## 5. Run it

```python
def max_profit_cooldown(prices):
    if not prices:
        return 0
    hold = -prices[0]
    sold = float('-inf')
    rest = 0

    for price in prices[1:]:
        new_hold = max(hold, rest - price)
        new_sold = hold + price
        new_rest = max(rest, sold)
        hold, sold, rest = new_hold, new_sold, new_rest

    return max(sold, rest)

print(max_profit_cooldown([1, 2, 3, 0, 2]))  # 3
```

The temporary variables keep yesterday's answers available until all three calculations are done. We return a result with no share remaining, so a purchase has been matched by a sale.

**Common mistake:** combining day 2's sale at 3 with day 3's purchase at 0. Those prices look attractive, but that plan skips the required waiting day.


---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 11 · 02 — Worked Example: Best Time to Buy and Sell Stock with Cooldown

> Five slots, then the Invariant Lens. New this chapter: **one state per mask**,
> transitions copied off a diagram, **three separate base derivations**, and a
> termination that excludes a mask instead of surveying them all.

---

## The Problem

> `prices = [1, 2, 3, 0, 2]`
>
> Buy, sell, or idle each day. At most one share held at a time. The day after
> a sale you may not buy. Maximise profit. (Expected: `3` — buy@1, sell@3,
> cooldown, buy@0, sell@2 → `(3-1) + (2-0) = 3`.)

---

## Slot 0 — FULCRUM

> **Ask yourself:** "I am on day `i` wearing mask `M`. Which mask was I wearing on day `i-1`?"

The doors, straight off Modus's diagram:

```
HOLD today  ←  HOLD yesterday (idle)        |  REST yesterday (buy, pay prices[i])
SOLD today  ←  HOLD yesterday (sell, collect prices[i])
REST today  ←  REST yesterday (idle)        |  SOLD yesterday (cooldown served)
```

Two doors, one door, two doors. **Fixed by the diagram, not by the data** — so
each is one line, not a loop (contrast Chapter 10).

There is deliberately **no arrow from SOLD to HOLD**. That absence *is* the
cooldown rule.

---

## Slot 1 — STATE

Three sentences, not one. Say each out loud:

```
hold[i] = the best profit I can be sitting on at the END of day i,
          GIVEN that I currently own a share.
sold[i] = the best profit at the END of day i, GIVEN that I sold TODAY.
rest[i] = the best profit at the END of day i, GIVEN that I own nothing
          and am NOT in cooldown (i.e. I am free to buy tomorrow).
```

> The word `GIVEN` is the whole chapter. Each cell is a *conditional* best —
> best-among-worlds-that-end-in-this-mask. That is why `hold[i]` is allowed to
> be negative: it is not "the answer so far", it is "the answer so far **if**
> I'm holding".

**Why the naive state failed:** `dp[i] = best profit up to day i` cannot answer
*"may I buy tomorrow?"*. It merged the `SOLD` world and the `REST` world into
one number. Splitting the number by mask is the entire fix.

---

## Slot 2 — TRANSITION

```python
hold[i] = max(hold[i-1],  rest[i-1] - prices[i])   # keep holding  |  buy today
sold[i] =     hold[i-1] + prices[i]                # the only road in
rest[i] = max(rest[i-1],  sold[i-1])               # stay free     |  cooldown expires
```

Read it as the fulcrum in symbols:

| English | Symbol |
|---|---|
| "I already owned it and did nothing" | `hold[i-1]` |
| "I was free, and I bought today" | `rest[i-1] - prices[i]` |
| "I owned it, and I sold today" | `hold[i-1] + prices[i]` |
| "yesterday's cooldown is now served" | `sold[i-1]` |
| "pick the better story" | `max(...)` |

**Choose vs combine.** Every `max` here is a *choice between two alternative
histories* — they are mutually exclusive, so you pick one, you never add them.
The `- prices[i]` and `+ prices[i]` are the *combine* half: a mandatory cash
movement attached to a specific arrow.

```
Ch 8   grid[r][c] + min(up, left)        mandatory cost, OUTSIDE the choice
Ch 9   max(leave, take + value)          optional gain,  INSIDE one branch
Ch 11  max(hold, rest - price)           the price rides ONE arrow, inside it
```

> `sold` has **no `max`** and that is not an oversight. One arrow in → nothing
> to choose between. If you catch yourself writing `max(sold[i-1], ...)` for
> `sold[i]`, you have invented a road Modus did not draw — you'd be claiming you
> can "sell today" by having sold yesterday.

---

## Slot 3 — BASE CASE  *(Initialization)* — three derivations, three answers

**Derive each from its own state sentence. Do not copy. Do not reuse.**

```
hold[0] = -prices[0]
   "best profit at end of day 0 GIVEN I own a share."
   The only way to own one on day 0 is to buy it today. I paid prices[0].
   → -prices[0].  NOT 0.

sold[0] = float('-inf')
   "best profit at end of day 0 GIVEN I sold today."
   To sell I must first own. I have owned nothing. THIS WORLD DOES NOT EXIST.
   → the sentinel. In a MAX problem the impossible value is -inf.
   NOT 0 — 0 would let the machine sell a share it never bought.

rest[0] = 0
   "best profit at end of day 0 GIVEN I own nothing and am free."
   Did nothing, earned nothing, spent nothing.
   → 0.
```

Seventh chapter of base cases. Still no two alike:

```
Ch 5  dp[0] = 0                  Ch 9  dp[0][*] = 0
Ch 6  dp[0] = nums[0]            Ch 10 dp[*] = 1
Ch 7  row/col of 0s              Ch 11 -prices[0] / -inf / 0   ← three at once
Ch 8  dp[0][0] = grid[0][0]
```

> **The sentinel law, restated for max problems:** a state that describes an
> impossible world must be `-inf`, so that `max` can never select it. `0` is not
> "nothing happened" — `0` is a *claim* that the world exists and is worth zero.

---

## Slot 4 — TERMINATION

> ### `max(sold[n-1], rest[n-1])` — **`hold` is excluded.**

Ask the state sentence again. `hold[n-1]` describes a world where the story ends
with an unsold share in your pocket: you paid for it and never got the money
back. That is not a profit, it is an open position.

```
ENDPOINT FORCED   Ch 5 dp[amount] · Ch 8 dp[R-1][C-1] · Ch 9 dp[n][W]
ENDPOINT FREE     Ch 6 max(dp)    · Ch 10 max(dp)
LEGAL-END FILTER  Ch 11 max(sold, rest)   ← new third kind
```

> A third termination shape now exists: the day is forced (it must be the last
> day), but the **mask** is not — and only *some* masks are legal to finish in.
> Survey the legal subset. Taking `max` over all three is the mistake your
> fingers will make.

On this input the bug happens to stay hidden (`hold[4] = 1 < 3`). Try
`prices = [5, 1]`: `hold[1] = -1`, `sold[1] = -4`, `rest[1] = 0`. The right
answer is `0`; including `hold` still gives `0` — lucky again. Now try
`prices = [2]`: `hold = -2`, `sold = -inf`, `rest = 0` → correct `0`, but a
`max` over all three of `[2, 1]`-style inputs will eventually surface it. **Do
not rely on luck; derive the legal mask set.**

---

## Verify By Hand

```
day:      0      1      2      3      4
price:    1      2      3      0      2

hold:    -1     -1     -1      1      1
sold:   -inf     1      2     -1      3
rest:     0      0      1      2      2
```

Step by step:

```
day 0   hold = -1        bought at 1
        sold = -inf      impossible
        rest = 0         idle

day 1 (p=2)
        hold = max(-1, rest0 - 2) = max(-1, -2) = -1     keep the day-0 share
        sold = hold0 + 2 = -1 + 2 = 1                    buy@1 sell@2
        rest = max(rest0, sold0) = max(0, -inf) = 0

day 2 (p=3)
        hold = max(-1, rest1 - 3) = max(-1, -3) = -1
        sold = hold1 + 3 = -1 + 3 = 2                    buy@1 sell@3
        rest = max(rest1, sold1) = max(0, 1) = 1         cooldown from day-1 sale

day 3 (p=0)
        hold = max(hold2, rest2 - 0) = max(-1, 1) = 1    ← sold@3 earlier, rested
                                                          day 2, bought free at 0
        sold = hold2 + 0 = -1                            selling at 0 is terrible
        rest = max(rest2, sold2) = max(1, 2) = 2

day 4 (p=2)
        hold = max(hold3, rest3 - 2) = max(1, 0) = 1
        sold = hold3 + 2 = 1 + 2 = 3                     ← the answer
        rest = max(rest3, sold3) = max(2, -1) = 2

answer = max(sold4, rest4) = max(3, 2) = 3
```

> Watch `hold[3] = 1`. It is *positive*. A "holding" cell can be positive when
> earlier profit was already banked. That is the `GIVEN` clause doing its job —
> the cell carries the whole history, conditioned only on the final mask.

---

## The Code

```python
def max_profit_cooldown(prices):
    if not prices:                                  # TERMINATION guard: no days, no profit
        return 0
    hold = -prices[0]                               # BASE: own a share on day 0 -> paid for it
    sold = float('-inf')                            # BASE: selling on day 0 is IMPOSSIBLE (sentinel)
    rest = 0                                        # BASE: idle day 0 -> nothing gained or lost
    for p in prices[1:]:                            # FULCRUM: which mask was I wearing yesterday?
        hold, sold, rest = (
            max(hold, rest - p),                    # TRANSITION: keep holding | buy today (needs REST)
            hold + p,                               # TRANSITION: only road into SOLD
            max(rest, sold),                        # TRANSITION: stay free | cooldown served
        )                                           # one tuple assignment = all three read YESTERDAY
    return max(sold, rest)                          # TERMINATION: HOLD is not a legal way to finish

print(max_profit_cooldown([1, 2, 3, 0, 2]))   # expected: 3
print(max_profit_cooldown([1]))               # expected: 0
print(max_profit_cooldown([2, 1]))            # expected: 0
print(max_profit_cooldown([1, 2, 4]))         # expected: 3
print(max_profit_cooldown([6, 1, 3, 2, 4, 7]))  # expected: 6
print(max_profit_cooldown([]))                # expected: 0
```

### The same thing, unrolled into tables

Useful while you are still learning to trust the rolled version.

```python
def max_profit_cooldown_table(prices):
    n = len(prices)
    if n == 0:
        return 0
    hold = [0] * n                                  # STATE: best profit at end of day i, holding
    sold = [0] * n                                  # STATE: ... given I sold TODAY
    rest = [0] * n                                  # STATE: ... given I'm free to buy
    hold[0], sold[0], rest[0] = -prices[0], float('-inf'), 0   # BASE: derived one by one
    for i in range(1, n):
        hold[i] = max(hold[i-1], rest[i-1] - prices[i])        # TRANSITION
        sold[i] = hold[i-1] + prices[i]
        rest[i] = max(rest[i-1], sold[i-1])
    return max(sold[n-1], rest[n-1])                # TERMINATION: legal end masks only

print(max_profit_cooldown_table([1, 2, 3, 0, 2]))   # expected: 3
print(max_profit_cooldown_table([6, 1, 3, 2, 4, 7]))  # expected: 6
```

---

## The Invariant Lens

| Loop-invariant phase | DP name | What it means here |
|---|---|---|
| **Initialization** | Base Case | Before day 1, the three day-0 cells are each derived from their own `GIVEN` sentence: `-prices[0]`, `-inf`, `0`. The `-inf` guarantees the impossible world is unreachable by `max`. |
| **Maintenance** | Transition | Entering day `i`, all three of day `i-1`'s cells are final. Every arrow in the diagram is applied exactly once, and no arrow exists that the rules forbid — so day `i`'s three cells are correct for day `i`. |
| **Termination** | State (final) | The loop ends with day `n-1` correct **per mask**. The answer is the best over masks that represent a finished, closed position: `sold` and `rest`. |

**Source-cell check:**

```
hold[i] reads hold[i-1], rest[i-1]
sold[i] reads hold[i-1]
rest[i] reads rest[i-1], sold[i-1]
                     ^^^^ all index i-1 — one generation back, no exceptions
```

Because *every* read is from generation `i-1`, the rolled version must update
all three **simultaneously**. That is Chapter 4's lesson with three variables
instead of two.

---

## Debugging With the Lens

```
Profit is inflated / money         -> INITIALIZATION. You set sold = 0 instead of
  appears from nowhere                -inf. The machine sold a share it never owned.

Answer is negative                 -> TERMINATION. You included hold in the max.

Correct on 2 days, wrong on 5      -> MAINTENANCE. You assigned hold first and then
                                      read the NEW hold when computing sold.
                                      Use one tuple assignment.

Cooldown ignored (too much profit) -> MAINTENANCE. You wrote
                                      hold = max(hold, sold - p), which draws the
                                      one arrow the rules forbid (SOLD -> HOLD).

Crash on empty input               -> TERMINATION. Guard prices == [].
```

---

## Complexity

```
states     = n days × 3 masks       = 3n
transition = O(1) per mask          (doors fixed by the diagram)
TIME  = 3n × O(1) = O(n)
SPACE = O(n) tabulated  →  O(1) rolled  (the window reaches exactly 1 day back)
```

> Compare Chapter 10: `states = n`, `transition = O(n)` → `O(n²)`. Here the
> states multiplied and the transition stayed `O(1)`. **`TIME = states ×
> transition cost` never changed; only which factor you paid did.**

---

## Same Machine, Different Diagram (sibling problems)

| Problem | Masks | The one edit |
|---|---|---|
| Stock II (unlimited trades) | `hold`, `free` | delete `sold`; `free = max(free, hold + p)` |
| Stock with transaction fee | `hold`, `free` | subtract the fee on the sell arrow: `hold + p - fee` |
| Stock III / IV (≤ k trades) | `2k` masks | `hold_j`, `free_j` — selling moves `j → j+1` |
| Stock I (one trade) | `hold`, `free` | `hold = max(hold, -p)` — never re-add past profit |
| House Robber (Ch 0 callback) | `robbed`, `skipped` | it was a 2-mask machine all along |

> Go back and reread House Robber with this lens. `dp[i] = max(dp[i-1],
> dp[i-2] + nums[i])` is a two-mask state machine that someone already collapsed
> for you. Every "adjacency" constraint is a missing arrow.

> Continue to `03 - your challenge.md`.


</details>
