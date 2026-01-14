"use client";

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { PROFILES } from './constants';

export function StudentTestimonials() {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);
  const anim1Ref = useRef<gsap.core.Tween | null>(null);
  const anim2Ref = useRef<gsap.core.Tween | null>(null);
  const anim3Ref = useRef<gsap.core.Tween | null>(null);

  // Duplicate testimonials for seamless loop
  const allTestimonials = [...PROFILES, ...PROFILES, ...PROFILES];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Row 1: Move left (negative direction) - much slower speed
      if (row1Ref.current) {
        anim1Ref.current = gsap.to(row1Ref.current, {
          xPercent: -50,
          repeat: -1,
          duration: 120,
          ease: "none"
        });
      }

      // Row 2: Move right (positive direction) - start from -50% and go to 0%
      if (row2Ref.current) {
        anim2Ref.current = gsap.fromTo(row2Ref.current, 
          { xPercent: -50 },
          {
            xPercent: 0,
            repeat: -1,
            duration: 150,
            ease: "none"
          }
        );
      }

      // Row 3: Move left (negative direction, slowest speed)
      if (row3Ref.current) {
        anim3Ref.current = gsap.to(row3Ref.current, {
          xPercent: -50,
          repeat: -1,
          duration: 180,
          ease: "none"
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = () => {
    anim1Ref.current?.pause();
    anim2Ref.current?.pause();
    anim3Ref.current?.pause();
  };

  const handleMouseLeave = () => {
    anim1Ref.current?.resume();
    anim2Ref.current?.resume();
    anim3Ref.current?.resume();
  };

  const TestimonialCard = ({ testimonial, index }: { testimonial: typeof PROFILES[0], index: number }) => (
    <div className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[400px] bg-background border border-border/50 rounded-2xl p-5 sm:p-6 md:p-8 mx-3 sm:mx-4 hover:border-primary/50 dark:hover:border-primary/40 transition-colors duration-300">
      {testimonial.quote && (
        <p className="text-secondary leading-relaxed text-xs sm:text-sm md:text-base font-light mb-4 sm:mb-6 italic">
          "{testimonial.quote}"
        </p>
      )}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-surface flex-shrink-0 border border-border/30">
          <img 
            src={testimonial.image} 
            alt={testimonial.name}
            className="w-full h-full object-cover"
            style={{ filter: testimonial.filter }}
          />
        </div>
        <div>
          <h4 className="text-primary font-medium mb-1 text-sm sm:text-base">
            {testimonial.name}
          </h4>
          {testimonial.role && (
            <p className="text-secondary text-xs sm:text-sm font-light">
              {testimonial.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-surface/30 dark:bg-surface/10 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-6 sm:mb-8 tracking-tight">
            <span className="font-sans font-medium tracking-tighter">Student</span>{' '}
            <span className="font-playfair italic font-medium">stories</span>
          </h2>
          <p className="text-secondary text-xs sm:text-sm md:text-base leading-relaxed font-light max-w-2xl mx-auto px-2">
            Hear from students who have grown their careers with us
          </p>
        </motion.div>

        {/* Marquee Rows */}
        <div 
          className="space-y-4 sm:space-y-6 md:space-y-8"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Row 1: Moving Left */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-surface/30 via-surface/30 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-surface/30 via-surface/30 to-transparent z-10 pointer-events-none"></div>
            <div ref={row1Ref} className="flex gap-0 w-fit">
              {allTestimonials.map((testimonial, i) => (
                <TestimonialCard key={`row1-${i}`} testimonial={testimonial} index={i} />
              ))}
            </div>
          </div>

          {/* Row 2: Moving Right */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-surface/30 via-surface/30 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-surface/30 via-surface/30 to-transparent z-10 pointer-events-none"></div>
            <div ref={row2Ref} className="flex gap-0 w-fit">
              {allTestimonials.map((testimonial, i) => (
                <TestimonialCard key={`row2-${i}`} testimonial={testimonial} index={i} />
              ))}
            </div>
          </div>

          {/* Row 3: Moving Left (slower) */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-surface/30 via-surface/30 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-surface/30 via-surface/30 to-transparent z-10 pointer-events-none"></div>
            <div ref={row3Ref} className="flex gap-0 w-fit">
              {allTestimonials.map((testimonial, i) => (
                <TestimonialCard key={`row3-${i}`} testimonial={testimonial} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
