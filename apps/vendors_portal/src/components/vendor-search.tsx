import { loadVendorSearchContent } from '@/lib/cms/vendor-search'
import { getLocale } from '@/lib/cms/locale'
import VendorSearchClient from './vendor-search-client'

export default async function VendorSearch() {
  const locale = await getLocale()
  const content = await loadVendorSearchContent(locale)
  return <VendorSearchClient content={content} />
}
