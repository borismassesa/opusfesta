"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { useSignIn } from "@clerk/nextjs";
import { toast } from "@/hooks/use-toast";
import { AuthPortalLayout } from "@/features/auth/components";
import { AUTH_WORDMARK_URL } from "@/features/auth/constants";

function clerkErrorFrom(err: unknown): { longMessage?: string; message?: string } | undefined {
  return (err as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors?.[0];
}

export default function ForgotPassword() {
  const { signIn, isLoaded } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setIsLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });

      toast({
        title: "Reset code sent!",
        description: "Check your email for the password reset code.",
      });

      setIsSubmitted(true);
      setIsLoading(false);
    } catch (err: unknown) {
      const clerkError = clerkErrorFrom(err);
      toast({
        variant: "destructive",
        title: "Failed to send reset code",
        description:
          clerkError?.longMessage ||
          clerkError?.message ||
          "An error occurred. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const promoCta = (
    <>
      <span className="mr-4 text-sm font-light opacity-80">
        Remember your password?
      </span>
      <Link
        href="/login"
        className="text-sm font-semibold px-6 py-2.5 border border-white/30 rounded-lg hover:bg-white/10 transition-all duration-300"
      >
        Sign in
      </Link>
    </>
  );

  return (
    <AuthPortalLayout promoCta={promoCta}>
      <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={AUTH_WORDMARK_URL}
            alt="OpusFesta"
            className="h-12 w-auto object-contain mb-6 lg:hidden"
          />
          <h1 className="text-4xl font-light text-gray-900 tracking-tight">
            Forgot password?
          </h1>
          <p className="mt-3 text-gray-500 font-light text-center">
            We&apos;ll send you a code to reset your password
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <label
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                  email
                    ? "-top-6 text-xs font-bold text-[#4f6cf6]"
                    : "top-3 text-gray-400 text-sm"
                }`}
              >
                Email address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="block w-full px-0 py-3 border-b border-gray-200 focus:border-[#4f6cf6] outline-none transition-all bg-transparent text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !isLoaded}
              className="w-full bg-[#4f6cf6] text-white py-4 px-4 rounded-xl font-bold hover:bg-[#3f57c5] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block align-middle" />
                  Sending code...
                </>
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-[#4f6cf6]/10 flex items-center justify-center text-[#4f6cf6]">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-semibold text-gray-900">Check your email</h3>
              <p className="text-sm text-gray-500">
                We&apos;ve sent a reset code to{" "}
                <span className="font-medium text-gray-900">{email}</span>
              </p>
            </div>
            <Link
              href={`/reset-password?email=${encodeURIComponent(email)}`}
              className="w-full flex items-center justify-center bg-[#4f6cf6] text-white py-3.5 px-4 rounded-xl font-bold hover:bg-[#3f57c5] transition-all"
            >
              Enter Reset Code
            </Link>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="text-sm text-[#4f6cf6] font-medium hover:text-[#3f57c5] transition-colors"
            >
              Try a different email
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-[#4f6cf6] font-medium hover:text-[#3f57c5] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthPortalLayout>
  );
}
