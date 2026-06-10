'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingDraft } from '@/lib/onboarding/draft'

/**
 * Entry point for "Add another business" — a signed-in vendor starting a
 * second profile in a different category (same email, same login). Their
 * localStorage draft still holds the previous application, so we wipe it to
 * a fresh draft before dropping them on the category step.
 */
export default function NewBusinessPage() {
  const router = useRouter()
  const { reset, hydrated } = useOnboardingDraft()
  const started = useRef(false)

  useEffect(() => {
    // Wait for hydration so reset() targets the signed-in user's storage key.
    if (!hydrated || started.current) return
    started.current = true
    reset()
    router.replace('/onboard/category')
  }, [hydrated, reset, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <p className="text-sm text-gray-500">Starting a new application…</p>
    </div>
  )
}
