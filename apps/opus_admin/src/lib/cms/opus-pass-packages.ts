// Admin-side types + fallback for the OpusPass per-guest packages shown on the
// product detail page ("Choose your package" + each tier's "includes" list).
//
// Mirrors apps/opus_pass/src/lib/cms/packages.ts (the public loader). Each tier
// owns its badge (label + icon + colour) and its own bullet list, so the admin
// edits each tier directly — no cross-tier matrix.
//
// Stored as one CMS config: page_key 'opus-pass-packages', section_key
// 'wedding-tiers' in website_page_sections.

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

export type TierBadgeTone = 'slate' | 'accent' | 'gold'
export const TIER_BADGE_TONES: { value: TierBadgeTone; label: string }[] = [
  { value: 'slate', label: 'Slate (neutral)' },
  { value: 'accent', label: 'Accent (lavender)' },
  { value: 'gold', label: 'Gold' },
]

export type PackageBullet = {
  id: string
  label: string
  label_sw: string
  note: string
  note_sw: string
}

export type PackageTier = {
  id: string
  name: string
  name_sw: string
  featured: boolean
  price_per_guest: number
  best_for: string
  best_for_sw: string
  badge_label: string
  badge_label_sw: string
  badge_icon: TierBadgeIcon
  badge_tone: TierBadgeTone
  includes: PackageBullet[]
}

export type PackageAddon = {
  id: string
  label: string
  label_sw: string
}

export type OpusPassPackagesContent = {
  heading: string
  heading_sw: string
  subheading: string
  subheading_sw: string
  note: string
  note_sw: string
  tiers: PackageTier[]
  addons: PackageAddon[]
}

export type OpusPassPackagesRow = {
  page_key: string
  section_key: string
  content: OpusPassPackagesContent | null
  draft_content: OpusPassPackagesContent | null
  is_published: boolean | null
}

let seq = 0
const B = (label: string, label_sw: string, note = '', note_sw = ''): PackageBullet => ({
  id: `b${++seq}`,
  label,
  label_sw,
  note,
  note_sw,
})
const common = (): PackageBullet[] => [
  B('Event dashboard (create event, guest list, contacts)', 'Dashibodi ya tukio (tengeneza tukio, orodha ya wageni, anwani)'),
  B('Digital invitation card', 'Kadi ya mwaliko ya kidijitali'),
  B('Digital ticket + barcode (for scanning)', 'Tiketi ya kidijitali + barcode (kwa ukaguzi)'),
  B('Card delivery (WhatsApp / SMS / Email)', 'Utoaji wa kadi (WhatsApp / SMS / Barua pepe)'),
  B('Send invite messages', 'Kutuma ujumbe wa mialiko'),
  B('Entrance barcode scan check-in', 'Ukaguzi wa barcode mlangoni'),
]

// Keep in sync with apps/opus_pass PACKAGES_FALLBACK so the editor opens on the
// real content when no CMS row has been saved yet.
export const OPUS_PASS_PACKAGES_FALLBACK: OpusPassPackagesContent = {
  heading: 'Choose your package',
  heading_sw: 'Chagua kifurushi chako',
  subheading: 'Pay per guest — everything scales with your headcount.',
  subheading_sw: 'Lipa kwa kila mgeni — kila kitu kinakua kulingana na idadi ya wageni.',
  note: 'Events above 600 guests get a capped, discounted per-guest rate.',
  note_sw: 'Matukio ya wageni zaidi ya 600 yanapata bei ya punguzo (kikomo).',
  tiers: [
    {
      id: 'lite', name: 'Essential', name_sw: 'Essential', featured: false, price_per_guest: 1500,
      best_for: 'Everything you need', best_for_sw: 'Kila unachohitaji',
      badge_label: 'Basic', badge_label_sw: 'Msingi', badge_icon: 'sparkles', badge_tone: 'slate',
      includes: [
        ...common(),
        B('Card design', 'Muundo wa kadi', '1 template', 'Kiolezo 1'),
        B('RSVP dashboard', 'Dashibodi ya RSVP', 'Basic headcount', 'Idadi ya msingi'),
      ],
    },
    {
      id: 'classic', name: 'Elegant', name_sw: 'Elegant', featured: true, price_per_guest: 2500,
      best_for: 'More customization & style', best_for_sw: 'Ubinafsishaji na mtindo zaidi',
      badge_label: 'Most popular', badge_label_sw: 'Maarufu zaidi', badge_icon: 'diamond', badge_tone: 'accent',
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
      id: 'signature', name: 'Signature', name_sw: 'Signature', featured: false, price_per_guest: 4000,
      best_for: 'Premium, exclusive experience', best_for_sw: 'Hali ya kifahari, ya kipekee',
      badge_label: 'Premium', badge_label_sw: 'Premium', badge_icon: 'crown', badge_tone: 'gold',
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

export function packagesRandomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
