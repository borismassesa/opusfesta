'use client'

import { useEffect, useState, useTransition } from 'react'
import type { AttireHeroContent } from '@/lib/cms/attire-hero'
import { cn } from '@/lib/utils'
import { useEditorActions } from '../EditorActionsContext'
import { discardAttireHeroDraft, publishAttireHero, saveAttireHeroDraft } from './actions'

type Props = {
  initial: AttireHeroContent
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
  const [draft, setDraft] = useState<AttireHeroContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const set = <K extends keyof AttireHeroContent>(key: K, value: AttireHeroContent[K]) =>
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
      await saveAttireHeroDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveAttireHeroDraft(draft)
      await publishAttireHero()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardAttireHeroDraft()
      setDraft(initial)
      setHasDraft(false)
      setMessage('Draft discarded.')
    })

  useEffect(() => {
    bind({ hasDraft, pending, message, error, onSaveDraft: handleSaveDraft, onPublish: handlePublish, onDiscard: handleDiscard })
    return () => unbind()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDraft, pending, message, error, draft])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-5">
          <h3 className="text-[15px] font-semibold text-gray-900">Hero content</h3>

          <Field label="Headline" hint={<CharCount value={draft.headline} max={80} />}>
            <input
              type="text"
              value={draft.headline}
              onChange={(e) => set('headline', e.target.value)}
              className={inputCls}
              placeholder="Find your perfect attire & rings"
            />
          </Field>

          <Field label="Description" hint={<CharCount value={draft.description} max={200} />}>
            <textarea
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className={inputCls}
              placeholder="Curated wedding dresses, tailored suits…"
            />
          </Field>

          <FieldGroup label="Primary CTA">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Button label">
                <input
                  type="text"
                  value={draft.cta_label}
                  onChange={(e) => set('cta_label', e.target.value)}
                  className={inputCls}
                  placeholder="Shop the bridal collection"
                />
              </Field>
              <Field label="Link">
                <input
                  type="text"
                  value={draft.cta_href}
                  onChange={(e) => set('cta_href', e.target.value)}
                  className={inputCls}
                  placeholder="/attire-and-rings/bridal-collection"
                />
              </Field>
            </div>
          </FieldGroup>

          <FieldGroup label="Main hero image">
            <Field label="Image URL">
              <input
                type="text"
                value={draft.main_image_url}
                onChange={(e) => set('main_image_url', e.target.value)}
                className={inputCls}
                placeholder="https://…"
              />
            </Field>
            {draft.main_image_url && (
              <div className="rounded-lg overflow-hidden border border-gray-200 aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.main_image_url} alt="Hero image preview" className="w-full h-full object-cover" />
              </div>
            )}
          </FieldGroup>

          <FieldGroup label="Side card">
            <Field label="Image URL">
              <input
                type="text"
                value={draft.card_image_url}
                onChange={(e) => set('card_image_url', e.target.value)}
                className={inputCls}
                placeholder="https://…"
              />
            </Field>
            {draft.card_image_url && (
              <div className="rounded-lg overflow-hidden border border-gray-200 aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.card_image_url} alt="Card image preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Heading">
                <input
                  type="text"
                  value={draft.card_heading}
                  onChange={(e) => set('card_heading', e.target.value)}
                  className={inputCls}
                  placeholder="Meet our top bridal vendors"
                />
              </Field>
              <Field label="Link label">
                <input
                  type="text"
                  value={draft.card_link_label}
                  onChange={(e) => set('card_link_label', e.target.value)}
                  className={inputCls}
                  placeholder="Discover"
                />
              </Field>
            </div>
            <Field label="Card link">
              <input
                type="text"
                value={draft.card_href}
                onChange={(e) => set('card_href', e.target.value)}
                className={inputCls}
                placeholder="/attire-and-rings/bridal-collection"
              />
            </Field>
          </FieldGroup>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-gray-900">Preview</h3>
            <span className="text-xs text-gray-400">Approximate</span>
          </div>
          <HeroPreview content={draft} />
        </div>
      </div>
    </div>
  )
}

function HeroPreview({ content }: { content: AttireHeroContent }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden bg-[#dde6ec] p-5">
        <h1 className="text-lg font-serif font-medium text-gray-900 mb-2">{content.headline || 'Headline'}</h1>
        <p className="text-xs text-gray-700 mb-3 leading-relaxed">{content.description || 'Description'}</p>
        <span className="inline-block bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-medium">
          {content.cta_label || 'CTA label'}
        </span>
      </div>

      {content.card_image_url && (
        <div className="rounded-xl overflow-hidden aspect-[4/3] relative bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.card_image_url} alt="Card" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <p className="text-sm font-serif font-medium">{content.card_heading || 'Card heading'}</p>
            <span className="text-xs underline">{content.card_link_label || 'Link'}</span>
          </div>
        </div>
      )}
    </div>
  )
}
