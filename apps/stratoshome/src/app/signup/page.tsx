"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@stratos/auth";
import { Button, Input, Card, useToast } from "@stratos/ui";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "renter";
  const { signUp, loading } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    const { error } = await signUp(email, password);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your email to confirm");
    router.push("/login");
  }

  return (
    <div style={styles.container}>
      <Card padding="lg" style={styles.card}>
        <h1 style={styles.title}>
          {role === "landlord" ? "Landlord Registration" : "Create Your Profile"}
        </h1>
        <p style={styles.subtitle}>
          {role === "landlord" 
            ? "Start browsing verified renters" 
            : "Let landlords find you"}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} hint="At least 8 characters" required />
          <Button type="submit" loading={loading} style={{ width: "100%" }}>
            {role === "landlord" ? "Register as Landlord" : "Create Profile"}
          </Button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link href="/login" style={styles.link}>Sign in</Link>
        </p>
      </Card>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backgroundColor: "#eff6ff" },
  card: { width: "100%", maxWidth: "400px" },
  title: { fontSize: "1.5rem", fontWeight: 600, textAlign: "center", marginBottom: "0.5rem" },
  subtitle: { fontSize: "0.875rem", color: "#6b7280", textAlign: "center", marginBottom: "2rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  footer: { fontSize: "0.875rem", color: "#6b7280", textAlign: "center", marginTop: "1.5rem" },
  link: { color: "#3b82f6", textDecoration: "none", fontWeight: 500 },
};
