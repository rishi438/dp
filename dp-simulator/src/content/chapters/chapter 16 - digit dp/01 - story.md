# Chapter 16: Count numbers by building their digits

**To count numbers up to a large limit, build them one digit at a time and reuse the counts for repeated situations.**

Our rule: neighbouring digits must differ. `12` and `121` are allowed; `11` and `100` are not.

## Start with a small limit

From `0` to `21`, there are `22` numbers. Only `11` breaks the rule, so the answer is **21**.

We can count them by their first digit:

```text
0 followed by 0..9 -> numbers 0..9      -> 10
1 followed by 0..9, except 1            ->  9
2 followed by 0 or 1 -> numbers 20, 21 ->  2
Total                                  -> 21
```

The first row uses a leading zero just to write every number with two places. `04` still means `4`.

## What do we remember?

At each step we remember four things:

- `pos`: which digit position we are filling, from left to right.
- `previous`: the last digit, so we can reject a repeat.
- `tight`: whether the digits written so far exactly match the limit's digits.
- `started`: whether we have written the first nonzero digit.

The saved answer is **how many valid ways we can fill the remaining positions** from that situation.

## Why the two yes/no flags?

For limit `21`, choosing first digit `2` keeps `tight` true: the last digit cannot exceed `1`. Choosing first digit `1` makes `tight` false: any last digit fits under the limit.

`started` prevents padding zeros from breaking the rule. Before the number begins, `00` is padding. After it begins, the repeated zeros in `100` really are invalid.

Try each allowed next digit and **add** its number of valid completions. At the end, a completed valid number contributes `1`, including zero here. The first call returns the total count.

**Common mistake:** restricting every position to the limit's digit. Once the earlier digits are smaller, later digits may range from `0` to `9`.

---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 16 · 01 — Story: Digitus, the Ledger Keeper

> Family: **Digit DP.**
> Maska's set had twenty elements. Digitus's has `10¹⁸`. You will not enumerate
> them. You will walk their **digits**, left to right, and carry one flag no
> previous chapter has needed.
>
> This is the chapter where the input stops being an array and becomes a
> **number written as a string**.

---

## The Counting-House

The last candle dies and Reco is standing in a counting-house at dawn. A thin
man in spectacles runs his finger down a ledger the size of a door.

> "Count me every number from `0` to `1234` in which **no two neighbouring
> digits are the same**."

Reco starts a loop. `for x in range(1235)`. Digitus does not look up.

> "Now do it to `10¹⁸`."

The loop dies. There is no array to index, no grid to walk, no set small enough
to be a mask. There is only a **bound**, and it is written down:

```
N  =  1  2  3  4
pos   0  1  2  3
```

> ### "You will not count the numbers, boy. You will build them — one place at a time, left to right. And at every place there is exactly one question that matters."

---

## The Fulcrum

> ### "I am at digit position `pos`. Which digit do I write here?"

Ten doors, `0` through `9` — except that sometimes there are fewer, and the
reason why is the entire chapter.

```
N = 1 2 3 4

pos 0:  I may write 0 or 1.        Writing 2 would make the number exceed N.
        → I am HUGGING THE CEILING.

        If I write 1, I am STILL hugging: my prefix equals N's prefix.
        If I write 0, I have DROPPED BELOW: any number starting 0... is
        already smaller than 1234, no matter what follows.

pos 1:  if I dropped below   →  I may write ANY of 0..9. I am FREE.
        if I am still hugging →  I may write 0, 1 or 2 only. Capped by N[1]=2.
```

> **That is the flag.** One boolean, carried down the recursion:
>
> ```
> tight = True    my prefix exactly equals N's prefix so far
>                 → this position is capped at N[pos]
> tight = False   my prefix is already strictly smaller than N's
>                 → this position is free: 0..9, forever after
> ```
>
> And the crucial asymmetry, which you must be able to state cold:
>
> ```
> tight stays True  ONLY IF  it was already True  AND  I wrote exactly N[pos].
> Once tight goes False, it NEVER comes back.
> ```
>
> `tight_next = tight and (d == N[pos])`. One line. Memorise the *derivation*,
> not the line.

---

## Why this counts `10¹⁸` numbers in microseconds

Because almost every number shares a prefix with almost every other number.

```
Numbers starting "0..."      →  the rest is completely unconstrained
Numbers starting "10..."     →  the rest is completely unconstrained
Numbers starting "11..."     →  the rest is completely unconstrained
...
Numbers starting "1234"      →  exactly one number
```

Only the **`tight` path** is special — and there is exactly one of those per
position. Everything else collapses into "free suffix of length `k`, given the
previous digit was `d`". That is `18 × 10 × 2 × 2` states, not `10¹⁸` numbers.

> **The Two Laws, checked:**
> *Optimal substructure* — the count for a prefix is built from counts for
> longer prefixes. *Overlapping subproblems* — the suffix `"free, 3 places
> left, prev=7"` is reached by a colossal number of different prefixes, and it
> is computed once. **That overlap is the entire speedup.**

---

## The Second Flag — `started`, and the leading-zero lie

Here is the bug that eats everyone the first time.

You are counting numbers with no two equal adjacent digits. You build `4` as
the 4-digit string `0004`.

```
0 0 0 4     ← "00" are adjacent equal digits!
```

The machine rejects `4`. But `4` is obviously fine — those zeros are **padding,
not digits**. The number `4` has one digit.

```
started = False   every digit so far has been a leading zero;
                  I have not actually begun the number yet
started = True    a nonzero digit has been written; from here the
                  constraint applies for real
```

```python
started_next = started or (d > 0)
```

> **When do you need `started`?** Only when the property you are counting cares
> about *digit adjacency, digit count, or the first digit*. If the property is
> per-digit and independent (e.g. *"contains no digit 4"*), leading zeros are
> harmless and `started` is dead weight.
>
> **Ask, every time: "does a leading zero change the answer for this property?"**
> Do not add the flag by reflex, and do not omit it by reflex.

---

## What changed?

| Chapter 15 (bitmask) | Chapter 16 (digit) |
|---|---|
| state = a set of visited things | state = a **position in a written number** |
| the input is a matrix | the input is a **bound, as a string** |
| `2ⁿ` states, exponential | `len(N) × 10 × 2 × 2` states — **tiny** |
| minimising a cost | **counting** — so the doors are SUMMED |
| the answer is a cost | the answer is a **count** |
| no boolean flags | two flags: `tight` and `started` |

> **Counting SUMS the doors. Optimizing PICKS one door.** Chapter 5 taught it;
> this is the first pattern chapter since then where it is a `+` and not a
> `min`/`max`. Write `max` here by reflex and you will get `1`.

---

## Range queries, for free

Digitus only ever answers *"how many from `0` to `N`?"* — a **prefix count**.
Everything else is subtraction:

```
count in [L, R]  =  f(R) - f(L - 1)
```

> This is the same instinct as a prefix-sum array. **Never write a two-bounded
> digit DP.** Carrying a lower bound *and* an upper bound doubles your flags and
> quadruples your bugs, for zero gain. Solve `[0, N]`, then subtract.
>
> Watch the `-1`: `f(L)` would include `L` itself. And guard `L = 0`.

---

## TRAP 1 — memoising the `tight` path

```python
@lru_cache(maxsize=None)
def go(pos, prev, tight, started): ...
```

This is correct **only because `tight` is part of the key**. If you drop it from
the signature "to save space", the free-suffix count gets stored under the same
key as the capped-suffix count, and the first one computed poisons the other.

> The reverse concern is also worth knowing: there is exactly **one** `tight`
> path down the tree, so those states are never reused anyway. Caching them
> costs nothing and removing them from the key costs correctness. Keep the flag
> in the key.

---

## TRAP 2 — the base case returns `1`, not `0`

```python
if pos == n:
    return 1
```

You reached the end of the number having written every digit legally. **That is
one complete valid number.** It is not "nothing found".

> In a **counting** DP the base case is `1` for "one way to do nothing" —
> Chapter 5's `dp[0] = 1` for Coin Change II is the same truth. In an
> **optimising** DP the base is a cost or a sentinel. Your fingers will type `0`
> because eleven chapters of min/max problems trained them to.
>
> And when `started` matters: `return 1 if started else 0` — because the
> all-zeros path represents the number `0`, and whether that counts depends on
> whether the problem's range starts at `0` or `1`. **Derive it from the
> question asked.**

---

## TRAP 3 — the cap comes from `tight`, not from the loop

```python
hi = digits[pos] if tight else 9      # RIGHT
hi = digits[pos]                      # WRONG -- caps every position forever
hi = 9                                # WRONG -- ignores N entirely; counts all
                                      #          len(N)-digit strings
```

The second bug returns something far too small; the third returns something far
too large. Both run silently.

---

## Digitus closes the ledger

> "Anything phrased *'how many numbers up to N such that…'* is mine. No digit
> four. No two equal neighbours. Digits sum to seven. Divisible by thirteen.
> Strictly increasing digits. A palindrome.
>
> The walk never changes. Only what you carry changes — and what you carry is
> always the smallest thing the rule needs to look back at."

```
"no digit 4"              carry: nothing
"no two equal neighbours" carry: prev digit, started
"digit sum = S"           carry: the running sum
"divisible by K"          carry: the running remainder mod K
"digits non-decreasing"   carry: prev digit
"count of digit 1"        carry: the running count
```

> **That last column is Slot 1.** Everything else in this family is boilerplate.

---

## Cliffhanger

Reco steps out of the counting-house into a hall of black and white squares. A
woman sits cross-legged at its centre, rolling a knucklebone die, and the horse
carved on the board in front of her moves without being touched.

> "Digitus counted what is *certain*. I count what is *likely*.
>
> My knight leaps eight ways and does not choose — the die chooses, and each
> leap carries one eighth of the weight. Nothing here is a maximum. Nothing
> here is a minimum.
>
> **Every door is taken at once, and the sum must always come to one.**"

Next: **Fortuna the Dice-Walker**, and the day the table stopped holding costs
and started holding *probability*.

> Continue to `02 - worked example.md`.


</details>
