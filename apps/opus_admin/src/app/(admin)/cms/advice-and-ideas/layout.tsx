'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ExternalLink,
  Heading1,
  Save,
  Send,
  Sparkles,
  Tags,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EditorActionsProvider, useEditorActions } from './EditorActionsContext'

type Section = {
  key: string
  label: string
  icon: LucideIcon
  href: string
  description?: string
}

const sections: Section[] = [
  {
    key: 'hero',
    label: 'Hero',
    icon: Sparkles,
    href: '/cms/advice-and-ideas/hero',
    description: '"Plan a wedding that feels ___" — rotating words, subheadline, and the Start Reading / Latest Stories CTAs.',
  },
  {
    key: 'topics',
    label: 'Topics & Popular Topics',
    icon: Tags,
    href: '/cms/advice-and-ideas/topics',
    description: 'Shared list powering the sticky dark topic strip and the Popular Topics card grid.',
  },
  {
    key: 'section-headers',
    label: 'Section Headers',
    icon: Heading1,
    href: '/cms/advice-and-ideas/section-headers',
    description: 'Titles, subtitles, and "View all" labels for Editor\u2019s Picks, Loved by Couples, Our Favorites, Latest Stories, and Search results.',
  },
]

export default function AdviceIdeasCmsLayout({ children }: { children: ReactNode }) {
  return (
    <EditorActionsProvider>
      <AdviceIdeasCmsShell>{children}</AdviceIdeasCmsShell>
    </EditorActionsProvider>
  )
}

function AdviceIdeasCmsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL ?? 'http://localhost:3007'
  const activeSection =
    sections.find((s) => pathname.startsWith(s.href)) ?? sections[0]

  return (
    <div className="pt-2 pb-6">
      <div className="flex items-start justify-between gap-4 px-8 pb-6 mb-6 border-b border-gray-100">
        <div className="min-w-0">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {activeSection.label}
          </h2>
          {activeSection.description && (
            <p className="text-sm text-gray-500 mt-2 max-w-2xl">
              {activeSection.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ActionButtons />
          <a
            href={`${websiteUrl}/advice-and-ideas`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            View live page
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="flex items-start gap-0">
        <aside className="w-[240px] shrink-0 border-r border-gray-100 self-stretch">
          <div className="sticky top-6 px-3 py-1 space-y-5">
            <SectionGroup label="Page">
              {sections.map((s) => (
                <SectionLink key={s.key} section={s} pathname={pathname} />
              ))}
            </SectionGroup>
          </div>
        </aside>

        <section className="flex-1 min-w-0 px-8">{children}</section>
      </div>
    </div>
  )
}

function SectionGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 px-2 mb-2">
        {label}
      </p>
      <nav className="space-y-0.5">{children}</nav>
    </div>
  )
}

function SectionLink({ section, pathname }: { section: Section; pathname: string }) {
  const Icon = section.icon
  const isActive = pathname.startsWith(section.href)
  return (
    <Link
      href={section.href}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive ? 'bg-[#F0DFF6] text-[#7E5896]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      )}
    >
      <Icon className={cn('w-4 h-4 stroke-[1.5] shrink-0', isActive ? 'text-[#7E5896]' : 'text-gray-400')} />
      <span className="truncate">{section.label}</span>
    </Link>
  )
}

function ActionButtons() {
  const { bound } = useEditorActions()
  if (!bound) return null
  const { hasDraft, pending, message, onSaveDraft, onPublish, onDiscard } = bound
  return (
    <>
      {hasDraft && (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mr-1 bg-amber-50 text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Unpublished draft
        </span>
      )}
      {message && <span className="text-xs text-gray-500 mr-1">{message}</span>}
      {hasDraft && (
        <button
          type="button"
          onClick={onDiscard}
          disabled={pending}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Discard
        </button>
      )}
      <button
        type="button"
        onClick={onSaveDraft}
        disabled={pending}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        Save draft
      </button>
      <button
        type="button"
        onClick={onPublish}
        disabled={pending}
        className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#C9A0DC] hover:bg-[#b97fd0] px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        Publish
      </button>
    </>
  )
}

