import { redirect } from 'next/navigation';

// Redirect old /book URL to the portal booking flow
export default function BookRedirect() {
  redirect('/portal/book');
}
