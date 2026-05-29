import type { Treatment, InvitationPalette } from '@/components/guests/InvitationVisual'
import type { InvitationContent } from '@/components/guests/StructuredInvitation'
import type { Product as BaseProduct } from '@/components/guests/productInfo'

// Catalog product — shared Product + visual treatment + optional designer/sample fields.
// Lives in a plain (non-'use client') module so both server and client components
// can import the dataset cleanly. Importing from a 'use client' file via a server
// component creates a client-reference proxy that doesn't materialise the values.
export type CatalogProduct = BaseProduct & {
  designer: string
  freeSample?: boolean
  treatment: Treatment
  /** Required for catalog products — TZS per digital card (the primary product). */
  digitalUnitPrice: number
  /** URL-safe slug (CMS-managed). Optional for bundled fallback products. */
  slug?: string
  /** Attached hero card artwork. When set, replaces the CSS `treatment` on the page. */
  imageUrl?: string
  /** Extra attached card views shown in the gallery. */
  gallery?: string[]
  /** Structured invite content. When set, overrides the category-derived default. */
  content?: InvitationContent
  /** Structured theme id. When set, overrides the treatment-derived theme. */
  themeId?: string
  /** Supabase public storage URL for the Figma-exported SVG. Populated by design team. */
  designImage?: string
  /** Per-swatch palettes — index matches swatches[]. Must equal swatches.length (1–5). */
  palettes: InvitationPalette[]
}

// Digital prices tiered by design complexity:
//   • Photo / heritage / all-in-one premium: TZS 12,000–15,000 per card
//   • Standard wedding designs:              TZS 10,000–11,000 per card
//   • Save the dates / day-of paper:         TZS 7,000–9,000 per card
export const PRODUCTS: CatalogProduct[] = [
  { id: 'p1',  category: 'Wedding Invitations',          designer: 'Bagamoyo Press',     name: 'Botanical Frame Wedding Invitations',         priceWas: 199000, priceNow: 119000, digitalUnitPrice: 10000, freeSample: true,  swatches: ['#A6B89A','#F5DCE2','#FBF7F2','#1A1A1A','#7A1F2B'],     treatment: 'floral-border',  designImage: '/assets/invitation-svgs/floral-border.svg',
    palettes: [
      { name: 'Sage Green',  background: '#FBF7F2', surface: '#FBF7F2', accent: '#A6B89A', textPrimary: '#1A1A1A', textSecondary: '#5C6B4D', muted: '#7A8A6E' },
      { name: 'Blush Pink',  background: '#FDF5F7', surface: '#FDF5F7', accent: '#F5DCE2', textPrimary: '#1A1A1A', textSecondary: '#A84F66', muted: '#C07080' },
      { name: 'Ivory',       background: '#FBF7F2', surface: '#FBF7F2', accent: '#D8CFC4', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
      { name: 'Onyx',        background: '#F0EEE9', surface: '#F0EEE9', accent: '#1A1A1A', textPrimary: '#1A1A1A', textSecondary: '#3A3A3A', muted: '#6B6B6B' },
      { name: 'Deep Red',    background: '#FBF2F0', surface: '#FBF2F0', accent: '#7A1F2B', textPrimary: '#1A1A1A', textSecondary: '#7A1F2B', muted: 'rgba(122,31,43,0.65)' },
    ],
  },
  { id: 'p2',  category: 'Wedding Invitations',          designer: 'House of Mwakali',   name: 'Heritage Crown Karibu Invitations',           priceWas: 215000, priceNow: 129000, digitalUnitPrice: 12000, freeSample: true,  swatches: ['#7A1F2B','#C8A35C','#F5EFE3','#1A1A1A'],               treatment: 'cultural-red',   designImage: '/assets/invitation-svgs/cultural-red.svg',
    palettes: [
      { name: 'Heritage Red',   background: '#7A1F2B', surface: '#7A1F2B', accent: '#C8A35C', textPrimary: '#F5EFE3', textSecondary: '#C8A35C', muted: 'rgba(200,163,92,0.8)' },
      { name: 'Midnight Gold',  background: '#1A1208', surface: '#1A1208', accent: '#C8A35C', textPrimary: '#FBF5E8', textSecondary: '#C8A35C', muted: 'rgba(200,163,92,0.75)' },
      { name: 'Cream & Crimson',background: '#F5EFE3', surface: '#F5EFE3', accent: '#7A1F2B', textPrimary: '#1A1A1A', textSecondary: '#7A1F2B', muted: 'rgba(122,31,43,0.7)' },
      { name: 'Onyx Gold',      background: '#1A1A1A', surface: '#1A1A1A', accent: '#C8A35C', textPrimary: '#F5EFE3', textSecondary: '#C8A35C', muted: 'rgba(200,163,92,0.7)' },
    ],
  },
  { id: 'p3',  category: 'All-in-One Wedding Invitations', designer: 'Studio Saba',      name: 'Modern Block All-in-one Invitations',                           priceNow: 132000, digitalUnitPrice: 11000, freeSample: false, swatches: ['#1A1A1A','#FBF7F2','#E8D9A7'],                          treatment: 'modern-block',
    palettes: [
      { name: 'Onyx',       background: '#FFFFFF', surface: '#1A1A1A', accent: '#1A1A1A', textPrimary: '#FFFFFF', textSecondary: 'rgba(255,255,255,0.6)', muted: 'rgba(255,255,255,0.6)' },
      { name: 'Ivory',      background: '#FBF7F2', surface: '#F0EDE5', accent: '#C4B9A8', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
      { name: 'Warm Gold',  background: '#FBF5E8', surface: '#E8D9A7', accent: '#C8A35C', textPrimary: '#1A1A1A', textSecondary: '#7A6030', muted: '#A8884C' },
    ],
  },
  { id: 'p4',  category: 'Save the Dates',               designer: 'Mzimbazi Studio',    name: 'Arch Script Save the Date Cards',                               priceNow: 98000,  digitalUnitPrice: 8000,  freeSample: true,  swatches: ['#7A1F2B','#F5EFE3','#A6B89A'],                          treatment: 'arch-script',
    palettes: [
      { name: 'Deep Red',   background: '#F5EFE3', surface: '#F5EFE3', accent: '#7A1F2B', textPrimary: '#7A1F2B', textSecondary: 'rgba(122,31,43,0.8)', muted: 'rgba(122,31,43,0.6)' },
      { name: 'Cream',      background: '#F5EFE3', surface: '#F5EFE3', accent: '#C4B9A8', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
      { name: 'Sage Green', background: '#EEF2EB', surface: '#EEF2EB', accent: '#A6B89A', textPrimary: '#2E3D28', textSecondary: '#5C6B4D', muted: '#7A8A6E' },
    ],
  },

  { id: 'p5',  category: 'Engagement Invitations',       designer: 'Pwani Paper Co.',    name: 'Sage Panel Engagement Invitations',           priceWas: 165000, priceNow: 99000,  digitalUnitPrice: 10000, freeSample: true,  swatches: ['#A6B89A','#FBF7F2','#5C6B4D'],                          treatment: 'sage-panel',
    palettes: [
      { name: 'Sage Panel',  background: '#A6B89A', surface: '#FBF7F2', accent: '#5C6B4D', textPrimary: '#1A1A1A', textSecondary: '#5C6B4D', muted: 'rgba(92,107,77,0.7)' },
      { name: 'Ivory',       background: '#FBF7F2', surface: '#FBF7F2', accent: '#A6B89A', textPrimary: '#1A1A1A', textSecondary: '#5C6B4D', muted: '#7A8A6E' },
      { name: 'Forest',      background: '#5C6B4D', surface: '#FBF7F2', accent: '#A6B89A', textPrimary: '#F5F2EC', textSecondary: 'rgba(245,242,236,0.8)', muted: 'rgba(245,242,236,0.6)' },
    ],
  },
  { id: 'p6',  category: 'Wedding Invitations',          designer: 'Studio Saba',        name: 'Navy & Gold Classic Invitations',                               priceNow: 189000, digitalUnitPrice: 12000, freeSample: false, swatches: ['#1E2D54','#E8D9A7','#F5EFE3','#C8A35C'],                treatment: 'navy-gold',      designImage: '/assets/invitation-svgs/navy-gold.svg',
    palettes: [
      { name: 'Navy & Gold',    background: '#1E2D54', surface: '#1E2D54', accent: '#E8D9A7', textPrimary: '#F5EFE3', textSecondary: '#E8D9A7', muted: 'rgba(232,217,167,0.7)' },
      { name: 'Champagne',      background: '#FBF5E8', surface: '#FBF5E8', accent: '#C8A35C', textPrimary: '#1E2D54', textSecondary: '#2E4080', muted: 'rgba(30,45,84,0.6)' },
      { name: 'Ivory & Navy',   background: '#F5EFE3', surface: '#F5EFE3', accent: '#1E2D54', textPrimary: '#1E2D54', textSecondary: '#2E4080', muted: 'rgba(30,45,84,0.55)' },
      { name: 'Midnight Gold',  background: '#1A1208', surface: '#1A1208', accent: '#C8A35C', textPrimary: '#FBF5E8', textSecondary: '#C8A35C', muted: 'rgba(200,163,92,0.7)' },
    ],
  },
  { id: 'p7',  category: 'Wedding Invitations',          designer: 'Bagamoyo Press',     name: 'Minimal Line Modern Invitations',                               priceNow: 112000, digitalUnitPrice: 9000,  freeSample: true,  swatches: ['#FFFFFF','#1A1A1A','#A6B89A'],                          treatment: 'minimal-line',
    palettes: [
      { name: 'White',      background: '#FFFFFF', surface: '#FFFFFF', accent: '#1A1A1A', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
      { name: 'Onyx',       background: '#1A1A1A', surface: '#1A1A1A', accent: '#FFFFFF', textPrimary: '#FFFFFF', textSecondary: 'rgba(255,255,255,0.7)', muted: 'rgba(255,255,255,0.5)' },
      { name: 'Sage',       background: '#EEF2EB', surface: '#EEF2EB', accent: '#A6B89A', textPrimary: '#2E3D28', textSecondary: '#5C6B4D', muted: '#7A8A6E' },
    ],
  },
  { id: 'p8',  category: 'Bridal Shower Invitations',    designer: 'House of Mwakali',   name: 'Blush Frame Bridal Shower Invitations',       priceWas: 145000, priceNow: 87000,  digitalUnitPrice: 9000,  freeSample: true,  swatches: ['#F5DCE2','#A84F66','#7A1F2B','#FBF7F2'],                treatment: 'blush-frame',
    palettes: [
      { name: 'Blush',       background: '#F5DCE2', surface: '#FFFFFF', accent: '#A84F66', textPrimary: '#7A1F2B', textSecondary: '#A84F66', muted: '#A84F66' },
      { name: 'Rose',        background: '#FDF0F3', surface: '#FFFFFF', accent: '#A84F66', textPrimary: '#A84F66', textSecondary: '#C07080', muted: 'rgba(168,79,102,0.6)' },
      { name: 'Deep Red',    background: '#7A1F2B', surface: '#FFFFFF', accent: '#F5DCE2', textPrimary: '#7A1F2B', textSecondary: '#A84F66', muted: '#C07080' },
      { name: 'Ivory',       background: '#FBF7F2', surface: '#FFFFFF', accent: '#C4B9A8', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
    ],
  },

  { id: 'p9',  category: 'Save the Dates',               designer: 'Lake Manyara Press', name: 'Two of Us Photo Save the Date Cards',                           priceNow: 167000, digitalUnitPrice: 12000, freeSample: false, swatches: ['#1A1A1A','#F5EFE3','#A6B89A'],                          treatment: 'photo-overlay',
    palettes: [
      { name: 'Dark Overlay',  background: 'transparent', surface: 'rgba(0,0,0,0.35)',   accent: 'rgba(255,255,255,0.6)', textPrimary: '#FFFFFF', textSecondary: 'rgba(255,255,255,0.8)', muted: 'rgba(255,255,255,0.7)' },
      { name: 'Soft Cream',    background: 'transparent', surface: 'rgba(245,239,227,0.55)', accent: '#C4B9A8', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
      { name: 'Sage Wash',     background: 'transparent', surface: 'rgba(166,184,154,0.45)', accent: '#5C6B4D', textPrimary: '#FFFFFF', textSecondary: 'rgba(255,255,255,0.85)', muted: 'rgba(255,255,255,0.65)' },
    ],
  },
  { id: 'p10', category: 'Wedding Invitations',          designer: 'Pwani Paper Co.',    name: 'Classic Serif Cream Invitations',             priceWas: 139000, priceNow: 83000,  digitalUnitPrice: 10000, freeSample: true,  swatches: ['#F5EFE3','#1A1A1A','#A6B89A','#C8A35C'],                treatment: 'classic-serif',  designImage: '/assets/invitation-svgs/classic-serif.svg',
    palettes: [
      { name: 'Classic Cream', background: '#F5EFE3', surface: '#F5EFE3', accent: '#C4B9A8', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
      { name: 'Onyx',          background: '#1A1A1A', surface: '#2A2A2A', accent: '#6B6B6B', textPrimary: '#F5EFE3', textSecondary: '#C4B9A8', muted: '#8D8D8D' },
      { name: 'Sage',          background: '#EEF2EB', surface: '#EEF2EB', accent: '#A6B89A', textPrimary: '#2E3D28', textSecondary: '#5C6B4D', muted: '#7A8A6E' },
      { name: 'Warm Gold',     background: '#FBF5E8', surface: '#FBF5E8', accent: '#C8A35C', textPrimary: '#2B1F0A', textSecondary: '#7A6030', muted: '#A8884C' },
    ],
  },
  { id: 'p11', category: 'Save the Dates',               designer: 'Mzimbazi Studio',    name: 'Botanical Frame Save the Date Cards',                           priceNow: 92000,  digitalUnitPrice: 8000,  freeSample: true,  swatches: ['#A6B89A','#F5DCE2','#FBF7F2'],                          treatment: 'floral-border',
    palettes: [
      { name: 'Sage Green', background: '#FBF7F2', surface: '#FBF7F2', accent: '#A6B89A', textPrimary: '#1A1A1A', textSecondary: '#5C6B4D', muted: '#7A8A6E' },
      { name: 'Blush Pink', background: '#FDF5F7', surface: '#FDF5F7', accent: '#F5DCE2', textPrimary: '#1A1A1A', textSecondary: '#A84F66', muted: '#C07080' },
      { name: 'Ivory',      background: '#FBF7F2', surface: '#FBF7F2', accent: '#D8CFC4', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
    ],
  },
  { id: 'p12', category: 'Reception Cards',              designer: 'Studio Saba',        name: 'Heritage Karibu Reception Cards',                               priceNow: 156000, digitalUnitPrice: 11000, freeSample: false, swatches: ['#7A1F2B','#C8A35C','#F5EFE3'],                          treatment: 'cultural-red',
    palettes: [
      { name: 'Heritage Red',    background: '#7A1F2B', surface: '#7A1F2B', accent: '#C8A35C', textPrimary: '#F5EFE3', textSecondary: '#C8A35C', muted: 'rgba(200,163,92,0.8)' },
      { name: 'Warm Gold',       background: '#FBF5E8', surface: '#FBF5E8', accent: '#C8A35C', textPrimary: '#2B1F0A', textSecondary: '#7A6030', muted: '#A8884C' },
      { name: 'Cream & Crimson', background: '#F5EFE3', surface: '#F5EFE3', accent: '#7A1F2B', textPrimary: '#1A1A1A', textSecondary: '#7A1F2B', muted: 'rgba(122,31,43,0.7)' },
    ],
  },

  { id: 'p13', category: 'Wedding Programmes',           designer: 'Bagamoyo Press',     name: 'Modern Block Wedding Programme',                                priceNow: 78000,  digitalUnitPrice: 7000,  freeSample: true,  swatches: ['#1A1A1A','#FBF7F2','#E8D9A7'],                          treatment: 'modern-block',
    palettes: [
      { name: 'Onyx',      background: '#FFFFFF', surface: '#1A1A1A', accent: '#1A1A1A', textPrimary: '#FFFFFF', textSecondary: 'rgba(255,255,255,0.6)', muted: 'rgba(255,255,255,0.6)' },
      { name: 'Ivory',     background: '#FBF7F2', surface: '#F0EDE5', accent: '#C4B9A8', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
      { name: 'Warm Gold', background: '#FBF5E8', surface: '#E8D9A7', accent: '#C8A35C', textPrimary: '#1A1A1A', textSecondary: '#7A6030', muted: '#A8884C' },
    ],
  },
  { id: 'p14', category: 'Menu Cards',                   designer: 'House of Mwakali',   name: 'Arch Script Reception Menu Cards',            priceWas: 89000,  priceNow: 53000,  digitalUnitPrice: 7000,  freeSample: true,  swatches: ['#7A1F2B','#F5EFE3','#A6B89A','#C8A35C'],                treatment: 'arch-script',
    palettes: [
      { name: 'Deep Red',   background: '#F5EFE3', surface: '#F5EFE3', accent: '#7A1F2B', textPrimary: '#7A1F2B', textSecondary: 'rgba(122,31,43,0.8)', muted: 'rgba(122,31,43,0.6)' },
      { name: 'Cream',      background: '#F5EFE3', surface: '#F5EFE3', accent: '#C4B9A8', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
      { name: 'Sage Green', background: '#EEF2EB', surface: '#EEF2EB', accent: '#A6B89A', textPrimary: '#2E3D28', textSecondary: '#5C6B4D', muted: '#7A8A6E' },
      { name: 'Warm Gold',  background: '#FBF5E8', surface: '#FBF5E8', accent: '#C8A35C', textPrimary: '#2B1F0A', textSecondary: '#7A6030', muted: '#A8884C' },
    ],
  },
  { id: 'p15', category: 'Thank You Cards',              designer: 'Pwani Paper Co.',    name: 'Sage Panel Thank You Cards',                                    priceNow: 56000,  digitalUnitPrice: 7000,  freeSample: false, swatches: ['#A6B89A','#FBF7F2','#5C6B4D'],                          treatment: 'sage-panel',
    palettes: [
      { name: 'Sage Panel', background: '#A6B89A', surface: '#FBF7F2', accent: '#5C6B4D', textPrimary: '#1A1A1A', textSecondary: '#5C6B4D', muted: 'rgba(92,107,77,0.7)' },
      { name: 'Ivory',      background: '#FBF7F2', surface: '#FBF7F2', accent: '#A6B89A', textPrimary: '#1A1A1A', textSecondary: '#5C6B4D', muted: '#7A8A6E' },
      { name: 'Forest',     background: '#5C6B4D', surface: '#FBF7F2', accent: '#A6B89A', textPrimary: '#F5F2EC', textSecondary: 'rgba(245,242,236,0.8)', muted: 'rgba(245,242,236,0.6)' },
    ],
  },
  { id: 'p16', category: 'All-in-One Wedding Invitations', designer: 'Studio Saba',      name: 'Navy & Gold All-in-one Invitations',                            priceNow: 215000, digitalUnitPrice: 13000, freeSample: true,  swatches: ['#1E2D54','#E8D9A7','#F5EFE3'],                          treatment: 'navy-gold',
    palettes: [
      { name: 'Navy & Gold',  background: '#1E2D54', surface: '#1E2D54', accent: '#E8D9A7', textPrimary: '#F5EFE3', textSecondary: '#E8D9A7', muted: 'rgba(232,217,167,0.7)' },
      { name: 'Champagne',    background: '#FBF5E8', surface: '#FBF5E8', accent: '#C8A35C', textPrimary: '#1E2D54', textSecondary: '#2E4080', muted: 'rgba(30,45,84,0.6)' },
      { name: 'Ivory & Navy', background: '#F5EFE3', surface: '#F5EFE3', accent: '#1E2D54', textPrimary: '#1E2D54', textSecondary: '#2E4080', muted: 'rgba(30,45,84,0.55)' },
    ],
  },

  { id: 'p17', category: 'Save the Dates',               designer: 'Lake Manyara Press', name: 'Minimal Line Save the Date Cards',            priceWas: 88000,  priceNow: 53000,  digitalUnitPrice: 7000,  freeSample: true,  swatches: ['#FFFFFF','#1A1A1A','#A6B89A'],                          treatment: 'minimal-line',
    palettes: [
      { name: 'White',  background: '#FFFFFF', surface: '#FFFFFF', accent: '#1A1A1A', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
      { name: 'Onyx',   background: '#1A1A1A', surface: '#1A1A1A', accent: '#FFFFFF', textPrimary: '#FFFFFF', textSecondary: 'rgba(255,255,255,0.7)', muted: 'rgba(255,255,255,0.5)' },
      { name: 'Sage',   background: '#EEF2EB', surface: '#EEF2EB', accent: '#A6B89A', textPrimary: '#2E3D28', textSecondary: '#5C6B4D', muted: '#7A8A6E' },
    ],
  },
  { id: 'p18', category: 'Birthday Invitations',         designer: 'Mzimbazi Studio',    name: 'Blush Frame Sweet Sixteen Invitations',                         priceNow: 119000, digitalUnitPrice: 10000, freeSample: false, swatches: ['#F5DCE2','#A84F66','#7A1F2B'],                          treatment: 'blush-frame',
    palettes: [
      { name: 'Blush',    background: '#F5DCE2', surface: '#FFFFFF', accent: '#A84F66', textPrimary: '#7A1F2B', textSecondary: '#A84F66', muted: '#A84F66' },
      { name: 'Rose',     background: '#FDF0F3', surface: '#FFFFFF', accent: '#A84F66', textPrimary: '#A84F66', textSecondary: '#C07080', muted: 'rgba(168,79,102,0.6)' },
      { name: 'Deep Red', background: '#7A1F2B', surface: '#FFFFFF', accent: '#F5DCE2', textPrimary: '#7A1F2B', textSecondary: '#A84F66', muted: '#C07080' },
    ],
  },
  { id: 'p19', category: 'Wedding Invitations',          designer: 'Bagamoyo Press',     name: 'Two of Us Photo Wedding Invitations',                           priceNow: 198000, digitalUnitPrice: 15000, freeSample: true,  swatches: ['#1A1A1A','#F5EFE3','#7A1F2B'],                          treatment: 'photo-overlay',
    palettes: [
      { name: 'Dark Overlay',   background: 'transparent', surface: 'rgba(0,0,0,0.35)',       accent: 'rgba(255,255,255,0.6)', textPrimary: '#FFFFFF', textSecondary: 'rgba(255,255,255,0.8)', muted: 'rgba(255,255,255,0.7)' },
      { name: 'Soft Cream',     background: 'transparent', surface: 'rgba(245,239,227,0.55)', accent: '#C4B9A8', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
      { name: 'Crimson Veil',   background: 'transparent', surface: 'rgba(122,31,43,0.45)',   accent: '#F5EFE3', textPrimary: '#FFFFFF', textSecondary: 'rgba(255,255,255,0.85)', muted: 'rgba(255,255,255,0.65)' },
    ],
  },
  { id: 'p20', category: 'Welcome Signs',                designer: 'House of Mwakali',   name: 'Classic Serif Welcome Sign Cards',            priceWas: 124000, priceNow: 74000,  digitalUnitPrice: 8000,  freeSample: true,  swatches: ['#F5EFE3','#1A1A1A','#C8A35C'],                          treatment: 'classic-serif',
    palettes: [
      { name: 'Classic Cream', background: '#F5EFE3', surface: '#F5EFE3', accent: '#C4B9A8', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
      { name: 'Onyx',          background: '#1A1A1A', surface: '#2A2A2A', accent: '#6B6B6B', textPrimary: '#F5EFE3', textSecondary: '#C4B9A8', muted: '#8D8D8D' },
      { name: 'Warm Gold',     background: '#FBF5E8', surface: '#FBF5E8', accent: '#C8A35C', textPrimary: '#2B1F0A', textSecondary: '#7A6030', muted: '#A8884C' },
    ],
  },
  { id: 'p21', category: 'Save the Dates', designer: 'Mzimbazi Studio', name: 'Teal Fiesta Save the Date Cards', priceNow: 95000, digitalUnitPrice: 8000, freeSample: true, swatches: ['#00a79d', '#0F2535', '#7A3B2E'], treatment: 'save-the-date',
    palettes: [
      { name: 'Teal & Gold',   background: '#00a79d', surface: '#00a79d', accent: '#6fc7b0', textPrimary: '#ffffff', textSecondary: '#ffffff', muted: 'rgba(255,255,255,0.65)' },
      { name: 'Ocean Night',   background: '#0F2535', surface: '#0F2535', accent: '#7EBFB5', textPrimary: '#EDF5F4', textSecondary: '#7EBFB5', muted: 'rgba(126,191,181,0.55)' },
      { name: 'Coral Terracotta', background: '#7A3B2E', surface: '#7A3B2E', accent: '#E8A87C', textPrimary: '#FDF0E8', textSecondary: '#E8A87C', muted: 'rgba(232,168,124,0.65)' },
    ],
  },
  { id: 'p22', category: 'Save the Dates', designer: 'Mzimbazi Studio', name: 'Teal Fiesta Photo Save the Date Cards', priceNow: 110000, digitalUnitPrice: 10000, freeSample: true, swatches: ['#00a79d', '#0F2535', '#7A3B2E'], treatment: 'save-the-date-photo',
    palettes: [
      { name: 'Teal & Gold',      background: '#00a79d', surface: '#00a79d', accent: '#6fc7b0', textPrimary: '#ffffff', textSecondary: '#ffffff', muted: 'rgba(255,255,255,0.65)' },
      { name: 'Ocean Night',      background: '#0F2535', surface: '#0F2535', accent: '#7EBFB5', textPrimary: '#EDF5F4', textSecondary: '#7EBFB5', muted: 'rgba(126,191,181,0.55)' },
      { name: 'Coral Terracotta', background: '#7A3B2E', surface: '#7A3B2E', accent: '#E8A87C', textPrimary: '#FDF0E8', textSecondary: '#E8A87C', muted: 'rgba(232,168,124,0.65)' },
    ],
  },
]

export function findProductById(id: string): CatalogProduct | undefined {
  return PRODUCTS.find((p) => p.id === id)
}
