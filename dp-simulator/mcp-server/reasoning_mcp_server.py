"""MCP server exposing reasoning checks saved by the DP simulator (read-only)."""
import json
import os
import sqlite3
from pathlib import Path

from mcp.server.fastmcp import FastMCP

DB_PATH = Path(os.environ.get("DP_REASONING_DB") or Path(__file__).resolve().parent.parent / "data" / "reasoning.db")
FIELDS = ("fulcrum", "state", "transition", "base", "termination")

mcp = FastMCP("dp-reasoning-store")


def connect() -> sqlite3.Connection:
    if not DB_PATH.exists():
        raise FileNotFoundError(f"No reasoning database at {DB_PATH}. Click 'Check my reasoning' in the simulator first.")
    conn = sqlite3.connect(f"{DB_PATH.as_uri()}?mode=ro", uri=True, timeout=5)
    conn.row_factory = sqlite3.Row
    return conn


def shape(row: sqlite3.Row, full: bool) -> dict:
    out = {
        "id": row["id"],
        "created_at": row["created_at"],
        "problem_id": row["problem_id"],
        "verdict": row["verdict"] or "not_reviewed",
        "answers": json.loads(row["answers_json"]),
    }
    if full:
        out["problem"] = json.loads(row["problem_json"])
        out["field_order"] = list(FIELDS)
        out["saved_review"] = json.loads(row["review_json"]) if row["review_json"] else None
    return out


@mcp.tool()
def list_problem_ids() -> list[dict]:
    """List exercises that have saved reasoning checks, with attempt counts and last attempt time."""
    with connect() as conn:
        rows = conn.execute(
            "SELECT problem_id, COUNT(*) AS attempts, MAX(created_at) AS last_attempt FROM reasoning_checks "
            "GROUP BY problem_id ORDER BY last_attempt DESC"
        ).fetchall()
    return [dict(r) for r in rows]


@mcp.tool()
def list_reasoning_checks(problem_id: str | None = None, limit: int = 20) -> list[dict]:
    """List saved reasoning checks, newest first. Optionally filter by problem_id (limit 1-100)."""
    limit = max(1, min(int(limit), 100))
    sql, params = "SELECT * FROM reasoning_checks", []
    if problem_id:
        sql += " WHERE problem_id = ?"
        params.append(problem_id)
    with connect() as conn:
        rows = conn.execute(sql + " ORDER BY id DESC LIMIT ?", [*params, limit]).fetchall()
    return [shape(r, full=False) for r in rows]


@mcp.tool()
def get_latest_reasoning_check(problem_id: str | None = None) -> dict:
    """Get the newest saved check with the exercise contract and the five answers to review.
    Omit problem_id for the newest check across all exercises."""
    sql, params = "SELECT * FROM reasoning_checks", []
    if problem_id:
        sql += " WHERE problem_id = ?"
        params.append(problem_id)
    with connect() as conn:
        row = conn.execute(sql + " ORDER BY id DESC LIMIT 1", params).fetchone()
    if row is None:
        return {"error": f"No saved reasoning checks{' for ' + problem_id if problem_id else ''}."}
    return shape(row, full=True)


def bank_table_exists(conn: sqlite3.Connection) -> bool:
    return conn.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='bank_answers'").fetchone() is not None


@mcp.tool()
def get_reasoning_check(check_id: str) -> dict:
    """Get one DP reasoning check by the Submission ID shown after 'Check my reasoning'.
    Returns the exercise (prompt, reference state and recurrence), the five answers and any saved AI review."""
    with connect() as conn:
        columns = {r["name"] for r in conn.execute("PRAGMA table_info(reasoning_checks)")}
        if "public_id" not in columns:
            return {"error": "No reasoning checks with IDs saved yet."}
        row = conn.execute("SELECT * FROM reasoning_checks WHERE public_id = ?", [check_id.strip()]).fetchone()
    if row is None:
        return {"error": f"No reasoning check with ID {check_id}."}
    return {"submission_id": row["public_id"], **shape(row, full=True)}


@mcp.tool()
def get_bank_answer(submission_id: str) -> dict:
    """Get one Question bank submission by the ID shown after Submit / Run tests.
    Returns the question (prompt, model answer, reference solution, tests), the user's answer,
    and test results for code. Compare the user's answer with the model answer."""
    with connect() as conn:
        if not bank_table_exists(conn):
            return {"error": "No Question bank submissions saved yet."}
        row = conn.execute("SELECT * FROM bank_answers WHERE id = ?", [submission_id.strip()]).fetchone()
    if row is None:
        return {"error": f"No submission with ID {submission_id}."}
    question = json.loads(row["question_json"])
    return {
        "id": row["id"],
        "created_at": row["created_at"],
        "bank_title": row["bank_title"],
        "kind": row["kind"],
        "question": {k: question.get(k) for k in ("id", "title", "category", "difficulty", "prompt", "tests")},
        "user_answer": row["user_answer"],
        "model_answer": question.get("answer", ""),
        "reference_solution": question.get("solution", ""),
        "tests_passed": None if row["passed"] is None else bool(row["passed"]),
        "test_results": json.loads(row["results_json"]) if row["results_json"] else None,
    }


@mcp.tool()
def list_bank_answers(question_id: str | None = None, limit: int = 20) -> list[dict]:
    """List recent Question bank submissions (newest first), optionally for one question id (limit 1-100)."""
    limit = max(1, min(int(limit), 100))
    sql, params = "SELECT id, created_at, question_id, kind, passed, question_json FROM bank_answers", []
    if question_id:
        sql += " WHERE question_id = ?"
        params.append(question_id)
    with connect() as conn:
        if not bank_table_exists(conn):
            return []
        rows = conn.execute(sql + " ORDER BY created_at DESC LIMIT ?", [*params, limit]).fetchall()
    return [{"id": r["id"], "created_at": r["created_at"], "question_id": r["question_id"],
             "title": json.loads(r["question_json"]).get("title"), "kind": r["kind"],
             "tests_passed": None if r["passed"] is None else bool(r["passed"])} for r in rows]


if __name__ == "__main__":
    mcp.run()
