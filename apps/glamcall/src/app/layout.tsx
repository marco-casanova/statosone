import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://glamcall.io"),
  title: {
    default: "GlamCall — Remote Beauty Consultants for Retail Stores",
    template: "%s | GlamCall",
  },
  description:
    "Connect your retail store with expert remote beauty consultants via instant video calls. Elevate customer experience with personalized beauty advice.",
  keywords: [
    "beauty consultant",
    "remote consultation",
    "retail beauty",
    "video call",
    "beauty advisor",
    "cosmetics consultation",
    "makeup advice",
    "skincare consultant",
    "retail technology",
    "customer experience",
  ],
  authors: [{ name: "GlamCall" }],
  creator: "GlamCall",
  publisher: "GlamCall",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://glamcall.io",
    siteName: "GlamCall",
    title: "GlamCall — Remote Beauty Consultants for Retail Stores",
    description:
      "Connect your retail store with expert remote beauty consultants via instant video calls.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GlamCall - Beauty Consultation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GlamCall — Remote Beauty Consultants",
    description:
      "Expert beauty consultations for retail stores via instant video calls.",
    images: ["/og-image.png"],
    creator: "@glamcall",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
