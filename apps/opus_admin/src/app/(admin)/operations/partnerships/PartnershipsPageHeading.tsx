'use client'

import { useSetPageHeading } from '@/components/PageHeading'
import { HeaderActionsSlot } from '@/components/HeaderPortals'
import NewLeadButton from './NewLeadButton'

// Pushes the page title/subtitle into the global admin Header and
// portals the "+ New lead" CTA into the header actions slot when the
// caller has permission to create leads.

export default function PartnershipsPageHeading({
  title,
  subtitle,
  canEdit,
}: {
  title: string
  subtitle?: string
  canEdit?: boolean
}) {
  useSetPageHeading({ title, subtitle })
  if (!canEdit) return null
  return (
    <HeaderActionsSlot>
      <NewLeadButton />
    </HeaderActionsSlot>
  )
}
