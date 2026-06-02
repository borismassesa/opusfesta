'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ClipboardCheck,
  ExternalLink,
  Globe2,
  LayoutDashboard,
  Save,
  Send,
  Sparkles,
  Trash2,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSetPageHeading } from '@/components/PageHeading'
import { HeaderActionsSlot, HeaderBadgeSlot } from '@/components/HeaderPortals'
import {
  DASHBOARD_HERO_LABEL,
  DASHBOARD_HERO_PUBLIC_PATH,
  DASHBOARD_HERO_SLUGS,
  type DashboardHeroSlug,
} from '@/lib/cms/opus-pass-dashboard-hero'
import { EditorActionsProvider, useEditorActions } from './EditorActionsContext'

const ICONS: Record<DashboardHeroSlug, LucideIcon> = {
  home: LayoutDashboard,
  invitations: Send,
  guests: Users,
  rsvps: ClipboardCheck,
  website: Globe2,
}

const DESCRIPTIONS: Record<DashboardHeroSlug, string> = {
  home: 'Top banner on the dashboard overview (/my/dashboard) — eyebrow, title, subtitle and cover media.',
  invitations:
    'Top banner on the Send invitations page (/my/dashboard/invitations) — eyebrow, title, subtitle and cover media.',
  guests:
    'Top banner on the Guest list page (/my/dashboard/guests) — eyebrow, title, subtitle and cover media.',
  rsvps: 'Top banner on the RSVPs page (/my/dashboard/rsvps) — eyebrow, title, subtitle and cover media.',
  website:
    'Top banner on the Wedding website page (/my/dashboard/website) — eyebrow, title, subtitle and cover media.',
}

function slugFromPath(pathname: string): DashboardHeroSlug {
  for (const slug of DASHBOARD_HERO_SLUGS) {
    if (pathname.startsWith(`/cms/opus-pass/dashboard/${slug}`)) return slug
  }
  return 'home'
}

export default function OpusPassDashboardCmsLayout({ children }: { children: ReactNode }) {
  return (
    <EditorActionsProvider>
      <Shell>{children}</Shell>
    </EditorActionsProvider>
  )
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  // opus_pass is mounted under basePath '/opuspass'.
  const opusPassUrl = `${process.env.NEXT_PUBLIC_OPUS_PASS_URL ?? 'http://localhost:3008'}/opuspass`
  const activeSlug = slugFromPath(pathname)

  useSetPageHeading({
    title: `${DASHBOARD_HERO_LABEL[activeSlug]} — Hero`,
    subtitle: DESCRIPTIONS[activeSlug],
  })

  return (
    <div className="pt-2 pb-6">
      <HeaderBadgeSlot>
        <EditorStatusBadge />
      </HeaderBadgeSlot>
      <HeaderActionsSlot>
        <EditorActionButtons />
        <a
          href={`${opusPassUrl}${DASHBOARD_HERO_PUBLIC_PATH[activeSlug]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          View live page
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </HeaderActionsSlot>

      <div className="flex items-start gap-0">
        <aside className="w-[240px] shrink-0 border-r border-gray-100 self-stretch">
          <div className="sticky top-6 px-3 py-1 space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 px-2 mb-2">
              Dashboard pages
            </p>
            <nav className="space-y-0.5">
              {DASHBOARD_HERO_SLUGS.map((slug) => {
                const Icon = ICONS[slug]
                const href = `/cms/opus-pass/dashboard/${slug}/hero`
                const isActive = pathname.startsWith(`/cms/opus-pass/dashboard/${slug}`)
                return (
                  <Link
                    key={slug}
                    href={href}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[#F0DFF6] text-[#7E5896]'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 stroke-[1.5] shrink-0',
                        isActive ? 'text-[#7E5896]' : 'text-gray-400'
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate">{DASHBOARD_HERO_LABEL[slug]}</span>
                      <span className="block text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">
                        Hero
                      </span>
                    </div>
                    {isActive && <Sparkles className="w-3 h-3 text-[#7E5896]" />}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        <section className="flex-1 min-w-0 px-8">{children}</section>
      </div>
    </div>
  )
}

function EditorStatusBadge() {
  const { bound } = useEditorActions()
  if (!bound) return null
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full',
        bound.hasDraft ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
      )}
    >
      {bound.hasDraft ? 'Unpublished draft' : 'All changes published'}
    </span>
  )
}

function EditorActionButtons() {
  const { bound } = useEditorActions()
  if (!bound) return null
  const { hasDraft, pending, message, error, onSaveDraft, onPublish, onDiscard } = bound
  return (
    <>
      {error ? (
        <span
          className="text-xs text-red-600 font-medium mr-1 max-w-[420px] truncate"
          title={error}
        >
          {error}
        </span>
      ) : (
        message && <span className="text-xs text-gray-500 mr-1">{message}</span>
      )}
      {hasDraft && (
        <button
          type="button"
          onClick={onDiscard}
          disabled={pending}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Discard
        </button>
      )}
      <button
        type="button"
        onClick={onSaveDraft}
        disabled={pending}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        Save draft
      </button>
      <button
        type="button"
        onClick={onPublish}
        disabled={pending}
        className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#C9A0DC] hover:bg-[#b97fd0] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        Publish
      </button>
    </>
  )
}
