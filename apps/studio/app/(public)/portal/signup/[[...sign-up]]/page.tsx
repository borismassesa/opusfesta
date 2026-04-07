import { redirect } from 'next/navigation';

// Clients don't need to sign up — the magic link system creates their profile
// automatically on first sign-in. Redirect anyone who lands here to login.
export default function PortalSignUpPage() {
  redirect('/portal/login');
}
