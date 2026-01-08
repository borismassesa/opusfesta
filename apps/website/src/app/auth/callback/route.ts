import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback route handler
 * 
 * Supabase OAuth redirects come in two ways:
 * 1. With a code in query params (PKCE flow) - handled by client component
 * 2. With tokens in URL hash (implicit flow) - handled by client component
 * 
 * This route redirects to the client-side callback page which handles both cases
 * Also handles error responses from Supabase (e.g., provider not enabled)
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const userTypeParam = requestUrl.searchParams.get("user_type");
  
  // Check for error parameters from Supabase
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const errorCode = requestUrl.searchParams.get("error_code");
  const errorMsg = requestUrl.searchParams.get("msg");
  
  // If there's an error, redirect to error page or login with error message
  if (error || errorCode || errorMsg) {
    // Check for provider not enabled error
    const isProviderNotEnabled = 
      errorMsg?.toLowerCase().includes("not enabled") ||
      errorMsg?.toLowerCase().includes("unsupported provider") ||
      errorMsg?.toLowerCase().includes("provider is not enabled") ||
      errorCode === "validation_failed" ||
      error === "provider_not_enabled";
    
    // Redirect to error page which will show toast and redirect to login
    const errorUrl = new URL("/auth/error", requestUrl.origin);
    errorUrl.searchParams.set("error", error || "oauth_failed");
    if (errorCode) errorUrl.searchParams.set("error_code", errorCode);
    if (errorMsg) errorUrl.searchParams.set("msg", errorMsg);
    if (errorDescription) errorUrl.searchParams.set("error_description", errorDescription);
    
    return NextResponse.redirect(errorUrl);
  }
  
  // Redirect to client-side callback page
  // The client component will handle the OAuth flow
  const callbackUrl = new URL("/auth/callback", requestUrl.origin);
  if (code) {
    callbackUrl.searchParams.set("code", code);
  }
  if (userTypeParam) {
    callbackUrl.searchParams.set("user_type", userTypeParam);
  }
  
  return NextResponse.redirect(callbackUrl);
}
