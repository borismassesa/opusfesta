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
  navbar: 'Navbar',
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
  navbar: {
    nav_invitations: 'Invitations',
    nav_guests: "Guests & RSVP's",
    nav_website: 'Wedding Website',
    mega_inv_title: 'WEDDING INVITATIONS',
    mega_inv_desc:
      'Designer-worthy digital invitations for every wedding moment, sent by WhatsApp or SMS.',
    mega_inv_cta: 'Browse all designs',
    inv_col_browse: 'Browse',
    inv_col_resources: 'Resources',
    inv_link_all_designs: 'All Designs',
    inv_link_save_the_dates: 'Save the Dates',
    inv_link_wedding: 'Wedding Invitations',
    inv_link_send_off: 'Send-Off & Kitchen Party',
    inv_link_kadi: 'Kadi za Michango',
    inv_link_wording: 'Invitation Wording',
    inv_link_rsvp_wording: 'RSVP Wording Ideas',
    inv_grid_title: 'Wedding Paper',
    inv_grid_guest_list: 'Guest List',
    inv_grid_rsvp_tracking: 'RSVP Tracking',
    inv_grid_invitations: 'Invitations',
    inv_grid_seating_plan: 'Seating Plan',
    mega_guests_title: 'GUESTS & RSVPS',
    mega_guests_desc:
      'Send digital invites by WhatsApp or SMS and watch RSVPs roll in live.',
    mega_guests_cta: 'Manage your guests',
    guests_col_manage: 'Manage',
    guests_col_resources: 'Resources',
    guests_link_list_manager: 'Guest List Manager',
    guests_link_rsvp_tracking: 'RSVP Tracking',
    guests_link_whatsapp_sms: 'WhatsApp & SMS Send',
    guests_link_seating: 'Seating Chart',
    guests_link_rsvp_wording: 'RSVP Wording Ideas',
    guests_link_etiquette: 'Guest Etiquette Tips',
    guests_grid_title: 'Guest Tools',
    guests_grid_guest_list: 'Guest List',
    guests_grid_rsvp_tracking: 'RSVP Tracking',
    guests_grid_invitations: 'Invitations',
    guests_grid_seating_plan: 'Seating Plan',
    mega_website_title: 'WEDDING WEBSITE',
    mega_website_desc:
      'Build a beautiful wedding website in minutes and share it with your guests.',
    mega_website_cta: 'Create your website',
    website_col_features: 'Features',
    website_col_resources: 'Resources',
    website_link_free_site: 'Free Wedding Website',
    website_link_custom_link: 'Custom Link',
    website_link_templates: 'Beautiful Templates',
    website_link_rsvp_collection: 'RSVP Collection',
    website_link_venue_travel: 'Venue & Travel Info',
    website_link_examples: 'Website Examples',
    website_link_gallery_tips: 'Photo Gallery Tips',
    website_link_sharing: 'Sharing with Guests',
    website_grid_title: 'Website Ideas',
    website_grid_templates: 'Templates',
    website_grid_photo_gallery: 'Photo Gallery',
    website_grid_rsvps: 'RSVPs',
    website_grid_travel_info: 'Travel Info',
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
  navbar: [
    {
      legend: 'Top nav',
      fields: [
        { key: 'nav_invitations', label: 'Invitations', kind: 'text', max: 40 },
        { key: 'nav_guests', label: "Guests & RSVP's", kind: 'text', max: 40 },
        { key: 'nav_website', label: 'Wedding Website', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Invitations mega-menu',
      fields: [
        { key: 'mega_inv_title', label: 'Card title', kind: 'text', max: 40 },
        { key: 'mega_inv_desc', label: 'Card description', kind: 'textarea', max: 160 },
        { key: 'mega_inv_cta', label: 'Card link', kind: 'text', max: 40 },
        { key: 'inv_col_browse', label: 'Browse column heading', kind: 'text', max: 30 },
        { key: 'inv_col_resources', label: 'Resources column heading', kind: 'text', max: 30 },
        { key: 'inv_link_all_designs', label: 'Link — All Designs', kind: 'text', max: 40 },
        { key: 'inv_link_save_the_dates', label: 'Link — Save the Dates', kind: 'text', max: 40 },
        { key: 'inv_link_wedding', label: 'Link — Wedding Invitations', kind: 'text', max: 40 },
        { key: 'inv_link_send_off', label: 'Link — Send-Off & Kitchen Party', kind: 'text', max: 40 },
        { key: 'inv_link_kadi', label: 'Link — Kadi za Michango', kind: 'text', max: 40 },
        { key: 'inv_link_wording', label: 'Link — Invitation Wording', kind: 'text', max: 40 },
        { key: 'inv_link_rsvp_wording', label: 'Link — RSVP Wording Ideas', kind: 'text', max: 40 },
        { key: 'inv_grid_title', label: 'Photo grid heading', kind: 'text', max: 30 },
        { key: 'inv_grid_guest_list', label: 'Photo — Guest List', kind: 'text', max: 30 },
        { key: 'inv_grid_rsvp_tracking', label: 'Photo — RSVP Tracking', kind: 'text', max: 30 },
        { key: 'inv_grid_invitations', label: 'Photo — Invitations', kind: 'text', max: 30 },
        { key: 'inv_grid_seating_plan', label: 'Photo — Seating Plan', kind: 'text', max: 30 },
      ],
    },
    {
      legend: "Guests & RSVP's mega-menu",
      fields: [
        { key: 'mega_guests_title', label: 'Card title', kind: 'text', max: 40 },
        { key: 'mega_guests_desc', label: 'Card description', kind: 'textarea', max: 160 },
        { key: 'mega_guests_cta', label: 'Card link', kind: 'text', max: 40 },
        { key: 'guests_col_manage', label: 'Manage column heading', kind: 'text', max: 30 },
        { key: 'guests_col_resources', label: 'Resources column heading', kind: 'text', max: 30 },
        { key: 'guests_link_list_manager', label: 'Link — Guest List Manager', kind: 'text', max: 40 },
        { key: 'guests_link_rsvp_tracking', label: 'Link — RSVP Tracking', kind: 'text', max: 40 },
        { key: 'guests_link_whatsapp_sms', label: 'Link — WhatsApp & SMS Send', kind: 'text', max: 40 },
        { key: 'guests_link_seating', label: 'Link — Seating Chart', kind: 'text', max: 40 },
        { key: 'guests_link_rsvp_wording', label: 'Link — RSVP Wording Ideas', kind: 'text', max: 40 },
        { key: 'guests_link_etiquette', label: 'Link — Guest Etiquette Tips', kind: 'text', max: 40 },
        { key: 'guests_grid_title', label: 'Photo grid heading', kind: 'text', max: 30 },
        { key: 'guests_grid_guest_list', label: 'Photo — Guest List', kind: 'text', max: 30 },
        { key: 'guests_grid_rsvp_tracking', label: 'Photo — RSVP Tracking', kind: 'text', max: 30 },
        { key: 'guests_grid_invitations', label: 'Photo — Invitations', kind: 'text', max: 30 },
        { key: 'guests_grid_seating_plan', label: 'Photo — Seating Plan', kind: 'text', max: 30 },
      ],
    },
    {
      legend: 'Wedding Website mega-menu',
      fields: [
        { key: 'mega_website_title', label: 'Card title', kind: 'text', max: 40 },
        { key: 'mega_website_desc', label: 'Card description', kind: 'textarea', max: 160 },
        { key: 'mega_website_cta', label: 'Card link', kind: 'text', max: 40 },
        { key: 'website_col_features', label: 'Features column heading', kind: 'text', max: 30 },
        { key: 'website_col_resources', label: 'Resources column heading', kind: 'text', max: 30 },
        { key: 'website_link_free_site', label: 'Link — Free Wedding Website', kind: 'text', max: 40 },
        { key: 'website_link_custom_link', label: 'Link — Custom Link', kind: 'text', max: 40 },
        { key: 'website_link_templates', label: 'Link — Beautiful Templates', kind: 'text', max: 40 },
        { key: 'website_link_rsvp_collection', label: 'Link — RSVP Collection', kind: 'text', max: 40 },
        { key: 'website_link_venue_travel', label: 'Link — Venue & Travel Info', kind: 'text', max: 40 },
        { key: 'website_link_examples', label: 'Link — Website Examples', kind: 'text', max: 40 },
        { key: 'website_link_gallery_tips', label: 'Link — Photo Gallery Tips', kind: 'text', max: 40 },
        { key: 'website_link_sharing', label: 'Link — Sharing with Guests', kind: 'text', max: 40 },
        { key: 'website_grid_title', label: 'Photo grid heading', kind: 'text', max: 30 },
        { key: 'website_grid_templates', label: 'Photo — Templates', kind: 'text', max: 30 },
        { key: 'website_grid_photo_gallery', label: 'Photo — Photo Gallery', kind: 'text', max: 30 },
        { key: 'website_grid_rsvps', label: 'Photo — RSVPs', kind: 'text', max: 30 },
        { key: 'website_grid_travel_info', label: 'Photo — Travel Info', kind: 'text', max: 30 },
      ],
    },
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
