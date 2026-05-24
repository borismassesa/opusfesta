import type { Metadata } from 'next'
import PageShell from '../PageShell'

export const metadata: Metadata = {
  title: 'Contact | OpusPass',
  description:
    'Get in touch with the OpusPass team. We’re based in Dar es Salaam and reply within one business day.',
}

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="We’d love to hear from you."
      intro="Questions about your guest list, invitations or an event? Reach out and we’ll get back within one business day."
    >
      <dl className="space-y-4 not-prose">
        <div>
          <dt className="text-[13px] uppercase tracking-wider text-gray-500">Email</dt>
          <dd className="text-[15px] text-gray-800">
            <a className="underline underline-offset-4 hover:text-black" href="mailto:hello@opusfesta.com">
              hello@opusfesta.com
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-[13px] uppercase tracking-wider text-gray-500">WhatsApp</dt>
          <dd className="text-[15px] text-gray-800">Available in-app once you sign up</dd>
        </div>
        <div>
          <dt className="text-[13px] uppercase tracking-wider text-gray-500">Office</dt>
          <dd className="text-[15px] text-gray-800">Mbezi Beach, Dar es Salaam, Tanzania</dd>
        </div>
      </dl>
      <p className="text-[13px] text-gray-500">
        Placeholder contact details — confirm the real address and email before launch.
      </p>
    </PageShell>
  )
}
