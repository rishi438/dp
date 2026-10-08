# Chapter 17: Track the chance of each outcome

**Probability DP saves the chance of being in each situation, then spreads that chance to the possible next situations.** A probability of `1` means certain; `0` means impossible; `0.25` means a 25% chance.

## Our example

A chess knight starts at the top-left corner of a `3 x 3` board. Each move is chosen randomly from all eight knight moves. A knight moves two squares in one direction and one sideways.

If it leaves the board, it is out permanently. What is the chance it remains on the board after two moves?

## What do we store?

`dp[row][col]` is **the chance that the knight is on that square after the moves made so far**. `row` and `col` identify a square, counting from zero.

Before any move, the starting square has probability `1`; every other square has `0`.

## How does one move work?

If a square has probability `0.4`, each of its eight possible moves receives `0.4 / 8 = 0.05`.

Add each share to its destination if that destination is on the board. Shares going outside are lost. If several starting squares can reach the same destination, add their contributions.

Use a fresh table for the next move, so we do not accidentally move the knight twice in one step.

## The answer for this board

From the corner, only two of eight moves stay on the board. After one move, the total remaining chance is `2 / 8 = 0.25`.

From either surviving square, again only two of eight moves stay. After two moves, the chance is `0.25 * 2 / 8 = 0.0625`, or **6.25%**.

The final answer is the sum of all probabilities still on the board.

**Common mistake:** dividing by the number of safe moves. Always divide by `8`, because the random choice includes moves that leave the board.

---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 17 · 01 — Story: Fortuna, the Dice-Walker

> Family: **Probability / Expected-Value DP.**
> Digitus counted what is *certain*. Fortuna counts what is *likely*.
>
> This is the chapter where the table stops holding costs and starts holding
> **probability** — and where the transition stops choosing a door and starts
> taking **all of them at once**.

---

## The Black-and-White Hall

Reco steps out of the counting-house into a hall of black and white squares.
A woman sits cross-legged at its centre, rolling a knucklebone die. A carved
horse stands on the board and moves without being touched.

```
        3 × 3 board            the knight's 8 leaps from (r, c)

        (0,0) (0,1) (0,2)      (r±1, c±2)   (r±2, c±1)
        (1,0) (1,1) (1,2)      all eight, always attempted,
        (2,0) (2,1) (2,2)      each with weight 1/8
```

**Fortuna, the Dice-Walker**, does not look up.

> "The horse stands at `(0,0)`. It will leap **twice**. Each time, the die picks
> one of its eight leaps — all equally likely — and the horse obeys. If it lands
> outside the board it is gone and does not come back.
>
> What is the chance it is still on the board when the leaping stops?"

Reco reaches for the reflex sixteen chapters have drilled into him:

> `max(...)` — pick the best leap.

Fortuna finally looks at him.

> ### "There is nothing to pick. The horse does not choose. **The die chooses, and every door is taken at once.**"

---

## The Fulcrum

> ### "The horse is at `(r, c)` with `k` leaps remaining. Where does it go next?"

Eight doors. All of them. Simultaneously.

```
                    ┌── leap 1  weight 1/8 ──┐
    p(r, c, k)  ────┼── leap 2  weight 1/8 ──┼──►  p(r', c', k-1)
                    │      ...               │
                    └── leap 8  weight 1/8 ──┘

    p(r, c, k) = Σ over the 8 leaps of  (1/8) · p(r', c', k-1)
```

> **This is not `max`. This is not `min`. It is a WEIGHTED SUM.**
>
> ```
> OPTIMIZE   pick one door          max / min
> COUNT      add the doors          +
> PROBABILITY  add the doors, each scaled by its chance    Σ pᵢ · (...)
> ```
>
> Chapter 5 taught *"Counting SUMS the doors. Optimizing PICKS one door."*
> Chapter 17 adds the third line: **Probability SUMS the doors, weighted.**
> It is counting with a scale factor — and when all the weights are equal, it is
> *literally* counting divided by a constant. You will prove that below.

---

## The state: a distribution, not a value

Every table you have built so far held **the answer to a question about one
situation**. Fortuna's table holds something different:

```
dp[r][c] = the probability that the horse is standing on (r, c) right now
```

Take the whole table at one instant and it is a **distribution** — a complete
description of where the horse might be, and how likely each place is.

That gives you a free, permanent debugging invariant:

```
Σ over all cells of dp[r][c]  ≤  1        always
                              =  1        if no probability can escape
```

> **Print that sum after every step.** If it exceeds `1`, you are double-counting
> a door. If it drops when it shouldn't, you are losing one. No other chapter
> hands you a correctness check this cheap — **use it.**
>
> Here the sum *does* shrink, and that shrinkage **is the answer**: probability
> that leaps off the board is simply never written down. The missing mass is the
> horse that fell off.

---

## What changed?

| Chapter 16 (digit) | Chapter 17 (probability) |
|---|---|
| the table holds **counts** (integers) | the table holds **probabilities** (floats) |
| doors are summed | doors are summed **and weighted** |
| you choose which digits are legal | **you do not choose at all** — the die does |
| the answer is a count | the answer is a number in `[0, 1]` |
| exact arithmetic | **floating point** — rounding is now a real risk |
| no global invariant | `Σ dp ≤ 1`, checkable at every step |

---

## TRAP 1 — the base case is `1`, and it is a *point mass*

```python
dp[row][col] = 1.0      # the horse is HERE, with certainty
```

**Derive it from the state sentence:** *"the probability the horse is standing
on `(r,c)` before any leap"* — it is standing there. Probability `1`.
Everywhere else: `0`.

> Twelve chapters of `min`/`max` trained you to seed with `inf` or `-inf`.
> **There is no sentinel in a probability DP.** `0` is not "impossible and must
> never be selected" — `0` is a real, meaningful probability that participates
> normally in every sum. Summing a `0` is harmless; summing an `inf` is not.
>
> If you catch yourself reaching for a sentinel here, you have imported a habit
> from a family that does not apply.

---

## TRAP 2 — the weight goes *inside* the sum, once per door

```python
nxt[nr][nc] += dp[r][c] / 8.0        # RIGHT
nxt[nr][nc] += dp[r][c]              # WRONG -- forgot the weight
...
return total / 8.0                   # WRONG -- divides once, not once per door
```

The second bug looks seductive because "there are 8 doors, so divide by 8 at the
end" *happens to be right when all eight doors are taken*. It is wrong the
moment some doors leave the board — which is the entire point of the problem.

> **The `/8` is not a normalisation at the end. It is the probability attached
> to a specific arrow.** Same discipline as Chapter 11's `- prices[i]` riding
> one arrow of the state machine.

---

## TRAP 3 — the doors must be attempted even when they fail

```python
for dr, dc in MOVES:                 # all 8, always
    if in_bounds(nr, nc):
        nxt[nr][nc] += p / 8.0       # only the survivors get recorded
```

You **attempt** all eight and **record** only the legal ones. The illegal ones
still consumed their `1/8` of the probability — they just deposited it nowhere.

> A natural instinct is to "renormalise": count the legal moves `m` and divide
> by `m` instead of `8`. **That answers a different question** — *"given that
> the horse stays on the board, where is it?"* — and it will always return `1.0`.
> If your answer is `1.0` for every input, this is the bug.

---

## Probability is counting, divided

When every door has the **same** weight, the whole chapter collapses to
something you already know:

```
P(survive k leaps)  =  (number of surviving leap-sequences)  /  8ᵏ
```

Build the identical table with integers instead of floats and you get the
numerator. On the `3×3`, `k=2` board:

```
surviving paths = 4        8² = 64        4 / 64 = 0.0625
```

> **Do this whenever the weights are uniform.** Integers do not round, do not
> underflow, and can be checked by hand. Convert to a probability at the very
> end — at *termination*, where the answer lives.
>
> Non-uniform weights (a loaded die, a `p`/`1-p` coin) force you back to floats.
> Then you carry the weight explicitly on each arrow.

---

## Fortuna sets down the die

> "Three questions live in my hall, and they use the same table.
>
> **Probability** — *'what is the chance?'* The cell is a chance; the doors are
> summed with weights; the answer lies in `[0, 1]`.
>
> **Expected value** — *'what is the average?'* The cell is an average; the
> doors are still summed with weights; but now each arrow may also **pay
> something**: `E = Σ pᵢ · (valueᵢ + E_next)`.
>
> **Counting under randomness** — *'how many ways?'* The cell is an integer, the
> weights are all one, and you divide at the end.
>
> The walk is identical. Only what the cell *means* changes — and that is Slot 1,
> as it has been for seventeen chapters."

---

## Cliffhanger

Reco thanks her and turns to go. Fortuna speaks once more, and for the first
time she sounds impatient.

> "One last game. A gambler draws cards until her total reaches `k`. Each draw
> adds `1` to `maxPts`, uniformly. What is the chance she stops below `n`?
>
> Your table will be right. Your transition will be right.
>
> And it will be **too slow** — because at every point you will re-add the same
> `maxPts` neighbours you added one step earlier, minus one, plus one."

At the far end of the hall a swordsman is waiting, perfectly still, a length of
rope knotted at both ends across his hands.

> "Ask him. He has not re-added a number in his life. He adds what enters, he
> drops what leaves, and he does it in constant time — **from both ends at
> once**."

Next: **Swift the Deque Ronin**, and the day the transition itself got
optimised.

> Continue to `02 - worked example.md`.


</details>
