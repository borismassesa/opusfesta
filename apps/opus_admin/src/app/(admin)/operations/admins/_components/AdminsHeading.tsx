'use client'

import { useSetPageHeading } from '@/components/PageHeading'

export default function AdminsHeading({ subtitle }: { subtitle: string }) {
  useSetPageHeading({ title: 'Admin team', subtitle })
  return null
}
