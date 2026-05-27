import type { TemplateProps } from './_types'

export function NavyGold({ names, date, venue, palette }: TemplateProps) {
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
        x="150" y="150"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="8" letterSpacing="3.2"
        fill="var(--iv-acc)"
      >SAVE THE DATE</text>
      <line x1="144" y1="164" x2="156" y2="164" stroke="var(--iv-acc)" strokeWidth="1" />
      {line2 ? (
        <>
          <text
            x="150" y="190"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="17"
            fill="var(--iv-tp)"
          >{line1}</text>
          <text
            x="150" y="210"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="17"
            fill="var(--iv-tp)"
          >&amp; {line2}</text>
        </>
      ) : (
        <text
          x="150" y="200"
          textAnchor="middle" dominantBaseline="middle"
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="17"
          fill="var(--iv-tp)"
        >{names}</text>
      )}
      <text
        x="150" y={line2 ? '232' : '222'}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="9" letterSpacing="2.2"
        fill="var(--iv-ts)"
      >{date}</text>
      <text
        x="150" y={line2 ? '248' : '238'}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="7" letterSpacing="2.2"
        fill="var(--iv-mut)"
      >{venue.toUpperCase()}</text>
    </svg>
  )
}
