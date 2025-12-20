"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Simple Flag Components
const FlagUK = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
    <clipPath id="t">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
    </clipPath>
    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
  </svg>
);

const FlagTZ = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="tz-clip">
        <rect width="60" height="40"/>
      </clipPath>
    </defs>
    <g clipPath="url(#tz-clip)">
      <rect width="60" height="40" fill="#1eb53a"/>
      <path d="M0,40 L60,40 L60,0 Z" fill="#00a3dd"/>
      <path d="M-10,50 L70,-10" stroke="#fcd116" strokeWidth="14"/>
      <path d="M-10,50 L70,-10" stroke="#000" strokeWidth="9"/>
    </g>
  </svg>
);

export function Navbar({ onMenuClick, isOpen }: { onMenuClick: () => void; isOpen?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const NAV_LINKS = [
    { name: t('nav.planning'), href: "/planning" },
    { name: t('nav.vendors'), href: "/vendors" },
    { name: t('nav.guests'), href: "/guests" },
    { name: t('nav.websites'), href: "/websites" },
    { name: t('nav.inspiration'), href: "/inspiration" },
    { name: t('nav.shop'), href: "/shop" },
  ];

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const CurrentFlag = i18n.language.startsWith('sw') ? FlagTZ : FlagUK;

  return (
    <nav 
      className={`fixed top-0 w-full z-50 px-6 md:px-12 py-3 flex justify-between items-center transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-2" : "bg-transparent py-4"
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
        TheFesta
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
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-secondary hover:text-primary transition-colors cursor-pointer p-2 rounded-full hover:bg-primary/5 order-1"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="hidden md:flex items-center gap-3 order-3">
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
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="text-secondary hover:text-primary transition-colors cursor-pointer p-2 rounded-full hover:bg-primary/5 flex items-center gap-2 order-2"
              aria-label="Change Language"
            >
              <CurrentFlag className="h-5 w-auto rounded-sm shadow-sm" />
              <span className="text-xs font-medium uppercase hidden sm:inline-block">{i18n.language.split('-')[0]}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[150px]">
            <DropdownMenuItem onClick={() => toggleLanguage('en')} className="gap-2 cursor-pointer">
              <FlagUK className="h-4 w-auto rounded-sm" />
              <span>English</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleLanguage('sw')} className="gap-2 cursor-pointer">
              <FlagTZ className="h-4 w-auto rounded-sm" />
              <span>Swahili</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className={`lg:hidden group relative z-50 w-11 h-11 flex items-center justify-center rounded-full border transition-all duration-500 order-4 ${
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
