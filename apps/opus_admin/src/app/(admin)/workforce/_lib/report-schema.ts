// Shared, pure (no server-only) schema + helpers for the report-template
// system. Imported by the admin template builder, the employee dynamic
// form, the server actions, and the branded ReportDocument renderer — so
// it must stay free of server-only imports.
//
// A report TEMPLATE is an ordered list of sections. A report SUBMISSION
// stores `content` keyed by section id, with a value whose shape depends
// on the section's field type:
//   text | short_text  → string
//   department_select  → string (one of DEPARTMENTS)
//   number             → number | null
//   bullets            → string[]
//   grouped_bullets    → Record<groupId, string[]>
//   metrics_table      → MetricRow[]
//   goal_list          → GoalItem[]
//   blocker_list       → BlockerItem[]
//   followup_list      → FollowupItem[] (seeded from the prior period's
//                         goal_list section named by `followsSectionId`)

export type ReportFieldType =
  | 'text'
  | 'short_text'
  | 'department_select'
  | 'number'
  | 'bullets'
  | 'grouped_bullets'
  | 'metrics_table'
  | 'goal_list'
  | 'blocker_list'
  | 'followup_list'

export const REPORT_FIELD_TYPES: ReportFieldType[] = [
  'text',
  'short_text',
  'department_select',
  'number',
  'bullets',
  'grouped_bullets',
  'metrics_table',
  'goal_list',
  'blocker_list',
  'followup_list',
]

export const REPORT_FIELD_LABELS: Record<ReportFieldType, string> = {
  text: 'Paragraph',
  short_text: 'Short text',
  department_select: 'Department picker',
  number: 'Number',
  bullets: 'Bullet list',
  grouped_bullets: 'Grouped bullet list',
  metrics_table: 'Metrics table (name / this month / last month / target)',
  goal_list: 'Goal list (owner + target date)',
  blocker_list: 'Blocker list (waiting on + since)',
  followup_list: 'Follow-up on last period’s goals (auto-populated)',
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
  placeholder?: string // text | short_text — greyed-out example text
  groups?: ReportSectionGroup[] // grouped_bullets only
  // followup_list only — the id of the goal_list section (in this same
  // template) whose PRIOR submission's items get carried forward here.
  followsSectionId?: string
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
  recipientId: string | null
  recipientName: string | null
  recipientEmail: string | null
  recipientEmails: string[]
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
// Structured row shapes for the new field types.
// ---------------------------------------------------------------------------

export type MetricRow = { name: string; thisMonth: string; lastMonth: string; target: string }
export type GoalItem = { text: string; owner: string; targetDate: string }
export type BlockerItem = { text: string; waitingOn: string; since: string }
export type FollowupStatus = '' | 'done' | 'partial' | 'not_done'
export type FollowupItem = { text: string; status: FollowupStatus; reason: string }

export const FOLLOWUP_STATUS_LABELS: Record<Exclude<FollowupStatus, ''>, string> = {
  done: 'Done',
  partial: 'Partially done',
  not_done: 'Not done',
}

// ---------------------------------------------------------------------------
// Parsing — turn untrusted DB jsonb into a typed section array, dropping
// anything malformed so a bad row can't crash a render.
// ---------------------------------------------------------------------------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
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
      placeholder: typeof item.placeholder === 'string' ? item.placeholder : undefined,
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
    if (type === 'followup_list' && typeof item.followsSectionId === 'string') {
      section.followsSectionId = item.followsSectionId
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
    case 'department_select':
      return ''
    case 'number':
      return null
    case 'bullets':
      return ['']
    case 'grouped_bullets':
      return Object.fromEntries((section.groups ?? []).map((g) => [g.id, ['']]))
    case 'metrics_table':
      return []
    case 'goal_list':
      return []
    case 'blocker_list':
      return []
    case 'followup_list':
      return []
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

function asRecordArray(v: unknown): Record<string, unknown>[] {
  if (!Array.isArray(v)) return []
  return v.filter(isRecord)
}

function coerceMetricRow(r: Record<string, unknown>): MetricRow {
  return {
    name: str(r.name),
    thisMonth: str(r.thisMonth),
    lastMonth: str(r.lastMonth),
    target: str(r.target),
  }
}
function coerceGoalItem(r: Record<string, unknown>): GoalItem {
  return { text: str(r.text), owner: str(r.owner), targetDate: str(r.targetDate) }
}
function coerceBlockerItem(r: Record<string, unknown>): BlockerItem {
  return { text: str(r.text), waitingOn: str(r.waitingOn), since: str(r.since) }
}
function coerceFollowupItem(r: Record<string, unknown>): FollowupItem {
  const status = r.status
  return {
    text: str(r.text),
    status: status === 'done' || status === 'partial' || status === 'not_done' ? status : '',
    reason: str(r.reason),
  }
}

// Coerce a raw stored value into the canonical shape for a section type,
// so the form/renderer can rely on it. Strips empty bullet rows.
export function coerceValue(section: ReportSection, raw: unknown): unknown {
  switch (section.type) {
    case 'text':
    case 'short_text':
    case 'department_select':
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
    case 'metrics_table':
      return asRecordArray(raw).map(coerceMetricRow)
    case 'goal_list':
      return asRecordArray(raw).map(coerceGoalItem)
    case 'blocker_list':
      return asRecordArray(raw).map(coerceBlockerItem)
    case 'followup_list':
      return asRecordArray(raw).map(coerceFollowupItem)
  }
}

export function coerceContent(sections: ReportSection[], raw: unknown): ReportContent {
  const source = isRecord(raw) ? raw : {}
  const out: ReportContent = {}
  for (const s of sections) out[s.id] = coerceValue(s, source[s.id])
  return out
}

// Drop empty rows for storage/render; trims text.
export function cleanContent(sections: ReportSection[], content: ReportContent): ReportContent {
  const out: ReportContent = {}
  for (const s of sections) {
    const v = content[s.id]
    switch (s.type) {
      case 'text':
      case 'short_text':
      case 'department_select':
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
      case 'metrics_table':
        out[s.id] = asRecordArray(v)
          .map(coerceMetricRow)
          .map((r) => ({
            name: r.name.trim(),
            thisMonth: r.thisMonth.trim(),
            lastMonth: r.lastMonth.trim(),
            target: r.target.trim(),
          }))
          .filter((r) => r.name || r.thisMonth || r.lastMonth || r.target)
        break
      case 'goal_list':
        out[s.id] = asRecordArray(v)
          .map(coerceGoalItem)
          .map((r) => ({ text: r.text.trim(), owner: r.owner.trim(), targetDate: r.targetDate }))
          .filter((r) => r.text || r.owner || r.targetDate)
        break
      case 'blocker_list':
        out[s.id] = asRecordArray(v)
          .map(coerceBlockerItem)
          .map((r) => ({ text: r.text.trim(), waitingOn: r.waitingOn.trim(), since: r.since }))
          .filter((r) => r.text || r.waitingOn || r.since)
        break
      case 'followup_list':
        out[s.id] = asRecordArray(v)
          .map(coerceFollowupItem)
          .map((r) => ({ text: r.text.trim(), status: r.status, reason: r.reason.trim() }))
          .filter((r) => r.text)
        break
    }
  }
  return out
}

export function isSectionEmpty(section: ReportSection, value: unknown): boolean {
  switch (section.type) {
    case 'text':
    case 'short_text':
    case 'department_select':
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
    case 'metrics_table':
      return asRecordArray(value).map(coerceMetricRow).every((r) => !r.name.trim())
    case 'goal_list':
      return asRecordArray(value).map(coerceGoalItem).every((r) => !r.text.trim())
    case 'blocker_list':
      return asRecordArray(value).map(coerceBlockerItem).every((r) => !r.text.trim())
    case 'followup_list':
      // Auto-populated and informational — never blocks a required check,
      // even in a person's first month with nothing to follow up on.
      return false
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
export function readMetrics(content: ReportContent, section: ReportSection): MetricRow[] {
  return asRecordArray(content[section.id]).map(coerceMetricRow).filter((r) => r.name.trim())
}
export function readGoals(content: ReportContent, section: ReportSection): GoalItem[] {
  return asRecordArray(content[section.id]).map(coerceGoalItem).filter((r) => r.text.trim())
}
export function readBlockers(content: ReportContent, section: ReportSection): BlockerItem[] {
  return asRecordArray(content[section.id]).map(coerceBlockerItem).filter((r) => r.text.trim())
}
export function readFollowups(content: ReportContent, section: ReportSection): FollowupItem[] {
  return asRecordArray(content[section.id]).map(coerceFollowupItem).filter((r) => r.text.trim())
}

// Build the seed content for a followup_list section from the prior period's
// goal_list submission — carried-forward goals start with no status/reason.
export function seedFollowupFromGoals(goals: GoalItem[]): FollowupItem[] {
  return goals.filter((g) => g.text.trim()).map((g) => ({ text: g.text, status: '', reason: '' }))
}
