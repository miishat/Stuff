import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Task } from '../types';
import { Calendar, Flag, CheckSquare, ChevronDown, ChevronUp, Check, Trash2 } from 'lucide-react';
import { useStore } from '../context/Store';

interface TaskCardProps {
    task: Task;
    onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { toggleSubtask, labels, deleteTask } = useStore();

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { type: 'Task', task },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    const priorityStyles = {
        High: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
        Medium: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        Low: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date(new Date().toDateString());

    // Subtask progress
    const subtasks = task.subtasks || [];
    const completedCount = subtasks.filter(st => st.completed).length;
    const totalCount = subtasks.length;
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleSubtaskToggle = (e: React.MouseEvent, subtaskId: string) => {
        e.stopPropagation();
        toggleSubtask(task.id, subtaskId);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={`
                bg-white dark:bg-slate-900 rounded-xl p-4 cursor-pointer
                border border-slate-100 dark:border-slate-800
                shadow-sm hover:shadow-md dark:shadow-none
                transition-all duration-200
                hover:border-brand-200 dark:hover:border-brand-800
                group
                ${isDragging ? 'opacity-0' : ''}
            `}
        >
            {/* Priority Badge */}
            <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${priorityStyles[task.priority]}`}>
                    <Flag className="w-3 h-3 mr-1" />
                    {task.priority}
                </span>

                {task.ticketLink && (
                    <a
                        href={task.ticketLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-slate-400 hover:text-brand-500 font-mono truncate max-w-[80px]"
                        title={task.ticketLink}
                    >
                        🔗 Link
                    </a>
                )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-2 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {task.title}
            </h3>

            {/* Description Preview */}
            {task.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                    {task.description}
                </p>
            )}

            {/* Labels */}
            {task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {task.labels.map((labelName, index) => {
                        const labelDef = labels.find(l => l.name.toLowerCase() === labelName.toLowerCase());
                        const colorClass = labelDef?.color || 'bg-slate-500';
                        return (
                            <span
                                key={index}
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium text-white ${colorClass}`}
                            >
                                {labelName}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Subtasks Progress */}
            {totalCount > 0 && (
                <div className="mb-3">
                    <button
                        onClick={handleToggleExpand}
                        className="w-full text-left"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                <CheckSquare className="w-3 h-3 mr-1" />
                                <span>{completedCount}/{totalCount}</span>
                                {isExpanded ? (
                                    <ChevronUp className="w-3 h-3 ml-1" />
                                ) : (
                                    <ChevronDown className="w-3 h-3 ml-1" />
                                )}
                            </div>
                            {completedCount === totalCount && (
                                <span className="text-[10px] text-emerald-500 font-medium">Done</span>
                            )}
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${completedCount === totalCount ? 'bg-emerald-500' : 'bg-brand-500'}`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </button>

                    {/* Expanded Subtask List */}
                    {isExpanded && (
                        <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            {subtasks.map(subtask => (
                                <div
                                    key={subtask.id}
                                    onClick={(e) => handleSubtaskToggle(e, subtask.id)}
                                    className="flex items-center gap-2 py-1 px-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                >
                                    <div
                                        className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${subtask.completed
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-slate-300 dark:border-slate-600'
                                            }`}
                                    >
                                        {subtask.completed && <Check className="w-2.5 h-2.5" />}
                                    </div>
                                    <span className={`text-xs ${subtask.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>
                                        {subtask.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Footer: Due Date + Delete */}
            <div className="pt-2 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                {task.dueDate ? (
                    <div className={`flex items-center text-[11px] font-medium ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        <Calendar className="w-3 h-3 mr-1.5" />
                        {new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                ) : (
                    <div></div>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all -mr-1.5"
                    title="Delete Task"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};