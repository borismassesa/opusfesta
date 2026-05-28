import { redirect } from 'next/navigation'

// Auth removed — every sign-up attempt drops straight into the demo dashboard.
export default function SignUpPage() {
  redirect('/my/dashboard?seed=1')
}
