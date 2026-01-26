/**
 * DreamNest Template Coexistence Rules
 *
 * Defines which template combinations are allowed within a single book.
 * Books MUST follow these rules for coherent storytelling.
 */

import type { AgeGroup, TemplateId } from "./types";

// ============================================================
// Coexistence Rule Types
// ============================================================

export interface CoexistenceRule {
  primary: TemplateId;
  secondary: TemplateId;
  allowed: boolean;
}

export interface AgeGroupTemplates {
  ageGroup: AgeGroup;
  allowedPrimary: TemplateId[];
  allowedSecondary: TemplateId[];
  rules: CoexistenceRule[];
  guideline: string;
}

// ============================================================
// Template Coexistence Rules by Age Group
// ============================================================

export const BABY_TEMPLATES: AgeGroupTemplates = {
  ageGroup: "BABY",
  allowedPrimary: ["LOOK_AND_LISTEN"],
  allowedSecondary: ["RHYTHM_REPEAT", "FACE_AND_VOICE"],
  rules: [
    { primary: "LOOK_AND_LISTEN", secondary: "RHYTHM_REPEAT", allowed: true },
    { primary: "LOOK_AND_LISTEN", secondary: "FACE_AND_VOICE", allowed: true },
    { primary: "RHYTHM_REPEAT", secondary: "FACE_AND_VOICE", allowed: false },
    { primary: "FACE_AND_VOICE", secondary: "RHYTHM_REPEAT", allowed: false },
  ],
  guideline:
    "Primary should almost always be LOOK_AND_LISTEN. Never mix two repetition-based templates.",
};

export const TODDLER_TEMPLATES: AgeGroupTemplates = {
  ageGroup: "TODDLER",
  allowedPrimary: ["OBJECT_FOCUS"],
  allowedSecondary: ["POINT_AND_NAME", "SLOW_ACTION"],
  rules: [
    { primary: "OBJECT_FOCUS", secondary: "POINT_AND_NAME", allowed: true },
    { primary: "OBJECT_FOCUS", secondary: "SLOW_ACTION", allowed: true },
    { primary: "SLOW_ACTION", secondary: "POINT_AND_NAME", allowed: false },
    { primary: "POINT_AND_NAME", secondary: "SLOW_ACTION", allowed: false },
  ],
  guideline:
    "OBJECT_FOCUS is the safest primary. SLOW_ACTION must never dominate the book.",
};

export const PRESCHOOL_TEMPLATES: AgeGroupTemplates = {
  ageGroup: "PRESCHOOL",
  allowedPrimary: ["STORY_MOMENT"],
  allowedSecondary: ["ANIMATED_ACTION", "QUESTION_AND_WAIT"],
  rules: [
    { primary: "STORY_MOMENT", secondary: "ANIMATED_ACTION", allowed: true },
    { primary: "STORY_MOMENT", secondary: "QUESTION_AND_WAIT", allowed: true },
    {
      primary: "ANIMATED_ACTION",
      secondary: "QUESTION_AND_WAIT",
      allowed: false,
    },
    {
      primary: "QUESTION_AND_WAIT",
      secondary: "ANIMATED_ACTION",
      allowed: false,
    },
  ],
  guideline: "STORY_MOMENT MUST be primary. Others only support the narrative.",
};

export const KIDS_TEMPLATES: AgeGroupTemplates = {
  ageGroup: "KIDS",
  allowedPrimary: ["INTERACTIVE_CHOICE"],
  allowedSecondary: ["STORY_REEL"],
  rules: [
    { primary: "INTERACTIVE_CHOICE", secondary: "STORY_REEL", allowed: true },
    { primary: "STORY_REEL", secondary: "INTERACTIVE_CHOICE", allowed: false },
  ],
  guideline:
    "INTERACTIVE_CHOICE must drive the book. STORY_REEL is accent only (≤ 40%).",
};

export const TWEEN_TEMPLATES: AgeGroupTemplates = {
  ageGroup: "TWEEN",
  allowedPrimary: ["GUIDED_STORY"],
  allowedSecondary: ["REFLECTIVE_CHOICE"],
  rules: [
    { primary: "GUIDED_STORY", secondary: "REFLECTIVE_CHOICE", allowed: true },
    { primary: "REFLECTIVE_CHOICE", secondary: "GUIDED_STORY", allowed: false },
  ],
  guideline: "Narrative first, reflection second. Never make choice dominant.",
};

export const PRETEEN_TEMPLATES: AgeGroupTemplates = {
  ageGroup: "PRETEEN",
  allowedPrimary: ["CHAPTER_SCENE"],
  allowedSecondary: ["DECISION_POINT"],
  rules: [
    { primary: "CHAPTER_SCENE", secondary: "DECISION_POINT", allowed: true },
    { primary: "DECISION_POINT", secondary: "CHAPTER_SCENE", allowed: false },
  ],
  guideline:
    "Chapters are mandatory backbone. Decisions punctuate, never replace chapters.",
};

// ============================================================
// Coexistence Registry
// ============================================================

export const COEXISTENCE_RULES: Record<AgeGroup, AgeGroupTemplates> = {
  BABY: BABY_TEMPLATES,
  TODDLER: TODDLER_TEMPLATES,
  PRESCHOOL: PRESCHOOL_TEMPLATES,
  KIDS: KIDS_TEMPLATES,
  TWEEN: TWEEN_TEMPLATES,
  PRETEEN: PRETEEN_TEMPLATES,
};

// ============================================================
// Validation Functions
// ============================================================

export interface CoexistenceValidationError {
  code: string;
  message: string;
}

export interface CoexistenceValidationResult {
  valid: boolean;
  errors: CoexistenceValidationError[];
  warnings: string[];
}

/**
 * Validate template combination for a book
 */
export function validateTemplateCoexistence(
  ageGroup: AgeGroup,
  primaryTemplateId: TemplateId | null,
  secondaryTemplateId: TemplateId | null
): CoexistenceValidationResult {
  const errors: CoexistenceValidationError[] = [];
  const warnings: string[] = [];

  const rules = COEXISTENCE_RULES[ageGroup];

  // No templates is valid (template-free book)
  if (!primaryTemplateId && !secondaryTemplateId) {
    return { valid: true, errors, warnings };
  }

  // Check primary template
  if (primaryTemplateId) {
    if (!rules.allowedPrimary.includes(primaryTemplateId)) {
      errors.push({
        code: "INVALID_PRIMARY",
        message: `Template "${primaryTemplateId}" cannot be used as primary for ${ageGroup} age group. Allowed: ${rules.allowedPrimary.join(
          ", "
        )}`,
      });
    }
  } else if (secondaryTemplateId) {
    // Secondary without primary is invalid
    errors.push({
      code: "SECONDARY_WITHOUT_PRIMARY",
      message: "Cannot have a secondary template without a primary template",
    });
  }

  // Check secondary template
  if (secondaryTemplateId) {
    if (!rules.allowedSecondary.includes(secondaryTemplateId)) {
      errors.push({
        code: "INVALID_SECONDARY",
        message: `Template "${secondaryTemplateId}" cannot be used as secondary for ${ageGroup} age group. Allowed: ${rules.allowedSecondary.join(
          ", "
        )}`,
      });
    }

    // Check coexistence rule
    if (primaryTemplateId) {
      const rule = rules.rules.find(
        (r) =>
          r.primary === primaryTemplateId && r.secondary === secondaryTemplateId
      );

      if (rule && !rule.allowed) {
        errors.push({
          code: "INCOMPATIBLE_COMBINATION",
          message: `Template combination "${primaryTemplateId}" + "${secondaryTemplateId}" is not allowed for ${ageGroup}. ${rules.guideline}`,
        });
      } else if (!rule) {
        // No explicit rule found - check if it's a swap
        const swappedRule = rules.rules.find(
          (r) =>
            r.primary === secondaryTemplateId &&
            r.secondary === primaryTemplateId
        );
        if (swappedRule && !swappedRule.allowed) {
          errors.push({
            code: "WRONG_PRIMARY_SECONDARY_ORDER",
            message: `Templates are in wrong order. "${secondaryTemplateId}" should be primary, not "${primaryTemplateId}".`,
          });
        }
      }
    }
  }

  // Add guideline as warning
  if (primaryTemplateId && errors.length === 0) {
    warnings.push(rules.guideline);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get allowed primary templates for an age group
 */
export function getAllowedPrimaryTemplates(ageGroup: AgeGroup): TemplateId[] {
  return COEXISTENCE_RULES[ageGroup].allowedPrimary;
}

/**
 * Get allowed secondary templates for an age group and primary
 */
export function getAllowedSecondaryTemplates(
  ageGroup: AgeGroup,
  primaryTemplateId: TemplateId | null
): TemplateId[] {
  const rules = COEXISTENCE_RULES[ageGroup];

  if (!primaryTemplateId) {
    return [];
  }

  // Filter secondary templates that have an allowed rule with the primary
  return rules.allowedSecondary.filter((secondary) => {
    const rule = rules.rules.find(
      (r) => r.primary === primaryTemplateId && r.secondary === secondary
    );
    return rule?.allowed ?? false;
  });
}

/**
 * Get age group from book's age range
 */
export function getAgeGroupFromRange(
  ageMin: number,
  ageMax: number
): AgeGroup | null {
  // Simple mapping - choose the group that best fits the range
  const midpoint = (ageMin + ageMax) / 2;

  if (midpoint <= 1) return "BABY";
  if (midpoint <= 3) return "TODDLER";
  if (midpoint <= 5) return "PRESCHOOL";
  if (midpoint <= 8) return "KIDS";
  if (midpoint <= 10) return "TWEEN";
  if (midpoint <= 12) return "PRETEEN";

  return null;
}

/**
 * Check if a template is a valid primary for an age group
 */
export function isValidPrimaryTemplate(
  ageGroup: AgeGroup,
  templateId: TemplateId
): boolean {
  return COEXISTENCE_RULES[ageGroup].allowedPrimary.includes(templateId);
}

/**
 * Check if a template is a valid secondary for an age group
 */
export function isValidSecondaryTemplate(
  ageGroup: AgeGroup,
  templateId: TemplateId
): boolean {
  return COEXISTENCE_RULES[ageGroup].allowedSecondary.includes(templateId);
}

/**
 * Get guideline for an age group
 */
export function getAgeGroupGuideline(ageGroup: AgeGroup): string {
  return COEXISTENCE_RULES[ageGroup].guideline;
}
