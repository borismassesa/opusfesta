"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2, Briefcase, CheckCircle2, FileText, Bell } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { ensureUserRecord, getRedirectPath, getUserTypeFromSession } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export default function CareersLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const next = searchParams.get("next");
    if (next) {
      sessionStorage.setItem("auth_redirect", next);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
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

    const ensureResult = await ensureUserRecord(data.session);
    
    if (!ensureResult.success) {
      toast({
        variant: "destructive",
        title: "Account setup issue",
        description: ensureResult.error || "Unable to complete sign in. Please try again or contact support.",
      });
      setIsLoading(false);
      return;
    }

    const userType = await getUserTypeFromSession(data.session);
    const next = searchParams.get("next") || sessionStorage.getItem("auth_redirect");
    const redirectPath = getRedirectPath(userType || undefined, undefined, next);
    
    if (sessionStorage.getItem("auth_redirect")) {
      sessionStorage.removeItem("auth_redirect");
    }
    
    toast({
      title: "Welcome back!",
      description: "Successfully signed in. Redirecting you now...",
    });
    
    router.push(redirectPath);
  };

  const features = [
    {
      icon: FileText,
      text: "Track application status"
    },
    {
      icon: Bell,
      text: "Get real-time updates"
    },
    {
      icon: CheckCircle2,
      text: "Manage your job search"
    }
  ];

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - Enhanced Visual Panel */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/2 to-background">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2070&auto=format&fit=crop"
            alt="Professional team collaboration"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/40 to-primary/60" />
        </div>
        
        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <Link
            href="/careers"
            className="font-serif text-3xl tracking-wide text-primary hover:opacity-80 transition-opacity w-fit"
          >
            OpusFesta Careers
          </Link>
          
          <div className="max-w-md space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-semibold text-primary">
                  Welcome back
                </h2>
              </div>
              <p className="text-lg text-secondary leading-relaxed">
                Sign in to access your applications, track their status, and continue exploring opportunities.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/50">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="flex items-center gap-3 text-secondary">
                    <Icon className="w-5 h-5 text-primary/60" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center p-6 sm:p-8 lg:p-16 relative min-h-screen">
        {/* Back Button */}
        <Link
          href="/careers"
          className="absolute top-6 left-6 lg:top-8 lg:left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to careers
        </Link>

        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center pb-4">
            <Link href="/careers" className="font-serif text-2xl text-primary inline-block">
              OpusFesta Careers
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-primary">
              Sign in to your account
            </h1>
            <p className="text-base text-muted-foreground">
              Access your dashboard to track applications and manage your job search.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-primary">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-primary">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 pr-12 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-surface"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="space-y-4 pt-4">
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href={`/careers/signup${searchParams.get("next") ? `?next=${encodeURIComponent(searchParams.get("next")!)}` : ""}`}
                className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
              >
                Create account
              </Link>
            </div>

            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                By signing in, you agree to OpusFesta's{" "}
                <Link href="/terms" className="underline hover:text-primary transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Looking for wedding services? Sign in to main site →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
