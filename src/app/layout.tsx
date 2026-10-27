import type { Metadata } from "next";
import { DM_Mono, Geist, Geist_Mono, Instrument_Serif, Inter, Orbitron, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ConsentScripts } from '@/components/privacy/ConsentScripts';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
});

// Homepage display fonts (were loaded with a CSS @import in HeroV2)
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://velodesk.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Velodesk - AI-Powered Product-Market Fit Platform",
    template: "%s | Velodesk",
  },
  description:
    "Measure, validate, and optimize your path to product-market fit with PMF scoring and AI insights. Connect Paystack or Stripe to score your real payment data.",
  keywords: [
    "product-market fit",
    "PMF score",
    "startup analytics",
    "investor reporting",
    "retention analysis",
    "growth metrics",
    "AI insights",
    "SaaS analytics",
  ],
  authors: [{ name: "Velodesk", url: siteUrl }],
  creator: "Crelligent",
  publisher: "Velodesk",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Velodesk",
    title: "Velodesk - AI-Powered Product-Market Fit Platform",
    description:
      "Prove product-market fit in one link. Generate a verified PMF Score backed by your actual payment data from Paystack or Stripe.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Velodesk — Prove Product-Market Fit in One Link",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Velodesk - AI-Powered Product-Market Fit Platform",
    description:
      "Prove product-market fit in one link. Generate a verified PMF Score backed by your actual data.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: "/icon.png",
  },
};

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Velodesk",
      url: siteUrl,
      logo: `${siteUrl}/og-image.png`,
      description:
        "AI-powered Product-Market Fit platform for startups and product teams.",
      parentOrganization: {
        "@type": "Organization",
        name: "Crelligent",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "Velodesk",
      url: siteUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Measure, validate, and optimize your path to product-market fit with real-time PMF scoring and AI insights.",
      // Mirrors planData in src/app/pricing/page.tsx — update both together.
      // No aggregateRating: only add one backed by real, published reviews.
      offers: [
        {
          "@type": "Offer",
          name: "Founder plan",
          price: "15",
          priceCurrency: "USD",
          description: "Billed monthly. 14-day free trial, no credit card required.",
        },
        {
          "@type": "Offer",
          name: "Founder plan",
          price: "30000",
          priceCurrency: "NGN",
          description: "Billed monthly. 14-day free trial, no credit card required.",
        },
        {
          "@type": "Offer",
          name: "Startup plan",
          price: "49",
          priceCurrency: "USD",
          description: "Billed monthly. 14-day free trial, no credit card required.",
        },
        {
          "@type": "Offer",
          name: "Startup plan",
          price: "50000",
          priceCurrency: "NGN",
          description: "Billed monthly. 14-day free trial, no credit card required.",
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Velodesk",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
            <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${outfit.variable} ${instrumentSerif.variable} ${orbitron.variable} ${dmMono.variable} antialiased`}
      >
        <ConsentScripts />
{children}


      </body>
    </html>
  );
}
