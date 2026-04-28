'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  ExternalLink,
  HelpCircle,
  LayoutPanelTop,
  Megaphone,
  MessageSquareQuote,
  MousePointerClick,
  Quote,
  Save,
  Search as SearchIcon,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
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
  href?: string
  status: 'live' | 'soon'
  description?: string
}

const sections: Section[] = [
  {
    key: 'hero',
    label: 'Hero',
    icon: Sparkles,
    href: '/cms/homepage/hero',
    status: 'live',
    description: 'First impression. Headline, subhead, CTAs, and hero media.',
  },
  {
    key: 'trust',
    label: 'Trust Bar',
    icon: ShieldCheck,
    href: '/cms/homepage/trust',
    status: 'live',
    description: 'Trust indicators shown beneath the hero. Icon, title, and short description per item.',
  },
  {
    key: 'category-marquee',
    label: 'Category Marquee',
    icon: Tags,
    href: '/cms/homepage/category-marquee',
    status: 'live',
    description: 'Scrolling row of vendor categories with brand colors. Name, background, and text color per item.',
  },
  {
    key: 'vendor-search',
    label: 'Vendor Search',
    icon: SearchIcon,
    href: '/cms/homepage/vendor-search',
    status: 'live',
    description: 'Animated card showcasing vendor types. Section copy plus a list of rotating examples.',
  },
  {
    key: 'pricing-comparison',
    label: 'Stress-Free Promo',
    icon: LayoutPanelTop,
    href: '/cms/homepage/pricing-comparison',
    status: 'live',
    description: 'Promo block with bento grid (couple photo, promo card, checklist preview) and three feature cards.',
  },
  {
    key: 'do-more',
    label: 'Do More',
    icon: Quote,
    href: '/cms/homepage/do-more',
    status: 'live',
    description: 'Wedding website demos and guest list manager. Shows couples what they get beyond vendor search.',
  },
  {
    key: 'business',
    label: 'Business Showcase',
    icon: Building2,
    href: '/cms/homepage/business',
    status: 'live',
    description: 'For-vendors pitch with rotating vendor profile cards. Section copy, feature pills, card chrome, and showcase items.',
  },
  {
    key: 'features',
    label: 'Features',
    icon: Star,
    href: '/cms/homepage/features',
    status: 'live',
    description: 'Alternating feature blocks with bento media grids. Section header plus add/remove/reorder blocks.',
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    icon: MessageSquareQuote,
    href: '/cms/homepage/testimonials',
    status: 'live',
    description: 'Carousel of testimonials from couples and vendors. Quote, stars, avatar, and dark/accent card variants.',
  },
  {
    key: 'faq',
    label: 'FAQ',
    icon: HelpCircle,
    href: '/cms/homepage/faq',
    status: 'live',
    description: 'Frequently asked questions. Section header, support CTA, plus add/remove/reorder Q&A pairs.',
  },
  {
    key: 'cta',
    label: 'CTA',
    icon: MousePointerClick,
    href: '/cms/homepage/cta',
    status: 'live',
    description: 'Closing full-bleed banner. Background image, eyebrow, 3-line headline, subhead, button, and footnote.',
  },
]

export default function HomepageCmsLayout({ children }: { children: ReactNode }) {
  return (
    <EditorActionsProvider>
      <HomepageCmsShell>{children}</HomepageCmsShell>
    </EditorActionsProvider>
  )
}

function HomepageCmsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL ?? 'http://localhost:3007'
  const activeSection = sections.find((s) => s.href && pathname.startsWith(s.href)) ?? sections[0]

  const liveSections = sections.filter((s) => s.status === 'live')
  const soonSections = sections.filter((s) => s.status === 'soon')

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
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            View live site
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="flex items-start gap-0">
        <aside className="w-[240px] shrink-0 border-r border-gray-100 self-stretch">
          <div className="sticky top-6 px-3 py-1 space-y-5">
            <SectionGroup label="Sections">
              {liveSections.map((s) => (
                <SectionLink key={s.key} section={s} pathname={pathname} />
              ))}
            </SectionGroup>

            <SectionGroup label="Coming soon">
              {soonSections.map((s) => (
                <SectionItemSoon key={s.key} section={s} />
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
  const isActive = section.href && pathname.startsWith(section.href)
  return (
    <Link
      href={section.href!}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-[#F0DFF6] text-[#7E5896]'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      )}
    >
      <Icon className={cn('w-4 h-4 stroke-[1.5] shrink-0', isActive ? 'text-[#7E5896]' : 'text-gray-400')} />
      <span className="truncate">{section.label}</span>
    </Link>
  )
}

function SectionItemSoon({ section }: { section: Section }) {
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

function ActionButtons() {
  const { bound } = useEditorActions()
  if (!bound) return null
  const { hasDraft, pending, message, onSaveDraft, onPublish, onDiscard } = bound
  return (
    <>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mr-1',
          hasDraft ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', hasDraft ? 'bg-amber-500' : 'bg-emerald-500')} />
        {hasDraft ? 'Unpublished draft' : 'All changes published'}
      </span>
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
