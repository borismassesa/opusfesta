"use client";

import Link from "next/link";
import { AUTH_FULL_LOGO_PATH } from "../constants";

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
      ? "h-9 w-auto object-contain"
      : "h-12 w-auto object-contain self-start";

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
          src={AUTH_FULL_LOGO_PATH}
          alt="OpusFesta - Plan Less, Celebrate More"
          className={logoClass}
        />
      </Link>
    </div>
  );
}
