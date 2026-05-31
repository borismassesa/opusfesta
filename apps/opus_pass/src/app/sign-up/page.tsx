import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

// Auth removed — every sign-up attempt drops straight into the demo dashboard.
export default function SignUpPage() {
  redirect('/my/dashboard?seed=1')
}
