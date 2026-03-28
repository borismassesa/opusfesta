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
      {/* DEBUG: test if any button works */}
      <button
        style={{ position: 'fixed', top: 10, right: 10, zIndex: 99999, background: 'red', color: 'white', padding: '10px 20px', fontSize: 16, border: 'none', borderRadius: 8, cursor: 'pointer' }}
        onClick={() => alert('TEST BUTTON WORKS')}
      >
        TEST
      </button>
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
