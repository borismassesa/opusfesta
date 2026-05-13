import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Use | OpusFesta',
  description:
    'The terms governing your use of OpusFesta — discovering vendors, sending inquiries, booking weddings.',
}

export default function TermsOfUsePage() {
  return (
    <LegalPage title="Terms of Use" updatedAt="May 13, 2026">
      <p>
        These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use
        of OpusFesta — the wedding marketplace that connects couples with
        vendors across Tanzania. By using OpusFesta you agree to these Terms;
        if you don&rsquo;t agree, please don&rsquo;t use the service.
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Using OpusFesta as a couple
      </h2>
      <p>
        When you send a quote request, save a vendor, or message a vendor, we
        create or use a lightweight OpusFesta account tied to your email so we
        can pass replies back to you and keep a record of your conversations.
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>You must be at least 18 to send inquiries through the platform.</li>
        <li>
          Don&rsquo;t impersonate someone else, send abusive messages, or
          attempt to circumvent our messaging system to avoid the platform.
        </li>
        <li>
          Quotes and prices shown are estimates set by each vendor. Final
          pricing is whatever you and the vendor agree to in writing.
        </li>
      </ul>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Using OpusFesta as a vendor
      </h2>
      <p>
        Vendor accounts have additional rules covered in the OpusFesta Vendor
        Agreement you sign during onboarding. Briefly: respond to couples
        within your published response window, keep your storefront content
        accurate, only upload media you have the right to use, and honour the
        deposits / cancellation policy you set.
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Content you submit
      </h2>
      <p>
        You retain ownership of the photos, videos, messages, and other
        content you submit. You grant OpusFesta a non-exclusive licence to
        display that content for the purpose of running the marketplace — for
        example, showing a vendor&rsquo;s photos on their public profile or
        forwarding your inquiry to the vendor.
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Suspension &amp; termination
      </h2>
      <p>
        We may suspend or terminate any account that violates these Terms or
        the Vendor Agreement. You can close your own account at any time by
        contacting support — see the Privacy Policy for how your data is
        handled after closure.
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Disclaimers &amp; liability
      </h2>
      <p>
        OpusFesta is a marketplace — we do not perform the services vendors
        offer. We make no warranty that any specific vendor will be available,
        responsive, or suitable for your event. To the maximum extent
        permitted by Tanzanian law, OpusFesta is not liable for indirect or
        consequential losses arising from your use of the service.
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Governing law
      </h2>
      <p>
        These Terms are governed by the laws of the United Republic of
        Tanzania. Any dispute that can&rsquo;t be resolved informally will be
        handled by the courts of Dar es Salaam.
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Changes
      </h2>
      <p>
        We may update these Terms from time to time — for example, when we
        launch new features. We&rsquo;ll post the updated version here with a
        new &ldquo;last updated&rdquo; date and, for material changes, give
        notice through the platform.
      </p>

      <p className="text-xs text-gray-500 pt-6 border-t border-gray-100">
        Questions? Reach us at{' '}
        <a className="underline" href="mailto:hello@opusfesta.com">
          hello@opusfesta.com
        </a>
        .
      </p>
    </LegalPage>
  )
}
