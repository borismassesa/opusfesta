"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useCareersContent } from "@/context/CareersContentContext";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const EmployeeStories: React.FC = () => {
  const { content } = useCareersContent();
  const { testimonials } = content;

  // Use testimonials from database or empty array
  const employeeStories = testimonials.items.length > 0 ? testimonials.items : [];

  if (employeeStories.length === 0) {
    return null;
  }

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
            {testimonials.headline || "Employee Experience"}
          </span>
          <span className="md:hidden w-12 h-px bg-accent"></span>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary tracking-tight mb-6">
          What our team says
        </h2>
        <p className="text-base md:text-lg text-secondary leading-relaxed font-light">
          Hear from the people building Tanzania's go-to wedding & events marketplace. Every day, we're making celebrations more accessible and meaningful.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16"
      >
        {employeeStories.map((story, index) => (
          <motion.div 
            key={index} 
            variants={itemVariants} 
            className="flex flex-col gap-4"
          >
            <div className="w-12 h-[2px] bg-primary mb-4 opacity-10"></div>
            <blockquote className="text-secondary leading-relaxed text-base md:text-lg font-light mb-6">
              &ldquo;{story.quote}&rdquo;
            </blockquote>
            <div className="mt-auto">
              <div className="text-xl font-medium text-primary tracking-tight mb-1">
                {story.name}
              </div>
              <div className="text-secondary text-sm font-light">
                {story.role}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default EmployeeStories;
