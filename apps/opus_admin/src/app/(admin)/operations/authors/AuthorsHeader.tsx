// OF-ADM-AUTHORS-001 — sets the global page heading and portals the
// "Add author" split CTA into the admin header. The heading subtitle reflects
// counts of active authors + pending invites so admins can scan-read the
// state of the contributor pipeline from the header alone.

'use client'

import { useSetPageHeading } from '@/components/PageHeading'
import { HeaderActionsSlot } from '@/components/HeaderPortals'
import AddAuthorMenu from './_authors/AddAuthorMenu'

export default function AuthorsHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  useSetPageHeading({ title, subtitle })
  return (
    <HeaderActionsSlot>
      <AddAuthorMenu />
    </HeaderActionsSlot>
  )
}
