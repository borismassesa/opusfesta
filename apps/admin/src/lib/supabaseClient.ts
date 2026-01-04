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
  // During build time or development, if env vars are missing, create a client with placeholders
  // This allows the build to complete and the app to run. The actual queries will fail gracefully
  // and return null/empty arrays, which the code already handles.
  if (!supabaseUrl || !supabaseAnonKey) {
    // Use placeholder values to prevent build/runtime failure
    // The functions using this client already handle errors gracefully
    console.warn("⚠️  Missing Supabase environment variables. Using placeholder client. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY in your .env file.");
    return createClient(
      "https://placeholder.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
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
