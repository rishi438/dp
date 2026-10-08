# Chapter 5: Try each allowed choice

**When the options come from an input list, try each option and keep the result the question asks for.**

Suppose coins have values `[1, 2, 5]`, with unlimited copies of each. We want to make exactly 11 using the fewest coins.

One answer is `5 + 5 + 1`: **3 coins**.

## Ask about the final coin

If the final coin has value:

- 1, we first need to make 10.
- 2, we first need to make 9.
- 5, we first need to make 6.

For each case, solve the smaller amount and add **one coin**. Then keep the smallest coin count.

## What dp stores

`dp[x]` = the fewest coins needed to make exactly amount `x`.

For each coin `c` that fits, try `dp[x-c] + 1`. The `+1` counts the new coin; it does not add that coin's monetary value.

Start with `dp[0] = 0`: making zero requires zero coins. Mark other amounts as impossible until a valid choice reaches them. Fill amounts in increasing order, then return `dp[11]`.

An impossible amount must stay distinct from zero. With coins `[2]`, amount 3 cannot be made, so the final answer should be `-1`.

## Why not always take the largest coin?

With coins `[1, 3, 4]` and target 6:

```text
Largest-first: 4 + 1 + 1 -> 3 coins
Best answer:  3 + 3     -> 2 coins
```

Trying every final coin lets DP find the better result.

**Common mistake:** adding the answers for all choices. This question asks for the **fewest coins**, so use `min`. Counting payment arrangements is a different question and needs a carefully defined counting method.

---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 5 · 01 — Story: Corin the Coinsmith

> Family: **Choosing from a SET.**
> Reco could only hop 1 or 2. Corin has a whole *bag* of options.

---

## The New Villain: Too Many Doors

Reco's staircase was kind. At every step there were exactly **two** doors —
hop 1, or hop 2. You could write both by name:

```python
dp[i] = dp[i-1] + dp[i-2]      # door 1, door 2. Done.
```

Four chapters taught him to *carry* that line four different ways — plain,
memoized, tabulated, rolled. He is unbeatable at the **approach**.

Then Reco meets **Corin the Coinsmith**, who works the royal mint.

> "The King owes a merchant **11 gold**. My mint stamps coins of
> **1, 2, and 5**. I have infinitely many of each.
> Pay the debt using the **fewest coins possible.**"

Reco reaches for his formula and freezes. `dp[i-1] + dp[i-2]`? There's no
"one step back" here. The doors aren't `1` and `2` — they're `1`, `2`, and `5`.
And tomorrow the mint might stamp `3, 7, 11, 42`.

**The doors are no longer known when you write the code. They're *data*.**

> This is the whole reason the book has a second half. You know *how* to build
> a table. You do not yet know *what to put in it*. That's the **pattern**.

---

## Corin's Lesson: The Fulcrum Becomes a Loop

The fulcrum — the question that cracks every DP — does not change:

> ### "What was the LAST coin I dropped on the counter?"

Ask it for a pile worth 11:

```
last coin was 1  →  the pile was worth 10 an instant ago,  + 1 coin
last coin was 2  →  the pile was worth  9 an instant ago,  + 1 coin
last coin was 5  →  the pile was worth  6 an instant ago,  + 1 coin
```

Three doors. But if the mint stamped 40 denominations, there'd be 40 doors.
You cannot *write* 40 lines. So you **loop** them:

```python
for c in coins:                 # ← THE FULCRUM, made executable
    dp[x] = min(dp[x], dp[x-c] + 1)
```

> **The deep idea of this whole chapter:**
> The fulcrum is never a line of code. It is a **question**.
> The *answer* to it is a **list of doors**.
> - Few doors, fixed at write-time → the transition is **one line**. (Reco)
> - Many doors, given as data → the transition is **a loop**. (Corin)

Same question. Same DP. Only the *arity* changed.

---

## The Second Lesson: `+` or `min`?

> "On the staircase I **added** the doors. You're taking the **minimum**. Why?"

Corin points at the two royal decrees pinned to the wall:

```
DECREE A: "In how many WAYS can the debt be paid?"     →  +    (sum all doors)
DECREE B: "What is the FEWEST coins to pay it?"        →  min  (pick one door)
```

The fulcrum gave you the doors. **The question type tells you how to combine
them.**

```
"how many ways"      → sum over every door        dp[x] += dp[x-c]
"minimum / fewest"   → take the best single door  dp[x] = min(dp[x], dp[x-c] + 1)
"maximum / most"     → take the best single door  dp[x] = max(dp[x], dp[x-c] + v)
"is it possible"     → OR over every door         dp[x] = dp[x] or dp[x-c]
```

This is the mistake that has bitten you before — **"choose vs combine."**
`max(a,b)` *chooses*. `a+b` *combines*. Say it out loud:

> **Counting sums the doors. Optimizing picks one door.**

---

## The Third Lesson: The Impossible Pile

Reco tries `coins = [2]`, `amount = 3`. There is no answer. What should
`dp[3]` hold?

Corin: *"A number so large that `min` will never choose it, but small enough
that adding 1 won't overflow your arithmetic."*

```python
dp = [amount + 1] * (amount + 1)    # amount+1 = "impossible"
```

Why `amount + 1` and not `float('inf')`? Because a real answer can never
exceed `amount` coins (worst case: all 1-coins). So `amount + 1` is provably
unreachable — and unlike `inf`, `dp[x-c] + 1` stays a clean integer.

> This is **the sentinel trick**, and you'll reuse it in nine more chapters.

---

## What Changed, In One Table

|                     | Reco (Ch 0–4)             | Corin (Ch 5)                  |
|---------------------|---------------------------|-------------------------------|
| Fulcrum             | "what was my last hop?"   | "what was my last coin?"      |
| Doors               | fixed: `{1, 2}`           | data: `coins`                 |
| Transition shape    | one line                  | a loop over options           |
| Combine with        | `+` (counting)            | `min` (optimizing)            |
| Impossible value    | never happens             | sentinel `amount + 1`         |
| Termination         | `dp[n]`                   | `dp[amount]` — land EXACTLY   |

---

## The Trap Corin Sets

Reco tries to be clever: *"Just take the biggest coin that fits, repeatedly!"*
That's **greedy**. On `[1, 2, 5]` for 11 it happens to work: `5+5+1 = 3 coins`.

Corin swaps the mint dies to `[1, 3, 4]` and asks for **6**.

```
Greedy: 4 + 1 + 1          = 3 coins
Truth:  3 + 3              = 2 coins   ← greedy LOSES
```

> **Greedy looks like DP and is not DP.** A locally best choice is not always
> globally best. When in doubt, DP. DP is never wrong here; greedy often is.

---

## Cliffhanger

Corin's doors were scattered across a *set*. But some problems have doors that
must be **touching** — an unbroken run, no gaps allowed.

Next you meet **Kade the Streak-Runner**, who can never lift his foot off the
ground, and who teaches the single most-failed question in all of DP:

> *"Where does the answer actually LIVE when the loop ends?"*

Reco will get that one wrong. Loudly.

> Continue to `02 - worked example.md`.


</details>
