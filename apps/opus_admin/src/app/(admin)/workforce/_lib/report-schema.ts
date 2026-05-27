// Shared, pure (no server-only) schema + helpers for the report-template
// system. Imported by the admin template builder, the employee dynamic
// form, the server actions, and the branded ReportDocument renderer — so
// it must stay free of server-only imports.
//
// A report TEMPLATE is an ordered list of sections. A report SUBMISSION
// stores `content` keyed by section id, with a value whose shape depends
// on the section's field type:
//   text | short_text → string
//   number            → number | null
//   bullets           → string[]
//   grouped_bullets    → Record<groupId, string[]>

export type ReportFieldType =
  | 'text'
  | 'short_text'
  | 'number'
  | 'bullets'
  | 'grouped_bullets'

export const REPORT_FIELD_TYPES: ReportFieldType[] = [
  'text',
  'short_text',
  'number',
  'bullets',
  'grouped_bullets',
]

export const REPORT_FIELD_LABELS: Record<ReportFieldType, string> = {
  text: 'Paragraph',
  short_text: 'Short text',
  number: 'Number',
  bullets: 'Bullet list',
  grouped_bullets: 'Grouped bullet list',
}

export type ReportCadence = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
export const REPORT_CADENCES: ReportCadence[] = [
  'daily',
  'weekly',
  'biweekly',
  'monthly',
  'quarterly',
]
export const REPORT_CADENCE_LABELS: Record<ReportCadence, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Biweekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
}

export type ReportSectionGroup = { id: string; label: string }

export type ReportSection = {
  id: string
  title: string
  type: ReportFieldType
  required?: boolean
  help?: string
  groups?: ReportSectionGroup[] // grouped_bullets only
}

export type ReportTemplate = {
  id: string
  slug: string
  name: string
  description: string | null
  cadence: ReportCadence
  departments: string[] // empty = all departments
  sections: ReportSection[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ReportContent = Record<string, unknown>

export type ReportStatus = 'draft' | 'submitted'

export type ReportSubmission = {
  id: string
  templateId: string | null
  templateSlug: string
  templateName: string
  sections: ReportSection[] // from snapshot, falls back to the live template
  employeeId: string
  employeeName: string
  employeeCode: string
  department: string
  avatarColor: string
  avatarUrl: string | null
  reportDate: string
  periodEnd: string | null
  status: ReportStatus
  content: ReportContent
  preparedByName: string | null
  preparedByRole: string | null
  submittedAt: string | null
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Parsing — turn untrusted DB jsonb into a typed section array, dropping
// anything malformed so a bad row can't crash a render.
// ---------------------------------------------------------------------------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function parseSections(raw: unknown): ReportSection[] {
  if (!Array.isArray(raw)) return []
  const out: ReportSection[] = []
  for (const item of raw) {
    if (!isRecord(item)) continue
    const id = typeof item.id === 'string' ? item.id : ''
    const title = typeof item.title === 'string' ? item.title : ''
    const type = item.type as ReportFieldType
    if (!id || !title || !REPORT_FIELD_TYPES.includes(type)) continue
    const section: ReportSection = {
      id,
      title,
      type,
      required: item.required === true,
      help: typeof item.help === 'string' ? item.help : undefined,
    }
    if (type === 'grouped_bullets' && Array.isArray(item.groups)) {
      section.groups = item.groups
        .filter(isRecord)
        .map((g) => ({
          id: typeof g.id === 'string' ? g.id : '',
          label: typeof g.label === 'string' ? g.label : '',
        }))
        .filter((g) => g.id && g.label)
    }
    out.push(section)
  }
  return out
}

// ---------------------------------------------------------------------------
// Content helpers — normalize / read / validate values per section type.
// ---------------------------------------------------------------------------

export function emptyValueForSection(section: ReportSection): unknown {
  switch (section.type) {
    case 'text':
    case 'short_text':
      return ''
    case 'number':
      return null
    case 'bullets':
      return ['']
    case 'grouped_bullets':
      return Object.fromEntries((section.groups ?? []).map((g) => [g.id, ['']]))
  }
}

export function emptyContent(sections: ReportSection[]): ReportContent {
  const out: ReportContent = {}
  for (const s of sections) out[s.id] = emptyValueForSection(s)
  return out
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string')
}

// Coerce a raw stored value into the canonical shape for a section type,
// so the form/renderer can rely on it. Strips empty bullet rows.
export function coerceValue(section: ReportSection, raw: unknown): unknown {
  switch (section.type) {
    case 'text':
    case 'short_text':
      return typeof raw === 'string' ? raw : ''
    case 'number':
      if (raw === null || raw === '' || raw === undefined) return null
      return Number.isFinite(Number(raw)) ? Number(raw) : null
    case 'bullets': {
      const arr = asStringArray(raw)
      return arr.length > 0 ? arr : ['']
    }
    case 'grouped_bullets': {
      const obj: Record<string, string[]> = {}
      const source = isRecord(raw) ? raw : {}
      for (const g of section.groups ?? []) {
        const arr = asStringArray(source[g.id])
        obj[g.id] = arr.length > 0 ? arr : ['']
      }
      return obj
    }
  }
}

export function coerceContent(sections: ReportSection[], raw: unknown): ReportContent {
  const source = isRecord(raw) ? raw : {}
  const out: ReportContent = {}
  for (const s of sections) out[s.id] = coerceValue(s, source[s.id])
  return out
}

// Drop empty bullet rows for storage/render; trims text.
export function cleanContent(sections: ReportSection[], content: ReportContent): ReportContent {
  const out: ReportContent = {}
  for (const s of sections) {
    const v = content[s.id]
    switch (s.type) {
      case 'text':
      case 'short_text':
        out[s.id] = typeof v === 'string' ? v.trim() : ''
        break
      case 'number':
        out[s.id] = v === null || v === '' || v === undefined ? null : Number(v)
        break
      case 'bullets':
        out[s.id] = asStringArray(v).map((x) => x.trim()).filter(Boolean)
        break
      case 'grouped_bullets': {
        const src = isRecord(v) ? v : {}
        const obj: Record<string, string[]> = {}
        for (const g of s.groups ?? []) {
          obj[g.id] = asStringArray(src[g.id]).map((x) => x.trim()).filter(Boolean)
        }
        out[s.id] = obj
        break
      }
    }
  }
  return out
}

export function isSectionEmpty(section: ReportSection, value: unknown): boolean {
  switch (section.type) {
    case 'text':
    case 'short_text':
      return typeof value !== 'string' || value.trim().length === 0
    case 'number':
      return value === null || value === undefined || value === '' || !Number.isFinite(Number(value))
    case 'bullets':
      return asStringArray(value).every((x) => x.trim().length === 0)
    case 'grouped_bullets': {
      const src = isRecord(value) ? value : {}
      return (section.groups ?? []).every((g) =>
        asStringArray(src[g.id]).every((x) => x.trim().length === 0),
      )
    }
  }
}

// Returns the first required section that's empty, or null if valid.
export function validateContent(
  sections: ReportSection[],
  content: ReportContent,
): { ok: true } | { ok: false; error: string } {
  for (const s of sections) {
    if (s.required && isSectionEmpty(s, content[s.id])) {
      return { ok: false, error: `“${s.title}” is required.` }
    }
  }
  return { ok: true }
}

// Read helpers for renderers.
export function readText(content: ReportContent, section: ReportSection): string {
  const v = content[section.id]
  return typeof v === 'string' ? v : ''
}
export function readNumber(content: ReportContent, section: ReportSection): number | null {
  const v = content[section.id]
  return v === null || v === undefined || v === '' ? null : Number(v)
}
export function readBullets(content: ReportContent, section: ReportSection): string[] {
  return asStringArray(content[section.id]).filter((x) => x.trim().length > 0)
}
export function readGroupedBullets(
  content: ReportContent,
  section: ReportSection,
): Array<{ id: string; label: string; items: string[] }> {
  const src = isRecord(content[section.id]) ? (content[section.id] as Record<string, unknown>) : {}
  return (section.groups ?? []).map((g) => ({
    id: g.id,
    label: g.label,
    items: asStringArray(src[g.id]).filter((x) => x.trim().length > 0),
  }))
}
