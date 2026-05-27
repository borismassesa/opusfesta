import type { TemplateProps } from './_types'

export function ArchScript({ names, date, venue, palette }: TemplateProps) {
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

  // Arch: centered at (150, 180), width ~240, height ~240, rounded top
  // SVG arc path: start bottom-left, arc to bottom-right
  const archPath = 'M 30 280 L 30 180 A 120 120 0 0 1 270 180 L 270 280'

  return (
    <svg
      viewBox="0 0 300 400"
      xmlns="http://www.w3.org/2000/svg"
      style={vars}
      className="absolute inset-0 w-full h-full"
    >
      <rect width="300" height="400" fill="var(--iv-bg)" />
      <path d={archPath} fill="none" stroke="var(--iv-acc)" strokeWidth="2" strokeOpacity="0.7" />
      {line2 ? (
        <>
          <text
            x="150" y="184"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="17"
            fontStyle="italic" fill="var(--iv-tp)"
          >{line1}</text>
          <text
            x="150" y="206"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="17"
            fontStyle="italic" fill="var(--iv-tp)"
          >&amp; {line2}</text>
        </>
      ) : (
        <text
          x="150" y="196"
          textAnchor="middle" dominantBaseline="middle"
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="17"
          fontStyle="italic" fill="var(--iv-tp)"
        >{names}</text>
      )}
      <line x1="134" y1={line2 ? '224' : '214'} x2="166" y2={line2 ? '224' : '214'} stroke="var(--iv-acc)" strokeWidth="0.8" strokeOpacity="0.6" />
      <text
        x="150" y={line2 ? '240' : '230'}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="8" letterSpacing="2.2"
        fill="var(--iv-ts)"
      >{date.toUpperCase()}</text>
    </svg>
  )
}
