import React, { Children, useEffect, useId, useRef, useState } from 'react';
import { useStoredState } from '../hooks/useStoredState';

const MIN_SIMULATOR = 440, MIN_EDITOR = 480, DIVIDER = 16, DEFAULT_SPLIT = 0.55;

export default function ResizableWorkspace({ children }) {
  const [left, right] = Children.toArray(children);
  const container = useRef(null), drag = useRef(null);
  const leftId = useId();
  const [width, setWidth] = useState(0);
  const [saved, setSaved] = useStoredState('workspace.split', DEFAULT_SPLIT);
  const [draft, setDraft] = useState(null);
  const preferred = typeof saved === 'number' && Number.isFinite(saved) && saved > 0 && saved < 1 ? saved : DEFAULT_SPLIT;
  const available = Math.max(1, width - DIVIDER);
  const stacked = available < MIN_SIMULATOR + MIN_EDITOR;
  const clamp = pixels => Math.max(MIN_SIMULATOR, Math.min(available - MIN_EDITOR, pixels));
  const leftWidth = clamp(available * (draft ?? preferred));

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  const finishDrag = event => {
    if (!drag.current || drag.current.id !== event.pointerId) return;
    setSaved(drag.current.ratio); drag.current = null; setDraft(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const cancelDrag = () => { drag.current = null; setDraft(null); };
  const keyResize = event => {
    const step = event.shiftKey ? 64 : 24;
    const next = { ArrowLeft: leftWidth - step, ArrowRight: leftWidth + step, Home: MIN_SIMULATOR, End: available - MIN_EDITOR }[event.key];
    if (next === undefined) return;
    event.preventDefault(); setSaved(clamp(next) / available);
  };

  return <div ref={container} className={`challenge-layout resizable-workspace ${stacked ? 'workspace-stacked' : ''}`} style={stacked ? undefined : { gridTemplateColumns: `${leftWidth}px ${DIVIDER}px minmax(0, 1fr)` }}>
    <div id={leftId} className="workspace-pane">{left}</div>
    {!stacked && <div className={`workspace-divider ${draft !== null ? 'is-dragging' : ''}`} role="separator" tabIndex={0} aria-label="Resize simulator and code editor" aria-orientation="vertical" aria-controls={leftId}
      aria-valuemin={Math.round(MIN_SIMULATOR / available * 100)} aria-valuemax={Math.round((available - MIN_EDITOR) / available * 100)} aria-valuenow={Math.round(leftWidth / available * 100)}
      aria-valuetext={`Simulator ${Math.round(leftWidth)} pixels; code editor ${Math.round(available - leftWidth)} pixels`}
      title="Drag to resize · Arrow keys adjust · Double-click to reset"
      onKeyDown={keyResize} onDoubleClick={() => setSaved(DEFAULT_SPLIT)}
      onPointerDown={event => {
        if (event.button !== 0) return;
        event.preventDefault(); event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { id: event.pointerId, ratio: leftWidth / available }; setDraft(leftWidth / available);
      }}
      onPointerMove={event => {
        if (!drag.current || drag.current.id !== event.pointerId) return;
        const ratio = clamp(event.clientX - container.current.getBoundingClientRect().left - DIVIDER / 2) / available;
        drag.current.ratio = ratio; setDraft(ratio);
      }} onPointerUp={finishDrag} onPointerCancel={cancelDrag} onLostPointerCapture={cancelDrag} />}
    <div className="workspace-pane">{right}</div>
  </div>;
}
