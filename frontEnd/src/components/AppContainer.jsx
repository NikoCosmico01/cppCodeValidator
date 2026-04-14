// src/components/AppContainer.jsx
import React, { useEffect, useState } from 'react';
import { checkHealth, getVersion } from '../services/api';  // ✓ Correct names
import CodeEditor from './CodeEditor';
import SubmissionHistory from './SubmissionHistory';
import '../styles/AppContainer.css';

function AppContainer() {
  const [serverStatus, setServerStatus] = useState(null);
  const [version, setVersion] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check server health
        await checkHealth();
        setServerStatus('connected');

        // Get version
        const versionInfo = await getVersion();
        setVersion(versionInfo.version);
      } catch (error) {
        console.error('Initialization error:', error);
        setServerStatus('disconnected');
      }
    };

    initializeApp();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>C++ Code Analyzer</h1>
        <div className="header-info">
          <span className={`status ${serverStatus}`}>
            {serverStatus === 'connected' ? '✓ Connected' : '✗ Disconnected'}
          </span>
          {version && <span className="version">{version}</span>}
        </div>
      </header>

      <main className="app-main">
        <CodeEditor />
        <SubmissionHistory />
      </main>
    </div>
  );
}

export default AppContainer;