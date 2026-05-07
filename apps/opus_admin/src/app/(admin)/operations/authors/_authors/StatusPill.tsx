// OF-ADM-EDITORIAL-001 — re-exports the shared StatusPill so existing
// imports inside the authors module keep working. New code should import
// from `../../_shared/StatusPill` directly.

export { default } from '../../_shared/StatusPill'
export type { StatusVariant } from '../../_shared/StatusPill'
