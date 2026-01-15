"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { ensureUserRecord, getRedirectPath, getUserTypeFromSession } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

type AuthMode = "signin" | "signup";

interface AuthGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intent?: "booking" | "details";
  initialMode?: AuthMode;
  onAuthSuccess?: () => void;
}

export function AuthGateModal({
  open,
  onOpenChange,
  intent = "details",
  initialMode = "signin",
  onAuthSuccess,
}: AuthGateModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const intentCopy = useMemo(() => {
    if (intent === "booking") {
      return {
        title: "Sign in to request a booking",
        subtitle: "Create an account to contact vendors and manage your requests.",
      };
    }
    return {
      title: "Sign in to view more details",
      subtitle: "Get full access to vendor portfolios, reviews, and pricing.",
    };
  }, [intent]);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  const handleClose = () => {
    onOpenChange(false);
    setIsSubmitting(false);
  };

  const getCurrentPath = () => {
    if (typeof window === "undefined") return "/";
    return `${window.location.pathname}${window.location.search}`;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message?.toLowerCase().includes("invalid login")) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.message?.toLowerCase().includes("email not confirmed")) {
          errorMessage = "Please verify your email before signing in.";
        }
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: errorMessage,
        });
        setIsSubmitting(false);
        return;
      }

      if (!data.session) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: "No session created. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }

      const ensureResult = await ensureUserRecord(data.session);
      if (!ensureResult.success) {
        toast({
          variant: "destructive",
          title: "Account setup issue",
          description: ensureResult.error || "Unable to complete sign in.",
        });
        setIsSubmitting(false);
        return;
      }

      const currentPath = getCurrentPath();
      sessionStorage.setItem("auth_redirect", currentPath);
      const userType = await getUserTypeFromSession(data.session);
      const redirectPath = getRedirectPath(userType || undefined, undefined, currentPath);

      toast({
        title: "Welcome back!",
        description: "You're signed in. You can continue now.",
      });

      if (redirectPath && redirectPath !== currentPath) {
        router.push(redirectPath);
      }

      handleClose();
      onAuthSuccess?.();
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          ...(phone.trim() && { phone: phone.trim() }),
          userType: "couple",
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse response JSON:", jsonError);
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: "An unexpected error occurred. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        if (data?.error?.includes("already exists")) {
          if (data?.verified === false || data?.canResend) {
            toast({
              title: "Account already exists",
              description: "Redirecting to verification page...",
            });
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
            handleClose();
            return;
          }
          if (data?.verified === true) {
            toast({
              title: "Account already exists",
              description: "Please sign in instead.",
            });
            setMode("signin");
            setIsSubmitting(false);
            return;
          }
        }

        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: data?.error || data?.message || "An error occurred during signup.",
        });
        setIsSubmitting(false);
        return;
      }

      const currentPath = getCurrentPath();
      sessionStorage.setItem("auth_redirect", currentPath);

      toast({
        title: "Verification code sent",
        description: "Please check your email to complete signup.",
      });

      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      handleClose();
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden">
        <div className="p-6 space-y-5">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-2xl font-semibold text-foreground">
              {intentCopy.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{intentCopy.subtitle}</p>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-lg border border-border/50">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "signin"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create account
            </button>
          </div>

          {mode === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email address</Label>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-password">Password</Label>
                <div className="relative">
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
              <div className="text-xs text-center text-muted-foreground">
                <Link href="/forgot-password" className="hover:text-foreground transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="auth-first-name">First name</Label>
                  <Input
                    id="auth-first-name"
                    type="text"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth-last-name">Last name</Label>
                  <Input
                    id="auth-last-name"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-signup-email">Email address</Label>
                <Input
                  id="auth-signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-phone">Phone (optional)</Label>
                <Input
                  id="auth-phone"
                  type="tel"
                  placeholder="+255..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="auth-signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to OpusFesta's{" "}
                <Link href="/terms" className="underline hover:text-foreground transition-colors">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
