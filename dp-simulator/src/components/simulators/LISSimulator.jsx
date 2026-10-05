import Playback from '../Playback';
import { useAutoplay } from '../../hooks/usePlayback';
import React, { useState, useMemo, useEffect } from 'react';
import { Link2, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LISSimulator({ input }) {
  const nums = input?.nums ?? [10, 9, 2, 5, 3, 7, 101, 18];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);

  // Compute LIS table
  const lisData = useMemo(() => {
    const dp = Array(nums.length).fill(1);
    const prevIndices = Array(nums.length).fill(-1);
    const doorsLog = [];

    for (let i = 0; i < nums.length; i++) {
      const validDoors = [];
      for (let j = 0; j < i; j++) {
        if (nums[j] < nums[i]) {
          validDoors.push({
            j,
            num: nums[j],
            dpVal: dp[j],
            candidateLen: dp[j] + 1
          });
          if (dp[j] + 1 > dp[i]) {
            dp[i] = dp[j] + 1;
            prevIndices[i] = j;
          }
        }
      }
      doorsLog.push(validDoors);
    }

    // Best overall
    let maxLen = 1;
    let maxIdx = 0;
    dp.forEach((len, idx) => {
      if (len > maxLen) {
        maxLen = len;
        maxIdx = idx;
      }
    });

    return { dp, prevIndices, doorsLog, maxLen, maxIdx };
  }, [nums]);

  const playback = useAutoplay({ playing: isPlaying, step: currentIdx, last: nums.length - 1, speed, setSpeed, onStep: setCurrentIdx, onStop: setIsPlaying });

  const activeDoors = lisData.doorsLog[currentIdx] || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                Chapter 10 Designated Simulation
              </span>
              <span className="text-xs text-slate-400 font-semibold">Lissa the Chainbuilder</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Longest Increasing Subsequence (LIS): Data-Driven Doors
            </h2>
          </div>
        </div>

        {/* Global Max LIS Badge */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">Max LIS length:</span>
          <span className="text-base font-black font-mono text-amber-400">
            {currentIdx === nums.length - 1 ? lisData.maxLen : Math.max(...lisData.dp.slice(0, currentIdx + 1))}
          </span>
        </div>

        {/* Controls */}
        <Playback compact playback={playback} length={nums.length} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Chain Array Strip (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-300">
              Evaluating Index i = {currentIdx} (Value: {nums[currentIdx]})
            </span>
            <span className="font-mono text-indigo-400 font-bold">
              Current dp[{currentIdx}] = {lisData.dp[currentIdx]}
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {nums.map((val, idx) => {
              const isCur = idx === currentIdx;
              const isPredecessor = activeDoors.some(d => d.j === idx);
              const isBestPredecessor = lisData.prevIndices[currentIdx] === idx;
              const hasComputed = idx <= currentIdx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentIdx(idx);
                    setIsPlaying(false);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    isCur
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400 scale-105 shadow-lg'
                      : isBestPredecessor
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                      : isPredecessor
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                      : hasComputed
                      ? 'bg-slate-950 border-slate-800 text-slate-300'
                      : 'bg-slate-950/40 border-slate-900 text-slate-600'
                  }`}
                >
                  <div className="text-[10px] text-slate-500 font-mono">[{idx}]</div>
                  <div className="text-lg font-black mt-0.5">{val}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    {hasComputed ? `dp:${lisData.dp[idx]}` : '?'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data-Driven Doors List */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-300 block">
              Data-Driven Doors (all j &lt; {currentIdx} where nums[j] &lt; {nums[currentIdx]}):
            </span>

            {activeDoors.length === 0 ? (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-amber-300">
                No smaller elements prior to {nums[currentIdx]}. Base length = 1.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeDoors.map((door) => {
                  const isBest = lisData.prevIndices[currentIdx] === door.j;
                  return (
                    <div
                      key={door.j}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        isBest ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>From [{door.j}] ({door.num}): dp[{door.j}] = {door.dpVal}</span>
                      <span className="font-mono">+{door.candidateLen} {isBest && '⭐'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Code Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 font-sans">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">LIS Synchronized Code</span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                  O(N²) Time
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Index i={currentIdx} ({nums[currentIdx]})
              </span>
            </div>

            <div className="space-y-1 text-slate-300">
              <div className="text-slate-500">def length_of_lis(nums):</div>
              <div className={`pl-4 py-0.5 rounded ${currentIdx === 0 ? 'bg-amber-950/70 border-l-2 border-amber-400 text-amber-200 font-bold' : 'text-slate-500'}`}>
                dp = [1] * len(nums)  # Base length 1
              </div>
              <div className="pl-4 text-slate-500">for i in range(len(nums)):</div>
              <div className={`pl-8 py-0.5 rounded ${currentIdx > 0 ? 'bg-indigo-950/70 border-l-2 border-indigo-400 text-indigo-200 font-bold' : 'text-slate-500'}`}>
                for j in range(i):  # DATA DOORS!
              </div>
              <div className={`pl-12 py-0.5 rounded ${currentIdx > 0 && activeDoors.length > 0 ? 'bg-cyan-950/70 border-l-2 border-cyan-400 text-cyan-200' : 'text-slate-500'}`}>
                if nums[j] &lt; nums[i]:
              </div>
              <div className={`pl-16 py-0.5 rounded ${currentIdx > 0 && activeDoors.length > 0 ? 'bg-emerald-950/70 border-l-2 border-emerald-400 text-emerald-200 font-bold' : 'text-slate-500'}`}>
                dp[i] = max(dp[i], dp[j] + 1)
              </div>
              <div className={`pl-4 py-0.5 rounded ${currentIdx === nums.length - 1 ? 'bg-amber-950/70 border-l-2 border-amber-400 text-amber-200 font-bold' : 'text-slate-500'}`}>
                return max(dp)  # Best LIS: {Math.max(...lisData.dp)}
              </div>
            </div>

            {/* Live Cell Arithmetic */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 font-sans text-xs">
              {activeDoors.length === 0 ? (
                <div className="text-amber-300 font-mono text-[11px]">
                  dp[{currentIdx}] = 1 (No smaller prior element: stands alone)
                </div>
              ) : (
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="text-slate-400">
                    Checked {currentIdx} predecessors · {activeDoors.length} valid doors (nums[j] &lt; {nums[currentIdx]})
                  </div>
                  <div className="text-emerald-300 font-bold">
                    Best predecessor index {lisData.prevIndices[currentIdx]} ({nums[lisData.prevIndices[currentIdx]]}): dp[{currentIdx}] = {lisData.dp[currentIdx]}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-sans text-xs text-slate-300">
            <strong className="text-indigo-400 block mb-1">Lissa's Lesson:</strong>
            "The inner <code className="text-cyan-300">for j in range(i)</code> IS the fulcrum. When doors are decided by data rather than fixed constants, transition cost becomes $O(N)$."
          </div>
        </div>
      </div>
    </div>
  );
}
