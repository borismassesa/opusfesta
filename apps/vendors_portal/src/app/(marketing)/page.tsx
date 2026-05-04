import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import Trust from '@/components/trust'
import CategoryMarquee from '@/components/category-marquee'
import VendorSearch from '@/components/vendor-search'
import PricingComparison from '@/components/pricing-comparison'
import PortalPreview from '@/components/portal-preview'
import Business from '@/components/business'
import Features from '@/components/features'
import Testimonials from '@/components/testimonials'
import Faq from '@/components/faq'
import Cta from '@/components/cta'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <div className="font-sans text-[#1A1A1A] bg-[#FFFFFF] selection:bg-[var(--accent)] selection:text-[var(--on-accent)]">
      <Navbar />
      <Hero />
      <Trust />
      <CategoryMarquee />
      <VendorSearch />
      <PricingComparison />
      <PortalPreview />
      <section id="features">
        <Features />
      </section>
      <Business />
      <section id="testimonials">
        <Testimonials />
      </section>
      <section id="faq">
        <Faq />
      </section>
      <Cta />
      <Footer />
    </div>
  )
}
