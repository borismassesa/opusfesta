'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  Pencil,
  Star,
} from 'lucide-react'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { Confetti } from '@/components/onboard/Confetti'
import Logo from '@/components/ui/Logo'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'
import { SERVICE_MARKETS, TZ_REGIONS } from '@/lib/onboarding/regions'
import { getServicesForCategory } from '@/lib/onboarding/services'
import { getStylesForCategory } from '@/lib/onboarding/styles'
import { PERSONALITY_OPTIONS } from '@/lib/onboarding/personality'
import { LANGUAGES } from '@/lib/onboarding/languages'
import { CANCELLATION_OPTIONS, RESCHEDULE_OPTIONS } from '@/lib/onboarding/policies'
import { LIPA_NAMBA_NETWORKS, PAYOUT_OPTIONS } from '@/lib/onboarding/payouts'
import { submitApplication } from '@/lib/onboarding/submit'

function formatTZS(raw: string) {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('en-TZ').format(Number(digits))
}

export default function ReviewPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const category = findCategory(draft.categoryId)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!hydrated) return
    if (!draft.categoryId) router.replace('/onboard/category')
    else if (!draft.vowsAccepted) router.replace('/onboard/vows')
  }, [hydrated, draft.categoryId, draft.vowsAccepted, router])

  const services = useMemo(
    () => getServicesForCategory(draft.categoryId),
    [draft.categoryId],
  )
  const styles = useMemo(() => getStylesForCategory(draft.categoryId), [draft.categoryId])

  const styleLabel = styles.find((s) => s.id === draft.style)?.label
  const personalityLabel = PERSONALITY_OPTIONS.find((p) => p.id === draft.personality)?.label
  const regionLabel = TZ_REGIONS.find((r) => r.code === draft.region)?.name
  const homeMarketLabel = SERVICE_MARKETS.find((m) => m.id === draft.homeMarket)?.name
  const extraMarketLabels = draft.serviceMarkets
    .map((id) => SERVICE_MARKETS.find((m) => m.id === id)?.name)
    .filter(Boolean) as string[]
  const allMarkets = [homeMarketLabel, ...extraMarketLabels].filter(Boolean) as string[]
  const selectedServices = draft.specialServices
    .map((id) => services.find((s) => s.id === id)?.label)
    .filter(Boolean) as string[]
  const languageLabels = draft.languages
    .map((id) => LANGUAGES.find((l) => l.id === id)?.label)
    .filter(Boolean) as string[]

  const cancellationLabel = CANCELLATION_OPTIONS.find(
    (o) => o.id === draft.cancellationLevel,
  )?.label
  const rescheduleLabel = RESCHEDULE_OPTIONS.find(
    (o) => o.id === draft.reschedulePolicy,
  )?.label
  const payoutLabel = PAYOUT_OPTIONS.find((o) => o.id === draft.payoutMethod)?.label
  const isBankPayout = draft.payoutMethod === 'bank'
  const isLipaNambaPayout = draft.payoutMethod === 'lipa-namba'
  const lipaNetworkLabel = LIPA_NAMBA_NETWORKS.find(
    (n) => n.id === draft.payoutNetwork,
  )?.label

  const fullName = [draft.firstName, draft.lastName].filter(Boolean).join(' ').trim()

  const onSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    const result = await submitApplication(draft)
    setSubmitting(false)
    if (!result.ok) {
      setSubmitError(result.error)
      return
    }
    update({ submittedAt: new Date().toISOString() })
    setSubmitted(true)
  }

  const onContinueToVerify = () => router.push('/verify')

  const startingPrice =
    draft.startingPrice ||
    (draft.packages.length > 0
      ? formatTZS(
          String(
            Math.min(
              ...draft.packages
                .map((p) => Number(p.price.replace(/[^\d]/g, '')))
                .filter((n) => Number.isFinite(n) && n > 0),
            ),
          ),
        )
      : '')

  const popularIndex = draft.packages.length === 3 ? 1 : -1

  if (submitted) {
    // Pure celebration moment — single CTA forward. We deliberately don't
    // re-list "what's next" or "what we have on file" here; both surfaces
    // already exist on /verify (action) and /pending (status) and the vendor
    // sees them seconds later. Showing the same lists twice in a row is
    // exactly what the cleanup PR is removing.
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBF7FC] via-[#FDFDFD] to-[#FDFDFD] flex flex-col">
        <Confetti active={submitted} />
        <header className="px-6 sm:px-10 py-5 border-b border-gray-100/80 bg-white/70 backdrop-blur">
          <Link href="/" aria-label="OpusFesta home" className="inline-block">
            <Logo className="h-7 w-auto" />
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
          <div className="max-w-xl w-full text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] px-3 py-1.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
              <Check className="w-3 h-3" strokeWidth={3} />
              Application complete
            </span>
            <h1 className="mt-5 text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight leading-[1.1]">
              You&rsquo;re in. Let&rsquo;s verify your business.
            </h1>
            <p className="mt-4 text-base text-gray-600 leading-relaxed max-w-md mx-auto">
              Your application is submitted. A couple more documents and our
              team can approve your storefront — usually 2–3 business days.
            </p>
            <button
              type="button"
              onClick={onContinueToVerify}
              className="group mt-8 inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold pl-6 pr-5 py-3 rounded-full transition-all shadow-[0_4px_14px_-4px_rgba(17,24,39,0.35)] hover:shadow-[0_6px_18px_-4px_rgba(17,24,39,0.45)] hover:-translate-y-px"
            >
              Continue to verification
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <p className="mt-3 text-xs text-gray-500">
              Or{' '}
              <Link
                href="/pending"
                className="font-semibold text-gray-700 hover:text-gray-900 underline underline-offset-2"
              >
                save and continue later
              </Link>{' '}
              — we&rsquo;ll email you a reminder.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <OnboardShell
      step="review"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/pricing/payout"
    >
      {/* Page heading */}
      <header className="mb-12">
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900">
          Review your storefront
        </h1>
        <p className="mt-2 text-base text-gray-600 max-w-2xl">
          Here’s everything couples will see. Make any final edits, then submit for review.
        </p>
      </header>

      {/* Sections */}
      <div className="border-t border-gray-200">
        <Section title="Profile" editHref="/onboard/profile/name">
          <Row label="Business name">{draft.businessName || '—'}</Row>
          <Row label="Category">{category?.profileLabel ?? '—'}</Row>
          <Row label="Owner">{fullName || '—'}</Row>
          <Row label="Location">
            {[draft.city, regionLabel].filter(Boolean).join(', ') || '—'}
          </Row>
          <Row label="Service area">
            {allMarkets.length > 0 ? allMarkets.join(', ') : '—'}
          </Row>
          <Row label="Phone">{draft.phone ? `+255 ${draft.phone}` : '—'}</Row>
          <Row label="WhatsApp">{draft.whatsapp ? `+255 ${draft.whatsapp}` : '—'}</Row>
          <Row label="Email">{draft.email || '—'}</Row>
        </Section>

        <Section title="Online presence" editHref="/onboard/profile/socials">
          <Row label="Instagram">
            {draft.socials.instagram ? `@${draft.socials.instagram}` : '—'}
          </Row>
          <Row label="TikTok">
            {draft.socials.tiktok ? `@${draft.socials.tiktok}` : '—'}
          </Row>
          <Row label="Facebook">{draft.socials.facebook || '—'}</Row>
          <Row label="Website">{draft.socials.website || '—'}</Row>
        </Section>

        <Section title="About" editHref="/onboard/details/about">
          <Row label="Description" valign="top">
            {draft.bio.trim() ? (
              <span className="block whitespace-pre-line">{draft.bio}</span>
            ) : (
              '—'
            )}
          </Row>
          <Row label="Years in business">{draft.yearsInBusiness || '—'}</Row>
          <Row label="Languages">
            {languageLabels.length > 0 ? languageLabels.join(', ') : '—'}
          </Row>
          <Row label="Awards & recognition" valign="top">
            {draft.awards.trim() ? (
              <span className="block whitespace-pre-line">{draft.awards}</span>
            ) : (
              '—'
            )}
          </Row>
          <Row label="Response time">
            {draft.responseTimeHours
              ? `Replies within ${draft.responseTimeHours}`
              : '—'}
          </Row>
          <Row label="Locally owned">{draft.locallyOwned ? 'Yes' : 'No'}</Row>
        </Section>

        <Section title="Style & personality" editHref="/onboard/details/style">
          <Row label="Style">{styleLabel ?? '—'}</Row>
          <Row label="Personality">{personalityLabel ?? '—'}</Row>
        </Section>

        <Section title="Special services" editHref="/onboard/details/services">
          <div className="py-4">
            {selectedServices.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedServices.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">None selected</p>
            )}
          </div>
        </Section>

        <Section
          title="Packages"
          editHref="/onboard/pricing"
          right={
            startingPrice ? (
              <span className="text-sm text-gray-600">
                Starting from{' '}
                <span className="text-gray-900 font-semibold tabular-nums">
                  TSh {startingPrice}
                </span>
              </span>
            ) : null
          }
        >
          <div className="py-4 space-y-3">
            {draft.packages.length === 0 ? (
              <p className="text-sm text-gray-500">No packages added.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {draft.packages.map((pkg, i) => (
                  <PackageRow
                    key={pkg.id}
                    name={pkg.name || 'Untitled package'}
                    price={pkg.price}
                    description={pkg.description}
                    includes={pkg.includes.filter(Boolean)}
                    popular={i === popularIndex}
                  />
                ))}
              </div>
            )}
            {draft.customQuotes ? (
              <p className="text-xs text-gray-500 italic pt-1">
                Custom quotes available on request.
              </p>
            ) : null}
          </div>
        </Section>

        <Section title="Booking policies" editHref="/onboard/pricing/policies">
          <Row label="Deposit">
            {draft.depositPercent ? `${draft.depositPercent}% to confirm` : '—'}
          </Row>
          <Row label="Cancellation">
            {cancellationLabel ?? '—'}
          </Row>
          <Row label="Reschedule">{rescheduleLabel ?? '—'}</Row>
        </Section>

        <Section title="Payout" editHref="/onboard/pricing/payout">
          <Row label="Method">{payoutLabel ?? '—'}</Row>
          {isBankPayout ? (
            <Row label="Bank">{draft.payoutBankName || '—'}</Row>
          ) : null}
          {isLipaNambaPayout ? (
            <Row label="Network">{lipaNetworkLabel ?? '—'}</Row>
          ) : null}
          <Row
            label={
              isBankPayout
                ? 'Account number'
                : isLipaNambaPayout
                  ? 'Lipa Namba'
                  : 'Number'
            }
          >
            {draft.payoutNumber
              ? isBankPayout || isLipaNambaPayout
                ? draft.payoutNumber
                : `+255 ${draft.payoutNumber}`
              : '—'}
          </Row>
          <Row label="Account holder">{draft.payoutAccountName || '—'}</Row>
        </Section>
      </div>

      {/* Sticky submit footer */}
      <div className="sticky bottom-0 -mx-6 lg:-mx-12 mt-16 bg-white/95 backdrop-blur border-t border-gray-200 px-6 lg:px-12 py-4">
        <div className="max-w-3xl mx-auto">
          {submitError ? (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-800 leading-relaxed">
                {submitError}
              </p>
            </div>
          ) : null}
          <div className="flex items-center gap-6">
            <p className="flex-1 min-w-0 text-sm text-gray-600 leading-relaxed">
              <span className="text-gray-900 font-semibold">
                Ready when you are.
              </span>{' '}
              <span className="hidden sm:inline">
                Once you submit, we&rsquo;ll ask for a couple of documents to
                verify your business.
              </span>
            </p>
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className={
                'group shrink-0 inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold pl-6 pr-5 py-3 rounded-full transition-all shadow-[0_4px_14px_-4px_rgba(17,24,39,0.35)] hover:shadow-[0_6px_18px_-4px_rgba(17,24,39,0.45)] hover:-translate-y-px disabled:shadow-none disabled:hover:translate-y-0'
              }
            >
              {submitting ? (
                <>
                  <Clock className="w-4 h-4 animate-pulse" />
                  Submitting…
                </>
              ) : (
                <>
                  Submit application
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </OnboardShell>
  )
}

function Section({
  title,
  editHref,
  right,
  children,
}: {
  title: string
  editHref: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="border-b border-gray-200 py-7">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h2 className="text-base font-semibold tracking-tight text-gray-900">{title}</h2>
        <div className="flex items-center gap-4">
          {right}
          <Link
            href={editHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Link>
        </div>
      </div>
      <dl className="divide-y divide-gray-100">{children}</dl>
    </section>
  )
}

function Row({
  label,
  children,
  valign = 'center',
}: {
  label: string
  children: React.ReactNode
  valign?: 'center' | 'top'
}) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-6 py-3 ${valign === 'top' ? 'items-start' : 'items-center'}`}
    >
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 leading-relaxed">{children}</dd>
    </div>
  )
}

function PackageRow({
  name,
  price,
  description,
  includes,
  popular,
}: {
  name: string
  price: string
  description: string
  includes: string[]
  popular: boolean
}) {
  return (
    <div
      className={
        popular
          ? 'relative bg-white rounded-lg border-2 border-gray-900 p-4'
          : 'relative bg-white rounded-lg border border-gray-200 p-4'
      }
    >
      {popular ? (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-gray-900 text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap">
          <Star className="w-2.5 h-2.5 fill-current" />
          Popular
        </span>
      ) : null}
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
      </div>
      <p className="text-lg font-semibold text-gray-900 tabular-nums tracking-tight">
        {price ? `TSh ${price}` : '—'}
      </p>
      {description ? (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      ) : null}
      {includes.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-xs text-gray-700">
          {includes.map((item, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" strokeWidth={3} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

