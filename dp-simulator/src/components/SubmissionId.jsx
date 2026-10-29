import React, { useState } from 'react';

// Shows the saved-submission UUID so it can be pasted into Copilot Chat (read through the MCP server).
export default function SubmissionId({ saved, what = 'answer' }) {
  const [copied, setCopied] = useState(false);
  if (!saved) return null;
  if (saved.error) return <p className="error-text submission-id">Not saved for review: {saved.error}</p>;
  if (saved.pending) return <p className="submission-id">Saving for review…</p>;
  return <p className="submission-id">Submission ID <code>{saved.id}</code>
    <button type="button" onClick={() => navigator.clipboard?.writeText(saved.id).then(() => setCopied(true))}>{copied ? 'Copied' : 'Copy'}</button>
    <small>Paste this ID in Copilot Chat to have your {what} compared with the model answer.</small></p>;
}
