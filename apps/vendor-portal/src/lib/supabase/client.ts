import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? "";

const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

let supabaseInstance: SupabaseClient | null = null;

type ClerkSessionLike = {
  getToken: (opts: { template: string }) => Promise<string | null>;
};

type ClerkLike = {
  loaded?: boolean;
  session?: ClerkSessionLike | null;
};

type ClerkWindow = Window & {
  Clerk?: ClerkLike;
};

async function getClerkSupabaseToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const clerk = (window as ClerkWindow).Clerk;
  if (!clerk?.loaded || !clerk.session) {
    return null;
  }

  try {
    return await clerk.session.getToken({ template: "supabase" });
  } catch {
    return null;
  }
}

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isBuildTime) {
      return createClient(
        "https://placeholder.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder"
      );
    }

    if (typeof window !== "undefined") {
      console.warn(
        "Missing Supabase environment variables for the vendor-portal app. Some features may not work."
      );
    }

    return createClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseAnonKey ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'vendor-portal-supabase-auth',
    },
    global: {
      fetch: async (url: RequestInfo | URL, options: RequestInit = {}) => {
        const headers = new Headers(options.headers);
        const clerkToken = await getClerkSupabaseToken();

        if (clerkToken) {
          headers.set("Authorization", `Bearer ${clerkToken}`);
        }

        try {
          return await fetch(url, { ...options, headers });
        } catch (error) {
          if (error instanceof TypeError && error.message === "Failed to fetch") {
            const networkError = new Error(
              "Network request failed. Please check your internet connection and Supabase configuration."
            );
            (networkError as { name: string }).name = "NetworkError";
            throw networkError;
          }
          throw error;
        }
      },
    },
  });
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!supabaseInstance) {
      supabaseInstance = createSupabaseClient();
    }
    const value = (supabaseInstance as unknown as Record<string, unknown>)[
      prop as string
    ];
    if (typeof value === "function") {
      return value.bind(supabaseInstance);
    }
    return value;
  },
});
