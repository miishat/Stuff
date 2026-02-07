/**
 * @file types.ts
 * @description TypeScript type definitions for the Stuff task management application.
 *              Contains all core data models including tasks, projects, workspaces,
 *              columns, labels, and custom views.
 * @author Mishat
 * @version 1.0.3
 */

/**
 * Task priority levels.
 * Used to categorize tasks by urgency.
 */
export type Priority = 'Low' | 'Medium' | 'High';

/**
 * Unique identifier for kanban board columns.
 */
export type ColumnId = string;

/**
 * Represents a workspace container for organizing projects.
 * Workspaces provide top-level organization for multiple projects.
 */
export interface Workspace {
    /** Unique identifier for the workspace */
    id: string;
    /** Display name of the workspace */
    name: string;
}

/**
 * Represents a subtask within a parent task.
 * Subtasks can be checked off independently.
 */
export interface Subtask {
    /** Unique identifier for the subtask */
    id: string;
    /** Subtask description text */
    title: string;
    /** Whether the subtask has been completed */
    completed: boolean;
}

/**
 * Represents a label that can be applied to tasks.
 * Labels help categorize and filter tasks.
 */
export interface Label {
    /** Unique identifier for the label */
    id: string;
    /** Display name of the label */
    name: string;
    /** Color for the label (Tailwind color class or hex value) */
    color: string;
}

/**
 * Represents a task in the kanban board.
 * Tasks are the primary work items in the application.
 */
export interface Task {
    /** Unique identifier for the task */
    id: string;
    /** Task title/name */
    title: string;
    /** Detailed description of the task (supports rich text) */
    description: string;
    /** Priority level of the task */
    priority: Priority;
    /** ID of the column this task belongs to */
    columnId: ColumnId;
    /** ID of the project this task belongs to */
    projectId: string;
    /** Array of avatar URLs for assigned users */
    assignees: string[];
    /** Optional due date in ISO string format */
    dueDate?: string;
    /** Array of label names applied to this task */
    labels: string[];
    /** Optional external ticket/issue URL */
    ticketLink?: string;
    /** Optional array of subtasks */
    subtasks?: Subtask[];
    /** ISO date string when task was archived (if archived) */
    archivedAt?: string;
}

/**
 * Represents a project within a workspace.
 * Projects group related tasks together.
 */
export interface Project {
    /** Unique identifier for the project */
    id: string;
    /** ID of the workspace this project belongs to */
    workspaceId: string;
    /** Display name of the project */
    name: string;
    /** Emoji icon representing the project */
    icon: string;
    /** Brief description of the project */
    description: string;
}

/**
 * Configuration for a kanban board column.
 * Columns represent different stages in a workflow.
 */
export interface ColumnConfig {
    /** Unique identifier for the column */
    id: ColumnId;
    /** ID of the project this column belongs to */
    projectId: string;
    /** Display title of the column */
    title: string;
    /** Tailwind CSS color classes for the column badge */
    color: string;
    /** Whether the column is currently collapsed */
    isCollapsed?: boolean;
}

/**
 * Represents a saved custom filter view.
 * Custom views allow users to create filtered views of tasks.
 */
export interface CustomView {
    /** Unique identifier for the view */
    id: string;
    /** Display name of the view */
    name: string;
    /** Lucide icon name or component for the view */
    icon: any;
    /** Type of filter applied ('priority' or 'label') */
    filterType: 'priority' | 'label';
    /** Filter value(s) - single string or array for multi-select */
    filterValue: string | string[];
    /** Whether this view spans all workspaces */
    allWorkspaces?: boolean;
}