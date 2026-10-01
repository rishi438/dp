import { useAutoplay } from '../../hooks/usePlayback';
import React, { useState, useEffect } from 'react';
import { Layers, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TabulationSimulator({ input }) {
  const [n, setN] = useState(input?.n ?? 7);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const speed = 1000;

  // Tabulation array computation
  const dp = n === 0 ? [1] : [1, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  useAutoplay({ playing: isPlaying, step: currentStep, last: n, speed, onStep: setCurrentStep, onStop: setIsPlaying });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">
              Chapter 3 · Bottom-Up Tabulation
            </div>
            <h3 className="font-bold text-white text-sm">
              Iterative Table Filling: Left-to-Right in O(1) Stack Space
            </h3>
          </div>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => { setCurrentStep(0); setIsPlaying(false); }}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setCurrentStep(p => Math.max(0, p - 1)); setIsPlaying(false); }}
              disabled={currentStep === 0}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
            >
              {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={() => { setCurrentStep(p => Math.min(n, p + 1)); setIsPlaying(false); }}
              disabled={currentStep >= n}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-[11px]">
            <span className="text-slate-400 font-mono">N:</span>
            <input
              type="range"
              min="0"
              max="9"
              value={n}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setN(val);
                if (currentStep > val) setCurrentStep(val);
              }}
              className="w-14 accent-purple-500 cursor-pointer"
            />
            <span className="font-mono font-bold text-purple-400">{n}</span>
          </div>
        </div>
      </div>

      {/* Visual Memory Array Display */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Loop Cursor at index <code>i = {currentStep}</code>:</span>
          <span className="font-mono text-purple-300 font-bold text-sm">dp[{currentStep}] = {dp[currentStep]}</span>
        </div>

        {/* Tabulation Array Ribbon */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {Array.from({ length: n + 1 }).map((_, idx) => {
            const isCur = idx === currentStep;
            const isDone = idx <= currentStep;
            const isDep1 = idx === currentStep - 1;
            const isDep2 = idx === currentStep - 2;

            return (
              <div
                key={idx}
                onClick={() => { setCurrentStep(idx); setIsPlaying(false); }}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isCur
                    ? 'bg-purple-600 border-purple-400 text-white font-bold ring-2 ring-purple-400/50 scale-105'
                    : isDep1
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                    : isDep2
                    ? 'bg-emerald-950 border-emerald-400 text-emerald-200'
                    : isDone
                    ? 'bg-slate-900 border-slate-700 text-slate-300'
                    : 'bg-slate-950/40 border-slate-900 text-slate-600'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400">[{idx}]</div>
                <div className="text-base font-black font-mono mt-1">
                  {isDone ? dp[idx] : '?'}
                </div>
                <div className="text-[8px] font-mono uppercase mt-0.5">
                  {isCur ? 'COMPUTING' : isDep1 ? 'dp[i-1]' : isDep2 ? 'dp[i-2]' : idx <= 1 ? 'BASE' : 'READY'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recurrence Equation */}
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs flex items-center justify-between font-mono">
          <div>
            {currentStep < 2 ? <>Base case: dp[{currentStep}] = 1 ({currentStep === 0 ? 'one empty path' : 'one single hop'})</> : <>dp[{currentStep}] = <span className="text-cyan-400 font-bold">{dp[currentStep - 1]}</span> + <span className="text-emerald-400 font-bold">{dp[currentStep - 2]}</span> = <span className="text-purple-300 font-black text-sm">{dp[currentStep]}</span></>}
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Stack Depth: <strong>O(1)</strong> (No recursive frames!)
          </div>
        </div>
      </div>
    </div>
  );
}
