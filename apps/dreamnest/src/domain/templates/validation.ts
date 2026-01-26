/**
 * DreamNest Template Validation
 *
 * Validates page content against template definitions.
 * Ensures all content contracts are respected.
 */

import type {
  TemplateDefinition,
  TemplateId,
  SlotValue,
  SlotDefinition,
  SlotMediaType,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  BookTemplateStats,
  PageTemplateInstance,
} from "./types";
import { TEMPLATES } from "./data";

// ============================================================
// Slot Validation
// ============================================================

/**
 * Count words in a text string
 */
export function countWords(text: string | null | undefined): number {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Check if a slot type matches the expected type(s)
 */
function isValidSlotType(
  actualType: SlotMediaType,
  expectedType: SlotMediaType | SlotMediaType[]
): boolean {
  if (Array.isArray(expectedType)) {
    return expectedType.includes(actualType);
  }
  return actualType === expectedType;
}

/**
 * Validate a single slot value against its definition
 */
export function validateSlot(
  slotKey: string,
  slotValue: SlotValue | undefined,
  slotDef: SlotDefinition
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check required slots
  if (!slotDef.optional && (!slotValue || slotValue.value === null)) {
    errors.push({
      code: "SLOT_REQUIRED",
      message: `Required slot "${slotKey}" is missing or empty`,
      slotKey,
    });
    return errors;
  }

  // If optional and empty, that's fine
  if (slotDef.optional && (!slotValue || slotValue.value === null)) {
    return errors;
  }

  // Check type match
  if (slotValue && !isValidSlotType(slotValue.type, slotDef.type)) {
    const expectedTypes = Array.isArray(slotDef.type)
      ? slotDef.type.join(" | ")
      : slotDef.type;
    errors.push({
      code: "SLOT_TYPE_MISMATCH",
      message: `Slot "${slotKey}" expects type "${expectedTypes}" but got "${slotValue.type}"`,
      slotKey,
    });
  }

  return errors;
}

// ============================================================
// Template Validation
// ============================================================

/**
 * Validate text content against word limits
 */
export function validateTextLimits(
  slots: Record<string, SlotValue>,
  limits: { maxWords?: number }
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (limits.maxWords === undefined) return errors;

  // Find all string-type slots and count total words
  let totalWords = 0;
  for (const [key, slot] of Object.entries(slots)) {
    if (slot.type === "string" && slot.value) {
      totalWords += countWords(slot.value);
    }
  }

  if (totalWords > limits.maxWords) {
    errors.push({
      code: "EXCEEDS_WORD_LIMIT",
      message: `Total word count (${totalWords}) exceeds limit of ${limits.maxWords} words`,
      field: "text",
    });
  }

  return errors;
}

/**
 * Validate animation usage
 */
export function validateAnimation(
  slots: Record<string, SlotValue>,
  limits: { animationAllowed: boolean }
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!limits.animationAllowed) {
    for (const [key, slot] of Object.entries(slots)) {
      if (slot.type === "video" || slot.type === "slow_video") {
        errors.push({
          code: "ANIMATION_NOT_ALLOWED",
          message: `Slot "${key}" contains video/animation but animation is not allowed for this template`,
          slotKey: key,
        });
      }
    }
  }

  return errors;
}

/**
 * Check for extra slots not defined in template
 */
export function validateNoExtraSlots(
  slots: Record<string, SlotValue>,
  templateDef: TemplateDefinition
): ValidationError[] {
  const errors: ValidationError[] = [];
  const definedSlots = new Set(Object.keys(templateDef.slots));

  for (const slotKey of Object.keys(slots)) {
    if (!definedSlots.has(slotKey)) {
      errors.push({
        code: "EXTRA_SLOT",
        message: `Slot "${slotKey}" is not defined in template "${templateDef.id}"`,
        slotKey,
      });
    }
  }

  return errors;
}

/**
 * Validate a page against a template definition
 */
export function validatePage(
  templateId: TemplateId,
  slots: Record<string, SlotValue>
): ValidationResult {
  const template = TEMPLATES[templateId];

  if (!template) {
    return {
      valid: false,
      errors: [
        {
          code: "UNKNOWN_TEMPLATE",
          message: `Unknown template ID: "${templateId}"`,
        },
      ],
      warnings: [],
    };
  }

  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate each defined slot
  for (const [slotKey, slotDef] of Object.entries(template.slots)) {
    errors.push(...validateSlot(slotKey, slots[slotKey], slotDef));
  }

  // Check for extra slots
  errors.push(...validateNoExtraSlots(slots, template));

  // Validate text limits
  errors.push(...validateTextLimits(slots, template.limits));

  // Validate animation rules
  errors.push(...validateAnimation(slots, template.limits));

  // Add warnings for recommended practices
  if (template.limits.maxBookPercentage) {
    warnings.push({
      code: "PERCENTAGE_LIMIT",
      message: `This template should be used on max ${template.limits.maxBookPercentage}% of book pages`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================
// Book-Level Validation
// ============================================================

/**
 * Calculate template statistics for a book
 */
export function calculateBookTemplateStats(
  pages: PageTemplateInstance[]
): BookTemplateStats {
  const totalPages = pages.length;
  const templateCounts: Record<string, number> = {};
  let animatedPageCount = 0;

  for (const page of pages) {
    // Count by template
    templateCounts[page.templateId] =
      (templateCounts[page.templateId] || 0) + 1;

    // Count animated pages
    const template = TEMPLATES[page.templateId];
    if (template?.limits.animationAllowed) {
      // Check if page actually uses animation
      for (const slot of Object.values(page.slots)) {
        if (slot.type === "video" || slot.type === "slow_video") {
          animatedPageCount++;
          break;
        }
      }
    }
  }

  const animatedPercentage =
    totalPages > 0 ? (animatedPageCount / totalPages) * 100 : 0;

  // Find templates that exceed their max percentage
  const percentageViolations: TemplateId[] = [];
  for (const [templateId, count] of Object.entries(templateCounts)) {
    const template = TEMPLATES[templateId as TemplateId];
    if (template?.limits.maxBookPercentage) {
      const percentage = (count / totalPages) * 100;
      if (percentage > template.limits.maxBookPercentage) {
        percentageViolations.push(templateId as TemplateId);
      }
    }
  }

  return {
    totalPages,
    templateCounts: templateCounts as Record<TemplateId, number>,
    animatedPercentage,
    percentageViolations,
  };
}

/**
 * Validate all pages in a book
 */
export function validateBook(
  pages: PageTemplateInstance[]
): ValidationResult & { stats: BookTemplateStats } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate each page
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const pageResult = validatePage(page.templateId, page.slots);

    // Add page index to errors
    for (const error of pageResult.errors) {
      errors.push({
        ...error,
        message: `Page ${i + 1}: ${error.message}`,
      });
    }
    for (const warning of pageResult.warnings) {
      warnings.push({
        ...warning,
        message: `Page ${i + 1}: ${warning.message}`,
      });
    }
  }

  // Calculate book-level stats
  const stats = calculateBookTemplateStats(pages);

  // Add percentage violation errors
  for (const templateId of stats.percentageViolations) {
    const template = TEMPLATES[templateId];
    const count = stats.templateCounts[templateId];
    const percentage = ((count / stats.totalPages) * 100).toFixed(1);
    errors.push({
      code: "TEMPLATE_PERCENTAGE_EXCEEDED",
      message: `Template "${templateId}" is used on ${percentage}% of pages (limit: ${template.limits.maxBookPercentage}%)`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Check if a template is valid for a given age range
 */
export function isTemplateValidForAge(
  templateId: TemplateId,
  ageMin: number,
  ageMax: number
): boolean {
  const template = TEMPLATES[templateId];
  if (!template) return false;

  // Import age group info
  const { AGE_GROUPS } = require("./data");
  const ageGroup = AGE_GROUPS[template.ageGroup];

  // Template is valid if there's any overlap with the book's age range
  return ageMin <= ageGroup.ageMax && ageMax >= ageGroup.ageMin;
}

/**
 * Get all valid templates for an age range
 */
export function getTemplatesForAgeRange(
  ageMin: number,
  ageMax: number
): TemplateDefinition[] {
  const { AGE_GROUPS, TEMPLATES_BY_AGE_GROUP } = require("./data");

  const validTemplates: TemplateDefinition[] = [];

  for (const [ageGroup, templates] of Object.entries(TEMPLATES_BY_AGE_GROUP)) {
    const groupInfo = AGE_GROUPS[ageGroup];
    // Check if age ranges overlap
    if (ageMin <= groupInfo.ageMax && ageMax >= groupInfo.ageMin) {
      validTemplates.push(...(templates as TemplateDefinition[]));
    }
  }

  return validTemplates;
}

/**
 * Get the required slots for a template
 */
export function getRequiredSlots(templateId: TemplateId): string[] {
  const template = TEMPLATES[templateId];
  if (!template) return [];

  return Object.entries(template.slots)
    .filter(([_, def]) => !def.optional)
    .map(([key]) => key);
}

/**
 * Get the optional slots for a template
 */
export function getOptionalSlots(templateId: TemplateId): string[] {
  const template = TEMPLATES[templateId];
  if (!template) return [];

  return Object.entries(template.slots)
    .filter(([_, def]) => def.optional)
    .map(([key]) => key);
}

/**
 * Create an empty slot values object for a template
 */
export function createEmptySlots(
  templateId: TemplateId
): Record<string, SlotValue> {
  const template = TEMPLATES[templateId];
  if (!template) return {};

  const slots: Record<string, SlotValue> = {};

  for (const [key, def] of Object.entries(template.slots)) {
    const type = Array.isArray(def.type) ? def.type[0] : def.type;
    slots[key] = {
      slotKey: key,
      value: null,
      type,
    };
  }

  return slots;
}
