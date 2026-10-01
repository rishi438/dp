# Chapter 7 · 01 — Story: The Twin Scribes

> Family: **Two sequences compared.**
> The day `dp[i]` grew a second index — and the fulcrum learned to ask two
> questions at once.

---

## Two Scrolls, One Story

The royal library burns. Two scribes, **Alba** and **Beta**, each rewrite the
King's chronicle from memory. Neither is complete. Neither is wrong — they
simply remembered different parts.

```
Alba's scroll:   a b c d e
Beta's scroll:   a c e
```

The archivist gives Reco the task:

> "Find the **longest story told by both scrolls** — the longest sequence of
> events that appears in Alba's scroll *and* in Beta's, **in the same order**.
> Events may be skipped. They may not be reordered."

Here the answer is `a c e`, length **3**.

---

## Why Reco's Old Tools All Break

Reco tries everything he knows and fails three times:

**Attempt 1 — Kade's streak.** *"Find the longest matching run!"*
Wrong. `a c e` is not contiguous in Alba's scroll (`b` and `d` sit between
them). This family **allows gaps**. The word is not *substring*, it is
**subsequence**.

> ```
> SUBSTRING    = contiguous. No gaps.      → Kade, Chapter 6
> SUBSEQUENCE  = order preserved, gaps OK. → the Twin Scribes, Chapter 7
> ```

**Attempt 2 — Corin's coins.** *"Loop over the doors!"* But what is a door
here? Corin's doors came from one list. Here there are **two** lists, and a
decision has to be made about **both at once**.

**Attempt 3 — a single index.** Reco writes `dp[i]`. Then he asks: *"i into
which scroll?"* He has two scrolls. One index cannot address two positions.

> **That's the whole discovery of this chapter:**
> **Two sequences → two indices → a 2D table.**
> `dp[i][j]` = an answer about *Alba's first `i`* and *Beta's first `j`*.

---

## The Fulcrum, Now Asking About Two Things

The archivist teaches Reco to point at the **last character of each scroll**
simultaneously:

> ### "What happened to the LAST character of each scroll?"

Look at the ends. Exactly two situations exist:

**Case 1 — the two ends MATCH.**

```
Alba:  ... a c e
Beta:  ... a c e
             ↑ both end in 'e'
```

Then that `e` is **free**. There is never a reason to throw away a matching
pair — taking it can only help. So: consume **both**, add 1, and recurse on
what's left.

```
dp[i][j] = dp[i-1][j-1] + 1
```

**Case 2 — the two ends DIFFER.**

```
Alba:  ... a b d
Beta:  ... a c e
             ↑ 'd' vs 'e' — they cannot both be in the common story's tail
```

At least one of them is useless. But *which one*? Reco doesn't know — so he
**tries both and keeps the better**:

```
dp[i][j] = max( dp[i-1][j],     # throw away Alba's last char
                dp[i][j-1] )    # throw away Beta's last char
```

> **Two doors when they differ, one door when they match.** That asymmetry is
> the signature of this entire family. Edit Distance, Interleaving String,
> Distinct Subsequences — all of them are this shape with a different filling.

---

## The Grid You're Actually Filling

A 2D state means a 2D picture. Every cell looks **up**, **left**, and
**diagonally up-left** — never forward:

```
            ""   a    c    e          ← Beta
       ""  [ 0 ][ 0 ][ 0 ][ 0 ]
        a  [ 0 ][ 1 ][ 1 ][ 1 ]
        b  [ 0 ][ 1 ][ 1 ][ 1 ]
        c  [ 0 ][ 1 ][ 2 ][ 2 ]
        d  [ 0 ][ 1 ][ 2 ][ 2 ]
        e  [ 0 ][ 1 ][ 2 ][ 3 ]  ← the answer, bottom-right
        ↑
      Alba
```

```
MATCH  → come from the DIAGONAL (↖), +1
DIFFER → come from UP (↑) or LEFT (←), take the max
```

If you remember nothing else: **match means diagonal.** Every two-sequence
problem you will ever meet obeys that arrow.

---

## The Row and Column of Zeros (the base case everyone fumbles)

Reco sizes his table `len(a) × len(b)` and immediately crashes on `dp[i-1][j-1]`
when `i = 0`.

The archivist adds a **phantom row and column** representing *the empty
prefix*:

> `dp[0][j]` = "longest common story between **nothing** and Beta's first `j`"
> = **0**. You cannot share a story with an empty scroll.
> Same for `dp[i][0]`.

So the table is `(m+1) × (n+1)`, and row 0 / column 0 are all zeros.

```python
dp = [[0] * (n + 1) for _ in range(m + 1)]   # base case built into the shape
```

> **This is the derivation, not a copied ritual:** the zeros are the *meaning*
> of "empty prefix," and the `+1` in the dimensions is what makes `i-1` and
> `j-1` legal when `i` and `j` are 1.

**The off-by-one that follows:** because row `i` of the table refers to the
*first `i` characters*, the character itself is `a[i-1]`, not `a[i]`.

```
dp[i][j]  ↔  a[i-1]  and  b[j-1]
```

Say it out loud once. This single shift is the most common bug in the entire
family, and it is on your known weak-point list.

---

## Termination — and Why It's Different From Kade

> The answer is `dp[m][n]`. **Not** `max(dp)`.

Why? Because `dp[m][n]` means *"using ALL of Alba and ALL of Beta"* — and
every shorter prefix pair is already accounted for *inside* it. A common
subsequence of `a[0..3]` and `b[0..2]` is still a valid common subsequence of
the full strings, so `dp[m][n]` is already `>=` it. The bottom-right corner
**dominates** the whole table.

```
Ch 5 Coin Change  → dp[amount]   mandatory endpoint
Ch 6 Kadane       → max(dp)      run may end anywhere
Ch 7 LCS          → dp[m][n]     the corner dominates every other cell
```

Three chapters, three different termination slots, three different reasons.
**Never reach for a habit here.**

---

## Cliffhanger

Alba and Beta compared two *scrolls*. But the cartographers unroll something
worse — a **map**. Rows and columns of real terrain, each square charging a
toll, and a warden who only permits two moves:

> "You may step **right**. You may step **down**. Nothing else. Ever."

Next: **Gridlock, the Maze Warden**. The table stops being an abstraction and
becomes the map itself.

> Continue to `02 - worked example.md`.
