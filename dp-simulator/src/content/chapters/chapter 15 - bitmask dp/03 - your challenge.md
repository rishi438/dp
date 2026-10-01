# Chapter 15 · 03 — Your Challenges

Rules: five slots in order, before any code. And before you touch a keyboard,
write the bit-card at the top of your page:

```
mask | (1 << j)       add j
mask & ~(1 << j)      remove j
mask & (1 << j)       is j present?
(1 << n) - 1          the full set
bin(mask).count("1")  how many are present
```

Use this matrix for every question that says "the map":

```
        dist    0     1     2     3
           0    0    10    15    20
           1   10     0    35    25
           2   15    35     0    30
           3   20    25    30     0
```

---

## 1. (easy) Speak in sets

- Write the binary mask for `{0}`, `{0,2}`, `{0,1,3}`, and the full set, for
  `n = 4`. Give each as both bits and a decimal integer.
- Translate into English: `dp[0b1011][3]`.
- Translate into a mask expression: *"town 2 has not yet been visited."*
- Why does **every legal mask** in this problem have bit `0` set? Answer from
  the state sentence, not from the code.

---

## 2. (easy) Base-case derivation

- Derive `dp[1][0]` from the state sentence. Show the reasoning.
- Name **three** cells in the table that describe impossible worlds, and say for
  each one exactly which clause of the state sentence it contradicts.
- What value must those cells hold, and why? Name the law.
- What concrete wrong answer do you get if you initialise the whole table to `0`
  instead? Say what the returned number would be and why.

> Base cases are your #1 weak point, and this chapter's table is *mostly* base
> case — almost every cell must stay unreachable forever.

---

## 3. (medium) Hand-trace by popcount

Using the map, fill in these cells **by hand**. Work in popcount groups.

```
popcount 2:   dp[0011][1] = ___   dp[0101][2] = ___   dp[1001][3] = ___
popcount 3:   dp[0111][2] = ___   dp[1011][3] = ___   dp[1101][3] = ___
popcount 4:   dp[1111][1] = ___   dp[1111][2] = ___   dp[1111][3] = ___
```

Then compute the three termination candidates and give the answer.

Finally: `dp[1111][3] = 75` is the **cheapest** of the three popcount-4 cells,
yet it does not produce the answer. Explain why in one sentence.

---

## 4. (medium) Implement it

Write the bottom-up push version. Verify:

```
the map (4 towns)                -> 80
[[0,1,2],[1,0,3],[2,3,0]]        -> 6
[[0,5],[5,0]]                    -> 10
[[0]]                            -> 0
```

Then state, in one line, **why `for mask in range(1 << n)` is a valid fill
order.** Your answer must be a fact about integers, not "because it works."

---

## 5. (medium) TRAP — the inverted bit test

You are writing the **push** version. Someone writes:

```python
for j in range(n):
    if not mask & (1 << j):
        continue
    ...
```

- What does this version actually do?
- Which of the three bit-tests from the story did they need instead?
- Run it mentally on the map with `n = 4`. What does the function return, and
  why?
- Now state the rule for all three cases: the town you are **standing on**, the
  town you are **moving to**, and the town you **came from** — which must be in
  the mask and which must not?

---

## 6. (medium) TERMINATION — the leg that isn't in the table

- Why can the table not contain a cell meaning "visited everything and returned
  home"? Answer from the state sentence.
- What does `min(dp[FULL])` compute? It is a correct answer to a *different*
  problem — name that problem.
- What does `dp[FULL][0]` return, and why?
- This chapter adds a fifth termination shape to your checklist. State all five
  in one line each (Ch 5/8/12/13, Ch 6/10, Ch 11, Ch 14, Ch 15).

---

## 7. (medium) Two base cases, opposite accounting

Write the **top-down** version with `@lru_cache`.

- What is `go(FULL, i)`? Derive it from *your* state sentence.
- Why is it `dist[i][0]` and not `0`?
- Fill in this table:

  | | bottom-up | top-down |
  |---|---|---|
  | the state sentence measures | | |
  | the base case is | | |
  | the ride home is paid in slot | | |

- Now the real question: if you copy the bottom-up base case into the top-down
  version, what specific thing does the program forget to do? Will it crash, or
  return a plausible wrong number?

> This is the cleanest example in the book of *derive, never copy*. If you get
> this one wrong, we drill base cases for a full session before Chapter 16.

---

## 8. (medium) Drop a dimension — but prove it first

**Assignment Problem.** `cost[worker][job]`, one job each, minimise the total.

- Write the state sentence. It has **one** index, not two.
- Why is the worker index redundant? Give the exact expression that recovers it.
- What is the termination, and why is it a single forced cell here when TSP
  needed a survey plus a final cost?
- Implement and verify:
  `[[9,2,7],[6,4,3],[5,8,1]]` → `9`,
  `[[3,8],[5,1]]` → `4`,
  `[[10,4,6],[8,9,3],[7,5,2]]` → `14`.
- **Now the trap:** explain why you can *not* drop the position index in TSP.
  What does the transition need that the popcount cannot supply?

---

## 9. (hard) Reconstruct the tour

Add breadcrumbs and return the actual route for the map.

- What do you store, and indexed by what? (Careful — the breadcrumb table has
  the same shape as `dp`.)
- Walking backwards, how do you move to the previous mask? Give the expression.
- Your implementation will print `[0, 2, 3, 1, 0]`, not `[0, 1, 3, 2, 0]`.
  Is that a bug? Explain using the word **witness**, then say what property of
  the distance matrix makes both equally valid.
- What single change makes it return the other direction?

---

## 10. (hard) A different set entirely

**Partition to K Equal Sum Subsets.** Given `nums` and `k`, decide whether
`nums` can be split into `k` subsets with equal sums.

- What is the set here? It is not towns.
- You need **one extra piece of state** beyond the mask. Name it, and explain
  why the mask alone is insufficient. *(Hint: it is the same reason TSP keeps
  its position index.)*
- Derive the base case and the termination.
- What must you check **before** starting the DP at all, and why does that check
  save you from an entire class of wrong answers?
- Implement and verify: `nums=[4,3,2,3,5,2,1], k=4` → `True`;
  `nums=[1,2,3,4], k=3` → `False`; `nums=[1,1,1,1], k=4` → `True`;
  `nums=[1,1,1,1], k=3` → `False`.

---

## 11. (hard) Read the constraint line

For each problem below, say **yes/no: is this a bitmask DP?** — and justify from
the constraints alone, in one line each. Do not solve them.

```
(a)  n ≤ 18 cities, find the cheapest tour
(b)  n ≤ 10⁵ items, pick a max-value subset under a weight limit
(c)  n ≤ 20 strings, stitch them into the shortest string containing all
(d)  n ≤ 12 people, n hats, count the ways to give everyone a distinct hat
(e)  n ≤ 2000 array, longest increasing subsequence
(f)  n ≤ 16 nodes, count Hamiltonian paths
```

Then finish the sentence: *"When I see `n ≤ 20` in the constraints, my first
hypothesis is ______, because ______."*

---

## After You Answer

I will diagnose, in this priority order:

1. **Base cases** — `dp[{0}][0] = 0`, everything else `inf`, and can you name
   *why* each impossible cell is impossible? And did you derive the top-down
   base separately instead of copying? *(known weak point #1)*
2. **Termination** — survey **plus** the ride home, added outside the table.
   Not `min(dp[FULL])`, not `dp[FULL][0]`. *(known weak point #2)*
3. **Bit hygiene** — the three tests (standing on / moving to / came from), and
   did you parenthesise `mask & (1 << j)`?
4. **Fill order** — can you state the one-line integer fact that proves
   `range(1 << n)` is a topological sort? And did you keep push and pull
   separate?
5. **State sufficiency** — do you know why the position index survives in TSP
   and dies in Assignment? Derived, not pattern-matched.
6. **Complexity honesty** — can you say out loud that this DP is still
   exponential, and name what it actually bought you?

Then we drill whichever bled most, and the counting-house doors open.
