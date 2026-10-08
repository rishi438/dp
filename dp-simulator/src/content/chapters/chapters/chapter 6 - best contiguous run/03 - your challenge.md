# Chapter 6 · 03 — Your Challenge (Easy → Hard)

> Five slots before any code: FULCRUM → STATE → TRANSITION → BASE → TERMINATION.
> Write under each prompt, then say **"done"**.

---

## Challenge 1 (Easy) — Read the scoreboard

For `nums = [4, -1, 2, -7, 3]`, hand-fill the table:

```
i        0     1     2     3     4
nums[i]  4    -1     2    -7     3
dp[i]    ?     ?     ?     ?     ?
```

Then answer:
1. What is `dp[-1]`?
2. What is `max(dp)`?
3. Which is the answer, and **which sentence in the problem statement**
   decides that?

**Your answer:**


---

## Challenge 2 (Easy) — Spot the family

For each problem, say whether Kade (contiguous run) is the right family, and
name the **one word** in the prompt that told you:

```
(a) "Largest sum of any 3 elements you choose."
(b) "Largest sum of any consecutive block."
(c) "Longest substring with no repeating characters."
(d) "Longest subsequence that is increasing."
(e) "Maximum average of any window of exactly k elements."
```

**Your answer:**


---

## Challenge 3 (Medium) — Derive the base, don't copy it

Problem: **Maximum Product Subarray.** `nums = [2, 3, -2, 4]`.

Do NOT write full code yet. Answer only:

1. What are your base value(s) at index 0? Derive them from your own state
   definition, out loud.
2. Corin's base was `dp[0] = 0`. Kade's was `dp[0] = nums[0]`. Yours is
   something else again. In one sentence: **why does the same-looking cell
   hold a different value in all three problems?**

**Your answer:**


---

## Challenge 4 (Medium) — Two cells, not one

Still Max Product Subarray. The real question:

> Kadane needed **one** number per index. Max Product needs **two**
> (`cur_max` and `cur_min`). Explain precisely **why one is not enough**,
> using an input where the running *minimum* becomes the eventual answer.

Then write the full five slots and the code.

**Your answer:**


---

## Challenge 5 (Hard / TRAP) — Kill the wrong state

A student writes:

> `dp[i]` = the best contiguous sum **anywhere inside** `nums[0..i]`

It *sounds* better than yours — it even makes termination trivially `dp[-1]`.

1. Try to write a transition for it. Show where you get stuck.
2. Construct a concrete `nums` where this state makes the transition
   **impossible to write correctly**, and explain what information is missing.
3. Name the trap number from `../pattern.md` that this is an instance of.
4. This "best anywhere" quantity *is* computable — but only if you keep the
   correct state **alongside** it. Write both recurrences together.

**Your answer:**


---

## Challenge 6 (Hard / TRAP) — Circular road

Problem: **Maximum Subarray in a CIRCULAR array.** After the last tile you are
back at the first. `nums = [5, -3, 5]` should give `10` (wrap from the last
`5` around to the first `5`).

1. Why does plain Kadane fail here? Trace it on `[5, -3, 5]`.
2. The standard trick: best circular run = `total_sum − (minimum subarray sum)`.
   Explain **why that is exactly the wrapping case**, in your own words, with a
   picture of the array.
3. There is an edge case where this formula returns nonsense. Find it (hint:
   what if *every* number is negative?) and say how to guard it.
4. Write the code with all five slots stated.

**Your answer:**


---

## After You Answer

I will check, in priority order:

1. **C1.3 and C5** — is termination automatic now? Two chapters, two opposite
   answers (`dp[amount]` vs `max(dp)`). If you can articulate *why* they
   differ, this weak point is closed.
2. **C3** — base-case derivation. Third chapter running that tests it. This is
   your historical #1 failure; I want three clean derivations before I stop.
3. **C4 and C6.3** — "is my state wide enough?" The skill that separates
   medium from hard for the rest of the book.
4. Drill whatever wobbled.
5. Then unlock **Chapter 7 — The Twin Scribes**, where `dp` grows a second
   index and the fulcrum asks about **two** last characters at once.

Write your answers. Then say **"done"**.
