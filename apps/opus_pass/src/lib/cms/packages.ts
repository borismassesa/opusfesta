import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
//  Per-guest wedding packages (Essential / Elegant / Signature).
//  Each tier carries its OWN badge (label + icon + colour) and its OWN list of
//  "package includes" bullet points — so the admin edits each tier directly
//  instead of a cross-tier feature matrix. Pricing is per guest × guest count.
//  Bilingual (English + Kiswahili). Stored as one CMS config — page_key
//  'opus-pass-packages', section_key 'wedding-tiers'.
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
  id: string // 'lite' | 'classic' | 'signature' — stable internal key
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
// one tier never mutates another.
const common = (): PackageBullet[] => [
  B('Event dashboard (create event, guest list, contacts)', 'Dashibodi ya tukio (tengeneza tukio, orodha ya wageni, anwani)'),
  B('Digital invitation card', 'Kadi ya mwaliko ya kidijitali'),
  B('Digital ticket + barcode (for scanning)', 'Tiketi ya kidijitali + barcode (kwa ukaguzi)'),
  B('Card delivery (WhatsApp / SMS / Email)', 'Utoaji wa kadi (WhatsApp / SMS / Barua pepe)'),
  B('Send invite messages', 'Kutuma ujumbe wa mialiko'),
  B('Entrance barcode scan check-in', 'Ukaguzi wa barcode mlangoni'),
]

export const PACKAGES_FALLBACK: PackagesContent = {
  heading: 'Choose your package',
  heading_sw: 'Chagua kifurushi chako',
  subheading: 'Pay per guest — everything scales with your headcount.',
  subheading_sw: 'Lipa kwa kila mgeni — kila kitu kinakua kulingana na idadi ya wageni.',
  note: 'Events above 600 guests get a capped, discounted per-guest rate.',
  note_sw: 'Matukio ya wageni zaidi ya 600 yanapata bei ya punguzo (kikomo).',
  tiers: [
    {
      id: 'lite',
      name: 'Essential',
      name_sw: 'Essential',
      featured: false,
      price_per_guest: 1500,
      best_for: 'Everything you need',
      best_for_sw: 'Kila unachohitaji',
      badge_label: 'Basic',
      badge_label_sw: 'Msingi',
      badge_icon: 'sparkles',
      badge_tone: 'slate',
      includes: [
        ...common(),
        B('Card design', 'Muundo wa kadi', '1 template', 'Kiolezo 1'),
        B('RSVP dashboard', 'Dashibodi ya RSVP', 'Basic headcount', 'Idadi ya msingi'),
      ],
    },
    {
      id: 'classic',
      name: 'Elegant',
      name_sw: 'Elegant',
      featured: true,
      price_per_guest: 2500,
      best_for: 'More customization & style',
      best_for_sw: 'Ubinafsishaji na mtindo zaidi',
      badge_label: 'Most popular',
      badge_label_sw: 'Maarufu zaidi',
      badge_icon: 'diamond',
      badge_tone: 'accent',
      includes: [
        ...common(),
        B('Card design', 'Muundo wa kadi', 'Custom branded', 'Maalum, chapa ya OpusFesta'),
        B('RSVP dashboard', 'Dashibodi ya RSVP', 'Live confirmations & check-ins', 'Uthibitisho na ukaguzi wa moja kwa moja'),
        B('Notification reminders', 'Vikumbusho vya arifa'),
        B('Pledge / contribution collection', 'Ukusanyaji wa michango'),
        B('Seat planning', 'Mpangilio wa viti'),
        B('Thank-you message blast', 'Ujumbe wa shukrani'),
      ],
    },
    {
      id: 'signature',
      name: 'Signature',
      name_sw: 'Signature',
      featured: false,
      price_per_guest: 4000,
      best_for: 'Premium, exclusive experience',
      best_for_sw: 'Hali ya kifahari, ya kipekee',
      badge_label: 'Premium',
      badge_label_sw: 'Premium',
      badge_icon: 'crown',
      badge_tone: 'gold',
      includes: [
        ...common(),
        B('Card design', 'Muundo wa kadi', 'Bespoke + animation', 'Ya kipekee + mwendo'),
        B('RSVP dashboard', 'Dashibodi ya RSVP', 'Live + analytics', 'Live + uchambuzi'),
        B('Notification reminders', 'Vikumbusho vya arifa'),
        B('Pledge / contribution collection', 'Ukusanyaji wa michango'),
        B('Seat planning', 'Mpangilio wa viti'),
        B('Thank-you message blast', 'Ujumbe wa shukrani'),
        B('Digital guestbook', 'Kitabu cha wageni cha kidijitali'),
        B('Dedicated coordinator', 'Mratibu maalum'),
        B('Wedding website', 'Tovuti ya harusi', 'Included', 'Imejumuishwa'),
      ],
    },
  ],
  addons: [
    { id: 'a1', label: 'Wedding website', label_sw: 'Tovuti ya harusi' },
    { id: 'a2', label: 'Paper card prints', label_sw: 'Machapisho ya kadi (karatasi)' },
    { id: 'a3', label: 'Extra SMS credits', label_sw: 'Salio la ziada la SMS' },
    { id: 'a4', label: 'On-site door scanning attendant', label_sw: 'Mhudumu wa kukagua mlangoni' },
  ],
}

// Re-exported for server-side callers that already import from this module.
// Defined in a sibling so client components can import it without pulling in
// this file's server-only `next/headers` dependency.
export { packageFromPrice } from './packages-pricing'

export async function loadPackagesContent(): Promise<PackagesContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return PACKAGES_FALLBACK
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
    if (stored) {
      return {
        heading: stored.heading ?? PACKAGES_FALLBACK.heading,
        heading_sw: stored.heading_sw ?? PACKAGES_FALLBACK.heading_sw,
        subheading: stored.subheading ?? PACKAGES_FALLBACK.subheading,
        subheading_sw: stored.subheading_sw ?? PACKAGES_FALLBACK.subheading_sw,
        note: stored.note ?? PACKAGES_FALLBACK.note,
        note_sw: stored.note_sw ?? PACKAGES_FALLBACK.note_sw,
        tiers:
          Array.isArray(stored.tiers) && stored.tiers.length > 0 ? stored.tiers : PACKAGES_FALLBACK.tiers,
        addons: Array.isArray(stored.addons) ? stored.addons : PACKAGES_FALLBACK.addons,
      }
    }
    return PACKAGES_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] packages load failed', err)
    return PACKAGES_FALLBACK
  }
}
