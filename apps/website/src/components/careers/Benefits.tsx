"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useCareersContent } from "@/context/CareersContentContext";

// Icon mapping function based on benefit title
const getIconForBenefit = (title: string) => {
  const titleLower = title.toLowerCase();
  
  // Fertility - check FIRST before general health (sprout/leaf icon)
  if (titleLower.includes('fertility')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8 2 5 5 5 9c0 4 3 7 7 7s7-3 7-7c0-4-3-7-7-7z"></path>
        <path d="M12 6v6M9 9h6"></path>
        <path d="M12 16v4M10 18h4"></path>
      </svg>
    );
  }
  
  // Mental health, therapy, wellbeing - check BEFORE general health (head/profile icon)
  if (titleLower.includes('mental') || titleLower.includes('therapy') || titleLower.includes('wellbeing')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"></circle>
        <path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6"></path>
      </svg>
    );
  }
  
  // Medical, dental, vision - medical cross icon (plus in circle)
  if (titleLower.includes('medical') || titleLower.includes('dental') || titleLower.includes('vision')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    );
  }
  
  // Time off, vacation, holidays
  if (titleLower.includes('time off') || titleLower.includes('vacation') || titleLower.includes('holiday')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    );
  }
  
  // Parental leave, family, parent
  if (titleLower.includes('parental') || titleLower.includes('family') || titleLower.includes('parent')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    );
  }
  
  // General health, wellness (catch-all for other health-related)
  if (titleLower.includes('health') || titleLower.includes('wellness')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    );
  }
  
  // Retirement, savings, matching
  if (titleLower.includes('retirement') || titleLower.includes('savings') || titleLower.includes('matching')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"></line>
        <line x1="18" y1="20" x2="18" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="16"></line>
      </svg>
    );
  }
  
  // Remote, work from home
  if (titleLower.includes('remote') || titleLower.includes('work from')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    );
  }
  
  // Office, workspace, stipend
  if (titleLower.includes('office') || titleLower.includes('workspace') || titleLower.includes('stipend')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    );
  }
  
  // Learning, education, courses, conferences
  if (titleLower.includes('learning') || titleLower.includes('education') || titleLower.includes('course') || titleLower.includes('conference')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>
    );
  }
  
  // Retreat, travel, team building
  if (titleLower.includes('retreat') || titleLower.includes('travel') || titleLower.includes('team')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.2 4 6 3.2-2 2-4-1.5L1 16c7.4 4.2 16.7-1.2 16.8-1.2z"></path>
      </svg>
    );
  }
  
  // Equity, stock, ownership
  if (titleLower.includes('equity') || titleLower.includes('stock') || titleLower.includes('ownership')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"></line>
        <line x1="18" y1="20" x2="18" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="16"></line>
      </svg>
    );
  }
  
  // Default icon
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );
};

const Benefits: React.FC = () => {
  const { content } = useCareersContent();
  const { perks } = content;

  // Map perks to benefits format, or use default benefits
  const benefits = perks.items.length > 0 ? perks.items.slice(0, 6).map((perk) => ({
    label: perk.title,
    text: perk.description,
    icon: getIconForBenefit(perk.title)
  })) : [
    { 
      label: "Remote-first", 
      text: "Work from anywhere in the Americas or Europe.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      )
    },
    { 
      label: "Competitive equity", 
      text: "We want you to be a true owner.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="20" x2="12" y2="10"></line>
          <line x1="18" y1="20" x2="18" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="16"></line>
        </svg>
      )
    },
    { 
      label: "Health & Wellness", 
      text: "100% coverage for you and your dependents.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      )
    },
    { 
      label: "Home office stipend", 
      text: "$2,000 to set up your ideal workspace.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      )
    },
    { 
      label: "Annual retreats", 
      text: "We fly the whole team out twice a year.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.2 4 6 3.2-2 2-4-1.5L1 16c7.4 4.2 16.7-1.2 16.8-1.2z"></path>
        </svg>
      )
    },
    { 
      label: "Continuous learning", 
      text: "Budget for books, courses, and conferences.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      )
    },
  ];

  return (
    <div className="py-24 md:py-32 bg-surface/50 border-y border-border">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
            <span className="w-12 h-px bg-accent"></span>
            <span className="font-mono text-accent text-xs tracking-widest uppercase">
              Benefits
            </span>
            <span className="md:hidden w-12 h-px bg-accent"></span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary tracking-tight">
            The upside
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
           {benefits.map((b,i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: i * 0.1 }}
               className="flex items-start gap-6"
             >
               <div className="p-3 bg-background rounded-xl shadow-sm border border-border text-primary shrink-0">
                 {b.icon}
               </div>
               <div>
                 <h4 className="text-xl font-medium text-primary mb-2">{b.label}</h4>
                 <p className="text-secondary text-base leading-relaxed font-light">{b.text}</p>
               </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Benefits;
