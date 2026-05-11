'use client'

import { useCallback, useEffect, useRef } from 'react'
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
  const titleRef = useRef<HTMLTextAreaElement>(null)
  // Auto-grow the title textarea on initial mount + when value changes
  // externally (server-side autosave restoration). Same pattern the
  // summary textarea below uses.
  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [title])

  const uploadMedia = useCallback(
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
        throw new Error(payload.error || 'Upload failed.')
      }
      return payload.url
    },
    [draftId]
  )

  return (
    <div className="min-w-0">
      <textarea
        ref={titleRef}
        aria-label="Article title"
        value={title}
        onChange={(event) => {
          onTitleChange(event.target.value)
          event.currentTarget.style.height = 'auto'
          event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`
        }}
        onKeyDown={(event) => {
          // Titles are single-paragraph — Enter shouldn't insert a newline.
          // Wrapping happens automatically as text fills width.
          if (event.key === 'Enter') event.preventDefault()
        }}
        readOnly={readOnly}
        placeholder="Article title"
        rows={1}
        className="block w-full resize-none border-0 bg-transparent p-0 text-[28px] font-medium leading-tight text-gray-950 outline-none placeholder:text-gray-400 read-only:cursor-default"
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
      {(() => {
        // Soft 50-word limit on the summary — matches the admin editor.
        // The summary renders unclamped on the public listing's trending
        // hero card, so an overly long one pushes layout. Advisory only.
        const SUMMARY_MAX_WORDS = 50
        const trimmed = summary.trim()
        const words = trimmed
          ? trimmed.split(/\s+/).filter(Boolean).length
          : 0
        const over = words > SUMMARY_MAX_WORDS
        const near = !over && words > SUMMARY_MAX_WORDS * 0.85
        const tone = over
          ? 'text-rose-600'
          : near
            ? 'text-amber-600'
            : 'text-gray-400'
        return (
          <p className={`mt-2 text-[11px] tabular-nums font-medium ${tone}`}>
            {words}/{SUMMARY_MAX_WORDS} words
            {over && ' · trim for cleaner card layout'}
          </p>
        )
      })()}
      <div className="my-8 h-px bg-gray-200" />
      <ArticleEditor
        value={body}
        onChange={onBodyChange}
        onWordCountChange={onWordCountChange}
        mode="contributor"
        editable={!readOnly}
        placeholder="Start writing, or use the toolbar to insert a heading, list, image, video..."
        onUploadImage={uploadMedia}
        onUploadVideo={uploadMedia}
      />
      <StatusFooter wordCount={wordCount} saveState={saveState} />
    </div>
  )
}
