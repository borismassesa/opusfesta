export type InvitationPalette = {
  name?: string
  background: string
  surface: string
  accent: string
  textPrimary: string
  textSecondary: string
  muted: string
}

export type TemplateProps = {
  names: string
  date: string
  venue: string
  palette: InvitationPalette
}
