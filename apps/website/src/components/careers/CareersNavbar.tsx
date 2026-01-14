"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut, Briefcase, ChevronRight, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Careers-specific navigation - only careers-related links
  const NAV_LINKS = [
    { name: "Why OpusFesta", href: "/careers/why-opusfesta" },
    { name: "Students", href: "/careers/students" },
    { name: "Open Positions", href: "/careers/positions" },
  ];
  
  // Add "My Applications" to nav if authenticated
  const authenticatedNavLinks = isAuthenticated === true ? [
    { name: "My Applications", href: "/careers/my-applications" },
  ] : [];
  
  const allNavLinks = [...NAV_LINKS, ...authenticatedNavLinks];

  // Function to fetch user data
  const fetchUserData = async (userId: string) => {
    try {
      // First, try to get from database
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, avatar")
        .eq("id", userId)
        .single();

      // Handle RLS errors gracefully (406) - these are expected if session isn't fully established
      const errorStatus = (error as any)?.status;
      const isRLSError = error?.code === "PGRST301" || 
                        error?.code === "PGRST116" ||
                        error?.message?.toLowerCase().includes("row-level security") ||
                        errorStatus === 406;

      if (!error && data) {
        // If database has name, use it
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

      // If database doesn't have name or we got an RLS error, try to get from auth session metadata
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
        // Fallback to database data even if name is null
        setUserData({
          id: data.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
        });
      } else if (error && !isRLSError) {
        // Only log non-RLS errors (406, PGRST301, PGRST116 are expected)
        // Also suppress 403 errors (user deleted) - these are handled by verifyUserExistsInAuth
        if (errorStatus !== 403 && error.code !== "PGRST116") {
          console.error("Error fetching user data:", error);
        }
      }
    } catch (error) {
      // Suppress expected errors (403 = user deleted, handled elsewhere)
      const errorStatus = error && typeof error === 'object' && 'status' in error ? (error as any).status : null;
      if (errorStatus !== 403) {
        console.error("Error fetching user data:", error);
      }
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
    // Close mobile menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('nav') && !target.closest('button[aria-label="Toggle menu"]')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen(false);
  }, [pathname]);

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
      let timeoutId: NodeJS.Timeout | null = null;
      
      try {
        // Add timeout to prevent hanging - show buttons if check takes too long
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn("Auth check timeout - defaulting to not authenticated");
            setIsAuthenticated(false);
            setUserData(null);
            setIsCheckingAuth(false);
          }
        }, 3000); // 3 second timeout
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
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
        // Clear timeout if it hasn't fired yet
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
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

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          if (session?.user) {
            // CRITICAL: Verify user still exists in Supabase Auth
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
              // User was deleted - sign out
              console.warn("User deleted from Auth during state change, signing out");
              await supabase.auth.signOut();
              if (mounted) {
                setIsAuthenticated(false);
                setUserData(null);
                setIsCheckingAuth(false);
              }
              return;
            }

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
    <>
      <nav 
        className={`${sticky ? 'fixed' : 'relative'} top-0 w-full z-50 px-6 md:px-12 pb-1 pt-3 flex justify-between items-center transition-all duration-300 ${
          sticky && scrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50 pb-0.5 pt-2" : sticky ? "bg-transparent pb-1 pt-3" : "bg-background pb-1 pt-3"
        }`}
      >
        {/* Logo */}
        <Link
          href="/careers"
          className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl text-primary hover:text-primary/80 transition-colors select-none z-50"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span className="hidden sm:inline">OpusFesta Careers</span>
          <span className="sm:hidden">Careers</span>
        </Link>

        {/* Desktop Navigation */}
        {allNavLinks.length > 0 && (
          <div className="hidden lg:flex items-center gap-8 bg-background/50 px-8 py-2.5 rounded-full border border-border/40 backdrop-blur-sm shadow-sm">
            {allNavLinks.map((link) => {
              const isActive = pathname === link.href || 
                (link.href === "/careers/positions" && pathname?.startsWith("/careers/positions")) ||
                (link.href === "/careers/my-applications" && pathname === "/careers/my-applications") ||
                (link.href === "/careers/why-opusfesta" && pathname === "/careers/why-opusfesta") ||
                (link.href === "/careers/students" && pathname === "/careers/students");
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-secondary"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-4 z-50">
          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated === true ? (
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
            ) : isCheckingAuth && isAuthenticated === null ? (
              <div className="w-20 h-8" />
            ) : (
              <>
                <Link
                  href="/careers/login"
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

          {/* Theme Toggle and Mobile Menu - Right end */}
          <button
            onClick={() => {
              if (!mounted) return;
              const currentTheme = theme || "system";
              if (currentTheme === "dark") {
                setTheme("light");
              } else if (currentTheme === "light") {
                setTheme("dark");
              } else {
                // If system, toggle to dark
                setTheme("dark");
              }
            }}
            className="text-secondary hover:text-primary transition-colors cursor-pointer p-2 rounded-full hover:bg-primary/5"
            aria-label="Toggle theme"
            disabled={!mounted}
          >
            {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Mobile Menu Button - Right end */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-secondary hover:text-primary transition-colors p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[72px] bg-background/95 backdrop-blur-md z-40 border-t border-border">
          <div className="flex flex-col h-full overflow-y-auto">
            <nav className="flex flex-col p-6 gap-2">
              {allNavLinks.map((link) => {
                const isActive = pathname === link.href || 
                  (link.href === "/careers/positions" && pathname?.startsWith("/careers/positions")) ||
                  (link.href === "/careers/my-applications" && pathname === "/careers/my-applications") ||
                  (link.href === "/careers/why-opusfesta" && pathname === "/careers/why-opusfesta") ||
                  (link.href === "/careers/how-we-hire" && pathname === "/careers/how-we-hire") ||
                  (link.href === "/careers/benefits" && pathname === "/careers/benefits");
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-secondary hover:bg-surface hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            
            {/* Mobile Auth Section */}
            <div className="mt-auto p-6 border-t border-border">
              {isAuthenticated === true ? (
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    {userData?.avatar ? (
                      <AvatarImage src={userData.avatar} alt={userData.name || "User"} />
                    ) : null}
                    <AvatarFallback className="bg-secondary text-background font-semibold">
                      {userData ? getUserInitials(userData.name, userData.email) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary truncate">
                      {userData?.name || "User"}
                    </p>
                    {userData?.email && (
                      <p className="text-xs text-secondary truncate">
                        {userData.email}
                      </p>
                    )}
                  </div>
                </div>
              ) : isCheckingAuth && isAuthenticated === null ? (
                <div className="h-10" />
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/careers/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2.5 rounded-lg border border-border"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/careers/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center text-sm font-semibold bg-primary text-background px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Apply Now
                  </Link>
                </div>
              )}
              
              {isAuthenticated === true && (
                <>
                  <Link
                    href="/careers/my-applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2.5 rounded-lg border border-border mb-3"
                  >
                    My Applications
                  </Link>
                  <button
                    onClick={async () => {
                      await handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center text-sm font-medium text-destructive hover:text-destructive/80 transition-colors px-4 py-2.5 rounded-lg border border-destructive/20"
                  >
                    Log out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
