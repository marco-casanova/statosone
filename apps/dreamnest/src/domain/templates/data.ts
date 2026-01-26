/**
 * DreamNest Template Definitions
 *
 * Canonical template definitions for all age groups.
 * These templates define content contracts for pages.
 */

import type {
  TemplateDefinition,
  TemplateId,
  AgeGroup,
  AgeGroupInfo,
} from "./types";

// ============================================================
// Age Group Information
// ============================================================

export const AGE_GROUPS: Record<AgeGroup, AgeGroupInfo> = {
  BABY: {
    id: "BABY",
    label: "Baby",
    ageMin: 0,
    ageMax: 1,
    description: "Calm sensory exposure with simple visuals and sounds",
  },
  TODDLER: {
    id: "TODDLER",
    label: "Toddler",
    ageMin: 1,
    ageMax: 3,
    description: "Vocabulary building and object recognition",
  },
  PRESCHOOL: {
    id: "PRESCHOOL",
    label: "Preschool",
    ageMin: 3,
    ageMax: 5,
    description: "Simple narratives and engagement through motion",
  },
  KIDS: {
    id: "KIDS",
    label: "Kids",
    ageMin: 6,
    ageMax: 8,
    description: "Agency, choices, and logical thinking",
  },
  TWEEN: {
    id: "TWEEN",
    label: "Tween",
    ageMin: 8,
    ageMax: 10,
    description: "Text-forward narrative with reflection",
  },
  PRETEEN: {
    id: "PRETEEN",
    label: "Preteen",
    ageMin: 10,
    ageMax: 12,
    description: "Chapter-based reading with emotional depth",
  },
};

export const AGE_GROUP_ORDER: AgeGroup[] = [
  "BABY",
  "TODDLER",
  "PRESCHOOL",
  "KIDS",
  "TWEEN",
  "PRETEEN",
];

// ============================================================
// 👶 BABY Templates (0-12 months)
// ============================================================

const LOOK_AND_LISTEN: TemplateDefinition = {
  id: "LOOK_AND_LISTEN",
  ageGroup: "BABY",
  name: "Look and Listen",
  purpose: "Calm sensory exposure with voice + image",
  description:
    "A calming page with a single static image and gentle narration. Designed to provide peaceful sensory stimulation for infants.",
  slots: {
    background_image_id: {
      type: "image",
      description: "Static background image with one focal object",
    },
    text: {
      type: "string",
      description: "Very short text (max 3 words)",
    },
    narration_audio_id: {
      type: "audio",
      description: "Calm, slow narration audio",
    },
  },
  rules: [
    "Static image only - no animation",
    "One focal object in the image",
    "Calm, slow narration pace",
    "No interaction elements",
    "High contrast, simple colors recommended",
  ],
  limits: {
    maxWords: 3,
    animationAllowed: false,
  },
};

const RHYTHM_REPEAT: TemplateDefinition = {
  id: "RHYTHM_REPEAT",
  ageGroup: "BABY",
  name: "Rhythm Repeat",
  purpose: "Comfort through repetition and rhythm",
  description:
    "Uses the same image and text across multiple pages to create a soothing, predictable rhythm that comforts infants.",
  slots: {
    background_image_id: {
      type: "image",
      description: "Static image - should be the same across pages",
    },
    text: {
      type: "string",
      description: "Repeated text phrase (max 4 words)",
    },
    narration_audio_id: {
      type: "audio",
      description: "Rhythmic narration audio",
    },
  },
  rules: [
    "Same image should be used across pages in sequence",
    "Same text should be repeated",
    "No variation between repetitions",
    "Rhythmic, lullaby-like narration",
  ],
  limits: {
    maxWords: 4,
    animationAllowed: false,
  },
};

const FACE_AND_VOICE: TemplateDefinition = {
  id: "FACE_AND_VOICE",
  ageGroup: "BABY",
  name: "Face and Voice",
  purpose: "Early social bonding through faces and voices",
  description:
    "Shows a friendly face with soothing voice to support early social development and bonding.",
  slots: {
    face_image_id: {
      type: "image",
      description: "Close-up image of a friendly, expressive face",
    },
    text: {
      type: "string",
      description: "Simple greeting or phrase (max 3 words)",
    },
    voice_audio_id: {
      type: "audio",
      description: "Warm, friendly voice speaking the text",
    },
  },
  rules: [
    "Face should be close-up and clearly visible",
    "Expression should be warm and welcoming",
    "Voice should be slow and soothing",
    "No busy backgrounds - focus on face",
    "High contrast for visibility",
  ],
  limits: {
    maxWords: 3,
    animationAllowed: false,
  },
};

// ============================================================
// 🚼 TODDLER Templates (1-3 years)
// ============================================================

const OBJECT_FOCUS: TemplateDefinition = {
  id: "OBJECT_FOCUS",
  ageGroup: "TODDLER",
  name: "Object Focus",
  purpose: "Vocabulary and object recognition",
  description:
    "Presents a single object for naming and recognition, supporting early vocabulary development.",
  slots: {
    background_image_id: {
      type: "image",
      description: "Simple background image",
    },
    object_media_id: {
      type: ["image", "slow_video"],
      description: "Single object - image or very slow motion video",
    },
    text: {
      type: "string",
      description: "Object name or simple phrase (max 6 words)",
    },
    narration_audio_id: {
      type: "audio",
      optional: true,
      description: "Optional clear pronunciation of the object name",
    },
  },
  rules: [
    "One object only - clear focus",
    "Optional very slow motion for the object",
    "No background animation",
    "Object should be easily recognizable",
    "High contrast between object and background",
  ],
  limits: {
    maxWords: 6,
    animationAllowed: true,
  },
};

const SLOW_ACTION: TemplateDefinition = {
  id: "SLOW_ACTION",
  ageGroup: "TODDLER",
  name: "Slow Action",
  purpose: "Cause → effect understanding",
  description:
    "Shows a single slow action to help toddlers understand cause and effect relationships.",
  slots: {
    background_image_id: {
      type: "image",
      description: "Static background image",
    },
    animation_media_id: {
      type: "video",
      description: "Slow, loopable action animation (max 5 seconds)",
    },
    text: {
      type: "string",
      description: "Simple action description",
    },
  },
  rules: [
    "Single slow action only",
    "Animation should be loopable",
    "No camera movement",
    "Predictable, repetitive motion",
    "Clear cause-effect relationship",
  ],
  limits: {
    maxDurationSeconds: 5,
    animationAllowed: true,
  },
};

const POINT_AND_NAME: TemplateDefinition = {
  id: "POINT_AND_NAME",
  ageGroup: "TODDLER",
  name: "Point and Name",
  purpose: "Interactive naming and identification",
  description:
    "Encourages toddlers to point at and identify objects, building vocabulary through active participation.",
  slots: {
    scene_image_id: {
      type: "image",
      description: "Scene with multiple identifiable objects",
    },
    target_object_highlight: {
      type: "string",
      description: "Name of the object to identify",
    },
    text: {
      type: "string",
      description: "Simple question or prompt (max 6 words)",
    },
    narration_audio_id: {
      type: "audio",
      optional: true,
      description: "Optional prompt audio",
    },
  },
  rules: [
    "Scene should have 2-4 clear objects",
    "Target object should be easily distinguishable",
    "Encourage pointing and touching",
    "Positive reinforcement for any attempt",
    "Simple, clear prompts",
  ],
  limits: {
    maxWords: 6,
    animationAllowed: false,
  },
};

// ============================================================
// 🧒 PRESCHOOL Templates (3-5 years)
// ============================================================

const STORY_MOMENT: TemplateDefinition = {
  id: "STORY_MOMENT",
  ageGroup: "PRESCHOOL",
  name: "Story Moment",
  purpose: "Simple narrative progression",
  description:
    "A single narrative beat with character focus, advancing the story one moment at a time.",
  slots: {
    background_media_id: {
      type: ["image", "video"],
      description: "Scene background - static or animated",
    },
    character_media_id: {
      type: ["image", "video"],
      description: "Character - static or with simple animation",
    },
    text: {
      type: "string",
      description: "One sentence of story (max 15 words)",
    },
    narration_audio_id: {
      type: "audio",
      optional: true,
      description: "Optional narration of the story text",
    },
  },
  rules: [
    "One sentence only",
    "Character-centered composition",
    "Maximum 40% of book pages can be animated",
    "Clear emotional expression on character",
    "Action should be easy to follow",
  ],
  limits: {
    maxWords: 15,
    animationAllowed: true,
    maxBookPercentage: 40,
  },
};

const ANIMATED_ACTION: TemplateDefinition = {
  id: "ANIMATED_ACTION",
  ageGroup: "PRESCHOOL",
  name: "Animated Action",
  purpose: "Engagement through motion",
  description:
    "An action-focused page with loopable animation to engage young readers through movement.",
  slots: {
    background_image_id: {
      type: "image",
      description: "Static background image",
    },
    animation_media_id: {
      type: "video",
      description: "Loopable action animation (max 5 seconds)",
    },
    text: {
      type: "string",
      description: "Action description text",
    },
  },
  rules: [
    "One loopable action per page",
    "Calm, predictable pacing",
    "No dialogue - action only",
    "Clear visual focus on the action",
    "Consistent animation speed",
  ],
  limits: {
    maxDurationSeconds: 5,
    animationAllowed: true,
  },
};

const QUESTION_AND_WAIT: TemplateDefinition = {
  id: "QUESTION_AND_WAIT",
  ageGroup: "PRESCHOOL",
  name: "Question and Wait",
  purpose: "Encourage thinking and verbal response",
  description:
    "Poses a simple question and creates space for the child to think and respond verbally.",
  slots: {
    background_image_id: {
      type: "image",
      description: "Scene related to the question",
    },
    question_text: {
      type: "string",
      description: "Simple, open-ended question (max 12 words)",
    },
    narration_audio_id: {
      type: "audio",
      optional: true,
      description: "Optional question narration with pause",
    },
  },
  rules: [
    "Question should be open-ended",
    "Allow thinking time - no rush",
    "No right/wrong answers",
    "Encourage verbal expression",
    "Keep language simple and clear",
  ],
  limits: {
    maxWords: 12,
    animationAllowed: false,
  },
};

// ============================================================
// 🧑‍🚀 KIDS Templates (6-8 years)
// ============================================================

const INTERACTIVE_CHOICE: TemplateDefinition = {
  id: "INTERACTIVE_CHOICE",
  ageGroup: "KIDS",
  name: "Interactive Choice",
  purpose: "Agency and logical thinking",
  description:
    "Presents a binary choice to engage readers in decision-making and logical thinking.",
  slots: {
    background_image_id: {
      type: "image",
      description: "Scene background image",
    },
    question_text: {
      type: "string",
      description: "The question or situation prompt",
    },
    option_a_text: {
      type: "string",
      description: "First choice option",
    },
    option_b_text: {
      type: "string",
      description: "Second choice option",
    },
  },
  rules: [
    "Exactly 2 options - no more, no less",
    "No timers or time pressure",
    "No scoring or points",
    "Both options should be valid",
    "Clear, understandable choices",
  ],
  limits: {
    maxWords: 30,
    animationAllowed: false,
  },
};

const STORY_REEL: TemplateDefinition = {
  id: "STORY_REEL",
  ageGroup: "KIDS",
  name: "Story Reel",
  purpose: "High-impact micro-episodes (premium)",
  description:
    "Short, impactful video-forward pages for dynamic storytelling moments.",
  slots: {
    video_media_id: {
      type: "video",
      description: "Short video clip (max 6 seconds)",
    },
    text: {
      type: "string",
      description: "Brief accompanying text (max 8 words)",
    },
  },
  rules: [
    "Use sparingly - maximum 40% of book pages",
    "No autoplay infinite scroll",
    "Clear narrative purpose",
    "Should enhance, not replace, story",
  ],
  limits: {
    maxDurationSeconds: 6,
    maxWords: 8,
    animationAllowed: true,
    maxBookPercentage: 40,
  },
  isPremium: true,
};

// ============================================================
// 🧠 TWEEN Templates (8-10 years)
// ============================================================

const GUIDED_STORY: TemplateDefinition = {
  id: "GUIDED_STORY",
  ageGroup: "TWEEN",
  name: "Guided Story",
  purpose: "Text-forward narrative with light visuals",
  description:
    "A reading-focused page with 2-4 sentences and minimal visual distraction.",
  slots: {
    background_image_id: {
      type: "image",
      description: "Subtle background illustration",
    },
    text: {
      type: "string",
      description: "Narrative text (2-4 sentences, max 120 words)",
    },
    narration_audio_id: {
      type: "audio",
      optional: true,
      description: "Optional audiobook-style narration",
    },
  },
  rules: [
    "2-4 sentences per page",
    "Calm reading flow - no interruptions",
    "Minimal visuals - text is primary",
    "No animation or interactive elements",
    "Encourage independent reading",
  ],
  limits: {
    maxWords: 120,
    animationAllowed: false,
  },
};

const REFLECTIVE_CHOICE: TemplateDefinition = {
  id: "REFLECTIVE_CHOICE",
  ageGroup: "TWEEN",
  name: "Reflective Choice",
  purpose: "Cause, consequence, reflection",
  description:
    "Presents a choice with optional consequence preview to encourage thoughtful decision-making.",
  slots: {
    background_image_id: {
      type: "image",
      description: "Scene setting image",
    },
    prompt_text: {
      type: "string",
      description: "The situation or dilemma prompt",
    },
    option_a_text: {
      type: "string",
      description: "First choice option",
    },
    option_b_text: {
      type: "string",
      description: "Second choice option",
    },
    outcome_preview_text: {
      type: "string",
      optional: true,
      description: "Optional hint about potential consequences",
    },
  },
  rules: [
    "No right/wrong labels",
    "Encourage thinking over quick answers",
    "Both choices should have merit",
    "Support discussion and reflection",
    "No gamification elements",
  ],
  limits: {
    maxWords: 80,
    animationAllowed: false,
  },
};

const STORY_REEL_PLUS: TemplateDefinition = {
  id: "STORY_REEL_PLUS",
  ageGroup: "TWEEN",
  name: "Story Reel Plus",
  purpose: "Transition scenes",
  description:
    "Extended video moments for scene transitions and dramatic impact.",
  slots: {
    video_media_id: {
      type: "video",
      description: "Transition video clip (max 8 seconds)",
    },
    text: {
      type: "string",
      description: "Brief text overlay (max 12 words)",
    },
  },
  rules: [
    "Maximum 20% of book pages",
    "No fast cuts or rapid transitions",
    "Serves narrative transition purpose",
    "Calm pacing maintained",
  ],
  limits: {
    maxDurationSeconds: 8,
    maxWords: 12,
    animationAllowed: true,
    maxBookPercentage: 20,
  },
};

// ============================================================
// 🧠 PRETEEN Templates (10-12 years)
// ============================================================

const CHAPTER_SCENE: TemplateDefinition = {
  id: "CHAPTER_SCENE",
  ageGroup: "PRETEEN",
  name: "Chapter Scene",
  purpose: "Chapter-based reading",
  description:
    "A text-primary page for chapter-style reading with optional illustration support.",
  slots: {
    chapter_title: {
      type: "string",
      description: "Chapter or section title",
    },
    text: {
      type: "string",
      description: "Chapter text content (max 600 words)",
    },
    illustration_image_id: {
      type: "image",
      optional: true,
      description: "Optional spot illustration",
    },
  },
  rules: [
    "Text-first - illustration is secondary",
    "Illustration is optional",
    "No animation whatsoever",
    "Support long-form reading",
    "Clear typography and spacing",
  ],
  limits: {
    maxWords: 600,
    animationAllowed: false,
  },
};

const INNER_MONOLOGUE: TemplateDefinition = {
  id: "INNER_MONOLOGUE",
  ageGroup: "PRETEEN",
  name: "Inner Monologue",
  purpose: "Emotional depth and reflection",
  description:
    "Character internal thoughts and feelings for emotional storytelling.",
  slots: {
    background_image_id: {
      type: "image",
      optional: true,
      description: "Optional atmospheric background",
    },
    text: {
      type: "string",
      description: "Internal monologue text (max 200 words)",
    },
  },
  rules: [
    "Reflective, introspective tone",
    "No narration audio - reader's inner voice",
    "No interaction elements",
    "Supports emotional processing",
    "Italic or styled text recommended",
  ],
  limits: {
    maxWords: 200,
    animationAllowed: false,
  },
};

const DECISION_POINT: TemplateDefinition = {
  id: "DECISION_POINT",
  ageGroup: "PRETEEN",
  name: "Decision Point",
  purpose: "Ethical and strategic thinking",
  description:
    "Complex choices that encourage ethical reasoning and strategic thinking.",
  slots: {
    scenario_text: {
      type: "string",
      description: "The scenario or dilemma description",
    },
    option_a_text: {
      type: "string",
      description: "First choice option",
    },
    option_b_text: {
      type: "string",
      description: "Second choice option",
    },
    consequence_hint: {
      type: "string",
      optional: true,
      description: "Optional hint about consequences",
    },
  },
  rules: [
    "No gamification - no points or scores",
    "No scoring or grading of choices",
    "Encourage discussion with adults",
    "Both options have trade-offs",
    "Support ethical reasoning development",
  ],
  limits: {
    maxWords: 120,
    animationAllowed: false,
  },
};

// ============================================================
// Template Registry
// ============================================================

export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  // Baby
  LOOK_AND_LISTEN,
  RHYTHM_REPEAT,
  FACE_AND_VOICE,
  // Toddler
  OBJECT_FOCUS,
  SLOW_ACTION,
  POINT_AND_NAME,
  // Preschool
  STORY_MOMENT,
  ANIMATED_ACTION,
  QUESTION_AND_WAIT,
  // Kids
  INTERACTIVE_CHOICE,
  STORY_REEL,
  // Tween
  GUIDED_STORY,
  REFLECTIVE_CHOICE,
  STORY_REEL_PLUS,
  // Preteen
  CHAPTER_SCENE,
  INNER_MONOLOGUE,
  DECISION_POINT,
};

/**
 * Templates organized by age group
 */
export const TEMPLATES_BY_AGE_GROUP: Record<AgeGroup, TemplateDefinition[]> = {
  BABY: [LOOK_AND_LISTEN, RHYTHM_REPEAT, FACE_AND_VOICE],
  TODDLER: [OBJECT_FOCUS, SLOW_ACTION, POINT_AND_NAME],
  PRESCHOOL: [STORY_MOMENT, ANIMATED_ACTION, QUESTION_AND_WAIT],
  KIDS: [INTERACTIVE_CHOICE, STORY_REEL],
  TWEEN: [GUIDED_STORY, REFLECTIVE_CHOICE, STORY_REEL_PLUS],
  PRETEEN: [CHAPTER_SCENE, INNER_MONOLOGUE, DECISION_POINT],
};

/**
 * All template IDs in order
 */
export const TEMPLATE_IDS: TemplateId[] = Object.keys(
  TEMPLATES
) as TemplateId[];
