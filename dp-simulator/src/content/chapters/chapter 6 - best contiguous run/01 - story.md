# Chapter 6 · 01 — Story: Kade the Streak-Runner

> Family: **Best contiguous run.**
> Corin could pick coins from anywhere in the bag. Kade may never lift his foot.

---

## The Runner Who Cannot Skip

Reco arrives at the Coast Road — one long line of tiles, each stamped with a
number. Some reward you. Some fine you.

```
   3      -1       4       1
[ +3 ] [ -1 ] [ +4 ] [ +1 ]
```

**Kade the Streak-Runner** is stretching at the start.

> "I run the road once, left to right. I choose where to **start** and where
> to **stop** — but between those two points I must touch **every single
> tile.** No skipping. A streak is unbroken or it isn't a streak."
>
> "Find me the start and stop that earn the most gold."

Reco brightens. *"Easy — just take all the positive tiles!"*

Kade: *"Those are not touching. That's Corin's game, not mine."*

> **The word that names this family is `contiguous`.**
> Also spelled: *subarray*, *consecutive*, *unbroken*, *a run*, *a window*,
> *a streak*. When you see any of them, Kade is the character in the room.

---

## The Fulcrum: A Question About Yourself

Reco tries his usual fulcrum — *"what was the last tile?"* — and it says
nothing, because **every** tile is the last tile of some streak.

Kade reframes it, and this reframing is the entire pattern:

> ### "Does the streak ending at ME extend the previous streak — or do I START a new one?"

Exactly **two doors**. Always two, forever, no matter how long the road:

```
  EXTEND:  the best streak ending at i-1, plus my tile   →  dp[i-1] + nums[i]
  RESTART: just me, alone, a brand-new streak            →  nums[i]
```

Take the better one. That's Kadane's algorithm — one of the most famous
algorithms in computing, and it is *one line*.

```python
dp[i] = max(nums[i], dp[i-1] + nums[i])
```

**Why only ever two doors?** Contiguity forbids gaps. A streak ending at `i`
either includes `i-1` or it doesn't. There is no third possibility.

> Compare Corin, whose door count was `len(coins)`. **The shape of the
> constraint decides the number of doors.**

---

## The Hard Part Is the STATE, Not the Transition

Reco writes the obvious state and walks straight into the wall:

> ✗ `dp[i]` = the best streak **anywhere in** `nums[0..i]`

Kade: *"Then tell me how to compute `dp[i]` from `dp[i-1]`."*

Reco can't. If `dp[i-1]` is "the best streak *somewhere* back there," it might
have ended ten tiles ago — and a streak that ended ten tiles ago **cannot be
extended by me.** The state fails to carry the one fact the future needs:
*does it reach my doorstep?*

The state that works pins the run down:

> ✓ `dp[i]` = the best streak **ENDING EXACTLY AT** index `i`

Now `dp[i-1]` is guaranteed to touch me, so I can extend it. The transition
becomes possible *because the state was defined correctly.*

> **This is TRAP 16 in `../pattern.md`, live:** if two different situations map
> to the same state but face different futures, your state is under-specified.

Write this down — it reappears in Chapters 10, 12, and 14:

> **"ENDING AT i" is the magic phrase that makes a run-based state work.**

---

## The Price of That State — and the Famous Mistake

Defining `dp[i]` as *"ending exactly at i"* buys a workable transition. But it
costs you something, and **this is the single most-failed question in DP**:

> The answer is **NOT** `dp[-1]`.

`dp[-1]` is "the best streak ending at the *last tile*." Nothing in the problem
says the winning streak must reach the end of the road.

```
nums  = [ 5,  -100,   2 ]
dp    = [ 5,   -95,   2 ]

dp[-1]  = 2      ← "best streak that ends at the last tile"
max(dp) = 5      ← the actual answer: the streak [5]
```

> **The answer is `max(dp)`.** Every cell is a *candidate ending point*. You
> built a scoreboard of candidates — now go **read the scoreboard**, not the
> last row of it.

The contrast to burn in:

```
Coin Change (Ch 5)  → dp[amount]   the journey has a MANDATORY endpoint
Kadane      (Ch 6)  → max(dp)      the journey may end ANYWHERE
```

Same five slots. **Termination is the slot that differs**, and it differs
because of one sentence in the problem statement. Read that sentence.

---

## The Base Case (derive it — do not copy Corin's)

Corin's base was `dp[0] = 0`. Reco's fingers want to type that again.
**Stop.** Apply *your own state definition* at the smallest index:

> `dp[0]` = "the best streak ending exactly at index 0."
> There is only one such streak: the single tile `nums[0]`.
> So `dp[0] = nums[0]`.

**Not `0`.** With `0`, an all-negative array like `[-3, -1, -2]` returns `0` —
a streak of length zero, which the problem forbids. You must pick at least one
tile.

> **The golden fix, again:** derive the base by applying your state definition
> at the smallest index. Never by memory of a previous problem.

---

## Hand-Trace the Coast Road

`nums = [3, -1, 4, 1]`

```
dp[0] = 3                                      (base: the tile itself)
dp[1] = max(-1,  3 + -1) = max(-1, 2) = 2      extend wins
dp[2] = max( 4,  2 +  4) = max( 4, 6) = 6      extend wins
dp[3] = max( 1,  6 +  1) = max( 1, 7) = 7      extend wins

answer = max(dp) = 7        → the whole road
```

Now watch RESTART actually fire:

```
nums  = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
dp    = [-2, 1, -2, 4,  3, 5, 6,  1, 5]
                      ↑
        dp[3] = max(4, -2 + 4) = max(4, 2) = 4   ← RESTART wins. The past was
                                                    poison; Kade drops it.
answer = max(dp) = 6        → the streak [4, -1, 2, 1]
```

> **The intuition worth keeping:** whenever the running total goes negative, it
> can only hurt whatever comes next. A negative prefix is never worth carrying.

---

## Kade Doesn't Need a Notebook

`dp[i]` only reads `dp[i-1]`. One cell back. So the array collapses into a
single variable — but you must keep a **separate** running maximum, because
the answer is `max(dp)` and you're throwing the array away:

```python
best_ending_here = nums[0]
best_anywhere    = nums[0]
for x in nums[1:]:
    best_ending_here = max(x, best_ending_here + x)           # the two doors
    best_anywhere    = max(best_anywhere, best_ending_here)   # survey as you go
```

O(n) time, **O(1) space**. Two variables — and they are not the same variable.
Conflating them is the classic Kadane bug.

---

## Cliffhanger

Kade runs **one** road. But the King's cartographers arrive with **two**
scrolls and an impossible demand:

> "Find the longest story told by *both* scrolls."

Two sequences. Two indices. A table with rows *and* columns — and a fulcrum
that must ask about **two last characters at once.**

Next: **The Twin Scribes**, and the day `dp[i]` grew a second dimension.

> Continue to `02 - worked example.md`.
