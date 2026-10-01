import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Shield, Trophy, ArrowDownLeft } from 'lucide-react';

export default function DPNode({ data }) {
  const {
    index,
    val,
    isBase,
    isActive,
    isDependency,
    isTermination,
    isComputed,
    isGold,
    goldVal,
    onClick
  } = data;

  // Sleek, compact styling
  let borderClass = 'border-slate-800 bg-slate-900/90 text-slate-400';
  let badge = null;

  if (isActive) {
    borderClass = 'border-cyan-400 bg-gradient-to-b from-cyan-950 to-slate-900 ring-2 ring-cyan-500/40 text-white shadow-lg active-dp-node';
    badge = (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-cyan-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow whitespace-nowrap">
        <span role="img" aria-label="Frog at the current step">🐸 Sifu</span>
      </div>
    );
  } else if (isTermination) {
    borderClass = 'border-purple-400 bg-gradient-to-b from-purple-950/80 to-slate-900 text-purple-100 ring-1 ring-purple-500/40 shadow';
    badge = (
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full shadow">
        <Trophy className="w-2 h-2" />
        <span>Goal</span>
      </div>
    );
  } else if (isDependency) {
    borderClass = 'border-emerald-400 bg-gradient-to-b from-emerald-950/80 to-slate-900 text-emerald-100 ring-1 ring-emerald-500/30';
    badge = (
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full shadow">
        <ArrowDownLeft className="w-2 h-2" />
        <span>Door</span>
      </div>
    );
  } else if (isBase) {
    borderClass = 'border-amber-400/80 bg-gradient-to-b from-amber-950/60 to-slate-900 text-amber-200';
    badge = (
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-amber-500 text-slate-950 text-[8px] font-bold px-1.5 py-0.2 rounded-full shadow">
        <Shield className="w-2 h-2" />
        <span>Base</span>
      </div>
    );
  } else if (isComputed) {
    borderClass = 'border-slate-700 bg-slate-900 text-slate-200';
  }

  return (
    <div
      onClick={onClick}
      className={`relative min-w-[100px] rounded-lg border-2 p-2 transition-all duration-200 cursor-pointer hover:scale-102 ${borderClass}`}
    >
      {badge}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-cyan-400 !border !border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-emerald-400 !border !border-slate-900"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between gap-1 border-b border-slate-800 pb-0.5 mb-1">
        <span className="text-[11px] font-mono font-bold text-slate-300">
          dp[{index}]
        </span>
        <span className="text-[9px] text-slate-500 uppercase font-semibold">
          Step {index}
        </span>
      </div>

      {/* Gold badge if gold problem */}
      {isGold && goldVal !== undefined && (
        <div className="text-[9px] font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1 rounded text-center mb-0.5">
          {goldVal >= 0 ? `+${goldVal}🪙` : `${goldVal}🪙`}
        </div>
      )}

      {/* Value Display */}
      <div className="text-center">
        <div className="text-base font-extrabold font-mono tracking-tight text-white">
          {isComputed ? val : <span className="text-slate-600">?</span>}
        </div>
        <div className="text-[9px] text-slate-400">
          {isGold ? 'coins' : 'ways'}
        </div>
      </div>
    </div>
  );
}
