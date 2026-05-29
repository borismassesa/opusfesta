import type { TemplateProps } from './_types'
import { resolveFont, applySectionStyle } from './_types'

export function SagePanel({ names, date, venue, palette, message, messageAttr, fontStyle, sectionStyles }: TemplateProps) {
  const vars = {
    '--iv-bg': palette.background,
    '--iv-surf': palette.surface,
    '--iv-acc': palette.accent,
    '--iv-tp': palette.textPrimary,
    '--iv-ts': palette.textSecondary,
    '--iv-mut': palette.muted,
  } as React.CSSProperties

  const font = resolveFont(fontStyle)
  const parts = names.split(/\s*&\s*/)
  const line1 = parts[0] ?? names
  const line2 = parts[1]

  const na = applySectionStyle({ x: 200, textAnchor: 'middle', fontSize: 16 }, sectionStyles?.names)
  const da = applySectionStyle({ x: 200, textAnchor: 'middle', fontSize: 8  }, sectionStyles?.date)
  const va = applySectionStyle({ x: 200, textAnchor: 'middle', fontSize: 7  }, sectionStyles?.venue)
  const ma = applySectionStyle({ x: 200, textAnchor: 'middle', fontSize: 7  }, sectionStyles?.message)

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
        x="200" y="172"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="7" letterSpacing="3"
        fill="var(--iv-acc)"
      >WEDDING</text>
      <g data-section="names">
        {line2 ? (
          <>
            <text x={na.x} y="196" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={na.fontWeight} fill="var(--iv-tp)">{line1}</text>
            <text x={na.x} y="215" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={na.fontWeight} fill="var(--iv-tp)">&amp; {line2}</text>
          </>
        ) : (
          <text x={na.x} y="205" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={na.fontWeight} fill="var(--iv-tp)">{names}</text>
        )}
      </g>
      <line x1="188" y1={line2 ? '228' : '218'} x2="212" y2={line2 ? '228' : '218'} stroke="var(--iv-acc)" strokeWidth="1" />
      <text data-section="date" x={da.x} y={line2 ? '242' : '232'} textAnchor={da.textAnchor} dominantBaseline="middle" fontFamily="inherit" fontSize={da.fontSize} fontWeight={da.fontWeight} letterSpacing="2.2" fill="var(--iv-ts)">{date}</text>
      <text data-section="venue" x={va.x} y={line2 ? '258' : '248'} textAnchor={va.textAnchor} dominantBaseline="middle" fontFamily="inherit" fontSize={va.fontSize} fontWeight={va.fontWeight} letterSpacing="1.8" fill="var(--iv-mut)">{venue.toUpperCase()}</text>
      {message && (
        <g data-section="message">
          <line x1="137" y1="292" x2="263" y2="292" stroke="var(--iv-acc)" strokeWidth="0.5" strokeOpacity="0.6" />
          <text x={ma.x} y="306" textAnchor={ma.textAnchor} dominantBaseline="middle" style={font.bodyStyle} fontSize={ma.fontSize} fontWeight={ma.fontWeight} fill="var(--iv-ts)">{message}</text>
          {messageAttr && <text x={ma.x} y="320" textAnchor={ma.textAnchor} dominantBaseline="middle" style={font.bodyStyle} fontSize={Math.round(ma.fontSize * 0.86 * 10) / 10} fill="var(--iv-mut)">{messageAttr}</text>}
        </g>
      )}
    </svg>
  )
}
