import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Button
} from '@react-email/components';

interface WelcomeEmailProps {
  userFirstName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://velodesk.crelligent.com';

export const WelcomeEmail = ({
  userFirstName = 'Founder',
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to VeloDesk. Uncover your true PMF score.</Preview>
      <Tailwind>
        <Body className="bg-[#050505] font-sans text-white my-auto mx-auto p-4">
          <Container className="bg-[#111111] border border-[#22c55e]/20 rounded-xl my-[40px] mx-auto overflow-hidden max-w-[600px]">
            
            {/* Hero Illustration */}
            <Img
              src={`${baseUrl}/static/email_hero_illustration.png`}
              width="600"
              height="300"
              alt="VeloDesk Abstract Intelligence"
              className="w-full object-cover"
            />
            
            <Section className="p-8">
              <Img
                src={`${baseUrl}/velodesk (2).png`}
                width="140"
                alt="VeloDesk Logo"
                className="mb-8"
              />

              <Heading className="text-white text-2xl font-light mb-6">
                Welcome to VeloDesk, {userFirstName}.
              </Heading>

              <Text className="text-gray-400 text-base leading-relaxed mb-6">
                You've successfully created your workspace. VeloDesk is designed to eliminate the guesswork of early-stage growth by connecting directly to your raw data and generating an actionable Product-Market Fit score.
              </Text>

              <Text className="text-gray-400 text-base leading-relaxed mb-8">
                Your next step is to connect your data sources. Our AI agent is standing by to ingest your Stripe and Mixpanel telemetry.
              </Text>

              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  className="bg-[#22c55e] text-black font-semibold rounded-lg px-8 py-4 text-center"
                  href={`${baseUrl}/onboarding`}
                >
                  Complete Setup
                </Button>
              </Section>

              <Hr className="border border-white/10 my-8" />

              <Text className="text-gray-500 text-xs leading-relaxed">
                If you have any questions or need a hand configuring your integrations, simply reply to this email or chat with the Agent Insight bot in your dashboard.
              </Text>

              <Text className="text-gray-500 text-xs font-light mt-4">
                © {new Date().getFullYear()} Crelligent. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
