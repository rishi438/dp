export const REASONING_FIELDS = [
  { id: 'fulcrum', label: 'Fulcrum', question: 'What decision splits this problem into smaller problems?', hint: 'Name the last or next decision, and the choices it creates.' },
  { id: 'state', label: 'State', question: 'What exactly does one DP state mean?', hint: 'Define every parameter and what the stored value represents.' },
  { id: 'transition', label: 'Transition', question: 'How do the smaller answers produce this answer?', hint: 'Give the legal choices, the smaller states they use, and how you combine them.' },
  { id: 'base', label: 'Base case', question: 'Which smallest states already have known answers?', hint: 'Include empty, impossible, or boundary states when they matter.' },
  { id: 'termination', label: 'Final answer', question: 'Which state or combination of states answers the original problem?', hint: 'Explain where you return from and why that covers the whole input.' },
];

export const EMPTY_PLAN = { answers: {}, review: null };
export const REVIEW_VERSION = 1;

export function answerErrors(answers) {
  return Object.fromEntries(REASONING_FIELDS.flatMap(({ id, label }) => {
    const answer = answers?.[id];
    if (typeof answer !== 'string' || !answer.trim()) return [[id, `Explain your ${label.toLowerCase()} before checking.`]];
    if (answer.length > 2000) return [[id, 'Keep this answer within 2,000 characters.']];
    return [];
  }));
}

export function reasoningSnapshot(problemId, answers) {
  return JSON.stringify([problemId, ...REASONING_FIELDS.map(({ id }) => typeof answers?.[id] === 'string' ? answers[id].trim() : '')]);
}

export function isPlanApproved(problemId, plan) {
  const review = plan?.review;
  return Object.keys(answerErrors(plan?.answers)).length === 0 && isReviewComplete(review) && review.verdict === 'approved'
    && review.snapshot === reasoningSnapshot(problemId, plan.answers)
    && REASONING_FIELDS.every(({ id }) => review.fields?.[id]?.status === 'correct');
}

export function isReviewComplete(review) {
  return review?.version === REVIEW_VERSION && ['approved', 'revise'].includes(review.verdict)
    && typeof review.snapshot === 'string' && typeof review.summary === 'string' && Boolean(review.summary.trim())
    && REASONING_FIELDS.every(({ id }) => ['correct', 'needs_work', 'unclear'].includes(review.fields?.[id]?.status)
      && typeof review.fields[id].feedback === 'string' && Boolean(review.fields[id].feedback.trim()));
}
