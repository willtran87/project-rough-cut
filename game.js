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
    "SUBMIT CHANGE REQUEST",
    "REPLAY INCIDENT",
    "CLOCK OUT",
  ];
  const MENU_DESCRIPTIONS = [
    "Enter Hole 1: The Pilot.",
    "Tune audio, captions, and camera motion.",
    "Request a scope exception from Joe.",
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
  const RESULT_ACTION_IDS = [
    "rematch",
    "next_order",
    "clubhouse",
  ];
  const PORTFOLIO_PANEL = {
    x: 558,
    y: 78,
    width: 650,
    height: 398,
  };
  const PORTFOLIO_CARD_Y = 146;
  const PORTFOLIO_CARD_WIDTH = 190;
  const PORTFOLIO_CARD_HEIGHT = 286;
  const PORTFOLIO_CARD_GAP = 16;
  const PERFORMANCE_STAMPS = [
    {
      id: "clean_file",
      code: "C",
      shortName: "CLEAN",
      name: "CLEAN FILE",
      hint: "Escape without pursuit",
      qualifies: (result) =>
        result.cleanRun,
    },
    {
      id: "field_recovery",
      code: "R",
      shortName: "RECLAIM",
      name: "FIELD RECOVERY",
      hint: "Reclaim a thrown ball and escape",
      qualifies: (result) =>
        result.ballsRecovered > 0,
    },
    {
      id: "bunker_clause",
      code: "B",
      shortName: "BAIT",
      name: "BUNKER CLAUSE",
      hint: "Bait Joe into two bunkers",
      qualifies: (result) =>
        result.sandTrapCount >= 2,
    },
    {
      id: "echo_breaker",
      code: "E",
      shortName: "ECHO",
      name: "ECHO BREAKER",
      hint: "Beat a compatible Course Echo",
      qualifies: (result) =>
        result.echoOvertaken,
    },
  ];
  const SETTINGS_STORAGE_KEY = "rough-cut.settings.v1";
  const CAREER_STORAGE_KEY = "rough-cut.career.v1";
  const SETTINGS_ROWS = [
    { id: "master", group: "audio", label: "MASTER MIX", key: "volume", type: "slider", min: 0, max: 1, step: 0.05 },
    { id: "ambience", group: "audio", label: "COURSE AMBIENCE", key: "ambienceVolume", type: "slider", min: 0, max: 1, step: 0.05 },
    { id: "mower", group: "audio", label: "JOE", key: "mowerVolume", type: "slider", min: 0, max: 1, step: 0.05 },
    { id: "effects", group: "audio", label: "GAMEPLAY EFFECTS", key: "effectsVolume", type: "slider", min: 0, max: 1, step: 0.05 },
    { id: "danger", group: "audio", label: "DANGER PULSE", key: "dangerVolume", type: "slider", min: 0, max: 1, step: 0.05 },
    { id: "subtitles", group: "presentation", label: "DIALOGUE SUBTITLES", key: "subtitles", type: "toggle" },
    { id: "subtitle_size", group: "presentation", label: "CAPTION SIZE", key: "subtitleSize", type: "slider", min: 0.8, max: 1.4, step: 0.1 },
    { id: "caption_background", group: "presentation", label: "CAPTION BACKDROP", key: "captionBackground", type: "slider", min: 0, max: 1, step: 0.1 },
    { id: "threat_captions", group: "presentation", label: "THREAT CAPTIONS", key: "threatCaptions", type: "toggle" },
    { id: "reduced_motion", group: "presentation", label: "REDUCED CAMERA MOTION", key: "reducedMotion", type: "toggle" },
  ];
  const KEYBOARD_BINDING_ROWS = [
    { id: "move_up", label: "MOVE FORWARD", defaultCode: "KeyW" },
    { id: "move_left", label: "MOVE LEFT", defaultCode: "KeyA" },
    { id: "move_down", label: "MOVE BACK", defaultCode: "KeyS" },
    { id: "move_right", label: "MOVE RIGHT", defaultCode: "KeyD" },
    { id: "sprint", label: "SPRINT", defaultCode: "ShiftLeft" },
    { id: "crouch", label: "CROUCH", defaultCode: "KeyC" },
    { id: "focus", label: "LISTENING FOCUS", defaultCode: "KeyQ" },
    { id: "interact", label: "INTERACT / RECLAIM", defaultCode: "Enter" },
    { id: "chip", label: "AIM / CHIP", defaultCode: "Space" },
    { id: "controls", label: "SHOW CONTROLS", defaultCode: "KeyH" },
  ];
  const RESERVED_BINDING_CODES = new Set([
    "Escape",
    "KeyF",
    "Tab",
    "CapsLock",
    "MetaLeft",
    "MetaRight",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
  ]);
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
  const nightSkyArt = new Image();
  nightSkyArt.src = "./assets/rough-cut-night-sky-v2.png";
  const moonArt = new Image();
  moonArt.src = "./assets/rough-cut-moon-v1.png";
  const holeArt = new Image();
  holeArt.src = "./assets/rough-cut-course-ground-v4.png";
  const cloudAtlasArt = new Image();
  cloudAtlasArt.src = "./assets/rough-cut-cloud-atlas-v2.png";
  const distantTreeLineArt = new Image();
  distantTreeLineArt.src = "./assets/rough-cut-distant-treeline-v1.png";
  const distantClubhouseArt = new Image();
  distantClubhouseArt.src = "./assets/rough-cut-distant-clubhouse-v1.png";
  const farRidgeArt = new Image();
  farRidgeArt.src = "./assets/rough-cut-far-ridge-v1.png";
  const distantVillasArt = new Image();
  distantVillasArt.src = "./assets/rough-cut-distant-villas-v1.png";
  const signageAtlasArt = new Image();
  signageAtlasArt.src = "./assets/rough-cut-signage-atlas-v1.png";
  const bunkerAtlasArt = new Image();
  bunkerAtlasArt.src = "./assets/rough-cut-bunker-atlas-v1.png";
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
  const maintenanceShedArt = new Image();
  maintenanceShedArt.src = "./assets/rough-cut-maintenance-shed-v2.png";
  const hedgeHideArt = new Image();
  hedgeHideArt.src = "./assets/rough-cut-hedge-hide-v2.png";
  const stoneCoverArt = new Image();
  stoneCoverArt.src = "./assets/rough-cut-stone-cover-v2.png";
  const serviceCartArt = new Image();
  serviceCartArt.src = "./assets/rough-cut-service-cart-v2.png";
  const deadGreenSceneryArt = new Image();
  deadGreenSceneryArt.src = "./assets/rough-cut-dead-green-kit-v1.png";
  const foregroundFringeArt = new Image();
  foregroundFringeArt.src = "./assets/rough-cut-foreground-fringe-v1.png";
  const defeatArt = new Image();
  defeatArt.src = "./assets/rough-cut-joe-capture-v1.png";
  const joeExpressionArt = new Image();
  joeExpressionArt.src = "./assets/rough-cut-joe-expressions-v1.png";
  const drainArt = new Image();
  drainArt.src = "./assets/rough-cut-drain-culvert-v1.png";
  const pathLanternArt = new Image();
  pathLanternArt.src =
    "./assets/rough-cut-path-lantern-atlas-v1.png";
  const interactablePropArt =
    new Image();
  interactablePropArt.src =
    "./assets/rough-cut-interactable-props-v1.png";
  const courseClutterArt =
    new Image();
  courseClutterArt.src =
    "./assets/rough-cut-course-clutter-v1.png";
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
  const BASE_JOE_CAPTURE_LINES = [
    { id: "scope", expression: 0, tone: "SATISFIED", lines: ["I moved this course into scope.", "You moved into my path."] },
    { id: "acceptance", expression: 1, tone: "DISAPPOINTED", lines: ["You missed the acceptance criteria.", "I did not."] },
    { id: "grass_compliance", expression: 5, tone: "FINAL", lines: ["The grass is compliant.", "You are not."] },
    { id: "stakeholder", expression: 0, tone: "PROFESSIONAL", lines: ["Consider this your final", "stakeholder review."] },
    { id: "consistent_cut", expression: 1, tone: "CRITICAL", lines: ["The sprint goal was", "a consistent cut."] },
    { id: "alignment", expression: 3, tone: "COACHING", lines: ["Good effort.", "Terrible alignment."] },
    { id: "edge_case", expression: 4, tone: "DELIGHTED", lines: ["You found the edge case.", "I found you."] },
    { id: "sprint", expression: 5, tone: "FINAL", lines: ["This sprint", "ends here."] },
    { id: "backlog", expression: 0, tone: "SATISFIED", lines: ["The backlog had", "one item left: you."] },
    { id: "circle_back", expression: 3, tone: "HELPFUL", lines: ["We can circle back", "after I finish this row."] },
    { id: "roadmap", expression: 1, tone: "DISAPPOINTED", lines: ["You treated my roadmap", "like a suggestion."] },
    { id: "accounted", expression: 5, tone: "METHODICAL", lines: ["Every blade accounted for.", "Every dependency too."] },
    { id: "approved", expression: 1, tone: "REJECTED", lines: ["That route", "was never prioritized."] },
    { id: "pattern", expression: 0, tone: "SATISFIED", lines: ["You should have stayed", "inside the delivery plan."] },
    { id: "quiet", expression: 5, tone: "CALM", lines: ["The course is quiet", "when everyone follows process."] },
    { id: "variance", expression: 2, tone: "ENTHUSIASTIC", lines: ["I love golf.", "I tolerate variance."] },
    { id: "under_par", expression: 3, tone: "AMUSED", lines: ["You're under par", "and out of options."] },
    { id: "handoff", expression: 0, tone: "SATISFIED", lines: ["I call that", "a clean handoff."] },
    { id: "blockers", expression: 4, tone: "DELIGHTED", lines: ["No blockers now.", "Excellent."] },
    { id: "definition", expression: 1, tone: "DISAPPOINTED", lines: ["Your escape lacked", "a definition of done."] },
    { id: "retrospective", expression: 3, tone: "COACHING", lines: ["Let's put this miss", "in the retrospective."] },
    { id: "stakeholders", expression: 2, tone: "DELIGHTED", lines: ["The stakeholders", "are going to love this."] },
    { id: "grass_told", expression: 0, tone: "KNOWING", lines: ["I knew the grass", "would tell me."] },
    { id: "footprints", expression: 1, tone: "OFFENDED", lines: ["You left defects", "in my best increment."] },
    { id: "change_request", expression: 3, tone: "HELPFUL", lines: ["Next time,", "submit the change request."] },
    { id: "improvement", expression: 5, tone: "FINAL", lines: ["There is always room for improvement.", "Just not tonight."] },
    { id: "escalated", expression: 4, tone: "EXCITED", lines: ["You ran.", "The priority escalated."] },
    { id: "owner", expression: 0, tone: "CERTAIN", lines: ["One product.", "One owner."] },
    { id: "remembers", expression: 5, tone: "QUIET", lines: ["The fairway", "remembers every increment."] },
    { id: "par", expression: 2, tone: "GOLF LOGIC", lines: ["Par is a target.", "Done is non-negotiable."] },
    { id: "refinement", expression: 3, tone: "HELPFUL", lines: ["We refined this route.", "You were not invited."] },
    { id: "velocity", expression: 4, tone: "IMPRESSED", lines: ["Excellent velocity.", "Wrong direction."] },
    { id: "capacity", expression: 1, tone: "CRITICAL", lines: ["You exceeded capacity.", "I corrected it."] },
    { id: "dependency", expression: 0, tone: "PROFESSIONAL", lines: ["Your escape had", "an unmanaged dependency."] },
    { id: "story_points", expression: 2, tone: "DELIGHTED", lines: ["I gave that chase", "thirteen story points."] },
    { id: "standup", expression: 3, tone: "COACHING", lines: ["Save it for standup.", "You are still blocked."] },
    { id: "ready", expression: 1, tone: "REJECTED", lines: ["You were never", "definition-of-ready."] },
    { id: "increment", expression: 5, tone: "FINAL", lines: ["This is the final", "course increment."] },
    { id: "demo", expression: 2, tone: "ENTHUSIASTIC", lines: ["Perfect timing.", "The demo starts now."] },
    { id: "priority", expression: 0, tone: "CERTAIN", lines: ["I reordered the backlog.", "You came first."] },
    { id: "technical_debt", expression: 4, tone: "DELIGHTED", lines: ["I found the technical debt.", "It was hiding in the rough."] },
    { id: "scope_creep", expression: 1, tone: "OFFENDED", lines: ["You call it escape.", "I call it scope creep."] },
    { id: "release", expression: 5, tone: "FINAL", lines: ["The release is locked.", "So are the gates."] },
    { id: "epic", expression: 2, tone: "AMUSED", lines: ["That was an epic.", "This is the closeout."] },
    { id: "user_story", expression: 3, tone: "COACHING", lines: ["As a trespasser,", "you should have stayed home."] },
    { id: "mvp", expression: 0, tone: "SATISFIED", lines: ["Minimum viable escape.", "Maximum visible failure."] },
    { id: "backlog_hygiene", expression: 1, tone: "CRITICAL", lines: ["I maintain backlog hygiene.", "And fairway hygiene."] },
    { id: "release_train", expression: 4, tone: "EXCITED", lines: ["You missed the release train.", "The mower was on time."] },
    { id: "value", expression: 0, tone: "PROFESSIONAL", lines: ["I maximize value.", "You reduced the cut quality."] },
    { id: "product_goal", expression: 5, tone: "FINAL", lines: ["The product goal is simple:", "leave no rough behind."] },
  ];
  const BASE_JOE_STATE_BARKS = {
    patrol: [
      "Back to the plan.",
      "Variance resolved.",
      "Every blade in scope.",
      "The course is behaving again.",
      "The backlog is healthy.",
      "Increment accepted.",
      "Velocity restored.",
      "Roadmap remains intact.",
      "Definition of done: immaculate.",
      "No stakeholder surprises.",
    ],
    investigate: [
      "That was not in the plan.",
      "I heard a scope change.",
      "Someone moved my grass.",
      "This course has standards.",
      "That sound needs an owner.",
      "I can see the variance.",
      "New dependency identified.",
      "That was not definition-of-ready.",
      "I did not prioritize that noise.",
      "Unplanned work detected.",
      "This needs refinement.",
      "Who changed the acceptance criteria?",
    ],
    search: [
      "Let's circle back.",
      "The rough keeps receipts.",
      "You missed a patch.",
      "I have time for follow-up.",
      "The fairway always tells me.",
      "This is still in review.",
      "You are blocking the sprint goal.",
      "I am updating the roadmap.",
      "We will resolve this in standup.",
      "The backlog does not forget.",
      "Technical debt hides everywhere.",
      "I own the next decision.",
    ],
    chase: [
      "Stop moving the goalposts!",
      "This sprint is mine!",
      "You are off course!",
      "No unapproved shortcuts!",
      "Your variance is escalating!",
      "I own this fairway!",
      "Let's close this action item!",
      "You skipped the review!",
      "You are unplanned scope!",
      "Acceptance criteria are not optional!",
      "I just raised the priority!",
      "This release has no rollback!",
      "You are blocking delivery!",
      "We are closing this epic!",
    ],
  };
  const JOE_DIALOGUE_LIBRARY =
    window
      .ROUGH_CUT_JOE_DIALOGUE || {
      captureLines: [],
      stateBarks: {},
      contextBarks: {},
      capturePackCount: 0,
    };
  const JOE_CAPTURE_LINES = [
    ...BASE_JOE_CAPTURE_LINES,
    ...JOE_DIALOGUE_LIBRARY
      .captureLines,
  ];
  const JOE_STATE_BARKS = {};
  for (
    const mode of [
      "patrol",
      "investigate",
      "search",
      "chase",
    ]
  ) {
    JOE_STATE_BARKS[mode] = [
      ...(
        BASE_JOE_STATE_BARKS[
          mode
        ] || []
      ),
      ...(
        JOE_DIALOGUE_LIBRARY
          .stateBarks[mode] || []
      ),
    ];
  }
  const JOE_CONTEXT_BARKS =
    JOE_DIALOGUE_LIBRARY
      .contextBarks;
  const JOE_CAPTURE_HISTORY_LIMIT =
    18;
  const JOE_BARK_HISTORY_LIMIT =
    12;
  const JOE_STATE_BARK_COUNT =
    Object.values(
      JOE_STATE_BARKS,
    ).reduce(
      (total, lines) =>
        total + lines.length,
      0,
    );
  const JOE_CONTEXT_BARK_COUNT =
    Object.values(
      JOE_CONTEXT_BARKS,
    ).reduce(
      (total, lines) =>
        total + lines.length,
      0,
    );
  const JOE_DIALOGUE_VARIANT_COUNT =
    JOE_CAPTURE_LINES.length +
    JOE_STATE_BARK_COUNT +
    JOE_CONTEXT_BARK_COUNT;
  const CLOUD_ATLAS_CELL = 512;
  const CLOUD_INSTANCES = [
    { cell: 0, x: -180, y: -130, width: 520, speed: 3.1, parallax: 0.05, alpha: 0.27, phase: 0.2 },
    { cell: 4, x: 360, y: -70, width: 430, speed: 4.3, parallax: 0.07, alpha: 0.24, phase: 1.7 },
    { cell: 1, x: 790, y: -140, width: 570, speed: 2.4, parallax: 0.04, alpha: 0.25, phase: 2.9 },
    { cell: 5, x: 1060, y: -50, width: 390, speed: 5.6, parallax: 0.1, alpha: 0.22, phase: 4.1 },
    { cell: 2, x: 90, y: -80, width: 360, speed: 6.8, parallax: 0.12, alpha: 0.19, phase: 5.3 },
    { cell: 3, x: 610, y: 35, width: 330, speed: 4.9, parallax: 0.09, alpha: 0.18, phase: 3.4 },
    { cell: 0, x: 1240, y: -20, width: 300, speed: 7.7, parallax: 0.14, alpha: 0.16, phase: 6.2 },
    { cell: 5, x: -520, y: 0, width: 310, speed: 5.2, parallax: 0.11, alpha: 0.17, phase: 0.9 },
  ];
  const TREE_LINE_SOURCE = { x: 9, y: 373, width: 1650, height: 347 };
  const CLUBHOUSE_SOURCE = { x: 87, y: 289, width: 1516, height: 449 };
  const MOON_SOURCE = { x: 218, y: 192, width: 830, height: 840 };
  const FAR_RIDGE_SOURCE = { x: 0, y: 600, width: 1672, height: 341 };
  const DISTANT_VILLAS_SOURCE = { x: 0, y: 490, width: 1672, height: 210 };
  const SIGNAGE_ATLAS_CELL = 512;
  const BUNKER_ATLAS_CELL = 724;
  const JOE_EXPRESSION_CELL = 512;
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
  const DELIVERY_CHAIN_WINDOW = 14;
  const DELIVERY_CHAIN_MAX = 5;
  const DELIVERY_FAMILY_CAPS = {
    zone: 3,
    recovery: 3,
    bunker: 2,
    contact: 3,
    change: 1,
  };
  const MOWED_MARK_SPACING = 5.2;
  const PLAYER_TRACK_SPACING = 5.6;
  const MAX_MOWED_MARKS = 150;
  const MAX_PLAYER_TRACKS = 72;
  const MAX_MOWER_WORLD_PARTICLES = 190;
  const COURSE_ECHO_SAMPLE_SECONDS = 0.4;
  const MAX_COURSE_ECHO_SAMPLES = 260;
  const SPRINKLER_SOAK_SECONDS = 24;
  const WET_MOWER_SPEED_MULTIPLIER = 0.68;
  const SAND_PLAYER_SPEED_MULTIPLIER = 0.72;
  const SAND_MOWER_SPEED_MULTIPLIER = 0.76;
  const KEY_POINT = { x: -48, y: 249, radius: 16 };
  const SPRINKLER_POINT = { x: -103, y: 42, radius: 18 };
  const SHED_EXIT = { x: 24, y: 350, radius: 13 };
  const DRAIN_EXIT = { x: -76, y: 339, radius: 15 };
  const ESCAPE_FILING_DURATION = {
    shed: 1.35,
    drain: 1.7,
  };
  const ESCAPE_SEAL_DURATION = 0.48;
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
  const REACTIVE_SCORE_ZONES = [
    {
      key: "D MINOR",
      rootHz: 36.71,
      accent: "112,139,72",
    },
    {
      key: "C# PHRYGIAN",
      rootHz: 34.65,
      accent: "136,112,58",
    },
    {
      key: "C DIMINISHED",
      rootHz: 32.7,
      accent: "64,133,132",
    },
    {
      key: "B TRITONE",
      rootHz: 30.87,
      accent: "153,70,39",
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
  const DEAD_GREEN_SCENERY_CELLS = [
    { x: 45, y: 50, width: 570, height: 410, heightMeters: 1.65 },
    { x: 650, y: 25, width: 390, height: 450, heightMeters: 2.45 },
    { x: 1110, y: 90, width: 430, height: 390, heightMeters: 0.95 },
    { x: 100, y: 485, width: 460, height: 425, heightMeters: 2.6 },
    { x: 635, y: 520, width: 430, height: 390, heightMeters: 1.65 },
    { x: 1050, y: 570, width: 520, height: 350, heightMeters: 1 },
  ];
  const PATH_LANTERN_CELLS = [
    {
      x: 143,
      y: 42,
      width: 329,
      height: 540,
      heightMeters: 0.88,
      lightY: 0.45,
    },
    {
      x: 762,
      y: 22,
      width: 323,
      height: 569,
      heightMeters: 0.92,
      lightY: 0.47,
    },
    {
      x: 139,
      y: 676,
      width: 349,
      height: 523,
      heightMeters: 0.84,
      lightY: 0.38,
    },
    {
      x: 787,
      y: 653,
      width: 277,
      height: 561,
      heightMeters: 1.08,
      lightY: 0.43,
    },
  ];
  const INTERACTABLE_PROP_CELLS = [
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
  const COURSE_CLUTTER_CELLS = [
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
  const COURSE_CLUTTER = [
    { id: "tee-stone", type: 0, x: -103, y: 34, scale: 0.88 },
    { id: "tee-hose", type: 2, x: 104, y: 66, scale: 0.92 },
    { id: "audit-balls", type: 3, x: -101, y: 108, scale: 0.86 },
    { id: "audit-bag", type: 1, x: 101, y: 142, scale: 0.94 },
    { id: "audit-clippings", type: 5, x: -104, y: 169, scale: 0.9 },
    { id: "water-tools", type: 4, x: 105, y: 198, scale: 0.92 },
    { id: "water-stone", type: 0, x: -102, y: 228, scale: 0.82 },
    { id: "water-hose", type: 2, x: 104, y: 252, scale: 0.88 },
    { id: "dead-balls", type: 3, x: -102, y: 282, scale: 0.92 },
    { id: "dead-tools", type: 4, x: 104, y: 302, scale: 0.96 },
    { id: "dead-bag", type: 1, x: -104, y: 326, scale: 0.9 },
    { id: "shed-clippings", type: 5, x: 105, y: 346, scale: 1.02 },
  ];
  const DEAD_GREEN_SCENERY = [
    { id: "dead-grass-west", type: 0, x: -103, y: 286, scale: 1.08, landmark: "withered rough" },
    { id: "warning-flag", type: 1, x: 46, y: 298, scale: 0.96, landmark: "torn warning flag" },
    { id: "burst-sprinkler", type: 2, x: -28, y: 316, scale: 1.05, landmark: "burst sprinkler" },
    { id: "dead-grass-east", type: 0, x: 104, y: 322, scale: 1.14, landmark: "dead boundary grass" },
    { id: "dead-topiary", type: 3, x: -58, y: 333, scale: 1.02, landmark: "dead topiary" },
    { id: "finish-flag", type: 1, x: 16, y: 335, scale: 0.82, landmark: "final warning flag" },
    { id: "snapped-sign", type: 4, x: -34, y: 344, scale: 0.96, landmark: "snapped course sign" },
    { id: "mower-wreck", type: 5, x: 71, y: 346, scale: 1.08, landmark: "mower wreck" },
    { id: "dead-grass-left-finish", type: 0, x: -86, y: 355, scale: 0.92, landmark: "withered rough" },
    { id: "dead-grass-finish", type: 0, x: 106, y: 357, scale: 0.98, landmark: "withered rough" },
  ];
  const COURSE_OBSTACLES = [
    { id: "start-hedge", asset: "hedge-hide", kit: "base", type: 0, x: -42, y: 28, radius: 15, radiusX: 20, radiusY: 7, coverRadius: 23, scale: 1, blocks: true, sight: true, landmark: "hedge hide" },
    { id: "start-boundary", asset: "stone-cover", kit: "base", type: 1, x: 75, y: 22, radius: 18, radiusX: 19, radiusY: 8, coverRadius: 22, scale: 1, blocks: true, sight: true, landmark: "stone cover" },
    { id: "service-cart", asset: "service-cart", kit: "base", type: 3, x: 28, y: 43, radius: 13, radiusX: 16, radiusY: 7, coverRadius: 21, scale: 1, blocks: true, sight: true, landmark: "grounds cart" },
    { id: "east-pine", kit: "base", type: 2, x: 86, y: 49, radius: 18, radiusX: 7.5, radiusY: 7.5, coverRadius: 27, scale: 1, blocks: true, sight: true, landmark: "pine" },
    { id: "bunker-rake", kit: "base", type: 5, x: -85, y: 64, radius: 16, radiusX: 22, radiusY: 7, coverRadius: 22, scale: 1, blocks: true, sight: true, landmark: "bunker lip" },
    { id: "course-sign", kit: "base", type: 4, x: -32, y: 68, radius: 9, radiusX: 5, radiusY: 4, coverRadius: 14, scale: 1, blocks: true, sight: false, landmark: "course sign" },
    { id: "mid-boundary", asset: "stone-cover", kit: "base", type: 1, x: 55, y: 72, radius: 17, radiusX: 18, radiusY: 8, coverRadius: 24, scale: 0.94, blocks: true, sight: true, landmark: "stone cover" },
    { id: "north-hedge", asset: "hedge-hide", kit: "base", type: 0, x: 86, y: 84, radius: 17, radiusX: 20, radiusY: 7, coverRadius: 25, scale: 0.92, blocks: true, sight: true, landmark: "hedge hide" },
    { id: "north-pine", kit: "base", type: 2, x: -94, y: 90, radius: 19, radiusX: 7, radiusY: 7, coverRadius: 28, scale: 0.9, blocks: true, sight: true, landmark: "pine" },
    { id: "audit-arch", kit: "expanded", type: 0, x: 0, y: 116, radius: 0, scale: 1.05, blocks: false, sight: false, landmark: "hedge tunnel" },
    { id: "audit-arch-left", x: -35, y: 116, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "hedge tunnel" },
    { id: "audit-arch-right", x: 35, y: 116, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "hedge tunnel" },
    { id: "audit-cart", kit: "expanded", type: 1, x: -58, y: 145, radius: 18, radiusX: 20, radiusY: 8, coverRadius: 27, scale: 1.08, blocks: true, sight: true, landmark: "overturned cart" },
    { id: "audit-board", kit: "expanded", type: 4, x: 72, y: 174, radius: 11, radiusX: 7, radiusY: 5, coverRadius: 19, scale: 0.94, blocks: true, sight: true, landmark: "audit board" },
    { id: "audit-hedge", asset: "hedge-hide", kit: "base", type: 0, x: -94, y: 174, radius: 18, radiusX: 21, radiusY: 7.5, coverRadius: 27, scale: 1.02, blocks: true, sight: true, landmark: "hedge hide" },
    { id: "pond-west", kit: "expanded", type: 2, x: -63, y: 215, radius: 22, radiusX: 25, radiusY: 11, coverRadius: 29, scale: 1.18, blocks: true, sight: true, landmark: "black-water reeds" },
    { id: "water-pine", kit: "base", type: 2, x: 91, y: 207, radius: 19, radiusX: 7.5, radiusY: 7.5, coverRadius: 28, scale: 0.92, blocks: true, sight: true, landmark: "pine" },
    { id: "floodlight", kit: "expanded", type: 5, x: 18, y: 242, radius: 6, radiusX: 4.5, radiusY: 4.5, coverRadius: 11, lightRadius: 57, scale: 1.04, blocks: true, sight: false, landmark: "maintenance floodlight" },
    { id: "pond-east", kit: "expanded", type: 2, x: 70, y: 260, radius: 22, radiusX: 25, radiusY: 11, coverRadius: 29, scale: 1.08, blocks: true, sight: true, landmark: "pond edge" },
    { id: "bunker-wall", kit: "expanded", type: 3, x: -18, y: 274, radius: 19, radiusX: 25, radiusY: 8, coverRadius: 27, scale: 1.12, blocks: true, sight: true, landmark: "bunker wall" },
    { id: "final-cart", kit: "expanded", type: 1, x: 78, y: 293, radius: 18, radiusX: 20, radiusY: 8, coverRadius: 27, scale: 0.98, blocks: true, sight: true, landmark: "overturned cart" },
    { id: "final-arch", kit: "expanded", type: 0, x: 0, y: 310, radius: 0, scale: 1.02, blocks: false, sight: false, landmark: "final hedge tunnel" },
    { id: "final-arch-left", x: -35, y: 310, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "final hedge tunnel" },
    { id: "final-arch-right", x: 35, y: 310, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "final hedge tunnel" },
    { id: "final-board", kit: "expanded", type: 4, x: -77, y: 317, radius: 11, radiusX: 7, radiusY: 5, coverRadius: 19, scale: 0.88, blocks: true, sight: true, landmark: "audit board" },
    { id: "dead-green-pine", kit: "base", type: 2, x: 94, y: 334, radius: 20, radiusX: 8, radiusY: 8, coverRadius: 29, scale: 1.03, blocks: true, sight: true, landmark: "dead pine" },
    { id: "shed-left-wall", x: 5, y: 350, radius: 11, radiusX: 8.5, radiusY: 8, coverRadius: 22, blocks: true, sight: true, draw: false, landmark: "shed wall" },
    { id: "shed-right-wall", x: 45, y: 350, radius: 11, radiusX: 8.5, radiusY: 8, coverRadius: 22, blocks: true, sight: true, draw: false, landmark: "shed wall" },
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

  function freshNavigationGuide() {
    return {
      targetId: null,
      targetLabel: null,
      targetColor: "#d8b46b",
      target: null,
      path: [],
      lastPlayerX: Infinity,
      lastPlayerY: Infinity,
      refreshTimer: 0,
      direction: "STRAIGHT",
      distance: 0,
    };
  }

  function defaultKeyboardBindings() {
    return Object.fromEntries(
      KEYBOARD_BINDING_ROWS.map((binding) => [
        binding.id,
        binding.defaultCode,
      ]),
    );
  }

  function validKeyboardBindings(value) {
    const bindings = defaultKeyboardBindings();
    if (!value || typeof value !== "object") {
      return bindings;
    }
    for (const binding of KEYBOARD_BINDING_ROWS) {
      const candidate = value[binding.id];
      if (
        bindingCodeAllowed(candidate)
      ) {
        bindings[binding.id] = candidate;
      }
    }
    if (
      new Set(
        Object.values(bindings),
      ).size !==
      KEYBOARD_BINDING_ROWS.length
    ) {
      return defaultKeyboardBindings();
    }
    return bindings;
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
        subtitleSize:
          Number.isFinite(parsed.subtitleSize)
            ? Math.max(0.8, Math.min(1.4, parsed.subtitleSize))
            : 1,
        captionBackground:
          Number.isFinite(parsed.captionBackground)
            ? Math.max(0, Math.min(1, parsed.captionBackground))
            : 0.78,
        threatCaptions:
          typeof parsed.threatCaptions === "boolean"
            ? parsed.threatCaptions
            : true,
        reducedMotion:
          typeof parsed.reducedMotion === "boolean"
            ? parsed.reducedMotion
            : false,
        keyboardBindings:
          validKeyboardBindings(
            parsed.keyboardBindings,
          ),
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
        subtitleSize: 1,
        captionBackground: 0.78,
        threatCaptions: true,
        reducedMotion: false,
        keyboardBindings:
          defaultKeyboardBindings(),
      };
    }
  }

  function validCourseEchoPath(path) {
    if (!Array.isArray(path)) {
      return [];
    }
    const samples = [];
    let previousTime = -1;
    let previousDistance = -1;
    for (
      let index = 0;
      index < path.length &&
      samples.length < MAX_COURSE_ECHO_SAMPLES;
      index += 1
    ) {
      const sample = path[index];
      if (
        !sample ||
        !Number.isFinite(sample.t) ||
        !Number.isFinite(sample.x) ||
        !Number.isFinite(sample.y) ||
        !Number.isFinite(sample.d)
      ) {
        continue;
      }
      const time = Math.max(0, sample.t);
      const distance = Math.max(0, sample.d);
      if (
        time < previousTime ||
        distance < previousDistance
      ) {
        continue;
      }
      samples.push({
        t: Number(time.toFixed(2)),
        x: Number(
          clamp(
            sample.x,
            -COURSE_MAX_X,
            COURSE_MAX_X,
          ).toFixed(2),
        ),
        y: Number(
          clamp(
            sample.y,
            COURSE_MIN_Y,
            COURSE_LENGTH,
          ).toFixed(2),
        ),
        d: Number(distance.toFixed(2)),
      });
      previousTime = time;
      previousDistance = distance;
    }
    return samples.length >= 2
      ? samples
      : [];
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
    const variantId = RUN_VARIANTS.some(
      (variant) => variant.id === record.variantId,
    )
      ? record.variantId
      : null;
    return {
      score: Math.max(0, Math.round(record.score)),
      timeSeconds: Math.max(0, record.timeSeconds),
      grade: record.grade.slice(0, 1),
      route: record.route === "drain" ? "drain" : "shed",
      variantId,
      overtime: record.overtime === true,
      ghostPath: variantId
        ? validCourseEchoPath(record.ghostPath)
        : [],
    };
  }

  function emptyPerformanceStamps() {
    const stamps = {};
    for (
      let index = 0;
      index < RUN_VARIANTS.length;
      index += 1
    ) {
      stamps[
        RUN_VARIANTS[index].id
      ] = [];
    }
    return stamps;
  }

  function validPerformanceStamps(
    savedStamps,
  ) {
    const stamps =
      emptyPerformanceStamps();
    if (
      !savedStamps ||
      typeof savedStamps !== "object"
    ) {
      return stamps;
    }
    const validIds = new Set(
      PERFORMANCE_STAMPS.map(
        (stamp) => stamp.id,
      ),
    );
    for (
      let index = 0;
      index < RUN_VARIANTS.length;
      index += 1
    ) {
      const variantId =
        RUN_VARIANTS[index].id;
      const saved =
        savedStamps[variantId];
      if (!Array.isArray(saved)) {
        continue;
      }
      stamps[variantId] = [
        ...new Set(
          saved.filter((id) =>
            validIds.has(id),
          ),
        ),
      ];
    }
    return stamps;
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
        selectedVariantId:
          RUN_VARIANTS.some(
            (variant) =>
              variant.id ===
              parsed.selectedVariantId,
          )
            ? parsed.selectedVariantId
            : null,
        performanceStamps:
          validPerformanceStamps(
            parsed.performanceStamps,
          ),
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
        selectedVariantId: null,
        performanceStamps:
          emptyPerformanceStamps(),
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
    resultIndex: 0,
    stingerPlayed: false,
    subtitles: savedPreferences.subtitles,
    subtitleSize: savedPreferences.subtitleSize,
    captionBackground: savedPreferences.captionBackground,
    threatCaptions: savedPreferences.threatCaptions,
    reducedMotion: savedPreferences.reducedMotion,
    volume: savedPreferences.volume,
    ambienceVolume: savedPreferences.ambienceVolume,
    mowerVolume: savedPreferences.mowerVolume,
    effectsVolume: savedPreferences.effectsVolume,
    dangerVolume: savedPreferences.dangerVolume,
    keyboardBindings:
      savedPreferences.keyboardBindings,
    inputMethod: "keyboard",
    settingsIndex: 0,
    settingsPage: "mix",
    bindingIndex: 0,
    bindingCaptureId: null,
    bindingStatus:
      "Select an action, then press Enter to reassign it.",
    settingsReturnMode: "menu",
    career: savedCareer,
    portfolioVariantId:
      savedCareer.selectedVariantId ||
      runVariantForRound(
        savedCareer.roundsStarted,
      ).id,
    overtimeSelected:
      savedCareer.overtimeEnabled &&
      savedCareer.completedVariants.length ===
        RUN_VARIANTS.length,
    status: "Every blade is in scope.",
    lastJoeCaptureLineId: null,
    lastJoeCaptureLineIds: [],
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
        effectLastX: 44,
        effectLastY: 185,
        effectHeading: Math.PI * 0.5,
        effectSpeed: 0,
        clippingCarry: 0,
        clippingsEmitted: 0,
        scrapeCooldown: 0,
        scrapeBursts: 0,
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
      escapeFiling: {
        active: false,
        sealing: false,
        route: null,
        progress: 0,
        duration: 0,
        sealProgress: 0,
        sealDuration: ESCAPE_SEAL_DURATION,
        stage: 0,
        attempts: 0,
        cancellations: 0,
        completed: false,
        capturedDuringFiling: false,
        lastInterruption: null,
        joeDistanceAtStart: null,
      },
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
      quickRematch: false,
      rematchTarget: null,
      hasMoved: false,
      moveVector: { x: 0, y: 0 },
      moveHintTimer: 0,
      controlHintTimer: 12,
      travelDistance: 0,
      courseEchoRecord: null,
      courseEchoSamples: [
        { t: 0, x: 0, y: 0, d: 0 },
      ],
      blockedTimer: 0,
      blockedObstacle: null,
      blockedDirection: null,
      blockedEscape: null,
      blockedLandmark: null,
      blockedWorldX: 0,
      blockedWorldY: 0,
      blockedRadius: 0,
      blockedRadiusX: 0,
      blockedRadiusY: 0,
      blockedCueCooldown: 0,
      navigationGuide:
        freshNavigationGuide(),
      previousJoeMode: "patrol",
      joeBark: null,
      joeBarkTimer: 0,
      joeBarkSerial: 0,
      joeBarkContext: null,
      joeBarkHistory: [],
      captureDialogue: null,
      stateBanner: "",
      stateBannerTimer: 0,
      stateBannerLockTimer: 0,
      detectionPulse: 0,
      heartbeatTimer: 0,
      lastStepDistance: 0,
      lastKnownJoe: null,
      lastKnownJoeTimer: 0,
      captions: [],
      worldEffects: [],
      worldParticles: [],
      nextWorldParticleId: 1,
      peakWorldParticles: 0,
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
      razorCuts: 0,
      riskPremiumBanked: 0,
      riskBreakBonuses: [],
      currentRiskPremium: 150,
      riskAward: null,
      deliveryChain: 0,
      deliveryPeak: 0,
      deliveryTimer: 0,
      deliveryBonus: 0,
      deliveryEvents: [],
      deliveryFamilyCounts: {},
      deliveryAward: null,
      liveProjectionTimer: 0,
      liveProjection: null,
      scorePhase: 0,
      scoreStepIndex: -1,
      scoreBeatPulse: 0,
      scoreNotesPlayed: 0,
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
  let scoreGain = null;
  let scoreFilter = null;
  let scoreRootOscillator = null;
  let scoreFifthOscillator = null;
  let scoreTensionOscillator = null;
  let scoreRootGain = null;
  let scoreFifthGain = null;
  let scoreTensionGain = null;
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
          subtitleSize: Number(state.subtitleSize.toFixed(2)),
          captionBackground: Number(state.captionBackground.toFixed(2)),
          threatCaptions: state.threatCaptions,
          reducedMotion: state.reducedMotion,
          keyboardBindings: {
            ...state.keyboardBindings,
          },
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

  function portfolioUnlocked() {
    return (
      state.career.filedChangeRequests.length >=
      RUN_VARIANTS.length
    );
  }

  function performanceStampsFor(
    variantId,
  ) {
    return (
      state.career.performanceStamps[
        variantId
      ] || []
    );
  }

  function totalPerformanceStamps() {
    let total = 0;
    for (
      let index = 0;
      index < RUN_VARIANTS.length;
      index += 1
    ) {
      total +=
        performanceStampsFor(
          RUN_VARIANTS[index].id,
        ).length;
    }
    return total;
  }

  function dossierPerfected(
    variantId,
  ) {
    return (
      performanceStampsFor(
        variantId,
      ).length >=
      PERFORMANCE_STAMPS.length
    );
  }

  function masterProductOwnerUnlocked() {
    return (
      totalPerformanceStamps() >=
      PERFORMANCE_STAMPS.length *
        RUN_VARIANTS.length
    );
  }

  function awardPerformanceStamps(
    result,
  ) {
    const stamps =
      performanceStampsFor(
        result.variantId,
      );
    const totalBefore =
      totalPerformanceStamps();
    const perfectedBefore =
      stamps.length >=
      PERFORMANCE_STAMPS.length;
    const newStampIds = [];
    for (
      let index = 0;
      index < PERFORMANCE_STAMPS.length;
      index += 1
    ) {
      const definition =
        PERFORMANCE_STAMPS[index];
      if (
        !stamps.includes(
          definition.id,
        ) &&
        definition.qualifies(result)
      ) {
        stamps.push(definition.id);
        newStampIds.push(
          definition.id,
        );
      }
    }
    result.newPerformanceStamps =
      newStampIds;
    result.performanceStampProgress =
      stamps.length;
    result.dossierPerfected =
      !perfectedBefore &&
      stamps.length >=
        PERFORMANCE_STAMPS.length;
    result.masterProductOwnerUnlocked =
      totalBefore <
        PERFORMANCE_STAMPS.length *
          RUN_VARIANTS.length &&
      masterProductOwnerUnlocked();
  }

  function portfolioVariant() {
    return (
      RUN_VARIANTS.find(
        (variant) =>
          variant.id ===
          state.portfolioVariantId,
      ) ||
      runVariantForRound(
        state.career.roundsStarted,
      )
    );
  }

  function selectedMenuVariant() {
    return portfolioUnlocked()
      ? portfolioVariant()
      : runVariantForRound(
          state.career.roundsStarted,
        );
  }

  function selectPortfolioVariant(
    selection,
    absolute = false,
  ) {
    if (!portfolioUnlocked()) {
      state.status =
        `File all ${RUN_VARIANTS.length} Change Requests to authorize Portfolio Override.`;
      playUiTone(116, 0.08, 0.02);
      return;
    }
    const currentIndex = Math.max(
      0,
      RUN_VARIANTS.findIndex(
        (variant) =>
          variant.id ===
          state.portfolioVariantId,
      ),
    );
    const nextIndex =
      absolute
        ? clamp(
            selection,
            0,
            RUN_VARIANTS.length - 1,
          )
        : (
            currentIndex +
            selection +
            RUN_VARIANTS.length
          ) %
          RUN_VARIANTS.length;
    const variant =
      RUN_VARIANTS[nextIndex];
    state.portfolioVariantId =
      variant.id;
    state.career.selectedVariantId =
      variant.id;
    state.status =
      `Portfolio Override: Night Order ${String(variant.number).padStart(2, "0")} selected.`;
    saveCareer();
    playUiTone(
      280 + nextIndex * 72,
      0.08,
      0.026,
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
    if (score >= 8000) {
      return "S";
    }
    if (score >= 7100) {
      return "A";
    }
    if (score >= 6200) {
      return "B";
    }
    if (score >= 5300) {
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

  function compatibleCourseEchoRecord(
    variantId = activeRunVariant().id,
    overtime = state.hole?.overtime === true,
  ) {
    const records = overtime
      ? [state.career.overtimeBest]
      : [
          state.career.routes.shed,
          state.career.routes.drain,
        ];
    const compatible = records.filter(
      (record) =>
        record &&
        record.variantId === variantId &&
        record.overtime === overtime &&
        Array.isArray(record.ghostPath) &&
        record.ghostPath.length >= 2,
    );
    compatible.sort(
      (a, b) =>
        b.score - a.score ||
        a.timeSeconds - b.timeSeconds,
    );
    return compatible[0] || null;
  }

  function courseEchoSampleAt(
    samples,
    value,
    key,
  ) {
    if (!samples || samples.length === 0) {
      return null;
    }
    if (value <= samples[0][key]) {
      return { ...samples[0] };
    }
    const last = samples[samples.length - 1];
    if (value >= last[key]) {
      return { ...last };
    }
    let low = 0;
    let high = samples.length - 1;
    while (high - low > 1) {
      const middle = Math.floor((low + high) * 0.5);
      if (samples[middle][key] <= value) {
        low = middle;
      } else {
        high = middle;
      }
    }
    const before = samples[low];
    const after = samples[high];
    const span = after[key] - before[key];
    const amount =
      span > 0
        ? clamp((value - before[key]) / span, 0, 1)
        : 0;
    return {
      t: lerp(before.t, after.t, amount),
      x: lerp(before.x, after.x, amount),
      y: lerp(before.y, after.y, amount),
      d: lerp(before.d, after.d, amount),
    };
  }

  function currentCourseEcho() {
    const record = state.hole?.courseEchoRecord;
    if (
      !record ||
      !Array.isArray(record.ghostPath) ||
      record.ghostPath.length < 2
    ) {
      return null;
    }
    const position = courseEchoSampleAt(
      record.ghostPath,
      state.hole.elapsed,
      "t",
    );
    const paceSample = courseEchoSampleAt(
      record.ghostPath,
      state.hole.travelDistance,
      "d",
    );
    const paceDelta =
      paceSample &&
      state.hole.elapsed > 0.75
        ? state.hole.elapsed - paceSample.t
        : 0;
    return {
      record,
      position,
      paceDelta,
      ahead: paceDelta <= 0,
      finished:
        state.hole.elapsed >=
        record.timeSeconds,
    };
  }

  function courseEchoPaceLabel(echo) {
    if (!echo) {
      return "";
    }
    if (Math.abs(echo.paceDelta) < 0.15) {
      return "ECHO  EVEN";
    }
    return `ECHO  ${Math.abs(echo.paceDelta).toFixed(1)}s ${echo.ahead ? "AHEAD" : "BEHIND"}`;
  }

  function addCourseEchoSample(force = false) {
    const hole = state.hole;
    if (!hole || !Array.isArray(hole.courseEchoSamples)) {
      return;
    }
    const last =
      hole.courseEchoSamples[
        hole.courseEchoSamples.length - 1
      ];
    if (
      !force &&
      last &&
      hole.elapsed - last.t <
        COURSE_ECHO_SAMPLE_SECONDS
    ) {
      return;
    }
    const sample = {
      t: Number(hole.elapsed.toFixed(2)),
      x: Number(state.player.x.toFixed(2)),
      y: Number(state.player.y.toFixed(2)),
      d: Number(
        hole.travelDistance.toFixed(2),
      ),
    };
    if (
      force &&
      last &&
      Math.abs(sample.t - last.t) < 0.01
    ) {
      hole.courseEchoSamples[
        hole.courseEchoSamples.length - 1
      ] = sample;
      return;
    }
    if (
      hole.courseEchoSamples.length <
      MAX_COURSE_ECHO_SAMPLES
    ) {
      hole.courseEchoSamples.push(sample);
    } else if (force) {
      hole.courseEchoSamples[
        hole.courseEchoSamples.length - 1
      ] = sample;
    }
  }

  function careerRecordSummary(record) {
    if (!record) {
      return null;
    }
    return {
      score: record.score,
      timeSeconds: Number(
        record.timeSeconds.toFixed(2),
      ),
      grade: record.grade,
      route: record.route,
      variantId: record.variantId,
      overtime: record.overtime,
      echoSamples:
        record.ghostPath?.length || 0,
    };
  }

  function riskPremiumForDistance(distance) {
    const exposure = smoothstep(
      inverseLerp(30, 10, distance),
    );
    return 150 + Math.round(exposure * 250);
  }

  function riskTierForDistance(distance) {
    if (distance < 12) {
      return "razor";
    }
    if (distance < 18) {
      return "close";
    }
    return "break";
  }

  function bankRiskPremium(distance) {
    const hole = state.hole;
    if (hole.riskBreakBonuses.length >= 3) {
      hole.riskAward = null;
      return null;
    }
    const amount =
      riskPremiumForDistance(distance);
    const tier =
      riskTierForDistance(distance);
    hole.riskPremiumBanked += amount;
    hole.riskBreakBonuses.push(amount);
    hole.currentRiskPremium = amount;
    hole.riskAward = {
      amount,
      tier,
      age: 0,
      duration: 2.45,
    };
    awardDeliveryBeat(
      tier === "razor"
        ? "RAZOR CONTACT BREAK"
        : tier === "close"
          ? "CLOSE CONTACT BREAK"
          : "CONTACT BROKEN",
      tier === "razor"
        ? 170
        : tier === "close"
          ? 140
          : 110,
    );
    return hole.riskAward;
  }

  function deliveryMultiplier(
    chain,
  ) {
    return (
      1 +
      Math.max(
        0,
        chain - 1,
      ) *
        0.3
    );
  }

  function awardDeliveryBeat(
    label,
    baseAmount,
  ) {
    const hole = state.hole;
    if (
      !hole ||
      state.mode !== "first_hole"
    ) {
      return null;
    }
    const family =
      label.includes("REACHED")
        ? "zone"
        : label.includes("RECOVERY") ||
            label.includes("BALL RECOVERED")
          ? "recovery"
          : label.includes("BUNKER")
            ? "bunker"
            : label.includes("CONTACT")
              ? "contact"
              : label.includes("CHANGE REQUEST")
                ? "change"
                : "other";
    const familyCap =
      DELIVERY_FAMILY_CAPS[
        family
      ] ?? 1;
    const familyCount =
      hole.deliveryFamilyCounts[
        family
      ] || 0;
    if (
      familyCount >=
      familyCap
    ) {
      return null;
    }
    hole.deliveryFamilyCounts[
      family
    ] =
      familyCount + 1;
    hole.deliveryChain =
      hole.deliveryTimer > 0
        ? Math.min(
            DELIVERY_CHAIN_MAX,
            hole.deliveryChain + 1,
          )
        : 1;
    hole.deliveryPeak =
      Math.max(
        hole.deliveryPeak,
        hole.deliveryChain,
      );
    hole.deliveryTimer =
      DELIVERY_CHAIN_WINDOW;
    const multiplier =
      deliveryMultiplier(
        hole.deliveryChain,
      );
    const amount =
      Math.round(
        baseAmount * multiplier,
      );
    hole.deliveryBonus += amount;
    hole.deliveryEvents.push({
      label,
      amount,
      chain:
        hole.deliveryChain,
      family,
    });
    hole.deliveryAward = {
      label,
      amount,
      chain:
        hole.deliveryChain,
      multiplier,
      age: 0,
      duration: 2.15,
    };
    return hole.deliveryAward;
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
      Number.isFinite(hole.riskPremiumBanked)
        ? hole.riskPremiumBanked
        : Math.min(3, hole.chaseBreaks) * 150 +
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
    const deliveryBonus =
      Number.isFinite(
        hole.deliveryBonus,
      )
        ? hole.deliveryBonus
        : 0;
    const baseScore =
      3000 +
      timeBonus +
      stealthBonus +
      resourceBonus +
      composureBonus +
      recoveryBonus +
      changeRequestBonus +
      bunkerTrapBonus +
      deliveryBonus +
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
      S: "SPRINT GOAL EXCEEDED",
      A: "ACCEPTED INCREMENT",
      B: "CONDITIONAL ACCEPTANCE",
      C: "REFINEMENT REQUIRED",
      D: "RETURNED TO BACKLOG",
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
      razorCuts: hole.razorCuts || 0,
      riskPremiumBanked: recoveryBonus,
      riskBreakBonuses:
        hole.riskBreakBonuses?.slice() || [],
      deliveryBonus,
      deliveryPeak:
        hole.deliveryPeak || 0,
      deliveryEvents:
        hole.deliveryEvents?.slice() || [],
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
        delivery: deliveryBonus,
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
      portfolioUnlocked: false,
      newPerformanceStamps: [],
      performanceStampProgress:
        performanceStampsFor(
          variant.id,
        ).length,
      dossierPerfected: false,
      masterProductOwnerUnlocked: false,
      echoRoute: null,
      echoScore: null,
      echoTimeDelta: null,
      echoOvertaken: false,
    };
  }

  function projectionGradeRank(grade) {
    return {
      D: 0,
      C: 1,
      B: 2,
      A: 3,
      S: 4,
    }[grade] ?? 0;
  }

  function projectionChangeReason(
    previousBreakdown,
    nextBreakdown,
    direction,
  ) {
    if (!previousBreakdown) {
      return "INITIAL FILE";
    }
    const labels = {
      time: "TIME COST",
      stealth: "ATTENTION COST",
      resources: "BALL COMMITTED",
      composure: "COMPOSURE",
      recovery: "RISK BANKED",
      delivery: "DELIVERY CHAIN",
      changeRequest: "CHANGE REQUEST",
      bunker: "BUNKER BAIT",
      overtime: "OVERTIME PREMIUM",
    };
    const preferred =
      direction === "up"
        ? [
            "changeRequest",
            "delivery",
            "recovery",
            "bunker",
            "resources",
            "composure",
            "overtime",
          ]
        : [
            "stealth",
            "resources",
            "time",
            "composure",
            "overtime",
          ];
    let bestKey =
      direction === "up"
        ? "composure"
        : "time";
    let bestMagnitude = -1;
    for (const key of preferred) {
      const delta =
        (nextBreakdown[key] || 0) -
        (previousBreakdown[key] || 0);
      const magnitude =
        direction === "up"
          ? delta
          : -delta;
      if (magnitude > bestMagnitude) {
        bestKey = key;
        bestMagnitude = magnitude;
      }
    }
    if (bestKey === "resources") {
      return direction === "up"
        ? "BALL RECOVERED"
        : "BALL COMMITTED";
    }
    return (
      labels[bestKey] ||
      "FILE UPDATED"
    );
  }

  function syncLiveProjection(
    result,
    announce = true,
  ) {
    const hole = state.hole;
    if (!hole || !result) {
      return;
    }
    const previousGrade =
      hole.liveProjection?.grade || null;
    const previousBreakdown =
      hole.liveProjection?.breakdown ||
      null;
    const nextRank =
      projectionGradeRank(
        result.grade,
      );
    const previousRank =
      previousGrade
        ? projectionGradeRank(
            previousGrade,
          )
        : nextRank;
    const gradeDirection =
      nextRank > previousRank
        ? "up"
        : nextRank < previousRank
          ? "down"
          : "steady";
    const changeActive =
      (
        hole.liveProjection
          ?.changeTimer || 0
      ) > 0 &&
      hole.liveProjection
        ?.direction !== "steady";
    const direction =
      gradeDirection !== "steady"
        ? gradeDirection
        : changeActive
          ? hole.liveProjection
              .direction
          : "steady";
    hole.liveProjection = {
      route:
        result.route || "shed",
      score: result.score,
      grade: result.grade,
      gradeLabel:
        result.gradeLabel,
      breakdown: {
        ...result.breakdown,
      },
      direction,
      reason:
        gradeDirection !== "steady"
          ? projectionChangeReason(
              previousBreakdown,
              result.breakdown,
              gradeDirection,
            )
          : changeActive
            ? hole.liveProjection
                .reason
            : "FILE HOLDING",
      changeTimer:
        announce &&
        previousGrade &&
        gradeDirection !== "steady"
          ? 2.8
          : Math.max(
              0,
              hole.liveProjection
                ?.changeTimer || 0,
            ),
    };
    if (
      announce &&
      previousGrade &&
      gradeDirection !== "steady"
    ) {
      playUiTone(
        gradeDirection === "up"
          ? 410
          : 154,
        0.085,
        gradeDirection === "up"
          ? 0.022
          : 0.016,
      );
    }
  }

  function updateLiveProjection(dt) {
    const hole = state.hole;
    if (!hole) {
      return;
    }
    if (hole.liveProjection) {
      const previousTimer =
        hole.liveProjection.changeTimer;
      hole.liveProjection.changeTimer =
        Math.max(
          0,
          hole.liveProjection
            .changeTimer - dt,
        );
      if (
        previousTimer > 0 &&
        hole.liveProjection
          .changeTimer === 0
      ) {
        hole.liveProjection.direction =
          "steady";
        hole.liveProjection.reason =
          "FILE HOLDING";
      }
    }
    hole.liveProjectionTimer -= dt;
    if (
      hole.liveProjectionTimer > 0
    ) {
      return;
    }
    hole.liveProjectionTimer = 0.2;
    const route =
      hole.keyCollected
        ? "shed"
        : hole.drainUnlocked
          ? "drain"
          : hole.liveProjection
              ?.route || "shed";
    syncLiveProjection(
      calculateRunResult(route),
      true,
    );
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
    addCourseEchoSample(true);
    const result = calculateRunResult(route);
    const echoRecord =
      state.hole.courseEchoRecord;
    if (echoRecord) {
      result.echoRoute = echoRecord.route;
      result.echoScore = echoRecord.score;
      result.echoTimeDelta =
        result.timeSeconds -
        echoRecord.timeSeconds;
      result.echoOvertaken =
        result.score > echoRecord.score ||
        (
          result.score === echoRecord.score &&
          result.timeSeconds <
            echoRecord.timeSeconds
        );
    }
    awardPerformanceStamps(result);
    const masteredBefore =
      overtimeUnlocked();
    const portfolioBefore =
      portfolioUnlocked();
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
    result.portfolioUnlocked =
      !portfolioBefore &&
      portfolioUnlocked();
    if (result.portfolioUnlocked) {
      state.portfolioVariantId =
        result.variantId;
      state.career.selectedVariantId =
        result.variantId;
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
        variantId: result.variantId,
        overtime: true,
        ghostPath:
          validCourseEchoPath(
            state.hole.courseEchoSamples,
          ),
      };
    } else if (result.newBest) {
      state.career.routes[route] = {
        route,
        score: result.score,
        grade: result.grade,
        timeSeconds: result.timeSeconds,
        variantId: result.variantId,
        overtime: false,
        ghostPath:
          validCourseEchoPath(
            state.hole.courseEchoSamples,
          ),
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

  function keyboardBindingCode(id) {
    const definition =
      KEYBOARD_BINDING_ROWS.find(
        (binding) => binding.id === id,
      );
    return (
      state.keyboardBindings[id] ||
      definition?.defaultCode ||
      ""
    );
  }

  function keyboardCodeLabel(code) {
    const exactLabels = {
      Space: "SPACE",
      Enter: "ENTER",
      ShiftLeft: "L SHIFT",
      ShiftRight: "R SHIFT",
      ControlLeft: "L CTRL",
      ControlRight: "R CTRL",
      AltLeft: "L ALT",
      AltRight: "R ALT",
      Backspace: "BACKSPACE",
      Backquote: "`",
      Minus: "-",
      Equal: "=",
      BracketLeft: "[",
      BracketRight: "]",
      Backslash: "\\",
      Semicolon: ";",
      Quote: "'",
      Comma: ",",
      Period: ".",
      Slash: "/",
    };
    if (exactLabels[code]) {
      return exactLabels[code];
    }
    if (code.startsWith("Key")) {
      return code.slice(3);
    }
    if (code.startsWith("Digit")) {
      return code.slice(5);
    }
    if (code.startsWith("Numpad")) {
      return `NUM ${code.slice(6).toUpperCase()}`;
    }
    return code
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toUpperCase();
  }

  function keyboardBindingLabel(id) {
    return keyboardCodeLabel(
      keyboardBindingCode(id),
    );
  }

  function keyboardBindingDown(id) {
    return state.keys.has(
      keyboardBindingCode(id),
    );
  }

  function keyboardActionForCode(code) {
    return (
      KEYBOARD_BINDING_ROWS.find(
        (binding) =>
          keyboardBindingCode(
            binding.id,
          ) === code,
      )?.id || null
    );
  }

  function keyboardMovementCopy() {
    const labels = [
      keyboardBindingLabel("move_up"),
      keyboardBindingLabel("move_left"),
      keyboardBindingLabel("move_down"),
      keyboardBindingLabel("move_right"),
    ];
    const primary =
      labels.join("") === "WASD"
        ? "WASD"
        : labels.join("/");
    return `${primary} / ARROWS`;
  }

  function bindingCodeAllowed(code) {
    return (
      typeof code === "string" &&
      code.length > 0 &&
      code.length <= 32 &&
      !RESERVED_BINDING_CODES.has(code) &&
      !/^F\d{1,2}$/.test(code) &&
      code !== "Unidentified"
    );
  }

  function rebindKeyboardAction(id, code) {
    const target =
      KEYBOARD_BINDING_ROWS.find(
        (binding) => binding.id === id,
      );
    if (!target) {
      return false;
    }
    if (!bindingCodeAllowed(code)) {
      state.bindingStatus =
        `${keyboardCodeLabel(code)} is reserved for menus, movement fallback, or the browser.`;
      playUiTone(142, 0.09, 0.026);
      return false;
    }
    const previousCode =
      keyboardBindingCode(id);
    const conflict =
      KEYBOARD_BINDING_ROWS.find(
        (binding) =>
          binding.id !== id &&
          keyboardBindingCode(
            binding.id,
          ) === code,
      );
    state.keyboardBindings[id] = code;
    if (conflict) {
      state.keyboardBindings[
        conflict.id
      ] = previousCode;
      state.bindingStatus =
        `${target.label} set to ${keyboardCodeLabel(code)}. ${conflict.label} moved to ${keyboardCodeLabel(previousCode)}.`;
    } else {
      state.bindingStatus =
        `${target.label} set to ${keyboardCodeLabel(code)}.`;
    }
    state.bindingCaptureId = null;
    state.keys.clear();
    savePreferences();
    playUiTone(342, 0.09, 0.03);
    return true;
  }

  function resetKeyboardBindings() {
    state.keyboardBindings =
      defaultKeyboardBindings();
    state.bindingCaptureId = null;
    state.bindingStatus =
      "Default keyboard bindings restored.";
    state.keys.clear();
    savePreferences();
    playUiTone(250, 0.08, 0.024);
  }

  function openKeyboardBindings() {
    state.settingsPage = "bindings";
    state.bindingCaptureId = null;
    state.bindingStatus =
      "Select an action, then press Enter to reassign it.";
    playUiTone(286, 0.07, 0.024);
  }

  function returnToMixSettings() {
    state.settingsPage = "mix";
    state.bindingCaptureId = null;
    state.keys.clear();
    playUiTone(190, 0.055, 0.018);
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

  function drawParallaxAsset(
    image,
    source,
    x,
    y,
    width,
    height,
    alpha = 1,
  ) {
    if (
      !image.complete ||
      image.naturalWidth === 0
    ) {
      return;
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      image,
      source.x,
      source.y,
      source.width,
      source.height,
      x,
      y,
      width,
      height,
    );
    ctx.restore();
  }

  function drawIndependentClouds(
    progress,
    panX,
    walkBob,
  ) {
    if (
      !cloudAtlasArt.complete ||
      cloudAtlasArt.naturalWidth === 0
    ) {
      return;
    }
    for (
      let index = 0;
      index <
      CLOUD_INSTANCES.length;
      index += 1
    ) {
      const cloud =
        CLOUD_INSTANCES[index];
      const column =
        cloud.cell % 3;
      const row =
        Math.floor(
          cloud.cell / 3,
        );
      const depthScale =
        1 +
        progress *
          cloud.parallax *
          0.28;
      const width =
        cloud.width *
        depthScale;
      const height = width;
      const ambientDrift =
        state.reducedMotion
          ? 0
          : state.hole.elapsed *
            cloud.speed;
      const span =
        WIDTH +
        width +
        440;
      const rawX =
        cloud.x +
        ambientDrift +
        panX *
          cloud.parallax *
          3.8;
      const x =
        (
          (
            rawX +
            width +
            220
          ) %
            span +
          span
        ) %
          span -
        width -
        220;
      const bob =
        state.reducedMotion
          ? 0
          : Math.sin(
              state.hole.elapsed *
                (
                  0.11 +
                  cloud.parallax *
                    0.24
                ) +
                cloud.phase,
            ) *
            (
              2.5 +
              cloud.parallax *
                16
            );
      drawParallaxAsset(
        cloudAtlasArt,
        {
          x:
            column *
            CLOUD_ATLAS_CELL,
          y:
            row *
            CLOUD_ATLAS_CELL,
          width:
            CLOUD_ATLAS_CELL,
          height:
            CLOUD_ATLAS_CELL,
        },
        x,
        cloud.y -
          progress *
            (
              3 +
              cloud.parallax *
                12
            ) +
          bob +
          walkBob *
            cloud.parallax *
            0.08,
        width,
        height,
        cloud.alpha,
      );
    }
  }

  function drawMoonLayer(
    progress,
    panX,
    walkBob,
  ) {
    const moonSize =
      126 +
      progress * 7;
    const moonX =
      814 +
      panX * 0.02 -
      progress * 3;
    const moonY =
      42 -
      progress * 2 +
      walkBob * 0.008;
    const centerX =
      moonX + moonSize * 0.5;
    const centerY =
      moonY + moonSize * 0.5;
    const pulse =
      state.reducedMotion
        ? 0.12
        : 0.105 +
          Math.sin(
            state.hole.elapsed *
              0.16,
          ) *
            0.012;
    const halo =
      ctx.createRadialGradient(
        centerX,
        centerY,
        moonSize * 0.2,
        centerX,
        centerY,
        moonSize * 1.35,
      );
    halo.addColorStop(
      0,
      `rgba(191,218,222,${pulse})`,
    );
    halo.addColorStop(
      0.38,
      `rgba(116,158,172,${pulse * 0.52})`,
    );
    halo.addColorStop(
      1,
      "rgba(80,122,143,0)",
    );
    ctx.fillStyle = halo;
    ctx.fillRect(
      centerX -
        moonSize * 1.5,
      centerY -
        moonSize * 1.5,
      moonSize * 3,
      moonSize * 3,
    );
    drawParallaxAsset(
      moonArt,
      MOON_SOURCE,
      moonX,
      moonY,
      moonSize,
      moonSize,
      0.9,
    );
  }

  function drawAtmosphericFogBand(
    y,
    height,
    alpha,
    speed,
    phase,
    panX,
  ) {
    const drift =
      state.reducedMotion
        ? 0
        : Math.sin(
            state.hole.elapsed *
              speed +
              phase,
          ) *
            74;
    const fog =
      ctx.createLinearGradient(
        0,
        y,
        0,
        y + height,
      );
    fog.addColorStop(
      0,
      "rgba(151,176,174,0)",
    );
    fog.addColorStop(
      0.44,
      `rgba(151,176,174,${alpha})`,
    );
    fog.addColorStop(
      0.7,
      `rgba(94,127,125,${alpha * 0.72})`,
    );
    fog.addColorStop(
      1,
      "rgba(94,127,125,0)",
    );
    ctx.fillStyle = fog;
    ctx.fillRect(
      -180 +
        drift +
        panX * 0.08,
      y,
      WIDTH + 360,
      height,
    );
    for (
      let wisp = 0;
      wisp < 4;
      wisp += 1
    ) {
      const seed =
        phase * 41 +
        wisp * 29;
      const wispX =
        (
          hash(seed) *
            (WIDTH + 420) +
          drift *
            (
              0.42 +
              wisp * 0.11
            )
        ) %
          (WIDTH + 420) -
        210;
      const wispY =
        y +
        height *
          (
            0.32 +
            hash(seed + 7) *
              0.36
          );
      const radiusX =
        120 +
        hash(seed + 13) *
          210;
      const radiusY =
        height *
        (
          0.11 +
          hash(seed + 19) *
            0.13
        );
      const haze =
        ctx.createRadialGradient(
          wispX,
          wispY,
          0,
          wispX,
          wispY,
          radiusX,
        );
      haze.addColorStop(
        0,
        `rgba(179,195,187,${alpha * 0.56})`,
      );
      haze.addColorStop(
        1,
        "rgba(179,195,187,0)",
      );
      ctx.save();
      ctx.translate(
        wispX,
        wispY,
      );
      ctx.scale(
        1,
        radiusY /
          radiusX,
      );
      ctx.fillStyle = haze;
      ctx.fillRect(
        -radiusX,
        -radiusX,
        radiusX * 2,
        radiusX * 2,
      );
      ctx.restore();
    }
  }

  function drawCourseBackdrop(
    progress,
    walkBob,
  ) {
    const panX = clamp(
      -state.player.x * 0.5,
      -60,
      60,
    );
    const zoom =
      1.08 +
      progress * 0.16;
    drawImageCover(
      ctx,
      nightSkyArt,
      panX * 0.035,
      -6 -
        progress * 3 +
        walkBob * 0.01,
      1.035 +
        progress * 0.018,
    );
    ctx.fillStyle =
      "rgba(1,6,12,0.24)";
    ctx.fillRect(
      0,
      0,
      WIDTH,
      HEIGHT,
    );

    drawMoonLayer(
      progress,
      panX,
      walkBob,
    );
    drawIndependentClouds(
      progress,
      panX,
      walkBob,
    );

    const ridgeWidth =
      1440 *
      (
        1 +
        progress * 0.025
      );
    const ridgeHeight =
      ridgeWidth *
      FAR_RIDGE_SOURCE.height /
      FAR_RIDGE_SOURCE.width;
    const ridgeDrift =
      state.reducedMotion
        ? 0
        : Math.sin(
            state.hole.elapsed *
              0.045,
          ) *
            2.2;
    drawParallaxAsset(
      farRidgeArt,
      FAR_RIDGE_SOURCE,
      (
        WIDTH -
        ridgeWidth
      ) *
        0.5 +
        panX * 0.075 +
        ridgeDrift,
      154 +
        progress * 1.5,
      ridgeWidth,
      ridgeHeight,
      0.67,
    );

    const villasWidth =
      1190 *
      (
        1 +
        progress * 0.032
      );
    const villasHeight =
      villasWidth *
      DISTANT_VILLAS_SOURCE.height /
      DISTANT_VILLAS_SOURCE.width;
    drawParallaxAsset(
      distantVillasArt,
      DISTANT_VILLAS_SOURCE,
      (
        WIDTH -
        villasWidth
      ) *
        0.5 +
        panX * 0.115 -
        progress * 3,
      184 +
        progress * 2 +
        walkBob * 0.02,
      villasWidth,
      villasHeight,
      0.62,
    );

    drawAtmosphericFogBand(
      204,
      112,
      0.09,
      0.055,
      0.8,
      panX,
    );

    const clubhouseWidth =
      400 *
      (
        1 +
        progress * 0.035
      );
    const clubhouseHeight =
      clubhouseWidth *
      CLUBHOUSE_SOURCE.height /
      CLUBHOUSE_SOURCE.width;
    const clubhouseX =
      172 +
      panX * 0.24 -
      progress * 8;
    const clubhouseY =
      180 +
      progress * 2 +
      walkBob * 0.04;
    const clubhouseGlow =
      state.reducedMotion
        ? 0.16
        : 0.14 +
          Math.sin(
            state.hole.elapsed *
              1.13,
          ) *
            0.025;
    const windowGlow =
      ctx.createRadialGradient(
        clubhouseX +
          clubhouseWidth *
            0.5,
        clubhouseY +
          clubhouseHeight *
            0.52,
        4,
        clubhouseX +
          clubhouseWidth *
            0.5,
        clubhouseY +
          clubhouseHeight *
            0.52,
        clubhouseWidth *
          0.46,
      );
    windowGlow.addColorStop(
      0,
      `rgba(217,145,62,${clubhouseGlow})`,
    );
    windowGlow.addColorStop(
      1,
      "rgba(217,145,62,0)",
    );
    ctx.fillStyle = windowGlow;
    ctx.fillRect(
      clubhouseX -
        34,
      clubhouseY -
        18,
      clubhouseWidth +
        68,
      clubhouseHeight +
        36,
    );
    drawParallaxAsset(
      distantClubhouseArt,
      CLUBHOUSE_SOURCE,
      clubhouseX,
      clubhouseY,
      clubhouseWidth,
      clubhouseHeight,
      0.72,
    );

    const treeWidth =
      1450 *
      (
        1 +
        progress * 0.025
      );
    const treeHeight =
      treeWidth *
      TREE_LINE_SOURCE.height /
      TREE_LINE_SOURCE.width;
    const treeSway =
      state.reducedMotion
        ? 0
        : Math.sin(
            state.hole.elapsed *
              0.16,
          ) *
            2.5;
    drawParallaxAsset(
      distantTreeLineArt,
      TREE_LINE_SOURCE,
      (
        WIDTH -
        treeWidth
      ) *
        0.5 +
        panX * 0.17 +
        treeSway,
      42 +
        progress * 3 +
        walkBob * 0.08,
      treeWidth,
      treeHeight,
      0.58,
    );

    drawAtmosphericFogBand(
      244,
      126,
      0.075,
      0.072,
      2.4,
      panX,
    );

    drawImageCover(
      ctx,
      holeArt,
      panX * 0.58,
      walkBob +
        progress * 10,
      zoom,
    );

    const horizonMist =
      ctx.createLinearGradient(
        0,
        238,
        0,
        332,
      );
    horizonMist.addColorStop(
      0,
      "rgba(127,153,154,0)",
    );
    horizonMist.addColorStop(
      0.52,
      "rgba(127,153,154,0.12)",
    );
    horizonMist.addColorStop(
      1,
      "rgba(127,153,154,0)",
    );
    ctx.fillStyle = horizonMist;
    ctx.fillRect(
      -30 +
        (
          state.reducedMotion
            ? 0
            : Math.sin(
                state.hole.elapsed *
                  0.07,
              ) *
              24
        ),
      238,
      WIDTH + 60,
      94,
    );
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

  function drawSubtitleCard(
    text,
    centerX,
    baselineY,
    baseSize = 16,
    color = "#f2e8c5",
  ) {
    const size = Math.round(baseSize * state.subtitleSize);
    ctx.save();
    ctx.font = `700 ${size}px "Courier New", monospace`;
    const width = Math.min(WIDTH - 72, ctx.measureText(text).width + 38);
    const height = size + 20;
    ctx.fillStyle = `rgba(2,8,4,${state.captionBackground * 0.92})`;
    ctx.fillRect(centerX - width * 0.5, baselineY - size - 11, width, height);
    if (state.captionBackground > 0.05) {
      strokeRect(
        centerX - width * 0.5,
        baselineY - size - 11,
        width,
        height,
        "rgba(132,154,111,0.72)",
        1,
      );
    }
    drawText(text, centerX, baselineY, size, color, "center", true);
    ctx.restore();
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
        drawSubtitleCard(
          "HERE'S JOEY!",
          WIDTH * 0.5,
          HEIGHT * 0.85,
          34,
          "#ffedb9",
        );
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

  function bestRecordForVariant(
    variantId,
  ) {
    const records = [
      state.career.routes.shed,
      state.career.routes.drain,
      state.career.overtimeBest,
    ].filter(
      (record) =>
        record?.variantId === variantId,
    );
    records.sort(
      (a, b) =>
        b.score - a.score ||
        a.timeSeconds - b.timeSeconds,
    );
    return records[0] || null;
  }

  function drawPortfolioBoard() {
    const unlocked =
      portfolioUnlocked();
    const masterProductOwner =
      masterProductOwnerUnlocked();
    const selected =
      selectedMenuVariant();
    const panel = PORTFOLIO_PANEL;
    ctx.fillStyle = unlocked
      ? masterProductOwner
        ? "rgba(24,20,7,0.95)"
        : "rgba(5,18,10,0.94)"
      : "rgba(3,13,8,0.9)";
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
      masterProductOwner
        ? "#e0bc59"
        : unlocked
          ? "#92763d"
          : "#394637",
      unlocked ? 3 : 2,
    );
    drawText(
      "NIGHT ORDER PORTFOLIO",
      panel.x + 24,
      panel.y + 34,
      19,
      masterProductOwner
        ? "#f4dc82"
        : unlocked
          ? "#ead58e"
          : "#9aa590",
      "left",
      true,
    );
    drawText(
      masterProductOwner
        ? "MASTER PRODUCT OWNER // 12 STAMPS"
        : unlocked
        ? "RED-PEN AUTHORIZATION"
        : "AUTHORIZATION PENDING",
      panel.x + panel.width - 24,
      panel.y + 32,
      11,
      masterProductOwner
        ? "#f0c75d"
        : unlocked
          ? "#e5723a"
          : "#6f7b6d",
      "right",
      true,
    );
    drawText(
      `CHANGES ${state.career.filedChangeRequests.length}/${RUN_VARIANTS.length}  //  ORDERS ${state.career.completedVariants.length}/${RUN_VARIANTS.length}  //  PERFORMANCE STAMPS ${totalPerformanceStamps()}/${PERFORMANCE_STAMPS.length * RUN_VARIANTS.length}`,
      panel.x + 24,
      panel.y + 57,
      10,
      unlocked ? "#b9c99e" : "#748171",
      "left",
    );

    for (
      let index = 0;
      index < RUN_VARIANTS.length;
      index += 1
    ) {
      const variant =
        RUN_VARIANTS[index];
      const x =
        panel.x +
        22 +
        index *
          (
            PORTFOLIO_CARD_WIDTH +
            PORTFOLIO_CARD_GAP
          );
      const selectedCard =
        unlocked &&
        selected.id === variant.id;
      const cleared =
        state.career.completedVariants.includes(
          variant.id,
        );
      const filed =
        state.career.filedChangeRequests.includes(
          variant.id,
        );
      const earnedStamps =
        performanceStampsFor(
          variant.id,
        );
      const perfected =
        earnedStamps.length >=
        PERFORMANCE_STAMPS.length;
      const record =
        bestRecordForVariant(
          variant.id,
        );
      ctx.fillStyle = selectedCard
        ? perfected
          ? "rgba(54,43,10,0.96)"
          : "rgba(43,39,16,0.94)"
        : "rgba(8,25,13,0.9)";
      ctx.fillRect(
        x,
        PORTFOLIO_CARD_Y,
        PORTFOLIO_CARD_WIDTH,
        PORTFOLIO_CARD_HEIGHT,
      );
      strokeRect(
        x,
        PORTFOLIO_CARD_Y,
        PORTFOLIO_CARD_WIDTH,
        PORTFOLIO_CARD_HEIGHT,
        selectedCard
          ? perfected
            ? "#e9c45f"
            : "#e66f31"
          : perfected
            ? "#b89a4f"
          : filed
            ? variant.accent
            : "#344733",
        selectedCard ? 3 : 1,
      );
      ctx.fillStyle =
        selectedCard
          ? perfected
            ? "#e9c45f"
            : "#e66f31"
          : perfected
            ? "#b89a4f"
          : filed
            ? variant.accent
            : "#53604f";
      ctx.fillRect(
        x,
        PORTFOLIO_CARD_Y,
        PORTFOLIO_CARD_WIDTH,
        5,
      );
      drawText(
        `ORDER ${String(variant.number).padStart(2, "0")}`,
        x + 16,
        PORTFOLIO_CARD_Y + 32,
        11,
        selectedCard
          ? "#f3b36c"
          : "#82917c",
        "left",
        true,
      );
      if (perfected) {
        drawText(
          "PERFECT",
          x +
            PORTFOLIO_CARD_WIDTH -
            16,
          PORTFOLIO_CARD_Y + 79,
          9,
          "#e8c768",
          "right",
          true,
        );
      }
      drawText(
        variant.name,
        x + 16,
        PORTFOLIO_CARD_Y + 61,
        14,
        selectedCard
          ? "#f3efd2"
          : "#cbd4bd",
        "left",
        true,
      );

      const routeY =
        PORTFOLIO_CARD_Y + 96;
      ctx.strokeStyle =
        filed
          ? variant.accent
          : "#3f4b3d";
      ctx.lineWidth = selectedCard
        ? 3
        : 2;
      ctx.beginPath();
      ctx.moveTo(x + 24, routeY);
      ctx.lineTo(
        x + PORTFOLIO_CARD_WIDTH - 24,
        routeY,
      );
      ctx.stroke();
      for (
        let marker = 0;
        marker < 3;
        marker += 1
      ) {
        const markerX =
          x +
          24 +
          marker *
            (
              (
                PORTFOLIO_CARD_WIDTH -
                48
              ) /
              2
            );
        ctx.fillStyle =
          marker === 1 && filed
            ? "#e66f31"
            : cleared
              ? variant.accent
              : "#263127";
        ctx.beginPath();
        ctx.arc(
          markerX,
          routeY,
          marker === 1 ? 6 : 4,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.strokeStyle = "#9daa90";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      drawText(
        cleared
          ? "✓ ORDER CLEARED"
          : "○ REVIEW OPEN",
        x + 16,
        PORTFOLIO_CARD_Y + 132,
        11,
        cleared
          ? "#a9c986"
          : "#778477",
        "left",
        cleared,
      );
      drawText(
        filed
          ? `✓ ${variant.changeRequest.code} FILED`
          : `◇ ${variant.changeRequest.code} UNFILED`,
        x + 16,
        PORTFOLIO_CARD_Y + 157,
        11,
        filed
          ? "#e69158"
          : "#778477",
        "left",
        filed,
      );
      for (
        let stampIndex = 0;
        stampIndex <
        PERFORMANCE_STAMPS.length;
        stampIndex += 1
      ) {
        const stamp =
          PERFORMANCE_STAMPS[
            stampIndex
          ];
        const earned =
          earnedStamps.includes(
            stamp.id,
          );
        const stampX =
          x +
          26 +
          stampIndex * 45;
        const stampY =
          PORTFOLIO_CARD_Y + 184;
        ctx.fillStyle = earned
          ? perfected
            ? "#5c4a13"
            : stamp.id ===
                "echo_breaker"
              ? "#17483f"
              : "#582919"
          : "#142019";
        ctx.beginPath();
        ctx.arc(
          stampX,
          stampY,
          11,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.strokeStyle = earned
          ? perfected
            ? "#f0d16a"
            : stamp.id ===
                "echo_breaker"
              ? "#85ddc5"
              : "#e9854e"
          : "#435044";
        ctx.lineWidth = earned
          ? 2
          : 1;
        ctx.stroke();
        drawText(
          stamp.code,
          stampX,
          stampY + 4,
          9,
          earned
            ? perfected
              ? "#ffe69a"
              : stamp.id ===
                  "echo_breaker"
                ? "#b9f1df"
                : "#ffd29b"
            : "#637063",
          "center",
          true,
        );
      }
      drawText(
        variant.keyHint,
        x + 16,
        PORTFOLIO_CARD_Y + 211,
        9,
        "#899783",
        "left",
      );
      ctx.fillStyle =
        "rgba(2,9,5,0.72)";
      ctx.fillRect(
        x + 14,
        PORTFOLIO_CARD_Y + 224,
        PORTFOLIO_CARD_WIDTH - 28,
        48,
      );
      drawText(
        record
          ? `BEST ${record.grade} // ${record.score.toLocaleString()}`
          : "BEST // UNFILED",
        x + 24,
        PORTFOLIO_CARD_Y + 246,
        10,
        record
          ? gradeColor(record.grade)
          : "#657163",
        "left",
        Boolean(record),
      );
      drawText(
        record
          ? `${record.route.toUpperCase()} // ${formatRunTime(record.timeSeconds)}`
          : "NO COURSE ECHO",
        x + 24,
        PORTFOLIO_CARD_Y + 263,
        9,
        "#7e8c79",
        "left",
      );
      if (selectedCard) {
        ctx.fillStyle = "#e66f31";
        polygon([
          [
            x + PORTFOLIO_CARD_WIDTH - 21,
            PORTFOLIO_CARD_Y + 17,
          ],
          [
            x + PORTFOLIO_CARD_WIDTH - 9,
            PORTFOLIO_CARD_Y + 24,
          ],
          [
            x + PORTFOLIO_CARD_WIDTH - 21,
            PORTFOLIO_CARD_Y + 31,
          ],
        ]);
      }
    }
    drawText(
      unlocked
        ? inputCopy(
            "← → SELECT ORDER  //  C CLEAN  R RECLAIM  B BAIT  E ECHO",
            "D-PAD ← → SELECT  //  C CLEAN  R RECLAIM  B BAIT  E ECHO",
            "TAP A DOSSIER  //  C CLEAN  R RECLAIM  B BAIT  E ECHO",
          )
        : "FILE ALL CHANGES TO SELECT ORDERS  //  STAMPS TRACK ESCAPE STYLES.",
      panel.x + panel.width * 0.5,
      panel.y + panel.height - 18,
      11,
      unlocked ? "#e3c77d" : "#6f7c6d",
      "center",
      unlocked,
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
    drawText("A JOE HORROR GAME", 92, 84, 17, "#b4c489", "left");
    drawText("ROUGH CUT", 90, 166, 65, "#f0f0d4", "left", true);
    drawText("THE COURSE CLOSES AT DUSK.", 92, 215, 18, "#ea8740", "left");
    drawText("JOE DOES NOT.", 92, 240, 18, "#ea8740", "left");
    const careerBest = bestCareerRecord();
    const nextVariant =
      selectedMenuVariant();
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

    drawPortfolioBoard();

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

    if (state.status.startsWith("CHANGE REJECTED:")) {
      drawText("CHANGE REJECTED:", 91, 622, 13, "#db8041", "left");
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
        `${portfolioUnlocked() ? "←→ ORDER  •  " : ""}↑↓ SELECT  •  ENTER CONFIRM${overtimeAvailable ? "  •  R OVERTIME" : ""}  •  F FULLSCREEN`,
        `D-PAD SELECT${portfolioUnlocked() ? " / ORDER" : ""}  •  A CONFIRM${overtimeAvailable ? "  •  RB OVERTIME" : ""}`,
        portfolioUnlocked()
          ? "TAP MENU / DOSSIER / OVERTIME CARD"
          : overtimeAvailable
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
    const setting = SETTINGS_ROWS[index];
    const groupIndex = SETTINGS_ROWS
      .slice(0, index)
      .filter((row) => row.group === setting.group)
      .length;
    return {
      x: setting.group === "audio" ? 676 : 892,
      y: 230 + groupIndex * 49,
      width: 204,
      height: 43,
    };
  }

  function settingsSliderGeometry(index) {
    const row = settingsRowGeometry(index);
    return {
      x: row.x + 10,
      y: row.y + 27,
      width: 144,
      height: 8,
    };
  }

  function settingDisplayValue(setting) {
    return `${Math.round(state[setting.key] * 100)}%`;
  }

  function drawSettingsToggle(
    row,
    label,
    checked,
    selected,
  ) {
    const boxX = row.x + 10;
    const boxY = row.y + 12;
    ctx.fillStyle = checked ? "#d96a24" : "#152219";
    ctx.fillRect(boxX, boxY, 19, 19);
    strokeRect(
      boxX,
      boxY,
      19,
      19,
      selected ? "#e4ad6d" : "#80906c",
      selected ? 2 : 1,
    );
    if (checked) {
      drawText("✓", boxX + 10, boxY + 16, 16, "#fff1cc", "center", true);
    }
    drawText(
      label,
      boxX + 29,
      row.y + 27,
      10,
      selected ? "#f2e7bd" : "#dce4cd",
      "left",
      selected,
    );
  }

  function bindingRowGeometry(index) {
    const column =
      index < 5 ? 0 : 1;
    const rowIndex =
      index % 5;
    return {
      x: column === 0 ? 194 : 664,
      y: 198 + rowIndex * 64,
      width: 422,
      height: 52,
    };
  }

  function drawKeyboardBindings() {
    if (state.settingsReturnMode === "paused") {
      drawFirstHole();
    } else {
      drawMenu();
    }
    ctx.fillStyle = "rgba(0,0,0,0.76)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const panel = {
      x: 150,
      y: 82,
      width: 980,
      height: 556,
    };
    ctx.fillStyle = "rgba(5,16,9,0.985)";
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
      "#dc6c25",
      3,
    );
    drawText(
      "KEY BINDINGS",
      WIDTH * 0.5,
      130,
      34,
      "#eee8c9",
      "center",
      true,
    );
    drawText(
      "PERSONAL OPERATING PROCEDURE // KEYBOARD",
      WIDTH * 0.5,
      160,
      13,
      "#d77b3b",
      "center",
    );
    drawText(
      "ARROW KEYS REMAIN A FIXED MOVEMENT FALLBACK",
      WIDTH * 0.5,
      181,
      10,
      "#82927f",
      "center",
    );

    for (
      let index = 0;
      index < KEYBOARD_BINDING_ROWS.length;
      index += 1
    ) {
      const binding =
        KEYBOARD_BINDING_ROWS[index];
      const row =
        bindingRowGeometry(index);
      const selected =
        index === state.bindingIndex;
      const capturing =
        state.bindingCaptureId ===
        binding.id;
      ctx.fillStyle = capturing
        ? "rgba(98,39,17,0.72)"
        : selected
          ? "rgba(50,72,28,0.48)"
          : "rgba(11,28,15,0.78)";
      ctx.fillRect(
        row.x,
        row.y,
        row.width,
        row.height,
      );
      strokeRect(
        row.x,
        row.y,
        row.width,
        row.height,
        capturing
          ? "#f09b4e"
          : selected
            ? "#d47431"
            : "#42543a",
        selected || capturing ? 2 : 1,
      );
      drawText(
        binding.label,
        row.x + 18,
        row.y + 31,
        13,
        selected
          ? "#f2e7bd"
          : "#bcc8b2",
        "left",
        selected,
      );
      const capWidth = 128;
      const capX =
        row.x + row.width - 78;
      ctx.fillStyle = capturing
        ? "#6b2814"
        : "#17271a";
      ctx.fillRect(
        capX - capWidth * 0.5,
        row.y + 8,
        capWidth,
        36,
      );
      strokeRect(
        capX - capWidth * 0.5,
        row.y + 8,
        capWidth,
        36,
        capturing
          ? "#ffc06f"
          : "#788a65",
        capturing ? 2 : 1,
      );
      drawText(
        capturing
          ? "PRESS KEY"
          : keyboardBindingLabel(
              binding.id,
            ),
        capX,
        row.y + 32,
        capturing ? 11 : 13,
        capturing
          ? "#fff0bd"
          : "#f0edd7",
        "center",
        true,
      );
    }

    ctx.fillStyle = "rgba(15,30,17,0.9)";
    ctx.fillRect(194, 526, 892, 45);
    strokeRect(
      194,
      526,
      892,
      45,
      state.bindingCaptureId
        ? "#d47431"
        : "#4e6442",
      1,
    );
    drawText(
      state.bindingCaptureId
        ? `ASSIGNING ${KEYBOARD_BINDING_ROWS[state.bindingIndex].label} // ESC CANCELS`
        : state.bindingStatus,
      WIDTH * 0.5,
      554,
      11,
      state.bindingCaptureId
        ? "#ffd184"
        : "#aab8a2",
      "center",
      true,
    );

    ctx.fillStyle = "rgba(21,41,23,0.82)";
    ctx.fillRect(194, 585, 252, 36);
    strokeRect(
      194,
      585,
      252,
      36,
      "#687e4a",
      1,
    );
    drawText(
      state.inputMethod === "touch"
        ? "RESET DEFAULTS"
        : "R  RESET DEFAULTS",
      320,
      609,
      12,
      "#d9dfcc",
      "center",
      true,
    );
    ctx.fillStyle = "rgba(21,41,23,0.82)";
    ctx.fillRect(834, 585, 252, 36);
    strokeRect(
      834,
      585,
      252,
      36,
      "#687e4a",
      1,
    );
    drawText(
      state.inputMethod === "gamepad"
        ? "B  BACK TO SETTINGS"
        : state.inputMethod === "touch"
          ? "BACK TO SETTINGS"
          : "ESC  BACK TO SETTINGS",
      960,
      609,
      12,
      "#d9dfcc",
      "center",
      true,
    );
    drawText(
      state.inputMethod === "gamepad"
        ? "D-PAD SELECTS // A PREPARES KEYBOARD CAPTURE"
        : state.inputMethod === "touch"
          ? "TAP AN ACTION, THEN PRESS A PHYSICAL KEY"
          : "ARROWS SELECT  •  ENTER REBIND  •  CONFLICTS SWAP",
      WIDTH * 0.5,
      633,
      10,
      "#84927d",
      "center",
    );
  }

  function drawSettings() {
    if (state.settingsPage === "bindings") {
      drawKeyboardBindings();
      return;
    }
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
        title: "1. CHOOSE + FILE AN EXIT",
        detail: "Key→shed; sprinkler→drain; movement aborts filing.",
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
            : `Hold ${keyboardBindingLabel("chip")} + ${keyboardBindingLabel("move_left")}/${keyboardBindingLabel("move_right")}, then release.`,
        subdetail: touchActive
          ? "Landed balls stay. USE reclaims them."
          : controllerActive
            ? "Landed balls stay. A reclaims them."
            : `Landed balls stay. ${keyboardBindingLabel("interact")} reclaims them.`,
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
          "Link breaks, baits, progress, and recoveries for Delivery bonuses.",
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
          : `${keyboardMovementCopy()}  MOVE`,
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
          : `${keyboardBindingLabel("crouch")} CROUCH  •  ${keyboardBindingLabel("focus")} LISTENING FOCUS`,
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
          : `${keyboardBindingLabel("sprint")} SPRINTS — FAST, LOUD, AND EXPOSED.`,
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

    drawText("AUDIO MIX", 686, 213, 13, "#8f9e84", "left", true);
    drawText("PRESENTATION", 902, 213, 13, "#8f9e84", "left", true);
    const selectedSetting = settingsRowGeometry(state.settingsIndex);
    ctx.fillStyle = "rgba(50,72,28,0.36)";
    ctx.fillRect(
      selectedSetting.x,
      selectedSetting.y,
      selectedSetting.width,
      selectedSetting.height,
    );
    strokeRect(
      selectedSetting.x,
      selectedSetting.y,
      selectedSetting.width,
      selectedSetting.height,
      "#d47431",
      2,
    );
    for (let index = 0; index < SETTINGS_ROWS.length; index += 1) {
      const setting = SETTINGS_ROWS[index];
      const row = settingsRowGeometry(index);
      if (setting.type === "slider") {
        const value = state[setting.key];
        const slider = settingsSliderGeometry(index);
        const normalized =
          (value - setting.min) /
          (setting.max - setting.min);
        drawText(
          setting.label,
          row.x + 10,
          row.y + 18,
          10,
          index === state.settingsIndex ? "#f2e7bd" : "#c6d0ba",
          "left",
          index === state.settingsIndex,
        );
        ctx.fillStyle = "#172719";
        ctx.fillRect(slider.x, slider.y, slider.width, slider.height);
        ctx.fillStyle =
          setting.id === "danger"
            ? "#bf4937"
            : setting.id === "mower"
              ? "#d17a31"
              : "#879d55";
        ctx.fillRect(
          slider.x,
          slider.y,
          slider.width * normalized,
          slider.height,
        );
        strokeRect(
          slider.x,
          slider.y,
          slider.width,
          slider.height,
          "#65785a",
          1,
        );
        drawText(
          settingDisplayValue(setting),
          row.x + row.width - 8,
          row.y + 36,
          10,
          "#dfe5d3",
          "right",
        );
      } else {
        drawSettingsToggle(
          row,
          setting.label,
          Boolean(state[setting.key]),
          index === state.settingsIndex,
        );
      }
    }
    ctx.fillStyle = "rgba(15,30,17,0.86)";
    ctx.fillRect(676, 480, 420, 57);
    strokeRect(676, 480, 420, 57, "#4e6442", 1);
    drawText("CAPTION PREVIEW", 688, 497, 9, "#819277", "left", true);
    if (state.threatCaptions) {
      drawSubtitleCard(
        "[ JOE APPROACHING — RIGHT ]",
        886,
        526,
        12,
        "#e6b06d",
      );
    } else {
      drawText(
        "THREAT CAPTIONS OFF",
        886,
        525,
        12,
        "#788274",
        "center",
        true,
      );
    }
    drawText(
      touchActive
        ? "TAP ROWS TO ADJUST"
        : controllerActive
          ? "D-PAD  SELECT / ADJUST"
          : "F  FULLSCREEN",
      700,
      548,
      11,
      "#d9dfcc",
      "left",
    );
    ctx.fillStyle = "rgba(21,41,23,0.8)";
    ctx.fillRect(676, 554, 194, 36);
    strokeRect(676, 554, 194, 36, "#687e4a", 1);
    drawText(
      touchActive
        ? "KEY BINDINGS"
        : controllerActive
          ? "Y  KEY BINDINGS"
          : "B  KEY BINDINGS",
      773,
      578,
      11,
      "#d9dfcc",
      "center",
      true,
    );
    ctx.fillStyle = "rgba(21,41,23,0.8)";
    ctx.fillRect(880, 554, 216, 36);
    strokeRect(880, 554, 216, 36, "#687e4a", 1);
    drawText(
      `←  RETURN TO ${state.settingsReturnMode === "paused" ? "PAUSE" : "MENU"}`,
      988,
      578,
      11,
      "#d9dfcc",
      "center",
      true,
    );
    drawText(
      controllerActive
        ? "LEFT / RIGHT MIX  •  A TOGGLE  •  Y BINDINGS  •  B RETURN"
        : touchActive
          ? "TAP SLIDERS  •  TAP TOGGLES  •  TAP BUTTONS"
          : "ARROWS ADJUST  •  ENTER TOGGLE  •  B BINDINGS  •  ESC RETURN",
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
      selectedMenuVariant();
    const variantIndex = RUN_VARIANTS.indexOf(variant);
    const overtime =
      state.overtimeSelected &&
      overtimeUnlocked();
    const courseEchoRecord =
      compatibleCourseEchoRecord(
        variant.id,
        overtime,
      );
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
        effectLastX:
          variant.joeStart.x,
        effectLastY:
          variant.joeStart.y,
        effectHeading:
          Math.PI * 0.5,
        effectSpeed: 0,
        clippingCarry: 0,
        clippingsEmitted: 0,
        scrapeCooldown: 0,
        scrapeBursts: 0,
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
      escapeFiling: {
        active: false,
        sealing: false,
        route: null,
        progress: 0,
        duration: 0,
        sealProgress: 0,
        sealDuration: ESCAPE_SEAL_DURATION,
        stage: 0,
        attempts: 0,
        cancellations: 0,
        completed: false,
        capturedDuringFiling: false,
        lastInterruption: null,
        joeDistanceAtStart: null,
      },
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
      quickRematch: false,
      rematchTarget: null,
      hasMoved: false,
      moveVector: { x: 0, y: 0 },
      moveHintTimer: 0,
      controlHintTimer: 12,
      travelDistance: 0,
      courseEchoRecord,
      courseEchoSamples: [
        { t: 0, x: 0, y: 0, d: 0 },
      ],
      blockedTimer: 0,
      blockedObstacle: null,
      blockedDirection: null,
      blockedEscape: null,
      blockedLandmark: null,
      blockedWorldX: 0,
      blockedWorldY: 0,
      blockedRadius: 0,
      blockedRadiusX: 0,
      blockedRadiusY: 0,
      blockedCueCooldown: 0,
      navigationGuide:
        freshNavigationGuide(),
      previousJoeMode: "patrol",
      joeBark: null,
      joeBarkTimer: 0,
      joeBarkSerial: 0,
      joeBarkContext: null,
      joeBarkHistory: [],
      captureDialogue: null,
      stateBanner: "",
      stateBannerTimer: 0,
      stateBannerLockTimer: 0,
      detectionPulse: 0,
      heartbeatTimer: 0,
      lastStepDistance: 0,
      lastKnownJoe: null,
      lastKnownJoeTimer: 0,
      captions: [],
      worldEffects: [],
      worldParticles: [],
      nextWorldParticleId: 1,
      peakWorldParticles: 0,
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
      razorCuts: 0,
      riskPremiumBanked: 0,
      riskBreakBonuses: [],
      currentRiskPremium: 150,
      riskAward: null,
      deliveryChain: 0,
      deliveryPeak: 0,
      deliveryTimer: 0,
      deliveryBonus: 0,
      deliveryEvents: [],
      deliveryFamilyCounts: {},
      deliveryAward: null,
      liveProjectionTimer: 0,
      liveProjection: null,
      scorePhase: 0,
      scoreStepIndex: -1,
      scoreBeatPulse: 0,
      scoreNotesPlayed: 0,
      closestJoeDistance: Infinity,
      chaseClosestDistance: Infinity,
    };
    syncLiveProjection(
      calculateRunResult("shed"),
      false,
    );
  }

  function worldDistance(a, b) {
    return Math.hypot((a.x - b.x) * 0.72, a.y - b.y);
  }

  function obstacleFootprintAxes(
    obstacle,
    padding = 0,
  ) {
    return {
      x: Math.max(
        0.01,
        (obstacle.radiusX ??
          obstacle.radius ??
          0) +
          padding,
      ),
      y: Math.max(
        0.01,
        (obstacle.radiusY ??
          obstacle.radius ??
          0) +
          padding,
      ),
    };
  }

  function obstacleNormalizedDistance(
    point,
    obstacle,
    padding = 0,
  ) {
    const axes =
      obstacleFootprintAxes(
        obstacle,
        padding,
      );
    return Math.hypot(
      (point.x - obstacle.x) *
        0.72 /
        axes.x,
      (point.y - obstacle.y) /
        axes.y,
    );
  }

  function obstacleClearance(
    point,
    obstacle,
    padding = 0,
  ) {
    const axes =
      obstacleFootprintAxes(
        obstacle,
        padding,
      );
    const deltaX =
      (point.x - obstacle.x) *
      0.72;
    const deltaY =
      point.y - obstacle.y;
    const centerDistance =
      Math.hypot(deltaX, deltaY);
    if (centerDistance < 0.0001) {
      return -Math.min(
        axes.x,
        axes.y,
      );
    }
    const normalizedDistance =
      Math.hypot(
        deltaX / axes.x,
        deltaY / axes.y,
      );
    const boundaryDistance =
      centerDistance /
      Math.max(
        0.0001,
        normalizedDistance,
      );
    return centerDistance -
      boundaryDistance;
  }

  function segmentObstacleIntersection(
    start,
    end,
    obstacle,
    padding = 0,
  ) {
    const axes =
      obstacleFootprintAxes(
        obstacle,
        padding,
      );
    const startX =
      (start.x - obstacle.x) *
      0.72 /
      axes.x;
    const startY =
      (start.y - obstacle.y) /
      axes.y;
    const endX =
      (end.x - obstacle.x) *
      0.72 /
      axes.x;
    const endY =
      (end.y - obstacle.y) /
      axes.y;
    const segmentX = endX - startX;
    const segmentY = endY - startY;
    const segmentLengthSquared =
      segmentX * segmentX +
      segmentY * segmentY;
    const amount =
      segmentLengthSquared <= 0.0001
        ? 0
        : clamp(
            -(
              startX * segmentX +
              startY * segmentY
            ) /
              segmentLengthSquared,
            0,
            1,
          );
    const closestX =
      startX +
      segmentX * amount;
    const closestY =
      startY +
      segmentY * amount;
    return {
      amount,
      startDistance:
        Math.hypot(startX, startY),
      endDistance:
        Math.hypot(endX, endY),
      closestDistance:
        Math.hypot(
          closestX,
          closestY,
        ),
    };
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
      (
        keyboardBindingDown(
          "move_right",
        ) ||
        state.keys.has("ArrowRight")
          ? 1
          : 0
      ) -
      (
        keyboardBindingDown(
          "move_left",
        ) ||
        state.keys.has("ArrowLeft")
          ? 1
          : 0
      );
    const keyboardY =
      (
        keyboardBindingDown(
          "move_up",
        ) ||
        state.keys.has("ArrowUp")
          ? 1
          : 0
      ) -
      (
        keyboardBindingDown(
          "move_down",
        ) ||
        state.keys.has("ArrowDown")
          ? 1
          : 0
      );
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
      keyboardBindingDown("crouch") ||
      state.gamepad.crouch ||
      state.touch.crouchPointerId !== null
    );
  }

  function sprintHeld() {
    const defaultRightShiftAlias =
      keyboardBindingCode("sprint") ===
        "ShiftLeft" &&
      state.keys.has("ShiftRight");
    return (
      keyboardBindingDown("sprint") ||
      defaultRightShiftAlias ||
      state.gamepad.sprint ||
      state.touch.sprintPointerId !== null
    );
  }

  function focusHeld() {
    return (
      keyboardBindingDown("focus") ||
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
        obstacleClearance(
          point,
          obstacle,
        ),
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
        obstacleClearance(
          player,
          obstacle,
        ) >= -1
      ) {
        const coverDistance =
          obstacleClearance(
            player,
            obstacle,
          );
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
        obstacleClearance(
          player,
          blockingCover,
        );
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
    for (let index = 0; index < COURSE_OBSTACLES.length; index += 1) {
      const obstacle = COURSE_OBSTACLES[index];
      if (!obstacle.blocks || !obstacle.sight) {
        continue;
      }
      const intersection =
        segmentObstacleIntersection(
          start,
          end,
          obstacle,
        );
      if (intersection.startDistance < 1) {
        continue;
      }
      if (
        intersection.closestDistance <
        0.78
      ) {
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
      if (
        obstacleNormalizedDistance(
          { x, y },
          obstacle,
          radius,
        ) < 1
      ) {
        return obstacle;
      }
    }
    return null;
  }

  function projectedGroundRadius(target, radius) {
    const point = worldToScreen(target.x, target.y);
    const nearPoint = worldToScreen(
      target.x,
      target.y - radius,
    );
    const farPoint = worldToScreen(
      target.x,
      target.y + radius,
    );
    return {
      point,
      radiusX: clamp(
        radius *
          COURSE_CAMERA.worldUnitMeters *
          point.pixelsPerMeter,
        5,
        WIDTH * 0.2,
      ),
      radiusY: clamp(
        Math.abs(
          nearPoint.y - farPoint.y,
        ) * 0.5,
        2.5,
        HEIGHT * 0.13,
      ),
    };
  }

  function projectedObstacleFootprint(
    obstacle,
    padding = 0,
  ) {
    const axes =
      obstacleFootprintAxes(
        obstacle,
        padding,
      );
    const point = worldToScreen(
      obstacle.x,
      obstacle.y,
    );
    const leftPoint = worldToScreen(
      obstacle.x -
        axes.x / 0.72,
      obstacle.y,
    );
    const rightPoint = worldToScreen(
      obstacle.x +
        axes.x / 0.72,
      obstacle.y,
    );
    const nearPoint = worldToScreen(
      obstacle.x,
      obstacle.y - axes.y,
    );
    const farPoint = worldToScreen(
      obstacle.x,
      obstacle.y + axes.y,
    );
    return {
      point,
      radiusX: clamp(
        Math.abs(
          rightPoint.x -
            leftPoint.x,
        ) * 0.5,
        4,
        WIDTH * 0.28,
      ),
      radiusY: clamp(
        Math.abs(
          nearPoint.y -
            farPoint.y,
        ) * 0.5,
        2,
        HEIGHT * 0.13,
      ),
    };
  }

  function collisionEscapeDirection(
    obstacle,
  ) {
    if (obstacle.id === "east-course-edge") {
      return "MOVE LEFT BACK IN";
    }
    if (obstacle.id === "west-course-edge") {
      return "MOVE RIGHT BACK IN";
    }
    if (obstacle.id === "north-course-edge") {
      return "MOVE BACK DOWN COURSE";
    }
    if (obstacle.id === "south-course-edge") {
      return "MOVE FORWARD ONTO COURSE";
    }
    const awayX =
      state.player.x - obstacle.x;
    const awayY =
      state.player.y - obstacle.y;
    if (Math.abs(awayX) > 0.35) {
      return awayX < 0
        ? "MOVE LEFT AWAY"
        : "MOVE RIGHT AWAY";
    }
    if (
      Math.abs(awayX) >
      Math.abs(awayY) * 0.7
    ) {
      return awayX < 0
        ? "MOVE LEFT AWAY"
        : "MOVE RIGHT AWAY";
    }
    if (awayY > 0) {
      return "MOVE FORWARD AWAY";
    }
    const leftClear =
      !obstacleAtPosition(
        state.player.x - 5,
        state.player.y,
      );
    const rightClear =
      !obstacleAtPosition(
        state.player.x + 5,
        state.player.y,
      );
    if (leftClear && !rightClear) {
      return "MOVE LEFT AROUND";
    }
    if (rightClear && !leftClear) {
      return "MOVE RIGHT AROUND";
    }
    return "MOVE LEFT OR RIGHT AROUND";
  }

  function visibleObstacleState() {
    const visible = [];
    for (let index = 0; index < COURSE_OBSTACLES.length; index += 1) {
      const obstacle = COURSE_OBSTACLES[index];
      const point = worldToScreen(obstacle.x, obstacle.y);
      if (point.visible && point.x > -120 && point.x < WIDTH + 120) {
        visible.push({
          id: obstacle.id,
          landmark: obstacle.landmark,
          x: obstacle.x,
          y: obstacle.y,
          radius: obstacle.radius,
          footprint: {
            shape: "ellipse",
            radiusX:
              obstacleFootprintAxes(
                obstacle,
              ).x,
            radiusY:
              obstacleFootprintAxes(
                obstacle,
              ).y,
          },
          blocks: obstacle.blocks,
          distance: Math.round(worldDistance(obstacle, state.player)),
          clearance: Number(
            obstacleClearance(
              state.player,
              obstacle,
              PLAYER_COLLISION_RADIUS,
            ).toFixed(2),
          ),
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

  function interactableWorldState() {
    const key = activeKeyPoint();
    const sprinkler =
      activeSprinklerPoint();
    const changeRequest =
      activeChangeRequest();
    const definitions = [
      {
        id: "shed-key",
        label: "SHED KEY",
        target: key,
        available:
          !state.hole.keyCollected,
        worldImage:
          "imagegen-grounded-key",
      },
      {
        id: "sprinkler",
        label: "SPRINKLER",
        target: sprinkler,
        available:
          !state.hole.sprinklerUsed,
        worldImage:
          "imagegen-grounded-valve",
      },
      {
        id: changeRequest.id,
        label: changeRequest.code,
        target: changeRequest,
        available:
          !state.hole
            .changeRequestCollected,
        worldImage:
          "imagegen-change-request-clipboard",
      },
      {
        id: "maintenance-shed",
        label: "MAINTENANCE SHED",
        target: SHED_EXIT,
        available: true,
        worldImage:
          "course-landmark",
      },
      {
        id: "drain-exit",
        label: "DRAIN EXIT",
        target: DRAIN_EXIT,
        available: true,
        worldImage:
          "drain-culvert",
      },
    ];
    return definitions.map(
      (definition) => {
        const point =
          worldToScreen(
            definition.target.x,
            definition.target.y,
          );
        const distance =
          worldDistance(
            state.player,
            definition.target,
          );
        return {
          id: definition.id,
          label: definition.label,
          available:
            definition.available,
          x: definition.target.x,
          y: definition.target.y,
          distance: Number(
            distance.toFixed(2),
          ),
          interactionRadius:
            definition.target.radius,
          inReach:
            definition.available &&
            distance <
              definition.target.radius,
          visible:
            definition.available &&
            point.visible &&
            point.x > -180 &&
            point.x < WIDTH + 180,
          screenX: Math.round(
            point.x,
          ),
          screenY: Math.round(
            point.y,
          ),
          worldImage:
            definition.worldImage,
        };
      },
    );
  }

  function visibleDeadGreenSceneryState() {
    const visible = [];
    for (let index = 0; index < DEAD_GREEN_SCENERY.length; index += 1) {
      const scenery = DEAD_GREEN_SCENERY[index];
      const point = worldToScreen(scenery.x, scenery.y);
      if (point.visible && point.x > -180 && point.x < WIDTH + 180) {
        visible.push({
          id: scenery.id,
          landmark: scenery.landmark,
          x: scenery.x,
          y: scenery.y,
          forwardDistance: Math.round(point.forwardDistance),
          projectedScale: Number(point.scale.toFixed(2)),
          screenX: Math.round(point.x),
          screenY: Math.round(point.y),
        });
      }
    }
    visible.sort((a, b) => a.forwardDistance - b.forwardDistance);
    return visible;
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
      const requestedX =
        player.x + stepX;
      const requestedY =
        player.y + stepY;
      const targetX = clamp(
        requestedX,
        -COURSE_MAX_X,
        COURSE_MAX_X,
      );
      const targetY = clamp(
        requestedY,
        COURSE_MIN_Y,
        COURSE_LENGTH,
      );
      let boundaryBlocker = null;
      if (requestedX > COURSE_MAX_X) {
        boundaryBlocker = {
          id: "east-course-edge",
          x: COURSE_MAX_X,
          y: player.y,
          radius: 0,
          sight: false,
          landmark:
            "east course boundary",
        };
      } else if (
        requestedX < -COURSE_MAX_X
      ) {
        boundaryBlocker = {
          id: "west-course-edge",
          x: -COURSE_MAX_X,
          y: player.y,
          radius: 0,
          sight: false,
          landmark:
            "west course boundary",
        };
      } else if (
        requestedY > COURSE_LENGTH
      ) {
        boundaryBlocker = {
          id: "north-course-edge",
          x: player.x,
          y: COURSE_LENGTH,
          radius: 0,
          sight: false,
          landmark:
            "end of maintained course",
        };
      } else if (
        requestedY < COURSE_MIN_Y
      ) {
        boundaryBlocker = {
          id: "south-course-edge",
          x: player.x,
          y: COURSE_MIN_Y,
          radius: 0,
          sight: false,
          landmark:
            "clubhouse boundary",
        };
      }
      const blocker =
        obstacleAtPosition(
          targetX,
          targetY,
        ) || boundaryBlocker;
      if (!blocker) {
        player.x = targetX;
        player.y = targetY;
      } else {
        if (!initialBlocker) {
          initialBlocker = blocker;
        }
        const blockerDistance =
          obstacleClearance(
            player,
            blocker,
          );
        const horizontalBlocker =
          obstacleAtPosition(
            targetX,
            player.y,
          );
        const horizontalEscapes =
          horizontalBlocker &&
          horizontalBlocker.id ===
            blocker.id &&
          obstacleClearance(
            {
              x: targetX,
              y: player.y,
            },
            blocker,
          ) >
            blockerDistance + 0.001;
        if (
          !horizontalBlocker ||
          horizontalEscapes
        ) {
          player.x = targetX;
        }
        const verticalBlocker =
          obstacleAtPosition(
            player.x,
            targetY,
          );
        const verticalEscapes =
          verticalBlocker &&
          verticalBlocker.id ===
            blocker.id &&
          obstacleClearance(
            {
              x: player.x,
              y: targetY,
            },
            blocker,
          ) >
            blockerDistance + 0.001;
        if (
          !verticalBlocker ||
          verticalEscapes
        ) {
          player.y = targetY;
        }
      }
      appliedDistance += Math.hypot(player.x - startX, player.y - startY);
    }

    if (initialBlocker) {
      const newContact =
        state.hole.blockedObstacle !==
          initialBlocker.id ||
        state.hole.blockedTimer <= 0.12;
      state.hole.blockedTimer = 1.15;
      state.hole.blockedObstacle = initialBlocker.id;
      state.hole.blockedDirection =
        Math.abs(deltaX) > Math.abs(deltaY)
          ? deltaX > 0
            ? "RIGHT"
            : "LEFT"
          : deltaY > 0
            ? "FORWARD"
            : "BACK";
      state.hole.blockedEscape =
        collisionEscapeDirection(
          initialBlocker,
        );
      state.hole.blockedLandmark =
        initialBlocker.landmark;
      state.hole.blockedWorldX =
        initialBlocker.x;
      state.hole.blockedWorldY =
        initialBlocker.y;
      state.hole.blockedRadius =
        initialBlocker.radius;
      state.hole.blockedRadiusX =
        initialBlocker.radiusX ??
        initialBlocker.radius;
      state.hole.blockedRadiusY =
        initialBlocker.radiusY ??
        initialBlocker.radius;
      if (
        newContact &&
        state.hole.blockedCueCooldown <= 0
      ) {
        playCollisionCue(
          initialBlocker,
        );
        state.hole.blockedCueCooldown =
          0.42;
      }
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

  function directionFromPlayer(source) {
    if (!source) {
      return null;
    }
    const deltaX = source.x - state.player.x;
    const deltaY = source.y - state.player.y;
    if (Math.abs(deltaX) > Math.abs(deltaY) * 0.55) {
      return deltaX < 0 ? "LEFT" : "RIGHT";
    }
    return deltaY >= 0 ? "AHEAD" : "BEHIND";
  }

  function pushThreatCaption(
    text,
    source = null,
    category = "world",
    duration = 2.4,
    key = text,
  ) {
    if (
      !state.threatCaptions ||
      state.mode !== "first_hole" ||
      !state.hole.captions
    ) {
      return;
    }
    const existing = state.hole.captions.find(
      (caption) => caption.key === key,
    );
    if (existing) {
      existing.age = 0;
      existing.duration = duration;
      existing.direction = directionFromPlayer(source);
      return;
    }
    state.hole.captions.push({
      key,
      text,
      direction: directionFromPlayer(source),
      category,
      age: 0,
      duration,
    });
    if (state.hole.captions.length > 3) {
      state.hole.captions.shift();
    }
  }

  function updateThreatCaptions(dt) {
    if (!state.hole.captions) {
      return;
    }
    for (let index = state.hole.captions.length - 1; index >= 0; index -= 1) {
      const caption = state.hole.captions[index];
      caption.age += dt;
      if (caption.age >= caption.duration) {
        state.hole.captions.splice(index, 1);
      }
    }
  }

  function drawThreatCaptions() {
    if (
      !state.threatCaptions ||
      !state.hole.captions?.length ||
      state.hole.tutorialVisible
    ) {
      return;
    }
    const captions = state.hole.captions.slice(-2);
    for (let index = 0; index < captions.length; index += 1) {
      const caption = captions[index];
      const remaining = caption.duration - caption.age;
      const fade = clamp(
        Math.min(caption.age / 0.12, remaining / 0.3),
        0,
        1,
      );
      const color =
        caption.category === "danger"
          ? "#f09a69"
          : caption.category === "mower"
            ? "#e6b06d"
            : "#c9d8bd";
      const direction = caption.direction
        ? ` — ${caption.direction}`
        : "";
      ctx.globalAlpha = fade;
      drawSubtitleCard(
        `[ ${caption.text}${direction} ]`,
        WIDTH * 0.5,
        494 + index * 38,
        13,
        color,
      );
      ctx.globalAlpha = 1;
    }
  }

  function drawJoeBark() {
    const hole = state.hole;
    if (
      !state.subtitles ||
      !hole.joeBark ||
      hole.joeBarkTimer <= 0 ||
      hole.tutorialVisible
    ) {
      return;
    }
    const fade = clamp(
      Math.min(
        (
          3.2 -
          hole.joeBarkTimer
        ) /
          0.14,
        hole.joeBarkTimer /
          0.34,
      ),
      0,
      1,
    );
    ctx.save();
    ctx.globalAlpha = fade;
    drawSubtitleCard(
      `JOE // "${hole.joeBark}"`,
      WIDTH * 0.5,
      454,
      14 *
        state.subtitleSize,
      hole.joe.mode === "chase"
        ? "#f2ad7d"
        : "#d9cf9b",
    );
    ctx.restore();
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

  function addMowerWorldParticle(
    kind,
    x,
    y,
    heading,
    seed,
  ) {
    const hole = state.hole;
    const forwardX =
      Math.cos(heading);
    const forwardY =
      Math.sin(heading);
    const sideX = -forwardY;
    const sideY = forwardX;
    const serial =
      hole.nextWorldParticleId;
    const sideDirection =
      serial % 2 === 0 ? -1 : 1;
    const lateral =
      sideDirection *
      (
        2.4 +
        hash(seed + 3.7) * 4.8
      );
    const rear =
      1.6 +
      hash(seed + 8.3) * 2.2;
    const backward =
      3 +
      hash(seed + 17.9) * 8;
    const palette =
      kind === "wet_clipping"
        ? [
            "#79b3a3",
            "#4c8978",
            "#b0d6b8",
          ]
        : kind === "sand_shard"
          ? [
              "#d7bb78",
              "#a57a42",
              "#efd79a",
            ]
          : kind === "mower_spark"
            ? [
                "#fff1a5",
                "#f2a13e",
                "#d85a21",
              ]
            : [
                "#b6bb63",
                "#788b42",
                "#d0c778",
                "#4d6f37",
              ];
    const color =
      palette[
        Math.floor(
          hash(seed + 22.7) *
            palette.length,
        ) %
          palette.length
      ];
    const dust =
      kind === "grass_dust";
    const spark =
      kind === "mower_spark";
    const wet =
      kind === "wet_clipping";
    const sand =
      kind === "sand_shard";
    hole.nextWorldParticleId += 1;
    hole.worldParticles.push({
      id: serial,
      kind,
      layer:
        dust ? "behind" : "front",
      x:
        x -
        forwardX * rear +
        sideX *
          lateral *
          0.38,
      y:
        y -
        forwardY * rear +
        sideY *
          lateral *
          0.38,
      z:
        spark
          ? 0.2
          : wet
            ? 0.1
            : 0.06,
      vx:
        -forwardX * backward +
        sideX * lateral *
          (
            spark
              ? 2.1
              : 1.25
          ),
      vy:
        -forwardY * backward +
        sideY * lateral *
          (
            spark
              ? 2.1
              : 1.25
          ),
      vz:
        spark
          ? 1.4 +
            hash(seed + 29.3) *
              2.3
          : dust
            ? 0.18 +
              hash(seed + 31.1) *
                0.34
            : wet
              ? 0.75 +
                hash(seed + 33.7) *
                  1.25
              : 0.65 +
                hash(seed + 35.9) *
                  1.6,
      age: 0,
      duration:
        spark
          ? 0.32 +
            hash(seed + 38.1) *
              0.22
          : dust
            ? 1.25 +
              hash(seed + 41.3) *
                0.75
            : wet
              ? 0.72 +
                hash(seed + 43.9) *
                  0.46
              : sand
                ? 0.66 +
                  hash(seed + 47.1) *
                    0.5
                : 0.78 +
                  hash(seed + 49.7) *
                    0.72,
      gravity:
        spark
          ? 5.8
          : dust
            ? -0.04
            : wet
              ? 3.4
              : 2.45,
      drag:
        dust
          ? 1.75
          : wet
            ? 1.15
            : 0.72,
      bounce:
        spark
          ? 0.34
          : sand
            ? 0.18
            : 0.08,
      landed: false,
      rotation:
        hash(seed + 53.3) *
        Math.PI *
        2,
      spin:
        (
          hash(seed + 59.9) -
          0.5
        ) *
        (
          spark
            ? 22
            : 13
        ),
      sizeMeters:
        dust
          ? 0.18 +
            hash(seed + 61.7) *
              0.16
          : spark
            ? 0.025 +
              hash(seed + 67.1) *
                0.025
            : wet
              ? 0.028 +
                hash(seed + 71.3) *
                  0.034
              : 0.024 +
                hash(seed + 71.3) *
                  0.038,
      length:
        dust
          ? 1
          : spark
            ? 4.5
            : 1.8 +
              hash(seed + 73.7) *
                1.8,
      color,
      seed,
    });
    if (
      hole.worldParticles.length >
      MAX_MOWER_WORLD_PARTICLES
    ) {
      hole.worldParticles.splice(
        0,
        hole.worldParticles.length -
          MAX_MOWER_WORLD_PARTICLES,
      );
    }
    hole.peakWorldParticles =
      Math.max(
        hole.peakWorldParticles,
        hole.worldParticles.length,
      );
  }

  function updateJoeMowerEffects(dt) {
    const hole = state.hole;
    const joe = hole.joe;
    const deltaX =
      joe.x - joe.effectLastX;
    const deltaY =
      joe.y - joe.effectLastY;
    const movementDistance =
      worldDistance(
        joe,
        {
          x: joe.effectLastX,
          y: joe.effectLastY,
        },
      );
    const movementSpeed =
      movementDistance /
      Math.max(0.001, dt);
    joe.effectSpeed =
      movementSpeed;
    if (movementDistance > 0.015) {
      joe.effectHeading =
        Math.atan2(
          deltaY,
          deltaX,
        );
    }
    joe.effectLastX = joe.x;
    joe.effectLastY = joe.y;
    joe.scrapeCooldown =
      Math.max(
        0,
        joe.scrapeCooldown - dt,
      );
    if (movementSpeed < 0.4) {
      return;
    }
    const modeMultiplier =
      joe.mode === "chase"
        ? 1.58
        : joe.mode === "search"
          ? 1.18
          : joe.mode ===
              "investigate"
            ? 1.05
            : 0.76;
    const motionScale =
      state.reducedMotion
        ? 0.58
        : 1;
    joe.clippingCarry +=
      movementDistance *
      1.7 *
      modeMultiplier *
      motionScale;
    let quantity = Math.min(
      state.reducedMotion ? 3 : 7,
      Math.floor(
        joe.clippingCarry,
      ),
    );
    joe.clippingCarry -=
      quantity;
    while (quantity > 0) {
      const serial =
        joe.clippingsEmitted +
        quantity;
      const seed =
        hash(
          hole.elapsed * 71 +
            serial * 37 +
            joe.x * 11 +
            joe.y * 17,
        ) *
        997;
      const terrainKind =
        joe.wet
          ? "wet_clipping"
          : joe.sand
            ? "sand_shard"
            : serial % 6 === 0
              ? "grass_dust"
              : "grass_shaving";
      addMowerWorldParticle(
        terrainKind,
        joe.x,
        joe.y,
        joe.effectHeading,
        seed,
      );
      joe.clippingsEmitted += 1;
      quantity -= 1;
    }
    const obstacleClearance =
      joeObstacleClearanceAt(joe);
    if (
      joe.routeObstacle &&
      obstacleClearance < 4.4 &&
      joe.scrapeCooldown <= 0 &&
      !joe.wet &&
      !joe.sand
    ) {
      const sparkCount =
        state.reducedMotion
          ? 2
          : joe.mode === "chase"
            ? 7
            : 4;
      for (
        let index = 0;
        index < sparkCount;
        index += 1
      ) {
        addMowerWorldParticle(
          "mower_spark",
          joe.x,
          joe.y,
          joe.effectHeading,
          hash(
            hole.elapsed * 127 +
              index * 43,
          ) *
            997,
        );
      }
      joe.scrapeCooldown =
        joe.mode === "chase"
          ? 0.46
          : 0.78;
      joe.scrapeBursts += 1;
    }
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
    for (
      let index =
        hole.worldParticles.length -
        1;
      index >= 0;
      index -= 1
    ) {
      const particle =
        hole.worldParticles[index];
      particle.age += dt;
      const drag =
        Math.exp(
          -particle.drag * dt,
        );
      particle.vx *= drag;
      particle.vy *= drag;
      particle.x +=
        particle.vx * dt;
      particle.y +=
        particle.vy * dt;
      particle.vz -=
        particle.gravity * dt;
      particle.z +=
        particle.vz * dt;
      particle.rotation +=
        particle.spin * dt;
      if (particle.z <= 0) {
        particle.z = 0;
        if (
          !particle.landed &&
          particle.bounce > 0.1 &&
          Math.abs(particle.vz) >
            0.45
        ) {
          particle.vz =
            -particle.vz *
            particle.bounce;
        } else {
          particle.vz = 0;
          particle.landed = true;
          particle.vx *=
            particle.kind ===
            "grass_dust"
              ? 0.94
              : 0.55;
          particle.vy *=
            particle.kind ===
            "grass_dust"
              ? 0.94
              : 0.55;
          particle.spin *= 0.72;
        }
      }
      if (
        particle.age >=
        particle.duration
      ) {
        hole.worldParticles.splice(
          index,
          1,
        );
      }
    }
  }

  function currentJoeBarkContext(
    mode,
  ) {
    const hole = state.hole;
    if (
      mode === "chase" &&
      worldDistance(
        hole.joe,
        state.player,
      ) < 18
    ) {
      return "close_chase";
    }
    if (
      hole.trailWarningTimer > 0
    ) {
      return "trail";
    }
    if (
      mode === "investigate" &&
      hole.distraction
    ) {
      return "distraction";
    }
    if (
      hole.overtime &&
      hole.joeBarkSerial % 3 ===
        2
    ) {
      return "overtime";
    }
    return null;
  }

  function triggerJoeBark(
    mode,
    requestedContext = null,
  ) {
    const context =
      requestedContext ||
      currentJoeBarkContext(mode);
    const contextOptions =
      context
        ? JOE_CONTEXT_BARKS[
            context
          ]
        : null;
    const options =
      contextOptions &&
      contextOptions.length > 0
        ? contextOptions
        : JOE_STATE_BARKS[mode];
    if (
      !options ||
      options.length === 0
    ) {
      return;
    }
    const recentBarks =
      state.hole
        .joeBarkHistory;
    const freshOptions =
      options.filter(
        (line) =>
          !recentBarks.includes(
            line,
          ),
      );
    const candidates =
      freshOptions.length > 0
        ? freshOptions
        : options;
    state.hole.joeBarkSerial +=
      1;
    const seed =
      state.hole
        .joeBarkSerial *
        41 +
      state.hole.variantIndex *
        17 +
      (
        context
          ? context.length * 13
          : mode.length * 7
      ) +
      Math.floor(
        state.hole.elapsed *
          3,
      );
    const index =
      Math.floor(
        hash(seed) *
          candidates.length,
      ) %
      candidates.length;
    state.hole.joeBark =
      candidates[index];
    state.hole.joeBarkContext =
      context || mode;
    recentBarks.push(
      state.hole.joeBark,
    );
    if (
      recentBarks.length >
      JOE_BARK_HISTORY_LIMIT
    ) {
      recentBarks.splice(
        0,
        recentBarks.length -
          JOE_BARK_HISTORY_LIMIT,
      );
    }
    state.hole.joeBarkTimer =
      mode === "chase"
        ? 3.2
        : 2.65;
  }

  function selectJoeCaptureDialogue() {
    const hole = state.hole;
    const seed =
      state.career.captures *
        97 +
      hole.variantIndex *
        43 +
      Math.floor(
        hole.elapsed *
          10,
      ) +
      hole.ballThrowsUsed *
        29 +
      Math.round(
        hole.maxDetection *
          100,
      );
    const recentIds =
      state
        .lastJoeCaptureLineIds;
    const freshLines =
      JOE_CAPTURE_LINES.filter(
        (line) =>
          !recentIds.includes(
            line.id,
          ),
      );
    const availableLines =
      freshLines.length > 0
        ? freshLines
        : JOE_CAPTURE_LINES;
    const index =
      Math.floor(
        hash(seed) *
          availableLines.length,
      ) %
      availableLines.length;
    const dialogue =
      availableLines[index];
    state.lastJoeCaptureLineId =
      dialogue.id;
    recentIds.push(dialogue.id);
    if (
      recentIds.length >
      JOE_CAPTURE_HISTORY_LIMIT
    ) {
      recentIds.splice(
        0,
        recentIds.length -
          JOE_CAPTURE_HISTORY_LIMIT,
      );
    }
    return {
      id: dialogue.id,
      expression:
        dialogue.expression,
      tone: dialogue.tone,
      lines:
        dialogue.lines.slice(),
    };
  }

  function announceJoeState(
    mode,
    dialogueContext = null,
  ) {
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
    triggerJoeBark(
      mode,
      dialogueContext,
    );
    const captionLabels = {
      patrol: "JOE RECEDING",
      investigate: "JOE TURNS TOWARD A SOUND",
      search: "JOE SEARCHING",
      chase: "JOE SURGING CLOSER",
    };
    pushThreatCaption(
      captionLabels[mode] || "JOE CHANGES COURSE",
      state.hole.joe,
      mode === "chase" ? "danger" : "mower",
      mode === "chase" ? 2.8 : 2.1,
      `joe_${mode}`,
    );
    playThreatCue(mode);
  }

  function escapeRoutePoint(route) {
    return route === "drain"
      ? DRAIN_EXIT
      : SHED_EXIT;
  }

  function escapeRouteLabel(route) {
    return route === "drain"
      ? "DRAIN RELEASE"
      : "SHED RELEASE";
  }

  function playEscapeFilingCue(stage) {
    const frequency = 174 + stage * 58;
    playTransientTone(
      frequency,
      frequency * 0.74,
      0.12,
      0.038,
      "square",
    );
    playNoiseBurst(
      0.075,
      0.018,
      980 - stage * 110,
      "bandpass",
    );
    if (stage === 3) {
      playTransientTone(
        348,
        232,
        0.22,
        0.055,
        "square",
      );
      playTransientTone(
        522,
        392,
        0.25,
        0.032,
        "sine",
        0.04,
      );
      playNoiseBurst(
        0.12,
        0.03,
        640,
        "lowpass",
      );
    }
  }

  function beginEscapeFiling(route) {
    const hole = state.hole;
    const filing = hole.escapeFiling;
    const routeOpen =
      route === "drain"
        ? hole.drainUnlocked
        : hole.keyCollected;
    const routePoint =
      escapeRoutePoint(route);
    if (
      !routeOpen ||
      filing.active ||
      filing.sealing ||
      worldDistance(
        state.player,
        routePoint,
      ) >= routePoint.radius
    ) {
      return false;
    }
    filing.active = true;
    filing.sealing = false;
    filing.route = route;
    filing.progress = 0;
    filing.duration =
      ESCAPE_FILING_DURATION[route];
    filing.sealProgress = 0;
    filing.sealDuration =
      ESCAPE_SEAL_DURATION;
    filing.stage = 0;
    filing.attempts += 1;
    filing.completed = false;
    filing.capturedDuringFiling = false;
    filing.lastInterruption = null;
    filing.joeDistanceAtStart =
      worldDistance(
        hole.joe,
        state.player,
      );
    hole.noise = Math.max(
      hole.noise,
      route === "drain"
        ? 0.52
        : 0.44,
    );
    hole.joe.alert = Math.max(
      hole.joe.alert,
      0.28,
    );
    hole.stateBanner =
      `FINAL FILING // ${escapeRouteLabel(route)}`;
    hole.stateBannerTimer =
      filing.duration + 0.3;
    hole.stateBannerLockTimer =
      filing.duration + 0.3;
    hole.messageTimer = 0;
    addWorldEffect(
      "filing_stamp",
      routePoint.x,
      routePoint.y,
      0.8,
    );
    playEscapeFilingCue(0);
    pushThreatCaption(
      route === "drain"
        ? "CULVERT RELEASE FORM CLACKS OPEN"
        : "SHED RELEASE FORM HITS THE CLIPBOARD",
      routePoint,
      "world",
      2.1,
      `filing_${route}`,
    );
    triggerJoeBark(
      hole.joe.mode,
      "final_filing",
    );
    return true;
  }

  function beginEscapeSeal() {
    const hole = state.hole;
    const filing = hole.escapeFiling;
    const routePoint =
      escapeRoutePoint(
        filing.route,
      );
    filing.stage = 3;
    filing.completed = true;
    filing.active = false;
    filing.sealing = true;
    filing.sealProgress = 0;
    filing.sealDuration =
      ESCAPE_SEAL_DURATION;
    hole.ballAim =
      freshBallAimState();
    hole.prompt =
      "RELEASE AUTHORIZED";
    hole.stateBanner =
      "FILE ACCEPTED // RELEASE AUTHORIZED";
    hole.stateBannerTimer =
      ESCAPE_SEAL_DURATION + 0.3;
    hole.stateBannerLockTimer =
      ESCAPE_SEAL_DURATION + 0.3;
    addWorldEffect(
      "filing_stamp",
      routePoint.x,
      routePoint.y,
      1,
    );
    playEscapeFilingCue(3);
    pushThreatCaption(
      "FINAL RELEASE STAMPED",
      routePoint,
      "world",
      1.2,
      `filing_seal_${filing.route}`,
    );
  }

  function cancelEscapeFiling(reason) {
    const hole = state.hole;
    const filing = hole.escapeFiling;
    if (!filing.active) {
      return false;
    }
    const interruptedRoute =
      filing.route;
    filing.active = false;
    filing.route = null;
    filing.progress = 0;
    filing.duration = 0;
    filing.stage = 0;
    filing.cancellations += 1;
    filing.lastInterruption = reason;
    hole.stateBanner =
      "FILING WITHDRAWN // MOVEMENT DETECTED";
    hole.stateBannerTimer = 1.8;
    hole.stateBannerLockTimer = 1.8;
    setHoleMessage(
      `${escapeRouteLabel(interruptedRoute)} WITHDRAWN — return to the exit and file again.`,
      2.5,
    );
    playTransientTone(
      162,
      82,
      0.2,
      0.045,
      "sawtooth",
    );
    return true;
  }

  function updateEscapeFiling(dt) {
    const hole = state.hole;
    const filing = hole.escapeFiling;
    if (filing.sealing) {
      filing.sealProgress = Math.min(
        filing.sealDuration,
        filing.sealProgress + dt,
      );
      if (
        filing.sealProgress >=
        filing.sealDuration
      ) {
        filing.sealing = false;
        completeHole(
          filing.route,
        );
      }
      return;
    }
    if (!filing.active) {
      return;
    }
    const routePoint =
      escapeRoutePoint(
        filing.route,
      );
    if (
      worldDistance(
        state.player,
        routePoint,
      ) >= routePoint.radius + 0.8
    ) {
      cancelEscapeFiling(
        "LEFT_EXIT",
      );
      return;
    }
    filing.progress = Math.min(
      filing.duration,
      filing.progress + dt,
    );
    const nextStage = Math.min(
      3,
      Math.floor(
        filing.progress /
          filing.duration *
          3,
      ),
    );
    if (
      nextStage > filing.stage &&
      nextStage < 3
    ) {
      filing.stage = nextStage;
      addWorldEffect(
        "filing_stamp",
        routePoint.x,
        routePoint.y,
        0.7,
      );
      playEscapeFilingCue(
        nextStage,
      );
    }
    if (
      filing.progress >=
      filing.duration
    ) {
      beginEscapeSeal();
    }
  }

  function completeHole(route) {
    state.hole.escapeRoute = route;
    state.hole.result = recordVictory(route);
    syncLiveProjection(
      state.hole.result,
      false,
    );
    state.resultIndex = 0;
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
    awardDeliveryBeat(
      "CHANGE REQUEST SECURED",
      180,
    );
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
    pushThreatCaption(
      "PAPERWORK SNAPS IN THE WIND",
      request,
      "world",
      2,
      "change_request",
    );
    return true;
  }

  function interactWithCourse() {
    if (state.mode !== "first_hole") {
      return;
    }
    if (state.hole.escapeFiling.sealing) {
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
      pushThreatCaption(
        "METAL KEY RINGS OUT",
        key,
        "world",
        2.2,
        "key_pickup",
      );
      triggerJoeBark(
        state.hole.joe.mode,
        "key_pickup",
      );
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
      announceJoeState(
        "investigate",
        "sprinkler",
      );
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
      pushThreatCaption(
        "SPRINKLERS ERUPT; CULVERT GRINDS OPEN",
        sprinkler,
        "world",
        3,
        "sprinkler_drain",
      );
      return;
    }

    if (
      state.hole.keyCollected &&
      worldDistance(state.player, shed) <
        shed.radius
    ) {
      beginEscapeFiling("shed");
      return;
    }

    if (
      state.hole.drainUnlocked &&
      worldDistance(state.player, drain) <
        drain.radius
    ) {
      beginEscapeFiling("drain");
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
      state.hole.ballAim.active ||
      state.hole.escapeFiling.sealing
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
    pushThreatCaption(
      "GOLF BALL STRIKES TURF",
      target,
      "world",
      2.1,
      "ball_impact",
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
    awardDeliveryBeat(
      danger.dangerous
        ? "PRESSURE RECOVERY"
        : "BALL RECOVERED",
      danger.dangerous
        ? 140
        : 90,
    );
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
    let joeEventBarkContext = null;
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
      pushThreatCaption(
        "JOE RIPS THROUGH YOUR TRACKS",
        trailEvidence,
        "danger",
        2.7,
        "trail_found",
      );
      joeEventBarkContext =
        "trail";
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
      pushThreatCaption(
        visibleNow
          ? "MOWER TURNS TOWARD YOU"
          : "MOWER REACTS TO NOISE",
        joe,
        "danger",
        2.2,
        "detection_warning",
      );
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
      awardDeliveryBeat(
        "JOE BAITED INTO BUNKER",
        125,
      );
      sandTrapTriggered = true;
      joeEventBarkContext =
        "sand";
      addWorldEffect(
        "sand_churn",
        joe.x,
        joe.y,
        2.1,
      );
      if (!joeWet) {
        playSandChurnCue();
        pushThreatCaption(
          "MOWER CHURNS THROUGH SAND",
          joe,
          "mower",
          2.5,
          "sand_churn",
        );
      }
    }
    if (joeWet && !joe.wet) {
      joeEventBarkContext =
        "wet";
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
      pushThreatCaption(
        "MOWER COUGHS IN SOAKED TURF",
        joe,
        "mower",
        2.7,
        "mower_bog",
      );
    }
    joe.wet = joeWet;
    joe.sand = joeSand;
    updateJoeMowerEffects(dt);
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
      hole.currentRiskPremium =
        riskPremiumForDistance(
          hole.chaseClosestDistance,
        );
      hole.riskAward = null;
    }
    if (joe.mode === "chase") {
      hole.pursuitSeconds += dt;
      hole.chaseClosestDistance = Math.min(
        hole.chaseClosestDistance,
        worldDistance(joe, state.player),
      );
      hole.currentRiskPremium =
        riskPremiumForDistance(
          hole.chaseClosestDistance,
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
      if (hole.chaseClosestDistance < 12) {
        hole.razorCuts += 1;
      }
      bankRiskPremium(
        hole.chaseClosestDistance,
      );
    }
    if (joe.mode !== previousMode) {
      announceJoeState(
        joe.mode,
        brokeContact
          ? "lost_contact"
          : joeEventBarkContext,
      );
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
      if (brokeContact) {
        const riskAward =
          hole.riskAward;
        const tierLabel =
          riskAward?.tier === "razor"
            ? "RAZOR CUT"
            : riskAward?.tier === "close"
              ? "CLOSE CUT"
              : "CONTACT BROKEN";
        hole.stateBanner =
          riskAward
            ? `${tierLabel} // +${riskAward.amount} RISK PREMIUM`
            : "CONTACT BROKEN // PREMIUM CAP REACHED";
        hole.stateBannerTimer = 2.35;
        hole.stateBannerLockTimer = 2.35;
        if (
          hole.chaseClosestDistance < 12
        ) {
          setHoleMessage(
            "RAZOR CUT — The mower nearly had you. Premium banked.",
            2.35,
          );
        }
        playRiskPremiumCue(
          riskAward?.tier || "break",
        );
      }
    } else if (
      joeEventBarkContext
    ) {
      triggerJoeBark(
        joe.mode,
        joeEventBarkContext,
      );
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
      if (hole.escapeFiling.active) {
        hole.escapeFiling.active = false;
        hole.escapeFiling.capturedDuringFiling = true;
        hole.escapeFiling.lastInterruption =
          "CAPTURED";
      }
      recordCapture();
      hole.captureDialogue =
        selectJoeCaptureDialogue();
      state.resultIndex = 0;
      state.mode = "defeat";
      state.time = 0;
      state.transitionAlpha = 0.6;
      state.status = "Caught by Joe.";
      setMotorLevel(0.14, 92);
      playCaptureCue();
    }
  }

  function joeObstacleOnSegment(start, end, padding = JOE_NAVIGATION_CLEARANCE) {
    let nearest = null;
    let nearestAmount = Infinity;

    for (let index = 0; index < COURSE_OBSTACLES.length; index += 1) {
      const obstacle = COURSE_OBSTACLES[index];
      if (!obstacle.blocks) {
        continue;
      }
      const intersection =
        segmentObstacleIntersection(
          start,
          end,
          obstacle,
          padding,
        );

      // Joe may begin inside an old prototype collider. Let him move out,
      // but never let steering carry him deeper into it.
      if (
        intersection.startDistance < 1 &&
        intersection.endDistance >
          intersection.startDistance +
            0.01
      ) {
        continue;
      }

      if (
        intersection.closestDistance <
          1 &&
        intersection.amount <
          nearestAmount
      ) {
        nearest = obstacle;
        nearestAmount =
          intersection.amount;
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
        obstacleClearance(
          point,
          obstacle,
        ),
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

  function activePlayerGuidanceTarget() {
    const hole = state.hole;
    const key = activeKeyPoint();
    const sprinkler =
      activeSprinklerPoint();
    const choices = [];
    if (!hole.keyCollected) {
      choices.push({
        id: "shed-key",
        label: "SHED KEY ROUTE",
        shortLabel: "SHED KEY",
        color: "#e7bd58",
        target: key,
      });
    }
    if (!hole.sprinklerUsed) {
      choices.push({
        id: "sprinkler",
        label: "SPRINKLER ROUTE",
        shortLabel: "SPRINKLER",
        color: "#6fc4b5",
        target: sprinkler,
      });
    }
    if (
      hole.keyCollected &&
      (!hole.drainUnlocked ||
        worldDistance(
          state.player,
          SHED_EXIT,
        ) <=
          worldDistance(
            state.player,
            DRAIN_EXIT,
          ))
    ) {
      choices.push({
        id: "maintenance-shed",
        label: "SHED EXIT ROUTE",
        shortLabel: "SHED EXIT",
        color: "#d8b46b",
        target: SHED_EXIT,
      });
    }
    if (hole.drainUnlocked) {
      choices.push({
        id: "drain-exit",
        label: "DRAIN EXIT ROUTE",
        shortLabel: "DRAIN EXIT",
        color: "#73c9aa",
        target: DRAIN_EXIT,
      });
    }
    if (choices.length === 0) {
      return null;
    }
    choices.sort(
      (a, b) =>
        worldDistance(
          state.player,
          a.target,
        ) -
        worldDistance(
          state.player,
          b.target,
        ),
    );
    return choices[0];
  }

  function guidanceDirection(
    waypoint,
  ) {
    if (!waypoint) {
      return "STRAIGHT";
    }
    const deltaX =
      waypoint.x - state.player.x;
    const deltaY =
      waypoint.y - state.player.y;
    if (deltaY < -6) {
      return "TURN BACK";
    }
    if (deltaX < -7) {
      return "BEAR LEFT";
    }
    if (deltaX > 7) {
      return "BEAR RIGHT";
    }
    return "STRAIGHT AHEAD";
  }

  function effectiveGuidanceDirection() {
    if (
      state.hole.blockedTimer > 0 &&
      state.hole.blockedEscape
    ) {
      if (
        state.hole.blockedEscape.includes(
          "LEFT",
        )
      ) {
        return "BEAR LEFT";
      }
      if (
        state.hole.blockedEscape.includes(
          "RIGHT",
        )
      ) {
        return "BEAR RIGHT";
      }
      if (
        state.hole.blockedEscape.includes(
          "BACK",
        )
      ) {
        return "TURN BACK";
      }
      return "STRAIGHT AHEAD";
    }
    return (
      state.hole.navigationGuide
        .direction ||
      "STRAIGHT AHEAD"
    );
  }

  function updatePlayerNavigationGuide(
    dt,
  ) {
    const guide =
      state.hole.navigationGuide;
    const definition =
      activePlayerGuidanceTarget();
    if (!definition) {
      guide.targetId = null;
      guide.target = null;
      guide.path = [];
      return;
    }
    guide.refreshTimer = Math.max(
      0,
      guide.refreshTimer - dt,
    );
    const targetChanged =
      guide.targetId !== definition.id;
    const playerMoved =
      Math.hypot(
        state.player.x -
          guide.lastPlayerX,
        state.player.y -
          guide.lastPlayerY,
      ) > 5.5;
    if (
      targetChanged ||
      playerMoved ||
      guide.refreshTimer <= 0
    ) {
      const path = planJoeRoute(
        state.player,
        definition.target,
      );
      guide.targetId =
        definition.id;
      guide.targetLabel =
        definition.shortLabel;
      guide.targetColor =
        definition.color;
      guide.target = {
        x: definition.target.x,
        y: definition.target.y,
        radius:
          definition.target.radius,
      };
      guide.path =
        path.length > 0
          ? path
          : [
              {
                x: definition.target.x,
                y: definition.target.y,
              },
            ];
      guide.lastPlayerX =
        state.player.x;
      guide.lastPlayerY =
        state.player.y;
      guide.refreshTimer = 0.85;
    }
    while (
      guide.path.length > 1 &&
      worldDistance(
        state.player,
        guide.path[0],
      ) < 6
    ) {
      guide.path.shift();
    }
    guide.distance =
      worldDistance(
        state.player,
        definition.target,
      );
    guide.direction =
      guidanceDirection(
        guide.path[0] ||
          definition.target,
      );
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
        obstacleClearance(
          joe,
          obstacle,
        );
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
      const axes =
        obstacleFootprintAxes(
          tightestObstacle,
        );
      let metricX =
        (joe.x -
          tightestObstacle.x) *
        0.72 /
        (axes.x * axes.x);
      let metricY =
        (joe.y -
          tightestObstacle.y) /
        (axes.y * axes.y);
      if (
        Math.hypot(
          metricX,
          metricY,
        ) < 0.0001
      ) {
        metricX = 0;
        metricY = -1;
      }
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

  function drawWorldMarker(
    worldX,
    worldY,
    label,
    color,
    glyph,
    interactionRadius = null,
  ) {
    const point = worldToScreen(worldX, worldY);
    if (!point.visible || point.x < -180 || point.x > WIDTH + 180) {
      return;
    }
    const markerPadding =
      interactionRadius !== null
        ? 106
        : 82;
    const markerX = clamp(
      point.x,
      markerPadding,
      WIDTH - markerPadding,
    );
    const markerY =
      interactionRadius !== null &&
      point.x < 490 &&
      point.y < 370
        ? 414
        : interactionRadius !== null &&
            point.x > WIDTH - 304 &&
            point.y < 430
          ? 454
          : point.y;
    const edgeDirection =
      point.x < markerPadding
        ? "◀ "
        : point.x >
              WIDTH - markerPadding
          ? " ▶"
          : "";
    const distance = worldDistance(
      state.player,
      { x: worldX, y: worldY },
    );
    const inReach =
      interactionRadius !== null &&
      distance < interactionRadius;
    if (interactionRadius !== null) {
      drawInteractionGroundRing(
        {
          x: worldX,
          y: worldY,
          radius: interactionRadius,
        },
        color,
        inReach,
      );
    }
    const distanceLabel =
      interactionRadius !== null
        ? `  //  ${Math.ceil(
            distance,
          )}m`
        : "";
    const markerLabel =
      point.x < markerPadding
        ? `${edgeDirection}${label}${distanceLabel}`
        : `${label}${distanceLabel}${edgeDirection}`;
    const markerScale = clamp(point.scale, 0.58, 1.35);
    const joePoint =
      state.mode === "first_hole"
        ? worldToScreen(state.hole.joe.x, state.hole.joe.y)
        : null;
    const joeHeight =
      joePoint && joePoint.visible
        ? JOE_SOURCE.heightMeters * joePoint.pixelsPerMeter
        : 0;
    const markerTop = markerY - 70 * markerScale;
    const markerBottom = markerY - 12 * markerScale;
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
    const markerWidth =
      interactionRadius !== null
        ? 196
        : 148;
    const markerHeight =
      inReach ? 51 : 34;
    ctx.fillRect(
      markerX - markerWidth * 0.5,
      markerY - 50 * markerScale,
      markerWidth,
      markerHeight,
    );
    strokeRect(
      markerX - markerWidth * 0.5,
      markerY - 50 * markerScale,
      markerWidth,
      markerHeight,
      color,
      inReach ? 3 : 2,
    );
    drawText(glyph, markerX, markerY - 58 * markerScale, Math.round(24 * markerScale + 10), color, "center", true);
    drawText(markerLabel, markerX, markerY - 28 * markerScale, 12, "#f0ead1", "center", true);
    if (inReach) {
      drawText(
        inputCopy(
          `${keyboardBindingLabel(
            "interact",
          )} USE  //  IN REACH`,
          "A USE  //  IN REACH",
          "TAP USE  //  IN REACH",
        ),
        markerX,
        markerY -
          10 * markerScale,
        10,
        color,
        "center",
        true,
      );
    }
    ctx.restore();
  }

  function drawInteractionGroundRing(
    target,
    color,
    inReach,
  ) {
    const footprint =
      projectedGroundRadius(
        target,
        target.radius,
      );
    if (!footprint.point.visible) {
      return;
    }
    const pulse = state.reducedMotion
      ? 0
      : Math.sin(state.time * 5.2) *
        (inReach ? 0.08 : 0.035);
    ctx.save();
    ctx.globalAlpha =
      inReach ? 0.92 : 0.5;
    ctx.strokeStyle = color;
    ctx.lineWidth = inReach ? 3 : 1.5;
    if (!inReach) {
      ctx.setLineDash([6, 5]);
    }
    ctx.beginPath();
    ctx.ellipse(
      footprint.point.x,
      footprint.point.y,
      footprint.radiusX *
        (1 + pulse),
      footprint.radiusY *
        (1 + pulse),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = inReach
      ? "rgba(231,189,88,0.09)"
      : "rgba(4,12,7,0.08)";
    ctx.fill();
    ctx.restore();
  }

  function drawWorldInteractable(
    target,
    iconIndex,
    label,
    color,
  ) {
    const point = worldToScreen(
      target.x,
      target.y,
    );
    if (!point.visible) {
      return;
    }
    if (
      point.x < 76 ||
      point.x > WIDTH - 76 ||
      (point.x < 490 &&
        point.y < 370) ||
      (point.x > WIDTH - 304 &&
        point.y < 430)
    ) {
      drawWorldMarker(
        target.x,
        target.y,
        label,
        color,
        "!",
        target.radius,
      );
      return;
    }
    const distance =
      worldDistance(
        state.player,
        target,
      );
    const inReach =
      distance < target.radius;
    const propCell =
      INTERACTABLE_PROP_CELLS[
        iconIndex
      ];
    const drawHeight = clamp(
      (
        propCell
          ? propCell.heightMeters *
            point.pixelsPerMeter
          : 48 * point.scale
      ),
      34,
      112,
    );
    const drawWidth =
      propCell
        ? drawHeight *
          propCell.width /
          propCell.height
        : drawHeight;
    const bob = state.reducedMotion
      ? 0
      : Math.sin(
          state.time * 3.8 +
            target.x * 0.1,
        ) *
        Math.min(
          0.8,
          point.scale * 0.45,
        );
    const imageTop =
      point.y -
      drawHeight +
      bob;
    drawInteractionGroundRing(
      target,
      color,
      inReach,
    );
    ctx.save();
    ctx.fillStyle =
      "rgba(0,2,1,0.58)";
    ctx.beginPath();
    ctx.ellipse(
      point.x,
      point.y + 1,
      drawWidth * 0.42,
      Math.max(
        2,
        drawHeight * 0.07,
      ),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowColor = color;
    ctx.shadowBlur = inReach
      ? 19
      : 9;
    if (
      propCell &&
      interactablePropArt.complete &&
      interactablePropArt
        .naturalWidth > 0
    ) {
      ctx.drawImage(
        interactablePropArt,
        propCell.x,
        propCell.y,
        propCell.width,
        propCell.height,
        point.x -
          drawWidth * 0.5,
        imageTop,
        drawWidth,
        drawHeight,
      );
    } else {
      drawFieldIcon(
        iconIndex,
        point.x,
        point.y -
          drawHeight * 0.52,
        drawHeight,
      );
    }
    ctx.restore();

    const panelWidth = inReach
      ? 184
      : 146;
    const panelY =
      imageTop -
      11 -
      (inReach ? 28 : 0);
    ctx.fillStyle = inReach
      ? "rgba(18,31,16,0.94)"
      : "rgba(2,8,4,0.84)";
    ctx.fillRect(
      point.x - panelWidth * 0.5,
      panelY - 16,
      panelWidth,
      inReach ? 43 : 25,
    );
    strokeRect(
      point.x - panelWidth * 0.5,
      panelY - 16,
      panelWidth,
      inReach ? 43 : 25,
      color,
      inReach ? 3 : 1.5,
    );
    drawText(
      `${label}  //  ${Math.ceil(
        distance,
      )}m`,
      point.x,
      panelY,
      11,
      "#f1ead4",
      "center",
      true,
    );
    if (inReach) {
      drawText(
        inputCopy(
          `${keyboardBindingLabel(
            "interact",
          )} USE  //  IN REACH`,
          "A USE  //  IN REACH",
          "TAP USE  //  IN REACH",
        ),
        point.x,
        panelY + 18,
        10,
        color,
        "center",
        true,
      );
    }
  }

  function drawCourseCollisionFootprints() {
    for (
      let index = 0;
      index < COURSE_OBSTACLES.length;
      index += 1
    ) {
      const obstacle =
        COURSE_OBSTACLES[index];
      if (!obstacle.blocks) {
        continue;
      }
      const active =
        state.hole.blockedTimer > 0 &&
        state.hole.blockedObstacle ===
          obstacle.id;
      const clearance =
        obstacleClearance(
          state.player,
          obstacle,
          PLAYER_COLLISION_RADIUS,
        );
      const obstaclePoint =
        worldToScreen(
          obstacle.x,
          obstacle.y,
        );
      const approaching =
        obstaclePoint.forwardDistance >
          -5 &&
        clearance < 17;
      const nearby =
        state.hole.focus &&
        clearance < 30;
      if (
        !active &&
        !nearby &&
        !approaching
      ) {
        continue;
      }
      const footprint =
        projectedObstacleFootprint(
          obstacle,
          PLAYER_COLLISION_RADIUS,
        );
      if (
        !footprint.point.visible ||
        footprint.point.x < -180 ||
        footprint.point.x >
          WIDTH + 180
      ) {
        continue;
      }
      ctx.save();
      ctx.globalAlpha = active
        ? 0.95
        : nearby
          ? 0.36
          : clamp(
              (
                17 - clearance
              ) /
                17 *
                0.56,
              0.14,
              0.56,
            );
      ctx.strokeStyle = active
        ? "#ef7e45"
        : approaching
          ? "#d3c27b"
          : "#b8c58c";
      ctx.lineWidth = active
        ? 3
        : approaching
          ? 2
          : 1.5;
      if (!active) {
        ctx.setLineDash([5, 6]);
      }
      ctx.beginPath();
      ctx.ellipse(
        footprint.point.x,
        footprint.point.y,
        footprint.radiusX,
        footprint.radiusY,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = active
        ? "rgba(153,44,16,0.13)"
        : "rgba(79,100,51,0.06)";
      ctx.fill();
      ctx.restore();
    }
  }

  function drawNearbyBlockerCallouts() {
    const candidates = [];
    for (
      let index = 0;
      index < COURSE_OBSTACLES.length;
      index += 1
    ) {
      const obstacle =
        COURSE_OBSTACLES[index];
      if (!obstacle.blocks) {
        continue;
      }
      const point = worldToScreen(
        obstacle.x,
        obstacle.y,
      );
      const clearance =
        obstacleClearance(
          state.player,
          obstacle,
          PLAYER_COLLISION_RADIUS,
        );
      if (
        point.visible &&
        point.forwardDistance > -4 &&
        point.x > 110 &&
        point.x < WIDTH - 110 &&
        clearance >= 0 &&
        clearance < 10 &&
        !(
          state.hole.blockedTimer >
            0 &&
          state.hole
            .blockedObstacle ===
            obstacle.id
        )
      ) {
        candidates.push({
          obstacle,
          point,
          clearance,
        });
      }
    }
    candidates.sort(
      (a, b) =>
        a.clearance - b.clearance,
    );
    for (
      let index = 0;
      index <
        Math.min(
          2,
          candidates.length,
        );
      index += 1
    ) {
      const candidate =
        candidates[index];
      const footprint =
        projectedObstacleFootprint(
          candidate.obstacle,
          PLAYER_COLLISION_RADIUS,
        );
      const labelX = clamp(
        candidate.point.x,
        154,
        WIDTH - 154,
      );
      const labelY = clamp(
        candidate.point.y -
          footprint.radiusY -
          12,
        370,
        HEIGHT - 176,
      );
      ctx.save();
      ctx.globalAlpha = clamp(
        1 -
          candidate.clearance /
            14,
        0.4,
        0.9,
      );
      ctx.fillStyle =
        "rgba(5,10,5,0.82)";
      ctx.fillRect(
        labelX - 104,
        labelY - 14,
        208,
        27,
      );
      strokeRect(
        labelX - 104,
        labelY - 14,
        208,
        27,
        "#c8bb78",
        1.5,
      );
      drawText(
        `SOLID  //  ${(candidate.obstacle.landmark || "OBSTACLE").toUpperCase()}  ${Math.ceil(candidate.clearance)}m`,
        labelX,
        labelY + 4,
        10,
        "#e5d9ac",
        "center",
        true,
      );
      ctx.strokeStyle =
        "rgba(213,197,122,0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(
        labelX,
        labelY + 14,
      );
      ctx.lineTo(
        candidate.point.x,
        candidate.point.y - 4,
      );
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawCollisionContactOverlay() {
    if (state.hole.blockedTimer <= 0) {
      return;
    }
    const obstacle =
      COURSE_OBSTACLES.find(
        (candidate) =>
          candidate.id ===
          state.hole.blockedObstacle,
      ) || {
        id: state.hole.blockedObstacle,
        x: state.hole.blockedWorldX,
        y: state.hole.blockedWorldY,
        radius:
          state.hole.blockedRadius,
        radiusX:
          state.hole.blockedRadiusX,
        radiusY:
          state.hole.blockedRadiusY,
        landmark:
          state.hole.blockedLandmark,
      };
    const footprint =
      projectedObstacleFootprint(
        obstacle,
        PLAYER_COLLISION_RADIUS,
      );
    const alpha = clamp(
      state.hole.blockedTimer * 1.65,
      0,
      1,
    );
    const targetX = clamp(
      footprint.point.x,
      108,
      WIDTH - 108,
    );
    const targetY = clamp(
      footprint.point.y,
      COURSE_CAMERA.horizonY + 52,
      HEIGHT - 190,
    );
    const labelY = clamp(
      targetY - 76,
      COURSE_CAMERA.horizonY + 18,
      HEIGHT - 252,
    );
    const blockedName = (
      obstacle.landmark ||
      obstacle.id ||
      "boundary"
    ).toUpperCase();
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle =
      "rgba(105,28,10,0.12)";
    ctx.fillRect(
      0,
      HEIGHT * 0.48,
      WIDTH,
      HEIGHT * 0.52,
    );
    ctx.strokeStyle = "#ef7e45";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(
      targetX,
      targetY,
      Math.max(
        12,
        footprint.radiusX,
      ),
      Math.max(
        5,
        footprint.radiusY,
      ),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      targetX,
      labelY + 36,
    );
    ctx.lineTo(
      targetX,
      targetY - 8,
    );
    ctx.stroke();
    ctx.fillStyle =
      "rgba(15,6,3,0.94)";
    ctx.fillRect(
      targetX - 118,
      labelY - 18,
      236,
      54,
    );
    strokeRect(
      targetX - 118,
      labelY - 18,
      236,
      54,
      "#ef7e45",
      2,
    );
    drawText(
      `BLOCKED BY  //  ${blockedName}`,
      targetX,
      labelY,
      11,
      "#f4d1a7",
      "center",
      true,
    );
    drawText(
      state.hole.blockedEscape ||
        "MOVE AROUND",
      targetX,
      labelY + 20,
      12,
      "#ef8b54",
      "center",
      true,
    );
    ctx.restore();
  }

  function navigationRibbonSamples() {
    const guide =
      state.hole.navigationGuide;
    if (
      !guide ||
      guide.path.length === 0
    ) {
      return [];
    }
    const route = [
      {
        x: state.player.x,
        y: state.player.y,
      },
      ...guide.path,
    ];
    const samples = [];
    let distanceAlong = 9;
    let routeDistance = 0;
    for (
      let index = 0;
      index < route.length - 1;
      index += 1
    ) {
      const start = route[index];
      const end = route[index + 1];
      const segmentDistance =
        worldDistance(start, end);
      while (
        distanceAlong <=
          routeDistance +
            segmentDistance &&
        samples.length < 11
      ) {
        const amount = clamp(
          (
            distanceAlong -
            routeDistance
          ) /
            Math.max(
              0.001,
              segmentDistance,
            ),
          0,
          1,
        );
        samples.push({
          x: lerp(
            start.x,
            end.x,
            amount,
          ),
          y: lerp(
            start.y,
            end.y,
            amount,
          ),
        });
        distanceAlong += 9;
      }
      routeDistance +=
        segmentDistance;
      if (
        routeDistance > 99 ||
        samples.length >= 11
      ) {
        break;
      }
    }
    return samples;
  }

  function drawWorldNavigationRibbon() {
    const guide =
      state.hole.navigationGuide;
    const samples =
      navigationRibbonSamples();
    if (
      !guide ||
      !guide.target ||
      samples.length === 0
    ) {
      return;
    }
    const visible = samples
      .map((sample, index) => ({
        sample,
        index,
        point: worldToScreen(
          sample.x,
          sample.y,
        ),
      }))
      .filter(
        (entry) =>
          entry.point.visible &&
          entry.point.x > -90 &&
          entry.point.x <
            WIDTH + 90,
      );
    ctx.save();
    for (
      let index = visible.length - 1;
      index >= 0;
      index -= 1
    ) {
      const entry = visible[index];
      const point = entry.point;
      const nextSample =
        samples[
          entry.index + 1
        ] || guide.target;
      const nextPoint =
        worldToScreen(
          nextSample.x,
          nextSample.y,
        );
      const size = clamp(
        point.scale * 10,
        5,
        25,
      );
      const direction = Math.atan2(
        nextPoint.y - point.y,
        nextPoint.x - point.x,
      );
      const pulse = state.reducedMotion
        ? 1
        : 0.88 +
          Math.sin(
            state.time * 3.6 -
              entry.index * 0.7,
          ) *
            0.12;
      ctx.save();
      ctx.translate(
        point.x,
        point.y - 2,
      );
      ctx.rotate(direction);
      ctx.globalAlpha = clamp(
        (
          0.3 +
          point.scale * 0.34
        ) * pulse,
        0.26,
        0.82,
      );
      ctx.strokeStyle =
        guide.targetColor;
      ctx.lineWidth = clamp(
        point.scale * 1.4,
        1,
        3,
      );
      ctx.beginPath();
      ctx.moveTo(
        -size * 0.7,
        -size * 0.55,
      );
      ctx.lineTo(size * 0.35, 0);
      ctx.lineTo(
        -size * 0.7,
        size * 0.55,
      );
      ctx.stroke();
      ctx.fillStyle =
        "rgba(3,9,5,0.38)";
      ctx.beginPath();
      ctx.ellipse(
        -size * 0.25,
        size * 0.9,
        size * 0.75,
        Math.max(
          1,
          size * 0.13,
        ),
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }
    if (visible.length > 0) {
      const first =
        visible[0].point;
      drawText(
        `${guide.targetLabel}  //  FOLLOW LANTERNS`,
        first.x,
        first.y + 24,
        9,
        guide.targetColor,
        "center",
        true,
      );
    }
    ctx.restore();
  }

  function drawPathLantern(
    worldX,
    worldY,
    markerIndex,
    sideIndex,
  ) {
    const point =
      worldToScreen(
        worldX,
        worldY,
      );
    if (
      !point.visible ||
      point.x < -90 ||
      point.x > WIDTH + 90
    ) {
      return;
    }
    const type =
      Math.abs(
        markerIndex +
          (
            sideIndex < 0
              ? 1
              : 3
          ),
      ) %
      PATH_LANTERN_CELLS.length;
    const cell =
      PATH_LANTERN_CELLS[type];
    const drawHeight = clamp(
      cell.heightMeters *
        point.pixelsPerMeter,
      9,
      88,
    );
    const drawWidth =
      drawHeight *
      cell.width /
      cell.height;
    const zone =
      courseZoneAt(worldY);
    const networkPower =
      zone.id ===
      "water_hazard"
        ? floodlightPower()
        : 1;
    const damaged =
      markerIndex % 11 === 0;
    const pulse =
      state.reducedMotion
        ? 0.76
        : 0.7 +
          Math.sin(
            state.hole.elapsed *
              (
                damaged
                  ? 8.4
                  : 1.7
              ) +
              markerIndex * 0.83 +
              sideIndex,
          ) *
            (
              damaged
                ? 0.24
                : 0.08
            );
    const lightPower =
      clamp(
        networkPower *
          pulse *
          (
            damaged
              ? 0.48
              : 1
          ),
        0.08,
        1,
      );
    const lightY =
      point.y -
      drawHeight *
        cell.lightY;

    ctx.save();
    ctx.translate(
      point.x,
      point.y,
    );
    ctx.scale(1, 0.25);
    const groundGlow =
      ctx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        Math.max(
          12,
          drawWidth * 1.65,
        ),
      );
    groundGlow.addColorStop(
      0,
      `rgba(220,143,55,${
        0.2 * lightPower
      })`,
    );
    groundGlow.addColorStop(
      0.42,
      `rgba(116,91,41,${
        0.11 * lightPower
      })`,
    );
    groundGlow.addColorStop(
      1,
      "rgba(44,48,24,0)",
    );
    ctx.fillStyle =
      groundGlow;
    ctx.fillRect(
      -drawWidth * 1.7,
      -drawWidth * 1.7,
      drawWidth * 3.4,
      drawWidth * 3.4,
    );
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation =
      "screen";
    const lampGlow =
      ctx.createRadialGradient(
        point.x,
        lightY,
        0,
        point.x,
        lightY,
        Math.max(
          10,
          drawHeight * 0.76,
        ),
      );
    lampGlow.addColorStop(
      0,
      `rgba(255,214,132,${
        0.38 * lightPower
      })`,
    );
    lampGlow.addColorStop(
      0.28,
      `rgba(235,156,63,${
        0.18 * lightPower
      })`,
    );
    lampGlow.addColorStop(
      1,
      "rgba(214,127,43,0)",
    );
    ctx.fillStyle = lampGlow;
    ctx.fillRect(
      point.x -
        drawHeight,
      lightY -
        drawHeight,
      drawHeight * 2,
      drawHeight * 2,
    );
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = clamp(
      0.34 +
        point.scale * 0.5,
      0.38,
      0.96,
    );
    ctx.fillStyle =
      "rgba(1,3,2,0.48)";
    ctx.beginPath();
    ctx.ellipse(
      point.x,
      point.y + 1,
      drawWidth * 0.48,
      Math.max(
        1,
        drawHeight * 0.035,
      ),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    if (
      pathLanternArt.complete &&
      pathLanternArt.naturalWidth >
        0
    ) {
      ctx.drawImage(
        pathLanternArt,
        cell.x,
        cell.y,
        cell.width,
        cell.height,
        point.x -
          drawWidth * 0.5,
        point.y -
          drawHeight,
        drawWidth,
        drawHeight,
      );
    } else {
      ctx.fillStyle =
        "#aa8653";
      ctx.fillRect(
        point.x - 2,
        point.y -
          drawHeight,
        4,
        drawHeight,
      );
    }
    if (
      drawHeight > 18 &&
      lightPower > 0.22
    ) {
      ctx.globalCompositeOperation =
        "screen";
      const moteCount =
        state.reducedMotion
          ? 1
          : 3;
      for (
        let index = 0;
        index < moteCount;
        index += 1
      ) {
        const orbit =
          state.reducedMotion
            ? index * 2.1
            : state.hole.elapsed *
                (
                  0.8 +
                  index * 0.34
                ) +
              markerIndex * 0.7 +
              sideIndex;
        const moteX =
          point.x +
          Math.cos(orbit) *
            drawHeight *
            (
              0.22 +
              index * 0.08
            );
        const moteY =
          lightY +
          Math.sin(
            orbit * 1.43,
          ) *
            drawHeight *
            0.18;
        ctx.fillStyle =
          `rgba(255,218,140,${
            (
              0.38 +
              index * 0.1
            ) *
            lightPower
          })`;
        const moteSize =
          Math.max(
            1,
            Math.round(
              point.scale *
                (
                  index === 0
                    ? 1.5
                    : 1
                ),
            ),
          );
        ctx.fillRect(
          Math.round(moteX),
          Math.round(moteY),
          moteSize,
          moteSize,
        );
      }
    }
    ctx.restore();
  }

  function drawCourseWayfindingStakes() {
    const firstMarkerY =
      Math.floor(
        state.player.y / 18,
      ) *
        18 +
      18;
    ctx.save();
    for (
      let worldY = firstMarkerY;
      worldY <=
        state.player.y + 116;
      worldY += 18
    ) {
      const zone =
        courseZoneAt(worldY);
      const markerIndex =
        Math.round(worldY / 18);
      for (
        let sideIndex = -1;
        sideIndex <= 1;
        sideIndex += 2
      ) {
        const worldX =
          zone.fairwayHalfWidth *
          sideIndex;
        const point =
          worldToScreen(
            worldX,
            worldY,
          );
        if (
          !point.visible ||
          point.x < -30 ||
          point.x > WIDTH + 30
        ) {
          continue;
        }
        drawPathLantern(
          worldX,
          worldY,
          markerIndex,
          sideIndex,
        );
      }
    }
    for (
      let index = 1;
      index < COURSE_ZONES.length;
      index += 1
    ) {
      const zone =
        COURSE_ZONES[index];
      if (
        zone.start <=
          state.player.y + 8 ||
        zone.start >
          state.player.y + 120
      ) {
        continue;
      }
      const signX =
        index % 2 === 0
          ? 15
          : -15;
      const point =
        worldToScreen(
          signX,
          zone.start,
        );
      if (
        !point.visible ||
        point.x < 80 ||
        point.x > WIDTH - 80
      ) {
        continue;
      }
      const height = clamp(
        point.pixelsPerMeter * 1.15,
        12,
        58,
      );
      const width =
        height * 1.9;
      ctx.globalAlpha = clamp(
        0.3 +
          point.scale * 0.5,
        0.28,
        0.9,
      );
      if (
        signageAtlasArt.complete &&
        signageAtlasArt.naturalWidth >
          0
      ) {
        ctx.drawImage(
          signageAtlasArt,
          0,
          0,
          SIGNAGE_ATLAS_CELL,
          SIGNAGE_ATLAS_CELL,
          point.x -
            width * 0.56,
          point.y -
            height * 1.46,
          width * 1.12,
          height * 1.46,
        );
      } else {
        ctx.fillStyle =
          "#25331e";
        ctx.fillRect(
          point.x -
            width * 0.5,
          point.y - height,
          width,
          height * 0.48,
        );
        strokeRect(
          point.x -
            width * 0.5,
          point.y - height,
          width,
          height * 0.48,
          "#b79557",
          Math.max(
            1,
            point.scale,
          ),
        );
      }
      if (height > 24) {
        drawText(
          zone.name,
          point.x,
          point.y -
            height * 0.93,
          clamp(
            height * 0.14,
            8,
            11,
          ),
          "#e4d7ad",
          "center",
          true,
        );
      }
    }
    ctx.restore();
  }

  function visiblePathLanternCount() {
    const firstMarkerY =
      Math.floor(
        state.player.y / 18,
      ) *
        18 +
      18;
    let visible = 0;
    for (
      let worldY = firstMarkerY;
      worldY <=
        state.player.y + 116;
      worldY += 18
    ) {
      const zone =
        courseZoneAt(worldY);
      for (
        let sideIndex = -1;
        sideIndex <= 1;
        sideIndex += 2
      ) {
        const point =
          worldToScreen(
            zone.fairwayHalfWidth *
              sideIndex,
            worldY,
          );
        if (
          point.visible &&
          point.x > -90 &&
          point.x < WIDTH + 90
        ) {
          visible += 1;
        }
      }
    }
    return visible;
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

  function drawDeadGreenGround() {
    if (state.player.y < COURSE_ZONES[3].start - 44) {
      return;
    }
    const zoneStart = COURSE_ZONES[3].start + 2;
    ctx.save();
    for (let row = 0; row < 9; row += 1) {
      const worldY = zoneStart + row * 10;
      for (let column = -4; column <= 4; column += 1) {
        const seed = hash(row * 71.3 + column * 29.7);
        if (seed < 0.18) {
          continue;
        }
        const worldX =
          column * 25 +
          (hash(seed * 83) - 0.5) * 15;
        const point = worldToScreen(worldX, worldY);
        if (
          !point.visible ||
          point.x < -180 ||
          point.x > WIDTH + 180
        ) {
          continue;
        }
        const radiusX = clamp(
          (5 + hash(seed * 47) * 8) *
            COURSE_CAMERA.worldUnitMeters *
            point.pixelsPerMeter,
          3,
          135,
        );
        const radiusY = Math.max(1, radiusX * 0.12);
        const alpha = clamp(
          0.08 + point.scale * 0.12,
          0.07,
          0.26,
        );
        ctx.fillStyle =
          row % 2 === 0
            ? `rgba(75,35,17,${alpha})`
            : `rgba(126,77,35,${alpha * 0.74})`;
        ctx.beginPath();
        ctx.ellipse(
          point.x,
          point.y,
          radiusX,
          radiusY,
          (seed - 0.5) * 0.2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.strokeStyle =
          `rgba(211,145,69,${alpha * 0.58})`;
        ctx.lineWidth = Math.max(1, point.scale * 0.55);
        ctx.beginPath();
        ctx.moveTo(
          point.x - radiusX * 0.7,
          point.y - radiusY * 0.12,
        );
        ctx.lineTo(
          point.x + radiusX * 0.63,
          point.y + radiusY * 0.12,
        );
        ctx.stroke();
      }
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
      if (
        bunkerAtlasArt.complete &&
        bunkerAtlasArt.naturalWidth >
          0
      ) {
        const atlasIndex =
          Math.max(
            0,
            BUNKER_SAND_ZONES.findIndex(
              (candidate) =>
                candidate.id ===
                zone.id,
            ),
          );
        ctx.globalAlpha = clamp(
          alpha * 1.35,
          0.46,
          0.94,
        );
        ctx.drawImage(
          bunkerAtlasArt,
          atlasIndex *
            BUNKER_ATLAS_CELL,
          0,
          BUNKER_ATLAS_CELL,
          BUNKER_ATLAS_CELL,
          point.x -
            horizontalRadius *
              1.13,
          point.y -
            verticalRadius *
              3.5,
          horizontalRadius *
            2.26,
          verticalRadius *
            5.2,
        );
        ctx.globalAlpha = 1;
      } else {
        const sand =
          ctx.createRadialGradient(
            point.x -
              horizontalRadius *
                0.18,
            point.y -
              verticalRadius *
                0.16,
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
      }
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

  function drawCourseEchoTrail() {
    const echo = currentCourseEcho();
    if (!echo?.position) {
      return;
    }
    const masterProductOwner =
      masterProductOwnerUnlocked();
    const samples =
      echo.record.ghostPath;
    const trailStart =
      Math.max(0, state.hole.elapsed - 10);
    const visibleTrail = samples
      .filter(
        (sample) =>
          sample.t >= trailStart &&
          sample.t <= state.hole.elapsed,
      )
      .map((sample) => ({
        sample,
        point: worldToScreen(
          sample.x,
          sample.y,
        ),
      }))
      .filter(
        (entry) =>
          entry.point.visible &&
          entry.point.x > -100 &&
          entry.point.x < WIDTH + 100,
      );
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (
      let index = 0;
      index < visibleTrail.length;
      index += 1
    ) {
      const entry = visibleTrail[index];
      const next =
        visibleTrail[
          Math.min(
            visibleTrail.length - 1,
            index + 1,
          )
        ];
      const age =
        state.hole.elapsed -
        entry.sample.t;
      const life =
        clamp(1 - age / 10, 0, 1);
      const angle = Math.atan2(
        next.point.y - entry.point.y,
        next.point.x - entry.point.x,
      );
      const size = clamp(
        entry.point.scale * 5.5,
        1.8,
        8,
      );
      ctx.save();
      ctx.translate(
        entry.point.x,
        entry.point.y,
      );
      ctx.rotate(angle);
      ctx.globalAlpha =
        life *
        (state.hole.focus ? 0.9 : 0.58);
      ctx.fillStyle =
        masterProductOwner
          ? index % 2 === 0
            ? "#d8b654"
            : "#f1dc8e"
          : index % 2 === 0
            ? "#79d6bf"
            : "#b1ead7";
      ctx.fillRect(
        -size * 0.55,
        -size * 0.25,
        size,
        Math.max(1, size * 0.34),
      );
      ctx.fillRect(
        size * 0.12,
        size * 0.2,
        size * 0.72,
        Math.max(1, size * 0.28),
      );
      ctx.restore();
    }
    const point = worldToScreen(
      echo.position.x,
      echo.position.y,
    );
    if (
      point.visible &&
      point.x > -120 &&
      point.x < WIDTH + 120
    ) {
      const pulse =
        state.reducedMotion
          ? 0
          : Math.sin(state.time * 5.2) * 4;
      const radius = clamp(
        9 * point.scale + pulse,
        5,
        24,
      );
      ctx.globalAlpha =
        state.hole.focus ? 0.94 : 0.72;
      ctx.strokeStyle =
        echo.ahead
          ? "#8ce5cb"
          : "#e1b86c";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(
        point.x,
        point.y - radius * 0.25,
        radius,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha =
        state.hole.focus ? 0.3 : 0.18;
      ctx.fillStyle =
        echo.ahead
          ? "#77d7bd"
          : "#d4a65f";
      ctx.beginPath();
      ctx.arc(
        point.x,
        point.y - radius * 0.25,
        radius * 0.7,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.globalAlpha =
        state.hole.focus ? 0.96 : 0.8;
      polygon([
        [
          point.x,
          point.y - radius * 0.9,
        ],
        [
          point.x + radius * 0.42,
          point.y - radius * 0.25,
        ],
        [
          point.x,
          point.y + radius * 0.4,
        ],
        [
          point.x - radius * 0.42,
          point.y - radius * 0.25,
        ],
      ]);
      if (
        state.hole.focus ||
        worldDistance(
          state.player,
          echo.position,
        ) < 55
      ) {
        drawText(
          `${masterProductOwner ? "MASTER ECHO" : "COURSE ECHO"} // ${echo.record.route.toUpperCase()}`,
          point.x,
          point.y - radius - 10,
          10,
          echo.ahead
            ? "#a5ead7"
            : "#e2bd76",
          "center",
          true,
        );
      }
    }
    ctx.restore();
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
      const propCell =
        INTERACTABLE_PROP_CELLS[3];
      const propHeight = clamp(
        propCell.heightMeters *
          point.pixelsPerMeter,
        18,
        54,
      );
      const propWidth =
        propHeight *
        propCell.width /
        propCell.height;
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
      if (
        interactablePropArt.complete &&
        interactablePropArt
          .naturalWidth > 0
      ) {
        ctx.drawImage(
          interactablePropArt,
          propCell.x,
          propCell.y,
          propCell.width,
          propCell.height,
          point.x -
            propWidth * 0.5,
          point.y -
            propHeight,
          propWidth,
          propHeight,
        );
      } else {
        ctx.fillStyle =
          ball.wet
            ? "#d4f0e5"
            : "#f1ead1";
        ctx.beginPath();
        ctx.arc(
          point.x,
          point.y -
            ballRadius * 0.35,
          ballRadius,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.shadowBlur = 0;
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
                  `${keyboardBindingLabel("interact")} — RECLAIM`,
                  "A — RECLAIM",
                )
              : `LOST BALL ${Math.round(playerDistance)}m`;
        drawText(
          label,
          point.x,
          point.y -
            propHeight -
            8,
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
    const inReach =
      distance < request.radius;
    const scale = clamp(
      point.scale,
      0.48,
      1.65,
    );
    const propCell =
      INTERACTABLE_PROP_CELLS[1];
    const height = clamp(
      propCell.heightMeters *
        point.pixelsPerMeter,
      42,
      118,
    );
    const width =
      height *
      propCell.width /
      propCell.height;
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
    drawInteractionGroundRing(
      request,
      "#ef7136",
      inReach,
    );
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
      point.y,
    );
    ctx.rotate(flutter);
    ctx.shadowColor =
      "rgba(232,105,41,0.68)";
    ctx.shadowBlur =
      8 + pulse * 8;
    if (
      interactablePropArt.complete &&
      interactablePropArt
        .naturalWidth > 0
    ) {
      ctx.drawImage(
        interactablePropArt,
        propCell.x,
        propCell.y,
        propCell.width,
        propCell.height,
        -width * 0.5,
        -height,
        width,
        height,
      );
    } else {
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#a43f21";
      ctx.fillRect(
        -width * 0.5,
        -height,
        width,
        height,
      );
      ctx.fillStyle = "#e8dfbd";
      ctx.fillRect(
        -width * 0.34,
        -height * 0.82,
        width * 0.68,
        height * 0.62,
      );
    }
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
      if (inReach) {
        drawText(
          inputCopy(
            `${keyboardBindingLabel(
              "interact",
            )} USE  //  IN REACH`,
            "A USE  //  IN REACH",
            "TAP USE  //  IN REACH",
          ),
          point.x,
          point.y + 24,
          10,
          "#ef9a62",
          "center",
          true,
        );
      }
    }
  }

  function dedicatedObstacleImage(asset) {
    if (asset === "hedge-hide") {
      return hedgeHideArt;
    }
    if (asset === "stone-cover") {
      return stoneCoverArt;
    }
    if (asset === "service-cart") {
      return serviceCartArt;
    }
    return null;
  }

  function drawGroundSocket(
    obstacle,
    point,
    drawWidth,
    drawHeight,
  ) {
    const footprint = projectedGroundRadius(
      obstacle,
      1,
    );
    const obstacleFootprint =
      projectedObstacleFootprint(
        obstacle,
      );
    const radiusX = Math.max(
      5,
      obstacleFootprint.radiusX *
        0.98,
    );
    const radiusY = Math.max(
      3,
      obstacleFootprint.radiusY *
        0.94,
      footprint.radiusY * 0.7,
    );
    const distance = worldDistance(
      state.player,
      obstacle,
    );
    const inCover =
      obstacle.sight &&
      distance <
        (obstacle.coverRadius ||
          obstacle.radius);
    const closeToCover =
      obstacle.sight &&
      distance <
        (obstacle.coverRadius ||
          obstacle.radius) +
          11;
    const soil = ctx.createRadialGradient(
      point.x,
      point.y,
      1,
      point.x,
      point.y,
      radiusX,
    );
    soil.addColorStop(
      0,
      inCover
        ? "rgba(18,53,37,0.7)"
        : "rgba(3,7,3,0.62)",
    );
    soil.addColorStop(
      0.68,
      inCover
        ? "rgba(43,85,54,0.38)"
        : "rgba(34,43,22,0.3)",
    );
    soil.addColorStop(
      1,
      "rgba(2,5,2,0)",
    );
    ctx.fillStyle = soil;
    ctx.beginPath();
    ctx.ellipse(
      point.x,
      point.y,
      radiusX,
      radiusY,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = inCover
      ? "rgba(126,207,163,0.86)"
      : closeToCover
        ? "rgba(169,191,125,0.62)"
        : "rgba(80,101,54,0.3)";
    ctx.lineWidth = inCover
      ? 2.5
      : 1;
    ctx.beginPath();
    ctx.ellipse(
      point.x,
      point.y,
      radiusX * 0.94,
      radiusY * 0.9,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    const bladeCount = clamp(
      Math.round(radiusX / 24),
      4,
      13,
    );
    ctx.strokeStyle =
      "rgba(82,112,54,0.58)";
    ctx.lineWidth = 1.25;
    for (
      let index = 0;
      index < bladeCount;
      index += 1
    ) {
      const amount =
        (index + 0.5) /
        bladeCount;
      const bladeX =
        point.x -
        radiusX * 0.82 +
        amount *
          radiusX *
          1.64;
      const bladeHeight =
        4 +
        hash(
          obstacle.x * 19 +
            obstacle.y * 7 +
            index * 31,
        ) *
          Math.min(
            13,
            point.scale * 7,
          );
      ctx.beginPath();
      ctx.moveTo(
        bladeX,
        point.y + radiusY * 0.24,
      );
      ctx.lineTo(
        bladeX +
          (hash(index * 43) -
            0.5) *
            6,
        point.y -
          bladeHeight,
      );
      ctx.stroke();
    }
    if (closeToCover) {
      drawText(
        inCover
          ? "IN COVER"
          : "COVER",
        point.x,
        point.y +
          radiusY +
          15,
        9,
        inCover
          ? "#9be1bd"
          : "#c2ce9b",
        "center",
        true,
      );
    }
  }

  function drawCourseObstacle(obstacle) {
    if (obstacle.draw === false) {
      return;
    }
    const dedicatedArt =
      dedicatedObstacleImage(
        obstacle.asset,
      );
    const obstacleArt =
      dedicatedArt ||
      (obstacle.kit === "expanded"
        ? expandedCourseArt
        : courseObstacleArt);
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
    const cell = dedicatedArt
      ? obstacle.asset ===
          "service-cart"
        ? {
            x: 20,
            y: 100,
            width: 1490,
            height: 875,
            heightMeters: 3.25,
          }
        : obstacle.asset ===
            "stone-cover"
          ? {
              x: 36,
              y: 204,
              width: 1464,
              height: 672,
              heightMeters: 2.85,
            }
          : {
              x: 40,
              y: 144,
              width: 1456,
              height: 784,
              heightMeters: 3.6,
            }
      : obstacleCells[obstacle.type];
    if (!cell) {
      return;
    }
    let drawHeight =
      cell.heightMeters *
      obstacle.scale *
      point.pixelsPerMeter;
    let drawWidth =
      drawHeight *
      cell.width /
      cell.height;
    if (dedicatedArt) {
      const footprint =
        projectedObstacleFootprint(
          obstacle,
        );
      const footprintWidth =
        footprint.radiusX * 1.72;
      if (drawWidth < footprintWidth) {
        const ratio =
          footprintWidth /
          drawWidth;
        drawWidth *= ratio;
        drawHeight *= ratio;
      }
    }
    const sway = state.reducedMotion
      ? 0
      : Math.sin(state.time * 0.7 + obstacle.x * 0.11) * Math.min(2.5, point.scale * 2);

    ctx.save();
    ctx.globalAlpha = clamp(0.52 + point.scale * 0.48, 0.48, 1);
    drawGroundSocket(
      obstacle,
      point,
      drawWidth,
      drawHeight,
    );
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

  function drawMaintenanceShed() {
    if (
      !maintenanceShedArt.complete ||
      maintenanceShedArt.naturalWidth ===
        0
    ) {
      return;
    }
    const shed = {
      id: "maintenance-shed",
      x: SHED_EXIT.x,
      y: SHED_EXIT.y + 2,
      radius: 31,
      coverRadius: 35,
      sight: true,
    };
    const point = worldToScreen(
      shed.x,
      shed.y,
    );
    if (
      !point.visible ||
      point.x < -520 ||
      point.x > WIDTH + 520
    ) {
      return;
    }
    const footprint =
      projectedGroundRadius(
        shed,
        shed.radius,
      );
    let drawHeight =
      5.4 *
      point.pixelsPerMeter;
    let drawWidth =
      drawHeight *
      maintenanceShedArt
        .naturalWidth /
      maintenanceShedArt
        .naturalHeight;
    const targetWidth =
      footprint.radiusX * 1.72;
    if (drawWidth < targetWidth) {
      const ratio =
        targetWidth /
        drawWidth;
      drawWidth *= ratio;
      drawHeight *= ratio;
    }
    ctx.save();
    ctx.globalAlpha = clamp(
      0.58 +
        point.scale * 0.46,
      0.52,
      1,
    );
    drawGroundSocket(
      shed,
      point,
      drawWidth,
      drawHeight,
    );
    ctx.drawImage(
      maintenanceShedArt,
      point.x - drawWidth * 0.5,
      point.y - drawHeight,
      drawWidth,
      drawHeight,
    );
    ctx.restore();
  }

  function drawDeadGreenScenery(scenery) {
    if (
      !deadGreenSceneryArt.complete ||
      deadGreenSceneryArt.naturalWidth === 0
    ) {
      return;
    }
    const point = worldToScreen(scenery.x, scenery.y);
    if (!point.visible || point.x < -460 || point.x > WIDTH + 460) {
      return;
    }
    const cell = DEAD_GREEN_SCENERY_CELLS[scenery.type];
    if (!cell) {
      return;
    }
    const drawHeight =
      cell.heightMeters *
      scenery.scale *
      point.pixelsPerMeter;
    const drawWidth =
      drawHeight *
      cell.width /
      cell.height;
    const wind =
      state.reducedMotion
        ? 0
        : Math.sin(
            state.time * 0.82 +
            scenery.x * 0.08 +
            scenery.y * 0.03,
          ) *
          Math.min(
            scenery.type === 1 ? 3.8 : 1.8,
            point.scale * 2.4,
          );
    ctx.save();
    ctx.globalAlpha = clamp(
      0.58 + point.scale * 0.5,
      0.52,
      1,
    );
    ctx.fillStyle =
      `rgba(12,3,1,${clamp(point.scale * 0.3, 0.08, 0.34)})`;
    ctx.beginPath();
    ctx.ellipse(
      point.x,
      point.y - 1,
      drawWidth * 0.3,
      Math.max(2, drawHeight * 0.035),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.drawImage(
      deadGreenSceneryArt,
      cell.x,
      cell.y,
      cell.width,
      cell.height,
      point.x - drawWidth * 0.5 + wind,
      point.y - drawHeight,
      drawWidth,
      drawHeight,
    );
    if (scenery.type === 2) {
      const pulse =
        state.reducedMotion
          ? 0.46
          : 0.36 + Math.sin(state.time * 4.1) * 0.12;
      ctx.strokeStyle = `rgba(127,190,196,${pulse})`;
      ctx.lineWidth = Math.max(1, point.scale);
      ctx.beginPath();
      ctx.arc(
        point.x,
        point.y - drawHeight * 0.55,
        Math.max(4, drawWidth * 0.12),
        Math.PI * 1.08,
        Math.PI * 1.92,
      );
      ctx.stroke();
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

  function drawCourseClutter(
    clutter,
  ) {
    if (
      !courseClutterArt.complete ||
      courseClutterArt
        .naturalWidth === 0
    ) {
      return;
    }
    const point =
      worldToScreen(
        clutter.x,
        clutter.y,
      );
    if (
      !point.visible ||
      point.x < -220 ||
      point.x > WIDTH + 220
    ) {
      return;
    }
    const cell =
      COURSE_CLUTTER_CELLS[
        clutter.type
      ];
    if (!cell) {
      return;
    }
    const drawHeight = clamp(
      cell.heightMeters *
        clutter.scale *
        point.pixelsPerMeter,
      8,
      86,
    );
    const drawWidth =
      drawHeight *
      cell.width /
      cell.height;
    const dewPulse =
      state.reducedMotion
        ? 0.46
        : 0.4 +
          Math.sin(
            state.hole.elapsed *
              0.82 +
              clutter.x * 0.11,
          ) *
            0.08;
    ctx.save();
    ctx.globalAlpha = clamp(
      0.38 +
        point.scale * 0.52,
      0.42,
      0.96,
    );
    ctx.fillStyle =
      "rgba(1,4,2,0.5)";
    ctx.beginPath();
    ctx.ellipse(
      point.x,
      point.y + 1,
      drawWidth * 0.43,
      Math.max(
        1,
        drawHeight * 0.055,
      ),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.drawImage(
      courseClutterArt,
      cell.x,
      cell.y,
      cell.width,
      cell.height,
      point.x -
        drawWidth * 0.5,
      point.y -
        drawHeight,
      drawWidth,
      drawHeight,
    );
    if (
      (
        clutter.type === 0 ||
        clutter.type === 3
      ) &&
      drawHeight > 18
    ) {
      ctx.globalCompositeOperation =
        "screen";
      ctx.fillStyle =
        `rgba(177,220,211,${
          dewPulse * 0.34
        })`;
      ctx.fillRect(
        Math.round(
          point.x -
            drawWidth * 0.18,
        ),
        Math.round(
          point.y -
            drawHeight * 0.72,
        ),
        Math.max(
          1,
          Math.round(
            point.scale * 1.4,
          ),
        ),
        Math.max(
          1,
          Math.round(
            point.scale * 1.4,
          ),
        ),
      );
    }
    ctx.restore();
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
    for (
      let index = 0;
      index <
        COURSE_CLUTTER.length;
      index += 1
    ) {
      const clutter =
        COURSE_CLUTTER[index];
      const point =
        worldToScreen(
          clutter.x,
          clutter.y,
        );
      if (point.visible) {
        entities.push({
          y: point.y,
          draw: () =>
            drawCourseClutter(
              clutter,
            ),
        });
      }
    }
    for (let index = 0; index < DEAD_GREEN_SCENERY.length; index += 1) {
      const scenery = DEAD_GREEN_SCENERY[index];
      const point = worldToScreen(scenery.x, scenery.y);
      if (point.visible) {
        entities.push({
          y: point.y,
          draw: () => drawDeadGreenScenery(scenery),
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
    const shedPoint = worldToScreen(
      SHED_EXIT.x,
      SHED_EXIT.y + 2,
    );
    if (shedPoint.visible) {
      entities.push({
        y: shedPoint.y,
        draw: drawMaintenanceShed,
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

  function drawJoeFogWake(
    point,
    spriteHeight,
  ) {
    const joe =
      state.hole.joe;
    if (
      joe.effectSpeed < 0.4
    ) {
      return;
    }
    const threat =
      joe.mode === "chase"
        ? 1
        : joe.mode === "search"
          ? 0.64
          : joe.mode ===
              "investigate"
            ? 0.46
            : 0.3;
    const wakeCount =
      state.reducedMotion
        ? 2
        : 4;
    const headingSide =
      clamp(
        Math.cos(
          joe.effectHeading,
        ),
        -1,
        1,
      );
    ctx.save();
    ctx.globalCompositeOperation =
      "screen";
    for (
      let index = 0;
      index < wakeCount;
      index += 1
    ) {
      const phase =
        state.reducedMotion
          ? (index + 0.5) /
            wakeCount
          : (
              state.hole.elapsed *
                (
                  0.52 +
                  index * 0.07
                ) +
              index * 0.24
            ) %
            1;
      const spread =
        (
          16 +
          phase *
            (
              72 +
              threat * 46
            )
        ) *
        clamp(
          point.scale,
          0.55,
          1.7,
        );
      const wakeX =
        point.x -
        headingSide *
          spread *
          0.46 +
        (
          hash(
            index * 37 +
              4,
          ) -
          0.5
        ) *
          spread *
          0.42;
      const wakeY =
        point.y +
        2 +
        phase *
          Math.min(
            24,
            spriteHeight * 0.08,
          );
      const radiusX =
        spread *
        (
          0.42 +
          threat * 0.18
        );
      const radiusY =
        Math.max(
          3,
          radiusX *
            (
              0.1 +
              phase * 0.05
            ),
        );
      const wake =
        ctx.createRadialGradient(
          wakeX,
          wakeY,
          0,
          wakeX,
          wakeY,
          radiusX,
        );
      wake.addColorStop(
        0,
        `rgba(174,192,165,${
          (
            1 -
            smoothstep(phase)
          ) *
          (
            0.08 +
            threat * 0.09
          )
        })`,
      );
      wake.addColorStop(
        0.5,
        `rgba(99,125,101,${
          (
            1 -
            smoothstep(phase)
          ) *
          (
            0.035 +
            threat * 0.05
          )
        })`,
      );
      wake.addColorStop(
        1,
        "rgba(99,125,101,0)",
      );
      ctx.save();
      ctx.translate(
        wakeX,
        wakeY,
      );
      ctx.scale(
        1,
        radiusY /
          radiusX,
      );
      ctx.fillStyle = wake;
      ctx.beginPath();
      ctx.arc(
        0,
        0,
        radiusX,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawJoeLongShadow(
    point,
    spriteHeight,
  ) {
    const joe =
      state.hole.joe;
    const threat =
      joe.mode === "chase"
        ? 1
        : joe.mode === "search"
          ? 0.68
          : joe.mode ===
              "investigate"
            ? 0.48
            : 0.3;
    const shadowLength =
      clamp(
        spriteHeight *
          (
            0.34 +
            threat * 0.26
          ),
        16,
        150,
      );
    const shadowWidth =
      clamp(
        spriteHeight * 0.23,
        7,
        46,
      );
    const moonDirection =
      -0.72 +
      clamp(
        (
          state.player.x -
          joe.x
        ) /
          280,
        -0.12,
        0.12,
      );
    const alpha =
      clamp(
        0.15 +
          threat * 0.15 -
          (
            state.hole.environment
              ?.wet
              ? 0.03
              : 0
          ),
        0.12,
        0.32,
      );
    ctx.save();
    ctx.translate(
      point.x,
      point.y + 2,
    );
    ctx.rotate(
      moonDirection,
    );
    const shadow =
      ctx.createLinearGradient(
        0,
        0,
        shadowLength,
        0,
      );
    shadow.addColorStop(
      0,
      `rgba(0,3,1,${alpha})`,
    );
    shadow.addColorStop(
      0.58,
      `rgba(8,4,3,${
        alpha * 0.62
      })`,
    );
    shadow.addColorStop(
      1,
      "rgba(8,4,3,0)",
    );
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.moveTo(
      -shadowWidth,
      0,
    );
    ctx.quadraticCurveTo(
      shadowLength * 0.5,
      -shadowWidth * 0.46,
      shadowLength,
      0,
    );
    ctx.quadraticCurveTo(
      shadowLength * 0.5,
      shadowWidth * 0.46,
      -shadowWidth,
      0,
    );
    ctx.fill();
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

    drawJoeLongShadow(
      point,
      spriteHeight,
    );
    drawJoeFogWake(
      point,
      spriteHeight,
    );
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

  function playerFieldPositionLabel() {
    const zone = courseZoneAt(
      state.player.y,
    );
    if (
      state.player.x <
      -zone.fairwayHalfWidth
    ) {
      return "LEFT ROUGH";
    }
    if (
      state.player.x >
      zone.fairwayHalfWidth
    ) {
      return "RIGHT ROUGH";
    }
    if (state.player.x < -18) {
      return "LEFT FAIRWAY";
    }
    if (state.player.x > 18) {
      return "RIGHT FAIRWAY";
    }
    return "CENTER FAIRWAY";
  }

  function drawFieldBearingPanel() {
    const guide =
      state.hole.navigationGuide;
    if (
      !guide ||
      !guide.target
    ) {
      return;
    }
    const panel = {
      x: WIDTH - 274,
      y: 184,
      width: 234,
      height: 118,
    };
    ctx.fillStyle =
      "rgba(2,8,5,0.84)";
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
      "#596d4b",
      2,
    );
    drawText(
      "FIELD BEARING",
      panel.x + 14,
      panel.y + 23,
      12,
      "#dce4ce",
      "left",
      true,
    );
    drawText(
      `${guide.targetLabel}  ${Math.ceil(guide.distance)}m`,
      panel.x +
        panel.width -
        14,
      panel.y + 23,
      10,
      guide.targetColor,
      "right",
      true,
    );
    const effectiveDirection =
      effectiveGuidanceDirection();
    const directionLabels = [
      {
        label: "◀ LEFT",
        active:
          effectiveDirection ===
          "BEAR LEFT",
      },
      {
        label:
          effectiveDirection ===
          "TURN BACK"
            ? "▼ BACK"
            : "▲ AHEAD",
        active:
          effectiveDirection ===
            "STRAIGHT AHEAD" ||
          effectiveDirection ===
            "STRAIGHT" ||
          effectiveDirection ===
            "TURN BACK",
      },
      {
        label: "RIGHT ▶",
        active:
          effectiveDirection ===
          "BEAR RIGHT",
      },
    ];
    for (
      let index = 0;
      index <
        directionLabels.length;
      index += 1
    ) {
      const direction =
        directionLabels[index];
      const cellX =
        panel.x +
        13 +
        index * 70;
      ctx.fillStyle =
        direction.active
          ? "rgba(73,92,50,0.92)"
          : "rgba(10,20,12,0.72)";
      ctx.fillRect(
        cellX,
        panel.y + 36,
        66,
        28,
      );
      strokeRect(
        cellX,
        panel.y + 36,
        66,
        28,
        direction.active
          ? guide.targetColor
          : "#394836",
        direction.active
          ? 2
          : 1,
      );
      drawText(
        direction.label,
        cellX + 33,
        panel.y + 55,
        9,
        direction.active
          ? "#f0ead2"
          : "#657461",
        "center",
        direction.active,
      );
    }
    drawText(
      `${playerFieldPositionLabel()}  //  ${Math.round(state.player.y / COURSE_LENGTH * 100)}% COURSE`,
      panel.x + 14,
      panel.y + 83,
      10,
      "#b7c2a7",
      "left",
      true,
    );
    drawText(
      `FOLLOW ${guide.targetColor === "#6fc4b5" || guide.targetColor === "#73c9aa" ? "TEAL" : "GOLD"} GROUND REFLECTORS`,
      panel.x + 14,
      panel.y + 105,
      9,
      guide.targetColor,
      "left",
      true,
    );
  }

  function drawCourseMiniMap() {
    const panel = { x: WIDTH - 274, y: 210, width: 234, height: 260 };
    const courseEcho =
      currentCourseEcho();
    const guide =
      state.hole.navigationGuide;
    const mapTop = panel.y + 62;
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
    if (courseEcho) {
      drawText(
        courseEchoPaceLabel(courseEcho)
          .replace("ECHO  ", ""),
        panel.x + panel.width - 14,
        panel.y + 23,
        8,
        courseEcho.ahead
          ? "#91dfcc"
          : "#d8b875",
        "right",
        true,
      );
    }
    if (
      guide &&
      guide.target
    ) {
      drawText(
        effectiveGuidanceDirection(),
        panel.x + 14,
        panel.y + 43,
        9,
        guide.targetColor,
        "left",
        true,
      );
      drawText(
        `${guide.targetLabel} ${Math.ceil(guide.distance)}m`,
        panel.x +
          panel.width -
          14,
        panel.y + 43,
        9,
        "#e8eadc",
        "right",
        true,
      );
    }

    ctx.fillStyle = "#0a1b10";
    ctx.fillRect(panel.x + 13, panel.y + 54, panel.width - 26, panel.height - 68);
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
      [panel.x + panel.width * 0.69, mapTop],
      [panel.x + panel.width * 0.31, mapTop],
    ]);
    const mapScaleX =
      (panel.width - 28) / 224;
    const mapScaleY =
      (mapBottom - mapTop) /
      COURSE_LENGTH;
    const mapBoundsLeft =
      mapPoint(-COURSE_MAX_X, 0);
    const mapBoundsRight =
      mapPoint(
        COURSE_MAX_X,
        COURSE_LENGTH,
      );
    ctx.strokeStyle =
      "rgba(188,202,150,0.58)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(
      mapBoundsLeft.x,
      mapBoundsRight.y,
      mapBoundsRight.x -
        mapBoundsLeft.x,
      mapBoundsLeft.y -
        mapBoundsRight.y,
    );
    ctx.setLineDash([]);
    const drawMapInteractionRange = (
      target,
      color,
      available,
    ) => {
      if (!available) {
        return;
      }
      const point = mapPoint(
        target.x,
        target.y,
      );
      const inReach =
        worldDistance(
          state.player,
          target,
        ) < target.radius;
      ctx.strokeStyle = color;
      ctx.globalAlpha = inReach
        ? 0.95
        : 0.4;
      ctx.lineWidth = inReach
        ? 2
        : 1;
      ctx.setLineDash(
        inReach ? [] : [3, 3],
      );
      ctx.beginPath();
      ctx.ellipse(
        point.x,
        point.y,
        Math.max(
          3,
          target.radius *
            mapScaleX,
        ),
        Math.max(
          2,
          target.radius *
            mapScaleY,
        ),
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    };
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
        mapTop + 13,
        10,
        "#8fd4ca",
        "right",
        true,
      );
    }
    for (let index = 0; index < COURSE_OBSTACLES.length; index += 1) {
      const obstacle =
        COURSE_OBSTACLES[index];
      if (!obstacle.blocks) {
        continue;
      }
      const obstaclePoint = mapPoint(
        obstacle.x,
        obstacle.y,
      );
      const blocked =
        state.hole.blockedTimer > 0 &&
        state.hole.blockedObstacle ===
          obstacle.id;
      ctx.fillStyle = blocked
        ? "rgba(180,65,29,0.68)"
        : obstacle.draw === false
          ? "rgba(58,78,46,0.3)"
          : "rgba(11,21,13,0.48)";
      ctx.strokeStyle = blocked
        ? "#f28b53"
        : obstacle.draw === false
          ? "#89976c"
          : "#526346";
      ctx.lineWidth = blocked
        ? 2
        : 1;
      const footprint =
        obstacleFootprintAxes(
          obstacle,
          PLAYER_COLLISION_RADIUS,
        );
      ctx.beginPath();
      ctx.ellipse(
        obstaclePoint.x,
        obstaclePoint.y,
        Math.max(
          2.5,
          footprint.x /
            0.72 *
            mapScaleX,
        ),
        Math.max(
          1.8,
          footprint.y *
            mapScaleY,
        ),
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.stroke();
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
    if (courseEcho) {
      const echoSamples =
        courseEcho.record.ghostPath.filter(
          (sample) =>
            sample.t <=
            state.hole.elapsed,
        );
      if (echoSamples.length > 1) {
        ctx.strokeStyle =
          masterProductOwnerUnlocked()
            ? "rgba(225,190,91,0.82)"
          : courseEcho.ahead
            ? "rgba(121,214,191,0.72)"
            : "rgba(216,170,98,0.72)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (
          let index = 0;
          index < echoSamples.length;
          index += 1
        ) {
          const point = mapPoint(
            echoSamples[index].x,
            echoSamples[index].y,
          );
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
      const echoPoint = mapPoint(
        courseEcho.position.x,
        courseEcho.position.y,
      );
      ctx.fillStyle =
        masterProductOwnerUnlocked()
          ? "#e4c25f"
        : courseEcho.ahead
          ? "#85dec7"
          : "#dfb368";
      ctx.beginPath();
      ctx.arc(
        echoPoint.x,
        echoPoint.y,
        4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "#e8f1df";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    drawMapInteractionRange(
      SHED_EXIT,
      "#d0a95b",
      true,
    );
    drawMapInteractionRange(
      DRAIN_EXIT,
      "#74c9ac",
      true,
    );
    drawMapInteractionRange(
      key,
      "#f0bd4f",
      !state.hole.keyCollected,
    );
    drawMapInteractionRange(
      sprinkler,
      "#6fc0bb",
      !state.hole.sprinklerUsed,
    );
    drawMapInteractionRange(
      changeRequest,
      "#e37842",
      !state.hole.changeRequestCollected,
    );
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
    drawText(
      "SHAPE = SOLID BASE  •  GLOW = USE",
      panel.x + panel.width * 0.5,
      panel.y + panel.height - 4,
      8,
      "#9eaa88",
      "center",
      true,
    );
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

  function drawMowerWorldParticles(
    layer,
  ) {
    const particles =
      state.hole.worldParticles;
    for (
      let index = 0;
      index < particles.length;
      index += 1
    ) {
      const particle =
        particles[index];
      if (
        particle.layer !== layer
      ) {
        continue;
      }
      const point =
        worldToScreen(
          particle.x,
          particle.y,
        );
      if (
        !point.visible ||
        point.x < -180 ||
        point.x >
          WIDTH + 180
      ) {
        continue;
      }
      const progress = clamp(
        particle.age /
          particle.duration,
        0,
        1,
      );
      const fadeIn =
        smoothstep(
          clamp(
            particle.age /
              0.08,
            0,
            1,
          ),
        );
      const alpha =
        fadeIn *
        (
          1 -
          smoothstep(progress)
        );
      const screenX =
        point.x;
      const screenY =
        point.y -
        particle.z *
          point.pixelsPerMeter;
      const size = clamp(
        particle.sizeMeters *
          point.pixelsPerMeter,
        particle.kind ===
          "grass_dust"
          ? 3
          : 1,
        particle.kind ===
          "grass_dust"
          ? 34
          : 8,
      );
      ctx.save();
      ctx.translate(
        Math.round(screenX),
        Math.round(screenY),
      );
      if (
        particle.kind ===
        "grass_dust"
      ) {
        ctx.globalCompositeOperation =
          "screen";
        const puff =
          ctx.createRadialGradient(
            0,
            0,
            0,
            0,
            0,
            size,
          );
        puff.addColorStop(
          0,
          `rgba(169,176,111,${
            alpha * 0.18
          })`,
        );
        puff.addColorStop(
          0.48,
          `rgba(91,108,62,${
            alpha * 0.1
          })`,
        );
        puff.addColorStop(
          1,
          "rgba(55,75,43,0)",
        );
        ctx.scale(
          1.45,
          0.58,
        );
        ctx.fillStyle = puff;
        ctx.beginPath();
        ctx.arc(
          0,
          0,
          size,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      } else if (
        particle.kind ===
        "mower_spark"
      ) {
        ctx.rotate(
          particle.rotation,
        );
        ctx.globalCompositeOperation =
          "screen";
        ctx.strokeStyle =
          `rgba(255,117,38,${
            alpha * 0.36
          })`;
        ctx.lineWidth =
          Math.max(
            2,
            size * 2.2,
          );
        ctx.beginPath();
        ctx.moveTo(
          -size *
            particle.length *
            0.5,
          0,
        );
        ctx.lineTo(
          size *
            particle.length *
            0.5,
          0,
        );
        ctx.stroke();
        ctx.strokeStyle =
          `${particle.color}${Math.round(
            alpha * 255,
          )
            .toString(16)
            .padStart(2, "0")}`;
        ctx.lineWidth =
          Math.max(1, size);
        ctx.beginPath();
        ctx.moveTo(
          -size *
            particle.length *
            0.5,
          0,
        );
        ctx.lineTo(
          size *
            particle.length *
            0.5,
          0,
        );
        ctx.stroke();
      } else if (
        particle.kind ===
        "wet_clipping"
      ) {
        ctx.rotate(
          particle.rotation,
        );
        ctx.globalAlpha = alpha;
        ctx.fillStyle =
          particle.color;
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          Math.max(
            1,
            size * 0.72,
          ),
          Math.max(
            1,
            size * 1.55,
          ),
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.fillStyle =
          `rgba(226,244,220,${
            alpha * 0.72
          })`;
        ctx.fillRect(
          -1,
          -size * 0.75,
          1,
          Math.max(
            1,
            size * 0.6,
          ),
        );
      } else if (
        particle.kind ===
        "sand_shard"
      ) {
        ctx.rotate(
          particle.rotation,
        );
        ctx.globalAlpha = alpha;
        ctx.fillStyle =
          particle.color;
        ctx.fillRect(
          -size,
          -size * 0.45,
          size * 2,
          Math.max(
            1,
            size * 0.9,
          ),
        );
        ctx.fillStyle =
          `rgba(241,213,151,${
            alpha * 0.46
          })`;
        ctx.fillRect(
          -size * 0.45,
          -size * 0.45,
          size * 0.72,
          1,
        );
      } else {
        ctx.rotate(
          particle.landed
            ? particle.rotation *
              0.2
            : particle.rotation,
        );
        ctx.globalAlpha = alpha;
        ctx.strokeStyle =
          "rgba(24,38,15,0.72)";
        ctx.lineWidth =
          Math.max(
            2,
            size * 1.8,
          );
        ctx.beginPath();
        ctx.moveTo(
          -size *
            particle.length *
            0.5,
          0,
        );
        ctx.quadraticCurveTo(
          0,
          -size *
            (
              particle.landed
                ? 0.2
                : 0.75
            ),
          size *
            particle.length *
            0.5,
          0,
        );
        ctx.stroke();
        ctx.strokeStyle =
          particle.color;
        ctx.lineWidth =
          Math.max(1, size);
        ctx.beginPath();
        ctx.moveTo(
          -size *
            particle.length *
            0.5,
          0,
        );
        ctx.quadraticCurveTo(
          0,
          -size *
            (
              particle.landed
                ? 0.2
                : 0.75
            ),
          size *
            particle.length *
            0.5,
          0,
        );
        ctx.stroke();
        ctx.strokeStyle =
          `rgba(229,221,137,${
            alpha * 0.46
          })`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(
          -size *
            particle.length *
            0.18,
          -1,
        );
        ctx.lineTo(
          size *
            particle.length *
            0.28,
          -1,
        );
        ctx.stroke();
      }
      ctx.restore();
    }
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
      } else if (effect.kind === "filing_stamp") {
        const stampScale =
          scale *
          (0.8 + progress * 0.45);
        ctx.strokeStyle =
          `rgba(232,173,79,${0.86 * alpha})`;
        ctx.lineWidth = Math.max(
          1,
          3 * scale,
        );
        for (
          let stamp = 0;
          stamp < 3;
          stamp += 1
        ) {
          const inset =
            stamp * 7 * stampScale;
          ctx.strokeRect(
            point.x -
              30 * stampScale +
              inset,
            point.y -
              26 * stampScale +
              inset * 0.28,
            60 * stampScale -
              inset * 2,
            28 * stampScale -
              inset * 0.55,
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
        `${keyboardBindingLabel("move_left")} / ${keyboardBindingLabel("move_right")} AIM  •  RELEASE ${keyboardBindingLabel("chip")} TO CHIP  •  ESC CANCEL`,
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
    const reactiveScore =
      reactiveScoreState();
    if (
      reactiveScore.active &&
      reactiveScore.intensity > 0.22 &&
      reactiveScore.beatPulse > 0.02
    ) {
      const pulseAlpha =
        reactiveScore.beatPulse *
        reactiveScore.intensity *
        (
          state.reducedMotion
            ? 0.022
            : 0.052
        );
      const pulseGlow =
        ctx.createLinearGradient(
          0,
          HEIGHT * 0.46,
          0,
          HEIGHT,
        );
      pulseGlow.addColorStop(
        0,
        `rgba(${reactiveScore.accent},0)`,
      );
      pulseGlow.addColorStop(
        1,
        `rgba(${reactiveScore.accent},${pulseAlpha})`,
      );
      ctx.fillStyle = pulseGlow;
      ctx.fillRect(
        0,
        HEIGHT * 0.46,
        WIDTH,
        HEIGHT * 0.54,
      );
      ctx.strokeStyle =
        `rgba(${reactiveScore.accent},${pulseAlpha * 2.2})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(
        WIDTH * 0.28,
        HEIGHT - 58,
      );
      ctx.lineTo(
        WIDTH * 0.72,
        HEIGHT - 58,
      );
      ctx.stroke();
    }
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

  function drawNearMowerDebris() {
    const hole = state.hole;
    const joeDistance =
      worldDistance(
        hole.joe,
        state.player,
      );
    const chase =
      hole.joe.mode === "chase";
    const intensity = clamp(
      (
        58 -
        joeDistance
      ) /
        42 +
        (
          chase
            ? 0.24
            : 0
        ),
      0,
      1,
    );
    if (intensity <= 0.04) {
      return;
    }
    const count =
      state.reducedMotion
        ? 4
        : Math.round(
            6 +
              intensity * 13,
          );
    const joeDirection =
      clamp(
        (
          hole.joe.x -
          state.player.x
        ) /
          58,
        -1,
        1,
      );
    ctx.save();
    for (
      let index = 0;
      index < count;
      index += 1
    ) {
      const seed =
        hash(index * 67 + 11);
      const phase =
        state.reducedMotion
          ? seed
          : (
              state.time *
                (
                  0.24 +
                  seed * 0.48
                ) +
              seed * 3.1
            ) %
            1;
      const edge =
        index % 3;
      const x =
        edge === 0
          ? 18 +
            seed *
              (
                154 +
                intensity * 42
              )
          : edge === 1
            ? WIDTH -
              18 -
              seed *
                (
                  154 +
                  intensity * 42
                )
            : WIDTH *
                (
                  0.18 +
                  seed * 0.64
                ) +
              joeDirection *
                intensity *
                54;
      const y =
        edge === 2
          ? HEIGHT -
            36 -
            phase * 176
          : HEIGHT *
            (
              0.34 +
              phase * 0.56
            );
      const size =
        2 +
        seed * 4 +
        intensity * 3;
      const alpha =
        (
          0.12 +
          intensity * 0.34
        ) *
        (
          1 -
          smoothstep(phase)
        );
      const rotation =
        seed *
          Math.PI *
          2 +
        (
          state.reducedMotion
            ? 0
            : state.time *
              (
                0.7 +
                seed * 2.4
              )
        );
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.strokeStyle =
        `rgba(8,18,7,${
          alpha * 0.78
        })`;
      ctx.lineWidth =
        Math.max(
          2,
          size * 1.8,
        );
      ctx.beginPath();
      ctx.moveTo(
        -size * 2.4,
        0,
      );
      ctx.quadraticCurveTo(
        0,
        -size * 0.8,
        size * 2.4,
        0,
      );
      ctx.stroke();
      ctx.strokeStyle =
        index % 4 === 0
          ? `rgba(206,190,93,${alpha})`
          : `rgba(101,126,57,${alpha})`;
      ctx.lineWidth =
        Math.max(1, size);
      ctx.beginPath();
      ctx.moveTo(
        -size * 2.4,
        0,
      );
      ctx.quadraticCurveTo(
        0,
        -size * 0.8,
        size * 2.4,
        0,
      );
      ctx.stroke();
      ctx.restore();
    }
    if (chase) {
      const haze =
        ctx.createLinearGradient(
          0,
          HEIGHT * 0.62,
          0,
          HEIGHT,
        );
      haze.addColorStop(
        0,
        "rgba(88,91,45,0)",
      );
      haze.addColorStop(
        1,
        `rgba(69,71,32,${
          intensity * 0.1
        })`,
      );
      ctx.fillStyle = haze;
      ctx.fillRect(
        0,
        HEIGHT * 0.62,
        WIDTH,
        HEIGHT * 0.38,
      );
    }
    ctx.restore();
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
    const stampCount =
      performanceStampsFor(
        variant.id,
      ).length;
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
        ? `AFTER-HOURS TERMS ARE VOLUNTARY. JOE'S ESCALATION IS NOT.  //  DOSSIER ${stampCount}/${PERFORMANCE_STAMPS.length}`
        : masterProductOwnerUnlocked()
          ? "MASTER PRODUCT OWNER SEAL ACTIVE — ALL ORDERS PERFECTED."
        : portfolioUnlocked()
          ? `PORTFOLIO OVERRIDE  //  DOSSIER STAMPS ${stampCount}/${PERFORMANCE_STAMPS.length}  //  C CLEAN • R RECLAIM • B BAIT • E ECHO`
          : stampCount > 0
            ? `DOSSIER STAMPS ${stampCount}/${PERFORMANCE_STAMPS.length}  //  C CLEAN • R RECLAIM • B BAIT • E ECHO`
        : "LINK RECOVERIES, BAITS, COURSE PROGRESS, AND CONTACT BREAKS INTO A DELIVERY CHAIN.",
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
        title: "CHOOSE + FILE EXIT",
        detail: "KEY → SHED  •  VALVE → DRAIN",
        subdetail: `STAY STILL TO FILE  •  ◇ ${activeChangeRequest().code} +${CHANGE_REQUEST_BONUS}`,
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
            : `HOLD ${keyboardBindingLabel("chip")}  •  ${keyboardBindingLabel("move_left")}/${keyboardBindingLabel("move_right")}  •  RELEASE`,
        subdetail: touchActive
          ? "TAP USE TO RECLAIM — IF JOE ALLOWS"
          : controllerActive
            ? "A RECLAIMS IT — IF JOE ALLOWS"
            : `${keyboardBindingLabel("interact")} RECLAIMS IT — IF JOE ALLOWS`,
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
            : `${keyboardBindingLabel("crouch")} CROUCH  •  ${keyboardBindingLabel("focus")} LISTEN`,
        subdetail:
          "SMART PLAYS LINK FOR 14s // CLOSER BREAKS PAY MORE",
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
      const movementLabels = [
        keyboardBindingLabel("move_up"),
        keyboardBindingLabel("move_left"),
        keyboardBindingLabel("move_down"),
        keyboardBindingLabel("move_right"),
      ];
      if (
        movementLabels.join("") ===
        "WASD"
      ) {
        drawKeyCap("W", 278, 504, 42);
        drawKeyCap("A", 231, 551, 42);
        drawKeyCap("S", 278, 551, 42);
        drawKeyCap("D", 325, 551, 42);
      } else {
        drawKeyCap(
          movementLabels.join("/"),
          278,
          526,
          194,
        );
      }
      drawText(
        `${keyboardBindingLabel("sprint")} SPRINTS — LOUD`,
        278,
        579,
        11,
        "#df8c47",
        "center",
      );
    }

    drawText("CROUCH", 510, 478, 13, "#8f9f85", "center");
    drawKeyCap(
      touchActive
        ? "CROUCH"
        : controllerActive
          ? "LB"
          : keyboardBindingLabel(
              "crouch",
            ),
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
          : keyboardBindingLabel(
              "chip",
            ),
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
          : keyboardBindingLabel(
              "interact",
            ),
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
          : `PRESS ${keyboardBindingLabel("move_up")} OR ${keyboardBindingLabel("interact")} TO START`,
      WIDTH * 0.5,
      621,
      16,
      "#ffe2a0",
      "center",
      true,
    );
    ctx.globalAlpha = 1;
    if (state.hole.courseEchoRecord) {
      drawText(
        `COURSE ECHO READY  //  ${state.hole.courseEchoRecord.route.toUpperCase()} RECORD  //  CHASE THE SPECTRAL TRAIL`,
        WIDTH * 0.5,
        650,
        10,
        "#83d9c1",
        "center",
        true,
      );
    }
  }

  function drawKeyCap(label, x, y, width) {
    ctx.fillStyle = "#17271a";
    ctx.fillRect(x - width * 0.5, y - 28, width, 42);
    strokeRect(x - width * 0.5, y - 28, width, 42, "#788a65", 2);
    const fontSize = Math.max(
      9,
      Math.min(
        16,
        (width - 14) /
          Math.max(1, label.length * 0.62),
      ),
    );
    drawText(
      label,
      x,
      y,
      fontSize,
      "#f0edd7",
      "center",
      true,
    );
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
      `JOE ${direction}  •  ${Math.round(joeDistance)}m`,
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
    const riskPreview =
      hole.riskBreakBonuses.length < 3
        ? hole.currentRiskPremium
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
      ? `BREAKING CONTACT  ${Math.round(progress * 100)}%  //  RISK +${riskPreview}`
      : visualContact
        ? `VISUAL LOCK  //  RISK +${riskPreview}`
        : `SIGHT BROKEN — STILL AUDIBLE  //  RISK +${riskPreview}`;
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

  function drawRiskPremiumAward() {
    const award = state.hole.riskAward;
    if (!award) {
      return;
    }
    const remaining =
      award.duration - award.age;
    const alpha = clamp(
      Math.min(
        award.age / 0.16,
        remaining / 0.38,
      ),
      0,
      1,
    );
    const entrance =
      state.reducedMotion
        ? 0
        : (1 - smoothstep(award.age / 0.3)) *
          18;
    const color =
      award.tier === "razor"
        ? "#f4c85c"
        : award.tier === "close"
          ? "#e99852"
          : "#98c789";
    const tierLabel =
      award.tier === "razor"
        ? "RAZOR CUT"
        : award.tier === "close"
          ? "CLOSE CUT"
          : "CONTACT BROKEN";
    const centerX = WIDTH * 0.5;
    const centerY = 434 + entrance;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(3,12,6,0.92)";
    ctx.fillRect(
      centerX - 146,
      centerY - 50,
      292,
      82,
    );
    strokeRect(
      centerX - 146,
      centerY - 50,
      292,
      82,
      color,
      award.tier === "razor" ? 3 : 2,
    );
    drawText(
      `${tierLabel} // RISK PREMIUM`,
      centerX,
      centerY - 24,
      11,
      color,
      "center",
      true,
    );
    drawText(
      `+${award.amount}`,
      centerX,
      centerY + 10,
      30,
      "#f3edcf",
      "center",
      true,
    );
    for (
      let index = 0;
      index < 3;
      index += 1
    ) {
      const earned =
        index <
        state.hole.riskBreakBonuses.length;
      ctx.fillStyle =
        earned
          ? color
          : "#273426";
      ctx.fillRect(
        centerX - 27 + index * 24,
        centerY + 19,
        14,
        3,
      );
    }
    ctx.restore();
  }

  function drawDeliveryAward() {
    const award =
      state.hole.deliveryAward;
    if (!award) {
      return;
    }
    const remaining =
      award.duration -
      award.age;
    const alpha = clamp(
      Math.min(
        award.age / 0.14,
        remaining / 0.34,
      ),
      0,
      1,
    );
    const entrance =
      state.reducedMotion
        ? 0
        : (1 -
            smoothstep(
              award.age / 0.24,
            )) *
          14;
    const centerX =
      WIDTH * 0.5;
    const centerY =
      334 - entrance;
    const color =
      award.chain >=
      DELIVERY_CHAIN_MAX
        ? "#f1ca5f"
        : award.chain >= 3
          ? "#8fd3a5"
          : "#79b9a0";
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle =
      "rgba(2,12,8,0.9)";
    ctx.fillRect(
      centerX - 142,
      centerY - 34,
      284,
      58,
    );
    strokeRect(
      centerX - 142,
      centerY - 34,
      284,
      58,
      color,
      award.chain >= 4
        ? 2
        : 1,
    );
    drawText(
      `${award.label} // DELIVERY ×${award.multiplier.toFixed(1)}`,
      centerX,
      centerY - 12,
      10,
      color,
      "center",
      true,
    );
    drawText(
      `+${award.amount}`,
      centerX,
      centerY + 14,
      23,
      "#f0ead1",
      "center",
      true,
    );
    for (
      let index = 0;
      index <
      DELIVERY_CHAIN_MAX;
      index += 1
    ) {
      ctx.fillStyle =
        index < award.chain
          ? color
          : "#26372b";
      ctx.fillRect(
        centerX -
          42 +
          index * 21,
        centerY + 18,
        13,
        3,
      );
    }
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
      hole.escapeFiling.sealing
        ? "RELEASE AUTHORIZED"
        : hole.escapeFiling.active
        ? `FILE ${escapeRouteLabel(hole.escapeFiling.route)}`
        : hole.keyCollected && hole.drainUnlocked
          ? "CHOOSE SHED OR DRAIN EXIT"
          : hole.drainUnlocked
            ? "REACH DRAIN AND FILE RELEASE"
            : hole.keyCollected
              ? "RETURN TO SHED AND FILE RELEASE"
              : "FIND KEY OR RELEASE DRAIN";
    const expandedHud = hole.controlHintTimer > 0.01 || hole.focus;
    const activeStampCount =
      performanceStampsFor(
        variant.id,
      ).length;
    const changeRequestStatus =
      hole.changeRequestCollected
        ? "CR ✓ BANKED"
        : `CR ◇ +${CHANGE_REQUEST_BONUS}`;
    const masteryStatus =
      hole.overtime
        ? "OVERTIME"
        : masterProductOwnerUnlocked()
          ? "MASTER"
          : portfolioUnlocked()
            ? "OVERRIDE"
            : "";

    const waterStatus =
      hole.sprinklerSoakTimer > 0
        ? `  •  WATER ${Math.ceil(hole.sprinklerSoakTimer)}s`
        : "";
    const terrainStatus =
      expandedHud
        ? `${environment.zone.name}  •  ${environment.turfLabel}${waterStatus}  •  ORDER ${String(variant.number).padStart(2, "0")}${masteryStatus ? `  •  ${masteryStatus}` : ""}  •  STAMPS ${activeStampCount}/${PERFORMANCE_STAMPS.length}`
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
        `HOLE 1 — ${variant.shortName}`,
        62,
        76,
        29,
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
        `${inputCopy(`HOLD ${keyboardBindingLabel("chip")}`, "HOLD X", "HOLD CHIP")}  AIM / CHIP   ×${hole.golfBalls}${hole.recoverableBalls.length > 0 ? `  •  ${hole.recoverableBalls.length} ON COURSE` : ""}`,
        106,
        189,
        13,
        "#e5d9b8",
        "left",
      );
      drawFieldIcon(2, 79, 222, 38, hole.sprinklerUsed ? 0.48 : 1);
      drawText(
        hole.escapeFiling.sealing
          ? "✓  RELEASE AUTHORIZED"
          : hole.escapeFiling.active
          ? `▣  FINAL FILING ${Math.round(
              hole.escapeFiling.progress /
                hole.escapeFiling.duration *
                100,
            )}%`
          : hole.drainUnlocked
          ? `${inputCopy(keyboardBindingLabel("interact"), "A", "USE")}  DRAIN READY TO FILE`
          : `${inputCopy(keyboardBindingLabel("interact"), "A", "USE")}  INTERACT / UNLOCK`,
        106,
        227,
        13,
        hole.escapeFiling.sealing
          ? "#92d5ae"
          : hole.escapeFiling.active
          ? "#e2cf9c"
          : hole.drainUnlocked
            ? "#87cba9"
            : "#e5d9b8",
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
        `HOLE 1  //  ORDER ${String(variant.number).padStart(2, "0")}`,
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
        `${terrainStatus}${masteryStatus ? `  •  ${masteryStatus}` : ""}  •  ${hole.golfBalls} BALLS${hole.recoverableBalls.length > 0 ? ` + ${hole.recoverableBalls.length} LOST` : ""}  •  S ${activeStampCount}/${PERFORMANCE_STAMPS.length}`,
        56,
        120,
        11,
        terrainColor,
        "left",
      );
    }

    const meterX = WIDTH - 304;
    const liveProjection =
      hole.liveProjection ||
      calculateRunResult(
        hole.keyCollected
          ? "shed"
          : hole.drainUnlocked
            ? "drain"
            : "shed",
      );
    const projectionColor =
      gradeColor(
        liveProjection.grade,
      );
    const projectionChanging =
      liveProjection.changeTimer > 0 &&
      liveProjection.direction !==
        "steady";
    ctx.fillStyle = "rgba(2,8,5,0.82)";
    ctx.fillRect(meterX, 36, 264, 170);
    strokeRect(
      meterX,
      36,
      264,
      170,
      hole.joe.mode === "chase"
        ? "#c84627"
        : projectionChanging
          ? projectionColor
          : "#536642",
      2,
    );
    drawText("JOE ATTENTION", meterX + 18, 65, 13, "#d7deca", "left");
    const projectionPulse =
      state.reducedMotion ||
      !projectionChanging
        ? 1
        : 0.82 +
          (
            Math.sin(
              state.time * 13,
            ) +
            1
          ) *
            0.09;
    ctx.save();
    ctx.globalAlpha =
      projectionPulse;
    ctx.fillStyle =
      projectionChanging
        ? "rgba(34,48,23,0.96)"
        : "rgba(18,34,20,0.82)";
    ctx.fillRect(
      meterX + 151,
      48,
      95,
      23,
    );
    strokeRect(
      meterX + 151,
      48,
      95,
      23,
      projectionColor,
      projectionChanging
        ? 2
        : 1,
    );
    drawText(
      `FILE // ${liveProjection.grade}`,
      meterX + 198,
      64,
      10,
      projectionColor,
      "center",
      true,
    );
    ctx.restore();
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
      hole.joe.mode === "chase"
        ? `PREMIUM +${hole.riskPremiumBanked} // LIVE +${hole.riskBreakBonuses.length < 3 ? hole.currentRiskPremium : 0}`
        : `RISK PREMIUM +${hole.riskPremiumBanked}`,
      meterX + 18,
      145,
      9,
      hole.riskPremiumBanked > 0
        ? "#d9b369"
        : "#71816e",
      "left",
      hole.joe.mode === "chase",
    );
    drawText(
      `JOE ${Math.round(playerDistance)}m`,
      meterX + 246,
      145,
      11,
      playerDistance < 42 ? "#e8a55d" : "#899985",
      "right",
    );
    const deliveryActive =
      hole.deliveryTimer > 0 &&
      hole.deliveryChain > 0;
    const deliveryColor =
      hole.deliveryChain >=
      DELIVERY_CHAIN_MAX
        ? "#efc95e"
        : deliveryActive
          ? "#84c9a2"
          : "#586a59";
    drawText(
      deliveryActive
        ? `DELIVERY ×${deliveryMultiplier(hole.deliveryChain).toFixed(1)}`
        : "DELIVERY CHAIN",
      meterX + 18,
      170,
      9,
      deliveryColor,
      "left",
      deliveryActive,
    );
    drawText(
      deliveryActive
        ? `${Math.ceil(hole.deliveryTimer)}s  +${hole.deliveryBonus}`
        : "LINK SMART PLAYS",
      meterX + 246,
      170,
      9,
      deliveryColor,
      "right",
      deliveryActive,
    );
    ctx.fillStyle =
      "#17251b";
    ctx.fillRect(
      meterX + 18,
      178,
      228,
      5,
    );
    ctx.fillStyle =
      deliveryColor;
    ctx.fillRect(
      meterX + 18,
      178,
      228 *
        clamp(
          hole.deliveryTimer /
            DELIVERY_CHAIN_WINDOW,
          0,
          1,
        ),
      5,
    );
    drawText(
      projectionChanging
        ? `GRADE ${liveProjection.direction === "up" ? "UP" : "DOWN"} // ${liveProjection.reason}`
        : "PROJECTED IF FILED NOW",
      meterX + 132,
      199,
      9,
      projectionChanging
        ? projectionColor
        : "#647461",
      "center",
      projectionChanging,
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

    if (
      !hole.escapeFiling.active &&
      !hole.escapeFiling.sealing &&
      hole.messageTimer > 0
    ) {
      const alpha = clamp(hole.messageTimer, 0, 1);
      const messageWidth = 720;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(2,8,4,0.9)";
      ctx.fillRect(WIDTH * 0.5 - messageWidth * 0.5, HEIGHT - 112, messageWidth, 46);
      strokeRect(WIDTH * 0.5 - messageWidth * 0.5, HEIGHT - 112, messageWidth, 46, "#d87532", 2);
      drawText(hole.message, WIDTH * 0.5, HEIGHT - 82, 15, "#f1e7c9", "center", true);
      ctx.globalAlpha = 1;
    } else if (
      !hole.escapeFiling.active &&
      !hole.escapeFiling.sealing &&
      hole.prompt &&
      !hole.ballAim.active
    ) {
      drawText(hole.prompt, WIDTH * 0.5, HEIGHT - 82, 17, "#ffd184", "center", true);
    }

    if (state.inputMethod !== "touch") {
      drawText(
        expandedHud
          ? inputCopy(
              `MOVE ${keyboardMovementCopy()}  •  ${keyboardBindingLabel("sprint")} SPRINT  •  ${keyboardBindingLabel("crouch")} CROUCH  •  ${keyboardBindingLabel("focus")} LISTEN  •  ${keyboardBindingLabel("interact")} INTERACT  •  HOLD ${keyboardBindingLabel("chip")} AIM  •  ESC PAUSE`,
              "MOVE LEFT STICK/D-PAD  •  RT SPRINT  •  LB CROUCH  •  LT LISTEN  •  A INTERACT  •  HOLD X AIM  •  START PAUSE",
            )
          : inputCopy(
              `${keyboardBindingLabel("controls")} CONTROLS  •  ESC PAUSE`,
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

  function drawEscapeFiling() {
    const hole = state.hole;
    const filing = hole.escapeFiling;
    if (
      !filing.active &&
      !filing.sealing
    ) {
      return;
    }
    const progress =
      filing.sealing
        ? 1
        : clamp(
            filing.progress /
              filing.duration,
            0,
            1,
          );
    const joeDistance = worldDistance(
      hole.joe,
      state.player,
    );
    const danger =
      !filing.sealing &&
      (
        joeDistance < 22 ||
        hole.joe.mode === "chase"
      );
    const accent =
      filing.route === "drain"
        ? "#73c9aa"
        : "#d7b35d";
    const panel = {
      x: WIDTH * 0.5 - 300,
      y: HEIGHT - 150,
      width: 600,
      height: 82,
    };
    ctx.save();
    ctx.fillStyle =
      danger
        ? "rgba(20,4,2,0.94)"
        : "rgba(2,10,6,0.94)";
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
      danger
        ? "#dc6a38"
        : accent,
      2,
    );
    drawText(
      filing.sealing
        ? "FILE ACCEPTED // RELEASE AUTHORIZED"
        : `FINAL FILING // ${escapeRouteLabel(filing.route)}`,
      WIDTH * 0.5,
      panel.y + 24,
      14,
      "#f1e8ce",
      "center",
      true,
    );
    const bar = {
      x: panel.x + 34,
      y: panel.y + 34,
      width: panel.width - 68,
      height: 12,
    };
    ctx.fillStyle = "#121c13";
    ctx.fillRect(
      bar.x,
      bar.y,
      bar.width,
      bar.height,
    );
    ctx.fillStyle =
      danger
        ? "#dc6a38"
        : accent;
    ctx.fillRect(
      bar.x,
      bar.y,
      bar.width * progress,
      bar.height,
    );
    for (
      let division = 1;
      division < 3;
      division += 1
    ) {
      const divisionX =
        bar.x +
        bar.width *
          division /
          3;
      ctx.fillStyle =
        "rgba(2,7,4,0.88)";
      ctx.fillRect(
        divisionX - 1,
        bar.y,
        2,
        bar.height,
      );
    }
    drawText(
      filing.sealing
        ? `${escapeRouteLabel(filing.route)} SECURED  •  EXIT AUTHORIZED`
        : `STAY STILL  •  MOVE TO ABORT  •  JOE ${Math.round(joeDistance)}m`,
      WIDTH * 0.5,
      panel.y + 67,
      11,
      danger
        ? "#f2a06f"
        : "#b8c5af",
      "center",
      true,
    );
    if (filing.sealing) {
      const sealRatio = clamp(
        filing.sealProgress /
          Math.max(
            0.001,
            filing.sealDuration,
          ),
        0,
        1,
      );
      const sealArrival =
        state.reducedMotion
          ? 1
          : smoothstep(
              clamp(
                sealRatio / 0.32,
                0,
                1,
              ),
            );
      const stampScale =
        state.reducedMotion
          ? 1
          : lerp(
              1.18,
              1,
              sealArrival,
            );
      const stampY =
        HEIGHT * 0.49;
      ctx.save();
      ctx.translate(
        WIDTH * 0.5,
        stampY,
      );
      ctx.rotate(
        state.reducedMotion
          ? 0
          : -0.025,
      );
      ctx.scale(
        stampScale,
        stampScale,
      );
      ctx.globalAlpha =
        0.34 + sealArrival * 0.66;
      ctx.fillStyle =
        "rgba(1,10,6,0.84)";
      ctx.fillRect(
        -238,
        -58,
        476,
        116,
      );
      strokeRect(
        -238,
        -58,
        476,
        116,
        accent,
        4,
      );
      strokeRect(
        -228,
        -48,
        456,
        96,
        accent,
        1,
      );
      drawText(
        "FILE ACCEPTED",
        0,
        -17,
        17,
        "#e8dfc0",
        "center",
        true,
      );
      drawText(
        "RELEASE AUTHORIZED",
        0,
        20,
        29,
        accent,
        "center",
        true,
      );
      drawText(
        `RC-${filing.route === "drain" ? "DRN" : "SHD"}  //  FINAL`,
        0,
        43,
        10,
        "#aebba8",
        "center",
      );
      ctx.restore();
    }
    ctx.restore();
  }

  function drawGroundFog(
    progress,
    walkBob,
  ) {
    for (
      let layer = 0;
      layer < 5;
      layer += 1
    ) {
      const depth =
        layer / 4;
      const fogY =
        272 +
        layer * 84 +
        progress *
          (
            8 +
            depth * 24
          ) +
        walkBob *
          (
            0.05 +
            depth * 0.16
          );
      const fogX =
        state.reducedMotion
          ? -110
          : -130 +
            Math.sin(
              state.hole.elapsed *
                (
                  0.1 +
                  layer * 0.026
                ) +
                layer * 1.7,
            ) *
              (
                54 +
                layer * 18
              ) -
            state.player.x *
              (
                0.06 +
                depth * 0.13
              );
      const fog =
        ctx.createLinearGradient(
          0,
          fogY - 34,
          0,
          fogY + 78,
        );
      fog.addColorStop(
        0,
        "rgba(151,170,151,0)",
      );
      fog.addColorStop(
        0.45,
        `rgba(151,170,151,${0.042 + layer * 0.012})`,
      );
      fog.addColorStop(
        0.72,
        `rgba(102,130,115,${0.026 + layer * 0.008})`,
      );
      fog.addColorStop(
        1,
        "rgba(151,170,151,0)",
      );
      ctx.fillStyle = fog;
      ctx.fillRect(
        fogX,
        fogY - 34,
        WIDTH + 280,
        112,
      );
      for (
        let wisp = 0;
        wisp < 3;
        wisp += 1
      ) {
        const seed =
          layer * 43 +
          wisp * 71;
        const localX =
          (
            hash(seed) *
              (WIDTH + 360) +
            fogX *
              (
                0.22 +
                wisp * 0.09
              )
          ) %
            (WIDTH + 360) -
          180;
        const radiusX =
          100 +
          hash(seed + 9) *
            180;
        const radiusY =
          10 +
          depth * 15 +
          hash(seed + 17) *
            9;
        const mist =
          ctx.createRadialGradient(
            localX,
            fogY,
            0,
            localX,
            fogY,
            radiusX,
          );
        mist.addColorStop(
          0,
          `rgba(177,191,177,${0.024 + depth * 0.025})`,
        );
        mist.addColorStop(
          1,
          "rgba(177,191,177,0)",
        );
        ctx.save();
        ctx.translate(
          localX,
          fogY,
        );
        ctx.scale(
          1,
          radiusY /
            radiusX,
        );
        ctx.fillStyle = mist;
        ctx.fillRect(
          -radiusX,
          -radiusX,
          radiusX * 2,
          radiusX * 2,
        );
        ctx.restore();
      }
    }
  }

  function drawFloodlightMoths() {
    const floodlight =
      COURSE_OBSTACLES.find(
        (obstacle) =>
          obstacle.id ===
          "floodlight",
      );
    if (!floodlight) {
      return;
    }
    const point = worldToScreen(
      floodlight.x,
      floodlight.y,
    );
    if (
      !point.visible ||
      point.x < -160 ||
      point.x > WIDTH + 160
    ) {
      return;
    }
    const power =
      floodlightPower();
    const blackout =
      state.hole.blackoutTimer > 1.2;
    const insectCount =
      state.reducedMotion
        ? 7
        : 15;
    const lightY =
      point.y -
      clamp(
        5 *
          point.pixelsPerMeter,
        48,
        210,
      );
    ctx.save();
    ctx.globalCompositeOperation =
      "screen";
    for (
      let index = 0;
      index < insectCount;
      index += 1
    ) {
      const seed =
        hash(index * 47 + 8);
      const orbit =
        state.reducedMotion
          ? index *
            0.71
          : state.hole.elapsed *
              (
                1.4 +
                seed * 2.8
              ) *
              (
                index % 2 === 0
                  ? 1
                  : -1
              ) +
            index * 1.91;
      const scatter =
        blackout
          ? 1.6
          : 1;
      const radiusX =
        (
          12 +
          seed * 62
        ) *
        point.scale *
        scatter;
      const radiusY =
        (
          7 +
          hash(index * 31 + 5) *
            38
        ) *
        point.scale *
        scatter;
      const mothX =
        point.x +
        Math.cos(orbit) *
          radiusX;
      const mothY =
        lightY +
        Math.sin(
          orbit *
            (
              1.4 +
              seed * 0.7
            ),
        ) *
          radiusY;
      const wing =
        Math.max(
          1,
          Math.round(
            clamp(
              point.scale *
                (
                  1.1 +
                  seed * 1.7
                ),
              1,
              4,
            ),
          ),
        );
      const flicker =
        state.reducedMotion
          ? 0.62
          : 0.44 +
            Math.abs(
              Math.sin(
                state.hole.elapsed *
                  11 +
                  index * 2.7,
              ),
            ) *
              0.48;
      ctx.fillStyle =
        `rgba(255,208,116,${
          (
            0.18 +
            power * 0.58
          ) *
          flicker
        })`;
      ctx.fillRect(
        Math.round(
          mothX - wing * 1.5,
        ),
        Math.round(mothY),
        wing,
        Math.max(
          1,
          Math.round(wing * 0.65),
        ),
      );
      ctx.fillRect(
        Math.round(
          mothX + wing * 0.5,
        ),
        Math.round(mothY),
        wing,
        Math.max(
          1,
          Math.round(wing * 0.65),
        ),
      );
      ctx.fillStyle =
        `rgba(231,234,183,${
          (
            0.24 +
            power * 0.54
          ) *
          flicker
        })`;
      ctx.fillRect(
        Math.round(mothX),
        Math.round(
          mothY -
            wing * 0.5,
        ),
        1,
        Math.max(2, wing),
      );
    }
    ctx.restore();
  }

  function drawFirstHole() {
    const key = activeKeyPoint();
    const sprinkler = activeSprinklerPoint();
    const progress = clamp(state.player.y / COURSE_LENGTH, 0, 1);
    const zone = courseZoneAt(state.player.y);
    const walkBob = state.reducedMotion
      ? 0
      : Math.sin(state.time * 8.5) * (playerIsMoving() ? 3.4 : 0.7);

    ctx.fillStyle = "#07120c";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawCourseBackdrop(
      progress,
      walkBob,
    );

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
    drawDeadGreenGround();
    drawBunkerSand();
    drawWetTurf();
    drawTurfMarks();
    drawCourseEchoTrail();
    drawRecoverableGolfBalls();
    drawChangeRequest();

    drawGroundFog(
      progress,
      walkBob,
    );

    drawMotes(state.time, 28, "198,173,81", HEIGHT * 0.16);
    drawCourseWayfindingStakes();
    drawWorldNavigationRibbon();
    drawCourseCollisionFootprints();
    drawMowerWorldParticles(
      "behind",
    );
    drawLayeredCourseEntities();
    drawMowerWorldParticles(
      "front",
    );
    drawFloodlightMoths();
    drawWorldEffects();
    drawNearbyBlockerCallouts();

    if (!state.hole.keyCollected) {
      drawWorldInteractable(
        key,
        0,
        "SHED KEY",
        "#e7bd58",
      );
    }
    if (!state.hole.sprinklerUsed) {
      drawWorldInteractable(
        sprinkler,
        2,
        "SPRINKLER",
        "#6aa8a0",
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
      DRAIN_EXIT.radius,
    );
    if (!state.hole.drainUnlocked || state.hole.keyCollected) {
      drawWorldMarker(
        SHED_EXIT.x,
        SHED_EXIT.y,
        "MAINTENANCE SHED",
        "#d8b46b",
        "⌂",
        SHED_EXIT.radius,
      );
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

    drawCollisionContactOverlay();

    drawSuspenseEffects();
    drawPursuitEffects();
    drawNearMowerDebris();
    drawConcealmentEffects();
    drawListeningFocus();
    drawContactBreakFeedback();
    drawGolfBallTactics();
    drawFirstHoleOverlay();
    drawEscapeFiling();
    drawJoeStateBanner();
    drawDeliveryAward();
    drawRiskPremiumAward();
    drawThreatCaptions();
    drawJoeBark();
    if (!state.hole.ballAim.active) {
      drawText("+", WIDTH * 0.5, HEIGHT * 0.52 + walkBob, 24, "#e0e6d6", "center", true);
      if (
        !state.hole.escapeFiling.active &&
        !state.hole.escapeFiling.sealing
      ) {
        drawMovementFeedback(walkBob);
      }
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
    drawText("The release window reopens at dawn.", WIDTH * 0.5, HEIGHT * 0.54, 21, "#d57b39", "center");
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

  function nextNightOrderVariant() {
    return RUN_VARIANTS[
      (
        state.hole.variantIndex +
        1
      ) %
        RUN_VARIANTS.length
    ];
  }

  function nextPerformanceTarget() {
    const variant =
      activeRunVariant();
    const earned =
      performanceStampsFor(
        variant.id,
      );
    const target =
      PERFORMANCE_STAMPS.find(
        (stamp) =>
          !earned.includes(
            stamp.id,
          ),
      );
    if (target) {
      return {
        id: target.id,
        name: target.name,
        shortName:
          target.shortName,
        hint: target.hint,
        complete: false,
      };
    }
    return {
      id: "perfect_file",
      name: "PERFECT FILE",
      shortName: "PERFECT",
      hint:
        "Defend all four stamps and improve the record",
      complete: true,
    };
  }

  function resultActionPresentations(
    outcome,
  ) {
    const target =
      nextPerformanceTarget();
    const nextVariant =
      nextNightOrderVariant();
    return [
      {
        id: "rematch",
        label:
          outcome === "defeat"
            ? "RETRY FILE"
            : "REMATCH FILE",
        detail:
          `TARGET // ${target.shortName}`,
        description:
          `${target.name} — ${target.hint}.`,
      },
      {
        id: "next_order",
        label: "NEXT ORDER",
        detail:
          `ORDER ${String(nextVariant.number).padStart(2, "0")} // ${nextVariant.shortName}`,
        description:
          `Advance to Night Order ${String(nextVariant.number).padStart(2, "0")}: ${nextVariant.name}.`,
      },
      {
        id: "clubhouse",
        label: "CLUBHOUSE",
        detail:
          "RECORDS // SETTINGS",
        description:
          "Review records, contracts, accessibility, and audio.",
      },
    ];
  }

  function resultActionGeometry(
    index,
  ) {
    return {
      x: 260 + index * 260,
      y: 600,
      width: 240,
      height: 62,
    };
  }

  function resultActionIndexAt(
    point,
  ) {
    if (
      state.mode !== "victory" &&
      state.mode !== "defeat"
    ) {
      return -1;
    }
    for (
      let index = 0;
      index <
      RESULT_ACTION_IDS.length;
      index += 1
    ) {
      const geometry =
        resultActionGeometry(
          index,
        );
      if (
        point.x >=
          geometry.x - 8 &&
        point.x <=
          geometry.x +
            geometry.width +
            8 &&
        point.y >= 580 &&
        point.y <= 694
      ) {
        return index;
      }
    }
    return -1;
  }

  function drawResultActions(
    outcome,
    accent,
  ) {
    const actions =
      resultActionPresentations(
        outcome,
      );
    const selected =
      actions[state.resultIndex];
    const pulse =
      state.reducedMotion
        ? 1
        : 0.86 +
          Math.sin(state.time * 5.2) *
            0.14;
    drawText(
      `NEXT ACTION // ${selected.description}`,
      WIDTH * 0.5,
      588,
      11,
      "#c8d1bd",
      "center",
    );
    for (
      let index = 0;
      index < actions.length;
      index += 1
    ) {
      const action =
        actions[index];
      const geometry =
        resultActionGeometry(
          index,
        );
      const isSelected =
        index === state.resultIndex;
      ctx.fillStyle =
        isSelected
          ? outcome === "defeat"
            ? `rgba(100,20,8,${0.52 + pulse * 0.16})`
            : `rgba(46,73,39,${0.5 + pulse * 0.15})`
          : "rgba(7,18,10,0.82)";
      ctx.fillRect(
        geometry.x,
        geometry.y,
        geometry.width,
        geometry.height,
      );
      strokeRect(
        geometry.x,
        geometry.y,
        geometry.width,
        geometry.height,
        isSelected
          ? accent
          : "#3b4b38",
        isSelected ? 2 : 1,
      );
      if (isSelected) {
        ctx.fillStyle = accent;
        ctx.fillRect(
          geometry.x,
          geometry.y,
          geometry.width,
          3,
        );
        polygon([
          [
            geometry.x + 15,
            geometry.y + 23,
          ],
          [
            geometry.x + 24,
            geometry.y + 31,
          ],
          [
            geometry.x + 15,
            geometry.y + 39,
          ],
        ]);
      }
      drawText(
        action.label,
        geometry.x +
          geometry.width * 0.5,
        geometry.y + 27,
        15,
        isSelected
          ? "#f3ebcf"
          : "#aeb9a5",
        "center",
        isSelected,
      );
      drawText(
        action.detail,
        geometry.x +
          geometry.width * 0.5,
        geometry.y + 49,
        10,
        isSelected
          ? accent
          : "#758373",
        "center",
        isSelected,
      );
    }
    drawText(
      inputCopy(
        "← → SELECT  •  ENTER CONFIRM  •  ESC CLUBHOUSE",
        "D-PAD SELECT  •  A CONFIRM  •  B CLUBHOUSE",
        "TAP AN ACTION",
      ),
      WIDTH * 0.5,
      688,
      10,
      "#8e9b88",
      "center",
      true,
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

    const panel = { x: 220, y: 70, width: 840, height: 632 };
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
    if (
      result.breakdown.recovery > 0
    ) {
      scoreNotes.push({
        text: `+${result.breakdown.recovery.toLocaleString()} RISK PREMIUM BANKED`,
        color:
          result.razorCuts > 0
            ? "#f1c75d"
            : "#d99a5e",
      });
    }
    if (
      result.breakdown.delivery > 0
    ) {
      scoreNotes.push({
        text: `+${result.breakdown.delivery.toLocaleString()} DELIVERY CHAIN // PEAK ×${deliveryMultiplier(result.deliveryPeak).toFixed(1)}`,
        color:
          result.deliveryPeak >=
          DELIVERY_CHAIN_MAX
            ? "#f1ce69"
            : "#84c9a8",
      });
    }
    if (result.overtime) {
      scoreNotes.push({
        text: `+${result.breakdown.overtime.toLocaleString()} OVERTIME PREMIUM`,
        color: "#e69759",
      });
    }
    if (
      result.newPerformanceStamps.length >
      0
    ) {
      const stampNames =
        result.newPerformanceStamps.map(
          (id) =>
            PERFORMANCE_STAMPS.find(
              (stamp) =>
                stamp.id === id,
            )?.shortName || id,
        );
      scoreNotes.push({
        text: `STAMP${stampNames.length === 1 ? "" : "S"} FILED // ${stampNames.join(" • ")}`,
        color:
          result.dossierPerfected
            ? "#f1ce69"
            : "#84c9a8",
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
        result.echoTimeDelta !== null
          ? `${formatRunTime(result.timeSeconds)}  •  ${Math.abs(result.echoTimeDelta).toFixed(1)}s ${result.echoTimeDelta <= 0 ? "AHEAD" : "BEHIND"}`
          : formatRunTime(result.timeSeconds),
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
        "RISK / CLOSE CUTS",
        `+${result.riskPremiumBanked} / ${result.closeCalls}${result.razorCuts > 0 ? `  •  ${result.razorCuts} RAZOR` : ""}`,
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
          ? 348 +
            Math.max(
              0,
              scoreNotes.length - 3,
            ) *
              14
          : 324;
      const statSpacing =
        scoreNotes.length > 3
          ? 25
          : scoreNotes.length > 0
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
        index === 3 && result.riskPremiumBanked > 0
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
      result.masterProductOwnerUnlocked
        ? "MASTER PRODUCT OWNER AUTHORIZED — ALL TWELVE PERFORMANCE STAMPS FILED."
        : result.masteryUnlocked &&
      result.portfolioUnlocked
        ? "FULL MASTER FILE — OVERTIME AND PORTFOLIO OVERRIDE AUTHORIZED."
        : result.portfolioUnlocked
          ? "ALL CHANGES FILED — NIGHT ORDER PORTFOLIO OVERRIDE AUTHORIZED."
      : result.masteryUnlocked
        ? "ALL NIGHT ORDERS CLEARED — OVERTIME AUDIT AUTHORIZED."
        : result.dossierPerfected
          ? `ORDER ${String(result.variantNumber).padStart(2, "0")} DOSSIER PERFECTED — ALL FOUR PERFORMANCE STAMPS FILED.`
        : result.newPerformanceStamps.length >
            0
          ? `PERFORMANCE STAMP FILED — DOSSIER ${result.performanceStampProgress}/${PERFORMANCE_STAMPS.length}.`
        : result.newChangeRequestFiled
          ? `${activeChangeRequest().code} FILED. CHANGE REQUESTS ${state.career.filedChangeRequests.length}/${RUN_VARIANTS.length} SECURED.`
        : result.echoOvertaken
          ? `COURSE ECHO OVERTAKEN. ${result.route.toUpperCase()} PAPERWORK NOW HAUNTS THE NEXT ROUND.`
        : result.newBest
          ? result.overtime
            ? "OVERTIME RECORD FILED. JOE REQUESTED A RETROSPECTIVE."
            : `PERSONAL RECORD FILED. ${state.career.completedVariants.length}/${RUN_VARIANTS.length} NIGHT ORDERS CLEARED.`
          : "PAR IS NOT A SAFETY STANDARD. JOE DID NOT STOP.",
      WIDTH * 0.5,
      570,
      13,
      result.masteryUnlocked ||
        result.portfolioUnlocked ||
        result.masterProductOwnerUnlocked ||
        result.dossierPerfected ||
        result.newPerformanceStamps.length >
          0 ||
        result.newChangeRequestFiled ||
        result.echoOvertaken ||
        result.newBest
        ? "#f0c66b"
        : "#d69a5c",
      "center",
    );
    drawResultActions(
      "victory",
      routeAccent,
    );
    ctx.restore();

    const barHeight = Math.round((1 - reveal) * 92 + 18);
    ctx.fillStyle = "#010201";
    ctx.fillRect(0, 0, WIDTH, barHeight);
    ctx.fillRect(0, HEIGHT - barHeight, WIDTH, barHeight);
  }

  function drawJoeExpressionPortrait(
    expression,
    x,
    y,
    width,
    height,
  ) {
    if (
      !joeExpressionArt.complete ||
      joeExpressionArt
        .naturalWidth === 0
    ) {
      return false;
    }
    const column =
      expression % 3;
    const row =
      Math.floor(
        expression / 3,
      );
    const gutter = 5;
    ctx.drawImage(
      joeExpressionArt,
      column *
        JOE_EXPRESSION_CELL +
        gutter,
      row *
        JOE_EXPRESSION_CELL +
        gutter,
      JOE_EXPRESSION_CELL -
        gutter * 2,
      JOE_EXPRESSION_CELL -
        gutter * 2,
      x,
      y,
      width,
      height,
    );
    return true;
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
    const panelY = lerp(504, 418, textReveal);
    const captureDialogue =
      state.hole.captureDialogue ||
      JOE_CAPTURE_LINES[0];
    ctx.save();
    ctx.globalAlpha = textReveal;
    ctx.fillStyle = "rgba(10,2,1,0.9)";
    ctx.fillRect(0, panelY, WIDTH, HEIGHT - panelY);
    ctx.fillStyle = "#c64626";
    ctx.fillRect(0, panelY, WIDTH, 3);
    drawText(
      "SPRINT TERMINATED",
      WIDTH * 0.5,
      panelY + 44,
      42,
      "#f2ead3",
      "center",
      true,
    );
    drawText(
      "DELIVERY BLOCKED: FAILED JOE'S ACCEPTANCE REVIEW",
      WIDTH * 0.5,
      panelY + 68,
      12,
      "#e6ad84",
      "center",
    );
    const dialogueX = 232;
    const dialogueY =
      panelY + 76;
    const dialogueWidth = 816;
    const dialogueHeight = 88;
    ctx.fillStyle =
      "rgba(26,7,3,0.94)";
    ctx.fillRect(
      dialogueX,
      dialogueY,
      dialogueWidth,
      dialogueHeight,
    );
    strokeRect(
      dialogueX,
      dialogueY,
      dialogueWidth,
      dialogueHeight,
      "#8f432d",
      2,
    );
    ctx.fillStyle =
      "rgba(4,9,7,0.92)";
    ctx.fillRect(
      dialogueX + 8,
      dialogueY + 8,
      72,
      72,
    );
    strokeRect(
      dialogueX + 8,
      dialogueY + 8,
      72,
      72,
      "#c46a45",
      1,
    );
    drawJoeExpressionPortrait(
      captureDialogue
        .expression,
      dialogueX + 8,
      dialogueY + 8,
      72,
      72,
    );
    drawText(
      `JOE // ${captureDialogue.tone}`,
      dialogueX + 98,
      dialogueY + 23,
      11,
      "#dd8255",
      "left",
      true,
    );
    drawText(
      `"${captureDialogue.lines[0]}`,
      dialogueX + 98,
      dialogueY + 49,
      15,
      "#f3e8cd",
      "left",
      true,
    );
    drawText(
      `${captureDialogue.lines[1]}"`,
      dialogueX + 98,
      dialogueY + 70,
      15,
      "#f3e8cd",
      "left",
      true,
    );
    drawText(
      "PRODUCT OWNER: JOE  //  STATUS: BLOCKED",
      dialogueX +
        dialogueWidth -
        14,
      dialogueY + 23,
      10,
      "#a99688",
      "right",
    );
    drawResultActions(
      "defeat",
      "#c64626",
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
          `PRESS ${keyboardBindingLabel("move_up")} OR ${keyboardBindingLabel("interact")} TO START`,
          "MOVE LEFT STICK OR PRESS A TO START",
          "TOUCH LEFT PAD OR TAP USE TO START",
        );
        updateAudio();
        return;
      }
      if (!hole.escapeFiling.sealing) {
        hole.elapsed += dt;
      }
      hole.controlHintTimer = Math.max(
        0,
        hole.controlHintTimer - dt,
      );
      hole.messageTimer = Math.max(0, hole.messageTimer - dt);
      hole.joeBarkTimer = Math.max(
        0,
        hole.joeBarkTimer - dt,
      );
      updateThreatCaptions(dt);
      if (hole.riskAward) {
        hole.riskAward.age += dt;
        if (
          hole.riskAward.age >=
          hole.riskAward.duration
        ) {
          hole.riskAward = null;
        }
      }
      hole.deliveryTimer =
        Math.max(
          0,
          hole.deliveryTimer - dt,
        );
      if (
        hole.deliveryTimer <= 0
      ) {
        hole.deliveryChain = 0;
      }
      if (hole.deliveryAward) {
        hole.deliveryAward.age +=
          dt;
        if (
          hole.deliveryAward.age >=
          hole.deliveryAward.duration
        ) {
          hole.deliveryAward = null;
        }
      }
      hole.blockedTimer = Math.max(0, hole.blockedTimer - dt);
      hole.blockedCueCooldown = Math.max(
        0,
        hole.blockedCueCooldown - dt,
      );
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
      if (!hole.escapeFiling.sealing) {
        updateGolfBallTactics(
          dt,
          movement,
        );
      }
      const moving =
        !hole.escapeFiling.sealing &&
        playerIsMoving();
      if (
        hole.escapeFiling.active &&
        moving
      ) {
        cancelEscapeFiling(
          "MOVED",
        );
      }
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
      addCourseEchoSample();
      updatePlayerNavigationGuide(
        dt,
      );

      const zoneIndex = COURSE_ZONES.indexOf(courseZoneAt(state.player.y));
      if (zoneIndex !== hole.zoneIndex) {
        hole.zoneIndex = zoneIndex;
        hole.zoneVisits[zoneIndex] += 1;
        const firstVisit =
          hole.zoneVisits[zoneIndex] === 1;
        hole.zoneBannerTimer = firstVisit ? 3.4 : 1.45;
        if (firstVisit) {
          awardDeliveryBeat(
            `${COURSE_ZONES[zoneIndex].name} REACHED`,
            70,
          );
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
            pushThreatCaption(
              "FLOODLIGHT RELAY CLICKS OFF",
              { x: 18, y: 242 },
              "world",
              2.6,
              "power_sag",
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
      const movementNoise = moving
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
      const filingNoise =
        hole.escapeFiling.active
          ? hole.escapeFiling.route ===
            "drain"
            ? 0.52
            : 0.44
          : 0;
      const targetNoise = Math.max(
        movementNoise,
        filingNoise,
      );
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
          `RELEASE ${keyboardBindingLabel("chip")} TO CHIP`,
          "RELEASE X TO CHIP",
          "RELEASE CHIP TO SHOOT",
        );
      } else if (hole.ballFlight) {
        hole.prompt = "BALL IN FLIGHT";
      } else if (
        hole.escapeFiling.sealing
      ) {
        hole.prompt =
          "RELEASE AUTHORIZED";
      } else if (
        hole.escapeFiling.active
      ) {
        hole.prompt =
          `FINAL FILING ${Math.round(
            hole.escapeFiling.progress /
              hole.escapeFiling.duration *
              100,
          )}% // STAY STILL`;
      } else if (!hole.keyCollected && worldDistance(state.player, key) < key.radius) {
        hole.prompt = inputCopy(
          `${keyboardBindingLabel("interact")} — TAKE SHED KEY`,
          "A — TAKE SHED KEY",
          "TAP USE — TAKE SHED KEY",
        );
      } else if (!hole.sprinklerUsed && worldDistance(state.player, sprinkler) < sprinkler.radius) {
        hole.prompt = inputCopy(
          `${keyboardBindingLabel("interact")} — ACTIVATE SPRINKLERS`,
          "A — ACTIVATE SPRINKLERS",
          "TAP USE — ACTIVATE SPRINKLERS",
        );
      } else if (
        hole.keyCollected &&
        worldDistance(state.player, shed) <
          shed.radius
      ) {
        hole.prompt = inputCopy(
          `${keyboardBindingLabel("interact")} — FILE SHED RELEASE`,
          "A — FILE SHED RELEASE",
          "TAP USE — FILE SHED RELEASE",
        );
      } else if (
        hole.drainUnlocked &&
        worldDistance(state.player, drain) <
          drain.radius
      ) {
        hole.prompt = inputCopy(
          `${keyboardBindingLabel("interact")} — FILE DRAIN RELEASE`,
          "A — FILE DRAIN RELEASE",
          "TAP USE — FILE DRAIN RELEASE",
        );
      } else if (
        !hole.changeRequestCollected &&
        worldDistance(
          state.player,
          changeRequest,
        ) < changeRequest.radius
      ) {
        hole.prompt = inputCopy(
          `${keyboardBindingLabel("interact")} — SECURE ${changeRequest.code} (+${CHANGE_REQUEST_BONUS})`,
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
            ? `${keyboardBindingLabel("interact")} — RECLAIM BALL // JOE ${Math.round(recoveryDanger.joeDistance)}m`
            : `${keyboardBindingLabel("interact")} — RECLAIM GOLF BALL`,
          recoveryDanger.dangerous
            ? `A — RECLAIM BALL // JOE ${Math.round(recoveryDanger.joeDistance)}m`
            : "A — RECLAIM GOLF BALL",
          recoveryDanger.dangerous
            ? `TAP USE — RECLAIM BALL // JOE ${Math.round(recoveryDanger.joeDistance)}m`
            : "TAP USE — RECLAIM GOLF BALL",
        );
      } else if (worldDistance(state.player, shed) < shed.radius) {
        hole.prompt = inputCopy(
          `${keyboardBindingLabel("interact")} — TRY SHED DOOR`,
          "A — TRY SHED DOOR",
          "TAP USE — TRY SHED DOOR",
        );
      } else if (worldDistance(state.player, drain) < drain.radius) {
        hole.prompt = inputCopy(
          `${keyboardBindingLabel("interact")} — INSPECT SEALED DRAIN`,
          "A — INSPECT SEALED DRAIN",
          "TAP USE — INSPECT SEALED DRAIN",
        );
      } else {
        hole.prompt = "";
      }

      if (
        hole.escapeFiling.sealing
      ) {
        updateEscapeFiling(dt);
      } else {
        updateJoe(dt);
        if (state.mode === "first_hole") {
          updateEscapeFiling(dt);
        }
      }
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
        updateReactiveScore(dt);
        updateLiveProjection(dt);
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
      state.settingsPage = "mix";
      state.bindingCaptureId = null;
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
        state.settingsPage = "mix";
        state.bindingCaptureId = null;
        state.mode = "settings";
        state.transitionAlpha = 0.35;
        break;
      case 2:
        state.mode = "claim";
        state.status = "CHANGE REJECTED: unauthorized scope in the rough.";
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

  function reactiveScoreState() {
    const hole = state.hole;
    const zoneIndex = clamp(
      hole.zoneIndex || 0,
      0,
      REACTIVE_SCORE_ZONES.length - 1,
    );
    const zone =
      REACTIVE_SCORE_ZONES[zoneIndex];
    const courseActive =
      state.mode === "first_hole" &&
      !hole.tutorialVisible;
    const modeWeight =
      hole.joe.mode === "chase"
        ? 0.5
        : hole.joe.mode === "search"
          ? 0.25
          : hole.joe.mode === "investigate"
            ? 0.14
            : 0;
    const intensity = clamp(
      0.08 +
        zoneIndex * 0.11 +
        hole.detection * 0.32 +
        modeWeight +
        (hole.dreadTimer > 0 ? 0.1 : 0) +
        (hole.overtime ? 0.06 : 0),
      0,
      1,
    );
    const blackoutHush =
      hole.blackoutTimer > 0
        ? clamp(
            0.3 +
              floodlightPower() * 0.35,
            0.3,
            0.65,
          )
        : 1;
    const focusDuck =
      hole.focus
        ? 0.38
        : 1;
    const gain =
      courseActive
        ? (
            0.0025 +
            intensity * 0.0105
          ) *
          blackoutHush *
          focusDuck
        : 0;
    const tempoBpm = Math.round(
      42 +
        zoneIndex * 5 +
        intensity * 42 +
        (hole.joe.mode === "chase"
          ? 10
          : 0),
    );
    const layers = [];
    if (courseActive) {
      layers.push("sub_dread");
      if (intensity > 0.22) {
        layers.push("uneasy_fifth");
      }
      if (intensity > 0.4) {
        layers.push("blade_pulse");
      }
      if (hole.joe.mode === "chase") {
        layers.push("pursuit_ostinato");
      }
      if (hole.blackoutTimer > 0) {
        layers.push("power_hush");
      }
      if (hole.focus) {
        layers.push("listening_duck");
      }
    }
    return {
      active: courseActive,
      zoneIndex,
      key: zone.key,
      rootHz: zone.rootHz,
      accent: zone.accent,
      intensity,
      tempoBpm,
      gain,
      blackoutHush,
      focusDuck,
      beatPulse:
        hole.scoreBeatPulse || 0,
      stepIndex:
        hole.scoreStepIndex || 0,
      layers,
    };
  }

  function updateReactiveScore(dt) {
    const hole = state.hole;
    const score = reactiveScoreState();
    hole.scoreBeatPulse = Math.max(
      0,
      hole.scoreBeatPulse -
        dt *
          (
            hole.joe.mode === "chase"
              ? 3.8
              : 2.3
          ),
    );
    if (!score.active) {
      return;
    }
    hole.scorePhase +=
      dt * score.tempoBpm / 60;
    const subdivision = Math.floor(
      hole.scorePhase * 2,
    );
    if (
      subdivision ===
      hole.scoreStepIndex
    ) {
      return;
    }
    hole.scoreStepIndex =
      subdivision;
    hole.scoreBeatPulse = 1;
    const chasePattern =
      [0, 1, 3, 6];
    const suspensePattern =
      [0, null, 3, null, 1, null, 6, null];
    const pattern =
      hole.joe.mode === "chase"
        ? chasePattern
        : suspensePattern;
    const interval =
      pattern[
        subdivision % pattern.length
      ];
    if (
      interval === null ||
      score.intensity < 0.22 ||
      score.blackoutHush < 0.45 ||
      !audioContext ||
      !ambienceBusGain ||
      state.ambienceVolume <= 0
    ) {
      return;
    }
    const frequency =
      score.rootHz *
      4 *
      Math.pow(
        2,
        interval / 12,
      );
    const volume =
      (
        0.0035 +
        score.intensity * 0.0075
      ) *
      (
        hole.focus
          ? 0.28
          : 1
      );
    playTransientTone(
      frequency,
      frequency * 0.72,
      hole.joe.mode === "chase"
        ? 0.12
        : 0.18,
      volume,
      "triangle",
      0,
      ambienceBusGain,
    );
    hole.scoreNotesPlayed += 1;
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

    scoreFilter =
      audioContext.createBiquadFilter();
    scoreFilter.type = "lowpass";
    scoreFilter.frequency.value = 340;
    scoreFilter.Q.value = 1.45;
    scoreGain = audioContext.createGain();
    scoreGain.gain.value = 0;
    scoreFilter.connect(scoreGain);
    scoreGain.connect(ambienceBusGain);

    scoreRootGain =
      audioContext.createGain();
    scoreFifthGain =
      audioContext.createGain();
    scoreTensionGain =
      audioContext.createGain();
    scoreRootGain.gain.value = 0.68;
    scoreFifthGain.gain.value = 0.2;
    scoreTensionGain.gain.value = 0.04;
    scoreRootGain.connect(scoreFilter);
    scoreFifthGain.connect(scoreFilter);
    scoreTensionGain.connect(scoreFilter);

    scoreRootOscillator =
      audioContext.createOscillator();
    scoreFifthOscillator =
      audioContext.createOscillator();
    scoreTensionOscillator =
      audioContext.createOscillator();
    scoreRootOscillator.type = "triangle";
    scoreFifthOscillator.type = "sine";
    scoreTensionOscillator.type = "sawtooth";
    scoreRootOscillator.frequency.value =
      REACTIVE_SCORE_ZONES[0].rootHz;
    scoreFifthOscillator.frequency.value =
      REACTIVE_SCORE_ZONES[0].rootHz *
      1.498;
    scoreTensionOscillator.frequency.value =
      REACTIVE_SCORE_ZONES[0].rootHz *
      2.027;
    scoreRootOscillator.connect(
      scoreRootGain,
    );
    scoreFifthOscillator.connect(
      scoreFifthGain,
    );
    scoreTensionOscillator.connect(
      scoreTensionGain,
    );
    scoreRootOscillator.start();
    scoreFifthOscillator.start();
    scoreTensionOscillator.start();
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
    const reactiveScore =
      reactiveScoreState();
    if (scoreGain) {
      scoreGain.gain.setTargetAtTime(
        reactiveScore.gain,
        now,
        reactiveScore.active
          ? 0.22
          : 0.08,
      );
    }
    if (scoreFilter) {
      scoreFilter.frequency.setTargetAtTime(
        (
          260 +
          reactiveScore.intensity * 960
        ) *
          reactiveScore.blackoutHush,
        now,
        0.3,
      );
      scoreFilter.Q.setTargetAtTime(
        1.2 +
          reactiveScore.intensity * 2.3,
        now,
        0.35,
      );
    }
    if (scoreRootOscillator) {
      scoreRootOscillator.frequency.setTargetAtTime(
        reactiveScore.rootHz,
        now,
        0.65,
      );
    }
    if (scoreFifthOscillator) {
      scoreFifthOscillator.frequency.setTargetAtTime(
        reactiveScore.rootHz *
          (
            1.498 +
            reactiveScore.intensity *
              0.008
          ),
        now,
        0.58,
      );
    }
    if (scoreTensionOscillator) {
      scoreTensionOscillator.frequency.setTargetAtTime(
        reactiveScore.rootHz *
          (
            2.012 +
            reactiveScore.intensity *
              0.052
          ),
        now,
        0.4,
      );
    }
    if (scoreFifthGain) {
      scoreFifthGain.gain.setTargetAtTime(
        0.12 +
          reactiveScore.intensity *
            0.2,
        now,
        0.28,
      );
    }
    if (scoreTensionGain) {
      scoreTensionGain.gain.setTargetAtTime(
        0.015 +
          reactiveScore.intensity *
            0.11,
        now,
        0.24,
      );
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

  function playRiskPremiumCue(tier) {
    const base =
      tier === "razor"
        ? 392
        : tier === "close"
          ? 330
          : 262;
    playTransientTone(
      base,
      base * 1.5,
      0.18,
      0.034,
      "triangle",
    );
    playTransientTone(
      base * 1.25,
      base * 2,
      0.24,
      tier === "razor"
        ? 0.042
        : 0.028,
      "sine",
      0.09,
    );
    if (tier === "razor") {
      playNoiseBurst(
        0.15,
        0.018,
        2200,
        "highpass",
      );
    }
  }

  function playPickupCue() {
    playTransientTone(392, 784, 0.24, 0.055, "triangle");
    playTransientTone(587, 1174, 0.3, 0.038, "sine", 0.08);
    playNoiseBurst(0.12, 0.018, 2400, "highpass");
  }

  function playCollisionCue(obstacle) {
    const pan = clamp(
      (obstacle.x - state.player.x) /
        34,
      -0.72,
      0.72,
    );
    playTransientTone(
      86,
      49,
      0.16,
      0.035,
      "triangle",
    );
    playNoiseBurst(
      0.2,
      0.035,
      obstacle.sight
        ? 760
        : 420,
      "lowpass",
      pan,
    );
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

  function portfolioIndexAt(point) {
    if (
      point.y < PORTFOLIO_CARD_Y ||
      point.y >
        PORTFOLIO_CARD_Y +
          PORTFOLIO_CARD_HEIGHT
    ) {
      return -1;
    }
    for (
      let index = 0;
      index < RUN_VARIANTS.length;
      index += 1
    ) {
      const x =
        PORTFOLIO_PANEL.x +
        22 +
        index *
          (
            PORTFOLIO_CARD_WIDTH +
            PORTFOLIO_CARD_GAP
          );
      if (
        point.x >= x &&
        point.x <=
          x + PORTFOLIO_CARD_WIDTH
      ) {
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
    for (let index = 0; index < SETTINGS_ROWS.length; index += 1) {
      const row = settingsRowGeometry(index);
      if (
        point.x >= row.x &&
        point.x <= row.x + row.width &&
        point.y >= row.y &&
        point.y <= row.y + row.height
      ) {
        return index;
      }
    }
    return -1;
  }

  function bindingIndexAt(point) {
    for (
      let index = 0;
      index < KEYBOARD_BINDING_ROWS.length;
      index += 1
    ) {
      const row =
        bindingRowGeometry(index);
      if (
        point.x >= row.x &&
        point.x <= row.x + row.width &&
        point.y >= row.y &&
        point.y <= row.y + row.height
      ) {
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
      const portfolioIndex =
        portfolioIndexAt(point);
      if (portfolioIndex >= 0) {
        selectPortfolioVariant(
          portfolioIndex,
          true,
        );
        return;
      }
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
      if (state.settingsPage === "bindings") {
        if (
          point.x >= 194 &&
          point.x <= 446 &&
          point.y >= 585 &&
          point.y <= 621
        ) {
          resetKeyboardBindings();
        } else if (
          point.x >= 834 &&
          point.x <= 1086 &&
          point.y >= 585 &&
          point.y <= 621
        ) {
          returnToMixSettings();
        } else {
          const index =
            bindingIndexAt(point);
          if (index >= 0) {
            state.bindingIndex = index;
            state.bindingCaptureId =
              KEYBOARD_BINDING_ROWS[
                index
              ].id;
            state.bindingStatus =
              "Press a physical key. Conflicts will swap automatically.";
            playUiTone(
              260 + index * 9,
              0.055,
              0.02,
            );
          }
        }
      } else if (
        point.x >= 676 &&
        point.x <= 870 &&
        point.y >= 554 &&
        point.y <= 590
      ) {
        openKeyboardBindings();
      } else if (
        point.x >= 880 &&
        point.x <= 1096 &&
        point.y >= 554 &&
        point.y <= 590
      ) {
        returnFromSettings();
      } else {
        const index = settingsIndexAt(point);
        if (index >= 0) {
          state.settingsIndex = index;
          const setting = SETTINGS_ROWS[index];
          if (setting.type === "slider") {
            const slider = settingsSliderGeometry(index);
            const normalized =
              (point.x - slider.x) /
              slider.width;
            applySliderSetting(
              setting,
              setting.min +
                clamp(normalized, 0, 1) *
                  (setting.max - setting.min),
            );
            playMixPreview(setting.id);
          } else if (setting.type === "toggle") {
            toggleSetting(setting);
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
      const resultIndex =
        resultActionIndexAt(point);
      if (resultIndex >= 0) {
        state.resultIndex =
          resultIndex;
        activateResultAction();
      }
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
      state.mode !== "settings" &&
      state.mode !== "victory" &&
      state.mode !== "defeat"
    ) {
      return;
    }
    if (state.inputMethod === "touch") {
      clearTouchInputs(true);
    }
    state.inputMethod = "keyboard";
    if (state.mode === "settings") {
      if (state.settingsPage === "bindings") {
        const index =
          bindingIndexAt(
            canvasPoint(event),
          );
        if (
          index >= 0 &&
          index !== state.bindingIndex &&
          !state.bindingCaptureId
        ) {
          state.bindingIndex = index;
          playUiTone(
            190 + index * 12,
            0.04,
            0.012,
          );
        }
      } else {
        const index =
          settingsIndexAt(
            canvasPoint(event),
          );
        if (
          index >= 0 &&
          index !== state.settingsIndex
        ) {
          state.settingsIndex = index;
          playUiTone(
            190 + index * 12,
            0.04,
            0.012,
          );
        }
      }
    } else if (state.mode === "paused") {
      const index = pauseIndexAt(canvasPoint(event));
      if (index >= 0 && index !== state.pauseIndex) {
        state.pauseIndex = index;
        playUiTone(190 + index * 14, 0.045, 0.016);
      }
    } else if (
      state.mode === "victory" ||
      state.mode === "defeat"
    ) {
      const index =
        resultActionIndexAt(
          canvasPoint(event),
        );
      if (
        index >= 0 &&
        index !== state.resultIndex
      ) {
        state.resultIndex = index;
        playUiTone(
          190 + index * 42,
          0.045,
          0.016,
        );
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

  function applySliderSetting(setting, value) {
    state[setting.key] = clamp(
      value,
      setting.min,
      setting.max,
    );
    if (audioContext) {
      const gainTargets = {
        volume: { node: masterGain, scale: 0.55 },
        ambienceVolume: { node: ambienceBusGain, scale: 1 },
        mowerVolume: { node: mowerBusGain, scale: 1 },
        effectsVolume: { node: effectsBusGain, scale: 1 },
        dangerVolume: { node: dangerBusGain, scale: 1 },
      };
      const target = gainTargets[setting.key];
      if (target?.node) {
        target.node.gain.setTargetAtTime(
          state[setting.key] * target.scale,
          audioContext.currentTime,
          0.025,
        );
      }
    }
    savePreferences();
  }

  function toggleSetting(setting) {
    state[setting.key] = !state[setting.key];
    if (
      setting.key === "threatCaptions" &&
      !state.threatCaptions &&
      state.hole.captions
    ) {
      state.hole.captions = [];
    }
    savePreferences();
    playUiTone(
      state[setting.key] ? 320 : 210,
      0.055,
      0.02,
    );
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
    if (state.hole.courseEchoRecord) {
      state.hole.stateBanner =
        `COURSE ECHO // ${state.hole.courseEchoRecord.route.toUpperCase()} RECORD`;
      state.hole.stateBannerTimer = 3.2;
      state.hole.stateBannerLockTimer = 1.2;
    }
    playUiTone(360, 0.09, 0.03);
  }

  function retryFirstHole(
    quickStart = false,
  ) {
    const retryVariant =
      activeRunVariant();
    const target =
      quickStart
        ? nextPerformanceTarget()
        : null;
    state.mode = "first_hole";
    state.time = 0;
    resetFirstHole(retryVariant);
    state.transitionAlpha =
      quickStart ? 0.42 : 0.8;
    if (quickStart) {
      const hole = state.hole;
      hole.tutorialVisible = false;
      hole.quickRematch = true;
      hole.rematchTarget = {
        id: target.id,
        name: target.name,
        shortName:
          target.shortName,
        hint: target.hint,
      };
      hole.zoneBannerTimer = 0;
      hole.controlHintTimer = 4.2;
      hole.message =
        `${target.name} — ${target.hint}.${hole.courseEchoRecord ? " COURSE ECHO ACTIVE." : ""}`;
      hole.messageTimer = 4.2;
      hole.stateBanner =
        `FILE REOPENED // ${target.name}`;
      hole.stateBannerTimer = 3.4;
      hole.stateBannerLockTimer = 1.4;
      recordRoundStart();
      playUiTone(
        420,
        0.09,
        0.03,
      );
    }
  }

  function startNextNightOrder() {
    const nextVariant =
      nextNightOrderVariant();
    state.mode = "first_hole";
    state.time = 0;
    resetFirstHole(
      nextVariant,
    );
    state.transitionAlpha = 0.88;
    state.status =
      `Night Order ${String(nextVariant.number).padStart(2, "0")}: ${nextVariant.name}.`;
  }

  function selectResultAction(
    direction,
  ) {
    state.resultIndex =
      (
        state.resultIndex +
        direction +
        RESULT_ACTION_IDS.length
      ) %
      RESULT_ACTION_IDS.length;
    playUiTone(
      206 +
        state.resultIndex * 48,
      0.055,
      0.02,
    );
  }

  function activateResultAction() {
    const action =
      RESULT_ACTION_IDS[
        state.resultIndex
      ];
    playUiTone(
      286 +
        state.resultIndex * 46,
      0.075,
      0.026,
    );
    if (action === "rematch") {
      retryFirstHole(true);
    } else if (
      action === "next_order"
    ) {
      startNextNightOrder();
    } else {
      enterMenu();
    }
  }

  function selectSettings(direction) {
    state.settingsIndex =
      (state.settingsIndex + direction + SETTINGS_ROWS.length) %
      SETTINGS_ROWS.length;
    playUiTone(198 + state.settingsIndex * 20, 0.045, 0.016);
  }

  function selectBinding(direction) {
    state.bindingCaptureId = null;
    state.bindingIndex =
      (
        state.bindingIndex +
        direction +
        KEYBOARD_BINDING_ROWS.length
      ) %
      KEYBOARD_BINDING_ROWS.length;
    playUiTone(
      198 + state.bindingIndex * 12,
      0.045,
      0.016,
    );
  }

  function adjustSelectedSetting(direction) {
    const setting = SETTINGS_ROWS[state.settingsIndex];
    if (setting.type === "slider") {
      applySliderSetting(
        setting,
        state[setting.key] + direction * setting.step,
      );
      playMixPreview(setting.id);
    } else {
      toggleSetting(setting);
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
      if (state.settingsPage === "bindings") {
        state.bindingCaptureId =
          KEYBOARD_BINDING_ROWS[
            state.bindingIndex
          ].id;
        state.bindingStatus =
          "Press a physical key. Conflicts will swap automatically.";
        playUiTone(278, 0.065, 0.022);
      } else {
        adjustSelectedSetting(1);
      }
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
      activateResultAction();
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
      if (state.settingsPage === "bindings") {
        returnToMixSettings();
      } else {
        returnFromSettings();
      }
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
      } else if (
        directionPressed("left")
      ) {
        selectPortfolioVariant(-1);
      } else if (
        directionPressed("right")
      ) {
        selectPortfolioVariant(1);
      }
      if (pressed(5)) {
        toggleOvertimeAudit();
      }
    } else if (state.mode === "settings") {
      if (state.settingsPage === "bindings") {
        if (directionPressed("down")) {
          selectBinding(1);
        } else if (directionPressed("up")) {
          selectBinding(-1);
        } else if (directionPressed("left")) {
          selectBinding(-5);
        } else if (directionPressed("right")) {
          selectBinding(5);
        }
      } else if (directionPressed("down")) {
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
      state.mode === "victory" ||
      state.mode === "defeat"
    ) {
      if (directionPressed("left")) {
        selectResultAction(-1);
      } else if (
        directionPressed("right")
      ) {
        selectResultAction(1);
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
    if (
      pressed(3) &&
      state.mode === "settings" &&
      state.settingsPage === "mix"
    ) {
      openKeyboardBindings();
    } else if (
      pressed(3) &&
      state.mode === "first_hole"
    ) {
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
    if (
      state.mode === "settings" &&
      state.settingsPage === "bindings" &&
      state.bindingCaptureId
    ) {
      if (event.code === "Escape") {
        state.bindingCaptureId = null;
        state.bindingStatus =
          "Assignment cancelled.";
        state.keys.clear();
        playUiTone(176, 0.055, 0.018);
      } else if (!event.repeat) {
        rebindKeyboardAction(
          state.bindingCaptureId,
          event.code,
        );
      }
      event.preventDefault();
      return;
    }
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
      } else if (
        event.code === "ArrowLeft"
      ) {
        selectPortfolioVariant(-1);
        event.preventDefault();
      } else if (
        event.code === "ArrowRight"
      ) {
        selectPortfolioVariant(1);
        event.preventDefault();
      } else if (event.code === "Enter" || event.code === "Space") {
        playUiTone(285, 0.07, 0.025);
        activateMenu();
        event.preventDefault();
      }
    } else if (state.mode === "settings") {
      if (
        state.settingsPage === "bindings"
      ) {
        if (event.code === "Escape") {
          returnToMixSettings();
        } else if (
          event.code === "KeyR" &&
          !event.repeat
        ) {
          resetKeyboardBindings();
        } else if (event.code === "ArrowDown") {
          selectBinding(1);
        } else if (event.code === "ArrowUp") {
          selectBinding(-1);
        } else if (event.code === "ArrowLeft") {
          selectBinding(-5);
        } else if (event.code === "ArrowRight") {
          selectBinding(5);
        } else if (
          (event.code === "Enter" ||
            event.code === "Space") &&
          !event.repeat
        ) {
          state.bindingCaptureId =
            KEYBOARD_BINDING_ROWS[
              state.bindingIndex
            ].id;
          state.bindingStatus =
            "Press a physical key. Conflicts will swap automatically.";
          playUiTone(278, 0.065, 0.022);
        }
        event.preventDefault();
      } else if (event.code === "Escape") {
        returnFromSettings();
        event.preventDefault();
      } else if (
        event.code === "KeyB" &&
        !event.repeat
      ) {
        openKeyboardBindings();
        event.preventDefault();
      } else if (event.code === "ArrowDown") {
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
      const gameplayAction =
        keyboardActionForCode(event.code);
      const fixedMovement =
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(event.code);
      const movementAction =
        fixedMovement ||
        [
          "move_up",
          "move_left",
          "move_down",
          "move_right",
        ].includes(gameplayAction);
      const tutorialStartAction =
        movementAction ||
        [
          "crouch",
          "focus",
          "interact",
          "chip",
        ].includes(gameplayAction);
      if (
        state.hole.tutorialVisible &&
        tutorialStartAction
      ) {
        dismissHoleTutorial(
          movementAction,
        );
        event.preventDefault();
      } else if (event.code === "Escape") {
        if (state.hole.ballAim.active) {
          cancelGolfBallAim();
        } else {
          enterPause();
        }
        event.preventDefault();
      } else if (
        gameplayAction === "controls"
      ) {
        state.hole.controlHintTimer = 8;
        playUiTone(220, 0.045, 0.015);
        event.preventDefault();
      } else if (
        gameplayAction === "interact" &&
        !event.repeat
      ) {
        if (!state.hole.ballAim.active) {
          interactWithCourse();
        }
        event.preventDefault();
      } else if (
        gameplayAction === "chip" &&
        !event.repeat
      ) {
        beginGolfBallAim("keyboard");
        event.preventDefault();
      } else if (
        gameplayAction ||
        fixedMovement
      ) {
        event.preventDefault();
      }
    } else if (state.mode === "victory" || state.mode === "defeat") {
      if (event.code === "Escape") {
        enterMenu();
        event.preventDefault();
      } else if (
        event.code === "ArrowLeft"
      ) {
        selectResultAction(-1);
        event.preventDefault();
      } else if (
        event.code === "ArrowRight"
      ) {
        selectResultAction(1);
        event.preventDefault();
      } else if (
        (
          event.code === "Enter" ||
          event.code === "Space"
        ) &&
        !event.repeat
      ) {
        activateResultAction();
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
      event.code ===
        keyboardBindingCode("chip") &&
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
    resultActions:
      state.mode === "victory" ||
      state.mode === "defeat"
        ? {
            selected:
              RESULT_ACTION_IDS[
                state.resultIndex
              ],
            options:
              resultActionPresentations(
                state.mode,
              ).map(
                (action) => ({
                  id: action.id,
                  label:
                    action.label,
                  detail:
                    action.detail,
                  description:
                    action.description,
                }),
              ),
            nextPerformanceTarget:
              nextPerformanceTarget(),
            nextNightOrder: {
              id:
                nextNightOrderVariant().id,
              number:
                nextNightOrderVariant().number,
              name:
                nextNightOrderVariant().name,
            },
          }
        : null,
    nextNightOrder:
      state.mode === "menu" || state.mode === "claim"
        ? {
            id:
              selectedMenuVariant().id,
            number:
              selectedMenuVariant().number,
            name:
              selectedMenuVariant().name,
            source:
              portfolioUnlocked()
                ? "portfolio_override"
                : "career_rotation",
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
    portfolio: {
      id: "night_order_portfolio",
      unlocked:
        portfolioUnlocked(),
      unlockProgress: {
        filed:
          state.career.filedChangeRequests.length,
        required:
          RUN_VARIANTS.length,
      },
      selectedVariant:
        selectedMenuVariant().id,
      persistsSelection:
        portfolioUnlocked(),
      balanceEffect: "none",
      performanceStamps: {
        earned:
          totalPerformanceStamps(),
        available:
          PERFORMANCE_STAMPS.length *
          RUN_VARIANTS.length,
        masterProductOwner:
          masterProductOwnerUnlocked(),
        definitions:
          PERFORMANCE_STAMPS.map(
            (stamp) => ({
              id: stamp.id,
              code: stamp.code,
              name: stamp.name,
              hint: stamp.hint,
            }),
          ),
      },
    },
    dialogue:
      state.mode === "intro" &&
      state.time >= LINE_START &&
      state.time <= LINE_END
        ? {
            speaker: "JOE",
            text: "HERE'S JOEY!",
            delivery:
              "subtitle_only",
          }
        : state.mode === "defeat"
          ? {
              speaker: "JOE",
              id:
                state.hole
                  .captureDialogue
                  ?.id ||
                JOE_CAPTURE_LINES[0]
                  .id,
              tone:
                state.hole
                  .captureDialogue
                  ?.tone ||
                JOE_CAPTURE_LINES[0]
                  .tone,
              expression:
                state.hole
                  .captureDialogue
                  ?.expression ??
                JOE_CAPTURE_LINES[0]
                  .expression,
              text:
                (
                  state.hole
                    .captureDialogue
                    ?.lines ||
                  JOE_CAPTURE_LINES[0]
                    .lines
                ).join(" "),
              poolSize:
                JOE_CAPTURE_LINES.length,
              delivery:
                "subtitle_only",
            }
          : state.mode ===
                "first_hole" &&
              state.hole
                .joeBarkTimer >
                0 &&
              state.hole.joeBark
            ? {
                speaker: "JOE",
                text:
                  state.hole
                    .joeBark,
                context:
                  state.hole
                    .joeBarkContext ||
                  state.hole
                    .joe.mode,
                poolSize:
                  (
                    JOE_CONTEXT_BARKS[
                      state.hole
                        .joeBarkContext
                    ] ||
                    JOE_STATE_BARKS[
                      state.hole.joe
                        .mode
                    ] ||
                    []
                  ).length,
                delivery:
                  "subtitle_only",
              }
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
      subtitleSize: Number(state.subtitleSize.toFixed(2)),
      captionBackground: Number(state.captionBackground.toFixed(2)),
      threatCaptions: state.threatCaptions,
      reducedMotion: state.reducedMotion,
      returnTarget: state.settingsReturnMode,
      persisted: preferencesStorageAvailable,
      page: state.settingsPage,
      selected:
        state.settingsPage === "bindings"
          ? KEYBOARD_BINDING_ROWS[
              state.bindingIndex
            ].id
          : SETTINGS_ROWS[
              state.settingsIndex
            ].id,
      bindingCapture:
        state.bindingCaptureId,
      bindingStatus:
        state.bindingStatus,
      keyboardBindings:
        Object.fromEntries(
          KEYBOARD_BINDING_ROWS.map(
            (binding) => [
              binding.id,
              {
                code:
                  keyboardBindingCode(
                    binding.id,
                  ),
                label:
                  keyboardBindingLabel(
                    binding.id,
                  ),
              },
            ],
          ),
        ),
      fixedMovementFallback:
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ],
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
        careerRecordSummary(
          state.career.overtimeBest,
        ),
      nightOrdersCleared:
        state.career.completedVariants.length,
      completedVariants:
        state.career.completedVariants.slice(),
      changeRequestsFiled:
        state.career.filedChangeRequests.length,
      filedChangeRequests:
        state.career.filedChangeRequests.slice(),
      selectedVariantId:
        state.career.selectedVariantId,
      performanceStamps:
        Object.fromEntries(
          RUN_VARIANTS.map(
            (variant) => [
              variant.id,
              performanceStampsFor(
                variant.id,
              ).slice(),
            ],
          ),
        ),
      perfectedVariants:
        RUN_VARIANTS.filter(
          (variant) =>
            dossierPerfected(
              variant.id,
            ),
        ).map((variant) => variant.id),
      bestOverall: careerRecordSummary(
        bestCareerRecord(),
      ),
      routes: {
        shed: careerRecordSummary(
          state.career.routes.shed,
        ),
        drain: careerRecordSummary(
          state.career.routes.drain,
        ),
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
      reactiveScore: (() => {
        const score =
          reactiveScoreState();
        return {
          active: score.active,
          zone:
            COURSE_ZONES[
              score.zoneIndex
            ].id,
          key: score.key,
          rootHz: Number(
            score.rootHz.toFixed(2),
          ),
          intensity: Number(
            score.intensity.toFixed(2),
          ),
          tempoBpm: score.tempoBpm,
          targetGain: Number(
            score.gain.toFixed(4),
          ),
          blackoutHush: Number(
            score.blackoutHush.toFixed(2),
          ),
          focusDuck: Number(
            score.focusDuck.toFixed(2),
          ),
          beatPulse: Number(
            score.beatPulse.toFixed(2),
          ),
          stepIndex:
            score.stepIndex,
          notesPlayed:
            state.hole.scoreNotesPlayed,
          layers:
            score.layers.slice(),
          routedTo: "course_ambience",
          nodesReady: Boolean(
            scoreGain &&
            scoreRootOscillator &&
            scoreFifthOscillator &&
            scoreTensionOscillator
          ),
        };
      })(),
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
          rematch: {
            quickStart:
              state.hole.quickRematch,
            briefingSkipped:
              state.hole.quickRematch,
            target:
              state.hole.rematchTarget
                ? {
                    ...state.hole.rematchTarget,
                  }
                : null,
            roundRecorded:
              state.hole.attemptRecorded,
            courseEchoActive:
              Boolean(
                state.hole.courseEchoRecord,
              ),
          },
          activeThreatCaptions:
            state.hole.captions?.map((caption) => ({
              text: caption.text,
              direction: caption.direction,
              category: caption.category,
              remainingSeconds: Number(
                Math.max(
                  0,
                  caption.duration - caption.age,
                ).toFixed(2),
              ),
            })) || [],
          hudExpanded:
            state.hole.controlHintTimer > 0.01 ||
            state.hole.focus,
          controlHintSeconds: Number(
            state.hole.controlHintTimer.toFixed(2),
          ),
          courseEcho:
            currentCourseEcho()
              ? {
                  route:
                    currentCourseEcho().record.route,
                  variantId:
                    currentCourseEcho().record.variantId,
                  score:
                    currentCourseEcho().record.score,
                  recordTimeSeconds: Number(
                    currentCourseEcho().record.timeSeconds.toFixed(
                      2,
                    ),
                  ),
                  savedSamples:
                    currentCourseEcho().record.ghostPath.length,
                  recordedSamples:
                    state.hole.courseEchoSamples.length,
                  position: {
                    x: Number(
                      currentCourseEcho().position.x.toFixed(
                        2,
                      ),
                    ),
                    y: Number(
                      currentCourseEcho().position.y.toFixed(
                        2,
                      ),
                    ),
                  },
                  paceDeltaSeconds: Number(
                    currentCourseEcho().paceDelta.toFixed(
                      2,
                    ),
                  ),
                  pace:
                    currentCourseEcho().ahead
                      ? "ahead"
                      : "behind",
                  finished:
                    currentCourseEcho().finished,
                }
              : {
                  available: false,
                  recordedSamples:
                    state.hole.courseEchoSamples.length,
                },
          performanceStamps: {
            earned:
              performanceStampsFor(
                activeRunVariant().id,
              ).slice(),
            progress:
              performanceStampsFor(
                activeRunVariant().id,
              ).length,
            available:
              PERFORMANCE_STAMPS.length,
            perfected:
              dossierPerfected(
                activeRunVariant().id,
              ),
            currentRunCriteria: {
              cleanFile:
                state.hole.chaseCount ===
                0,
              fieldRecovery:
                state.hole.ballsRecovered >
                0,
              bunkerClause:
                state.hole.sandTrapCount >=
                2,
              echoBreakerPotential:
                currentCourseEcho()
                  ? (
                      calculateRunResult(
                        state.hole.escapeRoute ||
                          "shed",
                      ).score >
                        currentCourseEcho()
                          .record.score
                    )
                  : false,
            },
          },
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
            razorCuts:
              state.hole.razorCuts,
            fileProjection:
              state.hole.liveProjection
                ? {
                    score:
                      state.hole
                        .liveProjection
                        .score,
                    grade:
                      state.hole
                        .liveProjection
                        .grade,
                    gradeLabel:
                      state.hole
                        .liveProjection
                        .gradeLabel,
                    routeAssumption:
                      state.hole
                        .liveProjection
                        .route,
                    direction:
                      state.hole
                        .liveProjection
                        .direction,
                    reason:
                      state.hole
                        .liveProjection
                        .reason,
                    changeSeconds:
                      Number(
                        state.hole
                          .liveProjection
                          .changeTimer
                          .toFixed(2),
                      ),
                    breakdown: {
                      ...state.hole
                        .liveProjection
                        .breakdown,
                    },
                    scoringEffect:
                      "none",
                    meaning:
                      "exact result if a valid exit were filed now",
                  }
                : null,
            riskPremium: {
              banked:
                state.hole.riskPremiumBanked,
              current:
                state.hole.joe.mode === "chase" &&
                state.hole.riskBreakBonuses.length < 3
                  ? state.hole.currentRiskPremium
                  : 0,
              capBreaks: 3,
              breakBonuses:
                state.hole.riskBreakBonuses.slice(),
              activeAward:
                state.hole.riskAward
                  ? {
                      amount:
                        state.hole.riskAward.amount,
                      tier:
                        state.hole.riskAward.tier,
                      remainingSeconds:
                        Number(
                          Math.max(
                            0,
                            state.hole.riskAward.duration -
                              state.hole.riskAward.age,
                          ).toFixed(2),
                        ),
                    }
                  : null,
            },
            deliveryChain: {
              chain:
                state.hole.deliveryChain,
              peak:
                state.hole.deliveryPeak,
              multiplier:
                Number(
                  deliveryMultiplier(
                    state.hole.deliveryChain,
                  ).toFixed(1),
                ),
              remainingSeconds:
                Number(
                  state.hole.deliveryTimer.toFixed(
                    2,
                  ),
                ),
              windowSeconds:
                DELIVERY_CHAIN_WINDOW,
              bonus:
                state.hole.deliveryBonus,
              events:
                state.hole.deliveryEvents.slice(),
              familyCounts: {
                ...state.hole.deliveryFamilyCounts,
              },
              familyCaps: {
                ...DELIVERY_FAMILY_CAPS,
              },
              rule:
                "Link smart plays before the timer expires; the chain increases score but never changes survival difficulty.",
            },
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
          collisionContact:
            state.hole.blockedTimer > 0
              ? {
                  id:
                    state.hole
                      .blockedObstacle,
                  landmark:
                    state.hole
                      .blockedLandmark,
                  worldX: Number(
                    state.hole
                      .blockedWorldX.toFixed(
                        2,
                      ),
                  ),
                  worldY: Number(
                    state.hole
                      .blockedWorldY.toFixed(
                        2,
                      ),
                  ),
                  radius:
                    state.hole
                      .blockedRadius,
                  radiusX:
                    state.hole
                      .blockedRadiusX,
                  radiusY:
                    state.hole
                      .blockedRadiusY,
                  inputDirection:
                    state.hole
                      .blockedDirection,
                  escapeDirection:
                    state.hole
                      .blockedEscape,
                  feedbackSeconds:
                    Number(
                      state.hole
                        .blockedTimer.toFixed(
                          2,
                        ),
                    ),
                }
              : null,
          stateBanner: state.hole.stateBannerTimer > 0 ? state.hole.stateBanner : null,
          activeEffects: [
            ...state.hole
              .worldEffects
              .map(
                (effect) =>
                  effect.kind,
              ),
            ...new Set(
              state.hole
                .worldParticles
                .map(
                  (particle) =>
                    particle.kind,
                ),
            ),
          ],
          visibleObstacles: visibleObstacleState(),
          interactables:
            interactableWorldState(),
          navigationReadability: {
            mapShowsCourseBoundary:
              true,
            mapShowsCollisionFootprints:
              true,
            collisionModel:
              "authored_elliptical_visible_base",
            mapMatchesFirstPersonCollision:
              true,
            mapIncludesHiddenBlockers:
              true,
            mapShowsInteractionRanges:
              true,
            focusShowsNearbyFootprints:
              true,
            mapRole:
              "persistent_with_field_bearing",
            dedicatedLandmarks: {
              shed: true,
              hedgeHides: true,
              stoneCover: true,
              groundsCart: true,
              groundedToCollisionFootprints:
                true,
              transparentSourceMarginsRemoved:
                true,
            },
            firstPersonGuidance: {
              worldRibbon: true,
              fairwayEdgeStakes:
                false,
              fairwayEdgeLanterns:
                true,
              proximityBlockers:
                true,
              targetId:
                state.hole
                  .navigationGuide
                  .targetId,
              targetLabel:
                state.hole
                  .navigationGuide
                  .targetLabel,
              targetDistance:
                Number(
                  state.hole
                    .navigationGuide
                    .distance.toFixed(
                      2,
                    ),
                ),
              direction:
                effectiveGuidanceDirection(),
              pathWaypoints:
                state.hole
                  .navigationGuide
                  .path.length,
              visibleReflectors:
                navigationRibbonSamples()
                  .filter((sample) => {
                    const point =
                      worldToScreen(
                        sample.x,
                        sample.y,
                      );
                    return (
                      point.visible &&
                      point.x > -90 &&
                      point.x <
                        WIDTH + 90
                    );
                  })
                  .length,
              visiblePathLanterns:
                visiblePathLanternCount(),
              fieldPosition:
                playerFieldPositionLabel(),
            },
          },
          sceneDecomposition: {
            groundingLayer:
              "golf_course",
            groundingTransparency:
              "alpha_silhouette",
            dedicatedSkyLayer:
              "moonless_night_sky",
            moonOwnLayer: true,
            animatedLayers: [
              {
                id:
                  "moon",
                depth:
                  "celestial",
                motion:
                  state.reducedMotion
                    ? "static"
                    : "subtle_parallax_and_halo_pulse",
              },
              {
                id:
                  "individual_clouds",
                depth:
                  "multiple_sky_depths",
                count:
                  CLOUD_INSTANCES.length,
                sourceSprites: 6,
                motion:
                  state.reducedMotion
                    ? "static"
                    : "independent_drift_wrap_bob_and_parallax",
              },
              {
                id:
                  "far_ridge",
                depth:
                  "far_horizon",
                motion:
                  state.reducedMotion
                    ? "static"
                    : "micro_parallax",
              },
              {
                id:
                  "distant_villas",
                depth:
                  "horizon_architecture",
                motion:
                  state.reducedMotion
                    ? "static"
                    : "independent_parallax",
              },
              {
                id:
                  "clubhouse",
                depth:
                  "far_landmark",
                motion:
                  state.reducedMotion
                    ? "static"
                    : "subtle_parallax_and_window_glow",
              },
              {
                id:
                  "tree_line",
                depth:
                  "horizon",
                motion:
                  state.reducedMotion
                    ? "static"
                    : "subtle_parallax",
              },
              {
                id:
                  "layered_fog",
                depth:
                  "horizon_and_ground",
                motion:
                  state.reducedMotion
                    ? "static"
                    : "multi_speed_drift_and_player_parallax",
              },
            ],
            groundedFeatureArt: {
              courseSigns:
                "dedicated_six_cell_pixel_art_atlas_with_runtime_labels",
              sandTraps:
                "dedicated_three_cell_pixel_art_atlas_projected_to_authoritative_terrain_zones",
              pathLanterns:
                "dedicated_four_cell_imagegen_atlas_with_projected_amber_light_pools_and_water_hazard_power_sag",
              interactables:
                "dedicated_imagegen_world_props_for_key_sprinkler_change_request_and_recoverable_golf_ball",
              courseClutter: {
                source:
                  "dedicated_six_cell_imagegen_atlas",
                placements:
                  COURSE_CLUTTER.length,
                collision:
                  "low_profile_margin_dressing_step_over",
              },
              proceduralStandInsReplaced: [
                "fairway_edge_stakes",
                "change_request_clipboard",
                "floating_key_icon",
                "floating_sprinkler_icon",
                "procedural_recoverable_golf_ball",
              ],
            },
          },
          deadGreenLayers: {
            groundAnchored: true,
            scenery: visibleDeadGreenSceneryState(),
          },
          escapeFiling: {
            active:
              state.hole.escapeFiling.active,
            sealing:
              state.hole.escapeFiling.sealing,
            route:
              state.hole.escapeFiling.route,
            progressSeconds:
              Number(
                state.hole.escapeFiling.progress.toFixed(
                  2,
                ),
              ),
            durationSeconds:
              Number(
                state.hole.escapeFiling.duration.toFixed(
                  2,
                ),
              ),
            sealProgressSeconds:
              Number(
                state.hole.escapeFiling.sealProgress.toFixed(
                  2,
                ),
              ),
            sealDurationSeconds:
              Number(
                state.hole.escapeFiling.sealDuration.toFixed(
                  2,
                ),
              ),
            sealProgressPercent:
              Math.round(
                state.hole.escapeFiling.sealProgress /
                  Math.max(
                    0.001,
                    state.hole.escapeFiling.sealDuration,
                  ) *
                  100,
              ),
            progressPercent:
              state.hole.escapeFiling.duration >
              0
                ? Math.round(
                    state.hole.escapeFiling.progress /
                      state.hole.escapeFiling.duration *
                      100,
                  )
                : state.hole.escapeFiling.completed
                  ? 100
                  : 0,
            stage:
              state.hole.escapeFiling.stage,
            attempts:
              state.hole.escapeFiling.attempts,
            cancellations:
              state.hole.escapeFiling.cancellations,
            completed:
              state.hole.escapeFiling.completed,
            capturedDuringFiling:
              state.hole.escapeFiling.capturedDuringFiling,
            lastInterruption:
              state.hole.escapeFiling.lastInterruption,
            joeDistanceAtStart:
              state.hole.escapeFiling.joeDistanceAtStart ===
              null
                ? null
                : Number(
                    state.hole.escapeFiling.joeDistanceAtStart.toFixed(
                      2,
                    ),
                  ),
            movementAborts: true,
            joeContinuesDuringFiling: true,
            playerLockedDuringSeal: true,
            joeFrozenDuringSeal: true,
            scoreClockFrozenDuringSeal: true,
            riskEndsAt:
              "filing_100_percent",
            scoringEffect:
              "none_direct; elapsed time and final Joe distance use existing scoring",
          },
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
            effects: {
              system:
                "world_space_mower_debris",
              alive:
                state.hole
                  .worldParticles
                  .length,
              peakAlive:
                state.hole
                  .peakWorldParticles,
              cap:
                MAX_MOWER_WORLD_PARTICLES,
              totalClippingsEmitted:
                state.hole.joe
                  .clippingsEmitted,
              grassShavingsAlive:
                state.hole
                  .worldParticles
                  .filter(
                    (particle) =>
                      particle.kind ===
                      "grass_shaving",
                  ).length,
              driftingDustAlive:
                state.hole
                  .worldParticles
                  .filter(
                    (particle) =>
                      particle.kind ===
                      "grass_dust",
                  ).length,
              wetClippingsAlive:
                state.hole
                  .worldParticles
                  .filter(
                    (particle) =>
                      particle.kind ===
                      "wet_clipping",
                  ).length,
              sandShardsAlive:
                state.hole
                  .worldParticles
                  .filter(
                    (particle) =>
                      particle.kind ===
                      "sand_shard",
                  ).length,
              sparksAlive:
                state.hole
                  .worldParticles
                  .filter(
                    (particle) =>
                      particle.kind ===
                      "mower_spark",
                  ).length,
              scrapeBursts:
                state.hole.joe
                  .scrapeBursts,
              fogWake:
                state.hole.joe
                  .effectSpeed >
                0.4,
              longMoonShadow:
                true,
              nearCameraDebris:
                worldDistance(
                  state.hole.joe,
                  state.player,
                ) < 58,
              floodlightMoths:
                true,
              reducedMotionDensity:
                state.reducedMotion
                  ? 0.58
                  : 1,
            },
            character: {
              role:
                "software_product_owner_at_an_insurance_company",
              notAnAdjuster: true,
              background:
                "Joe owns the roadmap and prioritized backlog for insurance software. He turned an after-hours course optimization pilot into a literal product increment, treating mowing lines as roadmaps, divots as defects, bunkers as blockers, and the player as unplanned scope.",
              obsessions: [
                "grass",
                "golf",
                "product_backlogs",
                "acceptance_criteria",
                "sprint_goals",
                "roadmaps",
                "stakeholder_alignment",
              ],
              activeBark:
                state.hole
                  .joeBarkTimer >
                  0
                  ? state.hole
                      .joeBark
                  : null,
              captureDialoguePool:
                JOE_CAPTURE_LINES.length,
              dialogueLibrary: {
                captureOutcomes:
                  JOE_CAPTURE_LINES.length,
                authoredCapturePacks:
                  JOE_DIALOGUE_LIBRARY
                    .capturePackCount,
                stateBarks:
                  JOE_STATE_BARK_COUNT,
                contextBarks:
                  JOE_CONTEXT_BARK_COUNT,
                totalVariants:
                  JOE_DIALOGUE_VARIANT_COUNT,
                captureRepeatWindow:
                  JOE_CAPTURE_HISTORY_LIMIT,
                barkRepeatWindow:
                  JOE_BARK_HISTORY_LIMIT,
                activeContext:
                  state.hole
                    .joeBarkContext,
              },
              expressionCount: 6,
              voice:
                "subtitle_only",
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
      menu: "Up/down and Enter, or pointer; after filing all Change Requests, left/right selects a Night Order; R toggles Overtime Audit after mastery",
      firstHole: `${keyboardMovementCopy()} move; ${keyboardBindingLabel("sprint")} sprints; hold ${keyboardBindingLabel("crouch")} to crouch; hold ${keyboardBindingLabel("focus")} for Listening Focus; bunker sand slows both player and mower but leaves loud tracks; ${keyboardBindingLabel("interact")} interacts, reclaims a ball, or starts Final Filing at an open exit; movement aborts filing; hold ${keyboardBindingLabel("chip")} and use ${keyboardBindingLabel("move_left")}/${keyboardBindingLabel("move_right")} to aim, then release to chip; ${keyboardBindingLabel("controls")} shows controls; Escape cancels a shot or pauses`,
      pause: "Arrow keys select; Enter confirms; Escape resumes",
      result: "Left/right selects Rematch File, Next Order, or Clubhouse; Enter confirms; Escape returns to the Clubhouse",
      keyboard: {
        global: "F fullscreen",
        gate: "Click, Enter, or Space",
        intro: "Click, Enter, Space, or Escape to skip",
        menu: "Up/down and Enter, or pointer; after filing all Change Requests, left/right selects a Night Order; R toggles Overtime Audit after mastery",
        firstHole: `${keyboardMovementCopy()} move; ${keyboardBindingLabel("sprint")} sprints; hold ${keyboardBindingLabel("crouch")} to crouch; hold ${keyboardBindingLabel("focus")} for Listening Focus; bunker sand slows both player and mower but leaves loud tracks; ${keyboardBindingLabel("interact")} interacts, reclaims a ball, or starts Final Filing at an open exit; movement aborts filing; hold ${keyboardBindingLabel("chip")} and use ${keyboardBindingLabel("move_left")}/${keyboardBindingLabel("move_right")} to aim, then release to chip; ${keyboardBindingLabel("controls")} shows controls; Escape cancels a shot or pauses`,
        pause: "Arrow keys select; Enter confirms; Escape resumes",
        result: "Left/right selects Rematch File, Next Order, or Clubhouse; Enter confirms; Escape returns to the Clubhouse",
      },
      gamepad: {
        menu: "D-pad up/down selects menu items; after filing all Change Requests, D-pad left/right selects a Night Order; A confirms; RB toggles Overtime Audit after mastery; B returns",
        firstHole: "Left stick or D-pad moves; RT sprints; LB crouches; LT listens; bunker sand slows both player and mower but leaves loud tracks; A interacts, reclaims a ball, or starts Final Filing at an open exit; movement aborts filing; hold X and use the left stick to aim, then release to chip; Y shows controls; B cancels a shot; Start pauses",
        pause: "D-pad selects; A confirms; B or Start resumes",
        result: "D-pad left/right selects Rematch File, Next Order, or Clubhouse; A confirms; B returns to the Clubhouse",
      },
      touch: {
        gate: "Tap to begin",
        intro: "Tap to skip",
        menu: "Tap menu items directly; after filing all Change Requests, tap a Night Order dossier; tap the Overtime card after mastery",
        firstHole: "Drag the left pad to move; hold Run while moving to sprint; hold Crouch or Listen for stealth information; tap Use to interact, reclaim a ball, or start Final Filing at an open exit; movement aborts filing; hold Chip, slide left or right to aim, and release to shoot; tap Pause to suspend the round",
        pause: "Tap a menu item directly",
        result: "Tap Rematch File, Next Order, or Clubhouse directly",
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
  nightSkyArt.addEventListener("load", render);
  moonArt.addEventListener("load", render);
  holeArt.addEventListener("load", render);
  cloudAtlasArt.addEventListener("load", render);
  distantTreeLineArt.addEventListener("load", render);
  distantClubhouseArt.addEventListener("load", render);
  farRidgeArt.addEventListener("load", render);
  distantVillasArt.addEventListener("load", render);
  signageAtlasArt.addEventListener("load", render);
  bunkerAtlasArt.addEventListener("load", render);
  joeMowerArt.addEventListener("load", render);
  joeMowerAnimatedArt.addEventListener("load", render);
  joeMowerErraticHeadArt.addEventListener("load", render);
  fieldKitArt.addEventListener("load", render);
  courseObstacleArt.addEventListener("load", render);
  expandedCourseArt.addEventListener("load", render);
  maintenanceShedArt.addEventListener("load", render);
  hedgeHideArt.addEventListener("load", render);
  stoneCoverArt.addEventListener("load", render);
  serviceCartArt.addEventListener("load", render);
  deadGreenSceneryArt.addEventListener("load", render);
  foregroundFringeArt.addEventListener("load", render);
  defeatArt.addEventListener("load", render);
  joeExpressionArt.addEventListener("load", render);
  drainArt.addEventListener("load", render);
  pathLanternArt.addEventListener("load", render);
  interactablePropArt.addEventListener(
    "load",
    render,
  );
  courseClutterArt.addEventListener(
    "load",
    render,
  );
  requestAnimationFrame(frame);
})();
