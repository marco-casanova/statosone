import { AuthProvider } from "@stratos/auth";
import { ToastProvider } from "@stratos/ui";

export const metadata = {
  title: "Sign Up - StratosTalent",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
