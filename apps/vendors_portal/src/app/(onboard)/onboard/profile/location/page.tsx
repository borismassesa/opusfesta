'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { WhyWeAsk } from '@/components/onboard/WhyWeAsk'
import { FieldLabel, SelectInput, TextInput } from '@/components/onboard/FormField'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'
import { TZ_REGIONS } from '@/lib/onboarding/regions'

export default function LocationPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const category = findCategory(draft.categoryId)

  useEffect(() => {
    if (!hydrated) return
    if (!draft.categoryId) router.replace('/onboard/category')
    else if (!draft.vowsAccepted) router.replace('/onboard/vows')
  }, [hydrated, draft.categoryId, draft.vowsAccepted, router])

  const canContinue =
    draft.street.trim() && draft.city.trim() && draft.region && draft.phone.trim().length >= 9

  const onNext = () => {
    if (!canContinue) return
    router.push('/onboard/profile/contact')
  }

  return (
    <OnboardShell
      step="profile"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/profile/name"
    >
      <OnboardHeading title="Where is your business located?" />

      <div className="space-y-6 max-w-2xl">
        <div>
          <FieldLabel required>Street address</FieldLabel>
          <div className="space-y-3">
            <TextInput
              placeholder="Address"
              value={draft.street}
              onChange={(e) => update({ street: e.target.value })}
              autoComplete="address-line1"
            />
            <TextInput
              placeholder="Apartment, suite, plot — optional"
              value={draft.street2}
              onChange={(e) => update({ street2: e.target.value })}
              autoComplete="address-line2"
            />
          </div>
        </div>

        <div>
          <FieldLabel required>City / Town</FieldLabel>
          <TextInput
            placeholder="e.g. Dar es Salaam"
            value={draft.city}
            onChange={(e) => update({ city: e.target.value })}
            autoComplete="address-level2"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Region</FieldLabel>
            <SelectInput
              placeholder="Region"
              value={draft.region}
              onChange={(e) => update({ region: e.target.value })}
            >
              {TZ_REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </SelectInput>
          </div>
          <div>
            <FieldLabel>Postal code</FieldLabel>
            <TextInput
              placeholder="e.g. 11101"
              value={draft.postalCode}
              onChange={(e) => update({ postalCode: e.target.value })}
              autoComplete="postal-code"
            />
          </div>
        </div>

        <div>
          <FieldLabel required>Business phone (Tanzania)</FieldLabel>
          <TextInput
            prefix="+255"
            placeholder="754 123 456"
            value={draft.phone}
            onChange={(e) => update({ phone: e.target.value.replace(/[^\d\s]/g, '') })}
            inputMode="tel"
            autoComplete="tel-national"
          />
        </div>
      </div>

      <div className="mt-10 flex items-center gap-6 flex-wrap">
        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          Next step
        </PrimaryButton>
        <WhyWeAsk title="Why we ask for your address">
          <p>
            We use your address to set your <strong>home market</strong> and to surface your
            storefront to couples planning weddings nearby.
          </p>
          <p>
            Your full street address stays private — only your <strong>city and region</strong>{' '}
            appear on your public storefront. Your phone number is shared only after a couple sends
            you an inquiry.
          </p>
        </WhyWeAsk>
      </div>
    </OnboardShell>
  )
}
