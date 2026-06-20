import type { ReactNode } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { UIStringsProvider } from '@/components/providers/UIStringsProvider'
import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'

// Server bridge that wires the bilingual Site UI microcopy into the public
// chrome. It resolves the visitor's locale, loads the navbar + footer bundles,
// and provides them to client code (Navbar reads via useT). Footer stays a
// SERVER component and receives its strings as a prop.
//
// Routes that mount this must be dynamic (it calls getLocale → cookies()).
export default async function SiteChrome({ children }: { children: ReactNode }) {
  const locale = await getLocale()
  const [navbar, footer] = await Promise.all([
    loadUiStrings('navbar', locale),
    loadUiStrings('footer', locale),
  ])

  return (
    <UIStringsProvider bundles={{ navbar, footer }}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer strings={footer} />
    </UIStringsProvider>
  )
}
