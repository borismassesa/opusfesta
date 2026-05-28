import type { TemplateProps } from './_types'
import { resolveFont } from './_types'

export function ModernBlock({ names, date, venue, palette, message, messageAttr, fontStyle }: TemplateProps) {
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

  return (
    <svg
      viewBox="0 0 300 400"
      xmlns="http://www.w3.org/2000/svg"
      style={vars}
      className="absolute inset-0 w-full h-full"
    >
      <rect width="300" height="400" fill="var(--iv-bg)" />
      {message && (
        <>
          <text
            x="20" y="160"
            dominantBaseline="middle"
            style={font.bodyStyle} fontSize="7"
            fill="rgba(100,100,100,0.7)"
          >{message}</text>
          {messageAttr && (
            <text
              x="20" y="174"
              dominantBaseline="middle"
              style={font.bodyStyle} fontSize="6"
              fill="rgba(100,100,100,0.5)"
            >{messageAttr}</text>
          )}
        </>
      )}
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
            style={font.namesStyle} fontSize="16"
            fontWeight={font.italic ? 'normal' : '900'}
            fill="var(--iv-tp)"
            letterSpacing="-0.5"
          >{font.italic ? line1 : line1.toUpperCase()}</text>
          <text
            x="20" y="356"
            dominantBaseline="middle"
            style={font.namesStyle} fontSize="16"
            fontWeight={font.italic ? 'normal' : '900'}
            fill="var(--iv-tp)"
            letterSpacing="-0.5"
          >&amp; {font.italic ? line2 : line2.toUpperCase()}</text>
        </>
      ) : (
        <text
          x="20" y="348"
          dominantBaseline="middle"
          style={font.namesStyle} fontSize="16"
          fontWeight={font.italic ? 'normal' : '900'}
          fill="var(--iv-tp)"
          letterSpacing="-0.5"
        >{font.italic ? names : names.toUpperCase()}</text>
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
