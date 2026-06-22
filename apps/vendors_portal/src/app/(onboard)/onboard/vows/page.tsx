'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  Globe,
  Handshake,
  Heart,
  HeartHandshake,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { LocaleToggle } from '@/components/LocaleToggle'
import { cn } from '@/lib/utils'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { WhyWeAsk } from '@/components/onboard/WhyWeAsk'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { useOnboardT } from '@/lib/onboarding/strings'
import { VENDOR_VOWS } from '@/lib/onboarding/vows'

// Per-vow icon + tile tone. Keyed by the vow id so the data file stays a plain
// content list (no JSX). Each vow gets its own accent so the grid reads as six
// distinct values rather than a wall of text.
const VOW_STYLE: Record<string, { icon: LucideIcon; tile: string }> = {
  love: { icon: Heart, tile: 'bg-rose-50 text-rose-600' },
  quality: { icon: Handshake, tile: 'bg-[#F0DFF6] text-[#7E5896]' },
  transparency: { icon: ShieldCheck, tile: 'bg-blue-50 text-blue-600' },
  tolerance: { icon: Scale, tile: 'bg-amber-50 text-amber-700' },
  inclusion: { icon: Globe, tile: 'bg-emerald-50 text-emerald-600' },
  community: { icon: HeartHandshake, tile: 'bg-fuchsia-50 text-fuchsia-600' },
}

const DEFAULT_VOW_STYLE = { icon: Heart, tile: 'bg-gray-100 text-gray-600' }

export default function VowsPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const { t } = useOnboardT()

  useEffect(() => {
    if (hydrated && !draft.categoryId) router.replace('/onboard/category')
  }, [hydrated, draft.categoryId, router])

  const accept = () => {
    update({ vowsAccepted: true })
    router.push('/onboard/profile/name')
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="bg-white border-b border-gray-100">
        <div className="px-6 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/" aria-label={t('stepper.aria.home')} className="shrink-0">
            <Logo className="h-7 w-auto text-gray-900" />
          </Link>
          <LocaleToggle />
        </div>
      </header>

      <main className="px-6 lg:px-12 py-10 lg:py-14">
        <div className="max-w-3xl mx-auto pb-24">
          <OnboardHeading
            title={t('vows.title')}
            description={t('vows.subtitle')}
          />

          <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {VENDOR_VOWS.map((vow) => {
              const style = VOW_STYLE[vow.id] ?? DEFAULT_VOW_STYLE
              const Icon = style.icon
              return (
                <li
                  key={vow.id}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]"
                >
                  <span
                    className={cn(
                      'inline-flex h-10 w-10 items-center justify-center rounded-xl',
                      style.tile,
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-3.5 text-[15px] font-semibold text-gray-900">
                    {vow.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {vow.body}
                  </p>
                </li>
              )
            })}
          </ul>

          <div className="mt-10 flex items-center gap-6 flex-wrap">
            <PrimaryButton onClick={accept}>{t('vows.cta')}</PrimaryButton>
            <WhyWeAsk title={t('vows.why.title')}>
              <p>{t('vows.why.body1')}</p>
              <p>{t('vows.why.body2')}</p>
            </WhyWeAsk>
          </div>
        </div>
      </main>
    </div>
  )
}
