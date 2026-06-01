'use client'

import { useEffect, useState, useTransition } from 'react'
import { ArrowDown, ArrowUp, Plus, Star, StarHalf, Trash2 } from 'lucide-react'
import type { OpusPassHeroContent } from '@/lib/cms/opus-pass-hero'
import { cn } from '@/lib/utils'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import { resolveOpusPassAssetUrl } from '@/lib/cms/opus-pass-asset-url'
import { useEditorActions } from '../EditorActionsContext'
import { discardOpusPassHeroDraft, publishOpusPassHero, saveOpusPassHeroDraft } from './actions'

type Props = {
  initial: OpusPassHeroContent
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

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="border border-gray-200 rounded-lg p-3 pt-2 space-y-3">
      <legend className="px-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</legend>
      {children}
    </fieldset>
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

function reorder<T>(list: T[], idx: number, delta: number): T[] {
  const next = [...list]
  const target = idx + delta
  if (target < 0 || target >= next.length) return list
  ;[next[idx], next[target]] = [next[target], next[idx]]
  return next
}

export default function HeroEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassHeroContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const set = <K extends keyof OpusPassHeroContent>(key: K, value: OpusPassHeroContent[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  // Avatars (image list)
  const setAvatar = (idx: number, value: string) =>
    setDraft((d) => ({ ...d, avatars: d.avatars.map((a, i) => (i === idx ? value : a)) }))
  const addAvatar = () => setDraft((d) => ({ ...d, avatars: [...d.avatars, ''] }))
  const removeAvatar = (idx: number) =>
    setDraft((d) => ({ ...d, avatars: d.avatars.filter((_, i) => i !== idx) }))
  const moveAvatar = (idx: number, delta: number) =>
    setDraft((d) => ({ ...d, avatars: reorder(d.avatars, idx, delta) }))

  // Featured-in (text list)
  const setFeatured = (idx: number, value: string) =>
    setDraft((d) => ({ ...d, featured_in: d.featured_in.map((f, i) => (i === idx ? value : f)) }))
  const addFeatured = () => setDraft((d) => ({ ...d, featured_in: [...d.featured_in, ''] }))
  const removeFeatured = (idx: number) =>
    setDraft((d) => ({ ...d, featured_in: d.featured_in.filter((_, i) => i !== idx) }))
  const moveFeatured = (idx: number, delta: number) =>
    setDraft((d) => ({ ...d, featured_in: reorder(d.featured_in, idx, delta) }))

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
      await saveOpusPassHeroDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassHeroDraft(draft)
      await publishOpusPassHero()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassHeroDraft()
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
        <p className="text-xs text-gray-500 -mt-3">
          Centred headline (the last word of line 1 is underlined automatically), trust badge and
          the “As featured in” press strip. The sparkle horizon is fixed design.
        </p>

        <FieldGroup label="Headline">
          <Field label="Line 1" hint={<CharCount value={draft.headline_line_1} max={40} />}>
            <input
              type="text"
              value={draft.headline_line_1}
              onChange={(e) => set('headline_line_1', e.target.value)}
              placeholder="Your whole wedding day"
              className={inputCls}
            />
          </Field>
          <Field label="Line 2" hint={<CharCount value={draft.headline_line_2} max={40} />}>
            <input
              type="text"
              value={draft.headline_line_2}
              onChange={(e) => set('headline_line_2', e.target.value)}
              placeholder="one beautiful pass"
              className={inputCls}
            />
          </Field>
          <Field label="Description" hint={<CharCount value={draft.description} max={220} />}>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label="Primary CTA (filled button)">
          <Field label="Label" hint={<CharCount value={draft.primary_cta_label} max={24} />}>
            <input
              type="text"
              value={draft.primary_cta_label}
              onChange={(e) => set('primary_cta_label', e.target.value)}
              placeholder="Get started"
              className={inputCls}
            />
          </Field>
          <Field label="Destination URL">
            <input
              type="text"
              value={draft.primary_cta_href}
              onChange={(e) => set('primary_cta_href', e.target.value)}
              placeholder="/sign-up"
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label="Secondary CTA (outline button)">
          <Field label="Label" hint={<CharCount value={draft.secondary_cta_label} max={24} />}>
            <input
              type="text"
              value={draft.secondary_cta_label}
              onChange={(e) => set('secondary_cta_label', e.target.value)}
              placeholder="Browse invitations"
              className={inputCls}
            />
          </Field>
          <Field label="Destination URL">
            <input
              type="text"
              value={draft.secondary_cta_href}
              onChange={(e) => set('secondary_cta_href', e.target.value)}
              placeholder="/invitations"
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label="Trust badge">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Couples count" hint={<CharCount value={draft.trust_count} max={10} />}>
              <input
                type="text"
                value={draft.trust_count}
                onChange={(e) => set('trust_count', e.target.value)}
                placeholder="1000+"
                className={inputCls}
              />
            </Field>
            <Field label="Rating (out of 5)" hint={<CharCount value={draft.rating} max={4} />}>
              <input
                type="text"
                value={draft.rating}
                onChange={(e) => set('rating', e.target.value)}
                placeholder="4.5"
                className={inputCls}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup label={`Avatar cluster (${draft.avatars.length})`}>
          {draft.avatars.map((src, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="flex-1">
                <ImageUploadField
                  label={`Avatar ${idx + 1}`}
                  value={src}
                  onChange={(next) => setAvatar(idx, next)}
                  pathPrefix="opus-pass/homepage/hero"
                  previewAspect="aspect-square"
                  previewWidth="max-w-[64px]"
                />
              </div>
              <div className="mt-6 flex flex-col">
                <button type="button" onClick={() => moveAvatar(idx, -1)} disabled={idx === 0} className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors" aria-label="Move avatar up">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => moveAvatar(idx, 1)} disabled={idx === draft.avatars.length - 1} className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors" aria-label="Move avatar down">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => removeAvatar(idx)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors" aria-label="Remove avatar">
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

        <FieldGroup label={`As featured in (${draft.featured_in.length})`}>
          {draft.featured_in.map((name, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setFeatured(idx, e.target.value)}
                placeholder="Press name"
                className={inputCls}
              />
              <button type="button" onClick={() => moveFeatured(idx, -1)} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 shrink-0" aria-label="Move up">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => moveFeatured(idx, 1)} disabled={idx === draft.featured_in.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 shrink-0" aria-label="Move down">
                <ArrowDown className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => removeFeatured(idx)} className="p-1 text-gray-400 hover:text-red-600 shrink-0" aria-label="Remove">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFeatured}
            className="flex items-center gap-2 text-sm font-medium text-[#7E5896] hover:text-[#5d3a78] px-3 py-2 rounded-lg border border-dashed border-[#C9A0DC] hover:bg-[#F0DFF6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add press name
          </button>
        </FieldGroup>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Live preview</h3>
          <span className="text-xs text-gray-400">Approximate</span>
        </div>
        <HeroPreview content={draft} />
      </div>
    </div>
  )
}

function HeroPreview({ content }: { content: OpusPassHeroContent }) {
  const line1 = content.headline_line_1.trim().replace(/,\s*$/, '')
  const lastSpace = line1.lastIndexOf(' ')
  const head = lastSpace === -1 ? '' : line1.slice(0, lastSpace + 1)
  const lastWord = lastSpace === -1 ? line1 : line1.slice(lastSpace + 1)
  const ratingNum = Number.parseFloat(content.rating) || 4.5
  const full = Math.floor(ratingNum)
  const half = ratingNum - full >= 0.5

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2">
        <div className="flex -space-x-2">
          {content.avatars.slice(0, 5).map((src, i) => (
            <span
              key={`${src}-${i}`}
              className="relative inline-block h-6 w-6 overflow-hidden rounded-full ring-2 ring-white bg-gray-100"
              style={{ zIndex: content.avatars.length - i }}
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolveOpusPassAssetUrl(src)} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : null}
            </span>
          ))}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1 text-[#F59E0B]">
            {Array.from({ length: full }).map((_, i) => (
              <Star key={i} size={11} className="fill-current" strokeWidth={0} />
            ))}
            {half && <StarHalf size={11} className="fill-current" strokeWidth={0} />}
            <span className="ml-1 text-[11px] font-extrabold text-[#1A1A1A]">{content.rating}</span>
          </div>
          <p className="text-[10px] text-gray-600">
            Trusted by <span className="font-extrabold text-gray-900">{content.trust_count}</span> couples
          </p>
        </div>
      </div>

      <h1 className="mt-4 text-xl font-black tracking-tight leading-tight text-[#1A1A1A]">
        {head}
        <span className="underline decoration-[#1A1A1A] decoration-2 underline-offset-2">{lastWord}</span>
        <br />
        {content.headline_line_2} <span aria-hidden>⚡</span>
      </h1>

      <p className="mx-auto mt-3 max-w-sm text-[11px] leading-relaxed text-gray-600">{content.description}</p>

      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="rounded-full bg-[#C9A0DC] px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
          {content.primary_cta_label}
        </span>
        <span className="rounded-full border border-gray-200 px-4 py-1.5 text-[10px] font-semibold text-gray-900">
          {content.secondary_cta_label}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-gray-400">As featured in</span>
        {content.featured_in.map((name, i) => (
          <span key={`${name}-${i}`} className="text-xs font-bold text-gray-400">
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}
