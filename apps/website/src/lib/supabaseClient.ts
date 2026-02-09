import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? "";

const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

let supabaseInstance: SupabaseClient | null = null;

// Create a plain (unauthenticated) Supabase client for public queries
// For authenticated queries, use useClerkSupabaseClient() from @opusfesta/auth
function createSupabaseClient(): SupabaseClient {
  const url = supabaseUrl || (isBuildTime ? "https://placeholder.supabase.co" : "");
  const key = supabaseAnonKey || (isBuildTime ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder" : "");

  if (!url || !key) {
    if (isBuildTime) {
      return createClient(
        "https://placeholder.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder"
      );
    }
    throw new Error("Missing Supabase environment variables for the website app.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
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
