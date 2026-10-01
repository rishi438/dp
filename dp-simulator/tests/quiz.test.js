import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { QUIZ_QUESTIONS } from '../src/data/quizQuestions.js';
import { getChapterQuestions, chapterOf, resetChapterMistakes } from '../src/data/chapterQuizzes.js';

test('every chapter has its own substantial bank and all original questions remain', () => {
  const ids = new Set();
  for (let chapter = 0; chapter < 19; chapter++) {
    const questions = getChapterQuestions(chapter);
    assert.ok(questions.length >= 8, `Chapter ${chapter} needs at least eight questions`);
    assert.equal(new Set(questions.map(q => q.question)).size, questions.length);
    for (const question of questions) {
      assert.equal(chapterOf(question), chapter);
      assert.ok(!ids.has(question.id)); ids.add(question.id);
      assert.equal(question.options.filter(o => o.correct).length, 1);
      assert.ok(question.explanation || question.options.every(o => o.explanation));
    }
  }
  for (const question of QUIZ_QUESTIONS) assert.ok(getChapterQuestions(chapterOf(question)).includes(question));
});

test('retrying one chapter preserves other chapters and already-correct answers', () => {
  const answers = { 11: 0, 12: 1, 22: 1, 'chapter-10-trap-1': 2 };
  assert.deepEqual(resetChapterMistakes(answers, [11]), { 12: 1, 22: 1, 'chapter-10-trap-1': 2 });
  assert.equal(answers[11], 0, 'Original saved object is not mutated');
});

test('quiz renders numbered navigation only for the selected chapter', async () => {
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' });
  try {
    const { default: Quiz } = await vite.ssrLoadModule('/src/components/QuizModal.jsx');
    for (const chapterNum of [0, 1, 10, 16, 18]) {
      const html = renderToString(React.createElement(Quiz, { chapterNum }));
      assert.match(html, new RegExp(`Chapter ${chapterNum} question navigation`));
      assert.equal((html.match(/aria-label="Question \d+: Unanswered"/g) || []).length, getChapterQuestions(chapterNum).length);
      assert.match(html, /aria-current="step"/);
      assert.doesNotMatch(html, /Quiz question set|All chapters|Approaches · Chapters|Patterns · Chapters/);
    }
  } finally { await vite.close(); }
});
