import { useAuth } from '@clerk/clerk-expo';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);
export const missingSupabaseEnvVars = [
  !supabaseUrl ? 'EXPO_PUBLIC_SUPABASE_URL' : null,
  !supabaseAnonKey ? 'EXPO_PUBLIC_SUPABASE_ANON_KEY' : null,
].filter((value): value is string => Boolean(value));

/**
 * Public (unauthenticated) Supabase client for anon-level queries.
 * Returns null if required env vars are not configured.
 */
export const supabase: SupabaseClient | null = hasSupabaseEnv
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

function assertSupabaseEnvConfigured() {
  if (hasSupabaseEnv) return;

  throw new Error(
    `Missing Supabase environment variables: ${missingSupabaseEnvVars.join(', ')}. ` +
      'Set them in apps/mobile/.env.',
  );
}

/**
 * Hook that returns a Supabase client with Clerk JWT injected.
 * Mirrors the web pattern from @opusfesta/auth but uses @clerk/clerk-expo.
 */
export function useAuthenticatedSupabase(): SupabaseClient {
  const { getToken } = useAuth();

  return useMemo(() => {
    assertSupabaseEnvConfigured();

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: async (url, options: RequestInit = {}) => {
          const clerkToken = await getToken({ template: 'supabase' });
          const headers = new Headers(options.headers);
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`);
          }
          return fetch(url, { ...options, headers });
        },
      },
    });
  }, [getToken]);
}
