# Chapter 11 · 01 — Story: Modus, the Mask-Wearer

> Family: **State machine DP / Stock with Cooldown.**
> Lissa's chain was described by *where* you stood. Modus breaks that. From now
> on, your position is not enough — you must also say **what mask you are
> wearing**, because the mask decides which doors are even unlocked.

---

## The Three Masks

Reco leaves the forge and the road narrows. A figure stands in the middle of
it, turning a mask over in his hands — one face is carved with an open palm,
one with a closed fist, one with a shut eye.

```
day:      0    1    2    3    4
price:    1    2    3    0    2
```

**Modus, the Mask-Wearer**, lays out the law:

> "Each day you may **buy**, **sell**, or **do nothing**. You may hold at most
> one share. And the day *immediately after* you sell, you must **rest** — you
> are forbidden to buy.
>
> Maximise your profit."

Reco reaches for the old habit: `dp[i]` = best profit up to day `i`.

Modus stops him with one question:

> "Your `dp[4]` says `3`. Fine. Now tell me — on day 5, **may you buy?**"

Reco opens his mouth and nothing comes out. `dp[4] = 3` does not know whether
that profit was earned by *selling on day 4* (so day 5 is a forced rest) or by
*sitting still* (so day 5 is free). **One number has collapsed two different
worlds into one.**

> ### The diagnosis
> A state is wrong when it cannot answer the transition's own question.
> You met this in Chapter 10 — Lissa's bad state forgot *which value* the chain
> ended on. Modus's bad state forgets *which mask you are wearing*.
> Same disease. New organ.

---

## The Fulcrum

> ### "I am standing on day `i` **wearing mask M**. Which mask was I wearing on day `i-1`, and what did I do to get here?"

The fulcrum has a second coordinate now. It is not "where was I" — it is
"where was I **and as what**".

Modus names the three masks:

```
HOLD   you currently own a share
SOLD   you sold TODAY  (this is the mask that triggers tomorrow's cooldown)
REST   you own nothing and you are free to buy
```

And he draws the only legal roads between them:

```
                 buy (pay price)
        ┌──────────────────────────────┐
        │                              ▼
      REST ◄── (a day passes) ──── SOLD
        ▲                              ▲
        │ do nothing                   │ sell (collect price)
        └──── REST                    HOLD ──┐
                                        ▲    │ do nothing
                                        └────┘
```

Read that diagram as sentences, because the sentences *are* the transitions:

```
To be HOLD today:  I was HOLD yesterday and sat still,
                   OR I was REST yesterday and bought today.
To be SOLD today:  I was HOLD yesterday and sold today.   (only one road in)
To be REST today:  I was REST yesterday and sat still,
                   OR I was SOLD yesterday and served my cooldown.
```

> **The cooldown is not an `if` statement. It is a missing arrow.**
> There is no road from `SOLD` straight to `HOLD`. The rule is enforced by the
> *shape of the machine*, not by a guard clause you have to remember. This is
> the whole point of the family: encode the constraint into the states and the
> transitions become unconditional.

---

## What changed?

| Chapter 10 (ordered chain) | Chapter 11 (state machine) |
|---|---|
| `dp[i]` — one number per position | `dp[i][m]` — one number per position **per mask** |
| doors chosen by the data (a loop) | doors fixed by the **diagram** (a few named lines) |
| the rule lives in an `if` | the rule lives in a **missing arrow** |
| termination: `max(dp)` | termination: `max` over the **legal final masks only** |

Notice the door count went *back down*. Lissa had `0…i` doors; Modus has one or
two per mask. The complexity moved out of the transition and into the **number
of states**: `TIME = states × transition cost` is still the only formula, but
this time you paid on the left factor.

---

## The Five Slots for this family

```
0. FULCRUM      which mask was I wearing yesterday, and what move landed me here?
1. STATE        dp[i][m] = best profit on day i while wearing mask m
2. TRANSITION   one line per mask, copied straight off the diagram
3. BASE CASE    day 0 for EACH mask, derived separately — three derivations
4. TERMINATION  max over masks that are legal to END on
```

Slot 3 is where you will bleed. You now have **three base cases, not one**, and
they are not the same value.

---

## TRAP 1 — the illegal base case

Day 0, mask `SOLD` means *"I sold on day 0"*. To sell you must first own, and
you have owned nothing. **That world does not exist.**

```python
sold = 0              # WRONG — claims a nonexistent world is worth 0 profit
sold = float('-inf')  # RIGHT — the sentinel law: a door that cannot exist
                      #         must never be selectable
```

You learned the sentinel law with Corin (`amount + 1`) and with Gridlock
(`float('inf')`). It is the same law, sign-flipped: in a **max** problem the
impossible value is `-inf`.

Set `sold = 0` and the machine will happily "sell" a share it never bought.
On some inputs the bug hides. On others it invents money.

---

## TRAP 2 — the termination mask

```python
return max(hold, sold, rest)   # WRONG
return max(sold, rest)         # RIGHT
```

Ending the game in the `HOLD` mask means you are still holding a share you paid
for and never sold. That is money spent, not profit earned. `hold` is always a
*negative-leaning* number by construction — it has a purchase subtracted from it
and no sale added back.

> **The termination question, asked correctly:** not *"which cell is biggest?"*
> but *"which cells describe a world I am allowed to finish in?"*
> Survey only the legal ones. This is your known weak point wearing a new mask.

---

## TRAP 3 — reading a mask you already overwrote

When you roll the three arrays down to three variables (Chapter 4's cloth), all
three transitions read **yesterday's** values. If you assign `hold` first and
then compute `sold` from it, `sold` is reading *today's* hold. Silent corruption.

```python
hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
```

Python's simultaneous assignment evaluates the entire right-hand side **first**,
which is exactly the generation discipline Chapter 4 taught with the loop
direction. Write it as one tuple assignment, or keep explicit `prev_` copies.
Do not mix the two styles.

---

## Modus lifts the mask

> "Every constraint you were about to write as an `if` — *cooldown*, *transaction
> fee*, *at most k trades*, *cannot buy twice in a row* — is a mask. Add the mask,
> delete the `if`. The machine gets wider. The code gets simpler."

```
Cooldown          3 masks   (hold / sold / rest)
Transaction fee   2 masks   (hold / free)       — subtract the fee on the sell arrow
At most k trades  2k masks  (hold_1..hold_k, free_1..free_k)
Unlimited trades  2 masks   (hold / free)
```

Same family. Same five slots. Only the diagram changes.

---

## Cliffhanger

Reco memorises the diagram and walks on. At dusk he reaches a river spanned by
a single stone slab, and a woman is scoring it with a chisel.

> "Your masks remembered the **last thing you did**. Mine remembers nothing of
> the sort. I hold a whole *stretch* of the world in my hands, and the only
> question that matters is: **where was the last cut that split it in two?**
>
> Your table will grow a second endpoint. And you will learn, painfully, that
> filling it left to right is no longer legal."

Next: **Vale the Splitter**, and the day `dp[i]` became `dp[l][r]`.

> Continue to `02 - worked example.md`.
