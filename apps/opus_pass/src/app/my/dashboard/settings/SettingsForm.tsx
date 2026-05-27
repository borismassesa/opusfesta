'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Heart } from 'lucide-react'
import { Card, SectionTitle } from '@/components/dashboard/primitives'
import { Button, Field, inputClass } from '@/components/dashboard/controls'
import { upsertCoupleProfile } from '@/lib/dashboard/actions'
import type { CoupleProfileLite } from '@/lib/dashboard/queries'

export default function SettingsForm({ profile }: { profile: CoupleProfileLite | null }) {
  const [form, setForm] = useState({
    partner1_name: profile?.partner1_name ?? '',
    partner2_name: profile?.partner2_name ?? '',
    wedding_date: profile?.wedding_date ?? '',
    whatsapp_phone: profile?.whatsapp_phone ?? '',
    city: profile?.city ?? '',
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
        })
        toast.success('Profile saved')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not save')
      }
    })
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Settings" subtitle="Your details appear on guests' RSVP pages" />

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C9A0DC]/15 text-[#8e57b3]">
            <Heart className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold text-[#1A1A1A]">Couple profile</h3>
            <p className="text-sm text-[#1A1A1A]/55">How your celebration is introduced to guests</p>
          </div>
        </div>

        <div className="grid max-w-xl gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Partner 1 name">
              <input
                className={inputClass}
                value={form.partner1_name}
                onChange={(e) => setForm({ ...form, partner1_name: e.target.value })}
              />
            </Field>
            <Field label="Partner 2 name">
              <input
                className={inputClass}
                value={form.partner2_name}
                onChange={(e) => setForm({ ...form, partner2_name: e.target.value })}
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
          <div className="pt-2">
            <Button onClick={save} disabled={pending}>
              {pending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
