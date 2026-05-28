import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { DashboardHeroContent } from '@/lib/cms/dashboard-hero'

interface DashboardHeroProps {
  content: DashboardHeroContent
  actions?: ReactNode
  className?: string
}

export function DashboardHero({ content, actions, className }: DashboardHeroProps) {
  const hasMedia = content.media_type !== 'none' && !!content.media_url
  const isVideo = content.media_type === 'video'

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden rounded-3xl border border-black/[0.06] shadow-[0_2px_10px_rgba(26,26,26,0.06)]',
        className
      )}
    >
      <div className="absolute inset-0 -z-10">
        {hasMedia ? (
          isVideo ? (
            <video
              key={content.media_url}
              src={content.media_url}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
              aria-label={content.media_alt || undefined}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={content.media_url}
              src={content.media_url}
              alt={content.media_alt}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="h-full w-full bg-neutral-100" />
        )}
        <div
          className={cn(
            'absolute inset-0',
            hasMedia
              ? 'bg-gradient-to-t from-black/65 via-black/30 to-black/10'
              : 'bg-gradient-to-t from-white/40 via-transparent to-transparent'
          )}
        />
      </div>

      <div className="relative flex min-h-[220px] flex-col justify-end gap-4 p-6 sm:min-h-[260px] sm:p-8 lg:min-h-[300px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            {content.eyebrow ? (
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-[0.18em]',
                  hasMedia ? 'text-white/85' : 'text-[#1A1A1A]/55'
                )}
              >
                {content.eyebrow}
              </p>
            ) : null}
            <h1
              className={cn(
                'mt-1 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl',
                hasMedia ? 'text-white drop-shadow-sm' : 'text-[#1A1A1A]'
              )}
            >
              {content.title}
            </h1>
            {content.subtitle ? (
              <p
                className={cn(
                  'mt-2 text-sm sm:text-base',
                  hasMedia ? 'text-white/90' : 'text-[#1A1A1A]/70'
                )}
              >
                {content.subtitle}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </div>
    </section>
  )
}

export default DashboardHero
