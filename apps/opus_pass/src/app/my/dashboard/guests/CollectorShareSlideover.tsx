'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Copy, MessageCircle, ExternalLink } from 'lucide-react'
import { Slideover, Button } from '@/components/dashboard/controls'
import { collectorShareMessage } from '@/lib/dashboard/share'

interface Props {
  open: boolean
  onClose: () => void
  collectorToken: string | null
  coupleName: string
}

export default function CollectorShareSlideover({ open, onClose, collectorToken, coupleName }: Props) {
  const [origin] = useState(() => (typeof window !== 'undefined' ? window.location.origin : ''))

  const link = useMemo(() => {
    if (!collectorToken || !origin) return null
    return `${origin}/collect/${collectorToken}`
  }, [origin, collectorToken])

  const message = useMemo(() => (link ? collectorShareMessage(coupleName, link) : ''), [link, coupleName])
  const whatsappHref = useMemo(
    () => (message ? `https://wa.me/?text=${encodeURIComponent(message)}` : ''),
    [message],
  )

  async function copyLink() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Collector link copied')
    } catch {
      toast.error('Could not copy link')
    }
  }

  async function copyMessage() {
    if (!message) return
    try {
      await navigator.clipboard.writeText(message)
      toast.success('Message copied')
    } catch {
      toast.error('Could not copy')
    }
  }

  return (
    <Slideover
      open={open}
      onClose={onClose}
      title="Collect addresses"
      footer={
        <Button onClick={onClose} variant="secondary">
          Done
        </Button>
      }
    >
      <div className="space-y-5">
        <p className="text-sm text-[#1A1A1A]/65">
          Don&apos;t have everyone&apos;s contact info yet? Share this link with friends and family — they&apos;ll
          fill in their own details and land straight on your guest list.
        </p>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/55">
            Your Contact Collector link
          </p>
          <div className="flex items-stretch gap-2">
            <input
              readOnly
              value={link ?? 'Generating…'}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="w-full rounded-xl border border-black/[0.12] bg-black/[0.02] px-3 py-2.5 text-sm text-[#1A1A1A] outline-none focus:border-[#C9A0DC]"
            />
            <button
              type="button"
              onClick={copyLink}
              disabled={!link}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] px-3 text-xs font-semibold text-white hover:bg-[#1A1A1A]/85 disabled:opacity-50"
            >
              <Copy className="h-4 w-4" /> Copy
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/55">
            Bilingual share message (EN + Swahili)
          </p>
          <textarea
            readOnly
            value={message || 'Generating…'}
            rows={7}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            className="w-full rounded-xl border border-black/[0.12] bg-black/[0.02] px-3 py-2.5 text-sm text-[#1A1A1A] outline-none focus:border-[#C9A0DC]"
          />
          <button
            type="button"
            onClick={copyMessage}
            disabled={!message}
            className="mt-2 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold text-[#1A1A1A]/65 hover:bg-black/[0.05] disabled:opacity-50"
          >
            <Copy className="h-3.5 w-3.5" /> Copy message
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={whatsappHref || '#'}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!whatsappHref}
            onClick={(e) => {
              if (!whatsappHref) e.preventDefault()
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1ebe5d]"
          >
            <MessageCircle className="h-4 w-4" /> Open WhatsApp
          </a>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] ring-1 ring-inset ring-black/[0.12] hover:bg-black/[0.03]"
            >
              <ExternalLink className="h-4 w-4" /> Preview page
            </a>
          ) : null}
        </div>

        <div className="rounded-xl bg-[#FBF7F2] p-3 text-xs text-[#1A1A1A]/55">
          New submissions show up in your guest list under the group{' '}
          <span className="font-semibold text-[#1A1A1A]/75">From Contact Collector</span>. You can rename or
          regroup them anytime.
        </div>
      </div>
    </Slideover>
  )
}
