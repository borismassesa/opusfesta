"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ensureUserRecord, getRedirectPath, getUserTypeFromSession, type UserType } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const userTypeParam = searchParams.get("user_type") as UserType | null;

  useEffect(() => {
    let mounted = true;

    const handleAuthCallback = async () => {
      try {
        // Check if we're on an error page (Supabase might redirect to error URL)
        // Check for error in query params
        const errorParam = searchParams.get("error");
        const errorDescriptionParam = searchParams.get("error_description");
        const errorCode = searchParams.get("error_code");
        const errorMsg = searchParams.get("msg");
        
        // Check for JSON error in URL (sometimes Supabase returns error as JSON in query)
        let jsonError = null;
        try {
          const errorJson = searchParams.get("error_json");
          if (errorJson) {
            jsonError = JSON.parse(decodeURIComponent(errorJson));
          }
        } catch {
          // Not JSON, ignore
        }
        
        if (errorParam || errorCode || errorMsg || jsonError) {
          let finalErrorMsg = errorDescriptionParam || errorMsg || errorParam || jsonError?.msg || "Authentication failed";
          
          // Check for provider not enabled error
          if (
            finalErrorMsg?.toLowerCase().includes("not enabled") ||
            finalErrorMsg?.toLowerCase().includes("unsupported provider") ||
            finalErrorMsg?.toLowerCase().includes("provider is not enabled") ||
            errorCode === "validation_failed" ||
            errorParam === "provider_not_enabled" ||
            jsonError?.error_code === "validation_failed"
          ) {
            finalErrorMsg = "OAuth provider (Google/Apple) is not enabled in your Supabase project. Please enable it in the Supabase Dashboard under Authentication → Providers. See docs/SUPABASE_OAUTH_SETUP.md for instructions, or use email/password to sign in.";
          }
          
          toast({
            variant: "destructive",
            title: "Authentication failed",
            description: finalErrorMsg,
          });
          router.push("/login");
          return;
        }
        
        // Get the session from URL hash (Supabase OAuth redirects with tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        if (error) {
          console.error("OAuth error:", error, errorDescription);
          
          let errorMsg = errorDescription || error;
          
          // Check for provider not enabled error
          if (error === "provider_not_enabled" || errorDescription?.includes("not enabled") || errorDescription?.includes("Unsupported provider")) {
            errorMsg = "OAuth provider is not enabled. Please contact support or use email/password to sign in.";
          }
          
          toast({
            variant: "destructive",
            title: "Authentication failed",
            description: errorMsg,
          });
          router.push("/login");
          return;
        }

        if (accessToken && refreshToken) {
          // Set the session
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError || !data.session) {
            console.error("Error setting session:", sessionError);
            toast({
              variant: "destructive",
              title: "Session error",
              description: sessionError?.message || "Failed to create session",
            });
            router.push("/login");
            return;
          }

          // Clean up URL hash
          window.history.replaceState(null, "", window.location.pathname + (userTypeParam ? `?user_type=${userTypeParam}` : ""));

          // Ensure user record exists
          const ensureResult = await ensureUserRecord(data.session);
          
          if (!ensureResult.success) {
            console.error("Failed to ensure user record:", ensureResult.error);
            toast({
              variant: "destructive",
              title: "Account setup failed",
              description: ensureResult.error || "Failed to create user account",
            });
            router.push("/login");
            return;
          }

          // If user_type was provided and user doesn't have a role yet, update it
          if (userTypeParam) {
            const { data: userData } = await supabase
              .from("users")
              .select("role")
              .eq("id", data.session.user.id)
              .single();

            if (!userData?.role || (userData.role === "user" && userTypeParam !== "couple")) {
              const roleToSet = userTypeParam === "couple" ? "user" : userTypeParam === "vendor" ? "vendor" : "admin";
              await supabase
                .from("users")
                .update({ role: roleToSet })
                .eq("id", data.session.user.id);
            }
          }

          // Get user type and redirect
          const userType = await getUserTypeFromSession(data.session);
          // Check sessionStorage for redirect path (set before OAuth redirect)
          const next = sessionStorage.getItem("auth_redirect");
          const redirectPath = getRedirectPath(userType || userTypeParam || undefined, undefined, next);

          // Clear sessionStorage after use
          if (next) {
            sessionStorage.removeItem("auth_redirect");
          }

          toast({
            title: "Successfully authenticated!",
            description: "Redirecting you now...",
          });

          router.push(redirectPath);
        } else {
          // Check if we have a code in query params (PKCE flow)
          const code = searchParams.get("code");
          if (code) {
            // Exchange code for session (PKCE flow)
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError || !data.session) {
              console.error("Error exchanging code for session:", exchangeError);
              
              let errorMsg = exchangeError?.message || "Failed to create session";
              
              // Check for provider not enabled error
              if (
                errorMsg?.toLowerCase().includes("not enabled") ||
                errorMsg?.toLowerCase().includes("unsupported provider") ||
                errorMsg?.toLowerCase().includes("provider is not enabled") ||
                exchangeError?.status === 400
              ) {
                errorMsg = "OAuth provider is not enabled in your Supabase project. Please enable it in the Supabase Dashboard under Authentication → Providers, or use email/password to sign in.";
              }
              
              // Try to parse JSON error
              try {
                if (typeof errorMsg === "string" && errorMsg.trim().startsWith("{")) {
                  const parsed = JSON.parse(errorMsg);
                  if (parsed.msg) {
                    errorMsg = parsed.msg;
                  }
                }
              } catch {
                // Not JSON, use as is
              }
              
              toast({
                variant: "destructive",
                title: "Authentication failed",
                description: errorMsg,
              });
              router.push("/login");
              return;
            }

            // Ensure user record exists
            const ensureResult = await ensureUserRecord(data.session);
            
            if (!ensureResult.success) {
              console.error("Failed to ensure user record:", ensureResult.error);
              toast({
                variant: "destructive",
                title: "Account setup failed",
                description: ensureResult.error || "Failed to create user account",
              });
              router.push("/login");
              return;
            }

            // If user_type was provided and user doesn't have a role yet, update it
            if (userTypeParam) {
              const { data: userData } = await supabase
                .from("users")
                .select("role")
                .eq("id", data.session.user.id)
                .single();

              if (!userData?.role || (userData.role === "user" && userTypeParam !== "couple")) {
                const roleToSet = userTypeParam === "couple" ? "user" : userTypeParam === "vendor" ? "vendor" : "admin";
                await supabase
                  .from("users")
                  .update({ role: roleToSet })
                  .eq("id", data.session.user.id);
              }
            }

            // Get user type and redirect
            const userType = await getUserTypeFromSession(data.session);
            // Check sessionStorage for redirect path (set before OAuth redirect)
            const next = sessionStorage.getItem("auth_redirect");
            const redirectPath = getRedirectPath(userType || userTypeParam || undefined, undefined, next);

            // Clear sessionStorage after use
            if (next) {
              sessionStorage.removeItem("auth_redirect");
            }

            toast({
              title: "Successfully authenticated!",
              description: "Redirecting you now...",
            });

            router.push(redirectPath);
          } else {
            toast({
              variant: "destructive",
              title: "Invalid callback",
              description: "No authentication tokens found",
            });
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
        });
        router.push("/login");
      } finally {
        if (mounted) {
          setIsProcessing(false);
        }
      }
    };

    handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, [router, searchParams, userTypeParam]);

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
