'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { OptionCard } from '@/components/onboard/OptionCard'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { VENDOR_CATEGORIES } from '@/lib/onboarding/categories'

export default function CategoryPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()

  const select = (id: string) => {
    update({ categoryId: id })
    router.push('/onboard/vows')
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
          <OnboardHeading title="What type of vendor are you?" />

          <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
            {VENDOR_CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <OptionCard
                  key={cat.id}
                  variant="plain"
                  selected={hydrated && draft.categoryId === cat.id}
                  onToggle={() => select(cat.id)}
                  label={cat.label}
                  icon={<Icon className="w-5 h-5" />}
                  hint={cat.hint}
                />
              )
            })}
          </div>

          <Link
            href="mailto:vendors@opusfesta.co?subject=New%20vendor%20category%20request"
            className="inline-flex items-center gap-2 mt-10 text-sm font-semibold text-gray-900 hover:text-gray-600"
          >
            Don’t see your category? Let us know <span aria-hidden>→</span>
          </Link>
        </div>
      </main>
    </div>
  )
}
