# Chapter 10 · 01 — Story: Lissa, the Chainbuilder

> Family: **Ordered chain / Longest Increasing Subsequence.**
> Sacky's sack didn't care about order. Lissa cares about *nothing else*.
> And for the first time, your fulcrum will not hand you two doors — it will
> hand you **a loop**.

---

## The Bench of Links

Reco walks out of the merchant's camp with a full sack and finds a forge. A
smith's daughter has iron links laid out along a bench in a fixed row:

```
index:   0    1    2    3    4    5    6     7
link:   10    9    2    5    3    7   101    18
```

**Lissa, the Chainbuilder**, doesn't look up.

> "Build me a chain. Walk the bench **left to right**, once. Skip as many links
> as you like — but you may never go back.
>
> Every link you add must be **strictly longer** than the one before it.
> Give me the **longest chain** you can make."

Reco reaches for `101` — the biggest link. Lissa slaps his hand.

> "Big is not long. I asked for **length**, not size."

The answer is `2 → 3 → 7 → 18`: **four links**. The largest link, `101`, is in
no optimal chain that also contains `18`. Sound familiar? Sacky told you the
same thing about relic D one chapter ago.

---

## Subsequence vs Substring — say it once, correctly

```
SUBSEQUENCE   keep order, skipping allowed      [10, 2, 7]   ✓ from the bench
SUBSTRING /
CONTIGUOUS    keep order, NO skipping           [2, 5, 3]    ✓
              [2, 7] is NOT contiguous          [2, 7]       ✗
```

> Chapter 6 (Kade) was **contiguous** — the run could not skip.
> Chapter 7 (the Twin Scribes) was **subsequence** — skipping allowed.
> Lissa is subsequence too. Read the noun in the problem title before you write
> a single slot; it decides the whole shape.

---

## The Fulcrum: the doors become a loop

Chapter 8 gave you two doors (from above, from the left). Chapter 9 gave you
two doors (take, leave). Lissa's fulcrum looks identical in form:

> ### "My chain ends at link `i`. Which link came just BEFORE it?"

But now answer it honestly. Which links *could* have come before link `i`?

```
ANY link j, as long as:
     j < i            it is to the LEFT on the bench (order)
     nums[j] < nums[i]  it is strictly shorter        (the chain rule)

...and also: NONE of them. Link i may be the very first link in the chain.
```

That is not two doors. That is **up to `i` doors, decided by the data**.

```
Ch 8   doors fixed by GEOMETRY     2 doors     → one line of code
Ch 9   doors fixed by the RULE     2 doors     → one line of code
Ch 10  doors decided by the DATA   0…i doors   → a LOOP
```

> **The line from Chapter 0, now earned:**
> *"The fulcrum is never a line of code. It is a QUESTION. Its ANSWER is a list
> of doors. Few fixed doors → one line. Many data-driven doors → a loop."*
>
> You have been reading that sentence for ten chapters. This is the chapter
> where the second half finally happens. The inner `for j in range(i)` **is**
> the fulcrum — it is not bookkeeping, it is the door list being enumerated.

---

## The State — and why "ending exactly at `i`" is forced

Reco's first attempt:

> `dp[i]` = "the longest chain I can build using the first `i` links."

Lissa tears it up.

> "Then tell me: can I attach link `i` to that chain?"

Reco can't answer. That state knows the *length* of the best chain but not what
its **last link** is — and the whole rule is about the last link. The state has
thrown away the one fact the transition needs.

> `dp[i]` = **the length of the longest increasing chain that ENDS EXACTLY at
> link `i`** (and therefore includes link `i`).

Now the transition can attach: `nums[i]` is the last link of `dp[i]`'s chain by
definition, so `nums[j] < nums[i]` is a question you can actually ask.

```
Ch 6  Kade   "best run ENDING EXACTLY at i"
Ch 8  Grid   "cheapest cost to ARRIVE AT (r,c)"
Ch 10 Lissa  "longest chain ENDING EXACTLY at i"
```

> **A state that cannot answer the transition's question is the wrong state.**
> Pin the endpoint down. Three chapters have now taught this; it is the single
> most reusable habit in the book.

---

## The Base Case — derive it, and watch it change shape

`dp[i]` = "longest chain ending exactly at `i`."

What if **no** earlier link qualifies — link `i` is shorter than everything to
its left? Then the chain is link `i`, alone.

> **`dp[i] = 1` for every `i`.** Not `0`.

A chain of one link is still a chain. `0` would mean *"there is no chain ending
at `i`"* — but there always is, trivially.

```
Sixth chapter of base cases, all derived, none the same:
  Ch 5  dp[0] = 0             zero coins make amount 0
  Ch 6  dp[0] = nums[0]       a run must contain its own first element
  Ch 7  row/col of 0s         an empty string shares nothing
  Ch 8  dp[0][0] = grid[0][0] you stand on the start tile
  Ch 9  dp[0][*] = 0          no relics chosen → no value
  Ch 10 dp[*] = 1             every link is a chain of length one
```

Note what's different this time: the base isn't one cell at the edge — it is
**every cell**, initialised before the loop runs. That's because *"no valid
predecessor"* can happen at any index, not just index 0.

---

## Termination — and this is the one you get wrong

> ### `max(dp)` — **not** `dp[-1]`.

Ask the state sentence: `dp[7] = 4` means *"the longest chain that ends at link
`18`."* But Lissa never said the chain has to end on the **last** link of the
bench. It may end anywhere. So you must **survey** the whole array.

```
Ch 5  dp[amount]       endpoint MANDATORY — the problem names it
Ch 8  dp[R-1][C-1]     endpoint MANDATORY — the problem names it
Ch 9  dp[n][W]         endpoint MANDATORY — all items, full capacity
Ch 6  max(dp)          endpoint FREE — a run may end anywhere
Ch 10 max(dp)          endpoint FREE — a chain may end anywhere
```

> **The test, every single time:** *"Does the problem force my answer to end at
> a specific place?"* Forced → read that cell. Free → survey with `max`.
>
> This is on your weak-point list, and you have just come off three consecutive
> chapters that all ended at a named cell. Your fingers will type `dp[-1]`.
> Catch them.

Concretely, on the bench: `dp = [1, 1, 1, 2, 2, 3, 4, 4]`.
`dp[-1] = 4` — **correct by accident.** Now delete the last link:

```
nums = [10, 9, 2, 5, 3, 7, 101]     dp = [1, 1, 1, 2, 2, 3, 4]    dp[-1] = 4  ✓ lucky again
nums = [10, 9, 2, 5, 3, 7, 101, 1]  dp = [1, 1, 1, 2, 2, 3, 4, 1] dp[-1] = 1  ✗ WRONG
```

One trailing small number and the lucky coincidence collapses. That is why
"it passed my test" is not a proof.

---

## TRAP — one character changes the problem

```python
if nums[j] < nums[i]:    # STRICTLY increasing   [2,2,3] → 2
if nums[j] <= nums[i]:   # NON-DECREASING        [2,2,3] → 3
```

Lissa said *"strictly longer."* Use `<`. But read every problem's wording:
*"increasing"* almost always means strict; *"non-decreasing"* / *"no smaller
than"* means `<=`. One character, two different answers, no error message.

> Same disease as Chapter 9's loop direction: the program runs fine and answers
> a question you weren't asked.

---

## Cliffhanger

Lissa's rule looked only at the **last link's value**. But as Reco leaves the
forge, a figure in a shifting mask blocks the road, holding three cards face
down:

> "Today you may BUY. Tomorrow you may SELL. The day after you may do neither —
> you must rest. What you are *allowed* to do depends on what you *just did*.
>
> Your position on the road is no longer enough to describe you."

Next: **Modus the Mask-Wearer**, and the day `dp[i]` stopped being one number
and became *one number per mode you could be wearing*.

> Continue to `02 - worked example.md`.
