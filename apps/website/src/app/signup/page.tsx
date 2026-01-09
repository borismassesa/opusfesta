"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import signupImg from "@assets/stock_images/happy_wedding_couple_e3561dd1.jpg";
import { resolveAssetSrc } from "@/lib/assets";
import { getRandomSignUpQuote, type Quote } from "@/lib/quotes";
import { supabase } from "@/lib/supabaseClient";
import { createUserRecord, ensureUserRecord, getRedirectPath, getUserTypeFromSession, type UserType } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"couple" | "vendor">("couple");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [quote, setQuote] = useState<Quote>(() => getRandomSignUpQuote());

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

    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          user_type: userType,
        },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    // If session exists (email confirmation disabled), create user record and redirect
    if (data.session) {
      // Ensure user record exists in database
      const ensureResult = await ensureUserRecord(data.session);
      
      if (!ensureResult.success) {
        toast({
          variant: "destructive",
          title: "Account creation failed",
          description: ensureResult.error || "Failed to create user account",
        });
        setIsLoading(false);
        return;
      }

      // Get user type and redirect appropriately
      const userTypeFromSession = await getUserTypeFromSession(data.session);
      // Check sessionStorage for redirect path
      const next = sessionStorage.getItem("auth_redirect");
      const redirectPath = getRedirectPath(userTypeFromSession || userType, undefined, next);
      
      // Clear sessionStorage after use
      if (next) {
        sessionStorage.removeItem("auth_redirect");
      }
      
      toast({
        title: "Account created successfully!",
        description: "Welcome to TheFesta! Redirecting you now...",
      });
      
      router.push(redirectPath);
      return;
    }

    // If no session, email confirmation is required
    toast({
      title: "Check your email",
      description: "We've sent you a confirmation link. Please check your email (including spam folder) to verify your account before signing in.",
    });
    setIsLoading(false);
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white w-full">
          <Link
            href="/"
            className="font-serif text-4xl tracking-wide drop-shadow-sm hover:opacity-80 transition-opacity w-fit"
          >
            TheFesta
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
              TheFesta
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground pl-0.5">
                Must be at least 8 characters long.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-11 w-full mt-1"
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
            By continuing, you agree to TheFesta's{" "}
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
