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

export type UiArea = 'navbar' | 'footer' | 'help' | 'pricing' | 'how-it-works'

// One CMS page row per area; section_key is always 'copy'.
//
// NOTE: for the navbar, 'opus-pass-ui-navbar' is now only the SHARED chrome
// source (auth buttons + mobile menu controls). The product-specific mega-menu
// strings live alongside each product's own CMS group and are MERGED at read
// time — see NAVBAR_SOURCES below + loadUiStrings('navbar') in ./ui-strings.ts.
// The content-page areas (help / pricing / how-it-works) use the generic
// single-row path in loadUiStrings (no merge).
export const UI_STRINGS_PAGE_KEY: Record<UiArea, string> = {
  navbar: 'opus-pass-ui-navbar',
  footer: 'opus-pass-ui-footer',
  help: 'opus-pass-ui-help',
  pricing: 'opus-pass-ui-pricing',
  'how-it-works': 'opus-pass-ui-how-it-works',
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

// ── Help page ────────────────────────────────────────────────────────────────
export interface HelpStrings {
  // Header
  eyebrow: string
  title: string
  intro: string
  // Topic cards (6) — each: title, body, cta
  topic_getting_started_title: string
  topic_getting_started_body: string
  topic_getting_started_cta: string
  topic_pricing_title: string
  topic_pricing_body: string
  topic_pricing_cta: string
  topic_invitations_title: string
  topic_invitations_body: string
  topic_invitations_cta: string
  topic_guests_title: string
  topic_guests_body: string
  topic_guests_cta: string
  topic_website_title: string
  topic_website_body: string
  topic_website_cta: string
  topic_contact_title: string
  topic_contact_body: string
  topic_contact_cta: string
  // FAQ section
  faq_title: string
  faq_intro: string
  // FAQs (8) — each: q + a
  faq_create_event_q: string
  faq_create_event_a: string
  faq_cost_q: string
  faq_cost_a: string
  faq_payment_methods_q: string
  faq_payment_methods_a: string
  faq_guest_experience_q: string
  faq_guest_experience_a: string
  faq_rsvp_tracking_q: string
  faq_rsvp_tracking_a: string
  faq_paper_q: string
  faq_paper_a: string
  faq_change_details_q: string
  faq_change_details_a: string
  faq_support_speed_q: string
  faq_support_speed_a: string
  // Contact CTA
  cta_title: string
  cta_body: string
  cta_contact: string
  cta_whatsapp: string
}

// ── Pricing page ─────────────────────────────────────────────────────────────
export interface PricingStrings {
  // Hero
  hero_title: string
  hero_subtitle: string
  // Tier badges
  badge_basic: string
  badge_popular: string
  badge_premium: string
  badge_luxury: string
  // Tier card chrome
  per_guest_suffix: string
  choose_prefix: string
  // Included section
  included_title: string
  upgrades_title: string
  upgrades_intro: string
  // Comparison cell aria labels
  value_included: string
  value_not_included: string
  // Ways to pay
  pay_title: string
  pay_intro: string
  // Security
  security_encrypted: string
  security_receipt: string
  // Sidebar (FAQ aside)
  faq_title: string
  faq_intro: string
  contact_cta: string
  help_link: string
  // FAQs (4) — each: q + a
  faq_how_charged_q: string
  faq_how_charged_a: string
  faq_large_events_q: string
  faq_large_events_a: string
  faq_payment_q: string
  faq_payment_a: string
  faq_paper_q: string
  faq_paper_a: string
}

// ── How it works page ────────────────────────────────────────────────────────
export interface HowItWorksStrings {
  // Header
  eyebrow: string
  title: string
  intro: string
  // Process steps (4) — each: title + body
  step_list_title: string
  step_list_body: string
  step_send_title: string
  step_send_body: string
  step_replies_title: string
  step_replies_body: string
  step_checkin_title: string
  step_checkin_body: string
  // Guest features section
  guest_section_title: string
  guest_section_intro: string
  // Guest features (3) — each: title + body
  guest_card_title: string
  guest_card_body: string
  guest_reminders_title: string
  guest_reminders_body: string
  guest_entry_title: string
  guest_entry_body: string
  // CTAs
  cta_primary: string
  cta_secondary: string
}

export type UiStringsByArea = {
  navbar: NavbarStrings
  footer: FooterStrings
  help: HelpStrings
  pricing: PricingStrings
  'how-it-works': HowItWorksStrings
}

export const UI_STRINGS_FALLBACKS: UiStringsByArea = {
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
  help: {
    eyebrow: 'Help Centre',
    title: 'How can we help?',
    intro:
      'Answers about invitations, RSVPs, payments and your wedding website — plus a direct line to our team when you need a person.',
    topic_getting_started_title: 'Getting started',
    topic_getting_started_body:
      'Create your event, build a guest list and send your first invitation in minutes.',
    topic_getting_started_cta: 'See how it works',
    topic_pricing_title: 'Pricing & payments',
    topic_pricing_body:
      'Per-guest packages, what each one includes, and the mobile-money and card options we accept.',
    topic_pricing_cta: 'View pricing',
    topic_invitations_title: 'Invitations & cards',
    topic_invitations_body:
      'Choose a design, customise your wording, preview a proof and deliver by WhatsApp or SMS.',
    topic_invitations_cta: 'Browse designs',
    topic_guests_title: 'Guests & RSVPs',
    topic_guests_body:
      'Track confirmations live, send reminders and scan tickets at the door on the day.',
    topic_guests_cta: 'Explore guest tools',
    topic_website_title: 'Wedding website',
    topic_website_body:
      'Share your story, schedule, venue map and a bilingual RSVP page on a personal site.',
    topic_website_cta: 'See websites',
    topic_contact_title: 'Contact support',
    topic_contact_body:
      'Still stuck? Reach the team by email or WhatsApp and we’ll reply within one business day.',
    topic_contact_cta: 'Get in touch',
    faq_title: 'Popular questions',
    faq_intro:
      'The things couples ask us most. Can’t find your answer? We’re one message away.',
    faq_create_event_q: 'How do I create my event and start inviting guests?',
    faq_create_event_a:
      'Sign in, open your dashboard and create an event with your names, date and venue. Add guests by typing them in or pasting from a spreadsheet, then send each one a personal invitation link by WhatsApp, SMS or email — replies land in your dashboard live.',
    faq_cost_q: 'How much does OpusPass cost?',
    faq_cost_a:
      'Pricing is per guest, and you choose from four packages — Essential, Classic, Elegant and Signature — so the price scales with your headcount. Every package includes the digital card, ticket, delivery and door check-in. See the Pricing page for the full breakdown and what each tier adds.',
    faq_payment_methods_q: 'What payment methods can my guests and I use?',
    faq_payment_methods_a:
      'We accept M-Pesa, Airtel Money, Mixx by Yas and Selcom Pesa, plus Visa and Mastercard. Contribution collection (where guests pledge straight into one event account) is available on the Classic, Elegant and Signature packages.',
    faq_guest_experience_q: 'What does a guest receive?',
    faq_guest_experience_a:
      'Each guest gets a digital invitation card with all your event details and a personal ticket with a unique barcode. They RSVP on a private bilingual page (English & Kiswahili), and on the day their ticket is scanned at the entrance to verify entry.',
    faq_rsvp_tracking_q: 'Can I see who has confirmed and who has arrived?',
    faq_rsvp_tracking_a:
      'Yes. Your RSVP dashboard shows live confirmations and headcount, and on the higher packages it tracks check-ins at the door and shows analytics — so you can plan food and seating accurately.',
    faq_paper_q: 'Do you still offer printed paper cards?',
    faq_paper_a:
      'Most couples go fully digital with a small print run for elders and VIPs. Paper card prints are available as an add-on on any package — just ask and we’ll arrange printing and delivery within Tanzania.',
    faq_change_details_q: 'What if my venue or time changes after I’ve invited everyone?',
    faq_change_details_a:
      'You can message all guests at once from your dashboard — invitations, reminders or quick updates such as a venue or time change reach everyone instantly by WhatsApp or SMS.',
    faq_support_speed_q: 'How quickly does support reply?',
    faq_support_speed_a:
      'We reply to email and WhatsApp within one business day, and usually much faster during office hours. Reach us any time via the Contact page.',
    cta_title: 'Still need a hand?',
    cta_body: 'Our team is based in Dar es Salaam and replies within one business day.',
    cta_contact: 'Contact us',
    cta_whatsapp: 'Chat on WhatsApp',
  },
  pricing: {
    hero_title: 'Simple pricing, per guest.',
    hero_subtitle:
      'Choose the package that fits your celebration. Everything scales with your headcount — no setup fees, no surprises.',
    badge_basic: 'Basic',
    badge_popular: 'Most popular',
    badge_premium: 'Premium',
    badge_luxury: 'Luxury',
    per_guest_suffix: '/ guest',
    choose_prefix: 'Choose',
    included_title: 'Included in every package',
    upgrades_title: 'What the higher tiers add',
    upgrades_intro: 'Compare what each package unlocks beyond the essentials.',
    value_included: 'Included',
    value_not_included: 'Not included',
    pay_title: 'Ways to pay',
    pay_intro:
      'Pay by mobile money or card — in full or in instalments. Every payment is encrypted and handled by our trusted payment partners.',
    security_encrypted:
      'Card and mobile-money details are encrypted end-to-end and processed directly by the provider — OpusPass never sees or stores them.',
    security_receipt:
      'Each transaction is confirmed instantly with a receipt, and contributions go straight into one secure event account you control.',
    faq_title: 'Pricing questions',
    faq_intro:
      'Everything about how billing works. Still curious about something? We’re happy to talk it through.',
    contact_cta: 'Contact us',
    help_link: 'Visit the Help Centre',
    faq_how_charged_q: 'How is the price calculated?',
    faq_how_charged_a:
      'Pricing is per guest. Pick a package, enter your guest count, and the total is simply the per-guest rate times your headcount — so a smaller event costs less and a larger one scales predictably.',
    faq_large_events_q: 'What about very large events?',
    faq_large_events_a:
      'Events above 600 guests get a capped, discounted per-guest rate. Reach out and we’ll confirm the exact figure for your headcount.',
    faq_payment_q: 'What payment methods do you accept?',
    faq_payment_a:
      'M-Pesa, Airtel Money, Mixx by Yas and Selcom Pesa, plus Visa and Mastercard. You can pay in full or split into instalments.',
    faq_paper_q: 'Is paper printing included?',
    faq_paper_a:
      'OpusPass is digital-first, so paper isn’t included by default. Paper card prints are an add-on on any package — we arrange printing and delivery within Tanzania on request.',
  },
  'how-it-works': {
    eyebrow: 'How it works',
    title: 'From first invite to final toast.',
    intro:
      'No more chasing replies in WhatsApp groups. Send once, track everywhere — and arrive on the day knowing exactly who’s coming.',
    step_list_title: 'Build your list',
    step_list_body:
      'Create your event, then type names in or paste from a spreadsheet. Group by family, side or table.',
    step_send_title: 'Send by WhatsApp or SMS',
    step_send_body:
      'One-tap send. Each guest gets a personal link, an animated digital card and their own ticket.',
    step_replies_title: 'Watch replies live',
    step_replies_body:
      'Joyful yeses, regrets and meal picks land in your dashboard instantly — in English or Kiswahili.',
    step_checkin_title: 'Plan & check in',
    step_checkin_body:
      'Arrange seating, send reminders, then scan tickets at the door to verify every guest on the day.',
    guest_section_title: 'What every guest gets',
    guest_section_intro: 'The experience is built for them too — not just for you.',
    guest_card_title: 'A card and a ticket',
    guest_card_body:
      'Every guest receives a digital invitation with all your details plus a personal ticket with a unique barcode.',
    guest_reminders_title: 'Gentle reminders',
    guest_reminders_body:
      'Automatic nudges before the day help guests confirm and cut down no-shows — no chasing in group chats.',
    guest_entry_title: 'Fast entry',
    guest_entry_body:
      'At the gate their ticket is scanned to verify entry — stopping fake invitees and keeping the line moving.',
    cta_primary: 'Start your guest list',
    cta_secondary: 'See pricing',
  },
}
