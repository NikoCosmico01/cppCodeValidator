// src/components/SubmissionHistory.jsx
import React, { useState } from 'react';
import { Copy, Trash2, Upload, ChevronDown } from 'lucide-react';
import useCppStore from '../store/codeStore';
import '../styles/SubmissionHistory.css';

const SEVERITY_ORDER = ['error', 'warning', 'performance', 'portability', 'style', 'information'];

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function SubmissionHistory() {
  const { submissions, deleteSubmission, clearHistory, loadSubmission } = useCppStore();
  const [expandedId, setExpandedId] = useState(null);

  return (
    <aside className="history-rail" aria-label="Analysis history">
      <div className="history-header">
        <span className="panel-label">History</span>
        <div className="history-header-right">
          <span className="history-count">{submissions.length}</span>
          <button
            className="btn btn-small"
            onClick={clearHistory}
            disabled={submissions.length === 0}
          >
            Clear all
          </button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="history-empty">
          <p className="empty-comment">{'// nothing analyzed yet'}</p>
        </div>
      ) : (
        <ul className="history-list">
          {submissions.map((submission) => {
            const expanded = expandedId === submission.id;
            const summary = submission.summary || {};
            const clean = (summary.total ?? 0) === 0;

            return (
              <li key={submission.id} className="history-item">
                <button
                  type="button"
                  className="history-item-main"
                  onClick={() => setExpandedId(expanded ? null : submission.id)}
                  aria-expanded={expanded}
                >
                  <span className="history-file">{submission.fileName}</span>
                  <span className="history-time">{formatTime(submission.timestamp)}</span>
                  <span className="history-severities">
                    {clean ? (
                      <span className="history-clean">clean</span>
                    ) : (
                      SEVERITY_ORDER.filter((s) => summary[s] > 0).map((severity) => (
                        <span key={severity} className={`sev-count sev-${severity}`}>
                          ●{summary[severity]}
                        </span>
                      ))
                    )}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`history-chevron${expanded ? ' open' : ''}`}
                    aria-hidden="true"
                  />
                </button>

                <p className="history-preview">
                  {(submission.code || '').split('\n')[0].slice(0, 80) || '(empty)'}
                </p>

                {expanded && (
                  <div className="history-actions">
                    <button
                      className="btn btn-small"
                      onClick={() => loadSubmission(submission.id)}
                      title="Load this code back into the editor"
                    >
                      <Upload size={13} />
                      Load
                    </button>
                    <button
                      className="btn btn-small"
                      onClick={() => navigator.clipboard.writeText(submission.code || '')}
                      title="Copy code"
                    >
                      <Copy size={13} />
                      Copy
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => deleteSubmission(submission.id)}
                      title="Delete from history"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

export default SubmissionHistory;
