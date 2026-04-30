import type { ReactNode } from 'react'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <SmoothScrollProvider>{children}</SmoothScrollProvider>
}
