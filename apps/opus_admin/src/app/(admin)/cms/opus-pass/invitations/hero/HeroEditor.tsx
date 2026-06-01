'use client'

import { useEffect, useState, useTransition } from 'react'
import { ArrowRight, ChevronsDownUp, ChevronsUpDown, Plus } from 'lucide-react'
import type {
  OpusPassInvitationsHeroContent,
  OpusPassInvitationsHeroSuiteCategory,
} from '@/lib/cms/opus-pass-invitations-hero'
import { cn } from '@/lib/utils'
import { CollapsibleCard } from '@/components/cms/CollapsibleCard'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import { resolveOpusPassAssetUrl } from '@/lib/cms/opus-pass-asset-url'
import { useEditorActions } from '../EditorActionsContext'
import {
  discardOpusPassInvitationsHeroDraft,
  publishOpusPassInvitationsHero,
  saveOpusPassInvitationsHeroDraft,
} from './actions'

type Props = {
  initial: OpusPassInvitationsHeroContent
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

function randomCategoryId(): string {
  return `cat-${Math.random().toString(36).slice(2, 9)}`
}

export default function HeroEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<OpusPassInvitationsHeroContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  // Per-category expand state (first one open by default).
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([0]))
  const toggle = (idx: number) =>
    setExpanded((s) => {
      const next = new Set(s)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  const expandAll = () => setExpanded(new Set(draft.suite_categories.map((_, i) => i)))
  const collapseAll = () => setExpanded(new Set())

  const set = <K extends keyof OpusPassInvitationsHeroContent>(
    key: K,
    value: OpusPassInvitationsHeroContent[K],
  ) => setDraft((d) => ({ ...d, [key]: value }))

  const setCategory = (idx: number, patch: Partial<OpusPassInvitationsHeroSuiteCategory>) =>
    setDraft((d) => ({
      ...d,
      suite_categories: d.suite_categories.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }))

  const addCategory = () =>
    setDraft((d) => ({
      ...d,
      suite_categories: [
        ...d.suite_categories,
        { id: randomCategoryId(), label: '', alt: '', image: '' },
      ],
    }))

  const removeCategory = (idx: number) =>
    setDraft((d) => ({ ...d, suite_categories: d.suite_categories.filter((_, i) => i !== idx) }))

  const moveCategory = (idx: number, delta: number) =>
    setDraft((d) => {
      const next = [...d.suite_categories]
      const target = idx + delta
      if (target < 0 || target >= next.length) return d
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return { ...d, suite_categories: next }
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
      await saveOpusPassInvitationsHeroDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveOpusPassInvitationsHeroDraft(draft)
      await publishOpusPassInvitationsHero()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardOpusPassInvitationsHeroDraft()
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
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">Animated hero</h3>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
            The invitation cards swirl into a ring, then hand off to the suite strip below. You can
            edit the lead headline, both buttons, and the &ldquo;every moment&rdquo; strip — the
            animation itself stays fixed.
          </p>
        </div>

        <FieldGroup label="Intro overlay">
          <Field label="Headline" hint={<CharCount value={draft.intro_headline} max={60} />}>
            <input
              type="text"
              value={draft.intro_headline}
              onChange={(e) => set('intro_headline', e.target.value)}
              placeholder="Invitations for every celebration."
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label="Primary CTA (filled button)">
          <Field label="Label" hint={<CharCount value={draft.primary_cta_label} max={30} />}>
            <input
              type="text"
              value={draft.primary_cta_label}
              onChange={(e) => set('primary_cta_label', e.target.value)}
              placeholder="Browse designs"
              className={inputCls}
            />
          </Field>
          <Field label="Destination URL">
            <input
              type="text"
              value={draft.primary_cta_href}
              onChange={(e) => set('primary_cta_href', e.target.value)}
              placeholder="/invitations/catalog"
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label="Secondary CTA (outline button)">
          <Field label="Label" hint={<CharCount value={draft.secondary_cta_label} max={30} />}>
            <input
              type="text"
              value={draft.secondary_cta_label}
              onChange={(e) => set('secondary_cta_label', e.target.value)}
              placeholder="Get started free"
              className={inputCls}
            />
          </Field>
          <Field label="Destination URL">
            <input
              type="text"
              value={draft.secondary_cta_href}
              onChange={(e) => set('secondary_cta_href', e.target.value)}
              placeholder="/sign-up"
              className={inputCls}
            />
          </Field>
        </FieldGroup>

        <FieldGroup label="Suite strip">
          <Field label="Heading" hint={<CharCount value={draft.suite_heading} max={60} />}>
            <input
              type="text"
              value={draft.suite_heading}
              onChange={(e) => set('suite_heading', e.target.value)}
              placeholder="Invitations for Every Moment"
              className={inputCls}
            />
          </Field>
          <Field label="Body" hint={<CharCount value={draft.suite_body} max={260} />}>
            <textarea
              rows={3}
              value={draft.suite_body}
              onChange={(e) => set('suite_body', e.target.value)}
              placeholder="Pick one design once, and every card across your day matches your suite…"
              className={inputCls}
            />
          </Field>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-gray-600">
              Moments ({draft.suite_categories.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={expandAll}
                className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 px-2 py-1 rounded-md hover:bg-gray-50"
              >
                <ChevronsUpDown className="w-3.5 h-3.5" /> Expand
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 px-2 py-1 rounded-md hover:bg-gray-50"
              >
                <ChevronsDownUp className="w-3.5 h-3.5" /> Collapse
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {draft.suite_categories.map((cat, idx) => (
              <CollapsibleCard
                key={cat.id}
                index={idx}
                title={cat.label || 'New moment'}
                collapsed={!expanded.has(idx)}
                onToggle={() => toggle(idx)}
                onMoveUp={() => moveCategory(idx, -1)}
                onMoveDown={() => moveCategory(idx, 1)}
                onRemove={() => removeCategory(idx)}
                disableMoveUp={idx === 0}
                disableMoveDown={idx === draft.suite_categories.length - 1}
              >
                <Field label="Label" hint={<CharCount value={cat.label} max={40} />}>
                  <input
                    type="text"
                    value={cat.label}
                    onChange={(e) => setCategory(idx, { label: e.target.value })}
                    placeholder="Save the Date"
                    className={inputCls}
                  />
                </Field>
                <ImageUploadField
                  label="Photo"
                  value={cat.image}
                  onChange={(v) => setCategory(idx, { image: v })}
                  pathPrefix="opus-pass/invitations/hero"
                  previewAspect="aspect-square"
                  previewWidth="max-w-[160px]"
                />
                <Field label="Alt text (for screen readers)">
                  <input
                    type="text"
                    value={cat.alt}
                    onChange={(e) => setCategory(idx, { alt: e.target.value })}
                    placeholder="Save the Date"
                    className={inputCls}
                  />
                </Field>
              </CollapsibleCard>
            ))}
          </div>

          <button
            type="button"
            onClick={addCategory}
            className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm font-medium text-gray-500 hover:border-[#C9A0DC] hover:text-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add moment
          </button>
        </FieldGroup>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:sticky xl:top-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Live preview</h3>
          <span className="text-xs text-gray-400">Approximate · animation not shown</span>
        </div>
        <HeroPreview content={draft} />
      </div>
    </div>
  )
}

function HeroPreview({ content }: { content: OpusPassInvitationsHeroContent }) {
  return (
    <div className="space-y-6">
      {/* Intro overlay */}
      <div className="relative overflow-hidden rounded-md bg-white border border-gray-100 px-5 py-8 text-center">
        <h1 className="text-base sm:text-lg font-semibold tracking-tight text-gray-800">
          {content.intro_headline || 'Headline'}
        </h1>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#1A1A1A] px-4 py-1.5 text-[10px] font-bold text-white">
            {content.primary_cta_label || 'Primary CTA'}
          </span>
          <span className="inline-flex items-center rounded-full border border-[#1A1A1A]/20 bg-white px-4 py-1.5 text-[10px] font-bold text-[#1A1A1A]">
            {content.secondary_cta_label || 'Secondary CTA'}
          </span>
        </div>
      </div>

      {/* Suite strip */}
      <div className="rounded-md bg-white border border-gray-100 px-4 py-6">
        <div className="text-center mb-5">
          <h2 className="font-serif text-base font-medium text-gray-900">
            {content.suite_heading || 'Suite heading'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[11px] leading-relaxed text-gray-600 line-clamp-3">
            {content.suite_body}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {content.suite_categories.map((cat) => (
            <div key={cat.id} className="flex w-[72px] flex-col items-center text-center">
              <div className="relative mb-1.5 aspect-square w-full overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
                {cat.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveOpusPassAssetUrl(cat.image)}
                    alt={cat.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-medium leading-tight text-gray-800">
                {cat.label || 'Moment'}
                <ArrowRight size={10} className="shrink-0" aria-hidden="true" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
