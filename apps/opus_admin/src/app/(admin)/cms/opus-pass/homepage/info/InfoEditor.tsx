'use client'

import { useEffect, useState, useTransition } from 'react'
import { ChevronsDownUp, ChevronsUpDown, Plus } from 'lucide-react'
import type { OpusPassInfoContent, OpusPassInfoParagraph } from '@/lib/cms/opus-pass-info'
import { CollapsibleCard } from '@/components/cms/CollapsibleCard'
import { useEditorActions } from '../EditorActionsContext'
import { discardOpusPassInfoDraft, publishOpusPassInfo, saveOpusPassInfoDraft } from './actions'

type Props = {
  initial: OpusPassInfoContent
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
  return `para-${Math.random().toString(36).slice(2, 9)}`
}

export default function InfoEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassInfoContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([0, 1, 2]))
  const toggleExpanded = (idx: number) =>
    setExpanded((s) => {
      const next = new Set(s)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  const expandAll = () => setExpanded(new Set(draft.paragraphs.map((_, i) => i)))
  const collapseAll = () => setExpanded(new Set())

  const set = <K extends keyof OpusPassInfoContent>(key: K, value: OpusPassInfoContent[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const setPara = (idx: number, patch: Partial<OpusPassInfoParagraph>) =>
    setDraft((d) => ({
      ...d,
      paragraphs: d.paragraphs.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }))

  const addPara = () =>
    setDraft((d) => ({
      ...d,
      paragraphs: [...d.paragraphs, { id: randomId(), heading: '', body: '' }],
    }))

  const removePara = (idx: number) =>
    setDraft((d) => ({ ...d, paragraphs: d.paragraphs.filter((_, i) => i !== idx) }))

  const movePara = (idx: number, delta: number) =>
    setDraft((d) => {
      const next = [...d.paragraphs]
      const target = idx + delta
      if (target < 0 || target >= next.length) return d
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return { ...d, paragraphs: next }
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
      await saveOpusPassInfoDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassInfoDraft(draft)
      await publishOpusPassInfo()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassInfoDraft()
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
        <h3 className="text-[15px] font-semibold text-gray-900">About OpusPass content</h3>
      <FieldGroup label="Header">
        <Field label="Title">
          <input
            type="text"
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="About OpusPass"
            className={inputCls}
          />
        </Field>
        <Field label="Lead paragraph">
          <textarea
            rows={3}
            value={draft.lead}
            onChange={(e) => set('lead', e.target.value)}
            className={inputCls}
          />
        </Field>
      </FieldGroup>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Paragraphs ({draft.paragraphs.length})
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
        {draft.paragraphs.map((para, idx) => (
          <CollapsibleCard
            key={para.id}
            index={idx}
            title={para.heading || 'New paragraph'}
            collapsed={!expanded.has(idx)}
            onToggle={() => toggleExpanded(idx)}
            onMoveUp={() => movePara(idx, -1)}
            onMoveDown={() => movePara(idx, 1)}
            onRemove={() => removePara(idx)}
            disableMoveUp={idx === 0}
            disableMoveDown={idx === draft.paragraphs.length - 1}
          >
            <Field label="Heading">
              <input
                type="text"
                value={para.heading}
                onChange={(e) => setPara(idx, { heading: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Body">
              <textarea
                rows={4}
                value={para.body}
                onChange={(e) => setPara(idx, { body: e.target.value })}
                className={inputCls}
              />
            </Field>
          </CollapsibleCard>
        ))}
        <button
          type="button"
          onClick={addPara}
          className="flex items-center gap-2 text-sm font-medium text-[#7E5896] hover:text-[#5d3a78] px-3 py-2 rounded-lg border border-dashed border-[#C9A0DC] hover:bg-[#F0DFF6] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add paragraph
        </button>
      </div>

      <FieldGroup label="Closing CTA">
        <Field label="Heading">
          <input
            type="text"
            value={draft.closing_heading}
            onChange={(e) => set('closing_heading', e.target.value)}
            placeholder="Ready when you are."
            className={inputCls}
          />
        </Field>
        <Field label="CTA label">
          <input
            type="text"
            value={draft.cta_label}
            onChange={(e) => set('cta_label', e.target.value)}
            placeholder="Get started"
            className={inputCls}
          />
        </Field>
        <Field label="CTA destination URL">
          <input
            type="text"
            value={draft.cta_href}
            onChange={(e) => set('cta_href', e.target.value)}
            placeholder="/sign-up"
            className={inputCls}
          />
        </Field>
      </FieldGroup>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Live preview</h3>
          <span className="text-xs text-gray-400">Approximate</span>
        </div>
        <InfoPreview content={draft} />
      </div>
    </div>
  )
}

function InfoPreview({ content }: { content: OpusPassInfoContent }) {
  return (
    <div className="bg-[#f4ecf8]/60 rounded-lg p-5 text-gray-800">
      <div className="text-center mb-5">
        <h2 className="text-base font-serif font-medium mb-1.5 text-gray-900">
          {content.title || 'About OpusPass'}
        </h2>
        <p className="text-[10px] text-gray-700 leading-relaxed">{content.lead}</p>
      </div>

      <div className="space-y-3 text-left mb-5">
        {content.paragraphs.map((para) => (
          <div key={para.id}>
            <h3 className="font-medium text-[11px] text-gray-900 mb-0.5">{para.heading || 'Heading'}</h3>
            <p className="text-[10px] text-gray-700 leading-relaxed line-clamp-3">{para.body}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <h3 className="text-xs font-medium text-gray-900 mb-2">
          {content.closing_heading || 'Closing heading'}
        </h3>
        <span className="inline-block border border-gray-900 text-gray-900 font-medium px-3 py-1 rounded-full text-[10px] bg-white">
          {content.cta_label || 'CTA'}
        </span>
      </div>
    </div>
  )
}
