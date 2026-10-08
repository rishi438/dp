# Chapter 4 · 03 — Your Challenge (Easy → Hard)

> Write your answers under each prompt, then say **"done"**.
> For every roll: state the **window**, **name each variable with the dp cell
> it is**, justify the **loop direction**, and re-fill the **Lens**.

---

## Challenge 1 (Easy) — Measure the window

For each transition, state the window and how much you must keep:

```
(a) dp[i]    = dp[i-1] + nums[i]
(b) dp[i]    = dp[i-1] + dp[i-2] + dp[i-3]
(c) dp[i]    = max(dp[j] + 1 for all j < i if nums[j] < nums[i])
(d) dp[i][j] = dp[i-1][j-1] + 1
(e) dp[i][j] = dp[i-1][j] + dp[i-2][j]
```

For any that **cannot** be rolled, say so and explain why.

**Your answer:**


---

## Challenge 2 (Easy) — Roll Min Cost Climbing Stairs

Take your bottom-up solution from Chapter 3, Challenge 3.

1. What is the window?
2. Roll it to `O(1)` space.
3. Label every variable with the `dp` cell it represents.
4. Verify on `[10,15,20]` → `15` and `[1,100,1,1,1,100,1,1,100,1]` → `6`.

**Your answer:**


---

## Challenge 3 (Medium) — Roll a 2D problem

Problem: **Longest Common Subsequence**, `a = "abcde"`, `b = "ace"` → `3`.

1. Which cells does `dp[i][j]` read? Name all three.
2. What is the window in *rows*?
3. Roll it to two rows. Then try to roll it to **one** row — what goes wrong,
   and what single extra variable rescues it? (Hint: which of the three reads
   gets clobbered first?)
4. Which dimension should you roll, `m` or `n`? Why?
5. What did you lose by rolling? Be specific about what you can no longer report.

**Your answer:**


---

## Challenge 4 (Hard / TRAP) — One character, two problems

```python
# PROGRAM A
def solve_a(weights, values, cap):
    dp = [0] * (cap + 1)
    for wt, val in zip(weights, values):
        for w in range(cap, wt - 1, -1):
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[cap]

# PROGRAM B
def solve_b(weights, values, cap):
    dp = [0] * (cap + 1)
    for wt, val in zip(weights, values):
        for w in range(wt, cap + 1):
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[cap]
```

1. Run both on `weights=[1,3,4]`, `values=[15,20,30]`, `cap=4`.
   Report both answers.
2. **Which problem does each solve?** Name them.
3. Explain the mechanism precisely: at the moment `dp[w - wt]` is read, which
   *generation* (row `i-1` or row `i`) does it hold in each program, and why?
4. Fill the **Maintenance** row of the Lens for each program. That row alone
   should make the difference obvious.
5. Which trap number in `../pattern.md` is this?

**Your answer:**


---

## Challenge 5 (Hard / TRAP) — Termination after the table is gone

Problem: **Maximum Subarray** (you'll meet it properly in Chapter 6).

```
dp[i] = max(nums[i], dp[i-1] + nums[i])
answer = max(dp)          ← note: NOT dp[-1]
```

1. What is the window? How many variables does the *transition* need?
2. **The trap:** you rolled the array away. You can no longer call `max(dp)`.
   What must you add, and why can it **not** be the same variable as your
   rolled state?
3. Write the `O(1)`-space version. Verify on
   `[-2,1,-3,4,-1,2,1,-5,4]` → `6` and `[-3,-1,-2]` → `-1`.
4. A student merges the two variables into one. Show the input where that
   breaks and explain what it computes instead.

> This is the classic Kadane bug. Meeting it *here*, in the space chapter,
> is the point — it is a **termination** problem disguised as a space problem.

**Your answer:**


---

## Challenge 6 (Hard) — When rolling is forbidden

For each, say whether you can space-optimize. If yes, to what. If no, why not.

```
(a) Fibonacci — but you must return the whole sequence, not just fib(n)
(b) Edit Distance — but you must print the actual edit script
(c) LIS via dp[i] = 1 + max(dp[j] for j < i)
(d) Coin Change — dp[x] = min(dp[x], dp[x-c] + 1), coins up to 1000
(e) Any top-down memoized solution
```

Then answer the general question:

> **What property must a DP have before it can be space-optimized at all?**
> State it in one sentence, then explain why (e) can never satisfy it.

**Your answer:**


---

## Challenge 7 (Hard) — The full ladder, one problem

Take **House Robber** and write it **four times**:

```
1. Plain recursion (no memo)      → report time complexity
2. Top-down memoized              → report time + space
3. Bottom-up table                → report time + space
4. Rolled to O(1)                 → report time + space
```

Then answer:

1. Put all four **transition lines** side by side. Are they the same?
2. Which step improved **time**? Which improved **space**? Which improved
   *neither* but was still necessary — and why?
3. Which of the five slots changed across the four versions?

**Your answer:**


---

## After You Answer

I will check, in priority order:

1. **C4** — the headline. If you can explain *generations* rather than just
   reciting "knapsack goes backward," you own this chapter and Chapter 9 will
   be trivial.
2. **C5** — termination after erasure, and the two-variable separation. This
   is your known `dp[-1]` vs `max(dp)` weak point in its hardest form.
3. **C6** and **C7.2** — the honest trade-offs. I want you to say out loud
   that Chapters 3 and 4 bought **robustness and memory, not speed.**
4. **C1(c) and C3.3** — knowing when rolling is *impossible* is as valuable as
   knowing how.
5. Drill whatever wobbled.

Then the **APPROACH half of the book is complete**, and
**Chapter 5 — Corin the Coinsmith** opens the fifteen **PATTERNS**:

```
Ch 0-4   HOW you build the table   ← done after this
Ch 5-18  WHAT the table means      ← the rest of the book
```

Write your answers. Then say **"done"**.
