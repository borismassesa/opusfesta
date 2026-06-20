'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SecondarySidebarSlot } from '@/components/HeaderPortals'

// One entry in a CMS section's secondary nav. `status: 'soon'` renders a
// disabled "coming soon" row; 'live' rows link to `href`.
export type CmsSection = {
  key: string
  label: string
  icon: LucideIcon
  href?: string
  status: 'live' | 'soon'
  description?: string
}

// Optional draft awareness for editors that track unsaved/unpublished state
// (currently the homepage editor). Omit for read-only/simple CMS sections.
export type CmsSidebarDraftState = {
  // True while the active editor has unsaved edits — guards in-sidebar nav.
  isDirty: boolean
  // The section the user is currently editing (its dot reflects live hasDraft).
  activeSectionKey: string
  // Whether the active section has an unpublished draft.
  hasDraft: boolean
  // Keys of the other sections that have unpublished drafts (amber dot).
  draftSections: string[]
}

// Shared warning copy — also imported by editors that add a beforeunload guard,
// so the in-sidebar nav confirm and the tab-close confirm stay in sync.
export const UNSAVED_WARNING =
  'You have unsaved changes that will be lost. Leave anyway?'

// Full-height secondary nav for the OpusPass CMS section editors. Portaled to
// the (admin) shell column so it spans the whole content area with the Header
// sitting only above the body. Each section layout passes its own title +
// sections; the homepage editor additionally passes `draft` for dirty-guards
// and per-section draft dots.
export function CmsSecondarySidebar({
  title,
  sections,
  pathname,
  draft,
}: {
  title: string
  sections: CmsSection[]
  pathname: string
  draft?: CmsSidebarDraftState
}) {
  const liveSections = sections.filter((s) => s.status === 'live')
  const soonSections = sections.filter((s) => s.status === 'soon')

  return (
    <SecondarySidebarSlot>
      <aside className="flex h-full w-[240px] flex-col gap-4 overflow-y-auto border-r border-gray-100 px-3 py-6">
        <h2 className="px-2 text-base font-bold tracking-tight text-gray-900">{title}</h2>
        <SectionGroup label="Sections">
          {liveSections.map((s) => (
            <SectionLink
              key={s.key}
              section={s}
              pathname={pathname}
              isDirty={draft?.isDirty ?? false}
              hasDraftDot={
                draft
                  ? s.key === draft.activeSectionKey
                    ? draft.hasDraft
                    : draft.draftSections.includes(s.key)
                  : false
              }
            />
          ))}
        </SectionGroup>

        {soonSections.length > 0 && (
          <SectionGroup label="Coming soon">
            {soonSections.map((s) => (
              <SectionItemSoon key={s.key} section={s} />
            ))}
          </SectionGroup>
        )}
      </aside>
    </SecondarySidebarSlot>
  )
}

function SectionGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 px-2 mb-2">{label}</p>
      <nav className="space-y-0.5">{children}</nav>
    </div>
  )
}

function SectionLink({
  section,
  pathname,
  isDirty,
  hasDraftDot,
}: {
  section: CmsSection
  pathname: string
  isDirty: boolean
  hasDraftDot: boolean
}) {
  const Icon = section.icon
  const isActive = section.href ? pathname.startsWith(section.href) : false
  return (
    <Link
      href={section.href!}
      onClick={(e) => {
        // Guard against navigating away from an editor with unsaved edits.
        if (!isActive && isDirty && !window.confirm(UNSAVED_WARNING)) e.preventDefault()
      }}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive ? 'bg-[#F0DFF6] text-[#7E5896]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      )}
    >
      <Icon className={cn('w-4 h-4 stroke-[1.5] shrink-0', isActive ? 'text-[#7E5896]' : 'text-gray-400')} />
      <span className="truncate">{section.label}</span>
      {hasDraftDot && (
        <span
          className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
          title="Unpublished draft"
          aria-label="Unpublished draft"
        />
      )}
    </Link>
  )
}

function SectionItemSoon({ section }: { section: CmsSection }) {
  const Icon = section.icon
  return (
    <div
      className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-400 cursor-not-allowed select-none"
      title="Coming soon"
    >
      <Icon className="w-4 h-4 stroke-[1.5] shrink-0 text-gray-300" />
      <span className="truncate">{section.label}</span>
    </div>
  )
}
