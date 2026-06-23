import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { DashboardHeroContent } from '@/lib/cms/dashboard-hero'

interface DashboardHeroProps {
  content: DashboardHeroContent
  actions?: ReactNode
  className?: string
  /** Show the thin underline below the header. Defaults to true. */
  divider?: boolean
}

// Plain page header — same shape as the overview dashboard. Renders the
// CMS-loaded title + subtitle on the left with the page's primary actions
// on the right, separated by a thin underline. No media, no rounded card.
export function DashboardHero({ content, actions, className, divider = true }: DashboardHeroProps) {
  return (
    <header
      className={cn(
        'flex flex-wrap items-end justify-between gap-4 pb-6',
        divider && 'border-b border-black/[0.06]',
        className,
      )}
    >
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">
          {content.title}
        </h1>
        {content.subtitle ? (
          <p className="mt-2 text-sm text-[#1A1A1A]/65 sm:text-base">{content.subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export default DashboardHero
