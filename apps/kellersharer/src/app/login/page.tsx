"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@stratos/auth";
import { Button, Input, Card, useToast } from "@stratos/ui";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.push("/app");
  }

  return (
    <div style={styles.container}>
      <Card padding="lg" style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to KellerSharer</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" loading={loading} style={{ width: "100%" }}>Sign In</Button>
        </form>

        <p style={styles.footer}>
          New here? <Link href="/signup" style={styles.link}>Create account</Link>
        </p>
      </Card>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backgroundColor: "#f0fdf4" },
  card: { width: "100%", maxWidth: "400px" },
  title: { fontSize: "1.5rem", fontWeight: 600, textAlign: "center", marginBottom: "0.5rem" },
  subtitle: { fontSize: "0.875rem", color: "#6b7280", textAlign: "center", marginBottom: "2rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  footer: { fontSize: "0.875rem", color: "#6b7280", textAlign: "center", marginTop: "1.5rem" },
  link: { color: "#10b981", textDecoration: "none", fontWeight: 500 },
};
