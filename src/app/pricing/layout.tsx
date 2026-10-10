import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Velodesk. Founder plan US$15 (₦30,000) and Startup plan US$49 (₦50,000) per month, with a 14-day free trial and no credit card required. Custom Enterprise pricing.",
  openGraph: {
    title: "Pricing | Velodesk",
    description:
      "Simple, transparent pricing with a 14-day free trial, no credit card required. PMF scoring, AI insights, and investor-ready reports.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
