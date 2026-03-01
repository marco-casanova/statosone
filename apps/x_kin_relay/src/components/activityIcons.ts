// Centralized activity & subtype icon utilities — Lucide React icons
import React from "react";
import {
  Shield,
  Stethoscope,
  User,
  Home,
  Bell,
  Zap,
  Droplets,
  Droplet,
  AlertTriangle,
  AlertCircle,
  ArrowLeftRight,
  Footprints,
  Waves,
  Shirt,
  Utensils,
  Apple,
  Moon,
  Activity,
  Scale,
  BookOpen,
  Gamepad2,
  Monitor,
  Music,
  Users,
  Brain,
  Dumbbell,
  TreePine,
  Palette,
  Eye,
  Wind,
  Pill,
  CheckCircle,
  XCircle,
  Bandage,
  HelpCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IncidentCategory } from "../types/schema";

// ---------------------------------------------------------
// Category-level fallback icons
// ---------------------------------------------------------
export const CATEGORY_ICON: Record<IncidentCategory, LucideIcon> = {
  safety: Shield,
  health_observation: Stethoscope,
  adl: User,
  environment: Home,
  service: Bell,
  engagement: Zap,
};

// ---------------------------------------------------------
// Subtype-specific icons (override category fallback)
// ---------------------------------------------------------
export const SUBTYPE_ICON: Record<string, LucideIcon> = {
  // Hydration
  hydration: Droplets,
  water: Droplets,

  // Sleep
  sleep_rest: Moon,
  rest: Moon,

  // Nutrition
  nutrition_meal: Apple,
  feeding: Utensils,

  // ADL / personal care
  bathing_hygiene: Waves,
  dressing_grooming: Shirt,
  toileting: User,
  continence_bladder: User,
  continence_bowel: User,

  // Mobility
  transfer: ArrowLeftRight,
  ambulation_walk: Footprints,

  // Health observations
  vital_sign: Activity,
  weight_entry: Scale,
  glucose_value: Droplet,
  breathing_difficulty: Wind,
  cough: Wind,
  phlegm_sputum: Droplet,
  airway_obstruction: AlertCircle,
  burn: Bandage,
  rash: Eye,
  redness: AlertCircle,
  cut: Bandage,
  bruise: Bandage,
  lump: AlertCircle,
  pale: Eye,
  inflammation: AlertCircle,
  pain: AlertCircle,
  tender_joint: AlertCircle,
  spasm: Activity,
  bites: AlertCircle,
  skin_breakdown: Bandage,
  degloving: Bandage,
  weakness: Activity,
  insomnia: Moon,
  sleep_apnea: Moon,
  restless_legs_syndrome: Footprints,
  inappetence: Utensils,

  // Behaviour / cognition
  behaviour_change: Brain,
  confusion: HelpCircle,
  hallucination: Eye,
  challenging_behaviour: Brain,
  delusion: Brain,
  grief_sadness: HelpCircle,

  // Safety / incidents
  falls: AlertTriangle,
  fall: AlertTriangle,
  abrasion: Bandage,
  laceration: Bandage,
  medication_error: AlertCircle,

  // Medication service
  other: Pill,

  // Engagement / activities
  reading: BookOpen,
  video_game: Gamepad2,
  tv_viewing: Monitor,
  music_listening: Music,
  social_visit: Users,
  puzzle_brain: Brain,
  exercise_light: Dumbbell,
  exercise_moderate: Dumbbell,
  outdoor_walk: TreePine,
  art_craft: Palette,
  general_activity: Zap,

  // Medication outcomes
  medication_administered: CheckCircle,
  medication_refused: XCircle,
};

// ---------------------------------------------------------
// Render helper — returns a React element (works in .ts via React.createElement)
// ---------------------------------------------------------
export function iconFor(
  category?: IncidentCategory | string | null,
  subtype?: string | null,
  size = 24,
): React.ReactNode {
  const Icon: LucideIcon | undefined =
    (subtype ? SUBTYPE_ICON[subtype] : undefined) ||
    (category ? CATEGORY_ICON[category as IncidentCategory] : undefined);

  if (!Icon) return null;
  return React.createElement(Icon, { size, strokeWidth: 1.8 });
}

export function a11yLabel(category?: string | null, subtype?: string | null) {
  if (subtype) return `${subtype} (${category}) icon`;
  if (category) return `${category} icon`;
  return "activity icon";
}
