"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2, Check } from "lucide-react";
import signupImg from "@assets/stock_images/elegant_wedding_invi_ec57761b.jpg";
import { resolveAssetSrc } from "@/lib/assets";

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"couple" | "vendor">("couple");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate signup delay
    setTimeout(() => setIsLoading(false), 2000);
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
           <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        </div>
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white w-full">
          <div className="flex justify-between items-start">
            <Link
              href="/"
              className="font-serif text-4xl tracking-wide drop-shadow-sm hover:opacity-80 transition-opacity"
            >
              TheFesta
            </Link>
          </div>
          
          <div className="backdrop-blur-xl bg-black/40 border border-white/10 p-10 rounded-3xl shadow-2xl max-w-xl self-end">
            <h2 className="text-5xl mb-8 leading-snug drop-shadow-md text-white" style={{ fontFamily: 'Sacramento, cursive' }}>
              Start planning the celebration of a lifetime.
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                 <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center group-hover:border-white/80 transition-colors">
                    <Check className="w-4 h-4 text-white" />
                 </div>
                 <span className="text-lg font-light tracking-wide text-white/90">Manage guests & RSVPs easily</span>
              </div>
              <div className="flex items-center gap-4 group">
                 <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center group-hover:border-white/80 transition-colors">
                    <Check className="w-4 h-4 text-white" />
                 </div>
                 <span className="text-lg font-light tracking-wide text-white/90">Find top-rated local vendors</span>
              </div>
              <div className="flex items-center gap-4 group">
                 <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center group-hover:border-white/80 transition-colors">
                    <Check className="w-4 h-4 text-white" />
                 </div>
                 <span className="text-lg font-light tracking-wide text-white/90">Stay on budget with smart tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-start lg:justify-center items-center p-8 sm:p-12 lg:p-24 pt-24 lg:pt-0 relative h-full overflow-y-auto">
        <div className="w-full max-w-sm space-y-8 pb-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="font-serif text-3xl text-primary">
              TheFesta
            </Link>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-primary">
              Create an account
            </h1>
            <p className="text-muted-foreground">
              Join thousands of couples planning their big day.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* User Type Toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-transparent rounded-lg">
               <button
                 type="button"
                 onClick={() => setUserType("couple")}
                 className={`text-sm font-medium py-2 rounded-md transition-all ${
                   userType === "couple" 
                   ? "bg-primary text-primary-foreground shadow-sm" 
                   : "text-zinc-500 hover:text-white dark:hover:bg-zinc-700 hover:bg-primary"
                 }`}
               >
                 I'm a Couple
               </button>
               <button
                 type="button"
                 onClick={() => setUserType("vendor")}
                 className={`text-sm font-medium py-2 rounded-md transition-all ${
                   userType === "vendor" 
                   ? "bg-primary text-primary-foreground shadow-sm" 
                   : "text-zinc-500 hover:text-white dark:hover:bg-zinc-700 hover:bg-primary"
                 }`}
               >
                 I'm a Vendor
               </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <label className="absolute -top-2 left-2 bg-background px-1 text-xs font-medium text-primary/80 group-focus-within:text-primary transition-colors z-10">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Jane"
                  className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              <div className="relative group">
                <label className="absolute -top-2 left-2 bg-background px-1 text-xs font-medium text-primary/80 group-focus-within:text-primary transition-colors z-10">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Must be at least 8 characters long.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 w-full"
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or sign up with
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
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.79-1.31.02-2.3-1.23-3.14-2.47-1.72-2.48-3-7.01-1.24-10.05.87-1.52 2.42-2.48 4.12-2.5 1.3-.03 2.52.87 3.32.87.79 0 2.28-.97 3.84-.83 1.31.11 2.5.63 3.33 1.63-2.96 1.77-2.46 6.09.66 7.37-.2 1.26-.78 2.51-1.28 3.51zM15.42 5.51c.72-1.14 1.2-2.73.99-4.32-1.38.1-3.05 1.16-3.81 2.41-.66 1.07-1.24 2.78-.92 4.22 1.54.12 3.02-1.17 3.74-2.31z" />
                </svg>
                Apple
             </button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Sign in
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
