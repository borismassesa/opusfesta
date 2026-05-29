import type { TemplateProps } from './_types'
import { resolveFont, applySectionStyle } from './_types'

export function FloralBorder({ names, date, venue, palette, message, messageAttr, fontStyle, sectionStyles }: TemplateProps) {
  const vars = {
    '--iv-bg': palette.background,
    '--iv-acc': palette.accent,
    '--iv-tp': palette.textPrimary,
    '--iv-ts': palette.textSecondary,
    '--iv-mut': palette.muted,
  } as React.CSSProperties

  const font = resolveFont(fontStyle)
  const parts = names.split(/\s*&\s*/)
  const line1 = parts[0] ?? names
  const line2 = parts[1]

  const na = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 17 }, sectionStyles?.names)
  const da = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 9  }, sectionStyles?.date)
  const ma = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 7  }, sectionStyles?.message)

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
      <g data-section="names">
        {line2 ? (
          <>
            <text x={na.x} y="192" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={na.fontWeight} fill="var(--iv-tp)">{line1}</text>
            <text x={na.x} y="212" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={na.fontWeight} fill="var(--iv-tp)">&amp; {line2}</text>
          </>
        ) : (
          <text x={na.x} y="200" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={na.fontWeight} fill="var(--iv-tp)">{names}</text>
        )}
      </g>
      <line x1="131" y1={line2 ? '226' : '216'} x2="169" y2={line2 ? '226' : '216'} stroke="var(--iv-acc)" strokeWidth="1" />
      <text data-section="date" x={da.x} y={line2 ? '240' : '230'} textAnchor={da.textAnchor} dominantBaseline="middle" fontFamily="inherit" fontSize={da.fontSize} fontWeight={da.fontWeight} letterSpacing="1.8" fill="var(--iv-ts)">{date}</text>
      {message && (
        <g data-section="message">
          <line x1="100" y1="280" x2="200" y2="280" stroke="var(--iv-acc)" strokeWidth="0.5" strokeOpacity="0.6" />
          <text x={ma.x} y="294" textAnchor={ma.textAnchor} dominantBaseline="middle" style={font.bodyStyle} fontSize={ma.fontSize} fontWeight={ma.fontWeight} fill="var(--iv-ts)">{message}</text>
          {messageAttr && <text x={ma.x} y="308" textAnchor={ma.textAnchor} dominantBaseline="middle" style={font.bodyStyle} fontSize={Math.round(ma.fontSize * 0.86 * 10) / 10} fill="var(--iv-mut)">{messageAttr}</text>}
        </g>
      )}
    </svg>
  )
}
