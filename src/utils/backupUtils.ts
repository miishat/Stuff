export interface BackupData {
    workspaces: any[];
    projects: any[];
    tasks: any[];
    columns: any[];
    customViews: any[];
    labels: any[];
    theme: any;
    timestamp: number;
    version: number;
}

const STORAGE_KEYS = [
    'stuff_workspaces',
    'stuff_projects',
    'stuff_tasks',
    'stuff_columns',
    'stuff_customViews',
    'stuff_labels',
    'stuff_theme'
];

export const exportData = (): void => {
    const data: any = {};
    STORAGE_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            data[key] = JSON.parse(value);
        }
    });

    data.timestamp = Date.now();
    data.version = 1;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `stuff-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                if (!content) return resolve(false);

                const data = JSON.parse(content);

                // Basic validation
                if (!data.stuff_workspaces && !data.stuff_projects) {
                    throw new Error('Invalid backup file');
                }

                // Restore data
                STORAGE_KEYS.forEach(key => {
                    if (data[key]) {
                        localStorage.setItem(key, JSON.stringify(data[key]));
                    }
                });

                resolve(true);
            } catch (error) {
                console.error('Import failed:', error);
                reject(error);
            }
        };

        reader.readAsText(file);
    });
};

// IndexedDB Utilities for File System Handles
const DB_NAME = 'StuffBackupDB';
const STORE_NAME = 'handles';

// Minimal Type Definitions for File System Access API
interface FileSystemHandle {
    kind: 'file' | 'directory';
    name: string;
    isSameEntry(other: FileSystemHandle): Promise<boolean>;
    queryPermission(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
    requestPermission(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
    kind: 'directory';
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
    getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
}

interface FileSystemFileHandle extends FileSystemHandle {
    kind: 'file';
    createWritable(options?: { keepExistingData?: boolean }): Promise<FileSystemWritableFileStream>;
    getFile(): Promise<File>;
}

interface FileSystemWritableFileStream extends WritableStream {
    write(data: any): Promise<void>;
    seek(position: number): Promise<void>;
    truncate(size: number): Promise<void>;
    close(): Promise<void>;
}

const initDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const saveBackupHandle = async (handle: FileSystemDirectoryHandle): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(handle, 'backup_dir');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

export const getBackupHandle = async (): Promise<FileSystemDirectoryHandle | null> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get('backup_dir');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
    });
};

export const setupAutoBackup = async (): Promise<boolean> => {
    if (!('showDirectoryPicker' in window)) {
        alert('Your browser does not support the File System Access API.');
        return false;
    }
    try {
        const handle = await (window as any).showDirectoryPicker();
        await saveBackupHandle(handle as FileSystemDirectoryHandle);
        return true;
    } catch (err) {
        console.error('Failed to setup auto-backup:', err);
        return false;
    }
};

export const verifyBackupPermission = async (): Promise<boolean> => {
    try {
        const handle = await getBackupHandle();
        if (!handle) return false;

        const permission = await handle.queryPermission({ mode: 'readwrite' });
        if (permission === 'granted') return true;

        const newPermission = await handle.requestPermission({ mode: 'readwrite' });
        return newPermission === 'granted';
    } catch (err) {
        console.error('Failed to verify permission:', err);
        return false;
    }
};

export const performAutoBackup = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        const handle = await getBackupHandle();
        if (!handle) return { success: false, error: 'No backup handle' };

        // Verify permission
        const permission = await handle.queryPermission({ mode: 'readwrite' });
        if (permission !== 'granted') {
            // We cannot request permission here without user gesture if it's 'prompt'
            return { success: false, error: 'permission-needed' };
        }

        const data: any = {};
        STORAGE_KEYS.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                data[key] = JSON.parse(value);
            }
        });

        data.timestamp = Date.now();
        data.version = 1;

        // Use a fixed name for the latest auto-backup
        const fileHandle = await handle.getFileHandle('stuff-auto-backup.json', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(data, null, 2));
        await writable.close();

        return { success: true };
    } catch (err: any) {
        console.error('Auto-backup failed:', err);
        return { success: false, error: err.message || 'Unknown error' };
    }
};
