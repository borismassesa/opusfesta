import type { Metadata } from 'next'
import Link from 'next/link'
import {
  PlayCircle,
  CreditCard,
  Mail,
  Users,
  Globe,
  Ticket,
  ArrowRight,
  MessageCircle,
} from 'lucide-react'
import { FAQItem } from '@/app/invitations/FAQAccordion'

export const metadata: Metadata = {
  title: 'Help Centre | OpusPass',
  description:
    'Find answers about invitations, RSVPs, payments and your wedding website — or reach the OpusPass team directly. We reply within one business day.',
}

const TOPICS: {
  Icon: typeof PlayCircle
  title: string
  body: string
  href: string
  cta: string
}[] = [
  {
    Icon: PlayCircle,
    title: 'Getting started',
    body: 'Create your event, build a guest list and send your first invitation in minutes.',
    href: '/how-it-works',
    cta: 'See how it works',
  },
  {
    Icon: CreditCard,
    title: 'Pricing & payments',
    body: 'Per-guest packages, what each one includes, and the mobile-money and card options we accept.',
    href: '/pricing',
    cta: 'View pricing',
  },
  {
    Icon: Ticket,
    title: 'Invitations & cards',
    body: 'Choose a design, customise your wording, preview a proof and deliver by WhatsApp or SMS.',
    href: '/invitations',
    cta: 'Browse designs',
  },
  {
    Icon: Users,
    title: 'Guests & RSVPs',
    body: 'Track confirmations live, send reminders and scan tickets at the door on the day.',
    href: '/guests-and-rsvp',
    cta: 'Explore guest tools',
  },
  {
    Icon: Globe,
    title: 'Wedding website',
    body: 'Share your story, schedule, venue map and a bilingual RSVP page on a personal site.',
    href: '/websites',
    cta: 'See websites',
  },
  {
    Icon: Mail,
    title: 'Contact support',
    body: 'Still stuck? Reach the team by email or WhatsApp and we’ll reply within one business day.',
    href: '/contact',
    cta: 'Get in touch',
  },
]

const FAQS: { id: string; q: string; a: string }[] = [
  {
    id: 'create-event',
    q: 'How do I create my event and start inviting guests?',
    a: 'Sign in, open your dashboard and create an event with your names, date and venue. Add guests by typing them in or pasting from a spreadsheet, then send each one a personal invitation link by WhatsApp, SMS or email — replies land in your dashboard live.',
  },
  {
    id: 'cost',
    q: 'How much does OpusPass cost?',
    a: 'Pricing is per guest, and you choose from three packages — Essential, Elegant and Signature — so the price scales with your headcount. Every package includes the digital card, ticket, delivery and door check-in. See the Pricing page for the full breakdown and what each tier adds.',
  },
  {
    id: 'payment-methods',
    q: 'What payment methods can my guests and I use?',
    a: 'We accept M-Pesa, Airtel Money, Mixx by Yas and Selcom Pesa, plus Visa and Mastercard. Contribution collection (where guests pledge straight into one event account) is available on the Elegant and Signature packages.',
  },
  {
    id: 'guest-experience',
    q: 'What does a guest receive?',
    a: 'Each guest gets a digital invitation card with all your event details and a personal ticket with a unique barcode. They RSVP on a private bilingual page (English & Kiswahili), and on the day their ticket is scanned at the entrance to verify entry.',
  },
  {
    id: 'rsvp-tracking',
    q: 'Can I see who has confirmed and who has arrived?',
    a: 'Yes. Your RSVP dashboard shows live confirmations and headcount, and on the higher packages it tracks check-ins at the door and shows analytics — so you can plan food and seating accurately.',
  },
  {
    id: 'paper',
    q: 'Do you still offer printed paper cards?',
    a: 'Most couples go fully digital with a small print run for elders and VIPs. Paper card prints are available as an add-on on any package — just ask and we’ll arrange printing and delivery within Tanzania.',
  },
  {
    id: 'change-details',
    q: 'What if my venue or time changes after I’ve invited everyone?',
    a: 'You can message all guests at once from your dashboard — invitations, reminders or quick updates such as a venue or time change reach everyone instantly by WhatsApp or SMS.',
  },
  {
    id: 'support-speed',
    q: 'How quickly does support reply?',
    a: 'We reply to email and WhatsApp within one business day, and usually much faster during office hours. Reach us any time via the Contact page.',
  },
]

export default function HelpCentrePage() {
  return (
    <>
      {/* Hero */}
      <section className="px-4 sm:px-6 pt-20 sm:pt-28 pb-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] text-gray-500 mb-3">Help Centre</p>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-[#403d39]">
            How can we help?
          </h1>
          <p className="mt-5 text-[15px] sm:text-base text-gray-600 leading-relaxed mx-auto max-w-2xl">
            Answers about invitations, RSVPs, payments and your wedding website — plus a direct line
            to our team when you need a person.
          </p>
        </div>
      </section>

      {/* Topic cards */}
      <section className="px-4 sm:px-6 pb-4">
        <div className="mx-auto max-w-5xl grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map(({ Icon, title, body, href, cta }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2EFE9] text-[#5C6B4D]">
                <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-[17px] font-extrabold tracking-tight text-[#1A1A1A]">
                {title}
              </h2>
              <p className="mt-1.5 flex-1 text-[14px] text-gray-600 leading-relaxed">{body}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1A1A1A]">
                {cta}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular questions */}
      <section className="px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#403d39]">
            Popular questions
          </h2>
          <p className="mt-3 text-[15px] text-gray-600 leading-relaxed">
            The things couples ask us most. Can’t find your answer? We’re one message away.
          </p>
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white px-5 sm:px-7">
            {FAQS.map((f) => (
              <FAQItem key={f.id} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Still need help CTA */}
      <section className="px-4 sm:px-6 pb-24">
        <div className="mx-auto max-w-5xl rounded-3xl bg-[#1A1A1A] px-6 py-12 sm:px-12 sm:py-14 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl tracking-tight text-white">
            Still need a hand?
          </h2>
          <p className="mt-3 text-[14px] sm:text-[15px] text-gray-300 leading-relaxed mx-auto max-w-xl">
            Our team is based in Dar es Salaam and replies within one business day.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14px] font-bold text-[#1A1A1A] transition-colors hover:bg-gray-100"
            >
              <Mail className="h-[18px] w-[18px]" aria-hidden="true" />
              Contact us
            </Link>
            <a
              href="https://wa.me/255000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-white/10"
            >
              <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
