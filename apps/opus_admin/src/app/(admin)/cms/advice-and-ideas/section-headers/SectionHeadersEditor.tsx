'use client'

import { useEffect, useState, useTransition } from 'react'
import type { AdviceSectionHeadersContent } from '@/lib/cms/advice-ideas'
import { useEditorActions } from '../EditorActionsContext'
import { Card, Field, FieldGroup, inputCls } from '../_ui'
import { discardAdvicePageDraft, publishAdvicePage, saveAdvicePageDraft } from '../page-actions'

type Props = { initial: AdviceSectionHeadersContent; hasDraft: boolean }

export default function SectionHeadersEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [draft, setDraft] = useState<AdviceSectionHeadersContent>(initial)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const patch = <K extends keyof AdviceSectionHeadersContent>(
    key: K,
    value: Partial<AdviceSectionHeadersContent[K]>
  ) => setDraft((d) => ({ ...d, [key]: { ...d[key], ...value } }))

  const handleSaveDraft = () =>
    startTransition(async () => {
      await saveAdvicePageDraft('section_headers', draft)
      setHasDraft(true)
      setMessage('Draft saved.')
    })
  const handlePublish = () =>
    startTransition(async () => {
      await saveAdvicePageDraft('section_headers', draft)
      await publishAdvicePage('section_headers')
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })
  const handleDiscard = () =>
    startTransition(async () => {
      await discardAdvicePageDraft('section_headers')
      setDraft(initial)
      setHasDraft(false)
      setMessage('Draft discarded.')
    })

  useEffect(() => {
    bind({
      hasDraft,
      pending,
      message,
      onSaveDraft: handleSaveDraft,
      onPublish: handlePublish,
      onDiscard: handleDiscard,
    })
    return () => unbind()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDraft, pending, message, draft])

  return (
    <div className="space-y-6">
      <Card title="Editor's Picks (top-of-page feature row)">
        <Field label="Title">
          <input
            type="text"
            value={draft.editor_picks.title}
            onChange={(e) => patch('editor_picks', { title: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Subtitle">
          <textarea
            value={draft.editor_picks.subtitle}
            onChange={(e) => patch('editor_picks', { subtitle: e.target.value })}
            rows={2}
            className={inputCls}
          />
        </Field>
        <FieldGroup label="“View all” link (desktop)">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Label">
              <input
                type="text"
                value={draft.editor_picks.view_all_label}
                onChange={(e) => patch('editor_picks', { view_all_label: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Link">
              <input
                type="text"
                value={draft.editor_picks.view_all_href}
                onChange={(e) => patch('editor_picks', { view_all_href: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
        </FieldGroup>
        <Field label="Mobile CTA label (shown below the picks on small screens)">
          <input
            type="text"
            value={draft.editor_picks.mobile_cta_label}
            onChange={(e) => patch('editor_picks', { mobile_cta_label: e.target.value })}
            className={inputCls}
          />
        </Field>
      </Card>

      <Card title="Popular Topics">
        <Field label="Title">
          <input
            type="text"
            value={draft.popular_topics.title}
            onChange={(e) => patch('popular_topics', { title: e.target.value })}
            className={inputCls}
          />
        </Field>
        <p className="text-xs text-gray-500">
          The cards below this title are managed in the Topics editor.
        </p>
      </Card>

      <Card title="Loved by Couples">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Title">
            <input
              type="text"
              value={draft.loved_by_couples.title}
              onChange={(e) => patch('loved_by_couples', { title: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Read CTA label (on featured card)">
            <input
              type="text"
              value={draft.loved_by_couples.cta_label}
              onChange={(e) => patch('loved_by_couples', { cta_label: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Subtitle">
          <textarea
            value={draft.loved_by_couples.subtitle}
            onChange={(e) => patch('loved_by_couples', { subtitle: e.target.value })}
            rows={2}
            className={inputCls}
          />
        </Field>
        <FieldGroup label="“View all” link">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Label">
              <input
                type="text"
                value={draft.loved_by_couples.view_all_label}
                onChange={(e) => patch('loved_by_couples', { view_all_label: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Link">
              <input
                type="text"
                value={draft.loved_by_couples.view_all_href}
                onChange={(e) => patch('loved_by_couples', { view_all_href: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
        </FieldGroup>
      </Card>

      <Card title="Our Favorites (cream accent block)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Title">
            <input
              type="text"
              value={draft.favorites.title}
              onChange={(e) => patch('favorites', { title: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Read CTA label (on featured card)">
            <input
              type="text"
              value={draft.favorites.cta_label}
              onChange={(e) => patch('favorites', { cta_label: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Subtitle">
          <textarea
            value={draft.favorites.subtitle}
            onChange={(e) => patch('favorites', { subtitle: e.target.value })}
            rows={2}
            className={inputCls}
          />
        </Field>
        <FieldGroup label="“View all” link">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Label">
              <input
                type="text"
                value={draft.favorites.view_all_label}
                onChange={(e) => patch('favorites', { view_all_label: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Link">
              <input
                type="text"
                value={draft.favorites.view_all_href}
                onChange={(e) => patch('favorites', { view_all_href: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
        </FieldGroup>
      </Card>

      <Card title="Latest Stories">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3">
          <Field label="Anchor id">
            <input
              type="text"
              value={draft.latest_stories.id}
              onChange={(e) => patch('latest_stories', { id: e.target.value })}
              className={inputCls}
              placeholder="latest-stories"
            />
          </Field>
          <Field label="Title">
            <input
              type="text"
              value={draft.latest_stories.title}
              onChange={(e) => patch('latest_stories', { title: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Subtitle">
          <textarea
            value={draft.latest_stories.subtitle}
            onChange={(e) => patch('latest_stories', { subtitle: e.target.value })}
            rows={2}
            className={inputCls}
          />
        </Field>
      </Card>

      <Card title="Search results (/advice-and-ideas?q=…)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Eyebrow">
            <input
              type="text"
              value={draft.search.eyebrow}
              onChange={(e) => patch('search', { eyebrow: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Clear link label">
            <input
              type="text"
              value={draft.search.clear_label}
              onChange={(e) => patch('search', { clear_label: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label='No-results headline — use {query} to inject the typed query'>
          <input
            type="text"
            value={draft.search.no_results_headline}
            onChange={(e) => patch('search', { no_results_headline: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="No-results body">
          <textarea
            value={draft.search.no_results_body}
            onChange={(e) => patch('search', { no_results_body: e.target.value })}
            rows={2}
            className={inputCls}
          />
        </Field>
        <Field label="“Back to the hub” button label">
          <input
            type="text"
            value={draft.search.back_label}
            onChange={(e) => patch('search', { back_label: e.target.value })}
            className={inputCls}
          />
        </Field>
      </Card>
    </div>
  )
}
