import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useStore } from '../context/Store';
import { Search, Moon, Sun, Clock, Flag, Tag, Settings, Tags, Download, Upload, BarChart3, Layout, Calendar, Briefcase } from 'lucide-react';
import { importData } from '../utils/backupUtils';

export const CommandPalette: React.FC = () => {
    const [open, setOpen] = useState(false);
    const {
        filteredProjects: projects,
        setActiveProjectId,
        customViews,
        setViewFilter,
        setCurrentView,
        toggleTheme,
        setSettingsOpen,
        setManageLabelsOpen,
        exportData,
        workspaces,
        setActiveWorkspaceId,
        activeWorkspaceId
    } = useStore();

    // Toggle the menu when ⌘K is pressed
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    if (!open) return null;

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-900/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] animate-in fade-in duration-200">
            <Command
                className="w-full max-w-lg bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
                loop
            >
                <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-3" cmdk-input-wrapper="">
                    <Search className="w-5 h-5 text-slate-400 mr-2" />
                    <Command.Input
                        autoFocus
                        placeholder="Type a command or search..."
                        className="w-full h-14 bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 font-medium"
                    />
                    <div className="flex gap-1">
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">ESC</kbd>
                    </div>
                </div>

                <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 scrollbar-hide">
                    <Command.Empty className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        No results found.
                    </Command.Empty>

                    {/* Navigation */}
                    <Command.Group className="mb-2">
                        <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Navigation</div>
                        <Command.Item
                            onSelect={() => runCommand(() => setViewFilter('recent'))}
                            className="flex items-center px-2 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-brand-50 aria-selected:text-brand-700 dark:aria-selected:bg-brand-900/20 dark:aria-selected:text-brand-300 cursor-pointer transition-colors group"
                        >
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-aria-selected:bg-brand-100 dark:group-aria-selected:bg-brand-900/40 group-aria-selected:text-brand-600 dark:group-aria-selected:text-brand-400 mr-3">
                                <Clock className="w-4 h-4" />
                            </div>
                            <span>Recents</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => setCurrentView('board'))}
                            className="flex items-center px-2 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-brand-50 aria-selected:text-brand-700 dark:aria-selected:bg-brand-900/20 dark:aria-selected:text-brand-300 cursor-pointer transition-colors group"
                        >
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-aria-selected:bg-brand-100 dark:group-aria-selected:bg-brand-900/40 group-aria-selected:text-brand-600 dark:group-aria-selected:text-brand-400 mr-3">
                                <Layout className="w-4 h-4" />
                            </div>
                            <span>Board View</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => setCurrentView('calendar'))}
                            className="flex items-center px-2 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-brand-50 aria-selected:text-brand-700 dark:aria-selected:bg-brand-900/20 dark:aria-selected:text-brand-300 cursor-pointer transition-colors group"
                        >
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-aria-selected:bg-brand-100 dark:group-aria-selected:bg-brand-900/40 group-aria-selected:text-brand-600 dark:group-aria-selected:text-brand-400 mr-3">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <span>Calendar View</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => setCurrentView('analytics'))}
                            className="flex items-center px-2 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-brand-50 aria-selected:text-brand-700 dark:aria-selected:bg-brand-900/20 dark:aria-selected:text-brand-300 cursor-pointer transition-colors group"
                        >
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-aria-selected:bg-brand-100 dark:group-aria-selected:bg-brand-900/40 group-aria-selected:text-brand-600 dark:group-aria-selected:text-brand-400 mr-3">
                                <BarChart3 className="w-4 h-4" />
                            </div>
                            <span>Dashboard</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => setSettingsOpen(true))}
                            className="flex items-center px-2 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-brand-50 aria-selected:text-brand-700 dark:aria-selected:bg-brand-900/20 dark:aria-selected:text-brand-300 cursor-pointer transition-colors group"
                        >
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-aria-selected:bg-brand-100 dark:group-aria-selected:bg-brand-900/40 group-aria-selected:text-brand-600 dark:group-aria-selected:text-brand-400 mr-3">
                                <Settings className="w-4 h-4" />
                            </div>
                            <span>Settings</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => setManageLabelsOpen(true))}
                            className="flex items-center px-2 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-brand-50 aria-selected:text-brand-700 dark:aria-selected:bg-brand-900/20 dark:aria-selected:text-brand-300 cursor-pointer transition-colors group"
                        >
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-aria-selected:bg-brand-100 dark:group-aria-selected:bg-brand-900/40 group-aria-selected:text-brand-600 dark:group-aria-selected:text-brand-400 mr-3">
                                <Tags className="w-4 h-4" />
                            </div>
                            <span>Manage Labels</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => exportData())}
                            className="flex items-center px-2 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-brand-50 aria-selected:text-brand-700 dark:aria-selected:bg-brand-900/20 dark:aria-selected:text-brand-300 cursor-pointer transition-colors group"
                        >
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-aria-selected:bg-brand-100 dark:group-aria-selected:bg-brand-900/40 group-aria-selected:text-brand-600 dark:group-aria-selected:text-brand-400 mr-3">
                                <Download className="w-4 h-4" />
                            </div>
                            <span>Export Data</span>
                        </Command.Item>
                        <div className="relative">
                            <input
                                id="hidden-import-input"
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const confirm = window.confirm('This will replace all current data with the backup. Are you sure?');
                                        if (confirm) {
                                            importData(file).then(success => {
                                                if (success) window.location.reload();
                                            }).catch(err => alert('Failed to import: ' + err));
                                        }
                                    }
                                    e.target.value = '';
                                }}
                            />
                            <Command.Item
                                onSelect={() => runCommand(() => document.getElementById('hidden-import-input')?.click())}
                                className="flex items-center px-2 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-brand-50 aria-selected:text-brand-700 dark:aria-selected:bg-brand-900/20 dark:aria-selected:text-brand-300 cursor-pointer transition-colors group"
                            >
                                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-aria-selected:bg-brand-100 dark:group-aria-selected:bg-brand-900/40 group-aria-selected:text-brand-600 dark:group-aria-selected:text-brand-400 mr-3">
                                    <Upload className="w-4 h-4" />
                                </div>
                                <span>Import Data</span>
                            </Command.Item>
                        </div>
                    </Command.Group>

                    {/* Projects */}
                    {projects.length > 0 && (
                        <Command.Group className="mb-2">
                            <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Projects</div>
                            {projects.map(project => (
                                <Command.Item
                                    key={project.id}
                                    onSelect={() => runCommand(() => {
                                        setActiveProjectId(project.id);
                                        setViewFilter('project');
                                    })}
                                    className="flex items-center px-2 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-brand-50 aria-selected:text-brand-700 dark:aria-selected:bg-brand-900/20 dark:aria-selected:text-brand-300 cursor-pointer transition-colors group"
                                >
                                    <span className="text-xl mr-3 w-6 text-center">{project.icon}</span>
                                    <span>{project.name}</span>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}

                    {/* Filters */}
                    {customViews.length > 0 && (
                        <Command.Group className="mb-2">
                            <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Filters</div>
                            {customViews.map(view => {
                                const Icon = view.filterType === 'priority' ? Flag : Tag;
                                return (
                                    <Command.Item
                                        key={view.id}
                                        onSelect={() => runCommand(() => setViewFilter(view.id))}
                                        className="flex items-center px-2 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-brand-50 aria-selected:text-brand-700 dark:aria-selected:bg-brand-900/20 dark:aria-selected:text-brand-300 cursor-pointer transition-colors group"
                                    >
                                        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-aria-selected:bg-brand-100 dark:group-aria-selected:bg-brand-900/40 group-aria-selected:text-brand-600 dark:group-aria-selected:text-brand-400 mr-3">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span>{view.name}</span>
                                    </Command.Item>
                                );
                            })}
                        </Command.Group>
                    )}

                    {/* Theme */}
                    <Command.Group className="mb-2">
                        <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Theme</div>
                        <Command.Item
                            onSelect={() => runCommand(() => toggleTheme('light'))}
                            className="flex items-center px-2 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-brand-50 aria-selected:text-brand-700 dark:aria-selected:bg-brand-900/20 dark:aria-selected:text-brand-300 cursor-pointer transition-colors group"
                        >
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-aria-selected:bg-brand-100 dark:group-aria-selected:bg-brand-900/40 group-aria-selected:text-brand-600 dark:group-aria-selected:text-brand-400 mr-3">
                                <Sun className="w-4 h-4" />
                            </div>
                            <span>Light Mode</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => toggleTheme('dark'))}
                            className="flex items-center px-2 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-brand-50 aria-selected:text-brand-700 dark:aria-selected:bg-brand-900/20 dark:aria-selected:text-brand-300 cursor-pointer transition-colors group"
                        >
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-aria-selected:bg-brand-100 dark:group-aria-selected:bg-brand-900/40 group-aria-selected:text-brand-600 dark:group-aria-selected:text-brand-400 mr-3">
                                <Moon className="w-4 h-4" />
                            </div>
                            <span>Dark Mode</span>
                        </Command.Item>
                    </Command.Group>

                    {/* Workspaces */}
                    {workspaces.length > 0 && (
                        <Command.Group className="mb-2">
                            <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Workspaces</div>
                            {workspaces.map(workspace => (
                                <Command.Item
                                    key={workspace.id}
                                    onSelect={() => runCommand(() => setActiveWorkspaceId(workspace.id))}
                                    className="flex items-center px-2 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-brand-50 aria-selected:text-brand-700 dark:aria-selected:bg-brand-900/20 dark:aria-selected:text-brand-300 cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-aria-selected:bg-brand-100 dark:group-aria-selected:bg-brand-900/40 group-aria-selected:text-brand-600 dark:group-aria-selected:text-brand-400 mr-3">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <span>{workspace.name}</span>
                                    {activeWorkspaceId === workspace.id && (
                                        <span className="ml-auto text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">Active</span>
                                    )}
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}

                </Command.List>

                <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        Pro tip: Use arrow keys to navigate
                    </span>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        Cmd+K
                    </div>
                </div>
            </Command>
        </div>
    );
};
