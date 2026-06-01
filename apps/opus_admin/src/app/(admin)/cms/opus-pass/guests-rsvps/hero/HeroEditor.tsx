'use client'

import { useEffect, useState, useTransition } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import type {
  OpusPassGuestsHeroContent,
  OpusPassGuestsHeroImage,
} from '@/lib/cms/opus-pass-guests-hero'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import { useEditorActions } from '../EditorActionsContext'
import {
  discardOpusPassGuestsHeroDraft,
  publishOpusPassGuestsHero,
  saveOpusPassGuestsHeroDraft,
} from './actions'

type Props = {
  initial: OpusPassGuestsHeroContent
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

export default function HeroEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassGuestsHeroContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const setField = <K extends keyof OpusPassGuestsHeroContent>(
    key: K,
    value: OpusPassGuestsHeroContent[K],
  ) => setDraft((d) => ({ ...d, [key]: value }))

  // ── Avatars (image list) ──
  const setAvatar = (idx: number, value: string) =>
    setDraft((d) => ({ ...d, avatars: d.avatars.map((a, i) => (i === idx ? value : a)) }))
  const addAvatar = () => setDraft((d) => ({ ...d, avatars: [...d.avatars, ''] }))
  const removeAvatar = (idx: number) =>
    setDraft((d) => ({ ...d, avatars: d.avatars.filter((_, i) => i !== idx) }))
  const moveAvatar = (idx: number, delta: number) =>
    setDraft((d) => {
      const next = [...d.avatars]
      const target = idx + delta
      if (target < 0 || target >= next.length) return d
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return { ...d, avatars: next }
    })

  // ── Collage (image + alt list) ──
  const setCollage = (idx: number, patch: Partial<OpusPassGuestsHeroImage>) =>
    setDraft((d) => ({
      ...d,
      collage: d.collage.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }))
  const addCollage = () =>
    setDraft((d) => ({ ...d, collage: [...d.collage, { src: '', alt: '' }] }))
  const removeCollage = (idx: number) =>
    setDraft((d) => ({ ...d, collage: d.collage.filter((_, i) => i !== idx) }))
  const moveCollage = (idx: number, delta: number) =>
    setDraft((d) => {
      const next = [...d.collage]
      const target = idx + delta
      if (target < 0 || target >= next.length) return d
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return { ...d, collage: next }
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
      await saveOpusPassGuestsHeroDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassGuestsHeroDraft(draft)
      await publishOpusPassGuestsHero()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassGuestsHeroDraft()
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
        <h3 className="text-[15px] font-semibold text-gray-900">Hero content</h3>

        <FieldGroup label="Headline">
          <Field label="Lead text">
            <input
              type="text"
              value={draft.headline_lead}
              onChange={(e) => setField('headline_lead', e.target.value)}
              placeholder="Your guest list, replying in"
              className={inputCls}
            />
          </Field>
          <Field label="Highlighted word(s)">
            <input
              type="text"
              value={draft.headline_highlight}
              onChange={(e) => setField('headline_highlight', e.target.value)}
              placeholder="real time"
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <Field label="Description">
          <textarea
            rows={3}
            value={draft.description}
            onChange={(e) => setField('description', e.target.value)}
            className={inputCls}
          />
        </Field>

        <FieldGroup label="Primary CTA">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Label">
              <input
                type="text"
                value={draft.primary_cta_label}
                onChange={(e) => setField('primary_cta_label', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Link">
              <input
                type="text"
                value={draft.primary_cta_href}
                onChange={(e) => setField('primary_cta_href', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup label="Secondary CTA">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Label">
              <input
                type="text"
                value={draft.secondary_cta_label}
                onChange={(e) => setField('secondary_cta_label', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Link">
              <input
                type="text"
                value={draft.secondary_cta_href}
                onChange={(e) => setField('secondary_cta_href', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup label="Trust cluster">
          <Field label="Bold lead (e.g. “Trusted by 500+”)">
            <input
              type="text"
              value={draft.trust_lead}
              onChange={(e) => setField('trust_lead', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Sub line (e.g. “Tanzanian couples”)">
            <input
              type="text"
              value={draft.trust_rest}
              onChange={(e) => setField('trust_rest', e.target.value)}
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label={`Avatar cluster (${draft.avatars.length})`}>
          {draft.avatars.map((src, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="flex-1">
                <ImageUploadField
                  label={`Avatar ${idx + 1}`}
                  value={src}
                  onChange={(next) => setAvatar(idx, next)}
                  pathPrefix="opus-pass/guests/avatars"
                  previewAspect="aspect-square"
                  previewWidth="max-w-[64px]"
                />
              </div>
              <div className="mt-6 flex flex-col">
                <button
                  type="button"
                  onClick={() => moveAvatar(idx, -1)}
                  disabled={idx === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors"
                  aria-label="Move avatar up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveAvatar(idx, 1)}
                  disabled={idx === draft.avatars.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors"
                  aria-label="Move avatar down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAvatar(idx)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                  aria-label="Remove avatar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addAvatar}
            className="flex items-center gap-2 text-sm font-medium text-[#7E5896] hover:text-[#5d3a78] px-3 py-2 rounded-lg border border-dashed border-[#C9A0DC] hover:bg-[#F0DFF6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add avatar
          </button>
        </FieldGroup>

        <FieldGroup label={`Photo collage (${draft.collage.length} — first 6 shown)`}>
          {draft.collage.map((image, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 p-3 space-y-2 relative">
              <div className="absolute top-2 right-2 flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => moveCollage(idx, -1)}
                  disabled={idx === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors"
                  aria-label="Move image up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveCollage(idx, 1)}
                  disabled={idx === draft.collage.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors"
                  aria-label="Move image down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeCollage(idx)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                  aria-label="Remove collage image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <ImageUploadField
                label={`Image ${idx + 1}`}
                value={image.src}
                onChange={(next) => setCollage(idx, { src: next })}
                pathPrefix="opus-pass/guests/collage"
                previewAspect="aspect-[4/3]"
                previewWidth="max-w-[160px]"
              />
              <Field label="Alt text">
                <input
                  type="text"
                  value={image.alt}
                  onChange={(e) => setCollage(idx, { alt: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>
          ))}
          <button
            type="button"
            onClick={addCollage}
            className="flex items-center gap-2 text-sm font-medium text-[#7E5896] hover:text-[#5d3a78] px-3 py-2 rounded-lg border border-dashed border-[#C9A0DC] hover:bg-[#F0DFF6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add collage image
          </button>
        </FieldGroup>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Live preview</h3>
          <span className="text-xs text-gray-400">Approximate</span>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black leading-tight text-gray-900">
            {draft.headline_lead}{' '}
            <span className="bg-[#C9A0DC]/40 rounded px-1">{draft.headline_highlight}</span>
          </h2>
          <p className="mt-3 text-[11px] text-gray-600 leading-relaxed">{draft.description}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-[10px] font-semibold text-white bg-[#C9A0DC] rounded-md px-2.5 py-1">
              {draft.primary_cta_label}
            </span>
            <span className="text-[10px] font-semibold text-gray-700 border border-gray-300 rounded-md px-2.5 py-1">
              {draft.secondary_cta_label}
            </span>
          </div>
          <p className="mt-4 text-[10px] text-gray-600">
            <span className="font-bold text-gray-900">{draft.trust_lead}</span> · {draft.trust_rest}
          </p>
        </div>
      </div>
    </div>
  )
}
