// src/App.js
import { useState, useEffect } from 'react';
import AppContainer from './components/AppContainer';
import './styles/index.css';

function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      setTheme('dark');
    }
  }, []);

  return (
    <div className={`app ${theme}-theme`}>
      <AppContainer />
    </div>
  );
}

export default App;