# Chapter 16: Count valid numbers from 0 to 21

**Count numbers whose neighbouring digits are different.** The range includes both `0` and `21`.

There are `22` numbers in that range. Only `11` is invalid, so we expect **21**. The same method gives **923** for the original limit `1234`.

## What the saved answer means

`count_from(pos, previous, tight, started)` returns **the number of valid ways to finish the number**.

- `pos` is the next position in `digits`, the limit written as individual digits.
- `previous` is the last digit we wrote.
- `tight` is true if everything written so far matches the limit. Then the next digit cannot exceed the limit's digit at this position.
- `started` is true once a nonzero digit has appeared. Before that, zeros only pad shorter numbers.

The cache remembers the result for each combination of these four values. Different earlier digits can leave us with the same remaining task, so we calculate that task once.

## Choose the next digit

If `tight` is true, try digits from zero through the current limit digit. Otherwise try zero through nine.

Reject a digit matching `previous` only when the number has started. For each accepted digit, move to the next position and add its completion count.

`tight` stays true only if it was already true and we choose the limit's digit. `started` becomes true when we choose a nonzero digit.

## A tiny trace

| First digit for limit 21 | What happens next | Count |
|---|---|---:|
| 0 | Padding; all last digits 0..9 allowed | 10 |
| 1 | Already below 21; all last digits except 1 | 9 |
| 2 | Still matches 21; last digit must be 0 or 1 | 2 |

Add the counts: `10 + 9 + 2 = 21`.

## Runnable Python

```python
from functools import lru_cache


def count_no_adjacent_equal(limit):
    if limit < 0:
        return 0
    digits = [int(digit) for digit in str(limit)]

    @lru_cache(maxsize=None)
    def count_from(pos, previous, tight, started):
        if pos == len(digits):
            return 1  # One complete valid number.

        largest = digits[pos] if tight else 9
        total = 0
        for digit in range(largest + 1):
            if started and digit == previous:
                continue
            total += count_from(
                pos + 1,
                digit,
                tight and digit == digits[pos],
                started or digit != 0,
            )
        return total

    return count_from(0, -1, True, False)


print(count_no_adjacent_equal(21))    # 21
print(count_no_adjacent_equal(1234))  # 923
```

The first call starts at position zero, has no previous digit (`-1`), matches the empty beginning of the limit, and has not started a number.

When no positions remain, return `1`: we finished one valid number. Returning `0` would discard every completed number.

**Common mistake:** treating leading zeros as real neighbouring digits. The padded number `004` means `4` and is allowed. Keep `started` in the state so padding does not reject it.

---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 16 · 02 — Worked Example: Count Numbers ≤ N With No Two Equal Adjacent Digits

> Five slots, then the Invariant Lens. New this chapter: the input is a
> **bound written as a string**, the transition **sums** its doors instead of
> choosing one, and the state carries two booleans — `tight` and `started`.

---

## The Problem

> How many integers `x` with `0 ≤ x ≤ 1234` have **no two adjacent equal
> digits**? (`11`, `100`, `1223` are out; `0`, `12`, `1213` are in.)
> (Expected: `923`.)

---

## Slot 0 — FULCRUM

> **Ask yourself:** "I am at digit position `pos`. Which digit do I write here?"

Ten doors — unless the ceiling says otherwise.

```
N = 1 2 3 4
    0 1 2 3   ← pos

pos 0, tight:   I may write 0 or 1.
                d = 1  → prefix "1" == N's prefix "1"   → STILL tight
                d = 0  → prefix "0" <  N's prefix "1"   → free forever after

pos 1, free:    0..9, all of them. Nothing above can ever pull me back.
pos 1, tight:   0..2 only (N[1] = 2).
```

**The one line, and where it comes from:**

```
tight_next = tight and (d == N[pos])
```

Read it as a sentence: *"I remain glued to the ceiling only if I was already
glued to it **and** I wrote exactly the ceiling's digit."* Both conditions
required. And note the asymmetry — **once `tight` is False it never returns**,
because a strictly smaller prefix can never become equal again.

---

## Slot 1 — STATE

> `go(pos, prev, tight, started)` = the **number of ways to fill positions
> `pos … n-1`** such that the completed number is ≤ `N` and has no two equal
> adjacent digits, **GIVEN** that:
> - the digit written at `pos-1` was `prev`,
> - `tight` says whether the prefix so far exactly equals `N`'s prefix,
> - `started` says whether a nonzero digit has been written yet.

Four things. Derive each one by asking *"if I delete this, can I still answer
the fulcrum?"*

```
pos       obviously — it says which digit I'm choosing
prev      the RULE is about adjacency; without it I cannot reject d == prev
tight     without it I cannot compute this position's cap
started   without it "0004" looks like it has two equal adjacent digits
```

> **`started` is the one you will forget.** The number `4` is not `0004`. Those
> leading zeros are padding, not digits, and the adjacency rule must not see
> them. Add the flag **only** when the property cares about adjacency, digit
> count, or the first digit. For *"contains no digit 4"* it would be dead weight.

> **Counting the suffix, not the prefix.** This state measures *how many ways
> remain*, which is why the base case is `1` (see Slot 3). A bottom-up version
> could measure the prefix instead — and then its base would be different.
> Chapter 15's TSP made the same point. **The accounting direction decides the
> base case.**

---

## Slot 2 — TRANSITION

```python
total = 0
hi = digits[pos] if tight else 9          # the cap comes from `tight`
for d in range(0, hi + 1):                # FULCRUM: every legal digit is a door
    if started and d == prev:             # the rule -- but only once the number has begun
        continue
    total += go(pos + 1,                  # SUM, because we are COUNTING
                d,
                tight and d == hi,        # glued only if I was glued AND wrote the cap
                started or d > 0)         # the number begins at the first nonzero
return total
```

| English | Symbol |
|---|---|
| "every digit I'm allowed to write here" | `for d in range(hi + 1)` |
| "capped by N only while I'm still glued" | `hi = digits[pos] if tight else 9` |
| "reject a repeat, but only for real digits" | `if started and d == prev` |
| "all these choices are **different numbers**" | `total +=` |
| "still glued?" | `tight and d == hi` |
| "has the number begun?" | `started or d > 0` |

> **`+`, not `max`.** Two different digits at `pos` produce two disjoint sets of
> numbers — nothing is shared, nothing is double-counted, so the counts **add**.
>
> ```
> Counting SUMS the doors.  Optimizing PICKS one door.
> ```
>
> Chapter 5 said it. This is the first pattern chapter since then that is
> genuinely a counting problem, and eleven chapters of `min`/`max` have trained
> your fingers wrong. If you write `max` here you will get `1`.

**Why `d == hi` and not `d == digits[pos]`?** They are the same thing *when
`tight` is true*, and when `tight` is false `hi == 9` and the whole expression
is already killed by the leading `tight and`. Writing `hi` keeps it to one
variable. Either is correct — **know why**, don't copy.

---

## Slot 3 — BASE CASE  *(Initialization)*

```python
if pos == n:
    return 1
```

**Derive it from the state sentence.** *"The number of ways to fill zero
remaining positions"* — you have written a complete, legal number. **That is
one way.** Not zero.

> `0` would mean *"no valid completion exists"*, which is the opposite claim.
> Eleven chapters of `min`/`max` problems have trained you to type `0` for
> "nothing yet". **In a counting DP, `1` is the empty product: exactly one way
> to do nothing.** Chapter 5's Coin Change II had `dp[0] = 1` for the same
> reason.

**The variant you must derive, not copy.** If the problem counts from `1`
instead of `0`, the all-zeros path (which represents the number `0`) must not
be counted:

```python
if pos == n:
    return 1 if started else 0
```

> Here we count from `0`, and `0` *does* satisfy "no two adjacent equal digits",
> so plain `return 1` is right. **The base case changes with the question, not
> with the pattern.** This is exactly the trap in the sibling problem below.

Twelfth chapter of base cases. Still no two alike:

```
Ch 5  dp[0] = 0 (min) / 1 (count)   Ch 11 -prices[0] / -inf / 0
Ch 6  dp[0] = nums[0]               Ch 12 dp[i][i] = 0
Ch 7  row/col of 0s                 Ch 13 dp[i][i] = 1, dp[l>r] = 0
Ch 8  dp[0][0] = grid[0][0]         Ch 14 (0, 0) at the absent node
Ch 9  dp[0][*] = 0                  Ch 15 dp[{0}][0] = 0, rest inf
Ch 10 dp[*] = 1                     Ch 16 return 1 at pos == n   ← a COUNT, not a cost
```

---

## Slot 4 — TERMINATION

> ### `go(0, -1, True, False)` — the answer is the **first call**, not a cell.

```
pos     = 0      start at the most significant digit
prev    = -1     no previous digit exists; -1 can never equal a real digit 0..9
tight   = True   the empty prefix trivially equals N's empty prefix
started = False  nothing written yet
```

> **A sixth termination shape: the answer is the root of the recursion.**
>
> ```
> ENDPOINT FORCED        Ch 5 · Ch 8 · Ch 12 · Ch 13
> ENDPOINT FREE          Ch 6 · Ch 10
> LEGAL-END FILTER       Ch 11
> FORCED NODE, FREE MASK Ch 14
> SURVEY + FINAL COST    Ch 15
> THE ROOT CALL          Ch 16
> ```
>
> Chapter 14 was the first time the answer was a returned value rather than a
> cell; there it was the *root of the tree*. Here it is the *root of the
> digit-walk*. **Always ask where the answer lives — the shape of the code does
> not tell you.**

**And range queries:**

```
count in [L, R]  =  f(R) - f(L - 1)
```

Never write a two-bounded digit DP. `f(L)` would include `L` itself — the `-1`
is not optional.

---

## Verify By Hand

Take a tiny bound so the whole tree fits: **`N = 21`**, expected `21`.
(Numbers `0..21` are 22 values; only `11` is rejected.)

```
N = 2 1        digits = [2, 1],  n = 2
```

```
go(0, -1, tight=T, started=F)          hi = digits[0] = 2  →  d ∈ {0, 1, 2}

├─ d=0   started stays F (0 is padding), tight → F (0 ≠ 2)
│        go(1, 0, F, F)                hi = 9 → d ∈ 0..9
│        `started` is False, so the d == prev check is SKIPPED entirely
│        → all 10 digits legal → 10          (these are 0,1,2,…,9)
│
├─ d=1   started → T, tight → F (1 ≠ 2)
│        go(1, 1, F, T)                hi = 9 → d ∈ 0..9, but d ≠ 1
│        → 9                                 (10,12,13,…,19 — 11 rejected)
│
└─ d=2   started → T, tight stays T (2 == 2)
         go(1, 2, T, T)                hi = digits[1] = 1 → d ∈ {0, 1}
         neither equals prev=2 → both legal
         → 2                                 (20, 21)

total = 10 + 9 + 2 = 21    ✓
```

> **Three things to see in that trace, and they are the whole chapter:**
>
> 1. **The `d=0` branch skipped the adjacency check**, because `started` was
>    False. That is the only reason `0` and the single digits `1..9` are
>    counted. Delete `started` and `00` gets rejected — you lose the number `0`.
> 2. **Only one branch stayed `tight`** (`d=2`). There is exactly one tight path
>    per level. Every other branch became a free suffix.
> 3. **The free suffixes are where the reuse lives.** `go(1, 0, F, F)` returned
>    `10` — and for a 18-digit bound, thousands of distinct prefixes would land
>    on that same key. **That is the overlapping subproblem, and it is why this
>    runs in microseconds.**

---

## The Code

```python
from functools import lru_cache

def count_no_adjacent_equal(N):
    if N < 0:                                        # guard: an empty range
        return 0
    digits = [int(c) for c in str(N)]                # the INPUT is the bound, as a string
    n = len(digits)

    @lru_cache(maxsize=None)                         # `tight` MUST stay part of the key
    def go(pos, prev, tight, started):
        # STATE: ways to fill pos..n-1, GIVEN prev digit, glued-ness, and whether we've begun
        if pos == n:                                 # BASE: a complete legal number = ONE way
            return 1
        total = 0
        hi = digits[pos] if tight else 9             # FULCRUM: the cap comes from `tight`
        for d in range(0, hi + 1):                   #          every legal digit is a door
            if started and d == prev:                # the rule -- ignored while still padding
                continue
            total += go(pos + 1,                     # TRANSITION: SUM -- disjoint sets of numbers
                        d,
                        tight and d == hi,           # glued only if glued AND wrote the cap
                        started or d > 0)            # the number begins at the first nonzero
        return total

    return go(0, -1, True, False)                    # TERMINATION: the ROOT call is the answer

print(count_no_adjacent_equal(21))      # expected: 21     only 11 is rejected
print(count_no_adjacent_equal(99))      # expected: 91     11,22,...,99 rejected -> 100-9
print(count_no_adjacent_equal(100))     # expected: 91     100 has "00" -> rejected
print(count_no_adjacent_equal(1234))    # expected: 923
print(count_no_adjacent_equal(9))       # expected: 10     0..9 all fine
print(count_no_adjacent_equal(0))       # expected: 1      just 0
print(count_no_adjacent_equal(-5))      # expected: 0
```

> **Look at `99 → 91` and `100 → 91`.** Adding the number `100` changed nothing,
> because `100` contains `"00"`. If your code returns `92` for `100`, you
> dropped `started` *or* you mishandled the widening from 2 digits to 3.
> **That pair of tests is the best single check in this chapter — keep it.**

### Proving it, the only way that counts

```python
def brute(N):
    return sum(1 for x in range(N + 1)
               if all(a != b for a, b in zip(str(x), str(x)[1:])))

print(all(count_no_adjacent_equal(N) == brute(N) for N in range(0, 3000)))
# expected: True
```

> **Write the brute force. Always.** A digit DP is unusually easy to get subtly
> wrong and unusually easy to verify: the brute force is four lines and works up
> to `10⁵`. If they agree on every `N` below a few thousand, your flags are
> right. If they diverge, **print the first `N` where they differ** — the
> failing case tells you which flag is broken faster than any amount of
> re-reading.

### Range queries

```python
def count_in_range(L, R):
    return count_no_adjacent_equal(R) - count_no_adjacent_equal(L - 1)

print(count_in_range(10, 20))    # expected: 10      11 is the only rejection
print(count_in_range(0, 1234))   # expected: 923
print(count_in_range(11, 11))    # expected: 0
print(count_in_range(12, 12))    # expected: 1
```

---

## The Invariant Lens

| Loop-invariant phase | DP name | What it means here |
|---|---|---|
| **Initialization** | Base Case | `pos == n` returns `1`: a fully written, legal number is exactly one way. This is the empty product of a counting DP, not the `0` of an optimising one. |
| **Maintenance** | Transition | Given a correct count for every suffix starting at `pos+1`, summing over the legal digits at `pos` gives a correct count for suffixes starting at `pos`. The digit sets are **disjoint** (different digit at `pos` ⇒ different number), so `+` never double-counts. `tight` correctly narrows the door list to exactly the digits that keep the number ≤ `N`. |
| **Termination** | State (final) | The recursion bottoms out and unwinds to `go(0, -1, True, False)`, which counts every legal number in `[0, N]`. |

**Source-state check (the ordering proof, in one line):**

```
every recursive call increases `pos` by exactly 1, and `pos` stops at n
```

> No loop order to argue about, and no cycles possible. Like Chapter 14, the
> call stack supplies the topological sort — but for a different reason: there,
> subtrees shrank; here, a **monotone counter** advances.

---

## Debugging With the Lens

```
Returns 1 always              -> MAINTENANCE. You wrote max(...) instead of a sum.
                                 Counting SUMS the doors.

Returns 0 always              -> INITIALIZATION. Base returns 0 instead of 1.

Counts all len(N)-digit       -> MAINTENANCE. hi = 9 unconditionally. You ignored N.
  strings (way too many)

Far too small                 -> MAINTENANCE. hi = digits[pos] unconditionally.
                                 You capped every position, even after going free.

Off by exactly 1 (the         -> INITIALIZATION. `return 1 if started else 0` when
  number 0 is missing)           the question does include 0. Or the reverse.

Single-digit numbers          -> STATE. You dropped `started`, so "0004" trips the
  rejected / 0 not counted       adjacency rule on its padding.

Agrees for 2 digits, breaks   -> STATE. `tight` is missing from the lru_cache key,
  at 3+                          so a capped suffix poisoned a free one.

f(R) - f(L) is off by one     -> TERMINATION. It must be f(R) - f(L - 1).
```

---

## Complexity

```
states     = pos (≤ 19) × prev (11) × tight (2) × started (2)   ≈ 850
transition = O(10) digits
TIME  = O(len(N) × 10 × 2 × 2 × 10)  ≈ a few thousand operations
SPACE = O(states) for the memo + O(len(N)) stack
```

```
N = 10¹⁸     brute force:  10¹⁸ iterations       digit DP: ~8500 operations
```

> **This is the best ratio in the book.** Chapter 15 turned `O(n!)` into a
> smaller exponential; Chapter 16 turns `O(N)` into `O(log N)` — genuinely
> logarithmic in the *value* of the input.
>
> `TIME = states × transition cost`, sixteen chapters unbroken. Here both
> factors are tiny, and the only thing that can make them large is **carrying
> more than the rule needs**. Carry a running sum modulo `K` and you multiply
> the state count by `K`. That is a real cost, and it is the only design
> decision in this family.

---

## Sibling: Numbers At Most N Given a Digit Set

> Given allowed digits `{1,3,5,7}` and `N = 100`, how many positive integers
> can be written using **only** those digits and are ≤ `N`? (Expected: `20` —
> the 4 one-digit and 16 two-digit combinations.)

The twist: numbers here may be **shorter than `N`**, and the base case changes.

```python
from functools import lru_cache

def at_most_n_given_digit_set(allowed, n):
    s = str(n)
    L = len(s)
    ds = sorted(int(d) for d in allowed)

    @lru_cache(maxsize=None)
    def go(pos, tight, started):                     # STATE: ways to fill pos..L-1
        if pos == L:
            return 1 if started else 0               # BASE: the all-padding path is the
                                                     #       number 0, which is NOT positive
        total = 0
        if not started:
            total += go(pos + 1, False, False)       # skip this place entirely = a SHORTER number
        hi = int(s[pos]) if tight else 9
        for d in ds:                                 # FULCRUM: only the allowed digits are doors
            if d > hi:
                break                                # ds is sorted, so nothing later fits either
            total += go(pos + 1, tight and d == hi, True)
        return total

    return go(0, True, False)                        # TERMINATION: the root call

print(at_most_n_given_digit_set(["1", "3", "5", "7"], 100))    # expected: 20
print(at_most_n_given_digit_set(["1", "4", "9"], 1000000000))  # expected: 29523
print(at_most_n_given_digit_set(["7"], 8))                     # expected: 1
```

> **Two derivations that differ from the main example — and both are Slot 3/0
> decisions, not coding details:**
>
> 1. `return 1 if started else 0`. The question says *positive* integers, so the
>    all-zeros path (the number `0`) must not be counted. In the main example we
>    counted from `0`, so it was plain `return 1`. **Same pattern, different
>    question, different base case.**
> 2. `if not started: total += go(pos+1, False, False)` — an explicit *"write
>    nothing here"* door, which is how a 2-digit number gets counted inside a
>    3-digit walk. Note it forces `tight = False`: a shorter number is
>    automatically strictly smaller.
>
> The main example did not need that door because it allowed the digit `0`
> anyway, which achieved the same padding implicitly. **Derive the door list
> from the rules; do not transplant it.**

---

## Sibling: Count the Digit `1` (a carried accumulator)

> How many times does the digit `1` appear in all numbers from `0` to `n`?
> (`n = 13` → `6`: in 1, 10, 11(×2), 12, 13.)

Here the state carries a **running count**, and the base returns it instead of
returning `1`.

```python
from functools import lru_cache

def count_digit_one(n):
    if n < 0:
        return 0
    digits = [int(c) for c in str(n)]
    L = len(digits)

    @lru_cache(maxsize=None)
    def go(pos, cnt, tight):                         # STATE: total 1s over all completions,
        if pos == L:                                 #        GIVEN cnt ones already written
            return cnt                               # BASE: this number contributed `cnt`
        total = 0
        hi = digits[pos] if tight else 9
        for d in range(hi + 1):                      # FULCRUM: every digit; no rule rejects any
            total += go(pos + 1, cnt + (d == 1), tight and d == hi)
        return total

    return go(0, 0, True)                            # TERMINATION: the root call

print(count_digit_one(13))     # expected: 6
print(count_digit_one(0))      # expected: 0
print(count_digit_one(100))    # expected: 21
print(count_digit_one(999))    # expected: 300
print(count_digit_one(1234))   # expected: 689
```

> **The base case returns `cnt`, not `1`.** Read the state sentence: it measures
> *"total ones over all completions"*, not *"how many completions"*. A finished
> number contributes its own tally.
>
> No `started` flag — leading zeros contribute zero `1`s, so they are harmless.
> **Do not add the flag by reflex.**
>
> This is the same state-design question as every other chapter: **what is the
> smallest thing I must carry for the transition to be answerable?**

---

## The family roster

| Question | What you carry beyond `pos`/`tight` |
|---|---|
| No digit `4` | nothing |
| No two equal neighbours | `prev`, `started` |
| Digits sum to `S` | running sum |
| Divisible by `K` | running remainder `mod K` |
| Digits non-decreasing | `prev` |
| Count occurrences of digit `1` | running count |
| At most `k` distinct digits | a 10-bit mask (Chapter 15 says hello) |
| Is a palindrome | the prefix, or a two-pointer walk |

> Every row is the same walk. **The only design decision is the middle column:
> the smallest summary the rule needs to look back at.** That column is Slot 1,
> and it is the whole job.

> Continue to `03 - your challenge.md`.


</details>
