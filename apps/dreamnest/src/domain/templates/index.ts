/**
 * DreamNest Templates Module
 *
 * Canonical template definitions for age-appropriate content contracts.
 * Templates define what content is allowed, how it behaves, and what is forbidden.
 */

// Types
export type {
  AgeGroup,
  AgeGroupInfo,
  SlotMediaType,
  SlotDefinition,
  TemplateId,
  TemplateLimits,
  TemplateDefinition,
  SlotValue,
  PageTemplateInstance,
  ValidationError,
  ValidationWarning,
  ValidationResult,
  BookTemplateStats,
  PageType,
  PageSequenceItem,
  BookPageSequence,
} from "./types";

// Data
export {
  AGE_GROUPS,
  AGE_GROUP_ORDER,
  TEMPLATES,
  TEMPLATES_BY_AGE_GROUP,
  TEMPLATE_IDS,
} from "./data";

// Validation
export {
  // Core validation
  validatePage,
  validateBook,
  validateSlot,
  // Text utilities
  countWords,
  validateTextLimits,
  // Animation validation
  validateAnimation,
  // Extra slot validation
  validateNoExtraSlots,
  // Book statistics
  calculateBookTemplateStats,
  // Age-based utilities
  isTemplateValidForAge,
  getTemplatesForAgeRange,
  // Slot utilities
  getRequiredSlots,
  getOptionalSlots,
  createEmptySlots,
} from "./validation";

// Coexistence Rules
export type {
  CoexistenceRule,
  AgeGroupTemplates,
  CoexistenceValidationError,
  CoexistenceValidationResult,
} from "./coexistence";

export {
  COEXISTENCE_RULES,
  validateTemplateCoexistence,
  getAllowedPrimaryTemplates,
  getAllowedSecondaryTemplates,
  getAgeGroupFromRange,
  isValidPrimaryTemplate,
  isValidSecondaryTemplate,
  getAgeGroupGuideline,
} from "./coexistence";

// Page Sequences
export {
  PAGE_SEQUENCES,
  getPageSequence,
  getRecommendedPageCount,
  getSequencesForAgeGroup,
  generatePageStructure,
} from "./sequences";

// ============================================================
// Convenience Re-exports
// ============================================================

import { TEMPLATES, AGE_GROUPS } from "./data";
import type { TemplateId, AgeGroup, TemplateDefinition } from "./types";

/**
 * Get a template definition by ID
 */
export function getTemplate(id: TemplateId): TemplateDefinition | undefined {
  return TEMPLATES[id];
}

/**
 * Get all templates for an age group
 */
export function getTemplatesByAgeGroup(
  ageGroup: AgeGroup
): TemplateDefinition[] {
  const { TEMPLATES_BY_AGE_GROUP } = require("./data");
  return TEMPLATES_BY_AGE_GROUP[ageGroup] || [];
}

/**
 * Check if a template ID is valid
 */
export function isValidTemplateId(id: string): id is TemplateId {
  return id in TEMPLATES;
}

/**
 * Check if an age group is valid
 */
export function isValidAgeGroup(group: string): group is AgeGroup {
  return group in AGE_GROUPS;
}

/**
 * Get human-readable age range for a template
 */
export function getTemplateAgeRange(id: TemplateId): string {
  const template = TEMPLATES[id];
  if (!template) return "Unknown";

  const ageGroup = AGE_GROUPS[template.ageGroup];
  if (ageGroup.ageMin === 0) {
    return `${ageGroup.ageMax} years and under`;
  }
  return `${ageGroup.ageMin}-${ageGroup.ageMax} years`;
}

/**
 * Get the default template for a given age
 * Returns the most appropriate primary template based on age
 */
export function getDefaultTemplate(age: number): TemplateId {
  if (age <= 1) return "BABY_LOOK_AND_LISTEN";
  if (age <= 3) return "TODDLER_POINT_AND_NAME";
  if (age <= 5) return "PRESCHOOL_SIMPLE_STORY";
  if (age <= 8) return "KIDS_STORY_REEL";
  if (age <= 10) return "TWEEN_GUIDED_STORY";
  return "PRETEEN_CHAPTER_SCENE";
}

// Re-export commonly used template list for convenience
export const templates = Object.values(TEMPLATES);
