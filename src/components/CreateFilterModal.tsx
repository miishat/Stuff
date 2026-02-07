/**
 * @file CreateFilterModal.tsx
 * @description Modal component for creating and editing custom filters.
 *              Supports filtering by priority level or labels with multi-select.
 * @author Mishat
 * @version 1.0.3
 */

import React, { useState, useEffect } from 'react';
import { X, Check, Flag, Tag } from 'lucide-react';
import { useStore } from '../context/Store';
import { Priority, CustomView } from '../types';

/**
 * Props for the CreateFilterModal component.
 */
interface CreateFilterModalProps {
    onClose: () => void;
    onSave: (name: string, filterType: 'priority' | 'label', filterValue: string | string[]) => void;
    editView?: CustomView; // If provided, we're editing instead of creating
}

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

const PRIORITY_STYLES: Record<Priority, string> = {
    High: 'bg-red-500 text-white',
    Medium: 'bg-amber-500 text-white',
    Low: 'bg-emerald-500 text-white',
};

export const CreateFilterModal: React.FC<CreateFilterModalProps> = ({ onClose, onSave, editView }) => {
    const { labels } = useStore();
    const [filterName, setFilterName] = useState('');
    const [filterType, setFilterType] = useState<'priority' | 'label' | null>(null);
    const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

    // Initialize state from editView if editing
    useEffect(() => {
        if (editView) {
            setFilterName(editView.name);
            setFilterType(editView.filterType);
            if (editView.filterType === 'priority') {
                setSelectedPriority(editView.filterValue as Priority);
            } else if (editView.filterType === 'label') {
                const values = Array.isArray(editView.filterValue) ? editView.filterValue : [editView.filterValue];
                setSelectedLabels(values);
            }
        }
    }, [editView]);

    const toggleLabel = (labelName: string) => {
        setSelectedLabels(prev =>
            prev.includes(labelName)
                ? prev.filter(l => l !== labelName)
                : [...prev, labelName]
        );
    };

    const handleSave = () => {
        if (!filterName.trim() || !filterType) return;

        if (filterType === 'priority' && selectedPriority) {
            onSave(filterName.trim(), 'priority', selectedPriority);
        } else if (filterType === 'label' && selectedLabels.length > 0) {
            // If only one label, save as string for backwards compat
            const value = selectedLabels.length === 1 ? selectedLabels[0] : selectedLabels;
            onSave(filterName.trim(), 'label', value);
        }
        onClose();
    };

    const isValid = filterName.trim() &&
        ((filterType === 'priority' && selectedPriority) ||
            (filterType === 'label' && selectedLabels.length > 0));

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/30 dark:bg-black/50 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {editView ? 'Edit Filter' : 'Create Filter'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Filter Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Filter Name
                            </label>
                            <input
                                type="text"
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                placeholder="e.g., High Priority, Design Tasks"
                                className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                autoFocus
                            />
                        </div>

                        {/* Filter Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                Filter By
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setFilterType('priority');
                                        setSelectedLabels([]);
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${filterType === 'priority'
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <Flag className="w-4 h-4" />
                                    <span className="text-sm font-medium">Priority</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterType('label');
                                        setSelectedPriority(null);
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${filterType === 'label'
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <Tag className="w-4 h-4" />
                                    <span className="text-sm font-medium">Label</span>
                                </button>
                            </div>
                        </div>

                        {/* Priority Selection */}
                        {filterType === 'priority' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    Select Priority
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {PRIORITIES.map(priority => (
                                        <button
                                            key={priority}
                                            onClick={() => setSelectedPriority(priority)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${selectedPriority === priority
                                                ? `${PRIORITY_STYLES[priority]} ring-2 ring-offset-2 ring-slate-900 dark:ring-white`
                                                : `${PRIORITY_STYLES[priority]} opacity-60 hover:opacity-100`
                                                }`}
                                        >
                                            {selectedPriority === priority && <Check className="w-4 h-4" />}
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Label Selection - Multi-select */}
                        {filterType === 'label' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    Select Labels
                                </label>
                                {labels.length === 0 ? (
                                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
                                        No labels defined. Create labels in Settings → Manage Labels.
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {labels.map(label => (
                                            <button
                                                key={label.id}
                                                onClick={() => toggleLabel(label.name)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-white ${label.color} ${selectedLabels.includes(label.name)
                                                    ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white'
                                                    : 'opacity-60 hover:opacity-100'
                                                    }`}
                                            >
                                                {selectedLabels.includes(label.name) && <Check className="w-4 h-4" />}
                                                {label.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!isValid}
                            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {editView ? 'Update Filter' : 'Create Filter'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
