// Auto-generated lightweight enums and helpers for Kin Relay schema
export type CircleType = "family" | "senior_wg" | "ambulant_service";
export type MemberRole = "owner" | "manager" | "carer" | "family" | "viewer";
export type LanguageCode =
  | "de"
  | "en"
  | "tr"
  | "ar"
  | "pl"
  | "ru"
  | "uk"
  | "es";
export type IncidentCategory =
  | "safety"
  | "health_observation"
  | "adl"
  | "environment"
  | "service"
  | "engagement"; // new leisure / engagement activities
export type SafetySubtype =
  | "falls"
  | "safeguarding"
  | "medication_error"
  | "missing_client"
  | "fire_disaster"
  | "theft_security"
  | "team_accident"
  | "equipment_issue"
  | "poisoning"
  | "death"
  | "near_miss";
export type ObservationSubtype =
  | "breathing_difficulty"
  | "cough_sputum"
  | "airway_obstruction"
  | "chest_pain"
  | "pale"
  | "weakness"
  | "loss_of_consciousness"
  | "seizure"
  | "drowsiness"
  | "headache"
  | "stroke_like_signs"
  | "rash"
  | "burn"
  | "skin_breakdown"
  | "infection_concern"
  | "vomiting"
  | "diarrhoea"
  | "urinary_symptoms"
  | "diabetes_symptom"
  | "glucose_value"
  | "catheter_issue"
  | "behaviour_change"
  | "redness"
  | "cut"
  | "bruise"
  | "abrasion"
  | "laceration"
  | "abuse"
  | "inflammation"
  | "bites"
  | "falls"
  | "near_miss"
  | "loss_of_balance"
  | "restlessness"
  | "urine_leak"
  | "bowel_leak"
  | "upset_stomach"
  | "confusion"
  | "challenging_behaviour"
  | "anxiety"
  | "hallucination"
  | "medication_error"
  | "environment_hazard";
export type AdlSubtype =
  // Legacy existing values (kept for backward compatibility with stored rows)
  | "mobility_transfer"
  | "nutrition_meal"
  | "hydration"
  | "toileting"
  | "sleep_rest"
  | "vital_sign"
  | "weight_entry"
  // New expanded ADL coverage
  | "transfer"
  | "ambulation_walk"
  | "bathing_hygiene"
  | "dressing_grooming"
  | "feeding"
  | "continence_bladder"
  | "continence_bowel";
export type EnvironmentSubtype =
  | "home_hazard"
  | "moving_handling"
  | "service_visit_issue";
export type ServiceSubtype =
  | "visit_issue"
  | "access_problem"
  | "late_arrival"
  | "cancelled_visit"
  | "other";
export type EngagementSubtype =
  | "reading"
  | "video_game"
  | "tv_viewing"
  | "music_listening"
  | "social_visit"
  | "puzzle_brain"
  | "exercise_light"
  | "exercise_moderate"
  | "outdoor_walk"
  | "art_craft"
  | "general_activity";
export type HarmSeverity =
  | "no_harm_prevented"
  | "no_harm_unprevented"
  | "low"
  | "moderate"
  | "severe"
  | "death";
export type AssistanceLevel =
  | "independent"
  | "supervision"
  | "partial"
  | "full"
  | "prompted"
  | "assisted";
export interface ActivityInsert {
  circle_id: string;
  recipient_id: string;
  category: IncidentCategory;
  observed_at: string; // ISO
  recorded_by: string;
  subtype_safety?: SafetySubtype | null;
  subtype_observation?: ObservationSubtype | null;
  subtype_adl?: AdlSubtype | null;
  subtype_environment?: EnvironmentSubtype | null;
  subtype_service?: ServiceSubtype | null;
  subtype_engagement?: EngagementSubtype | null;
  details?: Record<string, any>;
  harm_severity?: HarmSeverity | null;
  location_note?: string | null;
  assistance_level?: AssistanceLevel | null;
}

// Location-enriched profile / recipient lightweight types (matching new migration columns)
export interface ProfileLocation {
  id: string;
  full_name: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  region?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geocoded_at?: string | null; // ISO
}

export interface RecipientLocation {
  id: string;
  display_name: string;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  region?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geocoded_at?: string | null; // ISO
}

export interface ActorLocationRow {
  actor_id: string;
  actor_type: "carer" | "patient";
  name: string;
  city: string | null;
  region: string | null;
  country_code: string | null;
  latitude: number | null;
  longitude: number | null;
  geocoded_at: string | null;
}
export const CATEGORY_TO_SUBTYPES: Record<
  IncidentCategory,
  { key: keyof ActivityInsert; values: string[]; label: string }
> = {
  safety: {
    key: "subtype_safety",
    label: "Safety subtype",
    values: [
      "falls",
      "safeguarding",
      "medication_error",
      "missing_client",
      "fire_disaster",
      "theft_security",
      "team_accident",
      "equipment_issue",
      "poisoning",
      "death",
      "near_miss",
    ],
  },
  health_observation: {
    key: "subtype_observation",
    label: "Observation subtype",
    values: [
      "breathing_difficulty",
      "cough_sputum",
      "airway_obstruction",
      "chest_pain",
      "pale",
      "weakness",
      "loss_of_consciousness",
      "seizure",
      "drowsiness",
      "headache",
      "stroke_like_signs",
      "rash",
      "burn",
      "skin_breakdown",
      "infection_concern",
      "vomiting",
      "diarrhoea",
      "urinary_symptoms",
      "diabetes_symptom",
      "glucose_value",
      "catheter_issue",
      "behaviour_change",
      "redness",
      "cut",
      "bruise",
      "abrasion",
      "laceration",
      "abuse",
      "inflammation",
      "bites",
      "falls",
      "near_miss",
      "loss_of_balance",
      "restlessness",
      "urine_leak",
      "bowel_leak",
      "upset_stomach",
      "confusion",
      "challenging_behaviour",
      "anxiety",
      "hallucination",
      "medication_error",
      "environment_hazard",
    ],
  },
  adl: {
    key: "subtype_adl",
    label: "ADL subtype",
    values: [
      // Legacy
      "mobility_transfer",
      "nutrition_meal",
      "hydration",
      "toileting",
      "sleep_rest",
      "vital_sign",
      "weight_entry",
      // New
      "transfer",
      "ambulation_walk",
      "bathing_hygiene",
      "dressing_grooming",
      "feeding",
      "continence_bladder",
      "continence_bowel",
    ],
  },
  environment: {
    key: "subtype_environment",
    label: "Environment subtype",
    values: ["home_hazard", "moving_handling", "service_visit_issue"],
  },
  service: {
    key: "subtype_service",
    label: "Service subtype",
    values: [
      "visit_issue",
      "access_problem",
      "late_arrival",
      "cancelled_visit",
      "other",
    ],
  },
  engagement: {
    key: "subtype_engagement",
    label: "Engagement subtype",
    values: [
      "reading",
      "video_game",
      "tv_viewing",
      "music_listening",
      "social_visit",
      "puzzle_brain",
      "exercise_light",
      "exercise_moderate",
      "outdoor_walk",
      "art_craft",
      "general_activity",
    ],
  },
};

// Subcategory-specific options (amounts, quantities, etc.)
export interface SubtypeOption {
  label: string;
  value: string | number;
  unit?: string;
}

// Define which subtypes need assistance level (these will show the ASSISTANCE NEEDED buttons)
// These subtypes WON'T show the generic "Assistance (optional)" dropdown
export const SUBTYPES_WITH_ASSISTANCE: string[] = [
  "mobility_transfer",
  "transfer",
  "ambulation_walk",
  "bathing_hygiene",
  "dressing_grooming",
  "feeding",
  "toileting",
];

// Standard assistance options used by multiple ADL subtypes
const ASSISTANCE_OPTIONS: SubtypeOption[] = [
  { label: "Independent", value: "independent" },
  { label: "Minimal assist", value: "minimal" },
  { label: "Moderate assist", value: "moderate" },
  { label: "Maximum assist", value: "maximum" },
  { label: "Total assist", value: "total" },
];

// Standard duration options for engagement activities
const DURATION_SHORT: SubtypeOption[] = [
  { label: "15 min", value: 15, unit: "min" },
  { label: "30 min", value: 30, unit: "min" },
  { label: "45 min", value: 45, unit: "min" },
  { label: "1 hour", value: 60, unit: "min" },
];

const DURATION_LONG: SubtypeOption[] = [
  { label: "30 min", value: 30, unit: "min" },
  { label: "1 hour", value: 60, unit: "min" },
  { label: "2 hours", value: 120, unit: "min" },
  { label: "3+ hours", value: 180, unit: "min" },
];

// Severity options for safety incidents
const SEVERITY_OPTIONS: SubtypeOption[] = [
  { label: "No injury", value: "no_injury" },
  { label: "Minor", value: "minor" },
  { label: "Moderate", value: "moderate" },
  { label: "Serious", value: "serious" },
  { label: "Required medical attention", value: "medical" },
];

export const SUBTYPE_OPTIONS: Record<string, SubtypeOption[]> = {
  // ============================================
  // SAFETY SUBTYPES
  // ============================================
  falls: SEVERITY_OPTIONS,
  safeguarding: [
    { label: "Suspected", value: "suspected" },
    { label: "Witnessed", value: "witnessed" },
    { label: "Reported by client", value: "reported" },
    { label: "Under investigation", value: "investigation" },
  ],
  medication_error: [
    { label: "Wrong dose", value: "wrong_dose" },
    { label: "Missed dose", value: "missed_dose" },
    { label: "Wrong medication", value: "wrong_med" },
    { label: "Wrong time", value: "wrong_time" },
    { label: "Wrong route", value: "wrong_route" },
    { label: "Overdose", value: "overdose" },
    { label: "Refusal", value: "refusal" },
  ],
  missing_client: [
    { label: "Brief (< 30 min)", value: "brief" },
    { label: "Extended (30+ min)", value: "extended" },
    { label: "Found safe", value: "found_safe" },
    { label: "Required search", value: "search" },
  ],
  fire_disaster: [
    { label: "False alarm", value: "false_alarm" },
    { label: "Minor incident", value: "minor" },
    { label: "Evacuation required", value: "evacuation" },
    { label: "Emergency services called", value: "emergency" },
  ],
  theft_security: [
    { label: "Suspected theft", value: "suspected" },
    { label: "Confirmed theft", value: "confirmed" },
    { label: "Security breach", value: "breach" },
    { label: "Unauthorized access", value: "unauthorized" },
  ],
  team_accident: SEVERITY_OPTIONS,
  equipment_issue: [
    { label: "Malfunction", value: "malfunction" },
    { label: "Damaged", value: "damaged" },
    { label: "Missing", value: "missing" },
    { label: "Needs maintenance", value: "maintenance" },
  ],
  poisoning: [
    { label: "Suspected", value: "suspected" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Accidental", value: "accidental" },
    { label: "Poison control called", value: "poison_control" },
  ],
  death: [
    { label: "Expected", value: "expected" },
    { label: "Unexpected", value: "unexpected" },
    { label: "Under investigation", value: "investigation" },
  ],
  near_miss: [
    { label: "Fall prevented", value: "fall_prevented" },
    { label: "Medication caught", value: "med_caught" },
    { label: "Hazard identified", value: "hazard" },
    { label: "Other", value: "other" },
  ],

  // ============================================
  // HEALTH OBSERVATION SUBTYPES
  // ============================================
  breathing_difficulty: [
    { label: "Mild", value: "mild" },
    { label: "Moderate", value: "moderate" },
    { label: "Severe", value: "severe" },
    { label: "Requires oxygen", value: "oxygen" },
  ],
  cough_sputum: [
    { label: "Dry cough", value: "dry" },
    { label: "Productive - clear", value: "clear" },
    { label: "Productive - colored", value: "colored" },
    { label: "Blood-tinged", value: "blood" },
  ],
  airway_obstruction: [
    { label: "Partial", value: "partial" },
    { label: "Complete", value: "complete" },
    { label: "Resolved", value: "resolved" },
    { label: "Required intervention", value: "intervention" },
  ],
  chest_pain: [
    { label: "Mild", value: "mild" },
    { label: "Moderate", value: "moderate" },
    { label: "Severe", value: "severe" },
    { label: "Radiating", value: "radiating" },
  ],
  pale: [
    { label: "Slightly pale", value: "slight" },
    { label: "Noticeably pale", value: "noticeable" },
    { label: "Very pale", value: "very" },
    { label: "Cyanotic", value: "cyanotic" },
  ],
  weakness: [
    { label: "Mild fatigue", value: "mild" },
    { label: "Moderate weakness", value: "moderate" },
    { label: "Severe weakness", value: "severe" },
    { label: "Unable to stand", value: "unable_stand" },
  ],
  loss_of_consciousness: [
    { label: "Brief (< 1 min)", value: "brief" },
    { label: "Extended (1-5 min)", value: "extended" },
    { label: "Prolonged (> 5 min)", value: "prolonged" },
    { label: "Unresponsive", value: "unresponsive" },
  ],
  seizure: [
    { label: "Partial", value: "partial" },
    { label: "Generalized", value: "generalized" },
    { label: "Status epilepticus", value: "status" },
    { label: "Post-ictal", value: "postictal" },
  ],
  drowsiness: [
    { label: "Mild drowsy", value: "mild" },
    { label: "Very drowsy", value: "very" },
    { label: "Difficult to rouse", value: "difficult" },
    { label: "Unrousable", value: "unrousable" },
  ],
  headache: [
    { label: "Mild", value: "mild" },
    { label: "Moderate", value: "moderate" },
    { label: "Severe", value: "severe" },
    { label: "Migraine-like", value: "migraine" },
  ],
  stroke_like_signs: [
    { label: "Facial drooping", value: "face" },
    { label: "Arm weakness", value: "arm" },
    { label: "Speech difficulty", value: "speech" },
    { label: "Multiple signs", value: "multiple" },
  ],
  rash: [
    { label: "Localized", value: "localized" },
    { label: "Spreading", value: "spreading" },
    { label: "Widespread", value: "widespread" },
    { label: "With swelling", value: "swelling" },
  ],
  burn: [
    { label: "Minor (1st degree)", value: "first" },
    { label: "Moderate (2nd degree)", value: "second" },
    { label: "Severe (3rd degree)", value: "third" },
    { label: "Chemical", value: "chemical" },
  ],
  skin_breakdown: [
    { label: "Stage 1 (redness)", value: "stage1" },
    { label: "Stage 2 (blister)", value: "stage2" },
    { label: "Stage 3 (shallow)", value: "stage3" },
    { label: "Stage 4 (deep)", value: "stage4" },
  ],
  infection_concern: [
    { label: "Suspected", value: "suspected" },
    { label: "Signs present", value: "signs" },
    { label: "Culture taken", value: "culture" },
    { label: "Under treatment", value: "treatment" },
  ],
  vomiting: [
    { label: "Once", value: "once" },
    { label: "Multiple times", value: "multiple" },
    { label: "Persistent", value: "persistent" },
    { label: "With blood", value: "blood" },
  ],
  diarrhoea: [
    { label: "Mild (1-2 episodes)", value: "mild" },
    { label: "Moderate (3-5)", value: "moderate" },
    { label: "Severe (6+)", value: "severe" },
    { label: "With blood", value: "blood" },
  ],
  urinary_symptoms: [
    { label: "Frequency", value: "frequency" },
    { label: "Urgency", value: "urgency" },
    { label: "Pain/burning", value: "pain" },
    { label: "Blood in urine", value: "blood" },
  ],
  diabetes_symptom: [
    { label: "Hypoglycemia signs", value: "hypo" },
    { label: "Hyperglycemia signs", value: "hyper" },
    { label: "Ketone symptoms", value: "ketones" },
    { label: "Managed with intervention", value: "managed" },
  ],
  glucose_value: [
    { label: "Low (< 70)", value: "low" },
    { label: "Normal (70-140)", value: "normal" },
    { label: "Elevated (140-200)", value: "elevated" },
    { label: "High (> 200)", value: "high" },
  ],
  catheter_issue: [
    { label: "Blockage", value: "blockage" },
    { label: "Leakage", value: "leakage" },
    { label: "Dislodged", value: "dislodged" },
    { label: "Infection signs", value: "infection" },
  ],
  behaviour_change: [
    { label: "Agitation", value: "agitation" },
    { label: "Confusion", value: "confusion" },
    { label: "Withdrawn", value: "withdrawn" },
    { label: "Aggression", value: "aggression" },
    { label: "Anxiety", value: "anxiety" },
  ],
  environment_hazard: [
    { label: "Furniture", value: "furniture" },
    { label: "Lighting", value: "lighting" },
    { label: "Access", value: "access" },
    { label: "Mould", value: "mould" },
  ],

  // ============================================
  // ADL SUBTYPES
  // ============================================
  // Mobility - uses assistance levels
  mobility_transfer: ASSISTANCE_OPTIONS,
  transfer: ASSISTANCE_OPTIONS,
  ambulation_walk: [
    { label: "5 min", value: 5, unit: "min" },
    { label: "10 min", value: 10, unit: "min" },
    { label: "15 min", value: 15, unit: "min" },
    { label: "20 min", value: 20, unit: "min" },
    { label: "30 min", value: 30, unit: "min" },
    { label: "45+ min", value: 45, unit: "min" },
  ],
  // Hydration
  hydration: [
    { label: "50 ml", value: 50, unit: "ml" },
    { label: "100 ml", value: 100, unit: "ml" },
    { label: "200 ml", value: 200, unit: "ml" },
    { label: "300 ml", value: 300, unit: "ml" },
    { label: "750 ml", value: 750, unit: "ml" },
  ],
  // Nutrition
  nutrition_meal: [
    { label: "All (100%)", value: 100, unit: "%" },
    { label: "Most (75%)", value: 75, unit: "%" },
    { label: "Half (50%)", value: 50, unit: "%" },
    { label: "Some (25%)", value: 25, unit: "%" },
    { label: "None (0%)", value: 0, unit: "%" },
  ],
  feeding: [
    { label: "All (100%)", value: 100, unit: "%" },
    { label: "Most (75%)", value: 75, unit: "%" },
    { label: "Half (50%)", value: 50, unit: "%" },
    { label: "Some (25%)", value: 25, unit: "%" },
    { label: "None (0%)", value: 0, unit: "%" },
  ],
  // Toileting / Continence
  toileting: [
    { label: "Successful", value: "successful" },
    { label: "Partial", value: "partial" },
    { label: "Accident", value: "accident" },
    { label: "Catheter emptied", value: "catheter" },
  ],
  continence_bladder: [
    { label: "Continent", value: "continent" },
    { label: "Occasional accident", value: "occasional" },
    { label: "Frequent accidents", value: "frequent" },
    { label: "Incontinent", value: "incontinent" },
  ],
  continence_bowel: [
    { label: "Continent", value: "continent" },
    { label: "Occasional accident", value: "occasional" },
    { label: "Frequent accidents", value: "frequent" },
    { label: "Incontinent", value: "incontinent" },
  ],
  // Sleep
  sleep_rest: [
    { label: "Good (7-8h)", value: "good" },
    { label: "Fair (5-6h)", value: "fair" },
    { label: "Poor (3-4h)", value: "poor" },
    { label: "Very poor (<3h)", value: "very_poor" },
    { label: "Restless night", value: "restless" },
  ],
  // Vital signs
  vital_sign: [
    { label: "Blood pressure", value: "bp" },
    { label: "Heart rate", value: "hr" },
    { label: "Temperature", value: "temp" },
    { label: "Oxygen saturation", value: "spo2" },
    { label: "Blood glucose", value: "glucose" },
  ],
  // Weight
  weight_entry: [
    { label: "40-50 kg", value: 45 },
    { label: "50-60 kg", value: 55 },
    { label: "60-70 kg", value: 65 },
    { label: "70-80 kg", value: 75 },
    { label: "80-90 kg", value: 85 },
    { label: "90-100 kg", value: 95 },
    { label: ">100 kg", value: 105 },
  ],
  // Bathing/Hygiene
  bathing_hygiene: [
    { label: "Bath", value: "bath" },
    { label: "Shower", value: "shower" },
    { label: "Flannel wash", value: "flannel" },
    { label: "Bed bath", value: "bed_bath" },
    { label: "Refused", value: "refused" },
  ],
  dressing_grooming: [
    { label: "Fully dressed", value: "full" },
    { label: "Partial assistance", value: "partial" },
    { label: "Full assistance", value: "full_assist" },
    { label: "Refused", value: "refused" },
  ],

  // ============================================
  // ENVIRONMENT SUBTYPES
  // ============================================
  home_hazard: [
    { label: "Trip hazard", value: "trip" },
    { label: "Electrical issue", value: "electrical" },
    { label: "Fire hazard", value: "fire" },
    { label: "Water/leak", value: "water" },
    { label: "Pest issue", value: "pest" },
    { label: "Other", value: "other" },
  ],
  moving_handling: [
    { label: "Equipment issue", value: "equipment" },
    { label: "Technique concern", value: "technique" },
    { label: "Space constraint", value: "space" },
    { label: "Training needed", value: "training" },
  ],
  service_visit_issue: [
    { label: "Access problem", value: "access" },
    { label: "No answer", value: "no_answer" },
    { label: "Client not home", value: "not_home" },
    { label: "Appointment cancelled", value: "cancelled" },
  ],

  // ============================================
  // SERVICE SUBTYPES
  // ============================================
  visit_issue: [
    { label: "Short visit", value: "short" },
    { label: "Incomplete tasks", value: "incomplete" },
    { label: "Client complaint", value: "complaint" },
    { label: "Documentation issue", value: "documentation" },
  ],
  access_problem: [
    { label: "Key not working", value: "key" },
    { label: "Door locked", value: "locked" },
    { label: "Intercom issue", value: "intercom" },
    { label: "Code changed", value: "code" },
  ],
  late_arrival: [
    { label: "< 15 min late", value: "slight" },
    { label: "15-30 min late", value: "moderate" },
    { label: "> 30 min late", value: "significant" },
    { label: "Missed window", value: "missed" },
  ],
  cancelled_visit: [
    { label: "Client requested", value: "client" },
    { label: "Carer unavailable", value: "carer" },
    { label: "Emergency", value: "emergency" },
    { label: "Weather", value: "weather" },
  ],
  other: [
    { label: "General note", value: "note" },
    { label: "Follow-up needed", value: "followup" },
    { label: "Query", value: "query" },
    { label: "Feedback", value: "feedback" },
  ],

  // ============================================
  // ENGAGEMENT SUBTYPES
  // ============================================
  reading: DURATION_SHORT,
  video_game: DURATION_SHORT,
  tv_viewing: DURATION_LONG,
  music_listening: DURATION_SHORT,
  social_visit: [
    { label: "15 min", value: 15, unit: "min" },
    { label: "30 min", value: 30, unit: "min" },
    { label: "1 hour", value: 60, unit: "min" },
    { label: "2 hours", value: 120, unit: "min" },
    { label: "Half day", value: 240, unit: "min" },
  ],
  puzzle_brain: DURATION_SHORT,
  exercise_light: [
    { label: "5 min", value: 5, unit: "min" },
    { label: "10 min", value: 10, unit: "min" },
    { label: "15 min", value: 15, unit: "min" },
    { label: "20 min", value: 20, unit: "min" },
    { label: "30 min", value: 30, unit: "min" },
  ],
  exercise_moderate: [
    { label: "10 min", value: 10, unit: "min" },
    { label: "15 min", value: 15, unit: "min" },
    { label: "20 min", value: 20, unit: "min" },
    { label: "30 min", value: 30, unit: "min" },
    { label: "45 min", value: 45, unit: "min" },
  ],
  outdoor_walk: [
    { label: "10 min", value: 10, unit: "min" },
    { label: "15 min", value: 15, unit: "min" },
    { label: "20 min", value: 20, unit: "min" },
    { label: "30 min", value: 30, unit: "min" },
    { label: "45 min", value: 45, unit: "min" },
    { label: "1 hour", value: 60, unit: "min" },
  ],
  art_craft: DURATION_SHORT,
};
