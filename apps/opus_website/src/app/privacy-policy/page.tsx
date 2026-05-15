import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy | OpusFesta',
  description:
    "How OpusFesta collects, uses, and protects your information when you discover vendors and plan your wedding.",
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updatedAt="May 13, 2026">
      <p>
        This Privacy Policy explains how OpusFesta collects, uses, and shares
        information when you use our wedding marketplace. We&rsquo;ve tried to
        keep it readable — if anything is unclear, email{' '}
        <a className="underline" href="mailto:privacy@opusfesta.com">
          privacy@opusfesta.com
        </a>
        .
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Information we collect
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Account info</strong> — your name, email, phone number when
          you create an account (including the lightweight account we open
          when you request your first quote).
        </li>
        <li>
          <strong>Inquiry content</strong> — the wedding date, location, guest
          count, and message you send to vendors.
        </li>
        <li>
          <strong>Vendor-side content</strong> — for vendors, the business
          name, contact details, services, photos, videos, packages, hours,
          and other storefront fields you publish.
        </li>
        <li>
          <strong>Usage data</strong> — pages you view, vendors you save,
          messages you send. We use this to improve the product and surface
          relevant vendors.
        </li>
        <li>
          <strong>Device info</strong> — IP address, browser, and standard
          server logs.
        </li>
      </ul>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        How we use it
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>To run the marketplace — show vendors, route inquiries, deliver replies.</li>
        <li>To verify vendor identities and keep listings legit.</li>
        <li>To send you transactional emails (quote replies, status updates).</li>
        <li>
          With your consent, occasional product or wedding-planning emails.
          You can unsubscribe in the email or in your account settings.
        </li>
      </ul>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Sharing
      </h2>
      <p>
        We share your inquiry details with the specific vendor you message —
        that&rsquo;s the whole point. We don&rsquo;t sell your data to third
        parties. We use a small set of trusted infrastructure providers
        (hosting, email, payments) who only see what they need to deliver
        their service.
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Your rights
      </h2>
      <p>
        You can ask us to export, correct, or delete the data we hold about
        you at any time. Email{' '}
        <a className="underline" href="mailto:privacy@opusfesta.com">
          privacy@opusfesta.com
        </a>{' '}
        and we&rsquo;ll respond within 14 days. Some records (e.g. completed
        bookings) we&rsquo;re required to keep for tax purposes — we&rsquo;ll
        explain if that applies.
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Cookies
      </h2>
      <p>
        We use a small number of cookies to keep you signed in and remember
        your preferences. We don&rsquo;t use third-party advertising cookies.
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Children
      </h2>
      <p>
        OpusFesta is for users 18 and over. We don&rsquo;t knowingly collect
        data from anyone younger. If you believe a minor has signed up,
        contact us and we&rsquo;ll remove the account.
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Updates
      </h2>
      <p>
        We may update this policy as the product evolves. Material changes
        will be announced through the platform with a fresh &ldquo;last
        updated&rdquo; date here.
      </p>
    </LegalPage>
  )
}
