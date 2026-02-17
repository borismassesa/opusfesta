"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useSignIn } from "@clerk/nextjs";
import { toast } from "@/hooks/use-toast";
import { AuthPortalLayout } from "@/features/auth/components";
import { AUTH_WORDMARK_URL } from "@/features/auth/constants";

function clerkErrorFrom(err: unknown): { longMessage?: string; message?: string } | undefined {
  return (err as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors?.[0];
}

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { signIn, setActive, isLoaded } = useSignIn();

  const [step, setStep] = useState<"code" | "password" | "success">("code");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });

      if (result.status === "needs_new_password") {
        setStep("password");
      } else {
        setErrorMessage("Unexpected status. Please try again.");
      }
      setIsLoading(false);
    } catch (err: unknown) {
      const clerkError = clerkErrorFrom(err);
      setErrorMessage(
        clerkError?.longMessage ||
          clerkError?.message ||
          "Invalid code. Please try again."
      );
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await signIn.resetPassword({ password });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setStep("success");
        toast({
          title: "Password updated!",
          description: "Your password has been successfully reset.",
        });
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setErrorMessage(
          "Password reset requires additional steps. Please try again."
        );
      }
      setIsLoading(false);
    } catch (err: unknown) {
      const clerkError = clerkErrorFrom(err);
      setErrorMessage(
        clerkError?.longMessage ||
          clerkError?.message ||
          "Failed to reset password."
      );
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

  const stepTitle =
    step === "code"
      ? "Enter reset code"
      : step === "password"
        ? "Set new password"
        : "Password updated";
  const stepDescription =
    step === "code"
      ? `We sent a code to ${email}`
      : step === "password"
        ? "Enter your new password below"
        : "Your password has been successfully reset. Redirecting...";

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
            {stepTitle}
          </h1>
          <p className="mt-3 text-gray-500 font-light text-center">
            {stepDescription}
          </p>
        </div>

        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div className="relative group">
              <label className="absolute -top-6 left-0 text-xs font-bold text-[#4f6cf6]">
                Reset code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={isLoading}
                className="block w-full px-0 py-3 border-b border-gray-200 focus:border-[#4f6cf6] outline-none transition-all bg-transparent text-gray-900 text-center tracking-[0.3em] text-lg"
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !isLoaded}
              className="w-full bg-[#4f6cf6] text-white py-4 px-4 rounded-xl font-bold hover:bg-[#3f57c5] transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block align-middle" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="relative group">
              <label
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                  password
                    ? "-top-6 text-xs font-bold text-[#4f6cf6]"
                    : "top-3 text-gray-400 text-sm"
                }`}
              >
                New password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="block w-full px-0 py-3 border-b border-gray-200 focus:border-[#4f6cf6] outline-none transition-all bg-transparent text-gray-900 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-3 text-gray-400 hover:text-[#4f6cf6] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative group">
              <label
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                  confirmPassword
                    ? "-top-6 text-xs font-bold text-[#4f6cf6]"
                    : "top-3 text-gray-400 text-sm"
                }`}
              >
                Confirm password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="block w-full px-0 py-3 border-b border-gray-200 focus:border-[#4f6cf6] outline-none transition-all bg-transparent text-gray-900 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 top-3 text-gray-400 hover:text-[#4f6cf6] transition-colors"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !isLoaded}
              className="w-full bg-[#4f6cf6] text-white py-4 px-4 rounded-xl font-bold hover:bg-[#3f57c5] transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block align-middle" />
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-gray-900">Password updated</h3>
              <p className="text-sm text-gray-500">
                Your password has been successfully reset. Redirecting...
              </p>
            </div>
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
