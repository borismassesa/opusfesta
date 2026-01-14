"use client";

import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    id: 1,
    title: "Apply",
    description: "Browse our open positions and submit your application. Include your resume, portfolio (if applicable), and a brief note about why you're interested."
  },
  {
    id: 2,
    title: "Initial Review",
    description: "Our team reviews your application. We typically respond within 1-2 weeks. If there's a good fit, we'll schedule an initial conversation."
  },
  {
    id: 3,
    title: "Interview",
    description: "You'll have a friendly conversation with team members. We want to learn about you, your goals, and how we can help you grow. No technical grilling—just a genuine conversation."
  },
  {
    id: 4,
    title: "Decision",
    description: "We'll let you know our decision within a week. If selected, we'll work together to find a start date and schedule that works for both of us."
  }
];

export function Timeline() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-surface/20 dark:bg-surface/10">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 md:mb-24"
        >
          <h2 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest mb-2 sm:mb-3 font-mono">The Journey</h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-primary tracking-tight">
            <span className="font-sans font-medium tracking-tighter">How to</span>{' '}
            <span className="font-playfair italic font-medium">apply</span>
          </h3>
        </motion.div>

        <div className="relative">
          {/* Central Vertical Line (Desktop) / Left Line (Mobile) */}
          <div className="absolute left-[31px] sm:left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-border dark:bg-border/60 md:transform md:-translate-x-1/2" />

          <div className="space-y-12 sm:space-y-16">
            {steps.map((step, i) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex flex-col md:flex-row items-start md:items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                
                {/* Text Content Side */}
                <div className={`pl-20 sm:pl-24 md:pl-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                  <h4 className="text-lg sm:text-xl font-semibold text-primary mb-2">{step.title}</h4>
                  <p className="text-secondary leading-relaxed text-xs sm:text-sm md:text-base font-light">{step.description}</p>
                </div>

                {/* Number Node */}
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center">
                  <motion.div 
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center z-10 shadow-sm relative border-2 border-background dark:border-surface"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-base sm:text-lg font-bold">{step.id}</span>
                  </motion.div>
                </div>

                {/* Empty Side (for layout balance on Desktop) */}
                <div className="hidden md:block md:w-1/2" />
                
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
