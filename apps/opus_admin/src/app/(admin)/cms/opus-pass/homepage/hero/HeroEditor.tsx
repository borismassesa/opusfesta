'use client'

import { useEffect, useState, useTransition } from 'react'
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

export default function HeroEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassHeroContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const set = <K extends keyof OpusPassHeroContent>(key: K, value: OpusPassHeroContent[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

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

        <FieldGroup label="Headline">
          <Field label="Line 1" hint={<CharCount value={draft.headline_line_1} max={40} />}>
            <input
              type="text"
              value={draft.headline_line_1}
              onChange={(e) => set('headline_line_1', e.target.value)}
              placeholder="Your Wedding,"
              className={inputCls}
            />
          </Field>
          <Field label="Line 2" hint={<CharCount value={draft.headline_line_2} max={40} />}>
            <input
              type="text"
              value={draft.headline_line_2}
              onChange={(e) => set('headline_line_2', e.target.value)}
              placeholder="One Beautiful Pass"
              className={inputCls}
            />
          </Field>
          <Field label="Description" hint={<CharCount value={draft.description} max={200} />}>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Send digital invites cards, track RSVPs live…"
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label="Primary CTA (filled button)">
          <Field label="Label" hint={<CharCount value={draft.primary_cta_label} max={30} />}>
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
          <Field label="Label" hint={<CharCount value={draft.secondary_cta_label} max={30} />}>
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

        <FieldGroup label="Main hero image (inside the left card)">
          <ImageUploadField
            label="Image"
            value={draft.main_image_url}
            onChange={(v) => set('main_image_url', v)}
            pathPrefix="opus-pass/hero"
            previewAspect="aspect-[4/5]"
            previewWidth="max-w-xs"
          />
        </FieldGroup>

        <FieldGroup label="Right card (RSVP showcase)">
          <ImageUploadField
            label="Image"
            value={draft.card_image_url}
            onChange={(v) => set('card_image_url', v)}
            pathPrefix="opus-pass/hero"
            previewAspect="aspect-[4/3]"
            previewWidth="max-w-xs"
          />
          <Field label="Heading" hint={<CharCount value={draft.card_heading} max={40} />}>
            <input
              type="text"
              value={draft.card_heading}
              onChange={(e) => set('card_heading', e.target.value)}
              placeholder="See RSVPs roll in live"
              className={inputCls}
            />
          </Field>
          <Field label="Link label" hint={<CharCount value={draft.card_link_label} max={30} />}>
            <input
              type="text"
              value={draft.card_link_label}
              onChange={(e) => set('card_link_label', e.target.value)}
              placeholder="Explore guests & RSVPs"
              className={inputCls}
            />
          </Field>
          <Field label="Destination URL">
            <input
              type="text"
              value={draft.card_href}
              onChange={(e) => set('card_href', e.target.value)}
              placeholder="/guests"
              className={inputCls}
            />
          </Field>
        </FieldGroup>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6">
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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
      <div className="sm:col-span-2 rounded-xl overflow-hidden bg-[#f4ecf8]">
        <div className="grid grid-cols-[2fr_1fr]">
          <div className="px-4 py-5 flex flex-col justify-center">
            <h1 className="text-base sm:text-lg font-serif font-bold text-gray-900 leading-tight mb-2">
              {content.headline_line_1}
              <br />
              {content.headline_line_2}
            </h1>
            <p className="text-[11px] text-gray-700 mb-3 leading-relaxed line-clamp-3">
              {content.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-block bg-gray-900 text-white px-2.5 py-1 rounded-full text-[10px] font-medium">
                {content.primary_cta_label || 'Get started'}
              </span>
              <span className="inline-block border border-gray-300 text-gray-900 px-2.5 py-1 rounded-full text-[10px] font-medium">
                {content.secondary_cta_label || 'Browse'}
              </span>
            </div>
          </div>
          <div className="relative min-h-[140px] bg-gray-100">
            {content.main_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveOpusPassAssetUrl(content.main_image_url)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
                No image
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden aspect-[4/3] sm:aspect-auto sm:min-h-[140px] bg-gray-100">
        {content.card_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveOpusPassAssetUrl(content.card_image_url)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2 text-white">
          <p className="text-xs sm:text-sm font-serif font-medium leading-tight">
            {content.card_heading || 'Card heading'}
          </p>
          <span className="text-[10px] font-medium underline underline-offset-2">
            {content.card_link_label || 'Link'}
          </span>
        </div>
      </div>
    </div>
  )
}
