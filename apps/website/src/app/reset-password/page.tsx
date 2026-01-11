"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

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
      toast({
        variant: "destructive",
        title: "Password update failed",
        description: error.message,
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
              <input
                type="password"
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Confirm password</label>
              <input
                type="password"
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || hasSession === false}
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
