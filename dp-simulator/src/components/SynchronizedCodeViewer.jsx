import React, { useState } from 'react';
import { Code2, Terminal, Play, CheckCircle2, ChevronRight } from 'lucide-react';

export default function SynchronizedCodeViewer({
  problemKey,
  currentStep,
  n,
  activeCell,
  terminationIndex,
  dpResults
}) {
  const [lang, setLang] = useState('python'); // 'python' | 'rust'

  // Code snippets with line mappings for each problem and step
  const getCodeData = () => {
    if (problemKey === 'frog12') {
      if (lang === 'python') {
        const lines = [
          { line: 1, text: 'def frog_ways(n):', comment: '' },
          { line: 2, text: '    if n <= 1: return 1', comment: '' },
          { line: 3, text: '    dp = [0] * (n + 1)', comment: '# O(N) memory table' },
          { line: 4, text: '    dp[0] = 1', comment: '# Base Case: ground step' },
          { line: 5, text: '    dp[1] = 1', comment: '# Base Case: only 1 hop possible' },
          { line: 6, text: '    for i in range(2, n + 1):', comment: '# Fill bottom-up' },
          { line: 7, text: '        dp[i] = dp[i-1] + dp[i-2]', comment: '# Door 1 + Door 2' },
          { line: 8, text: '    return dp[n]', comment: '# Forced endpoint' }
        ];

        let activeLine = 3;
        let executionNote = '';

        if (currentStep === 0) {
          activeLine = 4;
          executionNote = `Base Ground: dp[0] = 1`;
        } else if (currentStep === 1) {
          activeLine = 5;
          executionNote = `Base Step 1: dp[1] = 1 (only [1])`;
        } else if (currentStep < n) {
          activeLine = 7;
          executionNote = `Loop i=${currentStep}: dp[${currentStep}] = dp[${currentStep-1}](${dpResults[currentStep-1]?.val}) + dp[${currentStep-2}](${dpResults[currentStep-2]?.val}) = ${activeCell?.val}`;
        } else {
          activeLine = 8;
          executionNote = `Termination: return dp[${n}] = ${dpResults[n]?.val}`;
        }

        return { lines, activeLine, executionNote };
      } else {
        // Rust
        const lines = [
          { line: 1, text: 'pub fn frog_ways(n: usize) -> u64 {', comment: '' },
          { line: 2, text: '    if n <= 1 { return 1; }', comment: '' },
          { line: 3, text: '    let mut dp = vec![0u64; n + 1];', comment: '# allocate table' },
          { line: 4, text: '    dp[0] = 1;', comment: '# Base: ground' },
          { line: 5, text: '    dp[1] = 1;', comment: '# Base: step 1' },
          { line: 6, text: '    for i in 2..=n {', comment: '# Invariant loop' },
          { line: 7, text: '        dp[i] = dp[i - 1] + dp[i - 2];', comment: '# Sum doors' },
          { line: 8, text: '    }', comment: '' },
          { line: 9, text: '    dp[n]', comment: '# Return final step' },
          { line: 10, text: '}', comment: '' }
        ];

        let activeLine = 3;
        let executionNote = '';

        if (currentStep === 0) {
          activeLine = 4;
          executionNote = `dp[0] = 1 (ground truth)`;
        } else if (currentStep === 1) {
          activeLine = 5;
          executionNote = `dp[1] = 1 (derived)`;
        } else if (currentStep < n) {
          activeLine = 7;
          executionNote = `i=${currentStep}: dp[${currentStep}] = ${dpResults[currentStep-1]?.val} + ${dpResults[currentStep-2]?.val} = ${activeCell?.val}`;
        } else {
          activeLine = 9;
          executionNote = `dp[${n}] = ${dpResults[n]?.val}`;
        }

        return { lines, activeLine, executionNote };
      }
    } else if (problemKey === 'frog123') {
      if (lang === 'python') {
        const lines = [
          { line: 1, text: 'def frog_123(n):', comment: '# 3-Door Tribonacci' },
          { line: 2, text: '    if n <= 1: return 1', comment: '' },
          { line: 3, text: '    dp = [0] * (n + 1)', comment: '' },
          { line: 4, text: '    dp[0], dp[1] = 1, 1', comment: '# Base cases' },
          { line: 5, text: '    dp[2] = 2', comment: '# Derived: dp[1] + dp[0]' },
          { line: 6, text: '    for i in range(3, n + 1):', comment: '' },
          { line: 7, text: '        dp[i] = dp[i-1] + dp[i-2] + dp[i-3]', comment: '# Door 1+2+3' },
          { line: 8, text: '    return dp[n]', comment: '# Summit reached' }
        ];

        let activeLine = 3;
        let executionNote = '';

        if (currentStep === 0 || currentStep === 1) {
          activeLine = 4;
          executionNote = `Base Cases: dp[0]=1, dp[1]=1`;
        } else if (currentStep === 2) {
          activeLine = 5;
          executionNote = `Derived Base: dp[2] = dp[1](1) + dp[0](1) = 2`;
        } else if (currentStep < n) {
          activeLine = 7;
          executionNote = `i=${currentStep}: dp[${currentStep-1}](${dpResults[currentStep-1]?.val}) + dp[${currentStep-2}](${dpResults[currentStep-2]?.val}) + dp[${currentStep-3}](${dpResults[currentStep-3]?.val}) = ${activeCell?.val}`;
        } else {
          activeLine = 8;
          executionNote = `Answer: dp[${n}] = ${dpResults[n]?.val}`;
        }

        return { lines, activeLine, executionNote };
      } else {
        const lines = [
          { line: 1, text: 'pub fn frog_123(n: usize) -> u64 {', comment: '' },
          { line: 2, text: '    if n <= 1 { return 1; }', comment: '' },
          { line: 3, text: '    let mut dp = vec![0u64; n + 1];', comment: '' },
          { line: 4, text: '    dp[0] = 1; dp[1] = 1; dp[2] = 2;', comment: '# Derived base' },
          { line: 5, text: '    for i in 3..=n {', comment: '' },
          { line: 6, text: '        dp[i] = dp[i-1] + dp[i-2] + dp[i-3];', comment: '# 3 doors' },
          { line: 7, text: '    }', comment: '' },
          { line: 8, text: '    dp[n]', comment: '' },
          { line: 9, text: '}', comment: '' }
        ];

        let activeLine = 3;
        let executionNote = '';
        if (currentStep <= 2) {
          activeLine = 4;
          executionNote = `Base values initialized`;
        } else if (currentStep < n) {
          activeLine = 6;
          executionNote = `i=${currentStep}: 3 doors sum = ${activeCell?.val}`;
        } else {
          activeLine = 8;
          executionNote = `dp[${n}] = ${dpResults[n]?.val}`;
        }

        return { lines, activeLine, executionNote };
      }
    } else {
      // Gold problem
      if (lang === 'python') {
        const lines = [
          { line: 1, text: 'def max_gold(n, gold):', comment: '# Challenge 7' },
          { line: 2, text: '    dp = [0] * (n + 1)', comment: '' },
          { line: 3, text: '    dp[0] = gold[0]', comment: '# Start reward' },
          { line: 4, text: '    dp[1] = gold[1] + dp[0]', comment: '# Only from step 0' },
          { line: 5, text: '    for i in range(2, n + 1):', comment: '' },
          { line: 6, text: '        dp[i] = gold[i] + max(dp[i-1], dp[i-2])', comment: '# Choose best' },
          { line: 7, text: '    return max(dp)', comment: '# TRAP: FREE ENDPOINT!' }
        ];

        let activeLine = 2;
        let executionNote = '';

        if (currentStep === 0) {
          activeLine = 3;
          executionNote = `dp[0] = gold[0] (${dpResults[0]?.val})`;
        } else if (currentStep === 1) {
          activeLine = 4;
          executionNote = `dp[1] = gold[1] + dp[0] = ${dpResults[1]?.val}`;
        } else if (currentStep < n) {
          activeLine = 6;
          executionNote = `i=${currentStep}: gold[${currentStep}] + max(${activeCell?.doors?.map(d=>d.prevVal).join(',')}) = ${activeCell?.val}`;
        } else {
          activeLine = 7;
          executionNote = `King's Decree: stop anywhere! max(dp) = ${dpResults[terminationIndex]?.val} (Step ${terminationIndex})`;
        }

        return { lines, activeLine, executionNote };
      } else {
        const lines = [
          { line: 1, text: 'pub fn max_gold(n: usize, gold: &[i32]) -> i32 {', comment: '' },
          { line: 2, text: '    let mut dp = vec![0i32; n + 1];', comment: '' },
          { line: 3, text: '    dp[0] = gold[0];', comment: '' },
          { line: 4, text: '    dp[1] = gold[1] + dp[0];', comment: '' },
          { line: 5, text: '    for i in 2..=n {', comment: '' },
          { line: 6, text: '        dp[i] = gold[i] + dp[i-1].max(dp[i-2]);', comment: '' },
          { line: 7, text: '    }', comment: '' },
          { line: 8, text: '    *dp.iter().max().unwrap()', comment: '# Survey max!' },
          { line: 9, text: '}', comment: '' }
        ];

        let activeLine = 2;
        let executionNote = '';
        if (currentStep === 0) activeLine = 3;
        else if (currentStep === 1) activeLine = 4;
        else if (currentStep < n) activeLine = 6;
        else activeLine = 8;
        executionNote = `Active step ${currentStep}`;

        return { lines, activeLine, executionNote };
      }
    }
  };

  const { lines, activeLine, executionNote } = getCodeData();

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200">
            Synchronized Code Execution
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md p-0.5">
          <button
            onClick={() => setLang('python')}
            className={`px-2 py-0.5 text-[11px] font-bold rounded transition ${
              lang === 'python'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Python
          </button>
          <button
            onClick={() => setLang('rust')}
            className={`px-2 py-0.5 text-[11px] font-bold rounded transition ${
              lang === 'rust'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rust
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="p-3 font-mono text-[11px] leading-relaxed overflow-x-auto flex-1 bg-slate-950/70">
        {lines.map((item) => {
          const isActive = item.line === activeLine;
          return (
            <div
              key={item.line}
              className={`flex items-center py-0.5 px-2 rounded transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-950/70 border-l-4 border-cyan-400 text-cyan-100 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900/50'
              }`}
            >
              {/* Line number */}
              <span className={`w-6 shrink-0 select-none text-[10px] ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-600'}`}>
                {item.line}
              </span>

              {/* Execution pointer indicator */}
              <span className="w-4 shrink-0 text-cyan-400 font-bold">
                {isActive ? '➔' : ''}
              </span>

              {/* Line code */}
              <span className={`flex-1 whitespace-pre ${isActive ? 'text-slate-100 font-semibold' : 'text-slate-300'}`}>
                {item.text}
              </span>

              {/* In-line Comment */}
              {item.comment && (
                <span className="text-[10px] text-slate-500 italic ml-2 hidden sm:inline">
                  {item.comment}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Live Variable Evaluation Banner */}
      <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 text-[11px] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-cyan-400 font-bold">Live Eval:</span>
          <span className="text-slate-300 font-mono truncate">{executionNote}</span>
        </div>
        <span className="text-[10px] text-slate-500 shrink-0 font-sans">
          Step {currentStep} / {n}
        </span>
      </div>
    </div>
  );
}
