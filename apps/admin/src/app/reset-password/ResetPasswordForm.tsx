"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export function ResetPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    setIsCheckingSession(true);

    const checkSession = async () => {
      try {
        // Check for access token in URL hash (Supabase sends it this way)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          // Set the session from URL hash
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!mounted) return;

          if (error) {
            console.error("Error setting session:", error);
            setHasSession(false);
            setErrorMessage("Invalid or expired reset link. Please request a new one.");
            setIsCheckingSession(false);
            return;
          }

          if (data.session) {
            setHasSession(true);
            // Clean up URL hash
            window.history.replaceState(null, "", window.location.pathname);
          } else {
            setHasSession(false);
            setErrorMessage("Invalid or expired reset link. Please request a new one.");
          }
        } else {
          // Check existing session (user might have already authenticated)
          const { data } = await supabase.auth.getSession();
          
          if (!mounted) return;

          const sessionExists = Boolean(data.session);
          setHasSession(sessionExists);
          
          if (!sessionExists) {
            setErrorMessage("Invalid or expired reset link. Please request a new one.");
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (!mounted) return;
        setHasSession(false);
        setErrorMessage("An error occurred. Please try again or request a new reset link.");
      } finally {
        if (mounted) {
          setIsCheckingSession(false);
        }
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const sessionExists = Boolean(session);
      setHasSession(sessionExists);
      if (!sessionExists) {
        setErrorMessage("Session expired. Please request a new reset link.");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validate password length
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match. Please make sure both passwords are the same.");
      return;
    }

    // Ensure we have a valid session before updating
    if (!hasSession) {
      setErrorMessage("Invalid or expired reset link. Please request a new one.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        setErrorMessage(error.message || "Failed to update password. Please try again.");
        setIsLoading(false);
        return;
      }

      // Success - show message and redirect
      setSuccessMessage("Password updated successfully! Redirecting to login...");
      setIsLoading(false);
      
      // Sign out the user after password reset (security best practice)
      await supabase.auth.signOut();
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Error updating password:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md border border-border rounded-2xl p-8 shadow-sm bg-background">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-primary">Reset password</h1>
          <Link
            href="/login"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </div>

        {isCheckingSession ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying reset link...</p>
          </div>
        ) : hasSession === false ? (
          <div className="space-y-4">
            <div className="text-sm text-destructive">
              {errorMessage || "This reset link is invalid or expired. Please request a new one."}
            </div>
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 w-full"
            >
              Request new reset link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <label className="absolute -top-2 left-2 bg-background px-1 text-xs font-medium text-primary/80 group-focus-within:text-primary transition-colors z-10">
                New password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative group">
              <label className="absolute -top-2 left-2 bg-background px-1 text-xs font-medium text-primary/80 group-focus-within:text-primary transition-colors z-10">
                Confirm password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long.
            </p>

            {errorMessage ? (
              <p className="text-sm text-destructive text-center">{errorMessage}</p>
            ) : null}

            {successMessage ? (
              <p className="text-sm text-green-600 dark:text-green-400 text-center">{successMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading || hasSession !== true || isCheckingSession}
              className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
