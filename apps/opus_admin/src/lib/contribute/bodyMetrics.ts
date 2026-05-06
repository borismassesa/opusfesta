import type { AdviceIdeasBodySection } from '@/lib/cms/advice-ideas'

export function bodyText(body: AdviceIdeasBodySection[] | null | undefined): string {
  if (!body?.length) return ''
  const parts: string[] = []
  for (const section of body) {
    if (section.heading) parts.push(section.heading)
    for (const block of section.blocks ?? []) {
      switch (block.type) {
        case 'paragraph':
        case 'subheading':
          parts.push(block.text)
          break
        case 'list':
          parts.push(...block.items)
          break
        case 'quote':
          parts.push(block.quote)
          if (block.attribution) parts.push(block.attribution)
          break
        case 'tip':
          parts.push(block.title, block.text)
          break
        case 'image':
        case 'video':
          parts.push(block.alt || '', block.caption || '')
          break
        case 'gallery':
          parts.push(...block.items.map((item) => item.alt || ''))
          break
      }
    }
  }
  return parts.join(' ').trim()
}

export function countBodyWords(body: AdviceIdeasBodySection[] | null | undefined): number {
  const text = bodyText(body)
  return text ? text.split(/\s+/).filter(Boolean).length : 0
}

export function hasSubstantiveBody(body: AdviceIdeasBodySection[] | null | undefined): boolean {
  return bodyText(body).trim().length > 0
}

export function readingTimeLabel(words: number): string {
  const safeWords = Math.max(0, Math.round(words))
  if (safeWords < 200) return 'under 1 min'
  return `${Math.ceil(safeWords / 200)} min`
}
