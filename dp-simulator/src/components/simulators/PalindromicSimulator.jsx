import { useAutoplay } from '../../hooks/usePlayback';
import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Split } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PalindromicSimulator({ input }) {
  const [s, setS] = useState(input?.s ?? 'BBABCBCAB');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1100);
  const [activeLang, setActiveLang] = useState('python');

  const n = s.length;

  // Precompute full LPS steps
  const { steps, finalDp } = useMemo(() => {
    const dp = Array.from({ length: n }, () => Array(n).fill(0));
    const allSteps = [];

    // Base cases: length 1 substrings have LPS = 1
    for (let i = 0; i < n; i++) {
      dp[i][i] = 1;
    }

    allSteps.push({
      type: 'base',
      i: 0,
      j: 0,
      len: 1,
      charI: s[0],
      charJ: s[0],
      match: true,
      val: 1,
      line: 3,
      desc: 'Base cases: dp[i][i] = 1 for all individual characters (length 1).',
      tableSnapshot: dp.map(row => [...row])
    });

    // Substring lengths from 2 to n
    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        const charI = s[i];
        const charJ = s[j];
        const match = charI === charJ;

        let val = 0;
        let line = 6;
        if (match) {
          val = (len === 2 ? 2 : 2 + dp[i + 1][j - 1]);
          dp[i][j] = val;
          line = 7;
        } else {
          val = Math.max(dp[i + 1][j], dp[i][j - 1]);
          dp[i][j] = val;
          line = 9;
        }

        allSteps.push({
          type: 'compute',
          i,
          j,
          len,
          charI,
          charJ,
          match,
          val,
          line,
          prevInner: len > 2 ? dp[i + 1][j - 1] : 0,
          downVal: dp[i + 1][j],
          leftVal: dp[i][j - 1],
          desc: match
            ? `Match '${charI}' == '${charJ}' at [${i}, ${j}]: dp[${i}][${j}] = 2 + dp[${i+1}][${j-1}] = ${val}`
            : `Mismatch '${charI}' ≠ '${charJ}' at [${i}, ${j}]: max(dp[${i+1}][${j}], dp[${i}][${j-1}]) = ${val}`,
          tableSnapshot: dp.map(row => [...row])
        });
      }
    }

    return { steps: allSteps, finalDp: dp };
  }, [s, n]);

  const activeStep = steps[currentStepIndex] || steps[0];

  useAutoplay({ playing: isPlaying, step: currentStepIndex, last: steps.length - 1, speed, onStep: setCurrentStepIndex, onStop: setIsPlaying });

  // Backtrack to find palindrome string
  const reconstructLPS = (i, j, table) => {
    if (i > j) return '';
    if (i === j) return s[i];
    if (s[i] === s[j]) {
      return s[i] + reconstructLPS(i + 1, j - 1, table) + s[j];
    }
    if (table[i + 1][j] >= table[i][j - 1]) {
      return reconstructLPS(i + 1, j, table);
    } else {
      return reconstructLPS(i, j - 1, table);
    }
  };

  const lpsResult = useMemo(() => {
    return reconstructLPS(0, n - 1, finalDp);
  }, [finalDp, n, s]);

  const pythonCode = [
    { num: 1, text: "def longest_palindrome_subseq(s: str) -> int:" },
    { num: 2, text: "    n = len(s)" },
    { num: 3, text: "    dp = [[0] * n for _ in range(n)]" },
    { num: 4, text: "    for i in range(n): dp[i][i] = 1" },
    { num: 5, text: "    for length in range(2, n + 1):" },
    { num: 6, text: "        for i in range(n - length + 1):" },
    { num: 7, text: "            j = i + length - 1" },
    { num: 8, text: "            if s[i] == s[j]:" },
    { num: 9, text: "                dp[i][j] = 2 + (dp[i+1][j-1] if length > 2 else 0)" },
    { num: 10, text: "            else:" },
    { num: 11, text: "                dp[i][j] = max(dp[i+1][j], dp[i][j-1])" },
    { num: 12, text: "    return dp[0][n-1]" }
  ];

  const rustCode = [
    { num: 1, text: "pub fn longest_palindrome_subseq(s: String) -> usize {" },
    { num: 2, text: "    let b = s.as_bytes(); let n = b.len();" },
    { num: 3, text: "    let mut dp = vec![vec![0; n]; n];" },
    { num: 4, text: "    for i in 0..n { dp[i][i] = 1; }" },
    { num: 5, text: "    for len in 2..=n {" },
    { num: 6, text: "        for i in 0..=(n - len) {" },
    { num: 7, text: "            let j = i + len - 1;" },
    { num: 8, text: "            dp[i][j] = if b[i] == b[j] {" },
    { num: 9, text: "                2 + if len > 2 { dp[i+1][j-1] } else { 0 }" },
    { num: 10, text: "            } else {" },
    { num: 11, text: "                dp[i+1][j].max(dp[i][j-1])" },
    { num: 12, text: "            };" },
    { num: 13, text: "        }" },
    { num: 14, text: "    }" },
    { num: 15, text: "    dp[0][n-1]" },
    { num: 16, text: "}" }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-400 bg-fuchsia-950 px-2 py-0.5 rounded border border-fuchsia-800">
                Chapter 13 Designated Simulation
              </span>
              <span className="text-xs text-slate-400 font-semibold">Mirra the Mirror-Twin</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Palindromic DP · Longest Palindromic Subsequence (LPS)
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
              className="px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-lg transition-all flex items-center gap-1.5 text-xs shadow-md shadow-fuchsia-900/40"
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

          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['BBABCBCAB', 'BANANA', 'ABACABA'].map(preset => (
              <button
                key={preset}
                onClick={() => {
                  setS(preset);
                  setCurrentStepIndex(0);
                  setIsPlaying(false);
                }}
                className={`px-2 py-1 rounded-lg font-mono text-[10px] font-bold transition-all ${
                  s === preset ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2 py-1.5 text-xs font-mono"
          >
            <option value={2000}>0.5x Slow</option>
            <option value={1100}>1.0x Normal</option>
            <option value={500}>2.0x Fast</option>
          </select>
        </div>
      </div>

      {/* Main Dual Grid: String Ribbon & 2D Table vs Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: String Ribbon + 2D DP Table */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active String Pointers Ribbon */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">String Boundary Inspector s[i..j]</span>
              <span className="font-mono text-fuchsia-400">Length = {activeStep.len}</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {s.split('').map((char, idx) => {
                const isI = idx === activeStep.i;
                const isJ = idx === activeStep.j;
                const isInRange = idx >= activeStep.i && idx <= activeStep.j;

                return (
                  <div
                    key={idx}
                    className={`flex-1 min-w-[36px] py-2 rounded-xl border text-center transition-all ${
                      isI && isJ
                        ? 'bg-fuchsia-500/30 border-fuchsia-400 text-fuchsia-200 ring-2 ring-fuchsia-400'
                        : isI || isJ
                        ? activeStep.match
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-extrabold ring-1 ring-emerald-400'
                          : 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                        : isInRange
                        ? 'bg-slate-950/70 border-slate-800 text-slate-300'
                        : 'bg-slate-950/30 border-slate-900 text-slate-600'
                    }`}
                  >
                    <div className="text-[9px] font-mono text-slate-500">{idx}</div>
                    <div className="text-base font-black mt-0.5">{char}</div>
                    <div className="text-[8px] font-bold uppercase mt-0.5">
                      {isI && isJ ? 'i, j' : isI ? 'i (L)' : isJ ? 'j (R)' : ''}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Decision explanation */}
            <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{activeStep.desc}</span>
                {activeStep.match ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                    Match! +2 Outer
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                    Take Max Neighbor
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2D DP Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span>2D Tabulation Table: dp[i][j]</span>
              <span className="text-[11px] font-mono text-slate-400">LPS Length: <span className="text-fuchsia-400 font-bold">{finalDp[0][n - 1]}</span></span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="p-1 text-slate-500 font-mono text-[10px]">i \ j</th>
                    {s.split('').map((char, j) => (
                      <th key={j} className="p-1 font-mono text-slate-400 font-bold">
                        {j}:{char}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.split('').map((char, i) => (
                    <tr key={i}>
                      <td className="p-1 font-mono text-slate-400 font-bold bg-slate-950/40 rounded">
                        {i}:{char}
                      </td>
                      {s.split('').map((_, j) => {
                        if (i > j) {
                          return <td key={j} className="p-1.5 bg-slate-950/20 text-slate-800">—</td>;
                        }

                        const isTarget = activeStep.i === i && activeStep.j === j;
                        const isInner = activeStep.match && i === activeStep.i + 1 && j === activeStep.j - 1;
                        const isDown = !activeStep.match && i === activeStep.i + 1 && j === activeStep.j;
                        const isLeft = !activeStep.match && i === activeStep.i && j === activeStep.j - 1;
                        const val = activeStep.tableSnapshot[i][j];

                        return (
                          <td
                            key={j}
                            className={`p-1.5 border transition-all rounded font-mono ${
                              isTarget
                                ? 'bg-fuchsia-500/30 border-fuchsia-400 text-fuchsia-200 ring-2 ring-fuchsia-400 font-bold'
                                : isInner
                                ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200 font-bold'
                                : isDown || isLeft
                                ? 'bg-amber-950/60 border-amber-400 text-amber-200 font-bold'
                                : val > 0
                                ? 'bg-slate-950 border-slate-800 text-slate-300'
                                : 'bg-slate-950/40 border-slate-900 text-slate-700'
                            }`}
                          >
                            {val > 0 ? val : 0}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reconstructed Palindrome Banner */}
            <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Longest Palindromic Subsequence</div>
                <div className="text-base font-extrabold text-emerald-400 font-mono tracking-widest mt-0.5">
                  "{lpsResult}"
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Length</div>
                <div className="text-base font-black text-fuchsia-300 font-mono">
                  {lpsResult.length} chars
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
                      ? 'bg-fuchsia-500/20 text-fuchsia-200 border-l-2 border-fuchsia-400 font-bold'
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
              <span>Time: <span className="text-fuchsia-400 font-bold">O(N²)</span></span>
              <span>Space: <span className="text-fuchsia-400 font-bold">O(N²)</span></span>
              <span>Subproblems: <span className="text-emerald-400 font-bold">N(N+1)/2</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
