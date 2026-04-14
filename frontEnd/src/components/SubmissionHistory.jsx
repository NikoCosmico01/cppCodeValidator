// src/components/SubmissionHistory.jsx
import React, { useState } from 'react';
import { Trash2, Copy, ChevronDown } from 'lucide-react';
import useCppStore from '../store/codeStore';
import '../styles/SubmissionHistory.css';

function SubmissionHistory() {
  const { submissions, removeSubmission, clearHistory } = useCppStore();
  const [expandedId, setExpandedId] = useState(null);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const handleRemove = (id, e) => {
    e.stopPropagation();
    removeSubmission(id);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const truncateCode = (code, length = 100) => {
    return code.length > length ? code.substring(0, length) + '...' : code;
  };

  return (
    <div className="submission-history">
      <div className="history-header">
        <h2>
          History
          <span className="count">{submissions.length}</span>
        </h2>
        <div className="history-controls">
          <button
            className="btn-clear"
            onClick={() => {
              if (submissions.length > 0) {
                clearHistory();
              }
            }}
            disabled={submissions.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="history-empty">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>No submissions yet</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Check your C++ code to see it here
          </p>
        </div>
      ) : (
        <ul className="history-list">
          {submissions.map((submission) => (
            <li
              key={submission.id}
              className="history-item"
              onClick={() =>
                setExpandedId(expandedId === submission.id ? null : submission.id)
              }
            >
              <div className="history-item-content">
                <div className="history-item-header">
                  <span className="history-item-file">{submission.fileName}</span>
                  <span className="history-item-time">
                    {formatTime(submission.timestamp)}
                  </span>
                  <span className={`history-item-status ${submission.status}`}>
                    {submission.status}
                  </span>
                </div>
                <p className="history-item-preview">
                  {truncateCode(submission.code)}
                </p>

                {expandedId === submission.id && (
                  <div className="history-item-actions">
                    <button
                      className="btn-action btn-copy-code"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCode(submission.code);
                      }}
                      title="Copy code"
                    >
                      <Copy size={14} style={{ marginRight: '0.25rem' }} />
                      Copy
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={(e) => handleRemove(submission.id, e)}
                      title="Delete submission"
                    >
                      <Trash2 size={14} style={{ marginRight: '0.25rem' }} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <ChevronDown
                size={18}
                style={{
                  transform:
                    expandedId === submission.id ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                  color: '#9ca3af',
                  flexShrink: 0,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SubmissionHistory;