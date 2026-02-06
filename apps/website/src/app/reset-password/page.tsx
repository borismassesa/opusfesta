"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { parseAuthError } from "@/lib/auth-errors";
import { toast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Calculate password strength
  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    if (pwd.length === 0) {
      return { strength: 0, label: "", color: "" };
    }
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    
    if (strength <= 2) {
      return { strength, label: "Weak", color: "bg-red-500" };
    } else if (strength <= 3) {
      return { strength, label: "Fair", color: "bg-yellow-500" };
    } else if (strength <= 4) {
      return { strength, label: "Good", color: "bg-blue-500" };
    } else {
      return { strength, label: "Strong", color: "bg-green-500" };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    let mounted = true;

    // Check if user came from code verification
    const verified = searchParams.get("verified");
    const email = searchParams.get("email");

    // Check for existing session (set by verify-reset-code page)
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error("Error getting session:", error);
        setHasSession(false);
        setIsChecking(false);
        return;
      }

      const hasValidSession = Boolean(data.session);
      setHasSession(hasValidSession);
      setIsChecking(false);

      // If not verified via code and no session, redirect to forgot-password
      if (!verified && !hasValidSession) {
        toast({
          variant: "destructive",
          title: "Invalid reset link",
          description: "Please request a new password reset code.",
        });
        router.push("/forgot-password");
        return;
      }

      // If verified but no session, something went wrong
      if (verified === "true" && !hasValidSession) {
        toast({
          variant: "destructive",
          title: "Session expired",
          description: "Please request a new password reset code.",
        });
        router.push("/forgot-password");
        return;
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setHasSession(Boolean(session));
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Invalid password",
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
      });
      return;
    }

    setIsLoading(true);
    
    // Verify we have a session before updating password
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast({
        variant: "destructive",
        title: "Session expired",
        description: "Please request a new password reset code.",
      });
      setIsLoading(false);
      router.push("/forgot-password");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      const parsedError = parseAuthError(error);
      toast({
        variant: "destructive",
        title: "Password update failed",
        description: parsedError.message,
      });
      setIsLoading(false);
      return;
    }

    // Sign out after password reset (security best practice)
    await supabase.auth.signOut();

    toast({
      title: "Password updated successfully!",
      description: "Redirecting to login page...",
    });
    
    setIsLoading(false);
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push("/login");
    }, 2000);
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

        {isChecking ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : hasSession === false ? (
          <div className="text-sm text-muted-foreground">
            This reset link is invalid or expired. Please request a new password reset code.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  aria-label="New password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  aria-label="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || hasSession === false || password.length < 8 || password !== confirmPassword}
              className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 w-full"
              aria-label="Update password"
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
