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
import { useOnboardT } from '@/lib/onboarding/strings'

export default function MarketsPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const { t } = useOnboardT()
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
      primaryAction={
        <PrimaryButton onClick={onNext}>{t('common.next_step')}</PrimaryButton>
      }
    >
      <OnboardHeading
        title={t('profile.markets.title', {
          market: homeMarket?.name ?? regionLabel ?? 'this region',
        })}
        description={t('profile.markets.subtitle')}
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
              label={isHome ? `${m.name} ${t('profile.markets.home_suffix')}` : m.name}
              description={m.hint}
              disabled={isHome}
            />
          )
        })}
      </div>

      <div className="mt-10">
        <WhyWeAsk title={t('profile.markets.why.title')}>
          <p>{t('profile.markets.why.body1')}</p>
          <p>{t('profile.markets.why.body2')}</p>
        </WhyWeAsk>
      </div>
    </OnboardShell>
  )
}
