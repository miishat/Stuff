/**
 * @file RichTextEditor.tsx
 * @description Rich text editor component using TipTap library.
 *              Provides formatting toolbar with bold, italic, lists, links, and undo/redo.
 * @author Mishat
 * @version 1.0.3
 */

import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Undo, Redo } from 'lucide-react';

/**
 * Props for the RichTextEditor component.
 */
interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const MenuButton: React.FC<{
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}> = ({ onClick, isActive, disabled, title, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-1.5 rounded transition-colors ${isActive
            ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
        {children}
    </button>
);

const MenuBar: React.FC<{ editor: Editor | null }> = ({ editor }) => {
    if (!editor) return null;

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL:', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="flex items-center gap-0.5 p-2 border-b border-slate-200 dark:border-slate-700 flex-wrap">
            <MenuButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold (Ctrl+B)"
            >
                <Bold className="w-4 h-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic (Ctrl+I)"
            >
                <Italic className="w-4 h-4" />
            </MenuButton>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

            <MenuButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
            >
                <ListOrdered className="w-4 h-4" />
            </MenuButton>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

            <MenuButton
                onClick={setLink}
                isActive={editor.isActive('link')}
                title="Add Link"
            >
                <LinkIcon className="w-4 h-4" />
            </MenuButton>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

            <MenuButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo (Ctrl+Z)"
            >
                <Undo className="w-4 h-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo (Ctrl+Shift+Z)"
            >
                <Redo className="w-4 h-4" />
            </MenuButton>
        </div>
    );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    content,
    onChange,
    placeholder = 'Add a more detailed description...'
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
                blockquote: false,
                horizontalRule: false,
            }),
            Link.configure({
                openOnClick: true,
                HTMLAttributes: {
                    class: 'text-brand-600 dark:text-brand-400 underline hover:no-underline',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[160px] p-4 text-slate-600 dark:text-slate-300',
            },
        },
    });

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};
