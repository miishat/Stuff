import React, { useMemo, useState } from 'react';
import { Task } from '../types';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useStore } from '../context/Store';
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface CalendarViewProps {
    onTaskClick: (task: Task) => void;
}

type CalendarScope = 'project' | 'workspace' | 'all';

// Draggable Task Component
const DraggableTask = ({ task, onClick }: { task: Task; onClick: (task: Task) => void }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { task }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={(e) => {
                if (!isDragging) {
                    onClick(task);
                }
            }}
            className="px-2 py-1.5 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-md text-[11px] font-medium text-brand-700 dark:text-brand-300 truncate hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors touch-none"
            title={task.title}
        >
            {task.title}
        </div>
    );
};

// Droppable Day Component
const DroppableDay = ({ day, children, dateStr }: { day: number | null; children: React.ReactNode; dateStr?: string }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: dateStr || `empty-${Math.random()}`,
        disabled: !day,
        data: { dateStr }
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[120px] p-2 transition-colors ${!day ? 'bg-slate-50/50 dark:bg-slate-900/50' : 'bg-white dark:bg-dark-surface'} ${isOver && day ? 'bg-brand-50/50 dark:bg-brand-900/10 ring-2 ring-inset ring-brand-200 dark:ring-brand-800' : ''}`}
        >
            {children}
        </div>
    );
};

export const CalendarView: React.FC<CalendarViewProps> = ({ onTaskClick }) => {
    const { tasks: allTasks, activeProjectId, activeWorkspaceId, projects, activeProject, priorityFilter, updateTask } = useStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [scope, setScope] = useState<CalendarScope>('project');
    const [isScopeMenuOpen, setIsScopeMenuOpen] = useState(false);
    const [activeDragTask, setActiveDragTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: any) => {
        setActiveDragTask(event.active.data.current?.task || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragTask(null);

        if (over && active) {
            const dateStr = over.data.current?.dateStr;
            const task = active.data.current?.task;

            if (dateStr && task && task.dueDate !== dateStr) {
                updateTask(task.id, { dueDate: dateStr });
            }
        }
    };

    // Compute tasks based on selected scope and priority filter
    const displayTasks = useMemo(() => {
        let tasks = allTasks;

        // Apply Scope Filter
        if (scope === 'workspace') {
            const workspaceProjectIds = new Set(projects.filter(p => p.workspaceId === activeWorkspaceId).map(p => p.id));
            tasks = tasks.filter(t => workspaceProjectIds.has(t.projectId));
        } else if (scope === 'project') {
            tasks = tasks.filter(t => t.projectId === activeProjectId);
        }

        // Apply Priority Filter
        if (priorityFilter) {
            tasks = tasks.filter(t => t.priority === priorityFilter);
        }

        return tasks;
    }, [scope, allTasks, activeProjectId, activeWorkspaceId, projects, priorityFilter]);

    // Optimize task lookup by date to avoid O(N*M) complexity in the render loop
    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        displayTasks.forEach(task => {
            if (task.dueDate) {
                if (!map.has(task.dueDate)) {
                    map.set(task.dueDate, []);
                }
                map.get(task.dueDate)!.push(task);
            }
        });
        return map;
    }, [displayTasks]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const days = [];
    // Fill empty slots for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    // Fill days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const getTasksForDay = (day: number) => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;
        return { tasks: tasksByDate.get(dateStr) || [], dateStr };
    };

    const [expandedDay, setExpandedDay] = useState<number | null>(null);

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-dark-surface overflow-hidden relative">
                {/* Calendar Header */}
                <div className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 bg-slate-50/50 dark:bg-slate-900/50 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 w-48">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>

                        {/* Scope Toggle */}
                        <div className="relative">
                            <button
                                onClick={() => setIsScopeMenuOpen(!isScopeMenuOpen)}
                                className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 transition-all"
                            >
                                <span className="mr-2">
                                    {scope === 'project' ? 'This Project' : scope === 'workspace' ? 'Entire Workspace' : 'All Workspaces'}
                                </span>
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            {isScopeMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsScopeMenuOpen(false)}></div>
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1 z-20 overflow-hidden">
                                        <button onClick={() => { setScope('project'); setIsScopeMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 ${scope === 'project' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                            This Project ({activeProject?.name})
                                        </button>
                                        <button onClick={() => { setScope('workspace'); setIsScopeMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 ${scope === 'workspace' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                            Entire Workspace
                                        </button>
                                        <button onClick={() => { setScope('all'); setIsScopeMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 ${scope === 'all' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                            All Workspaces
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] overflow-hidden">
                    {/* Weekday Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                            {day}
                        </div>
                    ))}

                    {/* Days */}
                    <div className="col-span-7 grid grid-cols-7 auto-rows-fr overflow-y-auto bg-slate-100 dark:bg-slate-900 gap-px border-b border-slate-200 dark:border-slate-800">
                        {days.map((day, index) => {
                            const { tasks: dayTasks, dateStr } = day ? getTasksForDay(day) : { tasks: [], dateStr: undefined };
                            const isToday = day === new Date().getDate() &&
                                currentDate.getMonth() === new Date().getMonth() &&
                                currentDate.getFullYear() === new Date().getFullYear();

                            const MAX_VISIBLE_TASKS = 3;
                            const visibleTasks = dayTasks.slice(0, MAX_VISIBLE_TASKS);
                            const overflowCount = dayTasks.length - MAX_VISIBLE_TASKS;

                            return (
                                <DroppableDay key={index} day={day} dateStr={dateStr}>
                                    {day && (
                                        <>
                                            <div className={`text-xs font-bold mb-2 w-7 h-7 rounded-lg flex items-center justify-center ${isToday
                                                ? 'text-white bg-brand-500 shadow-lg shadow-brand-500/30'
                                                : 'text-slate-400 dark:text-slate-500'
                                                }`}>
                                                {day}
                                            </div>
                                            <div className="space-y-1.5">
                                                {visibleTasks.map(task => (
                                                    <DraggableTask key={task.id} task={task} onClick={onTaskClick} />
                                                ))}
                                                {overflowCount > 0 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setExpandedDay(day);
                                                        }}
                                                        className="w-full text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800 py-1 rounded transition-colors"
                                                    >
                                                        + {overflowCount} more
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </DroppableDay>
                            );
                        })}
                    </div>
                </div>

                {/* Day Preview Modal */}
                {expandedDay && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]" onClick={() => setExpandedDay(null)}>
                        <div
                            className="bg-white dark:bg-dark-surface w-80 max-h-[80%] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100">
                                    {currentDate.toLocaleString('default', { month: 'long' })} {expandedDay}
                                </h3>
                                <button
                                    onClick={() => setExpandedDay(null)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>
                            <div className="p-3 overflow-y-auto space-y-2">
                                {getTasksForDay(expandedDay!).tasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => {
                                            onTaskClick(task);
                                            setExpandedDay(null);
                                        }}
                                        className="px-3 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-sm transition-all flex items-center gap-2"
                                    >
                                        <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' :
                                                task.priority === 'Medium' ? 'bg-amber-500' :
                                                    'bg-emerald-500'
                                            }`} />
                                        <span className="truncate">{task.title}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 text-center">
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                    {getTasksForDay(expandedDay!).tasks.length} tasks total
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <DragOverlay>
                    {activeDragTask ? (
                        <div
                            className="px-2 py-1.5 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-md text-[11px] font-medium text-brand-700 dark:text-brand-300 shadow-xl scale-105 opacity-90 cursor-grabbing"
                        >
                            {activeDragTask.title}
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};