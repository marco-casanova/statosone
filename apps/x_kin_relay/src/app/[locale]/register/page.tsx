import RegisterForm from "@/components/RegisterForm";

export const dynamic = "force-static";

export default function RegisterPage() {
  return (
    <div style={{ padding: "40px 20px" }}>
      <RegisterForm />
    </div>
  );
}
