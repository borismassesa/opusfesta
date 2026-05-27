import type { TemplateProps } from './_types'

export function FloralBorder({ names, date, venue, palette }: TemplateProps) {
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
      {/* Inner border */}
      <rect x="14" y="14" width="272" height="372" fill="none" stroke="var(--iv-acc)" strokeWidth="0.8" strokeOpacity="0.4" />
      {/* Corner dots */}
      <circle cx="14" cy="14" r="6" fill="var(--iv-acc)" fillOpacity="0.6" />
      <circle cx="286" cy="14" r="6" fill="var(--iv-mut)" />
      <circle cx="14" cy="386" r="6" fill="var(--iv-mut)" />
      <circle cx="286" cy="386" r="6" fill="var(--iv-acc)" fillOpacity="0.6" />
      <text
        x="150" y="168"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="7" letterSpacing="3"
        fill="var(--iv-ts)"
      >YOU ARE INVITED</text>
      {line2 ? (
        <>
          <text
            x="150" y="192"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="17"
            fontStyle="italic" fill="var(--iv-tp)"
          >{line1}</text>
          <text
            x="150" y="212"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="17"
            fontStyle="italic" fill="var(--iv-tp)"
          >&amp; {line2}</text>
        </>
      ) : (
        <text
          x="150" y="200"
          textAnchor="middle" dominantBaseline="middle"
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="17"
          fontStyle="italic" fill="var(--iv-tp)"
        >{names}</text>
      )}
      <line x1="131" y1={line2 ? '226' : '216'} x2="169" y2={line2 ? '226' : '216'} stroke="var(--iv-acc)" strokeWidth="1" />
      <text
        x="150" y={line2 ? '240' : '230'}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="9" letterSpacing="1.8"
        fill="var(--iv-ts)"
      >{date}</text>
    </svg>
  )
}
