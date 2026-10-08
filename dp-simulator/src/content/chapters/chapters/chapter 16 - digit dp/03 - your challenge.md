# Chapter 16 · 03 — Your Challenges

Rules: five slots in order, before any code. And for **every** problem here,
answer these two before writing a transition:

```
1. What is the smallest thing I must CARRY for the rule to be checkable?
2. Does a LEADING ZERO change the answer?   (yes → you need `started`)
```

**Standing rule for this chapter: write the brute force first.** It is four
lines, it works to `10⁵`, and it is the only thing that will catch a flag bug.

---

## 1. (easy) The two flags, in English

`N = 1234`.

- Write, in plain English, what `tight = True` means at `pos = 2`.
- Give the full door list at `pos = 0`, then at `pos = 1` **given** the digit
  written at `pos 0` was `1`, then at `pos 1` given it was `0`.
- Finish this line and justify each half: `tight_next = ______`.
- Why can `tight` never go from `False` back to `True`? One sentence, and it
  must be about prefixes, not about code.

---

## 2. (easy) Base-case derivation

- What does `go(pos, ...)` return when `pos == n`? **Derive it from the state
  sentence** — do not say "because it worked".
- Why is it not `0`? Name the habit from the previous eleven chapters that will
  make you type `0`.
- Now the variant: if the question had said *"how many **positive** integers
  ≤ N"*, what must the base become, and why?
- Which earlier chapter had a base case of `1` for exactly this reason?

> Base cases are your #1 weak point. This chapter's base flips from `0` to `1`
> purely because the problem changed from optimising to counting.

---

## 3. (medium) Hand-trace the whole tree

`N = 21`, counting numbers with no two adjacent equal digits. Expected: `21`.

Draw the full recursion tree by hand. At every node label `(pos, prev, tight,
started)` and the value returned.

Then answer:
- Which branch stayed `tight`, and how many such branches are there per level?
- In the `d = 0` branch, the adjacency check is skipped. Why, and which number
  would you lose if it weren't?
- `go(1, 0, False, False)` returned `10`. For an 18-digit bound, roughly how
  many different prefixes would reach that same memo key? What is that fact
  called, and why does it make this algorithm fast?

---

## 4. (medium) Implement it, then prove it

Write `count_no_adjacent_equal(N)`. Verify:

```
21 -> 21      99 -> 91      100 -> 91      1234 -> 923
9  -> 10      0  -> 1       -5  -> 0
```

Then write the brute force and assert agreement for **every** `N` in
`range(0, 3000)`.

Now explain the pair `99 → 91` and `100 → 91`: adding the number `100` changed
nothing. Why? What does it tell you if your code returns `92` for `100`?

---

## 5. (medium) TRAP — kill each flag in turn

Take your working solution and break it three ways. For each, report the output
on `N = 1234` **and** the smallest `N` where it first diverges from brute force.

- **(a)** Delete `started` entirely (treat every position as a real digit).
- **(b)** Replace `hi = digits[pos] if tight else 9` with `hi = digits[pos]`.
- **(c)** Replace it with `hi = 9`.

For each: is the result too big or too small, and *why does that direction
follow from the bug*? Name the Invariant Lens phase each one breaks.

---

## 6. (medium) TRAP — the memo key

Remove `tight` from the `lru_cache` key (e.g. by hoisting it into a closure
variable instead of a parameter).

- Does it still give the right answer for one-digit `N`? For `N = 21`?
  For `N = 1234`?
- Explain the corruption in one sentence using the words **capped suffix** and
  **free suffix**.
- Counter-argument to consider: there is only **one** `tight` path per level, so
  those states are never reused. Given that, is caching them wasteful? Answer
  yes/no and say what removing them from the *key* costs.

---

## 7. (medium) TERMINATION and range queries

- Where does the answer live in this chapter? It is not a cell.
- List all six termination shapes you now know (Ch 5/8/12/13, Ch 6/10, Ch 11,
  Ch 14, Ch 15, Ch 16), one line each.
- Write `count_in_range(L, R)`. Verify: `(10,20) → 10`, `(0,1234) → 923`,
  `(11,11) → 0`, `(12,12) → 1`.
- Why `f(L-1)` and not `f(L)`? And what breaks if `L = 0`?
- Why should you **never** write a digit DP that carries both a lower and an
  upper bound? Two sentences.

---

## 8. (medium) Same walk, nothing carried

Count integers in `[0, N]` containing **no digit `4`**.

- What must you carry beyond `pos` and `tight`? Justify the answer "nothing".
- Do you need `started`? Answer from the rule, not from testing.
- Implement and verify against brute force:
  `4 → 4`, `10 → 10`, `100 → 82`, `1000 → 730`.

---

## 9. (hard) Three new accumulators

Each of these is the same walk with a different thing carried. For each: write
the state sentence, derive the base case, say whether `started` is needed, and
implement + verify.

**(a) Digit sum equals `S`.**
`(N=100, S=5) → 6`, `(N=1000, S=10) → 63`, `(N=20, S=2) → 3`.
> Extra credit: add one line that prunes a branch the instant it can no longer
> succeed. Which condition, and why is it safe?

**(b) Divisible by `K`.**
`(N=100, K=7) → 15`, `(N=1000, K=13) → 77`, `(N=50, K=5) → 11`.
> What exactly do you carry? Write the update expression for the running value
> and explain why you must reduce it modulo `K` *every step* rather than at the
> end.

**(c) Digits non-decreasing.**
`100 → 55`, `1234 → 275`, `20 → 19`.
> Is `started` needed here? Derive the answer — then test it, because the
> derivation is genuinely non-obvious.

For **(b)**, also state how the state count grows with `K`, and at what value of
`K` this approach stops being cheap.

---

## 10. (hard) A different base case, a new door

**Numbers At Most N Given a Digit Set.** Allowed digits `{1,3,5,7}`, `N = 100`.
Count the **positive** integers ≤ N writable using only those digits.
(Expected: `20`.)

- Why is the base case `1 if started else 0` here, when the main example used a
  plain `1`? Answer from the *question*, not the pattern.
- A 2-digit number must be counted inside a 3-digit walk. What extra door makes
  that possible, and why must it force `tight = False`?
- Why did the main example not need that door?
- Implement and verify: `({1,3,5,7}, 100) → 20`,
  `({1,4,9}, 1000000000) → 29523`, `({7}, 8) → 1`.

---

## 11. (hard) The accumulator that IS the answer

**Count the digit `1`** in all numbers from `0` to `n`.
`13 → 6`, `0 → 0`, `100 → 21`, `999 → 300`, `1234 → 689`.

- Write the state sentence. It does **not** measure "how many numbers".
- What does the base case return, and why is it not `1`?
- Is `started` needed? Justify.
- Implement and verify.
- Then answer the design question: why is `cnt` part of the memo key here, and
  what would go wrong if you tried to "optimise" it out? What is the honest
  alternative state that avoids carrying it? *(Hint: count contributions
  per-position instead of per-number.)*

---

## 12. (hard) Read the question, pick the carry

For each, name **only** the middle column — what you carry beyond `pos` and
`tight` — and say yes/no on `started`. Do not implement them.

```
(a) numbers ≤ N whose digits are strictly increasing
(b) numbers ≤ N using at most 3 distinct digits
(c) numbers ≤ N that are palindromes
(d) numbers ≤ N with an even number of even digits
(e) numbers ≤ N that contain the substring "13"
(f) numbers ≤ N whose digit product is a perfect square
```

Then finish: *"The only design decision in a digit DP is ______, because
everything else is ______."*

---

## After You Answer

I will diagnose, in this priority order:

1. **Base cases** — `1` not `0`, and can you state when it becomes
   `1 if started else 0`? Did you derive it from the question or copy it?
   *(known weak point #1)*
2. **Termination** — the root call, plus `f(R) - f(L-1)` for ranges. Can you
   recite all six termination shapes? *(known weak point #2)*
3. **The two flags** — can you derive `tight_next` cold, and state precisely
   when `started` is required versus dead weight?
4. **Choose vs combine** — is it a `+`? Counting sums the doors. If I see a
   `max` in a counting DP we stop and go back to Chapter 5.
5. **The carry** — is your state the *smallest* thing the rule needs? Carrying
   too much is the only way to make this family slow.
6. **Verification discipline** — did you write the brute force, and did you
   print the first diverging `N` when it failed?

Then we drill whichever bled most, and the doors of the black-and-white hall
open.
