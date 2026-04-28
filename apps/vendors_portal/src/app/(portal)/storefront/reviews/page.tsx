import { redirect } from 'next/navigation'

// Reviews moved out of the storefront editor and into the primary sidebar.
// Anyone hitting the old URL gets bounced to the new one without a 404.
export default function StorefrontReviewsRedirect() {
  redirect('/reviews')
}
