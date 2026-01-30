import React from 'react';
import { useStore } from '../context/Store';
import { Undo2 } from 'lucide-react';

export const UndoToast: React.FC = () => {
    const { pendingArchive, undoArchiveTask } = useStore();

    if (!pendingArchive) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-2xl border border-slate-700">
                <span className="text-sm font-medium">Task archived</span>
                <button
                    onClick={undoArchiveTask}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Undo2 className="w-4 h-4" />
                    Undo
                </button>
            </div>
        </div>
    );
};
