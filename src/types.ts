export type Priority = 'Low' | 'Medium' | 'High';

export type ColumnId = string;

export interface Workspace {
    id: string;
    name: string;
}

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
}

export interface Label {
    id: string;
    name: string;
    color: string; // Tailwind color class or hex
}

export interface Task {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    columnId: ColumnId;
    projectId: string;
    assignees: string[]; // URLs to avatars
    dueDate?: string;
    labels: string[];
    ticketLink?: string;
    subtasks?: Subtask[];
}

export interface Project {
    id: string;
    workspaceId: string;
    name: string;
    icon: string; // Emoji
    description: string;
}

export interface ColumnConfig {
    id: ColumnId;
    projectId: string;
    title: string;
    color: string;
}

export interface CustomView {
    id: string;
    name: string;
    icon: any; // Lucide icon name or component
    filterType: 'priority' | 'label';
    filterValue: string | string[]; // Single value or array for multi-select
    allWorkspaces?: boolean;
}