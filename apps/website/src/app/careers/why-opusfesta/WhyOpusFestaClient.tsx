"use client";

import { CareersNavbar } from "@/components/careers/CareersNavbar";
import { CareersFooter } from "@/components/careers/CareersFooter";
import { AnimatedGrid } from "@/components/careers/AnimatedGrid";
import CoreValuesSection from "@/components/careers/CoreValuesSection";
import { ArrowRight, TrendingUp, Code, Users, Lightbulb, Rocket, Award } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useCareersContent } from "@/context/CareersContentContext";

export function WhyOpusFestaClient() {
  const { content } = useCareersContent();
  const { whyOpusFesta } = content;

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    rocket: Rocket,
    trending: TrendingUp,
    code: Code,
    users: Users,
    lightbulb: Lightbulb,
    award: Award,
  };

  return (
    <div className="min-h-screen bg-background">
      <CareersNavbar />
      
      <main>
        {/* Hero Section with Animated Grid */}
        <div className="min-h-screen w-full bg-background flex flex-col">
          {/* Header Section */}
          <div className="pt-16 pb-8 sm:pt-24 sm:pb-12 md:pt-32 md:pb-16 flex flex-col items-center px-4 sm:px-6 relative z-20">
            <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-6 sm:mb-8 md:mb-10 tracking-tight">
                {whyOpusFesta.hero.headline.split("\n").map((line, index) => (
                  <span key={index} className="block">
                    {line}
                  </span>
                ))}
              </h1>
              
              <div className="max-w-3xl mx-auto text-secondary text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed font-light mb-8 sm:mb-10 md:mb-12 px-2">
                <p>{whyOpusFesta.hero.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full">
                <Link href={whyOpusFesta.hero.ctaLink} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base">
                    {whyOpusFesta.hero.ctaText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 
            The "One Big Card" Container.
            Instead of the grid filling the screen edge-to-edge, it is now contained 
            within this max-width box with rounded corners and a heavy shadow.
          */}
          <div className="grow w-full px-4 sm:px-6 md:px-8 pb-8 sm:pb-12 md:pb-24">
            <div className="max-w-[1400px] mx-auto w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[650px] relative rounded-xl sm:rounded-2xl md:rounded-4xl lg:rounded-[2.5rem] border border-border/50 dark:border-border/30 bg-surface dark:bg-surface/50 overflow-hidden shadow-sm dark:shadow-none">
              {/* Top Fade Gradient inside the card - subtle */}
              <div className="absolute top-0 left-0 w-full h-20 sm:h-24 bg-linear-to-b from-surface/60 dark:from-surface/80 via-surface/30 dark:via-surface/50 to-transparent z-10 pointer-events-none" />
              
              {/* The Content */}
              <AnimatedGrid />
              
              {/* Bottom Fade Gradient inside the card - slightly stronger */}
              <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 bg-linear-to-t from-surface/70 dark:from-surface/80 via-surface/40 dark:via-surface/60 to-transparent z-10 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Reasons to Join */}
        <section className="py-12 sm:py-16 md:py-24 bg-surface/20 dark:bg-surface/10">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16 md:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-6 sm:mb-8 tracking-tight">
                {whyOpusFesta.reasons.headline}
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 md:gap-16 max-w-5xl mx-auto">
              {whyOpusFesta.reasons.items.map((reason, i) => {
                const Icon = iconMap[reason.icon] ?? Rocket;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group"
                  >
                    <div className="text-center">
                      {/* Icon */}
                      <div className="mb-6 sm:mb-8 flex justify-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-background dark:bg-surface/50 border-2 border-border dark:border-border/60 flex items-center justify-center group-hover:border-primary dark:group-hover:border-primary group-hover:bg-primary/5 dark:group-hover:bg-primary/10 transition-all duration-300">
                          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-primary tracking-tight mb-4 sm:mb-6">
                        {reason.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-secondary leading-relaxed text-sm sm:text-base md:text-lg font-light max-w-md mx-auto px-2">
                        {reason.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Core Values & Ethos Section */}
        <CoreValuesSection />

        {/* What Makes Us Different */}
        <section className="py-12 sm:py-16 md:py-24 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent"></div>
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16 md:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-6 sm:mb-8 tracking-tight">
                {whyOpusFesta.difference.headline}
              </h2>
              <div className="max-w-3xl mx-auto text-secondary text-sm sm:text-base md:text-lg leading-relaxed font-light px-2">
                <p>{whyOpusFesta.difference.description}</p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-10 sm:gap-12 md:gap-16 max-w-5xl mx-auto">
              {whyOpusFesta.difference.items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center group"
                  whileHover={{ y: -4 }}
                >
                  <div className="w-12 h-[2px] bg-primary/30 dark:bg-primary/40 mx-auto mb-4 sm:mb-6 group-hover:w-16 group-hover:bg-primary/50 dark:group-hover:bg-primary/60 transition-all duration-300"></div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-primary tracking-tight mb-4 sm:mb-6 group-hover:text-primary/80 dark:group-hover:text-primary/70 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-secondary leading-relaxed text-sm sm:text-base font-light max-w-sm mx-auto px-2">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-12 sm:py-16 md:py-24 bg-surface/30 dark:bg-surface/10">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-6 sm:mb-8 tracking-tight">
                {whyOpusFesta.vision.headline}
              </h2>
              <div className="max-w-3xl mx-auto text-secondary text-sm sm:text-base md:text-lg leading-relaxed font-light space-y-3 sm:space-y-4 px-2">
                {whyOpusFesta.vision.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-24 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent"></div>
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-8 sm:mb-10 md:mb-12 tracking-tight">
                {whyOpusFesta.cta.headline}
              </h2>
              <div className="max-w-2xl mx-auto text-secondary text-sm sm:text-base md:text-lg leading-relaxed font-light mb-6 sm:mb-8 px-2">
                <p>{whyOpusFesta.cta.description}</p>
              </div>
              <Link href={whyOpusFesta.cta.buttonLink}>
                <Button size="lg" className="text-base px-8 group">
                  {whyOpusFesta.cta.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      
      <CareersFooter />
    </div>
  );
}
