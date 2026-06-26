import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Velodesk Terms of Service — the terms and conditions governing your use of the platform.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-extralight mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-12">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="space-y-10 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-light text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Velodesk, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, you may not
              use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">
              2. Description of Service
            </h2>
            <p>
              Velodesk is an AI-powered Product-Market Fit platform that helps
              startups and product teams measure, validate, and optimize their
              path to product-market fit. The service includes PMF scoring,
              analytics, AI insights, integrations with third-party tools, and
              investor-ready reporting.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">
              3. Account Registration
            </h2>
            <p>
              You must provide accurate and complete information when creating
              an account. You are responsible for maintaining the
              confidentiality of your account credentials and for all activities
              that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">
              4. Subscriptions and Billing
            </h2>
            <p>
              Velodesk offers Free, Pro, and Enterprise plans. Paid
              subscriptions are billed monthly or annually. You may cancel your
              subscription at any time. Refunds are handled on a case-by-case
              basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">
              5. Data and Integrations
            </h2>
            <p>
              You grant Velodesk permission to access data from third-party
              services you connect. You retain ownership of all your data. We
              process your data solely to provide the Velodesk service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">
              6. Limitation of Liability
            </h2>
            <p>
              Velodesk is provided &ldquo;as is&rdquo; without warranties of any kind. We
              are not liable for any indirect, incidental, or consequential
              damages arising from your use of the service. Our total liability
              is limited to the amount you paid in the preceding 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">
              7. Termination
            </h2>
            <p>
              We may suspend or terminate your account if you violate these
              terms. You may delete your account at any time. Upon termination,
              your data will be deleted within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">
              8. Contact
            </h2>
            <p>
              For questions about these terms, contact us at{" "}
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
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="text-white">Terms</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
