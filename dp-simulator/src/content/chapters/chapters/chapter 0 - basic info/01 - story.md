# Chapter 0 · 01 — Story: The Ground Rules

> The gentle entry. No hard code. Just the world, the villain, and the rules.

---

## The Villain: Repeated Work

Meet **Reco**, a young computer who solves problems by breaking them into
smaller copies of themselves (recursion). Brilliant — but cursed:

**He forgets every answer the instant he finds it.**

Ask him for `fib(5)` (the 5th Fibonacci number, where each number is the sum of
the two before it):

```
fib(5) = fib(4) + fib(3)
fib(4) = fib(3) + fib(2)      ← fib(3) solved AGAIN
fib(3) = fib(2) + fib(1)      ← fib(2) solved AGAIN
```

For `fib(50)`, Reco re-solves `fib(2)` over a **billion** times. He collapses.

> **The villain of the entire book is REPEATED WORK.**
> Every technique you learn exists to defeat this one enemy.

---

## The Weapon: Memory

The whole idea, in one line:

> **Dynamic Programming = Recursion + Memory.**
> Solve each small problem ONCE. Remember it. Never redo it.

Two ways to add memory become your first real chapters:

```
Chapter 2 → WITH MEMOIZATION (top-down):  a notebook you check before solving
Chapter 3 → BOTTOM-UP (tabulation):       a table you fill from the ground up
```

But first (Chapter 1) you'll go WITHOUT memory — to feel why you need it.

---

## The Two Laws (Is DP Even Allowed?)

DP only works when BOTH are true:

**Law 1 — Optimal Substructure:** the big answer is BUILT from smaller answers.
`fib(5)` is built from `fib(4)` and `fib(3)`. ✓

**Law 2 — Overlapping Subproblems:** the same small problem appears more than once.
`fib(3)` showed up repeatedly. ✓

```
Both laws true   → Dynamic Programming
Only Law 1 true  → plain Divide & Conquer (e.g. merge sort)
```

---

## The Five Slots (the shape of every DP answer)

Every DP problem — forever — is cracked by the same five slots, **in this
order**. Each one *produces* the next:

```
Forget the formula for a second. Picture standing at the edge of something —
a cliff, an event horizon, step n of a staircase. You don't need to know the
whole history of how you got there. You only need to know the ONE thing that
happened an instant before "now".

0. FULCRUM       Freeze time one tick before you arrived. Ask only:
                 "What was the last thing that happened?"
                 That's it. You're not solving the problem — you're just
                 listing the handful of ways "now" could have just happened.
                 Standing on step n: you got here by a 1-hop, or a 2-hop.
                 That's not a clue to the answer — IT IS the answer's shape.
                        ↓ (you now have a short list — give it a label)
1. STATE         Whatever sits one tick before "now", give it one short name
                 so you stop re-describing it in full sentences.
                 dp[i] = a label, nothing more — "the answer, as it stood
                 right before this last moment."
                        ↓ (swap the label back into the moment you froze)
2. TRANSITION    Take the sentence from slot 0 and replace the words with
                 the label from slot 1. You're not inventing anything new —
                 you're just writing the SAME idea in shorthand.
                 "got here from n-1, or from n-2" → dp[i] = dp[i-1] + dp[i-2]
                        ↓ (every "before" needs its own "before" — until one doesn't)
3. BASE CASE     Keep rewinding and eventually you hit a moment so small there's
                 nothing before it to explain — you just KNOW the answer by
                 looking at it. That's the floor. Without it, the chain of
                 "ask the moment before" never stops; it free-falls forever.
                        ↓ (the whole chain now computes — but WHERE do you look?)
4. TERMINATION   You've built an answer for every single moment. Only one
                 question is left: which of those moments is the one the
                 world actually asked you about?
                 The last one? The best one anywhere? Don't assume —
                 the question itself always tells you where to look.
```

**Summary — a "slot" is just one numbered question in this fixed checklist:**
```
Slot 0 = FULCRUM     → "what was the last thing that happened?"
Slot 1 = STATE       → "what does dp[i] mean in plain English?"
Slot 2 = TRANSITION  → "how do I build dp[i] from smaller dp's?"
Slot 3 = BASE CASE   → "smallest answer I know without thinking?"
Slot 4 = TERMINATION → "where does the finished answer actually live?"
```

> Most courses teach only slots 1–3 and call them "the three questions."
> **Slots 0 and 4 are the two everybody skips — and they are exactly the two
> that cost you the problem.** Skip the fulcrum and you stare at a blank page.
> Skip termination and you return `dp[-1]` when the answer was `max(dp)`.

---

## Slot 0 in Detail — THE FULCRUM

A fulcrum is the fixed point a lever pivots on. This question is the pivot
between "the whole problem" and "a smaller copy of the same problem":

> **Ask yourself:** "What was the LAST decision/move that got me here?"

Not the *first* move — the **last** one. The last decision is the only one that
leaves a smaller version of the same problem behind it.

Ask it about `fib(5)`:
```
the last step came from fib(4)  ... or from fib(3)
```
Two doors. That single question just split the problem, and slots 1–2 are now
almost mechanical.

**One rule about the fulcrum you must internalise early:**

> The fulcrum is never a line of code. It is a **question**.
> The *answer* to it is a **list of doors**.
> - Few doors, known when you write the code → the transition is **one line**.
> - Many doors, given as data → the transition is **a loop**.

---

## Slot 2 in Detail — THE GENIE MINDSET

The genie mindset is everything:
> You NEVER worry HOW the smaller problems got solved.
> You TRUST they're done, and you just combine them.

And **how** you combine them is decided by the question's verb:

```
"how many ways"      → SUM all the doors        (combine)
"minimum / fewest"   → pick the best door       (choose)
"maximum / longest"  → pick the best door       (choose)
"is it possible"     → OR across the doors      (combine)
```

> **Counting sums the doors. Optimizing picks one door.**
> Say it out loud. Confusing `max(a,b)` with `a+b` is the most common
> mid-level DP bug there is.

---

## Slot 4 in Detail — TERMINATION

When the work is done, **where is the answer?** This is not automatic, and it
changes from problem to problem:

```
"ways to reach step n"        → dp[n]         the journey has a fixed endpoint
"best contiguous run"         → max(dp)       the run can end ANYWHERE
"compare two full strings"    → dp[m][n]      the corner dominates
"cheapest path to the exit"   → dp[R-1][C-1]  the problem NAMES the exit
```

> The rule: **ask whether the problem forces where the answer ends.**
> If it does → read that one cell. If it doesn't → survey them all.
> You will get this wrong at least once. Everyone does. Chapter 6 is built
> around the moment it happens.

---

## How to SPOT a DP Problem (Pattern Recognition)

Before you can solve DP, you must first RECOGNIZE it. Here are the signals.
If a problem trips several of these, your DP alarm should ring.

**Signal 1 — The words in the problem.**
DP problems almost always ask for one of these:
```
"how many ways ..."         → counting DP
"minimum / maximum ..."     → optimization DP
"is it possible to ..."     → yes/no (boolean) DP
"longest / shortest ..."    → optimization DP
```
If you see "count the ways", "min cost", "max profit", "longest sequence" —
suspect DP immediately.

**Signal 2 — You make a sequence of CHOICES.**
At each step you decide something (take/skip, hop 1/2, pick a coin), and each
choice leads to a smaller version of the SAME problem. That's DP's fingerprint.

**Signal 3 — The brute force is exponential.**
If your first instinct is "try all combinations" and that blows up (2ⁿ, n!),
DP is usually the rescue — because those combinations SHARE sub-work.

**Signal 4 — The two laws hold.**
```
Optimal Substructure   → big answer built from smaller answers
Overlapping Subproblems → the same smaller answer is needed repeatedly
```
Both true → DP. This is the final confirmation.

**The 10-second test:**
> "Can I define the answer for size `n` using the answer for smaller sizes,
> AND do those smaller answers repeat?"
> If yes to both → it's DP.

---

## How to IDENTIFY the Pattern (once you know it's DP)

Not all DP is the same shape. Match the problem to a family — and each family
later gets a whole chapter of its own:

```
1D sequence, one choice per step   → Fibonacci / Climbing Stairs   ← Ch 0-4
Choosing from a SET (coins, words) → Coin Change / Word Break      ← Ch 5
Best contiguous run                → Max Subarray (Kadane)         ← Ch 6
Two sequences compared             → LCS / Edit Distance           ← Ch 7
Grid / 2D movement                 → Unique Paths / Min Path Sum   ← Ch 8
Subset / knapsack                  → 0/1 Knapsack / Target Sum     ← Ch 9
... and nine more, up to Chapter 18.
```

The first five chapters teach **APPROACH** (how you build the table).
Chapters 5–18 teach **PATTERN** (what the table means).

```
APPROACH = recursion → memo → bottom-up → space-optimized   (Ch 1-4)
PATTERN  = the 15 shapes a DP problem can take               (Ch 5-18)
```

You need both. Approach without pattern = you can code but can't start.
Pattern without approach = you can start but can't finish.

The full field guide lives in `../pattern.md` — read it whenever you're stuck
identifying which family a problem belongs to.

---

## Cliffhanger

Reco is about to solve Fibonacci with pure recursion and NO memory.
It will work... and then it will betray him as the numbers grow.

You will WATCH it happen with your own eyes — and time it on your own machine —
in **Chapter 1: Without Memoization.**

> First, prove the story landed. Open `02 - worked example.md`,
> then face `03 - your challenge.md`.
