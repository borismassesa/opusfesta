'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { useSetPageHeading } from '@/components/PageHeading'
import { HeaderActionsSlot, HeaderBadgeSlot } from '@/components/HeaderPortals'
import StatusPill, {
  type StatusVariant,
} from '@/app/(admin)/operations/_shared/StatusPill'

export default function SubmissionReviewHeader({
  pillVariant,
  pillLabel,
  submittedRelative,
  editorHref,
}: {
  pillVariant: StatusVariant
  pillLabel: string
  submittedRelative: string
  editorHref: string
}) {
  useSetPageHeading({
    title: 'Submissions',
    subtitle: `Submitted ${submittedRelative}`,
  })

  return (
    <>
      <HeaderBadgeSlot>
        <StatusPill variant={pillVariant} label={pillLabel} />
      </HeaderBadgeSlot>
      <HeaderActionsSlot>
        <Link
          href={editorHref}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          Open editor
        </Link>
      </HeaderActionsSlot>
    </>
  )
}
