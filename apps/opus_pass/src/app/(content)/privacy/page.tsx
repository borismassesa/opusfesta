import type { Metadata } from 'next'
import PageShell from '../PageShell'

export const metadata: Metadata = {
  title: 'Privacy Policy | OpusPass',
  description: 'How OpusPass collects, uses and protects your data and your guests’ data.',
}

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      intro="How we handle your data and your guests’ data. This is a placeholder pending final legal review."
    >
      <p>
        OpusPass collects only what’s needed to run your guest list and RSVPs —
        names, contact details and replies you enter or import. We don’t sell your
        data. Guest contact details are used solely to deliver the invitations you
        choose to send.
      </p>
      <p>
        Our full policy, including handling under Tanzania’s Personal Data Protection
        Act, retention periods and your rights, will be published here before launch.
      </p>
      <p className="text-[13px] text-gray-500">
        Placeholder content — not yet a binding privacy policy.
      </p>
    </PageShell>
  )
}
