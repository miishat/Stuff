import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/Store';
import { CheckSquare, Settings, PlusCircle, Trash2, Clock, Flag, Tag, Pencil, ChevronDown, Check, FolderPlus, Edit2, Globe } from 'lucide-react';
import { CustomView, Project, Workspace } from '../types';
import { CreateFilterModal } from './CreateFilterModal';

export const Sidebar: React.FC = () => {
    const {
        workspaces,
        activeWorkspaceId,
        setActiveWorkspaceId,
        addWorkspace,
        updateWorkspace,
        deleteWorkspace,
        filteredProjects,
        customViews,
        activeProjectId,
        setActiveProjectId,
        isSidebarOpen,
        addProject,
        updateProject,
        deleteProject,
        viewFilter,
        setViewFilter,
        setSettingsOpen,
        addCustomView,
        updateCustomView,
        deleteCustomView,
        openModal,
        recentViewGlobal,
        toggleRecentViewGlobal
    } = useStore();

    const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
    const [showCreateFilterModal, setShowCreateFilterModal] = useState(false);
    const [editingView, setEditingView] = useState<CustomView | null>(null);
    const workspaceMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(event.target as Node)) {
                setIsWorkspaceMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

    const handleAddProject = () => {
        openModal({
            type: 'prompt',
            title: 'New Project',
            message: 'Enter the name for your new project:',
            confirmLabel: 'Create Project',
            onConfirm: (name) => {
                if (name) {
                    const emojis = ['🚀', '🎨', '📱', '💻', '📊', '🔥', '🔮', '⚡', '💎', '🌈', '🏗️', '🤖'];
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    addProject(name, randomEmoji);
                }
            }
        });
    };

    const handleRenameProject = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation();
        openModal({
            type: 'prompt',
            title: 'Rename Project',
            message: 'Enter new project name:',
            defaultValue: project.name,
            confirmLabel: 'Rename',
            onConfirm: (newName) => {
                if (newName) {
                    updateProject(project.id, { name: newName });
                }
            }
        });
    };

    const handleChangeProjectIcon = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation();
        openModal({
            type: 'options',
            title: 'Select Project Icon',
            defaultValue: project.icon,
            options: [
                // Activity & Objects
                '🚀', '🎨', '📱', '💻', '📊', '🔥', '🔮', '⚡', '💎', '🌈', '🏗️', '🤖', '🎮', '🎧', '📷', '📚', '💡', '🛠️', '🌍', '🏠',
                '🎓', '🏆', '🎯', '🎪', '🎭', '🎬', '🎤', '🎹', '🎷', '🎸', '🎺', '🎻', '🎼', '🧩', '🎲', '🎰', '🎳', '🎱', '🏀', '🏈', '🎾',
                // Nature
                '🌲', '🌳', '🌴', '🌵', '🌷', '🌸', '🌹', '🌺', '🌻', '🌼', '🌽', '🌾', '🌿', '🍀', '🍁', '🍂', '🍃', '🍄', '🌰', '🦀', '🦞', '🦐', '🦑',
                // Food
                '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️',
                // Travel & Places
                '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🚏', '🛣️', '🛤️', '🛢️', '⛽',
                // Symbols
                '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️',
                // Tech
                '⌚', '📲', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📸', '📹', '🎥', '📽️', '🎞️', '📞',
                // Office
                '📂', '📁', '📅', '📆', '📇', '📈', '📉', '📋', '📌', '📍', '📎', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️', '🔒', '🔓', '🔏', '🔐', '🔑'
            ],
            onConfirm: (newIcon) => {
                if (newIcon) {
                    updateProject(project.id, { icon: newIcon });
                }
            }
        });
    };

    const handleAddWorkspace = () => {
        openModal({
            type: 'prompt',
            title: 'New Workspace',
            message: 'Enter workspace name:',
            confirmLabel: 'Create Workspace',
            onConfirm: (name) => {
                if (name) {
                    addWorkspace(name);
                    setIsWorkspaceMenuOpen(false);
                }
            }
        });
    };

    const handleRenameWorkspace = (e: React.MouseEvent, w: Workspace) => {
        e.stopPropagation();
        openModal({
            type: 'prompt',
            title: 'Rename Workspace',
            message: 'Enter new name:',
            defaultValue: w.name,
            confirmLabel: 'Update',
            onConfirm: (name) => {
                if (name) {
                    updateWorkspace(w.id, name);
                    setIsWorkspaceMenuOpen(false);
                }
            }
        });
    };

    const handleDeleteWorkspace = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        openModal({
            type: 'confirm',
            title: 'Delete Workspace',
            message: 'Are you sure you want to delete this workspace and all its projects? This action cannot be undone.',
            confirmLabel: 'Delete Workspace',
            onConfirm: () => {
                deleteWorkspace(id);
                setIsWorkspaceMenuOpen(false);
            }
        });
    };

    const handleDeleteProject = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        openModal({
            type: 'confirm',
            title: 'Delete Project',
            message: 'Are you sure you want to delete this project? This action cannot be undone.',
            confirmLabel: 'Delete',
            onConfirm: () => deleteProject(id)
        });
    };

    const handleAddView = () => {
        setEditingView(null);
        setShowCreateFilterModal(true);
    };

    const handleCreateFilter = (name: string, filterType: 'priority' | 'label', filterValue: string | string[]) => {
        if (editingView) {
            // Editing existing view
            updateCustomView(editingView.id, {
                name,
                filterType,
                filterValue,
                icon: filterType === 'priority' ? 'Flag' : 'Tag'
            });
        } else {
            // Creating new view
            addCustomView(name, filterType, filterValue, false);
        }
        setEditingView(null);
    };

    const handleEditView = (e: React.MouseEvent, view: CustomView) => {
        e.stopPropagation();
        setEditingView(view);
        setShowCreateFilterModal(true);
    };

    const handleDeleteView = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        openModal({
            type: 'confirm',
            title: 'Delete Filter',
            message: 'Remove this custom filter?',
            confirmLabel: 'Remove',
            onConfirm: () => deleteCustomView(id)
        });
    };

    return (
        <>
            <aside
                className={`
                relative h-full border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl flex flex-col flex-shrink-0 z-30 transition-[width] duration-500 ease-in-out
                ${isSidebarOpen ? 'w-72' : 'w-20'}
            `}
                style={{ willChange: 'width' }}
            >
                {/* Brand Header & Workspace Switcher */}
                <div className={`h-20 flex items-center border-b border-slate-100 dark:border-slate-800/50 ${isSidebarOpen ? 'px-6' : 'justify-center'} relative`} ref={workspaceMenuRef}>
                    <div
                        onClick={() => isSidebarOpen && setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                        className={`flex items-center w-full cursor-pointer group ${!isSidebarOpen && 'justify-center pointer-events-none'}`}
                    >
                        <div className="relative flex-shrink-0">
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-accent-500 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                            <div className="relative w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg">
                                <CheckSquare className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        {isSidebarOpen && (
                            <div className="ml-4 overflow-hidden flex-1">
                                <h1 className="font-bold text-lg text-slate-800 dark:text-white leading-none tracking-tight truncate">Stuff</h1>
                                <div className="flex items-center mt-1">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">{activeWorkspace?.name || 'Workspace'}</span>
                                    <ChevronDown className="w-3 h-3 ml-2 text-slate-400" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Workspace Dropdown */}
                    {isWorkspaceMenuOpen && isSidebarOpen && (
                        <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="py-2">
                                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Switch Workspace</div>
                                {workspaces.map(w => (
                                    <div
                                        key={w.id}
                                        onClick={() => {
                                            setActiveWorkspaceId(w.id);
                                            setIsWorkspaceMenuOpen(false);
                                        }}
                                        className={`px-4 py-2.5 flex items-center justify-between text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group
                                ${activeWorkspaceId === w.id ? 'text-brand-600 dark:text-brand-400 font-medium' : 'text-slate-700 dark:text-slate-300'}
                            `}
                                    >
                                        <span className="truncate flex-1">{w.name}</span>
                                        <div className="flex items-center">
                                            {activeWorkspaceId === w.id && (
                                                <Check className="w-4 h-4 mr-2" />
                                            )}
                                            <button
                                                onClick={(e) => handleRenameWorkspace(e, w)}
                                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Rename"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                            {workspaces.length > 1 && (
                                                <button
                                                    onClick={(e) => handleDeleteWorkspace(e, w.id)}
                                                    className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                                <button
                                    onClick={handleAddWorkspace}
                                    className="w-full text-left px-0 py-0 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 flex items-center transition-colors min-h-[44px]"
                                >
                                    <div className={`flex-shrink-0 flex items-center justify-center transition-all duration-500 ${isSidebarOpen ? 'w-12' : 'w-full'}`}>
                                        <FolderPlus className="w-4 h-4" />
                                    </div>
                                    <div className={`whitespace-nowrap overflow-hidden transition-all duration-500 ${isSidebarOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>
                                        Create Workspace
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-8 px-4 space-y-6 scrollbar-hide">

                    {/* Workspace Section */}
                    <div className="space-y-1">
                        <div className={`transition-all duration-500 overflow-hidden ${isSidebarOpen ? 'h-auto opacity-100' : 'h-0 opacity-0'}`}>
                            <h3 className="px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Projects</h3>
                        </div>

                        {filteredProjects.map(project => {
                            const isActive = activeProjectId === project.id && viewFilter === 'project';
                            return (
                                <div
                                    key={project.id}
                                    onClick={() => {
                                        setActiveProjectId(project.id);
                                        setViewFilter('project');
                                    }}
                                    className={`
                      w-full flex items-center min-h-[44px] rounded-xl text-sm transition-all duration-200 group relative cursor-pointer overflow-hidden
                      ${isActive
                                            ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                    `}
                                    title={project.name}
                                >
                                    {/* Active Glow Indicator */}
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-xl ring-1 ring-brand-500/20 dark:ring-brand-400/20 pointer-events-none"></div>
                                    )}

                                    {/* Icon Container - smooth width transition */}
                                    <div className={`flex-shrink-0 flex items-center justify-center transition-all duration-500 ${isSidebarOpen ? 'w-12' : 'w-full'}`}>
                                        {isSidebarOpen ? (
                                            <button
                                                onClick={(e) => handleChangeProjectIcon(e, project)}
                                                className="text-xl transition-transform duration-200 hover:scale-125 cursor-pointer flex items-center justify-center"
                                                title="Click to change icon"
                                            >
                                                {project.icon}
                                            </button>
                                        ) : (
                                            <span className="text-xl">{project.icon}</span>
                                        )}
                                    </div>

                                    {/* Content - smooth open/close */}
                                    <div className={`flex items-center flex-1 min-w-0 transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                                        <span className="truncate flex-1 text-left font-medium">{project.name}</span>

                                        <div className="flex items-center pr-2">
                                            <button
                                                onClick={(e) => handleRenameProject(e, project)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-all mr-1"
                                                title="Rename Project"
                                            >
                                                <Pencil className="w-3.5 h-3.5 pointer-events-none" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteProject(e, project.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all"
                                                title="Delete Project"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <button
                            onClick={handleAddProject}
                            className={`w-full flex items-center min-h-[44px] rounded-xl text-sm text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-200 mt-2 p-0 overflow-hidden`}
                            title="Add Project"
                        >
                            <div className={`flex-shrink-0 flex items-center justify-center transition-all duration-500 ${isSidebarOpen ? 'w-12' : 'w-full'}`}>
                                <PlusCircle className="w-5 h-5" />
                            </div>
                            <span className={`whitespace-nowrap overflow-hidden transition-all duration-500 font-medium ${isSidebarOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>New Project</span>
                        </button>
                    </div>

                    {/* Filters Section (formerly Custom Views & Recents) */}
                    <div className="space-y-1">
                        <div className={`transition-all duration-500 overflow-hidden ${isSidebarOpen ? 'h-auto opacity-100' : 'h-0 opacity-0'}`}>
                            <h3 className="px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 mt-6">Filters</h3>
                        </div>

                        {/* Recents Filter */}
                        {(() => {
                            const isActive = viewFilter === 'recent';
                            return (
                                <div
                                    onClick={() => setViewFilter('recent')}
                                    className={`w-full flex items-center min-h-[44px] rounded-xl text-sm transition-all duration-200 group cursor-pointer overflow-hidden
                                ${isActive
                                            ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'} 
                                p-0`}
                                    title="Recents"
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-xl ring-1 ring-brand-500/20 dark:ring-brand-400/20 pointer-events-none"></div>
                                    )}

                                    <div className={`flex-shrink-0 flex items-center justify-center transition-all duration-500 ${isSidebarOpen ? 'w-12' : 'w-full'}`}>
                                        <Clock className="w-4 h-4" />
                                    </div>

                                    <div className={`flex items-center flex-1 min-w-0 transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                                        <span className="flex-1 font-medium truncate">Recents</span>
                                        <div className="pr-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleRecentViewGlobal();
                                                }}
                                                className={`p-1 rounded transition-colors ${recentViewGlobal
                                                    ? (isActive ? 'text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-200' : 'text-brand-500 hover:text-brand-600')
                                                    : (isActive ? 'text-brand-400/50 hover:text-brand-600' : 'text-slate-300 hover:text-slate-500')
                                                    }`}
                                                title={recentViewGlobal ? "Showing all workspaces (click for current only)" : "Showing current workspace (click for all)"}
                                            >
                                                <Globe className={`w-3.5 h-3.5 pointer-events-none ${recentViewGlobal ? '' : 'opacity-70'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Custom Filters */}
                        {customViews.map(view => {
                            const isActive = viewFilter === view.id;
                            const Icon = view.filterType === 'priority' ? Flag : Tag;

                            const handleToggleScope = (e: React.MouseEvent) => {
                                e.stopPropagation();
                                updateCustomView(view.id, { allWorkspaces: !view.allWorkspaces });
                            };

                            return (
                                <div
                                    key={view.id}
                                    onClick={() => setViewFilter(view.id)}
                                    className={`
                            w-full flex items-center min-h-[44px] rounded-xl text-sm transition-all duration-200 group relative cursor-pointer overflow-hidden
                            ${isActive
                                            ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'} 
                            p-0
                        `}
                                    title={view.name}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-xl ring-1 ring-brand-500/20 dark:ring-brand-400/20 pointer-events-none"></div>
                                    )}

                                    <div className={`flex-shrink-0 flex items-center justify-center transition-all duration-500 ${isSidebarOpen ? 'w-12' : 'w-full'}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className={`flex items-center flex-1 min-w-0 transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                                        <span className="flex-1 truncate font-medium">{view.name}</span>
                                        <div className="flex items-center ml-auto gap-0.5 pr-2">
                                            <button
                                                onClick={(e) => handleEditView(e, view)}
                                                className={`opacity-0 group-hover:opacity-100 p-1 transition-colors ${isActive ? 'text-brand-400 hover:text-brand-600' : 'text-slate-400 hover:text-brand-600'}`}
                                                title="Edit Filter"
                                            >
                                                <Pencil className="w-3 h-3 pointer-events-none" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteView(e, view.id)}
                                                className={`opacity-0 group-hover:opacity-100 p-1 transition-colors ${isActive ? 'text-brand-400 hover:text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                                                title="Delete Filter"
                                            >
                                                <Trash2 className="w-3 h-3 pointer-events-none" />
                                            </button>
                                            <button
                                                onClick={handleToggleScope}
                                                className={`p-1 rounded transition-colors ${view.allWorkspaces
                                                    ? (isActive ? 'text-brand-600 hover:text-brand-800' : 'text-brand-500 hover:text-brand-600')
                                                    : (isActive ? 'text-brand-300 hover:text-brand-500' : 'text-slate-300 hover:text-slate-500')
                                                    }`}
                                                title={view.allWorkspaces ? "Showing all workspaces (click to show current only)" : "Showing current workspace (click to show all)"}
                                            >
                                                <Globe className={`w-3.5 h-3.5 pointer-events-none ${view.allWorkspaces ? '' : 'opacity-70'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        <button
                            onClick={handleAddView}
                            className={`w-full flex items-center min-h-[44px] rounded-xl text-sm text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-200 mt-2 p-0 overflow-hidden`}
                            title="New Filter"
                        >
                            <div className={`flex-shrink-0 flex items-center justify-center transition-all duration-500 ${isSidebarOpen ? 'w-12' : 'w-full'}`}>
                                <PlusCircle className="w-5 h-5" />
                            </div>
                            <span className={`whitespace-nowrap overflow-hidden transition-all duration-500 font-medium ${isSidebarOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>New Filter</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-6 ${!isSidebarOpen && 'px-0'}`}>
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className={`flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors overflow-hidden
            ${isSidebarOpen
                                ? 'w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl'
                                : 'w-full rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800'} 
            min-h-[44px]`}
                        title="Settings"
                    >
                        <div className={`flex-shrink-0 flex items-center justify-center transition-all duration-500 ${isSidebarOpen ? 'w-12 h-11' : 'w-full h-11'}`}>
                            <Settings className="w-5 h-5" />
                        </div>
                        <div className={`whitespace-nowrap overflow-hidden transition-all duration-500 ${isSidebarOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>
                            Settings
                        </div>
                    </button>
                </div>
            </aside>
            {
                showCreateFilterModal && (
                    <CreateFilterModal
                        onClose={() => setShowCreateFilterModal(false)}
                        onSave={handleCreateFilter}
                        editView={editingView || undefined}
                    />
                )
            }
        </>
    );
};