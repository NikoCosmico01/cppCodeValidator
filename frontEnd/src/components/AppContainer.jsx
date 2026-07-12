// src/components/AppContainer.jsx
import React, { useEffect, useState } from 'react';
import { checkHealth, getVersion } from '../services/api';
import useCppStore from '../store/codeStore';
import CodeEditor from './CodeEditor';
import SubmissionHistory from './SubmissionHistory';
import '../styles/AppContainer.css';

function AppContainer() {
  const [serverStatus, setServerStatus] = useState('checking');
  const [cppcheck, setCppcheck] = useState({ version: null, missing: false });
  const { fileName, std } = useCppStore();

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        await checkHealth();
        if (cancelled) return;
        setServerStatus('online');
      } catch {
        if (!cancelled) setServerStatus('offline');
        return;
      }

      try {
        const { version } = await getVersion();
        if (!cancelled) setCppcheck({ version, missing: false });
      } catch {
        if (!cancelled) setCppcheck({ version: null, missing: true });
      }
    };

    initialize();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-name">
            cpp<span className="brand-accent">validator</span>
          </span>
          <span className="brand-cursor" aria-hidden="true" />
        </div>

        <div className="header-status">
          {cppcheck.version && (
            <span className="chip chip-version">{cppcheck.version}</span>
          )}
          {cppcheck.missing && (
            <span className="chip chip-missing">cppcheck not found</span>
          )}
          <span className={`chip chip-server ${serverStatus}`}>
            <span className="dot" aria-hidden="true" />
            {serverStatus === 'online'
              ? 'API online'
              : serverStatus === 'offline'
                ? 'API offline'
                : 'connecting…'}
          </span>
        </div>
      </header>

      <div className="command-strip" aria-label="Command that will run on analyze">
        <span className="prompt">$</span>
        <code>
          cppcheck --enable=all --std=<span className="arg">{std}</span>{' '}
          <span className="arg">{fileName}</span>
        </code>
      </div>

      <main className="app-main">
        <CodeEditor serverOnline={serverStatus === 'online'} />
        <SubmissionHistory />
      </main>
    </div>
  );
}

export default AppContainer;
