import { AuthProvider } from "@stratos/auth";
import { ToastProvider } from "@stratos/ui";

export const metadata = {
  title: "Complete Your Profile - KellerSharer",
};

export default function OnboardingLayout({
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
