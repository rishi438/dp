// Coding practice has explicit contracts; unsupported exercises never fall back to Fibonacci.
import { chapterPractices } from './practice.js';
export const CHAPTER_CHALLENGES = Object.fromEntries(Array.from({ length: 19 }, (_, chapter) => [chapter, chapterPractices(chapter)]));
export function getChallengeSuite(chapterNum, challengeIdx) {
  return CHAPTER_CHALLENGES[chapterNum]?.[challengeIdx] ?? null;
}
