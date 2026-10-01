import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Coins,
  GitBranch,
  Layers,
  CheckCircle2,
  ArrowRight,
  Share2,
  Box,
  Split,
  Eye,
  Info,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Import Chapter-Designated Simulators for Chapters 4..18
import SpaceOptimizedSimulator from './SpaceOptimizedSimulator';
import CoinChangeSimulator from './CoinChangeSimulator';
import KadaneSimulator from './KadaneSimulator';
import LCSSimulator from './LCSSimulator';
import GridMovementSimulator from './GridMovementSimulator';
import KnapsackSimulator from './KnapsackSimulator';
import LISSimulator from './LISSimulator';
import StateMachineSimulator from './StateMachineSimulator';
import IntervalSplitSimulator from './IntervalSplitSimulator';
import PalindromicSimulator from './PalindromicSimulator';
import TreeDPSimulator from './TreeDPSimulator';
import BitmaskSimulator from './BitmaskSimulator';
import DigitDPSimulator from './DigitDPSimulator';
import ProbabilityDPSimulator from './ProbabilityDPSimulator';
import OptimizedDPSimulator from './OptimizedDPSimulator';
import RecursionTreeSimulator from './RecursionTreeSimulator';
import MemoizationSimulator from './MemoizationSimulator';
import TabulationSimulator from './TabulationSimulator';

export default function ChallengeSimulationView({ chapterNum = 0, challengeIndex = 0, challenge, suite }) {
  // =========================================================================
  // ROUTING BY CHAPTER: CHAPTERS 1 TO 18 USE THEIR DESIGNATED DOMAIN SIMULATORS!
  // =========================================================================
  if (chapterNum === 1) return <RecursionTreeSimulator />;
  if (chapterNum === 2) return <MemoizationSimulator />;
  if (chapterNum === 3) return <TabulationSimulator />;
  if (chapterNum === 4) return <SpaceOptimizedSimulator />;
  if (chapterNum === 5) return <CoinChangeSimulator />;
  if (chapterNum === 6) return <KadaneSimulator />;
  if (chapterNum === 7) return <LCSSimulator />;
  if (chapterNum === 8) return <GridMovementSimulator />;
  if (chapterNum === 9) return <KnapsackSimulator />;
  if (chapterNum === 10) return <LISSimulator />;
  if (chapterNum === 11) return <StateMachineSimulator />;
  if (chapterNum === 12) return <IntervalSplitSimulator />;
  if (chapterNum === 13) return <PalindromicSimulator />;
  if (chapterNum === 14) return <TreeDPSimulator />;
  if (chapterNum === 15) return <BitmaskSimulator />;
  if (chapterNum === 16) return <DigitDPSimulator />;
  if (chapterNum === 17) return <ProbabilityDPSimulator />;
  if (chapterNum === 18) return <OptimizedDPSimulator />;

  // =========================================================================
  // CHAPTER 3: BOTTOM-UP TABULATION ORDER
  // =========================================================================
  if (chapterNum === 3) {
    return <BottomUpTabulationVisualizer />;
  }

  // =========================================================================
  // CHAPTER 0: 7 DISTINCT BESPOKE SIMULATORS FOR CHALLENGES 1 THROUGH 7!
  // =========================================================================
  if (challengeIndex === 0) {
    return <TwoLawsVisualizer />;
  }
  if (challengeIndex === 1) {
    return <FiveSlotsEngineVisualizer />;
  }
  if (challengeIndex === 2) {
    return <TribonacciPhysicalPathVisualizer />;
  }
  if (challengeIndex === 3) {
    return <HandTraceTableVisualizer />;
  }
  if (challengeIndex === 4) {
    return <AlgorithmTabulationVisualizer />;
  }
  if (challengeIndex === 5) {
    return <BoundaryFlawVisualizer />;
  }
  if (challengeIndex === 6) {
    return <KingsGoldDecreeVisualizer />;
  }

  return <TwoLawsVisualizer />;
}

// ===========================================================================
// SUB-SIMULATOR 1: TWO LAWS VERIFICATION (Challenge 1)
// NOT jumping stairs! Shows DAG subproblem sharing & optimal substructure.
// ===========================================================================
function TwoLawsVisualizer() {
  const [activeLaw, setActiveLaw] = useState('law1'); // 'law1' (Optimal Substructure) | 'law2' (Overlapping)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Challenge 1 · Conceptual Drill
            </div>
            <h3 className="font-bold text-white text-sm">
              The Two Laws of Dynamic Programming
            </h3>
          </div>
        </div>

        {/* Law Toggle Buttons */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveLaw('law1')}
            className={`px-3 py-1 rounded-lg transition ${
              activeLaw === 'law1' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Law 1: Substructure
          </button>
          <button
            onClick={() => setActiveLaw('law2')}
            className={`px-3 py-1 rounded-lg transition ${
              activeLaw === 'law2' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Law 2: Overlapping
          </button>
        </div>
      </div>

      {/* Visual Canvas for Selected Law */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-4">
        {activeLaw === 'law1' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300">Law 1: Optimal Substructure (Independence)</span>
              <span className="text-[11px] font-mono text-slate-400">dp[i] = dp[i-1] + dp[i-2]</span>
            </div>

            {/* Substructure DAG Diagram */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-cyan-950 border border-cyan-500 rounded-xl text-center shadow-lg shadow-cyan-950/50">
                <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Optimal Solution Target</div>
                <div className="text-base font-black text-white font-mono mt-0.5">dp[4] (Ways to Step 4)</div>
              </div>

              <div className="flex items-center gap-8 w-full justify-center">
                <div className="flex flex-col items-center">
                  <div className="text-cyan-400 text-xs font-mono font-bold mb-1">&swarr; Door 1</div>
                  <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-center w-32">
                    <div className="text-[10px] text-slate-400 font-mono">Subproblem A</div>
                    <div className="font-bold text-white text-xs mt-0.5">dp[3] = 3 ways</div>
                    <div className="text-[9px] text-emerald-400 mt-1 font-semibold">Independent!</div>
                  </div>
                </div>

                <div className="text-xl font-bold text-slate-500">+</div>

                <div className="flex flex-col items-center">
                  <div className="text-cyan-400 text-xs font-mono font-bold mb-1">Door 2 &searr;</div>
                  <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-center w-32">
                    <div className="text-[10px] text-slate-400 font-mono">Subproblem B</div>
                    <div className="font-bold text-white text-xs mt-0.5">dp[2] = 2 ways</div>
                    <div className="text-[9px] text-emerald-400 mt-1 font-semibold">Independent!</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-lg text-xs text-cyan-200 leading-relaxed">
              <strong>Why Law 1 Holds:</strong> The choice to hop 1 from step 3 or hop 2 from step 2 has <em>no side effects</em>. The optimal solutions to smaller subproblems combine without interfering with each other.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-300">Law 2: Overlapping Subproblems (Shared Nodes)</span>
              <span className="text-[11px] font-mono text-purple-400">Node dp[2] Reused Repeatedly</span>
            </div>

            {/* Overlap Graph Diagram */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-12">
                <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-center">
                  <div className="text-[10px] text-slate-400 font-mono">Parent 1</div>
                  <div className="font-bold text-white text-xs mt-0.5">dp[4]</div>
                </div>
                <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-center">
                  <div className="text-[10px] text-slate-400 font-mono">Parent 2</div>
                  <div className="font-bold text-white text-xs mt-0.5">dp[3]</div>
                </div>
              </div>

              {/* Shared Node with glowing ring */}
              <div className="p-3 bg-purple-950 border-2 border-purple-400 rounded-xl text-center shadow-lg shadow-purple-900/60 animate-pulse">
                <div className="text-[9px] font-mono text-purple-300 uppercase font-black tracking-wider">
                  Shared Subproblem (Repeated!)
                </div>
                <div className="text-sm font-black text-white font-mono mt-0.5">
                  dp[2] is needed by BOTH parents!
                </div>
              </div>
            </div>

            <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-lg text-xs text-purple-200 leading-relaxed">
              <strong>Why Law 2 Holds:</strong> Plain recursion computes <code>dp[2]</code> multiple times because different parents ask for it. Storing it in an array allows O(1) instant reuse!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// SUB-SIMULATOR 2: FIVE SLOTS HUD (Challenge 2)
// Walkthrough of 0.Fulcrum -> 1.State -> 2.Transition -> 3.Base -> 4.Termination
// ===========================================================================
function FiveSlotsEngineVisualizer() {
  const [activeSlot, setActiveSlot] = useState(0);

  const slots = [
    {
      num: 0,
      name: 'FULCRUM',
      color: 'text-purple-400 border-purple-500 bg-purple-950/40',
      question: 'What was the LAST decision made to land on step i?',
      answer: 'The last hop was either 1 step or 2 steps (2 doors).'
    },
    {
      num: 1,
      name: 'STATE',
      color: 'text-cyan-400 border-cyan-500 bg-cyan-950/40',
      question: 'What does dp[i] represent?',
      answer: 'dp[i] = total distinct ways to reach step i.'
    },
    {
      num: 2,
      name: 'TRANSITION',
      color: 'text-emerald-400 border-emerald-500 bg-emerald-950/40',
      question: 'How do you combine the doors?',
      answer: 'dp[i] = dp[i-1] + dp[i-2] (sum of ways through all open doors).'
    },
    {
      num: 3,
      name: 'BASE CASES',
      color: 'text-amber-400 border-amber-500 bg-amber-950/40',
      question: 'Where does the recursion stop?',
      answer: 'dp[1] = 1, dp[2] = 2 (minimum steps to prime the recurrence).'
    },
    {
      num: 4,
      name: 'TERMINATION',
      color: 'text-rose-400 border-rose-500 bg-rose-950/40',
      question: 'Where does the final answer live?',
      answer: 'The top of the ladder is step n, so the answer is dp[n].'
    }
  ];

  const cur = slots[activeSlot];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">
              Challenge 2 · Five Slots Engine
            </div>
            <h3 className="font-bold text-white text-sm">
              Sifu's Five Slots Architecture
            </h3>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Slot {activeSlot + 1} of 5
        </span>
      </div>

      {/* Stepper Buttons for Slots 0..4 */}
      <div className="grid grid-cols-5 gap-1.5">
        {slots.map((s, idx) => (
          <button
            key={s.num}
            onClick={() => setActiveSlot(idx)}
            className={`p-2 rounded-xl border text-center transition-all ${
              activeSlot === idx
                ? 'bg-purple-600 border-purple-400 text-white font-black scale-105 shadow-md shadow-purple-900/50'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[9px] font-mono uppercase opacity-75">Slot {s.num}</div>
            <div className="text-[11px] font-bold mt-0.5 truncate">{s.name}</div>
          </button>
        ))}
      </div>

      {/* Active Slot Detailed Display */}
      <div className={`p-4 rounded-xl border ${cur.color} space-y-2`}>
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
          Slot {cur.num}: {cur.name}
        </div>
        <div className="text-sm font-semibold text-white">
          {cur.question}
        </div>
        <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 mt-2">
          &rarr; {cur.answer}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// SUB-SIMULATOR 3: TRIBONACCI 3-DOOR PHYSICAL PATH DERIVATION (Challenge 3)
// Visualizes the 4 distinct physical paths that prove dp[3] = 4!
// ===========================================================================
function TribonacciPhysicalPathVisualizer() {
  const [selectedPath, setSelectedPath] = useState(0);

  const paths = [
    { title: 'Path 1: [1, 1, 1]', hops: '1 + 1 + 1', desc: 'Three consecutive 1-step hops' },
    { title: 'Path 2: [1, 2]', hops: '1 + 2', desc: 'One 1-step hop, then a 2-step hop' },
    { title: 'Path 3: [2, 1]', hops: '2 + 1', desc: 'One 2-step hop, then a 1-step hop' },
    { title: 'Path 4: [3]', hops: '3', desc: 'A single 3-step giant leap directly from ground!' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 rounded-lg">
            <Split className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-400 font-mono">
              Challenge 3 · Base Derivation
            </div>
            <h3 className="font-bold text-white text-sm">
              Why dp[3] = 4: The 4 Physical Paths
            </h3>
          </div>
        </div>

        <span className="text-[11px] font-mono text-fuchsia-300 font-bold bg-fuchsia-950 px-2 py-0.5 rounded border border-fuchsia-800">
          3 Doors (1, 2, 3)
        </span>
      </div>

      {/* Interactive Path Selector */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {paths.map((p, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedPath(idx)}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedPath === idx
                ? 'bg-fuchsia-950/60 border-fuchsia-400 ring-2 ring-fuchsia-500/40 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs">{p.title}</div>
            <div className="font-mono text-[11px] text-fuchsia-300 mt-1">{p.hops}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
          </div>
        ))}
      </div>

      {/* Physical Derivation Proof */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1 font-mono">
        <div className="text-slate-400 text-[11px]">Sifu's Derivation Warning:</div>
        <div className="text-white">
          Never copy a Fibonacci pattern blindly! For 3 doors:
        </div>
        <div className="text-fuchsia-300 font-bold">
          dp[3] = dp[2] + dp[1] + dp[0] = 2 + 1 + 1 = 4 ways!
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// SUB-SIMULATOR 4: HAND-TRACE TABLE CALCULATOR (Challenge 4)
// Interactive calculator verifying arithmetic: dp[3]=4, dp[4]=7, dp[5]=13
// ===========================================================================
function HandTraceTableVisualizer() {
  const [activeCell, setActiveCell] = useState(3);

  const table = [
    { i: 0, val: 1, isBase: true },
    { i: 1, val: 1, isBase: true },
    { i: 2, val: 2, isBase: true },
    { i: 3, val: 4, formula: 'dp[2] + dp[1] + dp[0] = 2 + 1 + 1 = 4' },
    { i: 4, val: 7, formula: 'dp[3] + dp[2] + dp[1] = 4 + 2 + 1 = 7' },
    { i: 5, val: 13, formula: 'dp[4] + dp[3] + dp[2] = 7 + 4 + 2 = 13' }
  ];

  const current = table[activeCell];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
              Challenge 4 · Hand-Trace Table
            </div>
            <h3 className="font-bold text-white text-sm">
              Step-by-Step Table Calculation
            </h3>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Click cell to inspect</span>
      </div>

      {/* Grid of Cells */}
      <div className="grid grid-cols-6 gap-2">
        {table.map((c) => (
          <div
            key={c.i}
            onClick={() => setActiveCell(c.i)}
            className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
              activeCell === c.i
                ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] font-mono text-slate-500">dp[{c.i}]</div>
            <div className="text-base font-black font-mono text-white mt-1">{c.val}</div>
            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
              {c.isBase ? 'Base' : 'Sum'}
            </div>
          </div>
        ))}
      </div>

      {/* Inspection Box */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1 font-mono">
        <div className="text-amber-400 font-bold">
          Inspecting dp[{current.i}]:
        </div>
        <div className="text-slate-200">
          {current.isBase ? 'Base Case primed into table' : current.formula}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// SUB-SIMULATOR 5: ALGORITHM TABULATION STEPPER (Challenge 5)
// ===========================================================================
function AlgorithmTabulationVisualizer() {
  const [step, setStep] = useState(3);
  const dp = [1, 1, 2, 4, 7, 13];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg">
            <Play className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Challenge 5 · Code Execution
            </div>
            <h3 className="font-bold text-white text-sm">
              frog_123(n) Loop Invariant Execution
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStep(p => Math.max(3, p - 1))}
            disabled={step <= 3}
            className="p-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-xs text-cyan-400 px-1">i = {step}</span>
          <button
            onClick={() => setStep(p => Math.min(5, p + 1))}
            disabled={step >= 5}
            className="p-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
        <div className="text-slate-400">Memory Array:</div>
        <div className="flex items-center gap-2">
          {dp.map((val, idx) => (
            <div
              key={idx}
              className={`flex-1 p-2 rounded-lg border text-center ${
                idx === step
                  ? 'bg-cyan-600 border-cyan-400 text-white font-bold ring-2 ring-cyan-400/50'
                  : idx < step
                  ? 'bg-slate-900 border-slate-700 text-slate-300'
                  : 'bg-slate-950/40 border-slate-900 text-slate-600'
              }`}
            >
              <div className="text-[9px] text-slate-500">[{idx}]</div>
              <div className="mt-0.5">{idx <= step ? val : '?'}</div>
            </div>
          ))}
        </div>
        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-cyan-300 text-[11px]">
          Computing: dp[{step}] = dp[{step-1}] + dp[{step-2}] + dp[{step-3}] = {dp[step]}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// SUB-SIMULATOR 6: BOUNDARY FLAW & MEMORY CRASH (Challenge 6)
// ===========================================================================
function BoundaryFlawVisualizer() {
  const [flawMode, setFlawMode] = useState('flawed');
  const [flawExecuted, setFlawExecuted] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono">
              Challenge 6 · Trap Drill
            </div>
            <h3 className="font-bold text-white text-sm">
              IndexError Crash on frog_ways(1)
            </h3>
          </div>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => { setFlawMode('flawed'); setFlawExecuted(false); }}
            className={`px-2.5 py-1 rounded-lg transition ${
              flawMode === 'flawed' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔴 Flawed Code
          </button>
          <button
            onClick={() => { setFlawMode('guarded'); setFlawExecuted(false); }}
            className={`px-2.5 py-1 rounded-lg transition ${
              flawMode === 'guarded' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            🟢 Guarded Code
          </button>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
        <div className="text-xs text-slate-300">
          When input is <code className="text-rose-400 font-bold">n = 1</code>, array size is <code className="text-white">1 + 1 = 2</code> cells:
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="text-[10px] font-mono text-slate-500">[0]</div>
            <div className="text-sm font-bold text-slate-300 mt-0.5">0</div>
          </div>
          <div className="p-2.5 bg-slate-900 border border-cyan-500/50 rounded-xl">
            <div className="text-[10px] font-mono text-cyan-400">[1]</div>
            <div className="text-sm font-bold text-cyan-300 mt-0.5">1</div>
          </div>
          <div className={`p-2.5 rounded-xl border transition-all ${
            flawMode === 'flawed' ? 'bg-rose-950 border-rose-500' : 'bg-slate-900/30 border-slate-800 opacity-40'
          }`}>
            <div className="text-[10px] font-mono text-rose-400">[2]</div>
            <div className="text-xs font-bold text-rose-300 mt-0.5">OUT OF RANGE</div>
          </div>
          <div className="p-2.5 bg-slate-900/30 border border-slate-800 rounded-xl opacity-30">
            <div className="text-[10px] font-mono text-slate-600">[3..]</div>
            <div className="text-xs text-slate-600 mt-0.5">-</div>
          </div>
        </div>

        <button
          onClick={() => setFlawExecuted(true)}
          className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
            flawMode === 'flawed' ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{flawMode === 'flawed' ? 'Run dp[2] = 2 (Crash)' : 'Run with Guard if n <= 1 (Safe)'}</span>
        </button>

        {flawExecuted && (
          <div className={`p-3 rounded-xl border text-xs font-mono ${
            flawMode === 'flawed' ? 'bg-rose-950/60 border-rose-500 text-rose-200' : 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
          }`}>
            {flawMode === 'flawed' ? (
              <div>💥 IndexError: list assignment index out of range! Array only has indices 0 and 1!</div>
            ) : (
              <div>✔ Safe exit: if n &lt;= 1 returned 1 immediately without touching dp[2]!</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// SUB-SIMULATOR 7: KING'S GOLD DECREE (Challenge 7)
// ===========================================================================
function KingsGoldDecreeVisualizer() {
  const [selectedOption, setSelectedOption] = useState('decree'); // 'habit' | 'decree'
  const gold = [10, 20, -50, 15];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
              Challenge 7 · Termination Trap
            </div>
            <h3 className="font-bold text-white text-sm">
              King's Gold Decree: "Stop Anywhere!"
            </h3>
          </div>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setSelectedOption('habit')}
            className={`px-2.5 py-1 rounded-lg transition ${
              selectedOption === 'habit' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Habit: dp[n]
          </button>
          <button
            onClick={() => setSelectedOption('decree')}
            className={`px-2.5 py-1 rounded-lg transition ${
              selectedOption === 'decree' ? 'bg-amber-600 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Decree: max(dp)
          </button>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
        <div className="text-xs text-slate-300">
          Gold on steps: <code className="text-amber-400 font-bold">[10, 20, -50, 15]</code>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {gold.map((val, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border ${
                idx === 1 && selectedOption === 'decree'
                  ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-400/50'
                  : idx === 3 && selectedOption === 'habit'
                  ? 'bg-rose-950/80 border-rose-400 ring-2 ring-rose-400/50'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-500">Step {idx}</div>
              <div className={`text-base font-black font-mono mt-1 ${val < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                {val > 0 ? `+${val}` : val} 🪙
              </div>
              <div className="text-[9px] text-slate-400 mt-1">
                {idx === 1 ? 'Stop here!' : idx === 2 ? 'Penalty!' : idx === 3 ? 'Top' : 'Start'}
              </div>
            </div>
          ))}
        </div>

        <div className={`p-3 rounded-xl border text-xs font-mono leading-relaxed ${
          selectedOption === 'decree' ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
        }`}>
          {selectedOption === 'decree' ? (
            <div>
              🏆 <strong>Decree Winner:</strong> Frog stops at Step 1 and pockets <strong>+30 coins</strong>! The answer is <code>max(dp)</code>.
            </div>
          ) : (
            <div>
              💀 <strong>Habit Trap:</strong> Forcing frog to step n incurs the -50 penalty, ending with <strong>-5 coins</strong>! Habit <code>dp[n]</code> fails!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// SUB-SIMULATOR: CHAPTER 3 BOTTOM-UP TABULATION VISUALIZER
// ===========================================================================
function BottomUpTabulationVisualizer() {
  const [cur, setCur] = useState(2);
  const dp = [1, 1, 2, 3, 5, 8, 13];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg">
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

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCur(p => Math.max(2, p - 1))}
            disabled={cur <= 2}
            className="p-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-xs text-purple-400 px-1">dp[{cur}]</span>
          <button
            onClick={() => setCur(p => Math.min(6, p + 1))}
            disabled={cur >= 6}
            className="p-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
        <div className="text-slate-400">Tabulation Row:</div>
        <div className="grid grid-cols-7 gap-2">
          {dp.map((val, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center ${
                idx === cur
                  ? 'bg-purple-600 border-purple-400 text-white font-bold ring-2 ring-purple-400/50 scale-105'
                  : idx < cur
                  ? 'bg-slate-900 border-slate-700 text-slate-300'
                  : 'bg-slate-950/40 border-slate-900 text-slate-600'
              }`}
            >
              <div className="text-[9px] text-slate-500">[{idx}]</div>
              <div className="text-sm font-bold mt-0.5">{idx <= cur ? val : '?'}</div>
            </div>
          ))}
        </div>
        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-purple-300 text-[11px]">
          Invariant: dp[{cur}] = dp[{cur-1}] ({dp[cur-1]}) + dp[{cur-2}] ({dp[cur-2]}) = {dp[cur]}
        </div>
      </div>
    </div>
  );
}
