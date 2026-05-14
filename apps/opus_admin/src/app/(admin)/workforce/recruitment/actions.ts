'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireAdminRole } from '@/lib/admin-auth'
import type {
  Candidate,
  Department,
  EmploymentType,
  JobStage,
  JobStatus,
  Location,
} from '../_lib/types'

const STAGES = new Set<JobStage>(['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'])
const STATUSES = new Set<JobStatus>(['Open', 'On hold', 'Closed'])
const SOURCES = new Set<Candidate['source']>([
  'LinkedIn',
  'Referral',
  'Careers Page',
  'Direct',
  'Brighter Monday',
])

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
    .slice(0, 96)
}

export type CreateJobInput = {
  title: string
  department: Department
  location: Location
  type: EmploymentType
  hiringManager: string
  postedSalaryMinTzs: number
  postedSalaryMaxTzs: number
  description?: string
}

export async function createJob(input: CreateJobInput): Promise<{ id: string }> {
  await requireAdminRole(['owner', 'admin'])
  const title = input.title.trim()
  if (title.length < 3) throw new Error('Job title is required.')
  if (input.postedSalaryMaxTzs < input.postedSalaryMinTzs) {
    throw new Error('Max salary must be ≥ min salary.')
  }
  const supabase = createSupabaseAdminClient()
  const slug = slugify(title)
  const { data, error } = await supabase
    .from('workforce_jobs')
    .insert({
      slug,
      title,
      department: input.department,
      location: input.location,
      employment_type: input.type,
      status: 'Open',
      posted_salary_min_tzs: Math.round(input.postedSalaryMinTzs),
      posted_salary_max_tzs: Math.round(input.postedSalaryMaxTzs),
      hiring_manager: input.hiringManager.trim(),
      description: input.description?.trim() ?? null,
    })
    .select('id')
    .single<{ id: string }>()
  if (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new Error('A job with that title already exists.')
    }
    throw error
  }
  revalidatePath('/workforce/recruitment')
  return { id: data.id }
}

export async function setJobStatus(id: string, status: JobStatus): Promise<void> {
  await requireAdminRole(['owner', 'admin'])
  if (!STATUSES.has(status)) throw new Error('Unknown job status.')
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('workforce_jobs').update({ status }).eq('id', id)
  if (error) throw error
  revalidatePath('/workforce/recruitment')
}

export async function addCandidate(input: {
  jobId: string
  name: string
  email: string
  source: Candidate['source']
  rating?: number
}): Promise<{ id: string }> {
  await requireAdminRole(['owner', 'admin'])
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (name.length < 2) throw new Error('Candidate name is required.')
  if (!email.includes('@')) throw new Error('A valid email is required.')
  if (!SOURCES.has(input.source)) throw new Error('Unknown source.')

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_candidates')
    .insert({
      job_id: input.jobId,
      full_name: name,
      email,
      stage: 'Applied',
      source: input.source,
      rating: input.rating ?? 3,
    })
    .select('id')
    .single<{ id: string }>()
  if (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new Error('This candidate is already in the pipeline for that role.')
    }
    throw error
  }
  revalidatePath('/workforce/recruitment')
  return { id: data.id }
}

export async function moveCandidate(id: string, stage: JobStage): Promise<void> {
  await requireAdminRole(['owner', 'admin'])
  if (!STAGES.has(stage)) throw new Error('Unknown stage.')
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('workforce_candidates').update({ stage }).eq('id', id)
  if (error) throw error
  revalidatePath('/workforce/recruitment')
}

export async function rateCandidate(id: string, rating: number): Promise<void> {
  await requireAdminRole(['owner', 'admin'])
  if (rating < 1 || rating > 5) throw new Error('Rating must be 1–5.')
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('workforce_candidates')
    .update({ rating: Math.round(rating) })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/workforce/recruitment')
}
