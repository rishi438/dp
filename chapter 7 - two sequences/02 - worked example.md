# Chapter 7 · 02 — Worked Example: Longest Common Subsequence

> Five slots, then the Invariant Lens. New this chapter: the invariant grows
> **two** dimensions, so "one step forward" has to be defined carefully.

---

## The Problem

> `a = "abcde"`, `b = "ace"`.
> Return the length of the **longest subsequence present in both**.
> (Order preserved. Gaps allowed. Not necessarily contiguous.)

Answer: `"ace"` → **3**.

> **Read the word.** *Subsequence* = gaps allowed → Twin Scribes.
> *Substring* would have meant contiguous → Kade, Chapter 6.

---

## Slot 0 — FULCRUM

> ### "What happened to the LAST character of each string?"

Point at both ends at once. Exactly two situations:

```
MATCH   a[i-1] == b[j-1]   → that pair is FREE. Take it, consume both, +1.
                             ONE door:  dp[i-1][j-1] + 1

DIFFER  a[i-1] != b[j-1]   → at least one end is useless, but which?
                             TWO doors: dp[i-1][j]   (discard a's last)
                                        dp[i][j-1]   (discard b's last)
```

**Why is a match always safe to take?** Because keeping a matching pair can
never shorten the best common subsequence — it adds 1 and leaves strictly
smaller prefixes. There is no scenario where discarding a free match helps.
(That's an *exchange argument*; it's what justifies the single door.)

---

## Slot 1 — STATE

> `dp[i][j]` = the length of the LCS of **a's first `i` characters** and
> **b's first `j` characters**.

Two sequences → two indices. One index cannot address two positions.

**The off-by-one contract, stated once and obeyed forever:**

```
dp[i][j]  is about  a[0..i-1]  and  b[0..j-1]
so the characters under inspection are  a[i-1]  and  b[j-1]
```

Row `i` means *"the first i characters"*, which is why the character itself
lives at index `i-1`. Say it out loud before you type the loop.

---

## Slot 2 — TRANSITION

```python
if a[i-1] == b[j-1]:
    dp[i][j] = dp[i-1][j-1] + 1            # MATCH  → diagonal, +1
else:
    dp[i][j] = max(dp[i-1][j], dp[i][j-1]) # DIFFER → best of up / left
```

The arrows, which you should now be able to draw from memory:

```
        j-1     j
      ┌──────┬──────┐
 i-1  │  ↖   │  ↑   │      MATCH  → ↖  (diagonal) + 1
      ├──────┼──────┤      DIFFER → max(↑, ←)
  i   │  ←   │ dp   │
      └──────┴──────┘
```

`max` and not `+`, because the question asks for the *longest* — an
optimization, so **pick one door**. Summing would count nonsense.

---

## Slot 3 — BASE CASE  *(Initialization)*

**Derive it from the state definition.** Set `i = 0`:

> `dp[0][j]` = "LCS of the **empty** prefix of `a` and the first `j` of `b`."
> Nothing can be common with nothing. → **0**.

Symmetrically `dp[i][0] = 0`.

So the table is `(m+1) × (n+1)` and its first row and column are zeros:

```python
dp = [[0] * (n + 1) for _ in range(m + 1)]
```

> The extra row/column is not decoration. It is the **meaning of "empty
> prefix"**, and it is what makes `dp[i-1][j-1]` legal when `i = j = 1`.
> Delete it and you get an `IndexError` on the very first cell.

---

## Slot 4 — TERMINATION

> `dp[m][n]` — the **bottom-right corner**. Not `max(dp)`.

Why the corner and not a survey? Because `dp[m][n]` uses *all* of `a` and *all*
of `b`, and any common subsequence of shorter prefixes is **also** a common
subsequence of the full strings. So the corner is `>=` every other cell — it
**dominates** the table. Surveying would be redundant (though harmless here).

```
Ch 5 Coin Change  → dp[amount]   mandatory endpoint
Ch 6 Kadane       → max(dp)      the run may end anywhere
Ch 7 LCS          → dp[m][n]     the corner dominates all other cells
```

---

## Verify By Hand

`a = "abcde"` (rows), `b = "ace"` (columns).

```
            ""   a    c    e
       ""  [ 0 ][ 0 ][ 0 ][ 0 ]
        a  [ 0 ][ 1 ][ 1 ][ 1 ]
        b  [ 0 ][ 1 ][ 1 ][ 1 ]
        c  [ 0 ][ 1 ][ 2 ][ 2 ]
        d  [ 0 ][ 1 ][ 2 ][ 2 ]
        e  [ 0 ][ 1 ][ 2 ][ 3 ]
```

Three cells traced in full:

```
dp[1][1]: a[0]='a', b[0]='a'  → MATCH  → dp[0][0] + 1 = 1
dp[2][2]: a[1]='b', b[1]='c'  → DIFFER → max(dp[1][2], dp[2][1]) = max(1,1) = 1
dp[5][3]: a[4]='e', b[2]='e'  → MATCH  → dp[4][2] + 1 = 2 + 1 = 3   ← answer
```

`dp[5][3] = 3`, and `"ace"` has length 3. ✓

> **Reading the diagonal jumps tells you the actual subsequence.** Every time
> you moved `↖`, that character was in the LCS. That's how you recover the
> string, not just its length.

---

## The Code

```python
def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]       # STATE: dp[i][j] = LCS of a[:i], b[:j]
    for i in range(1, m + 1):                        # BASE/INIT: row 0 and col 0 are 0 (empty prefix)
        for j in range(1, n + 1):
            if a[i-1] == b[j-1]:                     # FULCRUM: what happened to the LAST char of each?
                dp[i][j] = dp[i-1][j-1] + 1          # TRANSITION: match -> diagonal, +1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])   # TRANSITION: differ -> best of up / left
    return dp[m][n]                                  # TERMINATION: the corner dominates

print(lcs("abcde", "ace"))   # expected: 3   ("ace")
print(lcs("abc", "xyz"))     # expected: 0   (nothing in common)
print(lcs("abc", "abc"))     # expected: 3
```

---

## The Invariant Lens (2D version)

| Loop-invariant phase | DP name       | What it means here                                             |
|----------------------|---------------|----------------------------------------------------------------|
| **Initialization**   | Base Case     | The starting truth known without computation: row 0 and column 0 are all `0`, because an empty prefix shares nothing. |
| **Maintenance**      | Transition    | One step forward preserves correctness. When computing `dp[i][j]`, the three cells it reads — `dp[i-1][j-1]`, `dp[i-1][j]`, `dp[i][j-1]` — all lie in *earlier rows or earlier columns*, so all are already correct. |
| **Termination**      | State (final) | Loops end at `i = m`, `j = n`. `dp[m][n]` is correct and, because the corner dominates every other cell, it is the answer. |

**The 2D subtlety — and why loop order is safe here.** In 1D, "already
computed" just meant *smaller index*. In 2D you must check **all three**
source cells:

```
dp[i-1][j-1]  → previous row  ✓ done
dp[i-1][j]    → previous row  ✓ done
dp[i][j-1]    → same row, previous column  ✓ done (inner loop runs left→right)
```

Row-major order satisfies all three. ✓

> **Remember this check.** In Chapter 12 (Interval DP) the naive `for i: for j:`
> order **fails** exactly this test, and that failure is TRAP 6. Learn to run
> the check here, where it passes, so you spot it there, where it doesn't.

---

## Debugging With the Lens

```
IndexError on the first cell?          → Initialization. You sized the table
                                         m×n instead of (m+1)×(n+1).
Answer is 1 too big / too small?       → The off-by-one contract. You compared
                                         a[i] instead of a[i-1].
Correct for short strings, wrong long? → Maintenance. You read a cell from a
                                         row not yet filled.
```

---

## Space Optimization

`dp[i][j]` only ever reads the **previous row** and the **current row**. So
two rows suffice — the other `m-1` rows are dead weight:

```python
def lcs_2rows(a, b):
    m, n = len(a), len(b)
    if n > m:                       # keep the rolled dimension the SMALLER one
        a, b, m, n = b, a, n, m
    prev = [0] * (n + 1)            # STATE: the previous row only
    for i in range(1, m + 1):
        cur = [0] * (n + 1)
        for j in range(1, n + 1):
            if a[i-1] == b[j-1]:
                cur[j] = prev[j-1] + 1          # diagonal = prev row, prev col
            else:
                cur[j] = max(prev[j], cur[j-1]) # up = prev row | left = cur row
        prev = cur
    return prev[n]

print(lcs_2rows("abcde", "ace"))   # expected: 3
```

`O(m·n)` time, `O(min(m, n))` space.

> **The catch:** this returns only the *length*. Recovering the actual
> subsequence needs the full table, because you must walk the arrows backward.
> **Space optimization costs you the ability to reconstruct the answer.**

---

## The Family Around LCS (same skeleton, different filling)

```
Edit Distance          MATCH → dp[i-1][j-1]
                       DIFFER→ 1 + min(replace ↖, delete ↑, insert ←)   3 doors

Longest Common Substring   MATCH → dp[i-1][j-1] + 1
                           DIFFER→ 0   ← the run BREAKS; and termination
                                         becomes max(dp), Kade-style!

Distinct Subsequences  MATCH → dp[i-1][j-1] + dp[i-1][j]   ← counting, so SUM
                       DIFFER→ dp[i-1][j]
```

> Look at **Longest Common *Substring***: one word changed, and suddenly the
> DIFFER case resets to `0` **and termination flips to `max(dp)`**. Substring
> means contiguous — Kade is back. Two families in one table.

---

## Complexity

```
Time   O(m × n)                 every cell, O(1) work
Space  O(m × n) → O(min(m, n))  roll to two rows (loses reconstruction)
```

---

## The Takeaway

```
0. FULCRUM      "what happened to the LAST char of EACH?"
1. STATE        dp[i][j] = answer for a[:i] vs b[:j]   → 2 sequences, 2 indices
2. TRANSITION   match → ↖ +1  |  differ → max(↑, ←)
3. BASE         row 0 / col 0 = 0, DERIVED from "empty prefix"
4. TERMINATION  dp[m][n] — the corner dominates
5. LENS         check ALL THREE source cells are already filled
```

> Your turn: `03 - your challenge.md`. Challenge 5 changes exactly one word of
> the problem and flips both the transition **and** the termination slot.
