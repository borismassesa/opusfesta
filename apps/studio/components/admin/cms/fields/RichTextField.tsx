'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import type { Content } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import {
  BsTypeBold, BsTypeItalic, BsTypeH2, BsTypeH3,
  BsListUl, BsListOl, BsChatQuote, BsCode, BsLink45Deg,
} from 'react-icons/bs';
import type { RichTextField as RichTextFieldDef } from '@/lib/cms/types/define';

// Tiptap document shape we store in draft_content.
// Permissive: we treat the JSON as an opaque structured blob and let
// Tiptap validate on parse. The Zod schema is `z.any()` for richtext fields.
export type RichTextDoc = {
  type: 'doc';
  content?: unknown[];
};

const EMPTY_DOC: RichTextDoc = { type: 'doc', content: [{ type: 'paragraph' }] };

interface RichTextFieldProps {
  field: RichTextFieldDef;
  value: unknown;
  onChange: (value: RichTextDoc) => void;
  error?: string;
  disabled?: boolean;
}

function coerceDoc(value: unknown): RichTextDoc {
  if (value && typeof value === 'object' && (value as { type?: unknown }).type === 'doc') {
    return value as RichTextDoc;
  }
  return EMPTY_DOC;
}

export default function RichTextField({ field, value, onChange, error, disabled }: RichTextFieldProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
    ],
    content: coerceDoc(value) as unknown as Content,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onChange(e.getJSON() as RichTextDoc);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[180px] px-3 py-2 focus:outline-none [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-bold [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--admin-sidebar-border)] [&_blockquote]:pl-3 [&_blockquote]:text-[var(--admin-muted)] [&_code]:bg-[var(--admin-sidebar-accent)] [&_code]:px-1 [&_code]:rounded [&_a]:text-[var(--admin-primary)] [&_a]:underline',
      },
    },
  });

  // Sync external value changes (e.g. form reset after save).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getJSON();
    const incoming = coerceDoc(value);
    if (JSON.stringify(current) !== JSON.stringify(incoming)) {
      editor.commands.setContent(incoming as unknown as Content, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) {
    return (
      <div>
        <FieldLabel field={field} />
        <div className="h-[180px] border border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-accent)] animate-pulse" />
      </div>
    );
  }

  const features = field.features ?? ['bold', 'italic', 'link', 'heading', 'list', 'blockquote', 'code'];
  const has = (f: string) => features.includes(f as 'bold');

  const addLink = () => {
    const current = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter URL', current ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div>
      <FieldLabel field={field} />
      <div className={`border ${error ? 'border-red-300' : 'border-[var(--admin-sidebar-border)]'} bg-white`}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--admin-sidebar-border)] px-2 py-1.5">
          {has('bold') && (
            <ToolbarButton
              active={editor.isActive('bold')}
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold (⌘B)"
            >
              <BsTypeBold className="w-3.5 h-3.5" />
            </ToolbarButton>
          )}
          {has('italic') && (
            <ToolbarButton
              active={editor.isActive('italic')}
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic (⌘I)"
            >
              <BsTypeItalic className="w-3.5 h-3.5" />
            </ToolbarButton>
          )}
          {has('link') && (
            <ToolbarButton
              active={editor.isActive('link')}
              disabled={disabled}
              onClick={addLink}
              title="Link"
            >
              <BsLink45Deg className="w-3.5 h-3.5" />
            </ToolbarButton>
          )}
          {has('heading') && (
            <>
              <div className="mx-1 h-4 w-px bg-[var(--admin-sidebar-border)]" />
              <ToolbarButton
                active={editor.isActive('heading', { level: 2 })}
                disabled={disabled}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                title="Heading 2"
              >
                <BsTypeH2 className="w-3.5 h-3.5" />
              </ToolbarButton>
              <ToolbarButton
                active={editor.isActive('heading', { level: 3 })}
                disabled={disabled}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                title="Heading 3"
              >
                <BsTypeH3 className="w-3.5 h-3.5" />
              </ToolbarButton>
            </>
          )}
          {has('list') && (
            <>
              <div className="mx-1 h-4 w-px bg-[var(--admin-sidebar-border)]" />
              <ToolbarButton
                active={editor.isActive('bulletList')}
                disabled={disabled}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title="Bullet list"
              >
                <BsListUl className="w-3.5 h-3.5" />
              </ToolbarButton>
              <ToolbarButton
                active={editor.isActive('orderedList')}
                disabled={disabled}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title="Ordered list"
              >
                <BsListOl className="w-3.5 h-3.5" />
              </ToolbarButton>
            </>
          )}
          {has('blockquote') && (
            <ToolbarButton
              active={editor.isActive('blockquote')}
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Quote"
            >
              <BsChatQuote className="w-3.5 h-3.5" />
            </ToolbarButton>
          )}
          {has('code') && (
            <ToolbarButton
              active={editor.isActive('code')}
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleCode().run()}
              title="Inline code"
            >
              <BsCode className="w-3.5 h-3.5" />
            </ToolbarButton>
          )}
        </div>

        <EditorContent editor={editor} />
      </div>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
      {field.help && <p className="mt-1 text-[11px] text-[var(--admin-muted)]">{field.help}</p>}
    </div>
  );
}

function FieldLabel({ field }: { field: RichTextFieldDef }) {
  return (
    <label className="block mb-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-foreground)]">
        {field.label}
      </span>
      {field.required && <span className="text-red-600 ml-1">*</span>}
    </label>
  );
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center justify-center w-7 h-7 transition-colors ${
        active
          ? 'bg-[var(--admin-primary)] text-white'
          : 'text-[var(--admin-muted)] hover:bg-[var(--admin-sidebar-accent)] hover:text-[var(--admin-foreground)]'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}
