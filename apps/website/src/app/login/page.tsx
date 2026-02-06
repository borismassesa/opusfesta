"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import loginImg from "@assets/stock_images/romantic_couple_wedd_0c0b1d37.jpg";
import { resolveAssetSrc } from "@/lib/assets";
import { getRandomSignInQuote, type Quote } from "@/lib/quotes";
import { supabase } from "@/lib/supabaseClient";
import { ensureUserRecord, getRedirectPath, getUserTypeFromSession, handleOAuthSignIn, type UserType } from "@/lib/auth";
import { parseAuthError, AuthErrorCode } from "@/lib/auth-errors";
import { setRememberMe as saveRememberMePreference, isRememberMeEnabled } from "@/lib/session";
import { redirectAfterLogin } from "@/lib/redirects";
import { OAuthUserTypeSelector } from "@/components/auth/OAuthUserTypeSelector";
import { toast } from "@/hooks/use-toast";

class AuthTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthTimeoutError";
  }
}

const withTimeout = async <T,>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new AuthTimeoutError(message));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("unauthorized");
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [quote, setQuote] = useState<Quote>(() => getRandomSignInQuote());
  const [oauthUserTypeSelectorOpen, setOAuthUserTypeSelectorOpen] = useState(false);
  const [selectedOAuthProvider, setSelectedOAuthProvider] = useState<"google" | "apple" | null>(null);

  useEffect(() => {
    // Set a new random sign in quote on mount (client-side only)
    setQuote(getRandomSignInQuote());
    
    // Store next parameter in sessionStorage for OAuth flows
    const next = searchParams.get("next");
    if (next) {
      sessionStorage.setItem("auth_redirect", next);
    }

    // Load remember me preference
    setRememberMe(isRememberMeEnabled());
  }, [searchParams]);

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
    setIsLoading(true);

    let data;
    let error;
    try {
      const result = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        8000,
        "Sign in is taking longer than expected."
      );
      data = result.data;
      error = result.error;
    } catch (err) {
      if (err instanceof AuthTimeoutError) {
        toast({
          variant: "destructive",
          title: "Sign in timed out",
          description: "Please check your connection and try again.",
        });
        setIsLoading(false);
        return;
      }
      throw err;
    }

    if (error) {
      // Use improved error parsing
      const parsedError = parseAuthError(error);
      
      toast({
        variant: "destructive",
        title: parsedError.code === AuthErrorCode.EMAIL_NOT_VERIFIED 
          ? "Email not verified" 
          : "Sign in failed",
        description: parsedError.message,
      });
      
      setIsLoading(false);
      return;
    }

    if (!data.session) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "No session created. Please try again.",
      });
      setIsLoading(false);
      return;
    }

    const userTypeHint = data.session.user.user_metadata?.user_type as UserType | undefined;

    // Ensure user record exists in database (guard against long-running requests)
    try {
      const ensureResult = await withTimeout(
        ensureUserRecord(data.session),
        8000,
        "Account setup is taking longer than expected."
      );
      
      if (!ensureResult.success) {
        // Show user-friendly error message (technical errors are already sanitized in ensureUserRecord)
        toast({
          variant: "destructive",
          title: "Account setup issue",
          description: ensureResult.error || "Unable to complete sign in. Please try again or contact support.",
        });
        setIsLoading(false);
        return;
      }
    } catch (err) {
      if (err instanceof AuthTimeoutError) {
        toast({
          title: "Signing you in",
          description: "Account setup is taking longer than expected. Redirecting you now...",
        });
      } else {
        console.error("Error ensuring user record:", err);
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: "Unable to complete sign in. Please try again.",
        });
        setIsLoading(false);
        return;
      }
    }

    // Save remember me preference
    saveRememberMePreference(rememberMe);

    // Get user type (fallback to metadata if lookup is slow)
    let userType = userTypeHint || null;
    try {
      const fetchedUserType = await withTimeout(
        getUserTypeFromSession(data.session),
        4000,
        "User type lookup is taking longer than expected."
      );
      if (fetchedUserType) {
        userType = fetchedUserType;
      }
    } catch (err) {
      if (!(err instanceof AuthTimeoutError)) {
        console.error("Error getting user type:", err);
      }
    }

    // Get user role for redirect
    const role = data.session.user.user_metadata?.role || "user";
    
    // Check both URL param and sessionStorage (for OAuth flows)
    const next = searchParams.get("next") || sessionStorage.getItem("auth_redirect");
    
    toast({
      title: "Welcome back!",
      description: "Successfully signed in. Redirecting you now...",
    });
    
    // Use redirect utility
    redirectAfterLogin(role as any, userType || undefined, next || undefined);
  };

  const handleOAuthClick = (provider: "google" | "apple") => {
    setSelectedOAuthProvider(provider);
    setOAuthUserTypeSelectorOpen(true);
  };

  const handleOAuthUserTypeSelect = async (userType: UserType) => {
    if (!selectedOAuthProvider) return;

    setIsOAuthLoading(selectedOAuthProvider);
    setOAuthUserTypeSelectorOpen(false);

    // Store next parameter for OAuth callback
    const next = searchParams.get("next");
    if (next) {
      sessionStorage.setItem("auth_redirect", next);
    }

    const result = await handleOAuthSignIn(selectedOAuthProvider, userType);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "OAuth sign-in failed",
        description: result.error,
      });
      setIsOAuthLoading(null);
    }
    // OAuth will redirect, so we don't need to do anything else
  };

  return (
    <div className="h-screen overflow-hidden w-full flex bg-background">
      {/* Left Side - Image */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black h-full">
        <div className="absolute inset-0 z-0">
          <img 
            src={resolveAssetSrc(loginImg)} 
            alt="Couple at sunset" 
            className="w-full h-full object-cover opacity-90 scale-105 hover:scale-100 transition-transform duration-[20s] ease-in-out"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white w-full">
          <Link
            href="/"
            className="font-serif text-4xl tracking-wide drop-shadow-sm hover:opacity-80 transition-opacity w-fit"
          >
            OpusFesta
          </Link>
          
          <div className="backdrop-blur-md bg-white/10 border border-white/10 p-8 rounded-3xl shadow-2xl max-w-lg">
            <h2 className="text-3xl font-serif mb-4 leading-normal text-white" suppressHydrationWarning>
              "{quote.text}"
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-px w-8 bg-white/60"></div>
               <p className="text-white/80 text-sm tracking-wider uppercase font-medium" suppressHydrationWarning>
                 {quote.author}
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative h-full overflow-y-auto">
        <div className="w-full max-w-sm space-y-6 pb-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6 -mt-8">
            <Link href="/" className="font-serif text-3xl text-primary">
              OpusFesta
            </Link>
          </div>

          <div className="space-y-1.5 text-center">
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-primary">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your details to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <label className="absolute -top-2.5 left-2.5 bg-background px-1.5 text-xs font-medium text-muted-foreground group-focus-within:text-primary transition-colors z-10">
                Email
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="relative group">
                 <label className="absolute -top-2.5 left-2.5 bg-background px-1.5 text-xs font-medium text-muted-foreground group-focus-within:text-primary transition-colors z-10">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  aria-label="Password"
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
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setRememberMe(checked);
                      setRememberMe(checked); // Save to localStorage
                    }}
                    className="h-4 w-4 rounded border-input"
                    aria-label="Remember me"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline underline-offset-4 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-11 w-full mt-1"
              aria-label="Sign in"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* OAuth Buttons */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthClick("google")}
              disabled={isOAuthLoading !== null || isLoading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-4"
              aria-label="Sign in with Google"
            >
              {isOAuthLoading === "google" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleOAuthClick("apple")}
              disabled={isOAuthLoading !== null || isLoading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-4"
              aria-label="Sign in with Apple"
            >
              {isOAuthLoading === "apple" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Apple
                </>
              )}
            </button>
          </div>

          <OAuthUserTypeSelector
            open={oauthUserTypeSelectorOpen}
            onOpenChange={setOAuthUserTypeSelectorOpen}
            onSelect={handleOAuthUserTypeSelect}
            provider={selectedOAuthProvider || "google"}
          />

          <div className="text-center text-sm text-muted-foreground pt-2">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
            >
              Sign up
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground leading-relaxed pt-1">
            By continuing, you agree to OpusFesta's{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            , and to receive periodic emails with updates.
          </p>
          
          <div className="absolute top-6 left-6 lg:top-8 lg:left-8">
            <Link
              href="/"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
