"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@stratos/auth";
import { Button, Card, Input, useToast } from "@stratos/ui";
import { Home, Search, MapPin, Phone, User } from "lucide-react";
import { createProfile } from "@/actions";
import type { UserType } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState<"type" | "details">("type");
  const [userType, setUserType] = useState<UserType | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for saved signup data
    const savedData = localStorage.getItem("keller_signup_data");
    if (savedData) {
      const { userType: savedType, fullName: savedName } =
        JSON.parse(savedData);
      if (savedType) {
        setUserType(savedType);
        setStep("details");
      }
      if (savedName) {
        setFullName(savedName);
      }
      localStorage.removeItem("keller_signup_data");
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userType) {
      toast.error("Please select an account type");
      return;
    }

    setLoading(true);
    const { error } = await createProfile(userType, fullName);
    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Profile created! Welcome to KellerSharer");
    router.push("/app");
  }

  if (authLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (step === "type") {
    return (
      <div style={styles.container}>
        <Card padding="lg" style={styles.card}>
          <h1 style={styles.title}>Welcome to KellerSharer! 🎉</h1>
          <p style={styles.subtitle}>
            Let's set up your account. What would you like to do?
          </p>

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
              }}
            >
              <div style={styles.typeIcon}>
                <Home size={40} color="#10b981" />
              </div>
              <h3 style={styles.typeTitle}>Rent out my space</h3>
              <p style={styles.typeDesc}>
                I have a basement, garage, attic, or storage room I want to rent
                out
              </p>
              <ul style={styles.benefits}>
                <li>✓ Earn passive income</li>
                <li>✓ Set your own prices</li>
                <li>✓ Secure payments</li>
              </ul>
            </button>

            <button
              type="button"
              onClick={() => {
                setUserType("searcher");
                setStep("details");
              }}
              style={{
                ...styles.typeCard,
                borderColor: userType === "searcher" ? "#3b82f6" : "#e5e7eb",
              }}
            >
              <div style={styles.typeIcon}>
                <Search size={40} color="#3b82f6" />
              </div>
              <h3 style={styles.typeTitle}>Find a space</h3>
              <p style={styles.typeDesc}>
                I'm looking for affordable storage, workspace, or parking
              </p>
              <ul style={styles.benefits}>
                <li>✓ Affordable prices</li>
                <li>✓ Local spaces</li>
                <li>✓ Flexible terms</li>
              </ul>
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Card padding="lg" style={styles.card}>
        <div style={styles.selectedType}>
          {userType === "renter" ? (
            <>
              <Home size={20} color="#10b981" />
              <span>Space Owner</span>
            </>
          ) : (
            <>
              <Search size={20} color="#3b82f6" />
              <span>Space Seeker</span>
            </>
          )}
        </div>

        <h1 style={styles.title}>Complete Your Profile</h1>
        <p style={styles.subtitle}>Help others get to know you</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <User size={18} color="#6b7280" style={styles.inputIcon} />
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Phone size={18} color="#6b7280" style={styles.inputIcon} />
            <Input
              label="Phone (optional)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+49 123 456 789"
            />
          </div>

          <div style={styles.inputGroup}>
            <MapPin size={18} color="#6b7280" style={styles.inputIcon} />
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Berlin, Germany"
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            Complete Setup
          </Button>

          <button
            type="button"
            onClick={() => setStep("type")}
            style={styles.backLink}
          >
            ← Change account type
          </button>
        </form>
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
  loading: {
    color: "#6b7280",
    fontSize: "1rem",
  },
  card: { width: "100%", maxWidth: "560px" },
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
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  typeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "1.5rem",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "#ffffff",
    textAlign: "center",
  },
  typeIcon: {
    marginBottom: "1rem",
    padding: "1rem",
    backgroundColor: "#f9fafb",
    borderRadius: "50%",
  },
  typeTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
    color: "#111827",
  },
  typeDesc: {
    fontSize: "0.8rem",
    color: "#6b7280",
    lineHeight: 1.4,
    marginBottom: "1rem",
  },
  benefits: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    fontSize: "0.75rem",
    color: "#10b981",
    textAlign: "left",
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
  inputGroup: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    top: "38px",
    zIndex: 1,
  },
  backLink: {
    background: "none",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: "0.875rem",
    textAlign: "center",
    marginTop: "0.5rem",
  },
};
