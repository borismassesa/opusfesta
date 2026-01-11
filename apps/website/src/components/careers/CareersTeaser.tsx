"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CareersTeaserProps {
  title: string;
  description: string;
  href: string;
  linkText: string;
  className?: string;
}

export function CareersTeaser({ title, description, href, linkText, className = "" }: CareersTeaserProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`group ${className}`}
    >
      <Link href={href} className="block">
        <div className="p-8 md:p-12 rounded-2xl border border-border hover:border-primary/50 bg-surface/30 hover:bg-surface/50 transition-all duration-300">
          <h3 className="text-2xl md:text-3xl font-semibold text-primary tracking-tight mb-4 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-secondary leading-relaxed text-base md:text-lg font-light mb-6">
            {description}
          </p>
          <div className="flex items-center text-primary font-medium group-hover:gap-3 transition-all">
            <span>{linkText}</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
