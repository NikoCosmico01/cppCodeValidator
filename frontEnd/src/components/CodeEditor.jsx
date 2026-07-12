// src/components/CodeEditor.jsx
import React, { useMemo, useRef, useState } from 'react';
import { Play, Copy, Trash2, AlertCircle } from 'lucide-react';
import useCppStore from '../store/codeStore';
import { checkCode } from '../services/api';
import ResultPanel from './ResultPanel';
import '../styles/CodeEditor.css';

const STDS = ['c++03', 'c++11', 'c++14', 'c++17', 'c++20', 'c++23', 'c99', 'c11'];
const LINE_HEIGHT = 21; // must match --editor-line-height

const SEVERITY_RANK = {
  error: 0,
  warning: 1,
  performance: 2,
  portability: 3,
  style: 4,
  information: 5
};

function CodeEditor({ serverOnline }) {
  const {
    currentCode,
    setCurrentCode,
    fileName,
    setFileName,
    std,
    setStd,
    addSubmission
  } = useCppStore();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const textareaRef = useRef(null);
  const gutterRef = useRef(null);

  const lineCount = Math.max(currentCode.split('\n').length, 1);

  const issueByLine = useMemo(() => {
    const map = new Map();
    for (const issue of result?.issues || []) {
      if (!issue.line) continue;
      const existing = map.get(issue.line);
      if (!existing || SEVERITY_RANK[issue.severity] < SEVERITY_RANK[existing]) {
        map.set(issue.line, issue.severity);
      }
    }
    return map;
  }, [result]);

  const syncGutter = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const jumpToLine = (line) => {
    const textarea = textareaRef.current;
    if (!textarea || !line) return;

    const lines = currentCode.split('\n');
    const start = lines.slice(0, line - 1).join('\n').length + (line > 1 ? 1 : 0);
    const end = start + (lines[line - 1]?.length || 0);

    textarea.focus();
    textarea.setSelectionRange(start, end);
    textarea.scrollTop = Math.max((line - 3) * LINE_HEIGHT, 0);
    syncGutter();
  };

  const handleAnalyze = async () => {
    if (!currentCode.trim() || loading || !serverOnline) return;

    setLoading(true);
    setError(null);

    try {
      const analysis = await checkCode(currentCode, fileName, std);
      setResult(analysis);
      addSubmission({
        code: currentCode,
        fileName: analysis.fileName,
        std,
        summary: analysis.summary
      });
    } catch (err) {
      setError(err.message || 'Analysis failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const next =
        currentCode.slice(0, selectionStart) + '  ' + currentCode.slice(selectionEnd);
      setCurrentCode(next);
      requestAnimationFrame(() => {
        e.target.setSelectionRange(selectionStart + 2, selectionStart + 2);
      });
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const handleClear = () => {
    setCurrentCode('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="editor-column">
      <section className="editor-card" aria-label="Code editor">
        <div className="editor-toolbar">
          <input
            className="file-name-input"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="main.cpp"
            aria-label="File name"
            spellCheck={false}
          />
          <select
            className="std-select"
            value={std}
            onChange={(e) => setStd(e.target.value)}
            aria-label="Language standard"
          >
            {STDS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="toolbar-spacer" />

          <button
            className="btn"
            onClick={() => navigator.clipboard.writeText(currentCode)}
            disabled={!currentCode}
            title="Copy code"
          >
            <Copy size={15} />
          </button>
          <button
            className="btn"
            onClick={handleClear}
            disabled={!currentCode}
            title="Clear editor"
          >
            <Trash2 size={15} />
          </button>
          <button
            className="btn btn-run"
            onClick={handleAnalyze}
            disabled={loading || !serverOnline || !currentCode.trim()}
            title={serverOnline ? 'Run analysis (Ctrl+Enter)' : 'API server offline'}
          >
            <Play size={15} />
            {loading ? 'Analyzing…' : 'Run analysis'}
          </button>
        </div>

        <div className="editor-body">
          <div className="editor-gutter" ref={gutterRef} aria-hidden="true">
            {Array.from({ length: lineCount }, (_, i) => {
              const severity = issueByLine.get(i + 1);
              return (
                <div
                  key={i}
                  className={`gutter-line${severity ? ` sev-${severity}` : ''}`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
          <textarea
            ref={textareaRef}
            className="code-textarea"
            value={currentCode}
            onChange={(e) => setCurrentCode(e.target.value)}
            onScroll={syncGutter}
            onKeyDown={handleKeyDown}
            placeholder={'// Paste or write C++ code here, then press Ctrl+Enter'}
            spellCheck={false}
            wrap="off"
            aria-label="C++ source code"
          />
        </div>
      </section>

      {error && (
        <div className="alert-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {result && <ResultPanel result={result} onJumpToLine={jumpToLine} />}
    </div>
  );
}

export default CodeEditor;
