"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { getRandomSignInQuote, type Quote } from "@/lib/quotes";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { toast } from "@/hooks/use-toast";
import { AuthPortalLayout } from "@/features/auth/components";
import { AUTH_WORDMARK_URL } from "@/features/auth/constants";

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
    } catch (err: unknown) {
      const clerkError = (err as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors?.[0];
      const errorMessage =
        clerkError?.longMessage ||
        clerkError?.message ||
        "Invalid email or password. Please try again.";
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
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "Failed to initiate sign in. Please try again.",
      });
    }
  };

  const promoCta = (
    <>
      <span className="mr-4 text-sm font-light opacity-80">
        Don&apos;t have an account yet?
      </span>
      <Link
        href={`/signup${next && next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
        className="text-sm font-semibold px-6 py-2.5 border border-white/30 rounded-lg hover:bg-white/10 transition-all duration-300"
      >
        Sign up
      </Link>
    </>
  );

  return (
    <AuthPortalLayout promoCta={promoCta}>
      <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center">
          {/* Mobile-only logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={AUTH_WORDMARK_URL}
            alt="OpusFesta"
            className="h-12 w-auto object-contain mb-6 lg:hidden"
          />
          <h1 className="text-4xl font-light text-gray-900 tracking-tight">
            Log in
          </h1>
          <p className="mt-3 text-gray-500 font-light text-center">
            Welcome back to OpusFesta. Enter your credentials to manage your
            celebrations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-6">
            <div className="relative group">
              <label
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                  email
                    ? "-top-6 text-xs font-bold text-[#4f6cf6]"
                    : "top-3 text-gray-400 text-sm"
                }`}
              >
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="block w-full px-0 py-3 border-b border-gray-200 focus:border-[#4f6cf6] outline-none transition-all bg-transparent text-gray-900"
              />
            </div>

            <div className="relative group">
              <label
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                  password
                    ? "-top-6 text-xs font-bold text-[#4f6cf6]"
                    : "top-3 text-gray-400 text-sm"
                }`}
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="block w-full px-0 py-3 border-b border-gray-200 focus:border-[#4f6cf6] outline-none transition-all bg-transparent text-gray-900 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-3 text-gray-400 hover:text-[#4f6cf6] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer appearance-none w-5 h-5 rounded border border-gray-300 text-[#4f6cf6] focus:ring-0 cursor-pointer transition-all checked:bg-[#4f6cf6] checked:border-[#4f6cf6]"
                  tabIndex={-1}
                  aria-hidden
                />
                <svg
                  className="absolute w-3 h-3 text-white left-1 pointer-events-none hidden peer-checked:block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={4}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                Keep me signed in
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-[#4f6cf6] hover:text-[#3f57c5] font-semibold transition-colors"
            >
              Reset password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isLoaded}
            className="w-full bg-[#4f6cf6] text-white py-4 px-4 rounded-xl font-bold hover:bg-[#3f57c5] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block align-middle" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-100" />
            <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-[0.2em]">
              OR
            </span>
            <div className="flex-grow border-t border-gray-100" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleOAuth("oauth_google")}
              disabled={!isLoaded}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3.5 px-4 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 transition-all hover:border-gray-300 shadow-sm"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("oauth_apple")}
              disabled={!isLoaded}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3.5 px-4 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 transition-all hover:border-gray-300 shadow-sm"
            >
              <svg
                className="h-5 w-5 shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="text-center pt-2">
            <span className="text-sm text-gray-400 font-medium">
              Organization Single Sign-On
            </span>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup${next && next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-[#4f6cf6] font-medium hover:text-[#3f57c5] transition-colors"
          >
            Sign up
          </Link>
        </p>

        <p className="text-center text-xs text-gray-500 leading-relaxed px-2">
          By continuing, you agree to OpusFesta&apos;s{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-gray-700 transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-gray-700 transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <div className="text-center px-2" suppressHydrationWarning>
          <p className="text-sm text-gray-500 italic" suppressHydrationWarning>
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-xs text-gray-400 mt-1.5" suppressHydrationWarning>
            &mdash; {quote.author}
          </p>
        </div>
      </div>
    </AuthPortalLayout>
  );
}
