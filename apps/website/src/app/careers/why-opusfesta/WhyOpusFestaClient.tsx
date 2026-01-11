"use client";

import { CareersNavbar } from "@/components/careers/CareersNavbar";
import { CareersFooter } from "@/components/careers/CareersFooter";
import { ArrowRight, Target, Users, Zap, Heart, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function WhyOpusFestaClient() {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "We're building Tanzania's go-to wedding & events marketplace. Our mission is to connect couples with trusted vendors, streamline event planning, and make celebrations more accessible—all while honoring the traditions that make Tanzanian events special.",
    },
    {
      icon: Heart,
      title: "Cultural Respect",
      description: "We honor Swahili traditions while building modern tools. Every feature we ship respects the way Tanzanians actually plan celebrations, from harusi to sherehe. We support both Swahili and English, understanding that language is part of culture.",
    },
    {
      icon: Users,
      title: "Real Impact",
      description: "We talk to couples, vendors, and families every week. Their stories shape our product. We're not building in a vacuum—we're solving real problems for real celebrations. Every feature helps real couples plan real celebrations.",
    },
    {
      icon: Zap,
      title: "Move with Purpose",
      description: "Event planning can't wait. When a couple needs a vendor or a family needs to track RSVPs, speed matters. We ship fast, but we ship right—because celebrations deserve our best.",
    },
    {
      icon: Globe,
      title: "Tanzania-First",
      description: "We're built for Tanzanians, by Tanzanians. We understand local traditions, support mobile money (M-Pesa, Tigo Pesa), and design for the Tanzanian market. We're growing faster than ever across Tanzania 🇹🇿",
    },
  ];

  const whatWeDo = [
    {
      title: "Connect Couples with Vendors",
      description: "We've built a trusted marketplace where couples can find the perfect vendors for their celebrations, from photographers to caterers to venues.",
    },
    {
      title: "Streamline Event Planning",
      description: "Our tools help couples manage guest lists, budgets, timelines, and RSVPs—making event planning accessible and stress-free.",
    },
    {
      title: "Support Local Businesses",
      description: "We help local vendors grow their businesses by connecting them with couples who need their services, creating economic opportunities across Tanzania.",
    },
    {
      title: "Honor Traditions",
      description: "We understand that celebrations are deeply cultural. Our platform respects and supports Tanzanian traditions while making planning easier.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <CareersNavbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 lg:px-12 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-px bg-accent"></span>
              <span className="font-mono text-accent text-xs tracking-widest uppercase">
                Why OpusFesta
              </span>
              <span className="w-12 h-px bg-accent"></span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-primary mb-6">
              Build the future of Tanzanian celebrations
            </h1>
            <p className="text-lg md:text-xl text-secondary leading-relaxed font-light max-w-3xl">
              We're building Tanzania's go-to wedding & events marketplace. Join us in connecting couples with trusted vendors, streamlining event planning, and making celebrations more accessible—all while honoring Swahili traditions.
            </p>
          </motion.div>
        </section>

        {/* Mission & Values */}
        <section className="py-16 md:py-24 bg-surface/30 border-y border-border">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-primary tracking-tight mb-8">
                What drives us
              </h2>
              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                {values.map((value, i) => {
                  const Icon = value.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-background rounded-xl shadow-sm border border-border text-primary">
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-medium text-primary tracking-tight">
                          {value.title}
                        </h3>
                      </div>
                      <p className="text-secondary leading-relaxed text-base md:text-lg font-light">
                        {value.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-12 h-px bg-accent"></span>
                <span className="font-mono text-accent text-xs tracking-widest uppercase">
                  What We Do
                </span>
                <span className="w-12 h-px bg-accent"></span>
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold text-primary tracking-tight mb-8">
                Making celebrations accessible
              </h2>
              <p className="text-lg text-secondary leading-relaxed font-light mb-12 max-w-3xl">
                OpusFesta is a toolbox of event planning tools that let you manage your celebrations however you find most useful. We've brought together a diverse team passionate about events, technology, culture, design, music, and craft.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {whatWeDo.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col gap-3"
                >
                  <div className="w-12 h-[2px] bg-primary mb-2 opacity-20"></div>
                  <h3 className="text-xl font-medium text-primary tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-secondary leading-relaxed text-base font-light">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Growth & Impact */}
        <section className="py-16 md:py-24 bg-surface/30 border-y border-border">
          <div className="max-w-5xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-primary tracking-tight mb-6">
                Join our growing team
              </h2>
              <p className="text-lg text-secondary leading-relaxed font-light max-w-2xl mx-auto mb-8">
                Today, we're growing faster than ever across Tanzania. We're looking for people who understand the Tanzanian market, care about making celebrations accessible, and want to build products that matter to real people.
              </p>
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
