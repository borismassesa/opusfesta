'use client'

import SchemaCopyEditor from '@/components/cms/SchemaCopyEditor'
import type {
  CopyFieldGroup,
  UiArea,
  UiStringsContent,
} from '@/lib/cms/vendors-portal-ui-strings'
import { useEditorActions } from '../EditorActionsContext'
import {
  discardUiStringsDraft,
  publishUiStrings,
  saveUiStringsDraft,
} from './actions'

type Props = {
  area: UiArea
  label: string
  groups: CopyFieldGroup[]
  initial: UiStringsContent
  hasDraft: boolean
}

// Thin wrapper: supplies the Site UI EditorActionsContext bind/unbind + the
// site-ui server actions to the generic <SchemaCopyEditor>. Mirrors
// apps/opus_admin/src/app/(admin)/cms/opus-pass/site-ui/[area]/UiStringsEditor.tsx.
export default function UiStringsEditor({ area, label, groups, initial, hasDraft }: Props) {
  const { bind, unbind } = useEditorActions()

  return (
    <SchemaCopyEditor
      key={area}
      title={`${label} — site UI text`}
      description={`Editable, bilingual labels shown in the vendor portal ${label.toLowerCase()}. Leave a field blank to fall back to the built-in English default.`}
      groups={groups}
      initial={initial}
      hasDraft={hasDraft}
      bind={bind}
      unbind={unbind}
      saveDraft={(draft) => saveUiStringsDraft(area, draft)}
      publish={() => publishUiStrings(area)}
      discard={() => discardUiStringsDraft(area)}
    />
  )
}
