import { getLocale } from '@/lib/cms/locale'
import { loadPortalUiStrings } from '@/lib/cms/portal-ui'
import { PortalUIStringsProvider } from '@/components/providers/PortalUIStringsProvider'
import FaqClient from './FaqClient'

export default async function ListingFAQPage() {
  const locale = await getLocale()
  const faqStrings = await loadPortalUiStrings('storefront-faq', locale)
  return (
    <PortalUIStringsProvider bundles={{ 'storefront-faq': faqStrings }}>
      <FaqClient />
    </PortalUIStringsProvider>
  )
}
