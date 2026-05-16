export type SubTrend = { name: string; img: string }

export type BridalCategory = {
  slug: string
  name: string
  title: string
  tagline: string
  img: string
  related: string[]
  subTrends: SubTrend[]
}

const RING_IMG = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80'
const BAND_IMG = 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80'
const DRESS_IMG = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80'
const BRIDESMAIDS_IMG = 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=400&q=80'
const VEIL_IMG = 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=400&q=80'
const SHOES_IMG = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80'
const SUIT_IMG = 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80'
const TIES_IMG = 'https://images.unsplash.com/photo-1589756823695-278bc923f962?auto=format&fit=crop&w=400&q=80'
const WATCH_IMG = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'
const VINTAGE_IMG = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80'
const GIFTS_IMG = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
const RECEPTION_IMG = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=400&q=80'

export const BRIDAL_CATEGORIES: BridalCategory[] = [
  {
    slug: 'bridal-trends',
    name: 'Bridal Trends',
    title: 'The Latest Bridal Trends',
    tagline: 'What couples are loving this season across Tanzania.',
    img: DRESS_IMG,
    related: ['wedding-dresses', 'veils-and-headpieces', 'bridal-shoes', 'wedding-jewellery'],
    subTrends: [
      { name: 'Garden Romance', img: DRESS_IMG },
      { name: 'Coastal Glow', img: VEIL_IMG },
      { name: 'Heritage Modern', img: BRIDESMAIDS_IMG },
      { name: 'Minimalist Ivory', img: SHOES_IMG },
      { name: 'Sunset Palette', img: RECEPTION_IMG },
    ],
  },
  {
    slug: 'engagement-rings',
    name: 'Engagement Rings',
    title: 'Featured Engagement Rings',
    tagline: 'Solitaires, halos, and custom-set diamonds from trusted jewellers.',
    img: RING_IMG,
    related: ['wedding-bands', 'wedding-jewellery', 'vintage-bridal-finds', 'custom-tailoring'],
    subTrends: [
      { name: 'Solitaires', img: RING_IMG },
      { name: 'Halo Settings', img: BAND_IMG },
      { name: 'Three-Stone', img: RING_IMG },
      { name: 'Vintage Inspired', img: VINTAGE_IMG },
      { name: 'Custom Sets', img: BAND_IMG },
    ],
  },
  {
    slug: 'wedding-bands',
    name: 'Wedding Bands',
    title: 'Wedding Bands to Last a Lifetime',
    tagline: 'Classic and modern bands in gold, platinum, and palladium.',
    img: BAND_IMG,
    related: ['engagement-rings', 'wedding-jewellery', 'mens-watches'],
    subTrends: [
      { name: 'Classic Gold', img: BAND_IMG },
      { name: 'Eternity Bands', img: RING_IMG },
      { name: 'Two-Tone', img: BAND_IMG },
      { name: 'Hand-Engraved', img: VINTAGE_IMG },
      { name: 'Matching Sets', img: RING_IMG },
    ],
  },
  {
    slug: 'wedding-dresses',
    name: 'Wedding Dresses',
    title: 'Wedding Dresses for Every Style',
    tagline: 'A-line, mermaid, ball gown, and tea-length — all from local ateliers.',
    img: DRESS_IMG,
    related: ['veils-and-headpieces', 'bridal-shoes', 'bridesmaid-dresses', 'bridal-trends'],
    subTrends: [
      { name: 'A-Line', img: DRESS_IMG },
      { name: 'Mermaid', img: BRIDESMAIDS_IMG },
      { name: 'Ball Gown', img: DRESS_IMG },
      { name: 'Sheath', img: BRIDESMAIDS_IMG },
      { name: 'Two-Piece', img: VEIL_IMG },
    ],
  },
  {
    slug: 'veils-and-headpieces',
    name: 'Veils & Headpieces',
    title: 'Veils & Headpieces',
    tagline: 'Cathedral veils, fingertip veils, tiaras, and hair vines.',
    img: VEIL_IMG,
    related: ['wedding-dresses', 'wedding-jewellery', 'bridal-shoes'],
    subTrends: [
      { name: 'Cathedral Veils', img: VEIL_IMG },
      { name: 'Birdcage', img: VEIL_IMG },
      { name: 'Tiaras', img: RING_IMG },
      { name: 'Hair Vines', img: VEIL_IMG },
      { name: 'Pearl Combs', img: BRIDESMAIDS_IMG },
    ],
  },
  {
    slug: 'bridal-shoes',
    name: 'Bridal Shoes',
    title: 'Bridal Shoes',
    tagline: 'Closed-toe pumps, block heels, and embellished flats.',
    img: SHOES_IMG,
    related: ['wedding-dresses', 'bridesmaid-dresses', 'wedding-jewellery'],
    subTrends: [
      { name: 'Satin Pumps', img: SHOES_IMG },
      { name: 'Block Heels', img: SHOES_IMG },
      { name: 'Embellished Flats', img: SHOES_IMG },
      { name: 'Slingbacks', img: SHOES_IMG },
      { name: 'Bridal Sandals', img: SHOES_IMG },
    ],
  },
  {
    slug: 'groom-suits',
    name: 'Groom Suits',
    title: 'Groom Suits & Tuxedos',
    tagline: 'Made-to-measure suits and tuxedos for the modern groom.',
    img: SUIT_IMG,
    related: ['groomsmen-looks', 'mens-watches', 'custom-tailoring'],
    subTrends: [
      { name: 'Three-Piece', img: SUIT_IMG },
      { name: 'Black Tuxedo', img: SUIT_IMG },
      { name: 'Linen Summer', img: SUIT_IMG },
      { name: 'Slim Cut', img: SUIT_IMG },
      { name: 'Double-Breasted', img: SUIT_IMG },
    ],
  },
  {
    slug: 'groomsmen-looks',
    name: 'Groomsmen Looks',
    title: 'Groomsmen Looks',
    tagline: 'Coordinated outfits, ties, and accessories for the wedding party.',
    img: TIES_IMG,
    related: ['groom-suits', 'mens-watches', 'bridal-party-gifts'],
    subTrends: [
      { name: 'Coordinated Suits', img: SUIT_IMG },
      { name: 'Mix-Tone', img: SUIT_IMG },
      { name: 'Bow Ties', img: TIES_IMG },
      { name: 'Pocket Squares', img: TIES_IMG },
      { name: 'Cufflinks', img: WATCH_IMG },
    ],
  },
  {
    slug: 'bridesmaid-dresses',
    name: 'Bridesmaid Dresses',
    title: 'Bridesmaid Dresses',
    tagline: 'Mix-and-match palettes, satin slips, and floor-length gowns.',
    img: BRIDESMAIDS_IMG,
    related: ['wedding-dresses', 'bridal-shoes', 'bridal-party-gifts'],
    subTrends: [
      { name: 'Sage Palette', img: BRIDESMAIDS_IMG },
      { name: 'Champagne', img: BRIDESMAIDS_IMG },
      { name: 'Floor-Length', img: BRIDESMAIDS_IMG },
      { name: 'Mismatched', img: BRIDESMAIDS_IMG },
      { name: 'Convertible', img: DRESS_IMG },
    ],
  },
  {
    slug: 'mens-watches',
    name: "Men's Watches",
    title: "Men's Wedding-Day Watches",
    tagline: 'Statement watches to wear on the day and keep forever.',
    img: WATCH_IMG,
    related: ['groom-suits', 'groomsmen-looks', 'wedding-jewellery'],
    subTrends: [
      { name: 'Dress Watches', img: WATCH_IMG },
      { name: 'Heritage Pieces', img: WATCH_IMG },
      { name: 'Two-Tone', img: WATCH_IMG },
      { name: 'Skeleton Dial', img: WATCH_IMG },
      { name: 'Bracelet Strap', img: WATCH_IMG },
    ],
  },
  {
    slug: 'vintage-bridal-finds',
    name: 'Vintage Bridal Finds',
    title: 'Vintage Bridal Finds',
    tagline: 'One-of-a-kind heirloom pieces and pre-loved gowns.',
    img: VINTAGE_IMG,
    related: ['wedding-dresses', 'wedding-jewellery', 'veils-and-headpieces'],
    subTrends: [
      { name: '1920s Glamour', img: VINTAGE_IMG },
      { name: '1950s Tea-Length', img: DRESS_IMG },
      { name: 'Heirloom Lace', img: VEIL_IMG },
      { name: 'Reworked Gowns', img: BRIDESMAIDS_IMG },
      { name: 'Antique Jewellery', img: RING_IMG },
    ],
  },
  {
    slug: 'bridal-party-gifts',
    name: 'Bridal Party Gifts',
    title: 'Bridal Party Gifts',
    tagline: 'Thoughtful keepsakes for bridesmaids, groomsmen, and parents.',
    img: GIFTS_IMG,
    related: ['bridesmaid-dresses', 'groomsmen-looks', 'wedding-jewellery'],
    subTrends: [
      { name: 'Engraved Keepsakes', img: GIFTS_IMG },
      { name: 'Spa Sets', img: GIFTS_IMG },
      { name: 'Personalised Robes', img: GIFTS_IMG },
      { name: 'Whisky Sets', img: GIFTS_IMG },
      { name: 'Photo Frames', img: GIFTS_IMG },
    ],
  },
  {
    slug: 'custom-tailoring',
    name: 'Custom Tailoring',
    title: 'Custom Tailoring',
    tagline: 'Book a fitting with a master tailor for a one-of-one fit.',
    img: SUIT_IMG,
    related: ['groom-suits', 'wedding-dresses', 'vintage-bridal-finds'],
    subTrends: [
      { name: 'Bespoke Suits', img: SUIT_IMG },
      { name: 'Couture Gowns', img: DRESS_IMG },
      { name: 'Made-to-Measure', img: SUIT_IMG },
      { name: 'Alterations', img: BRIDESMAIDS_IMG },
      { name: 'Embroidery', img: VINTAGE_IMG },
    ],
  },
  {
    slug: 'wedding-jewellery',
    name: 'Wedding Jewellery',
    title: 'Wedding Jewellery',
    tagline: 'Earrings, necklaces, and bracelets to complete the look.',
    img: RING_IMG,
    related: ['engagement-rings', 'wedding-bands', 'veils-and-headpieces'],
    subTrends: [
      { name: 'Pearl Pieces', img: VEIL_IMG },
      { name: 'Diamond Drops', img: RING_IMG },
      { name: 'Gold Bangles', img: BAND_IMG },
      { name: 'Statement Earrings', img: BRIDESMAIDS_IMG },
      { name: 'Layered Necklaces', img: RING_IMG },
    ],
  },
  {
    slug: 'reception-looks',
    name: 'Reception Looks',
    title: 'Reception Looks',
    tagline: 'Second-look dresses and dance-floor-ready styles for the after-party.',
    img: RECEPTION_IMG,
    related: ['wedding-dresses', 'bridal-shoes', 'wedding-jewellery'],
    subTrends: [
      { name: 'Slip Dresses', img: DRESS_IMG },
      { name: 'Sparkle Mini', img: BRIDESMAIDS_IMG },
      { name: 'Two-Piece Sets', img: DRESS_IMG },
      { name: 'Jumpsuits', img: BRIDESMAIDS_IMG },
      { name: 'Tea-Length', img: VINTAGE_IMG },
    ],
  },
]

export function getBridalCategory(slug: string): BridalCategory | undefined {
  return BRIDAL_CATEGORIES.find((c) => c.slug === slug)
}
