'use client'

import { useRef, useState, useTransition, type ReactNode } from 'react'
import { toast } from 'sonner'
import { ImagePlus, Loader2, Trash2, VideoIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadDashboardHero, removeDashboardHero } from '@/lib/dashboard/actions'
import type { DashboardHeroMedia, HeroPageSlug } from '@/lib/dashboard/types'

interface DashboardHeroProps {
  pageSlug: HeroPageSlug
  title: string
  subtitle?: string
  eyebrow?: string
  media: DashboardHeroMedia | null
  actions?: ReactNode
  className?: string
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime'
const MAX_BYTES = 50 * 1024 * 1024

export function DashboardHero({
  pageSlug,
  title,
  subtitle,
  eyebrow,
  media,
  actions,
  className,
}: DashboardHeroProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useState<DashboardHeroMedia | null | undefined>(undefined)

  // `undefined` means "use server value", `null` means "removed", otherwise overrides.
  const current = optimistic === undefined ? media : optimistic
  const hasMedia = !!current
  const isVideo = current?.media_type === 'video'

  function openPicker() {
    if (pending) return
    fileInputRef.current?.click()
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (file.size > MAX_BYTES) {
      toast.error('File is too large (50MB max)')
      return
    }
    const isImg = file.type.startsWith('image/')
    const isVid = file.type.startsWith('video/')
    if (!isImg && !isVid) {
      toast.error('Please choose an image or video')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    const optimisticEntry: DashboardHeroMedia = {
      page_slug: pageSlug,
      media_url: previewUrl,
      media_type: isImg ? 'image' : 'video',
      storage_path: '',
      updated_at: new Date().toISOString(),
    }
    setOptimistic(optimisticEntry)

    const formData = new FormData()
    formData.append('file', file)

    startTransition(async () => {
      const result = await uploadDashboardHero(pageSlug, formData)
      URL.revokeObjectURL(previewUrl)
      if (!result.ok || !result.url || !result.mediaType) {
        setOptimistic(undefined)
        toast.error(result.error ?? 'Upload failed')
        return
      }
      setOptimistic({
        page_slug: pageSlug,
        media_url: result.url,
        media_type: result.mediaType,
        storage_path: '',
        updated_at: new Date().toISOString(),
      })
      toast.success('Cover updated')
    })
  }

  function handleRemove() {
    if (pending || !hasMedia) return
    setOptimistic(null)
    startTransition(async () => {
      const result = await removeDashboardHero(pageSlug)
      if (!result.ok) {
        setOptimistic(undefined)
        toast.error(result.error ?? 'Could not remove cover')
        return
      }
      toast.success('Cover removed')
    })
  }

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden rounded-3xl border border-black/[0.06] shadow-[0_2px_10px_rgba(26,26,26,0.06)]',
        className
      )}
    >
      {/* Background layer */}
      <div className="absolute inset-0 -z-10">
        {hasMedia ? (
          isVideo ? (
            <video
              key={current!.media_url}
              src={current!.media_url}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={current!.media_url}
              src={current!.media_url}
              alt=""
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#F3E9FA] via-[#E9DCF7] to-[#FFE2CC]" />
        )}
        {/* Overlay for legibility */}
        <div
          className={cn(
            'absolute inset-0',
            hasMedia
              ? 'bg-gradient-to-t from-black/65 via-black/30 to-black/10'
              : 'bg-gradient-to-t from-white/40 via-transparent to-transparent'
          )}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFile}
        className="hidden"
      />

      <div className="relative flex min-h-[220px] flex-col justify-end gap-4 p-6 sm:min-h-[260px] sm:p-8 lg:min-h-[300px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            {eyebrow ? (
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-[0.18em]',
                  hasMedia ? 'text-white/85' : 'text-[#1A1A1A]/55'
                )}
              >
                {eyebrow}
              </p>
            ) : null}
            <h1
              className={cn(
                'mt-1 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl',
                hasMedia ? 'text-white drop-shadow-sm' : 'text-[#1A1A1A]'
              )}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                className={cn(
                  'mt-2 text-sm sm:text-base',
                  hasMedia ? 'text-white/90' : 'text-[#1A1A1A]/70'
                )}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openPicker}
            disabled={pending}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold backdrop-blur transition-colors disabled:cursor-not-allowed disabled:opacity-60',
              hasMedia
                ? 'bg-white/85 text-[#1A1A1A] hover:bg-white'
                : 'bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/85'
            )}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isVideo ? (
              <VideoIcon className="h-4 w-4" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {hasMedia ? 'Change cover' : 'Add cover photo or video'}
          </button>
          {hasMedia ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-xs font-medium text-white backdrop-blur hover:bg-white/25 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          ) : (
            <span
              className={cn(
                'text-xs',
                hasMedia ? 'text-white/75' : 'text-[#1A1A1A]/45'
              )}
            >
              JPG, PNG, WebP, MP4 or WebM · up to 50MB
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

export default DashboardHero
