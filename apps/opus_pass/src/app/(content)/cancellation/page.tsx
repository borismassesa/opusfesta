import type { Metadata } from 'next'
import LegalDoc, { type LegalSection } from '../_legal/LegalDoc'

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy | OpusPass',
  description:
    'How cancellations and refunds work for OpusPass packages, add-ons, and printed cards.',
}

const sections: LegalSection[] = [
  {
    id: 'digital-packages',
    title: 'Digital packages',
    body: (
      <p>
        You can cancel for a <strong>full refund any time before your invitations are sent</strong>.
        Once invites have gone out, the package is non-refundable — the cards and tickets are already
        live to your guests and the work has been delivered.
      </p>
    ),
  },
  {
    id: 'attendant-add-on',
    title: 'On-site attendant add-on',
    body: (
      <p>
        The on-site scanning attendant can be cancelled up to <strong>7 days before your event</strong>{' '}
        for a full refund. Within 7 days of the event the attendant has already been scheduled and travel
        arranged, so this add-on is non-refundable, though we&rsquo;ll always try to accommodate a date
        change where we can.
      </p>
    ),
  },
  {
    id: 'printed-cards',
    title: 'Premium printed cards',
    body: (
      <p>
        Printed cards can be cancelled for a full refund any time <strong>before they go to print</strong>.
        Once printing has started the cards are made to order, so the print portion of your order is
        non-refundable. Your digital package is unaffected and follows the policy above.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changing your event details',
    body: (
      <p>
        Because your invitations are digital, you can <strong>update event details — venue, date, or
        time — at no cost</strong>, even after invites are sent. Every guest sees the change instantly,
        so a reschedule never means buying again.
      </p>
    ),
  },
  {
    id: 'how-to-cancel',
    title: 'How to cancel',
    body: (
      <p>
        Email{' '}
        <a href="mailto:support@opusfesta.com">support@opusfesta.com</a> or message us on WhatsApp with
        your order details. Approved refunds are returned to your original payment method (M-Pesa, Airtel
        Money, Mixx by Yas, Selcom Pesa, Visa, or Mastercard) within 7&ndash;14 business days.
      </p>
    ),
  },
]

export default function CancellationPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Cancellation & Refund Policy"
      updated="June 2026"
      intro={
        <p>
          This policy explains how cancellations and refunds work across OpusPass digital packages,
          add-ons, and printed cards.
        </p>
      }
      sections={sections}
    />
  )
}
