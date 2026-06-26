import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Velodesk. Start free and upgrade when you need more. Plans from $0 to Enterprise with custom pricing.",
  openGraph: {
    title: "Pricing | Velodesk",
    description:
      "Simple, transparent pricing. Start free, upgrade when you need more. PMF scoring, AI insights, and investor-ready reports.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
