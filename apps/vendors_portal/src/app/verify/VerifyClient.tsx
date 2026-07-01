'use client'

import { type ReactNode, useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import {
  AlertCircle,
  ArrowRight,
  Check,
  ClipboardCheck,
  Clock,
  FileSignature,
  FileText,
  IdCard,
  LogOut,
  type LucideIcon,
  PenLine,
  ShieldCheck,
  Upload,
  Wallet,
} from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { LocaleToggle } from '@/components/LocaleToggle'
import { cn } from '@/lib/utils'
import {
  signVendorAgreement,
  uploadVerificationDocument,
  type VerifyDocType,
} from './actions'
import { SignaturePad } from './SignaturePad'
import NationalIdStep from './NationalIdStep'

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

/**
 * One document in the OF-LGL-AGR-002 agreement family, with its signature
 * status. Mirrors the server-side AgreementDoc registry minus the server-only
 * bits (body file path), plus `signedAt` (null = not yet signed). `fields`
 * decides which SEHEMU B block the sign form renders.
 */
export type AgreementDocView = {
  id: 'main' | 'schedule_a' | 'schedule_b'
  version: string
  code: string
  title: string
  subtitle: string
  pdfUrl: string
  downloadName: string
  fields: 'full' | 'schedule'
  signedAt: string | null
}

type Props = {
  status: 'verification_pending' | 'needs_corrections' | 'admin_review'
  /** The active vendor id — scopes the persisted "skipped optional docs" flag
   *  so the agreement step doesn't re-lock on every reload. */
  vendorId: string
  slots: VerifyDocSlot[]
  /** National ID + liveness selfie capture progress (the required identity
   *  step). TIN + business license in `slots` are optional. */
  nationalId: { front: boolean; back: boolean; selfie: boolean }
  /** Every document in the agreement family, in signing order, each with its
   *  current signature status. The agreement step is "done" only once all of
   *  them are signed. */
  agreementDocs: AgreementDocView[]
  /** Pre-filled values for the SEHEMU B identification block on each sign
   *  form (business name, TIN, address, contact, etc.). */
  agreementBusinessDefaults: AgreementBusinessDefaults
}

type StepMode = 'done' | 'active' | 'locked'

// Dashed-ring color for not-yet-reached (locked) steps — matches the dashed
// timeline circles on /pending so the two screens read consistently. Solid
// green takes over once a step is done.
const LOCKED_RING: Record<'purple' | 'blue' | 'amber', string> = {
  purple: 'border-[#7E5896]/60 text-[#7E5896]',
  blue: 'border-blue-500/60 text-blue-600',
  amber: 'border-amber-500/70 text-amber-600',
}

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
  vendorId,
  slots,
  nationalId,
  agreementDocs,
  agreementBusinessDefaults,
}: Props) {
  const isCorrection = status === 'needs_corrections'
  // Everything is submitted and the vendor is waiting on admin. The timeline
  // shows every step done with "Under review" as the active step.
  const isUnderReview = status === 'admin_review'

  // Required identity step: National ID front + back + a liveness selfie. This
  // is the gate — TIN certificate and business license (in `slots`) are now
  // OPTIONAL and live in a separate section below the journey.
  const idComplete =
    nationalId.front && nationalId.back && nationalId.selfie

  const tinSlot = slots[0]
  const licenseSlot = slots[1]
  const tinDone = isSlotDone(tinSlot)
  const licenseDone = isSlotDone(licenseSlot)

  // The agreement step spans the whole OF-LGL-AGR-002 family — it's only
  // "done" once every document has been signed.
  const signedCount = agreementDocs.filter((d) => d.signedAt).length
  const agreementSigned =
    agreementDocs.length > 0 && signedCount === agreementDocs.length

  // The vendor explicitly moving past the optional-docs step ("Skip / Continue
  // to agreement") used to live only in component state, so a reload re-locked
  // the agreement and forced them to click through again. Persist it per vendor
  // so the unlock sticks across reloads/sessions on this device.
  const [skippedOptional, setSkippedOptionalState] = useState(false)
  const skipKey = `opusfesta:verify-skip-optional:${vendorId}`
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (window.localStorage.getItem(skipKey) === '1') {
        // Hydrating a client-only persisted flag — a lazy useState initializer
        // would read localStorage during SSR and mismatch on hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSkippedOptionalState(true)
      }
    } catch {
      // ignore private-mode / quota errors — the in-memory flag still works
    }
  }, [skipKey])
  const setSkippedOptional = (val: boolean) => {
    setSkippedOptionalState(val)
    try {
      if (val) window.localStorage.setItem(skipKey, '1')
      else window.localStorage.removeItem(skipKey)
    } catch {
      // ignore private-mode / quota errors
    }
  }

  const idMode: StepMode = idComplete ? 'done' : 'active'

  // Optional documents come right after identity. The vendor either adds their
  // TIN / business license or skips — either way the optional step is
  // "resolved" and the agreement opens. A signature already in progress also
  // counts as resolved, so returning vendors aren't sent back through skip.
  const optionalResolved = skippedOptional || signedCount > 0
  // …but if admin rejected a TIN/license during corrections, the vendor MUST be
  // able to re-upload it. Without this, a returning vendor who already signed
  // (or skipped) sees this section collapsed to "done", with no upload control
  // for the very document they were sent back to fix. Re-open the section on a
  // rejection — but leave `optionalResolved` alone so the agreement step below
  // keeps its state instead of getting re-locked.
  const optionalNeedsFix =
    tinSlot?.currentDoc?.status === 'rejected' ||
    licenseSlot?.currentDoc?.status === 'rejected'
  // A step the vendor already completed STAYS done even if a different document
  // (e.g. one ID side) was sent back for re-upload — it must not re-lock and
  // hide work that was already accepted. Only genuinely-incomplete steps gate
  // on the identity step.
  const optionalMode: StepMode =
    optionalResolved && !optionalNeedsFix
      ? 'done'
      : optionalNeedsFix
        ? 'active' // a flagged TIN/license must stay re-uploadable
        : !idComplete
          ? 'locked'
          : 'active'

  const agreementMode: StepMode = agreementSigned
    ? 'done'
    : !idComplete || !optionalResolved
      ? 'locked'
      : 'active'

  // Build the visual timeline rendered above the active form. Payout appears
  // immediately after the application because it is captured during onboarding;
  // identity and optional documents follow, matching the actual verification
  // flow the vendor completes here.
  type JourneyStep = {
    icon: LucideIcon
    title: string
    description: string
    mode: StepMode
    /** Pill text for done/active. Tone is auto for done; explicit for active. */
    doneLabel?: string
    activeLabel?: string
    activeTone?: 'purple' | 'amber' | 'rose'
    /** Accent for the dashed ring shown while the step is still locked. */
    tone?: 'purple' | 'blue' | 'amber'
    /** Inline action UI rendered below the description when the step is the
     *  active one. Keeps the vendor's focus on the timeline; no separate
     *  duplicated card below. */
    action?: ReactNode
  }

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
      icon: Wallet,
      title: 'Payout setup',
      description:
        'Payout method recorded during onboarding. The final name match happens during admin review.',
      mode: 'done',
      doneLabel: 'Submitted',
    },
    {
      icon: IdCard,
      title: 'Identity verification',
      mode: idMode,
      description:
        idMode === 'done'
          ? 'National ID (front + back) and liveness selfie captured. Awaiting admin review.'
          : 'Take a photo of the front and back of your Tanzania National ID (NIDA), then a quick selfie to confirm it’s you.',
      doneLabel: 'Awaiting review',
      activeLabel: 'In progress',
      activeTone: 'purple',
      tone: 'blue',
      action:
        idMode === 'active' ? (
          <NationalIdStep
            initialFront={nationalId.front}
            initialBack={nationalId.back}
            initialSelfie={nationalId.selfie}
          />
        ) : undefined,
    },
    {
      icon: FileText,
      title: 'Optional documents',
      mode: optionalMode,
      tone: 'blue',
      description:
        optionalMode === 'done'
          ? tinDone || licenseDone
            ? 'Optional documents added. Thanks, this helps speed up review.'
            : 'Skipped for now. Your National ID alone is enough to get approved.'
          : optionalMode === 'active'
            ? 'Not required to get approved. Your National ID is enough. Adding your TIN or business license builds trust and can speed up review.'
            : 'Unlocks once your identity is verified.',
      doneLabel: tinDone || licenseDone ? 'Added' : 'Skipped',
      activeLabel: 'Optional',
      activeTone: 'purple',
      action:
        optionalMode === 'active' ? (
          <div className="mt-3 space-y-3">
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 px-4">
              <OptionalDoc
                title="TRA TIN certificate"
                description="Your tax ID certificate from the Tanzania Revenue Authority."
                slot={tinSlot}
                done={tinDone}
                isCorrection={isCorrection}
              />
              <OptionalDoc
                title="Business license"
                description="BRELA registration, council license, or a sole-proprietor declaration."
                slot={licenseSlot}
                done={licenseDone}
                isCorrection={isCorrection}
              />
            </div>
            <button
              type="button"
              onClick={() => setSkippedOptional(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
            >
              {tinDone || licenseDone
                ? 'Continue to agreement'
                : 'Skip to agreement'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : undefined,
    },
    {
      icon: FileSignature,
      title: 'Vendor agreement',
      mode: agreementMode,
      description:
        agreementMode === 'done'
          ? `All ${agreementDocs.length} documents signed. Separate from the Vendor Vows you accepted during onboarding.`
          : agreementMode === 'active'
            ? `Read and e-sign each part of the OpusFesta Mkataba wa Watoa Huduma (OF-LGL-AGR-002): the main contract and its two schedules. Each is signed separately. This is the legally binding agreement, distinct from the Vendor Vows pledge.`
            : !idComplete
              ? 'Unlocks once your identity is verified.'
              : 'Add the optional documents above, or skip, to continue.',
      doneLabel: 'Signed',
      activeLabel:
        signedCount > 0 ? `${signedCount}/${agreementDocs.length} signed` : 'In progress',
      activeTone: 'purple',
      tone: 'purple',
      action:
        agreementMode === 'active' ? (
          <AgreementDocsList
            docs={agreementDocs}
            businessDefaults={agreementBusinessDefaults}
          />
        ) : undefined,
    },
    {
      icon: ShieldCheck,
      title: 'Under review',
      mode: isUnderReview ? 'active' : 'locked',
      tone: 'amber',
      activeLabel: 'In progress',
      activeTone: 'amber',
      description: isUnderReview
        ? "Everything's in. Our team is verifying your details, documents, payout, and portfolio, and we'll email you the moment your dashboard unlocks. Usually 2 to 3 business days."
        : 'Once the steps above are complete, our team verifies your details and approves your storefront. Usually 2 to 3 business days.',
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
        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleToggle />
          <SignOutButton redirectUrl="/sign-in">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-md hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </SignOutButton>
        </div>
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
              {isUnderReview
                ? "We're reviewing your application"
                : isCorrection
                  ? 'Re-upload the documents we flagged'
                  : 'Verify your business'}
            </h1>
            <p className="mt-4 text-base text-gray-600 leading-relaxed max-w-xl mx-auto">
              {isUnderReview
                ? "Thanks for submitting everything, you're all done. Here's the full picture of your verification while our team reviews it."
                : isCorrection
                  ? 'Pick up the flagged item below and re-submit. Re-reviews are typically completed within 1 business day.'
                  : "Three steps to admin review. Most vendors hear back within 2 to 3 business days once they've finished."}
            </p>
            {/* Compact affordance for editing the application details. Replaces
                the verbose "Already on file" panel that used to sit at the
                bottom — the timeline already shows the application as
                Submitted, so the only action that needed surfacing was the
                edit link itself. Hidden once under review — the application is
                locked while admin verifies it. */}
            {!isUnderReview && (
              <p className="mt-2 text-xs text-gray-500">
                Need to update your business details?{' '}
                <Link
                  href="/onboard/review"
                  className="font-semibold text-gray-700 hover:text-gray-900 underline underline-offset-2"
                >
                  Edit application
                </Link>
              </p>
            )}
          </div>

          {/* Verification journey — same compact timeline visual as the
              status page (/pending). Pure information: chip + title +
              description + tone-coded status pill, connected by a vertical
              line. The actionable card for the *active* step renders below
              the timeline so the vendor sees the whole journey at a glance
              and the next concrete action right after. */}
          <section id="documents" className="scroll-mt-24 mt-10 sm:mt-12 bg-white rounded-3xl border border-gray-100 shadow-[0_2px_24px_-8px_rgba(98,52,128,0.08)] p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-3 mb-6">
              <h2 className="text-base font-semibold text-gray-900">
                Your verification journey
              </h2>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {journey.filter((s) => s.mode === 'done').length}/
                {journey.length} complete
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
                          cn(
                            'bg-white border-2 border-dashed',
                            LOCKED_RING[step.tone ?? 'purple'],
                          ),
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
 * A single optional document row (TIN / business license). Reuses
 * DocumentUploadActions for the upload UI, wrapped with an icon, an
 * "Optional" tag, and an awaiting-review tag once uploaded.
 */
function OptionalDoc({
  title,
  description,
  slot,
  done,
  isCorrection,
}: {
  title: string
  description: string
  slot: VerifyDocSlot
  done: boolean
  isCorrection: boolean
}) {
  return (
    <div className="py-4">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            done ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500',
          )}
        >
          {done ? (
            <Check className="h-4 w-4" strokeWidth={3} />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {done ? (
              <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-emerald-700">
                Awaiting review
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400">
                Optional
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm leading-relaxed text-gray-600">
            {description}
          </p>
          <div className="mt-3">
            <DocumentUploadActions slot={slot} isCorrection={isCorrection} />
          </div>
        </div>
      </div>
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
 * Renders the list of agreement documents (main contract + Schedule A +
 * Schedule B) for the active agreement step. Each document is signed
 * independently; signed ones collapse to a compact done row, and the first
 * unsigned document is expanded by default so the vendor always sees the next
 * thing to sign.
 */
function AgreementDocsList({
  docs,
  businessDefaults,
}: {
  docs: AgreementDocView[]
  businessDefaults: AgreementBusinessDefaults
}) {
  const firstUnsigned = docs.find((d) => !d.signedAt)?.id ?? null
  const [openId, setOpenId] = useState<AgreementDocView['id'] | null>(
    firstUnsigned,
  )

  return (
    <div className="mt-4 space-y-3">
      <p className="text-[11px] text-gray-500 leading-relaxed">
        The agreement comes in {docs.length} parts: the main contract and its
        two schedules. Read and e-sign each one separately. They&rsquo;re all
        part of the same binding contract (OF-LGL-AGR-002).
      </p>
      {docs.map((doc) => (
        <AgreementDocCard
          key={doc.id}
          doc={doc}
          businessDefaults={businessDefaults}
          open={openId === doc.id}
          onToggle={() =>
            setOpenId((cur) => (cur === doc.id ? null : doc.id))
          }
        />
      ))}
    </div>
  )
}

/**
 * A single agreement document: header (title + code + status pill) and, when
 * expanded and not yet signed, the read-the-PDF + ack + SEHEMU B
 * identification block + name + signature pad + submit form. The main
 * contract uses the full 7-field business table; the schedules use the lighter
 * block printed on their own signature page.
 */
function AgreementDocCard({
  doc,
  businessDefaults,
  open,
  onToggle,
}: {
  doc: AgreementDocView
  businessDefaults: AgreementBusinessDefaults
  open: boolean
  onToggle: () => void
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  // PNG data URL of the drawn signature, or null if the vendor hasn't drawn
  // anything (drawing is optional — the typed legal name is the binding
  // record per the agreement; the drawn glyph is supplementary visual proof).
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)

  const isFull = doc.fields === 'full'

  // SEHEMU B identification block. Pre-filled from onboarding answers where we
  // have the data. The full contract carries the whole business table; the
  // schedules carry only business name + position (Cheo) + NIDA.
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
  // Schedule-only fields.
  const [position, setPosition] = useState('')
  const [nida, setNida] = useState('')

  const signed = !!doc.signedAt

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
    const required: [string, string][] = isFull
      ? [
          ['Jina la Biashara', businessName],
          ['TIN', tin],
          ['Anwani ya Biashara', businessAddress],
          ['Mtu wa Mawasiliano', contactPerson],
          ['Barua Pepe', email],
          ['WhatsApp/Simu', phone],
          ['Aina ya Huduma', serviceType],
        ]
      : [
          ['Jina la Biashara', businessName],
          ['Cheo', position],
          ['Kitambulisho (NIDA)', nida],
        ]
    for (const [label, value] of required) {
      if (!value.trim()) {
        setError(`Fill in ${label} before signing.`)
        return
      }
    }

    const formData = new FormData()
    formData.append('documentId', doc.id)
    formData.append('signedName', name.trim())
    formData.append('acknowledged', 'true')
    formData.append('businessName', businessName.trim())
    if (isFull) {
      formData.append('tin', tin.trim())
      formData.append('businessAddress', businessAddress.trim())
      formData.append('contactPerson', contactPerson.trim())
      formData.append('email', email.trim())
      formData.append('phone', phone.trim())
      formData.append('serviceType', serviceType.trim())
    } else {
      formData.append('position', position.trim())
      formData.append('nida', nida.trim())
    }
    if (signatureDataUrl) {
      formData.append('signatureImage', signatureDataUrl)
    }
    startTransition(async () => {
      try {
        const res = await signVendorAgreement(formData)
        if (!res.ok) {
          setError(res.error)
          return
        }
        router.refresh()
      } catch {
        setError('Something went wrong while submitting your signature. Please try again.')
      }
    })
  }

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white overflow-hidden transition-colors',
        signed ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-200',
      )}
    >
      {/* Header row — title, code, status. Clicking toggles the body open for
          unsigned docs; signed docs just show the done state. */}
      <button
        type="button"
        onClick={signed ? undefined : onToggle}
        aria-expanded={signed ? undefined : open}
        className={cn(
          'w-full flex items-start gap-3 px-4 py-3.5 text-left',
          !signed && 'hover:bg-gray-50',
        )}
      >
        <span
          className={cn(
            'mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full shrink-0',
            signed
              ? 'bg-emerald-500 text-white'
              : open
                ? 'bg-[#7E5896] text-white'
                : 'bg-gray-100 text-gray-500',
          )}
          aria-hidden
        >
          {signed ? (
            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          ) : (
            <FileSignature className="w-3.5 h-3.5" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-gray-900">
              {doc.title}
            </span>
            <span className="font-mono text-[10px] text-gray-400">
              {doc.code}
            </span>
          </span>
          <span className="block text-[11px] text-gray-500">
            {doc.subtitle}
          </span>
        </span>
        <span className="shrink-0 self-center">
          {signed ? (
            <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-emerald-700">
              Signed{doc.signedAt ? ` · ${formatRelative(doc.signedAt)}` : ''}
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-[#7E5896]">
              {open ? 'Hide' : 'Sign'}
            </span>
          )}
        </span>
      </button>

      {!signed && open && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <a
              href={doc.pdfUrl}
              download={doc.downloadName}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Download PDF
            </a>
          </div>

          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/70 overflow-hidden">
            {/* Native PDF viewer renders the canonical document exactly as it
                appears in the source. Browsers that can't display the PDF
                inline (mostly older mobile Safari) get the download CTA. */}
            <object
              data={`${doc.pdfUrl}#view=FitH`}
              type="application/pdf"
              aria-label={`${doc.title} (${doc.code})`}
              className="w-full h-[560px]"
            >
              <div className="p-6 text-center text-xs text-gray-600 leading-relaxed">
                Your browser can&rsquo;t display the PDF inline.{' '}
                <a
                  href={doc.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#7E5896] hover:text-[#5e3f72] underline underline-offset-2"
                >
                  Open the document in a new tab
                </a>{' '}
                to read it in full before signing.
              </div>
            </object>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#7E5896] focus:ring-[#7E5896] focus:ring-offset-0"
              />
              <span className="text-xs text-gray-700 leading-relaxed">
                I have read {doc.title} ({doc.code}) and agree to its terms on
                behalf of my business.
              </span>
            </label>

            {/* SEHEMU B identification block, mirroring the printed signature
                page. Labels are Swahili (to match the document) with English
                sub-labels as a reading aid. Pre-filled from onboarding where
                we have the data. */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-gray-700">
                {isFull ? 'Taarifa za Biashara' : 'Taarifa za Mtoa Huduma'}{' '}
                <span className="text-gray-400 font-semibold normal-case tracking-normal">
                  (SEHEMU B)
                </span>
              </h4>
              <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
                Confirm the details that appear on the signature page. Edit
                anything that&rsquo;s out of date.
              </p>

              {isFull ? (
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
              ) : (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AgreementField
                    label="Jina la Biashara"
                    hint="Business name"
                    value={businessName}
                    onChange={setBusinessName}
                    autoComplete="organization"
                    className="sm:col-span-2"
                    disabled={pending}
                  />
                  <AgreementField
                    label="Cheo"
                    hint="Position / title"
                    value={position}
                    onChange={setPosition}
                    placeholder="e.g. Mmiliki"
                    disabled={pending}
                  />
                  <AgreementField
                    label="Kitambulisho (NIDA)"
                    hint="National ID number"
                    value={nida}
                    onChange={setNida}
                    inputMode="numeric"
                    disabled={pending}
                  />
                </div>
              )}
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
                Must match the name on your National ID. Your IP and timestamp
                are recorded for the signature audit trail.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Or draw your signature
              </label>
              <SignaturePad onChange={setSignatureDataUrl} disabled={pending} />
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
      )}
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
