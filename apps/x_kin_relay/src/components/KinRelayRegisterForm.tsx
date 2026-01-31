"use client";
import { useState } from "react";
import { supabase, hasSupabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

type KinRelayRole = "family" | "specialist" | "nurse" | "caregiver";

interface FormState {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  state: string;
  kr_role: KinRelayRole;
  specialization: string;
  years_of_experience: string;
  hourly_rate: string;
  languages: string[];
  bio: string;
}

const initial: FormState = {
  full_name: "",
  email: "",
  password: "",
  phone: "",
  city: "",
  state: "",
  kr_role: "family",
  specialization: "",
  years_of_experience: "",
  hourly_rate: "",
  languages: ["English"],
  bio: "",
};

const languageOptions = [
  "English",
  "Spanish",
  "Portuguese",
  "French",
  "German",
  "Italian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Russian",
  "Hindi",
];

export function KinRelayRegisterForm() {
  const [values, setValues] = useState<FormState>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)[0] || "en";
  const t = useTranslations();

  const isSpecialist = ["specialist", "nurse", "caregiver"].includes(
    values.kr_role,
  );

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function toggleLanguage(lang: string) {
    setValues((s) => ({
      ...s,
      languages: s.languages.includes(lang)
        ? s.languages.filter((l) => l !== lang)
        : [...s.languages, lang],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSupabase) return;
    setError(null);

    // Basic validation
    if (!values.full_name || !values.email || !values.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (values.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // 1. Create auth user
      const { data, error: signErr } = await supabase!.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
            app: "kinrelay",
            kr_role: values.kr_role,
          },
        },
      });
      if (signErr) throw signErr;

      const userId = data.user?.id;
      if (!userId) throw new Error("User creation failed");

      // 2. Update/create profile
      const { error: profileErr } = await supabase!.from("profiles").upsert(
        {
          id: userId,
          full_name: values.full_name,
          city: values.city || null,
          region: values.state || null,
          role: values.kr_role, // Map KinRelay role to profile
        },
        { onConflict: "id" },
      );
      if (profileErr) console.warn("Profile upsert warning:", profileErr);

      // 3. Create KinRelay caregiver profile
      const { error: krProfileErr } = await supabase!
        .from("kr_caregiver_profiles")
        .upsert(
          {
            user_id: userId,
            kr_role: values.kr_role,
            status: "active",
            phone: values.phone || null,
            city: values.city || null,
            state: values.state || null,
            bio: values.bio || null,
            specialization: isSpecialist ? values.specialization || null : null,
            years_of_experience: isSpecialist
              ? parseInt(values.years_of_experience) || null
              : null,
            hourly_rate: isSpecialist
              ? parseFloat(values.hourly_rate) || null
              : null,
            languages: values.languages.length > 0 ? values.languages : null,
            is_available_for_hire: isSpecialist,
          },
          { onConflict: "user_id" },
        );
      if (krProfileErr)
        console.warn("KinRelay profile upsert warning:", krProfileErr);

      // 4. Create app membership (if table exists)
      try {
        await supabase!.from("app_memberships").upsert(
          {
            user_id: userId,
            app_name: "kinrelay",
            app_role: values.kr_role,
            is_active: true,
          },
          { onConflict: "user_id,app_name" },
        );
      } catch {
        // Ignore if table doesn't exist yet
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/app`);
      }, 1500);
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (!hasSupabase) {
    return (
      <div style={styles.container}>
        <h2>KinRelay Registration</h2>
        <p style={{ opacity: 0.7 }}>
          Supabase is not configured. Please set environment variables.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={styles.container}>
      <div style={styles.header}>
        <h2
          style={{
            margin: 0,
            color: "#1A1A1A",
            fontSize: 18,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Creación de Cuenta
        </h2>
        <p
          style={{
            margin: "4px 0 0",
            color: "#1A1A1A",
            fontSize: 14,
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          del Cuidador
        </p>
      </div>

      {error && (
        <div style={styles.errorBox} role="alert">
          {error}
        </div>
      )}
      {success && (
        <div style={styles.successBox} role="status">
          ✅ Registration successful! Redirecting...
        </div>
      )}

      {/* Role Selection */}
      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>I am a...</legend>
        <div style={styles.roleGrid}>
          {(["family", "specialist", "nurse", "caregiver"] as const).map(
            (role) => (
              <label
                key={role}
                style={{
                  ...styles.roleOption,
                  ...(values.kr_role === role ? styles.roleSelected : {}),
                }}
              >
                <input
                  type="radio"
                  name="kr_role"
                  value={role}
                  checked={values.kr_role === role}
                  onChange={() => update("kr_role", role)}
                  style={{ display: "none" }}
                />
                <span style={styles.roleIcon}>
                  {role === "family" && "👨‍👩‍👧"}
                  {role === "specialist" && "👨‍⚕️"}
                  {role === "nurse" && "👩‍⚕️"}
                  {role === "caregiver" && "🤝"}
                </span>
                <span style={styles.roleLabel}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>
              </label>
            ),
          )}
        </div>
      </fieldset>

      {/* Basic Info */}
      <div style={styles.grid}>
        <div style={styles.field}>
          <label style={styles.label}>
            Full Name <span style={styles.required}>*</span>
          </label>
          <input
            value={values.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            style={styles.input}
            required
            autoComplete="name"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>
            Email <span style={styles.required}>*</span>
          </label>
          <input
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            style={styles.input}
            required
            autoComplete="email"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>
            Password <span style={styles.required}>*</span>
          </label>
          <input
            type="password"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            style={styles.input}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Phone</label>
          <input
            type="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            style={styles.input}
            autoComplete="tel"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>City</label>
          <input
            value={values.city}
            onChange={(e) => update("city", e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>State</label>
          <input
            value={values.state}
            onChange={(e) => update("state", e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      {/* Specialist-specific fields */}
      {isSpecialist && (
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Professional Information</legend>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>Specialization</label>
              <input
                value={values.specialization}
                onChange={(e) => update("specialization", e.target.value)}
                style={styles.input}
                placeholder="e.g., Geriatric Care, Dementia Care"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Years of Experience</label>
              <input
                type="number"
                value={values.years_of_experience}
                onChange={(e) => update("years_of_experience", e.target.value)}
                style={styles.input}
                min="0"
                max="50"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Hourly Rate ($)</label>
              <input
                type="number"
                value={values.hourly_rate}
                onChange={(e) => update("hourly_rate", e.target.value)}
                style={styles.input}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Languages Spoken</label>
            <div style={styles.languageGrid}>
              {languageOptions.map((lang) => (
                <label key={lang} style={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={values.languages.includes(lang)}
                    onChange={() => toggleLanguage(lang)}
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Bio / About Me</label>
            <textarea
              value={values.bio}
              onChange={(e) => update("bio", e.target.value)}
              style={{ ...styles.input, minHeight: 80 }}
              placeholder="Tell families about your experience and approach to care..."
            />
          </div>
        </fieldset>
      )}

      <button type="submit" disabled={loading} style={styles.submitBtn}>
        {loading ? "..." : "Crear"}
      </button>

      <p style={{ textAlign: "center", fontSize: 12, color: "#4A4A4A" }}>
        ¿Ya tienes cuenta?{" "}
        <a
          href={`/${locale}/login`}
          style={{ color: "#1A1A1A", textDecoration: "underline" }}
        >
          Iniciar sesión
        </a>
      </p>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 400,
    margin: "0 auto",
    padding: 24,
    fontFamily: "system-ui, sans-serif",
    background: "transparent",
    borderRadius: 16,
  },
  header: {
    textAlign: "center",
    marginBottom: 24,
  },
  errorBox: {
    background: "#FEE2E2",
    border: "1px solid #DC2626",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: "#DC2626",
    fontSize: 14,
  },
  successBox: {
    background: "#DCFCE7",
    border: "1px solid #22C55E",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: "#166534",
    fontSize: 14,
  },
  fieldset: {
    border: "none",
    padding: 0,
    marginBottom: 16,
  },
  legend: {
    fontWeight: 600,
    padding: "0 0 8px 0",
    color: "#1A1A1A",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  roleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
  },
  roleOption: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 12,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.2s",
    background: "#fff",
  },
  roleSelected: {
    borderColor: "#F5D547",
    background: "#FFFBEB",
  },
  roleIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#1A1A1A",
    textTransform: "uppercase",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginBottom: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: 500,
    color: "#4A4A4A",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  required: {
    color: "#DC2626",
  },
  input: {
    padding: "12px 0",
    border: "none",
    borderBottom: "1px solid #D1D5DB",
    borderRadius: 0,
    fontSize: 14,
    outline: "none",
    background: "transparent",
    color: "#1A1A1A",
  },
  languageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 8,
    marginTop: 8,
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    cursor: "pointer",
    color: "#4A4A4A",
  },
  submitBtn: {
    width: 64,
    height: 64,
    padding: 0,
    background: "#F5D547",
    color: "#1A1A1A",
    border: "none",
    borderRadius: "50%",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 16,
    marginLeft: "auto",
    display: "block",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    textTransform: "uppercase",
  },
};

export default KinRelayRegisterForm;
