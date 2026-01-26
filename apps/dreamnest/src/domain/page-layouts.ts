/**
 * DreamNest Page Layout Templates
 *
 * Simple visual layout templates that define how content is positioned on a page.
 * Each template specifies a layout structure and number of pages.
 */

export type PageLayoutId =
  | "VIDEO_BACKGROUND_TEXT_BOTTOM"
  | "IMAGE_BACKGROUND_TEXT_BOTTOM"
  | "HALF_IMAGE_HALF_TEXT"
  | "HALF_VIDEO_HALF_TEXT";

export interface PageLayoutTemplate {
  id: PageLayoutId;
  name: string;
  description: string;
  defaultPageCount: number;
  structure: {
    background: "video" | "image" | "none";
    layout: "full-background" | "split-horizontal";
    textPosition?: "bottom" | "right" | "top";
    videoPosition?: "top" | "background";
    imagePosition?: "top" | "background";
  };
  slots: {
    video?: boolean;
    image?: boolean;
    text: boolean;
  };
}

export const PAGE_LAYOUTS: Record<PageLayoutId, PageLayoutTemplate> = {
  VIDEO_BACKGROUND_TEXT_BOTTOM: {
    id: "VIDEO_BACKGROUND_TEXT_BOTTOM",
    name: "Video Background + Text Bottom",
    description: "Full-screen background video with text overlay at the bottom",
    defaultPageCount: 10,
    structure: {
      background: "video",
      layout: "full-background",
      textPosition: "bottom",
    },
    slots: {
      video: true,
      text: true,
    },
  },
  IMAGE_BACKGROUND_TEXT_BOTTOM: {
    id: "IMAGE_BACKGROUND_TEXT_BOTTOM",
    name: "Image Background + Text Bottom",
    description: "Full-screen background image with text overlay at the bottom",
    defaultPageCount: 10,
    structure: {
      background: "image",
      layout: "full-background",
      textPosition: "bottom",
    },
    slots: {
      image: true,
      text: true,
    },
  },
  HALF_IMAGE_HALF_TEXT: {
    id: "HALF_IMAGE_HALF_TEXT",
    name: "Half Image Top + Half Text Bottom",
    description: "Image on top half, text on bottom half in a split layout",
    defaultPageCount: 30,
    structure: {
      background: "none",
      layout: "split-horizontal",
      imagePosition: "top",
      textPosition: "bottom",
    },
    slots: {
      image: true,
      text: true,
    },
  },
  HALF_VIDEO_HALF_TEXT: {
    id: "HALF_VIDEO_HALF_TEXT",
    name: "Half Video Top + Half Text Bottom",
    description: "Video on top half, text on bottom half in a split layout",
    defaultPageCount: 30,
    structure: {
      background: "none",
      layout: "split-horizontal",
      videoPosition: "top",
      textPosition: "bottom",
    },
    slots: {
      video: true,
      text: true,
    },
  },
};

export const PAGE_LAYOUT_IDS: PageLayoutId[] = [
  "VIDEO_BACKGROUND_TEXT_BOTTOM",
  "IMAGE_BACKGROUND_TEXT_BOTTOM",
  "HALF_IMAGE_HALF_TEXT",
  "HALF_VIDEO_HALF_TEXT",
];

/**
 * Get a page layout by ID
 */
export function getPageLayout(id: PageLayoutId): PageLayoutTemplate {
  return PAGE_LAYOUTS[id];
}

/**
 * Get all available page layouts
 */
export function getAllPageLayouts(): PageLayoutTemplate[] {
  return PAGE_LAYOUT_IDS.map((id) => PAGE_LAYOUTS[id]);
}

/**
 * Get default page count for a layout
 */
export function getDefaultPageCount(layoutId: PageLayoutId): number {
  return PAGE_LAYOUTS[layoutId].defaultPageCount;
}
