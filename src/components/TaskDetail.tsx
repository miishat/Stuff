/**
 * @file TaskDetail.tsx
 * @description Task detail side panel component for the Stuff application.
 *              Provides full task editing including title, description (rich text),
 *              priority, due date, labels, ticket links, and subtasks.
 * @author Mishat
 * @version 1.0.2
 */

import React, { useEffect, useState, useRef } from 'react';
import { Priority } from '../types';
import { X, Calendar, Flag, AlignLeft, Link as LinkIcon, ExternalLink, Tag, Plus, Trash2, CheckSquare, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { useStore } from '../context/Store';
import { CustomDatePicker } from './CustomDatePicker';
import { RichTextEditor } from './RichTextEditor';

/**
 * Props for the TaskDetail component.
 */
interface TaskDetailProps {
    /** ID of the task to display, or null if no task selected */
    taskId: string | null;
    /** Callback to close the detail panel */
    onClose: () => void;
}

/**
 * TaskDetail component - Side panel for viewing and editing task details.
 */
export const TaskDetail: React.FC<TaskDetailProps> = ({ taskId, onClose }) => {
    const { tasks, updateTask, deleteTask, projects, openModal, addSubtask, toggleSubtask, deleteSubtask, reorderSubtasks, labels: storeLabels, addLabel: addLabelToStore } = useStore();
    const task = tasks.find(t => t.id === taskId);
    const project = projects.find(p => p.id === task?.projectId);
    const [labelInput, setLabelInput] = useState('');
    const [showLabelSuggestions, setShowLabelSuggestions] = useState(false);
    const [subtaskInput, setSubtaskInput] = useState('');
    const labelInputRef = useRef<HTMLInputElement>(null);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Handle outside click for label suggestions
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (labelInputRef.current && !labelInputRef.current.contains(e.target as Node)) {
                setShowLabelSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!task || !taskId) return null;

    // Use defined labels from store for suggestions, fallback to task labels
    const allDefinedLabels = storeLabels.map(l => l.name);
    const allLabels = Array.from(new Set([...allDefinedLabels, ...tasks.flatMap(t => t.labels)])).sort();
    const filteredSuggestions = allLabels.filter(l =>
        l.toLowerCase().includes(labelInput.toLowerCase()) &&
        !task.labels.includes(l)
    );

    const handlePriorityChange = (p: Priority) => {
        updateTask(taskId, { priority: p });
    };

    const addLabel = (labelName: string) => {
        const trimmed = labelName.trim();
        if (trimmed && !task.labels.some(l => l.toLowerCase() === trimmed.toLowerCase())) {
            updateTask(taskId, { labels: [...task.labels, trimmed] });
            // Auto-add to store labels if not already defined
            const existsInStore = storeLabels.some(l => l.name.toLowerCase() === trimmed.toLowerCase());
            if (!existsInStore) {
                addLabelToStore(trimmed, 'bg-slate-500'); // Default color
            }
        }
        setLabelInput('');
        setShowLabelSuggestions(false);
    };

    const handleAddLabel = () => {
        if (labelInput.trim()) {
            addLabel(labelInput);
        }
    };

    const handleRemoveLabel = (labelToRemove: string) => {
        updateTask(taskId, { labels: task.labels.filter(l => l !== labelToRemove) });
    };

    const handleLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddLabel();
        }
    };

    const handleDateQuickSelect = (daysFromNow: number) => {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        updateTask(taskId, { dueDate: dateStr });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/30 dark:bg-black/50 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Side Peek Panel */}
            <div className="fixed top-4 right-4 bottom-4 w-[550px] bg-white dark:bg-dark-surface shadow-2xl z-50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

                {/* Header Actions */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-sm font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-2">
                            <span>{project?.icon || '📁'}</span>
                            <span className="truncate max-w-[200px]">{project?.name || 'Project'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                openModal({
                                    type: 'confirm',
                                    title: 'Delete Task',
                                    message: 'Are you sure you want to delete this task? This action cannot be undone.',
                                    confirmLabel: 'Delete',
                                    onConfirm: () => {
                                        deleteTask(taskId);
                                        onClose();
                                    }
                                });
                            }}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            title="Delete Task"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">

                    {/* Title */}
                    <input
                        type="text"
                        value={task.title}
                        onChange={(e) => updateTask(taskId, { title: e.target.value })}
                        className="w-full text-2xl font-bold text-slate-900 dark:text-white placeholder-slate-300 border-none focus:ring-0 p-0 mb-8 bg-transparent"
                        placeholder="Task Title"
                    />

                    {/* Properties Grid */}
                    <div className="grid grid-cols-1 gap-6 mb-8 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/50">
                        {/* Priority */}
                        <div className="flex items-center">
                            <div className="w-32 flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                                <Flag className="w-4 h-4 mr-3 text-slate-400" /> Priority
                            </div>
                            <div className="flex gap-2">
                                {(['Low', 'Medium', 'High'] as Priority[]).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => handlePriorityChange(p)}
                                        className={`
                                    px-3 py-1 text-xs font-medium rounded-md transition-all
                                    ${task.priority === p
                                                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50'}
                                `}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className="flex items-start sm:items-center flex-col sm:flex-row gap-2 sm:gap-0">
                            <div className="w-32 flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                                <Calendar className="w-4 h-4 mr-3 text-slate-400" /> Due Date
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Custom Theme-Aware Date Picker */}
                                <CustomDatePicker
                                    value={task.dueDate}
                                    onChange={(date) => updateTask(taskId, { dueDate: date })}
                                />

                                {/* Quick Actions */}
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleDateQuickSelect(0)}
                                        className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-colors"
                                    >
                                        Today
                                    </button>
                                    <button
                                        onClick={() => handleDateQuickSelect(1)}
                                        className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-colors"
                                    >
                                        Tomorrow
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Link */}
                        <div className="flex items-center">
                            <div className="w-32 flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                                <LinkIcon className="w-4 h-4 mr-3 text-slate-400" /> Link
                            </div>
                            <div className="flex-1 flex gap-2">
                                <input
                                    type="text"
                                    value={task.ticketLink || ''}
                                    onChange={(e) => updateTask(taskId, { ticketLink: e.target.value })}
                                    placeholder="https://jira.com/..."
                                    className="flex-1 text-sm text-slate-700 dark:text-slate-200 bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                                {task.ticketLink && (
                                    <a
                                        href={task.ticketLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-brand-600 rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="flex items-start">
                            <div className="w-32 flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium pt-2">
                                <Tag className="w-4 h-4 mr-3 text-slate-400" /> Labels
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex flex-wrap gap-2">
                                    {task.labels.map(labelName => {
                                        const labelDef = storeLabels.find(l => l.name.toLowerCase() === labelName.toLowerCase());
                                        const colorClass = labelDef?.color || 'bg-slate-500';
                                        return (
                                            <span key={labelName} className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${colorClass}`}>
                                                {labelName}
                                                <button onClick={() => handleRemoveLabel(labelName)} className="ml-1.5 hover:text-slate-200">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-2 relative">
                                    <div className="relative flex-1" ref={labelInputRef}>
                                        <input
                                            type="text"
                                            value={labelInput}
                                            onChange={(e) => {
                                                setLabelInput(e.target.value);
                                                setShowLabelSuggestions(true);
                                            }}
                                            onFocus={() => setShowLabelSuggestions(true)}
                                            onKeyDown={handleLabelKeyDown}
                                            placeholder="Add label..."
                                            className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                        />
                                        {/* Label Suggestions Dropdown */}
                                        {showLabelSuggestions && filteredSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-20 max-h-40 overflow-y-auto">
                                                {filteredSuggestions.map(suggestion => {
                                                    const labelDef = storeLabels.find(l => l.name.toLowerCase() === suggestion.toLowerCase());
                                                    const colorClass = labelDef?.color || 'bg-slate-400';
                                                    return (
                                                        <div
                                                            key={suggestion}
                                                            onClick={() => addLabel(suggestion)}
                                                            className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center"
                                                        >
                                                            <span className={`w-3 h-3 rounded-full mr-2 ${colorClass}`} />
                                                            {suggestion}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleAddLabel}
                                        disabled={!labelInput.trim()}
                                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 text-slate-500 dark:text-slate-400 rounded-lg transition-all disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-900 dark:text-white">
                        <AlignLeft className="w-4 h-4" /> Description
                    </div>

                    {/* Description Area */}
                    <RichTextEditor
                        content={task.description}
                        onChange={(content) => updateTask(taskId, { description: content })}
                        placeholder="Add a more detailed description..."
                    />

                    {/* Subtasks Section */}
                    <div className="mt-8">
                        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-900 dark:text-white">
                            <CheckSquare className="w-4 h-4" /> Subtasks
                        </div>

                        {/* Subtask List */}
                        <div className="space-y-2 mb-4">
                            {(task.subtasks || []).map((subtask, index) => (
                                <div
                                    key={subtask.id}
                                    className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800/50 group"
                                >
                                    {/* Reorder Buttons */}
                                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => index > 0 && reorderSubtasks(taskId!, index, index - 1)}
                                            disabled={index === 0}
                                            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title="Move up"
                                        >
                                            <ChevronUp className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => index < (task.subtasks?.length || 0) - 1 && reorderSubtasks(taskId!, index, index + 1)}
                                            disabled={index === (task.subtasks?.length || 0) - 1}
                                            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title="Move down"
                                        >
                                            <ChevronDown className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => toggleSubtask(taskId!, subtask.id)}
                                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${subtask.completed
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-slate-300 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-400'
                                            }`}
                                    >
                                        {subtask.completed && <Check className="w-3 h-3" />}
                                    </button>
                                    <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {subtask.title}
                                    </span>
                                    <button
                                        onClick={() => deleteSubtask(taskId!, subtask.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add New Subtask */}
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={subtaskInput}
                                onChange={(e) => setSubtaskInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && subtaskInput.trim()) {
                                        addSubtask(taskId!, subtaskInput.trim());
                                        setSubtaskInput('');
                                    }
                                }}
                                placeholder="Add a subtask..."
                                className="flex-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                            />
                            <button
                                onClick={() => {
                                    if (subtaskInput.trim()) {
                                        addSubtask(taskId!, subtaskInput.trim());
                                        setSubtaskInput('');
                                    }
                                }}
                                disabled={!subtaskInput.trim()}
                                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 text-slate-500 dark:text-slate-400 rounded-lg transition-all disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};