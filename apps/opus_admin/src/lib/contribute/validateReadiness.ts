import type { AdviceIdeasBodySection } from '@/lib/cms/advice-ideas'
import { hasSubstantiveBody } from './bodyMetrics'

export type ReadinessInput = {
  title: string
  summary: string
  category: string
  body: AdviceIdeasBodySection[]
}

export type ReadinessItem = {
  id: 'category' | 'title' | 'summary' | 'body'
  label: string
  passed: boolean
}

export function validateReadiness(draft: ReadinessInput): {
  passed: boolean
  items: ReadinessItem[]
  missingCount: number
} {
  const items: ReadinessItem[] = [
    { id: 'category', label: 'Category set', passed: Boolean(draft.category.trim()) },
    { id: 'title', label: 'Add a title', passed: draft.title.trim().length >= 4 },
    { id: 'summary', label: 'Write a summary', passed: draft.summary.trim().length >= 20 },
    {
      id: 'body',
      label: 'Add at least one paragraph',
      passed: hasSubstantiveBody(draft.body),
    },
  ]
  const missingCount = items.filter((item) => !item.passed).length
  return { passed: missingCount === 0, items, missingCount }
}
