import React from 'react';
import { Footprints, ArrowRight } from 'lucide-react';

export default function PhysicalPathsProof({
  currentStep,
  paths = [],
  isGold,
  goldVal,
  activeCell
}) {
  if (isGold) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
          <span className="flex items-center gap-1.5 text-amber-400">
            <Footprints className="w-4 h-4" />
            <span>Path Optimization Inspection:</span>
          </span>
          <span className="text-[11px] font-mono text-cyan-300">
            Best accumulated gold = {activeCell?.val} coins
          </span>
        </div>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
          {currentStep === 0 ? (
            <span>Frog starts at ground step 0 with {goldVal} gold.</span>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span>Step {currentStep} earns <strong className="text-amber-400">{goldVal} gold</strong>.</span>
              <span>
                Optimal previous step was:{' '}
                <strong className="text-cyan-300">
                  {activeCell?.doors?.find(d => d.chosen)?.from !== undefined
                    ? `Step ${activeCell.doors.find(d => d.chosen).from}`
                    : 'Step 0'}
                </strong>
              </span>
              <span>➔ Total = <strong>{activeCell?.val} gold</strong>.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2.5">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <Footprints className="w-4 h-4" />
          <span>Physical Paths Proof (Step {currentStep}):</span>
        </span>
        <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
          Total = {paths.length} distinct paths
        </span>
      </div>

      <p className="text-[11px] text-slate-400 mb-2">
        Every single path that ends at step {currentStep}, grouped by its <strong>very last hop (The Door)</strong>:
      </p>

      {paths.length === 0 ? (
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-500 italic">
          Frog is at Ground (Step 0) — no hops needed.
        </div>
      ) : (
        <div className="max-h-28 overflow-y-auto pr-1 flex flex-wrap gap-2">
          {paths.map((p, idx) => {
            const lastHop = p[p.length - 1];
            let badgeStyle = 'bg-sky-950/80 border-sky-600/50 text-sky-200';
            if (lastHop === 2) badgeStyle = 'bg-amber-950/80 border-amber-600/50 text-amber-200';
            if (lastHop === 3) badgeStyle = 'bg-pink-950/80 border-pink-600/50 text-pink-200';

            return (
              <div
                key={idx}
                className={`text-xs px-2.5 py-1 rounded-lg border font-mono flex items-center gap-1.5 ${badgeStyle}`}
              >
                <span>[{p.join(' ➔ ')}]</span>
                <span className="text-[10px] font-sans font-bold opacity-80">
                  (Door {lastHop}: +{lastHop})
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
