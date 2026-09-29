# Chapter 18 · 01 — Story: Swift, the Deque Ronin

> Family: **Optimized DP — transition acceleration.**
> Seventeen chapters taught you to get the five slots *right*. This one teaches
> you what to do when they are right and the algorithm is **still too slow**.
>
> This is the last chapter. It does not give you a new state. It gives you a new
> way to read the formula you already wrote.

---

## The End of the Hall

Reco walks the length of Fortuna's black-and-white hall. The swordsman has not
moved. A length of rope is knotted at both ends across his open hands.

**Swift, the Deque Ronin**, speaks before Reco does.

> "Show me your line."

Reco writes it on the floor:

```
dp[i] = nums[i] + max( dp[i-k], dp[i-k+1], …, dp[i-1] )
```

> "And the next one?"

```
dp[i+1] = nums[i+1] + max( dp[i-k+1], …, dp[i-1], dp[i] )
```

Swift lets the rope go slack at one end and pulls it tight at the other.

> ### "You are computing the same maximum twice. It changed by ONE element at each end. Why did you look at all `k` of them again?"

```
dp[i]     looks at  [ i-k     …  i-1 ]
dp[i+1]   looks at  [ i-k+1   …  i   ]
                      ^^^^^^^^^^^^^^
                      k-1 of these are IDENTICAL.

One element left the window.   One element entered.
You re-read k. You should have read 2.
```

> "Your state is correct. Your transition is correct. Your base case is correct.
> Your termination is correct.
>
> **And your solution is wrong**, because `n` is `10⁵` and `k` is `10⁵`, and
> `10¹⁰` operations do not fit inside anything."

---

## The fifth kind of failure

You have learned four ways a DP can be wrong. Here is the fifth, and it is the
only one the Invariant Lens cannot see:

```
Shape right but answer wrong     → INITIALIZATION   (copied base case)
Small n right, large n wrong     → MAINTENANCE      (missing door / bad order)
All cells right, return wrong    → TERMINATION      (read the wrong cell)
Wrong problem entirely           → STATE            (it can't answer the fulcrum)
Every cell right, every answer
  right, and it does not finish  → THE TRANSITION IS TOO EXPENSIVE   ← Chapter 18
```

> **The Lens checks correctness. It says nothing about cost.** That is why this
> chapter exists, and why it comes last: you cannot speed up a transition you do
> not yet trust.

---

## The one formula, read from the other side

Seventeen chapters, one law:

```
TIME  =  (number of distinct states)  ×  (cost of ONE transition)
```

Every chapter so far paid attention to the **left** factor — what to remember,
how few states you can get away with. Chapter 18 attacks the **right** one.

```
Ch 10  LIS              n states × O(n) doors      = O(n²)
Ch 12  Matrix Chain     n² states × O(n) cuts      = O(n³)
Ch 15  TSP              2ⁿn states × O(n) doors    = O(2ⁿn²)
Ch 17  New 21 Game      n states × O(maxPts) sum   = O(n·maxPts)
```

Every one of those right-hand factors is a **loop over doors**. And every one of
those loops is a candidate for acceleration — *if the door list has structure*.

> **The question of this chapter:** *"My transition scans a set of candidates.
> Does that set change slowly enough that I can maintain the answer instead of
> recomputing it?"*

---

## Swift's four ropes

He lays them out in order of how often you will need them.

### Rope 1 — the running sum (a window that ADDS)

```
dp[i] = Σ dp[i-k .. i-1]
```

The window slides by one. Keep the sum in a variable:

```
window += dp[i-1]          what entered
window -= dp[i-1-k]        what left
```

`O(k)` → `O(1)`. **This is Fortuna's unfinished problem**, and it is the
simplest rope he owns.

> Its static cousin is the **prefix sum**: precompute `P[i] = Σ nums[0..i-1]`
> and any range sum is `P[r+1] - P[l]` in `O(1)`. Use the prefix array when the
> ranges jump around; use the rolling variable when the window slides.

---

### Rope 2 — the monotonic deque (a window that takes the MAX)

```
dp[i] = nums[i] + max( dp[i-k .. i-1] )
```

A sum can be undone by subtraction. **A maximum cannot.** Remove the largest
element and you have no idea what the new largest is.

So you keep more than one number — but only the ones that could *ever* win:

> ### "A candidate that is older AND smaller than a newer one is already dead. It will expire sooner and it is worth less. It can never win a future window. Throw it away when it arrives."

```
Keep a deque of indices whose dp-values are STRICTLY DECREASING.

    FRONT ─────────────────────────► BACK
    largest value                    smallest value
    oldest index                     newest index

BACK   when a new index arrives, pop everything ≤ it       (dominated: dead)
FRONT  before reading, pop indices that fell out of range  (expired)
FRONT  is always the maximum of the current window
```

Every index is pushed once and popped once → **amortised `O(1)` per step.**
`O(nk)` → `O(n)`.

> **Why a deque and not a heap?** A heap gives you `O(log n)` and cannot cheaply
> remove an *expired* element from the middle. The deque exploits something a
> heap doesn't know: **the window's left edge only ever moves right.** Expiry is
> always from the front. Structure beats generality.

---

### Rope 3 — binary search (a candidate list that stays SORTED)

Chapter 10's LIS scanned every predecessor: `O(n²)`.

But if you keep `tails[k]` = *the smallest possible tail of an increasing
subsequence of length `k+1`*, that array is **always sorted** — so the scan
becomes a binary search.

```
O(n²) → O(n log n)
```

> **You are no longer computing the same DP.** `tails` is not the old `dp` array
> sped up; it is a *different state* that happens to answer the same question.
> Its cells are not the LIS itself and reconstructing the actual subsequence from
> it requires extra bookkeeping. **Know what you traded away.**

---

### Rope 4 — the monotone argmin *(know it exists; do not assume it)*

Chapter 12's Matrix Chain scanned every cut `k`. For some cost functions you can
**prove** the optimal cut is monotone:

```
opt[l][r-1]  ≤  opt[l][r]  ≤  opt[l+1][r]
```

Then the inner loop only ever scans between two known bounds, and the total work
telescopes: `O(n³)` → `O(n²)`. That is **Knuth's optimisation**. Its relatives
are divide-and-conquer optimisation and the convex hull trick.

> **Swift's warning, and he repeats it twice:** these require a *proof* about
> your cost function (the quadrangle inequality). Assume monotonicity without
> proving it and you get a fast, confident, **wrong** answer. If you cannot prove
> it, do not use it.

---

## What changed?

| Chapters 5–17 (pattern) | Chapter 18 (acceleration) |
|---|---|
| find the right state | the state is **already right** |
| the transition is whatever it is | the transition is the **bottleneck** |
| correctness is the question | **cost** is the question |
| the Lens diagnoses it | the Lens says nothing about it |
| you change the formula | you change **how you evaluate** the formula |

> **The most important sentence in this chapter:**
> **You do not change what `dp[i]` means. You change how you compute it.**
>
> If an "optimisation" changes the state sentence, it is not an optimisation —
> it is a different algorithm, and it must be re-derived from Slot 0. (Rope 3 is
> exactly that case, honestly labelled.)

---

## TRAP 1 — optimising before you are correct

Write the `O(nk)` version **first**. Test it. Keep it.

Then write the fast version and assert they agree on a few hundred random
inputs. The slow version is not wasted work; it is your oracle, and you will
need it, because deque bugs are almost invisible by inspection.

> This is the same discipline as Chapter 16's brute force. **The fast version is
> never the first version.**

---

## TRAP 2 — storing values instead of indices

```python
dq.append(dp[i])       # WRONG -- you can no longer tell when it expires
dq.append(i)           # RIGHT -- the index carries its own expiry date
```

The front must be evicted when `dq[0] < i - k`. That test needs an **index**.
Store values and you cannot ask the question.

---

## TRAP 3 — `<` versus `<=` when popping the back

Both are correct for a sliding-window *maximum*. They differ only in whether
equal values are kept, and the front's value is the same either way. But be
deliberate: in problems where you must also report *which* index won, the choice
decides your witness — Chapter 10 and Chapter 13's lesson, one last time.

---

## TRAP 4 — evicting at the wrong moment

```
1. evict the FRONT while it is out of range     (expired)
2. READ the front  → that is your window max
3. compute dp[i]
4. evict the BACK while it is ≤ dp[i]           (dominated)
5. push i
```

Do step 5 before step 2 and `dp[i]` becomes a candidate for its own transition.
**Order is semantics, not style** — Chapters 4, 9, 11, 13 and 17 all said it, in
five different costumes. This is the sixth.

---

## Swift sheathes the sword

> "There is no new pattern here. There is only this question, asked after you
> already have a correct answer:
>
> ### *My transition scans a set of candidates. Does that set change slowly enough that I can MAINTAIN the answer instead of recomputing it?*
>
> A window that slides by one → maintain a sum, or a deque.
> A candidate list that stays sorted → binary search it.
> An optimum that only moves forward → bound the scan, **if you can prove it.**
>
> And if the answer is no, then `O(n²)` is the honest price and you should stop
> looking for a trick that isn't there."

---

## The End of the Road

Reco turns to leave and finds the hall has no far door — only the road he came
in by, running back through every place he has been.

```
Ch 0   the villain, the Two Laws, the FIVE SLOTS
Ch 1   recursion explodes                     Reco
Ch 2   the notebook                           the Wizard
Ch 3   the table, and the INVARIANT LENS      Tabby
Ch 4   the window                             the Cloth
───────────────────────────────────────────────────────
Ch 5   choosing from a set     Coin Change    Corin the Coinsmith
Ch 6   best contiguous run     Kadane         Kade the Streak-Runner
Ch 7   two sequences           LCS            the Twin Scribes
Ch 8   grid movement           Min Path Sum   Gridlock the Maze Warden
Ch 9   subset / knapsack       0/1 Knapsack   Sacky the Packmaster
Ch 10  ordered chain           LIS            Lissa the Chainbuilder
Ch 11  state machine           Cooldown       Modus the Mask-Wearer
Ch 12  interval split          Matrix Chain   Vale the Splitter
Ch 13  palindromes             LPS            Mirra the Mirror-Twin
Ch 14  tree DP                 Robber III     Root the Elder Tree
Ch 15  bitmask DP              TSP            Maska the Bit-Witch
Ch 16  digit DP                Count ≤ N      Digitus the Ledger Keeper
Ch 17  probability DP          Knight Prob.   Fortuna the Dice-Walker
Ch 18  optimized DP            Jump Game VI   Swift the Deque Ronin
```

**Every one of them asked the same five questions.**

```
0. FULCRUM      What was the LAST decision that landed me here?  → the DOORS
1. STATE        dp[...] = one English sentence
2. TRANSITION   the fulcrum in symbols   (min/max = choose, + = combine)
3. BASE CASE    DERIVE from the state sentence — NEVER copy
4. TERMINATION  WHERE does the answer live?
```

And every one of them was checked the same way:

```
Initialization → Base Case      the truth known without computation
Maintenance    → Transition     one step forward preserves correctness
Termination    → State (final)  the loop ends and the answer is THERE
```

> **The panda is awake.**
>
> Eighteen characters, fourteen different base cases, seven different
> terminations, and not one of them could be copied from the last.
>
> That was the lesson. It was never the formulas.

---

## There is no cliffhanger

Only `03 - your challenge.md`, and then the challenges in Chapters 0 through 17
that you have not answered yet.

> Continue to `02 - worked example.md`.
