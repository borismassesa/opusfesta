'use client'

import { useEffect, useState, useTransition } from 'react'
import { Check, ChevronsDownUp, ChevronsUpDown, GripVertical, Plus, Trash2 } from 'lucide-react'
import { CollapsibleCard } from '@/components/cms/CollapsibleCard'
import {
  OPUS_PASS_PRODUCT_ADDONS_FAQ_FALLBACK,
  productAddonsFaqRandomId,
  type FaqItem,
  type ProductAddonsFaqContent,
} from '@/lib/cms/opus-pass-product-addons-faq'
import { useEditorActions } from '../EditorActionsContext'
import {
  discardOpusPassAddonsFaqDraft,
  publishOpusPassAddonsFaq,
  saveOpusPassAddonsFaqDraft,
} from './actions'

type Props = { initial: ProductAddonsFaqContent; hasDraft: boolean }

const inputCls =
  'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A0DC] focus:border-transparent transition-all'
const textareaCls = `${inputCls} min-h-[88px] resize-y`

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

export default function AddonsFaqEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<ProductAddonsFaqContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const [openFaq, setOpenFaq] = useState<Set<number>>(() => new Set([0]))
  const toggle = (set: Set<number>, setter: (s: Set<number>) => void, idx: number) => {
    const next = new Set(set)
    next.has(idx) ? next.delete(idx) : next.add(idx)
    setter(next)
  }

  const setField = <K extends keyof ProductAddonsFaqContent>(key: K, value: ProductAddonsFaqContent[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const setPaperPrints = (patch: Partial<ProductAddonsFaqContent['paperPrints']>) =>
    setDraft((d) => ({ ...d, paperPrints: { ...d.paperPrints, ...patch } }))
  const setDoorScan = (patch: Partial<ProductAddonsFaqContent['doorScan']>) =>
    setDraft((d) => ({ ...d, doorScan: { ...d.doorScan, ...patch } }))
  const setDoorScanIncluded = (patch: Partial<ProductAddonsFaqContent['doorScanIncluded']>) =>
    setDraft((d) => ({ ...d, doorScanIncluded: { ...d.doorScanIncluded, ...patch } }))

  // ── FAQ items ──
  const setFaqItem = (idx: number, patch: Partial<FaqItem>) =>
    setDraft((d) => ({ ...d, faq: d.faq.map((f, i) => (i === idx ? { ...f, ...patch } : f)) }))

  const addFaqItem = () =>
    setDraft((d) => ({
      ...d,
      faq: [
        ...d.faq,
        {
          id: productAddonsFaqRandomId('faq'),
          title: 'New question', title_sw: '',
          body: '', body_sw: '',
          link_label: '', link_label_sw: '', link_href: '',
        },
      ],
    }))

  const removeFaqItem = (idx: number) =>
    setDraft((d) => ({ ...d, faq: d.faq.filter((_, i) => i !== idx) }))

  const moveFaqItem = (idx: number, delta: number) =>
    setDraft((d) => {
      const next = [...d.faq]
      const t = idx + delta
      if (t < 0 || t >= next.length) return d
      ;[next[idx], next[t]] = [next[t], next[idx]]
      return { ...d, faq: next }
    })

  // ── Save / publish / discard ──
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
      await saveOpusPassAddonsFaqDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })
  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassAddonsFaqDraft(draft)
      await publishOpusPassAddonsFaq()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })
  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassAddonsFaqDraft()
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
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start pb-12">
      {/* ── Editor ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-gray-900">Optional add-ons & FAQ</h3>
          <button
            type="button"
            onClick={() => { setDraft(OPUS_PASS_PRODUCT_ADDONS_FAQ_FALLBACK); setMessage('Reset to defaults — save the draft to keep this.') }}
            className="text-[11px] font-medium text-gray-500 underline underline-offset-2 hover:text-gray-800"
          >
            Reset to defaults
          </button>
        </div>

        <FieldGroup label="Section labels">
          <div className="grid grid-cols-2 gap-3">
            <Field label="'Optional add-ons' heading (EN)"><input className={inputCls} value={draft.addonsHeading} onChange={(e) => setField('addonsHeading', e.target.value)} /></Field>
            <Field label="Heading (SW)"><input className={inputCls} value={draft.addonsHeading_sw} onChange={(e) => setField('addonsHeading_sw', e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="'Description' label (EN)"><input className={inputCls} value={draft.descriptionLabel} onChange={(e) => setField('descriptionLabel', e.target.value)} /></Field>
            <Field label="Label (SW)"><input className={inputCls} value={draft.descriptionLabel_sw} onChange={(e) => setField('descriptionLabel_sw', e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="'Included' pill (EN)"><input className={inputCls} value={draft.includedPillLabel} onChange={(e) => setField('includedPillLabel', e.target.value)} /></Field>
            <Field label="Pill (SW)"><input className={inputCls} value={draft.includedPillLabel_sw} onChange={(e) => setField('includedPillLabel_sw', e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="'Read More' (EN)"><input className={inputCls} value={draft.readMoreLabel} onChange={(e) => setField('readMoreLabel', e.target.value)} /></Field>
            <Field label="(SW)"><input className={inputCls} value={draft.readMoreLabel_sw} onChange={(e) => setField('readMoreLabel_sw', e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="'Read Less' (EN)"><input className={inputCls} value={draft.readLessLabel} onChange={(e) => setField('readLessLabel', e.target.value)} /></Field>
            <Field label="(SW)"><input className={inputCls} value={draft.readLessLabel_sw} onChange={(e) => setField('readLessLabel_sw', e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="'From' price prefix (EN)"><input className={inputCls} value={draft.priceFromLabel} onChange={(e) => setField('priceFromLabel', e.target.value)} /></Field>
            <Field label="(SW)"><input className={inputCls} value={draft.priceFromLabel_sw} onChange={(e) => setField('priceFromLabel_sw', e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="'per print' unit (EN)"><input className={inputCls} value={draft.perPrintUnitLabel} onChange={(e) => setField('perPrintUnitLabel', e.target.value)} /></Field>
            <Field label="(SW)"><input className={inputCls} value={draft.perPrintUnitLabel_sw} onChange={(e) => setField('perPrintUnitLabel_sw', e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="'flat fee per event' (EN)"><input className={inputCls} value={draft.flatFeePerEventLabel} onChange={(e) => setField('flatFeePerEventLabel', e.target.value)} /></Field>
            <Field label="(SW)"><input className={inputCls} value={draft.flatFeePerEventLabel_sw} onChange={(e) => setField('flatFeePerEventLabel_sw', e.target.value)} /></Field>
          </div>
        </FieldGroup>

        <FieldGroup label="Premium printed cards (paper prints add-on)">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title (EN)"><input className={inputCls} value={draft.paperPrints.title} onChange={(e) => setPaperPrints({ title: e.target.value })} /></Field>
            <Field label="Title (SW)"><input className={inputCls} value={draft.paperPrints.title_sw} onChange={(e) => setPaperPrints({ title_sw: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Description (EN)"><textarea className={textareaCls} value={draft.paperPrints.description} onChange={(e) => setPaperPrints({ description: e.target.value })} /></Field>
            <Field label="Description (SW)"><textarea className={textareaCls} value={draft.paperPrints.description_sw} onChange={(e) => setPaperPrints({ description_sw: e.target.value })} /></Field>
          </div>
        </FieldGroup>

        <FieldGroup label="On-site scanning attendant — paid add-on (Essential & Classic)">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title (EN)"><input className={inputCls} value={draft.doorScan.title} onChange={(e) => setDoorScan({ title: e.target.value })} /></Field>
            <Field label="Title (SW)"><input className={inputCls} value={draft.doorScan.title_sw} onChange={(e) => setDoorScan({ title_sw: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Description (EN)"><textarea className={textareaCls} value={draft.doorScan.description} onChange={(e) => setDoorScan({ description: e.target.value })} /></Field>
            <Field label="Description (SW)"><textarea className={textareaCls} value={draft.doorScan.description_sw} onChange={(e) => setDoorScan({ description_sw: e.target.value })} /></Field>
          </div>
        </FieldGroup>

        <FieldGroup label="On-site scanning attendant — included copy (Elegant & Signature)">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title (EN)"><input className={inputCls} value={draft.doorScanIncluded.title} onChange={(e) => setDoorScanIncluded({ title: e.target.value })} /></Field>
            <Field label="Title (SW)"><input className={inputCls} value={draft.doorScanIncluded.title_sw} onChange={(e) => setDoorScanIncluded({ title_sw: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Description (EN)"><textarea className={textareaCls} value={draft.doorScanIncluded.description} onChange={(e) => setDoorScanIncluded({ description: e.target.value })} /></Field>
            <Field label="Description (SW)"><textarea className={textareaCls} value={draft.doorScanIncluded.description_sw} onChange={(e) => setDoorScanIncluded({ description_sw: e.target.value })} /></Field>
          </div>
        </FieldGroup>

        {/* ── FAQ ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">FAQ accordion ({draft.faq.length})</p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setOpenFaq(new Set(draft.faq.map((_, i) => i)))} className="flex items-center gap-1 text-[11px] font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100">
                <ChevronsUpDown className="w-3 h-3" /> Expand all
              </button>
              <button type="button" onClick={() => setOpenFaq(new Set())} className="flex items-center gap-1 text-[11px] font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100">
                <ChevronsDownUp className="w-3 h-3" /> Collapse all
              </button>
            </div>
          </div>

          {draft.faq.map((item, idx) => (
            <CollapsibleCard
              key={item.id}
              index={idx}
              title={item.title || 'New question'}
              subtitle={item.link_href ? `Links to ${item.link_href}` : undefined}
              collapsed={!openFaq.has(idx)}
              onToggle={() => toggle(openFaq, setOpenFaq, idx)}
              onMoveUp={() => moveFaqItem(idx, -1)}
              onMoveDown={() => moveFaqItem(idx, 1)}
              onRemove={() => removeFaqItem(idx)}
              disableMoveUp={idx === 0}
              disableMoveDown={idx === draft.faq.length - 1}
            >
              <div className="grid grid-cols-2 gap-3">
                <Field label="Question (EN)"><input className={inputCls} value={item.title} onChange={(e) => setFaqItem(idx, { title: e.target.value })} /></Field>
                <Field label="Question (SW)"><input className={inputCls} value={item.title_sw} onChange={(e) => setFaqItem(idx, { title_sw: e.target.value })} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Answer (EN)"><textarea className={textareaCls} value={item.body} onChange={(e) => setFaqItem(idx, { body: e.target.value })} /></Field>
                <Field label="Answer (SW)"><textarea className={textareaCls} value={item.body_sw} onChange={(e) => setFaqItem(idx, { body_sw: e.target.value })} /></Field>
              </div>
              <p className="text-[11px] text-gray-400">
                To embed a link inline (like the Cancellation policy answer), write <code className="font-mono">{'{link}'}</code> where the link text should appear.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Link text (EN, optional)"><input className={inputCls} value={item.link_label} onChange={(e) => setFaqItem(idx, { link_label: e.target.value })} /></Field>
                <Field label="Link text (SW, optional)"><input className={inputCls} value={item.link_label_sw} onChange={(e) => setFaqItem(idx, { link_label_sw: e.target.value })} /></Field>
              </div>
              <Field label="Link URL (optional, e.g. /cancellation)">
                <input className={inputCls} value={item.link_href} onChange={(e) => setFaqItem(idx, { link_href: e.target.value })} />
              </Field>
              <p className="text-[11px] text-gray-400">Internal key: <code className="font-mono">{item.id}</code></p>
            </CollapsibleCard>
          ))}
          <button type="button" onClick={addFaqItem} className="flex items-center gap-2 text-sm font-medium text-[#7E5896] hover:text-[#5d3a78] px-3 py-2 rounded-lg border border-dashed border-[#C9A0DC] hover:bg-[#F0DFF6]">
            <Plus className="w-4 h-4" /> Add question
          </button>
        </div>
      </div>

      {/* ── Preview ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Live preview</h3>
          <span className="text-xs text-gray-400">Approximate</span>
        </div>
        <AddonsFaqPreview content={draft} />
      </div>
    </div>
  )
}

function AddonsFaqPreview({ content }: { content: ProductAddonsFaqContent }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[13px] font-bold text-gray-900 mb-2">{content.addonsHeading || 'Optional add-ons'}</p>
        <div className="space-y-2">
          <div className="rounded-md border border-gray-200 bg-white p-3">
            <p className="text-[13px] font-bold text-gray-900">{content.paperPrints.title || 'Premium printed cards'}</p>
            <p className="mt-1 text-[11px] text-gray-600 leading-relaxed">{content.paperPrints.description}</p>
            <p className="mt-1.5 text-[11px] font-bold text-gray-900">{content.priceFromLabel} TZS 2,000 {content.perPrintUnitLabel}</p>
          </div>
          <div className="rounded-md border border-[#CDEBA6] bg-[#F4FBE9] p-3">
            <div className="flex items-center gap-2">
              <span aria-hidden className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#5C6B4D] text-white"><Check size={11} strokeWidth={3} /></span>
              <p className="text-[13px] font-bold text-gray-900">{content.doorScanIncluded.title || 'On-site scanning attendant'}</p>
              <span className="rounded-full bg-[#9FE870] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#1A1A1A]">{content.includedPillLabel}</span>
            </div>
            <p className="mt-1 text-[11px] text-gray-600 leading-relaxed">{content.doorScanIncluded.description}</p>
          </div>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">FAQ</p>
        <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
          {content.faq.map((f) => (
            <div key={f.id} className="py-2.5">
              <p className="text-[13px] font-medium text-gray-900 flex items-center gap-1.5"><GripVertical className="w-3 h-3 text-gray-300" />{f.title || 'Question'}</p>
              <p className="mt-1 text-[11px] text-gray-600 leading-relaxed pl-[18px]">
                {f.link_href
                  ? f.body.split('{link}').map((chunk, i, arr) => (
                      <span key={i}>
                        {chunk}
                        {i < arr.length - 1 && <span className="font-semibold text-gray-900 underline underline-offset-2">{f.link_label}</span>}
                      </span>
                    ))
                  : f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
