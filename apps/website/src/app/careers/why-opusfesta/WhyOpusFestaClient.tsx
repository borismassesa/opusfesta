"use client";

import { CareersNavbar } from "@/components/careers/CareersNavbar";
import { CareersFooter } from "@/components/careers/CareersFooter";
import { AnimatedGrid } from "@/components/careers/AnimatedGrid";
import { ArrowRight, TrendingUp, Code, Users, Lightbulb, Rocket, Award } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function WhyOpusFestaClient() {
  const reasons = [
    {
      icon: Rocket,
      title: "Build Something Meaningful",
      description: "Every line of code you write, every feature you ship, directly impacts real couples planning their most important celebrations. You're not building another app—you're helping families create memories that last a lifetime.",
    },
    {
      icon: TrendingUp,
      title: "Rapid Growth & Impact",
      description: "We're one of Tanzania's fastest-growing tech companies. Join us at this pivotal moment and help shape the future of event planning across the country. Your work will reach thousands of users from day one.",
    },
    {
      icon: Code,
      title: "Modern Tech Stack",
      description: "Work with cutting-edge technologies and best practices. We use TypeScript, Next.js, React, and modern cloud infrastructure. You'll build scalable systems while learning from experienced engineers.",
    },
    {
      icon: Users,
      title: "Collaborative Culture",
      description: "We believe great products come from great teams. You'll work alongside passionate, talented people who care about quality, user experience, and making a real difference. No egos, just great work.",
    },
    {
      icon: Lightbulb,
      title: "Ownership & Autonomy",
      description: "Take ownership of features from concept to launch. We trust you to make decisions, experiment, and learn. Your ideas matter, and you'll see them come to life quickly without layers of bureaucracy.",
    },
    {
      icon: Award,
      title: "Career Growth",
      description: "We invest in your growth. Whether you want to become a technical lead, explore new domains, or build expertise in specific areas, we provide the opportunities, mentorship, and resources to help you succeed.",
    },
  ];

  const whatMakesUsDifferent = [
    {
      title: "Tanzania-First Approach",
      description: "We're not adapting a foreign product—we're building specifically for the Tanzanian market. You'll work on features like mobile money integration, Swahili language support, and cultural event planning that truly serve our users.",
    },
    {
      title: "Real User Connection",
      description: "We regularly talk to couples, vendors, and families. You'll see firsthand how your work makes a difference. This isn't abstract—you'll hear stories of celebrations made easier because of what you built.",
    },
    {
      title: "Fast-Paced Learning",
      description: "In a startup environment, you wear multiple hats and learn quickly. One day you might be optimizing database queries, the next you're designing a new feature. You'll grow faster here than anywhere else.",
    },
    {
      title: "Work-Life Balance",
      description: "We work hard, but we also respect boundaries. We believe sustainable pace leads to better products and happier teams. Flexible hours and remote-friendly policies help you do your best work.",
    },
  ];

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
                <span className="font-playfair italic font-medium">Why you should</span>{' '}
                <span className="font-sans font-medium tracking-tighter">join us</span>
                <br />
                <span className="font-sans font-medium tracking-tighter">Build something</span>{' '}
                <span className="font-playfair italic font-medium">meaningful</span>
              </h1>
              
              <div className="max-w-3xl mx-auto text-secondary text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed font-light mb-8 sm:mb-10 md:mb-12 px-2">
                <p>
                  At OpusFesta, you'll build products that matter to real people, work with cutting-edge technology, and grow your career while making a meaningful impact on Tanzanian celebrations.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full">
                <Link href="/careers/positions" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base">
                    View Open Positions
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
          <div className="flex-grow w-full px-4 sm:px-6 md:px-8 pb-8 sm:pb-12 md:pb-24">
            <div className="max-w-[1400px] mx-auto w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[650px] relative rounded-xl sm:rounded-2xl md:rounded-[2rem] lg:rounded-[2.5rem] border border-border/50 dark:border-border/30 bg-surface dark:bg-surface/50 overflow-hidden shadow-sm dark:shadow-none">
              {/* Top Fade Gradient inside the card - subtle */}
              <div className="absolute top-0 left-0 w-full h-20 sm:h-24 bg-gradient-to-b from-surface/60 dark:from-surface/80 via-surface/30 dark:via-surface/50 to-transparent z-10 pointer-events-none" />
              
              {/* The Content */}
              <AnimatedGrid />
              
              {/* Bottom Fade Gradient inside the card - slightly stronger */}
              <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-t from-surface/70 dark:from-surface/80 via-surface/40 dark:via-surface/60 via-surface/20 to-transparent z-10 pointer-events-none" />
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
                <span className="font-sans font-medium tracking-tighter">Why work</span>{' '}
                <span className="font-playfair italic font-medium">at OpusFesta</span>
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 md:gap-16 max-w-5xl mx-auto">
              {reasons.map((reason, i) => {
                const Icon = reason.icon;
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

        {/* What Makes Us Different */}
        <section className="py-12 sm:py-16 md:py-24 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16 md:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-6 sm:mb-8 tracking-tight">
                <span className="font-playfair italic font-medium">What makes us</span>{' '}
                <span className="font-sans font-medium tracking-tighter">different</span>
              </h2>
              <div className="max-w-3xl mx-auto text-secondary text-sm sm:text-base md:text-lg leading-relaxed font-light px-2">
                <p>
                  We're not just another tech company. We're building something unique for Tanzania, and that means unique opportunities for you.
                </p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-10 sm:gap-12 md:gap-16 max-w-5xl mx-auto">
              {whatMakesUsDifferent.map((item, i) => (
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
                <span className="font-sans font-medium tracking-tighter">Building the future</span>{' '}
                <span className="font-playfair italic font-medium">of celebrations</span>
              </h2>
              <div className="max-w-3xl mx-auto text-secondary text-sm sm:text-base md:text-lg leading-relaxed font-light space-y-3 sm:space-y-4 px-2">
                <p>
                  We envision a future where planning any celebration—from intimate weddings to grand sherehe—is seamless, accessible, and joyful. We're building the platform that makes this possible, and we need talented people like you to help us get there.
                </p>
                <p>
                  Whether you're a seasoned engineer, a designer passionate about user experience, or someone early in their career looking to make an impact, there's a place for you here. We're building something special, and we'd love for you to be part of it.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-24 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-8 sm:mb-10 md:mb-12 tracking-tight">
                <span className="font-playfair italic font-medium">Ready</span>{' '}
                <span className="font-sans font-medium tracking-tighter">to join us?</span>
              </h2>
              <div className="max-w-2xl mx-auto text-secondary text-sm sm:text-base md:text-lg leading-relaxed font-light mb-6 sm:mb-8 px-2">
                <p>
                  Check out our open positions and see where you can make an impact. We're always looking for talented, passionate people who want to build something meaningful.
                </p>
              </div>
              <Link href="/careers/positions">
                <Button size="lg" className="text-base px-8 group">
                  View Open Positions
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
