import { REASONING_FIELDS } from '../src/data/reasoning.js';
import { parseReview } from '../reasoning-review.js';

// Transport/render fixture only; no claim that these placeholder answers are mathematically valid.
export function approvedPlan(problemId) {
  const answers = Object.fromEntries(REASONING_FIELDS.map(({ id }) => [id, `Reviewed ${id}`]));
  return { answers, review: parseReview({ summary: 'Accepted fixture.', fields: Object.fromEntries(REASONING_FIELDS.map(({ id }) => [id, { status: 'correct', feedback: 'Accepted fixture.' }])) }, problemId, answers, 'fixture') };
}
