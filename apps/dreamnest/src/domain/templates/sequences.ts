/**
 * DreamNest Page Sequences
 *
 * Defines intelligent page structures based on age groups and templates.
 * When a book is created, it automatically generates pages following
 * age-appropriate patterns.
 */

import type {
  AgeGroup,
  TemplateId,
  BookPageSequence,
  PageSequenceItem,
} from "./types";

// ============================================================
// Page Sequences by Age Group and Template
// ============================================================

/**
 * BABY (0-12 months) - LOOK_AND_LISTEN Template
 * Focus: Visual stimulation, high-contrast images, soothing sounds
 * Pattern: Slow, repetitive, calming
 */
const BABY_LOOK_AND_LISTEN: BookPageSequence = {
  ageGroup: "BABY",
  primaryTemplate: "LOOK_AND_LISTEN",
  recommendedPageCount: 6,
  pattern: "Video intro → Image pairs → Audio-visual experience",
  pages: [
    {
      type: "video_with_subtitles",
      templateId: "LOOK_AND_LISTEN",
      description: "Opening video with gentle narration",
      slotHints: {
        video_id: "Soothing intro video (5-10s)",
        subtitle_text: "Hello little one...",
      },
    },
    {
      type: "image_with_text",
      templateId: "LOOK_AND_LISTEN",
      description: "Large, high-contrast image with short text",
      slotHints: {
        primary_image_id: "Bold, simple image",
        text: "Look at the bright colors (3-5 words)",
      },
    },
    {
      type: "image_only",
      templateId: "LOOK_AND_LISTEN",
      description: "Pure visual focus - no text distraction",
      slotHints: {
        primary_image_id: "Single engaging object",
      },
    },
    {
      type: "video_only",
      templateId: "LOOK_AND_LISTEN",
      description: "Slow-motion video with gentle music",
      slotHints: {
        video_id: "Gentle movement (5-8s)",
        audio_id: "Soft background music",
      },
    },
    {
      type: "image_with_text",
      templateId: "LOOK_AND_LISTEN",
      description: "Another image pair",
      slotHints: {
        primary_image_id: "Different subject",
        text: "See the gentle movement (3-5 words)",
      },
    },
    {
      type: "audio_visual",
      templateId: "LOOK_AND_LISTEN",
      description: "Closing with sound and image",
      slotHints: {
        primary_image_id: "Calming image",
        audio_id: "Lullaby or gentle sounds",
      },
    },
  ],
};

/**
 * TODDLER (1-3 years) - POINT_AND_NAME Template
 * Focus: Object identification, vocabulary building
 * Pattern: Name objects, encourage pointing, repetition
 */
const TODDLER_POINT_AND_NAME: BookPageSequence = {
  ageGroup: "TODDLER",
  primaryTemplate: "POINT_AND_NAME",
  recommendedPageCount: 8,
  pattern: "Video intro → Object naming sequence → Interactive recap",
  pages: [
    {
      type: "video_with_subtitles",
      templateId: "POINT_AND_NAME",
      description: "Friendly greeting video",
      slotHints: {
        video_id: "Engaging character intro (5-8s)",
        subtitle_text: "Let's find some things!",
      },
    },
    {
      type: "image_with_text",
      templateId: "POINT_AND_NAME",
      description: "First object - large and clear",
      slotHints: {
        object_image_id: "Single, prominent object",
        label_text: "Ball! (1-2 words)",
      },
    },
    {
      type: "image_with_text",
      templateId: "POINT_AND_NAME",
      description: "Second object",
      slotHints: {
        object_image_id: "Different object",
        label_text: "Dog! (1-2 words)",
      },
    },
    {
      type: "video_only",
      templateId: "SLOW_ACTION",
      description: "Short action video",
      slotHints: {
        video_id: "Object in use (8-10s)",
      },
    },
    {
      type: "image_with_text",
      templateId: "POINT_AND_NAME",
      description: "Third object",
      slotHints: {
        object_image_id: "New object",
        label_text: "Tree! (1-2 words)",
      },
    },
    {
      type: "image_with_text",
      templateId: "POINT_AND_NAME",
      description: "Fourth object",
      slotHints: {
        object_image_id: "Another object",
        label_text: "Car! (1-2 words)",
      },
    },
    {
      type: "interactive",
      templateId: "POINT_AND_NAME",
      description: "Point and find game",
      slotHints: {
        scene_image_id: "Scene with all objects",
        prompt_text: "Can you find the ball?",
      },
    },
    {
      type: "video_with_subtitles",
      templateId: "POINT_AND_NAME",
      description: "Celebration and goodbye",
      slotHints: {
        video_id: "Positive reinforcement (5s)",
        subtitle_text: "Great job!",
      },
    },
  ],
};

/**
 * PRESCHOOL (3-5 years) - STORY_MOMENT Template
 * Focus: Simple narratives, cause and effect, emotions
 * Pattern: Story setup → Events → Resolution
 */
const PRESCHOOL_STORY_MOMENT: BookPageSequence = {
  ageGroup: "PRESCHOOL",
  primaryTemplate: "STORY_MOMENT",
  recommendedPageCount: 10,
  pattern: "Video intro → Story sequence with variety → Question ending",
  pages: [
    {
      type: "video_with_subtitles",
      templateId: "STORY_MOMENT",
      description: "Story opening with character",
      slotHints: {
        video_id: "Character introduction (10s)",
        subtitle_text: "Meet Lily the rabbit...",
      },
    },
    {
      type: "image_with_text",
      templateId: "STORY_MOMENT",
      description: "Setting the scene",
      slotHints: {
        primary_image_id: "Story location",
        text: "Lily lived in a cozy burrow (10-15 words)",
      },
    },
    {
      type: "image_with_text",
      templateId: "STORY_MOMENT",
      description: "Problem introduction",
      slotHints: {
        primary_image_id: "The challenge",
        text: "One day, Lily couldn't find her favorite carrot (12-18 words)",
      },
    },
    {
      type: "video_only",
      templateId: "ANIMATED_ACTION",
      description: "Action sequence",
      slotHints: {
        video_id: "Character searching (12-15s)",
      },
    },
    {
      type: "image_with_text",
      templateId: "STORY_MOMENT",
      description: "Searching",
      slotHints: {
        primary_image_id: "Different location",
        text: "She looked under the big oak tree (10-15 words)",
      },
    },
    {
      type: "image_with_text",
      templateId: "STORY_MOMENT",
      description: "Finding help",
      slotHints: {
        primary_image_id: "Friend appears",
        text: "Her friend owl offered to help (10-15 words)",
      },
    },
    {
      type: "video_with_subtitles",
      templateId: "STORY_MOMENT",
      description: "Working together",
      slotHints: {
        video_id: "Teamwork moment (10-12s)",
        subtitle_text: "Let's search together!",
      },
    },
    {
      type: "image_with_text",
      templateId: "STORY_MOMENT",
      description: "Discovery",
      slotHints: {
        primary_image_id: "Finding the carrot",
        text: "They found it in the garden! (8-12 words)",
      },
    },
    {
      type: "image_with_text",
      templateId: "STORY_MOMENT",
      description: "Resolution",
      slotHints: {
        primary_image_id: "Happy ending",
        text: "Lily learned that friends help each other (12-18 words)",
      },
    },
    {
      type: "choice_point",
      templateId: "QUESTION_AND_WAIT",
      description: "Interactive question",
      slotHints: {
        question_text: "Who helped Lily find her carrot?",
        answer_options: "Owl, Squirrel, Fox",
      },
    },
  ],
};

/**
 * KIDS (6-8 years) - STORY_REEL Template
 * Focus: Chapter-like structure, more complex vocabulary
 * Pattern: Multi-scene narrative with choices
 */
const KIDS_STORY_REEL: BookPageSequence = {
  ageGroup: "KIDS",
  primaryTemplate: "STORY_REEL",
  recommendedPageCount: 12,
  pattern: "Chapter intro → Story scenes → Interactive choices → Conclusion",
  pages: [
    {
      type: "video_with_subtitles",
      templateId: "STORY_REEL",
      description: "Chapter title sequence",
      slotHints: {
        video_id: "Dramatic intro (12-15s)",
        subtitle_text: "Chapter 1: The Mystery Begins",
      },
    },
    {
      type: "text_heavy",
      templateId: "STORY_REEL",
      description: "Story setup with more text",
      slotHints: {
        text: "In the small town of Willowbrook... (50-80 words)",
        accent_image_id: "Town illustration",
      },
    },
    {
      type: "image_with_text",
      templateId: "STORY_REEL",
      description: "Character introduction",
      slotHints: {
        primary_image_id: "Main character",
        text: "Meet Alex, a curious 8-year-old who loved solving puzzles (30-50 words)",
      },
    },
    {
      type: "video_with_subtitles",
      templateId: "STORY_REEL",
      description: "Discovery moment",
      slotHints: {
        video_id: "Finding the clue (15-18s)",
        subtitle_text: "What's this?",
      },
    },
    {
      type: "image_with_text",
      templateId: "STORY_REEL",
      description: "The clue",
      slotHints: {
        primary_image_id: "Mysterious object",
        text: "A strange map with symbols Alex had never seen before (40-60 words)",
      },
    },
    {
      type: "interactive",
      templateId: "INTERACTIVE_CHOICE",
      description: "Decision point",
      slotHints: {
        scenario_text: "Should Alex follow the map alone or ask friends?",
        choice_a: "Go alone",
        choice_b: "Ask friends",
      },
    },
    {
      type: "image_with_text",
      templateId: "STORY_REEL",
      description: "Journey begins",
      slotHints: {
        primary_image_id: "Path or journey",
        text: "The adventure led through the old forest (40-60 words)",
      },
    },
    {
      type: "video_only",
      templateId: "STORY_REEL",
      description: "Action sequence",
      slotHints: {
        video_id: "Exploration montage (15-20s)",
      },
    },
    {
      type: "image_with_text",
      templateId: "STORY_REEL",
      description: "Challenge",
      slotHints: {
        primary_image_id: "Obstacle",
        text: "A river blocked the path. How to cross? (40-60 words)",
      },
    },
    {
      type: "interactive",
      templateId: "INTERACTIVE_CHOICE",
      description: "Problem solving",
      slotHints: {
        scenario_text: "How should Alex cross the river?",
        choice_a: "Build a raft",
        choice_b: "Find a bridge",
      },
    },
    {
      type: "image_with_text",
      templateId: "STORY_REEL",
      description: "Resolution",
      slotHints: {
        primary_image_id: "Success moment",
        text: "The map led to an amazing discovery... (50-80 words)",
      },
    },
    {
      type: "video_with_subtitles",
      templateId: "STORY_REEL",
      description: "Chapter conclusion",
      slotHints: {
        video_id: "Closing scene (10-15s)",
        subtitle_text: "To be continued...",
      },
    },
  ],
};

/**
 * TWEEN (8-10 years) - GUIDED_STORY Template
 * Focus: Complex narratives, character development, themes
 * Pattern: Multi-chapter with reflection points
 */
const TWEEN_GUIDED_STORY: BookPageSequence = {
  ageGroup: "TWEEN",
  primaryTemplate: "GUIDED_STORY",
  recommendedPageCount: 15,
  pattern: "Prologue → Story chapters with choices → Reflection → Conclusion",
  pages: [
    {
      type: "video_with_subtitles",
      templateId: "GUIDED_STORY",
      description: "Cinematic opening",
      slotHints: {
        video_id: "Atmospheric intro (20s)",
        subtitle_text: "Every story begins with a choice...",
      },
    },
    {
      type: "text_heavy",
      templateId: "GUIDED_STORY",
      description: "Prologue - setting and mood",
      slotHints: {
        text: "The world of Eldoria was changing... (100-150 words)",
        background_image_id: "Epic landscape",
      },
    },
    {
      type: "image_with_text",
      templateId: "GUIDED_STORY",
      description: "Protagonist introduction",
      slotHints: {
        primary_image_id: "Main character portrait",
        text: "Maya had always known she was different... (80-120 words)",
      },
    },
    {
      type: "video_with_subtitles",
      templateId: "STORY_REEL_PLUS",
      description: "Inciting incident",
      slotHints: {
        video_id: "Dramatic event (18-22s)",
        subtitle_text: "The prophecy had awakened",
      },
    },
    {
      type: "text_heavy",
      templateId: "GUIDED_STORY",
      description: "Chapter 1 - The Call",
      slotHints: {
        text: "A mysterious messenger arrived at dawn... (120-180 words)",
      },
    },
    {
      type: "choice_point",
      templateId: "REFLECTIVE_CHOICE",
      description: "Major decision",
      slotHints: {
        scenario_text: "Accept the quest or protect your village?",
        choice_a: "Accept the quest",
        choice_b: "Protect the village",
        reflection_prompt: "What would you do?",
      },
    },
    {
      type: "image_with_text",
      templateId: "GUIDED_STORY",
      description: "Consequences unfold",
      slotHints: {
        primary_image_id: "Scene change",
        text: "Her choice set events in motion... (100-150 words)",
      },
    },
    {
      type: "video_only",
      templateId: "STORY_REEL_PLUS",
      description: "Journey montage",
      slotHints: {
        video_id: "Travel sequence (20-25s)",
      },
    },
    {
      type: "text_heavy",
      templateId: "GUIDED_STORY",
      description: "Chapter 2 - Allies",
      slotHints: {
        text: "Along the way, Maya met others like her... (120-180 words)",
      },
    },
    {
      type: "image_with_text",
      templateId: "GUIDED_STORY",
      description: "Character moment",
      slotHints: {
        primary_image_id: "Group portrait",
        text: "Together they formed an unlikely team (80-120 words)",
      },
    },
    {
      type: "reflection",
      templateId: "REFLECTIVE_CHOICE",
      description: "Theme exploration",
      slotHints: {
        reflection_text: "What makes someone a true friend?",
        guiding_questions: "Think about Maya's journey so far...",
      },
    },
    {
      type: "video_with_subtitles",
      templateId: "STORY_REEL_PLUS",
      description: "Climax buildup",
      slotHints: {
        video_id: "Tension builds (20s)",
        subtitle_text: "The final test approached",
      },
    },
    {
      type: "text_heavy",
      templateId: "GUIDED_STORY",
      description: "Chapter 3 - The Truth",
      slotHints: {
        text: "At the ancient temple, everything became clear... (150-200 words)",
      },
    },
    {
      type: "image_with_text",
      templateId: "GUIDED_STORY",
      description: "Resolution",
      slotHints: {
        primary_image_id: "Triumphant scene",
        text: "Maya discovered her true power wasn't magic at all (100-150 words)",
      },
    },
    {
      type: "video_with_subtitles",
      templateId: "GUIDED_STORY",
      description: "Epilogue",
      slotHints: {
        video_id: "Closing scene (15-20s)",
        subtitle_text: "And so, a new era began...",
      },
    },
  ],
};

/**
 * PRETEEN (10-12 years) - CHAPTER_SCENE Template
 * Focus: Novel-like experience, complex themes, character depth
 * Pattern: Multi-chapter story with inner monologue and decisions
 */
const PRETEEN_CHAPTER_SCENE: BookPageSequence = {
  ageGroup: "PRETEEN",
  primaryTemplate: "CHAPTER_SCENE",
  recommendedPageCount: 18,
  pattern:
    "Title sequence → Chapters with inner thoughts → Decision points → Resolution",
  pages: [
    {
      type: "video_with_subtitles",
      templateId: "CHAPTER_SCENE",
      description: "Book title sequence",
      slotHints: {
        video_id: "Cinematic title (25s)",
        subtitle_text: "The Last Guardian",
      },
    },
    {
      type: "text_heavy",
      templateId: "CHAPTER_SCENE",
      description: "Chapter 1 opening",
      slotHints: {
        chapter_title: "Chapter 1: Shadows of the Past",
        text: "Three years had passed since that terrible night... (200-300 words)",
      },
    },
    {
      type: "image_with_text",
      templateId: "INNER_MONOLOGUE",
      description: "Protagonist's thoughts",
      slotHints: {
        character_image_id: "Contemplative pose",
        internal_thoughts:
          "Jordan's inner voice: I can't keep running forever... (150-200 words)",
      },
    },
    {
      type: "video_with_subtitles",
      templateId: "CHAPTER_SCENE",
      description: "Flashback sequence",
      slotHints: {
        video_id: "Memory scene (22-28s)",
        subtitle_text: "Three years ago...",
      },
    },
    {
      type: "text_heavy",
      templateId: "CHAPTER_SCENE",
      description: "Present day",
      slotHints: {
        text: "The city had changed, but the danger remained... (200-300 words)",
      },
    },
    {
      type: "image_with_text",
      templateId: "CHAPTER_SCENE",
      description: "New character introduction",
      slotHints: {
        primary_image_id: "Mysterious figure",
        text: "Someone was watching. Someone who knew the truth. (180-250 words)",
      },
    },
    {
      type: "choice_point",
      templateId: "DECISION_POINT",
      description: "Moral dilemma",
      slotHints: {
        situation_text: "Confront the mysterious watcher or continue hiding?",
        choice_a: "Confront and demand answers",
        choice_b: "Keep hiding, gather more information",
        consequence_preview: "Each choice leads down a different path...",
      },
    },
    {
      type: "text_heavy",
      templateId: "CHAPTER_SCENE",
      description: "Chapter 2: Revelations",
      slotHints: {
        chapter_title: "Chapter 2: Revelations",
        text: "The truth was more complex than Jordan imagined... (200-300 words)",
      },
    },
    {
      type: "video_only",
      templateId: "CHAPTER_SCENE",
      description: "Action sequence",
      slotHints: {
        video_id: "Chase or confrontation (25-30s)",
      },
    },
    {
      type: "image_with_text",
      templateId: "INNER_MONOLOGUE",
      description: "Internal conflict",
      slotHints: {
        character_image_id: "Conflicted expression",
        internal_thoughts:
          "Was revenge worth losing everything else? (150-200 words)",
      },
    },
    {
      type: "text_heavy",
      templateId: "CHAPTER_SCENE",
      description: "Plot development",
      slotHints: {
        text: "An alliance formed from necessity, not trust... (200-300 words)",
      },
    },
    {
      type: "image_with_text",
      templateId: "CHAPTER_SCENE",
      description: "Discovery",
      slotHints: {
        primary_image_id: "Key revelation scene",
        text: "Hidden files revealed a conspiracy reaching the highest levels (180-250 words)",
      },
    },
    {
      type: "reflection",
      templateId: "DECISION_POINT",
      description: "Theme exploration",
      slotHints: {
        reflection_text: "Is justice the same as revenge?",
        guiding_questions:
          "Consider Jordan's journey and the choices made so far...",
      },
    },
    {
      type: "video_with_subtitles",
      templateId: "CHAPTER_SCENE",
      description: "Climax preparation",
      slotHints: {
        video_id: "Tension buildup (20-25s)",
        subtitle_text: "The pieces were falling into place",
      },
    },
    {
      type: "text_heavy",
      templateId: "CHAPTER_SCENE",
      description: "Chapter 3: The Guardian's Choice",
      slotHints: {
        chapter_title: "Chapter 3: The Guardian's Choice",
        text: "Everything came down to one final decision... (200-300 words)",
      },
    },
    {
      type: "choice_point",
      templateId: "DECISION_POINT",
      description: "Climactic choice",
      slotHints: {
        situation_text: "Save the city or expose the truth?",
        choice_a: "Save lives, truth stays hidden",
        choice_b: "Expose everything, accept the chaos",
        consequence_preview: "The fate of thousands rests on this choice...",
      },
    },
    {
      type: "image_with_text",
      templateId: "CHAPTER_SCENE",
      description: "Resolution",
      slotHints: {
        primary_image_id: "Aftermath scene",
        text: "Some endings are really beginnings in disguise (200-250 words)",
      },
    },
    {
      type: "video_with_subtitles",
      templateId: "CHAPTER_SCENE",
      description: "Epilogue",
      slotHints: {
        video_id: "Final scene (20-25s)",
        subtitle_text: "Six months later...",
      },
    },
  ],
};

// ============================================================
// Sequence Registry
// ============================================================

/**
 * All available page sequences by age group and template
 */
export const PAGE_SEQUENCES: Record<string, BookPageSequence> = {
  "BABY:LOOK_AND_LISTEN": BABY_LOOK_AND_LISTEN,
  "TODDLER:POINT_AND_NAME": TODDLER_POINT_AND_NAME,
  "PRESCHOOL:STORY_MOMENT": PRESCHOOL_STORY_MOMENT,
  "KIDS:STORY_REEL": KIDS_STORY_REEL,
  "TWEEN:GUIDED_STORY": TWEEN_GUIDED_STORY,
  "PRETEEN:CHAPTER_SCENE": PRETEEN_CHAPTER_SCENE,
};

/**
 * Get page sequence for a given age group and template
 */
export function getPageSequence(
  ageGroup: AgeGroup,
  templateId: TemplateId
): BookPageSequence | null {
  const key = `${ageGroup}:${templateId}`;
  return PAGE_SEQUENCES[key] || null;
}

/**
 * Get recommended page count for a template
 */
export function getRecommendedPageCount(
  ageGroup: AgeGroup,
  templateId: TemplateId
): number {
  const sequence = getPageSequence(ageGroup, templateId);
  return sequence?.recommendedPageCount || 8; // Default fallback
}

/**
 * Get all available sequences for an age group
 */
export function getSequencesForAgeGroup(
  ageGroup: AgeGroup
): BookPageSequence[] {
  return Object.values(PAGE_SEQUENCES).filter(
    (seq) => seq.ageGroup === ageGroup
  );
}

/**
 * Generate page structure data for book creation
 */
export function generatePageStructure(
  ageGroup: AgeGroup,
  primaryTemplate: TemplateId,
  customPageCount?: number
): PageSequenceItem[] {
  const sequence = getPageSequence(ageGroup, primaryTemplate);

  if (!sequence) {
    // Return a simple default structure
    return [];
  }

  // If custom count requested, adjust the sequence
  if (customPageCount && customPageCount !== sequence.pages.length) {
    // For now, just repeat or truncate
    if (customPageCount < sequence.pages.length) {
      return sequence.pages.slice(0, customPageCount);
    } else {
      // Repeat the middle pages to reach desired count
      const result = [...sequence.pages];
      const middlePages = sequence.pages.slice(1, -1); // Exclude first and last
      while (result.length < customPageCount && middlePages.length > 0) {
        const insertIndex = Math.floor(result.length / 2);
        result.splice(
          insertIndex,
          0,
          middlePages[result.length % middlePages.length]
        );
      }
      return result.slice(0, customPageCount);
    }
  }

  return sequence.pages;
}
