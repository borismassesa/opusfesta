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

  // Use values from CMS or default - updated to reflect OpusFesta's mission
  const valuesList = values.items.length > 0 ? values.items.slice(0, 3) : [
    {
      title: "Celebrate Tanzanian culture",
      description: "We honor Swahili traditions while building modern tools. Every feature we ship respects the way Tanzanians actually plan celebrations, from harusi to sherehe."
    },
    {
      title: "Build for real people",
      description: "We talk to couples, vendors, and families every week. Their stories shape our product. We're not building in a vacuum—we're solving real problems for real celebrations."
    },
    {
      title: "Move with purpose",
      description: "Event planning can't wait. When a couple needs a vendor or a family needs to track RSVPs, speed matters. We ship fast, but we ship right—because celebrations deserve our best."
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
        className="grid md:grid-cols-3 gap-12 md:gap-16"
      >
        {valuesList.map((v, i) => (
          <motion.div key={i} variants={itemVariants} className="flex flex-col gap-4">
             <div className="w-12 h-[2px] bg-primary mb-4 opacity-10"></div>
             <h3 className="text-2xl font-medium text-primary tracking-tight">{v.title}</h3>
             <p className="text-secondary leading-relaxed text-base md:text-lg font-light">{v.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Values;
