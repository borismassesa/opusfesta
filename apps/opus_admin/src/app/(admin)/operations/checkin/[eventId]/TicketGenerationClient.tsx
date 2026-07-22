'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  Printer,
  Sparkles,
  Ticket,
  Upload,
} from 'lucide-react'
import { cleanGuestText, GUEST_CSV_TEMPLATE, parseGuestRows, rowsToCsvText } from '@/lib/guest-csv'
import { parseXlsxFile, SpreadsheetError } from '@/lib/guest-xlsx'
import { importGuestsWithTickets, type ImportedGuestTicket } from '../actions'

export default function TicketGenerationClient({ eventId }: { eventId: string }) {
  const [importText, setImportText] = useState('')
  const [importPending, startImportTransition] = useTransition()
  const [importError, setImportError] = useState('')
  const [importSkipped, setImportSkipped] = useState<{ line: string; reason: string }[]>([])
  const [tickets, setTickets] = useState<ImportedGuestTicket[]>([])
  const [lastImportCount, setLastImportCount] = useState(0)
  const ticketsRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Live preview: parsed with the exact same CSV parser the server action
  // uses (lib/guest-csv.ts), so what's shown here is what will actually
  // get imported — no more finding out about a malformed row only after
  // committing writes to guest_contacts/guest_invitations.
  const preview = useMemo(() => parseGuestRows(importText), [importText])
  const hasPreview = importText.trim().length > 0

  const templateUrl = useMemo(
    () => `data:text/csv;charset=utf-8,${encodeURIComponent(GUEST_CSV_TEMPLATE)}`,
    [],
  )

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file after fixing it
    if (!file) return
    setImportError('')

    const isXlsx =
      file.name.toLowerCase().endsWith('.xlsx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    if (file.name.toLowerCase().endsWith('.xls')) {
      setImportError('Old .xls files aren’t supported — please re-save as .xlsx or .csv.')
      return
    }

    if (isXlsx) {
      // Round-trip the parsed worksheet through the same quoted-CSV text
      // the paste/CSV-upload path uses, rather than a second preview/
      // import code path — rowsToCsvText re-quotes anything with a comma,
      // so nothing is lost going from cells back to text. cleanGuestText
      // then strips the title/description preamble + header row so the
      // box doesn't bury 200 real guests under 2 lines of sheet metadata.
      parseXlsxFile(file)
        .then((rows) => setImportText(cleanGuestText(rowsToCsvText(rows))))
        .catch((err) => {
          setImportError(err instanceof SpreadsheetError ? err.message : 'Could not read that Excel file.')
        })
      return
    }

    file
      .text()
      .then((text) => setImportText(cleanGuestText(text)))
      .catch(() => setImportError('Could not read that file — try a plain .csv export.'))
  }

  function submitImport(e: React.FormEvent) {
    e.preventDefault()
    if (preview.rows.length === 0) return
    setImportError('')
    setLastImportCount(0)
    startImportTransition(async () => {
      const result = await importGuestsWithTickets(eventId, importText)
      if (!result.ok) {
        setImportError(result.error)
        return
      }
      setImportSkipped(result.skipped)
      setTickets((prev) => [...result.imported, ...prev])
      if (result.imported.length > 0) {
        setImportText('')
        setLastImportCount(result.imported.length)
        // Scroll to the freshly generated tickets so the result of a bulk
        // import (which can add many rows below the fold) is obvious
        // rather than silently appearing off-screen.
        requestAnimationFrame(() => ticketsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
      }
    })
  }

  return (
    <div className="space-y-5">
      {/* Guest list import + printable entry-pass tickets */}
      <div className="print:hidden rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Sparkles className="h-4 w-4" /> Import guest list &amp; generate tickets
            </h2>
            <p className="mt-1 max-w-xl text-xs text-gray-500">
              For guests who are already confirmed attending but aren&apos;t RSVPing themselves through OpusPass —
              upload a CSV or Excel file to generate their entry-pass QR, ready to be scanned at the door.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={templateUrl}
              download="guest-list-template.csv"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300"
            >
              <Download className="h-3.5 w-3.5" /> Template
            </a>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300"
            >
              <Upload className="h-3.5 w-3.5" /> Upload CSV/Excel
            </button>
          </div>
        </div>

        <form onSubmit={submitImport} className="mt-4 space-y-3">
          {/* Live preview — parsed with the exact same code the server
              action uses, so this is a true preview of what will be
              written, not a guess. Catches malformed rows (e.g. an
              un-quoted comma splitting a name in two) before any DB write
              happens, instead of only after clicking import. */}
          {hasPreview ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-[0_1px_6px_-3px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
                <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">Preview</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8FBDB] px-2.5 py-1 text-xs font-semibold text-[#3F8B5C]">
                  {preview.rows.length} guest{preview.rows.length === 1 ? '' : 's'} ready
                </span>
              </div>
              {preview.rows.length > 0 ? (
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="sticky top-0 bg-white text-[10px] font-semibold tracking-wide text-gray-400 uppercase shadow-[0_1px_0_rgba(0,0,0,0.06)]">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Name</th>
                        <th className="px-4 py-2 font-semibold">Contact</th>
                        <th className="px-4 py-2 text-center font-semibold">Party</th>
                        <th className="px-4 py-2 font-semibold">Group</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {preview.rows.map((r, i) => (
                        <tr key={i} className="transition-colors hover:bg-gray-50/70">
                          <td className="px-4 py-2">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F0DFF6] text-[10px] font-bold text-[#8e57b3] uppercase">
                                {r.fullName.slice(0, 1)}
                              </span>
                              <span className="truncate font-medium text-gray-900">{r.fullName}</span>
                            </div>
                          </td>
                          <td className="truncate px-4 py-2 text-gray-500 tabular-nums">{r.contact ?? '—'}</td>
                          <td className="px-4 py-2 text-center text-gray-500 tabular-nums">{r.partySize}</td>
                          <td className="px-4 py-2">
                            {r.groupTag ? (
                              <span className="inline-block max-w-[10rem] truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                {r.groupTag}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {preview.skipped.length > 0 ? (
                <div className="border-t border-amber-100 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
                  <p className="font-medium">
                    {preview.skipped.length} row{preview.skipped.length === 1 ? '' : 's'} will be skipped
                  </p>
                  {preview.skipped.map((s, i) => (
                    <p key={i} className="mt-0.5 text-amber-700">
                      {s.line} — {s.reason}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={preview.rows.length === 0 || importPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {importPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
              {preview.rows.length > 0
                ? `Import ${preview.rows.length} guest${preview.rows.length === 1 ? '' : 's'} & generate tickets`
                : 'Import & generate tickets'}
            </button>
            {tickets.length > 0 ? (
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:border-gray-300"
              >
                <Printer className="h-3.5 w-3.5" /> Print all tickets
              </button>
            ) : null}
          </div>
        </form>
        {importError ? <p className="mt-2 text-xs text-rose-600">{importError}</p> : null}
        {lastImportCount > 0 ? (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            {lastImportCount} ticket{lastImportCount === 1 ? '' : 's'} generated — scroll down or print below.
          </div>
        ) : null}
        {importSkipped.length > 0 ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div>
              <p className="font-medium">{importSkipped.length} row(s) skipped on import</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {importSkipped.map((s, i) => (
                  <li key={i}>
                    {s.line || '(blank)'} — {s.reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      {tickets.length > 0 ? (
        <div ref={ticketsRef} className="scroll-mt-6 rounded-xl border border-gray-200 bg-white p-5 print:border-0 print:p-0">
          <div className="flex items-center justify-between print:hidden">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Ticket className="h-4 w-4" /> Generated tickets ({tickets.length})
            </h2>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
          </div>
          {/* Tickets render as full artwork (1300x1881 viewBox) — a tall
              portrait pass, so they sit in a grid rather than stacking
              full-width. Two per row when printing puts two cut-apart
              tickets on each page. */}
          <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3 print:mt-0 print:grid-cols-2 print:gap-8">
            {tickets.map((t) => (
              <div key={t.invitationId} className="relative break-inside-avoid">
                {t.isNewGuest ? (
                  <span className="absolute -top-2 -right-2 z-10 inline-flex items-center rounded-full bg-[#F0DFF6] px-2 py-0.5 text-[10px] font-semibold text-[#8e57b3] shadow-sm print:hidden">
                    New guest
                  </span>
                ) : null}
                {/* No border/card chrome — the artwork carries its own
                    rounded ticket edge and side notches. */}
                <div
                  className="w-full [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: t.ticketSvg }}
                />
                {/* Screen-only: the artwork deliberately carries no guest
                    name (identification is by QR alone), so this caption is
                    the only way to tell whose ticket is whose in the list.
                    Kept off print — the handed-out ticket stays clean. */}
                <p className="mt-1.5 truncate text-center text-xs font-medium text-gray-600 print:hidden">
                  {t.fullName}
                  {t.groupTag ? <span className="text-gray-400"> · {t.groupTag}</span> : null}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
