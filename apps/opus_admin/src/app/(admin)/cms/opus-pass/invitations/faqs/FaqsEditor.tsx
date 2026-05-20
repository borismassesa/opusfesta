'use client'

import { useEffect, useState, useTransition } from 'react'
import { ChevronsDownUp, ChevronsUpDown, Plus } from 'lucide-react'
import type {
  OpusPassFaqItem,
  OpusPassInvitationsFaqsContent,
} from '@/lib/cms/opus-pass-invitations-faqs'
import { CollapsibleCard } from '@/components/cms/CollapsibleCard'
import { useEditorActions } from '../EditorActionsContext'
import {
  discardOpusPassInvitationsFaqsDraft,
  publishOpusPassInvitationsFaqs,
  saveOpusPassInvitationsFaqsDraft,
} from './actions'

type Props = {
  initial: OpusPassInvitationsFaqsContent
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
  return `faq-${Math.random().toString(36).slice(2, 9)}`
}

export default function FaqsEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassInvitationsFaqsContent>(initial)
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

  const setField = <K extends keyof OpusPassInvitationsFaqsContent>(
    key: K,
    value: OpusPassInvitationsFaqsContent[K],
  ) => setDraft((d) => ({ ...d, [key]: value }))

  const setItem = (idx: number, patch: Partial<OpusPassFaqItem>) =>
    setDraft((d) => ({
      ...d,
      items: d.items.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }))

  const addItem = () =>
    setDraft((d) => ({
      ...d,
      items: [...d.items, { id: randomId(), question: '', answer: '' }],
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
      await saveOpusPassInvitationsFaqsDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassInvitationsFaqsDraft(draft)
      await publishOpusPassInvitationsFaqs()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassInvitationsFaqsDraft()
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
        <h3 className="text-[15px] font-semibold text-gray-900">FAQs content</h3>

        <FieldGroup label="Section header">
          <Field label="Heading">
            <input
              type="text"
              value={draft.heading}
              onChange={(e) => setField('heading', e.target.value)}
              placeholder="Frequently asked questions"
              className={inputCls}
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={2}
              value={draft.description}
              onChange={(e) => setField('description', e.target.value)}
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Q&amp;A pairs ({draft.items.length})
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
          {draft.items.map((item, idx) => (
            <CollapsibleCard
              key={item.id}
              index={idx}
              title={item.question || 'New question'}
              collapsed={!expanded.has(idx)}
              onToggle={() => toggleExpanded(idx)}
              onMoveUp={() => moveItem(idx, -1)}
              onMoveDown={() => moveItem(idx, 1)}
              onRemove={() => removeItem(idx)}
              disableMoveUp={idx === 0}
              disableMoveDown={idx === draft.items.length - 1}
            >
              <Field label="Question">
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => setItem(idx, { question: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Answer">
                <textarea
                  rows={4}
                  value={item.answer}
                  onChange={(e) => setItem(idx, { answer: e.target.value })}
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
            Add FAQ
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Live preview</h3>
          <span className="text-xs text-gray-400">Approximate</span>
        </div>
        <FaqsPreview content={draft} />
      </div>
    </div>
  )
}

function FaqsPreview({ content }: { content: OpusPassInvitationsFaqsContent }) {
  return (
    <div>
      <div className="text-center mb-5">
        <h2 className="text-base font-serif font-medium text-gray-900 mb-1.5">
          {content.heading || 'Section heading'}
        </h2>
        <p className="text-[10px] text-gray-700 leading-relaxed">{content.description}</p>
      </div>
      <div className="border-y border-gray-200">
        {content.items.map((item) => (
          <div key={item.id} className="border-b border-gray-200 last:border-b-0 py-3">
            <p className="text-xs font-medium text-gray-900 leading-snug">{item.question}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
