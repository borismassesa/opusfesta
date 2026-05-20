import Link from 'next/link'
import {
  ExternalLink,
  Sparkles,
  Users,
  Send,
  CheckCircle2,
  MapPin,
  Info,
  type LucideIcon,
} from 'lucide-react'

type SectionCard = {
  key: string
  label: string
  description: string
  icon: LucideIcon
}

const sections: SectionCard[] = [
  {
    key: 'hero',
    label: 'Hero',
    description: 'Top banner explaining digital-first guest management and live RSVPs.',
    icon: Sparkles,
  },
  {
    key: 'guest-list',
    label: 'Guest List Feature',
    description: 'Showcase of the guest list manager — bulk import, plus-ones, dietary preferences.',
    icon: Users,
  },
  {
    key: 'send-tools',
    label: 'WhatsApp & SMS Send',
    description: 'How invites get delivered — sample copy, preview, and channel options.',
    icon: Send,
  },
  {
    key: 'rsvp-tracking',
    label: 'RSVP Tracking',
    description: 'Live dashboard preview — auto reminders, response rate, late nudges.',
    icon: CheckCircle2,
  },
  {
    key: 'seating',
    label: 'Seating Chart',
    description: 'Demo of the drag-and-drop seating planner with table layouts.',
    icon: MapPin,
  },
  {
    key: 'info',
    label: 'About Guests & RSVPs',
    description: 'Closing copy block on how OpusPass handles guest management digitally.',
    icon: Info,
  },
]

export default function OpusPassGuestsRsvpsCmsPage() {
  const opusPassUrl = process.env.NEXT_PUBLIC_OPUS_PASS_URL ?? 'http://localhost:3008'
  return (
    <div className="px-8 py-6">
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Guests &amp; RSVPs</h1>
          <p className="text-sm text-gray-600">
            Sections on the OpusPass guests and RSVPs page. Editors are coming online section by section.
          </p>
        </div>
        <Link
          href={`${opusPassUrl}/guests`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          View live site
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(({ key, label, description, icon: Icon }) => (
          <div
            key={key}
            className="relative rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-3"
          >
            <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              Coming soon
            </span>
            <div className="w-10 h-10 rounded-lg bg-[#F0DFF6] text-[#7E5896] flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">{label}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
