import { redirect } from 'next/navigation'

// Auth removed — every sign-in attempt drops straight into the demo dashboard.
export default function SignInPage() {
  redirect('/my/dashboard?seed=1')
}
