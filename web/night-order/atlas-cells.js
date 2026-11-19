// Night Order sprite-atlas cell tables (static source rectangles and sizes).
export const SIGNAGE_ATLAS_CELL = 512;

export const SIGNAGE_ATLAS_CELLS = [
  {
    x: 0,
    y: 0,
    width: SIGNAGE_ATLAS_CELL,
    height: SIGNAGE_ATLAS_CELL,
  },
  ...Array.from(
    { length: 3 },
    (_, column) => ({
      x:
        column *
        SIGNAGE_ATLAS_CELL,
      y: SIGNAGE_ATLAS_CELL,
      width: SIGNAGE_ATLAS_CELL,
      height: SIGNAGE_ATLAS_CELL,
    }),
  ),
];

export const COURSE_ECHO_ART_CELLS = [
  {
    id: "mint_ahead",
    x: 62,
    y: 84,
    width: 372,
    height: 832,
    heightMeters: 1.76,
  },
  {
    id: "amber_behind",
    x: 1094,
    y: 84,
    width: 370,
    height: 832,
    heightMeters: 1.76,
  },
];

export const FOOTING_HAZARD_ART_CELLS = [
  {
    id: "thatch",
    x: 10,
    y: 270,
    width: 648,
    height: 245,
  },
  {
    id: "mud",
    x: 724,
    y: 270,
    width: 645,
    height: 254,
  },
  {
    id: "roots",
    x: 1433,
    y: 263,
    width: 657,
    height: 257,
  },
];

export const FOOTING_HAZARD_ART_CELL_BY_KIND =
  new Map(
    FOOTING_HAZARD_ART_CELLS.map(
      (cell) => [cell.id, cell],
    ),
  );

export const COURSE_BOUNDARY_KIT_CELLS = [
  {
    id: "reflective_stake",
    x: 50,
    y: 50,
    width: 430,
    height: 900,
    heightMeters: 1.12,
  },
  {
    id: "course_limit_placard",
    x: 750,
    y: 390,
    width: 750,
    height: 580,
    heightMeters: 1.2,
  },
];

export const COURSE_BOUNDARY_PLACARD_WIDTH =
  180;

export const COURSE_BOUNDARY_PLACARD_HEIGHT =
  COURSE_BOUNDARY_PLACARD_WIDTH *
  COURSE_BOUNDARY_KIT_CELLS[1]
    .height /
  COURSE_BOUNDARY_KIT_CELLS[1]
    .width;

export const EXPANDED_OBSTACLE_CELLS = [
  { x: 50, y: 55, width: 520, height: 410, heightMeters: 3.2 },
  { x: 610, y: 65, width: 480, height: 410, heightMeters: 1.55 },
  { x: 1110, y: 45, width: 530, height: 420, heightMeters: 1.35 },
  { x: 50, y: 565, width: 520, height: 325, heightMeters: 1.25 },
  { x: 620, y: 495, width: 480, height: 380, heightMeters: 3.15 },
  { x: 1180, y: 465, width: 285, height: 415, heightMeters: 5 },
];

export const DEAD_GREEN_SCENERY_CELLS = [
  { x: 45, y: 50, width: 570, height: 410, heightMeters: 1.65 },
  { x: 650, y: 25, width: 390, height: 450, heightMeters: 2.45 },
  { x: 1110, y: 90, width: 430, height: 390, heightMeters: 0.95 },
  { x: 100, y: 485, width: 460, height: 425, heightMeters: 2.6 },
  { x: 635, y: 520, width: 430, height: 390, heightMeters: 1.65 },
  { x: 1050, y: 570, width: 520, height: 350, heightMeters: 1 },
];

export const INTERACTABLE_PROP_CELLS = [
  {
    x: 34,
    y: 107,
    width: 566,
    height: 475,
    heightMeters: 0.38,
  },
  {
    x: 643,
    y: 33,
    width: 578,
    height: 594,
    heightMeters: 0.72,
  },
  {
    x: 55,
    y: 641,
    width: 493,
    height: 569,
    heightMeters: 0.82,
  },
  {
    x: 635,
    y: 627,
    width: 585,
    height: 575,
    heightMeters: 0.3,
  },
];

export const COURSE_MECHANIC_CELLS = [
  {
    x: 141,
    y: 31,
    width: 363,
    height: 568,
    heightMeters: 2.4,
  },
  {
    x: 719,
    y: 20,
    width: 401,
    height: 585,
    heightMeters: 2.15,
  },
  {
    x: 110,
    y: 642,
    width: 412,
    height: 548,
    heightMeters: 2.05,
  },
  {
    x: 665,
    y: 644,
    width: 475,
    height: 556,
    heightMeters: 1.55,
  },
];

export const NIGHT_ORDER_OBJECTIVE_CELLS = [
  {
    id: "audit_bell",
    x: 62,
    y: 65,
    width: 466,
    height: 752,
    heightMeters: 2.35,
  },
  {
    id: "field_log",
    x: 636,
    y: 101,
    width: 486,
    height: 716,
    heightMeters: 2.25,
  },
  {
    id: "release_review",
    x: 1227,
    y: 55,
    width: 495,
    height: 762,
    heightMeters: 2.35,
  },
];

export const TURF_EVIDENCE_CELLS = [
  { x: 7, y: 167, width: 431, height: 249 },
  { x: 437, y: 185, width: 442, height: 229 },
  { x: 859, y: 187, width: 442, height: 224 },
  { x: 1311, y: 164, width: 330, height: 254 },
  { x: 85, y: 477, width: 269, height: 335 },
  { x: 500, y: 482, width: 279, height: 334 },
  { x: 917, y: 476, width: 288, height: 347 },
  { x: 1293, y: 507, width: 308, height: 287 },
];

export const COURSE_CLUTTER_CELLS = [
  {
    x: 39,
    y: 96,
    width: 456,
    height: 366,
    heightMeters: 0.72,
  },
  {
    x: 523,
    y: 119,
    width: 467,
    height: 348,
    heightMeters: 0.58,
  },
  {
    x: 1031,
    y: 122,
    width: 484,
    height: 346,
    heightMeters: 0.34,
  },
  {
    x: 39,
    y: 535,
    width: 455,
    height: 383,
    heightMeters: 0.42,
  },
  {
    x: 538,
    y: 563,
    width: 451,
    height: 356,
    heightMeters: 0.28,
  },
  {
    x: 1029,
    y: 561,
    width: 465,
    height: 357,
    heightMeters: 0.3,
  },
];

export const COURSE_VERGE_CELLS = [
  {
    x: 0,
    y: 0,
    width: 418,
    height: 627,
    heightMeters: 1.02,
  },
  {
    x: 418,
    y: 0,
    width: 418,
    height: 627,
    heightMeters: 1.34,
  },
  {
    x: 836,
    y: 0,
    width: 418,
    height: 627,
    heightMeters: 1.08,
  },
  {
    x: 0,
    y: 627,
    width: 418,
    height: 627,
    heightMeters: 1.04,
  },
  {
    x: 418,
    y: 627,
    width: 418,
    height: 627,
    heightMeters: 0.98,
  },
  {
    x: 836,
    y: 627,
    width: 418,
    height: 627,
    heightMeters: 1.02,
  },
];
