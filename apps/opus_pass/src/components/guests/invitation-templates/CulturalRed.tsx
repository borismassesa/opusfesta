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
        style={{ ...font.bodyStyle, ...(fa.fontStyle && { fontStyle: fa.fontStyle }) }} fontSize={fa.fontSize} fontWeight={fa.fontWeight} letterSpacing={fa.letterSpacing ?? 2}
        fill={fa.fill ?? 'var(--iv-acc)'} opacity={fa.opacity}
      >{fa.uppercase ? (familyIntro || '— KARIBU —').toUpperCase() : (familyIntro || '— KARIBU —')}</text>
      <g data-section="names">
        {line2 ? (
          <>
            <text x={na.x} y="186" textAnchor={na.textAnchor} dominantBaseline="middle" style={{ ...font.namesStyle, ...(na.fontStyle && { fontStyle: na.fontStyle }) }} fontSize={na.fontSize} fontWeight={na.fontWeight} fill={na.fill ?? 'var(--iv-tp)'} opacity={na.opacity}>{na.uppercase ? line1.toUpperCase() : line1}</text>
            <text x={na.x} y="206" textAnchor={na.textAnchor} dominantBaseline="middle" style={{ ...font.namesStyle, ...(na.fontStyle && { fontStyle: na.fontStyle }) }} fontSize={na.fontSize} fontWeight={na.fontWeight} fill={na.fill ?? 'var(--iv-tp)'} opacity={na.opacity}>&amp; {na.uppercase ? line2.toUpperCase() : line2}</text>
          </>
        ) : (
          <text x={na.x} y="196" textAnchor={na.textAnchor} dominantBaseline="middle" style={{ ...font.namesStyle, ...(na.fontStyle && { fontStyle: na.fontStyle }) }} fontSize={na.fontSize} fontWeight={na.fontWeight} fill={na.fill ?? 'var(--iv-tp)'} opacity={na.opacity}>{na.uppercase ? names.toUpperCase() : names}</text>
        )}
      </g>
      <text x="135" y={line2 ? '226' : '216'} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="var(--iv-acc)">✦</text>
      <text data-section="date" x={da.x} y={line2 ? '226' : '216'} textAnchor={da.textAnchor} dominantBaseline="middle" style={{ ...font.bodyStyle, ...(da.fontStyle && { fontStyle: da.fontStyle }) }} fontSize={da.fontSize} fontWeight={da.fontWeight} letterSpacing={da.letterSpacing ?? 2.2} fill={da.fill ?? 'var(--iv-ts)'} opacity={da.opacity}>{da.uppercase ? date.toUpperCase() : date}</text>
      <text x="165" y={line2 ? '226' : '216'} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="var(--iv-acc)">✦</text>
      <text data-section="venue" x={va.x} y={line2 ? '242' : '232'} textAnchor={va.textAnchor} dominantBaseline="middle" style={{ ...font.bodyStyle, ...(va.fontStyle && { fontStyle: va.fontStyle }) }} fontSize={va.fontSize} fontWeight={va.fontWeight} letterSpacing={va.letterSpacing ?? 2.2} fill={va.fill ?? 'var(--iv-mut)'} opacity={va.opacity}>{va.uppercase === false ? venue : venue.toUpperCase()}</text>
      {message && (
        <g data-section="message">
          <line x1="100" y1="280" x2="200" y2="280" stroke="var(--iv-acc)" strokeWidth="0.5" strokeOpacity="0.7" />
          <text x={ma.x} y="294" textAnchor={ma.textAnchor} dominantBaseline="middle" style={{ ...font.bodyStyle, ...(ma.fontStyle && { fontStyle: ma.fontStyle }) }} fontSize={ma.fontSize} fontWeight={ma.fontWeight} fill={ma.fill ?? 'var(--iv-ts)'} opacity={ma.opacity}>{ma.uppercase ? message.toUpperCase() : message}</text>
          {messageAttr && <text x={ma.x} y="308" textAnchor={ma.textAnchor} dominantBaseline="middle" style={font.bodyStyle} fontSize={Math.round(ma.fontSize * 0.86 * 10) / 10} fill="var(--iv-mut)">{messageAttr}</text>}
        </g>
      )}
    </svg>
  )
}
