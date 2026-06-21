'use client'

import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { PanelTop, PanelBottom, LifeBuoy, Receipt, ListChecks, ShoppingCart, MapPin, CheckCircle2, Save, Send, Trash2 } from 'lucide-react'
import { useSetPageHeading } from '@/components/PageHeading'
import { HeaderActionsSlot, HeaderBadgeSlot } from '@/components/HeaderPortals'
import { CmsSecondarySidebar, type CmsSection } from '@/components/cms/CmsSecondarySidebar'
import { EditorActionsProvider, useEditorActions } from './EditorActionsContext'

const sections: CmsSection[] = [
  {
    key: 'navbar',
    label: 'Navbar (shared)',
    icon: PanelTop,
    href: '/cms/opus-pass/site-ui/navbar',
    status: 'live',
    description:
      'Shared navbar chrome — auth buttons and mobile menu controls. Each product’s mega-menu is edited in that product’s CMS.',
  },
  {
    key: 'footer',
    label: 'Footer',
    icon: PanelBottom,
    href: '/cms/opus-pass/site-ui/footer',
    status: 'live',
    description: 'Footer column headings, link labels, legal links and copyright — bilingual.',
  },
  {
    key: 'help',
    label: 'Help page',
    icon: LifeBuoy,
    href: '/cms/opus-pass/site-ui/help',
    status: 'live',
    description: 'Help Centre header, topic cards, FAQs and the contact CTA — bilingual.',
  },
  {
    key: 'pricing',
    label: 'Pricing page',
    icon: Receipt,
    href: '/cms/opus-pass/site-ui/pricing',
    status: 'live',
    description:
      'Pricing hero, tier badges, included/upgrade copy, ways to pay, security notes and FAQs — bilingual. Tier prices stay in the Packages CMS.',
  },
  {
    key: 'how-it-works',
    label: 'How it works page',
    icon: ListChecks,
    href: '/cms/opus-pass/site-ui/how-it-works',
    status: 'live',
    description: 'How-it-works header, process steps, guest features and CTAs — bilingual.',
  },
  {
    key: 'cart',
    label: 'Cart',
    icon: ShoppingCart,
    href: '/cms/opus-pass/site-ui/cart',
    status: 'live',
    description:
      'Cart heading, line-item labels, coupon box, price details, checkout CTA and cross-sell copy — bilingual. Prices and math are not editable here.',
  },
  {
    key: 'address',
    label: 'Delivery address',
    icon: MapPin,
    href: '/cms/opus-pass/site-ui/address',
    status: 'live',
    description:
      'Delivery address form — mode cards, field labels, validation messages and the "what to expect" checklist — bilingual.',
  },
  {
    key: 'confirmation',
    label: 'Order confirmation',
    icon: CheckCircle2,
    href: '/cms/opus-pass/site-ui/confirmation',
    status: 'live',
    description:
      'Order confirmation — success header, payment status card, order summary, "what happens next" and actions — bilingual.',
  },
]

export default function OpusPassSiteUiCmsLayout({ children }: { children: ReactNode }) {
  return (
    <EditorActionsProvider>
      <Shell>{children}</Shell>
    </EditorActionsProvider>
  )
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const activeSection = sections.find((s) => s.href && pathname.startsWith(s.href)) ?? sections[0]

  useSetPageHeading({
    title: `Site UI — ${activeSection.label}`,
    subtitle: activeSection.description ?? undefined,
  })

  return (
    <>
      <HeaderBadgeSlot>
        <EditorStatusBadge />
      </HeaderBadgeSlot>
      <HeaderActionsSlot>
        <EditorActionButtons />
      </HeaderActionsSlot>

      <CmsSecondarySidebar title="Site UI" sections={sections} pathname={pathname} />

      <div className="px-8 pt-2 pb-6">{children}</div>
    </>
  )
}

function EditorStatusBadge() {
  const { bound } = useEditorActions()
  if (!bound || !bound.hasDraft) return null
  return (
    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
      Unpublished draft
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
