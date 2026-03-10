'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Minus, Link, Image, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExt.configure({ inline: false }),
      LinkExt.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none' },
    },
  });

  if (!editor) return null;

  const btn = (active: boolean) => `p-1.5 transition-colors ${active ? 'bg-brand-accent/10 text-brand-accent' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`;

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border border-gray-300">
      <div className="flex flex-wrap gap-0.5 p-2 border-b border-gray-200 bg-gray-50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))}><Bold className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))}><Italic className="w-4 h-4" /></button>
        <span className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))}><Heading2 className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))}><Heading3 className="w-4 h-4" /></button>
        <span className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))}><List className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))}><ListOrdered className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))}><Quote className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn(false)}><Minus className="w-4 h-4" /></button>
        <span className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <button type="button" onClick={addLink} className={btn(editor.isActive('link'))}><Link className="w-4 h-4" /></button>
        <button type="button" onClick={addImage} className={btn(false)}><Image className="w-4 h-4" /></button>
        <span className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)}><Undo className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)}><Redo className="w-4 h-4" /></button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
