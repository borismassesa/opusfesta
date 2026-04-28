'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { WhyWeAsk } from '@/components/onboard/WhyWeAsk'
import { FieldLabel, SelectInput, TextInput } from '@/components/onboard/FormField'
import { OptionCard } from '@/components/onboard/OptionCard'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'
import { LIPA_NAMBA_NETWORKS, PAYOUT_OPTIONS, TZ_BANKS } from '@/lib/onboarding/payouts'

export default function PayoutPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const category = findCategory(draft.categoryId)

  useEffect(() => {
    if (!hydrated) return
    if (!draft.categoryId) router.replace('/onboard/category')
    else if (!draft.vowsAccepted) router.replace('/onboard/vows')
    else if (draft.packages.length === 0) router.replace('/onboard/pricing')
    else if (!draft.cancellationLevel) router.replace('/onboard/pricing/policies')
  }, [
    hydrated,
    draft.categoryId,
    draft.vowsAccepted,
    draft.packages.length,
    draft.cancellationLevel,
    router,
  ])

  const selected = PAYOUT_OPTIONS.find((o) => o.id === draft.payoutMethod)
  const isBank = draft.payoutMethod === 'bank'
  const isLipaNamba = draft.payoutMethod === 'lipa-namba'

  const canContinue = Boolean(
    draft.payoutMethod &&
      draft.payoutNumber.trim() &&
      draft.payoutAccountName.trim() &&
      (!isBank || draft.payoutBankName.trim()) &&
      (!isLipaNamba || draft.payoutNetwork.trim()),
  )

  const onNext = () => {
    if (!canContinue) return
    router.push('/onboard/review')
  }

  return (
    <OnboardShell
      step="pricing"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/pricing/policies"
    >
      <OnboardHeading
        title="Where should we send your payouts?"
        description="OpusFesta releases the deposit when a booking confirms and the balance after the event. We support all major Tanzanian mobile money networks and any TZ bank."
      />

      <div className="space-y-10 max-w-3xl">
        {/* Method picker */}
        <section>
          <h2 className="text-base font-semibold tracking-tight text-gray-900 mb-4">
            Payout method
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {PAYOUT_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.id}
                variant="radio"
                label={opt.label}
                description={opt.hint}
                selected={draft.payoutMethod === opt.id}
                onToggle={() => update({ payoutMethod: opt.id })}
              />
            ))}
          </div>
        </section>

        {/* Method details */}
        {selected ? (
          <section className="bg-white rounded-2xl border border-gray-200 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_8px_-3px_rgba(0,0,0,0.08)] p-6 lg:p-7 space-y-5">
            <h2 className="text-base font-semibold tracking-tight text-gray-900">
              {selected.label} details
            </h2>

            {isBank ? (
              <div>
                <FieldLabel required>Bank</FieldLabel>
                <SelectInput
                  placeholder="Select bank"
                  value={draft.payoutBankName}
                  onChange={(e) => update({ payoutBankName: e.target.value })}
                >
                  {TZ_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </SelectInput>
              </div>
            ) : null}

            {isLipaNamba ? (
              <div>
                <FieldLabel required>Network</FieldLabel>
                <SelectInput
                  placeholder="Which provider issued this Lipa Namba?"
                  value={draft.payoutNetwork}
                  onChange={(e) => update({ payoutNetwork: e.target.value })}
                >
                  {LIPA_NAMBA_NETWORKS.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </SelectInput>
                <p className="mt-2 text-xs text-gray-500">
                  Your Lipa Namba is registered with one of these networks. Pick whichever issued
                  your merchant account.
                </p>
              </div>
            ) : null}

            <div>
              <FieldLabel required>{selected.numberLabel}</FieldLabel>
              <TextInput
                prefix={selected.prefix}
                placeholder={selected.numberPlaceholder}
                value={draft.payoutNumber}
                onChange={(e) =>
                  update({
                    payoutNumber:
                      isBank || isLipaNamba
                        ? e.target.value.replace(/[^\d\s-]/g, '')
                        : e.target.value.replace(/[^\d\s]/g, ''),
                  })
                }
                inputMode={isBank || isLipaNamba ? 'numeric' : 'tel'}
              />
              {isLipaNamba ? (
                <p className="mt-2 text-xs text-gray-500">
                  Usually 5–7 digits. You’ll find it on your M-Pesa for Business / merchant
                  statement.
                </p>
              ) : null}
            </div>

            <div>
              <FieldLabel required>Account holder / business name</FieldLabel>
              <TextInput
                placeholder="As registered with your provider"
                value={draft.payoutAccountName}
                onChange={(e) => update({ payoutAccountName: e.target.value })}
                autoComplete="name"
              />
              <p className="mt-2 text-xs text-gray-500">
                Must match the name registered with{' '}
                {isBank
                  ? 'your bank'
                  : isLipaNamba
                    ? 'your merchant account'
                    : 'your mobile money provider'}
                , or payouts will be rejected.
              </p>
            </div>
          </section>
        ) : null}
      </div>

      <div className="mt-10 flex items-center gap-6 flex-wrap">
        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          Next step
        </PrimaryButton>
        <WhyWeAsk title="When and how do payouts work?">
          <p>
            We hold each booking’s funds in escrow. The <strong>deposit</strong> is released to
            your account within 24 hours of the couple confirming, and the <strong>balance</strong>{' '}
            is released within 48 hours after the event.
          </p>
          <p>
            Mobile money payouts arrive instantly. Bank transfers take 1–2 business days. We never
            charge a payout fee — TZS in, TZS out.
          </p>
        </WhyWeAsk>
      </div>
    </OnboardShell>
  )
}
