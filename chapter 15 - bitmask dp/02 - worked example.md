# Chapter 15 · 02 — Worked Example: Travelling Salesman (Held–Karp)

> Five slots, then the Invariant Lens. New this chapter: a state indexed by a
> **subset**, a table that is mostly **unreachable nonsense held at `inf`**, and
> a termination that adds a cost **outside** the table.

---

## The Problem

> ```
>         dist    0     1     2     3
>            0    0    10    15    20
>            1   10     0    35    25
>            2   15    35     0    30
>            3   20    25    30     0
> ```
>
> Start at town `0`, visit every town exactly once, return to `0`.
> Minimise total distance. (Expected: `80`.)

---

## Slot 0 — FULCRUM

> ### "I have visited exactly the set `S` and I am standing at town `i`. Which town did I come from?"

```
doors = every j in S, j ≠ i

    dp[S][i]  =  min over j of  ( dp[S \ {i}][j] + dist[j][i] )
                                    ^^^^^^^^^^^
                                    same set, one town LIGHTER
```

Same question as Lissa's *"which link came just before me?"* (Ch 10). The
difference is what indexes the sub-answer: a **smaller set**, not a smaller
index.

---

## Slot 1 — STATE

> `dp[mask][i]` = the **minimum distance of a path that starts at town `0`,
> visits exactly the towns in `mask`, and ENDS at town `i`.**

Three clauses, all load-bearing:

```
"starts at town 0"          → every legal mask has bit 0 set
"visits exactly `mask`"     → not "at least"; exactly. This is the memory.
"ENDS at town i"            → pin the endpoint, or dist[j][i] is unaskable
```

**The set, folded into an integer.** A subset of `n` towns *is* an `n`-bit
number:

```
towns:      3 2 1 0
{0}         0 0 0 1  =  1
{0,1}       0 0 1 1  =  3
{0,2}       0 1 0 1  =  5
{0,1,3}     1 0 1 1  = 11
{0,1,2,3}   1 1 1 1  = 15  = (1 << 4) - 1
```

```python
mask | (1 << j)       add j
mask & (1 << j)       is j present?
(1 << n) - 1          the full set
```

> **Why the mask and not just "how many visited"?** Because `dist[j][i]` needs
> to know *which* towns remain, not how many. A count is a lossy summary; the
> transition would be unanswerable. Fourth chapter of *"a state that cannot
> answer the transition's question is the wrong state."*

---

## Slot 2 — TRANSITION

Written as a **push** (fill forward from a finished cell):

```python
for mask in range(1 << n):
    for i in range(n):
        if dp[mask][i] == INF:            # unreachable -- do not propagate nonsense
            continue
        for j in range(n):
            if mask & (1 << j):           # j already visited -> not a legal door
                continue
            nxt = mask | (1 << j)
            dp[nxt][j] = min(dp[nxt][j], dp[mask][i] + dist[i][j])
```

| English | Symbol |
|---|---|
| "having visited `mask`, standing at `i`" | `dp[mask][i]` |
| "go to a town I have **not** visited" | `if mask & (1 << j): continue` |
| "the set now also contains `j`" | `mask \| (1 << j)` |
| "pay the road" | `+ dist[i][j]` |
| "keep the cheapest way to reach that situation" | `min(...)` |

**Choose vs combine:** `min` chooses between alternative *histories* that arrive
at the same `(set, position)`; `+ dist[i][j]` is a mandatory cost riding one
specific door. Chapter 8's shape, with a set for an index.

**The `if dp[mask][i] == INF: continue` guard is not an optimisation.** It is
the sentinel law being enforced: `inf + dist` is still `inf` in Python, so the
answer stays correct either way — but skipping makes the *intent* explicit and
stops `inf` arithmetic from spreading through the table where you can no longer
tell a real `inf` from a propagated one.

---

## Slot 3 — BASE CASE  *(Initialization)*

```python
dp = [[INF] * n for _ in range(1 << n)]      # every cell: unreachable until proven otherwise
dp[1][0] = 0                                  # mask 0b0001 = {0}, standing at 0
```

**Derive `dp[1][0]` from the sentence:** *"cheapest path starting at 0, having
visited exactly `{0}`, ending at 0"* — you have not moved. **`0`.**

**And derive why everything else is `inf`:** most of this table describes worlds
that cannot exist.

```
dp[0b0100][2]   visited {2} but never town 0      → impossible, all paths start at 0
dp[0b0011][2]   ends at town 2, but 2 ∉ mask      → contradicts "ENDS at i"
dp[0b0001][3]   ends at town 3, mask says {0}     → same contradiction
```

> These must stay `inf` **forever**, and the sentinel law is what guarantees a
> `min` never selects them. Initialise the table to `0` and the machine returns
> a tour of length `0` — cheerfully, with no error.
>
> ```
> Ch 5   amount + 1      unreachable amount, min problem
> Ch 8   float('inf')    blocked cell, min problem
> Ch 11  float('-inf')   impossible world, MAX problem
> Ch 12  float('inf')    unvisited cut, min problem
> Ch 15  float('inf')    unreachable (set, position), min problem
> ```
>
> Fifth appearance. **A door that does not exist must never be selectable.**

Eleventh chapter of base cases; still no two alike:

```
Ch 5  dp[0] = 0                Ch 11 -prices[0] / -inf / 0
Ch 6  dp[0] = nums[0]          Ch 12 dp[i][i] = 0
Ch 7  row/col of 0s            Ch 13 dp[i][i] = 1, dp[l>r] = 0
Ch 8  dp[0][0] = grid[0][0]    Ch 14 (0, 0) at the absent node
Ch 9  dp[0][*] = 0             Ch 15 dp[{0}][0] = 0, everything else inf
Ch 10 dp[*] = 1
```

---

## Slot 4 — TERMINATION

> ### `min over i≠0 of ( dp[FULL][i] + dist[i][0] )`

The table can tell you the cheapest way to *finish the sweep* at each town. It
**cannot** tell you the cost of getting home, because town `0` is already in
every mask — there is no cell meaning "visited everything and returned."

```python
FULL = (1 << n) - 1
return min(dp[FULL][i] + dist[i][0] for i in range(1, n))
```

> **A new termination shape: survey, then pay one more cost outside the table.**
>
> ```
> ENDPOINT FORCED        Ch 5 · Ch 8 · Ch 12 · Ch 13
> ENDPOINT FREE          Ch 6 · Ch 10
> LEGAL-END FILTER       Ch 11
> FORCED NODE, FREE MASK Ch 14
> SURVEY + FINAL COST    Ch 15   ← here
> ```
>
> Two ways to get this wrong, both silent:
> - `min(dp[FULL])` — solves the shortest Hamiltonian **path**, not the tour.
>   Plausible number, wrong problem.
> - `dp[FULL][0]` — returns `inf`. At least this one screams.

---

## Verify By Hand

Group the table by **popcount** — how many towns are in the set. Every cell in
one group depends only on the group above it.

```
popcount 1
    dp[0001][0] = 0                                             BASE

popcount 2                           (0 → i)
    dp[0011][1] = 0 + d[0][1] = 10
    dp[0101][2] = 0 + d[0][2] = 15
    dp[1001][3] = 0 + d[0][3] = 20

popcount 3
    dp[0111][2]  from {0,1} at 1:  10 + d[1][2]=35  = 45
    dp[0111][1]  from {0,2} at 2:  15 + d[2][1]=35  = 50
    dp[1011][3]  from {0,1} at 1:  10 + d[1][3]=25  = 35
    dp[1011][1]  from {0,3} at 3:  20 + d[3][1]=25  = 45
    dp[1101][3]  from {0,2} at 2:  15 + d[2][3]=30  = 45
    dp[1101][2]  from {0,3} at 3:  20 + d[3][2]=30  = 50

popcount 4   (mask 1111 -- two doors into each cell now)
    dp[1111][3] = min( dp[0111][2] + d[2][3] = 45 + 30 = 75,
                       dp[0111][1] + d[1][3] = 50 + 25 = 75 )  = 75
    dp[1111][2] = min( dp[1011][3] + d[3][2] = 35 + 30 = 65,
                       dp[1011][1] + d[1][2] = 45 + 35 = 80 )  = 65
    dp[1111][1] = min( dp[1101][3] + d[3][1] = 45 + 25 = 70,
                       dp[1101][2] + d[2][1] = 50 + 35 = 85 )  = 70

TERMINATION -- add the ride home
    i=1:  70 + d[1][0]=10  =  80     ← 0 → 2 → 3 → 1 → 0
    i=2:  65 + d[2][0]=15  =  80     ← 0 → 1 → 3 → 2 → 0
    i=3:  75 + d[3][0]=20  =  95

answer = 80
```

> **Two tours tie at 80, and they are each other reversed.** On a symmetric
> distance matrix that is always true, and it halves the real search space —
> the DP does not know that and does not need to. Chapter 10's lesson again:
> *the DP returns the value; reconstruction returns one witness.*
>
> Also note `dp[1111][3] = 75` is a perfectly correct cell that loses at
> termination because its ride home costs `20`. **A cell being optimal for its
> own sentence does not make it the answer.** That is exactly why Slot 4 exists
> as a separate slot.

---

## The Code

```python
def tsp(dist):
    n = len(dist)
    if n <= 1:                                       # TERMINATION guard: nothing to tour
        return 0
    INF = float('inf')
    FULL = (1 << n) - 1
    dp = [[INF] * n for _ in range(1 << n)]          # STATE: dp[mask][i] = min cost, visited `mask`, ENDING at i
    dp[1][0] = 0                                     # BASE: visited exactly {0}, standing at 0, cost 0
                                                     #       everything else stays INF = unreachable
    for mask in range(1 << n):                       # ORDER: a subset is numerically < any superset
        for i in range(n):
            cur = dp[mask][i]
            if cur == INF:                           # never propagate an impossible world
                continue
            for j in range(n):                       # FULCRUM (pushed): where do I go next?
                if mask & (1 << j):                  # j already visited -> not a door
                    continue
                nxt = mask | (1 << j)                # the set, one town HEAVIER
                if cur + dist[i][j] < dp[nxt][j]:
                    dp[nxt][j] = cur + dist[i][j]    # TRANSITION: choose cheapest history, pay the road
    return min(dp[FULL][i] + dist[i][0]              # TERMINATION: survey, THEN pay the ride home
               for i in range(1, n))

D = [[0, 10, 15, 20],
     [10, 0, 35, 25],
     [15, 35, 0, 30],
     [20, 25, 30, 0]]
print(tsp(D))                                   # expected: 80
print(tsp([[0, 1, 2], [1, 0, 3], [2, 3, 0]]))   # expected: 6
print(tsp([[0, 5], [5, 0]]))                    # expected: 10
print(tsp([[0]]))                               # expected: 0
```

### The same thing top-down (often clearer)

```python
from functools import lru_cache

def tsp_topdown(dist):
    n = len(dist)
    if n <= 1:
        return 0
    FULL = (1 << n) - 1

    @lru_cache(maxsize=None)
    def go(mask, i):                                 # STATE: min cost to finish, GIVEN visited `mask`, at i
        if mask == FULL:                             # BASE: everything seen -> only the ride home remains
            return dist[i][0]
        best = float('inf')                          # sentinel floor for a min problem
        for j in range(n):                           # FULCRUM: which unvisited town next?
            if not mask & (1 << j):
                best = min(best, dist[i][j] + go(mask | (1 << j), j))
        return best

    return go(1, 0)                                  # TERMINATION: start at 0 having visited only {0}

print(tsp_topdown(D))                                # expected: 80
print(tsp_topdown([[0, 1, 2], [1, 0, 3], [2, 3, 0]]))  # expected: 6
```

> **Read the two base cases side by side. They are not the same.**
>
> ```
> bottom-up   dp[{0}][0] = 0        "cost already SPENT to get here"
> top-down    go(FULL, i) = d[i][0] "cost still REMAINING from here"
> ```
>
> Same problem, same complexity, opposite accounting — and therefore the ride
> home lands in **Slot 4** in one version and in **Slot 3** in the other.
> This is the sharpest example in the book of why base cases must be *derived
> from your own state sentence* and never copied. Copy the bottom-up base into
> the top-down version and it silently forgets to come home.

### Reconstructing the tour

```python
def tsp_route(dist):
    n = len(dist)
    if n <= 1:
        return [0]
    INF = float('inf')
    FULL = (1 << n) - 1
    dp = [[INF] * n for _ in range(1 << n)]
    par = [[-1] * n for _ in range(1 << n)]          # breadcrumb: who did I come from?
    dp[1][0] = 0
    for mask in range(1 << n):
        for i in range(n):
            if dp[mask][i] == INF:
                continue
            for j in range(n):
                if mask & (1 << j):
                    continue
                nxt, cost = mask | (1 << j), dp[mask][i] + dist[i][j]
                if cost < dp[nxt][j]:
                    dp[nxt][j], par[nxt][j] = cost, i
    last = min(range(1, n), key=lambda i: dp[FULL][i] + dist[i][0])
    route, mask = [0], FULL
    while last != -1:                                # walk the breadcrumbs backwards
        route.append(last)
        prev = par[mask][last]
        mask, last = mask & ~(1 << last), prev
    return route[::-1]

print(tsp_route(D))                             # expected: [0, 2, 3, 1, 0]
print(tsp_route([[0, 1, 2], [1, 0, 3], [2, 3, 0]]))   # expected: [0, 2, 1, 0]
```

> **It printed `[0, 2, 3, 1, 0]`, not `[0, 1, 3, 2, 0]` — and both cost 80.**
> They are the same loop walked backwards. `min(range(1, n), key=...)` broke the
> tie at `i=1` (`70 + 10`) before it ever saw `i=2` (`65 + 15`), so the
> breadcrumbs unwound the reverse direction.
>
> **The DP returns the value; reconstruction returns one witness, chosen by your
> tie-breaking rule.** Chapter 10 said it, Chapter 13 said it again, and it will
> keep being true. If you need a canonical direction, impose it deliberately —
> do not shuffle the code until the output matches.

---

## The Invariant Lens

| Loop-invariant phase | DP name | What it means here |
|---|---|---|
| **Initialization** | Base Case | `dp[{0}][0] = 0` is the one truth known without computation. Every other cell is `inf` — the explicit claim *"no path realises this (set, position) yet"*, which the sentinel law makes unselectable. |
| **Maintenance** | Transition | Processing masks in increasing numeric order, `dp[mask][i]` is final before it is used, because every cell it writes into has a **strictly larger** integer (`mask \| (1<<j) > mask` when bit `j` is clear). Each write keeps the cheapest history reaching that `(set, position)`. |
| **Termination** | State (final) | After the sweep, `dp[FULL][i]` is the cheapest way to visit everything and stand at `i`. The tour's last leg is not in the table, so it is added at the survey: `min(dp[FULL][i] + dist[i][0])`. |

**Source-cell check (the whole ordering proof, in one line):**

```
bit j is clear in mask   ⟹   mask | (1 << j)  >  mask     (strictly)
```

> Chapter 12 needed a length loop. Chapter 13 needed a descending loop.
> Chapter 14 got its order from the call stack. Chapter 15 gets it from
> arithmetic: **a set is numerically smaller than every superset of it.**
>
> **Do not mix push and pull.** A pull assumes `dp[mask][*]` is final when the
> loop reaches `mask`; a push is still writing into future masks. Both are
> correct alone; interleaved, one overwrites the other's assumption.

---

## Debugging With the Lens

```
Answer is 0                     -> INITIALIZATION. The table was filled with 0
                                   instead of inf. A nonexistent world got chosen.

Answer is inf                   -> TERMINATION. You returned dp[FULL][0], which the
                                   transition can never legally reach.

Answer is short by one leg      -> TERMINATION. You wrote min(dp[FULL]) and solved
                                   the open Hamiltonian PATH, not the tour.

Towns visited twice             -> MAINTENANCE. The "is j visited" test is inverted.
                                   Push needs `if mask & (1<<j): continue`.

Wrong for n>=4, right for n<=3  -> MAINTENANCE. Mixed push and pull, or you iterated
                                   masks in an order that isn't monotone.

IndexError on the mask axis     -> the table has 1<<n rows, not n rows.

Top-down forgets the ride home  -> INITIALIZATION. You copied the bottom-up base.
                                   go(FULL, i) must return dist[i][0], not 0.
```

---

## Complexity

```
states     = 2ⁿ masks × n positions       = O(2ⁿ · n)
transition = O(n) doors (each next town)
TIME  = O(2ⁿ · n²)
SPACE = O(2ⁿ · n)
```

> **`TIME = states × transition cost`, fifteen chapters in a row.**
>
> ```
> Ch 12  O(n²) states × O(n)  = O(n³)
> Ch 13  O(n²) states × O(1)  = O(n²)
> Ch 14  O(n)  states × O(1)  = O(n)
> Ch 15  O(2ⁿn) states × O(n) = O(2ⁿ n²)
> ```
>
> And the honest caveat: **this chapter's DP does not make the problem fast.**
> Brute force is `O(n!)`. Held–Karp is `O(2ⁿ n²)`.
>
> ```
> n = 10    3.6 × 10⁶     vs   1.0 × 10⁵     ~36×
> n = 15    1.3 × 10¹²    vs   7.4 × 10⁶     ~176,000×
> n = 20    2.4 × 10¹⁸    vs   4.2 × 10⁸     ~5,800,000,000×
> n = 25    —                  2.1 × 10¹⁰    now YOU are the bottleneck
> ```
>
> Exponential beaten down to a *smaller* exponential. That is the whole prize.
> **`n ≤ 20` in the constraints is the signal. Read the constraints first.**

---

## Sibling: Assignment Problem (the mask is enough on its own)

> `cost[worker][job]`. Assign each of `n` workers to a distinct job, minimise
> total cost. (For the last matrix below, expected: `14`.)

Here the second index is **redundant** — if `k` bits are set, you must be
assigning worker `k`. The position is *implied by the popcount*.

```python
def assignment(cost):
    n = len(cost)
    FULL = (1 << n) - 1
    dp = [float('inf')] * (1 << n)                   # STATE: dp[mask] = min cost to staff the jobs in `mask`
    dp[0] = 0                                        # BASE: no jobs filled costs nothing
    for mask in range(1 << n):
        if dp[mask] == float('inf'):
            continue
        w = bin(mask).count("1")                     # the worker index is IMPLIED by the popcount
        if w == n:
            continue
        for j in range(n):                           # FULCRUM: which job does worker w take?
            if not mask & (1 << j):
                nxt = mask | (1 << j)
                dp[nxt] = min(dp[nxt], dp[mask] + cost[w][j])   # TRANSITION
    return dp[FULL]                                  # TERMINATION: every job filled -- FORCED cell

print(assignment([[9, 2, 7], [6, 4, 3], [5, 8, 1]]))   # expected: 9
print(assignment([[3, 8], [5, 1]]))                    # expected: 4
print(assignment([[10, 4, 6], [8, 9, 3], [7, 5, 2]]))  # expected: 14
```

> **Drop a dimension when you can prove it is implied.** `2ⁿ` states instead of
> `2ⁿ · n` — and unlike TSP, the termination here *is* a single forced cell,
> because there is no ride home. Same family, different Slot 4.
>
> But be careful: this only works because the workers are processed in a fixed
> order. In TSP the *position* genuinely matters for the next road's cost, so
> you cannot drop it. **Derive, don't pattern-match.**

---

## The family roster

| Problem | The set is... | The extra index |
|---|---|---|
| Travelling Salesman | towns visited | current town (needed for `dist`) |
| Assignment Problem | jobs filled | none — implied by popcount |
| Partition to K Equal Subsets | elements used | current bucket's running sum |
| Shortest Superstring | strings merged | last string (needed for overlap) |
| Count Hamiltonian Paths | nodes visited | current node |
| Bitmask + submask (SOS DP) | a set | iterate submasks: `s = (s-1) & mask` |

> The question is always: **what must I remember about the past, and is it small
> enough to be a set?** If `n ≤ 20`, the answer is usually yes.

> Continue to `03 - your challenge.md`.
