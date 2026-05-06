'use client'

import { useCallback } from 'react'
import { ArticleEditor } from '@/lib/editor'
import type { AdviceIdeasBodySection } from '@/lib/cms/advice-ideas'
import StatusFooter from './StatusFooter'

export default function WritingCanvas({
  draftId,
  title,
  summary,
  body,
  wordCount,
  readOnly,
  saveState,
  onTitleChange,
  onSummaryChange,
  onBodyChange,
  onWordCountChange,
}: {
  draftId: string
  title: string
  summary: string
  body: AdviceIdeasBodySection[]
  wordCount: number
  readOnly: boolean
  saveState: 'saved' | 'saving' | 'failed'
  onTitleChange: (value: string) => void
  onSummaryChange: (value: string) => void
  onBodyChange: (value: AdviceIdeasBodySection[]) => void
  onWordCountChange: (value: number) => void
}) {
  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      const form = new FormData()
      form.append('file', file)
      const response = await fetch(`/api/contribute/drafts/${draftId}/media`, {
        method: 'POST',
        body: form,
      })
      const payload = (await response.json().catch(() => ({}))) as {
        url?: string
        error?: string
      }
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || 'Image upload failed.')
      }
      return payload.url
    },
    [draftId]
  )

  return (
    <div className="min-w-0">
      <input
        aria-label="Article title"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        readOnly={readOnly}
        placeholder="Article title"
        className="block w-full border-0 bg-transparent p-0 text-[28px] font-medium leading-tight text-gray-950 outline-none placeholder:text-gray-400 read-only:cursor-default"
      />
      <textarea
        aria-label="Article summary"
        value={summary}
        onChange={(event) => {
          onSummaryChange(event.target.value)
          event.currentTarget.style.height = 'auto'
          event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`
        }}
        readOnly={readOnly}
        placeholder="Short summary for editors and readers - what is this piece about?"
        rows={2}
        className="mt-7 block min-h-[48px] w-full resize-none border-0 bg-transparent p-0 text-sm leading-[1.6] text-gray-600 outline-none placeholder:text-gray-400 read-only:cursor-default"
      />
      <div className="my-8 h-px bg-gray-200" />
      <ArticleEditor
        value={body}
        onChange={onBodyChange}
        onWordCountChange={onWordCountChange}
        mode="contributor"
        editable={!readOnly}
        placeholder="Start writing, or use the toolbar to insert a heading, list, image..."
        onUploadImage={uploadImage}
      />
      <StatusFooter wordCount={wordCount} saveState={saveState} />
    </div>
  )
}
