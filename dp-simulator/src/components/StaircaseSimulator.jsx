import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import FlowVisualizer from './FlowVisualizer';
import PhysicalPathsProof from './PhysicalPathsProof';
import { CodePlaybackPanel } from './TraceCodeViewer';
import Playback from './Playback';
import { staircaseData, staircaseCode } from '../data/staircase';
import { generateAllPaths } from '../data/problems';
import { usePlayback } from '../hooks/usePlayback';
import { useExpandedPanel } from '../hooks/useExpandedPanel';

export default function StaircaseSimulator({ input, problem, codeTarget }) {
  const expansion = useExpandedPanel();
  const isGold = problem.id === 'gold-stairs';
  const data = useMemo(() => staircaseData(input, isGold), [input, isGold]);
  const playback = usePlayback(data.cells.length + 1);
  const done = playback.step === data.cells.length;
  const current = Math.min(playback.step, data.n);
  const cell = data.cells[current];
  const paths = useMemo(() => !isGold && current <= 7 ? generateAllPaths(current, input.hops) : [], [isGold, current, input.hops]);
  const isSSR = typeof window === 'undefined';
  const externalCode = !isSSR && codeTarget !== undefined && !expansion.expanded;

  const codePlayback = <CodePlaybackPanel lines={staircaseCode(isGold)} activeLine={data.n < 0 ? 2 : done ? 6 : current === 0 ? 3 : 5}>
    <p>{done ? `Return ${data.answer}${isGold && data.n >= 0 ? ` · best stopping step ${data.terminationIndex}` : ''}` : `i = ${current} · dp[${current}] = ${cell.val}`}</p>
    {!done && current > 0 && <p>{isGold ? `Reward ${input.nums[current]} + best previous total` : cell.doors.map(d => `dp[${d.from}] (${d.prevVal})`).join(' + ') || 'No legal incoming hops'} = {cell.val}</p>}
    <small>Each animation step and highlighted line share the same playback controls.</small>
  </CodePlaybackPanel>;

  const headerControls = <>
    <div className="simulation-topbar">
      <div className="section-heading">
        <h2>{isGold ? 'The Gold Collector' : input.hops.join(',') === '1,2,3' ? 'The Tribonacci Frog' : 'Frog on the staircase'}</h2>
        {expansion.expanded && <button data-close-expanded onClick={expansion.close}>Exit expanded view · Esc</button>}
      </div>
    </div>
    <p>{isGold ? 'Follow the best incoming hop, then choose the best stopping step.' : `Allowed hops: ${input.hops.join(', ') || 'none'}. Each incoming door contributes its completed paths.`}</p>
  </>;

  const simulationColumns = <div className={`walkthrough-columns ${externalCode ? 'simulation-only' : ''}`}>
    <div className="simulation-column"><FlowVisualizer playbackControls={<Playback compact playback={playback} length={data.cells.length + 1} />} expanded={expansion.expanded} onExpand={expansion.toggle} problem={data.problem} n={data.n} currentStep={current} dpResults={data.cells} terminationIndex={isGold && !done ? -1 : data.terminationIndex} onSelectStep={playback.seek} />
      <div className="staircase-table" aria-label="Staircase DP table">{data.cells.map((c, i) => <button key={i} onClick={() => playback.seek(i)} aria-current={i === current ? 'step' : undefined}>Step {i}<strong>{i <= current ? c.val : '?'}</strong></button>)}</div>
    </div>
    {externalCode ? (codeTarget && createPortal(codePlayback, codeTarget)) : codePlayback}
  </div>;

  return <section {...expansion.panelProps} className={`staircase-simulator ${expansion.expanded ? 'expanded-simulation' : ''}`} aria-label="Staircase simulation and code playback">
    {externalCode ? (
      <>
        {simulationColumns}
        {headerControls}
      </>
    ) : (
      <>
        {headerControls}
        {simulationColumns}
      </>
    )}
    {data.n >= 0 && (isGold || current <= 7) && <PhysicalPathsProof currentStep={current} paths={paths} isGold={isGold} goldVal={input.nums?.[current]} activeCell={cell} />}
    {!isGold && current > 7 && <p>Path enumeration is limited to step 7; the staircase and counts continue for larger inputs.</p>}
  </section>;
}
