import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { UserRole } from "./auth";

/**
 * Get Supabase admin client for server-side operations
 * Uses service role key to bypass RLS
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing required Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Authentication error class
 */
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization error class
 */
export class AuthorizationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 403
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * User information extracted from authenticated request
 */
export interface AuthenticatedUser {
  id: string;
  email: string | null;
  role: UserRole;
}

/**
 * Extract and verify authenticated user from request
 * @param request - Next.js request object
 * @returns Promise<AuthenticatedUser> - User information
 * @throws AuthenticationError if not authenticated
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError("Authentication required");
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseAdmin = getSupabaseAdmin();
  
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    throw new AuthenticationError("Invalid or expired token");
  }

  // Get user role from database
  const { data: userData, error: userError } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    throw new AuthenticationError("User record not found");
  }

  return {
    id: user.id,
    email: user.email || null,
    role: userData.role as UserRole,
  };
}

/**
 * Require authentication - throws if not authenticated
 * @param request - Next.js request object
 * @returns Promise<AuthenticatedUser> - User information
 * @throws AuthenticationError if not authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthenticatedUser> {
  return getAuthenticatedUser(request);
}

/**
 * Require specific role - throws if user doesn't have the role
 * @param request - Next.js request object
 * @param role - Required role
 * @returns Promise<AuthenticatedUser> - User information
 * @throws AuthenticationError if not authenticated
 * @throws AuthorizationError if user doesn't have required role
 */
export async function requireRole(
  request: NextRequest,
  role: UserRole
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request);

  if (user.role !== role) {
    throw new AuthorizationError(`Access denied. Required role: ${role}`);
  }

  return user;
}

/**
 * Require any of the specified roles - throws if user doesn't have any
 * @param request - Next.js request object
 * @param roles - Array of allowed roles
 * @returns Promise<AuthenticatedUser> - User information
 * @throws AuthenticationError if not authenticated
 * @throws AuthorizationError if user doesn't have any of the required roles
 */
export async function requireAnyRole(
  request: NextRequest,
  roles: UserRole[]
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request);

  if (!roles.includes(user.role)) {
    throw new AuthorizationError(
      `Access denied. Required roles: ${roles.join(", ")}`
    );
  }

  return user;
}

/**
 * Get authenticated user or return null (non-throwing version)
 * @param request - Next.js request object
 * @returns Promise<AuthenticatedUser | null> - User information or null if not authenticated
 */
export async function getAuthenticatedUserOrNull(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    return await getAuthenticatedUser(request);
  } catch {
    return null;
  }
}

/**
 * Check if user has specific role (non-throwing version)
 * @param request - Next.js request object
 * @param role - Required role
 * @returns Promise<boolean> - true if user has the role, false otherwise
 */
export async function hasRole(
  request: NextRequest,
  role: UserRole
): Promise<boolean> {
  try {
    const user = await getAuthenticatedUser(request);
    return user.role === role;
  } catch {
    return false;
  }
}

/**
 * Check if user has any of the specified roles (non-throwing version)
 * @param request - Next.js request object
 * @param roles - Array of allowed roles
 * @returns Promise<boolean> - true if user has any of the roles, false otherwise
 */
export async function hasAnyRole(
  request: NextRequest,
  roles: UserRole[]
): Promise<boolean> {
  try {
    const user = await getAuthenticatedUser(request);
    return roles.includes(user.role);
  } catch {
    return false;
  }
}

/**
 * Handle authentication errors and return appropriate response
 * @param error - Error object
 * @returns NextResponse with error details
 */
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Unknown error
  console.error("Unexpected auth error:", error);
  return NextResponse.json(
    { error: "Authentication failed" },
    { status: 500 }
  );
}

/**
 * Wrapper for API route handlers that require authentication
 * Catches auth errors and returns appropriate responses
 */
export function withAuth<T>(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    try {
      const user = await requireAuth(request);
      return await handler(request, user);
    } catch (error) {
      return handleAuthError(error) as NextResponse<T>;
    }
  };
}

/**
 * Wrapper for API route handlers that require specific role
 * Catches auth errors and returns appropriate responses
 */
export function withRole<T>(
  role: UserRole,
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    try {
      const user = await requireRole(request, role);
      return await handler(request, user);
    } catch (error) {
      return handleAuthError(error) as NextResponse<T>;
    }
  };
}

/**
 * Wrapper for API route handlers that require any of the specified roles
 * Catches auth errors and returns appropriate responses
 */
export function withAnyRole<T>(
  roles: UserRole[],
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    try {
      const user = await requireAnyRole(request, roles);
      return await handler(request, user);
    } catch (error) {
      return handleAuthError(error) as NextResponse<T>;
    }
  };
}
