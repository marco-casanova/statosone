// Centralized activity & subtype icon utilities
import { IncidentCategory, CATEGORY_TO_SUBTYPES } from "../types/schema";

export const CATEGORY_ICON: Record<IncidentCategory, string> = {
  safety: "🛡️",
  health_observation: "🩺",
  adl: "🧍",
  environment: "🏠",
  service: "🛎️",
  engagement: "🎯",
};

// Union of all possible subtype strings (values across CATEGORY_TO_SUBTYPES)
const subtypeValues: string[] = Array.from(
  new Set(
    (Object.keys(CATEGORY_TO_SUBTYPES) as IncidentCategory[]).flatMap(
      (c) => CATEGORY_TO_SUBTYPES[c].values
    )
  )
);

export const SUBTYPE_ICON: Record<string, string> = {
  hydration: "💧",
  falls: "⚠️",
  transfer: "🤝",
  ambulation_walk: "🚶",
  bathing_hygiene: "🛁",
  dressing_grooming: "👕",
  feeding: "🍽️",
  continence_bladder: "🚻",
  continence_bowel: "🚽",
  nutrition_meal: "🥗",
  sleep_rest: "😴",
  toileting: "🚻",
  vital_sign: "📊",
  weight_entry: "⚖️",
  reading: "📖",
  video_game: "🎮",
  tv_viewing: "📺",
  music_listening: "🎵",
  social_visit: "🗣️",
  puzzle_brain: "🧩",
  exercise_light: "🧘",
  exercise_moderate: "🏃",
  outdoor_walk: "🌳",
  art_craft: "🎨",
};

// Allow all known subtypes to have at least a fallback mapping (dot if absent)
subtypeValues.forEach((s) => {
  if (!SUBTYPE_ICON[s]) SUBTYPE_ICON[s] = "•";
});

export function iconFor(
  category?: IncidentCategory | string | null,
  subtype?: string | null
) {
  if (subtype && SUBTYPE_ICON[subtype]) return SUBTYPE_ICON[subtype];
  if (category && CATEGORY_ICON[category as IncidentCategory])
    return CATEGORY_ICON[category as IncidentCategory];
  return "•";
}

export function a11yLabel(category?: string | null, subtype?: string | null) {
  if (subtype) return `${subtype} (${category}) icon`;
  if (category) return `${category} icon`;
  return "activity icon";
}
