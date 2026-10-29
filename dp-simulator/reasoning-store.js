import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reasoningSnapshot } from './src/data/reasoning.js';

export const defaultDatabase = process.env.DP_REASONING_DB
  || path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'reasoning.db');

// The MCP server in mcp-server/ reads this schema; keep column names in sync.
export function openStore(file = defaultDatabase) {
  if (file !== ':memory:') mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS reasoning_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      snapshot TEXT NOT NULL,
      problem_json TEXT NOT NULL,
      answers_json TEXT NOT NULL,
      review_json TEXT,
      verdict TEXT
    );
    CREATE INDEX IF NOT EXISTS reasoning_checks_problem ON reasoning_checks (problem_id, id);
    CREATE TABLE IF NOT EXISTS bank_answers (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      bank_title TEXT NOT NULL,
      question_id TEXT NOT NULL,
      question_json TEXT NOT NULL,
      kind TEXT NOT NULL,
      user_answer TEXT NOT NULL,
      passed INTEGER,
      results_json TEXT
    );
    CREATE INDEX IF NOT EXISTS bank_answers_question ON bank_answers (question_id, created_at);`);
  const insertBank = db.prepare('INSERT INTO bank_answers (id, created_at, bank_title, question_id, question_json, kind, user_answer, passed, results_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  // Older databases predate public_id; add it in place.
  if (!db.prepare('PRAGMA table_info(reasoning_checks)').all().some(column => column.name === 'public_id')) db.exec('ALTER TABLE reasoning_checks ADD COLUMN public_id TEXT');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS reasoning_checks_public ON reasoning_checks (public_id)');
  const insert = db.prepare('INSERT INTO reasoning_checks (created_at, problem_id, snapshot, problem_json, answers_json, public_id) VALUES (?, ?, ?, ?, ?, ?)');
  const update = db.prepare('UPDATE reasoning_checks SET review_json = ?, verdict = ? WHERE id = ?');
  return {
    saveCheck(problem, answers) {
      const { id, title, chapter, prompt, args, state, recurrence } = problem;
      const publicId = randomUUID();
      const { lastInsertRowid } = insert.run(new Date().toISOString(), id, reasoningSnapshot(id, answers),
        JSON.stringify({ id, title, chapter, prompt, args, state, recurrence }), JSON.stringify(answers), publicId);
      return { id: Number(lastInsertRowid), publicId };
    },
    saveReview(checkId, review) { update.run(JSON.stringify(review), review.verdict, checkId); },
    saveBankAnswer({ bankTitle, question, kind, answer, result }) {
      const id = randomUUID();
      insertBank.run(id, new Date().toISOString(), bankTitle, question.id, JSON.stringify(question), kind, answer,
        result ? Number(result.passed) : null, result ? JSON.stringify(result.results) : null);
      return id;
    },
    close() { db.close(); },
  };
}
