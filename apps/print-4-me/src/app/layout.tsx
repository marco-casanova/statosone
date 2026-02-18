import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: {
    default: "Print-4-Me — 3D Printing Made Easy",
    template: "%s | Print-4-Me",
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
  authors: [{ name: "Print-4-Me" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Print-4-Me",
    title: "Print-4-Me — 3D Printing Made Easy",
    description:
      "Upload your 3D models, get instant quotes, and have them printed and delivered to your door.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Print-4-Me — 3D Printing Made Easy",
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
      <body className="antialiased" suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
