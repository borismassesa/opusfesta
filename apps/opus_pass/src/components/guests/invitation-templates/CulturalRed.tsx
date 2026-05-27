import type { TemplateProps } from './_types'

export function CulturalRed({ names, date, venue, palette }: TemplateProps) {
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
      {/* Gold border */}
      <rect x="14" y="14" width="272" height="372" fill="none" stroke="var(--iv-acc)" strokeWidth="2" />
      <text
        x="150" y="160"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="Georgia, 'Times New Roman', serif" fontSize="10" letterSpacing="3"
        fill="var(--iv-acc)"
      >— KARIBU —</text>
      {line2 ? (
        <>
          <text
            x="150" y="186"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="16"
            fill="var(--iv-tp)"
          >{line1}</text>
          <text
            x="150" y="206"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="16"
            fill="var(--iv-tp)"
          >&amp; {line2}</text>
        </>
      ) : (
        <text
          x="150" y="196"
          textAnchor="middle" dominantBaseline="middle"
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="16"
          fill="var(--iv-tp)"
        >{names}</text>
      )}
      <text x="135" y={line2 ? '226' : '216'} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="var(--iv-acc)">✦</text>
      <text
        x="150" y={line2 ? '226' : '216'}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="9" letterSpacing="2.2"
        fill="var(--iv-ts)"
      >{date}</text>
      <text x="165" y={line2 ? '226' : '216'} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="var(--iv-acc)">✦</text>
      <text
        x="150" y={line2 ? '242' : '232'}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="7" letterSpacing="2.2"
        fill="var(--iv-mut)"
      >{venue.toUpperCase()}</text>
    </svg>
  )
}
