"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useCareersContent } from "@/context/CareersContentContext";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const Values: React.FC = () => {
  const { content } = useCareersContent();
  const { values } = content;

  // Updated values with new content
  const valuesList = [
    {
      title: "Our Best Features",
      subtitle: "We are drivers of our mission",
      description: "We're driven by our commitment to empower every person in Tanzania to plan and celebrate their events exactly the way they want.",
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000"
    },
    {
      title: "Progression",
      subtitle: "Be a pace setter",
      description: "We move with urgency so we can set the cadence for our market, cover more ground, and ship more great products and programs for our users, faster.",
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000"
    },
    {
      title: "Management",
      subtitle: "Be a truth seeker",
      description: "We pursue the best data, ideas, and solutions with rigor and open-mindedness, always guided by our users' most pressing needs.",
      imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000"
    }
  ];

  return (
    <div className="py-24 md:py-32 max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 md:mb-24 max-w-2xl"
      >
        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
          <span className="w-12 h-px bg-accent"></span>
          <span className="font-mono text-accent text-xs tracking-widest uppercase">
            Culture & Values
          </span>
          <span className="md:hidden w-12 h-px bg-accent"></span>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary tracking-tight mb-6">
          How we work
        </h2>
        <p className="text-base md:text-lg text-secondary leading-relaxed font-light">
          We're building Tanzania's go-to wedding & events marketplace. Our work connects couples with trusted vendors, streamlines planning, and makes celebrations more accessible—all while honoring the traditions that make Tanzanian events special.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid md:grid-cols-3 gap-6 md:gap-8"
      >
        {valuesList.map((v, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants} 
            className="flex flex-col bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            {/* Image Area */}
            <div className="w-full h-48 relative overflow-hidden">
              <img 
                src={v.imageUrl} 
                alt={v.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-linear-to-t from-background/20 to-transparent"></div>
            </div>
            
            {/* Content Area */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-semibold text-primary tracking-tight mb-1">
                {v.title}
              </h3>
              <p className="text-sm text-secondary font-medium mb-4">
                {v.subtitle}
              </p>
              <p className="text-secondary leading-relaxed text-sm flex-1">
                {v.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Values;
