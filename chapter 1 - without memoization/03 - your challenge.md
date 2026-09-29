# Chapter 1 · 03 — Your Challenge (Easy → Hard)

> You saw plain recursion explode. Now YOU make it explode, measure it, and
> extract structure from new problems. Write answers under each. Then say "done".

> RULE: no memoization allowed in this chapter. Plain recursion only.
> The whole point is to FEEL why memory matters.

---

## Challenge 1 (Easy) — Read the tree

In the `fib(6)` tree from the worked example, how many times does `fib(2)`
get computed? (Look, count, answer.)

**Your answer:**


---

## Challenge 2 (Easy) — Name the cost

Plain recursive Fibonacci runs in roughly O(____) time.
Pick one and say WHY in one sentence: `O(n)`, `O(n²)`, `O(2ⁿ)`, `O(log n)`.

**Your answer:**


---

## Challenge 3 (Medium) — Measure it yourself

Run the call-counter code from the worked example (Step 2) on YOUR machine.
Write down the call counts for `fib(10)`, `fib(20)`, `fib(30)`.
Then: by roughly what factor did calls grow from fib(20) to fib(30)?

**Your answer:**


---

## Challenge 4 (Medium) — Extract structure from a NEW problem

Problem: **A frog hops 1 or 2 steps; count ways to reach step `n`.**
Write the PLAIN recursion (no memory), then name all **five slots** by
pointing at your own lines:

```
FULCRUM     = ?   (which sub-calls did you write, and why those?)
STATE       = ?
TRANSITION  = ?
BASE CASE   = ?
TERMINATION = ?
```

**Your answer:**


---

## Challenge 5 (Hard) — Predict the pain

Without running: is `frog(35)` (plain recursion) closer in cost to
`frog(20)` or to `frog(40)`? Explain using the doubling idea.

**Your answer:**


---

## Challenge 6 (Hard / Trap) — Does memory even help here?

Problem: **`factorial(n) = n * factorial(n-1)`, base `factorial(0) = 1`.**

Write the plain recursion. Then answer the KEY question:
> Would adding a memoization notebook SPEED THIS UP? Why or why not?
> (Hint: check Law 2 — are there any OVERLAPPING subproblems in factorial?)

**Your answer:**


---

## After You Answer

I will:
1. Read every answer.
2. Find your weak point — is it reading trees? naming O(2ⁿ)? extracting
   transition? spotting when overlap does NOT exist (Challenge 6 is the trap)?
3. Drill that weak spot right here until it's automatic.
4. Then the cliffhanger opens: **Chapter 2 — With Memoization**, where the
   notebook finally kills the villain.

Special note on Challenge 6: it's a TRAP that teaches the deepest lesson of
this chapter — memory only helps when subproblems REPEAT. If they don't,
memoization is useless. Think hard before answering.

Write your answers. Then say "done".
