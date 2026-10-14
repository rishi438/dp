import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ReactFlow, Controls, ControlButton } from '@xyflow/react';
import { Maximize2, Minimize2, Sparkles, ChevronLeft, ChevronRight, SlidersHorizontal, GitBranch, Network, ListFilter, Footprints, GitGraph, Eye } from 'lucide-react';
import { runTrace, displayValue } from '../data/practice';
import { callTreeNodes, layoutCallTree } from '../data/callTree';
import { codeStepTrace } from '../data/traceCode';
import { treeExamples } from '../data/treeExamples';
import { usePlayback } from '../hooks/usePlayback';
import { useForceLayout } from '../hooks/useForceLayout';
import { useExpandedPanel } from '../hooks/useExpandedPanel';
import TraceCodeViewer from './TraceCodeViewer';
import FlowVisualizer from './FlowVisualizer';
import Playback from './Playback';
import MovableOverlay from './MovableOverlay';


function CallGraph({ trace, event, revealed, eventIndex, smallTree, expanded, onExpand, playbackControls, cacheControl }) {
  const [usePhysics, setUsePhysics] = useState(false);
  const graphRef = useRef(null);
  const [flow, setFlow] = useState(null);
  useEffect(() => {
    if (!flow || !graphRef.current) return;
    let frame;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => flow.fitView({ padding: 0.15, minZoom: 0.05, maxZoom: smallTree ? 1.15 : 1 }));
    });
    observer.observe(graphRef.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [flow, smallTree]);

  const layout = useMemo(() => layoutCallTree(callTreeNodes(trace)), [trace]);

  // Edges for d3-force simulation
  const ids = useMemo(() => new Set(layout.map(n => n.id)), [layout]);
  const treeEdges = useMemo(() => layout.filter(n => n.parent !== null && ids.has(n.parent)).map(n => ({
    id: `${n.parent}-${n.id}`,
    source: String(n.parent),
    target: String(n.id)
  })), [layout, ids]);

  // Run d3-force physics simulation when enabled
  const forcePositions = useForceLayout({
    nodes: layout,
    edges: treeEdges,
    enabled: usePhysics,
    strength: smallTree ? -320 : -450,
    distance: smallTree ? 130 : 110
  });

  const scope = `${layout.map(node => node.id).join(',')}:${expanded}:${usePhysics}`;
  const fitOptions = { padding: 0.15, minZoom: 0.05, maxZoom: smallTree ? 1.15 : 1 };
  const [moved, setMoved] = useState({ trace, scope, positions: new Map() });

  const onNodesChange = changes => {
    const positions = changes.filter(change => change.type === 'position' && change.position);
    if (!positions.length) return;
    setMoved(previous => {
      const next = new Map(previous.trace === trace && previous.scope === scope ? previous.positions : []);
      positions.forEach(change => next.set(change.id, change.position));
      return { trace, scope, positions: next };
    });
  };

  const graph = useMemo(() => {
    const seen = new Set(trace.events.slice(0, eventIndex + 1).map(e => e.id ?? 'solve'));
    const values = new Map(trace.events.slice(0, eventIndex + (revealed ? 1 : 0)).filter(e => ['return', 'cache', 'answer'].includes(e.kind)).map(e => [e.id ?? 'solve', e.value]));
    const firstCalls = new Map();
    trace.nodes.forEach(node => { if (!firstCalls.has(node.key)) firstCalls.set(node.key, node.id); });
    return {
      nodes: layout.map(n => {
        const visited = seen.has(n.id);
        const duplicate = n.id !== 'solve' && visited && firstCalls.get(n.key) !== n.id && !n.cached;
        const cached = n.cached && values.has(n.id);
        const current = n.id === (event.id ?? 'solve');
        const status = !visited ? 'waiting' : cached ? 'cache hit · reuse' : duplicate ? 'repeated call' : values.has(n.id) ? 'returned' : current ? 'current call' : 'recursing';
        const simPos = usePhysics && forcePositions ? forcePositions.get(String(n.id)) : null;
        return {
          id: String(n.id),
          position: simPos || (moved.trace === trace && moved.scope === scope && moved.positions.get(String(n.id))) || n.position,
          data: { label: <><strong>{n.key}{values.has(n.id) ? ` → ${displayValue(values.get(n.id))}` : ''}</strong><small>{status}</small></> },
          className: `trace-node ${!visited ? 'pending-node' : ''} ${values.has(n.id) ? 'returned-node' : ''} ${cached ? 'cache-node' : ''} ${duplicate ? 'duplicate-node' : ''} ${current ? 'current-node' : ''}`,
          sourcePosition: 'bottom', targetPosition: 'top',
        };
      }),
      edges: layout.filter(n => n.parent !== null && ids.has(n.parent)).map(n => ({
        id: `${n.parent}-${n.id}`, source: String(n.parent), target: String(n.id),
        className: !seen.has(n.id) ? 'pending-edge' : n.cached && values.has(n.id) ? 'cache-edge' : '',
      })),
    };
  }, [trace, layout, scope, moved, event, eventIndex, revealed, ids, usePhysics, forcePositions]);

  return <div className="call-tree-view">
    {event.id !== undefined && !ids.has(event.id) && <p role="status">Current call {event.key} is beyond the drawing limit. Follow its code and variables alongside the tree.</p>}
    <div ref={graphRef} className={`trace-graph ${playbackControls ? 'has-playback-dock' : ''}`} aria-label="Recursive call tree">
      {cacheControl}
      <div className="tree-legend" aria-label="Call colors"><span className="legend-current">Current</span><span className="legend-cache">Cached / returned</span><span className="legend-repeat">Repeated work</span><span className="legend-waiting">Waiting</span></div>
      <ReactFlow key={scope} onInit={setFlow} nodes={graph.nodes} edges={graph.edges} onNodesChange={onNodesChange}
      fitView fitViewOptions={fitOptions} minZoom={0.05}
      nodesDraggable nodesConnectable={false} elementsSelectable={false}
      panOnDrag={true} panOnScroll={false} panActivationKeyCode={null}
      zoomOnScroll={false} zoomOnPinch={false} zoomOnDoubleClick={false} zoomActivationKeyCode={null}
      autoPanOnNodeDrag={false} autoPanOnNodeFocus={false} proOptions={{ hideAttribution: true }}>
      <Controls showInteractive={false} fitViewOptions={fitOptions}>
        <ControlButton
          onClick={() => setUsePhysics(p => !p)}
          title={usePhysics ? "Switch to Tree Layout" : "Simulate Force Layout (d3-force)"}
          aria-label={usePhysics ? "Tree layout" : "Physics simulation"}
        >
          <Sparkles size={14} className={usePhysics ? "!text-amber-400" : ""} />
        </ControlButton>
        <ControlButton
          onClick={onExpand}
          title={expanded ? 'Exit expanded view' : 'Expand simulation within this page'}
          aria-label={expanded ? 'Exit expanded view' : 'Expand simulation'}
        >
          {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </ControlButton>
      </Controls>
    </ReactFlow>
    {playbackControls && <MovableOverlay className="playback-dock" label="playback controls">{playbackControls}</MovableOverlay>}
    </div>
  </div>;
}

function CacheSwitch({ enabled, onToggle, position, setPosition }) {
  const buttonRef = useRef(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const constrain = (point, button) => ({
    x: Math.max(8, Math.min(point.x, button.parentElement.clientWidth - button.offsetWidth - 8)),
    y: Math.max(8, Math.min(point.y, button.parentElement.clientHeight - button.offsetHeight - 8)),
  });
  useEffect(() => {
    const button = buttonRef.current;
    const observer = new ResizeObserver(() => setPosition(previous => {
      const next = constrain(previous, button);
      return next.x === previous.x && next.y === previous.y ? previous : next;
    }));
    observer.observe(button.parentElement);
    return () => observer.disconnect();
  }, [setPosition]);
  return <button ref={buttonRef} type="button" role="switch" aria-checked={enabled} aria-label="Use cache"
    className="cache-mode-switch" style={{ left: position.x, top: position.y }}
    title="Click to toggle cache. Drag to move, or use arrow keys when focused."
    onPointerDown={event => {
      if (event.button !== 0) return;
      suppressClick.current = false;
      drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, position };
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerMove={event => {
      const start = drag.current;
      if (!start || start.pointerId !== event.pointerId) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (!suppressClick.current && Math.hypot(dx, dy) < 5) return;
      suppressClick.current = true;
      setPosition(constrain({ x: start.position.x + dx, y: start.position.y + dy }, event.currentTarget));
    }}
    onPointerUp={event => {
      drag.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }}
    onPointerCancel={() => { drag.current = null; suppressClick.current = true; }}
    onLostPointerCapture={() => { drag.current = null; }}
    onClick={event => {
      if (event.detail !== 0 && suppressClick.current) { suppressClick.current = false; return; }
      onToggle();
    }}
    onKeyDown={event => {
      const offset = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[event.key];
      if (!offset) return;
      event.preventDefault();
      setPosition(constrain({ x: position.x + offset[0], y: position.y + offset[1] }, event.currentTarget));
    }}>
    <span className="cache-switch-track" aria-hidden="true"><span /></span>
    <span>{enabled ? 'With cache' : 'Without cache'}</span>
  </button>;
}

export default function TraceExplorer({ problem, input, initialSize = 'input', codeTarget, codeVisible = true, active = true }) {
  const [size, setSize] = useState(initialSize);
  const [cacheEnabled, setCacheEnabled] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [cachePosition, setCachePosition] = useState({ x: 12, y: 12 });
  const examples = useMemo(() => treeExamples(problem), [problem]);
  const selectedInput = size === 'input' ? input : examples[size];
  const toolbar = <div className="workspace-toolbar">
    <div className="segmented-control" aria-label="Simulation example size">
      <button aria-pressed={size === 'small'} onClick={() => setSize('small')}><GitBranch size={16} /> Small tree</button>
      <button aria-pressed={size === 'large'} onClick={() => setSize('large')}><Network size={16} /> Large tree</button>
      <button aria-pressed={size === 'input'} onClick={() => setSize('input')}><ListFilter size={16} /> Current inputs</button>
    </div>
    <span>{size === 'small' ? 'Small complete example' : size === 'large' ? 'Larger complete example' : 'Your selected example or custom input'}: <code>{JSON.stringify(selectedInput)}</code></span>
  </div>;

  return <div className="space-y-4">
    <TracePlayback key={`${problem.id}:${size}:${cacheEnabled}:${JSON.stringify(selectedInput)}`} problem={problem} input={selectedInput} memoized={cacheEnabled} smallTree={size === 'small'} codeTarget={codeTarget} codeVisible={codeVisible} active={active} inlineToolbar={toolbar} toolsOpen={toolsOpen} onToggleTools={() => setToolsOpen(value => !value)} cacheControl={<CacheSwitch enabled={cacheEnabled} onToggle={() => setCacheEnabled(value => !value)} position={cachePosition} setPosition={setCachePosition} />} />
  </div>;
}

function TracePlayback({ problem, input, memoized, smallTree, codeTarget, codeVisible, active, inlineToolbar, cacheControl, toolsOpen, onToggleTools }) {
  const expansion = useExpandedPanel();
  const trace = useMemo(() => codeStepTrace(problem, runTrace(problem, input, { memoized }), memoized), [problem, input, memoized]);
  const alternate = useMemo(() => runTrace(problem, input, { memoized: !memoized }), [problem, input, memoized]);
  const playback = usePlayback(trace.events.length);
  const { playing, step, seek } = playback;
  useEffect(() => { if (!active && playing) seek(step); }, [active, playing, step, seek]);
  // Expansion keeps its code inside the dialog and its keyboard focus boundary.
  const isSSR = typeof window === 'undefined';
  const externalCode = !isSSR && codeTarget !== undefined && !expansion.expanded;
  const [predict, setPredict] = useState(false);
  const [answers, setAnswers] = useState({});
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const isStaircase = problem.id.startsWith('stairs-');
  const [view, setView] = useState('tree');
  const event = trace.events[playback.step];
  const needsPrediction = predict && [memoized ? 'store' : 'return', 'answer'].includes(event.kind) && answers[playback.step] === undefined;
  const completed = trace.events.slice(0, playback.step + (needsPrediction ? 0 : 1)).filter(e => e.kind === (memoized ? 'store' : 'return') || e.kind === 'cache');
  const table = new Map(completed.map(e => [e.key, e.value]));
  const stairCells = isStaircase ? Array.from({ length: input.n + 1 }, (_, i) => ({
    val: table.get(JSON.stringify([i])),
    doors: input.hops.filter(h => h <= i).map(hop => ({ from: i - hop, hop, contribution: table.get(JSON.stringify([i - hop])) })),
  })) : [];
  const computedStates = new Set(stairCells.flatMap((cell, i) => cell.val === undefined ? [] : [i]));
  const check = () => {
    const expected = displayValue(event.value);
    const correct = guess.trim().toLowerCase() === expected.toLowerCase() || (guess.trim() !== '' && typeof event.value === 'number' && Math.abs(Number(guess) - event.value) < 1e-8);
    setFeedback(correct ? 'Correct. Follow the dependencies to see why.' : `Try again. Use the completed states below and this recurrence: ${problem.recurrence}`);
    if (correct) { setAnswers(a => ({ ...a, [playback.step]: true })); setGuess(''); }
  };
  const controls = predict ? <div className="playback prediction-playback" aria-label="Prediction playback">
    <button onClick={() => { playback.seek(playback.step - 1); setFeedback(''); }} disabled={playback.step === 0} aria-label="Previous step"><ChevronLeft size={18} /></button>
    <span>Step {playback.step + 1} / {trace.events.length}</span>
    <button disabled={needsPrediction || playback.step === trace.events.length - 1} onClick={() => { playback.seek(playback.step + 1); setFeedback(''); }} aria-label="Next step"><ChevronRight size={18} /></button>
  </div> : <Playback compact playback={playback} length={trace.events.length} />;
  const status = <div className="event-banner" aria-live="polite"><strong>{event.message} {event.kind !== 'answer' && event.key}</strong>{event.value !== undefined && <span> → {needsPrediction ? '?' : displayValue(event.value)}</span>}</div>;

  const simulationColumns = () => <div className={`walkthrough-columns ${externalCode ? 'simulation-only' : ''}`}><div className="simulation-column">
    {isStaircase && view === 'stairs' ? <FlowVisualizer cacheControl={<>{cacheControl}{tools}</>} playbackControls={controls} expanded={expansion.expanded} onExpand={expansion.toggle} problem={{ id: 'stairs', hops: input.hops }} n={input.n} currentStep={event.state[0] ?? input.n} dpResults={stairCells} computedStates={computedStates} terminationIndex={input.n} onSelectStep={i => { if (predict) return; const index = trace.events.findIndex(e => e.state[0] === i); if (index >= 0) playback.seek(index); }} /> : <CallGraph cacheControl={<>{cacheControl}{tools}</>} playbackControls={controls} trace={trace} event={event} revealed={!needsPrediction} eventIndex={playback.step} smallTree={smallTree} expanded={expansion.expanded} onExpand={expansion.toggle} />}
    </div>{externalCode
      ? codeTarget && createPortal(<TraceCodeViewer status={status} problem={problem} memoized={memoized} event={event} hiddenValue={needsPrediction} visible={codeVisible} />, codeTarget)
      : <TraceCodeViewer status={status} problem={problem} memoized={memoized} event={event} hiddenValue={needsPrediction} />}
  </div>;

  const tools = <MovableOverlay className="simulator-tools" label="simulator menu"><details open={toolsOpen}>
    <summary aria-label="Simulator tools" title="Simulator tools" onClick={event => { event.preventDefault(); onToggleTools(); }}><SlidersHorizontal size={19} /></summary>
    <div className="simulator-tools-menu">
    <div className="section-heading"><h2>{memoized ? 'Memoized dependency trace' : 'Plain recursion trace'}</h2>
      <label className="check-label"><Eye size={16} /><input type="checkbox" role="switch" checked={predict} onChange={e => { setPredict(e.target.checked); playback.seek(playback.step); }} /> Predict return values</label>
    </div>
    <fieldset><legend>Example size</legend>{inlineToolbar}</fieldset>
    {isStaircase && <fieldset><legend>View</legend><div className="segmented-control trace-view-switch"><button aria-pressed={view === 'stairs'} onClick={() => setView('stairs')}><Footprints size={16} /> Frog staircase</button><button aria-pressed={view === 'tree'} onClick={() => setView('tree')}><GitGraph size={16} /> Call tree</button></div></fieldset>}
    <details className="tree-info" open><summary>Tree details</summary><p>{smallTree ? 'Complete small example: all its branches stay visible as the code runs.' : 'Follow the call tree and total work for the selected input.'} {trace.nodes.length} calls.{trace.nodes.length > 119 ? ' Drawing solve and the first 119 calls; playback includes every recorded call.' : ''} Drag tiles or use zoom to inspect.</p></details>
    <details className="trace-inspector" open><summary>Recurrence & work counts</summary><p>{problem.state}</p>
    <p className="recurrence">{problem.recurrence}</p>
    <div className="comparison-stats" aria-label="Cache comparison for the same input">
      <span>Without cache: {(memoized ? alternate : trace).calls}{(memoized ? alternate : trace).truncated ? '+' : ''} calls</span>
      <span>With cache: {(memoized ? trace : alternate).calls} calls</span>
      <span>Cache hits in selected run: {trace.hits}</span>
      <span>Code steps: {trace.events.length}</span>
    </div>
    </details>
    </div>
  </details></MovableOverlay>;

  const headerControls = <>
    {expansion.expanded && <button data-close-expanded onClick={expansion.close}>Exit expanded view · Esc</button>}
    {trace.truncated && <p role="status">Stopped after 2,500 calls. Reduce the input to see the complete plain-recursion tree.</p>}
    {needsPrediction && <form className="prediction" onSubmit={e => { e.preventDefault(); check(); }}>
      <label>Your predicted value <input aria-label="Predicted state value" value={guess} onChange={e => setGuess(e.target.value)} autoComplete="off" /></label>
      <button type="submit">Check prediction</button><button type="button" onClick={() => { setAnswers(a => ({ ...a, [playback.step]: false })); setFeedback(`Returned ${displayValue(event.value)}. ${problem.recurrence}`); }}>Reveal explanation</button>
    </form>}
    {feedback && <p role="status">{feedback}</p>}
  </>;

  return <section {...expansion.panelProps} className={`trace-explorer ${expansion.expanded ? 'expanded-simulation' : ''}`} aria-label="Simulation and code playback">
    {externalCode ? (
      <>
        {simulationColumns()}
        {headerControls}
      </>
    ) : (
      <>
        {headerControls}
        {externalCode && !codeVisible && status}
        {simulationColumns()}
      </>
    )}
    <div className="trace-details">
      <div className="trace-input-summary" aria-label="Current input"><strong>Input</strong>{Object.entries(input).map(([name, value]) => <code key={name}>{name} = {JSON.stringify(value)}</code>)}</div>
      <details className="memo-details" open>
        <summary><strong>{memoized ? 'Memo entries' : 'Completed states'}</strong><span>{table.size} {memoized ? 'saved' : 'completed'}</span></summary>
        {table.size === 0 ? <p className="memo-empty">{memoized ? 'Nothing saved yet. Step forward to see results added to the memo.' : 'No calls have returned yet. Step forward to see their results.'}</p> : <div className="state-table">
          <table><caption>{memoized ? 'Saved results available for reuse' : 'Results from completed calls'}</caption><thead><tr><th scope="col">State</th><th scope="col">Value</th></tr></thead><tbody>{[...table].map(([key, value]) => <tr key={key}><td><code>{key}</code></td><td>{displayValue(value)}</td></tr>)}</tbody></table>
        </div>}
      </details>
    </div>
  </section>;
}
