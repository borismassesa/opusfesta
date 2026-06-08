'use client'

import { useEffect, useState, useTransition, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type {
  CopyFieldGroup,
  DashboardCopyContent,
  DashboardCopySlug,
} from '@/lib/cms/opus-pass-dashboard-copy'
import { useEditorActions } from '../../EditorActionsContext'
import {
  discardDashboardCopyDraft,
  publishDashboardCopy,
  saveDashboardCopyDraft,
} from './actions'

type Props = {
  slug: DashboardCopySlug
  label: string
  groups: CopyFieldGroup[]
  initial: DashboardCopyContent
  hasDraft: boolean
}

const inputCls =
  'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A0DC] focus:border-transparent transition-all'

function CharCount({ value, max }: { value: string; max: number }) {
  const len = (value ?? '').length
  const over = len > max
  const near = !over && len > max * 0.85
  return (
    <span
      className={cn(
        'tabular-nums font-medium',
        over ? 'text-red-500' : near ? 'text-amber-600' : 'text-gray-400',
      )}
    >
      {len}/{max}
    </span>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: ReactNode
  children: ReactNode
}) {
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

function FieldGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="border border-gray-200 rounded-lg p-3 pt-2 space-y-3">
      <legend className="px-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {legend}
      </legend>
      {children}
    </fieldset>
  )
}

export default function CopyEditor({
  slug,
  label,
  groups,
  initial,
  hasDraft: initialHasDraft,
}: Props) {
  const [draft, setDraft] = useState<DashboardCopyContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  // The layout stays mounted while switching dashboard pages — re-seed on slug change.
  useEffect(() => {
    setDraft(initial)
    setHasDraft(initialHasDraft)
    setMessage(null)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const set = (key: string, value: string) => setDraft((d) => ({ ...d, [key]: value }))

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
      await saveDashboardCopyDraft(slug, draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveDashboardCopyDraft(slug, draft)
      await publishDashboardCopy(slug)
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardDashboardCopyDraft(slug)
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
    <div className="max-w-2xl space-y-5 pb-12">
      <h3 className="text-[15px] font-semibold text-gray-900">{label} — page copy</h3>
      <p className="text-sm text-gray-500">
        Editable text shown on the live page beyond the hero banner — empty states, buttons,
        section headings and callouts. Leave a field blank to fall back to the built-in default.
      </p>

      {groups.map((group) => (
        <FieldGroup key={group.legend} legend={group.legend}>
          {group.fields.map((field) => {
            const value = draft[field.key] ?? ''
            if (field.kind === 'list') {
              const lineCount = value ? value.split('\n').length : 0
              return (
                <Field
                  key={field.key}
                  label={field.label}
                  hint={field.hint ?? `${lineCount} item${lineCount === 1 ? '' : 's'}`}
                >
                  <textarea
                    rows={4}
                    value={value}
                    onChange={(e) => set(field.key, e.target.value)}
                    className={inputCls}
                  />
                </Field>
              )
            }
            const hint = field.max ? (
              <span className="flex items-center gap-2">
                {field.hint && <span>{field.hint}</span>}
                <CharCount value={value} max={field.max} />
              </span>
            ) : (
              field.hint
            )
            return (
              <Field key={field.key} label={field.label} hint={hint}>
                {field.kind === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={value}
                    onChange={(e) => set(field.key, e.target.value)}
                    className={inputCls}
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => set(field.key, e.target.value)}
                    className={inputCls}
                  />
                )}
              </Field>
            )
          })}
        </FieldGroup>
      ))}
    </div>
  )
}
