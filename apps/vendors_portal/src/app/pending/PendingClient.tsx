'use client'

import Link from 'next/link'
import { SignOutButton } from '@clerk/nextjs'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarCheck,
  Check,
  ClipboardList,
  Clock,
  FileSignature,
  FileText,
  Heart,
  LogOut,
  type LucideIcon,
  Mail,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  XCircle,
} from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

export type PendingVariant =
  | 'no-application'
  | 'application-in-progress'
  | 'verification-pending'
  | 'admin-review'
  | 'needs-corrections'
  | 'suspended'
  | 'no-env'

type StepStatus = 'done' | 'current' | 'upcoming'

// Each step carries its own tone so the timeline is visually scannable: active
// work is purple, document upload is blue, money setup is emerald, etc.
// The same tone drives both the `current` (filled, vibrant) and `upcoming`
// (faded, outlined) renderings, while `done` is always universal emerald + check.
type StepTone =
  | 'purple'    // application, vendor agreement
  | 'blue'      // business / document verification
  | 'emerald'   // payout, money — also "Approved" terminal state
  | 'amber'     // "Under review" waiting state
  | 'rose'      // "Needs corrections" / failures

type Step = {
  icon: LucideIcon
  title: string
  description: string
  status: StepStatus
  tone: StepTone
  // Optional override for the status pill text. Defaults to the tone-driven
  // CURRENT_TAG_LABEL ("In progress" / "Awaiting review" / "Needs fix").
  currentLabel?: string
}

/**
 * Per-artifact verification snapshot fed in by /pending so the timeline can
 * reflect actual progress (which doc is uploaded + its review status) rather
 * than rendering all three middle steps as "In progress" at once.
 */
export type VerificationProgress = {
  tin: { status: 'pending_review' | 'approved' | 'rejected' } | null
  license: { status: 'pending_review' | 'approved' | 'rejected' } | null
  agreementSigned: boolean
}

type Perk = {
  icon: LucideIcon
  title: string
  description: string
}

type Badge = { label: string; tone: 'amber' | 'purple' | 'emerald' | 'rose' | 'gray' }

type VariantContent = {
  badge: Badge | null
  headline: string
  subhead: string
  eta: string | null
  primaryCta: { label: string; href: string } | null
  secondaryHint: string | null
  steps: Step[]
  perks: Perk[] | null
}

// Sales pitch shown only on the `no-application` variant. Once a vendor has
// committed (started the application), perks become noise — they've already
// decided. Keep this list short, concrete, and Tanzania-specific. Anything
// that sounds like "Stripe lite for the West" is the wrong frame.
const PERKS: Perk[] = [
  {
    icon: Heart,
    title: 'Couples actively booking',
    description:
      'Real, qualified inquiries — pre-screened by budget, event date, region, and category. No cold leads, no aggregator spam.',
  },
  {
    icon: Wallet,
    title: 'Mobile money payouts in TZS',
    description:
      'M-Pesa, Airtel Money, Tigo Pesa, or Lipa Namba. Deposits release within 24 hours of booking confirmation — no chasing payments on WhatsApp.',
  },
  {
    icon: BadgeCheck,
    title: 'OpusFesta-Verified badge',
    description:
      'The trust signal couples look for. Verified vendors get more inquiries than unverified ones — your TIN and business docs do the heavy lifting.',
  },
  {
    icon: Search,
    title: 'Featured placement & reach',
    description:
      'Appear in category listings, search, featured carousels, and our weekly newsletter — in front of thousands of couples planning weddings across Tanzania.',
  },
  {
    icon: CalendarCheck,
    title: 'Bookings, contracts & deposits',
    description:
      'Quote → contract → deposit → confirm → balance, all in one place. Reschedule rules and cancellation policies built in.',
  },
  {
    icon: TrendingUp,
    title: 'Free to list, pay only when you book',
    description:
      'No subscription, no setup fee. We earn a flat commission only when you confirm a booking — your downside is zero.',
  },
]

// Step factories — keep titles consistent across variants while letting copy
// shift based on what's already done. Each step's tone is fixed so a vendor
// looking at any variant sees the same color associated with each phase.
const STEPS = {
  application: (status: StepStatus, copy: string): Step => ({
    icon: ClipboardList,
    title: 'Application',
    description: copy,
    status,
    tone: 'purple',
  }),
  businessDocs: (
    status: StepStatus,
    copy: string,
    tone: StepTone = 'blue',
  ): Step => ({
    icon: FileText,
    title: 'Business verification',
    description: copy,
    status,
    tone,
  }),
  payout: (
    status: StepStatus,
    copy: string,
    tone: StepTone = 'emerald',
  ): Step => ({
    icon: Banknote,
    title: 'Payout setup',
    description: copy,
    status,
    tone,
  }),
  agreement: (status: StepStatus, copy: string): Step => ({
    icon: FileSignature,
    title: 'Vendor agreement',
    description: copy,
    status,
    tone: 'purple',
  }),
  review: (status: StepStatus, copy: string): Step => ({
    icon: ShieldCheck,
    title: 'Under review',
    description: copy,
    status,
    tone: 'amber',
  }),
  approved: (status: StepStatus): Step => ({
    icon: BadgeCheck,
    title: 'Approved',
    description:
      'Full access to your dashboard, leads, bookings, storefront, and analytics. The “OpusFesta Verified” badge appears on your storefront.',
    status,
    tone: 'emerald',
  }),
}

const COPY: Record<PendingVariant, VariantContent> = {
  'no-application': {
    badge: null,
    headline: 'Apply to do business on OpusFesta',
    subhead:
      "OpusFesta verifies every vendor before they can take bookings. Tell us about your business, share your TIN and a few documents, and our team will review and approve your storefront — usually within 2–3 business days.",
    eta: null,
    primaryCta: { label: 'Start vendor application', href: '/onboard' },
    secondaryHint: 'Already invited by OpusFesta? Sign in with the same email.',
    // All steps are `upcoming` — the vendor hasn't started anything yet, so
    // marking Application as `current` would falsely advertise progress. The
    // hero CTA above carries the action prompt; the timeline here is a
    // map-of-the-journey, not a status indicator.
    steps: [
      STEPS.application(
        'upcoming',
        'Tell us about your business — category, services, packages, portfolio, and pricing in TZS.',
      ),
      STEPS.businessDocs(
        'upcoming',
        'Upload your TRA TIN certificate and a business license or sole-proprietor declaration.',
      ),
      STEPS.payout(
        'upcoming',
        'Add a payout method — M-Pesa, Airtel Money, Tigo Pesa, Lipa Namba, or a Tanzanian bank.',
      ),
      STEPS.agreement(
        'upcoming',
        'Read and e-sign the vendor agreement (commission, cancellation, and conduct terms).',
      ),
      STEPS.review(
        'upcoming',
        'Our team verifies your details and portfolio. Most vendors hear back within 2–3 business days.',
      ),
      STEPS.approved('upcoming'),
    ],
    perks: PERKS, // sales pitch — only on the no-application screen
  },
  'application-in-progress': {
    badge: { label: 'Almost there', tone: 'purple' },
    headline: 'Pick up where you left off',
    subhead:
      "You started your vendor application but haven't submitted yet. Finish the remaining sections so we can move you to verification.",
    eta: null,
    primaryCta: { label: 'Continue application', href: '/onboard' },
    secondaryHint: null,
    steps: [
      STEPS.application(
        'current',
        'Complete the about, services, packages, payout, and portfolio sections, then submit.',
      ),
      STEPS.businessDocs(
        'upcoming',
        'Upload your TIN certificate and business license / sole-proprietor declaration.',
      ),
      STEPS.payout(
        'upcoming',
        'Confirm a payout method — name on the account must match your TIN.',
      ),
      STEPS.agreement(
        'upcoming',
        'E-sign the vendor agreement to complete your submission.',
      ),
      STEPS.review(
        'upcoming',
        'Our team will verify your details once everything is submitted — usually within 2–3 business days.',
      ),
      STEPS.approved('upcoming'),
    ],
    perks: null,
  },
  'verification-pending': {
    badge: { label: 'Verification needed', tone: 'amber' },
    headline: 'A few more documents to verify your business',
    subhead:
      "Your application is in. Now upload the documents that prove your business is legitimate so couples on OpusFesta can trust you.",
    eta: null,
    primaryCta: { label: 'Upload documents', href: '/verify' },
    secondaryHint: null,
    steps: [
      STEPS.application(
        'done',
        'Application submitted — business details, services, and portfolio captured.',
      ),
      STEPS.businessDocs(
        'current',
        "Upload your TRA TIN certificate and either a BRELA business license or a sole-proprietor declaration. JPG, PNG, or PDF up to 10MB.",
      ),
      STEPS.payout(
        'current',
        "Confirm a payout method. The account holder name must match the name on your TIN certificate, or payouts will be rejected at booking time.",
      ),
      STEPS.agreement(
        'current',
        'Read and e-sign the OpusFesta vendor agreement — commission, cancellation, refunds, and content policy.',
      ),
      STEPS.review(
        'upcoming',
        'Our team will manually verify each document and respond within 2–3 business days.',
      ),
      STEPS.approved('upcoming'),
    ],
    perks: null,
  },
  'admin-review': {
    badge: null,
    headline: "We're reviewing your application",
    subhead:
      "Thanks for submitting everything. Our team is verifying your TIN, business documents, payout details, and portfolio. You'll get an email the moment your dashboard unlocks.",
    eta: 'Most vendors are approved within 2–3 business days. We may email you for clarifications.',
    primaryCta: null,
    secondaryHint: null,
    steps: [
      STEPS.application('done', 'Application submitted with all required details.'),
      STEPS.businessDocs(
        'done',
        'TIN certificate and business license received and queued for review.',
      ),
      STEPS.payout(
        'done',
        'Payout method recorded. Final name match happens during admin review.',
      ),
      STEPS.agreement(
        'done',
        'Vendor agreement e-signed and timestamped.',
      ),
      STEPS.review(
        'current',
        "OpusFesta team is verifying your documents and portfolio. We'll reach out by email if anything needs clarifying.",
      ),
      STEPS.approved('upcoming'),
    ],
    perks: null,
  },
  'needs-corrections': {
    badge: { label: 'Action required', tone: 'rose' },
    headline: 'A few items need your attention',
    subhead:
      "Our review team flagged something on your application. Open the details below to see exactly what to fix — once you re-submit, we'll review again right away.",
    eta: null,
    primaryCta: { label: 'View what to fix', href: '/verify' },
    secondaryHint: 'Re-reviews are typically completed within 1 business day.',
    steps: [
      STEPS.application('done', 'Application submitted.'),
      STEPS.businessDocs(
        'current',
        'One or more documents need to be re-uploaded or corrected. Open Verify to see admin notes per document.',
        'rose',
      ),
      STEPS.payout(
        'current',
        'If the account name does not match your TIN, update the payout method to match exactly.',
        'rose',
      ),
      STEPS.agreement('done', 'Vendor agreement e-signed.'),
      STEPS.review(
        'upcoming',
        'Once you submit corrections, our team will re-review within 1 business day.',
      ),
      STEPS.approved('upcoming'),
    ],
    perks: null,
  },
  suspended: {
    badge: { label: 'Account suspended', tone: 'rose' },
    headline: 'Your vendor account is currently suspended',
    subhead:
      'Bookings, leads, and storefront access are paused. If you believe this is a mistake or want to appeal, contact OpusFesta support — we respond within 1 business day.',
    eta: null,
    primaryCta: null,
    secondaryHint: null,
    steps: [],
    perks: null,
  },
  'no-env': {
    badge: { label: 'Dev environment', tone: 'gray' },
    headline: 'Vendor backend not connected',
    subhead:
      "Supabase env vars are missing locally, so the portal can't resolve your vendor row. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to continue.",
    eta: null,
    primaryCta: null,
    secondaryHint: null,
    steps: [],
    perks: null,
  },
}

const BADGE_TONE: Record<Badge['tone'], string> = {
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  purple: 'bg-[#F0DFF6] text-[#7E5896] border-[#E0C7E8]',
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
}

// State, not step identity, drives the indicator color. Done is universally
// emerald + check. Current is filled in the step's tone (the only place tone
// surfaces visually). Upcoming is uniformly neutral so the timeline doesn't
// read as a rainbow of competing brand colors.
const CURRENT_TONE: Record<StepTone, string> = {
  purple: 'bg-[#7E5896] text-white',
  blue: 'bg-blue-600 text-white',
  emerald: 'bg-emerald-600 text-white',
  amber: 'bg-amber-500 text-white',
  rose: 'bg-rose-500 text-white',
}

// Title text on `current` rows picks up the tone — subtle accent that reads as
// "this is the active step" without painting the whole indicator chip.
const CURRENT_TEXT: Record<StepTone, string> = {
  purple: 'text-[#7E5896]',
  blue: 'text-blue-700',
  emerald: 'text-emerald-700',
  amber: 'text-amber-800',
  rose: 'text-rose-700',
}

const CURRENT_TAG_LABEL: Record<StepTone, string> = {
  purple: 'In progress',
  blue: 'In progress',
  emerald: 'In progress',
  amber: 'Awaiting review',
  rose: 'Needs fix',
}

const CURRENT_TAG_TONE: Record<StepTone, string> = {
  purple: 'bg-[#7E5896] text-white',
  blue: 'bg-blue-600 text-white',
  emerald: 'bg-emerald-600 text-white',
  amber: 'bg-amber-500 text-white',
  rose: 'bg-rose-500 text-white',
}

/**
 * Build the timeline steps for verification-pending / needs-corrections,
 * collapsing real per-artifact state into the fixed 6-step timeline.
 *
 * Rules:
 *   - Application: always done (we're in this state because submit succeeded).
 *   - Business verification: done once both TIN and license are uploaded;
 *     otherwise current. Tone goes rose if any uploaded doc was rejected,
 *     amber if all submitted are pending review, blue otherwise.
 *   - Payout setup: always done — submit() persisted the row from /onboard.
 *   - Vendor agreement: done if signed; otherwise current (purple "Sign now").
 *   - Under review / Approved: upcoming until admin_review fires.
 */
function buildVerificationSteps(
  progress: VerificationProgress,
  variant: 'verification-pending' | 'needs-corrections',
): Step[] {
  const tinDone =
    !!progress.tin && progress.tin.status !== 'rejected'
  const licenseDone =
    !!progress.license && progress.license.status !== 'rejected'
  const businessAllDone = tinDone && licenseDone

  const anyRejected =
    progress.tin?.status === 'rejected' ||
    progress.license?.status === 'rejected'
  const allUploadedPending =
    progress.tin?.status === 'pending_review' &&
    progress.license?.status === 'pending_review'

  // Pick the right pill label for the business-verification step.
  let businessTone: StepTone = 'blue'
  let businessLabel: string | undefined
  if (anyRejected) {
    businessTone = 'rose'
    businessLabel = 'Needs fix'
  } else if (allUploadedPending) {
    businessTone = 'amber'
    businessLabel = 'Awaiting review'
  } else if (progress.tin || progress.license) {
    businessLabel = '1 of 2 uploaded'
  }

  const businessStep: Step = businessAllDone
    ? STEPS.businessDocs(
        'done',
        anyRejected
          ? 'One or more documents need to be re-uploaded — see /verify for admin notes.'
          : 'TIN certificate and business license uploaded.',
        businessTone,
      )
    : {
        ...STEPS.businessDocs(
          'current',
          progress.tin && !progress.license
            ? 'Business license is still missing. Upload BRELA registration or a sole-proprietor declaration.'
            : !progress.tin && progress.license
              ? 'TIN certificate is still missing. Upload a photo or PDF of your TRA TIN certificate.'
              : 'Upload your TRA TIN certificate and either a BRELA business license or a sole-proprietor declaration.',
          businessTone,
        ),
        currentLabel: businessLabel,
      }

  const agreementStep: Step = progress.agreementSigned
    ? STEPS.agreement('done', 'Vendor agreement e-signed and timestamped.')
    : STEPS.agreement(
        'current',
        variant === 'needs-corrections'
          ? 'Re-confirm the agreement only if admin asked for corrections — see /verify for details.'
          : 'Read and e-sign the OpusFesta vendor agreement (commission, cancellation, refunds, conduct terms).',
      )

  return [
    STEPS.application(
      'done',
      'Application submitted — business details, services, and portfolio captured.',
    ),
    businessStep,
    STEPS.payout(
      'done',
      'Payout method recorded. Final name match happens during admin review.',
    ),
    agreementStep,
    STEPS.review(
      'upcoming',
      "Once everything's submitted, our team will review and respond within 2–3 business days.",
    ),
    STEPS.approved('upcoming'),
  ]
}

export default function PendingClient({
  variant,
  progress,
}: {
  variant: PendingVariant
  progress: VerificationProgress | null
}) {
  const baseCopy = COPY[variant]
  // Splice in real per-step status when we have verification progress data.
  // The base variant copy is the fallback for variants that don't surface
  // per-artifact state (no-application, application-in-progress, admin-review,
  // suspended, no-env).
  const copy =
    progress &&
    (variant === 'verification-pending' || variant === 'needs-corrections')
      ? { ...baseCopy, steps: buildVerificationSteps(progress, variant) }
      : baseCopy
  const isSuspended = variant === 'suspended'
  const isNeedsCorrections = variant === 'needs-corrections'

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF7FC] via-[#FDFDFD] to-[#FDFDFD] flex flex-col">
      <header className="px-6 sm:px-10 py-5 border-b border-gray-100/80 bg-white/70 backdrop-blur flex items-center justify-between">
        <Link href="/" aria-label="OpusFesta home" className="block">
          <Logo className="h-7 w-auto" />
        </Link>
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

      <main className="flex-1 px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="text-center">
            {copy.badge && (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] px-3 py-1.5 rounded-full border',
                  BADGE_TONE[copy.badge.tone],
                )}
              >
                {isSuspended || isNeedsCorrections ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                {copy.badge.label}
              </span>
            )}
            <h1
              className={cn(
                'text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight leading-[1.1]',
                copy.badge ? 'mt-5' : '',
              )}
            >
              {copy.headline}
            </h1>
            <p className="mt-4 text-base text-gray-600 leading-relaxed max-w-xl mx-auto">
              {copy.subhead}
            </p>
            {copy.primaryCta && (
              <Link
                href={copy.primaryCta.href}
                className="mt-7 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold pl-6 pr-5 py-3 rounded-full transition-colors shadow-sm"
              >
                {copy.primaryCta.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            {copy.secondaryHint && (
              <p className="mt-3 text-xs text-gray-500">{copy.secondaryHint}</p>
            )}
          </div>

          {/* Suspended: dedicated contact card, no timeline */}
          {isSuspended && (
            <section className="mt-10 bg-white rounded-3xl border border-rose-100 shadow-[0_2px_24px_-8px_rgba(244,63,94,0.12)] p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-gray-900">
                    Need to appeal or get this lifted?
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                    Email{' '}
                    <a
                      href="mailto:vendors@opusfesta.com"
                      className="font-semibold text-gray-900 underline underline-offset-2"
                    >
                      vendors@opusfesta.com
                    </a>{' '}
                    with your business name and any context. The team responds
                    within one business day.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Progress timeline */}
          {copy.steps.length > 0 && (
            <section className="mt-10 sm:mt-12 bg-white rounded-3xl border border-gray-100 shadow-[0_2px_24px_-8px_rgba(98,52,128,0.08)] p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-3 mb-6">
                <h2 className="text-base font-semibold text-gray-900">
                  Your verification journey
                </h2>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  {copy.steps.filter((s) => s.status === 'done').length}/
                  {copy.steps.length} complete
                </span>
              </div>

              <ol className="relative" aria-label="Verification progress">
                {copy.steps.map((step, idx) => {
                  const isLast = idx === copy.steps.length - 1
                  const nextStep = copy.steps[idx + 1]
                  // Connector segment is "complete" when the current step is
                  // done — once you've cleared a gate, the line below it
                  // colors in.
                  const connectorIsDone = step.status === 'done'
                  return (
                    <li
                      key={idx}
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
                              : nextStep?.status === 'current'
                                ? 'bg-gray-300'
                                : 'bg-gray-200',
                          )}
                          aria-hidden
                        />
                      )}

                      <span
                        className={cn(
                          'relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                          step.status === 'done' &&
                            'bg-emerald-500 text-white',
                          step.status === 'current' &&
                            CURRENT_TONE[step.tone],
                          step.status === 'upcoming' &&
                            'bg-white border border-gray-200 text-gray-300',
                        )}
                        aria-hidden
                      >
                        {step.status === 'done' ? (
                          <Check className="w-4 h-4" strokeWidth={2.5} />
                        ) : (
                          <step.icon
                            className="w-4 h-4"
                            strokeWidth={step.status === 'current' ? 2 : 1.75}
                          />
                        )}
                      </span>

                      <div className="pt-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={cn(
                              'text-sm font-semibold',
                              step.status === 'upcoming' && 'text-gray-400',
                              step.status === 'current' &&
                                CURRENT_TEXT[step.tone],
                              step.status === 'done' && 'text-gray-900',
                            )}
                          >
                            {step.title}
                          </h3>
                          {step.status === 'current' && (
                            <span
                              className={cn(
                                'inline-flex items-center text-[10px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded',
                                CURRENT_TAG_TONE[step.tone],
                              )}
                            >
                              {step.currentLabel ?? CURRENT_TAG_LABEL[step.tone]}
                            </span>
                          )}
                          {step.status === 'done' && (
                            <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-emerald-700">
                              Done
                            </span>
                          )}
                        </div>
                        <p
                          className={cn(
                            'mt-1 text-sm leading-relaxed',
                            step.status === 'upcoming'
                              ? 'text-gray-400'
                              : 'text-gray-600',
                          )}
                        >
                          {step.description}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>

              {copy.eta && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50/70 border border-amber-100 px-4 py-3.5">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {copy.eta}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Why grow your business on OpusFesta — sales pitch shown only on
              the no-application screen. Past that point, perks become noise. */}
          {copy.perks && (
            <section className="mt-12 sm:mt-14">
              <div className="text-center">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7E5896]">
                  Why OpusFesta
                </span>
                <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                  Built for Tanzania&rsquo;s wedding industry
                </h2>
                <p className="mt-2 text-sm text-gray-600 max-w-xl mx-auto">
                  We pair couples with vendors they can trust, and give vendors
                  the tools to grow without the overhead.
                </p>
              </div>
              <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {copy.perks.map((perk) => (
                  <div
                    key={perk.title}
                    className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3"
                  >
                    <perk.icon
                      className="w-5 h-5 text-[#7E5896] shrink-0"
                      strokeWidth={1.75}
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {perk.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                        {perk.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <footer className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <a
                href="mailto:vendors@opusfesta.com"
                className="font-semibold text-gray-700 hover:text-gray-900 underline underline-offset-2"
              >
                vendors@opusfesta.com
              </a>
            </span>
            <span className="hidden sm:inline text-gray-300">·</span>
            <a
              href="https://wa.me/255700000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-gray-700 hover:text-gray-900"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat with us on WhatsApp
            </a>
          </footer>
        </div>
      </main>
    </div>
  )
}
