# Chapter 1: Solve smaller questions with recursion

**Recursion means a function asks itself to solve a smaller version of the same question.** It stops when it reaches an answer we already know.

Use Fibonacci numbers as the example:

```text
Position:  1  2  3  4  5  6
Number:    1  1  2  3  5  8
```

The first two numbers are 1. Each later number is the sum of the two before it.

## What the function means

`fib(n)` means "give me the Fibonacci number at position n," for `n >= 1`. There is no `dp` table yet. The function call represents the smaller question we want answered.

- **Smaller questions:** find `fib(n-1)` and `fib(n-2)`.
- **Calculation:** add their answers.
- **Starting answers:** `fib(1) = 1` and `fib(2) = 1`.
- **Final answer:** the value returned by the original call, such as `fib(5)`.

For Fibonacci, both smaller answers are needed. They are not competing choices where we keep just one.

## What happens for position 5?

```text
fib(5) asks for fib(4) and fib(3).
fib(4) asks for fib(3) and fib(2).
                    ^
             fib(3) is needed again.
```

The calculation is correct, but plain recursion does not keep earlier results. The second call to `fib(3)` repeats the same work as the first.

This repetition grows quickly as `n` increases. A recursion tree shows it: each node is one function call, and its children are the calls it makes.

**Common mistake:** believing the computer automatically remembers a function's answer. Calling `fib(3)` again runs the function again unless we explicitly save the result. Chapter 2 adds that saved memory; the Fibonacci calculation stays the same.

---

<details>
<summary>More detail and extra examples (optional)</summary>

# Chapter 1 · 01 — Story: Without Memoization (Feel the Pain)

> This chapter has NO notebook. On purpose. You must feel the villain before
> you earn the cure in Chapter 2.

---

## Reco, Proud and Naive

Reco just mastered recursion. No memory yet. The King asks for Fibonacci.

Reco writes the most natural code in the world:

```python
def fib(n):
    if n <= 2:          # base case: months 1 and 2 = 1 pair
        return 1
    return fib(n-1) + fib(n-2)   # ask the two smaller months
```

It works. `fib(5) = 5`, `fib(10) = 55`. Reco celebrates. Too soon.

---

## The Hidden Monster (The Call Tree)

Here is what Reco ACTUALLY does for `fib(5)`:

```
                      fib(5)
                 /             \
            fib(4)              fib(3)
           /      \            /      \
      fib(3)     fib(2)    fib(2)    fib(1)
     /     \
 fib(2)   fib(1)
```

Count the waste:
- `fib(3)` computed **2×**
- `fib(2)` computed **3×**

The tree roughly **doubles** every step:

```
fib(10) → ~177 calls
fib(20) → ~21,891 calls
fib(30) → ~2.7 million calls
fib(40) → ~331 million calls
fib(50) → ~40 BILLION calls
```

Time cost ≈ **O(2ⁿ)** — exponential. Reco re-solves the same tiny problems
forever. **This is the villain, live and unmasked.**

---

## Why Learn the Slow Way At All?

Because **plain recursion is where you DISCOVER the structure.**
It hands you three of the five slots for free — they're literally sitting in
the source code:

```
FULCRUM     → the two recursive calls:  fib(n-1) and fib(n-2)
              ("what was my last step?" — it came from one of those)
TRANSITION  → the return line:          return fib(n-1) + fib(n-2)
BASE CASE   → the if line:              if n <= 2: return 1
```

And the other two are implicit but easy to read off:

```
STATE       → the function ARGUMENT:    fib(n) means "the n-th Fibonacci number"
TERMINATION → the top-level CALL:       fib(n) — the one you actually asked for
```

> **Golden rule:** write the plain recursion FIRST to reveal the slots.
> THEN add memory (Chapter 2). Masters start here — they just don't STOP here.

This is why Chapter 1 exists at all. Plain recursion is a terrible *program*
and an excellent *thinking tool*. You are using it as a microscope, not as a
solution.

---

## The Skeleton of Every Plain Recursion

```python
def solve(state):
    if <base case>:
        return <known answer>
    return <combine solve(smaller_1), solve(smaller_2), ...>
```

```
function argument      = STATE
the if                 = BASE CASE
the list of sub-calls  = FULCRUM (your doors, made visible)
the combining return   = TRANSITION
the call you make      = TERMINATION
```

Same five slots from Chapter 0, worn as a function instead of a table.

> **Notice what's missing: the `dp` array.** That's the entire difference
> between Chapter 1 and Chapter 3. The *thinking* is identical; only the
> scaffolding changes. Remember that when bottom-up looks intimidating — it's
> this exact recursion, turned inside out.

---

## Cliffhanger

Reco's naive `fib` is a ticking bomb. In the worked example you'll draw its
tree; in the challenge you'll TIME it on your own machine and watch it choke.

Then — in **Chapter 2 — With Memoization** — the wizard hands Reco a notebook,
and 40 billion calls collapse into just `n`. The cure is coming. But first,
feel the disease.

> Continue to `02 - worked example.md`.


</details>
