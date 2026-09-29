# Chapter 2 · 03 — Your Challenge (Easy → Hard)

> Write your answers under each prompt, then say **"done"**.
> For every coding challenge: name all **five slots** before you write code,
> and say explicitly **what your memo key is** and why it's complete.

---

## Challenge 1 (Easy) — The two commandments

Here is a broken memoization:

```python
def fib(n, memo={}):
    if n <= 2:
        return 1
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]
```

1. Which commandment is missing?
2. What is the time complexity of this code as written? Justify it.
3. Does it still return the **correct** answer? (Careful — this matters.)
4. Fix it with one line.

**Your answer:**


---

## Challenge 2 (Easy) — Predict before you run

Using `TIME = (distinct states) × (cost of one transition)`, predict the time
complexity of each, **without writing code**:

```
(a) fib(n)                                    states = ?   per-state = ?   total = ?
(b) Coin Change: coins[], amount              states = ?   per-state = ?   total = ?
(c) Grid paths: an R × C grid                 states = ?   per-state = ?   total = ?
(d) LCS of strings of length m and n          states = ?   per-state = ?   total = ?
```

**Your answer:**


---

## Challenge 3 (Medium) — Memoize a 2-argument state

Problem: **Unique Paths.** How many ways from `(0,0)` to `(R-1, C-1)` moving
only right or down?

1. Name the five slots.
2. **What is your memo key?** Why must it be `(r, c)` and not just `r`?
3. Write the memoized (top-down) solution.
4. Predict `unique_paths(3, 7)` before running it.

**Your answer:**


---

## Challenge 4 (Medium) — Measure it yourself

Take YOUR Challenge 3 solution and:

1. Add a call counter, as in the worked example.
2. Run it with and without the memo for a `10 × 10` grid.
3. Report both call counts.
4. Does the ratio match your Challenge 2(c) prediction? If not, explain the gap.

**Your answer:**


---

## Challenge 5 (Hard / TRAP) — The key that lies

A student solves **"max sum path in a grid, but you may use at most `k`
diagonal shortcuts"** like this:

```python
@lru_cache(None)
def best(r, c):                  # ← the key
    ...
    # inside, the code reads and decrements a variable `k` from an outer scope
```

1. The answers come back **fast and wrong**. Explain precisely why, in terms of
   the state.
2. Which rule from the story is being violated? Which TRAP number in
   `../pattern.md` is this?
3. Fix the key. Write the corrected signature.
4. What does the fix do to the number of distinct states, and therefore to the
   time complexity?

> **Why this is the nastiest bug in Chapter 2:** an unmemoized wrong answer is
> slow *and* wrong, so you notice. A *cached* wrong answer is fast and wrong.
> It looks like success.

**Your answer:**


---

## Challenge 6 (Hard / TRAP) — When the notebook is useless

Three functions. For each one, answer: **would memoization speed it up? Why or
why not?** Be specific about whether distinct subproblems *repeat*.

```python
# (a)
def fact(n):
    return 1 if n == 0 else n * fact(n-1)

# (b)
def binom(n, k):
    if k == 0 or k == n:
        return 1
    return binom(n-1, k-1) + binom(n-1, k)

# (c)
def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    return merge(merge_sort(a[:mid]), merge_sort(a[mid:]))
```

Then answer the big one:

> All three are recursive. All three have **optimal substructure**.
> Only some are DP. **What exactly separates a Divide-and-Conquer recursion
> from a Dynamic Programming recursion?** Answer in one sentence, then explain
> how you would *test* it on a function you've never seen.

**Your answer:**


---

## Challenge 7 (Hard) — Break it on purpose, then fix it

1. Run `fib_memo(3000)` from the worked example. What exception do you get?
2. Why does a *memoized* function still hit this, when it only does `n` real
   units of work?
3. Two fixes exist. Name both, and say what each one costs you.
4. Which fix is Chapter 3 about?

**Your answer:**


---

## After You Answer

I will check, in priority order:

1. **C5 and C6** — these are the two real tests. C5 is the under-specified key
   (TRAP 16, your known weak point wearing a disguise). C6 is Law 2 — the
   thing Chapter 1 made you suffer for.
2. **C1.3** — subtle. Missing commandment 1 does **not** break correctness,
   only speed. If you said "it returns wrong answers," we drill the difference
   between a *correctness* bug and a *performance* bug.
3. **C2 vs C4** — did your measured numbers match your predicted complexity? I
   want you predicting before running, every time, from here on.
4. Drill whatever wobbled.
5. Then **Chapter 3 — Tabby and the Bottom-Up Table** opens, where the stack
   disappears and you finally get a way to *prove* a DP correct instead of
   hoping.

Write your answers. Then say **"done"**.
