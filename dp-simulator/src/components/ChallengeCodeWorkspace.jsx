import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LockKeyhole, Play, RotateCcw } from 'lucide-react';
import { marked } from 'marked';
import CodeEditor from './CodeEditor';
import { chapterPractices, runTrace, displayValue } from '../data/practice';
import { runnerParts, starterBody, functionName, fullStarterCode, toFullCode } from '../data/runnerContract';
import { useStoredState } from '../hooks/useStoredState';
import TraceExplorer from './TraceExplorer';
import ResizableWorkspace from './ResizableWorkspace';
import ReasoningGate from './ReasoningGate';
import { usePracticeSelection } from '../hooks/usePracticeSelection';
import { useChapterMarkdown } from '../hooks/useChapterMarkdown';

function Editor({ problem, language, onPassed }) {
  const initialCode = useMemo(() => fullStarterCode(problem, language), [problem, language]);
  const [storedCode, setStoredCode] = useStoredState(`code.${problem.id}.${language}`, initialCode);
  const code = useMemo(() => toFullCode(problem, language, storedCode), [problem, language, storedCode]);
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [versions, setVersions] = useState(null);
  const [resetPrompt, setResetPrompt] = useState(false);
  const request = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('Runner unavailable'); return r.json(); })
      .then(setVersions)
      .catch(error => { if (error.name !== 'AbortError') setVersions({ offline: true }); });
    return () => { controller.abort(); request.current?.abort(); };
  }, []);

  const run = async () => {
    if (running) return;
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 35000);
    setRunning(true);
    setOutput(null);
    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem.id, language, body: code }),
        signal: controller.signal
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Runner returned ${response.status}`);
      setOutput(data);
      if (data.passed) onPassed(problem.id);
    } catch (error) {
      if (request.current === controller) {
        setOutput({ passed: false, error: error.name === 'AbortError' ? 'Run cancelled or timed out.' : error.message });
      }
    } finally {
      clearTimeout(timer);
      if (request.current === controller) setRunning(false);
    }
  };

  const resetToTemplate = () => {
    const template = fullStarterCode(problem, language);
    setStoredCode(template);
    setResetPrompt(false);
    setOutput(null);
  };

  return (
    <div className="editor-column">
      <CodeEditor
        code={code}
        onChange={setStoredCode}
        language={language}
        onRun={run}
        onReset={resetToTemplate}
        resetPrompt={resetPrompt}
        setResetPrompt={setResetPrompt}
        versions={versions}
        running={running}
        onCancel={() => request.current?.abort()}
      />
      <section className="panel test-results" aria-live="polite">
        <h3>Test results</h3>
        {running ? (
          <p>Running the protected test cases…</p>
        ) : !output ? (
          <p>Run your solution to compare actual and expected answers. Ctrl+Enter also runs tests.</p>
        ) : (
          <>
            <p className={output.passed ? 'success-text' : 'error-text'}>
              {output.passed ? 'All test cases passed' : output.error || (output.stage === 'compilation' ? 'Compilation failed' : 'Solution needs work')}
              {output.timeMs !== undefined && ` · ${output.timeMs} ms`}
            </p>
            {output.results?.map((result, i) => (
              <details key={i} open={!result.passed}>
                <summary>
                  {result.passed ? '✓' : '✕'} Test {i + 1} · {result.passed ? 'Passed' : 'Failed'}
                </summary>
                <pre>
                  Input: {JSON.stringify(result.input)}
                  {'\n'}Expected: {displayValue(result.expected)}
                  {'\n'}Actual: {result.actual === null ? 'No value' : displayValue(result.actual)}
                  {result.error && `\n${result.error}`}
                </pre>
              </details>
            ))}
            {output.stdout && <pre>{output.stdout}</pre>}
            {output.stderr && <pre className="error-text">{output.stderr}</pre>}
          </>
        )}
      </section>
    </div>
  );
}

function CodingPractice({ problem, chapterNum, onPassed }) {
  return <ReasoningGate key={problem.id} problem={problem}><CodingExercise problem={problem} chapterNum={chapterNum} onPassed={onPassed} /></ReasoningGate>;
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
    <ResizableWorkspace>
      <section className="panel challenge-problem">
        <div className="section-heading">
          <h2>{problem.title}</h2>
          <div className="challenge-heading-actions">
            {showSimulation && <label className="simulation-example-select">Simulation example <select aria-label="Simulation example" value={example} onChange={e => setExample(Number(e.target.value))}>{problem.examples.map((_, i) => <option key={i} value={i}>Example {i + 1}</option>)}</select></label>}
            <button onClick={() => { if (showSimulation) setShowSimulation(false); else { openSimulation(); setCodeView('flow'); } }}>{showSimulation ? 'Read problem' : 'Explore simulation'}</button>
          </div>
        </div>
        <div hidden={showSimulation}>
          <p>{problem.prompt}</p><p>Complete <code>{functionName(problem)}</code>. Keep the provided parameters and return type. Helpers can be declared inside the function.</p>
          <h3>Input contract</h3><ul>{problem.args.map(a => <li key={a.name}><code>{a.name}</code> — {a.type}</li>)}</ul>
          <h3>Examples & boundary cases</h3>{problem.examples.map((input, i) => <div className="sample" key={i}><div className="flex flex-wrap items-center justify-between gap-2"><strong>Example {i + 1}</strong><p style={{ margin: 0 }}>Expected: <code>{displayValue(runTrace(problem, input, { maxCalls: 100000 }).result)}</code></p></div><pre>{JSON.stringify(input)}</pre></div>)}
        </div>
        <div hidden={!showSimulation}>
          {simulationOpened && <TraceExplorer key={`${problem.id}.${example}`} problem={problem} input={problem.examples[example]} memoized={chapterNum !== 1} codeTarget={codeTarget} codeVisible={codeView === 'flow'} active={showSimulation} />}
        </div>
      </section>
      <div className="workspace-code-pane">
        <div className="workspace-code-switch-bar">
          <div className="segmented-control workspace-code-switch" role="group" aria-label="Code view">
            <button aria-pressed={codeView === 'solution'} onClick={() => setCodeView('solution')}>Your solution</button>
            <button aria-pressed={codeView === 'flow'} onClick={() => { setCodeView('flow'); openSimulation(); }}>Code flow</button>
          </div>
          {codeView === 'solution' && <label className="code-language-select">Language <select aria-label="Programming language" value={safeLanguage} onChange={e => setLanguage(e.target.value)}><option value="python">Python</option><option value="rust">Rust</option></select></label>}
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
  const practices = chapterPractices(chapterNum);
  const [problem, setSelected] = usePracticeSelection(chapterNum, practices);
  return <div className="space-y-4">
    <div className="workspace-toolbar">
      <div className="segmented-control" aria-label="Practice mode">
        <button aria-pressed={mode === 'coding'} onClick={() => setMode('coding')}>Coding practice</button>
        <button aria-pressed={mode === 'book'} onClick={() => setMode('book')}>Book exercises & notes</button>
      </div>
      {mode === 'coding' && <label>Exercise <select aria-label="Coding exercise" value={problem.id} onChange={e => setSelected(e.target.value)}>{practices.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label>}
    </div>
    {mode === 'book' ? <BookExercises key={chapterNum} selectedChapter={selectedChapter} /> : <CodingPractice key={`${chapterNum}.${problem.id}`} chapterNum={chapterNum} problem={problem} onPassed={onPassed} />}
  </div>;
}
