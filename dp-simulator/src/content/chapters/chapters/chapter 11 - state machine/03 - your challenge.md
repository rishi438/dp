# Chapter 11 · 03 — Your Challenges

Rules: write the **five slots in order** before any code. Say every state
sentence with the word `GIVEN` in it. Derive every base case — do not copy one
from the worked example, and do not copy `sold[0]` from `hold[0]`.

---

## 1. (easy) Name the masks

`prices = [7, 1, 5, 3, 6, 4]`, cooldown rule in force.

Write the three state sentences for day 2 (`price = 5`) in full English, each
containing the word `GIVEN`. Then say, in one sentence each, **why `hold[2]`
may be negative** and **why `sold[2]` may not be `-inf` anymore**.

---

## 2. (easy) Base-case derivation — the one you will get wrong

For `prices = [4, 9]`:

- Derive `hold[0]`, `sold[0]`, `rest[0]` **from their own state sentences**.
  Show the reasoning, not just the number.
- Then answer: what concrete wrong answer do you get on this input if you set
  `sold[0] = 0` instead of the sentinel? Compute it. Don't guess.

> This is challenge #2 on purpose. Base cases are your #1 recurring weak point,
> and this chapter has three of them.

---

## 3. (medium) Hand-trace the machine

`prices = [6, 1, 3, 2, 4, 7]`.

Fill this table by hand — no code:

```
day:      0     1     2     3     4     5
price:    6     1     3     2     4     7
hold:
sold:
rest:
```

Then state the answer and **which mask it came from**. Finally: name the exact
buy/sell days that realise it.

---

## 4. (medium) Implement it twice

Write both versions and check they agree on all five inputs below:

1. the three-array tabulated version (`hold[]`, `sold[]`, `rest[]`)
2. the `O(1)` rolled version using one tuple assignment

```
[1, 2, 3, 0, 2]      [1]      [2, 1]      [1, 2, 4]      []
```

Then break the rolled version **deliberately**: replace the tuple assignment
with three separate statements in the order `hold`, `sold`, `rest`. Which input
above still passes, and which one exposes the bug? Explain using the phrase
"generation `i-1`".

---

## 5. (medium) TRAP — the arrow that doesn't exist

Someone hands you this line:

```python
hold = max(hold, sold - p)      # instead of  max(hold, rest - p)
```

- Which arrow of Modus's diagram does this draw?
- Which rule does it break?
- On `prices = [1, 2, 3, 0, 2]`, compute the profit this buggy version reports.
  Is it higher or lower than `3`, and why does the direction of the error make
  sense?

---

## 6. (medium) TERMINATION — the legal-end filter

Answer without running anything:

- Why is `max(hold, sold, rest)` wrong even though `hold` is "just another
  cell"?
- Construct a concrete `prices` list of length ≥ 3 where including `hold` in the
  final `max` produces a **strictly wrong** answer, or prove in two sentences
  that it can never happen. (Be careful — think about what `hold` always has
  subtracted from it.)
- Chapter 10 taught *"endpoint forced → read the cell; endpoint free → survey
  with max"*. State the **third** rule this chapter adds, in one line.

---

## 7. (hard) Redraw the machine — transaction fee

New rule: **no cooldown**, unlimited transactions, but every completed sale
costs a flat `fee`.

- Draw the state diagram. How many masks does it need, and why is it fewer
  than three?
- Write the five slots. Pay attention: where exactly does `fee` attach —
  inside the `max` or outside it? Justify using the **mandatory vs optional**
  rule from Chapter 8/9.
- Derive the base cases from scratch (they are **not** the same as this
  chapter's).
- Implement it. Expected: `prices = [1, 3, 2, 8, 4, 9], fee = 2` → `8`.

---

## 8. (hard) Two masks, hidden in plain sight

Rewrite **House Robber** (`nums = [2, 7, 9, 3, 1]`, no two adjacent) as an
explicit two-mask state machine:

```
ROB   = best total GIVEN I robbed house i
SKIP  = best total GIVEN I skipped house i
```

- Write the two transitions from the diagram.
- Derive both base cases.
- State the termination and say which masks are legal to end on.
- Show algebraically that your machine collapses to the familiar
  `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`.

> The point: you have been writing state machines since Chapter 0 without
> knowing it. Every "you may not do X twice in a row" constraint is a mask.

---

## After You Answer

I will diagnose, in this priority order:

1. **Base cases** — did you derive all three separately, or copy? Did you use
   the `-inf` sentinel for the impossible world? *(known weak point #1)*
2. **Termination** — did you filter to legal end-masks, or blindly `max` all
   three? *(known weak point #2)*
3. **The missing arrow** — is the cooldown encoded in the diagram's shape, or
   did you smuggle in an `if`?
4. **Generation discipline** — do all three transitions read `i-1`, or did a
   sequential assignment leak today's value into today's calculation?
5. **Choose vs combine** — is every `max` a choice between exclusive histories,
   and every `± price` attached to exactly one arrow?
6. **State sentences** — does every one contain `GIVEN`? If not, you are still
   thinking in single numbers and Chapter 12 will hurt.

Then we drill whichever bled most, and only then does Vale hand you the chisel.
