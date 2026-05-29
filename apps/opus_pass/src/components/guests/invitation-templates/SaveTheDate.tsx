import type { TemplateProps } from './_types'

export function SaveTheDate({
  names, date, venue, palette,
  time, dressCode, rsvpContact, receptionVenue, receptionTime, sectionStyles,
}: TemplateProps) {
  const vars = {
    '--iv-bg':  palette.background,
    '--iv-acc': palette.accent,
    '--iv-tp':  palette.textPrimary,
    '--iv-ts':  palette.textSecondary,
    '--iv-mut': palette.muted,
  } as React.CSSProperties

  const parts = names.split(/\s*&\s*/)
  const line1 = parts[0] ?? names
  const line2 = parts[1]
  const hasReception = Boolean(receptionVenue || receptionTime)

  const dateScale = sectionStyles?.date?.scale ?? 1
  const dateFW    = sectionStyles?.date?.fontWeight ?? 'normal'
  const venueScale = sectionStyles?.venue?.scale ?? 1
  const venueFW   = sectionStyles?.venue?.fontWeight ?? 'normal'

  // Shift lower content down when reception row is present
  const dressY  = hasReception ? 543 : 524.65
  const circleY = hasReception ? 539 : 520.74
  const rsvpY   = hasReception ? 573 : 555.59

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 419.53 595.28"
      style={vars}
      className="absolute inset-0 w-full h-full"
    >
      {/* ── Background ── */}
      <rect x="-8.5" y="-8.5" width="436.54" height="612.28" fill="var(--iv-bg)" />

      {/* Corner blocks */}
      <rect x="0"      y="388.5"  width="52.77" height="52.77" fill="#7bbc7e" />
      <rect x="348.62" y="524.8"  width="52.77" height="52.77" fill="#f0d497" />
      <rect x="366.09" y="0"      width="53.44" height="30.54" fill="var(--iv-acc)" />
      <rect x="39.07"  y="428.23" width="26.09" height="26.09" fill="none" stroke="var(--iv-tp)" strokeMiterlimit={10} />
      <rect x="335.58" y="511.75" width="26.09" height="26.09" fill="none" stroke="var(--iv-acc)" strokeMiterlimit={10} />
      <rect x="385.57" y="24.62"  width="26.09" height="26.09" fill="none" stroke="#f096b1"       strokeMiterlimit={10} />

      {/* Photo placeholder square */}
      <rect x="102.92" y="83.03" width="213.69" height="213.69" fill="var(--iv-acc)" fillOpacity={0.41} />

      {/* L-bracket lines */}
      <polyline points="327.63 218.12 327.63 307.74 109.88 307.74" fill="none" stroke="var(--iv-tp)" strokeMiterlimit={10} />
      <line x1="327.63" y1="90.65"  x2="327.63" y2="170.89" fill="none" stroke="var(--iv-tp)" strokeMiterlimit={10} />
      <polyline points="91.9 229.83 91.9 72 308.65 72"        fill="none" stroke="var(--iv-tp)" strokeMiterlimit={10} />

      {/* Flower stems */}
      <line x1="99.84" y1="263.83" x2="99.84" y2="330.42" fill="none" stroke="#f0d497" strokeMiterlimit={10} />
      <line x1="67.54" y1="294.16" x2="67.54" y2="330.42" fill="none" stroke="#f0d497" strokeMiterlimit={10} />
      <line x1="352.5" y1="294.16" x2="352.5" y2="330.42" fill="none" stroke="#f0d497" strokeMiterlimit={10} />

      {/* Flower petals */}
      <path d="M91.09,240.62c-1.04,4.08-2.54,10.05-4.26,17.21-1.96,8.16,2.32,17.4,13.01,17.4,9.97,0,14.36-8.03,13.32-15.72-8.8-11.09-17.02-16.44-22.08-18.89Z" fill="var(--iv-tp)" />
      <path d="M108.59,240.62c1.04,4.08,2.54,10.05,4.26,17.21,1.96,8.16-2.32,17.4-13.01,17.4-4.98,0-8.57-2.01-10.79-4.97-3.38-4.53-2.61-10.94,1.18-15.14,7.36-8.16,14.03-12.39,18.36-14.5Z" fill="#f096b1" />
      <path d="M58.79,270.95c-1.04,4.08-2.54,10.05-4.26,17.21-1.96,8.16,2.32,17.4,13.01,17.4,9.97,0,14.36-8.03,13.32-15.72-8.8-11.09-17.02-16.44-22.08-18.89Z" fill="var(--iv-tp)" />
      <path d="M76.29,270.95c1.04,4.08,2.54,10.05,4.26,17.21,1.96,8.16-2.32,17.4-13.01,17.4-4.98,0-8.57-2.01-10.79-4.97-3.38-4.53-2.61-10.94,1.18-15.14,7.36-8.16,14.03-12.39,18.36-14.5Z" fill="#f0d497" />
      <path d="M343.75,270.95c-1.04,4.08-2.54,10.05-4.26,17.21-1.96,8.16,2.32,17.4,13.01,17.4,9.97,0,14.36-8.03,13.32-15.72-8.8-11.09-17.02-16.44-22.08-18.89Z" fill="var(--iv-tp)" />
      <path d="M361.25,270.95c1.04,4.08,2.54,10.05,4.26,17.21,1.96,8.16-2.32,17.4-13.01,17.4-4.98,0-8.57-2.01-10.79-4.97-3.38-4.53-2.61-10.94,1.18-15.14,7.36-8.16,14.03-12.39,18.36-14.5Z" fill="#7bbc7e" />

      {/* Hearts */}
      <path d="M277.8,110.12l-3.19-3.19c-1.76-1.76-4.61-1.76-6.38,0h0c-1.76,1.76-1.76,4.61,0,6.38l9.56,9.56,9.56-9.56c1.76-1.76,1.76-4.61,0-6.38h0c-1.76-1.76-4.61-1.76-6.38,0l-3.19,3.19Z" fill="#f096b1" />
      <path d="M327.63,66.24l-4.46-4.46c-2.46-2.46-6.45-2.46-8.92,0h0c-2.46,2.46-2.46,6.45,0,8.92l13.37,13.37,13.37-13.37c2.46-2.46,2.46-6.45,0-8.92h0c-2.46-2.46-6.45-2.46-8.92,0l-4.46,4.46Z" fill="#f0d497" />
      <path d="M315.9,192.14l-6.5-6.5c-3.59-3.59-9.4-3.59-12.99,0h0c-3.59,3.59-3.59,9.4,0,12.99l19.49,19.49,19.49-19.49c3.59-3.59,3.59-9.4,0-12.99h0c-3.59-3.59-9.4-3.59-12.99,0l-6.5,6.5Z" fill="var(--iv-acc)" />

      {/* Zigzag borders */}
      <polyline points="115.96 330.42 107.88 322.34 99.8 330.42 91.72 322.34 83.64 330.42 75.55 322.34 67.47 330.42 59.39 322.34 51.31 330.42 43.23 322.34 35.15 330.42" fill="none" stroke="var(--iv-acc)" strokeMiterlimit={10} />
      <polyline points="384.83 330.42 376.75 322.34 368.66 330.42 360.58 322.34 352.5 330.42 344.42 322.34 336.34 330.42 328.26 322.34 320.17 330.42" fill="none" stroke="var(--iv-acc)" strokeMiterlimit={10} />

      {/* ── Event title ── */}
      <text transform="translate(121.63 176.51)" style={{ fontFamily: "var(--font-yellowtail), cursive" }} fontSize="93.48" fill="var(--iv-tp)">
        <tspan x="0" y="0">Save</tspan>
      </text>
      <text transform="translate(206.87 208.56)" style={{ fontFamily: "var(--font-yellowtail), cursive" }} fontSize="29.13" fill="var(--iv-tp)">
        <tspan x="0" y="0">the</tspan>
      </text>
      <text transform="translate(117.88 263.25)" style={{ fontFamily: "var(--font-yellowtail), cursive" }} fontSize="93.48" fill="var(--iv-tp)">
        <tspan x="0" y="0">Date</tspan>
      </text>

      {/* ── Intro ── */}
      <text transform="translate(151.68 359.81)" fontFamily="'Josefin Sans','Trebuchet MS',system-ui,sans-serif" fontSize="15" fill="var(--iv-tp)">
        <tspan x="0" y="0">for the wedding of</tspan>
      </text>

      {/* ── Names ── */}
      <g data-section="names">
        {line2 ? (
          <>
            <text transform="translate(110.37 389.15)" fontFamily="'Josefin Sans','Trebuchet MS',system-ui,sans-serif" fontSize="24.32" fontWeight="700" fill="var(--iv-tp)">
              <tspan x="0" y="0">{line1.toUpperCase()}</tspan>
            </text>
            <text transform="translate(110.37 418)" fontFamily="'Josefin Sans','Trebuchet MS',system-ui,sans-serif" fontSize="24.32" fontWeight="700" fill="var(--iv-tp)">
              <tspan x="0" y="0">&amp; {line2.toUpperCase()}</tspan>
            </text>
          </>
        ) : (
          <text transform="translate(110.37 389.15)" fontFamily="'Josefin Sans','Trebuchet MS',system-ui,sans-serif" fontSize="24.32" fontWeight="700" fill="var(--iv-tp)">
            <tspan x="0" y="0">{names.toUpperCase()}</tspan>
          </text>
        )}
      </g>

      {/* ── Date ── */}
      <text data-section="date" transform="translate(181.86 438.76)" fontFamily="'Josefin Sans','Trebuchet MS',system-ui,sans-serif" fontSize={15.98 * dateScale} fontWeight={dateFW} fill="var(--iv-tp)">
        <tspan x="0" y="0">{date}</tspan>
      </text>

      {/* ── Venue ── */}
      <text data-section="venue" transform="translate(134.53 455.73)" fontFamily="'Josefin Sans','Trebuchet MS',system-ui,sans-serif" fontSize={13 * venueScale} fontWeight={venueFW} fill="var(--iv-tp)">
        <tspan x="0" y="0">{venue}</tspan>
      </text>

      {/* ── Time ── */}
      {time && (
        <text data-section="time" transform="translate(172 472)" fontFamily="'Josefin Sans','Trebuchet MS',system-ui,sans-serif" fontSize="12" fill="var(--iv-mut)">
          <tspan x="0" y="0">{time}</tspan>
        </text>
      )}

      {/* ── Reception (shown only when filled) ── */}
      {hasReception && (
        <text data-section="reception" transform="translate(120 490)" fontFamily="'Josefin Sans','Trebuchet MS',system-ui,sans-serif" fontSize="11" fill="var(--iv-mut)">
          <tspan x="0" y="0">
            Reception{receptionVenue ? ` · ${receptionVenue}` : ''}{receptionTime ? ` · ${receptionTime}` : ''}
          </tspan>
        </text>
      )}

      {/* ── Dress code ── */}
      <text
        data-section="dressCode"
        transform={`translate(135.78 ${dressY})`}
        fontFamily="'Josefin Sans','Trebuchet MS',system-ui,sans-serif"
        fontSize="13.33"
        fill="var(--iv-tp)"
      >
        <tspan x="0" y="0">{dressCode ? `Dress Code · ${dressCode}` : 'Dress Code'}</tspan>
      </text>
      <circle cx="340" cy={circleY} r="7" fill="#f0d497" />
      <circle cx="357" cy={circleY} r="7" fill="#f096b1" />
      <circle cx="374" cy={circleY} r="7" fill="#7bbc7e" />

      {/* ── RSVP ── */}
      {rsvpContact && (
        <text
          transform={`translate(120 ${rsvpY})`}
          fontFamily="'Josefin Sans','Trebuchet MS',system-ui,sans-serif"
          fontSize="12.28"
          fill="var(--iv-tp)"
        >
          <tspan x="0" y="0">RSVP  ☎  {rsvpContact}</tspan>
        </text>
      )}
    </svg>
  )
}
