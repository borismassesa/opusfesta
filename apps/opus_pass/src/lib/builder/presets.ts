// ─────────────────────────────────────────────────────────────────────────────
//  Builder catalogs + doc composition
//  The builder panels (Design / Layout / Pages / Animation / Settings) edit a
//  small structured `meta` object plus the free-form `sections`. composeDoc()
//  folds those choices into a render-ready SiteDoc that SiteRenderer draws — for
//  the canvas, the live preview and the published page alike.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Block,
  FontKey,
  HeroLayout,
  Palette,
  SiteDoc,
} from './types'

// ── Design presets ───────────────────────────────────────────────────────────

export type DesignStyle = 'Photo' | 'Floral' | 'Minimal' | 'Classic' | 'Modern' | 'Rustic'
export type DesignColor = 'Neutral' | 'Green' | 'Blue' | 'Pink' | 'Bold' | 'Warm'

export type DesignPreset = {
  id: string
  name: string
  style: DesignStyle
  color: DesignColor
  palette: Palette
  headingFont: FontKey
  bodyFont: FontKey
  /** Hero photo used when the layout calls for an image. */
  heroPhoto: string
  heroOverlay: number
  /** 3-4 swatch dots shown under the thumbnail. */
  swatches: string[]
}

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'deepcreek',
    name: 'Deepcreek',
    style: 'Photo',
    color: 'Neutral',
    palette: { bg: '#F6F4EF', surface: '#FFFFFF', ink: '#2B2B2B', accent: '#9A7B53', onAccent: '#FFFFFF' },
    headingFont: 'Cormorant Garamond',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/couples_together.jpg',
    heroOverlay: 24,
    swatches: ['#E07A5F', '#9A7B53', '#2B2B2B', '#F6F4EF'],
  },
  {
    id: 'buxton',
    name: 'Buxton',
    style: 'Floral',
    color: 'Neutral',
    palette: { bg: '#F3EFE7', surface: '#FFFFFF', ink: '#3A3326', accent: '#8A8460', onAccent: '#FFFFFF' },
    headingFont: 'Playfair Display',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/flowers_pinky.jpg',
    heroOverlay: 10,
    swatches: ['#C7CBAE', '#8A8460', '#3A3326'],
  },
  {
    id: 'galata',
    name: 'Galata',
    style: 'Classic',
    color: 'Warm',
    palette: { bg: '#FBF6EE', surface: '#FFFFFF', ink: '#4A2C22', accent: '#B07A4C', onAccent: '#FFFFFF' },
    headingFont: 'Cormorant Garamond',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/churchcouples.jpg',
    heroOverlay: 22,
    swatches: ['#E6C9A8', '#B07A4C', '#4A2C22'],
  },
  {
    id: 'octavia',
    name: 'Octavia',
    style: 'Floral',
    color: 'Pink',
    palette: { bg: '#FBF1F0', surface: '#FFFFFF', ink: '#5A2A35', accent: '#C28491', onAccent: '#FFFFFF' },
    headingFont: 'Playfair Display',
    bodyFont: 'Cormorant Garamond',
    heroPhoto: '/assets/images/beautiful_bride.jpg',
    heroOverlay: 14,
    swatches: ['#F2C8CB', '#C28491', '#5A2A35'],
  },
  {
    id: 'goundry',
    name: 'Goundry',
    style: 'Classic',
    color: 'Bold',
    palette: { bg: '#F7F3EE', surface: '#FFFFFF', ink: '#1A1A1A', accent: '#7A1F2B', onAccent: '#FFFFFF' },
    headingFont: 'Playfair Display',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/bride_umbrella.jpg',
    heroOverlay: 26,
    swatches: ['#000000', '#7A1F2B', '#C49A6C', '#F7F3EE'],
  },
  {
    id: 'nahomi',
    name: 'Nahomi',
    style: 'Modern',
    color: 'Blue',
    palette: { bg: '#F2F6F8', surface: '#FFFFFF', ink: '#1B3A47', accent: '#4F7E94', onAccent: '#FFFFFF' },
    headingFont: 'Montserrat',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/coupleswithpiano.jpg',
    heroOverlay: 22,
    swatches: ['#CADFE6', '#4F7E94', '#1B3A47'],
  },
  {
    id: 'morrison',
    name: 'Morrison',
    style: 'Minimal',
    color: 'Neutral',
    palette: { bg: '#FFFFFF', surface: '#FFFFFF', ink: '#1A1A1A', accent: '#1A1A1A', onAccent: '#FFFFFF' },
    headingFont: 'Montserrat',
    bodyFont: 'Montserrat',
    heroPhoto: '/assets/images/cutesy_couple.jpg',
    heroOverlay: 18,
    swatches: ['#FFFFFF', '#9CA3AF', '#1A1A1A'],
  },
  {
    id: 'malina',
    name: 'Malina',
    style: 'Classic',
    color: 'Bold',
    palette: { bg: '#F4ECE2', surface: '#FFFFFF', ink: '#3A2419', accent: '#A23B2E', onAccent: '#FFFFFF' },
    headingFont: 'Playfair Display',
    bodyFont: 'Cormorant Garamond',
    heroPhoto: '/assets/images/brideincar.jpg',
    heroOverlay: 30,
    swatches: ['#A23B2E', '#D9B68C', '#3A2419'],
  },
  {
    id: 'poet',
    name: 'Poet',
    style: 'Minimal',
    color: 'Neutral',
    palette: { bg: '#F2EDE3', surface: '#FFFFFF', ink: '#2A2A2A', accent: '#8C7B63', onAccent: '#FFFFFF' },
    headingFont: 'Cormorant Garamond',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/authentic_couple.jpg',
    heroOverlay: 28,
    swatches: ['#D8CDBA', '#8C7B63', '#2A2A2A'],
  },
  {
    id: 'violin',
    name: 'Violin',
    style: 'Minimal',
    color: 'Neutral',
    palette: { bg: '#FFFFFF', surface: '#FFFFFF', ink: '#2B2B2B', accent: '#B59A7A', onAccent: '#FFFFFF' },
    headingFont: 'Cormorant Garamond',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/beautyinbride.jpg',
    heroOverlay: 16,
    swatches: ['#FFFFFF', '#E4D8C6', '#B59A7A'],
  },
  {
    id: 'abbey',
    name: 'Abbey',
    style: 'Photo',
    color: 'Blue',
    palette: { bg: '#EEF1F2', surface: '#FFFFFF', ink: '#22303A', accent: '#3E5C6B', onAccent: '#FFFFFF' },
    headingFont: 'Playfair Display',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/bridewithumbrella.jpg',
    heroOverlay: 26,
    swatches: ['#1F3A5F', '#3E5C6B', '#B7C4CC'],
  },
  {
    id: 'windsong',
    name: 'Windsong',
    style: 'Floral',
    color: 'Green',
    palette: { bg: '#F1EFE8', surface: '#FFFFFF', ink: '#2F3B2A', accent: '#5C6B4D', onAccent: '#FFFFFF' },
    headingFont: 'Cormorant Garamond',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/bridering.jpg',
    heroOverlay: 12,
    swatches: ['#D6E0CC', '#5C6B4D', '#2F3B2A'],
  },
  {
    id: 'bryn',
    name: 'Bryn',
    style: 'Rustic',
    color: 'Green',
    palette: { bg: '#EFEFE7', surface: '#FFFFFF', ink: '#2E332A', accent: '#6E7A56', onAccent: '#FFFFFF' },
    headingFont: 'Cormorant Garamond',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/hand_rings.jpg',
    heroOverlay: 24,
    swatches: ['#6E7A56', '#B8B89C', '#2E332A'],
  },
  {
    id: 'avila',
    name: 'Avila',
    style: 'Modern',
    color: 'Neutral',
    palette: { bg: '#F5F4F2', surface: '#FFFFFF', ink: '#2A2A2A', accent: '#7C7468', onAccent: '#FFFFFF' },
    headingFont: 'Montserrat',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/ring_piano.jpg',
    heroOverlay: 26,
    swatches: ['#FFFFFF', '#C9C2B6', '#2A2A2A'],
  },
  {
    id: 'eleanora',
    name: 'Eleanora',
    style: 'Classic',
    color: 'Warm',
    palette: { bg: '#FAF4EA', surface: '#FFFFFF', ink: '#3E2E20', accent: '#C49A6C', onAccent: '#1A1A1A' },
    headingFont: 'Playfair Display',
    bodyFont: 'Cormorant Garamond',
    heroPhoto: '/assets/images/couples_together.jpg',
    heroOverlay: 8,
    swatches: ['#000000', '#C49A6C', '#E6D3B3'],
  },
  {
    id: 'samai',
    name: 'Samai',
    style: 'Photo',
    color: 'Neutral',
    palette: { bg: '#F0EEE9', surface: '#FFFFFF', ink: '#242424', accent: '#8E8576', onAccent: '#FFFFFF' },
    headingFont: 'Cormorant Garamond',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/cutesy_couple.jpg',
    heroOverlay: 22,
    swatches: ['#8E8576', '#D5CFC3', '#242424'],
  },
  {
    id: 'latona',
    name: 'Latona',
    style: 'Modern',
    color: 'Bold',
    palette: { bg: '#EFEAE3', surface: '#FFFFFF', ink: '#1A1A1A', accent: '#9C5B3B', onAccent: '#FFFFFF' },
    headingFont: 'Montserrat',
    bodyFont: 'EB Garamond',
    heroPhoto: '/assets/images/coupleswithpiano.jpg',
    heroOverlay: 30,
    swatches: ['#9C5B3B', '#D8C4A8', '#1A1A1A'],
  },
  {
    id: 'twilight',
    name: 'Twilight',
    style: 'Modern',
    color: 'Bold',
    palette: { bg: '#0F1A30', surface: '#16223C', ink: '#F4E9C6', accent: '#E8D9A7', onAccent: '#0F1A30' },
    headingFont: 'Playfair Display',
    bodyFont: 'Cormorant Garamond',
    heroPhoto: '/assets/images/churchcouples.jpg',
    heroOverlay: 44,
    swatches: ['#0F1A30', '#E8D9A7', '#172846'],
  },
]

export const DESIGN_STYLES: DesignStyle[] = ['Photo', 'Floral', 'Minimal', 'Classic', 'Modern', 'Rustic']
export const DESIGN_COLORS: DesignColor[] = ['Neutral', 'Green', 'Blue', 'Pink', 'Bold', 'Warm']

export function getPreset(id: string): DesignPreset {
  return DESIGN_PRESETS.find((p) => p.id === id) ?? DESIGN_PRESETS[0]
}

// ── Layout options ───────────────────────────────────────────────────────────

export type LayoutOption = { id: string; label: string; hero: HeroLayout; photo: boolean }

export const LAYOUT_OPTIONS: LayoutOption[] = [
  { id: 'banner', label: 'Banner', hero: 'photo', photo: true },
  { id: 'full-width', label: 'Full width', hero: 'photo', photo: true },
  { id: 'side-by-side', label: 'Side by side', hero: 'split', photo: true },
  { id: 'squares', label: 'Squares', hero: 'photo', photo: true },
  { id: 'slideshow', label: 'Slideshow', hero: 'photo', photo: true },
  { id: 'marquee', label: 'Marquee', hero: 'photo', photo: true },
  { id: 'text-only', label: 'Text only', hero: 'centered', photo: false },
  { id: 'single-page', label: 'Single page', hero: 'centered', photo: false },
]

export function getLayout(id: string): LayoutOption {
  return LAYOUT_OPTIONS.find((l) => l.id === id) ?? LAYOUT_OPTIONS[6]
}

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

/**
 * Fold the structured `meta` choices (design, layout, names, page visibility)
 * into a SiteDoc that SiteRenderer can draw. The hero is rebuilt from meta; the
 * theme comes from the chosen preset; nav reflects the visible pages.
 */
export function composeDoc(doc: SiteDoc): SiteDoc {
  const meta = doc.meta
  const preset = getPreset(meta.presetId)
  const layout = getLayout(meta.layoutId)
  const onPhoto = layout.photo
  const nameColor = onPhoto ? '#FFFFFF' : preset.palette.accent
  const subColor = onPhoto ? '#FFFFFF' : preset.palette.ink

  const heroBlocks: Block[] = [
    {
      id: 'blk_name_a',
      type: 'heading',
      text: meta.partnerA,
      font: preset.headingFont,
      fontSize: 46,
      letterSpacing: 0,
      color: nameColor,
      animation: 'Fade In Up',
      animate: meta.animationStyle !== 'none',
      align: 'center',
      mt: 0,
      mb: 8,
    },
    {
      id: 'blk_amp',
      type: 'text',
      text: '&',
      fontSize: 20,
      color: preset.palette.accent,
      align: 'center',
      mt: 0,
      mb: 8,
    },
    {
      id: 'blk_name_b',
      type: 'heading',
      text: meta.partnerB,
      font: preset.headingFont,
      fontSize: 46,
      letterSpacing: 0,
      color: nameColor,
      animation: 'Fade In Up',
      animate: meta.animationStyle !== 'none',
      align: 'center',
      mt: 0,
      mb: 24,
    },
    {
      id: 'blk_date',
      type: 'eyebrow',
      text: `${formatLongDate(meta.date)}${meta.location ? `  ·  ${meta.location}` : ''}`,
      color: subColor,
      letterSpacing: 24,
      align: 'center',
      mt: 0,
      mb: 24,
    },
    {
      id: 'blk_count',
      type: 'countdown',
      date: meta.date,
      label: '',
      align: 'center',
      mt: 8,
      mb: 0,
    },
  ]

  if (meta.welcome.trim()) {
    heroBlocks.splice(3, 0, {
      id: 'blk_welcome',
      type: 'text',
      text: meta.welcome,
      fontSize: 16,
      color: subColor,
      align: 'center',
      mt: 0,
      mb: 20,
    })
  }

  const sections = doc.sections.map((s) => {
    if (s.id !== 'sec_hero') return s
    return {
      ...s,
      layout: layout.hero,
      padding: onPhoto ? 104 : 92,
      background: onPhoto
        ? { kind: 'image' as const, value: preset.heroPhoto, overlay: preset.heroOverlay }
        : { kind: 'color' as const, value: preset.palette.surface, overlay: 0 },
      blocks: heroBlocks,
    }
  })

  // Keep only sections whose matching page is visible (hero/home always shows).
  const hidden = new Set(meta.pages.filter((p) => !p.visible).map((p) => p.key))
  const sectionPage: Record<string, string> = {
    sec_story: 'home',
    sec_details: 'schedule',
    sec_registry: 'registry',
    sec_rsvp: 'rsvp',
  }
  const visibleSections = sections.filter((s) => {
    const page = sectionPage[s.id]
    if (!page || page === 'home') return true
    return !hidden.has(page as never)
  })

  const navLabels = meta.pages.filter((p) => p.visible).map((p) => p.label)

  return {
    ...doc,
    title: `${firstName(meta.partnerA)} & ${firstName(meta.partnerB)}`,
    nav: navLabels,
    theme: {
      palette: preset.palette,
      headingFont: preset.headingFont,
      bodyFont: preset.bodyFont,
    },
    sections: visibleSections,
  }
}
