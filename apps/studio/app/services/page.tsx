import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import ServicesSection from '@/components/ServicesSection';

export const metadata: Metadata = {
  title: 'Services | OpusFesta Studio',
  description: 'Video production, post-production, motion graphics, photography, audio, and creative direction.',
};

export default function ServicesPage() {
  return (
    <PageLayout>
      <section className="py-20 lg:py-24 bg-brand-bg border-b-4 border-brand-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-5 block">Services</span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-brand-dark leading-[0.9]">
            WHAT WE<br />
            <span className="text-stroke">DO.</span>
          </h1>
        </div>
      </section>
      <ServicesSection />
    </PageLayout>
  );
}
