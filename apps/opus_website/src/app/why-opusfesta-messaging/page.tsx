import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Why message vendors through OpusFesta | OpusFesta',
  description:
    'Why couples get faster, safer, more accountable replies when they reach vendors through OpusFesta instead of cold-DMing them.',
}

export default function WhyMessagingPage() {
  return (
    <LegalPage title="Why message vendors through OpusFesta?">
      <p>
        You could DM a vendor on Instagram or chase their WhatsApp number,
        but you&rsquo;ll get faster, safer, and more accountable replies when
        you message through OpusFesta. Here&rsquo;s what we add on top of a
        plain conversation:
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Replies you can trust
      </h2>
      <p>
        Every vendor on OpusFesta is reviewed before they&rsquo;re listed —
        we verify TRA registration, business documents, and a payout method
        before they can quote. The vendor you&rsquo;re messaging is the real
        business, not a scraped phone number.
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Faster response times
      </h2>
      <p>
        Vendors are ranked on how quickly they reply. Your message lands in
        their OpusFesta inbox alongside other active couples — busy vendors
        prioritise it over a stray DM. Each vendor publishes their typical
        response window on their profile.
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        One place for everything
      </h2>
      <p>
        Your quote requests, replies, prices, and contract drafts live in a
        single thread per vendor. No scrolling back through Instagram DMs or
        guessing which WhatsApp number was which. When you book, the
        agreement, deposit receipt, and event details are linked to the same
        thread.
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        Protection if something goes wrong
      </h2>
      <p>
        Deposits placed through OpusFesta sit in escrow until the day of your
        event — if a vendor cancels, the refund is automatic. Cold-paying a
        vendor outside the platform gives up that protection.
      </p>

      <h2 className="text-lg font-semibold text-[#1A1A1A] mt-10">
        We don&rsquo;t spam you
      </h2>
      <p>
        OpusFesta doesn&rsquo;t share your contact details with vendors you
        haven&rsquo;t messaged, and we don&rsquo;t sell your data. The only
        people who can reach you are vendors you started a conversation with.
        See our{' '}
        <Link className="underline" href="/privacy-policy">
          Privacy Policy
        </Link>{' '}
        for the full breakdown.
      </p>

      <div className="mt-10 rounded-2xl border border-gray-100 bg-[#FAF7F2] p-6">
        <p className="text-sm font-semibold text-[#1A1A1A]">
          Ready to start?
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Browse vetted vendors and request quotes in a few clicks.
        </p>
        <Link
          href="/vendors"
          className="mt-4 inline-flex items-center rounded-full bg-(--accent) px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] transition hover:bg-(--accent-hover)"
        >
          Find vendors
        </Link>
      </div>
    </LegalPage>
  )
}
