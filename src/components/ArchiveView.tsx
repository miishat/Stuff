import React from 'react';
import { useStore } from '../context/Store';
import { Archive, RotateCcw, Trash2, Clock } from 'lucide-react';

export const ArchiveView: React.FC = () => {
    const { archivedTasks, restoreTask, permanentlyDeleteTask, openModal } = useStore();

    const handlePermanentDelete = (taskId: string, taskTitle: string) => {
        openModal({
            type: 'confirm',
            title: 'Delete Forever',
            message: `Are you sure you want to permanently delete "${taskTitle}"? This cannot be undone.`,
            confirmLabel: 'Delete Forever',
            onConfirm: () => permanentlyDeleteTask(taskId)
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="h-full overflow-y-auto p-8 bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100">
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <Archive className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Archive</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {archivedTasks.length} {archivedTasks.length === 1 ? 'task' : 'tasks'} archived
                        </p>
                    </div>
                </div>

                {/* Empty State */}
                {archivedTasks.length === 0 && (
                    <div className="text-center py-16">
                        <Archive className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                        <h2 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">No archived tasks</h2>
                        <p className="text-sm text-slate-400 dark:text-slate-500">Deleted tasks will appear here for recovery.</p>
                    </div>
                )}

                {/* Archived Tasks List */}
                <div className="space-y-3">
                    {archivedTasks.map(task => (
                        <div
                            key={task.id}
                            className="group bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-slate-800 dark:text-slate-200 truncate">{task.title}</h3>
                                    {task.description && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                                        <span className={`px-2 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                                task.priority === 'Medium' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                            {task.priority}
                                        </span>
                                        {task.archivedAt && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Archived {formatDate(task.archivedAt)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => restoreTask(task.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/40 text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Restore
                                    </button>
                                    <button
                                        onClick={() => handlePermanentDelete(task.id, task.title)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
