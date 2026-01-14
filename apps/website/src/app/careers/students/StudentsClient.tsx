"use client";

import { CareersNavbar } from "@/components/careers/CareersNavbar";
import { CareersFooter } from "@/components/careers/CareersFooter";
import { ArrowRight, GraduationCap, Briefcase, Lightbulb, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Header from "@/components/careers/students/Header";
import Carousel from "@/components/careers/students/Carousel";
import { StudentTestimonials } from "@/components/careers/students/StudentTestimonials";
import { FAQ } from "@/components/careers/students/FAQ";
import { Timeline } from "@/components/careers/students/Timeline";

export function StudentsClient() {

  const opportunities = [
    {
      icon: GraduationCap,
      title: "Internships",
      description: "Gain real-world experience working on projects that matter. Our internships offer hands-on learning opportunities in a supportive environment.",
    },
    {
      icon: Briefcase,
      title: "Part-Time Positions",
      description: "Balance your studies with meaningful work. We offer flexible part-time positions that fit around your academic schedule.",
    },
    {
      icon: Lightbulb,
      title: "Project-Based Work",
      description: "Work on exciting projects that challenge you and help you grow. Perfect for building your portfolio while contributing to real products.",
    },
    {
      icon: Users,
      title: "Mentorship",
      description: "Learn from experienced professionals who are passionate about helping you succeed. Get guidance on your career path and technical skills.",
    },
  ];

  const benefits = [
    {
      title: "Flexible Schedule",
      description: "We understand you have classes and exams. We work around your academic commitments.",
    },
    {
      title: "Real Impact",
      description: "Your work directly contributes to products used by thousands of people across Tanzania.",
    },
    {
      title: "Skill Development",
      description: "Learn industry best practices, modern tools, and gain experience that sets you apart.",
    },
    {
      title: "Network Building",
      description: "Connect with professionals in the tech industry and build relationships that last beyond your time with us.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <CareersNavbar />
      
      <main className="pt-20 sm:pt-24">
        {/* Hero Section with Carousel */}
        <section id="hero-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 md:py-24 flex flex-col items-center">
          <Header />
          <Carousel />
        </section>

        {/* Opportunities */}
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
                <span className="font-playfair italic font-medium">Opportunities</span>{' '}
                <span className="font-sans font-medium tracking-tighter">for students</span>
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 md:gap-16 max-w-5xl mx-auto">
              {opportunities.map((opportunity, i) => {
                const Icon = opportunity.icon;
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
                        {opportunity.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-secondary leading-relaxed text-sm sm:text-base md:text-lg font-light max-w-md mx-auto px-2">
                        {opportunity.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
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
                <span className="font-sans font-medium tracking-tighter">Why work</span>{' '}
                <span className="font-playfair italic font-medium">with us</span>
                <br />
                <span className="font-sans font-medium tracking-tighter">as a student</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-10 sm:gap-12 md:gap-16 max-w-5xl mx-auto">
              {benefits.map((benefit, i) => (
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
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-primary tracking-tight mb-4 sm:mb-6 group-hover:text-primary/80 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-secondary leading-relaxed text-sm sm:text-base font-light max-w-sm mx-auto px-2">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Student Testimonials */}
        <StudentTestimonials />

        {/* Timeline / How to Apply */}
        <Timeline />

        {/* FAQ */}
        <FAQ />

        {/* CTA */}
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
                <span className="font-sans font-medium tracking-tighter">to get started?</span>
              </h2>
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
