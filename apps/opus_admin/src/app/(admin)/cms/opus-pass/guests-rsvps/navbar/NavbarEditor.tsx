'use client'

import SchemaCopyEditor from '@/components/cms/SchemaCopyEditor'
import type { MaybeLocalized } from '@/lib/cms/localized'
import { GUESTS_NAVBAR_SCHEMA } from '@/lib/cms/opus-pass-guests-rsvps-navbar'
import { useEditorActions } from '../EditorActionsContext'
import { discardNavbarDraft, publishNavbar, saveNavbarDraft } from './actions'

type Props = {
  initial: Record<string, MaybeLocalized>
  hasDraft: boolean
}

export default function NavbarEditor({ initial, hasDraft }: Props) {
  const { bind, unbind } = useEditorActions()

  return (
    <SchemaCopyEditor
      title="Navbar"
      description="The Guests & RSVP's entry in the top navigation mega-menu — bilingual. Leave a field blank to fall back to the built-in English default."
      groups={GUESTS_NAVBAR_SCHEMA}
      initial={initial}
      hasDraft={hasDraft}
      bind={bind}
      unbind={unbind}
      saveDraft={saveNavbarDraft}
      publish={publishNavbar}
      discard={discardNavbarDraft}
    />
  )
}
