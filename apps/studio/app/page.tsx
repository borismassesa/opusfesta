'use client';

import PageLayout from '@/components/PageLayout';
import HeroSection from '@/components/HeroSection';
import FeaturedProjects from '@/components/FeaturedProjects';
import ServicesSection from '@/components/ServicesSection';
import ProcessSection from '@/components/ProcessSection';
import SignatureWorkSection from '@/components/SignatureWorkSection';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';

export default function Home() {
  return (
    <PageLayout withTopOffset={false}>
      <HeroSection />
      <FeaturedProjects />
      <ServicesSection />
      <ProcessSection />
      <SignatureWorkSection />
      <TestimonialsCarousel />
      <FAQSection />
      <CTASection />
    </PageLayout>
  );
}
