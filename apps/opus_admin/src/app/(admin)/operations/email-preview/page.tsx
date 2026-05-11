import Link from 'next/link'
import { TEMPLATE_PREVIEWS } from './_templates'

export const dynamic = 'force-dynamic'

export default function EmailPreviewIndex() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-950">Email previews</h1>
      <p className="mt-2 text-sm text-gray-600">
        Sample renders of every transactional email the admin app can send. Each preview uses
        seed data — no actual emails are sent from this page.
      </p>

      <ul className="mt-8 grid gap-3">
        {TEMPLATE_PREVIEWS.map((tmpl) => (
          <li key={tmpl.slug}>
            <Link
              href={`/operations/email-preview/${tmpl.slug}`}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 transition hover:border-[#7E5896]/50 hover:bg-[#FCF7FF]"
            >
              <div>
                <p className="text-sm font-semibold text-gray-950">{tmpl.title}</p>
                <p className="mt-1 text-xs text-gray-500">{tmpl.description}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-gray-400">
                  Recipient: {tmpl.recipient} · Trigger: {tmpl.trigger}
                </p>
              </div>
              <span className="text-sm font-medium text-[#7E5896]">Preview →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
