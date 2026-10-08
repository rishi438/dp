# Chapter 13 · 02 — Worked Example: Longest Palindromic Subsequence

> Five slots, then the Invariant Lens. New this chapter: the same `dp[l][r]`
> state as Vale but with **two doors instead of `n`**, a transition split by an
> **equality test**, and a sibling problem whose cells are **booleans**.

---

## The Problem

> `s = "bbbab"`
>
> Delete any letters you like (order preserved). What is the length of the
> longest remaining string that reads the same forwards and backwards?
> (Expected: `4` — `bbbb`.)

---

## Slot 0 — FULCRUM

> **Ask yourself:** "Does `s[l]` equal `s[r]`?"

Two branches. Not a loop.

```
MATCH      b [ ...inner... ] b        both ends join, step inward from BOTH
                                      → the world shrinks by two

MISMATCH   b [ ...inner... ] a        they can never BOTH be in a palindrome,
                                      so ABANDON one end. Which? Try both.
```

```
Ch 10  doors decided by the DATA        0…i     → a loop
Ch 12  doors = every cut inside         r-l     → a loop
Ch 13  doors decided by ONE equality    2       → an if/else
```

> Same `dp[l][r]` shape as Chapter 12, one whole factor of `n` cheaper.
> **The state shape never sets the complexity. The door count does.**

---

## Slot 1 — STATE

> `dp[l][r]` = the **length of the longest palindromic subsequence contained
> within `s[l..r]`, inclusive of both ends.**

Say "inclusive" out loud — Chapter 12's rule is permanent now.

Note what the state does **not** say: it does not require the palindrome to
*use* `s[l]` or `s[r]`. It is "the best anywhere inside this window". That is
exactly what makes the mismatch branch legal — dropping an end still leaves a
valid, smaller window of the same kind.

Only the **upper triangle** (`l <= r`) is meaningful.

---

## Slot 2 — TRANSITION

```python
if s[l] == s[r]:
    dp[l][r] = 2 + dp[l+1][r-1]                  # combine: +2 is MANDATORY
else:
    dp[l][r] = max(dp[l+1][r], dp[l][r-1])       # choose: abandon left or right
```

| English | Symbol |
|---|---|
| "both ends match, so both join" | `2 +` |
| "the best palindrome strictly inside them" | `dp[l+1][r-1]` |
| "give up the left end" | `dp[l+1][r]` |
| "give up the right end" | `dp[l][r-1]` |
| "I don't know which to give up — try both" | `max(...)` |

**Why `2 +` is outside any choice.** Wrap *any* palindrome in a pair of
identical letters and it stays a palindrome. The gain is unconditional, so
there is nothing to choose between — it's the Chapter 8 shape:

```
Ch 8   grid[r][c] + min(up, left)      mandatory cost,  OUTSIDE the choice
Ch 9   max(leave, take + value)        optional gain,   INSIDE one branch
Ch 13  2 + dp[l+1][r-1]                mandatory gain,  NO choice exists
```

**TRAP — the redundant `max`.** On a match you may be tempted to write
`max(2 + dp[l+1][r-1], dp[l+1][r], dp[l][r-1])`. It is *correct but pointless*:
taking two matching ends is provably never worse. The dangerous mutation is the
opposite one — using only `max(dp[l+1][r], dp[l][r-1])` on a match. That
silently under-counts and produces no error.

---

## Slot 3 — BASE CASE  *(Initialization)*

**Derive from the state sentence.** What is the longest palindromic subsequence
inside `s[i..i]` — a window of one letter?

> A single letter reads the same forwards and backwards. Length **1**.

```python
dp[i][i] = 1
```

**The second base, and it is the one you will miss.** When `s[l] == s[r]` and
`r == l + 1`, the transition reaches for `dp[l+1][r-1]` = `dp[l+1][l]` — where
`l > r`. That is an **empty window**.

```
dp[l][r] with l > r  =  0     an empty stretch contains a palindrome of length 0
```

Derive it, don't hand-wave it: an empty string *is* a palindrome, and its length
is `0`. If you allocate `dp` as zeros and only overwrite the triangle, this base
is satisfied for free — but **you must know it is there**, because in the
top-down version you have to write it explicitly.

Ninth chapter of base cases, still no two alike:

```
Ch 5  dp[0] = 0                Ch 10 dp[*] = 1
Ch 6  dp[0] = nums[0]          Ch 11 -prices[0] / -inf / 0
Ch 7  row/col of 0s            Ch 12 dp[i][i] = 0        (diagonal)
Ch 8  dp[0][0] = grid[0][0]    Ch 13 dp[i][i] = 1        (diagonal)
Ch 9  dp[0][*] = 0                   + dp[l>r] = 0       (below it)
```

> Ch 12's diagonal was `0`; Ch 13's is `1`. **Identical geometry, opposite
> value** — because the state sentences measure different things (a *cost of
> fusing* vs a *length of a thing that already exists*). This is precisely the
> copy-from-last-chapter reflex you have to kill.

---

## Slot 4 — TERMINATION

> ### `dp[0][n-1]` — the whole string, forced.

Mirra handed you the entire word and asked for the best palindrome inside it.
The window is the input. There is nothing to survey.

```
ENDPOINT FORCED     Ch 5 dp[amount] · Ch 8 dp[R-1][C-1] · Ch 9 dp[n][W]
                    Ch 12 dp[0][n-1] · Ch 13 dp[0][n-1]
ENDPOINT FREE       Ch 6 max(dp)    · Ch 10 max(dp)
LEGAL-END FILTER    Ch 11 max(sold, rest)
```

> **But read the sibling problem below before you relax.** Longest palindromic
> **substring** has the same `dp[l][r]` and a *completely different*
> termination — it must survey, because its cells are booleans and the answer is
> "the longest window that is `True`". Same shape, different exit.
> *Termination is re-derived every chapter. It is not a property of the table.*

Guard `n == 0`: `dp[0][-1]` on an empty table crashes, and the correct answer
is `0`.

---

## Verify By Hand

```
index:   0   1   2   3   4
s:       b   b   b   a   b
```

Fill with `l` descending, `r` ascending. (`·` = below the diagonal, unused.)

```
l=4:  dp[4][4] = 1                                            base

l=3:  dp[3][3] = 1                                            base
      dp[3][4]: s[3]='a' vs s[4]='b'  MISMATCH
                = max(dp[4][4], dp[3][3]) = max(1, 1) = 1

l=2:  dp[2][2] = 1                                            base
      dp[2][3]: 'b' vs 'a'  MISMATCH  = max(dp[3][3], dp[2][2]) = 1
      dp[2][4]: 'b' == 'b'  MATCH     = 2 + dp[3][3] = 2 + 1 = 3     ("bab")

l=1:  dp[1][1] = 1                                            base
      dp[1][2]: 'b' == 'b'  MATCH     = 2 + dp[2][1] = 2 + 0 = 2
                                        ^^^^^^^^ EMPTY window, the second base
      dp[1][3]: 'b' vs 'a'  MISMATCH  = max(dp[2][3], dp[1][2]) = max(1, 2) = 2
      dp[1][4]: 'b' == 'b'  MATCH     = 2 + dp[2][3] = 2 + 1 = 3

l=0:  dp[0][0] = 1                                            base
      dp[0][1]: 'b' == 'b'  MATCH     = 2 + dp[1][0] = 2 + 0 = 2
      dp[0][2]: 'b' == 'b'  MATCH     = 2 + dp[1][1] = 2 + 1 = 3     ("bbb")
      dp[0][3]: 'b' vs 'a'  MISMATCH  = max(dp[1][3], dp[0][2]) = max(2, 3) = 3
      dp[0][4]: 'b' == 'b'  MATCH     = 2 + dp[1][3] = 2 + 2 = 4     ("bbbb")
```

Final table:

```
        r=0   r=1   r=2   r=3   r=4
 l=0      1     2     3     3     4     ← answer in the top-right corner
 l=1      ·     1     2     2     3
 l=2      ·     ·     1     1     3
 l=3      ·     ·     ·     1     1
 l=4      ·     ·     ·     ·     1
```

> Look at `dp[0][4]`. It reaches for `dp[1][3] = 2`, which is the palindrome
> `bb` sitting inside `"bba"`. Wrapping it in the outer `b…b` gives `bbbb`.
> **The `a` is never "deleted" by any line of code** — it simply never got
> picked up, because `dp[1][3]`'s mismatch branch abandoned it.

---

## The Code

```python
def longest_palindromic_subseq(s):
    n = len(s)
    if n == 0:                                       # TERMINATION guard: empty string -> 0
        return 0
    dp = [[0] * n for _ in range(n)]                 # STATE: dp[l][r] = longest pal. subseq in s[l..r] inclusive
                                                     # BASE (2nd): cells with l > r stay 0 = the EMPTY window
    for l in range(n - 1, -1, -1):                   # l DOWNWARD so row l+1 is already final
        dp[l][l] = 1                                 # BASE (1st): one letter is a palindrome of length 1
        for r in range(l + 1, n):                    # r UPWARD so column r-1 is already final
            if s[l] == s[r]:                         # FULCRUM: do the two ends match?
                dp[l][r] = 2 + dp[l + 1][r - 1]      # TRANSITION: mandatory +2, step inward from both
            else:
                dp[l][r] = max(dp[l + 1][r],         # TRANSITION: abandon the LEFT end
                               dp[l][r - 1])         #             or abandon the RIGHT end
    return dp[0][n - 1]                              # TERMINATION: the FORCED whole string

print(longest_palindromic_subseq("bbbab"))     # expected: 4     bbbb
print(longest_palindromic_subseq("cbbd"))      # expected: 2     bb
print(longest_palindromic_subseq("agbdba"))    # expected: 5     abdba
print(longest_palindromic_subseq("abcde"))     # expected: 1     no pair matches
print(longest_palindromic_subseq("aaaa"))      # expected: 4
print(longest_palindromic_subseq("a"))         # expected: 1
print(longest_palindromic_subseq(""))          # expected: 0
```

### Top-down, if the loop directions make you nervous

```python
from functools import lru_cache

def lps_topdown(s):
    n = len(s)

    @lru_cache(maxsize=None)
    def best(l, r):                                  # STATE: same sentence, inclusive
        if l > r:                                    # BASE: the EMPTY window -- must be written by hand here
            return 0
        if l == r:                                   # BASE: a single letter
            return 1
        if s[l] == s[r]:                             # FULCRUM
            return 2 + best(l + 1, r - 1)            # TRANSITION: mandatory +2
        return max(best(l + 1, r), best(l, r - 1))   # TRANSITION: abandon an end

    return best(0, n - 1) if n else 0                # TERMINATION

print(lps_topdown("bbbab"))     # expected: 4
print(lps_topdown("agbdba"))    # expected: 5
print(lps_topdown(""))          # expected: 0
```

> **Notice what recursion forced you to admit.** Bottom-up, the `l > r` base was
> invisible — it hid inside the zero-filled table. Top-down, you must write
> `if l > r: return 0` or it recurses forever. *The base case did not appear;
> it was always there and the array was hiding it from you.*
> If you cannot name a base case, write the top-down version and it will
> interrogate you.

### Reconstructing the palindrome itself

```python
def lps_string(s):
    n = len(s)
    if n == 0:
        return ""
    dp = [[0] * n for _ in range(n)]
    for l in range(n - 1, -1, -1):
        dp[l][l] = 1
        for r in range(l + 1, n):
            dp[l][r] = 2 + dp[l+1][r-1] if s[l] == s[r] else max(dp[l+1][r], dp[l][r-1])
    left, right, l, r = [], [], 0, n - 1
    while l <= r:                                    # walk the table from the TERMINATION cell inward
        if l == r:
            left.append(s[l]); break                 # odd-length centre
        if s[l] == s[r]:
            left.append(s[l]); right.append(s[r])
            l, r = l + 1, r - 1
        elif dp[l+1][r] >= dp[l][r-1]:               # follow whichever door the max chose
            l += 1
        else:
            r -= 1
    return "".join(left) + "".join(reversed(right))

print(lps_string("bbbab"))     # expected: bbbb
print(lps_string("agbdba"))    # expected: abdba
print(lps_string("cbbd"))      # expected: bb
```

---

## The Invariant Lens

| Loop-invariant phase | DP name | What it means here |
|---|---|---|
| **Initialization** | Base Case | Two truths known without computation: `dp[i][i] = 1` (one letter is a palindrome) and `dp[l][r] = 0` for `l > r` (the empty window). The second is the one the array hides. |
| **Maintenance** | Transition | When filling `dp[l][r]`, all three sources are **shorter** windows and all three are already final — `dp[l+1][*]` because `l` descends, `dp[*][r-1]` because `r` ascends. Match adds a provably-safe `+2`; mismatch takes the better of the only two survivable options. |
| **Termination** | State (final) | Every window is correct for itself. The problem hands you the *whole* string, so the answer is the single cell `dp[0][n-1]`. |

**Source-cell check:**

```
dp[l][r]  reads  dp[l+1][r-1]   row below, col left    ✓ shorter by 2
                 dp[l+1][r]     row below              ✓ shorter by 1
                 dp[l][r-1]     col left               ✓ shorter by 1
```

All three are strictly shorter → both the length-driven order (Ch 12's) and the
`l`-descending order are valid topological orders. **`l` ascending is not.**

---

## Debugging With the Lens

```
Always returns 1                -> MAINTENANCE. l loops upward, so dp[l+1][*] is
                                   still 0 and the match branch never gains.

Always returns 0                -> INITIALIZATION. You never set dp[i][i] = 1.

Off by 2 on even-length         -> INITIALIZATION. The l > r empty-window base.
  palindromes ("bb" -> 0)          In top-down you forgot `if l > r: return 0`.

Under-counts on strings with    -> MAINTENANCE. The match branch was written as
  matching ends                    max(dp[l+1][r], dp[l][r-1]) instead of 2 + ...

Answer is a substring, not a    -> WRONG PROBLEM. You solved the boolean variant.
  subsequence                      Read the noun in the title.

IndexError / crash on ""        -> TERMINATION. Guard n == 0.
```

---

## Complexity

```
states     = O(n²) windows (the upper triangle)
transition = O(1)  -- ONE equality test, then 1 or 2 cell reads
TIME  = O(n²)
SPACE = O(n²), rollable to O(n) with care (dp[l] needs only row l+1)
```

> Put Ch 12 and Ch 13 side by side and read the only difference:
>
> ```
> Ch 12   O(n²) states × O(n) doors  = O(n³)
> Ch 13   O(n²) states × O(1) doors  = O(n²)
> ```
>
> `TIME = states × transition cost`. Thirteen chapters, one formula, no
> exceptions. When someone asks "why is this one slower", they are asking which
> factor you paid on.

---

## Sibling: Longest Palindromic **Substring** (the boolean twin)

> `s = "babad"`. Now the answer must be **contiguous**.
> (Expected length: `3`. Two witnesses tie: `"bab"` and `"aba"`.)

Same fulcrum. Everything else moves.

```python
def longest_palindromic_substring(s):
    n = len(s)
    if n == 0:
        return ""
    dp = [[False] * n for _ in range(n)]             # STATE: dp[l][r] = IS s[l..r] itself a palindrome?
    start, best = 0, 1                               # TERMINATION accumulator: survey as we go
    for l in range(n - 1, -1, -1):
        dp[l][l] = True                              # BASE: one letter IS a palindrome
        for r in range(l + 1, n):
            if s[l] == s[r] and (r - l == 1 or dp[l + 1][r - 1]):   # FULCRUM + inner must ALSO hold
                dp[l][r] = True                      # TRANSITION: no arithmetic -- truth propagates
                if r - l + 1 > best:
                    best, start = r - l + 1, l       # TERMINATION: endpoint is FREE -> survey
    return s[start:start + best]

print(longest_palindromic_substring("babad"))   # expected: aba
print(longest_palindromic_substring("cbbd"))    # expected: bb
print(longest_palindromic_substring("ac"))      # expected: a
print(longest_palindromic_substring("a"))       # expected: a
print(longest_palindromic_substring(""))        # expected:
```

> **`"babad"` returns `"aba"`, not `"bab"` — and both are correct.** Two
> substrings tie at length 3. The `l` loop descends, so `l=1` (`"aba"`) is
> recorded before `l=0` (`"bab"`) is even considered, and the strict `>` refuses
> to replace an equal-length winner.
>
> This is Chapter 10's lesson verbatim: **the DP returns the VALUE of the
> optimum; reconstruction returns ONE witness, chosen by your tie-breaking
> rule.** If you need a specific witness, you must say so in the code — flip
> `>` to `>=`, or iterate `l` upward. Do not "fix" it by guessing until the
> output matches; decide the rule, then write it.

**Read the two problems side by side — this table is the chapter's real lesson:**

| | Subsequence | Substring |
|---|---|---|
| cell holds | a length (`int`) | a truth (`bool`) |
| match branch | `2 + dp[l+1][r-1]` | `True` **only if** `dp[l+1][r-1]` is also `True` |
| mismatch branch | `max(drop left, drop right)` — recover | `False` — **no recovery** |
| base diagonal | `1` | `True` |
| termination | `dp[0][n-1]` — forced | **survey** every `True` cell |
| `"bbbab"` | `4` (`bbbb`) | `3` (`bbb`) |
| `"babad"` | `3` (`bab`/`aba`) | `3` (`bab`/`aba`) |

> The mismatch branch is where contiguity bites. A subsequence may *walk around*
> a bad letter; a substring is destroyed by it. One word in the problem
> statement, two different algorithms.

---

## Sibling: Minimum Insertions to Make a String Palindromic

A one-line corollary, and a good test of whether you actually own the state:

```
answer = n - LPS(s)
```

Everything already palindromic survives; every other character needs a partner
inserted.

```python
def min_insertions(s):
    return len(s) - longest_palindromic_subseq(s)    # TERMINATION reused, not re-derived

print(min_insertions("zzazz"))     # expected: 0
print(min_insertions("mbadm"))     # expected: 2
print(min_insertions("leetcode"))  # expected: 5
print(min_insertions(""))          # expected: 0
```

---

## The family roster

| Problem | The state | The twist |
|---|---|---|
| Longest Palindromic Subsequence | `dp[l][r]` = length | mismatch can recover |
| Longest Palindromic Substring | `dp[l][r]` = bool | mismatch is fatal; survey to terminate |
| Count Palindromic Substrings | `dp[l][r]` = bool | count the `True` cells |
| Min Insertions / Deletions | reuse LPS | `n - LPS(s)` |
| Palindrome Partitioning II | `dp[i]` + a bool table | two DPs stacked |
| Scramble String | `dp[l1][l2][len]` | Vale's cut, plus a swap |

> **And the gift from Chapter 7:** `LPS(s) == LCS(s, reverse(s))`. Prove it to
> yourself on `"bbbab"` before you accept it — a memorised identity is worth
> nothing, a derived one is a second weapon.

> Continue to `03 - your challenge.md`.
