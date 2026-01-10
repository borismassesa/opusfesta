"use client";

import Link from "next/link";
import { Linkedin, Mail } from "lucide-react";

export function CareersFooter() {
  return (
    <footer className="bg-surface border-t border-border pt-12 pb-10 md:pt-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12 md:mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link
              href="/careers"
              className="font-serif text-2xl md:text-3xl text-primary hover:text-primary/80 transition-colors select-none inline-block"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              OpusFesta Careers
            </Link>
            <p className="text-secondary text-sm leading-relaxed max-w-xs">
              Building the future of wedding planning. Join us in creating exceptional experiences for couples around the world.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a 
                href="https://linkedin.com/company/opusfesta" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-secondary hover:text-primary hover:border-primary/30 transition-all duration-300"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="mailto:careers@opusfesta.com" 
                aria-label="Email"
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-secondary hover:text-primary hover:border-primary/30 transition-all duration-300"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Mobile Accordion Links */}
          <div className="md:hidden">
            <div className="flex flex-col gap-6">
              <h4 className="font-semibold text-primary text-sm tracking-wide uppercase">Company</h4>
              <div className="flex flex-col gap-3">
                <FooterLink href="/careers#about">About Us</FooterLink>
                <FooterLink href="/careers/positions">Open Positions</FooterLink>
                <FooterLink href="mailto:careers@opusfesta.com">Contact</FooterLink>
              </div>
            </div>
          </div>

          {/* Desktop Links Column 1 */}
          <div className="hidden md:flex flex-col gap-6">
            <h4 className="font-semibold text-primary text-sm tracking-wide uppercase">Company</h4>
            <div className="flex flex-col gap-3">
              <FooterLink href="/careers#about">About Us</FooterLink>
              <FooterLink href="/careers/positions">Open Positions</FooterLink>
              <FooterLink href="mailto:careers@opusfesta.com">Contact</FooterLink>
            </div>
          </div>

          {/* Desktop Links Column 2 */}
          <div className="hidden md:flex flex-col gap-6">
            <h4 className="font-semibold text-primary text-sm tracking-wide uppercase">Resources</h4>
            <div className="flex flex-col gap-3">
              <FooterLink href="/careers/my-applications">My Applications</FooterLink>
              <FooterLink href="/careers/track">Track Application</FooterLink>
            </div>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col gap-6">
            <h4 className="font-semibold text-primary text-sm tracking-wide uppercase">Get in Touch</h4>
            <p className="text-secondary text-sm leading-relaxed">
              Have questions about our open positions or the application process? We're here to help.
            </p>
            <a 
              href="mailto:careers@opusfesta.com"
              className="text-sm text-primary hover:underline font-medium"
            >
              careers@opusfesta.com
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-secondary/60 text-xs">
            © {new Date().getFullYear()} OpusFesta. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            <FooterLink href="/privacy" className="text-xs">Privacy Policy</FooterLink>
            <FooterLink href="/terms" className="text-xs">Terms of Service</FooterLink>
            <Link href="/" className="text-xs text-secondary hover:text-primary transition-colors">
              Main Website
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");
  
  if (isExternal) {
    return (
      <a
        href={href}
        className={`text-secondary hover:text-primary transition-colors text-sm ${className}`}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={`text-secondary hover:text-primary transition-colors text-sm ${className}`}
    >
      {children}
    </Link>
  );
}
