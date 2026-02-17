"use client";

import Link from "next/link";
import { AUTH_TAGLINE, AUTH_WORDMARK_URL } from "../constants";

interface AuthBrandHeaderProps {
  /** Show only on mobile (lg:hidden) */
  mobileOnly?: boolean;
  /** Show only on desktop (hidden lg:block) */
  desktopOnly?: boolean;
  /** Logo height class */
  logoSize?: "sm" | "md";
}

export function AuthBrandHeader({
  mobileOnly = false,
  desktopOnly = false,
  logoSize = "md",
}: AuthBrandHeaderProps) {
  const logoClass =
    logoSize === "sm"
      ? "h-8 w-auto object-contain"
      : "h-10 w-auto object-contain self-start";
  const taglineClass =
    logoSize === "sm"
      ? "text-[8px] uppercase tracking-[0.2em] text-[#4f6cf6] font-bold mt-1"
      : "text-[10px] uppercase tracking-[0.3em] text-[#4f6cf6] font-bold mt-1.5 ml-1";

  const wrapperClass = [
    "flex flex-col",
    mobileOnly && "lg:hidden",
    desktopOnly && "hidden lg:block",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClass}>
      <Link
        href="/"
        className="block focus:outline-none focus:ring-2 focus:ring-[#4f6cf6] focus:ring-offset-2 rounded"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AUTH_WORDMARK_URL}
          alt="OpusFesta"
          className={logoClass}
        />
      </Link>
      <span className={taglineClass}>{AUTH_TAGLINE}</span>
    </div>
  );
}
