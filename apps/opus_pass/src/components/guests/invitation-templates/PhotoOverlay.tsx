import Image from 'next/image'
import type { TemplateProps } from './_types'

type PhotoOverlayProps = TemplateProps & { photoSrc?: string }

export function PhotoOverlay({ names, date, venue, palette, photoSrc }: PhotoOverlayProps) {
  const src = photoSrc ?? '/assets/images/cutesy_couple.jpg'

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
        <p className="text-[7px] uppercase tracking-[0.32em]" style={{ color: palette.muted }}>Save the Date</p>
        <p className="mt-2 font-serif text-[16px] leading-tight text-center">{names}</p>
        <div className="my-2 h-px w-8" style={{ backgroundColor: palette.accent }} />
        <p className="text-[8px] tracking-[0.22em]" style={{ color: palette.textSecondary }}>{date}</p>
      </div>
    </div>
  )
}
