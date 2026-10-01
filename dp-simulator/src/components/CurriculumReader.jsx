import React, { useMemo } from 'react';
import { marked } from 'marked';
import { BookOpen, Award, ArrowRight, ArrowLeft, Play, Target, CheckCircle2 } from 'lucide-react';
import { CHAPTERS } from '../data/chaptersData';
import { useChapterMarkdown } from '../hooks/useChapterMarkdown';

// Eagerly import all markdown files from all chapters across the entire book!

export default function CurriculumReader({
  mode = 'story', // 'story' | 'worked_example' | 'challenge'
  selectedChapter,
  compact = false,
  onSelectChapter,
  onGoToExample,
  onGoToReasoning,
  onGoToStory
}) {
  const chapter = selectedChapter || CHAPTERS[0];
  const isStory = mode === 'story';
  const isExample = mode === 'worked_example';
  const isChallenge = mode === 'challenge';

  // Determine doc filename target
  const targetDoc = isStory
    ? '01 - story.md'
    : isExample
    ? '02 - worked example.md'
    : '03 - your challenge.md';

  // Retrieve raw markdown text for the selected chapter
  const rawText = useChapterMarkdown(chapter.folder, targetDoc) || 'Loading chapter…';

  // Only bundled, repository-owned curriculum markdown is rendered here.
  const htmlContent = useMemo(() => {
    marked.setOptions({
      gfm: true,
      breaks: true
    });
    return marked.parse(rawText);
  }, [rawText]);

  if (compact) {
    return (
      <div
        className="prose prose-invert prose-sm max-w-none leading-relaxed text-slate-300 font-sans"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Chapter Top Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl p-2 bg-slate-950 rounded-xl border border-slate-800">
            {chapter.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Chapter {chapter.num} · {chapter.half === 'approach' ? 'Approach Half' : 'Pattern Half'}
              </span>
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                {chapter.folder}/{targetDoc}
              </span>
            </div>
            <h1 className="text-lg font-bold text-white mt-0.5">
              {chapter.title}: {chapter.subtitle}
            </h1>
            <p className="text-[11px] text-slate-400">
              Character Guide: <strong className="text-slate-200">{chapter.character}</strong>
            </p>
          </div>
        </div>

        {/* Quick Write your reasoning Button */}
        <button
          onClick={onGoToReasoning}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 fill-slate-950" />
          <span>Write your reasoning</span>
        </button>
      </div>

      {/* Rendered Markdown Document Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl text-slate-300">
        <article
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Bottom Curriculum Navigation Buttons */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {isStory && (
            <>
              <button
                onClick={onGoToReasoning}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
              >
                <span>Write your reasoning ➔</span>
              </button>
              <button
                onClick={onGoToExample}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center gap-2"
              >
                <span>Next: 02 — Worked Example</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {isExample && (
            <>
              <button
                onClick={onGoToStory}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Story</span>
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={onGoToReasoning}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition border border-slate-700"
                >
                  <span>Choose your exercise</span>
                </button>
                <button
                  onClick={onGoToReasoning}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-cyan-500/20 transition flex items-center gap-2 transform hover:scale-102"
                >
                  <span>Next: 03 — Your reasoning</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {isChallenge && (
            <>
              <button
                onClick={onGoToExample}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Worked Example</span>
              </button>
              <button
                onClick={onGoToReasoning}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
              >
                <span>Review your reasoning ➔</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
