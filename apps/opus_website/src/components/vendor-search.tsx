import { loadVendorSearchContent } from '@/lib/cms/vendor-search'
import VendorSearchClient from './vendor-search-client'

export default async function VendorSearch() {
  const content = await loadVendorSearchContent()
  return <VendorSearchClient content={content} />
}
