import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/Store';
import { Sidebar } from './components/Sidebar';
import { Board } from './components/Board';
import { CommandPalette } from './components/CommandPalette';
import { X, Moon, Sun, RefreshCw } from 'lucide-react';


// Helper for unbiased shuffling (Fisher-Yates)
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const SettingsModal: React.FC = () => {
    const { isSettingsOpen, setSettingsOpen, theme, toggleTheme } = useStore();

    if (!isSettingsOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSettingsOpen(false)}></div>
            <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Settings</h2>
                    <button onClick={() => setSettingsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-8">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Appearance</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={() => toggleTheme('light')}
                                className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-500' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'}`}
                            >
                                <Sun className="w-6 h-6" />
                                <span className="text-xs font-semibold">Light</span>
                            </button>
                            <button
                                onClick={() => toggleTheme('dark')}
                                className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-500' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'}`}
                            >
                                <Moon className="w-6 h-6" />
                                <span className="text-xs font-semibold">Dark</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 text-center text-xs text-slate-400 dark:text-slate-600 font-mono">
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
    const [visibleOptions, setVisibleOptions] = useState<string[]>([]);

    useEffect(() => {
        if (activeModal?.type === 'prompt') {
            setInputValue(activeModal.defaultValue || '');
        }
        if (activeModal?.type === 'options' && activeModal.options) {
            // Filter out the current icon (defaultValue) and ensure uniqueness
            const uniqueOptions = Array.from(new Set(activeModal.options));
            const availableOptions = activeModal.defaultValue
                ? uniqueOptions.filter(opt => opt !== activeModal.defaultValue)
                : uniqueOptions;

            const shuffled = shuffleArray(availableOptions);
            setVisibleOptions(shuffled.slice(0, 25));
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

    const handleShuffle = () => {
        if (activeModal.options) {
            // Filter out the current icon (defaultValue) and ensure uniqueness
            const uniqueOptions = Array.from(new Set(activeModal.options));
            const availableOptions = activeModal.defaultValue
                ? uniqueOptions.filter(opt => opt !== activeModal.defaultValue)
                : uniqueOptions;

            const shuffled = shuffleArray(availableOptions);
            setVisibleOptions(shuffled.slice(0, 25));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
            <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-100 border border-slate-200 dark:border-slate-800">
                <div className="p-6">
                    {activeModal.type !== 'options' && (
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{activeModal.title}</h3>
                    )}
                    {activeModal.message && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{activeModal.message}</p>}

                    {activeModal.type === 'prompt' ? (
                        <form onSubmit={handleSubmit}>
                            <input
                                autoFocus
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-900 dark:text-slate-100 mb-4"
                            />
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">Cancel</button>
                                <button type="submit" disabled={!inputValue.trim()} className="px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg disabled:opacity-50">
                                    {activeModal.confirmLabel || 'OK'}
                                </button>
                            </div>
                        </form>
                    ) : activeModal.type === 'options' ? (
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{activeModal.title}</h3>
                                <button
                                    onClick={handleShuffle}
                                    className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors px-2 py-1 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Shuffle
                                </button>
                            </div>
                            <div className="grid grid-cols-5 gap-2 mb-4">
                                {visibleOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            activeModal.onConfirm(option);
                                            closeModal();
                                        }}
                                        className="text-2xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center aspect-square"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-3 justify-end mt-6">
                            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">Cancel</button>
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

function App() {
    return (
        <StoreProvider>
            <div className="flex h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 font-sans selection:bg-brand-200 dark:selection:bg-brand-900 selection:text-brand-900 dark:selection:text-brand-100 overflow-hidden transition-colors duration-200">
                <CommandPalette />
                <GlobalModal />
                <SettingsModal />
                <Sidebar />
                <div className="flex-1 overflow-hidden relative">
                    <Board />
                </div>
            </div>
        </StoreProvider>
    );
}

export default App;