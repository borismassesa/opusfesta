import type { TemplateProps } from './_types'
import { resolveFont } from './_types'

export function MinimalLine({ names, date, venue, palette, message, messageAttr, fontStyle }: TemplateProps) {
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
        x="20" y="170"
        dominantBaseline="middle"
        fontFamily="inherit" fontSize="7" letterSpacing="3"
        fill="var(--iv-mut)"
      >TOGETHER WITH THEIR FAMILIES</text>
      {line2 ? (
        <>
          <text
            x="20" y="198"
            dominantBaseline="middle"
            style={font.namesStyle} fontSize="18"
            fill="var(--iv-tp)"
          >{line1}</text>
          <text
            x="20" y="220"
            dominantBaseline="middle"
            style={font.namesStyle} fontSize="18"
            fill="var(--iv-tp)"
          >&amp; {line2}</text>
        </>
      ) : (
        <text
          x="20" y="208"
          dominantBaseline="middle"
          style={font.namesStyle} fontSize="18"
          fill="var(--iv-tp)"
        >{names}</text>
      )}
      <text
        x="20" y={line2 ? '242' : '232'}
        dominantBaseline="middle"
        fontFamily="inherit" fontSize="9" letterSpacing="2.2"
        fill="var(--iv-ts)"
      >{date.toUpperCase()}</text>
      {message && (
        <>
          <line x1="20" y1="275" x2="120" y2="275" stroke="var(--iv-acc)" strokeWidth="0.5" strokeOpacity="0.6" />
          <text
            x="20" y="289"
            dominantBaseline="middle"
            style={font.bodyStyle} fontSize="7"
            fill="var(--iv-ts)"
          >{message}</text>
          {messageAttr && (
            <text
              x="20" y="303"
              dominantBaseline="middle"
              style={font.bodyStyle} fontSize="6"
              fill="var(--iv-mut)"
            >{messageAttr}</text>
          )}
        </>
      )}
      <line x1="20" y1="370" x2="280" y2="370" stroke="var(--iv-acc)" strokeWidth="1" />
    </svg>
  )
}
