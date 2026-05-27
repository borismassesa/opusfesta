'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Smartphone, Mail, AlertCircle, Check, Printer } from 'lucide-react'
import CheckoutStepper from '@/components/invitations/CheckoutStepper'
import { getContact, setContact, type DeliveryMode } from '@/lib/cart-storage'

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
      className={`text-left rounded-xl border-2 p-4 transition-colors ${
        active ? 'border-gray-900 bg-white' : 'border-gray-200 bg-white hover:border-gray-400'
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

  return (
    <>
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <Link
            href="/invitations/cart"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4"
          >
            ← Back to cart
          </Link>
          <CheckoutStepper current="contact" />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
            <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">How should we deliver?</h1>
              <p className="text-sm text-gray-600 mb-6">
                Digital invitations are sent via WhatsApp and email. Printed cards are mailed to you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
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
                  title="Printed cards"
                  caption="High-quality prints mailed to your address in 7–14 days."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Full name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); clearError('fullName') }}
                    placeholder="Mary Mwakasege"
                    aria-invalid={Boolean(errors.fullName)}
                    className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none ${
                      errors.fullName ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-gray-500'
                    }`}
                  />
                  {errors.fullName && <FieldError>{errors.fullName}</FieldError>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Email address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError('email') }}
                    placeholder="mary@example.com"
                    inputMode="email"
                    aria-invalid={Boolean(errors.email)}
                    className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none ${
                      errors.email ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-gray-500'
                    }`}
                  />
                  {errors.email && <FieldError>{errors.email}</FieldError>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    WhatsApp / phone number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); clearError('phone') }}
                    placeholder="+255 7xx xxx xxx"
                    inputMode="tel"
                    aria-invalid={Boolean(errors.phone)}
                    className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none ${
                      errors.phone ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-gray-500'
                    }`}
                  />
                  {errors.phone && <FieldError>{errors.phone}</FieldError>}
                </div>

                {mode === 'print' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        City / region <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-11 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:border-gray-500"
                      >
                        {TANZANIA_CITIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Street address <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={streetLine}
                        onChange={(e) => { setStreetLine(e.target.value); clearError('streetLine') }}
                        placeholder="House number, street, building name…"
                        aria-invalid={Boolean(errors.streetLine)}
                        className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none ${
                          errors.streetLine ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-gray-500'
                        }`}
                      />
                      {errors.streetLine && <FieldError>{errors.streetLine}</FieldError>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Delivery notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Gate code, landmarks, best time to call…"
                        rows={3}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none"
                      />
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleContinue}
                className="mt-7 w-full h-12 bg-gray-900 text-white font-semibold rounded-md hover:bg-gray-800 transition"
              >
                Continue to payment
              </button>
            </section>

            <aside className="space-y-5">
              <div className="rounded-2xl bg-white border border-gray-200 p-5">
                <h2 className="text-base font-bold text-gray-900 mb-3">What to expect</h2>
                <ul className="space-y-2.5 text-sm text-gray-700">
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                    Order confirmation sent immediately by email
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                    Our design team polishes your card within 24 hours
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                    One free round of revisions included
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                    Invitation links ready to share in WhatsApp
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}
