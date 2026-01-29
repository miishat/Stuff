import React, { useMemo, useState } from 'react';
import { useStore } from '../context/Store';
import { Task } from '../types';
import { CheckCircle2, AlertCircle, Clock, TrendingUp, ChevronDown, Layers, Layout, Globe } from 'lucide-react';

type DashboardScope = 'project' | 'workspace' | 'all';

export const AnalyticsView: React.FC = () => {
    const { tasks, projects, activeProjectId, activeWorkspaceId } = useStore();
    const [scope, setScope] = useState<DashboardScope>('project');
    const [isScopeMenuOpen, setIsScopeMenuOpen] = useState(false);

    // Filter tasks based on selected scope
    const displayTasks = useMemo(() => {
        switch (scope) {
            case 'project':
                return tasks.filter(t => t.projectId === activeProjectId);
            case 'workspace':
                // Get all project IDs in current workspace
                const workspaceProjectIds = new Set(
                    projects.filter(p => p.workspaceId === activeWorkspaceId).map(p => p.id)
                );
                return tasks.filter(t => workspaceProjectIds.has(t.projectId));
            case 'all':
                return tasks;
            default:
                return tasks;
        }
    }, [tasks, scope, activeProjectId, activeWorkspaceId, projects]);

    const stats = useMemo(() => {
        const total = displayTasks.length;
        // Check if task is in a "Done" column
        const isDone = (task: Task) => task.columnId.endsWith('-done');

        const completed = displayTasks.filter(t => isDone(t)).length;
        const todo = total - completed;
        const completionRate = total ? Math.round((completed / total) * 100) : 0;

        const now = new Date();
        const overdue = displayTasks.filter(t => !isDone(t) && t.dueDate && new Date(t.dueDate) < now).length;

        const byPriority = {
            low: displayTasks.filter(t => t.priority === 'Low' && !isDone(t)).length,
            medium: displayTasks.filter(t => t.priority === 'Medium' && !isDone(t)).length,
            high: displayTasks.filter(t => t.priority === 'High' && !isDone(t)).length,
        };

        return { total, completed, todo, completionRate, overdue, byPriority };
    }, [displayTasks]);

    const getScopeLabel = (s: DashboardScope) => {
        switch (s) {
            case 'project': return 'Current Project';
            case 'workspace': return 'Current Workspace';
            case 'all': return 'All Workspaces';
        }
    };

    const getScopeIcon = (s: DashboardScope) => {
        switch (s) {
            case 'project': return <Layout className="w-4 h-4" />;
            case 'workspace': return <Layers className="w-4 h-4" />;
            case 'all': return <Globe className="w-4 h-4" />;
        }
    };

    return (
        <div className="h-full overflow-y-auto p-8 bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400">Overview of your productivity.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Scope Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setIsScopeMenuOpen(!isScopeMenuOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-brand-300 dark:hover:border-brand-600 transition-colors text-sm font-medium"
                            >
                                {getScopeIcon(scope)}
                                <span>{getScopeLabel(scope)}</span>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </button>

                            {isScopeMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsScopeMenuOpen(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1 z-20 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                        {(['project', 'workspace', 'all'] as DashboardScope[]).map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => { setScope(s); setIsScopeMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors
                                                    ${scope === s ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/10' : 'text-slate-700 dark:text-slate-300'}
                                                `}
                                            >
                                                {getScopeIcon(s)}
                                                {getScopeLabel(s)}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Big Completion Rate (Moved here for better layout on mobile) */}
                        <div className="hidden md:block text-right">
                            <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">{stats.completionRate}%</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion</div>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 group hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300">
                        <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="flex items-baseline gap-2 text-lg font-medium text-slate-600 dark:text-slate-300">
                            <span className="font-bold text-slate-900 dark:text-white">{stats.total}</span>
                            Active & Completed
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 group hover:border-green-200 dark:hover:border-green-800 transition-all duration-300">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="flex items-baseline gap-2 text-lg font-medium text-slate-600 dark:text-slate-300">
                            <span className="font-bold text-slate-900 dark:text-white">{stats.completed}</span>
                            Completed
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 group hover:border-red-200 dark:hover:border-red-800 transition-all duration-300">
                        <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 flex-shrink-0 ${stats.overdue > 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="flex items-baseline gap-2 text-lg font-medium text-slate-600 dark:text-slate-300">
                            <span className="font-bold text-slate-900 dark:text-white">{stats.overdue}</span>
                            Tasks require attention
                        </div>
                    </div>
                </div>

                {/* Priority Breakdown & Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Priority Bar Chart (Polished) */}
                    <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-96">
                        <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-slate-400" />
                            Workload by Priority
                        </h3>
                        <div className="flex-1 flex flex-col justify-center gap-6">
                            {/* High Priority */}
                            <div className="group">
                                <div className="flex justify-between text-sm mb-2 font-medium">
                                    <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-500"></div> High Priority
                                    </span>
                                    <span className="text-slate-900 dark:text-white">{stats.byPriority.high} <span className="text-slate-400 font-normal text-xs">tasks</span></span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-1000 ease-out relative"
                                        style={{ width: `${stats.todo ? (stats.byPriority.high / stats.todo) * 100 : 0}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Medium Priority */}
                            <div className="group">
                                <div className="flex justify-between text-sm mb-2 font-medium">
                                    <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-brand-500"></div> Medium Priority
                                    </span>
                                    <span className="text-slate-900 dark:text-white">{stats.byPriority.medium} <span className="text-slate-400 font-normal text-xs">tasks</span></span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-400 to-brand-600 rounded-full transition-all duration-1000 ease-out relative"
                                        style={{ width: `${stats.todo ? (stats.byPriority.medium / stats.todo) * 100 : 0}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[pulse_3s_infinite]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Low Priority */}
                            <div className="group">
                                <div className="flex justify-between text-sm mb-2 font-medium">
                                    <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-400"></div> Low Priority
                                    </span>
                                    <span className="text-slate-900 dark:text-white">{stats.byPriority.low} <span className="text-slate-400 font-normal text-xs">tasks</span></span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${stats.todo ? (stats.byPriority.low / stats.todo) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity / Next Tasks */}
                    <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-96">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-slate-400" />
                            Up Next
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                            {displayTasks
                                .filter(t => !t.columnId.endsWith('-done'))
                                .sort((a, b) => {
                                    if (!a.dueDate) return 1;
                                    if (!b.dueDate) return -1;
                                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                                })
                                .slice(0, 5)
                                .map(task => (
                                    <div key={task.id} className="flex items-center justify-between py-3.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20 rounded-lg px-3 transition-colors group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm ${task.priority === 'High' ? 'bg-orange-500' : task.priority === 'Medium' ? 'bg-brand-500' : 'bg-slate-400'}`} />
                                            <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{task.title}</span>
                                        </div>
                                        {task.dueDate && (
                                            <div className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md flex-shrink-0">
                                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            {displayTasks.filter(t => !t.columnId.endsWith('-done')).length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <CheckCircle2 className="w-10 h-10 mb-3 opacity-20" />
                                    <p className="text-sm">No pending tasks in this view.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
