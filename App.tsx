import React, { useState, useEffect } from 'react';
import { NotificationGenerator } from './components/NotificationGenerator';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 font-sans transition-colors duration-300">
      <div className="absolute inset-0 z-0 opacity-50 dark:opacity-20" style={{backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`, backgroundSize: `16px 16px`}}></div>
      <div className="relative z-10">
        <header className="p-4 sm:p-6 flex justify-between items-center bg-white/50 dark:bg-neutral-900/50 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800 sticky top-0">
          <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Gerador de Notificações</h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Crie e personalize alertas de transações com um design profissional.
              </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-100 dark:focus:ring-offset-neutral-900 focus:ring-primary-500 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>
        <main className="p-4 sm:p-6 md:p-8">
          <NotificationGenerator />
        </main>
      </div>
    </div>
  );
};

export default App;
