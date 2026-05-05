'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { acceptContributorInvitation } from '@/lib/advice-submission-actions'

export default function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            try {
              const { id } = await acceptContributorInvitation(token)
              router.push(`/contribute/articles/${id}`)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not accept invite.')
            }
          })
        }
        className="inline-flex items-center gap-2 rounded-lg bg-[#C9A0DC] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b97fd0] disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        Accept invite
      </button>
      {error && <p className="mt-3 max-w-xl text-sm text-rose-700">{error}</p>}
    </div>
  )
}
