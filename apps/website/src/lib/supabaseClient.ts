import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? "";

// Check if we're in a build context
// During build, Next.js sets NEXT_PHASE to 'phase-production-build'
// This is the most reliable indicator of build time
const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

// Create client with graceful handling for build time
let supabaseInstance: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  // During build time, if env vars are missing, create a client with placeholders
  // This allows the build to complete. The actual queries will fail gracefully
  // and return null/empty arrays, which the code already handles.
  const url = supabaseUrl || (isBuildTime ? "https://placeholder.supabase.co" : "");
  const key = supabaseAnonKey || (isBuildTime ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder" : "");
  
  if (!url || !key) {
    if (isBuildTime) {
      // During build, use placeholder values to prevent build failure
      return createClient(
        "https://placeholder.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder"
      );
    }
    // At runtime (not build), throw error if env vars are missing
    throw new Error("Missing Supabase environment variables for the website app.");
  }

  const client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // Important for OAuth callbacks
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });

  // In the browser: when refresh token is invalid (expired/revoked/not found),
  // clear session and return null so the app treats the user as logged out
  // instead of surfacing AuthApiError and retrying the bad token.
  if (typeof window !== "undefined") {
    const isInvalidRefreshTokenError = (err: unknown): boolean => {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "";
      return (
        msg.includes("Invalid Refresh Token") ||
        msg.includes("Refresh Token Not Found") ||
        msg.includes("refresh_token_not_found")
      );
    };

    const originalGetSession = client.auth.getSession.bind(client.auth);
    client.auth.getSession = async () => {
      try {
        const result = await originalGetSession();
        if (result.error && isInvalidRefreshTokenError(result.error)) {
          await client.auth.signOut({ scope: "local" });
          return { data: { session: null }, error: null };
        }
        return result;
      } catch (err) {
        if (isInvalidRefreshTokenError(err)) {
          await client.auth.signOut({ scope: "local" });
          return { data: { session: null }, error: null };
        }
        throw err;
      }
    };

    const originalGetUser = client.auth.getUser.bind(client.auth);
    client.auth.getUser = async () => {
      try {
        const result = await originalGetUser();
        if (result.error && isInvalidRefreshTokenError(result.error)) {
          await client.auth.signOut({ scope: "local" });
          return { data: { user: null }, error: null };
        }
        return result;
      } catch (err) {
        if (isInvalidRefreshTokenError(err)) {
          await client.auth.signOut({ scope: "local" });
          return { data: { user: null }, error: null };
        }
        throw err;
      }
    };
  }

  return client;
}

// Lazy initialization
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!supabaseInstance) {
      supabaseInstance = createSupabaseClient();
    }
    const value = (supabaseInstance as any)[prop];
    if (typeof value === "function") {
      return value.bind(supabaseInstance);
    }
    return value;
  },
});
