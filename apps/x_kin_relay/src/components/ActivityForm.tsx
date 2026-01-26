"use client";
import React, { useState, useMemo, useEffect } from "react";
import { supabase, hasSupabase } from "../lib/supabaseClient";
import {
  IncidentCategory,
  CATEGORY_TO_SUBTYPES,
  SUBTYPE_OPTIONS,
  SUBTYPES_WITH_ASSISTANCE,
} from "../types/schema";
import { iconFor, a11yLabel } from "./activityIcons";
import {
  QuickActionsManager,
  QuickAction,
  loadQuickActions,
  saveQuickActions,
} from "./QuickActionsManager";

type Phase = "browse" | "category" | "confirm";

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { category: "adl", subtype: "hydration", label: "Hydration" },
  { category: "safety", subtype: "falls", label: "Fall" },
];

const ASSISTANCE_LEVELS = [
  {
    value: "independent",
    label: "Independent",
    desc: "Person can complete task without any help",
  },
  {
    value: "supervision",
    label: "Supervision",
    desc: "Person needs oversight but no physical help",
  },
  {
    value: "partial",
    label: "Partial",
    desc: "Person needs some physical assistance",
  },
  { value: "full", label: "Full", desc: "Person requires complete assistance" },
];

// Tooltip component for assistance help
function AssistanceTooltip() {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <span
        style={helpIcon}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        role="button"
        aria-label="Show assistance level explanations"
        tabIndex={0}
      >
        ?
      </span>
      {show && (
        <div style={tooltipBox}>
          <div style={tooltipTitle}>Assistance Levels</div>
          {ASSISTANCE_LEVELS.map((lvl) => (
            <div key={lvl.value} style={tooltipItem}>
              <strong style={{ color: "#fff" }}>{lvl.label}:</strong>{" "}
              <span style={{ color: "#B6C0D1" }}>{lvl.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Help tooltip for Quick Log title
function QuickLogHelp() {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-flex", marginLeft: 10 }}
    >
      <span
        style={helpIcon}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        role="button"
        aria-label="Show Quick Log description"
        tabIndex={0}
      >
        ?
      </span>
      {show && (
        <span style={tooltipBoxTitle}>
          Quick activity logging for daily care. Select a quick action or
          category to log activities like hydration, falls, ADLs, and more.
        </span>
      )}
    </span>
  );
}

export function ActivityForm() {
  const [phase, setPhase] = useState<Phase>("browse");
  const [category, setCategory] = useState<IncidentCategory | null>(null);
  const [subtype, setSubtype] = useState<string | null>(null);
  const [subtypeValue, setSubtypeValue] = useState<string | number | null>(
    null,
  );
  const [observedAt, setObservedAt] = useState(nowLocal());
  const [assistanceLevel, setAssistanceLevel] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Quick Actions customization
  const [quickActions, setQuickActions] = useState<QuickAction[]>(
    DEFAULT_QUICK_ACTIONS,
  );
  const [showManager, setShowManager] = useState(false);

  // Load quick actions from localStorage
  useEffect(() => {
    setQuickActions(loadQuickActions());
  }, []);

  // Client selection
  const [clients, setClients] = useState<
    { id: string; display_name: string }[]
  >([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [loadingClients, setLoadingClients] = useState(false);

  // Load clients on mount
  useEffect(() => {
    async function loadClients() {
      if (!hasSupabase || !supabase) {
        // Mock data for demo
        setClients([
          { id: "demo-client-1", display_name: "Maria Schmidt" },
          { id: "demo-client-2", display_name: "Hans Müller" },
        ]);
        setSelectedClientId("demo-client-1");
        return;
      }
      setLoadingClients(true);
      const { data, error } = await supabase
        .from("kr_clients")
        .select("id, display_name")
        .order("display_name");
      if (!error && data) {
        setClients(data);
        if (data.length > 0) setSelectedClientId(data[0].id);
      }
      setLoadingClients(false);
    }
    loadClients();
  }, []);

  function resetAll() {
    setPhase("browse");
    setCategory(null);
    setSubtype(null);
    setSubtypeValue(null);
    setObservedAt(nowLocal());
    setAssistanceLevel("");
    setMessage(null);
  }
  function pickCategory(c: IncidentCategory) {
    setCategory(c);
    const meta = CATEGORY_TO_SUBTYPES[c];
    setPhase(meta.values.length ? "category" : "confirm");
  }
  function pickSubtype(s: string) {
    setSubtype(s);
    setSubtypeValue(null); // Reset value when changing subtype
    setPhase("confirm");
  }

  async function save() {
    if (!category) return;
    const meta = CATEGORY_TO_SUBTYPES[category];
    if (meta.values.length && !subtype) {
      setMessage("Pick subtype");
      return;
    }
    if (!supabase) {
      setMessage("(demo) Saved ✔");
      resetAll();
      return;
    }
    setSaving(true);
    try {
      const metaDef = CATEGORY_TO_SUBTYPES[category];
      const payload: any = {
        category,
        observed_at: new Date(observedAt).toISOString(),
        recipient_id: selectedClientId || null,
      };
      if (subtype) payload[metaDef.key] = subtype;
      if (assistanceLevel) payload.assistance_level = assistanceLevel;
      // Store subtype-specific value in details JSON
      if (subtypeValue !== null && subtype) {
        const options = SUBTYPE_OPTIONS[subtype];
        const selectedOption = options?.find((o) => o.value === subtypeValue);
        payload.details = {
          value: subtypeValue,
          unit: selectedOption?.unit || null,
          label: selectedOption?.label || null,
        };
      }
      const { error } = await supabase.from("kr_activities").insert(payload);
      if (error) throw error;
      setMessage("Saved ✔");
      resetAll();
    } catch (e: any) {
      setMessage(e.message || "Save error");
    } finally {
      setSaving(false);
    }
  }

  interface CatalogItem {
    id: string;
    type: "category" | "sub" | "quick";
    category: IncidentCategory;
    subtype?: string;
    label: string;
  }
  const catalog = useMemo<CatalogItem[]>(() => {
    const items: CatalogItem[] = [];
    quickActions.forEach((q) =>
      items.push({
        id: `qa-${q.category}-${q.subtype}`,
        type: "quick",
        category: q.category,
        subtype: q.subtype,
        label: q.label,
      }),
    );
    (Object.keys(CATEGORY_TO_SUBTYPES) as IncidentCategory[]).forEach((c) => {
      items.push({
        id: `cat-${c}`,
        type: "category",
        category: c,
        label: formatCategory(c),
      });
      CATEGORY_TO_SUBTYPES[c].values.forEach((s) =>
        items.push({
          id: `sub-${c}-${s}`,
          type: "sub",
          category: c,
          subtype: s,
          label: formatSubtype(s),
        }),
      );
    });
    return items;
  }, []);

  function handleSelect(item: CatalogItem) {
    if (item.type === "category") {
      pickCategory(item.category);
    } else {
      setCategory(item.category);
      setSubtype(item.subtype || null);
      setPhase("confirm");
    }
  }

  const canConfirm =
    !!category && (!CATEGORY_TO_SUBTYPES[category].values.length || !!subtype);

  // Go back one step
  function goBack() {
    if (phase === "confirm") {
      if (subtype && category && CATEGORY_TO_SUBTYPES[category].values.length) {
        setSubtype(null);
        setPhase("category");
      } else {
        setCategory(null);
        setSubtype(null);
        setPhase("browse");
      }
    } else if (phase === "category") {
      setCategory(null);
      setPhase("browse");
    }
  }

  return (
    <div style={shell} aria-labelledby="af-title">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {phase !== "browse" && (
          <button onClick={goBack} style={backButton} aria-label="Go back">
            ←
          </button>
        )}
        <h3 id="af-title" style={titleH3}>
          Quick Log
        </h3>
        <QuickLogHelp />
      </div>
      {phase === "browse" && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={sectionLabel}>Quick Actions</div>
            <button
              onClick={() => setShowManager(true)}
              style={settingsBtn}
              aria-label="Manage quick actions"
              title="Customize quick actions"
            >
              ⚙️
            </button>
          </div>
          <div style={quickGrid}>
            {quickActions.length === 0 ? (
              <button onClick={() => setShowManager(true)} style={addQuickBtn}>
                + Add Quick Actions
              </button>
            ) : (
              quickActions.map((q, idx) => (
                <button
                  key={`${q.category}-${q.subtype}-${idx}`}
                  style={quickCard(q.subtype)}
                  onClick={() =>
                    handleSelect({
                      id: `qa-${q.category}-${q.subtype}`,
                      type: "quick",
                      category: q.category,
                      subtype: q.subtype,
                      label: q.label,
                    })
                  }
                  aria-label={`${q.label} quick action`}
                >
                  <span
                    style={iconBadge(q.category)}
                    role="img"
                    aria-label={a11yLabel(q.category, q.subtype)}
                  >
                    {iconFor(q.category, q.subtype)}
                  </span>
                  <div>
                    <span style={cardTitle}>{q.label}</span>
                    <div style={cardSub}>{formatCategory(q.category)}</div>
                  </div>
                </button>
              ))
            )}
          </div>
          <div style={sectionLabel}>Categories</div>
          <div style={grid}>
            {(Object.keys(CATEGORY_TO_SUBTYPES) as IncidentCategory[]).map(
              (c) => (
                <button
                  key={c}
                  style={categoryCard(c, false)}
                  onClick={() => pickCategory(c)}
                  aria-label={`Select ${c} category`}
                >
                  <span
                    style={iconBadge(c)}
                    role="img"
                    aria-label={a11yLabel(c)}
                  >
                    {iconFor(c)}
                  </span>
                  <span style={cardTitle}>{formatCategory(c)}</span>
                  <span style={cardSub}>
                    {CATEGORY_TO_SUBTYPES[c].values.length} subtypes
                  </span>
                </button>
              ),
            )}
          </div>
        </>
      )}
      {phase === "category" && category && (
        <>
          <div style={sectionLabel}>{formatCategory(category)} subtypes</div>
          <div style={grid}>
            {CATEGORY_TO_SUBTYPES[category].values.map((s) => (
              <button
                key={s}
                style={categoryCard(category, subtype === s)}
                onClick={() => pickSubtype(s)}
                aria-label={`Pick subtype ${s}`}
              >
                <span
                  style={iconBadge(category)}
                  role="img"
                  aria-label={a11yLabel(category, s)}
                >
                  {iconFor(category, s)}
                </span>
                <span style={cardTitle}>{formatSubtype(s)}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {phase === "confirm" && category && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontWeight: 600,
              padding: 22,
              background:
                categoryColors[category]?.bg || "rgba(108, 124, 255, 0.18)",
              borderRadius: 18,
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: categoryColors[category]?.color || "#6C7CFF",
            }}
          >
            <span
              style={iconBadge(category)}
              role="img"
              aria-label={a11yLabel(category, subtype || undefined)}
            >
              {iconFor(category, subtype)}
            </span>
            <div>
              <div style={{ fontSize: 22, color: "#fff", fontWeight: 600 }}>
                {formatCategory(category)}
              </div>
              {subtype && (
                <div style={{ fontSize: 17, color: "#B6C0D1", marginTop: 4 }}>
                  {formatSubtype(subtype)}
                </div>
              )}
            </div>
          </div>

          {/* Subtype-specific options (e.g., ml for hydration) */}
          {subtype && SUBTYPE_OPTIONS[subtype] && (
            <>
              <label style={miniLabel}>{getOptionLabel(subtype)}</label>
              <div style={optionGrid}>
                {SUBTYPE_OPTIONS[subtype].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setSubtypeValue(opt.value)}
                    style={{
                      ...optionBtn,
                      background:
                        subtypeValue === opt.value
                          ? "rgba(108, 124, 255, 0.25)"
                          : "rgba(255,255,255,0.06)",
                      borderColor:
                        subtypeValue === opt.value
                          ? "#6C7CFF"
                          : "rgba(255,255,255,0.15)",
                    }}
                    aria-pressed={subtypeValue === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}

          <label style={miniLabel}>Client</label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            style={input}
            aria-label="Select client"
            disabled={loadingClients}
          >
            {loadingClients ? (
              <option>Loading...</option>
            ) : clients.length === 0 ? (
              <option value="">No clients available</option>
            ) : (
              clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.display_name || c.id}
                </option>
              ))
            )}
          </select>
          <label style={miniLabel}>Observed at</label>
          <input
            type="datetime-local"
            value={observedAt}
            onChange={(e) => setObservedAt(e.target.value)}
            style={input}
            aria-label="Observed at"
          />
          {/* Only show generic assistance dropdown if subtype doesn't already have assistance options */}
          {(!subtype || !SUBTYPES_WITH_ASSISTANCE.includes(subtype)) && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ ...miniLabel, marginTop: 0 }}>
                  Assistance (optional)
                </label>
                <AssistanceTooltip />
              </div>
              <select
                value={assistanceLevel}
                onChange={(e) => setAssistanceLevel(e.target.value)}
                style={input}
                aria-label="Assistance level"
              >
                <option value="">Select level</option>
                {ASSISTANCE_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              disabled={!canConfirm || saving}
              onClick={save}
              style={{
                ...saveBtn,
                opacity: !canConfirm || saving ? 0.5 : 1,
                cursor: !canConfirm || saving ? "not-allowed" : "pointer",
              }}
              aria-disabled={!canConfirm || saving}
            >
              {saving ? "Saving…" : "✓ Log Activity"}
            </button>
            <button onClick={resetAll} style={resetBtn}>
              Cancel
            </button>
          </div>
          {message && (
            <div
              style={{
                fontSize: 13,
                padding: "10px 14px",
                borderRadius: 10,
                background: message.includes("✔")
                  ? "rgba(34, 197, 94, 0.15)"
                  : "rgba(239, 68, 68, 0.15)",
                color: message.includes("✔") ? "#22C55E" : "#EF4444",
              }}
            >
              {message}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions Manager Modal */}
      {showManager && (
        <QuickActionsManager
          onClose={() => setShowManager(false)}
          onSave={(newActions) => setQuickActions(newActions)}
          currentActions={quickActions}
        />
      )}
    </div>
  );
}

// Helpers & visual tokens
function nowLocal() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
    d.getHours(),
  )}:${p(d.getMinutes())}`;
}
function formatCategory(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
const formatSubtype = formatCategory;

// Get label for subtype options based on subtype
function getOptionLabel(subtype: string): string {
  const labels: Record<string, string> = {
    // Safety
    falls: "Severity",
    safeguarding: "Type",
    medication_error: "Error type",
    missing_client: "Duration",
    fire_disaster: "Type",
    theft_security: "Type",
    team_accident: "Severity",
    equipment_issue: "Issue type",
    poisoning: "Status",
    death: "Type",
    near_miss: "Type",
    // Health Observation
    breathing_difficulty: "Severity",
    cough_sputum: "Type",
    airway_obstruction: "Status",
    chest_pain: "Severity",
    pale: "Severity",
    weakness: "Severity",
    loss_of_consciousness: "Duration",
    seizure: "Type",
    drowsiness: "Severity",
    headache: "Severity",
    stroke_like_signs: "Sign type",
    rash: "Extent",
    burn: "Severity",
    skin_breakdown: "Stage",
    infection_concern: "Status",
    vomiting: "Frequency",
    diarrhoea: "Severity",
    urinary_symptoms: "Type",
    diabetes_symptom: "Type",
    glucose_value: "Level",
    catheter_issue: "Issue type",
    behaviour_change: "Type",
    // ADL
    hydration: "Amount",
    nutrition_meal: "Portion eaten",
    feeding: "Portion eaten",
    toileting: "Outcome",
    continence_bladder: "Status",
    continence_bowel: "Status",
    sleep_rest: "Sleep quality",
    vital_sign: "Type",
    weight_entry: "Weight range",
    mobility_transfer: "Assistance needed",
    transfer: "Assistance needed",
    ambulation_walk: "Duration",
    bathing_hygiene: "Type",
    dressing_grooming: "Assistance",
    // Environment
    home_hazard: "Hazard type",
    moving_handling: "Issue type",
    service_visit_issue: "Issue type",
    // Service
    visit_issue: "Issue type",
    access_problem: "Problem type",
    late_arrival: "Delay",
    cancelled_visit: "Reason",
    other: "Type",
    // Engagement
    reading: "Duration",
    video_game: "Duration",
    tv_viewing: "Duration",
    music_listening: "Duration",
    social_visit: "Duration",
    puzzle_brain: "Duration",
    exercise_light: "Duration",
    exercise_moderate: "Duration",
    outdoor_walk: "Duration",
    art_craft: "Duration",
  };
  return labels[subtype] || "Select option";
}

// Design System Colors (matching globals.css)
const categoryColors: Record<string, { color: string; bg: string }> = {
  safety: { color: "#F97316", bg: "rgba(249, 115, 22, 0.18)" },
  health_observation: { color: "#2DD4BF", bg: "rgba(45, 212, 191, 0.18)" },
  adl: { color: "#60A5FA", bg: "rgba(96, 165, 250, 0.18)" },
  environment: { color: "#34D399", bg: "rgba(52, 211, 153, 0.18)" },
  service: { color: "#FBBF24", bg: "rgba(251, 191, 36, 0.18)" },
  engagement: { color: "#C084FC", bg: "rgba(192, 132, 252, 0.18)" },
};

const quickActionColors: Record<string, { color: string; bg: string }> = {
  hydration: { color: "#60A5FA", bg: "rgba(96, 165, 250, 0.12)" },
  falls: { color: "#F97316", bg: "rgba(249, 115, 22, 0.12)" },
  medication: { color: "#6C7CFF", bg: "rgba(108, 124, 255, 0.12)" },
  mood: { color: "#C084FC", bg: "rgba(192, 132, 252, 0.12)" },
};

const shell: React.CSSProperties = {
  background: "#141A23",
  border: "1px solid rgba(255,255,255,0.08)",
  padding: 32,
  borderRadius: 24,
  display: "flex",
  flexDirection: "column",
  gap: 28,
  width: "100%",
};

const titleH3: React.CSSProperties = {
  margin: 0,
  fontSize: 26,
  fontWeight: 600,
  color: "#FFFFFF",
  letterSpacing: 0.3,
};

const sectionLabel: React.CSSProperties = {
  fontSize: 15,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "#7A8599",
  marginTop: 6,
  fontWeight: 600,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
  gap: 18,
};

const quickGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
  gap: 20,
};

// Muted category card (default state)
const categoryCard = (
  cat: IncidentCategory,
  isSelected = false,
): React.CSSProperties => {
  const colors = categoryColors[cat] || {
    color: "#6C7CFF",
    bg: "rgba(108, 124, 255, 0.18)",
  };
  return {
    background: isSelected ? colors.bg : "#141A23",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: isSelected ? colors.color : "#2A3342",
    padding: 22,
    borderRadius: 18,
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    textAlign: "left",
    cursor: "pointer",
    minHeight: 64,
    transition: "all 0.15s ease",
  };
};

// Quick action card (larger, more prominent)
const quickCard = (subtype: string): React.CSSProperties => {
  const colors = quickActionColors[subtype] || {
    color: "#6C7CFF",
    bg: "rgba(108, 124, 255, 0.12)",
  };
  return {
    background: "#141A23",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.color,
    padding: 26,
    borderRadius: 22,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 20,
    textAlign: "left",
    cursor: "pointer",
    minHeight: 100,
    transition: "all 0.15s ease",
  };
};

const iconBadge = (cat: IncidentCategory): React.CSSProperties => {
  const colors = categoryColors[cat] || {
    color: "#6C7CFF",
    bg: "rgba(108, 124, 255, 0.18)",
  };
  return {
    width: 60,
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 30,
    background: colors.bg,
    color: colors.color,
    borderRadius: 16,
    flexShrink: 0,
  };
};

const cardTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: "#FFFFFF",
};

const cardSub: React.CSSProperties = {
  fontSize: 15,
  color: "#B6C0D1",
};

const miniLabel: React.CSSProperties = {
  fontSize: 15,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "#7A8599",
  marginTop: 10,
  fontWeight: 600,
};

const helpIcon: React.CSSProperties = {
  width: 24,
  height: 24,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  fontWeight: 700,
  background: "rgba(108, 124, 255, 0.25)",
  color: "#6C7CFF",
  borderRadius: "50%",
  cursor: "help",
  border: "2px solid rgba(108, 124, 255, 0.5)",
  transition: "all 0.15s ease",
};

const tooltipBox: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 10px)",
  left: "50%",
  transform: "translateX(-50%)",
  background: "#1E2530",
  border: "1px solid rgba(108, 124, 255, 0.3)",
  borderRadius: 14,
  padding: 18,
  minWidth: 320,
  zIndex: 1000,
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

const tooltipBoxTitle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 10px)",
  left: 0,
  background: "#1E2530",
  border: "1px solid rgba(108, 124, 255, 0.3)",
  borderRadius: 14,
  padding: 16,
  minWidth: 280,
  maxWidth: 350,
  zIndex: 1000,
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  fontSize: 14,
  lineHeight: 1.5,
  color: "#B6C0D1",
};

const backButton: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "#141A23",
  border: "2px solid #2A3342",
  color: "#B6C0D1",
  fontSize: 20,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.15s ease",
};

const tooltipTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#6C7CFF",
  marginBottom: 14,
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const tooltipItem: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  marginBottom: 10,
};

const input: React.CSSProperties = {
  background: "#141A23",
  border: "1px solid #2A3342",
  color: "#fff",
  padding: "16px 18px",
  borderRadius: 14,
  fontSize: 18,
  minHeight: 56,
};

const optionGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
  gap: 10,
};

const optionBtn: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "2px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 15,
  fontWeight: 500,
  cursor: "pointer",
  textAlign: "center",
  transition: "all 0.15s ease",
  minHeight: 48,
};

const resetBtn: React.CSSProperties = {
  background: "#141A23",
  border: "1px solid #2A3342",
  color: "#B6C0D1",
  padding: "16px 26px",
  borderRadius: 14,
  fontSize: 18,
  fontWeight: 500,
  cursor: "pointer",
  minHeight: 56,
};

const saveBtn: React.CSSProperties = {
  background: "#6C7CFF",
  border: "none",
  color: "#fff",
  padding: "16px 32px",
  borderRadius: 14,
  fontSize: 18,
  fontWeight: 600,
  cursor: "pointer",
  minHeight: 56,
};

const settingsBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
  padding: "4px 8px",
  borderRadius: 8,
  transition: "all 0.15s ease",
};

const addQuickBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "20px",
  borderRadius: 14,
  background: "#1E2530",
  border: "2px dashed #2A3342",
  color: "#6C7CFF",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  minWidth: 200,
};
