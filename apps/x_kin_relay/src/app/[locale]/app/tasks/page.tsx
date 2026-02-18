"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Home, Menu, ChevronDown, Clock, Smile } from "lucide-react";
import { supabase, hasSupabase } from "@/lib/supabaseClient";

interface Client {
  id: string;
  full_name: string;
}

interface CategoryItem {
  id: string;
  name: string;
  subcategories?: SubcategoryItem[];
}

interface SubcategoryItem {
  id: string;
  name: string;
  color?: string;
}

interface TaskFormData {
  time: string;
  notes: string;
  subcategory?: string;
}

const PERSONAL_CARE_OPTIONS: SubcategoryItem[] = [
  { id: "personal_hygiene", name: "ASEO PERSONAL" },
  { id: "oral_hygiene", name: "ASEO BUCAL" },
  { id: "skin_care", name: "CUIDADO DE LA PIEL" },
  { id: "dressing", name: "VESTIDO, CALZADO" },
];

const NUTRITION_OPTIONS: SubcategoryItem[] = [
  { id: "breakfast", name: "DESAYUNO" },
  { id: "lunch", name: "ALMUERZO / COMIDA" },
  { id: "snack", name: "MERIENDA" },
  { id: "dinner", name: "CENA" },
];

const BEHAVIOR_OPTIONS: SubcategoryItem[] = [
  { id: "aggression", name: "AGRESIÓN", color: "#F97316" },
  { id: "violence", name: "VIOLENCIA", color: "#F97316" },
  { id: "hallucinations", name: "HALUCINACIONES", color: "#F97316" },
];

const INCIDENT_OPTIONS: SubcategoryItem[] = [
  { id: "abrasion", name: "ABRASIÓN", color: "#F97316" },
  { id: "fall", name: "CAÍDA", color: "#F5D547" },
  { id: "laceration", name: "CORTADA/LACERACIÓN", color: "#F97316" },
  { id: "abuse", name: "ABUSO", color: "#F97316" },
];

const HYDRATION_ML_OPTIONS = [50, 100, 150, 200, 250];
const HYDRATION_FLOZ_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const currentTimeValue = () => {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

const combineDateWithTime = (time: string, base = new Date()) => {
  const [h, m] = (time || "").split(":").map((v) => Number(v));
  if (Number.isNaN(h) || Number.isNaN(m)) return new Date(base);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
};

// Task categories based on the mockup
const TASK_CATEGORIES: CategoryItem[] = [
  { id: "rest", name: "PATRÓN DE SUEÑO" },
  { id: "personal-care", name: "CUIDADO PERSONAL" },
  { id: "hydration", name: "HIDRATACIÓN" },
  { id: "nutrition", name: "NUTRICIÓN" },
  { id: "mobility", name: "MOVILIDAD" },
  { id: "continence", name: "CONTINENCIA/INCONTINENCIA" },
  { id: "activity", name: "ACTIVIDAD" },
  {
    id: "medication",
    name: "ADMINISTRACIÓN DE MEDICAMENTOS",
    subcategories: [],
  },
  {
    id: "behavior",
    name: "PATRÓN DE CONDUCTA",
    subcategories: BEHAVIOR_OPTIONS,
  },
  {
    id: "incident",
    name: "INCIDENTE",
    subcategories: INCIDENT_OPTIONS,
  },
];

export default function TasksPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";

  // State
  const [clients, setClients] = useState<Client[]>([
    { id: "1", full_name: "NOMBRE CLIENTE 1" },
    { id: "2", full_name: "NOMBRE CLIENTE 2" },
    { id: "3", full_name: "NOMBRE CLIENTE 3" },
  ]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    clients[1] || null,
  );
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Task form states for different categories
  const [medicationForm, setMedicationForm] = useState({
    name: "",
    concentration: "",
    dose: "",
    time: currentTimeValue(),
  });

  const [restForm, setRestForm] = useState({
    from: currentTimeValue(),
    to: currentTimeValue(),
  });

  const [personalCareForm, setPersonalCareForm] = useState({
    subcategory: "",
    time: currentTimeValue(),
  });

  const [hydrationForm, setHydrationForm] = useState({
    unit: "ml",
    amounts: [] as number[],
    description: "",
    time: currentTimeValue(),
  });

  const [nutritionForm, setNutritionForm] = useState({
    meal: "",
    description: "",
    time: currentTimeValue(),
  });

  const [mobilityForm, setMobilityForm] = useState({
    status: "",
    equipment: "",
    time: currentTimeValue(),
  });

  const [continenceForm, setContinenceForm] = useState({
    type: "urinary",
    assistance: "independent",
    time: currentTimeValue(),
  });

  const [activityForm, setActivityForm] = useState({
    group: "individual",
    location: "outdoor",
    description: "",
    time: currentTimeValue(),
  });

  const [behaviorForm, setBehaviorForm] = useState({
    subcategory: "",
    time: currentTimeValue(),
    antecedent: "",
  });

  const [incidentForm, setIncidentForm] = useState({
    subcategory: "",
    time: currentTimeValue(),
    cause: "",
  });

  useEffect(() => {
    async function loadClients() {
      if (!hasSupabase || !supabase) return;
      const { data } = await supabase
        .from("kr_clients")
        .select("id, display_name")
        .order("display_name");
      if (data && data.length) {
        const mapped = data.map((c) => ({
          id: c.id,
          full_name: c.display_name || c.id,
        }));
        setClients(mapped);
        setSelectedClient(mapped[0]);
      }
    }
    loadClients();
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleGoHome = () => {
    router.push(`/${locale}/app/home`);
  };

  const handleSave = async (categoryId: string) => {
    const baseDate = new Date();
    const recipientId = selectedClient?.id;
    if (!recipientId) return;

    const payload: Record<string, any> = {
      recipient_id: recipientId,
      observed_at: new Date().toISOString(),
    };

    switch (categoryId) {
      case "rest": {
        const fromDate = combineDateWithTime(restForm.from, baseDate);
        const toDate = combineDateWithTime(restForm.to, baseDate);
        if (toDate < fromDate) {
          toDate.setDate(toDate.getDate() + 1);
        }
        payload.category = "adl";
        payload.subtype_adl = "sleep_rest";
        payload.observed_at = fromDate.toISOString();
        payload.details = {
          from_time: restForm.from,
          to_time: restForm.to,
          from_iso: fromDate.toISOString(),
          to_iso: toDate.toISOString(),
        };
        break;
      }
      case "personal-care": {
        payload.category = "adl";
        payload.observed_at = combineDateWithTime(
          personalCareForm.time,
          baseDate,
        ).toISOString();
        const care = personalCareForm.subcategory;
        payload.subtype_adl =
          care === "dressing" ? "dressing_grooming" : "bathing_hygiene";
        payload.details = { care_type: care };
        break;
      }
      case "hydration": {
        payload.category = "adl";
        payload.subtype_adl = "hydration";
        payload.observed_at = combineDateWithTime(
          hydrationForm.time,
          baseDate,
        ).toISOString();
        const total = hydrationForm.amounts.reduce((sum, v) => sum + v, 0);
        payload.details = {
          unit: hydrationForm.unit,
          values: hydrationForm.amounts,
          total,
          description: hydrationForm.description.trim() || null,
        };
        break;
      }
      case "nutrition": {
        payload.category = "adl";
        payload.subtype_adl = "nutrition_meal";
        payload.observed_at = combineDateWithTime(
          nutritionForm.time,
          baseDate,
        ).toISOString();
        payload.details = {
          meal: nutritionForm.meal,
          description: nutritionForm.description.trim() || null,
        };
        break;
      }
      case "mobility": {
        payload.category = "adl";
        payload.subtype_adl = "mobility_transfer";
        payload.observed_at = combineDateWithTime(
          mobilityForm.time,
          baseDate,
        ).toISOString();
        payload.details = {
          status: mobilityForm.status,
          equipment: mobilityForm.equipment.trim() || null,
        };
        break;
      }
      case "continence": {
        payload.category = "adl";
        payload.subtype_adl =
          continenceForm.type === "fecal"
            ? "continence_bowel"
            : "continence_bladder";
        payload.observed_at = combineDateWithTime(
          continenceForm.time,
          baseDate,
        ).toISOString();
        payload.assistance_level = continenceForm.assistance;
        payload.details = { type: continenceForm.type };
        break;
      }
      case "activity": {
        payload.category = "engagement";
        payload.subtype_engagement = "general_activity";
        payload.observed_at = combineDateWithTime(
          activityForm.time,
          baseDate,
        ).toISOString();
        payload.details = {
          group: activityForm.group,
          location: activityForm.location,
          description: activityForm.description.trim() || null,
        };
        break;
      }
      case "medication": {
        payload.category = "service";
        payload.subtype_service = "other";
        payload.observed_at = combineDateWithTime(
          medicationForm.time,
          baseDate,
        ).toISOString();
        payload.details = {
          medication_name: medicationForm.name.trim() || null,
          concentration: medicationForm.concentration.trim() || null,
          dose: medicationForm.dose.trim() || null,
        };
        break;
      }
      case "behavior": {
        payload.category = "health_observation";
        payload.observed_at = combineDateWithTime(
          behaviorForm.time,
          baseDate,
        ).toISOString();
        const behaviorMap: Record<string, string> = {
          aggression: "challenging_behaviour",
          violence: "challenging_behaviour",
          hallucinations: "hallucination",
        };
        payload.subtype_observation =
          behaviorMap[behaviorForm.subcategory] || "behaviour_change";
        payload.details = {
          behaviour: behaviorForm.subcategory,
          antecedent: behaviorForm.antecedent.trim() || null,
        };
        break;
      }
      case "incident": {
        payload.category = "health_observation";
        payload.observed_at = combineDateWithTime(
          incidentForm.time,
          baseDate,
        ).toISOString();
        const incidentMap: Record<string, string> = {
          abrasion: "abrasion",
          fall: "falls",
          laceration: "laceration",
          abuse: "abuse",
        };
        payload.subtype_observation =
          incidentMap[incidentForm.subcategory] || "behaviour_change";
        payload.details = {
          incident_type: incidentForm.subcategory,
          cause: incidentForm.cause.trim() || null,
        };
        break;
      }
      default:
        return;
    }

    if (!hasSupabase || !supabase) {
      console.log("Saving activity (demo):", payload);
      setExpandedCategory(null);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const basePayload = {
      ...payload,
      recorded_by: user.id,
    };
    const payloadWithOwners = {
      ...basePayload,
      created_by: user.id,
      caregiver_id: user.id,
    };

    let { error } = await supabase.from("kr_activities").insert(payloadWithOwners);
    if (
      error &&
      /column .* does not exist|created_by|caregiver_id/i.test(error.message || "")
    ) {
      ({ error } = await supabase.from("kr_activities").insert(basePayload));
    }
    if (!error) setExpandedCategory(null);
  };

  const renderCategoryContent = (category: CategoryItem) => {
    switch (category.id) {
      case "rest":
        return (
          <div className="category-form">
            <div className="pill-row">
              <input
                type="time"
                placeholder="DESDE"
                className="pill-input"
                value={restForm.from}
                onChange={(e) =>
                  setRestForm({ ...restForm, from: e.target.value })
                }
              />
              <input
                type="time"
                placeholder="HASTA"
                className="pill-input"
                value={restForm.to}
                onChange={(e) => setRestForm({ ...restForm, to: e.target.value })}
              />
            </div>
            <div className="form-row">
              <button className="save-btn" onClick={() => handleSave("rest")}>
                GUARDAR ↵
              </button>
            </div>
          </div>
        );

      case "personal-care":
        return (
          <div className="category-form">
            <div className="subcategory-options">
              {PERSONAL_CARE_OPTIONS.map((sub) => (
                <button
                  key={sub.id}
                  className={`subcategory-btn ${
                    personalCareForm.subcategory === sub.id ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      personalCareForm.subcategory === sub.id
                        ? "var(--kinrelay-primary, #f5d547)"
                        : undefined,
                    color:
                      personalCareForm.subcategory === sub.id
                        ? "#1a1a1a"
                        : undefined,
                  }}
                  onClick={() =>
                    setPersonalCareForm({
                      ...personalCareForm,
                      subcategory: sub.id,
                    })
                  }
                >
                  {sub.name}
                </button>
              ))}
            </div>
            <div className="form-row">
              <div className="time-picker">
                <input
                  type="time"
                  value={personalCareForm.time}
                  onChange={(e) =>
                    setPersonalCareForm({
                      ...personalCareForm,
                      time: e.target.value,
                    })
                  }
                  className="time-input"
                />
                <Clock size={16} className="time-icon" />
              </div>
              <button
                className="save-btn"
                onClick={() => handleSave("personal-care")}
              >
                GUARDAR ↵
              </button>
            </div>
          </div>
        );

      case "hydration": {
        const options =
          hydrationForm.unit === "ml"
            ? HYDRATION_ML_OPTIONS
            : HYDRATION_FLOZ_OPTIONS;
        return (
          <div className="category-form">
            <div className="segment-group">
              <button
                className={`segment-btn ${
                  hydrationForm.unit === "ml" ? "active" : ""
                }`}
                onClick={() =>
                  setHydrationForm({
                    ...hydrationForm,
                    unit: "ml",
                    amounts: [],
                  })
                }
              >
                ML
              </button>
              <button
                className={`segment-btn ${
                  hydrationForm.unit === "floz" ? "active" : ""
                }`}
                onClick={() =>
                  setHydrationForm({
                    ...hydrationForm,
                    unit: "floz",
                    amounts: [],
                  })
                }
              >
                FL.OZ
              </button>
            </div>
            <div className="pill-options">
              {options.map((opt) => {
                const isSelected = hydrationForm.amounts.includes(opt);
                return (
                  <button
                    key={opt}
                    className={`pill-btn ${isSelected ? "active" : ""}`}
                    onClick={() =>
                      setHydrationForm({
                        ...hydrationForm,
                        amounts: isSelected
                          ? hydrationForm.amounts.filter((v) => v !== opt)
                          : [...hydrationForm.amounts, opt],
                      })
                    }
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="DESCRIPCIÓN"
              className="form-input"
              value={hydrationForm.description}
              onChange={(e) =>
                setHydrationForm({
                  ...hydrationForm,
                  description: e.target.value,
                })
              }
            />
            <div className="form-row">
              <div className="time-picker">
                <input
                  type="time"
                  value={hydrationForm.time}
                  onChange={(e) =>
                    setHydrationForm({
                      ...hydrationForm,
                      time: e.target.value,
                    })
                  }
                  className="time-input"
                />
                <Clock size={16} className="time-icon" />
              </div>
              <button
                className="save-btn"
                onClick={() => handleSave("hydration")}
              >
                GUARDAR ↵
              </button>
            </div>
          </div>
        );
      }

      case "nutrition":
        return (
          <div className="category-form">
            <div className="subcategory-options">
              {NUTRITION_OPTIONS.map((sub) => (
                <button
                  key={sub.id}
                  className={`subcategory-btn ${
                    nutritionForm.meal === sub.id ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      nutritionForm.meal === sub.id
                        ? "var(--kinrelay-primary, #f5d547)"
                        : undefined,
                    color:
                      nutritionForm.meal === sub.id ? "#1a1a1a" : undefined,
                  }}
                  onClick={() =>
                    setNutritionForm({ ...nutritionForm, meal: sub.id })
                  }
                >
                  {sub.name}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="DESCRIPCIÓN"
              className="form-input"
              value={nutritionForm.description}
              onChange={(e) =>
                setNutritionForm({
                  ...nutritionForm,
                  description: e.target.value,
                })
              }
            />
            <div className="form-row">
              <div className="time-picker">
                <input
                  type="time"
                  value={nutritionForm.time}
                  onChange={(e) =>
                    setNutritionForm({ ...nutritionForm, time: e.target.value })
                  }
                  className="time-input"
                />
                <Clock size={16} className="time-icon" />
              </div>
              <button
                className="save-btn"
                onClick={() => handleSave("nutrition")}
              >
                GUARDAR ↵
              </button>
            </div>
          </div>
        );

      case "mobility":
        return (
          <div className="category-form">
            <div className="segment-group">
              <button
                className={`segment-btn ${
                  mobilityForm.status === "stable" ? "active" : ""
                }`}
                onClick={() =>
                  setMobilityForm({ ...mobilityForm, status: "stable" })
                }
              >
                ESTABLE
              </button>
              <button
                className={`segment-btn ${
                  mobilityForm.status === "unstable" ? "active" : ""
                }`}
                onClick={() =>
                  setMobilityForm({ ...mobilityForm, status: "unstable" })
                }
              >
                INESTABLE
              </button>
            </div>
            <input
              type="text"
              placeholder="EQUIPO UTILIZADO:"
              className="form-input"
              value={mobilityForm.equipment}
              onChange={(e) =>
                setMobilityForm({ ...mobilityForm, equipment: e.target.value })
              }
            />
            <div className="form-row">
              <div className="time-picker">
                <input
                  type="time"
                  value={mobilityForm.time}
                  onChange={(e) =>
                    setMobilityForm({ ...mobilityForm, time: e.target.value })
                  }
                  className="time-input"
                />
                <Clock size={16} className="time-icon" />
              </div>
              <button
                className="save-btn"
                onClick={() => handleSave("mobility")}
              >
                GUARDAR ↵
              </button>
            </div>
          </div>
        );

      case "continence":
        return (
          <div className="category-form">
            <div className="segment-group">
              <button
                className={`segment-btn ${
                  continenceForm.type === "urinary" ? "active" : ""
                }`}
                onClick={() =>
                  setContinenceForm({ ...continenceForm, type: "urinary" })
                }
              >
                URINARIA
              </button>
              <button
                className={`segment-btn ${
                  continenceForm.type === "fecal" ? "active" : ""
                }`}
                onClick={() =>
                  setContinenceForm({ ...continenceForm, type: "fecal" })
                }
              >
                FECAL
              </button>
            </div>
            <div className="segment-group">
              <button
                className={`segment-btn ${
                  continenceForm.assistance === "independent" ? "active" : ""
                }`}
                onClick={() =>
                  setContinenceForm({
                    ...continenceForm,
                    assistance: "independent",
                  })
                }
              >
                INDEPENDIENTE
              </button>
              <button
                className={`segment-btn ${
                  continenceForm.assistance === "assisted" ? "active" : ""
                }`}
                onClick={() =>
                  setContinenceForm({
                    ...continenceForm,
                    assistance: "assisted",
                  })
                }
              >
                ASISTIDA
              </button>
            </div>
            <div className="form-row">
              <div className="time-picker">
                <input
                  type="time"
                  value={continenceForm.time}
                  onChange={(e) =>
                    setContinenceForm({
                      ...continenceForm,
                      time: e.target.value,
                    })
                  }
                  className="time-input"
                />
                <Clock size={16} className="time-icon" />
              </div>
              <button
                className="save-btn"
                onClick={() => handleSave("continence")}
              >
                GUARDAR ↵
              </button>
            </div>
          </div>
        );

      case "activity":
        return (
          <div className="category-form">
            <div className="segment-group">
              <button
                className={`segment-btn ${
                  activityForm.group === "individual" ? "active" : ""
                }`}
                onClick={() =>
                  setActivityForm({ ...activityForm, group: "individual" })
                }
              >
                INDIVIDUAL
              </button>
              <button
                className={`segment-btn ${
                  activityForm.group === "group" ? "active" : ""
                }`}
                onClick={() =>
                  setActivityForm({ ...activityForm, group: "group" })
                }
              >
                GRUPAL
              </button>
            </div>
            <div className="segment-group">
              <button
                className={`segment-btn ${
                  activityForm.location === "outdoor" ? "active" : ""
                }`}
                onClick={() =>
                  setActivityForm({ ...activityForm, location: "outdoor" })
                }
              >
                AL AIRE LIBRE
              </button>
              <button
                className={`segment-btn ${
                  activityForm.location === "indoor" ? "active" : ""
                }`}
                onClick={() =>
                  setActivityForm({ ...activityForm, location: "indoor" })
                }
              >
                INTERIOR
              </button>
            </div>
            <input
              type="text"
              placeholder="DESCRIPCIÓN"
              className="form-input"
              value={activityForm.description}
              onChange={(e) =>
                setActivityForm({
                  ...activityForm,
                  description: e.target.value,
                })
              }
            />
            <div className="form-row">
              <div className="time-picker">
                <input
                  type="time"
                  value={activityForm.time}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, time: e.target.value })
                  }
                  className="time-input"
                />
                <Clock size={16} className="time-icon" />
              </div>
              <button
                className="save-btn"
                onClick={() => handleSave("activity")}
              >
                GUARDAR ↵
              </button>
            </div>
          </div>
        );

      case "medication":
        return (
          <div className="category-form">
            <input
              type="text"
              placeholder="NOMBRE DEL MEDICAMENTO"
              className="form-input"
              value={medicationForm.name}
              onChange={(e) =>
                setMedicationForm({ ...medicationForm, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="CONCENTRACIÓN (500mg, 5%, ...)"
              className="form-input"
              value={medicationForm.concentration}
              onChange={(e) =>
                setMedicationForm({
                  ...medicationForm,
                  concentration: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="DOSIS ADMINISTRADA (2 tabletas, 15ml...)"
              className="form-input"
              value={medicationForm.dose}
              onChange={(e) =>
                setMedicationForm({ ...medicationForm, dose: e.target.value })
              }
            />
            <div className="form-row">
              <div className="time-picker">
                <input
                  type="time"
                  value={medicationForm.time}
                  onChange={(e) =>
                    setMedicationForm({
                      ...medicationForm,
                      time: e.target.value,
                    })
                  }
                  className="time-input"
                />
                <Clock size={16} className="time-icon" />
              </div>
              <button
                className="save-btn"
                onClick={() => handleSave("medication")}
              >
                GUARDAR ↵
              </button>
            </div>
          </div>
        );

      case "behavior":
        return (
          <div className="category-form">
            <div className="subcategory-options">
              {BEHAVIOR_OPTIONS.map((sub) => (
                <button
                  key={sub.id}
                  className={`subcategory-btn ${
                    behaviorForm.subcategory === sub.id ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      behaviorForm.subcategory === sub.id
                        ? sub.color
                        : undefined,
                  }}
                  onClick={() =>
                    setBehaviorForm({ ...behaviorForm, subcategory: sub.id })
                  }
                >
                  {sub.name}
                </button>
              ))}
            </div>
            <div className="form-row">
              <div className="time-picker">
                <input
                  type="time"
                  value={behaviorForm.time}
                  onChange={(e) =>
                    setBehaviorForm({ ...behaviorForm, time: e.target.value })
                  }
                  className="time-input"
                />
                <Clock size={16} className="time-icon" />
              </div>
            </div>
            <input
              type="text"
              placeholder="ANTECEDENTE DE LA CONDUCTA"
              className="form-input"
              value={behaviorForm.antecedent}
              onChange={(e) =>
                setBehaviorForm({ ...behaviorForm, antecedent: e.target.value })
              }
            />
            <button className="save-btn" onClick={() => handleSave("behavior")}>
              GUARDAR ↵
            </button>
          </div>
        );

      case "incident":
        return (
          <div className="category-form">
            <div className="subcategory-options">
              {INCIDENT_OPTIONS.map((sub) => (
                <button
                  key={sub.id}
                  className={`subcategory-btn ${
                    incidentForm.subcategory === sub.id ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      incidentForm.subcategory === sub.id
                        ? sub.color
                        : undefined,
                  }}
                  onClick={() =>
                    setIncidentForm({ ...incidentForm, subcategory: sub.id })
                  }
                >
                  {sub.name}
                </button>
              ))}
            </div>
            <div className="form-row">
              <div className="time-picker">
                <input
                  type="time"
                  value={incidentForm.time}
                  onChange={(e) =>
                    setIncidentForm({ ...incidentForm, time: e.target.value })
                  }
                  className="time-input"
                />
                <Clock size={16} className="time-icon" />
              </div>
            </div>
            <input
              type="text"
              placeholder="PROBABLE CAUSA DEL INCIDENTE"
              className="form-input"
              value={incidentForm.cause}
              onChange={(e) =>
                setIncidentForm({ ...incidentForm, cause: e.target.value })
              }
            />
            <button className="save-btn" onClick={() => handleSave("incident")}>
              GUARDAR ↵
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="tasks-page">
      {/* Header */}
      <header className="tasks-header">
        <button className="header-btn" onClick={handleGoHome}>
          <Home size={24} />
        </button>

        <div className="header-center">
          <h1 className="tasks-title">TAREAS</h1>
          <div
            className="client-selector"
            onClick={() => setShowClientDropdown(!showClientDropdown)}
          >
            <span className="client-name">
              ({selectedClient?.full_name || "SELECCIONAR CLIENTE"})
            </span>
            <button className="emoji-btn">
              <Smile size={20} />
            </button>
          </div>
          {showClientDropdown && (
            <div className="client-dropdown">
              {clients.map((client) => (
                <button
                  key={client.id}
                  className={`client-option ${
                    selectedClient?.id === client.id ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedClient(client);
                    setShowClientDropdown(false);
                  }}
                >
                  ({client.full_name})
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="header-btn" onClick={() => setShowMenu(!showMenu)}>
          <Menu size={24} />
        </button>
      </header>

      {/* Task Categories */}
      <div className="tasks-content">
        {TASK_CATEGORIES.map((category) => (
          <div key={category.id} className="task-category">
            {(() => {
              const displayName =
                category.id === "hydration"
                  ? `HIDRATACIÓN (${
                      hydrationForm.unit === "ml" ? "ml" : "fl.oz"
                    })`
                  : category.name;
              return (
            <button
              className="category-header"
              onClick={() => handleCategoryToggle(category.id)}
            >
              <span className="category-name">{displayName}</span>
              <ChevronDown
                size={16}
                className={`category-icon ${
                  expandedCategory === category.id ? "expanded" : ""
                }`}
              />
            </button>
              );
            })()}

            {expandedCategory === category.id && (
              <div className="category-content">
                {renderCategoryContent(category)}
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .tasks-page {
          min-height: 100vh;
          background: var(--kinrelay-bg-primary, #88b9b0);
          padding: 16px;
          padding-top: env(safe-area-inset-top, 16px);
        }

        .tasks-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px 0;
          margin-bottom: 16px;
        }

        .header-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--kinrelay-text-primary, #1a1a1a);
        }

        .header-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .tasks-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 8px 0;
          letter-spacing: 0.5px;
        }

        .client-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px 12px;
          background: var(--kinrelay-primary, #f5d547);
          border-radius: 8px;
        }

        .client-name {
          font-size: 12px;
          font-weight: 600;
        }

        .emoji-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: var(--kinrelay-primary, #f5d547);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .client-dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 100;
          min-width: 200px;
          overflow: hidden;
          margin-top: 4px;
        }

        .client-option {
          display: block;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .client-option:hover {
          background: #f5f5f5;
        }

        .client-option.selected {
          background: var(--kinrelay-primary, #f5d547);
        }

        .tasks-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 400px;
          margin: 0 auto;
        }

        .task-category {
          background: white;
          border-radius: 8px;
          overflow: hidden;
        }

        .category-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 14px 16px;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
          font-size: 12px;
          font-weight: 500;
          color: var(--kinrelay-text-secondary, #4a4a4a);
          text-transform: uppercase;
        }

        .category-icon {
          transition: transform 0.2s ease;
          color: var(--kinrelay-text-muted, #6b7280);
        }

        .category-icon.expanded {
          transform: rotate(180deg);
        }

        .category-content {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .category-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: none;
          border-bottom: 1px solid #d1d5db;
          background: transparent;
          font-size: 11px;
          color: var(--kinrelay-text-muted, #6b7280);
          text-transform: uppercase;
        }

        .form-input::placeholder {
          color: var(--kinrelay-text-placeholder, #9ca3af);
        }

        .form-input:focus {
          outline: none;
          border-bottom-color: var(--kinrelay-primary, #f5d547);
        }

        .form-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }

        .time-picker {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f5f5f5;
          border-radius: 4px;
        }

        .time-input {
          width: 50px;
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
        }

        .time-input:focus {
          outline: none;
        }

        .time-icon {
          color: var(--kinrelay-text-muted, #6b7280);
        }

        .save-btn {
          padding: 10px 16px;
          background: var(--kinrelay-primary, #f5d547);
          border: none;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          text-transform: uppercase;
        }

        .subcategory-options {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .subcategory-btn {
          padding: 10px 14px;
          border: none;
          background: #f5f5f5;
          text-align: left;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          transition: all 0.2s ease;
        }

        .subcategory-btn:hover {
          background: #e5e5e5;
        }

        .subcategory-btn.active {
          color: white;
        }

        .pill-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .pill-input {
          flex: 1;
          padding: 10px 14px;
          border: none;
          border-radius: 999px;
          background: var(--kinrelay-primary, #f5d547);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: #1a1a1a;
        }

        .pill-input::placeholder {
          color: rgba(26, 26, 26, 0.7);
        }

        .segment-group {
          display: flex;
          background: #e5e7eb;
          border-radius: 999px;
          overflow: hidden;
        }

        .segment-btn {
          flex: 1;
          padding: 10px 12px;
          border: none;
          background: transparent;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: #6b7280;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .segment-btn.active {
          background: var(--kinrelay-primary, #f5d547);
          color: #1a1a1a;
        }

        .pill-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
          gap: 6px;
        }

        .pill-btn {
          padding: 8px 10px;
          border: none;
          border-radius: 999px;
          background: #d1d5db;
          color: #1a1a1a;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          text-transform: uppercase;
        }

        .pill-btn.active {
          background: var(--kinrelay-primary, #f5d547);
        }
      `}</style>
    </div>
  );
}
