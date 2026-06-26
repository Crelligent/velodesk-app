import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Velodesk team. We'd love to hear from you — whether you have questions, feedback, or need enterprise support.",
  openGraph: {
    title: "Contact Us | Velodesk",
    description:
      "Get in touch with the Velodesk team for questions, feedback, or enterprise inquiries.",
  },
};

export default function ContactPage() {
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
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extralight mb-4">Get in Touch</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Have questions about Velodesk? Need help with your account? Want to
            discuss enterprise pricing? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 bg-white/[0.02] border border-white/10 rounded-lg text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#22c55e]/10 rounded-lg flex items-center justify-center">
              <span className="text-xl">📧</span>
            </div>
            <h2 className="font-medium mb-2">Email</h2>
            <a
              href="mailto:support@velodesk.io"
              className="text-sm text-[#22c55e] hover:underline"
            >
              support@velodesk.io
            </a>
          </div>

          <div className="p-8 bg-white/[0.02] border border-white/10 rounded-lg text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#22c55e]/10 rounded-lg flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
            <h2 className="font-medium mb-2">Help Center</h2>
            <p className="text-sm text-gray-400">
              Browse our documentation and FAQs
            </p>
          </div>

          <div className="p-8 bg-white/[0.02] border border-white/10 rounded-lg text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#22c55e]/10 rounded-lg flex items-center justify-center">
              <span className="text-xl">🏢</span>
            </div>
            <h2 className="font-medium mb-2">Enterprise</h2>
            <p className="text-sm text-gray-400">
              Custom plans, SSO, and dedicated support
            </p>
          </div>
        </div>

        <div className="max-w-lg mx-auto p-8 bg-white/[0.02] border border-white/10 rounded-lg">
          <h2 className="text-xl font-light mb-6 text-center">
            Send us a message
          </h2>
          <form className="space-y-5">
            <div>
              <label
                htmlFor="contact-name"
                className="block text-sm text-gray-400 mb-2"
              >
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded focus:outline-none focus:border-[#22c55e] transition"
                placeholder="Your name"
              />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="block text-sm text-gray-400 mb-2"
              >
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded focus:outline-none focus:border-[#22c55e] transition"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label
                htmlFor="contact-message"
                className="block text-sm text-gray-400 mb-2"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                rows={5}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded focus:outline-none focus:border-[#22c55e] transition resize-none"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#22c55e] text-black font-medium rounded hover:bg-[#16a34a] transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </main>

      <footer className="py-12 px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Velodesk. A Crelligent Product.
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms
            </Link>
            <Link href="/contact" className="text-white">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
