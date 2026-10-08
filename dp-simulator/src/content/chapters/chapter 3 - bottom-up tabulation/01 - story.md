# Chapter 3: Fill the small answers first

**Bottom-up DP means writing known small answers into a table, then using them to calculate larger answers.** "Tabulation" is another name for this table-filling approach.

For Fibonacci, positions 1 and 2 both contain 1. Each later position adds the previous two.

```text
Position:  1  2  3  4  5  6
Answer:    1  1  2  3  5  8
```

## What goes in the table?

`dp[i]` means "the Fibonacci number at position i."

- **Smaller answers needed:** `dp[i-1]` and `dp[i-2]`.
- **Calculation:** `dp[i] = dp[i-1] + dp[i-2]`.
- **Starting answers:** `dp[1] = dp[2] = 1`.
- **Fill order:** positions 3, 4, 5, and so on.
- **Final answer:** `dp[n]`.

For position 5, positions 3 and 4 are already ready. We read 2 and 3, add them, and write 5. No function has to pause while another recursive call works.

## The one question that determines loop order

**"Have I already calculated every answer this cell reads?"**

Here, the needed positions are smaller, so fill left to right. Other DP problems may need another order; choose it from the calculation, not from habit.

A **loop invariant** is a statement that remains true before every loop step. Here it is: "All earlier Fibonacci positions are correct." The starting values make it true. Adding the two correct earlier answers makes the next answer correct too.

**Common mistake:** filling from the end backward. When calculating position 6, positions 4 and 5 would still be empty.

Compared with memoization, the small-answer formula is unchanged. The table and loop replace the recursive calls. This avoids recursion-depth errors and makes it easy to inspect intermediate answers.

---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 3 · 01 — Story: Tabby and the Bottom-Up Table

> Reco can fall *down* into a problem. Tabby teaches him to **build up** out of
> one — and hands him the only tool in this book that lets you **prove** a DP
> is correct instead of hoping.

---

## The Woman With the Flat Table

Reco limps down the staircase, `RecursionError` still ringing in his ears. At
the bottom sits a woman with a wide wooden table, chalk lines ruled across it
into numbered squares. No books. No stack of pending questions.

**Tabby.**

> "Your wizard taught you to *ask*. Asking is expensive — every question you
> can't answer yet has to be **held open** while you go ask another one. Hold
> five thousand questions open and the tower falls."
>
> "I never ask. I only **write**."

She chalks a row of squares, left to right:

```
┌───┬───┬───┬───┬───┬───┐
│ 1 │ 1 │ 2 │ 3 │ 5 │ 8 │
└───┴───┴───┴───┴───┴───┘
  1   2   3   4   5   6
```

> "Square 3 needs squares 2 and 1. So I fill 1 and 2 **first**. Then 3 is just
> arithmetic — nothing is pending, nothing is held open, nothing can collapse."

---

## The Flip

Both directions, side by side. Look at how little differs:

```python
# TOP-DOWN (Ch 2) — pull                    # BOTTOM-UP (Ch 3) — push
def fib(n, memo={}):                        def fib(n):
    if n in memo:                               dp = [0] * (n + 1)
        return memo[n]                          dp[1] = dp[2] = 1
    if n <= 2:                                  for i in range(3, n + 1):
        return 1                                    dp[i] = dp[i-1] + dp[i-2]
    memo[n] = fib(n-1) + fib(n-2)               return dp[n]
    return memo[n]
```

```
memo[n]      becomes   dp[n]          ← the notebook becomes an array
recursion    becomes   a for-loop     ← the stack becomes an index
"ask first"  becomes   "fill first"   ← laziness becomes order
```

> **And the transition line is byte-for-byte identical.**
> `dp[i] = dp[i-1] + dp[i-2]` in both. The five slots did not move. You are
> not learning a new algorithm — you are learning a new way to *carry* one.

---

## The One New Question Bottom-Up Forces You to Answer

Top-down never made you think about **order**. Recursion figured it out for
you: if `dp[5]` needed `dp[3]`, it just went and got it.

Bottom-up has no such luxury. If you read a square before you've written it,
you read a **zero** — and get a silently wrong answer with no crash, no
exception, nothing.

> ### The Bottom-Up Question: *"When I compute this cell, is every cell it reads ALREADY written?"*

For Fibonacci it's obvious — `dp[i]` reads `dp[i-1]` and `dp[i-2]`, and the
loop ascends, so both are behind us. ✓

It will **not** always be obvious:

```
Ch 8  (grid)       reads up and left     → row-major works      ✓
Ch 9  (knapsack)   rolled to 1D          → must go BACKWARD     ⚠
Ch 12 (interval)   reads inner ranges    → must loop BY LENGTH  ⚠⚠
Ch 13 (palindrome) reads dp[i+1][j-1]    → i must DESCEND       ⚠
```

Four chapters where the obvious loop order is **wrong**. You need something
better than intuition.

Tabby has it.

---

## The Invariant Lens (the real gift of this chapter)

> "A loop you can't justify is a loop you don't control," says Tabby.
> "So justify it. Three rows. Always the same three rows."

A DP loop is a **loop invariant** in disguise. Here is the mapping, and it is
the most valuable table in this entire book:

| Loop-invariant phase | DP name          | What it means here                              |
|----------------------|------------------|-------------------------------------------------|
| **Initialization**   | Base Case        | The starting truth you know without computation |
| **Maintenance**      | Transition       | One step forward preserves correctness          |
| **Termination**      | State (final)    | Loop ends → `dp[n]` holds the answer            |

Read it as one sentence:

> *"`dp[0..i]` is correct **before** the loop runs (Initialization).
> If `dp[0..i-1]` is correct, my transition makes `dp[i]` correct too
> (Maintenance). Therefore when the loop ends at `i = n`, `dp[n]` is correct
> (Termination)."*

That is a **proof**, not a hope.

And notice it is just your five slots, re-sorted into loop-order:

```
slot 3  BASE CASE    →  Initialization
slot 2  TRANSITION   →  Maintenance
slot 4  TERMINATION  →  Termination
```

> Slots 0 and 1 (fulcrum, state) built the recurrence.
> The Lens proves the *loop* around it is sound. Different job, same five
> ingredients.

---

## The Lens Is Also Your Debugger

This is why it earns its place. Three phases → **three failure modes**, and
each one points at a different line of your code:

```
Wrong answer, but the shape looks right?
  → INITIALIZATION is wrong. You copied a base case instead of deriving it.

Right for small n, wrong for large n?
  → MAINTENANCE is wrong. Your transition misses a door, OR your loop order
    means dp[smaller] wasn't ready when you read it.

Every dp cell is correct but the returned number is wrong?
  → TERMINATION is wrong. You read the wrong cell. (max(dp) vs dp[-1].)
```

> Stop scattering `print()` statements. **Ask which of the three phases broke.**
> You will find nearly every DP bug you ever write in under a minute.

Reco tests it immediately. He writes Fibonacci with `dp[1] = 0`, gets garbage,
and — without running anything — says *"Initialization."* He is right.

---

## What You Gain, What You Lose

```
BOTTOM-UP WINS
  [+] No recursion → no stack limit. fib(1_000_000) is fine.
  [+] No function-call overhead → measurably faster, same complexity.
  [+] An ARRAY, not a dict → and an array can be ROLLED into two variables.
      (That is Chapter 4, and you cannot do it to a notebook.)
  [+] The Lens applies → you can prove it.

BOTTOM-UP LOSES
  [-] You must work out the fill ORDER yourself. Recursion did that for free.
  [-] It computes EVERY state, even ones the answer never needs.
      Top-down is lazy; bottom-up is thorough.
  [-] Irregular state spaces (trees, bitmasks, strings) are awkward to
      enumerate in order. Sometimes top-down is simply the right tool.
```

> **Neither is "better."** Top-down when the state space is weird or sparse.
> Bottom-up when you want speed, or you're about to optimize space.
> You will write both for the same problem in the next challenge, and the
> transition line will be identical in each.

---

## Tabby's Rule of Thumb

> "Write it top-down first — recursion tells you the truth about your
> recurrence. Then flip it. If you can't work out the fill order, you didn't
> understand your own transition."

```
1. Plain recursion   (Ch 1)  → reveals the five slots
2. Add a memo        (Ch 2)  → kills the exponential
3. Flip to bottom-up (Ch 3)  → kills the stack, enables the Lens
4. Roll the array    (Ch 4)  → kills the memory
```

Four steps. The same problem. The same five slots, every time.

---

## Cliffhanger

Reco fills his table and beams. `fib(1000000)` — no crash, no stack, instant.

Tabby then points at the table. A million chalked squares stretch across the
floor of the hall.

> "How many of those squares did you actually **need** at the end?"

Reco looks. To compute square 1,000,000 he used 999,999 and 999,998. To
compute those he used the two before them. At any moment he was looking at
exactly **two** squares.

He had chalked a million. He had ever *needed* two.

> "You built a monument," Tabby says, "to store a pair of numbers."

She picks up a cloth and starts wiping the table clean behind him as he walks.

Next: **Chapter 4 — Space-Optimized.** Throw away the table. Keep two numbers.
And learn the one question that decides whether you're allowed to.

> Continue to `02 - worked example.md`.


</details>
