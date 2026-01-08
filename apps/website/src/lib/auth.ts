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
 * Get user role from database
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.role as UserRole;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

/**
 * Get redirect path based on user type/role
 */
export function getRedirectPath(userType?: UserType, role?: UserRole, next?: string | null): string {
  // If there's a next parameter and it's a valid path, use it
  if (next && next.startsWith("/") && !next.startsWith("/admin") && !next.startsWith("/login") && !next.startsWith("/signup")) {
    return next;
  }

  // Determine user type from role if userType not provided
  const effectiveUserType = userType || (role ? mapRoleToUserType(role) : "couple");

  switch (effectiveUserType) {
    case "couple":
      return "/";
    case "vendor":
      return "/vendor-portal";
    case "admin":
      return "/admin";
    default:
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
    const { data, error } = await supabase.from("users").insert({
      id: userId,
      email: email,
      password: "$2a$10$placeholder_password_not_used_with_supabase_auth",
      name: metadata?.full_name || null,
      phone: metadata?.phone || null,
      avatar: metadata?.avatar || null,
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select();

    if (error) {
      // If user already exists, that's okay (idempotent)
      if (error.code === "23505") {
        // Unique constraint violation - user already exists
        return { success: true };
      }
      
      // Check for RLS policy violations - these should be handled gracefully
      const isRLSError = 
        error.message?.toLowerCase().includes("row-level security") ||
        error.message?.toLowerCase().includes("violates row-level security policy") ||
        error.message?.toLowerCase().includes("policy") ||
        error.code === "42501" || // Insufficient privilege
        error.hint?.toLowerCase().includes("policy");
      
      if (isRLSError) {
        // Log technical details for debugging but don't show to user
        console.error("RLS policy error creating user record:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          fullError: error,
        });
        
        // Return a user-friendly error message
        return {
          success: false,
          error: "Unable to complete account setup. Please contact support if this issue persists.",
        };
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

    // If fetch error is not "not found", log it
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching user record:", fetchError);
    }

    if (existingUser) {
      // User exists, return their role
      const userType = mapRoleToUserType(existingUser.role as UserRole);
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
      // Return the error (already sanitized in createUserRecord to be user-friendly)
      return { success: false, error: createResult.error || "Unable to create user account" };
    }

    return { success: true, userType };
  } catch (error) {
    console.error("Error ensuring user record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
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
