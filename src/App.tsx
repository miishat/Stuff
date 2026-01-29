import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/Store';
import { Sidebar } from './components/Sidebar';
import { Board } from './components/Board';
import { X, Moon, Sun } from 'lucide-react';

const SettingsModal: React.FC = () => {
    const { isSettingsOpen, setSettingsOpen, theme, toggleTheme } = useStore();

    if (!isSettingsOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSettingsOpen(false)}></div>
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Settings</h2>
                    <button onClick={() => setSettingsOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-8">
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Appearance</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={() => toggleTheme('light')}
                                className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-500' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-600 dark:text-zinc-400'}`}
                            >
                                <Sun className="w-6 h-6" />
                                <span className="text-xs font-semibold">Light</span>
                            </button>
                            <button
                                onClick={() => toggleTheme('dark')}
                                className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-500' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-600 dark:text-zinc-400'}`}
                            >
                                <Moon className="w-6 h-6" />
                                <span className="text-xs font-semibold">Dark</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 text-center text-xs text-zinc-400 dark:text-zinc-600 font-mono">
                        Stuff v1.0.0
                    </div>
                </div>
            </div>
        </div>
    );
}

const GlobalModal: React.FC = () => {
    const { activeModal, closeModal } = useStore();
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (activeModal?.type === 'prompt') {
            setInputValue(activeModal.defaultValue || '');
        }
    }, [activeModal]);

    if (!activeModal) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        activeModal.onConfirm(inputValue);
        closeModal();
    };

    const handleConfirm = () => {
        activeModal.onConfirm();
        closeModal();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-100 border border-zinc-200 dark:border-zinc-800">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">{activeModal.title}</h3>
                    {activeModal.message && <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">{activeModal.message}</p>}

                    {activeModal.type === 'prompt' ? (
                        <form onSubmit={handleSubmit}>
                            <input
                                autoFocus
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none text-zinc-900 dark:text-zinc-100 mb-4"
                            />
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">Cancel</button>
                                <button type="submit" disabled={!inputValue.trim()} className="px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg disabled:opacity-50">
                                    {activeModal.confirmLabel || 'OK'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex gap-3 justify-end mt-6">
                            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">Cancel</button>
                            <button onClick={handleConfirm} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg">
                                {activeModal.confirmLabel || 'Delete'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AppContent: React.FC = () => {
    return (
        <div className="flex h-screen w-screen bg-background dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-300">
            <Sidebar />
            <main className="flex-1 h-full overflow-hidden relative">
                <Board />
            </main>
            <SettingsModal />
            <GlobalModal />
        </div>
    );
}

const App: React.FC = () => {
    return (
        <StoreProvider>
            <AppContent />
        </StoreProvider>
    );
};

export default App;