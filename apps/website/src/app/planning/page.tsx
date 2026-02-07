import Header from '@/components/shadcn-studio/blocks/hero-section-40/header'
import HeroSection from '@/components/shadcn-studio/blocks/hero-section-40/hero-section-40'
import { defaultNavigationData } from '@/components/shadcn-studio/blocks/hero-section-40/navigation-data'

const PlanningPage = () => {
  return (
    <div className='orion-theme bg-background text-primary flex min-h-screen flex-col'>
      {/* Header Section */}
      <Header navigationData={defaultNavigationData} />

      {/* Main Content */}
      <main className='flex flex-col'>
        <HeroSection />
      </main>
    </div>
  )
}

export default PlanningPage
