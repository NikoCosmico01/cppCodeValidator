// src/components/CodeEditor.jsx
import React, { useState, useEffect } from 'react';
import { Play, Copy, Trash2, AlertCircle } from 'lucide-react';
import useCppStore from '../store/codeStore';
import { checkCode, checkHealth } from '../services/api';
import ResultPanel from './ResultPanel';
import '../styles/CodeEditor.css';
import '../styles/ResultPanel.css';

function CodeEditor() {
  const { currentCode, setCurrentCode, addSubmission } = useCppStore();
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('main.cpp');
  const [serverConnected, setServerConnected] = useState(false);

  // Check server connection on mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        await checkHealth();
        setServerConnected(true);
      } catch (err) {
        console.error('Server connection failed:', err);
        setServerConnected(false);
        setError('Cannot connect to API server. Make sure it\'s running on http://localhost:3001');
      }
    };

    checkServer();
  }, []);

  const handleCheck = async () => {
    // Validation
    if (!currentCode.trim()) {
      setError('Please enter some C++ code');
      return;
    }

    if (!serverConnected) {
      setError('API server is not connected. Please start the server.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Sending code for analysis...', { fileName });
      const result = await checkCode(currentCode, fileName);
      
      setLastResult(result);

      // Add to history
      addSubmission({
        code: currentCode,
        fileName,
        result,
        timestamp: new Date(),
        status: !result.results?.errors ? 'success' : 'warning',
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze code');
      setLastResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
  };

  const handleClear = () => {
    setCurrentCode('');
    setLastResult(null);
    setError(null);
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <div className="file-input-group">
          <label htmlFor="fileName">File name:</label>
          <input
            id="fileName"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="main.cpp"
          />
        </div>

        <div className="server-status">
          <span className={`indicator ${serverConnected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">
            {serverConnected ? '✓ Connected' : '✗ Disconnected'}
          </span>
        </div>

        <div className="editor-actions">
          <button 
            onClick={handleCopy} 
            className="btn-secondary" 
            title="Copy code"
            disabled={!currentCode}
          >
            <Copy size={18} />
          </button>
          <button 
            onClick={handleClear} 
            className="btn-secondary" 
            title="Clear code"
            disabled={!currentCode}
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={handleCheck}
            className="btn-primary"
            disabled={loading || !serverConnected || !currentCode.trim()}
            title={!serverConnected ? 'Server not connected' : 'Analyze code'}
          >
            <Play size={18} />
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      <textarea
        value={currentCode}
        onChange={(e) => setCurrentCode(e.target.value)}
        placeholder="Paste your C++ code here..."
        className="code-textarea"
      />

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {lastResult && <ResultPanel result={lastResult} />}
    </div>
  );
}

export default CodeEditor;