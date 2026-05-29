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

  const na = applySectionStyle({ x: 20, textAnchor: 'start', fontSize: 16 }, sectionStyles?.names)
  const da = applySectionStyle({ x: 20, textAnchor: 'start', fontSize: 7  }, sectionStyles?.date)
  const ma = applySectionStyle({ x: 20, textAnchor: 'start', fontSize: 7  }, sectionStyles?.message)
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
          <text x={ma.x} y="160" textAnchor={ma.textAnchor} dominantBaseline="middle" style={font.bodyStyle} fontSize={ma.fontSize} fontWeight={ma.fontWeight} fill="rgba(100,100,100,0.7)">{message}</text>
          {messageAttr && <text x={ma.x} y="174" textAnchor={ma.textAnchor} dominantBaseline="middle" style={font.bodyStyle} fontSize={Math.round(ma.fontSize * 0.86 * 10) / 10} fill="rgba(100,100,100,0.5)">{messageAttr}</text>}
        </g>
      )}
      {/* Black block at bottom */}
      <rect x="0" y="300" width="300" height="100" fill="var(--iv-surf)" />
      <text data-section="date" x={da.x} y="316" textAnchor={da.textAnchor} dominantBaseline="middle" fontFamily="inherit" fontSize={da.fontSize} fontWeight={da.fontWeight} letterSpacing="3" fill="var(--iv-ts)">{date.toUpperCase()}</text>
      <g data-section="names">
        {line2 ? (
          <>
            <text x={na.x} y="338" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={namesFW} fill="var(--iv-tp)" letterSpacing="-0.5">{isItalic ? line1 : line1.toUpperCase()}</text>
            <text x={na.x} y="356" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={namesFW} fill="var(--iv-tp)" letterSpacing="-0.5">&amp; {isItalic ? line2 : line2.toUpperCase()}</text>
          </>
        ) : (
          <text x={na.x} y="348" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={namesFW} fill="var(--iv-tp)" letterSpacing="-0.5">{isItalic ? names : names.toUpperCase()}</text>
        )}
      </g>
      <text
        x="20" y="378"
        dominantBaseline="middle"
        fontFamily="inherit" fontSize="8" letterSpacing="2.2"
        fill="var(--iv-mut)"
      >{venue.toUpperCase()}</text>
    </svg>
  )
}
