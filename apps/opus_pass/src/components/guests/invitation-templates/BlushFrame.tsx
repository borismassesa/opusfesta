import type { TemplateProps } from './_types'

export function BlushFrame({ names, date, venue, palette }: TemplateProps) {
  const vars = {
    '--iv-bg': palette.background,
    '--iv-surf': palette.surface,
    '--iv-acc': palette.accent,
    '--iv-tp': palette.textPrimary,
    '--iv-ts': palette.textSecondary,
  } as React.CSSProperties

  const parts = names.split(/\s*&\s*/)
  const line1 = parts[0] ?? names
  const line2 = parts[1]

  return (
    <svg
      viewBox="0 0 300 400"
      xmlns="http://www.w3.org/2000/svg"
      style={vars}
      className="absolute inset-0 w-full h-full"
    >
      <rect width="300" height="400" fill="var(--iv-bg)" />
      <rect x="14" y="14" width="272" height="372" fill="var(--iv-surf)" />
      <text
        x="150" y="172"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="7" letterSpacing="3"
        fill="var(--iv-acc)"
      >SAVE THE DATE</text>
      {line2 ? (
        <>
          <text
            x="150" y="197"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="18"
            fontStyle="italic" fill="var(--iv-tp)"
          >{line1}</text>
          <text
            x="150" y="218"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="18"
            fontStyle="italic" fill="var(--iv-tp)"
          >&amp; {line2}</text>
        </>
      ) : (
        <text
          x="150" y="208"
          textAnchor="middle" dominantBaseline="middle"
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="18"
          fontStyle="italic" fill="var(--iv-tp)"
        >{names}</text>
      )}
      <text
        x="150" y={line2 ? '240' : '230'}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="9" letterSpacing="2.2"
        fill="var(--iv-ts)"
      >{date}</text>
    </svg>
  )
}
