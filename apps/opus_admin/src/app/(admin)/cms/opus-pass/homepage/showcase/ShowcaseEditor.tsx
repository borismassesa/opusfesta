'use client'

import { useEffect, useState, useTransition } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import type {
  OpusPassHomepageShowcaseContent,
  OpusPassHomepageShowcaseImage,
} from '@/lib/cms/opus-pass-homepage-showcase'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import { useEditorActions } from '../EditorActionsContext'
import {
  discardOpusPassHomepageShowcaseDraft,
  publishOpusPassHomepageShowcase,
  saveOpusPassHomepageShowcaseDraft,
} from './actions'

type Props = {
  initial: OpusPassHomepageShowcaseContent
  hasDraft: boolean
}

const inputCls =
  'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A0DC] focus:border-transparent transition-all'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="border border-gray-200 rounded-lg p-3 pt-2 space-y-3">
      <legend className="px-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</legend>
      {children}
    </fieldset>
  )
}

export default function ShowcaseEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassHomepageShowcaseContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const setCaption = (patch: Partial<OpusPassHomepageShowcaseContent['caption']>) =>
    setDraft((d) => ({ ...d, caption: { ...d.caption, ...patch } }))

  const setImage = (idx: number, patch: Partial<OpusPassHomepageShowcaseImage>) =>
    setDraft((d) => ({
      ...d,
      images: d.images.map((img, i) => (i === idx ? { ...img, ...patch } : img)),
    }))
  const addImage = () =>
    setDraft((d) => ({ ...d, images: [...d.images, { src: '', alt: '' }] }))
  const removeImage = (idx: number) =>
    setDraft((d) => ({ ...d, images: d.images.filter((_, i) => i !== idx) }))
  const moveImage = (idx: number, delta: number) =>
    setDraft((d) => {
      const next = [...d.images]
      const target = idx + delta
      if (target < 0 || target >= next.length) return d
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return { ...d, images: next }
    })

  const runAction = (job: () => Promise<void>) =>
    startTransition(async () => {
      setError(null)
      try {
        await job()
      } catch (err) {
        setError(`That didn't go through: ${err instanceof Error ? err.message : String(err)}`)
        setMessage(null)
      }
    })

  const handleSaveDraft = () =>
    runAction(async () => {
      await saveOpusPassHomepageShowcaseDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassHomepageShowcaseDraft(draft)
      await publishOpusPassHomepageShowcase()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassHomepageShowcaseDraft()
      setDraft(initial)
      setHasDraft(false)
      setMessage('Draft discarded.')
    })

  useEffect(() => {
    bind({
      hasDraft,
      pending,
      message,
      error,
      onSaveDraft: handleSaveDraft,
      onPublish: handlePublish,
      onDiscard: handleDiscard,
    })
    return () => unbind()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDraft, pending, message, error, draft])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start pb-12">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-5">
        <h3 className="text-[15px] font-semibold text-gray-900">Photo showcase content</h3>
        <p className="text-xs text-gray-500 -mt-3">
          The masonry layout and the animated pills are fixed design. Edit the caption card and the
          photos (shown in order across the columns).
        </p>

        <FieldGroup label="Caption card">
          <Field label="Title">
            <input
              type="text"
              value={draft.caption.title}
              onChange={(e) => setCaption({ title: e.target.value })}
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="“By” line">
              <input
                type="text"
                value={draft.caption.by}
                onChange={(e) => setCaption({ by: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Brand">
              <input
                type="text"
                value={draft.caption.brand}
                onChange={(e) => setCaption({ brand: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup label={`Photos (${draft.images.length})`}>
          {draft.images.map((image, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 p-3 space-y-2 relative">
              <div className="absolute top-2 right-2 flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => moveImage(idx, -1)}
                  disabled={idx === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors"
                  aria-label="Move photo up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(idx, 1)}
                  disabled={idx === draft.images.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors"
                  aria-label="Move photo down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                  aria-label="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <ImageUploadField
                label={`Photo ${idx + 1}`}
                value={image.src}
                onChange={(next) => setImage(idx, { src: next })}
                pathPrefix="opus-pass/homepage/showcase"
                previewAspect="aspect-[3/4]"
                previewWidth="max-w-[140px]"
              />
              <Field label="Alt text">
                <input
                  type="text"
                  value={image.alt}
                  onChange={(e) => setImage(idx, { alt: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>
          ))}
          <button
            type="button"
            onClick={addImage}
            className="flex items-center gap-2 text-sm font-medium text-[#7E5896] hover:text-[#5d3a78] px-3 py-2 rounded-lg border border-dashed border-[#C9A0DC] hover:bg-[#F0DFF6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add photo
          </button>
        </FieldGroup>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Caption preview</h3>
          <span className="text-xs text-gray-400">Approximate</span>
        </div>
        <div className="px-1">
          <h3 className="text-lg font-bold leading-tight tracking-tight text-[#1A1A1A]">
            {draft.caption.title || 'Caption title'}
          </h3>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#9FE870] text-sm font-extrabold text-[#1A1A1A]">
              O.
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-[#1A1A1A]">{draft.caption.by}</span>
              <span className="block text-sm text-[#1A1A1A]/65">{draft.caption.brand}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
