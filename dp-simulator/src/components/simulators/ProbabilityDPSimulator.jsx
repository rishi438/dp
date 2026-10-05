import Playback from '../Playback';
import { useAutoplay } from '../../hooks/usePlayback';
import React, { useState, useMemo, useEffect } from 'react';
import { Dices, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProbabilityDPSimulator({ input }) {
  const boardSize = input?.size ?? 5;
  const maxK = input?.moves ?? 5;
  const startRow = input?.row ?? 2;
  const startCol = input?.col ?? 2;
  const [currentK, setCurrentK] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [activeLang, setActiveLang] = useState('python');

  // Knight 8 directions
  const moves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  // Precompute DP probability distributions for k = 0..maxK
  // Starting knight at center (2, 2) with prob 1.0
  const distributions = useMemo(() => {
    const history = [];

    // k = 0
    let currentBoard = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
    currentBoard[startRow][startCol] = 1.0;

    history.push({
      k: 0,
      board: currentBoard.map(row => [...row]),
      totalProb: 1.0,
      line: 3,
      desc: `Step 0: Knight starts at (${startRow}, ${startCol}) with 100% probability.`
    });

    for (let step = 1; step <= maxK; step++) {
      const nextBoard = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
      let totalProb = 0;

      for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
          const p = currentBoard[r][c];
          if (p > 0) {
            for (const [dr, dc] of moves) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
                nextBoard[nr][nc] += p / 8.0;
              }
            }
          }
        }
      }

      for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
          totalProb += nextBoard[r][c];
        }
      }

      history.push({
        k: step,
        board: nextBoard.map(row => [...row]),
        totalProb,
        line: 8,
        desc: `Move ${step}: Knight makes random jump. Total survival probability = ${(totalProb * 100).toFixed(2)}%. (${((1 - totalProb) * 100).toFixed(2)}% fell off board).`
      });

      currentBoard = nextBoard;
    }

    return history;
  }, [boardSize, maxK, startRow, startCol]);

  const active = distributions[currentK] || distributions[0];

  const playback = useAutoplay({ playing: isPlaying, step: currentK, last: maxK, speed, setSpeed, onStep: setCurrentK, onStop: setIsPlaying });

  const pythonCode = [
    { num: 1, text: "def knight_probability(n: int, k: int, row: int, col: int) -> float:" },
    { num: 2, text: "    moves = [(-2,-1), (-2,1), (-1,-2), (-1,2), (1,-2), (1,2), (2,-1), (2,1)]" },
    { num: 3, text: "    dp = [[0.0] * n for _ in range(n)]; dp[row][col] = 1.0" },
    { num: 4, text: "    for step in range(k):" },
    { num: 5, text: "        nxt = [[0.0] * n for _ in range(n)]" },
    { num: 6, text: "        for r in range(n):" },
    { num: 7, text: "            for c in range(n):" },
    { num: 8, text: "                if dp[r][c] > 0:" },
    { num: 9, text: "                    for dr, dc in moves:" },
    { num: 10, text: "                        nr, nc = r + dr, c + dc" },
    { num: 11, text: "                        if 0 <= nr < n and 0 <= nc < n:" },
    { num: 12, text: "                            nxt[nr][nc] += dp[r][c] / 8.0" },
    { num: 13, text: "        dp = nxt" },
    { num: 14, text: "    return sum(sum(row) for row in dp)" }
  ];

  const rustCode = [
    { num: 1, text: "pub fn knight_probability(n: i32, k: i32, r0: i32, c0: i32) -> f64 {" },
    { num: 2, text: "    let n_u = n as usize;" },
    { num: 3, text: "    let mut dp = vec![vec![0.0f64; n_u]; n_u];" },
    { num: 4, text: "    dp[r0 as usize][c0 as usize] = 1.0;" },
    { num: 5, text: "    let dirs = [(-2,-1), (-2,1), (-1,-2), (-1,2), (1,-2), (1,2), (2,-1), (2,1)];" },
    { num: 6, text: "    for _ in 0..k {" },
    { num: 7, text: "        let mut nxt = vec![vec![0.0; n_u]; n_u];" },
    { num: 8, text: "        for r in 0..n {" },
    { num: 9, text: "            for c in 0..n {" },
    { num: 10, text: "                if dp[r as usize][c as usize] > 0.0 {" },
    { num: 11, text: "                    for (dr, dc) in dirs {" },
    { num: 12, text: "                        let (nr, nc) = (r + dr, c + dc);" },
    { num: 13, text: "                        if nr >= 0 && nr < n && nc >= 0 && nc < n {" },
    { num: 14, text: "                            nxt[nr as usize][nc as usize] += dp[r as usize][c as usize] / 8.0;" },
    { num: 15, text: "                        }" },
    { num: 16, text: "                    }" },
    { num: 17, text: "                }" },
    { num: 18, text: "            }" },
    { num: 19, text: "        }" },
    { num: 20, text: "        dp = nxt;" },
    { num: 21, text: "    }" },
    { num: 22, text: "    dp.iter().flat_map(|r| r.iter()).sum()" },
    { num: 23, text: "}" }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-xl">
            <Dices className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                Chapter 17 Designated Simulation
              </span>
              <span className="text-xs text-slate-400 font-semibold">Fortuna the Dice-Walker</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Probability DP · Knight on Chessboard Random Walk
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Playback compact playback={playback} length={maxK + 1} />

        </div>
      </div>

      {/* Main Dual Grid: Chessboard Heatmap vs Synchronized Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Heatmap Chessboard & Survival Meter */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs mb-3 text-slate-400">
              <span className="font-semibold text-slate-300">5×5 Chessboard Probability Heatmap</span>
              <span className="font-mono text-sky-400">Move {currentK} / {maxK}</span>
            </div>

            {/* Chessboard Grid */}
            <div style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }} className="grid gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800 max-w-[420px] mx-auto">
              {active.board.map((row, r) =>
                row.map((prob, c) => {
                  const isCenter = r === startRow && c === startCol;
                  const probPct = (prob * 100).toFixed(1);
                  const intensity = Math.min(1, prob * 2.5); // scaling for visual heat

                  return (
                    <div
                      key={`${r}-${c}`}
                      className="aspect-square rounded-lg border border-slate-800/80 p-1 flex flex-col items-center justify-center transition-all relative overflow-hidden"
                      style={{
                        backgroundColor: prob > 0 ? `rgba(14, 165, 233, ${0.1 + intensity * 0.7})` : '#0b1120',
                        borderColor: prob > 0 ? `rgba(56, 189, 248, ${0.3 + intensity * 0.7})` : '#1e293b'
                      }}
                    >
                      {isCenter && currentK === 0 && (
                        <span className="text-xl select-none mb-0.5 animate-bounce">♞</span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">
                        [{r},{c}]
                      </span>
                      <span className={`text-xs font-mono font-black mt-0.5 ${prob > 0 ? 'text-white' : 'text-slate-700'}`}>
                        {prob > 0 ? `${probPct}%` : '0%'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Total Survival Meter */}
            <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  <span>Survival Probability on Board:</span>
                </span>
                <span className="font-mono font-extrabold text-sky-400 text-sm">
                  {(active.totalProb * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-sky-500 to-emerald-400 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${active.totalProb * 100}%` }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="font-semibold text-white">{active.desc}</div>
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
              const isHighlight = line.num === active.line;
              return (
                <div
                  key={line.num}
                  className={`flex items-center px-2 py-0.5 rounded transition-all ${
                    isHighlight
                      ? 'bg-sky-500/20 text-sky-200 border-l-2 border-sky-400 font-bold'
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
              <span>Time: <span className="text-sky-400 font-bold">O(K · N² · 8)</span></span>
              <span>Space: <span className="text-sky-400 font-bold">O(N²) 2 Matrices</span></span>
              <span>Distribution: <span className="text-emerald-400 font-bold">∑P ≤ 1.0</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
