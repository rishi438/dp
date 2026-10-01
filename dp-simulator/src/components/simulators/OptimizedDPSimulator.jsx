import { useAutoplay } from '../../hooks/usePlayback';
import React, { useState, useMemo, useEffect } from 'react';
import { Zap, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OptimizedDPSimulator({ input }) {
  const nums = input?.nums ?? [1, -1, -2, 4, -7, 3];
  const k = input?.k ?? 2;
  const n = nums.length;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1300);
  const [activeLang, setActiveLang] = useState('python');

  // Precompute step-by-step Jump Game VI execution with Deque
  const { steps, finalDp } = useMemo(() => {
    const dp = Array(n).fill(0);
    const deque = []; // stores indices
    const allSteps = [];

    // Step 0: base case
    dp[0] = nums[0];
    deque.push(0);

    allSteps.push({
      i: 0,
      dpVal: nums[0],
      dequeSnapshot: [...deque],
      frontMaxIndex: 0,
      frontMaxVal: nums[0],
      evictedFront: null,
      evictedBack: [],
      line: 3,
      desc: `Base step: dp[0] = nums[0] = ${nums[0]}. Deque initialized with index [0].`,
      tableSnapshot: [...dp]
    });

    for (let i = 1; i < n; i++) {
      let evictedFront = null;
      // 1. Evict out of window (i - k)
      if (deque.length > 0 && deque[0] < i - k) {
        evictedFront = deque.shift();
      }

      // 2. Best candidate is front of deque
      const bestIdx = deque[0];
      const bestVal = dp[bestIdx];
      dp[i] = nums[i] + bestVal;

      // 3. Maintain monotonic decreasing deque property: pop smaller elements from back
      const evictedBack = [];
      while (deque.length > 0 && dp[deque[deque.length - 1]] <= dp[i]) {
        evictedBack.push(deque.pop());
      }
      deque.push(i);

      allSteps.push({
        i,
        dpVal: dp[i],
        dequeSnapshot: [...deque],
        frontMaxIndex: bestIdx,
        frontMaxVal: bestVal,
        evictedFront,
        evictedBack,
        line: 7,
        desc: `Step ${i}: Front of deque is max dp[${bestIdx}] = ${bestVal}. dp[${i}] = nums[${i}] (${nums[i]}) + ${bestVal} = ${dp[i]}. Deque maintains decreasing order.`,
        tableSnapshot: [...dp]
      });
    }

    return { steps: allSteps, finalDp: dp };
  }, [n, k]);

  const activeStep = steps[currentStepIndex] || steps[0];

  useAutoplay({ playing: isPlaying, step: currentStepIndex, last: steps.length - 1, speed, onStep: setCurrentStepIndex, onStop: setIsPlaying });

  const pythonCode = [
    { num: 1, text: "def max_result(nums: list[int], k: int) -> int:" },
    { num: 2, text: "    n = len(nums); dp = [0] * n; dp[0] = nums[0]" },
    { num: 3, text: "    dq = collections.deque([0])  # store indices" },
    { num: 4, text: "    for i in range(1, n):" },
    { num: 5, text: "        if dq[0] < i - k: dq.popleft()  # out of window" },
    { num: 6, text: "        dp[i] = nums[i] + dp[dq[0]]     # O(1) query!" },
    { num: 7, text: "        while dq and dp[dq[-1]] <= dp[i]:" },
    { num: 8, text: "            dq.pop()                    # maintain monotonicity" },
    { num: 9, text: "        dq.append(i)" },
    { num: 10, text: "    return dp[-1]" }
  ];

  const rustCode = [
    { num: 1, text: "pub fn max_result(nums: Vec<i32>, k: i32) -> i32 {" },
    { num: 2, text: "    let n = nums.len(); let mut dp = vec![0; n]; dp[0] = nums[0];" },
    { num: 3, text: "    let mut dq = std::collections::VecDeque::new(); dq.push_back(0);" },
    { num: 4, text: "    for i in 1..n {" },
    { num: 5, text: "        if *dq.front().unwrap() + (k as usize) < i { dq.pop_front(); }" },
    { num: 6, text: "        dp[i] = nums[i] + dp[*dq.front().unwrap()]; // O(1) max" },
    { num: 7, text: "        while let Some(&back) = dq.back() {" },
    { num: 8, text: "            if dp[back] <= dp[i] { dq.pop_back(); } else { break; }" },
    { num: 9, text: "        }" },
    { num: 10, text: "        dq.push_back(i);" },
    { num: 11, text: "    }" },
    { num: 12, text: "    dp[n - 1]" },
    { num: 13, text: "}" }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-950 px-2 py-0.5 rounded border border-yellow-800">
                Chapter 18 Designated Simulation
              </span>
              <span className="text-xs text-slate-400 font-semibold">Swift the Deque Ronin</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Monotonic Deque DP · Jump Game VI Optimization
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => { setCurrentStepIndex(0); setIsPlaying(false); }}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setCurrentStepIndex(p => Math.max(0, p - 1)); setIsPlaying(false); }}
              disabled={currentStepIndex === 0}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-30"
              title="Step Backward"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold rounded-lg transition-all flex items-center gap-1.5 text-xs shadow-md shadow-yellow-900/40"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={() => { setCurrentStepIndex(p => Math.min(steps.length - 1, p + 1)); setIsPlaying(false); }}
              disabled={currentStepIndex === steps.length - 1}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-30"
              title="Step Forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2 py-1.5 text-xs font-mono"
          >
            <option value={2000}>0.5x Slow</option>
            <option value={1300}>1.0x Normal</option>
            <option value={600}>2.0x Fast</option>
          </select>
        </div>
      </div>

      {/* Main Dual Grid: Array & Deque Visualization vs Synchronized Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Array with Jump Windows + Monotonic Deque Tube */}
        <div className="lg:col-span-7 space-y-4">
          {/* Array with Window */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs mb-3 text-slate-400">
              <span className="font-semibold text-slate-300">Array & Jump Window [i - {k} .. i - 1]</span>
              <span className="font-mono text-yellow-400">Step {currentStepIndex + 1} / {steps.length}</span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {nums.map((num, idx) => {
                const isCurrent = idx === activeStep.i;
                const isInWindow = idx >= activeStep.i - k && idx < activeStep.i;
                const isFrontBest = idx === activeStep.frontMaxIndex && idx < activeStep.i;
                const isComputed = idx <= activeStep.i;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-yellow-500/20 border-yellow-400 text-yellow-100 ring-2 ring-yellow-400/50'
                        : isFrontBest
                        ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400'
                        : isInWindow
                        ? 'bg-cyan-950/40 border-cyan-800 text-cyan-200'
                        : isComputed
                        ? 'bg-slate-950 border-slate-800 text-slate-300'
                        : 'bg-slate-950/40 border-slate-900 text-slate-600'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-500">[{idx}]</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">num: {num >= 0 ? `+${num}` : num}</div>
                    <div className="text-base font-black font-mono mt-1">
                      {isComputed ? activeStep.tableSnapshot[idx] : '?'}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider font-bold mt-0.5">
                      {isCurrent ? 'curr' : isFrontBest ? 'max prev' : isInWindow ? 'window' : isComputed ? 'done' : ''}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Monotonic Deque Tube Visualization */}
            <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-slate-300">Monotonic Decreasing Deque (Front = Maximum)</span>
                <span className="text-[10px] font-mono text-emerald-400">O(1) lookup: q[0]</span>
              </div>

              <div className="flex items-center gap-2 p-2 bg-slate-900/80 border border-slate-800 rounded-lg min-h-[56px] overflow-x-auto">
                <span className="text-[10px] font-bold text-slate-500 uppercase px-1 select-none">FRONT ➔</span>
                {activeStep.dequeSnapshot.map((idx, qPos) => {
                  const isFront = qPos === 0;
                  return (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg border font-mono text-center flex-shrink-0 transition-all ${
                        isFront
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400">idx: {idx}</div>
                      <div className="text-sm font-black">dp: {activeStep.tableSnapshot[idx]}</div>
                    </div>
                  );
                })}
                <span className="text-[10px] font-bold text-slate-500 uppercase px-1 select-none">➔ BACK</span>
              </div>

              {/* Eviction Log */}
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>
                  {activeStep.evictedFront !== null && (
                    <span className="text-rose-400">Popped front idx {activeStep.evictedFront} (expired). </span>
                  )}
                  {activeStep.evictedBack.length > 0 && (
                    <span className="text-amber-400">Popped back {activeStep.evictedBack.length} smaller item(s).</span>
                  )}
                </span>
                <span className="font-mono text-yellow-400 text-[10px]">Invariant: dp[q[i]] ≥ dp[q[i+1]]</span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="font-semibold text-white">{activeStep.desc}</div>
            </div>

            {/* Final Answer Banner */}
            <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Max Result dp[N-1]</div>
                <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                  Optimal path score to end
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Final Score</div>
                <div className="text-base font-extrabold text-yellow-400 font-mono">
                  {currentStepIndex === steps.length - 1 ? `${activeStep.dpVal} points` : 'Computing...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Synchronized Code Viewer */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Synchronized Algorithm</span>
            </div>
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveLang('python')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  activeLang === 'python' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveLang('rust')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  activeLang === 'rust' ? 'bg-orange-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Rust
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-950/90 font-mono text-[11px] leading-relaxed flex-1 overflow-x-auto">
            {(activeLang === 'python' ? pythonCode : rustCode).map((line) => {
              const isHighlight = line.num === activeStep.line;
              return (
                <div
                  key={line.num}
                  className={`flex items-center px-2 py-0.5 rounded transition-all ${
                    isHighlight
                      ? 'bg-yellow-500/20 text-yellow-200 border-l-2 border-yellow-400 font-bold'
                      : 'text-slate-400 hover:bg-slate-900/50'
                  }`}
                >
                  <span className="w-6 text-slate-600 select-none text-right mr-3 text-[10px]">
                    {line.num}
                  </span>
                  <pre className="font-mono whitespace-pre">{line.text}</pre>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>Time: <span className="text-yellow-400 font-bold">O(N) Amortized</span></span>
              <span>Space: <span className="text-yellow-400 font-bold">O(K) Deque</span></span>
              <span>Speedup: <span className="text-emerald-400 font-bold">O(N·K) → O(N)</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
