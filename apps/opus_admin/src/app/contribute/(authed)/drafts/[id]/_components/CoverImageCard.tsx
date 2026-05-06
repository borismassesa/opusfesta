'use client'

import { useRef, useState } from 'react'
import { ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CoverImageCard({
  draftId,
  url,
  alt,
  readOnly,
  onChange,
}: {
  draftId: string
  url: string
  alt: string
  readOnly: boolean
  onChange: (next: { cover_image_url?: string; cover_image_alt?: string }) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)

  async function upload(file: File) {
    if (readOnly) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const response = await fetch(`/api/contribute/drafts/${draftId}/cover`, {
        method: 'POST',
        body: form,
      })
      const payload = (await response.json()) as { url?: string; error?: string }
      if (!response.ok || !payload.url) throw new Error(payload.error || 'Upload failed.')
      onChange({ cover_image_url: payload.url })
    } finally {
      setUploading(false)
    }
  }

  function firstImage(files: FileList | null): File | null {
    return Array.from(files ?? []).find((file) => file.type.startsWith('image/')) ?? null
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-gray-500">
        Cover image <span className="text-[11px] font-medium lowercase tracking-normal text-gray-400">(optional)</span>
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = firstImage(event.target.files)
          if (file) void upload(file)
          event.currentTarget.value = ''
        }}
      />

      {url ? (
        <div className="mt-4">
          <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={alt || ''} className="aspect-video w-full object-cover" />
            {!readOnly && (
              <button
                type="button"
                onClick={() => onChange({ cover_image_url: '', cover_image_alt: '' })}
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-sm hover:bg-white"
                aria-label="Remove cover image"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-2 text-[11px] font-semibold text-[#5B2D8E] hover:underline"
            >
              Replace
            </button>
          )}
          <input
            value={alt}
            onChange={(event) => onChange({ cover_image_alt: event.target.value })}
            readOnly={readOnly}
            placeholder="Describe this image (for accessibility)"
            className="mt-3 h-9 w-full rounded-lg border border-gray-200 px-3 text-xs outline-none focus:border-[#5B2D8E] read-only:bg-gray-50"
          />
        </div>
      ) : (
        <button
          type="button"
          aria-label="Upload cover image"
          disabled={readOnly || uploading}
          onClick={() => inputRef.current?.click()}
          onPaste={(event) => {
            const file = firstImage(event.clipboardData.files)
            if (file) void upload(file)
          }}
          onDragEnter={() => setDragging(true)}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            const file = firstImage(event.dataTransfer.files)
            if (file) void upload(file)
          }}
          className={cn(
            'mt-4 flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center text-sm text-gray-700 transition-colors hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-60',
            dragging && 'border-[#5B2D8E] bg-[#F7F2FB]'
          )}
        >
          <ImageIcon className="mb-3 h-7 w-7 text-gray-500" />
          <span>{uploading ? 'Uploading...' : 'Drag, paste, or'}</span>
          {!uploading && <span className="font-semibold text-[#5B2D8E] underline">browse</span>}
        </button>
      )}
    </section>
  )
}
