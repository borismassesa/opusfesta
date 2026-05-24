import type { Metadata } from 'next'
import PageShell from '../PageShell'

export const metadata: Metadata = {
  title: 'Terms of Use | OpusPass',
  description: 'The terms governing your use of OpusPass.',
}

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Terms of Use"
      intro="These terms govern your use of OpusPass. This is a placeholder pending final legal review."
    >
      <p>
        By using OpusPass you agree to use the service for lawful purposes and to
        respect the privacy of the guests you invite. Full terms covering accounts,
        payments, content and liability are being finalised with counsel and will be
        published here before launch.
      </p>
      <p className="text-[13px] text-gray-500">
        Placeholder content — not yet legally binding.
      </p>
    </PageShell>
  )
}
