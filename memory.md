# DP Simulator project memory

## Project
- Root: C:\Users\AMD\OneDrive\Desktop\Study\dp. React/Vite app: dp-simulator.
- Original curriculum: chapters 0-18. Preserve .agent/rules/graperoot.md and .codex/rules.
- Existing app and launcher files were untracked at task start; no commit made.

## Current behavior and validation — 2026-09-30 evening
- Write code pane switch (2026-10-01): removed the cramped nested simulator/reference split from CodingExercise. Left keeps Question/Simulator; outer right switches Your solution/Code flow. A portal shares the same trace and playback, preserves mounted editor draft/results and simulation position, pauses when reading the problem, and brings code inside the expanded dialog. Standalone simulation unchanged. Live verified synchronized stepping, draft/step retention, cache mode, expansion/Escape and 390px stacking without overflow; 53 tests/build pass. Screenshot .tmp/write-code-right-flow.png; backup .codex/backups/20261001-outer-code-flow/. Temporary browser draft/review preferences restored.
- Learning sequence: Story → Worked example → Your reasoning → Simulation → Recursion Tree vs Memo → Write code → Trap drills. User clarified review must be OPTIONAL. Simulation and Recursion Tree vs Memo open directly. Before coding, choose guided five-slot review or "Skip review — I've already solved this". Skip is saved per exercise, distinct from acceptance; "Review my reasoning" returns to feedback. All 30 exercises plus Gold Collector have separate saved plans; legacy notes and code drafts remain intact.
- POST /api/reasoning/review uses installed local Ollama gpt-oss:20b at 127.0.0.1:11434. DP_REASONING_MODEL overrides it at server startup. No cloud/API keys. Structured field feedback checks meaning and consistency; all fields must be correct. Exact problem/answer snapshot binds approval. Edits invalidate approval; cancellation, unavailable model and malformed responses stay locked. AI review can be wrong; protected implementation tests still apply.
- Reviewer code: dp-simulator/reasoning-review.js; domain: src/data/reasoning.js; UI: ReasoningGate.jsx and ReasoningWorkspace.jsx. Shared practice selection spans reasoning/simulation/code. README contains setup.
- Small tree is a complete small input (not a cropped viewport); Large tree uses a separate complete larger input. Code playback includes solve, memo initialization, go entry, key, lookup, evaluation, memo store and return. In-page expansion preserves OS/browser chrome; seek, previous/next, playback and pace remain accessible.
- Compact trace footer (2026-10-01): replaced the tall raw JSON input block with inline named values and the empty two-column table with a collapsible memo section, saved-state count and short empty-state explanation. Table appears only when results exist; existing prediction filtering remains intact. Verified live empty/populated/collapsed states; 53 tests and build pass. Screenshots: .tmp/compact-trace-empty.png and .tmp/compact-trace-saved.png. Backup: .codex/backups/20260930-224644-compact-trace-details/.
- Cache comparison (2026-10-01): shared TraceExplorer now exposes With cache / Without cache beside tree-size buttons across chapters, including normal Simulation. Switching resets playback while preserving selected input/size. Displays both total call counts and cache hits for the selected run. Live large LIS verified: plain 41 calls/0 hits, cached 25 calls/17 hits, both answer 4; plain code has no memo. 53 tests/build pass. Browser left on large LIS with cache at step 0. Backup: .codex/backups/20261001-073746-cache-comparison/.
- Resizable coding workspace (2026-10-01): ResizableWorkspace.jsx gives the simulator 55% by default and uses the full page width; editor height unchanged. Pointer/keyboard divider clamps simulator >=440px and editor >=480px, stores workspace.split, supports double-click reset, and stacks when space is insufficient. Removed simulator's nested 950px scroll box. CallGraph observes canvas resizing and refits nodes. Live verified drag, minimums, keyboard, reload persistence and narrow-screen stacking/refit. At 2048px, default panes are about 1074/879px. 53 tests/build pass; screenshot .tmp/resizable-workspace-desktop.png. Temporary test preferences removed, browser restored to Chapter 10 Simulation. Backup: .codex/backups/20261001-075108-resizable-workspace/.
- Floating playback (2026-10-01): TraceExplorer and StaircaseSimulator use one compact Reset/Previous/Play-Pause/Next/seek/Pace dock inside the canvas; reserved canvas space prevents covering nodes. Simulation stays left and synchronized reference code right, including inside coding workspace and expanded view; container widths <=620px stack. Current event moved into Code flow, recurrence/work counts and tree notes are collapsible, duplicate Physics text button removed (canvas icon retained). Cache and input-size choices remain available. Live checked stepping, play/pause, speed, seek-to-answer, expanded Escape, mobile fit, nested workspace, frog dock, prediction hiding/block/reveal. 53 tests/build pass. Screenshot .tmp/floating-playback-workspace.png; backup .codex/backups/20261001-080133-floating-playback/.
- Latest validation: 53 tests and production build pass. Existing test HMR-port warning is nonfatal. Live Playwright browser is available even when CUA has no tabs. Verified wrong LIS reasoning blocked, correct LIS accepted, valid alternative coin-combination formulation accepted, vague answers rejected, reload persistence, edit invalidation, chapter isolation and shared exercise selection. Desktop/mobile and light/dark reasoning forms inspected.
- Live dev server restarted for the review endpoint; localhost:5173 and :4173 are running. Browser now left at Chapter 10 / Simulation; temporary test plan removed. Verified optional skip opens editor with empty answers, survives reload without fake acceptance, and allows returning to review. Chapter simulations render without any reviewed plan; tests and build pass.
- Verified backups: .codex/backups/20260930-224037-restore-simulator-access/ (optional-review correction); .codex/backups/20260930-221554-reasoning-first/; earlier expanded-layout backup: .codex/backups/20260930-220727-expanded-canvas-layout/.

## Implemented 2026-09-29
- Chapter-specific problem selectors and actual recursion/memo traces across all chapters; custom bounded inputs and prediction mode.
- 30 explicit coding practices in src/data/practice.js; original book exercises retained as saved written work. Removed generic Fibonacci challenge fallback.
- Python/Rust editor inspired by image.png: locked signatures/imports/main runner, editable function body, server-owned tests, actual-vs-expected results.
- Saved chapter/tab/theme, reviewed chapters, solved exercises, drafts per exercise/language, notes, quiz answers and mistakes.
- Light/dark themes; 44 quiz questions with exact chapter filters and retry mistakes.
- Specialized visuals accept custom inputs; repaired coin unreachable states, tree layout/value, variable-size matrix/bitmask boards, shared playback and correct zero bases.
- Native runner: loopback only, origin/host validation, 64 KB request/output bounds, single active run, timeouts and process cleanup. Trusted local code only; not an OS sandbox.
- Lazy chapter markdown reduced initial JS from about 797 KB to 238 KB (uncompressed build).

## Commands and validation
- cd dp-simulator; npm run dev: Vite 127.0.0.1:5173 + runner 127.0.0.1:4173.
- npm test: 39 passing tests, including algorithm fixtures, brute-force digit checks, real Python/Rust harnesses, runner bounds/API rejection, and component server rendering.
- npm run build: passed. Vite/esbuild requires escalation in this environment due sandbox parent-directory access.
- Python 3.12.7 and rustc 1.95.0 detected through live /api/health.
- No browser was connected (CUA listBrowsers returned []); screenshots, responsive layout, and interactive browser flows remain visually unverified.
- Startup scripts and dp-simulator/README.md describe the single-command setup.

## Backup
- Original edited source/config/launcher files backed up and hash verified under .codex/backups/20260929-225152-simulator-upgrade/.

## Chapter quizzes — 2026-09-30
- User requires separate chapter-dependent Trap Drills, no combined chapter sets, and numbered question buttons.
- src/data/chapterQuizzes.js keeps all original question IDs and adds specific trap questions: 170 total, 8–12 per chapter.
- Number buttons show current/unanswered/correct/incorrect status. Mistake retry is restricted to the current chapter; question position is saved per chapter. Switching chapters resets transient review mode.
- Quiz tests cover chapter isolation, question preservation, answer retention, and numbered navigation rendering. Live browser interaction remains unverified (no connected browser).
- Pre-change backups: .codex/backups/20260930-080401-chapter-quizzes/.

## Restored visual/code walkthroughs — 2026-09-30
- Restored the actual FlowVisualizer frog staircase, doors, clickable DP table and bounded physical path proof. Classic/Tribonacci quick buttons and a stair-count control are visible. Gold Collector belongs only to Chapter 0's simulation choices.
- Chapters 1/2 show frog states synchronized with recursive calls/returns (plain/memoized respectively), with a call-tree switch. Chapters 3/4 keep their original tabulation/rolling visualizers plus a full-table frog option.
- All 30 practice problems and the simulation-only Gold Collector now have Python reference code, active call/cache/return lines and live state variables in TraceExplorer. Prediction mode hides return values in the code panel too.
- Challenges show the simulation alongside the protected editor by default. Reference playback is explicitly separate from learner code execution; no arbitrary learner-code line tracing is implemented.
- Validation: 45 tests and production build pass. Executed displayed Python for every example in plain/memo modes and compared every state call/cache hit/return with JS trace. Server-render checks cover all problem examples and restored staircases. Existing Vite HMR port warning during tests is non-fatal.
- No connected browser; live animation/layout remains visually unverified. Backup: .codex/backups/20260930-restore-visual-code/ (7 files, hashes verified).

## Restored recursion tree interaction — 2026-09-30
- TraceExplorer defaults to Small piece: at most five calls (current, parent, up to two children, and an earlier matching state). Full tree is opt-in and capped at 120 displayed calls; focused playback follows calls beyond that cap. Rounded tiles remain draggable within the current view.
- Fixed dotted canvas: dragging tiles cannot pan the viewport; explicit zoom/fit controls remain. Tile, edge, handle, and control colors use the editor's light/dark theme tokens.
- Layout helper: dp-simulator/src/data/callTree.js. Retains the 120-call display limit and full bounded playback/code synchronization.
- Larger labels and opaque theme-aware tiles: blue current-call outline, green cached/returned, red repeated work, amber waiting; visible legend. Small-piece fitting keeps a readable scale.
- Validation: 47 tests and production build pass; existing test HMR port warning is non-fatal. No connected browser, so live dragging/layout remains visually unverified.
- Verified pre-edit backups: .codex/backups/20260930-083154-restore-call-tree/ and .codex/backups/20260930-focused-call-tree/.
