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
      push("Auth disabled", "error");
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

      // Use window.location for full page reload to ensure cookies are read
      window.location.href = `/${locale}/app?view=dashboard`;
    } catch (err) {
      setLoading(false);
      push("Login failed. Please try again.", "error");
      console.error("Login error:", err);
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
          background: "radial-gradient(circle at 40% 30%, #1e293b, #0f172a)",
          color: "#fff",
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
      <div style={styles.card}>
        <Link href={`/${locale}`} style={styles.backLink}>
          ← {t("common.back") || "Back"}
        </Link>

        <h1 style={styles.title}>{t("auth.login")}</h1>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            required
            placeholder={t("register.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            autoComplete="email"
          />
          <input
            type="password"
            required
            placeholder={t("register.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            minLength={6}
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "…" : t("auth.login")}
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
          <Link href={`/${locale}/signup`} style={styles.link}>
            {t("auth.no_account") || "Don't have an account? Sign up"}
          </Link>
        </div>
      </div>

      {showReset && (
        <div style={styles.modalOverlay} onClick={() => setShowReset(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, marginBottom: 16 }}>
              {t("auth.reset_password")}
            </h3>
            <form onSubmit={handleResetPassword} style={styles.form}>
              <input
                type="email"
                required
                placeholder={t("register.email")}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                style={styles.input}
              />
              <button
                type="submit"
                disabled={sendingReset}
                style={styles.button}
              >
                {sendingReset ? "…" : t("auth.send_reset_link")}
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
    background: "radial-gradient(circle at 40% 30%, #1e293b, #0f172a)",
    padding: "24px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: 16,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "40px",
    width: "100%",
    maxWidth: 400,
  },
  backLink: {
    color: "#94a3b8",
    fontSize: 14,
    textDecoration: "none",
    display: "block",
    marginBottom: 24,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    marginBottom: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  input: {
    padding: "14px 16px",
    borderRadius: 10,
    border: "1px solid rgba(255, 255, 255, 0.2)",
    background: "rgba(255, 255, 255, 0.08)",
    color: "#fff",
    fontSize: 15,
    outline: "none",
  },
  button: {
    padding: "14px 20px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(120deg, #6366f1, #8b5cf6 60%, #ec4899)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },
  links: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 20,
    alignItems: "center",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: 14,
    cursor: "pointer",
    textDecoration: "underline",
  },
  link: {
    color: "#94a3b8",
    fontSize: 14,
    textDecoration: "none",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modal: {
    background: "#1e293b",
    borderRadius: 16,
    padding: 32,
    width: "90%",
    maxWidth: 360,
    color: "#fff",
  },
};
