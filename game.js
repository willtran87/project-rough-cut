"use strict";

(() => {
  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d", { alpha: false });
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const CUT_START = 1.15;
  const CUT_END = 4.65;
  const LINE_START = 5.25;
  const LINE_END = 6.95;
  const MENU_TIME = 8.15;
  const MENU_ITEMS = [
    "BEGIN THE ROUND",
    "HOW TO PLAY / SETTINGS",
    "FILE A CLAIM",
    "REPLAY INCIDENT",
    "CLOCK OUT",
  ];
  const MENU_DESCRIPTIONS = [
    "Enter Hole 1: The Pilot.",
    "Tune audio, subtitles, and camera motion.",
    "Report an incident in the rough.",
    "Rewatch the opening incident.",
    "End the shift. The course remembers.",
  ];
  const MENU_ITEM_START_Y = 294;
  const PAUSE_ITEMS = [
    "RESUME ROUND",
    "HOW TO PLAY / SETTINGS",
    "RESTART HOLE",
    "RETURN TO CLUBHOUSE",
  ];
  const PAUSE_DESCRIPTIONS = [
    "Continue from the exact point the audit stopped.",
    "Review the assignment and adjust presentation.",
    "Reset Hole 1 and begin again from the tee.",
    "Abandon this attempt and return to the main menu.",
  ];
  const SETTINGS_STORAGE_KEY = "rough-cut.settings.v1";
  const CAREER_STORAGE_KEY = "rough-cut.career.v1";
  const SETTINGS_ROWS = [
    { id: "master", label: "MASTER MIX", key: "volume", type: "slider" },
    { id: "ambience", label: "COURSE AMBIENCE", key: "ambienceVolume", type: "slider" },
    { id: "mower", label: "JOE'S MOWER", key: "mowerVolume", type: "slider" },
    { id: "effects", label: "GAMEPLAY EFFECTS", key: "effectsVolume", type: "slider" },
    { id: "danger", label: "DANGER PULSE", key: "dangerVolume", type: "slider" },
    { id: "subtitles", label: "SUBTITLES", key: "subtitles", type: "toggle" },
    { id: "reduced_motion", label: "REDUCED CAMERA MOTION", key: "reducedMotion", type: "toggle" },
  ];
  const TOUCH_CONTROLS = {
    move: { x: 116, y: 594, radius: 78 },
    interact: { x: 1008, y: 568, radius: 38 },
    aim: { x: 1106, y: 606, radius: 54 },
    focus: { x: 1201, y: 548, radius: 32 },
    crouch: { x: 1008, y: 653, radius: 31 },
    sprint: { x: 1201, y: 650, radius: 36 },
    pause: { x: 1160, y: 449, width: 88, height: 34 },
  };
  let preferencesStorageAvailable = true;
  let careerStorageAvailable = true;

  const art = new Image();
  art.src = "./assets/rough-cut-opening.png";
  const grassArt = new Image();
  grassArt.src = "./assets/rough-cut-grass-curtain.png";
  const holeArt = new Image();
  holeArt.src = "./assets/rough-cut-hole-1-clean-plate-v1.png";
  const joeMowerArt = new Image();
  joeMowerArt.src = "./assets/joe-mower-v1.png";
  const joeMowerAnimatedArt = new Image();
  joeMowerAnimatedArt.src = "./assets/joe-mower-animated-v1.png";
  const joeMowerErraticHeadArt = new Image();
  joeMowerErraticHeadArt.src = "./assets/joe-mower-erratic-head-v1.png";
  const fieldKitArt = new Image();
  fieldKitArt.src = "./assets/rough-cut-field-kit-v1.png";
  const courseObstacleArt = new Image();
  courseObstacleArt.src = "./assets/rough-cut-course-obstacle-kit-v1.png";
  const expandedCourseArt = new Image();
  expandedCourseArt.src = "./assets/rough-cut-expanded-course-kit-v1.png";
  const foregroundFringeArt = new Image();
  foregroundFringeArt.src = "./assets/rough-cut-foreground-fringe-v1.png";
  const defeatArt = new Image();
  defeatArt.src = "./assets/rough-cut-joe-capture-v1.png";
  const drainArt = new Image();
  drainArt.src = "./assets/rough-cut-drain-culvert-v1.png";
  const grassBuffer = document.createElement("canvas");
  grassBuffer.width = WIDTH;
  grassBuffer.height = HEIGHT;
  const grassCtx = grassBuffer.getContext("2d");
  const COURSE_CAMERA = {
    horizonY: 282,
    nearPlane: 8,
    focalPixels: 1800,
    cameraHeightMeters: 1.65,
    worldUnitMeters: 0.12,
    referencePixelsPerMeter: 50,
  };
  const JOE_SOURCE = { x: 265, y: 70, width: 478, height: 1420, heightMeters: 1.95 };
  const JOE_ANIMATION_FRAME_SIZE = 192;
  const JOE_ANIMATIONS = {
    patrol: {
      art: joeMowerAnimatedArt,
      fps: 3.4,
      sequence: [0, 0, 3, 3, 5, 5, 9, 9],
      name: "measured_mow",
    },
    investigate: {
      art: joeMowerErraticHeadArt,
      fps: 5.2,
      sequence: [0, 3, 3, 8, 8, 9, 4, 4, 5, 0],
      name: "evidence_check",
    },
    search: {
      art: joeMowerErraticHeadArt,
      fps: 6.4,
      sequence: [0, 1, 1, 7, 7, 9, 2, 3, 8, 8, 5, 0],
      name: "erratic_search",
    },
    chase: {
      art: joeMowerErraticHeadArt,
      fps: 10.5,
      sequence: [0, 1, 2, 4, 5, 6, 7, 8, 9, 3],
      name: "scope_escalation",
    },
  };
  const DRAIN_SOURCE = { x: 145, y: 150, width: 1384, height: 700, heightMeters: 2.35 };
  const COURSE_LENGTH = 360;
  const COURSE_MIN_Y = 0;
  const COURSE_MAX_X = 112;
  const PLAYER_COLLISION_RADIUS = 2.4;
  const BALL_MIN_RANGE = 56;
  const BALL_MAX_RANGE = 96;
  const BALL_CHARGE_SECONDS = 0.8;
  const BALL_MAX_AIM_ANGLE = 1.12;
  const BALL_RECOVERY_RADIUS = 8;
  const OVERTIME_SCORE_MULTIPLIER = 1.3;
  const OVERTIME_JOE_SPEED_MULTIPLIER = 1.16;
  const OVERTIME_DETECTION_MULTIPLIER = 1.22;
  const CHANGE_REQUEST_BONUS = 650;
  const BUNKER_TRAP_BONUS = 175;
  const MOWED_MARK_SPACING = 5.2;
  const PLAYER_TRACK_SPACING = 5.6;
  const MAX_MOWED_MARKS = 150;
  const MAX_PLAYER_TRACKS = 72;
  const SPRINKLER_SOAK_SECONDS = 24;
  const WET_MOWER_SPEED_MULTIPLIER = 0.68;
  const SAND_PLAYER_SPEED_MULTIPLIER = 0.72;
  const SAND_MOWER_SPEED_MULTIPLIER = 0.76;
  const KEY_POINT = { x: -48, y: 249, radius: 16 };
  const SPRINKLER_POINT = { x: -103, y: 42, radius: 18 };
  const SHED_EXIT = { x: 24, y: 350, radius: 13 };
  const DRAIN_EXIT = { x: -76, y: 339, radius: 15 };
  const SPRINKLER_SOAK_ZONES = [
    { id: "west-tee", name: "WEST TEE", x: -82, y: 61, radius: 28 },
    { id: "east-relief", name: "EAST RELIEF", x: 78, y: 181, radius: 27 },
    { id: "pond-fringe", name: "POND FRINGE", x: 4, y: 226, radius: 30 },
    { id: "final-approach", name: "FINAL APPROACH", x: -77, y: 323, radius: 28 },
  ];
  const BUNKER_SAND_ZONES = [
    {
      id: "west-tee-bunker",
      name: "WEST TEE BUNKER",
      x: -85,
      y: 64,
      radiusX: 34,
      radiusY: 21,
      rakeAngle: -0.18,
    },
    {
      id: "bunker-wall-sand",
      name: "LOWER BUNKER",
      x: -18,
      y: 274,
      radiusX: 38,
      radiusY: 25,
      rakeAngle: 0.12,
    },
    {
      id: "east-cart-bunker",
      name: "CART BUNKER",
      x: 78,
      y: 293,
      radiusX: 46,
      radiusY: 34,
      rakeAngle: -0.08,
    },
  ];
  const COURSE_ZONES = [
    {
      id: "tee",
      name: "THE TEE",
      subtitle: "QUIET EXPOSURE",
      start: 0,
      end: 88,
      fairwayHalfWidth: 67,
      tint: "18,39,21",
      cue: "The fairway is open. The mower is somewhere ahead.",
    },
    {
      id: "audit_row",
      name: "AUDIT ROW",
      subtitle: "HEDGE CORRIDOR",
      start: 88,
      end: 178,
      fairwayHalfWidth: 55,
      tint: "27,42,19",
      cue: "AUDIT ROW — clipped hedges create hard sight breaks.",
    },
    {
      id: "water_hazard",
      name: "WATER HAZARD",
      subtitle: "LIGHT AND REEDS",
      start: 178,
      end: 276,
      fairwayHalfWidth: 60,
      tint: "11,37,38",
      cue: "WATER HAZARD — reeds hide movement; the floodlight exposes it.",
    },
    {
      id: "dead_green",
      name: "THE DEAD GREEN",
      subtitle: "FINAL APPROACH",
      start: 276,
      end: COURSE_LENGTH + 1,
      fairwayHalfWidth: 62,
      tint: "44,24,14",
      cue: "THE DEAD GREEN — choose an exit before Joe closes the course.",
    },
  ];
  const COURSE_OBSTACLE_CELLS = [
    { x: 36, y: 134, width: 521, height: 326, heightMeters: 2.15 },
    { x: 557, y: 303, width: 531, height: 152, heightMeters: 1.05 },
    { x: 1137, y: 36, width: 466, height: 424, heightMeters: 5.25 },
    { x: 77, y: 550, width: 420, height: 310, heightMeters: 1.35 },
    { x: 662, y: 551, width: 453, height: 307, heightMeters: 1.75 },
    { x: 1115, y: 563, width: 476, height: 290, heightMeters: 1.55 },
  ];
  const EXPANDED_OBSTACLE_CELLS = [
    { x: 50, y: 55, width: 520, height: 410, heightMeters: 3.2 },
    { x: 610, y: 65, width: 480, height: 410, heightMeters: 1.55 },
    { x: 1110, y: 45, width: 530, height: 420, heightMeters: 1.35 },
    { x: 50, y: 565, width: 520, height: 325, heightMeters: 1.25 },
    { x: 620, y: 495, width: 480, height: 380, heightMeters: 3.15 },
    { x: 1180, y: 465, width: 285, height: 415, heightMeters: 5 },
  ];
  const COURSE_OBSTACLES = [
    { id: "start-hedge", kit: "base", type: 0, x: -42, y: 28, radius: 15, coverRadius: 23, scale: 1, blocks: true, sight: true, landmark: "clipped hedge" },
    { id: "start-boundary", kit: "base", type: 1, x: 75, y: 22, radius: 18, coverRadius: 22, scale: 1, blocks: true, sight: false, landmark: "stone boundary" },
    { id: "service-cart", kit: "base", type: 3, x: 28, y: 43, radius: 13, coverRadius: 21, scale: 1, blocks: true, sight: true, landmark: "service cart" },
    { id: "east-pine", kit: "base", type: 2, x: 86, y: 49, radius: 18, coverRadius: 27, scale: 1, blocks: true, sight: true, landmark: "pine" },
    { id: "bunker-rake", kit: "base", type: 5, x: -85, y: 64, radius: 16, coverRadius: 22, scale: 1, blocks: true, sight: true, landmark: "bunker lip" },
    { id: "course-sign", kit: "base", type: 4, x: -32, y: 68, radius: 9, coverRadius: 14, scale: 1, blocks: true, sight: false, landmark: "course sign" },
    { id: "mid-boundary", kit: "base", type: 1, x: 55, y: 72, radius: 17, coverRadius: 21, scale: 0.94, blocks: true, sight: false, landmark: "stone boundary" },
    { id: "north-hedge", kit: "base", type: 0, x: 86, y: 84, radius: 17, coverRadius: 25, scale: 0.92, blocks: true, sight: true, landmark: "hedge" },
    { id: "north-pine", kit: "base", type: 2, x: -94, y: 90, radius: 19, coverRadius: 28, scale: 0.9, blocks: true, sight: true, landmark: "pine" },
    { id: "audit-arch", kit: "expanded", type: 0, x: 0, y: 116, radius: 0, scale: 1.05, blocks: false, sight: false, landmark: "hedge tunnel" },
    { id: "audit-arch-left", x: -35, y: 116, radius: 15, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "hedge tunnel" },
    { id: "audit-arch-right", x: 35, y: 116, radius: 15, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "hedge tunnel" },
    { id: "audit-cart", kit: "expanded", type: 1, x: -58, y: 145, radius: 18, coverRadius: 27, scale: 1.08, blocks: true, sight: true, landmark: "overturned cart" },
    { id: "audit-board", kit: "expanded", type: 4, x: 72, y: 174, radius: 11, coverRadius: 19, scale: 0.94, blocks: true, sight: true, landmark: "audit board" },
    { id: "audit-hedge", kit: "base", type: 0, x: -94, y: 174, radius: 18, coverRadius: 27, scale: 1.02, blocks: true, sight: true, landmark: "clipped hedge" },
    { id: "pond-west", kit: "expanded", type: 2, x: -63, y: 215, radius: 22, coverRadius: 29, scale: 1.18, blocks: true, sight: true, landmark: "black-water reeds" },
    { id: "water-pine", kit: "base", type: 2, x: 91, y: 207, radius: 19, coverRadius: 28, scale: 0.92, blocks: true, sight: true, landmark: "pine" },
    { id: "floodlight", kit: "expanded", type: 5, x: 18, y: 242, radius: 6, coverRadius: 11, lightRadius: 57, scale: 1.04, blocks: true, sight: false, landmark: "maintenance floodlight" },
    { id: "pond-east", kit: "expanded", type: 2, x: 70, y: 260, radius: 22, coverRadius: 29, scale: 1.08, blocks: true, sight: true, landmark: "pond edge" },
    { id: "bunker-wall", kit: "expanded", type: 3, x: -18, y: 274, radius: 19, coverRadius: 27, scale: 1.12, blocks: true, sight: true, landmark: "bunker wall" },
    { id: "final-cart", kit: "expanded", type: 1, x: 78, y: 293, radius: 18, coverRadius: 27, scale: 0.98, blocks: true, sight: true, landmark: "overturned cart" },
    { id: "final-arch", kit: "expanded", type: 0, x: 0, y: 310, radius: 0, scale: 1.02, blocks: false, sight: false, landmark: "final hedge tunnel" },
    { id: "final-arch-left", x: -35, y: 310, radius: 15, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "final hedge tunnel" },
    { id: "final-arch-right", x: 35, y: 310, radius: 15, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "final hedge tunnel" },
    { id: "final-board", kit: "expanded", type: 4, x: -77, y: 317, radius: 11, coverRadius: 19, scale: 0.88, blocks: true, sight: true, landmark: "audit board" },
    { id: "dead-green-pine", kit: "base", type: 2, x: 94, y: 334, radius: 20, coverRadius: 29, scale: 1.03, blocks: true, sight: true, landmark: "dead pine" },
    { id: "shed-boundary", kit: "base", type: 1, x: 62, y: 349, radius: 15, coverRadius: 20, scale: 0.88, blocks: true, sight: false, landmark: "shed wall" },
  ];
  const JOE_NAVIGATION_CLEARANCE = 2.2;
  const JOE_NAVIGATION_GRID = 6;
  const JOE_NAVIGATION_REPATH_SECONDS = 0.42;
  const JOE_PATROL_ROUTE = [
    { x: 44, y: 185 },
    { x: 45, y: 215 },
    { x: 0, y: 230 },
    { x: 0, y: 250 },
    { x: -110, y: 250 },
    { x: -110, y: 340 },
    { x: -35, y: 345 },
    { x: 20, y: 345 },
    { x: -35, y: 345 },
    { x: -110, y: 340 },
    { x: -110, y: 250 },
    { x: -110, y: 195 },
    { x: -35, y: 195 },
  ];
  const RUN_VARIANTS = [
    {
      id: "standard_review",
      number: 1,
      name: "STANDARD REVIEW",
      shortName: "STANDARD",
      key: KEY_POINT,
      sprinkler: SPRINKLER_POINT,
      changeRequest: {
        id: "cr-017",
        code: "CR-017",
        x: -104,
        y: 236,
        radius: 10,
        hint:
          "WEST OF POND // INSIDE JOE'S CUT LINE",
      },
      keyHint: "FIND KEY WEST OF WATER",
      joeStart: {
        x: 44,
        y: 185,
        patrolIndex: 0,
        hold: 2.4,
      },
      briefing:
        "KEY WEST OF WATER  •  VALVE AT WEST TEE  •  BOTH EXITS ACTIVE",
      accent: "#91ad62",
    },
    {
      id: "eastern_exception",
      number: 2,
      name: "EASTERN EXCEPTION",
      shortName: "EAST SHIFT",
      key: { x: 46, y: 221, radius: 16 },
      sprinkler: { x: 70, y: 138, radius: 18 },
      changeRequest: {
        id: "cr-042",
        code: "CR-042",
        x: 103,
        y: 171,
        radius: 10,
        hint:
          "EAST OF AUDIT BOARD // OPEN SIGHTLINE",
      },
      keyHint: "FIND KEY BY FLOODLIGHT",
      joeStart: {
        x: -90,
        y: 250,
        patrolIndex: 4,
        hold: 1.8,
      },
      briefing:
        "KEY BY FLOODLIGHT  •  VALVE EAST OF AUDIT ROW  •  JOE STARTS WEST",
      accent: "#d59a4f",
    },
    {
      id: "closing_shift",
      number: 3,
      name: "CLOSING SHIFT",
      shortName: "CLOSING",
      key: { x: -4, y: 188, radius: 16 },
      sprinkler: { x: 105, y: 235, radius: 18 },
      changeRequest: {
        id: "cr-099",
        code: "CR-099",
        x: -103,
        y: 296,
        radius: 10,
        hint:
          "WEST DEAD GREEN // EXIT PATROL",
      },
      keyHint: "FIND KEY IN AUDIT ROW",
      joeStart: {
        x: 20,
        y: 345,
        patrolIndex: 7,
        hold: 1.25,
      },
      briefing:
        "KEY IN AUDIT ROW  •  VALVE AT EAST WATER EDGE  •  JOE GUARDS EXITS",
      accent: "#77b9aa",
    },
  ];

  function runVariantForRound(roundsStarted) {
    return RUN_VARIANTS[
      Math.max(0, roundsStarted) %
        RUN_VARIANTS.length
    ];
  }

  function activeRunVariant() {
    return (
      RUN_VARIANTS[state.hole?.variantIndex || 0] ||
      RUN_VARIANTS[0]
    );
  }

  function activeKeyPoint() {
    return activeRunVariant().key;
  }

  function activeSprinklerPoint() {
    return activeRunVariant().sprinkler;
  }

  function activeChangeRequest() {
    return activeRunVariant()
      .changeRequest;
  }

  function golfBallCapacity() {
    return state.hole?.overtime ? 2 : 4;
  }

  function golfBallDangerState(ball) {
    const hole = state.hole;
    const joeDistance = worldDistance(
      hole.joe,
      ball,
    );
    const activeLure =
      Boolean(hole.distraction) &&
      hole.distractionTimer > 0 &&
      worldDistance(
        hole.distraction,
        ball,
      ) < 2;
    return {
      activeLure,
      joeDistance,
      dangerous:
        activeLure ||
        joeDistance < 32,
    };
  }

  function nearestRecoverableBall(point = state.player) {
    const balls =
      state.hole?.recoverableBalls || [];
    let nearest = null;
    let distance = Infinity;
    for (
      let index = 0;
      index < balls.length;
      index += 1
    ) {
      const candidateDistance =
        worldDistance(point, balls[index]);
      if (candidateDistance < distance) {
        nearest = balls[index];
        distance = candidateDistance;
      }
    }
    return {
      ball: nearest,
      distance:
        nearest ? distance : null,
    };
  }

  function freshBallAimState() {
    return {
      active: false,
      source: null,
      angle: 0,
      holdSeconds: 0,
      power: 0,
      target: null,
    };
  }

  function readSavedPreferences() {
    try {
      const parsed = JSON.parse(
        window.localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}",
      );
      return {
        volume:
          Number.isFinite(parsed.volume)
            ? Math.max(0, Math.min(1, parsed.volume))
            : 0.72,
        ambienceVolume:
          Number.isFinite(parsed.ambienceVolume)
            ? Math.max(0, Math.min(1, parsed.ambienceVolume))
            : 0.9,
        mowerVolume:
          Number.isFinite(parsed.mowerVolume)
            ? Math.max(0, Math.min(1, parsed.mowerVolume))
            : 1,
        effectsVolume:
          Number.isFinite(parsed.effectsVolume)
            ? Math.max(0, Math.min(1, parsed.effectsVolume))
            : 1,
        dangerVolume:
          Number.isFinite(parsed.dangerVolume)
            ? Math.max(0, Math.min(1, parsed.dangerVolume))
            : 0.9,
        subtitles:
          typeof parsed.subtitles === "boolean"
            ? parsed.subtitles
            : true,
        reducedMotion:
          typeof parsed.reducedMotion === "boolean"
            ? parsed.reducedMotion
            : false,
      };
    } catch {
      preferencesStorageAvailable = false;
      return {
        volume: 0.72,
        ambienceVolume: 0.9,
        mowerVolume: 1,
        effectsVolume: 1,
        dangerVolume: 0.9,
        subtitles: true,
        reducedMotion: false,
      };
    }
  }

  function validCareerRecord(record) {
    if (
      !record ||
      !Number.isFinite(record.score) ||
      !Number.isFinite(record.timeSeconds) ||
      typeof record.grade !== "string"
    ) {
      return null;
    }
    return {
      score: Math.max(0, Math.round(record.score)),
      timeSeconds: Math.max(0, record.timeSeconds),
      grade: record.grade.slice(0, 1),
      route: record.route === "drain" ? "drain" : "shed",
    };
  }

  function readSavedCareer() {
    try {
      const parsed = JSON.parse(
        window.localStorage.getItem(CAREER_STORAGE_KEY) ||
          "{}",
      );
      return {
        roundsStarted: Number.isFinite(parsed.roundsStarted)
          ? Math.max(0, Math.round(parsed.roundsStarted))
          : 0,
        escapes: Number.isFinite(parsed.escapes)
          ? Math.max(0, Math.round(parsed.escapes))
          : 0,
        captures: Number.isFinite(parsed.captures)
          ? Math.max(0, Math.round(parsed.captures))
          : 0,
        completedVariants: Array.isArray(
          parsed.completedVariants,
        )
          ? [
              ...new Set(
                parsed.completedVariants.filter((id) =>
                  RUN_VARIANTS.some(
                    (variant) => variant.id === id,
                  ),
                ),
              ),
            ]
          : [],
        filedChangeRequests: Array.isArray(
          parsed.filedChangeRequests,
        )
          ? [
              ...new Set(
                parsed.filedChangeRequests.filter(
                  (id) =>
                    RUN_VARIANTS.some(
                      (variant) =>
                        variant.id === id,
                    ),
                ),
              ),
            ]
          : [],
        overtimeEnabled:
          parsed.overtimeEnabled === true,
        overtimeEscapes: Number.isFinite(
          parsed.overtimeEscapes,
        )
          ? Math.max(
              0,
              Math.round(parsed.overtimeEscapes),
            )
          : 0,
        overtimeCaptures: Number.isFinite(
          parsed.overtimeCaptures,
        )
          ? Math.max(
              0,
              Math.round(parsed.overtimeCaptures),
            )
          : 0,
        overtimeBest:
          validCareerRecord(parsed.overtimeBest),
        routes: {
          shed: validCareerRecord(parsed.routes?.shed),
          drain: validCareerRecord(parsed.routes?.drain),
        },
      };
    } catch {
      careerStorageAvailable = false;
      return {
        roundsStarted: 0,
        escapes: 0,
        captures: 0,
        completedVariants: [],
        filedChangeRequests: [],
        overtimeEnabled: false,
        overtimeEscapes: 0,
        overtimeCaptures: 0,
        overtimeBest: null,
        routes: { shed: null, drain: null },
      };
    }
  }

  const savedPreferences = readSavedPreferences();
  const savedCareer = readSavedCareer();

  const state = {
    mode: "gate",
    time: 0,
    menuIndex: 0,
    pauseIndex: 0,
    stingerPlayed: false,
    subtitles: savedPreferences.subtitles,
    reducedMotion: savedPreferences.reducedMotion,
    volume: savedPreferences.volume,
    ambienceVolume: savedPreferences.ambienceVolume,
    mowerVolume: savedPreferences.mowerVolume,
    effectsVolume: savedPreferences.effectsVolume,
    dangerVolume: savedPreferences.dangerVolume,
    inputMethod: "keyboard",
    settingsIndex: 0,
    settingsReturnMode: "menu",
    career: savedCareer,
    overtimeSelected:
      savedCareer.overtimeEnabled &&
      savedCareer.completedVariants.length ===
        RUN_VARIANTS.length,
    status: "Every blade is in scope.",
    manualTime: false,
    transitionAlpha: 0,
    shedReached: false,
    keys: new Set(),
    gamepad: {
      connected: false,
      id: "",
      inputX: 0,
      inputY: 0,
      crouch: false,
      sprint: false,
      focus: false,
      previousButtons: [],
      previousDirections: { up: false, down: false, left: false, right: false },
    },
    touch: {
      seen: false,
      movePointerId: null,
      moveX: 0,
      moveY: 0,
      aimPointerId: null,
      aimStartX: 0,
      aimSteer: 0,
      sprintPointerId: null,
      crouchPointerId: null,
      focusPointerId: null,
    },
    player: { x: 0, y: 0, heading: 0 },
    hole: {
      variantIndex: 0,
      variantId: RUN_VARIANTS[0].id,
      overtime: false,
      phase: "find_key",
      keyCollected: false,
      changeRequestCollected: false,
      golfBalls: 4,
      recoverableBalls: [],
      nextRecoverableBallId: 1,
      ballsRecovered: 0,
      noise: 0,
      joe: {
        x: 44,
        y: 185,
        mode: "patrol",
        alert: 0,
        patrolIndex: 0,
        patrolPause: 2.4,
        routeObstacle: null,
        routeSide: 1,
        steeringAngle: 0,
        stuckTimer: 0,
        rerouteCount: 0,
        routePath: [],
        routeTarget: null,
        repathTimer: 0,
        minimumObstacleClearance: 99,
        lastCutPoint: { x: 44, y: 185 },
        wet: false,
        sand: false,
      },
      distraction: null,
      distractionTimer: 0,
      sprinklerUsed: false,
      sprinklerSoakTimer: 0,
      wetTrapCount: 0,
      wetTrapSeconds: 0,
      wetTrackCount: 0,
      sandTrapCount: 0,
      sandTrapSeconds: 0,
      sandTrackCount: 0,
      sandSeconds: 0,
      sandZoneEntries: 0,
      activeSandZoneId: null,
      drainUnlocked: false,
      escapeRoute: null,
      crouched: false,
      concealment: 0,
      lostSightTimer: 0,
      searchTimer: 0,
      lastSeenPlayer: null,
      lineBlockedBy: null,
      hasLineOfSight: false,
      ballThrowsUsed: 0,
      ballAim: freshBallAimState(),
      ballFlight: null,
      prompt: "",
      message: "Find the shed key — or open the drain.",
      messageTimer: 4,
      elapsed: 0,
      tutorialVisible: true,
      tutorialPage: 0,
      hasMoved: false,
      moveVector: { x: 0, y: 0 },
      moveHintTimer: 0,
      controlHintTimer: 12,
      travelDistance: 0,
      blockedTimer: 0,
      blockedObstacle: null,
      blockedDirection: null,
      previousJoeMode: "patrol",
      stateBanner: "",
      stateBannerTimer: 0,
      stateBannerLockTimer: 0,
      detectionPulse: 0,
      heartbeatTimer: 0,
      lastStepDistance: 0,
      lastKnownJoe: null,
      lastKnownJoeTimer: 0,
      worldEffects: [],
      screenParticles: [],
      turfMarks: [],
      nextTurfMarkId: 1,
      lastPlayerTrackDistance: 0,
      tracksCreated: 0,
      tracksDiscovered: 0,
      trackTutorialShown: false,
      trailWarningTimer: 0,
      zoneIndex: 0,
      zoneBannerTimer: 0,
      zoneVisits: [1, 0, 0, 0],
      blackoutTimer: 0,
      dreadTimer: 0,
      focus: false,
      environment: null,
      discoveredY: 0,
      minimumPlayerClearance: 99,
      detection: 0,
      detectionSource: null,
      detectionWarning: false,
      playerAudible: false,
      visibilityRange: 0,
      hearingRange: 0,
      attemptRecorded: false,
      result: null,
      maxDetection: 0,
      pursuitSeconds: 0,
      crouchedSeconds: 0,
      sprintSeconds: 0,
      chaseCount: 0,
      chaseBreaks: 0,
      closeCalls: 0,
      closestJoeDistance: Infinity,
      chaseClosestDistance: Infinity,
    },
  };

  let lastFrame = performance.now();
  let audioContext = null;
  let masterGain = null;
  let ambienceBusGain = null;
  let mowerBusGain = null;
  let effectsBusGain = null;
  let dangerBusGain = null;
  let motorGain = null;
  let motorOscillator = null;
  let cutterOscillator = null;
  let noiseSource = null;
  let noiseGain = null;
  let motorPanNode = null;
  let ambienceSource = null;
  let ambienceGain = null;
  let ambienceFilter = null;
  let ambienceDrone = null;
  let ambienceDroneGain = null;
  let sharedNoiseBuffer = null;

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function lerp(a, b, amount) {
    return a + (b - a) * amount;
  }

  function smoothstep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function savePreferences() {
    try {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          volume: Number(state.volume.toFixed(2)),
          ambienceVolume: Number(state.ambienceVolume.toFixed(2)),
          mowerVolume: Number(state.mowerVolume.toFixed(2)),
          effectsVolume: Number(state.effectsVolume.toFixed(2)),
          dangerVolume: Number(state.dangerVolume.toFixed(2)),
          subtitles: state.subtitles,
          reducedMotion: state.reducedMotion,
        }),
      );
    } catch {
      preferencesStorageAvailable = false;
      // Storage can be unavailable in private or embedded browser contexts.
    }
  }

  function saveCareer() {
    try {
      window.localStorage.setItem(
        CAREER_STORAGE_KEY,
        JSON.stringify(state.career),
      );
    } catch {
      careerStorageAvailable = false;
    }
  }

  function bestCareerRecord() {
    const records = [
      state.career.routes.shed,
      state.career.routes.drain,
    ].filter(Boolean);
    if (records.length === 0) {
      return null;
    }
    records.sort((a, b) =>
      b.score - a.score ||
      a.timeSeconds - b.timeSeconds,
    );
    return records[0];
  }

  function overtimeUnlocked() {
    return (
      state.career.completedVariants.length >=
      RUN_VARIANTS.length
    );
  }

  function toggleOvertimeAudit() {
    if (!overtimeUnlocked()) {
      state.status =
        `Clear all ${RUN_VARIANTS.length} Night Orders to authorize Overtime Audit.`;
      playUiTone(116, 0.08, 0.02);
      return;
    }
    state.overtimeSelected =
      !state.overtimeSelected;
    state.career.overtimeEnabled =
      state.overtimeSelected;
    state.status = state.overtimeSelected
      ? "Overtime Audit armed. Joe has accepted the escalation."
      : "Overtime Audit stood down.";
    saveCareer();
    playUiTone(
      state.overtimeSelected ? 365 : 190,
      0.09,
      0.03,
    );
  }

  function gradeForScore(score) {
    if (score >= 6700) {
      return "S";
    }
    if (score >= 6000) {
      return "A";
    }
    if (score >= 5000) {
      return "B";
    }
    if (score >= 4200) {
      return "C";
    }
    return "D";
  }

  function gradeColor(grade) {
    const colors = {
      S: "#f1cf68",
      A: "#a9d879",
      B: "#72c6b1",
      C: "#df984f",
      D: "#c95b3d",
    };
    return colors[grade] || "#d6dec9";
  }

  function formatRunTime(seconds) {
    const total = Math.max(
      0,
      Math.floor(seconds),
    );
    const minutes = Math.floor(total / 60);
    const remainder = total % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }

  function calculateRunResult(route) {
    const hole = state.hole;
    const variant = activeRunVariant();
    const timeBonus = Math.max(
      0,
      Math.round((210 - hole.elapsed) * 9),
    );
    const exposure =
      hole.maxDetection * 0.68 +
      Math.min(1, hole.pursuitSeconds / 50) * 0.32;
    const stealthBonus = Math.max(
      0,
      Math.round((1 - clamp(exposure, 0, 1)) * 1100),
    );
    const resourceBonus = hole.golfBalls * 180;
    const composureBonus = Math.min(
      400,
      Math.round(hole.crouchedSeconds * 4),
    );
    const recoveryBonus =
      Math.min(3, hole.chaseBreaks) * 150 +
      Math.min(3, hole.closeCalls) * 250;
    const routeBonus = 250;
    const changeRequestBonus =
      hole.changeRequestCollected
        ? CHANGE_REQUEST_BONUS
        : 0;
    const bunkerTrapBonus =
      Math.min(
        2,
        hole.sandTrapCount,
      ) *
      BUNKER_TRAP_BONUS;
    const baseScore =
      3000 +
      timeBonus +
      stealthBonus +
      resourceBonus +
      composureBonus +
      recoveryBonus +
      changeRequestBonus +
      bunkerTrapBonus +
      routeBonus;
    const overtimeBonus = hole.overtime
      ? Math.round(
          baseScore *
            (OVERTIME_SCORE_MULTIPLIER - 1),
        )
      : 0;
    const score =
      baseScore + overtimeBonus;
    const grade = gradeForScore(score);
    const gradeLabels = {
      S: "UNMANAGEABLE EXPOSURE",
      A: "OUT OF SCOPE",
      B: "CONDITIONALLY COVERED",
      C: "MITIGATION REQUIRED",
      D: "HIGH-RISK ASSET",
    };
    return {
      route,
      variantId: variant.id,
      variantName: variant.name,
      variantNumber: variant.number,
      overtime: hole.overtime,
      scoreMultiplier: hole.overtime
        ? OVERTIME_SCORE_MULTIPLIER
        : 1,
      score,
      grade,
      gradeLabel: gradeLabels[grade],
      timeSeconds: hole.elapsed,
      ballsRemaining: hole.golfBalls,
      ballsRecovered: hole.ballsRecovered,
      changeRequestCollected:
        hole.changeRequestCollected,
      sandTrapCount:
        hole.sandTrapCount,
      sandTrapSeconds:
        hole.sandTrapSeconds,
      sandSeconds:
        hole.sandSeconds,
      maxDetection: hole.maxDetection,
      pursuitSeconds: hole.pursuitSeconds,
      chaseCount: hole.chaseCount,
      chaseBreaks: hole.chaseBreaks,
      closeCalls: hole.closeCalls,
      closestJoeDistance: Number.isFinite(
        hole.closestJoeDistance,
      )
        ? hole.closestJoeDistance
        : null,
      cleanRun: hole.chaseCount === 0,
      breakdown: {
        base: 3000,
        time: timeBonus,
        stealth: stealthBonus,
        resources: resourceBonus,
        composure: composureBonus,
        recovery: recoveryBonus,
        changeRequest:
          changeRequestBonus,
        bunker:
          bunkerTrapBonus,
        route: routeBonus,
        overtime: overtimeBonus,
      },
      newBest: false,
      previousBestScore: null,
      masteryUnlocked: false,
      newChangeRequestFiled: false,
    };
  }

  function recordRoundStart() {
    if (state.hole.attemptRecorded) {
      return;
    }
    state.hole.attemptRecorded = true;
    state.career.roundsStarted += 1;
    saveCareer();
  }

  function recordCapture() {
    state.career.captures += 1;
    if (state.hole.overtime) {
      state.career.overtimeCaptures += 1;
    }
    saveCareer();
  }

  function recordVictory(route) {
    const result = calculateRunResult(route);
    const masteredBefore =
      overtimeUnlocked();
    const previous = result.overtime
      ? state.career.overtimeBest
      : state.career.routes[route];
    result.previousBestScore = previous?.score || null;
    result.newBest =
      !previous ||
      result.score > previous.score ||
      (result.score === previous.score &&
        result.timeSeconds < previous.timeSeconds);
    state.career.escapes += 1;
    if (result.overtime) {
      state.career.overtimeEscapes += 1;
    } else if (
      !state.career.completedVariants.includes(
        result.variantId,
      )
    ) {
      state.career.completedVariants.push(
        result.variantId,
      );
    }
    result.masteryUnlocked =
      !masteredBefore &&
      overtimeUnlocked();
    result.newChangeRequestFiled =
      result.changeRequestCollected &&
      !state.career.filedChangeRequests.includes(
        result.variantId,
      );
    if (result.newChangeRequestFiled) {
      state.career.filedChangeRequests.push(
        result.variantId,
      );
    }
    if (
      result.newBest &&
      result.overtime
    ) {
      state.career.overtimeBest = {
        route,
        score: result.score,
        grade: result.grade,
        timeSeconds: result.timeSeconds,
      };
    } else if (result.newBest) {
      state.career.routes[route] = {
        route,
        score: result.score,
        grade: result.grade,
        timeSeconds: result.timeSeconds,
      };
    }
    saveCareer();
    return result;
  }

  function inputCopy(
    keyboardCopy,
    gamepadCopy,
    touchCopy = keyboardCopy,
  ) {
    if (state.inputMethod === "gamepad") {
      return gamepadCopy;
    }
    if (state.inputMethod === "touch") {
      return touchCopy;
    }
    return keyboardCopy;
  }

  function inverseLerp(a, b, value) {
    return clamp((value - a) / (b - a), 0, 1);
  }

  function hash(value) {
    const raw = Math.sin(value * 12.9898) * 43758.5453;
    return raw - Math.floor(raw);
  }

  function windowEnvelope(value, start, end, fade) {
    if (value < start || value > end) {
      return 0;
    }
    return Math.min(
      clamp((value - start) / fade, 0, 1),
      clamp((end - value) / fade, 0, 1),
    );
  }

  function getCoverRect(image) {
    const scale = Math.max(WIDTH / image.width, HEIGHT / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    return {
      x: (WIDTH - width) * 0.5,
      y: (HEIGHT - height) * 0.5,
      width,
      height,
      scale,
    };
  }

  function drawImageCover(target, image, panX = 0, panY = 0, zoom = 1) {
    if (!image.complete || image.naturalWidth === 0) {
      return false;
    }
    const baseScale = Math.max(WIDTH / image.width, HEIGHT / image.height);
    const width = image.width * baseScale * zoom;
    const height = image.height * baseScale * zoom;
    target.drawImage(
      image,
      (WIDTH - width) * 0.5 + panX,
      (HEIGHT - height) * 0.5 + panY,
      width,
      height,
    );
    return true;
  }

  function traceCutPath(target, centerX, centerY, radiusX, radiusY, time) {
    target.beginPath();
    for (let index = 0; index <= 96; index += 1) {
      const angle = index / 96 * Math.PI * 2;
      const jagged =
        1 +
        Math.sin(angle * 13 + time * 0.5) * 0.025 +
        Math.sin(angle * 29) * 0.014 +
        (hash(index * 37) - 0.5) * 0.035;
      const x = centerX + Math.cos(angle) * radiusX * jagged;
      const y = centerY + Math.sin(angle) * radiusY * jagged;
      if (index === 0) {
        target.moveTo(x, y);
      } else {
        target.lineTo(x, y);
      }
    }
    target.closePath();
  }

  function drawMotes(time, count, color = "214,165,74", areaTop = 0) {
    for (let index = 0; index < count; index += 1) {
      const drift = state.reducedMotion ? 0 : Math.sin(time * 0.45 + index * 1.7) * 18;
      const x = (hash(index * 47) * WIDTH + drift + time * (4 + hash(index) * 6)) % WIDTH;
      const y = areaTop + hash(index * 83) * (HEIGHT - areaTop);
      const pulse = 0.16 + (Math.sin(time * 2.2 + index) + 1) * 0.11;
      ctx.fillStyle = `rgba(${color},${pulse})`;
      ctx.fillRect(Math.round(x), Math.round(y), index % 4 === 0 ? 3 : 2, 2);
    }
  }

  function drawScreenTexture() {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#b5d0a8";
    for (let y = 1; y < HEIGHT; y += 4) {
      ctx.fillRect(0, y, WIDTH, 1);
    }
    ctx.restore();

    const vignette = ctx.createRadialGradient(
      WIDTH * 0.5,
      HEIGHT * 0.46,
      HEIGHT * 0.18,
      WIDTH * 0.5,
      HEIGHT * 0.46,
      WIDTH * 0.72,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.7, "rgba(0,0,0,0.08)");
    vignette.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function drawOpeningArt(time, lineProgress, menuMode) {
    if (!art.complete || art.naturalWidth === 0) {
      ctx.fillStyle = "#07150c";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      return;
    }

    const reduced = state.reducedMotion;
    let shake = 0;
    if (!reduced && state.mode === "intro" && time >= CUT_START && time <= CUT_END) {
      shake = 3.5;
    } else if (!reduced && state.mode === "intro" && time >= LINE_START && time <= LINE_END) {
      shake = 1.5;
    }

    const frameShakeX = (hash(Math.floor(time * 60) * 7) - 0.5) * shake * 2;
    const frameShakeY = (hash(Math.floor(time * 60) * 13) - 0.5) * shake * 2;
    const lean = state.mode === "intro" ? Math.sin(lineProgress * Math.PI) : 0;
    const zoom = reduced ? 1 : 1 + lean * 0.045;
    const rotation = reduced ? 0 : Math.sin(time * 9) * 0.006 * lean;
    const cover = getCoverRect(art);

    ctx.save();
    ctx.translate(WIDTH * 0.5 + frameShakeX, HEIGHT * 0.5 + frameShakeY);
    ctx.rotate(rotation);
    ctx.scale(zoom, zoom);
    ctx.translate(-WIDTH * 0.5, -HEIGHT * 0.5);
    ctx.globalAlpha = state.mode === "intro" ? clamp(time / 0.85, 0, 1) : 1;
    ctx.drawImage(art, cover.x, cover.y, cover.width, cover.height);

    const menuTwitch = menuMode && !reduced
      ? Math.pow(Math.max(0, Math.sin(time * 0.71)), 18)
      : 0;
    const headAlpha = state.mode === "intro"
      ? windowEnvelope(time, LINE_START - 0.12, LINE_END + 0.08, 0.16)
      : menuTwitch * 0.82;

    if (headAlpha > 0.001) {
      const source = { x: 650, y: 55, width: 425, height: 435 };
      const dx = cover.x + source.x * cover.scale;
      const dy = cover.y + source.y * cover.scale;
      const dw = source.width * cover.scale;
      const dh = source.height * cover.scale;
      const jolt = state.mode === "intro"
        ? lineProgress > 0.38 && lineProgress < 0.48
          ? -5
          : lineProgress >= 0.48 && lineProgress < 0.58
            ? 6
            : 0
        : Math.sin(time * 19) * 3 * menuTwitch;
      const headY = state.mode === "intro"
        ? Math.cos(time * 13) * 1.5 * lean
        : Math.cos(time * 14) * 2 * menuTwitch;

      ctx.save();
      ctx.globalAlpha = headAlpha;
      ctx.translate(dx + dw * 0.5 + jolt, dy + dh * 0.58 + headY);
      ctx.rotate(Math.sin(time * 17) * 0.018 * (lean || menuTwitch));
      ctx.beginPath();
      ctx.ellipse(0, -dh * 0.08, dw * 0.46, dh * 0.5, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        art,
        source.x,
        source.y,
        source.width,
        source.height,
        -dw * 0.5,
        -dh * 0.58,
        dw,
        dh,
      );
      ctx.restore();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawGrassCurtain(progress, time, sparkStrength) {
    const eased = smoothstep(progress);
    const centerX = WIDTH * 0.515;
    const centerY = HEIGHT * 0.49;
    const radiusX = WIDTH * 0.355 * eased;
    const radiusY = HEIGHT * 0.39 * eased;
    grassCtx.clearRect(0, 0, WIDTH, HEIGHT);
    grassCtx.imageSmoothingEnabled = false;
    const sway = state.reducedMotion ? 0 : Math.sin(time * 0.62) * 4;
    if (!drawImageCover(grassCtx, grassArt, sway, 0, 1.025)) {
      grassCtx.fillStyle = "#102b17";
      grassCtx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    if (eased > 0.001) {
      grassCtx.save();
      grassCtx.globalCompositeOperation = "destination-out";
      traceCutPath(grassCtx, centerX, centerY, radiusX, radiusY, time);
      grassCtx.fillStyle = "#000";
      grassCtx.fill();
      grassCtx.restore();
    }
    ctx.drawImage(grassBuffer, 0, 0);

    if (eased > 0.015) {
      ctx.save();
      traceCutPath(ctx, centerX, centerY, radiusX, radiusY, time);
      ctx.strokeStyle = "rgba(0,7,2,0.9)";
      ctx.lineWidth = 14;
      ctx.stroke();
      traceCutPath(ctx, centerX, centerY, radiusX, radiusY, time);
      ctx.strokeStyle = "rgba(119,132,44,0.78)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      for (let index = 0; index < 48; index += 1) {
        const angle = index / 48 * Math.PI * 2;
        const bladeX = centerX + Math.cos(angle) * radiusX;
        const bladeY = centerY + Math.sin(angle) * radiusY;
        drawCutBlade(
          bladeX,
          bladeY,
          Math.sin(angle) > 0 ? 1 : -1,
          index,
          progress,
          time,
        );
      }
    }

    if (sparkStrength > 0.01) {
      const cutterX = centerX - radiusX * 0.45 + Math.sin(time * 7) * 8;
      const cutterY = centerY + radiusY * 0.88;
      for (let index = 0; index < 26; index += 1) {
        const angle = -Math.PI * 0.9 + hash(index * 53) * Math.PI * 0.8;
        const distance = (12 + hash(index * 71) * 54) * sparkStrength;
        const startX = cutterX + hash(index * 11) * 12;
        const startY = cutterY + hash(index * 19) * 7;
        ctx.strokeStyle = `rgba(255,${Math.floor(64 + hash(index) * 90)},10,${sparkStrength})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + Math.cos(angle) * distance, startY + Math.sin(angle) * distance);
        ctx.stroke();
      }
    }

  }

  function drawCutBlade(x, y, direction, index, progress, time) {
    if (progress < 0.02 || index % 2 !== 0) {
      return;
    }
    const length = 8 + hash(index * 41) * 20;
    const lean = Math.sin(index * 0.71 + time * 2) * 7;
    ctx.strokeStyle = "rgba(70,104,30,0.92)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + lean, y + direction * length);
    ctx.stroke();
  }

  function drawGate() {
    drawOpeningArt(0, 0, false);
    drawGrassCurtain(0, state.time, 0);
    drawMotes(state.time, 18, "212,156,66", HEIGHT * 0.1);
    ctx.fillStyle = "rgba(2,8,4,0.88)";
    ctx.fillRect(WIDTH * 0.28, HEIGHT * 0.34, WIDTH * 0.44, HEIGHT * 0.3);
    const pulse = 0.72 + (Math.sin(state.time * 2.4) + 1) * 0.14;
    strokeRect(WIDTH * 0.28, HEIGHT * 0.34, WIDTH * 0.44, HEIGHT * 0.3, `rgba(222,113,39,${pulse})`, 3);
    drawText("ROUGH CUT", WIDTH * 0.5, HEIGHT * 0.44, 64, "#eef0d7", "center", true);
    drawText(
      inputCopy(
        "CLICK / ENTER TO BEGIN INCIDENT",
        "PRESS A TO BEGIN INCIDENT",
        "TAP TO BEGIN INCIDENT",
      ),
      WIDTH * 0.5,
      HEIGHT * 0.54,
      22,
      "#e7974e",
      "center",
    );
    drawText(
      inputCopy(
        "AUDIO ENABLED • F FULLSCREEN",
        "CONTROLLER CONNECTED • AUDIO ENABLED",
        "TOUCH CONTROLS READY • AUDIO ENABLED",
      ),
      WIDTH * 0.5,
      HEIGHT * 0.59,
      14,
      "#9daa8f",
      "center",
    );
    drawText("NIGHT SHIFT BUILD 01", WIDTH - 28, 32, 12, "#70816b", "right");
  }

  function drawIntro() {
    const cut = inverseLerp(CUT_START, CUT_END, state.time);
    const lineProgress = inverseLerp(LINE_START, LINE_END, state.time);
    drawOpeningArt(state.time, lineProgress, false);
    drawGrassCurtain(
      cut,
      state.time,
      windowEnvelope(state.time, CUT_START + 0.2, CUT_END, 0.2),
    );
    drawMotes(state.time, 20, "225,125,41", HEIGHT * 0.18);

    const flash = windowEnvelope(state.time, 6.9, 7.45, 0.08) * 0.42;
    if (flash > 0) {
      ctx.fillStyle = `rgba(205,240,155,${flash})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    if (state.subtitles) {
      const subtitle = windowEnvelope(state.time, LINE_START, LINE_END, 0.18);
      if (subtitle > 0) {
        ctx.globalAlpha = subtitle;
        drawText("HERE'S JOEY!", WIDTH * 0.5, HEIGHT * 0.85, 42, "#ffedb9", "center", true);
        ctx.globalAlpha = 1;
      }
    }

    drawText(
      inputCopy(
        "SPACE / CLICK TO SKIP",
        "A / B TO SKIP",
        "TAP TO SKIP",
      ),
      WIDTH - 32,
      HEIGHT - 25,
      15,
      "#b7c0aa",
      "right",
    );
  }

  function drawMenu() {
    drawOpeningArt(state.time, 0, true);
    drawGrassCurtain(1, state.time, 0);
    ctx.fillStyle = "rgba(1,8,4,0.25)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawMotes(state.time, 24, "211,152,58", HEIGHT * 0.15);

    const panel = { x: 62, y: 40, width: 450, height: 640 };
    ctx.fillStyle = "rgba(4,15,8,0.9)";
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    strokeRect(panel.x, panel.y, panel.width, panel.height, "#617c3c", 2);
    drawText("A JOE MOWER HORROR GAME", 92, 84, 17, "#b4c489", "left");
    drawText("ROUGH CUT", 90, 166, 65, "#f0f0d4", "left", true);
    drawText("THE COURSE CLOSES AT DUSK.", 92, 215, 18, "#ea8740", "left");
    drawText("JOE DOES NOT.", 92, 240, 18, "#ea8740", "left");
    const careerBest = bestCareerRecord();
    const nextVariant = runVariantForRound(
      state.career.roundsStarted,
    );
    ctx.fillStyle = "rgba(9,25,13,0.88)";
    ctx.fillRect(88, 252, 390, 34);
    drawText(
      careerBest
        ? `COURSE RECORD  ${careerBest.grade}  //  ${careerBest.score.toLocaleString()}  //  ${careerBest.route.toUpperCase()}`
        : "COURSE RECORD  —  UNFILED",
      100,
      270,
      12,
      careerBest
        ? gradeColor(careerBest.grade)
        : "#71806d",
      "left",
      Boolean(careerBest),
    );
    drawText(
      `NEXT ORDER  ${String(nextVariant.number).padStart(2, "0")}  //  ${nextVariant.name}`,
      100,
      284,
      11,
      nextVariant.accent,
      "left",
      true,
    );

    MENU_ITEMS.forEach((label, index) => {
      const y = MENU_ITEM_START_Y + index * 61;
      const selected = state.menuIndex === index;
      const selectionPulse = 0.86 + (Math.sin(state.time * 4.5) + 1) * 0.07;
      ctx.fillStyle = selected ? `rgba(48,66,22,${selectionPulse})` : "rgba(10,27,14,0.88)";
      ctx.fillRect(88, y, 390, 48);
      strokeRect(88, y, 390, 48, selected ? "#e66f22" : "#31472a", selected ? 3 : 1);
      if (selected) {
        ctx.fillStyle = "#e66f22";
        polygon([[98, y + 17], [108, y + 24], [98, y + 31]]);
      }
      drawText(label, 108, y + 31, 19, selected ? "#ffc16d" : "#dce5ca", "left");
    });

    const overtimeAvailable =
      overtimeUnlocked();
    const overtimePanel = {
      x: 558,
      y: 510,
      width: 650,
      height: 126,
    };
    const overtimeActive =
      overtimeAvailable &&
      state.overtimeSelected;
    ctx.fillStyle = overtimeActive
      ? "rgba(39,12,7,0.93)"
      : "rgba(3,13,8,0.88)";
    ctx.fillRect(
      overtimePanel.x,
      overtimePanel.y,
      overtimePanel.width,
      overtimePanel.height,
    );
    strokeRect(
      overtimePanel.x,
      overtimePanel.y,
      overtimePanel.width,
      overtimePanel.height,
      overtimeActive
        ? "#df6c2f"
        : overtimeAvailable
          ? "#8b7844"
          : "#394637",
      overtimeActive ? 3 : 2,
    );
    drawText(
      overtimeAvailable
        ? "OVERTIME AUDIT"
        : "OVERTIME AUDIT // LOCKED",
      overtimePanel.x + 24,
      overtimePanel.y + 31,
      18,
      overtimeActive
        ? "#ffb467"
        : overtimeAvailable
          ? "#dcc47b"
          : "#738071",
      "left",
      true,
    );
    drawText(
      overtimeAvailable
        ? inputCopy(
            `R — ${overtimeActive ? "STAND DOWN" : "AUTHORIZE"}`,
            `RB — ${overtimeActive ? "STAND DOWN" : "AUTHORIZE"}`,
            `TAP CARD — ${overtimeActive ? "STAND DOWN" : "AUTHORIZE"}`,
          )
        : `${state.career.completedVariants.length}/${RUN_VARIANTS.length} NIGHT ORDERS CLEARED`,
      overtimePanel.x + overtimePanel.width - 24,
      overtimePanel.y + 31,
      12,
      overtimeActive ? "#ffcb89" : "#9eaa91",
      "right",
      overtimeAvailable,
    );
    drawText(
      overtimeAvailable
        ? "2 BALLS  •  FASTER JOE  •  STRONGER EVIDENCE  •  SCORE ×1.30"
        : "MASTER EVERY ORDER TO UNLOCK JOE'S AFTER-HOURS CONTRACT.",
      overtimePanel.x + 24,
      overtimePanel.y + 65,
      13,
      overtimeActive ? "#e79355" : "#98a391",
      "left",
      overtimeActive,
    );
    const changeRequestProgress =
      `CHANGES ${state.career.filedChangeRequests.length}/${RUN_VARIANTS.length}`;
    drawText(
      `${
        state.career.overtimeBest
          ? `OVERTIME RECORD  ${state.career.overtimeBest.grade}  //  ${state.career.overtimeBest.score.toLocaleString()}  //  ${state.career.overtimeBest.route.toUpperCase()}`
          : overtimeAvailable
            ? "OVERTIME RECORD  —  UNFILED"
            : "CLEARANCE REQUIRED // ALL ORDERS"
      }  •  ${changeRequestProgress}`,
      overtimePanel.x + 24,
      overtimePanel.y + 99,
      12,
      state.career.overtimeBest
        ? gradeColor(
            state.career.overtimeBest.grade,
          )
        : "#70806d",
      "left",
      Boolean(state.career.overtimeBest),
    );

    if (state.status.startsWith("COVERAGE DENIED:")) {
      drawText("COVERAGE DENIED:", 91, 622, 13, "#db8041", "left");
      drawText("unauthorized presence in the rough.", 91, 643, 12, "#a7b29e", "left");
    } else {
      drawText(MENU_DESCRIPTIONS[state.menuIndex], 91, 621, 13, "#d0d8bf", "left");
      drawText(
        state.career.roundsStarted > 0
          ? `FILE: ${state.career.roundsStarted} ROUND${state.career.roundsStarted === 1 ? "" : "S"}  •  ${state.career.escapes} ESCAPED  •  ${state.career.captures} DENIED`
          : state.status,
        91,
        644,
        12,
        "#84927d",
        "left",
      );
    }
    drawText(
      inputCopy(
        overtimeAvailable
          ? "↑↓ SELECT  •  ENTER CONFIRM  •  R OVERTIME  •  F FULLSCREEN"
          : "↑↓ SELECT  •  ENTER CONFIRM  •  F FULLSCREEN",
        overtimeAvailable
          ? "D-PAD SELECT  •  A CONFIRM  •  RB OVERTIME"
          : "D-PAD SELECT  •  A CONFIRM",
        overtimeAvailable
          ? "TAP MENU ITEM  •  TAP OVERTIME CARD"
          : "TAP A MENU ITEM",
      ),
      WIDTH - 32,
      HEIGHT - 25,
      14,
      "#aab5a0",
      "right",
    );
  }

  function settingsRowGeometry(index) {
    return {
      y: 230 + index * 43,
      height: 39,
    };
  }

  function drawSettings() {
    if (state.settingsReturnMode === "paused") {
      drawFirstHole();
    } else {
      drawMenu();
    }
    ctx.fillStyle = "rgba(0,0,0,0.74)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const panel = { x: 150, y: 82, width: 980, height: 556 };
    ctx.fillStyle = "rgba(5,16,9,0.98)";
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    strokeRect(panel.x, panel.y, panel.width, panel.height, "#dc6c25", 3);
    drawText("HOW TO SURVIVE", WIDTH * 0.5, 133, 34, "#eee8c9", "center", true);
    drawText("ACCEPTANCE CRITERIA // NIGHT SHIFT", WIDTH * 0.5, 163, 13, "#d77b3b", "center");

    const controllerActive = state.inputMethod === "gamepad";
    const touchActive = state.inputMethod === "touch";
    drawText("THE ASSIGNMENT", 205, 213, 15, "#8f9e84", "left", true);
    const steps = [
      {
        y: 260,
        icon: 0,
        title: "1. CHOOSE AN EXIT",
        detail: "Key opens shed. Sprinkler opens drain.",
        subdetail: "Optional change request adds +650 on escape.",
      },
      {
        y: 348,
        icon: 1,
        title: "2. MISDIRECT JOE",
        detail: touchActive
          ? "Hold CHIP + slide, then release."
          : controllerActive
            ? "Hold X + stick L/R, then release."
            : "Hold SPACE + A/D, then release.",
        subdetail: touchActive
          ? "Landed balls stay. USE reclaims them."
          : controllerActive
            ? "Landed balls stay. A reclaims them."
            : "Landed balls stay. ENTER reclaims them.",
      },
      {
        y: 436,
        icon: 2,
        title: "3. BREAK CONTACT",
        detail: touchActive
          ? "Hold CROUCH near cover or in rough."
          : controllerActive
            ? "Hold LB near hard cover or in rough."
            : "Hold C near hard cover or in rough.",
        subdetail:
          "Bunker sand slows both of you, but holds loud tracks.",
      },
    ];
    for (const step of steps) {
      drawFieldIcon(step.icon, 242, step.y, 64);
      drawText(step.title, 292, step.y - 4, 15, "#eee8ce", "left", true);
      drawText(step.detail, 292, step.y + 22, 12, "#9eaa96", "left");
      if (step.subdetail) {
        drawText(
          step.subdetail,
          292,
          step.y + 40,
          11,
          "#d29a5b",
          "left",
        );
      }
    }
    drawText(
      touchActive
        ? "LEFT PAD  MOVE  •  RUN  SPRINT"
        : controllerActive
          ? "LEFT STICK / D-PAD  MOVE"
          : "WASD / ARROWS  MOVE",
      205,
      520,
      14,
      "#d9dfcc",
      "left",
    );
    drawText(
      touchActive
        ? "HOLD CROUCH  •  HOLD LISTEN"
        : controllerActive
          ? "LB CROUCH  •  LT LISTENING FOCUS"
          : "C CROUCH  •  Q LISTENING FOCUS",
      205,
      548,
      14,
      "#9fc98a",
      "left",
    );
    drawText(
      controllerActive
        ? "RT SPRINTS — FAST, LOUD, AND EXPOSED."
        : touchActive
          ? "RUN IS FAST, LOUD, AND EXPOSED."
          : "SHIFT SPRINTS — FAST, LOUD, AND EXPOSED.",
      205,
      587,
      12,
      "#d98946",
      "left",
    );

    ctx.strokeStyle = "#394b31";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(640, 195);
    ctx.lineTo(640, 590);
    ctx.stroke();

    drawText("AUDIO / ACCESSIBILITY", 700, 213, 15, "#8f9e84", "left", true);
    const selectedSetting = settingsRowGeometry(state.settingsIndex);
    ctx.fillStyle = "rgba(50,72,28,0.36)";
    ctx.fillRect(684, selectedSetting.y, 398, selectedSetting.height);
    strokeRect(
      684,
      selectedSetting.y,
      398,
      selectedSetting.height,
      "#d47431",
      2,
    );
    for (let index = 0; index < SETTINGS_ROWS.length; index += 1) {
      const setting = SETTINGS_ROWS[index];
      const row = settingsRowGeometry(index);
      if (setting.type === "slider") {
        const value = state[setting.key];
        const barX = 868;
        const barY = row.y + 14;
        const barWidth = 152;
        drawText(
          setting.label,
          700,
          row.y + 25,
          13,
          index === state.settingsIndex ? "#f2e7bd" : "#c6d0ba",
          "left",
          index === state.settingsIndex,
        );
        ctx.fillStyle = "#172719";
        ctx.fillRect(barX, barY, barWidth, 10);
        ctx.fillStyle =
          setting.id === "danger"
            ? "#bf4937"
            : setting.id === "mower"
              ? "#d17a31"
              : "#879d55";
        ctx.fillRect(barX, barY, barWidth * value, 10);
        strokeRect(barX, barY, barWidth, 10, "#65785a", 1);
        drawText(
          `${Math.round(value * 100)}%`,
          1052,
          row.y + 25,
          12,
          "#dfe5d3",
          "right",
        );
      } else {
        drawCheckbox(
          700,
          row.y + 6,
          setting.label,
          Boolean(state[setting.key]),
        );
      }
    }
    drawText(
      touchActive
        ? "TAP ROWS TO ADJUST"
        : controllerActive
          ? "D-PAD  SELECT / ADJUST"
          : "F  FULLSCREEN",
      700,
      540,
      14,
      "#d9dfcc",
      "left",
    );
    ctx.fillStyle = "rgba(21,41,23,0.8)";
    ctx.fillRect(700, 554, 350, 36);
    strokeRect(700, 554, 350, 36, "#687e4a", 1);
    drawText(
      `←  RETURN TO ${state.settingsReturnMode === "paused" ? "PAUSE" : "MENU"}`,
      875,
      578,
      13,
      "#d9dfcc",
      "center",
      true,
    );
    drawText(
      controllerActive
        ? "LEFT / RIGHT MIX  •  A TOGGLE  •  B RETURN"
        : touchActive
          ? "TAP SLIDERS  •  TAP TOGGLES  •  TAP RETURN"
          : "ARROWS ADJUST  •  ENTER TOGGLE  •  ESC RETURN",
      700,
      612,
      11,
      "#8fa084",
      "left",
    );
  }

  function drawPause() {
    drawFirstHole();
    ctx.fillStyle = "rgba(0,3,2,0.72)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const panel = { x: 330, y: 78, width: 620, height: 564 };
    ctx.fillStyle = "rgba(4,14,8,0.97)";
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    strokeRect(panel.x, panel.y, panel.width, panel.height, "#b9662f", 3);
    strokeRect(panel.x + 12, panel.y + 12, panel.width - 24, panel.height - 24, "#3b5134", 1);

    drawText("ROUND SUSPENDED", WIDTH * 0.5, 135, 34, "#f0e9cc", "center", true);
    drawText(
      `HOLE 1 // ${courseZoneAt(state.player.y).name} // ${Math.round(state.player.y / COURSE_LENGTH * 100)}% COMPLETE`,
      WIDTH * 0.5,
      167,
      12,
      "#bc8d56",
      "center",
      true,
    );
    drawText(
      "Joe is paused. Your position is being held.",
      WIDTH * 0.5,
      204,
      14,
      "#99a891",
      "center",
    );

    for (let index = 0; index < PAUSE_ITEMS.length; index += 1) {
      const y = 238 + index * 68;
      const selected = index === state.pauseIndex;
      ctx.fillStyle = selected
        ? "rgba(118,62,28,0.45)"
        : "rgba(13,28,17,0.72)";
      ctx.fillRect(390, y, 500, 50);
      strokeRect(
        390,
        y,
        500,
        50,
        selected ? "#e8873e" : "#33482f",
        selected ? 2 : 1,
      );
      if (selected) {
        ctx.fillStyle = "#e8873e";
        polygon([
          [410, y + 17],
          [421, y + 25],
          [410, y + 33],
        ]);
      }
      drawText(
        PAUSE_ITEMS[index],
        438,
        y + 33,
        18,
        selected ? "#ffe0ae" : "#c7d0bb",
        "left",
        selected,
      );
    }

    drawText(
      PAUSE_DESCRIPTIONS[state.pauseIndex],
      WIDTH * 0.5,
      545,
      13,
      "#a9b5a1",
      "center",
    );
    drawText(
      inputCopy(
        "↑↓ SELECT  •  ENTER CONFIRM  •  ESC RESUME",
        "D-PAD SELECT  •  A CONFIRM  •  B / START RESUME",
        "TAP A MENU ITEM  •  TAP RESUME TO CONTINUE",
      ),
      WIDTH * 0.5,
      598,
      13,
      "#d5c39c",
      "center",
    );
  }

  function drawCheckbox(x, y, label, checked) {
    ctx.fillStyle = checked ? "#d96a24" : "#152219";
    ctx.fillRect(x, y, 30, 30);
    strokeRect(x, y, 30, 30, "#80906c", 2);
    if (checked) {
      drawText("✓", x + 15, y + 24, 24, "#fff1cc", "center", true);
    }
    drawText(label, x + 46, y + 23, 18, "#dce4cd", "left");
  }

  function drawFieldIcon(index, x, y, size, alpha = 1) {
    if (!fieldKitArt.complete || fieldKitArt.naturalWidth === 0) {
      return;
    }
    const sourceWidth = fieldKitArt.naturalWidth / 3;
    const sourceY = fieldKitArt.naturalHeight * 0.08;
    const sourceHeight = fieldKitArt.naturalHeight * 0.78;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      fieldKitArt,
      sourceWidth * index,
      sourceY,
      sourceWidth,
      sourceHeight,
      x - size * 0.5,
      y - size * 0.5,
      size,
      size,
    );
    ctx.restore();
  }

  function resetFirstHole(variantOverride = null) {
    clearTouchInputs(true);
    const variant =
      variantOverride ||
      runVariantForRound(
        state.career.roundsStarted,
      );
    const variantIndex = RUN_VARIANTS.indexOf(variant);
    const overtime =
      state.overtimeSelected &&
      overtimeUnlocked();
    state.player = { x: 0, y: 0, heading: 0 };
    state.shedReached = false;
    state.status = "Objective: escape through the shed or drainage route.";
    state.hole = {
      variantIndex,
      variantId: variant.id,
      overtime,
      phase: "find_key",
      keyCollected: false,
      changeRequestCollected: false,
      golfBalls: overtime ? 2 : 4,
      recoverableBalls: [],
      nextRecoverableBallId: 1,
      ballsRecovered: 0,
      noise: 0,
      joe: {
        x: variant.joeStart.x,
        y: variant.joeStart.y,
        mode: "patrol",
        alert: 0,
        patrolIndex: variant.joeStart.patrolIndex,
        patrolPause: variant.joeStart.hold,
        routeObstacle: null,
        routeSide: 1,
        steeringAngle: 0,
        stuckTimer: 0,
        rerouteCount: 0,
        routePath: [],
        routeTarget: null,
        repathTimer: 0,
        minimumObstacleClearance: 99,
        lastCutPoint: {
          x: variant.joeStart.x,
          y: variant.joeStart.y,
        },
        wet: false,
        sand: false,
      },
      distraction: null,
      distractionTimer: 0,
      sprinklerUsed: false,
      sprinklerSoakTimer: 0,
      wetTrapCount: 0,
      wetTrapSeconds: 0,
      wetTrackCount: 0,
      sandTrapCount: 0,
      sandTrapSeconds: 0,
      sandTrackCount: 0,
      sandSeconds: 0,
      sandZoneEntries: 0,
      activeSandZoneId: null,
      drainUnlocked: false,
      escapeRoute: null,
      crouched: false,
      concealment: 0,
      lostSightTimer: 0,
      searchTimer: 0,
      lastSeenPlayer: null,
      lineBlockedBy: null,
      hasLineOfSight: false,
      ballThrowsUsed: 0,
      ballAim: freshBallAimState(),
      ballFlight: null,
      prompt: "",
      message: overtime
        ? "OVERTIME AUDIT — two balls, faster Joe, stronger evidence."
        : "Find the shed key — or open the drain.",
      messageTimer: 4,
      elapsed: 0,
      tutorialVisible: true,
      tutorialPage: 0,
      hasMoved: false,
      moveVector: { x: 0, y: 0 },
      moveHintTimer: 0,
      controlHintTimer: 12,
      travelDistance: 0,
      blockedTimer: 0,
      blockedObstacle: null,
      blockedDirection: null,
      previousJoeMode: "patrol",
      stateBanner: "",
      stateBannerTimer: 0,
      stateBannerLockTimer: 0,
      detectionPulse: 0,
      heartbeatTimer: 0,
      lastStepDistance: 0,
      lastKnownJoe: null,
      lastKnownJoeTimer: 0,
      worldEffects: [],
      screenParticles: [],
      turfMarks: [],
      nextTurfMarkId: 1,
      lastPlayerTrackDistance: 0,
      tracksCreated: 0,
      tracksDiscovered: 0,
      trackTutorialShown: false,
      trailWarningTimer: 0,
      zoneIndex: 0,
      zoneBannerTimer: 2.8,
      zoneVisits: [1, 0, 0, 0],
      blackoutTimer: 0,
      dreadTimer: 0,
      focus: false,
      environment: null,
      discoveredY: 0,
      minimumPlayerClearance: 99,
      detection: 0,
      detectionSource: null,
      detectionWarning: false,
      playerAudible: false,
      visibilityRange: 0,
      hearingRange: 0,
      attemptRecorded: false,
      result: null,
      maxDetection: 0,
      pursuitSeconds: 0,
      crouchedSeconds: 0,
      sprintSeconds: 0,
      chaseCount: 0,
      chaseBreaks: 0,
      closeCalls: 0,
      closestJoeDistance: Infinity,
      chaseClosestDistance: Infinity,
    };
  }

  function worldDistance(a, b) {
    return Math.hypot((a.x - b.x) * 0.72, a.y - b.y);
  }

  function playerIsMoving() {
    if (state.hole?.ballAim?.active) {
      return false;
    }
    const input = movementInput();
    return Math.hypot(input.x, input.y) > 0.12;
  }

  function movementInput() {
    const keyboardX =
      (state.keys.has("KeyD") || state.keys.has("ArrowRight") ? 1 : 0) -
      (state.keys.has("KeyA") || state.keys.has("ArrowLeft") ? 1 : 0);
    const keyboardY =
      (state.keys.has("KeyW") || state.keys.has("ArrowUp") ? 1 : 0) -
      (state.keys.has("KeyS") || state.keys.has("ArrowDown") ? 1 : 0);
    return {
      x: clamp(
        keyboardX +
          state.gamepad.inputX +
          state.touch.moveX +
          (
            state.hole?.ballAim?.active &&
            state.hole.ballAim.source === "touch"
              ? state.touch.aimSteer
              : 0
          ),
        -1,
        1,
      ),
      y: clamp(
        keyboardY +
          state.gamepad.inputY +
          state.touch.moveY,
        -1,
        1,
      ),
    };
  }

  function crouchHeld() {
    return (
      state.keys.has("KeyC") ||
      state.gamepad.crouch ||
      state.touch.crouchPointerId !== null
    );
  }

  function sprintHeld() {
    return (
      state.keys.has("ShiftLeft") ||
      state.keys.has("ShiftRight") ||
      state.gamepad.sprint ||
      state.touch.sprintPointerId !== null
    );
  }

  function focusHeld() {
    return (
      state.keys.has("KeyQ") ||
      state.gamepad.focus ||
      state.touch.focusPointerId !== null
    );
  }

  function clearTouchInputs(cancelAim = false) {
    if (
      cancelAim &&
      state.hole?.ballAim?.active &&
      state.hole.ballAim.source === "touch"
    ) {
      cancelGolfBallAim(false);
    }
    state.touch.movePointerId = null;
    state.touch.moveX = 0;
    state.touch.moveY = 0;
    state.touch.aimPointerId = null;
    state.touch.aimStartX = 0;
    state.touch.aimSteer = 0;
    state.touch.sprintPointerId = null;
    state.touch.crouchPointerId = null;
    state.touch.focusPointerId = null;
  }

  function courseZoneAt(y) {
    for (let index = 0; index < COURSE_ZONES.length; index += 1) {
      if (y >= COURSE_ZONES[index].start && y < COURSE_ZONES[index].end) {
        return COURSE_ZONES[index];
      }
    }
    return COURSE_ZONES[COURSE_ZONES.length - 1];
  }

  function playerInRough(point = state.player) {
    return Math.abs(point.x) > courseZoneAt(point.y).fairwayHalfWidth;
  }

  function addTurfMark(kind, x, y, options = {}) {
    const hole = state.hole;
    if (!hole || !hole.turfMarks) {
      return null;
    }
    const mark = {
      id: hole.nextTurfMarkId,
      kind,
      x,
      y,
      age: 0,
      duration: options.duration ?? null,
      heading: options.heading ?? 0,
      strength: options.strength ?? 1,
      radius: options.radius ?? (kind === "mowed" ? 7.2 : 4.2),
      discovered: false,
      wet: Boolean(options.wet),
      sand: Boolean(options.sand),
    };
    hole.nextTurfMarkId += 1;
    hole.turfMarks.push(mark);
    const kindLimit =
      kind === "mowed"
        ? MAX_MOWED_MARKS
        : kind === "track"
          ? MAX_PLAYER_TRACKS
          : 12;
    const matching = hole.turfMarks.filter(
      (candidate) => candidate.kind === kind,
    );
    if (matching.length > kindLimit) {
      const removeCount = matching.length - kindLimit;
      const removedIds = new Set(
        matching
          .slice(0, removeCount)
          .map((candidate) => candidate.id),
      );
      hole.turfMarks = hole.turfMarks.filter(
        (candidate) => !removedIds.has(candidate.id),
      );
    }
    return mark;
  }

  function turfStateAt(point) {
    const marks = state.hole?.turfMarks || [];
    let nearestMowed = null;
    let nearestTrack = null;
    let mowedDistance = Infinity;
    let trackDistance = Infinity;
    for (let index = 0; index < marks.length; index += 1) {
      const mark = marks[index];
      const distance = worldDistance(point, mark);
      if (
        mark.kind === "mowed" &&
        distance < mowedDistance
      ) {
        nearestMowed = mark;
        mowedDistance = distance;
      }
      if (
        mark.kind === "track" &&
        distance < trackDistance
      ) {
        nearestTrack = mark;
        trackDistance = distance;
      }
    }
    return {
      mowed: Boolean(
        nearestMowed &&
          mowedDistance <= nearestMowed.radius,
      ),
      nearestMowed,
      nearestMowedDistance:
        nearestMowed ? mowedDistance : null,
      nearestTrack,
      nearestTrackDistance:
        nearestTrack ? trackDistance : null,
    };
  }

  function wetStateAt(point) {
    if (
      !state.hole ||
      state.hole.sprinklerSoakTimer <= 0
    ) {
      return {
        active: false,
        zone: null,
        distance: null,
        edgeDistance: null,
      };
    }
    let nearestZone = null;
    let nearestDistance = Infinity;
    let nearestEdgeDistance = Infinity;
    for (
      let index = 0;
      index < SPRINKLER_SOAK_ZONES.length;
      index += 1
    ) {
      const zone = SPRINKLER_SOAK_ZONES[index];
      const distance = worldDistance(point, zone);
      const edgeDistance = distance - zone.radius;
      if (edgeDistance < nearestEdgeDistance) {
        nearestZone = zone;
        nearestDistance = distance;
        nearestEdgeDistance = edgeDistance;
      }
    }
    return {
      active: nearestEdgeDistance <= 0,
      zone: nearestZone,
      distance: nearestDistance,
      edgeDistance: nearestEdgeDistance,
    };
  }

  function sandStateAt(point) {
    let nearestZone = null;
    let nearestNormalizedDistance =
      Infinity;
    let nearestEdgeDistance =
      Infinity;
    for (
      let index = 0;
      index < BUNKER_SAND_ZONES.length;
      index += 1
    ) {
      const zone =
        BUNKER_SAND_ZONES[index];
      const normalizedDistance =
        Math.hypot(
          (point.x - zone.x) /
            zone.radiusX,
          (point.y - zone.y) /
            zone.radiusY,
        );
      const edgeDistance =
        (normalizedDistance - 1) *
        Math.min(
          zone.radiusX * 0.72,
          zone.radiusY,
        );
      if (
        edgeDistance <
        nearestEdgeDistance
      ) {
        nearestZone = zone;
        nearestNormalizedDistance =
          normalizedDistance;
        nearestEdgeDistance =
          edgeDistance;
      }
    }
    return {
      active:
        nearestNormalizedDistance <= 1,
      zone: nearestZone,
      normalizedDistance:
        nearestNormalizedDistance,
      edgeDistance:
        nearestEdgeDistance,
    };
  }

  function updateTurfMarks(dt) {
    const hole = state.hole;
    for (let index = 0; index < hole.turfMarks.length; index += 1) {
      hole.turfMarks[index].age += dt;
    }
    hole.turfMarks = hole.turfMarks.filter(
      (mark) =>
        mark.duration === null ||
        mark.age < mark.duration,
    );
  }

  function recordPlayerTrack(sprinting) {
    const hole = state.hole;
    const terrain = turfStateAt(state.player);
    const wet = wetStateAt(state.player);
    const sand =
      sandStateAt(state.player);
    if (
      (
        !playerInRough() &&
        !wet.active &&
        !sand.active
      ) ||
      (
        terrain.mowed &&
        !wet.active &&
        !sand.active
      )
    ) {
      hole.lastPlayerTrackDistance =
        hole.travelDistance;
      return;
    }
    if (
      hole.travelDistance -
        hole.lastPlayerTrackDistance <
      PLAYER_TRACK_SPACING
    ) {
      return;
    }
    const baseStrength = hole.crouched
      ? 0.38
      : sprinting
        ? 1
        : 0.68;
    const strength = clamp(
      baseStrength +
        (hole.overtime ? 0.18 : 0) +
        (wet.active ? 0.2 : 0) +
        (sand.active ? 0.16 : 0),
      0,
      1,
    );
    const durationMultiplier =
      (hole.overtime ? 1.18 : 1) *
      (wet.active ? 1.55 : 1) *
      (sand.active ? 1.35 : 1);
    addTurfMark(
      "track",
      state.player.x,
      state.player.y,
      {
        heading: state.player.heading,
        strength,
        radius: 3.8 + strength * 2.2,
        duration:
          (22 + strength * 18) *
          durationMultiplier,
        wet: wet.active,
        sand: sand.active,
      },
    );
    hole.lastPlayerTrackDistance =
      hole.travelDistance;
    hole.tracksCreated += 1;
    if (wet.active) {
      hole.wetTrackCount += 1;
    }
    if (sand.active) {
      hole.sandTrackCount += 1;
    }
    if (!hole.trackTutorialShown) {
      hole.trackTutorialShown = true;
      setHoleMessage(
        sand.active
          ? "BUNKER SAND HOLDS EVERY STEP — Joe can follow the deep prints."
          : wet.active
          ? "WATER MUFFLES YOUR STEPS — but wet footprints stay bright for Joe."
          : "BENT GRASS HOLDS YOUR TRAIL — crouch to leave fainter evidence.",
        3.2,
      );
    }
  }

  function recordJoeCut() {
    const joe = state.hole.joe;
    if (
      worldDistance(joe, joe.lastCutPoint) <
      MOWED_MARK_SPACING
    ) {
      return;
    }
    addTurfMark(
      "mowed",
      joe.x,
      joe.y,
      {
        heading:
          Math.atan2(
            joe.y - joe.lastCutPoint.y,
            joe.x - joe.lastCutPoint.x,
          ),
        radius: 7.4,
      },
    );
    joe.lastCutPoint = {
      x: joe.x,
      y: joe.y,
    };
  }

  function trailEvidenceNearJoe() {
    const hole = state.hole;
    let evidence = null;
    let nearestDistance = Infinity;
    for (let index = 0; index < hole.turfMarks.length; index += 1) {
      const mark = hole.turfMarks[index];
      if (
        mark.kind !== "track" ||
        mark.discovered ||
        mark.age > mark.duration * 0.92
      ) {
        continue;
      }
      const distance = worldDistance(hole.joe, mark);
      const discoveryRadius =
        14 + mark.strength * 24;
      const evidenceBlocker =
        lineBlockerBetween(hole.joe, mark);
      if (
        distance <= discoveryRadius &&
        (
          !evidenceBlocker ||
          distance <= 24
        ) &&
        distance < nearestDistance
      ) {
        evidence = mark;
        nearestDistance = distance;
      }
    }
    return evidence;
  }

  function nearestObstacleClearance(point) {
    let clearance = Infinity;
    for (let index = 0; index < COURSE_OBSTACLES.length; index += 1) {
      const obstacle = COURSE_OBSTACLES[index];
      if (!obstacle.blocks) {
        continue;
      }
      clearance = Math.min(
        clearance,
        worldDistance(point, obstacle) - obstacle.radius,
      );
    }
    return clearance;
  }

  function floodlightPower() {
    const coursePresentation =
      state.mode === "first_hole" ||
      state.mode === "paused" ||
      (state.mode === "settings" &&
        state.settingsReturnMode === "paused");
    if (
      !coursePresentation ||
      !state.hole ||
      state.hole.blackoutTimer <= 0
    ) {
      return 1;
    }
    if (state.hole.blackoutTimer <= 1.2) {
      return lerp(
        0.22,
        1,
        1 - state.hole.blackoutTimer / 1.2,
      );
    }
    const flicker =
      hash(
        Math.floor(state.hole.elapsed * 13.5) * 17.31,
      );
    return flicker > 0.56 ? 0.08 : 0.52;
  }

  function getPlayerEnvironmentState() {
    const player = state.player;
    const zone = courseZoneAt(player.y);
    const inRough = playerInRough(player);
    const turf = turfStateAt(player);
    const wet = wetStateAt(player);
    const sand = sandStateAt(player);
    const effectiveRough =
      inRough &&
      !turf.mowed &&
      !sand.active;
    let nearestCover = null;
    let nearestCoverDistance = Infinity;
    let nearestLandmark = null;
    let nearestLandmarkDistance = Infinity;
    let lightExposure = 0;

    for (let index = 0; index < COURSE_OBSTACLES.length; index += 1) {
      const obstacle = COURSE_OBSTACLES[index];
      const distance = worldDistance(player, obstacle);
      if (
        obstacle.landmark &&
        obstacle.draw !== false &&
        distance < nearestLandmarkDistance
      ) {
        nearestLandmark = obstacle;
        nearestLandmarkDistance = distance;
      }
      if (
        obstacle.coverRadius &&
        distance <= obstacle.coverRadius &&
        distance >= Math.max(0, obstacle.radius - 1)
      ) {
        const coverDistance = distance - obstacle.radius;
        if (coverDistance < nearestCoverDistance) {
          nearestCover = obstacle;
          nearestCoverDistance = coverDistance;
        }
      }
      if (obstacle.lightRadius && distance < obstacle.lightRadius) {
        lightExposure = Math.max(
          lightExposure,
          (1 - distance / obstacle.lightRadius) *
            floodlightPower(),
        );
      }
    }

    const blocker = lineBlockerBetween(state.hole.joe, player);
    const blockingCover = blocker
      ? COURSE_OBSTACLES.find((obstacle) => obstacle.id === blocker)
      : null;
    const hardCover =
      Boolean(blockingCover && blockingCover.coverRadius) &&
      worldDistance(player, blockingCover) <= blockingCover.coverRadius;
    if (hardCover && blockingCover) {
      nearestCover = blockingCover;
      nearestCoverDistance =
        worldDistance(player, blockingCover) - blockingCover.radius;
    }
    const coverQuality = hardCover
      ? state.hole.crouched
        ? "concealed"
        : "hard cover"
        : nearestCover
          ? "cover nearby"
        : sand.active
          ? "sand / exposed"
        : turf.mowed
            ? "quiet / exposed"
          : effectiveRough
            ? state.hole.crouched
              ? "rough concealment"
              : "rustling rough"
            : "exposed";
    return {
      zone,
      inRough,
      effectiveRough,
      mowed: turf.mowed,
      wet: wet.active,
      wetZone: wet.zone,
      wetZoneDistance: wet.distance,
      wetZoneEdgeDistance: wet.edgeDistance,
      sand: sand.active,
      sandZone: sand.zone,
      sandZoneEdgeDistance:
        sand.edgeDistance,
      nearestTrack: turf.nearestTrack,
      nearestTrackDistance:
        turf.nearestTrackDistance,
      nearestMowedDistance:
        turf.nearestMowedDistance,
      turfLabel: sand.active
        ? wet.active
          ? "SOAKED BUNKER"
          : "BUNKER SAND"
        : wet.active
          ? turf.mowed
            ? "SOAKED CUT"
            : inRough
              ? "SOAKED ROUGH"
              : "SOAKED FAIRWAY"
        : turf.mowed
          ? "MOWED STRIP"
          : inRough
            ? "BENT ROUGH"
            : "FAIRWAY",
      nearestCover,
      nearestCoverDistance,
      nearestLandmark,
      nearestLandmarkDistance,
      blocker,
      hardCover,
      lightExposure,
      coverQuality,
      clearance: nearestObstacleClearance(player),
    };
  }

  function lineBlockerBetween(start, end) {
    const ax = start.x * 0.72;
    const ay = start.y;
    const bx = end.x * 0.72;
    const by = end.y;
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = Math.max(0.001, dx * dx + dy * dy);
    for (let index = 0; index < COURSE_OBSTACLES.length; index += 1) {
      const obstacle = COURSE_OBSTACLES[index];
      if (!obstacle.blocks || !obstacle.sight) {
        continue;
      }
      if (
        worldDistance(start, obstacle) < obstacle.radius * 0.72
      ) {
        continue;
      }
      const ox = obstacle.x * 0.72;
      const oy = obstacle.y;
      const amount = clamp(((ox - ax) * dx + (oy - ay) * dy) / lengthSquared, 0, 1);
      const closestX = ax + dx * amount;
      const closestY = ay + dy * amount;
      if (Math.hypot(ox - closestX, oy - closestY) < obstacle.radius * 0.68) {
        return obstacle.id;
      }
    }
    return null;
  }

  function worldToScreen(x, y) {
    const forwardDistance = y - state.player.y;
    const positiveDistance = Math.max(0, forwardDistance);
    const pixelsPerMeter =
      COURSE_CAMERA.focalPixels /
      (positiveDistance + COURSE_CAMERA.nearPlane);
    const scale = pixelsPerMeter / COURSE_CAMERA.referencePixelsPerMeter;
    return {
      x:
        WIDTH * 0.5 +
        (x - state.player.x) *
          COURSE_CAMERA.worldUnitMeters *
          pixelsPerMeter,
      y:
        COURSE_CAMERA.horizonY +
        COURSE_CAMERA.cameraHeightMeters *
          pixelsPerMeter,
      scale,
      pixelsPerMeter,
      forwardDistance,
      visible: forwardDistance > -5 && forwardDistance < 122,
    };
  }

  function obstacleAtPosition(x, y, radius = PLAYER_COLLISION_RADIUS) {
    for (let index = 0; index < COURSE_OBSTACLES.length; index += 1) {
      const obstacle = COURSE_OBSTACLES[index];
      if (!obstacle.blocks) {
        continue;
      }
      const distance = worldDistance({ x, y }, obstacle);
      if (distance < obstacle.radius + radius) {
        return obstacle;
      }
    }
    return null;
  }

  function visibleObstacleState() {
    const visible = [];
    for (let index = 0; index < COURSE_OBSTACLES.length; index += 1) {
      const obstacle = COURSE_OBSTACLES[index];
      const point = worldToScreen(obstacle.x, obstacle.y);
      if (point.visible && point.x > -120 && point.x < WIDTH + 120) {
        visible.push({
          id: obstacle.id,
          x: obstacle.x,
          y: obstacle.y,
          distance: Math.round(worldDistance(obstacle, state.player)),
          forwardDistance: Math.round(point.forwardDistance),
          projectedScale: Number(point.scale.toFixed(2)),
          pixelsPerMeter: Math.round(point.pixelsPerMeter),
          screenX: Math.round(point.x),
          screenY: Math.round(point.y),
        });
      }
    }
    visible.sort((a, b) => a.distance - b.distance);
    return visible.slice(0, 6);
  }

  function movePlayerBy(deltaX, deltaY) {
    const player = state.player;
    const requestedDistance = Math.hypot(deltaX, deltaY);
    const steps = Math.max(1, Math.ceil(requestedDistance / 1.15));
    const stepX = deltaX / steps;
    const stepY = deltaY / steps;
    let appliedDistance = 0;
    let initialBlocker = null;

    for (let index = 0; index < steps; index += 1) {
      const startX = player.x;
      const startY = player.y;
      const targetX = clamp(player.x + stepX, -COURSE_MAX_X, COURSE_MAX_X);
      const targetY = clamp(player.y + stepY, COURSE_MIN_Y, COURSE_LENGTH);
      const blocker = obstacleAtPosition(targetX, targetY);
      if (!blocker) {
        player.x = targetX;
        player.y = targetY;
      } else {
        if (!initialBlocker) {
          initialBlocker = blocker;
        }
        const horizontalBlocker = obstacleAtPosition(targetX, player.y);
        if (!horizontalBlocker) {
          player.x = targetX;
        }
        const verticalBlocker = obstacleAtPosition(player.x, targetY);
        if (!verticalBlocker) {
          player.y = targetY;
        }
      }
      appliedDistance += Math.hypot(player.x - startX, player.y - startY);
    }

    if (initialBlocker) {
      state.hole.blockedTimer = 0.55;
      state.hole.blockedObstacle = initialBlocker.id;
      state.hole.blockedDirection =
        Math.abs(deltaX) > Math.abs(deltaY)
          ? deltaX > 0
            ? "RIGHT"
            : "LEFT"
          : deltaY > 0
            ? "FORWARD"
            : "BACK";
    }
    state.hole.travelDistance += appliedDistance;
    state.hole.minimumPlayerClearance = Math.min(
      state.hole.minimumPlayerClearance,
      nearestObstacleClearance(player),
    );
  }

  function setHoleMessage(message, duration = 2.6) {
    state.hole.message = message;
    state.hole.messageTimer = duration;
  }

  function addWorldEffect(kind, x, y, duration = 1.4) {
    state.hole.worldEffects.push({
      kind,
      x,
      y,
      age: 0,
      duration,
      seed: hash(state.hole.elapsed * 97 + x * 3 + y),
    });
  }

  function addStepParticles(
    inRough,
    sprinting,
    wet = false,
    sand = false,
  ) {
    const count = sand
      ? sprinting
        ? 14
        : 9
      : wet
      ? sprinting
        ? 13
        : 8
      : sprinting
        ? 9
        : inRough
          ? 6
          : 3;
    for (let index = 0; index < count; index += 1) {
      const seed = hash(state.hole.travelDistance * 13 + index * 41);
      state.hole.screenParticles.push({
        x: WIDTH * 0.5 + (seed - 0.5) * (sprinting ? 120 : 72),
        y: HEIGHT * 0.82 + hash(index * 17 + seed) * 28,
        vx: (hash(index * 29 + seed) - 0.5) * (sprinting ? 74 : 42),
        vy: -(38 + hash(index * 11 + seed) * (sprinting ? 82 : 48)),
        age: 0,
        duration: 0.48 + hash(index * 7 + seed) * 0.34,
        size: sand
          ? 2 + hash(index + seed) * 4
          : wet
          ? 2 + hash(index + seed) * 3
          : inRough
            ? 3 + hash(index + seed) * 4
            : 2 + hash(index + seed) * 2,
        color: sand
          ? index % 4 === 0
            ? "#e1c98c"
            : "#9d7945"
          : wet
          ? index % 3 === 0
            ? "#b8e4d7"
            : "#4e9b98"
          : inRough
            ? "#718348"
            : "#a9a56b",
      });
    }
  }

  function addBallImpactParticles(target) {
    const point = worldToScreen(target.x, target.y);
    if (
      !point.visible ||
      point.x < -100 ||
      point.x > WIDTH + 100
    ) {
      return;
    }
    const impactX = clamp(
      point.x,
      492,
      WIDTH - 326,
    );
    for (let index = 0; index < 18; index += 1) {
      const seed =
        hash(
          state.hole.elapsed * 41 +
            target.x * 13 +
            target.y * 7 +
            index * 29,
        );
      state.hole.screenParticles.push({
        x: impactX + (seed - 0.5) * 18,
        y: point.y - 5,
        vx:
          (hash(seed * 97 + index * 11) - 0.5) *
          92,
        vy:
          -(42 +
            hash(seed * 61 + index * 17) * 88),
        age: 0,
        duration:
          0.48 +
          hash(seed * 37 + index) * 0.42,
        size:
          2 +
          hash(seed * 53 + index * 3) * 3,
        color:
          index % 4 === 0
            ? "#ded0a2"
            : "#84934f",
      });
    }
  }

  function updateCourseEffects(dt) {
    const hole = state.hole;
    for (let index = hole.worldEffects.length - 1; index >= 0; index -= 1) {
      const effect = hole.worldEffects[index];
      effect.age += dt;
      if (effect.age >= effect.duration) {
        hole.worldEffects.splice(index, 1);
      }
    }
    for (let index = hole.screenParticles.length - 1; index >= 0; index -= 1) {
      const particle = hole.screenParticles[index];
      particle.age += dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 118 * dt;
      if (particle.age >= particle.duration) {
        hole.screenParticles.splice(index, 1);
      }
    }
  }

  function announceJoeState(mode) {
    const labels = {
      patrol: "STATUS: ROUTINE WALKTHROUGH",
      investigate: "STATUS: VERIFYING DISTURBANCE",
      search: "STATUS: FOLLOW-UP IN PROGRESS",
      chase: "STATUS: SCOPE ESCALATED",
    };
    if (
      state.hole.stateBannerLockTimer <= 0
    ) {
      state.hole.stateBanner =
        labels[mode] ||
        "STATUS UPDATED";
      state.hole.stateBannerTimer =
        mode === "chase"
          ? 2.3
          : 1.65;
    }
    state.hole.detectionPulse = mode === "chase" ? 1 : 0.58;
    state.hole.lastKnownJoe = { x: state.hole.joe.x, y: state.hole.joe.y };
    state.hole.lastKnownJoeTimer = 5;
    if (mode === "chase") {
      setHoleMessage(
        state.hole.hasLineOfSight
          ? "JOE HAS EYES ON YOU — put solid cover between you."
          : state.hole.playerAudible
            ? "JOE HEARD YOU — stop making noise or change direction."
            : "JOE COMMITTED TO PURSUIT — break contact.",
        2.4,
      );
    }
    playThreatCue(mode);
  }

  function completeHole(route) {
    state.hole.escapeRoute = route;
    state.hole.result = recordVictory(route);
    state.mode = "victory";
    state.time = 0;
    state.transitionAlpha = 0.75;
    state.status = route === "drain" ? "Hole 1 escaped through drainage." : "Hole 1 survived.";
    setMotorLevel(0, 36);
    playVictoryCue();
  }

  function collectChangeRequest(request) {
    const hole = state.hole;
    if (
      hole.changeRequestCollected ||
      !request
    ) {
      return false;
    }
    hole.changeRequestCollected = true;
    hole.noise = Math.max(
      hole.noise,
      0.36,
    );
    hole.joe.alert = Math.max(
      hole.joe.alert,
      0.34,
    );
    hole.detectionPulse = Math.max(
      hole.detectionPulse,
      0.34,
    );
    hole.stateBanner =
      `UNFILED CHANGE SECURED // +${CHANGE_REQUEST_BONUS} IF YOU ESCAPE`;
    hole.stateBannerTimer = 3;
    hole.stateBannerLockTimer = 3;
    setHoleMessage(
      `${request.code} SECURED — Joe heard the paperwork. The bonus files only if you escape.`,
      3.7,
    );
    addWorldEffect(
      "change_request",
      request.x,
      request.y,
      1.9,
    );
    playChangeRequestCue();
    return true;
  }

  function interactWithCourse() {
    if (state.mode !== "first_hole") {
      return;
    }
    const key = activeKeyPoint();
    const sprinkler = activeSprinklerPoint();
    const changeRequest =
      activeChangeRequest();
    const shed = SHED_EXIT;
    const drain = DRAIN_EXIT;
    const nearestBall =
      nearestRecoverableBall();

    if (!state.hole.keyCollected && worldDistance(state.player, key) < key.radius) {
      state.hole.keyCollected = true;
      state.hole.phase = "return_to_shed";
      state.hole.joe.alert = Math.max(state.hole.joe.alert, 0.38);
      setHoleMessage("KEY ACQUIRED — Joe heard that.", 3.2);
      addWorldEffect("pickup", key.x, key.y, 1.7);
      playPickupCue();
      return;
    }

    if (!state.hole.sprinklerUsed && worldDistance(state.player, sprinkler) < sprinkler.radius) {
      state.hole.sprinklerUsed = true;
      state.hole.sprinklerSoakTimer =
        SPRINKLER_SOAK_SECONDS;
      state.hole.drainUnlocked = true;
      if (!state.hole.keyCollected) {
        state.hole.phase = "drain_open";
      }
      state.hole.distraction = { x: 104, y: 178 };
      state.hole.distractionTimer = 5.5;
      state.hole.joe.mode = "investigate";
      announceJoeState("investigate");
      state.hole.lastSeenPlayer = { ...state.hole.distraction };
      state.hole.stateBanner =
        "SPRINKLERS LIVE // QUIET WATER, LASTING TRACKS";
      state.hole.stateBannerTimer = 3.2;
      setHoleMessage(
        "PRESSURE RELEASED — Wet turf muffles steps and bogs Joe, but footprints last.",
        4.2,
      );
      addWorldEffect("sprinkler", sprinkler.x, sprinkler.y, 5.5);
      addWorldEffect("drain_open", drain.x, drain.y, 3.2);
      playSprinklerCue();
      playDrainUnlockCue();
      return;
    }

    if (
      state.hole.keyCollected &&
      worldDistance(state.player, shed) <
        shed.radius
    ) {
      completeHole("shed");
      return;
    }

    if (
      state.hole.drainUnlocked &&
      worldDistance(state.player, drain) <
        drain.radius
    ) {
      completeHole("drain");
      return;
    }

    if (
      !state.hole.changeRequestCollected &&
      worldDistance(
        state.player,
        changeRequest,
      ) < changeRequest.radius
    ) {
      collectChangeRequest(
        changeRequest,
      );
      return;
    }

    if (
      nearestBall.ball &&
      nearestBall.distance <
        BALL_RECOVERY_RADIUS
    ) {
      recoverGolfBall(
        nearestBall.ball,
      );
      return;
    }

    if (
      worldDistance(state.player, shed) <
      shed.radius
    ) {
      setHoleMessage(
        `SHED LOCKED — ${activeRunVariant().keyHint}.`,
        3.2,
      );
      state.hole.phase = "find_key";
      playDoorRattle();
      return;
    }

    if (
      worldDistance(state.player, drain) <
      drain.radius
    ) {
      setHoleMessage(
        "DRAIN SEALED — Release pressure at the sprinkler valve.",
        3.2,
      );
      playDoorRattle();
    }
  }

  function golfBallAimTarget() {
    const aim = state.hole.ballAim;
    const range = lerp(
      BALL_MIN_RANGE,
      BALL_MAX_RANGE,
      aim.power,
    );
    const physicalX = Math.sin(aim.angle);
    const forwardY = Math.cos(aim.angle);
    return {
      x: clamp(
        state.player.x +
          physicalX * range / 0.72,
        -COURSE_MAX_X,
        COURSE_MAX_X,
      ),
      y: clamp(
        state.player.y + forwardY * range,
        8,
        COURSE_LENGTH - 8,
      ),
    };
  }

  function beginGolfBallAim(source) {
    if (
      state.mode !== "first_hole" ||
      state.hole.tutorialVisible ||
      state.hole.ballAim.active
    ) {
      return;
    }
    if (state.hole.ballFlight) {
      setHoleMessage(
        "BALL IN FLIGHT — wait for the impact.",
        1.3,
      );
      return;
    }
    if (state.hole.golfBalls <= 0) {
      setHoleMessage("NO GOLF BALLS LEFT.", 1.8);
      playUiTone(112, 0.08, 0.018);
      return;
    }
    let openingAngle = 0;
    if (state.hole.hasMoved) {
      const headingForward = Math.sin(
        state.player.heading,
      );
      if (headingForward > 0.08) {
        openingAngle = clamp(
          Math.atan2(
            Math.cos(state.player.heading) * 0.72,
            headingForward,
          ),
          -BALL_MAX_AIM_ANGLE,
          BALL_MAX_AIM_ANGLE,
        );
      }
    }
    state.hole.ballAim = {
      active: true,
      source,
      angle: openingAngle,
      holdSeconds: 0,
      power: 0,
      target: null,
    };
    state.hole.ballAim.target = golfBallAimTarget();
    state.hole.messageTimer = 0;
    state.hole.prompt = "";
    playBallReadyCue();
  }

  function cancelGolfBallAim(showMessage = true) {
    if (!state.hole.ballAim.active) {
      return;
    }
    state.hole.ballAim = freshBallAimState();
    if (showMessage) {
      setHoleMessage(
        "SHOT HELD — ball preserved.",
        1.25,
      );
      playUiTone(156, 0.06, 0.016);
    }
  }

  function commitGolfBallAim() {
    const hole = state.hole;
    if (
      state.mode !== "first_hole" ||
      !hole.ballAim.active ||
      hole.golfBalls <= 0
    ) {
      return;
    }
    const target =
      hole.ballAim.target ||
      golfBallAimTarget();
    const distance = worldDistance(
      state.player,
      target,
    );
    const flightDuration =
      0.34 + distance / 220;
    hole.golfBalls -= 1;
    hole.ballThrowsUsed += 1;
    hole.ballFlight = {
      start: {
        x: state.player.x,
        y: state.player.y,
      },
      target: { ...target },
      elapsed: 0,
      duration: flightDuration,
      distance,
      power: hole.ballAim.power,
    };
    const direction = Math.sign(
      target.x - state.player.x,
    );
    hole.ballAim = freshBallAimState();
    hole.prompt = "";
    setHoleMessage(
      "CHIP AWAY — listen for the landing.",
      1.15,
    );
    playBallSwingCue(direction);
  }

  function landGolfBall(target) {
    const hole = state.hole;
    hole.ballFlight = null;
    const landedBall = {
      id: hole.nextRecoverableBallId,
      x: target.x,
      y: target.y,
      landedAt: hole.elapsed,
      throwNumber: hole.ballThrowsUsed,
      wet: wetStateAt(target).active,
    };
    hole.nextRecoverableBallId += 1;
    hole.recoverableBalls.push(
      landedBall,
    );
    addTurfMark(
      "divot",
      target.x,
      target.y,
      {
        heading: state.player.heading,
        radius: 4.8,
        strength: 1,
      },
    );
    hole.distraction = { ...target };
    hole.distractionTimer = Math.max(
      hole.overtime ? 1.65 : 2.25,
      (
        4.2 -
        (hole.ballThrowsUsed - 1) * 0.85
      ) * (hole.overtime ? 0.72 : 1),
    );
    hole.joe.mode = "investigate";
    announceJoeState("investigate");
    hole.noise = Math.max(hole.noise, 0.38);
    setHoleMessage(
      hole.ballThrowsUsed >= 3
        ? "JOE RECOGNIZED THE PATTERN — reclaim the ball only if the lane clears."
        : "BALL LANDED — Joe changed course. The ball can be reclaimed.",
      3.1,
    );
    addWorldEffect(
      "sound",
      target.x,
      target.y,
      hole.distractionTimer,
    );
    addWorldEffect(
      "ball_impact",
      target.x,
      target.y,
      1.1,
    );
    addBallImpactParticles(target);
    playBallCue(
      Math.sign(target.x - state.player.x),
    );
  }

  function recoverGolfBall(ball) {
    const hole = state.hole;
    if (!ball) {
      return false;
    }
    if (
      hole.golfBalls >=
      golfBallCapacity()
    ) {
      setHoleMessage(
        `POCKETS FULL — carrying ${golfBallCapacity()} balls.`,
        1.7,
      );
      playUiTone(112, 0.08, 0.018);
      return false;
    }
    const danger =
      golfBallDangerState(ball);
    hole.recoverableBalls =
      hole.recoverableBalls.filter(
        (candidate) =>
          candidate.id !== ball.id,
      );
    hole.golfBalls += 1;
    hole.ballsRecovered += 1;
    hole.noise = Math.max(
      hole.noise,
      danger.dangerous ? 0.32 : 0.18,
    );
    addWorldEffect(
      "ball_recovered",
      ball.x,
      ball.y,
      1.45,
    );
    if (danger.dangerous) {
      const closeRecovery =
        danger.joeDistance < 32;
      hole.stateBanner = closeRecovery
        ? "BALL RECLAIMED // JOE IS STILL IN THE AREA"
        : "BALL RECLAIMED // JOE REMAINS COMMITTED";
      hole.stateBannerTimer = 2.25;
      setHoleMessage(
        closeRecovery
          ? `BALL RECLAIMED UNDER PRESSURE — Joe is ${Math.round(danger.joeDistance)}m away.`
          : `BALL RECLAIMED DURING INVESTIGATION — ${Math.round(danger.joeDistance)}m buffer.`,
        2.5,
      );
    } else {
      setHoleMessage(
        "BALL RECLAIMED — one distraction restored.",
        2.1,
      );
    }
    playBallRecoveryCue(
      danger.dangerous,
    );
    return true;
  }

  function updateGolfBallTactics(dt, movement) {
    const hole = state.hole;
    if (hole.ballAim.active) {
      hole.ballAim.holdSeconds += dt;
      hole.ballAim.power = clamp(
        hole.ballAim.holdSeconds /
          BALL_CHARGE_SECONDS,
        0,
        1,
      );
      hole.ballAim.angle = clamp(
        hole.ballAim.angle +
          movement.x * 1.72 * dt,
        -BALL_MAX_AIM_ANGLE,
        BALL_MAX_AIM_ANGLE,
      );
      hole.ballAim.target = golfBallAimTarget();
    }
    if (hole.ballFlight) {
      hole.ballFlight.elapsed += dt;
      if (
        hole.ballFlight.elapsed >=
        hole.ballFlight.duration
      ) {
        const target = {
          ...hole.ballFlight.target,
        };
        landGolfBall(target);
      }
    }
  }

  function updateJoe(dt) {
    const hole = state.hole;
    const joe = hole.joe;
    const previousMode = joe.mode;
    let sandTrapTriggered = false;
    const playerDistance = worldDistance(joe, state.player);
    hole.closestJoeDistance = Math.min(
      hole.closestJoeDistance,
      playerDistance,
    );
    const moving = playerIsMoving();
    const environment = getPlayerEnvironmentState();
    const inRough = environment.effectiveRough;
    const blocker = environment.blocker;
    const visibilityRange =
      (hole.crouched && inRough
        ? moving
          ? 17
          : 11
        : inRough
          ? moving
            ? 29
            : 22
          : moving
            ? 43
            : 35) *
      lerp(1, 1.42, environment.lightExposure) *
      lerp(1, 0.62, hole.concealment);
    const visibleNow =
      !blocker &&
      playerDistance < visibilityRange;
    const hearingRange = 18 + hole.noise * 58;
    const audibleNow =
      hole.noise > 0.16 &&
      playerDistance < hearingRange;
    const distractionActive =
      hole.distraction &&
      hole.distractionTimer > 0;
    const trailEvidence =
      !distractionActive &&
      joe.mode !== "chase"
        ? trailEvidenceNearJoe()
        : null;
    if (trailEvidence) {
      trailEvidence.discovered = true;
      hole.tracksDiscovered += 1;
      hole.lastSeenPlayer = {
        x: trailEvidence.x,
        y: trailEvidence.y,
      };
      hole.searchTimer = Math.max(
        hole.searchTimer,
        4.8 + trailEvidence.strength * 2.2,
      );
      joe.mode = "search";
      joe.alert = Math.max(
        joe.alert,
        0.28 + trailEvidence.strength * 0.24,
      );
      hole.detection = Math.max(
        hole.detection,
        0.18 + trailEvidence.strength * 0.2,
      );
      hole.stateBanner =
        "EVIDENCE FOUND // JOE IS BACKTRACKING";
      hole.stateBannerTimer = 2.5;
      hole.trailWarningTimer = 3;
      setHoleMessage(
        "JOE FOUND YOUR BENT-GRASS TRAIL — leave the line or reach cut turf.",
        3,
      );
      addWorldEffect(
        "trail_found",
        trailEvidence.x,
        trailEvidence.y,
        1.8,
      );
      playThreatCue("search");
    }
    const directSound =
      audibleNow &&
      !distractionActive;
    const detectionGain =
      (
        visibleNow
          ? (moving ? 1.9 : 1.18) *
            lerp(
              1,
              1.55,
              environment.lightExposure,
            )
          : directSound
            ? 0.64 + hole.noise * 0.68
            : -(
                environment.hardCover
                  ? 1.55
                  : 0.82
              )
      ) *
      (
        hole.overtime &&
        (visibleNow || directSound)
          ? OVERTIME_DETECTION_MULTIPLIER
          : 1
      );
    hole.detection = clamp(
      hole.detection + detectionGain * dt,
      0,
      1,
    );
    hole.maxDetection = Math.max(
      hole.maxDetection,
      hole.detection,
    );
    hole.detectionSource = visibleNow
      ? "sight"
      : directSound
        ? "sound"
        : trailEvidence ||
            hole.trailWarningTimer > 0
          ? "trail"
          : null;
    hole.playerAudible = directSound;
    hole.visibilityRange = visibilityRange;
    hole.hearingRange = hearingRange;
    const confirmedDetection =
      hole.detection >= 0.55 ||
      playerDistance < 11;
    const canSee =
      visibleNow &&
      (confirmedDetection || joe.mode === "chase");
    const canHear =
      directSound &&
      (confirmedDetection || joe.mode === "chase");
    hole.hasLineOfSight = visibleNow;
    hole.lineBlockedBy = blocker;

    if (
      hole.detection >= 0.2 &&
      !hole.detectionWarning &&
      joe.mode !== "chase"
    ) {
      hole.detectionWarning = true;
      hole.detectionPulse = Math.max(
        hole.detectionPulse,
        0.48,
      );
      setHoleMessage(
        trailEvidence
          ? "JOE FOUND YOUR TRAIL — move off the evidence line."
          : visibleNow
          ? "JOE IS LOOKING — break the sightline before attention locks."
          : "JOE HEARD THAT — stop, crouch, or change direction.",
        2.2,
      );
      playThreatCue("investigate");
    } else if (
      hole.detection < 0.08 &&
      joe.mode !== "chase"
    ) {
      if (
        hole.detectionWarning &&
        hole.trailWarningTimer <= 0
      ) {
        setHoleMessage(
          "ATTENTION LOST — move when the mower turns away.",
          1.45,
        );
      }
      hole.detectionWarning = false;
    }

    if (
      canSee ||
      (canHear && (!hole.distraction || hole.distractionTimer <= 0))
    ) {
      hole.lastSeenPlayer = { x: state.player.x, y: state.player.y };
    }

    if (
      hole.distractionTimer > 0 &&
      hole.distraction &&
      !(canSee && playerDistance < 15)
    ) {
      hole.distractionTimer = Math.max(0, hole.distractionTimer - dt);
      joe.mode = "investigate";
      moveJoeToward(hole.distraction, 23, dt);
      joe.alert = Math.max(0.18, joe.alert - dt * 0.12);
      if (hole.distractionTimer === 0) {
        hole.lastSeenPlayer = { ...hole.distraction };
        hole.distraction = null;
        joe.mode = "search";
        hole.searchTimer = Math.max(2.8, 5.1 - hole.ballThrowsUsed * 0.45);
      }
    } else if (canSee || canHear) {
      joe.mode = "chase";
      hole.detection = Math.max(
        hole.detection,
        0.72,
      );
      hole.lostSightTimer = 0;
      hole.searchTimer = 6;
      if (!hole.lastSeenPlayer) {
        hole.lastSeenPlayer = { x: state.player.x, y: state.player.y };
      }
      joe.alert = clamp(joe.alert + dt * (canSee ? 0.38 : 0.24), 0, 1);
      moveJoeToward(
        canSee ? state.player : hole.lastSeenPlayer,
        29 + joe.alert * 7,
        dt,
      );
    } else if (joe.mode === "chase") {
      hole.lostSightTimer += dt;
      joe.alert = Math.max(0.22, joe.alert - dt * 0.06);
      if (hole.lastSeenPlayer) {
        moveJoeToward(hole.lastSeenPlayer, 24, dt);
      }
      if (hole.lostSightTimer >= 1.25) {
        joe.mode = "search";
        hole.detection = Math.min(
          hole.detection,
          0.42,
        );
        hole.searchTimer = 6;
        setHoleMessage("LINE OF SIGHT BROKEN — Stay crouched and quiet.", 2.7);
      }
    } else if (joe.mode === "search") {
      hole.searchTimer = Math.max(0, hole.searchTimer - dt);
      joe.alert = Math.max(0, joe.alert - dt * 0.075);
      const center = hole.lastSeenPlayer || { x: joe.x, y: joe.y };
      const searchTarget = {
        x: center.x + Math.sin(hole.elapsed * 1.31) * (10 + hole.searchTimer),
        y: center.y + Math.cos(hole.elapsed * 0.97) * (7 + hole.searchTimer * 0.5),
      };
      moveJoeToward(searchTarget, 16, dt);
      if (hole.searchTimer <= 0) {
        joe.mode = "patrol";
        hole.lastSeenPlayer = null;
        hole.lostSightTimer = 0;
      }
    } else {
      joe.mode = "patrol";
      joe.alert = Math.max(0, joe.alert - dt * 0.08);
      const patrolTarget =
        JOE_PATROL_ROUTE[joe.patrolIndex];
      joe.patrolPause = Math.max(0, joe.patrolPause - dt);
      if (joe.patrolPause <= 0) {
        moveJoeToward(patrolTarget, 13, dt);
        if (worldDistance(joe, patrolTarget) < 7.5) {
          joe.patrolIndex =
            (joe.patrolIndex + 1) %
            JOE_PATROL_ROUTE.length;
          joe.patrolPause =
            0.55 +
            hash(joe.patrolIndex * 19.7) * 0.65;
        }
      }
    }

    joe.x = clamp(joe.x, -COURSE_MAX_X, COURSE_MAX_X);
    joe.y = clamp(joe.y, 4, COURSE_LENGTH);
    const joeWet = wetStateAt(joe).active;
    const joeSand =
      sandStateAt(joe).active;
    if (joeWet) {
      hole.wetTrapSeconds += dt;
    }
    if (joeSand) {
      hole.sandTrapSeconds += dt;
    }
    if (
      joeSand &&
      !joe.sand
    ) {
      hole.sandTrapCount += 1;
      sandTrapTriggered = true;
      addWorldEffect(
        "sand_churn",
        joe.x,
        joe.y,
        2.1,
      );
      if (!joeWet) {
        playSandChurnCue();
      }
    }
    if (joeWet && !joe.wet) {
      hole.wetTrapCount += 1;
      hole.stateBanner =
        "MOWER BOGGED // MOVE WHILE JOE CLEARS THE DECK";
      hole.stateBannerTimer = 2.6;
      hole.stateBannerLockTimer = 2.6;
      setHoleMessage(
        "JOE HIT SOAKED TURF — his mower is dragging at 68% speed.",
        2.8,
      );
      addWorldEffect(
        "mower_sputter",
        joe.x,
        joe.y,
        2.1,
      );
      playMowerBogCue();
    }
    joe.wet = joeWet;
    joe.sand = joeSand;
    recordJoeCut();
    joe.minimumObstacleClearance = Math.min(
      joe.minimumObstacleClearance,
      joeObstacleClearanceAt(joe),
    );
    if (
      previousMode !== "chase" &&
      joe.mode === "chase"
    ) {
      hole.chaseCount += 1;
      hole.chaseClosestDistance = playerDistance;
    }
    if (joe.mode === "chase") {
      hole.pursuitSeconds += dt;
      hole.chaseClosestDistance = Math.min(
        hole.chaseClosestDistance,
        worldDistance(joe, state.player),
      );
    }
    const brokeContact =
      previousMode === "chase" &&
      joe.mode === "search";
    if (brokeContact) {
      hole.chaseBreaks += 1;
      if (hole.chaseClosestDistance < 18) {
        hole.closeCalls += 1;
      }
    }
    if (joe.mode !== previousMode) {
      announceJoeState(joe.mode);
      if (
        brokeContact &&
        hole.chaseClosestDistance < 18
      ) {
        hole.stateBanner =
          "CLOSE CALL // EXPOSURE SURVIVED";
        hole.stateBannerTimer = 2.1;
        setHoleMessage(
          "CLOSE CALL — Joe lost the line. Keep moving.",
          2.15,
        );
        playUiTone(430, 0.09, 0.028);
      }
    }
    if (
      sandTrapTriggered &&
      !joeWet
    ) {
      hole.stateBanner =
        `MOWER IN SAND // +${BUNKER_TRAP_BONUS} TACTIC`;
      hole.stateBannerTimer = 2.6;
      hole.stateBannerLockTimer = 2.6;
      setHoleMessage(
        "JOE HIT BUNKER SAND — the deck is dragging at 76% speed.",
        2.8,
      );
    }
    if (brokeContact) {
      hole.chaseClosestDistance = Infinity;
    }
    if (joe.mode === "chase" || playerDistance < 42) {
      hole.lastKnownJoe = { x: joe.x, y: joe.y };
      hole.lastKnownJoeTimer = 4.5;
    }
    hole.previousJoeMode = joe.mode;
    if (worldDistance(joe, state.player) < 8.2) {
      recordCapture();
      state.mode = "defeat";
      state.time = 0;
      state.transitionAlpha = 0.6;
      state.status = "Claim denied by mower.";
      setMotorLevel(0.14, 92);
      playCaptureCue();
    }
  }

  function joeObstacleOnSegment(start, end, padding = JOE_NAVIGATION_CLEARANCE) {
    const startX = start.x * 0.72;
    const startY = start.y;
    const endX = end.x * 0.72;
    const endY = end.y;
    const segmentX = endX - startX;
    const segmentY = endY - startY;
    const segmentLengthSquared =
      segmentX * segmentX + segmentY * segmentY;
    let nearest = null;
    let nearestAmount = Infinity;

    for (let index = 0; index < COURSE_OBSTACLES.length; index += 1) {
      const obstacle = COURSE_OBSTACLES[index];
      if (!obstacle.blocks) {
        continue;
      }
      const obstacleX = obstacle.x * 0.72;
      const obstacleY = obstacle.y;
      const inflatedRadius = obstacle.radius + padding;
      const startDistance = Math.hypot(
        startX - obstacleX,
        startY - obstacleY,
      );
      const endDistance = Math.hypot(
        endX - obstacleX,
        endY - obstacleY,
      );

      // Joe may begin inside an old prototype collider. Let him move out,
      // but never let steering carry him deeper into it.
      if (
        startDistance < inflatedRadius &&
        endDistance > startDistance + 0.01
      ) {
        continue;
      }

      const amount =
        segmentLengthSquared <= 0.0001
          ? 0
          : clamp(
              ((obstacleX - startX) * segmentX +
                (obstacleY - startY) * segmentY) /
                segmentLengthSquared,
              0,
              1,
            );
      const closestX = startX + segmentX * amount;
      const closestY = startY + segmentY * amount;
      const distance = Math.hypot(
        closestX - obstacleX,
        closestY - obstacleY,
      );
      if (distance < inflatedRadius && amount < nearestAmount) {
        nearest = obstacle;
        nearestAmount = amount;
      }
    }

    return nearest;
  }

  function joeObstacleClearanceAt(point) {
    let clearance = Infinity;
    for (let index = 0; index < COURSE_OBSTACLES.length; index += 1) {
      const obstacle = COURSE_OBSTACLES[index];
      if (!obstacle.blocks) {
        continue;
      }
      clearance = Math.min(
        clearance,
        worldDistance(point, obstacle) -
          obstacle.radius,
      );
    }
    return clearance;
  }

  function joeNavigationPointClear(point) {
    if (
      point.x < -112 ||
      point.x > 112 ||
      point.y < 4 ||
      point.y > COURSE_LENGTH
    ) {
      return false;
    }
    return (
      joeObstacleClearanceAt(point) >=
      JOE_NAVIGATION_CLEARANCE
    );
  }

  function wrapRadians(angle) {
    let wrapped = angle;
    while (wrapped > Math.PI) {
      wrapped -= Math.PI * 2;
    }
    while (wrapped < -Math.PI) {
      wrapped += Math.PI * 2;
    }
    return wrapped;
  }

  function planJoeRoute(start, target) {
    const xCount =
      Math.floor(224 / JOE_NAVIGATION_GRID) + 1;
    const yCount =
      Math.floor((COURSE_LENGTH - 4) / JOE_NAVIGATION_GRID) + 1;
    const cellKey = (xIndex, yIndex) =>
      `${xIndex},${yIndex}`;
    const cellPoint = (xIndex, yIndex) => ({
      x: -112 + xIndex * JOE_NAVIGATION_GRID,
      y: 4 + yIndex * JOE_NAVIGATION_GRID,
    });
    const pointForKey = (key) => {
      if (key === "start") {
        return start;
      }
      if (key === "goal") {
        return target;
      }
      const parts = key.split(",");
      return cellPoint(
        Number(parts[0]),
        Number(parts[1]),
      );
    };
    const open = ["start"];
    const openSet = new Set(open);
    const parents = new Map();
    const costs = new Map([["start", 0]]);
    const estimates = new Map([
      ["start", worldDistance(start, target)],
    ]);
    let iterations = 0;

    while (open.length > 0 && iterations < 3600) {
      iterations += 1;
      let bestIndex = 0;
      for (let index = 1; index < open.length; index += 1) {
        if (
          (estimates.get(open[index]) || Infinity) <
          (estimates.get(open[bestIndex]) || Infinity)
        ) {
          bestIndex = index;
        }
      }
      const currentKey = open.splice(bestIndex, 1)[0];
      openSet.delete(currentKey);
      if (currentKey === "goal") {
        const route = [];
        let routeKey = currentKey;
        while (
          routeKey &&
          routeKey !== "start"
        ) {
          if (routeKey !== "goal") {
            route.push(pointForKey(routeKey));
          }
          routeKey = parents.get(routeKey);
        }
        route.reverse();
        route.push({ x: target.x, y: target.y });

        const simplified = [];
        let anchor = start;
        let routeIndex = 0;
        while (routeIndex < route.length) {
          let furthest = routeIndex;
          for (
            let testIndex = route.length - 1;
            testIndex > routeIndex;
            testIndex -= 1
          ) {
            const finalLeg =
              testIndex === route.length - 1;
            if (
              !joeObstacleOnSegment(
                anchor,
                route[testIndex],
                finalLeg
                  ? 0.8
                  : JOE_NAVIGATION_CLEARANCE,
              )
            ) {
              furthest = testIndex;
              break;
            }
          }
          simplified.push(route[furthest]);
          anchor = route[furthest];
          routeIndex = furthest + 1;
        }
        return simplified;
      }

      const currentPoint = pointForKey(currentKey);
      const neighbors = [];
      if (currentKey === "start") {
        for (let yIndex = 0; yIndex < yCount; yIndex += 1) {
          for (let xIndex = 0; xIndex < xCount; xIndex += 1) {
            const point = cellPoint(xIndex, yIndex);
            if (
              worldDistance(start, point) <= 18 &&
              joeNavigationPointClear(point) &&
              !joeObstacleOnSegment(start, point)
            ) {
              neighbors.push({
                key: cellKey(xIndex, yIndex),
                point,
              });
            }
          }
        }
      } else {
        const parts = currentKey.split(",");
        const currentX = Number(parts[0]);
        const currentY = Number(parts[1]);
        for (let yOffset = -1; yOffset <= 1; yOffset += 1) {
          for (let xOffset = -1; xOffset <= 1; xOffset += 1) {
            if (xOffset === 0 && yOffset === 0) {
              continue;
            }
            const xIndex = currentX + xOffset;
            const yIndex = currentY + yOffset;
            if (
              xIndex < 0 ||
              xIndex >= xCount ||
              yIndex < 0 ||
              yIndex >= yCount
            ) {
              continue;
            }
            const point = cellPoint(xIndex, yIndex);
            if (
              joeNavigationPointClear(point) &&
              !joeObstacleOnSegment(currentPoint, point)
            ) {
              neighbors.push({
                key: cellKey(xIndex, yIndex),
                point,
              });
            }
          }
        }
      }

      if (
        worldDistance(currentPoint, target) <= 20 &&
        !joeObstacleOnSegment(
          currentPoint,
          target,
          0.8,
        )
      ) {
        neighbors.push({ key: "goal", point: target });
      }

      for (let index = 0; index < neighbors.length; index += 1) {
        const neighbor = neighbors[index];
        const tentativeCost =
          (costs.get(currentKey) || 0) +
          worldDistance(currentPoint, neighbor.point);
        if (
          tentativeCost >=
          (costs.get(neighbor.key) || Infinity)
        ) {
          continue;
        }
        parents.set(neighbor.key, currentKey);
        costs.set(neighbor.key, tentativeCost);
        estimates.set(
          neighbor.key,
          tentativeCost +
            worldDistance(neighbor.point, target),
        );
        if (!openSet.has(neighbor.key)) {
          open.push(neighbor.key);
          openSet.add(neighbor.key);
        }
      }
    }

    return [];
  }

  function moveJoeToward(target, speed, dt) {
    const joe = state.hole.joe;
    const effectiveSpeed =
      speed *
      (
        state.hole.overtime
          ? OVERTIME_JOE_SPEED_MULTIPLIER
          : 1
      ) *
      (
        wetStateAt(joe).active
          ? WET_MOWER_SPEED_MULTIPLIER
          : sandStateAt(joe).active
            ? SAND_MOWER_SPEED_MULTIPLIER
            : 1
      );
    const start = { x: joe.x, y: joe.y };
    let tightestObstacle = null;
    let tightestClearance = Infinity;
    for (
      let index = 0;
      index < COURSE_OBSTACLES.length;
      index += 1
    ) {
      const obstacle = COURSE_OBSTACLES[index];
      if (!obstacle.blocks) {
        continue;
      }
      const clearance =
        worldDistance(joe, obstacle) -
        obstacle.radius;
      if (clearance < tightestClearance) {
        tightestObstacle = obstacle;
        tightestClearance = clearance;
      }
    }
    if (
      tightestObstacle &&
      tightestClearance <
        JOE_NAVIGATION_CLEARANCE
    ) {
      const metricX =
        (joe.x - tightestObstacle.x) * 0.72;
      const metricY =
        joe.y - tightestObstacle.y;
      const metricLength = Math.max(
        0.001,
        Math.hypot(metricX, metricY),
      );
      const escapeStep = Math.min(
        effectiveSpeed * dt,
        JOE_NAVIGATION_CLEARANCE -
          tightestClearance +
          0.12,
      );
      const escapeCandidate = {
        x: clamp(
          joe.x +
            metricX /
              metricLength *
              escapeStep /
              0.72,
          -112,
          112,
        ),
        y: clamp(
          joe.y +
            metricY /
              metricLength *
              escapeStep,
          4,
          COURSE_LENGTH,
        ),
      };
      const escapeBlocker =
        joeObstacleOnSegment(
          start,
          escapeCandidate,
          0.1,
        );
      if (
        !escapeBlocker ||
        escapeBlocker.id ===
          tightestObstacle.id
      ) {
        joe.x = escapeCandidate.x;
        joe.y = escapeCandidate.y;
        joe.routePath = [];
        joe.repathTimer = 0;
        joe.stuckTimer = 0;
        joe.routeObstacle =
          tightestObstacle.id;
      }
      return;
    }
    const directBlocker = joeObstacleOnSegment(
      start,
      target,
    );
    joe.repathTimer = Math.max(0, joe.repathTimer - dt);
    const targetMoved =
      !joe.routeTarget ||
      worldDistance(joe.routeTarget, target) > 7;
    const pathBlocked =
      joe.routePath.length > 0 &&
      Boolean(
        joeObstacleOnSegment(
          start,
          joe.routePath[0],
          JOE_NAVIGATION_CLEARANCE,
        ),
      );

    if (!directBlocker) {
      joe.routePath = [];
      joe.routeTarget = null;
      joe.routeObstacle = null;
    } else if (
      joe.repathTimer <= 0 &&
      (
        joe.routePath.length === 0 ||
        targetMoved ||
        pathBlocked
      )
    ) {
      const route = planJoeRoute(start, target);
      if (route.length > 0) {
        joe.routePath = route;
        joe.routeTarget = {
          x: target.x,
          y: target.y,
        };
        joe.repathTimer =
          JOE_NAVIGATION_REPATH_SECONDS;
        joe.rerouteCount += 1;
      } else {
        joe.repathTimer = 0.12;
      }
      joe.routeObstacle = directBlocker.id;
    }

    while (
      joe.routePath.length > 0 &&
      worldDistance(start, joe.routePath[0]) < 3
    ) {
      joe.routePath.shift();
    }
    const navigationTarget =
      joe.routePath.length > 0
        ? joe.routePath[0]
        : target;
    const startMetricX = joe.x * 0.72;
    const navigationMetricX =
      navigationTarget.x * 0.72;
    const navigationDeltaX =
      navigationMetricX - startMetricX;
    const navigationDeltaY =
      navigationTarget.y - joe.y;
    const navigationDistance = Math.hypot(
      navigationDeltaX,
      navigationDeltaY,
    );
    if (navigationDistance <= 0.04) {
      joe.steeringAngle = lerp(
        joe.steeringAngle,
        0,
        0.24,
      );
      return;
    }

    const targetAngle = Math.atan2(
      target.y - joe.y,
      target.x * 0.72 - startMetricX,
    );
    const navigationAngle = Math.atan2(
      navigationDeltaY,
      navigationDeltaX,
    );
    const turnAngle = wrapRadians(
      navigationAngle - targetAngle,
    );
    const stepDistance = Math.min(
      effectiveSpeed * dt,
      navigationDistance,
    );
    const candidate = {
      x: clamp(
        (startMetricX +
          Math.cos(navigationAngle) * stepDistance) /
          0.72,
        -112,
        112,
      ),
      y: clamp(
        joe.y +
          Math.sin(navigationAngle) * stepDistance,
        4,
        COURSE_LENGTH,
      ),
    };
    const movementPadding =
      JOE_NAVIGATION_CLEARANCE - 0.18;
    const movementBlocker = joeObstacleOnSegment(
      start,
      candidate,
      movementPadding,
    );
    if (movementBlocker) {
      joe.stuckTimer += dt;
      joe.repathTimer = Math.max(
        joe.repathTimer,
        0.08,
      );
      joe.routeObstacle = movementBlocker.id;
      if (joe.stuckTimer >= 0.55) {
        joe.routeSide *= -1;
        joe.routePath = [];
        joe.rerouteCount += 1;
        joe.stuckTimer = 0;
        joe.repathTimer = 0;
      }
      return;
    }

    joe.x = candidate.x;
    joe.y = candidate.y;
    joe.stuckTimer = Math.max(
      0,
      joe.stuckTimer - dt * 3,
    );
    joe.steeringAngle = lerp(
      joe.steeringAngle,
      turnAngle,
      clamp(dt * 9, 0.18, 0.62),
    );
    joe.routeSide =
      Math.sign(turnAngle) || joe.routeSide;
    joe.routeObstacle = directBlocker
      ? directBlocker.id
      : null;
  }

  function drawWorldMarker(worldX, worldY, label, color, glyph) {
    const point = worldToScreen(worldX, worldY);
    if (!point.visible || point.x < -180 || point.x > WIDTH + 180) {
      return;
    }
    const markerX = clamp(point.x, 82, WIDTH - 82);
    const edgeDirection =
      point.x < 82
        ? "◀ "
        : point.x > WIDTH - 82
          ? " ▶"
          : "";
    const markerLabel =
      point.x < 82
        ? `${edgeDirection}${label}`
        : `${label}${edgeDirection}`;
    const markerScale = clamp(point.scale, 0.58, 1.35);
    const joePoint =
      state.mode === "first_hole"
        ? worldToScreen(state.hole.joe.x, state.hole.joe.y)
        : null;
    const joeHeight =
      joePoint && joePoint.visible
        ? JOE_SOURCE.heightMeters * joePoint.pixelsPerMeter
        : 0;
    const markerTop = point.y - 70 * markerScale;
    const markerBottom = point.y - 12 * markerScale;
    const joeOverlapsMarker =
      joePoint &&
      joePoint.visible &&
      Math.abs(markerX - joePoint.x) <
        78 + joeHeight * 0.3 &&
      markerBottom > joePoint.y - joeHeight &&
      markerTop < joePoint.y + 18;
    const joeGuardingMarker =
      state.mode === "first_hole" &&
      worldDistance(state.hole.joe, { x: worldX, y: worldY }) < 18;
    ctx.save();
    ctx.globalAlpha =
      clamp(1.25 - Math.abs(point.forwardDistance) / 120, 0.28, 1) *
      (joeGuardingMarker || joeOverlapsMarker ? 0.22 : 1);
    ctx.fillStyle = "rgba(2,8,4,0.82)";
    ctx.fillRect(markerX - 74, point.y - 50 * markerScale, 148, 34);
    strokeRect(markerX - 74, point.y - 50 * markerScale, 148, 34, color, 2);
    drawText(glyph, markerX, point.y - 58 * markerScale, Math.round(24 * markerScale + 10), color, "center", true);
    drawText(markerLabel, markerX, point.y - 28 * markerScale, 12, "#f0ead1", "center", true);
    ctx.restore();
  }

  function drawPerspectiveCourse(progress, walkBob) {
    const horizonY = COURSE_CAMERA.horizonY;
    const cameraOffset = -state.player.x * 3.1;

    ctx.save();
    ctx.globalAlpha = 0.2;
    for (let lane = -6; lane <= 6; lane += 1) {
      const horizonX = WIDTH * 0.5 + lane * 24 + cameraOffset * 0.12;
      const bottomX = WIDTH * 0.5 + lane * 178 + cameraOffset;
      const edge = Math.abs(lane) >= 4;
      ctx.strokeStyle = edge ? "rgba(135,157,82,0.42)" : "rgba(151,167,102,0.2)";
      ctx.lineWidth = edge ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(horizonX, horizonY);
      ctx.quadraticCurveTo(
        lerp(horizonX, bottomX, 0.42),
        lerp(horizonY, HEIGHT + 20, 0.45),
        bottomX,
        HEIGHT + 18,
      );
      ctx.stroke();
    }

    const travelPhase = state.hole.travelDistance * 0.018;
    for (let index = 0; index < 22; index += 1) {
      const phase = (index / 22 + travelPhase) % 1;
      const depth = phase * phase;
      const y = lerp(horizonY + 14, HEIGHT + 18, depth);
      const spread = lerp(90, WIDTH * 0.58, depth);
      const x =
        WIDTH * 0.5 +
        (hash(index * 17.31) * 2 - 1) * spread +
        cameraOffset * depth;
      const length = lerp(3, 34, depth);
      ctx.strokeStyle = `rgba(196,185,112,${lerp(0.08, 0.28, depth)})`;
      ctx.lineWidth = lerp(1, 3, depth);
      ctx.beginPath();
      ctx.moveTo(x - length * 0.5, y + walkBob * depth);
      ctx.lineTo(x + length * 0.5, y + walkBob * depth);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBunkerSand() {
    const zones =
      BUNKER_SAND_ZONES
        .map((zone) => ({
          zone,
          point: worldToScreen(
            zone.x,
            zone.y,
          ),
        }))
        .filter(
          (entry) =>
            entry.point.visible &&
            entry.point.x > -900 &&
            entry.point.x < WIDTH + 900,
        )
        .sort(
          (a, b) =>
            a.point.y -
            b.point.y,
        );
    for (
      let index = 0;
      index < zones.length;
      index += 1
    ) {
      const zone = zones[index].zone;
      const point = zones[index].point;
      const horizontalRadius =
        Math.min(
          WIDTH * 1.35,
          Math.max(
            10,
            zone.radiusX *
              COURSE_CAMERA.worldUnitMeters *
              point.pixelsPerMeter,
          ),
        );
      const verticalRadius =
        Math.min(
          HEIGHT * 0.5,
          Math.max(
            3,
            zone.radiusY *
              COURSE_CAMERA.worldUnitMeters *
              point.pixelsPerMeter *
              0.2,
          ),
        );
      const active =
        state.hole.environment
          ?.sandZone?.id ===
          zone.id &&
        state.hole.environment.sand;
      const alpha = clamp(
        0.24 +
          point.scale * 0.24 +
          (active ? 0.12 : 0),
        0.22,
        0.72,
      );
      ctx.save();
      const sand =
        ctx.createRadialGradient(
          point.x -
            horizontalRadius * 0.18,
          point.y -
            verticalRadius * 0.16,
          0,
          point.x,
          point.y,
          horizontalRadius,
        );
      sand.addColorStop(
        0,
        `rgba(184,145,82,${alpha})`,
      );
      sand.addColorStop(
        0.58,
        `rgba(125,91,47,${alpha * 0.9})`,
      );
      sand.addColorStop(
        1,
        `rgba(55,44,27,${alpha * 0.34})`,
      );
      ctx.fillStyle = sand;
      ctx.beginPath();
      ctx.ellipse(
        point.x,
        point.y,
        horizontalRadius,
        verticalRadius,
        zone.rakeAngle,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle =
        `rgba(220,181,108,${alpha * 0.66})`;
      ctx.lineWidth = Math.max(
        1,
        point.scale * 1.5,
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(
        point.x,
        point.y,
        horizontalRadius * 0.9,
        verticalRadius * 0.8,
        zone.rakeAngle,
        0,
        Math.PI * 2,
      );
      ctx.clip();
      const rakeSpacing = Math.max(
        5,
        verticalRadius * 0.24,
      );
      for (
        let line = -7;
        line <= 7;
        line += 1
      ) {
        const lineY =
          point.y +
          line * rakeSpacing;
        const drift =
          state.reducedMotion
            ? 0
            : Math.sin(
                state.hole.elapsed *
                  0.35 +
                  line +
                  index,
              ) *
              point.scale *
              0.7;
        ctx.strokeStyle =
          `rgba(235,203,134,${alpha * 0.23})`;
        ctx.lineWidth = Math.max(
          1,
          point.scale * 0.65,
        );
        ctx.beginPath();
        ctx.moveTo(
          point.x -
            horizontalRadius +
            drift,
          lineY,
        );
        ctx.quadraticCurveTo(
          point.x,
          lineY -
            verticalRadius * 0.11,
          point.x +
            horizontalRadius +
            drift,
          lineY,
        );
        ctx.stroke();
      }
      for (
        let grain = 0;
        grain < 18;
        grain += 1
      ) {
        const seed = hash(
          index * 113 +
            grain * 37.7,
        );
        const grainX =
          point.x +
          (seed * 2 - 1) *
            horizontalRadius *
            0.8;
        const grainY =
          point.y +
          (hash(seed * 71) * 2 - 1) *
            verticalRadius *
            0.72;
        const size = Math.max(
          1,
          point.scale *
            (
              0.7 +
              hash(seed * 29)
            ),
        );
        ctx.fillStyle =
          grain % 3 === 0
            ? `rgba(224,190,123,${alpha * 0.42})`
            : `rgba(78,55,31,${alpha * 0.38})`;
        ctx.fillRect(
          Math.round(grainX),
          Math.round(grainY),
          Math.ceil(size),
          Math.ceil(size * 0.6),
        );
      }
      ctx.restore();
    }
  }

  function drawWetTurf() {
    const hole = state.hole;
    if (hole.sprinklerSoakTimer <= 0) {
      return;
    }
    const endingFade = clamp(
      hole.sprinklerSoakTimer / 3.5,
      0,
      1,
    );
    const shimmer = state.reducedMotion
      ? 0.5
      : (Math.sin(hole.elapsed * 4.2) + 1) * 0.5;
    const zones = SPRINKLER_SOAK_ZONES
      .map((zone) => ({
        zone,
        point: worldToScreen(zone.x, zone.y),
      }))
      .filter(
        (entry) =>
          entry.point.visible &&
          entry.point.x > -520 &&
          entry.point.x < WIDTH + 520,
      )
      .sort((a, b) => a.point.y - b.point.y);

    for (let index = 0; index < zones.length; index += 1) {
      const zone = zones[index].zone;
      const point = zones[index].point;
      const radius =
        zone.radius *
        COURSE_CAMERA.worldUnitMeters *
        point.pixelsPerMeter;
      const drawRadius = Math.max(7, radius);
      const verticalRadius = Math.max(
        2,
        drawRadius * 0.2,
      );
      const alpha =
        endingFade *
        clamp(
          0.2 + point.scale * 0.33,
          0.18,
          0.6,
        );
      ctx.save();
      const water = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        drawRadius,
      );
      water.addColorStop(
        0,
        `rgba(70,143,137,${alpha * 0.72})`,
      );
      water.addColorStop(
        0.56,
        `rgba(31,101,98,${alpha * 0.58})`,
      );
      water.addColorStop(1, "rgba(12,55,55,0)");
      ctx.fillStyle = water;
      ctx.beginPath();
      ctx.ellipse(
        point.x,
        point.y,
        drawRadius,
        verticalRadius,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle =
        `rgba(142,218,204,${alpha * (0.42 + shimmer * 0.3)})`;
      ctx.lineWidth = Math.max(
        1,
        point.scale * 1.2,
      );
      ctx.beginPath();
      ctx.ellipse(
        point.x,
        point.y,
        drawRadius * 0.78,
        verticalRadius * 0.62,
        0,
        Math.PI * 0.12,
        Math.PI * 0.84,
      );
      ctx.stroke();
      const glintCount = 7;
      for (
        let glint = 0;
        glint < glintCount;
        glint += 1
      ) {
        const seed = hash(
          index * 73.7 +
            glint * 29.3,
        );
        const phase =
          state.reducedMotion
            ? seed
            : (
                seed +
                hole.elapsed *
                  (0.035 + glint * 0.002)
              ) %
              1;
        const glintX =
          point.x +
          (phase * 2 - 1) *
            drawRadius *
            0.76;
        const glintY =
          point.y +
          (hash(seed * 41) - 0.5) *
            verticalRadius *
            0.9;
        const glintWidth =
          Math.max(
            2,
            drawRadius *
              (0.035 +
                hash(seed * 19) * 0.045),
          );
        ctx.strokeStyle =
          `rgba(187,231,214,${alpha * 0.62})`;
        ctx.beginPath();
        ctx.moveTo(
          glintX - glintWidth,
          glintY,
        );
        ctx.lineTo(
          glintX + glintWidth,
          glintY,
        );
        ctx.stroke();
      }
      const sprayHeight =
        Math.max(6, 25 * point.scale);
      ctx.strokeStyle =
        `rgba(125,204,196,${alpha * 0.72})`;
      ctx.lineWidth = Math.max(
        1,
        point.scale * 0.9,
      );
      for (
        let stream = -2;
        stream <= 2;
        stream += 1
      ) {
        const sway =
          state.reducedMotion
            ? stream * 0.18
            : Math.sin(
                hole.elapsed * 2.4 +
                  stream * 1.3 +
                  index,
              ) *
              0.18;
        const reach =
          drawRadius *
          (0.2 + Math.abs(stream) * 0.1);
        ctx.beginPath();
        ctx.moveTo(point.x, point.y - 1);
        ctx.quadraticCurveTo(
          point.x +
            (stream * 0.2 + sway) *
              drawRadius,
          point.y - sprayHeight,
          point.x +
            Math.sign(stream || 1) *
              reach,
          point.y -
            verticalRadius * 0.12,
        );
        ctx.stroke();
      }
      ctx.fillStyle =
        `rgba(169,222,209,${alpha})`;
      ctx.fillRect(
        Math.round(point.x - 2 * point.scale),
        Math.round(point.y - 3 * point.scale),
        Math.max(2, Math.round(4 * point.scale)),
        Math.max(2, Math.round(4 * point.scale)),
      );
      ctx.restore();
    }
  }

  function drawTurfMarks() {
    const marks = state.hole.turfMarks
      .map((mark) => ({
        mark,
        point: worldToScreen(mark.x, mark.y),
      }))
      .filter(
        (entry) =>
          entry.point.visible &&
          entry.point.x > -260 &&
          entry.point.x < WIDTH + 260,
      )
      .sort((a, b) => a.point.y - b.point.y);

    for (let index = 0; index < marks.length; index += 1) {
      const mark = marks[index].mark;
      const point = marks[index].point;
      const worldWidth =
        mark.radius *
        COURSE_CAMERA.worldUnitMeters *
        point.pixelsPerMeter;
      const angle = Math.atan2(
        -Math.sin(mark.heading) * 0.28,
        Math.cos(mark.heading),
      );
      ctx.save();
      ctx.translate(point.x, point.y);
      ctx.rotate(angle);
      if (mark.kind === "mowed") {
        ctx.globalAlpha = clamp(
          0.3 + point.scale * 0.42,
          0.28,
          0.78,
        );
        ctx.fillStyle = "#6f6d31";
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          Math.max(5, worldWidth),
          Math.max(2, worldWidth * 0.17),
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.strokeStyle = "rgba(187,164,75,0.72)";
        ctx.lineWidth = Math.max(1, point.scale * 1.4);
        for (let stripe = -1; stripe <= 1; stripe += 1) {
          ctx.beginPath();
          ctx.moveTo(-worldWidth * 0.78, stripe * worldWidth * 0.075);
          ctx.lineTo(worldWidth * 0.78, stripe * worldWidth * 0.075);
          ctx.stroke();
        }
      } else if (mark.kind === "track") {
        const life = clamp(
          1 - mark.age / mark.duration,
          0,
          1,
        );
        const focusBoost =
          state.hole.focus || mark.discovered
            ? 1.75
            : 1;
        ctx.globalAlpha = clamp(
          life *
            mark.strength *
            focusBoost *
            (0.24 + point.scale * 0.4),
          0.08,
          0.88,
        );
        ctx.strokeStyle = mark.discovered
          ? "#d66b35"
          : mark.sand
            ? state.hole.focus
              ? "#f0cf82"
              : "#a47a43"
          : mark.wet
            ? state.hole.focus
              ? "#a9e0d1"
              : "#467e70"
          : state.hole.focus
            ? "#d5bc64"
            : "#3c5c2d";
        ctx.lineWidth = Math.max(
          1,
          point.scale * 1.6,
        );
        const length = Math.max(
          4,
          worldWidth * 0.5,
        );
        for (let step = -1; step <= 1; step += 2) {
          ctx.beginPath();
          ctx.moveTo(
            -length * 0.5,
            step * worldWidth * 0.085,
          );
          ctx.quadraticCurveTo(
            0,
            -step * worldWidth * 0.06,
            length * 0.5,
            step * worldWidth * 0.085,
          );
          ctx.stroke();
        }
      } else if (mark.kind === "divot") {
        ctx.globalAlpha = clamp(
          0.36 + point.scale * 0.38,
          0.3,
          0.8,
        );
        ctx.fillStyle = "#342917";
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          Math.max(4, worldWidth * 0.65),
          Math.max(2, worldWidth * 0.2),
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.strokeStyle = "#bd8b3d";
        ctx.lineWidth = Math.max(1, point.scale);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawRecoverableGolfBalls() {
    const hole = state.hole;
    const balls = hole.recoverableBalls
      .map((ball) => ({
        ball,
        point: worldToScreen(
          ball.x,
          ball.y,
        ),
      }))
      .filter(
        (entry) =>
          entry.point.visible &&
          entry.point.x > -120 &&
          entry.point.x < WIDTH + 120,
      )
      .sort(
        (a, b) =>
          a.point.y - b.point.y,
      );
    for (
      let index = 0;
      index < balls.length;
      index += 1
    ) {
      const ball = balls[index].ball;
      const point = balls[index].point;
      const danger =
        golfBallDangerState(ball);
      const playerDistance =
        worldDistance(
          state.player,
          ball,
        );
      const pulse = state.reducedMotion
        ? 0.65
        : 0.56 +
          Math.sin(
            hole.elapsed * 6.4 +
              ball.id * 1.7,
          ) *
            0.18;
      const ballRadius = clamp(
        2 + point.scale * 2.1,
        2,
        7,
      );
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.52)";
      ctx.beginPath();
      ctx.ellipse(
        point.x,
        point.y + ballRadius * 0.45,
        ballRadius * 2.2,
        ballRadius * 0.66,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle =
        danger.dangerous
          ? `rgba(232,142,68,${0.5 + pulse * 0.35})`
          : `rgba(224,211,143,${0.34 + pulse * 0.3})`;
      ctx.lineWidth = Math.max(
        1,
        point.scale * 1.1,
      );
      ctx.beginPath();
      ctx.ellipse(
        point.x,
        point.y,
        ballRadius *
          (2.4 + pulse * 0.7),
        ballRadius *
          (0.72 + pulse * 0.16),
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.shadowColor =
        ball.wet
          ? "rgba(139,220,207,0.92)"
          : "rgba(247,231,172,0.92)";
      ctx.shadowBlur =
        7 + pulse * 8;
      ctx.fillStyle =
        ball.wet
          ? "#d4f0e5"
          : "#f1ead1";
      ctx.beginPath();
      ctx.arc(
        point.x,
        point.y - ballRadius * 0.35,
        ballRadius,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle =
        ball.wet
          ? "#72aaa1"
          : "#a9a279";
      ctx.fillRect(
        Math.round(
          point.x -
            ballRadius * 0.34,
        ),
        Math.round(
          point.y -
            ballRadius * 0.8,
        ),
        Math.max(
          1,
          Math.round(
            ballRadius * 0.45,
          ),
        ),
        Math.max(
          1,
          Math.round(
            ballRadius * 0.45,
          ),
        ),
      );
      if (
        hole.focus ||
        playerDistance < 24
      ) {
        const label =
          danger.activeLure
            ? "LIVE BAIT"
            : playerDistance <
                BALL_RECOVERY_RADIUS
              ? inputCopy(
                  "ENTER — RECLAIM",
                  "A — RECLAIM",
                )
              : `LOST BALL ${Math.round(playerDistance)}m`;
        drawText(
          label,
          point.x,
          point.y -
            17 -
            ballRadius,
          9,
          danger.dangerous
            ? "#efa462"
            : "#e8dfb3",
          "center",
          true,
        );
      }
      ctx.restore();
    }
  }

  function drawChangeRequest() {
    const hole = state.hole;
    if (hole.changeRequestCollected) {
      return;
    }
    const request =
      activeChangeRequest();
    const point = worldToScreen(
      request.x,
      request.y,
    );
    if (
      !point.visible ||
      point.x < -140 ||
      point.x > WIDTH + 140
    ) {
      return;
    }
    const distance =
      worldDistance(
        state.player,
        request,
      );
    const scale = clamp(
      point.scale,
      0.48,
      1.65,
    );
    const width = 30 * scale;
    const height = 38 * scale;
    const pulse = state.reducedMotion
      ? 0.62
      : 0.55 +
        Math.sin(
          hole.elapsed * 4.8 +
            request.x,
        ) *
          0.18;
    const flutter = state.reducedMotion
      ? -0.05
      : Math.sin(
          hole.elapsed * 2.6 +
            request.y,
        ) *
        0.055;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.52)";
    ctx.beginPath();
    ctx.ellipse(
      point.x,
      point.y + 3 * scale,
      width * 0.72,
      height * 0.17,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle =
      `rgba(229,112,53,${0.38 + pulse * 0.48})`;
    ctx.lineWidth = Math.max(
      1,
      2 * scale,
    );
    ctx.beginPath();
    ctx.ellipse(
      point.x,
      point.y,
      width *
        (0.72 + pulse * 0.12),
      height *
        (0.18 + pulse * 0.03),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.translate(
      point.x,
      point.y - height * 0.72,
    );
    ctx.rotate(flutter);
    ctx.shadowColor =
      "rgba(232,105,41,0.68)";
    ctx.shadowBlur =
      8 + pulse * 8;
    ctx.fillStyle = "#a43f21";
    ctx.fillRect(
      -width * 0.55,
      -height * 0.08,
      width * 1.1,
      height * 0.88,
    );
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#d9662d";
    ctx.fillRect(
      -width * 0.58,
      -height * 0.16,
      width * 0.78,
      height * 0.22,
    );
    ctx.fillStyle = "#e8dfbd";
    ctx.fillRect(
      -width * 0.42,
      0,
      width * 0.82,
      height * 0.64,
    );
    ctx.fillStyle = "#2c382a";
    const lineHeight =
      Math.max(1, 2 * scale);
    for (
      let line = 0;
      line < 4;
      line += 1
    ) {
      ctx.fillRect(
        -width * 0.3,
        height *
          (0.13 + line * 0.1),
        width *
          (line === 3 ? 0.36 : 0.58),
        lineHeight,
      );
    }
    ctx.strokeStyle = "#ef7136";
    ctx.lineWidth = Math.max(
      1,
      1.5 * scale,
    );
    ctx.strokeRect(
      -width * 0.24,
      height * 0.48,
      width * 0.48,
      height * 0.12,
    );
    ctx.restore();
    if (
      hole.focus ||
      distance < 42
    ) {
      drawText(
        `${request.code} // UNFILED CHANGE`,
        point.x,
        point.y -
          height -
          14,
        10,
        "#ef9a62",
        "center",
        true,
      );
      if (distance < 42) {
        drawText(
          `+${CHANGE_REQUEST_BONUS} ON ESCAPE`,
          point.x,
          point.y -
            height,
          9,
          "#e9d29b",
          "center",
        );
      }
    }
  }

  function drawCourseObstacle(obstacle) {
    if (obstacle.draw === false) {
      return;
    }
    const obstacleArt =
      obstacle.kit === "expanded"
        ? expandedCourseArt
        : courseObstacleArt;
    const obstacleCells =
      obstacle.kit === "expanded"
        ? EXPANDED_OBSTACLE_CELLS
        : COURSE_OBSTACLE_CELLS;
    if (!obstacleArt.complete || obstacleArt.naturalWidth === 0) {
      return;
    }
    const point = worldToScreen(obstacle.x, obstacle.y);
    if (!point.visible || point.x < -420 || point.x > WIDTH + 420) {
      return;
    }
    const cell = obstacleCells[obstacle.type];
    if (!cell) {
      return;
    }
    const drawHeight =
      cell.heightMeters *
      obstacle.scale *
      point.pixelsPerMeter;
    const drawWidth = drawHeight * cell.width / cell.height;
    const sway = state.reducedMotion
      ? 0
      : Math.sin(state.time * 0.7 + obstacle.x * 0.11) * Math.min(2.5, point.scale * 2);

    ctx.save();
    ctx.globalAlpha = clamp(0.52 + point.scale * 0.48, 0.48, 1);
    ctx.fillStyle = `rgba(0,3,1,${clamp(point.scale * 0.32, 0.1, 0.38)})`;
    ctx.beginPath();
    ctx.ellipse(
      point.x,
      point.y - 2,
      drawWidth * 0.31,
      Math.max(3, drawHeight * 0.045),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.drawImage(
      obstacleArt,
      cell.x,
      cell.y,
      cell.width,
      cell.height,
      point.x - drawWidth * 0.5 + sway,
      point.y - drawHeight,
      drawWidth,
      drawHeight,
    );
    if (obstacle.lightRadius) {
      const power = floodlightPower();
      const flicker =
        state.reducedMotion
          ? 0.16 * power
          : (0.12 +
              hash(Math.floor(state.time * 9) + obstacle.y) * 0.12) *
            power;
      const glow = ctx.createRadialGradient(
        point.x + sway,
        point.y - drawHeight * 0.84,
        2,
        point.x + sway,
        point.y - drawHeight * 0.84,
        Math.max(24, drawHeight * 0.38),
      );
      glow.addColorStop(0, `rgba(255,188,78,${flicker + 0.16})`);
      glow.addColorStop(0.34, `rgba(214,127,43,${flicker})`);
      glow.addColorStop(1, "rgba(214,127,43,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(
        point.x - drawWidth,
        point.y - drawHeight * 1.25,
        drawWidth * 2,
        drawHeight * 0.8,
      );
    }
    ctx.restore();
  }

  function drawDrainExit() {
    const point = worldToScreen(DRAIN_EXIT.x, DRAIN_EXIT.y);
    if (!point.visible || point.x < -340 || point.x > WIDTH + 340) {
      return;
    }
    const drawHeight = DRAIN_SOURCE.heightMeters * point.pixelsPerMeter;
    const drawWidth = drawHeight * DRAIN_SOURCE.width / DRAIN_SOURCE.height;
    const unlocked = state.hole.drainUnlocked;
    const pulse = state.reducedMotion ? 0.75 : 0.68 + Math.sin(state.time * 3.4) * 0.15;

    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.fillStyle = "rgba(0,3,2,0.48)";
    ctx.beginPath();
    ctx.ellipse(
      0,
      2,
      Math.max(10, drawWidth * 0.43),
      Math.max(4, drawHeight * 0.05),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    if (unlocked) {
      ctx.shadowColor = `rgba(108,201,175,${pulse})`;
      ctx.shadowBlur = Math.max(12, drawHeight * 0.12);
    }
    if (drainArt.complete && drainArt.naturalWidth > 0) {
      ctx.drawImage(
        drainArt,
        DRAIN_SOURCE.x,
        DRAIN_SOURCE.y,
        DRAIN_SOURCE.width,
        DRAIN_SOURCE.height,
        -drawWidth * 0.5,
        -drawHeight,
        drawWidth,
        drawHeight,
      );
    }
    ctx.restore();

    if (unlocked) {
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = "#7bc8ad";
      ctx.lineWidth = Math.max(1, point.scale * 2);
      ctx.beginPath();
      ctx.ellipse(
        point.x,
        point.y - drawHeight * 0.47,
        drawWidth * 0.17,
        drawHeight * 0.21,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawLayeredCourseEntities() {
    const entities = [];
    for (let index = 0; index < COURSE_OBSTACLES.length; index += 1) {
      const obstacle = COURSE_OBSTACLES[index];
      if (obstacle.draw === false) {
        continue;
      }
      const point = worldToScreen(obstacle.x, obstacle.y);
      if (point.visible) {
        entities.push({
          y: point.y,
          draw: () => drawCourseObstacle(obstacle),
        });
      }
    }
    const joePoint = worldToScreen(state.hole.joe.x, state.hole.joe.y);
    if (joePoint.visible) {
      entities.push({
        y: joePoint.y,
        draw: drawJoeOnCourse,
      });
    }
    const drainPoint = worldToScreen(DRAIN_EXIT.x, DRAIN_EXIT.y);
    if (drainPoint.visible) {
      entities.push({
        y: drainPoint.y,
        draw: drawDrainExit,
      });
    }
    entities.sort((a, b) => a.y - b.y);
    for (let index = 0; index < entities.length; index += 1) {
      entities[index].draw();
    }
  }

  function getOpeningForegroundTransform(walkBob = 0) {
    const cameraTravel = state.hole.travelDistance;
    const departure = smoothstep(clamp(cameraTravel / 20, 0, 1));
    const fade =
      1 - smoothstep(clamp((cameraTravel - 2.5) / 15.5, 0, 1));
    const scale = 1 + departure * 0.5;
    const width = 1380 * scale;
    const height = 580 * scale;
    const lateralParallax = clamp(-state.player.x * 12.5, -820, 820);
    return {
      departure,
      visibility: fade,
      cameraTravel,
      parallaxX: lateralParallax,
      width,
      height,
      x:
        (WIDTH - width) * 0.5 +
        lateralParallax,
      y:
        HEIGHT -
        height +
        8 +
        departure * (height + 130) +
        walkBob * 0.35,
    };
  }

  function drawForegroundFringe(walkBob) {
    const transform = getOpeningForegroundTransform(walkBob);
    if (
      transform.visibility <= 0.01 ||
      !foregroundFringeArt.complete ||
      foregroundFringeArt.naturalWidth === 0
    ) {
      return transform;
    }
    const breathing = state.reducedMotion ? 0 : Math.sin(state.time * 0.72) * 3;
    ctx.save();
    ctx.globalAlpha = 0.9 * transform.visibility;
    ctx.drawImage(
      foregroundFringeArt,
      0,
      179,
      foregroundFringeArt.naturalWidth,
      751,
      transform.x + breathing,
      transform.y,
      transform.width,
      transform.height,
    );
    ctx.restore();
    return transform;
  }

  function joeAnimationState() {
    const joeMode = state.hole.joe.mode;
    const animation =
      JOE_ANIMATIONS[joeMode] ||
      JOE_ANIMATIONS.patrol;
    const playbackRate =
      animation.fps * (state.reducedMotion ? 0.72 : 1);
    const sequenceIndex =
      Math.floor(state.hole.elapsed * playbackRate) %
      animation.sequence.length;
    const frame = animation.sequence[sequenceIndex];
    return {
      ...animation,
      frame,
      sequenceIndex,
      contactFrame: frame === 0 || frame === 5,
    };
  }

  function drawJoeMowerClippings(point, spriteHeight, animation) {
    const joeMode = state.hole.joe.mode;
    const count =
      joeMode === "chase"
        ? 9
        : joeMode === "search"
          ? 5
          : joeMode === "investigate"
            ? 4
            : 2;
    const speed =
      joeMode === "chase"
        ? 11
        : joeMode === "search"
          ? 7
          : 4.5;
    ctx.save();
    for (let index = 0; index < count; index += 1) {
      const phase =
        (state.hole.elapsed * speed +
          index / count +
          animation.frame * 0.071) %
        1;
      const seed = hash(index * 41 + animation.frame * 17);
      const side = seed > 0.5 ? 1 : -1;
      const spread =
        (0.12 + hash(index * 29 + 3) * 0.24) *
        spriteHeight *
        side;
      const lift =
        phase *
        Math.min(28, spriteHeight * (joeMode === "chase" ? 0.17 : 0.1));
      const alpha =
        (1 - smoothstep(phase)) *
        (animation.contactFrame ? 0.82 : 0.5);
      ctx.strokeStyle =
        joeMode === "chase"
          ? `rgba(187,151,66,${alpha})`
          : `rgba(112,132,67,${alpha * 0.8})`;
      ctx.lineWidth = Math.max(1, point.scale * 1.4);
      ctx.beginPath();
      ctx.moveTo(point.x + spread * 0.34, point.y - 2);
      ctx.lineTo(
        point.x + spread,
        point.y - lift - hash(index * 13) * 6,
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawJoeRouteWake(point, spriteHeight) {
    const joe = state.hole.joe;
    if (!joe.routeObstacle) {
      return;
    }
    const turnStrength = clamp(
      Math.abs(joe.steeringAngle) / 1.05,
      0.18,
      1,
    );
    const turnDirection =
      Math.sign(joe.steeringAngle) || joe.routeSide;
    const width = clamp(spriteHeight * 0.3, 9, 62);
    ctx.save();
    ctx.globalAlpha = state.reducedMotion
      ? 0.16
      : 0.22 + turnStrength * 0.34;
    ctx.lineCap = "round";
    for (let index = 0; index < 3; index += 1) {
      const phase = state.reducedMotion
        ? index / 3
        : (state.hole.elapsed * (0.9 + index * 0.13) +
            index * 0.31) %
          1;
      const length = width * (0.42 + phase * 0.74);
      const bend =
        turnDirection *
        length *
        (0.22 + turnStrength * 0.34);
      ctx.strokeStyle =
        index === 0
          ? "rgba(199,155,68,0.72)"
          : "rgba(75,101,43,0.62)";
      ctx.lineWidth = Math.max(1, point.scale * (2.1 - index * 0.38));
      ctx.beginPath();
      ctx.moveTo(
        point.x - bend * 0.18,
        point.y + 2 + index * 2,
      );
      ctx.quadraticCurveTo(
        point.x - bend * 0.52,
        point.y + 5 + length * 0.08,
        point.x - bend,
        point.y + 8 + length * 0.18,
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawJoeOnCourse() {
    const joe = state.hole.joe;
    const point = worldToScreen(joe.x, joe.y);
    if (!point.visible || point.x < -260 || point.x > WIDTH + 260) {
      return;
    }
    const distance = worldDistance(joe, state.player);
    const scale = point.scale;
    const labelScale = clamp(scale, 0.55, 1.35);
    const animation = joeAnimationState();
    const twitch = state.reducedMotion
      ? 0
      : Math.sin(state.time * 17) *
        clamp(
          point.scale * (joe.mode === "chase" ? 1.8 : 0.55),
          0.25,
          joe.mode === "chase" ? 3.2 : 1.2,
        );
    const bob = state.reducedMotion
      ? 0
      : Math.abs(Math.sin(state.time * animation.fps * Math.PI)) *
        clamp(point.scale * 1.25, 0.3, 3.2);
    const spriteHeight = JOE_SOURCE.heightMeters * point.pixelsPerMeter;
    const animatedSpriteWidth = spriteHeight;
    const staticSpriteWidth =
      spriteHeight *
      JOE_SOURCE.width /
      JOE_SOURCE.height;
    const animatedArtReady =
      animation.art.complete &&
      animation.art.naturalWidth >=
        JOE_ANIMATION_FRAME_SIZE * 10;
    const spriteWidth = animatedArtReady
      ? animatedSpriteWidth
      : staticSpriteWidth;

    drawJoeRouteWake(point, spriteHeight);
    drawJoeMowerClippings(point, spriteHeight, animation);

    ctx.save();
    ctx.translate(point.x + twitch, point.y + bob);
    ctx.rotate(
      state.reducedMotion
        ? 0
        : Math.sin(state.time * 11.4) *
            (joe.mode === "chase" ? 0.012 : 0.004) +
          clamp(joe.steeringAngle * 0.032, -0.032, 0.032),
    );
    ctx.fillStyle = "rgba(0,3,1,0.42)";
    ctx.beginPath();
    ctx.ellipse(
      0,
      1,
      Math.max(
        8,
        animatedArtReady
          ? spriteHeight * 0.28
          : spriteWidth * 0.72,
      ),
      Math.max(3, spriteHeight * 0.035),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    if (joe.mode === "chase") {
      ctx.shadowColor = "rgba(210,52,22,0.8)";
      ctx.shadowBlur = 22;
    } else if (joe.mode === "search") {
      ctx.shadowColor = "rgba(199,117,44,0.5)";
      ctx.shadowBlur = 13;
    } else if (joe.mode === "investigate") {
      ctx.shadowColor = "rgba(213,172,75,0.42)";
      ctx.shadowBlur = 9;
    }
    if (animatedArtReady) {
      ctx.drawImage(
        animation.art,
        animation.frame * JOE_ANIMATION_FRAME_SIZE,
        0,
        JOE_ANIMATION_FRAME_SIZE,
        JOE_ANIMATION_FRAME_SIZE,
        -animatedSpriteWidth * 0.5,
        -spriteHeight,
        animatedSpriteWidth,
        spriteHeight,
      );
    } else if (joeMowerArt.complete && joeMowerArt.naturalWidth > 0) {
      ctx.drawImage(
        joeMowerArt,
        JOE_SOURCE.x,
        JOE_SOURCE.y,
        JOE_SOURCE.width,
        JOE_SOURCE.height,
        -spriteWidth * 0.5,
        -spriteHeight,
        spriteWidth,
        spriteHeight,
      );
    } else {
      ctx.fillStyle = "#07100b";
      ctx.fillRect(-spriteWidth * 0.4, -spriteHeight, spriteWidth * 0.8, spriteHeight);
    }
    ctx.restore();

    if (distance < 52 || joe.mode !== "patrol") {
      const label =
        joe.wet
          ? "JOE: MOWER BOGGED"
          : joe.sand
            ? "JOE: SAND CHURN"
          : joe.mode === "chase"
          ? "JOE: PURSUING"
          : joe.mode === "investigate"
            ? "JOE: DISTRACTED"
            : joe.mode === "search"
              ? "JOE: SEARCHING"
              : "JOE: PATROLLING";
      drawText(
        label,
        point.x,
        point.y + 27 * labelScale,
        12,
        joe.wet
          ? "#8fd7ca"
          : joe.sand
            ? "#e2b66f"
          : joe.mode === "chase"
            ? "#ff7045"
            : "#d3bc6d",
        "center",
        true,
      );
    }
  }

  function drawCourseMiniMap() {
    const panel = { x: WIDTH - 274, y: 176, width: 234, height: 238 };
    const mapTop = panel.y + 41;
    const mapBottom = panel.y + panel.height - 18;
    const mapPoint = (worldX, worldY) => ({
      x: panel.x + panel.width * 0.5 + worldX / 224 * (panel.width - 28),
      y: mapBottom - worldY / COURSE_LENGTH * (mapBottom - mapTop),
    });
    const playerPoint = mapPoint(state.player.x, state.player.y);
    const key = activeKeyPoint();
    const sprinkler = activeSprinklerPoint();
    const changeRequest =
      activeChangeRequest();
    const keyPoint = mapPoint(key.x, key.y);
    const sprinklerPoint = mapPoint(
      sprinkler.x,
      sprinkler.y,
    );
    const changeRequestPoint =
      mapPoint(
        changeRequest.x,
        changeRequest.y,
      );
    const shedPoint = mapPoint(SHED_EXIT.x, SHED_EXIT.y);
    const drainPoint = mapPoint(DRAIN_EXIT.x, DRAIN_EXIT.y);

    ctx.fillStyle = "rgba(2,8,5,0.86)";
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    strokeRect(panel.x, panel.y, panel.width, panel.height, "#566a45", 2);
    drawText("COURSE MAP", panel.x + 14, panel.y + 23, 13, "#dce4ce", "left", true);

    ctx.fillStyle = "#0a1b10";
    ctx.fillRect(panel.x + 13, panel.y + 33, panel.width - 26, panel.height - 47);
    for (let index = 1; index < COURSE_ZONES.length; index += 1) {
      const zoneY = mapPoint(0, COURSE_ZONES[index].start).y;
      ctx.strokeStyle = "rgba(164,178,125,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(panel.x + 14, zoneY);
      ctx.lineTo(panel.x + panel.width - 14, zoneY);
      ctx.stroke();
    }
    ctx.fillStyle = "#294426";
    polygon([
      [panel.x + panel.width * 0.43, panel.y + panel.height - 14],
      [panel.x + panel.width * 0.57, panel.y + panel.height - 14],
      [panel.x + panel.width * 0.69, panel.y + 41],
      [panel.x + panel.width * 0.31, panel.y + 41],
    ]);
    const mapScaleX =
      (panel.width - 28) / 224;
    const mapScaleY =
      (mapBottom - mapTop) /
      COURSE_LENGTH;
    for (
      let index = 0;
      index < BUNKER_SAND_ZONES.length;
      index += 1
    ) {
      const sandZone =
        BUNKER_SAND_ZONES[index];
      const sandPoint =
        mapPoint(
          sandZone.x,
          sandZone.y,
        );
      const active =
        state.hole.environment
          ?.sandZone?.id ===
          sandZone.id &&
        state.hole.environment.sand;
      ctx.fillStyle = active
        ? "rgba(214,164,82,0.68)"
        : "rgba(145,106,55,0.48)";
      ctx.beginPath();
      ctx.ellipse(
        sandPoint.x,
        sandPoint.y,
        Math.max(
          3,
          sandZone.radiusX *
            mapScaleX,
        ),
        Math.max(
          2,
          sandZone.radiusY *
            mapScaleY,
        ),
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle =
        active
          ? "#e5bd72"
          : "#745b37";
      ctx.lineWidth =
        active ? 2 : 1;
      ctx.stroke();
    }
    if (state.hole.sprinklerSoakTimer > 0) {
      const wetAlpha = clamp(
        state.hole.sprinklerSoakTimer / 3.5,
        0,
        1,
      );
      ctx.fillStyle =
        `rgba(55,137,132,${0.34 * wetAlpha})`;
      ctx.strokeStyle =
        `rgba(137,216,203,${0.72 * wetAlpha})`;
      ctx.lineWidth = 1.5;
      for (
        let index = 0;
        index < SPRINKLER_SOAK_ZONES.length;
        index += 1
      ) {
        const zone = SPRINKLER_SOAK_ZONES[index];
        const zonePoint = mapPoint(
          zone.x,
          zone.y,
        );
        const radiusX =
          zone.radius /
          0.72 /
          224 *
          (panel.width - 28);
        const radiusY =
          zone.radius /
          COURSE_LENGTH *
          (mapBottom - mapTop);
        ctx.beginPath();
        ctx.ellipse(
          zonePoint.x,
          zonePoint.y,
          radiusX,
          radiusY,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.stroke();
      }
      drawText(
        `WATER ${Math.ceil(state.hole.sprinklerSoakTimer)}s`,
        panel.x + panel.width - 14,
        panel.y + 23,
        10,
        "#8fd4ca",
        "right",
        true,
      );
    }
    ctx.fillStyle = "#101c12";
    for (let index = 0; index < COURSE_OBSTACLES.length; index += 1) {
      if (COURSE_OBSTACLES[index].draw === false) {
        continue;
      }
      const obstaclePoint = mapPoint(COURSE_OBSTACLES[index].x, COURSE_OBSTACLES[index].y);
      ctx.beginPath();
      ctx.arc(obstaclePoint.x, obstaclePoint.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(161,145,61,0.55)";
    for (
      let index = 0;
      index < state.hole.turfMarks.length;
      index += 1
    ) {
      const mark = state.hole.turfMarks[index];
      if (mark.kind !== "mowed") {
        continue;
      }
      const cutPoint = mapPoint(mark.x, mark.y);
      ctx.fillRect(
        cutPoint.x - 1.5,
        cutPoint.y - 1,
        3,
        2,
      );
    }
    ctx.fillStyle = "#d0a95b";
    ctx.fillRect(shedPoint.x - 6, shedPoint.y - 5, 12, 10);
    ctx.strokeStyle = state.hole.drainUnlocked ? "#74c9ac" : "#687268";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(drainPoint.x, drainPoint.y, 5, 0, Math.PI * 2);
    if (state.hole.drainUnlocked) {
      ctx.fillStyle = "#4a947c";
      ctx.fill();
    }
    ctx.stroke();
    if (!state.hole.keyCollected) {
      ctx.fillStyle = "#f0bd4f";
      ctx.fillRect(keyPoint.x - 4, keyPoint.y - 4, 8, 8);
    }
    if (!state.hole.sprinklerUsed) {
      ctx.strokeStyle = "#6fc0bb";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sprinklerPoint.x, sprinklerPoint.y, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (
      !state.hole.changeRequestCollected
    ) {
      ctx.fillStyle = "#d96532";
      polygon([
        [
          changeRequestPoint.x,
          changeRequestPoint.y - 5,
        ],
        [
          changeRequestPoint.x + 5,
          changeRequestPoint.y,
        ],
        [
          changeRequestPoint.x,
          changeRequestPoint.y + 5,
        ],
        [
          changeRequestPoint.x - 5,
          changeRequestPoint.y,
        ],
      ]);
      ctx.strokeStyle = "#f1b16e";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        changeRequestPoint.x - 4,
        changeRequestPoint.y - 4,
        8,
        8,
      );
    }
    for (
      let index = 0;
      index <
      state.hole.recoverableBalls.length;
      index += 1
    ) {
      const ball =
        state.hole.recoverableBalls[index];
      const ballPoint = mapPoint(
        ball.x,
        ball.y,
      );
      const danger =
        golfBallDangerState(ball);
      ctx.fillStyle = ball.wet
        ? "#b7e0d5"
        : "#eee6c7";
      ctx.beginPath();
      ctx.arc(
        ballPoint.x,
        ballPoint.y,
        danger.dangerous ? 3.2 : 2.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      if (danger.dangerous) {
        ctx.strokeStyle =
          "rgba(222,132,62,0.8)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
          ballPoint.x,
          ballPoint.y,
          5.5,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }
    if (state.hole.focus) {
      for (
        let index = 0;
        index < state.hole.turfMarks.length;
        index += 1
      ) {
        const mark = state.hole.turfMarks[index];
        if (
          mark.kind !== "track" &&
          mark.kind !== "divot"
        ) {
          continue;
        }
        const turfPoint = mapPoint(mark.x, mark.y);
        ctx.fillStyle =
          mark.kind === "divot"
            ? "#bd8b3d"
            : mark.discovered
              ? "#d66137"
              : "rgba(205,184,91,0.72)";
        ctx.fillRect(
          turfPoint.x - 1.5,
          turfPoint.y - 1.5,
          3,
          3,
        );
      }
    }
    const shotTarget =
      state.hole.ballAim.target ||
      state.hole.ballFlight?.target ||
      (state.hole.distractionTimer > 0
        ? state.hole.distraction
        : null);
    if (shotTarget) {
      const shotPoint = mapPoint(
        shotTarget.x,
        shotTarget.y,
      );
      const aiming =
        state.hole.ballAim.active;
      const inFlight =
        Boolean(state.hole.ballFlight);
      ctx.strokeStyle = aiming
        ? "#f0cf65"
        : inFlight
          ? "#eee7c9"
          : "#c9863f";
      ctx.lineWidth = aiming ? 2 : 1.5;
      ctx.setLineDash(
        aiming ? [4, 4] : [2, 4],
      );
      ctx.beginPath();
      ctx.moveTo(
        playerPoint.x,
        playerPoint.y,
      );
      ctx.lineTo(
        shotPoint.x,
        shotPoint.y,
      );
      ctx.stroke();
      ctx.setLineDash([]);
      const shotPulse =
        5 +
        (state.reducedMotion
          ? 0
          : Math.sin(state.time * 8) * 1.2);
      ctx.beginPath();
      ctx.arc(
        shotPoint.x,
        shotPoint.y,
        shotPulse,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      if (inFlight) {
        const flightProgress = clamp(
          state.hole.ballFlight.elapsed /
            state.hole.ballFlight.duration,
          0,
          1,
        );
        ctx.fillStyle = "#f2efd7";
        ctx.beginPath();
        ctx.arc(
          lerp(
            playerPoint.x,
            shotPoint.x,
            flightProgress,
          ),
          lerp(
            playerPoint.y,
            shotPoint.y,
            flightProgress,
          ),
          3,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
    const joeVisible =
      state.hole.joe.mode === "chase" ||
      worldDistance(state.hole.joe, state.player) < 42;
    if (joeVisible) {
      const joePoint = mapPoint(state.hole.joe.x, state.hole.joe.y);
      ctx.fillStyle = state.hole.joe.mode === "chase" ? "#f25332" : "#b56d3a";
      ctx.beginPath();
      ctx.arc(joePoint.x, joePoint.y, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (state.hole.lastKnownJoe && state.hole.lastKnownJoeTimer > 0) {
      const lastPoint = mapPoint(state.hole.lastKnownJoe.x, state.hole.lastKnownJoe.y);
      const pulse = 5 + Math.sin(state.time * 5) * 1.5;
      ctx.strokeStyle = "rgba(199,124,61,0.65)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, pulse, 0, Math.PI * 2);
      ctx.stroke();
      drawText("LAST SIGNAL", panel.x + panel.width - 13, panel.y + 23, 9, "#b98655", "right");
    }
    ctx.fillStyle = "#f2f0d9";
    polygon([
      [playerPoint.x, playerPoint.y - 7],
      [playerPoint.x - 6, playerPoint.y + 6],
      [playerPoint.x + 6, playerPoint.y + 6],
    ]);
    drawText("YOU", playerPoint.x + 10, playerPoint.y + 4, 10, "#e7ead7", "left", true);
  }

  function drawMovementFeedback(walkBob) {
    const input = movementInput();
    const left =
      input.x < -0.12 ||
      (state.hole.moveHintTimer > 0 && state.hole.moveVector.x < 0);
    const right =
      input.x > 0.12 ||
      (state.hole.moveHintTimer > 0 && state.hole.moveVector.x > 0);
    const forward =
      input.y > 0.12 ||
      (state.hole.moveHintTimer > 0 && state.hole.moveVector.y > 0);
    const back =
      input.y < -0.12 ||
      (state.hole.moveHintTimer > 0 && state.hole.moveVector.y < 0);
    if (!left && !right && !forward && !back) {
      return;
    }

    const centerX = WIDTH * 0.5;
    const centerY = HEIGHT * 0.52 + walkBob;
    const pulse = 0.55 + (Math.sin(state.time * 10) + 1) * 0.2;
    ctx.strokeStyle = `rgba(226,210,148,${pulse})`;
    ctx.lineWidth = 3;
    if (forward) {
      ctx.beginPath();
      ctx.moveTo(centerX - 14, centerY - 30);
      ctx.lineTo(centerX, centerY - 44);
      ctx.lineTo(centerX + 14, centerY - 30);
      ctx.stroke();
    }
    if (back) {
      ctx.beginPath();
      ctx.moveTo(centerX - 14, centerY + 30);
      ctx.lineTo(centerX, centerY + 44);
      ctx.lineTo(centerX + 14, centerY + 30);
      ctx.stroke();
    }
    if (left) {
      ctx.beginPath();
      ctx.moveTo(centerX - 30, centerY - 14);
      ctx.lineTo(centerX - 44, centerY);
      ctx.lineTo(centerX - 30, centerY + 14);
      ctx.stroke();
    }
    if (right) {
      ctx.beginPath();
      ctx.moveTo(centerX + 30, centerY - 14);
      ctx.lineTo(centerX + 44, centerY);
      ctx.lineTo(centerX + 30, centerY + 14);
      ctx.stroke();
    }
    const motionLabel = state.hole.environment?.sand
      ? state.hole.crouched
        ? "CROUCHING IN SAND — TRACKED"
        : sprintHeld()
          ? "SPRINTING IN SAND — VERY LOUD"
          : "WADING BUNKER SAND"
      : state.hole.crouched
      ? "CROUCH WALK — QUIET"
      : sprintHeld()
        ? "SPRINTING — LOUD"
        : "MOVING";
    drawText(motionLabel, centerX, centerY + 68, 12, "#dfd29c", "center", true);
  }

  function drawWorldEffects() {
    const hole = state.hole;
    for (const effect of hole.worldEffects) {
      const point = worldToScreen(effect.x, effect.y);
      if (!point.visible || point.x < -140 || point.x > WIDTH + 140) {
        continue;
      }
      const progress = clamp(effect.age / effect.duration, 0, 1);
      const alpha = 1 - smoothstep(progress);
      const scale = clamp(point.scale, 0.62, 1.8);
      ctx.save();
      if (effect.kind === "sound") {
        ctx.strokeStyle = `rgba(226,178,76,${0.68 * alpha})`;
        ctx.lineWidth = Math.max(1, 3 * scale * (1 - progress * 0.5));
        for (let ring = 0; ring < 3; ring += 1) {
          const radius = (18 + ring * 15 + progress * 64) * scale;
          ctx.beginPath();
          ctx.ellipse(point.x, point.y - 5 * scale, radius, radius * 0.34, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (effect.kind === "ball_impact") {
        const impact =
          1 - smoothstep(progress);
        const impactX = clamp(
          point.x,
          492,
          WIDTH - 326,
        );
        ctx.fillStyle = `rgba(238,231,196,${impact})`;
        ctx.fillRect(
          Math.round(impactX - 3 * scale),
          Math.round(point.y - 7 * scale),
          Math.max(3, Math.round(6 * scale)),
          Math.max(3, Math.round(6 * scale)),
        );
        ctx.strokeStyle = `rgba(231,185,77,${impact * 0.86})`;
        ctx.lineWidth = Math.max(1, 2 * scale);
        for (let ray = 0; ray < 8; ray += 1) {
          const angle =
            ray / 8 * Math.PI * 2;
          const reach =
            (12 + progress * 38) * scale;
          ctx.beginPath();
          ctx.moveTo(
            impactX +
              Math.cos(angle) * 7 * scale,
            point.y -
              4 * scale +
              Math.sin(angle) * 3 * scale,
          );
          ctx.lineTo(
            impactX + Math.cos(angle) * reach,
            point.y -
              4 * scale +
              Math.sin(angle) * reach * 0.42,
          );
          ctx.stroke();
        }
      } else if (effect.kind === "trail_found") {
        ctx.strokeStyle = `rgba(219,91,48,${0.82 * alpha})`;
        ctx.lineWidth = Math.max(1, 3 * scale);
        for (let ring = 0; ring < 3; ring += 1) {
          const radius =
            (12 + ring * 10 + progress * 34) *
            scale;
          ctx.beginPath();
          ctx.ellipse(
            point.x,
            point.y,
            radius,
            radius * 0.24,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
      } else if (effect.kind === "sprinkler") {
        ctx.strokeStyle = `rgba(122,205,202,${0.58 * Math.min(1, effect.age * 2) * alpha})`;
        ctx.lineWidth = Math.max(1, 2 * scale);
        for (let stream = 0; stream < 7; stream += 1) {
          const phase = effect.age * 2.8 + stream * 0.62;
          const reach = (42 + stream * 8) * scale;
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.quadraticCurveTo(
            point.x + Math.cos(phase) * reach * 0.62,
            point.y - (50 + stream * 5) * scale,
            point.x + Math.cos(phase) * reach,
            point.y - 4 * scale,
          );
          ctx.stroke();
        }
      } else if (effect.kind === "mower_sputter") {
        ctx.strokeStyle =
          `rgba(118,205,196,${0.76 * alpha})`;
        ctx.lineWidth = Math.max(1, 2 * scale);
        for (let splash = 0; splash < 9; splash += 1) {
          const splashSeed =
            hash(effect.seed + splash * 27.4);
          const side =
            splash % 2 === 0 ? -1 : 1;
          const reach =
            (12 + splashSeed * 36 + progress * 22) *
            scale;
          ctx.beginPath();
          ctx.moveTo(
            point.x + side * 5 * scale,
            point.y - 2 * scale,
          );
          ctx.quadraticCurveTo(
            point.x + side * reach * 0.56,
            point.y -
              (18 + splashSeed * 22) *
                scale,
            point.x + side * reach,
            point.y + 2 * scale,
          );
          ctx.stroke();
        }
        ctx.fillStyle =
          `rgba(212,233,213,${0.42 * alpha})`;
        for (let puff = 0; puff < 4; puff += 1) {
          const puffSize =
            (5 + puff * 4 + progress * 13) *
            scale;
          ctx.beginPath();
          ctx.arc(
            point.x +
              (puff - 1.5) *
                8 *
                scale,
            point.y -
              (38 + puff * 6 + progress * 28) *
                scale,
            puffSize,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      } else if (
        effect.kind === "sand_entry" ||
        effect.kind === "sand_churn"
      ) {
        const churn =
          effect.kind ===
          "sand_churn";
        const particleCount =
          churn ? 18 : 11;
        ctx.strokeStyle =
          `rgba(218,170,94,${0.58 * alpha})`;
        ctx.lineWidth = Math.max(
          1,
          2 * scale,
        );
        for (
          let arc = 0;
          arc < (churn ? 4 : 2);
          arc += 1
        ) {
          const radius =
            (
              10 +
              arc * 12 +
              progress *
                (churn ? 58 : 34)
            ) *
            scale;
          ctx.beginPath();
          ctx.ellipse(
            point.x,
            point.y,
            radius,
            radius * 0.22,
            0,
            Math.PI * 1.08,
            Math.PI * 1.92,
          );
          ctx.stroke();
        }
        for (
          let dust = 0;
          dust < particleCount;
          dust += 1
        ) {
          const dustSeed =
            hash(
              effect.seed +
                dust * 31.7,
            );
          const side =
            dust % 2 === 0
              ? -1
              : 1;
          const spread =
            (
              10 +
              dustSeed *
                (churn ? 70 : 42)
            ) *
            progress *
            scale;
          const lift =
            (
              8 +
              hash(
                dustSeed * 43,
              ) *
                (churn ? 54 : 30)
            ) *
            Math.sin(
              progress * Math.PI,
            ) *
            scale;
          const size =
            Math.max(
              1,
              (
                2 +
                hash(
                  dustSeed * 79,
                ) *
                  4
              ) *
                scale *
                (1 - progress * 0.45),
            );
          ctx.fillStyle =
            dust % 4 === 0
              ? `rgba(235,205,137,${0.72 * alpha})`
              : `rgba(139,98,50,${0.66 * alpha})`;
          ctx.fillRect(
            Math.round(
              point.x +
                side * spread,
            ),
            Math.round(
              point.y - lift,
            ),
            Math.ceil(size),
            Math.ceil(
              size * 0.72,
            ),
          );
        }
      } else if (effect.kind === "ball_recovered") {
        ctx.strokeStyle =
          `rgba(244,220,139,${alpha})`;
        ctx.lineWidth = Math.max(
          1,
          2 * scale,
        );
        for (
          let ring = 0;
          ring < 3;
          ring += 1
        ) {
          const radius =
            (8 +
              ring * 9 +
              progress * 34) *
            scale;
          ctx.beginPath();
          ctx.ellipse(
            point.x,
            point.y -
              progress * 18 * scale,
            radius,
            radius * 0.34,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
        ctx.fillStyle =
          `rgba(248,236,191,${alpha})`;
        ctx.beginPath();
        ctx.arc(
          point.x,
          point.y -
            (8 + progress * 34) *
              scale,
          Math.max(
            2,
            4 * scale,
          ),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      } else if (effect.kind === "change_request") {
        ctx.strokeStyle =
          `rgba(238,124,62,${0.82 * alpha})`;
        ctx.lineWidth = Math.max(
          1,
          2 * scale,
        );
        for (
          let ray = 0;
          ray < 10;
          ray += 1
        ) {
          const angle =
            ray / 10 *
              Math.PI *
              2 +
            effect.seed;
          const reach =
            (14 +
              progress * 56 +
              ray * 1.5) *
            scale;
          ctx.beginPath();
          ctx.moveTo(
            point.x +
              Math.cos(angle) *
                8 *
                scale,
            point.y -
              16 *
                scale +
              Math.sin(angle) *
                4 *
                scale,
          );
          ctx.lineTo(
            point.x +
              Math.cos(angle) *
                reach,
            point.y -
              16 *
                scale +
              Math.sin(angle) *
                reach *
                0.5,
          );
          ctx.stroke();
        }
        for (
          let page = 0;
          page < 7;
          page += 1
        ) {
          const pageSeed =
            hash(
              effect.seed +
                page * 31.7,
            );
          const direction =
            page % 2 === 0 ? -1 : 1;
          const pageX =
            point.x +
            direction *
              (12 +
                pageSeed * 48 +
                progress * 24) *
              scale;
          const pageY =
            point.y -
            (18 +
              pageSeed * 28 +
              progress *
                (24 + page * 3)) *
              scale;
          const pageWidth =
            (5 + pageSeed * 5) *
            scale;
          ctx.fillStyle =
            `rgba(235,222,184,${alpha})`;
          ctx.fillRect(
            pageX,
            pageY,
            pageWidth,
            pageWidth * 0.72,
          );
        }
      } else if (effect.kind === "pickup") {
        ctx.strokeStyle = `rgba(255,214,108,${alpha})`;
        ctx.lineWidth = 2;
        for (let ray = 0; ray < 10; ray += 1) {
          const angle = ray / 10 * Math.PI * 2 + effect.seed;
          const inner = 12 * scale;
          const outer = (28 + progress * 54) * scale;
          ctx.beginPath();
          ctx.moveTo(point.x + Math.cos(angle) * inner, point.y + Math.sin(angle) * inner);
          ctx.lineTo(point.x + Math.cos(angle) * outer, point.y + Math.sin(angle) * outer);
          ctx.stroke();
        }
      } else if (effect.kind === "drain_open") {
        ctx.strokeStyle = `rgba(111,214,180,${alpha})`;
        ctx.lineWidth = Math.max(1, 3 * scale);
        for (let ring = 0; ring < 4; ring += 1) {
          const radius = (16 + ring * 13 + progress * 52) * scale;
          ctx.beginPath();
          ctx.ellipse(point.x, point.y - 18 * scale, radius, radius * 0.52, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (effect.kind === "power_sag") {
        const power = floodlightPower();
        ctx.strokeStyle = `rgba(241,164,64,${(0.28 + power * 0.5) * alpha})`;
        ctx.lineWidth = Math.max(1, 2.5 * scale);
        for (let spark = 0; spark < 8; spark += 1) {
          const sparkSeed =
            hash(effect.seed + spark * 19.7);
          const angle =
            sparkSeed * Math.PI * 2;
          const reach =
            (18 + progress * 42 + spark * 2) *
            scale;
          ctx.beginPath();
          ctx.moveTo(
            point.x,
            point.y - 78 * scale,
          );
          ctx.lineTo(
            point.x + Math.cos(angle) * reach,
            point.y -
              78 * scale +
              Math.sin(angle) * reach * 0.62,
          );
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    for (const particle of hole.screenParticles) {
      const alpha = 1 - smoothstep(particle.age / particle.duration);
      ctx.fillStyle = `${particle.color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
      ctx.fillRect(
        Math.round(particle.x),
        Math.round(particle.y),
        Math.max(1, Math.round(particle.size)),
        Math.max(2, Math.round(particle.size * 2.2)),
      );
    }
  }

  function drawGolfBallTactics() {
    const hole = state.hole;
    const flight = hole.ballFlight;
    if (flight) {
      const progress = clamp(
        flight.elapsed / flight.duration,
        0,
        1,
      );
      const targetPoint = worldToScreen(
        flight.target.x,
        flight.target.y,
      );
      const startX = WIDTH * 0.5;
      const startY = HEIGHT * 0.75;
      const targetX = clamp(
        targetPoint.x,
        492,
        WIDTH - 326,
      );
      const targetY = clamp(
        targetPoint.y,
        122,
        HEIGHT * 0.69,
      );
      const controlX =
        lerp(startX, targetX, 0.48);
      const controlY =
        Math.min(startY, targetY) -
        116 -
        flight.power * 38;
      const inverse = 1 - progress;
      const ballX =
        inverse * inverse * startX +
        2 *
          inverse *
          progress *
          controlX +
        progress * progress * targetX;
      const ballY =
        inverse * inverse * startY +
        2 *
          inverse *
          progress *
          controlY +
        progress * progress * targetY;
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.34)";
      ctx.beginPath();
      ctx.ellipse(
        targetX,
        targetY + 3,
        14,
        5,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowColor = "rgba(247,231,172,0.9)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#f0e8c9";
      ctx.beginPath();
      ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      drawText(
        "BALL IN FLIGHT",
        WIDTH * 0.5,
        516,
        11,
        "#d9c77e",
        "center",
        true,
      );
      ctx.restore();
    }

    if (!hole.ballAim.active) {
      return;
    }

    const target =
      hole.ballAim.target ||
      golfBallAimTarget();
    const targetPoint = worldToScreen(
      target.x,
      target.y,
    );
    const targetX = clamp(
      targetPoint.x,
      492,
      WIDTH - 326,
    );
    const targetY = clamp(
      targetPoint.y,
      112,
      HEIGHT * 0.68,
    );
    const startX = WIDTH * 0.5;
    const startY = HEIGHT * 0.73;
    const controlX =
      lerp(startX, targetX, 0.48);
    const controlY =
      Math.min(startY, targetY) -
      102 -
      hole.ballAim.power * 42;
    const actualDistance = Math.round(
      worldDistance(state.player, target),
    );
    const pulse = state.reducedMotion
      ? 0.8
      : 0.68 +
        Math.sin(state.time * 7.2) * 0.16;

    ctx.save();
    const focusShade = ctx.createRadialGradient(
      WIDTH * 0.5,
      HEIGHT * 0.5,
      90,
      WIDTH * 0.5,
      HEIGHT * 0.5,
      520,
    );
    focusShade.addColorStop(
      0,
      "rgba(3,10,6,0)",
    );
    focusShade.addColorStop(
      1,
      "rgba(1,5,3,0.3)",
    );
    ctx.fillStyle = focusShade;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = `rgba(238,202,102,${pulse})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.ellipse(
      targetX,
      targetY,
      28,
      11,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(targetX - 10, targetY);
    ctx.lineTo(targetX + 10, targetY);
    ctx.moveTo(targetX, targetY - 10);
    ctx.lineTo(targetX, targetY + 10);
    ctx.stroke();

    for (let index = 1; index < 13; index += 1) {
      const amount = index / 13;
      const inverse = 1 - amount;
      const x =
        inverse * inverse * startX +
        2 * inverse * amount * controlX +
        amount * amount * targetX;
      const y =
        inverse * inverse * startY +
        2 * inverse * amount * controlY +
        amount * amount * targetY;
      ctx.globalAlpha =
        0.28 + amount * 0.66;
      ctx.fillStyle =
        index % 3 === 0
          ? "#f3d77e"
          : "#d7dfc5";
      ctx.beginPath();
      ctx.arc(
        x,
        y,
        2 + amount * 2.2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const panel = {
      x: WIDTH * 0.5 - 210,
      y: 538,
      width: 420,
      height: 104,
    };
    ctx.fillStyle = "rgba(2,10,6,0.94)";
    ctx.fillRect(
      panel.x,
      panel.y,
      panel.width,
      panel.height,
    );
    strokeRect(
      panel.x,
      panel.y,
      panel.width,
      panel.height,
      "#d09b48",
      2,
    );
    drawText(
      `CHIP SHOT  //  LANDING ${actualDistance}m`,
      WIDTH * 0.5,
      panel.y + 24,
      13,
      "#f0e4bd",
      "center",
      true,
    );
    ctx.fillStyle = "#172219";
    ctx.fillRect(
      panel.x + 34,
      panel.y + 36,
      panel.width - 68,
      13,
    );
    ctx.fillStyle =
      hole.ballAim.power > 0.82
        ? "#e4a24d"
        : "#9bb65f";
    ctx.fillRect(
      panel.x + 34,
      panel.y + 36,
      (panel.width - 68) *
        hole.ballAim.power,
      13,
    );
    strokeRect(
      panel.x + 34,
      panel.y + 36,
      panel.width - 68,
      13,
      "#778764",
      1,
    );
    drawText(
      inputCopy(
        "A / D AIM  •  RELEASE SPACE TO CHIP  •  ESC CANCEL",
        "STICK L/R AIM  •  RELEASE X TO CHIP  •  B CANCEL",
        "SLIDE CHIP BUTTON TO AIM  •  RELEASE TO CHIP",
      ),
      WIDTH * 0.5,
      panel.y + 71,
      11,
      "#ead79e",
      "center",
      true,
    );
    drawText(
      "JOE KEEPS MOVING WHILE YOU LINE UP THE SHOT.",
      WIDTH * 0.5,
      panel.y + 91,
      10,
      "#c27443",
      "center",
    );
    ctx.restore();
  }

  function drawPursuitEffects() {
    const hole = state.hole;
    const distance = worldDistance(hole.joe, state.player);
    const proximity = clamp(1 - distance / 76, 0, 1);
    const chase = hole.joe.mode === "chase" ? 1 : 0;
    const pressure = clamp(
      proximity * 0.42 +
        hole.detection * 0.5 +
        chase * 0.34,
      0,
      1,
    );
    if (pressure <= 0.04 && hole.detectionPulse <= 0.01) {
      return;
    }

    const pulse = state.reducedMotion
      ? 0.76
      : 0.72 + Math.sin(state.time * (3.2 + pressure * 3.8)) * 0.13;
    const vignette = ctx.createRadialGradient(
      WIDTH * 0.5,
      HEIGHT * 0.48,
      HEIGHT * 0.19,
      WIDTH * 0.5,
      HEIGHT * 0.48,
      HEIGHT * 0.83,
    );
    vignette.addColorStop(0, "rgba(62,4,0,0)");
    vignette.addColorStop(0.66, `rgba(62,8,2,${pressure * 0.06})`);
    vignette.addColorStop(1, `rgba(76,5,0,${pressure * 0.34 * pulse + hole.detectionPulse * 0.16})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (chase && !state.reducedMotion) {
      ctx.save();
      ctx.strokeStyle = `rgba(225,169,96,${0.08 + pressure * 0.12})`;
      ctx.lineWidth = 2;
      for (let index = 0; index < 16; index += 1) {
        const seed = hash(index * 73);
        const x = seed * WIDTH;
        const offset = (state.time * (120 + index * 3)) % 90;
        const y = HEIGHT * 0.48 + hash(index * 31) * HEIGHT * 0.5 + offset;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (x - WIDTH * 0.5) * 0.055, y + 18 + pressure * 18);
        ctx.stroke();
      }
      ctx.restore();
    }

    const direction = clamp((hole.joe.x - state.player.x) / 64, -1, 1);
    if (Math.abs(direction) > 0.28 && pressure > 0.28) {
      const edgeX = direction < 0 ? 13 : WIDTH - 13;
      const edgeGradient = ctx.createLinearGradient(
        direction < 0 ? 0 : WIDTH,
        0,
        direction < 0 ? 62 : WIDTH - 62,
        0,
      );
      edgeGradient.addColorStop(0, `rgba(221,67,31,${pressure * 0.38})`);
      edgeGradient.addColorStop(1, "rgba(221,67,31,0)");
      ctx.fillStyle = edgeGradient;
      ctx.fillRect(direction < 0 ? 0 : WIDTH - 62, HEIGHT * 0.2, 62, HEIGHT * 0.6);
      ctx.fillStyle = `rgba(255,178,106,${pressure * pulse})`;
      polygon(direction < 0
        ? [[edgeX + 13, HEIGHT * 0.5 - 10], [edgeX, HEIGHT * 0.5], [edgeX + 13, HEIGHT * 0.5 + 10]]
        : [[edgeX - 13, HEIGHT * 0.5 - 10], [edgeX, HEIGHT * 0.5], [edgeX - 13, HEIGHT * 0.5 + 10]]);
    }
  }

  function drawSuspenseEffects() {
    const hole = state.hole;
    if (hole.blackoutTimer > 0) {
      const power = floodlightPower();
      const blackout = 1 - power;
      ctx.fillStyle = `rgba(0,4,5,${blackout * 0.38})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = `rgba(220,145,52,${blackout * 0.2})`;
      ctx.lineWidth = 2;
      for (let index = 0; index < 9; index += 1) {
        const y =
          82 +
          hash(
            Math.floor(hole.elapsed * 11) +
              index * 29,
          ) *
            (HEIGHT - 164);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y + 2);
        ctx.stroke();
      }
    }
    if (hole.dreadTimer > 0) {
      const progress =
        1 - hole.dreadTimer / 5.2;
      const pulse = state.reducedMotion
        ? 0.72
        : 0.62 +
          Math.sin(state.time * 4.8) * 0.16;
      const dread = ctx.createLinearGradient(
        0,
        HEIGHT * 0.48,
        0,
        HEIGHT,
      );
      dread.addColorStop(0, "rgba(52,8,2,0)");
      dread.addColorStop(
        1,
        `rgba(74,9,2,${
          (1 - smoothstep(progress)) *
          0.24 *
          pulse
        })`,
      );
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  function drawConcealmentEffects() {
    const hole = state.hole;
    const concealment = hole.concealment;
    if (concealment <= 0.02 && !hole.crouched) {
      return;
    }
    const strength = Math.max(concealment, hole.crouched ? 0.12 : 0);
    const vignette = ctx.createRadialGradient(
      WIDTH * 0.5,
      HEIGHT * 0.5,
      HEIGHT * 0.25,
      WIDTH * 0.5,
      HEIGHT * 0.52,
      HEIGHT * 0.82,
    );
    vignette.addColorStop(0, "rgba(4,24,11,0)");
    vignette.addColorStop(0.65, `rgba(6,29,12,${strength * 0.08})`);
    vignette.addColorStop(1, `rgba(2,18,7,${strength * 0.42})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (concealment > 0.18) {
      ctx.save();
      ctx.strokeStyle = `rgba(80,111,51,${concealment * 0.58})`;
      ctx.lineWidth = 3;
      for (let index = 0; index < 30; index += 1) {
        const side = index % 2 === 0 ? -1 : 1;
        const baseX = side < 0
          ? hash(index * 17) * 150
          : WIDTH - hash(index * 17) * 150;
        const baseY = HEIGHT - hash(index * 37) * 230;
        const sway = state.reducedMotion ? 0 : Math.sin(state.time * 1.5 + index) * 8;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY + 88);
        ctx.quadraticCurveTo(
          baseX + side * 18 + sway,
          baseY + 34,
          baseX + side * 34 + sway,
          baseY,
        );
        ctx.stroke();
      }
      ctx.restore();
    }

    if (concealment > 0.62) {
      const alpha = clamp((concealment - 0.62) / 0.3, 0, 1);
      const hardCover =
        Boolean(hole.environment?.hardCover);
      const concealmentLabel = hardCover
        ? "HARD COVER — VISUAL BLOCKED"
        : "ROUGH CONCEALMENT — STAY STILL";
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(3,17,8,0.86)";
      ctx.fillRect(WIDTH * 0.5 - 154, HEIGHT * 0.52 + 72, 308, 32);
      strokeRect(WIDTH * 0.5 - 154, HEIGHT * 0.52 + 72, 308, 32, hardCover ? "#6f9e61" : "#9d8449", 2);
      drawText(concealmentLabel, WIDTH * 0.5, HEIGHT * 0.52 + 94, 12, hardCover ? "#c8deb5" : "#dec98f", "center", true);
      ctx.restore();
    }
  }

  function drawJoeStateBanner() {
    const hole = state.hole;
    if (hole.stateBannerTimer <= 0 || !hole.stateBanner) {
      return;
    }
    const visible = clamp(hole.stateBannerTimer * 2.2, 0, 1);
    const width = hole.joe.mode === "chase" ? 340 : 330;
    const bannerCenterX = WIDTH * 0.5 + 108;
    const x = bannerCenterX - width * 0.5;
    const y = hole.zoneBannerTimer > 0 ? 128 : 42;
    ctx.save();
    ctx.globalAlpha = visible;
    ctx.fillStyle = hole.joe.mode === "chase" ? "rgba(39,5,2,0.93)" : "rgba(3,13,7,0.91)";
    ctx.fillRect(x, y, width, 42);
    strokeRect(x, y, width, 42, hole.joe.mode === "chase" ? "#d04d28" : "#a4773f", 2);
    drawText(
      hole.stateBanner,
      bannerCenterX,
      y + 27,
      13,
      hole.joe.mode === "chase" ? "#ffbc83" : "#e2cf9c",
      "center",
      true,
    );
    ctx.restore();
  }

  function drawTutorialBriefing() {
    const variant = activeRunVariant();
    const overtime = state.hole.overtime;
    ctx.fillStyle = "rgba(0,3,1,0.78)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const panel = { x: 164, y: 76, width: 952, height: 568 };
    ctx.fillStyle = "rgba(3,14,8,0.97)";
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    strokeRect(panel.x, panel.y, panel.width, panel.height, "#d47431", 3);

    drawText(
      `${overtime ? "OVERTIME AUDIT" : "SURVIVAL BRIEFING"} // NIGHT ORDER ${String(variant.number).padStart(2, "0")}`,
      WIDTH * 0.5,
      129,
      32,
      "#f0efd8",
      "center",
      true,
    );
    drawText(
      overtime
        ? `${variant.name} // 2 BALLS • FASTER JOE • STRONGER EVIDENCE • SCORE ×1.30`
        : `${variant.name} // ${variant.briefing}`,
      WIDTH * 0.5,
      163,
      13,
      variant.accent,
      "center",
      true,
    );
    drawText(
      overtime
        ? "AFTER-HOURS TERMS ARE VOLUNTARY. JOE'S ESCALATION IS NOT."
        : "COURSE RECORDS VALUE STEALTH, SPEED, SAVED BALLS, AND SURVIVED CLOSE CALLS.",
      WIDTH * 0.5,
      184,
      10,
      "#82927f",
      "center",
    );

    const controllerActive = state.inputMethod === "gamepad";
    const touchActive = state.inputMethod === "touch";
    const cards = [
      {
        x: 220,
        icon: 0,
        number: "1",
        title: "CHOOSE AN EXIT",
        detail: "KEY → SHED  •  VALVE → DRAIN",
        subdetail: `OPTIONAL ◇ ${activeChangeRequest().code} +${CHANGE_REQUEST_BONUS}`,
      },
      {
        x: 500,
        icon: 1,
        number: "2",
        title: "AIM A CHIP SHOT",
        detail: touchActive
          ? "HOLD CHIP  •  SLIDE  •  RELEASE"
          : controllerActive
            ? "HOLD X  •  STICK  •  RELEASE"
            : "HOLD SPACE  •  A/D  •  RELEASE",
        subdetail: touchActive
          ? "TAP USE TO RECLAIM — IF JOE ALLOWS"
          : controllerActive
            ? "A RECLAIMS IT — IF JOE ALLOWS"
            : "ENTER RECLAIMS IT — IF JOE ALLOWS",
      },
      {
        x: 780,
        icon: 2,
        number: "3",
        title: "BREAK CONTACT",
        detail: touchActive
          ? "HOLD CROUCH  •  HOLD LISTEN"
          : controllerActive
            ? "LB CROUCH  •  LT LISTEN"
            : "C CROUCH  •  Q LISTEN",
        subdetail:
          "SAND SLOWS BOTH — YOUR TRACKS STAY",
      },
    ];
    for (const card of cards) {
      ctx.fillStyle = "rgba(10,28,15,0.94)";
      ctx.fillRect(card.x, 194, 242, 224);
      strokeRect(card.x, 194, 242, 224, "#50633e", 2);
      drawText(card.number, card.x + 22, 224, 19, "#d47431", "left", true);
      drawFieldIcon(card.icon, card.x + 121, 284, 112);
      drawText(card.title, card.x + 121, 370, 16, "#f0e8ce", "center", true);
      drawText(card.detail, card.x + 121, 398, 11, "#aebaa5", "center");
      if (card.subdetail) {
        drawText(
          card.subdetail,
          card.x + 121,
          413,
          9,
          "#d69a5c",
          "center",
          true,
        );
      }
    }

    drawText("MOVE", 278, 478, 13, "#8f9f85", "center");
    if (touchActive) {
      drawKeyCap("LEFT PAD", 278, 526, 112);
      drawText("HOLD RUN TO SPRINT — LOUD", 278, 579, 10, "#df8c47", "center");
    } else if (controllerActive) {
      drawKeyCap("L STICK", 278, 526, 112);
      drawText("D-PAD MOVES • RT SPRINTS", 278, 579, 10, "#df8c47", "center");
    } else {
      drawKeyCap("W", 278, 504, 42);
      drawKeyCap("A", 231, 551, 42);
      drawKeyCap("S", 278, 551, 42);
      drawKeyCap("D", 325, 551, 42);
      drawText("SHIFT SPRINTS — LOUD", 278, 579, 11, "#df8c47", "center");
    }

    drawText("CROUCH", 510, 478, 13, "#8f9f85", "center");
    drawKeyCap(
      touchActive
        ? "CROUCH"
        : controllerActive
          ? "LB"
          : "C",
      510,
      526,
      touchActive ? 104 : 70,
    );
    drawText("ROUGH HIDES YOU — BUT KEEPS TRACKS", 510, 579, 10, "#9fac96", "center");

    drawText("AIM / CHIP", 760, 478, 13, "#8f9f85", "center");
    drawKeyCap(
      touchActive
        ? "CHIP"
        : controllerActive
          ? "X"
          : "SPACE",
      760,
      526,
      112,
    );
    drawText("JOE FOLLOWS IT — RECLAIM WHEN CLEAR", 760, 579, 10, "#9fac96", "center");

    drawText("INTERACT", 979, 478, 13, "#8f9f85", "center");
    drawKeyCap(
      touchActive
        ? "USE"
        : controllerActive
          ? "A"
          : "ENTER",
      979,
      526,
      112,
    );
    drawText("USE KEY, VALVE, EXITS, LOST BALLS", 979, 579, 10, "#df8c47", "center");

    const pulse = 0.62 + (Math.sin(state.time * 4.2) + 1) * 0.18;
    ctx.globalAlpha = pulse;
    drawText(
      touchActive
        ? "TOUCH LEFT PAD OR TAP USE TO START"
        : controllerActive
          ? "MOVE LEFT STICK OR PRESS A TO START"
          : "PRESS A MOVEMENT KEY OR ENTER TO START",
      WIDTH * 0.5,
      621,
      16,
      "#ffe2a0",
      "center",
      true,
    );
    ctx.globalAlpha = 1;
  }

  function drawKeyCap(label, x, y, width) {
    ctx.fillStyle = "#17271a";
    ctx.fillRect(x - width * 0.5, y - 28, width, 42);
    strokeRect(x - width * 0.5, y - 28, width, 42, "#788a65", 2);
    drawText(label, x, y, 16, "#f0edd7", "center", true);
  }

  function drawListeningFocus() {
    if (!state.hole.focus) {
      return;
    }
    const environment = state.hole.environment || getPlayerEnvironmentState();
    const joeDeltaX = state.hole.joe.x - state.player.x;
    const joeDeltaY = state.hole.joe.y - state.player.y;
    const joeDistance = worldDistance(state.hole.joe, state.player);
    const angle = Math.atan2(joeDeltaX * 0.72, -joeDeltaY);
    const centerX = WIDTH * 0.5;
    const centerY = HEIGHT * 0.51;
    const radius = 116;
    const pulse = state.reducedMotion ? 0.76 : 0.68 + Math.sin(state.time * 5.2) * 0.16;

    ctx.save();
    const focusShade = ctx.createRadialGradient(
      centerX,
      centerY,
      65,
      centerX,
      centerY,
      520,
    );
    focusShade.addColorStop(0, "rgba(4,12,7,0)");
    focusShade.addColorStop(0.52, "rgba(4,12,7,0.16)");
    focusShade.addColorStop(1, "rgba(0,3,2,0.6)");
    ctx.fillStyle = focusShade;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = `rgba(224,197,111,${pulse})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 8]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const markerX = centerX + Math.sin(angle) * radius;
    const markerY = centerY - Math.cos(angle) * radius;
    ctx.fillStyle = joeDistance < 45 ? "#e65b37" : "#d2ae5b";
    ctx.beginPath();
    ctx.arc(markerX, markerY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(226,113,67,${pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(markerX, markerY, 13 + pulse * 5, 0, Math.PI * 2);
    ctx.stroke();

    let direction = "AHEAD";
    if (Math.abs(joeDeltaX) > Math.abs(joeDeltaY) * 0.7) {
      direction = joeDeltaX < 0 ? "LEFT" : "RIGHT";
    } else if (joeDeltaY < 0) {
      direction = "BEHIND";
    }
    drawText(
      `MOWER ${direction}  •  ${Math.round(joeDistance)}m`,
      centerX,
      centerY + radius + 34,
      13,
      joeDistance < 45 ? "#ff9867" : "#e5cf8c",
      "center",
      true,
    );

    if (environment.nearestCover) {
      const coverDeltaX = environment.nearestCover.x - state.player.x;
      const coverDeltaY = environment.nearestCover.y - state.player.y;
      const coverAngle = Math.atan2(coverDeltaX * 0.72, -coverDeltaY);
      const coverX = centerX + Math.sin(coverAngle) * (radius - 27);
      const coverY = centerY - Math.cos(coverAngle) * (radius - 27);
      ctx.strokeStyle = "#86b57b";
      ctx.lineWidth = 3;
      ctx.strokeRect(coverX - 6, coverY - 6, 12, 12);
      drawText(
        `COVER ${Math.max(0, Math.round(environment.nearestCoverDistance))}m`,
        coverX,
        coverY - 15,
        9,
        "#9bc58f",
        "center",
        true,
      );
    }
    if (
      state.hole.sprinklerSoakTimer > 0 &&
      environment.wetZone
    ) {
      const wetDeltaX =
        environment.wetZone.x -
        state.player.x;
      const wetDeltaY =
        environment.wetZone.y -
        state.player.y;
      const wetAngle = Math.atan2(
        wetDeltaX * 0.72,
        -wetDeltaY,
      );
      const wetX =
        centerX +
        Math.sin(wetAngle) *
          (radius - 63);
      const wetY =
        centerY -
        Math.cos(wetAngle) *
          (radius - 63);
      ctx.strokeStyle = "#78c8bd";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wetX, wetY, 6, 0, Math.PI * 2);
      ctx.stroke();
      drawText(
        environment.wet
          ? `IN WATER • ${Math.ceil(state.hole.sprinklerSoakTimer)}s`
          : `WET TURF ${Math.max(0, Math.round(environment.wetZoneEdgeDistance))}m`,
        wetX,
        wetY + 18,
        9,
        "#9ed8ce",
        "center",
        true,
      );
    }
    if (
      environment.sandZone &&
      (
        environment.sand ||
        environment.sandZoneEdgeDistance <
          90
      )
    ) {
      const sandDeltaX =
        environment.sandZone.x -
        state.player.x;
      const sandDeltaY =
        environment.sandZone.y -
        state.player.y;
      const sandAngle = Math.atan2(
        sandDeltaX * 0.72,
        -sandDeltaY,
      );
      const sandX =
        centerX +
        Math.sin(sandAngle) *
          (radius - 52);
      const sandY =
        centerY -
        Math.cos(sandAngle) *
          (radius - 52);
      ctx.strokeStyle =
        environment.sand
          ? "#e7bb6b"
          : "#9a7749";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(
        sandX,
        sandY,
        8,
        4,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      drawText(
        environment.sand
          ? "IN SAND • SPEED 72%"
          : `BUNKER ${Math.max(0, Math.round(environment.sandZoneEdgeDistance))}m`,
        sandX,
        sandY + 18,
        9,
        environment.sand
          ? "#edc57d"
          : "#ae8d5a",
        "center",
        true,
      );
    }
    const changeRequest =
      activeChangeRequest();
    const changeRequestDistance =
      worldDistance(
        state.player,
        changeRequest,
      );
    if (
      !state.hole.changeRequestCollected &&
      changeRequestDistance < 150
    ) {
      const requestDeltaX =
        changeRequest.x -
        state.player.x;
      const requestDeltaY =
        changeRequest.y -
        state.player.y;
      const requestAngle = Math.atan2(
        requestDeltaX * 0.72,
        -requestDeltaY,
      );
      const requestX =
        centerX +
        Math.sin(requestAngle) *
          (radius + 18);
      const requestY =
        centerY -
        Math.cos(requestAngle) *
          (radius + 18);
      ctx.fillStyle = "#d86232";
      polygon([
        [
          requestX,
          requestY - 7,
        ],
        [
          requestX + 7,
          requestY,
        ],
        [
          requestX,
          requestY + 7,
        ],
        [
          requestX - 7,
          requestY,
        ],
      ]);
      ctx.strokeStyle = "#efab6c";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        requestX - 6,
        requestY - 6,
        12,
        12,
      );
      drawText(
        `${changeRequest.code} ${Math.round(changeRequestDistance)}m`,
        requestX,
        requestY - 14,
        9,
        "#f0a466",
        "center",
        true,
      );
    }
    const nearestBall =
      nearestRecoverableBall();
    if (
      nearestBall.ball &&
      nearestBall.distance < 90
    ) {
      const ballDeltaX =
        nearestBall.ball.x -
        state.player.x;
      const ballDeltaY =
        nearestBall.ball.y -
        state.player.y;
      const ballAngle = Math.atan2(
        ballDeltaX * 0.72,
        -ballDeltaY,
      );
      const ballX =
        centerX +
        Math.sin(ballAngle) *
          (radius - 34);
      const ballY =
        centerY -
        Math.cos(ballAngle) *
          (radius - 34);
      const ballDanger =
        golfBallDangerState(
          nearestBall.ball,
        );
      ctx.fillStyle =
        ballDanger.dangerous
          ? "#e89651"
          : "#ece2b9";
      ctx.beginPath();
      ctx.arc(
        ballX,
        ballY,
        4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle =
        ballDanger.dangerous
          ? "#ee8d4c"
          : "#c9b96d";
      ctx.strokeRect(
        ballX - 7,
        ballY - 7,
        14,
        14,
      );
      drawText(
        `${ballDanger.dangerous ? "RISKY BALL" : "BALL"} ${Math.round(nearestBall.distance)}m`,
        ballX,
        ballY - 14,
        9,
        ballDanger.dangerous
          ? "#f1a166"
          : "#e5d89e",
        "center",
        true,
      );
    }
    if (
      environment.nearestTrack &&
      environment.nearestTrackDistance < 52
    ) {
      const track = environment.nearestTrack;
      const trackDeltaX =
        track.x - state.player.x;
      const trackDeltaY =
        track.y - state.player.y;
      const trackAngle = Math.atan2(
        trackDeltaX * 0.72,
        -trackDeltaY,
      );
      const trackX =
        centerX +
        Math.sin(trackAngle) * (radius - 48);
      const trackY =
        centerY -
        Math.cos(trackAngle) * (radius - 48);
      ctx.fillStyle = track.discovered
        ? "#d86439"
        : "#d2b75e";
      ctx.beginPath();
      ctx.arc(trackX, trackY, 4, 0, Math.PI * 2);
      ctx.fill();
      drawText(
        `${track.discovered ? "FOUND TRAIL" : "BENT GRASS"} ${Math.round(environment.nearestTrackDistance)}m`,
        trackX,
        trackY + 17,
        9,
        track.discovered ? "#ee8d61" : "#dfcb83",
        "center",
        true,
      );
    }
    ctx.restore();
  }

  function drawContactBreakFeedback() {
    const hole = state.hole;
    if (hole.joe.mode !== "chase") {
      return;
    }
    const visualContact = hole.hasLineOfSight;
    const audibleContact = hole.playerAudible;
    const breaking =
      !visualContact &&
      !audibleContact;
    const progress = breaking
      ? clamp(hole.lostSightTimer / 1.25, 0, 1)
      : 0;
    const panel = {
      x: WIDTH * 0.5 - 176,
      y: HEIGHT * 0.67,
      width: 352,
      height: 54,
    };
    ctx.save();
    ctx.fillStyle = "rgba(8,3,2,0.86)";
    ctx.fillRect(
      panel.x,
      panel.y,
      panel.width,
      panel.height,
    );
    strokeRect(
      panel.x,
      panel.y,
      panel.width,
      panel.height,
      breaking ? "#80ad73" : "#d0522e",
      2,
    );
    ctx.fillStyle = "#171e15";
    ctx.fillRect(
      panel.x + 18,
      panel.y + 31,
      panel.width - 36,
      9,
    );
    ctx.fillStyle = breaking
      ? "#82b878"
      : audibleContact && !visualContact
        ? "#d69b48"
        : "#d64c2c";
    ctx.fillRect(
      panel.x + 18,
      panel.y + 31,
      (panel.width - 36) *
        (breaking ? progress : 1),
      9,
    );
    const label = breaking
      ? `BREAKING CONTACT  ${Math.round(progress * 100)}%`
      : visualContact
        ? "VISUAL LOCK — PUT SOLID COVER BETWEEN YOU"
        : "SIGHT BROKEN — YOUR MOVEMENT IS STILL AUDIBLE";
    drawText(
      label,
      WIDTH * 0.5,
      panel.y + 22,
      11,
      breaking ? "#b8d6ad" : "#ffad78",
      "center",
      true,
    );
    ctx.restore();
  }

  function drawTouchButton(
    control,
    label,
    active,
    accent,
    sublabel = "",
  ) {
    ctx.save();
    ctx.globalAlpha = active ? 0.98 : 0.84;
    ctx.fillStyle = active
      ? "rgba(28,48,25,0.94)"
      : "rgba(3,12,7,0.9)";
    ctx.beginPath();
    ctx.arc(
      control.x,
      control.y,
      control.radius,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = active
      ? accent
      : "rgba(139,159,118,0.68)";
    ctx.lineWidth = active ? 3 : 2;
    ctx.stroke();
    ctx.strokeStyle = "rgba(0,0,0,0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(
      control.x,
      control.y,
      Math.max(8, control.radius - 7),
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    drawText(
      label,
      control.x,
      control.y + (sublabel ? 1 : 5),
      control.radius >= 45 ? 15 : 12,
      active ? "#fff0c9" : "#d5dfcc",
      "center",
      true,
    );
    if (sublabel) {
      drawText(
        sublabel,
        control.x,
        control.y + 16,
        8,
        active ? accent : "#8fa083",
        "center",
        true,
      );
    }
    ctx.restore();
  }

  function drawTouchControls() {
    if (
      state.inputMethod !== "touch" ||
      state.mode !== "first_hole" ||
      state.hole.tutorialVisible
    ) {
      return;
    }
    const touch = state.touch;
    const move = TOUCH_CONTROLS.move;
    const aimActive =
      state.hole.ballAim.active &&
      state.hole.ballAim.source === "touch";
    ctx.save();
    ctx.globalAlpha =
      touch.movePointerId !== null
        ? 0.94
        : 0.82;
    ctx.fillStyle = "rgba(3,12,7,0.88)";
    ctx.beginPath();
    ctx.arc(move.x, move.y, move.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle =
      touch.movePointerId !== null
        ? "#a9bf72"
        : "rgba(139,159,118,0.68)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = "rgba(122,143,101,0.48)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(move.x - move.radius + 13, move.y);
    ctx.lineTo(move.x + move.radius - 13, move.y);
    ctx.moveTo(move.x, move.y - move.radius + 13);
    ctx.lineTo(move.x, move.y + move.radius - 13);
    ctx.stroke();
    const knobX =
      move.x +
      touch.moveX *
        (move.radius - 29);
    const knobY =
      move.y -
      touch.moveY *
        (move.radius - 29);
    ctx.fillStyle = "rgba(116,139,84,0.82)";
    ctx.beginPath();
    ctx.arc(knobX, knobY, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d8dfba";
    ctx.lineWidth = 2;
    ctx.stroke();
    drawText(
      "MOVE",
      move.x,
      move.y - move.radius - 9,
      12,
      "#aebca3",
      "center",
      true,
    );
    ctx.restore();

    drawTouchButton(
      TOUCH_CONTROLS.interact,
      "USE",
      Boolean(state.hole.prompt),
      "#ef9b51",
    );
    drawTouchButton(
      TOUCH_CONTROLS.aim,
      "CHIP",
      aimActive,
      "#efc86d",
      aimActive ? "SLIDE / RELEASE" : `×${state.hole.golfBalls}`,
    );
    if (aimActive) {
      ctx.save();
      ctx.strokeStyle = "#f2c45d";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(
        TOUCH_CONTROLS.aim.x,
        TOUCH_CONTROLS.aim.y,
        TOUCH_CONTROLS.aim.radius + 7,
        -Math.PI * 0.5,
        -Math.PI * 0.5 +
          Math.PI *
            2 *
            state.hole.ballAim.power,
      );
      ctx.stroke();
      ctx.restore();
    }
    drawTouchButton(
      TOUCH_CONTROLS.focus,
      "LISTEN",
      touch.focusPointerId !== null,
      "#d7c579",
    );
    drawTouchButton(
      TOUCH_CONTROLS.crouch,
      "CROUCH",
      touch.crouchPointerId !== null,
      "#8fc87f",
    );
    drawTouchButton(
      TOUCH_CONTROLS.sprint,
      "RUN",
      touch.sprintPointerId !== null,
      "#e07a45",
    );

    const pause = TOUCH_CONTROLS.pause;
    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = "rgba(3,12,7,0.82)";
    ctx.fillRect(
      pause.x,
      pause.y,
      pause.width,
      pause.height,
    );
    strokeRect(
      pause.x,
      pause.y,
      pause.width,
      pause.height,
      "#7b906d",
      2,
    );
    drawText(
      "Ⅱ  PAUSE",
      pause.x + pause.width * 0.5,
      pause.y + 23,
      10,
      "#d5dfcc",
      "center",
      true,
    );
    ctx.restore();
  }

  function drawFirstHoleOverlay() {
    const hole = state.hole;
    const variant = activeRunVariant();
    const playerDistance = worldDistance(hole.joe, state.player);
    const environment = hole.environment || getPlayerEnvironmentState();
    const inRough = environment.effectiveRough;
    const objective =
      hole.keyCollected && hole.drainUnlocked
        ? "CHOOSE SHED OR DRAIN EXIT"
        : hole.drainUnlocked
          ? "REACH THE OPEN DRAIN"
          : hole.keyCollected
            ? "RETURN TO THE SHED"
            : "FIND KEY OR RELEASE DRAIN";
    const expandedHud = hole.controlHintTimer > 0.01 || hole.focus;
    const changeRequestStatus =
      hole.changeRequestCollected
        ? "CR ✓ BANKED"
        : `CR ◇ +${CHANGE_REQUEST_BONUS}`;

    const waterStatus =
      hole.sprinklerSoakTimer > 0
        ? `  •  WATER ${Math.ceil(hole.sprinklerSoakTimer)}s`
        : "";
    const terrainStatus =
      expandedHud
        ? `${environment.zone.name}  •  ${environment.turfLabel}${waterStatus}  •  ORDER ${String(variant.number).padStart(2, "0")}`
        : `${environment.turfLabel}  •  ${environment.coverQuality.toUpperCase()}${waterStatus}`;
    const terrainColor =
      environment.sand
        ? "#e3b96f"
      : environment.wet
        ? "#8fd4ca"
        : environment.hardCover && hole.crouched
        ? "#9fd285"
        : environment.lightExposure > 0.15
          ? "#f2a250"
          : environment.mowed
            ? "#d4c45e"
          : inRough
            ? "#d5b25f"
            : "#9fac92";

    if (expandedHud) {
      ctx.fillStyle = "rgba(2,8,5,0.86)";
      ctx.fillRect(36, 34, 430, 224);
      strokeRect(36, 34, 430, 224, hole.joe.mode === "chase" ? "#c84627" : "#687e4a", 2);
      drawText(
        `HOLE 1 — ${variant.shortName}${hole.overtime ? " // OVERTIME" : ""}`,
        62,
        76,
        hole.overtime ? 23 : 29,
        "#efebcd",
        "left",
        true,
      );
      drawText(
        changeRequestStatus,
        446,
        75,
        11,
        hole.changeRequestCollected
          ? "#8fc58b"
          : "#e69355",
        "right",
        true,
      );
      drawText(objective, 62, 112, 16, hole.keyCollected ? "#b9d77b" : "#e38a3e", "left", true);

      drawFieldIcon(0, 79, 146, 38, hole.keyCollected ? 0.48 : 1);
      drawText(
        `${hole.keyCollected ? "✓" : "1"}  ${hole.keyCollected ? "KEY ACQUIRED" : variant.keyHint}`,
        106,
        151,
        13,
        hole.keyCollected ? "#9db57c" : "#e5d9b8",
        "left",
        !hole.keyCollected,
      );
      drawFieldIcon(1, 79, 184, 38);
      drawText(
        `${inputCopy("HOLD SPACE", "HOLD X", "HOLD CHIP")}  AIM / CHIP   ×${hole.golfBalls}${hole.recoverableBalls.length > 0 ? `  •  ${hole.recoverableBalls.length} ON COURSE` : ""}`,
        106,
        189,
        13,
        "#e5d9b8",
        "left",
      );
      drawFieldIcon(2, 79, 222, 38, hole.sprinklerUsed ? 0.48 : 1);
      drawText(
        hole.drainUnlocked
          ? `${inputCopy("ENTER", "A", "USE")}  DRAIN EXIT OPEN`
          : `${inputCopy("ENTER", "A", "USE")}  INTERACT / UNLOCK`,
        106,
        227,
        13,
        hole.drainUnlocked ? "#87cba9" : "#e5d9b8",
        "left",
      );
      drawText(terrainStatus, 62, 249, 11, terrainColor, "left");
    } else {
      ctx.fillStyle = "rgba(2,8,5,0.82)";
      ctx.fillRect(36, 34, 402, 104);
      strokeRect(
        36,
        34,
        402,
        104,
        hole.joe.mode === "chase" ? "#c84627" : "#5d7349",
        2,
      );
      drawText(
        `HOLE 1  //  ORDER ${String(variant.number).padStart(2, "0")}${hole.overtime ? "  //  OVERTIME" : ""}`,
        56,
        65,
        16,
        "#e9e4c9",
        "left",
        true,
      );
      drawText(
        changeRequestStatus,
        420,
        65,
        10,
        hole.changeRequestCollected
          ? "#8fc58b"
          : "#e69355",
        "right",
        true,
      );
      drawText(objective, 56, 94, 14, hole.keyCollected ? "#b9d77b" : "#e38a3e", "left", true);
      drawText(
        `${terrainStatus}  •  ${hole.golfBalls} BALLS${hole.recoverableBalls.length > 0 ? ` + ${hole.recoverableBalls.length} LOST` : ""}`,
        56,
        120,
        11,
        terrainColor,
        "left",
      );
    }

    const meterX = WIDTH - 304;
    ctx.fillStyle = "rgba(2,8,5,0.82)";
    ctx.fillRect(meterX, 36, 264, 124);
    strokeRect(meterX, 36, 264, 124, hole.joe.mode === "chase" ? "#c84627" : "#536642", 2);
    drawText("JOE ATTENTION", meterX + 18, 65, 13, "#d7deca", "left");
    ctx.fillStyle = "#17231a";
    ctx.fillRect(meterX + 18, 79, 228, 18);
    const attention =
      hole.joe.mode === "chase"
        ? Math.max(0.72, hole.detection)
        : hole.detection;
    ctx.fillStyle = attention > 0.68 ? "#d84a28" : attention > 0.28 ? "#d88935" : "#6c8a50";
    ctx.fillRect(meterX + 18, 79, 228 * attention, 18);
    strokeRect(meterX + 18, 79, 228, 18, "#889879", 1);
    const attentionStatus =
      hole.joe.mode === "chase"
        ? "PURSUIT LOCK"
        : hole.detectionSource === "sight"
          ? "SIGHTLINE BUILDING"
          : hole.detectionSource === "sound"
            ? "NOISE DETECTED"
            : hole.detectionSource === "trail"
              ? "TRAIL EVIDENCE FOUND"
            : environment.blocker
              ? "SIGHTLINE BLOCKED"
              : "UNAWARE";
    drawText(
      attentionStatus,
      meterX + 18,
      119,
      11,
      attention > 0.68 ? "#ff7045" : attention > 0.2 ? "#e8a55d" : "#9db293",
      "left",
      true,
    );
    drawText(
      `MOWER ${Math.round(playerDistance)}m`,
      meterX + 246,
      145,
      11,
      playerDistance < 42 ? "#e8a55d" : "#899985",
      "right",
    );
    drawCourseMiniMap();

    if (expandedHud) {
      ctx.fillStyle = "rgba(2,8,5,0.82)";
      ctx.fillRect(36, 269, 430, 82);
      strokeRect(36, 269, 430, 82, hole.focus ? "#c8b267" : "#4d6444", 2);
      drawText(
        hole.focus ? "LISTENING FOCUS" : "SURROUNDINGS",
        54,
        293,
        13,
        hole.focus ? "#f2d781" : "#ccd7c0",
        "left",
        true,
      );
      const landmarkText =
        environment.nearestLandmark &&
        environment.nearestLandmarkDistance < 72
          ? `${environment.nearestLandmark.landmark.toUpperCase()}  ${Math.round(environment.nearestLandmarkDistance)}m`
          : "NO LANDMARK WITHIN 72m";
      drawText(landmarkText, 54, 316, 11, "#aeb9a2", "left");
      const awarenessText =
        hole.blackoutTimer > 0
          ? "FLOODLIGHT POWER LOW — MOVE NOW"
          : environment.lightExposure > 0.15
          ? "AMBER LIGHT: VISIBILITY RISING"
          : environment.hardCover
            ? "SOLID OBJECT BETWEEN YOU AND JOE"
            : environment.mowed
              ? "CUT STRIP: QUIET FOOTING, NO CONCEALMENT"
            : inRough
              ? "BENT ROUGH: CONCEALMENT LEAVES A TRAIL"
              : "OPEN SIGHTLINE — MOVE COVER TO COVER";
      drawText(
        awarenessText,
        54,
        338,
        11,
        hole.blackoutTimer > 0
          ? "#75c4b8"
          : environment.lightExposure > 0.15
            ? "#f2a250"
            : "#8fbc8a",
        "left",
      );
    }

    if (hole.zoneBannerTimer > 0) {
      const zoneAlpha = clamp(hole.zoneBannerTimer / 0.55, 0, 1);
      const bannerCenterX = WIDTH * 0.5 + 108;
      const bannerWidth = 400;
      ctx.save();
      ctx.globalAlpha = zoneAlpha;
      ctx.fillStyle = "rgba(2,7,4,0.88)";
      ctx.fillRect(bannerCenterX - bannerWidth * 0.5, 42, bannerWidth, 74);
      strokeRect(bannerCenterX - bannerWidth * 0.5, 42, bannerWidth, 74, "#9c7a43", 2);
      drawText(environment.zone.name, bannerCenterX, 74, 25, "#f0e4bd", "center", true);
      drawText(environment.zone.subtitle, bannerCenterX, 99, 12, "#bd9860", "center");
      ctx.restore();
    }

    if (hole.messageTimer > 0) {
      const alpha = clamp(hole.messageTimer, 0, 1);
      const messageWidth = 720;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(2,8,4,0.9)";
      ctx.fillRect(WIDTH * 0.5 - messageWidth * 0.5, HEIGHT - 112, messageWidth, 46);
      strokeRect(WIDTH * 0.5 - messageWidth * 0.5, HEIGHT - 112, messageWidth, 46, "#d87532", 2);
      drawText(hole.message, WIDTH * 0.5, HEIGHT - 82, 15, "#f1e7c9", "center", true);
      ctx.globalAlpha = 1;
    } else if (
      hole.prompt &&
      !hole.ballAim.active
    ) {
      drawText(hole.prompt, WIDTH * 0.5, HEIGHT - 82, 17, "#ffd184", "center", true);
    }

    if (state.inputMethod !== "touch") {
      drawText(
        expandedHud
          ? inputCopy(
              "MOVE WASD/ARROWS  •  SHIFT SPRINT  •  C CROUCH  •  Q LISTEN  •  ENTER INTERACT  •  HOLD SPACE AIM  •  ESC PAUSE",
              "MOVE LEFT STICK/D-PAD  •  RT SPRINT  •  LB CROUCH  •  LT LISTEN  •  A INTERACT  •  HOLD X AIM  •  START PAUSE",
            )
          : inputCopy(
              "H CONTROLS  •  ESC PAUSE",
              "Y CONTROLS  •  START PAUSE",
            ),
        28,
        HEIGHT - 25,
        11,
        expandedHud ? "#c0c9b4" : "#829079",
        "left",
      );
      ctx.fillStyle = "rgba(2,8,5,0.78)";
      ctx.fillRect(WIDTH - 124, HEIGHT - 45, 96, 28);
      strokeRect(
        WIDTH - 124,
        HEIGHT - 45,
        96,
        28,
        "#687e4a",
        1,
      );
      drawText(
        "Ⅱ  PAUSE",
        WIDTH - 76,
        HEIGHT - 25,
        11,
        "#b9c5ae",
        "center",
        true,
      );
    }
  }

  function drawFirstHole() {
    const key = activeKeyPoint();
    const sprinkler = activeSprinklerPoint();
    const progress = clamp(state.player.y / COURSE_LENGTH, 0, 1);
    const zone = courseZoneAt(state.player.y);
    const zoom = 1.08 + progress * 0.16;
    const panX = clamp(-state.player.x * 0.5, -60, 60);
    const walkBob = state.reducedMotion
      ? 0
      : Math.sin(state.time * 8.5) * (playerIsMoving() ? 3.4 : 0.7);

    ctx.fillStyle = "#07120c";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawImageCover(ctx, holeArt, panX, walkBob + progress * 10, zoom);

    const dangerTint = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    dangerTint.addColorStop(0, "rgba(3,12,10,0.08)");
    dangerTint.addColorStop(0.62, "rgba(7,20,10,0.05)");
    dangerTint.addColorStop(1, `rgba(20,4,1,${0.1 + progress * 0.13})`);
    ctx.fillStyle = dangerTint;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = `rgba(${zone.tint},0.08)`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    if (state.hole.overtime) {
      const overtimeGrade =
        ctx.createLinearGradient(
          0,
          0,
          WIDTH,
          0,
        );
      overtimeGrade.addColorStop(
        0,
        "rgba(116,24,10,0.16)",
      );
      overtimeGrade.addColorStop(
        0.28,
        "rgba(116,24,10,0)",
      );
      overtimeGrade.addColorStop(
        0.72,
        "rgba(116,24,10,0)",
      );
      overtimeGrade.addColorStop(
        1,
        "rgba(116,24,10,0.16)",
      );
      ctx.fillStyle = overtimeGrade;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = "rgba(222,91,43,0.42)";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        18,
        18,
        WIDTH - 36,
        HEIGHT - 36,
      );
    }

    drawPerspectiveCourse(progress, walkBob);
    drawBunkerSand();
    drawWetTurf();
    drawTurfMarks();
    drawRecoverableGolfBalls();
    drawChangeRequest();

    for (let layer = 0; layer < 3; layer += 1) {
      const fogY = 280 + layer * 105;
      const fogX = state.reducedMotion
        ? -80
        : -100 + Math.sin(state.time * (0.13 + layer * 0.04) + layer) * 70;
      const fog = ctx.createLinearGradient(0, fogY - 30, 0, fogY + 85);
      fog.addColorStop(0, "rgba(151,170,151,0)");
      fog.addColorStop(0.5, `rgba(151,170,151,${0.055 + layer * 0.018})`);
      fog.addColorStop(1, "rgba(151,170,151,0)");
      ctx.fillStyle = fog;
      ctx.fillRect(fogX, fogY - 30, WIDTH + 200, 115);
    }

    drawMotes(state.time, 28, "198,173,81", HEIGHT * 0.16);
    drawLayeredCourseEntities();
    drawWorldEffects();

    if (
      !state.hole.keyCollected &&
      (!state.hole.drainUnlocked ||
        worldDistance(state.player, key) < 42)
    ) {
      drawWorldMarker(
        key.x,
        key.y,
        "SHED KEY",
        "#e7bd58",
        "◆",
      );
    }
    if (!state.hole.sprinklerUsed) {
      drawWorldMarker(
        sprinkler.x,
        sprinkler.y,
        "SPRINKLER",
        "#6aa8a0",
        "◉",
      );
    }
    if (state.hole.distraction && state.hole.distractionTimer > 0) {
      drawWorldMarker(
        state.hole.distraction.x,
        state.hole.distraction.y,
        "DISTRACTION",
        "#d6a74c",
        "!",
      );
    }
    const changeRequest =
      activeChangeRequest();
    if (
      !state.hole.changeRequestCollected &&
      (state.hole.focus ||
        worldDistance(
          state.player,
          changeRequest,
        ) < 70)
    ) {
      drawWorldMarker(
        changeRequest.x,
        changeRequest.y,
        `${changeRequest.code} // UNFILED`,
        "#e26f38",
        "◇",
      );
    }
    drawWorldMarker(
      DRAIN_EXIT.x,
      DRAIN_EXIT.y,
      state.hole.drainUnlocked ? "DRAIN EXIT — OPEN" : "DRAIN — SEALED",
      state.hole.drainUnlocked ? "#73c9aa" : "#778178",
      state.hole.drainUnlocked ? "⇩" : "×",
    );
    if (!state.hole.drainUnlocked || state.hole.keyCollected) {
      drawWorldMarker(SHED_EXIT.x, SHED_EXIT.y, "MAINTENANCE SHED", "#d8b46b", "⌂");
    }

    const openingForeground = drawForegroundFringe(walkBob);

    if (openingForeground.visibility > 0.01) {
      for (let index = 0; index < 54; index += 1) {
        const x =
          openingForeground.x +
          index / 53 * openingForeground.width;
        const height =
          (10 + hash(index * 31) * 36) *
          (1 + openingForeground.departure * 0.5) *
          openingForeground.visibility;
        const rootY =
          openingForeground.y +
          openingForeground.height;
        const sway = state.reducedMotion ? 0 : Math.sin(state.time * 1.6 + index) * 4;
        ctx.strokeStyle = `rgba(24,48,18,${
          (0.42 + hash(index) * 0.3) *
          openingForeground.visibility
        })`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, rootY);
        ctx.lineTo(x + sway, rootY - height);
        ctx.stroke();
      }
    }

    if (state.hole.blockedTimer > 0) {
      const blockAlpha = clamp(state.hole.blockedTimer * 2, 0, 0.72);
      const blockedObstacle = COURSE_OBSTACLES.find(
        (obstacle) =>
          obstacle.id === state.hole.blockedObstacle,
      );
      const blockedName = (
        blockedObstacle?.landmark ||
        state.hole.blockedObstacle ||
        "boundary"
      ).toUpperCase();
      const escapeHint =
        state.hole.blockedDirection === "FORWARD" ||
        state.hole.blockedDirection === "BACK"
          ? "TRY LEFT OR RIGHT"
          : "SLIDE FORWARD OR BACK";
      ctx.fillStyle = `rgba(96,22,9,${blockAlpha * 0.2})`;
      ctx.fillRect(0, HEIGHT * 0.42, WIDTH, HEIGHT * 0.58);
      ctx.globalAlpha = blockAlpha;
      drawText(
        `CONTACT: ${blockedName} — ${escapeHint}`,
        WIDTH * 0.5,
        HEIGHT - 142,
        13,
        "#e89a63",
        "center",
        true,
      );
      ctx.globalAlpha = 1;
    }

    drawSuspenseEffects();
    drawPursuitEffects();
    drawConcealmentEffects();
    drawListeningFocus();
    drawContactBreakFeedback();
    drawGolfBallTactics();
    drawFirstHoleOverlay();
    drawJoeStateBanner();
    if (!state.hole.ballAim.active) {
      drawText("+", WIDTH * 0.5, HEIGHT * 0.52 + walkBob, 24, "#e0e6d6", "center", true);
      drawMovementFeedback(walkBob);
    }
    drawTouchControls();
    if (state.hole.tutorialVisible) {
      drawTutorialBriefing();
    }
  }

  function drawClockedOut() {
    ctx.fillStyle = "#010302";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawText("SHIFT ENDED", WIDTH * 0.5, HEIGHT * 0.46, 58, "#e9ead1", "center", true);
    drawText("Your coverage resumes at dawn.", WIDTH * 0.5, HEIGHT * 0.54, 21, "#d57b39", "center");
    drawText(
      inputCopy(
        "ENTER — RETURN TO MENU",
        "A — RETURN TO MENU",
        "TAP — RETURN TO MENU",
      ),
      WIDTH * 0.5,
      HEIGHT * 0.64,
      16,
      "#9ba794",
      "center",
    );
  }

  function drawVictory() {
    const reveal = smoothstep(state.time / 0.48);
    const usedDrain = state.hole.escapeRoute === "drain";
    const routeAccent = usedDrain ? "#73c9aa" : "#91ad62";
    const result =
      state.hole.result ||
      calculateRunResult(state.hole.escapeRoute);
    const resultColor = gradeColor(result.grade);
    const activeRecord = result.overtime
      ? state.career.overtimeBest
      : state.career.routes[result.route];
    const scoreReveal = smoothstep(
      (state.time - 0.12) / 0.78,
    );
    const displayedScore = Math.round(
      result.score * scoreReveal,
    );
    drawImageCover(ctx, holeArt, 0, 8, 1.05 + reveal * 0.018);
    ctx.fillStyle = `rgba(1,8,4,${0.42 + reveal * 0.18})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawMotes(
      state.time,
      36,
      usedDrain ? "115,201,170" : "204,181,91",
      HEIGHT * 0.12,
    );

    const panel = { x: 220, y: 82, width: 840, height: 556 };
    ctx.save();
    ctx.globalAlpha = reveal;
    ctx.translate(0, (1 - reveal) * 28);
    ctx.fillStyle = usedDrain
      ? "rgba(3,17,14,0.92)"
      : "rgba(3,15,8,0.92)";
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    strokeRect(panel.x, panel.y, panel.width, panel.height, routeAccent, 3);
    strokeRect(
      panel.x + 12,
      panel.y + 12,
      panel.width - 24,
      panel.height - 24,
      "#314a34",
      1,
    );
    ctx.fillStyle = routeAccent;
    ctx.fillRect(panel.x + 28, panel.y + 28, 84, 3);
    ctx.fillRect(panel.x + panel.width - 112, panel.y + 28, 84, 3);
    drawText(
      result.overtime
        ? "OVERTIME SURVIVED"
        : "HOLE 1 SURVIVED",
      WIDTH * 0.5,
      142,
      42,
      "#f0efd3",
      "center",
      true,
    );
    drawText(
      `AFTER-ACTION REVIEW // ${result.overtime ? "OVERTIME // " : ""}ORDER ${String(result.variantNumber).padStart(2, "0")} // ${result.variantName}`,
      WIDTH * 0.5,
      177,
      12,
      "#d6813d",
      "center",
      true,
    );
    ctx.strokeStyle = "#40543c";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panel.x + 30, 198);
    ctx.lineTo(panel.x + panel.width - 30, 198);
    ctx.stroke();

    drawText("RISK CLASS", 365, 236, 13, "#93a28d", "center", true);
    drawText(
      result.grade,
      365,
      350,
      118,
      resultColor,
      "center",
      true,
    );
    drawText(
      result.gradeLabel,
      365,
      384,
      13,
      resultColor,
      "center",
      true,
    );
    drawText(
      result.newBest
        ? result.overtime
          ? "NEW OVERTIME RECORD"
          : `NEW ${result.route.toUpperCase()} ROUTE RECORD`
        : `${result.overtime ? "OVERTIME" : "ROUTE"} BEST  ${activeRecord?.score.toLocaleString() || result.score.toLocaleString()}`,
      365,
      423,
      12,
      result.newBest ? "#f2c75f" : "#91a18b",
      "center",
      result.newBest,
    );

    ctx.strokeStyle = "#40543c";
    ctx.beginPath();
    ctx.moveTo(492, 218);
    ctx.lineTo(492, 480);
    ctx.stroke();

    drawText("COURSE SCORE", 540, 237, 13, "#93a28d", "left", true);
    drawText(
      displayedScore.toLocaleString(),
      540,
      287,
      40,
      "#f2efd4",
      "left",
      true,
    );
    const scoreNotes = [];
    if (result.changeRequestCollected) {
      scoreNotes.push({
        text: `+${result.breakdown.changeRequest.toLocaleString()} UNFILED CHANGE REQUEST`,
        color: "#ef9b5f",
      });
    }
    if (
      result.breakdown.bunker > 0
    ) {
      scoreNotes.push({
        text: `+${result.breakdown.bunker.toLocaleString()} BUNKER BAIT`,
        color: "#e6b76a",
      });
    }
    if (result.overtime) {
      scoreNotes.push({
        text: `+${result.breakdown.overtime.toLocaleString()} OVERTIME PREMIUM`,
        color: "#e69759",
      });
    }
    for (
      let index = 0;
      index < scoreNotes.length;
      index += 1
    ) {
      drawText(
        scoreNotes[index].text,
        540,
        306 + index * 14,
        10,
        scoreNotes[index].color,
        "left",
        true,
      );
    }
    const statRows = [
      [
        "TIME ON COURSE",
        formatRunTime(result.timeSeconds),
      ],
      [
        "ATTENTION AVOIDED",
        `${Math.round((1 - result.maxDetection) * 100)}%`,
      ],
      [
        "PURSUIT",
        result.cleanRun
          ? "NONE RECORDED"
          : `${result.chaseCount} / ${Math.round(result.pursuitSeconds)}s`,
      ],
      [
        "CLOSE CALLS",
        String(result.closeCalls),
      ],
      [
        "RESOURCES",
        `${result.ballsRemaining} BALL${result.ballsRemaining === 1 ? "" : "S"}  •  ${result.ballsRecovered} RECLAIMED`,
      ],
    ];
    for (
      let index = 0;
      index < statRows.length;
      index += 1
    ) {
      const statStart =
        scoreNotes.length > 0
          ? 348
          : 324;
      const statSpacing =
        scoreNotes.length > 0
          ? 28
          : 33;
      const y =
        statStart +
        index * statSpacing;
      if (index % 2 === 0) {
        ctx.fillStyle = "rgba(36,59,37,0.32)";
        ctx.fillRect(530, y - 20, 300, 28);
      }
      drawText(
        statRows[index][0],
        542,
        y,
        11,
        "#899787",
        "left",
      );
      drawText(
        statRows[index][1],
        818,
        y,
        13,
        index === 3 && result.closeCalls > 0
          ? "#efb158"
          : "#d8dfcd",
        "right",
        true,
      );
    }

    ctx.fillStyle = "rgba(14,31,18,0.8)";
    ctx.fillRect(260, 495, 760, 46);
    strokeRect(260, 495, 760, 46, "#3f563a", 1);
    drawText(
      usedDrain
        ? `DRAIN ROUTE  //  ${result.variantName}  //  ${result.overtime ? "AFTER-HOURS EGRESS" : "UNAUTHORIZED EGRESS"}`
        : `SHED ROUTE  //  ${result.variantName}  //  ${result.overtime ? "OVERTIME CLOSED" : "ACTION ITEM CLOSED"}`,
      WIDTH * 0.5,
      524,
      13,
      routeAccent,
      "center",
      true,
    );
    drawText(
      result.masteryUnlocked
        ? "ALL NIGHT ORDERS CLEARED — OVERTIME AUDIT AUTHORIZED."
        : result.newChangeRequestFiled
          ? `${activeChangeRequest().code} FILED. CHANGE REQUESTS ${state.career.filedChangeRequests.length}/${RUN_VARIANTS.length} SECURED.`
        : result.newBest
          ? result.overtime
            ? "OVERTIME RECORD FILED. JOE REQUESTED A RETROSPECTIVE."
            : `PERSONAL RECORD FILED. ${state.career.completedVariants.length}/${RUN_VARIANTS.length} NIGHT ORDERS CLEARED.`
          : "PAR IS NOT A SAFETY STANDARD. JOE'S MOWER DID NOT STOP.",
      WIDTH * 0.5,
      570,
      13,
      result.masteryUnlocked ||
        result.newChangeRequestFiled ||
        result.newBest
        ? "#f0c66b"
        : "#d69a5c",
      "center",
    );
    drawText(
      inputCopy(
        "ENTER — PLAY AGAIN     ESC — MAIN MENU",
        "A — PLAY AGAIN     B — MAIN MENU",
        "TAP — PLAY AGAIN",
      ),
      WIDTH * 0.5,
      610,
      15,
      "#e7e4ca",
      "center",
      true,
    );
    ctx.restore();

    const barHeight = Math.round((1 - reveal) * 92 + 18);
    ctx.fillStyle = "#010201";
    ctx.fillRect(0, 0, WIDTH, barHeight);
    ctx.fillRect(0, HEIGHT - barHeight, WIDTH, barHeight);
  }

  function drawDefeat() {
    const impact = smoothstep(state.time / 0.48);
    const jitterStrength = state.reducedMotion ? 0 : (1 - Math.min(1, state.time / 1.2)) * 15;
    const jitterX = (hash(Math.floor(state.time * 44)) - 0.5) * jitterStrength;
    const jitterY = (hash(Math.floor(state.time * 37) + 8) - 0.5) * jitterStrength * 0.55;
    ctx.save();
    ctx.translate(jitterX, jitterY);
    drawImageCover(ctx, defeatArt, 0, 8 + impact * 8, 1.035 + impact * 0.075);
    ctx.restore();

    const captureGrade = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    captureGrade.addColorStop(0, "rgba(4,7,8,0.08)");
    captureGrade.addColorStop(0.48, `rgba(41,5,1,${0.08 + impact * 0.14})`);
    captureGrade.addColorStop(1, `rgba(12,1,0,${0.5 + impact * 0.35})`);
    ctx.fillStyle = captureGrade;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (state.time < 0.16) {
      ctx.fillStyle = `rgba(255,225,176,${(0.16 - state.time) * 2.8})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    const textReveal = smoothstep((state.time - 0.18) / 0.38);
    const panelY = lerp(504, 432, textReveal);
    ctx.save();
    ctx.globalAlpha = textReveal;
    ctx.fillStyle = "rgba(10,2,1,0.9)";
    ctx.fillRect(0, panelY, WIDTH, HEIGHT - panelY);
    ctx.fillStyle = "#c64626";
    ctx.fillRect(0, panelY, WIDTH, 3);
    drawText("CLAIM DENIED", WIDTH * 0.5, panelY + 70, 58, "#f2ead3", "center", true);
    drawText(
      "CAUSE OF LOSS: FAILED TO MAINTAIN A SAFE MOWING DISTANCE",
      WIDTH * 0.5,
      panelY + 110,
      16,
      "#e6ad84",
      "center",
    );
    drawText("ADJUSTER: JOE  •  STATUS: FINAL", WIDTH * 0.5, panelY + 143, 13, "#bda99b", "center");
    drawText(
      inputCopy(
        "ENTER — RETRY HOLE 1     ESC — MAIN MENU",
        "A — RETRY HOLE 1     B — MAIN MENU",
        "TAP — RETRY HOLE 1",
      ),
      WIDTH * 0.5,
      panelY + 203,
      15,
      "#f1e8d0",
      "center",
      true,
    );
    ctx.restore();
  }

  function drawText(text, x, y, size, color, align = "left", heavy = false) {
    ctx.save();
    ctx.font = `${heavy ? "bold " : ""}${size}px "Courier New", monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.lineJoin = "miter";
    if (heavy) {
      ctx.strokeStyle = "rgba(0,0,0,0.88)";
      ctx.lineWidth = Math.max(3, Math.floor(size / 10));
      ctx.strokeText(text, x, y);
    }
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function strokeRect(x, y, width, height, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x + lineWidth * 0.5, y + lineWidth * 0.5, width - lineWidth, height - lineWidth);
  }

  function polygon(points) {
    ctx.beginPath();
    points.forEach(([x, y], index) => {
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fill();
  }

  function render() {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    switch (state.mode) {
      case "gate":
        drawGate();
        break;
      case "intro":
        drawIntro();
        break;
      case "menu":
      case "claim":
        drawMenu();
        break;
      case "settings":
        drawSettings();
        break;
      case "first_hole":
        drawFirstHole();
        break;
      case "paused":
        drawPause();
        break;
      case "victory":
        drawVictory();
        break;
      case "defeat":
        drawDefeat();
        break;
      case "clocked_out":
        drawClockedOut();
        break;
      default:
        drawGate();
    }
    drawScreenTexture();
    const suppressTransition = state.mode === "first_hole" && state.hole.tutorialVisible;
    if (!suppressTransition && state.transitionAlpha > 0.001) {
      const resultTransitionScale = ["victory", "defeat"].includes(state.mode) ? 0.28 : 1;
      ctx.fillStyle = `rgba(0,0,0,${smoothstep(state.transitionAlpha) * resultTransitionScale})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  function update(delta) {
    const dt = Math.min(delta, 0.05);
    pollGamepad();
    state.time += dt;
    state.transitionAlpha = Math.max(0, state.transitionAlpha - dt * 2.25);

    if (state.mode === "intro") {
      if (!state.stingerPlayed && state.time >= LINE_END) {
        state.stingerPlayed = true;
        triggerStinger();
      }
      if (state.time >= MENU_TIME) {
        enterMenu();
      }
    } else if (state.mode === "first_hole") {
      const hole = state.hole;
      if (hole.tutorialVisible) {
        hole.noise = 0;
        hole.prompt = inputCopy(
          "PRESS A MOVEMENT KEY OR ENTER TO START",
          "MOVE LEFT STICK OR PRESS A TO START",
          "TOUCH LEFT PAD OR TAP USE TO START",
        );
        updateAudio();
        return;
      }
      hole.elapsed += dt;
      hole.controlHintTimer = Math.max(
        0,
        hole.controlHintTimer - dt,
      );
      hole.messageTimer = Math.max(0, hole.messageTimer - dt);
      hole.blockedTimer = Math.max(0, hole.blockedTimer - dt);
      hole.stateBannerTimer = Math.max(0, hole.stateBannerTimer - dt);
      hole.stateBannerLockTimer = Math.max(
        0,
        hole.stateBannerLockTimer - dt,
      );
      hole.zoneBannerTimer = Math.max(0, hole.zoneBannerTimer - dt);
      hole.blackoutTimer = Math.max(0, hole.blackoutTimer - dt);
      hole.dreadTimer = Math.max(0, hole.dreadTimer - dt);
      hole.sprinklerSoakTimer = Math.max(
        0,
        hole.sprinklerSoakTimer - dt,
      );
      hole.detectionPulse = Math.max(0, hole.detectionPulse - dt * 1.75);
      hole.lastKnownJoeTimer = Math.max(0, hole.lastKnownJoeTimer - dt);
      hole.trailWarningTimer = Math.max(
        0,
        hole.trailWarningTimer - dt,
      );
      updateCourseEffects(dt);
      updateTurfMarks(dt);
      const movement = movementInput();
      updateGolfBallTactics(dt, movement);
      const moving = playerIsMoving();
      hole.crouched = crouchHeld();
      hole.focus = focusHeld();
      if (moving) {
        hole.hasMoved = true;
        hole.moveVector.x = movement.x;
        hole.moveVector.y = movement.y;
        hole.moveHintTimer = 0.42;
      } else {
        hole.moveHintTimer = Math.max(0, hole.moveHintTimer - dt);
      }
      const sprinting =
        moving &&
        !hole.crouched &&
        !hole.focus &&
        sprintHeld();
      if (moving && hole.crouched) {
        hole.crouchedSeconds += dt;
      }
      if (sprinting) {
        hole.sprintSeconds += dt;
      }
      const preMoveSand =
        sandStateAt(state.player).active;
      const speed =
        (
          hole.focus
            ? 11
            : hole.crouched
              ? 15
              : sprinting
                ? 38
                : 24
        ) *
        (
          preMoveSand
            ? SAND_PLAYER_SPEED_MULTIPLIER
            : 1
        ) *
        dt;
      let inputX = movement.x;
      let inputY = movement.y;
      const inputLength = Math.max(1, Math.hypot(inputX, inputY));
      inputX /= inputLength;
      inputY /= inputLength;
      if (moving) {
        state.player.heading = Math.atan2(inputY, inputX);
        movePlayerBy(inputX * speed, inputY * speed);
        recordPlayerTrack(sprinting);
        const stepSpacing = hole.crouched ? 5.8 : sprinting ? 5.3 : 4.1;
        if (hole.travelDistance - hole.lastStepDistance >= stepSpacing) {
          const stepEnvironment =
            getPlayerEnvironmentState();
          const inStepRough =
            stepEnvironment.effectiveRough;
          hole.lastStepDistance = hole.travelDistance;
          playFootstep(
            inStepRough,
            sprinting,
            hole.crouched,
            stepEnvironment.wet,
            stepEnvironment.sand,
          );
          if (
            stepEnvironment.sand ||
            stepEnvironment.wet ||
            !hole.crouched ||
            !inStepRough
          ) {
            addStepParticles(
              inStepRough,
              sprinting,
              stepEnvironment.wet,
              stepEnvironment.sand,
            );
          }
        }
      }

      const zoneIndex = COURSE_ZONES.indexOf(courseZoneAt(state.player.y));
      if (zoneIndex !== hole.zoneIndex) {
        hole.zoneIndex = zoneIndex;
        hole.zoneVisits[zoneIndex] += 1;
        const firstVisit =
          hole.zoneVisits[zoneIndex] === 1;
        hole.zoneBannerTimer = firstVisit ? 3.4 : 1.45;
        if (firstVisit) {
          setHoleMessage(COURSE_ZONES[zoneIndex].cue, 3.4);
          playThreatCue(zoneIndex >= 2 ? "search" : "investigate");
          if (zoneIndex === 2) {
            hole.blackoutTimer = 4.2;
            setHoleMessage(
              "POWER SAG — the floodlight is cycling. Move while it is dark.",
              4.1,
            );
            addWorldEffect(
              "power_sag",
              18,
              242,
              4.2,
            );
          } else if (zoneIndex === 3) {
            hole.dreadTimer = 5.2;
            hole.joe.alert = Math.max(
              hole.joe.alert,
              0.2,
            );
          }
        }
      }
      hole.discoveredY = Math.max(hole.discoveredY, state.player.y + 48);
      const environment = getPlayerEnvironmentState();
      const inRough = environment.inRough;
      const effectiveRough =
        environment.effectiveRough;
      hole.environment = environment;
      if (environment.sand) {
        hole.sandSeconds += dt;
        const currentSandZoneId =
          environment.sandZone?.id ||
          null;
        if (
          currentSandZoneId &&
          currentSandZoneId !==
            hole.activeSandZoneId
        ) {
          hole.sandZoneEntries += 1;
          hole.activeSandZoneId =
            currentSandZoneId;
          hole.stateBanner =
            "BUNKER SAND // LOUD TRACKS, SLOW MOWER";
          hole.stateBannerTimer = 2.7;
          hole.stateBannerLockTimer = 2.7;
          setHoleMessage(
            hole.sandZoneEntries === 1
              ? "BUNKER SAND — your footing drags and every step prints. Joe's mower slows too."
              : `${environment.sandZone.name} — deep prints expose your route.`,
            3.1,
          );
          addWorldEffect(
            "sand_entry",
            state.player.x,
            state.player.y,
            1.6,
          );
          playSandStepCue(
            sprinting,
          );
        }
      } else {
        hole.activeSandZoneId =
          null;
      }
      const targetNoise = moving
        ? hole.focus
          ? environment.sand
            ? 0.24
            : 0.055
          : hole.crouched
          ? environment.sand
            ? environment.wet
              ? 0.18
              : 0.28
            : environment.wet
              ? 0.06
            : effectiveRough
            ? 0.1
            : environment.mowed
              ? 0.075
              : 0.15
          : sprinting
          ? environment.sand
            ? environment.wet
              ? 0.88
              : 0.92
            : environment.wet
              ? 0.84
            : environment.mowed
            ? 0.72
            : 1
          : environment.sand
            ? environment.wet
              ? 0.36
              : 0.46
            : environment.wet
              ? 0.18
            : effectiveRough
            ? 0.64
            : environment.mowed
              ? 0.12
              : 0.26
        : 0;
      hole.noise = lerp(hole.noise, targetNoise, clamp(dt * (moving ? 4 : 2), 0, 1));
      const targetConcealment =
        hole.crouched && environment.hardCover
          ? moving
            ? 0.82
            : 1
          : hole.crouched && effectiveRough
            ? moving
              ? 0.58
              : 0.76
          : effectiveRough
            ? 0.16
            : 0;
      hole.concealment = lerp(
        hole.concealment,
        targetConcealment,
        clamp(dt * 4.2, 0, 1),
      );
      if (effectiveRough && moving && !hole.crouched) {
        hole.joe.alert = clamp(hole.joe.alert + dt * 0.055, 0, 1);
      }
      if (environment.lightExposure > 0.15 && moving) {
        hole.joe.alert = clamp(
          hole.joe.alert + dt * environment.lightExposure * 0.06,
          0,
          1,
        );
      }

      const key = activeKeyPoint();
      const sprinkler = activeSprinklerPoint();
      const changeRequest =
        activeChangeRequest();
      const shed = SHED_EXIT;
      const drain = DRAIN_EXIT;
      const nearestBall =
        nearestRecoverableBall();
      if (hole.ballAim.active) {
        hole.prompt = inputCopy(
          "RELEASE SPACE TO CHIP",
          "RELEASE X TO CHIP",
          "RELEASE CHIP TO SHOOT",
        );
      } else if (hole.ballFlight) {
        hole.prompt = "BALL IN FLIGHT";
      } else if (!hole.keyCollected && worldDistance(state.player, key) < key.radius) {
        hole.prompt = inputCopy(
          "ENTER — TAKE SHED KEY",
          "A — TAKE SHED KEY",
          "TAP USE — TAKE SHED KEY",
        );
      } else if (!hole.sprinklerUsed && worldDistance(state.player, sprinkler) < sprinkler.radius) {
        hole.prompt = inputCopy(
          "ENTER — ACTIVATE SPRINKLERS",
          "A — ACTIVATE SPRINKLERS",
          "TAP USE — ACTIVATE SPRINKLERS",
        );
      } else if (
        hole.keyCollected &&
        worldDistance(state.player, shed) <
          shed.radius
      ) {
        hole.prompt = inputCopy(
          "ENTER — UNLOCK SHED",
          "A — UNLOCK SHED",
          "TAP USE — UNLOCK SHED",
        );
      } else if (
        hole.drainUnlocked &&
        worldDistance(state.player, drain) <
          drain.radius
      ) {
        hole.prompt = inputCopy(
          "ENTER — ESCAPE THROUGH DRAIN",
          "A — ESCAPE THROUGH DRAIN",
          "TAP USE — ESCAPE THROUGH DRAIN",
        );
      } else if (
        !hole.changeRequestCollected &&
        worldDistance(
          state.player,
          changeRequest,
        ) < changeRequest.radius
      ) {
        hole.prompt = inputCopy(
          `ENTER — SECURE ${changeRequest.code} (+${CHANGE_REQUEST_BONUS})`,
          `A — SECURE ${changeRequest.code} (+${CHANGE_REQUEST_BONUS})`,
          `TAP USE — SECURE ${changeRequest.code} (+${CHANGE_REQUEST_BONUS})`,
        );
      } else if (
        nearestBall.ball &&
        nearestBall.distance <
          BALL_RECOVERY_RADIUS
      ) {
        const recoveryDanger =
          golfBallDangerState(
            nearestBall.ball,
          );
        hole.prompt = inputCopy(
          recoveryDanger.dangerous
            ? `ENTER — RECLAIM BALL // JOE ${Math.round(recoveryDanger.joeDistance)}m`
            : "ENTER — RECLAIM GOLF BALL",
          recoveryDanger.dangerous
            ? `A — RECLAIM BALL // JOE ${Math.round(recoveryDanger.joeDistance)}m`
            : "A — RECLAIM GOLF BALL",
          recoveryDanger.dangerous
            ? `TAP USE — RECLAIM BALL // JOE ${Math.round(recoveryDanger.joeDistance)}m`
            : "TAP USE — RECLAIM GOLF BALL",
        );
      } else if (worldDistance(state.player, shed) < shed.radius) {
        hole.prompt = inputCopy(
          "ENTER — TRY SHED DOOR",
          "A — TRY SHED DOOR",
          "TAP USE — TRY SHED DOOR",
        );
      } else if (worldDistance(state.player, drain) < drain.radius) {
        hole.prompt = inputCopy(
          "ENTER — INSPECT SEALED DRAIN",
          "A — INSPECT SEALED DRAIN",
          "TAP USE — INSPECT SEALED DRAIN",
        );
      } else {
        hole.prompt = "";
      }

      updateJoe(dt);
      if (state.mode === "first_hole") {
        const joeDistance = worldDistance(hole.joe, state.player);
        const heartbeatStrength = clamp(
          1 - joeDistance / 54 + (hole.joe.mode === "chase" ? 0.28 : 0),
          0,
          1,
        );
        hole.heartbeatTimer -= dt;
        if (heartbeatStrength > 0.34 && hole.heartbeatTimer <= 0) {
          playHeartbeat(heartbeatStrength);
          hole.heartbeatTimer = lerp(1.15, 0.42, heartbeatStrength);
        }
      }
    }

    updateAudio();
  }

  function startIntro() {
    ensureAudio();
    state.mode = "intro";
    state.time = 0;
    state.stingerPlayed = false;
    state.status = "Every blade is in scope.";
    state.transitionAlpha = 1;
    canvas.focus();
  }

  function enterMenu() {
    clearTouchInputs(true);
    state.mode = "menu";
    state.settingsReturnMode = "menu";
    state.time = Math.max(state.time, MENU_TIME);
    state.status = "Every blade is in scope.";
    state.transitionAlpha = 0.62;
    setMotorLevel(0.018, 48);
  }

  function enterPause() {
    if (state.mode !== "first_hole") {
      return;
    }
    cancelGolfBallAim(false);
    clearTouchInputs(false);
    state.mode = "paused";
    state.pauseIndex = 0;
    state.keys.clear();
    state.gamepad.inputX = 0;
    state.gamepad.inputY = 0;
    state.gamepad.crouch = false;
    state.gamepad.sprint = false;
    state.gamepad.focus = false;
    state.transitionAlpha = 0;
    setMotorLevel(0.006, 42);
    playUiTone(176, 0.07, 0.02);
  }

  function resumeFirstHole() {
    if (state.mode !== "paused") {
      return;
    }
    state.mode = "first_hole";
    state.keys.clear();
    state.transitionAlpha = 0.16;
    playUiTone(310, 0.065, 0.022);
  }

  function activatePause() {
    if (state.pauseIndex === 0) {
      resumeFirstHole();
    } else if (state.pauseIndex === 1) {
      state.settingsReturnMode = "paused";
      state.mode = "settings";
      state.transitionAlpha = 0.22;
    } else if (state.pauseIndex === 2) {
      retryFirstHole();
    } else {
      enterMenu();
    }
  }

  function returnFromSettings() {
    if (state.settingsReturnMode === "paused") {
      state.mode = "paused";
      state.transitionAlpha = 0.12;
      playUiTone(190, 0.055, 0.018);
    } else {
      enterMenu();
    }
  }

  function activateMenu() {
    switch (state.menuIndex) {
      case 0:
        state.mode = "first_hole";
        state.time = 0;
        resetFirstHole();
        state.transitionAlpha = 1;
        state.status = "Objective: escape through the shed or drainage route.";
        break;
      case 1:
        state.settingsReturnMode = "menu";
        state.mode = "settings";
        state.transitionAlpha = 0.35;
        break;
      case 2:
        state.mode = "claim";
        state.status = "COVERAGE DENIED: unauthorized presence in the rough.";
        break;
      case 3:
        startIntro();
        break;
      case 4:
        state.mode = "clocked_out";
        state.transitionAlpha = 0.7;
        setMotorLevel(0, 40);
        break;
      default:
        break;
    }
  }

  function ensureAudio() {
    if (audioContext) {
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.value = state.volume * 0.55;
    masterGain.connect(audioContext.destination);

    ambienceBusGain = audioContext.createGain();
    mowerBusGain = audioContext.createGain();
    effectsBusGain = audioContext.createGain();
    dangerBusGain = audioContext.createGain();
    ambienceBusGain.gain.value = state.ambienceVolume;
    mowerBusGain.gain.value = state.mowerVolume;
    effectsBusGain.gain.value = state.effectsVolume;
    dangerBusGain.gain.value = state.dangerVolume;
    ambienceBusGain.connect(masterGain);
    mowerBusGain.connect(masterGain);
    effectsBusGain.connect(masterGain);
    dangerBusGain.connect(masterGain);

    motorGain = audioContext.createGain();
    motorGain.gain.value = 0;
    if (typeof audioContext.createStereoPanner === "function") {
      motorPanNode = audioContext.createStereoPanner();
      motorGain.connect(motorPanNode);
      motorPanNode.connect(mowerBusGain);
    } else {
      motorGain.connect(mowerBusGain);
    }

    motorOscillator = audioContext.createOscillator();
    motorOscillator.type = "sawtooth";
    motorOscillator.frequency.value = 82;
    motorOscillator.connect(motorGain);
    motorOscillator.start();

    cutterOscillator = audioContext.createOscillator();
    const cutterGain = audioContext.createGain();
    cutterOscillator.type = "square";
    cutterOscillator.frequency.value = 287;
    cutterGain.gain.value = 0.12;
    cutterOscillator.connect(cutterGain);
    cutterGain.connect(motorGain);
    cutterOscillator.start();

    sharedNoiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
    const noiseData = sharedNoiseBuffer.getChannelData(0);
    for (let index = 0; index < noiseData.length; index += 1) {
      noiseData[index] = Math.random() * 2 - 1;
    }
    noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = sharedNoiseBuffer;
    noiseSource.loop = true;
    noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.025;
    noiseSource.connect(noiseGain);
    noiseGain.connect(motorGain);
    noiseSource.start();

    ambienceSource = audioContext.createBufferSource();
    ambienceSource.buffer = sharedNoiseBuffer;
    ambienceSource.loop = true;
    ambienceFilter = audioContext.createBiquadFilter();
    ambienceFilter.type = "bandpass";
    ambienceFilter.frequency.value = 480;
    ambienceFilter.Q.value = 0.58;
    ambienceGain = audioContext.createGain();
    ambienceGain.gain.value = 0;
    ambienceSource.connect(ambienceFilter);
    ambienceFilter.connect(ambienceGain);
    ambienceGain.connect(ambienceBusGain);
    ambienceSource.start();

    ambienceDrone = audioContext.createOscillator();
    ambienceDrone.type = "sine";
    ambienceDrone.frequency.value = 41;
    ambienceDroneGain = audioContext.createGain();
    ambienceDroneGain.gain.value = 0;
    ambienceDrone.connect(ambienceDroneGain);
    ambienceDroneGain.connect(dangerBusGain);
    ambienceDrone.start();
  }

  function setMotorLevel(level, frequency) {
    if (!audioContext || !motorGain || !motorOscillator) {
      return;
    }
    const now = audioContext.currentTime;
    motorGain.gain.setTargetAtTime(level, now, 0.035);
    motorOscillator.frequency.setTargetAtTime(frequency, now, 0.045);
  }

  function updateAudio() {
    if (!audioContext) {
      return;
    }
    const now = audioContext.currentTime;
    const isCourse = state.mode === "first_hole";
    const pausedPresentation =
      state.mode === "paused" ||
      (state.mode === "settings" &&
        state.settingsReturnMode === "paused");
    const isQuietScreen =
      pausedPresentation ||
      ["menu", "settings", "claim", "victory", "clocked_out"].includes(state.mode);
    const ambienceLevel =
      isCourse && state.hole.focus
        ? 0.018
        : isCourse
          ? 0.032
          : isQuietScreen
            ? 0.013
            : 0.018;
    if (ambienceGain) {
      ambienceGain.gain.setTargetAtTime(ambienceLevel, now, 0.32);
    }
    if (ambienceFilter) {
      ambienceFilter.frequency.setTargetAtTime(
        420 + Math.sin(state.time * 0.19) * 120 + (isCourse ? state.hole.noise * 90 : 0),
        now,
        0.45,
      );
    }
    if (ambienceDroneGain) {
      const dangerDrone =
        isCourse && state.hole.joe.mode === "chase"
          ? 0.018
          : isCourse
            ? 0.006
            : 0.002;
      ambienceDroneGain.gain.setTargetAtTime(dangerDrone, now, 0.28);
    }
    if (state.mode === "intro") {
      if (state.time < 0.95) {
        const sputter = Math.sin(state.time * 29) * 0.5 + 0.5 >= 0.35 ? 0.07 : 0;
        setMotorLevel(sputter, 58);
      } else if (state.time < CUT_END + 0.12) {
        setMotorLevel(0.11 + Math.sin(state.time * 5.4) * 0.02, 82 + Math.sin(state.time * 7) * 5);
      } else if (state.time < LINE_END) {
        setMotorLevel(0.008, 39);
      } else {
        setMotorLevel(0.018, 48);
      }
    } else if (pausedPresentation) {
      setMotorLevel(0.006, 42);
    } else if (state.mode === "menu" || state.mode === "settings" || state.mode === "claim") {
      setMotorLevel(0.018, 48);
    } else if (state.mode === "first_hole") {
      const distance = worldDistance(state.hole.joe, state.player);
      const proximity = clamp(1 - distance / 95, 0, 1);
      const joeMode = state.hole.joe.mode;
      const listeningBoost = state.hole.focus ? 0.014 : 0;
      const modeGain =
        joeMode === "chase"
          ? 0.055
          : joeMode === "search"
            ? 0.016
            : joeMode === "investigate"
              ? 0.008
              : 0;
      const modePitch =
        joeMode === "chase"
          ? 24
          : joeMode === "search"
            ? 12
            : joeMode === "investigate"
              ? 7
              : 0;
      const cadenceSpeed =
        joeMode === "chase"
          ? 10.5
          : joeMode === "search"
            ? 6.4
            : joeMode === "investigate"
              ? 5.2
              : 3.4;
      const cadence =
        Math.sin(state.hole.elapsed * cadenceSpeed * Math.PI * 2) *
        (joeMode === "chase" ? 0.005 : 0.002);
      const routeStress = state.hole.joe.routeObstacle
        ? clamp(
            Math.abs(state.hole.joe.steeringAngle) / 1.2,
            0.12,
            1,
          )
        : 0;
      setMotorLevel(
        Math.max(
          0,
          0.008 +
            proximity * 0.048 +
            modeGain +
            listeningBoost +
            cadence +
            routeStress * 0.006,
        ),
        36 +
          proximity * 46 +
          modePitch +
          cadence * 220 +
          routeStress * 7,
      );
      if (cutterOscillator) {
        cutterOscillator.frequency.setTargetAtTime(
          238 +
            proximity * 76 +
            modePitch * 2.2 +
            routeStress * 16,
          now,
          0.055,
        );
      }
      if (motorPanNode) {
        motorPanNode.pan.setTargetAtTime(
          clamp((state.hole.joe.x - state.player.x) / 72, -0.88, 0.88),
          now,
          0.08,
        );
      }
    } else if (state.mode === "victory") {
      setMotorLevel(0, 34);
    } else if (state.mode === "defeat") {
      setMotorLevel(0.12, 92);
    }
  }

  function triggerStinger() {
    if (!audioContext || !dangerBusGain) {
      return;
    }
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(78, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(34, audioContext.currentTime + 0.55);
    gain.gain.setValueAtTime(0.13, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.62);
    oscillator.connect(gain);
    gain.connect(dangerBusGain);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.65);
  }

  function playUiTone(frequency = 210, duration = 0.07, volume = 0.025) {
    if (!audioContext || !effectsBusGain) {
      return;
    }
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(effectsBusGain);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }

  function playTransientTone(
    frequency,
    endFrequency,
    duration,
    volume,
    type = "sine",
    delay = 0,
    destination = effectsBusGain,
  ) {
    if (!audioContext || !destination) {
      return;
    }
    const start = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(1, frequency), start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
    gain.gain.setValueAtTime(Math.max(0.0001, volume), start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function playNoiseBurst(
    duration,
    volume,
    frequency,
    filterType = "lowpass",
    pan = 0,
    delay = 0,
    destination = effectsBusGain,
  ) {
    if (!audioContext || !destination || !sharedNoiseBuffer) {
      return;
    }
    const start = audioContext.currentTime + delay;
    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    source.buffer = sharedNoiseBuffer;
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(Math.max(0.0001, volume), start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    if (typeof audioContext.createStereoPanner === "function") {
      const panner = audioContext.createStereoPanner();
      panner.pan.value = clamp(pan, -1, 1);
      gain.connect(panner);
      panner.connect(destination);
    } else {
      gain.connect(destination);
    }
    source.start(start, Math.random() * 1.4);
    source.stop(start + duration + 0.02);
  }

  function playFootstep(
    inRough,
    sprinting,
    crouched = false,
    wet = false,
    sand = false,
  ) {
    const weight = crouched ? 0.45 : sprinting ? 1.25 : 1;
    playTransientTone(
      sand
        ? 138
        : wet
          ? 116
          : 92 *
            Math.max(0.7, weight),
      sand
        ? 68
        : wet
          ? 72
          : 46,
      sand || wet ? 0.09 : 0.12,
      (
        sand
          ? 0.04
          : wet
            ? 0.032
            : 0.045
      ) * weight,
      "sine",
    );
    playNoiseBurst(
      sand
        ? sprinting
          ? 0.24
          : 0.18
        : wet
        ? 0.1
        : inRough
          ? crouched
            ? 0.13
            : 0.2
          : 0.11,
      (sand
        ? 0.052
        : wet
        ? 0.03
        : inRough
          ? 0.044
          : 0.022) * weight,
      sand
        ? 980
        : wet
          ? 2100
          : inRough
            ? 1150
            : 480,
      wet || inRough || sand
        ? "bandpass"
        : "lowpass",
      (hash(state.hole.travelDistance * 9) - 0.5) * 0.35,
    );
  }

  function playSandStepCue(
    sprinting,
  ) {
    playNoiseBurst(
      0.3,
      sprinting ? 0.064 : 0.045,
      860,
      "bandpass",
    );
    playTransientTone(
      126,
      54,
      0.2,
      0.026,
      "triangle",
    );
  }

  function playHeartbeat(strength) {
    const volume = 0.026 + strength * 0.045;
    playTransientTone(74, 46, 0.13, volume, "sine", 0, dangerBusGain);
    playTransientTone(66, 42, 0.11, volume * 0.72, "sine", 0.18, dangerBusGain);
  }

  function playThreatCue(mode) {
    if (mode === "chase") {
      playTransientTone(118, 39, 0.62, 0.11, "sawtooth", 0, dangerBusGain);
      playNoiseBurst(0.28, 0.065, 920, "bandpass", 0, 0, dangerBusGain);
    } else if (mode === "search") {
      playTransientTone(94, 57, 0.34, 0.045, "triangle", 0, dangerBusGain);
    } else if (mode === "investigate") {
      playTransientTone(178, 92, 0.22, 0.038, "square", 0, dangerBusGain);
    } else {
      playTransientTone(82, 68, 0.16, 0.018, "sine", 0, dangerBusGain);
    }
  }

  function playPickupCue() {
    playTransientTone(392, 784, 0.24, 0.055, "triangle");
    playTransientTone(587, 1174, 0.3, 0.038, "sine", 0.08);
    playNoiseBurst(0.12, 0.018, 2400, "highpass");
  }

  function playChangeRequestCue() {
    playNoiseBurst(
      0.24,
      0.036,
      1900,
      "highpass",
    );
    playTransientTone(
      294,
      588,
      0.19,
      0.046,
      "square",
    );
    playTransientTone(
      440,
      880,
      0.24,
      0.034,
      "triangle",
      0.1,
    );
    playTransientTone(
      660,
      990,
      0.2,
      0.025,
      "sine",
      0.22,
    );
  }

  function playSprinklerCue() {
    playTransientTone(246, 164, 0.18, 0.035, "square");
    playNoiseBurst(0.72, 0.07, 1800, "bandpass", -0.45, 0.08);
  }

  function playMowerBogCue() {
    playTransientTone(78, 43, 0.34, 0.055, "sawtooth", 0, mowerBusGain);
    playTransientTone(64, 35, 0.28, 0.045, "square", 0.24, mowerBusGain);
    playNoiseBurst(0.42, 0.045, 360, "lowpass", 0, 0.08, mowerBusGain);
  }

  function playSandChurnCue() {
    playNoiseBurst(
      0.62,
      0.07,
      520,
      "bandpass",
      0,
      0,
      mowerBusGain,
    );
    playTransientTone(
      92,
      48,
      0.42,
      0.058,
      "sawtooth",
      0,
      mowerBusGain,
    );
    playTransientTone(
      74,
      39,
      0.32,
      0.042,
      "square",
      0.22,
      mowerBusGain,
    );
  }

  function playDrainUnlockCue() {
    playTransientTone(132, 58, 0.42, 0.062, "sawtooth", 0.08);
    playTransientTone(196, 392, 0.5, 0.035, "triangle", 0.32);
    playNoiseBurst(0.58, 0.055, 520, "lowpass", -0.42, 0.05);
  }

  function playBallReadyCue() {
    playTransientTone(
      184,
      228,
      0.08,
      0.014,
      "triangle",
    );
  }

  function playBallSwingCue(direction) {
    playNoiseBurst(
      0.11,
      0.028,
      1600,
      "bandpass",
      direction * 0.24,
    );
    playTransientTone(
      246,
      386,
      0.1,
      0.018,
      "triangle",
    );
  }

  function playBallCue(direction) {
    playNoiseBurst(0.09, 0.042, 2200, "highpass", direction * 0.48);
    playTransientTone(520, 270, 0.1, 0.026, "sine");
    playTransientTone(360, 190, 0.09, 0.032, "triangle", 0.24);
  }

  function playBallRecoveryCue(dangerous) {
    playTransientTone(
      dangerous ? 330 : 440,
      dangerous ? 220 : 660,
      0.16,
      0.036,
      "triangle",
    );
    playTransientTone(
      dangerous ? 196 : 784,
      dangerous ? 130 : 1046,
      0.19,
      0.025,
      "sine",
      0.09,
    );
    if (dangerous) {
      playNoiseBurst(
        0.16,
        0.022,
        780,
        "bandpass",
      );
    }
  }

  function playDoorRattle() {
    playTransientTone(112, 78, 0.1, 0.05, "square");
    playTransientTone(96, 70, 0.12, 0.045, "square", 0.13);
    playNoiseBurst(0.24, 0.035, 740, "bandpass");
  }

  function playVictoryCue() {
    playTransientTone(196, 392, 0.62, 0.055, "sine");
    playTransientTone(247, 494, 0.72, 0.038, "triangle", 0.08);
    playTransientTone(294, 588, 0.84, 0.032, "sine", 0.15);
  }

  function playCaptureCue() {
    triggerStinger();
    playNoiseBurst(0.5, 0.12, 680, "lowpass", 0, 0, dangerBusGain);
    playTransientTone(54, 28, 0.74, 0.13, "sawtooth", 0, dangerBusGain);
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * WIDTH / rect.width,
      y: (event.clientY - rect.top) * HEIGHT / rect.height,
    };
  }

  function menuIndexAt(point) {
    if (point.x < 88 || point.x > 478) {
      return -1;
    }
    for (let index = 0; index < MENU_ITEMS.length; index += 1) {
      const y = MENU_ITEM_START_Y + index * 61;
      if (point.y >= y && point.y <= y + 48) {
        return index;
      }
    }
    return -1;
  }

  function pauseIndexAt(point) {
    if (point.x < 390 || point.x > 890) {
      return -1;
    }
    for (let index = 0; index < PAUSE_ITEMS.length; index += 1) {
      const y = 238 + index * 68;
      if (point.y >= y && point.y <= y + 50) {
        return index;
      }
    }
    return -1;
  }

  function settingsIndexAt(point) {
    if (point.x < 684 || point.x > 1082) {
      return -1;
    }
    for (let index = 0; index < SETTINGS_ROWS.length; index += 1) {
      const row = settingsRowGeometry(index);
      if (point.y >= row.y && point.y <= row.y + row.height) {
        return index;
      }
    }
    return -1;
  }

  function pointInTouchCircle(point, control, padding = 0) {
    return (
      Math.hypot(
        point.x - control.x,
        point.y - control.y,
      ) <=
      control.radius + padding
    );
  }

  function touchControlAt(point) {
    const pause = TOUCH_CONTROLS.pause;
    if (
      point.x >= pause.x - 8 &&
      point.x <= pause.x + pause.width + 8 &&
      point.y >= pause.y - 8 &&
      point.y <= pause.y + pause.height + 8
    ) {
      return "pause";
    }
    const order = [
      "interact",
      "aim",
      "focus",
      "crouch",
      "sprint",
    ];
    for (const id of order) {
      if (
        pointInTouchCircle(
          point,
          TOUCH_CONTROLS[id],
          8,
        )
      ) {
        return id;
      }
    }
    if (
      pointInTouchCircle(
        point,
        TOUCH_CONTROLS.move,
        18,
      )
    ) {
      return "move";
    }
    return null;
  }

  function updateTouchMovement(point) {
    const move = TOUCH_CONTROLS.move;
    const range = move.radius - 20;
    const dx = point.x - move.x;
    const dy = point.y - move.y;
    const length = Math.max(
      range,
      Math.hypot(dx, dy),
    );
    state.touch.moveX = clamp(
      dx / length,
      -1,
      1,
    );
    state.touch.moveY = clamp(
      -dy / length,
      -1,
      1,
    );
  }

  function handleTouchPointerDown(
    event,
    point,
  ) {
    state.touch.seen = true;
    state.inputMethod = "touch";
    event.preventDefault();
    try {
      canvas.setPointerCapture?.(
        event.pointerId,
      );
    } catch {
      // Synthetic test events may not own a browser pointer capture.
    }
    const control = touchControlAt(point);
    if (
      state.hole.tutorialVisible
    ) {
      dismissHoleTutorial(
        control === "move",
      );
      if (!control) {
        return;
      }
    }
    if (control === "pause") {
      enterPause();
    } else if (
      control === "move" &&
      state.touch.movePointerId === null
    ) {
      state.touch.movePointerId =
        event.pointerId;
      updateTouchMovement(point);
    } else if (control === "interact") {
      if (!state.hole.ballAim.active) {
        interactWithCourse();
      }
    } else if (
      control === "aim" &&
      state.touch.aimPointerId === null
    ) {
      beginGolfBallAim("touch");
      if (
        state.hole.ballAim.active &&
        state.hole.ballAim.source ===
          "touch"
      ) {
        state.touch.aimPointerId =
          event.pointerId;
        state.touch.aimStartX = point.x;
        state.touch.aimSteer = 0;
      }
    } else if (
      control === "sprint" &&
      state.touch.sprintPointerId === null
    ) {
      state.touch.sprintPointerId =
        event.pointerId;
    } else if (
      control === "crouch" &&
      state.touch.crouchPointerId === null
    ) {
      state.touch.crouchPointerId =
        event.pointerId;
    } else if (
      control === "focus" &&
      state.touch.focusPointerId === null
    ) {
      state.touch.focusPointerId =
        event.pointerId;
    }
  }

  function handleTouchPointerMove(
    event,
    point,
  ) {
    event.preventDefault();
    state.inputMethod = "touch";
    if (
      event.pointerId ===
      state.touch.movePointerId
    ) {
      updateTouchMovement(point);
    }
    if (
      event.pointerId ===
      state.touch.aimPointerId
    ) {
      state.touch.aimSteer = clamp(
        (
          point.x -
          state.touch.aimStartX
        ) / 64,
        -1,
        1,
      );
    }
  }

  function releaseTouchPointer(
    event,
    cancelled = false,
  ) {
    if (event.pointerType !== "touch") {
      return;
    }
    event.preventDefault();
    if (
      event.pointerId ===
      state.touch.movePointerId
    ) {
      state.touch.movePointerId = null;
      state.touch.moveX = 0;
      state.touch.moveY = 0;
    }
    if (
      event.pointerId ===
      state.touch.aimPointerId
    ) {
      if (
        state.mode === "first_hole" &&
        state.hole.ballAim.active &&
        state.hole.ballAim.source ===
          "touch"
      ) {
        if (cancelled) {
          cancelGolfBallAim(false);
        } else {
          commitGolfBallAim();
        }
      }
      state.touch.aimPointerId = null;
      state.touch.aimStartX = 0;
      state.touch.aimSteer = 0;
    }
    if (
      event.pointerId ===
      state.touch.sprintPointerId
    ) {
      state.touch.sprintPointerId = null;
    }
    if (
      event.pointerId ===
      state.touch.crouchPointerId
    ) {
      state.touch.crouchPointerId = null;
    }
    if (
      event.pointerId ===
      state.touch.focusPointerId
    ) {
      state.touch.focusPointerId = null;
    }
    try {
      canvas.releasePointerCapture?.(
        event.pointerId,
      );
    } catch {
      // The browser may have released a cancelled contact already.
    }
  }

  function handlePointerDown(event) {
    const point = canvasPoint(event);
    const touchPointer =
      event.pointerType === "touch";
    if (
      !touchPointer &&
      state.inputMethod === "touch"
    ) {
      clearTouchInputs(true);
    }
    state.inputMethod = touchPointer
      ? "touch"
      : "keyboard";
    if (touchPointer) {
      state.touch.seen = true;
      event.preventDefault();
    }
    canvas.focus();
    if (state.mode === "gate") {
      startIntro();
    } else if (state.mode === "intro") {
      enterMenu();
    } else if (state.mode === "menu" || state.mode === "claim") {
      if (
        point.x >= 558 &&
        point.x <= 1208 &&
        point.y >= 510 &&
        point.y <= 636
      ) {
        toggleOvertimeAudit();
        return;
      }
      const index = menuIndexAt(point);
      if (index >= 0) {
        state.menuIndex = index;
        playUiTone(255, 0.06, 0.025);
        activateMenu();
      }
    } else if (state.mode === "settings") {
      if (
        point.x >= 690 &&
        point.x <= 1060 &&
        point.y >= 548 &&
        point.y <= 596
      ) {
        returnFromSettings();
      } else {
        const index = settingsIndexAt(point);
        if (index >= 0) {
          state.settingsIndex = index;
          const setting = SETTINGS_ROWS[index];
          if (setting.type === "slider" && point.x >= 850) {
            applyAudioSetting(setting.key, (point.x - 868) / 152);
            playMixPreview(setting.id);
          } else if (setting.type === "toggle") {
            state[setting.key] = !state[setting.key];
            savePreferences();
            playUiTone(state[setting.key] ? 320 : 210, 0.055, 0.02);
          }
        }
      }
    } else if (state.mode === "paused") {
      const index = pauseIndexAt(point);
      if (index >= 0) {
        state.pauseIndex = index;
        playUiTone(255, 0.06, 0.025);
        activatePause();
      }
    } else if (state.mode === "first_hole") {
      if (touchPointer) {
        handleTouchPointerDown(
          event,
          point,
        );
      } else if (state.hole.tutorialVisible) {
        dismissHoleTutorial(false);
      } else if (
        point.x >= WIDTH - 132 &&
        point.x <= WIDTH - 20 &&
        point.y >= HEIGHT - 54
      ) {
        enterPause();
      }
    } else if (state.mode === "clocked_out") {
      enterMenu();
    } else if (state.mode === "victory" || state.mode === "defeat") {
      retryFirstHole();
    }
  }

  function handlePointerMove(event) {
    if (
      event.pointerType === "touch"
    ) {
      if (state.mode === "first_hole") {
        handleTouchPointerMove(
          event,
          canvasPoint(event),
        );
      }
      return;
    }
    if (
      state.mode !== "menu" &&
      state.mode !== "claim" &&
      state.mode !== "paused" &&
      state.mode !== "settings"
    ) {
      return;
    }
    if (state.inputMethod === "touch") {
      clearTouchInputs(true);
    }
    state.inputMethod = "keyboard";
    if (state.mode === "settings") {
      const index = settingsIndexAt(canvasPoint(event));
      if (index >= 0 && index !== state.settingsIndex) {
        state.settingsIndex = index;
        playUiTone(190 + index * 12, 0.04, 0.012);
      }
    } else if (state.mode === "paused") {
      const index = pauseIndexAt(canvasPoint(event));
      if (index >= 0 && index !== state.pauseIndex) {
        state.pauseIndex = index;
        playUiTone(190 + index * 14, 0.045, 0.016);
      }
    } else {
      const index = menuIndexAt(canvasPoint(event));
      if (index >= 0 && index !== state.menuIndex) {
        state.menuIndex = index;
        playUiTone(190 + index * 14, 0.045, 0.016);
      }
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      canvas.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  function applyAudioSetting(key, value) {
    state[key] = clamp(value, 0, 1);
    if (audioContext) {
      const gainTargets = {
        volume: { node: masterGain, scale: 0.55 },
        ambienceVolume: { node: ambienceBusGain, scale: 1 },
        mowerVolume: { node: mowerBusGain, scale: 1 },
        effectsVolume: { node: effectsBusGain, scale: 1 },
        dangerVolume: { node: dangerBusGain, scale: 1 },
      };
      const target = gainTargets[key];
      if (target?.node) {
        target.node.gain.setTargetAtTime(
          state[key] * target.scale,
          audioContext.currentTime,
          0.025,
        );
      }
    }
    savePreferences();
  }

  function playMixPreview(id) {
    if (id === "ambience") {
      playNoiseBurst(0.18, 0.022, 620, "bandpass", 0, 0, ambienceBusGain);
    } else if (id === "mower") {
      playTransientTone(82, 58, 0.16, 0.045, "sawtooth", 0, mowerBusGain);
    } else if (id === "danger") {
      playHeartbeat(0.55);
    } else {
      playUiTone(260, 0.055, 0.022);
    }
  }

  function dismissHoleTutorial(startedMoving = false) {
    if (!state.hole.tutorialVisible) {
      return;
    }
    state.hole.tutorialVisible = false;
    recordRoundStart();
    state.hole.hasMoved = startedMoving;
    state.hole.prompt = "";
    setHoleMessage(
      state.hole.overtime
        ? "OVERTIME ACTIVE — two balls, faster Joe, stronger evidence, 1.30× score."
        : "Choose a route: key to shed, or sprinkler to drain.",
      3.6,
    );
    playUiTone(360, 0.09, 0.03);
  }

  function retryFirstHole() {
    const retryVariant =
      activeRunVariant();
    state.mode = "first_hole";
    state.time = 0;
    resetFirstHole(retryVariant);
    state.transitionAlpha = 0.8;
  }

  function selectSettings(direction) {
    state.settingsIndex =
      (state.settingsIndex + direction + SETTINGS_ROWS.length) %
      SETTINGS_ROWS.length;
    playUiTone(198 + state.settingsIndex * 20, 0.045, 0.016);
  }

  function adjustSelectedSetting(direction) {
    const setting = SETTINGS_ROWS[state.settingsIndex];
    if (setting.type === "slider") {
      applyAudioSetting(
        setting.key,
        state[setting.key] + direction * 0.05,
      );
      playMixPreview(setting.id);
    } else {
      state[setting.key] = !state[setting.key];
      savePreferences();
      playUiTone(state[setting.key] ? 320 : 210, 0.055, 0.02);
    }
  }

  function handleGamepadConfirm() {
    if (state.mode === "gate") {
      startIntro();
    } else if (state.mode === "intro") {
      enterMenu();
    } else if (state.mode === "menu" || state.mode === "claim") {
      playUiTone(285, 0.07, 0.025);
      activateMenu();
    } else if (state.mode === "settings") {
      adjustSelectedSetting(1);
    } else if (state.mode === "paused") {
      activatePause();
    } else if (state.mode === "first_hole") {
      if (state.hole.tutorialVisible) {
        dismissHoleTutorial(false);
      } else if (state.hole.ballAim.active) {
        return;
      } else {
        interactWithCourse();
      }
    } else if (state.mode === "victory" || state.mode === "defeat") {
      retryFirstHole();
    } else if (state.mode === "clocked_out") {
      enterMenu();
    }
  }

  function handleGamepadBack() {
    if (
      state.mode === "first_hole" &&
      state.hole.ballAim.active
    ) {
      cancelGolfBallAim();
    } else if (state.mode === "intro") {
      enterMenu();
    } else if (state.mode === "first_hole") {
      enterPause();
    } else if (state.mode === "paused") {
      resumeFirstHole();
    } else if (state.mode === "settings") {
      returnFromSettings();
    } else if (
      state.mode === "claim" ||
      state.mode === "victory" ||
      state.mode === "defeat" ||
      state.mode === "clocked_out"
    ) {
      enterMenu();
    }
  }

  function pollGamepad() {
    const pads =
      typeof navigator.getGamepads === "function"
        ? navigator.getGamepads()
        : [];
    let pad = null;
    for (let index = 0; index < pads.length; index += 1) {
      if (pads[index] && pads[index].connected !== false) {
        pad = pads[index];
        break;
      }
    }
    if (!pad) {
      if (
        state.hole?.ballAim?.active &&
        state.hole.ballAim.source === "gamepad"
      ) {
        cancelGolfBallAim(false);
      }
      state.gamepad.connected = false;
      state.gamepad.id = "";
      state.gamepad.inputX = 0;
      state.gamepad.inputY = 0;
      state.gamepad.crouch = false;
      state.gamepad.sprint = false;
      state.gamepad.focus = false;
      state.gamepad.previousButtons = [];
      state.gamepad.previousDirections = {
        up: false,
        down: false,
        left: false,
        right: false,
      };
      return;
    }

    const buttonDown = (index) =>
      Boolean(
        pad.buttons?.[index]?.pressed ||
        (pad.buttons?.[index]?.value || 0) > 0.5,
      );
    const axisValue = (index) => {
      const value = pad.axes?.[index] || 0;
      const magnitude = Math.abs(value);
      if (magnitude <= 0.22) {
        return 0;
      }
      return Math.sign(value) * (magnitude - 0.22) / 0.78;
    };
    const currentButtons = [];
    for (let index = 0; index < Math.max(16, pad.buttons?.length || 0); index += 1) {
      currentButtons[index] = buttonDown(index);
    }
    const pressed = (index) =>
      currentButtons[index] && !state.gamepad.previousButtons[index];
    const released = (index) =>
      !currentButtons[index] &&
      state.gamepad.previousButtons[index];
    let inputX = axisValue(0);
    let inputY = -axisValue(1);
    if (buttonDown(14)) {
      inputX = -1;
    } else if (buttonDown(15)) {
      inputX = 1;
    }
    if (buttonDown(12)) {
      inputY = 1;
    } else if (buttonDown(13)) {
      inputY = -1;
    }
    const directions = {
      up: inputY > 0.55,
      down: inputY < -0.55,
      left: inputX < -0.55,
      right: inputX > 0.55,
    };
    const directionPressed = (direction) =>
      directions[direction] &&
      !state.gamepad.previousDirections[direction];
    const meaningfulInput =
      Math.hypot(inputX, inputY) > 0.18 ||
      currentButtons.some(Boolean);

    state.gamepad.connected = true;
    state.gamepad.id = pad.id || "Gamepad";
    state.gamepad.inputX = inputX;
    state.gamepad.inputY = inputY;
    state.gamepad.crouch = buttonDown(4);
    state.gamepad.focus = buttonDown(6);
    state.gamepad.sprint = buttonDown(7) || buttonDown(5);
    if (meaningfulInput) {
      if (
        state.inputMethod === "touch"
      ) {
        clearTouchInputs(true);
      }
      state.inputMethod = "gamepad";
    }

    if (state.mode === "menu" || state.mode === "claim") {
      if (directionPressed("down")) {
        state.menuIndex = (state.menuIndex + 1) % MENU_ITEMS.length;
        playUiTone(190 + state.menuIndex * 14, 0.045, 0.016);
      } else if (directionPressed("up")) {
        state.menuIndex =
          (state.menuIndex + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
        playUiTone(190 + state.menuIndex * 14, 0.045, 0.016);
      }
      if (pressed(5)) {
        toggleOvertimeAudit();
      }
    } else if (state.mode === "settings") {
      if (directionPressed("down")) {
        selectSettings(1);
      } else if (directionPressed("up")) {
        selectSettings(-1);
      } else if (directionPressed("left")) {
        adjustSelectedSetting(-1);
      } else if (directionPressed("right")) {
        adjustSelectedSetting(1);
      }
    } else if (state.mode === "paused") {
      if (directionPressed("down")) {
        state.pauseIndex =
          (state.pauseIndex + 1) % PAUSE_ITEMS.length;
        playUiTone(190 + state.pauseIndex * 14, 0.045, 0.016);
      } else if (directionPressed("up")) {
        state.pauseIndex =
          (state.pauseIndex + PAUSE_ITEMS.length - 1) % PAUSE_ITEMS.length;
        playUiTone(190 + state.pauseIndex * 14, 0.045, 0.016);
      }
    } else if (
      state.mode === "first_hole" &&
      state.hole.tutorialVisible &&
      Math.hypot(inputX, inputY) > 0.18
    ) {
      dismissHoleTutorial(true);
    }

    if (pressed(0)) {
      handleGamepadConfirm();
    }
    if (pressed(2) && state.mode === "first_hole") {
      if (state.hole.tutorialVisible) {
        dismissHoleTutorial(false);
      } else {
        beginGolfBallAim("gamepad");
      }
    }
    if (
      released(2) &&
      state.mode === "first_hole" &&
      state.hole.ballAim.active &&
      state.hole.ballAim.source === "gamepad"
    ) {
      commitGolfBallAim();
    }
    if (pressed(3) && state.mode === "first_hole") {
      state.hole.controlHintTimer = 8;
      playUiTone(220, 0.045, 0.015);
    }
    if (pressed(1)) {
      handleGamepadBack();
    }
    if (pressed(9)) {
      if (state.mode === "gate") {
        startIntro();
      } else if (state.mode === "first_hole") {
        enterPause();
      } else if (state.mode === "paused") {
        resumeFirstHole();
      } else if (state.mode !== "menu") {
        handleGamepadBack();
      }
    }

    state.gamepad.previousButtons = currentButtons;
    state.gamepad.previousDirections = directions;
  }

  window.addEventListener("keydown", (event) => {
    if (state.inputMethod === "touch") {
      clearTouchInputs(true);
    }
    state.inputMethod = "keyboard";
    state.keys.add(event.code);
    if (event.code === "KeyF") {
      toggleFullscreen();
      event.preventDefault();
      return;
    }
    if (state.mode === "gate" && (event.code === "Enter" || event.code === "Space")) {
      startIntro();
      event.preventDefault();
    } else if (state.mode === "intro" && ["Enter", "Space", "Escape"].includes(event.code)) {
      enterMenu();
      event.preventDefault();
    } else if (state.mode === "menu" || state.mode === "claim") {
      if (event.code === "KeyR" && !event.repeat) {
        toggleOvertimeAudit();
        event.preventDefault();
      } else if (event.code === "ArrowDown") {
        state.menuIndex = (state.menuIndex + 1) % MENU_ITEMS.length;
        playUiTone(190 + state.menuIndex * 14, 0.045, 0.016);
        event.preventDefault();
      } else if (event.code === "ArrowUp") {
        state.menuIndex = (state.menuIndex + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
        playUiTone(190 + state.menuIndex * 14, 0.045, 0.016);
        event.preventDefault();
      } else if (event.code === "Enter" || event.code === "Space") {
        playUiTone(285, 0.07, 0.025);
        activateMenu();
        event.preventDefault();
      }
    } else if (state.mode === "settings" && event.code === "Escape") {
      returnFromSettings();
      event.preventDefault();
    } else if (state.mode === "settings") {
      if (event.code === "ArrowDown") {
        selectSettings(1);
        event.preventDefault();
      } else if (event.code === "ArrowUp") {
        selectSettings(-1);
        event.preventDefault();
      } else if (event.code === "ArrowLeft") {
        adjustSelectedSetting(-1);
        event.preventDefault();
      } else if (event.code === "ArrowRight") {
        adjustSelectedSetting(1);
        event.preventDefault();
      } else if (
        (event.code === "Enter" || event.code === "Space") &&
        !event.repeat
      ) {
        adjustSelectedSetting(1);
        event.preventDefault();
      }
    } else if (state.mode === "paused") {
      if (event.code === "ArrowDown") {
        state.pauseIndex =
          (state.pauseIndex + 1) % PAUSE_ITEMS.length;
        playUiTone(190 + state.pauseIndex * 14, 0.045, 0.016);
        event.preventDefault();
      } else if (event.code === "ArrowUp") {
        state.pauseIndex =
          (state.pauseIndex + PAUSE_ITEMS.length - 1) % PAUSE_ITEMS.length;
        playUiTone(190 + state.pauseIndex * 14, 0.045, 0.016);
        event.preventDefault();
      } else if (
        (event.code === "Enter" || event.code === "Space") &&
        !event.repeat
      ) {
        activatePause();
        event.preventDefault();
      } else if (event.code === "Escape") {
        resumeFirstHole();
        event.preventDefault();
      }
    } else if (state.mode === "first_hole") {
      const startKeys = [
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "KeyC",
        "KeyQ",
        "Enter",
        "Space",
      ];
      if (state.hole.tutorialVisible && startKeys.includes(event.code)) {
        dismissHoleTutorial(!["Enter", "Space"].includes(event.code));
        event.preventDefault();
      } else if (event.code === "Escape") {
        if (state.hole.ballAim.active) {
          cancelGolfBallAim();
        } else {
          enterPause();
        }
        event.preventDefault();
      } else if (event.code === "KeyH") {
        state.hole.controlHintTimer = 8;
        playUiTone(220, 0.045, 0.015);
        event.preventDefault();
      } else if (event.code === "Enter" && !event.repeat) {
        if (!state.hole.ballAim.active) {
          interactWithCourse();
        }
        event.preventDefault();
      } else if (event.code === "Space" && !event.repeat) {
        beginGolfBallAim("keyboard");
        event.preventDefault();
      }
    } else if (state.mode === "victory" || state.mode === "defeat") {
      if (event.code === "Escape") {
        enterMenu();
        event.preventDefault();
      } else if ((event.code === "Enter" || event.code === "Space") && !event.repeat) {
        retryFirstHole();
        event.preventDefault();
      }
    } else if (state.mode === "clocked_out" && (event.code === "Enter" || event.code === "Space")) {
      enterMenu();
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    state.keys.delete(event.code);
    if (
      event.code === "Space" &&
      state.mode === "first_hole" &&
      state.hole.ballAim.active &&
      state.hole.ballAim.source === "keyboard"
    ) {
      commitGolfBallAim();
      event.preventDefault();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.mode === "first_hole") {
      enterPause();
    }
  });

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener(
    "pointerup",
    (event) =>
      releaseTouchPointer(event, false),
  );
  canvas.addEventListener(
    "pointercancel",
    (event) =>
      releaseTouchPointer(event, true),
  );

  window.render_game_to_text = () => JSON.stringify({
    coordinateSystem: "Canvas origin is top-left; +x points right; +y points down; canvas is 1280x720.",
    mode: state.mode,
    introTimeSeconds: Number(state.time.toFixed(2)),
    selectedMenuItem: state.mode === "menu" || state.mode === "claim"
      ? MENU_ITEMS[state.menuIndex]
      : null,
    selectedPauseItem:
      state.mode === "paused"
        ? PAUSE_ITEMS[state.pauseIndex]
        : null,
    nextNightOrder:
      state.mode === "menu" || state.mode === "claim"
        ? {
            id: runVariantForRound(
              state.career.roundsStarted,
            ).id,
            number: runVariantForRound(
              state.career.roundsStarted,
            ).number,
            name: runVariantForRound(
              state.career.roundsStarted,
            ).name,
          }
        : null,
    challenge: {
      id: "overtime_audit",
      unlocked: overtimeUnlocked(),
      selected:
        overtimeUnlocked() &&
        state.overtimeSelected,
      unlockProgress: {
        cleared:
          state.career.completedVariants.length,
        required: RUN_VARIANTS.length,
      },
      modifiers: {
        startingGolfBalls: 2,
        joeSpeedMultiplier:
          OVERTIME_JOE_SPEED_MULTIPLIER,
        detectionMultiplier:
          OVERTIME_DETECTION_MULTIPLIER,
        scoreMultiplier:
          OVERTIME_SCORE_MULTIPLIER,
        strongerEvidence: true,
      },
    },
    dialogue: state.mode === "intro" && state.time >= LINE_START && state.time <= LINE_END
      ? { text: "HERE'S JOEY!", delivery: "subtitle_only" }
      : null,
    status: state.status,
    course: {
      length: COURSE_LENGTH,
      playerCollisionRadius: PLAYER_COLLISION_RADIUS,
      zone:
        ["first_hole", "paused"].includes(state.mode) ||
        (state.mode === "settings" &&
          state.settingsReturnMode === "paused")
        ? courseZoneAt(state.player.y).id
        : null,
      zones: COURSE_ZONES.map((zone) => ({
        id: zone.id,
        start: zone.start,
        end: Math.min(zone.end, COURSE_LENGTH),
      })),
      bunkerSandZones:
        BUNKER_SAND_ZONES.map(
          (zone) => ({
            id: zone.id,
            name: zone.name,
            x: zone.x,
            y: zone.y,
            radiusX:
              zone.radiusX,
            radiusY:
              zone.radiusY,
          }),
        ),
    },
    settings: {
      volume: Number(state.volume.toFixed(2)),
      ambienceVolume: Number(state.ambienceVolume.toFixed(2)),
      mowerVolume: Number(state.mowerVolume.toFixed(2)),
      effectsVolume: Number(state.effectsVolume.toFixed(2)),
      dangerVolume: Number(state.dangerVolume.toFixed(2)),
      subtitles: state.subtitles,
      reducedMotion: state.reducedMotion,
      returnTarget: state.settingsReturnMode,
      persisted: preferencesStorageAvailable,
      selected:
        SETTINGS_ROWS[state.settingsIndex].id,
    },
    career: {
      persisted: careerStorageAvailable,
      roundsStarted: state.career.roundsStarted,
      escapes: state.career.escapes,
      captures: state.career.captures,
      overtimeEscapes:
        state.career.overtimeEscapes,
      overtimeCaptures:
        state.career.overtimeCaptures,
      overtimeBest:
        state.career.overtimeBest,
      nightOrdersCleared:
        state.career.completedVariants.length,
      completedVariants:
        state.career.completedVariants.slice(),
      changeRequestsFiled:
        state.career.filedChangeRequests.length,
      filedChangeRequests:
        state.career.filedChangeRequests.slice(),
      bestOverall: bestCareerRecord(),
      routes: {
        shed: state.career.routes.shed,
        drain: state.career.routes.drain,
      },
    },
    input: {
      activeMethod: state.inputMethod,
      gamepadConnected: state.gamepad.connected,
      gamepadId: state.gamepad.id || null,
      movement: {
        x: Number(state.gamepad.inputX.toFixed(2)),
        y: Number(state.gamepad.inputY.toFixed(2)),
      },
      crouchHeld: crouchHeld(),
      sprintHeld: sprintHeld(),
      focusHeld: focusHeld(),
      touch: {
        seen: state.touch.seen,
        controlsVisible:
          state.inputMethod ===
            "touch" &&
          state.mode === "first_hole" &&
          !state.hole.tutorialVisible,
        movement: {
          x: Number(
            state.touch.moveX.toFixed(2),
          ),
          y: Number(
            state.touch.moveY.toFixed(2),
          ),
        },
        aimSteer: Number(
          state.touch.aimSteer.toFixed(2),
        ),
        held: {
          move:
            state.touch.movePointerId !==
            null,
          aim:
            state.touch.aimPointerId !==
            null,
          sprint:
            state.touch.sprintPointerId !==
            null,
          crouch:
            state.touch.crouchPointerId !==
            null,
          focus:
            state.touch.focusPointerId !==
            null,
        },
      },
    },
    audio: {
      initialized: Boolean(audioContext),
      ambience: Boolean(ambienceGain),
      spatialMower: Boolean(motorPanNode),
      mix: {
        master: Number(state.volume.toFixed(2)),
        ambience: Number(state.ambienceVolume.toFixed(2)),
        mower: Number(state.mowerVolume.toFixed(2)),
        effects: Number(state.effectsVolume.toFixed(2)),
        danger: Number(state.dangerVolume.toFixed(2)),
      },
      routing: {
        ambienceBus: Boolean(ambienceBusGain),
        mowerBus: Boolean(mowerBusGain),
        effectsBus: Boolean(effectsBusGain),
        dangerBus: Boolean(dangerBusGain),
      },
      heartbeatActive:
        state.mode === "first_hole" &&
        (state.hole.joe.mode === "chase" ||
          worldDistance(state.hole.joe, state.player) < 36),
    },
    player:
      ["first_hole", "paused", "victory", "defeat"].includes(state.mode) ||
      (state.mode === "settings" &&
        state.settingsReturnMode === "paused")
      ? {
          x: Math.round(state.player.x),
          progress: Math.round(state.player.y),
          progressPercent: Math.round(state.player.y / COURSE_LENGTH * 100),
          headingRadians: Number(state.player.heading.toFixed(2)),
          travelDistance: Math.round(state.hole.travelDistance),
          shedDistance: Math.max(0, Math.round(COURSE_LENGTH - state.player.y)),
          inRough: playerInRough(),
          surface:
            (state.hole.environment ||
              getPlayerEnvironmentState()).turfLabel,
          onMowedStrip:
            (state.hole.environment ||
              getPlayerEnvironmentState()).mowed,
          onWetTurf:
            (state.hole.environment ||
              getPlayerEnvironmentState()).wet,
          onBunkerSand:
            (state.hole.environment ||
              getPlayerEnvironmentState()).sand,
          movementSpeedMultiplier:
            (
              state.hole.environment ||
              getPlayerEnvironmentState()
            ).sand
              ? SAND_PLAYER_SPEED_MULTIPLIER
              : 1,
          crouched: state.hole.crouched,
          focus: state.hole.focus,
          concealment: Number(state.hole.concealment.toFixed(2)),
          clearance: Number(nearestObstacleClearance(state.player).toFixed(2)),
          zone: courseZoneAt(state.player.y).id,
          openingForeground: {
            visibility: Number(getOpeningForegroundTransform().visibility.toFixed(2)),
            departure: Number(getOpeningForegroundTransform().departure.toFixed(2)),
            cameraTravel: Number(getOpeningForegroundTransform().cameraTravel.toFixed(2)),
            screenX: Math.round(getOpeningForegroundTransform().x),
            screenY: Math.round(getOpeningForegroundTransform().y),
          },
        }
      : null,
    hole:
      ["first_hole", "paused", "victory", "defeat"].includes(state.mode) ||
      (state.mode === "settings" &&
        state.settingsReturnMode === "paused")
      ? {
          variant: {
            id: activeRunVariant().id,
            number: activeRunVariant().number,
            name: activeRunVariant().name,
            briefing: activeRunVariant().briefing,
            key: {
              x: activeKeyPoint().x,
              y: activeKeyPoint().y,
              interactionRadius: activeKeyPoint().radius,
              obstacleClearance: Number(
                (
                  nearestObstacleClearance(
                    activeKeyPoint(),
                  ) -
                  PLAYER_COLLISION_RADIUS
                ).toFixed(2),
              ),
            },
            sprinkler: {
              x: activeSprinklerPoint().x,
              y: activeSprinklerPoint().y,
              interactionRadius:
                activeSprinklerPoint().radius,
              obstacleClearance: Number(
                (
                  nearestObstacleClearance(
                    activeSprinklerPoint(),
                  ) -
                  PLAYER_COLLISION_RADIUS
                ).toFixed(2),
              ),
            },
            changeRequest: {
              id: activeChangeRequest().id,
              code: activeChangeRequest().code,
              x: activeChangeRequest().x,
              y: activeChangeRequest().y,
              interactionRadius:
                activeChangeRequest().radius,
              hint: activeChangeRequest().hint,
              bonus: CHANGE_REQUEST_BONUS,
              obstacleClearance: Number(
                (
                  nearestObstacleClearance(
                    activeChangeRequest(),
                  ) -
                  PLAYER_COLLISION_RADIUS
                ).toFixed(2),
              ),
            },
            joeOpeningPatrol: {
              x: activeRunVariant().joeStart.x,
              y: activeRunVariant().joeStart.y,
              waypoint:
                activeRunVariant().joeStart.patrolIndex,
            },
          },
          phase: state.hole.phase,
          overtime: state.hole.overtime,
          tutorialVisible: state.hole.tutorialVisible,
          hudExpanded:
            state.hole.controlHintTimer > 0.01 ||
            state.hole.focus,
          controlHintSeconds: Number(
            state.hole.controlHintTimer.toFixed(2),
          ),
          performance: {
            elapsedSeconds: Number(
              state.hole.elapsed.toFixed(2),
            ),
            maxDetection: Number(
              state.hole.maxDetection.toFixed(2),
            ),
            pursuitSeconds: Number(
              state.hole.pursuitSeconds.toFixed(2),
            ),
            crouchedSeconds: Number(
              state.hole.crouchedSeconds.toFixed(2),
            ),
            sprintSeconds: Number(
              state.hole.sprintSeconds.toFixed(2),
            ),
            chaseCount: state.hole.chaseCount,
            chaseBreaks: state.hole.chaseBreaks,
            closeCalls: state.hole.closeCalls,
            closestJoeDistance: Number.isFinite(
              state.hole.closestJoeDistance,
            )
              ? Number(
                  state.hole.closestJoeDistance.toFixed(2),
                )
              : null,
          },
          result: state.hole.result,
          keyCollected: state.hole.keyCollected,
          changeRequest: {
            collected:
              state.hole.changeRequestCollected,
            filesOnEscape: true,
            bonus: CHANGE_REQUEST_BONUS,
            distance: Math.round(
              worldDistance(
                state.player,
                activeChangeRequest(),
              ),
            ),
            filedForThisOrder:
              state.career.filedChangeRequests.includes(
                activeRunVariant().id,
              ),
          },
          drainUnlocked: state.hole.drainUnlocked,
          escapeRoute: state.hole.escapeRoute,
          golfBalls: state.hole.golfBalls,
          golfBallCapacity:
            golfBallCapacity(),
          ballsRecovered:
            state.hole.ballsRecovered,
          recoverableBalls:
            state.hole.recoverableBalls.map(
              (ball) => {
                const danger =
                  golfBallDangerState(ball);
                return {
                  id: ball.id,
                  x: Math.round(ball.x),
                  y: Math.round(ball.y),
                  distance: Math.round(
                    worldDistance(
                      state.player,
                      ball,
                    ),
                  ),
                  joeDistance: Math.round(
                    danger.joeDistance,
                  ),
                  dangerous:
                    danger.dangerous,
                  activeLure:
                    danger.activeLure,
                  wet: ball.wet,
                  ageSeconds: Number(
                    (
                      state.hole.elapsed -
                      ball.landedAt
                    ).toFixed(2),
                  ),
                  interactionRadius:
                    BALL_RECOVERY_RADIUS,
                };
              },
            ),
          ballThrowsUsed: state.hole.ballThrowsUsed,
          golfShot: {
            aiming: state.hole.ballAim.active,
            source: state.hole.ballAim.source,
            power: Number(
              state.hole.ballAim.power.toFixed(2),
            ),
            angleRadians: Number(
              state.hole.ballAim.angle.toFixed(2),
            ),
            target: state.hole.ballAim.target
              ? {
                  x: Math.round(
                    state.hole.ballAim.target.x,
                  ),
                  y: Math.round(
                    state.hole.ballAim.target.y,
                  ),
                  distance: Math.round(
                    worldDistance(
                      state.player,
                      state.hole.ballAim.target,
                    ),
                  ),
                }
              : null,
            flight: state.hole.ballFlight
              ? {
                  target: {
                    x: Math.round(
                      state.hole.ballFlight.target.x,
                    ),
                    y: Math.round(
                      state.hole.ballFlight.target.y,
                    ),
                  },
                  progress: Number(
                    (
                      state.hole.ballFlight.elapsed /
                      state.hole.ballFlight.duration
                    ).toFixed(2),
                  ),
                }
              : null,
            distractionTarget:
              state.hole.distraction
                ? {
                    x: Math.round(
                      state.hole.distraction.x,
                    ),
                    y: Math.round(
                      state.hole.distraction.y,
                    ),
                  }
                : null,
          },
          distractionSecondsRemaining: Number(
            state.hole.distractionTimer.toFixed(2),
          ),
          sprinklers: {
            used: state.hole.sprinklerUsed,
            soakSecondsRemaining: Number(
              state.hole.sprinklerSoakTimer.toFixed(2),
            ),
            durationSeconds:
              SPRINKLER_SOAK_SECONDS,
            mowerSpeedMultiplier:
              WET_MOWER_SPEED_MULTIPLIER,
            activeZones:
              state.hole.sprinklerSoakTimer > 0
                ? SPRINKLER_SOAK_ZONES.map(
                    (zone) => ({
                      id: zone.id,
                      x: zone.x,
                      y: zone.y,
                      radius: zone.radius,
                    }),
                  )
                : [],
            joeBogEntries:
              state.hole.wetTrapCount,
            joeBogSeconds: Number(
              state.hole.wetTrapSeconds.toFixed(2),
            ),
          },
          bunkers: {
            playerInSand:
              Boolean(
                (
                  state.hole.environment ||
                  getPlayerEnvironmentState()
                ).sand,
              ),
            activeZone:
              (
                state.hole.environment ||
                getPlayerEnvironmentState()
              ).sand
                ? (
                    state.hole.environment ||
                    getPlayerEnvironmentState()
                  ).sandZone?.id ||
                  null
                : null,
            nearestZone:
              (
                state.hole.environment ||
                getPlayerEnvironmentState()
              ).sandZone?.id ||
              null,
            playerSpeedMultiplier:
              SAND_PLAYER_SPEED_MULTIPLIER,
            mowerSpeedMultiplier:
              SAND_MOWER_SPEED_MULTIPLIER,
            trapBonusEach:
              BUNKER_TRAP_BONUS,
            trapBonusCap: 2,
            zoneEntries:
              state.hole.sandZoneEntries,
            playerSeconds: Number(
              state.hole.sandSeconds.toFixed(
                2,
              ),
            ),
            tracksCreated:
              state.hole.sandTrackCount,
            joeTrapEntries:
              state.hole.sandTrapCount,
            joeTrapSeconds: Number(
              state.hole.sandTrapSeconds.toFixed(
                2,
              ),
            ),
          },
          noise: Number(state.hole.noise.toFixed(2)),
          turf: {
            mowedMarks:
              state.hole.turfMarks.filter(
                (mark) => mark.kind === "mowed",
              ).length,
            freshTracks:
              state.hole.turfMarks.filter(
                (mark) => mark.kind === "track",
              ).length,
            divots:
              state.hole.turfMarks.filter(
                (mark) => mark.kind === "divot",
              ).length,
            tracksCreated:
              state.hole.tracksCreated,
            wetTracks:
              state.hole.wetTrackCount,
            sandTracks:
              state.hole.sandTrackCount,
            tracksDiscovered:
              state.hole.tracksDiscovered,
            nearestTrack:
              (state.hole.environment ||
                getPlayerEnvironmentState())
                .nearestTrack
                ? {
                    distance: Number(
                      (
                        state.hole.environment ||
                        getPlayerEnvironmentState()
                      ).nearestTrackDistance.toFixed(2),
                    ),
                    discovered:
                      (
                        state.hole.environment ||
                        getPlayerEnvironmentState()
                      ).nearestTrack.discovered,
                    ageSeconds: Number(
                      (
                        state.hole.environment ||
                        getPlayerEnvironmentState()
                      ).nearestTrack.age.toFixed(2),
                    ),
                    durationSeconds: Number(
                      (
                        state.hole.environment ||
                        getPlayerEnvironmentState()
                      ).nearestTrack.duration.toFixed(2),
                    ),
                    strength: Number(
                      (
                        state.hole.environment ||
                        getPlayerEnvironmentState()
                      ).nearestTrack.strength.toFixed(2),
                    ),
                    wet:
                      (
                        state.hole.environment ||
                        getPlayerEnvironmentState()
                      ).nearestTrack.wet,
                    sand:
                      (
                        state.hole.environment ||
                        getPlayerEnvironmentState()
                      ).nearestTrack.sand,
                  }
                : null,
          },
          detection: {
            attention: Number(
              state.hole.detection.toFixed(2),
            ),
            source: state.hole.detectionSource,
            warning: state.hole.detectionWarning,
            playerAudible: state.hole.playerAudible,
            visibilityRange: Number(
              state.hole.visibilityRange.toFixed(2),
            ),
            hearingRange: Number(
              state.hole.hearingRange.toFixed(2),
            ),
          },
          suspense: {
            blackoutSeconds: Number(
              state.hole.blackoutTimer.toFixed(2),
            ),
            dreadSeconds: Number(
              state.hole.dreadTimer.toFixed(2),
            ),
            floodlightPower: Number(
              floodlightPower().toFixed(2),
            ),
            zoneVisits:
              state.hole.zoneVisits.slice(),
          },
          message:
            state.hole.messageTimer > 0
              ? state.hole.message
              : null,
          prompt: state.hole.prompt || null,
          blockedBy: state.hole.blockedTimer > 0 ? state.hole.blockedObstacle : null,
          stateBanner: state.hole.stateBannerTimer > 0 ? state.hole.stateBanner : null,
          activeEffects: state.hole.worldEffects.map((effect) => effect.kind),
          visibleObstacles: visibleObstacleState(),
          environment: state.hole.environment
            ? {
                coverQuality: state.hole.environment.coverQuality,
                turfLabel:
                  state.hole.environment.turfLabel,
                mowed:
                  state.hole.environment.mowed,
                wet:
                  state.hole.environment.wet,
                sand:
                  state.hole.environment.sand,
                sandZone:
                  state.hole.environment
                    .sandZone?.id ||
                  null,
                sandZoneEdgeDistance:
                  Number(
                    state.hole.environment
                      .sandZoneEdgeDistance.toFixed(
                        2,
                      ),
                  ),
                wetZone:
                  state.hole.environment.wetZone?.id ||
                  null,
                wetZoneEdgeDistance:
                  state.hole.environment
                    .wetZoneEdgeDistance === null
                    ? null
                    : Number(
                        state.hole.environment
                          .wetZoneEdgeDistance.toFixed(2),
                      ),
                nearestMowedDistance:
                  state.hole.environment
                    .nearestMowedDistance === null
                    ? null
                    : Number(
                        state.hole.environment
                          .nearestMowedDistance.toFixed(2),
                      ),
                effectiveRough:
                  state.hole.environment.effectiveRough,
                hardCover: state.hole.environment.hardCover,
                lineBlockedBy: state.hole.environment.blocker,
                nearestCover: state.hole.environment.nearestCover?.id || null,
                nearestCoverDistance: state.hole.environment.nearestCover
                  ? Number(
                      state.hole.environment.nearestCoverDistance.toFixed(2),
                    )
                  : null,
                nearestLandmark:
                  state.hole.environment.nearestLandmark?.landmark || null,
                lightExposure: Number(
                  state.hole.environment.lightExposure.toFixed(2),
                ),
              }
            : null,
          joe: {
            x: Math.round(state.hole.joe.x),
            y: Math.round(state.hole.joe.y),
            mode: state.hole.joe.mode,
            alert: Number(state.hole.joe.alert.toFixed(2)),
            wet: state.hole.joe.wet,
            sand:
              state.hole.joe.sand,
            distance: Math.round(worldDistance(state.hole.joe, state.player)),
            hasLineOfSight: state.hole.hasLineOfSight,
            lineBlockedBy: state.hole.lineBlockedBy,
            lostSightSeconds: Number(state.hole.lostSightTimer.toFixed(2)),
            searchSecondsRemaining: Number(state.hole.searchTimer.toFixed(2)),
            navigation: {
              routeObstacle: state.hole.joe.routeObstacle,
              routeSide: state.hole.joe.routeSide,
              patrolWaypoint: state.hole.joe.patrolIndex,
              patrolPauseSeconds: Number(
                state.hole.joe.patrolPause.toFixed(2),
              ),
              pathWaypoints: state.hole.joe.routePath.length,
              nextWaypoint:
                state.hole.joe.routePath.length > 0
                  ? {
                      x: Math.round(
                        state.hole.joe.routePath[0].x,
                      ),
                      y: Math.round(
                        state.hole.joe.routePath[0].y,
                      ),
                    }
                  : null,
              steeringRadians: Number(
                state.hole.joe.steeringAngle.toFixed(2),
              ),
              stuckSeconds: Number(
                state.hole.joe.stuckTimer.toFixed(2),
              ),
              reroutes: state.hole.joe.rerouteCount,
              obstacleClearance: Number(
                joeObstacleClearanceAt(
                  state.hole.joe,
                ).toFixed(2),
              ),
              minimumObstacleClearance: Number(
                state.hole.joe.minimumObstacleClearance.toFixed(2),
              ),
            },
            animation: {
              name: joeAnimationState().name,
              frame: joeAnimationState().frame,
              sequenceIndex: joeAnimationState().sequenceIndex,
              fps: joeAnimationState().fps,
            },
            mapVisibility:
              state.hole.joe.mode === "chase" ||
              worldDistance(state.hole.joe, state.player) < 42
                ? "live"
                : state.hole.lastKnownJoeTimer > 0
                  ? "last_signal"
                  : "hidden",
          },
          sprinklerUsed: state.hole.sprinklerUsed,
          outcome: state.mode === "victory" ? "escaped" : state.mode === "defeat" ? "caught" : null,
        }
      : null,
    controls: {
      global: "F fullscreen",
      gate: "Click, Enter, or Space",
      intro: "Click, Enter, Space, or Escape to skip",
      menu: "Arrow keys and Enter, or pointer; R toggles Overtime Audit after mastery",
      firstHole: "WASD/arrow keys move; Shift sprints; hold C to crouch; hold Q for Listening Focus; bunker sand slows both player and mower but leaves loud tracks; Enter interacts, secures a change request, or reclaims a landed ball; hold Space and use A/D to aim, then release to chip; H shows controls; Escape cancels a shot or pauses",
      pause: "Arrow keys select; Enter confirms; Escape resumes",
      keyboard: {
        global: "F fullscreen",
        gate: "Click, Enter, or Space",
        intro: "Click, Enter, Space, or Escape to skip",
        menu: "Arrow keys and Enter, or pointer; R toggles Overtime Audit after mastery",
        firstHole: "WASD/arrow keys move; Shift sprints; hold C to crouch; hold Q for Listening Focus; bunker sand slows both player and mower but leaves loud tracks; Enter interacts, secures a change request, or reclaims a landed ball; hold Space and use A/D to aim, then release to chip; H shows controls; Escape cancels a shot or pauses",
        pause: "Arrow keys select; Enter confirms; Escape resumes",
      },
      gamepad: {
        menu: "D-pad selects; A confirms; RB toggles Overtime Audit after mastery; B returns",
        firstHole: "Left stick or D-pad moves; RT sprints; LB crouches; LT listens; bunker sand slows both player and mower but leaves loud tracks; A interacts, secures a change request, or reclaims a landed ball; hold X and use the left stick to aim, then release to chip; Y shows controls; B cancels a shot; Start pauses",
        pause: "D-pad selects; A confirms; B or Start resumes",
      },
      touch: {
        gate: "Tap to begin",
        intro: "Tap to skip",
        menu: "Tap menu items directly; tap the Overtime card after mastery",
        firstHole: "Drag the left pad to move; hold Run while moving to sprint; hold Crouch or Listen for stealth information; tap Use to interact or reclaim a ball; hold Chip, slide left or right to aim, and release to shoot; tap Pause to suspend the round",
        pause: "Tap a menu item directly",
      },
    },
  });

  window.advanceTime = (milliseconds) => {
    state.manualTime = true;
    const steps = Math.max(1, Math.round(milliseconds / (1000 / 60)));
    for (let index = 0; index < steps; index += 1) {
      update(1 / 60);
    }
    render();
  };

  function frame(now) {
    if (!state.manualTime) {
      update((now - lastFrame) / 1000);
    }
    lastFrame = now;
    render();
    requestAnimationFrame(frame);
  }

  art.addEventListener("load", render);
  grassArt.addEventListener("load", render);
  holeArt.addEventListener("load", render);
  joeMowerArt.addEventListener("load", render);
  joeMowerAnimatedArt.addEventListener("load", render);
  joeMowerErraticHeadArt.addEventListener("load", render);
  fieldKitArt.addEventListener("load", render);
  courseObstacleArt.addEventListener("load", render);
  expandedCourseArt.addEventListener("load", render);
  foregroundFringeArt.addEventListener("load", render);
  defeatArt.addEventListener("load", render);
  drainArt.addEventListener("load", render);
  requestAnimationFrame(frame);
})();
