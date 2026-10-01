import React from 'react';
import { DoorOpen, FileText, Cpu, ShieldAlert, Trophy, AlertTriangle } from 'lucide-react';

export default function FiveSlotsHUD({
  problem,
  currentStep,
  activeCell,
  dpResults,
  n,
  terminationIndex
}) {
  const isGold = problem.isGold;
  const isTerm = currentStep === terminationIndex;

  return (
    <div className="space-y-4">
      {/* Slot 0 & 2: The Fulcrum & Transition card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <DoorOpen className="w-4 h-4" />
            <span>Slot 0: The Fulcrum (The Doors)</span>
          </div>
          <span className="text-[11px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
            {activeCell?.doors?.length || 0} Doors Into Step {currentStep}
          </span>
        </div>

        <p className="text-xs text-slate-300 italic mb-4">
          "{problem.slots.fulcrum}"
        </p>

        {/* The Doors Breakdown */}
        <div className="space-y-2 mb-4">
          {activeCell?.doors && activeCell.doors.length > 0 ? (
            activeCell.doors.map((door, dIdx) => (
              <div
                key={dIdx}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  door.chosen || !isGold
                    ? 'bg-slate-950 border-cyan-500/40 text-slate-100 shadow-md'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    door.hop === 1 ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                    door.hop === 2 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                  }`}>
                    {door.hop}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">
                      Door {door.hop}: Jump from Step {door.from} (+{door.hop} leap)
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Subproblem dp[{door.from}] = {door.prevVal} {isGold ? 'coins' : 'ways'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {isGold ? (
                    <span className={`font-mono font-bold ${door.chosen ? 'text-amber-400' : 'text-slate-500'}`}>
                      {door.total} coins {door.chosen && '⭐ (Best)'}
                    </span>
                  ) : (
                    <span className="font-mono text-cyan-300 font-bold">
                      +{door.contribution} ways
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
              <strong>Base Step 0:</strong> At the starting ground, exactly 1 trivial way (doing nothing).
            </div>
          )}
        </div>

        {/* Live Slot 2 Transition equation */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>Slot 2: Live Transition</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">{problem.slots.transition}</span>
          </div>
          <div className="text-sm font-mono font-bold text-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-cyan-400">dp[{currentStep}]</span>
            <span>=</span>
            {activeCell?.doors && activeCell.doors.length > 0 ? (
              isGold ? (
                <span>
                  {problem.goldValues[currentStep]} + max({activeCell.doors.map(d => d.prevVal).join(', ')}) ={' '}
                  <span className="text-emerald-400 underline">{activeCell.val}</span>
                </span>
              ) : (
                <span>
                  {activeCell.doors.map(d => `dp[${d.from}] (${d.prevVal})`).join(' + ')} ={' '}
                  <span className="text-emerald-400 underline">{activeCell.val}</span>
                </span>
              )
            ) : (
              <span className="text-amber-400">{activeCell?.val} (Base Case)</span>
            )}
          </div>
        </div>
      </div>

      {/* Sifu's 5 Slots Master Reference */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 pb-2 border-b border-slate-800 flex items-center gap-1.5">
          <FileText className="w-4 h-4" />
          <span>The Five Slots (Sifu's Creed)</span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="font-bold text-slate-200">1. State:</span>
            <p className="text-slate-400 italic mt-0.5">"{problem.slots.state}"</p>
          </div>

          <div>
            <span className="font-bold text-slate-200">3. Base Case:</span>
            <p className="text-slate-400 mt-0.5">{problem.slots.base}</p>
          </div>

          {/* Slot 4: Termination */}
          <div className={`p-3 rounded-xl border ${
            isGold
              ? 'bg-rose-950/30 border-rose-600/40 text-rose-200'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="flex items-center gap-1.5 text-purple-400">
                <Trophy className="w-3.5 h-3.5" />
                <span>4. Termination (Where does the answer live?)</span>
              </span>
              {isGold && (
                <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-extrabold uppercase">
                  Trap! Free Endpoint
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{problem.slots.termination}</p>
            <div className="mt-2 font-mono text-cyan-300 font-bold text-sm">
              Target Value = {isGold
                ? `max(dp) = ${dpResults[terminationIndex]?.val} (at Step ${terminationIndex})`
                : `dp[${n}] = ${dpResults[n]?.val}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
