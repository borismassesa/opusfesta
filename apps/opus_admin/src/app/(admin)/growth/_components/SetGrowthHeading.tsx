'use client'

import { useSetPageHeading, type PageHeading } from '@/components/PageHeading'

export default function SetGrowthHeading({
  title,
  subtitle,
  back,
}: {
  title: string
  subtitle: string
  back?: PageHeading['back']
}) {
  useSetPageHeading({ title, subtitle, back })
  return null
}
