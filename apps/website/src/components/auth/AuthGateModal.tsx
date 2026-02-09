"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { toast } from "@/hooks/use-toast";

type AuthMode = "signin" | "signup";

type AuthGateIntent =
  | "booking"
  | "details"
  | "save"
  | "review"
  | "inquiry"
  | "apply"
  | "general";

interface AuthGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intent?: AuthGateIntent;
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
  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const intentCopy = useMemo(() => {
    switch (intent) {
      case "booking":
        return {
          title: "Sign in to request a booking",
          subtitle: "Create an account to contact vendors and manage your requests.",
        };
      case "save":
        return {
          title: "Sign in to save this vendor",
          subtitle: "Save your favorite vendors and access them anytime.",
        };
      case "review":
        return {
          title: "Sign in to leave a review",
          subtitle: "Share your experience to help other couples.",
        };
      case "inquiry":
        return {
          title: "Sign in to send an inquiry",
          subtitle: "Message vendors and track your conversations.",
        };
      case "apply":
        return {
          title: "Sign in to apply",
          subtitle: "Submit your application and track its status.",
        };
      case "general":
        return {
          title: "Sign in to continue",
          subtitle: "Create an account to access all features.",
        };
      case "details":
      default:
        return {
          title: "Sign in to view more details",
          subtitle: "Get full access to vendor portfolios, reviews, and pricing.",
        };
    }
  }, [intent]);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setPendingVerification(false);
      setVerificationCode("");
    }
  }, [open, initialMode]);

  const handleClose = () => {
    onOpenChange(false);
    setIsSubmitting(false);
    setPendingVerification(false);
    setVerificationCode("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignInLoaded || !signIn) return;
    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        toast({
          title: "Welcome back!",
          description: "You're signed in. You can continue now.",
        });
        handleClose();
        onAuthSuccess?.();
      } else {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: "Additional verification is required. Please try signing in from the login page.",
        });
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      let errorMessage = clerkError?.longMessage || clerkError?.message || "Invalid email or password. Please try again.";
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpLoaded || !signUp) return;
    setIsSubmitting(true);

    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        unsafeMetadata: {
          user_type: "couple",
          ...(phone.trim() && { phone: phone.trim() }),
        },
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      setIsSubmitting(false);
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: clerkError?.longMessage || clerkError?.message || "An error occurred during signup.",
      });
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpLoaded || !signUp) return;
    setIsSubmitting(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
        toast({
          title: "Account created!",
          description: "Welcome to OpusFesta.",
        });
        handleClose();
        onAuthSuccess?.();
      } else {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: "Could not complete verification. Please try again.",
        });
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: clerkError?.longMessage || clerkError?.message || "Invalid code. Please try again.",
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
              {pendingVerification ? "Verify your email" : intentCopy.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {pendingVerification
                ? `We sent a verification code to ${email}`
                : intentCopy.subtitle}
            </p>
          </DialogHeader>

          {pendingVerification ? (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-verify-code">Verification code</Label>
                <Input
                  id="auth-verify-code"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  className="text-center tracking-[0.5em] text-lg"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & continue"
                )}
              </Button>
            </form>
          ) : (
            <>
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
