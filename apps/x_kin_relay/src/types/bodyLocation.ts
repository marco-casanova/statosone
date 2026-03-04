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
  | "lower_back"
  | "forehead"
  | "eyes"
  | "nose"
  | "cheeks"
  | "mouth"
  | "chin"
  | "neck_throat"
  | "ribs"
  | "navel"
  | "pelvis_groin"
  | "shoulders"
  | "biceps"
  | "elbows"
  | "forearms"
  | "wrists"
  | "palms"
  | "thumbs"
  | "thighs_front"
  | "knees"
  | "shins"
  | "ankles"
  | "top_of_feet"
  | "back_of_head"
  | "ears"
  | "neck_nape"
  | "shoulder_blades"
  | "spine"
  | "buttocks"
  | "triceps"
  | "back_of_elbows"
  | "back_of_forearms"
  | "back_of_hands"
  | "hamstrings"
  | "back_of_knees"
  | "calves"
  | "achilles_tendons"
  | "heels"
  | "left_temple_ear_jaw"
  | "left_shoulder"
  | "left_arm"
  | "left_hand"
  | "left_ribcage_flank"
  | "left_hip"
  | "left_thigh"
  | "left_knee"
  | "left_calf"
  | "left_ankle"
  | "left_foot"
  | "right_temple_ear_jaw"
  | "right_shoulder"
  | "right_arm"
  | "right_hand"
  | "right_ribcage_flank"
  | "right_hip"
  | "right_thigh"
  | "right_knee"
  | "right_calf"
  | "right_ankle"
  | "right_foot";

export interface BodyLocation {
  region: BodyRegion;
  view: BodyMapView;
  instance?: number;
  side?: BodySide;
  discomforts?: BodyDiscomfortOption[];
}

export const BODY_MAP_ENABLED_TYPES = [
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
  "itchiness",
  "redness",
  "inflammation",
  "tender_joint",
  "spasm",
  "numbness",
  "restless_legs_syndrome",
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
  forehead: "Forehead",
  eyes: "Eyes",
  nose: "Nose",
  cheeks: "Cheeks",
  mouth: "Mouth",
  chin: "Chin",
  neck_throat: "Neck / throat",
  ribs: "Ribs",
  navel: "Navel",
  pelvis_groin: "Pelvis / groin",
  shoulders: "Shoulders",
  biceps: "Biceps",
  elbows: "Elbows",
  forearms: "Forearms",
  wrists: "Wrists",
  palms: "Palms",
  thumbs: "Thumbs",
  thighs_front: "Thighs (front)",
  knees: "Knees",
  shins: "Shins",
  ankles: "Ankles",
  top_of_feet: "Top of feet",
  back_of_head: "Back of head",
  ears: "Ears",
  neck_nape: "Neck (nape)",
  shoulder_blades: "Shoulder blades",
  spine: "Spine",
  buttocks: "Buttocks",
  triceps: "Triceps",
  back_of_elbows: "Back of elbows",
  back_of_forearms: "Back of forearms",
  back_of_hands: "Back of hands",
  hamstrings: "Hamstrings",
  back_of_knees: "Back of knees",
  calves: "Calves",
  achilles_tendons: "Achilles tendons",
  heels: "Heels",
  left_temple_ear_jaw: "Left temple / ear / jaw",
  left_shoulder: "Left shoulder",
  left_arm: "Left arm",
  left_hand: "Left hand",
  left_ribcage_flank: "Left ribcage / flank",
  left_hip: "Left hip",
  left_thigh: "Left thigh",
  left_knee: "Left knee",
  left_calf: "Left calf",
  left_ankle: "Left ankle",
  left_foot: "Left foot",
  right_temple_ear_jaw: "Right temple / ear / jaw",
  right_shoulder: "Right shoulder",
  right_arm: "Right arm",
  right_hand: "Right hand",
  right_ribcage_flank: "Right ribcage / flank",
  right_hip: "Right hip",
  right_thigh: "Right thigh",
  right_knee: "Right knee",
  right_calf: "Right calf",
  right_ankle: "Right ankle",
  right_foot: "Right foot",
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
  return `${location.view}:${location.region}:${location.instance ?? 0}:${location.side || "midline"}`;
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
  const instanceSuffix =
    typeof location.instance === "number" && location.instance > 0
      ? ` #${location.instance + 1}`
      : "";
  if (!location.side) return `${viewLabel}: ${regionLabel}${instanceSuffix}`;
  const sideLabel =
    location.side === "both"
      ? "Both"
      : location.side === "left"
        ? "Left"
        : "Right";
  return `${viewLabel}: ${sideLabel} ${regionLabel.toLowerCase()}${instanceSuffix}`;
}

export function bodyLocationLabel(location: BodyLocation) {
  const title = bodyLocationTitle(location);
  if (!location.discomforts?.length) return title;
  const discomfortLabels = location.discomforts
    .map(bodyDiscomfortLabel)
    .join(", ");
  return `${title} - ${discomfortLabels}`;
}
