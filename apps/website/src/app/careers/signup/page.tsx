"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2, Briefcase, CheckCircle2, FileText, Bell, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CareersSignup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
          userType: "couple", // Careers signups are always "couple" type
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Signup API error:", {
          status: response.status,
          error: data.error,
          details: data.details,
          verified: data.verified,
          canResend: data.canResend,
        });
        
        // If user exists but not verified, redirect to verification page
        if (data.canResend && !data.verified) {
          toast({
            title: "Account exists",
            description: "Redirecting to verification page...",
          });
          const next = searchParams.get("next") || sessionStorage.getItem("auth_redirect");
          const verifyUrl = `/verify-email?email=${encodeURIComponent(email)}${next ? `&next=${encodeURIComponent(next)}` : ""}`;
          router.push(verifyUrl);
          setIsLoading(false);
          return;
        }
        
        // If user exists and is verified, suggest login
        if (data.verified) {
          toast({
            variant: "destructive",
            title: "Account already exists",
            description: "Please sign in instead",
          });
          // Optionally redirect to login
          setTimeout(() => {
            router.push(`/careers/login?email=${encodeURIComponent(email)}`);
          }, 2000);
          setIsLoading(false);
          return;
        }
        
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: data.error || data.message || "An error occurred during signup",
        });
        setIsLoading(false);
        return;
      }

      // Show success message
      toast({
        title: "Verification code sent",
        description: "Please check your email for the verification code.",
      });

      // Preserve the redirect path for after verification
      const next = searchParams.get("next") || sessionStorage.getItem("auth_redirect");
      if (next) {
        sessionStorage.setItem("auth_redirect", next);
      }
      
      // Redirect to verification page immediately for seamless experience
      const verifyUrl = `/verify-email?email=${encodeURIComponent(email)}${next ? `&next=${encodeURIComponent(next)}` : ""}`;
      router.push(verifyUrl);
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: FileText,
      text: "Track all your applications"
    },
    {
      icon: Bell,
      text: "Get notified of updates"
    },
    {
      icon: CheckCircle2,
      text: "Save jobs for later"
    }
  ];

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - Enhanced Visual Panel */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-linear-to-br from-primary/5 via-primary/2 to-background">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
            alt="Diverse team working together"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-linear-to-br from-primary/60 via-primary/40 to-primary/60" />
        </div>
        
        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
        
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
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-semibold text-primary">
                  Join our team
                </h2>
              </div>
              <p className="text-lg text-secondary leading-relaxed">
                Create your account to start applying for positions and track your applications in real-time.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/50">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="flex items-center gap-3 text-secondary">
                    <Icon className="w-5 h-5 text-primary/60" />
                    <span className="text-sm">{benefit.text}</span>
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
              Create your account
            </h1>
            <p className="text-base text-muted-foreground">
              Start your journey with OpusFesta. We'll keep you updated on your application status.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-primary">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Jane"
                  className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-primary">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

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
              <label htmlFor="phone" className="text-sm font-medium text-primary">
                Phone number <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+255 123 456 789"
                className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                  placeholder="Create a password"
                  className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 pr-12 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="space-y-4 pt-4">
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href={`/careers/login${searchParams.get("next") ? `?next=${encodeURIComponent(searchParams.get("next")!)}` : ""}`}
                className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
              >
                Sign in
              </Link>
            </div>

            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                By continuing, you agree to OpusFesta's{" "}
                <Link href="/terms" className="underline hover:text-primary transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                , and to receive periodic emails with updates.
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/signup"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Looking for wedding services? Sign up as a couple or vendor →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
