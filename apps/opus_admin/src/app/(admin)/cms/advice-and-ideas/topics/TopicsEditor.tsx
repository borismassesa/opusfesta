'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from 'lucide-react'
import {
  ADVICE_IDEAS_SECTION_IDS,
  type AdviceIdeasSectionId,
  type AdviceTopicItem,
  type AdviceTopicsContent,
} from '@/lib/cms/advice-ideas'
import { useEditorActions } from '../EditorActionsContext'
import { Card, Field, inputCls } from '../_ui'
import { resolveMediaUrl } from '../_media'
import { discardAdvicePageDraft, publishAdvicePage, saveAdvicePageDraft } from '../page-actions'
import { uploadAdviceMedia } from '../posts/actions'

type Props = { initial: AdviceTopicsContent; hasDraft: boolean }

export default function TopicsEditor({ initial, hasDraft: initialHasDraft }: Props) {
  const [items, setItems] = useState<AdviceTopicItem[]>(initial.items)
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const { bind, unbind } = useEditorActions()

  const update = (idx: number, patch: Partial<AdviceTopicItem>) =>
    setItems((list) => list.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  const remove = (idx: number) => setItems((list) => list.filter((_, i) => i !== idx))
  const move = (idx: number, dir: -1 | 1) => {
    const t = idx + dir
    if (t < 0 || t >= items.length) return
    const next = [...items]
    ;[next[idx], next[t]] = [next[t], next[idx]]
    setItems(next)
  }
  const add = () => {
    const unused = ADVICE_IDEAS_SECTION_IDS.find((id) => !items.some((it) => it.id === id))
    setItems((list) => [
      ...list,
      {
        id: (unused ?? 'planning-guides') as AdviceIdeasSectionId,
        label: 'New topic',
        description: 'Short description of this topic.',
        cover_image_url: '',
      },
    ])
  }

  const handleSaveDraft = () =>
    startTransition(async () => {
      await saveAdvicePageDraft('topics', { items })
      setHasDraft(true)
      setMessage('Draft saved.')
    })
  const handlePublish = () =>
    startTransition(async () => {
      await saveAdvicePageDraft('topics', { items })
      await publishAdvicePage('topics')
      setHasDraft(false)
      setMessage('Published — changes are live.')
    })
  const handleDiscard = () =>
    startTransition(async () => {
      await discardAdvicePageDraft('topics')
      setItems(initial.items)
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
  }, [hasDraft, pending, message, items])

  return (
    <div className="space-y-6">
      <Card
        title={`Topics (${items.length})`}
        action={
          <button
            type="button"
            onClick={add}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#7E5896] hover:text-[#5c3f72] px-2.5 py-1.5 rounded-md border border-[#E7D5EE] hover:bg-[#F8F0FB] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add topic
          </button>
        }
      >
        <p className="text-xs text-gray-500 -mt-2 mb-2">
          This list powers both the sticky dark topics strip at the top of the page and the Popular
          Topics card grid below the Editor\u2019s Picks section.
        </p>
        <div className="space-y-3">
          {items.map((it, idx) => (
            <TopicRow
              key={`${it.id}-${idx}`}
              idx={idx}
              total={items.length}
              item={it}
              onUpdate={(patch) => update(idx, patch)}
              onRemove={() => remove(idx)}
              onMove={(dir) => move(idx, dir)}
              disabled={pending}
              onUploadDone={(url) => update(idx, { cover_image_url: url })}
            />
          ))}
          {items.length === 0 && (
            <div className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg px-4 py-6 text-center">
              No topics yet — add one above.
            </div>
          )}
        </div>
      </Card>

      <Card title="Popular Topics preview" action={<span className="text-xs text-gray-400">Approximate</span>}>
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {items.map((it) => (
            <li key={it.id} className="space-y-2">
              <div className="relative aspect-[4/3] rounded-lg bg-gray-100 overflow-hidden">
                {it.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolveMediaUrl(it.cover_image_url)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-400">
                    No cover
                  </div>
                )}
              </div>
              <p className="text-[15px] font-bold text-[#1A1A1A]">{it.label}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function TopicRow({
  idx,
  total,
  item,
  onUpdate,
  onRemove,
  onMove,
  disabled,
  onUploadDone,
}: {
  idx: number
  total: number
  item: AdviceTopicItem
  onUpdate: (patch: Partial<AdviceTopicItem>) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
  disabled: boolean
  onUploadDone: (url: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    fd.append('slug', `topic-${item.id}`)
    try {
      setUploading(true)
      const { url } = await uploadAdviceMedia(fd)
      onUploadDone(url)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50">
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          Topic {idx + 1}
        </span>
        <div className="flex items-center gap-1">
          <IconBtn title="Move up" onClick={() => onMove(-1)} disabled={idx === 0}>
            <ArrowUp className="w-3.5 h-3.5" />
          </IconBtn>
          <IconBtn title="Move down" onClick={() => onMove(1)} disabled={idx === total - 1}>
            <ArrowDown className="w-3.5 h-3.5" />
          </IconBtn>
          <IconBtn title="Remove" onClick={onRemove} danger>
            <Trash2 className="w-3.5 h-3.5" />
          </IconBtn>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3">
        <Field label="Section ID (anchor)">
          <select
            value={item.id}
            onChange={(e) => onUpdate({ id: e.target.value as AdviceIdeasSectionId })}
            className={inputCls}
          >
            {ADVICE_IDEAS_SECTION_IDS.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Label (shown on the strip and card)">
          <input
            type="text"
            value={item.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Short description">
          <input
            type="text"
            value={item.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 items-start">
        <div className="relative aspect-[4/3] rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
          {item.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveMediaUrl(item.cover_image_url)} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-400">
              No cover
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Field label="Cover image URL (used on the Popular Topics grid)">
            <input
              type="text"
              value={item.cover_image_url}
              onChange={(e) => onUpdate({ cover_image_url: e.target.value })}
              className={inputCls}
              placeholder="/assets/images/… or https://…"
            />
          </Field>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={disabled || uploading}
              className="flex items-center gap-2 text-xs font-medium text-gray-700 px-2.5 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading…' : 'Upload cover'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
          </div>
        </div>
      </div>
    </div>
  )
}

function IconBtn({
  title,
  onClick,
  disabled,
  danger,
  children,
}: {
  title: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-30 ${
        danger
          ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}
