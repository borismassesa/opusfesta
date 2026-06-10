'use client'

import { useEffect } from 'react'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap-ui-primitive/toolbar'
import { MarkButton } from '@/components/tiptap-ui/mark-button'
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu'
import { LinkPopover } from '@/components/tiptap-ui/link-popover'
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button'

import '@/components/tiptap-node/list-node/list-node.scss'
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss'

// Compact, controlled TipTap rich-text field that stores its content as an HTML
// string. Reuses the shared TipTap toolbar primitives so it matches the rest of
// the admin. Use for short formatted copy (e.g. product descriptions) where a
// plain <textarea> can't render bullet lists, bold, or links.
const EMPTY_DOC = '<p></p>'

// Pressing Enter on an EMPTY list item leaves the list (back to a normal
// paragraph) instead of endlessly adding empty bullets — so after a bulleted
// section the admin can press Enter on the blank bullet and keep writing prose.
// Higher priority than the default list keymap so it runs first; returns false
// on non-empty items so the normal "split into a new item" behaviour still
// applies.
//
// `liftListItem` handles every well-formed list, but designer-imported
// descriptions can carry malformed list structures (stray bullets, hard breaks)
// where a plain lift can no-op. The fallbacks guarantee the cursor is never
// trapped inside a list: drop the empty block out, or clear list formatting
// outright.
const ListExitOnEnter = Extension.create({
  name: 'listExitOnEnter',
  priority: 1000,
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { editor } = this
        if (!editor.isActive('listItem')) return false
        const { $from, empty } = editor.state.selection
        if (!empty || $from.parent.content.size > 0) return false
        return (
          editor.chain().focus().liftListItem('listItem').run() ||
          editor.chain().focus().liftEmptyBlock().run() ||
          editor.chain().focus().clearNodes().run()
        )
      },
    }
  },
})

export function RichTextField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const editor = useEditor({
    // Avoid SSR hydration mismatches in Next.js — render after mount.
    immediatelyRender: false,
    extensions: [
      // Headings/code blocks don't belong in a short description.
      StarterKit.configure({ heading: false, codeBlock: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
      ListExitOnEnter,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'tiptap ProseMirror min-h-[120px] px-3 py-2 text-sm leading-relaxed text-gray-900 focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#7A4F8E] [&_a]:underline',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === EMPTY_DOC ? '' : html)
    },
  })

  // Reconcile external value changes (form reset, async load) without
  // clobbering the cursor/selection while the user is typing.
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const normalized = current === EMPTY_DOC ? '' : current
    if (value !== normalized) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [value, editor])

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-all focus-within:border-transparent focus-within:ring-2 focus-within:ring-[#C9A0DC]">
      {editor && (
        <EditorContext.Provider value={{ editor }}>
          <Toolbar variant="fixed" className="border-b border-gray-200">
            <ToolbarGroup>
              <MarkButton type="bold" />
              <MarkButton type="italic" />
              <MarkButton type="strike" />
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
              <ListDropdownMenu modal={false} types={['bulletList', 'orderedList']} />
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
              <LinkPopover />
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
              <UndoRedoButton action="undo" />
              <UndoRedoButton action="redo" />
            </ToolbarGroup>
          </Toolbar>
          <EditorContent editor={editor} />
        </EditorContext.Provider>
      )}
    </div>
  )
}
