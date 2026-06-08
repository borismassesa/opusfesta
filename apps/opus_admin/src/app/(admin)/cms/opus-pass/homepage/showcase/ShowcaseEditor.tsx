'use client'

import { useEffect, useState, useTransition } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2, AlertTriangle } from 'lucide-react'
import type {
  OpusPassHomepageShowcaseContent,
  OpusPassHomepageShowcaseImage,
  OpusPassHomepageShowcasePill,
  OpusPassHomepageShowcasePillKind,
} from '@/lib/cms/opus-pass-homepage-showcase'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import { resolveOpusPassAssetUrl } from '@/lib/cms/opus-pass-asset-url'
import { cn } from '@/lib/utils'
import { useEditorActions } from '../EditorActionsContext'

// The homepage masonry has exactly these 7 fixed slots; content.images map to
// them by index. Extra photos are ignored; missing ones leave a gap.
const SLOT_LABELS = [
  'Column 1 · tall portrait',
  'Column 2 · top',
  'Column 2 · bottom',
  'Column 3 · main, above caption',
  'Column 4 · top',
  'Column 4 · bottom',
  'Column 5',
]
const SLOT_COUNT = SLOT_LABELS.length

const PILL_KINDS: { value: OpusPassHomepageShowcasePillKind; label: string }[] = [
  { value: 'visit', label: 'Visit (rounded label + arrow)' },
  { value: 'stat', label: 'Stat (title + chart line)' },
  { value: 'toggle', label: 'Toggle (label + switch)' },
]

function randomId(): string {
  return `pill-${Math.random().toString(36).slice(2, 9)}`
}
import {
  discardOpusPassHomepageShowcaseDraft,
  publishOpusPassHomepageShowcase,
  saveOpusPassHomepageShowcaseDraft,
} from './actions'

type Props = {
  initial: OpusPassHomepageShowcaseContent
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

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="border border-gray-200 rounded-lg p-3 pt-2 space-y-3">
      <legend className="px-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</legend>
      {children}
    </fieldset>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#9FE870'}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#9FE870"
          className={cn(inputCls, 'font-mono')}
        />
      </div>
    </Field>
  )
}

export default function ShowcaseEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassHomepageShowcaseContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const setCaption = (patch: Partial<OpusPassHomepageShowcaseContent['caption']>) =>
    setDraft((d) => ({ ...d, caption: { ...d.caption, ...patch } }))

  const setPill = (idx: number, patch: Partial<OpusPassHomepageShowcasePill>) =>
    setDraft((d) => ({ ...d, pills: d.pills.map((p, i) => (i === idx ? { ...p, ...patch } : p)) }))
  const addPill = () =>
    setDraft((d) => ({
      ...d,
      pills: [
        ...d.pills,
        { id: randomId(), kind: 'visit', slot: 0, color: '#FFFFFF', side: 'left', label: 'Visit', sublabel: '' },
      ],
    }))
  const removePill = (idx: number) =>
    setDraft((d) => ({ ...d, pills: d.pills.filter((_, i) => i !== idx) }))
  const movePill = (idx: number, delta: number) =>
    setDraft((d) => {
      const next = [...d.pills]
      const target = idx + delta
      if (target < 0 || target >= next.length) return d
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return { ...d, pills: next }
    })

  const setAccent = (value: string) => setDraft((d) => ({ ...d, accent_color: value }))

  const setImage = (idx: number, patch: Partial<OpusPassHomepageShowcaseImage>) =>
    setDraft((d) => ({
      ...d,
      images: d.images.map((img, i) => (i === idx ? { ...img, ...patch } : img)),
    }))
  const addImage = () =>
    setDraft((d) => ({ ...d, images: [...d.images, { src: '', alt: '' }] }))
  const removeImage = (idx: number) =>
    setDraft((d) => ({ ...d, images: d.images.filter((_, i) => i !== idx) }))
  const moveImage = (idx: number, delta: number) =>
    setDraft((d) => {
      const next = [...d.images]
      const target = idx + delta
      if (target < 0 || target >= next.length) return d
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return { ...d, images: next }
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
      await saveOpusPassHomepageShowcaseDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassHomepageShowcaseDraft(draft)
      await publishOpusPassHomepageShowcase()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassHomepageShowcaseDraft()
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
        <h3 className="text-[15px] font-semibold text-gray-900">Photo showcase content</h3>
        <p className="text-xs text-gray-500 -mt-3">
          The masonry layout has {SLOT_COUNT} numbered photo slots (shown on the right). Reorder the
          photos to change which lands where, and point each pill at the photo it should sit on.
        </p>

        <FieldGroup label="Caption card">
          <Field label="Title" hint={<CharCount value={draft.caption.title} max={48} />}>
            <input
              type="text"
              value={draft.caption.title}
              onChange={(e) => setCaption({ title: e.target.value })}
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="“By” line" hint={<CharCount value={draft.caption.by} max={20} />}>
              <input
                type="text"
                value={draft.caption.by}
                onChange={(e) => setCaption({ by: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Brand" hint={<CharCount value={draft.caption.brand} max={20} />}>
              <input
                type="text"
                value={draft.caption.brand}
                onChange={(e) => setCaption({ brand: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Badge initials (the coloured circle)" hint={<CharCount value={draft.caption.badge} max={3} />}>
            <input
              type="text"
              value={draft.caption.badge}
              onChange={(e) => setCaption({ badge: e.target.value })}
              placeholder="O."
              className={cn(inputCls, 'max-w-[120px]')}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label={`Floating pills (${draft.pills.length})`}>
          <p className="text-[11px] text-gray-500 -mt-1">
            The small labels that pop over the photos. Each pill picks its own colour and which photo
            it sits on; the pop-in animation is automatic.
          </p>
          {draft.pills.map((pill, idx) => (
            <div key={pill.id} className="relative space-y-3 rounded-lg border border-gray-200 p-3">
              <div className="absolute top-2 right-2 flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => movePill(idx, -1)}
                  disabled={idx === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors"
                  aria-label="Move pill up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => movePill(idx, 1)}
                  disabled={idx === draft.pills.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors"
                  aria-label="Move pill down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removePill(idx)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                  aria-label="Remove pill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7E5896] pr-24">
                Pill {idx + 1}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                  <select
                    value={pill.kind}
                    onChange={(e) =>
                      setPill(idx, { kind: e.target.value as OpusPassHomepageShowcasePillKind })
                    }
                    className={inputCls}
                  >
                    {PILL_KINDS.map((k) => (
                      <option key={k.value} value={k.value}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Attach to photo">
                  <select
                    value={pill.slot}
                    onChange={(e) => setPill(idx, { slot: Number(e.target.value) })}
                    className={inputCls}
                  >
                    {SLOT_LABELS.map((lbl, i) => (
                      <option key={i} value={i}>
                        Photo {i + 1} — {lbl}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field
                label={pill.kind === 'stat' ? 'Title' : 'Label'}
                hint={<CharCount value={pill.label} max={20} />}
              >
                <input
                  type="text"
                  value={pill.label}
                  onChange={(e) => setPill(idx, { label: e.target.value })}
                  className={inputCls}
                />
              </Field>
              {pill.kind === 'stat' && (
                <Field label="Label under the chart" hint={<CharCount value={pill.sublabel} max={14} />}>
                  <input
                    type="text"
                    value={pill.sublabel}
                    onChange={(e) => setPill(idx, { sublabel: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              )}
              <div className="grid grid-cols-2 gap-3">
                <ColorField
                  label={pill.kind === 'visit' ? 'Background colour' : 'Accent colour'}
                  value={pill.color}
                  onChange={(v) => setPill(idx, { color: v })}
                />
                {pill.kind === 'visit' && (
                  <Field label="Side of photo">
                    <select
                      value={pill.side}
                      onChange={(e) => setPill(idx, { side: e.target.value as 'left' | 'right' })}
                      className={inputCls}
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </Field>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addPill}
            className="flex items-center gap-2 text-sm font-medium text-[#7E5896] hover:text-[#5d3a78] px-3 py-2 rounded-lg border border-dashed border-[#C9A0DC] hover:bg-[#F0DFF6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add pill
          </button>
        </FieldGroup>

        <FieldGroup label="Caption badge">
          <ColorField label="Badge circle colour" value={draft.accent_color} onChange={setAccent} />
        </FieldGroup>

        {draft.images.length !== SLOT_COUNT && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              The homepage masonry has {SLOT_COUNT} fixed photo slots. You have {draft.images.length}.{' '}
              {draft.images.length > SLOT_COUNT
                ? `Photos ${SLOT_COUNT + 1}+ won’t appear.`
                : `Slots ${draft.images.length + 1}–${SLOT_COUNT} will be empty.`}
            </span>
          </div>
        )}

        <FieldGroup label={`Photos (${draft.images.length} / ${SLOT_COUNT} slots)`}>
          {draft.images.map((image, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 p-3 space-y-2 relative">
              <div className="absolute top-2 right-2 flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => moveImage(idx, -1)}
                  disabled={idx === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors"
                  aria-label="Move photo up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(idx, 1)}
                  disabled={idx === draft.images.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors"
                  aria-label="Move photo down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                  aria-label="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {idx < SLOT_COUNT && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7E5896] pr-24">
                  Slot {idx + 1}: {SLOT_LABELS[idx]}
                </p>
              )}
              <ImageUploadField
                label={`Photo ${idx + 1}`}
                value={image.src}
                onChange={(next) => setImage(idx, { src: next })}
                pathPrefix="opus-pass/homepage/showcase"
                previewAspect="aspect-[3/4]"
                previewWidth="max-w-[140px]"
              />
              <Field label="Alt text" hint={<CharCount value={image.alt} max={120} />}>
                <input
                  type="text"
                  value={image.alt}
                  onChange={(e) => setImage(idx, { alt: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>
          ))}
          <button
            type="button"
            onClick={addImage}
            className="flex items-center gap-2 text-sm font-medium text-[#7E5896] hover:text-[#5d3a78] px-3 py-2 rounded-lg border border-dashed border-[#C9A0DC] hover:bg-[#F0DFF6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add photo
          </button>
        </FieldGroup>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Live preview</h3>
          <span className="text-xs text-gray-400">Approximate</span>
        </div>

        <div className="mb-5 grid grid-cols-4 gap-1.5">
          {Array.from({ length: SLOT_COUNT }).map((_, i) => {
            const img = draft.images[i]
            return (
              <div
                key={i}
                className={cn(
                  'relative overflow-hidden rounded-md bg-gray-100',
                  i === 3 ? 'aspect-[2/3] row-span-2' : 'aspect-[3/4]',
                )}
              >
                {img?.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveOpusPassAssetUrl(img.src)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] text-gray-400">
                    Slot {i + 1}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-1.5">
          {draft.pills.length === 0 && (
            <span className="text-[11px] text-gray-400">No pills — add one on the left.</span>
          )}
          {draft.pills.map((pill) => (
            <span
              key={pill.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#1A1A1A] shadow ring-1 ring-black/5"
              title={`On photo ${pill.slot + 1}`}
            >
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: pill.color }}
              />
              {pill.kind === 'visit' && <>↗ {pill.label || 'Visit'}</>}
              {pill.kind === 'stat' && (
                <>
                  {pill.label || 'Performance'} ·{' '}
                  <span className="text-[#1A1A1A]/55">{pill.sublabel || 'Sales'}</span>
                </>
              )}
              {pill.kind === 'toggle' && <>{pill.label || 'Live RSVPs'}</>}
              <span className="text-[#1A1A1A]/40">· P{pill.slot + 1}</span>
            </span>
          ))}
        </div>

        <div className="px-1">
          <h3 className="text-lg font-bold leading-tight tracking-tight text-[#1A1A1A]">
            {draft.caption.title || 'Caption title'}
          </h3>
          <div className="mt-3 flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-[#1A1A1A]"
              style={{ backgroundColor: draft.accent_color }}
            >
              {draft.caption.badge || 'O.'}
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-[#1A1A1A]">{draft.caption.by}</span>
              <span className="block text-sm text-[#1A1A1A]/65">{draft.caption.brand}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
