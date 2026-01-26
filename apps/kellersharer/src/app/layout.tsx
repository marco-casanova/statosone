import type { Metadata } from "next";
import { ToastProvider } from "@stratos/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "KellerSharer - Rent Unused Spaces",
  description: "List and rent unused physical spaces. Basements, garages, storage rooms and more.",
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
