import HeroV2 from '@/components/landing/HeroV2'
import StatsStrip from '@/components/landing/StatsStrip'
import HowItWorks from '@/components/landing/HowItWorks'
import TheContrast from '@/components/landing/TheContrast'
import ScoreDimensions from '@/components/landing/ScoreDimensions'
import BenchmarksFeature from '@/components/landing/BenchmarksFeature'
import DataroomFeature from '@/components/landing/DataroomFeature'
import PersonaTabs from '@/components/landing/PersonaTabs'
import ChangelogTeaser from '@/components/landing/ChangelogTeaser'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#04060D] flex flex-col">
      <HeroV2 />
      <StatsStrip />
      <HowItWorks />
      <TheContrast />
      <BenchmarksFeature />
      <ScoreDimensions />
      <PersonaTabs />
            <DataroomFeature />
      <ChangelogTeaser />
      <Footer />
    </main>
  )
}
