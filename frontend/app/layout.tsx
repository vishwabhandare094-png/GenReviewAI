import type { Metadata } from "next";
import { Fraunces, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-worksans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plexmono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://genreviewai-frontend.onrender.com"),
  title: {
    default: "GenReviewAI | Restaurant Review Automation",
    template: "%s | GenReviewAI",
  },
  description:
    "GenReviewAI helps restaurants collect Google reviews, route low ratings to private feedback, and manage QR campaigns from one dashboard.",
  keywords: [
    "restaurant review software",
    "Google review QR code",
    "AI review generator",
    "customer feedback",
    "restaurant reputation management",
  ],
  applicationName: "GenReviewAI",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GenReviewAI | Restaurant Review Automation",
    description:
      "Collect public reviews from happy guests and private feedback from unhappy ones with stable printable QR codes.",
    url: "https://genreviewai-frontend.onrender.com",
    siteName: "GenReviewAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GenReviewAI | Restaurant Review Automation",
    description:
      "Stable QR review links, AI review drafts, low-rating alerts, and owner analytics for restaurants.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
