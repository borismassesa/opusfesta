"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";

export function MenuOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const NAV_LINKS = [
    { name: t('nav.planning'), href: "/planning" },
    { name: t('nav.vendors'), href: "/vendors" },
    { name: t('nav.guests'), href: "/guests" },
    { name: t('nav.websites'), href: "/websites" },
    { name: t('nav.inspiration'), href: "/advice-and-ideas" },
    { name: t('nav.shop'), href: "/shop" },
    { name: "Careers", href: "/careers" },
  ];

  // Check authentication state
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (!session) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          return;
        }

        // CRITICAL: First verify user still exists in Supabase Auth
        const userExistsInAuth = await supabase.auth.getUser()
          .then(({ data, error }) => {
            if (error || !data.user || data.user.id !== session.user.id) {
              return false;
            }
            return true;
          })
          .catch(() => false);

        if (!mounted) return;

        if (!userExistsInAuth) {
          // User was deleted - clear session
          await supabase.auth.signOut();
          if (mounted) {
            setIsAuthenticated(false);
            setIsCheckingAuth(false);
          }
          return;
        }

        // Verify user exists in database
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (mounted) {
          setIsAuthenticated(!userError && !!userData);
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error("Error checking auth in MenuOverlay:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
      }
    }

    checkAuth();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (!session) {
        setIsAuthenticated(false);
        return;
      }

      // CRITICAL: First verify user still exists in Supabase Auth
      const userExistsInAuth = await supabase.auth.getUser()
        .then(({ data, error }) => {
          // 403 Forbidden means user was deleted - this is expected
          if (error) {
            // Suppress 403 errors (user deleted) - these are expected
            if (error.status !== 403 && error.message !== "Invalid Refresh Token: Refresh Token Not Found") {
              // Only log unexpected errors
              console.warn("Error checking user in Auth:", error);
            }
            return false;
          }
          if (!data.user || data.user.id !== session.user.id) {
            return false;
          }
          return true;
        })
        .catch((err) => {
          // Suppress 403 errors (user deleted) - these are expected
          if (err?.status !== 403 && err?.message !== "Invalid Refresh Token: Refresh Token Not Found") {
            console.warn("Error checking user in Auth:", err);
          }
          return false;
        });

      if (!mounted) return;

      if (!userExistsInAuth) {
        // User was deleted - clear session
        await supabase.auth.signOut();
        if (mounted) {
          setIsAuthenticated(false);
        }
        return;
      }

      // Verify user exists in database
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (mounted) {
          setIsAuthenticated(!userError && !!userData);
        }
      } catch (error) {
        console.error("Error verifying user in MenuOverlay:", error);
        if (mounted) {
          setIsAuthenticated(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
        className="absolute top-6 right-6 p-4 text-primary hover:opacity-70 transition-opacity lg:hidden"
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
            className="menu-link text-3xl md:text-5xl font-bold tracking-tight text-secondary hover:text-primary transition-colors"
          >
            {item.name}
          </Link>
        ))}
        
        <div className="h-px w-20 bg-border mx-auto my-4"></div>

        <div className="flex flex-col gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/my-inquiries"
                onClick={onClose}
                className="text-lg font-medium text-primary"
              >
                My Inquiries
              </Link>
              <Link
                href="/careers/my-applications"
                onClick={onClose}
                className="text-lg font-medium text-primary"
              >
                My Applications
              </Link>
            </>
          ) : isCheckingAuth ? (
            <div className="text-lg font-medium text-muted-foreground">
              Loading...
            </div>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="text-lg font-medium text-primary"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/signup"
                onClick={onClose}
                className="text-lg font-medium bg-primary text-background px-6 py-2 rounded-full hover:bg-primary/90 transition-colors"
              >
                {t("nav.getStarted")}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-10 left-[5vw] right-[5vw] flex justify-between text-xs font-mono text-secondary uppercase opacity-50">
        <span>© {new Date().getFullYear()} The Festa</span>
        <span>Made with love</span>
      </div>
    </div>
  );
}
