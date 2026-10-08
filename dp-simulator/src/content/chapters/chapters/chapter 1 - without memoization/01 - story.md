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
