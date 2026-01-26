/**
 * DreamNest Template Types
 *
 * Templates are content contracts that define:
 * - What content is allowed on a page
 * - How content behaves
 * - What is forbidden
 *
 * Templates are NOT layouts. They are behavioral and content specifications
 * tied to age-appropriate developmental goals.
 */

// ============================================================
// Age Groups
// ============================================================

/**
 * Age groups with their ranges
 * BABY:     0-12 months
 * TODDLER:  1-3 years
 * PRESCHOOL: 3-5 years
 * KIDS:     6-8 years
 * TWEEN:    8-10 years
 * PRETEEN:  10-12 years
 */
export type AgeGroup =
  | "BABY"
  | "TODDLER"
  | "PRESCHOOL"
  | "KIDS"
  | "TWEEN"
  | "PRETEEN";

export interface AgeGroupInfo {
  id: AgeGroup;
  label: string;
  ageMin: number;
  ageMax: number;
  description: string;
}

// ============================================================
// Slot Types
// ============================================================

/**
 * Media types that can be assigned to slots
 */
export type SlotMediaType =
  | "image"
  | "video"
  | "slow_video"
  | "audio"
  | "string";

/**
 * Slot definition with type and optionality
 */
export interface SlotDefinition {
  /** The media/content type for this slot */
  type: SlotMediaType | SlotMediaType[];
  /** Whether this slot is optional */
  optional?: boolean;
  /** Description of what this slot should contain */
  description?: string;
}

// ============================================================
// Template IDs
// ============================================================

export type TemplateId =
  // Baby (0-12 months)
  | "LOOK_AND_LISTEN"
  | "RHYTHM_REPEAT"
  | "FACE_AND_VOICE"
  // Toddler (1-3 years)
  | "OBJECT_FOCUS"
  | "SLOW_ACTION"
  | "POINT_AND_NAME"
  // Preschool (3-5 years)
  | "STORY_MOMENT"
  | "ANIMATED_ACTION"
  | "QUESTION_AND_WAIT"
  // Kids (6-8 years)
  | "INTERACTIVE_CHOICE"
  | "STORY_REEL"
  // Tween (8-10 years)
  | "GUIDED_STORY"
  | "REFLECTIVE_CHOICE"
  | "STORY_REEL_PLUS"
  // Preteen (10-12 years)
  | "CHAPTER_SCENE"
  | "INNER_MONOLOGUE"
  | "DECISION_POINT";

// ============================================================
// Page Sequence Types
// ============================================================

/**
 * Page type within a template sequence
 */
export type PageType =
  | "cover"
  | "video_with_subtitles"
  | "image_with_text"
  | "image_only"
  | "video_only"
  | "interactive"
  | "text_heavy"
  | "audio_visual"
  | "choice_point"
  | "reflection";

/**
 * A single page in a template sequence
 */
export interface PageSequenceItem {
  /** Page type */
  type: PageType;
  /** Suggested template for this page */
  templateId: TemplateId;
  /** Human-readable description of this page */
  description: string;
  /** Pre-filled slot hints */
  slotHints?: Record<string, string>;
}

/**
 * Complete page sequence for a book
 */
export interface BookPageSequence {
  /** Age group this sequence is for */
  ageGroup: AgeGroup;
  /** Primary template this sequence uses */
  primaryTemplate: TemplateId;
  /** Recommended number of pages */
  recommendedPageCount: number;
  /** Sequence of pages */
  pages: PageSequenceItem[];
  /** Description of the sequence pattern */
  pattern: string;
}

// ============================================================
// Template Definition
// ============================================================

export interface TemplateLimits {
  /** Maximum words allowed in text content */
  maxWords?: number;
  /** Maximum duration for video/animation content in seconds */
  maxDurationSeconds?: number;
  /** Whether animation is allowed */
  animationAllowed: boolean;
  /** Maximum percentage of pages with this template in a book (0-100) */
  maxBookPercentage?: number;
}

export interface TemplateDefinition {
  /** Unique identifier for the template */
  id: TemplateId;
  /** Age group this template is designed for */
  ageGroup: AgeGroup;
  /** Human-readable name */
  name: string;
  /** Purpose/goal of this template */
  purpose: string;
  /** Detailed description */
  description?: string;
  /** Content slots available in this template */
  slots: Record<string, SlotDefinition>;
  /** Behavioral rules that must be followed */
  rules: string[];
  /** Content and behavior limits */
  limits: TemplateLimits;
  /** Whether this is a premium-only template */
  isPremium?: boolean;
}

// ============================================================
// Slot Values (Runtime)
// ============================================================

/**
 * Actual slot value at runtime
 */
export interface SlotValue {
  /** The slot key name */
  slotKey: string;
  /** Asset ID if media type, or text content if string type */
  value: string | null;
  /** The type of content in this slot */
  type: SlotMediaType;
}

/**
 * Page template instance with filled slots
 */
export interface PageTemplateInstance {
  /** The template being used */
  templateId: TemplateId;
  /** Filled slot values */
  slots: Record<string, SlotValue>;
}

// ============================================================
// Validation Types
// ============================================================

export interface ValidationError {
  code: string;
  message: string;
  slotKey?: string;
  field?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationWarning {
  code: string;
  message: string;
  slotKey?: string;
}

// ============================================================
// Book Template Statistics
// ============================================================

export interface BookTemplateStats {
  /** Total pages in the book */
  totalPages: number;
  /** Count of pages by template */
  templateCounts: Record<TemplateId, number>;
  /** Percentage of animated pages */
  animatedPercentage: number;
  /** Templates that exceed their max book percentage */
  percentageViolations: TemplateId[];
}
