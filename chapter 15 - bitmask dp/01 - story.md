# Chapter 15 · 01 — Story: Maska, the Bit-Witch

> Family: **Bitmask DP / Travelling Salesman.**
> Root's branches never rejoined, so a node could forget everything except its
> own subtree. Maska's paths cross, and re-cross, and the choice you made an
> hour ago still constrains you now.
>
> This is the chapter where the state stops being a **position** and becomes a
> **set** — and where you learn to hold a whole set inside one integer.

---

## The Ring of Candles

Reco climbs down from the grove into a burnt clearing. A woman crouches inside a
ring of four guttering candles, each one a town on a scorched map.

```
          0 ─── 10 ─── 1
          │ ╲          │
          │   15    25 │
          │      ╲     │
          20      2 ── 35
           ╲      │
            ╲── 3 ┘ 30
```

```
        distance      0     1     2     3
              0       0    10    15    20
              1      10     0    35    25
              2      15    35     0    30
              3      20    25    30     0
```

**Maska, the Bit-Witch**, speaks to the flames.

> "Start at town `0`. Visit **every** town exactly once. Come home.
> Give me the shortest loop."

Reco reaches for the habit he has built over fourteen chapters:

> `dp[i]` = the cheapest way to arrive at town `i`.

Maska laughs.

> "You are at town `2`, and it cost you `15`. Now tell me — **may you go to
> town `1`?**"

Silence. He cannot answer. The cost `15` does not say *whether town 1 has
already been burned*. And unlike Root's grove, he cannot just look below him —
the roads here loop back on themselves. The past is not behind him; it is
**still binding**.

> ### "Your position is not your state. Your position plus **everything you have already spent** is your state. And what you have spent is a SET."

---

## The Fulcrum

> ### "I have already visited the set `S`, and I am standing at town `i`. Which town did I come from?"

The doors: any town `j` in `S` other than `i` itself.

```
              dp[S][i]   ←   dp[S \ {i}][j] + dist[j][i]     for every j in S\{i}
                                ^^^^^^^^^^
                                the same set, one town LIGHTER
```

That is the same *shape* as Lissa's predecessor loop in Chapter 10 — "which
one came just before me?" — but the sub-answer is indexed by a **smaller set**
rather than a smaller index.

---

## The State — a set, folded into an integer

There are `2ⁿ` possible subsets of `n` towns. You are not going to build a
dictionary of frozensets. You are going to use the fact that a subset of `n`
things is exactly an `n`-bit binary number.

```
towns:        3  2  1  0
bit:          8  4  2  1

{0}           0  0  0  1   =  1
{0, 2}        0  1  0  1   =  5
{0, 1, 3}     1  0  1  1   = 11
{0,1,2,3}     1  1  1  1   = 15     ← "full", and 15 == (1 << 4) - 1
```

The five operations you need, and nothing more:

```python
mask | (1 << j)      add town j to the set
mask & ~(1 << j)     remove town j from the set
mask & (1 << j)      is town j in the set?   (truthy / falsy)
(1 << n) - 1         the FULL set
bin(mask).count("1") how many towns are in the set
```

> **Write these five on a card and keep it visible.** Every bug in this chapter
> is one of them mistyped. `mask & 1 << j` does not mean what you think it does
> — `<<` binds tighter than `&` in Python, so that one happens to work, but
> `mask & (1 << j) == 0` versus `mask & (1 << j) != 0` is where people actually
> die. **Parenthesise everything.**

```
dp[mask][i] = the minimum cost of a path that starts at town 0,
              visits exactly the set of towns in `mask`,
              and ENDS at town i.
```

> "**ENDS at town `i`**" — pin the endpoint down. That is Kade's habit (Ch 6),
> Gridlock's (Ch 8), Lissa's (Ch 10). Fourth time. It is not optional: without
> it the transition cannot ask `dist[j][i]`.

---

## Fill order — and this time it is free

`dp[mask][i]` reads `dp[mask without i][j]`. Removing a bit **always makes the
integer smaller**:

```
mask & ~(1 << i)   <   mask       always, when bit i is set
```

So iterating `for mask in range(1 << n)` in plain increasing numeric order is a
**valid topological sort**. Every source has already been computed.

> Chapter 12 needed a length loop and a proof. Chapter 13 needed a descending
> loop and a proof. Chapter 15 needs `range(2ⁿ)` — and the proof is one line:
> *a subset is numerically smaller than any superset of it.*
>
> If you prefer to push forward instead (`dp[mask | 1<<j][j] = min(..., dp[mask][i] + d[i][j])`),
> that works too, and for the same reason. Pull or push — pick one. **Mixing
> them is a real bug**, because a push writes into a cell a later pull assumes
> is final.

---

## What changed?

| Chapter 14 (tree) | Chapter 15 (bitmask) |
|---|---|
| state = a node | state = a **set** + a position |
| children never rejoin → forget the past | paths cross → the past **still binds** |
| `O(n)` states | `O(2ⁿ · n)` states |
| post-order is forced | increasing integer order, and it's free |
| the `+` was safe (disjoint subtrees) | there is no `+` between branches at all |
| `O(n)` time | `O(2ⁿ · n²)` time |

> **This is the first chapter where DP does not make the problem fast.**
> `O(2ⁿ · n²)` is still exponential. What DP buys you is the drop from `O(n!)`
> to `O(2ⁿ n²)` — for `n = 15` that is `1.3 × 10¹²` versus `5 × 10⁶`, a factor
> of roughly **250,000**. Useless for `n = 100`. Decisive for `n ≤ 20`.
>
> **`n ≤ 20` in the constraints is the loudest signal in competitive
> programming.** It is practically an announcement that the intended solution is
> a bitmask. Read the constraints *before* you read the problem.

---

## TRAP 1 — the base case is a set, not an index

```python
dp[1][0] = 0        # mask 0b0001 = {town 0}, standing at town 0, cost 0
```

**Derive it from the state sentence:** *"the cheapest path that starts at 0,
has visited exactly `{0}`, and ends at `0`"* — you have not moved. Cost `0`.

Everything else starts at the sentinel:

```python
dp = [[float('inf')] * n for _ in range(1 << n)]
```

> **Most of this table is nonsense and must stay nonsense.** `dp[0b0100][2]`
> claims a path that visited `{2}` but never town `0` — impossible, since every
> path starts at `0`. `dp[0b0011][2]` claims you end at town `2` without having
> visited it — also impossible. These cells must remain `inf` forever, and the
> sentinel law is what guarantees a `min` can never pick them up.
>
> Set the table to `0` instead of `inf` and the machine will happily return a
> tour of length `0`. That is Chapter 5's Coin Change bug (`amount + 1`) and
> Chapter 8's (`float('inf')`) for the third time.

---

## TRAP 2 — the termination is not `dp[FULL][0]`

The tour must **come home**, but the table has no room for "home again" — town
`0` is already in every mask, so `dp[FULL][0]` would mean *"ended at 0 having
visited everything"*, and the transition can never legally produce it.

```python
return min(dp[FULL][i] + dist[i][0] for i in range(1, n))
```

> The final leg is **added at termination**, outside the table. This is a new
> termination shape:
>
> ```
> ENDPOINT FORCED       Ch 5 dp[amount] · Ch 8 dp[R-1][C-1] · Ch 12/13 dp[0][n-1]
> ENDPOINT FREE         Ch 6 max(dp)    · Ch 10 max(dp)
> LEGAL-END FILTER      Ch 11 max(sold, rest)
> FORCED NODE, FREE MASK Ch 14 max(rob, skip)
> SURVEY + A FINAL COST  Ch 15 min over i of (dp[FULL][i] + dist[i][0])
> ```
>
> Forget the `+ dist[i][0]` and you have solved a different problem — the
> shortest **open** Hamiltonian path — and it will look plausible.
> Return `dp[FULL][0]` and you get `inf`.

---

## TRAP 3 — the "visited" test, inverted

```python
if mask & (1 << i):       # town i IS in the set
if not mask & (1 << i):   # town i is NOT in the set
```

Two nearly identical lines, opposite meanings, no error message either way.
Before writing any loop in this chapter, say out loud which one you need:

```
the town I am standing ON        must BE in the mask
the town I am moving TO (push)   must NOT be in the mask
the town I came FROM  (pull)     must BE in the mask, and must not be me
```

---

## Maska snuffs the candles

> "Anything where the past is a *set* and the set is small is mine. Visit every
> city. Assign every worker to a job. Cover every column. Split a pile into
> equal heaps. Stitch every string into one.
>
> You will know me by the constraint line. When it says `n ≤ 20`, I am already
> in the room."

---

## Cliffhanger

The last candle dies and Reco is standing in a counting-house at dawn. A thin
man in spectacles runs his finger down an enormous ledger without looking up.

> "Maska's set had twenty elements. Mine has ten to the eighteenth.
>
> You will not enumerate my numbers, boy. You will walk their **digits** —
> left to right, one place at a time — and at every place you will ask a
> question none of the others had to ask:
>
> ***am I still hugging the ceiling, or have I already dropped below it and
> gone free?***"

Next: **Digitus the Ledger Keeper**, and the flag called `tight`.

> Continue to `02 - worked example.md`.
