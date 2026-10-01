import React, { useMemo, useRef, useEffect } from 'react';
import { traceCode } from '../data/traceCode';
import { displayValue } from '../data/practice';

export function CodePlaybackPanel({ lines, activeLine, children, status, visible = true }) {
  const codeRef = useRef(null);
  useEffect(() => {
    const panel = codeRef.current;
    const active = panel?.querySelector('[aria-current="step"]');
    if (!active || !visible) return;
    const top = active.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop;
    if (top < panel.scrollTop || top + active.offsetHeight > panel.scrollTop + panel.clientHeight) {
      panel.scrollTop = Math.max(0, top - panel.clientHeight / 2);
    }
  }, [activeLine, visible]);
  return <section className="code-playback" aria-label="Synchronized reference code">
    <header><strong>Code flow</strong><span>Python · reference algorithm</span></header>
    {status}
    <div ref={codeRef} className="playback-code" tabIndex={0} aria-label="Reference Python code">
      {lines.map((line, i) => <div key={i} className={`playback-code-line ${i + 1 === activeLine ? 'active-code-line' : ''}`} aria-current={i + 1 === activeLine ? 'step' : undefined}>
        <span className="line-number">{i + 1}</span><code>{line || ' '}</code>
      </div>)}
    </div>
    <div className="live-variables" aria-live="polite">{children}</div>
  </section>;
}

export default function TraceCodeViewer({ problem, memoized, event, hiddenValue, status, visible = true }) {
  const code = useMemo(() => traceCode(problem, memoized), [problem, memoized]);
  return <CodePlaybackPanel status={status} lines={code.lines} activeLine={event.line ?? code.markers[event.kind]} visible={visible}>
    <div className="variable-chips">{event.state.map((value, i) => <span key={i}><b>{code.params[i]}</b> = {displayValue(value)}</span>)}
      {memoized && event.key && !['call', 'answer'].includes(event.kind) && <span><b>key</b> = ({event.state.join(', ')}{event.state.length === 1 ? ',' : ''})</span>}
      {event.returnedValue !== undefined && <span><b>child {event.returnedKey} returned</b> = {hiddenValue ? '?' : displayValue(event.returnedValue)}</span>}
      {event.value !== undefined && <span><b>{event.kind === 'answer' ? 'answer' : 'value'}</b> = {hiddenValue ? '?' : displayValue(event.value)}</span>}</div>
    {!status && <p>{event.message || (event.kind === 'enter' ? 'Evaluate the base case or recurse into dependencies.' : event.kind === 'cache' ? 'Reuse this state without running its recurrence again.' : event.kind === 'answer' ? 'Return the final result to the caller.' : 'This state is complete; return its value to the parent.')}</p>}
    <small>Next follows code execution, including memo checks, writes, and returning to the caller. Your editable solution runs separately with Run tests.</small>
  </CodePlaybackPanel>;
}
