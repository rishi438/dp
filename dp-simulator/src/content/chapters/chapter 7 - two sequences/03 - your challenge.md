# Chapter 7 · 03 — Your Challenge (Easy → Hard)

> Five slots before any code: FULCRUM → STATE → TRANSITION → BASE → TERMINATION.
> Write under each prompt, then say **"done"**.

---

## Challenge 1 (Easy) — Fill the grid

`a = "abc"`, `b = "ac"`. Hand-fill the whole `(4 × 3)` table.

```
        ""   a    c
   ""  [  ][  ][  ]
    a  [  ][  ][  ]
    b  [  ][  ][  ]
    c  [  ][  ][  ]
```

For each non-zero cell, write which arrow you followed: `↖`, `↑`, or `←`.
Then read the `↖` jumps off the table and state the actual subsequence.

**Your answer:**


---

## Challenge 2 (Easy) — The off-by-one contract

`dp[3][2]` is being computed for `a = "abcde"`, `b = "ace"`.

1. Which exact characters are compared? Write them as `a[?]` and `b[?]`
   **and** give the literal letters.
2. Explain in one sentence why the index is `i-1` and not `i`.
3. What breaks if you write `if a[i] == b[j]`? Name the exception and say on
   which cell it first fires.

**Your answer:**


---

## Challenge 3 (Medium) — Derive the base, don't copy it

Problem: **Edit Distance.** Minimum insert/delete/replace operations to turn
`a` into `b`.

Do NOT write code yet. Answer only:

1. What is `dp[0][j]`, and **why**? Derive it from your own state sentence.
2. What is `dp[i][0]`, and **why**?
3. In LCS both were `0`. Here they are not. **Explain in one sentence why the
   same-shaped cell holds a different value**, without mentioning LCS.

> This is the third chapter running that tests base-case derivation. It is
> your #1 historical weak point. Derive, do not recall.

**Your answer:**


---

## Challenge 4 (Medium) — Edit Distance, full solve

Now write all five slots and the code for Edit Distance.
`a = "horse"`, `b = "ros"` → expected `3`.

Then answer: LCS had **2 doors** in the DIFFER case. Edit Distance has
**3**. Name each door in plain English (what real-world operation is it?)
and say which `dp` cell each one reads.

```
FULCRUM     =
STATE       =
TRANSITION  =
BASE CASE   =
TERMINATION =
```

**Your answer:**


---

## Challenge 5 (Hard / TRAP) — One word changes everything

Problem: **Longest Common SUBSTRING** (not *subsequence*).
`a = "abcdxyz"`, `b = "xyzabcd"` → expected `4` (`"abcd"`).

1. What single word changed from the worked example?
2. In the DIFFER case, LCS took `max(↑, ←)`. Here you must write something
   completely different. What, and **why**? (Think about what "contiguous"
   forbids.)
3. **The trap:** termination also changes. What is it now, and why is
   `dp[m][n]` wrong here but right for LCS?
4. Which earlier chapter's character just walked back into the room?
5. Write the code with all five slots.

**Your answer:**


---

## Challenge 6 (Hard / TRAP) — Prove the loop order

You wrote a 2D DP. Now justify it.

1. List **every** `dp` cell your Edit Distance transition reads.
2. For each one, prove it is **already filled** when you read it, given your
   loop order (`for i:` outer, `for j:` inner, both ascending).
3. Now sabotage it: change the inner loop to `for j in range(n, 0, -1)`
   (descending). Which of your source cells becomes stale? What wrong answer
   does that produce on `a="ab"`, `b="ab"`?
4. Fill the Lens table for your own code:

| Loop-invariant phase | Your code's version | Why it's true |
|----------------------|---------------------|---------------|
| **Initialization**   |                     |               |
| **Maintenance**      |                     |               |
| **Termination**      |                     |               |

> Do this carefully. In **Chapter 12 (Interval DP)** the obvious loop order is
> *actually wrong*, and this exercise is the only defence you'll have.

**Your answer:**


---

## After You Answer

I will check, in priority order:

1. **C3** — base-case derivation, third strike. If you derive it cleanly here,
   I'll stop hammering it and mark the weak point closed.
2. **C5.3** — termination. Three chapters, three different answers
   (`dp[amount]`, `max(dp)`, `dp[m][n]`), and C5 makes you switch *mid-family*.
   This is the real test of whether you read problems or pattern-match them.
3. **C2 and C6** — the off-by-one contract and loop-order proof. Both are on
   your known weak-point list, and both get much more dangerous in Chapter 12.
4. Drill whatever wobbled.
5. Then unlock **Chapter 8 — Gridlock, the Maze Warden**, where the table stops
   being an abstraction and *becomes the map itself*.

Write your answers. Then say **"done"**.
