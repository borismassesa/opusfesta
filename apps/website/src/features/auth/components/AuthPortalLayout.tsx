"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AUTH_PROMO_BG_IMAGE_URL } from "../constants";
import { AuthBrandHeader } from "./AuthBrandHeader";
import { AuthPromoPanel } from "./AuthPromoPanel";

interface AuthPortalLayoutProps {
  children: ReactNode;
  /** Optional CTA for top-right on desktop promo panel (e.g. "Sign up" link) */
  promoCta?: ReactNode;
}

export function AuthPortalLayout({ children, promoCta }: AuthPortalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-white text-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden p-6 flex justify-between items-center bg-white border-b border-gray-100 shadow-sm z-10">
        <AuthBrandHeader mobileOnly logoSize="sm" />
        <Link
          href="/signup"
          className="text-sm font-semibold px-4 py-2 bg-[#1a0b2e] text-white border border-white rounded-lg hover:bg-[#2a1b3e] transition-colors"
        >
          Sign up
        </Link>
      </div>

      {/* Left Column: Auth Content (~58%) */}
      <div className="w-full lg:w-[58%] flex flex-col bg-white overflow-y-auto">
        <div className="hidden lg:block px-12 py-10">
          <AuthBrandHeader desktopOnly logoSize="md" />
        </div>

        <div className="flex-1 flex items-start justify-center p-6 sm:p-12 lg:p-20">
          {children}
        </div>

        <div className="hidden lg:block px-12 py-8">
          <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
            <span>© 2024 OpusFesta Inc. All rights reserved.</span>
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="hover:text-gray-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-gray-600 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Promotional Content (~42%) */}
      <div className="w-full lg:w-[42%] relative bg-[#1a0b2e] flex flex-col justify-center items-center overflow-hidden min-h-[500px] lg:min-h-screen">
        {/* Full-bleed blurred background image (group/celebration photo) */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={AUTH_PROMO_BG_IMAGE_URL}
            alt=""
            className="w-full h-full object-cover blur-2xl opacity-40"
          />
        </div>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-[#1a0b2e]/70" aria-hidden />
        <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-purple-700/10 rounded-full blur-[120px]" aria-hidden />
        <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[120px]" aria-hidden />

        {promoCta && (
          <div className="hidden lg:flex absolute top-10 right-10 text-white z-10 items-center">
            {promoCta}
          </div>
        )}

        <div className="relative z-10 w-full flex flex-col justify-center items-center">
          <AuthPromoPanel />
        </div>
      </div>
    </div>
  );
}
