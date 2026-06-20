// PURE module (no next/headers, no server-only imports) for the OpusPass
// "Site UI" microcopy CMS — the editable, bilingual strings on the site chrome
// (navbar + footer). Because it's pure, BOTH the server loader
// (./ui-strings.ts) and the client provider
// (@/components/providers/UIStringsProvider) import the types + the English
// fallback values from here, without crossing the import-type boundary that
// guards the loader.
//
// Admin write side mirrors these values in
// apps/opus_admin/src/lib/cms/opus-pass-ui-strings.ts (dual-type convention —
// the two apps duplicate CMS types/fallbacks, no shared package).

export type UiArea = 'navbar' | 'footer'

// One CMS page row per area; section_key is always 'copy'.
//
// NOTE: for the navbar, 'opus-pass-ui-navbar' is now only the SHARED chrome
// source (auth buttons + mobile menu controls). The product-specific mega-menu
// strings live alongside each product's own CMS group and are MERGED at read
// time — see NAVBAR_SOURCES below + loadUiStrings('navbar') in ./ui-strings.ts.
export const UI_STRINGS_PAGE_KEY: Record<UiArea, string> = {
  navbar: 'opus-pass-ui-navbar',
  footer: 'opus-pass-ui-footer',
}

// The public navbar reads ONE merged 'navbar' namespace, but its keys are now
// authored across four CMS rows: each product's own mega-menu (edited inside
// that product's CMS group) plus the shared navbar chrome (Site UI). The loader
// queries every (page_key, section_key) pair below and Object.assigns them into
// one map, then overlays it onto the canonical English fallback. Order is
// product groups first, shared chrome last (no key overlap, so order is
// cosmetic — kept stable for predictability).
export const NAVBAR_SOURCES: { pageKey: string; sectionKey: string }[] = [
  { pageKey: 'opus-pass-invitations', sectionKey: 'navbar' },
  { pageKey: 'opus-pass-guests', sectionKey: 'navbar' },
  { pageKey: 'opus-pass-websites', sectionKey: 'navbar' },
  { pageKey: 'opus-pass-ui-navbar', sectionKey: 'copy' },
]

// Flat string interfaces — every key resolves to a plain string for consumers.
export interface NavbarStrings {
  // Top-level nav labels (also the mobile menu rows)
  nav_invitations: string
  nav_guests: string
  nav_website: string
  // Invitations mega-menu — featured card
  mega_inv_title: string
  mega_inv_desc: string
  mega_inv_cta: string
  // Invitations mega-menu — column headings
  inv_col_browse: string
  inv_col_resources: string
  // Invitations mega-menu — Browse links
  inv_link_all_designs: string
  inv_link_save_the_dates: string
  inv_link_wedding: string
  inv_link_send_off: string
  inv_link_kadi: string
  // Invitations mega-menu — Resources links
  inv_link_wording: string
  inv_link_rsvp_wording: string
  // Invitations mega-menu — photo grid
  inv_grid_title: string
  inv_grid_guest_list: string
  inv_grid_rsvp_tracking: string
  inv_grid_invitations: string
  inv_grid_seating_plan: string
  // Guests mega-menu — featured card
  mega_guests_title: string
  mega_guests_desc: string
  mega_guests_cta: string
  // Guests mega-menu — column headings
  guests_col_manage: string
  guests_col_resources: string
  // Guests mega-menu — Manage links
  guests_link_list_manager: string
  guests_link_rsvp_tracking: string
  guests_link_whatsapp_sms: string
  guests_link_seating: string
  // Guests mega-menu — Resources links
  guests_link_rsvp_wording: string
  guests_link_etiquette: string
  // Guests mega-menu — photo grid
  guests_grid_title: string
  guests_grid_guest_list: string
  guests_grid_rsvp_tracking: string
  guests_grid_invitations: string
  guests_grid_seating_plan: string
  // Website mega-menu — featured card
  mega_website_title: string
  mega_website_desc: string
  mega_website_cta: string
  // Website mega-menu — column headings
  website_col_features: string
  website_col_resources: string
  // Website mega-menu — Features links
  website_link_free_site: string
  website_link_custom_link: string
  website_link_templates: string
  website_link_rsvp_collection: string
  website_link_venue_travel: string
  // Website mega-menu — Resources links
  website_link_examples: string
  website_link_gallery_tips: string
  website_link_sharing: string
  // Website mega-menu — photo grid
  website_grid_title: string
  website_grid_templates: string
  website_grid_photo_gallery: string
  website_grid_rsvps: string
  website_grid_travel_info: string
  // Auth buttons
  auth_login: string
  auth_signup: string
  auth_dashboard: string
  // Mobile menu controls
  mobile_back: string
  mobile_open: string
  mobile_close: string
}

export interface FooterStrings {
  // Column headings
  col_products: string
  col_templates: string
  col_help: string
  col_company: string
  // Product links
  link_invitations: string
  link_guests: string
  link_website: string
  // Template links
  link_save_the_dates: string
  link_wedding_invitations: string
  link_send_off: string
  link_kadi_michango: string
  // Help links
  link_help_centre: string
  link_how_it_works: string
  link_pricing: string
  link_contact: string
  // Company links
  link_about: string
  link_careers: string
  link_press: string
  link_status: string
  // Legal
  legal_terms: string
  legal_privacy: string
  legal_cookies: string
  legal_copyright: string
  // Copyright
  copyright: string
}

export type UiStringsByArea = {
  navbar: NavbarStrings
  footer: FooterStrings
}

export const UI_STRINGS_FALLBACKS: { navbar: NavbarStrings; footer: FooterStrings } = {
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
