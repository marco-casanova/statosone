import { requireAuth } from "@stratos/auth";
import { AuthProvider } from "@stratos/auth";
import { ToastProvider } from "@stratos/ui";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard - KellerSharer",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth({ redirectTo: "/login" });

  // Check if user has completed profile setup
  const profile = await getProfile();

  // If no profile, redirect to onboarding
  // Note: This might cause redirect loops during signup, handle in onboarding page

  return (
    <AuthProvider>
      <ToastProvider>
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
            display: "flex",
          }}
        >
          {children}
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
