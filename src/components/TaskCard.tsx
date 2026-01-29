import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Task } from '../types';
import { Calendar, Flag, Tag as TagIcon } from 'lucide-react';

interface TaskCardProps {
    task: Task;
    onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
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
                    {task.labels.map((label, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-[10px] font-medium border border-brand-100 dark:border-brand-800"
                        >
                            <TagIcon className="w-2.5 h-2.5 mr-1" />
                            {label}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer: Due Date */}
            {task.dueDate && (
                <div className="pt-2 border-t border-slate-50 dark:border-slate-800/50">
                    <div className={`flex items-center text-[11px] font-medium ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        <Calendar className="w-3 h-3 mr-1.5" />
                        {new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                </div>
            )}
        </div>
    );
};