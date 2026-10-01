import React, { useState } from 'react';
import { CHAPTERS } from '../data/chaptersData';
import { getChapterQuestions, resetChapterMistakes } from '../data/chapterQuizzes';
import { useStoredState } from '../hooks/useStoredState';

export { chapterOf } from '../data/chapterQuizzes';

function ChapterQuiz({ chapterNum }) {
  const questions = getChapterQuestions(chapterNum);
  const chapter = CHAPTERS.find(c => c.num === chapterNum);
  // Keep existing answer IDs so the earlier question bank retains its saved answers.
  const [answers, setAnswers] = useStoredState('quiz.answers', {});
  const [mistakes, setMistakes] = useStoredState('quiz.mistakes', {});
  const [index, setIndex] = useStoredState(`quiz.chapter.${chapterNum}.index`, 0);
  const [retryIds, setRetryIds] = useState(null);
  const filtered = retryIds ? questions.filter(q => retryIds.includes(q.id)) : questions;
  const safeIndex = Math.min(Math.max(index, 0), Math.max(0, filtered.length - 1));
  const question = filtered[safeIndex];
  const answered = questions.filter(q => answers[q.id] !== undefined);
  const correct = answered.filter(q => q.options[answers[q.id]]?.correct).length;
  const chapterMistakes = questions.filter(q => mistakes[q.id]).map(q => q.id);
  const choose = option => {
    if (!question || answers[question.id] !== undefined) return;
    setAnswers(a => ({ ...a, [question.id]: option }));
    setMistakes(m => ({ ...m, [question.id]: !question.options[option].correct }));
  };
  const retry = () => {
    setRetryIds(chapterMistakes); setIndex(0);
    setAnswers(a => resetChapterMistakes(a, chapterMistakes));
  };
  return <section className="panel quiz-panel">
    <div className="section-heading"><div><p className="eyebrow">Chapter {chapterNum} · {chapter?.title}</p><h2>Trap drills</h2><p>{questions.length} questions for this chapter. Your answers and position are saved.</p></div><strong>{correct} correct / {answered.length} answered</strong></div>
    <div className="workspace-toolbar"><span>{retryIds ? 'Reviewing this chapter’s mistakes' : 'Jump to any question'}</span>
      <div className="segmented-control">{retryIds && <button onClick={() => { setRetryIds(null); setIndex(0); }}>Back to chapter questions</button>}
        <button onClick={retry} disabled={!chapterMistakes.length}>Retry chapter mistakes ({chapterMistakes.length})</button>
      </div>
    </div>
    <nav className="quiz-number-nav" aria-label={`Chapter ${chapterNum} question navigation`}>
      {filtered.map((q, i) => {
        const number = questions.indexOf(q) + 1;
        const answered = answers[q.id] !== undefined;
        const correct = answered && q.options[answers[q.id]]?.correct;
        const status = answered ? correct ? 'Correct' : 'Incorrect' : 'Unanswered';
        return <button key={q.id} onClick={() => setIndex(i)} aria-current={i === safeIndex ? 'step' : undefined} aria-label={`Question ${number}: ${status}`} title={`Question ${number}: ${status}`} className={`quiz-number ${answered ? correct ? 'quiz-number-correct' : 'quiz-number-wrong' : ''}`}>
          <span>{number}</span><small aria-hidden="true">{answered ? correct ? '✓' : '✕' : '○'}</small>
        </button>;
      })}
    </nav>
    <p className="quiz-legend"><span>○ Unanswered</span><span className="success-text">✓ Correct</span><span className="error-text">✕ Needs review</span></p>
    {!question ? <p>No questions to review in this chapter.</p> : <>
      <p className="eyebrow">Question {questions.indexOf(question) + 1} of {questions.length} · {question.category}</p><h3 className="quiz-question">{question.question}</h3>
      {question.code && <pre>{question.code}</pre>}
      <div className="quiz-options">{question.options.map((option, i) => <button key={i} disabled={answers[question.id] !== undefined} onClick={() => choose(i)} className={answers[question.id] === undefined ? '' : option.correct ? 'correct-option' : answers[question.id] === i ? 'wrong-option' : ''}>
        <span>{String.fromCharCode(65 + i)}.</span> {option.text}{answers[question.id] !== undefined && option.correct && ' ✓'}
      </button>)}</div>
      {answers[question.id] !== undefined && <div className="explanation" role="status"><strong>{question.options[answers[question.id]]?.correct ? 'Correct.' : 'Review this reasoning.'}</strong><p>{question.options[answers[question.id]]?.explanation || question.explanation}</p>{!question.options[answers[question.id]]?.correct && <p>{question.options.find(option => option.correct)?.explanation}</p>}</div>}
      <div className="learning-footer"><button disabled={safeIndex === 0} onClick={() => setIndex(safeIndex - 1)}>← Previous</button><span>{safeIndex + 1} / {filtered.length}{retryIds ? ' in review' : ''}</span><button disabled={safeIndex === filtered.length - 1} onClick={() => setIndex(safeIndex + 1)}>Next →</button></div>
    </>}
  </section>;
}

export default function QuizModal({ chapterNum = 0 }) {
  // A chapter change resets transient review mode and restores that chapter's position.
  return <ChapterQuiz key={chapterNum} chapterNum={chapterNum} />;
}
