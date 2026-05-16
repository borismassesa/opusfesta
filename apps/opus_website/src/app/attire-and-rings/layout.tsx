import type { ReactNode } from 'react'

export default function AttireAndRingsLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-white text-gray-900 font-sans">{children}</div>
}
