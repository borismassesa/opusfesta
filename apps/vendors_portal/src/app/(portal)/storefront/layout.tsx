'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { StorefrontPublishBar } from './StorefrontPublishBar'

export default function ListingLayout({ children }: { children: ReactNode }) {
  const { draft, hydrated } = useOnboardingDraft()

  // Soft gate — vendors who haven't finished onboarding see the lock screen
  // instead of the editor. The StorefrontSidebar (mounted by the portal layout)
  // also hides itself in this state.
  if (hydrated && (!draft.categoryId || !draft.submittedAt)) {
    return (
      <div className="p-8 pb-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F0DFF6] text-[#7E5896] flex items-center justify-center mx-auto">
            ✨
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mt-6">
            Your storefront isn’t live yet
          </h1>
          <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">
            Finish the onboarding flow to create your storefront. Once you submit, you’ll be able to
            edit every section here.
          </p>
          <Link
            href="/onboard/category"
            className="inline-flex items-center justify-center gap-2 mt-6 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
          >
            Start onboarding
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <StorefrontPublishBar />
      {children}
    </>
  )
}
