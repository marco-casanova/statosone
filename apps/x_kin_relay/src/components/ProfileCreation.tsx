"use client";
import { useState } from "react";
import { supabase, hasSupabase } from "@/lib/supabaseClient";

type ProfileType = "carer" | "family" | null;
type Step = "select" | "form" | "success";

interface CarerFormData {
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  experience: number;
  hourlyRate: number;
  languages: string[];
  specializations: string[];
  certifications: string[];
  availability: string;
}

interface FamilyFormData {
  familyName: string;
  email: string;
  phone: string;
  patientName: string;
  patientAge: number;
  careNeeds: string;
  preferredSchedule: string;
  languages: string[];
  medicalConditions: string[];
  notes: string;
}

const LANGUAGE_OPTIONS = [
  "de",
  "en",
  "tr",
  "ar",
  "pl",
  "ru",
  "es",
  "fr",
  "it",
  "ja",
];
const SPECIALIZATION_OPTIONS = [
  "Dementia care",
  "Mobility support",
  "Medication management",
  "Wound care",
  "Palliative care",
  "Diabetes management",
  "Parkinson's care",
  "Post-surgery rehab",
  "Companionship",
  "Night care",
  "Live-in care",
  "Meal preparation",
  "Personal hygiene",
  "Physical therapy",
];
const CERTIFICATION_OPTIONS = [
  "Certified Nursing Assistant",
  "First Aid",
  "Medication Administration",
  "Dementia Care Specialist",
  "Palliative Care",
  "Wound Care Specialist",
  "Manual Handling",
  "Food Safety",
];
const MEDICAL_CONDITIONS = [
  "Dementia / Alzheimer's",
  "Parkinson's disease",
  "Diabetes",
  "Heart condition",
  "Stroke recovery",
  "Mobility issues",
  "Respiratory issues",
  "Cancer care",
  "Mental health",
  "Post-surgery",
];

export function ProfileCreation() {
  const [step, setStep] = useState<Step>("select");
  const [profileType, setProfileType] = useState<ProfileType>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carer form state
  const [carerForm, setCarerForm] = useState<CarerFormData>({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    experience: 0,
    hourlyRate: 25,
    languages: ["de"],
    specializations: [],
    certifications: [],
    availability: "Mon-Fri, 9:00-17:00",
  });

  // Family form state
  const [familyForm, setFamilyForm] = useState<FamilyFormData>({
    familyName: "",
    email: "",
    phone: "",
    patientName: "",
    patientAge: 75,
    careNeeds: "",
    preferredSchedule: "",
    languages: ["de"],
    medicalConditions: [],
    notes: "",
  });

  const selectType = (type: ProfileType) => {
    setProfileType(type);
    setStep("form");
    setError(null);
  };

  const toggleArrayItem = (
    arr: string[],
    item: string,
    setter: (val: string[]) => void,
  ) => {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const handleCarerSubmit = async () => {
    if (!carerForm.fullName || !carerForm.email) {
      setError("Please fill in required fields (Name, Email)");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      if (!hasSupabase || !supabase) {
        // Demo mode
        await new Promise((r) => setTimeout(r, 1000));
        setStep("success");
        return;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create caregiver profile
      const { error: profileError } = await supabase
        .from("kr_caregiver_profiles")
        .upsert({
          user_id: user.id,
          kr_role: "caregiver",
          status: "active",
          phone: carerForm.phone,
          bio: carerForm.bio,
          specialization: carerForm.specializations.join(", "),
          certifications: carerForm.certifications,
          years_of_experience: carerForm.experience,
          hourly_rate: carerForm.hourlyRate,
          languages: carerForm.languages,
          is_available_for_hire: true,
          availability: { schedule: carerForm.availability },
        });

      if (profileError) throw profileError;
      setStep("success");
    } catch (e: any) {
      setError(e.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleFamilySubmit = async () => {
    if (
      !familyForm.familyName ||
      !familyForm.email ||
      !familyForm.patientName
    ) {
      setError(
        "Please fill in required fields (Family Name, Email, Patient Name)",
      );
      return;
    }
    setSaving(true);
    setError(null);

    try {
      if (!hasSupabase || !supabase) {
        // Demo mode
        await new Promise((r) => setTimeout(r, 1000));
        setStep("success");
        return;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create care circle for the family
      const { data: circle, error: circleError } = await supabase
        .from("kr_care_circles")
        .insert({
          name: `${familyForm.familyName} Care Circle`,
          type: "family",
          description: familyForm.careNeeds,
          created_by: user.id,
          primary_contact_id: user.id,
          settings: {
            preferred_schedule: familyForm.preferredSchedule,
            languages: familyForm.languages,
          },
        })
        .select()
        .single();

      if (circleError) throw circleError;

      // Create client (patient) record
      const { error: clientError } = await supabase.from("kr_clients").insert({
        display_name: familyForm.patientName,
        full_name: familyForm.patientName,
        family_member_id: user.id,
        circle_id: circle.id,
        medical_conditions: familyForm.medicalConditions,
        care_requirements: familyForm.careNeeds,
        additional_notes: familyForm.notes,
        primary_language: familyForm.languages[0] || "de",
      });

      if (clientError) throw clientError;

      // Add user as circle member (owner)
      await supabase.from("kr_circle_members").insert({
        circle_id: circle.id,
        user_id: user.id,
        role: "admin",
        permissions: {
          can_log: true,
          can_view_reports: true,
          can_manage: true,
        },
      });

      setStep("success");
    } catch (e: any) {
      setError(e.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={container}>
      {step === "select" && (
        <div style={selectContainer}>
          <h1 style={title}>Create Your Profile</h1>
          <p style={subtitle}>Choose your role to get started</p>

          <div style={cardGrid}>
            <button onClick={() => selectType("carer")} style={typeCard}>
              <div style={typeIcon}>👩‍⚕️</div>
              <h3 style={typeTitle}>I'm a Carer</h3>
              <p style={typeDesc}>
                Professional caregiver looking to offer care services to
                families
              </p>
              <ul style={typeFeatures}>
                <li>Create your professional profile</li>
                <li>Set your availability & rates</li>
                <li>Get discovered by families</li>
                <li>Manage multiple care assignments</li>
              </ul>
            </button>

            <button onClick={() => selectType("family")} style={typeCard}>
              <div style={typeIcon}>👨‍👩‍👧</div>
              <h3 style={typeTitle}>I'm a Family Member</h3>
              <p style={typeDesc}>Looking for care support for a loved one</p>
              <ul style={typeFeatures}>
                <li>Add care recipient details</li>
                <li>Create a care circle</li>
                <li>Find & connect with carers</li>
                <li>Track care activities</li>
              </ul>
            </button>
          </div>
        </div>
      )}

      {step === "form" && profileType === "carer" && (
        <div style={formContainer}>
          <button onClick={() => setStep("select")} style={backBtn}>
            ← Back
          </button>
          <h2 style={formTitle}>Carer Profile</h2>
          <p style={formSubtitle}>
            Tell families about yourself and your care experience
          </p>

          <div style={formGrid}>
            {/* Basic Info */}
            <div style={formSection}>
              <h4 style={sectionTitle}>Basic Information</h4>
              <div style={fieldGroup}>
                <label style={label}>Full Name *</label>
                <input
                  type="text"
                  value={carerForm.fullName}
                  onChange={(e) =>
                    setCarerForm({ ...carerForm, fullName: e.target.value })
                  }
                  style={input}
                  placeholder="Elena Müller"
                />
              </div>
              <div style={fieldGroup}>
                <label style={label}>Email *</label>
                <input
                  type="email"
                  value={carerForm.email}
                  onChange={(e) =>
                    setCarerForm({ ...carerForm, email: e.target.value })
                  }
                  style={input}
                  placeholder="elena@example.com"
                />
              </div>
              <div style={fieldGroup}>
                <label style={label}>Phone</label>
                <input
                  type="tel"
                  value={carerForm.phone}
                  onChange={(e) =>
                    setCarerForm({ ...carerForm, phone: e.target.value })
                  }
                  style={input}
                  placeholder="+49 176 1234567"
                />
              </div>
            </div>

            {/* Experience */}
            <div style={formSection}>
              <h4 style={sectionTitle}>Experience & Rates</h4>
              <div style={fieldRow}>
                <div style={fieldGroup}>
                  <label style={label}>Years of Experience</label>
                  <input
                    type="number"
                    min={0}
                    value={carerForm.experience}
                    onChange={(e) =>
                      setCarerForm({
                        ...carerForm,
                        experience: Number(e.target.value),
                      })
                    }
                    style={input}
                  />
                </div>
                <div style={fieldGroup}>
                  <label style={label}>Hourly Rate (€)</label>
                  <input
                    type="number"
                    min={15}
                    value={carerForm.hourlyRate}
                    onChange={(e) =>
                      setCarerForm({
                        ...carerForm,
                        hourlyRate: Number(e.target.value),
                      })
                    }
                    style={input}
                  />
                </div>
              </div>
              <div style={fieldGroup}>
                <label style={label}>Availability</label>
                <input
                  type="text"
                  value={carerForm.availability}
                  onChange={(e) =>
                    setCarerForm({ ...carerForm, availability: e.target.value })
                  }
                  style={input}
                  placeholder="Mon-Fri, 9:00-17:00"
                />
              </div>
            </div>

            {/* Bio */}
            <div style={{ ...formSection, gridColumn: "1 / -1" }}>
              <h4 style={sectionTitle}>About You</h4>
              <div style={fieldGroup}>
                <label style={label}>Bio</label>
                <textarea
                  value={carerForm.bio}
                  onChange={(e) =>
                    setCarerForm({ ...carerForm, bio: e.target.value })
                  }
                  style={{ ...input, minHeight: 100, resize: "vertical" }}
                  placeholder="Describe your experience, approach to care, and what makes you a great caregiver..."
                />
              </div>
            </div>

            {/* Languages */}
            <div style={formSection}>
              <h4 style={sectionTitle}>Languages</h4>
              <div style={chipGrid}>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() =>
                      toggleArrayItem(carerForm.languages, lang, (v) =>
                        setCarerForm({ ...carerForm, languages: v }),
                      )
                    }
                    style={
                      carerForm.languages.includes(lang) ? chipActive : chip
                    }
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div style={formSection}>
              <h4 style={sectionTitle}>Specializations</h4>
              <div style={chipGrid}>
                {SPECIALIZATION_OPTIONS.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() =>
                      toggleArrayItem(carerForm.specializations, spec, (v) =>
                        setCarerForm({ ...carerForm, specializations: v }),
                      )
                    }
                    style={
                      carerForm.specializations.includes(spec)
                        ? chipActive
                        : chip
                    }
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div style={{ ...formSection, gridColumn: "1 / -1" }}>
              <h4 style={sectionTitle}>Certifications</h4>
              <div style={chipGrid}>
                {CERTIFICATION_OPTIONS.map((cert) => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() =>
                      toggleArrayItem(carerForm.certifications, cert, (v) =>
                        setCarerForm({ ...carerForm, certifications: v }),
                      )
                    }
                    style={
                      carerForm.certifications.includes(cert)
                        ? chipActive
                        : chip
                    }
                  >
                    {cert}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <div style={errorBox}>{error}</div>}

          <button
            onClick={handleCarerSubmit}
            disabled={saving}
            style={{ ...submitBtn, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Creating Profile..." : "Create Carer Profile"}
          </button>
        </div>
      )}

      {step === "form" && profileType === "family" && (
        <div style={formContainer}>
          <button onClick={() => setStep("select")} style={backBtn}>
            ← Back
          </button>
          <h2 style={formTitle}>Family Profile</h2>
          <p style={formSubtitle}>Tell us about your care needs</p>

          <div style={formGrid}>
            {/* Family Info */}
            <div style={formSection}>
              <h4 style={sectionTitle}>Family Information</h4>
              <div style={fieldGroup}>
                <label style={label}>Family Name *</label>
                <input
                  type="text"
                  value={familyForm.familyName}
                  onChange={(e) =>
                    setFamilyForm({ ...familyForm, familyName: e.target.value })
                  }
                  style={input}
                  placeholder="Family Schmidt"
                />
              </div>
              <div style={fieldGroup}>
                <label style={label}>Email *</label>
                <input
                  type="email"
                  value={familyForm.email}
                  onChange={(e) =>
                    setFamilyForm({ ...familyForm, email: e.target.value })
                  }
                  style={input}
                  placeholder="schmidt@example.com"
                />
              </div>
              <div style={fieldGroup}>
                <label style={label}>Phone</label>
                <input
                  type="tel"
                  value={familyForm.phone}
                  onChange={(e) =>
                    setFamilyForm({ ...familyForm, phone: e.target.value })
                  }
                  style={input}
                  placeholder="+49 176 1234567"
                />
              </div>
            </div>

            {/* Patient Info */}
            <div style={formSection}>
              <h4 style={sectionTitle}>Care Recipient</h4>
              <div style={fieldGroup}>
                <label style={label}>Patient Name *</label>
                <input
                  type="text"
                  value={familyForm.patientName}
                  onChange={(e) =>
                    setFamilyForm({
                      ...familyForm,
                      patientName: e.target.value,
                    })
                  }
                  style={input}
                  placeholder="Maria Schmidt"
                />
              </div>
              <div style={fieldGroup}>
                <label style={label}>Age</label>
                <input
                  type="number"
                  min={0}
                  value={familyForm.patientAge}
                  onChange={(e) =>
                    setFamilyForm({
                      ...familyForm,
                      patientAge: Number(e.target.value),
                    })
                  }
                  style={input}
                />
              </div>
              <div style={fieldGroup}>
                <label style={label}>Preferred Schedule</label>
                <input
                  type="text"
                  value={familyForm.preferredSchedule}
                  onChange={(e) =>
                    setFamilyForm({
                      ...familyForm,
                      preferredSchedule: e.target.value,
                    })
                  }
                  style={input}
                  placeholder="Weekday mornings, 8:00-12:00"
                />
              </div>
            </div>

            {/* Care Needs */}
            <div style={{ ...formSection, gridColumn: "1 / -1" }}>
              <h4 style={sectionTitle}>Care Needs</h4>
              <div style={fieldGroup}>
                <label style={label}>What type of care do you need?</label>
                <textarea
                  value={familyForm.careNeeds}
                  onChange={(e) =>
                    setFamilyForm({ ...familyForm, careNeeds: e.target.value })
                  }
                  style={{ ...input, minHeight: 80, resize: "vertical" }}
                  placeholder="Describe the care needs: daily activities, medical requirements, companionship, etc."
                />
              </div>
            </div>

            {/* Languages */}
            <div style={formSection}>
              <h4 style={sectionTitle}>Preferred Languages</h4>
              <div style={chipGrid}>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() =>
                      toggleArrayItem(familyForm.languages, lang, (v) =>
                        setFamilyForm({ ...familyForm, languages: v }),
                      )
                    }
                    style={
                      familyForm.languages.includes(lang) ? chipActive : chip
                    }
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Medical Conditions */}
            <div style={formSection}>
              <h4 style={sectionTitle}>Medical Conditions</h4>
              <div style={chipGrid}>
                {MEDICAL_CONDITIONS.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() =>
                      toggleArrayItem(
                        familyForm.medicalConditions,
                        condition,
                        (v) =>
                          setFamilyForm({
                            ...familyForm,
                            medicalConditions: v,
                          }),
                      )
                    }
                    style={
                      familyForm.medicalConditions.includes(condition)
                        ? chipActive
                        : chip
                    }
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ ...formSection, gridColumn: "1 / -1" }}>
              <h4 style={sectionTitle}>Additional Notes</h4>
              <div style={fieldGroup}>
                <textarea
                  value={familyForm.notes}
                  onChange={(e) =>
                    setFamilyForm({ ...familyForm, notes: e.target.value })
                  }
                  style={{ ...input, minHeight: 80, resize: "vertical" }}
                  placeholder="Any additional information carers should know..."
                />
              </div>
            </div>
          </div>

          {error && <div style={errorBox}>{error}</div>}

          <button
            onClick={handleFamilySubmit}
            disabled={saving}
            style={{ ...submitBtn, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Creating Profile..." : "Create Family Profile"}
          </button>
        </div>
      )}

      {step === "success" && (
        <div style={successContainer}>
          <div style={successIcon}>✓</div>
          <h2 style={successTitle}>Profile Created!</h2>
          <p style={successText}>
            {profileType === "carer"
              ? "Your carer profile is now live. Families can discover and contact you."
              : "Your care circle is ready. You can now find carers and start logging activities."}
          </p>
          <button
            onClick={() => (window.location.href = "?view=dashboard")}
            style={submitBtn}
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

// Styles
const container: React.CSSProperties = {
  padding: "100px 20px 60px",
  maxWidth: 900,
  margin: "0 auto",
  minHeight: "100vh",
};

const selectContainer: React.CSSProperties = {
  textAlign: "center",
};

const title: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  marginBottom: 8,
  background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const subtitle: React.CSSProperties = {
  fontSize: 16,
  opacity: 0.7,
  marginBottom: 40,
};

const cardGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 24,
};

const typeCard: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(30,32,45,0.9), rgba(20,22,30,0.95))",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 24,
  padding: 32,
  textAlign: "left",
  cursor: "pointer",
  transition: "all 0.2s ease",
  color: "#fff",
};

const typeIcon: React.CSSProperties = {
  fontSize: 48,
  marginBottom: 16,
};

const typeTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  marginBottom: 8,
};

const typeDesc: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.7,
  marginBottom: 20,
  lineHeight: 1.5,
};

const typeFeatures: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  fontSize: 13,
  opacity: 0.8,
};

const formContainer: React.CSSProperties = {
  position: "relative",
};

const backBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#94a3b8",
  fontSize: 14,
  cursor: "pointer",
  marginBottom: 20,
  padding: 0,
};

const formTitle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 8,
};

const formSubtitle: React.CSSProperties = {
  fontSize: 15,
  opacity: 0.6,
  marginBottom: 32,
};

const formGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 24,
};

const formSection: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 20,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "#64748b",
  marginBottom: 16,
  fontWeight: 600,
};

const fieldGroup: React.CSSProperties = {
  marginBottom: 16,
};

const fieldRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  marginBottom: 6,
  color: "#94a3b8",
};

const input: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  padding: "12px 14px",
  color: "#fff",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const chipGrid: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const chip: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 20,
  padding: "6px 14px",
  color: "#94a3b8",
  fontSize: 12,
  cursor: "pointer",
};

const chipActive: React.CSSProperties = {
  ...chip,
  background: "rgba(99, 102, 241, 0.2)",
  borderColor: "#6366f1",
  color: "#a5b4fc",
};

const errorBox: React.CSSProperties = {
  background: "rgba(239, 68, 68, 0.15)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: 12,
  padding: "12px 16px",
  color: "#f87171",
  fontSize: 14,
  marginTop: 20,
};

const submitBtn: React.CSSProperties = {
  width: "100%",
  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
  border: "none",
  borderRadius: 14,
  padding: "16px 24px",
  color: "#fff",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 24,
};

const successContainer: React.CSSProperties = {
  textAlign: "center",
  padding: "80px 20px",
};

const successIcon: React.CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  background: "rgba(34, 197, 94, 0.2)",
  color: "#22c55e",
  fontSize: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 24px",
};

const successTitle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 12,
};

const successText: React.CSSProperties = {
  fontSize: 16,
  opacity: 0.7,
  marginBottom: 32,
  maxWidth: 400,
  margin: "0 auto 32px",
  lineHeight: 1.6,
};
