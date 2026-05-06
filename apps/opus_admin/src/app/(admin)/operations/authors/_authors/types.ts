// OF-ADM-AUTHORS-001 — shared types for the unified Authors list. The page
// merges two underlying tables into one client-side stream so the UI can
// search, filter, and reorder them in a single pass.

export type AuthorListEntry =
  | {
      kind: 'author'
      id: string
      name: string
      role: string
      bio: string
      initials: string | null
      avatarUrl: string | null
      sortOrder: number
      articleCount: number
      email: string | null
    }
  | {
      kind: 'invite'
      id: string
      email: string
      displayName: string | null
      role: string | null
      articleTitle: string | null
      status: 'pending' | 'expired' | 'revoked'
      invitedAt: string
      expiresAt: string
    }
