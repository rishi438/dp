# THE BOOK: Dynamic Programming — From Panda to Kratos

> One algorithm. One book. Many chapters.
> Each chapter is a FOLDER with sub-files. You read the story, study one worked
> example, then face escalating challenges. I analyze your answers, find your
> weak point, and hold you on it until you're confident — THEN the next chapter
> unlocks. Each chapter ends on a cliffhanger that pulls you into the next.

---

## How Each Chapter Works

Inside every `chapter N - ...` folder:

```
01 - story.md          →  the narrative + the concept (gentle entry)
02 - worked example.md →  I solve ONE problem fully, step by step
03 - your challenge.md →  YOU solve similar ones; difficulty rises; I analyze
```

**The training loop, every chapter:**
```
read story  →  study my worked example  →  you attempt challenge 1 (easy)
     →  I diagnose  →  drill your weak spot  →  challenge 2 (medium)
     →  challenge 3 (hard)  →  confident?  →  cliffhanger  →  next chapter
```

You do NOT advance until you own the current chapter. No skipping.

---

## The Two Halves

```
Ch 0-4    APPROACH  —  HOW you build the table   (recursion → memo → table → rolled)
Ch 5-18   PATTERN   —  WHAT the table MEANS      (the 15 families)
```

You need both.
**Approach without pattern** = you can code but can't start.
**Pattern without approach** = you can start but can't finish.

---

## The Chapter Map (the curriculum)

### Half 1 — APPROACH

```
Ch 0   Basic Info              the villain, the laws, the five slots
Ch 1   Without Memoization     feel the pain of repeated work            (Reco)
Ch 2   With Memoization        the notebook. Top-down. The cure.         (the Wizard)
Ch 3   Bottom-Up (Tabulation)  no stack — and the Invariant Lens         (Tabby)
Ch 4   Space-Optimized         throw away the table, keep two numbers    (the Cloth)
```

### Half 2 — PATTERN

```
Ch 5   Choosing from a set     Coin Change / Word Break        Corin the Coinsmith
Ch 6   Best contiguous run     Kadane                          Kade the Streak-Runner
Ch 7   Two sequences           LCS / Edit Distance             The Twin Scribes
Ch 8   Grid movement           Min Path Sum / Unique Paths     Gridlock the Maze Warden
Ch 9   Subset / knapsack       0/1 Knapsack / Target Sum       Sacky the Packmaster
Ch 10  Ordered chain (LIS)     Longest Increasing Subseq       Lissa the Chainbuilder
Ch 11  State machine           Stock w/ Cooldown               Modus the Mask-Wearer
Ch 12  Interval split          Matrix Chain / Burst Balloons   Vale the Splitter
Ch 13  Palindromes             Longest Palindromic Subseq      Mirra the Mirror-Twin
Ch 14  Tree DP                 House Robber III                Root the Elder Tree
Ch 15  Bitmask DP              Travelling Salesman             Maska the Bit-Witch
Ch 16  Digit DP                Count numbers under N           Digitus the Ledger Keeper
Ch 17  Probability DP          Knight Probability              Fortuna the Dice-Walker
Ch 18  Optimized DP            Jump Game VI                    Swift the Deque Ronin
```

The chain is a cliffhanger story:
```
Ch1 shows the disease  →  Ch2 gives the cure  →  Ch3 rebuilds it stronger
   →  Ch4 makes it lean  →  Ch5+ reveals he doesn't know WHAT to build.
```

---

## The Things That Never Change

No matter the chapter, these stay constant:

**The Two Laws (is DP even allowed?)**
```
1. Optimal Substructure  → big answer built from smaller answers
2. Overlapping Subproblems → same small problem repeats
```

**The Five Slots (how to crack any DP)**
```
0. FULCRUM      "What was the LAST decision that landed me here?"  → the doors
1. STATE        What does dp[i] MEAN in plain English?
2. TRANSITION   If a genie solved smaller dp's, how do I build dp[i]?
3. BASE CASE    Smallest answer I know without thinking? — DERIVE, never copy
4. TERMINATION  WHERE does the answer live? dp[n]? max(dp)? a corner?
```

> Slots 0 and 4 are the two everybody skips — and the two that cost you the
> problem. Most courses teach only 1–3 and call them "the three questions."

**The Invariant Lens (why your loop is CORRECT — introduced in Ch 3)**

| Loop-invariant phase | DP name          | What it means here                              |
|----------------------|------------------|-------------------------------------------------|
| **Initialization**   | Base Case        | The starting truth you know without computation |
| **Maintenance**      | Transition       | One step forward preserves correctness          |
| **Termination**      | State (final)    | Loop ends → `dp[n]` holds the answer            |

Three phases → three failure modes → three places to look:
```
Shape right but answer wrong     → INITIALIZATION (you copied a base case)
Small n right, large n wrong     → MAINTENANCE (missing door, or bad loop order)
All cells right, return wrong    → TERMINATION (you read the wrong cell)
```

---

## Your Current Position

```
[ ] Ch 0  — Basic Info            ← START HERE
[ ] Ch 1  — Without Memoization
[ ] Ch 2  — With Memoization
[ ] Ch 3  — Bottom-Up
[ ] Ch 4  — Space-Optimized
--- approach complete; patterns begin ---
[ ] Ch 5  — Choosing from a set
[ ] Ch 6  — Best contiguous run
[ ] Ch 7  — Two sequences
[ ] Ch 8  — Grid movement
[ ] Ch 9  — Subset / knapsack
[ ] Ch 10 — Ordered chain (LIS)
[ ] Ch 11 — State machine
[ ] Ch 12 — Interval split
[ ] Ch 13 — Palindromes
[ ] Ch 14 — Tree DP
[ ] Ch 15 — Bitmask DP
[ ] Ch 16 — Digit DP
[ ] Ch 17 — Probability DP
[ ] Ch 18 — Optimized DP
```

Also in this folder: **`pattern.md`** — the field guide. Use it whenever you're
stuck deciding *is this DP?* and *which family?*

Open `chapter 0 - basic info/01 - story.md` and begin.
The panda's real training starts now.
