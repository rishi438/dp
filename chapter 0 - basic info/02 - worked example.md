# Chapter 0 · 02 — Worked Example: Cracking a Problem With the Five Slots

> I solve ONE problem completely, out loud, so you see the THINKING — not just
> the answer. This is your template for every challenge that follows.

---

## The Problem

> A frog starts at step 1. It can hop 1 or 2 steps at a time.
> How many distinct ways can it reach step `n`?

I will NOT jump to code. I will walk the **five slots** in order.

---

## Slot 0 — FULCRUM

> "What was the LAST move that landed the frog on step `n`?"

Only two possibilities exist:
- It hopped **1 step**, so it was on step `n-1` just before.
- It hopped **2 steps**, so it was on step `n-2` just before.

There is no third option (it can't hop 3). **Two doors.**

Because the hop sizes are fixed and known while I'm writing the code, those
two doors become **one line**, not a loop. (In Chapter 5 the doors come from a
data array and the same fulcrum becomes a `for` loop instead.)

That one question just handed me the transition. Now I formalize.

---

## Slots 1–3 — STATE, TRANSITION, BASE CASE

**1. STATE (in plain English first, always):**
> `dp[i]` = the number of distinct ways to reach step `i`.

**2. TRANSITION (trust the genie):**
> `dp[i] = dp[i-1] + dp[i-2]`
> (ways ending in a 1-hop) + (ways ending in a 2-hop)

Why `+` and not `max`? The question says **"how many ways"** — that's
*counting*, so I **sum all the doors**. If it had said "fewest hops" I'd be
*optimizing*, and I'd **pick one door** with `min`.

> **Counting sums the doors. Optimizing picks one door.**

And no double-counting: a route ending in a 1-hop is never the same route as
one ending in a 2-hop, because the final move differs. The two buckets are
disjoint, so adding them is safe.

**3. BASE CASE (smallest answers I just KNOW):**
> `dp[1] = 1`  → one way: a single 1-hop
> `dp[2] = 2`  → two ways: (1 then 1) or (one 2-hop)

I **derived** these by asking "how many ways to reach step 1?" — not by
copying them from another problem. Do this every single time.

---

## Slot 4 — TERMINATION

> Where does the answer live when the work is done?

`dp[n]`. The frog must land on step `n` exactly — the problem names the
destination. So I read that one cell.

**Not** `max(dp)`. There's no freedom about where the journey ends here.
(Chapter 6 shows a problem where the answer *can* end anywhere, and there
`max(dp)` is correct and `dp[n]` is the bug. Read the problem, every time.)

---

## Verify by Hand (small numbers build trust)

```
dp[1] = 1
dp[2] = 2
dp[3] = dp[2] + dp[1] = 2 + 1 = 3
dp[4] = dp[3] + dp[2] = 3 + 2 = 5
```

Let me confirm `dp[4] = 5` by listing real paths to step 4:
```
1,1,1,1
2,1,1
1,2,1
1,1,2
2,2
```
Five paths. ✓ The formula is trustworthy.

---

## Only NOW, the Code

```python
def frog_ways(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)              # STATE: dp[i] = ways to reach step i
    dp[1] = 1                       # BASE: one way to reach step 1
    dp[2] = 2                       # BASE: two ways to reach step 2
    for i in range(3, n + 1):
        dp[i] = dp[i-1] + dp[i-2]   # FULCRUM -> TRANSITION: the two possible last hops
    return dp[n]                    # TERMINATION: the frog must land on n exactly

print(frog_ways(4))   # 5
print(frog_ways(5))   # 8
```

---

## The Takeaway (the method you will REUSE)

```
0. FULCRUM      "what was the LAST move?"         → gives you the doors
1. STATE        write dp[i] in PLAIN ENGLISH      → what a door leads to
2. TRANSITION   combine smaller dp's (genie)      → sum? or pick the best?
3. BASE CASE    smallest known answers, DERIVED   → never copied
4. TERMINATION  WHERE does the answer live?       → dp[n], max(dp), a corner?

   then: verify by hand on small numbers   → build trust
   then: write the code                    → last, not first
```

Notice: I wrote English before I wrote Python. The code was the EASY part.
The thinking was the real work. That's the whole game.

---

> Now it's your turn. Open `03 - your challenge.md`.
> Same method. I watch how you apply it, and I find where you wobble.
