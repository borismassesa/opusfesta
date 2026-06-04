'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart } from 'lucide-react'
import DOMPurify from 'dompurify'
import { cn } from '@/lib/utils'
import { assetPath } from '@/lib/asset-path'
import { InvitationVisual, COUPLE_DEFAULT, type Treatment, type Couple, type InvitationPalette } from '@/components/guests/InvitationVisual'

// CMS-uploaded SVGs (designImage) are untrusted. Sanitize with DOMPurify's SVG
// profile before injecting via dangerouslySetInnerHTML — it strips <script>,
// event handlers, <foreignObject>, javascript: refs and other vectors a regex
// strip would miss. Runs client-side only (called from a useEffect).
function sanitizeSvg(text: string): string | null {
  const t = text.trimStart()
  if (!t.startsWith('<svg') && !t.startsWith('<?xml')) return null
  const clean = DOMPurify.sanitize(t, { USE_PROFILES: { svg: true, svgFilters: true } })
  return clean || null
}

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
  designSvg: designSvgProp,
  palette,
  className,
  style,
}: {
  treatment: Treatment
  couple: Couple
  designImage?: string
  designSvg?: string
  palette?: InvitationPalette
  className?: string
  style?: React.CSSProperties
}) {
  const svgHtml = designSvgProp ? sanitizeSvg(designSvgProp) : null

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

  if (svgHtml) {
    return (
      <div
        className={cn('relative aspect-[3/4] overflow-hidden', className)}
        style={{ ...paletteVars, ...style }}
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

function FlatLayScene({ treatment, couple, designImage, designSvg, palette, mockupImages }: SceneProps) {
  const bg = mockupImages?.['flat-lay']
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={bg ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: '#EDE9E1' }}
    >
      <InviteCard
        treatment={treatment}
        couple={couple}
        designImage={designImage}
        designSvg={designSvg}
        palette={palette}
        className="w-[62%] rounded-sm"
        style={{ transform: 'rotate(-3deg)', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.35), 0 8px 20px -8px rgba(0,0,0,0.2)' }}
      />
    </div>
  )
}

function DarkStudioScene({ treatment, couple, designImage, designSvg, palette, mockupImages }: SceneProps) {
  const bg = mockupImages?.['dark-studio']
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={bg ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: '#111111' }}
    >
      <InviteCard
        treatment={treatment}
        couple={couple}
        designImage={designImage}
        designSvg={designSvg}
        palette={palette}
        className="w-[62%] rounded-sm"
        style={{ boxShadow: '0 24px 64px -8px rgba(0,0,0,0.8), 0 8px 24px -8px rgba(0,0,0,0.6)' }}
      />
    </div>
  )
}

function PaperStackScene({ treatment, couple, designImage, designSvg, palette, mockupImages }: SceneProps) {
  const bg = mockupImages?.['paper-stack']
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={bg ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: '#E8E3DB' }}
    >
      <div className="relative w-[60%]" style={{ aspectRatio: '3/4' }}>
        {/* Back cards */}
        <div className="absolute inset-0" style={{ transform: 'rotate(5deg)', opacity: 0.8 }}>
          <InviteCard treatment={treatment} couple={couple} designImage={designImage} designSvg={designSvg} palette={palette} className="w-full rounded-sm" />
        </div>
        <div className="absolute inset-0" style={{ transform: 'rotate(2deg)', opacity: 0.9 }}>
          <InviteCard treatment={treatment} couple={couple} designImage={designImage} designSvg={designSvg} palette={palette} className="w-full rounded-sm" />
        </div>
        {/* Front card */}
        <div className="absolute inset-0" style={{ transform: 'rotate(-1deg)', boxShadow: '0 16px 48px -8px rgba(0,0,0,0.25)' }}>
          <InviteCard treatment={treatment} couple={couple} designImage={designImage} designSvg={designSvg} palette={palette} className="w-full rounded-sm" />
        </div>
      </div>
    </div>
  )
}

function EnvelopeScene({ treatment, couple, designImage, designSvg, palette, mockupImages }: SceneProps) {
  const bg = mockupImages?.['envelope']
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={bg ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: '#F5EFE3' }}
    >
      <div className="relative" style={{ width: '72%' }}>
        {/* Envelope body — overflow-hidden only applies to the envelope itself */}
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
        </div>

        {/* Card peeking up — sibling of envelope body so it's not clipped */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ width: '62%', bottom: '57%', zIndex: 2 }}
        >
          <InviteCard
            treatment={treatment}
            couple={couple}
            designImage={designImage}
            designSvg={designSvg}
            palette={palette}
            className="w-full rounded-t-sm"
            style={{ boxShadow: '0 -8px 24px -4px rgba(0,0,0,0.12)' }}
          />
        </div>
      </div>
    </div>
  )
}

function PhoneScene({ treatment, couple, designImage, designSvg, palette, mockupImages }: SceneProps) {
  const bg = mockupImages?.['phone']
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={bg ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: '#1A1A1A' }}
    >
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
              designSvg={designSvg}
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
  designSvg?: string
  palette?: InvitationPalette
  mockupImages?: Record<string, string>
  sceneId?: string
}

function GenericScene({ treatment, couple, designImage, designSvg, palette, mockupImages, sceneId }: SceneProps) {
  const bg = sceneId ? mockupImages?.[sceneId] : undefined
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={bg ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: '#F0EDE8' }}
    >
      <InviteCard
        treatment={treatment}
        couple={couple}
        designImage={designImage}
        designSvg={designSvg}
        palette={palette}
        className="w-[62%] rounded-sm"
        style={{ boxShadow: '0 20px 60px -10px rgba(0,0,0,0.3)' }}
      />
    </div>
  )
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
  designSvg,
  palette,
  mockupImages,
  scenes: scenesProp,
  onFavourite,
  favourited = false,
}: {
  treatment: Treatment
  couple?: Couple
  designImage?: string
  designSvg?: string
  palette?: InvitationPalette
  mockupImages?: Record<string, string>
  scenes?: { id: string; label: string }[]
  onFavourite?: () => void
  favourited?: boolean
}) {
  const scenesToShow = scenesProp && scenesProp.length > 0 ? scenesProp : SCENES
  const [active, setActive] = useState<string>(scenesToShow[0]?.id ?? 'flat-lay')

  // If the server didn't prefetch the SVG (oversized file), fetch it once here
  // so it's shared across all scene switches instead of re-fetching per mount.
  const [fetchedSvg, setFetchedSvg] = useState<string | null>(null)
  const prevUrl = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (designSvg) return
    if (!designImage) return
    if (designImage === prevUrl.current) return
    prevUrl.current = designImage
    fetch(assetPath(designImage))
      .then((r) => r.text())
      .then((text) => setFetchedSvg(sanitizeSvg(text)))
      .catch(() => setFetchedSvg(null))
  }, [designImage, designSvg])

  const resolvedSvg = designSvg ?? fetchedSvg

  const ActiveSceneComponent = SCENE_COMPONENTS[active as SceneId] ?? GenericScene
  const sceneProps: SceneProps = { treatment, couple, designImage, designSvg: resolvedSvg ?? undefined, palette, mockupImages, sceneId: active }

  return (
    <div>
      {/* Main view — 7:6 (not square) so the thumbnail strip stays in view */}
      <div className="relative aspect-[7/6] bg-white rounded-md shadow-md overflow-hidden">
        <ActiveSceneComponent {...sceneProps} />

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
      </div>

      {/* Thumbnail strip */}
      <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${scenesToShow.length}, minmax(0, 1fr))` }}>
        {scenesToShow.map((scene) => {
          const ThumbComponent = SCENE_COMPONENTS[scene.id as SceneId] ?? GenericScene
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
                isActive ? 'ring-2 ring-gray-400 ring-offset-2' : 'ring-1 ring-gray-200 hover:ring-gray-400',
              )}
            >
              <ThumbComponent {...sceneProps} sceneId={scene.id} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
