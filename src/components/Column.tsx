/**
 * @file Column.tsx
 * @description Kanban column component for the Stuff application.
 *              Renders a droppable column with header, task list, and add task button.
 *              Supports inline editing of column titles and deletion.
 * @author Mishat
 * @version 1.0.2
 */

import React, { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ColumnConfig, Task } from '../types';
import { TaskCard } from './TaskCard';
import { Plus, Trash } from 'lucide-react';
import { useStore } from '../context/Store';

/**
 * Props for the Column component.
 */
interface ColumnProps {
    config: ColumnConfig;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    onAddTask: () => void;
}

export const Column: React.FC<ColumnProps> = ({ config, tasks, onTaskClick, onAddTask }) => {
    const { updateColumn, deleteColumn, openModal } = useStore();
    const { setNodeRef, isOver } = useDroppable({
        id: config.id,
        data: { type: 'Column', columnId: config.id },
    });

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(config.title);
    const inputRef = useRef<HTMLInputElement>(null);

    const isVirtual = config.projectId === 'virtual';

    useEffect(() => {
        setTitle(config.title);
    }, [config.title]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleTitleSubmit = () => {
        if (title.trim() !== '') {
            updateColumn(config.id, title);
        } else {
            setTitle(config.title); // Revert if empty
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleTitleSubmit();
        if (e.key === 'Escape') {
            setTitle(config.title);
            setIsEditing(false);
        }
    };

    const handleDeleteColumn = () => {
        openModal({
            type: 'confirm',
            title: 'Delete Section',
            message: 'Are you sure you want to delete this section and all its tasks?',
            confirmLabel: 'Delete Section',
            onConfirm: () => deleteColumn(config.id)
        });
    };

    return (
        <div
            ref={setNodeRef}
            className={`
        flex-shrink-0 w-80 flex flex-col h-full max-h-full rounded-2xl transition-all duration-300
        ${isOver ? 'bg-brand-50/50 dark:bg-brand-900/10 ring-2 ring-brand-500/20' : 'bg-transparent'}
      `}
        >
            {/* Column Header */}
            <div className="px-1 py-3 flex items-center justify-between group">
                <div className="flex items-center gap-2.5 flex-1">
                    <div className={`w-3 h-3 rounded-md shadow-sm ${config.color.split(' ')[0]}`}></div>

                    {isEditing && !isVirtual ? (
                        <input
                            ref={inputRef}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleSubmit}
                            onKeyDown={handleKeyDown}
                            className="text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-brand-300 rounded px-2 py-0.5 w-full focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                    ) : (
                        <h2
                            onDoubleClick={() => !isVirtual && setIsEditing(true)}
                            className={`text-sm font-bold text-slate-700 dark:text-slate-200 truncate tracking-tight transition-colors ${!isVirtual ? 'cursor-text hover:text-brand-600' : 'cursor-default'}`}
                            title={!isVirtual ? "Double click to edit" : undefined}
                        >
                            {config.title}
                            {isVirtual && <span className="ml-2 text-[10px] font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Aggregate</span>}
                        </h2>
                    )}

                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                        {tasks.length}
                    </span>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                    {!isVirtual && (
                        <button
                            onClick={handleDeleteColumn}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete Column"
                        >
                            <Trash className="w-4 h-4 pointer-events-none" />
                        </button>
                    )}
                    <button
                        onClick={onAddTask}
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-brand-600 shadow-sm transition-all hover:shadow-md"
                        title="Add Task"
                    >
                        <Plus className="w-4 h-4 pointer-events-none" />
                    </button>
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto px-1 pb-4 space-y-3 scrollbar-hide">
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                ))}

                {tasks.length === 0 && (
                    <button
                        onClick={onAddTask}
                        className="w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all group"
                    >
                        <Plus className="w-6 h-6 mb-2 text-slate-300 dark:text-slate-700 group-hover:text-brand-500 transition-colors" />
                        <span className="text-xs font-medium">Add Task</span>
                    </button>
                )}
            </div>
        </div>
    );
};