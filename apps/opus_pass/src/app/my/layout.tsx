import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// Couple dashboard is temporarily disabled while Clerk auth is removed.
// Redirect every /my route home until authentication is re-introduced.
export default function MyLayout({ children: _children }: { children: ReactNode }) {
  redirect('/')
}
