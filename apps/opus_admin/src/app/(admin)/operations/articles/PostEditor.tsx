'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  MessageSquare,
  Plus,
  Save,
  Send,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react'
import {
  ADVICE_BLOCK_TYPES,
  ADVICE_IDEAS_SECTION_IDS,
  slugify,
  type AdviceIdeasBlock,
  type AdviceIdeasBodySection,
  type AdviceIdeasSectionId,
  type AdviceIdeasSeedComment,
} from '@/lib/cms/advice-ideas'
import { cn } from '@/lib/utils'
import { Card, Field, FieldGroup, inputCls } from '@/app/(admin)/cms/advice-and-ideas/_ui'
import { resolveMediaUrl } from '@/app/(admin)/cms/advice-and-ideas/_media'
import { useSetPageHeading } from '@/components/PageHeading'
import { HeaderActionsSlot } from '@/components/HeaderPortals'
import { createAdvicePost, updateAdvicePost, uploadAdviceMedia, type PostUpsertInput } from './actions'
import {
  approveAdviceSubmission,
  rejectAdviceSubmission,
  requestAdviceSubmissionCorrections,
  saveContributorSubmission,
  submitContributorSubmission,
  updateAdviceSubmissionAsAdmin,
  uploadContributorMedia,
} from '@/lib/advice-submission-actions'
import {
  statusLabel,
  statusTone,
  type AdviceSubmissionStatus,
} from '@/lib/advice-submissions'

type Props = {
  mode: 'create' | 'edit'
  id?: string
  initial: PostUpsertInput
  workflow?: 'post' | 'contributor-submission' | 'admin-submission'
  submissionStatus?: AdviceSubmissionStatus
  correctionNotes?: string | null
  adminNotes?: string | null
  backHref?: string
  backLabel?: string
}

const CATEGORY_OPTIONS = [
  'Planning Guides',
  'Real Weddings',
  'Themes & Styles',
  'Etiquette & Wording',
  'Bridal Shower Ideas',
  'Honeymoon Ideas',
  'Featured Stories',
]

function toDateInput(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}
function fromDateInput(v: string): string {
  if (!v) return new Date().toISOString()
  const d = new Date(v + 'T00:00:00.000Z')
  return d.toISOString()
}

// Count visible words across every block so the author gets live feedback
// and so we can auto-compute a read-time estimate (avg ~225 wpm).
function countBodyWords(body: PostUpsertInput['body']): number {
  let n = 0
  for (const s of body) {
    if (s.heading) n += s.heading.trim().split(/\s+/).filter(Boolean).length
    if (s.label) n += s.label.trim().split(/\s+/).filter(Boolean).length
    for (const b of s.blocks) {
      if (b.type === 'paragraph' || b.type === 'subheading') {
        n += b.text.trim().split(/\s+/).filter(Boolean).length
      } else if (b.type === 'list') {
        for (const it of b.items) n += it.trim().split(/\s+/).filter(Boolean).length
      } else if (b.type === 'quote') {
        n += b.quote.trim().split(/\s+/).filter(Boolean).length
        if (b.attribution) n += b.attribution.trim().split(/\s+/).filter(Boolean).length
      } else if (b.type === 'tip') {
        n += b.title.trim().split(/\s+/).filter(Boolean).length
        n += b.text.trim().split(/\s+/).filter(Boolean).length
      } else if (b.type === 'image' || b.type === 'video') {
        if (b.caption) n += b.caption.trim().split(/\s+/).filter(Boolean).length
      }
    }
  }
  return n
}

function estimateReadMinutes(words: number): number {
  return Math.max(1, Math.round(words / 225))
}

function formatRelativeTime(then: number, now: number): string {
  const delta = Math.max(0, now - then)
  const s = Math.round(delta / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  return `${h}h ago`
}

// Publish-readiness check — returns human-readable reasons so the UI can
// block publish and tell the author exactly what's missing.
function validateForPublish(draft: PostUpsertInput): string[] {
  const errs: string[] = []
  if (!draft.title.trim()) errs.push('Title is required')
  if (!draft.slug.trim()) errs.push('Slug is required')
  if (!draft.excerpt.trim()) errs.push('Excerpt is required (shown on cards)')
  if (!draft.hero_media_src.trim()) errs.push('Hero media is required')
  if (!draft.hero_media_alt.trim() && draft.hero_media_type === 'image')
    errs.push('Hero image alt text is required')
  if (!draft.author_name.trim()) errs.push('Author name is required')
  if (draft.body.length === 0) errs.push('Add at least one body section')
  return errs
}

const AUTOSAVE_PREFIX = 'opusfesta:advice-post-draft:'
function autosaveKey(mode: 'create' | 'edit', id: string | undefined): string {
  return `${AUTOSAVE_PREFIX}${mode === 'edit' ? (id ?? 'unknown') : 'new'}`
}

export default function PostEditor({
  mode,
  id,
  initial,
  workflow = 'post',
  submissionStatus,
  correctionNotes,
  adminNotes,
  backHref,
  backLabel,
}: Props) {
  const router = useRouter()
  const isContributorSubmission = workflow === 'contributor-submission'
  const isAdminSubmission = workflow === 'admin-submission'
  const isSubmission = workflow !== 'post'
  const showSeedComments = !isContributorSubmission

  // Start from the server `initial` on both server and client so SSR and
  // hydration match. Local-storage recovery happens post-mount in a
  // useEffect below.
  const [draft, setDraft] = useState<PostUpsertInput>(initial)
  const [savedSnapshot, setSavedSnapshot] = useState<PostUpsertInput>(initial)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [nowTick, setNowTick] = useState<number>(() => Date.now())
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [showPublishErrors, setShowPublishErrors] = useState(false)
  const [slugEdited, setSlugEdited] = useState<boolean>(!!initial.slug)
  const [readTimeManual, setReadTimeManual] = useState<boolean>(!!initial.read_time && initial.read_time !== 5)
  const heroInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarDragOver, setAvatarDragOver] = useState(false)

  const set = <K extends keyof PostUpsertInput>(key: K, value: PostUpsertInput[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const onTitleChange = (title: string) => {
    setDraft((d) => ({
      ...d,
      title,
      slug: slugEdited ? d.slug : slugify(title),
    }))
  }
  const onSlugChange = (slug: string) => {
    setSlugEdited(true)
    set('slug', slugify(slug))
  }

  // Word count + auto read-time suggestion
  const wordCount = useMemo(() => countBodyWords(draft.body), [draft.body])
  const suggestedReadTime = useMemo(() => estimateReadMinutes(wordCount), [wordCount])
  useEffect(() => {
    if (readTimeManual) return
    if (draft.read_time !== suggestedReadTime) {
      setDraft((d) => ({ ...d, read_time: suggestedReadTime }))
    }
  }, [suggestedReadTime, readTimeManual, draft.read_time])

  // Dirty tracking — true when the in-memory draft diverges from the last
  // thing we persisted to the server.
  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(savedSnapshot),
    [draft, savedSnapshot]
  )

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  // LocalStorage autosave (debounced) — belt-and-suspenders against lost work
  // on crashes, browser close, or accidental back navigation.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = autosaveKey(mode, id)
    if (!dirty) {
      window.localStorage.removeItem(key)
      return
    }
    const handle = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          key,
          JSON.stringify({ savedAt: Date.now(), draft })
        )
      } catch {
        // Quota exceeded or Safari private mode — fail silent.
      }
    }, 800)
    return () => window.clearTimeout(handle)
  }, [draft, dirty, mode, id])

  // Re-render every 30s so the "Saved X ago" label stays accurate without
  // wasting render cycles per tick.
  useEffect(() => {
    const iv = window.setInterval(() => setNowTick(Date.now()), 30_000)
    return () => window.clearInterval(iv)
  }, [])

  // Post-mount recovery from localStorage — kept out of the useState
  // initializer so SSR and first-client-render agree. If a recent snapshot
  // exists and differs from `initial`, restore it silently. Older-than-7-day
  // snapshots are dropped. Runs exactly once for this mount.
  const recoveredRef = useRef(false)
  useEffect(() => {
    if (recoveredRef.current) return
    recoveredRef.current = true
    try {
      const raw = window.localStorage.getItem(autosaveKey(mode, id))
      if (!raw) return
      const parsed = JSON.parse(raw) as { savedAt: number; draft: PostUpsertInput }
      const weekMs = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - parsed.savedAt > weekMs) {
        window.localStorage.removeItem(autosaveKey(mode, id))
        return
      }
      const recovered: PostUpsertInput = { ...initial, ...parsed.draft }
      if (JSON.stringify(recovered) === JSON.stringify(initial)) return
      setDraft(recovered)
      setMessage('Recovered unsaved changes from your last session.')
    } catch {
      // Ignore — quota, JSON, or storage errors just mean no recovery.
    }
    // Runs once per mount — initial/mode/id are stable for a given route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const publishErrors = useMemo(() => validateForPublish(draft), [draft])
  const canPublish = publishErrors.length === 0
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL ?? ''
  const previewUrl =
    workflow === 'post' && draft.slug
      ? `${websiteUrl}/advice-and-ideas/${draft.slug}`
      : null

  const headingTitle =
    isContributorSubmission
      ? draft.title.trim() || 'Article submission'
      : isAdminSubmission
        ? draft.title.trim() || 'Review submission'
        : mode === 'create'
          ? 'New article'
          : draft.title.trim() || 'Untitled article'
  const headingSubtitle = draft.slug
    ? `/advice-and-ideas/${draft.slug}`
    : mode === 'create'
      ? 'Draft — not yet saved'
      : undefined
  useSetPageHeading({ title: headingTitle, subtitle: headingSubtitle })

  const uploadHero = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    fd.append('slug', draft.slug || 'new')
    if (id) fd.append('submissionId', id)
    startTransition(async () => {
      const { url, type } = isContributorSubmission
        ? await uploadContributorMedia(fd)
        : await uploadAdviceMedia(fd)
      setDraft((d) => ({ ...d, hero_media_src: url, hero_media_type: type }))
      setMessage('Hero media uploaded.')
    })
  }

  const uploadAvatarFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage('Avatar must be an image.')
      return
    }
    const fd = new FormData()
    fd.append('file', file)
    fd.append('slug', draft.slug || 'new')
    if (id) fd.append('submissionId', id)
    startTransition(async () => {
      const { url } = isContributorSubmission
        ? await uploadContributorMedia(fd)
        : await uploadAdviceMedia(fd)
      setDraft((d) => ({ ...d, author_avatar_url: url }))
      setMessage('Avatar uploaded.')
    })
  }
  const onAvatarFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadAvatarFile(file)
    e.target.value = ''
  }
  const onAvatarDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setAvatarDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadAvatarFile(file)
  }

  const persist = useCallback(
    async (payload: PostUpsertInput): Promise<{ id: string } | null> => {
      try {
        if (workflow === 'contributor-submission') {
          if (!id) throw new Error('Missing submission id.')
          await saveContributorSubmission(id, payload)
          setSavedSnapshot(payload)
          setLastSavedAt(Date.now())
          router.refresh()
          return { id }
        }
        if (workflow === 'admin-submission') {
          if (!id) throw new Error('Missing submission id.')
          await updateAdviceSubmissionAsAdmin(id, payload)
          setSavedSnapshot(payload)
          setLastSavedAt(Date.now())
          router.refresh()
          return { id }
        }
        if (mode === 'create') {
          const { id: newId } = await createAdvicePost(payload)
          setSavedSnapshot(payload)
          setLastSavedAt(Date.now())
          // Clear the 'new' autosave slot — the draft now lives under its id.
          try {
            window.localStorage.removeItem(autosaveKey('create', undefined))
          } catch {}
          router.push(`/operations/articles/${newId}`)
          return { id: newId }
        }
        if (!id) return null
        await updateAdvicePost(id, payload)
        setSavedSnapshot(payload)
        setLastSavedAt(Date.now())
        router.refresh()
        return { id }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Something went wrong.')
        return null
      }
    },
    [id, mode, router, workflow]
  )

  // "Save draft" — persists the current editor state without publishing. If
  // the post was previously published it stays published; we only flip that
  // bit through the explicit Publish/Unpublish controls.
  const handleSaveDraft = () =>
    startTransition(async () => {
      const result = await persist(draft)
      if (result) setMessage(draft.published ? 'Saved.' : 'Draft saved.')
    })

  const handlePublish = () => {
    if (publishErrors.length > 0) {
      setShowPublishErrors(true)
      setMessage(
        isContributorSubmission
          ? 'Fix the issues below before submitting.'
          : 'Fix the issues below before publishing.'
      )
      return
    }
    startTransition(async () => {
      if (isContributorSubmission) {
        if (!id) return
        await submitContributorSubmission(id, draft)
        setSavedSnapshot(draft)
        setMessage('Submitted for review.')
        router.push('/contribute/articles')
        return
      }
      const payload = { ...draft, published: true }
      setDraft(payload)
      const result = await persist(payload)
      if (result) setMessage('Published — live on the site.')
      setShowPublishErrors(false)
    })
  }

  const handleUnpublish = () =>
    startTransition(async () => {
      const payload = { ...draft, published: false }
      setDraft(payload)
      const result = await persist(payload)
      if (result) setMessage('Unpublished — the article is now a draft.')
    })

  const handleRequestCorrections = () =>
    startTransition(async () => {
      if (!id) return
      const notes = window.prompt('What should the author correct?')
      if (notes == null) return
      await persist(draft)
      await requestAdviceSubmissionCorrections(id, notes)
      setMessage('Corrections requested.')
      router.refresh()
    })

  const handleRejectSubmission = () =>
    startTransition(async () => {
      if (!id) return
      const notes = window.prompt('Optional rejection note for the record:')
      if (notes == null) return
      await rejectAdviceSubmission(id, notes)
      setMessage('Submission rejected.')
      router.refresh()
    })

  const handleApproveSubmission = (publish: boolean) => {
    if (publishErrors.length > 0) {
      setShowPublishErrors(true)
      setMessage('Fix the issues below before approval.')
      return
    }
    startTransition(async () => {
      if (!id) return
      await persist(draft)
      const result = await approveAdviceSubmission(id, publish)
      setMessage(publish ? 'Published from submission.' : 'Approved as article draft.')
      router.push(`/operations/articles/${result.postId}`)
    })
  }

  const handleRevert = () => {
    if (!dirty) return
    if (!confirm('Discard unsaved changes?')) return
    setDraft(savedSnapshot)
    setMessage('Unsaved changes discarded.')
    try {
      window.localStorage.removeItem(autosaveKey(mode, id))
    } catch {}
  }

  // ---- Body section handlers ----
  const addSection = () => {
    const newSection: AdviceIdeasBodySection = {
      id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: '',
      heading: 'New section',
      blocks: [{ type: 'paragraph', text: '' }],
    }
    setDraft((d) => ({ ...d, body: [...d.body, newSection] }))
  }
  const updateSection = (sid: string, patch: Partial<AdviceIdeasBodySection>) =>
    setDraft((d) => ({
      ...d,
      body: d.body.map((s) => (s.id === sid ? { ...s, ...patch } : s)),
    }))
  const removeSection = (sid: string) =>
    setDraft((d) => ({ ...d, body: d.body.filter((s) => s.id !== sid) }))
  const moveSection = (sid: string, dir: -1 | 1) =>
    setDraft((d) => {
      const idx = d.body.findIndex((s) => s.id === sid)
      const t = idx + dir
      if (idx < 0 || t < 0 || t >= d.body.length) return d
      const next = [...d.body]
      ;[next[idx], next[t]] = [next[t], next[idx]]
      return { ...d, body: next }
    })

  const actionControls = (
    <>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
          dirty
            ? 'bg-amber-50 text-amber-700'
            : isSubmission && submissionStatus
              ? statusTone(submissionStatus)
              : draft.published
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-gray-100 text-gray-600'
        )}
      >
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dirty
              ? 'bg-amber-500'
              : isSubmission && submissionStatus === 'published'
                ? 'bg-[#7E5896]'
                : isSubmission && submissionStatus === 'submitted'
                  ? 'bg-amber-500'
                  : draft.published
                    ? 'bg-emerald-500'
                    : 'bg-gray-400'
          )}
        />
        {dirty
          ? 'Unsaved changes'
          : isSubmission && submissionStatus
            ? statusLabel(submissionStatus)
            : draft.published
              ? 'Published'
              : 'Draft'}
      </span>

      {message ? (
        <span className="max-w-[24ch] truncate text-xs text-gray-500" title={message}>
          {message}
        </span>
      ) : lastSavedAt ? (
        <span className="whitespace-nowrap text-xs text-gray-500" suppressHydrationWarning>
          Saved {formatRelativeTime(lastSavedAt, nowTick)}
        </span>
      ) : null}

      {dirty && mode === 'edit' && (
        <button
          type="button"
          onClick={handleRevert}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Discard
        </button>
      )}

      <button
        type="button"
        disabled={pending || (!dirty && mode === 'edit')}
        onClick={handleSaveDraft}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {isAdminSubmission ? 'Save edits' : draft.published ? 'Save' : 'Save draft'}
      </button>

      {isContributorSubmission ? (
        <button
          type="button"
          disabled={pending}
          onClick={handlePublish}
          className="flex items-center gap-1.5 rounded-lg bg-[#C9A0DC] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b97fd0] disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Submit for review
        </button>
      ) : isAdminSubmission ? (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={handleRequestCorrections}
            className="flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-50 disabled:opacity-50"
          >
            <MessageSquare className="h-4 w-4" />
            Request corrections
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={handleRejectSubmission}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => handleApproveSubmission(false)}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve draft
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => handleApproveSubmission(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#C9A0DC] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b97fd0] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Publish
          </button>
        </>
      ) : draft.published ? (
        <button
          type="button"
          disabled={pending}
          onClick={handleUnpublish}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <EyeOff className="h-4 w-4" />
          Unpublish
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={handlePublish}
          className="flex items-center gap-1.5 rounded-lg bg-[#C9A0DC] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b97fd0] disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Publish
        </button>
      )}
    </>
  )

  return (
    <div className="px-8 pt-8 pb-12">
      {!isContributorSubmission && <HeaderActionsSlot>{actionControls}</HeaderActionsSlot>}

      <div className="max-w-[1200px] mx-auto space-y-6">
        {isContributorSubmission && (
          <div className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center justify-end gap-2 border-b border-gray-100 bg-[#FDFDFD]/95 px-4 py-3 backdrop-blur">
            {actionControls}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <Link
            href={backHref ?? '/operations/articles'}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" /> {backLabel ?? 'All articles'}
          </Link>

          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </a>
          )}
        </div>

        {correctionNotes && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">Correction request</p>
            <p className="mt-1 leading-relaxed">{correctionNotes}</p>
          </div>
        )}

        {adminNotes && isAdminSubmission && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            <p className="font-semibold text-gray-900">Admin notes</p>
            <p className="mt-1 leading-relaxed">{adminNotes}</p>
          </div>
        )}

      {/* Publish readiness panel — only shown once the author has tried to publish */}
      {showPublishErrors && publishErrors.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              A few things to fix before {isContributorSubmission ? 'submitting' : 'publishing'}
            </p>
            <ul className="mt-1 list-disc pl-4 text-sm text-amber-700 space-y-0.5">
              {publishErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Essentials */}
      <Card title="Essentials">
        <Field label="Title">
          <input type="text" value={draft.title} onChange={(e) => onTitleChange(e.target.value)} className={inputCls} />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Slug (URL)">
            <div className="flex items-stretch">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-xs text-gray-500">
                /advice-and-ideas/
              </span>
              <input
                type="text"
                value={draft.slug}
                onChange={(e) => onSlugChange(e.target.value)}
                className={cn(inputCls, 'rounded-l-none')}
                placeholder="post-slug"
              />
            </div>
          </Field>
          <Field label="Category">
            <select
              value={CATEGORY_OPTIONS.includes(draft.category) ? draft.category : ''}
              onChange={(e) => set('category', e.target.value)}
              className={inputCls}
            >
              <option value="" disabled>
                Select a category…
              </option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Section (used to group on index)">
            <select
              value={draft.section_id}
              onChange={(e) => set('section_id', e.target.value as AdviceIdeasSectionId)}
              className={inputCls}
            >
              {ADVICE_IDEAS_SECTION_IDS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Read time (minutes)"
            hint={
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {wordCount} word{wordCount === 1 ? '' : 's'}
                {!readTimeManual ? ' · auto' : ''}
              </span>
            }
          >
            <div className="flex items-stretch gap-2">
              <input
                type="number"
                min={1}
                value={draft.read_time}
                onChange={(e) => {
                  setReadTimeManual(true)
                  set('read_time', parseInt(e.target.value || '1', 10))
                }}
                className={inputCls}
              />
              {readTimeManual && (
                <button
                  type="button"
                  onClick={() => {
                    setReadTimeManual(false)
                    set('read_time', suggestedReadTime)
                  }}
                  className="text-xs font-semibold text-[#7E5896] hover:text-[#5c3f72] px-2 rounded-md border border-[#E7D5EE] hover:bg-[#F8F0FB] whitespace-nowrap"
                  title="Reset to estimated read time based on body word count"
                >
                  Auto
                </button>
              )}
            </div>
          </Field>
        </div>

        <Field label="Excerpt (shown on cards)">
          <textarea value={draft.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={2} className={inputCls} />
        </Field>
        <Field label="Description (SEO + meta)">
          <textarea
            value={draft.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            className={inputCls}
          />
        </Field>
      </Card>

      {/* Author + publication */}
      <Card title="Author & publication">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Author name">
            <input
              type="text"
              value={draft.author_name}
              onChange={(e) => set('author_name', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Author role/title">
            <input
              type="text"
              value={draft.author_role}
              onChange={(e) => set('author_role', e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Author avatar (optional)">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setAvatarDragOver(true)
            }}
            onDragLeave={() => setAvatarDragOver(false)}
            onDrop={onAvatarDrop}
            className={cn(
              'flex items-center gap-4 rounded-xl border-2 border-dashed p-3 transition-colors',
              avatarDragOver
                ? 'border-[#C9A0DC] bg-[#F8F0FB]'
                : 'border-gray-200 bg-gray-50/40 hover:border-gray-300'
            )}
          >
            <div className="w-16 h-16 rounded-full bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {draft.author_avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveMediaUrl(draft.author_avatar_url)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>No image</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700">
                Drag &amp; drop an image here, or{' '}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={pending}
                  className="font-semibold text-[#7E5896] hover:text-[#5c3f72] underline-offset-2 hover:underline disabled:opacity-50"
                >
                  browse
                </button>
                .
              </p>
              <p className="text-xs text-gray-500 mt-0.5">PNG / JPG / WebP — appears in the Author Card.</p>
            </div>
            {draft.author_avatar_url && (
              <button
                type="button"
                onClick={() => set('author_avatar_url', '')}
                disabled={pending}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-white border border-transparent hover:border-gray-200 transition-colors disabled:opacity-50 shrink-0"
              >
                Remove
              </button>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onAvatarFileInput}
            />
          </div>
        </Field>
        {!isContributorSubmission && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
              <Field label="Published date">
                <input
                  type="date"
                  value={toDateInput(draft.published_at)}
                  onChange={(e) => set('published_at', fromDateInput(e.target.value))}
                  className={inputCls}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-gray-700 pb-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(e) => set('featured', e.target.checked)}
                  className="rounded border-gray-300"
                />
                Feature on the homepage
              </label>
            </div>
            <p className="text-xs text-gray-500">
              {isAdminSubmission
                ? 'Approval and publishing are controlled from the review action bar above.'
                : 'Publish status is controlled from the action bar above — use '}
              {!isAdminSubmission && (
                <>
                  <span className="font-semibold text-gray-700">Publish</span> /{' '}
                  <span className="font-semibold text-gray-700">Unpublish</span>.
                </>
              )}
            </p>
          </>
        )}
      </Card>

      {/* Hero media */}
      <Card title="Hero media">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Field label="Media type">
              <select
                value={draft.hero_media_type}
                onChange={(e) => set('hero_media_type', e.target.value as 'image' | 'video')}
                className={inputCls}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </Field>
            <Field label="Media URL">
              <input
                type="text"
                value={draft.hero_media_src}
                onChange={(e) => set('hero_media_src', e.target.value)}
                className={inputCls}
                placeholder="/assets/images/… or https://…"
              />
            </Field>
            <Field label="Alt text">
              <input
                type="text"
                value={draft.hero_media_alt}
                onChange={(e) => set('hero_media_alt', e.target.value)}
                className={inputCls}
              />
            </Field>
            {draft.hero_media_type === 'video' && (
              <Field label="Poster image URL (optional)">
                <input
                  type="text"
                  value={draft.hero_media_poster}
                  onChange={(e) => set('hero_media_poster', e.target.value)}
                  className={inputCls}
                />
              </Field>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => heroInputRef.current?.click()}
                disabled={pending}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                Upload media
              </button>
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={uploadHero}
              />
            </div>
          </div>
          <div>
            <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[16/10]">
              {draft.hero_media_src ? (
                draft.hero_media_type === 'video' ? (
                  <video src={resolveMediaUrl(draft.hero_media_src)} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolveMediaUrl(draft.hero_media_src)} alt="" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  No media set
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Body */}
      <Card
        title={`Body (${draft.body.length} section${draft.body.length === 1 ? '' : 's'})`}
        action={
          <button
            type="button"
            onClick={addSection}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#7E5896] hover:text-[#5c3f72] px-2.5 py-1.5 rounded-md border border-[#E7D5EE] hover:bg-[#F8F0FB] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add section
          </button>
        }
      >
        <div className="space-y-3">
          {draft.body.map((section, idx) => (
            <BodySectionRow
              key={section.id}
              index={idx}
              total={draft.body.length}
              section={section}
              onPatch={(patch) => updateSection(section.id, patch)}
              onRemove={() => removeSection(section.id)}
              onMove={(dir) => moveSection(section.id, dir)}
              uploadWorkflow={workflow}
              submissionId={id}
            />
          ))}
          {draft.body.length === 0 && (
            <div className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg px-4 py-8 text-center">
              No body sections yet — add one above.
            </div>
          )}
        </div>
      </Card>

      {showSeedComments && (
        <Card
          title={`Seed comments (${draft.seed_comments.length})`}
          action={
            <button
              type="button"
              onClick={() =>
                set('seed_comments', [
                  ...draft.seed_comments,
                  { id: `c-${Date.now()}`, name: '', body: '', date: new Date().toISOString().slice(0, 10), likes: 0 },
                ])
              }
              className="flex items-center gap-1.5 text-xs font-semibold text-[#7E5896] hover:text-[#5c3f72] px-2.5 py-1.5 rounded-md border border-[#E7D5EE] hover:bg-[#F8F0FB] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add comment
            </button>
          }
        >
          <p className="text-xs text-gray-500 -mt-2 mb-2">
            Seed-populate the article&apos;s comment thread (shown beneath the Author Card).
          </p>
          <div className="space-y-3">
            {draft.seed_comments.map((c, i) => (
              <SeedCommentRow
                key={c.id}
                index={i}
                total={draft.seed_comments.length}
                comment={c}
                onChange={(patch) =>
                  set(
                    'seed_comments',
                    draft.seed_comments.map((cc, idx) => (idx === i ? { ...cc, ...patch } : cc))
                  )
                }
                onRemove={() =>
                  set('seed_comments', draft.seed_comments.filter((_, idx) => idx !== i))
                }
                onMove={(dir) => {
                  const t = i + dir
                  if (t < 0 || t >= draft.seed_comments.length) return
                  const next = [...draft.seed_comments]
                  ;[next[i], next[t]] = [next[t], next[i]]
                  set('seed_comments', next)
                }}
              />
            ))}
            {draft.seed_comments.length === 0 && (
              <div className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg px-4 py-6 text-center">
                No seed comments yet — add one above.
              </div>
            )}
          </div>
        </Card>
      )}
      </div>
    </div>
  )
}

function SeedCommentRow({
  index,
  total,
  comment,
  onChange,
  onRemove,
  onMove,
}: {
  index: number
  total: number
  comment: AdviceIdeasSeedComment
  onChange: (patch: Partial<AdviceIdeasSeedComment>) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/40">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          Comment {index + 1}
        </span>
        <div className="flex items-center gap-1">
          <IconButton title="Move up" onClick={() => onMove(-1)} disabled={index === 0}>
            <ArrowUp className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton title="Move down" onClick={() => onMove(1)} disabled={index === total - 1}>
            <ArrowDown className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton title="Remove" onClick={onRemove} danger>
            <Trash2 className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_100px] gap-3">
        <Field label="Name">
          <input
            type="text"
            value={comment.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Date">
          <input
            type="text"
            value={comment.date}
            onChange={(e) => onChange({ date: e.target.value })}
            className={inputCls}
            placeholder="e.g. 2026-03-15 or 1 week ago"
          />
        </Field>
        <Field label="Likes">
          <input
            type="number"
            min={0}
            value={comment.likes}
            onChange={(e) => onChange({ likes: parseInt(e.target.value || '0', 10) })}
            className={inputCls}
          />
        </Field>
      </div>
      <div className="mt-2">
        <Field label="Body">
          <textarea
            value={comment.body}
            onChange={(e) => onChange({ body: e.target.value })}
            rows={2}
            className={inputCls}
          />
        </Field>
      </div>
    </div>
  )
}

// ---------- Body section editor ----------

function BodySectionRow({
  index,
  total,
  section,
  onPatch,
  onRemove,
  onMove,
  uploadWorkflow,
  submissionId,
}: {
  index: number
  total: number
  section: AdviceIdeasBodySection
  onPatch: (patch: Partial<AdviceIdeasBodySection>) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
  uploadWorkflow: Props['workflow']
  submissionId?: string
}) {
  const [open, setOpen] = useState(index === 0)

  const addBlock = (type: AdviceIdeasBlock['type']) => {
    let newBlock: AdviceIdeasBlock
    switch (type) {
      case 'paragraph': newBlock = { type: 'paragraph', text: '' }; break
      case 'subheading': newBlock = { type: 'subheading', text: '' }; break
      case 'list': newBlock = { type: 'list', items: [''], ordered: false }; break
      case 'quote': newBlock = { type: 'quote', quote: '', attribution: '' }; break
      case 'tip': newBlock = { type: 'tip', title: '', text: '' }; break
      case 'image': newBlock = { type: 'image', src: '', alt: '', caption: '' }; break
      case 'video': newBlock = { type: 'video', src: '', poster: '', alt: '', caption: '' }; break
      case 'gallery': newBlock = { type: 'gallery', items: [{ src: '', alt: '' }] }; break
    }
    onPatch({ blocks: [...section.blocks, newBlock] })
  }
  const updateBlock = (i: number, patch: Partial<AdviceIdeasBlock>) => {
    const next = section.blocks.map((b, bi) =>
      bi === i ? ({ ...b, ...patch } as AdviceIdeasBlock) : b
    )
    onPatch({ blocks: next })
  }
  const removeBlock = (i: number) =>
    onPatch({ blocks: section.blocks.filter((_, bi) => bi !== i) })
  const moveBlock = (i: number, dir: -1 | 1) => {
    const t = i + dir
    if (t < 0 || t >= section.blocks.length) return
    const next = [...section.blocks]
    ;[next[i], next[t]] = [next[t], next[i]]
    onPatch({ blocks: next })
  }

  return (
    <div className="border border-gray-200 rounded-xl bg-gray-50/40">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-gray-500 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Section {index + 1}</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{section.heading || '(untitled)'}</p>
        </div>
        <IconButton title="Move up" onClick={() => onMove(-1)} disabled={index === 0}>
          <ArrowUp className="w-3.5 h-3.5" />
        </IconButton>
        <IconButton title="Move down" onClick={() => onMove(1)} disabled={index === total - 1}>
          <ArrowDown className="w-3.5 h-3.5" />
        </IconButton>
        <IconButton title="Remove" onClick={onRemove} danger>
          <Trash2 className="w-3.5 h-3.5" />
        </IconButton>
      </div>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3">
            <Field label="Label (optional eyebrow)">
              <input
                type="text"
                value={section.label ?? ''}
                onChange={(e) => onPatch({ label: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Heading">
              <input
                type="text"
                value={section.heading}
                onChange={(e) => onPatch({ heading: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>

          <FieldGroup label={`Content blocks (${section.blocks.length})`}>
            <div className="space-y-3">
              {section.blocks.map((block, bi) => (
                <BlockRow
                  key={bi}
                  index={bi}
                  total={section.blocks.length}
                  block={block}
                  onChange={(patch) => updateBlock(bi, patch)}
                  onRemove={() => removeBlock(bi)}
                  onMove={(dir) => moveBlock(bi, dir)}
                  uploadWorkflow={uploadWorkflow}
                  submissionId={submissionId}
                />
              ))}
              {section.blocks.length === 0 && (
                <p className="text-xs text-gray-400">No blocks — add one below.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {ADVICE_BLOCK_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addBlock(t)}
                  className="text-xs font-semibold text-[#7E5896] hover:text-[#5c3f72] border border-[#E7D5EE] hover:bg-[#F8F0FB] px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> {t}
                </button>
              ))}
            </div>
          </FieldGroup>
        </div>
      )}
    </div>
  )
}

function BlockRow({
  index,
  total,
  block,
  onChange,
  onRemove,
  onMove,
  uploadWorkflow,
  submissionId,
}: {
  index: number
  total: number
  block: AdviceIdeasBlock
  onChange: (patch: Partial<AdviceIdeasBlock>) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
  uploadWorkflow: Props['workflow']
  submissionId?: string
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          #{index + 1} · {block.type}
        </span>
        <div className="flex items-center gap-1">
          <IconButton title="Move up" onClick={() => onMove(-1)} disabled={index === 0}>
            <ArrowUp className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton title="Move down" onClick={() => onMove(1)} disabled={index === total - 1}>
            <ArrowDown className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton title="Remove" onClick={onRemove} danger>
            <Trash2 className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      </div>

      {block.type === 'paragraph' && (
        <textarea
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value } as Partial<AdviceIdeasBlock>)}
          rows={3}
          className={inputCls}
          placeholder="Paragraph text…"
        />
      )}

      {block.type === 'subheading' && (
        <input
          type="text"
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value } as Partial<AdviceIdeasBlock>)}
          className={inputCls}
          placeholder="Subheading text…"
        />
      )}

      {block.type === 'list' && (
        <ListBlockFields block={block} onChange={onChange} />
      )}

      {block.type === 'quote' && (
        <div className="space-y-2">
          <textarea
            value={block.quote}
            onChange={(e) => onChange({ quote: e.target.value } as Partial<AdviceIdeasBlock>)}
            rows={3}
            className={inputCls}
            placeholder="Quote text…"
          />
          <input
            type="text"
            value={block.attribution ?? ''}
            onChange={(e) => onChange({ attribution: e.target.value } as Partial<AdviceIdeasBlock>)}
            className={inputCls}
            placeholder="Attribution (optional)"
          />
        </div>
      )}

      {block.type === 'tip' && (
        <div className="space-y-2">
          <input
            type="text"
            value={block.title}
            onChange={(e) => onChange({ title: e.target.value } as Partial<AdviceIdeasBlock>)}
            className={inputCls}
            placeholder="Tip title (e.g. Editorial takeaway)"
          />
          <textarea
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value } as Partial<AdviceIdeasBlock>)}
            rows={3}
            className={inputCls}
            placeholder="Tip body…"
          />
        </div>
      )}

      {block.type === 'image' && (
        <MediaBlockFields
          block={block}
          onChange={onChange}
          kind="image"
          uploadWorkflow={uploadWorkflow}
          submissionId={submissionId}
        />
      )}

      {block.type === 'video' && (
        <MediaBlockFields
          block={block}
          onChange={onChange}
          kind="video"
          uploadWorkflow={uploadWorkflow}
          submissionId={submissionId}
        />
      )}

      {block.type === 'gallery' && <GalleryBlockFields block={block} onChange={onChange} />}
    </div>
  )
}

function MediaBlockFields({
  block,
  onChange,
  kind,
  uploadWorkflow,
  submissionId,
}: {
  block: Extract<AdviceIdeasBlock, { type: 'image' | 'video' }>
  onChange: (patch: Partial<AdviceIdeasBlock>) => void
  kind: 'image' | 'video'
  uploadWorkflow: Props['workflow']
  submissionId?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    fd.append('slug', 'body')
    if (submissionId) fd.append('submissionId', submissionId)
    try {
      setUploading(true)
      const { url } = uploadWorkflow === 'contributor-submission'
        ? await uploadContributorMedia(fd)
        : await uploadAdviceMedia(fd)
      onChange({ src: url } as Partial<AdviceIdeasBlock>)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-start">
        <input
          type="text"
          value={block.src}
          onChange={(e) => onChange({ src: e.target.value } as Partial<AdviceIdeasBlock>)}
          className={inputCls}
          placeholder={`${kind} URL`}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-xs font-medium text-gray-700 px-2.5 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input ref={fileRef} type="file" accept={`${kind}/*`} hidden onChange={onUpload} />
      </div>
      <input
        type="text"
        value={block.alt}
        onChange={(e) => onChange({ alt: e.target.value } as Partial<AdviceIdeasBlock>)}
        className={inputCls}
        placeholder="Alt text (for accessibility)"
      />
      {kind === 'video' && (
        <input
          type="text"
          value={(block as Extract<AdviceIdeasBlock, { type: 'video' }>).poster ?? ''}
          onChange={(e) => onChange({ poster: e.target.value } as Partial<AdviceIdeasBlock>)}
          className={inputCls}
          placeholder="Poster image URL (optional)"
        />
      )}
      <input
        type="text"
        value={block.caption ?? ''}
        onChange={(e) => onChange({ caption: e.target.value } as Partial<AdviceIdeasBlock>)}
        className={inputCls}
        placeholder="Caption (optional — shown beneath the media)"
      />
      {block.src && (
        <div className="rounded-lg overflow-hidden bg-gray-100 aspect-[16/10]">
          {kind === 'video' ? (
            <video src={resolveMediaUrl(block.src)} className="w-full h-full object-cover" muted />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveMediaUrl(block.src)} alt={block.alt} className="w-full h-full object-cover" />
          )}
        </div>
      )}
    </div>
  )
}

function GalleryBlockFields({
  block,
  onChange,
}: {
  block: Extract<AdviceIdeasBlock, { type: 'gallery' }>
  onChange: (patch: Partial<AdviceIdeasBlock>) => void
}) {
  const update = (i: number, patch: Partial<{ src: string; alt: string }>) =>
    onChange({
      items: block.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    } as Partial<AdviceIdeasBlock>)
  const remove = (i: number) =>
    onChange({ items: block.items.filter((_, idx) => idx !== i) } as Partial<AdviceIdeasBlock>)
  const add = () =>
    onChange({ items: [...block.items, { src: '', alt: '' }] } as Partial<AdviceIdeasBlock>)

  return (
    <div className="space-y-2">
      {block.items.map((item, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-[96px_1fr_1fr_auto] gap-2 items-start">
          <div className="rounded-md bg-gray-100 overflow-hidden aspect-square border border-gray-200">
            {item.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolveMediaUrl(item.src)} alt={item.alt} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                #{i + 1}
              </div>
            )}
          </div>
          <input
            type="text"
            value={item.src}
            onChange={(e) => update(i, { src: e.target.value })}
            className={inputCls}
            placeholder="Image URL"
          />
          <input
            type="text"
            value={item.alt}
            onChange={(e) => update(i, { alt: e.target.value })}
            className={inputCls}
            placeholder="Alt text"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-gray-500 hover:text-red-600 p-2 rounded-md hover:bg-gray-100"
            title="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1 text-xs font-semibold text-[#7E5896] hover:text-[#5c3f72]"
      >
        <Plus className="w-3.5 h-3.5" />
        Add image
      </button>
    </div>
  )
}

function ListBlockFields({
  block,
  onChange,
}: {
  block: Extract<AdviceIdeasBlock, { type: 'list' }>
  onChange: (patch: Partial<AdviceIdeasBlock>) => void
}) {
  const update = (i: number, v: string) =>
    onChange({ items: block.items.map((it, idx) => (idx === i ? v : it)) } as Partial<AdviceIdeasBlock>)
  const remove = (i: number) =>
    onChange({ items: block.items.filter((_, idx) => idx !== i) } as Partial<AdviceIdeasBlock>)
  const add = () => onChange({ items: [...block.items, ''] } as Partial<AdviceIdeasBlock>)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={!!block.ordered}
            onChange={(e) => onChange({ ordered: e.target.checked } as Partial<AdviceIdeasBlock>)}
          />
          Ordered list
        </label>
      </div>
      {block.items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => update(i, e.target.value)}
            className={inputCls}
            placeholder={`Item ${i + 1}`}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-gray-500 hover:text-red-600 p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1 text-xs font-semibold text-[#7E5896] hover:text-[#5c3f72]"
      >
        <Plus className="w-3.5 h-3.5" />
        Add item
      </button>
    </div>
  )
}

function IconButton({
  children,
  title,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent',
        danger
          ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      )}
    >
      {children}
    </button>
  )
}
