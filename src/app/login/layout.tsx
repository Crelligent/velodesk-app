import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Sign in to your Velodesk account to access your PMF dashboard, analytics, and AI-powered insights.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
