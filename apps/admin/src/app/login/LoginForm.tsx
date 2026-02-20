"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("unauthorized");
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      const next = searchParams.get("next") || "/";
      router.replace(next as Route);
    }
  }, [isSignedIn, searchParams, router]);

  // Clean URL when only param is next=/ (avoid /login?next=%2F)
  useEffect(() => {
    const next = searchParams.get("next");
    if (next === "/" && window.location.pathname === "/login") {
      router.replace("/login", { scroll: false });
    }
  }, [router, searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setIsLoading(true);
    setErrorMessage("");

    // Check admin whitelist (database first, fallback to env var)
    try {
      const checkResponse = await fetch("/api/admin/whitelist/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkResponse.json();

      if (!checkData.whitelisted) {
        // Fallback to env var whitelist for backward compatibility
        const whitelistEnv = process.env.NEXT_PUBLIC_ADMIN_WHITELIST;
        if (whitelistEnv) {
          const adminWhitelist = whitelistEnv.split(",").map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
          if (adminWhitelist.length > 0 && !adminWhitelist.includes(email.toLowerCase())) {
            setErrorMessage(checkData.message || "Access denied. Your email is not authorized to access the admin portal.");
            setIsLoading(false);
            return;
          }
        } else {
          setErrorMessage(checkData.message || "Access denied. Your email is not authorized to access the admin portal.");
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      // If API fails, fallback to env var check
      console.warn("Whitelist API check failed, falling back to env var:", error);
      const whitelistEnv = process.env.NEXT_PUBLIC_ADMIN_WHITELIST;
      if (whitelistEnv) {
        const adminWhitelist = whitelistEnv.split(",").map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
        if (adminWhitelist.length > 0 && !adminWhitelist.includes(email.toLowerCase())) {
          setErrorMessage("Access denied. Your email is not authorized to access the admin portal.");
          setIsLoading(false);
          return;
        }
      } else {
        setErrorMessage("Password reset is temporarily unavailable. Please contact your system administrator for assistance.");
        setIsLoading(false);
        return;
      }
    }

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        const next = searchParams.get("next") || "/";
        router.push(next as Route);
      } else {
        setErrorMessage("Sign in requires additional steps. Please try again.");
        setIsLoading(false);
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      setErrorMessage(
        clerkError?.longMessage || clerkError?.message || "Invalid email or password"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="text-center space-y-1.5">
              <Link href="/" className="font-serif text-3xl text-foreground hover:opacity-80 transition-opacity inline-block">
                OpusFesta
              </Link>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-semibold text-foreground">Sign in to continue</h1>
              <p className="text-sm text-muted-foreground">
                Access the admin dashboard and manage your platform.
              </p>
              {unauthorized && (
                <p className="text-sm text-destructive mt-2">
                  Your account does not have admin access.
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
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

              {errorMessage && (
                <p className="text-sm text-destructive text-center">{errorMessage}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading || !isLoaded}
                className="w-full"
              >
                {isLoading ? (
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

              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to OpusFesta&apos;s{" "}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
