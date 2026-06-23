// ─────────────────────────────────────────────────────────────────────────────
//  Builder catalogs + doc composition
//  The builder panels (Design / Layout / Pages / Animation / Settings) edit a
//  small structured `meta` object plus the free-form `sections`. composeDoc()
//  folds those choices into a render-ready SiteDoc that SiteRenderer draws — for
//  the canvas, the live preview and the published page alike.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  FontKey,
  HeroSpec,
  LayoutKind,
  Palette,
  Section,
  SiteDoc,
  TemplateDecor,
} from './types'
import { buildTemplateSections, SECTION_PAGE } from './templateContent'

// ── Design presets ───────────────────────────────────────────────────────────

export type DesignStyle =
  | 'Elegant & Formal'
  | 'Floral'
  | 'Simple & Minimalist'
  | 'Modern'
  | 'Greenery'
  | 'Rustic'
  | 'Typography'

export type DesignColor =
  | 'Red'
  | 'Orange'
  | 'Yellow'
  | 'Green'
  | 'Blue'
  | 'Purple'
  | 'Pink'
  | 'Brown'
  | 'Neutral'

/** How the thumbnail hero is drawn — independent of the filter category. */
export type ThumbKind = 'photo' | 'floral' | 'text'

export type DesignPreset = {
  id: string
  name: string
  /** One-line vibe shown in the Design summary. */
  tagline: string
  style: DesignStyle
  color: DesignColor
  thumb: ThumbKind
  palette: Palette
  headingFont: FontKey
  bodyFont: FontKey
  /** Hero photo used when the layout calls for an image. */
  heroPhoto: string
  heroOverlay: number
  /** 3-4 swatch dots shown under the thumbnail. */
  swatches: string[]
  /** Decoration family — drives section dividers, eyebrows, motifs, surfaces. */
  decor: TemplateDecor
  /** Hero layout this template ships with. */
  defaultLayoutId: string
}

/** Backwards-compatible alias — these are full templates now, not just recolors. */
export type Template = DesignPreset

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'bagamoyo',
    name: 'Bagamoyo',
    tagline: 'Soft coastal watercolour — airy, romantic, beach-wedding calm.',
    style: 'Modern',
    color: 'Blue',
    thumb: 'photo',
    palette: { bg: '#F2F6F8', surface: '#FFFFFF', ink: '#28333B', accent: '#6E93A6', onAccent: '#FFFFFF' },
    headingFont: 'Cormorant Garamond',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/couples_together.jpg',
    heroOverlay: 26,
    swatches: ['#CFE0E6', '#6E93A6', '#28333B', '#EDE6D8'],
    decor: { motif: 'watercolor', eyebrow: 'tracked', divider: 'rule', card: 'soft', headingUpper: false },
    defaultLayoutId: 'full-width',
  },
  {
    id: 'serengeti',
    name: 'Serengeti',
    tagline: 'Botanical greenery and classic serif — fresh and timeless.',
    style: 'Greenery',
    color: 'Green',
    thumb: 'floral',
    palette: { bg: '#F1EFE8', surface: '#FFFFFF', ink: '#2F3B2A', accent: '#5C6B4D', onAccent: '#FFFFFF' },
    headingFont: 'Playfair Display',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/bridering.jpg',
    heroOverlay: 16,
    swatches: ['#D6E0CC', '#5C6B4D', '#2F3B2A'],
    decor: { motif: 'greenery', eyebrow: 'rule', divider: 'ornament', card: 'flat', headingUpper: false },
    defaultLayoutId: 'banner',
  },
  {
    id: 'tanzanite',
    name: 'Tanzanite',
    tagline: 'Deep navy and gold — a jewel-box, black-tie evening.',
    style: 'Elegant & Formal',
    color: 'Blue',
    thumb: 'text',
    palette: { bg: '#0F1A30', surface: '#16223C', ink: '#F4E9C6', accent: '#E8D9A7', onAccent: '#0F1A30' },
    headingFont: 'Playfair Display',
    bodyFont: 'Cormorant Garamond',
    heroPhoto: '/assets/images/churchcouples.jpg',
    heroOverlay: 46,
    swatches: ['#0F1A30', '#E8D9A7', '#16223C'],
    decor: { motif: 'deco', eyebrow: 'tracked', divider: 'ornament', card: 'bordered', headingUpper: true },
    defaultLayoutId: 'text-only',
  },
  {
    id: 'zahari',
    name: 'Zahari',
    tagline: 'Blush florals with a hand-script touch — soft and romantic.',
    style: 'Floral',
    color: 'Pink',
    thumb: 'floral',
    palette: { bg: '#FBF1F0', surface: '#FFFFFF', ink: '#5A2A35', accent: '#C28491', onAccent: '#FFFFFF' },
    headingFont: 'Cormorant Garamond',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/beautiful_bride.jpg',
    heroOverlay: 16,
    swatches: ['#F2C8CB', '#C28491', '#5A2A35'],
    decor: { motif: 'floral', eyebrow: 'script', divider: 'ornament', card: 'soft', headingUpper: false },
    defaultLayoutId: 'side-by-side',
  },
  {
    id: 'amani',
    name: 'Amani',
    tagline: 'Minimal editorial — crisp type, lots of white space.',
    style: 'Simple & Minimalist',
    color: 'Neutral',
    thumb: 'photo',
    palette: { bg: '#FFFFFF', surface: '#FFFFFF', ink: '#1A1A1A', accent: '#1A1A1A', onAccent: '#FFFFFF' },
    headingFont: 'Montserrat',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/cutesy_couple.jpg',
    heroOverlay: 18,
    swatches: ['#FFFFFF', '#9CA3AF', '#1A1A1A'],
    decor: { motif: 'minimal', eyebrow: 'tracked', divider: 'none', card: 'flat', headingUpper: true },
    defaultLayoutId: 'marquee',
  },
  {
    id: 'dhahabu',
    name: 'Dhahabu',
    tagline: 'Cream and gold with a monogram crest — classic and formal.',
    style: 'Elegant & Formal',
    color: 'Yellow',
    thumb: 'text',
    palette: { bg: '#FAF4EA', surface: '#FFFFFF', ink: '#3E2E20', accent: '#C49A6C', onAccent: '#1A1A1A' },
    headingFont: 'Playfair Display',
    bodyFont: 'Cormorant Garamond',
    heroPhoto: '/assets/images/couples_together.jpg',
    heroOverlay: 10,
    swatches: ['#1A1A1A', '#C49A6C', '#E6D3B3'],
    decor: { motif: 'crest', eyebrow: 'rule', divider: 'ornament', card: 'bordered', headingUpper: true },
    defaultLayoutId: 'text-only',
  },
  {
    id: 'kanga',
    name: 'Kanga',
    tagline: 'Bold East-African colour and pattern — vibrant and joyful.',
    style: 'Modern',
    color: 'Red',
    thumb: 'photo',
    palette: { bg: '#FBF6EF', surface: '#FFFFFF', ink: '#1A1A1A', accent: '#C0392B', onAccent: '#FFFFFF' },
    headingFont: 'Montserrat',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/brideincar.jpg',
    heroOverlay: 28,
    swatches: ['#C0392B', '#E2A53F', '#1A7A6A', '#1A1A1A'],
    decor: { motif: 'kanga', eyebrow: 'tracked', divider: 'ornament', card: 'filled', headingUpper: true },
    defaultLayoutId: 'squares',
  },
  {
    id: 'mwangaza',
    name: 'Mwangaza',
    tagline: 'Warm sunrise terracotta — golden-hour and welcoming.',
    style: 'Rustic',
    color: 'Orange',
    thumb: 'photo',
    palette: { bg: '#FDF3EC', surface: '#FFFFFF', ink: '#46291E', accent: '#C56A3E', onAccent: '#FFFFFF' },
    headingFont: 'Cormorant Garamond',
    bodyFont: 'Montserrat',
    heroPhoto: '/assets/images/coupleswithpiano.jpg',
    heroOverlay: 26,
    swatches: ['#F3C9A8', '#C56A3E', '#46291E'],
    decor: { motif: 'sunrise', eyebrow: 'tracked', divider: 'rule', card: 'soft', headingUpper: false },
    defaultLayoutId: 'slideshow',
  },
]

/** Alias — the catalog is full templates now. */
export const TEMPLATES = DESIGN_PRESETS

export const DESIGN_STYLES: DesignStyle[] = [
  'Elegant & Formal',
  'Floral',
  'Simple & Minimalist',
  'Modern',
  'Greenery',
  'Rustic',
  'Typography',
]

export const DESIGN_COLORS: DesignColor[] = [
  'Red',
  'Orange',
  'Yellow',
  'Green',
  'Blue',
  'Purple',
  'Pink',
  'Brown',
  'Neutral',
]

/** Swatch shown beside each colour option in the filter dropdown. */
export const COLOR_DOTS: Record<DesignColor, string> = {
  Red: '#E2483D',
  Orange: '#F08C36',
  Yellow: '#F4C542',
  Green: '#4CAF50',
  Blue: '#4F90E0',
  Purple: '#8B6FC9',
  Pink: '#E58FB4',
  Brown: '#8A6B4F',
  Neutral: '#B8B2A8',
}

export function getPreset(id: string): DesignPreset {
  return DESIGN_PRESETS.find((p) => p.id === id) ?? DESIGN_PRESETS[0]
}

// ── Layout options ───────────────────────────────────────────────────────────

export type LayoutOption = {
  id: string
  label: string
  kind: LayoutKind
  /** Photos the layout needs (min..max). 0 = text only. */
  min: number
  max: number
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  { id: 'banner', label: 'Banner', kind: 'banner', min: 1, max: 1 },
  { id: 'full-width', label: 'Full width', kind: 'full', min: 1, max: 1 },
  { id: 'side-by-side', label: 'Side by side', kind: 'side', min: 2, max: 2 },
  { id: 'squares', label: 'Squares', kind: 'squares', min: 2, max: 2 },
  { id: 'slideshow', label: 'Slideshow', kind: 'slideshow', min: 3, max: 6 },
  { id: 'marquee', label: 'Marquee', kind: 'marquee', min: 4, max: 6 },
  { id: 'text-only', label: 'Text only', kind: 'text', min: 0, max: 0 },
  { id: 'single-page', label: 'Single page', kind: 'single', min: 1, max: 1 },
]

export function getLayout(id: string): LayoutOption {
  return LAYOUT_OPTIONS.find((l) => l.id === id) ?? LAYOUT_OPTIONS[6]
}

/** "Photo (required)" / "Photos (2 required)" / "Photos (4 - 6 required)". */
export function photoLabel(l: LayoutOption): string {
  if (l.max === 0) return ''
  if (l.min === l.max) return l.max === 1 ? 'Photo (required)' : `Photos (${l.max} required)`
  return `Photos (${l.min} - ${l.max} required)`
}

/** Built-in couple photos used as defaults / padding when slots are empty. */
export const SAMPLE_PHOTOS = [
  '/assets/images/couples_together.jpg',
  '/assets/images/cutesy_couple.jpg',
  '/assets/images/coupleswithpiano.jpg',
  '/assets/images/authentic_couple.jpg',
  '/assets/images/churchcouples.jpg',
  '/assets/images/beautiful_bride.jpg',
]

// ── Animation catalogs (cosmetic, mirror Zola's premium tab) ─────────────────

export const ANIMATION_STYLES = [
  { id: 'none', label: 'None' },
  { id: 'date', label: 'Date' },
  { id: 'willow', label: 'Willow' },
  { id: 'seraphine', label: 'Seraphine' },
  { id: 'glenarden', label: 'Glenarden' },
]

export const TRANSITIONS = [
  { id: 'rise', label: 'Rise' },
  { id: 'pan', label: 'Pan' },
  { id: 'wipe', label: 'Wipe' },
  { id: 'breathe', label: 'Breathe' },
]

export const FONT_EFFECTS = [
  { id: 'none', label: 'None' },
  { id: 'shimmer', label: 'Shimmer' },
  { id: 'underline', label: 'Underline' },
]

// ── Date formatting (deterministic for SSR/CSR parity) ───────────────────────

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function formatLongDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  const [, y, mm, dd] = m
  const month = MONTHS[Number(mm) - 1] ?? ''
  return `${month} ${Number(dd)}, ${y}`
}

// ── Compose render-ready doc ─────────────────────────────────────────────────

const firstName = (full: string) => full.trim().split(/\s+/)[0] || full
const initial = (full: string) => (full.trim()[0] || '').toUpperCase()

/**
 * Fold the structured `meta` choices (design, layout, names, page visibility)
 * into a SiteDoc that SiteRenderer can draw. The hero is rebuilt from meta; the
 * theme comes from the chosen preset; nav reflects the visible pages.
 */
export function composeDoc(doc: SiteDoc): SiteDoc {
  const meta = doc.meta
  const preset = getPreset(meta.presetId)
  const layout = getLayout(meta.layoutId)
  // Per-design overrides (set from the Design summary) fall back to the preset.
  const accent = meta.accentOverride || preset.palette.accent
  const ink = meta.paragraphColor || preset.palette.ink
  const surface = meta.bgColor || preset.palette.surface
  const bg = meta.bgColor || preset.palette.bg
  const headingFont = meta.headingFont || preset.headingFont
  const bodyFont = meta.bodyFont || preset.bodyFont
  const palette = { ...preset.palette, accent, ink, surface, bg }
  const nameColor = meta.headingColor || accent

  // Resolve the photos this layout needs, padding empty slots with DISTINCT
  // library photos (slot 0 prefers the design's own hero photo).
  const slots = meta.photos ?? []
  const photos = Array.from({ length: layout.max }, (_, i) => {
    const u = slots[i]?.trim()
    if (u) return u
    return i === 0 ? preset.heroPhoto || SAMPLE_PHOTOS[0] : SAMPLE_PHOTOS[i % SAMPLE_PHOTOS.length]
  })

  const heroSpec: HeroSpec = {
    kind: layout.kind,
    photos,
    monogram: `${initial(meta.partnerA)} & ${initial(meta.partnerB)}`,
    partnerA: meta.partnerA,
    partnerB: meta.partnerB,
    dateLabel: `${formatLongDate(meta.date)}${meta.location ? `  ·  ${meta.location}` : ''}`,
    welcome: meta.welcome,
    countdownDate: meta.date,
    nameColor,
  }

  // The hero is composed from meta; everything below the hero is the TEMPLATE's
  // own content blueprint (distinct copy + section set + rhythm per template), so
  // switching template gives a genuinely fresh design — not a recoloured skeleton.
  const heroSection: Section = {
    id: 'sec_hero',
    type: 'hero',
    name: 'Home',
    layout: 'centered',
    padding: 0,
    background: { kind: 'color', value: surface, overlay: 0 },
    blocks: [],
    hero: heroSpec,
  }
  let bodySections = buildTemplateSections(meta.presetId, palette, headingFont, meta)
  // A chosen background colour applies site-wide.
  if (meta.bgColor) {
    bodySections = bodySections.map((s) => ({ ...s, background: { ...s.background, value: meta.bgColor! } }))
  }
  const sections = [heroSection, ...bodySections]

  // Keep only sections whose matching page is visible (hero/home always shows).
  const hidden = new Set(meta.pages.filter((p) => !p.visible).map((p) => p.key))
  const visibleSections = sections.filter((s) => {
    const page = SECTION_PAGE[s.id]
    if (!page || page === 'home') return true
    return !hidden.has(page as never)
  })

  const navLabels = meta.pages.filter((p) => p.visible).map((p) => p.label)

  return {
    ...doc,
    title: `${firstName(meta.partnerA)} & ${firstName(meta.partnerB)}`,
    nav: navLabels,
    theme: {
      palette,
      headingFont,
      bodyFont,
      decor: preset.decor,
    },
    sections: visibleSections,
  }
}
