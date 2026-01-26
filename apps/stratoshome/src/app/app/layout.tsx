import { requireAuth } from "@stratos/auth";
import { AuthProvider } from "@stratos/auth";
import { ToastProvider } from "@stratos/ui";

export const metadata = {
  title: "My Profile - StratosHome",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth({ redirectTo: "/login" });

  return (
    <AuthProvider>
      <ToastProvider>
        <div style={{ minHeight: "100vh", backgroundColor: "#eff6ff" }}>
          {children}
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
