"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useTranslation } from "react-i18next";
import { useOpusFestaAuth } from "@opusfesta/auth";

export function MenuOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { isLoaded, isSignedIn } = useOpusFestaAuth();

  const isAuthenticated = isLoaded ? isSignedIn : false;
  const isCheckingAuth = !isLoaded;

  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const NAV_LINKS = [
    { name: t('nav.planning'), href: "/planning-tools" },
    { name: t('nav.vendors'), href: "/vendors" },
    { name: t('nav.guests'), href: "/guests" },
    { name: t('nav.websites'), href: "/websites" },
    { name: t('nav.inspiration'), href: "/advice-and-ideas" },
    { name: t('nav.attireAndRings'), href: "/attireandrings" },
    { name: "Careers", href: "/careers" },
  ];

  useEffect(() => {
    if (isOpen) {
      const tl = gsap.timeline();

      tl.to(overlayRef.current, {
        clipPath: 'inset(0 0 0 0)',
        duration: 0.6,
        ease: 'power4.inOut',
        pointerEvents: 'all'
      });

      const links = linksRef.current?.children;
      if (links) {
        tl.fromTo(links,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: "power2.out"
          },
          "-=0.2"
        );
      }

    } else {
      gsap.to(overlayRef.current, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.6,
        ease: 'power4.inOut',
        pointerEvents: 'none'
      });
    }
  }, [isOpen]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-background/95 backdrop-blur-xl z-40 flex flex-col justify-center items-center menu-overlay"
      style={{ clipPath: 'inset(0 0 100% 0)' }}
    >
      {/* Close Button Area (invisible hit area or handled by Navbar button z-index) */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-4 text-foreground hover:text-primary transition-colors xl:hidden"
        aria-label="Close Menu"
      >
        <span className="sr-only">Close</span>
        {/* We rely on the Navbar button to toggle, but good to have a close action here if needed */}
      </button>

      <div ref={linksRef} className="flex flex-col gap-4 text-center">
        {NAV_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="menu-link text-3xl md:text-5xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
          >
            {item.name}
          </Link>
        ))}

        <div className="mx-auto my-4 h-px w-20 bg-border" />

        <div className="mx-auto w-full max-w-sm rounded-2xl border border-border/70 bg-background/65 p-3 shadow-sm backdrop-blur">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary/80">
                Your Account
              </p>
              <Link
                href="/my-inquiries"
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-xl border border-border/70 bg-background px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-primary/5"
              >
                My Inquiries
              </Link>
              <Link
                href="/careers/my-applications"
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-xl border border-border/70 bg-background px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-primary/5"
              >
                My Applications
              </Link>
            </div>
          ) : isCheckingAuth ? (
            <p className="py-3 text-center text-base font-medium text-muted-foreground">Loading...</p>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary/80">
                Welcome
              </p>
              <Link
                href="/login"
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-xl border border-border/70 bg-background px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-primary/5"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/signup"
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-base font-semibold text-background shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
              >
                {t("nav.getStarted")}
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-10 left-[5vw] right-[5vw] flex justify-between text-xs font-mono text-secondary uppercase opacity-50">
        <span>&copy; {new Date().getFullYear()} The Festa</span>
        <span>Made with love</span>
      </div>
    </div>
  );
}
