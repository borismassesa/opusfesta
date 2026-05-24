'use client'

import { useSetPageHeading } from '@/components/PageHeading'

// Pushes the bookings page title/subtitle into the global admin Header.
// No header CTA — inquiries arrive from the public site, they aren't
// created here.

export default function BookingsPageHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  useSetPageHeading({ title, subtitle })
  return null
}
