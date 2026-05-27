import type { TemplateProps } from './_types'

export function MinimalLine({ names, date, venue, palette }: TemplateProps) {
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
      <line x1="20" y1="30" x2="280" y2="30" stroke="var(--iv-acc)" strokeWidth="1" />
      <text
        x="20" y="170"
        dominantBaseline="middle"
        fontFamily="inherit" fontSize="7" letterSpacing="3"
        fill="var(--iv-mut)"
      >TOGETHER WITH THEIR FAMILIES</text>
      {line2 ? (
        <>
          <text
            x="20" y="198"
            dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="18"
            fill="var(--iv-tp)"
          >{line1}</text>
          <text
            x="20" y="220"
            dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="18"
            fill="var(--iv-tp)"
          >&amp; {line2}</text>
        </>
      ) : (
        <text
          x="20" y="208"
          dominantBaseline="middle"
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="18"
          fill="var(--iv-tp)"
        >{names}</text>
      )}
      <text
        x="20" y={line2 ? '242' : '232'}
        dominantBaseline="middle"
        fontFamily="inherit" fontSize="9" letterSpacing="2.2"
        fill="var(--iv-ts)"
      >{date.toUpperCase()}</text>
      <line x1="20" y1="370" x2="280" y2="370" stroke="var(--iv-acc)" strokeWidth="1" />
    </svg>
  )
}
