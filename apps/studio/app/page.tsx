'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import MenuSidebar from '@/components/MenuSidebar';
import GridOverlay from '@/components/GridOverlay';
import HeroSection from '@/components/HeroSection';
import FeaturedProjects from '@/components/FeaturedProjects';
import ServicesSection from '@/components/ServicesSection';
import ProcessSection from '@/components/ProcessSection';
import VideoLightboxSection from '@/components/VideoLightboxSection';
import SignatureWorkSection from '@/components/SignatureWorkSection';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';
import MainFooter from '@/components/MainFooter';
import BackToTop from '@/components/BackToTop';
import { BookingProvider } from '@/components/booking/BookingProvider';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <BookingProvider>
      <main id="main-content" className="relative">
        <GridOverlay />
        <Header onMenuToggle={() => setIsMenuOpen(true)} />
        <MenuSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <HeroSection />
        <FeaturedProjects />
        <ServicesSection />
        <ProcessSection />
        <VideoLightboxSection />
        <SignatureWorkSection />
        <TestimonialsCarousel />
        <FAQSection />
        <CTASection />
        <MainFooter />
        <BackToTop />
      </main>
    </BookingProvider>
  );
}
