import type { Metadata } from "next";
import { ToastProvider } from "@stratos/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "StratosTalent - Rent Top Developers",
  description: "Find and rent skilled developers for your projects. Fast, reliable, and hassle-free.",
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
