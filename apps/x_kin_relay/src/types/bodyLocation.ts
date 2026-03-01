export type BodyMapView = "front" | "back" | "left_side" | "right_side";
export type BodySide = "left" | "right" | "both";
export type BodyDiscomfortOption =
  | "adhesion"
  | "rotation"
  | "pain"
  | "tender_joint"
  | "hypertonicity"
  | "spasm"
  | "inflammation"
  | "trigger_point"
  | "elevation";

export type BodyRegion =
  | "head"
  | "neck"
  | "shoulder"
  | "upper_arm"
  | "elbow"
  | "forearm"
  | "wrist_hand"
  | "chest"
  | "abdomen"
  | "hip"
  | "thigh"
  | "knee"
  | "shin_calf"
  | "ankle_foot"
  | "fingers"
  | "toes"
  | "upper_back"
  | "lower_back";

export interface BodyLocation {
  region: BodyRegion;
  view: BodyMapView;
  side?: BodySide;
  discomforts?: BodyDiscomfortOption[];
}

export const BODY_MAP_ENABLED_TYPES = [
  "falls",
  "near_miss",
  "pain",
  "rash",
  "cut",
  "bruise",
  "burn",
  "lump",
  "pale",
  "skin_breakdown",
  "degloving",
  "abrasion",
  "laceration",
  "bites",
  "redness",
  "inflammation",
  "tender_joint",
  "spasm",
  "weakness",
] as const;

export const BODY_REGIONS_BY_VIEW: Record<BodyMapView, BodyRegion[]> = {
  front: [
    "head",
    "neck",
    "shoulder",
    "upper_arm",
    "elbow",
    "forearm",
    "wrist_hand",
    "chest",
    "abdomen",
    "hip",
    "thigh",
    "knee",
    "shin_calf",
    "ankle_foot",
    "fingers",
    "toes",
  ],
  back: [
    "head",
    "neck",
    "shoulder",
    "upper_back",
    "lower_back",
    "hip",
    "thigh",
    "knee",
    "shin_calf",
    "ankle_foot",
    "fingers",
    "toes",
  ],
  left_side: [
    "head",
    "neck",
    "shoulder",
    "upper_arm",
    "elbow",
    "forearm",
    "wrist_hand",
    "chest",
    "abdomen",
    "hip",
    "thigh",
    "knee",
    "shin_calf",
    "ankle_foot",
    "fingers",
    "toes",
  ],
  right_side: [
    "head",
    "neck",
    "shoulder",
    "upper_arm",
    "elbow",
    "forearm",
    "wrist_hand",
    "chest",
    "abdomen",
    "hip",
    "thigh",
    "knee",
    "shin_calf",
    "ankle_foot",
    "fingers",
    "toes",
  ],
};

export const BODY_VIEW_LABELS: Record<BodyMapView, string> = {
  front: "Front",
  back: "Back",
  left_side: "Left side",
  right_side: "Right side",
};

export const BODY_REGIONS_REQUIRING_SIDE: BodyRegion[] = [
  "shoulder",
  "upper_arm",
  "elbow",
  "forearm",
  "wrist_hand",
  "hip",
  "thigh",
  "knee",
  "shin_calf",
  "ankle_foot",
  "fingers",
  "toes",
];

export const BODY_REGION_LABELS: Record<BodyRegion, string> = {
  head: "Head",
  neck: "Neck",
  shoulder: "Shoulder",
  upper_arm: "Upper arm",
  elbow: "Elbow",
  forearm: "Forearm",
  wrist_hand: "Wrist / hand",
  chest: "Chest",
  abdomen: "Abdomen",
  hip: "Hip",
  thigh: "Thigh",
  knee: "Knee",
  shin_calf: "Shin / calf",
  ankle_foot: "Ankle / foot",
  fingers: "Fingers",
  toes: "Toes",
  upper_back: "Upper back",
  lower_back: "Lower back",
};

export const BODY_DISCOMFORT_OPTIONS: Array<{
  value: BodyDiscomfortOption;
  label: string;
}> = [
  { value: "pain", label: "Pain" },
  { value: "inflammation", label: "Inflammation" },
  { value: "tender_joint", label: "Tender joint" },
  { value: "spasm", label: "Spasm" },
  { value: "trigger_point", label: "Trigger point" },
  { value: "hypertonicity", label: "Hypertonicity" },
  { value: "elevation", label: "Elevation" },
  { value: "adhesion", label: "Adhesion" },
  { value: "rotation", label: "Rotation" },
];

/**
 * Which discomfort options are clinically relevant per body region.
 * Regions not listed here get ALL options.
 */
export const DISCOMFORTS_BY_REGION: Partial<
  Record<BodyRegion, BodyDiscomfortOption[]>
> = {
  head: ["pain", "inflammation", "trigger_point", "spasm"],
  neck: [
    "pain",
    "inflammation",
    "spasm",
    "trigger_point",
    "hypertonicity",
    "rotation",
  ],
  shoulder: [
    "pain",
    "inflammation",
    "tender_joint",
    "spasm",
    "trigger_point",
    "hypertonicity",
    "rotation",
    "adhesion",
    "elevation",
  ],
  upper_arm: [
    "pain",
    "inflammation",
    "spasm",
    "trigger_point",
    "hypertonicity",
  ],
  elbow: ["pain", "inflammation", "tender_joint", "rotation"],
  forearm: ["pain", "inflammation", "spasm", "trigger_point", "hypertonicity"],
  wrist_hand: ["pain", "inflammation", "tender_joint", "rotation", "adhesion"],
  fingers: ["pain", "inflammation", "tender_joint", "adhesion"],
  chest: ["pain", "inflammation", "spasm", "trigger_point"],
  abdomen: ["pain", "inflammation", "spasm"],
  upper_back: [
    "pain",
    "inflammation",
    "spasm",
    "trigger_point",
    "hypertonicity",
    "adhesion",
  ],
  lower_back: [
    "pain",
    "inflammation",
    "spasm",
    "trigger_point",
    "hypertonicity",
    "adhesion",
  ],
  hip: [
    "pain",
    "inflammation",
    "tender_joint",
    "spasm",
    "trigger_point",
    "rotation",
  ],
  thigh: ["pain", "inflammation", "spasm", "trigger_point", "hypertonicity"],
  knee: ["pain", "inflammation", "tender_joint", "rotation"],
  shin_calf: [
    "pain",
    "inflammation",
    "spasm",
    "trigger_point",
    "hypertonicity",
  ],
  ankle_foot: ["pain", "inflammation", "tender_joint", "rotation", "elevation"],
  toes: ["pain", "inflammation", "tender_joint"],
};

/** Return the subset of discomfort options relevant to a given body region. */
export function discomfortsForRegion(region: BodyRegion) {
  const allowed = DISCOMFORTS_BY_REGION[region];
  if (!allowed) return BODY_DISCOMFORT_OPTIONS;
  return BODY_DISCOMFORT_OPTIONS.filter((opt) => allowed.includes(opt.value));
}

export function bodyLocationKey(location: BodyLocation) {
  return `${location.view}:${location.region}:${location.side || "midline"}`;
}

export function regionRequiresSide(region: BodyRegion) {
  return BODY_REGIONS_REQUIRING_SIDE.includes(region);
}

export function bodyDiscomfortLabel(option: BodyDiscomfortOption) {
  return (
    BODY_DISCOMFORT_OPTIONS.find((item) => item.value === option)?.label ||
    option
  );
}

export function bodyLocationTitle(location: BodyLocation) {
  const viewLabel = BODY_VIEW_LABELS[location.view];
  const regionLabel = BODY_REGION_LABELS[location.region];
  if (!location.side) return `${viewLabel}: ${regionLabel}`;
  const sideLabel =
    location.side === "both"
      ? "Both"
      : location.side === "left"
        ? "Left"
        : "Right";
  return `${viewLabel}: ${sideLabel} ${regionLabel.toLowerCase()}`;
}

export function bodyLocationLabel(location: BodyLocation) {
  const title = bodyLocationTitle(location);
  if (!location.discomforts?.length) return title;
  const discomfortLabels = location.discomforts
    .map(bodyDiscomfortLabel)
    .join(", ");
  return `${title} - ${discomfortLabels}`;
}
