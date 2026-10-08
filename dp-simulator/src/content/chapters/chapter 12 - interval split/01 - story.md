# Chapter 12: Choose which multiplication happens last

**Multiply a chain of matrices with the least work. Keep their order, but choose where to put the brackets.**

A matrix is a rectangular table of numbers. Multiplying a `p x q` matrix by a `q x r` matrix produces a `p x r` matrix and takes `p * q * r` basic multiplications.

For three matrices:

```text
A: 10 x 30    B: 30 x 5    C: 5 x 60

(A B) C: 10*30*5 + 10*5*60  =  4,500
A (B C): 30*5*60 + 10*30*60 = 27,000
```

The result is the same, but doing A with B first takes much less work.

## What are the choices?

Ask: **which two completed groups will we multiply in the final step?**

For A, B, C, there are two choices: `A | BC` or `AB | C`. First calculate the cheapest way to finish each group. Then add the cost of multiplying those two results.

```text
one choice's cost = left group's cost + right group's cost + final multiplication
```

Try every possible split and keep the smallest total.

## What do we save?

`dp[l][r]` = cheapest cost to multiply matrices from index `l` through index `r`, including both ends.

A consecutive section like this is called an **interval**. We save answers for short intervals so longer ones can reuse them.

One matrix alone needs no multiplication: `dp[i][i] = 0`. Next solve every group of two matrices, then every group of three, and so on. For the example, AB costs 1,500 and BC costs 9,000. Those answers let us compare both choices for ABC.

Return the answer for the entire chain: `dp[0][n - 1]`. Here it is **4,500**.

**Common mistake:** computing a long group before its smaller groups are ready. Fill by group length, starting with the shortest.


---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 12 · 01 — Story: Vale, the Splitter

> Family: **Interval DP / Matrix Chain, Burst Balloons.**
> Modus's mask remembered the last thing you *did*. Vale doesn't care what you
> did. She holds a **stretch of the world** and asks one thing: *where was the
> last cut?*
>
> This is the chapter where `dp[i]` becomes `dp[l][r]` — and where filling the
> table left to right becomes **illegal**.

---

## The Stone Slab

At dusk Reco reaches a river spanned by a single slab. A woman is scoring it
with a chisel. Beside her, three stone blocks:

```
        A           B           C
     10 × 30     30 × 5       5 × 60
```

**Vale, the Splitter**, speaks without looking up.

> "Fuse them in order — `A`, then `B`, then `C`. You may not reorder them.
> Fusing an `p × q` block to a `q × r` block costs `p · q · r` chisel strokes
> and leaves a `p × r` block.
>
> You may only choose **where the parentheses go**. Give me the cheapest total."

Reco says: obviously fuse the small ones first. Vale lets him.

```
(A · B) · C      = 10·30·5  + 10·5·60   = 1500 + 3000  =  4500
A · (B · C)      = 30·5·60  + 10·30·60  = 9000 + 18000 = 27000
```

Same result. Same order. **Six times the work.** The parentheses are the whole
problem.

> "Greed told you to fuse the cheapest pair first. Here it was right by
> accident. It will not be right next time. What you must ask is not *which
> fusion is cheapest now* — it is **which fusion is LAST**."

---

## The Fulcrum

> ### "Inside the stretch `l … r`, where was the **last cut**?"

Pick a cut point `k`. Everything to the left of the cut gets fully solved into
one block. Everything to the right gets fully solved into one block. Then you
pay once to fuse those two.

```
        l ────────── k │ k+1 ────────── r
        └── solved ──┘ │ └── solved ──┘
                       │
             the LAST fusion happens here
```

Every `k` from `l` to `r-1` is a door. That's up to `r - l` doors — **data-
shaped like Lissa's loop**, but indexed over *positions inside the interval*
rather than over predecessors.

> **Why the LAST cut and not the first?** Because the last cut is the only one
> that leaves you two *independent, already-finished* subproblems. Any earlier
> cut leaves the two halves still entangled with each other. This is the same
> instinct as *"what was my LAST hop"* from Chapter 0 — Vale just applies it to
> a range instead of a point.

---

## The State grows a second endpoint

`dp[i]` cannot express this. "The best for the first `i` blocks" can never talk
about a stretch that starts in the middle — and the right half of a cut *always*
starts in the middle.

```
dp[l][r] = the cheapest way to fully fuse blocks l through r, inclusive.
```

> **The two indices are NOT two progress counters.** In Chapter 9, `dp[i][w]`
> meant *"i items considered, w budget left"* — two independent dials. Here
> `l` and `r` are the **two ends of one object**. You cannot advance one
> without changing which object you're talking about.
>
> This distinction decides your fill order, and getting it wrong is the
> chapter's central trap.

---

## Fill order: length, not position

Which cells does `dp[l][r]` read? `dp[l][k]` and `dp[k+1][r]` for every `k`.
Both are **strictly shorter** intervals — but one of them starts at a *larger*
`l` than the cell you're filling.

```
To compute dp[0][2] you need dp[1][2].
A row-by-row loop  (l = 0, 1, 2 ... then r inside)  computes dp[0][2] FIRST.
dp[1][2] is still garbage at that moment.
```

So you cannot iterate by position. You iterate by **length**:

```
length 1:   [A]     [B]     [C]          ← free, the base case
length 2:   [A B]   [B C]                ← needs only length-1 cells
length 3:   [A B C]                      ← needs length-1 and length-2 cells
```

```python
for length in range(2, n + 1):
    for l in range(0, n - length + 1):
        r = l + length - 1
        ...
```

> **The Maintenance clause, stated precisely:** when you fill an interval of
> length `L`, every interval of length `< L` is already final. Both `dp[l][k]`
> and `dp[k+1][r]` are shorter than `[l, r]` for every legal `k`. That is the
> proof, and it is why the diagonal order is the *only* natural one.
>
> (Top-down memoisation sidesteps this entirely — recursion discovers the order
> for you. If the diagonal confuses you, write it top-down first. Chapter 2's
> notebook still works.)

---

## What changed?

| Chapter 11 (state machine) | Chapter 12 (interval split) |
|---|---|
| `dp[i][mask]` — position + mode | `dp[l][r]` — two ends of **one** stretch |
| doors fixed by the diagram | doors = every cut point inside the stretch |
| fill order: time, left to right | fill order: **interval length**, diagonally |
| rolled to `O(1)` space | full `O(n²)` table — rolling loses information |
| `O(n)` time | `O(n³)` time |

> **Why rolling fails here.** Chapter 4's cloth worked because the window
> reached a fixed distance back. An interval reads sources scattered across
> *many* rows and columns at once. There is no fixed-width window to keep.
> `O(n²)` space is the honest price of this family.

---

## TRAP 1 — the endpoint convention

This is the bug that eats the most hours in this family, and it produces **no
error message**.

```python
dp[l][k] + dp[k][r]       # WRONG for inclusive intervals — block k counted TWICE
dp[l][k] + dp[k+1][r]     # RIGHT for inclusive intervals — k ends the left half
```

Before you type anything, write two lines on paper and keep them visible:

```
1. My interval [l, r] is INCLUSIVE of both ends.
2. The cut k belongs to the LEFT half; the right half begins at k+1.
```

Half-open conventions (`[l, r)`) are perfectly valid — but then `dp[l][k] +
dp[k][r]` is the *correct* line and `k+1` is the bug. **Pick one convention,
write it down, never mix.** Most interval failures are convention failures, not
logic failures.

---

## TRAP 2 — the off-by-one in the dimension array

Matrix chain has a second indexing trap stacked on the first. With
`dims = [10, 30, 5, 60]`, there are **`len(dims) - 1 = 3` matrices**, and:

```
matrix i has shape   dims[i] × dims[i+1]
```

So fusing `[l..k]` (shape `dims[l] × dims[k+1]`) with `[k+1..r]` (shape
`dims[k+1] × dims[r+1]`) costs:

```
dims[l] * dims[k+1] * dims[r+1]
```

Three different shifted indices in one expression. **Derive it from the shapes
every time.** Do not memorise it; memorised index formulas are exactly what
break when the next problem pads its input.

---

## TRAP 3 — min vs sum, one more time

Each cut produces **one complete candidate cost**: `left + right + merge`.
The `+` signs are *inside* a single candidate — that parenthesisation really
does pay all three. The `min` is *across* candidates, because you will only
ever use one set of parentheses.

```
min over k of ( dp[l][k] + dp[k+1][r] + merge(k) )
 ^^^                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 choose             combine
```

> Counting SUMS the doors. Optimising PICKS one door. You have heard this since
> Chapter 5. Here both operators appear in the same line, three characters
> apart, and that is exactly why people fuse them by mistake.
>
> Swap `min` → `max` and the machine answers *"most expensive parenthesisation"*.
> Nothing else in the five slots changes. The choice operator is the only knob.

---

## Vale sets down the chisel

> "Every problem where the answer for a stretch is built from **two shorter
> stretches plus a price for joining them** is mine. Matrix chain. Burst
> balloons. Optimal binary search trees. Triangulating a polygon. Merging stones.
>
> The story is always the same: *what was the last cut, and what did the join
> cost?*"

---

## Cliffhanger

Reco crosses the slab. On the far bank, a still pool — and a woman standing at
its edge with her reflection facing her, mouthing his words back at him.

> "Vale cut her stretch anywhere she liked. I never cut in the middle. I only
> ever look at my **two ends at once**.
>
> When they match, I step inward from both sides and the world shrinks by two.
> When they differ, I must **abandon one end** — and choosing which one is the
> whole art."

Next: **Mirra the Mirror-Twin**, and the interval that reads only its own edges.

> Continue to `02 - worked example.md`.


</details>
