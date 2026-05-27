'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InvitationVisual, COUPLE_DEFAULT, type Treatment, type Couple, type InvitationPalette } from '@/components/guests/InvitationVisual'

type SceneId = 'flat-lay' | 'dark-studio' | 'paper-stack' | 'envelope' | 'phone'

const SCENES: { id: SceneId; label: string }[] = [
  { id: 'flat-lay',     label: 'Flat lay' },
  { id: 'dark-studio',  label: 'Dark studio' },
  { id: 'paper-stack',  label: 'Paper stack' },
  { id: 'envelope',     label: 'Envelope' },
  { id: 'phone',        label: 'Phone' },
]

function InviteCard({
  treatment,
  couple,
  designImage,
  palette,
  className,
  style,
}: {
  treatment: Treatment
  couple: Couple
  designImage?: string
  palette?: InvitationPalette
  className?: string
  style?: React.CSSProperties
}) {
  const [svgHtml, setSvgHtml] = useState<string | null>(null)
  const prevUrl = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!designImage) return
    if (designImage === prevUrl.current) return
    prevUrl.current = designImage
    fetch(designImage)
      .then((r) => r.text())
      .then(setSvgHtml)
      .catch(() => setSvgHtml(null))
  }, [designImage])

  const paletteVars = palette
    ? ({
        '--iv-bg':   palette.background,
        '--iv-surf': palette.surface,
        '--iv-acc':  palette.accent,
        '--iv-tp':   palette.textPrimary,
        '--iv-ts':   palette.textSecondary,
        '--iv-mut':  palette.muted,
      } as React.CSSProperties)
    : undefined

  if (designImage && svgHtml) {
    return (
      <div
        className={cn('relative aspect-[3/4] overflow-hidden', className)}
        style={{ ...paletteVars, ...style }}
        // SVG is fetched from Supabase Storage (controlled by us) — palette vars cascade into it
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
    )
  }

  return (
    <div
      className={cn('relative aspect-[3/4] overflow-hidden', className)}
      style={style}
    >
      <InvitationVisual treatment={treatment} couple={couple} palette={palette} />
    </div>
  )
}

function FlatLayScene({ treatment, couple, designImage, palette }: SceneProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#EDE9E1' }}>
      <InviteCard
        treatment={treatment}
        couple={couple}
        designImage={designImage}
        palette={palette}
        className="w-[62%] rounded-sm"
        style={{ transform: 'rotate(-3deg)', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.35), 0 8px 20px -8px rgba(0,0,0,0.2)' }}
      />
    </div>
  )
}

function DarkStudioScene({ treatment, couple, designImage, palette }: SceneProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#111111' }}>
      <InviteCard
        treatment={treatment}
        couple={couple}
        designImage={designImage}
        palette={palette}
        className="w-[64%] rounded-sm"
        style={{ boxShadow: '0 24px 64px -8px rgba(0,0,0,0.8), 0 8px 24px -8px rgba(0,0,0,0.6)' }}
      />
    </div>
  )
}

function PaperStackScene({ treatment, couple, designImage, palette }: SceneProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#E8E3DB' }}>
      <div className="relative w-[60%]" style={{ aspectRatio: '3/4' }}>
        {/* Back cards */}
        <div className="absolute inset-0" style={{ transform: 'rotate(5deg)', opacity: 0.8 }}>
          <InviteCard treatment={treatment} couple={couple} designImage={designImage} palette={palette} className="w-full rounded-sm" />
        </div>
        <div className="absolute inset-0" style={{ transform: 'rotate(2deg)', opacity: 0.9 }}>
          <InviteCard treatment={treatment} couple={couple} designImage={designImage} palette={palette} className="w-full rounded-sm" />
        </div>
        {/* Front card */}
        <div className="absolute inset-0" style={{ transform: 'rotate(-1deg)', boxShadow: '0 16px 48px -8px rgba(0,0,0,0.25)' }}>
          <InviteCard treatment={treatment} couple={couple} designImage={designImage} palette={palette} className="w-full rounded-sm" />
        </div>
      </div>
    </div>
  )
}

function EnvelopeScene({ treatment, couple, designImage, palette }: SceneProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#F5EFE3' }}>
      <div className="relative" style={{ width: '72%' }}>
        {/* Envelope body */}
        <div
          className="relative rounded-sm overflow-hidden"
          style={{
            aspectRatio: '1/0.7',
            backgroundColor: '#E8E0D4',
            boxShadow: '0 8px 24px -4px rgba(0,0,0,0.15)',
          }}
        >
          {/* V-flap crease */}
          <svg viewBox="0 0 100 70" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <path d="M0 0 L50 38 L100 0" fill="none" stroke="#C8BFB0" strokeWidth="0.5" />
            <path d="M0 0 L0 70 L100 70 L100 0" fill="none" stroke="#C8BFB0" strokeWidth="0.3" />
          </svg>
          {/* Card peeking up */}
          <div
            className="absolute left-1/2 bottom-full -translate-x-1/2"
            style={{ width: '62%', marginBottom: '-30%' }}
          >
            <InviteCard
              treatment={treatment}
              couple={couple}
              designImage={designImage}
              palette={palette}
              className="w-full rounded-t-sm"
              style={{ boxShadow: '0 -8px 24px -4px rgba(0,0,0,0.12)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function PhoneScene({ treatment, couple, designImage, palette }: SceneProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#1A1A1A' }}>
      {/* Phone bezel */}
      <div
        className="relative rounded-[20px] overflow-hidden"
        style={{
          width: '54%',
          aspectRatio: '9/19.5',
          backgroundColor: '#0A0A0A',
          boxShadow: '0 0 0 2px #333, 0 20px 60px -10px rgba(0,0,0,0.8)',
        }}
      >
        {/* Screen area */}
        <div className="absolute inset-[3px] rounded-[18px] overflow-hidden bg-white flex flex-col">
          {/* Status bar */}
          <div className="h-[5%] bg-[#1A1A1A] flex items-center justify-center">
            <div className="w-[24%] h-[2px] bg-[#333] rounded-full" />
          </div>
          {/* Invite fills screen */}
          <div className="relative flex-1 overflow-hidden">
            <InviteCard
              treatment={treatment}
              couple={couple}
              designImage={designImage}
              palette={palette}
              className="absolute inset-0 w-full h-full"
            />
          </div>
          {/* WhatsApp chrome bar */}
          <div className="h-[6%] bg-[#075E54] flex items-center px-2 gap-1">
            <div className="w-2 h-2 rounded-full bg-white/30" />
            <div className="flex-1 h-1 bg-white/20 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  )
}

type SceneProps = {
  treatment: Treatment
  couple: Couple
  designImage?: string
  palette?: InvitationPalette
}

const SCENE_COMPONENTS: Record<SceneId, React.ComponentType<SceneProps>> = {
  'flat-lay':    FlatLayScene,
  'dark-studio': DarkStudioScene,
  'paper-stack': PaperStackScene,
  'envelope':    EnvelopeScene,
  'phone':       PhoneScene,
}

export function MockupCarousel({
  treatment,
  couple = COUPLE_DEFAULT,
  designImage,
  palette,
  onFavourite,
  favourited = false,
}: {
  treatment: Treatment
  couple?: Couple
  designImage?: string
  palette?: InvitationPalette
  onFavourite?: () => void
  favourited?: boolean
}) {
  const [active, setActive] = useState<SceneId>('flat-lay')
  const ActiveScene = SCENE_COMPONENTS[active]
  const sceneProps: SceneProps = { treatment, couple, designImage, palette }

  return (
    <div>
      {/* Main view */}
      <div className="relative aspect-[3/4] bg-white rounded-md shadow-md overflow-hidden">
        <ActiveScene {...sceneProps} />

        {onFavourite && (
          <button
            type="button"
            onClick={onFavourite}
            aria-label={favourited ? 'Remove from favourites' : 'Add to favourites'}
            aria-pressed={favourited}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-sm hover:bg-white transition z-10"
          >
            <Heart className={cn('h-4 w-4', favourited ? 'fill-[#7A1F2B] text-[#7A1F2B]' : 'text-[#1A1A1A]')} />
          </button>
        )}

        <span className="absolute left-4 bottom-4 inline-flex items-center rounded-full bg-white/95 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-700 z-10">
          {SCENES.find((s) => s.id === active)?.label}
        </span>
      </div>

      {/* Thumbnail strip */}
      <div className="mt-4 grid grid-cols-5 gap-2">
        {SCENES.map((scene) => {
          const ThumbScene = SCENE_COMPONENTS[scene.id]
          const isActive = active === scene.id
          return (
            <button
              key={scene.id}
              type="button"
              aria-label={`View ${scene.label} scene`}
              aria-pressed={isActive}
              onClick={() => setActive(scene.id)}
              className={cn(
                'relative aspect-[3/4] rounded-sm overflow-hidden transition',
                isActive ? 'ring-2 ring-[#1A1A1A]' : 'ring-1 ring-gray-200 hover:ring-gray-400',
              )}
            >
              <ThumbScene {...sceneProps} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
