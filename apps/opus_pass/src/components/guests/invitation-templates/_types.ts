export type InvitationPalette = {
  name?: string
  background: string
  surface: string
  accent: string
  textPrimary: string
  textSecondary: string
  muted: string
}

export type FontStyle =
  | 'serif' | 'script' | 'modern'
  | 'playfair' | 'cormorant' | 'dancing' | 'montserrat' | 'garamond'

// Per-section typography overrides — applied on top of template defaults
export type SectionStyle = {
  scale?: 0.75 | 1 | 1.25 | 1.5   // font-size multiplier
  fontWeight?: 'normal' | 'bold'
  align?: 'left' | 'center' | 'right'
  italic?: boolean
  uppercase?: boolean
  letterSpacing?: 'tight' | 'normal' | 'wide' | 'wider'
  color?: string                   // hex color override
  opacity?: number                 // 0–1
}

export type SectionStyles = {
  names?: SectionStyle
  familyIntro?: SectionStyle
  date?: SectionStyle
  time?: SectionStyle
  venue?: SectionStyle
  dressCode?: SectionStyle
  reception?: SectionStyle
  rsvpContact?: SectionStyle
  message?: SectionStyle
  messageAttr?: SectionStyle
}

export type TemplateProps = {
  names: string
  date: string
  venue: string
  palette: InvitationPalette
  time?: string
  dressCode?: string
  rsvpContact?: string
  receptionVenue?: string
  receptionTime?: string
  message?: string
  messageAttr?: string
  familyIntro?: string
  dressCodeColors?: string[]
  fontStyle?: FontStyle
  sectionStyles?: SectionStyles
}

// ─── SVG text attribute helpers ───────────────────────────────────────────────

type SvgAlign = 'start' | 'middle' | 'end'
type SvgDefaults = { x: number; textAnchor: SvgAlign; fontSize: number }

export type SvgTextAttrs = {
  x: number
  textAnchor: SvgAlign
  fontSize: number
  fontWeight: 'normal' | 'bold'
  /** Explicit italic override; undefined → let the template/font decide */
  fontStyle?: 'normal' | 'italic'
  /** Mapped from SectionStyle.letterSpacing; undefined → keep template default */
  letterSpacing?: number
  /** Hex color override; undefined → keep template default fill */
  fill?: string
  /** 0–1 opacity override; undefined → no override */
  opacity?: number
  /** true → force uppercase; false → force no-uppercase; undefined → template default */
  uppercase?: boolean
}

/** SectionStyle.letterSpacing token → SVG user-unit value */
const LETTER_SPACING_MAP: Record<NonNullable<SectionStyle['letterSpacing']>, number> = {
  tight:  -0.5,
  normal:  0,
  wide:    1.5,
  wider:   3,
}

/**
 * Merges a template's default SVG text attributes with optional per-section
 * overrides from the user. Pass `defaultAlign` so the function only overrides
 * when the user has explicitly chosen a different alignment.
 */
export function applySectionStyle(defaults: SvgDefaults, style?: SectionStyle): SvgTextAttrs {
  let { x, textAnchor } = defaults
  if (style?.align === 'left')   { x = 20;  textAnchor = 'start' }
  if (style?.align === 'center') { x = 150; textAnchor = 'middle' }
  if (style?.align === 'right')  { x = 280; textAnchor = 'end' }

  const fontSize     = Math.round(defaults.fontSize * (style?.scale ?? 1) * 10) / 10
  const fontWeight   = style?.fontWeight ?? 'normal'
  const fontStyle    = style?.italic != null ? (style.italic ? 'italic' : 'normal') : undefined
  const letterSpacing = style?.letterSpacing != null ? LETTER_SPACING_MAP[style.letterSpacing] : undefined
  const fill         = style?.color
  const opacity      = style?.opacity
  const uppercase    = style?.uppercase

  return { x, textAnchor, fontSize, fontWeight, fontStyle, letterSpacing, fill, opacity, uppercase }
}

// ─── Font resolution ──────────────────────────────────────────────────────────

export function resolveFont(style: FontStyle = 'serif') {
  type Entry = { family: string; italic: boolean }
  const map: Record<FontStyle, Entry> = {
    serif:      { family: "Georgia, 'Times New Roman', serif",            italic: false },
    script:     { family: "Georgia, 'Times New Roman', serif",            italic: true  },
    modern:     { family: 'system-ui, -apple-system, sans-serif',         italic: false },
    playfair:   { family: "var(--font-playfair), Georgia, serif",         italic: false },
    cormorant:  { family: "var(--font-cormorant), Georgia, serif",        italic: true  },
    dancing:    { family: "var(--font-dancing), cursive",                 italic: false },
    montserrat: { family: "var(--font-montserrat), system-ui, sans-serif",italic: false },
    garamond:   { family: "var(--font-garamond), Georgia, serif",         italic: false },
  }
  const { family, italic } = map[style] ?? map.serif
  return {
    namesStyle: { fontFamily: family, fontStyle: italic ? 'italic' : 'normal' } as React.CSSProperties,
    bodyStyle:  { fontFamily: family } as React.CSSProperties,
  }
}
