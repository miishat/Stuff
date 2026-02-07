/**
 * @file CustomDatePicker.tsx
 * @description Custom date picker component with calendar popup.
 *              Provides month navigation, visual day selection, and date clearing.
 * @author Mishat
 * @version 1.0.3
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

/**
 * Props for the CustomDatePicker component.
 */
interface CustomDatePickerProps {
    value: string | undefined;
    onChange: (date: string | undefined) => void;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Helper to parse "YYYY-MM-DD" safely to local date
    const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    // Helper to format Date to "YYYY-MM-DD"
    const formatDateToISO = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [viewDate, setViewDate] = useState(value ? parseDate(value) : new Date());

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (value) {
            setViewDate(parseDate(value));
        }
    }, [value, isOpen]);

    const toggleOpen = () => setIsOpen(!isOpen);

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day: number) => {
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(formatDateToISO(selected));
        setIsOpen(false);
    };

    // Calendar Grid Logic
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay(); // 0 = Sun

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const formatDateDisplay = (dateStr?: string) => {
        if (!dateStr) return 'Set Due Date';
        const date = parseDate(dateStr);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Input */}
            <div
                onClick={toggleOpen}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-brand-500 dark:hover:border-brand-500 transition-colors group min-w-[150px] shadow-sm"
            >
                <Calendar className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
                <span className={`text-sm font-medium ${!value ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {formatDateDisplay(value)}
                </span>
            </div>

            {/* Popup */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 w-64 animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-1">
                            <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, i) => {
                            if (!day) return <div key={i} />;

                            // Check if selected
                            const currentIsSelected = value &&
                                parseDate(value).getDate() === day &&
                                parseDate(value).getMonth() === viewDate.getMonth() &&
                                parseDate(value).getFullYear() === viewDate.getFullYear();

                            const isToday =
                                new Date().getDate() === day &&
                                new Date().getMonth() === viewDate.getMonth() &&
                                new Date().getFullYear() === viewDate.getFullYear();

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleDateSelect(day)}
                                    className={`
                                      h-8 rounded-lg text-xs font-medium transition-all
                                      ${currentIsSelected
                                            ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}
                                      ${!currentIsSelected && isToday ? 'text-brand-600 dark:text-brand-400 font-extrabold bg-brand-50 dark:bg-brand-900/10' : ''}
                                  `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Clear Button */}
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={() => {
                                onChange(undefined);
                                setIsOpen(false);
                            }}
                            className="w-full py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                            Clear Date
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};