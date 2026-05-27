import type { TemplateProps } from './_types'

export function ClassicSerif({ names, date, venue, palette }: TemplateProps) {
  const vars = {
    '--iv-bg': palette.background,
    '--iv-acc': palette.accent,
    '--iv-tp': palette.textPrimary,
    '--iv-ts': palette.textSecondary,
    '--iv-mut': palette.muted,
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
      <text
        x="150" y="152"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="8" letterSpacing="3.2"
        fill="var(--iv-mut)"
      >SAVE THE DATE</text>
      {line2 ? (
        <>
          <text
            x="150" y="178"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="17"
            fill="var(--iv-tp)"
          >{line1}</text>
          <text
            x="150" y="198"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="17"
            fill="var(--iv-tp)"
          >&amp; {line2}</text>
        </>
      ) : (
        <text
          x="150" y="188"
          textAnchor="middle" dominantBaseline="middle"
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="17"
          fill="var(--iv-tp)"
        >{names}</text>
      )}
      <line x1="125" y1="216" x2="175" y2="216" stroke="var(--iv-acc)" strokeWidth="0.8" />
      <text
        x="150" y="232"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="10" letterSpacing="2.2"
        fill="var(--iv-ts)"
      >{date}</text>
      <text
        x="150" y="250"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="8" letterSpacing="2.2"
        fill="var(--iv-mut)"
      >{venue.toUpperCase()}</text>
    </svg>
  )
}
