'use client'

import { useEffect, useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import type { OpusPassInvitationsFreeWebsitePromoContent } from '@/lib/cms/opus-pass-invitations-free-website-promo'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import { resolveOpusPassAssetUrl } from '@/lib/cms/opus-pass-asset-url'
import { useEditorActions } from '../EditorActionsContext'
import {
  discardOpusPassInvitationsFreeWebsitePromoDraft,
  publishOpusPassInvitationsFreeWebsitePromo,
  saveOpusPassInvitationsFreeWebsitePromoDraft,
} from './actions'

type Props = {
  initial: OpusPassInvitationsFreeWebsitePromoContent
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

export default function FreeWebsitePromoEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassInvitationsFreeWebsitePromoContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const set = <K extends keyof OpusPassInvitationsFreeWebsitePromoContent>(
    key: K,
    value: OpusPassInvitationsFreeWebsitePromoContent[K],
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
      await saveOpusPassInvitationsFreeWebsitePromoDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassInvitationsFreeWebsitePromoDraft(draft)
      await publishOpusPassInvitationsFreeWebsitePromo()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassInvitationsFreeWebsitePromoDraft()
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
        <h3 className="text-[15px] font-semibold text-gray-900">Free website promo content</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Bottom CTA block on the catalog + category pages.
        </p>

        <FieldGroup label="Copy">
          <Field label="Eyebrow (small uppercase label)">
            <input
              type="text"
              value={draft.eyebrow}
              onChange={(e) => set('eyebrow', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Heading">
            <input
              type="text"
              value={draft.heading}
              onChange={(e) => set('heading', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Body">
            <textarea
              rows={3}
              value={draft.body}
              onChange={(e) => set('body', e.target.value)}
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label="CTA">
          <Field label="Label">
            <input
              type="text"
              value={draft.cta_label}
              onChange={(e) => set('cta_label', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Destination URL">
            <input
              type="text"
              value={draft.cta_href}
              onChange={(e) => set('cta_href', e.target.value)}
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label="Right-side image">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Optional — replaces the built-in 3-invitation arrangement when set.
          </p>
          <ImageUploadField
            label="Image"
            value={draft.image_url}
            onChange={(v) => set('image_url', v)}
            pathPrefix="opus-pass/invitations/free-website-promo"
            previewAspect="aspect-[4/3]"
            previewWidth="max-w-xs"
          />
          <Field label="Alt text">
            <input
              type="text"
              value={draft.image_alt}
              onChange={(e) => set('image_alt', e.target.value)}
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label="Background">
          <Field label="Card background colour (hex)">
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
                className={`${inputCls} flex-1 font-mono text-[12px]`}
              />
              <button
                type="button"
                onClick={() => set('background_color', '#F5EFE3')}
                className="p-1 text-gray-400 hover:text-gray-700 shrink-0"
                aria-label="Reset background colour"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Field>
        </FieldGroup>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Live preview</h3>
          <span className="text-xs text-gray-400">Approximate</span>
        </div>
        <FreeWebsitePromoPreview content={draft} />
      </div>
    </div>
  )
}

function FreeWebsitePromoPreview({ content }: { content: OpusPassInvitationsFreeWebsitePromoContent }) {
  return (
    <div
      className="rounded-md grid grid-cols-1 sm:grid-cols-2 gap-3 p-4"
      style={{ backgroundColor: content.background_color || '#F5EFE3' }}
    >
      <div>
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/60">
          {content.eyebrow || 'Eyebrow'}
        </p>
        <h2 className="mt-1.5 font-serif text-base leading-tight text-[#1A1A1A]">
          {content.heading || 'Heading'}
        </h2>
        <p className="mt-2 text-[11px] text-[#1A1A1A]/75 leading-relaxed line-clamp-3">
          {content.body}
        </p>
        <span className="mt-3 inline-flex items-center rounded-full bg-[#C9A0DC] text-[#1A1A1A] px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em]">
          {content.cta_label || 'CTA'}
        </span>
      </div>
      <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[120px] rounded overflow-hidden bg-white/40">
        {content.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveOpusPassAssetUrl(content.image_url)}
            alt={content.image_alt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[9px] uppercase tracking-wider text-gray-500 text-center px-2">
            Built-in invitation arrangement
          </div>
        )}
      </div>
    </div>
  )
}
