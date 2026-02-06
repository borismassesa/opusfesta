/**
 * Authentication error codes
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  OAUTH_PROVIDER_NOT_ENABLED = "OAUTH_PROVIDER_NOT_ENABLED",
  ACCOUNT_EXISTS = "ACCOUNT_EXISTS",
  WEAK_PASSWORD = "WEAK_PASSWORD",
  INVALID_TOKEN = "INVALID_TOKEN",
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: "Invalid email or password. Please check your credentials and try again.",
  [AuthErrorCode.USER_NOT_FOUND]: "No account found with this email. Please sign up first.",
  [AuthErrorCode.EMAIL_NOT_VERIFIED]: "Please verify your email address before signing in. Check your inbox for the verification link.",
  [AuthErrorCode.SESSION_EXPIRED]: "Your session has expired. Please sign in again.",
  [AuthErrorCode.UNAUTHORIZED]: "You need to sign in to access this page.",
  [AuthErrorCode.FORBIDDEN]: "You don't have permission to access this resource.",
  [AuthErrorCode.NETWORK_ERROR]: "Network error. Please check your connection and try again.",
  [AuthErrorCode.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again.",
  [AuthErrorCode.OAUTH_PROVIDER_NOT_ENABLED]: "OAuth sign-in is not enabled. Please use email/password to sign in.",
  [AuthErrorCode.ACCOUNT_EXISTS]: "An account with this email already exists. Please sign in instead.",
  [AuthErrorCode.WEAK_PASSWORD]: "Password is too weak. Please choose a stronger password.",
  [AuthErrorCode.INVALID_TOKEN]: "Invalid or expired token. Please sign in again.",
};

/**
 * Parse Supabase auth error and return user-friendly message
 * @param error - Error object from Supabase
 * @returns Object with error code and user-friendly message
 */
export function parseAuthError(error: unknown): {
  code: AuthErrorCode;
  message: string;
  originalError?: unknown;
} {
  if (!error) {
    return {
      code: AuthErrorCode.UNKNOWN_ERROR,
      message: ERROR_MESSAGES[AuthErrorCode.UNKNOWN_ERROR],
    };
  }

  // Handle Supabase AuthError
  if (error && typeof error === "object" && "message" in error) {
    const errorMessage = String(error.message || "").toLowerCase();
    const errorStatus = (error as any).status;

    // Email not verified
    if (
      errorMessage.includes("email not confirmed") ||
      errorMessage.includes("email_not_confirmed") ||
      errorMessage.includes("confirm your email")
    ) {
      return {
        code: AuthErrorCode.EMAIL_NOT_VERIFIED,
        message: ERROR_MESSAGES[AuthErrorCode.EMAIL_NOT_VERIFIED],
        originalError: error,
      };
    }

    // Invalid credentials
    if (
      errorMessage.includes("invalid login") ||
      errorMessage.includes("invalid credentials") ||
      errorMessage.includes("wrong password") ||
      errorMessage.includes("incorrect password")
    ) {
      return {
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: ERROR_MESSAGES[AuthErrorCode.INVALID_CREDENTIALS],
        originalError: error,
      };
    }

    // User not found
    if (
      errorMessage.includes("user not found") ||
      errorMessage.includes("no user found")
    ) {
      return {
        code: AuthErrorCode.USER_NOT_FOUND,
        message: ERROR_MESSAGES[AuthErrorCode.USER_NOT_FOUND],
        originalError: error,
      };
    }

    // Session expired
    if (
      errorMessage.includes("session expired") ||
      errorMessage.includes("token expired") ||
      errorMessage.includes("invalid refresh token")
    ) {
      return {
        code: AuthErrorCode.SESSION_EXPIRED,
        message: ERROR_MESSAGES[AuthErrorCode.SESSION_EXPIRED],
        originalError: error,
      };
    }

    // OAuth provider not enabled
    if (
      errorMessage.includes("not enabled") ||
      errorMessage.includes("unsupported provider") ||
      errorStatus === 400
    ) {
      return {
        code: AuthErrorCode.OAUTH_PROVIDER_NOT_ENABLED,
        message: ERROR_MESSAGES[AuthErrorCode.OAUTH_PROVIDER_NOT_ENABLED],
        originalError: error,
      };
    }

    // Account exists
    if (
      errorMessage.includes("already exists") ||
      errorMessage.includes("already registered") ||
      errorMessage.includes("duplicate")
    ) {
      return {
        code: AuthErrorCode.ACCOUNT_EXISTS,
        message: ERROR_MESSAGES[AuthErrorCode.ACCOUNT_EXISTS],
        originalError: error,
      };
    }

    // Weak password
    if (
      errorMessage.includes("password") &&
      (errorMessage.includes("weak") ||
        errorMessage.includes("too short") ||
        errorMessage.includes("minimum"))
    ) {
      return {
        code: AuthErrorCode.WEAK_PASSWORD,
        message: ERROR_MESSAGES[AuthErrorCode.WEAK_PASSWORD],
        originalError: error,
      };
    }

    // Invalid token
    if (
      errorMessage.includes("invalid token") ||
      errorMessage.includes("token not found")
    ) {
      return {
        code: AuthErrorCode.INVALID_TOKEN,
        message: ERROR_MESSAGES[AuthErrorCode.INVALID_TOKEN],
        originalError: error,
      };
    }
  }

  // Handle network errors
  if (error instanceof Error) {
    if (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("timeout")
    ) {
      return {
        code: AuthErrorCode.NETWORK_ERROR,
        message: ERROR_MESSAGES[AuthErrorCode.NETWORK_ERROR],
        originalError: error,
      };
    }
  }

  // Default: unknown error
  return {
    code: AuthErrorCode.UNKNOWN_ERROR,
    message: ERROR_MESSAGES[AuthErrorCode.UNKNOWN_ERROR],
    originalError: error,
  };
}

/**
 * Get user-friendly error message for an error code
 * @param code - Error code
 * @returns User-friendly error message
 */
export function getErrorMessage(code: AuthErrorCode): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[AuthErrorCode.UNKNOWN_ERROR];
}

/**
 * Check if error is a network error
 * @param error - Error object
 * @returns boolean - true if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("fetch") ||
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("connection")
    );
  }

  return false;
}

/**
 * Check if error is an authentication error (can be retried)
 * @param error - Error object
 * @returns boolean - true if error can be retried
 */
export function isRetryableError(error: unknown): boolean {
  const parsed = parseAuthError(error);
  return (
    parsed.code === AuthErrorCode.NETWORK_ERROR ||
    parsed.code === AuthErrorCode.SESSION_EXPIRED ||
    parsed.code === AuthErrorCode.UNKNOWN_ERROR
  );
}
