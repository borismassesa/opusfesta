import { supabase } from "./supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

export type UserType = "couple" | "vendor" | "admin";
export type UserRole = "user" | "vendor" | "admin";

/**
 * Maps user_type from signup to database role
 */
export function mapUserTypeToRole(userType: UserType): UserRole {
  switch (userType) {
    case "couple":
      return "user";
    case "vendor":
      return "vendor";
    case "admin":
      return "admin";
    default:
      return "user";
  }
}

/**
 * Maps database role to user_type
 */
export function mapRoleToUserType(role: UserRole): UserType {
  switch (role) {
    case "user":
      return "couple";
    case "vendor":
      return "vendor";
    case "admin":
      return "admin";
    default:
      return "couple";
  }
}

/**
 * Verify user still exists in Supabase Auth
 * Returns true if user exists, false if deleted
 */
export async function verifyUserExistsInAuth(userId: string): Promise<boolean> {
  try {
    // Use getUser() to verify the user still exists in auth.users
    // This will fail if the user has been deleted
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // User doesn't exist or session is invalid
      return false;
    }
    
    // Verify the user ID matches
    return user?.id === userId;
  } catch (error) {
    console.error("Error verifying user in Auth:", error);
    return false;
  }
}

/**
 * Get user role from database
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    // Handle RLS errors gracefully (406) - these are expected if session isn't fully established
    // Also handle "not found" errors (PGRST116) - user record might not exist yet
    const isRLSError = error?.code === "PGRST301" || 
                      error?.code === "PGRST116" ||
                      error?.message?.toLowerCase().includes("row-level security") ||
                      error?.status === 406 ||
                      error?.status === 404;

    // Only log non-RLS errors with meaningful content
    if (error && !isRLSError) {
      // Only log if error has meaningful information
      const hasErrorInfo = error.code || error.message || error.details || error.hint;
      if (hasErrorInfo) {
        console.error("Error fetching user role:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          status: error.status,
        });
      }
      // If error is empty or has no info, it's likely an RLS issue - don't log
    }

    // If RLS error or no data, return null (user record might not exist yet or RLS is blocking)
    if (!data || isRLSError) {
      return null;
    }

    return data.role as UserRole;
  } catch (error) {
    // Log unexpected errors only if they have meaningful content
    if (error instanceof Error && error.message) {
      console.error("Error fetching user role (exception):", error.message);
    }
    return null;
  }
}

/**
 * Get redirect path based on user type/role
 */
export function getRedirectPath(userType?: UserType, role?: UserRole, next?: string | null): string {
  // If there's a next parameter and it's a valid path, use it
  // Allow careers paths to pass through
  if (next && next.startsWith("/") && !next.startsWith("/admin") && !next.startsWith("/login") && !next.startsWith("/signup") && !next.startsWith("/verify-email")) {
    return next;
  }

  // Determine user type from role if userType not provided
  const effectiveUserType = userType || (role ? mapRoleToUserType(role) : "couple");

  // Check if we're in a careers context
  // Check next parameter, sessionStorage, or current pathname
  const nextFromStorage = typeof window !== "undefined" ? sessionStorage.getItem("auth_redirect") : null;
  const effectiveNext = next || nextFromStorage;
  const isCareersContext = effectiveNext?.includes("/careers") || 
                          (typeof window !== "undefined" && window.location.pathname.includes("/careers"));

  switch (effectiveUserType) {
    case "couple":
      // If in careers context, redirect to careers page (or specific careers page if next was set)
      if (isCareersContext) {
        // If we have a specific careers page in next, use it; otherwise default to /careers
        return effectiveNext?.startsWith("/careers") ? effectiveNext : "/careers";
      }
      return "/";
    case "vendor":
      return "/vendor-portal";
    case "admin":
      return "/admin";
    default:
      // Default user type (job applicants) should go to careers
      if (isCareersContext) {
        return effectiveNext?.startsWith("/careers") ? effectiveNext : "/careers";
      }
      return "/";
  }
}

/**
 * Create user record in database
 */
export async function createUserRecord(
  userId: string,
  email: string,
  userType: UserType,
  metadata?: {
    full_name?: string;
    phone?: string;
    avatar?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate required fields
    if (!userId || !email) {
      return {
        success: false,
        error: "User ID and email are required to create user record",
      };
    }

    const role = mapUserTypeToRole(userType);

    // Note: password field is required by schema but not used with Supabase Auth
    // Using placeholder since password is managed by auth.users
    // Use upsert to handle both insert and update (prevents 409 conflicts)
    // onConflict uses the primary key (id) - this handles most cases
    // Email unique constraint conflicts are handled in error handling below
    const { data, error } = await supabase.from("users").upsert({
      id: userId,
      email: email,
      password: "$2a$10$placeholder_password_not_used_with_supabase_auth",
      name: metadata?.full_name || null,
      phone: metadata?.phone || null,
      avatar: metadata?.avatar || null,
      role: role,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "id", // Primary key conflict resolution
      ignoreDuplicates: false, // Update if exists
    }).select();

    if (error) {
      // Handle duplicate key errors (409 conflict) - user already exists, that's okay
      // This can happen due to:
      // 1. Unique constraint on id (primary key)
      // 2. Unique constraint on email
      // 3. Race conditions where multiple upserts happen simultaneously
      const isDuplicateError = error.code === "23505" || 
                              error.status === 409 ||
                              error.message?.includes("duplicate") || 
                              error.message?.includes("unique") ||
                              error.message?.includes("already exists") ||
                              error.message?.includes("violates unique constraint");
      
      if (isDuplicateError) {
        // User already exists - this is fine, operation is idempotent
        // Don't log as error to avoid console noise
        return { success: true };
      }
      
      // Check for RLS policy violations - these should be handled gracefully
      const isRLSError = 
        error.code === "PGRST301" ||
        error.status === 406 ||
        error.message?.toLowerCase().includes("row-level security") ||
        error.message?.toLowerCase().includes("violates row-level security policy") ||
        error.message?.toLowerCase().includes("policy") ||
        error.code === "42501" || // Insufficient privilege
        error.hint?.toLowerCase().includes("policy");
      
      if (isRLSError) {
        // RLS error - user might exist but we can't see/create it due to RLS
        // Assume success to prevent infinite loops
        // Don't log as error to avoid console noise
        return { success: true };
      }
      
      // Log full error details for debugging
      console.error("Error creating user record:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        fullError: JSON.stringify(error, null, 2),
      });
      
      // Build a user-friendly error message (hide technical details)
      let errorMessage = "Unable to create your account. Please try again or contact support.";
      
      // Only show specific error if it's user-actionable
      if (error.message?.toLowerCase().includes("email") && error.message?.toLowerCase().includes("already")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message?.toLowerCase().includes("invalid") || error.message?.toLowerCase().includes("required")) {
        errorMessage = "Please check your information and try again.";
      }
      
      return { success: false, error: errorMessage };
    }

    // Check if data was returned (some Supabase configurations might not return data)
    if (data && data.length > 0) {
      return { success: true };
    }

    // If no error and no data, assume success (insert might not return data depending on RLS)
    return { success: true };
  } catch (error) {
    // Log full error details for debugging
    console.error("Error creating user record (exception):", {
      error,
      type: typeof error,
      isError: error instanceof Error,
      message: error instanceof Error ? error.message : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Build error message
    let errorMessage = "Unknown error occurred while creating user record";
    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object") {
      // Try to extract message from error object
      const err = error as any;
      errorMessage = err.message || err.error || err.details || errorMessage;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Ensure user record exists in database
 * Creates it if it doesn't exist
 */
export async function ensureUserRecord(session: Session): Promise<{ success: boolean; userType?: UserType; error?: string }> {
  try {
    const user = session.user;
    if (!user) {
      return { success: false, error: "No user in session" };
    }

    // Check if user exists in database
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", user.id)
      .single();

    // Handle RLS errors gracefully (406) - these are expected if session isn't fully established
    const isRLSError = fetchError?.code === "PGRST301" || 
                      fetchError?.message?.toLowerCase().includes("row-level security") ||
                      fetchError?.status === 406;
    
    // PGRST116 = not found (expected if user doesn't exist yet)
    const isNotFoundError = fetchError?.code === "PGRST116";

    // If fetch error is not "not found" or RLS error, log it
    if (fetchError && !isNotFoundError && !isRLSError) {
      // Only log unexpected errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching user record:", fetchError);
      }
    }

    // If user exists, return their role
    if (existingUser) {
      const userType = mapRoleToUserType(existingUser.role as UserRole);
      return { success: true, userType };
    }

    // If we got an RLS error, the user might exist but we can't see it
    // In this case, we'll assume the user exists and return success
    // This prevents infinite loops trying to create a user that already exists
    if (isRLSError) {
      // Default to 'couple' user type if we can't determine the role
      const userType = (user.user_metadata?.user_type as UserType) || "couple";
      return { success: true, userType };
    }

    // User doesn't exist, create record
    // Get user_type from metadata or default to 'couple'
    const userType = (user.user_metadata?.user_type as UserType) || "couple";

    // Extract metadata from OAuth providers
    // Google provides: full_name, avatar_url, email_verified
    // Apple provides: full_name, email_verified
    const fullName = 
      user.user_metadata?.full_name || 
      user.user_metadata?.name || 
      user.user_metadata?.display_name ||
      (user.user_metadata?.first_name && user.user_metadata?.last_name 
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : null);
    
    const avatar = 
      user.user_metadata?.avatar_url || 
      user.user_metadata?.picture || 
      user.user_metadata?.photo_url ||
      null;

    const createResult = await createUserRecord(
      user.id,
      user.email || "",
      userType,
      {
        full_name: fullName,
        phone: user.user_metadata?.phone || null,
        avatar: avatar,
      }
    );

    if (!createResult.success) {
      // Log error for debugging
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to create user record:", createResult.error);
      }
      // Return the error (already sanitized in createUserRecord to be user-friendly)
      return { success: false, error: createResult.error || "Unable to create user account. Please try again or contact support." };
    }

    return { success: true, userType };
  } catch (error) {
    // Log full error details in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error ensuring user record:", error);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Handle OAuth sign in
 */
export async function handleOAuthSignIn(
  provider: "google" | "apple",
  userType?: UserType
): Promise<{ error?: string }> {
  try {
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback${userType ? `?user_type=${userType}` : ""}`
      : undefined;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: userType
          ? {
              user_type: userType,
            }
          : undefined,
      },
    });

    if (error) {
      console.error("OAuth sign in error:", error);
      
      // Parse error message - could be JSON string or object
      let errorMessage = error.message || "";
      let errorCode = error.status || error.code;
      
      // Try to parse if it's a JSON string
      try {
        if (typeof errorMessage === "string" && errorMessage.trim().startsWith("{")) {
          const parsedError = JSON.parse(errorMessage);
          errorMessage = parsedError.msg || parsedError.message || errorMessage;
          errorCode = parsedError.code || parsedError.error_code || errorCode;
        }
      } catch {
        // Not JSON, use as is
      }
      
      // Check for provider not enabled error (various formats)
      // 400 Bad Request from authorize endpoint typically means provider not enabled
      const isProviderNotEnabled = 
        errorMessage?.toLowerCase().includes("not enabled") ||
        errorMessage?.toLowerCase().includes("unsupported provider") ||
        errorMessage?.toLowerCase().includes("provider is not enabled") ||
        errorCode === 400 ||
        error.status === 400 ||
        errorCode === "validation_failed";
      
      if (isProviderNotEnabled) {
        return {
          error: `${provider === "google" ? "Google" : "Apple"} sign-in is not enabled in your Supabase project. Please enable it in the Supabase Dashboard under Authentication → Providers, or use email/password to sign in.`,
        };
      }
      
      return { error: errorMessage || "OAuth authentication failed. Please try again." };
    }

    // If no error and no data.url, it might be a configuration issue
    if (!data?.url) {
      return {
        error: `${provider === "google" ? "Google" : "Apple"} sign-in is not configured. Please enable the provider in Supabase Dashboard.`,
      };
    }

    return {};
  } catch (error: any) {
    console.error("OAuth sign in exception:", error);
    
    // Handle fetch/network errors
    if (error?.status === 400 || error?.response?.status === 400) {
      return {
        error: `${provider === "google" ? "Google" : "Apple"} sign-in is not enabled in your Supabase project. Please enable it in the Supabase Dashboard under Authentication → Providers, or use email/password to sign in.`,
      };
    }
    
    // Handle Response objects (from fetch)
    if (error instanceof Response) {
      try {
        const errorData = await error.json();
        if (errorData.msg?.includes("not enabled") || errorData.msg?.includes("Unsupported provider") || error.status === 400) {
          return {
            error: `${provider === "google" ? "Google" : "Apple"} sign-in is not enabled in your Supabase project. Please enable it in the Supabase Dashboard under Authentication → Providers, or use email/password to sign in.`,
          };
        }
        return { error: errorData.msg || errorData.message || "OAuth authentication failed" };
      } catch {
        // If JSON parsing fails, check status
        if (error.status === 400) {
          return {
            error: `${provider === "google" ? "Google" : "Apple"} sign-in is not enabled in your Supabase project. Please enable it in the Supabase Dashboard under Authentication → Providers, or use email/password to sign in.`,
          };
        }
      }
    }
    
    // Handle JSON error responses in Error messages
    if (error instanceof Error) {
      try {
        const parsedError = JSON.parse(error.message);
        if (parsedError.msg?.includes("not enabled") || parsedError.msg?.includes("Unsupported provider") || parsedError.code === 400) {
          return {
            error: `${provider === "google" ? "Google" : "Apple"} sign-in is not enabled in your Supabase project. Please enable it in the Supabase Dashboard under Authentication → Providers, or use email/password to sign in.`,
          };
        }
        return { error: parsedError.msg || parsedError.message || error.message };
      } catch {
        // Not JSON, check if it's a network error
        if (error.message?.includes("400") || error.message?.includes("Bad Request")) {
          return {
            error: `${provider === "google" ? "Google" : "Apple"} sign-in is not enabled in your Supabase project. Please enable it in the Supabase Dashboard under Authentication → Providers, or use email/password to sign in.`,
          };
        }
        return { error: error.message || "OAuth authentication failed. Please try again." };
      }
    }
    
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred. Please try again.",
    };
  }
}

/**
 * Get user type from session
 */
export async function getUserTypeFromSession(session: Session | null): Promise<UserType | null> {
  if (!session?.user) {
    return null;
  }

  // First try to get from database
  // If user record doesn't exist or RLS blocks access, fall back to metadata
  const role = await getUserRole(session.user.id);
  if (role) {
    return mapRoleToUserType(role);
  }

  // Fallback to metadata
  const userType = session.user.user_metadata?.user_type as UserType;
  if (userType && ["couple", "vendor", "admin"].includes(userType)) {
    return userType;
  }

  return null;
}
