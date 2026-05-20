'use client'

import { useEffect, useState, useTransition } from 'react'
import { Plus, Star } from 'lucide-react'
import { resolveOpusPassAssetUrl } from '@/lib/cms/opus-pass-asset-url'
import {
  OPUS_PASS_WEBSITES_TESTIMONIAL_VARIANTS,
  type OpusPassWebsitesTestimonialItem,
  type OpusPassWebsitesTestimonialsContent,
} from '@/lib/cms/opus-pass-websites-testimonials'
import { CollapsibleCard } from '@/components/cms/CollapsibleCard'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import { useEditorActions } from '../EditorActionsContext'
import {
  discardOpusPassWebsitesTestimonialsDraft,
  publishOpusPassWebsitesTestimonials,
  saveOpusPassWebsitesTestimonialsDraft,
} from './actions'

type Props = {
  initial: OpusPassWebsitesTestimonialsContent
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
  return `tst-${Math.random().toString(36).slice(2, 9)}`
}

export default function TestimonialsEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassWebsitesTestimonialsContent>(initial)
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

  const setField = <K extends keyof OpusPassWebsitesTestimonialsContent>(
    key: K,
    value: OpusPassWebsitesTestimonialsContent[K],
  ) => setDraft((d) => ({ ...d, [key]: value }))

  const setItem = (idx: number, patch: Partial<OpusPassWebsitesTestimonialItem>) =>
    setDraft((d) => ({
      ...d,
      items: d.items.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }))

  const addItem = () =>
    setDraft((d) => ({
      ...d,
      items: [
        ...d.items,
        {
          id: randomId(),
          rating: 5,
          quote: '',
          name: '',
          location: '',
          avatar: '',
          role: 'Couple',
          variant: 'dark',
        },
      ],
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
      await saveOpusPassWebsitesTestimonialsDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassWebsitesTestimonialsDraft(draft)
      await publishOpusPassWebsitesTestimonials()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassWebsitesTestimonialsDraft()
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
        <h3 className="text-[15px] font-semibold text-gray-900">Testimonials</h3>

        <FieldGroup label="Section header">
          <Field label="Heading">
            <input
              type="text"
              value={draft.heading}
              onChange={(e) => setField('heading', e.target.value)}
              placeholder="What they say about us"
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 px-1">
            Testimonial cards ({draft.items.length})
          </p>
          {draft.items.map((item, idx) => (
            <CollapsibleCard
              key={item.id}
              index={idx}
              title={item.name || 'New testimonial'}
              collapsed={!expanded.has(idx)}
              onToggle={() => toggleExpanded(idx)}
              onMoveUp={() => moveItem(idx, -1)}
              onMoveDown={() => moveItem(idx, 1)}
              onRemove={() => removeItem(idx)}
              disableMoveUp={idx === 0}
              disableMoveDown={idx === draft.items.length - 1}
            >
              <div className="grid grid-cols-2 gap-3">
                <Field label="Variant">
                  <select
                    value={item.variant}
                    onChange={(e) =>
                      setItem(idx, {
                        variant: e.target.value as OpusPassWebsitesTestimonialItem['variant'],
                      })
                    }
                    className={inputCls}
                  >
                    {OPUS_PASS_WEBSITES_TESTIMONIAL_VARIANTS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Rating (1–5)">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={item.rating}
                    onChange={(e) =>
                      setItem(idx, { rating: Math.max(1, Math.min(5, Number(e.target.value) || 5)) })
                    }
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Quote">
                <textarea
                  rows={4}
                  value={item.quote}
                  onChange={(e) => setItem(idx, { quote: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Couple name">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => setItem(idx, { name: e.target.value })}
                    placeholder="Neema & Amani"
                    className={inputCls}
                  />
                </Field>
                <Field label="Location">
                  <input
                    type="text"
                    value={item.location}
                    onChange={(e) => setItem(idx, { location: e.target.value })}
                    placeholder="Bagamoyo"
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Role pill (e.g., Couple, Newlyweds)">
                <input
                  type="text"
                  value={item.role}
                  onChange={(e) => setItem(idx, { role: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <ImageUploadField
                label="Avatar photo"
                value={item.avatar}
                onChange={(v) => setItem(idx, { avatar: v })}
                pathPrefix="opus-pass/websites/testimonials"
                previewAspect="aspect-square"
                previewWidth="max-w-[120px]"
              />
            </CollapsibleCard>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 text-sm font-medium text-[#7E5896] hover:text-[#5d3a78] px-3 py-2 rounded-lg border border-dashed border-[#C9A0DC] hover:bg-[#F0DFF6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add testimonial
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Live preview</h3>
          <span className="text-xs text-gray-400">Approximate</span>
        </div>
        <TestimonialsPreview content={draft} />
      </div>
    </div>
  )
}

function TestimonialsPreview({
  content,
}: {
  content: OpusPassWebsitesTestimonialsContent
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold uppercase tracking-tight leading-[0.95] text-[#1A1A1A] mb-4">
        {content.heading || 'Section heading'}
      </h2>
      <div className="flex gap-2 overflow-x-hidden">
        {content.items.slice(0, 3).map((t) => {
          const isDark = t.variant === 'dark'
          return (
            <div
              key={t.id}
              className={
                isDark
                  ? 'shrink-0 w-[160px] rounded-xl p-3 flex flex-col bg-[#1A1A1A] text-white'
                  : 'shrink-0 w-[160px] rounded-xl p-3 flex flex-col bg-[#C9A0DC] text-[#1A1A1A]'
              }
            >
              <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={10}
                    className={i < t.rating ? 'fill-current' : 'fill-transparent'}
                    strokeWidth={i < t.rating ? 0 : 1.5}
                  />
                ))}
              </div>
              <p className="text-[9px] font-semibold leading-snug line-clamp-4 flex-1">
                &ldquo;{t.quote || 'Quote'}&rdquo;
              </p>
              <div
                className={
                  isDark
                    ? 'mt-2 h-px bg-white/15'
                    : 'mt-2 h-px bg-black/15'
                }
              />
              <div className="mt-2 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-300 shrink-0">
                  {t.avatar && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={resolveOpusPassAssetUrl(t.avatar)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-bold leading-tight truncate">
                    {t.name || 'Name'}
                  </p>
                  <p
                    className={
                      isDark
                        ? 'text-[7px] text-white/55 truncate'
                        : 'text-[7px] text-[#1A1A1A]/60 truncate'
                    }
                  >
                    {t.location}
                  </p>
                </div>
                <span
                  className={
                    isDark
                      ? 'shrink-0 rounded-full bg-[#C9A0DC] text-[#1A1A1A] px-1.5 py-[2px] text-[7px] font-bold'
                      : 'shrink-0 rounded-full bg-white text-[#1A1A1A] px-1.5 py-[2px] text-[7px] font-bold'
                  }
                >
                  {t.role}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
