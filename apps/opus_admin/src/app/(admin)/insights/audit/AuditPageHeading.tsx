'use client'

import { useSetPageHeading } from '@/components/PageHeading'

// Pushes the page title/subtitle into the global admin Header. Renders
// nothing visible — same pattern AuthorsHeader / DashboardHeading use.

export default function AuditPageHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  useSetPageHeading({ title, subtitle })
  return null
}
