'use client'

import { useEffect, useState, useTransition, type ReactNode } from 'react'
import { BilingualField } from '@/components/cms/BilingualField'
import type { LocalizedText } from '@/lib/cms/localized'
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

  const set = (key: string, value: LocalizedText) => setDraft((d) => ({ ...d, [key]: value }))

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
            // 'list' fields hold one item per line (e.g. the "What you get"
            // features), so they render as a multiline bilingual field too.
            const multiline = field.kind === 'textarea' || field.kind === 'list'
            return (
              <div key={field.key} className="space-y-1">
                <BilingualField
                  label={field.label}
                  value={draft[field.key]}
                  onChange={(v) => set(field.key, v)}
                  multiline={multiline}
                  rows={field.kind === 'list' ? 4 : 3}
                  max={field.max}
                />
                {field.hint && <p className="text-[11px] text-gray-400">{field.hint}</p>}
              </div>
            )
          })}
        </FieldGroup>
      ))}
    </div>
  )
}
