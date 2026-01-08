"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useCareersContent } from "@/context/CareersContentContext";

const ValuesInAction: React.FC = () => {
  const { content } = useCareersContent();
  const { valuesInAction } = content;

  return (
    <div className="py-24 md:py-32 max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
          <span className="w-12 h-px bg-accent"></span>
          <span className="font-mono text-accent text-xs tracking-widest uppercase">
            Impact
          </span>
          <span className="md:hidden w-12 h-px bg-accent"></span>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary tracking-tight mb-6">
          {valuesInAction.headline}
        </h2>
      </motion.div>

      <div className="space-y-16 md:space-y-24">
        {/* Affinity Groups */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h3 className="text-2xl font-semibold text-primary tracking-tight mb-4">
            {valuesInAction.affinityGroups.title}
          </h3>
          <p className="text-secondary leading-relaxed text-base md:text-lg font-light">
            {valuesInAction.affinityGroups.description}
          </p>
        </motion.div>

        {/* Nonprofits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl"
        >
          <h3 className="text-2xl font-semibold text-primary tracking-tight mb-4">
            {valuesInAction.nonprofits.title}
          </h3>
          <p className="text-secondary leading-relaxed text-base md:text-lg font-light">
            {valuesInAction.nonprofits.description}
          </p>
        </motion.div>

        {/* Social Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl"
        >
          <h3 className="text-2xl font-semibold text-primary tracking-tight mb-4">
            {valuesInAction.socialImpact.title}
          </h3>
          <p className="text-secondary leading-relaxed text-base md:text-lg font-light mb-8">
            {valuesInAction.socialImpact.description}
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {valuesInAction.socialImpact.programs.map((program, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="flex flex-col gap-3"
              >
                <div className="w-12 h-[2px] bg-primary mb-2 opacity-10"></div>
                <h4 className="text-lg font-medium text-primary tracking-tight">
                  {program.title}
                </h4>
                <p className="text-secondary leading-relaxed text-sm md:text-base font-light">
                  {program.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ValuesInAction;
