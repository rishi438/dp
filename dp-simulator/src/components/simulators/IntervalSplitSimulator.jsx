import { useAutoplay } from '../../hooks/usePlayback';
import React, { useState, useMemo, useEffect } from 'react';
import { Scissors, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Split } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function IntervalSplitSimulator({ input }) {
  // Dimensions for matrices A1(10x30), A2(30x5), A3(5x60), A4(60x10)
  const dims = input?.dims ?? [10, 30, 5, 60, 10];
  const n = dims.length - 1; // 4 matrices: 1, 2, 3, 4

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1300);
  const [activeLang, setActiveLang] = useState('python');

  // Precompute full algorithm execution steps
  const { steps, finalDp, finalSplit } = useMemo(() => {
    // 1-indexed tables for matrices 1..n
    const dp = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
    const split = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
    const allSteps = [];

    // Step 0: Base cases dp[i][i] = 0
    allSteps.push({
      type: 'base',
      i: 1,
      j: 1,
      k: null,
      val: 0,
      line: 3,
      desc: 'Base cases: dp[i][i] = 0 for single matrices (no multiplication cost).',
      tableSnapshot: dp.map(row => [...row]),
      splitSnapshot: split.map(row => [...row]),
      activeCandidates: []
    });

    // len is interval length: 2 to n (e.g. 2, 3, 4)
    for (let len = 2; len <= n; len++) {
      for (let i = 1; i <= n - len + 1; i++) {
        const j = i + len - 1;
        let minCost = Infinity;
        let bestK = i;
        const candidates = [];

        for (let k = i; k < j; k++) {
          const cost = dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j];
          candidates.push({
            k,
            leftCost: dp[i][k],
            rightCost: dp[k + 1][j],
            multCost: dims[i - 1] * dims[k] * dims[j],
            total: cost
          });

          if (cost < minCost) {
            minCost = cost;
            bestK = k;
          }
        }

        dp[i][j] = minCost;
        split[i][j] = bestK;

        allSteps.push({
          type: 'compute',
          len,
          i,
          j,
          k: bestK,
          val: minCost,
          line: 7,
          desc: `Chain [${i}..${j}] (len=${len}): Best split at k=${bestK} gives min scalar ops = ${minCost.toLocaleString()}`,
          tableSnapshot: dp.map(row => [...row]),
          splitSnapshot: split.map(row => [...row]),
          activeCandidates: candidates
        });
      }
    }

    return { steps: allSteps, finalDp: dp, finalSplit: split };
  }, [dims, n]);

  const activeStep = steps[currentStepIndex] || steps[0];

  useAutoplay({ playing: isPlaying, step: currentStepIndex, last: steps.length - 1, speed, onStep: setCurrentStepIndex, onStop: setIsPlaying });

  // Helper to reconstruct optimal parentheses string
  const getParentheses = (i, j, sTable) => {
    if (i === j) return `A${i}`;
    const k = sTable[i][j];
    if (!k) return `(A${i}..A${j})`;
    return `(${getParentheses(i, k, sTable)} × ${getParentheses(k + 1, j, sTable)})`;
  };

  const pythonCode = [
    { num: 1, text: "def matrix_chain_order(p):" },
    { num: 2, text: "    n = len(p) - 1" },
    { num: 3, text: "    dp = [[0] * (n + 1) for _ in range(n + 1)]" },
    { num: 4, text: "    for length in range(2, n + 1):  # interval length" },
    { num: 5, text: "        for i in range(1, n - length + 2):" },
    { num: 6, text: "            j = i + length - 1" },
    { num: 7, text: "            dp[i][j] = min(" },
    { num: 8, text: "                dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]" },
    { num: 9, text: "                for k in range(i, j)" },
    { num: 10, text: "            )" },
    { num: 11, text: "    return dp[1][n]" }
  ];

  const rustCode = [
    { num: 1, text: "pub fn matrix_chain_order(p: &[usize]) -> usize {" },
    { num: 2, text: "    let n = p.len() - 1;" },
    { num: 3, text: "    let mut dp = vec![vec![0; n + 1]; n + 1];" },
    { num: 4, text: "    for len in 2..=n {" },
    { num: 5, text: "        for i in 1..=(n - len + 1) {" },
    { num: 6, text: "            let j = i + len - 1;" },
    { num: 7, text: "            dp[i][j] = (i..j).map(|k| {" },
    { num: 8, text: "                dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]" },
    { num: 9, text: "            }).min().unwrap();" },
    { num: 10, text: "        }" },
    { num: 11, text: "    }" },
    { num: 12, text: "    dp[1][n]" },
    { num: 13, text: "}" }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                Chapter 12 Designated Simulation
              </span>
              <span className="text-xs text-slate-400 font-semibold">Vale the Splitter</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Interval Split DP · Matrix Chain Multiplication
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
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-all flex items-center gap-1.5 text-xs shadow-md shadow-rose-900/40"
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

      {/* Main Dual View: 2D Interval Grid & Split Inspector vs Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Diagonal Matrix DP Grid + Split Decision */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs mb-3 font-semibold text-slate-300">
              <span>Upper-Triangular Cost Table: dp[i][j] (Diagonal Order)</span>
              <span className="text-[11px] font-mono text-rose-400">Step {currentStepIndex + 1} / {steps.length}</span>
            </div>

            {/* 2D Upper-Triangular Table */}
            <div className="overflow-x-auto pb-2">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="p-1 text-slate-500 font-mono text-[10px]">i \ j</th>
                    {Array.from({ length: n }, (_, i) => i + 1).map(j => (
                      <th key={j} className="p-1.5 font-mono text-slate-400 font-bold">
                        A{j} ({dims[j-1]}×{dims[j]})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: n }, (_, i) => i + 1).map(i => (
                    <tr key={i}>
                      <td className="p-1.5 font-mono text-slate-400 font-bold bg-slate-950/40 rounded">
                        A{i}
                      </td>
                      {Array.from({ length: n }, (_, i) => i + 1).map(j => {
                        if (i > j) {
                          return <td key={j} className="p-2 bg-slate-950/20 text-slate-800">—</td>;
                        }

                        const isTarget = activeStep.i === i && activeStep.j === j;
                        const isLeftSub = activeStep.k !== null && i === activeStep.i && j === activeStep.k;
                        const isRightSub = activeStep.k !== null && i === activeStep.k + 1 && j === activeStep.j;
                        const cellVal = activeStep.tableSnapshot[i][j];
                        const isComputed = cellVal !== 0 || (i === j);

                        return (
                          <td
                            key={j}
                            className={`p-2.5 border transition-all rounded-lg font-mono ${
                              isTarget
                                ? 'bg-rose-500/25 border-rose-400 text-rose-200 ring-2 ring-rose-400 font-bold'
                                : isLeftSub
                                ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 font-bold'
                                : isRightSub
                                ? 'bg-purple-950/70 border-purple-400 text-purple-200 font-bold'
                                : isComputed
                                ? 'bg-slate-950 border-slate-700/60 text-slate-200'
                                : 'bg-slate-950/30 border-slate-800/40 text-slate-700'
                            }`}
                          >
                            <div className="text-xs">
                              {isComputed ? cellVal.toLocaleString() : '?'}
                            </div>
                            <div className="text-[9px] text-slate-500 mt-0.5">
                              {i === j ? 'base' : activeStep.splitSnapshot[i][j] ? `k=${activeStep.splitSnapshot[i][j]}` : ''}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Split Candidate Breakdown */}
            {activeStep.activeCandidates && activeStep.activeCandidates.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>Evaluating Split Points k for range [{activeStep.i}..{activeStep.j}]:</span>
                  <span className="text-[10px] text-rose-400 font-mono">min_k (dp[i][k] + dp[k+1][j] + cost)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {activeStep.activeCandidates.map(c => {
                    const isWinner = c.k === activeStep.k;
                    return (
                      <div
                        key={c.k}
                        className={`p-2 rounded-xl border text-xs transition-all ${
                          isWinner
                            ? 'bg-rose-950/40 border-rose-400 text-rose-200 ring-1 ring-rose-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono font-bold">
                          <span>Split k = {c.k}</span>
                          {isWinner && <span className="text-[9px] bg-rose-500 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">BEST</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          {c.leftCost} + {c.rightCost} + {c.multCost}
                        </div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          = {c.total.toLocaleString()} ops
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Optimal Parenthesization Output */}
            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Optimal Parenthesization</div>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {getParentheses(1, n, activeStep.splitSnapshot)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Total Mult Cost</div>
                <div className="text-base font-extrabold text-rose-300 font-mono">
                  {n === 1 || activeStep.tableSnapshot[1][n] > 0 ? `${activeStep.tableSnapshot[1][n].toLocaleString()} ops` : 'Computing...'}
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
                      ? 'bg-rose-500/20 text-rose-200 border-l-2 border-rose-400 font-bold'
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
              <span>Time: <span className="text-rose-400 font-bold">O(N³)</span></span>
              <span>Space: <span className="text-rose-400 font-bold">O(N²)</span></span>
              <span>Order: <span className="text-cyan-400 font-bold">Chain Length 2..N</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
