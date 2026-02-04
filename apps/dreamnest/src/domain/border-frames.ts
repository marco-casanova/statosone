/**
 * Border Frame Definitions
 * Classic and vintage decorative borders for book pages
 */

export type BorderFrameId =
  | "none"
  | "classic_simple"
  | "classic_double"
  | "ornate_victorian"
  | "vintage_corners"
  | "art_deco"
  | "storybook_wavy"
  | "medieval_scroll"
  | "nature_vine"
  | "stars_magic";

export interface BorderFrame {
  id: BorderFrameId;
  name: string;
  description: string;
  cssClass: string;
  preview: string; // Emoji or symbol for preview
  category: "classic" | "vintage" | "whimsical";
}

export const BORDER_FRAMES: Record<BorderFrameId, BorderFrame> = {
  none: {
    id: "none",
    name: "No Border",
    description: "Clean page with no decorative border",
    cssClass: "",
    preview: "⬜",
    category: "classic",
  },
  classic_simple: {
    id: "classic_simple",
    name: "Classic Simple",
    description: "Traditional single line border",
    cssClass: "border-frame-classic-simple",
    preview: "▫️",
    category: "classic",
  },
  classic_double: {
    id: "classic_double",
    name: "Classic Double",
    description: "Elegant double line border",
    cssClass: "border-frame-classic-double",
    preview: "⬛",
    category: "classic",
  },
  ornate_victorian: {
    id: "ornate_victorian",
    name: "Ornate Victorian",
    description: "Elaborate Victorian-style decorative border",
    cssClass: "border-frame-ornate-victorian",
    preview: "🎭",
    category: "vintage",
  },
  vintage_corners: {
    id: "vintage_corners",
    name: "Vintage Corners",
    description: "Decorative corner elements with thin lines",
    cssClass: "border-frame-vintage-corners",
    preview: "📐",
    category: "vintage",
  },
  art_deco: {
    id: "art_deco",
    name: "Art Deco",
    description: "Geometric 1920s Art Deco style",
    cssClass: "border-frame-art-deco",
    preview: "◆",
    category: "vintage",
  },
  storybook_wavy: {
    id: "storybook_wavy",
    name: "Storybook Wavy",
    description: "Playful wavy border for children's stories",
    cssClass: "border-frame-storybook-wavy",
    preview: "〰️",
    category: "whimsical",
  },
  medieval_scroll: {
    id: "medieval_scroll",
    name: "Medieval Scroll",
    description: "Ancient scroll-style border",
    cssClass: "border-frame-medieval-scroll",
    preview: "📜",
    category: "vintage",
  },
  nature_vine: {
    id: "nature_vine",
    name: "Nature Vine",
    description: "Organic vine and leaf border",
    cssClass: "border-frame-nature-vine",
    preview: "🌿",
    category: "whimsical",
  },
  stars_magic: {
    id: "stars_magic",
    name: "Stars & Magic",
    description: "Magical starry border for fantasy stories",
    cssClass: "border-frame-stars-magic",
    preview: "✨",
    category: "whimsical",
  },
};

export const BORDER_FRAME_IDS: BorderFrameId[] = [
  "none",
  "classic_simple",
  "classic_double",
  "ornate_victorian",
  "vintage_corners",
  "art_deco",
  "storybook_wavy",
  "medieval_scroll",
  "nature_vine",
  "stars_magic",
];

/**
 * Get a border frame by ID
 */
export function getBorderFrame(id: BorderFrameId | null | undefined): BorderFrame {
  if (!id || id === "none") {
    return BORDER_FRAMES.none;
  }
  return BORDER_FRAMES[id] || BORDER_FRAMES.none;
}

/**
 * Get all border frames
 */
export function getAllBorderFrames(): BorderFrame[] {
  return BORDER_FRAME_IDS.map((id) => BORDER_FRAMES[id]);
}

/**
 * Get border frames by category
 */
export function getBorderFramesByCategory(
  category: "classic" | "vintage" | "whimsical"
): BorderFrame[] {
  return getAllBorderFrames().filter((frame) => frame.category === category);
}
