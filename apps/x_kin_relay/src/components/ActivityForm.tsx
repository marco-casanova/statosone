"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Accessibility } from "lucide-react";
import { supabase, hasSupabase } from "../lib/supabaseClient";
import {
  IncidentCategory,
  CATEGORY_TO_SUBTYPES,
  SUBTYPE_OPTIONS,
  CARE_UI_CATEGORIES,
  SUBTYPE_OPTION_LABELS,
  UiCareCategoryId,
  UiCareSubtypeItem,
} from "../types/schema";
import {
  BODY_MAP_ENABLED_TYPES,
  BodyLocation,
  bodyLocationKey,
  bodyLocationLabel,
} from "../types/bodyLocation";
import { iconFor, a11yLabel } from "./activityIcons";
import { BodyLocationPicker } from "./BodyLocationPicker";
import {
  QuickActionsManager,
  QuickAction,
  loadQuickActions,
  saveQuickActions,
} from "./QuickActionsManager";

type Phase = "browse" | "confirm";
type MainCategory = UiCareCategoryId;

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
              <strong style={{ color: "#1A1A1A" }}>{t(lvl.labelKey)}:</strong>{" "}
              <span style={{ color: "#374151" }}>{t(lvl.descKey)}</span>
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
  const [subtypeValue, setSubtypeValue] = useState<string | number | null>(
    null,
  );
  const [hydrationValues, setHydrationValues] = useState<number[]>([]);
  const [observedAt, setObservedAt] = useState(nowLocal());
  const [assistanceLevel, setAssistanceLevel] = useState("");
  const [fluidType, setFluidType] = useState("");
  const [foodType, setFoodType] = useState("");
  const [bodyLocations, setBodyLocations] = useState<BodyLocation[]>([]);
  const [showBodyMapDialog, setShowBodyMapDialog] = useState(false);
  const [selectedIncidentIssueKeys, setSelectedIncidentIssueKeys] = useState<
    string[]
  >([]);
  const [openIncidentGroups, setOpenIncidentGroups] = useState<string[]>([]);
  const [incidentIssueFilter, setIncidentIssueFilter] = useState("");
  const [selectedSubtypeLabel, setSelectedSubtypeLabel] = useState<
    string | null
  >(null);
  const [subtypeDetailsPreset, setSubtypeDetailsPreset] = useState<Record<
    string,
    string | number | boolean
  > | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error" | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [showManager, setShowManager] = useState(false);
  const [hoveredQuickIdx, setHoveredQuickIdx] = useState<number | null>(null);

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

  const selectedMainCategory = useMemo(
    () => CARE_UI_CATEGORIES.find((c) => c.id === mainCategory) || null,
    [mainCategory],
  );
  const selectedSubtypeGroups = selectedMainCategory?.groups || [];
  const selectedSubtypeItems = useMemo(
    () => selectedSubtypeGroups.flatMap((group) => group.items),
    [selectedSubtypeGroups],
  );
  const isHydration = subtype === "hydration";
  const isNutrition = isNutritionSubtype(subtype);
  const isIncident = mainCategory === "incident";
  const filteredIncidentGroups = useMemo(() => {
    if (!isIncident || !selectedMainCategory) {
      return [];
    }
    const query = incidentIssueFilter.trim().toLowerCase();
    if (!query) {
      return selectedMainCategory.groups;
    }
    return selectedMainCategory.groups
      .map((group) => {
        const matchesGroup = group.label.toLowerCase().includes(query);
        return {
          ...group,
          items: matchesGroup
            ? group.items
            : group.items.filter((item) =>
                item.label.toLowerCase().includes(query),
              ),
        };
      })
      .filter((group) => group.items.length > 0);
  }, [incidentIssueFilter, isIncident, selectedMainCategory]);
  const selectedIncidentIssueItems = useMemo(
    () =>
      selectedSubtypeItems.filter((item) =>
        selectedIncidentIssueKeys.includes(incidentIssueKey(item)),
      ),
    [selectedIncidentIssueKeys, selectedSubtypeItems],
  );
  const selectedIncidentBodyMapItems = useMemo(
    () =>
      selectedIncidentIssueItems.filter((item) =>
        BODY_MAP_ENABLED_TYPES.includes(
          item.subtype as (typeof BODY_MAP_ENABLED_TYPES)[number],
        ),
      ),
    [selectedIncidentIssueItems],
  );
  const showAssistance = category === "adl";
  const showBodyLocationPicker =
    isIncident && selectedIncidentBodyMapItems.length > 0;

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

  useEffect(() => {
    if (!showBodyLocationPicker && bodyLocations.length > 0) {
      setBodyLocations([]);
    }
    if (!showBodyLocationPicker) {
      setShowBodyMapDialog(false);
    }
  }, [bodyLocations.length, showBodyLocationPicker]);

  useEffect(() => {
    if (!isIncident || !selectedMainCategory) {
      setOpenIncidentGroups([]);
      setIncidentIssueFilter("");
      return;
    }
    setOpenIncidentGroups(
      selectedMainCategory.groups.slice(0, 2).map((group) => group.label),
    );
    setIncidentIssueFilter("");
  }, [isIncident, selectedMainCategory]);

  useEffect(() => {
    if (!isIncident) {
      return;
    }
    if (filteredIncidentGroups.length === 0) {
      setOpenIncidentGroups([]);
      return;
    }
    setOpenIncidentGroups((prev) => {
      const available = new Set(filteredIncidentGroups.map((group) => group.label));
      const retained = prev.filter((label) => available.has(label));
      if (retained.length > 0) {
        return retained;
      }
      return [filteredIncidentGroups[0].label];
    });
  }, [filteredIncidentGroups, isIncident]);

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
    setBodyLocations([]);
    setShowBodyMapDialog(false);
    setSelectedIncidentIssueKeys([]);
    setOpenIncidentGroups([]);
    setIncidentIssueFilter("");
    setSelectedSubtypeLabel(null);
    setSubtypeDetailsPreset(null);
    setMessage(null);
    setMessageTone(null);
    setRecentExpanded(false);
  }

  function clearActiveSubtypeSelection() {
    setCategory(null);
    setSubtype(null);
    setSubtypeValue(null);
    setHydrationValues([]);
    setAssistanceLevel("");
    setFluidType("");
    setFoodType("");
    setSelectedSubtypeLabel(null);
    setSubtypeDetailsPreset(null);
    setMessage(null);
    setMessageTone(null);
  }

  function applySubtypeSelection(item: UiCareSubtypeItem, label?: string) {
    const nextSubtype = item.subtype;
    const nextCategory = item.category;
    const currentIsNutrition = isNutritionSubtype(subtype);
    const nextIsNutrition = isNutritionSubtype(nextSubtype);
    const isSameHydrationSubtype =
      subtype === "hydration" && nextSubtype === "hydration";
    const isSameNutritionFamily = currentIsNutrition && nextIsNutrition;
    const subtypeChanged = nextSubtype !== subtype || nextCategory !== category;
    const preserveOptionSelection =
      !subtypeChanged || isSameNutritionFamily || isSameHydrationSubtype;

    if (!isSameHydrationSubtype) {
      setHydrationValues([]);
    }
    if (!isSameNutritionFamily) {
      setFoodType("");
    }
    if (!preserveOptionSelection) {
      setSubtypeValue(null);
    }
    if (subtypeChanged) {
      setAssistanceLevel("");
    }

    setCategory(item.category);
    setSubtype(nextSubtype);
    setSelectedSubtypeLabel(label || item.label || formatSubtype(nextSubtype));
    setSubtypeDetailsPreset(item.detailsPreset || null);
    if (nextSubtype === "hydration") {
      if (typeof item.detailsPreset?.fluid_type === "string") {
        setFluidType(item.detailsPreset.fluid_type);
      } else if (!isSameHydrationSubtype) {
        setFluidType("");
      }
    } else {
      setFluidType("");
    }
    setMessage(null);
    setMessageTone(null);
  }

  function pickMainCategory(id: MainCategory) {
    const meta = CARE_UI_CATEGORIES.find((c) => c.id === id);
    if (!meta) return;
    const items = meta.groups.flatMap((group) => group.items);
    const firstItem = items[0];
    if (!firstItem) return;
    setMainCategory(id);
    setSelectedIncidentIssueKeys([]);
    if (id === "incident") {
      clearActiveSubtypeSelection();
      setPhase("confirm");
      return;
    }
    applySubtypeSelection(firstItem);
    setPhase("confirm");
  }

  function pickQuickAction(action: QuickAction) {
    const matchedMain = action.mainCategoryId
      ? CARE_UI_CATEGORIES.find((c) => c.id === action.mainCategoryId)
      : CARE_UI_CATEGORIES.find((c) =>
          c.groups.some((group) =>
            group.items.some(
              (item) =>
                item.category === action.category &&
                item.subtype === action.subtype &&
                item.label === action.label,
            ),
          ),
        );

    const matchedItem = matchedMain?.groups
      .flatMap((group) => group.items)
      .find(
        (item) =>
          item.category === action.category &&
          item.subtype === action.subtype &&
          item.label === action.label,
      );

    setSubtypeValue(null);
    setHydrationValues([]);
    setFluidType("");
    setFoodType("");
    setBodyLocations([]);
    setShowBodyMapDialog(false);
    setSelectedIncidentIssueKeys([]);
    setOpenIncidentGroups([]);
    setIncidentIssueFilter("");
    setAssistanceLevel("");
    setMessage(null);
    setMessageTone(null);

    if (matchedMain && matchedItem) {
      setMainCategory(matchedMain.id);
      if (matchedMain.id === "incident") {
        setSelectedIncidentIssueKeys([incidentIssueKey(matchedItem)]);
      }
      applySubtypeSelection(
        {
          ...matchedItem,
          detailsPreset: action.detailsPreset || matchedItem.detailsPreset,
        },
        action.label,
      );
      setPhase("confirm");
      return;
    }

    setMainCategory(null);
    setCategory(action.category);
    setSubtype(action.subtype);
    setSelectedSubtypeLabel(action.label || formatSubtype(action.subtype));
    setSubtypeDetailsPreset(action.detailsPreset || null);
    setPhase("confirm");
  }

  function pickSubtype(item: UiCareSubtypeItem) {
    if (isIncident) {
      const issueGroupLabel = selectedMainCategory?.groups.find((group) =>
        group.items.some(
          (candidate) => incidentIssueKey(candidate) === incidentIssueKey(item),
        ),
      )?.label;
      if (issueGroupLabel) {
        setOpenIncidentGroups((prev) =>
          prev.includes(issueGroupLabel) ? prev : [...prev, issueGroupLabel],
        );
      }
      const issueKey = incidentIssueKey(item);
      const isSelected = selectedIncidentIssueKeys.includes(issueKey);

      if (isSelected) {
        const nextKeys = selectedIncidentIssueKeys.filter((key) => key !== issueKey);
        setSelectedIncidentIssueKeys(nextKeys);

        if (
          subtype === item.subtype &&
          category === item.category &&
          selectedSubtypeLabel === item.label
        ) {
          const nextItem = selectedSubtypeItems.find((candidate) =>
            nextKeys.includes(incidentIssueKey(candidate)),
          );
          if (nextItem) {
            applySubtypeSelection(nextItem);
          } else {
            clearActiveSubtypeSelection();
          }
        }
        return;
      }

      setSelectedIncidentIssueKeys([...selectedIncidentIssueKeys, issueKey]);
      applySubtypeSelection(item);
      return;
    }

    applySubtypeSelection(item);
  }

  function toggleIncidentGroup(label: string) {
    setOpenIncidentGroups((prev) => (prev.includes(label) ? [] : [label]));
  }

  function isInQuickActions(item: UiCareSubtypeItem): boolean {
    return quickActions.some(
      (qa) =>
        qa.category === item.category &&
        qa.subtype === item.subtype &&
        qa.label === item.label &&
        qa.mainCategoryId === mainCategory,
    );
  }

  function toggleQuickAction(item: UiCareSubtypeItem, event: React.MouseEvent) {
    event.stopPropagation();
    const inQuickActions = isInQuickActions(item);
    let newActions: QuickAction[];

    if (inQuickActions) {
      newActions = quickActions.filter(
        (qa) =>
          !(
            qa.category === item.category &&
            qa.subtype === item.subtype &&
            qa.label === item.label &&
            qa.mainCategoryId === mainCategory
          ),
      );
    } else {
      const newAction: QuickAction = {
        category: item.category,
        subtype: item.subtype,
        label: item.label,
        mainCategoryId: mainCategory || undefined,
        detailsPreset: item.detailsPreset,
      };
      newActions = [...quickActions, newAction];
    }

    setQuickActions(newActions);
    saveQuickActions(newActions);
  }

  function toggleHydrationValue(value: number) {
    setHydrationValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  async function loadRecentActivities() {
    if (!selectedClientId) return;
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
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
    const hasIncidentIssueSelection = selectedIncidentIssueItems.length > 0;
    if (!category) return;
    if ((isIncident && !hasIncidentIssueSelection) || !subtype) {
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Unauthorized");
      }

      const metaDef = CATEGORY_TO_SUBTYPES[category];
      const payload: any = {
        category,
        observed_at: new Date(observedAt).toISOString(),
        recipient_id: selectedClientId || null,
        recorded_by: user.id,
      };
      if (subtype) payload[metaDef.key] = subtype;
      if (assistanceLevel) payload.assistance_level = assistanceLevel;

      const details: Record<string, any> = {};
      if (subtypeDetailsPreset) {
        Object.assign(details, subtypeDetailsPreset);
      }

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
      if (selectedSubtypeLabel) {
        details.subcategory_label = selectedSubtypeLabel;
      }
      if (isIncident && selectedIncidentIssueItems.length) {
        details.issue_types = selectedIncidentIssueItems.map((item) => ({
          key: incidentIssueKey(item),
          label: item.label,
          subtype: item.subtype,
          category: item.category,
        }));
      }
      if (bodyLocations.length) {
        details.body_locations = bodyLocations;
      }

      if (Object.keys(details).length) payload.details = details;

      // Support mixed DB variants:
      // - strict RLS expects created_by/caregiver_id ownership
      // - lightweight schema may not have those columns
      const insertWithOwners = {
        ...payload,
        created_by: user.id,
        caregiver_id: user.id,
      };

      let { error } = await supabase
        .from("kr_activities")
        .insert(insertWithOwners);
      if (
        error &&
        /column .* does not exist|created_by|caregiver_id/i.test(
          error.message || "",
        )
      ) {
        ({ error } = await supabase.from("kr_activities").insert(payload));
      }
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

  const canConfirm = isIncident
    ? selectedIncidentIssueItems.length > 0 && !!category && !!subtype
    : !!category && !!subtype;

  // Go back one step
  function goBack() {
    if (phase === "confirm") {
      resetAll();
    }
  }

  function removeQuickAction(idx: number, e: React.MouseEvent) {
    e.stopPropagation();
    const newActions = quickActions.filter((_, i) => i !== idx);
    setQuickActions(newActions);
    saveQuickActions(newActions);
  }

  const hydrationTotal = useMemo(() => {
    if (!hydrationValues.length) return 0;
    return hydrationValues.reduce((sum, v) => sum + Number(v), 0);
  }, [hydrationValues]);

  const displayCategoryLabel = mainCategory
    ? selectedMainCategory?.label || t("labels.category")
    : category
      ? formatCategory(category)
      : t("labels.category");
  const displaySubtypeLabel =
    isIncident && selectedIncidentIssueItems.length > 1
      ? `${selectedIncidentIssueItems.length} issue types selected`
      : selectedSubtypeLabel || (subtype ? formatSubtype(subtype) : null);
  const hasSubtypeChoices = selectedSubtypeItems.length > 1;
  const showSubtypeSelector =
    !!selectedMainCategory && hasSubtypeChoices && !isIncident;
  const showIncidentIssueType = isIncident && hasSubtypeChoices;
  const displayIconCategory =
    category || selectedMainCategory?.iconCategory || "safety";
  const subcategorySectionLabel = isIncident
    ? t("sections.incident_types")
    : "Subcategories";
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
          <button
            onClick={goBack}
            style={backButton}
            aria-label={t("aria.go_back")}
          >
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
                  <div
                    key={`${q.category}-${q.subtype}-${idx}`}
                    style={{ position: "relative" }}
                    onMouseEnter={() => setHoveredQuickIdx(idx)}
                    onMouseLeave={() => setHoveredQuickIdx(null)}
                  >
                    <button
                      style={{ ...quickCard(q.category), width: "100%" }}
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
                      <div style={{ minWidth: 0, overflow: "hidden" }}>
                        <span style={cardTitle}>{q.label}</span>
                        <div style={cardSub}>{formatCategory(q.category)}</div>
                      </div>
                    </button>
                    {hoveredQuickIdx === idx && (
                      <button
                        onClick={(e) => removeQuickAction(idx, e)}
                        style={quickDeleteBtn}
                        aria-label={`Remove ${q.label} from quick actions`}
                        title="Remove from quick actions"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={sectionLabel}>{t("sections.categories")}</div>
          <div style={grid}>
            {CARE_UI_CATEGORIES.map((c) => {
              const firstItem = c.groups[0]?.items[0];
              return (
                <button
                  type="button"
                  key={c.id}
                  style={mainCategoryCard(c.id)}
                  onClick={() => pickMainCategory(c.id)}
                  aria-label={`${t("aria.select")} ${c.label} ${t("sections.categories").toLowerCase()}`}
                >
                  <span
                    style={iconBadge(c.iconCategory)}
                    role="img"
                    aria-label={a11yLabel(c.iconCategory, firstItem?.subtype)}
                  >
                    {iconFor(c.iconCategory, firstItem?.subtype)}
                  </span>
                  <div style={{ minWidth: 0, overflow: "hidden" }}>
                    <span style={cardTitle}>{c.label}</span>
                    <div style={cardSub}>{c.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {phase === "confirm" && (category || isIncident) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={categoryRow}>
            <span
              style={iconBadge(displayIconCategory)}
              role="img"
              aria-label={a11yLabel(displayIconCategory, subtype || undefined)}
            >
              {iconFor(displayIconCategory, subtype)}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={categoryTitle}>
                {displayCategoryLabel.toUpperCase()}
              </div>
              {displaySubtypeLabel && (
                <div style={categorySubtitle}>{displaySubtypeLabel}</div>
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

          {showIncidentIssueType && (
            <>
              <label style={miniLabel}>Issue type</label>
              <div style={incidentFilterWrap}>
                <input
                  type="search"
                  value={incidentIssueFilter}
                  onChange={(e) => setIncidentIssueFilter(e.target.value)}
                  placeholder="Filter issue types"
                  aria-label="Filter issue types"
                  style={incidentIssueFilterInput}
                />
              </div>
              <div style={incidentAccordionList}>
                {filteredIncidentGroups.length > 0 ? (
                  filteredIncidentGroups.map((group) => {
                    const isOpen = openIncidentGroups.includes(group.label);
                    const selectedCount = group.items.filter((item) =>
                      selectedIncidentIssueKeys.includes(incidentIssueKey(item)),
                    ).length;
                    const supportsBodyMap = group.items.some((item) =>
                      BODY_MAP_ENABLED_TYPES.includes(
                        item.subtype as (typeof BODY_MAP_ENABLED_TYPES)[number],
                      ),
                    );
                    return (
                      <section key={group.label} style={incidentAccordionCard}>
                        <button
                          type="button"
                          style={incidentAccordionHeader}
                          onClick={() => toggleIncidentGroup(group.label)}
                          aria-expanded={isOpen}
                        >
                          <div style={incidentAccordionTitleWrap}>
                            <span style={incidentAccordionTitle}>{group.label}</span>
                            {supportsBodyMap && (
                              <span style={incidentAccordionHint}>
                                Body map available
                              </span>
                            )}
                          </div>
                          <div style={incidentAccordionMeta}>
                            {selectedCount > 0 && (
                              <span style={incidentAccordionCount}>
                                {selectedCount} selected
                              </span>
                            )}
                            <span style={incidentAccordionChevron}>
                              {isOpen ? "−" : "+"}
                            </span>
                          </div>
                        </button>
                        {isOpen && (
                          <div style={incidentAccordionBody}>
                            {supportsBodyMap && (
                              <div style={helperText}>
                                Select an issue, then use the body icon to map the
                                affected area.
                              </div>
                            )}
                            <div style={issueTypeGrid}>
                              {group.items.map((item) => {
                                const isSelected = selectedIncidentIssueKeys.includes(
                                  incidentIssueKey(item),
                                );
                                const itemSupportsBodyMap = BODY_MAP_ENABLED_TYPES.includes(
                                  item.subtype as (typeof BODY_MAP_ENABLED_TYPES)[number],
                                );
                                return (
                                  <div
                                    key={`incident-issue-${incidentIssueKey(item)}`}
                                    style={issueTypeCardWrap}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => pickSubtype(item)}
                                      style={{
                                        ...optionBtn,
                                        ...issueTypeBtn,
                                        paddingRight:
                                          isSelected && itemSupportsBodyMap
                                            ? 56
                                            : optionBtn.padding,
                                        background: isSelected
                                          ? "rgba(108, 124, 255, 0.25)"
                                          : "rgba(15, 23, 42, 0.04)",
                                        borderColor: isSelected
                                          ? "#6C7CFF"
                                          : "rgba(15, 23, 42, 0.12)",
                                      }}
                                      aria-label={`${t("aria.pick_incident")} ${item.label}`}
                                      aria-pressed={isSelected}
                                    >
                                      {item.label}
                                    </button>
                                    {isSelected && itemSupportsBodyMap && (
                                      <button
                                        type="button"
                                        style={bodyMapIconBtn}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setShowBodyMapDialog(true);
                                        }}
                                        aria-label={`Open body map for ${item.label}`}
                                        title={`Open body map for ${item.label}`}
                                      >
                                        <Accessibility size={16} strokeWidth={2.2} />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </section>
                    );
                  })
                ) : (
                  <div style={incidentEmptyState}>No issue types match this filter.</div>
                )}
              </div>
              {showBodyLocationPicker && bodyLocations.length > 0 && (
                <div style={bodyLocationChipSummary}>
                  {bodyLocations.map((location) => (
                    <span
                      key={bodyLocationKey(location)}
                      style={bodyLocationChip}
                    >
                      {bodyLocationLabel(location)}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {showSubtypeSelector && (
            <div style={subtypeSelectorSection}>
              <div style={sectionLabel}>{subcategorySectionLabel}</div>
              {selectedMainCategory.groups.map((group) => (
                <div
                  key={group.label}
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div style={groupLabel}>{group.label}</div>
                  <div style={subtypeGrid}>
                    {group.items.map((item) => {
                      const isSelected =
                        subtype === item.subtype &&
                        category === item.category &&
                        selectedSubtypeLabel === item.label;
                      const isInQuick = isInQuickActions(item);
                      return (
                        <div
                          key={`${group.label}-${item.subtype}-${item.label}-${item.category}`}
                          style={subtypeCardWrap}
                        >
                          <button
                            type="button"
                            style={subtypeCard(isSelected)}
                            onClick={() => pickSubtype(item)}
                            aria-label={`${t("aria.select")} ${item.label}`}
                          >
                            <span
                              style={compactIconBadge(item.category)}
                              role="img"
                              aria-label={a11yLabel(item.category, item.subtype)}
                            >
                              {iconFor(item.category, item.subtype, 20)}
                            </span>
                            <span style={subtypeCardLabel}>{item.label}</span>
                          </button>
                          <button
                            type="button"
                            style={starButton(isInQuick)}
                            onClick={(e) => toggleQuickAction(item, e)}
                            aria-label={
                              isInQuick
                                ? t("aria.remove_from_quick_log")
                                : t("aria.add_to_quick_log")
                            }
                            title={
                              isInQuick
                                ? t("aria.remove_from_quick_log")
                                : t("aria.add_to_quick_log")
                            }
                          >
                            {isInQuick ? "★" : "☆"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

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

          {!isIncident && subtype && SUBTYPE_OPTIONS[subtype] && (
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
                background:
                  messageTone === "success"
                    ? "rgba(34, 197, 94, 0.15)"
                    : "rgba(239, 68, 68, 0.15)",
                color: messageTone === "success" ? "#22C55E" : "#EF4444",
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
      {showBodyMapDialog && showBodyLocationPicker && (
        <div style={dialogOverlay} role="dialog" aria-modal="true" aria-labelledby="body-map-title">
          <button
            type="button"
            style={dialogBackdrop}
            aria-label="Close body map dialog"
            onClick={() => setShowBodyMapDialog(false)}
          />
          <div style={dialogCard}>
            <div style={dialogHeader}>
              <div>
                <div id="body-map-title" style={dialogTitle}>
                  Body location
                </div>
                <div style={dialogSubtitle}>
                  Tap the area where it happened. You can select more than one.
                </div>
              </div>
              <button
                type="button"
                style={dialogCloseBtn}
                aria-label="Close body map dialog"
                onClick={() => setShowBodyMapDialog(false)}
              >
                ×
              </button>
            </div>
            <BodyLocationPicker
              value={bodyLocations}
              onChange={setBodyLocations}
              embedded
            />
          </div>
        </div>
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
function incidentIssueKey(item: UiCareSubtypeItem) {
  return item.itemKey || `${item.category}::${item.subtype}::${item.label}`;
}
function isNutritionSubtype(value: string | null) {
  return value === "nutrition_meal" || value === "feeding";
}

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
    (k) => k.startsWith("subtype_") && a[k] && typeof a[k] === "string",
  );
  const subtype = subK ? a[subK] : null;
  if (subtype) return formatSubtype(subtype);
  return formatCategory(a.category);
}

// Get label for subtype options based on subtype
function getOptionLabel(subtype: string): string {
  return SUBTYPE_OPTION_LABELS[subtype] || "Select option";
}

const MAIN_CATEGORY_COLORS: Record<
  MainCategory,
  { color: string; bg: string }
> = {
  sleep_pattern: { color: "#0EA5E9", bg: "rgba(14, 165, 233, 0.18)" },
  personal_care: { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.18)" },
  hydration: { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.18)" },
  nutrition: { color: "#22C55E", bg: "rgba(34, 197, 94, 0.18)" },
  mobility: { color: "#F97316", bg: "rgba(249, 115, 22, 0.18)" },
  continence_incontinence: {
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.18)",
  },
  activity: { color: "#14B8A6", bg: "rgba(20, 184, 166, 0.18)" },
  medication_administration: {
    color: "#FBBF24",
    bg: "rgba(251, 191, 36, 0.18)",
  },
  behavior_pattern: { color: "#475569", bg: "rgba(71, 85, 105, 0.18)" },
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
    overflow: "hidden",
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
    overflow: "hidden",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
    transition: "all 0.2s ease",
  };
};

const quickDeleteBtn: React.CSSProperties = {
  position: "absolute",
  top: 6,
  right: 6,
  width: 22,
  height: 22,
  borderRadius: "50%",
  border: "none",
  background: "rgba(0,0,0,0.55)",
  color: "#fff",
  fontSize: 14,
  lineHeight: "22px",
  textAlign: "center",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  zIndex: 10,
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
    position: "relative",
  };
};

const subtypeSelectorSection: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
};

const subtypeGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
  gap: 14,
};

const subtypeCardWrap: React.CSSProperties = {
  position: "relative",
};

const subtypeCard = (isSelected = false): React.CSSProperties => ({
  ...incidentCard(isSelected),
  width: "100%",
  minHeight: 78,
  paddingRight: 52,
});

const compactIconBadge = (cat: IncidentCategory): React.CSSProperties => ({
  ...iconBadge(cat),
  width: 40,
  height: 40,
  borderRadius: 12,
});

const subtypeCardLabel: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "#1A1A1A",
  lineHeight: 1.35,
};

const starButton = (isActive: boolean): React.CSSProperties => {
  return {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "none",
    background: isActive ? "rgba(251, 191, 36, 0.25)" : "rgba(0, 0, 0, 0.06)",
    color: isActive ? "#FBBF24" : "#9CA3AF",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    zIndex: 1,
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
  display: "block",
  wordBreak: "break-word",
  overflowWrap: "break-word",
};

const cardSub: React.CSSProperties = {
  fontSize: 14,
  color: "#4A4A4A",
  wordBreak: "break-word",
  overflowWrap: "break-word",
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
  background: "rgba(136, 185, 176, 0.25)",
  color: "#4A7A72",
  borderRadius: "50%",
  cursor: "help",
  border: "2px solid rgba(136, 185, 176, 0.5)",
  transition: "all 0.15s ease",
};

const tooltipBox: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 10px)",
  left: "50%",
  transform: "translateX(-50%)",
  background: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  borderRadius: 14,
  padding: 18,
  minWidth: 320,
  zIndex: 1000,
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  color: "#1A1A1A",
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
  color: "#4A7A72",
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

const issueTypeGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: 10,
};

const incidentFilterWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const incidentIssueFilterInput: React.CSSProperties = {
  ...input,
  minHeight: 48,
  padding: "12px 14px",
  fontSize: 15,
};

const incidentEmptyState: React.CSSProperties = {
  fontSize: 14,
  color: "#6B7280",
  padding: "12px 4px",
};

const incidentAccordionList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const incidentAccordionCard: React.CSSProperties = {
  border: "1px solid rgba(15, 23, 42, 0.08)",
  borderRadius: 16,
  background: "rgba(255, 255, 255, 0.92)",
  overflow: "hidden",
};

const incidentAccordionHeader: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: "rgba(248, 250, 252, 0.95)",
  padding: "16px 18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  cursor: "pointer",
  textAlign: "left",
};

const incidentAccordionTitleWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 0,
};

const incidentAccordionTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#111827",
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const incidentAccordionHint: React.CSSProperties = {
  fontSize: 12,
  color: "#6B7280",
};

const incidentAccordionMeta: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexShrink: 0,
};

const incidentAccordionCount: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#4F46E5",
  background: "rgba(99, 102, 241, 0.12)",
  borderRadius: 999,
  padding: "6px 10px",
};

const incidentAccordionChevron: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: "rgba(15, 23, 42, 0.06)",
  color: "#111827",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
  fontWeight: 600,
};

const incidentAccordionBody: React.CSSProperties = {
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 12,
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

const issueTypeCardWrap: React.CSSProperties = {
  position: "relative",
};

const issueTypeBtn: React.CSSProperties = {
  width: "100%",
  minHeight: 64,
};

const bodyMapIconBtn: React.CSSProperties = {
  position: "absolute",
  top: 8,
  right: 8,
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: "1px solid rgba(108, 124, 255, 0.25)",
  background: "rgba(255, 255, 255, 0.92)",
  color: "#475569",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(15, 23, 42, 0.08)",
};

const helperText: React.CSSProperties = {
  fontSize: 13,
  color: "#6B7280",
  marginTop: 4,
};

const bodyLocationChipSummary: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const bodyLocationChip: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(108, 124, 255, 0.12)",
  border: "1px solid rgba(108, 124, 255, 0.2)",
  color: "#1A1A1A",
  fontSize: 13,
  fontWeight: 600,
};

const dialogOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  overflowY: "auto",
  overscrollBehavior: "contain",
};

const dialogBackdrop: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  border: "none",
  background: "rgba(15, 23, 42, 0.18)",
};

const dialogCard: React.CSSProperties = {
  position: "relative",
  width: "min(1220px, calc(100vw - 48px))",
  maxHeight: "88vh",
  overflowY: "auto",
  margin: "auto",
  borderRadius: 24,
  background: "rgba(255, 255, 255, 0.98)",
  boxShadow: "0 28px 60px rgba(15, 23, 42, 0.22)",
  padding: 24,
};

const dialogHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 18,
};

const dialogTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: "#111827",
};

const dialogSubtitle: React.CSSProperties = {
  marginTop: 4,
  fontSize: 13,
  color: "#6B7280",
};

const dialogCloseBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  background: "rgba(15, 23, 42, 0.04)",
  color: "#111827",
  fontSize: 22,
  lineHeight: 1,
  cursor: "pointer",
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
