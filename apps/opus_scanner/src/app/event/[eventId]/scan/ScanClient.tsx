'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, FlashlightOff, Flashlight, RotateCw, Users, XCircle } from 'lucide-react'
import { readSession, type ScannerSession } from '@/lib/session'
import {
  enqueuePendingScan,
  listPendingScans,
  listRoster,
  lookupRoster,
  markRosterCheckedInLocally,
  removePendingScan,
  type RosterEntry,
} from '@/lib/db'
import { checkinChannelName, createRealtimeClient, type CheckinBroadcastPayload } from '@/lib/realtimeClient'
import { playScanFeedback } from './feedback'
import { SCAN_STRINGS, readLocale, onLocaleChange, type Locale } from '@/lib/locale'

interface CheckinResult {
  status: 'success' | 'duplicate' | 'invalid' | 'error' | 'queued'
  message?: string
  guestName?: string
  partySize?: number
  isVip?: boolean
  /** The couple's real guest-list grouping (e.g. "Bride's Family") — not a
   * fabricated VIP/General tier. */
  groupTag?: string | null
}

type RosterRow = RosterEntry & { key: string; eventId: string }

// Native decoder where available (most current Android/Chrome); jsQR is the
// fallback for browsers without BarcodeDetector (notably iOS Safari).
type BarcodeDetectorLike = { detect(source: CanvasImageSource): Promise<{ rawValue: string }[]> }

const RESCAN_COOLDOWN_MS = 3000

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

/** Small rotating radar sweep — replaces a plain "active" dot with something
 * that actually reads as "scanning" over the dark camera viewport. */
function RadarSweep() {
  return (
    <div className="relative h-4 w-4">
      <div className="absolute inset-0 rounded-full border border-[#C9A0DC]/40" />
      <div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{ animation: 'radar-sweep 2s linear infinite' }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #C9A0DC 360deg)' }}
        />
      </div>
      <div className="absolute inset-0 m-auto h-1 w-1 rounded-full bg-[#C9A0DC]" />
    </div>
  )
}

export default function ScanClient({ eventId }: { eventId: string }) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastScanRef = useRef<{ value: string; at: number } | null>(null)
  const sessionRef = useRef<ScannerSession | null>(null)
  const inFlightRef = useRef(false)

  // Language is toggled from the shared navbar (ScannerShell), not here —
  // pick up the initial value on mount, then stay in sync live.
  const [locale, setLocale] = useState<Locale>('en')
  useEffect(() => {
    setLocale(readLocale())
    return onLocaleChange(setLocale)
  }, [])
  const t = SCAN_STRINGS[locale]

  const [result, setResult] = useState<CheckinResult | null>(null)
  const [cameraError, setCameraError] = useState('')
  const [pendingCount, setPendingCount] = useState(0)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [torchOn, setTorchOn] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)

  const refreshPendingCount = useCallback(() => {
    listPendingScans(eventId).then((rows) => setPendingCount(rows.length))
  }, [eventId])

  /** Resolve a scan against the cached roster when we have no network. */
  const checkInOffline = useCallback(async (qrToken: string, manualReason?: string): Promise<CheckinResult> => {
    const session = sessionRef.current
    if (!session) return { status: 'error', message: 'No active session' }

    const entry = await lookupRoster(eventId, qrToken)
    if (!entry) return { status: 'invalid', message: 'Not a valid entry pass (offline — will not sync)' }
    if (entry.checkedInAt) {
      return { status: 'duplicate', guestName: entry.fullName, partySize: entry.partySize, isVip: entry.isVip, groupTag: entry.groupTag }
    }

    const now = new Date().toISOString()
    await markRosterCheckedInLocally(eventId, qrToken, now)
    await enqueuePendingScan({
      eventId,
      qrToken,
      doorLabel: session.doorLabel,
      attendantName: session.attendantName,
      scannedAt: now,
      manualReason,
    })
    refreshPendingCount()
    return { status: 'queued', guestName: entry.fullName, partySize: entry.partySize, isVip: entry.isVip, groupTag: entry.groupTag }
  }, [eventId, refreshPendingCount])

  const submitScan = useCallback(async (qrToken: string, manualReason?: string) => {
    const session = sessionRef.current
    if (!session || inFlightRef.current) return
    inFlightRef.current = true
    let data: CheckinResult
    try {
      if (!navigator.onLine) {
        data = await checkInOffline(qrToken, manualReason)
      } else {
        try {
          const res = await fetch('/api/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId,
              accessToken: session.accessToken,
              doorLabel: session.doorLabel,
              attendantName: session.attendantName,
              qrToken,
              manualReason,
            }),
          })
          data = (await res.json()) as CheckinResult
          // Keep the local roster cache (used by this device's own Guests/Stats
          // tabs, and by offline lookups) in sync with the server's
          // authoritative write — without this, a successful online scan
          // never shows up in the Guest Ledger until the next full login.
          if (data.status === 'success' || data.status === 'duplicate') {
            await markRosterCheckedInLocally(eventId, qrToken, new Date().toISOString())
          }
        } catch {
          // fetch threw — treat as offline rather than a hard error.
          data = await checkInOffline(qrToken, manualReason)
        }
      }
      setResult(data)
      playScanFeedback(
        data.status === 'success' || data.status === 'queued'
          ? 'success'
          : data.status === 'duplicate'
            ? 'duplicate'
            : 'fail',
      )
    } finally {
      inFlightRef.current = false
    }
    setTimeout(() => setResult(null), 2200)
  }, [eventId, checkInOffline])

  /** Flush queued offline scans once we're back online. The server's atomic
   * RPC is authoritative — a scan queued twice, or that lost a race to
   * another door, still resolves correctly (just reports as a duplicate). */
  const flushQueue = useCallback(async () => {
    const session = sessionRef.current
    if (!session) return
    const pending = await listPendingScans(eventId)
    for (const scan of pending) {
      try {
        const res = await fetch('/api/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            accessToken: session.accessToken,
            doorLabel: scan.doorLabel,
            attendantName: scan.attendantName,
            qrToken: scan.qrToken,
            manualReason: scan.manualReason,
          }),
        })
        if (res.ok && scan.id !== undefined) await removePendingScan(scan.id)
      } catch {
        break // still offline — stop and retry on the next 'online' event
      }
    }
    refreshPendingCount()
  }, [eventId, refreshPendingCount])

  useEffect(() => {
    refreshPendingCount()
    window.addEventListener('online', flushQueue)
    if (navigator.onLine) flushQueue()
    return () => window.removeEventListener('online', flushQueue)
  }, [flushQueue, refreshPendingCount])

  // Live "recent activity" across all doors for this event. Seeded from the
  // roster's own checked-in guests on load (a Realtime Broadcast channel has
  // no history — a device that wasn't subscribed when a scan happened would
  // otherwise show "no arrivals yet" while the stats row above it already
  // counts that guest as admitted, which is a real contradiction, not just
  // a cosmetic gap). Live broadcasts prepend on top of that seed.
  const [activity, setActivity] = useState<CheckinBroadcastPayload[]>([])
  const activitySeededRef = useRef(false)
  useEffect(() => {
    let client: ReturnType<typeof createRealtimeClient>
    try {
      client = createRealtimeClient()
    } catch {
      return // NEXT_PUBLIC_SUPABASE_ANON_KEY not configured — feed just stays empty
    }
    const channel = client
      .channel(checkinChannelName(eventId))
      .on('broadcast', { event: 'scan' }, ({ payload }) => {
        setActivity((prev) => [payload as CheckinBroadcastPayload, ...prev].slice(0, 6))
      })
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }, [eventId])

  const handleDecoded = useCallback(
    (value: string) => {
      const last = lastScanRef.current
      if (last && last.value === value && Date.now() - last.at < RESCAN_COOLDOWN_MS) return
      lastScanRef.current = { value, at: Date.now() }
      submitScan(value)
    },
    [submitScan],
  )

  const [session, setSession] = useState<ScannerSession | null>(null)
  useEffect(() => {
    const loaded = readSession(eventId)
    if (!loaded || !loaded.attendantName) {
      router.replace(`/event/${eventId}`)
      return
    }
    sessionRef.current = loaded
    setSession(loaded)
  }, [eventId, router])

  // Roster summary for the stats row — real counts from the cached roster,
  // refreshed whenever a check-in (camera or concierge) lands.
  const [roster, setRoster] = useState<RosterRow[]>([])
  const refreshRoster = useCallback(() => {
    listRoster(eventId).then(setRoster)
  }, [eventId])
  useEffect(() => {
    refreshRoster()
  }, [refreshRoster, result])

  // One-time seed of Recent Arrivals from whatever's already checked in —
  // see the comment above the `activity` state for why this matters.
  useEffect(() => {
    if (activitySeededRef.current || roster.length === 0) return
    const already = roster
      .filter((r) => r.checkedInAt)
      .sort((a, b) => (b.checkedInAt! > a.checkedInAt! ? 1 : -1))
      .slice(0, 6)
      .map((r) => ({
        status: 'success' as const,
        guestName: r.fullName,
        partySize: r.partySize,
        doorLabel: session?.doorLabel ?? '',
        at: r.checkedInAt!,
      }))
    if (already.length > 0) {
      activitySeededRef.current = true
      setActivity((prev) => (prev.length > 0 ? prev : already))
    }
  }, [roster, session])

  const admitted = roster.filter((r) => r.checkedInAt).length
  const capacityPct = roster.length > 0 ? Math.round((admitted / roster.length) * 100) : 0

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        // Explicit resolution hint — without it some laptop webcams default
        // to a tight, near-square crop that looks unintentionally zoomed in.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (cancelled || !videoRef.current) return
        streamRef.current = stream
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        const track = stream.getVideoTracks()[0]
        const caps = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined
        setTorchSupported(Boolean(caps?.torch))
        loop(0)
      } catch {
        setCameraError('Could not access the camera. Check permissions and reload.')
      }
    }

    // Built once, not per-frame — cheap devices choke if this gets
    // re-constructed 60x/sec. Same for the dynamic jsQR import.
    const detector: BarcodeDetectorLike | null =
      'BarcodeDetector' in window
        ? new (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => BarcodeDetectorLike }).BarcodeDetector({ formats: ['qr_code'] })
        : null
    const jsQRPromise = detector ? null : import('jsqr').then((m) => m.default)

    // Decoding every animation frame (~60fps) burns battery/CPU for no
    // benefit on low-end Android — a QR code doesn't move that fast.
    // ~6-7 attempts/sec is plenty responsive and much lighter.
    const DECODE_INTERVAL_MS = 150
    let lastDecodeAt = 0

    async function loop(now: number) {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || cancelled) return

      if (now - lastDecodeAt >= DECODE_INTERVAL_MS && video.readyState === video.HAVE_ENOUGH_DATA) {
        lastDecodeAt = now

        if (detector) {
          try {
            const codes = await detector.detect(video)
            if (codes[0]) handleDecoded(codes[0].rawValue)
          } catch {
            // transient decode failure — just try again next tick
          }
        } else if (jsQRPromise) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const jsQR = await jsQRPromise
            const code = jsQR(imageData.data, imageData.width, imageData.height)
            if (code) handleDecoded(code.data)
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    start()
    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [handleDecoded, facingMode])

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    const next = !torchOn
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] })
      setTorchOn(next)
    } catch {
      // device claims torch support but rejected the constraint — ignore
    }
  }

  // Inline "Concierge Entry" — search the cached roster for guests who can't
  // present a QR (lost phone, etc). Only matches real invited guests; never
  // fabricates a walk-up guest. Routes through submitScan so every check-in
  // (camera or concierge) shares one code path and one audit trail.
  const [query, setQuery] = useState('')
  const [reason, setReason] = useState('Lost phone')
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return roster.filter((r) => r.fullName.toLowerCase().includes(q)).slice(0, 5)
  }, [query, roster])

  const toneByStatus = {
    success: 'text-[#3f8b5c]',
    queued: 'text-[#3f8b5c]',
    duplicate: 'text-[#b07f2c]',
    invalid: 'text-[#a84f66]',
    error: 'text-[#a84f66]',
  } as const

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-10 pb-8 sm:px-8">
      <div className="text-center">
        <p className="text-[10px] tracking-wide text-[#8e57b3] uppercase">{session?.eventName}</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-[#1A1A1A]">{session?.doorLabel}</h2>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Scanner column */}
        <section className="flex flex-col gap-6 lg:col-span-7">
          <div className="group relative aspect-video overflow-hidden rounded-2xl border border-black/[0.06] bg-[#1A1A1A] shadow-md">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 h-full w-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A] p-6 text-center text-sm text-white/60">
                {cameraError}
              </div>
            ) : null}

            {/* Scanning reticle — sized and labeled for a QR code, not a
                face; this app only ever does QR decoding. Stays up always,
                including once everyone expected has arrived — the scanner
                keeps running for walk-ins/plus-ones regardless. */}
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="relative h-40 w-40 sm:h-48 sm:w-48" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)' }}>
                <div className="absolute top-0 left-0 h-7 w-7 border-t-2 border-l-2 border-[#C9A0DC]" />
                <div className="absolute top-0 right-0 h-7 w-7 border-t-2 border-r-2 border-[#C9A0DC]" />
                <div className="absolute bottom-0 left-0 h-7 w-7 border-b-2 border-l-2 border-[#C9A0DC]" />
                <div className="absolute right-0 bottom-0 h-7 w-7 border-r-2 border-b-2 border-[#C9A0DC]" />
                <div
                  className="absolute right-0 left-0 h-px bg-[#C9A0DC] shadow-[0_0_15px_rgba(201,160,220,0.6)]"
                  style={{ animation: 'scan-vertical 3s ease-in-out infinite' }}
                />
              </div>
            </div>

            <div className="absolute top-6 right-0 left-0 z-20 flex justify-center px-6">
              <p className="text-center text-[11px] font-medium tracking-wide text-white/90 uppercase drop-shadow-sm">
                {t.alignQr}
              </p>
            </div>

            {/* Result flash */}
            {result ? (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white/95 text-center backdrop-blur-sm">
                {result.status === 'success' || result.status === 'queued' ? (
                  <CheckCircle2 className="h-12 w-12 text-[#3f8b5c]" strokeWidth={1.5} />
                ) : (
                  <XCircle className="h-12 w-12 text-[#a84f66]" strokeWidth={1.5} />
                )}
                <div>
                  <p className={`text-xl font-bold text-[#1A1A1A] ${result.isVip ? 'inline-flex items-center gap-2' : ''}`}>
                    {result.guestName ?? (result.status === 'invalid' ? 'Not valid' : 'Error')}
                    {result.isVip ? (
                      <span className="rounded-full bg-[#FCE9C2] px-2 py-0.5 align-middle text-[9px] font-bold tracking-wide text-[#B07F2C] uppercase">
                        VIP
                      </span>
                    ) : null}
                  </p>
                  {result.groupTag ? (
                    <p className="mt-0.5 text-xs text-[#1A1A1A]/50">{result.groupTag}</p>
                  ) : null}
                  <p className={`mt-1 text-xs tracking-wide uppercase ${toneByStatus[result.status]}`}>
                    {result.status === 'success' && t.accessGranted(result.partySize)}
                    {result.status === 'queued' && t.accessGrantedOffline}
                    {result.status === 'duplicate' && t.alreadyCheckedIn}
                    {result.status === 'invalid' && (result.message || t.notValidPass)}
                    {result.status === 'error' && (result.message || t.somethingWrong)}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Camera controls */}
            <div className="absolute right-6 bottom-6 left-6 z-40 flex items-end justify-between">
              <div className="flex items-center gap-2.5">
                <RadarSweep />
                <span className="text-[10px] font-medium tracking-wide text-white/90 uppercase">{t.scannerActive}</span>
              </div>
              <div className="flex gap-3">
                {torchSupported ? (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    title={t.flashlight}
                    aria-label={t.flashlight}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                  >
                    {torchOn ? <Flashlight className="h-4 w-4" /> : <FlashlightOff className="h-4 w-4" />}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))}
                  title={t.flipCamera}
                  aria-label={t.flipCamera}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {pendingCount > 0 ? (
            <p className="rounded-lg border border-[#FCE9C2] bg-[#FCE9C2]/40 px-4 py-2 text-center text-xs font-medium tracking-wide text-[#B07F2C] uppercase">
              {t.pendingSync(pendingCount)}
            </p>
          ) : null}

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-black/[0.06] overflow-hidden rounded-xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col items-center justify-center bg-white p-5">
              <span className="text-2xl font-bold text-[#1A1A1A]">{admitted}</span>
              <span className="mt-1 text-[9px] tracking-wide text-[#1A1A1A] uppercase">{t.admitted}</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white p-5">
              <span className="text-2xl font-bold text-[#1A1A1A]">{roster.length}</span>
              <span className="mt-1 text-[9px] tracking-wide text-[#1A1A1A] uppercase">{t.expected}</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white p-5">
              <span className="text-2xl font-bold text-[#1A1A1A]">{capacityPct}%</span>
              <span className="mt-1 text-[9px] tracking-wide text-[#1A1A1A] uppercase">{t.checkedIn}</span>
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <section className="flex flex-col gap-6 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
              <h3 className="text-base font-bold text-[#1A1A1A]">{t.recentArrivals}</h3>
              <span className="animate-pulse rounded-full bg-[#3f8b5c] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
                {t.live}
              </span>
            </div>
            <div className="custom-scrollbar mt-4 flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
              {activity.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0DFF6] text-[#8e57b3]">
                    <Users className="h-5 w-5" />
                  </span>
                  <p className="text-xs text-[#1A1A1A]/60">{t.noArrivals}</p>
                </div>
              ) : (
                activity.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white p-3 transition-colors hover:border-black/[0.12]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0DFF6] text-[#8e57b3]">
                      <span className="text-xs font-semibold">{initials(a.guestName)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1A1A1A]">{a.guestName}</p>
                      <p className="text-[10px] tracking-wide text-[#1A1A1A] uppercase">{a.doorLabel}</p>
                    </div>
                    {a.status === 'duplicate' ? (
                      <Clock className="h-4 w-4 shrink-0 text-[#B07F2C]" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#3f8b5c]" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Concierge entry */}
          <div className="mt-auto border-t border-black/[0.06] pt-6">
            <label className="mb-2 block text-[10px] tracking-wide text-[#1A1A1A] uppercase">{t.conciergeEntry}</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.guestNamePlaceholder}
              className="w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-sm text-[#1A1A1A] outline-none transition-colors placeholder:text-gray-500 focus:border-[#C9A0DC] focus:ring-2 focus:ring-[#C9A0DC]/30"
            />

            {!query.trim() ? <p className="mt-2 text-[11px] text-[#1A1A1A]/50">{t.startTyping}</p> : null}

            {query.trim() ? (
              <div className="mt-3 space-y-2">
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t.reasonPlaceholder}
                  className="w-full rounded-lg border border-black/[0.12] bg-black/[0.02] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-[#C9A0DC]"
                />
                {matches.length === 0 ? (
                  <p className="py-3 text-center text-xs text-[#1A1A1A]">{t.noMatch(query)}</p>
                ) : (
                  matches.map((entry) => (
                    <div
                      key={entry.key}
                      className="flex items-center justify-between gap-3 rounded-lg border border-black/[0.08] bg-white p-3"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate text-sm font-medium text-[#1A1A1A]">
                          {entry.fullName}
                          {entry.isVip ? (
                            <span className="rounded bg-[#FCE9C2] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#B07F2C] uppercase">
                              VIP
                            </span>
                          ) : null}
                        </p>
                        <p className="text-[10px] tracking-wide text-[#1A1A1A] uppercase">
                          {entry.groupTag ? `${entry.groupTag} · ` : ''}
                          {t.partyOf(entry.partySize)}
                          {entry.checkedInAt ? t.checkedInSuffix : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={Boolean(entry.checkedInAt)}
                        onClick={() => {
                          submitScan(entry.qrToken, reason.trim() || 'Manual')
                          setQuery('')
                        }}
                        className="shrink-0 rounded-full border border-black/[0.12] px-4 py-1.5 text-[10px] font-medium tracking-wide text-[#1A1A1A] uppercase transition-colors hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {entry.checkedInAt ? t.admittedPill : t.admit}
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}
