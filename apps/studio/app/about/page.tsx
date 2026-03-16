import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import AboutHero from '@/components/about/AboutHero';
import AboutStats from '@/components/about/AboutStats';
import AboutStory from '@/components/about/AboutStory';
import AboutTeam from '@/components/about/AboutTeam';
import AboutValues from '@/components/about/AboutValues';
import AboutClients from '@/components/about/AboutClients';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import CTASection from '@/components/CTASection';
import {
  getPublishedTeamMembers,
  getPublishedTestimonials,
  getPageSections,
} from '@/lib/data-access';

export const metadata: Metadata = {
  title: 'About | OpusStudio',
  description:
    'Meet the team behind OpusStudio and learn how we approach production partnerships.',
};

export default async function AboutPage() {
  const [teamMembers, testimonials, sections] = await Promise.all([
    getPublishedTeamMembers(),
    getPublishedTestimonials(),
    getPageSections('about'),
  ]);

  return (
    <PageLayout>
      <AboutHero content={sections.hero as Record<string, unknown>} />
      <AboutStats content={sections.stats as Record<string, unknown>} />
      <AboutStory content={sections.story as Record<string, unknown>} />
      <AboutTeam teamMembers={teamMembers} />
      <AboutValues content={sections.values as Record<string, unknown>} />
      <AboutClients content={sections.partners as Record<string, unknown>} />
      <TestimonialsCarousel testimonials={testimonials} />
      <CTASection content={sections.cta as Record<string, unknown>} />
    </PageLayout>
  );
}
