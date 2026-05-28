import { redirect } from 'next/navigation'

// Magic-link sign-in handles both new and returning users — no separate sign-up flow.
export default function SignUpPage() {
  redirect('/sign-in')
}
