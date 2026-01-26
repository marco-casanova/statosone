import { requireAuth } from "@stratos/auth";
import { AuthProvider } from "@stratos/auth";
import { ToastProvider } from "@stratos/ui";

export const metadata = {
  title: "Dashboard - StratosTalent",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth guard - redirects to /login if not authenticated
  await requireAuth({ redirectTo: "/login" });

  return (
    <AuthProvider>
      <ToastProvider>
        <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
          {children}
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
