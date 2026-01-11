"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "@/lib/toast";

export default function ForgotPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/request-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "An error occurred. Please try again.");
        setIsLoading(false);
        return;
      }

      toast.success("Reset code sent! Check your email for the password reset code.");

      setIsLoading(false);
      // Redirect to verify-reset-code page
      router.push(`/verify-reset-code?email=${encodeURIComponent(email.trim())}`);
    } catch (error) {
      console.error("Request reset code error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden w-full flex bg-background">
      {/* Left Side - Gradient Background */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden h-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPgo8cmVjdCB3aWR0aD0nNCcgaGVpZ2h0PSc0JyBmaWxsPScjZmZmJy8+CjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyNjY2MnLz4KPC9zdmc+')] opacity-[0.02] dark:opacity-[0.03]" />
        </div>
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full w-full">
          <Link
            href="/"
            className="font-serif text-4xl tracking-wide text-slate-700 dark:text-slate-200 hover:opacity-80 transition-opacity w-fit"
          >
            OpusFesta
          </Link>
          
          <div className="backdrop-blur-sm bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 p-8 rounded-3xl shadow-xl max-w-lg">
            <h2 className="text-3xl font-serif mb-4 leading-normal text-slate-700 dark:text-slate-200">
              "The highest happiness on earth is the happiness of marriage."
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-px w-8 bg-slate-400/60 dark:bg-slate-400/40"></div>
               <p className="text-slate-600 dark:text-slate-300 text-sm tracking-wider uppercase font-medium">
                 William Lyon Phelps
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-start lg:justify-center items-center p-8 sm:p-12 lg:p-24 pt-24 lg:pt-0 relative bg-background h-full overflow-y-auto">
        <div className="w-full max-w-sm space-y-10 pb-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="font-serif text-3xl text-primary hover:opacity-80 transition-opacity">
              OpusFesta
            </Link>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-primary">
              Forgot password?
            </h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a code to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <label className="absolute -top-2 left-2 bg-background px-1 text-xs font-medium text-primary/80 group-focus-within:text-primary transition-colors z-10">
                Email
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
          
          <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
            <Link
              href="/login"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
