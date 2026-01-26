import { KinRelayRegisterForm } from "@/components/KinRelayRegisterForm";

export default function SignupPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 40% 30%, #1e293b, #0f172a)",
        padding: "40px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <KinRelayRegisterForm />
    </div>
  );
}
