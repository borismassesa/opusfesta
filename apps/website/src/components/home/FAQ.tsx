"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useContent } from "@/context/ContentContext";
import { MotionPreset } from "@/components/ui/motion-preset";
import { TextShimmer } from "@/components/ui/text-shimmer";

export function FAQ() {
  const { content } = useContent();
  const faqs = content.faqs;

  return (
    <section className="py-8 sm:py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">

        <div className="md:sticky md:top-32 text-center md:text-left">
          <MotionPreset fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} className="mb-6">
            <TextShimmer className="text-sm font-medium uppercase" duration={1.75}>
              Common Questions
            </TextShimmer>
          </MotionPreset>
          <MotionPreset component="h2" fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.3} className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.1] mb-6">
            Got questions? <br />
            <span className="font-serif italic font-normal text-primary">We have answers.</span>
          </MotionPreset>
          <MotionPreset component="p" fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.6} className="text-secondary text-lg leading-relaxed max-w-md mx-auto md:mx-0 font-light">
            Everything you need to know about planning your perfect celebration with OpusFesta.
          </MotionPreset>
        </div>

        <div className="w-full">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <MotionPreset key={index} fade blur slide={{ direction: 'down', offset: 30 }} transition={{ duration: 0.6 }} delay={0.1 + index * 0.08}>
                <AccordionItem value={`item-${index}`} className="border-border/60">
                  <AccordionTrigger className="text-lg md:text-xl py-6 font-medium text-foreground hover:text-primary transition-colors hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-secondary text-base leading-relaxed pb-6 max-w-xl font-light">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </MotionPreset>
            ))}
          </Accordion>
        </div>

      </div>
    </section>
  );
}
