'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, Save, Trash2, X } from 'lucide-react'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import {
  PRODUCT_CATEGORIES,
  PRODUCT_TREATMENTS,
  slugifyProductName,
  type InvitationProductRecord,
} from '@/lib/cms/opus-pass-invitations-products'
import { deleteInvitationProduct, upsertInvitationProduct } from '../actions'

const LIST = '/cms/opus-pass/invitations/products'
const IMAGE_PREFIX = 'opus-pass/invitations/products'

const inputCls =
  'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A0DC] focus:border-transparent transition-all'

export default function ProductEditor({
  initial,
  isNew,
}: {
  initial: InvitationProductRecord
  isNew: boolean
}) {
  const router = useRouter()
  const [product, setProduct] = useState<InvitationProductRecord>(initial)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof InvitationProductRecord>(key: K, value: InvitationProductRecord[K]) {
    setProduct((p) => ({ ...p, [key]: value }))
  }

  function onNameChange(name: string) {
    setProduct((p) => ({
      ...p,
      name,
      // Keep slug in lockstep with the name until the user customises it.
      slug: !p.slug || p.slug === slugifyProductName(p.name) ? slugifyProductName(name) : p.slug,
    }))
  }

  function save() {
    setError(null)
    const slug = product.slug || slugifyProductName(product.name)
    const id = product.id || slug

    if (!product.name.trim()) return setError('Name is required.')
    if (!slug) return setError('Slug is required.')
    if (!product.price_now || product.price_now <= 0) return setError('Price must be greater than 0.')

    const record: InvitationProductRecord = { ...product, id, slug }

    startTransition(async () => {
      try {
        await upsertInvitationProduct(record)
        router.push(LIST)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    })
  }

  function remove() {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    startTransition(async () => {
      try {
        await deleteInvitationProduct(product.id)
        router.push(LIST)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    })
  }

  return (
    <div className="py-2 max-w-3xl">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <Link
            href={LIST}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All products
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight truncate">
            {isNew ? 'New product' : product.name || 'Untitled product'}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {error && (
            <span className="text-xs text-red-600 font-medium max-w-[280px] truncate" title={error}>
              {error}
            </span>
          )}
          {!isNew && (
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#C9A0DC] hover:bg-[#b97fd0] px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basics */}
        <Card title="Basics">
          <Field label="Name">
            <input value={product.name} onChange={(e) => onNameChange(e.target.value)} className={inputCls} placeholder="Botanical Frame Wedding Invitations" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Slug" hint="Used in the product URL.">
              <input value={product.slug} onChange={(e) => set('slug', e.target.value)} className={inputCls} placeholder="botanical-frame-wedding-invitations" />
            </Field>
            <Field label="Designer">
              <input value={product.designer} onChange={(e) => set('designer', e.target.value)} className={inputCls} placeholder="Bagamoyo Press" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select value={product.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Sort order" hint="Lower numbers appear first.">
              <input type="number" value={product.sort_order} onChange={(e) => set('sort_order', Number(e.target.value) || 0)} className={inputCls} />
            </Field>
          </div>
        </Card>

        {/* Pricing */}
        <Card title="Pricing (TZS)">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Price now" hint="Pack total.">
              <input type="number" value={product.price_now} onChange={(e) => set('price_now', Number(e.target.value) || 0)} className={inputCls} />
            </Field>
            <Field label="Price was" hint="Optional — struck through.">
              <input
                type="number"
                value={product.price_was ?? ''}
                onChange={(e) => set('price_was', e.target.value === '' ? null : Number(e.target.value) || 0)}
                className={inputCls}
                placeholder="—"
              />
            </Field>
            <Field label="Per digital card">
              <input type="number" value={product.digital_unit_price} onChange={(e) => set('digital_unit_price', Number(e.target.value) || 0)} className={inputCls} />
            </Field>
          </div>
          <Toggle label="Offer a free sample" checked={product.free_sample} onChange={(v) => set('free_sample', v)} />
        </Card>

        {/* Card design */}
        <Card title="Card design">
          <ImageUploadField
            label="Card artwork (hero)"
            value={product.image_url}
            onChange={(v) => set('image_url', v)}
            pathPrefix={IMAGE_PREFIX}
            previewAspect="aspect-[5/7]"
            previewWidth="max-w-[180px]"
          />
          <p className="text-[11px] text-gray-500 -mt-1">
            When an image is attached it replaces the built-in CSS design on the product page. Leave empty to use the CSS design below.
          </p>
          <Field label="Built-in design (fallback)">
            <select value={product.treatment} onChange={(e) => set('treatment', e.target.value as InvitationProductRecord['treatment'])} className={inputCls}>
              {PRODUCT_TREATMENTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <GalleryEditor value={product.gallery} onChange={(v) => set('gallery', v)} />
        </Card>

        {/* Colours */}
        <Card title="Design colours">
          <SwatchEditor value={product.swatches} onChange={(v) => set('swatches', v)} />
        </Card>

        {/* Visibility */}
        <Card title="Visibility">
          <Toggle label="Published (visible on the site)" checked={product.published} onChange={(v) => set('published', v)} />
        </Card>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-4">
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      {hint && <span className="block text-[11px] text-gray-400 -mt-1">{hint}</span>}
      {children}
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-[#7E5896] focus:ring-[#C9A0DC]"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

function SwatchEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const update = (i: number, hex: string) => onChange(value.map((c, idx) => (idx === i ? hex : c)))
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const add = () => onChange([...value, '#A6B89A'])

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 rounded-lg border border-gray-200 pl-1.5 pr-1 py-1">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(c) ? c : '#000000'}
              onChange={(e) => update(i, e.target.value)}
              className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              aria-label={`Swatch ${i + 1} colour`}
            />
            <input
              value={c}
              onChange={(e) => update(i, e.target.value)}
              className="w-[78px] text-xs tabular-nums text-gray-700 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="p-0.5 text-gray-400 hover:text-red-600 rounded"
              aria-label={`Remove swatch ${i + 1}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7E5896] hover:text-[#5d3a78] px-2.5 py-1.5 rounded-lg border border-[#C9A0DC] hover:bg-[#F0DFF6] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add colour
      </button>
    </div>
  )
}

function GalleryEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const update = (i: number, url: string) => onChange(value.map((u, idx) => (idx === i ? url : u)))
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const add = () => onChange([...value, ''])

  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-gray-600">Gallery (extra views)</span>
      {value.map((url, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-gray-100 p-2">
          <div className="flex-1">
            <ImageUploadField
              label={`View ${i + 1}`}
              value={url}
              onChange={(v) => update(i, v)}
              pathPrefix={IMAGE_PREFIX}
              previewAspect="aspect-[5/7]"
              previewWidth="max-w-[120px]"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded mt-5"
            aria-label={`Remove view ${i + 1}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7E5896] hover:text-[#5d3a78] px-2.5 py-1.5 rounded-lg border border-[#C9A0DC] hover:bg-[#F0DFF6] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add view
      </button>
    </div>
  )
}
