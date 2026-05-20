'use client'

import { useEffect, useState, useTransition } from 'react'
import { ChevronsDownUp, ChevronsUpDown, Plus } from 'lucide-react'
import { CollapsibleCard } from '@/components/cms/CollapsibleCard'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import { resolveOpusPassAssetUrl } from '@/lib/cms/opus-pass-asset-url'
import {
  INVITATIONS_FEATURE_VISUALS,
  type OpusPassInvitationsFeatureCard,
  type OpusPassInvitationsFeatureVisual,
  type OpusPassInvitationsFeaturesContent,
} from '@/lib/cms/opus-pass-invitations-features'
import { useEditorActions } from '../EditorActionsContext'
import {
  discardOpusPassInvitationsFeaturesDraft,
  publishOpusPassInvitationsFeatures,
  saveOpusPassInvitationsFeaturesDraft,
} from './actions'

type Props = {
  initial: OpusPassInvitationsFeaturesContent
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

function randomId(): string {
  return `card-${Math.random().toString(36).slice(2, 9)}`
}

export default function FeaturesEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassInvitationsFeaturesContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([0]))
  const toggleExpanded = (idx: number) =>
    setExpanded((s) => {
      const next = new Set(s)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  const expandAll = () => setExpanded(new Set(draft.cards.map((_, i) => i)))
  const collapseAll = () => setExpanded(new Set())

  const setField = <K extends keyof OpusPassInvitationsFeaturesContent>(
    key: K,
    value: OpusPassInvitationsFeaturesContent[K],
  ) => setDraft((d) => ({ ...d, [key]: value }))

  const setCard = (idx: number, patch: Partial<OpusPassInvitationsFeatureCard>) =>
    setDraft((d) => ({
      ...d,
      cards: d.cards.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }))

  const addCard = () =>
    setDraft((d) => ({
      ...d,
      cards: [
        ...d.cards,
        { id: randomId(), title: '', body: '', cta_label: '', cta_href: '', visual: 'invitations' },
      ],
    }))

  const removeCard = (idx: number) =>
    setDraft((d) => ({ ...d, cards: d.cards.filter((_, i) => i !== idx) }))

  const moveCard = (idx: number, delta: number) =>
    setDraft((d) => {
      const next = [...d.cards]
      const target = idx + delta
      if (target < 0 || target >= next.length) return d
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return { ...d, cards: next }
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
      await saveOpusPassInvitationsFeaturesDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassInvitationsFeaturesDraft(draft)
      await publishOpusPassInvitationsFeatures()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassInvitationsFeaturesDraft()
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
        <h3 className="text-[15px] font-semibold text-gray-900">Features content</h3>

        <FieldGroup label="Section heading">
          <Field label="Heading">
            <input
              type="text"
              value={draft.heading}
              onChange={(e) => setField('heading', e.target.value)}
              placeholder="Wedding stationery made easy, from invite to seat"
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Cards ({draft.cards.length})
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={expandAll}
                className="flex items-center gap-1 text-[11px] font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                <ChevronsUpDown className="w-3 h-3" />
                Expand all
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="flex items-center gap-1 text-[11px] font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                <ChevronsDownUp className="w-3 h-3" />
                Collapse all
              </button>
            </div>
          </div>
          {draft.cards.map((card, idx) => (
            <CollapsibleCard
              key={card.id}
              index={idx}
              title={card.title || 'New card'}
              collapsed={!expanded.has(idx)}
              onToggle={() => toggleExpanded(idx)}
              onMoveUp={() => moveCard(idx, -1)}
              onMoveDown={() => moveCard(idx, 1)}
              onRemove={() => removeCard(idx)}
              disableMoveUp={idx === 0}
              disableMoveDown={idx === draft.cards.length - 1}
            >
              <Field label="Title">
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => setCard(idx, { title: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Body">
                <textarea
                  rows={3}
                  value={card.body}
                  onChange={(e) => setCard(idx, { body: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="CTA label">
                <input
                  type="text"
                  value={card.cta_label}
                  onChange={(e) => setCard(idx, { cta_label: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="CTA destination URL">
                <input
                  type="text"
                  value={card.cta_href}
                  onChange={(e) => setCard(idx, { cta_href: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <ImageUploadField
                label="Image (optional — replaces the visual style below)"
                value={card.image_url ?? ''}
                onChange={(v) => setCard(idx, { image_url: v || undefined })}
                pathPrefix="opus-pass/invitations/features"
                previewAspect="aspect-square"
                previewWidth="max-w-[200px]"
              />
              <Field
                label={
                  card.image_url
                    ? 'Visual style (not used — clear the image above to enable)'
                    : 'Visual style (built-in CSS art)'
                }
              >
                <select
                  value={card.visual}
                  onChange={(e) =>
                    setCard(idx, { visual: e.target.value as OpusPassInvitationsFeatureVisual })
                  }
                  disabled={!!card.image_url}
                  className={`${inputCls} disabled:opacity-50 disabled:bg-gray-50`}
                >
                  {INVITATIONS_FEATURE_VISUALS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
            </CollapsibleCard>
          ))}
          <button
            type="button"
            onClick={addCard}
            className="flex items-center gap-2 text-sm font-medium text-[#7E5896] hover:text-[#5d3a78] px-3 py-2 rounded-lg border border-dashed border-[#C9A0DC] hover:bg-[#F0DFF6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add card
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Live preview</h3>
          <span className="text-xs text-gray-400">Approximate</span>
        </div>
        <FeaturesPreview content={draft} />
      </div>
    </div>
  )
}

function FeaturesPreview({ content }: { content: OpusPassInvitationsFeaturesContent }) {
  return (
    <div className="space-y-4">
      <h2 className="text-center text-sm sm:text-base font-serif font-medium text-gray-900 leading-tight">
        {content.heading || 'Section heading'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {content.cards.map((card) => (
          <div
            key={card.id}
            className="bg-[#FCE9C2] rounded-md p-3 flex flex-col items-center text-center"
          >
            <h3 className="text-[11px] font-extrabold tracking-tight text-[#1A1A1A]">
              {card.title || 'Title'}
            </h3>
            <p className="mt-1 text-[9px] text-[#1A1A1A]/75 leading-snug line-clamp-3">{card.body}</p>
            <span className="mt-1.5 text-[9px] font-bold text-[#1A1A1A] underline underline-offset-2">
              {card.cta_label || 'CTA'}
            </span>
            <div className="mt-3 w-full h-[60px] rounded bg-white/60 overflow-hidden flex items-center justify-center text-[8px] uppercase tracking-wider text-gray-400">
              {card.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveOpusPassAssetUrl(card.image_url)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                card.visual
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
