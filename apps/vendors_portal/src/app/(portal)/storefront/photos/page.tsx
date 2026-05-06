'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Camera,
  ChevronsUpDown,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  Video as VideoIcon,
  X,
} from 'lucide-react'
import { FieldLabel, TextInput } from '@/components/onboard/FormField'
import { getStorefrontSections } from '@/lib/storefront/completion'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { cn } from '@/lib/utils'
import { savePhotos, uploadStorefrontPhoto } from '../sections/actions'

type Photo = {
  id: string
  url: string
  caption: string
}

// Cover slots are positional — index drives orientation (3 landscape + 1
// portrait) and the per-slot pro-tip copy. `null` means the slot is empty.
type CoverSlot = { id: string; url: string } | null

const COVER_SLOT_COUNT = 4
type CoverOrientation = 'landscape' | 'portrait'
const COVER_ORIENTATIONS: CoverOrientation[] = ['landscape', 'landscape', 'landscape', 'portrait']

type VideoReel = {
  id: string
  // 'upload' = file blob URL the browser plays inline; 'embed' = YouTube/Vimeo
  // link that we render via a static thumbnail until the vendor opens it.
  kind: 'upload' | 'embed'
  url: string
  title: string
  thumbnailUrl?: string
}

// Sample portfolio photos so the editor isn't empty in the mock. Replace with
// uploaded URLs when the storage backend lands.
const SAMPLE_PHOTOS: Photo[] = [
  {
    id: 'p2',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop',
    caption: 'First-look portrait',
  },
  {
    id: 'p3',
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&h=800&fit=crop',
    caption: 'Reception details',
  },
  {
    id: 'p4',
    url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=1200&h=800&fit=crop',
    caption: 'Bridal preparation',
  },
  {
    id: 'p5',
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&h=800&fit=crop',
    caption: 'Family group portrait',
  },
  {
    id: 'p6',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&h=800&fit=crop',
    caption: 'Candid dance floor moment',
  },
]

// All four cover slots start empty so vendors hit the "Required" state and
// can see what the upload affordance looks like by default.
const EMPTY_COVERS: CoverSlot[] = Array(COVER_SLOT_COUNT).fill(null)

const SAMPLE_VIDEOS: VideoReel[] = [
  {
    id: 'v1',
    kind: 'embed',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Amani & Zuri · Zanzibar wedding film',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=450&fit=crop',
  },
]

const MIN_PORTFOLIO = 6

function newId() {
  return `p_${Math.random().toString(36).slice(2, 9)}`
}

export default function PhotosPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [covers, setCovers] = useState<CoverSlot[]>(EMPTY_COVERS)
  // Vendors start with a clean grid — we previously seeded SAMPLE_PHOTOS so
  // the editor wasn't visually empty in the mock, but real vendors should
  // never see fake stock photography.
  const [photos, setPhotos] = useState<Photo[]>([])
  const [videos, setVideos] = useState<VideoReel[]>([])
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [photoDragOver, setPhotoDragOver] = useState(false)
  const [videoDragOver, setVideoDragOver] = useState(false)
  const [coverDragOverIdx, setCoverDragOverIdx] = useState<number | null>(null)

  // Object URLs created from File uploads — revoked on unmount to avoid leaks.
  const objectUrlsRef = useRef<string[]>([])
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  // Mirror counts to the draft so the storefront sidebar can mark this section
  // complete. Only sync after hydration to avoid clobbering with the initial
  // empty default before persisted state loads.
  const filledCovers = covers.filter(Boolean).length
  useEffect(() => {
    if (!hydrated) return
    if (
      draft.photoCount !== photos.length ||
      draft.videoCount !== videos.length ||
      draft.coverPhotoCount !== filledCovers
    ) {
      update({
        photoCount: photos.length,
        videoCount: videos.length,
        coverPhotoCount: filledCovers,
      })
    }
  }, [
    hydrated,
    photos.length,
    videos.length,
    filledCovers,
    draft.photoCount,
    draft.videoCount,
    draft.coverPhotoCount,
    update,
  ])

  const portfolio = photos
  const portfolioRemaining = Math.max(0, MIN_PORTFOLIO - photos.length)

  const nextHref = useMemo(() => {
    const sections = getStorefrontSections(draft)
    const idx = sections.findIndex((s) => s.id === 'photos')
    return idx >= 0 && idx < sections.length - 1 ? sections[idx + 1].href : null
  }, [draft])

  // Track in-flight uploads so the user gets a visible loading state and
  // can't double-pick the same slot.
  const [uploadingCovers, setUploadingCovers] = useState<Set<number>>(new Set())
  const [portfolioUploads, setPortfolioUploads] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Persist cover + portfolio URLs to the DB. Cover photo is the first
  // populated cover slot; the rest of the cover slots are appended to
  // gallery_urls so admins + couples see every uploaded image.
  const [saving, startSaving] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState(false)

  if (!hydrated) {
    return <div className="p-8" aria-hidden />
  }

  const uploadFile = async (
    file: File,
    kind: 'cover' | 'gallery',
  ): Promise<string | null> => {
    // Server actions accept FormData when there's a File. The action itself
    // validates MIME + size, but we mirror those checks client-side so the
    // common error paths surface immediately without a round-trip.
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed.')
      return null
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(`That file is over 10 MB.`)
      return null
    }
    const fd = new FormData()
    fd.append('file', file)
    fd.append('kind', kind)
    const res = await uploadStorefrontPhoto(fd)
    if (!res.ok) {
      setUploadError(res.error)
      return null
    }
    return res.url
  }

  const addPhotoFiles = async (files: FileList | File[]) => {
    setUploadError(null)
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) return
    setPortfolioUploads((n) => n + list.length)
    for (const file of list) {
      const url = await uploadFile(file, 'gallery')
      if (url) {
        setPhotos((prev) => [
          ...prev,
          {
            id: newId(),
            url,
            caption: file.name.replace(/\.[^.]+$/, ''),
          },
        ])
      }
      setPortfolioUploads((n) => n - 1)
    }
  }

  // Cover slot operations — uploads target a specific index, replacing whatever
  // was there. We upload the file to the storage bucket immediately so the
  // URL we hold is a real CDN URL that survives reload + admin review.
  const setCoverFromFile = async (idx: number, file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploadError(null)
    setUploadingCovers((s) => new Set(s).add(idx))
    const url = await uploadFile(file, 'cover')
    setUploadingCovers((s) => {
      const next = new Set(s)
      next.delete(idx)
      return next
    })
    if (!url) return
    setCovers((prev) => {
      const next = prev.slice()
      next[idx] = { id: newId(), url }
      return next
    })
  }

  const clearCover = (idx: number) => {
    setCovers((prev) => {
      const before = prev[idx]
      if (before) URL.revokeObjectURL(before.url)
      const next = prev.slice()
      next[idx] = null
      return next
    })
  }

  const moveCover = (idx: number, dir: -1 | 1) => {
    setCovers((prev) => {
      const swap = idx + dir
      if (swap < 0 || swap >= prev.length) return prev
      const next = prev.slice()
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  const addVideoFiles = (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('video/'))
    if (list.length === 0) return
    const next: VideoReel[] = list.map((file) => {
      const url = URL.createObjectURL(file)
      objectUrlsRef.current.push(url)
      return {
        id: newId(),
        kind: 'upload' as const,
        url,
        title: file.name.replace(/\.[^.]+$/, ''),
      }
    })
    setVideos((prev) => [...prev, ...next])
  }

  const handlePhotoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addPhotoFiles(e.target.files)
    e.target.value = ''
  }

  const handleVideoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addVideoFiles(e.target.files)
    e.target.value = ''
  }

  const handlePhotoDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    setPhotoDragOver(false)
    if (e.dataTransfer.files) addPhotoFiles(e.dataTransfer.files)
  }

  const handleVideoDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    setVideoDragOver(false)
    if (e.dataTransfer.files) addVideoFiles(e.dataTransfer.files)
  }

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  const updateCaption = (id: string, caption: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, caption } : p)))
  }

  const movePhoto = (id: string, dir: -1 | 1) => {
    setPhotos((prev) => {
      const idx = prev.findIndex((p) => p.id === id)
      if (idx < 0) return prev
      const swap = idx + dir
      if (swap < 0 || swap >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  const addVideoUrl = () => {
    const url = videoUrl.trim()
    if (!url) return
    const title = videoTitle.trim() || extractVideoTitle(url)
    setVideos((prev) => [
      ...prev,
      {
        id: `v_${Math.random().toString(36).slice(2, 9)}`,
        kind: 'embed',
        url,
        title,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=450&fit=crop',
      },
    ])
    setVideoUrl('')
    setVideoTitle('')
  }

  const removeVideo = (id: string) => setVideos((prev) => prev.filter((v) => v.id !== id))

  const updateVideoTitle = (id: string, title: string) => {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, title } : v)))
  }

  const moveVideo = (id: string, dir: -1 | 1) => {
    setVideos((prev) => {
      const idx = prev.findIndex((v) => v.id === id)
      if (idx < 0) return prev
      const swap = idx + dir
      if (swap < 0 || swap >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  const onNext = () => {
    if (nextHref) router.push(nextHref)
  }

  const onSave = () => {
    setSaveError(null)
    setSaveOk(false)
    startSaving(async () => {
      const coverUrls = covers.filter((c): c is { id: string; url: string } => !!c).map((c) => c.url)
      const portfolioUrls = photos.map((p) => p.url)
      const res = await savePhotos({
        coverImage: coverUrls[0] ?? null,
        // Slots 2-4 of the cover carousel + every portfolio photo all land
        // in `gallery_urls` on the public profile. Dedupe just in case.
        galleryUrls: Array.from(new Set([...coverUrls.slice(1), ...portfolioUrls])),
      })
      if (!res.ok) {
        setSaveError(res.error)
        return
      }
      setSaveOk(true)
    })
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-6 lg:px-10 pt-4 lg:pt-5 pb-6">
        <div className="grid grid-cols-1 gap-6">
          {/* 1. Cover photos — 4 fixed slots that drive listing card carousels */}
          <Section
            title="Cover photos"
            hint={`These run as a carousel on your storefront and search cards. Fill all ${COVER_SLOT_COUNT} — slot ${COVER_SLOT_COUNT} is portrait for mobile.`}
            right={
              <span className="text-xs font-semibold text-gray-700 tabular-nums">
                {filledCovers} / {COVER_SLOT_COUNT}
              </span>
            }
          >
            {/* Rules callout */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 mb-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                Your cover photos
              </p>
              <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside leading-relaxed">
                <li>Landscape 16:9 works best for the first three; the fourth is portrait 3:4 for mobile.</li>
                <li>Photos are auto-cropped from the center.</li>
                <li>Don’t use photos with watermarks.</li>
                <li>Max photo size: 10 MB.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white">
              <p className="text-[11px] font-medium text-gray-500 px-4 py-3 border-b border-gray-100">
                Each photo is displayed on desktop and mobile web.
              </p>
              <ul className="divide-y divide-gray-100">
                {covers.map((slot, idx) => (
                  <li key={idx} className="flex items-center gap-4 p-4">
                    <CoverReorder
                      idx={idx}
                      total={COVER_SLOT_COUNT}
                      onUp={() => moveCover(idx, -1)}
                      onDown={() => moveCover(idx, 1)}
                    />
                    <CoverSlotView
                      slot={slot}
                      orientation={COVER_ORIENTATIONS[idx]}
                      dragOver={coverDragOverIdx === idx}
                      onPickFile={(file) => setCoverFromFile(idx, file)}
                      onDragOver={() => setCoverDragOverIdx(idx)}
                      onDragLeave={() => setCoverDragOverIdx(null)}
                      onClear={() => clearCover(idx)}
                    />
                    <p className="text-xs text-gray-700 leading-relaxed flex-1 min-w-0">
                      Pro tip:{' '}
                      <span className="text-gray-900 font-semibold">
                        a {COVER_ORIENTATIONS[idx]} photo
                      </span>{' '}
                      will look best.
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          {/* 2. Portfolio grid */}
          <Section
            title="Portfolio"
            hint={`Add at least ${MIN_PORTFOLIO} photos so couples can scroll your work. Upload as many as you like — drag in or browse. Hover any photo to reorder, edit caption, or delete.`}
            right={
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload photos
              </button>
            }
          >
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoInput}
              className="hidden"
            />

            {/* Photo quality rules — mirrors the Cover photos callout. */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 mb-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                Photo quality rules
              </p>
              <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside leading-relaxed">
                <li>High-resolution — at least 1920×1280px so they stay crisp on retina screens.</li>
                <li>JPG or PNG. HEIC files are auto-converted on upload.</li>
                <li>Mix landscape and a couple of portraits so the gallery flows.</li>
                <li>Don’t use photos with watermarks or third-party logos.</li>
                <li>Max photo size: 15 MB.</li>
              </ul>
            </div>

            {portfolioRemaining > 0 ? (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5">
                <span className="text-xs text-amber-900">
                  <span className="font-semibold">
                    {portfolioRemaining} more photo{portfolioRemaining === 1 ? '' : 's'}
                  </span>{' '}
                  to reach the {MIN_PORTFOLIO}-photo recommendation. Vendors with full portfolios
                  get up to 2× more inquiries.
                </span>
              </div>
            ) : null}

            <div
              className={cn(
                'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 rounded-xl transition-colors',
                photoDragOver && 'bg-gray-50 ring-2 ring-gray-900 ring-offset-4 ring-offset-white',
              )}
              onDragOver={(e) => {
                e.preventDefault()
                setPhotoDragOver(true)
              }}
              onDragLeave={() => setPhotoDragOver(false)}
              onDrop={handlePhotoDrop}
            >
              {portfolio.map((photo, i) => (
                <PhotoTile
                  key={photo.id}
                  photo={photo}
                  index={i}
                  total={portfolio.length}
                  editing={editingCaptionId === photo.id}
                  onDelete={() => removePhoto(photo.id)}
                  onMoveUp={() => movePhoto(photo.id, -1)}
                  onMoveDown={() => movePhoto(photo.id, 1)}
                  onEditCaption={() => setEditingCaptionId(photo.id)}
                  onSaveCaption={(c) => {
                    updateCaption(photo.id, c)
                    setEditingCaptionId(null)
                  }}
                  onCancelCaption={() => setEditingCaptionId(null)}
                />
              ))}
              <AddTile
                onClick={() => photoInputRef.current?.click()}
                icon={<ImageIcon className="w-5 h-5" />}
                label="Add photo"
              />
            </div>
          </Section>

          {/* 3. Video reels */}
          <Section
            title="Video reels"
            hint="Upload as many video files as you like, or paste YouTube/Vimeo URLs. Couples who watch a reel are far more likely to inquire."
            right={
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload videos
              </button>
            }
          >
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoInput}
              className="hidden"
            />

            {/* Video quality rules — mirrors the Photos / Cover callouts. */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 mb-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                Video quality rules
              </p>
              <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside leading-relaxed">
                <li>Resolution at least 1080p (1920×1080); 4K is even better.</li>
                <li>MP4 or MOV. H.264 is the safest codec across browsers.</li>
                <li>30–90 seconds per reel converts best — couples drop off after 90s.</li>
                <li>No watermarks, intros longer than 3 s, or third-party logos.</li>
                <li>Max video size: 250 MB. For longer cuts, paste a YouTube/Vimeo link below.</li>
              </ul>
            </div>

            <div
              className={cn(
                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-xl transition-colors mb-6',
                videoDragOver && 'bg-gray-50 ring-2 ring-gray-900 ring-offset-4 ring-offset-white',
              )}
              onDragOver={(e) => {
                e.preventDefault()
                setVideoDragOver(true)
              }}
              onDragLeave={() => setVideoDragOver(false)}
              onDrop={handleVideoDrop}
            >
              {videos.map((v, i) => (
                <VideoTile
                  key={v.id}
                  video={v}
                  index={i}
                  total={videos.length}
                  editing={editingVideoId === v.id}
                  onDelete={() => removeVideo(v.id)}
                  onMoveUp={() => moveVideo(v.id, -1)}
                  onMoveDown={() => moveVideo(v.id, 1)}
                  onEditTitle={() => setEditingVideoId(v.id)}
                  onSaveTitle={(t) => {
                    updateVideoTitle(v.id, t)
                    setEditingVideoId(null)
                  }}
                  onCancelTitle={() => setEditingVideoId(null)}
                />
              ))}
              <AddTile
                onClick={() => videoInputRef.current?.click()}
                aspect="aspect-video"
                icon={<VideoIcon className="w-5 h-5" />}
                label="Add video"
              />
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Or paste a YouTube / Vimeo link
              </p>
              <div className="grid sm:grid-cols-[1fr_220px_auto] gap-3 items-end">
                <div>
                  <FieldLabel>Video URL</FieldLabel>
                  <TextInput
                    type="url"
                    placeholder="https://youtube.com/watch?v=…"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Title (optional)</FieldLabel>
                  <TextInput
                    placeholder="e.g. Highlight reel"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={addVideoUrl}
                  disabled={!videoUrl.trim()}
                  className="inline-flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  Add reel
                </button>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Sticky bottom bar — Save + Next */}
      <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur z-30">
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-gray-500">
            <span className="font-semibold text-gray-900 tabular-nums">{photos.length}</span>{' '}
            photo{photos.length === 1 ? '' : 's'} ·{' '}
            <span className="font-semibold text-gray-900 tabular-nums">{videos.length}</span>{' '}
            video{videos.length === 1 ? '' : 's'}
            {portfolioUploads > 0 && (
              <span className="ml-3 inline-flex items-center gap-1 text-amber-700">
                <Loader2 className="w-3 h-3 animate-spin" /> Uploading {portfolioUploads}…
              </span>
            )}
            {uploadError && (
              <span className="ml-3 text-rose-700">{uploadError}</span>
            )}
            {saveError && <span className="ml-3 text-rose-700">{saveError}</span>}
            {saveOk && !saveError && (
              <span className="ml-3 text-emerald-700">Saved.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving || portfolioUploads > 0 || uploadingCovers.size > 0}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-900 text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save photos'}
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  hint,
  right,
  children,
}: {
  title: string
  hint?: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">{title}</h2>
          {hint ? <p className="text-xs text-gray-500 mt-0.5">{hint}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children}
    </section>
  )
}

function Dropzone({
  dragOver,
  onClick,
  onDrop,
  onDragOver,
  onDragLeave,
  icon,
  title,
  hint,
}: {
  dragOver: boolean
  onClick: () => void
  onDrop: (e: React.DragEvent<HTMLButtonElement>) => void
  onDragOver: (e: React.DragEvent<HTMLButtonElement>) => void
  onDragLeave: () => void
  icon: React.ReactNode
  title: string
  hint: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        'w-full aspect-[16/9] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors',
        dragOver
          ? 'border-gray-900 bg-gray-50'
          : 'border-gray-300 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-50',
      )}
    >
      <span className="w-12 h-12 rounded-2xl bg-white text-gray-700 flex items-center justify-center shadow-sm">
        {icon}
      </span>
      <span className="text-sm font-semibold text-gray-900">{title}</span>
      <span className="text-xs text-gray-500 max-w-xs text-center">{hint}</span>
    </button>
  )
}

function PhotoTile({
  photo,
  index,
  total,
  editing,
  onDelete,
  onMoveUp,
  onMoveDown,
  onEditCaption,
  onSaveCaption,
  onCancelCaption,
}: {
  photo: Photo
  index: number
  total: number
  editing: boolean
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onEditCaption: () => void
  onSaveCaption: (caption: string) => void
  onCancelCaption: () => void
}) {
  const [draftCaption, setDraftCaption] = useState(photo.caption)

  useEffect(() => {
    if (editing) setDraftCaption(photo.caption)
  }, [editing, photo.caption])

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />

      {/* Caption pill (bottom) */}
      {!editing && photo.caption ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 pt-6 pb-2">
          <p className="text-[11px] text-white font-medium line-clamp-1 drop-shadow-sm">
            {photo.caption}
          </p>
        </div>
      ) : null}

      {/* Hover overlay actions */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 flex flex-col">
        <div className="flex items-start justify-between gap-1 p-2">
          <div className="flex flex-col gap-1">
            <IconButton
              label="Move up"
              disabled={index === 0}
              onClick={onMoveUp}
              icon={<ArrowUp className="w-3.5 h-3.5" />}
            />
            <IconButton
              label="Move down"
              disabled={index === total - 1}
              onClick={onMoveDown}
              icon={<ArrowDown className="w-3.5 h-3.5" />}
            />
          </div>
          <div className="flex flex-col gap-1">
            <IconButton
              label="Edit caption"
              onClick={onEditCaption}
              icon={<Pencil className="w-3.5 h-3.5" />}
            />
            <IconButton
              label="Delete"
              onClick={onDelete}
              icon={<Trash2 className="w-3.5 h-3.5" />}
              tone="danger"
            />
          </div>
        </div>
      </div>

      {/* Caption editor (replaces overlay when active) */}
      {editing ? (
        <div className="absolute inset-x-2 bottom-2 bg-white rounded-lg shadow-lg p-2 flex items-center gap-1.5">
          <input
            autoFocus
            value={draftCaption}
            onChange={(e) => setDraftCaption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveCaption(draftCaption)
              if (e.key === 'Escape') onCancelCaption()
            }}
            placeholder="Add a caption…"
            className="flex-1 min-w-0 text-xs bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => onSaveCaption(draftCaption)}
            className="text-[10px] font-bold uppercase tracking-wider text-gray-900 hover:text-gray-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancelCaption}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  )
}

function IconButton({
  label,
  icon,
  onClick,
  disabled,
  tone = 'default',
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        'w-7 h-7 rounded-md flex items-center justify-center transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed',
        tone === 'danger'
          ? 'bg-white/95 text-rose-600 hover:bg-rose-50'
          : 'bg-white/95 text-gray-900 hover:bg-white',
      )}
    >
      {icon}
    </button>
  )
}

function VideoTile({
  video,
  index,
  total,
  editing,
  onDelete,
  onMoveUp,
  onMoveDown,
  onEditTitle,
  onSaveTitle,
  onCancelTitle,
}: {
  video: VideoReel
  index: number
  total: number
  editing: boolean
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onEditTitle: () => void
  onSaveTitle: (title: string) => void
  onCancelTitle: () => void
}) {
  const [draftTitle, setDraftTitle] = useState(video.title)

  useEffect(() => {
    if (editing) setDraftTitle(video.title)
  }, [editing, video.title])

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 group">
      {video.kind === 'upload' ? (
        <video
          src={video.url}
          className="w-full h-full object-cover bg-black"
          // preload="metadata" loads enough for the browser to show the first
          // frame as a poster without auto-playing.
          preload="metadata"
          controls
          playsInline
        />
      ) : (
        <>
          {video.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          <a
            href={video.url}
            target="_blank"
            rel="noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
            aria-label={`Open ${video.title}`}
          >
            <span className="w-12 h-12 rounded-full bg-white/95 text-gray-900 flex items-center justify-center shadow">
              <VideoIcon className="w-5 h-5" />
            </span>
          </a>
        </>
      )}

      {/* Title pill (bottom) */}
      {!editing ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-8 pb-2 pointer-events-none">
          <p className="text-xs text-white font-semibold line-clamp-1 drop-shadow-sm">
            {video.title}
          </p>
        </div>
      ) : null}

      {/* Hover overlay actions */}
      <div className="absolute inset-x-0 top-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-between gap-1 pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto">
          <IconButton
            label="Move up"
            disabled={index === 0}
            onClick={onMoveUp}
            icon={<ArrowUp className="w-3.5 h-3.5" />}
          />
          <IconButton
            label="Move down"
            disabled={index === total - 1}
            onClick={onMoveDown}
            icon={<ArrowDown className="w-3.5 h-3.5" />}
          />
        </div>
        <div className="flex flex-col gap-1 pointer-events-auto">
          <IconButton
            label="Edit title"
            onClick={onEditTitle}
            icon={<Pencil className="w-3.5 h-3.5" />}
          />
          <IconButton
            label="Delete"
            onClick={onDelete}
            icon={<Trash2 className="w-3.5 h-3.5" />}
            tone="danger"
          />
        </div>
      </div>

      {/* Title editor */}
      {editing ? (
        <div className="absolute inset-x-2 bottom-2 bg-white rounded-lg shadow-lg p-2 flex items-center gap-1.5 z-10">
          <input
            autoFocus
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveTitle(draftTitle)
              if (e.key === 'Escape') onCancelTitle()
            }}
            placeholder="Add a title…"
            className="flex-1 min-w-0 text-xs bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => onSaveTitle(draftTitle)}
            className="text-[10px] font-bold uppercase tracking-wider text-gray-900 hover:text-gray-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancelTitle}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  )
}

function AddTile({
  onClick,
  icon,
  label,
  aspect = 'aspect-square',
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  aspect?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        aspect,
        'rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-gray-50/50 flex flex-col items-center justify-center gap-2 transition-colors text-gray-500 hover:text-gray-700',
      )}
    >
      {icon}
      <span className="text-xs font-semibold">{label}</span>
    </button>
  )
}

function CoverReorder({
  idx,
  total,
  onUp,
  onDown,
}: {
  idx: number
  total: number
  onUp: () => void
  onDown: () => void
}) {
  return (
    <div className="flex flex-col items-center text-gray-400 shrink-0">
      <button
        type="button"
        onClick={onUp}
        disabled={idx === 0}
        aria-label="Move up"
        className="p-0.5 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowUp className="w-3.5 h-3.5" />
      </button>
      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" aria-hidden />
      <button
        type="button"
        onClick={onDown}
        disabled={idx === total - 1}
        aria-label="Move down"
        className="p-0.5 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowDown className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function CoverSlotView({
  slot,
  orientation,
  dragOver,
  onPickFile,
  onDragOver,
  onDragLeave,
  onClear,
}: {
  slot: { id: string; url: string } | null
  orientation: CoverOrientation
  dragOver: boolean
  onPickFile: (file: File) => void
  onDragOver: () => void
  onDragLeave: () => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const aspectClass = orientation === 'landscape' ? 'aspect-[16/9] w-44' : 'aspect-[3/4] w-28'

  return (
    <div
      className={cn(
        'relative shrink-0 rounded-xl overflow-hidden transition-colors',
        aspectClass,
        slot
          ? 'border border-gray-200 bg-gray-100'
          : 'border-2 border-dashed border-gray-300 bg-gray-50/40 hover:border-gray-400 hover:bg-gray-50',
        dragOver && 'border-solid border-gray-900 ring-2 ring-gray-900 ring-offset-2 bg-gray-50',
      )}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver()
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault()
        onDragLeave()
        const file = e.dataTransfer.files?.[0]
        if (file) onPickFile(file)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPickFile(file)
          e.target.value = ''
        }}
      />

      {slot ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slot.url} alt="Cover photo" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 bg-black/45 text-white flex flex-col items-center justify-center gap-0.5 opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Replace cover photo"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Replace</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/95 text-gray-700 hover:text-rose-600 flex items-center justify-center shadow-sm"
            aria-label="Remove cover photo"
            title="Remove"
          >
            <X className="w-3 h-3" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Upload cover photo"
        >
          <span className="relative">
            <Camera className="w-6 h-6" />
            <Plus className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Required
          </span>
        </button>
      )}
    </div>
  )
}

// Best-effort title extraction so a paste-only workflow still produces a label.
function extractVideoTitle(url: string): string {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      return 'YouTube video'
    }
    if (u.hostname.includes('vimeo.com')) return 'Vimeo video'
    return u.hostname
  } catch {
    return 'Video'
  }
}
