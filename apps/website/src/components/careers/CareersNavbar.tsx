"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, User, LogOut, Briefcase, FileText, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { ensureUserRecord } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
}

export function CareersNavbar({ sticky = true }: { sticky?: boolean }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const pathname = usePathname();

  const NAV_LINKS = [
    { name: "Open Positions", href: "/careers/positions" },
    { name: "My Applications", href: "/careers/my-applications" },
    { name: "About Us", href: "/careers#about" },
  ];

  // Function to fetch user data
  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, avatar")
        .eq("id", userId)
        .single();

      const isRLSError = error?.code === "PGRST301" || 
                        error?.message?.toLowerCase().includes("row-level security") ||
                        error?.status === 406;

      if (!error && data) {
        if (data.name) {
          setUserData({
            id: data.id,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
          });
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const metadata = session.user.user_metadata;
        const fullName = 
          metadata?.full_name || 
          metadata?.name || 
          metadata?.display_name ||
          (metadata?.first_name && metadata?.last_name 
            ? `${metadata.first_name} ${metadata.last_name}`
            : null);

        const avatar = 
          metadata?.avatar_url || 
          metadata?.picture || 
          metadata?.photo_url ||
          null;

        setUserData({
          id: userId,
          name: fullName || data?.name || null,
          email: data?.email || session.user.email || null,
          avatar: data?.avatar || avatar,
        });
      } else if (data) {
        setUserData({
          id: data.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const getUserInitials = (name: string | null, email: string | null): string => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserData(null);
    router.push("/careers");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          if (mounted) {
            setIsAuthenticated(false);
            setIsCheckingAuth(false);
          }
          return;
        }

        if (session?.user) {
          if (mounted) {
            setIsAuthenticated(true);
            await fetchUserData(session.user.id);
            setIsCheckingAuth(false);
          }
        } else {
          if (mounted) {
            setIsAuthenticated(false);
            setIsCheckingAuth(false);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_OUT" || !session) {
          setIsAuthenticated(false);
          setUserData(null);
          setIsCheckingAuth(false);
          return;
        }

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session?.user) {
            setIsAuthenticated(true);
            await fetchUserData(session.user.id);
            setIsCheckingAuth(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav 
      className={`${sticky ? 'fixed' : 'relative'} top-0 w-full z-50 px-6 md:px-12 pb-1 pt-3 flex justify-between items-center transition-all duration-300 ${
        sticky && scrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50 pb-0.5 pt-2" : sticky ? "bg-transparent pb-1 pt-3" : "bg-background pb-1 pt-3"
      }`}
    >
      {/* Logo */}
      <Link
        href="/careers"
        className="font-serif text-2xl md:text-3xl text-primary hover:text-primary/80 transition-colors select-none z-50"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        OpusFesta Careers
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-8 bg-background/50 px-8 py-2.5 rounded-full border border-border/40 backdrop-blur-sm shadow-sm">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === link.href || (link.href === "/careers#about" && pathname === "/careers") ? "text-primary" : "text-secondary"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 z-50">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-secondary hover:text-primary transition-colors cursor-pointer p-2 rounded-full hover:bg-primary/5"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="hidden md:flex items-center gap-4">
          {isCheckingAuth || isAuthenticated === null ? (
            <div className="w-20 h-8" />
          ) : isAuthenticated === true ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative focus:outline-none focus:ring-0 rounded-full">
                  <Avatar className="h-10 w-10">
                    {userData?.avatar ? (
                      <AvatarImage src={userData.avatar} alt={userData.name || "User"} />
                    ) : null}
                    <AvatarFallback className="bg-secondary text-background font-semibold">
                      {userData ? getUserInitials(userData.name, userData.email) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-3 bg-popover border border-border/60 shadow-lg">
                <div className="px-4 py-4 mb-3 rounded-xl bg-surface border border-border/40 shadow-sm">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 shadow-md ring-2 ring-background">
                      {userData?.avatar ? (
                        <AvatarImage src={userData.avatar} alt={userData.name || "User"} />
                      ) : null}
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                        {userData ? getUserInitials(userData.name, userData.email) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">
                        {userData?.name || "User"}
                      </p>
                      {userData?.email && (
                        <p className="text-xs text-secondary truncate mt-1.5">
                          {userData.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator className="my-2" />

                <div className="space-y-1">
                  <DropdownMenuItem asChild className="!p-0 !focus:bg-transparent">
                    <Link 
                      href="/careers/my-applications" 
                      className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all w-full"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted/50">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <span className="flex-1 font-medium">My Applications</span>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="!p-0 !focus:bg-transparent"
                >
                  <div className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-all w-full">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive/10">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <span className="flex-1 font-medium">Log out</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login?next=/careers"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/careers/signup"
                className="text-sm font-semibold bg-primary text-background px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
              >
                Apply Now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
