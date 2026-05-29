'use client'

import { useState, useTransition } from 'react'
import { Loader2, Save } from 'lucide-react'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import { PaletteEditor } from '@/components/cms/PaletteEditor'
import { SvgInspector } from '@/components/cms/SvgInspector'
import { upsertInvitationProduct } from '../invitations/products/actions'
import type { InvitationProductRecord } from '@/lib/cms/opus-pass-invitations-products'

const IMAGE_PREFIX = 'opus-pass/invitations/ticket'

const inputCls =
  'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A0DC] focus:border-transparent transition-all'

export default function TicketEditor({
  qr,
  barcode,
}: {
  qr: InvitationProductRecord
  barcode: InvitationProductRecord
}) {
  const [qrRecord, setQrRecord] = useState<InvitationProductRecord>(qr)
  const [barcodeRecord, setBarcodeRecord] = useState<InvitationProductRecord>(barcode)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function setQr<K extends keyof InvitationProductRecord>(key: K, value: InvitationProductRecord[K]) {
    setQrRecord((p) => ({ ...p, [key]: value }))
    setSaved(false)
  }

  function setBarcode<K extends keyof InvitationProductRecord>(key: K, value: InvitationProductRecord[K]) {
    setBarcodeRecord((p) => ({ ...p, [key]: value }))
    setSaved(false)
  }

  function save() {
    setError(null)
    setSaved(false)
    const qrSwatches = qrRecord.palettes.length > 0 ? qrRecord.palettes.map((p) => p.accent) : qrRecord.swatches
    const barcodeSwatches = barcodeRecord.palettes.length > 0 ? barcodeRecord.palettes.map((p) => p.accent) : barcodeRecord.swatches

    startTransition(async () => {
      try {
        await Promise.all([
          upsertInvitationProduct({ ...qrRecord, swatches: qrSwatches }),
          upsertInvitationProduct({ ...barcodeRecord, swatches: barcodeSwatches }),
        ])
        setSaved(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    })
  }

  return (
    <div className="py-2 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Wedding Ticket</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload ticket SVGs and configure the accent colour options shown to customers.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {error && (
            <span className="text-xs text-red-600 font-medium max-w-[280px] truncate" title={error}>
              {error}
            </span>
          )}
          {saved && !error && (
            <span className="text-xs text-emerald-600 font-medium">Saved</span>
          )}
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#C9A0DC] hover:bg-[#b97fd0] px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save both
          </button>
        </div>
      </div>

      {/* QR ticket */}
      <TicketCard
        label="QR Code ticket (p23)"
        description="Boarding-pass layout with a QR code stub."
        record={qrRecord}
        setField={setQr}
      />

      {/* Barcode ticket */}
      <TicketCard
        label="Barcode ticket (p24)"
        description="Boarding-pass layout with a classic linear barcode."
        record={barcodeRecord}
        setField={setBarcode}
      />
    </div>
  )
}

function TicketCard({
  label,
  description,
  record,
  setField,
}: {
  label: string
  description: string
  record: InvitationProductRecord
  setField: <K extends keyof InvitationProductRecord>(key: K, value: InvitationProductRecord[K]) => void
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-5">
      <div>
        <h3 className="text-sm font-bold text-gray-900">{label}</h3>
        <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <ImageUploadField
            label="Ticket front SVG"
            value={record.image_url}
            onChange={(v) => setField('image_url', v)}
            pathPrefix={IMAGE_PREFIX}
            previewAspect="aspect-[14/5]"
            previewWidth="max-w-full"
            accept="svg"
          />
          <SvgInspector url={record.image_url} />
        </div>
        <div>
          <ImageUploadField
            label="Ticket back SVG (optional)"
            value={record.back_image_url}
            onChange={(v) => setField('back_image_url', v)}
            pathPrefix={IMAGE_PREFIX}
            previewAspect="aspect-[14/5]"
            previewWidth="max-w-full"
            accept="svg"
          />
          <SvgInspector url={record.back_image_url} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-600">Accent colour options</span>
          <span className="text-[11px] text-gray-400">Max 5 — accent colour is shown as the stub swatch</span>
        </div>
        <PaletteEditor value={record.palettes} onChange={(v) => setField('palettes', v)} />
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-gray-600">Designer</span>
        <input
          value={record.designer}
          onChange={(e) => setField('designer', e.target.value)}
          className={inputCls}
          placeholder="Mzimbazi Studio"
        />
      </label>
    </div>
  )
}
