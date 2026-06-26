import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your free Velodesk account. No credit card required. Get your PMF Score in under 2 minutes with a 14-day free trial.",
  openGraph: {
    title: "Start Your Free Trial | Velodesk",
    description:
      "Create your free account and prove product-market fit in minutes. No credit card required.",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
