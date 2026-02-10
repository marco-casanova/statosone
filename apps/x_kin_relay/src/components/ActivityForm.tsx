"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { supabase, hasSupabase } from "../lib/supabaseClient";
import {
  IncidentCategory,
  CATEGORY_TO_SUBTYPES,
  SUBTYPE_OPTIONS,
} from "../types/schema";
import { iconFor, a11yLabel } from "./activityIcons";
import {
  QuickActionsManager,
  QuickAction,
  loadQuickActions,
} from "./QuickActionsManager";

type Phase = "browse" | "category" | "confirm";
type MainCategory = "hydration" | "nutrition" | "personal_care" | "incident";

const MAIN_CATEGORIES: {
  id: MainCategory;
  label: string;
  subtitle: string;
  category: IncidentCategory;
  subtype?: string;
}[] = [
  {
    id: "hydration",
    label: "Hydration",
    subtitle: "Fluids consumed",
    category: "adl",
    subtype: "hydration",
  },
  {
    id: "nutrition",
    label: "Nutrition",
    subtitle: "Meals and snacks",
    category: "adl",
    subtype: "nutrition_meal",
  },
  {
    id: "personal_care",
    label: "Personal Care",
    subtitle: "Bathing Hygiene [Personal Care]",
    category: "adl",
    subtype: "bathing_hygiene",
  },
  {
    id: "incident",
    label: "Incident",
    subtitle: "Health Observation + Other",
    category: "health_observation",
  },
];

const INCIDENT_GROUPS: {
  label: string;
  items: { label: string; value: string }[];
}[] = [
  {
    label: "Respiratory",
    items: [
      { label: "Breathing difficulty", value: "breathing_difficulty" },
      { label: "Cough", value: "cough_sputum" },
      { label: "Obstruction", value: "airway_obstruction" },
      { label: "Phlegm/sputum", value: "cough_sputum" },
    ],
  },
  {
    label: "Skin Change",
    items: [
      { label: "Burn", value: "burn" },
      { label: "Rash", value: "rash" },
      { label: "Redness", value: "redness" },
      { label: "Cut/wound", value: "cut" },
      { label: "Bruise", value: "bruise" },
      { label: "Paleness", value: "pale" },
      { label: "Inflammation", value: "inflammation" },
      { label: "Bites", value: "bites" },
      { label: "Bed sore", value: "skin_breakdown" },
    ],
  },
  {
    label: "Mobility",
    items: [
      { label: "Fall", value: "falls" },
      { label: "Near miss", value: "near_miss" },
      { label: "Weakness", value: "weakness" },
      { label: "Unstable", value: "loss_of_balance" },
    ],
  },
  {
    label: "Sleep Disturbance",
    items: [
      { label: "Insomnia", value: "restlessness" },
      { label: "Drowsiness", value: "drowsiness" },
      { label: "Sleep apnea", value: "breathing_difficulty" },
      { label: "Restless legs syndrome", value: "restlessness" },
    ],
  },
  {
    label: "Gastrointestinal",
    items: [
      { label: "Urine leak", value: "urine_leak" },
      { label: "Bowel leak", value: "bowel_leak" },
      { label: "Diarrhea", value: "diarrhoea" },
      { label: "Vomiting", value: "vomiting" },
      { label: "Inappetence", value: "upset_stomach" },
    ],
  },
  {
    label: "Cognition/Behaviour",
    items: [
      { label: "Loss of consciousness", value: "loss_of_consciousness" },
      { label: "Confusion", value: "confusion" },
      { label: "Challenging behaviour", value: "challenging_behaviour" },
      { label: "Anxiety", value: "anxiety" },
      { label: "Hallucination", value: "hallucination" },
      { label: "Delusion", value: "behaviour_change" },
      { label: "Grief/sadness", value: "behaviour_change" },
    ],
  },
  {
    label: "Medication Error",
    items: [
      { label: "Missed dose", value: "medication_error" },
      { label: "Overdose", value: "medication_error" },
      { label: "Wrong med", value: "medication_error" },
      { label: "Wrong time", value: "medication_error" },
      { label: "Wrong route", value: "medication_error" },
      { label: "Refusal", value: "medication_error" },
    ],
  },
  {
    label: "Environmental Hazard",
    items: [
      { label: "Furniture", value: "environment_hazard" },
      { label: "Poor lighting", value: "environment_hazard" },
      { label: "Inadequate access", value: "environment_hazard" },
      { label: "Mould", value: "environment_hazard" },
      { label: "Chemicals", value: "environment_hazard" },
      { label: "Flooring", value: "environment_hazard" },
      { label: "Infestation", value: "environment_hazard" },
    ],
  },
  {
    label: "Other",
    items: [{ label: "Other", value: "behaviour_change" }],
  },
];

const FOOD_SUGGESTIONS = [
  "Pasta bolognesa y pan tostado",
  "Sopa",
  "Pasta de pollo con salsa",
  "Galleta con queso",
];

const ASSISTANCE_LEVELS = [
  {
    value: "independent",
    labelKey: "assistance_levels.independent.label",
    descKey: "assistance_levels.independent.desc",
  },
  {
    value: "supervision",
    labelKey: "assistance_levels.supervision.label",
    descKey: "assistance_levels.supervision.desc",
  },
  {
    value: "prompted",
    labelKey: "assistance_levels.prompted.label",
    descKey: "assistance_levels.prompted.desc",
  },
  {
    value: "assisted",
    labelKey: "assistance_levels.assisted.label",
    descKey: "assistance_levels.assisted.desc",
  },
];

interface ActivityRow {
  id: string;
  recipient_id: string;
  category: string;
  observed_at: string;
  details?: any;
  [k: string]: any;
}

// Tooltip component for assistance help
function AssistanceTooltip() {
  const t = useTranslations("app.activity_form");
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <span
        style={helpIcon}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        role="button"
        aria-label={t("aria.show_assistance_info")}
        tabIndex={0}
      >
        ?
      </span>
      {show && (
        <div style={tooltipBox}>
          <div style={tooltipTitle}>{t("assistance_levels.title")}</div>
          {ASSISTANCE_LEVELS.map((lvl) => (
            <div key={lvl.value} style={tooltipItem}>
              <strong style={{ color: "#fff" }}>{t(lvl.labelKey)}:</strong>{" "}
              <span style={{ color: "#B6C0D1" }}>{t(lvl.descKey)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ActivityForm() {
  const t = useTranslations("app.activity_form");
  const [phase, setPhase] = useState<Phase>("browse");
  const [mainCategory, setMainCategory] = useState<MainCategory | null>(null);
  const [category, setCategory] = useState<IncidentCategory | null>(null);
  const [subtype, setSubtype] = useState<string | null>(null);
  const [subtypeValue, setSubtypeValue] = useState<string | number | null>(null);
  const [hydrationValues, setHydrationValues] = useState<number[]>([]);
  const [observedAt, setObservedAt] = useState(nowLocal());
  const [assistanceLevel, setAssistanceLevel] = useState("");
  const [fluidType, setFluidType] = useState("");
  const [foodType, setFoodType] = useState("");
  const [incidentLabel, setIncidentLabel] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error" | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [showManager, setShowManager] = useState(false);

  // Client selection
  const [clients, setClients] = useState<
    { id: string; display_name: string }[]
  >([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [loadingClients, setLoadingClients] = useState(false);

  // Recent tasks/logs
  const [recentActivities, setRecentActivities] = useState<ActivityRow[]>([]);
  const [recentExpanded, setRecentExpanded] = useState(false);
  const [recentLoading, setRecentLoading] = useState(false);

  const isHydration = mainCategory === "hydration";
  const isNutrition = mainCategory === "nutrition";
  const isPersonalCare = mainCategory === "personal_care";
  const isIncident = mainCategory === "incident";
  const showAssistance = !isIncident;

  // Load clients on mount
  useEffect(() => {
    async function loadClients() {
      if (!hasSupabase || !supabase) {
        // Mock data for demo
        setClients([
          { id: "demo-client-1", display_name: "Maria Schmidt" },
          { id: "demo-client-2", display_name: "Hans Muller" },
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

  useEffect(() => {
    setQuickActions(loadQuickActions());
  }, []);

  useEffect(() => {
    loadRecentActivities();
  }, [selectedClientId, recentExpanded]);

  function resetAll() {
    setPhase("browse");
    setMainCategory(null);
    setCategory(null);
    setSubtype(null);
    setSubtypeValue(null);
    setHydrationValues([]);
    setObservedAt(nowLocal());
    setAssistanceLevel("");
    setFluidType("");
    setFoodType("");
    setIncidentLabel(null);
    setMessage(null);
    setMessageTone(null);
    setRecentExpanded(false);
  }

  function pickMainCategory(id: MainCategory) {
    const meta = MAIN_CATEGORIES.find((c) => c.id === id);
    if (!meta) return;
    setMainCategory(id);
    setCategory(meta.category);
    setSubtype(meta.subtype || null);
    setSubtypeValue(null);
    setHydrationValues([]);
    setFluidType("");
    setFoodType("");
    setIncidentLabel(null);
    setAssistanceLevel("");
    setMessage(null);
    setMessageTone(null);
    setPhase(id === "incident" ? "category" : "confirm");
  }

  function pickQuickAction(action: QuickAction) {
    const matchedMain = MAIN_CATEGORIES.find(
      (c) => c.category === action.category && c.subtype === action.subtype,
    );
    if (matchedMain) {
      setMainCategory(matchedMain.id);
    } else if (action.category === "health_observation") {
      setMainCategory("incident");
    } else {
      setMainCategory(null);
    }
    setCategory(action.category);
    setSubtype(action.subtype);
    setSubtypeValue(null);
    setHydrationValues([]);
    setFluidType("");
    setFoodType("");
    setIncidentLabel(action.subtype ? formatSubtype(action.subtype) : null);
    setAssistanceLevel("");
    setMessage(null);
    setMessageTone(null);
    setPhase("confirm");
  }

  function pickIncidentSubtype(value: string, label: string) {
    setSubtype(value);
    setIncidentLabel(label);
    setSubtypeValue(null);
    setPhase("confirm");
  }

  function toggleHydrationValue(value: number) {
    setHydrationValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function loadRecentActivities() {
    if (!selectedClientId) return;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startIso = startOfDay.toISOString();

    if (!hasSupabase || !supabase) {
      const mock: ActivityRow[] = Array.from({ length: 9 }).map((_, i) => ({
        id: `demo-${i}`,
        recipient_id: i % 2 ? "demo-client-1" : "demo-client-2",
        category: i % 2 ? "adl" : "health_observation",
        observed_at: new Date(now.getTime() - i * 60 * 60 * 1000).toISOString(),
        subtype_adl: i % 2 ? "hydration" : null,
        subtype_observation: i % 2 ? null : "breathing_difficulty",
      }));
      const filtered = mock.filter((a) => a.recipient_id === selectedClientId);
      const recent = recentExpanded
        ? filtered.filter((a) => a.observed_at >= startIso)
        : filtered.slice(0, 5);
      setRecentActivities(recent);
      return;
    }

    setRecentLoading(true);
    let query = supabase
      .from("kr_activities")
      .select("*")
      .eq("recipient_id", selectedClientId)
      .order("observed_at", { ascending: false });
    if (recentExpanded) {
      query = query.gte("observed_at", startIso).limit(200);
    } else {
      query = query.limit(5);
    }
    const { data } = await query;
    setRecentActivities(data || []);
    setRecentLoading(false);
  }

  async function save() {
    if (!category) return;
    if (isIncident && !subtype) {
      setMessage(t("messages.pick_incident_type"));
      setMessageTone("error");
      return;
    }
    if (!supabase) {
      setMessage(t("messages.saved_demo"));
      setMessageTone("success");
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

      const details: Record<string, any> = {};

      if (isHydration) {
        if (hydrationValues.length) {
          const total = hydrationValues.reduce((sum, v) => sum + Number(v), 0);
          details.values = hydrationValues;
          details.total = total;
          details.unit = "ml";
        }
        if (fluidType.trim()) details.fluid_type = fluidType.trim();
      } else if (subtypeValue !== null && subtype) {
        const options = SUBTYPE_OPTIONS[subtype];
        const selectedOption = options?.find((o) => o.value === subtypeValue);
        details.value = subtypeValue;
        details.unit = selectedOption?.unit || null;
        details.label = selectedOption?.label || null;
      }

      if (isNutrition && foodType.trim()) {
        details.food_type = foodType.trim();
      }
      if (isIncident && incidentLabel) {
        details.incident_label = incidentLabel;
      }

      if (Object.keys(details).length) payload.details = details;

      const { error } = await supabase.from("kr_activities").insert(payload);
      if (error) throw error;
      setMessage(t("messages.saved"));
      setMessageTone("success");
      resetAll();
    } catch (e: any) {
      setMessage(e.message || t("messages.save_error"));
      setMessageTone("error");
    } finally {
      setSaving(false);
    }
  }

  const canConfirm = !!category && (!isIncident || !!subtype);

  // Go back one step
  function goBack() {
    if (phase === "confirm") {
      if (isIncident) {
        setSubtype(null);
        setSubtypeValue(null);
        setPhase("category");
      } else {
        resetAll();
      }
    } else if (phase === "category") {
      resetAll();
    }
  }

  const hydrationTotal = useMemo(() => {
    if (!hydrationValues.length) return 0;
    return hydrationValues.reduce((sum, v) => sum + Number(v), 0);
  }, [hydrationValues]);

  const currentMainLabel = MAIN_CATEGORIES.find(
    (c) => c.id === mainCategory
  )?.label;
  const mainCategoryText: Record<MainCategory, { label: string; subtitle: string }> =
    {
      hydration: {
        label: t("main_categories.hydration.label"),
        subtitle: t("main_categories.hydration.subtitle"),
      },
      nutrition: {
        label: t("main_categories.nutrition.label"),
        subtitle: t("main_categories.nutrition.subtitle"),
      },
      personal_care: {
        label: t("main_categories.personal_care.label"),
        subtitle: t("main_categories.personal_care.subtitle"),
      },
      incident: {
        label: t("main_categories.incident.label"),
        subtitle: t("main_categories.incident.subtitle"),
      },
    };
  const localizedCurrentMainLabel = mainCategory
    ? mainCategoryText[mainCategory].label
    : null;
  const displayCategoryLabel = mainCategory
    ? localizedCurrentMainLabel || currentMainLabel || t("labels.category")
    : category
      ? formatCategory(category)
      : t("labels.category");
  const clientSelector = (
    <>
      <label style={miniLabel}>{t("labels.client")}</label>
      <select
        value={selectedClientId}
        onChange={(e) => setSelectedClientId(e.target.value)}
        style={input}
        aria-label={t("aria.select_client")}
        disabled={loadingClients}
      >
        {loadingClients ? (
          <option>{t("states.loading")}</option>
        ) : clients.length === 0 ? (
          <option value="">{t("states.no_clients")}</option>
        ) : (
          clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.display_name || c.id}
            </option>
          ))
        )}
      </select>
    </>
  );

  return (
    <div style={shell} aria-labelledby="af-title">
      <div style={headerRow}>
        {phase !== "browse" && (
          <button onClick={goBack} style={backButton} aria-label={t("aria.go_back")}>
            ←
          </button>
        )}
        {phase === "browse" && (
          <>
            <h3 id="af-title" style={titleH3}>
              {t("main_log")}
            </h3>
            <button
              onClick={() => setShowManager(true)}
              style={settingsBtn}
              aria-label={t("aria.configure_quick_log")}
              title={t("aria.configure_quick_actions")}
            >
              ⚙️
            </button>
          </>
        )}
      </div>

      {phase === "browse" && (
        <>
          {quickActions.length > 0 && (
            <>
              <div style={sectionLabel}>{t("sections.quick_actions")}</div>
              <div style={quickGrid}>
                {quickActions.map((q, idx) => (
                  <button
                    key={`${q.category}-${q.subtype}-${idx}`}
                    style={quickCard(q.category)}
                    onClick={() => pickQuickAction(q)}
                    aria-label={`${q.label} ${t("aria.quick_action")}`}
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
                ))}
              </div>
            </>
          )}
          <div style={sectionLabel}>{t("sections.categories")}</div>
          <div style={grid}>
            {MAIN_CATEGORIES.map((c) => {
              const txt = mainCategoryText[c.id];
              return (
                <button
                  key={c.id}
                  style={mainCategoryCard(c.id)}
                  onClick={() => pickMainCategory(c.id)}
                  aria-label={`${t("aria.select")} ${txt.label} ${t("sections.categories").toLowerCase()}`}
                >
                  <span
                    style={iconBadge(c.category)}
                    role="img"
                    aria-label={a11yLabel(c.category, c.subtype)}
                  >
                    {iconFor(c.category, c.subtype)}
                  </span>
                  <div>
                    <span style={cardTitle}>{txt.label}</span>
                    <div style={cardSub}>{txt.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {phase === "category" && isIncident && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {clientSelector}
          <div style={sectionLabel}>{t("sections.incident_types")}</div>
          {INCIDENT_GROUPS.map((group) => (
            <div
              key={group.label}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <div style={groupLabel}>{group.label}</div>
              <div style={grid}>
                {group.items.map((item) => (
                  <button
                    key={`${group.label}-${item.value}-${item.label}`}
                    style={
                      incidentCard(
                        subtype === item.value && incidentLabel === item.label
                      )
                    }
                    onClick={() => pickIncidentSubtype(item.value, item.label)}
                    aria-label={`${t("aria.pick_incident")} ${item.label}`}
                  >
                    <span
                      style={iconBadge("health_observation")}
                      role="img"
                      aria-label={a11yLabel("health_observation", item.value)}
                    >
                      {iconFor("health_observation", item.value)}
                    </span>
                    <span style={cardTitle}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {phase === "confirm" && category && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={categoryRow}>
            <span
              style={iconBadge(category)}
              role="img"
              aria-label={a11yLabel(category, subtype || undefined)}
            >
              {iconFor(category, subtype)}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={categoryTitle}>
                {displayCategoryLabel.toUpperCase()}
              </div>
              {isIncident && subtype && (
                <div style={categorySubtitle}>
                  {incidentLabel || formatSubtype(subtype)}
                </div>
              )}
            </div>
          </div>

          {clientSelector}

          <label style={miniLabel}>{t("labels.observed_at")}</label>
          <input
            type="datetime-local"
            value={observedAt}
            onChange={(e) => setObservedAt(e.target.value)}
            style={input}
            aria-label={t("labels.observed_at")}
          />

          {showAssistance && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ ...miniLabel, marginTop: 0 }}>
                  {t("labels.assistance_level")}
                </label>
                <AssistanceTooltip />
              </div>
              <select
                value={assistanceLevel}
                onChange={(e) => setAssistanceLevel(e.target.value)}
                style={input}
                aria-label={t("labels.assistance_level")}
              >
                <option value="">{t("labels.select_level")}</option>
                {ASSISTANCE_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {t(lvl.labelKey)}
                  </option>
                ))}
              </select>
            </>
          )}

          {subtype && SUBTYPE_OPTIONS[subtype] && (
            <>
              <label style={miniLabel}>{getOptionLabel(subtype)}</label>
              {isHydration && (
                <div style={helperText}>{t("helpers.hydration_multi")}</div>
              )}
              <div style={optionGrid}>
                {SUBTYPE_OPTIONS[subtype].map((opt) => {
                  const isSelected = isHydration
                    ? hydrationValues.includes(Number(opt.value))
                    : subtypeValue === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => {
                        if (isHydration) {
                          toggleHydrationValue(Number(opt.value));
                          return;
                        }
                        setSubtypeValue(opt.value);
                      }}
                      style={{
                        ...optionBtn,
                        background: isSelected
                          ? "rgba(108, 124, 255, 0.25)"
                          : "rgba(15, 23, 42, 0.04)",
                        borderColor: isSelected
                          ? "#6C7CFF"
                          : "rgba(15, 23, 42, 0.12)",
                      }}
                      aria-pressed={isSelected}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {isHydration && hydrationTotal > 0 && (
                <div style={helperText}>
                  {t("helpers.total_ml", { value: hydrationTotal })}
                </div>
              )}
            </>
          )}

          {isHydration && (
            <>
              <label style={miniLabel}>{t("labels.fluid_type_optional")}</label>
              <input
                type="text"
                value={fluidType}
                onChange={(e) => setFluidType(e.target.value)}
                style={input}
                placeholder={t("placeholders.fluid_type")}
                aria-label={t("labels.fluid_type_optional")}
              />
            </>
          )}

          {isNutrition && (
            <>
              <label style={miniLabel}>
                {t("labels.food_type_caregiver_input")}
              </label>
              <input
                type="text"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                style={input}
                placeholder={t("placeholders.food_type")}
                aria-label={t("labels.food_type_caregiver_input")}
              />
              <div style={chipRow}>
                {FOOD_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    style={chipBtn}
                    onClick={() => setFoodType(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </>
          )}

          <div style={recentSection}>
            <div style={recentHeader}>
              <div style={miniLabel}>{t("sections.recent_tasks")}</div>
              <button
                type="button"
                style={linkBtn}
                onClick={() => setRecentExpanded((v) => !v)}
              >
                {recentExpanded ? t("actions.collapse") : t("actions.expand")}
              </button>
            </div>
            {recentLoading ? (
              <div style={helperText}>{t("states.loading")}</div>
            ) : recentActivities.length === 0 ? (
              <div style={helperText}>{t("states.no_tasks")}</div>
            ) : (
              <div style={recentList}>
                {recentActivities.map((a) => (
                  <div key={a.id} style={recentItem}>
                    <div style={recentTitle}>{primaryLabel(a)}</div>
                    <div style={recentMeta}>{formattedTime(a.observed_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              {saving ? t("actions.saving") : t("actions.save")}
            </button>
            <button onClick={resetAll} style={resetBtn}>
              {t("actions.cancel")}
            </button>
          </div>
          {message && (
            <div
              style={{
                fontSize: 13,
                padding: "10px 14px",
                borderRadius: 10,
                background: messageTone === "success"
                  ? "rgba(34, 197, 94, 0.15)"
                  : "rgba(239, 68, 68, 0.15)",
                color: messageTone === "success"
                  ? "#22C55E"
                  : "#EF4444",
              }}
            >
              {message}
            </div>
          )}
        </div>
      )}
      {showManager && (
        <QuickActionsManager
          onClose={() => setShowManager(false)}
          onSave={(actions) => setQuickActions(actions)}
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
    d.getHours()
  )}:${p(d.getMinutes())}`;
}
function formatCategory(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
const formatSubtype = formatCategory;

function formattedTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

function primaryLabel(a: ActivityRow) {
  const subK = Object.keys(a).find(
    (k) => k.startsWith("subtype_") && a[k] && typeof a[k] === "string"
  );
  const subtype = subK ? a[subK] : null;
  if (subtype) return formatSubtype(subtype);
  return formatCategory(a.category);
}

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
    // Health Observation / Incident
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
    environment_hazard: "Hazard type",
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

const MAIN_CATEGORY_COLORS: Record<MainCategory, { color: string; bg: string }> =
  {
    hydration: { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.18)" },
    nutrition: { color: "#22C55E", bg: "rgba(34, 197, 94, 0.18)" },
    personal_care: { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.18)" },
    incident: { color: "#14B8A6", bg: "rgba(20, 184, 166, 0.18)" },
  };

const categoryColors: Record<string, { color: string; bg: string }> = {
  safety: { color: "#F97316", bg: "rgba(249, 115, 22, 0.18)" },
  health_observation: { color: "#2DD4BF", bg: "rgba(45, 212, 191, 0.18)" },
  adl: { color: "#60A5FA", bg: "rgba(96, 165, 250, 0.18)" },
  environment: { color: "#34D399", bg: "rgba(52, 211, 153, 0.18)" },
  service: { color: "#FBBF24", bg: "rgba(251, 191, 36, 0.18)" },
  engagement: { color: "#C084FC", bg: "rgba(192, 132, 252, 0.18)" },
};

const shell: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.5)",
  backdropFilter: "blur(24px)",
  border: "1px solid rgba(255, 255, 255, 0.6)",
  padding: 36,
  borderRadius: 24,
  display: "flex",
  flexDirection: "column",
  gap: 32,
  width: "100%",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)",
};

const titleH3: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 700,
  color: "#1A1A1A",
  letterSpacing: "-0.02em",
};

const sectionLabel: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1.5,
  color: "#4A4A4A",
  marginTop: 8,
  fontWeight: 700,
};

const headerRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  justifyContent: "space-between",
};

const settingsBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
  padding: "4px 8px",
  borderRadius: 8,
  color: "#1A1A1A",
};

const groupLabel: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1.3,
  color: "#6B7280",
  fontWeight: 700,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
  gap: 18,
};

const quickGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
  gap: 16,
};

const mainCategoryCard = (cat: MainCategory): React.CSSProperties => {
  const colors = MAIN_CATEGORY_COLORS[cat];
  return {
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(12px)",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.color,
    padding: 20,
    borderRadius: 16,
    color: "#1A1A1A",
    display: "flex",
    alignItems: "center",
    gap: 14,
    textAlign: "left",
    cursor: "pointer",
    minHeight: 90,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)",
  };
};

const quickCard = (cat: IncidentCategory): React.CSSProperties => {
  const colors = categoryColors[cat] || {
    color: "#6C7CFF",
    bg: "rgba(108, 124, 255, 0.18)",
  };
  return {
    background: "rgba(255, 255, 255, 0.92)",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.color,
    padding: 18,
    borderRadius: 16,
    color: "#1A1A1A",
    display: "flex",
    alignItems: "center",
    gap: 14,
    textAlign: "left",
    cursor: "pointer",
    minHeight: 90,
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
    transition: "all 0.2s ease",
  };
};

const incidentCard = (isSelected = false): React.CSSProperties => {
  return {
    background: isSelected ? "rgba(20, 184, 166, 0.12)" : "#fff",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: isSelected ? "#14B8A6" : "rgba(0,0,0,0.08)",
    padding: 16,
    borderRadius: 14,
    color: "#1A1A1A",
    display: "flex",
    alignItems: "center",
    gap: 12,
    textAlign: "left",
    cursor: "pointer",
    minHeight: 70,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
  };
};

const iconBadge = (cat: IncidentCategory): React.CSSProperties => {
  const colors = categoryColors[cat] || {
    color: "#6C7CFF",
    bg: "rgba(108, 124, 255, 0.18)",
  };
  return {
    width: 50,
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    background: colors.bg,
    color: colors.color,
    borderRadius: 14,
    flexShrink: 0,
  };
};

const cardTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: "#1A1A1A",
};

const cardSub: React.CSSProperties = {
  fontSize: 14,
  color: "#4A4A4A",
};

const categoryRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const categoryTitle: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1.4,
  color: "#4A4A4A",
  fontWeight: 700,
};

const categorySubtitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: "#1A1A1A",
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

const backButton: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "#F5F5F5",
  border: "2px solid #D1D5DB",
  color: "#4A4A4A",
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
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(12px)",
  border: "2px solid rgba(0, 0, 0, 0.15)",
  color: "#1A1A1A",
  padding: "18px 20px",
  borderRadius: 14,
  fontSize: 17,
  fontWeight: 500,
  minHeight: 60,
  transition: "all 0.2s ease",
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
  background: "rgba(15, 23, 42, 0.04)",
  color: "#1A1A1A",
  fontSize: 15,
  fontWeight: 500,
  cursor: "pointer",
  textAlign: "center",
  transition: "all 0.15s ease",
  minHeight: 48,
};

const helperText: React.CSSProperties = {
  fontSize: 13,
  color: "#6B7280",
  marginTop: 4,
};

const resetBtn: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(12px)",
  border: "2px solid rgba(0, 0, 0, 0.15)",
  color: "#1A1A1A",
  padding: "18px 28px",
  borderRadius: 14,
  fontSize: 17,
  fontWeight: 600,
  cursor: "pointer",
  minHeight: 60,
  transition: "all 0.2s ease",
};

const saveBtn: React.CSSProperties = {
  background: "#F5D547",
  border: "none",
  color: "#1A1A1A",
  padding: "18px 36px",
  borderRadius: 14,
  fontSize: 17,
  fontWeight: 700,
  cursor: "pointer",
  minHeight: 60,
  boxShadow: "0 6px 16px rgba(245, 213, 71, 0.4)",
  transition: "all 0.2s ease",
};

const chipRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const chipBtn: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.04)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  color: "#1A1A1A",
  padding: "8px 12px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const recentSection: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: "16px",
  borderRadius: 16,
  background: "rgba(15, 23, 42, 0.04)",
};

const recentHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const linkBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#2563EB",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const recentList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const recentItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "8px 10px",
  borderRadius: 10,
  background: "rgba(255, 255, 255, 0.9)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
};

const recentTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#111827",
};

const recentMeta: React.CSSProperties = {
  fontSize: 12,
  color: "#6B7280",
};
