import "./globals.css";
import GoogleAnalytics from "../components/GoogleAnalytics";
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <GoogleAnalytics />
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
