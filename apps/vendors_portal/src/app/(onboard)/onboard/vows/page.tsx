'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Logo from '@/components/ui/Logo'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { WhyWeAsk } from '@/components/onboard/WhyWeAsk'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { VENDOR_VOWS } from '@/lib/onboarding/vows'

export default function VowsPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()

  useEffect(() => {
    if (hydrated && !draft.categoryId) router.replace('/onboard/category')
  }, [hydrated, draft.categoryId, router])

  const accept = () => {
    update({ vowsAccepted: true })
    router.push('/onboard/profile/name')
  }

  return (
    <div className="min-h-screen bg-[#F5F4F1] text-gray-900">
      <header className="bg-white border-b border-gray-100">
        <div className="px-6 lg:px-12 py-4 flex items-center">
          <Link href="/" aria-label="OpusFesta home" className="shrink-0">
            <Logo className="h-7 w-auto text-gray-900" />
          </Link>
        </div>
      </header>

      <main className="px-6 lg:px-12 py-10 lg:py-14">
        <div className="max-w-3xl mx-auto pb-24">
          <OnboardHeading
            title="Before we start, meet our Vendor Vows"
            description="As an OpusFesta vendor, you pledge to uphold these values:"
          />

          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_8px_-3px_rgba(0,0,0,0.08)] p-6 lg:p-8">
            <ul className="space-y-6">
              {VENDOR_VOWS.map((vow) => (
                <li key={vow.id}>
                  <h3 className="text-base font-semibold text-gray-900">{vow.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{vow.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex items-center gap-6 flex-wrap">
            <PrimaryButton onClick={accept}>Say “I do”</PrimaryButton>
            <WhyWeAsk title="Why the Vendor Vows?">
              <p>
                The Vendor Vows are how OpusFesta keeps the marketplace a respectful, trusted space
                for every couple in Tanzania.
              </p>
              <p>
                Couples can see which vendors have signed the vows, and we may remove vendors who
                don’t uphold them. Signing is a one-time pledge — you won’t see this screen again.
              </p>
            </WhyWeAsk>
          </div>
        </div>
      </main>
    </div>
  )
}
