'use server'

import { revalidatePath } from 'next/cache'
import { hasPermission } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'

// Server actions for the Social Media section of the Growth Tracker. Content
// log entries (and filling in a challenge's post-run RESULTS) only require
// growth.write; defining/editing/deleting challenges requires growth.admin.
// Mirrors the { ok } result shape used by workforce/daily-tracker/actions.ts.

export type ActionResult = { ok: true } | { ok: false; error: string }

function revalidateAll() {
  revalidatePath('/growth/social')
  revalidatePath('/growth')
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export type ContentPostInput = {
  postDate: string
  channel: string
  contentType: string
  topic: string
  postedByName: string
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  newFollowers: number
  notes: string
}

function validateContentPostInput(input: ContentPostInput): string | null {
  if (!DATE_RE.test(input.postDate)) return 'Invalid post date.'
  if (!input.channel.trim()) return 'Channel is required.'
  if (!input.contentType.trim()) return 'Content type is required.'
  if (!input.topic.trim()) return 'Topic/title is required.'
  for (const [label, value] of [
    ['Likes', input.likes],
    ['Comments', input.comments],
    ['Shares', input.shares],
    ['Saves', input.saves],
    ['Reach', input.reach],
    ['New followers', input.newFollowers],
  ] as const) {
    if (!Number.isFinite(value) || value < 0) return `${label} must be zero or a positive number.`
  }
  return null
}

export async function addContentPost(input: ContentPostInput): Promise<ActionResult> {
  if (!(await hasPermission('growth.write'))) {
    return { ok: false, error: "You don't have permission to log content posts." }
  }
  const validationError = validateContentPostInput(input)
  if (validationError) return { ok: false, error: validationError }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_social_content_log').insert({
    post_date: input.postDate,
    channel: input.channel,
    content_type: input.contentType,
    topic: input.topic.trim(),
    posted_by_name: input.postedByName.trim(),
    likes: Math.round(input.likes),
    comments: Math.round(input.comments),
    shares: Math.round(input.shares),
    saves: Math.round(input.saves),
    reach: Math.round(input.reach),
    new_followers: Math.round(input.newFollowers),
    notes: input.notes.trim(),
  })
  if (error) {
    console.error('[growth] addContentPost failed', error)
    return { ok: false, error: error.message || 'Could not save.' }
  }

  revalidateAll()
  return { ok: true }
}

export type ContentPostPatch = Partial<ContentPostInput>

export async function updateContentPost(id: string, patch: ContentPostPatch): Promise<ActionResult> {
  if (!(await hasPermission('growth.write'))) {
    return { ok: false, error: "You don't have permission to edit content posts." }
  }

  const dbPatch: Record<string, unknown> = {}
  if (patch.postDate !== undefined) {
    if (!DATE_RE.test(patch.postDate)) return { ok: false, error: 'Invalid post date.' }
    dbPatch.post_date = patch.postDate
  }
  if (patch.channel !== undefined) {
    if (!patch.channel.trim()) return { ok: false, error: 'Channel is required.' }
    dbPatch.channel = patch.channel
  }
  if (patch.contentType !== undefined) {
    if (!patch.contentType.trim()) return { ok: false, error: 'Content type is required.' }
    dbPatch.content_type = patch.contentType
  }
  if (patch.topic !== undefined) {
    if (!patch.topic.trim()) return { ok: false, error: 'Topic/title is required.' }
    dbPatch.topic = patch.topic.trim()
  }
  if (patch.postedByName !== undefined) dbPatch.posted_by_name = patch.postedByName.trim()
  for (const [key, dbKey] of [
    ['likes', 'likes'],
    ['comments', 'comments'],
    ['shares', 'shares'],
    ['saves', 'saves'],
    ['reach', 'reach'],
    ['newFollowers', 'new_followers'],
  ] as const) {
    const value = patch[key]
    if (value !== undefined) {
      if (!Number.isFinite(value) || value < 0) return { ok: false, error: `${key} must be zero or a positive number.` }
      dbPatch[dbKey] = Math.round(value)
    }
  }
  if (patch.notes !== undefined) dbPatch.notes = patch.notes.trim()

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_social_content_log').update(dbPatch).eq('id', id)
  if (error) {
    console.error('[growth] updateContentPost failed', error)
    return { ok: false, error: error.message || 'Could not save.' }
  }

  revalidateAll()
  return { ok: true }
}

export async function deleteContentPost(id: string): Promise<ActionResult> {
  if (!(await hasPermission('growth.write'))) {
    return { ok: false, error: "You don't have permission to delete content posts." }
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_social_content_log').delete().eq('id', id)
  if (error) {
    console.error('[growth] deleteContentPost failed', error)
    return { ok: false, error: error.message || 'Could not delete.' }
  }

  revalidateAll()
  return { ok: true }
}

export type ChallengeInput = {
  launchDate: string
  theme: string
  leadChannel: string
  hashtag: string
  leadOwnerName: string
}

function validateChallengeInput(input: ChallengeInput): string | null {
  if (!DATE_RE.test(input.launchDate)) return 'Invalid launch date.'
  if (!input.theme.trim()) return 'Theme is required.'
  if (!input.leadChannel.trim()) return 'Lead channel is required.'
  if (!input.hashtag.trim()) return 'Hashtag is required.'
  if (!input.leadOwnerName.trim()) return 'Lead owner is required.'
  return null
}

export async function addChallenge(input: ChallengeInput): Promise<ActionResult> {
  if (!(await hasPermission('growth.admin'))) {
    return { ok: false, error: "You don't have permission to add challenges." }
  }
  const validationError = validateChallengeInput(input)
  if (validationError) return { ok: false, error: validationError }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_social_challenges').insert({
    launch_date: input.launchDate,
    theme: input.theme.trim(),
    lead_channel: input.leadChannel,
    hashtag: input.hashtag.trim(),
    lead_owner_name: input.leadOwnerName.trim(),
  })
  if (error) {
    console.error('[growth] addChallenge failed', error)
    return { ok: false, error: error.message || 'Could not save.' }
  }

  revalidateAll()
  return { ok: true }
}

export type ChallengeDefinitionPatch = Partial<ChallengeInput>

export async function updateChallengeDefinition(id: string, patch: ChallengeDefinitionPatch): Promise<ActionResult> {
  if (!(await hasPermission('growth.admin'))) {
    return { ok: false, error: "You don't have permission to edit challenges." }
  }

  const dbPatch: Record<string, unknown> = {}
  if (patch.launchDate !== undefined) {
    if (!DATE_RE.test(patch.launchDate)) return { ok: false, error: 'Invalid launch date.' }
    dbPatch.launch_date = patch.launchDate
  }
  if (patch.theme !== undefined) {
    if (!patch.theme.trim()) return { ok: false, error: 'Theme is required.' }
    dbPatch.theme = patch.theme.trim()
  }
  if (patch.leadChannel !== undefined) {
    if (!patch.leadChannel.trim()) return { ok: false, error: 'Lead channel is required.' }
    dbPatch.lead_channel = patch.leadChannel
  }
  if (patch.hashtag !== undefined) {
    if (!patch.hashtag.trim()) return { ok: false, error: 'Hashtag is required.' }
    dbPatch.hashtag = patch.hashtag.trim()
  }
  if (patch.leadOwnerName !== undefined) {
    if (!patch.leadOwnerName.trim()) return { ok: false, error: 'Lead owner is required.' }
    dbPatch.lead_owner_name = patch.leadOwnerName.trim()
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_social_challenges').update(dbPatch).eq('id', id)
  if (error) {
    console.error('[growth] updateChallengeDefinition failed', error)
    return { ok: false, error: error.message || 'Could not save.' }
  }

  revalidateAll()
  return { ok: true }
}

export type ChallengeResultsPatch = Partial<{
  postsMade: number | null
  totalReach: number | null
  totalEngagements: number | null
  newFollowers: number | null
  submissionsUgc: number | null
  result: string
  notes: string
}>

export async function updateChallengeResults(id: string, patch: ChallengeResultsPatch): Promise<ActionResult> {
  if (!(await hasPermission('growth.write'))) {
    return { ok: false, error: "You don't have permission to fill in challenge results." }
  }

  const dbPatch: Record<string, unknown> = {}
  for (const [key, dbKey] of [
    ['postsMade', 'posts_made'],
    ['totalReach', 'total_reach'],
    ['totalEngagements', 'total_engagements'],
    ['newFollowers', 'new_followers'],
    ['submissionsUgc', 'submissions_ugc'],
  ] as const) {
    const value = patch[key]
    if (value !== undefined) {
      if (value !== null && (!Number.isFinite(value) || value < 0)) {
        return { ok: false, error: `${key} must be zero or a positive number.` }
      }
      dbPatch[dbKey] = value === null ? null : Math.round(value)
    }
  }
  if (patch.result !== undefined) dbPatch.result = patch.result.trim()
  if (patch.notes !== undefined) dbPatch.notes = patch.notes.trim()

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_social_challenges').update(dbPatch).eq('id', id)
  if (error) {
    console.error('[growth] updateChallengeResults failed', error)
    return { ok: false, error: error.message || 'Could not save.' }
  }

  revalidateAll()
  return { ok: true }
}

export async function deleteChallenge(id: string): Promise<ActionResult> {
  if (!(await hasPermission('growth.admin'))) {
    return { ok: false, error: "You don't have permission to delete challenges." }
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_social_challenges').delete().eq('id', id)
  if (error) {
    console.error('[growth] deleteChallenge failed', error)
    return { ok: false, error: error.message || 'Could not delete.' }
  }

  revalidateAll()
  return { ok: true }
}
