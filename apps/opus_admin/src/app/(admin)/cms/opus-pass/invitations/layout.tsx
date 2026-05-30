'use client'

import { useTransition, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Circle,
  Compass,
  Eye,
  ExternalLink,
  Globe,
  Grid3X3,
  HelpCircle,
  Heart,
  LayoutPanelTop,
  Mail,
  Megaphone,
  Save,
  Send,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSetPageHeading } from '@/components/PageHeading'
import { HeaderActionsSlot, HeaderBadgeSlot } from '@/components/HeaderPortals'
import { EditorActionsProvider, useEditorActions } from './EditorActionsContext'
import { getOpusPassInvitationsPreviewUrl } from './preview-action'

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
    href: '/cms/opus-pass/invitations/hero',
    status: 'live',
    description: 'Top banner with the lead headline, description and primary/secondary CTAs.',
  },
  {
    key: 'products',
    label: 'Products / Cards',
    icon: Mail,
    href: '/cms/opus-pass/invitations/products',
    status: 'live',
    description: 'Invitation card catalog — artwork, prices, designer and details per card.',
  },
  {
    key: 'ticket',
    label: 'Wedding Ticket',
    icon: Ticket,
    href: '/cms/opus-pass/ticket',
    status: 'live',
    description: 'Upload the wedding ticket SVG and configure accent colour options.',
  },
  {
    key: 'mockup-carousel',
    label: 'Mockup Carousel',
    icon: LayoutPanelTop,
    href: '/cms/opus-pass/mockup-carousel',
    status: 'live',
    description: 'Upload one hero photo per carousel scene — applies to all products and tickets.',
  },
  {
    key: 'categories',
    label: 'Categories',
    icon: Grid3X3,
    href: '/cms/opus-pass/invitations/categories',
    status: 'live',
    description: '"Invitations for Every Moment" section header above the Shop-By-Category grid.',
  },
  {
    key: 'editors-picks',
    label: "Editor's Picks",
    icon: Heart,
    href: '/cms/opus-pass/invitations/editors-picks',
    status: 'live',
    description: 'Editorial product grid — row titles and alignment direction.',
  },
  {
    key: 'features',
    label: 'Features',
    icon: Star,
    href: '/cms/opus-pass/invitations/features',
    status: 'live',
    description: '"Wedding stationery made easy" — section header plus feature card row.',
  },
  {
    key: 'featured-suite',
    label: 'Featured Suite',
    icon: LayoutPanelTop,
    href: '/cms/opus-pass/invitations/featured-suite',
    status: 'live',
    description: 'Featured product suite showcase block.',
  },
  {
    key: 'promo-banner',
    label: 'Promo Banner',
    icon: Megaphone,
    href: '/cms/opus-pass/invitations/promo-banner',
    status: 'live',
    description: 'Sitewide catalog promo strip — discount text + promo code.',
  },
  {
    key: 'style-strip',
    label: 'Style Strip',
    icon: Circle,
    href: '/cms/opus-pass/invitations/style-strip',
    status: 'live',
    description: 'Catalog circular-photo style filters — label + image per chip.',
  },
  {
    key: 'explore-styles',
    label: 'Explore Other Styles',
    icon: Compass,
    href: '/cms/opus-pass/invitations/explore-styles',
    status: 'live',
    description: 'Catalog footer link columns — group heading + link list per column.',
  },
  {
    key: 'free-website-promo',
    label: 'Free Website Promo',
    icon: Globe,
    href: '/cms/opus-pass/invitations/free-website-promo',
    status: 'live',
    description: 'Catalog bottom CTA — "Get a free wedding website" promo block.',
  },
  {
    key: 'faqs',
    label: 'FAQs',
    icon: HelpCircle,
    href: '/cms/opus-pass/invitations/faqs',
    status: 'live',
    description: 'Frequently asked questions — section heading plus add/remove Q&A pairs.',
  },
]

export default function OpusPassInvitationsCmsLayout({ children }: { children: ReactNode }) {
  return (
    <EditorActionsProvider>
      <OpusPassInvitationsCmsShell>{children}</OpusPassInvitationsCmsShell>
    </EditorActionsProvider>
  )
}

function OpusPassInvitationsCmsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const opusPassUrl = process.env.NEXT_PUBLIC_OPUS_PASS_URL ?? 'http://localhost:3008'
  const activeSection = sections.find((s) => s.href && pathname.startsWith(s.href)) ?? sections[0]

  const liveSections = sections.filter((s) => s.status === 'live')
  const soonSections = sections.filter((s) => s.status === 'soon')

  useSetPageHeading({
    title: activeSection.label,
    subtitle: activeSection.description ?? undefined,
  })

  return (
    <div className="pt-2 pb-6">
      <HeaderBadgeSlot>
        <EditorStatusBadge />
      </HeaderBadgeSlot>
      <HeaderActionsSlot>
        <EditorActionButtons />
        <PreviewDraftButton />
        <a
          href={`${opusPassUrl}/invitations`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          View live site
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </HeaderActionsSlot>

      <div className="flex items-start gap-0">
        <aside className="w-[240px] shrink-0 border-r border-gray-100 self-stretch">
          <div className="sticky top-6 px-3 py-1 space-y-5">
            <SectionGroup label="Sections">
              {liveSections.map((s) => (
                <SectionLink key={s.key} section={s} pathname={pathname} />
              ))}
            </SectionGroup>

            {soonSections.length > 0 && (
              <SectionGroup label="Coming soon">
                {soonSections.map((s) => (
                  <SectionItemSoon key={s.key} section={s} />
                ))}
              </SectionGroup>
            )}
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
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 px-2 mb-2">{label}</p>
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
        isActive ? 'bg-[#F0DFF6] text-[#7E5896]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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

function EditorStatusBadge() {
  const { bound } = useEditorActions()
  if (!bound) return null
  const { hasDraft } = bound
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full',
        hasDraft ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
      )}
    >
      {hasDraft ? 'Unpublished draft' : 'All changes published'}
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
        <span className="text-xs text-red-600 font-medium mr-1 max-w-[420px] truncate" title={error}>
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

function PreviewDraftButton() {
  const [pending, startTransition] = useTransition()
  const openPreview = () =>
    startTransition(async () => {
      const url = await getOpusPassInvitationsPreviewUrl('/invitations')
      if (!url) {
        console.warn('OPUS_PASS_PREVIEW_TOKEN env var missing — preview disabled.')
        window.alert('Preview unavailable: OPUS_PASS_PREVIEW_TOKEN is not configured on this environment.')
        return
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    })
  return (
    <button
      type="button"
      onClick={openPreview}
      disabled={pending}
      className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      <Eye className="w-3.5 h-3.5" />
      Preview draft
    </button>
  )
}
