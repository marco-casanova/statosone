"use client";
import { useState } from "react";
import { supabase, hasSupabase } from "@/lib/supabaseClient";
import { useTranslations } from "next-intl";
import { useToast } from "./Toast";
import { useRouter, usePathname } from "next/navigation";

export function LoginForm() {
  const t = useTranslations();
  const { push } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSupabase || !supabase) {
      push("Auth disabled (demo mode). Redirecting...", "info");
      router.replace(`/${locale}/app?view=dashboard`);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pw,
      });
      if (error) return push(error.message, "error");
      router.replace(`/${locale}/app?view=dashboard`);
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.assign(`/${locale}/app?view=dashboard`);
        }
      }, 250);
    } finally {
      setLoading(false);
    }
  }
  async function sendReset(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSupabase || !supabase) return;
    setSendingReset(true);
    setResetDone(false);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    });
    setSendingReset(false);
    if (error) push(error.message, "error");
    else {
      setResetDone(true);
      push(t("auth.reset_link_sent"), "success");
    }
  }

  return (
    <div style={wrap}>
      <h2 style={{ margin: 0 }}>{t("auth.login")}</h2>
      <form
        onSubmit={login}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginTop: 20,
        }}
      >
        <input
          type="email"
          required
          placeholder={t("register.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inp}
          autoComplete="email"
        />
        <input
          type="password"
          required
          placeholder={t("register.password")}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={inp}
          minLength={6}
          autoComplete="current-password"
        />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="submit" disabled={loading} style={btnPrimary}>
            {loading ? "…" : t("auth.login")}
          </button>
          <button
            type="button"
            onClick={() => setShowReset(true)}
            style={btnLink}
          >
            {t("auth.forgot")}
          </button>
        </div>
      </form>
      {showReset && (
        <div style={modalOverlay} onClick={() => setShowReset(false)}>
          <form
            onSubmit={sendReset}
            onClick={(e) => e.stopPropagation()}
            style={modalCard}
          >
            <h3 style={{ marginTop: 0 }}>{t("auth.reset_request_title")}</h3>
            <p style={{ marginTop: 0, fontSize: 13, opacity: 0.75 }}>
              {t("auth.reset_request_sub")}
            </p>
            <input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="you@example.com"
              style={inp}
            />
            {resetDone && <div style={okBox}>{t("auth.reset_link_sent")}</div>}
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" disabled={sendingReset} style={btnPrimary}>
                {sendingReset ? t("auth.sending") : t("auth.send_link")}
              </button>
              <button
                type="button"
                onClick={() => setShowReset(false)}
                style={btnGhost}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const wrap: React.CSSProperties = {
  background: "linear-gradient(180deg,rgba(40,42,60,0.85),rgba(28,30,40,0.85))",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: 28,
  borderRadius: 24,
  width: "100%",
  maxWidth: 460,
  display: "flex",
  flexDirection: "column",
  gap: 4,
  color: "#fff",
};
const inp: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.18)",
  padding: "10px 12px",
  borderRadius: 10,
  color: "#fff",
  fontSize: 14,
  width: "100%",
};
const btnPrimary: React.CSSProperties = {
  background: "linear-gradient(90deg,#2563eb,#7c3aed)",
  border: "none",
  color: "#fff",
  padding: "10px 18px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
};
const btnGhost: React.CSSProperties = {
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.25)",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
};
const btnLink: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#93c5fd",
  cursor: "pointer",
  fontSize: 12,
  textDecoration: "underline",
  padding: "6px 6px",
};
const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 400,
  padding: 20,
};
const modalCard: React.CSSProperties = {
  background: "linear-gradient(135deg,rgba(30,41,59,0.95),rgba(15,23,42,0.95))",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 24,
  padding: "30px 32px",
  width: "100%",
  maxWidth: 420,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  color: "#fff",
  position: "relative",
};
const okBox: React.CSSProperties = {
  fontSize: 12,
  background: "rgba(34,197,94,0.15)",
  border: "1px solid rgba(34,197,94,0.4)",
  padding: "8px 10px",
  borderRadius: 10,
  color: "#bbf7d0",
};
