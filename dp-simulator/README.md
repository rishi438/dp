# DP Academy simulator

React/Vite learning app for chapters 0–18. The original book remains in Story,
Worked example, and Book exercises. Coding practice contains 30 explicitly
defined exercises with Python and Rust function-body editors and protected runners.

## Run

From this directory:

```powershell
npm install
npm run dev
```

Open http://127.0.0.1:5173. This single command starts Vite and the native runner
on 127.0.0.1:4173. `start-simulator.bat` in the parent directory does the same.
Python and Rust must be on PATH for their respective Run buttons to work. The
editor reports the actual detected versions. No packages beyond Python's standard
library or Rust's standard library are required by the runners.

For a production preview, run `npm run build` followed by `npm start`, then open
http://127.0.0.1:4173. The parent `preview-simulator.bat` builds and starts this.

## Learning flow

- Read Story and Worked example, then open **Your reasoning**. Write the fulcrum,
  state, transition, base case, and final answer in your own words. The local AI
  reviews their meaning and consistency, with feedback beside each answer.
- Simulation and reference playback are always accessible. Before coding, choose
  guided review or **Skip review — I've already solved this**. The skip choice is
  saved per exercise and is distinct from an accepted review. Return with **Review
  my reasoning** anytime. Editing an assessed answer clears its assessment; you can
  review again or skip. Switching exercises keeps separate saved plans.
- Review is AI feedback, not a proof of correctness. Protected execution tests
  still check the implementation afterwards. Earlier notes and code drafts remain saved.
- Choose a chapter. Simulation and Recursion Tree vs Memo use only relevant exercises.
- Expand Inputs & edge cases to apply examples or bounded custom JSON inputs.
- Visual walkthrough preserves the specialized chapter diagrams. Trace & predict
  shows actual recurrence calls and asks for values before revealing them.
- Recursion Tree vs Memo compares the same recurrence and input with/without caching.
  Plain recursion stops after 2,500 calls. The graph displays at most 120 nodes;
  the step log includes all calls within the trace limit.
- In coding practice, only the function body is editable. The server reconstructs
  the function signature and runner, executes tests, and compares actual results
  against expected values. Exiting successfully does not mean the solution passed.
- Original book exercises include proofs and open-ended variants. Their saved
  written answers are for manual review, not automatically marked correct.
- Chapter position, theme, review status, quiz answers, mistakes, inputs, reasoning,
  and per-exercise/per-language drafts are stored in this browser's local storage.
  Clearing site data removes these saves. There is no account or cloud sync.

## Local reasoning reviewer

Install/start Ollama and make the model available with `ollama pull gpt-oss:20b`
if it is not already installed. The model is large; review speed depends on local
hardware. The server calls only `http://127.0.0.1:11434/api/chat`, with structured
JSON output. No cloud account or API key is used. Answers and the exercise contract
are sent to this local model; they are not logged by the simulator server.

To use another compatible installed model, set `$env:DP_REASONING_MODEL = 'model-name'`
before `npm run dev` (or `npm start`). Restart the dev server after changing this
setting or the review endpoint. Model choice affects feedback quality.

Only one review runs at a time, with a two-minute timeout. Unavailable, cancelled,
incomplete, and malformed reviews preserve answers without marking them accepted.
Skip remains available, including when the local reviewer is offline. This is an
optional learning step stored in the browser, not an authentication boundary.

## Native runner boundary

This is a **local, trusted-code learning tool**, not a hosted multi-user sandbox.
Entered Python/Rust executes with your operating-system permissions. Read-only
editor regions protect the exercise contract, not the operating system.

The HTTP server binds only to loopback and checks Host, Origin, content type,
problem ID, language, and body length. It permits one execution at a time, caps
request/output sizes at 64 KB, and stops compilation/runs after 20/8 seconds.
Generated source and executables live in a unique temporary directory that is
cleaned after the process closes. Do not expose this runner to a public network.

## Verification

```powershell
npm test
npm run build
```

Tests cover independently specified answers, zero/empty/negative boundaries,
memoization equivalence, brute-force digit-DP checks, real Python/Rust execution,
wrong-answer rejection, timeout/output bounds, API validation, and server rendering
of the specialized chapter visualizations. Rendering checks do not replace a live
browser check of interactions, accessibility, or responsive layout.
