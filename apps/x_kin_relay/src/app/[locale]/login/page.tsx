"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase, hasSupabase } from "@/lib/supabaseClient";
import { useToast } from "../../../components/Toast";

export default function LoginPage() {
  const t = useTranslations();
  const { push } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if already logged in
  useEffect(() => {
    async function checkSession() {
      if (!hasSupabase || !supabase) {
        setCheckingSession(false);
        return;
      }
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          router.replace(`/${locale}/app?view=dashboard`);
          return;
        }
      } catch (e) {
        console.error("Session check failed:", e);
      }
      setCheckingSession(false);
    }
    checkSession();
  }, [router, locale]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSupabase || !supabase) {
      push("Auth disabled (demo mode). Redirecting...", "info");
      router.replace(`/${locale}/app?view=dashboard`);
      return;
    }
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setLoading(false);
        push(error.message, "error");
        return;
      }
      // Success - redirect immediately (cookies are handled by @supabase/ssr)
      push("Login successful!", "success");
      console.log("Login successful, session:", data.session?.user?.email);

      // Client navigation first; hard reload fallback for cookie/session edge cases.
      router.replace(`/${locale}/app?view=dashboard`);
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.assign(`/${locale}/app?view=dashboard`);
        }
      }, 250);
    } catch (err) {
      push("Login failed. Please try again.", "error");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Show loading while checking session
  if (checkingSession) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#88B9B0",
          color: "#1A1A1A",
        }}
      >
        Loading...
      </main>
    );
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSupabase || !supabase) return;
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    });
    setSendingReset(false);
    if (error) {
      push(error.message, "error");
    } else {
      push(t("auth.reset_link_sent"), "success");
      setShowReset(false);
    }
  }

  return (
    <main style={styles.main}>
      {/* Decorative elements */}
      <div style={styles.decorCircle1} />
      <div style={styles.decorCircle2} />

      <div style={styles.card}>
        <Link href={`/${locale}`} style={styles.backLink}>
          <span style={styles.backIcon}>←</span>
          {t("common.back") || "Back"}
        </Link>

        {/* Logo/Brand area */}
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>🏠</div>
          <h1 style={styles.brandName}>KinRelay</h1>
        </div>

        <h2 style={styles.title}>{t("auth.login")}</h2>
        <p style={styles.subtitle}>Welcome back! Please sign in to continue.</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>{t("register.email")}</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              autoComplete="email"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>{t("register.password")}</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              minLength={6}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? (
              <span style={styles.spinner}>⟳</span>
            ) : (
              <>
                Sign In
                <span style={styles.buttonArrow}>→</span>
              </>
            )}
          </button>
        </form>

        <div style={styles.links}>
          <button
            type="button"
            onClick={() => setShowReset(true)}
            style={styles.linkButton}
          >
            {t("auth.forgot")}
          </button>
          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <span style={styles.dividerLine} />
          </div>
          <Link href={`/${locale}/signup`} style={styles.signupLink}>
            {t("auth.no_account") || "Don't have an account?"}{" "}
            <strong>Sign up</strong>
          </Link>
        </div>
      </div>

      {showReset && (
        <div style={styles.modalOverlay} onClick={() => setShowReset(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowReset(false)}
              style={styles.modalClose}
            >
              ×
            </button>
            <div style={styles.modalIcon}>🔐</div>
            <h3 style={styles.modalTitle}>{t("auth.reset_password")}</h3>
            <p style={styles.modalSubtitle}>
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={handleResetPassword} style={styles.form}>
              <div style={styles.inputGroup}>
                <input
                  type="email"
                  required
                  placeholder={t("register.email")}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  style={styles.input}
                />
              </div>
              <button
                type="submit"
                disabled={sendingReset}
                style={styles.button}
              >
                {sendingReset
                  ? "Sending..."
                  : t("auth.send_reset_link") || "Send Reset Link"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #88B9B0 0%, #6DA19A 50%, #5A8B84 100%)",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  },
  decorCircle1: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "rgba(245, 213, 71, 0.15)",
    top: -100,
    right: -100,
    filter: "blur(60px)",
  },
  decorCircle2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.1)",
    bottom: -80,
    left: -80,
    filter: "blur(40px)",
  },
  card: {
    background: "rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(24px)",
    borderRadius: 28,
    padding: "48px 40px",
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 24px 48px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    position: "relative",
    zIndex: 1,
  },
  backLink: {
    color: "#4A4A4A",
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
    alignSelf: "flex-start",
    transition: "color 0.2s ease",
  },
  backIcon: {
    fontSize: 18,
  },
  logoArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 800,
    color: "#1A1A1A",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  title: {
    color: "#1A1A1A",
    fontSize: 22,
    fontWeight: 600,
    margin: 0,
    marginBottom: 8,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    margin: 0,
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    width: "100%",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "16px 18px",
    borderRadius: 14,
    border: "2px solid rgba(0, 0, 0, 0.1)",
    background: "rgba(255, 255, 255, 0.8)",
    color: "#1A1A1A",
    fontSize: 16,
    outline: "none",
    transition: "all 0.2s ease",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "18px 24px",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg, #F5D547 0%, #E5C537 100%)",
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 8,
    boxShadow: "0 8px 24px rgba(245, 213, 71, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    transition: "all 0.2s ease",
  },
  buttonArrow: {
    fontSize: 20,
    fontWeight: 400,
  },
  spinner: {
    display: "inline-block",
    animation: "spin 1s linear infinite",
    fontSize: 20,
  },
  links: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginTop: 28,
    alignItems: "center",
    width: "100%",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#6B7280",
    fontSize: 14,
    cursor: "pointer",
    textDecoration: "none",
    fontWeight: 500,
    transition: "color 0.2s ease",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "rgba(0, 0, 0, 0.1)",
  },
  dividerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  signupLink: {
    color: "#1A1A1A",
    fontSize: 14,
    textDecoration: "none",
    fontWeight: 500,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 24,
  },
  modal: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(24px)",
    borderRadius: 24,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 400,
    color: "#1A1A1A",
    textAlign: "center",
    position: "relative",
    boxShadow: "0 24px 48px rgba(0, 0, 0, 0.2)",
  },
  modalClose: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: "rgba(0, 0, 0, 0.05)",
    color: "#6B7280",
    fontSize: 24,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    margin: 0,
    marginBottom: 24,
  },
};
