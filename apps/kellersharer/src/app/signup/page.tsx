"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@stratos/auth";
import { Button, Input, Card, useToast } from "@stratos/ui";
import { Home, Search, ArrowLeft, ArrowRight } from "lucide-react";
import type { UserType } from "@/types";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIntent = searchParams.get("intent") as UserType | null;

  const { signUp, loading } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState<"type" | "details">(
    initialIntent ? "details" : "type",
  );
  const [userType, setUserType] = useState<UserType | null>(initialIntent);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!userType) {
      toast.error("Please select an account type");
      return;
    }

    const { error } = await signUp(email, password);
    if (error) {
      toast.error(error.message);
      return;
    }

    // Store user type in localStorage to create profile after email confirmation
    localStorage.setItem(
      "keller_signup_data",
      JSON.stringify({ userType, fullName }),
    );

    toast.success("Check your email to confirm your account");
    router.push("/login");
  }

  if (step === "type") {
    return (
      <div style={styles.container}>
        <Card padding="lg" style={styles.card}>
          <h1 style={styles.title}>Join KellerSharer</h1>
          <p style={styles.subtitle}>What brings you here?</p>

          <div style={styles.typeGrid}>
            <button
              type="button"
              onClick={() => {
                setUserType("renter");
                setStep("details");
              }}
              style={{
                ...styles.typeCard,
                borderColor: userType === "renter" ? "#10b981" : "#e5e7eb",
                backgroundColor: userType === "renter" ? "#f0fdf4" : "#ffffff",
              }}
            >
              <div style={styles.typeIcon}>
                <Home size={32} color="#10b981" />
              </div>
              <h3 style={styles.typeTitle}>I have space to rent</h3>
              <p style={styles.typeDesc}>
                List your basement, garage, attic or storage room and earn money
                from unused space
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setUserType("searcher");
                setStep("details");
              }}
              style={{
                ...styles.typeCard,
                borderColor: userType === "searcher" ? "#10b981" : "#e5e7eb",
                backgroundColor:
                  userType === "searcher" ? "#f0fdf4" : "#ffffff",
              }}
            >
              <div style={styles.typeIcon}>
                <Search size={32} color="#3b82f6" />
              </div>
              <h3 style={styles.typeTitle}>I'm looking for space</h3>
              <p style={styles.typeDesc}>
                Find affordable storage, workspace, or parking near you at great
                prices
              </p>
            </button>
          </div>

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link href="/login" style={styles.link}>
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Card padding="lg" style={styles.card}>
        <button
          type="button"
          onClick={() => setStep("type")}
          style={styles.backButton}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={styles.selectedType}>
          {userType === "renter" ? (
            <>
              <Home size={24} color="#10b981" />
              <span>Space Owner</span>
            </>
          ) : (
            <>
              <Search size={24} color="#3b82f6" />
              <span>Space Seeker</span>
            </>
          )}
        </div>

        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>
          {userType === "renter"
            ? "Start earning from your unused space"
            : "Find the perfect space for your needs"}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Input
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="At least 8 characters"
            required
          />
          <Button type="submit" loading={loading} style={{ width: "100%" }}>
            Create Account <ArrowRight size={16} />
          </Button>
        </form>

        <p style={styles.terms}>
          By signing up, you agree to our{" "}
          <Link href="/terms" style={styles.link}>
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" style={styles.link}>
            Privacy Policy
          </Link>
        </p>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
      </Card>
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
    backgroundColor: "#f0fdf4",
  },
  card: { width: "100%", maxWidth: "480px" },
  title: {
    fontSize: "1.5rem",
    fontWeight: 600,
    textAlign: "center",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "2rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  footer: {
    fontSize: "0.875rem",
    color: "#6b7280",
    textAlign: "center",
    marginTop: "1.5rem",
  },
  link: { color: "#10b981", textDecoration: "none", fontWeight: 500 },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  typeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "1.5rem 1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "#ffffff",
    textAlign: "center",
  },
  typeIcon: {
    marginBottom: "0.75rem",
  },
  typeTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
    color: "#111827",
  },
  typeDesc: {
    fontSize: "0.75rem",
    color: "#6b7280",
    lineHeight: 1.4,
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "none",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: "0.875rem",
    marginBottom: "1rem",
  },
  selectedType: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#f3f4f6",
    borderRadius: "20px",
    width: "fit-content",
    margin: "0 auto 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  terms: {
    fontSize: "0.75rem",
    color: "#9ca3af",
    textAlign: "center",
    marginTop: "1rem",
  },
};
