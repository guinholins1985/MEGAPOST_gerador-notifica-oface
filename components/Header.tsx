import React from 'react';
import { SunIcon, MoonIcon, SquareStackIcon } from './icons';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
    return (
        <header className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 p-3 grid grid-cols-[1fr_auto_1fr] items-center sticky top-0 z-50">
            <div className="flex items-center">
                <SquareStackIcon className="w-8 h-8 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            </div>
            <div className="text-center">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Gerador de Notificações</h1>
                <p className="text-base text-neutral-500 dark:text-neutral-400">Crie e personalize alertas de transações com um design profissional.</p>
            </div>
            <div className="flex items-center justify-end">
                <button 
                    onClick={toggleTheme} 
                    className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-100 dark:focus:ring-offset-neutral-900 focus:ring-primary-500 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
            </div>
        </header>
    );
};

export default Header;