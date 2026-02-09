"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
      router.replace(next);
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
        router.push(next as any);
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
      <div className="w-full max-w-[400px] space-y-8">
        <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <CardContent className="pt-10 pb-8 px-8 space-y-6">
            <div className="text-center">
              <Link href="/" className="font-serif text-3xl text-foreground hover:opacity-80 transition-opacity">
                OpusFesta
              </Link>
              <p className="text-xs text-muted-foreground mt-1">Admin Portal</p>
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Sign in to access the admin dashboard
              </p>
              {unauthorized && (
                <p className="text-sm text-destructive mt-2">
                  Your account does not have admin access.
                </p>
              )}
            </div>

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
                  className="h-10 border-border/40 focus-visible:border-primary/50 focus-visible:ring-primary/20 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 pr-10 border-border/40 focus-visible:border-primary/50 focus-visible:ring-primary/20 transition-colors"
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

              {errorMessage && (
                <p className="text-sm text-destructive text-center">{errorMessage}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading || !isLoaded}
                className="w-full h-10 mt-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/60 leading-relaxed px-6">
          By continuing, you agree to OpusFesta&apos;s{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-muted-foreground transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-muted-foreground transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
