/**
 * @file Board.tsx
 * @description Main kanban board component for the Stuff application.
 *              Handles drag-and-drop task management, view switching between
 *              board/calendar/analytics views, and task filtering.
 * @author Mishat
 * @version 1.0.2
 */

import React, { useState, useMemo } from 'react';
import { useStore } from '../context/Store';
import { Column } from './Column';
import { ColumnId, Priority, Task } from '../types';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, useSensor, useSensors, PointerSensor, closestCorners } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';
import { TaskDetail } from './TaskDetail';
import { CalendarView } from './CalendarView';
import { AnalyticsView } from './AnalyticsView';
import { ArchiveView } from './ArchiveView';
import { Search, Filter, Kanban, Calendar as CalendarIcon, Plus, ChevronRight, BarChart3 } from 'lucide-react';

/**
 * Board component - Main content area for task management.
 * Supports drag-and-drop, filtering, and multiple view modes.
 */
export const Board: React.FC = () => {
    const {
        filteredTasks,
        columns, // All columns (needed for lookup)
        filteredColumns, // Display columns (can be virtual)
        activeProject,
        activeWorkspace, // Added activeWorkspace
        moveTask,
        addTask,
        addColumn,
        searchQuery,
        setSearchQuery,
        toggleSidebar,
        isSidebarOpen,
        currentView,
        setCurrentView,
        priorityFilter,
        setPriorityFilter,
        viewFilter,
        customViews,
        tasks
    } = useStore();

    const [activeTaskId, setActiveTaskId] = useState<string | null>(null); // For Drag Overlay
    const [detailTaskId, setDetailTaskId] = useState<string | null>(null); // For Side Peek
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveTaskId(active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTaskId(null);

        if (!over) return;

        const taskId = active.id as string;
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const overId = over.id as string;

        // SCENARIO 1: Dropped on a Virtual Column (Aggregate View)
        if (overId.startsWith('virtual-')) {
            const targetTitle = overId.replace('virtual-', '');

            // Find a column in the task's project that matches this title
            const targetColumn = columns.find(c => c.projectId === task.projectId && c.title === targetTitle);

            if (targetColumn) {
                moveTask(taskId, targetColumn.id);
            } else {
                console.warn(`Project ${task.projectId} does not have column "${targetTitle}"`);
            }
            return;
        }

        // SCENARIO 2: Dropped on a specific Column (Project View)
        if (columns.some(c => c.id === overId)) {
            moveTask(taskId, overId as ColumnId);
            return;
        }

        // SCENARIO 3: Dropped on another Task
        const overTask = filteredTasks.find(t => t.id === overId);
        if (overTask) {
            // Find the title of the column the 'overTask' is in
            const overTaskColumn = columns.find(c => c.id === overTask.columnId);
            if (overTaskColumn) {
                // Find corresponding column in active task's project
                const targetColumn = columns.find(c =>
                    c.projectId === task.projectId &&
                    c.title === overTaskColumn.title
                );

                if (targetColumn) {
                    moveTask(taskId, targetColumn.id);
                }
            }
        }
    };

    const handleAddNewTask = (columnId: ColumnId) => {
        // Determine context for new task
        const projectId = activeProject ? activeProject.id : (filteredTasks[0]?.projectId || 'p1');

        // Default values
        let initialPriority: Priority = 'Medium';
        let initialLabels: string[] = [];

        // If we are in a custom view, inherit the view's filter properties
        const activeCustomView = customViews.find(v => v.id === viewFilter);
        if (activeCustomView) {
            if (activeCustomView.filterType === 'priority') {
                const p = activeCustomView.filterValue as Priority;
                if (['Low', 'Medium', 'High'].includes(p)) {
                    initialPriority = p;
                }
            } else if (activeCustomView.filterType === 'label') {
                if (Array.isArray(activeCustomView.filterValue)) {
                    initialLabels.push(...activeCustomView.filterValue);
                } else {
                    initialLabels.push(activeCustomView.filterValue);
                }
            }
        }

        // If adding to a virtual column, find the real column for the project
        let targetColumnId = columnId;
        if (columnId.startsWith('virtual-')) {
            const targetTitle = columnId.replace('virtual-', '');
            const realCol = columns.find(c => c.projectId === projectId && c.title === targetTitle);
            if (realCol) {
                targetColumnId = realCol.id;
            } else {
                // Fallback or create? For now fallback to first column of project
                const firstCol = columns.find(c => c.projectId === projectId);
                if (firstCol) targetColumnId = firstCol.id;
            }
        }

        const newTask = {
            id: `t${Date.now()}`,
            projectId: projectId,
            title: 'Untitled Task',
            description: '',
            priority: initialPriority,
            columnId: targetColumnId,
            assignees: [],
            labels: initialLabels
        };
        addTask(newTask);
        setTimeout(() => setDetailTaskId(newTask.id), 10);
    };

    const activeTask = activeTaskId ? filteredTasks.find(t => t.id === activeTaskId) : null;

    const tasksMap = useMemo(() => {
        const byId: Record<string, Task[]> = {};
        const byTitle: Record<string, Task[]> = {};

        // Pre-compute map from columnId to columnTitle
        const colIdToTitle: Record<string, string> = {};
        columns.forEach(c => {
            colIdToTitle[c.id] = c.title;
        });

        filteredTasks.forEach(t => {
            // Group by ID
            if (!byId[t.columnId]) byId[t.columnId] = [];
            byId[t.columnId].push(t);

            // Group by Title
            const title = colIdToTitle[t.columnId];
            if (title) {
                if (!byTitle[title]) byTitle[title] = [];
                byTitle[title].push(t);
            }
        });

        return { byId, byTitle };
    }, [filteredTasks, columns]);

    let viewTitle = 'Tasks';
    let viewIcon = '📋';

    if (viewFilter === 'my_tasks') {
        viewTitle = 'My Tasks';
        viewIcon = '👤';
    } else if (viewFilter === 'recent') {
        viewTitle = 'Recent Tasks';
        viewIcon = '🕒';
    } else if (viewFilter === 'project') {
        viewTitle = activeProject?.name || 'Project';
        viewIcon = activeProject?.icon || '🚀';
    } else {
        const customView = customViews.find(v => v.id === viewFilter);
        if (customView) {
            viewTitle = customView.name;
            viewIcon = customView.filterType === 'priority' ? '🚩' : '🏷️';
        }
    }

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-dark-bg relative transition-colors duration-500">
            {/* Background Mesh */}
            <div className="absolute inset-0 bg-mesh opacity-[0.03] dark:opacity-30 pointer-events-none"></div>

            {/* Top Bar */}
            <header className="h-20 flex items-center justify-between px-6 z-20 flex-shrink-0 relative">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-600"
                        title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    >
                        <div className="relative w-5 h-5 flex flex-col justify-center items-center gap-1">
                            <span className={`block h-0.5 bg-slate-500 dark:bg-slate-400 rounded-full transition-all duration-300 ${isSidebarOpen ? 'w-5' : 'w-5'}`}></span>
                            <span className={`block h-0.5 bg-slate-500 dark:bg-slate-400 rounded-full transition-all duration-300 ${isSidebarOpen ? 'w-3 -translate-x-1' : 'w-5'}`}></span>
                            <span className={`block h-0.5 bg-slate-500 dark:bg-slate-400 rounded-full transition-all duration-300 ${isSidebarOpen ? 'w-4 -translate-x-0.5' : 'w-5'}`}></span>
                        </div>
                    </button>

                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50 mr-3 text-xl">
                            {viewIcon}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                {activeWorkspace?.name || 'Workspace'} <ChevronRight className="w-3 h-3 mx-1" />
                            </div>
                            <h1 className="font-bold text-xl text-slate-800 dark:text-slate-100 tracking-tight">
                                {viewTitle}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl mr-2">
                        <button
                            onClick={() => setCurrentView('board')}
                            className={`flex items-center px-4 py-2 text-xs font-bold rounded-lg transition-all ${currentView === 'board' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            <Kanban className="w-4 h-4 mr-2" />
                            Board
                        </button>
                        <button
                            onClick={() => setCurrentView('calendar')}
                            className={`flex items-center px-4 py-2 text-xs font-bold rounded-lg transition-all ${currentView === 'calendar' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Calendar
                        </button>
                        <button
                            onClick={() => setCurrentView('analytics')}
                            className={`flex items-center px-4 py-2 text-xs font-bold rounded-lg transition-all ${currentView === 'analytics' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics
                        </button>
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block"></div>

                    <div className="relative group">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-brand-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-40 focus:w-60 transition-all duration-300 placeholder-slate-400 text-slate-700 dark:text-slate-200 shadow-sm"
                        />
                    </div>

                    {/* Add Section Button (Moved to Header) - Only for Project View */}
                    {viewFilter === 'project' && currentView === 'board' && (
                        <button
                            onClick={addColumn}
                            className="p-2.5 rounded-xl transition-all border shadow-sm bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-600"
                            title="Add New Section"
                        >
                            <Plus className="w-4.5 h-4.5" />
                        </button>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`p-2.5 rounded-xl transition-all border shadow-sm ${priorityFilter || isFilterOpen ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            title="Filter"
                        >
                            <Filter className="w-4.5 h-4.5" />
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Filter by Priority</div>
                                <button
                                    onClick={() => { setPriorityFilter(null); setIsFilterOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex justify-between items-center transition-colors font-medium"
                                >
                                    All Tasks
                                    {!priorityFilter && <span className="flex h-2 w-2 rounded-full bg-brand-500"></span>}
                                </button>
                                {['High', 'Medium', 'Low'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => { setPriorityFilter(p); setIsFilterOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex justify-between items-center transition-colors font-medium"
                                    >
                                        {p} Priority
                                        {priorityFilter === p && <span className="flex h-2 w-2 rounded-full bg-brand-500"></span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {isFilterOpen && <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>}
                </div>
            </header>

            {/* Main Content Area */}
            {currentView === 'board' ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex-1 overflow-x-auto overflow-y-hidden pt-2">
                        <div className="h-full flex px-6 pb-6 space-x-6 min-w-max">
                            {filteredColumns.map(col => {
                                let columnTasks: Task[] = [];
                                if (col.id.startsWith('virtual-')) {
                                    const title = col.title;
                                    columnTasks = tasksMap.byTitle[title] || [];
                                } else {
                                    columnTasks = tasksMap.byId[col.id] || [];
                                }

                                return (
                                    <Column
                                        key={col.id}
                                        config={col}
                                        tasks={columnTasks}
                                        onTaskClick={(t) => setDetailTaskId(t.id)}
                                        onAddTask={() => handleAddNewTask(col.id)}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <DragOverlay dropAnimation={{
                        duration: 200,
                        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                    }}>
                        {activeTask ? (
                            <div className="transform rotate-2 cursor-grabbing scale-105 opacity-95">
                                <div className="shadow-2xl rounded-xl">
                                    <TaskCard task={activeTask} onClick={() => { }} />
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            ) : currentView === 'calendar' ? (
                <div className="flex-1 overflow-hidden p-6 pt-0">
                    <div className="h-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
                        <CalendarView onTaskClick={(t) => setDetailTaskId(t.id)} />
                    </div>
                </div>
            ) : currentView === 'analytics' ? (
                <div className="flex-1 overflow-hidden">
                    <AnalyticsView />
                </div>
            ) : currentView === 'archive' ? (
                <div className="flex-1 overflow-hidden">
                    <ArchiveView />
                </div>
            ) : null}

            {/* Task Detail Modal */}
            {detailTaskId && (
                <TaskDetail
                    taskId={detailTaskId}
                    onClose={() => setDetailTaskId(null)}
                />
            )}
        </div>
    );
};
