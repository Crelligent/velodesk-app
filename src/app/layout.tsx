import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Outfit } from "next/font/google";
import "./globals.css";

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
  weight: ["100", "200", "300", "400", "500"],
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
    "Measure, validate, and optimize your path to product-market fit with real-time PMF scoring and AI insights. Connect Stripe, Mixpanel, HubSpot and 20+ tools.",
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
      "Prove product-market fit in one link. Generate a verified PMF Score backed by your actual data from Stripe, Mixpanel, and more.",
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
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "49",
          priceCurrency: "USD",
          billingIncrement: "month",
        },
        {
          "@type": "Offer",
          name: "Enterprise",
          price: "0",
          priceCurrency: "USD",
          description: "Custom pricing",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "500",
        bestRating: "5",
      },
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
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${outfit.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
