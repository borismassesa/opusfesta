"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut, Briefcase } from "lucide-react";
import gsap from "gsap";
import { useOpusFestaAuth } from "@opusfesta/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function CareersNavbar({ sticky = true }: { sticky?: boolean }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const { clerkUser, isLoaded, isSignedIn, signOut } = useOpusFestaAuth();
  const isAuthenticated = isLoaded ? isSignedIn : null;
  const isCheckingAuth = !isLoaded;

  const userData = clerkUser
    ? {
        name: clerkUser.fullName,
        email: clerkUser.primaryEmailAddress?.emailAddress || null,
        avatar: clerkUser.imageUrl || null,
      }
    : null;

  const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "Careers", href: "/careers" },
    { name: "Students", href: "/careers/students" },
  ];

  const authenticatedNavLinks =
    isAuthenticated === true ? [{ name: "My Applications", href: "/careers/my-applications" }] : [];

  const allNavLinks = [...NAV_LINKS, ...authenticatedNavLinks];

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/careers") return pathname === "/careers";
    if (href === "/careers/my-applications") return pathname === "/careers/my-applications";
    return pathname === href;
  };

  const getUserInitials = (name: string | null, email: string | null): string => {
    if (name) {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const handleLogout = async () => {
    try {
      await signOut();
      await router.push("/careers");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      const tl = gsap.timeline();
      tl.to(overlayRef.current, {
        clipPath: "inset(0 0 0 0)",
        duration: 0.6,
        ease: "power4.inOut",
        pointerEvents: "all",
      });

      const links = linksRef.current?.children;
      if (links) {
        tl.fromTo(
          links,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: "power2.out",
          },
          "-=0.2",
        );
      }
    } else {
      gsap.to(overlayRef.current, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.6,
        ease: "power4.inOut",
        pointerEvents: "none",
      });
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <nav
        className={`orion-theme ${sticky ? "fixed" : "relative"} top-0 z-50 flex w-full items-center justify-between gap-3 px-4 pb-1 pt-3 transition-all duration-300 sm:px-6 lg:px-8 xl:px-12 ${
          sticky && scrolled
            ? "bg-[color-mix(in_oklab,var(--background)_89%,var(--primary)_11%)] backdrop-blur-xl shadow-[0_16px_38px_-24px_color-mix(in_oklab,var(--primary)_70%,transparent)] ring-1 ring-[color-mix(in_oklab,var(--primary)_16%,transparent)] pb-0.5 pt-2"
            : sticky
              ? "bg-transparent pb-1 pt-3"
              : "bg-background pb-1 pt-3"
        }`}
      >
        <Link
          href="/careers"
          className="z-50 shrink-0 select-none font-serif text-xl text-foreground transition-colors hover:text-primary sm:text-2xl md:text-3xl"
          onClick={() => {
            if (mobileMenuOpen) setMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="hidden sm:inline">OpusFesta Careers</span>
          <span className="sm:hidden">Careers</span>
        </Link>

        <div className="hidden xl:flex flex-1 min-w-0 justify-center px-2">
          <div className="flex max-w-full items-center gap-3 2xl:gap-5 overflow-x-auto whitespace-nowrap rounded-full border border-border/40 bg-background/50 px-4 py-2.5 shadow-sm backdrop-blur-sm 2xl:px-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {allNavLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative shrink-0 px-0.5 py-0.5 text-sm font-medium transition-colors 2xl:text-base ${
                  isActiveLink(link.href) ? "text-foreground" : "text-secondary hover:text-primary"
                }`}
              >
                {link.name}
                <span
                  className={`pointer-events-none absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-primary transition-all duration-300 ${
                    isActiveLink(link.href) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </div>
        </div>

        <div className="z-50 flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 lg:flex xl:gap-3">
            {isAuthenticated === true ? (
              <>
                <Link
                  href="/careers/my-applications"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border/60 bg-background/65 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  <Briefcase className="h-4 w-4" />
                  My Applications
                </Link>
                <Avatar className="h-10 w-10">
                  {userData?.avatar ? <AvatarImage src={userData.avatar} alt={userData.name || "User"} /> : null}
                  <AvatarFallback className="bg-secondary text-background font-semibold">
                    {userData ? getUserInitials(userData.name, userData.email) : "U"}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => {
                    handleLogout().catch(console.error);
                  }}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-destructive/30 bg-background px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </>
            ) : isCheckingAuth && isAuthenticated === null ? (
              <div className="h-8 w-20" />
            ) : (
              <>
                <Link
                  href="/careers/login"
                  className="whitespace-nowrap px-2 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary xl:px-3"
                >
                  Sign in
                </Link>
                <Link
                  href="/careers/signup"
                  className="whitespace-nowrap rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-background shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 xl:px-5"
                >
                  Apply Now
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="cursor-pointer rounded-full p-2 text-secondary transition-colors hover:bg-primary/5 hover:text-primary"
            aria-label="Toggle theme"
            disabled={!mounted}
          >
            {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className={`group relative z-50 flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-500 xl:hidden ${
              mobileMenuOpen
                ? "rotate-90 border-primary bg-primary"
                : "border-border/60 bg-background/50 backdrop-blur-md hover:bg-primary/5"
            }`}
            aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
          >
            <div className="relative flex h-3.5 w-5 flex-col items-end justify-between">
              <span
                className={`absolute right-0 h-[1.5px] rounded-full transition-all duration-500 ${
                  mobileMenuOpen
                    ? "top-1/2 w-5 -translate-y-1/2 rotate-45 bg-background"
                    : "top-0 w-full bg-primary group-hover:w-4/5"
                }`}
              />
              <span
                className={`absolute right-0 top-1/2 h-[1.5px] rounded-full transition-all duration-500 ${
                  mobileMenuOpen
                    ? "w-0 -translate-y-1/2 opacity-0"
                    : "w-4/5 -translate-y-1/2 bg-primary group-hover:w-full"
                }`}
              />
              <span
                className={`absolute right-0 h-[1.5px] rounded-full transition-all duration-500 ${
                  mobileMenuOpen
                    ? "top-1/2 w-5 -translate-y-1/2 -rotate-45 bg-background"
                    : "bottom-0 w-3/5 bg-primary group-hover:w-full"
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      <div
        ref={overlayRef}
        className="orion-theme menu-overlay fixed inset-0 z-40 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl xl:hidden"
        style={{ clipPath: "inset(0 0 100% 0)", pointerEvents: "none" }}
      >
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute right-6 top-6 p-4 text-foreground transition-colors hover:text-primary xl:hidden"
          aria-label="Close Menu"
        >
          <span className="sr-only">Close</span>
        </button>

        <div ref={linksRef} className="flex flex-col gap-4 text-center">
          {allNavLinks.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="menu-link text-3xl font-bold tracking-tight text-foreground transition-colors hover:text-primary md:text-5xl"
            >
              {item.name}
            </Link>
          ))}

          <div className="mx-auto my-4 h-px w-20 bg-border" />

          <div className="mx-auto w-full max-w-sm rounded-2xl border border-border/70 bg-background/65 p-3 shadow-sm backdrop-blur">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary/80">Your Account</p>
                <Link
                  href="/careers/my-applications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border/70 bg-background px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-primary/5"
                >
                  My Applications
                </Link>
                <button
                  onClick={async () => {
                    await handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-destructive/30 bg-background px-4 py-3 text-base font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  Log out
                </button>
              </div>
            ) : isCheckingAuth ? (
              <p className="py-3 text-center text-base font-medium text-muted-foreground">Loading...</p>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary/80">Welcome</p>
                <Link
                  href="/careers/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border/70 bg-background px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-primary/5"
                >
                  Sign in
                </Link>
                <Link
                  href="/careers/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-base font-semibold text-background shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  Apply Now
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-10 left-[5vw] right-[5vw] flex justify-between text-xs font-mono uppercase text-secondary opacity-50">
          <span>&copy; {new Date().getFullYear()} OpusFesta</span>
          <span>Made with love</span>
        </div>
      </div>
    </>
  );
}
