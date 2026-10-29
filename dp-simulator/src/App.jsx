import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Sun, Moon, BookOpen, GitGraph, CheckCircle2, House, Briefcase, PanelLeftClose, PanelLeftOpen, ArrowRight } from 'lucide-react';
import { CHAPTERS } from './data/chaptersData';
import { PRACTICE } from './data/practice';
import { useStoredState } from './hooks/useStoredState';
import CurriculumReader from './components/CurriculumReader';
const ChapterDesignatedSimulator = lazy(() => import('./components/ChapterDesignatedSimulator'));
const ChallengeCodeWorkspace = lazy(() => import('./components/ChallengeCodeWorkspace'));
const ReasoningWorkspace = lazy(() => import('./components/ReasoningWorkspace'));
const QuizModal = lazy(() => import('./components/QuizModal'));
const QuestionBank = lazy(() => import('./components/QuestionBank'));

const tabs = [
  ['story', '01 · Simple explanation'],
  ['worked_example', '02 · Worked example'],
  ['quiz', '03 · Trap drills'],
  ['tree', '04 · Recursion Tree vs Memo'],
  ['reasoning', '05 · Your reasoning'],
  ['flow', '06 · Simulation'],
  ['challenge', '07 · Write code']
];

const areas = [
  ['home', 'Home', House],
  ['dp', 'DP Academy', GitGraph],
  ['bank', 'Interview prep', Briefcase],
];
const headings = {
  home: ['STUDY HUB', 'Pick what you want to practise.'],
  dp: ['THE DP ACADEMY', 'Learn the pattern. See the solution.'],
  bank: ['INTERVIEW PREP', 'Practise questions. Get feedback.'],
};

function Home({ open, dpProgress, bankDone }) {
  return <main id="learning-content" className="home-grid">
    <button className="home-card" onClick={() => open('dp')}>
      <GitGraph size={28} />
      <h2>DP Academy</h2>
      <p>19 chapters of dynamic programming: simple explanations, simulations, reasoning checks and coding practice.</p>
      <span className="home-card-meta">{dpProgress}</span>
      <span className="home-card-open">Open <ArrowRight size={15} /></span>
    </button>
    <button className="home-card" onClick={() => open('bank')}>
      <Briefcase size={28} />
      <h2>Interview prep</h2>
      <p>JPMC SE III Python full-stack practice set or your own question file: coding with tests, concept answers, and Submission IDs you can review in Copilot Chat.</p>
      <span className="home-card-meta">{bankDone} questions done</span>
      <span className="home-card-open">Open <ArrowRight size={15} /></span>
    </button>
  </main>;
}

export default function App() {
  const [chapterNum, setChapterNum] = useStoredState('chapter', 0);
  const chapter = CHAPTERS.find(c => c.num === chapterNum) || CHAPTERS[0];
  const [tab, setTab] = useStoredState('tab', 'story');
  const activeTab = tabs.some(([id]) => id === tab) ? tab : 'story';
  const [theme, setTheme] = useStoredState('theme', 'light');
  const [completed, setCompleted] = useStoredState('completed', {});
  const [solved, setSolved] = useStoredState('solved', {});
  const [storageWarning, setStorageWarning] = useState(false);
  const [barSlot, setBarSlot] = useState(null);
  const [storedArea, setArea] = useStoredState('area', 'home');
  const area = areas.some(([id]) => id === storedArea) ? storedArea : 'home';
  const [navOpen, setNavOpen] = useStoredState('nav.open', true);
  const [bankDone] = useStoredState('bank.done', {});
  const bankDoneCount = Object.values(bankDone).reduce((sum, ids) => sum + Object.values(ids || {}).filter(Boolean).length, 0);
  const dpProgress = `${Object.values(completed).filter(Boolean).length}/19 chapters reviewed · ${Object.values(solved).filter(Boolean).length}/${PRACTICE.length} exercises passed`;
  const openArea = id => { setArea(id); window.scrollTo({ top: 0 }); };
  useEffect(() => { document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light'; }, [theme]);
  useEffect(() => { const warn = () => setStorageWarning(true); window.addEventListener('dp-storage-unavailable', warn); return () => window.removeEventListener('dp-storage-unavailable', warn); }, []);
  const selectChapter = n => { setChapterNum(n); window.scrollTo({ top: 0 }); };
  return <div className={`app-frame ${navOpen ? 'nav-open' : 'nav-closed'}`}>
    <aside className="side-nav" aria-label="Main navigation" hidden={!navOpen}>
      {areas.map(([id, label, Icon]) => <button key={id} aria-current={id === area ? 'page' : undefined} onClick={() => openArea(id)}><Icon size={18} />{label}</button>)}
    </aside>
  <div className="app-shell">
    <header className="app-header"><div className="brand">
      <button className="nav-toggle" onClick={() => setNavOpen(o => !o)} aria-label={navOpen ? 'Hide menu' : 'Show menu'} aria-expanded={navOpen}>{navOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}</button>
      <span className="brand-mark"><GitGraph size={25} /></span><div><p>{headings[area][0]}</p><h1>{headings[area][1]}</h1></div></div>
      <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}{theme === 'dark' ? 'Light theme' : 'Dark theme'}</button>
    </header>
    {storageWarning && <p role="alert" className="error-text">Browser storage is unavailable. Keep a copy of your draft before closing this page.</p>}
    {area === 'home' && <Home open={openArea} dpProgress={dpProgress} bankDone={bankDoneCount} />}
    {area === 'bank' && <main id="learning-content"><Suspense fallback={<div className="panel" role="status">Loading…</div>}><QuestionBank /></Suspense></main>}
    {area === 'dp' && <>
    <div className="chapter-bar"><label>Chapter <select aria-label="Chapter" value={chapter.num} onChange={e => selectChapter(Number(e.target.value))}>
      {['approach', 'pattern'].map(half => <optgroup key={half} label={half === 'approach' ? 'How DP works · Chapters 0–4' : 'DP patterns · Chapters 5–18'}>{CHAPTERS.filter(c => c.half === half).map(c => <option key={c.num} value={c.num}>{completed[c.num] ? '✓ ' : ''}{String(c.num).padStart(2, '0')} · {c.title}</option>)}</optgroup>)}
    </select></label><span className="chapter-bar-slot" ref={setBarSlot} /><span className="progress-label"><CheckCircle2 size={16} /> {Object.values(completed).filter(Boolean).length}/19 reviewed · {Object.values(solved).filter(Boolean).length}/{PRACTICE.length} exercises passed</span></div>
    <nav className="main-tabs" aria-label="Learning sections">{tabs.map(([id, label]) => <button key={id} aria-current={id === activeTab ? 'page' : undefined} onClick={() => setTab(id)}>{label}</button>)}</nav>
    <main id="learning-content"><Suspense fallback={<div className="panel" role="status">Loading chapter…</div>}>
      {['story', 'worked_example'].includes(activeTab) && <CurriculumReader mode={activeTab} selectedChapter={chapter} onSelectChapter={selectChapter} onGoToExample={() => setTab('worked_example')} onGoToQuiz={() => setTab('quiz')} onGoToReasoning={() => setTab('reasoning')} onGoToStory={() => setTab('story')} />}
      {activeTab === 'reasoning' && <ReasoningWorkspace key={chapter.num} chapterNum={chapter.num} onGoToTree={() => setTab('tree')} onGoToSimulation={() => setTab('flow')} onGoToCode={() => setTab('challenge')} />}
      {['flow', 'tree'].includes(activeTab) && <ChapterDesignatedSimulator key={`${chapter.num}.${activeTab}`} chapterNum={chapter.num} compare={activeTab === 'tree'} toolbarTarget={barSlot} />}
      {activeTab === 'challenge' && <ChallengeCodeWorkspace chapterNum={chapter.num} selectedChapter={chapter} onPassed={id => setSolved(old => ({ ...old, [id]: true }))} />}
      {activeTab === 'quiz' && <QuizModal chapterNum={chapter.num} onGoToReasoning={() => setTab('reasoning')} />}
    </Suspense></main>
    <footer className="learning-footer"><button disabled={chapter.num === 0} onClick={() => selectChapter(chapter.num - 1)}>← Previous chapter</button><button aria-pressed={Boolean(completed[chapter.num])} onClick={() => setCompleted(old => ({ ...old, [chapter.num]: !old[chapter.num] }))}><BookOpen size={16} />{completed[chapter.num] ? 'Chapter reviewed ✓' : 'Mark chapter reviewed'}</button><button disabled={chapter.num === 18} onClick={() => selectChapter(chapter.num + 1)}>Next chapter →</button></footer>
    </>}
  </div>
  </div>;
}
