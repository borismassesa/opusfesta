"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import signupImg from "@assets/stock_images/happy_wedding_couple_e3561dd1.jpg";
import { resolveAssetSrc } from "@/lib/assets";
import { getRandomSignUpQuote, type Quote } from "@/lib/quotes";
import { handleOAuthSignIn, type UserType } from "@/lib/auth";
import { parseAuthError } from "@/lib/auth-errors";
import { OAuthUserTypeSelector } from "@/components/auth/OAuthUserTypeSelector";
import { toast } from "@/hooks/use-toast";

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"couple" | "vendor">("couple");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [quote, setQuote] = useState<Quote>(() => getRandomSignUpQuote());
  const [oauthUserTypeSelectorOpen, setOAuthUserTypeSelectorOpen] = useState(false);
  const [selectedOAuthProvider, setSelectedOAuthProvider] = useState<"google" | "apple" | null>(null);

  // Calculate password strength
  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    if (pwd.length === 0) {
      return { strength: 0, label: "", color: "" };
    }
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    
    if (strength <= 2) {
      return { strength, label: "Weak", color: "bg-red-500" };
    } else if (strength <= 3) {
      return { strength, label: "Fair", color: "bg-yellow-500" };
    } else if (strength <= 4) {
      return { strength, label: "Good", color: "bg-blue-500" };
    } else {
      return { strength, label: "Strong", color: "bg-green-500" };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    // Set a new random sign up quote on mount
    setQuote(getRandomSignUpQuote());
    
    // Store next parameter in sessionStorage (for email confirmation flows)
    const next = searchParams.get("next");
    if (next) {
      sessionStorage.setItem("auth_redirect", next);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
          ...(phone.trim() && { phone: phone.trim() }), // Only include phone if it's not empty
          userType,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse response JSON:", jsonError);
        const text = await response.text();
        console.error("Response text:", text);
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: "An unexpected error occurred. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        // Handle existing account cases
        if (data?.error === "An account with this email already exists" || data?.error?.includes("already exists")) {
          // If email is not verified, redirect to verification page
          if (data?.verified === false || data?.canResend) {
            toast({
              title: "Account already exists",
              description: "Redirecting to verification page...",
            });
            setIsLoading(false);
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
            return;
          }
          // If email is verified, redirect to login
          if (data?.verified === true) {
            toast({
              title: "Account already exists",
              description: "Please sign in instead.",
            });
            setIsLoading(false);
            router.push(`/login?email=${encodeURIComponent(email)}`);
            return;
          }
          // Generic existing account message
          toast({
            variant: "destructive",
            title: "Account already exists",
            description: data?.message || "Please sign in or use a different email.",
          });
          setIsLoading(false);
          return;
        }

        // Use improved error parsing
        const parsedError = parseAuthError(data?.error || new Error(data?.message || "Unknown error"));
        
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: parsedError.message,
        });
        setIsLoading(false);
        return;
      }

      try {
        sessionStorage.setItem(
          "pending_signup_credentials",
          JSON.stringify({
            email: email.trim(),
            password,
          })
        );
      } catch (storageError) {
        console.warn("Unable to store signup credentials for auto-login:", storageError);
      }

      // Redirect to verification page immediately for seamless experience
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      
      // Show toast after navigation starts
      toast({
        title: "Verification code sent",
        description: "Please check your email for the verification code.",
      });
    } catch (error) {
      console.error("Signup error:", error);
      const parsedError = parseAuthError(error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: parsedError.message,
      });
      setIsLoading(false);
    }
  };

  const handleOAuthClick = (provider: "google" | "apple") => {
    setSelectedOAuthProvider(provider);
    setOAuthUserTypeSelectorOpen(true);
  };

  const handleOAuthUserTypeSelect = async (selectedUserType: UserType) => {
    if (!selectedOAuthProvider) return;

    setIsOAuthLoading(selectedOAuthProvider);
    setOAuthUserTypeSelectorOpen(false);

    // Store next parameter for OAuth callback
    const next = searchParams.get("next");
    if (next) {
      sessionStorage.setItem("auth_redirect", next);
    }

    const result = await handleOAuthSignIn(selectedOAuthProvider, selectedUserType);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "OAuth sign-up failed",
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
            src={resolveAssetSrc(signupImg)} 
            alt="Wedding stationery" 
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
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="font-serif text-3xl text-primary">
              OpusFesta
            </Link>
          </div>

          <div className="space-y-1.5 text-center">
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-primary">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Join thousands of couples planning their big day.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* User Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-lg border border-border/50">
               <button
                 type="button"
                 onClick={() => setUserType("couple")}
                 className={`text-sm font-medium py-2.5 px-4 rounded-md transition-all duration-200 ${
                   userType === "couple" 
                   ? "bg-primary text-primary-foreground shadow-sm" 
                   : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                 }`}
               >
                 I'm a Couple
               </button>
               <button
                 type="button"
                 onClick={() => setUserType("vendor")}
                 className={`text-sm font-medium py-2.5 px-4 rounded-md transition-all duration-200 ${
                   userType === "vendor" 
                   ? "bg-primary text-primary-foreground shadow-sm" 
                   : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                 }`}
               >
                 I'm a Vendor
               </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative group">
                <label className="absolute -top-2.5 left-2.5 bg-background px-1.5 text-xs font-medium text-muted-foreground group-focus-within:text-primary transition-colors z-10">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Jane"
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="relative group">
                <label className="absolute -top-2.5 left-2.5 bg-background px-1.5 text-xs font-medium text-muted-foreground group-focus-within:text-primary transition-colors z-10">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

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

            <div className="relative group">
              <label className="absolute -top-2.5 left-2.5 bg-background px-1.5 text-xs font-medium text-muted-foreground group-focus-within:text-primary transition-colors z-10">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+255 123 456 789"
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                  placeholder="Create a password"
                  minLength={8}
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
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground pl-0.5">
                Must be at least 8 characters long.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || password.length < 8}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-11 w-full mt-1"
              aria-label="Create account"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Get Started"
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
              aria-label="Sign up with Google"
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
              aria-label="Sign up with Apple"
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
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
            >
              Sign in
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
