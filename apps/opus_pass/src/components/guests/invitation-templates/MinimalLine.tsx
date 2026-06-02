import type { TemplateProps } from './_types'
import { resolveFont, applySectionStyle } from './_types'

export function MinimalLine({ names, date, venue, palette, message, messageAttr, fontStyle, sectionStyles }: TemplateProps) {
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

  const na = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 18 }, sectionStyles?.names)
  const da = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 9  }, sectionStyles?.date)
  const va = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 8  }, sectionStyles?.venue)
  const ma = applySectionStyle({ x: 150, textAnchor: 'middle', fontSize: 7  }, sectionStyles?.message)

  return (
    <svg
      viewBox="0 0 300 400"
      xmlns="http://www.w3.org/2000/svg"
      style={vars}
      className="absolute inset-0 w-full h-full"
    >
      <rect width="300" height="400" fill="var(--iv-bg)" />
      <line x1="20" y1="30" x2="280" y2="30" stroke="var(--iv-acc)" strokeWidth="1" />
      <text
        x="150" y="170"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="inherit" fontSize="7" letterSpacing="3"
        fill="var(--iv-mut)"
      >TOGETHER WITH THEIR FAMILIES</text>
      <g data-section="names">
        {line2 ? (
          <>
            <text
              x={na.x} y="198"
              textAnchor={na.textAnchor} dominantBaseline="middle"
              style={{ ...font.namesStyle, ...(na.fontStyle && { fontStyle: na.fontStyle }) }} fontSize={na.fontSize} fontWeight={na.fontWeight}
              fill={na.fill ?? 'var(--iv-tp)'} opacity={na.opacity}
            >{na.uppercase ? line1.toUpperCase() : line1}</text>
            <text
              x={na.x} y="220"
              textAnchor={na.textAnchor} dominantBaseline="middle"
              style={{ ...font.namesStyle, ...(na.fontStyle && { fontStyle: na.fontStyle }) }} fontSize={na.fontSize} fontWeight={na.fontWeight}
              fill={na.fill ?? 'var(--iv-tp)'} opacity={na.opacity}
            >&amp; {na.uppercase ? line2.toUpperCase() : line2}</text>
          </>
        ) : (
          <text
            x={na.x} y="208"
            textAnchor={na.textAnchor} dominantBaseline="middle"
            style={{ ...font.namesStyle, ...(na.fontStyle && { fontStyle: na.fontStyle }) }} fontSize={na.fontSize} fontWeight={na.fontWeight}
            fill={na.fill ?? 'var(--iv-tp)'} opacity={na.opacity}
          >{na.uppercase ? names.toUpperCase() : names}</text>
        )}
      </g>
      <text
        data-section="date"
        x={da.x} y={line2 ? '242' : '232'}
        textAnchor={da.textAnchor} dominantBaseline="middle"
        fontFamily="inherit" fontSize={da.fontSize} fontWeight={da.fontWeight} fontStyle={da.fontStyle} letterSpacing={da.letterSpacing ?? 2.2}
        fill={da.fill ?? 'var(--iv-ts)'} opacity={da.opacity}
      >{da.uppercase === false ? date : date.toUpperCase()}</text>
      <text
        data-section="venue"
        x={va.x} y={line2 ? '258' : '248'}
        textAnchor={va.textAnchor} dominantBaseline="middle"
        fontFamily="inherit" fontSize={va.fontSize} fontWeight={va.fontWeight} fontStyle={va.fontStyle} letterSpacing={va.letterSpacing ?? 1.5}
        fill={va.fill ?? 'var(--iv-mut)'} opacity={va.opacity}
      >{va.uppercase === false ? venue : venue.toUpperCase()}</text>
      {message && (
        <g data-section="message">
          <line x1="100" y1="275" x2="200" y2="275" stroke="var(--iv-acc)" strokeWidth="0.5" strokeOpacity="0.6" />
          <text
            x={ma.x} y="289"
            textAnchor={ma.textAnchor} dominantBaseline="middle"
            style={{ ...font.bodyStyle, ...(ma.fontStyle && { fontStyle: ma.fontStyle }) }} fontSize={ma.fontSize} fontWeight={ma.fontWeight}
            fill={ma.fill ?? 'var(--iv-ts)'} opacity={ma.opacity}
          >{ma.uppercase ? message.toUpperCase() : message}</text>
          {messageAttr && (
            <text
              x={ma.x} y="303"
              textAnchor={ma.textAnchor} dominantBaseline="middle"
              style={font.bodyStyle} fontSize={Math.round(ma.fontSize * 0.86 * 10) / 10}
              fill="var(--iv-mut)"
            >{messageAttr}</text>
          )}
        </g>
      )}
      <line x1="20" y1="370" x2="280" y2="370" stroke="var(--iv-acc)" strokeWidth="1" />
    </svg>
  )
}
