# Chapter 13 · 03 — Your Challenges

Rules: five slots in order, before any code. **Slot 1 still has to say
"inclusive."** And before you write a single line, answer this out loud:
*is the thing I'm asked for a SUBSEQUENCE or a SUBSTRING?*

---

## 1. (easy) Read the noun

For `s = "bbbab"`:

- What is the longest palindromic **subsequence**? Write it out.
- What is the longest palindromic **substring**? Write it out.
- In one sentence each, say which *branch of the transition* is responsible for
  the difference.

---

## 2. (easy) Base-case derivation — both of them

For `s = "cbbd"`:

- Derive `dp[1][1]` from the state sentence. Show the reasoning.
- Now derive `dp[2][1]` — a cell where `l > r`. What window does it describe,
  and what is its value? **Derive it; do not say "it's just zero because the
  array is zeros."**
- Chapter 12's diagonal was `0` and this chapter's is `1`. Both are `dp[i][i]`.
  Explain in two sentences why the same cell has opposite values, using the two
  state sentences.

> Base cases are your #1 recurring weak point, this chapter has two of them, and
> one of them is invisible in the bottom-up code.

---

## 3. (medium) Hand-trace the table

`s = "agbdba"`.

Fill this by hand — no code. Mark each cell `M` (match) or `X` (mismatch):

```
        r=0  r=1  r=2  r=3  r=4  r=5
 l=0
 l=1
 l=2
 l=3
 l=4
 l=5
```

Then: state the answer, name the cell it lives in, and write out the actual
palindrome. Finally, name one cell whose value is *never read* by the path to
the answer.

---

## 4. (medium) Implement it twice

Write both, and confirm they agree on every input:

1. bottom-up with `l` descending / `r` ascending
2. top-down memoised

```
"bbbab" -> 4     "cbbd"  -> 2     "agbdba" -> 5
"abcde" -> 1     "aaaa"  -> 4     "a" -> 1     "" -> 0
```

Then answer: **which base case did the top-down version force you to write that
the bottom-up version let you skip?** Why did the array hide it?

---

## 5. (medium) TRAP — the loop direction

Take your working bottom-up solution and change `for l in range(n-1, -1, -1)`
to `for l in range(n)`.

- Run it on `"bbbab"`. What does it return?
- Explain the failure using the phrase *"`dp[l+1][r-1]` is not final yet."*
- Which Invariant Lens phase does this break — Initialization, Maintenance, or
  Termination?
- Chapter 9 taught that loop direction is **semantics, not style**. Restate that
  lesson in terms of this bug, in one line.

---

## 6. (medium) TRAP — the match branch

Someone replaces the match branch with:

```python
if s[l] == s[r]:
    dp[l][r] = max(dp[l+1][r], dp[l][r-1])      # same as the mismatch branch
```

- On `"aaaa"`, what does this return? Compute it by hand.
- Is the error an over-count or an under-count? Why does the direction make
  sense?
- Separately: is `max(2 + dp[l+1][r-1], dp[l+1][r], dp[l][r-1])` wrong? Answer
  yes/no and justify in one sentence.

---

## 7. (medium) TERMINATION — the same table, a different exit

- For LPS, which cell is the answer, and why is there nothing to survey?
- For longest palindromic **substring**, the state is still `dp[l][r]`. Why can
  you **not** just read `dp[0][n-1]`? What must you do instead?
- State the general rule this chapter adds to your termination checklist, in
  one line. *(Hint: it is about what the CELL holds, not about the table's
  shape.)*
- On `"babad"` the substring version returns `"aba"`, not `"bab"`. Is that a
  bug? Explain using the word **witness**, then say exactly what one-character
  change would make it return `"bab"` instead.

---

## 8. (hard) The boolean twin

Implement **longest palindromic substring** from scratch. Do not copy the LPS
code and patch it — re-derive all five slots.

- What does a cell hold now?
- Write the match branch. Why does it need `r - l == 1 or dp[l+1][r-1]` and not
  just `dp[l+1][r-1]`? Derive the `r - l == 1` case by hand on `"bb"`.
- What is the mismatch branch, and why is there no recovery?
- Verify: `"babad"` → length 3, `"cbbd"` → `"bb"`, `"ac"` → `"a"`,
  `"a"` → `"a"`, `""` → `""`.

Then, with only a two-line change to that same code, solve **Count Palindromic
Substrings**. Verify: `"aaa"` → `6`, `"abc"` → `3`, `"abba"` → `6`.

---

## 9. (hard) Two derivations, no new table

**(a) Minimum insertions to make a string palindromic.**
Prove — don't assert — that the answer is `n - LPS(s)`. Then verify:
`"zzazz"` → `0`, `"mbadm"` → `2`, `"leetcode"` → `5`, `""` → `0`.

**(b) The Chapter 7 gift.**
Show that `LPS(s) == LCS(s, reverse(s))`. Work it on `"bbbab"` by hand: build
the LCS table for `"bbbab"` vs `"babbb"` and confirm it reaches `4`.
Then answer: *why* does reversing turn a mirror problem into a two-sequence
problem? Two sentences.

---

## 10. (hard) A different question, same fulcrum

**Palindrome Partitioning II.** `s = "aab"`. Cut `s` into pieces such that every
piece is a palindrome. Find the **minimum number of cuts**. (Expected: `1` —
`"aa" | "b"`.)

- This needs **two** DPs stacked. Name both state sentences.
- Which of the two is Mirra's? Which is a Chapter 5 / Chapter 1 shape?
- What is the base case of the outer DP, and why is `-1` involved? Derive it.
- Where does the answer live?
- Implement and verify: `"aab"` → `1`, `"a"` → `0`, `"abccba"` → `0`,
  `"abcde"` → `4`.

> This is the first problem in the book where one table feeds another. Get the
> *order* right: which one must be fully built before the other starts?

---

## After You Answer

I will diagnose, in this priority order:

1. **Base cases** — did you derive *both*, including the invisible `l > r`
   empty window? Did you notice Ch 12's diagonal is `0` and Ch 13's is `1`, and
   can you say why? *(known weak point #1)*
2. **Termination** — forced cell for LPS, survey for substring. Did you
   re-derive it, or assume the table shape decides it?
   *(known weak point #2)*
3. **Subsequence vs substring** — did you read the noun before choosing a
   transition? This is the whole chapter.
4. **Loop direction** — can you state, for every source cell, why it is already
   final? "It passed my test" is not an answer.
5. **Choose vs combine** — is the `+2` outside all choice (because it is
   unconditional), and the `max` only in the mismatch branch?
6. **Witness vs value** — do you understand that `"aba"` and `"bab"` are both
   correct, and that your tie-break rule decides which you get?

Then we drill whichever bled most — and only then does the ground turn to root
and Chapter 14 begins.
