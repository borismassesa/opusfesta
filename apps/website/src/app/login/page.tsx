"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { getRandomSignInQuote, type Quote } from "@/lib/quotes";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("unauthorized");
  const next = searchParams.get("next") || "/";
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [quote, setQuote] = useState<Quote>(() => getRandomSignInQuote());

  useEffect(() => {
    setQuote(getRandomSignInQuote());
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      router.replace(next);
    }
  }, [isSignedIn, next, router]);

  useEffect(() => {
    if (unauthorized) {
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "Your account does not have admin access.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unauthorized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast({
          title: "Welcome back!",
          description: "Successfully signed in. Redirecting you now...",
        });
        router.push(next);
      } else {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: "Sign in requires additional steps. Please try again.",
        });
        setIsLoading(false);
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      const errorMessage = clerkError?.longMessage || clerkError?.message || "Invalid email or password. Please try again.";
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  const handleOAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    if (!isLoaded || !signIn) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: next,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "Failed to initiate sign in. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafafa] dark:bg-background">

      <div className="w-full max-w-[400px] space-y-8">
        <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <CardContent className="pt-10 pb-8 px-8 space-y-6">
            {/* Logo */}
            <div className="text-center">
              <Link href="/" className="font-serif text-3xl text-foreground hover:opacity-80 transition-opacity">
                OpusFesta
              </Link>
            </div>

            {/* Title */}
            <div className="text-center space-y-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full justify-center gap-3 font-normal border-border/40 bg-background hover:bg-muted/50 hover:border-border/80 transition-all"
                onClick={() => handleOAuth("oauth_google")}
              >
                <svg className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full justify-center gap-3 font-normal border-border/40 bg-background hover:bg-muted/50 hover:border-border/80 transition-all"
                onClick={() => handleOAuth("oauth_apple")}
              >
                <svg className="h-[18px] w-[18px] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
                Continue with Apple
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground/60">or</span>
              </div>
            </div>

            {/* Form */}
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
                    disabled={isLoading}
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

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-medium hover:text-primary/80 transition-colors"
              >
                Sign up
              </Link>
            </p>
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

        {/* Quote */}
        <div className="text-center px-6" suppressHydrationWarning>
          <p className="text-sm text-muted-foreground/50 italic" suppressHydrationWarning>
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-xs text-muted-foreground/40 mt-1.5" suppressHydrationWarning>
            &mdash; {quote.author}
          </p>
        </div>
      </div>
    </div>
  );
}
