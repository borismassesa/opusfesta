'use client'

import { useEffect, useState, useTransition } from 'react'
import type { OpusPassHomepageWhyOpusPassContent } from '@/lib/cms/opus-pass-homepage-why-opus-pass'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import { useEditorActions } from '../EditorActionsContext'
import {
  discardOpusPassHomepageWhyOpusPassDraft,
  publishOpusPassHomepageWhyOpusPass,
  saveOpusPassHomepageWhyOpusPassDraft,
} from './actions'

type Props = {
  initial: OpusPassHomepageWhyOpusPassContent
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

export default function WhyOpusPassEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassHomepageWhyOpusPassContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const setField = <K extends keyof OpusPassHomepageWhyOpusPassContent>(
    key: K,
    value: OpusPassHomepageWhyOpusPassContent[K],
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
      await saveOpusPassHomepageWhyOpusPassDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassHomepageWhyOpusPassDraft(draft)
      await publishOpusPassHomepageWhyOpusPass()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassHomepageWhyOpusPassDraft()
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
        <h3 className="text-[15px] font-semibold text-gray-900">Why OpusPass content</h3>

        <Field label="Headline">
          <textarea
            rows={2}
            value={draft.headline}
            onChange={(e) => setField('headline', e.target.value)}
            className={inputCls}
          />
        </Field>

        <FieldGroup label="Main photo">
          <ImageUploadField
            label="Image"
            value={draft.main_image_url}
            onChange={(next) => setField('main_image_url', next)}
            pathPrefix="opus-pass/homepage/why-opus-pass"
            previewAspect="aspect-[3/4]"
            previewWidth="max-w-[200px]"
          />
          <Field label="Alt text">
            <input
              type="text"
              value={draft.main_image_alt}
              onChange={(e) => setField('main_image_alt', e.target.value)}
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label="Floating product chip">
          <ImageUploadField
            label="Chip image"
            value={draft.chip_image_url}
            onChange={(next) => setField('chip_image_url', next)}
            pathPrefix="opus-pass/homepage/why-opus-pass"
            previewAspect="aspect-square"
            previewWidth="max-w-[80px]"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Chip title">
              <input
                type="text"
                value={draft.chip_title}
                onChange={(e) => setField('chip_title', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Chip subtitle">
              <input
                type="text"
                value={draft.chip_subtitle}
                onChange={(e) => setField('chip_subtitle', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup label="Floating CTA pill">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Label">
              <input
                type="text"
                value={draft.floating_cta_label}
                onChange={(e) => setField('floating_cta_label', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Link">
              <input
                type="text"
                value={draft.floating_cta_href}
                onChange={(e) => setField('floating_cta_href', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup label="Right column copy">
          <Field label="Sub-headline">
            <input
              type="text"
              value={draft.subheadline}
              onChange={(e) => setField('subheadline', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Body">
            <textarea
              rows={4}
              value={draft.body}
              onChange={(e) => setField('body', e.target.value)}
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label="Primary button">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Label">
              <input
                type="text"
                value={draft.primary_button_label}
                onChange={(e) => setField('primary_button_label', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Link">
              <input
                type="text"
                value={draft.primary_button_href}
                onChange={(e) => setField('primary_button_href', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup label="Secondary button">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Label">
              <input
                type="text"
                value={draft.secondary_button_label}
                onChange={(e) => setField('secondary_button_label', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Link">
              <input
                type="text"
                value={draft.secondary_button_href}
                onChange={(e) => setField('secondary_button_href', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </FieldGroup>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Live preview</h3>
          <span className="text-xs text-gray-400">Approximate</span>
        </div>
        <div className="text-center">
          <h2 className="text-base font-black leading-tight text-gray-900">{draft.headline}</h2>
          <h3 className="mt-4 text-sm font-black text-gray-900">{draft.subheadline}</h3>
          <p className="mt-2 text-[11px] text-gray-600 leading-relaxed">{draft.body}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-[10px] font-bold text-white bg-[#1A1A1A] rounded-full px-3 py-1.5">
              {draft.primary_button_label}
            </span>
            <span className="text-[10px] font-bold text-gray-900 border border-gray-300 rounded-full px-3 py-1.5">
              {draft.secondary_button_label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
