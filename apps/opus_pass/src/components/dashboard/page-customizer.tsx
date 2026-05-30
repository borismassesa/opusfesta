'use client'

import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Monitor, Tablet, Smartphone, Trash2, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Field, inputClass } from '@/components/dashboard/controls'
import { uploadPledgeCover } from '@/lib/dashboard/actions'
import {
  COVER_TONES,
  ACCENT_SWATCHES,
  type PledgeCoverTone,
  type PledgePageConfig,
} from '@/lib/dashboard/pledge-page'

// Shared building blocks for the pledge / collector page customizers.

export type PreviewDevice = 'desktop' | 'tablet' | 'phone'

export const PREVIEW_DEVICES: Record<
  PreviewDevice,
  { label: string; width: string; height: number; icon: typeof Monitor }
> = {
  desktop: { label: 'Desktop', width: '100%', height: 620, icon: Monitor },
  tablet: { label: 'iPad', width: '768px', height: 780, icon: Tablet },
  phone: { label: 'Phone', width: '390px', height: 780, icon: Smartphone },
}

export function DeviceToggle({
  device,
  onChange,
}: {
  device: PreviewDevice
  onChange: (d: PreviewDevice) => void
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-black/[0.12] bg-white p-0.5">
      {(Object.keys(PREVIEW_DEVICES) as PreviewDevice[]).map((d) => {
        const { label, icon: Icon } = PREVIEW_DEVICES[d]
        const active = d === device
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            aria-pressed={active}
            title={label}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
              active ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/55 hover:text-[#1A1A1A]',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

/** A browser-chrome framed iframe whose width follows the selected device. */
export function PreviewBrowser({
  src,
  device,
  previewKey,
}: {
  src: string
  device: PreviewDevice
  previewKey: number
}) {
  return (
    <div className="rounded-2xl bg-[#F3F1EE]/60 p-3 sm:p-5">
      <div
        className="mx-auto overflow-hidden rounded-xl border border-black/[0.12] bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.4)] transition-all duration-300"
        style={{ maxWidth: PREVIEW_DEVICES[device].width }}
      >
        <div className="flex items-center gap-2 border-b border-black/[0.08] bg-[#F3F1EE] px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          <div className="ml-3 hidden min-w-0 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-[#1A1A1A]/50 ring-1 ring-black/[0.06] sm:block">
            {src.replace(/^https?:\/\//, '')}
          </div>
        </div>
        <iframe
          key={previewKey}
          src={src}
          title="Page preview"
          className="w-full bg-white"
          style={{ height: PREVIEW_DEVICES[device].height }}
          loading="lazy"
        />
      </div>
    </div>
  )
}

/** Shared wording + appearance fields for a pledge / collector page config. */
export function PageConfigFields({
  cfg,
  setCfg,
  headingPlaceholder = 'Would Love Your Support',
  buttonPlaceholder = 'Send my pledge',
}: {
  cfg: PledgePageConfig
  setCfg: React.Dispatch<React.SetStateAction<PledgePageConfig>>
  headingPlaceholder?: string
  buttonPlaceholder?: string
}) {
  const set = (patch: Partial<PledgePageConfig>) => setCfg((c) => ({ ...c, ...patch }))
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-[#1A1A1A]">Wording</h4>
        <Field label="Eyebrow">
          <input
            className={inputClass}
            value={cfg.eyebrow ?? ''}
            onChange={(e) => set({ eyebrow: e.target.value })}
            placeholder="To celebrate the wedding of"
          />
        </Field>
        <Field label="Heading — second line" hint="Shown under the couple’s names">
          <input
            className={inputClass}
            value={cfg.headingLine2 ?? ''}
            onChange={(e) => set({ headingLine2: e.target.value })}
            placeholder={headingPlaceholder}
          />
        </Field>
        <Field label="Intro">
          <textarea
            rows={3}
            className={inputClass}
            value={cfg.intro ?? ''}
            onChange={(e) => set({ intro: e.target.value })}
          />
        </Field>
        <Field label="Button label">
          <input
            className={inputClass}
            value={cfg.buttonLabel ?? ''}
            onChange={(e) => set({ buttonLabel: e.target.value })}
            placeholder={buttonPlaceholder}
          />
        </Field>
        <Field label="Privacy note" hint="Use {couple} where the couple’s name should appear">
          <textarea
            rows={2}
            className={inputClass}
            value={cfg.privacyNote ?? ''}
            onChange={(e) => set({ privacyNote: e.target.value })}
          />
        </Field>
      </section>

      <section className="space-y-3 border-t border-black/[0.06] pt-5">
        <h4 className="text-sm font-semibold text-[#1A1A1A]">Appearance</h4>

        <Field label="Accent color">
          <div className="flex flex-wrap items-center gap-2">
            {ACCENT_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => set({ accent: hex })}
                aria-label={`Accent ${hex}`}
                className={cn(
                  'h-8 w-8 rounded-full ring-2 ring-offset-2 transition',
                  cfg.accent === hex ? 'ring-[#1A1A1A]' : 'ring-transparent',
                )}
                style={{ backgroundColor: hex }}
              />
            ))}
            <input
              type="text"
              value={cfg.accent ?? ''}
              onChange={(e) => set({ accent: e.target.value })}
              placeholder="#C9A0DC"
              className={`${inputClass} w-28`}
            />
          </div>
        </Field>

        <Field label="Cover background">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(Object.keys(COVER_TONES) as PledgeCoverTone[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set({ coverTone: t })}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition',
                  cfg.coverTone === t
                    ? 'border-[#C9A0DC] bg-[#F0DFF6] text-[#5d3a78]'
                    : 'border-black/[0.12] text-[#1A1A1A]/70 hover:bg-black/[0.03]',
                )}
              >
                <span
                  className="h-5 w-5 shrink-0 rounded-full ring-1 ring-black/10"
                  style={{ background: COVER_TONES[t].gradient }}
                />
                {COVER_TONES[t].label}
              </button>
            ))}
          </div>
        </Field>

        <Field
          label="Cover photo"
          hint="Upload a photo to use instead of the color. Leave empty to keep the color background."
        >
          <CoverUploader value={cfg.coverImageUrl ?? null} onChange={(url) => set({ coverImageUrl: url })} />
        </Field>
      </section>
    </div>
  )
}

/** Drag-and-drop cover image uploader (Supabase Storage via uploadPledgeCover). */
export function CoverUploader({
  value,
  onChange,
}: {
  value: string | null
  onChange: (url: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, startUpload] = useTransition()
  const [dragOver, setDragOver] = useState(false)

  function handleFile(file: File | undefined | null) {
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    startUpload(async () => {
      try {
        const url = await uploadPledgeCover(fd)
        onChange(url)
        toast.success('Cover photo uploaded')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed')
      }
    })
  }

  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative overflow-hidden rounded-xl border border-black/[0.12]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Cover preview" className="h-32 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white hover:bg-black/75"
          >
            <Trash2 className="h-3 w-3" /> Remove
          </button>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs font-medium text-[#8e57b3] hover:underline"
        >
          {uploading ? 'Uploading…' : 'Replace photo'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-center transition',
          dragOver ? 'border-[#C9A0DC] bg-[#F0DFF6]/40' : 'border-black/[0.18] hover:bg-black/[0.02]',
        )}
      >
        {uploading ? (
          <span className="text-sm text-[#1A1A1A]/60">Uploading…</span>
        ) : (
          <>
            <ImageIcon className="h-5 w-5 text-[#1A1A1A]/40" />
            <span className="text-sm font-medium text-[#1A1A1A]/70">Drop an image here, or click to upload</span>
            <span className="text-xs text-[#1A1A1A]/40">JPG, PNG or WebP · up to 5MB</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </>
  )
}
