'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { OptionCard } from '@/components/onboard/OptionCard'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { VENDOR_CATEGORIES, OTHER_CATEGORY } from '@/lib/onboarding/categories'

export default function CategoryPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const [customLabel, setCustomLabel] = useState(draft.customCategoryLabel ?? '')

  const select = (id: string) => {
    if (id !== 'other') {
      update({ categoryId: id, customCategoryLabel: '' })
      router.push('/onboard/vows')
    } else {
      update({ categoryId: 'other' })
    }
  }

  const confirmOther = () => {
    const label = customLabel.trim()
    if (!label) return
    update({ categoryId: 'other', customCategoryLabel: label })
    router.push('/onboard/vows')
  }

  const isOtherSelected = hydrated && draft.categoryId === 'other'

  return (
    <div className="min-h-screen bg-white text-gray-900">
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

          <div className="mt-3 lg:mt-4">
            {(() => {
              const Icon = OTHER_CATEGORY.icon
              return (
                <OptionCard
                  variant="plain"
                  selected={isOtherSelected}
                  onToggle={() => select('other')}
                  label={OTHER_CATEGORY.label}
                  icon={<Icon className="w-5 h-5" />}
                />
              )
            })()}
          </div>

          {isOtherSelected && (
            <div className="mt-4 flex flex-col gap-3">
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmOther()}
                placeholder="Describe your vendor type…"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                autoFocus
              />
              <button
                onClick={confirmOther}
                disabled={!customLabel.trim()}
                className="self-start px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
