// Editor extension configuration. Step 1 keeps the surface small: StarterKit,
// Image, Link, Placeholder, CharacterCount, plus our Callout (for legacy `tip`
// blocks) and LegacyBlock (round-trips video/gallery). Slash menu, drag handle,
// bubble menu, custom Embed/Gallery/Section nodes land in subsequent steps.

import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { Callout } from './nodes/Callout'
import { LegacyBlock } from './nodes/LegacyBlock'

export type ArticleEditorExtensionsOptions = {
  placeholder?: string
  mode?: 'admin' | 'contributor'
}

export function buildArticleEditorExtensions(
  options: ArticleEditorExtensionsOptions = {}
) {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      // Disable codeBlock — editorial articles don't need fenced code blocks,
      // and dropping it keeps the slash menu surface and the public renderer
      // contract simpler.
      codeBlock: false,
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      HTMLAttributes: {
        class: 'editor-link',
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),
    Image.configure({
      HTMLAttributes: { class: 'editor-image' },
    }),
    Placeholder.configure({
      placeholder: options.placeholder ?? 'Start writing your article…',
      includeChildren: false,
    }),
    CharacterCount,
    Callout,
    LegacyBlock,
  ]
}
