// Server-only queries for workforce employee records — resume, skills,
// certifications, badges, onboarding documents. Each function reads via
// the service-role admin client and maps Supabase snake_case columns to
// the camelCase shape the UI consumes.

import 'server-only'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type {
  Certification,
  EmployeeBadge,
  EmployeeDocument,
  EmployeeSkill,
  RecordAttachment,
  ResumeEntry,
} from './types'

// Build the shared attachment shape from the four raw columns. Returns
// null when no file is attached (no storage_path) so consumers can do
// a single null-check instead of testing every column.
function makeAttachment(row: {
  storage_path: string | null
  file_name: string | null
  file_size_bytes: number | null
  mime_type: string | null
}): RecordAttachment | null {
  if (!row.storage_path) return null
  return {
    storagePath: row.storage_path,
    fileName: row.file_name,
    fileSizeBytes: row.file_size_bytes ?? null,
    mimeType: row.mime_type,
  }
}

// -----------------------------------------------------------------------------
// Resume entries
// -----------------------------------------------------------------------------

type ResumeEntryRow = {
  id: string
  employee_id: string
  entry_type: 'experience' | 'education' | 'project'
  title: string
  organization: string | null
  location: string | null
  start_date: string
  end_date: string | null
  description: string | null
  storage_path: string | null
  file_name: string | null
  file_size_bytes: number | null
  mime_type: string | null
}

const RESUME_COLUMNS =
  'id, employee_id, entry_type, title, organization, location, start_date, end_date, description, storage_path, file_name, file_size_bytes, mime_type'

function mapResumeEntry(row: ResumeEntryRow): ResumeEntry {
  return {
    id: row.id,
    employeeId: row.employee_id,
    entryType: row.entry_type,
    title: row.title,
    organization: row.organization,
    location: row.location,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    attachment: makeAttachment(row),
  }
}

export async function getResumeEntries(employeeId: string): Promise<ResumeEntry[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_employee_resume_entries')
    .select(RESUME_COLUMNS)
    .eq('employee_id', employeeId)
    // Most recent first; NULL end_date sorts as "current" — still by
    // start_date so the entries timeline reads top-down by recency.
    .order('start_date', { ascending: false })
    .returns<ResumeEntryRow[]>()
  if (error) throw new Error(`[workforce] getResumeEntries: ${error.message}`)
  return (data ?? []).map(mapResumeEntry)
}

// -----------------------------------------------------------------------------
// Skills
// -----------------------------------------------------------------------------

type SkillRow = {
  id: string
  employee_id: string
  category: 'language' | 'soft' | 'technical' | 'other'
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  proficiency_percent: number
}

const SKILL_COLUMNS = 'id, employee_id, category, name, level, proficiency_percent'

function mapSkill(row: SkillRow): EmployeeSkill {
  return {
    id: row.id,
    employeeId: row.employee_id,
    category: row.category,
    name: row.name,
    level: row.level,
    proficiencyPercent: row.proficiency_percent,
  }
}

export async function getEmployeeSkills(employeeId: string): Promise<EmployeeSkill[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_employee_skills')
    .select(SKILL_COLUMNS)
    .eq('employee_id', employeeId)
    .order('category', { ascending: true })
    .order('name', { ascending: true })
    .returns<SkillRow[]>()
  if (error) throw new Error(`[workforce] getEmployeeSkills: ${error.message}`)
  return (data ?? []).map(mapSkill)
}

// -----------------------------------------------------------------------------
// Certifications
// -----------------------------------------------------------------------------

type CertificationRow = {
  id: string
  employee_id: string
  name: string
  issuing_body: string | null
  issued_date: string | null
  expires_date: string | null
  credential_id: string | null
  storage_path: string | null
  file_name: string | null
  file_size_bytes: number | null
  mime_type: string | null
  notes: string | null
}

const CERT_COLUMNS =
  'id, employee_id, name, issuing_body, issued_date, expires_date, credential_id, storage_path, file_name, file_size_bytes, mime_type, notes'

function mapCertification(row: CertificationRow): Certification {
  return {
    id: row.id,
    employeeId: row.employee_id,
    name: row.name,
    issuingBody: row.issuing_body,
    issuedDate: row.issued_date,
    expiresDate: row.expires_date,
    credentialId: row.credential_id,
    notes: row.notes,
    attachment: makeAttachment(row),
  }
}

export async function getCertifications(employeeId: string): Promise<Certification[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_employee_certifications')
    .select(CERT_COLUMNS)
    .eq('employee_id', employeeId)
    // Surface the most recently *earned* certs first; nulls last so
    // dateless entries sit at the bottom instead of polluting the top.
    .order('issued_date', { ascending: false, nullsFirst: false })
    .order('name', { ascending: true })
    .returns<CertificationRow[]>()
  if (error) throw new Error(`[workforce] getCertifications: ${error.message}`)
  return (data ?? []).map(mapCertification)
}

// -----------------------------------------------------------------------------
// Badges
// -----------------------------------------------------------------------------

type BadgeRow = {
  id: string
  employee_id: string
  badge_kind: string
  name: string
  description: string | null
  awarded_at: string
  awarded_by: string | null
  color_token: string | null
  storage_path: string | null
  file_name: string | null
  file_size_bytes: number | null
  mime_type: string | null
}

const BADGE_COLUMNS =
  'id, employee_id, badge_kind, name, description, awarded_at, awarded_by, color_token, storage_path, file_name, file_size_bytes, mime_type'

function mapBadge(row: BadgeRow): EmployeeBadge {
  return {
    id: row.id,
    employeeId: row.employee_id,
    badgeKind: row.badge_kind,
    name: row.name,
    description: row.description,
    awardedAt: row.awarded_at,
    awardedBy: row.awarded_by,
    colorToken: row.color_token,
    attachment: makeAttachment(row),
  }
}

export async function getEmployeeBadges(employeeId: string): Promise<EmployeeBadge[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_employee_badges')
    .select(BADGE_COLUMNS)
    .eq('employee_id', employeeId)
    .order('awarded_at', { ascending: false })
    .returns<BadgeRow[]>()
  if (error) throw new Error(`[workforce] getEmployeeBadges: ${error.message}`)
  return (data ?? []).map(mapBadge)
}

// -----------------------------------------------------------------------------
// Onboarding documents
// -----------------------------------------------------------------------------

type DocumentRow = {
  id: string
  employee_id: string
  doc_type: string
  doc_label: string
  status: 'pending' | 'sent' | 'signed' | 'approved' | 'rejected'
  required: boolean
  sent_at: string | null
  signed_at: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  storage_path: string | null
  file_name: string | null
  file_size_bytes: number | null
  mime_type: string | null
  rejection_reason: string | null
  notes: string | null
}

const DOC_COLUMNS =
  'id, employee_id, doc_type, doc_label, status, required, sent_at, signed_at, reviewed_at, reviewed_by, storage_path, file_name, file_size_bytes, mime_type, rejection_reason, notes'

function mapDocument(row: DocumentRow): EmployeeDocument {
  return {
    id: row.id,
    employeeId: row.employee_id,
    docType: row.doc_type,
    docLabel: row.doc_label,
    status: row.status,
    required: row.required,
    sentAt: row.sent_at,
    signedAt: row.signed_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    rejectionReason: row.rejection_reason,
    notes: row.notes,
    attachment: makeAttachment(row),
  }
}

export async function getEmployeeDocuments(employeeId: string): Promise<EmployeeDocument[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_employee_documents')
    .select(DOC_COLUMNS)
    .eq('employee_id', employeeId)
    // Keep the checklist stable — pending docs at the top, then signed,
    // approved, etc. We order by status text then label for predictable
    // ordering on the page.
    .order('status', { ascending: true })
    .order('doc_label', { ascending: true })
    .returns<DocumentRow[]>()
  if (error) throw new Error(`[workforce] getEmployeeDocuments: ${error.message}`)
  return (data ?? []).map(mapDocument)
}
