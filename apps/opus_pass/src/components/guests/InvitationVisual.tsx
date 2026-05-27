import Image from 'next/image'

export type Treatment =
  | 'classic-serif' | 'minimal-line' | 'modern-block'  | 'floral-border'
  | 'navy-gold'     | 'blush-frame'  | 'sage-panel'    | 'cultural-red'
  | 'arch-script'   | 'photo-overlay'

export type Couple = { names: string; date: string; venue: string }

export const COUPLE_DEFAULT: Couple = {
  names: 'Amani  &  Neema',
  date: '22 · 08 · 2026',
  venue: 'Bagamoyo, Tanzania',
}

export function InvitationVisual({
  treatment,
  couple = COUPLE_DEFAULT,
  accent,
}: {
  treatment: Treatment
  couple?: Couple
  /** Optional accent colour. When set, recolours the design's accent elements
   *  (eyebrows, dividers, frames, date) so colour selection is reflected live. */
  accent?: string
}) {
  const { names, date, venue } = couple
  const aText = accent ? { color: accent } : undefined
  const aBg = accent ? { backgroundColor: accent } : undefined
  const aBorder = accent ? { borderColor: accent } : undefined

  switch (treatment) {
    case 'classic-serif':
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F5EFE3] p-4 text-[#1A1A1A]">
          <p className="text-[8px] uppercase tracking-[0.32em] text-[#1A1A1A]/50" style={aText}>Save the Date</p>
          <p className="mt-3 font-serif text-[16px] leading-tight text-center">{names}</p>
          <div className="my-3 h-px w-10 bg-[#1A1A1A]/30" style={aBg} />
          <p className="text-[10px] tracking-[0.22em] text-[#1A1A1A]/70" style={aText}>{date}</p>
          <p className="mt-2 text-[8px] tracking-[0.22em] text-[#1A1A1A]/50 uppercase">{venue}</p>
        </div>
      )
    case 'minimal-line':
      return (
        <div className="absolute inset-0 flex flex-col bg-white p-4">
          <div className="h-px w-full bg-[#1A1A1A]" style={aBg} />
          <div className="flex flex-1 flex-col items-start justify-center">
            <p className="text-[7px] uppercase tracking-[0.3em] text-[#1A1A1A]/50">Together with their families</p>
            <p className="mt-3 font-serif text-[17px] text-[#1A1A1A] leading-tight">{names}</p>
            <p className="mt-3 text-[9px] uppercase tracking-[0.22em] text-[#1A1A1A]/60" style={aText}>{date}</p>
          </div>
          <div className="h-px w-full bg-[#1A1A1A]" style={aBg} />
        </div>
      )
    case 'modern-block':
      return (
        <div className="absolute inset-0 flex flex-col justify-end bg-white p-4">
          <div className="bg-[#1A1A1A] -mx-4 -mb-4 px-4 py-4 text-white" style={aBg}>
            <p className="text-[7px] uppercase tracking-[0.3em] text-white/60">{date}</p>
            <p className="mt-1.5 font-sans text-[16px] font-black uppercase tracking-tight leading-[1] text-white">{names}</p>
            <p className="mt-1.5 text-[8px] uppercase tracking-[0.22em] text-white/60">{venue}</p>
          </div>
        </div>
      )
    case 'floral-border':
      return (
        <div className="absolute inset-0 bg-[#FBF7F2] p-3">
          <div className="relative h-full w-full border border-[#A6B89A]/40 p-3 flex flex-col items-center justify-center" style={aBorder}>
            <span className="absolute -top-[6px] -left-[6px] h-3 w-3 rounded-full bg-[#A6B89A]/60" style={aBg} />
            <span className="absolute -top-[6px] -right-[6px] h-3 w-3 rounded-full bg-[#F5DCE2]" />
            <span className="absolute -bottom-[6px] -left-[6px] h-3 w-3 rounded-full bg-[#F5DCE2]" />
            <span className="absolute -bottom-[6px] -right-[6px] h-3 w-3 rounded-full bg-[#A6B89A]/60" style={aBg} />
            <p className="text-[7px] uppercase tracking-[0.3em] text-[#5C6B4D]" style={aText}>You are invited</p>
            <p className="mt-2 font-serif italic text-[16px] text-[#1A1A1A] leading-tight text-center">{names}</p>
            <div className="my-2 h-px w-8 bg-[#A6B89A]" style={aBg} />
            <p className="text-[9px] tracking-[0.18em] text-[#5C6B4D]" style={aText}>{date}</p>
          </div>
        </div>
      )
    case 'navy-gold':
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1E2D54] p-4 text-[#E8D9A7]">
          <p className="text-[8px] uppercase tracking-[0.32em]" style={aText}>Save the Date</p>
          <div className="mt-3 h-px w-6 bg-[#E8D9A7]" style={aBg} />
          <p className="mt-3 font-serif text-[16px] leading-tight text-center text-[#F5EFE3]">{names}</p>
          <p className="mt-3 text-[9px] tracking-[0.22em]" style={aText}>{date}</p>
          <p className="mt-1 text-[7px] uppercase tracking-[0.22em] text-[#E8D9A7]/70">{venue}</p>
        </div>
      )
    case 'blush-frame':
      return (
        <div className="absolute inset-0 bg-[#F5DCE2] p-3">
          <div className="h-full w-full bg-white p-3 flex flex-col items-center justify-center">
            <p className="text-[7px] uppercase tracking-[0.3em] text-[#A84F66]" style={aText}>Save the Date</p>
            <p className="mt-3 font-serif italic text-[17px] text-[#7A1F2B] leading-tight text-center">{names}</p>
            <p className="mt-3 text-[9px] tracking-[0.22em] text-[#A84F66]" style={aText}>{date}</p>
          </div>
        </div>
      )
    case 'sage-panel':
      return (
        <div className="absolute inset-0 flex bg-[#A6B89A]" style={aBg}>
          <div className="w-1/3 bg-[#A6B89A]" style={aBg} />
          <div className="flex-1 bg-[#FBF7F2] p-3 flex flex-col justify-center items-start">
            <p className="text-[7px] uppercase tracking-[0.3em] text-[#5C6B4D]" style={aText}>Wedding</p>
            <p className="mt-2 font-serif text-[15px] text-[#1A1A1A] leading-tight">{names}</p>
            <div className="my-2 h-px w-6 bg-[#5C6B4D]" style={aBg} />
            <p className="text-[8px] tracking-[0.22em] text-[#5C6B4D]" style={aText}>{date}</p>
            <p className="mt-1 text-[7px] uppercase tracking-[0.18em] text-[#5C6B4D]/70">{venue}</p>
          </div>
        </div>
      )
    case 'cultural-red':
      return (
        <div className="absolute inset-0 bg-[#7A1F2B] p-3">
          <div className="relative h-full w-full border-2 border-[#C8A35C] p-3 flex flex-col items-center justify-center" style={aBorder}>
            <p className="font-serif text-[10px] tracking-[0.3em] text-[#C8A35C]" style={aText}>— KARIBU —</p>
            <p className="mt-3 font-serif text-[15px] leading-tight text-center text-[#F5EFE3]">{names}</p>
            <div className="my-2 flex items-center gap-1">
              <span className="text-[#C8A35C] text-[8px]" style={aText}>✦</span>
              <p className="text-[9px] tracking-[0.22em] text-[#C8A35C]" style={aText}>{date}</p>
              <span className="text-[#C8A35C] text-[8px]" style={aText}>✦</span>
            </div>
            <p className="text-[7px] uppercase tracking-[0.22em] text-[#C8A35C]/80">{venue}</p>
          </div>
        </div>
      )
    case 'arch-script':
      return (
        <div className="absolute inset-0 bg-[#F5EFE3] flex flex-col items-center justify-end p-3">
          <div className="relative w-full h-full flex flex-col items-center justify-center pt-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] rounded-t-full border-2 border-[#7A1F2B]/70" style={aBorder} />
            <p className="relative font-serif italic text-[16px] text-[#7A1F2B] leading-tight text-center px-4">{names}</p>
            <div className="relative mt-3 h-px w-8 bg-[#7A1F2B]/60" style={aBg} />
            <p className="relative mt-2 text-[8px] uppercase tracking-[0.22em] text-[#7A1F2B]/80" style={aText}>{date}</p>
          </div>
        </div>
      )
    case 'photo-overlay':
      return (
        <div className="absolute inset-0">
          <Image
            src="/assets/images/cutesy_couple.jpg"
            alt="Couple portrait used in invitation"
            fill
            sizes="(min-width:1024px) 25vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-white">
            <p className="text-[7px] uppercase tracking-[0.32em] text-white/70">Save the Date</p>
            <p className="mt-2 font-serif text-[16px] leading-tight text-center">{names}</p>
            <div className="my-2 h-px w-8 bg-white/60" style={aBg} />
            <p className="text-[8px] tracking-[0.22em] text-white/80" style={aText}>{date}</p>
          </div>
        </div>
      )
  }
}
