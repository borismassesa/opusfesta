// Shared category data for /invitations and /invitations/[category].
// Each entry maps a URL slug → category label + thumbnail + product-matching keywords.
// The `productMatchers` array is a list of substrings that will be matched
// (case-insensitive) against each product's `category` field on the catalog
// page to decide which products belong to this slug.

export type InvitationCategory = {
  slug: string
  label: string
  img: string
  alt: string
  /** Subtitle shown beneath the category title on the category page. */
  subtitle: string
  /** Substrings to match against `product.category` (case-insensitive). */
  productMatchers: string[]
}

export const INVITATION_CATEGORIES: InvitationCategory[] = [
  // Tanzanian wedding events
  {
    slug: 'save-the-date',
    label: 'Save the Date',
    img: '/assets/images/beautiful_bride.jpg',
    alt: 'Save the Date',
    subtitle: 'Announce your date in style. Sent by WhatsApp or SMS, opened by every guest before the formal invite arrives.',
    productMatchers: ['Save the Date'],
  },
  {
    slug: 'wedding',
    label: 'Wedding',
    img: '/assets/images/churchcouples.jpg',
    alt: 'Wedding ceremony',
    subtitle: 'The main event invite — bilingual, fully customisable, and designed for Tanzanian celebrations from Bagamoyo to Mwanza.',
    productMatchers: ['Wedding Invitations', 'All-in-One Wedding'],
  },
  {
    slug: 'send-off',
    label: 'Send-Off',
    img: '/assets/images/couples_together.jpg',
    alt: 'Send-Off',
    subtitle: 'Honour the Kuaga tradition with a card that reflects the moment. From the bride’s family to every guest invited to bless the journey.',
    productMatchers: ['Send-Off'],
  },
  {
    slug: 'kitchen-party',
    label: 'Kitchen Party',
    img: '/assets/images/flowers_pinky.jpg',
    alt: 'Kitchen Party — bridal shower florals',
    subtitle: 'Set the tone for the bridal shower. Playful designs the wadada will save, share, and screenshot — without losing the family elegance.',
    productMatchers: ['Bridal Shower', 'Kitchen Party'],
  },
  {
    slug: 'kadi-za-michango',
    label: 'Kadi za Michango & Vikao',
    img: '/assets/images/coupleswithpiano.jpg',
    alt: 'Kadi za Michango & Vikao',
    subtitle: 'Coordinate contributions and family meetings with formal, dignified designs. Built for the planning the rest of the world never sees.',
    productMatchers: ['Michango', 'Vikao'],
  },
  // Paper / stationery product types
  {
    slug: 'ceremony-and-reception',
    label: 'Ceremony & Reception',
    img: '/assets/images/ring_piano.jpg',
    alt: 'Ceremony & Reception stationery',
    subtitle: 'Welcome cards, processional details, and reception flow — everything that ties the day together in one matched suite.',
    productMatchers: ['Reception'],
  },
  {
    slug: 'invitations',
    label: 'Invitations',
    img: '/assets/images/cutesy_couple.jpg',
    alt: 'Wedding invitations',
    subtitle: 'The full wedding invitation suite — bilingual, with RSVP page and live guest list included on every order.',
    productMatchers: [
      'Wedding Invitations',
      'All-in-One Wedding',
      'Engagement Invitations',
      'Bridal Shower Invitations',
      'Birthday Invitations',
    ],
  },
  {
    slug: 'programs',
    label: 'Programs',
    img: '/assets/images/bridering.jpg',
    alt: 'Wedding programs',
    subtitle: 'Walk guests through the order of your day, in Swahili and English. Folded or single-sheet, printed or digital.',
    productMatchers: ['Programme', 'Program'],
  },
  {
    slug: 'thank-yous',
    label: 'Thank Yous',
    img: '/assets/images/hand_rings.jpg',
    alt: 'Thank you cards',
    subtitle: 'Send a heartfelt thank you after the day. Photo-led or hand-illustrated, with your message in your guests’ language.',
    productMatchers: ['Thank You'],
  },
  {
    slug: 'enclosures',
    label: 'Enclosures',
    img: '/assets/images/bride_umbrella.jpg',
    alt: 'Enclosure cards',
    subtitle: 'Tuck the details inside the invite — RSVP cards, accommodations, directions, dress code, and anything else worth a separate card.',
    productMatchers: ['Enclosure'],
  },
  {
    slug: 'menus',
    label: 'Menus',
    img: '/assets/images/authentic_couple.jpg',
    alt: 'Menu cards',
    subtitle: 'Beautifully laid-out menus your guests will want to keep. From the appetisers to the dessert, in Swahili or English.',
    productMatchers: ['Menu'],
  },
  {
    slug: 'place-cards',
    label: 'Place Cards',
    img: '/assets/images/brideincar.jpg',
    alt: 'Place cards',
    subtitle: 'Help every guest find their seat with name-personalised place cards that match your invitation suite.',
    productMatchers: ['Place Card'],
  },
  {
    slug: 'table-numbers',
    label: 'Table Numbers',
    img: '/assets/images/bridewithumbrella.jpg',
    alt: 'Table numbers',
    subtitle: 'Distinctive table numbers that move guests through the seating chart without breaking your design.',
    productMatchers: ['Table Number'],
  },
  {
    slug: 'napkins',
    label: 'Napkins',
    img: '/assets/images/beautyinbride.jpg',
    alt: 'Wedding napkins',
    subtitle: 'Personalised cocktail and dinner napkins with your names, date, or monogram — small details guests notice and remember.',
    productMatchers: ['Napkin'],
  },
  {
    slug: 'signs',
    label: 'Signs',
    img: '/assets/images/mauzo_crew.jpg',
    alt: 'Wedding signs',
    subtitle: 'Welcome signs, directional signage, and seating charts to guide every guest from the gate to their table.',
    productMatchers: ['Welcome Sign', 'Sign'],
  },
  {
    slug: 'stickers',
    label: 'Stickers',
    img: '/assets/images/cutesy_couple.jpg',
    alt: 'Wedding stickers',
    subtitle: 'Custom stickers for invitation envelopes, favour bags, gift boxes, and welcome bags. Small things, big consistency.',
    productMatchers: ['Sticker'],
  },
  {
    slug: 'paper-add-ons',
    label: 'Paper Add-ons',
    img: '/assets/images/hand_rings.jpg',
    alt: 'Paper add-ons',
    subtitle: 'All the extras: wax seals, ribbon, vellum overlays, foil-pressed accents, and the small finishes that elevate a printed suite.',
    productMatchers: ['Add-on'],
  },
]

export function findCategory(slug: string): InvitationCategory | undefined {
  return INVITATION_CATEGORIES.find((c) => c.slug === slug)
}

/**
 * Returns the subset of products whose `category` field matches any of the
 * given category's `productMatchers` (case-insensitive substring match).
 */
export function filterProductsByCategory<T extends { category: string }>(
  products: T[],
  slug: string,
): T[] {
  const cat = findCategory(slug)
  if (!cat) return []
  return products.filter((p) =>
    cat.productMatchers.some((m) => p.category.toLowerCase().includes(m.toLowerCase())),
  )
}
