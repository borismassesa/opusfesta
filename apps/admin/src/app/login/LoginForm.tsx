"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import loginImg from "@assets/stock_images/elegant_wedding_venu_86ae752a.jpg";
import { resolveAssetSrc } from "@/lib/assets";
import { supabase } from "@/lib/supabaseClient";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("unauthorized");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    // Check admin whitelist (database first, fallback to env var)
    try {
      const checkResponse = await fetch("/api/admin/whitelist/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkResponse.json();

      if (!checkData.whitelisted) {
        // Fallback to env var whitelist for backward compatibility
        const whitelistEnv = process.env.NEXT_PUBLIC_ADMIN_WHITELIST;
        if (whitelistEnv) {
          const adminWhitelist = whitelistEnv.split(",").map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
          if (adminWhitelist.length > 0 && !adminWhitelist.includes(email.toLowerCase())) {
            setErrorMessage(checkData.message || "Access denied. Your email is not authorized to access the admin portal.");
            setIsLoading(false);
            return;
          }
        } else {
          setErrorMessage(checkData.message || "Access denied. Your email is not authorized to access the admin portal.");
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      // If API fails, fallback to env var check
      console.warn("Whitelist API check failed, falling back to env var:", error);
      const whitelistEnv = process.env.NEXT_PUBLIC_ADMIN_WHITELIST;
      if (whitelistEnv) {
        const adminWhitelist = whitelistEnv.split(",").map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
        if (adminWhitelist.length > 0 && !adminWhitelist.includes(email.toLowerCase())) {
          setErrorMessage("Access denied. Your email is not authorized to access the admin portal.");
          setIsLoading(false);
          return;
        }
      } else {
        setErrorMessage("Password reset is temporarily unavailable. Please contact your system administrator for assistance.");
        setIsLoading(false);
        return;
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    if (!data.session) {
      setErrorMessage("Login failed: No session created");
      setIsLoading(false);
      return;
    }

    // Wait a moment for the session to be fully established
    await new Promise(resolve => setTimeout(resolve, 100));

    const next = searchParams.get("next") || "/";
    router.push(next as any);
  };

  return (
    <div className="h-screen overflow-hidden w-full flex bg-background">
      {/* Left Side - Image */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black h-full">
        <div className="absolute inset-0 z-0">
          <img 
            src={resolveAssetSrc(loginImg)} 
            alt="Elegant wedding venue" 
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
              "The highest happiness on earth is the happiness of marriage."
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-px w-8 bg-white/60"></div>
               <p className="text-white/80 text-sm tracking-wider uppercase font-medium">
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
            <Link href="/" className="font-serif text-3xl text-primary">
              TheFesta
            </Link>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-primary">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Enter your details to access your account.
            </p>
            {unauthorized ? (
              <p className="text-sm text-destructive">
                Your account does not have admin access.
              </p>
            ) : null}
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
              />
            </div>

            <div className="space-y-2">
              <div className="relative group">
                 <label className="absolute -top-2 left-2 bg-background px-1 text-xs font-medium text-primary/80 group-focus-within:text-primary transition-colors z-10">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary/60 hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 w-full"
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
            {errorMessage ? (
              <p className="text-sm text-destructive text-center">{errorMessage}</p>
            ) : null}
          </form>


          <p className="px-8 text-center text-xs text-muted-foreground">
            By continuing, you agree to TheFesta's{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            , and to receive periodic emails with updates.
          </p>
          
          <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
            <Link
              href="/"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
