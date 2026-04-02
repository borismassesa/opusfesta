import type { Metadata } from 'next'
import VendorsIndexPage from '@/components/vendors/VendorsIndexPage'

export const metadata: Metadata = {
  title: 'Find Vendors | OpusFesta',
  description:
    'Discover verified photographers, venues, caterers, and more across Tanzania. Every vendor is reviewed, background-checked, and ready to make your wedding unforgettable.',
}

export default function VendorsPage() {
  return <VendorsIndexPage />
}
