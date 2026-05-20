'use client'

import { useEffect, useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import type { OpusPassWebsitesHeroContent } from '@/lib/cms/opus-pass-websites-hero'
import { cn } from '@/lib/utils'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import { resolveOpusPassAssetUrl } from '@/lib/cms/opus-pass-asset-url'
import { useEditorActions } from '../EditorActionsContext'
import {
  discardOpusPassWebsitesHeroDraft,
  publishOpusPassWebsitesHero,
  saveOpusPassWebsitesHeroDraft,
} from './actions'

type Props = {
  initial: OpusPassWebsitesHeroContent
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
  const [draft, setDraft] = useState<OpusPassWebsitesHeroContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const set = <K extends keyof OpusPassWebsitesHeroContent>(
    key: K,
    value: OpusPassWebsitesHeroContent[K],
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
      await saveOpusPassWebsitesHeroDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassWebsitesHeroDraft(draft)
      await publishOpusPassWebsitesHero()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassWebsitesHeroDraft()
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
          <Field label="Line 1" hint={<CharCount value={draft.headline_line_1} max={60} />}>
            <input
              type="text"
              value={draft.headline_line_1}
              onChange={(e) => set('headline_line_1', e.target.value)}
              placeholder="Your wedding website,"
              className={inputCls}
            />
          </Field>
          <Field label="Line 2" hint={<CharCount value={draft.headline_line_2} max={60} />}>
            <input
              type="text"
              value={draft.headline_line_2}
              onChange={(e) => set('headline_line_2', e.target.value)}
              placeholder="ready in minutes."
              className={inputCls}
            />
          </Field>
          <Field label="Description" hint={<CharCount value={draft.description} max={400} />}>
            <textarea
              rows={4}
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Build a beautiful wedding website…"
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label="Primary CTA (filled)">
          <Field label="Label" hint={<CharCount value={draft.primary_cta_label} max={30} />}>
            <input
              type="text"
              value={draft.primary_cta_label}
              onChange={(e) => set('primary_cta_label', e.target.value)}
              placeholder="Start your website"
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

        <FieldGroup label="Secondary CTA (underline link)">
          <Field label="Label" hint={<CharCount value={draft.secondary_cta_label} max={30} />}>
            <input
              type="text"
              value={draft.secondary_cta_label}
              onChange={(e) => set('secondary_cta_label', e.target.value)}
              placeholder="Explore designs"
              className={inputCls}
            />
          </Field>
          <Field label="Destination URL">
            <input
              type="text"
              value={draft.secondary_cta_href}
              onChange={(e) => set('secondary_cta_href', e.target.value)}
              placeholder="#designs"
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label="Banner background">
          <Field label="Background colour (hex)">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={draft.background_color}
                onChange={(e) => set('background_color', e.target.value)}
                className="w-10 h-10 rounded border border-gray-200 p-0 overflow-hidden cursor-pointer"
              />
              <input
                type="text"
                value={draft.background_color}
                onChange={(e) => set('background_color', e.target.value)}
                placeholder="#E1ECDB"
                className={`${inputCls} flex-1 font-mono text-[12px]`}
              />
              <button
                type="button"
                onClick={() => set('background_color', '#E1ECDB')}
                className="p-1 text-gray-400 hover:text-gray-700 shrink-0"
                title="Reset to default (#E1ECDB)"
                aria-label="Reset background colour"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Field>
        </FieldGroup>

        <FieldGroup label="Right-side banner image">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Optional — when set, replaces the built-in laptop + phone mockup arrangement on the right
            side of the banner.
          </p>
          <ImageUploadField
            label="Image"
            value={draft.right_image_url}
            onChange={(v) => set('right_image_url', v)}
            pathPrefix="opus-pass/websites/hero"
            previewAspect="aspect-[4/3]"
            previewWidth="max-w-xs"
          />
          <Field label="Alt text (for screen readers)">
            <input
              type="text"
              value={draft.right_image_alt}
              onChange={(e) => set('right_image_alt', e.target.value)}
              placeholder="Couple admiring their wedding website on a laptop"
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

function HeroPreview({ content }: { content: OpusPassWebsitesHeroContent }) {
  return (
    <div
      className="relative overflow-hidden rounded-md p-5"
      style={{
        backgroundColor: content.background_color || '#E1ECDB',
        backgroundImage:
          'radial-gradient(circle at 1px 1px, #5C6B4D66 0.6px, transparent 0)',
        backgroundSize: '6px 6px',
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-7">
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-tighter leading-[1.15] text-[#1A1A1A]">
            {content.headline_line_1 || 'Headline line 1'}
            <br />
            {content.headline_line_2 || 'Headline line 2'}
          </h1>
          <p className="mt-3 text-[11px] sm:text-xs text-[#1A1A1A]/80 leading-relaxed line-clamp-5">
            {content.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[#C9A0DC] text-[#1A1A1A] px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em]">
              {content.primary_cta_label || 'Primary CTA'}
            </span>
            <span className="text-[10px] font-semibold text-[#1A1A1A] underline underline-offset-[4px] decoration-[#1A1A1A]/40">
              {content.secondary_cta_label || 'Secondary CTA'} →
            </span>
          </div>
        </div>
        <div className="sm:col-span-5 relative aspect-[4/3] sm:aspect-auto sm:min-h-[140px] rounded-md overflow-hidden bg-white/30">
          {content.right_image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={resolveOpusPassAssetUrl(content.right_image_url)}
              alt={content.right_image_alt}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[9px] uppercase tracking-wider text-gray-500 text-center px-2">
              Built-in laptop + phone mockup
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
