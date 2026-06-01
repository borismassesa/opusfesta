'use client'

import { useEffect, useState, useTransition } from 'react'
import type { OpusPassHomepageManifestoContent } from '@/lib/cms/opus-pass-homepage-manifesto'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
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

export default function ManifestoEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassHomepageManifestoContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
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
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassHomepageManifestoDraft(draft)
      await publishOpusPassHomepageManifesto()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassHomepageManifestoDraft()
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
        <h3 className="text-[15px] font-semibold text-gray-900">Manifesto content</h3>
        <p className="text-xs text-gray-500 -mt-3">
          One sentence with brand media inline. The OpusFesta logo mark is fixed; edit the text
          segments (in order), the inline “RSVP” pill, and the three inline images.
        </p>

        <Field label="Segment 1 (after the logo mark)">
          <textarea
            rows={2}
            value={draft.segment_1}
            onChange={(e) => setField('segment_1', e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Inline pill label">
          <input
            type="text"
            value={draft.pill_label}
            onChange={(e) => setField('pill_label', e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Segment 2">
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
        <Field label="Segment 3">
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
        <Field label="Segment 4">
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
        <Field label="Segment 5 (closing)">
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
        <p className="text-center text-base font-black leading-relaxed text-[#1A1A1A]">
          {draft.segment_1}{' '}
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 align-middle">
            {draft.pill_label} ✓
          </span>{' '}
          {draft.segment_2} <span className="text-gray-400">▢</span> {draft.segment_3}{' '}
          <span className="text-gray-400">▢</span> {draft.segment_4}{' '}
          <span className="text-gray-400">▢</span> {draft.segment_5}
        </p>
      </div>
    </div>
  )
}
