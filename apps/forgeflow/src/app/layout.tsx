import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ForgeFlow — 3D Printing Made Easy",
    template: "%s | ForgeFlow",
  },
  description:
    "Upload your 3D models, get instant quotes, and have them printed and delivered to your door.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002",
  ),
  keywords: [
    "3D printing",
    "STL",
    "OBJ",
    "custom printing",
    "rapid prototyping",
  ],
  authors: [{ name: "ForgeFlow" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ForgeFlow",
    title: "ForgeFlow — 3D Printing Made Easy",
    description:
      "Upload your 3D models, get instant quotes, and have them printed and delivered to your door.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ForgeFlow — 3D Printing Made Easy",
    description:
      "Upload your 3D models, get instant quotes, and have them printed and delivered to your door.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
