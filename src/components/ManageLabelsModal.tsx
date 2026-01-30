import React, { useState } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { useStore } from '../context/Store';
import { Label } from '../types';

interface ManageLabelsModalProps {
    onClose: () => void;
}

// Predefined color palette - 26 colors for 2 complete rows of 13
const LABEL_COLORS = [
    // Row 1: Warm to cool spectrum
    { name: 'Red', class: 'bg-red-500', text: 'text-white' },
    { name: 'Rose', class: 'bg-rose-500', text: 'text-white' },
    { name: 'Orange', class: 'bg-orange-500', text: 'text-white' },
    { name: 'Amber', class: 'bg-amber-500', text: 'text-white' },
    { name: 'Yellow', class: 'bg-yellow-400', text: 'text-slate-900' },
    { name: 'Lime', class: 'bg-lime-500', text: 'text-white' },
    { name: 'Green', class: 'bg-green-500', text: 'text-white' },
    { name: 'Emerald', class: 'bg-emerald-500', text: 'text-white' },
    { name: 'Teal', class: 'bg-teal-500', text: 'text-white' },
    { name: 'Cyan', class: 'bg-cyan-500', text: 'text-white' },
    { name: 'Sky', class: 'bg-sky-500', text: 'text-white' },
    { name: 'Blue', class: 'bg-blue-500', text: 'text-white' },
    { name: 'Indigo', class: 'bg-indigo-500', text: 'text-white' },
    // Row 2: Purples, pinks, and neutrals
    { name: 'Violet', class: 'bg-violet-500', text: 'text-white' },
    { name: 'Purple', class: 'bg-purple-500', text: 'text-white' },
    { name: 'Fuchsia', class: 'bg-fuchsia-500', text: 'text-white' },
    { name: 'Pink', class: 'bg-pink-500', text: 'text-white' },
    { name: 'Red Light', class: 'bg-red-400', text: 'text-white' },
    { name: 'Orange Light', class: 'bg-orange-400', text: 'text-white' },
    { name: 'Green Light', class: 'bg-green-400', text: 'text-white' },
    { name: 'Blue Light', class: 'bg-blue-400', text: 'text-white' },
    { name: 'Slate', class: 'bg-slate-500', text: 'text-white' },
    { name: 'Gray', class: 'bg-gray-500', text: 'text-white' },
    { name: 'Zinc', class: 'bg-zinc-500', text: 'text-white' },
    { name: 'Stone', class: 'bg-stone-500', text: 'text-white' },
    { name: 'Neutral', class: 'bg-neutral-500', text: 'text-white' },
    // Extra colors for 5x6 grid (30 total)
    { name: 'Lime Light', class: 'bg-lime-400', text: 'text-slate-900' },
    { name: 'Sky Light', class: 'bg-sky-400', text: 'text-slate-900' },
    { name: 'Violet Light', class: 'bg-violet-400', text: 'text-white' },
    { name: 'Fuchsia Light', class: 'bg-fuchsia-400', text: 'text-white' },
];

export const ManageLabelsModal: React.FC<ManageLabelsModalProps> = ({ onClose }) => {
    const { labels, addLabel, updateLabel, deleteLabel, openModal } = useStore();
    const [newLabelName, setNewLabelName] = useState('');
    const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[10]); // Default blue
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [colorPickerState, setColorPickerState] = useState<{ id: string, top: number, left: number } | null>(null);

    // Close color picker on scroll
    React.useEffect(() => {
        const handleScroll = () => {
            if (colorPickerState) setColorPickerState(null);
        };
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, [colorPickerState]);

    // Close on Escape
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleAddLabel = () => {
        if (newLabelName.trim()) {
            addLabel(newLabelName.trim(), selectedColor.class);
            setNewLabelName('');
            setSelectedColor(LABEL_COLORS[10]);
        }
    };

    const handleStartEdit = (label: Label) => {
        setEditingId(label.id);
        setEditName(label.name);
    };

    const handleSaveEdit = (id: string) => {
        if (editName.trim()) {
            updateLabel(id, { name: editName.trim() });
        }
        setEditingId(null);
        setEditName('');
    };

    const handleDeleteLabel = (id: string, name: string) => {
        openModal({
            type: 'confirm',
            title: 'Delete Label',
            message: `Are you sure you want to delete "${name}"? This won't remove the label from existing tasks.`,
            confirmLabel: 'Delete',
            onConfirm: () => deleteLabel(id)
        });
    };

    const handleColorChange = (labelId: string, color: typeof LABEL_COLORS[0]) => {
        updateLabel(labelId, { color: color.class });
    };

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
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Manage Labels</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Add New Label */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Add New Label
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newLabelName}
                                    onChange={(e) => setNewLabelName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                                    placeholder="Label name..."
                                    className="flex-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                                <button
                                    onClick={handleAddLabel}
                                    disabled={!newLabelName.trim()}
                                    className="px-3 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Color Picker - 2 rows of 15 */}
                            <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1.5">
                                {LABEL_COLORS.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-5 h-5 rounded-full ${color.class} flex items-center justify-center transition-transform hover:scale-125 ${selectedColor.name === color.name ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white z-10 scale-110' : ''
                                            }`}
                                        title={color.name}
                                    >
                                        {selectedColor.name === color.name && (
                                            <Check className={`w-3 h-3 ${color.text}`} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Existing Labels */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Your Labels ({labels.length})
                            </label>
                            {labels.length === 0 ? (
                                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
                                    No labels yet. Add one above!
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-[290px] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                    {labels.map((label) => (
                                        <div
                                            key={label.id}
                                            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg group"
                                        >
                                            {/* Color dot with picker */}
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        if (colorPickerState?.id === label.id) {
                                                            setColorPickerState(null);
                                                        } else {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            // Center horizontally relative to button
                                                            // Adjust if close to right edge (simple check)
                                                            let left = rect.left;
                                                            if (window.innerWidth - left < 200) {
                                                                left = window.innerWidth - 220;
                                                            }

                                                            setColorPickerState({
                                                                id: label.id,
                                                                top: rect.bottom + 5,
                                                                left: left
                                                            });
                                                        }
                                                    }}
                                                    className={`w-6 h-6 rounded-full ${label.color} flex-shrink-0 hover:ring-2 hover:ring-offset-2 hover:ring-slate-400 transition-all`}
                                                    title="Click to change color"
                                                />
                                            </div>

                                            {/* Name */}
                                            {editingId === label.id ? (
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(label.id)}
                                                    onBlur={() => handleSaveEdit(label.id)}
                                                    autoFocus
                                                    className="flex-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                                />
                                            ) : (
                                                <span
                                                    onClick={() => handleStartEdit(label)}
                                                    className="flex-1 text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:text-brand-600 dark:hover:text-brand-400"
                                                >
                                                    {label.name}
                                                </span>
                                            )}

                                            {/* Delete */}
                                            <button
                                                onClick={() => handleDeleteLabel(label.id, label.name)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>

            {/* Smart Fixed Color Picker */}
            {colorPickerState && (
                <div
                    className="fixed z-[60] p-3 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-max animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: colorPickerState.top, left: colorPickerState.left }}
                >
                    {/* Backdrop to close when clicking outside */}
                    <div className="fixed inset-0 -z-10" onClick={() => setColorPickerState(null)} />

                    <div className="grid grid-cols-5 gap-2">
                        {LABEL_COLORS.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => {
                                    handleColorChange(colorPickerState.id, color);
                                    setColorPickerState(null);
                                }}
                                className={`w-6 h-6 rounded-full ${color.class} hover:scale-110 transition-transform ${labels.find(l => l.id === colorPickerState.id)?.color === color.class ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : ''}`}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};
