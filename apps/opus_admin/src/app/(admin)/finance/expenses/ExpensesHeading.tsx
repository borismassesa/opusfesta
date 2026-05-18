'use client'

import { useSetPageHeading } from '@/components/PageHeading'

export default function ExpensesHeading() {
  useSetPageHeading({ title: 'Expenses' })
  return null
}
