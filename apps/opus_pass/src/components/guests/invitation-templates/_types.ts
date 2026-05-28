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
  fontStyle?: FontStyle
}

export function resolveFont(style: FontStyle = 'serif') {
  switch (style) {
    case 'script':
      return { names: "Georgia, 'Times New Roman', serif", body: 'inherit', italic: true }
    case 'modern':
      return { names: 'system-ui, -apple-system, sans-serif', body: 'system-ui, -apple-system, sans-serif', italic: false }
    case 'playfair':
      return { names: "var(--font-playfair), Georgia, serif", body: 'inherit', italic: false }
    case 'cormorant':
      return { names: "var(--font-cormorant), Georgia, serif", body: 'inherit', italic: true }
    case 'dancing':
      return { names: "var(--font-dancing), cursive", body: 'inherit', italic: false }
    case 'montserrat':
      return { names: "var(--font-montserrat), system-ui, sans-serif", body: "var(--font-montserrat), system-ui, sans-serif", italic: false }
    case 'garamond':
      return { names: "var(--font-garamond), Georgia, serif", body: 'inherit', italic: false }
    case 'serif':
    default:
      return { names: "Georgia, 'Times New Roman', serif", body: 'inherit', italic: false }
  }
}
