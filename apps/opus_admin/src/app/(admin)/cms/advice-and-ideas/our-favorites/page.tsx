// "Our Favorites" admin curation. 1 hero + 3 stacked section on the
// public /advice-and-ideas page.

import SectionPicksEditor from '../_lib/SectionPicksEditor'
import { loadSectionPicks } from '../_lib/load-section-picks'

export const dynamic = 'force-dynamic'

const MAX_SLOTS = 4

export default async function OurFavoritesPage() {
  const { pickedArticles, availableArticles } =
    await loadSectionPicks('our_favorites')

  return (
    <SectionPicksEditor
      sectionKey="our_favorites"
      sectionLabel="Our Favorites picks"
      maxSlots={MAX_SLOTS}
      previewLayout="hero+stack"
      pickedArticles={pickedArticles}
      availableArticles={availableArticles}
    />
  )
}
