// Re-export all types
export * from "./database";
export * from "./api";

// Re-export template types for convenience
export type {
  AgeGroup,
  TemplateId,
  TemplateDefinition,
  SlotDefinition,
  SlotMediaType,
  SlotValue,
  PageTemplateInstance,
  ValidationResult,
  BookTemplateStats,
} from "../domain/templates";

// Narration input type (used by server actions and components)
export interface NarrationInput {
  page_id: string;
  mode: NarrationMode;
  audio_asset_id?: string | null;
  tts_text?: string | null;
  tts_voice?: string | null;
  duration_ms?: number | null;
}

// Import NarrationMode from database types
import type { NarrationMode } from "./database";
