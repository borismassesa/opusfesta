"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { ensureUserRecord, getRedirectPath, getUserTypeFromSession } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export default function CareersSignup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
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

    // For careers signup, set user_type to "couple" (which maps to "user" role in database)
    // This allows job applicants to use the same role as couples, but the context (careers signup)
    // distinguishes them as job applicants
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          user_type: "couple", // Maps to "user" role - context distinguishes job applicants
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
      const redirectPath = getRedirectPath(userTypeFromSession || "couple", undefined, next);
      
      // Clear sessionStorage after use
      if (next) {
        sessionStorage.removeItem("auth_redirect");
      }
      
      toast({
        title: "Account created successfully!",
        description: "Welcome! Redirecting you to complete your application...",
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
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - Professional Image/Content */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background h-full">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_70%)]" />
        </div>
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-primary w-full">
          <Link
            href="/careers"
            className="font-serif text-4xl tracking-wide hover:opacity-80 transition-opacity w-fit"
          >
            OpusFesta Careers
          </Link>
          
          <div className="backdrop-blur-md bg-surface/50 border border-border/50 p-8 rounded-3xl shadow-2xl max-w-lg">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-semibold leading-normal text-primary">
                Join Our Team
              </h2>
            </div>
            <p className="text-secondary text-base leading-relaxed">
              Create an account to apply for positions and track your applications. 
              We're building the future of wedding planning, and we'd love to have you on board.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative h-full overflow-y-auto">
        <div className="w-full max-w-sm space-y-6 pb-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/careers" className="font-serif text-3xl text-primary">
              OpusFesta Careers
            </Link>
          </div>

          <div className="space-y-1.5 text-center">
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-primary">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign up to apply for positions and track your applications.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link
              href={`/login${searchParams.get("next") ? `?next=${encodeURIComponent(searchParams.get("next")!)}` : ""}`}
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

          <div className="text-center text-xs text-muted-foreground pt-2">
            Looking for wedding services?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
            >
              Sign up as a couple or vendor
            </Link>
          </div>
          
          <div className="absolute top-6 left-6 lg:top-8 lg:left-8">
            <Link
              href="/careers"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to careers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
