# Chapter 5 · 03 — Your Challenge (Easy → Hard)

> Write your answer under each prompt. Then say **"done"** and I'll diagnose.
> For every coding challenge, state all **five slots** before code:
> FULCRUM → STATE → TRANSITION → BASE → TERMINATION.

---

## Challenge 1 (Easy) — Name the doors

`coins = [2, 3, 7]`, and you are standing at `x = 9`.

List every door the fulcrum opens — the exact `dp[...]` cells the transition
will read for `dp[9]`. Then say which ones do **not** exist and why.

**Your answer:**


---

## Challenge 2 (Easy) — Choose vs combine

Same coins. Write the ONE-LINE transition for each question:

```
(a) "Fewest coins to make x"            dp[x] = ?
(b) "How many ways to make x"           dp[x] = ?
(c) "Is x reachable at all, true/false" dp[x] = ?
```

Then say in one sentence **what in the question text** told you which operator
to use.

**Your answer:**


---

## Challenge 3 (Medium) — Derive the base case, don't copy it

Problem: **Coin Change II — count the number of distinct combinations that
make `amount`.**

Do NOT write code yet. Answer only:

> What is `dp[0]`, and **why**? Justify it in one sentence that does not
> mention Coin Change I.

> Then: in Coin Change I the base was `dp[0] = 0`. Here it is different.
> Explain in one sentence why the same cell holds a different number.

**Your answer:**


---

## Challenge 4 (Medium) — Word Break

Problem: **Given `s = "leetcode"` and `words = ["leet", "code"]`, can `s` be
cut into a sequence of dictionary words?**

Give all five slots, then the code.

Hints you should not need but may use:
- The fulcrum here is *"what was the LAST word I placed?"*
- The doors are the words, not the characters.

```
FULCRUM     =
STATE       =
TRANSITION  =
BASE CASE   =
TERMINATION =
```

**Your answer:**


---

## Challenge 5 (Hard / TRAP) — Loop order changes the ANSWER

These two loops differ **only** in which loop is on the outside.

```python
# VERSION A
for c in coins:
    for x in range(c, amount + 1):
        dp[x] += dp[x - c]

# VERSION B
for x in range(1, amount + 1):
    for c in coins:
        if c <= x:
            dp[x] += dp[x - c]
```

With `coins = [1, 2]`, `amount = 3`, `dp[0] = 1`:

1. Hand-trace **both** and give the final `dp[3]` for each.
2. They differ. Say precisely **what each version is counting**.
3. Which answers *"how many distinct COMBINATIONS"*, and which answers
   *"how many distinct PERMUTATIONS"*? Explain using the fulcrum.
4. The killer: in Coin Change I (using `min`) loop order does **not** matter.
   In Coin Change II (using `+`) it changes the meaning of the problem.
   **Why is `min` immune and `+` not?**

**Your answer:**


---

## Challenge 6 (Hard / TRAP) — Prove it with the Lens

Take your Challenge 4 (Word Break) solution and fill this table **for your own
code**:

| Loop-invariant phase | Your code's version | Why it's true |
|----------------------|---------------------|---------------|
| **Initialization**   |                     |               |
| **Maintenance**      |                     |               |
| **Termination**      |                     |               |

Then answer the killer question:

> In your Maintenance row you claim "if all smaller `dp` are correct, then
> `dp[i]` is correct." **Prove every cell you read is already filled.**
> Which property of your loop guarantees it?

**Your answer:**


---

## After You Answer

I will:
1. Read all six.
2. Check specifically whether you **derived** the base cases in C3 and C4 or
   pattern-matched them from the worked example. This is your #1 recurring
   weak point — three strikes historically. C3 exists solely to catch it.
3. Check whether you said `dp[amount]` or drifted to `max(dp)` in C4's
   termination slot. (`max(dp)` is wrong here. Know *why* before Chapter 6,
   where it becomes right.)
4. Drill whichever slot wobbled, right here, until it's automatic.
5. Then unlock **Chapter 6 — Kade the Streak-Runner**, where termination flips
   and everyone falls for it once.

Write your answers. Then say **"done"**.
