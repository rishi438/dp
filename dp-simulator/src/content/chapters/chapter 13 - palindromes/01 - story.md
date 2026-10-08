# Chapter 13: Find the longest palindrome

**Keep as many letters as possible so they read the same forwards and backwards.** You may skip letters, but you cannot rearrange them.

A word like `"bab"` is a **palindrome**. A **subsequence** is what remains after skipping some letters without changing their order.

## A small example

```text
Original: b b b a b
Skip a:   b b b   b
Result:   b b b b   -> length 4
```

## What do we decide?

Look at the first and last letters of the part we are solving.

- **They match:** keep both, then solve the letters between them. They add `2` to the length.
- **They differ:** they cannot both be the ends of a palindrome. Try skipping the left letter; also try skipping the right letter. Keep the longer result.

For `"bba"`, the ends differ. Skipping the first `b` leaves `"ba"`, whose best length is `1`. Skipping `a` leaves `"bb"`, whose best length is `2`. So the answer for `"bba"` is `2`.

## What does DP remember?

Let `left` and `right` be positions in the original string, counting from zero.

**`dp[left][right]` stores the longest palindrome length using letters between those positions, including both ends.** It stores a length, not the letters themselves.

Start with the easy answers: one letter has length `1`; an empty part has length `0`. Solve shorter parts before longer ones.

For the whole `"bbbab"`, the outside `b` letters match. The inside is `"bba"`, whose answer is `2`. Therefore the final answer is `2 + 2 = 4`.

## One common mix-up

**Subsequence allows skipping; substring does not.** For `"bbbab"`, the longest palindromic subsequence is `"bbbb"` (length `4`). The longest palindromic substring is `"bbb"` (length `3`). This lesson solves the subsequence problem.

---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 13 · 01 — Story: Mirra, the Mirror-Twin

> Family: **Palindromes / Longest Palindromic Subsequence & Substring.**
> Vale cut her stretch anywhere she liked. Mirra never cuts in the middle.
> She only ever looks at her **two ends at once** — and that one restriction
> changes the door count from `O(n)` back down to `2`.

---

## The Still Pool

Reco crosses Vale's slab and finds a pool so still it has no ripple. A woman
stands at the edge; her reflection faces her and mouths his words back at him
before he speaks them.

She writes a word in the silt:

```
index:   0   1   2   3   4
letter:  b   b   b   a   b
```

**Mirra, the Mirror-Twin**, does not turn around.

> "Strike letters out — as many as you like, from anywhere. What's left must
> read the same forwards and backwards. Leave me the **longest** one."

Reco proposes `bbb` — three. Mirra shakes her head.

> "Look at both ends. Not the middle. **Both ends, at the same time.**"

`b b b a b` → strike the `a` → `b b b b`. **Four.**

---

## The Fulcrum

> ### "Look at `s[l]` and `s[r]`. Do they match?"

That is the entire chapter. Two cases, and they are not symmetric:

```
s[l] == s[r]    Both ends can join the palindrome TOGETHER.
                Step inward from both sides. The world shrinks by TWO.
                    dp[l][r] = 2 + dp[l+1][r-1]

s[l] != s[r]    They can NEVER both be in it (a palindrome's first and last
                letter must be equal). So at least one must be ABANDONED.
                Which one? You don't know. Try both.
                    dp[l][r] = max( dp[l+1][r],      abandon the LEFT end
                                    dp[l][r-1] )     abandon the RIGHT end
```

> **Vale had `r - l` doors. Mirra has two.** Both states are `dp[l][r]`. The
> difference is *which* smaller intervals the transition reaches for:
>
> ```
> Vale   dp[l][k] and dp[k+1][r]   for EVERY k   → a loop → O(n³)
> Mirra  dp[l+1][r-1] / dp[l+1][r] / dp[l][r-1]  → 3 fixed cells → O(n²)
> ```
>
> **The state shape does not determine the complexity. The door count does.**
> Two chapters, identical `dp[l][r]`, an entire factor of `n` apart.

---

## Why the match case is `2 +` and not `max`

This is the *combine* half, and it is mandatory:

```
s[l] == s[r] == 'b'

        b  [ ..... inner ..... ]  b
        ↑                         ↑
        these two letters ALWAYS both fit, no matter what the inner
        palindrome is. Wrap anything palindromic in matching letters and
        it is still palindromic.
```

So you gain **exactly 2, unconditionally**, on top of the best inner answer.
It sits *outside* any choice, because there is no choice — it's Chapter 8's
`grid[r][c] + min(...)` shape all over again.

```
Ch 8   grid[r][c] + min(up, left)      mandatory cost, OUTSIDE
Ch 9   max(leave, take + value)        optional gain,  INSIDE one branch
Ch 10  max over j of (dp[j] + 1)       mandatory +1 on every door
Ch 13  2 + dp[l+1][r-1]                mandatory +2, no choice at all
```

> **TRAP:** when `s[l] == s[r]`, you do **not** also need to consider abandoning
> an end. Taking both matching ends is provably never worse. Writing
> `max(2 + dp[l+1][r-1], dp[l+1][r], dp[l][r-1])` is harmless but redundant;
> writing `max(dp[l+1][r], dp[l][r-1])` *instead of* the `2 +` line is the real
> bug and it silently under-counts.

---

## Subsequence vs Substring — the noun decides everything

Chapter 10 already made you read the noun. Mirra makes you pay for it twice:

| | Longest Palindromic **Subsequence** | Longest Palindromic **Substring** |
|---|---|---|
| skipping allowed? | yes | **no** — must be contiguous |
| `s = "bbbab"` | `4` (`bbbb`) | `3` (`bbb`) |
| state | `dp[l][r]` = best *length* inside `l..r` | `dp[l][r]` = *is* `l..r` itself a palindrome? |
| cell type | a number | a **boolean** |
| mismatch case | `max(drop left, drop right)` | **`False`.** Full stop. No recovery. |
| termination | `dp[0][n-1]` — forced | **survey** all `True` cells for the longest |

> Same fulcrum ("do the ends match?"), same `dp[l][r]` shape, and yet the base
> case, the cell type, the mismatch branch, **and** the termination all differ.
> This is why "it looks like a problem I've seen" is not a solution strategy.
> Re-derive the five slots. Every time.

---

## Fill order — Vale's rule still applies, differently

`dp[l][r]` reads `dp[l+1][r-1]`, `dp[l+1][r]`, `dp[l][r-1]`. Every one is a
**shorter** interval, so Chapter 12's length-driven loop works unchanged.

But Mirra's sources have a second, cheaper ordering available:

```
dp[l][r] reads row l+1 (the row BELOW) and column r-1 (the cell to the LEFT).

    →  loop l DOWNWARD  (n-1 → 0)  so row l+1 is already done
    →  loop r UPWARD    (l+1 → n-1) so column r-1 is already done
```

```python
for l in range(n - 1, -1, -1):      # rows bottom-up: dp[l+1][*] must exist
    for r in range(l + 1, n):       # cols left-to-right: dp[*][r-1] must exist
```

> **TRAP — the reversed loop.** Write `for l in range(n)` and `dp[l+1][r-1]` is
> still zero. You get a wrong answer, no error, and on short strings it often
> looks right. This is Chapter 9's loop-direction disease in a new costume:
> *the direction is semantics, not style.*
>
> Either order (by length, or `l` descending) is correct. Pick one and be able
> to **state why every source is already final**. If you can't state it, you
> don't have it — you have a coincidence.

---

## What changed?

| Chapter 12 (interval split) | Chapter 13 (palindromes) |
|---|---|
| doors = every cut `k` inside | doors = **2**, decided by an equality test |
| `O(n³)` | `O(n²)` |
| merge cost depends on the door | gain is `+2` or nothing — never door-dependent |
| base: the diagonal `= 0` | base: the diagonal `= 1` (a letter is a palindrome) |
| always a number | subsequence → number; substring → **boolean** |

---

## Mirra steps back from the water

> "Every problem where the answer for a stretch depends **only on its two
> edges** is mine. Palindromic subsequence. Palindromic substring. Counting
> palindromic substrings. The fewest insertions to *make* a string palindromic.
> Whether two strings are scrambles of each other.
>
> Ask the ends. They will tell you whether to step inward or to let one go."

> **A gift for later:** LPS of `s` is exactly the LCS of `s` and `reverse(s)`.
> Chapter 7's Twin Scribes could have solved this all along. Two different
> families, one answer — worth proving to yourself, not memorising.

---

## Cliffhanger

Reco leaves the pool. The path lifts out of the valley and the ground becomes
root — one vast tree, its branches forking and never rejoining.

An old voice comes from the trunk:

> "You have walked lines. You have measured stretches. But I do not *have* a
> line. My children do not sit to my left or my right — they hang **below** me,
> and each of them has children of their own.
>
> There is no `i-1` here. There is no loop order to get right. Ask me what the
> answer is at my root, and I must first ask **every one of my children**."

Next: **Root the Elder Tree**, and the day your table stopped being an array.

> Continue to `02 - worked example.md`.


</details>
