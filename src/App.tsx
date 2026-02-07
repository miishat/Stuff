/**
 * @file App.tsx
 * @description Main application component for Stuff - a modern task management application.
 *              This file contains the root App component, settings modal, global modals,
 *              and orchestrates the overall application structure.
 * @author Mishat
 * @version 1.0.3
 */

import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/Store';
import { Sidebar } from './components/Sidebar';
import { Board } from './components/Board';
import { CommandPalette } from './components/CommandPalette';
import { ManageLabelsModal } from './components/ManageLabelsModal';
import { UndoToast } from './components/UndoToast';
import { UpdatePrompt } from './components/UpdatePrompt';
import { X, Moon, Sun, RefreshCw, Tags, Download, Upload, HardDrive, Archive } from 'lucide-react';


/**
 * Fisher-Yates shuffle algorithm for unbiased array randomization.
 * @template T - The type of elements in the array
 * @param {T[]} array - The array to shuffle
 * @returns {T[]} A new shuffled array
 */
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const SettingsModal: React.FC = () => {
    const {
        isSettingsOpen,
        setSettingsOpen,
        theme,
        toggleTheme,
        setManageLabelsOpen,
        exportData,
        importData,
        isAutoBackupEnabled,
        autoBackupStatus,
        enableAutoBackup,
        disableAutoBackup,
        reauthorizeAutoBackup,
        setCurrentView
    } = useStore();

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSettingsOpen(false);
        };
        if (isSettingsOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSettingsOpen, setSettingsOpen]);

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

                    {/* Manage Labels */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Labels</h3>
                        <button
                            onClick={() => {
                                setSettingsOpen(false);
                                setManageLabelsOpen(true);
                            }}
                            className="w-full flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all text-slate-700 dark:text-slate-300"
                        >
                            <Tags className="w-5 h-5" />
                            <span className="text-sm font-medium">Manage Labels</span>
                        </button>
                    </div>

                    {/* Archive */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Archive</h3>
                        <button
                            onClick={() => {
                                setSettingsOpen(false);
                                setCurrentView('archive');
                            }}
                            className="w-full flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all text-slate-700 dark:text-slate-300"
                        >
                            <Archive className="w-5 h-5" />
                            <div className="text-left">
                                <span className="block text-sm font-medium">View Archive</span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">Recover deleted tasks</span>
                            </div>
                        </button>
                    </div>

                    {/* Data & Backup */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Data & Backup</h3>
                        <div className="space-y-3">
                            {/* Auto-Backup Toggle */}
                            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isAutoBackupEnabled ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                        <HardDrive className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Auto-Backup</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                            {isAutoBackupEnabled ? (
                                                autoBackupStatus === 'saving' ? (
                                                    <span className="flex items-center gap-1 text-brand-500"><RefreshCw className="w-3 h-3 animate-spin" /> Saving...</span>
                                                ) : autoBackupStatus === 'permission-needed' ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-orange-500 font-medium">Permission needed</span>
                                                        <button
                                                            onClick={() => reauthorizeAutoBackup()}
                                                            className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded hover:bg-orange-100 font-medium transition-colors"
                                                        >
                                                            Authorize
                                                        </button>
                                                    </div>
                                                ) : autoBackupStatus === 'error' ? (
                                                    <span className="text-red-500">Error saving</span>
                                                ) : (
                                                    'Enabled (local folder)'
                                                )
                                            ) : (
                                                'Disabled'
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isAutoBackupEnabled && autoBackupStatus === 'permission-needed' && (
                                        <button
                                            onClick={() => enableAutoBackup()}
                                            className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded hover:bg-orange-100 font-medium transition-colors"
                                        >
                                            Authorize
                                        </button>
                                    )}
                                    <button
                                        onClick={() => isAutoBackupEnabled ? disableAutoBackup() : enableAutoBackup()}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAutoBackupEnabled ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isAutoBackupEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={exportData}
                                className="w-full flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all text-slate-700 dark:text-slate-300"
                            >
                                <Download className="w-5 h-5" />
                                <div className="text-left">
                                    <span className="block text-sm font-medium">Export Data</span>
                                    <span className="block text-xs text-slate-500 dark:text-slate-400">Save a backup of your workspace</span>
                                </div>
                            </button>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const confirm = window.confirm('This will replace all current data with the backup. Are you sure?');
                                            if (confirm) {
                                                importData(file).catch(err => {
                                                    alert('Failed to import backup ' + err);
                                                });
                                            }
                                        }
                                        e.target.value = ''; // Reset
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <button
                                    className="w-full flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all text-slate-700 dark:text-slate-300 pointer-events-none"
                                >
                                    <Upload className="w-5 h-5" />
                                    <div className="text-left">
                                        <span className="block text-sm font-medium">Import Backup</span>
                                        <span className="block text-xs text-slate-500 dark:text-slate-400">Restore from a JSON file</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 text-center text-xs text-slate-400 dark:text-slate-600 font-mono">
                        <div>Stuff v1.0.3</div>
                        <div className="mt-1">Made by <a href="https://github.com/miishat" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">@Mishat</a></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const GlobalLabelsModal: React.FC = () => {
    const { isManageLabelsOpen, setManageLabelsOpen } = useStore();
    if (!isManageLabelsOpen) return null;
    return <ManageLabelsModal onClose={() => setManageLabelsOpen(false)} />;
}

const GlobalModal: React.FC = () => {
    const { activeModal, closeModal, openModal } = useStore();
    const [inputValue, setInputValue] = useState('');
    const [visibleOptions, setVisibleOptions] = useState<string[] | Record<string, string[]>>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        if (activeModal?.type === 'prompt') {
            setInputValue(activeModal.defaultValue || '');
        }
        if (activeModal?.type === 'options' && activeModal.options) {
            if (Array.isArray(activeModal.options)) {
                // Filter out the current icon (defaultValue) and ensure uniqueness
                const uniqueOptions = Array.from(new Set(activeModal.options));
                const availableOptions = activeModal.defaultValue
                    ? uniqueOptions.filter(opt => opt !== activeModal.defaultValue)
                    : uniqueOptions;

                const shuffled = shuffleArray(availableOptions);
                setVisibleOptions(shuffled.slice(0, 25));
                setSelectedCategory(null);
            } else {
                // Categorized options
                setVisibleOptions(activeModal.options);
                // Select first category by default if none is selected
                if (!selectedCategory && Object.keys(activeModal.options).length > 0) {
                    setSelectedCategory(Object.keys(activeModal.options)[0]);
                }
            }
        }
    }, [activeModal, selectedCategory]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };
        if (activeModal) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeModal, closeModal]);

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
        if (activeModal.options && Array.isArray(activeModal.options)) {
            // Filter out the current icon (defaultValue) and ensure uniqueness
            const uniqueOptions = Array.from(new Set(activeModal.options));
            const availableOptions = activeModal.defaultValue
                ? uniqueOptions.filter(opt => opt !== activeModal.defaultValue)
                : uniqueOptions;

            const shuffled = shuffleArray(availableOptions);
            setVisibleOptions(shuffled.slice(0, 25));
        }
    };

    const handleSelectOption = (option: string) => {
        activeModal.onConfirm(option);
        closeModal();
    };

    const isCategorized = activeModal.type === 'options' && !Array.isArray(activeModal.options);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
            <div className={`relative bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full ${isCategorized ? 'max-w-2xl h-[500px]' : 'max-w-sm'} overflow-hidden animate-in fade-in zoom-in-95 duration-100 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]`}>
                <div className={`flex flex-col h-full overflow-hidden ${isCategorized ? '' : 'p-6'}`}>

                    {/* Header for non-categorized or prompt/confirm types */}
                    {!isCategorized && (
                        <>
                            {activeModal.type !== 'options' && (
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{activeModal.title}</h3>
                            )}
                            {activeModal.message && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{activeModal.message}</p>}
                        </>
                    )}

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
                        isCategorized ? (
                            <div className="flex h-full">
                                {/* Left Sidebar: Categories */}
                                <div className="w-56 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                                    <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                                        {Object.keys(visibleOptions as Record<string, string[]>).map((category) => (
                                            <button
                                                key={category}
                                                onClick={() => setSelectedCategory(category)}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${selectedCategory === category
                                                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300'
                                                    }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Content: Emojis */}
                                <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-dark-surface">


                                    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                                        {selectedCategory && (visibleOptions as Record<string, string[]>)[selectedCategory] ? (
                                            <div className="grid grid-cols-7 gap-2">
                                                {(visibleOptions as Record<string, string[]>)[selectedCategory].map((emoji, index) => (
                                                    <button
                                                        key={`${emoji}-${index}`}
                                                        onClick={() => handleSelectOption(emoji)}
                                                        className="text-2xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center aspect-square"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400">
                                                Select a category
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                                        <button
                                            onClick={() => {
                                                const originalConfirm = activeModal.onConfirm;
                                                openModal({
                                                    type: 'prompt',
                                                    title: 'Custom Icon',
                                                    message: 'Enter any emoji or text (max 2 chars recommended):',
                                                    defaultValue: activeModal.defaultValue,
                                                    confirmLabel: 'Set Icon',
                                                    onConfirm: originalConfirm
                                                });
                                            }}
                                            className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-2"
                                        >
                                            <span>✨</span> Use Custom...
                                        </button>
                                        <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col overflow-hidden">
                                <div className="flex justify-between items-center mb-3 flex-shrink-0">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{activeModal.title}</h3>
                                    <button
                                        onClick={handleShuffle}
                                        className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors px-2 py-1 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Shuffle
                                    </button>
                                </div>
                                <div className="overflow-y-auto p-1 scrollbar-thin">
                                    <div className="grid grid-cols-5 gap-2 mb-4">
                                        {(visibleOptions as string[]).map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => handleSelectOption(option)}
                                                className="text-2xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center aspect-square"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 flex-shrink-0">
                                    <button
                                        onClick={() => {
                                            const originalConfirm = activeModal.onConfirm;
                                            openModal({
                                                type: 'prompt',
                                                title: 'Custom Icon',
                                                message: 'Enter any emoji or text (max 2 chars recommended):',
                                                defaultValue: activeModal.defaultValue,
                                                confirmLabel: 'Set Icon',
                                                onConfirm: originalConfirm
                                            });
                                        }}
                                        className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                                    >
                                        Use Custom...
                                    </button>
                                    <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">Cancel</button>
                                </div>
                            </div>
                        )
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
                <GlobalLabelsModal />
                <UndoToast />
                <UpdatePrompt />
                <Sidebar />
                <div className="flex-1 overflow-hidden relative">
                    <Board />
                </div>
            </div>
        </StoreProvider>
    );
}

export default App;