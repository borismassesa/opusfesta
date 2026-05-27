'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { Check, ChevronLeft, ChevronRight, Eye, FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  coerceContent,
  REPORT_CADENCE_LABELS,
  type ReportContent,
  type ReportSection,
  type ReportSubmission,
  type ReportTemplate,
} from '../../workforce/_lib/report-schema'
import { ReportViewerModal } from '../../workforce/_components/ReportDocument'
import type { SaveReportInput, SaveReportResult } from './actions'

type Mode =
  | { kind: 'list' }
  | { kind: 'edit'; template: ReportTemplate; existing: ReportSubmission | null }

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function MyReportsClient({
  templates,
  reports,
  today,
  saveReport,
}: {
  templates: ReportTemplate[]
  reports: ReportSubmission[]
  today: string
  saveReport: (input: SaveReportInput) => Promise<SaveReportResult>
}) {
  const [mode, setMode] = useState<Mode>({ kind: 'list' })
  const [viewing, setViewing] = useState<ReportSubmission | null>(null)

  if (mode.kind === 'edit') {
    return (
      <ReportForm
        template={mode.template}
        existing={mode.existing}
        today={today}
        saveReport={saveReport}
        onClose={() => setMode({ kind: 'list' })}
      />
    )
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          Write a report
        </h2>
        {templates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-gray-900">No report types available</p>
            <p className="mt-1 text-xs text-gray-500">
              Ask an admin to set up a report template for your team.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMode({ kind: 'edit', template: t, existing: null })}
                className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-[#C9A0DC] hover:shadow-[0_8px_24px_-12px_rgba(107,78,140,0.45)]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0DFF6] text-[#6B4E8C]">
                  <FileText className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{t.name}</span>
                    <span className="inline-flex items-center rounded-full bg-[#9FE870]/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-900">
                      {REPORT_CADENCE_LABELS[t.cadence]}
                    </span>
                  </span>
                  {t.description && (
                    <span className="mt-1 block text-xs leading-relaxed text-gray-500">{t.description}</span>
                  )}
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#6B4E8C]" />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          History <span className="ml-2 font-normal text-gray-400">{reports.length}</span>
        </h2>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          {reports.length === 0 ? (
            <p className="px-5 py-6 text-center text-xs text-gray-400">
              No reports yet. Your submissions will show up here.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {reports.map((r) => {
                const template = templates.find((t) => t.id === r.templateId)
                return (
                  <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{r.templateName}</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${r.status === 'submitted' ? 'bg-[#9FE870]/30 text-gray-900' : 'bg-amber-50 text-amber-700'}`}
                        >
                          {r.status === 'submitted' ? 'Submitted' : 'Draft'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">{formatDate(r.reportDate)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewing(r)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3" /> View
                      </button>
                      {template && (
                        <button
                          type="button"
                          onClick={() => setMode({ kind: 'edit', template, existing: r })}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      {viewing && <ReportViewerModal submission={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

function ReportForm({
  template,
  existing,
  today,
  saveReport,
  onClose,
}: {
  template: ReportTemplate
  existing: ReportSubmission | null
  today: string
  saveReport: (input: SaveReportInput) => Promise<SaveReportResult>
  onClose: () => void
}) {
  const router = useRouter()
  const [reportDate, setReportDate] = useState(existing?.reportDate ?? today)
  const [periodEnd, setPeriodEnd] = useState(existing?.periodEnd ?? '')
  const [content, setContent] = useState<ReportContent>(
    coerceContent(template.sections, existing?.content ?? {}),
  )
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Anything that spans more than a day collects a period-end date.
  const showPeriod = template.cadence !== 'daily'

  function setValue(sectionId: string, value: unknown) {
    setContent((prev) => ({ ...prev, [sectionId]: value }))
  }

  function submit(status: 'draft' | 'submitted') {
    setError(null)
    startTransition(async () => {
      const result = await saveReport({
        templateId: template.id,
        reportDate,
        periodEnd: showPeriod ? periodEnd || null : null,
        content,
        status,
      })
      if (result.ok) {
        router.refresh()
        onClose()
      } else {
        setError(result.error)
      }
    })
  }

  const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-gray-500'

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-bold text-gray-900">{template.name}</h2>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] sm:p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className={labelCls}>{showPeriod ? 'Period start' : 'Date'}</label>
            <input
              type="date"
              value={reportDate}
              max={today}
              onChange={(e) => setReportDate(e.target.value)}
              className="mt-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </div>
          {showPeriod && (
            <div>
              <label className={labelCls}>Period end</label>
              <input
                type="date"
                value={periodEnd}
                min={reportDate}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="mt-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="mt-6 space-y-6">
          {template.sections.map((section) => (
            <SectionInput
              key={section.id}
              section={section}
              value={content[section.id]}
              onChange={(v) => setValue(section.id, v)}
            />
          ))}
        </div>

        {error && <p role="alert" className="mt-4 text-xs font-medium text-rose-600">{error}</p>}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => submit('draft')}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Save draft
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => submit('submitted')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#9FE870] px-4 py-2 text-sm font-bold text-gray-900 hover:bg-[#8fd862] active:translate-y-[1px] disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> Submit report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionInput({
  section,
  value,
  onChange,
}: {
  section: ReportSection
  value: unknown
  onChange: (v: unknown) => void
}) {
  const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-gray-500'
  const inputCls =
    'mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none'

  return (
    <div>
      <label className={labelCls}>
        {section.title}
        {section.required && <span className="ml-1 text-rose-500">*</span>}
        {!section.required && <span className="ml-1 font-normal normal-case text-gray-400">(optional)</span>}
      </label>
      {section.help && <p className="mt-0.5 text-[11px] text-gray-400">{section.help}</p>}

      {section.type === 'text' && (
        <textarea
          rows={4}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} resize-y`}
        />
      )}

      {section.type === 'short_text' && (
        <input
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}

      {section.type === 'number' && (
        <input
          type="number"
          value={value === null || value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className={`${inputCls} sm:w-40`}
        />
      )}

      {section.type === 'bullets' && (
        <BulletList
          items={Array.isArray(value) ? (value as string[]) : ['']}
          onChange={(items) => onChange(items)}
        />
      )}

      {section.type === 'grouped_bullets' && (
        <div className="mt-2 space-y-4">
          {(section.groups ?? []).map((g) => {
            const src = (value && typeof value === 'object' ? (value as Record<string, unknown>) : {})
            const items = Array.isArray(src[g.id]) ? (src[g.id] as string[]) : ['']
            const count = items.filter((x) => x.trim()).length
            return (
              <div key={g.id} className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-700">
                  {g.label} ({count})
                </p>
                <BulletList
                  items={items}
                  onChange={(next) => onChange({ ...src, [g.id]: next })}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BulletList({
  items,
  onChange,
}: {
  items: string[]
  onChange: (items: string[]) => void
}) {
  const rows = items.length > 0 ? items : ['']
  return (
    <div className="mt-2 space-y-2">
      {rows.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-gray-300">•</span>
          <input
            value={it}
            onChange={(e) => {
              const next = [...rows]
              next[i] = e.target.value
              onChange(next)
            }}
            placeholder="Add an item…"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
            className="shrink-0 rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, ''])}
        className="inline-flex items-center gap-1 rounded-lg border border-dashed border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
      >
        <Plus className="h-3 w-3" /> Add item
      </button>
    </div>
  )
}
