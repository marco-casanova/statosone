import { KinRelayRegisterForm } from "@/components/KinRelayRegisterForm";

export default function SignupPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#88B9B0",
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
