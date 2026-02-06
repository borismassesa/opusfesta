"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, User, LogOut, Bell, Heart, ShoppingCart, FileText, Briefcase, Settings, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
}

export function Navbar({ onMenuClick, isOpen, sticky = true }: { onMenuClick: () => void; isOpen?: boolean; sticky?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, isLoading: isCheckingAuth, isAuthenticated, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Convert auth context user to UserData format
  const userData: UserData | null = user ? {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  } : null;

  const NAV_LINKS = [
    { name: t('nav.planning'), href: "/planning" },
    { name: t('nav.vendors'), href: "/vendors" },
    { name: t('nav.guests'), href: "/guests" },
    { name: t('nav.websites'), href: "/websites" },
    { name: t('nav.inspiration'), href: "/advice-and-ideas" },
    { name: t('nav.shop'), href: "/shop" },
    { name: "Careers", href: "/careers" },
  ];


  // Function to get user initials (first name + last name)
  const getUserInitials = (name: string | null, email: string | null): string => {
    if (name) {
      // Remove extra whitespace and split by spaces
      const trimmedName = name.trim();
      if (!trimmedName) {
        // Name is empty or only whitespace, fall through to email
        if (email) {
          return email.substring(0, 2).toUpperCase();
        }
        return "U";
      }

      const parts = trimmedName.split(/\s+/).filter(part => part.length > 0);
      
      if (parts.length >= 2) {
        // Has first name and last name (or more) - use first letter of first and last
        const firstInitial = parts[0][0] || '';
        const lastInitial = parts[parts.length - 1][0] || '';
        return (firstInitial + lastInitial).toUpperCase();
      } else if (parts.length === 1) {
        // Only one name part - use first two characters
        const singleName = parts[0];
        if (singleName.length >= 2) {
          return singleName.substring(0, 2).toUpperCase();
        }
        // Single character name - duplicate it
        return (singleName[0] + singleName[0]).toUpperCase();
      }
    }
    
    // Fallback to email if no name
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    
    // Final fallback
    return "U";
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
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

  // AuthContext handles all auth state management
  // No need for manual auth checking here

  return (
    <nav 
      className={`${sticky ? 'fixed' : 'relative'} top-0 w-full z-50 px-6 md:px-12 pb-1 pt-3 flex justify-between items-center transition-all duration-300 ${
        sticky && scrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50 pb-0.5 pt-2" : sticky ? "bg-transparent pb-1 pt-3" : "bg-background pb-1 pt-3"
      }`}
    >
      {/* Logo */}
      <Link
        href="/"
        className="font-serif text-2xl md:text-3xl text-primary hover:text-primary/80 transition-colors select-none z-50"
        onClick={() => {
          if (isOpen) onMenuClick();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        OpusFesta
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-8 bg-background/50 px-8 py-2.5 rounded-full border border-border/40 backdrop-blur-sm shadow-sm">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === link.href ? "text-primary" : "text-secondary"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 z-50">
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated === true ? (
            <>
              {/* Action Icons */}
              <button
                className="relative text-secondary hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/5"
                aria-label="Favorites"
              >
                <Heart size={20} />
              </button>
              <button
                className="relative text-secondary hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/5"
                aria-label="Shopping Cart"
              >
                <ShoppingCart size={20} />
              </button>
              <button
                className="relative text-secondary hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/5"
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-purple-500 rounded-full border-2 border-background"></span>
              </button>

              {/* User Avatar with Dropdown */}
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
                    <span className="absolute top-0 right-0 h-3 w-3 bg-purple-500 rounded-full border-2 border-background"></span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-3 bg-popover border border-border/60 shadow-lg dark:shadow-2xl">
                  {/* User Profile Section */}
                  <div className="px-4 py-4 mb-3 rounded-xl bg-surface dark:bg-surface/50 border border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 shadow-md ring-2 ring-background dark:ring-background">
                        {userData?.avatar ? (
                          <AvatarImage src={userData.avatar} alt={userData.name || "User"} className="object-cover" />
                        ) : null}
                        <AvatarFallback className="bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground font-semibold text-lg shadow-inner">
                          {userData ? getUserInitials(userData.name, userData.email) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary dark:text-primary truncate leading-tight">
                          {userData?.name || "User"}
                        </p>
                        {userData?.email && (
                          <p className="text-xs text-secondary dark:text-secondary truncate mt-1.5 leading-tight">
                            {userData.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="my-2" />

                  {/* Menu Items */}
                  <div className="space-y-1">
                    <DropdownMenuItem asChild className="p-0! focus:bg-transparent data-highlighted:bg-transparent">
                      <Link 
                        href="/my-inquiries" 
                        className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-black! dark:hover:bg-white! hover:text-white! dark:hover:text-black! border border-transparent hover:border-border/60 transition-all duration-200 group w-full"
                      >
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted/50 dark:bg-muted/30 group-hover:bg-black/10! dark:group-hover:bg-white/10! transition-colors">
                          <FileText className="h-4 w-4 text-primary group-hover:text-white! dark:group-hover:text-black! transition-colors" />
                        </div>
                        <span className="flex-1 font-medium text-foreground group-hover:text-white! dark:group-hover:text-black! transition-colors">My Inquiries</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-white! dark:group-hover:text-black! transition-colors" />
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild className="p-0! focus:bg-transparent data-highlighted:bg-transparent">
                      <Link 
                        href="/careers/my-applications" 
                        className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-black! dark:hover:bg-white! hover:text-white! dark:hover:text-black! border border-transparent hover:border-border/60 transition-all duration-200 group w-full"
                      >
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted/50 dark:bg-muted/30 group-hover:bg-black/10! dark:group-hover:bg-white/10! transition-colors">
                          <Briefcase className="h-4 w-4 text-primary group-hover:text-white! dark:group-hover:text-black! transition-colors" />
                        </div>
                        <span className="flex-1 font-medium text-foreground group-hover:text-white! dark:group-hover:text-black! transition-colors">My Applications</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-white! dark:group-hover:text-black! transition-colors" />
                      </Link>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="my-2 bg-border/40" />

                  {/* Logout */}
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e.preventDefault();
                      handleLogout().catch(console.error);
                    }}
                    className="p-0! focus:bg-transparent data-highlighted:bg-transparent"
                  >
                    <div className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-black! dark:hover:bg-white! hover:text-white! dark:hover:text-black! border border-transparent hover:border-border/60 transition-all duration-200 group w-full">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive/5 dark:bg-destructive/10 group-hover:bg-black/10! dark:group-hover:bg-white/10! transition-colors">
                        <LogOut className="h-4 w-4 text-destructive group-hover:text-white! dark:group-hover:text-black! transition-colors" />
                      </div>
                      <span className="flex-1 font-medium text-destructive group-hover:text-white! dark:group-hover:text-black! transition-colors">Log out</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : isCheckingAuth && isAuthenticated === null ? (
            // Show placeholder while checking auth (only for first 3 seconds)
            <div className="w-20 h-8" />
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold bg-primary text-background px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
              >
                {t("nav.getStarted")}
              </Link>
            </>
          )}
        </div>

        {/* Theme Toggle and Mobile Menu - Right end */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-secondary hover:text-primary transition-colors cursor-pointer p-2 rounded-full hover:bg-primary/5"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Mobile Menu Button - Right end */}
        <button 
          onClick={onMenuClick}
          className={`lg:hidden group relative z-50 w-11 h-11 flex items-center justify-center rounded-full border transition-all duration-500 ${
            isOpen 
              ? "bg-primary border-primary rotate-90" 
              : "bg-background/50 backdrop-blur-md border-border/60 hover:bg-primary/5"
          }`}
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          <div className="relative w-5 h-3.5 flex flex-col justify-between items-end">
             {/* Line 1 */}
             <span 
               className={`h-[1.5px] rounded-full transition-all duration-500 absolute right-0 ${
                 isOpen 
                   ? "top-1/2 -translate-y-1/2 rotate-45 bg-background w-5" 
                   : "top-0 bg-primary w-full group-hover:w-4/5"
               }`}
             />
             
             {/* Line 2 */}
             <span 
               className={`h-[1.5px] rounded-full transition-all duration-500 absolute right-0 ${
                 isOpen 
                   ? "top-1/2 -translate-y-1/2 -rotate-45 bg-background w-5" 
                   : "bottom-0 bg-primary w-2/3 group-hover:w-full"
               }`}
             />
          </div>
        </button>
      </div>
    </nav>
  );
}
