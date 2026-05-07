// Shared types for the contributor profile actions. Kept in a plain module
// (no 'use server') so the actions file can stay compatible with Next.js's
// stricter rules around what a 'use server' file is allowed to export.

import type { AdviceIdeasAuthorRow } from '@/lib/cms/advice-ideas'

// Public-facing shape returned to the client form. A profile may not exist
// yet (a contributor invited via email but never edited) — in that case the
// row is `null` and the form starts blank.
export type ContributorProfile = AdviceIdeasAuthorRow & { email: string | null }

export type ContributorProfileFormInput = {
  name: string
  role: string
  bio: string
  initials: string
  avatar_url: string
}
