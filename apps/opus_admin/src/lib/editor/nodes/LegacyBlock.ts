// LegacyBlock — atomic, non-editable node that preserves an unsupported legacy
// block (video, gallery, ...) verbatim through a round-trip. Step 1 of the
// TipTap migration does not rebuild these block types as native nodes, so this
// node's job is to keep the data intact so the user doesn't lose work and so
// the public renderer keeps showing the existing media.
//
// The full original block JSON is stored as a stringified attribute. The
// editor renders a read-only chip that names the block type and lets the user
// delete (but not edit) it. When step 2 lands native nodes for these types,
// LegacyBlock either disappears or downgrades to a fallback only used for
// genuinely-unrecognised payloads.

import { Node, mergeAttributes } from '@tiptap/core'
import type { AdviceIdeasBlock } from '@/lib/cms/advice-ideas'

export type LegacyBlockAttrs = {
  data: AdviceIdeasBlock
}

export const LegacyBlock = Node.create({
  name: 'legacyBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      data: {
        default: null as AdviceIdeasBlock | null,
        parseHTML: (el) => {
          const raw = el.getAttribute('data-legacy')
          if (!raw) return null
          try {
            return JSON.parse(raw) as AdviceIdeasBlock
          } catch {
            return null
          }
        },
        renderHTML: (attrs) =>
          attrs.data ? { 'data-legacy': JSON.stringify(attrs.data) } : {},
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-legacy-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-legacy-block': '' })]
  },
})
