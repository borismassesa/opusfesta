"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import loginImg from "@assets/stock_images/romantic_couple_wedd_0c0b1d37.jpg";
import { resolveAssetSrc } from "@/lib/assets";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => setIsLoading(false), 2000);
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
            <h2 className="text-3xl font-serif mb-4 leading-normal text-white">
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
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-11">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
             </button>
             <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-11">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-.98-.42-2.05-.42-3.01 0-1.07.47-2.09.55-3.23-.4-4.44-4.19-3.8-11.19 1.74-11.38 1.4.05 2.37.8 3.15.82.71.02 1.96-.85 3.37-.7 1.8.15 3.12.82 3.96 2.05-3.5 1.76-2.9 6.57.54 7.9-.69 1.76-1.68 3.48-3.44 5.3zM14.47 5.25c.82-1.05 1.35-2.48 1.2-3.77-1.2.07-2.65.82-3.5 1.85-.75.92-1.4 2.38-1.2 3.7 1.35.1 2.7-.75 3.5-1.78z" />
                </svg>
                Apple
             </button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Sign up
            </Link>
          </div>

          <p className="px-8 text-center text-xs text-muted-foreground">
            By continuing, you agree to TheFesta's{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
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
