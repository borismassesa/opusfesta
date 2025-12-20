"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import loginImg from "@assets/stock_images/romantic_couple_wedd_0c0b1d37.jpg";
import { resolveAssetSrc } from "@/lib/assets";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
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
              Forgot password?
            </h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {!isSubmitted ? (
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

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 border border-border rounded-xl bg-muted/30">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Mail className="w-6 h-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Check your email</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset link to your email address.
                </p>
              </div>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-sm font-medium text-primary hover:underline mt-4"
              >
                Try with another email
              </button>
            </div>
          )}

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
