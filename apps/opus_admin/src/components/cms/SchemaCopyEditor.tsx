'use client'

import { useEffect, useState, useTransition, type ReactNode } from 'react'
import { BilingualField } from '@/components/cms/BilingualField'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import type { MaybeLocalized } from '@/lib/cms/localized'
import type { CopyFieldGroup } from '@/lib/cms/opus-pass-dashboard-copy'

// Generic, schema-driven bilingual copy editor. Extracted from the Site UI
// UiStringsEditor so every CMS group (Site UI shared chrome + each product's
// navbar mega-menu) can reuse the exact same draft/save/publish/discard UX.
//
// It deliberately does NOT import any EditorActionsContext or server actions —
// those are passed in (bind/unbind + the three async jobs) so the component is
// portable across the different per-group EditorActionsProviders.

type Draft = Record<string, MaybeLocalized>

type Props = {
  title?: string
  description?: string
  groups: CopyFieldGroup[]
  initial: Draft
  hasDraft: boolean
  // From the host group's EditorActionsContext.
  bind: (b: {
    hasDraft: boolean
    pending: boolean
    message: string | null
    error?: string | null
    onSaveDraft: () => void
    onPublish: () => void
    onDiscard: () => void
  }) => void
  unbind: () => void
  // Server actions supplied by the host route.
  saveDraft: (draft: Draft) => Promise<void>
  publish: () => Promise<void>
  discard: () => Promise<void>
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

export default function SchemaCopyEditor({
  title,
  description,
  groups,
  initial,
  hasDraft: initialHasDraft,
  bind,
  unbind,
  saveDraft,
  publish,
  discard,
}: Props) {
  const [draft, setDraft] = useState<Draft>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const set = (key: string, value: MaybeLocalized) => setDraft((d) => ({ ...d, [key]: value }))

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
      await saveDraft(draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })

  const handlePublish = () =>
    runAction(async () => {
      await saveDraft(draft)
      await publish()
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })

  const handleDiscard = () =>
    runAction(async () => {
      await discard()
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
      {title && <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>}
      {description && <p className="text-sm text-gray-500">{description}</p>}

      {groups.map((group) => (
        <FieldGroup key={group.legend} legend={group.legend}>
          {group.fields.map((field) => {
            if (field.kind === 'image') {
              const raw = draft[field.key]
              const value = typeof raw === 'string' ? raw : ''
              return (
                <div key={field.key} className="space-y-1">
                  <ImageUploadField
                    label={field.label}
                    value={value}
                    onChange={(v) => set(field.key, v)}
                    pathPrefix={field.pathPrefix ?? 'opus-pass/cms'}
                    previewAspect="aspect-[4/3]"
                  />
                  {field.hint && <p className="text-[11px] text-gray-400">{field.hint}</p>}
                </div>
              )
            }
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
