# Chapter 18 · 03 — Your Challenges

Rules, and they are different this time:

```
1. Write the SLOW version first. Test it. Keep it.
2. Write the fast version.
3. Assert they agree on randomised inputs BEFORE you believe either one.
```

If you skip step 1 in this chapter I will not grade the answer.

---

## 1. (easy) Read the overlap

`dp[i] = nums[i] + max(dp[i-k .. i-1])`, with `k = 3`.

- Write out the exact index range scanned by `dp[7]` and by `dp[8]`.
- How many indices do they share? How many enter, how many leave?
- How many `max` comparisons does the slow version perform in total, in terms of
  `n` and `k`?
- With `n = k = 10⁵`, how many operations is that? State the number.

---

## 2. (easy) The fifth kind of failure

- List the four failure modes the Invariant Lens diagnoses, and the symptom of
  each.
- State the fifth, which the Lens **cannot** see, and say why it cannot.
- Finish this sentence: *"All five slots can be correct and the solution still
  rejected, because ______."*

---

## 3. (easy) Base and termination, one more time

For `nums = [1, -1, -2, 4, -7, 3]`, `k = 2`:

- Derive `dp[0]` from the state sentence. Why is it **not** `0`?
- Which chapter has the identical base case, and is that a reason to copy it?
  Answer honestly.
- Is the endpoint **forced** or **free**? Quote the clause of the problem
  statement that decides it.
- `dp = [1, 0, -1, 4, -3, 7]`, so `max(dp)` and `dp[-1]` are both `7`. Construct
  the input that separates them and give both numbers.

> This is the last time I ask you these two. They have been your weak points
> since Chapter 0.

---

## 4. (medium) Hand-trace the deque

`nums = [1, -1, -2, 4, -7, 3]`, `k = 2`.

At every `i` from `0` to `5`, write:

```
i | expired from front | window max | dp[i] | evicted from back | dq after
```

Then answer:
- At `i = 3`, the deque is emptied completely. Which two indices die, and what
  do they have in common?
- State the **dominance rule** in one sentence, and give the two reasons a
  dominated candidate can never win again.
- Count total pushes and total pops across the whole run. Why does this justify
  the word **amortised** rather than "constant"?

---

## 5. (medium) Implement both, then prove it

Write `jump_game_vi_slow` and `jump_game_vi`. Verify both on:

```
([1,-1,-2,4,-7,3], 2)          -> 7
([10,-5,-2,4,0,3], 3)          -> 17
([1,-5,-20,4,-1,3,-6,-3], 2)   -> 0
([5], 1)                       -> 5
([1,-1,-2,4,-7,3,-100], 2)     -> -93
```

Then write the randomised agreement test (300 trials, `n ≤ 30`,
`1 ≤ k ≤ n`, values in `[-20, 20]`) and run it.

Finally: put the two functions side by side and list **exactly which of the five
slots changed**. Your answer should be very short.

---

## 6. (medium) TRAP — the four steps, out of order

The correct order is: expire front → read front → evict back → push `i`.

For each mutation, predict the behaviour, then run it and report the output on
`([1,-1,-2,4,-7,3], 2)`:

- **(a)** Push `i` before reading the front.
- **(b)** Omit the front-expiry loop entirely.
- **(c)** Do the back eviction before reading the front.

For **(a)**, describe in one sentence the physically impossible move it allows.
For **(b)**, what does the function now compute? Name the problem it solves.

---

## 7. (medium) TRAP — indices vs values, and the bound

- Why must the deque hold **indices** and not `dp` values? Give the specific
  line that becomes unwritable otherwise.
- Jump Game VI expires with `dq[0] < i - k`. Sliding Window Maximum expires with
  `dq[0] <= i - k`. **Both are correct.** Explain the difference by writing out
  each problem's window definition explicitly.
- Which earlier chapter drilled this exact discipline, and what was it called
  there?
- What is the `<` vs `<=` choice on the *back* eviction, and what does it
  actually decide?

---

## 8. (medium) Rope 1 — Fortuna's homework

**New 21 Game.** Finish what Chapter 17 left open.

- Write the naive `O(n · maxPts)` version and verify:
  `(21,17,10) → 0.7327777870686082`, `(10,1,10) → 1.0`,
  `(6,1,10) → 0.6000000000000001`.
- Now write the running-sum version. State precisely:
  - what **enters** the window at step `i`, and under what condition;
  - what **leaves** the window at step `i`, and under what condition.
- Why must both conditions be derived from the *same* predicate rather than
  assumed symmetric? What drifts if you get one wrong?
- Your two versions will print `0.6000000000000001` and `0.6`. Is one of them
  wrong? Explain, then state the rule for comparing probability DPs.
- Why is a **deque** unnecessary here? One sentence, about `max` vs `+`.

---

## 9. (hard) Rope 2, standalone

**Sliding Window Maximum.** `nums`, window size `k`, return the max of every
window.

- Write it with no DP around it. Verify:
  `([1,3,-1,-3,5,3,6,7], 3) → [3,3,5,5,6,7]`, `([1],1) → [1]`,
  `([9,8,7,6],2) → [9,8,7]`.
- Prove the deque invariant: state the two clauses that must hold before you
  read the front, and say which line of code maintains each.
- Why is a **heap** the wrong tool here? Your answer must mention what the
  deque knows about the window's left edge that a heap does not.
- What is the worst-case size of the deque, and what input achieves it?

---

## 10. (hard) Rope 3 — and what it costs you

**LIS in `O(n log n)`.**

- Write the state sentence for `tails[j]`. It is **not** Chapter 10's `dp[i]`.
- Implement it with `bisect_left` and verify:
  `[10,9,2,5,3,7,101,18] → 4`, `[0,1,0,3,2,3] → 4`, `[7,7,7,7] → 1`, `[] → 0`.
- `bisect_left` vs `bisect_right`: which gives strictly increasing and which
  gives non-decreasing? Test on `[2,2,3]` and report both answers.
- Print the final `tails` for `[10,9,2,5,3,7,101,18]`. You will get `[2,3,7,18]`,
  which *is* a valid LIS. Now find an input where the final `tails` is **not** a
  valid subsequence of `nums` at all, and show it.
- Swift says this is *not the same DP made faster*. Defend that claim in two
  sentences, then state exactly what you traded away and when you would refuse
  the trade.

---

## 11. (hard) Diagnose, don't optimise

For each transition below, say **which rope applies** (running sum / prefix sum
/ monotonic deque / monotonic stack / binary search / Knuth / **none**), and
give the resulting complexity. One line of justification each. Do not implement.

```
(a)  dp[i] = nums[i] + max(dp[i-k .. i-1])
(b)  dp[i] = Σ dp[i-k .. i-1]
(c)  dp[i] = min over j<i with nums[j] < nums[i] of (dp[j] + 1)
(d)  dp[l][r] = min over k in [l,r) of (dp[l][k] + dp[k+1][r] + cost(l,r))
(e)  dp[i] = max over j in [0, i) of (dp[j] + (i - j) * slope[j])
(f)  dp[i] = Σ dp[j] for all j in an arbitrary precomputed index list
(g)  dp[i] = nums[i] + min(dp[i-1], dp[i-2])
```

For **(c)**, explain why the window trick fails and what had to change instead.
For **(d)**, state the extra thing you must **prove** before using Knuth, and
what happens if you assume it without proof.
For **(g)**, say why no rope is needed at all.

---

## 12. (hard) Accelerate something you already built

Go back to **Chapter 9's 0/1 knapsack** or **Chapter 12's matrix chain** — your
choice.

- Write out its transition and identify the scan.
- Apply the decision table. Is there a rope? If yes, name it and state the new
  complexity. If no, **say so and justify it** — "no trick exists here" is a
  complete and correct answer, and recognising it is the skill being tested.
- Either way, state what the `states` and `transition cost` factors are, before
  and after.

---

## 13. (graduation) The whole book, out loud

No code. Write these from memory, then check yourself against
`02 - worked example.md`'s final checklist.

- **(a)** The five slots, in order, one line each.
- **(b)** The Invariant Lens: three phases, their DP names, and the failure
  symptom each one produces.
- **(c)** The three transition operators and when each applies.
- **(d)** All **seven** termination shapes, with one chapter as an example of
  each.
- **(e)** The one complexity formula, and one chapter that pays on the left
  factor and one that pays on the right.
- **(f)** Name all eighteen characters and their family, in order.

Then, in your own words and in no more than five sentences:

> **Why is "derive the base case, never copy it" the single most repeated
> instruction in this book?**

---

## After You Answer

I will diagnose, in this priority order:

1. **Discipline** — did you write the slow version first and the randomised
   agreement test at all? In this chapter that outranks correctness.
2. **Slot preservation** — can you show that Slots 1, 3 and 4 are unchanged
   between your two versions? If the state sentence moved, it is not an
   optimisation.
3. **Order** — the four deque steps, and can you say what each mutation breaks?
4. **Bound derivation** — `<` vs `<=`, derived from your own window definition
   and not copied from another problem.
5. **Base and termination** — one final check on the two things you have gotten
   wrong most often since Chapter 0.
6. **Honesty about limits** — do you know when *no* rope applies, and can you
   say "`O(n²)` is the price" without flinching?

And then we start again at Chapter 0's challenges, which you still have not
answered — because reading eighteen chapters is not the same as owning them.
