import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';

/**
 * Resolves the internal `public.users.id` UUID for the signed-in Clerk user.
 *
 * Every RLS policy in this schema keys off `requesting_user_id()`, which looks
 * up `public.users.id` by `clerk_id = auth.jwt()->>'sub'` — it is NOT the Clerk
 * id itself (see 20260501000001_requesting_user_id_uuid_safe.sql). Reads don't
 * care, since RLS applies the filter server-side, but any INSERT/UPSERT that
 * writes a `user_id` column has to supply this UUID. Passing Clerk's
 * `user.id` ('user_2ab…') would fail the uuid cast or write an orphan row.
 *
 * Calling the function over RPC keeps this authoritative: it returns exactly
 * what RLS will evaluate. It resolves to null when the user has no
 * `public.users` row yet, which callers must treat as "cannot write".
 */
export function useInternalUserId() {
  const client = useAuthenticatedSupabase();

  return useQuery({
    queryKey: ['internal-user-id'],
    queryFn: async () => {
      const { data, error } = await client.rpc('requesting_user_id');
      if (error) throw error;
      return (data as string | null) ?? null;
    },
    staleTime: Infinity,
  });
}

export class MissingInternalUserError extends Error {
  constructor() {
    super('Your account is still being set up. Please try again in a moment.');
    this.name = 'MissingInternalUserError';
  }
}
