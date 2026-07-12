// src/components/ResultPanel.jsx
import React from 'react';
import { CheckCircle } from 'lucide-react';
import '../styles/ResultPanel.css';

const SEVERITY_ORDER = ['error', 'warning', 'performance', 'portability', 'style', 'information'];

function ResultPanel({ result, onJumpToLine }) {
  if (!result) return null;

  const issues = result.issues || [];
  const summary = result.summary || { total: issues.length };
  const clean = summary.total === 0;

  const presentSeverities = SEVERITY_ORDER.filter((s) => summary[s] > 0);

  return (
    <section className="result-panel" aria-label="Analysis results">
      <div className="result-header">
        <span className="panel-label">Diagnostics</span>
        {clean ? (
          <span className="clean-chip">
            <CheckCircle size={14} />
            clean
          </span>
        ) : (
          <div className="severity-chips">
            {presentSeverities.map((severity) => (
              <span key={severity} className={`sev-chip sev-${severity}`}>
                {summary[severity]} {severity}
              </span>
            ))}
          </div>
        )}
      </div>

      {!clean && (
        <div className="severity-spectrum" aria-hidden="true">
          {presentSeverities.map((severity) => (
            <span
              key={severity}
              className={`spectrum-segment sev-bg-${severity}`}
              style={{ flexGrow: summary[severity] }}
            />
          ))}
        </div>
      )}

      {clean ? (
        <p className="clean-message">
          No issues found — cppcheck came back clean for {result.fileName} ({result.std}).
        </p>
      ) : (
        <ul className="diagnostics-list">
          {issues.map((issue, index) => (
            <li key={index}>
              <button
                type="button"
                className="diagnostic-row"
                onClick={() => issue.line && onJumpToLine?.(issue.line)}
                disabled={!issue.line}
                title={issue.verbose || undefined}
              >
                <span className="diag-location">
                  {issue.file || result.fileName}
                  {issue.line ? `:${issue.line}` : ''}
                  {issue.column ? `:${issue.column}` : ''}:
                </span>{' '}
                <span className={`diag-severity sev-${issue.severity}`}>
                  {issue.severity}:
                </span>{' '}
                <span className="diag-message">{issue.message}</span>{' '}
                <span className="diag-id">[{issue.id}]</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {result.raw && (
        <details className="raw-details">
          <summary>Raw XML report</summary>
          <pre>{result.raw}</pre>
        </details>
      )}
    </section>
  );
}

export default ResultPanel;
