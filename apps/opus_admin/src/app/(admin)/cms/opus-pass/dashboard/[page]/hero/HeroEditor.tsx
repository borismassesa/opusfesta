'use client'

import { useEffect, useState, useTransition, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { MediaUploadField } from '@/components/cms/MediaUploadField'
import { BilingualField } from '@/components/cms/BilingualField'
import { LOCALES, LOCALE_LABELS, resolveLocalized, type Locale } from '@/lib/cms/localized'
import { resolveOpusPassAssetUrl } from '@/lib/cms/opus-pass-asset-url'
import type {
  DashboardHeroContent,
  DashboardHeroMediaType,
  DashboardHeroSlug,
} from '@/lib/cms/opus-pass-dashboard-hero'
import { useEditorActions } from '../../EditorActionsContext'
import {
  discardDashboardHeroDraft,
  publishDashboardHero,
  saveDashboardHeroDraft,
} from './actions'

type Props = {
  slug: DashboardHeroSlug
  label: string
  initial: DashboardHeroContent
  hasDraft: boolean
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: ReactNode
  children: ReactNode
}) {
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

function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="border border-gray-200 rounded-lg p-3 pt-2 space-y-3">
      <legend className="px-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </legend>
      {children}
    </fieldset>
  )
}

export default function HeroEditor({ slug, label, initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<DashboardHeroContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewLocale, setPreviewLocale] = useState<Locale>('en')
  const { bind, unbind } = useEditorActions()

  // When switching between dashboard slugs (the layout stays mounted), re-seed.
  useEffect(() => {
    setDraft(initial)
    setHasDraft(initialHasDraft)
    setMessage(null)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const set = <K extends keyof DashboardHeroContent>(key: K, value: DashboardHeroContent[K]) =>
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
      await saveDashboardHeroDraft(slug, draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveDashboardHeroDraft(slug, draft)
      await publishDashboardHero(slug)
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardDashboardHeroDraft(slug)
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

  const hasMedia = draft.media_type !== 'none' && !!draft.media_url
  const previewMediaUrl = hasMedia ? resolveOpusPassAssetUrl(draft.media_url) : ''
  const previewEyebrow = resolveLocalized(draft.eyebrow, previewLocale)
  const previewTitle = resolveLocalized(draft.title, previewLocale)
  const previewSubtitle = resolveLocalized(draft.subtitle, previewLocale)
  const previewAlt = resolveLocalized(draft.media_alt, previewLocale)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start pb-12">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-5">
        <h3 className="text-[15px] font-semibold text-gray-900">{label} hero content</h3>

        <FieldGroup label="Text">
          <BilingualField
            label="Eyebrow"
            value={draft.eyebrow}
            onChange={(v) => set('eyebrow', v)}
            placeholder="Dashboard"
            max={40}
          />
          <BilingualField
            label="Title"
            value={draft.title}
            onChange={(v) => set('title', v)}
            placeholder="Welcome back"
            max={80}
          />
          <BilingualField
            label="Subtitle"
            value={draft.subtitle}
            onChange={(v) => set('subtitle', v)}
            placeholder="Plan, send and track everything in one place…"
            multiline
            max={240}
          />
        </FieldGroup>

        <FieldGroup label="Cover media (optional)">
          <Field label="Media kind">
            <div className="flex gap-2">
              {(['none', 'image', 'video'] as DashboardHeroMediaType[]).map((kind) => {
                const isActive = draft.media_type === kind
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        media_type: kind,
                        // Clear the URL when switching to 'none' so the public site falls back cleanly.
                        media_url: kind === 'none' ? '' : d.media_url,
                      }))
                    }
                    className={cn(
                      'flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-colors',
                      isActive
                        ? 'bg-[#F0DFF6] border-[#C9A0DC] text-[#7E5896]'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {kind === 'none' ? 'No media (gradient)' : kind}
                  </button>
                )
              })}
            </div>
          </Field>

          {draft.media_type !== 'none' && (
            <>
              <MediaUploadField
                label="Upload or paste a URL"
                value={draft.media_url}
                mediaType={draft.media_type}
                onChange={({ url, type }) =>
                  setDraft((d) => ({ ...d, media_url: url, media_type: type }))
                }
                pathPrefix={`opus-pass/dashboard-hero/${slug}`}
                previewAspect="aspect-[16/9]"
                previewWidth="max-w-md"
              />
              <BilingualField
                label="Alt text"
                value={draft.media_alt}
                onChange={(v) => set('media_alt', v)}
                placeholder="Couple celebrating at sunset"
              />
              <p className="-mt-1 text-[11px] text-gray-400">
                Describe the image for screen readers / accessibility.
              </p>
            </>
          )}
        </FieldGroup>
      </div>

      <div className="space-y-3 xl:sticky xl:top-6">
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Live preview
          </p>
          <div className="inline-flex items-center rounded-full border border-gray-200 p-0.5 text-[11px] font-semibold">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setPreviewLocale(l)}
                aria-pressed={previewLocale === l}
                className={cn(
                  'rounded-full px-2.5 py-0.5 transition-colors',
                  previewLocale === l ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900',
                )}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
        <div className="relative isolate overflow-hidden rounded-3xl border border-gray-200 shadow-[0_2px_10px_rgba(26,26,26,0.06)] bg-white">
          <div className="absolute inset-0 -z-10">
            {hasMedia ? (
              draft.media_type === 'video' ? (
                <video
                  key={previewMediaUrl}
                  src={previewMediaUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={previewMediaUrl}
                  src={previewMediaUrl}
                  alt={previewAlt}
                  className="h-full w-full object-cover"
                />
              )
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#F3E9FA] via-[#E9DCF7] to-[#FFE2CC]" />
            )}
            <div
              className={cn(
                'absolute inset-0',
                hasMedia
                  ? 'bg-gradient-to-t from-black/65 via-black/30 to-black/10'
                  : 'bg-gradient-to-t from-white/40 via-transparent to-transparent',
              )}
            />
          </div>
          <div className="relative flex min-h-[260px] flex-col justify-end p-6 sm:p-8">
            {previewEyebrow && (
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-[0.18em]',
                  hasMedia ? 'text-white/85' : 'text-[#1A1A1A]/55',
                )}
              >
                {previewEyebrow}
              </p>
            )}
            <h1
              className={cn(
                'mt-1 text-2xl font-bold tracking-tight sm:text-3xl',
                hasMedia ? 'text-white drop-shadow-sm' : 'text-[#1A1A1A]',
              )}
            >
              {previewTitle || 'Untitled'}
            </h1>
            {previewSubtitle && (
              <p
                className={cn(
                  'mt-2 text-sm sm:text-base max-w-2xl',
                  hasMedia ? 'text-white/90' : 'text-[#1A1A1A]/70',
                )}
              >
                {previewSubtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
