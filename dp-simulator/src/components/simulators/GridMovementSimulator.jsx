import Playback from '../Playback';
import { usePlayback } from '../../hooks/usePlayback';
import React, { useState, useMemo, useEffect } from 'react';
import { Map } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GridMovementSimulator({ input }) {
  const grid = input?.grid ?? [
    [1, 3, 1],
    [1, 5, 1],
    [4, 2, 1]
  ];
  const R = grid.length;
  const C = grid[0].length;

  const playback = usePlayback(R * C);
  const curR = Math.floor(playback.step / C);
  const curC = playback.step % C;

  // Compute DP table for Min Path Sum
  const dpGrid = useMemo(() => {
    const dp = Array.from({ length: R }, () => Array(C).fill(0));
    const doors = Array.from({ length: R }, () => Array(C).fill(null));

    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        if (r === 0 && c === 0) {
          dp[r][c] = grid[0][0];
          doors[r][c] = { from: 'start', topVal: null, leftVal: null };
        } else if (r === 0) {
          dp[r][c] = dp[0][c - 1] + grid[0][c];
          doors[r][c] = { from: 'left', topVal: null, leftVal: dp[0][c - 1] };
        } else if (c === 0) {
          dp[r][c] = dp[r - 1][0] + grid[r][0];
          doors[r][c] = { from: 'top', topVal: dp[r - 1][0], leftVal: null };
        } else {
          const top = dp[r - 1][c];
          const left = dp[r][c - 1];
          dp[r][c] = grid[r][c] + Math.min(top, left);
          doors[r][c] = { from: top <= left ? 'top' : 'left', topVal: top, leftVal: left };
        }
      }
    }
    return { dp, doors };
  }, [grid]);



  const activeDoor = dpGrid.doors[curR]?.[curC];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Chapter 8 Designated Simulation
              </span>
              <span className="text-xs text-slate-400 font-semibold">Gridlock the Maze Warden</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Min Path Sum on 2D Grid (Move Right & Down)
            </h2>
          </div>
        </div>

        {/* Playback */}
        <Playback compact playback={playback} length={R * C} />
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: 2D Maze */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Grid Cell Costs & Computed Min Sums: dp[r][c]
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              At ({curR}, {curC})
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
            {grid.map((row, r) =>
              row.map((cost, c) => {
                const isCur = r === curR && c === curC;
                const hasComputed = r < curR || (r === curR && c <= curC);
                const isTarget = r === R - 1 && c === C - 1;

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => {
                      playback.seek(r * C + c);
                    }}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition cursor-pointer ${
                      isCur
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 ring-2 ring-cyan-400 scale-105 shadow-lg'
                        : isTarget
                        ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                        : hasComputed
                        ? 'bg-slate-900 border-slate-700 text-slate-300'
                        : 'bg-slate-950 border-slate-800/80 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>({r},{c})</span>
                      <span className="bg-slate-800 px-1 rounded text-amber-300 font-bold">
                        +{cost}
                      </span>
                    </div>

                    <div className="text-center py-2">
                      <div className="text-xs text-slate-400 font-mono">min sum</div>
                      <div className="text-xl font-black font-mono mt-0.5">
                        {hasComputed ? dpGrid.dp[r][c] : '?'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Code Viewer & Decision Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed shadow-xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 font-sans">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">Grid Movement Synchronized Code</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  O(R × C)
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Cell ({curR}, {curC})
              </span>
            </div>

            {/* Synchronized Code Lines */}
            <div className="space-y-1 text-slate-300">
              <div className="text-slate-500">def min_path_sum(grid):</div>
              <div className="pl-4 text-slate-500">R, C = len(grid), len(grid[0])</div>
              <div className={`pl-4 py-0.5 rounded ${curR === 0 && curC === 0 ? 'bg-amber-950/70 border-l-2 border-amber-400 text-amber-200 font-bold' : ''}`}>
                dp[0][0] = grid[0][0]  # Base: start cell
              </div>
              <div className="pl-4 text-slate-500">for r in range(R):</div>
              <div className="pl-8 text-slate-500">for c in range(C):</div>
              <div className="pl-12 text-slate-500">if r == 0 and c == 0: continue</div>
              <div className={`pl-12 py-0.5 rounded ${curR > 0 && activeDoor?.from === 'top' ? 'bg-emerald-950/70 border-l-2 border-emerald-400 text-emerald-200 font-bold' : ''}`}>
                above = dp[r-1][c] if r &gt; 0 else inf
              </div>
              <div className={`pl-12 py-0.5 rounded ${curC > 0 && activeDoor?.from === 'left' ? 'bg-cyan-950/70 border-l-2 border-cyan-400 text-cyan-200 font-bold' : ''}`}>
                left  = dp[r][c-1] if c &gt; 0 else inf
              </div>
              <div className={`pl-12 py-0.5 rounded ${(curR > 0 || curC > 0) ? 'bg-emerald-950/70 border-l-2 border-emerald-400 text-emerald-200 font-bold' : ''}`}>
                dp[r][c] = grid[r][c] + min(above, left)
              </div>
              <div className={`pl-4 py-0.5 rounded ${curR === R - 1 && curC === C - 1 ? 'bg-purple-950/70 border-l-2 border-purple-400 text-purple-200 font-bold' : ''}`}>
                return dp[R-1][C-1]  # Goal: {dpGrid.dp[R-1][C-1]}
              </div>
            </div>

            {/* Live Cell Arithmetic */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 font-sans text-xs">
              {curR === 0 && curC === 0 ? (
                <div className="text-amber-300 font-mono text-[11px]">
                  dp[0][0] = grid[0][0] = <strong>{grid[0][0]}</strong> (Base Case: top-left start)
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Doors: Above={curR > 0 ? dpGrid.dp[curR-1][curC] : '∞'}, Left={curC > 0 ? dpGrid.dp[curR][curC-1] : '∞'}</span>
                    <span className="text-emerald-400 font-bold">Pick min = {Math.min(curR > 0 ? dpGrid.dp[curR-1][curC] : Infinity, curC > 0 ? dpGrid.dp[curR][curC-1] : Infinity)}</span>
                  </div>
                  <div className="text-emerald-300">
                    dp[{curR}][{curC}] = grid[{curR}][{curC}] ({grid[curR][curC]}) + min = <strong>{dpGrid.dp[curR][curC]}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-sans text-xs text-slate-300">
            <strong className="text-emerald-400 block mb-1">Gridlock's Law:</strong>
            "Mandatory cost is added OUTSIDE min: <code className="text-cyan-300">grid[r][c] + min(above, left)</code>. Out-of-bounds walls simply yield ∞."
          </div>
        </div>
      </div>
    </div>
  );
}
