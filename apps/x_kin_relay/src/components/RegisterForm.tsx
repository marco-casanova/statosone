"use client";
import { useState, useEffect } from "react";
import { supabase, hasSupabase } from "@/lib/supabaseClient";
import { validateRegister, passwordStrength } from "./registerValidation";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "./Toast";

interface FormState {
  full_name: string;
  email: string;
  password: string;
  address_line1: string;
  address_line2: string;
  city: string;
  region: string;
  postal_code: string;
  country_code: string;
  role: "patient" | "carer";
}

const initial: FormState = {
  full_name: "",
  email: "",
  password: "",
  address_line1: "",
  address_line2: "",
  city: "",
  region: "",
  postal_code: "",
  country_code: "DE",
  role: "patient",
};

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const [values, setValues] = useState<FormState>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const strength = passwordStrength(values.password);
  const router = useRouter();
  const pathname = usePathname();
  // locale from /{locale}/...
  const locale = pathname?.split("/").filter(Boolean)[0] || "en";
  const t = useTranslations();
  const { push } = useToast();

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSupabase) return;
    setError(null);
    // Basic validation
    const v = validateRegister({
      full_name: values.full_name,
      email: values.email,
      password: values.password,
    });
    if (!v.ok) {
      setError(v.error || "error.unknown");
      return;
    }
    setLoading(true);
    try {
      const { data, error: signErr } = await supabase!.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { full_name: values.full_name, role: values.role } },
      });
      if (signErr) throw signErr;
      const userId = data.user?.id;
      if (userId) {
        // Update profile address fields (ignore failure)
        await supabase!.from("profiles").upsert(
          {
            id: userId,
            full_name: values.full_name,
            address_line1: values.address_line1 || null,
            address_line2: values.address_line2 || null,
            city: values.city || null,
            region: values.region || null,
            postal_code: values.postal_code || null,
            country_code: values.country_code || null,
            role: values.role,
          },
          { onConflict: "id" }
        );
      }
      setDone(true);
      if (onSuccess) onSuccess();
      push(t("register.success"), "success");
      router.push(`/${locale}/dashboard`);
    } catch (e: any) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (!hasSupabase) {
    return (
      <div style={wrap}>
        <h2 style={{ marginBottom: 8 }}>{t("register.title")}</h2>
        <div style={{ fontSize: 14, opacity: 0.7 }}>
          {t("register.disabled")}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={wrap} aria-busy={loading}>
      <h2 style={{ marginBottom: 4 }}>{t("register.title")}</h2>
      <p style={{ marginTop: 0, opacity: 0.7, fontSize: 14 }}>
        {t("register.subtitle")}
      </p>
      {error && (
        <div style={errBox} role="alert">
          {error}
        </div>
      )}
      {done && !error && (
        <div style={okBox} role="status">
          {t("register.success")}
        </div>
      )}
      <div style={grid2}>
        <Field label={t("register.full_name")} required>
          <input
            value={values.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            style={input}
            required
            autoComplete="name"
          />
        </Field>
        <Field label={t("register.email")} required>
          <input
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            style={input}
            required
            autoComplete="email"
          />
        </Field>
        <Field label={t("register.password")} required>
          <input
            type="password"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            style={input}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <PasswordStrengthBar strength={strength} />
        </Field>
        <Field label={t("register.role_label")}>
          <div style={{ display: "flex", gap: 14 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
              }}
            >
              <input
                type="radio"
                name="role"
                value="patient"
                checked={values.role === "patient"}
                onChange={() => update("role", "patient")}
              />
              {t("register.role_patient")}
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
              }}
            >
              <input
                type="radio"
                name="role"
                value="carer"
                checked={values.role === "carer"}
                onChange={() => update("role", "carer")}
              />
              {t("register.role_carer")}
            </label>
          </div>
        </Field>
        <Field label={t("register.address_line1")}>
          <input
            value={values.address_line1}
            onChange={(e) => update("address_line1", e.target.value)}
            style={input}
          />
        </Field>
        <Field label={t("register.address_line2")}>
          <input
            value={values.address_line2}
            onChange={(e) => update("address_line2", e.target.value)}
            style={input}
          />
        </Field>
        <Field label={t("register.city")}>
          <input
            value={values.city}
            onChange={(e) => update("city", e.target.value)}
            style={input}
          />
        </Field>
        <Field label={t("register.region")}>
          <input
            value={values.region}
            onChange={(e) => update("region", e.target.value)}
            style={input}
          />
        </Field>
        <Field label={t("register.postal_code")}>
          <input
            value={values.postal_code}
            onChange={(e) => update("postal_code", e.target.value)}
            style={input}
          />
        </Field>
        <Field label={t("register.country_code")}>
          <input
            value={values.country_code}
            onChange={(e) =>
              update("country_code", e.target.value.toUpperCase())
            }
            style={input}
            maxLength={2}
          />
        </Field>
      </div>
      <button type="submit" disabled={loading} style={submitBtn}>
        {loading ? t("register.registering") : t("register.submit")}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}
    >
      <span style={{ fontWeight: 500 }}>
        {label}
        {required && <span style={{ color: "#f87171" }}> *</span>}
      </span>
      {children}
    </label>
  );
}

const wrap: React.CSSProperties = {
  background: "linear-gradient(180deg,rgba(40,42,60,0.85),rgba(28,30,40,0.85))",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: 28,
  borderRadius: 24,
  maxWidth: 780,
  margin: "40px auto",
  boxShadow: "0 4px 24px -4px rgba(0,0,0,0.4)",
};
const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))",
  gap: 18,
  marginTop: 24,
  marginBottom: 28,
};
const input: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.18)",
  padding: "10px 12px",
  borderRadius: 10,
  color: "#fff",
  fontSize: 14,
};
const submitBtn: React.CSSProperties = {
  background: "linear-gradient(90deg,#2563eb,#7c3aed)",
  border: "none",
  color: "#fff",
  padding: "12px 28px",
  fontSize: 15,
  borderRadius: 14,
  cursor: "pointer",
  fontWeight: 600,
};
const errBox: React.CSSProperties = {
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(248,113,113,0.4)",
  color: "#fecaca",
  padding: "10px 14px",
  borderRadius: 12,
  fontSize: 13,
  marginTop: 12,
};
const okBox: React.CSSProperties = {
  background: "rgba(34,197,94,0.15)",
  border: "1px solid rgba(34,197,94,0.4)",
  color: "#bbf7d0",
  padding: "10px 14px",
  borderRadius: 12,
  fontSize: 13,
  marginTop: 12,
};

export default RegisterForm;

function PasswordStrengthBar({ strength }: { strength: number }) {
  // Strength labels via translation keys
  const t = useTranslations();
  const labels = [
    t("register.strength_0"),
    t("register.strength_1"),
    t("register.strength_2"),
    t("register.strength_3"),
    t("register.strength_4"),
  ];
  const pct = (strength / 4) * 100;
  const colors = ["#dc2626", "#f97316", "#facc15", "#22c55e", "#16a34a"];
  return (
    <div style={{ marginTop: 6 }} aria-label="Password strength">
      <div
        style={{
          height: 6,
          background: "rgba(255,255,255,0.12)",
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: pct + "%",
            height: "100%",
            background: colors[strength] || colors[0],
            transition: "width .3s",
          }}
        />
      </div>
      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
        {labels[strength]}
      </div>
    </div>
  );
}
