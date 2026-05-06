'use client'

import { type ReactNode, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import {
  AlertCircle,
  Check,
  ClipboardCheck,
  Clock,
  FileSignature,
  FileText,
  LogOut,
  type LucideIcon,
  PenLine,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { cn } from '@/lib/utils'
import {
  signVendorAgreement,
  uploadVerificationDocument,
  type VerifyDocType,
} from './actions'
import { SignaturePad } from './SignaturePad'

export type VerifyDocSlot = {
  docType: VerifyDocType
  altDocType?: VerifyDocType
  title: string
  description: string
  required: boolean
  currentDoc:
    | {
        status: 'pending_review' | 'approved' | 'rejected'
        filename: string | null
        uploadedAt: string
        rejectionReason?: string | null
        uploadedAs?: VerifyDocType
      }
    | null
}

/**
 * Defaults used to pre-fill the page-3 identification block on the Mkataba
 * sign form. Pulled from the vendor's onboarding answers so the vendor only
 * has to type fields we don't already have on file (TIN, primarily).
 */
export type AgreementBusinessDefaults = {
  businessName: string
  tin: string
  businessAddress: string
  contactPerson: string
  email: string
  phone: string
  serviceType: string
}

type Props = {
  status: 'verification_pending' | 'needs_corrections'
  slots: VerifyDocSlot[]
  agreement: {
    version: string
    signedAt: string
  } | null
  /** Plain-text body of the agreement (from vendor-agreement.md). Used as a
   *  download/copy fallback when the PDF viewer isn't available, e.g. on
   *  iOS Safari. */
  agreementBody: string
  /** Public URL of the canonical PDF — rendered inline via the browser's
   *  native PDF viewer for pixel-perfect fidelity with the legal source. */
  agreementPdfUrl: string
  /** Stable version identifier persisted with each signature. */
  agreementVersion: string
  /** Pre-filled values for the page-3 identification block on the Mkataba
   *  sign form (business name, TIN, address, contact, etc.). */
  agreementBusinessDefaults: AgreementBusinessDefaults
}

type StepMode = 'done' | 'active' | 'locked'

/**
 * A doc slot is considered "done" when there's a latest upload that hasn't
 * been rejected. Pending-review and approved both count — the vendor has
 * done their part; admin review is downstream.
 */
function isSlotDone(slot: VerifyDocSlot): boolean {
  return !!slot.currentDoc && slot.currentDoc.status !== 'rejected'
}

export default function VerifyClient({
  status,
  slots,
  agreement,
  agreementBody,
  agreementPdfUrl,
  agreementVersion,
  agreementBusinessDefaults,
}: Props) {
  const isCorrection = status === 'needs_corrections'

  // Progressive disclosure: only ONE verification step is active at a time.
  // Earlier steps collapse to a compact "done" row; later steps render as a
  // compact "locked" row until their gate opens. This keeps the page focused
  // on the next concrete action instead of a wall of three forms.
  const tinSlot = slots[0]
  const licenseSlot = slots[1]
  const tinDone = isSlotDone(tinSlot)
  const licenseDone = isSlotDone(licenseSlot)
  const agreementSigned = !!agreement

  const tinMode: StepMode = tinDone ? 'done' : 'active'
  const licenseMode: StepMode = !tinDone
    ? 'locked'
    : licenseDone
      ? 'done'
      : 'active'
  const agreementMode: StepMode =
    !tinDone || !licenseDone
      ? 'locked'
      : agreementSigned
        ? 'done'
        : 'active'

  const completedSteps =
    (tinDone ? 1 : 0) + (licenseDone ? 1 : 0) + (agreementSigned ? 1 : 0)
  const totalSteps = 3

  // Build the visual timeline rendered above the active form. We model 5
  // steps total — Application (always done), TIN, License, Agreement, Under
  // review — to mirror /pending end-to-end. The status pill copy bends to
  // the actual artifact state: a doc that's pending review reads as
  // "Awaiting review" (amber), a rejected doc as "Needs fix" (rose), an
  // agreement that's signed as "Signed" (emerald), and so on.
  type JourneyStep = {
    icon: LucideIcon
    title: string
    description: string
    mode: StepMode
    /** Pill text for done/active. Tone is auto for done; explicit for active. */
    doneLabel?: string
    activeLabel?: string
    activeTone?: 'purple' | 'amber' | 'rose'
    /** Inline action UI rendered below the description when the step is the
     *  active one. Keeps the vendor's focus on the timeline; no separate
     *  duplicated card below. */
    action?: ReactNode
  }

  const tinDocStatus = tinSlot.currentDoc?.status
  const licenseDocStatus = licenseSlot.currentDoc?.status

  const journey: JourneyStep[] = [
    {
      icon: ClipboardCheck,
      title: 'Application',
      description:
        'Business profile, services, packages, and portfolio captured during onboarding.',
      mode: 'done',
      doneLabel: 'Submitted',
    },
    {
      icon: FileText,
      title: 'TIN certificate',
      mode: tinMode,
      description:
        tinMode === 'done'
          ? tinDocStatus === 'approved'
            ? 'Approved by OpusFesta admin.'
            : `Uploaded ${tinSlot.currentDoc ? formatRelative(tinSlot.currentDoc.uploadedAt) : 'recently'}. Awaiting admin review.`
          : 'Upload your TRA TIN certificate.',
      doneLabel:
        tinDocStatus === 'approved' ? 'Approved' : 'Awaiting review',
      activeLabel:
        tinDocStatus === 'rejected' ? 'Needs fix' : 'In progress',
      activeTone: tinDocStatus === 'rejected' ? 'rose' : 'purple',
      action:
        tinMode === 'active' ? (
          <DocumentUploadActions slot={tinSlot} isCorrection={isCorrection} />
        ) : undefined,
    },
    {
      icon: FileText,
      title: 'Business license',
      mode: licenseMode,
      description:
        licenseMode === 'done'
          ? licenseDocStatus === 'approved'
            ? 'Approved by OpusFesta admin.'
            : `Uploaded ${licenseSlot.currentDoc ? formatRelative(licenseSlot.currentDoc.uploadedAt) : 'recently'}. Awaiting admin review.`
          : licenseMode === 'active'
            ? 'Upload your BRELA registration, council license, or sole-proprietor declaration.'
            : 'Unlocks once your TIN certificate is uploaded.',
      doneLabel:
        licenseDocStatus === 'approved' ? 'Approved' : 'Awaiting review',
      activeLabel:
        licenseDocStatus === 'rejected' ? 'Needs fix' : 'In progress',
      activeTone: licenseDocStatus === 'rejected' ? 'rose' : 'purple',
      action:
        licenseMode === 'active' ? (
          <DocumentUploadActions
            slot={licenseSlot}
            isCorrection={isCorrection}
          />
        ) : undefined,
    },
    {
      icon: FileSignature,
      title: 'Vendor agreement',
      mode: agreementMode,
      description:
        agreementMode === 'done'
          ? agreement?.signedAt
            ? `Signed ${formatRelative(agreement.signedAt)}. Separate from the Vendor Vows you accepted during onboarding.`
            : 'Signed.'
          : agreementMode === 'active'
            ? 'Read and e-sign the OpusFesta Mkataba wa Watoa Huduma. This is the legally binding agreement, separate from the Vendor Vows pledge.'
            : 'Unlocks once both business documents are uploaded.',
      doneLabel: 'Signed',
      activeLabel: 'In progress',
      activeTone: 'purple',
      action:
        agreementMode === 'active' ? (
          <AgreementSignActions
            agreementPdfUrl={agreementPdfUrl}
            agreementVersion={agreementVersion}
            businessDefaults={agreementBusinessDefaults}
          />
        ) : undefined,
    },
    {
      icon: ShieldCheck,
      title: 'Under review',
      mode: 'locked',
      description:
        'Once the steps above are complete, our team verifies your details and approves your storefront. Usually 2 to 3 business days.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF7FC] via-[#FDFDFD] to-[#FDFDFD] flex flex-col">
      <header className="px-6 sm:px-10 py-5 border-b border-gray-100/80 bg-white/70 backdrop-blur flex items-center justify-between">
        <Link href="/" aria-label="OpusFesta home" className="block">
          <Logo className="h-7 w-auto" />
        </Link>
        {/* Status button removed — /verify already shows the full timeline,
            so a link back to /pending led nowhere new. The vendor's progress
            persists in the DB; signing out and returning later resumes
            exactly here. */}
        <SignOutButton redirectUrl="/sign-in">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </SignOutButton>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-10 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            {/* Hero pill is reserved for the `needs_corrections` variant —
                that's a different signal (admin bounced something back) and
                worth flagging. The default "verification needed" pill was
                redundant with the headline + the timeline below, so it's
                gone. */}
            {isCorrection && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] px-3 py-1.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200">
                <AlertCircle className="w-3 h-3" />
                Action required
              </span>
            )}
            <h1
              className={cn(
                'text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight leading-[1.1]',
                isCorrection ? 'mt-5' : '',
              )}
            >
              {isCorrection
                ? 'Re-upload the documents we flagged'
                : 'Verify your business'}
            </h1>
            <p className="mt-4 text-base text-gray-600 leading-relaxed max-w-xl mx-auto">
              {isCorrection
                ? 'Pick up the flagged item below and re-submit. Re-reviews are typically completed within 1 business day.'
                : "Three steps to admin review. Most vendors hear back within 2 to 3 business days once they've finished."}
            </p>
            {/* Compact affordance for editing the application details. Replaces
                the verbose "Already on file" panel that used to sit at the
                bottom — the timeline already shows the application as
                Submitted, so the only action that needed surfacing was the
                edit link itself. */}
            <p className="mt-2 text-xs text-gray-500">
              Need to update your business details?{' '}
              <Link
                href="/onboard/review"
                className="font-semibold text-gray-700 hover:text-gray-900 underline underline-offset-2"
              >
                Edit application
              </Link>
            </p>
          </div>

          {/* Verification journey — same compact timeline visual as the
              status page (/pending). Pure information: chip + title +
              description + tone-coded status pill, connected by a vertical
              line. The actionable card for the *active* step renders below
              the timeline so the vendor sees the whole journey at a glance
              and the next concrete action right after. */}
          <section className="mt-10 sm:mt-12 bg-white rounded-3xl border border-gray-100 shadow-[0_2px_24px_-8px_rgba(98,52,128,0.08)] p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-3 mb-6">
              <h2 className="text-base font-semibold text-gray-900">
                Your verification journey
              </h2>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {completedSteps + 1}/{totalSteps + 2} complete
              </span>
            </div>

            <ol className="relative" aria-label="Verification progress">
              {journey.map((step, idx) => {
                const isLast = idx === journey.length - 1
                const nextMode = journey[idx + 1]?.mode
                const connectorIsDone = step.mode === 'done'
                return (
                  <li
                    key={step.title}
                    className={cn(
                      'relative grid grid-cols-[36px_1fr] gap-4',
                      !isLast && 'pb-7',
                    )}
                  >
                    {!isLast && (
                      <span
                        className={cn(
                          'absolute left-[17px] top-9 bottom-0 w-px',
                          connectorIsDone
                            ? 'bg-emerald-300'
                            : nextMode === 'active'
                              ? 'bg-gray-300'
                              : 'bg-gray-200',
                        )}
                        aria-hidden
                      />
                    )}

                    <span
                      className={cn(
                        'relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                        step.mode === 'done' && 'bg-emerald-500 text-white',
                        step.mode === 'active' &&
                          (step.activeTone === 'amber'
                            ? 'bg-amber-500 text-white'
                            : step.activeTone === 'rose'
                              ? 'bg-rose-500 text-white'
                              : 'bg-[#7E5896] text-white'),
                        step.mode === 'locked' &&
                          'bg-white border border-gray-200 text-gray-300',
                      )}
                      aria-hidden
                    >
                      {step.mode === 'done' ? (
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                      ) : (
                        <step.icon
                          className="w-4 h-4"
                          strokeWidth={step.mode === 'active' ? 2 : 1.75}
                        />
                      )}
                    </span>

                    <div className="pt-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={cn(
                            'text-sm font-semibold',
                            step.mode === 'locked' && 'text-gray-400',
                            step.mode === 'active' &&
                              (step.activeTone === 'amber'
                                ? 'text-amber-800'
                                : step.activeTone === 'rose'
                                  ? 'text-rose-700'
                                  : 'text-[#7E5896]'),
                            step.mode === 'done' && 'text-gray-900',
                          )}
                        >
                          {step.title}
                        </h3>
                        {step.mode === 'done' && (
                          <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-emerald-700">
                            {step.doneLabel ?? 'Done'}
                          </span>
                        )}
                        {step.mode === 'active' && (
                          <span
                            className={cn(
                              'inline-flex items-center text-[10px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded',
                              step.activeTone === 'amber'
                                ? 'bg-amber-500 text-white'
                                : step.activeTone === 'rose'
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-[#7E5896] text-white',
                            )}
                          >
                            {step.activeLabel ?? 'In progress'}
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          'mt-1 text-sm leading-relaxed',
                          step.mode === 'locked'
                            ? 'text-gray-400'
                            : 'text-gray-600',
                        )}
                      >
                        {step.description}
                      </p>

                      {/* Inline action UI for the active step — sits below
                          the description, anchored to the same content
                          column as the timeline copy. No separate card, no
                          repeated title, no redundant chip. */}
                      {step.mode === 'active' && step.action && step.action}
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>

          <footer className="mt-12 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
            Need help?{' '}
            <a
              href="mailto:vendors@opusfesta.com"
              className="font-semibold text-gray-700 hover:text-gray-900 underline underline-offset-2"
            >
              vendors@opusfesta.com
            </a>
          </footer>
        </div>
      </main>
    </div>
  )
}

/**
 * Action-only renderer for an active document-upload step. The timeline row
 * already provides the title, description, and status pill — this component
 * just renders the alt-doc toggle, file metadata, error state, and the
 * upload/replace button. Designed to sit inline below the description in
 * the active step's timeline row.
 */
function DocumentUploadActions({
  slot,
  isCorrection,
}: {
  slot: VerifyDocSlot
  isCorrection: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showAltToggle, setShowAltToggle] = useState(
    slot.altDocType
      ? slot.currentDoc?.uploadedAs === slot.altDocType
      : false,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const current = slot.currentDoc

  const activeDocType =
    showAltToggle && slot.altDocType ? slot.altDocType : slot.docType

  const onPick = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  const onFileChosen = (file: File) => {
    setError(null)
    const formData = new FormData()
    formData.append('docType', activeDocType)
    formData.append('file', file)
    startTransition(async () => {
      const res = await uploadVerificationDocument(formData)
      if (!res.ok) {
        setError(res.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="mt-4 space-y-3">
      {slot.altDocType && !current && (
        <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setShowAltToggle(false)}
            aria-pressed={!showAltToggle}
            className={cn(
              'text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors',
              !showAltToggle
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            )}
          >
            Business license
          </button>
          <button
            type="button"
            onClick={() => setShowAltToggle(true)}
            aria-pressed={showAltToggle}
            className={cn(
              'text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors',
              showAltToggle
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            )}
          >
            Sole-proprietor declaration
          </button>
        </div>
      )}

      {current && (
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-gray-700">
            {current.filename ?? 'Uploaded file'}
          </span>{' '}
          · uploaded {formatRelative(current.uploadedAt)}
        </p>
      )}

      {current?.status === 'rejected' && current.rejectionReason && (
        <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-800 leading-relaxed">
            <span className="font-semibold">Admin notes:</span>{' '}
            {current.rejectionReason}
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-800 leading-relaxed">{error}</p>
        </div>
      )}

      <div className="flex items-center flex-wrap gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFileChosen(f)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={onPick}
          disabled={pending}
          className={cn(
            'inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-colors',
            current
              ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              : 'bg-gray-900 hover:bg-gray-800 text-white',
            pending && 'opacity-60 cursor-wait',
          )}
        >
          {pending ? (
            <>
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              Uploading…
            </>
          ) : current ? (
            <>
              <Upload className="w-3.5 h-3.5" />
              Replace file
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              Upload {isCorrection ? 'corrected ' : ''}document
            </>
          )}
        </button>
        <span className="text-[11px] text-gray-400">
          JPG · PNG · WEBP · PDF · up to 10MB
        </span>
      </div>
    </div>
  )
}

/**
 * Action-only renderer for the active vendor-agreement step. The timeline
 * row above provides the title + status pill + description; this just
 * renders the read-the-PDF + ack + name + signature pad + submit form.
 */
function AgreementSignActions({
  agreementPdfUrl,
  agreementVersion,
  businessDefaults,
}: {
  agreementPdfUrl: string
  agreementVersion: string
  businessDefaults: AgreementBusinessDefaults
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)
  const [name, setName] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  // PNG data URL of the drawn signature, or null if the vendor hasn't drawn
  // anything (drawing is optional — the typed legal name is the binding
  // record per the agreement; the drawn glyph is supplementary visual proof).
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)

  // Page-3 identification block of the Mkataba. Pre-filled from onboarding
  // answers so the vendor only has to type the genuinely new fields (TIN
  // primarily). All fields are required to match the printed form.
  const [businessName, setBusinessName] = useState(
    businessDefaults.businessName,
  )
  const [tin, setTin] = useState(businessDefaults.tin)
  const [businessAddress, setBusinessAddress] = useState(
    businessDefaults.businessAddress,
  )
  const [contactPerson, setContactPerson] = useState(
    businessDefaults.contactPerson,
  )
  const [email, setEmail] = useState(businessDefaults.email)
  const [phone, setPhone] = useState(businessDefaults.phone)
  const [serviceType, setServiceType] = useState(businessDefaults.serviceType)

  const onSubmit = () => {
    setError(null)
    if (!acknowledged) {
      setError('Tick the acknowledgement box before signing.')
      return
    }
    if (name.trim().length < 2) {
      setError('Type your full legal name to sign.')
      return
    }
    const fields: [string, string, string][] = [
      ['Jina la Biashara', 'business name', businessName],
      ['TIN', 'TIN', tin],
      ['Anwani ya Biashara', 'business address', businessAddress],
      ['Mtu wa mawasiliano', 'contact person', contactPerson],
      ['Barua Pepe', 'email', email],
      ['WhatsApp/Simu', 'phone', phone],
      ['Aina ya Huduma', 'service type', serviceType],
    ]
    for (const [sw, en, value] of fields) {
      if (!value.trim()) {
        setError(`Fill in ${sw} (${en}) before signing.`)
        return
      }
    }
    const formData = new FormData()
    formData.append('signedName', name.trim())
    formData.append('acknowledged', 'true')
    formData.append('businessName', businessName.trim())
    formData.append('tin', tin.trim())
    formData.append('businessAddress', businessAddress.trim())
    formData.append('contactPerson', contactPerson.trim())
    formData.append('email', email.trim())
    formData.append('phone', phone.trim())
    formData.append('serviceType', serviceType.trim())
    if (signatureDataUrl) {
      formData.append('signatureImage', signatureDataUrl)
    }
    startTransition(async () => {
      const res = await signVendorAgreement(formData)
      if (!res.ok) {
        setError(res.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setExpanded((s) => !s)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#7E5896] hover:text-[#5e3f72]"
        >
          {expanded ? 'Hide agreement' : 'Read the agreement'}
        </button>
        <span className="text-gray-300">·</span>
        <a
          href={agreementPdfUrl}
          download="OpusFesta_Mkataba_Watoa_Huduma.pdf"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900"
        >
          Download PDF
        </a>
      </div>

      {expanded && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/70 overflow-hidden">
          {/* Native PDF viewer renders the canonical Mkataba exactly as it
              appears in the source document. Browsers that can't display the
              PDF inline (mostly older mobile Safari) get the download CTA. */}
          <object
            data={`${agreementPdfUrl}#view=FitH`}
            type="application/pdf"
            aria-label="OpusFesta vendor agreement (Mkataba wa Watoa Huduma)"
            className="w-full h-[640px]"
          >
            <div className="p-6 text-center text-xs text-gray-600 leading-relaxed">
              Your browser can&rsquo;t display the PDF inline.{' '}
              <a
                href={agreementPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#7E5896] hover:text-[#5e3f72] underline underline-offset-2"
              >
                Open the agreement in a new tab
              </a>{' '}
              to read the full Mkataba before signing.
            </div>
          </object>
        </div>
      )}

      <div className="mt-4 space-y-3">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#7E5896] focus:ring-[#7E5896] focus:ring-offset-0"
          />
          <span className="text-xs text-gray-700 leading-relaxed">
            I have read the OpusFesta vendor agreement ({agreementVersion}) and
            agree to its terms on behalf of my business.
          </span>
        </label>

        {/* Page-3 identification block of the Mkataba. The labels are in
            Swahili to mirror the printed form; sub-labels in English give a
            quick reading aid. Pre-filled from the vendor's onboarding answers
            where we already have the data. Sits before the signature inputs
            so the form flows the same way page 3 of the printed agreement
            does — declare the business, then sign for it. */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-4">
          <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-gray-700">
            Taarifa za Biashara{' '}
            <span className="text-gray-400 font-semibold normal-case tracking-normal">
              (page 3 of the Mkataba)
            </span>
          </h4>
          <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
            Confirm the details that appear on page 3 of the agreement. Edit
            anything that&rsquo;s out of date.
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AgreementField
              label="Jina la Biashara"
              hint="Business name"
              value={businessName}
              onChange={setBusinessName}
              autoComplete="organization"
              disabled={pending}
            />
            <AgreementField
              label="TIN"
              hint="Tax Identification Number"
              value={tin}
              onChange={setTin}
              placeholder="123-456-789"
              inputMode="numeric"
              disabled={pending}
            />
            <AgreementField
              label="Anwani ya Biashara"
              hint="Business address"
              value={businessAddress}
              onChange={setBusinessAddress}
              autoComplete="street-address"
              className="sm:col-span-2"
              disabled={pending}
            />
            <AgreementField
              label="Mtu wa Mawasiliano"
              hint="Contact person"
              value={contactPerson}
              onChange={setContactPerson}
              autoComplete="name"
              disabled={pending}
            />
            <AgreementField
              label="Barua Pepe"
              hint="Email"
              value={email}
              onChange={setEmail}
              type="email"
              autoComplete="email"
              disabled={pending}
            />
            <AgreementField
              label="WhatsApp / Simu"
              hint="WhatsApp / phone"
              value={phone}
              onChange={setPhone}
              type="tel"
              autoComplete="tel"
              disabled={pending}
            />
            <AgreementField
              label="Aina ya Huduma"
              hint="Type of service"
              value={serviceType}
              onChange={setServiceType}
              disabled={pending}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Type your full legal name to sign
          </label>
          <input
            type="text"
            autoComplete="name"
            placeholder="e.g. Asha Mwakikuti"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7E5896] focus:border-transparent"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Must match the name on your TIN certificate. Your IP and timestamp
            are recorded for the signature audit trail.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Or draw your signature
          </label>
          <SignaturePad
            onChange={setSignatureDataUrl}
            disabled={pending}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-800 leading-relaxed">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={pending}
          className={cn(
            'inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition-colors',
            'bg-gray-900 hover:bg-gray-800 text-white',
            pending && 'opacity-60 cursor-wait',
          )}
        >
          {pending ? (
            <>
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              Signing…
            </>
          ) : (
            <>
              <PenLine className="w-3.5 h-3.5" />
              Sign and submit
            </>
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * Small labelled input used inside the Mkataba page-3 block. Keeps the
 * Swahili label primary and shows the English hint as a muted sub-label so
 * the form matches the printed agreement while staying readable for
 * non-Swahili speakers on the team.
 */
function AgreementField({
  label,
  hint,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
  disabled,
  className,
}: {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'email' | 'tel'
  placeholder?: string
  autoComplete?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
  disabled?: boolean
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className="block text-[11px] font-semibold text-gray-700">
        {label}{' '}
        <span className="font-normal text-gray-400">· {hint}</span>
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        disabled={disabled}
        className="mt-1 w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7E5896] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
      />
    </label>
  )
}

function formatRelative(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diffMs = now - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
