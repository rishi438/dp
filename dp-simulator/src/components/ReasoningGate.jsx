import React, { useEffect, useRef, useState } from 'react';
import { EMPTY_PLAN, REASONING_FIELDS, answerErrors, isPlanApproved, isReviewComplete, reasoningSnapshot } from '../data/reasoning';
import { readStored, useStoredState } from '../hooks/useStoredState';

const statusLabels = { correct: 'Accepted', needs_work: 'Revise this', unclear: 'Clarify this' };

// Mount with key={problem.id}: drafts and assessments belong to one exercise.
export default function ReasoningGate({ problem, children }) {
  const [plan, setPlan] = useStoredState(`plan.${problem.id}`, EMPTY_PLAN);
  const answers = plan.answers && typeof plan.answers === 'object' ? plan.answers : {};
  const approved = isPlanApproved(problem.id, plan);
  const skipped = plan.skipped === true;
  const review = isReviewComplete(plan.review) && plan.review.snapshot === reasoningSnapshot(problem.id, answers) ? plan.review : null;
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [errors, setErrors] = useState({});
  const request = useRef(null);
  const earlierNotes = readStored(`reasoning.${problem.chapter}`, {})[problem.id];
  useEffect(() => () => { request.current?.abort(); request.current = null; }, []);
  const cancel = () => { request.current?.abort(); request.current = null; setBusy(false); };
  const skip = () => { cancel(); setError(''); setErrors({}); setPlan(previous => ({ ...previous, skipped: true })); };
  const change = (id, value) => {
    cancel(); setError(''); setErrors({});
    setPlan(previous => ({ answers: { ...previous.answers, [id]: value }, review: null }));
  };
  const check = async event => {
    event.preventDefault();
    if (busy) return;
    const missing = answerErrors(answers); setErrors(missing); setError('');
    if (Object.keys(missing).length) return;
    const controller = new AbortController(); request.current = controller; setBusy(true);
    const snapshot = reasoningSnapshot(problem.id, answers);
    try {
      const response = await fetch('/api/reasoning/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemId: problem.id, answers }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The review could not finish. Please try again.');
      if (!isReviewComplete(data.review) || data.review.snapshot !== snapshot) throw new Error('The reviewer returned an incomplete assessment. Please try again.');
      if (request.current === controller) setPlan(previous => reasoningSnapshot(problem.id, previous.answers) === snapshot ? { ...previous, review: data.review } : previous);
    } catch (failure) {
      if (request.current === controller && failure.name !== 'AbortError') setError(failure.message);
    } finally { if (request.current === controller) { request.current = null; setBusy(false); } }
  };
  const form = <form onSubmit={check} className="reasoning-form">
    {typeof earlierNotes === 'string' && earlierNotes && <details><summary>Your earlier notes</summary><p className="saved-reasoning">{earlierNotes}</p></details>}
    <div className="reasoning-fields">{REASONING_FIELDS.map(({ id, label, question, hint }, index) => {
      const field = review?.fields?.[id];
      return <section className={`reasoning-field ${field?.status || ''}`} key={id}>
        <label htmlFor={`reasoning-${problem.id}-${id}`}><span className="reasoning-number">{index + 1}</span><strong>{label}</strong><span>{question}</span></label>
        <p id={`hint-${id}`}>{hint}</p>
        <textarea id={`reasoning-${problem.id}-${id}`} aria-label={label} aria-describedby={`hint-${id}${errors[id] || field ? ` feedback-${id}` : ''}`} aria-invalid={Boolean(errors[id] || field?.status === 'needs_work' || field?.status === 'unclear')} rows="3" maxLength={2000} value={typeof answers[id] === 'string' ? answers[id] : ''} onChange={event => change(id, event.target.value)} placeholder="Explain your own reasoning…" />
        {errors[id] ? <p className="error-text" id={`feedback-${id}`}>{errors[id]}</p> : field && <p className="reasoning-feedback" id={`feedback-${id}`}><strong>{statusLabels[field.status]}: </strong>{field.feedback}</p>}
      </section>;
    })}</div>
    <div aria-live="polite">{error && <p role="alert" className="error-text">{error}</p>}{review && <p className={approved ? 'success-text' : 'reasoning-summary'}>{review.summary}</p>}{busy && <p role="status">Reading your five answers together… Local review can take up to two minutes.</p>}</div>
    <div className="reasoning-actions">{busy ? <button type="button" onClick={cancel}>Cancel review</button> : <button type="submit" className="primary-button">{review ? 'Check revised reasoning' : 'Check my reasoning'}</button>}<small>Local AI review checks meaning and consistency. It can make mistakes; code tests come afterwards.</small></div>
  </form>;
  return <div className="space-y-4">
    <section className="panel reasoning-gate">
      <ol className="reasoning-progress" aria-label="Practice sequence"><li aria-current={!approved && !skipped ? 'step' : undefined}>1 · Explain your plan</li><li>{approved ? '2 · Reasoning accepted' : skipped ? '2 · Review skipped' : '2 · Review or skip'}</li><li>3 · Write code</li></ol>
      {approved ? <><div className="section-heading"><div><h2>Reasoning accepted</h2><p>Your five answers for {problem.title} have been reviewed.</p></div><span className="success-text">Ready to continue</span></div><details><summary>Read or revise your plan</summary><p>Changing an answer clears its assessment. You can review again or skip.</p>{form}</details></> : skipped ? <div className="section-heading"><div><h2>Review skipped</h2><p>You can continue with {problem.title}. Your saved reasoning is here whenever you want feedback.</p></div><button onClick={() => setPlan(previous => ({ ...previous, skipped: false }))}>Review my reasoning</button></div> : <>
        <h2>Explain your plan before coding</h2><h3>{problem.title}</h3><p>{problem.prompt}</p>
        <div className="reasoning-actions"><button type="button" onClick={skip}>Skip review — I've already solved this</button><small>Optional for each exercise. You can return to review anytime.</small></div>
        <details className="reasoning-contract"><summary>Inputs & example</summary><ul>{problem.args.map(arg => <li key={arg.name}><code>{arg.name}</code> — {arg.type}</li>)}</ul><pre>{JSON.stringify(problem.examples[0])}</pre></details>
        <p>For guided practice, write all five answers in your own words. The review checks how they work together and points out mistakes here. Continue after acceptance, or skip review to write code directly. The simulator is always available.</p>
        {form}
      </>}
    </section>
    {(approved || skipped) && children}
  </div>;
}
