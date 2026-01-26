/**
 * DreamNest Cover Templates
 *
 * Defines 3 simple cover layout templates for book covers.
 * Each template specifies how to arrange title and visual elements.
 */

export type CoverTemplateId =
  | "VIDEO_CENTER_TEXT"
  | "IMAGE_CENTER_TEXT"
  | "TEXT_ONLY_BORDER";

export interface CoverTemplateDefinition {
  id: CoverTemplateId;
  name: string;
  description: string;
  slots: {
    title: boolean;
    subtitle: boolean;
    backgroundVideo?: boolean;
    backgroundImage?: boolean;
  };
  layout: {
    textAlignment: "center";
    hasBackground: boolean;
    hasBorder: boolean;
  };
}

export const COVER_TEMPLATES: Record<CoverTemplateId, CoverTemplateDefinition> =
  {
    VIDEO_CENTER_TEXT: {
      id: "VIDEO_CENTER_TEXT",
      name: "Video Background + Center Text",
      description: "Full-screen video background with centered title text",
      slots: {
        title: true,
        subtitle: true,
        backgroundVideo: true,
      },
      layout: {
        textAlignment: "center",
        hasBackground: true,
        hasBorder: false,
      },
    },

    IMAGE_CENTER_TEXT: {
      id: "IMAGE_CENTER_TEXT",
      name: "Image Background + Center Text",
      description: "Full-screen image background with centered title text",
      slots: {
        title: true,
        subtitle: true,
        backgroundImage: true,
      },
      layout: {
        textAlignment: "center",
        hasBackground: true,
        hasBorder: false,
      },
    },

    TEXT_ONLY_BORDER: {
      id: "TEXT_ONLY_BORDER",
      name: "Text Only + Border",
      description: "Centered text with decorative border, no background media",
      slots: {
        title: true,
        subtitle: true,
      },
      layout: {
        textAlignment: "center",
        hasBackground: false,
        hasBorder: true,
      },
    },
  };

export const COVER_TEMPLATE_IDS: CoverTemplateId[] = [
  "VIDEO_CENTER_TEXT",
  "IMAGE_CENTER_TEXT",
  "TEXT_ONLY_BORDER",
];

/**
 * Get a cover template by ID
 */
export function getCoverTemplate(id: CoverTemplateId): CoverTemplateDefinition {
  return COVER_TEMPLATES[id];
}

/**
 * Get default cover template (first option)
 */
export function getDefaultCoverTemplate(ageMin?: number): CoverTemplateId {
  return "IMAGE_CENTER_TEXT";
}

/**
 * Get all available cover templates
 */
export function getAllCoverTemplates(): CoverTemplateDefinition[] {
  return COVER_TEMPLATE_IDS.map((id) => COVER_TEMPLATES[id]);
}
