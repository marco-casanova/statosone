import { BodyMapView, BodyRegion } from "../types/bodyLocation";

export type BodySide = "left" | "right";

export type SvgShape =
  | { kind: "path"; d: string }
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number };

export type SvgShapeSet = SvgShape | SvgShape[];

export interface BodyRegionSvgDef {
  id: string;
  region: BodyRegion;
  side?: BodySide;
  title: string;
  shape: SvgShapeSet;
}

export interface BodyViewSpec {
  title: string;
  outline: SvgShape[];
  regions: BodyRegionSvgDef[];
  regionClip?: SvgShape[];
  mirror?: boolean;
}

const path = (d: string): SvgShape => ({ kind: "path", d });

const ellipse = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): SvgShape => ({
  kind: "ellipse",
  cx,
  cy,
  rx,
  ry,
});

function roundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius = Math.min(width, height) / 2,
): SvgShape {
  const right = x + width;
  const bottom = y + height;
  const r = Math.min(radius, width / 2, height / 2);
  return path(
    `M ${x + r} ${y} H ${right - r} A ${r} ${r} 0 0 1 ${right} ${y + r} V ${bottom - r} A ${r} ${r} 0 0 1 ${right - r} ${bottom} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${bottom - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`,
  );
}

function capsuleRow(
  startX: number,
  startY: number,
  width: number,
  gap: number,
  lengths: number[],
): SvgShape[] {
  return lengths.map((length, index) =>
    roundedRect(startX + index * (width + gap), startY, width, length),
  );
}

function flattenShapeSet(shapeSet: SvgShapeSet): SvgShape[] {
  return Array.isArray(shapeSet) ? shapeSet : [shapeSet];
}

function flattenRegionShapes(regions: BodyRegionSvgDef[]): SvgShape[] {
  return regions.flatMap((region) => flattenShapeSet(region.shape));
}

function outlineFromRegions(
  regions: BodyRegionSvgDef[],
  extra: SvgShape[] = [],
): SvgShape[] {
  return [...flattenRegionShapes(regions), ...extra];
}

const FRONT_LEFT_FINGERS = capsuleRow(25, 488, 5, 2, [18, 24, 28, 24, 18]);
const FRONT_RIGHT_FINGERS = capsuleRow(206, 488, 5, 2, [18, 24, 28, 24, 18]);
const FRONT_LEFT_TOES = capsuleRow(97, 704, 5, 2, [8, 10, 12, 10, 8]);
const FRONT_RIGHT_TOES = capsuleRow(138, 704, 5, 2, [8, 10, 12, 10, 8]);

const FRONT_REGIONS: BodyRegionSvgDef[] = [
  {
    id: "front-head",
    region: "head",
    title: "Head",
    shape: path(
      "M 130 28 C 154 28 168 48 168 78 C 168 100 160 118 146 128 C 142 132 136 136 130 136 C 124 136 118 132 114 128 C 100 118 92 100 92 78 C 92 48 106 28 130 28 Z",
    ),
  },
  {
    id: "front-neck",
    region: "neck",
    title: "Neck",
    shape: roundedRect(118, 116, 24, 24, 10),
  },
  {
    id: "front-shoulder-left",
    region: "shoulder",
    side: "left",
    title: "Left shoulder",
    shape: path(
      "M 114 136 C 98 138 84 146 70 158 C 62 168 60 180 68 194 L 96 198 C 98 178 104 158 114 136 Z",
    ),
  },
  {
    id: "front-shoulder-right",
    region: "shoulder",
    side: "right",
    title: "Right shoulder",
    shape: path(
      "M 146 136 C 162 138 176 146 190 158 C 198 168 200 180 192 194 L 164 198 C 162 178 156 158 146 136 Z",
    ),
  },
  {
    id: "front-upper-arm-left",
    region: "upper_arm",
    side: "left",
    title: "Left upper arm",
    shape: path(
      "M 68 182 C 50 202 42 230 42 266 C 42 290 48 312 58 328 L 76 316 C 70 296 68 274 68 248 C 68 222 72 200 80 184 Z",
    ),
  },
  {
    id: "front-upper-arm-right",
    region: "upper_arm",
    side: "right",
    title: "Right upper arm",
    shape: path(
      "M 192 182 C 210 202 218 230 218 266 C 218 290 212 312 202 328 L 184 316 C 190 296 192 274 192 248 C 192 222 188 200 180 184 Z",
    ),
  },
  {
    id: "front-elbow-left",
    region: "elbow",
    side: "left",
    title: "Left elbow",
    shape: ellipse(60, 332, 16, 15),
  },
  {
    id: "front-elbow-right",
    region: "elbow",
    side: "right",
    title: "Right elbow",
    shape: ellipse(200, 332, 16, 15),
  },
  {
    id: "front-forearm-left",
    region: "forearm",
    side: "left",
    title: "Left forearm",
    shape: path(
      "M 54 344 C 42 366 34 390 32 418 C 32 434 36 448 44 460 L 60 450 C 56 436 56 420 58 402 C 60 382 64 362 70 346 Z",
    ),
  },
  {
    id: "front-forearm-right",
    region: "forearm",
    side: "right",
    title: "Right forearm",
    shape: path(
      "M 206 344 C 218 366 226 390 228 418 C 228 434 224 448 216 460 L 200 450 C 204 436 204 420 202 402 C 200 382 196 362 190 346 Z",
    ),
  },
  {
    id: "front-wrist-hand-left",
    region: "wrist_hand",
    side: "left",
    title: "Left wrist / hand",
    shape: path(
      "M 28 454 C 20 464 18 476 20 490 C 22 504 30 512 42 514 C 54 512 62 504 64 492 C 66 478 62 466 52 456 C 44 450 34 450 28 454 Z",
    ),
  },
  {
    id: "front-wrist-hand-right",
    region: "wrist_hand",
    side: "right",
    title: "Right wrist / hand",
    shape: path(
      "M 232 454 C 240 464 242 476 240 490 C 238 504 230 512 218 514 C 206 512 198 504 196 492 C 194 478 198 466 208 456 C 216 450 226 450 232 454 Z",
    ),
  },
  {
    id: "front-fingers-left",
    region: "fingers",
    side: "left",
    title: "Left fingers",
    shape: FRONT_LEFT_FINGERS,
  },
  {
    id: "front-fingers-right",
    region: "fingers",
    side: "right",
    title: "Right fingers",
    shape: FRONT_RIGHT_FINGERS,
  },
  {
    id: "front-chest",
    region: "chest",
    title: "Chest",
    shape: path(
      "M 80 154 C 92 144 108 138 130 138 C 152 138 168 144 180 154 C 188 170 190 188 188 214 C 170 228 150 236 130 238 C 110 236 90 228 72 214 C 70 188 72 170 80 154 Z",
    ),
  },
  {
    id: "front-abdomen",
    region: "abdomen",
    title: "Abdomen",
    shape: path(
      "M 72 214 C 90 228 110 236 130 238 C 150 236 170 228 188 214 L 188 340 C 170 352 150 360 130 362 C 110 360 90 352 72 340 Z",
    ),
  },
  {
    id: "front-hip-left",
    region: "hip",
    side: "left",
    title: "Left hip",
    shape: path(
      "M 72 330 C 84 338 96 344 110 346 L 114 388 C 98 386 84 378 72 366 Z",
    ),
  },
  {
    id: "front-hip-right",
    region: "hip",
    side: "right",
    title: "Right hip",
    shape: path(
      "M 188 330 C 176 338 164 344 150 346 L 146 388 C 162 386 176 378 188 366 Z",
    ),
  },
  {
    id: "front-thigh-left",
    region: "thigh",
    side: "left",
    title: "Left thigh",
    shape: path(
      "M 114 356 C 102 392 96 430 96 470 C 96 500 100 524 108 544 L 126 544 C 128 520 130 494 130 466 C 130 424 128 388 124 356 Z",
    ),
  },
  {
    id: "front-thigh-right",
    region: "thigh",
    side: "right",
    title: "Right thigh",
    shape: path(
      "M 146 356 C 158 392 164 430 164 470 C 164 500 160 524 152 544 L 134 544 C 132 520 130 494 130 466 C 130 424 132 388 136 356 Z",
    ),
  },
  {
    id: "front-knee-left",
    region: "knee",
    side: "left",
    title: "Left knee",
    shape: ellipse(116, 556, 18, 18),
  },
  {
    id: "front-knee-right",
    region: "knee",
    side: "right",
    title: "Right knee",
    shape: ellipse(144, 556, 18, 18),
  },
  {
    id: "front-shin-calf-left",
    region: "shin_calf",
    side: "left",
    title: "Left shin / calf",
    shape: path(
      "M 108 572 C 102 598 98 626 98 652 C 98 664 100 676 104 686 L 124 686 C 126 672 128 656 128 634 C 128 612 126 592 122 572 Z",
    ),
  },
  {
    id: "front-shin-calf-right",
    region: "shin_calf",
    side: "right",
    title: "Right shin / calf",
    shape: path(
      "M 152 572 C 158 598 162 626 162 652 C 162 664 160 676 156 686 L 136 686 C 134 672 132 656 132 634 C 132 612 134 592 138 572 Z",
    ),
  },
  {
    id: "front-ankle-foot-left",
    region: "ankle_foot",
    side: "left",
    title: "Left ankle / foot",
    shape: path(
      "M 104 686 C 98 694 94 702 94 708 C 94 714 100 716 110 716 L 126 716 L 126 686 Z",
    ),
  },
  {
    id: "front-ankle-foot-right",
    region: "ankle_foot",
    side: "right",
    title: "Right ankle / foot",
    shape: path(
      "M 156 686 C 162 694 166 702 166 708 C 166 714 160 716 150 716 L 134 716 L 134 686 Z",
    ),
  },
  {
    id: "front-toes-left",
    region: "toes",
    side: "left",
    title: "Left toes",
    shape: FRONT_LEFT_TOES,
  },
  {
    id: "front-toes-right",
    region: "toes",
    side: "right",
    title: "Right toes",
    shape: FRONT_RIGHT_TOES,
  },
];

const FRONT_OUTLINE = outlineFromRegions(FRONT_REGIONS, [
  path("M 114 140 C 120 146 126 148 130 148 C 134 148 140 146 146 140"),
  path("M 96 178 C 106 188 118 194 130 196 C 142 194 154 188 164 178"),
  ellipse(130, 286, 2, 3),
  path("M 118 344 C 122 352 126 356 130 358 C 134 356 138 352 142 344"),
  path("M 104 552 C 110 560 120 564 130 564"),
  path("M 156 552 C 150 560 140 564 130 564"),
]);

const BACK_REGIONS: BodyRegionSvgDef[] = [
  {
    id: "back-head",
    region: "head",
    title: "Back of head",
    shape: path(
      "M 130 28 C 154 28 168 48 168 78 C 168 100 160 118 146 128 C 142 132 136 136 130 136 C 124 136 118 132 114 128 C 100 118 92 100 92 78 C 92 48 106 28 130 28 Z",
    ),
  },
  {
    id: "back-neck",
    region: "neck",
    title: "Back of neck",
    shape: roundedRect(118, 116, 24, 24, 10),
  },
  {
    id: "back-shoulder-left",
    region: "shoulder",
    side: "left",
    title: "Back left shoulder",
    shape: path(
      "M 114 136 C 98 138 84 146 70 158 C 62 168 60 180 68 194 L 96 198 C 98 178 104 158 114 136 Z",
    ),
  },
  {
    id: "back-shoulder-right",
    region: "shoulder",
    side: "right",
    title: "Back right shoulder",
    shape: path(
      "M 146 136 C 162 138 176 146 190 158 C 198 168 200 180 192 194 L 164 198 C 162 178 156 158 146 136 Z",
    ),
  },
  {
    id: "back-upper-arm-left",
    region: "upper_arm",
    side: "left",
    title: "Back left upper arm",
    shape: path(
      "M 68 182 C 50 202 42 230 42 266 C 42 290 48 312 58 328 L 76 316 C 70 296 68 274 68 248 C 68 222 72 200 80 184 Z",
    ),
  },
  {
    id: "back-upper-arm-right",
    region: "upper_arm",
    side: "right",
    title: "Back right upper arm",
    shape: path(
      "M 192 182 C 210 202 218 230 218 266 C 218 290 212 312 202 328 L 184 316 C 190 296 192 274 192 248 C 192 222 188 200 180 184 Z",
    ),
  },
  {
    id: "back-elbow-left",
    region: "elbow",
    side: "left",
    title: "Back left elbow",
    shape: ellipse(60, 332, 16, 15),
  },
  {
    id: "back-elbow-right",
    region: "elbow",
    side: "right",
    title: "Back right elbow",
    shape: ellipse(200, 332, 16, 15),
  },
  {
    id: "back-forearm-left",
    region: "forearm",
    side: "left",
    title: "Back left forearm",
    shape: path(
      "M 54 344 C 42 366 34 390 32 418 C 32 434 36 448 44 460 L 60 450 C 56 436 56 420 58 402 C 60 382 64 362 70 346 Z",
    ),
  },
  {
    id: "back-forearm-right",
    region: "forearm",
    side: "right",
    title: "Back right forearm",
    shape: path(
      "M 206 344 C 218 366 226 390 228 418 C 228 434 224 448 216 460 L 200 450 C 204 436 204 420 202 402 C 200 382 196 362 190 346 Z",
    ),
  },
  {
    id: "back-wrist-hand-left",
    region: "wrist_hand",
    side: "left",
    title: "Back left wrist / hand",
    shape: path(
      "M 28 454 C 20 464 18 476 20 490 C 22 504 30 512 42 514 C 54 512 62 504 64 492 C 66 478 62 466 52 456 C 44 450 34 450 28 454 Z",
    ),
  },
  {
    id: "back-wrist-hand-right",
    region: "wrist_hand",
    side: "right",
    title: "Back right wrist / hand",
    shape: path(
      "M 232 454 C 240 464 242 476 240 490 C 238 504 230 512 218 514 C 206 512 198 504 196 492 C 194 478 198 466 208 456 C 216 450 226 450 232 454 Z",
    ),
  },
  {
    id: "back-fingers-left",
    region: "fingers",
    side: "left",
    title: "Back left fingers",
    shape: FRONT_LEFT_FINGERS,
  },
  {
    id: "back-fingers-right",
    region: "fingers",
    side: "right",
    title: "Back right fingers",
    shape: FRONT_RIGHT_FINGERS,
  },
  {
    id: "back-upper-back",
    region: "upper_back",
    title: "Upper back",
    shape: path(
      "M 80 154 C 92 144 108 138 130 138 C 152 138 168 144 180 154 C 188 170 190 188 188 220 C 170 234 150 242 130 244 C 110 242 90 234 72 220 C 70 188 72 170 80 154 Z",
    ),
  },
  {
    id: "back-lower-back",
    region: "lower_back",
    title: "Lower back",
    shape: path(
      "M 72 220 C 90 234 110 242 130 244 C 150 242 170 234 188 220 L 188 340 C 170 352 150 360 130 362 C 110 360 90 352 72 340 Z",
    ),
  },
  {
    id: "back-hip-left",
    region: "hip",
    side: "left",
    title: "Back left hip",
    shape: path(
      "M 72 330 C 84 338 96 344 110 346 L 114 388 C 98 386 84 378 72 366 Z",
    ),
  },
  {
    id: "back-hip-right",
    region: "hip",
    side: "right",
    title: "Back right hip",
    shape: path(
      "M 188 330 C 176 338 164 344 150 346 L 146 388 C 162 386 176 378 188 366 Z",
    ),
  },
  {
    id: "back-thigh-left",
    region: "thigh",
    side: "left",
    title: "Back left thigh",
    shape: path(
      "M 114 356 C 102 392 96 430 96 470 C 96 500 100 524 108 544 L 126 544 C 128 520 130 494 130 466 C 130 424 128 388 124 356 Z",
    ),
  },
  {
    id: "back-thigh-right",
    region: "thigh",
    side: "right",
    title: "Back right thigh",
    shape: path(
      "M 146 356 C 158 392 164 430 164 470 C 164 500 160 524 152 544 L 134 544 C 132 520 130 494 130 466 C 130 424 132 388 136 356 Z",
    ),
  },
  {
    id: "back-knee-left",
    region: "knee",
    side: "left",
    title: "Back left knee",
    shape: ellipse(116, 556, 18, 18),
  },
  {
    id: "back-knee-right",
    region: "knee",
    side: "right",
    title: "Back right knee",
    shape: ellipse(144, 556, 18, 18),
  },
  {
    id: "back-shin-calf-left",
    region: "shin_calf",
    side: "left",
    title: "Back left shin / calf",
    shape: path(
      "M 108 572 C 102 598 98 626 98 652 C 98 664 100 676 104 686 L 124 686 C 126 672 128 656 128 634 C 128 612 126 592 122 572 Z",
    ),
  },
  {
    id: "back-shin-calf-right",
    region: "shin_calf",
    side: "right",
    title: "Back right shin / calf",
    shape: path(
      "M 152 572 C 158 598 162 626 162 652 C 162 664 160 676 156 686 L 136 686 C 134 672 132 656 132 634 C 132 612 134 592 138 572 Z",
    ),
  },
  {
    id: "back-ankle-foot-left",
    region: "ankle_foot",
    side: "left",
    title: "Back left ankle / foot",
    shape: path(
      "M 104 686 C 98 694 94 702 94 708 C 94 714 100 716 110 716 L 126 716 L 126 686 Z",
    ),
  },
  {
    id: "back-ankle-foot-right",
    region: "ankle_foot",
    side: "right",
    title: "Back right ankle / foot",
    shape: path(
      "M 156 686 C 162 694 166 702 166 708 C 166 714 160 716 150 716 L 134 716 L 134 686 Z",
    ),
  },
  {
    id: "back-toes-left",
    region: "toes",
    side: "left",
    title: "Back left toes",
    shape: FRONT_LEFT_TOES,
  },
  {
    id: "back-toes-right",
    region: "toes",
    side: "right",
    title: "Back right toes",
    shape: FRONT_RIGHT_TOES,
  },
];

const BACK_OUTLINE = outlineFromRegions(BACK_REGIONS, [
  path("M 130 140 V 360"),
  path("M 98 176 C 108 190 120 198 130 200"),
  path("M 162 176 C 152 190 140 198 130 200"),
  path("M 116 324 C 120 330 124 332 130 332"),
  path("M 144 324 C 140 330 136 332 130 332"),
  path("M 104 552 C 110 562 120 566 130 568"),
  path("M 156 552 C 150 562 140 566 130 568"),
]);

const SIDE_FINGERS: SvgShape[] = [
  roundedRect(220, 460, 18, 4, 2),
  roundedRect(222, 466, 22, 4, 2),
  roundedRect(224, 472, 24, 4, 2),
  roundedRect(222, 478, 18, 4, 2),
];

const SIDE_TOES: SvgShape[] = [
  roundedRect(146, 696, 18, 4, 2),
  roundedRect(150, 702, 22, 4, 2),
  roundedRect(152, 708, 20, 4, 2),
];

const LEFT_SIDE_REGIONS: BodyRegionSvgDef[] = [
  {
    id: "left-side-head",
    region: "head",
    title: "Left side head",
    shape: ellipse(118, 98, 38, 56),
  },
  {
    id: "left-side-neck",
    region: "neck",
    title: "Left side neck",
    shape: path(
      "M 102 148 C 114 142 126 142 138 148 L 142 182 C 128 188 112 188 98 180 Z",
    ),
  },
  {
    id: "left-side-shoulder",
    region: "shoulder",
    title: "Left side shoulder",
    shape: path(
      "M 98 182 C 114 174 132 174 150 182 C 162 190 170 204 174 222 L 140 230 L 102 224 C 96 210 94 194 98 182 Z",
    ),
  },
  {
    id: "left-side-upper-arm",
    region: "upper_arm",
    title: "Left side upper arm",
    shape: path(
      "M 170 194 C 186 208 198 236 204 272 C 206 300 206 326 204 352 L 184 352 C 186 320 184 290 180 258 C 176 228 172 206 170 194 Z",
    ),
  },
  {
    id: "left-side-elbow",
    region: "elbow",
    title: "Left side elbow",
    shape: ellipse(194, 364, 13, 14),
  },
  {
    id: "left-side-forearm",
    region: "forearm",
    title: "Left side forearm",
    shape: path(
      "M 184 352 C 192 380 198 408 200 438 C 202 454 202 470 200 486 L 218 486 C 220 468 220 448 218 424 C 216 394 210 368 204 352 Z",
    ),
  },
  {
    id: "left-side-wrist-hand",
    region: "wrist_hand",
    title: "Left side wrist / hand",
    shape: path(
      "M 200 486 C 198 500 198 512 202 522 C 208 532 218 538 230 538 C 238 534 242 526 242 514 C 242 502 236 492 226 486 Z",
    ),
  },
  {
    id: "left-side-fingers",
    region: "fingers",
    title: "Left side fingers",
    shape: SIDE_FINGERS,
  },
  {
    id: "left-side-chest",
    region: "chest",
    title: "Left side chest",
    shape: path(
      "M 92 204 C 104 196 120 194 138 196 C 154 202 164 214 170 234 C 172 248 172 262 170 278 C 160 286 146 290 126 290 C 110 290 96 284 84 274 L 82 234 C 84 220 88 210 92 204 Z",
    ),
  },
  {
    id: "left-side-abdomen",
    region: "abdomen",
    title: "Left side abdomen",
    shape: path(
      "M 84 274 C 96 284 110 290 126 290 C 146 290 160 286 170 278 L 174 340 C 164 354 148 362 128 364 C 108 364 94 358 84 346 Z",
    ),
  },
  {
    id: "left-side-hip",
    region: "hip",
    title: "Left side hip",
    shape: path(
      "M 84 340 C 96 356 112 364 128 364 C 146 364 160 356 170 344 C 166 366 160 384 150 398 L 90 398 C 84 382 82 362 84 340 Z",
    ),
  },
  {
    id: "left-side-thigh",
    region: "thigh",
    title: "Left side thigh",
    shape: path(
      "M 90 398 C 100 432 106 474 108 520 L 156 520 C 158 490 156 448 150 398 Z",
    ),
  },
  {
    id: "left-side-knee",
    region: "knee",
    title: "Left side knee",
    shape: ellipse(132, 540, 32, 16),
  },
  {
    id: "left-side-shin-calf",
    region: "shin_calf",
    title: "Left side shin / calf",
    shape: path(
      "M 108 554 C 112 584 114 618 114 650 C 114 666 112 682 108 694 L 150 694 C 154 678 156 660 156 642 C 156 616 154 586 148 554 Z",
    ),
  },
  {
    id: "left-side-ankle-foot",
    region: "ankle_foot",
    title: "Left side ankle / foot",
    shape: path(
      "M 108 694 C 102 704 100 712 102 716 C 106 720 122 720 150 718 C 160 716 166 712 170 706 C 164 700 156 696 148 694 Z",
    ),
  },
  {
    id: "left-side-toes",
    region: "toes",
    title: "Left side toes",
    shape: SIDE_TOES,
  },
];

const SIDE_OUTLINE = outlineFromRegions(LEFT_SIDE_REGIONS, [
  path("M 114 228 C 126 240 132 258 134 282"),
  path("M 122 364 C 132 370 142 372 152 368"),
  path("M 116 542 C 128 548 142 550 154 544"),
]);

const SIDE_REGION_CLIP = flattenRegionShapes(LEFT_SIDE_REGIONS);

const RIGHT_SIDE_REGIONS: BodyRegionSvgDef[] = LEFT_SIDE_REGIONS.map((def) => ({
  ...def,
  id: def.id.replace("left-side", "right-side"),
  title: def.title.replace("Left side", "Right side"),
}));

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
    regionClip: SIDE_REGION_CLIP,
  },
  right_side: {
    title: "Right side",
    outline: SIDE_OUTLINE,
    regions: RIGHT_SIDE_REGIONS,
    regionClip: SIDE_REGION_CLIP,
    mirror: true,
  },
};
