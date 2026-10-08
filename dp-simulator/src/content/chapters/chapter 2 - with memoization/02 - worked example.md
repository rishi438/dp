# Chapter 2 example: Calculate Fibonacci once per position

Find `fib(6)`, with positions 1 and 2 both equal to 1. The answer is **8**.

Plain recursion calculates some positions repeatedly. We will keep a dictionary called `memo`, where a key is a position and its value is that position's answer.

## What stays the same?

The smaller questions are `fib(i-1)` and `fib(i-2)`. Their sum gives `fib(i)`. The known starting answers are still 1 and 1.

**What changes:** before calculating, check whether the result is already in `memo`. After calculating, put it there.

## Follow the saved answers

Start with `memo = {1: 1, 2: 1}`.

| New result | Calculation | Stored answer |
|---|---|---|
| Position 3 | 1 + 1 | `memo[3] = 2` |
| Position 4 | 2 + 1 | `memo[4] = 3` |
| Position 5 | 3 + 2 | `memo[5] = 5` |
| Position 6 | 5 + 3 | `memo[6] = 8` |

For example, when position 5 needs position 3, its value is already stored. Reading that value is called a **cache hit**. It avoids all the smaller calls that would otherwise follow.

## Runnable Python

The function accepts a positive integer `n`. The outer function creates one cache; all recursive calls to `fib` use it.

```python
def fib_memo(n):
    memo = {1: 1, 2: 1}

    def fib(i):
        if i in memo:
            return memo[i]
        memo[i] = fib(i - 1) + fib(i - 2)
        return memo[i]

    return fib(n)

print(fib_memo(6))   # 8
print(fib_memo(10))  # 55
print(fib_memo(50))  # 12586269025
```

The final answer is `fib(n)`. We do not add all the entries in the dictionary; each entry answers a different position question.

## Why is it faster?

The program calculates at most `n` distinct positions, with one addition per new position. In the usual DP analysis, this is `O(n)` work: work grows roughly with the number of positions. It also stores `O(n)` answers and can have `O(n)` unfinished recursive calls. Very large Fibonacci numbers themselves take more space and arithmetic time.

**Common mistake:** using a cache key that leaves out information affecting the answer. Position alone works here because it completely identifies a Fibonacci question. For a question involving both a position and a remaining budget, both may need to be in the key.

Each call to `fib_memo` above creates a fresh dictionary, so separate runs do not share old input-specific results.

---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 2 · 02 — Worked Example: Turning Recursion Into Memoization

> I take Chapter 1's dying `fib`, cure it in three lines, **measure** the cure,
> then apply the same surgery to a problem you haven't seen. Watch the method,
> not the answer.

---

## Step 1 — Start From the Patient

Chapter 1's villain, unchanged:

```python
def fib_slow(n):
    if n <= 2:
        return 1
    return fib_slow(n-1) + fib_slow(n-2)
```

Before touching anything, **name the five slots in the existing code.** If you
can't point at all five, you don't understand the recursion well enough to
memoize it safely.

```
0. FULCRUM     = the two sub-calls: fib(n-1), fib(n-2)  → two doors
1. STATE       = n                (the only argument → the only thing that varies)
2. TRANSITION  = fib(n-1) + fib(n-2)
3. BASE CASE   = if n <= 2: return 1
4. TERMINATION = the top-level call fib(n)
```

> **Slot 1 is the one that matters today.** The memo key must be *exactly* the
> state. Here the state is one integer, so the key is one integer.

---

## Step 2 — Apply the Two Commandments

```
1. LOOK BEFORE YOU LEAP    →  if it's in the book, return it
2. WRITE BEFORE YOU LEAVE  →  store it before returning
```

```python
def fib_memo(n, memo=None):
    if memo is None:              # fresh notebook per top-level call (avoids the
        memo = {}                 # mutable-default trap)
    if n in memo:                 # ① LOOK BEFORE YOU LEAP
        return memo[n]
    if n <= 2:                    # BASE CASE — unchanged from Chapter 1
        return 1
    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)   # TRANSITION — unchanged
    return memo[n]                # ② WRITE BEFORE YOU LEAVE (done on the line above)

print(fib_memo(10))    # expected: 55
print(fib_memo(50))    # expected: 12586269025   — instant, where Ch 1 took forever
```

Diff against Chapter 1: **three lines added, zero lines changed.**
The transition, the base case, the state — untouched.

---

## Step 3 — MEASURE the cure (don't take my word for it)

Chapter 1 made you count calls to feel the pain. Count them again to feel the
cure:

```python
def make_counted_fib(memoized):
    calls = [0]
    memo = {}
    def fib(n):
        calls[0] += 1
        if memoized and n in memo:
            return memo[n]
        if n <= 2:
            return 1
        r = fib(n-1) + fib(n-2)
        if memoized:
            memo[n] = r
        return r
    return fib, calls

for n in [10, 20, 30]:
    slow, c_slow = make_counted_fib(False)
    fast, c_fast = make_counted_fib(True)
    slow(n); fast(n)
    print(f"fib({n}):  plain = {c_slow[0]:>8} calls   memo = {c_fast[0]:>4} calls")
```

Expected shape of the output:

```
fib(10):  plain =      109 calls   memo =   19 calls
fib(20):  plain =    13529 calls   memo =   39 calls
fib(30):  plain =  1664079 calls   memo =   59 calls
```

Read the two columns. The left one **multiplies by ~123 every ten steps**.
The right one **adds 20**.

> That is `O(2ⁿ)` versus `O(n)`, printed on your own screen.
> `2n - 1` calls exactly: `n` that do real work, `n - 1` that are instant hits.

---

## Step 4 — Predict the complexity WITHOUT running it

```
TIME = (number of distinct states) × (cost of one transition)
```

- Distinct states: `n` is one integer from `1..n` → **`n` states.**
- Cost of one transition: one addition → **`O(1)`.**
- Therefore **`O(n)` time**, and `O(n)` space for the notebook (plus `O(n)`
  stack).

> Use this formula *before* you write code, to decide whether the approach is
> even viable. If you count `2ⁿ` states and `n` is 40, stop — memoization
> won't save you; you need a different state.

---

## Step 5 — Now a Problem You Haven't Seen

> **Min Cost Climbing Stairs.** `cost[i]` is the toll paid to *step off* stair
> `i`. You may start from stair 0 or stair 1, and you climb 1 or 2 at a time.
> Reach the top (just past the last stair) as cheaply as possible.
>
> `cost = [10, 15, 20]` → answer `15` (start at stair 1, pay 15, hop 2 to the top).

**Five slots first. English before code.**

```
0. FULCRUM     "What was my LAST hop onto the top?"
               I arrived from stair n-1 (hopping 1) or stair n-2 (hopping 2).
               Two doors.

1. STATE       dp(i) = the minimum cost to REACH stair i.
               (Reach it — standing on it, having not yet paid its toll.)

2. TRANSITION  To reach i, I came from i-1 or i-2, and I had to pay THAT
               stair's toll to leave it:
                   dp(i) = min( dp(i-1) + cost[i-1],
                                dp(i-2) + cost[i-2] )

3. BASE CASE   DERIVE, don't copy. Apply the state sentence at the smallest i:
                   dp(0) = 0   "cost to reach stair 0"  → free, I start there
                   dp(1) = 0   "cost to reach stair 1"  → free, I may start there
               (The problem says I may start at 0 OR 1. That sentence IS the base.)

4. TERMINATION dp(n), where n = len(cost). "The top" is one past the last
               stair — a real index in this state space, not len(cost)-1.
```

> Note slot 3 carefully. `dp(1) = 0`, **not** `cost[0]`. The toll is paid on
> *leaving* a stair, and the problem lets you *begin* on stair 1 for free.
> That single sentence in the prompt is the whole base case. Read prompts like
> a lawyer.

**Now the code:**

```python
def min_cost_climbing(cost):
    n = len(cost)

    def dp(i, memo={}):           # safe here: `def dp` re-runs on every outer call,
        if i in memo:             # so this default dict is rebuilt per `cost`
            return memo[i]
        if i <= 1:                    # BASE: may start at stair 0 or 1 for free
            return 0
        memo[i] = min(dp(i-1) + cost[i-1],    # FULCRUM door 1: hopped 1 from i-1
                      dp(i-2) + cost[i-2])    # FULCRUM door 2: hopped 2 from i-2
        return memo[i]                # ② WRITE

    return dp(n)                      # TERMINATION: "the top" is index n

print(min_cost_climbing([10, 15, 20]))                      # expected: 15
print(min_cost_climbing([1, 100, 1, 1, 1, 100, 1, 1, 100, 1]))  # expected: 6
```

> **Why isn't that `memo={}` the trap from the story?** Because `def dp` is a
> *statement inside* `min_cost_climbing`. It re-executes on every outer call,
> so a brand-new default dict is built each time, correctly scoped to this
> `cost`. The trap only bites when the `def` runs **once** — i.e. at module
> level, like Chapter 1's `fib(n, memo={})`. Know the difference; don't
> cargo-cult either form.

**Hand-verify the small one** (`cost = [10, 15, 20]`, so `n = 3`):

```
dp(0) = 0
dp(1) = 0
dp(2) = min(dp(1) + cost[1], dp(0) + cost[0]) = min(0+15, 0+10) = 10
dp(3) = min(dp(2) + cost[2], dp(1) + cost[1]) = min(10+20, 0+15) = 15   ✓
```

Start on stair 1 → pay 15 → hop 2 → top. Fifteen. ✓

---

## Step 6 — The Same Thing With `lru_cache`

```python
from functools import lru_cache

def min_cost_climbing_cached(cost):
    n = len(cost)

    @lru_cache(None)              # the decorator IS the notebook
    def dp(i):
        if i <= 1:
            return 0
        return min(dp(i-1) + cost[i-1], dp(i-2) + cost[i-2])

    result = dp(n)
    dp.cache_clear()              # cost[] is captured from the closure — clear it
    return result                 # or a later call with a DIFFERENT cost is poisoned

print(min_cost_climbing_cached([10, 15, 20]))   # expected: 15
print(min_cost_climbing_cached([0, 0, 0]))      # expected: 0   (proves the clear works)
```

> **That `cache_clear()` is not decoration.** `dp` closes over `cost`. Without
> clearing, the second call would happily return the *first* call's cached
> answers. This is Rule A — *the key must be the complete state* — and here
> `cost` is part of the state but not part of the key.

---

## Debugging Checklist for Memoization

```
No speedup at all?              → Commandment 1 missing (you never LOOK), or
                                  there is genuinely no overlap (not DP — see
                                  factorial in Ch 1, Challenge 6).
Fast but WRONG answers?         → Rule A. Your key isn't the complete state.
                                  Some argument varies but isn't in the key.
Wrong only on the 2nd call?     → A shared/global cache carrying stale entries.
                                  (mutable default arg, or an unclearered lru_cache)
TypeError: unhashable type?     → Rule B. A list/dict/set is in your key.
                                  Convert to a tuple or frozenset.
RecursionError?                 → Trap 3. The depth limit. This is Chapter 3's
                                  entire reason to exist.
```

---

## The Takeaway

```
1. Write the plain recursion        → it REVEALS all five slots
2. Name the five slots out loud     → especially STATE, which becomes the key
3. Add the two commandments         → LOOK first, WRITE before leaving
4. Verify nothing else changed      → transition & base must be byte-identical
5. MEASURE                          → count calls; prove O(2ⁿ) → O(states)
6. Predict complexity               → states × transition cost
```

> The thinking never changes. Only the bookkeeping.
> Your turn: `03 - your challenge.md`. One challenge memoizes something that
> **shouldn't** be memoized, and one hides an under-specified key.


</details>
