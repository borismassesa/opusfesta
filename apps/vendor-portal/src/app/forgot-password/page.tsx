"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { useSignIn } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const { signIn, isLoaded } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setIsSubmitted(true);
      setIsLoading(false);
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      setErrorMessage(clerkError?.longMessage || clerkError?.message || "Failed to send reset code.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafafa] dark:bg-background">

      <div className="w-full max-w-[400px] space-y-8">
        <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <CardContent className="pt-10 pb-8 px-8 space-y-6">
            <div className="text-center">
              <Link href="/" className="font-serif text-3xl text-foreground hover:opacity-80 transition-opacity">
                OpusFesta
              </Link>
              <p className="text-xs text-muted-foreground mt-1">Vendor Portal</p>
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Forgot password?</h1>
              <p className="text-sm text-muted-foreground">
                We&apos;ll send you a code to reset your password
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-10 border-border/40 focus-visible:border-primary/50 focus-visible:ring-primary/20"
                  />
                </div>

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
                      Sending code...
                    </>
                  ) : (
                    "Send Reset Code"
                  )}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 py-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="font-semibold text-foreground">Check your email</h3>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ve sent a reset code to <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
                <Button asChild className="h-10 w-full">
                  <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
                    Enter Reset Code
                  </Link>
                </Button>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-sm text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  Try a different email
                </button>
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
