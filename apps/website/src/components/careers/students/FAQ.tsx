"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What are the requirements to apply?",
    answer: "We welcome students from all backgrounds and academic levels. While technical skills are a plus, we value passion, curiosity, and a willingness to learn. Most positions require you to be currently enrolled in a university or college program."
  },
  {
    question: "How long do internships typically last?",
    answer: "Internship durations vary based on the role and your availability. We offer summer internships (3 months), semester-long positions (4-6 months), and year-long programs. We work with you to find a schedule that fits your academic commitments."
  },
  {
    question: "Are these positions paid?",
    answer: "Yes, all our student positions are paid. We believe in fair compensation for the valuable work our students contribute. Compensation varies by role and experience level."
  },
  {
    question: "Can I work remotely?",
    answer: "Many of our positions offer flexible remote or hybrid work options. We understand that students need flexibility to balance work with classes and other commitments. Specific arrangements depend on the role and team needs."
  },
  {
    question: "What kind of mentorship can I expect?",
    answer: "You'll be paired with experienced team members who provide regular guidance, code reviews, and career advice. We also host learning sessions, workshops, and team events to help you grow both technically and professionally."
  },
  {
    question: "Will this lead to a full-time position?",
    answer: "While we can't guarantee full-time offers, many of our students receive full-time job offers after their internships or part-time positions. We're always looking to grow our team with talented individuals who are a great cultural fit."
  }
];

export function FAQ() {
  return (
    <section className="py-12 sm:py-16 md:py-24">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-6 sm:mb-8 tracking-tight">
            <span className="font-playfair italic font-medium">Frequently</span>{' '}
            <span className="font-sans font-medium tracking-tighter">asked questions</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="border-border/60"
              >
                <AccordionTrigger className="text-left text-base sm:text-lg md:text-xl py-4 sm:py-6 font-medium text-primary hover:text-primary/80 dark:hover:text-primary/70 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-secondary text-sm sm:text-base leading-relaxed pb-4 sm:pb-6 font-light">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
