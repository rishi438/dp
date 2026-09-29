# Chapter 17 · 03 — Your Challenges

Rules: five slots in order, before any code. And for every problem here, answer
this before writing a transition:

```
Is my cell a PROBABILITY, a COUNT, or an EXPECTED VALUE?
Because that decides the base case AND the termination.
```

**Standing rule for this chapter: print `Σ dp` after every step while
debugging.** It must never exceed `1`, and where it shrinks tells you where
mass is leaking.

---

## 1. (easy) The third operator

- Complete all three lines and give one example problem from the book for each:

  ```
  OPTIMIZE     ______        e.g. Chapter __
  COUNT        ______        e.g. Chapter __
  PROBABILITY  ______        e.g. Chapter 17
  ```

- In the `3×3`, `k=2` trace, square `(0,0)` receives mass from **two** sources.
  Why do they add instead of competing?
- If you had written `max` there instead, the answer would be `0.046875`.
  Derive that number by hand and say in one sentence what question it answers
  (if any).

---

## 2. (easy) Base-case derivation

- Derive the base case from the state sentence. What is `dp[row][col]`, and what
  is every other cell?
- Twelve chapters trained you to seed a table with `inf` or `-inf`. Explain in
  two sentences why **there is no sentinel in this chapter**. Your answer must
  mention what the transition does with the value.
- Now the contrast: for the **expected-value** version of a process, the base is
  `E = 0` at the end. Why is that *not* the same as `1.0`? Derive both from
  their own state sentences.

> Base cases are your #1 weak point, and this chapter's base is a **point mass** —
> a shape you have never seen before.

---

## 3. (medium) Hand-trace the distribution

Knight on a `3 × 3` board, starting at `(0,0)`, `k = 2`.

Write out the full grid at step 0, step 1, and step 2, and the value of `Σ dp`
at each step.

Then answer:
- `Σ dp` goes `1.0 → 0.25 → 0.0625`. What does the missing mass represent?
- Which square receives from two sources at step 2, and what are the two
  contributions?
- Verify `0.0625 = 4 / 64` by listing the four surviving 2-leap sequences.

---

## 4. (medium) Implement it

Write `knight_probability(n, k, row, col)`. Verify **all** of these:

```
(3, 2, 0, 0) -> 0.0625        (3, 1, 0, 0) -> 0.25
(3, 1, 1, 1) -> 0.0           (3, 3, 0, 0) -> 0.015625
(8, 1, 0, 0) -> 0.25          (8, 2, 0, 0) -> 0.1875
(8, 3, 0, 0) -> 0.125         (1, 0, 0, 0) -> 1.0
(3, 0, 0, 0) -> 1.0           (2, 1, 0, 0) -> 0.0
```

Then explain the last two in words:
- why is `(3, 0, 0, 0)` exactly `1.0`?
- why is `(2, 1, 0, 0)` exactly `0.0`? (Think about a `2×2` board.)

---

## 5. (medium) TRAP — where the weight goes

Break your solution three ways. For each: give the output on `(3, 2, 0, 0)` and
say whether the result is too big, too small, or deceptively plausible.

- **(a)** Drop the `/ 8.0` from the arrow and divide the final answer by `8**k`.
  Is this right or wrong? Answer carefully — then test it on `(3, 1, 1, 1)`.
- **(b)** Count the legal moves `m` and divide by `m` instead of `8`.
- **(c)** Keep `/ 8.0` on the arrow **and** divide the final answer by `8`.

For **(b)**, state exactly what question the buggy code is answering. What will
it return for *every* input, and why?

---

## 6. (medium) TRAP — the generation leak

Replace the fresh `nxt` grid with an in-place update: `dp[nr][nc] += dp[r][c]/8`.

- Run it on `(3, 2, 0, 0)`. What do you get?
- Describe the physical nonsense this allows the knight to do.
- Which two earlier chapters warned you about this exact bug, and what did each
  call it?
- State the general rule in one line: *"When a transition reads and writes the
  same axis, ______."*

---

## 7. (medium) TERMINATION

- Why is the answer `sum(sum(row) for row in dp)` and not `max`?
- Chapter 6 and Chapter 10 both surveyed the whole table with `max`. Explain the
  difference in one sentence, using the phrase **mutually exclusive events**.
- List all seven termination shapes you now know, one line each.
- If the question had been *"what is the probability the knight ends on the
  square `(2, 0)`?"*, what changes — and which slot does it change?

---

## 8. (medium) Probability is counting, divided

Write the **integer twin** `knight_paths(n, k, row, col)`.

- What does a cell hold now? Write the sentence.
- What is the base case, and why is it `1`?
- Verify: `(3,1,0,0) → 2`, `(3,2,0,0) → 4`, `(8,2,0,0) → 12`,
  `(8,3,0,0) → 64`.
- Confirm `knight_paths(...) / 8**k` matches the float version for all four.
- Now the design question: name **two** concrete advantages of the integer
  version, and name the exact situation in which it **stops working** and you
  must go back to floats.

---

## 9. (hard) Same board, no probability at all

**Knight Dialer.** A knight moves on a phone keypad:

```
    1 2 3
    4 5 6
    7 8 9
      0
```

Count the distinct numbers of length `n` it can dial, starting from any digit.
Return the count modulo `10⁹ + 7`.

- Write the state sentence. Is the cell a probability or a count?
- Derive the base case for `n = 1`.
- What is the termination, and why is it a sum over all ten digits?
- Which digit is a dead end, and what does its adjacency list look like?
- Implement and verify: `1 → 10`, `2 → 20`, `3 → 46`, `4 → 104`,
  `3131 → 136006598`.
- Why does this problem need a `MOD` when the knight-probability version does
  not? And what risk does the *float* version carry that this one does not?

---

## 10. (hard) The averaging cell

**Expected value.** Write down, and justify, the general transition:

```
E = Σ pᵢ · ( valueᵢ + E_next )
```

- Why is `valueᵢ` **inside** the weighted sum? Which earlier chapter's rule is
  this (mandatory vs optional)?
- **(a)** A fair 6-sided die is rolled once. Derive `E[score]` by hand from the
  formula. Then give `E` for two dice. (Expected: `3.5` and `7.0`.)
- **(b)** You roll a fair die repeatedly until you see a `6`, but you stop after
  at most `m` rolls regardless. Let `E(m)` be the expected number of rolls.
  Write the recurrence, derive the base case, and compute:
  `E(1) = 1.0`, `E(2) = 1.833333`, `E(10) = 5.030967`.
- For (b), state the base case in words and explain why it is **not** `1.0`.

---

## 11. (hard) Counting under randomness

**Dice Roll Sum.** Roll `d` dice with `f` faces each; count the ways to total
exactly `target`, modulo `10⁹ + 7`.

- Write the state sentence and derive `dp[0] = 1`. Which two other chapters have
  the identical base case, and what do all three have in common?
- Why must each die get a **fresh layer**? What goes wrong in place?
- Implement and verify: `(1,6,3) → 1`, `(2,6,2) → 1`, `(2,6,7) → 6`,
  `(30,30,500) → 222616187`.
- Convert `(2,6,7)` into a probability by hand. Show the division.

---

## 12. (hard) The problem Fortuna left you

**New 21 Game.** Alice's score starts at `0`. While her score is **strictly
below `k`**, she draws a number uniformly from `1 … maxPts` and adds it. What is
the probability her final score is **at most `n`**?

- Write the state sentence for `dp[x]`.
- Write the transition. Which values of `j` contribute to `dp[x]`, and what is
  the extra condition on `j` that people forget?
- Derive the base case and the termination.
- What are the two degenerate cases you must handle **before** the loop?
  (`k == 0`, and one more — derive it.)
- Implement the **naive** `O(n · maxPts)` version and verify:
  `(21,17,10) → 0.73278`, `(10,1,10) → 1.0`, `(6,1,10) → 0.6`,
  `(1,1,1) → 1.0`, `(0,0,1) → 1.0`.

Now the real question, and it is the bridge to the last chapter:

- Write out the sums for `dp[x]` and `dp[x+1]` side by side. How many terms do
  they share?
- How many *additions* does the naive version perform in total, in terms of `n`
  and `maxPts`?
- Your five slots are all **correct** and the algorithm is still **wrong for the
  constraints**. Describe, in two sentences and without code, how you would
  compute every `dp[x]` with a constant number of operations each.
- What exactly enters the running sum at step `x`, and what exactly leaves it?

> Answer that last pair before you turn the page. The swordsman will ask it, and
> he will not repeat himself.

---

## After You Answer

I will diagnose, in this priority order:

1. **Base cases** — a point mass for probability, `1` for counting, `0` for
   expectation. Derived from *your* state sentence, not copied across the three.
   And no sentinel. *(known weak point #1)*
2. **Termination** — sum the whole distribution. Not `max`, not one cell. Can
   you say why, using "mutually exclusive"? *(known weak point #2)*
3. **The weight's home** — on each arrow, not on the node and not at the end.
   Did you avoid renormalising?
4. **Generation discipline** — fresh layer per step. Third appearance of this
   bug in the book; I expect you to catch it now without being told.
5. **Cell meaning** — probability vs count vs expectation. If you cannot say
   which one your cell holds in one sentence, nothing downstream is trustworthy.
6. **Representation** — did you notice when the integer twin is strictly better,
   and can you name when it stops being an option?

Then we drill whichever bled most — and you walk the length of the hall to the
swordsman with the knotted rope.
