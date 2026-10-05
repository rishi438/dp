import Playback from '../Playback';
import { useAutoplay } from '../../hooks/usePlayback';
import React, { useState, useMemo, useEffect } from 'react';
import { Flame, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function KadaneSimulator({ input }) {
  const nums = input?.nums ?? [-2, 1, -3, 4, -1, 2, 1, -5, 4];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);

  // Compute Kadane DP table
  const kadaneData = useMemo(() => {
    const table = [];
    let maxOverall = -Infinity;
    let maxEndIdx = 0;
    let bestStart = 0;
    let curStart = 0;

    for (let i = 0; i < nums.length; i++) {
      const val = nums[i];
      if (i === 0) {
        table.push({
          num: val,
          dp: val,
          door: 'start_fresh',
          extendVal: null,
          freshVal: val,
          streakStart: 0,
          maxSoFar: val
        });
        maxOverall = val;
        maxEndIdx = 0;
      } else {
        const prevDp = table[i - 1].dp;
        const extendVal = prevDp + val;
        const freshVal = val;
        const chosenDoor = extendVal >= freshVal ? 'extend' : 'start_fresh';
        const dp = Math.max(extendVal, freshVal);

        if (chosenDoor === 'start_fresh') {
          curStart = i;
        }

        if (dp > maxOverall) {
          maxOverall = dp;
          maxEndIdx = i;
          bestStart = curStart;
        }

        table.push({
          num: val,
          dp,
          door: chosenDoor,
          extendVal,
          freshVal,
          streakStart: curStart,
          maxSoFar: maxOverall,
          isGlobalMax: dp === maxOverall
        });
      }
    }
    return { table, maxOverall, maxEndIdx, bestStart };
  }, [nums]);

  const playback = useAutoplay({ playing: isPlaying, step: currentIdx, last: nums.length - 1, speed, setSpeed, onStep: setCurrentIdx, onStop: setIsPlaying });

  const activeItem = kadaneData.table[currentIdx] || kadaneData.table[0];

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950 px-2 py-0.5 rounded border border-orange-800">
                Chapter 6 Designated Simulation
              </span>
              <span className="text-xs text-slate-400 font-semibold">Kade the Streak-Runner</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Kadane's Algorithm: Best Contiguous Run
            </h2>
          </div>
        </div>

        {/* Global Max Trophy Badge */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">Peak Streak max(dp):</span>
          <span className="text-base font-black font-mono text-amber-400">
            {activeItem.maxSoFar}
          </span>
        </div>

        {/* Playback */}
        <Playback compact playback={playback} length={nums.length} />
      </div>

      {/* Main Grid: Array Cards + The 2 Doors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Kadane Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Step Decisions Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase tracking-wider text-orange-400 font-bold">
                  Evaluating Index i = {currentIdx} (Value: {activeItem.num})
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  State: <strong className="text-slate-200">dp[i] = best contiguous sum ending exactly at i</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Current dp[i]:</span>
                <div className={`text-xl font-black font-mono ${activeItem.dp > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeItem.dp}
                </div>
              </div>
            </div>

            {/* The 2 Kadane Doors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Door 1: Extend */}
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                activeItem.door === 'extend'
                  ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg text-emerald-100'
                  : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <strong className="text-slate-200">Door 1: Extend Streak</strong>
                  {activeItem.door === 'extend' && (
                    <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                      CHOSEN
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Keep carrying momentum: <code className="font-mono">dp[i-1] + nums[i]</code>
                </p>
                <div className="font-mono font-bold text-xs pt-1">
                  {currentIdx > 0 ? `${kadaneData.table[currentIdx - 1].dp} + (${activeItem.num}) = ${activeItem.extendVal}` : 'N/A (first)'}
                </div>
              </div>

              {/* Door 2: Fresh Start */}
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                activeItem.door === 'start_fresh'
                  ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/40 shadow-lg text-amber-100'
                  : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <strong className="text-slate-200">Door 2: Start Fresh</strong>
                  {activeItem.door === 'start_fresh' && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                      CHOSEN
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Drop dead weight (prev streak was negative): <code className="font-mono">nums[i]</code>
                </p>
                <div className="font-mono font-bold text-xs pt-1">
                  Value = {activeItem.freshVal}
                </div>
              </div>
            </div>
          </div>

          {/* Numbers Array with Active Streak Highlight */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg">
            <span className="text-xs font-bold text-slate-300 block mb-2">
              Input Array & Running Streak Window
            </span>
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
              {nums.map((val, idx) => {
                const isCur = idx === currentIdx;
                const inCurrentStreak = idx >= activeItem.streakStart && idx <= currentIdx;
                const isBestStreak = idx >= kadaneData.bestStart && idx <= kadaneData.maxEndIdx && currentIdx === nums.length - 1;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentIdx(idx);
                      setIsPlaying(false);
                    }}
                    className={`p-2 rounded-lg border text-center cursor-pointer transition ${
                      isCur
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/50 scale-105'
                        : isBestStreak
                        ? 'bg-amber-950/80 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                        : inCurrentStreak
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] text-slate-500 font-mono">[{idx}]</div>
                    <div className="text-base font-extrabold mt-0.5">{val}</div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      {idx <= currentIdx ? `dp:${kadaneData.table[idx].dp}` : '?'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Code Viewer (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 font-sans">
              <span className="text-xs font-bold text-slate-200">Python: Kadane's Algorithm</span>
              <span className="text-[10px] bg-orange-950 text-orange-300 px-2 py-0.5 rounded border border-orange-800">
                O(N) Time · O(1) Space
              </span>
            </div>

            <div className="space-y-1 text-slate-300">
              <div className="text-slate-500">def max_sub_array(nums):</div>
              <div className={`pl-4 py-0.5 rounded ${currentIdx === 0 ? 'bg-orange-950/70 border-l-2 border-orange-400 text-orange-200' : ''}`}>
                cur_sum = nums[0]  # Base case
              </div>
              <div className={`pl-4 py-0.5 rounded ${currentIdx === 0 ? 'bg-orange-950/70 border-l-2 border-orange-400 text-orange-200' : ''}`}>
                max_sum = nums[0]  # Global peak
              </div>
              <div className="pl-4 text-slate-500">for x in nums[1:]:</div>
              <div className={`pl-8 py-0.5 rounded ${currentIdx > 0 && currentIdx < nums.length - 1 ? 'bg-orange-950/70 border-l-2 border-orange-400 text-orange-200' : ''}`}>
                cur_sum = max(x, cur_sum + x)  # 2 DOORS!
              </div>
              <div className={`pl-8 py-0.5 rounded ${currentIdx > 0 && currentIdx < nums.length - 1 ? 'bg-orange-950/70 border-l-2 border-orange-400 text-orange-200' : ''}`}>
                max_sum = max(max_sum, cur_sum)  # FREE ENDPOINT!
              </div>
              <div className={`pl-4 py-0.5 rounded ${currentIdx === nums.length - 1 ? 'bg-amber-950/70 border-l-2 border-amber-400 text-amber-200' : ''}`}>
                return max_sum  # Answer is max(dp)
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-sans text-xs text-slate-300">
            <strong className="text-orange-400 block mb-1">Kade's Lesson:</strong>
            "If your previous streak dropped below 0, carrying it only hurts you. Drop it and start fresh! And because the optimal streak can end at ANY index, the answer is always <code className="text-amber-300">max(dp)</code>."
          </div>
        </div>
      </div>
    </div>
  );
}
