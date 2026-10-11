import HeroV2 from '@/components/landing/HeroV2'
import StatsStrip from '@/components/landing/StatsStrip'
import HowItWorks from '@/components/landing/HowItWorks'
import TheContrast from '@/components/landing/TheContrast'
import DashboardFeature from '@/components/landing/DashboardFeature'
import VelodeskAI from '@/components/landing/VelodeskAI'
import ScoreDimensions from '@/components/landing/ScoreDimensions'
import DataroomFeature from '@/components/landing/DataroomFeature'
import PersonaTabs from '@/components/landing/PersonaTabs'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#04060D] flex flex-col">
      <HeroV2 />
      <StatsStrip />
      <HowItWorks />
      <TheContrast />
      <DashboardFeature />
      <VelodeskAI />
      <ScoreDimensions />
      <PersonaTabs />
      <DataroomFeature />
      <Footer />
    </main>
  )
}
