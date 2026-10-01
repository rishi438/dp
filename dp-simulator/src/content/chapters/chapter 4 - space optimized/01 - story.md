# Chapter 4 · 01 — Story: The Cloth (Space-Optimized DP)

> Tabby chalked a million squares to store two numbers. This chapter is about
> the cloth she used to wipe them away — and the one question that tells you
> whether you're allowed to.

---

## The Monument

Reco stands in the great hall, proud. A million chalked squares stretch from
wall to wall. `fib(1000000)`, computed, no stack, no crash.

Tabby walks the length of it, unimpressed.

> "Square 1,000,000. Which squares did you read to write it?"

"999,999 and 999,998."

> "And to write *those*?"

"The two before them..."

> "So at any single moment — how many squares were you **looking at**?"

Reco goes quiet. **Two.**

> "You built a monument," Tabby says, picking up a cloth, "to hold a pair of
> numbers. Everything behind your hand was already dead the moment you walked
> past it."

She starts wiping the table clean, one step behind him as he works.

```
┌───┬───┬───┬───┬───┬───┐
│ ▓ │ ▓ │ ▓ │ 3 │ 5 │ ? │   ▓ = wiped. Never needed again.
└───┴───┴───┴───┴───┴───┘
              └──┬──┘
            the only live cells
```

---

## The Window

Look at the transition and nothing else:

```python
dp[i] = dp[i-1] + dp[i-2]
```

Every cell this reads is within **2 of `i`**. That distance has a name:

> ### The WINDOW — how far back the transition reaches.

```
dp[i] = dp[i-1] + dp[i-2]          window = 2   → keep 2 variables
dp[i] = dp[i-1] + nums[i]          window = 1   → keep 1 variable
dp[i] = max over ALL j < i         window = i   → keep EVERYTHING. No reduction.
dp[i][j] reads row i-1 only        window = 1 row → keep 2 rows
dp[i][j] reads rows i-1 and i-2    window = 2 rows → keep 3 rows
```

> **The Space-Optimization Question:**
> ### *"How far back does my transition reach?"*
> Whatever that distance is, that's all you keep. The rest is a monument.

This is the entire chapter. Everything below is consequences.

---

## Fibonacci, Wiped

```python
# BEFORE — O(n) space              # AFTER — O(1) space
dp = [0] * (n + 1)                 a, b = 1, 1        # a = dp[i-2], b = dp[i-1]
dp[1] = dp[2] = 1                  for _ in range(3, n + 1):
for i in range(3, n + 1):              a, b = b, a + b
    dp[i] = dp[i-1] + dp[i-2]      return b
return dp[n]
```

```
Time:   O(n)   →  O(n)     unchanged. You didn't get faster.
Space:  O(n)   →  O(1)     a million squares became two numbers.
```

> **Space optimization never changes the time complexity.** It is purely about
> memory. Do not confuse the two — that's a common interview stumble.

The naming discipline that keeps you sane:

```python
a, b = 1, 1     # a IS dp[i-2].  b IS dp[i-1].
a, b = b, a + b # shift the window one step right
```

Write those comments. Every time. The moment you forget which variable is
which `dp` cell, you've lost the thread — and unlike an array, **a wrong
variable won't crash, it'll just lie.**

---

## The Two Things That Can Kill You

### Killer 1 — Overwriting a cell you still need

In an array, `dp[i-1]` and `dp[i]` are different boxes. In rolled variables,
**they might be the same box.** Assign in the wrong order and you read the new
value where you needed the old one.

```python
# ✗ WRONG                          # ✓ RIGHT
b = a + b                          a, b = b, a + b
a = b        # a now holds the     # simultaneous: both right-hand sides are
             # NEW b. Ruined.      # evaluated BEFORE either assignment
```

Python's tuple assignment saves you here — the whole right side is evaluated
first. In Rust or C you'd need an explicit `temp`. **Know why it works; don't
just copy the idiom.**

### Killer 2 — Loop direction in a rolled 1D array

This is the big one, and it is waiting for you in Chapter 9.

When a 2D `dp[i][cap]` is rolled into a single `dp[cap]`, the array now holds
**two generations at once**: cells you've already overwritten are "row `i`",
cells you haven't are still "row `i-1`". Which one you read depends entirely
on **loop direction.**

```python
# 0/1 Knapsack, rolled to 1D — each item used AT MOST ONCE
for cap in range(C, w-1, -1):      # ← BACKWARD
    dp[cap] = max(dp[cap], dp[cap-w] + v)
    #                      └────┬────┘
    #        going backward, dp[cap-w] is NOT yet overwritten,
    #        so it still belongs to row i-1 = "without this item" ✓

# Change it to forward and you get a DIFFERENT PROBLEM:
for cap in range(w, C + 1):        # ← FORWARD
    dp[cap] = max(dp[cap], dp[cap-w] + v)
    #                      └────┬────┘
    #        going forward, dp[cap-w] WAS already overwritten this round,
    #        so it may already include this item → the item gets reused
    #        → this now solves UNBOUNDED knapsack ✗
```

> **Read that twice.** One character (`-1` in the range) changes which problem
> you are solving. No crash. No warning. A perfectly plausible wrong number.
>
> This is **TRAP 7** in `../pattern.md`, and it is the single most expensive
> mistake in space-optimized DP.

---

## The Lens Still Protects You

Chapter 3's Invariant Lens doesn't retire — it gets **sharper**, because now
Maintenance has to say *which generation* each variable belongs to:

| Loop-invariant phase | DP name       | What it must now prove                                        |
|----------------------|---------------|----------------------------------------------------------------|
| **Initialization**   | Base Case     | The starting truth — now seeded into *variables*, not cells.    |
| **Maintenance**      | Transition    | One step preserves correctness **AND** every variable I read still holds the generation I think it does. |
| **Termination**      | State (final) | The loop ends → the answer is in a *named variable*. Which one? |

> Termination gets genuinely harder here. With an array you could return
> `max(dp)` at the end. **You can't `max()` a table you erased.** If your
> termination is a survey, you must survey *as you go* — a second, separate
> variable. That's exactly Kadane's `best_ever` in Chapter 6, and merging it
> with `best_here` is the classic bug.

---

## When You Are NOT Allowed To Do This

Space optimization has a real price. Be honest about it:

```
[-] You LOSE reconstruction.
    The table was the breadcrumb trail. Erase it and you can report the
    best VALUE but never the actual path / subsequence / item list.
    Need the answer itself, not just its score? Keep the table.

[-] Some transitions reach ARBITRARILY far back:
        LIS:  dp[i] = 1 + max(dp[j] for all j < i)      window = i
    There is nothing to roll. O(n) space is the floor.
    (Ch 10 gets O(n log n) TIME by a different trick — not by rolling.)

[-] Top-down CANNOT be rolled.
    A notebook is accessed in an unpredictable order, so nothing is
    provably dead. You must flip to bottom-up first.
    → Ch 2 → Ch 3 → Ch 4 is a required sequence, not a suggestion.

[-] It costs readability. dp[i-2] is self-documenting; `a` is not.
    Optimize when the constraints demand it, not reflexively.
```

---

## The Full Ladder, Complete

You now have every approach. One problem, four forms:

```
Ch 1  PLAIN RECURSION    O(2ⁿ) time, O(n) stack    reveals the five slots
Ch 2  + MEMO (top-down)  O(n)   time, O(n) memo    kills the repeated work
Ch 3  BOTTOM-UP          O(n)   time, O(n) array   kills the stack, enables the Lens
Ch 4  ROLLED             O(n)   time, O(1) space   kills the memory
```

> **The five slots were identical in all four.** Fulcrum, state, transition,
> base, termination — never moved. You have been writing the *same solution*
> in four costumes.
>
> That is the entire APPROACH axis, finished. From here on, the approach is a
> tool you already own, and every new chapter is about a new **PATTERN**.

---

## Cliffhanger

Reco has mastered the approach. He can take any recurrence and carry it four
ways. He is, technically, unbeatable.

Then the King hands him a scroll, and he reads it, and he cannot write a
single line.

> "A merchant is owed eleven gold. Our mint stamps coins of one, two and five.
> Pay him with the fewest coins."

Reco reaches for his reflex — *"what was my last move?"* — and freezes.
On the staircase, the answer was always *"I hopped 1 or 2."* Two doors, known
before he started.

Here? The doors are `1`, `2`, and `5`. Tomorrow they might be `3, 7, 11, 42`.
**He does not know the doors until the problem hands them to him.**

> "You know *how* to build the table now," says Tabby, walking away.
> "You have no idea *what to put in it*."

Next: **Chapter 5 — Corin the Coinsmith**, and the beginning of the second
half of the book: the fifteen **patterns**.

> Continue to `02 - worked example.md`.
