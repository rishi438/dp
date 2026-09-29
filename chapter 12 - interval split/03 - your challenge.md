# Chapter 12 · 03 — Your Challenges

Rules: five slots in order, before any code. **Slot 1 must contain the word
"inclusive" or "exclusive".** If it doesn't, stop and rewrite it — every bug in
this chapter starts there.

---

## 1. (easy) State the convention

For `dims = [5, 7]`:

- How many matrices are there? What shape is each?
- Write the state sentence for `dp[0][0]` and **derive** its value from that
  sentence.
- Give the answer to the whole problem and name the exact cell it lives in.

---

## 2. (easy) The only cut

`dims = [10, 20, 30]`.

- List every interval by length.
- There is exactly one cut for the length-2 interval. Compute its cost by hand,
  showing the three dimension indices and *why each one is that index*.
- What is `dp[0][1]`?

---

## 3. (medium) Fill order

`dims = [10, 30, 5, 60]`.

- List every interval in the order a **length-driven** loop visits them.
- Now list the order a naive `for l: for r:` row-major loop would visit them.
- Name the first cell the row-major order gets wrong, and name the specific
  source cell that is still garbage when it is read.
- Finish this sentence precisely: *"Filling by length is a valid order because
  `dp[l][r]` only ever reads intervals that are ______."*

---

## 4. (medium) Implement it

Write the bottom-up version. Test all of these and check every one:

```
[10, 30, 5, 60]      -> 4500
[10, 20, 30]         -> 6000
[30, 1, 40, 10]      -> 700
[40, 20, 30, 10, 30] -> 26000
[10, 30]             -> 0
[]                   -> 0
```

Then write the **top-down memoised** version and confirm it agrees. State in one
sentence what the `lru_cache` is replacing from the bottom-up version.

---

## 5. (medium) TRAP — the endpoint bug

Someone ships this line:

```python
cand = dp[l][k] + dp[k][r] + dims[l] * dims[k + 1] * dims[r + 1]
```

- Which matrix is mishandled, and is it counted twice or skipped?
- On `dims = [10, 30, 5, 60]`, run the buggy transition by hand for `dp[0][2]`
  and report the number it produces.
- Give the corrected right-half index, and state the one-line convention rule
  that would have prevented the bug.

---

## 6. (medium) TERMINATION

- Which exact cell is the answer for a **five-matrix** input? Give it in terms
  of `n`.
- Why is `min(dp[0])` wrong, and what specific number will it almost always
  return? Explain why that makes the bug hard to notice.
- `dp[0][-1]` works here by accident. Describe a variant of this family where
  `dp[0][-1]` is a *different* cell from the correct answer.
  *(Hint: look at what Burst Balloons does to its input before it starts.)*

---

## 7. (medium) Flip the operator

Vale now wants the **most expensive** parenthesisation of `[10, 30, 5, 60]`.

- Which of the five slots change? Name each one that does and each one that
  doesn't.
- What must the sentinel become, and why?
- Compute the answer by hand.

---

## 8. (hard) Burst Balloons

`nums = [3, 1, 5, 8]`, expected `167`.

- Explain in two sentences why the fulcrum *"which balloon bursts FIRST?"*
  does not decompose, but *"which bursts LAST?"* does.
- Why is the input padded with `1`s? Derive what the merge cost becomes for a
  balloon at the very edge.
- Write the state sentence. Is your interval **open** or **closed**? Then write
  the transition and explain why it is `dp[l][i] + dp[i][r]` and **not**
  `dp[l][i] + dp[i+1][r]` — this is the exact opposite of challenge 5's answer,
  and you must be able to say why both are right.
- Implement and verify `[3,1,5,8] → 167`, `[1,5] → 10`, `[5] → 5`, `[] → 0`.

---

## 9. (hard) A new merge price

**Minimum Cost to Cut a Stick.** A stick of length `L = 7` must be cut at
positions `cuts = [1, 3, 4, 5]`, in any order. Cutting a piece costs the
**length of that piece**.

- Identify the fulcrum. (It is *not* "which cut first".)
- What must you add to the `cuts` array before sorting, and why? Compare to
  Burst Balloons' padding.
- Write all five slots, then implement it. Expected: `16`.
- State the complexity in terms of `m = len(cuts)`, and explain why it does
  **not** depend on `L`.

---

## After You Answer

I will diagnose, in this priority order:

1. **Convention** — does Slot 1 say inclusive or exclusive, and does Slot 2
   obey it? Mixed conventions are an automatic fail here.
2. **Base cases** — did you derive the diagonal from the state sentence, and
   did you seed the correct sentinel (`inf` for min, `-inf` for max)?
   *(known weak point #1)*
3. **Termination** — the forced whole stretch, or did you survey with `min`?
   *(known weak point #2)*
4. **Fill order** — length-driven, with a stated reason why every source is
   shorter. "It worked on my test" is not the reason.
5. **Choose vs combine** — is the `min` across cuts and the `+` inside one
   candidate, with the merge cost correctly *inside* because it depends on `k`?
6. **Index derivation** — did you re-derive `dims[l]·dims[k+1]·dims[r+1]` from
   the matrix shapes, or recite it? I will ask you to derive it cold.

Only when the convention discipline is automatic does Mirra let you look into
the pool.
