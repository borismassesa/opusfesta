export type PackageBadgeIcon =
  | 'star'
  | 'crown'
  | 'gem'
  | 'sparkles'
  | 'award'
  | 'trophy'
  | 'flame'
  | 'heart'
  | 'badge-check'
  | 'zap'

export type PackageBadgeTone = 'lavender' | 'gold' | 'emerald' | 'rose' | 'dark'

// Vendors choose their own label + icon + tone — e.g. "Platinum" with a Crown
// in gold, or "Best Value" with a Heart in emerald. All fields required when
// the badge object is present; absence of `badge` means no badge renders.
export type PackageBadge = {
  label: string
  icon: PackageBadgeIcon
  tone: PackageBadgeTone
}

export type PackageDraft = {
  id: string
  name: string
  price: string
  description: string
  includes: string[]
  badge?: PackageBadge
}

export function newPackage(seed?: Partial<PackageDraft>): PackageDraft {
  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `pkg-${Math.random().toString(36).slice(2, 10)}`,
    name: '',
    price: '',
    description: '',
    includes: [''],
    ...seed,
  }
}

const TEMPLATES: Record<string, Array<Omit<PackageDraft, 'id'>>> = {
  photographer: [
    {
      name: 'Essential',
      price: '',
      description: '4-hour ceremony coverage',
      includes: ['1 photographer', 'Up to 4 hours coverage', '300+ edited photos', 'Online gallery'],
    },
    {
      name: 'Signature',
      price: '',
      description: '6-hour ceremony + reception',
      includes: [
        '1 photographer',
        'Up to 6 hours coverage',
        '500+ edited photos',
        'Online gallery',
        'Pre-wedding consultation',
      ],
    },
    {
      name: 'Full Day',
      price: '',
      description: '8 hours of full-day coverage',
      includes: [
        '2 photographers',
        '8 hours coverage',
        '700+ edited photos',
        'Online gallery',
        'Engagement shoot',
        'Printed album',
      ],
    },
  ],
  videographer: [
    {
      name: 'Highlights',
      price: '',
      description: '3-minute cinematic highlight reel',
      includes: ['1 videographer', '4 hours coverage', '3-min highlight film', 'Edited in 4K'],
    },
    {
      name: 'Cinematic',
      price: '',
      description: 'Full ceremony film + highlights',
      includes: [
        '2 videographers',
        '8 hours coverage',
        '5–7 min highlight film',
        'Full ceremony edit',
        'Drone coverage',
      ],
    },
    {
      name: 'Premium',
      price: '',
      description: 'Same-day edit + full feature film',
      includes: [
        '2 videographers',
        'Full-day coverage',
        'Same-day teaser',
        '20-min feature film',
        'Drone + livestream',
      ],
    },
  ],
  venue: [
    {
      name: 'Half-day',
      price: '',
      description: '6-hour venue rental',
      includes: ['Up to 100 guests', '6-hour rental', 'Tables & chairs', 'Basic lighting'],
    },
    {
      name: 'Full-day',
      price: '',
      description: 'All-day venue rental + setup',
      includes: [
        'Up to 200 guests',
        '12-hour rental',
        'Tables, chairs & linens',
        'Sound system',
        'On-site coordinator',
      ],
    },
    {
      name: 'All-inclusive',
      price: '',
      description: 'Venue + catering + decor bundle',
      includes: [
        'Up to 200 guests',
        '12-hour rental',
        'Catering for 200',
        'Decor & florals',
        'Sound + lighting',
      ],
    },
  ],
  caterer: [
    {
      name: 'Buffet — Standard',
      price: '',
      description: 'Per plate, served buffet-style',
      includes: ['3-course menu', 'Buffet service', 'Soft drinks', 'Service staff'],
    },
    {
      name: 'Plated — Premium',
      price: '',
      description: 'Per plate, fully plated service',
      includes: [
        '4-course plated menu',
        'Table service',
        'Welcome drinks',
        'Bar service',
        'Service staff',
      ],
    },
  ],
  cakes: [
    {
      name: '2-tier',
      price: '',
      description: 'Serves up to 60 guests',
      includes: ['2 tiers', '1 flavor', 'Buttercream finish', 'Standard delivery'],
    },
    {
      name: '3-tier signature',
      price: '',
      description: 'Serves up to 120 guests',
      includes: ['3 tiers', '2 flavors', 'Custom design consult', 'Delivery & setup'],
    },
    {
      name: 'Multi-tier custom',
      price: '',
      description: 'Serves 150+ guests',
      includes: ['4+ tiers', 'Custom flavors', 'Sugar florals', 'Tasting session', 'Delivery & setup'],
    },
  ],
  florist: [
    {
      name: 'Ceremony only',
      price: '',
      description: 'Bouquets + ceremony arch',
      includes: ['Bridal bouquet', '4 bridesmaids bouquets', '2 boutonnieres', 'Ceremony arch'],
    },
    {
      name: 'Ceremony + reception',
      price: '',
      description: 'Full floral coverage',
      includes: [
        'Bridal + party bouquets',
        'Ceremony arch',
        '10 reception centerpieces',
        'Sweetheart table',
      ],
    },
  ],
  planner: [
    {
      name: 'Day-of coordination',
      price: '',
      description: 'We run the day, you plan it',
      includes: ['1 month before kickoff', 'Day-of timeline', 'Vendor liaison', '8 hours on-site'],
    },
    {
      name: 'Partial planning',
      price: '',
      description: 'Support from 3 months out',
      includes: [
        'Vendor recommendations',
        'Budget tracking',
        'Design moodboard',
        'Day-of coordination',
      ],
    },
    {
      name: 'Full planning',
      price: '',
      description: 'End-to-end planning + design',
      includes: [
        '12+ month timeline',
        'Full vendor sourcing',
        'Design & styling',
        'Budget management',
        'Day-of coordination',
      ],
    },
  ],
  musician: [
    {
      name: 'DJ — 4 hours',
      price: '',
      description: 'Reception entertainment',
      includes: ['1 DJ', '4-hour set', 'Sound system', 'Wireless mic'],
    },
    {
      name: 'DJ — Full event',
      price: '',
      description: 'Ceremony + reception',
      includes: ['1 DJ + 1 MC', '8-hour coverage', 'Sound system', 'Lighting package'],
    },
    {
      name: 'Live band',
      price: '',
      description: '4-piece live band',
      includes: ['4-piece band', '2 × 45-min sets', 'PA system', 'Wireless mics'],
    },
  ],
  officiant: [
    {
      name: 'Civil ceremony',
      price: '',
      description: 'Standard civil officiation',
      includes: ['Pre-wedding consultation', 'Ceremony script', 'Officiation', 'Marriage paperwork'],
    },
    {
      name: 'Custom ceremony',
      price: '',
      description: 'Personalized vows + script',
      includes: [
        '2 consultations',
        'Custom-written script',
        'Rehearsal session',
        'Officiation',
        'Paperwork',
      ],
    },
  ],
  extras: [
    {
      name: 'Photo booth — 4 hours',
      price: '',
      description: 'Open-air booth with props',
      includes: ['4-hour rental', 'Unlimited prints', 'Custom backdrop', 'Attendant'],
    },
    {
      name: 'Lighting package',
      price: '',
      description: 'Reception uplighting',
      includes: ['12 uplights', 'Dance floor wash', 'Setup & strike'],
    },
  ],
  beauty: [
    {
      name: 'Bridal only',
      price: '',
      description: 'Hair + makeup for the bride',
      includes: ['1 trial session', 'Day-of hair', 'Day-of makeup', 'False lashes'],
    },
    {
      name: 'Bridal + party',
      price: '',
      description: 'Bride + bridal party',
      includes: ['1 trial session', 'Bride hair + makeup', 'Up to 4 bridesmaids', 'Touch-up kit'],
    },
  ],
}

export function getStarterPackages(categoryId: string | null | undefined): PackageDraft[] {
  if (!categoryId) return [newPackage()]
  const templates = TEMPLATES[categoryId]
  if (!templates) return [newPackage()]
  return templates.map((t) => newPackage(t))
}
