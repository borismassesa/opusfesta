// "Loved by Couples" admin curation. 4-card grid section on the
// public /advice-and-ideas page.

import SectionPicksEditor from '../_lib/SectionPicksEditor'
import { loadSectionPicks } from '../_lib/load-section-picks'

export const dynamic = 'force-dynamic'

const MAX_SLOTS = 4

export default async function LovedByCouplesPage() {
  const { pickedArticles, availableArticles } =
    await loadSectionPicks('loved_by_couples')

  return (
    <SectionPicksEditor
      sectionKey="loved_by_couples"
      sectionLabel="Loved by Couples picks"
      maxSlots={MAX_SLOTS}
      previewLayout="grid"
      pickedArticles={pickedArticles}
      availableArticles={availableArticles}
    />
  )
}
