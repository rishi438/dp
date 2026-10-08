# Chapter 9: Choose items that fit in a bag

**Choose items with the largest total value, while keeping their total weight within the bag's limit. Each item can be used once.**

This is called **0/1 knapsack**: for each item, choose 0 copies or 1 copy.

| Item | Weight | Value |
|---|---:|---:|
| A | 1 | 1 |
| B | 3 | 4 |
| C | 4 | 5 |
| D | 5 | 7 |

The bag holds at most **7** units of weight. Taking B and C uses `3 + 4 = 7` weight and gives `4 + 5 = 9` value.

Taking the most valuable item first would give D and A, worth only `8`. We need to compare combinations.

## What are the choices?

For the current item:

- **Skip it:** keep the best value possible without it.
- **Take it, if it fits:** reserve its weight, use the remaining capacity for earlier items, and add its value.

Take whichever choice gives the larger total value.

## What do we save?

`dp[i][w]` = best value using the first `i` items with a weight limit of `w`.

The limit is **at most** `w`; unused space is allowed. Both choices look at row `i - 1`, so neither can reuse the current item.

For item C with limit 7, skipping gives value `5`. Taking it leaves capacity `3`; earlier items can give value `4` there. Taking C therefore gives `4 + 5 = 9`, which wins.

With no items, the best value is **0**. With zero capacity and positive item weights, it is also **0**. These are the starting answers.

After considering every item, return `dp[number_of_items][capacity]`: **9** here.

**Common mistake:** adding the item's value even when you skip it. Add its value only to the "take" calculation, and only when its weight fits.


---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 9 · 01 — Story: Sacky, the Packmaster

> Family: **Subset / Knapsack (0/1).**
> Gridlock's second dimension was a *place*. Sacky's second dimension is a
> **resource you spend** — and that single change is the biggest conceptual
> jump in the book so far.

---

## The Sack and the Scale

Reco clears the Iron Valley and finds a merchant sitting on a crate, a brass
scale at his feet and a leather sack in his lap.

**Sacky, the Packmaster.**

> "Four relics. Each has a **weight** and a **worth**. My sack carries
> **7 stone**, not one grain more.
>
> Take a relic or leave it. You may not take *half* a relic. You may not take
> the same relic twice. Maximise the worth you walk out with."

```
relic   weight   worth
  A        1        1
  B        3        4
  C        4        5
  D        5        7
                          sack capacity = 7 stone
```

Reco's first instinct is greed: *"D is worth the most — take D."* That leaves
2 stone, enough for only A. Total worth **8**.

Sacky smiles and lifts B and C out of the crate: weight `3 + 4 = 7`, worth
`4 + 5 = **9**`.

> "Greed lost. Greed *always* loses here. The best relic is not part of the
> best sack."

---

## Why Greed Dies (and DP is forced)

This is worth pinning to the wall, because it is the cleanest example in the
book of **Signal 3** from `pattern.md` — *brute force explodes, greed is wrong*.

```
Greedy by worth           → D, A          = 8     ✗
Greedy by worth/weight    → A(1.0), B(1.33)...    ✗ (fractional logic, wrong problem)
Try every subset          → 2⁴ = 16 sacks  ✓ but 2ⁿ
DP                        → O(n × W)       ✓
```

> **The "0/1" in the name is the whole difficulty.** If you were allowed to
> take *fractions* of a relic, greedy by worth-per-stone would be provably
> optimal and there would be no chapter here. The indivisibility is what
> destroys greed and summons DP.

---

## The Fulcrum: the LAST relic, not the best relic

Reco wants to ask *"which relic should I take first?"* — that's forward, and it
branches into 16 futures. Sacky stops him:

> ### "Look at the LAST relic on the table. Did I take it, or leave it?"

Two doors. Only ever two. But look closely at what each door *costs*:

```
LEAVE it  →  same capacity, one fewer relic to consider
             dp[i-1][w]

TAKE it   →  capacity DROPS by this relic's weight, one fewer relic
             dp[i-1][w - weight[i]] + worth[i]
```

**That is the new idea.** In Chapter 8 the second index was *where you stood*.
Here the second index is **how much sack you have left**, and taking a door
**spends** it.

```
Ch 8  dp[r][c]   c = a COLUMN.     Moving changes your POSITION.
Ch 9  dp[i][w]   w = CAPACITY LEFT. Choosing SPENDS your BUDGET.
```

> Say it out loud once: *"the second dimension is a resource, and the `take`
> door is the only one that bills me."*

---

## Mandatory vs Optional — the mirror image of Chapter 8

Chapter 8's toll was **mandatory**: you paid `grid[r][c]` whichever door you
came through, so it went **outside** the `min`.

Sacky's worth is **optional**: you only collect `worth[i]` if you actually take
the relic. So it goes **inside** that branch:

```python
dp[i][w] = max( dp[i-1][w],                            # leave  — no gain
                dp[i-1][w - wt[i]] + worth[i] )        # take   — gain INSIDE
                                    ^^^^^^^^^^
                            optional, so it lives inside its own door
```

> **The pair, finally side by side:**
> ```
> MANDATORY cost  → OUTSIDE the min/max     grid[r][c] + min(up, left)
> OPTIONAL  gain  → INSIDE  the branch      max(skip, take + worth[i])
> ```
> This is one of your logged weak points. You have now seen both halves in
> consecutive chapters. Memorise the shape, not the sentence.

---

## The Door That Doesn't Fit

What if the relic weighs more than the capacity you're holding?

```
w = 2 stone,  relic D weighs 5
→ dp[i-1][2 - 5] = dp[i-1][-3]
```

In Python that index silently wraps around and reads a real cell. **Silent
wrong answers.** The `take` door must simply not exist:

```python
if wt[i] <= w:
    take = dp[i-1][w - wt[i]] + worth[i]
else:
    take = float('-inf')        # or just: don't offer the door at all
```

> Same law, fifth chapter running: **a door that does not exist must never be
> selectable.** Corin's `c <= x` guard, Gridlock's `inf`, Sacky's `wt <= w`.
> Different costumes, one principle.

---

## The Off-By-One Contract Is Back

Chapter 8 gave you a holiday: `dp[r][c]` sat right on `grid[r][c]`. Sacky takes
it away, because we need a row meaning **"no relics considered yet."**

```
dp has n+1 rows.   Row i means "the first i relics."
Therefore row i is about relic number i, which lives at index i-1.

        dp[i][w]  ←→  wt[i-1], worth[i-1]
```

> Write the contract at the top of your code as a comment, exactly as you did
> for the Twin Scribes. Every off-by-one bug you will ever have in this family
> comes from not writing that line down.

---

## The Base Case — DERIVE it (row zero is not "empty", it is a claim)

Say the state sentence first:

> `dp[0][w]` = "the best worth obtainable from the **first 0 relics** with `w`
> stone of capacity."

No relics available → you can collect nothing → **`0`, for every `w`.**

And `dp[i][0]`? Zero capacity → nothing fits → also `0`.

```
Fifth chapter of base cases, all different:
  Ch 5  dp[0] = 0            zero coins make amount 0
  Ch 6  dp[0] = nums[0]      a run must contain its own first element
  Ch 7  row/col of 0s        an empty string shares nothing
  Ch 8  dp[0][0] = grid[0][0]  you stand on the start tile
  Ch 9  dp[0][*] = 0         no relics chosen yet, worth nothing
```

Notice `dp[0][*] = 0` looks like a "copied" base case — and here it genuinely
*is* zero. **That is exactly why you must derive it anyway.** In the very next
variant (Subset Sum below) the same row zero becomes `True`, and in Partition
it becomes `dp[0] = True` with everything else `False`. Same shape, three
different truths.

---

## TRAP — the rolled array must run BACKWARDS

Chapter 4 warned you (TRAP 7) and Chapter 8's Challenge 6 rehearsed you. Here
is the real thing.

The 2D table only ever reads **the previous row**, so one array should do:

```python
dp = [0] * (W + 1)
for wt_i, val_i in items:
    for w in range(W, wt_i - 1, -1):        # BACKWARD
        dp[w] = max(dp[w], dp[w - wt_i] + val_i)
```

Why backward? Because `dp[w - wt_i]` must still hold the value from the
**previous row** — that is, *"before this relic existed."*

```
BACKWARD  w descends → dp[w - wt_i] is to the LEFT, not yet overwritten
                     → it is still row i-1  → relic used AT MOST ONCE   ✓ 0/1

FORWARD   w ascends  → dp[w - wt_i] was ALREADY overwritten this pass
                     → it is row i          → relic can be reused       ✓ UNBOUNDED
```

> **Both loops run without error. Both return a number. One of them is
> answering a different question than the one you were asked.** That is the
> most dangerous class of bug in all of DP.
>
> And the punchline: the "wrong" forward loop is the *correct* solution to
> Unbounded Knapsack. The direction of a `for` loop is a semantic decision, not
> a style choice.

---

## Termination

> `dp[n][W]` — all relics considered, full capacity available.

```
Ch 5  → dp[amount]      Ch 7  → dp[m][n]         Ch 9  → dp[n][W]
Ch 6  → max(dp)         Ch 8  → dp[R-1][C-1]
```

**A question to hold in your head until the challenges:** why is it `dp[n][W]`
and not `max(dp[n])`? You don't have to *fill* the sack — leftover capacity is
allowed. Is the last row guaranteed to be non-decreasing in `w`? Decide *why*
before you answer Challenge 5.

---

## The Family, Not Just the Problem

Every one of these is the same table wearing a different hat:

```
0/1 Knapsack        max worth under weight     max(...)        ← this chapter
Subset Sum          can I hit exactly T?       or  / any()
Partition Equal     split into two equal sums  Subset Sum of total/2
Target Sum          assign +/- to reach T      Subset Sum, rearranged
Count Subsets       how many hit exactly T?    +   (counting)
Unbounded Knapsack  reuse allowed              forward loop
Coin Change (Ch 5)  a 1-row unbounded knapsack min
```

> Chapter 5 was secretly a knapsack all along. Corin's coins were an unbounded
> sack with capacity `amount`. You have been in this family before and didn't
> know it.

---

## Cliffhanger

Sacky's relics could be taken in any order — the sack does not care. But as
Reco leaves, a smith's daughter is laying chain-links out on a bench, and she
will not let him pick freely:

> "You may skip as many links as you like. But each link you add must be
> **strictly longer** than the one before it. Order is the whole law here."

Next: **Lissa the Chainbuilder**, and the day the doors stopped being two, and
became *every element you've already passed*.

> Continue to `02 - worked example.md`.


</details>
