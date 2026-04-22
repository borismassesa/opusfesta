import Hero from '@/components/Hero'
import Pillars from '@/components/Pillars'
import Problem from '@/components/Problem'
import Platform from '@/components/Platform'
import WhoWeServe from '@/components/WhoWeServe'
import Quote from '@/components/Quote'
import Opportunity from '@/components/Opportunity'
import CtaWaitlist from '@/components/CtaWaitlist'

export default function Home() {
  return (
    <div className="font-sans text-[#1A1A1A] bg-[#FFFFFF] selection:bg-[var(--accent)] selection:text-[var(--on-accent)]">
      <Hero />
      <Pillars />
      <Problem />
      <Platform />
      <WhoWeServe />
      <Quote />
      <Opportunity />
      <CtaWaitlist />
    </div>
  )
}
