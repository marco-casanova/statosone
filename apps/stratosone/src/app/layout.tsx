import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Stratos One – Product Studio for MVPs & Scalable Platforms",
    template: "%s | Stratos One",
  },
  description:
    "Stratos One is a product studio building and launching digital products. Studio-led builds with optional founder-led engagement.",
  keywords: [
    "product studio",
    "digital product studio",
    "MVP development studio",
    "SaaS MVP development",
    "founder-led product development",
    "fractional CTO product build",
    "Next.js startup development",
  ],
  authors: [{ name: "Stratos One" }],
  metadataBase: new URL("https://stratos.one"),
  openGraph: {
    type: "website",
    title: "Stratos One – Product Studio",
    description:
      "We build and launch digital products, from MVPs to scalable platforms.",
    url: "https://stratos.one",
    siteName: "Stratos One",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
