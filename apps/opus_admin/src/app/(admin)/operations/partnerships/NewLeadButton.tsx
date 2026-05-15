'use client'

import { useRef, useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { createPartnershipLead } from './actions'

// "+ New lead" CTA + the modal form behind it. Lives in the header
// portal via the page. Submits to the createPartnershipLead server
// action; on success closes itself and the page revalidates so the
// new row appears in the table.

export default function NewLeadButton() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function submit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await createPartnershipLead(formData)
        setOpen(false)
        formRef.current?.reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create lead.')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700"
      >
        <Plus className="h-3.5 w-3.5" /> New lead
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            <header className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-sm font-bold text-gray-900">New partnership lead</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                A row in your inbox the team can move through the pipeline.
              </p>
            </header>
            <form ref={formRef} action={submit} className="px-6 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Contact name *" name="contact_name" required />
                <Field label="Contact email *" name="contact_email" type="email" required />
                <Field label="Contact phone" name="contact_phone" type="tel" />
                <Field label="Company name" name="company_name" />
                <Select
                  label="Type"
                  name="lead_type"
                  options={['Brand', 'Agency', 'Vendor', 'Influencer', 'Other']}
                  defaultValue="Brand"
                />
                <Select
                  label="Source"
                  name="source"
                  options={['Web form', 'Email', 'Referral', 'Outreach', 'Event', 'Direct']}
                  defaultValue="Direct"
                />
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                    placeholder="Context, decisions made, links…"
                  />
                </div>
              </div>

              {error && (
                <p className="mt-3 text-xs text-rose-600" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  {pending ? 'Saving…' : 'Save lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
      />
    </label>
  )
}

function Select({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string
  name: string
  options: string[]
  defaultValue?: string
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}
