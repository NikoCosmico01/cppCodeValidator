// src/components/ResultPanel.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/ResultPanel.css';

function ResultPanel({ result }) {
  const [expanded, setExpanded] = useState(true);

  if (!result) return null;

  const hasErrors = result.results?.errors && result.results.errors.length > 0;
  const hasRawOutput = result.results?.raw && result.results.raw.length > 0;

  return (
    <div className={`result-panel ${!hasErrors ? 'success' : 'warning'}`}>
      <div
        className="result-header"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setExpanded(!expanded);
          }
        }}
      >
        <div className="header-content">
          {!hasErrors ? (
            <CheckCircle size={20} className="icon success" />
          ) : (
            <AlertCircle size={20} className="icon warning" />
          )}
          <h3>Analysis Results</h3>
        </div>
        <div className="header-actions">
          <span className={`status ${!hasErrors ? 'success' : 'warning'}`}>
            {!hasErrors ? '✓ No Issues Found' : '⚠ Issues Detected'}
          </span>
          {expanded ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </div>
      </div>

      {expanded && (
        <div className="result-content">
          <div className="result-info">
            <div className="info-item">
              <span className="label">Exit Code:</span>
              <span className="value">{result.exitCode}</span>
            </div>
            <div className="info-item">
              <span className="label">File:</span>
              <span className="value">{result.fileName || 'N/A'}</span>
            </div>
          </div>

          {hasErrors && (
            <div className="result-section errors">
              <h4>Errors & Warnings</h4>
              <pre className="error-output">{result.results.errors}</pre>
            </div>
          )}

          {hasRawOutput && (
            <details className="result-section raw">
              <summary>Raw XML Output</summary>
              <pre className="raw-output">{result.results.raw}</pre>
            </details>
          )}

          {!hasErrors && !hasRawOutput && (
            <div className="result-section empty">
              <p>✓ Code analysis completed successfully. No issues detected!</p>
            </div>
          )}

          <div className="result-footer">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  hasErrors ? result.results.errors : result.results.raw
                );
              }}
              className="btn-copy"
            >
              Copy Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultPanel;