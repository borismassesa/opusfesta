'use client'

import { useEffect, useRef, useState, useTransition, type FocusEvent, type FormEvent } from 'react'
import Image from 'next/image'
import { Camera, Check, Mic, Pause, Play, Square, Trash2 } from 'lucide-react'
import { submitGuestbookEntry } from '@/lib/dashboard/actions'
import type { PublicGuestbookPage } from '@/lib/dashboard/queries'
import { GUESTBOOK_RELATIONS, type GuestbookEntry, type GuestbookRelation } from '@/lib/dashboard/types'

// Ported from apps/wedding_website's "Wishes" tab (WishForm.tsx + WishFeed.tsx
// + the @theme tokens in src/index.css) — same stationery-card composer, same
// filter-chip + masonry-wall layout, but OpusFesta/OpusPass's actual brand
// lavender (globals.css --accent) in place of the reference's plum.
const PRIMARY = '#C9A0DC' // OpusFesta/OpusPass brand lavender (--accent) — headings, CTAs, active states
const ON_PRIMARY = '#1A1A1A' // globals.css --on-accent — dark ink reads on the lavender, not white
const SECONDARY = '#615c68'
const ON_SURFACE = '#1d1b20'
const OUTLINE_VARIANT = '#cec3d1'
const SURFACE_CONTAINER = '#f9f9f9'
const CARD_BG = '#ffffff' // plain white — the card reads via its border/shadow, not a color tint
const CARD_BORDER = '#E2E2E2' // neutral gray, genuinely visible border (not a lavender/black tint)
const FIELD_BORDER = '#D8CDE3' // deeper than OUTLINE_VARIANT so boxed fields stay visible on the white card

const heading = { fontFamily: 'var(--font-playfair), Georgia, serif' }
const body = { fontFamily: 'var(--font-montserrat), system-ui, sans-serif' }

type Lang = 'sw' | 'en'
const LANG_KEY = 'opuspass-guestbook-lang'

const STR: Record<Lang, Record<string, string>> = {
  sw: {
    form_title: 'Acha ujumbe wako',
    form_note: 'Shiriki kumbukumbu, ushauri, au ujumbe kwa mwanzo wao mpya.',
    name: 'Jina lako',
    name_ph: 'Andika jina lako',
    relation: 'Uhusiano',
    relation_family: 'Familia',
    relation_friend: 'Rafiki',
    relation_colleague: 'Mfanyakazi mwenzako',
    message: 'Ujumbe',
    message_ph: 'Andika kutoka moyoni…',
    record: 'Rekodi',
    recording: 'Inarekodi…',
    stop: 'Simamisha',
    discard: 'Ondoa',
    mic_denied: 'Imeshindwa kufikia maikrofoni. Angalia ruhusa ya kivinjari chako.',
    photo: 'Picha',
    send: 'Tuma Upendo Wako',
    sending: 'Inatuma…',
    error_name: 'Tafadhali jaza jina lako',
    error_message: 'Tafadhali andika ujumbe mfupi au rekodi sauti',
    error_generic: 'Kuna hitilafu, tafadhali jaribu tena.',
    done_title: 'Asante, {name}!',
    done_body: 'Ujumbe wako unasubiri ukaguzi mfupi kutoka kwa wenye sherehe kabla haujaonekana hapa.',
    write_another: 'Andika ujumbe mwingine',
    all_wishes: 'Jumbe Zote',
    filter_messages: 'Ujumbe',
    filter_videos: 'Video',
    filter_photos: 'Picha',
    voice_notes: 'Sauti',
    empty_title: 'Bado hakuna ujumbe',
    empty_body: 'Uwe wa kwanza kuandika ujumbe hapa.',
    powered: 'Inaendeshwa na OpusPass',
    just_now: 'Sasa hivi',
  },
  en: {
    form_title: 'Leave your wishes',
    form_note: 'Share a memory, advice, or message for their new beginning.',
    name: 'Your name',
    name_ph: 'Enter your name',
    relation: 'Relation',
    relation_family: 'Family',
    relation_friend: 'Friend',
    relation_colleague: 'Colleague',
    message: 'Message',
    message_ph: 'Write from the heart…',
    record: 'Record',
    recording: 'Recording…',
    stop: 'Stop',
    discard: 'Discard',
    mic_denied: "Couldn't access your microphone. Check your browser permissions.",
    photo: 'Photo',
    send: 'Send Your Love',
    sending: 'Sending…',
    error_name: 'Please enter your name',
    error_message: 'Please write a short message or record a voice note',
    error_generic: 'Something went wrong, please try again.',
    done_title: 'Thank you, {name}!',
    done_body: 'Your message is awaiting a quick review from the couple before it appears here.',
    write_another: 'Write another message',
    all_wishes: 'All Wishes',
    filter_messages: 'Messages',
    filter_videos: 'Videos',
    filter_photos: 'Photos',
    voice_notes: 'Voice Notes',
    empty_title: 'No wishes yet',
    empty_body: 'Be the first to write one.',
    powered: 'Powered by OpusPass',
    just_now: 'Just now',
  },
}

const RELATION_LABEL_KEY: Record<GuestbookRelation, string> = {
  Family: 'relation_family',
  Friend: 'relation_friend',
  Colleague: 'relation_colleague',
}

function relativeTime(iso: string, t: Record<string, string>): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (diffSec < 60) return t.just_now
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}h ago`.replace('h', 'm')
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hours ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 30) return `${diffDay} days ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/** mm:ss, e.g. 125s -> "2:05". */
function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${String(rem).padStart(2, '0')}`
}

// ─────────────────────────────────────────────────────────────────────────────
//  WishForm — the sticky "stationery card" composer
// ─────────────────────────────────────────────────────────────────────────────

const MAX_RECORD_SECONDS = 120

function extForAudioType(mime: string): string {
  if (mime.startsWith('audio/mp4')) return 'm4a'
  if (mime.startsWith('audio/ogg')) return 'ogg'
  return 'webm'
}

function WishForm({ slug, t }: { slug: string; t: Record<string, string> }) {
  const [name, setName] = useState('')
  const [relation, setRelation] = useState<GuestbookRelation>('Family')
  const [message, setMessage] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Live mic-reactive ripple rings (Whisper Flow / Claude / ChatGPT voice-mode
  // style) — driven by a Web Audio AnalyserNode read every frame and written
  // straight to the ring elements' style, not React state, so the animation
  // stays smooth at 60fps without re-rendering the component every tick.
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rippleRafRef = useRef<number | null>(null)
  const ring1Ref = useRef<HTMLSpanElement | null>(null)
  const ring2Ref = useRef<HTMLSpanElement | null>(null)
  const dotRef = useRef<HTMLSpanElement | null>(null)

  function stopRippleLoop() {
    if (rippleRafRef.current !== null) {
      cancelAnimationFrame(rippleRafRef.current)
      rippleRafRef.current = null
    }
    analyserRef.current = null
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
  }

  function startRippleLoop(stream: MediaStream) {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const audioCtx = new AudioCtx()
    const source = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.6
    source.connect(analyser)
    audioCtxRef.current = audioCtx
    analyserRef.current = analyser
    const data = new Uint8Array(analyser.frequencyBinCount)

    function tick() {
      analyser.getByteTimeDomainData(data)
      let sumSquares = 0
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128
        sumSquares += v * v
      }
      const rms = Math.sqrt(sumSquares / data.length)
      const level = Math.min(1, rms * 5) // amplify quiet speech into a visible range
      if (ring1Ref.current) {
        ring1Ref.current.style.transform = `scale(${1 + level * 1.1})`
        ring1Ref.current.style.opacity = String(0.35 - level * 0.2)
      }
      if (ring2Ref.current) {
        ring2Ref.current.style.transform = `scale(${1 + level * 0.6})`
        ring2Ref.current.style.opacity = String(0.5 - level * 0.15)
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `scale(${1 + level * 0.25})`
      }
      rippleRafRef.current = requestAnimationFrame(tick)
    }
    tick()
  }

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      stopRippleLoop()
    }
  }, [])

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    stopRippleLoop()
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
  }

  async function startRecording() {
    setError(null)
    setAudioBlob(null)
    setPhoto(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeCandidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
      const mimeType =
        typeof MediaRecorder !== 'undefined'
          ? mimeCandidates.find((m) => MediaRecorder.isTypeSupported?.(m))
          : undefined
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      audioChunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        setAudioBlob(new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' }))
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
      setRecordingSeconds(0)
      startRippleLoop(stream)
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => {
          const next = s + 1
          if (next >= MAX_RECORD_SECONDS) stopRecording()
          return next
        })
      }, 1000)
    } catch {
      setError(t.mic_denied)
    }
  }

  function discardRecording() {
    setAudioBlob(null)
    setRecordingSeconds(0)
  }

  function reset() {
    setName('')
    setMessage('')
    setPhoto(null)
    discardRecording()
    setDone(false)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) return setError(t.error_name)
    if (!message.trim() && !audioBlob) return setError(t.error_message)

    const formData = new FormData()
    formData.set('name', name.trim())
    formData.set('message', message.trim())
    formData.set('relation', relation)
    if (photo) formData.set('photo', photo)
    if (audioBlob) {
      formData.set('audio', new File([audioBlob], `voice-note.${extForAudioType(audioBlob.type)}`, { type: audioBlob.type }))
    }

    startTransition(async () => {
      const res = await submitGuestbookEntry(slug, formData)
      if (res.ok) setDone(true)
      else setError(res.error ?? t.error_generic)
    })
  }

  const cardStyle = {
    backgroundColor: CARD_BG,
    border: `1.5px solid ${CARD_BORDER}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 20px 48px -12px rgba(0,0,0,0.12)',
  }
  const field =
    'w-full rounded-xl bg-white px-4 py-3 text-sm outline-none transition-colors'

  function fieldStyle() {
    return { ...body, color: ON_SURFACE, border: `1.5px solid ${FIELD_BORDER}` }
  }
  function onFieldFocus(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = PRIMARY
    e.currentTarget.style.boxShadow = `0 0 0 3px ${PRIMARY}33`
  }
  function onFieldBlur(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = FIELD_BORDER
    e.currentTarget.style.boxShadow = 'none'
  }

  if (done) {
    return (
      <aside className="lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
        <div className="rounded-3xl p-8 lg:p-10" style={cardStyle}>
          <span
            className="mb-5 flex h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: PRIMARY, color: ON_PRIMARY }}
          >
            <Check size={18} />
          </span>
          <h2 className="mb-4 text-3xl lg:text-4xl" style={{ ...heading, color: ON_SURFACE }}>
            {t.done_title.replace('{name}', name || '')}
          </h2>
          <p className="text-sm leading-relaxed" style={{ ...body, color: SECONDARY }}>
            {t.done_body}
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-full bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest"
            style={{ ...body, border: `1.5px solid ${FIELD_BORDER}`, color: SECONDARY }}
          >
            {t.write_another}
          </button>
        </div>
      </aside>
    )
  }

  return (
    <aside className="lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
      <form onSubmit={onSubmit} className="rounded-3xl p-8 lg:p-10" style={cardStyle}>
        <h2 className="mb-3 text-3xl lg:text-4xl" style={{ ...heading, color: ON_SURFACE }}>
          {t.form_title}
        </h2>
        <p className="mb-6 text-sm leading-relaxed font-light" style={{ ...body, color: SECONDARY }}>
          {t.form_note}
        </p>

        <div className="space-y-4">
          <div>
            <label
              className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ ...body, color: SECONDARY }}
            >
              {t.name}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              autoComplete="name"
              placeholder={t.name_ph}
              className={field}
              style={fieldStyle()}
              onFocus={onFieldFocus}
              onBlur={onFieldBlur}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ ...body, color: SECONDARY }}
            >
              {t.relation}
            </label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value as GuestbookRelation)}
              className={`${field} cursor-pointer appearance-none`}
              style={fieldStyle()}
              onFocus={onFieldFocus}
              onBlur={onFieldBlur}
            >
              {GUESTBOOK_RELATIONS.map((r) => (
                <option key={r} value={r}>
                  {t[RELATION_LABEL_KEY[r]]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ ...body, color: SECONDARY }}
            >
              {t.message}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder={t.message_ph}
              className={`${field} resize-y leading-relaxed`}
              style={fieldStyle()}
              onFocus={onFieldFocus}
              onBlur={onFieldBlur}
            />
          </div>
        </div>

        {isRecording ? (
          <div
            className="mt-4 flex items-center gap-4 rounded-full py-2.5 pr-5 pl-2.5"
            style={{ backgroundColor: SURFACE_CONTAINER }}
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
              <span
                ref={ring1Ref}
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: '#E03E3E', opacity: 0.35, transition: 'transform 60ms linear, opacity 60ms linear' }}
              />
              <span
                ref={ring2Ref}
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: '#E03E3E', opacity: 0.5, transition: 'transform 60ms linear, opacity 60ms linear' }}
              />
              <button
                type="button"
                onClick={stopRecording}
                className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: '#E03E3E' }}
                aria-label={t.stop}
              >
                <span ref={dotRef} style={{ display: 'flex', transition: 'transform 60ms linear' }}>
                  <Square className="h-3.5 w-3.5 fill-current" />
                </span>
              </button>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="font-mono text-sm font-bold" style={{ ...body, color: ON_SURFACE }}>
                {formatDuration(recordingSeconds)}
              </p>
              <p className="text-[10px] uppercase tracking-wide" style={{ ...body, color: SECONDARY }}>
                {t.recording}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={audioBlob ? discardRecording : startRecording}
              className="flex items-center justify-center gap-2 rounded-full bg-white py-3 text-[10px] font-bold uppercase tracking-widest transition-colors"
              style={{ ...body, border: `1.5px solid ${FIELD_BORDER}`, color: SECONDARY }}
            >
              {audioBlob ? (
                <>
                  <Trash2 className="h-4 w-4" /> {formatDuration(recordingSeconds)}
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" /> {t.record}
                </>
              )}
            </button>
            <label
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white py-3 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-[#FAF6FC]"
              style={{ ...body, border: `1.5px solid ${FIELD_BORDER}`, color: SECONDARY }}
            >
              <Camera className="h-4 w-4" />
              <span className="max-w-[90px] truncate">{photo ? photo.name : t.photo}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  setPhoto(e.target.files?.[0] ?? null)
                  discardRecording()
                }}
              />
            </label>
          </div>
        )}

        {error && (
          <p className="mt-3 text-[13px]" style={{ ...body, color: '#B3261E' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-full py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ ...body, backgroundColor: PRIMARY, color: ON_PRIMARY }}
        >
          {pending ? t.sending : t.send}
        </button>
      </form>
    </aside>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  WishFeed — filter chips + pinned card + masonry wall
// ─────────────────────────────────────────────────────────────────────────────

type Filter = 'all' | 'messages' | 'videos' | 'photos' | 'voice'

/** OpusFesta/OpusPass's standing metadata-pill treatment (brand green), not a
 *  neutral-gray chip — matches how relation/category tags render elsewhere
 *  in the product (e.g. the Orders dashboard). */
function RelationPill({ relation, t }: { relation: GuestbookRelation | null; t: Record<string, string> }) {
  if (!relation) return null
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide"
      style={{ ...body, backgroundColor: '#9FE87040', color: '#3f6b1f' }}
    >
      {t[RELATION_LABEL_KEY[relation]]}
    </span>
  )
}

function Timestamp({ entry, t }: { entry: GuestbookEntry; t: Record<string, string> }) {
  return (
    <p className="mt-3 text-[10px] uppercase tracking-tighter" style={{ ...body, color: `${SECONDARY}80` }}>
      {relativeTime(entry.created_at, t)}
    </p>
  )
}

function VoiceNoteCard({ entry, t }: { entry: GuestbookEntry; t: Record<string, string> }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  function toggle() {
    const el = audioRef.current
    if (!el) return
    if (playing) el.pause()
    else el.play()
  }

  return (
    <div
      className="break-inside-avoid rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
      style={{ border: `1px solid ${OUTLINE_VARIANT}33` }}
    >
      <audio
        ref={audioRef}
        src={entry.audio_url ?? undefined}
        preload="metadata"
        className="hidden"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => {
          const d = e.currentTarget.duration
          setProgress(d ? e.currentTarget.currentTime / d : 0)
        }}
      />
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h4 className="min-w-0 truncate text-[11px] font-bold uppercase tracking-widest" style={body}>
            {entry.guest_name}
          </h4>
          <RelationPill relation={entry.relation} t={t} />
        </div>
        <Mic className="h-4 w-4 shrink-0" style={{ color: PRIMARY, opacity: 0.4 }} />
      </div>
      <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: SURFACE_CONTAINER }}>
        <button
          type="button"
          onClick={toggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: PRIMARY, color: ON_PRIMARY }}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
        </button>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: `${OUTLINE_VARIANT}66` }}>
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: PRIMARY }}
          />
        </div>
        <span className="shrink-0 font-mono text-[10px]" style={{ ...body, color: SECONDARY }}>
          {formatDuration(duration)}
        </span>
      </div>
      {entry.message && (
        <p className="mt-3 text-sm font-light leading-relaxed" style={{ ...body, color: SECONDARY }}>
          {entry.message}
        </p>
      )}
      <Timestamp entry={entry} t={t} />
    </div>
  )
}

function WishCard({ entry, index, t }: { entry: GuestbookEntry; index: number; t: Record<string, string> }) {
  if (entry.audio_url) {
    return <VoiceNoteCard entry={entry} t={t} />
  }

  if (entry.photo_url) {
    return (
      <div
        className="break-inside-avoid group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
        style={{ border: `1px solid ${OUTLINE_VARIANT}33` }}
      >
        <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: SURFACE_CONTAINER }}>
          <Image
            src={entry.photo_url}
            alt=""
            fill
            sizes="(min-width: 768px) 340px, 90vw"
            className="object-cover grayscale-[20%] transition-all duration-700 group-hover:grayscale-0"
          />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="min-w-0 truncate text-[11px] font-bold uppercase tracking-widest" style={body}>
              {entry.guest_name}
            </h4>
            <RelationPill relation={entry.relation} t={t} />
          </div>
          <p className="mt-2 text-sm font-light leading-relaxed" style={{ ...body, color: SECONDARY }}>
            {entry.message}
          </p>
          <Timestamp entry={entry} t={t} />
        </div>
      </div>
    )
  }

  if (index % 2 === 1) {
    return (
      <div
        className="break-inside-avoid rounded-2xl p-8 shadow-sm transition-shadow hover:shadow-md"
        style={{ backgroundColor: `${PRIMARY}0d`, border: `1px solid ${PRIMARY}1a` }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <h4 className="min-w-0 truncate text-[11px] font-bold uppercase tracking-widest" style={{ ...body, color: ON_SURFACE }}>
              {entry.guest_name}
            </h4>
            <RelationPill relation={entry.relation} t={t} />
          </div>
          <span className="shrink-0 text-5xl leading-none opacity-20" style={{ ...heading, color: ON_SURFACE }}>
            &ldquo;
          </span>
        </div>
        <p className="relative z-10 mt-2 text-base leading-relaxed italic opacity-90" style={{ ...heading, color: ON_SURFACE }}>
          {entry.message}
        </p>
        <Timestamp entry={entry} t={t} />
      </div>
    )
  }

  return (
    <div
      className="break-inside-avoid rounded-2xl p-8 shadow-sm transition-shadow hover:shadow-md"
      style={{ backgroundColor: SURFACE_CONTAINER, border: `1px solid ${OUTLINE_VARIANT}4d` }}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="min-w-0 truncate text-[11px] font-bold uppercase tracking-widest" style={body}>
          {entry.guest_name}
        </h4>
        <RelationPill relation={entry.relation} t={t} />
      </div>
      <p className="mt-2 text-sm leading-relaxed font-light italic" style={{ ...body, color: SECONDARY }}>
        {entry.message}
      </p>
      <Timestamp entry={entry} t={t} />
    </div>
  )
}

function WishFeed({ data, t }: { data: PublicGuestbookPage; t: Record<string, string> }) {
  const [filter, setFilter] = useState<Filter>('all')
  const entries = data.entries.filter((e) => {
    switch (filter) {
      case 'all':
        return true
      case 'voice':
        return Boolean(e.audio_url)
      case 'photos':
        return Boolean(e.photo_url)
      case 'videos':
        return false // no video attachments yet — an honest empty result, not a fake one
      case 'messages':
        return !e.audio_url && !e.photo_url
    }
  })

  const chips: { key: Filter; label: string }[] = [
    { key: 'all', label: t.all_wishes },
    { key: 'messages', label: t.filter_messages },
    { key: 'videos', label: t.filter_videos },
    { key: 'photos', label: t.filter_photos },
    { key: 'voice', label: t.voice_notes },
  ]

  return (
    <section className="lg:col-span-7">
      <div className="no-scrollbar mb-4 flex gap-4 overflow-x-auto pt-1 pb-4 lg:mb-6">
        {chips.map((chip) => {
          const active = filter === chip.key
          return (
            <button
              key={chip.key}
              onClick={() => setFilter(chip.key)}
              className="cursor-pointer rounded-full px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-colors"
              style={
                active
                  ? { ...body, backgroundColor: PRIMARY, color: ON_PRIMARY }
                  : { ...body, border: `1px solid ${OUTLINE_VARIANT}`, color: SECONDARY }
              }
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      <div className="space-y-16">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl py-20 text-center" style={{ backgroundColor: SURFACE_CONTAINER }}>
            <p className="text-2xl" style={{ ...heading, color: ON_SURFACE }}>
              {t.empty_title}
            </p>
            <p className="text-sm" style={{ ...body, color: SECONDARY }}>
              {t.empty_body}
            </p>
          </div>
        ) : (
          <div className="columns-1 gap-8 space-y-8 md:columns-2">
            {entries.map((entry, i) => (
              <WishCard key={entry.id} entry={entry} index={i} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Navbar — ported from wedding_website's Navbar.tsx (blurred, brand mark +
//  underline-active tabs); we only have one page, so the couple's name is
//  the brand mark and the language toggle takes the tabs' place. Sits as a
//  normal (non-fixed) flex child above the split view — see the page below.
// ─────────────────────────────────────────────────────────────────────────────

function Navbar({
  coupleName,
  lang,
  onPickLang,
}: {
  coupleName: string
  lang: Lang
  onPickLang: (l: Lang) => void
}) {
  return (
    <nav
      className="w-full shrink-0 border-b"
      style={{ backgroundColor: '#ffffff', borderColor: `${OUTLINE_VARIANT}4d` }}
    >
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-8">
        <span className="text-2xl tracking-tight md:text-3xl" style={{ ...heading, color: ON_SURFACE }}>
          {coupleName}
        </span>
        <div
          className="inline-flex overflow-hidden rounded-full text-[11px] font-bold"
          style={{ border: `1px solid ${OUTLINE_VARIANT}` }}
        >
          {(['en', 'sw'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => onPickLang(l)}
              className="px-3.5 py-1.5 uppercase tracking-wide transition-colors"
              style={
                lang === l
                  ? { ...body, backgroundColor: PRIMARY, color: ON_PRIMARY }
                  : { ...body, color: SECONDARY }
              }
              aria-pressed={lang === l}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────────────────

export default function GuestbookPublicClient({ data }: { data: PublicGuestbookPage }) {
  const [lang, setLang] = useState<Lang>('sw')
  const t = STR[lang]

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_KEY)
    if (saved === 'en' || saved === 'sw') setLang(saved)
  }, [])
  function pickLang(next: Lang) {
    setLang(next)
    window.localStorage.setItem(LANG_KEY, next)
  }

  return (
    <main className="flex min-h-screen flex-col bg-white" style={{ ...body, color: ON_SURFACE }}>
      <Navbar coupleName={data.coupleName} lang={lang} onPickLang={pickLang} />
      {/* One normal scrolling page — mouse wheel / trackpad scrolls anywhere,
          no dedicated pane to hover. The form just stays in view via
          lg:sticky (see WishForm) as you scroll past it. */}
      <div className="mx-auto w-full max-w-[1440px] flex-1 px-8 pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pt-6 lg:pb-8">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
          <WishForm slug={data.slug} t={t} />
          <WishFeed data={data} t={t} />
        </div>
      </div>
      <footer className="w-full shrink-0 border-t py-4 text-center text-[11px]" style={{ ...body, borderColor: `${OUTLINE_VARIANT}4d`, color: SECONDARY, opacity: 0.7 }}>
        {t.powered}
      </footer>
    </main>
  )
}
