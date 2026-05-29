import Image from 'next/image'
import type { TemplateProps } from './_types'

type PhotoOverlayProps = TemplateProps & { photoSrc?: string }

export function PhotoOverlay({ names, date, palette, message, messageAttr, photoSrc, sectionStyles }: PhotoOverlayProps) {
  const src = photoSrc ?? '/assets/images/cutesy_couple.jpg'

  const nameFontSize = `${16 * (sectionStyles?.names?.scale ?? 1)}px`
  const nameFontWeight = sectionStyles?.names?.fontWeight ?? 'normal'
  const nameTextAlign = sectionStyles?.names?.align ?? 'center'
  const dateFontSize = `${8 * (sectionStyles?.date?.scale ?? 1)}px`
  const msgFontSize = `${6.5 * (sectionStyles?.message?.scale ?? 1)}px`
  const msgFontWeight = sectionStyles?.message?.fontWeight ?? 'normal'
  const msgTextAlign = sectionStyles?.message?.align ?? 'center'

  return (
    <div className="absolute inset-0">
      <Image
        src={src}
        alt="Couple portrait used in invitation"
        fill
        sizes="(min-width:1024px) 25vw, 50vw"
        className="object-cover"
      />
      <div className="absolute inset-0" style={{ backgroundColor: palette.surface }} />
      <div className="absolute inset-0 flex flex-col items-center justify-end p-4" style={{ color: palette.textPrimary }}>
        {message && (
          <>
            <p data-section="message" className="mb-3 leading-relaxed" style={{ color: palette.textSecondary, fontSize: msgFontSize, fontWeight: msgFontWeight, textAlign: msgTextAlign }}>
              {message}
            </p>
            {messageAttr && (
              <p className="mb-2" style={{ color: palette.muted, fontSize: `${6.5 * 0.86 * (sectionStyles?.message?.scale ?? 1)}px` }}>{messageAttr}</p>
            )}
            <div className="mb-3 h-px w-8" style={{ backgroundColor: palette.accent, opacity: 0.5 }} />
          </>
        )}
        <p className="text-[7px] uppercase tracking-[0.32em]" style={{ color: palette.muted }}>Save the Date</p>
        <p data-section="names" className="mt-2 font-serif leading-tight" style={{ fontSize: nameFontSize, fontWeight: nameFontWeight, textAlign: nameTextAlign }}>{names}</p>
        <div className="my-2 h-px w-8" style={{ backgroundColor: palette.accent }} />
        <p data-section="date" className="tracking-[0.22em]" style={{ color: palette.textSecondary, fontSize: dateFontSize }}>{date}</p>
      </div>
    </div>
  )
}
