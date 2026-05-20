'use client'

import { useEffect, useState, useTransition } from 'react'
import { ChevronsDownUp, ChevronsUpDown, Plus } from 'lucide-react'
import type {
  OpusPassInvitationsStyleStripContent,
  OpusPassInvitationsStyleStripItem,
} from '@/lib/cms/opus-pass-invitations-style-strip'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import { CollapsibleCard } from '@/components/cms/CollapsibleCard'
import { resolveOpusPassAssetUrl } from '@/lib/cms/opus-pass-asset-url'
import { useEditorActions } from '../EditorActionsContext'
import {
  discardOpusPassInvitationsStyleStripDraft,
  publishOpusPassInvitationsStyleStrip,
  saveOpusPassInvitationsStyleStripDraft,
} from './actions'

type Props = {
  initial: OpusPassInvitationsStyleStripContent
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

function randomId(): string {
  return `s-${Math.random().toString(36).slice(2, 9)}`
}

export default function StyleStripEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassInvitationsStyleStripContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const [expanded, setExpanded] = useState<Set<number>>(() => new Set())
  const toggleExpanded = (idx: number) =>
    setExpanded((s) => {
      const next = new Set(s)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  const expandAll = () => setExpanded(new Set(draft.items.map((_, i) => i)))
  const collapseAll = () => setExpanded(new Set())

  const setItem = (idx: number, patch: Partial<OpusPassInvitationsStyleStripItem>) =>
    setDraft((d) => ({
      ...d,
      items: d.items.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }))

  const addItem = () =>
    setDraft((d) => ({
      ...d,
      items: [...d.items, { id: randomId(), label: '', img: '', alt: '' }],
    }))

  const removeItem = (idx: number) =>
    setDraft((d) => ({ ...d, items: d.items.filter((_, i) => i !== idx) }))

  const moveItem = (idx: number, delta: number) =>
    setDraft((d) => {
      const next = [...d.items]
      const target = idx + delta
      if (target < 0 || target >= next.length) return d
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return { ...d, items: next }
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
      await saveOpusPassInvitationsStyleStripDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassInvitationsStyleStripDraft(draft)
      await publishOpusPassInvitationsStyleStrip()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassInvitationsStyleStripDraft()
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
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-gray-900">Style strip content</h3>
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
        <p className="text-xs text-gray-500 leading-relaxed">
          Horizontal carousel of circular-photo filter shortcuts shown beneath the title on the
          catalog + category pages.
        </p>

        <div className="space-y-3">
          {draft.items.map((item, idx) => (
            <CollapsibleCard
              key={item.id}
              index={idx}
              title={item.label || 'New chip'}
              collapsed={!expanded.has(idx)}
              onToggle={() => toggleExpanded(idx)}
              onMoveUp={() => moveItem(idx, -1)}
              onMoveDown={() => moveItem(idx, 1)}
              onRemove={() => removeItem(idx)}
              disableMoveUp={idx === 0}
              disableMoveDown={idx === draft.items.length - 1}
            >
              <Field label="Label">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => setItem(idx, { label: e.target.value })}
                  placeholder="Florals"
                  className={inputCls}
                />
              </Field>
              <ImageUploadField
                label="Photo (round thumbnail)"
                value={item.img}
                onChange={(v) => setItem(idx, { img: v })}
                pathPrefix="opus-pass/invitations/style-strip"
                previewAspect="aspect-square"
                previewWidth="max-w-[120px]"
              />
              <Field label="Alt text">
                <input
                  type="text"
                  value={item.alt}
                  onChange={(e) => setItem(idx, { alt: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Link URL (optional)">
                <input
                  type="text"
                  value={item.href ?? ''}
                  onChange={(e) => setItem(idx, { href: e.target.value || undefined })}
                  placeholder="/invitations/catalog?style=florals"
                  className={inputCls}
                />
              </Field>
            </CollapsibleCard>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 text-sm font-medium text-[#7E5896] hover:text-[#5d3a78] px-3 py-2 rounded-lg border border-dashed border-[#C9A0DC] hover:bg-[#F0DFF6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add chip
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Live preview</h3>
          <span className="text-xs text-gray-400">Approximate</span>
        </div>
        <StyleStripPreview content={draft} />
      </div>
    </div>
  )
}

function StyleStripPreview({ content }: { content: OpusPassInvitationsStyleStripContent }) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      {content.items.map((item) => (
        <div key={item.id} className="flex flex-col items-center gap-1 w-[64px]">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200">
            {item.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolveOpusPassAssetUrl(item.img)} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <span className="text-[8px] text-center text-gray-700 leading-tight line-clamp-2">
            {item.label || 'Label'}
          </span>
        </div>
      ))}
    </div>
  )
}
