'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Smartphone, Mail, AlertCircle, Check, Printer, ArrowRight } from 'lucide-react'
import CheckoutStepper from '@/components/invitations/CheckoutStepper'
import { getContact, setContact, type DeliveryMode } from '@/lib/cart-storage'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const TANZANIA_CITIES = [
  'Dar es Salaam',
  'Arusha',
  'Zanzibar',
  'Mwanza',
  'Moshi',
  'Dodoma',
  'Tanga',
  'Bagamoyo',
  'Mbeya',
  'Iringa',
]

type Errors = Partial<Record<'fullName' | 'email' | 'phone' | 'streetLine', string>>

const PHONE_RE = /^\+?(?:[\d](?:[\s().-]?)){9,}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Shared field chrome — mirrors the shadcn <Input> so <select>/<textarea> match.
const FIELD =
  'border-input bg-transparent shadow-xs flex w-full rounded-md border px-3 py-1 text-base outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm'

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-xs text-red-600 inline-flex items-center gap-1">
      <AlertCircle size={12} />
      {children}
    </p>
  )
}

function ModeCard({
  active,
  onClick,
  Icon,
  title,
  caption,
}: {
  active: boolean
  onClick: () => void
  Icon: typeof Mail
  title: string
  caption: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left rounded-xl border bg-white p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]/15 ${
        active ? 'border-[#1A1A1A] ring-1 ring-[#1A1A1A]' : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon size={20} className="mt-0.5 text-gray-700 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{caption}</p>
        </div>
      </div>
    </button>
  )
}

export default function AddressPage() {
  const router = useRouter()
  const [mode, setMode] = useState<DeliveryMode>('digital')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Dar es Salaam')
  const [streetLine, setStreetLine] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    const stored = getContact()
    if (stored) {
      setMode(stored.mode)
      setFullName(stored.fullName)
      setEmail(stored.email)
      setPhone(stored.phone)
      if (stored.city) setCity(stored.city)
      if (stored.streetLine) setStreetLine(stored.streetLine)
      if (stored.notes) setNotes(stored.notes)
    }
  }, [])

  const clearError = (key: keyof Errors) =>
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })

  const validate = (): Errors => {
    const e: Errors = {}
    if (!fullName.trim()) e.fullName = 'Please enter your full name.'
    if (!EMAIL_RE.test(email.trim())) e.email = 'Enter a valid email address.'
    if (!PHONE_RE.test(phone.trim())) e.phone = 'Enter a valid phone number.'
    if (mode === 'print' && !streetLine.trim()) e.streetLine = 'Please enter your mailing address.'
    return e
  }

  const handleContinue = () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setContact({
      mode,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city,
      streetLine: streetLine.trim(),
      notes: notes.trim(),
    })
    router.push('/invitations/checkout')
  }

  // What-to-expect checklist — adapts to the chosen delivery mode.
  const expectations = [
    'Instant order confirmation in your inbox',
    'Your design personalised by our team within 24 hours',
    'One free round of revisions to get every detail right',
    'A shareable invitation link for WhatsApp, SMS & email',
    'Live RSVP tracking as your guests respond',
    'An OpusPass ticket with QR code — save it to Apple or Google Wallet and scan at the entrance',
    ...(mode === 'print'
      ? ['High-quality printed cards mailed to you in 7–14 days']
      : []),
  ]

  return (
    <main className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <Link
          href="/invitations/cart"
          className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4"
        >
          ← Back to cart
        </Link>
        <CheckoutStepper current="contact" />

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
          <Card className="border-0 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.12)]">
            <CardHeader className="gap-2">
              <CardTitle className="text-2xl font-semibold">How should we deliver?</CardTitle>
              <CardDescription className="text-sm">
                Every order includes your digital invitation, sent via WhatsApp and email. Add printed cards to have them mailed to you too.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ModeCard
                  active={mode === 'digital'}
                  onClick={() => setMode('digital')}
                  Icon={Smartphone}
                  title="Digital delivery"
                  caption="Sent via WhatsApp, SMS, and email within 24 hours of payment."
                />
                <ModeCard
                  active={mode === 'print'}
                  onClick={() => setMode('print')}
                  Icon={Printer}
                  title="Digital + printed cards"
                  caption="Everything digital, plus high-quality prints mailed to your address in 7–14 days."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <Label className="mb-1.5 text-gray-900">
                    Full name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); clearError('fullName') }}
                    placeholder="Mary Mwakasege"
                    aria-invalid={Boolean(errors.fullName)}
                  />
                  {errors.fullName && <FieldError>{errors.fullName}</FieldError>}
                </div>
                <div>
                  <Label className="mb-1.5 text-gray-900">
                    Email address <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError('email') }}
                    placeholder="mary@example.com"
                    inputMode="email"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <FieldError>{errors.email}</FieldError>}
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 text-gray-900">
                    WhatsApp / phone number <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); clearError('phone') }}
                    placeholder="+255 7xx xxx xxx"
                    inputMode="tel"
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone && <FieldError>{errors.phone}</FieldError>}
                </div>

                {mode === 'print' && (
                  <>
                    <div>
                      <Label className="mb-1.5 text-gray-900">
                        City / region <span className="text-red-600">*</span>
                      </Label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={`${FIELD} h-9 bg-white`}
                      >
                        {TANZANIA_CITIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="mb-1.5 text-gray-900">
                        Street address <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={streetLine}
                        onChange={(e) => { setStreetLine(e.target.value); clearError('streetLine') }}
                        placeholder="House number, street, building name…"
                        aria-invalid={Boolean(errors.streetLine)}
                      />
                      {errors.streetLine && <FieldError>{errors.streetLine}</FieldError>}
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="mb-1.5 text-gray-900">Delivery notes</Label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Gate code, landmarks, best time to call…"
                        rows={3}
                        className={`${FIELD} min-h-20 resize-none py-2`}
                      />
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-(--accent) px-6 py-3.5 text-[13px] font-extrabold uppercase tracking-[0.06em] text-(--on-accent) transition hover:bg-(--accent-hover)"
              >
                Continue to payment
                <ArrowRight size={15} className="shrink-0" />
              </button>
            </CardContent>
          </Card>

          <aside className="space-y-5">
            <Card className="border-0 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">What to expect</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm text-gray-700">
                  {expectations.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  )
}
