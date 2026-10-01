import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LockKeyhole, Play, RotateCcw } from 'lucide-react';
import { marked } from 'marked';
import { chapterPractices, runTrace, displayValue } from '../data/practice';
import { runnerParts, starterBody, functionName } from '../data/runnerContract';
import { useStoredState } from '../hooks/useStoredState';
import TraceExplorer from './TraceExplorer';
import ResizableWorkspace from './ResizableWorkspace';
import ReasoningGate from './ReasoningGate';
import { usePracticeSelection } from '../hooks/usePracticeSelection';
import { useChapterMarkdown } from '../hooks/useChapterMarkdown';


function ReadOnlyCode({ text, start = 1 }) {
  return <div className="locked-code" aria-label="Read-only code">{text.split('\n').map((line, i) => <div className="code-line" key={i}><span className="line-number">{start + i}</span><code>{line || ' '}</code></div>)}</div>;
}

function Editor({ problem, language, onPassed }) {
  const [body, setBody] = useStoredState(`code.${problem.id}.${language}`, starterBody(language));
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [versions, setVersions] = useState(null);
  const [resetPrompt, setResetPrompt] = useState(false);
  const request = useRef(null), editor = useRef(null), gutter = useRef(null);
  const parts = useMemo(() => runnerParts(problem, language), [problem, language]);
  const prefixLines = parts.prefix.split('\n').length;
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal }).then(r => { if (!r.ok) throw new Error('Runner unavailable'); return r.json(); }).then(setVersions).catch(error => { if (error.name !== 'AbortError') setVersions({ offline: true }); });
    return () => { controller.abort(); request.current?.abort(); };
  }, []);
  const run = async () => {
    if (running) return;
    const controller = new AbortController(); request.current = controller;
    const timer = setTimeout(() => controller.abort(), 35000);
    setRunning(true); setOutput(null);
    try {
      const response = await fetch('/api/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemId: problem.id, language, body }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Runner returned ${response.status}`);
      setOutput(data);
      if (data.passed) onPassed(problem.id);
    } catch (error) {
      if (request.current === controller) setOutput({ passed: false, error: error.name === 'AbortError' ? 'Run cancelled or timed out.' : error.message });
    } finally { clearTimeout(timer); if (request.current === controller) setRunning(false); }
  };
  const indent = e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const { selectionStart: start, selectionEnd: end } = e.currentTarget;
    setBody(body.slice(0, start) + '    ' + body.slice(end));
    requestAnimationFrame(() => editor.current?.setSelectionRange(start + 4, start + 4));
  };
  return <div className="editor-column">
    <section className="panel code-editor">
      <div className="editor-toolbar"><strong>solution.{language === 'python' ? 'py' : 'rs'}</strong><span><LockKeyhole size={14} /> Signature & runner locked</span>
        <button aria-label="Reset solution body" onClick={() => setResetPrompt(true)}><RotateCcw size={16} /></button></div>
      {resetPrompt && <div className="reset-prompt">Reset this saved draft? <button onClick={() => { setBody(starterBody(language)); setResetPrompt(false); setOutput(null); }}>Reset draft</button><button onClick={() => setResetPrompt(false)}>Keep draft</button></div>}
      <ReadOnlyCode text={parts.prefix} />
      <div className="editable-label">Complete the function body below · saved on this device</div>
      <div className="editable-code">
        <div className="editor-gutter" ref={gutter} aria-hidden="true">{body.split('\n').map((_, i) => <div key={i}>{prefixLines + i + 1}</div>)}</div>
        <textarea ref={editor} aria-label="Solution function body" value={body} onChange={e => setBody(e.target.value)} onKeyDown={indent} onScroll={e => { gutter.current.scrollTop = e.currentTarget.scrollTop; }} spellCheck="false" autoCapitalize="off" autoCorrect="off" wrap="off" />
      </div>
      <details className="runner-preview"><summary><LockKeyhole size={14} /> Read-only test runner {language === 'python' ? '· if __name__ == "__main__"' : '· fn main()'}</summary>
        <ReadOnlyCode text={parts.suffix} start={prefixLines + body.split('\n').length + 1} />
      </details>
      <div className="editor-footer"><small>{versions?.offline ? 'Runner offline · start with npm run dev' : versions ? versions[language] || `${language} not found on PATH` : 'Checking local compiler…'}</small>
        {running ? <button onClick={() => request.current?.abort()}>Cancel run</button> : <button className="primary-button" onClick={run}><Play size={15} /> Run tests</button>}
      </div>
    </section>
    <section className="panel test-results" aria-live="polite"><h3>Test results</h3>
      {running ? <p>Running the protected test cases…</p> : !output ? <p>Run your solution to compare actual and expected answers. Ctrl+Enter also runs tests.</p> : <>
        <p className={output.passed ? 'success-text' : 'error-text'}>{output.passed ? 'All test cases passed' : output.error || (output.stage === 'compilation' ? 'Compilation failed' : 'Solution needs work')}{output.timeMs !== undefined && ` · ${output.timeMs} ms`}</p>
        {output.results?.map((result, i) => <details key={i} open={!result.passed}><summary>{result.passed ? '✓' : '✕'} Test {i + 1} · {result.passed ? 'Passed' : 'Failed'}</summary><pre>Input: {JSON.stringify(result.input)}{'\n'}Expected: {displayValue(result.expected)}{'\n'}Actual: {result.actual === null ? 'No value' : displayValue(result.actual)}{result.error && `\n${result.error}`}</pre></details>)}
        {output.stdout && <pre>{output.stdout}</pre>}{output.stderr && <pre className="error-text">{output.stderr}</pre>}
      </>}
    </section>
  </div>;
}

function CodingPractice({ chapterNum, onPassed }) {
  const practices = chapterPractices(chapterNum);
  const [problem, setSelected] = usePracticeSelection(chapterNum, practices);
  return <>
    <div className="workspace-toolbar"><label>Exercise <select aria-label="Coding exercise" value={problem.id} onChange={e => setSelected(e.target.value)}>{practices.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label></div>
    <ReasoningGate key={problem.id} problem={problem}><CodingExercise problem={problem} chapterNum={chapterNum} onPassed={onPassed} /></ReasoningGate>
  </>;
}

function CodingExercise({ problem, chapterNum, onPassed }) {
  const [language, setLanguage] = useStoredState('language', 'python');
  const safeLanguage = language === 'rust' ? 'rust' : 'python';
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationOpened, setSimulationOpened] = useState(false);
  const [codeView, setCodeView] = useState('solution');
  const [codeTarget, setCodeTarget] = useState(null);
  const [example, setExample] = useState(0);
  const openSimulation = () => { setSimulationOpened(true); setShowSimulation(true); };
  return <>
    <div className="workspace-toolbar"><label>Language <select aria-label="Programming language" value={safeLanguage} onChange={e => setLanguage(e.target.value)}><option value="python">Python</option><option value="rust">Rust</option></select></label></div>
    <ResizableWorkspace>
      <section className="panel challenge-problem">
        <div className="section-heading"><h2>{problem.title}</h2><button onClick={() => { if (showSimulation) setShowSimulation(false); else { openSimulation(); setCodeView('flow'); } }}>{showSimulation ? 'Read problem' : 'Explore simulation'}</button></div>
        <div hidden={showSimulation}>
          <p>{problem.prompt}</p><p>Complete <code>{functionName(problem)}</code>. Keep the provided parameters and return type. Helpers can be declared inside the function.</p>
          <h3>Input contract</h3><ul>{problem.args.map(a => <li key={a.name}><code>{a.name}</code> — {a.type}</li>)}</ul>
          <h3>Examples & boundary cases</h3>{problem.examples.map((input, i) => <div className="sample" key={i}><strong>Example {i + 1}</strong><pre>{JSON.stringify(input, null, 2)}</pre><p>Expected: <code>{displayValue(runTrace(problem, input, { maxCalls: 100000 }).result)}</code></p></div>)}
        </div>
        <div hidden={!showSimulation}>
          {simulationOpened && <><label>Simulation example <select value={example} onChange={e => setExample(Number(e.target.value))}>{problem.examples.map((_, i) => <option key={i} value={i}>Example {i + 1}</option>)}</select></label><TraceExplorer key={`${problem.id}.${example}`} problem={problem} input={problem.examples[example]} memoized={chapterNum !== 1} codeTarget={codeTarget} codeVisible={codeView === 'flow'} active={showSimulation} /></>}
        </div>
      </section>
      <div className="workspace-code-pane">
        <div className="segmented-control workspace-code-switch" role="group" aria-label="Code view">
          <button aria-pressed={codeView === 'solution'} onClick={() => setCodeView('solution')}>Your solution</button>
          <button aria-pressed={codeView === 'flow'} onClick={() => { setCodeView('flow'); openSimulation(); }}>Code flow</button>
        </div>
        <div hidden={codeView !== 'solution'}><Editor key={`${problem.id}.${safeLanguage}`} problem={problem} language={safeLanguage} onPassed={onPassed} /></div>
        <div className="workspace-reference-code" ref={setCodeTarget} hidden={codeView !== 'flow'} />
      </div>
    </ResizableWorkspace>
  </>;
}

function BookExercises({ selectedChapter }) {
  const text = useChapterMarkdown(selectedChapter.folder, '03 - your challenge.md');
  const sections = text.split(/\n(?=## )/).slice(1).filter(s => !/^## (After You Answer|What to do next)/i.test(s));
  const [index, setIndex] = useStoredState(`book.index.${selectedChapter.num}`, 0);
  const safeIndex = index >= 0 && index < sections.length ? index : 0;
  const [answers, setAnswers] = useStoredState(`book.answers.${selectedChapter.num}`, {});
  const section = sections[safeIndex] || text;
  return <div className="book-workspace panel">
    <p>Original book exercises: hand traces, proofs, coding variants, and trap drills. Written answers are saved for review; they are not automatically graded.</p>
    <label>Book exercise <select value={safeIndex} onChange={e => setIndex(Number(e.target.value))}>{sections.map((s, i) => <option key={i} value={i}>{s.split('\n')[0].replace(/^## /, '')}</option>)}</select></label>
    <div className="markdown-content" dangerouslySetInnerHTML={{ __html: marked.parse(section) }} />
    <label>Your answer<textarea aria-label="Book exercise answer" rows="12" value={answers[safeIndex] || ''} onChange={e => setAnswers(a => ({ ...a, [safeIndex]: e.target.value }))} /></label>
  </div>;
}

export default function ChallengeCodeWorkspace({ chapterNum, selectedChapter, onPassed }) {
  const [mode, setMode] = useStoredState('challenge.mode', 'coding');
  return <div className="space-y-4"><div className="segmented-control" aria-label="Practice mode"><button aria-pressed={mode === 'coding'} onClick={() => setMode('coding')}>Coding practice</button><button aria-pressed={mode === 'book'} onClick={() => setMode('book')}>Book exercises & notes</button></div>
    {mode === 'book' ? <BookExercises key={chapterNum} selectedChapter={selectedChapter} /> : <CodingPractice key={chapterNum} chapterNum={chapterNum} onPassed={onPassed} />}
  </div>;
}
