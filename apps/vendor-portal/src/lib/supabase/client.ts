import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? "";

// Check if we're in a build context
const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

// Create client with graceful handling for build time
let supabaseInstance: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  // During build time, if env vars are missing, create a client with placeholders
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isBuildTime) {
      return createClient(
        "https://placeholder.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder"
      );
    }
    // In development, log a warning but still create a client to prevent hanging
    if (typeof window !== 'undefined') {
      console.warn("Missing Supabase environment variables for the vendor-portal app. Some features may not work.");
    }
    // Return a client with placeholder values to prevent hanging
    return createClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder"
    );
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      fetch: (url, options = {}) => {
        // Wrap fetch to handle network errors gracefully
        return fetch(url, options).catch((error) => {
          // If it's a network error, throw a more descriptive error
          if (error instanceof TypeError && error.message === 'Failed to fetch') {
            const networkError = new Error('Network request failed. Please check your internet connection and Supabase configuration.');
            (networkError as any).name = 'NetworkError';
            (networkError as any).originalError = error;
            throw networkError;
          }
          throw error;
        });
      },
    },
  });

  // Add timeout wrapper for getSession to prevent hanging
  if (typeof window !== 'undefined') {
    const originalGetSession = client.auth.getSession.bind(client.auth);
    client.auth.getSession = async () => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        return await Promise.race([originalGetSession(), timeoutPromise]);
      } catch (error) {
        console.warn('[Supabase] Session check failed or timed out:', error);
        // Return empty session instead of throwing
        return { data: { session: null }, error: null };
      }
    };

    // Also wrap getUser to handle network errors
    const originalGetUser = client.auth.getUser.bind(client.auth);
    client.auth.getUser = async () => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Get user timeout')), 5000)
        );
        return await Promise.race([originalGetUser(), timeoutPromise]);
      } catch (error: any) {
        // Handle network errors gracefully
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('Failed to fetch') || 
            errorMessage.includes('NetworkError') ||
            errorMessage.includes('Network request failed') ||
            error?.name === 'TypeError') {
          // Only log as warning, not error, to reduce console noise
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Supabase] Network error when getting user. This may be due to:', {
              reason: 'Network connectivity issue or Supabase service unavailable',
              suggestion: 'Check your internet connection and Supabase project status',
              url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'not configured'
            });
          }
          return { data: { user: null }, error: { message: 'Network error', status: 503 } };
        }
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Supabase] Get user failed or timed out:', error);
        }
        return { data: { user: null }, error: null };
      }
    };

    // Wrap onAuthStateChange to handle errors
    const originalOnAuthStateChange = client.auth.onAuthStateChange.bind(client.auth);
    client.auth.onAuthStateChange = (callback) => {
      try {
        return originalOnAuthStateChange((event, session) => {
          try {
            callback(event, session);
          } catch (error) {
            console.warn('[Supabase] Error in auth state change callback:', error);
          }
        });
      } catch (error) {
        console.warn('[Supabase] Error setting up auth state listener:', error);
        // Return a no-op subscription
        return { data: { subscription: { unsubscribe: () => {} } } };
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
    const value = (supabaseInstance as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === "function") {
      return value.bind(supabaseInstance);
    }
    return value;
  },
});
