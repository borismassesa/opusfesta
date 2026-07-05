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
  perGuestLabel: string
  perGuestLabel_sw: string
  cardsCountLabel: string
  cardsCountLabel_sw: string
  minGuestsTemplate: string
  minGuestsTemplate_sw: string
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
// This is exactly Essential's own bullet list; every higher tier is
// cumulative (Classic = Essential + its own lines, Elegant = Classic + its
// own lines, Signature = Elegant + its own lines — minus the one-send
// Save-the-Date line, which Signature's two-send version supersedes rather
// than duplicates). Source: OpusPass_Packages_final.xlsx (EN + Kiswahili).
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

// Keep in sync with apps/opus_pass PACKAGES_FALLBACK so the editor opens on the
// real content when no CMS row has been saved yet.
export const OPUS_PASS_PACKAGES_FALLBACK: OpusPassPackagesContent = {
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
      id: 'lite', name: 'Essential', name_sw: 'Essential', featured: false, price_per_guest: 1200,
      best_for: 'Just the card — you do it', best_for_sw: 'Kadi pekee — unajifanyia mwenyewe',
      badge_label: 'Basic', badge_label_sw: 'Msingi', badge_icon: 'sparkles', badge_tone: 'slate',
      includes: common(),
    },
    {
      id: 'classic', name: 'Classic', name_sw: 'Classic', featured: true, price_per_guest: 1700,
      best_for: 'Everything in Essential, plus the dashboard — you do it', best_for_sw: 'Vyote vya Essential, pamoja na dashibodi — unajifanyia mwenyewe',
      badge_label: 'Most popular', badge_label_sw: 'Maarufu zaidi', badge_icon: 'star', badge_tone: 'accent',
      includes: [...common(), ...classicExtras()],
    },
    {
      id: 'elegant', name: 'Elegant', name_sw: 'Elegant', featured: false, price_per_guest: 2500,
      best_for: 'Everything in Classic, plus — we run it for you', best_for_sw: 'Vyote vya Classic — tunaendesha kwa niaba yako',
      badge_label: 'Premium', badge_label_sw: 'Premium', badge_icon: 'gem', badge_tone: 'gold',
      includes: [
        ...common(),
        ...classicExtras(),
        B('Bespoke card designed from scratch', 'Kadi iliyobuniwa kutoka mwanzo'),
        B('We send your invites & chase non-responders', 'Tunatuma mialiko na kufuatilia wasiojibu', 'by message & call', 'kwa ujumbe na simu'),
        B('We build your guest list from the details you give us', 'Tunaandaa orodha ya wageni kutoka taarifa unazotupatia'),
        B('We run your pledge campaign', 'Tunaendesha kampeni yako ya michango', 'invitations, reminders & follow-up on unpaid pledges', 'mialiko, vikumbusho na kufuatilia michango isiyolipwa'),
        B('Confirmed-headcount report before the day', 'Ripoti ya idadi iliyothibitishwa kabla ya siku'),
        B('On-site scanning attendant on the day', 'Mhudumu wa kukagua wageni mlangoni siku ya tukio'),
        B('One Save-the-Date send', 'Save-the-Date mara moja'),
        B('Thank-you message to all guests', 'Ujumbe wa shukrani kwa wageni wote'),
      ],
    },
    {
      id: 'signature', name: 'Signature', name_sw: 'Signature', featured: false, price_per_guest: 3000,
      best_for: 'Everything in Elegant, plus — fully handled', best_for_sw: 'Vyote vya Elegant — huduma kamili',
      badge_label: 'Luxury', badge_label_sw: 'Kifahari', badge_icon: 'crown', badge_tone: 'gold',
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

export function packagesRandomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
