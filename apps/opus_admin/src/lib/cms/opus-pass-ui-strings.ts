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

export type UiArea =
  | 'navbar'
  | 'footer'
  | 'help'
  | 'pricing'
  | 'how-it-works'
  | 'cart'
  | 'address'
  | 'confirmation'
  | 'checkout-form'
  | 'checkout-payment'
  | 'checkout-summary'

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
  help: 'opus-pass-ui-help',
  pricing: 'opus-pass-ui-pricing',
  'how-it-works': 'opus-pass-ui-how-it-works',
  cart: 'opus-pass-ui-cart',
  address: 'opus-pass-ui-address',
  confirmation: 'opus-pass-ui-confirmation',
  'checkout-form': 'opus-pass-ui-checkout-form',
  'checkout-payment': 'opus-pass-ui-checkout-payment',
  'checkout-summary': 'opus-pass-ui-checkout-summary',
}

export const UI_STRINGS_LABEL: Record<UiArea, string> = {
  navbar: 'Navbar (shared)',
  footer: 'Footer',
  help: 'Help page',
  pricing: 'Pricing page',
  'how-it-works': 'How it works page',
  cart: 'Cart',
  address: 'Delivery address',
  confirmation: 'Order confirmation',
  'checkout-form': 'Checkout — form',
  'checkout-payment': 'Checkout — payment',
  'checkout-summary': 'Checkout — summary',
}

// Navbar + footer appear on every public page; the home page ('/') is the
// canonical surface to "view live". The content areas point at their own route.
export const UI_STRINGS_PUBLIC_PATH: Record<UiArea, string> = {
  navbar: '/',
  footer: '/',
  help: '/help',
  pricing: '/pricing',
  'how-it-works': '/how-it-works',
  cart: '/invitations/cart',
  address: '/invitations/address',
  confirmation: '/invitations/confirmation',
  'checkout-form': '/invitations/checkout',
  'checkout-payment': '/invitations/checkout',
  'checkout-summary': '/invitations/checkout',
}

export const UI_STRINGS_AREAS: readonly UiArea[] = [
  'navbar',
  'footer',
  'help',
  'pricing',
  'how-it-works',
  'cart',
  'address',
  'confirmation',
  'checkout-form',
  'checkout-payment',
  'checkout-summary',
] as const

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
  cart: {
    back_to_designs: '← Back to designs',
    cart_title: 'Your Cart',
    count_one: '{n} item in cart',
    count_other: '{n} items in cart',
    item_delivered: 'Delivered within 24 hours',
    item_package_suffix: '{tier} Package',
    remove_aria: 'Remove {name}',
    remove_confirm: 'Remove this design from your cart?',
    remove_cancel: 'Cancel',
    remove_confirm_cta: 'Remove',
    guests_fewer: 'Fewer guests',
    guests_more: 'More guests',
    guests_input_aria: 'Number of guests',
    guests_label: 'Guests',
    empty_title: 'Your cart is empty.',
    empty_body: 'Browse invitation designs and add one to get started.',
    empty_cta: 'Browse designs',
    coupon_title: 'Apply Coupon',
    coupon_subtitle: 'Have a promo code?',
    coupon_placeholder: 'Coupon code',
    coupon_apply: 'Apply',
    coupon_none_active: 'No promo codes are active right now.',
    coupon_none_active_desc: 'Check back later — discounts will apply here automatically.',
    price_title: 'Price Details',
    price_label: 'Price',
    discount_label: 'Discount',
    delivery_label: 'Delivery Charges',
    delivery_free: 'Free Delivery',
    total_label: 'Total',
    checkout_cta: 'Continue to checkout',
    we_accept: 'We accept:',
    secure_note: 'Secure checkout · designs delivered within 24 hours',
    explore_title_has: 'You might also like',
    explore_title_empty: 'Explore invitation designs',
    explore_subtitle_has: 'More designs in the styles you’re shopping.',
    explore_subtitle_empty: 'Popular designs to get you started.',
    explore_view_all: 'View all',
    mobile_count_one: '{n} item',
    mobile_count_other: '{n} items',
    mobile_checkout: 'Checkout',
  },
  address: {
    back_to_cart: '← Back to cart',
    header_title: 'How should we deliver?',
    header_desc:
      'Every order includes your digital invitation, sent via WhatsApp and email. Add printed cards to have them mailed to you too.',
    mode_digital_title: 'Digital delivery',
    mode_digital_caption: 'Sent via WhatsApp, SMS, and email within 24 hours of payment.',
    mode_print_title: 'Digital + printed cards',
    mode_print_caption:
      'Everything digital, plus high-quality prints mailed to your address in 7–14 days.',
    label_full_name: 'Full name',
    placeholder_full_name: 'Mary Mwakasege',
    label_email: 'Email address',
    placeholder_email: 'mary@example.com',
    label_phone: 'WhatsApp / phone number',
    placeholder_phone: '+255 7xx xxx xxx',
    label_city: 'City / region',
    label_street: 'Street address',
    placeholder_street: 'House number, street, building name…',
    label_notes: 'Delivery notes',
    placeholder_notes: 'Gate code, landmarks, best time to call…',
    error_full_name: 'Please enter your full name.',
    error_email: 'Enter a valid email address.',
    error_phone: 'Enter a valid phone number.',
    error_street: 'Please enter your mailing address.',
    continue_cta: 'Continue to payment',
    expect_title: 'What to expect',
    expect_confirmation: 'Instant order confirmation in your inbox',
    expect_personalised: 'Your design personalised by our team within 24 hours',
    expect_revisions: 'One free round of revisions to get every detail right',
    expect_link: 'A shareable invitation link for WhatsApp, SMS & email',
    expect_rsvp: 'Live RSVP tracking as your guests respond',
    expect_ticket:
      'An OpusPass ticket with QR code — save it to Apple or Google Wallet and scan at the entrance',
    expect_print: 'High-quality printed cards mailed to you in 7–14 days',
  },
  confirmation: {
    empty_title: 'No recent order found.',
    empty_body: 'Once you complete a purchase, your confirmation will appear here.',
    empty_cta: 'Browse designs',
    success_heading_verifying: 'Asante — we’ve received your order',
    success_heading_confirmed: 'Thank you — your order is confirmed',
    success_body_verifying:
      'The OpusFesta team is verifying your payment{refClause}. Once confirmed, we’ll email your receipt to {email} and your design goes live within 24 hours.',
    success_body_confirmed:
      'We’ve emailed your receipt to {email}. Your design goes live within 24 hours.',
    status_verifying_title: 'Payment Under Review',
    status_confirmed_title: 'Payment Confirmed',
    status_verifying_body: 'Your payment has been received and is being verified.',
    status_paid_via: 'Paid via {provider}',
    status_reference_label: 'Reference:',
    status_verifying_eta: 'Usually verified within 15 minutes.',
    status_method_label: 'Method',
    status_method_lipa_namba: 'M-Pesa Lipa Namba',
    status_business_number_label: 'Business Number',
    status_payer_label: 'Payer',
    status_phone_label: 'Phone',
    status_payment_label: 'Payment',
    status_details_summary: 'Payment details',
    order_title: 'Your order',
    meta_delivery_date: 'Delivery date',
    meta_order_id: 'Order ID',
    meta_payment_method: 'Payment method',
    item_package_suffix: '{tier} Package',
    item_delivered: 'Delivered within 24 hours',
    item_guests_label: 'Guests',
    next_title: 'What happens next',
    next_personalise_title: 'We personalise your design',
    next_personalise_body:
      'Our team tailors your invitation with your details, ready within 24 hours.',
    next_proof_title: 'You review a proof',
    next_proof_body:
      'We send a proof for your approval — one free round of revisions is included.',
    next_share_title: 'Share & check in',
    next_share_body:
      'Get a shareable link plus OpusPass tickets with QR codes for entrance scanning.',
    summary_title: 'Payment summary',
    summary_price: 'Price',
    summary_discount: 'Discount',
    summary_delivery: 'Delivery charges',
    summary_delivery_free: 'Free delivery',
    summary_total: 'Total',
    summary_total_paid: 'Total paid',
    download_invoice: 'Download invoice',
    browse_more: 'Browse more designs',
    back_to_invitations: 'Back to invitations',
    delivered_note: 'Designs delivered within 24 hours',
    badge_card: 'Card',
    celebration_aria: 'Celebration',
  },
  'checkout-form': {
    back_to_contact: '← Back to contact details',
    page_title: 'Payment',
    block_title: "We can't process this yet",
    block_add_contact_cta: 'Add one →',
    recap_delivering_to: 'Delivering to',
    recap_edit: 'Edit',
    payer_name_label: 'Name on the account that paid',
    payer_name_placeholder: 'e.g. Mary Mwakasege',
    payer_name_hint:
      'The account holder name the payment came from — as registered with the mobile network or bank.',
    phone_label_lipa: 'Your phone number to confirm your payment',
    phone_label_push: '{provider} phone number',
    phone_placeholder: '+255 7xx xxx xxx',
    phone_hint_push: "You'll get a prompt on your phone to approve the payment.",
    payref_label: 'Transaction reference number',
    payref_placeholder: 'e.g. 9XJ45KQ2RT',
    payref_hint:
      'The confirmation code in the SMS you received after paying. The OpusFesta team uses it to verify your payment.',
    error_cart_empty: 'Your cart is empty — add a design before paying.',
    error_contact_missing: 'Please add your contact details before paying.',
    error_phone: 'Enter a valid phone number.',
    error_payer_name: 'Enter the name on the account the payment came from.',
    error_payref:
      'Enter the confirmation code from your payment SMS (6–25 letters or numbers).',
  },
  'checkout-payment': {
    choose_title: 'Choose how to pay',
    method_aria: 'Payment method',
    method_mpesa_desc: 'Lipa Namba or QR — pay from any network or bank',
    method_card_desc: 'Visa or Mastercard',
    toggle_push: 'Phone prompt',
    toggle_lipa: 'Lipa Namba',
    push_instructions:
      'Enter your M-Pesa number below and tap {pay}. A prompt pops up on your phone — enter your PIN to approve. We confirm automatically, no codes to copy.',
    push_pay_word: 'Pay',
    lipa_amount_label: 'Amount to send',
    lipa_how_title: 'How to pay',
    lipa_how_subtitle: 'How to pay — choose your network and follow the steps.',
    lipa_network_aria: 'Payment network',
    lipa_dial_prefix_other: 'Open',
    lipa_dial_prefix_dial: 'Dial',
    lipa_qr_note:
      'Or scan the QR code: open the M-Pesa App, tap the QR button, scan the QR image above, then enter the amount and your PIN to complete the payment.',
    step_vodacom_1_do: 'Choose 4',
    step_vodacom_1_detail: 'Pay with M-Pesa',
    step_vodacom_2_do: 'Choose 1',
    step_vodacom_2_detail: 'Pay by phone',
    step_vodacom_3_do: 'Enter Lipa Namba',
    step_vodacom_3_detail: '350298654',
    step_vodacom_4_do: 'Enter amount',
    step_vodacom_4_detail: 'to pay',
    step_vodacom_5_do: 'Enter your PIN',
    step_vodacom_5_detail: 'to confirm the payment',
    step_tigo_1_do: 'Choose 5',
    step_tigo_1_detail: 'PAY BY PHONE',
    step_tigo_2_do: 'Choose 3',
    step_tigo_2_detail: 'Go to other networks',
    step_tigo_3_do: 'Choose 1',
    step_tigo_3_detail: 'M-Pesa',
    step_tigo_4_do: 'Enter M-Pesa Lipa Namba',
    step_tigo_4_detail: '350298654',
    step_tigo_5_do: 'Enter amount',
    step_tigo_5_detail: 'you are paying',
    step_tigo_6_do: 'Enter your PIN',
    step_tigo_6_detail: 'to confirm',
    step_airtel_1_do: 'Choose 5',
    step_airtel_1_detail: 'Pay Bills',
    step_airtel_2_do: 'Choose 1',
    step_airtel_2_detail: 'Pay by phone (All networks)',
    step_airtel_3_do: 'Choose 2',
    step_airtel_3_detail: 'Pay by Voda Lipa',
    step_airtel_4_do: 'Enter amount',
    step_airtel_4_detail: 'of money',
    step_airtel_5_do: 'Enter the reference number',
    step_airtel_5_detail: '350298654',
    step_airtel_6_do: 'Enter your PIN',
    step_airtel_6_detail: 'to confirm',
    step_other_1_do: 'Choose',
    step_other_1_detail: 'PAY BY PHONE',
    step_other_2_do: 'Choose',
    step_other_2_detail: 'Go to other networks',
    step_other_3_do: 'Choose',
    step_other_3_detail: 'M-Pesa',
    step_other_4_do: 'Enter the merchant number',
    step_other_4_detail: '350298654',
    step_other_5_do: 'Enter amount',
    step_other_5_detail: 'to pay',
    step_other_6_do: 'Enter your PIN',
    step_other_6_detail: 'to confirm',
    network_other_name: 'Other networks & banks',
    network_other_dial: "Your network's financial services menu",
    card_title: 'Secure card payment',
    card_body:
      "When you continue, we'll take you to our payment partner's secure page to enter your Visa or Mastercard details and complete 3-D Secure verification. OpusFesta never sees or stores your card number.",
    pay_redirecting: 'Redirecting…',
    pay_awaiting: 'Waiting for approval…',
    pay_processing: 'Processing…',
    pay_card_cta: 'Continue to secure card payment',
    pay_lipa_cta: "I've paid {amount} — submit order",
    pay_push_cta: 'Pay {amount}',
    reassure_lipa:
      'Your order is confirmed once the OpusFesta team verifies the transaction. Your design goes live within 24 hours of confirmation.',
    reassure_card:
      'Card payments are processed securely by our payment partner (3-D Secure). Your design goes live within 24 hours of confirmation.',
    reassure_push:
      'Approve the prompt on your phone to pay. Your design goes live within 24 hours of confirmation.',
    overlay_aria: 'Awaiting payment approval',
    overlay_title: 'Check your phone',
    overlay_body:
      'We sent a payment prompt to {phone}. Enter your M-Pesa PIN to approve {amount}.',
    overlay_waiting: 'Waiting for confirmation…',
    overlay_keep_open: 'Keep this page open — it updates automatically once you approve.',
  },
  'checkout-summary': {
    summary_title: 'Order summary',
    price_label: 'Price',
    discount_label: 'Discount',
    delivery_label: 'Delivery charges',
    delivery_free: 'Free delivery',
    total_label: 'Total',
    ready_title: 'Ready in 24 hours',
    ready_body:
      'Your personalised design and OpusPass tickets are delivered within a day of payment.',
    revision_title: 'One free revision',
    revision_body:
      "We'll fine-tune the details until your invitation looks just right.",
    secure_note: 'Your payment details are encrypted and processed securely.',
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
  help: [
    {
      legend: 'Header',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', kind: 'text', max: 40 },
        { key: 'title', label: 'Heading', kind: 'text', max: 80 },
        { key: 'intro', label: 'Intro paragraph', kind: 'textarea', max: 240 },
      ],
    },
    {
      legend: 'Topic cards',
      fields: [
        { key: 'topic_getting_started_title', label: 'Getting started — title', kind: 'text', max: 40 },
        { key: 'topic_getting_started_body', label: 'Getting started — body', kind: 'textarea', max: 200 },
        { key: 'topic_getting_started_cta', label: 'Getting started — link', kind: 'text', max: 40 },
        { key: 'topic_pricing_title', label: 'Pricing & payments — title', kind: 'text', max: 40 },
        { key: 'topic_pricing_body', label: 'Pricing & payments — body', kind: 'textarea', max: 200 },
        { key: 'topic_pricing_cta', label: 'Pricing & payments — link', kind: 'text', max: 40 },
        { key: 'topic_invitations_title', label: 'Invitations & cards — title', kind: 'text', max: 40 },
        { key: 'topic_invitations_body', label: 'Invitations & cards — body', kind: 'textarea', max: 200 },
        { key: 'topic_invitations_cta', label: 'Invitations & cards — link', kind: 'text', max: 40 },
        { key: 'topic_guests_title', label: 'Guests & RSVPs — title', kind: 'text', max: 40 },
        { key: 'topic_guests_body', label: 'Guests & RSVPs — body', kind: 'textarea', max: 200 },
        { key: 'topic_guests_cta', label: 'Guests & RSVPs — link', kind: 'text', max: 40 },
        { key: 'topic_website_title', label: 'Wedding website — title', kind: 'text', max: 40 },
        { key: 'topic_website_body', label: 'Wedding website — body', kind: 'textarea', max: 200 },
        { key: 'topic_website_cta', label: 'Wedding website — link', kind: 'text', max: 40 },
        { key: 'topic_contact_title', label: 'Contact support — title', kind: 'text', max: 40 },
        { key: 'topic_contact_body', label: 'Contact support — body', kind: 'textarea', max: 200 },
        { key: 'topic_contact_cta', label: 'Contact support — link', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'FAQ section',
      fields: [
        { key: 'faq_title', label: 'Section title', kind: 'text', max: 60 },
        { key: 'faq_intro', label: 'Section intro', kind: 'textarea', max: 200 },
      ],
    },
    {
      legend: 'FAQs',
      fields: [
        { key: 'faq_create_event_q', label: 'Create event — question', kind: 'text', max: 160 },
        { key: 'faq_create_event_a', label: 'Create event — answer', kind: 'textarea', max: 600 },
        { key: 'faq_cost_q', label: 'Cost — question', kind: 'text', max: 160 },
        { key: 'faq_cost_a', label: 'Cost — answer', kind: 'textarea', max: 600 },
        { key: 'faq_payment_methods_q', label: 'Payment methods — question', kind: 'text', max: 160 },
        { key: 'faq_payment_methods_a', label: 'Payment methods — answer', kind: 'textarea', max: 600 },
        { key: 'faq_guest_experience_q', label: 'Guest experience — question', kind: 'text', max: 160 },
        { key: 'faq_guest_experience_a', label: 'Guest experience — answer', kind: 'textarea', max: 600 },
        { key: 'faq_rsvp_tracking_q', label: 'RSVP tracking — question', kind: 'text', max: 160 },
        { key: 'faq_rsvp_tracking_a', label: 'RSVP tracking — answer', kind: 'textarea', max: 600 },
        { key: 'faq_paper_q', label: 'Paper cards — question', kind: 'text', max: 160 },
        { key: 'faq_paper_a', label: 'Paper cards — answer', kind: 'textarea', max: 600 },
        { key: 'faq_change_details_q', label: 'Change details — question', kind: 'text', max: 160 },
        { key: 'faq_change_details_a', label: 'Change details — answer', kind: 'textarea', max: 600 },
        { key: 'faq_support_speed_q', label: 'Support speed — question', kind: 'text', max: 160 },
        { key: 'faq_support_speed_a', label: 'Support speed — answer', kind: 'textarea', max: 600 },
      ],
    },
    {
      legend: 'Contact CTA',
      fields: [
        { key: 'cta_title', label: 'Title', kind: 'text', max: 80 },
        { key: 'cta_body', label: 'Body', kind: 'textarea', max: 200 },
        { key: 'cta_contact', label: 'Contact button', kind: 'text', max: 40 },
        { key: 'cta_whatsapp', label: 'WhatsApp button', kind: 'text', max: 40 },
      ],
    },
  ],
  pricing: [
    {
      legend: 'Hero',
      fields: [
        { key: 'hero_title', label: 'Heading', kind: 'text', max: 80 },
        { key: 'hero_subtitle', label: 'Subtitle', kind: 'textarea', max: 240 },
      ],
    },
    {
      legend: 'Tier badges',
      fields: [
        { key: 'badge_basic', label: 'Essential badge', kind: 'text', max: 30 },
        { key: 'badge_popular', label: 'Most popular badge', kind: 'text', max: 30 },
        { key: 'badge_premium', label: 'Premium badge', kind: 'text', max: 30 },
        { key: 'badge_luxury', label: 'Luxury badge', kind: 'text', max: 30 },
        { key: 'per_guest_suffix', label: 'Per-guest suffix', kind: 'text', max: 20, hint: 'e.g. "/ guest"' },
        { key: 'choose_prefix', label: 'Choose button prefix', kind: 'text', max: 20, hint: 'Prepended to the tier name, e.g. "Choose Classic"' },
      ],
    },
    {
      legend: 'Included section',
      fields: [
        { key: 'included_title', label: 'Included title', kind: 'text', max: 60 },
        { key: 'upgrades_title', label: 'Upgrades title', kind: 'text', max: 60 },
        { key: 'upgrades_intro', label: 'Upgrades intro', kind: 'textarea', max: 160 },
        { key: 'value_included', label: 'Included cell (aria-label)', kind: 'text', max: 30 },
        { key: 'value_not_included', label: 'Not-included cell (aria-label)', kind: 'text', max: 30 },
      ],
    },
    {
      legend: 'Ways to pay',
      fields: [
        { key: 'pay_title', label: 'Title', kind: 'text', max: 40 },
        { key: 'pay_intro', label: 'Intro', kind: 'textarea', max: 240 },
      ],
    },
    {
      legend: 'Security',
      fields: [
        { key: 'security_encrypted', label: 'Encryption note', kind: 'textarea', max: 240 },
        { key: 'security_receipt', label: 'Receipt note', kind: 'textarea', max: 240 },
      ],
    },
    {
      legend: 'Sidebar',
      fields: [
        { key: 'faq_title', label: 'FAQ title', kind: 'text', max: 60 },
        { key: 'faq_intro', label: 'FAQ intro', kind: 'textarea', max: 200 },
        { key: 'contact_cta', label: 'Contact button', kind: 'text', max: 40 },
        { key: 'help_link', label: 'Help Centre link', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'FAQ',
      fields: [
        { key: 'faq_how_charged_q', label: 'How charged — question', kind: 'text', max: 160 },
        { key: 'faq_how_charged_a', label: 'How charged — answer', kind: 'textarea', max: 600 },
        { key: 'faq_large_events_q', label: 'Large events — question', kind: 'text', max: 160 },
        { key: 'faq_large_events_a', label: 'Large events — answer', kind: 'textarea', max: 600 },
        { key: 'faq_payment_q', label: 'Payment methods — question', kind: 'text', max: 160 },
        { key: 'faq_payment_a', label: 'Payment methods — answer', kind: 'textarea', max: 600 },
        { key: 'faq_paper_q', label: 'Paper printing — question', kind: 'text', max: 160 },
        { key: 'faq_paper_a', label: 'Paper printing — answer', kind: 'textarea', max: 600 },
      ],
    },
  ],
  'how-it-works': [
    {
      legend: 'Header',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', kind: 'text', max: 40 },
        { key: 'title', label: 'Heading', kind: 'text', max: 80 },
        { key: 'intro', label: 'Intro paragraph', kind: 'textarea', max: 240 },
      ],
    },
    {
      legend: 'Process steps',
      fields: [
        { key: 'step_list_title', label: 'Step 1 — title', kind: 'text', max: 40 },
        { key: 'step_list_body', label: 'Step 1 — body', kind: 'textarea', max: 200 },
        { key: 'step_send_title', label: 'Step 2 — title', kind: 'text', max: 40 },
        { key: 'step_send_body', label: 'Step 2 — body', kind: 'textarea', max: 200 },
        { key: 'step_replies_title', label: 'Step 3 — title', kind: 'text', max: 40 },
        { key: 'step_replies_body', label: 'Step 3 — body', kind: 'textarea', max: 200 },
        { key: 'step_checkin_title', label: 'Step 4 — title', kind: 'text', max: 40 },
        { key: 'step_checkin_body', label: 'Step 4 — body', kind: 'textarea', max: 200 },
      ],
    },
    {
      legend: 'Guest features',
      fields: [
        { key: 'guest_section_title', label: 'Section title', kind: 'text', max: 60 },
        { key: 'guest_section_intro', label: 'Section intro', kind: 'textarea', max: 160 },
        { key: 'guest_card_title', label: 'Card & ticket — title', kind: 'text', max: 40 },
        { key: 'guest_card_body', label: 'Card & ticket — body', kind: 'textarea', max: 200 },
        { key: 'guest_reminders_title', label: 'Reminders — title', kind: 'text', max: 40 },
        { key: 'guest_reminders_body', label: 'Reminders — body', kind: 'textarea', max: 200 },
        { key: 'guest_entry_title', label: 'Fast entry — title', kind: 'text', max: 40 },
        { key: 'guest_entry_body', label: 'Fast entry — body', kind: 'textarea', max: 200 },
      ],
    },
    {
      legend: 'CTAs',
      fields: [
        { key: 'cta_primary', label: 'Primary button', kind: 'text', max: 40 },
        { key: 'cta_secondary', label: 'Secondary button', kind: 'text', max: 40 },
      ],
    },
  ],
  cart: [
    {
      legend: 'Header',
      fields: [
        { key: 'back_to_designs', label: 'Back link', kind: 'text', max: 40 },
        { key: 'cart_title', label: 'Cart heading', kind: 'text', max: 40 },
        { key: 'count_one', label: 'Item count (singular)', kind: 'text', max: 40, hint: 'Use {n} for the count, e.g. "{n} item in cart"' },
        { key: 'count_other', label: 'Item count (plural)', kind: 'text', max: 40, hint: 'Use {n} for the count, e.g. "{n} items in cart"' },
      ],
    },
    {
      legend: 'Line item',
      fields: [
        { key: 'item_delivered', label: 'Delivery note', kind: 'text', max: 60 },
        { key: 'item_package_suffix', label: 'Package pill', kind: 'text', max: 40, hint: 'Use {tier} for the package name, e.g. "{tier} Package"' },
        { key: 'guests_label', label: 'Guests label', kind: 'text', max: 30 },
      ],
    },
    {
      legend: 'Remove design popover',
      fields: [
        { key: 'remove_aria', label: 'Remove button (aria-label)', kind: 'text', max: 60, hint: 'Use {name} for the design name, e.g. "Remove {name}"' },
        { key: 'remove_confirm', label: 'Confirm prompt', kind: 'text', max: 80 },
        { key: 'remove_cancel', label: 'Cancel button', kind: 'text', max: 30 },
        { key: 'remove_confirm_cta', label: 'Remove button', kind: 'text', max: 30 },
      ],
    },
    {
      legend: 'Guest stepper (aria-labels)',
      fields: [
        { key: 'guests_fewer', label: 'Fewer guests', kind: 'text', max: 30 },
        { key: 'guests_more', label: 'More guests', kind: 'text', max: 30 },
        { key: 'guests_input_aria', label: 'Guest count input', kind: 'text', max: 30 },
      ],
    },
    {
      legend: 'Empty state',
      fields: [
        { key: 'empty_title', label: 'Title', kind: 'text', max: 60 },
        { key: 'empty_body', label: 'Body', kind: 'textarea', max: 160 },
        { key: 'empty_cta', label: 'Button', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Coupon',
      fields: [
        { key: 'coupon_title', label: 'Title', kind: 'text', max: 40 },
        { key: 'coupon_subtitle', label: 'Subtitle', kind: 'text', max: 60 },
        { key: 'coupon_placeholder', label: 'Input placeholder', kind: 'text', max: 40 },
        { key: 'coupon_apply', label: 'Apply button', kind: 'text', max: 30 },
        { key: 'coupon_none_active', label: 'No-codes toast title', kind: 'text', max: 80 },
        { key: 'coupon_none_active_desc', label: 'No-codes toast body', kind: 'textarea', max: 160 },
      ],
    },
    {
      legend: 'Price details',
      fields: [
        { key: 'price_title', label: 'Section title', kind: 'text', max: 40 },
        { key: 'price_label', label: 'Price row', kind: 'text', max: 40 },
        { key: 'discount_label', label: 'Discount row', kind: 'text', max: 40 },
        { key: 'delivery_label', label: 'Delivery row', kind: 'text', max: 40 },
        { key: 'delivery_free', label: 'Free delivery value', kind: 'text', max: 40 },
        { key: 'total_label', label: 'Total row', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Checkout & trust',
      fields: [
        { key: 'checkout_cta', label: 'Checkout button', kind: 'text', max: 40 },
        { key: 'we_accept', label: 'Payment methods label', kind: 'text', max: 40 },
        { key: 'secure_note', label: 'Secure checkout note', kind: 'text', max: 80 },
      ],
    },
    {
      legend: 'Cross-sell',
      fields: [
        { key: 'explore_title_has', label: 'Title (cart has items)', kind: 'text', max: 60 },
        { key: 'explore_title_empty', label: 'Title (cart empty)', kind: 'text', max: 60 },
        { key: 'explore_subtitle_has', label: 'Subtitle (cart has items)', kind: 'text', max: 120 },
        { key: 'explore_subtitle_empty', label: 'Subtitle (cart empty)', kind: 'text', max: 120 },
        { key: 'explore_view_all', label: 'View-all link', kind: 'text', max: 30 },
      ],
    },
    {
      legend: 'Mobile sticky bar',
      fields: [
        { key: 'mobile_count_one', label: 'Item count (singular)', kind: 'text', max: 30, hint: 'Use {n} for the count, e.g. "{n} item"' },
        { key: 'mobile_count_other', label: 'Item count (plural)', kind: 'text', max: 30, hint: 'Use {n} for the count, e.g. "{n} items"' },
        { key: 'mobile_checkout', label: 'Checkout button', kind: 'text', max: 30 },
      ],
    },
  ],
  address: [
    {
      legend: 'Header',
      fields: [
        { key: 'back_to_cart', label: 'Back link', kind: 'text', max: 40 },
        { key: 'header_title', label: 'Heading', kind: 'text', max: 60 },
        { key: 'header_desc', label: 'Description', kind: 'textarea', max: 240 },
      ],
    },
    {
      legend: 'Delivery mode cards',
      fields: [
        { key: 'mode_digital_title', label: 'Digital — title', kind: 'text', max: 40 },
        { key: 'mode_digital_caption', label: 'Digital — caption', kind: 'textarea', max: 160 },
        { key: 'mode_print_title', label: 'Print — title', kind: 'text', max: 40 },
        { key: 'mode_print_caption', label: 'Print — caption', kind: 'textarea', max: 160 },
      ],
    },
    {
      legend: 'Form fields',
      fields: [
        { key: 'label_full_name', label: 'Full name — label', kind: 'text', max: 40 },
        { key: 'placeholder_full_name', label: 'Full name — placeholder', kind: 'text', max: 40 },
        { key: 'label_email', label: 'Email — label', kind: 'text', max: 40 },
        { key: 'placeholder_email', label: 'Email — placeholder', kind: 'text', max: 40 },
        { key: 'label_phone', label: 'Phone — label', kind: 'text', max: 40 },
        { key: 'placeholder_phone', label: 'Phone — placeholder', kind: 'text', max: 40 },
        { key: 'label_city', label: 'City — label', kind: 'text', max: 40 },
        { key: 'label_street', label: 'Street — label', kind: 'text', max: 40 },
        { key: 'placeholder_street', label: 'Street — placeholder', kind: 'text', max: 60 },
        { key: 'label_notes', label: 'Notes — label', kind: 'text', max: 40 },
        { key: 'placeholder_notes', label: 'Notes — placeholder', kind: 'text', max: 60 },
      ],
    },
    {
      legend: 'Validation messages',
      fields: [
        { key: 'error_full_name', label: 'Full name required', kind: 'text', max: 80 },
        { key: 'error_email', label: 'Invalid email', kind: 'text', max: 80 },
        { key: 'error_phone', label: 'Invalid phone', kind: 'text', max: 80 },
        { key: 'error_street', label: 'Address required', kind: 'text', max: 80 },
      ],
    },
    {
      legend: 'Continue',
      fields: [
        { key: 'continue_cta', label: 'Continue button', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'What to expect',
      fields: [
        { key: 'expect_title', label: 'Title', kind: 'text', max: 40 },
        { key: 'expect_confirmation', label: 'Order confirmation', kind: 'textarea', max: 120 },
        { key: 'expect_personalised', label: 'Personalised design', kind: 'textarea', max: 120 },
        { key: 'expect_revisions', label: 'Free revisions', kind: 'textarea', max: 120 },
        { key: 'expect_link', label: 'Shareable link', kind: 'textarea', max: 120 },
        { key: 'expect_rsvp', label: 'Live RSVP tracking', kind: 'textarea', max: 120 },
        { key: 'expect_ticket', label: 'OpusPass ticket', kind: 'textarea', max: 200 },
        { key: 'expect_print', label: 'Printed cards (print mode only)', kind: 'textarea', max: 120 },
      ],
    },
  ],
  confirmation: [
    {
      legend: 'Empty state',
      fields: [
        { key: 'empty_title', label: 'Title', kind: 'text', max: 60 },
        { key: 'empty_body', label: 'Body', kind: 'textarea', max: 160 },
        { key: 'empty_cta', label: 'Button', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Success header',
      fields: [
        { key: 'success_heading_verifying', label: 'Heading (verifying)', kind: 'text', max: 80 },
        { key: 'success_heading_confirmed', label: 'Heading (confirmed)', kind: 'text', max: 80 },
        { key: 'success_body_verifying', label: 'Body (verifying)', kind: 'textarea', max: 320, hint: 'Use {email} for the receipt email and {refClause} for the optional "(ref …)" fragment.' },
        { key: 'success_body_confirmed', label: 'Body (confirmed)', kind: 'textarea', max: 240, hint: 'Use {email} for the receipt email.' },
      ],
    },
    {
      legend: 'Payment status card',
      fields: [
        { key: 'status_verifying_title', label: 'Verifying — title', kind: 'text', max: 40 },
        { key: 'status_confirmed_title', label: 'Confirmed — title', kind: 'text', max: 40 },
        { key: 'status_verifying_body', label: 'Verifying — body', kind: 'textarea', max: 160 },
        { key: 'status_paid_via', label: 'Paid via', kind: 'text', max: 40, hint: 'Use {provider} for the payment provider, e.g. "Paid via {provider}"' },
        { key: 'status_verifying_eta', label: 'Verifying — ETA note', kind: 'text', max: 60 },
        { key: 'status_reference_label', label: 'Reference label', kind: 'text', max: 30 },
        { key: 'status_method_label', label: 'Method label', kind: 'text', max: 30 },
        { key: 'status_method_lipa_namba', label: 'M-Pesa Lipa Namba value', kind: 'text', max: 40 },
        { key: 'status_business_number_label', label: 'Business number label', kind: 'text', max: 40 },
        { key: 'status_payer_label', label: 'Payer label', kind: 'text', max: 30 },
        { key: 'status_phone_label', label: 'Phone label', kind: 'text', max: 30 },
        { key: 'status_payment_label', label: 'Payment label', kind: 'text', max: 30 },
        { key: 'status_details_summary', label: 'Details toggle', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Order section',
      fields: [
        { key: 'order_title', label: 'Section title', kind: 'text', max: 40 },
        { key: 'meta_delivery_date', label: 'Delivery date label', kind: 'text', max: 40 },
        { key: 'meta_order_id', label: 'Order ID label', kind: 'text', max: 40 },
        { key: 'meta_payment_method', label: 'Payment method label', kind: 'text', max: 40 },
        { key: 'item_package_suffix', label: 'Package pill', kind: 'text', max: 40, hint: 'Use {tier} for the package name, e.g. "{tier} Package"' },
        { key: 'item_delivered', label: 'Item delivery note', kind: 'text', max: 60 },
        { key: 'item_guests_label', label: 'Guests label', kind: 'text', max: 30 },
      ],
    },
    {
      legend: 'What happens next',
      fields: [
        { key: 'next_title', label: 'Section title', kind: 'text', max: 40 },
        { key: 'next_personalise_title', label: 'Step 1 — title', kind: 'text', max: 60 },
        { key: 'next_personalise_body', label: 'Step 1 — body', kind: 'textarea', max: 200 },
        { key: 'next_proof_title', label: 'Step 2 — title', kind: 'text', max: 60 },
        { key: 'next_proof_body', label: 'Step 2 — body', kind: 'textarea', max: 200 },
        { key: 'next_share_title', label: 'Step 3 — title', kind: 'text', max: 60 },
        { key: 'next_share_body', label: 'Step 3 — body', kind: 'textarea', max: 200 },
      ],
    },
    {
      legend: 'Payment summary',
      fields: [
        { key: 'summary_title', label: 'Section title', kind: 'text', max: 40 },
        { key: 'summary_price', label: 'Price row', kind: 'text', max: 40 },
        { key: 'summary_discount', label: 'Discount row', kind: 'text', max: 40 },
        { key: 'summary_delivery', label: 'Delivery row', kind: 'text', max: 40 },
        { key: 'summary_delivery_free', label: 'Free delivery value', kind: 'text', max: 40 },
        { key: 'summary_total', label: 'Total (verifying)', kind: 'text', max: 40 },
        { key: 'summary_total_paid', label: 'Total paid (confirmed)', kind: 'text', max: 40 },
        { key: 'download_invoice', label: 'Download invoice button', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Actions & trust',
      fields: [
        { key: 'browse_more', label: 'Browse more button', kind: 'text', max: 40 },
        { key: 'back_to_invitations', label: 'Back to invitations button', kind: 'text', max: 40 },
        { key: 'delivered_note', label: 'Delivery footnote', kind: 'text', max: 60 },
        { key: 'badge_card', label: 'Card payment badge', kind: 'text', max: 30 },
        { key: 'celebration_aria', label: 'Celebration emoji (aria-label)', kind: 'text', max: 30 },
      ],
    },
  ],
  'checkout-form': [
    {
      legend: 'Header',
      fields: [
        { key: 'back_to_contact', label: 'Back link', kind: 'text', max: 40 },
        { key: 'page_title', label: 'Page heading', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Blocking error banner',
      fields: [
        { key: 'block_title', label: 'Banner title (cart empty / no contact)', kind: 'text', max: 60 },
        { key: 'block_add_contact_cta', label: 'Add contact link', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Contact recap',
      fields: [
        { key: 'recap_delivering_to', label: 'Delivering-to label', kind: 'text', max: 40 },
        { key: 'recap_edit', label: 'Edit button', kind: 'text', max: 30 },
      ],
    },
    {
      legend: 'Manual payment form — fields',
      fields: [
        { key: 'payer_name_label', label: 'Payer name — label', kind: 'text', max: 60 },
        { key: 'payer_name_placeholder', label: 'Payer name — placeholder', kind: 'text', max: 40 },
        { key: 'payer_name_hint', label: 'Payer name — hint', kind: 'textarea', max: 200 },
        { key: 'phone_label_lipa', label: 'Phone label (Lipa Namba flow)', kind: 'text', max: 60 },
        { key: 'phone_label_push', label: 'Phone label (phone-prompt flow)', kind: 'text', max: 40, hint: 'Use {provider} for the payment provider name, e.g. "{provider} phone number"' },
        { key: 'phone_placeholder', label: 'Phone — placeholder', kind: 'text', max: 40 },
        { key: 'phone_hint_push', label: 'Phone hint (phone-prompt flow)', kind: 'textarea', max: 160 },
        { key: 'payref_label', label: 'Transaction reference — label', kind: 'text', max: 60 },
        { key: 'payref_placeholder', label: 'Transaction reference — placeholder', kind: 'text', max: 40 },
        { key: 'payref_hint', label: 'Transaction reference — hint', kind: 'textarea', max: 200 },
      ],
    },
    {
      legend: 'Validation messages',
      fields: [
        { key: 'error_cart_empty', label: 'Cart empty', kind: 'text', max: 100 },
        { key: 'error_contact_missing', label: 'Contact details missing', kind: 'text', max: 100 },
        { key: 'error_phone', label: 'Invalid phone', kind: 'text', max: 80 },
        { key: 'error_payer_name', label: 'Payer name required', kind: 'text', max: 100 },
        { key: 'error_payref', label: 'Invalid transaction reference', kind: 'text', max: 120 },
      ],
    },
  ],
  'checkout-payment': [
    {
      legend: 'Method picker',
      fields: [
        { key: 'choose_title', label: 'Section title', kind: 'text', max: 40 },
        { key: 'method_aria', label: 'Radiogroup (aria-label)', kind: 'text', max: 40 },
        { key: 'method_mpesa_desc', label: 'M-Pesa option — description', kind: 'text', max: 80 },
        { key: 'method_card_desc', label: 'Card option — description', kind: 'text', max: 80 },
      ],
    },
    {
      legend: 'M-Pesa flow toggle',
      fields: [
        { key: 'toggle_push', label: 'Phone-prompt toggle', kind: 'text', max: 30 },
        { key: 'toggle_lipa', label: 'Lipa Namba toggle', kind: 'text', max: 30 },
        { key: 'push_instructions', label: 'Phone-prompt instructions', kind: 'textarea', max: 240, hint: 'Use {pay} for the bolded "Pay" word (see "Pay word" field below).' },
        { key: 'push_pay_word', label: 'Pay word (interpolated into instructions)', kind: 'text', max: 20 },
      ],
    },
    {
      legend: 'Lipa Namba panel',
      fields: [
        { key: 'lipa_amount_label', label: 'Amount-to-send label', kind: 'text', max: 40 },
        { key: 'lipa_how_title', label: 'How-to-pay heading', kind: 'text', max: 60, hint: 'Swahili default: "Jinsi ya kufanya malipo"' },
        { key: 'lipa_how_subtitle', label: 'How-to-pay subtitle', kind: 'textarea', max: 120 },
        { key: 'lipa_network_aria', label: 'Network tablist (aria-label)', kind: 'text', max: 40 },
        { key: 'lipa_dial_prefix_dial', label: 'Dial prefix (Vodacom/Tigo/Airtel)', kind: 'text', max: 30, hint: 'Swahili default: "Piga"' },
        { key: 'lipa_dial_prefix_other', label: 'Dial prefix (other networks)', kind: 'text', max: 30, hint: 'Swahili default: "Ingia kwenye"' },
        { key: 'lipa_qr_note', label: 'Vodacom QR helper note', kind: 'textarea', max: 240, hint: 'Swahili on the live site — set the SW value to the on-poster instructions.' },
      ],
    },
    {
      legend: 'Vodacom M-Pesa steps',
      fields: [
        { key: 'step_vodacom_1_do', label: 'Step 1 — action', kind: 'text', max: 40 },
        { key: 'step_vodacom_1_detail', label: 'Step 1 — detail', kind: 'text', max: 60 },
        { key: 'step_vodacom_2_do', label: 'Step 2 — action', kind: 'text', max: 40 },
        { key: 'step_vodacom_2_detail', label: 'Step 2 — detail', kind: 'text', max: 60 },
        { key: 'step_vodacom_3_do', label: 'Step 3 — action', kind: 'text', max: 40 },
        { key: 'step_vodacom_3_detail', label: 'Step 3 — detail', kind: 'text', max: 60, hint: 'Defaults to the Lipa Namba (350298654) — leave unless it changes.' },
        { key: 'step_vodacom_4_do', label: 'Step 4 — action', kind: 'text', max: 40 },
        { key: 'step_vodacom_4_detail', label: 'Step 4 — detail', kind: 'text', max: 60 },
        { key: 'step_vodacom_5_do', label: 'Step 5 — action', kind: 'text', max: 40 },
        { key: 'step_vodacom_5_detail', label: 'Step 5 — detail', kind: 'text', max: 60 },
      ],
    },
    {
      legend: 'Tigo Pesa (Mixx by Yas) steps',
      fields: [
        { key: 'step_tigo_1_do', label: 'Step 1 — action', kind: 'text', max: 40 },
        { key: 'step_tigo_1_detail', label: 'Step 1 — detail', kind: 'text', max: 60 },
        { key: 'step_tigo_2_do', label: 'Step 2 — action', kind: 'text', max: 40 },
        { key: 'step_tigo_2_detail', label: 'Step 2 — detail', kind: 'text', max: 60 },
        { key: 'step_tigo_3_do', label: 'Step 3 — action', kind: 'text', max: 40 },
        { key: 'step_tigo_3_detail', label: 'Step 3 — detail', kind: 'text', max: 60 },
        { key: 'step_tigo_4_do', label: 'Step 4 — action', kind: 'text', max: 40 },
        { key: 'step_tigo_4_detail', label: 'Step 4 — detail', kind: 'text', max: 60, hint: 'Defaults to the Lipa Namba (350298654) — leave unless it changes.' },
        { key: 'step_tigo_5_do', label: 'Step 5 — action', kind: 'text', max: 40 },
        { key: 'step_tigo_5_detail', label: 'Step 5 — detail', kind: 'text', max: 60 },
        { key: 'step_tigo_6_do', label: 'Step 6 — action', kind: 'text', max: 40 },
        { key: 'step_tigo_6_detail', label: 'Step 6 — detail', kind: 'text', max: 60 },
      ],
    },
    {
      legend: 'Airtel Money steps',
      fields: [
        { key: 'step_airtel_1_do', label: 'Step 1 — action', kind: 'text', max: 40 },
        { key: 'step_airtel_1_detail', label: 'Step 1 — detail', kind: 'text', max: 60 },
        { key: 'step_airtel_2_do', label: 'Step 2 — action', kind: 'text', max: 40 },
        { key: 'step_airtel_2_detail', label: 'Step 2 — detail', kind: 'text', max: 60 },
        { key: 'step_airtel_3_do', label: 'Step 3 — action', kind: 'text', max: 40 },
        { key: 'step_airtel_3_detail', label: 'Step 3 — detail', kind: 'text', max: 60 },
        { key: 'step_airtel_4_do', label: 'Step 4 — action', kind: 'text', max: 40 },
        { key: 'step_airtel_4_detail', label: 'Step 4 — detail', kind: 'text', max: 60 },
        { key: 'step_airtel_5_do', label: 'Step 5 — action', kind: 'text', max: 40 },
        { key: 'step_airtel_5_detail', label: 'Step 5 — detail', kind: 'text', max: 60, hint: 'Defaults to the Lipa Namba (350298654) — leave unless it changes.' },
        { key: 'step_airtel_6_do', label: 'Step 6 — action', kind: 'text', max: 40 },
        { key: 'step_airtel_6_detail', label: 'Step 6 — detail', kind: 'text', max: 60 },
      ],
    },
    {
      legend: 'Other networks & banks steps',
      fields: [
        { key: 'network_other_name', label: 'Network tab name', kind: 'text', max: 60 },
        { key: 'network_other_dial', label: 'Dial instruction', kind: 'text', max: 80 },
        { key: 'step_other_1_do', label: 'Step 1 — action', kind: 'text', max: 40 },
        { key: 'step_other_1_detail', label: 'Step 1 — detail', kind: 'text', max: 60 },
        { key: 'step_other_2_do', label: 'Step 2 — action', kind: 'text', max: 40 },
        { key: 'step_other_2_detail', label: 'Step 2 — detail', kind: 'text', max: 60 },
        { key: 'step_other_3_do', label: 'Step 3 — action', kind: 'text', max: 40 },
        { key: 'step_other_3_detail', label: 'Step 3 — detail', kind: 'text', max: 60 },
        { key: 'step_other_4_do', label: 'Step 4 — action', kind: 'text', max: 40 },
        { key: 'step_other_4_detail', label: 'Step 4 — detail', kind: 'text', max: 60, hint: 'Defaults to the Lipa Namba (350298654) — leave unless it changes.' },
        { key: 'step_other_5_do', label: 'Step 5 — action', kind: 'text', max: 40 },
        { key: 'step_other_5_detail', label: 'Step 5 — detail', kind: 'text', max: 60 },
        { key: 'step_other_6_do', label: 'Step 6 — action', kind: 'text', max: 40 },
        { key: 'step_other_6_detail', label: 'Step 6 — detail', kind: 'text', max: 60 },
      ],
    },
    {
      legend: 'Card payment',
      fields: [
        { key: 'card_title', label: 'Secure card title', kind: 'text', max: 40 },
        { key: 'card_body', label: 'Secure card body', kind: 'textarea', max: 320 },
      ],
    },
    {
      legend: 'Pay button',
      fields: [
        { key: 'pay_push_cta', label: 'Pay (phone prompt)', kind: 'text', max: 40, hint: 'Use {amount} for the total, e.g. "Pay {amount}"' },
        { key: 'pay_lipa_cta', label: 'Submit order (Lipa Namba)', kind: 'text', max: 60, hint: 'Use {amount} for the total, e.g. "I\'ve paid {amount} — submit order"' },
        { key: 'pay_card_cta', label: 'Continue to card', kind: 'text', max: 60 },
        { key: 'pay_awaiting', label: 'Waiting for approval', kind: 'text', max: 40 },
        { key: 'pay_redirecting', label: 'Redirecting', kind: 'text', max: 40 },
        { key: 'pay_processing', label: 'Processing', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Security reassurance',
      fields: [
        { key: 'reassure_lipa', label: 'Reassurance (Lipa Namba)', kind: 'textarea', max: 240 },
        { key: 'reassure_card', label: 'Reassurance (card)', kind: 'textarea', max: 240 },
        { key: 'reassure_push', label: 'Reassurance (phone prompt)', kind: 'textarea', max: 240 },
      ],
    },
    {
      legend: 'Waiting overlay',
      fields: [
        { key: 'overlay_aria', label: 'Overlay (aria-label)', kind: 'text', max: 60 },
        { key: 'overlay_title', label: 'Overlay title', kind: 'text', max: 40 },
        { key: 'overlay_body', label: 'Overlay body', kind: 'textarea', max: 200, hint: 'Use {phone} for the customer phone and {amount} for the total.' },
        { key: 'overlay_waiting', label: 'Waiting line', kind: 'text', max: 60 },
        { key: 'overlay_keep_open', label: 'Keep-page-open note', kind: 'textarea', max: 120 },
      ],
    },
  ],
  'checkout-summary': [
    {
      legend: 'Order summary',
      fields: [
        { key: 'summary_title', label: 'Section title', kind: 'text', max: 40 },
        { key: 'price_label', label: 'Price row', kind: 'text', max: 40 },
        { key: 'discount_label', label: 'Discount row', kind: 'text', max: 40 },
        { key: 'delivery_label', label: 'Delivery row', kind: 'text', max: 40 },
        { key: 'delivery_free', label: 'Free delivery value', kind: 'text', max: 40 },
        { key: 'total_label', label: 'Total row', kind: 'text', max: 40 },
      ],
    },
    {
      legend: 'Info tiles',
      fields: [
        { key: 'ready_title', label: 'Ready-in-24h — title', kind: 'text', max: 40 },
        { key: 'ready_body', label: 'Ready-in-24h — body', kind: 'textarea', max: 200 },
        { key: 'revision_title', label: 'Free revision — title', kind: 'text', max: 40 },
        { key: 'revision_body', label: 'Free revision — body', kind: 'textarea', max: 200 },
      ],
    },
    {
      legend: 'Trust',
      fields: [
        { key: 'secure_note', label: 'Secure payment note', kind: 'text', max: 80 },
      ],
    },
  ],
}
