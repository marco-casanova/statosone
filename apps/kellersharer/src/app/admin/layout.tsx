import { requireRole } from "@stratos/auth";
import { AuthProvider } from "@stratos/auth";
import { ToastProvider } from "@stratos/ui";

export const metadata = {
  title: "Admin - KellerSharer",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin", { redirectTo: "/app" });

  return (
    <AuthProvider>
      <ToastProvider>
        <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
          {children}
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
