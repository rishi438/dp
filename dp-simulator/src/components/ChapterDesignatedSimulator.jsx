import React, { lazy, Suspense, useState } from 'react';
import { validateInput } from '../data/practice';
import { simulationPractices } from '../data/staircase';
import { useStoredState } from '../hooks/useStoredState';
import PracticeInputs from './PracticeInputs';
import TraceExplorer from './TraceExplorer';
import { usePracticeSelection } from '../hooks/usePracticeSelection';

const StaircaseVisual = lazy(() => import('./StaircaseSimulator'));

const visualizers = {
  'stairs-0': StaircaseVisual,
  'gold-stairs': StaircaseVisual,
  'stairs-3': lazy(() => import('./simulators/TabulationSimulator')),
  'stairs-4': lazy(() => import('./simulators/SpaceOptimizedSimulator')),
  'coin-min': lazy(() => import('./simulators/CoinChangeSimulator')),
  kadane: lazy(() => import('./simulators/KadaneSimulator')),
  lcs: lazy(() => import('./simulators/LCSSimulator')),
  'grid-min': lazy(() => import('./simulators/GridMovementSimulator')),
  knapsack: lazy(() => import('./simulators/KnapsackSimulator')),
  lis: lazy(() => import('./simulators/LISSimulator')),
  'stock-cooldown': lazy(() => import('./simulators/StateMachineSimulator')),
  'matrix-chain': lazy(() => import('./simulators/IntervalSplitSimulator')),
  lps: lazy(() => import('./simulators/PalindromicSimulator')),
  'tree-rob': lazy(() => import('./simulators/TreeDPSimulator')),
  tsp: lazy(() => import('./simulators/BitmaskSimulator')),
  knight: lazy(() => import('./simulators/ProbabilityDPSimulator')),
  'jump-k': lazy(() => import('./simulators/OptimizedDPSimulator')),
};

function Simulator({ problem, compare }) {
  const [savedInput, setInput] = useStoredState(`inputs.${problem.id}`, problem.examples[0]);
  let input;
  try { input = validateInput(problem, savedInput); } catch { input = problem.examples[0]; }
  const [mode, setMode] = useState('trace');
  const [treeSize, setTreeSize] = useState('small');
  const [inputVersion, setInputVersion] = useState(0);
  const applyInput = value => { setInput(value); setTreeSize('input'); setInputVersion(version => version + 1); };
  const memoized = problem.chapter !== 1;
  let Visual = visualizers[problem.id];
  const isStaircase = problem.id.startsWith('stairs-');
  // Empty/boundary inputs use the trace, which explicitly explains their return value.
  if ((input.nums && !input.nums.length) || (input.prices && !input.prices.length) || (input.s !== undefined && !input.s.length) || (input.nodes && (!input.nodes.length || input.nodes[0] < 0)) || (input.dist?.length === 1) || (input.hops && problem.chapter !== 0 && JSON.stringify(input.hops) !== '[1,2]')) Visual = null;
  const identity = `${problem.id}:${JSON.stringify(input)}`;
  return <div className="space-y-4">
    <PracticeInputs key={identity} problem={problem} input={input} onApply={applyInput} />
    {isStaircase && <div className="workspace-toolbar"><div className="segmented-control">
      <button aria-pressed={JSON.stringify(input.hops) === '[1,2]'} onClick={() => applyInput({ ...input, hops: [1, 2] })}>Classic frog · 1 or 2 hops</button>
      <button aria-pressed={JSON.stringify(input.hops) === '[1,2,3]'} onClick={() => applyInput({ ...input, hops: [1, 2, 3] })}>Tribonacci frog · 1, 2 or 3 hops</button>
    </div><label>Stairs <input aria-label="Number of stairs" type="number" min="0" max="20" value={input.n} onChange={e => { const n = e.target.valueAsNumber; if (Number.isInteger(n) && n >= 0 && n <= 20) applyInput({ ...input, n }); }} /></label></div>}
    <div className="section-heading"><div><h2>{problem.title}</h2><p>{problem.state}</p></div>
      {!compare && (Visual || (isStaircase && problem.chapter >= 3)) && <div className="segmented-control">{Visual && <button aria-pressed={mode === 'visual'} onClick={() => setMode('visual')}>{isStaircase && problem.chapter === 0 ? 'Frog staircase' : 'Visual walkthrough'}</button>}{isStaircase && problem.chapter >= 3 && <button aria-pressed={mode === 'stairs'} onClick={() => setMode('stairs')}>Frog staircase · full table</button>}<button aria-pressed={mode === 'trace'} onClick={() => setMode('trace')}>Code, trace & predict</button></div>}
    </div>
    {compare && <p>Switch With cache / Without cache to run the same input. A cache hit reuses a saved answer; without cache, repeated calls calculate it again.</p>}
    {!compare && isStaircase && mode === 'stairs' ? <Suspense fallback={<p>Loading staircase…</p>}><StaircaseVisual key={identity} input={input} problem={problem} /></Suspense> : !compare && Visual && mode === 'visual' ? <Suspense fallback={<p>Loading visualization…</p>}><Visual key={identity} input={input} problem={problem} /></Suspense> : <TraceExplorer key={`${identity}:${memoized}:${treeSize}:${inputVersion}`} problem={problem} input={input} memoized={memoized} compare={compare} initialSize={treeSize} />}
  </div>;
}

export default function ChapterDesignatedSimulator({ chapterNum, compare = false }) {
  const choices = simulationPractices(chapterNum);
  const [problem, setSelected] = usePracticeSelection(chapterNum, choices);
  return <div className="space-y-4"><div className="workspace-toolbar"><label>Chapter {chapterNum} · Problem <select aria-label="Chapter simulation problem" value={problem.id} onChange={e => setSelected(e.target.value)}>{choices.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label><span>{compare ? 'Recursion Tree vs Memo' : 'Interactive simulation'}</span></div>
    <Simulator key={`${problem.id}.${compare}`} problem={problem} compare={compare} />
  </div>;
}
