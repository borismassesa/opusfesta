'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { OptionCard } from '@/components/onboard/OptionCard'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { VENDOR_CATEGORIES, findCategory } from '@/lib/onboarding/categories'

export default function CategoryPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()

  const selectedCategory = hydrated ? findCategory(draft.categoryId) : undefined
  const needsDetail = Boolean(selectedCategory?.requiresDetail)
  const detailReady = draft.customCategory.trim().length > 0

  const select = (id: string) => {
    const cat = findCategory(id)
    if (cat?.requiresDetail) {
      // Stay on this step — the vendor must tell us what they do before
      // continuing. Keep any text they already typed for this selection.
      update({ categoryId: id })
      return
    }
    update({ categoryId: id, customCategory: '' })
    router.push('/onboard/vows')
  }

  const continueWithDetail = () => {
    if (!detailReady) return
    update({ customCategory: draft.customCategory.trim() })
    router.push('/onboard/vows')
  }

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

          {needsDetail ? (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50/60 p-5 lg:p-6">
              <label
                htmlFor="custom-category"
                className="block text-sm font-semibold text-gray-900"
              >
                What does your business do?
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Tell us your category so we can place you correctly — e.g.
                decor, security, MC services, photo booths, event lighting.
              </p>
              <input
                id="custom-category"
                type="text"
                value={draft.customCategory}
                onChange={(e) => update({ customCategory: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') continueWithDetail()
                }}
                placeholder="e.g. MC & event hosting"
                maxLength={80}
                autoFocus
                className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              <button
                type="button"
                onClick={continueWithDetail}
                disabled={!detailReady}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Continue <span aria-hidden>→</span>
              </button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
