'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { OptionCard } from '@/components/onboard/OptionCard'
import { FieldLabel, TextArea, TextInput } from '@/components/onboard/FormField'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'
import { LANGUAGES } from '@/lib/onboarding/languages'

const MIN_BIO = 80

export default function AboutPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const category = findCategory(draft.categoryId)

  useEffect(() => {
    if (!hydrated) return
    if (!draft.categoryId) router.replace('/onboard/category')
    else if (!draft.vowsAccepted) router.replace('/onboard/vows')
  }, [hydrated, draft.categoryId, draft.vowsAccepted, router])

  const toggleLanguage = (id: string) => {
    const set = new Set(draft.languages)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    update({ languages: Array.from(set) })
  }

  const canContinue =
    draft.bio.trim().length >= MIN_BIO &&
    draft.yearsInBusiness.trim() &&
    draft.languages.length > 0

  const onNext = () => {
    if (!canContinue) return
    router.push('/onboard/details/services')
  }

  const bioLength = draft.bio.trim().length

  return (
    <OnboardShell
      step="details"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/profile/markets"
    >
      <OnboardHeading
        title="Tell couples about your work"
        description="This is the first thing couples will read on your storefront. Be specific about what makes your work yours — couples decide quickly."
      />

      <div className="space-y-8 max-w-3xl">
        <div>
          <FieldLabel required>About your business</FieldLabel>
          <TextArea
            placeholder="e.g. Editorial documentary photographer that captures atmosphere, not just moments. Based in Dar es Salaam, available across East Africa."
            value={draft.bio}
            onChange={(e) => update({ bio: e.target.value })}
            rows={6}
            hint={
              bioLength < MIN_BIO
                ? `${MIN_BIO - bioLength} more character${MIN_BIO - bioLength === 1 ? '' : 's'} to go (min ${MIN_BIO}).`
                : `${bioLength} characters — looking good.`
            }
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
          <div>
            <FieldLabel required>Years in business</FieldLabel>
            <TextInput
              placeholder="e.g. 11"
              inputMode="numeric"
              value={draft.yearsInBusiness}
              onChange={(e) =>
                update({ yearsInBusiness: e.target.value.replace(/[^\d]/g, '').slice(0, 2) })
              }
            />
          </div>
        </div>

        <div>
          <FieldLabel required>Languages spoken with clients</FieldLabel>
          <p className="text-xs text-gray-500 -mt-1 mb-3">Select all that apply.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => (
              <OptionCard
                key={lang.id}
                variant="checkbox"
                label={lang.label}
                selected={draft.languages.includes(lang.id)}
                onToggle={() => toggleLanguage(lang.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          Next step
        </PrimaryButton>
      </div>
    </OnboardShell>
  )
}
