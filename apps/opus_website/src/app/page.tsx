import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import Trust from '@/components/trust'
import VendorSearch from '@/components/vendor-search'
import PricingComparison from '@/components/pricing-comparison'
import DoMore from '@/components/do-more'
import Business from '@/components/business'
import CategoryMarquee from '@/components/category-marquee'
import Testimonials from '@/components/testimonials'
import Features from '@/components/features'
import Faq from '@/components/faq'
import Cta from '@/components/cta'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <div className="font-sans text-[#1A1A1A] bg-[#FFFFFF] selection:bg-[var(--accent)] selection:text-[var(--on-accent)]">
      {/* Isolated test — plain HTML link, no React, no components */}
      <div style={{ padding: 20, background: '#ff0', textAlign: 'center' }}>
        <a href="https://google.com" style={{ fontSize: 20, color: 'blue', textDecoration: 'underline' }}>
          CLICK ME — if this doesn&apos;t work, the issue is outside React
        </a>
      </div>
      <Navbar />
      <Hero />
      <Trust />
      <CategoryMarquee />
      <VendorSearch />
      <PricingComparison />
      <DoMore />
      <Business />
      <Features />
      <Testimonials />
      <Faq />
      <Cta />
      <Footer />
    </div>
  )
}
