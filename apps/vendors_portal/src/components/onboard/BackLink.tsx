'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useOnboardT } from '@/lib/onboarding/strings'

export function BackLink({ href, label }: { href?: string; label?: string }) {
  const router = useRouter()
  const { t } = useOnboardT()
  label = label ?? t('common.back')

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {label}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  )
}
