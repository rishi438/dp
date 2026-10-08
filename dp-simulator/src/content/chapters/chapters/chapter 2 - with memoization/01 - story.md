# Chapter 2 · 01 — Story: The Wizard and the Magic Notebook

> The cure arrives. Chapter 1 left Reco drowning in 40 billion calls.
> This chapter kills the villain with **one dictionary.**

---

## Where We Left Reco

Reco was correct and dying. `fib(50)` would take him longer than a human
lifetime, and the reason was never his logic — it was his **amnesia**:

```
fib(3) computed 2×
fib(2) computed 3×
...
fib(2) computed over a BILLION times for fib(50)
```

He re-solved problems he had *already solved*, because the instant he found an
answer, he forgot it.

---

## The Wizard's Gift

An old wizard finds Reco collapsed at the foot of the staircase and hands him
a small leather book.

> "It is not a spell. It is a **notebook**.
> Before you solve anything, **look it up**. If it's written down, read it and
> walk away. If it isn't, solve it once — then **write it down before you
> return it.**"

Reco stares. *"That's it? That's the whole magic?"*

> "That's the whole magic. You were never slow because the problem was hard.
> You were slow because you had no memory. **Dynamic Programming is
> recursion plus memory.** Nothing more."

---

## The Two Commandments of the Notebook

Every memoized function ever written obeys exactly these two lines:

```
1. LOOK BEFORE YOU LEAP    →  if the answer is already in the book, return it
2. WRITE BEFORE YOU LEAVE  →  after computing, store it before returning
```

Forget commandment 1 → you gain nothing; you still recompute everything.
Forget commandment 2 → the book stays empty; you still recompute everything.

**Both, or neither.** There is no half-memoization.

---

## Watch the Monster Die

Before the notebook, `fib(5)`:

```
                      fib(5)
                 /             \
            fib(4)              fib(3)          ← fib(3) computed again
           /      \            /      \
      fib(3)     fib(2)    fib(2)    fib(1)     ← fib(2) computed again
     /     \
 fib(2)   fib(1)                                ← and again
```

After the notebook:

```
                      fib(5)
                 /             \
            fib(4)            [fib(3)]          ← CACHE HIT. Instant. No subtree.
           /      \
      fib(3)     [fib(2)]                       ← CACHE HIT
     /     \
 fib(2)   fib(1)
```

> **The whole right-hand side of the tree evaporates.** Every subtree that
> would have been recomputed becomes a single dictionary lookup.

The arithmetic of the cure:

```
                    calls before        calls after
fib(10)                 ~177                 10
fib(30)              ~2.7 million            30
fib(50)              ~40 BILLION             50
```

`O(2ⁿ)` → `O(n)`. Not a better constant. A **different universe.**

---

## Why Exactly O(n)? (the counting argument)

This is the argument that makes memoization click permanently:

> **Each distinct state is computed exactly once. Every other visit is a
> lookup.**

So the total work is:

```
TIME = (number of distinct states) × (cost of one transition)
```

For Fibonacci: `n` states × `O(1)` work each = **O(n)**.

That formula is not Fibonacci-specific — it is *the* complexity formula for
every memoized DP in this book. Chapter 15's bitmask DP will have `2ⁿ · n`
states; Chapter 12's interval DP will have `n²` states with `O(n)` transitions,
giving `O(n³)`. Learn the formula here, on the easy case.

> **Count your states. Multiply by the cost of one transition. That's your
> complexity.** You now never have to guess again.

---

## Top-Down: The Direction, Not a Pattern

Memoization is called **top-down** because you start at the *answer you want*
(`fib(n)`) and recurse *downward* toward the base cases.

```
TOP-DOWN (Ch 2)    start at fib(n), fall down to fib(1)     "pull"
BOTTOM-UP (Ch 3)   start at fib(1), build up to fib(n)      "push"
```

> **Critical clarification — one you asked about before:**
> Top-down is **NOT a pattern.** It is a *direction*.
> The PATTERN (state + transition) changes per problem — that's Chapters 5-18.
> The APPROACH (top-down vs bottom-up) is a fixed pair that applies to
> *every* pattern.
>
> Same transition line. Different scaffolding around it.

You will solve Coin Change both ways. The line `dp[x] = min(dp[x], dp[x-c]+1)`
will be *identical*. Only the plumbing differs.

---

## The Blueprint Was Always There

Here is the part that makes Chapter 1 worth the pain. Plain recursion already
handed you the DP structure for free:

```python
def fib(n):
    if n <= 2:          # ← BASE CASE, already written
        return 1
    return fib(n-1) + fib(n-2)   # ← TRANSITION, already written
                        # ← and `n` itself is the STATE
```

**Check all five slots against the memoized version — every one is unchanged:**

```
                    Chapter 1 (plain)          Chapter 2 (memoized)
0. FULCRUM          fib(n-1), fib(n-2)         fib(n-1), fib(n-2)     SAME
1. STATE            the argument n             the argument n         SAME
2. TRANSITION       return a + b               return a + b           SAME
3. BASE CASE        if n <= 2: return 1        if n <= 2: return 1    SAME
4. TERMINATION      the top-level call         the top-level call     SAME
                    ─────────────────────────────────────────────────
                    the ONLY difference:  a dictionary + two lines
```

Memoization **adds nothing to your thinking.** It adds a dictionary.

> Say it once more, because it is the spine of Chapters 2, 3 and 4:
> **the five slots are the problem; top-down / bottom-up / rolled are just
> three ways to carry them.** When Chapter 3 looks unfamiliar, come back and
> reread this table.

> **The golden workflow, and it never changes:**
> ```
> 1. Write the plain recursion   → it REVEALS state, transition, base case
> 2. Add a memo                  → it becomes O(states)
> 3. (Ch 3) Flip to bottom-up    → it loses the recursion overhead
> 4. (Ch 4) Roll the array       → it loses the memory
> ```
> Masters start at step 1. They just don't *stop* there.

---

## The Notebook's Two Hidden Rules

**Rule A — the key must be the COMPLETE state.**

If your function takes three arguments and your key uses only two, you will
return a cached answer computed under *different* circumstances — silently
wrong, and brutal to debug.

```python
@lru_cache(None)
def go(pos, tight, started):   # the key is (pos, tight, started) — ALL of it
```

> This is TRAP 16 from `../pattern.md`, wearing a different hat: *if two
> different situations share a key but face different futures, your key — your
> state — is under-specified.*

**Rule B — the key must be HASHABLE.**

Lists and dicts cannot be dictionary keys. Use tuples, ints, or frozensets.

```python
go(tuple(remaining))   # ✓
go(remaining)          # ✗ TypeError: unhashable type: 'list'
```

---

## The Price of the Cure

Memoization is not free, and being honest about its cost is what separates
Chapter 2 from Chapter 3:

```
[+] Thinking is natural — you write the recurrence exactly as you say it
[+] Only the states you ACTUALLY need get computed (lazy)
[+] Irregular state spaces are easy (trees, masks, strings)

[-] Recursion depth — Python dies at ~1000 frames (TRAP 14)
[-] Function-call overhead on every single state
[-] Harder to space-optimize; you can't roll a dictionary into two variables
```

> That last one is the cliffhanger. Chapter 4 will throw the entire table away
> and keep **two numbers.** You cannot do that to a notebook. To get there,
> you first have to flip the direction — and that is Chapter 3.

---

## Cliffhanger

Reco is fast now. Smug, even. He solves `fib(100)` instantly and struts.

Then the wizard asks for `fib(5000)`.

```
RecursionError: maximum recursion depth exceeded
```

The notebook was never the problem. **The recursion was.** Five thousand
stacked frames collapse the tower before the first answer is ever written down.

A woman is waiting at the bottom of the staircase with a wide flat table and
no stack at all.

> "Your wizard taught you to fall *down* into the problem," she says.
> "I'm going to teach you to **build up** out of it. My name is **Tabby.**"

Next: **Chapter 3 — Bottom-Up (Tabulation).** No recursion. No stack. No limit.

> Continue to `02 - worked example.md`.
