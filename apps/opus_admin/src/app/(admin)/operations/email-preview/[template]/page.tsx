import Link from 'next/link'
import { notFound } from 'next/navigation'
import { findPreview, TEMPLATE_PREVIEWS } from '../_templates'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ template: string }> }

export default async function EmailPreviewPage({ params }: RouteParams) {
  const { template: slug } = await params
  const preview = findPreview(slug)
  if (!preview) notFound()

  const { subject, text, html } = preview.build()

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/operations/email-preview"
            className="text-xs uppercase tracking-[0.14em] text-gray-400 hover:text-gray-700"
          >
            ← All templates
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
            {preview.title}
          </h1>
          <p className="mt-1 text-sm text-gray-600">{preview.description}</p>
        </div>
        <div className="flex gap-2">
          {TEMPLATE_PREVIEWS.map((t) => (
            <Link
              key={t.slug}
              href={`/operations/email-preview/${t.slug}`}
              className={`rounded-full border px-3 py-1 text-xs ${
                t.slug === slug
                  ? 'border-[#7E5896] bg-[#7E5896] text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-[#7E5896]/40'
              }`}
            >
              {t.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">Subject</p>
          <p className="mt-1 text-sm font-medium text-gray-950">{subject}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">Recipient</p>
          <p className="mt-1 text-sm text-gray-700">{preview.recipient}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">Triggered when</p>
          <p className="mt-1 text-sm text-gray-700">{preview.trigger}</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-[#FDFDFD]">
        <iframe
          title={`${preview.title} preview`}
          srcDoc={html}
          sandbox="allow-popups allow-same-origin"
          style={{
            width: '100%',
            height: '900px',
            border: '0',
            background: '#FDFDFD',
          }}
        />
      </div>

      <details className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <summary className="cursor-pointer text-sm font-semibold text-gray-950">
          Plain-text fallback
        </summary>
        <pre className="mt-4 whitespace-pre-wrap text-xs leading-relaxed text-gray-700">{text}</pre>
      </details>
    </div>
  )
}
