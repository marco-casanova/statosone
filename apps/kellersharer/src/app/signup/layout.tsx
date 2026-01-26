import { AuthProvider } from "@stratos/auth";
import { ToastProvider } from "@stratos/ui";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
