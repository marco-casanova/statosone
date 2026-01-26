"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logo}>✉️</div>
          <h1 style={styles.title}>Check Your Email</h1>
          <p style={styles.subtitle}>
            We&apos;ve sent a confirmation link to <strong>{email}</strong>
          </p>
          <Link href="/login" style={styles.buttonLink}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🌙</div>
        <h1 style={styles.title}>Start Your Free Trial</h1>
        <p style={styles.subtitle}>7 days free, then $9.99/month</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="you@example.com"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
            />
            <span style={styles.hint}>At least 8 characters</span>
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Creating account..." : "Start Free Trial"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
    backgroundColor: "white",
    borderRadius: "1rem",
    padding: "2rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  logo: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "2rem",
  },
  error: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "0.75rem",
    borderRadius: "0.5rem",
    marginBottom: "1rem",
    fontSize: "0.875rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    textAlign: "left",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    padding: "0.75rem 1rem",
    borderRadius: "0.5rem",
    border: "1px solid #d1d5db",
    fontSize: "1rem",
    outline: "none",
  },
  hint: {
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
  button: {
    padding: "0.75rem 1rem",
    borderRadius: "0.5rem",
    border: "none",
    backgroundColor: "#7c3aed",
    color: "white",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  buttonLink: {
    display: "inline-block",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    backgroundColor: "#7c3aed",
    color: "white",
    fontSize: "1rem",
    fontWeight: 500,
    textDecoration: "none",
    marginTop: "1rem",
  },
  footer: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginTop: "1.5rem",
  },
  link: {
    color: "#7c3aed",
    textDecoration: "none",
    fontWeight: 500,
  },
};
