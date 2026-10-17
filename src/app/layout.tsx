import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

/**
 * Fonts are self-hosted variable woff2 (latin subset only) rather than pulled
 * from `next/font/google`: it removes a third-party request from the critical
 * path, and one variable file covers the whole weight range we use.
 */
const display = localFont({
  src: "./fonts/cormorant-garamond-var.woff2",
  weight: "300 600",
  style: "normal",
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const sans = localFont({
  src: "./fonts/jost-var.woff2",
  weight: "300 500",
  style: "normal",
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Sanskar & Kabir — Couture Atelier, New Delhi",
    template: "%s | Sanskar & Kabir",
  },
  description:
    "A couture atelier in New Delhi. Hand-embroidered bridal lehengas, Benarasi handloom saris, sherwanis and festive separates, cut to measure.",
  keywords: [
    "bridal lehenga",
    "designer lehenga",
    "Benarasi saree",
    "sherwani",
    "Indian couture",
    "made to measure",
    "New Delhi atelier",
  ],
  openGraph: {
    type: "website",
    siteName: "Sanskar & Kabir",
    title: "Sanskar & Kabir — Couture Atelier, New Delhi",
    description:
      "Hand-embroidered bridal and festive couture, made to measure in our Delhi atelier.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#3E2516",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
