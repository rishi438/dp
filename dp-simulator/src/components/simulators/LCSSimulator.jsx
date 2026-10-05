import Playback from '../Playback';
import { usePlayback } from '../../hooks/usePlayback';
import React, { useState, useMemo, useEffect } from 'react';
import { Scroll } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LCSSimulator({ input }) {
  const s1 = input?.s1 ?? "ABCDE";
  const s2 = input?.s2 ?? "ACE";
  const m = s1.length;
  const n = s2.length;

  const playback = usePlayback((m + 1) * (n + 1));
  const currentI = Math.floor(playback.step / (n + 1));
  const currentJ = playback.step % (n + 1);

  // Precompute full 2D table
  const lcsMatrix = useMemo(() => {
    const table = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    const details = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));

    for (let i = 0; i <= m; i++) {
      for (let j = 0; j <= n; j++) {
        if (i === 0 || j === 0) {
          table[i][j] = 0;
          details[i][j] = { isBase: true, match: false, from: null };
        } else if (s1[i - 1] === s2[j - 1]) {
          table[i][j] = table[i - 1][j - 1] + 1;
          details[i][j] = { isBase: false, match: true, from: 'diag', char: s1[i - 1] };
        } else {
          const top = table[i - 1][j];
          const left = table[i][j - 1];
          table[i][j] = Math.max(top, left);
          details[i][j] = { isBase: false, match: false, from: top >= left ? 'top' : 'left' };
        }
      }
    }
    return { table, details };
  }, [s1, s2]);

  // Stepper


  const activeDetail = lcsMatrix.details[currentI]?.[currentJ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl">
            <Scroll className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                Chapter 7 Designated Simulation
              </span>
              <span className="text-xs text-slate-400 font-semibold">The Twin Scribes</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Longest Common Subsequence: s1="{s1}", s2="{s2}"
            </h2>
          </div>
        </div>

        {/* Playback */}
        <Playback compact playback={playback} length={(m + 1) * (n + 1)} />
      </div>

      {/* 2D Matrix Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <span className="text-xs font-bold text-slate-300 block">
            2D Tabulation Grid: dp[i][j] (Row: s1="{s1}", Col: s2="{s2}")
          </span>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs font-mono">
              <thead>
                <tr>
                  <th className="p-2 border border-slate-800 bg-slate-950 text-slate-500"></th>
                  <th className="p-2 border border-slate-800 bg-slate-950 text-slate-500">Ø</th>
                  {s2.split('').map((char, j) => (
                    <th key={j} className="p-2 border border-slate-800 bg-slate-950 text-cyan-400 font-bold">
                      {char} ({j+1})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: m + 1 }).map((_, i) => (
                  <tr key={i}>
                    <th className="p-2 border border-slate-800 bg-slate-950 text-amber-400 font-bold">
                      {i === 0 ? 'Ø' : `${s1[i - 1]} (${i})`}
                    </th>
                    {Array.from({ length: n + 1 }).map((_, j) => {
                      const isCurrent = i === currentI && j === currentJ;
                      const hasComputed = i < currentI || (i === currentI && j <= currentJ);
                      const detail = lcsMatrix.details[i][j];

                      let cellBg = 'bg-slate-950 text-slate-500';
                      if (isCurrent) {
                        cellBg = detail?.match
                          ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400 scale-105 font-bold'
                          : 'bg-cyan-500/30 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400 scale-105 font-bold';
                      } else if (hasComputed) {
                        cellBg = detail?.match ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300';
                      }

                      return (
                        <td
                          key={j}
                          onClick={() => {
                            playback.seek(i * (n + 1) + j);
                          }}
                          className={`p-2.5 border transition cursor-pointer ${cellBg}`}
                        >
                          {hasComputed ? lcsMatrix.table[i][j] : '?'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Code Viewer & Decision Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed shadow-xl flex flex-col justify-between">
          <div>
            {/* Header & Language Tabs */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 font-sans">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">LCS Synchronized Code</span>
                <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                  O(M × N)
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Cell ({currentI}, {currentJ})
              </span>
            </div>

            {/* Synchronized Code Lines */}
            <div className="space-y-1 text-slate-300">
              <div className="text-slate-500">def longest_common_subsequence(s1, s2):</div>
              <div className="pl-4 text-slate-500">m, n = len(s1), len(s2)</div>
              <div className={`pl-4 py-0.5 rounded ${currentI === 0 || currentJ === 0 ? 'bg-amber-950/70 border-l-2 border-amber-400 text-amber-200' : ''}`}>
                dp = [[0] * (n + 1) for _ in range(m + 1)]  # Base: 0
              </div>
              <div className="pl-4 text-slate-500">for i in range(1, m + 1):</div>
              <div className="pl-8 text-slate-500">for j in range(1, n + 1):</div>
              <div className={`pl-12 py-0.5 rounded ${activeDetail?.match ? 'bg-emerald-950/70 border-l-2 border-emerald-400 text-emerald-200 font-bold' : ''}`}>
                if s1[i-1] == s2[j-1]:
              </div>
              <div className={`pl-16 py-0.5 rounded ${activeDetail?.match ? 'bg-emerald-950/70 border-l-2 border-emerald-400 text-emerald-200 font-bold' : ''}`}>
                dp[i][j] = dp[i-1][j-1] + 1  # DIAGONAL MATCH!
              </div>
              <div className={`pl-12 py-0.5 rounded ${!activeDetail?.match && currentI > 0 && currentJ > 0 ? 'bg-cyan-950/70 border-l-2 border-cyan-400 text-cyan-200 font-bold' : ''}`}>
                else:
              </div>
              <div className={`pl-16 py-0.5 rounded ${!activeDetail?.match && currentI > 0 && currentJ > 0 ? 'bg-cyan-950/70 border-l-2 border-cyan-400 text-cyan-200 font-bold' : ''}`}>
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])  # MAX(TOP, LEFT)
              </div>
              <div className={`pl-4 py-0.5 rounded ${currentI === m && currentJ === n ? 'bg-amber-950/70 border-l-2 border-amber-400 text-amber-200 font-bold' : ''}`}>
                return dp[m][n]  # Goal: {lcsMatrix.table[m][n]}
              </div>
            </div>

            {/* Live Cell Arithmetic */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 font-sans text-xs">
              {currentI === 0 || currentJ === 0 ? (
                <div className="text-amber-300 font-mono text-[11px]">
                  dp[{currentI}][{currentJ}] = 0 (Base Case: empty string has 0 matches)
                </div>
              ) : activeDetail?.match ? (
                <div className="text-emerald-300 font-mono text-[11px]">
                  Match '{activeDetail.char}': dp[{currentI}][{currentJ}] = dp[{currentI-1}][{currentJ-1}] + 1 = <strong>{lcsMatrix.table[currentI][currentJ]}</strong>
                </div>
              ) : (
                <div className="text-cyan-300 font-mono text-[11px]">
                  Diff: max(top: {lcsMatrix.table[currentI-1]?.[currentJ]}, left: {lcsMatrix.table[currentI]?.[currentJ-1]}) = <strong>{lcsMatrix.table[currentI][currentJ]}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-sans text-xs text-slate-300">
            <strong className="text-blue-400 block mb-1">Twin Scribes Rule:</strong>
            "Match = pay 1 step into diagonal (both drop 1 letter). Diff = pick max(drop s1, drop s2)."
          </div>
        </div>
      </div>
    </div>
  );
}
