import { useAutoplay } from '../../hooks/usePlayback';
import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, ArrowRight, Minimize2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SpaceOptimizedSimulator({ input }) {
  const [n, setN] = useState(input?.n ?? 7);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const [activeLang, setActiveLang] = useState('python');

  // Compute step-by-step rolling window states
  // dp[i] = dp[i-1] + dp[i-2]
  // In space-optimized: prev2, prev1, curr
  const steps = [];
  steps.push({
    step: 0,
    i: 0,
    prev2: null,
    prev1: null,
    curr: 1,
    line: 3,
    desc: 'Base case 0: curr = 1. Only 1 way to stand at ground 0.'
  });
  if (n >= 1) {
    steps.push({
      step: 1,
      i: 1,
      prev2: 1,
      prev1: 1,
      curr: 1,
      line: 4,
      desc: 'Base case 1: prev2 = 1, prev1 = 1. Starting registers initialized.'
    });
  }

  let p2 = 1;
  let p1 = 1;
  for (let i = 2; i <= n; i++) {
    const cur = p1 + p2;
    steps.push({
      step: i,
      i: i,
      prev2: p2,
      prev1: p1,
      curr: cur,
      line: 6,
      desc: `Step ${i}: curr = prev1 (${p1}) + prev2 (${p2}) = ${cur}. Rolling window shifts forward!`
    });
    p2 = p1;
    p1 = cur;
  }

  const active = steps[currentStep] || steps[0];

  useAutoplay({ playing: isPlaying, step: currentStep, last: steps.length - 1, speed, onStep: setCurrentStep, onStop: setIsPlaying });

  const pythonCode = [
    { num: 1, text: "def climb_stairs_optimized(n: int) -> int:" },
    { num: 2, text: "    if n <= 1: return 1" },
    { num: 3, text: "    prev2 = 1  # represents dp[i-2]" },
    { num: 4, text: "    prev1 = 1  # represents dp[i-1]" },
    { num: 5, text: "    for i in range(2, n + 1):" },
    { num: 6, text: "        curr = prev1 + prev2  # compute current" },
    { num: 7, text: "        prev2 = prev1         # discard oldest" },
    { num: 8, text: "        prev1 = curr          # slide window" },
    { num: 9, text: "    return curr" }
  ];

  const rustCode = [
    { num: 1, text: "pub fn climb_stairs_optimized(n: usize) -> u64 {" },
    { num: 2, text: "    if n <= 1 { return 1; }" },
    { num: 3, text: "    let mut prev2 = 1u64; // dp[i-2]" },
    { num: 4, text: "    let mut prev1 = 1u64; // dp[i-1]" },
    { num: 5, text: "    for _ in 2..=n {" },
    { num: 6, text: "        let curr = prev1 + prev2; // O(1) space" },
    { num: 7, text: "        prev2 = prev1;" },
    { num: 8, text: "        prev1 = curr;" },
    { num: 9, text: "    }" },
    { num: 10, text: "    prev1" },
    { num: 11, text: "}" }
  ];

  return (
    <div className="space-y-4">
      {/* Banner & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <Minimize2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Chapter 4 Designated Simulation
              </span>
              <span className="text-xs text-slate-400 font-semibold">The Cloth Weaver · Rolling Window</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              O(N) Space → O(1) Two-Register Sliding Window
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => { setCurrentStep(0); setIsPlaying(false); }}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setCurrentStep(p => Math.max(0, p - 1)); setIsPlaying(false); }}
              disabled={currentStep === 0}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-30"
              title="Step Backward"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center gap-1.5 text-xs shadow-md shadow-emerald-900/40"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={() => { setCurrentStep(p => Math.min(steps.length - 1, p + 1)); setIsPlaying(false); }}
              disabled={currentStep === steps.length - 1}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-30"
              title="Step Forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400">Target N:</span>
            <input
              type="range"
              min="2"
              max="12"
              value={n}
              onChange={(e) => {
                setN(parseInt(e.target.value));
                setCurrentStep(0);
                setIsPlaying(false);
              }}
              className="w-20 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono font-bold text-emerald-400">{n}</span>
          </div>

          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2 py-1.5 text-xs font-mono"
          >
            <option value={2000}>0.5x Slow</option>
            <option value={1200}>1.0x Normal</option>
            <option value={600}>2.0x Fast</option>
          </select>
        </div>
      </div>

      {/* Main Dual Grid: Rolling Window Physics vs Synchronized Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Register Visualizer & Array Comparison */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Registers Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
              <span>Hardware Register View (Only 2 Memory Slots Kept!)</span>
              <span className="text-[11px] font-mono text-emerald-400">Step {active.step} / {steps.length - 1}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* prev2 Register */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950">
                <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Register prev2 (dp[i-2])</div>
                <div className="text-2xl font-black text-slate-300 mt-1">
                  {active.prev2 !== null ? active.prev2 : '—'}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Will be discarded next</div>
              </div>

              {/* prev1 Register */}
              <div className="p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/20">
                <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">Register prev1 (dp[i-1])</div>
                <div className="text-2xl font-black text-emerald-300 mt-1">
                  {active.prev1 !== null ? active.prev1 : '—'}
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-1">Slides to prev2</div>
              </div>

              {/* curr Register */}
              <div className="p-4 rounded-xl border border-cyan-500/60 bg-cyan-950/30 ring-2 ring-cyan-500/30">
                <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">Register curr (dp[i])</div>
                <div className="text-2xl font-black text-cyan-200 mt-1">
                  {active.curr}
                </div>
                <div className="text-[10px] text-cyan-400/80 mt-1">prev1 + prev2</div>
              </div>
            </div>

            {/* Explanation callout */}
            <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center gap-2.5">
              <ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">{active.desc}</span>
              </div>
            </div>
          </div>

          {/* Contrast: Full Array O(N) vs Window O(1) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="text-xs font-bold text-slate-300 mb-2">
              Memory footprint: O(N) Tabulation array vs O(1) Weaver's Window
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {Array.from({ length: n + 1 }).map((_, idx) => {
                const isP2 = idx === active.i - 2;
                const isP1 = idx === active.i - 1;
                const isCur = idx === active.i;
                const isPast = idx < active.i - 2;

                return (
                  <div
                    key={idx}
                    className={`flex-1 min-w-[50px] p-2.5 rounded-xl border text-center transition-all ${
                      isCur
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 ring-2 ring-cyan-400/50'
                        : isP1
                        ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                        : isP2
                        ? 'bg-amber-950/40 border-amber-600 text-amber-200'
                        : isPast
                        ? 'bg-slate-950/30 border-slate-900 text-slate-700 line-through'
                        : 'bg-slate-950/60 border-slate-800 text-slate-600'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-500">[{idx}]</div>
                    <div className="text-sm font-bold mt-0.5">
                      {idx <= active.i ? (steps.find(s => s.i === idx)?.curr ?? '?') : '?'}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">
                      {isCur ? 'curr' : isP1 ? 'prev1' : isP2 ? 'prev2' : isPast ? 'freed' : 'pending'}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Gray struck-out memory slots are reclaimed by garbage collection.</span>
              <span className="font-mono text-emerald-400 font-bold">Space saved: {Math.max(0, n - 2)} slots</span>
            </div>
          </div>
        </div>

        {/* Right Column: Synchronized Code Viewer */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Synchronized Code Execution</span>
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
              const isHighlight = line.num === active.line;
              return (
                <div
                  key={line.num}
                  className={`flex items-center px-2 py-0.5 rounded transition-all ${
                    isHighlight
                      ? 'bg-emerald-500/20 text-emerald-200 border-l-2 border-emerald-400 font-bold'
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
              <span>Time: <span className="text-emerald-400 font-bold">O(N)</span></span>
              <span>Space: <span className="text-emerald-400 font-bold">O(1) Auxiliary</span></span>
              <span>Lookback: <span className="text-cyan-400 font-bold">2 variables</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
