// ─────────────────────────────────────────────────────────────────────────────
//  Wedding-website builder — document model
//  A SiteDoc is the single source of truth for the editor. The canvas, the
//  inspector, the live preview and the published page all render from it.
// ─────────────────────────────────────────────────────────────────────────────

export type FontKey =
  | 'Playfair Display'
  | 'Cormorant Garamond'
  | 'EB Garamond'
  | 'Montserrat'
  | 'Dancing Script'
  | 'Yellowtail'
  | 'Plus Jakarta Sans'

export type Align = 'left' | 'center' | 'right' | 'justify'

export type Palette = {
  bg: string
  surface: string
  ink: string
  accent: string
  onAccent: string
}

// ─────────────────────────────────────────────────────────────────────────────
//  Template decoration — what makes templates differ BELOW the hero (not just
//  recolour): the motif/ornament family, eyebrow + heading treatment, section
//  dividers and widget-surface style. Threaded through Theme → RenderCtx so the
//  renderer can draw per-template flourishes.
// ─────────────────────────────────────────────────────────────────────────────

export type Motif =
  | 'watercolor'
  | 'greenery'
  | 'deco'
  | 'floral'
  | 'minimal'
  | 'crest'
  | 'kanga'
  | 'sunrise'
  | 'heart'

export type TemplateDecor = {
  motif: Motif
  eyebrow: 'tracked' | 'rule' | 'script'
  divider: 'ornament' | 'rule' | 'none'
  card: 'soft' | 'bordered' | 'flat' | 'filled'
  headingUpper: boolean
}

export type Theme = {
  palette: Palette
  headingFont: FontKey
  bodyFont: FontKey
  decor?: TemplateDecor
}

export type BlockType =
  | 'eyebrow'
  | 'heading'
  | 'text'
  | 'button'
  | 'image'
  | 'divider'
  | 'countdown'
  | 'rsvp'
  | 'map'
  | 'registry'
  | 'gallery'
  | 'showcase'

export type BaseBlock = {
  id: string
  type: BlockType
  mt: number // top margin (px)
  mb: number // bottom margin (px)
  align: Align
}

export type EyebrowBlock = BaseBlock & {
  type: 'eyebrow'
  text: string
  color: string
  letterSpacing: number
}

export type HeadingBlock = BaseBlock & {
  type: 'heading'
  text: string
  font: FontKey
  fontSize: number
  letterSpacing: number
  color: string
  animation: string
  animate: boolean
}

export type TextBlock = BaseBlock & {
  type: 'text'
  text: string
  fontSize: number
  color: string
}

export type ButtonBlock = BaseBlock & {
  type: 'button'
  label: string
  href: string
  variant: 'solid' | 'outline'
}

export type ImageBlock = BaseBlock & {
  type: 'image'
  src: string
  alt: string
  radius: number
  height: number
}

export type DividerBlock = BaseBlock & { type: 'divider'; color: string }

export type CountdownBlock = BaseBlock & {
  type: 'countdown'
  date: string // ISO date
  label: string
}

export type RsvpBlock = BaseBlock & {
  type: 'rsvp'
  title: string
  note: string
}

export type MapBlock = BaseBlock & {
  type: 'map'
  venue: string
  address: string
}

export type RegistryItem = { id: string; label: string; href: string; hint: string }
export type RegistryBlock = BaseBlock & { type: 'registry'; items: RegistryItem[] }

export type GalleryBlock = BaseBlock & { type: 'gallery'; images: string[] }

/** A single icon + title + detail-lines card, e.g. "The When" / "The Where" / "Dress Code". */
export type ShowcaseItem = {
  icon: 'calendar' | 'pin' | 'sparkles'
  title: string
  lines: string[]
  swatches?: { hex: string; label: string }[]
}
export type ShowcaseBlock = BaseBlock & { type: 'showcase'; items: ShowcaseItem[] }

export type Block =
  | EyebrowBlock
  | HeadingBlock
  | TextBlock
  | ButtonBlock
  | ImageBlock
  | DividerBlock
  | CountdownBlock
  | RsvpBlock
  | MapBlock
  | RegistryBlock
  | GalleryBlock
  | ShowcaseBlock

export type SectionType = 'hero' | 'content' | 'rsvp' | 'details' | 'registry' | 'gallery'
export type HeroLayout = 'centered' | 'split' | 'photo'

/** The "Layout" tab's eight hero treatments. */
export type LayoutKind =
  | 'banner'
  | 'full'
  | 'side'
  | 'squares'
  | 'slideshow'
  | 'marquee'
  | 'text'
  | 'single'

/** A fully-resolved hero, composed from `meta` — drawn by SiteRenderer's HeroView. */
export type HeroSpec = {
  kind: LayoutKind
  photos: string[]
  monogram: string
  partnerA: string
  partnerB: string
  dateLabel: string
  welcome: string
  countdownDate: string
  nameColor: string
}

export type SectionBackground = {
  kind: 'image' | 'color'
  value: string
  overlay: number // 0..100, darkness over image
}

export type Section = {
  id: string
  type: SectionType
  name: string
  layout: HeroLayout
  background: SectionBackground
  padding: number
  blocks: Block[]
  /** Present only on the hero section; when set, HeroView renders it. */
  hero?: HeroSpec
}

// ─────────────────────────────────────────────────────────────────────────────
//  Builder meta — the structured, "Zola-style" knobs that live alongside the
//  free-form sections: the couple's names, the URL slug, page visibility,
//  animation choices and publish/privacy settings. The live preview is composed
//  from `meta` (hero) + `sections` (everything below the fold).
// ─────────────────────────────────────────────────────────────────────────────

export type PageKey =
  | 'home'
  | 'schedule'
  | 'travel'
  | 'registry'
  | 'guestbook'
  | 'party'
  | 'gallery'
  | 'things'
  | 'faqs'
  | 'rsvp'

export type BuilderPage = { key: PageKey; label: string; visible: boolean }

export type Visibility = 'published' | 'private'

export type BuilderMeta = {
  /** Couple */
  partnerA: string
  partnerB: string
  date: string // ISO date
  location: string
  welcome: string
  /** Design / layout / animation selections (ids into the catalogs) */
  presetId: string
  /** Per-design overrides on top of the preset; all clear on preset change. */
  accentOverride?: string // button & link colour
  headingFont?: FontKey
  bodyFont?: FontKey
  bgColor?: string
  headingColor?: string
  paragraphColor?: string
  navDifferent?: boolean
  layoutId: string
  /** Hero photos (per-slot); layouts use the first N. */
  photos: string[]
  animationStyle: string
  transition: string
  fontEffect: string
  /** Navigation pages */
  pages: BuilderPage[]
  /** Settings */
  slug: string
  visibility: Visibility
  announcement: boolean
  password: boolean
  searchVisible: boolean
}

export type SiteDoc = {
  title: string
  nav: string[]
  theme: Theme
  sections: Section[]
  meta: BuilderMeta
}

export type Selection =
  | { kind: 'block'; sectionId: string; blockId: string }
  | { kind: 'section'; sectionId: string }
  | null

export const FONT_STACKS: Record<FontKey, string> = {
  'Playfair Display': 'var(--font-playfair), Georgia, serif',
  'Cormorant Garamond': 'var(--font-cormorant), Georgia, serif',
  'EB Garamond': 'var(--font-garamond), Georgia, serif',
  Montserrat: 'var(--font-montserrat), system-ui, sans-serif',
  'Dancing Script': 'var(--font-dancing), cursive',
  Yellowtail: 'var(--font-yellowtail), cursive',
  'Plus Jakarta Sans': 'var(--font-jakarta), system-ui, sans-serif',
}

export const FONT_OPTIONS = Object.keys(FONT_STACKS) as FontKey[]

export const ANIMATIONS = ['Fade In Up', 'Fade In', 'Slide In Left', 'Zoom In', 'None']
