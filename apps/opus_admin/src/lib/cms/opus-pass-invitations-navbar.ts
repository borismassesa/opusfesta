// Schema / fallback for the OpusPass public navbar's INVITATIONS mega-menu.
// These strings used to live in the "Site UI" navbar area; they now belong to
// the Invitations product CMS group so the people who own that product own its
// nav copy. Stored as one website_page_sections row:
//   page_key 'opus-pass-invitations', section_key 'navbar'.
//
// The public navbar (apps/opus_pass) merges this row with the other product
// navbar rows + the shared chrome row back into one 'navbar' namespace at read
// time (see apps/opus_pass/src/lib/cms/ui-strings.ts NAVBAR_SOURCES).
//
// Fallback English values + labels/maxes are preserved verbatim from the
// original UI_STRINGS_SCHEMA/UI_STRINGS_FALLBACK navbar groups.

import type { MaybeLocalized } from '@/lib/cms/localized'
import type { CopyFieldGroup } from '@/lib/cms/opus-pass-dashboard-copy'

export const INVITATIONS_NAVBAR_PAGE_KEY = 'opus-pass-invitations'
export const NAVBAR_SECTION_KEY = 'navbar'

export const INVITATIONS_NAVBAR_FALLBACK: Record<string, MaybeLocalized> = {
  nav_invitations: 'Invitations',
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
}

export const INVITATIONS_NAVBAR_SCHEMA: CopyFieldGroup[] = [
  {
    legend: 'Top nav label',
    fields: [{ key: 'nav_invitations', label: 'Invitations', kind: 'text', max: 40 }],
  },
  {
    legend: 'Mega-menu card',
    fields: [
      { key: 'mega_inv_title', label: 'Card title', kind: 'text', max: 40 },
      { key: 'mega_inv_desc', label: 'Card description', kind: 'textarea', max: 160 },
      { key: 'mega_inv_cta', label: 'Card link', kind: 'text', max: 40 },
    ],
  },
  {
    legend: 'Columns & links',
    fields: [
      { key: 'inv_col_browse', label: 'Browse column heading', kind: 'text', max: 30 },
      { key: 'inv_col_resources', label: 'Resources column heading', kind: 'text', max: 30 },
      { key: 'inv_link_all_designs', label: 'Link — All Designs', kind: 'text', max: 40 },
      { key: 'inv_link_save_the_dates', label: 'Link — Save the Dates', kind: 'text', max: 40 },
      { key: 'inv_link_wedding', label: 'Link — Wedding Invitations', kind: 'text', max: 40 },
      { key: 'inv_link_send_off', label: 'Link — Send-Off & Kitchen Party', kind: 'text', max: 40 },
      { key: 'inv_link_kadi', label: 'Link — Kadi za Michango', kind: 'text', max: 40 },
      { key: 'inv_link_wording', label: 'Link — Invitation Wording', kind: 'text', max: 40 },
      { key: 'inv_link_rsvp_wording', label: 'Link — RSVP Wording Ideas', kind: 'text', max: 40 },
    ],
  },
  {
    legend: 'Photo grid',
    fields: [
      { key: 'inv_grid_title', label: 'Photo grid heading', kind: 'text', max: 30 },
      { key: 'inv_grid_guest_list', label: 'Photo — Guest List', kind: 'text', max: 30 },
      { key: 'inv_grid_rsvp_tracking', label: 'Photo — RSVP Tracking', kind: 'text', max: 30 },
      { key: 'inv_grid_invitations', label: 'Photo — Invitations', kind: 'text', max: 30 },
      { key: 'inv_grid_seating_plan', label: 'Photo — Seating Plan', kind: 'text', max: 30 },
    ],
  },
]
