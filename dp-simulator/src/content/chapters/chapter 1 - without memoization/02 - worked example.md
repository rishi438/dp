# Chapter 1 · 02 — Worked Example: Watching Plain Recursion Explode

> I take one plain recursion, draw its waste, and MEASURE the pain.
> You'll repeat this measurement yourself in the challenge.

---

## The Code (no memory)

```python
def fib(n):
    if n <= 2:
        return 1
    return fib(n-1) + fib(n-2)
```

---

## Step 1 — Draw the Waste for fib(6)

```
                         fib(6)
                    /              \
               fib(5)              fib(4)
              /     \             /     \
        fib(4)    fib(3)     fib(3)   fib(2)
        /   \      /  \       /  \
   fib(3) fib(2) ...  ...   ... ...
```

Just eyeballing it:
- `fib(4)` appears **2×**
- `fib(3)` appears **3×**
- `fib(2)` appears **5×**

Every branch redoes work its sibling already did. Nobody shares answers.

---

## Step 2 — Count the Calls (prove the explosion)

Add a counter to SEE how many times the function runs:

```python
calls = 0
def fib(n):
    global calls
    calls += 1
    if n <= 2:
        return 1
    return fib(n-1) + fib(n-2)

for n in [10, 20, 30]:
    calls = 0
    fib(n)
    print(f"fib({n}) needed {calls} calls")
```

Expected shape of the output:
```
fib(10) needed 109 calls
fib(20) needed 13529 calls
fib(30) needed 1664079 calls
```

Ten steps up (20→30) multiplied the work by ~123×. That's exponential pain.

---

## Step 3 — Feel It in Time

```python
import time

def fib(n):
    if n <= 2:
        return 1
    return fib(n-1) + fib(n-2)

for n in [30, 35, 40]:
    start = time.time()
    fib(n)
    print(f"fib({n}) took {time.time() - start:.3f} s")
```

`fib(30)` is quick. `fib(35)` makes you wait. `fib(40)` — noticeably slow.
`fib(50)` would take longer than you're willing to sit there. THAT is the villain.

---

## Step 4 — Extract the Structure (the silver lining)

Even though it's slow, this plain code GAVE us the DP blueprint for free.
Read the five slots straight off the source:

```python
def fib(n):              # STATE       = the argument. fib(n) = the n-th Fibonacci number
    if n <= 2:           # BASE CASE   = the if
        return 1
    return fib(n-1) + fib(n-2)
           └────┬────┘   └────┬───┘
                └──────────┴────── FULCRUM    = the sub-calls (your two doors)
                                 TRANSITION = the whole return line (+ = counting)
```

```
0. FULCRUM     = "what was my last hop?" → from n-1 or n-2. Two doors.
1. STATE       = fib(n)  → the n-th Fibonacci number
2. TRANSITION  = fib(n-1) + fib(n-2)
3. BASE CASE   = if n <= 2: return 1
4. TERMINATION = the top-level call fib(n) — the value you actually asked for
```

We keep the blueprint. We just need to stop REDOING work.
That fix is one notebook away.

> **This is the habit to build:** before you optimise anything, make sure you
> can point at all five slots in your own code. If you can't name them, you
> don't understand your own recursion — and memoizing something you don't
> understand just makes a fast wrong answer.

---

## Takeaway

```
Plain recursion:  correct, natural, reveals all 5 slots — but EXPONENTIAL.
The problem:      identical subproblems recomputed endlessly.
The fix (Ch 2):   remember each answer the first time. O(2ⁿ) → O(n).
```

> Your turn: `03 - your challenge.md`. You'll measure the pain yourself and
> extract structure from a NEW problem.
