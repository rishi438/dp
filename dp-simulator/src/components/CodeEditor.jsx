import React, { useRef, useState, useEffect } from 'react';
import { Play, RotateCcw, Undo2, Redo2, Keyboard, CheckCircle2, HelpCircle } from 'lucide-react';

export default function CodeEditor({
  code,
  onChange,
  language = 'python',
  onRun,
  onReset,
  resetPrompt,
  setResetPrompt,
  versions,
  running,
  onCancel
}) {
  const editorRef = useRef(null);
  const gutterRef = useRef(null);

  // History stack for Undo and Redo
  const historyRef = useRef([{ text: code, start: 0, end: 0 }]);
  const historyIndexRef = useRef(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const debounceTimerRef = useRef(null);
  const [activeLine, setActiveLine] = useState(1);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Sync history if external code completely changes (e.g. language/problem switch)
  useEffect(() => {
    if (historyRef.current[historyIndexRef.current]?.text !== code) {
      historyRef.current = [{ text: code, start: 0, end: 0 }];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [language]);

  const updateHistoryButtons = () => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  const pushHistory = (newText, start, end, immediate = false) => {
    if (immediate) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      const updated = historyRef.current.slice(0, historyIndexRef.current + 1);
      updated.push({ text: newText, start, end });
      if (updated.length > 150) updated.shift();
      historyRef.current = updated;
      historyIndexRef.current = updated.length - 1;
      updateHistoryButtons();
    } else {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const updated = historyRef.current.slice(0, historyIndexRef.current + 1);
        updated.push({ text: newText, start, end });
        if (updated.length > 150) updated.shift();
        historyRef.current = updated;
        historyIndexRef.current = updated.length - 1;
        updateHistoryButtons();
      }, 300);
    }
  };

  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const item = historyRef.current[historyIndexRef.current];
      onChange(item.text);
      updateHistoryButtons();
      requestAnimationFrame(() => {
        if (editorRef.current) {
          editorRef.current.setSelectionRange(item.start, item.end);
          updateActiveLine(item.start);
        }
      });
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const item = historyRef.current[historyIndexRef.current];
      onChange(item.text);
      updateHistoryButtons();
      requestAnimationFrame(() => {
        if (editorRef.current) {
          editorRef.current.setSelectionRange(item.start, item.end);
          updateActiveLine(item.start);
        }
      });
    }
  };

  const updateActiveLine = (cursorPos) => {
    const pos = typeof cursorPos === 'number' ? cursorPos : editorRef.current?.selectionStart || 0;
    const line = (code.slice(0, pos).match(/\n/g) || []).length + 1;
    setActiveLine(line);
  };

  const handleInput = (e) => {
    const val = e.target.value;
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    onChange(val);
    pushHistory(val, start, end, false);
    updateActiveLine(start);
  };

  const handleKeyDown = (e) => {
    const isMod = e.ctrlKey || e.metaKey;

    // 1. Run tests: Ctrl+Enter / Cmd+Enter
    if (isMod && e.key === 'Enter') {
      e.preventDefault();
      onRun();
      return;
    }

    // 2. Undo: Ctrl+Z / Cmd+Z (without Shift)
    if (isMod && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }

    // 3. Redo: Ctrl+Y / Cmd+Y OR Ctrl+Shift+Z / Cmd+Shift+Z
    if ((isMod && (e.key === 'y' || e.key === 'Y')) || (isMod && e.shiftKey && (e.key === 'z' || e.key === 'Z'))) {
      e.preventDefault();
      redo();
      return;
    }

    const textarea = editorRef.current;
    if (!textarea) return;
    const { selectionStart: start, selectionEnd: end, value } = textarea;

    // 4. Comment / Uncomment: Ctrl+/ or Cmd+/
    if (isMod && e.key === '/') {
      e.preventDefault();
      const commentToken = language === 'python' ? '# ' : '// ';
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = value.indexOf('\n', end);
      const actualEnd = lineEnd === -1 ? value.length : lineEnd;
      const block = value.slice(lineStart, actualEnd);
      const lines = block.split('\n');

      const allCommented = lines.every(l => l.trim().length === 0 || l.trimStart().startsWith(commentToken.trim()));
      let deltaStart = 0;
      let deltaEnd = 0;
      const newLines = lines.map((l, i) => {
        if (allCommented) {
          const tokenIdx = l.indexOf(commentToken);
          if (tokenIdx !== -1) {
            if (i === 0) deltaStart -= commentToken.length;
            deltaEnd -= commentToken.length;
            return l.slice(0, tokenIdx) + l.slice(tokenIdx + commentToken.length);
          }
          const trimIdx = l.indexOf(commentToken.trim());
          if (trimIdx !== -1) {
            if (i === 0) deltaStart -= commentToken.trim().length;
            deltaEnd -= commentToken.trim().length;
            return l.slice(0, trimIdx) + l.slice(trimIdx + commentToken.trim().length);
          }
          return l;
        } else {
          if (l.trim().length === 0) return l;
          const indentMatch = l.match(/^[ \t]*/) || [''];
          const indent = indentMatch[0];
          const rest = l.slice(indent.length);
          if (i === 0) deltaStart += commentToken.length;
          deltaEnd += commentToken.length;
          return indent + commentToken + rest;
        }
      });

      const newText = value.slice(0, lineStart) + newLines.join('\n') + value.slice(actualEnd);
      const newStart = Math.max(lineStart, start + deltaStart);
      const newEnd = Math.max(newStart, end + deltaEnd);
      onChange(newText);
      pushHistory(newText, newStart, newEnd, true);
      requestAnimationFrame(() => {
        textarea.setSelectionRange(newStart, newEnd);
        updateActiveLine(newStart);
      });
      return;
    }

    // 5. Duplicate Line: Ctrl+D / Cmd+D
    if (isMod && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = value.indexOf('\n', end);
      const actualEnd = lineEnd === -1 ? value.length : lineEnd;
      const block = value.slice(lineStart, actualEnd);
      const newText = value.slice(0, actualEnd) + '\n' + block + value.slice(actualEnd);
      const newPos = start + block.length + 1;
      onChange(newText);
      pushHistory(newText, newPos, newPos, true);
      requestAnimationFrame(() => {
        textarea.setSelectionRange(newPos, newPos);
        updateActiveLine(newPos);
      });
      return;
    }

    // 6. Indent / Dedent: Tab & Shift+Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = value.indexOf('\n', end);
        const actualEnd = lineEnd === -1 ? value.length : lineEnd;
        const block = value.slice(lineStart, actualEnd);
        const lines = block.split('\n');
        let removedFirst = 0;
        let totalRemoved = 0;
        const newLines = lines.map((l, i) => {
          let remove = 0;
          if (l.startsWith('    ')) remove = 4;
          else if (l.startsWith('   ')) remove = 3;
          else if (l.startsWith('  ')) remove = 2;
          else if (l.startsWith(' ')) remove = 1;
          else if (l.startsWith('\t')) remove = 1;
          if (i === 0) removedFirst = remove;
          totalRemoved += remove;
          return l.slice(remove);
        });
        const newText = value.slice(0, lineStart) + newLines.join('\n') + value.slice(actualEnd);
        const newStart = Math.max(lineStart, start - removedFirst);
        const newEnd = Math.max(newStart, end - totalRemoved);
        onChange(newText);
        pushHistory(newText, newStart, newEnd, true);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(newStart, newEnd);
          updateActiveLine(newStart);
        });
      } else {
        if (start !== end && value.slice(start, end).includes('\n')) {
          const lineStart = value.lastIndexOf('\n', start - 1) + 1;
          const lineEnd = value.indexOf('\n', end);
          const actualEnd = lineEnd === -1 ? value.length : lineEnd;
          const lines = value.slice(lineStart, actualEnd).split('\n');
          const indented = lines.map(l => '    ' + l).join('\n');
          const newText = value.slice(0, lineStart) + indented + value.slice(actualEnd);
          const newStart = start + 4;
          const newEnd = end + (lines.length * 4);
          onChange(newText);
          pushHistory(newText, newStart, newEnd, true);
          requestAnimationFrame(() => {
            textarea.setSelectionRange(newStart, newEnd);
            updateActiveLine(newStart);
          });
        } else {
          const newText = value.slice(0, start) + '    ' + value.slice(end);
          onChange(newText);
          pushHistory(newText, start + 4, start + 4, true);
          requestAnimationFrame(() => {
            textarea.setSelectionRange(start + 4, start + 4);
            updateActiveLine(start + 4);
          });
        }
      }
      return;
    }

    // 7. Smart Enter (Auto-Indent)
    if (e.key === 'Enter' && !isMod && !e.altKey) {
      e.preventDefault();
      const before = value.slice(0, start);
      const after = value.slice(end);
      const currentLine = before.split('\n').pop() || '';
      const indentMatch = currentLine.match(/^[ \t]*/);
      let indent = indentMatch ? indentMatch[0] : '';
      const trimmed = currentLine.trimEnd();
      const opensBlock = trimmed.endsWith(':') || trimmed.endsWith('{') || trimmed.endsWith('(') || trimmed.endsWith('[');
      const charBefore = before.slice(-1);
      const charAfter = after.charAt(0);
      const isBetween = (charBefore === '{' && charAfter === '}') || (charBefore === '(' && charAfter === ')') || (charBefore === '[' && charAfter === ']');

      if (isBetween) {
        const extraIndent = indent + '    ';
        const insertion = '\n' + extraIndent + '\n' + indent;
        const newText = before + insertion + after;
        const newPos = start + extraIndent.length + 1;
        onChange(newText);
        pushHistory(newText, newPos, newPos, true);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(newPos, newPos);
          updateActiveLine(newPos);
        });
      } else if (opensBlock) {
        const extraIndent = indent + '    ';
        const insertion = '\n' + extraIndent;
        const newText = before + insertion + after;
        const newPos = start + insertion.length;
        onChange(newText);
        pushHistory(newText, newPos, newPos, true);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(newPos, newPos);
          updateActiveLine(newPos);
        });
      } else {
        const insertion = '\n' + indent;
        const newText = before + insertion + after;
        const newPos = start + insertion.length;
        onChange(newText);
        pushHistory(newText, newPos, newPos, true);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(newPos, newPos);
          updateActiveLine(newPos);
        });
      }
      return;
    }

    // 8. Auto-Closing & Wrapping Pairs
    const PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
    if (PAIRS[e.key] && !isMod && !e.altKey) {
      const open = e.key;
      const close = PAIRS[open];
      if (start !== end) {
        e.preventDefault();
        const selected = value.slice(start, end);
        const newText = value.slice(0, start) + open + selected + close + value.slice(end);
        onChange(newText);
        pushHistory(newText, start + 1, end + 1, true);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(start + 1, end + 1);
          updateActiveLine(start + 1);
        });
        return;
      } else if (open === close && value.charAt(start) === close) {
        e.preventDefault();
        requestAnimationFrame(() => {
          textarea.setSelectionRange(start + 1, start + 1);
          updateActiveLine(start + 1);
        });
        return;
      } else {
        e.preventDefault();
        const newText = value.slice(0, start) + open + close + value.slice(end);
        onChange(newText);
        pushHistory(newText, start + 1, start + 1, true);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(start + 1, start + 1);
          updateActiveLine(start + 1);
        });
        return;
      }
    }

    // 9. Step over closing bracket
    if ([')', ']', '}'].includes(e.key) && !isMod && !e.altKey) {
      if (start === end && value.charAt(start) === e.key) {
        e.preventDefault();
        requestAnimationFrame(() => {
          textarea.setSelectionRange(start + 1, start + 1);
          updateActiveLine(start + 1);
        });
        return;
      }
    }

    // 10. Backspace delete pair
    if (e.key === 'Backspace' && start === end && !isMod && !e.altKey) {
      const prev = value.charAt(start - 1);
      const next = value.charAt(start);
      if (PAIRS[prev] === next) {
        e.preventDefault();
        const newText = value.slice(0, start - 1) + value.slice(start + 1);
        onChange(newText);
        pushHistory(newText, start - 1, start - 1, true);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(start - 1, start - 1);
          updateActiveLine(start - 1);
        });
        return;
      }
    }
  };

  const jumpToLine = (lineNum) => {
    const lines = code.split('\n');
    let offset = 0;
    for (let i = 0; i < lineNum - 1 && i < lines.length; i++) {
      offset += lines[i].length + 1;
    }
    if (editorRef.current) {
      editorRef.current.focus();
      editorRef.current.setSelectionRange(offset, offset);
      setActiveLine(lineNum);
    }
  };

  const lines = code.split('\n');

  return (
    <section className="panel code-editor">
      <div className="editor-toolbar">
        <div className="flex items-center gap-3">
          <strong>solution.{language === 'python' ? 'py' : 'rs'}</strong>
          <span className="text-xs text-emerald-400 font-medium hidden sm:inline">
            ● Full file editable
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          <button
            type="button"
            className="editor-tool-btn"
            disabled={!canUndo}
            onClick={undo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            className="editor-tool-btn"
            disabled={!canRedo}
            onClick={redo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 size={15} />
          </button>
          <button
            type="button"
            className="editor-tool-btn"
            onClick={() => setResetPrompt(true)}
            title="Reset code template"
            aria-label="Reset solution template"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            className={`editor-tool-btn ${showShortcuts ? 'active' : ''}`}
            onClick={() => setShowShortcuts(!showShortcuts)}
            title="Keyboard shortcuts"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard size={15} />
          </button>
        </div>
      </div>

      {resetPrompt && (
        <div className="reset-prompt">
          Reset to default starter template? All current edits will be replaced.{' '}
          <button onClick={onReset}>Reset to default</button>
          <button onClick={() => setResetPrompt(false)}>Keep edits</button>
        </div>
      )}

      {showShortcuts && (
        <div className="shortcuts-modal p-4 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="font-semibold text-slate-100 col-span-full pb-1 border-b border-slate-800 flex justify-between">
            <span>Editor Keyboard Shortcuts</span>
            <button onClick={() => setShowShortcuts(false)} className="text-slate-400 hover:text-slate-200">✕</button>
          </div>
          <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-400">Ctrl+Enter</kbd> : Run test suite</div>
          <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-400">Ctrl+Z</kbd> : Undo change</div>
          <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-400">Ctrl+Y</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-400">Ctrl+Shift+Z</kbd> : Redo</div>
          <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-400">Tab</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-400">Shift+Tab</kbd> : Indent / Dedent</div>
          <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-400">Enter</kbd> : Smart auto-indentation</div>
          <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-400">Ctrl+/</kbd> : Toggle line comment</div>
          <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-400">Ctrl+D</kbd> : Duplicate line</div>
          <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-400">() [] {} "" ''</kbd> : Auto-close & wrap selection</div>
        </div>
      )}

      {/* Screen reader compatibility marker */}
      <span className="sr-only">Read-only test runner</span>

      <div className="editable-code unified-code-pane">
        <div className="editor-gutter" ref={gutterRef} aria-hidden="true">
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const isCurrent = lineNum === activeLine;
            return (
              <div
                key={i}
                className={`gutter-line-item ${isCurrent ? 'active-gutter-line' : ''}`}
                onClick={() => jumpToLine(lineNum)}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        <textarea
          ref={editorRef}
          aria-label="Solution function body"
          value={code}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onKeyUp={e => updateActiveLine(e.currentTarget.selectionStart)}
          onClick={e => updateActiveLine(e.currentTarget.selectionStart)}
          onScroll={e => {
            if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
          }}
          spellCheck="false"
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
        />
      </div>

      <div className="editor-footer">
        <small>
          {versions?.offline
            ? 'Runner offline · start with npm run dev'
            : versions
            ? versions[language] || `${language} not found on PATH`
            : 'Checking local compiler…'}
        </small>
        {running ? (
          <button type="button" onClick={onCancel}>
            Cancel run
          </button>
        ) : (
          <button type="button" className="primary-button" onClick={onRun}>
            <Play size={15} /> Run tests
          </button>
        )}
      </div>
    </section>
  );
}
