# Chapter 10 · 03 — Your Challenge (Easy → Hard)

> Five slots before any code: FULCRUM → STATE → TRANSITION → BASE → TERMINATION.
> Write under each prompt, then say **"done"**.

---

## Challenge 1 (Easy) — Fill the bench

```
nums = [3, 10, 2, 1, 20]
```

1. Hand-fill `dp` (longest strictly increasing chain ending exactly at `i`).
   For each cell, list **every door** (the qualifying `j` values), not just the
   winner.
2. Which cell has zero doors, and what is its value? Which slot decided that?
3. Give the answer and the actual chain.
4. Now do it again for `nums = [3, 2]`. Two cells, two answers, and state in
   one sentence why the answer isn't `dp[-1]` here even though it happens to
   equal it.

**Your answer:**


---

## Challenge 2 (Easy) — The fulcrum became a loop

```python
# Ch 8                                   # Ch 10
top  = dp[r-1][c]                        for j in range(i):
left = dp[r][c-1]                            if nums[j] < nums[i]:
dp[r][c] = grid[r][c] + min(top, left)           dp[i] = max(dp[i], dp[j] + 1)
```

1. Both are "the fulcrum in symbols". Why does Chapter 8's fit on one line
   while Chapter 10's needs a loop? Answer in terms of **what decides the door
   list**.
2. In Chapter 10, how many doors does index `i` have *at most*? What does that
   make the time complexity, using `TIME = states × transition cost`?
3. The `+ 1` is outside the `max`, not inside a branch. Is it a *mandatory* or
   *optional* element? Justify from the definition, and contrast it with
   Chapter 9's `+ values[i-1]`.

**Your answer:**


---

## Challenge 3 (Medium) — Break `dp[-1]` yourself

On `nums = [10, 9, 2, 5, 3, 7, 101, 18]`, a `return dp[-1]` passes.

1. Construct the **shortest possible** input on which `dp[-1]` gives the wrong
   answer. Show `dp` and both values. (Prove your input is minimal: check by
   hand that **no** array of length 2 can break it, and say why.)
2. Explain, using the **state sentence only**, why `dp[-1]` is meaningless as a
   final answer here — no mention of test cases.
3. Chapters 5, 8 and 9 all ended at a named cell. Chapters 6 and 10 survey.
   Write the **one question** you will ask in every future chapter to decide
   which, and then answer it for all five of those chapters in a table.
4. `max(dp)` crashes on `nums = []`. What should LIS of `[]` be, and why is
   this a Termination bug rather than an Initialization bug?

**Your answer:**


---

## Challenge 4 (Medium / TRAP) — One character, two problems

```python
if nums[j] < nums[i]:      # version A
if nums[j] <= nums[i]:     # version B
```

1. Run both on `nums = [2, 2, 2, 3]` by hand. Give both `dp` arrays and both
   answers.
2. Name the problem each version solves, using the precise words a problem
   statement would use.
3. In `lis_length_fast`, the same trap appears as `bisect_left` vs
   `bisect_right`. Explain **why** `bisect_left` enforces strictness — what
   does it do with a value equal to an existing tail, and why does that prevent
   the chain from growing?
4. Which of your logged weak points is this the same disease as — Chapter 9's
   forward/backward loop, or Chapter 8's `inf`-vs-`0`? Justify your choice in
   one sentence.

**Your answer:**


---

## Challenge 5 (Hard) — Derive a new base for a new meaning

> **Maximum Sum Increasing Subsequence.** Same rules as LIS, but maximise the
> **sum** of the chosen elements, not the count.
> `nums = [1, 101, 2, 3, 100, 4, 5]` → expected `106`.

1. State the new `dp[i]` sentence. Exactly one word changes from LIS.
2. **Derive the base case from that sentence.** Do not look at `lis_length`.
   What is `dp[i]` when index `i` has no valid predecessor?
3. A student copies `dp = [1] * n` from LIS. Trace `nums = [10, 5, 4, 3]` and
   give the number it returns. Then trace `nums = [1, 2]` and show that it
   returns the *right* answer — explain why a passing test proves nothing here.
4. Write the transition. Is the `+ nums[i]` mandatory or optional? Inside or
   outside the `max`? Why is that *different* from Chapter 9's `+ val`?
5. Now a genuinely nastier one: `nums = [-5, -3, -1]`, all negative. What does
   your function return, and is that correct? What if the problem said the
   chain may be **empty**? Which slot changes, and to what?

**Your answer:**


---

## Challenge 6 (Hard) — Two disguises

**(a) Russian Doll Envelopes.** `envelopes = [[5,4],[6,4],[6,7],[2,3]]`.
Envelope `(w,h)` fits inside `(W,H)` iff `w < W` **and** `h < H`. Find the
longest nesting chain. (Expected: `3` — `(2,3) → (5,4) → (6,7)`.)

1. Sort by width ascending. Now the problem is LIS on the heights — *almost*.
   Find the input above where naive "sort by width, LIS on height" gives the
   **wrong** answer, and say exactly which pair breaks it.
2. The standard fix is: sort width ascending, **height descending** within
   equal widths. Explain precisely why the descending tie-break makes equal
   widths impossible to chain. Re-run your trace to confirm.
3. Write it. Which helper from the worked example do you call, unchanged?

**(b) Minimum Deletions to Sort.** Given `nums`, delete the fewest elements so
the rest is strictly increasing. `[3, 1, 2, 5, 4]` → expected `2`.

4. Solve it in **one line** using a function you already have. Justify the
   formula in one sentence.
5. What's the answer for a strictly decreasing array of length `n`? Sanity-check
   your formula against it.

**Your answer:**


---

## Challenge 7 (Hard / TRAP) — Longest Bitonic, and the lie in `tails`

**(a)** A **bitonic** subsequence increases, then decreases. (Either side may
be empty.) `nums = [1, 11, 2, 10, 4, 5, 2, 1]` → expected `6`
(`1, 2, 10, 4, 2, 1`).

1. You need **two** arrays: `inc[i]` (longest increasing chain ending at `i`)
   and `dec[i]` (longest decreasing chain **starting** at `i`). Write both
   state sentences precisely — note the word *ending* vs *starting*.
2. For `dec`, which direction must the outer loop run, and why? Prove it with
   the source-cell check.
3. The answer is **not** `max(inc) + max(dec)`. Write the correct combination
   at index `i`, and explain the `- 1`.
4. Fill the Lens table for the combination step specifically — what invariant
   must hold *before* you combine?

**(b)** In `lis_length_fast`, `tails` for `nums = [1, 3, 5, 2]` is `[1, 2, 5]`.

5. Verify by hand that `[1, 2, 5]` is **not** a subsequence of the input.
   Give the indices and show the order violation.
6. Yet `len(tails) == 3` is correct. State the exact invariant `tails[k]`
   maintains — the one that makes the *length* trustworthy while the *contents*
   are not.
7. When would you still choose the `O(n²)` version over the `O(n log n)` one?
   Give two concrete reasons.

**Your answer:**


---

## After You Answer

I will check, in priority order:

1. **C3** — termination. This is the chapter built to catch you. You have just
   come off three chapters of named exits (`dp[amount]`, `dp[R-1][C-1]`,
   `dp[n][W]`) and your logged habit is `dp[-1]`. C3.3 asks you to write the
   decision rule down permanently; I will hold you to it for the rest of the
   book.
2. **C5.2 and C5.3** — base-case derivation. Seventh chapter running. C5 is
   engineered so the copied base *passes* one test and fails another; I want to
   see you derive before you test.
3. **C2.1 and C2.2** — fulcrum-as-a-loop, and `TIME = states × transition cost`
   with a transition cost that is finally not `O(1)`. This matters for Ch 12
   and Ch 15, where the transition cost is the whole story.
4. **C6** — pattern recognition through a disguise, plus the tie-break
   reasoning. Same skill as Chapter 9's Target Sum.
5. **C7.2** — loop direction proved, not guessed. Third chapter of this drill.
6. Drill whatever wobbled.
7. Then unlock **Chapter 11 — Modus the Mask-Wearer**, where `dp[i]` splits
   into `dp[i][state]` because *what you are allowed to do next depends on what
   you just did*.

Write your answers. Then say **"done"**.
