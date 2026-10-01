# Chapter 3 · 03 — Your Challenge (Easy → Hard)

> Write your answers under each prompt, then say **"done"**.
> For every coding challenge: state the **fill order** and justify it with the
> Bottom-Up Question, then fill the **Lens table**.

---

## Challenge 1 (Easy) — The Bottom-Up Question

For each transition, say which direction the loop must run (ascending or
descending) and **prove it** by naming the cells read:

```
(a) dp[i]    = dp[i-1] + dp[i-2]
(b) dp[i]    = dp[i+1] + dp[i+2]
(c) dp[i][j] = dp[i-1][j] + dp[i][j-1]
(d) dp[i][j] = dp[i+1][j-1] + 2
```

> (d) is Chapter 13's palindrome recurrence. Get it right now and that chapter
> is free.

**Your answer:**


---

## Challenge 2 (Easy) — Flip it

Take this memoized solution and convert it to bottom-up using the 7-step
recipe. Show each step.

```python
def climb(n, memo={}):
    if n <= 2:
        return n
    if n in memo:
        return memo[n]
    memo[n] = climb(n-1) + climb(n-2)
    return memo[n]
```

Then fill the Lens table for **your** version.

**Your answer:**


---

## Challenge 3 (Medium) — Derive the base, don't copy it

Problem: **Min Cost Climbing Stairs** (from Chapter 2's worked example).
`cost = [10, 15, 20]` → `15`.

1. Write the five slots **for the bottom-up version**.
2. How many cells must you seed before the loop can start? Why that many —
   what in the transition decides it?
3. What are their values? **Derive** them; do not look at Chapter 2.
4. Write the code and verify on both test cases.

**Your answer:**


---

## Challenge 4 (Medium) — Both directions, one problem

Problem: **Coin Change** (fewest coins). `coins = [1,2,5]`, `amount = 11` → `3`.

1. Write the **top-down memoized** version.
2. Write the **bottom-up** version.
3. Put the two transition lines side by side. Are they identical? If not,
   explain what changed and why.
4. Which version would you ship, and why? Give a concrete input size where
   your choice matters.

**Your answer:**


---

## Challenge 5 (Hard / TRAP) — It runs. It's wrong.

This code compiles, runs, and returns a number. The number is wrong.

```python
def rob(nums):
    n = len(nums)
    dp = [0] * n
    dp[0] = nums[0]
    for i in range(1, n):
        dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    return dp[n-1]

print(rob([2, 7, 9, 3, 1]))   # prints 12 — correct!
print(rob([2, 1, 1, 2]))      # prints ?  — wrong
```

1. Run it on `[2, 1, 1, 2]`. What does it print? What is the true answer?
2. **Use the Lens.** Which of the three phases is broken — Initialization,
   Maintenance, or Termination? Name it before you debug.
3. Explain the exact mechanism. (Hint: what is `dp[-1]` in Python when `i = 1`?)
4. Why did the *first* test case pass? What does that teach you about trusting
   a single test?
5. Fix it. Then say which phase your fix belongs to.

> This is the nastiest class of DP bug: **no crash, no exception, correct on
> the obvious input.** The Lens finds it in one line of reasoning.

**Your answer:**


---

## Challenge 6 (Hard / TRAP) — Order matters more than you think

Here is a bottom-up grid-paths solution:

```python
def paths(R, C):
    dp = [[0] * C for _ in range(R)]
    dp[0][0] = 1
    for r in range(R):
        for c in range(C):
            if r > 0: dp[r][c] += dp[r-1][c]
            if c > 0: dp[r][c] += dp[r][c-1]
    return dp[R-1][C-1]
```

1. Verify it gives `6` for a 3×3 grid.
2. Now swap the loops: `for c in range(C):` outside, `for r in range(R):`
   inside. Does it still work? **Prove your answer with the Bottom-Up
   Question**, cell by cell — don't just run it.
3. Now reverse the inner loop to descending. Does it still work? Prove it.
4. State the general rule you just discovered about which loop orders are safe
   for this transition.

**Your answer:**


---

## Challenge 7 (Hard) — Break the ceiling

1. Write memoized `fib(5000)`. What happens?
2. Write bottom-up `fib(5000)`. What happens?
3. Time bottom-up `fib(100000)`. Report roughly how long it takes.
4. Both are `O(n)`. Explain **precisely** why one dies and the other doesn't —
   what resource is each one consuming?
5. Name one problem shape where you would **still** choose top-down despite
   this, and say why.

**Your answer:**


---

## After You Answer

I will check, in priority order:

1. **C5** — the headline challenge. It hits three of your known weak points at
   once: base-case seeding, `dp[-1]` vs `dp[n-1]`, and the off-by-one. If you
   diagnose it with the Lens *before* running it, this chapter is yours.
2. **C1(d) and C6** — loop-order proofs. These are the direct rehearsal for
   Chapter 9's backward iteration and Chapter 12's loop-by-length rule, which
   are the two places bottom-up genuinely bites.
3. **C3.2–3.3** — base-case derivation, again. Fifth chapter running. I want a
   derivation from the state sentence, with no glance at Chapter 2.
4. Drill whatever wobbled.
5. Then **Chapter 4 — Space-Optimized** opens, where Tabby wipes the table
   clean and you keep two numbers.

Write your answers. Then say **"done"**.
