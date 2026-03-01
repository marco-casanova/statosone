/**
 * Anatomically accurate SVG body outline data for the BodyLocationPicker.
 *
 * ViewBox: 0 0 260 720  (all four views)
 * Body center: x = 130
 * Proportions follow the 8-head canon:
 *   Head top ≈ 28,  Chin ≈ 114,  Neck base ≈ 134
 *   Shoulders ≈ 148, Nipple line ≈ 195, Navel ≈ 280
 *   Crotch ≈ 358,  Knee ≈ 510,  Ankle ≈ 650,  Sole ≈ 684
 */

import { BodyMapView, BodyRegion } from "../types/bodyLocation";

// ── Shared shape types ──────────────────────────────────────────

export type BodySide = "left" | "right";

export type SvgShape =
  | { kind: "path"; d: string }
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number };

export interface BodyRegionSvgDef {
  id: string;
  region: BodyRegion;
  side?: BodySide;
  title: string;
  shape: SvgShape;
}

export interface BodyViewSpec {
  title: string;
  outline: SvgShape[];
  regions: BodyRegionSvgDef[];
  mirror?: boolean;
}

// ═════════════════════════════════════════════════════════════════
//  FRONT VIEW
// ═════════════════════════════════════════════════════════════════

const FRONT_BODY_SILHOUETTE = `
M 130 28
C 152 26 168 42 170 66
C 172 88 164 108 154 116
C 152 120 150 128 150 134
C 160 136 178 140 192 148
C 200 154 206 166 209 180
C 213 200 216 228 216 254
C 216 276 214 296 211 312
C 209 326 208 342 208 358
C 208 372 210 384 211 394
C 212 402 212 410 208 416
C 204 422 198 424 193 422
C 189 420 187 414 187 408
C 187 400 188 390 189 378
C 190 362 192 342 193 322
C 194 302 193 282 191 262
C 188 238 184 216 180 198
C 178 188 176 180 175 174
C 175 170 174 168 174 172
C 175 184 176 202 177 226
C 178 252 178 276 177 300
C 176 320 174 338 172 350
C 170 356 168 360 166 364
C 168 386 170 414 170 444
C 170 472 168 498 166 522
C 164 548 164 576 165 608
C 166 632 168 652 170 664
C 172 670 174 676 172 680
C 168 684 156 686 146 686
L 136 686
C 136 678 136 668 136 656
C 135 634 135 610 135 582
C 135 554 135 526 135 498
C 135 470 135 444 134 418
C 134 396 132 378 130 362
C 128 378 126 396 126 418
C 125 444 125 470 125 498
C 125 526 125 554 125 582
C 125 610 125 634 124 656
C 124 668 124 678 124 686
L 114 686
C 104 686 92 684 88 680
C 86 676 88 670 90 664
C 92 652 94 632 95 608
C 96 576 96 548 94 522
C 92 498 90 472 90 444
C 90 414 92 386 94 364
C 92 360 90 356 88 350
C 86 338 84 320 83 300
C 82 276 82 252 83 226
C 84 202 85 184 86 172
C 86 168 85 170 85 174
C 84 180 82 188 80 198
C 76 216 72 238 69 262
C 67 282 66 302 67 322
C 68 342 70 362 71 378
C 72 390 72 400 73 408
C 73 414 71 420 67 422
C 62 424 56 422 52 416
C 48 410 48 402 49 394
C 50 384 52 372 52 358
C 52 342 51 326 49 312
C 46 296 44 276 44 254
C 44 228 47 200 51 180
C 54 166 60 154 68 148
C 82 140 100 136 110 134
C 110 128 108 120 106 116
C 96 108 88 88 90 66
C 92 42 108 26 130 28
Z`.replace(/\n/g, " ");

const FRONT_OUTLINE: SvgShape[] = [
  // Main body silhouette
  { kind: "path", d: FRONT_BODY_SILHOUETTE },
  // Collar / neck lines
  {
    kind: "path",
    d: "M 110 136 C 118 140 126 142 130 142 C 134 142 142 140 150 136",
  },
  // Pectoral fold
  {
    kind: "path",
    d: "M 98 178 C 110 190 124 196 130 196 C 136 196 150 190 162 178",
  },
  // Navel
  { kind: "ellipse", cx: 130, cy: 280, rx: 2, ry: 3 },
  // Left groin crease
  { kind: "path", d: "M 120 342 C 114 350 108 358 104 364" },
  // Right groin crease
  { kind: "path", d: "M 140 342 C 146 350 152 358 156 364" },
  // Left knee line
  { kind: "path", d: "M 96 506 C 104 514 114 516 124 512" },
  // Right knee line
  { kind: "path", d: "M 164 506 C 156 514 146 516 136 512" },
];

const FRONT_REGIONS: BodyRegionSvgDef[] = [
  {
    id: "front-head",
    region: "head",
    title: "Head",
    shape: {
      kind: "path",
      d: "M 130 30 C 152 28 168 44 170 68 C 172 88 164 106 154 114 L 106 114 C 96 106 88 88 90 68 C 92 44 108 28 130 30 Z",
    },
  },
  {
    id: "front-neck",
    region: "neck",
    title: "Neck",
    shape: {
      kind: "path",
      d: "M 110 114 L 150 114 C 150 120 150 128 150 134 L 110 134 C 110 128 110 120 110 114 Z",
    },
  },
  {
    id: "front-shoulder-left",
    region: "shoulder",
    side: "left",
    title: "Left shoulder",
    shape: {
      kind: "path",
      d: "M 110 134 C 96 136 78 142 66 150 L 56 180 L 86 180 C 88 170 92 162 98 154 L 110 142 Z",
    },
  },
  {
    id: "front-shoulder-right",
    region: "shoulder",
    side: "right",
    title: "Right shoulder",
    shape: {
      kind: "path",
      d: "M 150 134 C 164 136 182 142 194 150 L 204 180 L 174 180 C 172 170 168 162 162 154 L 150 142 Z",
    },
  },
  {
    id: "front-upper-arm-left",
    region: "upper_arm",
    side: "left",
    title: "Left upper arm",
    shape: {
      kind: "path",
      d: "M 66 150 C 58 162 52 180 49 202 C 46 226 44 252 45 276 L 45 296 L 70 296 C 68 276 68 252 69 228 C 71 204 76 182 86 166 Z",
    },
  },
  {
    id: "front-upper-arm-right",
    region: "upper_arm",
    side: "right",
    title: "Right upper arm",
    shape: {
      kind: "path",
      d: "M 194 150 C 202 162 208 180 211 202 C 214 226 216 252 215 276 L 215 296 L 190 296 C 192 276 192 252 191 228 C 189 204 184 182 174 166 Z",
    },
  },
  {
    id: "front-elbow-left",
    region: "elbow",
    side: "left",
    title: "Left elbow",
    shape: { kind: "ellipse", cx: 58, cy: 306, rx: 16, ry: 14 },
  },
  {
    id: "front-elbow-right",
    region: "elbow",
    side: "right",
    title: "Right elbow",
    shape: { kind: "ellipse", cx: 202, cy: 306, rx: 16, ry: 14 },
  },
  {
    id: "front-forearm-left",
    region: "forearm",
    side: "left",
    title: "Left forearm",
    shape: {
      kind: "path",
      d: "M 49 320 C 50 336 52 350 52 364 L 72 364 C 70 350 68 336 68 320 Z",
    },
  },
  {
    id: "front-forearm-right",
    region: "forearm",
    side: "right",
    title: "Right forearm",
    shape: {
      kind: "path",
      d: "M 211 320 C 210 336 208 350 208 364 L 188 364 C 190 350 192 336 192 320 Z",
    },
  },
  {
    id: "front-wrist-hand-left",
    region: "wrist_hand",
    side: "left",
    title: "Left wrist / hand",
    shape: {
      kind: "path",
      d: "M 52 364 C 51 376 50 388 50 396 L 73 396 C 73 388 72 376 72 364 Z",
    },
  },
  {
    id: "front-wrist-hand-right",
    region: "wrist_hand",
    side: "right",
    title: "Right wrist / hand",
    shape: {
      kind: "path",
      d: "M 208 364 C 209 376 210 388 210 396 L 187 396 C 187 388 188 376 188 364 Z",
    },
  },
  {
    id: "front-fingers-left",
    region: "fingers",
    side: "left",
    title: "Left fingers",
    shape: {
      kind: "path",
      d: "M 50 396 C 48 406 48 414 52 420 C 58 426 68 426 74 420 C 76 414 74 406 73 396 Z",
    },
  },
  {
    id: "front-fingers-right",
    region: "fingers",
    side: "right",
    title: "Right fingers",
    shape: {
      kind: "path",
      d: "M 210 396 C 212 406 212 414 208 420 C 202 426 192 426 186 420 C 184 414 186 406 187 396 Z",
    },
  },
  {
    id: "front-chest",
    region: "chest",
    title: "Chest",
    shape: {
      kind: "path",
      d: "M 88 162 C 96 150 112 140 130 140 C 148 140 164 150 172 162 L 172 225 C 154 238 106 238 88 225 Z",
    },
  },
  {
    id: "front-abdomen",
    region: "abdomen",
    title: "Abdomen",
    shape: {
      kind: "path",
      d: "M 88 225 C 106 238 154 238 172 225 L 172 340 C 156 346 104 346 88 340 Z",
    },
  },
  {
    id: "front-hip-left",
    region: "hip",
    side: "left",
    title: "Left hip",
    shape: {
      kind: "path",
      d: "M 86 326 L 114 326 L 114 368 L 90 368 Z",
    },
  },
  {
    id: "front-hip-right",
    region: "hip",
    side: "right",
    title: "Right hip",
    shape: {
      kind: "path",
      d: "M 146 326 L 174 326 L 170 368 L 146 368 Z",
    },
  },
  {
    id: "front-thigh-left",
    region: "thigh",
    side: "left",
    title: "Left thigh",
    shape: {
      kind: "path",
      d: "M 92 368 C 90 394 90 424 90 454 C 90 478 92 496 94 510 L 128 510 C 128 496 128 478 128 454 C 128 424 130 394 131 368 Z",
    },
  },
  {
    id: "front-thigh-right",
    region: "thigh",
    side: "right",
    title: "Right thigh",
    shape: {
      kind: "path",
      d: "M 168 368 C 170 394 170 424 170 454 C 170 478 168 496 166 510 L 132 510 C 132 496 132 478 132 454 C 132 424 130 394 129 368 Z",
    },
  },
  {
    id: "front-knee-left",
    region: "knee",
    side: "left",
    title: "Left knee",
    shape: { kind: "ellipse", cx: 112, cy: 512, rx: 20, ry: 14 },
  },
  {
    id: "front-knee-right",
    region: "knee",
    side: "right",
    title: "Right knee",
    shape: { kind: "ellipse", cx: 148, cy: 512, rx: 20, ry: 14 },
  },
  {
    id: "front-shin-calf-left",
    region: "shin_calf",
    side: "left",
    title: "Left shin / calf",
    shape: {
      kind: "path",
      d: "M 94 526 C 95 556 96 586 96 616 C 96 630 95 640 94 648 L 126 648 C 126 640 126 630 126 616 C 126 586 126 556 126 526 Z",
    },
  },
  {
    id: "front-shin-calf-right",
    region: "shin_calf",
    side: "right",
    title: "Right shin / calf",
    shape: {
      kind: "path",
      d: "M 166 526 C 165 556 164 586 164 616 C 164 630 165 640 166 648 L 134 648 C 134 640 134 630 134 616 C 134 586 134 556 134 526 Z",
    },
  },
  {
    id: "front-ankle-foot-left",
    region: "ankle_foot",
    side: "left",
    title: "Left ankle / foot",
    shape: {
      kind: "path",
      d: "M 94 648 C 92 656 90 664 88 672 C 86 678 88 684 100 686 L 126 686 L 126 670 L 126 648 Z",
    },
  },
  {
    id: "front-ankle-foot-right",
    region: "ankle_foot",
    side: "right",
    title: "Right ankle / foot",
    shape: {
      kind: "path",
      d: "M 166 648 C 168 656 170 664 172 672 C 174 678 172 684 160 686 L 134 686 L 134 670 L 134 648 Z",
    },
  },
  {
    id: "front-toes-left",
    region: "toes",
    side: "left",
    title: "Left toes",
    shape: {
      kind: "path",
      d: "M 86 680 C 88 684 96 688 114 688 L 126 688 L 126 684 L 100 684 Z",
    },
  },
  {
    id: "front-toes-right",
    region: "toes",
    side: "right",
    title: "Right toes",
    shape: {
      kind: "path",
      d: "M 174 680 C 172 684 164 688 146 688 L 134 688 L 134 684 L 160 684 Z",
    },
  },
];

// ═════════════════════════════════════════════════════════════════
//  BACK VIEW – same body silhouette, different anatomical details
// ═════════════════════════════════════════════════════════════════

const BACK_OUTLINE: SvgShape[] = [
  // Reuse the same body silhouette
  { kind: "path", d: FRONT_BODY_SILHOUETTE },
  // Spine
  { kind: "path", d: "M 130 136 L 130 358" },
  // Left shoulder blade
  { kind: "path", d: "M 100 172 C 106 186 116 194 126 196" },
  // Right shoulder blade
  { kind: "path", d: "M 160 172 C 154 186 144 194 134 196" },
  // Lower-back dimples
  { kind: "path", d: "M 118 318 C 120 322 124 322 126 318" },
  { kind: "path", d: "M 142 318 C 140 322 136 322 134 318" },
  // Gluteal cleft
  { kind: "path", d: "M 130 342 L 130 378" },
  // Left knee crease
  { kind: "path", d: "M 96 508 C 104 514 114 516 124 514" },
  // Right knee crease
  { kind: "path", d: "M 164 508 C 156 514 146 516 136 514" },
];

const BACK_REGIONS: BodyRegionSvgDef[] = [
  {
    id: "back-head",
    region: "head",
    title: "Back of head",
    shape: {
      kind: "path",
      d: "M 130 30 C 152 28 168 44 170 68 C 172 88 164 106 154 114 L 106 114 C 96 106 88 88 90 68 C 92 44 108 28 130 30 Z",
    },
  },
  {
    id: "back-neck",
    region: "neck",
    title: "Back of neck",
    shape: {
      kind: "path",
      d: "M 110 114 L 150 114 C 150 120 150 128 150 134 L 110 134 C 110 128 110 120 110 114 Z",
    },
  },
  {
    id: "back-shoulder-left",
    region: "shoulder",
    side: "left",
    title: "Back left shoulder",
    shape: {
      kind: "path",
      d: "M 110 134 C 96 136 78 142 66 150 L 56 180 L 86 180 C 88 170 92 162 98 154 L 110 142 Z",
    },
  },
  {
    id: "back-shoulder-right",
    region: "shoulder",
    side: "right",
    title: "Back right shoulder",
    shape: {
      kind: "path",
      d: "M 150 134 C 164 136 182 142 194 150 L 204 180 L 174 180 C 172 170 168 162 162 154 L 150 142 Z",
    },
  },
  {
    id: "back-upper-arm-left",
    region: "upper_arm",
    side: "left",
    title: "Back left upper arm",
    shape: {
      kind: "path",
      d: "M 66 150 C 58 162 52 180 49 202 C 46 226 44 252 45 276 L 45 296 L 70 296 C 68 276 68 252 69 228 C 71 204 76 182 86 166 Z",
    },
  },
  {
    id: "back-upper-arm-right",
    region: "upper_arm",
    side: "right",
    title: "Back right upper arm",
    shape: {
      kind: "path",
      d: "M 194 150 C 202 162 208 180 211 202 C 214 226 216 252 215 276 L 215 296 L 190 296 C 192 276 192 252 191 228 C 189 204 184 182 174 166 Z",
    },
  },
  {
    id: "back-elbow-left",
    region: "elbow",
    side: "left",
    title: "Back left elbow",
    shape: { kind: "ellipse", cx: 58, cy: 306, rx: 16, ry: 14 },
  },
  {
    id: "back-elbow-right",
    region: "elbow",
    side: "right",
    title: "Back right elbow",
    shape: { kind: "ellipse", cx: 202, cy: 306, rx: 16, ry: 14 },
  },
  {
    id: "back-forearm-left",
    region: "forearm",
    side: "left",
    title: "Back left forearm",
    shape: {
      kind: "path",
      d: "M 49 320 C 50 336 52 350 52 364 L 72 364 C 70 350 68 336 68 320 Z",
    },
  },
  {
    id: "back-forearm-right",
    region: "forearm",
    side: "right",
    title: "Back right forearm",
    shape: {
      kind: "path",
      d: "M 211 320 C 210 336 208 350 208 364 L 188 364 C 190 350 192 336 192 320 Z",
    },
  },
  {
    id: "back-wrist-hand-left",
    region: "wrist_hand",
    side: "left",
    title: "Back left wrist / hand",
    shape: {
      kind: "path",
      d: "M 52 364 C 51 376 50 388 50 396 L 73 396 C 73 388 72 376 72 364 Z",
    },
  },
  {
    id: "back-wrist-hand-right",
    region: "wrist_hand",
    side: "right",
    title: "Back right wrist / hand",
    shape: {
      kind: "path",
      d: "M 208 364 C 209 376 210 388 210 396 L 187 396 C 187 388 188 376 188 364 Z",
    },
  },
  {
    id: "back-fingers-left",
    region: "fingers",
    side: "left",
    title: "Back left fingers",
    shape: {
      kind: "path",
      d: "M 50 396 C 48 406 48 414 52 420 C 58 426 68 426 74 420 C 76 414 74 406 73 396 Z",
    },
  },
  {
    id: "back-fingers-right",
    region: "fingers",
    side: "right",
    title: "Back right fingers",
    shape: {
      kind: "path",
      d: "M 210 396 C 212 406 212 414 208 420 C 202 426 192 426 186 420 C 184 414 186 406 187 396 Z",
    },
  },
  {
    id: "back-upper-back",
    region: "upper_back",
    title: "Upper back",
    shape: {
      kind: "path",
      d: "M 88 162 C 96 150 112 140 130 140 C 148 140 164 150 172 162 L 172 230 C 154 244 106 244 88 230 Z",
    },
  },
  {
    id: "back-lower-back",
    region: "lower_back",
    title: "Lower back",
    shape: {
      kind: "path",
      d: "M 88 230 C 106 244 154 244 172 230 L 172 340 C 156 346 104 346 88 340 Z",
    },
  },
  {
    id: "back-hip-left",
    region: "hip",
    side: "left",
    title: "Back left hip",
    shape: {
      kind: "path",
      d: "M 86 326 L 114 326 L 114 368 L 90 368 Z",
    },
  },
  {
    id: "back-hip-right",
    region: "hip",
    side: "right",
    title: "Back right hip",
    shape: {
      kind: "path",
      d: "M 146 326 L 174 326 L 170 368 L 146 368 Z",
    },
  },
  {
    id: "back-thigh-left",
    region: "thigh",
    side: "left",
    title: "Back left thigh",
    shape: {
      kind: "path",
      d: "M 92 368 C 90 394 90 424 90 454 C 90 478 92 496 94 510 L 128 510 C 128 496 128 478 128 454 C 128 424 130 394 131 368 Z",
    },
  },
  {
    id: "back-thigh-right",
    region: "thigh",
    side: "right",
    title: "Back right thigh",
    shape: {
      kind: "path",
      d: "M 168 368 C 170 394 170 424 170 454 C 170 478 168 496 166 510 L 132 510 C 132 496 132 478 132 454 C 132 424 130 394 129 368 Z",
    },
  },
  {
    id: "back-knee-left",
    region: "knee",
    side: "left",
    title: "Back left knee",
    shape: { kind: "ellipse", cx: 112, cy: 512, rx: 20, ry: 14 },
  },
  {
    id: "back-knee-right",
    region: "knee",
    side: "right",
    title: "Back right knee",
    shape: { kind: "ellipse", cx: 148, cy: 512, rx: 20, ry: 14 },
  },
  {
    id: "back-shin-calf-left",
    region: "shin_calf",
    side: "left",
    title: "Back left shin / calf",
    shape: {
      kind: "path",
      d: "M 94 526 C 95 556 96 586 96 616 C 96 630 95 640 94 648 L 126 648 C 126 640 126 630 126 616 C 126 586 126 556 126 526 Z",
    },
  },
  {
    id: "back-shin-calf-right",
    region: "shin_calf",
    side: "right",
    title: "Back right shin / calf",
    shape: {
      kind: "path",
      d: "M 166 526 C 165 556 164 586 164 616 C 164 630 165 640 166 648 L 134 648 C 134 640 134 630 134 616 C 134 586 134 556 134 526 Z",
    },
  },
  {
    id: "back-ankle-foot-left",
    region: "ankle_foot",
    side: "left",
    title: "Back left ankle / foot",
    shape: {
      kind: "path",
      d: "M 94 648 C 92 656 90 664 88 672 C 86 678 88 684 100 686 L 126 686 L 126 648 Z",
    },
  },
  {
    id: "back-ankle-foot-right",
    region: "ankle_foot",
    side: "right",
    title: "Back right ankle / foot",
    shape: {
      kind: "path",
      d: "M 166 648 C 168 656 170 664 172 672 C 174 678 172 684 160 686 L 134 686 L 134 648 Z",
    },
  },
  {
    id: "back-toes-left",
    region: "toes",
    side: "left",
    title: "Back left toes",
    shape: {
      kind: "path",
      d: "M 86 680 C 88 684 96 688 114 688 L 126 688 L 126 684 L 100 684 Z",
    },
  },
  {
    id: "back-toes-right",
    region: "toes",
    side: "right",
    title: "Back right toes",
    shape: {
      kind: "path",
      d: "M 174 680 C 172 684 164 688 146 688 L 134 688 L 134 684 L 160 684 Z",
    },
  },
];

// ═════════════════════════════════════════════════════════════════
//  SIDE VIEW – profile silhouette (left side, figure facing right)
//  The right_side view mirrors this horizontally.
// ═════════════════════════════════════════════════════════════════

// Side body: torso only (arm drawn separately, extended forward)
const SIDE_BODY_SILHOUETTE = `
M 118 28
C 134 26 148 36 154 50
C 160 64 162 78 158 90
C 154 98 154 104 156 110
C 160 118 156 124 150 128
C 144 136 140 142 136 148
C 140 154 146 160 152 164
C 160 172 166 186 168 204
C 170 224 170 248 168 274
C 166 296 166 316 168 338
C 170 354 168 368 164 380
C 160 390 158 402 158 418
C 158 438 160 460 162 482
C 164 504 160 524 154 544
C 150 560 148 576 148 594
C 148 616 146 638 146 656
C 146 668 150 678 156 686
C 162 692 168 698 162 702
C 152 706 132 706 116 704
C 102 702 92 696 88 690
C 84 684 84 678 86 672
C 88 662 90 650 92 634
C 96 610 98 586 98 562
C 98 540 96 522 94 506
C 92 486 90 466 90 446
C 90 428 86 412 82 398
C 78 384 74 370 72 354
C 68 334 68 314 70 294
C 72 272 76 252 78 232
C 82 210 84 192 88 176
C 92 164 94 156 94 148
C 90 138 86 126 84 112
C 82 94 86 74 92 58
C 100 40 110 30 118 28
Z`.replace(/\n/g, " ");

// Arm: separate path, extended forward from the shoulder so it does NOT overlap the torso
const SIDE_ARM_SILHOUETTE = `
M 168 164
C 178 168 186 176 192 188
C 198 204 204 226 208 252
C 212 278 212 302 210 326
C 208 344 206 362 206 380
C 206 392 208 404 210 414
C 212 422 210 430 204 434
C 198 438 192 434 190 428
C 188 420 188 410 190 398
C 192 382 194 364 194 346
C 194 322 192 298 190 274
C 186 248 184 226 182 206
C 180 192 178 182 176 174
C 174 168 170 164 168 164
Z`.replace(/\n/g, " ");

const SIDE_OUTLINE: SvgShape[] = [
  // Main body profile (torso + legs, no arm)
  { kind: "path", d: SIDE_BODY_SILHOUETTE },
  // Arm (separate, extended forward)
  { kind: "path", d: SIDE_ARM_SILHOUETTE },
  // Shoulder connection line
  { kind: "path", d: "M 152 164 C 158 164 164 164 168 164" },
  // Ear
  { kind: "path", d: "M 92 72 C 88 68 86 74 88 80 C 90 86 94 84 94 78" },
  // Navel hint
  { kind: "path", d: "M 166 276 C 168 278 168 280 166 280" },
  // Knee detail
  { kind: "path", d: "M 96 510 C 102 516 112 520 124 520" },
  { kind: "path", d: "M 150 540 C 146 546 140 548 134 548" },
];

const LEFT_SIDE_REGIONS: BodyRegionSvgDef[] = [
  {
    id: "left-side-head",
    region: "head",
    title: "Left side head",
    shape: {
      kind: "path",
      d: "M 118 30 C 136 28 150 40 158 58 C 164 78 162 98 154 112 C 148 122 142 130 138 140 L 96 140 C 92 130 86 118 84 106 C 82 88 86 68 94 52 C 102 38 112 30 118 30 Z",
    },
  },
  {
    id: "left-side-neck",
    region: "neck",
    title: "Left side neck",
    shape: {
      kind: "path",
      d: "M 96 140 L 138 140 C 140 146 142 152 144 158 L 92 158 C 93 152 94 146 96 140 Z",
    },
  },
  {
    id: "left-side-shoulder",
    region: "shoulder",
    title: "Left side shoulder",
    shape: {
      kind: "path",
      d: "M 92 158 L 144 158 C 152 166 160 176 166 190 L 86 190 C 84 180 86 170 92 158 Z",
    },
  },
  {
    id: "left-side-upper-arm",
    region: "upper_arm",
    title: "Left side upper arm",
    shape: {
      kind: "path",
      d: "M 176 176 C 186 188 194 208 200 234 C 206 260 208 284 208 306 L 184 306 C 184 284 182 262 178 238 C 174 216 170 198 166 186 Z",
    },
  },
  {
    id: "left-side-elbow",
    region: "elbow",
    title: "Left side elbow",
    shape: { kind: "ellipse", cx: 198, cy: 318, rx: 14, ry: 14 },
  },
  {
    id: "left-side-forearm",
    region: "forearm",
    title: "Left side forearm",
    shape: {
      kind: "path",
      d: "M 210 332 C 208 348 206 366 206 384 L 190 384 C 192 366 194 348 194 332 Z",
    },
  },
  {
    id: "left-side-wrist-hand",
    region: "wrist_hand",
    title: "Left side wrist / hand",
    shape: {
      kind: "path",
      d: "M 206 384 C 208 396 210 408 212 418 L 192 422 C 190 412 190 398 190 384 Z",
    },
  },
  {
    id: "left-side-fingers",
    region: "fingers",
    title: "Left side fingers",
    shape: {
      kind: "path",
      d: "M 212 418 C 214 428 212 436 206 440 C 200 442 194 438 192 430 L 192 422 Z",
    },
  },
  {
    id: "left-side-chest",
    region: "chest",
    title: "Left side chest",
    shape: {
      kind: "path",
      d: "M 86 190 L 168 190 C 170 208 170 228 168 250 L 78 250 C 76 228 78 208 82 190 Z",
    },
  },
  {
    id: "left-side-abdomen",
    region: "abdomen",
    title: "Left side abdomen",
    shape: {
      kind: "path",
      d: "M 78 250 L 168 250 C 168 274 168 300 168 326 L 72 326 C 70 300 70 274 72 250 Z",
    },
  },
  {
    id: "left-side-hip",
    region: "hip",
    title: "Left side hip",
    shape: {
      kind: "path",
      d: "M 72 326 L 168 326 C 168 344 164 362 158 380 L 82 380 C 76 362 72 344 72 326 Z",
    },
  },
  {
    id: "left-side-thigh",
    region: "thigh",
    title: "Left side thigh",
    shape: {
      kind: "path",
      d: "M 82 380 C 86 406 90 440 92 474 C 94 498 94 510 94 520 L 160 520 C 160 510 160 498 160 474 C 160 440 158 406 156 380 Z",
    },
  },
  {
    id: "left-side-knee",
    region: "knee",
    title: "Left side knee",
    shape: { kind: "ellipse", cx: 124, cy: 528, rx: 36, ry: 14 },
  },
  {
    id: "left-side-shin-calf",
    region: "shin_calf",
    title: "Left side shin / calf",
    shape: {
      kind: "path",
      d: "M 94 542 C 96 568 98 596 98 624 C 98 638 96 650 94 660 L 148 660 C 148 650 148 638 148 624 C 148 596 148 568 150 542 Z",
    },
  },
  {
    id: "left-side-ankle-foot",
    region: "ankle_foot",
    title: "Left side ankle / foot",
    shape: {
      kind: "path",
      d: "M 94 660 C 90 670 86 680 86 688 C 86 694 92 700 116 702 C 132 704 148 704 162 702 C 168 698 166 694 160 688 L 148 688 C 146 678 146 670 148 660 Z",
    },
  },
  {
    id: "left-side-toes",
    region: "toes",
    title: "Left side toes",
    shape: {
      kind: "path",
      d: "M 156 686 C 162 690 168 698 162 702 C 152 706 132 706 116 704 L 156 686 Z",
    },
  },
];

const RIGHT_SIDE_REGIONS: BodyRegionSvgDef[] = LEFT_SIDE_REGIONS.map((def) => ({
  ...def,
  id: def.id.replace("left-side", "right-side"),
  title: def.title.replace("Left side", "Right side"),
}));

// ═════════════════════════════════════════════════════════════════
//  ASSEMBLED VIEW SPECS
// ═════════════════════════════════════════════════════════════════

export const BODY_VIEW_SPECS: Record<BodyMapView, BodyViewSpec> = {
  front: {
    title: "Front",
    outline: FRONT_OUTLINE,
    regions: FRONT_REGIONS,
  },
  back: {
    title: "Back",
    outline: BACK_OUTLINE,
    regions: BACK_REGIONS,
  },
  left_side: {
    title: "Left side",
    outline: SIDE_OUTLINE,
    regions: LEFT_SIDE_REGIONS,
  },
  right_side: {
    title: "Right side",
    outline: SIDE_OUTLINE,
    regions: RIGHT_SIDE_REGIONS,
    mirror: true,
  },
};
