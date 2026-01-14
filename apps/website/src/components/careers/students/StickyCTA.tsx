"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface StickyCTAProps {
  show: boolean;
}

export function StickyCTA({ show }: StickyCTAProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 px-4 w-full max-w-[calc(100%-2rem)] sm:max-w-none">
      <Link
        href="/careers/positions"
        className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-medium hover:bg-primary/90 transition-colors shadow-lg w-full sm:w-auto"
      >
        <span className="sm:hidden">Openings</span>
        <span className="hidden sm:inline">View Open Positions</span>
        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
      </Link>
    </div>
  );
}
