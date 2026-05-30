import type { TemplateProps } from './_types'
import { resolveFont, applySectionStyle } from './_types'

export function CulturalRed({ names, date, venue, palette, message, messageAttr, fontStyle, sectionStyles, familyIntro }: TemplateProps) {
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

  const fa = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 10 }, sectionStyles?.familyIntro)
  const na = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 16 }, sectionStyles?.names)
  const da = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 9  }, sectionStyles?.date)
  const va = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 7  }, sectionStyles?.venue)
  const ma = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 7  }, sectionStyles?.message)

  return (
    <svg
      viewBox="0 0 300 400"
      xmlns="http://www.w3.org/2000/svg"
      style={vars}
      className="absolute inset-0 w-full h-full"
    >
      <rect width="300" height="400" fill="var(--iv-bg)" />
      {/* Gold border */}
      <rect x="14" y="14" width="272" height="372" fill="none" stroke="var(--iv-acc)" strokeWidth="2" />
      <text
        data-section="familyIntro"
        x={fa.x} y="160"
        textAnchor={fa.textAnchor} dominantBaseline="middle"
        style={font.bodyStyle} fontSize={fa.fontSize} fontWeight={fa.fontWeight} letterSpacing="2"
        fill="var(--iv-acc)"
      >{familyIntro || '— KARIBU —'}</text>
      <g data-section="names">
        {line2 ? (
          <>
            <text x={na.x} y="186" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={na.fontWeight} fill="var(--iv-tp)">{line1}</text>
            <text x={na.x} y="206" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={na.fontWeight} fill="var(--iv-tp)">&amp; {line2}</text>
          </>
        ) : (
          <text x={na.x} y="196" textAnchor={na.textAnchor} dominantBaseline="middle" style={font.namesStyle} fontSize={na.fontSize} fontWeight={na.fontWeight} fill="var(--iv-tp)">{names}</text>
        )}
      </g>
      <text x="135" y={line2 ? '226' : '216'} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="var(--iv-acc)">✦</text>
      <text data-section="date" x={da.x} y={line2 ? '226' : '216'} textAnchor={da.textAnchor} dominantBaseline="middle" style={font.bodyStyle} fontSize={da.fontSize} fontWeight={da.fontWeight} letterSpacing="2.2" fill="var(--iv-ts)">{date}</text>
      <text x="165" y={line2 ? '226' : '216'} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="var(--iv-acc)">✦</text>
      <text data-section="venue" x={va.x} y={line2 ? '242' : '232'} textAnchor={va.textAnchor} dominantBaseline="middle" style={font.bodyStyle} fontSize={va.fontSize} fontWeight={va.fontWeight} letterSpacing="2.2" fill="var(--iv-mut)">{venue.toUpperCase()}</text>
      {message && (
        <g data-section="message">
          <line x1="100" y1="280" x2="200" y2="280" stroke="var(--iv-acc)" strokeWidth="0.5" strokeOpacity="0.7" />
          <text x={ma.x} y="294" textAnchor={ma.textAnchor} dominantBaseline="middle" style={font.bodyStyle} fontSize={ma.fontSize} fontWeight={ma.fontWeight} fill="var(--iv-ts)">{message}</text>
          {messageAttr && <text x={ma.x} y="308" textAnchor={ma.textAnchor} dominantBaseline="middle" style={font.bodyStyle} fontSize={Math.round(ma.fontSize * 0.86 * 10) / 10} fill="var(--iv-mut)">{messageAttr}</text>}
        </g>
      )}
    </svg>
  )
}
