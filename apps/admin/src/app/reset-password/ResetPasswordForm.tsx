"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useSignIn } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState<"code" | "password" | "success">("code");

  const emailFromQuery = searchParams.get("email") || "";

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });

      if (result.status === "needs_new_password") {
        setStep("password");
        setIsLoading(false);
      } else {
        setErrorMessage("Unexpected status. Please try again.");
        setIsLoading(false);
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      setErrorMessage(clerkError?.longMessage || clerkError?.message || "Invalid or expired code. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match. Please make sure both passwords are the same.");
      return;
    }

    if (!isLoaded || !signIn) return;
    setIsLoading(true);

    try {
      const result = await signIn.resetPassword({ password });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setStep("success");
        setIsLoading(false);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setErrorMessage("Failed to reset password. Please try again.");
        setIsLoading(false);
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      setErrorMessage(clerkError?.longMessage || clerkError?.message || "Failed to update password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-8">
        <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <CardContent className="pt-10 pb-8 px-8 space-y-6">
            <div className="text-center">
              <Link href="/" className="font-serif text-3xl text-foreground hover:opacity-80 transition-opacity">
                OpusFesta
              </Link>
              <p className="text-xs text-muted-foreground mt-1">Admin Portal</p>
            </div>

            {step === "code" && (
              <>
                <div className="text-center space-y-1">
                  <h1 className="text-xl font-semibold tracking-tight text-foreground">Enter reset code</h1>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to{" "}
                    {emailFromQuery ? <span className="font-medium text-foreground">{emailFromQuery}</span> : "your email"}
                  </p>
                </div>

                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="code" className="text-sm font-medium text-foreground">Reset code</Label>
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      required
                      placeholder="000000"
                      autoFocus
                      className="h-10 text-center tracking-[0.3em] text-lg border-border/40 focus-visible:border-primary/50 focus-visible:ring-primary/20"
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-sm text-destructive text-center">{errorMessage}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !isLoaded || code.length < 6}
                    className="w-full h-10"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>

                  <div className="text-center">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary font-medium hover:text-primary/80 transition-colors"
                    >
                      Didn&apos;t receive a code? Request a new one
                    </Link>
                  </div>
                </form>
              </>
            )}

            {step === "password" && (
              <>
                <div className="text-center space-y-1">
                  <h1 className="text-xl font-semibold tracking-tight text-foreground">Set new password</h1>
                  <p className="text-sm text-muted-foreground">
                    Enter your new password below
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">New password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-10 pr-10 border-border/40 focus-visible:border-primary/50 focus-visible:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-10 pr-10 border-border/40 focus-visible:border-primary/50 focus-visible:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground/70">
                    Password must be at least 8 characters long.
                  </p>

                  {errorMessage && (
                    <p className="text-sm text-destructive text-center">{errorMessage}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !isLoaded}
                    className="w-full h-10"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </form>
              </>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center justify-center space-y-3 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-foreground">Password updated</h3>
                  <p className="text-sm text-muted-foreground">
                    Your password has been successfully reset. Redirecting...
                  </p>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
