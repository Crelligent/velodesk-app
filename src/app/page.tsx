import HeroV2 from '@/components/landing/HeroV2'
import StatsStrip from '@/components/landing/StatsStrip'
import HowItWorks from '@/components/landing/HowItWorks'
import TheContrast from '@/components/landing/TheContrast'
import ScoreDimensions from '@/components/landing/ScoreDimensions'
import TrustedBy from '@/components/landing/TrustedBy'
import TrustpilotWidget from '@/components/landing/TrustpilotWidget'
import TrustpilotUseCases from '@/components/landing/TrustpilotUseCases'
import BenchmarksFeature from '@/components/landing/BenchmarksFeature'
import DataroomFeature from '@/components/landing/DataroomFeature'
import PersonaTabs from '@/components/landing/PersonaTabs'
import AcceleratorPartners from '@/components/landing/AcceleratorPartners'
import ForAccelerators from '@/components/landing/ForAccelerators'
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
      <TrustedBy />
      <TrustpilotWidget />
      <TrustpilotUseCases />
      <PersonaTabs />
      <AcceleratorPartners />
      <ForAccelerators />
      <DataroomFeature />
      <ChangelogTeaser />
      <Footer />
    </main>
  )
}
