import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Project, Task, ColumnId, ColumnConfig, CustomView, Workspace, Label } from '../types';
import { exportData, importData, setupAutoBackup, performAutoBackup, verifyBackupPermission } from '../utils/backupUtils';

export type ViewType = 'board' | 'calendar' | 'analytics' | 'archive';
export type ViewFilter = 'project' | 'recent' | string; // 'project', 'recent', or custom view ID
export type Theme = 'light' | 'dark';

interface ModalConfig {
    type: 'confirm' | 'prompt' | 'options';
    title: string;
    message?: string;
    defaultValue?: string;
    options?: string[]; // For 'options' type
    confirmLabel?: string;
    onConfirm: (value?: string) => void;
}

interface StoreContextType {
    workspaces: Workspace[];
    activeWorkspaceId: string;
    projects: Project[];
    tasks: Task[];
    columns: ColumnConfig[];
    customViews: CustomView[];
    labels: Label[];
    activeProjectId: string;
    searchQuery: string;
    isSidebarOpen: boolean;
    currentView: ViewType;
    viewFilter: ViewFilter;
    priorityFilter: string | null;
    isSettingsOpen: boolean;
    isManageLabelsOpen: boolean;
    theme: Theme;
    activeModal: ModalConfig | null;
    recentViewGlobal: boolean;
    archivedTasks: Task[];
    pendingArchive: { task: Task; timeoutId: number } | null;

    // Actions
    setActiveWorkspaceId: (id: string) => void;
    addWorkspace: (name: string) => void;
    updateWorkspace: (id: string, name: string) => void;
    deleteWorkspace: (id: string) => void;

    setActiveProjectId: (id: string) => void;
    setSearchQuery: (query: string) => void;
    toggleSidebar: () => void;
    setCurrentView: (view: ViewType) => void;
    setViewFilter: (filter: ViewFilter) => void;
    setPriorityFilter: (priority: string | null) => void;
    setSettingsOpen: (isOpen: boolean) => void;
    setManageLabelsOpen: (isOpen: boolean) => void;
    toggleTheme: (theme: Theme) => void;
    toggleRecentViewGlobal: () => void;

    // Modal Actions
    openModal: (config: ModalConfig) => void;
    closeModal: () => void;

    // Data Manipulation
    addProject: (name: string, icon: string) => void;
    updateProject: (id: string, updates: { name?: string; icon?: string }) => void;
    deleteProject: (id: string) => void;

    addTask: (task: Task) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    moveTask: (taskId: string, newColumnId: ColumnId) => void;
    deleteTask: (taskId: string) => void;
    addSubtask: (taskId: string, title: string) => void;
    toggleSubtask: (taskId: string, subtaskId: string) => void;
    deleteSubtask: (taskId: string, subtaskId: string) => void;
    reorderSubtasks: (taskId: string, fromIndex: number, toIndex: number) => void;

    addColumn: () => void;
    updateColumn: (id: string, title: string) => void;
    deleteColumn: (id: string) => void;

    addCustomView: (name: string, filterType: 'priority' | 'label', filterValue: string | string[], allWorkspaces?: boolean) => void;
    updateCustomView: (id: string, updates: Partial<CustomView>) => void;
    deleteCustomView: (id: string) => void;

    addLabel: (name: string, color: string) => void;
    updateLabel: (id: string, updates: Partial<Label>) => void;
    deleteLabel: (id: string) => void;

    activeProject: Project | undefined;
    filteredTasks: Task[];
    filteredProjects: Project[]; // Projects in current workspace
    activeWorkspace: Workspace | undefined;
    filteredColumns: ColumnConfig[];

    // Backup
    exportData: () => void;
    importData: (file: File) => Promise<boolean>;
    isAutoBackupEnabled: boolean;
    autoBackupStatus: 'idle' | 'saving' | 'saved' | 'error' | 'permission-needed';
    enableAutoBackup: () => Promise<boolean>;
    disableAutoBackup: () => void;
    reauthorizeAutoBackup: () => Promise<void>;

    // Archive
    undoArchiveTask: () => void;
    restoreTask: (taskId: string) => void;
    permanentlyDeleteTask: (taskId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// localStorage keys
const STORAGE_KEYS = {
    workspaces: 'stuff_workspaces',
    projects: 'stuff_projects',
    tasks: 'stuff_tasks',
    columns: 'stuff_columns',
    customViews: 'stuff_customViews',
    theme: 'stuff_theme',
    activeWorkspaceId: 'stuff_activeWorkspaceId',
    activeProjectId: 'stuff_activeProjectId',
    labels: 'stuff_labels',
    autoBackupEnabled: 'stuff_autoBackupEnabled',
    archivedTasks: 'stuff_archivedTasks',
};

// Helper functions for localStorage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch {
        return fallback;
    }
};

const saveToStorage = <T,>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
};

// Initial Data (used as fallback when no saved data exists)
const INITIAL_WORKSPACES: Workspace[] = [
    { id: 'w1', name: 'My Workspace' }
];

const INITIAL_PROJECTS: Project[] = [
    { id: 'p1', workspaceId: 'w1', name: 'Product Launch v2', icon: '🚀', description: 'Q4 marketing and dev sync' },
    { id: 'p2', workspaceId: 'w1', name: 'Website Redesign', icon: '🎨', description: 'Migrating to Next.js' },
    { id: 'p3', workspaceId: 'w1', name: 'Mobile App', icon: '📱', description: 'iOS and Android feature parity' },
];

// Helper to generate default columns for a project
const generateDefaultColumns = (projectId: string): ColumnConfig[] => [
    { id: `col-${projectId}-todo`, projectId, title: 'To Do', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
    { id: `col-${projectId}-inprogress`, projectId, title: 'In Progress', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { id: `col-${projectId}-review`, projectId, title: 'Review', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    { id: `col-${projectId}-done`, projectId, title: 'Done', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
];

const INITIAL_COLUMNS: ColumnConfig[] = [
    ...generateDefaultColumns('p1'),
    ...generateDefaultColumns('p2'),
    ...generateDefaultColumns('p3'),
];

const INITIAL_TASKS: Task[] = [
    {
        id: 't1',
        projectId: 'p1',
        title: 'Finalize Pricing Strategy',
        description: 'Competitor analysis suggests we are underpriced in the Enterprise tier. Need to model new tiers.',
        priority: 'High',
        columnId: 'col-p1-todo',
        assignees: ['https://picsum.photos/30/30'],
        labels: ['Strategy'],
        dueDate: new Date().toISOString().split('T')[0],
        ticketLink: 'https://jira.example.com/browse/PROD-123'
    },
    {
        id: 't2',
        projectId: 'p1',
        title: 'Draft Press Release',
        description: 'Coordinate with the PR agency. Focus on the AI features and speed improvements.',
        priority: 'Medium',
        columnId: 'col-p1-inprogress',
        assignees: [],
        labels: ['Marketing'],
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    },
    {
        id: 't3',
        projectId: 'p1',
        title: 'QA Testing',
        description: 'Run automated E2E tests on the staging environment before final merge.',
        priority: 'High',
        columnId: 'col-p1-review',
        assignees: ['https://picsum.photos/31/31'],
        labels: ['Dev'],
        dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        ticketLink: 'https://github.com/org/repo/issues/456'
    },
    {
        id: 't4',
        projectId: 'p2',
        title: 'Select Color Palette',
        description: 'Choose primary and secondary colors that align with the new brand identity.',
        priority: 'Low',
        columnId: 'col-p2-done',
        assignees: [],
        labels: ['Design'],
        dueDate: new Date().toISOString().split('T')[0]
    },
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Load initial state from localStorage or use defaults
    const [workspaces, setWorkspaces] = useState<Workspace[]>(() =>
        loadFromStorage(STORAGE_KEYS.workspaces, INITIAL_WORKSPACES)
    );
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() =>
        loadFromStorage(STORAGE_KEYS.activeWorkspaceId, 'w1')
    );

    const [projects, setProjects] = useState<Project[]>(() =>
        loadFromStorage(STORAGE_KEYS.projects, INITIAL_PROJECTS)
    );
    const [tasks, setTasks] = useState<Task[]>(() =>
        loadFromStorage(STORAGE_KEYS.tasks, INITIAL_TASKS)
    );
    const [columns, setColumns] = useState<ColumnConfig[]>(() =>
        loadFromStorage(STORAGE_KEYS.columns, INITIAL_COLUMNS)
    );
    const [customViews, setCustomViews] = useState<CustomView[]>(() =>
        loadFromStorage(STORAGE_KEYS.customViews, [])
    );
    const [labels, setLabels] = useState<Label[]>(() =>
        loadFromStorage(STORAGE_KEYS.labels, [])
    );

    const [activeProjectId, setActiveProjectId] = useState<string>(() =>
        loadFromStorage(STORAGE_KEYS.activeProjectId, 'p1')
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentView, setCurrentView] = useState<ViewType>('board');
    const [viewFilter, setViewFilter] = useState<ViewFilter>('project');
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [isManageLabelsOpen, setManageLabelsOpen] = useState(false);
    const [theme, setTheme] = useState<Theme>(() =>
        loadFromStorage(STORAGE_KEYS.theme, 'light')
    );
    const [activeModal, setActiveModal] = useState<ModalConfig | null>(null);
    const [recentViewGlobal, setRecentViewGlobal] = useState<boolean>(() =>
        loadFromStorage('stuff_recentViewGlobal', false)
    );

    // Auto-Backup State
    const [isAutoBackupEnabled, setIsAutoBackupEnabled] = useState<boolean>(() =>
        loadFromStorage(STORAGE_KEYS.autoBackupEnabled, false)
    );
    const [autoBackupStatus, setAutoBackupStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'permission-needed'>('idle');
    const backupTimeoutRef = React.useRef<any>(null);

    // Archive State
    const [archivedTasks, setArchivedTasks] = useState<Task[]>(() =>
        loadFromStorage(STORAGE_KEYS.archivedTasks, [])
    );
    const [pendingArchive, setPendingArchive] = useState<{ task: Task; timeoutId: number } | null>(null);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.workspaces, workspaces);
    }, [workspaces]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.projects, projects);
    }, [projects]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.tasks, tasks);
    }, [tasks]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.columns, columns);
    }, [columns]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.customViews, customViews);
    }, [customViews]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.labels, labels);
    }, [labels]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.theme, theme);
    }, [theme]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.activeWorkspaceId, activeWorkspaceId);
    }, [activeWorkspaceId]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.activeProjectId, activeProjectId);
    }, [activeProjectId]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.archivedTasks, archivedTasks);
    }, [archivedTasks]);

    // Sync theme with document
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    const activeWorkspace = useMemo(() =>
        workspaces.find(w => w.id === activeWorkspaceId),
        [workspaces, activeWorkspaceId]);

    // Filter projects by current workspace
    const filteredProjects = useMemo(() =>
        projects.filter(p => p.workspaceId === activeWorkspaceId),
        [projects, activeWorkspaceId]);

    const activeProject = useMemo(() =>
        filteredProjects.find(p => p.id === activeProjectId),
        [filteredProjects, activeProjectId]);

    // Ensure activeProjectId is valid for the workspace
    useEffect(() => {
        if (filteredProjects.length > 0 && !filteredProjects.find(p => p.id === activeProjectId)) {
            setActiveProjectId(filteredProjects[0].id);
            setViewFilter('project');
        } else if (filteredProjects.length === 0) {
            // Safe fallback if no projects exist in workspace
            setViewFilter('my_tasks');
        }
    }, [activeWorkspaceId, filteredProjects]);

    const filteredTasks = useMemo(() => {
        // 0. Base Filter Setup
        const workspaceProjectIds = new Set(filteredProjects.map(p => p.id));

        // Check if current view is a custom view with global scope
        const activeCustomView = customViews.find(v => v.id === viewFilter);
        const isGlobalView = activeCustomView?.allWorkspaces;

        // Check if current view is the Recent view with global scope
        const isRecentGlobal = viewFilter === 'recent' && recentViewGlobal;

        return tasks.filter(t => {
            // 1. Enforce Workspace Boundary (unless global view or recent with global)
            if (!isGlobalView && !isRecentGlobal && !workspaceProjectIds.has(t.projectId)) {
                return false;
            }

            // 2. Filter by View Type
            let matchesView = true;
            if (viewFilter === 'project') {
                matchesView = t.projectId === activeProjectId;
            } else if (viewFilter === 'recent') {
                // Recent shows all tasks (optionally from all workspaces if recentViewGlobal)
                matchesView = true;
            } else {
                // Custom View Check
                if (activeCustomView) {
                    if (activeCustomView.filterType === 'priority') {
                        matchesView = t.priority === activeCustomView.filterValue;
                    } else if (activeCustomView.filterType === 'label') {
                        // Handle both single string and array of labels
                        const filterLabels = Array.isArray(activeCustomView.filterValue)
                            ? activeCustomView.filterValue
                            : [activeCustomView.filterValue];
                        // Task matches if it has ANY of the filter labels (case insensitive)
                        matchesView = t.labels.some(taskLabel =>
                            filterLabels.some(filterLabel =>
                                taskLabel.toLowerCase() === filterLabel.toLowerCase()
                            )
                        );
                    }
                }
            }

            // 3. Filter by Search
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase());

            // 4. Filter by Priority Dropdown (Local override)
            const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;

            return matchesView && matchesSearch && matchesPriority;
        });
    }, [tasks, activeProjectId, searchQuery, viewFilter, priorityFilter, customViews, filteredProjects, recentViewGlobal]);

    // Filter columns based on view. 
    const filteredColumns = useMemo(() => {
        // 1. PROJECT VIEW: Strict filtering by project ID
        if (viewFilter === 'project' && activeProject) {
            return columns.filter(c => c.projectId === activeProject.id);
        }

        // 2. AGGREGATE VIEWS: Group by Column Title (Virtual Columns)
        const relevantColumnIds = new Set(filteredTasks.map(t => t.columnId));

        const seenTitles = new Set<string>();
        const virtualColumns: ColumnConfig[] = [];

        columns.forEach(c => {
            if (relevantColumnIds.has(c.id) && !seenTitles.has(c.title)) {
                seenTitles.add(c.title);
                virtualColumns.push({
                    id: `virtual-${c.title}`,
                    projectId: 'virtual', // Marker for virtual
                    title: c.title,
                    color: c.color
                });
            }
        });

        return virtualColumns;
    }, [columns, viewFilter, activeProject, filteredTasks]);


    // --- Actions ---

    const addWorkspace = useCallback((name: string) => {
        const newWorkspaceId = `w${Date.now()}`;
        const newWorkspace: Workspace = { id: newWorkspaceId, name };

        // Create default project and columns for new workspace
        const defaultProjectId = `p${Date.now()}`;
        const defaultProject: Project = {
            id: defaultProjectId,
            workspaceId: newWorkspaceId,
            name: 'General',
            icon: '📁',
            description: ''
        };

        const newColumns = generateDefaultColumns(defaultProjectId);

        setWorkspaces(prev => [...prev, newWorkspace]);
        setProjects(prev => [...prev, defaultProject]);
        setColumns(prev => [...prev, ...newColumns]);

        setActiveWorkspaceId(newWorkspace.id);
        setActiveProjectId(defaultProject.id);
    }, []);

    const updateWorkspace = useCallback((id: string, name: string) => {
        setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name } : w));
    }, []);

    const deleteWorkspace = useCallback((id: string) => {
        // 1. Remove Workspace
        setWorkspaces(prev => prev.filter(w => w.id !== id));

        // 2. Identify Projects in Workspace
        // We need to use 'projects' from state here
        const projectsToDelete = projects.filter(p => p.workspaceId === id);
        const projectIdsToDelete = new Set(projectsToDelete.map(p => p.id));

        // 3. Remove Projects
        setProjects(prev => prev.filter(p => p.workspaceId !== id));

        // 4. Remove Tasks in those projects
        setTasks(prev => prev.filter(t => !projectIdsToDelete.has(t.projectId)));

        // 5. Remove Columns in those projects
        setColumns(prev => prev.filter(c => !projectIdsToDelete.has(c.projectId)));

        // 6. Reset Active Workspace if needed
        if (activeWorkspaceId === id) {
            const remainingWorkspaces = workspaces.filter(w => w.id !== id);
            if (remainingWorkspaces.length > 0) {
                setActiveWorkspaceId(remainingWorkspaces[0].id);
            } else {
                const newWs = { id: 'w-default', name: 'My Workspace' };
                setWorkspaces([newWs]);
                setActiveWorkspaceId(newWs.id);
            }
        }
    }, [projects, workspaces, activeWorkspaceId]);

    const addProject = useCallback((name: string, icon: string) => {
        const newProjectId = `p${Date.now()}`;
        const newProject: Project = {
            id: newProjectId,
            workspaceId: activeWorkspaceId,
            name,
            icon,
            description: 'New Project'
        };

        // Add default columns for this new project
        const newColumns = generateDefaultColumns(newProjectId);

        setProjects(prev => [...prev, newProject]);
        setColumns(prev => [...prev, ...newColumns]);
        setActiveProjectId(newProjectId);
        setViewFilter('project');
    }, [activeWorkspaceId]);

    const updateProject = useCallback((id: string, updates: { name?: string; icon?: string }) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }, []);

    const deleteProject = useCallback((id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        // Also delete tasks and columns associated with this project
        setTasks(prev => prev.filter(t => t.projectId !== id));
        setColumns(prev => prev.filter(c => c.projectId !== id));

        if (activeProjectId === id) {
            const remaining = filteredProjects.filter(p => p.id !== id);
            if (remaining.length > 0) {
                setActiveProjectId(remaining[0].id);
            } else {
                setViewFilter('recent'); // Fallback if no projects
            }
        }
    }, [activeProjectId, filteredProjects]);

    const addTask = useCallback((task: Task) => setTasks(prev => [...prev, task]), []);

    const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    }, []);

    const moveTask = useCallback((taskId: string, newColumnId: ColumnId) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, columnId: newColumnId } : t));
    }, []);

    const deleteTask = useCallback((taskId: string) => {
        // Find the task before removing
        const taskToArchive = tasks.find(t => t.id === taskId);
        if (!taskToArchive) return;

        // Remove from active tasks
        setTasks(prev => prev.filter(t => t.id !== taskId));

        // Clear any existing pending archive timeout
        if (pendingArchive) {
            clearTimeout(pendingArchive.timeoutId);
            // Move the previously pending task to archive
            setArchivedTasks(prev => [...prev, { ...pendingArchive.task, archivedAt: new Date().toISOString() }]);
        }

        // Set up new pending archive with 5 second undo window
        const timeoutId = window.setTimeout(() => {
            setArchivedTasks(prev => [...prev, { ...taskToArchive, archivedAt: new Date().toISOString() }]);
            setPendingArchive(null);
        }, 5000);

        setPendingArchive({ task: taskToArchive, timeoutId });
    }, [tasks, pendingArchive]);

    const undoArchiveTask = useCallback(() => {
        if (!pendingArchive) return;

        // Clear the timeout
        clearTimeout(pendingArchive.timeoutId);

        // Restore the task
        setTasks(prev => [...prev, pendingArchive.task]);
        setPendingArchive(null);
    }, [pendingArchive]);

    const restoreTask = useCallback((taskId: string) => {
        const taskToRestore = archivedTasks.find(t => t.id === taskId);
        if (!taskToRestore) return;

        // Remove archivedAt and restore
        const { archivedAt, ...restoredTask } = taskToRestore;
        setTasks(prev => [...prev, restoredTask as Task]);
        setArchivedTasks(prev => prev.filter(t => t.id !== taskId));
    }, [archivedTasks]);

    const permanentlyDeleteTask = useCallback((taskId: string) => {
        setArchivedTasks(prev => prev.filter(t => t.id !== taskId));
    }, []);

    const addSubtask = useCallback((taskId: string, title: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                const newSubtask = { id: `st-${Date.now()}`, title, completed: false };
                return { ...t, subtasks: [...(t.subtasks || []), newSubtask] };
            }
            return t;
        }));
    }, []);

    const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId && t.subtasks) {
                return {
                    ...t,
                    subtasks: t.subtasks.map(st =>
                        st.id === subtaskId ? { ...st, completed: !st.completed } : st
                    )
                };
            }
            return t;
        }));
    }, []);

    const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId && t.subtasks) {
                return { ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId) };
            }
            return t;
        }));
    }, []);

    const reorderSubtasks = useCallback((taskId: string, fromIndex: number, toIndex: number) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId && t.subtasks) {
                const newSubtasks = [...t.subtasks];
                const [removed] = newSubtasks.splice(fromIndex, 1);
                newSubtasks.splice(toIndex, 0, removed);
                return { ...t, subtasks: newSubtasks };
            }
            return t;
        }));
    }, []);

    const addColumn = useCallback(() => {
        // Determine which project this column belongs to.
        const targetProjectId = activeProjectId || filteredProjects[0]?.id;
        if (!targetProjectId) return;

        const newCol: ColumnConfig = {
            id: `col-${Date.now()}`,
            projectId: targetProjectId,
            title: 'New Section',
            color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
        };
        setColumns(prev => [...prev, newCol]);
    }, [activeProjectId, filteredProjects]);

    const updateColumn = useCallback((id: string, title: string) => {
        setColumns(prev => prev.map(c => c.id === id ? { ...c, title } : c));
    }, []);

    const deleteColumn = useCallback((id: string) => {
        setColumns(prev => prev.filter(c => c.id !== id));
        setTasks(prev => prev.filter(t => t.columnId !== id));
    }, []);

    const addCustomView = useCallback((name: string, filterType: 'priority' | 'label', filterValue: string | string[], allWorkspaces: boolean = false) => {
        const newView: CustomView = {
            id: `view-${Date.now()}`,
            name,
            filterType,
            filterValue,
            allWorkspaces,
            icon: filterType === 'priority' ? 'Flag' : 'Tag'
        };
        setCustomViews(prev => [...prev, newView]);
        setViewFilter(newView.id);
    }, []);

    const updateCustomView = useCallback((id: string, updates: Partial<CustomView>) => {
        setCustomViews(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    }, []);

    const deleteCustomView = useCallback((id: string) => {
        setCustomViews(prev => prev.filter(v => v.id !== id));
        if (viewFilter === id) {
            setViewFilter('my_tasks');
        }
    }, [viewFilter]);

    const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
    const toggleTheme = useCallback((newTheme: Theme) => setTheme(newTheme), []);
    const toggleRecentViewGlobal = useCallback(() => {
        setRecentViewGlobal(prev => {
            const newVal = !prev;
            saveToStorage('stuff_recentViewGlobal', newVal);
            return newVal;
        });
    }, []);

    const addLabel = useCallback((name: string, color: string) => {
        const newLabel: Label = { id: `lbl-${Date.now()}`, name, color };
        setLabels(prev => [...prev, newLabel]);
    }, []);

    const updateLabel = useCallback((id: string, updates: Partial<Label>) => {
        setLabels(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    }, []);

    const deleteLabel = useCallback((id: string) => {
        setLabels(prev => prev.filter(l => l.id !== id));
    }, []);

    // Wrap function in a closure to avoid state update issues if the config is a function
    const openModal = useCallback((config: ModalConfig) => setActiveModal(() => config), []);
    const closeModal = useCallback(() => setActiveModal(null), []);

    const handleImportData = useCallback(async (file: File) => {
        const success = await importData(file);
        if (success) {
            window.location.reload();
        }
        return success;
    }, []);

    const enableAutoBackup = useCallback(async () => {
        const success = await setupAutoBackup();
        if (success) {
            setIsAutoBackupEnabled(true);
            saveToStorage(STORAGE_KEYS.autoBackupEnabled, true);
            // Trigger an immediate backup
            performAutoBackup().then(res => {
                if (!res.success && res.error === 'permission-needed') {
                    setAutoBackupStatus('permission-needed');
                }
            });
        }
        return success;
    }, []);

    const disableAutoBackup = useCallback(() => {
        setIsAutoBackupEnabled(false);
        saveToStorage(STORAGE_KEYS.autoBackupEnabled, false);
        setAutoBackupStatus('idle');
    }, []);

    const reauthorizeAutoBackup = useCallback(async () => {
        const granted = await verifyBackupPermission();
        if (granted) {
            setAutoBackupStatus('idle');
            performAutoBackup().then(res => {
                if (res.success) {
                    setAutoBackupStatus('saved');
                    setTimeout(() => setAutoBackupStatus('idle'), 2000);
                } else {
                    setAutoBackupStatus('error');
                }
            });
        } else {
            setAutoBackupStatus('permission-needed');
        }
    }, []);

    // Auto-Backup Effect
    useEffect(() => {
        if (!isAutoBackupEnabled) return;

        // Clear existing timeout
        if (backupTimeoutRef.current) {
            clearTimeout(backupTimeoutRef.current);
        }

        // Debounce backup (30 seconds)
        backupTimeoutRef.current = setTimeout(async () => {
            if (!isAutoBackupEnabled) return;

            setAutoBackupStatus('saving');
            const result = await performAutoBackup();

            if (result.success) {
                setAutoBackupStatus('idle');
            } else {
                if (result.error === 'permission-needed') {
                    setAutoBackupStatus('permission-needed');
                } else {
                    setAutoBackupStatus('error');
                }
            }
        }, 30000); // 30s debounce

        return () => {
            if (backupTimeoutRef.current) clearTimeout(backupTimeoutRef.current);
        };
    }, [isAutoBackupEnabled, workspaces, projects, tasks, columns, customViews, labels, theme]);

    const contextValue = useMemo(() => ({
        workspaces,
        activeWorkspaceId,
        projects,
        tasks,
        columns,
        customViews,
        labels,
        activeProjectId,
        searchQuery,
        isSidebarOpen,
        currentView,
        viewFilter,
        priorityFilter,
        isSettingsOpen,
        isManageLabelsOpen,
        theme,
        activeModal,
        activeWorkspace,
        filteredProjects,
        filteredColumns,
        recentViewGlobal,
        setActiveWorkspaceId,
        addWorkspace,
        updateWorkspace,
        deleteWorkspace,
        setActiveProjectId,
        setSearchQuery,
        toggleSidebar,
        setCurrentView,
        setViewFilter,
        setPriorityFilter,
        setSettingsOpen,
        setManageLabelsOpen,
        toggleTheme,
        toggleRecentViewGlobal,
        openModal,
        closeModal,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        moveTask,
        deleteTask,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        reorderSubtasks,
        addColumn,
        updateColumn,
        deleteColumn,
        addCustomView,
        updateCustomView,
        deleteCustomView,
        addLabel,
        updateLabel,
        deleteLabel,
        exportData,
        importData: handleImportData,
        isAutoBackupEnabled,
        autoBackupStatus,
        enableAutoBackup,
        disableAutoBackup,
        reauthorizeAutoBackup,
        activeProject,
        filteredTasks,
        archivedTasks,
        pendingArchive,
        undoArchiveTask,
        restoreTask,
        permanentlyDeleteTask
    }), [
        workspaces,
        activeWorkspaceId,
        projects,
        tasks,
        columns,
        customViews,
        labels,
        activeProjectId,
        searchQuery,
        isSidebarOpen,
        currentView,
        viewFilter,
        priorityFilter,
        isSettingsOpen,
        isManageLabelsOpen,
        theme,
        activeModal,
        recentViewGlobal,
        isAutoBackupEnabled,
        autoBackupStatus,
        handleImportData,
        archivedTasks,
        pendingArchive,
        undoArchiveTask,
        restoreTask,
        permanentlyDeleteTask
    ]);


    return (
        <StoreContext.Provider value={contextValue}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};
