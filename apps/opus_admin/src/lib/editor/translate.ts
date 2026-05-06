// Bidirectional translator between the legacy `AdviceIdeasBodySection[]` body
// shape and ProseMirror JSON used by TipTap. Step 1 keeps the legacy shape on
// disk so the public website renderer (apps/opus_website) and existing posts
// keep working unchanged. The editor loads via `legacyToTipTap`, edits in
// ProseMirror, and saves via `tiptapToLegacy`.
//
// Round-trip rules:
//   * H2 boundaries in ProseMirror == section boundaries on save.
//   * paragraph / subheading (H3) / list / quote / tip translate to native
//     ProseMirror nodes (and a custom `callout` for `tip`).
//   * image, video, gallery preserve via a `legacyBlock` atom node so the user
//     never silently loses media. Images get rendered as ProseMirror images on
//     load (so they look right inline), but on save we read the LegacyBlock
//     payload back if it's still present.
//   * Section labels (eyebrows) round-trip via a `data-label` attribute on the
//     emitted H2 heading. Editing the H2 keeps the label; deleting the H2
//     drops the label, which matches user expectation.
//   * Sections with no heading still emit their blocks (no H2).

import {
  type AdviceIdeasBlock,
  type AdviceIdeasBodySection,
} from '@/lib/cms/advice-ideas'

export type ProseMirrorNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: ProseMirrorNode[]
  text?: string
  marks?: { type: string; attrs?: Record<string, unknown> }[]
}

export type ProseMirrorDoc = {
  type: 'doc'
  content: ProseMirrorNode[]
}

const EMPTY_DOC: ProseMirrorDoc = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

// ---------- legacy → ProseMirror ----------

export function legacyToTipTap(sections: AdviceIdeasBodySection[]): ProseMirrorDoc {
  if (!sections || sections.length === 0) return EMPTY_DOC
  const content: ProseMirrorNode[] = []
  for (const section of sections) {
    if (section.heading?.trim()) {
      content.push(headingNode(2, section.heading, section.label))
    }
    for (const block of section.blocks) {
      const nodes = legacyBlockToNodes(block)
      for (const n of nodes) content.push(n)
    }
  }
  if (content.length === 0) return EMPTY_DOC
  return { type: 'doc', content }
}

function headingNode(level: 2 | 3, text: string, label?: string): ProseMirrorNode {
  const attrs: Record<string, unknown> = { level }
  if (label?.trim()) attrs['data-label'] = label.trim()
  return { type: 'heading', attrs, content: text ? [textNode(text)] : [] }
}

function textNode(text: string): ProseMirrorNode {
  return { type: 'text', text }
}

function paragraphNode(text: string): ProseMirrorNode {
  if (!text) return { type: 'paragraph' }
  return { type: 'paragraph', content: [textNode(text)] }
}

function legacyBlockToNodes(block: AdviceIdeasBlock): ProseMirrorNode[] {
  switch (block.type) {
    case 'paragraph':
      return [paragraphNode(block.text)]

    case 'subheading':
      return [headingNode(3, block.text)]

    case 'list': {
      const listType = block.ordered ? 'orderedList' : 'bulletList'
      return [
        {
          type: listType,
          content: block.items.map((item) => ({
            type: 'listItem',
            content: [paragraphNode(item)],
          })),
        },
      ]
    }

    case 'quote': {
      const quoteParas: ProseMirrorNode[] = block.quote
        ? block.quote.split(/\n+/).map((line) => paragraphNode(line))
        : [paragraphNode('')]
      if (block.attribution?.trim()) {
        quoteParas.push(paragraphNode(`— ${block.attribution.trim()}`))
      }
      return [{ type: 'blockquote', content: quoteParas }]
    }

    case 'tip': {
      const inner: ProseMirrorNode[] = []
      if (block.text) {
        for (const line of block.text.split(/\n+/)) inner.push(paragraphNode(line))
      } else {
        inner.push(paragraphNode(''))
      }
      return [
        {
          type: 'callout',
          attrs: { variant: 'tip', title: block.title || '' },
          content: inner,
        },
      ]
    }

    case 'image': {
      // Render as a real ProseMirror image so it looks right inline. Caption
      // round-tripping is preserved via the `title` attr (TipTap Image stores
      // it on the node) — on save we reconstruct caption from `title`.
      return [
        {
          type: 'image',
          attrs: {
            src: block.src,
            alt: block.alt || '',
            title: block.caption || null,
          },
        },
      ]
    }

    case 'video':
    case 'gallery':
      // No native node yet — preserve verbatim so we don't lose data.
      return [{ type: 'legacyBlock', attrs: { data: block } }]

    default: {
      // Unknown block — guard against future shape additions by preserving raw.
      const exhaustive: never = block
      void exhaustive
      return [{ type: 'legacyBlock', attrs: { data: block as AdviceIdeasBlock } }]
    }
  }
}

// ---------- ProseMirror → legacy ----------

export function tiptapToLegacy(doc: ProseMirrorDoc | null | undefined): AdviceIdeasBodySection[] {
  if (!doc?.content || doc.content.length === 0) return []

  const sections: AdviceIdeasBodySection[] = []
  let current = openSection({ heading: '', label: undefined })

  const pushCurrent = () => {
    if (current.heading || current.blocks.length > 0 || current.label) {
      sections.push({
        id: current.id,
        heading: current.heading,
        label: current.label,
        blocks: current.blocks,
      })
    }
  }

  for (const node of doc.content) {
    if (node.type === 'heading' && (node.attrs?.level === 2 || !node.attrs?.level)) {
      // H2 (or untyped heading defaulting to 2) starts a new section.
      pushCurrent()
      const heading = collectText(node)
      const label =
        typeof node.attrs?.['data-label'] === 'string'
          ? (node.attrs['data-label'] as string)
          : undefined
      current = openSection({ heading, label })
      continue
    }

    const block = nodeToLegacyBlock(node)
    if (block) current.blocks.push(block)
  }

  pushCurrent()

  // If the doc had no H2s and produced one anonymous section with no heading,
  // keep it — the public renderer handles empty headings, and the editor will
  // still display the blocks.
  return sections
}

type WorkingSection = {
  id: string
  heading: string
  label: string | undefined
  blocks: AdviceIdeasBlock[]
}

function openSection({ heading, label }: { heading: string; label: string | undefined }): WorkingSection {
  return {
    id: makeSectionId(),
    heading,
    label,
    blocks: [],
  }
}

function makeSectionId(): string {
  return `section-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function nodeToLegacyBlock(node: ProseMirrorNode): AdviceIdeasBlock | null {
  switch (node.type) {
    case 'paragraph': {
      const text = collectText(node)
      // Drop empty paragraphs at section boundaries — the legacy renderer
      // would render them as an empty `<p>`, which is noisy.
      if (!text) return null
      return { type: 'paragraph', text }
    }

    case 'heading': {
      const level = (node.attrs?.level as number | undefined) ?? 2
      // H3 → subheading. H2 was already handled at the section-boundary level.
      if (level === 3) return { type: 'subheading', text: collectText(node) }
      // Unexpected H2 mid-section — fold it as a subheading rather than lose it.
      return { type: 'subheading', text: collectText(node) }
    }

    case 'bulletList':
    case 'orderedList': {
      const items: string[] = []
      for (const li of node.content ?? []) {
        items.push(collectText(li))
      }
      return { type: 'list', items, ordered: node.type === 'orderedList' }
    }

    case 'blockquote': {
      const paras = (node.content ?? []).map(collectText)
      // Heuristic: a trailing line starting with "— " is the attribution.
      let attribution: string | undefined
      let quote = paras.join('\n')
      const last = paras[paras.length - 1]
      if (paras.length > 1 && last && /^—\s/.test(last)) {
        attribution = last.replace(/^—\s*/, '').trim()
        quote = paras.slice(0, -1).join('\n')
      }
      return { type: 'quote', quote, ...(attribution ? { attribution } : {}) }
    }

    case 'callout': {
      // Step 1 only emits `tip` since that's the only legacy variant. Future
      // variants land alongside the slash menu work and will get their own
      // legacy mapping (or a wider `tip` shape).
      const title = (node.attrs?.title as string) || ''
      const text = (node.content ?? []).map(collectText).filter(Boolean).join('\n')
      return { type: 'tip', title, text }
    }

    case 'image': {
      const src = (node.attrs?.src as string) || ''
      const alt = (node.attrs?.alt as string) || ''
      const caption = (node.attrs?.title as string | null) || undefined
      return { type: 'image', src, alt, ...(caption ? { caption } : {}) }
    }

    case 'legacyBlock': {
      const data = node.attrs?.data as AdviceIdeasBlock | undefined
      return data ?? null
    }

    case 'horizontalRule':
      // No legacy equivalent — drop. Safe lossy: HR was never a legacy block
      // type, so this only happens for content authored in the new editor.
      return null

    default:
      return null
  }
}

function collectText(node: ProseMirrorNode): string {
  if (node.type === 'text') return node.text ?? ''
  if (!node.content) return ''
  // Preserve hard breaks as newlines.
  return node.content
    .map((child) => {
      if (child.type === 'hardBreak') return '\n'
      return collectText(child)
    })
    .join('')
}
