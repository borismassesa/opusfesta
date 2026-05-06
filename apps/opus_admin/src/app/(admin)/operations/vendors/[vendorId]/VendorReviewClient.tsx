'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileSignature,
  FileText,
  Loader2,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSetPageHeading } from '@/components/PageHeading'
import { HeaderActionsSlot, HeaderBadgeSlot } from '@/components/HeaderPortals'
import {
  approveDocument,
  approveVendor,
  deleteVendorPayoutMethod,
  generateSignedUrl,
  reactivateVendor,
  rejectDocument,
  requestCorrections,
  saveVendorPayoutMethod,
  suspendVendor,
  type VendorPayoutMethodType,
  type VendorPayoutStatus,
} from '../actions'
import {
  AdminBookingPoliciesEditor,
  AdminFaqEditor,
  AdminHoursEditor,
  AdminPackagesEditor,
  AdminProfileEditor,
  AdminRecognitionEditor,
  AdminStylePersonalityEditor,
  AdminTeamEditor,
} from './StorefrontEditors'

// ---------------------------------------------------------------------------
// Types — mirror the server-page projection
// ---------------------------------------------------------------------------

type DocStatus = 'pending_review' | 'approved' | 'rejected' | string

export type DocSummary = {
  id: string
  docType: string
  storagePath: string
  filename: string | null
  mimeType: string | null
  sizeBytes: number | null
  status: DocStatus
  rejectionReason: string | null
  reviewedAt: string | null
  uploadedAt: string
}

export type VendorReviewProps = {
  vendor: {
    id: string
    vendorCode: string | null
    slug: string
    businessName: string
    category: string
    bio: string | null
    description: string | null
    yearsInBusiness: number | null
    location: {
      street?: string | null
      street2?: string | null
      city?: string | null
      region?: string | null
      postalCode?: string | null
      country?: string | null
      homeMarket?: string | null
      serviceMarkets?: string[] | null
    } | null
    contact: {
      phone?: string | null
      email?: string | null
      whatsapp?: string | null
    } | null
    socialLinks: Record<string, string | null> | null
    services: Array<{ id?: string; title?: string; custom?: boolean }>
    packages: Array<{
      id?: string
      name?: string
      price?: string
      description?: string
    }>
    applicationSnapshot: Record<string, unknown> | null
    onboardingStatus: string
    onboardingStartedAt: string | null
    onboardingCompletedAt: string | null
    suspendedAt: string | null
    suspensionReason: string | null
    updatedAt: string
    // Live editable storefront columns — used to hydrate the per-section
    // admin editor cards. Each editor reads its slice and emits a patch via
    // updateStorefrontSection on save.
    teamColumn: Array<Record<string, unknown>>
    faqsColumn: Array<Record<string, unknown>>
    packagesColumn: Array<Record<string, unknown>>
    awardsColumn: string | null
    hoursColumn: Record<
      string,
      { open?: boolean; from?: string; to?: string }
    > | null
    languagesColumn: string[]
    responseTimeHoursColumn: string | null
    locallyOwnedColumn: boolean | null
    parallelBookingCapacityColumn: number | null
    depositPercentColumn: string | null
    cancellationLevelColumn: string | null
    reschedulePolicyColumn: string | null
    styleColumn: string | null
    personalityColumn: string | null
  }
  tin: DocSummary | null
  license: DocSummary | null
  payout: {
    id: string
    methodType: string
    provider: string | null
    accountNumber: string
    accountHolderName: string
    status: string
  } | null
  agreement: {
    id: string
    version: string
    textHash: string
    signedFullName: string
    signedIp: string | null
    signedUserAgent: string | null
    signedAt: string
    signatureImagePath: string | null
  } | null
  historicalDocs: Array<{
    id: string
    docType: string
    storagePath: string
    filename: string | null
    status: string
    rejectionReason: string | null
    uploadedAt: string
  }>
}

const PAYOUT_METHOD_LABEL: Record<string, string> = {
  mpesa: 'M-Pesa',
  airtel: 'Airtel Money',
  tigo: 'Tigo Pesa',
  lipa_namba: 'Lipa Namba',
  bank: 'Bank account',
  stripe_connect: 'Stripe Connect',
}

const STATUS_LABEL: Record<string, string> = {
  application_in_progress: 'Drafting',
  verification_pending: 'Uploading docs',
  admin_review: 'Awaiting your review',
  needs_corrections: 'Needs corrections',
  active: 'Active',
  suspended: 'Suspended',
}

const STATUS_TONE: Record<string, string> = {
  application_in_progress: 'bg-gray-100 text-gray-700 border-gray-200',
  verification_pending: 'bg-[#F0DFF6] text-[#7E5896] border-[#E0C7E8]',
  admin_review: 'bg-amber-50 text-amber-800 border-amber-200',
  needs_corrections: 'bg-rose-50 text-rose-700 border-rose-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  suspended: 'bg-gray-100 text-gray-700 border-gray-200',
}

const MOBILE_PAYOUT_METHODS = new Set([
  'mpesa',
  'airtel',
  'airtel-money',
  'tigo',
  'tigopesa',
  'halopesa',
])

const PAYOUT_METHOD_OPTIONS: Array<{
  value: VendorPayoutMethodType
  label: string
}> = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'airtel', label: 'Airtel Money' },
  { value: 'tigo', label: 'Tigo Pesa' },
  { value: 'lipa_namba', label: 'Lipa Namba' },
  { value: 'bank', label: 'Bank account' },
  { value: 'stripe_connect', label: 'Stripe Connect' },
]

const PAYOUT_STATUS_OPTIONS: Array<{
  value: VendorPayoutStatus
  label: string
}> = [
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'failed', label: 'Failed' },
]

const REVIEW_INPUT_CLASS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7E5896]/30 focus:border-[#7E5896]/40'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VendorReviewClient(props: VendorReviewProps) {
  const { vendor, tin, license, payout, agreement, historicalDocs } = props
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [bannerError, setBannerError] = useState<string | null>(null)

  const isApproved = vendor.onboardingStatus === 'active'
  const isSuspended = vendor.onboardingStatus === 'suspended'

  // Drive the global Header from real vendor data. The status pill and the
  // Approve / Suspend / Request-corrections buttons portal into the Header
  // slots below; here we just feed the title + subtitle text.
  const subtitleParts = [
    vendor.vendorCode,
    vendor.category,
    `/${vendor.slug}`,
    `last update ${formatRelative(vendor.updatedAt)}`,
  ].filter(Boolean) as string[]
  useSetPageHeading({
    title: vendor.businessName,
    subtitle: subtitleParts.join(' · '),
  })

  const runAction = (
    label: string,
    fn: () => Promise<{ ok: boolean; error?: string }>
  ) => {
    setBannerError(null)
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) {
        setBannerError(res.error ?? `${label} failed.`)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="px-8 pt-4 pb-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Status pill — portaled into the global Header next to the title. */}
        <HeaderBadgeSlot>
          <span
            className={cn(
              'inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border',
              STATUS_TONE[vendor.onboardingStatus] ??
                STATUS_TONE.application_in_progress
            )}
          >
            {STATUS_LABEL[vendor.onboardingStatus] ?? vendor.onboardingStatus}
          </span>
        </HeaderBadgeSlot>

        {/* Vendor-level CTAs — portaled into the Header's right rail so the
            primary action sits next to the global icons, not inside the
            page content. Approve / Reject / Suspend logic unchanged. */}
        <HeaderActionsSlot>
          {isApproved ? (
            <button
              type="button"
              onClick={() => {
                const reason = window.prompt(
                  'Reason for suspension (optional — included in the notification email to the vendor):',
                  ''
                )
                if (reason === null) return
                runAction('Suspend', () =>
                  suspendVendor(vendor.id, reason || undefined)
                )
              }}
              disabled={pending}
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50 transition-colors"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              Suspend vendor
            </button>
          ) : isSuspended ? (
            <button
              type="button"
              onClick={() =>
                runAction('Reactivate', () => reactivateVendor(vendor.id))
              }
              disabled={pending}
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Reactivate
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  const note = window.prompt(
                    'What does the vendor need to fix? (optional — included in the email to the vendor):',
                    ''
                  )
                  if (note === null) return
                  runAction('Request corrections', () =>
                    requestCorrections(vendor.id, note || undefined)
                  )
                }}
                disabled={pending}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50 transition-colors"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                Request corrections
              </button>
              <button
                type="button"
                onClick={() =>
                  runAction('Approve & activate', () =>
                    approveVendor(vendor.id)
                  )
                }
                disabled={pending}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-50 transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Approve &amp; activate
              </button>
            </>
          )}
        </HeaderActionsSlot>

        {/* Back link */}
        <Link
          href="/operations/vendors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All vendors
        </Link>

        {/* Suspension note (if any) + section-approval pills + transient
            errors stay at the top of the page content — they're contextual
            to this page, not to the global Header. */}
        {isSuspended && vendor.suspensionReason && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5">
            <PauseCircle className="w-3.5 h-3.5 text-gray-500 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-700 leading-relaxed">
              <span className="font-semibold">Suspension note:</span>{' '}
              {vendor.suspensionReason}
            </p>
          </div>
        )}

        {bannerError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <p className="text-xs text-rose-800 leading-relaxed">
              {bannerError}
            </p>
          </div>
        )}

        <div className="space-y-10">
          <ReviewSection
            title="Verification & Payout"
            description="Approve the required legal documents, confirm the vendor agreement, and verify the payout account before activating the vendor."
          >
            <DocReviewCard
              title="TRA TIN certificate"
              subtitle="Tanzania Revenue Authority tax ID."
              icon={FileText}
              doc={tin}
              missingMessage="Vendor hasn't uploaded the TIN certificate yet."
              onApprove={(id) =>
                runAction('Approve TIN', () => approveDocument(id))
              }
              onReject={(id, reason) =>
                runAction('Reject TIN', () => rejectDocument(id, reason))
              }
              actionsDisabled={pending || isApproved || isSuspended}
            />

            <PayoutPanel vendorId={vendor.id} payout={payout} />

            <DocReviewCard
              title="Business license"
              subtitle="BRELA registration, council license, or sole-proprietor declaration."
              icon={FileText}
              doc={license}
              missingMessage="Vendor hasn't uploaded a business license yet."
              onApprove={(id) =>
                runAction('Approve license', () => approveDocument(id))
              }
              onReject={(id, reason) =>
                runAction('Reject license', () => rejectDocument(id, reason))
              }
              actionsDisabled={pending || isApproved || isSuspended}
            />

            <AgreementReviewCard agreement={agreement} vendorId={vendor.id} />
          </ReviewSection>

          <ReviewSection
            title="Public Profile"
            description="Edit the vendor details couples see first: business profile, contact details, location, capacity, photos, style, and languages."
          >
            <AdminProfileEditor
              vendorId={vendor.id}
              initial={{
                businessName: vendor.businessName,
                bio: vendor.bio ?? '',
                yearsInBusiness: vendor.yearsInBusiness,
                street: vendor.location?.street ?? '',
                street2: vendor.location?.street2 ?? '',
                city: vendor.location?.city ?? '',
                region: vendor.location?.region ?? '',
                postalCode: vendor.location?.postalCode ?? '',
                phone: formatTzPhone(vendor.contact?.phone ?? null) ?? '',
                email: vendor.contact?.email ?? '',
                whatsapp: formatTzPhone(vendor.contact?.whatsapp ?? null) ?? '',
                socialWebsite:
                  (vendor.socialLinks?.website as string | null) ?? '',
                socialInstagram:
                  (vendor.socialLinks?.instagram as string | null) ?? '',
                socialFacebook:
                  (vendor.socialLinks?.facebook as string | null) ?? '',
                socialTiktok:
                  (vendor.socialLinks?.tiktok as string | null) ?? '',
                socialWhatsapp:
                  formatTzPhone(
                    (vendor.socialLinks?.whatsapp as string | null) ?? null
                  ) ?? '',
              }}
            />

            <AdminStylePersonalityEditor
              vendorId={vendor.id}
              initial={{
                style: vendor.styleColumn,
                personality: vendor.personalityColumn,
                languages: vendor.languagesColumn,
              }}
            />
          </ReviewSection>

          <ReviewSection
            title="Availability & Booking Rules"
            description="Set the operational rules that affect how couples book, pay deposits, cancel, and reschedule."
          >
            <AdminHoursEditor
              vendorId={vendor.id}
              initial={
                vendor.hoursColumn
                  ? (vendor.hoursColumn as Parameters<
                      typeof AdminHoursEditor
                    >[0]['initial'])
                  : null
              }
            />

            <AdminBookingPoliciesEditor
              vendorId={vendor.id}
              initial={{
                depositPercent: vendor.depositPercentColumn,
                cancellationLevel: vendor.cancellationLevelColumn,
                reschedulePolicy: vendor.reschedulePolicyColumn,
                parallelBookingCapacity: vendor.parallelBookingCapacityColumn,
              }}
            />
          </ReviewSection>

          <ReviewSection
            title="Storefront Content"
            description="Manage the commercial content and trust signals shown on the vendor storefront."
          >
            <AdminPackagesEditor
              vendorId={vendor.id}
              initial={vendor.packagesColumn.map((p, i) => ({
                id:
                  (typeof p.id === 'string' && p.id) ||
                  `pkg-${i}-${Math.random().toString(36).slice(2, 8)}`,
                name: typeof p.name === 'string' ? p.name : '',
                price: typeof p.price === 'string' ? p.price : '',
                description:
                  typeof p.description === 'string' ? p.description : '',
                includes: Array.isArray(p.includes)
                  ? (p.includes as unknown[])
                      .filter((x): x is string => typeof x === 'string')
                      .join('\n')
                  : '',
              }))}
            />

            <AdminRecognitionEditor
              vendorId={vendor.id}
              initial={{
                awards: vendor.awardsColumn,
                responseTimeHours: vendor.responseTimeHoursColumn,
                locallyOwned: vendor.locallyOwnedColumn,
              }}
            />

            <AdminTeamEditor
              vendorId={vendor.id}
              initial={vendor.teamColumn.map((m, i) => ({
                id:
                  (typeof m.id === 'string' && m.id) ||
                  `tm-${i}-${Math.random().toString(36).slice(2, 8)}`,
                name: typeof m.name === 'string' ? m.name : '',
                role: typeof m.role === 'string' ? m.role : '',
                bio: typeof m.bio === 'string' ? m.bio : '',
              }))}
            />

            <AdminFaqEditor
              vendorId={vendor.id}
              initial={vendor.faqsColumn.map((f, i) => ({
                id:
                  (typeof f.id === 'string' && f.id) ||
                  `faq-${i}-${Math.random().toString(36).slice(2, 8)}`,
                question: typeof f.question === 'string' ? f.question : '',
                answer: typeof f.answer === 'string' ? f.answer : '',
              }))}
            />
          </ReviewSection>

          {historicalDocs.length > 0 && (
            <ReviewSection
              title="Past Submissions"
              description="Older uploads are kept here for audit context; the current review only uses the latest document for each requirement."
            >
              <details className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5" />
                  Past document submissions ({historicalDocs.length})
                </summary>
                <ul className="mt-3 space-y-2 text-xs text-gray-600">
                  {historicalDocs.map((d) => (
                    <li key={d.id} className="flex items-center gap-3">
                      <span
                        className={cn(
                          'inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                          d.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700'
                            : d.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-800'
                        )}
                      >
                        {d.status}
                      </span>
                      <span className="font-medium">{d.docType}</span>
                      <span className="text-gray-400">
                        {d.filename ?? 'file'} · {formatRelative(d.uploadedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </ReviewSection>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ReviewSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <header className="border-b border-gray-200 pb-3">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold text-gray-950">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            {description}
          </p>
        </div>
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

function useReviewAction() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const run = (
    action: () => Promise<{ ok: boolean; error?: string }>,
    after?: () => void
  ) => {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await action()
      if (!res.ok) {
        setError(res.error ?? 'Action failed.')
        return
      }
      setSaved(true)
      after?.()
      router.refresh()
    })
  }

  return { pending, error, saved, run }
}

function ReviewPanelActions({
  pending,
  dirty,
  error,
  saved,
  onSave,
  children,
  saveLabel = 'Save',
}: {
  pending: boolean
  dirty: boolean
  error: string | null
  saved: boolean
  onSave: () => void
  children?: React.ReactNode
  saveLabel?: string
}) {
  return (
    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
      <div className="text-xs">
        {error && <span className="text-rose-700">{error}</span>}
        {saved && !error && <span className="text-emerald-700">Saved.</span>}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {children}
        <button
          type="button"
          onClick={onSave}
          disabled={pending || !dirty}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-900 hover:bg-black text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Check className="w-3 h-3" strokeWidth={3} />
          {pending ? 'Saving...' : saveLabel}
        </button>
      </div>
    </div>
  )
}

function PayoutPanel({
  vendorId,
  payout,
}: {
  vendorId: string
  payout: VendorReviewProps['payout']
}) {
  const initialMethod = isVendorPayoutMethodType(payout?.methodType)
    ? payout.methodType
    : 'mpesa'
  const initialStatus = isVendorPayoutStatus(payout?.status)
    ? payout.status
    : 'pending'
  const initialProvider = payout?.provider ?? ''
  const initialAccountNumber = payout ? formatPayoutAccountNumber(payout) : ''
  const initialAccountName = payout?.accountHolderName ?? ''

  const [methodType, setMethodType] =
    useState<VendorPayoutMethodType>(initialMethod)
  const [provider, setProvider] = useState(initialProvider)
  const [accountNumber, setAccountNumber] = useState(initialAccountNumber)
  const [accountHolderName, setAccountHolderName] = useState(initialAccountName)
  const [status, setStatus] = useState<VendorPayoutStatus>(initialStatus)
  const { pending, error, saved, run } = useReviewAction()

  const dirty =
    methodType !== initialMethod ||
    provider !== initialProvider ||
    accountNumber !== initialAccountNumber ||
    accountHolderName !== initialAccountName ||
    status !== initialStatus ||
    !payout

  const save = (nextStatus = status) =>
    run(() =>
      saveVendorPayoutMethod(vendorId, payout?.id ?? null, {
        methodType,
        provider: provider || null,
        accountNumber,
        accountHolderName,
        status: nextStatus,
      })
    )

  const saveWithStatus = (nextStatus: VendorPayoutStatus) => {
    setStatus(nextStatus)
    save(nextStatus)
  }

  const deletePayout = () => {
    if (!payout?.id) return
    const confirmed = window.confirm(
      'Delete this payout method? The vendor will need to add a new payout method before payouts can be approved.'
    )
    if (!confirmed) return
    run(() => deleteVendorPayoutMethod(vendorId, payout.id))
  }

  return (
    <SidePanel title="Payout method" icon={Banknote}>
      <div className="flex flex-col gap-3">
        <Field label="Method">
          <select
            className={REVIEW_INPUT_CLASS}
            value={methodType}
            onChange={(e) =>
              setMethodType(e.target.value as VendorPayoutMethodType)
            }
          >
            {PAYOUT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className={REVIEW_INPUT_CLASS}
            value={status}
            onChange={(e) => setStatus(e.target.value as VendorPayoutStatus)}
          >
            {PAYOUT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Provider">
          <input
            className={REVIEW_INPUT_CLASS}
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="Optional"
          />
        </Field>
        <Field label="Account number">
          <input
            className={`${REVIEW_INPUT_CLASS} font-mono`}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="+255 754 123 456"
          />
        </Field>
        <Field label="Account name">
          <input
            className={REVIEW_INPUT_CLASS}
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
          />
        </Field>
      </div>
      <p className="text-[11px] text-gray-500 italic mt-3">
        Verify the account holder name matches the TIN certificate above before
        approving the vendor.
      </p>
      <ReviewPanelActions
        pending={pending}
        dirty={dirty}
        error={error}
        saved={saved}
        onSave={() => save()}
        saveLabel={payout ? 'Save payout' : 'Create payout'}
      >
        <button
          type="button"
          onClick={() => saveWithStatus('verified')}
          disabled={pending}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
        >
          <ShieldCheck className="w-3 h-3" />
          Verify
        </button>
        <button
          type="button"
          onClick={() => saveWithStatus('failed')}
          disabled={pending}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 disabled:opacity-50 transition-colors"
        >
          <XCircle className="w-3 h-3" />
          Mark failed
        </button>
        {payout?.id && (
          <button
            type="button"
            onClick={deletePayout}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        )}
      </ReviewPanelActions>
    </SidePanel>
  )
}

function DocReviewCard({
  title,
  subtitle,
  icon: Icon,
  doc,
  missingMessage,
  onApprove,
  onReject,
  actionsDisabled,
}: {
  title: string
  subtitle: string
  icon: typeof FileText
  doc: DocSummary | null
  missingMessage: string
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
  actionsDisabled: boolean
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState(doc?.rejectionReason ?? '')

  // Mint a signed URL on mount whenever a doc exists. URLs expire in 10
  // minutes; the click-to-refresh affordance below regenerates if needed.
  useEffect(() => {
    if (!doc) {
      setSignedUrl(null)
      return
    }
    let cancelled = false
    generateSignedUrl(doc.storagePath).then((res) => {
      if (cancelled) return
      if (!res.ok) {
        setUrlError(res.error)
      } else {
        setSignedUrl(res.url)
      }
    })
    return () => {
      cancelled = true
    }
  }, [doc?.storagePath, doc?.id])

  const isPending = doc?.status === 'pending_review'
  const isApproved = doc?.status === 'approved'
  const isRejected = doc?.status === 'rejected'

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
      <header className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {doc && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border',
                  isApproved &&
                    'bg-emerald-50 text-emerald-700 border-emerald-200',
                  isPending && 'bg-amber-50 text-amber-800 border-amber-200',
                  isRejected && 'bg-rose-50 text-rose-700 border-rose-200'
                )}
              >
                {isApproved && (
                  <Check className="w-2.5 h-2.5" strokeWidth={3} />
                )}
                {isPending && <Clock className="w-2.5 h-2.5" />}
                {isRejected && <XCircle className="w-2.5 h-2.5" />}
                {doc.status.replace('_', ' ')}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          {doc && (
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-semibold text-gray-700">
                {doc.filename ?? 'Uploaded file'}
              </span>{' '}
              {doc.docType !== title && (
                <span>
                  · stored as{' '}
                  <code className="font-mono text-[11px]">{doc.docType}</code>
                </span>
              )}{' '}
              · uploaded {formatRelative(doc.uploadedAt)}
              {doc.reviewedAt &&
                ` · reviewed ${formatRelative(doc.reviewedAt)}`}
            </p>
          )}
        </div>
      </header>

      {!doc ? (
        <p className="text-sm text-gray-500 italic">{missingMessage}</p>
      ) : (
        <>
          {/* Embedded preview */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden mb-4">
            {urlError ? (
              <div className="p-6 text-center text-xs text-rose-700">
                {urlError}
              </div>
            ) : !signedUrl ? (
              <div className="p-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating preview…
              </div>
            ) : doc.mimeType?.startsWith('image/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signedUrl}
                alt={doc.filename ?? 'Uploaded document'}
                className="block w-full max-h-[640px] object-contain bg-gray-100"
              />
            ) : (
              <object
                data={`${signedUrl}#view=FitH`}
                type={doc.mimeType ?? 'application/pdf'}
                aria-label={doc.filename ?? 'Uploaded document'}
                className="w-full h-[640px]"
              >
                <div className="p-6 text-center text-xs text-gray-600">
                  Can&rsquo;t display this file inline.{' '}
                  <a
                    href={signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#7E5896] underline underline-offset-2"
                  >
                    Open in a new tab
                  </a>
                </div>
              </object>
            )}
          </div>

          {/* Open in tab affordance */}
          {signedUrl && (
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 mb-4"
            >
              <ExternalLink className="w-3 h-3" />
              Open in new tab
            </a>
          )}

          {/* Existing rejection reason if any */}
          {isRejected && doc.rejectionReason && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-800 leading-relaxed">
                <span className="font-semibold">Current rejection note:</span>{' '}
                {doc.rejectionReason}
              </p>
            </div>
          )}

          {/* Actions */}
          {!actionsDisabled && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onApprove(doc.id)}
                disabled={isApproved}
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-1.5 rounded-full transition-colors',
                  isApproved
                    ? 'bg-emerald-50 text-emerald-700 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                )}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {isApproved ? 'Approved' : 'Approve'}
              </button>
              <button
                type="button"
                onClick={() => setShowRejectForm((s) => !s)}
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-1.5 rounded-full transition-colors',
                  showRejectForm
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
                )}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                {showRejectForm ? 'Cancel' : 'Reject…'}
              </button>
            </div>
          )}

          {showRejectForm && (
            <div className="mt-3 rounded-xl bg-rose-50/40 border border-rose-100 p-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Rejection note (the vendor sees this verbatim)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Image is blurry — please re-scan the certificate."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  if (!doc) return
                  onReject(doc.id, rejectReason)
                  setShowRejectForm(false)
                }}
                disabled={!rejectReason.trim()}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Send rejection
              </button>
            </div>
          )}
        </>
      )}
    </article>
  )
}

function AgreementReviewCard({
  agreement,
  vendorId,
}: {
  agreement: VendorReviewProps['agreement']
  vendorId: string
}) {
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!agreement?.signatureImagePath) return
    let cancelled = false
    generateSignedUrl(agreement.signatureImagePath).then((res) => {
      if (cancelled) return
      if (res.ok) setSignatureUrl(res.url)
    })
    return () => {
      cancelled = true
    }
  }, [agreement?.signatureImagePath])

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
      <header className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center shrink-0">
          <FileSignature className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold text-gray-900">
              Vendor agreement
            </h2>
            {agreement ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Signed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                Not signed
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Mkataba wa Watoa Huduma · the binding e-signature, separate from the
            Vendor Vows pledge.
          </p>
        </div>
      </header>

      {!agreement ? (
        <p className="text-sm text-gray-500 italic">
          Vendor hasn&rsquo;t signed the agreement yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="space-y-1.5 text-xs text-gray-700">
            <li>
              <span className="text-gray-400">Version:</span>{' '}
              <span className="font-mono">{agreement.version}</span>
            </li>
            <li>
              <span className="text-gray-400">Signed name:</span>{' '}
              <span className="font-semibold">{agreement.signedFullName}</span>
            </li>
            <li>
              <span className="text-gray-400">Signed at:</span>{' '}
              {new Date(agreement.signedAt).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </li>
            {agreement.signedIp && (
              <li>
                <span className="text-gray-400">IP:</span>{' '}
                <span className="font-mono">{agreement.signedIp}</span>
              </li>
            )}
            {agreement.signedUserAgent && (
              <li className="break-words">
                <span className="text-gray-400">User-agent:</span>{' '}
                <span className="font-mono text-[11px] text-gray-500">
                  {agreement.signedUserAgent}
                </span>
              </li>
            )}
            <li className="pt-2 border-t border-gray-100">
              <span className="text-gray-400">Body hash (SHA-256):</span>{' '}
              <span className="font-mono text-[11px] text-gray-500 break-all">
                {agreement.textHash}
              </span>
            </li>
          </ul>

          {/* Drawn signature image, if the vendor opted to draw */}
          {signatureUrl ? (
            <div className="self-start">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Drawn signature
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signatureUrl}
                alt="Vendor's drawn signature"
                className="block w-48 h-auto rounded-lg border border-gray-200 bg-white"
              />
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 italic self-end">
              Vendor signed by typed name only (no canvas drawing).
            </p>
          )}
        </div>
      )}
    </article>
  )
}

function isVendorPayoutMethodType(
  value: string | null | undefined
): value is VendorPayoutMethodType {
  return PAYOUT_METHOD_OPTIONS.some((option) => option.value === value)
}

function isVendorPayoutStatus(
  value: string | null | undefined
): value is VendorPayoutStatus {
  return PAYOUT_STATUS_OPTIONS.some((option) => option.value === value)
}

function formatPayoutAccountNumber(
  payout: NonNullable<VendorReviewProps['payout']>
): string {
  if (!MOBILE_PAYOUT_METHODS.has(payout.methodType)) {
    return payout.accountNumber
  }

  return formatTzPhone(payout.accountNumber) ?? payout.accountNumber
}

function formatTzPhone(raw: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('+')) return trimmed
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return trimmed
  if (digits.startsWith('255')) return `+255 ${digits.slice(3)}`
  if (digits.startsWith('0')) return `+255 ${digits.slice(1)}`
  return `+255 ${digits}`
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

function SidePanel({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5">
      <header className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-gray-500" strokeWidth={1.75} />
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </header>
      {children}
    </section>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-gray-900 font-medium mt-0.5">{children}</dd>
    </div>
  )
}

function formatRelative(iso: string): string {
  const d = new Date(iso)
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60_000)
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
