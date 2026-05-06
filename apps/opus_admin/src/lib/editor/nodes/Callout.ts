// Callout node — represents the legacy `tip` block. For step 1 we expose only
// the `tip` variant; future variants (`note`, `warning`) will land alongside
// the slash-menu work. The node holds rich-text content plus an optional title
// stored as an attribute, since the legacy `tip` shape was `{ title, text }`.

import { Node, mergeAttributes } from '@tiptap/core'

export type CalloutVariant = 'tip' | 'note' | 'warning'

export type CalloutAttrs = {
  variant: CalloutVariant
  title: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attrs?: Partial<CalloutAttrs>) => ReturnType
    }
  }
}

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'tip' as CalloutVariant,
        parseHTML: (el) => (el.getAttribute('data-variant') as CalloutVariant) || 'tip',
        renderHTML: (attrs) => ({ 'data-variant': attrs.variant }),
      },
      title: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-title') || '',
        renderHTML: (attrs) => (attrs.title ? { 'data-title': attrs.title } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-callout': '' }), 0]
  },

  addCommands() {
    return {
      setCallout:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { variant: 'tip', title: '', ...attrs },
            content: [{ type: 'paragraph' }],
          }),
    }
  },
})
