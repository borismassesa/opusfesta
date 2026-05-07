'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { OptionCard } from '@/components/onboard/OptionCard'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { WhyWeAsk } from '@/components/onboard/WhyWeAsk'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'
import { SERVICE_MARKETS, TZ_REGIONS, homeMarketForRegion } from '@/lib/onboarding/regions'

export default function MarketsPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const category = findCategory(draft.categoryId)

  const homeMarketId = useMemo(() => homeMarketForRegion(draft.region), [draft.region])
  const homeMarket = SERVICE_MARKETS.find((m) => m.id === homeMarketId)
  const regionLabel = TZ_REGIONS.find((r) => r.code === draft.region)?.name

  useEffect(() => {
    if (!hydrated) return
    if (!draft.categoryId) {
      router.replace('/onboard/category')
      return
    }
    if (!draft.vowsAccepted) {
      router.replace('/onboard/vows')
      return
    }
    if (!draft.region) {
      router.replace('/onboard/profile/location')
      return
    }
    if (draft.homeMarket !== homeMarketId) {
      update({ homeMarket: homeMarketId })
    }
  }, [
    hydrated,
    draft.categoryId,
    draft.vowsAccepted,
    draft.region,
    draft.homeMarket,
    homeMarketId,
    router,
    update,
  ])

  const toggleMarket = (id: string) => {
    if (id === homeMarketId) return
    const set = new Set(draft.serviceMarkets)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    update({ serviceMarkets: Array.from(set) })
  }

  const onNext = () => {
    router.push('/onboard/details/about')
  }

  return (
    <OnboardShell
      step="profile"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/profile/socials"
    >
      <OnboardHeading
        title={
          <>
            Based on your address,{' '}
            <span className="italic">{homeMarket?.name ?? regionLabel ?? 'this region'}</span> is
            your home market.
          </>
        }
        description="Expand your service area by selecting the markets where you’ll travel for your standard fees. You can add more markets later."
      />

      <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
        {SERVICE_MARKETS.map((m) => {
          const isHome = m.id === homeMarketId
          const selected = isHome || draft.serviceMarkets.includes(m.id)
          return (
            <OptionCard
              key={m.id}
              variant="checkbox"
              selected={selected}
              onToggle={() => toggleMarket(m.id)}
              label={isHome ? `${m.name} (home)` : m.name}
              description={m.hint}
              disabled={isHome}
            />
          )
        })}
      </div>

      <div className="mt-10 flex items-center gap-6 flex-wrap">
        <PrimaryButton onClick={onNext}>Next step</PrimaryButton>
        <WhyWeAsk title="Why we ask about service area">
          <p>
            Your service area decides where OpusFesta shows your storefront. Couples planning a wedding
            in Zanzibar, Arusha, or anywhere you’ve selected will see you in their search results.
          </p>
          <p>
            Pick only the markets where you’ll travel for your <strong>standard fee</strong>. You
            can add per-trip travel charges later. You can update this anytime from your dashboard.
          </p>
        </WhyWeAsk>
      </div>
    </OnboardShell>
  )
}
