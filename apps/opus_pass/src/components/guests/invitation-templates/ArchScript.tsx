import type { TemplateProps } from './_types'
import { resolveFont, applySectionStyle } from './_types'

export function ArchScript({ names, date, venue, palette, message, messageAttr, fontStyle, sectionStyles }: TemplateProps) {
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
  const da = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 8  }, sectionStyles?.date)
  const va = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 7  }, sectionStyles?.venue)
  const ma = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 7  }, sectionStyles?.message)

  // Arch: centered at (150, 180), width ~240, height ~240, rounded top
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
      <g data-section="names">
        {line2 ? (
          <>
            <text x={na.x} y="184" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={na.fontWeight} fill="var(--iv-tp)">{line1}</text>
            <text x={na.x} y="206" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={na.fontWeight} fill="var(--iv-tp)">&amp; {line2}</text>
          </>
        ) : (
          <text x={na.x} y="196" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={na.fontWeight} fill="var(--iv-tp)">{names}</text>
        )}
      </g>
      <line x1="134" y1={line2 ? '224' : '214'} x2="166" y2={line2 ? '224' : '214'} stroke="var(--iv-acc)" strokeWidth="0.8" strokeOpacity="0.6" />
      <text data-section="date" x={da.x} y={line2 ? '240' : '230'} textAnchor={da.textAnchor} dominantBaseline="middle" fontFamily="inherit" fontSize={da.fontSize} fontWeight={da.fontWeight} letterSpacing="2.2" fill="var(--iv-ts)">{date.toUpperCase()}</text>
      {venue && (
        <text data-section="venue" x={va.x} y={line2 ? '252' : '242'} textAnchor={va.textAnchor} dominantBaseline="middle" fontFamily="inherit" fontSize={va.fontSize} fontWeight={va.fontWeight} fill="var(--iv-ts)">{venue}</text>
      )}
      {message && (
        <g data-section="message">
          <line x1="100" y1="300" x2="200" y2="300" stroke="var(--iv-acc)" strokeWidth="0.5" strokeOpacity="0.6" />
          <text x={ma.x} y="314" textAnchor={ma.textAnchor} dominantBaseline="middle" style={font.bodyStyle} fontSize={ma.fontSize} fontWeight={ma.fontWeight} fill="var(--iv-ts)">{message}</text>
          {messageAttr && <text x={ma.x} y="328" textAnchor={ma.textAnchor} dominantBaseline="middle" style={font.bodyStyle} fontSize={Math.round(ma.fontSize * 0.86 * 10) / 10} fill="var(--iv-mut)">{messageAttr}</text>}
        </g>
      )}
    </svg>
  )
}
