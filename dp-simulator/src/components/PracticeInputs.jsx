import React, { useState } from 'react';
import { validateInput } from '../data/practice';

export default function PracticeInputs({ problem, input, onApply }) {
  const [draft, setDraft] = useState(JSON.stringify(input, null, 2));
  const [error, setError] = useState('');
  return <details className="panel input-panel">
    <summary>Inputs & edge cases <code>{JSON.stringify(input)}</code></summary>
    <p>{problem.prompt}</p>
    <div className="preset-row">{problem.examples.map((example, i) => <button key={i} onClick={() => { setDraft(JSON.stringify(example, null, 2)); setError(''); onApply(example); }}>Example {i + 1}: {JSON.stringify(example)}</button>)}</div>
    <form onSubmit={e => { e.preventDefault(); try { const value = validateInput(problem, JSON.parse(draft)); setError(''); onApply(value); } catch (err) { setError(err.message); } }}>
      <label>Custom inputs (JSON)<textarea aria-label="Custom simulation inputs" value={draft} onChange={e => setDraft(e.target.value)} rows="5" spellCheck="false" /></label>
      <button type="submit">Apply inputs</button>{error && <p role="alert" className="error-text">{error}</p>}
    </form>
  </details>;
}
