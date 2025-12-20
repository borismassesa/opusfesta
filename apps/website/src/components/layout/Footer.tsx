"use client";

import Link from "next/link";
import { Twitter, Instagram, Linkedin } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Custom Icon Components for those missing in Lucide (or specific versions)
const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const TiktokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border pt-12 pb-10 md:pt-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12 md:mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link
              href="/"
              className="font-serif text-2xl md:text-3xl text-primary hover:text-primary/80 transition-colors select-none inline-block"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              TheFesta
            </Link>
            <p className="text-secondary text-sm leading-relaxed max-w-xs">
              The all-in-one platform for modern couples to plan, design, and celebrate their dream weddings effortlessly.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <SocialLink href="#" icon={<XIcon size={16} />} label="X (Twitter)" />
              <SocialLink href="#" icon={<Instagram size={18} />} label="Instagram" />
              <SocialLink href="#" icon={<Linkedin size={18} />} label="LinkedIn" />
              <SocialLink href="#" icon={<TiktokIcon size={18} />} label="TikTok" />
            </div>
          </div>

          {/* Mobile Accordion Links */}
          <div className="md:hidden">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="platform" className="border-border/50">
                <AccordionTrigger className="text-primary font-semibold text-sm uppercase tracking-wide">Platform</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-3 pt-2">
                    <FooterLink href="/venues">Venue Marketplace</FooterLink>
                    <FooterLink href="/vendors">Find Vendors</FooterLink>
                    <FooterLink href="/planning">Planning Tools</FooterLink>
                    <FooterLink href="/websites">Wedding Websites</FooterLink>
                    <FooterLink href="/invitations">Digital Invites</FooterLink>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="company" className="border-border/50">
                <AccordionTrigger className="text-primary font-semibold text-sm uppercase tracking-wide">Company</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-3 pt-2">
                    <FooterLink href="/about">About Us</FooterLink>
                    <FooterLink href="/careers">Careers</FooterLink>
                    <FooterLink href="/blog">Magazine</FooterLink>
                    <FooterLink href="/press">Press</FooterLink>
                    <FooterLink href="/contact">Contact Support</FooterLink>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Desktop Links Column 1 */}
          <div className="hidden md:flex flex-col gap-6">
            <h4 className="font-semibold text-primary text-sm tracking-wide uppercase">Platform</h4>
            <div className="flex flex-col gap-3">
              <FooterLink href="/venues">Venue Marketplace</FooterLink>
              <FooterLink href="/vendors">Find Vendors</FooterLink>
              <FooterLink href="/planning">Planning Tools</FooterLink>
              <FooterLink href="/websites">Wedding Websites</FooterLink>
              <FooterLink href="/invitations">Digital Invites</FooterLink>
            </div>
          </div>

          {/* Desktop Links Column 2 */}
          <div className="hidden md:flex flex-col gap-6">
            <h4 className="font-semibold text-primary text-sm tracking-wide uppercase">Company</h4>
            <div className="flex flex-col gap-3">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
              <FooterLink href="/blog">Magazine</FooterLink>
              <FooterLink href="/press">Press</FooterLink>
              <FooterLink href="/contact">Contact Support</FooterLink>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="flex flex-col gap-6">
            <h4 className="font-semibold text-primary text-sm tracking-wide uppercase">Stay Updated</h4>
            <p className="text-secondary text-sm leading-relaxed">
              Subscribe to our newsletter for the latest wedding trends and planning tips.
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-secondary/50"
              />
              <button className="w-full px-4 py-3 rounded-lg bg-primary text-background text-sm font-medium hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-secondary/60 text-xs">
            © {new Date().getFullYear()} The Festa. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            <FooterLink href="/privacy" className="text-xs">Privacy Policy</FooterLink>
            <FooterLink href="/terms" className="text-xs">Terms of Service</FooterLink>
            <FooterLink href="/cookies" className="text-xs">Cookie Settings</FooterLink>
            <FooterLink href="/admin" className="text-xs text-primary/40 hover:text-primary">Admin</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a 
      href={href} 
      aria-label={label}
      className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-secondary hover:text-primary hover:border-primary/30 transition-all duration-300"
    >
      {icon}
    </a>
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
  return (
    <Link
      href={href}
      className={`text-secondary hover:text-primary transition-colors text-sm ${className}`}
    >
      {children}
    </Link>
  );
}
