import type { TemplateProps } from './_types'

export function SagePanel({ names, date, venue, palette }: TemplateProps) {
  const vars = {
    '--iv-bg': palette.background,
    '--iv-surf': palette.surface,
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
      {/* Left sage panel */}
      <rect width="100" height="400" fill="var(--iv-bg)" />
      {/* Right cream panel */}
      <rect x="100" y="0" width="200" height="400" fill="var(--iv-surf)" />
      <text
        x="114" y="172"
        dominantBaseline="middle"
        fontFamily="inherit" fontSize="7" letterSpacing="3"
        fill="var(--iv-acc)"
      >WEDDING</text>
      {line2 ? (
        <>
          <text
            x="114" y="196"
            dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="16"
            fill="var(--iv-tp)"
          >{line1}</text>
          <text
            x="114" y="215"
            dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="16"
            fill="var(--iv-tp)"
          >&amp; {line2}</text>
        </>
      ) : (
        <text
          x="114" y="205"
          dominantBaseline="middle"
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="16"
          fill="var(--iv-tp)"
        >{names}</text>
      )}
      <line x1="114" y1={line2 ? '228' : '218'} x2="138" y2={line2 ? '228' : '218'} stroke="var(--iv-acc)" strokeWidth="1" />
      <text
        x="114" y={line2 ? '242' : '232'}
        dominantBaseline="middle"
        fontFamily="inherit" fontSize="8" letterSpacing="2.2"
        fill="var(--iv-ts)"
      >{date}</text>
      <text
        x="114" y={line2 ? '258' : '248'}
        dominantBaseline="middle"
        fontFamily="inherit" fontSize="7" letterSpacing="1.8"
        fill="var(--iv-mut)"
      >{venue.toUpperCase()}</text>
    </svg>
  )
}
