'use client'

import { useEffect, useState, useTransition, type ReactNode } from 'react'
import { BilingualField } from '@/components/cms/BilingualField'
import type { LocalizedText } from '@/lib/cms/localized'
import type {
  CopyFieldGroup,
  UiArea,
  UiStringsContent,
} from '@/lib/cms/opus-pass-ui-strings'
import { useEditorActions } from '../EditorActionsContext'
import {
  discardUiStringsDraft,
  publishUiStrings,
  saveUiStringsDraft,
} from './actions'

type Props = {
  area: UiArea
  label: string
  groups: CopyFieldGroup[]
  initial: UiStringsContent
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

export default function UiStringsEditor({
  area,
  label,
  groups,
  initial,
  hasDraft: initialHasDraft,
}: Props) {
  const [draft, setDraft] = useState<UiStringsContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  // The layout stays mounted while switching areas — re-seed on area change.
  useEffect(() => {
    setDraft(initial)
    setHasDraft(initialHasDraft)
    setMessage(null)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area])

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
      await saveUiStringsDraft(area, draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveUiStringsDraft(area, draft)
      await publishUiStrings(area)
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discardUiStringsDraft(area)
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
      <h3 className="text-[15px] font-semibold text-gray-900">{label} — site UI text</h3>
      <p className="text-sm text-gray-500">
        Editable, bilingual labels shown in the public site {label.toLowerCase()} on every page.
        Leave a field blank to fall back to the built-in English default.
      </p>

      {groups.map((group) => (
        <FieldGroup key={group.legend} legend={group.legend}>
          {group.fields.map((field) => {
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
