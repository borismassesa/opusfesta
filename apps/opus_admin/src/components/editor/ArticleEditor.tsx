'use client'

// TipTap article-body editor. Step 1 of the OF-ADM-EDITOR-001 migration —
// renders the body via a real rich-text engine instead of the legacy block-
// form, while persisting through the existing `AdviceIdeasBodySection[]` save
// path. Slash menu / drag handle / bubble menu / custom embed/gallery/section
// nodes land in subsequent steps.

import { useEditor, EditorContent } from '@tiptap/react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { buildArticleEditorExtensions } from '@/lib/editor/extensions'
import {
  legacyToTipTap,
  tiptapToLegacy,
  type ProseMirrorDoc,
} from '@/lib/editor/translate'
import type { AdviceIdeasBodySection } from '@/lib/cms/advice-ideas'
import EditorToolbar from './EditorToolbar'
import './article-editor.css'

type Props = {
  value: AdviceIdeasBodySection[]
  onChange: (next: AdviceIdeasBodySection[]) => void
  onWordCountChange?: (words: number) => void
  placeholder?: string
  mode?: 'admin' | 'contributor'
  editable?: boolean
  onUploadImage?: (file: File) => Promise<string>
}

export default function ArticleEditor({
  value,
  onChange,
  onWordCountChange,
  placeholder,
  mode = 'admin',
  editable = true,
  onUploadImage,
}: Props) {
  // Build the initial doc from `value` exactly once. Subsequent prop changes
  // are reconciled by an external sync below — re-running `legacyToTipTap`
  // every render would clobber cursor/selection state mid-typing.
  const initialDoc = useMemo<ProseMirrorDoc>(
    () => legacyToTipTap(value),
    // Intentionally only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Cache the latest serialised JSON we emitted, so we can no-op when the
  // parent passes back the same `value` (which would otherwise loop).
  const lastEmittedRef = useRef<string>('')
  const onChangeRef = useRef(onChange)
  const onWordCountRef = useRef(onWordCountChange)
  onChangeRef.current = onChange
  onWordCountRef.current = onWordCountChange

  const extensions = useMemo(
    () => buildArticleEditorExtensions({ placeholder: placeholder ?? undefined, mode }),
    [placeholder, mode]
  )

  const editor = useEditor({
    extensions,
    content: initialDoc,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const doc = editor.getJSON() as ProseMirrorDoc
      const next = tiptapToLegacy(doc)
      const serialised = JSON.stringify(next)
      if (serialised === lastEmittedRef.current) return
      lastEmittedRef.current = serialised
      onChangeRef.current(next)

      const wc =
        editor.storage.characterCount?.words?.() ??
        countWords(editor.getText())
      onWordCountRef.current?.(wc)
    },
    editorProps: {
      attributes: {
        class: 'article-editor',
        // Improves screen-reader announcements for the editing surface.
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
  })

  useEffect(() => {
    editor?.setEditable(editable)
  }, [editor, editable])

  // External sync — when the parent replaces `value` with a doc that didn't
  // come from us (e.g. a server-side autosave restoration), update the editor
  // without disturbing the cursor unless the content actually differs.
  const externalSync = useCallback(
    (next: AdviceIdeasBodySection[]) => {
      if (!editor) return
      const incoming = JSON.stringify(next)
      if (incoming === lastEmittedRef.current) return
      const nextDoc = legacyToTipTap(next)
      lastEmittedRef.current = incoming
      editor.commands.setContent(nextDoc, { emitUpdate: false })
    },
    [editor]
  )
  useEffect(() => {
    externalSync(value)
  }, [value, externalSync])

  // Emit the initial word count once the editor mounts.
  useEffect(() => {
    if (!editor) return
    const wc =
      editor.storage.characterCount?.words?.() ?? countWords(editor.getText())
    onWordCountRef.current?.(wc)
  }, [editor])

  return (
    <div>
      {editable && <EditorToolbar editor={editor} onUploadImage={onUploadImage} />}
      <EditorContent editor={editor} />
    </div>
  )
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0
}
