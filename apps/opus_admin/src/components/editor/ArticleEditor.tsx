'use client'

// TipTap article-body editor. Wraps the editor instance in EditorContext so
// the official TipTap UI components (toolbar, dropdowns, popovers) can
// consume it. Persists through the existing AdviceIdeasBodySection[] save
// path via legacyToTipTap / tiptapToLegacy.

import { useEditor, EditorContent, EditorContext } from '@tiptap/react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { buildArticleEditorExtensions } from '@/lib/editor/extensions'
import {
  legacyToTipTap,
  tiptapToLegacy,
  type ProseMirrorDoc,
} from '@/lib/editor/translate'
import type { AdviceIdeasBodySection } from '@/lib/cms/advice-ideas'
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap-ui-primitive/toolbar'
import { Spacer } from '@/components/tiptap-ui-primitive/spacer'
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu'
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu'
import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button'
import { ColorHighlightPopover } from '@/components/tiptap-ui/color-highlight-popover'
import { LinkPopover } from '@/components/tiptap-ui/link-popover'
import { MarkButton } from '@/components/tiptap-ui/mark-button'
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button'
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button'
import { Button } from '@/components/tiptap-ui-primitive/button'
import { ImagePlusIcon } from '@/components/tiptap-icons/image-plus-icon'
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

  if (!editor) return null

  return (
    <EditorContext.Provider value={{ editor }}>
      {editable && (
        <Toolbar>
          <ToolbarGroup>
            <UndoRedoButton action="undo" />
            <UndoRedoButton action="redo" />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <HeadingDropdownMenu modal={false} levels={[2, 3]} />
            <ListDropdownMenu
              modal={false}
              types={['bulletList', 'orderedList']}
            />
            <BlockquoteButton />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="underline" />
            <MarkButton type="strike" />
            <ColorHighlightPopover />
            <LinkPopover />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <MarkButton type="superscript" />
            <MarkButton type="subscript" />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <TextAlignButton align="left" />
            <TextAlignButton align="center" />
            <TextAlignButton align="right" />
            <TextAlignButton align="justify" />
          </ToolbarGroup>

          {onUploadImage && (
            <>
              <ToolbarSeparator />
              <ToolbarGroup>
                <ImageInsertButton editor={editor} onUploadImage={onUploadImage} />
              </ToolbarGroup>
            </>
          )}

          <Spacer />
        </Toolbar>
      )}
      <EditorContent editor={editor} />
    </EditorContext.Provider>
  )
}

// Custom image-insert button that uses our existing onUploadImage callback
// instead of the TipTap ImageUploadNode (which assumes a different upload
// pipeline). Keeps the visual style consistent with the rest of the toolbar.
function ImageInsertButton({
  editor,
  onUploadImage,
}: {
  editor: NonNullable<ReturnType<typeof useEditor>>
  onUploadImage: (file: File) => Promise<string>
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <Button
        type="button"
        data-style="ghost"
        aria-label="Insert image"
        tooltip="Insert image"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
      >
        <ImagePlusIcon className="tiptap-button-icon" />
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0]
          event.currentTarget.value = ''
          if (!file) return
          try {
            const url = await onUploadImage(file)
            editor
              .chain()
              .focus()
              .setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, '') })
              .run()
          } catch (err) {
            console.error('Image upload failed', err)
          }
        }}
      />
    </>
  )
}

function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter(Boolean).length
}
