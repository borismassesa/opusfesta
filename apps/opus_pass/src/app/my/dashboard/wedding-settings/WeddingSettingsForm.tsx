'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Heart, Wallet, ArrowLeft } from 'lucide-react'
import { Button, Field, inputClass } from '@/components/dashboard/controls'
import { upsertCoupleProfile } from '@/lib/dashboard/actions'
import type { CoupleProfileLite } from '@/lib/dashboard/queries'

export default function WeddingSettingsForm({ profile }: { profile: CoupleProfileLite | null }) {
  const [form, setForm] = useState({
    partner1_name: profile?.partner1_name ?? '',
    partner2_name: profile?.partner2_name ?? '',
    wedding_date: profile?.wedding_date ?? '',
    whatsapp_phone: profile?.whatsapp_phone ?? '',
    city: profile?.city ?? '',
    pledge_payment_instructions: profile?.pledge_payment_instructions ?? '',
    pledge_goal_amount: profile?.pledge_goal_amount ? String(profile.pledge_goal_amount) : '',
  })
  const [pending, startTransition] = useTransition()

  function save() {
    if (!form.partner1_name.trim()) {
      toast.error('Enter at least one name')
      return
    }
    startTransition(async () => {
      try {
        await upsertCoupleProfile({
          partner1_name: form.partner1_name,
          partner2_name: form.partner2_name || null,
          wedding_date: form.wedding_date || null,
          whatsapp_phone: form.whatsapp_phone || null,
          city: form.city || null,
          pledge_payment_instructions: form.pledge_payment_instructions || null,
          pledge_goal_amount: form.pledge_goal_amount ? Number(form.pledge_goal_amount) : null,
        })
        toast.success('Saved')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not save')
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7 pb-16">
      <div>
        <Link
          href="/my/dashboard/settings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A]/55 transition-colors hover:text-[#1A1A1A]"
        >
          <ArrowLeft className="h-4 w-4" /> Account profile
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1A1A1A]">Wedding settings</h1>
        <p className="mt-1 text-sm text-[#1A1A1A]/55">
          Your celebration details and how contributors pay you.
        </p>
      </div>

      {/* ── Wedding details ── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C9A0DC]/15 text-[#7E5896]">
            <Heart className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold text-[#1A1A1A]">Wedding details</h3>
            <p className="text-sm text-[#1A1A1A]/55">
              How your celebration appears on guests&rsquo; RSVP pages
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Partner 1 name">
              <input
                className={inputClass}
                value={form.partner1_name}
                onChange={(e) => setForm({ ...form, partner1_name: e.target.value })}
                placeholder="e.g. Boris"
              />
            </Field>
            <Field label="Partner 2 name">
              <input
                className={inputClass}
                value={form.partner2_name}
                onChange={(e) => setForm({ ...form, partner2_name: e.target.value })}
                placeholder="e.g. Grace"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Wedding date">
              <input
                type="date"
                className={inputClass}
                value={form.wedding_date}
                onChange={(e) => setForm({ ...form, wedding_date: e.target.value })}
              />
            </Field>
            <Field label="City">
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Dar es Salaam"
              />
            </Field>
          </div>
          <Field label="WhatsApp number" hint="So guests can reach you with questions">
            <input
              className={inputClass}
              value={form.whatsapp_phone}
              onChange={(e) => setForm({ ...form, whatsapp_phone: e.target.value })}
              placeholder="07XX XXX XXX"
            />
          </Field>
        </div>
      </section>

      {/* ── Pledge collection ── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C9A0DC]/15 text-[#7E5896]">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold text-[#1A1A1A]">Pledge collection</h3>
            <p className="text-sm text-[#1A1A1A]/55">
              How contributors pay you — shown on your pledge link and reminders
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <Field
            label="Fundraising goal (optional)"
            hint="Set a target and the Reports tab shows progress toward it. Leave blank for no goal."
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#1A1A1A]/45">
                TSh
              </span>
              <input
                type="number"
                min={0}
                step={1000}
                inputMode="numeric"
                className={`${inputClass} pl-12`}
                value={form.pledge_goal_amount}
                onChange={(e) => setForm({ ...form, pledge_goal_amount: e.target.value })}
                placeholder="e.g. 5000000"
              />
            </div>
          </Field>
          <Field
            label="How to pay (mobile money / bank)"
            hint="e.g. M-Pesa Lipa Namba 1234567 (Name) · Mixx by Yas 0712 345 678 · Selcom Pesa 0786 …"
          >
            <textarea
              rows={4}
              className={inputClass}
              value={form.pledge_payment_instructions}
              onChange={(e) => setForm({ ...form, pledge_payment_instructions: e.target.value })}
              placeholder={'M-Pesa: Lipa Namba 1234567 (Boris Massesa)\nMixx by Yas: 0712 345 678\nSelcom Pesa: 0786 000 111'}
            />
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 pt-1">
        <Button onClick={save} disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}
