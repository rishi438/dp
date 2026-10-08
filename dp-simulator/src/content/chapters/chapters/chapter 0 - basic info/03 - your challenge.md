# Chapter 0 · 03 — Your Challenge (Easy → Hard)

> You just watched me crack a problem with the **Five Slots**.
> Now YOU do it. Write your answers directly under each challenge.
> Bring them back — I diagnose your weak point and drill it before we move on.

> RULE: For every challenge, write ENGLISH first (fulcrum, then state), THEN
> the formula, THEN the base case, THEN where the answer lives.
> Code comes LAST. Just like the worked example.

---

## Challenge 1 (Easy) — Warm-up, no code

Answer the Two Laws for the frog problem from the worked example:

- Does it have **Optimal Substructure**? Why?
- Does it have **Overlapping Subproblems**? Why?

**Your answer:**


---

## Challenge 2 (Easy) — Fill all five slots

Problem: **Count ways to reach the top of a `n`-step ladder, hopping 1 or 2.**
(Yes — same shape as the frog. I want to see you reproduce it from memory.)

```
0. FULCRUM:     ?            (and: how many doors?)
1. STATE:       dp[i] = ?
2. TRANSITION:  dp[i] = ?
3. BASE CASE:   dp[1] = ?, dp[2] = ?
4. TERMINATION: the answer is ?
```

**Your answer:**


---

## Challenge 3 (Medium) — A twist: the fulcrum must adapt

Problem: **Tribonacci ladder.** The frog can now hop **1, 2, OR 3 steps.**

Ask the fulcrum first: "what was the LAST hop?" — how many doors now?
Then fill all five slots:

```
0. FULCRUM:     ?            (how many doors?)
1. STATE:       dp[i] = ?
2. TRANSITION:  dp[i] = ?
3. BASE CASE:   dp[1] = ?, dp[2] = ?, dp[3] = ?
4. TERMINATION: the answer is ?
```

> Bonus, and this matters later: at what number of allowed hop-sizes would you
> stop writing the doors by hand and switch to a **loop**? Say why.

**Your answer:**


---

## Challenge 4 (Medium) — Trace by hand

Using YOUR Challenge 3 transition, fill in the table for the 1-2-3 hop frog:

```
dp[1] = 1
dp[2] = 2
dp[3] = ?
dp[4] = ?
dp[5] = ?
```

**Your answer:**


---

## Challenge 5 (Hard) — Write the code

Turn your Challenge 3 + 4 work into a full Python function `frog_123(n)`
for the 1-2-3 hop frog. Then predict `frog_123(5)` before running it.

**Your answer:**


---

## Challenge 6 (Hard / Trap) — Catch the flaw

A student writes this for the ORIGINAL 1-2 hop frog:

```python
def frog_ways(n):
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    for i in range(3, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
```

It crashes for `frog_ways(1)`. Why? What single guard fixes it?

**Your answer:**


---

## Challenge 7 (Hard / Trap) — Termination is not a habit

Same 1-2 hop frog, but the King changes the decree:

> "Every step `i` pays the frog `gold[i]` coins. The frog may **stop
> anywhere** — it does not have to reach the top. Maximise the coins."

1. Does your STATE change? Write it.
2. Does your TRANSITION change from `+` to something else? Which, and **why**?
3. **The trap:** is the answer still `dp[n]`? If not, what is it, and what
   exact sentence in the decree told you?

> Do not look ahead. If you get this right now, Chapter 6 will be easy.
> If you get it wrong now, you'll never get it wrong again.

**Your answer:**


---

## After You Answer

I will:
1. Read every answer.
2. Point out exactly where you wobbled — which **slot** failed: fulcrum? state?
   transition? base case? termination?
3. Pay special attention to two things:
   - **C3's base cases** — did you DERIVE `dp[3]` or copy a pattern? (This is
     your #1 historical weak point.)
   - **C7.3's termination** — did you say `dp[n]` out of habit?
4. If a weak spot repeats, we DRILL it here until it's automatic.
5. Only when you're confident does the **Chapter 1 cliffhanger** open —
   where we throw away memory and feel the pain of plain recursion.

Write your answers. Then tell me "done".
