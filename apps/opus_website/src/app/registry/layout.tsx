import type { ReactNode } from 'react'
import { Toaster } from 'sonner'

export default function RegistryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="bottom-center" richColors />
    </>
  )
}
