"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import loginImg from "@assets/stock_images/romantic_couple_wedd_0c0b1d37.jpg";
import { resolveAssetSrc } from "@/lib/assets";
import { getRandomSignInQuote, type Quote } from "@/lib/quotes";
import { supabase } from "@/lib/supabaseClient";
import { ensureUserRecord, getRedirectPath, getUserTypeFromSession, type UserType } from "@/lib/auth";
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
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [quote, setQuote] = useState<Quote>(() => getRandomSignInQuote());

  useEffect(() => {
    // Set a new random sign in quote on mount (client-side only)
    setQuote(getRandomSignInQuote());
    
    // Store next parameter in sessionStorage for OAuth flows
    const next = searchParams.get("next");
    if (next) {
      sessionStorage.setItem("auth_redirect", next);
    }
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
      // Check for email confirmation errors
      const isEmailNotConfirmed = 
        error.message?.toLowerCase().includes("email not confirmed") ||
        error.message?.toLowerCase().includes("email_not_confirmed") ||
        error.message?.toLowerCase().includes("confirm your email");
      
      if (isEmailNotConfirmed) {
        toast({
          variant: "destructive",
          title: "Email not verified",
          description: "Please check your email and click the confirmation link before signing in. Check your spam folder if you don't see it.",
        });
      } else {
        // Show user-friendly error messages
        let errorMessage = error.message;
        
        // Sanitize technical error messages
        if (error.message?.toLowerCase().includes("invalid login")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message?.toLowerCase().includes("user not found")) {
          errorMessage = "No account found with this email. Please sign up first.";
        } else if (error.message?.toLowerCase().includes("wrong password")) {
          errorMessage = "Incorrect password. Please try again or use 'Forgot password' to reset it.";
        }
        
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: errorMessage,
        });
      }
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
    // Check both URL param and sessionStorage (for OAuth flows)
    const next = searchParams.get("next") || sessionStorage.getItem("auth_redirect");
    const redirectPath = getRedirectPath(userType || undefined, undefined, next);
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/login";
    const safeRedirectPath = redirectPath === currentPath || redirectPath.startsWith("/login")
      ? "/"
      : redirectPath;
    
    // Clear sessionStorage after use
    if (sessionStorage.getItem("auth_redirect")) {
      sessionStorage.removeItem("auth_redirect");
    }
    
    toast({
      title: "Welcome back!",
      description: "Successfully signed in. Redirecting you now...",
    });
    
    sessionStorage.setItem("auth_login_pending", String(Date.now()));
    router.push(safeRedirectPath);
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
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
