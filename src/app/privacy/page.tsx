import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Velodesk Privacy Policy — how we collect, use, and protect your data.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="px-8 py-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-light">
            <span className="text-[#22c55e]">Velo</span>desk
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 bg-[#22c55e] rounded hover:bg-[#16a34a] transition"
          >
            Start Free
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-extralight mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-12">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="space-y-10 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-light text-white mb-4">
              1. Information We Collect
            </h2>
            <p>
              When you create a Velodesk account, we collect your name, email
              address, company name, and any other information you provide
              during onboarding. We also collect usage data, analytics, and
              information from third-party integrations you connect (such as
              Stripe, Mixpanel, HubSpot, and others) to calculate your PMF
              Score.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">
              2. How We Use Your Information
            </h2>
            <p>
              We use your information to provide, maintain, and improve
              Velodesk&apos;s services, including calculating your Product-Market
              Fit score, generating reports, and delivering AI-powered insights.
              We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">
              3. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your
              data. All data is encrypted in transit using TLS and at rest. We
              use Supabase for secure data storage with row-level security
              policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">
              4. Third-Party Integrations
            </h2>
            <p>
              When you connect third-party services, we access only the data
              necessary to calculate your PMF metrics. You can disconnect any
              integration at any time from your dashboard settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">
              5. Your Rights
            </h2>
            <p>
              You have the right to access, correct, or delete your personal
              data at any time. You can export your data or request account
              deletion by contacting us at{" "}
              <a
                href="mailto:support@velodesk.io"
                className="text-[#22c55e] hover:underline"
              >
                support@velodesk.io
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">
              6. Contact Us
            </h2>
            <p>
              If you have questions about this privacy policy, contact us at{" "}
              <a
                href="mailto:support@velodesk.io"
                className="text-[#22c55e] hover:underline"
              >
                support@velodesk.io
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="py-12 px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Velodesk. A Crelligent Product.
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
