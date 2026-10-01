import React from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';

export default function ExerciseControls({
  n,
  setN,
  maxN,
  currentStep,
  setCurrentStep,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed
}) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-3 shadow-lg">
      {/* Target N Selector */}
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Target N:
        </label>
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
          {[3, 4, 5, 6, 7].filter(val => val <= maxN).map(val => (
            <button
              key={val}
              onClick={() => {
                setN(val);
                setCurrentStep(0);
                setIsPlaying(false);
              }}
              className={`w-6 h-6 text-xs font-bold rounded flex items-center justify-center transition ${
                n === val
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Stepping Playback controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            setCurrentStep(0);
            setIsPlaying(false);
          }}
          title="Reset to Step 0"
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="text-[11px]">Reset</span>
        </button>

        <button
          onClick={() => {
            setIsPlaying(false);
            setCurrentStep(p => Math.max(0, p - 1));
          }}
          disabled={currentStep === 0}
          title="Step Backward"
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-0.5"
        >
          <ChevronLeft className="w-3 h-3" />
          <span className="text-[11px]">Prev</span>
        </button>

        <button
          onClick={() => {
            if (currentStep >= n) {
              setCurrentStep(0);
              setIsPlaying(true);
            } else {
              setIsPlaying(!isPlaying);
            }
          }}
          className={`px-3.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-slate-950" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{currentStep >= n ? 'Replay' : 'Step-Through'}</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            setIsPlaying(false);
            setCurrentStep(p => Math.min(n, p + 1));
          }}
          disabled={currentStep === n}
          title="Step Forward"
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-0.5"
        >
          <span className="text-[11px]">Next</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Speed Selector */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Gauge className="w-3 h-3 text-slate-500" />
        <span className="text-[11px]">Speed:</span>
        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          {[
            { label: '0.7x', ms: 1800 },
            { label: '1x', ms: 1200 },
            { label: '2x', ms: 600 }
          ].map(s => (
            <button
              key={s.label}
              onClick={() => setSpeed(s.ms)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                speed === s.ms
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
