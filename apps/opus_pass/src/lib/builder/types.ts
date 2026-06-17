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

export type Align = 'left' | 'center' | 'right' | 'justify'

export type Palette = {
  bg: string
  surface: string
  ink: string
  accent: string
  onAccent: string
}

export type Theme = {
  palette: Palette
  headingFont: FontKey
  bodyFont: FontKey
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

export type SectionType = 'hero' | 'content' | 'rsvp' | 'details' | 'registry' | 'gallery'
export type HeroLayout = 'centered' | 'split' | 'photo'

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
}

export type SiteDoc = {
  title: string
  nav: string[]
  theme: Theme
  sections: Section[]
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
}

export const FONT_OPTIONS = Object.keys(FONT_STACKS) as FontKey[]

export const ANIMATIONS = ['Fade In Up', 'Fade In', 'Slide In Left', 'Zoom In', 'None']
