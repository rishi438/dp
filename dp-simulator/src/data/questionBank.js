// Question bank file format. Shared by the browser (file upload) and the server (run validation).
export const QUESTION_BANK_FORMAT = 'dp-question-bank/v1';
const MAX_QUESTIONS = 500, MAX_TESTS = 50, MAX_TEXT = 20000, MAX_CODE = 40000, MAX_EXPR = 2000;

export const QUESTION_BANK_TEMPLATE = {
  format: QUESTION_BANK_FORMAT,
  title: 'My question bank',
  description: 'Optional one-line description.',
  questions: [
    {
      id: 'two-sum',
      title: 'Two Sum',
      category: 'Python coding',
      difficulty: 'Easy',
      tags: ['hash map'],
      prompt: 'Markdown allowed. Return indices of the two numbers that add up to `target`.',
      starter: 'def two_sum(nums, target):\n    pass\n',
      tests: [{ call: 'two_sum([2, 7, 11, 15], 9)', expected: '[0, 1]' }],
      answer: 'Markdown explanation shown when you click **Show answer**.',
      solution: 'def two_sum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        if target - x in seen:\n            return [seen[target - x], i]\n        seen[x] = i\n',
    },
    {
      id: 'gil',
      title: 'What is the GIL?',
      category: 'Python concepts',
      difficulty: 'Medium',
      prompt: 'Questions without `starter`/`tests` show a notes box instead of a code runner.',
      answer: 'Your model answer in Markdown.',
    },
  ],
};

const text = (value, where, key, { required = false, max = MAX_TEXT } = {}) => {
  if (value === undefined || value === null) {
    if (required) throw new Error(`${where}: "${key}" is required.`);
    return '';
  }
  if (typeof value !== 'string') throw new Error(`${where}: "${key}" must be text.`);
  if (required && !value.trim()) throw new Error(`${where}: "${key}" cannot be empty.`);
  if (value.length > max) throw new Error(`${where}: "${key}" is longer than ${max} characters.`);
  return value;
};

export function validateTests(tests, where = 'Request') {
  if (!Array.isArray(tests) || tests.length > MAX_TESTS) throw new Error(`${where}: "tests" must be a list of at most ${MAX_TESTS} items.`);
  return tests.map((test, i) => ({
    call: text(test?.call, `${where} test ${i + 1}`, 'call', { required: true, max: MAX_EXPR }),
    expected: text(test?.expected, `${where} test ${i + 1}`, 'expected', { required: true, max: MAX_EXPR }),
  }));
}

export function validateSnippet(data) {
  const code = text(data?.code, 'Request', 'code', { required: true, max: MAX_CODE });
  const tests = validateTests(data?.tests);
  if (!tests.length) throw new Error('Request: add at least one test.');
  return { code, tests };
}

export function validateSubmission(data) {
  const question = parseQuestionBank({ format: QUESTION_BANK_FORMAT, questions: [data?.question] }).questions[0];
  const kind = data?.kind === 'code' ? 'code' : data?.kind === 'notes' ? 'notes' : null;
  if (!kind) throw new Error('Submission: "kind" must be "notes" or "code".');
  const answer = text(data?.answer, 'Submission', 'answer', { required: true, max: MAX_CODE });
  const short = value => typeof value === 'string' ? value.slice(0, MAX_EXPR) : null;
  let result = null;
  if (data?.result) {
    if (typeof data.result.passed !== 'boolean' || !Array.isArray(data.result.results) || data.result.results.length > MAX_TESTS) throw new Error('Submission: invalid test result.');
    result = { passed: data.result.passed, results: data.result.results.map(r => ({ call: short(r?.call), expected: short(r?.expected), actual: short(r?.actual), passed: r?.passed === true, error: short(r?.error) })) };
  }
  return { bankTitle: text(data?.bankTitle, 'Submission', 'bankTitle', { required: true, max: 200 }), question, kind, answer, result };
}

export function parseQuestionBank(raw) {
  let data;
  try { data = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { throw new Error('The file is not valid JSON.'); }
  if (data?.format !== QUESTION_BANK_FORMAT) throw new Error(`Missing "format": "${QUESTION_BANK_FORMAT}". Download the template to see the expected shape.`);
  if (!Array.isArray(data.questions) || !data.questions.length) throw new Error('"questions" must be a non-empty list.');
  if (data.questions.length > MAX_QUESTIONS) throw new Error(`At most ${MAX_QUESTIONS} questions per file.`);
  const ids = new Set();
  const questions = data.questions.map((q, i) => {
    const where = `Question ${i + 1}`;
    if (!q || typeof q !== 'object' || Array.isArray(q)) throw new Error(`${where} must be an object.`);
    const id = text(q.id, where, 'id', { required: true, max: 80 });
    if (!/^[\w.-]+$/.test(id)) throw new Error(`${where}: "id" may only use letters, numbers, "_", "-" and ".".`);
    if (ids.has(id)) throw new Error(`${where}: duplicate id "${id}".`);
    ids.add(id);
    const tags = q.tags === undefined ? [] : q.tags;
    if (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string' || tag.length > 40) || tags.length > 20) throw new Error(`${where}: "tags" must be a list of short text labels.`);
    return {
      id,
      title: text(q.title, where, 'title', { required: true, max: 200 }),
      category: text(q.category, where, 'category', { max: 80 }).trim() || 'General',
      difficulty: text(q.difficulty, where, 'difficulty', { max: 40 }).trim(),
      tags,
      prompt: text(q.prompt, where, 'prompt', { required: true }),
      starter: text(q.starter, where, 'starter', { max: MAX_CODE }),
      tests: q.tests === undefined ? [] : validateTests(q.tests, where),
      answer: text(q.answer, where, 'answer'),
      solution: text(q.solution, where, 'solution', { max: MAX_CODE }),
    };
  });
  return {
    format: QUESTION_BANK_FORMAT,
    title: typeof data.title === 'string' && data.title.trim() ? data.title.trim().slice(0, 200) : 'Question bank',
    description: typeof data.description === 'string' ? data.description.slice(0, 1000) : '',
    questions,
  };
}
