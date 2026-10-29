import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Marked } from 'marked';
import { Upload, FileDown, Library, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import CodeEditor from './CodeEditor';
import ResizableWorkspace from './ResizableWorkspace';
import SubmissionId from './SubmissionId';
import { useStoredState } from '../hooks/useStoredState';
import { parseQuestionBank, QUESTION_BANK_TEMPLATE } from '../data/questionBank';

const SAMPLE_URL = '/question-banks/jpmc-se3-python-fullstack.json';
const escapeHtml = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Uploaded files are untrusted: raw HTML is shown as text and only http(s) links are kept.
const markdown = new Marked({
  renderer: { html: ({ text }) => escapeHtml(text) },
  walkTokens: token => { if ((token.type === 'link' || token.type === 'image') && !/^https?:\/\//i.test(token.href)) token.href = '#'; },
});
const Markdown = ({ source }) => <div className="markdown-content" dangerouslySetInnerHTML={{ __html: markdown.parse(source) }} />;

async function saveSubmission(payload) {
  const response = await fetch('/api/bank/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Save failed (${response.status})`);
  return data.id;
}

function Runner({ bankKey, bankTitle, question, onPassed }) {
  const initial = question.starter || '# Write your solution here\n';
  const [code, setCode] = useStoredState(`bank.code.${bankKey}.${question.id}`, initial);
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [versions, setVersions] = useState(null);
  const [resetPrompt, setResetPrompt] = useState(false);
  const [saved, setSaved] = useState(null);
  const request = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setVersions)
      .catch(error => { if (error.name !== 'AbortError') setVersions({ offline: true }); });
    return () => { controller.abort(); request.current?.abort(); };
  }, []);

  const run = async () => {
    if (running) return;
    if (!question.tests.length) { setOutput({ passed: false, error: 'This question has no tests. Compare with the answer instead.' }); return; }
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 35000);
    setRunning(true); setOutput(null); setSaved(null);
    try {
      const response = await fetch('/api/run-snippet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, tests: question.tests }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Runner returned ${response.status}`);
      setOutput(data);
      if (data.passed) onPassed();
      setSaved({ pending: true });
      saveSubmission({ bankTitle, question, kind: 'code', answer: code, result: { passed: data.passed, results: data.results } })
        .then(id => setSaved({ id }), error => setSaved({ error: error.message }));
    } catch (error) {
      if (request.current === controller) setOutput({ passed: false, error: error.name === 'AbortError' ? 'Run cancelled or timed out.' : error.message });
    } finally {
      clearTimeout(timer);
      if (request.current === controller) setRunning(false);
    }
  };

  const lockedFooter = question.tests.length ? ['', 'if __name__ == "__main__":', ...question.tests.map(t => `    assert ${t.call} == ${t.expected}`)].join('\n') : '';

  return <div className="editor-column">
    <CodeEditor code={code} onChange={setCode} language="python" onRun={run} lockedFooter={lockedFooter}
      onReset={() => { setCode(initial); setResetPrompt(false); setOutput(null); }}
      resetPrompt={resetPrompt} setResetPrompt={setResetPrompt} versions={versions} running={running} onCancel={() => request.current?.abort()} />
    <section className="panel test-results" aria-live="polite">
      <h3>Test results</h3>
      {running ? <p>Running {question.tests.length} tests…</p>
        : !output ? <p>{question.tests.length ? `${question.tests.length} tests from the question file. Ctrl+Enter runs them.` : 'No tests in this question. Use the editor as a scratchpad.'}</p>
        : <>
          <p className={output.passed ? 'success-text' : 'error-text'}>{output.passed ? 'All tests passed' : output.error || 'Some tests failed'}{output.timeMs !== undefined && ` · ${output.timeMs} ms`}</p>
          {output.results?.map((result, i) => <details key={i} open={!result.passed}>
            <summary>{result.passed ? '✓' : '✕'} {result.call}</summary>
            <pre>Expected: {result.expected}{'\n'}Actual: {result.actual ?? 'No value'}{result.error && `\n${result.error}`}</pre>
          </details>)}
          {output.stdout && <pre>{output.stdout}</pre>}
          {output.stderr && <pre className="error-text">{output.stderr}</pre>}
          <SubmissionId saved={saved} />
        </>}
    </section>
  </div>;
}

function Notes({ bankKey, bankTitle, question, done, onSubmit }) {
  const [notes, setNotes] = useStoredState(`bank.notes.${bankKey}.${question.id}`, '');
  const [saved, setSaved] = useState(null);
  const submit = () => {
    onSubmit();
    setSaved({ pending: true });
    saveSubmission({ bankTitle, question, kind: 'notes', answer: notes }).then(id => setSaved({ id }), error => setSaved({ error: error.message }));
  };
  return <section className="panel question-notes">
    <h3>Your answer</h3>
    <p>Write your answer, then submit to compare it with the model answer. Saved in this browser.</p>
    <textarea aria-label="Your answer" value={notes} onChange={e => { setNotes(e.target.value); setSaved(null); }} rows={18} placeholder="Explain it as you would in the interview…" />
    <div className="question-notes-footer">
      <small>{done ? '✓ Submitted. Compare with the model answer on the left; you can edit and submit again.' : 'Submitting opens the model answer and marks this question done.'}</small>
      <button className="primary-button" disabled={!notes.trim() || saved?.pending} onClick={submit}>{done ? 'Submit again' : 'Submit answer'}</button>
    </div>
    <SubmissionId saved={saved} />
  </section>;
}

export default function QuestionBank() {
  const [bank, setBank] = useStoredState('bank.loaded', null);
  const [selectedId, setSelectedId] = useStoredState('bank.selected', '');
  const [category, setCategory] = useState('All');
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState('');
  const fileInput = useRef(null);

  let safeBank = null;
  try { safeBank = bank ? parseQuestionBank(bank) : null; } catch { safeBank = null; }
  const bankKey = safeBank ? safeBank.title.replace(/\W+/g, '-').toLowerCase() : '';
  const categories = useMemo(() => safeBank ? ['All', ...new Set(safeBank.questions.map(q => q.category))] : [], [bank]);
  const visible = safeBank ? safeBank.questions.filter(q => category === 'All' || q.category === category) : [];
  const index = Math.max(0, visible.findIndex(q => q.id === selectedId));
  const question = visible[index];
  const [doneByBank, setDoneByBank] = useStoredState('bank.done', {});
  const done = doneByBank[bankKey] || {};
  const markDone = () => question && setDoneByBank(all => ({ ...all, [bankKey]: { ...(all[bankKey] || {}), [question.id]: true } }));

  const load = (raw, source) => {
    try {
      const parsed = parseQuestionBank(raw);
      setBank(parsed); setCategory('All'); setSelectedId(parsed.questions[0].id); setRevealed(false);
      setMessage(`Loaded ${parsed.questions.length} questions from ${source}.`);
    } catch (error) { setMessage(error.message); }
  };
  const onFile = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 2_000_000) { setMessage('File is larger than 2 MB.'); return; }
    load(await file.text(), file.name);
  };
  const loadSample = async () => {
    try {
      const response = await fetch(SAMPLE_URL);
      if (!response.ok) throw new Error('Sample file not found.');
      load(await response.text(), 'the sample');
    } catch (error) { setMessage(error.message); }
  };
  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(QUESTION_BANK_TEMPLATE, null, 2)], { type: 'application/json' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: 'question-bank-template.json' });
    link.click(); URL.revokeObjectURL(url);
  };
  const go = step => { const next = visible[index + step]; if (next) { setSelectedId(next.id); setRevealed(false); } };

  const toolbar = <div className="workspace-toolbar question-bank-toolbar">
    <div className="question-bank-actions">
      <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={onFile} />
      <button onClick={() => fileInput.current.click()}><Upload size={15} /> Load question file</button>
      <button onClick={loadSample}><Library size={15} /> Load JPMC SE III sample</button>
      <button onClick={downloadTemplate}><FileDown size={15} /> Download template</button>
      {safeBank && <button onClick={() => { setBank(null); setMessage('Question bank removed. Your saved code and notes are kept.'); }}><Trash2 size={15} /> Remove</button>}
    </div>
    {message && <span role="status">{message}</span>}
  </div>;

  if (!safeBank) return <div className="space-y-4">
    {toolbar}
    <section className="panel">
      <h2>Question bank</h2>
      <p>Load a question file to practise interview questions here. Coding questions open in the editor and run their tests on your machine; concept questions give you a notes box and a model answer.</p>
      <p>The file is JSON with <code>"format": "dp-question-bank/v1"</code>. Use <strong>Download template</strong> for the exact shape, or start with the sample.</p>
    </section>
  </div>;

  return <div className="space-y-4">
    {toolbar}
    <div className="workspace-toolbar">
      <label>Topic <select aria-label="Question topic" value={category} onChange={e => { setCategory(e.target.value); const first = safeBank.questions.find(q => e.target.value === 'All' || q.category === e.target.value); if (first) setSelectedId(first.id); setRevealed(false); }}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Question <select aria-label="Question" value={question?.id} onChange={e => { setSelectedId(e.target.value); setRevealed(false); }}>{visible.map((q, i) => <option key={q.id} value={q.id}>{done[q.id] ? '✓ ' : ''}{i + 1}. {q.title}</option>)}</select></label>
      <span className="question-bank-nav"><button aria-label="Previous question" disabled={index === 0} onClick={() => go(-1)}><ChevronLeft size={16} /></button>{index + 1} / {visible.length}<button aria-label="Next question" disabled={index >= visible.length - 1} onClick={() => go(1)}><ChevronRight size={16} /></button></span>
      <span className="question-bank-progress">{safeBank.questions.filter(q => done[q.id]).length} / {safeBank.questions.length} done</span>
    </div>
    {question && <ResizableWorkspace>
      <section className="panel question-card">
        <p className="eyebrow">{safeBank.title}</p>
        <div className="section-heading"><h2>{question.title}</h2>
          <span className="question-badges"><span className="question-badge">{question.category}</span>{question.difficulty && <span className="question-badge">{question.difficulty}</span>}</span></div>
        {question.tags.length > 0 && <p className="question-tags">{question.tags.map(tag => <code key={tag}>{tag}</code>)}</p>}
        <Markdown source={question.prompt} />
        {(question.answer || question.solution) && <div className="question-answer">
          <button onClick={() => setRevealed(r => !r)}>{revealed ? <EyeOff size={15} /> : <Eye size={15} />} {revealed ? 'Hide answer' : 'Show answer'}</button>
          {revealed && <>
            {question.answer && <Markdown source={question.answer} />}
            {question.solution && <><h3>Reference solution</h3><pre><code>{question.solution}</code></pre></>}
          </>}
        </div>}
      </section>
      {question.starter || question.tests.length
        ? <Runner key={`${bankKey}.${question.id}`} bankKey={bankKey} bankTitle={safeBank.title} question={question} onPassed={markDone} />
        : <Notes key={`${bankKey}.${question.id}`} bankKey={bankKey} bankTitle={safeBank.title} question={question} done={Boolean(done[question.id])} onSubmit={() => { markDone(); setRevealed(true); }} />}
    </ResizableWorkspace>}
  </div>;
}
