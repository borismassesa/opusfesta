/**
 * Guest-list CSV parsing for the bulk import + ticket-generation flow
 * (apps/opus_admin/src/app/(admin)/operations/checkin). Isomorphic — no
 * 'server-only'/'use client' directive — so the exact same parser drives
 * both the live client-side preview and the server action's actual
 * import, instead of two implementations quietly drifting apart.
 *
 * DUPLICATED (parseCsv) from apps/opus_pass/src/lib/dashboard/
 * import-spreadsheet.ts's RFC-4180-ish parser — same "no shared package
 * yet" situation as the rest of this feature. Deliberately does NOT
 * reuse that file's XLSX support; scope here is CSV/paste only for now.
 */

export interface ParsedGuestRow {
  fullName: string
  contact: string | null
  partySize: number
  groupTag: string | null
}

export interface GuestCsvSkip {
  line: string
  reason: string
}

export interface ParsedGuestCsv {
  rows: ParsedGuestRow[]
  skipped: GuestCsvSkip[]
}

/** Parse RFC-4180-ish CSV. Tolerates quoted fields (so "Smith, Jr." or a
 * comma-containing address survives) and `""` escapes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += ch
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0))
}

// ---------------------------------------------------------------- Header-aware column mapping
//
// Real-world guest lists (an ops team's working spreadsheet, a couple's
// export from wherever they tracked RSVPs) rarely match the documented
// 4-column paste order — they carry a Guest ID, Title, Side, Table No.,
// RSVP Status, and a dozen other columns in whatever order the sheet's
// author happened to use, often below a title/description preamble row
// or two. Reading by fixed column POSITION silently reads garbage (a
// Guest ID landing in the Name field) the moment the layout differs even
// slightly. Instead: scan for a header row, match each recognized column
// by its header TEXT, and ignore anything unrecognized. Falls back to the
// documented positional format (Name, Contact, Party, Group) only when no
// header row is found at all — e.g. a quick hand-typed paste.

const NAME_HEADERS = ['full name', 'name', 'guest name', 'guest']
const EMAIL_HEADERS = ['email', 'e-mail', 'email address']
const PHONE_HEADERS = ['phone', 'whatsapp', 'mobile', 'contact number', 'contact']
const PARTY_HEADERS = ['party size', 'party', 'guests', 'group size', 'confirmed count']
const GROUP_HEADERS = ['category', 'group', 'group tag', 'side', 'tag']

interface HeaderMap {
  nameIdx: number
  emailIdx: number
  phoneIdx: number
  partyIdx: number
  groupIdx: number
}

/** First column index whose header exactly matches (or contains, as a
 * fallback for compound headers like "Phone (WhatsApp/SMS)") one of the
 * candidate labels — -1 if none found. */
function matchHeaderColumn(headerCells: string[], candidates: string[]): number {
  const lc = headerCells.map((c) => c.trim().toLowerCase())
  for (const candidate of candidates) {
    const idx = lc.findIndex((c) => c === candidate)
    if (idx >= 0) return idx
  }
  for (const candidate of candidates) {
    const idx = lc.findIndex((c) => c.includes(candidate))
    if (idx >= 0) return idx
  }
  return -1
}

/** Scan the first few rows (tolerating title/description preamble rows
 * above the real header, which real spreadsheets commonly carry) for a
 * row that both names a "name"-like column AND at least one other
 * recognized column IN A DIFFERENT CELL — two distinct signals, so a
 * single free-text preamble sentence that merely happens to contain
 * words like "guests" or "WhatsApp" isn't mistaken for a header (a real
 * header has each concept in its own column; a sentence has them all in
 * one cell, at the same index, which this also guards against). Requires
 * at least 2 cells — a one-cell description line can never be a header. */
function detectHeader(table: string[][]): { headerRowIndex: number; map: HeaderMap } | null {
  const scanLimit = Math.min(table.length, 8)
  for (let i = 0; i < scanLimit; i++) {
    const cells = table[i]
    if (cells.length < 2) continue
    const nameIdx = matchHeaderColumn(cells, NAME_HEADERS)
    if (nameIdx < 0) continue
    const emailIdx = matchHeaderColumn(cells, EMAIL_HEADERS)
    const phoneIdx = matchHeaderColumn(cells, PHONE_HEADERS)
    const partyIdx = matchHeaderColumn(cells, PARTY_HEADERS)
    const groupIdx = matchHeaderColumn(cells, GROUP_HEADERS)
    const hasDistinctSecondSignal = [emailIdx, phoneIdx, partyIdx, groupIdx].some(
      (idx) => idx >= 0 && idx !== nameIdx,
    )
    if (!hasDistinctSecondSignal) continue
    return { headerRowIndex: i, map: { nameIdx, emailIdx, phoneIdx, partyIdx, groupIdx } }
  }
  return null
}

function cellAt(cells: string[], idx: number): string {
  return idx >= 0 ? (cells[idx] ?? '').trim() : ''
}

/**
 * Strip title/description preamble rows and the header row itself out of
 * the raw text — used to clean up what's SHOWN in the textarea on
 * upload/paste, not just what's parsed. Without this, parseGuestRows
 * correctly ignores the junk internally, but the admin still sees 200
 * data rows buried under 2 lines of spreadsheet title/description noise
 * every time they open the box.
 *
 * Assumes each parsed table row corresponds 1:1 to a raw text line, which
 * holds unless a quoted cell contains a literal embedded newline (none of
 * the real-world exports this was built against do) — simple line-slicing
 * instead of a full re-serialization round-trip.
 */
export function cleanGuestText(rawText: string): string {
  const normalized = rawText.replace(/\r\n?/g, '\n').trim()
  const table = parseCsv(normalized)
  const detected = detectHeader(table)
  if (!detected) return normalized
  return normalized
    .split('\n')
    .slice(detected.headerRowIndex + 1)
    .join('\n')
    .trim()
}

/** Serialize a table of cells back to CSV text, quoting any field that
 * contains a comma, quote, or newline. Inverse of parseCsv — used to feed
 * an .xlsx-derived table through the same text-based preview/import
 * pipeline as pasted/CSV-uploaded text, instead of a second code path. */
export function rowsToCsvText(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => (/[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell))
        .join(','),
    )
    .join('\n')
}

export const MAX_IMPORT_ROWS = 500

function toPartySize(raw: string): number {
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

/**
 * Parse pasted/uploaded guest-list text into structured rows. If a
 * recognizable header row is present (in any of the first few rows, past
 * any title/description preamble), columns are matched by header text —
 * extra columns (Guest ID, RSVP Status, Table No., ...) are ignored, and
 * column order doesn't matter. Without a header, falls back to the
 * documented positional format: `Full name, email or phone, party size,
 * group` per row.
 */
export function parseGuestRows(rawText: string): ParsedGuestCsv {
  const table = parseCsv(rawText.replace(/\r\n?/g, '\n').trim())
  const rows: ParsedGuestRow[] = []
  const skipped: GuestCsvSkip[] = []
  if (table.length === 0) return { rows, skipped }

  const detected = detectHeader(table)
  const dataRows = detected ? table.slice(detected.headerRowIndex + 1) : table

  dataRows.forEach((cells) => {
    const line = cells.join(', ')

    let fullName: string
    let contact: string | null
    let partySize: number
    let groupTag: string | null

    if (detected) {
      fullName = cellAt(cells, detected.map.nameIdx)
      const phone = cellAt(cells, detected.map.phoneIdx)
      const email = cellAt(cells, detected.map.emailIdx)
      contact = phone || email || null
      partySize = toPartySize(cellAt(cells, detected.map.partyIdx))
      groupTag = cellAt(cells, detected.map.groupIdx) || null
    } else {
      fullName = (cells[0] ?? '').trim()
      contact = cells[1]?.trim() || null
      partySize = toPartySize(cells[2] ?? '')
      groupTag = cells[3]?.trim() || null
    }

    if (!fullName) {
      skipped.push({ line: line || '(blank)', reason: 'Missing guest name' })
      return
    }
    rows.push({ fullName, contact, partySize, groupTag })
  })

  return { rows, skipped }
}

/** A ready-to-download CSV template with a header row + two example rows,
 * matching Excel/Sheets' own comma-quoting conventions so a round-tripped
 * export/import stays lossless. */
export const GUEST_CSV_TEMPLATE = [
  'Full name,Email or phone,Party size,Group',
  'Asha Mwakalinga,asha@example.com,2,Bride\'s Family',
  'John Doe,+255700000000,1,Groom\'s Friends',
].join('\n')
