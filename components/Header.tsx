import React from 'react';
import { SunIcon, MoonIcon, SquareStackIcon } from './icons';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 p-3 grid grid-cols-[1fr_auto_1fr] items-center sticky top-0 z-50">
            <div className="flex items-center">
                <SquareStackIcon className="w-8 h-8 text-primary-600 flex-shrink-0" />
            </div>
            <div className="text-center">
                <h1 className="text-3xl font-bold text-primary-600 tracking-tight">Gerador de Notificações</h1>
                <p className="text-lg text-neutral-500">Crie e personalize alertas de transações com um design profissional.</p>
            </div>
            <div className="flex items-center justify-end">
                <button 
                    onClick={toggleTheme} 
                    className="p-2 rounded-full text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary-500 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
            </div>
        </header>
    );
};

export default Header;