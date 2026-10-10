import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Start your 14-day Velodesk free trial. No credit card required. Connect Paystack or Stripe to get your PMF Score.",
  openGraph: {
    title: "Start Your Free Trial | Velodesk",
    description:
      "Start your 14-day free trial and measure product-market fit from your real data. No credit card required.",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
