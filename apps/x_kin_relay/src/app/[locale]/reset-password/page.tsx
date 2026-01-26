"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase, hasSupabase } from "@/lib/supabaseClient";
import { useTranslations } from "next-intl";
import { useToast } from "../../../components/Toast";

export default function ResetPasswordPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (!hasSupabase || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        // No session created by recovery link
        router.replace(
          `/${locale}?auth_error=${encodeURIComponent(
            "Invalid or expired link"
          )}`
        );
      } else {
        setSessionReady(true);
      }
    });
  }, [router, locale]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw1 !== pw2) {
      push(t("auth.password_mismatch"), "error");
      return;
    }
    if (!hasSupabase || !supabase) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setLoading(false);
    if (error) {
      push(error.message, "error");
      return;
    }
    push(t("auth.password_updated"), "success");
    router.replace(`/${locale}`);
  }

  if (!sessionReady) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "radial-gradient(circle at 40% 30%,#1e293b,#0f172a)",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          background:
            "linear-gradient(180deg,rgba(40,42,60,0.85),rgba(28,30,40,0.85))",
          border: "1px solid rgba(255,255,255,0.1)",
          padding: 32,
          borderRadius: 28,
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          width: "100%",
          maxWidth: 420,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22 }}>{t("auth.reset_password")}</h1>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            fontSize: 13,
          }}
        >
          <span>{t("auth.new_password")}</span>
          <input
            type="password"
            required
            value={pw1}
            minLength={6}
            onChange={(e) => setPw1(e.target.value)}
            style={inp}
          />
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            fontSize: 13,
          }}
        >
          <span>{t("auth.confirm_password")}</span>
          <input
            type="password"
            required
            value={pw2}
            minLength={6}
            onChange={(e) => setPw2(e.target.value)}
            style={inp}
          />
        </label>
        <button type="submit" disabled={loading} style={btn}>
          {loading ? "…" : t("auth.reset_password")}
        </button>
      </form>
    </main>
  );
}

const inp: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.18)",
  padding: "10px 12px",
  borderRadius: 12,
  color: "#fff",
  fontSize: 14,
};
const btn: React.CSSProperties = {
  background: "linear-gradient(90deg,#2563eb,#7c3aed)",
  border: "none",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: 16,
  fontSize: 15,
  cursor: "pointer",
  fontWeight: 600,
};
