'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { WhyWeAsk } from '@/components/onboard/WhyWeAsk'
import { FieldLabel, TextInput } from '@/components/onboard/FormField'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'
import { useOnboardT } from '@/lib/onboarding/strings'

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
const phoneDigits = (s: string) => s.replace(/\D/g, '')

export default function ContactPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const { user } = useUser()
  const { t } = useOnboardT()
  const category = findCategory(draft.categoryId)

  useEffect(() => {
    if (!hydrated) return
    if (!draft.categoryId) router.replace('/onboard/category')
    else if (!draft.vowsAccepted) router.replace('/onboard/vows')
    else if (!draft.district) router.replace('/onboard/profile/location')
  }, [hydrated, draft.categoryId, draft.vowsAccepted, draft.district, router])

  // Prefill the Business email with the account (Clerk) email the vendor signed
  // up with — they can still change it. Guarded with a ref so an email they
  // deliberately clear isn't re-filled.
  const emailPrefilled = useRef(false)

  useEffect(() => {
    if (!hydrated || emailPrefilled.current) return
    const accountEmail = user?.primaryEmailAddress?.emailAddress
    if (accountEmail && !draft.email.trim()) {
      emailPrefilled.current = true
      update({ email: accountEmail })
    }
  }, [hydrated, user, draft.email, update])

  // WhatsApp defaults to the business phone entered just above. The checkbox
  // starts checked; a returning vendor who saved a distinct WhatsApp number
  // starts unchecked so their value isn't overwritten.
  const [sameAsPhone, setSameAsPhone] = useState(true)
  const sameInit = useRef(false)
  useEffect(() => {
    if (!hydrated || sameInit.current) return
    sameInit.current = true
    if (draft.whatsapp.trim() && draft.whatsapp !== draft.phone) {
      setSameAsPhone(false)
    }
  }, [hydrated, draft.whatsapp, draft.phone])

  // Keep WhatsApp mirrored to the business phone while "same as phone" is on.
  useEffect(() => {
    if (!hydrated || !sameAsPhone) return
    if (draft.whatsapp !== draft.phone) update({ whatsapp: draft.phone })
  }, [hydrated, sameAsPhone, draft.phone, draft.whatsapp, update])

  const whatsappValue = sameAsPhone ? draft.phone : draft.whatsapp
  const canContinue =
    isValidEmail(draft.email) &&
    phoneDigits(draft.phone).length >= 9 &&
    phoneDigits(whatsappValue).length >= 9

  const onNext = () => {
    if (!canContinue) return
    router.push('/onboard/profile/socials')
  }

  return (
    <OnboardShell
      step="profile"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/profile/location"
      primaryAction={
        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          {t('common.next_step')}
        </PrimaryButton>
      }
    >
      <OnboardHeading
        title={t('profile.contact.title')}
        description={t('profile.contact.subtitle')}
      />

      <div className="space-y-6">
        <div>
          <FieldLabel required>{t('profile.contact.email.label')}</FieldLabel>
          <TextInput
            type="email"
            inputMode="email"
            placeholder={t('profile.contact.email.placeholder')}
            value={draft.email}
            onChange={(e) => update({ email: e.target.value })}
            autoComplete="email"
          />
          <p className="mt-2 text-xs text-gray-500">
            {t('profile.contact.email.hint')}
          </p>
        </div>

        <div>
          <FieldLabel required>{t('profile.location.phone.label')}</FieldLabel>
          <TextInput
            prefix="+255"
            placeholder={t('profile.location.phone.placeholder')}
            value={draft.phone}
            onChange={(e) => update({ phone: e.target.value.replace(/[^\d\s]/g, '') })}
            inputMode="tel"
            autoComplete="tel-national"
          />
        </div>

        <div>
          <FieldLabel required>{t('profile.contact.whatsapp.label')}</FieldLabel>
          <TextInput
            prefix="+255"
            placeholder={t('profile.contact.whatsapp.placeholder')}
            value={whatsappValue}
            onChange={(e) => update({ whatsapp: e.target.value.replace(/[^\d\s]/g, '') })}
            inputMode="tel"
            autoComplete="tel-national"
            disabled={sameAsPhone}
          />
          <label className="mt-3 flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
            <input
              type="checkbox"
              checked={sameAsPhone}
              onChange={(e) => setSameAsPhone(e.target.checked)}
              className="w-4 h-4 accent-gray-900"
            />
            {t('profile.contact.same_as_phone')}
          </label>
        </div>
      </div>

      <div className="mt-10">
        <WhyWeAsk title={t('profile.contact.why.title')}>
          <p>{t('profile.contact.why.body1')}</p>
          <p>{t('profile.contact.why.body2')}</p>
        </WhyWeAsk>
      </div>
    </OnboardShell>
  )
}
