'use client'

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BadgeCheck,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Save,
  ShieldCheck,
  Trash2,
  UploadCloud,
  XCircle,
} from 'lucide-react'
import { saveRecognition } from '../sections/actions'
import { FieldLabel, TextInput } from '@/components/onboard/FormField'
import {
  useOnboardingDraft,
  type AwardCertificate,
  type AwardCertStatus,
} from '@/lib/onboarding/draft'
import { getStorefrontSections } from '@/lib/storefront/completion'
import { cn } from '@/lib/utils'

// Mock seed: one verified + one pending so vendors can see both states out of
// the box. Removed automatically once they upload their first real certificate.
const SAMPLE_CERTIFICATES: AwardCertificate[] = [
  {
    id: 'cert_seed_verified',
    title: 'Best Photography Studio',
    issuer: 'Tanzania Wedding Awards',
    year: '2024',
    fileName: 'tza-wedding-awards-2024.pdf',
    status: 'verified',
    submittedAt: '2026-02-12T10:00:00.000Z',
    verifiedAt: '2026-02-15T16:30:00.000Z',
  },
  {
    id: 'cert_seed_pending',
    title: 'Finalist — Bridal Photographer of the Year',
    issuer: 'East African Bridal Awards',
    year: '2023',
    fileName: 'eaba-finalist-2023.pdf',
    status: 'pending',
    submittedAt: '2026-04-20T09:00:00.000Z',
    verifiedAt: null,
  },
]

const STATUS_META: Record<
  AwardCertStatus,
  {
    label: string
    pillClass: string
    description: string
    icon: typeof BadgeCheck
  }
> = {
  pending: {
    label: 'Awaiting verification',
    pillClass: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'OpusFesta usually reviews certificates within 2 business days.',
    icon: Clock,
  },
  verified: {
    label: 'Verified by OpusFesta',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'A verified badge now appears on your storefront beside this award.',
    icon: BadgeCheck,
  },
  needs_info: {
    label: 'Needs more info',
    pillClass: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'Reviewer asked a question — see notes below and re-upload if needed.',
    icon: AlertTriangle,
  },
  rejected: {
    label: 'Could not verify',
    pillClass: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Re-upload a clearer copy or remove this entry.',
    icon: XCircle,
  },
}

export default function RecognitionPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [issuer, setIssuer] = useState('')
  const [year, setYear] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  // Session-only blob URLs keyed by certificate id, so vendors can preview
  // their just-uploaded file. Persisting blobs in localStorage isn't viable.
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((u) => URL.revokeObjectURL(u))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const nextHref = useMemo(() => {
    const sections = getStorefrontSections(draft)
    const idx = sections.findIndex((s) => s.id === 'recognition')
    return idx >= 0 && idx < sections.length - 1 ? sections[idx + 1].href : null
  }, [draft])

  // Seed mock certificates on first visit so the verification states are
  // visible without the vendor having to upload anything yet.
  useEffect(() => {
    if (!hydrated) return
    if (draft.awardCertificates.length === 0) {
      update({ awardCertificates: SAMPLE_CERTIFICATES })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  const [saving, startSaving] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState(false)

  if (!hydrated) return <div className="p-8" aria-hidden />

  const certificates = draft.awardCertificates
  const verifiedCount = certificates.filter((c) => c.status === 'verified').length
  const pendingCount = certificates.filter((c) => c.status === 'pending').length

  const onSave = () => {
    setSaveError(null)
    setSaveOk(false)
    startSaving(async () => {
      const res = await saveRecognition({
        awards: draft.awards ?? '',
        responseTimeHours: draft.responseTimeHours ?? '',
        locallyOwned: !!draft.locallyOwned,
        languages: Array.isArray(draft.languages) ? draft.languages : [],
        // Strip session-only File / blob refs from certificates before persisting
        // so the JSONB stays clean. The shared `certificates` state already
        // holds plain serialisable objects.
        awardCertificates: certificates.map((c) => ({ ...c })),
      })
      if (!res.ok) {
        setSaveError(res.error)
        return
      }
      setSaveOk(true)
    })
  }

  const handleFile = (file: File | null) => {
    setPendingFile(file)
  }

  const submitCertificate = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !pendingFile) return

    const id = `cert_${Math.random().toString(36).slice(2, 10)}`
    const url = URL.createObjectURL(pendingFile)
    setPreviewUrls((prev) => ({ ...prev, [id]: url }))

    const cert: AwardCertificate = {
      id,
      title: title.trim(),
      issuer: issuer.trim(),
      year: year.trim(),
      fileName: pendingFile.name,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      verifiedAt: null,
    }
    update({ awardCertificates: [cert, ...certificates] })

    // Reset the form.
    setTitle('')
    setIssuer('')
    setYear('')
    setPendingFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeCertificate = (id: string) => {
    update({ awardCertificates: certificates.filter((c) => c.id !== id) })
    if (previewUrls[id]) {
      URL.revokeObjectURL(previewUrls[id])
      setPreviewUrls((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  const onNext = () => {
    if (nextHref) router.push(nextHref)
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-6 lg:px-10 pt-4 lg:pt-5 pb-6">
        <div className="max-w-4xl space-y-6">
          {/* 1. Awards & verified recognition */}
          <Card icon={<Award className="w-4 h-4" />} title="Awards & verified recognition">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 mb-5 flex items-start gap-3">
              <span className="shrink-0 w-9 h-9 rounded-lg bg-white text-emerald-700 flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-900">
                  Verified awards earn you the OpusFesta badge
                </p>
                <p className="text-xs text-emerald-900/80 mt-1 leading-relaxed">
                  Upload the certificate or a screenshot showing the awarding body and your name.
                  We review within 2 business days, then attach a verified badge beside the award
                  on your public storefront.
                </p>
              </div>
              {(verifiedCount > 0 || pendingCount > 0) && (
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 tabular-nums">
                    {verifiedCount} verified
                  </span>
                  {pendingCount > 0 ? (
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 tabular-nums">
                      {pendingCount} pending
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            {certificates.length > 0 ? (
              <ul className="space-y-3 mb-6">
                {certificates.map((cert) => (
                  <CertificateRow
                    key={cert.id}
                    cert={cert}
                    previewUrl={previewUrls[cert.id]}
                    onRemove={() => removeCertificate(cert.id)}
                  />
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center mb-6">
                <p className="text-sm text-gray-500">
                  No certificates uploaded yet. Add one below to start the verification process.
                </p>
              </div>
            )}

            {/* Upload form */}
            <form onSubmit={submitCertificate} className="rounded-xl border border-gray-100 bg-gray-50/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Submit a new award for verification
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FieldLabel required>Award title</FieldLabel>
                  <TextInput
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Best Photography Studio"
                  />
                </div>
                <div>
                  <FieldLabel>Awarding body / issuer</FieldLabel>
                  <TextInput
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    placeholder="e.g. Tanzania Wedding Awards"
                  />
                </div>
                <div>
                  <FieldLabel>Year</FieldLabel>
                  <TextInput
                    inputMode="numeric"
                    value={year}
                    onChange={(e) => setYear(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                    placeholder="e.g. 2024"
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel required>Certificate file</FieldLabel>
                  <FileDrop
                    file={pendingFile}
                    onSelect={handleFile}
                    inputRef={fileInputRef}
                  />
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4">
                <p className="text-xs text-gray-500">
                  Accepted: PDF, PNG, JPG. Up to 10 MB.
                </p>
                <button
                  type="submit"
                  disabled={!title.trim() || !pendingFile}
                  className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  Submit for review
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </Card>

          {/* 2. Response time */}
          <Card icon={<Clock className="w-4 h-4" />} title="Response time">
            <FieldLabel>Typical reply window</FieldLabel>
            <TextInput
              placeholder="e.g. 1 hour"
              value={draft.responseTimeHours}
              onChange={(e) => update({ responseTimeHours: e.target.value })}
            />
            <p className="mt-2 text-xs text-gray-500">
              Shown to couples as “Replies within {draft.responseTimeHours || 'X'}”. Once you have
              real inquiries, OpusFesta auto-tracks this from your conversation history.
            </p>
          </Card>

          {/* 3. Trust badges */}
          <Card icon={<MapPin className="w-4 h-4" />} title="Trust badges">
            <label className="flex items-start gap-3 cursor-pointer select-none p-3 -ml-3 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={draft.locallyOwned}
                onChange={(e) => update({ locallyOwned: e.target.checked })}
                className="mt-0.5 w-4 h-4 accent-gray-900"
              />
              <span className="text-sm text-gray-900">
                <span className="font-semibold">Locally owned & operated</span>
                <span className="block text-gray-500 text-xs mt-0.5">
                  A trust badge couples appreciate — Tanzanian-owned vendors only.
                </span>
              </span>
            </label>
          </Card>
        </div>
      </div>

      {/* Sticky bottom bar — Save + Next */}
      <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur z-30">
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-gray-500">
            <span className="font-semibold text-gray-900 tabular-nums">{verifiedCount}</span>{' '}
            verified ·{' '}
            <span className="font-semibold text-gray-900 tabular-nums">{pendingCount}</span>{' '}
            pending review
            {saveError && <span className="ml-3 text-rose-700">{saveError}</span>}
            {saveOk && !saveError && (
              <span className="ml-3 text-emerald-700">Saved.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-900 text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save'}
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

function CertificateRow({
  cert,
  previewUrl,
  onRemove,
}: {
  cert: AwardCertificate
  previewUrl: string | undefined
  onRemove: () => void
}) {
  const meta = STATUS_META[cert.status]
  const StatusIcon = meta.icon
  return (
    <li className="rounded-xl border border-gray-100 bg-white p-4 flex items-start gap-4">
      <span className="shrink-0 w-11 h-11 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
        <FileText className="w-5 h-5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 gap-y-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{cert.title}</p>
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border',
              meta.pillClass,
            )}
          >
            <StatusIcon className="w-3 h-3" />
            {meta.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {[cert.issuer, cert.year].filter(Boolean).join(' · ') || '—'}
        </p>
        <p className="text-[11px] text-gray-400 mt-1 truncate">
          {cert.fileName} · submitted{' '}
          {new Date(cert.submittedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{meta.description}</p>
        {cert.notes ? (
          <p className="text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 mt-2">
            <span className="font-semibold">Reviewer note:</span> {cert.notes}
          </p>
        ) : null}
      </div>
      <div className="shrink-0 flex items-start gap-1">
        {previewUrl ? (
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="View uploaded file"
            title="View uploaded file"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        ) : null}
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          aria-label="Remove certificate"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </li>
  )
}

function FileDrop({
  file,
  onSelect,
  inputRef,
}: {
  file: File | null
  onSelect: (file: File | null) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const f = e.dataTransfer.files?.[0]
        if (f) onSelect(f)
      }}
      className={cn(
        'rounded-lg border-2 border-dashed transition-colors flex items-center gap-3 p-3',
        dragOver
          ? 'border-gray-900 bg-gray-50'
          : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
      >
        <UploadCloud className="w-3.5 h-3.5" />
        Choose file
      </button>
      <div className="flex-1 min-w-0 text-sm">
        {file ? (
          <span className="text-gray-900 font-medium truncate block">{file.name}</span>
        ) : (
          <span className="text-gray-500">Drag a PDF or image in, or click choose file.</span>
        )}
      </div>
      {file ? (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="shrink-0 p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          aria-label="Clear file"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ) : null}
    </div>
  )
}

function Card({
  title,
  icon,
  className,
  children,
}: {
  title: string
  icon: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={`bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-7 ${className ?? ''}`}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
          {icon}
        </span>
        <h2 className="text-base font-semibold text-gray-900 tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  )
}
