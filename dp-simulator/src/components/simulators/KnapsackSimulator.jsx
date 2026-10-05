import Playback from '../Playback';
import { usePlayback } from '../../hooks/usePlayback';
import React, { useState, useMemo, useEffect } from 'react';
import { Backpack, PackagePlus, PackageMinus } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function KnapsackSimulator({ input }) {
  const items = input ? input.weights.map((wt, i) => ({ name: `Item ${i + 1}`, wt, val: input.values[i] })) : [
    { name: 'Gem A', wt: 1, val: 2 },
    { name: 'Gem B', wt: 2, val: 4 },
    { name: 'Gem C', wt: 3, val: 7 },
    { name: 'Gem D', wt: 4, val: 10 }
  ];
  const W = input?.capacity ?? 5;

  const playback = usePlayback((items.length + 1) * (W + 1));
  const curItem = Math.floor(playback.step / (W + 1));
  const curCap = playback.step % (W + 1);

  // Compute Knapsack table
  const knapsackData = useMemo(() => {
    const dp = Array.from({ length: items.length + 1 }, () => Array(W + 1).fill(0));
    const decisions = Array.from({ length: items.length + 1 }, () => Array(W + 1).fill(null));

    for (let i = 1; i <= items.length; i++) {
      const { wt, val } = items[i - 1];
      for (let w = 0; w <= W; w++) {
        const skip = dp[i - 1][w];
        if (w >= wt) {
          const take = dp[i - 1][w - wt] + val;
          dp[i][w] = Math.max(skip, take);
          decisions[i][w] = { chosen: take > skip ? 'take' : 'skip', skip, take, canTake: true };
        } else {
          dp[i][w] = skip;
          decisions[i][w] = { chosen: 'skip', skip, take: null, canTake: false };
        }
      }
    }
    return { dp, decisions };
  }, [items, W]);



  const activeDec = knapsackData.decisions[curItem]?.[curCap];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl">
            <Backpack className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-950 px-2 py-0.5 rounded border border-yellow-800">
                Chapter 9 Designated Simulation
              </span>
              <span className="text-xs text-slate-400 font-semibold">Sacky the Packmaster</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              0/1 Knapsack: Max Value for Weight Budget W = {W}
            </h2>
          </div>
        </div>

        {/* Playback */}
        <Playback compact playback={playback} length={(items.length + 1) * (W + 1)} />
      </div>

      {/* Grid: 2D Table + Decision Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <span className="text-xs font-bold text-slate-300 block">
            Knapsack Matrix: dp[item][weight] (Capacity 0..{W})
          </span>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs font-mono">
              <thead>
                <tr>
                  <th className="p-2 border border-slate-800 bg-slate-950 text-slate-500">Item</th>
                  {Array.from({ length: W + 1 }).map((_, w) => (
                    <th key={w} className="p-2 border border-slate-800 bg-slate-950 text-cyan-400 font-bold">
                      w={w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: items.length + 1 }).map((_, i) => (
                  <tr key={i}>
                    <th className="p-2 border border-slate-800 bg-slate-950 text-yellow-400 font-bold">
                      {i === 0 ? 'Ø (0)' : `${items[i - 1].name} (w:${items[i - 1].wt}, v:${items[i - 1].val})`}
                    </th>
                    {Array.from({ length: W + 1 }).map((_, w) => {
                      const isCur = i === curItem && w === curCap;
                      const hasComputed = i < curItem || (i === curItem && w <= curCap);

                      return (
                        <td
                          key={w}
                          onClick={() => {
                            playback.seek(i * (W + 1) + w);
                          }}
                          className={`p-2.5 border transition cursor-pointer ${
                            isCur
                              ? 'bg-yellow-500/30 border-yellow-400 text-yellow-100 ring-2 ring-yellow-400 font-bold scale-105'
                              : hasComputed
                              ? 'bg-slate-900 border-slate-800 text-slate-200'
                              : 'bg-slate-950 border-slate-800/80 text-slate-600'
                          }`}
                        >
                          {hasComputed ? knapsackData.dp[i][w] : '?'}
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
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 font-sans">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">0/1 Knapsack Synchronized Code</span>
                <span className="text-[10px] bg-yellow-950 text-yellow-300 px-2 py-0.5 rounded border border-yellow-800">
                  O(N × W)
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Item {curItem} / W {curCap}
              </span>
            </div>

            {/* Synchronized Code Lines */}
            <div className="space-y-1 text-slate-300">
              <div className="text-slate-500">def knapsack(weights, values, W):</div>
              <div className="pl-4 text-slate-500">n = len(weights)</div>
              <div className={`pl-4 py-0.5 rounded ${curItem === 0 ? 'bg-amber-950/70 border-l-2 border-amber-400 text-amber-200 font-bold' : ''}`}>
                dp = [[0] * (W + 1) for _ in range(n + 1)]  # Base: 0 value
              </div>
              <div className="pl-4 text-slate-500">for i in range(1, n + 1):</div>
              <div className="pl-8 text-slate-500">wt, val = weights[i-1], values[i-1]</div>
              <div className="pl-8 text-slate-500">for w in range(W + 1):</div>
              <div className={`pl-12 py-0.5 rounded ${curItem > 0 && activeDec?.chosen === 'skip' ? 'bg-cyan-950/70 border-l-2 border-cyan-400 text-cyan-200 font-bold' : ''}`}>
                skip = dp[i-1][w]
              </div>
              <div className="pl-12 text-slate-500">if w &gt;= wt:</div>
              <div className={`pl-16 py-0.5 rounded ${curItem > 0 && activeDec?.chosen === 'take' ? 'bg-yellow-950/70 border-l-2 border-yellow-400 text-yellow-200 font-bold' : ''}`}>
                take = dp[i-1][w - wt] + val
              </div>
              <div className={`pl-16 py-0.5 rounded ${curItem > 0 && activeDec?.canTake ? 'bg-emerald-950/70 border-l-2 border-emerald-400 text-emerald-200 font-bold' : ''}`}>
                dp[i][w] = max(skip, take)
              </div>
              <div className={`pl-12 py-0.5 rounded ${curItem > 0 && !activeDec?.canTake ? 'bg-rose-950/70 border-l-2 border-rose-400 text-rose-200 font-bold' : ''}`}>
                else: dp[i][w] = skip  # Too heavy!
              </div>
              <div className={`pl-4 py-0.5 rounded ${curItem === items.length && curCap === W ? 'bg-amber-950/70 border-l-2 border-amber-400 text-amber-200 font-bold' : ''}`}>
                return dp[n][W]  # Goal: ${knapsackData.dp[items.length][W]}
              </div>
            </div>

            {/* Live Cell Arithmetic & Door Cards */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 font-sans text-xs">
              {curItem === 0 ? (
                <div className="text-amber-300 font-mono text-[11px]">
                  dp[0][{curCap}] = 0 (Base Case: 0 items available = $0 value)
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Skip Card */}
                    <div className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${
                      activeDec?.chosen === 'skip' ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <span className="flex items-center gap-1">
                        <PackageMinus className="w-3 h-3" />
                        <span>Skip {items[curItem - 1].name}</span>
                      </span>
                      <span>${activeDec?.skip}</span>
                    </div>

                    {/* Take Card */}
                    <div className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${
                      activeDec?.chosen === 'take' ? 'bg-yellow-950/50 border-yellow-500 text-yellow-200 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <span className="flex items-center gap-1">
                        <PackagePlus className="w-3 h-3" />
                        <span>Take ({items[curItem - 1].wt}kg)</span>
                      </span>
                      <span>{activeDec?.canTake ? `$${activeDec?.take}` : 'Too Heavy'}</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px]">
                    dp[{curItem}][{curCap}] = {activeDec?.canTake ? `max($${activeDec.skip}, $${activeDec.take})` : `$${activeDec?.skip}`} = <strong className="text-yellow-400">${knapsackData.dp[curItem][curCap]}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-sans text-xs text-slate-300">
            <strong className="text-yellow-400 block mb-1">Sacky's Law:</strong>
            "The budget $w$ is a resource spent by the TAKE door. Rolled space MUST run backward to prevent taking the same item twice!"
          </div>
        </div>
      </div>
    </div>
  );
}
