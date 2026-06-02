import type { TemplateProps } from './_types'
import { resolveFont, applySectionStyle } from './_types'

export function ModernBlock({ names, date, venue, palette, message, messageAttr, fontStyle, sectionStyles }: TemplateProps) {
  const vars = {
    '--iv-bg': palette.background,
    '--iv-surf': palette.surface,
    '--iv-tp': palette.textPrimary,
    '--iv-ts': palette.textSecondary,
    '--iv-mut': palette.muted,
  } as React.CSSProperties

  const font = resolveFont(fontStyle)
  const parts = names.split(/\s*&\s*/)
  const line1 = parts[0] ?? names
  const line2 = parts[1]

  const na = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 16 }, sectionStyles?.names)
  const da = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 7  }, sectionStyles?.date)
  const ma = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 7  }, sectionStyles?.message)
  const namesFW = sectionStyles?.names?.fontWeight ?? (font.namesStyle.fontStyle === 'italic' ? 'normal' : '900')
  const isItalic = font.namesStyle.fontStyle === 'italic'

  return (
    <svg
      viewBox="0 0 300 400"
      xmlns="http://www.w3.org/2000/svg"
      style={vars}
      className="absolute inset-0 w-full h-full"
    >
      <rect width="300" height="400" fill="var(--iv-bg)" />
      {message && (
        <g data-section="message">
          <text x={ma.x} y="160" textAnchor={ma.textAnchor} dominantBaseline="middle" style={{ ...font.bodyStyle, ...(ma.fontStyle && { fontStyle: ma.fontStyle }) }} fontSize={ma.fontSize} fontWeight={ma.fontWeight} fill={ma.fill ?? 'rgba(100,100,100,0.7)'} opacity={ma.opacity}>{ma.uppercase ? message.toUpperCase() : message}</text>
          {messageAttr && <text x={ma.x} y="174" textAnchor={ma.textAnchor} dominantBaseline="middle" style={font.bodyStyle} fontSize={Math.round(ma.fontSize * 0.86 * 10) / 10} fill="rgba(100,100,100,0.5)">{messageAttr}</text>}
        </g>
      )}
      {/* Black block at bottom */}
      <rect x="0" y="300" width="300" height="100" fill="var(--iv-surf)" />
      <text data-section="date" x={da.x} y="316" textAnchor={da.textAnchor} dominantBaseline="middle" fontFamily="inherit" fontSize={da.fontSize} fontWeight={da.fontWeight} fontStyle={da.fontStyle} letterSpacing={da.letterSpacing ?? 3} fill={da.fill ?? 'var(--iv-ts)'} opacity={da.opacity}>{da.uppercase === false ? date : date.toUpperCase()}</text>
      <g data-section="names">
        {/* Template default: uppercase for non-italic fonts; sectionStyle.uppercase overrides when set */}
        {line2 ? (
          <>
            <text x={na.x} y="338" textAnchor={na.textAnchor} dominantBaseline="middle" style={{ ...font.namesStyle, ...(na.fontStyle && { fontStyle: na.fontStyle }) }} fontSize={na.fontSize} fontWeight={namesFW} fill={na.fill ?? 'var(--iv-tp)'} opacity={na.opacity} letterSpacing={na.letterSpacing ?? -0.5}>{(na.uppercase ?? !isItalic) ? line1.toUpperCase() : line1}</text>
            <text x={na.x} y="356" textAnchor={na.textAnchor} dominantBaseline="middle" style={{ ...font.namesStyle, ...(na.fontStyle && { fontStyle: na.fontStyle }) }} fontSize={na.fontSize} fontWeight={namesFW} fill={na.fill ?? 'var(--iv-tp)'} opacity={na.opacity} letterSpacing={na.letterSpacing ?? -0.5}>&amp; {(na.uppercase ?? !isItalic) ? line2.toUpperCase() : line2}</text>
          </>
        ) : (
          <text x={na.x} y="348" textAnchor={na.textAnchor} dominantBaseline="middle" style={{ ...font.namesStyle, ...(na.fontStyle && { fontStyle: na.fontStyle }) }} fontSize={na.fontSize} fontWeight={namesFW} fill={na.fill ?? 'var(--iv-tp)'} opacity={na.opacity} letterSpacing={na.letterSpacing ?? -0.5}>{(na.uppercase ?? !isItalic) ? names.toUpperCase() : names}</text>
        )}
      </g>
      <text
        x="150" y="378"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="8" letterSpacing="2.2"
        fill="var(--iv-mut)"
      >{venue.toUpperCase()}</text>
    </svg>
  )
}
