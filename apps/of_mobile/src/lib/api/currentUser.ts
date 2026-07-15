import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Resolves the caller's own users.id via the same requesting_user_id()
 * function RLS policies use. Needed because Supabase's `safeupdate` guard
 * rejects any UPDATE/DELETE with no WHERE clause outright — RLS alone
 * narrowing an unfiltered `.update()` to one row isn't enough, the query
 * itself must carry an explicit `.eq()`. Kept in its own module (no
 * react/react-native/@clerk imports) so it stays importable from plain
 * node:test files.
 */
export async function getMyUserId(client: SupabaseClient): Promise<string> {
  const { data, error } = await client.rpc('requesting_user_id');
  if (error) throw error;
  if (!data) throw new Error('Could not resolve the current user.');
  return data as string;
}
