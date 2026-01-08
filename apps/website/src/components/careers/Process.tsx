"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useCareersContent } from "@/context/CareersContentContext";

const Process: React.FC = () => {
  const { content } = useCareersContent();
  const { process } = content;

  // Use process from CMS or default
  const steps = process.steps.length > 0 ? process.steps : [
    { id: 1, title: "Application", description: "Submit your application through our portal. Tell us about your experience building products that matter to real people." },
    { id: 2, title: "Initial Review", description: "Our team reviews your application and portfolio. We're looking for people who understand the Tanzanian market and care about making celebrations accessible." },
    { id: 3, title: "Interview", description: "A conversation about your experience, our mission, and how you'd contribute to building Tanzania's go-to wedding & events marketplace." },
    { id: 4, title: "Team Meeting", description: "Meet the wider team to discuss collaboration, our values, and how we work together to serve couples and vendors across Tanzania." },
    { id: 5, title: "Offer", description: "We extend a competitive offer and welcome you to help us transform how Tanzanians plan and celebrate their most important moments." }
  ];

  return (
    <div className="py-24 md:py-32 max-w-5xl mx-auto px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-24"
      >
        <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3 font-mono">{process.headline || "The Journey"}</h2>
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary tracking-tight">{process.subheadline || "How we hire"}</h3>
      </motion.div>

      <div className="relative">
        {/* Central Vertical Line (Desktop) / Left Line (Mobile) */}
        <div className="absolute left-[31px] md:left-1/2 top-0 bottom-0 w-px bg-border md:transform md:-translate-x-1/2" />

        <div className="space-y-16">
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
              <div className={`pl-24 md:pl-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
                <h4 className="text-xl font-semibold text-primary mb-2">{step.title}</h4>
                <p className="text-secondary leading-relaxed text-sm md:text-base font-light">{step.description}</p>
              </div>

              {/* Number Node */}
              <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center z-10 shadow-sm relative group transition-colors duration-300 hover:border-primary">
                  <span className="text-lg font-bold text-primary">{step.id}</span>
                </div>
              </div>

              {/* Empty Side (for layout balance on Desktop) */}
              <div className="hidden md:block md:w-1/2" />
              
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Process;
