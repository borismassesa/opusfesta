import HomePageShell from '@/components/HomePageShell';
import HeroSection from '@/components/HeroSection';
import FeaturedProjects from '@/components/FeaturedProjects';
import GallerySection from '@/components/GallerySection';
import ServicesSection from '@/components/ServicesSection';
import ProcessSection from '@/components/ProcessSection';
import SignatureWorkSection from '@/components/SignatureWorkSection';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';
import MainFooter from '@/components/MainFooter';
import {
  getPublishedServices,
  getPublishedProjects,
  getPublishedTestimonials,
  getPublishedFaqs,
  getSettings,
  getPageSections,
} from '@/lib/data-access';

export default async function Home() {
  const [services, projects, testimonials, faqs, settings, sections] = await Promise.all([
    getPublishedServices(),
    getPublishedProjects(),
    getPublishedTestimonials(),
    getPublishedFaqs(),
    getSettings(),
    getPageSections('home'),
  ]);

  return (
    <HomePageShell>
      <HeroSection content={sections.hero} />
      <FeaturedProjects content={{ stats: sections.stats, clients: sections.clients, about: sections.about }} />
      <ServicesSection services={services} />
      <GallerySection projects={projects} services={services} />
      <ProcessSection content={sections.process} />
      <SignatureWorkSection projects={projects} />
      <TestimonialsCarousel testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <CTASection content={sections.cta} />
      <MainFooter settings={settings} />
    </HomePageShell>
  );
}
