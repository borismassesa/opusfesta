import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, type Locale } from './localized'

// ─────────────────────────────────────────────────────────────────────────────
//  Per-guest wedding packages (Essential / Classic / Elegant / Signature).
//  Each tier carries its OWN badge (label + icon + colour) and its OWN list of
//  "package includes" bullet points — so the admin edits each tier directly
//  instead of a cross-tier feature matrix. Pricing is per guest × guest count.
//  Bilingual (English + Kiswahili). Stored as one CMS config — page_key
//  'opus-pass-packages', section_key 'wedding-tiers'.
//
//  Stable internal ids map 1:1 to the public names: lite=Essential,
//  classic=Classic (the featured "most popular" pick), elegant=Elegant,
//  signature=Signature.
// ─────────────────────────────────────────────────────────────────────────────

// Icon keys an admin can choose for a tier's badge pill. Mapped to lucide icons
// in the renderer; 'none' shows a text-only pill.
export const TIER_BADGE_ICONS = [
  'none',
  'sparkles',
  'star',
  'diamond',
  'crown',
  'gem',
  'heart',
  'award',
  'zap',
  'flame',
  'party',
] as const
export type TierBadgeIcon = (typeof TIER_BADGE_ICONS)[number]

// Pill colour theme.
export type TierBadgeTone = 'slate' | 'accent' | 'gold'

// One "package includes" line. `note` is an optional emphasis shown after an
// em-dash, e.g. "Card design — Custom branded".
export type PackageBullet = {
  id: string
  label: string
  label_sw: string
  note: string
  note_sw: string
}

export type PackageTier = {
  id: string // 'lite' | 'classic' | 'elegant' | 'signature' — stable internal key
  name: string
  name_sw: string
  featured: boolean
  price_per_guest: number
  best_for: string
  best_for_sw: string
  // Badge pill on the tier card.
  badge_label: string
  badge_label_sw: string
  badge_icon: TierBadgeIcon
  badge_tone: TierBadgeTone
  // What this tier includes — the bullet checklist under the selector.
  includes: PackageBullet[]
}

// A line in the "Available as add-ons" footnote.
export type PackageAddon = {
  id: string
  label: string
  label_sw: string
}

export type PackagesContent = {
  heading: string
  heading_sw: string
  subheading: string
  subheading_sw: string
  note: string
  note_sw: string
  // "per guest" suffix shown after each tier's price — shared chrome, not
  // per-tier copy, so it lives once at the content level.
  perGuestLabel: string
  perGuestLabel_sw: string
  // Label above the guest-count stepper.
  cardsCountLabel: string
  cardsCountLabel_sw: string
  // Helper line below the stepper — contains a literal "{count}" placeholder
  // the renderer substitutes with the actual minimum guest count.
  minGuestsTemplate: string
  minGuestsTemplate_sw: string
  tiers: PackageTier[]
  addons: PackageAddon[]
}

let bulletSeq = 0
const B = (label: string, label_sw: string, note = '', note_sw = ''): PackageBullet => ({
  id: `b${++bulletSeq}`,
  label,
  label_sw,
  note,
  note_sw,
})

// Shared "included in every package" lines — fresh objects per tier so editing
// one tier never mutates another. This is exactly Essential's own bullet list;
// every higher tier is cumulative (Classic = Essential + its own lines,
// Elegant = Classic + its own lines, Signature = Elegant + its own lines —
// minus the one-send Save-the-Date line, which Signature's two-send version
// supersedes rather than duplicates).
// Source: OpusPass_Packages_final.xlsx (English + Kiswahili sheets).
const common = (): PackageBullet[] => [
  B('1 template digital card with QR code', 'Kadi 1 ya kidijitali ya kiolezo yenye QR'),
  B('Sent via WhatsApp (SMS fallback)', 'Inatumwa kwa WhatsApp (SMS mbadala)'),
  B('WhatsApp RSVP', 'RSVP kwa WhatsApp', 'guests reply yes / no', 'wageni hujibu ndiyo / hapana'),
  B('Opus scanner QR code check-in on the day (self-scan app)', 'Ukaguzi wa QR wa Opus siku ya tukio (app ya kujiskania mwenyewe)'),
]

const classicExtras = (): PackageBullet[] => [
  B('Custom card', 'Kadi maalum', 'your colours & photo', 'rangi na picha yako'),
  B('The OpusPass dashboard', 'Dashibodi ya OpusPass', 'build your guest list & track RSVPs in one place', 'andaa orodha ya wageni na fuatilia RSVP mahali pamoja'),
  B('Invite guests to pledge', 'Waalike wageni kuchangia', 'by SMS, WhatsApp or email from your dashboard', 'kwa SMS, WhatsApp au barua pepe kutoka dashibodi'),
  B('Reminders & delivery confirmations', 'Vikumbusho na uthibitisho wa utoaji'),
  B('RSVP report', 'Ripoti ya RSVP'),
]

// Elegant's own lines, as listed — used by Elegant only. Signature restates
// these (minus the one-send Save-the-Date line) alongside its own additions,
// same hand-authored pattern as the rest of this file.
const elegantExtras = (): PackageBullet[] => [
  B('Bespoke card designed from scratch', 'Kadi iliyobuniwa kutoka mwanzo'),
  B('We send your invites & chase non-responders', 'Tunatuma mialiko na kufuatilia wasiojibu', 'by message & call', 'kwa ujumbe na simu'),
  B('We build your guest list from the details you give us', 'Tunaandaa orodha ya wageni kutoka taarifa unazotupatia'),
  B('We run your pledge campaign', 'Tunaendesha kampeni yako ya michango', 'invitations, reminders & follow-up on unpaid pledges', 'mialiko, vikumbusho na kufuatilia michango isiyolipwa'),
  B('Confirmed-headcount report before the day', 'Ripoti ya idadi iliyothibitishwa kabla ya siku'),
  B('On-site scanning attendant on the day', 'Mhudumu wa kukagua wageni mlangoni siku ya tukio'),
  B('One Save-the-Date send', 'Save-the-Date mara moja'),
  B('Thank-you message to all guests', 'Ujumbe wa shukrani kwa wageni wote'),
]

export const PACKAGES_FALLBACK: PackagesContent = {
  heading: 'Choose your package',
  heading_sw: 'Chagua kifurushi chako',
  subheading: 'Pay per guest — everything scales with your headcount.',
  subheading_sw: 'Lipa kwa kila mgeni — kila kitu kinakua kulingana na idadi ya wageni.',
  note: 'Events above 600 guests get a capped, discounted per-guest rate.',
  note_sw: 'Matukio ya wageni zaidi ya 600 yanapata bei ya punguzo (kikomo).',
  perGuestLabel: 'per guest',
  perGuestLabel_sw: 'kwa mgeni',
  cardsCountLabel: 'Number of digital cards & OpusPass tickets',
  cardsCountLabel_sw: 'Idadi ya kadi za kidijitali na tiketi za OpusPass',
  minGuestsTemplate: 'Minimum {count} guests',
  minGuestsTemplate_sw: 'Angalau wageni {count}',
  tiers: [
    {
      id: 'lite',
      name: 'Essential',
      name_sw: 'Essential',
      featured: false,
      price_per_guest: 1200,
      best_for: 'Just the card — you do it',
      best_for_sw: 'Kadi pekee — unajifanyia mwenyewe',
      badge_label: 'Basic',
      badge_label_sw: 'Msingi',
      badge_icon: 'sparkles',
      badge_tone: 'slate',
      includes: common(),
    },
    {
      id: 'classic',
      name: 'Classic',
      name_sw: 'Classic',
      featured: true,
      price_per_guest: 1700,
      best_for: 'Everything in Essential, plus the dashboard — you do it',
      best_for_sw: 'Vyote vya Essential, pamoja na dashibodi — unajifanyia mwenyewe',
      badge_label: 'Most popular',
      badge_label_sw: 'Maarufu zaidi',
      badge_icon: 'star',
      badge_tone: 'accent',
      includes: [...common(), ...classicExtras()],
    },
    {
      id: 'elegant',
      name: 'Elegant',
      name_sw: 'Elegant',
      featured: false,
      price_per_guest: 2500,
      best_for: 'Everything in Classic, plus — we run it for you',
      best_for_sw: 'Vyote vya Classic — tunaendesha kwa niaba yako',
      badge_label: 'Premium',
      badge_label_sw: 'Premium',
      badge_icon: 'gem',
      badge_tone: 'gold',
      includes: [...common(), ...classicExtras(), ...elegantExtras()],
    },
    {
      id: 'signature',
      name: 'Signature',
      name_sw: 'Signature',
      featured: false,
      price_per_guest: 3000,
      best_for: 'Everything in Elegant, plus — fully handled',
      best_for_sw: 'Vyote vya Elegant — huduma kamili',
      badge_label: 'Luxury',
      badge_label_sw: 'Kifahari',
      badge_icon: 'crown',
      badge_tone: 'gold',
      includes: [
        ...common(),
        ...classicExtras(),
        B('Bespoke card designed from scratch', 'Kadi iliyobuniwa kutoka mwanzo'),
        B('We send your invites & chase non-responders', 'Tunatuma mialiko na kufuatilia wasiojibu', 'by message & call', 'kwa ujumbe na simu'),
        B('We build your guest list from the details you give us', 'Tunaandaa orodha ya wageni kutoka taarifa unazotupatia'),
        B('We run your pledge campaign', 'Tunaendesha kampeni yako ya michango', 'invitations, reminders & follow-up on unpaid pledges', 'mialiko, vikumbusho na kufuatilia michango isiyolipwa'),
        B('Confirmed-headcount report before the day', 'Ripoti ya idadi iliyothibitishwa kabla ya siku'),
        B('On-site scanning attendant on the day', 'Mhudumu wa kukagua wageni mlangoni siku ya tukio'),
        B('Thank-you message to all guests', 'Ujumbe wa shukrani kwa wageni wote'),
        B('Dedicated coordinator who owns your guest experience end to end', 'Mratibu maalum anayesimamia wageni wako mwanzo hadi mwisho'),
        B('Wedding website built & set up for you', 'Tovuti ya harusi tunakuandalia'),
        B('Digital guestbook', 'Kitabu cha wageni cha kidijitali', 'messages & memories your guests leave, yours to keep', 'salamu na kumbukumbu, ni zako kuweka'),
        B('Save-the-Date', 'Save-the-Date', 'two announcement sends', 'matangazo mara mbili'),
        B('Gifts Registry', 'Rejista ya Zawadi'),
      ],
    },
  ],
  addons: [
    { id: 'a1', label: 'Human follow-up calling', label_sw: 'Kupiga simu za ufuatiliaji' },
    { id: 'a2', label: 'Paper card prints', label_sw: 'Machapisho ya kadi (karatasi)' },
  ],
}

// Re-exported for server-side callers that already import from this module.
// Defined in a sibling so client components can import it without pulling in
// this file's server-only `next/headers` dependency.
export { packageFromPrice } from './packages-pricing'

// Packages predate the LocalizedText convention and store Swahili in `_sw`
// sibling fields. Pick the locale-appropriate value (Swahili falls back to
// English when blank) so the renderer can keep reading the primary field.
const pick = (en: string, sw: string | undefined, locale: Locale): string =>
  locale === 'sw' ? sw || en : en

export async function loadPackagesContent(
  locale: Locale = DEFAULT_LOCALE
): Promise<PackagesContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return resolvePackagesLocale(PACKAGES_FALLBACK, locale)
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-packages')
      .eq('section_key', 'wedding-tiers')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<PackagesContent>
      | undefined
    const merged: PackagesContent = stored
      ? {
          heading: stored.heading ?? PACKAGES_FALLBACK.heading,
          heading_sw: stored.heading_sw ?? PACKAGES_FALLBACK.heading_sw,
          subheading: stored.subheading ?? PACKAGES_FALLBACK.subheading,
          subheading_sw: stored.subheading_sw ?? PACKAGES_FALLBACK.subheading_sw,
          note: stored.note ?? PACKAGES_FALLBACK.note,
          note_sw: stored.note_sw ?? PACKAGES_FALLBACK.note_sw,
          perGuestLabel: stored.perGuestLabel ?? PACKAGES_FALLBACK.perGuestLabel,
          perGuestLabel_sw: stored.perGuestLabel_sw ?? PACKAGES_FALLBACK.perGuestLabel_sw,
          cardsCountLabel: stored.cardsCountLabel ?? PACKAGES_FALLBACK.cardsCountLabel,
          cardsCountLabel_sw: stored.cardsCountLabel_sw ?? PACKAGES_FALLBACK.cardsCountLabel_sw,
          minGuestsTemplate: stored.minGuestsTemplate ?? PACKAGES_FALLBACK.minGuestsTemplate,
          minGuestsTemplate_sw: stored.minGuestsTemplate_sw ?? PACKAGES_FALLBACK.minGuestsTemplate_sw,
          tiers:
            Array.isArray(stored.tiers) && stored.tiers.length > 0
              ? stored.tiers
              : PACKAGES_FALLBACK.tiers,
          addons: Array.isArray(stored.addons) ? stored.addons : PACKAGES_FALLBACK.addons,
        }
      : PACKAGES_FALLBACK
    return resolvePackagesLocale(merged, locale)
  } catch (err) {
    console.error('[opus-pass cms] packages load failed', err)
    return resolvePackagesLocale(PACKAGES_FALLBACK, locale)
  }
}

// Resolve every translatable field into the primary key for `locale`, so the
// public renderer keeps reading `.name` / `.label` / `.note` unchanged and gets
// the chosen language. The `_sw` siblings are left intact but unused downstream.
function resolvePackagesLocale(c: PackagesContent, locale: Locale): PackagesContent {
  return {
    ...c,
    heading: pick(c.heading, c.heading_sw, locale),
    subheading: pick(c.subheading, c.subheading_sw, locale),
    note: pick(c.note, c.note_sw, locale),
    perGuestLabel: pick(c.perGuestLabel, c.perGuestLabel_sw, locale),
    cardsCountLabel: pick(c.cardsCountLabel, c.cardsCountLabel_sw, locale),
    minGuestsTemplate: pick(c.minGuestsTemplate, c.minGuestsTemplate_sw, locale),
    tiers: c.tiers.map((t) => ({
      ...t,
      name: pick(t.name, t.name_sw, locale),
      best_for: pick(t.best_for, t.best_for_sw, locale),
      badge_label: pick(t.badge_label, t.badge_label_sw, locale),
      includes: t.includes.map((b) => ({
        ...b,
        label: pick(b.label, b.label_sw, locale),
        note: pick(b.note, b.note_sw, locale),
      })),
    })),
    addons: c.addons.map((a) => ({ ...a, label: pick(a.label, a.label_sw, locale) })),
  }
}
