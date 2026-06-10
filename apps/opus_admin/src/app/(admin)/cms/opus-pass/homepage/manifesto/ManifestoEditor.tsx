'use client'

import { useEffect, useState, useTransition } from 'react'
import type { OpusPassHomepageManifestoContent } from '@/lib/cms/opus-pass-homepage-manifesto'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import { resolveOpusPassAssetUrl } from '@/lib/cms/opus-pass-asset-url'
import { cn } from '@/lib/utils'
import { useEditorActions } from '../EditorActionsContext'
import {
  discardOpusPassHomepageManifestoDraft,
  publishOpusPassHomepageManifesto,
  saveOpusPassHomepageManifestoDraft,
} from './actions'

type Props = {
  initial: OpusPassHomepageManifestoContent
  hasDraft: boolean
}

const inputCls =
  'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A0DC] focus:border-transparent transition-all'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-600">{label}</span>
        {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
      </div>
      {children}
    </label>
  )
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = (value ?? '').length
  const over = len > max
  const near = !over && len > max * 0.85
  return (
    <span className={cn('tabular-nums font-medium', over ? 'text-red-500' : near ? 'text-amber-600' : 'text-gray-400')}>
      {len}/{max}
    </span>
  )
}

function InlineImg({ src }: { src: string }) {
  if (!src) {
    return (
      <span className="inline-block h-[1.05em] w-[0.85em] -translate-y-[0.08em] rounded-[0.18em] border border-dashed border-gray-300 align-middle" />
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolveOpusPassAssetUrl(src)}
      alt=""
      className="inline-block h-[1.05em] w-[0.85em] -translate-y-[0.08em] rounded-[0.18em] object-cover align-middle shadow-sm ring-1 ring-black/10"
    />
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

export default function ManifestoEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassHomepageManifestoContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(initial))
  const isDirty = JSON.stringify(draft) !== savedSnapshot
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const setField = <K extends keyof OpusPassHomepageManifestoContent>(
    key: K,
    value: OpusPassHomepageManifestoContent[K],
  ) => setDraft((d) => ({ ...d, [key]: value }))

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
      await saveOpusPassHomepageManifestoDraft(draft)
      setHasDraft(true)
      setSavedSnapshot(JSON.stringify(draft))
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassHomepageManifestoDraft(draft)
      await publishOpusPassHomepageManifesto()
      setHasDraft(false)
      setSavedSnapshot(JSON.stringify(draft))
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassHomepageManifestoDraft()
      setDraft(initial)
      setHasDraft(false)
      setSavedSnapshot(JSON.stringify(initial))
      setMessage('Draft discarded.')
    })

  useEffect(() => {
    bind({
      hasDraft,
      isDirty,
      pending,
      message,
      error,
      onSaveDraft: handleSaveDraft,
      onPublish: handlePublish,
      onDiscard: handleDiscard,
    })
    return () => unbind()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDraft, isDirty, pending, message, error, draft])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start pb-12">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-5">
        <h3 className="text-[15px] font-semibold text-gray-900">Manifesto content</h3>
        <p className="text-xs text-gray-500 -mt-3">
          One sentence with brand media inline. The OpusFesta logo mark is fixed; edit the text
          segments (in order), the inline “RSVP” pill, and the three inline images.
        </p>

        <Field label="Segment 1 (after the logo mark)" hint={<CharCount value={draft.segment_1} max={80} />}>
          <textarea
            rows={2}
            value={draft.segment_1}
            onChange={(e) => setField('segment_1', e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Inline pill label" hint={<CharCount value={draft.pill_label} max={12} />}>
          <input
            type="text"
            value={draft.pill_label}
            onChange={(e) => setField('pill_label', e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Segment 2" hint={<CharCount value={draft.segment_2} max={120} />}>
          <textarea
            rows={2}
            value={draft.segment_2}
            onChange={(e) => setField('segment_2', e.target.value)}
            className={inputCls}
          />
        </Field>
        <FieldGroup label="Inline image 1 (invitation)">
          <ImageUploadField
            label="Image"
            value={draft.invite_image_url}
            onChange={(next) => setField('invite_image_url', next)}
            pathPrefix="opus-pass/homepage/manifesto"
            previewAspect="aspect-[4/5]"
            previewWidth="max-w-[80px]"
          />
        </FieldGroup>
        <Field label="Segment 3" hint={<CharCount value={draft.segment_3} max={80} />}>
          <textarea
            rows={2}
            value={draft.segment_3}
            onChange={(e) => setField('segment_3', e.target.value)}
            className={inputCls}
          />
        </Field>
        <FieldGroup label="Inline image 2 (guest)">
          <ImageUploadField
            label="Image"
            value={draft.guest_image_url}
            onChange={(next) => setField('guest_image_url', next)}
            pathPrefix="opus-pass/homepage/manifesto"
            previewAspect="aspect-[4/5]"
            previewWidth="max-w-[80px]"
          />
        </FieldGroup>
        <Field label="Segment 4" hint={<CharCount value={draft.segment_4} max={80} />}>
          <textarea
            rows={2}
            value={draft.segment_4}
            onChange={(e) => setField('segment_4', e.target.value)}
            className={inputCls}
          />
        </Field>
        <FieldGroup label="Inline image 3 (place)">
          <ImageUploadField
            label="Image"
            value={draft.place_image_url}
            onChange={(next) => setField('place_image_url', next)}
            pathPrefix="opus-pass/homepage/manifesto"
            previewAspect="aspect-[4/5]"
            previewWidth="max-w-[80px]"
          />
        </FieldGroup>
        <Field label="Segment 5 (closing)" hint={<CharCount value={draft.segment_5} max={40} />}>
          <input
            type="text"
            value={draft.segment_5}
            onChange={(e) => setField('segment_5', e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Live preview</h3>
          <span className="text-xs text-gray-400">Approximate</span>
        </div>
        <p className="text-center text-base font-black leading-[1.7] text-[#1A1A1A]">
          {draft.segment_1}{' '}
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 align-middle">
            {draft.pill_label} ✓
          </span>{' '}
          {draft.segment_2} <InlineImg src={draft.invite_image_url} /> {draft.segment_3}{' '}
          <InlineImg src={draft.guest_image_url} /> {draft.segment_4}{' '}
          <InlineImg src={draft.place_image_url} /> {draft.segment_5}
        </p>
      </div>
    </div>
  )
}
