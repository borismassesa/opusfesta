// Shared types / fallbacks / page-key map + field schema for the OpusPass
// "Site UI" microcopy CMS — the editable, bilingual strings on the public site
// chrome (navbar + footer). Mirrors the dual-type convention of
// ./opus-pass-dashboard-copy.ts: the two apps duplicate CMS types/fallbacks
// (different path aliases, no shared package).
//
// Editor (schema-driven, one component for both areas):
//   apps/opus_admin/src/app/(admin)/cms/opus-pass/site-ui/[area]/
// Public loader on the OpusPass side:
//   apps/opus_pass/src/lib/cms/ui-strings.ts (+ ui-strings-fallback.ts)
//
// The fallback English values below MUST stay in sync with the public app's
// UI_STRINGS_FALLBACKS — duplicated here per the dual-type convention.

import type { MaybeLocalized } from '@/lib/cms/localized'
// Reuse the field-schema primitives from the dashboard copy module to avoid drift.
import type {
  CopyField,
  CopyFieldGroup,
  CopyFieldKind,
} from '@/lib/cms/opus-pass-dashboard-copy'

export type { CopyField, CopyFieldGroup, CopyFieldKind }

export type UiArea = 'navbar' | 'footer'

// Each field is translatable: stored as a localized { en, sw } object (or a
// legacy plain string). The editor reads/writes this shape via <BilingualField>.
export type UiStringsContent = Record<string, MaybeLocalized>

export type UiStringsRow = {
  id: string
  page_key: string
  section_key: string
  content: UiStringsContent
  draft_content: UiStringsContent | null
  is_published: boolean
  updated_at: string
}

export const UI_STRINGS_PAGE_KEY: Record<UiArea, string> = {
  navbar: 'opus-pass-ui-navbar',
  footer: 'opus-pass-ui-footer',
}

export const UI_STRINGS_LABEL: Record<UiArea, string> = {
  navbar: 'Navbar (shared)',
  footer: 'Footer',
}

// Navbar + footer appear on every public page; the home page ('/') is the
// canonical surface to "view live".
export const UI_STRINGS_PUBLIC_PATH: Record<UiArea, string> = {
  navbar: '/',
  footer: '/',
}

export const UI_STRINGS_AREAS: readonly UiArea[] = ['navbar', 'footer'] as const

export function isUiArea(value: string): value is UiArea {
  return (UI_STRINGS_AREAS as readonly string[]).includes(value)
}

export const UI_STRINGS_FALLBACK: Record<UiArea, UiStringsContent> = {
  // SHARED navbar chrome only. The product-specific mega-menu strings now live
  // in each product's own CMS group (Invitations / Guests / Wedding Website →
  // section_key 'navbar'); see opus-pass-<group>-navbar.ts. The public navbar
  // merges all four sources back into one 'navbar' namespace at read time.
  navbar: {
    auth_login: 'Log in',
    auth_signup: 'Sign up',
    auth_dashboard: 'Dashboard',
    mobile_back: 'Back',
    mobile_open: 'Open menu',
    mobile_close: 'Close menu',
  },
  footer: {
    col_products: 'Products',
    col_templates: 'Templates',
    col_help: 'Help',
    col_company: 'Company',
    link_invitations: 'Invitations',
    link_guests: "Guests & RSVP's",
    link_website: 'Wedding Website',
    link_save_the_dates: 'Save the Dates',
    link_wedding_invitations: 'Wedding Invitations',
    link_send_off: 'Send-Off & Kitchen Party',
    link_kadi_michango: 'Kadi za Michango',
    link_help_centre: 'Help Centre',
    link_how_it_works: 'How it works',
    link_pricing: 'Pricing',
    link_contact: 'Contact',
    link_about: 'About OpusPass',
    link_careers: 'Careers',
    link_press: 'Press',
    link_status: 'Status',
    legal_terms: 'Terms of Use',
    legal_privacy: 'Privacy Policy',
    legal_cookies: 'Cookie Policy',
    legal_copyright: 'Copyright',
    copyright: '© 2026 OpusPass. All rights reserved.',
  },
}

// ── Field schema that drives the generic editor ──────────────────────────────

export const UI_STRINGS_SCHEMA: Record<UiArea, CopyFieldGroup[]> = {
  // SHARED navbar chrome only — product mega-menus moved to their own CMS groups.
  navbar: [
    {
      legend: 'Auth buttons',
      fields: [
        { key: 'auth_login', label: 'Log in', kind: 'text', max: 30 },
        { key: 'auth_signup', label: 'Sign up', kind: 'text', max: 30 },
        { key: 'auth_dashboard', label: 'Dashboard', kind: 'text', max: 30 },
      ],
    },
    {
      legend: 'Mobile menu',
      fields: [
        { key: 'mobile_back', label: 'Back', kind: 'text', max: 30 },
        { key: 'mobile_open', label: 'Open menu (aria-label)', kind: 'text', max: 30 },
        { key: 'mobile_close', label: 'Close menu (aria-label)', kind: 'text', max: 30 },
      ],
    },
  ],
  footer: [
    {
      legend: 'Column headings',
      fields: [
        { key: 'col_products', label: 'Products', kind: 'text', max: 30 },
        { key: 'col_templates', label: 'Templates', kind: 'text', max: 30 },
        { key: 'col_help', label: 'Help', kind: 'text', max: 30 },
        { key: 'col_company', label: 'Company', kind: 'text', max: 30 },
      ],
    },
    {
      legend: 'Product links',
      fields: [
        { key: 'link_invitations', label: 'Invitations', kind: 'text', max: 40 },
        { key: 'link_guests', label: "Guests & RSVP's", kind: 'text', max: 40 },
        { key: 'link_website', label: 'Wedding Website', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Template links',
      fields: [
        { key: 'link_save_the_dates', label: 'Save the Dates', kind: 'text', max: 40 },
        { key: 'link_wedding_invitations', label: 'Wedding Invitations', kind: 'text', max: 40 },
        { key: 'link_send_off', label: 'Send-Off & Kitchen Party', kind: 'text', max: 40 },
        { key: 'link_kadi_michango', label: 'Kadi za Michango', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Help links',
      fields: [
        { key: 'link_help_centre', label: 'Help Centre', kind: 'text', max: 40 },
        { key: 'link_how_it_works', label: 'How it works', kind: 'text', max: 40 },
        { key: 'link_pricing', label: 'Pricing', kind: 'text', max: 40 },
        { key: 'link_contact', label: 'Contact', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Company links',
      fields: [
        { key: 'link_about', label: 'About OpusPass', kind: 'text', max: 40 },
        { key: 'link_careers', label: 'Careers', kind: 'text', max: 40 },
        { key: 'link_press', label: 'Press', kind: 'text', max: 40 },
        { key: 'link_status', label: 'Status', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Legal',
      fields: [
        { key: 'legal_terms', label: 'Terms of Use', kind: 'text', max: 40 },
        { key: 'legal_privacy', label: 'Privacy Policy', kind: 'text', max: 40 },
        { key: 'legal_cookies', label: 'Cookie Policy', kind: 'text', max: 40 },
        { key: 'legal_copyright', label: 'Copyright', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Copyright',
      fields: [
        { key: 'copyright', label: 'Copyright line', kind: 'text', max: 80 },
      ],
    },
  ],
}
