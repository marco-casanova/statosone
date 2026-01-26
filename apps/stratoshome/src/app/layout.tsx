import type { Metadata } from "next";
import { ToastProvider } from "@stratos/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "StratosHome - Let Renters Find You",
  description: "The inverted real estate platform. Create your profile, and let landlords contact you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
