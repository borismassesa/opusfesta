// Schema / fallback for the OpusPass public navbar's WEDDING WEBSITE mega-menu.
// Moved out of the "Site UI" navbar area into the Wedding Website product CMS
// group. Stored as one website_page_sections row:
//   page_key 'opus-pass-websites', section_key 'navbar'.
//
// Merged back into the public 'navbar' namespace at read time — see
// apps/opus_pass/src/lib/cms/ui-strings.ts NAVBAR_SOURCES.
//
// Fallback English values + labels/maxes preserved verbatim from the original
// UI_STRINGS_SCHEMA/UI_STRINGS_FALLBACK navbar groups.

import type { MaybeLocalized } from '@/lib/cms/localized'
import type { CopyFieldGroup } from '@/lib/cms/opus-pass-dashboard-copy'

export const WEBSITE_NAVBAR_PAGE_KEY = 'opus-pass-websites'
export const NAVBAR_SECTION_KEY = 'navbar'

export const WEBSITE_NAVBAR_FALLBACK: Record<string, MaybeLocalized> = {
  nav_website: 'Wedding Website',
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
}

export const WEBSITE_NAVBAR_SCHEMA: CopyFieldGroup[] = [
  {
    legend: 'Top nav label',
    fields: [{ key: 'nav_website', label: 'Wedding Website', kind: 'text', max: 40 }],
  },
  {
    legend: 'Mega-menu card',
    fields: [
      { key: 'mega_website_title', label: 'Card title', kind: 'text', max: 40 },
      { key: 'mega_website_desc', label: 'Card description', kind: 'textarea', max: 160 },
      { key: 'mega_website_cta', label: 'Card link', kind: 'text', max: 40 },
    ],
  },
  {
    legend: 'Columns & links',
    fields: [
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
    ],
  },
  {
    legend: 'Photo grid',
    fields: [
      { key: 'website_grid_title', label: 'Photo grid heading', kind: 'text', max: 30 },
      { key: 'website_grid_templates', label: 'Photo — Templates', kind: 'text', max: 30 },
      { key: 'website_grid_photo_gallery', label: 'Photo — Photo Gallery', kind: 'text', max: 30 },
      { key: 'website_grid_rsvps', label: 'Photo — RSVPs', kind: 'text', max: 30 },
      { key: 'website_grid_travel_info', label: 'Photo — Travel Info', kind: 'text', max: 30 },
    ],
  },
]
