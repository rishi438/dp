import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Sun, Moon, BookOpen, GitGraph, Code2, CheckCircle2 } from 'lucide-react';
import { CHAPTERS } from './data/chaptersData';
import { PRACTICE } from './data/practice';
import { useStoredState } from './hooks/useStoredState';
import CurriculumReader from './components/CurriculumReader';
const ChapterDesignatedSimulator = lazy(() => import('./components/ChapterDesignatedSimulator'));
const ChallengeCodeWorkspace = lazy(() => import('./components/ChallengeCodeWorkspace'));
const ReasoningWorkspace = lazy(() => import('./components/ReasoningWorkspace'));
const QuizModal = lazy(() => import('./components/QuizModal'));

const tabs = [
  ['story', '01 · Story'],
  ['worked_example', '02 · Worked example'],
  ['quiz', '03 · Trap drills'],
  ['reasoning', '04 · Your reasoning'],
  ['tree', '05 · Recursion Tree vs Memo'],
  ['flow', '06 · Simulation'],
  ['challenge', '07 · Write code']
];

export default function App() {
  const [chapterNum, setChapterNum] = useStoredState('chapter', 0);
  const chapter = CHAPTERS.find(c => c.num === chapterNum) || CHAPTERS[0];
  const [tab, setTab] = useStoredState('tab', 'story');
  const activeTab = tabs.some(([id]) => id === tab) ? tab : 'story';
  const [theme, setTheme] = useStoredState('theme', 'light');
  const [completed, setCompleted] = useStoredState('completed', {});
  const [solved, setSolved] = useStoredState('solved', {});
  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => { document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light'; }, [theme]);
  useEffect(() => { const warn = () => setStorageWarning(true); window.addEventListener('dp-storage-unavailable', warn); return () => window.removeEventListener('dp-storage-unavailable', warn); }, []);
  const selectChapter = n => { setChapterNum(n); window.scrollTo({ top: 0 }); };
  return <div className="app-shell">
    <header className="app-header"><div className="brand"><span className="brand-mark"><GitGraph size={25} /></span><div><p>THE DP ACADEMY</p><h1>Learn the pattern. See the solution.</h1></div></div>
      <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}{theme === 'dark' ? 'Light theme' : 'Dark theme'}</button>
    </header>
    {storageWarning && <p role="alert" className="error-text">Browser storage is unavailable. Keep a copy of your draft before closing this page.</p>}
    <div className="chapter-bar"><label>Chapter <select aria-label="Chapter" value={chapter.num} onChange={e => selectChapter(Number(e.target.value))}>
      {['approach', 'pattern'].map(half => <optgroup key={half} label={half === 'approach' ? 'How DP works · Chapters 0–4' : 'DP patterns · Chapters 5–18'}>{CHAPTERS.filter(c => c.half === half).map(c => <option key={c.num} value={c.num}>{completed[c.num] ? '✓ ' : ''}{String(c.num).padStart(2, '0')} · {c.title}</option>)}</optgroup>)}
    </select></label><span className="chapter-subtitle">{chapter.subtitle}</span><span className="progress-label"><CheckCircle2 size={16} /> {Object.values(completed).filter(Boolean).length}/19 reviewed · {Object.values(solved).filter(Boolean).length}/{PRACTICE.length} exercises passed</span></div>
    <nav className="main-tabs" aria-label="Learning sections">{tabs.map(([id, label]) => <button key={id} aria-current={id === activeTab ? 'page' : undefined} onClick={() => setTab(id)}>{label}</button>)}</nav>
    <main id="learning-content"><Suspense fallback={<div className="panel" role="status">Loading chapter…</div>}>
      {['story', 'worked_example'].includes(activeTab) && <CurriculumReader mode={activeTab} selectedChapter={chapter} onSelectChapter={selectChapter} onGoToExample={() => setTab('worked_example')} onGoToQuiz={() => setTab('quiz')} onGoToReasoning={() => setTab('reasoning')} onGoToStory={() => setTab('story')} />}
      {activeTab === 'reasoning' && <ReasoningWorkspace key={chapter.num} chapterNum={chapter.num} onGoToTree={() => setTab('tree')} onGoToSimulation={() => setTab('flow')} onGoToCode={() => setTab('challenge')} />}
      {['flow', 'tree'].includes(activeTab) && <ChapterDesignatedSimulator key={`${chapter.num}.${activeTab}`} chapterNum={chapter.num} compare={activeTab === 'tree'} />}
      {activeTab === 'challenge' && <ChallengeCodeWorkspace chapterNum={chapter.num} selectedChapter={chapter} onPassed={id => setSolved(old => ({ ...old, [id]: true }))} />}
      {activeTab === 'quiz' && <QuizModal chapterNum={chapter.num} onGoToReasoning={() => setTab('reasoning')} />}
    </Suspense></main>
    <footer className="learning-footer"><button disabled={chapter.num === 0} onClick={() => selectChapter(chapter.num - 1)}>← Previous chapter</button><button aria-pressed={Boolean(completed[chapter.num])} onClick={() => setCompleted(old => ({ ...old, [chapter.num]: !old[chapter.num] }))}><BookOpen size={16} />{completed[chapter.num] ? 'Chapter reviewed ✓' : 'Mark chapter reviewed'}</button><button disabled={chapter.num === 18} onClick={() => selectChapter(chapter.num + 1)}>Next chapter →</button></footer>
  </div>;
}
