"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, CheckCircle2, Edit, X, AlertCircle } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { getRedirectPath, getUserTypeFromSession, type UserType } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [codeExpiresAt, setCodeExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const hasShownWelcomeToast = useRef(false);
  const errorId = useRef(`error-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    setIsMounted(true);
    if (!email) {
      router.push("/signup");
      return;
    }
    
    // Store redirect path from URL params to sessionStorage if present
    const next = searchParams.get("next");
    if (next) {
      sessionStorage.setItem("auth_redirect", next);
    }
    sessionStorage.removeItem("pending_signup_credentials");
    
    // Set code expiry time (10 minutes from now)
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
    setCodeExpiresAt(expiryTime);
    
    // Show success toast when page first loads (code was sent)
    if (!hasShownWelcomeToast.current) {
      hasShownWelcomeToast.current = true;
      toast({
        title: "Verification code sent",
        description: "Please check your email for the verification code.",
      });
    }
  }, [email, router, searchParams]);

  useEffect(() => {
    // Countdown timer for resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    // Code expiry countdown timer
    if (!codeExpiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = codeExpiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("0:00");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [codeExpiresAt]);

  const formatError = (errorMessage: string): string => {
    const lowerError = errorMessage.toLowerCase();
    if (lowerError.includes("expired")) {
      return "This code has expired. Please request a new one.";
    }
    if (lowerError.includes("invalid") || lowerError.includes("incorrect")) {
      return "The code you entered is incorrect. Please try again or resend a new code.";
    }
    if (lowerError.includes("too many") || lowerError.includes("attempts")) {
      return "Too many verification attempts. Please request a new code.";
    }
    return errorMessage;
  };

  const buildRedirectPath = (nextPath: string | null, options?: { withAuthModal?: boolean }) => {
    if (!nextPath) return null;
    if (!nextPath.startsWith("/vendors/")) return nextPath;

    const [basePath, queryString] = nextPath.split("?");
    const params = new URLSearchParams(queryString || "");
    if (options?.withAuthModal) {
      params.set("authModal", "1");
      params.set("authIntent", "details");
    }
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code;
    if (codeToVerify.length !== 6) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: codeToVerify,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(formatError(data.error || "Invalid verification code"));
        setIsLoading(false);
        return;
      }

      // If we have tokens, set the session
      if (data.accessToken && data.refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.accessToken,
          refresh_token: data.refreshToken,
        });

        if (sessionError) {
          console.error("Error setting session:", sessionError);
          toast({
            title: "Email verified",
            description: "Please sign in to continue.",
          });
          // Check if we're in careers context
          const nextFromUrl = searchParams.get("next");
          const nextFromStorage = sessionStorage.getItem("auth_redirect");
          const next = nextFromUrl || nextFromStorage;
          const isCareersContext = next?.includes("/careers") || 
                                  (typeof window !== "undefined" && window.location.pathname.includes("/careers"));
          const loginPath = isCareersContext ? "/careers/login" : "/login";
          const loginUrl = next ? `${loginPath}?next=${encodeURIComponent(next)}` : loginPath;
          router.push(loginUrl);
          return;
        }

        // Get session to determine redirect
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          const userType = await getUserTypeFromSession(sessionData.session);
          // Get next from URL params first, then sessionStorage
          const nextFromUrl = searchParams.get("next");
          const nextFromStorage = sessionStorage.getItem("auth_redirect");
          const next = nextFromUrl || nextFromStorage;

          const vendorRedirect = buildRedirectPath(next);
          const redirectPath = vendorRedirect || getRedirectPath(
            userType || undefined,
            undefined,
            next
          );

          if (next) {
            sessionStorage.removeItem("auth_redirect");
          }

          // Show success state briefly before redirect
          setIsVerified(true);
          
          setTimeout(() => {
            toast({
              title: "Email verified successfully!",
              description: "Welcome to OpusFesta!",
            });
            router.push(redirectPath);
          }, 1500);
          return;
        }
      }

      // If no tokens but success, redirect to login with email pre-filled
      if (data.requiresSignIn || (!data.accessToken && !data.refreshToken)) {
        toast({
          title: "Email verified",
          description: "Please sign in to continue.",
        });
        // Check if we're in careers context
        const nextFromUrl = searchParams.get("next");
        const nextFromStorage = sessionStorage.getItem("auth_redirect");
        const next = nextFromUrl || nextFromStorage;
        const vendorRedirect = buildRedirectPath(next, { withAuthModal: true });
        if (vendorRedirect) {
          if (next) {
            sessionStorage.removeItem("auth_redirect");
          }
          router.push(vendorRedirect);
          return;
        }
        const isCareersContext = next?.includes("/careers") || 
                                (typeof window !== "undefined" && window.location.pathname.includes("/careers"));
        const loginPath = isCareersContext ? "/careers/login" : "/login";
        const loginParams = new URLSearchParams({
          verified: "true",
          email: email || "",
        });
        if (next) {
          loginParams.set("next", next);
        }
        router.push(`${loginPath}?${loginParams.toString()}`);
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Verification error:", error);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) {
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(formatError(data.error || "Failed to resend code"));
        setIsResending(false);
        return;
      }

      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email.",
      });

      // Reset expiry timer
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
      setCodeExpiresAt(expiryTime);
      setResendCooldown(60); // 60 second cooldown
      setIsResending(false);
    } catch (error) {
      console.error("Resend error:", error);
      setError("Failed to resend code. Please try again.");
      setIsResending(false);
    }
  };

  const handleEditEmail = () => {
    router.push(`/signup?email=${encodeURIComponent(email || "")}`);
  };

  if (!email) {
    return null;
  }

  const isExpiringSoon = timeRemaining && parseInt(timeRemaining.split(":")[0]) < 2;

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 relative">
      {/* Back button - top left */}
      {!isVerified && (
        <Link
          href="/signup"
          className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to sign up"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>
      )}

      <div className={`w-full max-w-md space-y-4 transition-all duration-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Icon */}
        <div className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
            isVerified 
              ? 'bg-green-100 dark:bg-green-900/20 scale-110' 
              : 'bg-primary/10 scale-100'
          }`}>
            {isVerified ? (
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 animate-in zoom-in duration-300" />
            ) : (
              <Mail className="w-8 h-8 text-primary transition-all duration-300" />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">
            {isVerified ? "Email Verified!" : "Verify your email"}
          </h1>
          {!isVerified && (
            <p className="text-sm text-muted-foreground">
              We've sent a 6-digit code to
            </p>
          )}
        </div>

        {/* Email with edit capability */}
        {!isVerified && (
          <div className="flex items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-sm font-medium text-foreground">
              <span>{email}</span>
              <button
                type="button"
                onClick={handleEditEmail}
                className="text-primary hover:text-primary/80 transition-colors"
                aria-label="Edit email address"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {!isVerified && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {/* OTP Input */}
            <div className="flex justify-center" role="group" aria-label="Verification code input">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => {
                  setCode(value);
                  setError(null);
                }}
                disabled={isLoading || isVerified}
                aria-describedby={error ? errorId.current : undefined}
                aria-invalid={error ? "true" : "false"}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} hasError={!!error} />
                  <InputOTPSlot index={1} hasError={!!error} />
                  <InputOTPSlot index={2} hasError={!!error} />
                  <InputOTPSlot index={3} hasError={!!error} />
                  <InputOTPSlot index={4} hasError={!!error} />
                  <InputOTPSlot index={5} hasError={!!error} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Code expiry timer */}
            {timeRemaining && (
              <p className={`text-xs text-center ${isExpiringSoon ? 'text-destructive' : 'text-muted-foreground'}`}>
                {isExpiringSoon ? (
                  <span className="flex items-center justify-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Code expires in {timeRemaining}
                  </span>
                ) : (
                  `Code expires in ${timeRemaining}`
                )}
              </p>
            )}

            {/* Trust & Security Microcopy */}
            <p className="text-xs text-center text-muted-foreground">
              For your security, this code expires in 10 minutes
            </p>

            {/* Error Message */}
            {error && (
              <div 
                id={errorId.current}
                className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive animate-in slide-in-from-top-2 duration-200"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start gap-2">
                  <X className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Verify Button */}
            <Button
              onClick={() => handleVerify()}
              disabled={code.length !== 6 || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>

            {/* Resend Code */}
            <div className="text-center space-y-1 pt-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                aria-label={resendCooldown > 0 ? `Resend code in ${resendCooldown} seconds` : "Resend verification code"}
              >
                {isResending ? (
                  <>
                    <Loader2 className="inline w-4 h-4 animate-spin mr-1" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  "Resend code"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Verified State */}
        {isVerified && (
          <div className="text-center space-y-2 animate-in fade-in duration-300">
            <p className="text-sm text-muted-foreground">
              Your email has been verified successfully. Redirecting you now...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
