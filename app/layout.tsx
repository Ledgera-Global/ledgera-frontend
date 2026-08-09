import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "../lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// GA4 Measurement ID for the ledgerahq.com web data stream.
// Rendered server-side in <head> so Google's tag detection (which reads the raw
// HTML) and crawlers see the snippet. Override via NEXT_PUBLIC_GA_MEASUREMENT_ID.
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-00N56623LQ";

export const metadata: Metadata = {
  title: "Ledgera — Institutional Financial Intelligence",
  description:
    "Ledgera gives HVAC contractors real-time visibility into profit leakage, cash flow, technician efficiency, and recovery automation—so they can stop losing money and start scaling.",
  keywords: [
    "HVAC",
    "financial intelligence",
    "profit leakage",
    "cash flow",
    "contractor platform",
    "recovery automation",
    "ledgera",
  ],
  openGraph: {
    title: "Ledgera — Institutional Financial Intelligence",
    description:
      "Real-time profit leakage detection, cash flow visibility, and recovery automation for HVAC contractors.",
    type: "website",
    siteName: "Ledgera",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ledgera — Institutional Financial Intelligence",
    description:
      "Real-time profit leakage detection, cash flow visibility, and recovery automation for HVAC contractors.",
  },
  robots: { index: true, follow: true },
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
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
