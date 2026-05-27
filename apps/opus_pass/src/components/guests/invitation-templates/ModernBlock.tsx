import type { TemplateProps } from './_types'

export function ModernBlock({ names, date, venue, palette }: TemplateProps) {
  const vars = {
    '--iv-bg': palette.background,
    '--iv-surf': palette.surface,
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
      {/* Black block at bottom */}
      <rect x="0" y="300" width="300" height="100" fill="var(--iv-surf)" />
      <text
        x="20" y="316"
        dominantBaseline="middle"
        fontFamily="inherit" fontSize="7" letterSpacing="3"
        fill="var(--iv-ts)"
      >{date.toUpperCase()}</text>
      {line2 ? (
        <>
          <text
            x="20" y="338"
            dominantBaseline="middle"
            fontFamily="Arial, Helvetica, sans-serif" fontSize="16"
            fontWeight="900" fill="var(--iv-tp)"
            letterSpacing="-0.5"
          >{line1.toUpperCase()}</text>
          <text
            x="20" y="356"
            dominantBaseline="middle"
            fontFamily="Arial, Helvetica, sans-serif" fontSize="16"
            fontWeight="900" fill="var(--iv-tp)"
            letterSpacing="-0.5"
          >&amp; {line2.toUpperCase()}</text>
        </>
      ) : (
        <text
          x="20" y="348"
          dominantBaseline="middle"
          fontFamily="Arial, Helvetica, sans-serif" fontSize="16"
          fontWeight="900" fill="var(--iv-tp)"
          letterSpacing="-0.5"
        >{names.toUpperCase()}</text>
      )}
      <text
        x="20" y="378"
        dominantBaseline="middle"
        fontFamily="inherit" fontSize="8" letterSpacing="2.2"
        fill="var(--iv-mut)"
      >{venue.toUpperCase()}</text>
    </svg>
  )
}
