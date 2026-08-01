"use strict";

(() => {
  const canvas = document.querySelector("#game");
  let ctx = canvas.getContext("2d", { alpha: false });
  const mainCtx = ctx;
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const COURSE_MAP_X = WIDTH - 274;
  const COURSE_MAP_Y = 210;
  const COURSE_MAP_WIDTH = 234;
  const COURSE_MAP_HEIGHT = 340;
  const screenTextureBuffer =
    document.createElement("canvas");
  screenTextureBuffer.width = WIDTH;
  screenTextureBuffer.height = HEIGHT;
  const screenTextureCtx =
    screenTextureBuffer.getContext("2d");
  const miniMapBuffer =
    document.createElement("canvas");
  miniMapBuffer.width =
    COURSE_MAP_WIDTH;
  miniMapBuffer.height =
    COURSE_MAP_HEIGHT;
  const miniMapCtx =
    miniMapBuffer.getContext("2d");
  miniMapCtx.imageSmoothingEnabled =
    false;
  let miniMapRenderedAt =
    -Infinity;
  const courseBackdropBuffer =
    document.createElement("canvas");
  courseBackdropBuffer.width = WIDTH;
  courseBackdropBuffer.height = HEIGHT;
  const courseBackdropCtx =
    courseBackdropBuffer.getContext(
      "2d",
      { alpha: false },
    );
  courseBackdropCtx.imageSmoothingEnabled =
    false;
  let courseBackdropRenderedAt =
    -Infinity;
  const TARGET_FRAME_MS = 1000 / 60;
  const FRAME_PRESENTATION_TOLERANCE_MS =
    1.5;
  const runtimePerformance = {
    tier: "balanced",
    renderAverageMs: 10,
    lastRenderMs: 0,
    slowFrames: 0,
    recoveryFrames: 0,
    renderedFrames: 0,
    skippedFrames: 0,
    presentationAverageMs:
      TARGET_FRAME_MS,
    lastPresentationMs:
      TARGET_FRAME_MS,
    presentationSlowFrames: 0,
  };
  const renderFrameCache = {
    cameraFrame: null,
    threat: null,
    locomotion: null,
  };
  const layeredCourseEntities = [];
  let layeredCourseEntityCount = 0;
  const ATLAS_CELL_CACHE_MAX_DIMENSION =
    384;
  const atlasCellCache =
    new Map();
  const CLOUD_ALPHA_MASK_SIZE = 16;
  const CLOUD_ALPHA_MASK_ROWS = [
    [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x5e00, 0x3f80, 0x3ff0, 0x0ff0, 0x07fc, 0x01fe, 0x0000, 0x0000, 0x0000, 0x0000],
    [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0040, 0x0fe8, 0x1ffc, 0x7ffc, 0xffff, 0xffff, 0x0000, 0x0000, 0x0000, 0x0000],
    [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0780, 0x07c0, 0x0ff0, 0x1ff8, 0x3ffc, 0x1ffd, 0x0ff0, 0x0180, 0x0000, 0x0000, 0x0000],
    [0x0100, 0x0380, 0x0f80, 0x1f80, 0x0fe0, 0x07e0, 0x07e0, 0x3ff8, 0x1ff8, 0x7ff8, 0x3ff0, 0x07c0, 0x0000, 0x0000, 0x0000, 0x0000],
    [0x0000, 0x0000, 0x0000, 0x0000, 0x1800, 0x3f00, 0x3c00, 0x3fe0, 0x1ff8, 0x031c, 0x000c, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000],
    [0x0000, 0x0000, 0x0000, 0x01c0, 0x03e0, 0x07e8, 0x1ff8, 0x3f7c, 0x3efe, 0x0cfc, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000],
  ];

  function buildScreenTexture() {
    screenTextureCtx.clearRect(
      0,
      0,
      WIDTH,
      HEIGHT,
    );
    screenTextureCtx.save();
    screenTextureCtx.globalAlpha = 0.08;
    screenTextureCtx.fillStyle =
      "#b5d0a8";
    for (
      let y = 1;
      y < HEIGHT;
      y += 4
    ) {
      screenTextureCtx.fillRect(
        0,
        y,
        WIDTH,
        1,
      );
    }
    screenTextureCtx.restore();
    const vignette =
      screenTextureCtx.createRadialGradient(
        WIDTH * 0.5,
        HEIGHT * 0.46,
        HEIGHT * 0.18,
        WIDTH * 0.5,
        HEIGHT * 0.46,
        WIDTH * 0.72,
      );
    vignette.addColorStop(
      0,
      "rgba(0,0,0,0)",
    );
    vignette.addColorStop(
      0.7,
      "rgba(0,0,0,0.08)",
    );
    vignette.addColorStop(
      1,
      "rgba(0,0,0,0.6)",
    );
    screenTextureCtx.fillStyle =
      vignette;
    screenTextureCtx.fillRect(
      0,
      0,
      WIDTH,
      HEIGHT,
    );
  }

  buildScreenTexture();
  const CUT_START = 1.15;
  const CUT_END = 4.65;
  const LINE_START = 5.25;
  const LINE_END = 6.95;
  const MENU_TIME = 8.15;
  const PLAYER_STORY = {
    role:
      "associate product analyst on Joe's insurance-software product team",
    incitingIncident:
      "At 5:47 PM on release night, Joe assigns one last action item: carry a signed Night Order through the insurer's executive golf course to the far-side maintenance office.",
    reasonToCross:
      "The south service gate locks behind you, your task is already marked done, and the maintenance shed and drainage culvert are the only exits across the course.",
    stakes:
      "Joe has reclassified you as an unplanned dependency in his live course-optimization acceptance test.",
    courseConnection:
      "The insurer uses its executive golf course to pilot turf sensors as property-risk technology; Joe's Product Owner access controls its night schedules, gates, irrigation, lights, and maintenance telemetry.",
    evidence:
      "Unfiled Change Requests prove Joe knew the turf-telemetry pilot and its automated course controls were unsafe.",
  };
  const MENU_ITEMS = [
    "BEGIN THE ROUND",
    "HOW TO PLAY / SETTINGS",
    "SUBMIT CHANGE REQUEST",
    "REPLAY INCIDENT",
    "CLOCK OUT",
  ];
  const MENU_DESCRIPTIONS = [
    "Answer Joe's last task. Cross the locked course.",
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
  const estatePerimeterArt =
    new Image();
  estatePerimeterArt.src =
    "./assets/rough-cut-estate-perimeter-v2.png";
  const signageAtlasArt = new Image();
  signageAtlasArt.src = "./assets/rough-cut-signage-atlas-v1.png";
  const bunkerAtlasArt = new Image();
  bunkerAtlasArt.src = "./assets/rough-cut-bunker-atlas-v2.png";
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
  const shedEscapeTableauArt =
    new Image();
  shedEscapeTableauArt.src =
    "./assets/rough-cut-shed-escape-tableau-v1.png";
  const drainEscapeTableauArt =
    new Image();
  drainEscapeTableauArt.src =
    "./assets/rough-cut-drain-escape-tableau-v1.png";
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
  const courseVergeArt =
    new Image();
  courseVergeArt.src =
    "./assets/rough-cut-verge-atlas-v1.png";
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
    lateralWalkPixels: 68,
    lateralSprintPixels: 88,
    lateralCrouchPixels: 42,
    lateralFocusPixels: 32,
    lateralResponse: 9.2,
    lateralReturnResponse: 6.8,
    viewportShiftRatio: 0.5,
    reducedViewportShiftRatio: 0.32,
    maxRollRadians: 0.009,
    sprintRollRadians: 0.012,
  };

  function freshCourseCameraMotion() {
    return {
      lateralInput: 0,
      offsetX: 0,
      targetOffsetX: 0,
      roll: 0,
      targetRoll: 0,
      response: 0,
    };
  }

  function effectQualityScale() {
    if (state.reducedMotion) {
      return 0.48;
    }
    if (
      runtimePerformance.tier ===
      "low"
    ) {
      return 0.46;
    }
    if (
      runtimePerformance.tier ===
      "balanced"
    ) {
      return 0.72;
    }
    return 1;
  }

  function recordRenderPerformance(
    renderMs,
  ) {
    const performanceState =
      runtimePerformance;
    performanceState.lastRenderMs =
      renderMs;
    performanceState.renderAverageMs =
      lerp(
        performanceState
          .renderAverageMs,
        renderMs,
        0.045,
      );
    performanceState.renderedFrames +=
      1;
    if (
      performanceState
        .renderAverageMs > 15.2
    ) {
      performanceState.slowFrames += 1;
      performanceState.recoveryFrames =
        0;
    } else if (
      performanceState
        .renderAverageMs < 9.4
    ) {
      performanceState
        .recoveryFrames += 1;
      performanceState.slowFrames =
        Math.max(
          0,
          performanceState.slowFrames -
            2,
        );
    } else {
      performanceState.slowFrames =
        Math.max(
          0,
          performanceState.slowFrames -
            1,
        );
      performanceState.recoveryFrames =
        0;
    }
    if (
      performanceState.slowFrames > 24
    ) {
      performanceState.tier =
        performanceState.tier ===
        "high"
          ? "balanced"
          : "low";
      performanceState.slowFrames = 0;
    } else if (
      performanceState.recoveryFrames >
        360 &&
      performanceState.tier ===
        "low" &&
      performanceState
        .presentationAverageMs < 20
    ) {
      performanceState.tier =
        "balanced";
      performanceState.recoveryFrames =
        0;
    }
  }

  function recordPresentationPerformance(
    intervalMs,
  ) {
    if (
      intervalMs <= 0 ||
      intervalMs > 100
    ) {
      return;
    }
    runtimePerformance
      .lastPresentationMs =
      intervalMs;
    runtimePerformance
      .presentationAverageMs =
      lerp(
        runtimePerformance
          .presentationAverageMs,
        intervalMs,
        0.06,
      );
    if (
      runtimePerformance
        .presentationAverageMs > 23.5
    ) {
      runtimePerformance
        .presentationSlowFrames += 1;
    } else {
      runtimePerformance
        .presentationSlowFrames =
        Math.max(
          0,
          runtimePerformance
              .presentationSlowFrames -
            2,
        );
    }
    if (
      runtimePerformance
          .presentationSlowFrames >
        12 &&
      runtimePerformance.tier !==
        "low"
    ) {
      runtimePerformance.tier =
        "low";
      runtimePerformance
        .presentationSlowFrames = 0;
      runtimePerformance
        .recoveryFrames = 0;
    }
  }
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
  const JOE_AWARD_QUEUED_BARK_CONTEXTS =
    new Set([
      "change_request",
      "sprint_review",
      "counter_route",
      "blindside_transfer",
      "ball_recovery",
      "practice_shot",
      "status_request",
    ]);
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
    { cell: 2, x: -40, y: 34, width: 470, speed: 2.1, parallax: 0.035, alpha: 0.11, phase: 2.2 },
    { cell: 1, x: 480, y: 74, width: 410, speed: 8.2, parallax: 0.18, alpha: 0.12, phase: 4.8 },
    { cell: 4, x: 990, y: 42, width: 490, speed: 6.9, parallax: 0.16, alpha: 0.11, phase: 5.7 },
  ];
  const TREE_LINE_SOURCE = { x: 9, y: 373, width: 1650, height: 347 };
  const CLUBHOUSE_SOURCE = { x: 87, y: 289, width: 1516, height: 449 };
  const MOON_SOURCE = { x: 218, y: 192, width: 830, height: 840 };
  const FAR_RIDGE_SOURCE = { x: 0, y: 600, width: 1672, height: 341 };
  const DISTANT_VILLAS_SOURCE = { x: 0, y: 490, width: 1672, height: 210 };
  const ESTATE_PERIMETER_SOURCE = {
    x: 0,
    y: 200,
    width: 2172,
    height: 320,
  };
  const SIGNAGE_ATLAS_CELL = 512;
  const BUNKER_ATLAS_SOURCES = [
    { x: 0, y: 105, width: 430, height: 510 },
    { x: 415, y: 100, width: 490, height: 520 },
    { x: 890, y: 95, width: 405, height: 525 },
    { x: 1260, y: 125, width: 460, height: 470 },
    { x: 1670, y: 100, width: 502, height: 520 },
  ];
  const JOE_EXPRESSION_CELL = 512;
  const DRAIN_SOURCE = { x: 145, y: 150, width: 1384, height: 700, heightMeters: 2.35 };
  const COURSE_LENGTH = 720;
  const COURSE_MIN_Y = 0;
  const COURSE_MAX_X = 112;
  const PLAYER_COLLISION_RADIUS = 2.4;
  const BALL_MIN_RANGE = 56;
  const BALL_MAX_RANGE = 96;
  const BALL_CHARGE_SECONDS = 0.8;
  const BALL_MAX_AIM_ANGLE = 1.12;
  const BALL_RECOVERY_RADIUS = 8;
  const TEE_PRACTICE_TARGET = {
    x: 0,
    y: 94,
    radius: 18,
  };
  const TEE_PRACTICE_EXIT_Y = 80;
  const CAPTURE_REVIEW_IDS = new Set([
    "unsafe_filing",
    "floodlight_exposure",
    "open_lane_sprint",
    "upright_rough",
    "held_sightline",
    "bunker_noise",
    "sprint_noise",
    "rough_rustle",
    "audible_movement",
    "trail_chain",
    "blind_corner",
  ]);
  const OVERTIME_SCORE_MULTIPLIER = 1.3;
  const OVERTIME_JOE_SPEED_MULTIPLIER = 1.16;
  const OVERTIME_DETECTION_MULTIPLIER = 1.22;
  const CHANGE_REQUEST_BONUS = 650;
  const EMERGENCY_APPEAL_MIN_DISTANCE =
    10;
  const EMERGENCY_APPEAL_MAX_DISTANCE =
    26;
  const EMERGENCY_APPEAL_REVIEW_SECONDS =
    3.6;
  const STATUS_REQUEST_WINDOW_SECONDS =
    5.4;
  const STATUS_RESPONSE_SECONDS = 1.15;
  const STATUS_ACK_PING_SECONDS = 1.7;
  const STATUS_ESCALATION_PING_SECONDS =
    4.4;
  const CROSSWIND_WARNING_SECONDS = 1.35;
  const CROSSWIND_ACTIVE_SECONDS = 4.4;
  const CROSSWIND_NOISE_MULTIPLIER = 0.42;
  const CROSSWIND_RUN_DISTANCE = 30;
  const CROSSWIND_RUN_BONUS = 90;
  const BUNKER_TRAP_BONUS = 175;
  const DELIVERY_CHAIN_WINDOW = 14;
  const DELIVERY_CHAIN_MAX = 5;
  const DELIVERY_AWARD_QUEUE_MAX = 5;
  const DELIVERY_AWARD_QUEUED_DURATION =
    1.7;
  const SECOND_WIND_CLOSE_SECONDS =
    2.6;
  const SECOND_WIND_RAZOR_SECONDS =
    3.4;
  const SECOND_WIND_SPEED_MULTIPLIER =
    1.14;
  const ONBOARDING_CONTROL_HINT_SECONDS =
    5.5;
  const ONBOARDING_CONTROL_COLLAPSE_DISTANCE =
    18;
  const ONBOARDING_CONTROL_COLLAPSE_DELAY =
    0.65;
  const MANUAL_CONTROL_HINT_SECONDS = 8;
  const TRAIL_BREAK_MIN_CHAIN = 3;
  const TRAIL_BREAK_BONUS = 125;
  const TRAIL_COLD_SECONDS = 3.2;
  const DELIVERY_FAMILY_CAPS = {
    zone: 7,
    recovery: 3,
    bunker: 2,
    contact: 3,
    change: 1,
    review: 3,
    evidence: 2,
    intel: 3,
    maneuver: 3,
    nerve: 2,
    cadence: 3,
    status: 1,
    weather: 3,
  };
  const MOWED_MARK_SPACING = 5.2;
  const PLAYER_TRACK_SPACING = 5.6;
  const MAX_MOWED_MARKS = 150;
  const MAX_PLAYER_TRACKS = 72;
  const JOE_CUT_CLUE_MAX_AGE = 28;
  const JOE_CUT_CLUE_MAX_DISTANCE =
    120;
  const CUT_TRACE_SCAN_SECONDS = 0.55;
  const CUT_TRACE_MEMORY_SECONDS = 6;
  const MAX_LOGGED_CUT_TRACES = 12;
  const COUNTER_ROUTE_DISTANCE = 12;
  const COUNTER_ROUTE_ALIGNMENT = 0.62;
  const COUNTER_ROUTE_QUIET_SECONDS = 3.2;
  const COUNTER_ROUTE_BONUS = 95;
  const BLINDSIDE_TRANSFER_DISTANCE = 14;
  const BLINDSIDE_TRANSFER_WINDOW = 5.5;
  const BLINDSIDE_TRANSFER_COOLDOWN = 7;
  const BLINDSIDE_TRANSFER_MIN_JOE_DISTANCE = 24;
  const BLINDSIDE_TRANSFER_MAX_JOE_DISTANCE = 78;
  const BLINDSIDE_TRANSFER_BONUS = 115;
  const NERVE_HOLD_SECONDS = 1.65;
  const NERVE_HOLD_GRACE_SECONDS = 0.24;
  const NERVE_HOLD_MIN_JOE_DISTANCE = 11;
  const NERVE_HOLD_MAX_JOE_DISTANCE = 42;
  const NERVE_HOLD_COOLDOWN = 11;
  const NERVE_HOLD_BONUS = 105;
  const NERVE_EXIT_WINDOW_SECONDS = 4.4;
  const LISTENING_SEARCH_READ_MAX_DISTANCE = 126;
  const CADENCE_READ_SECONDS = 1.25;
  const CADENCE_READ_MIN_JOE_DISTANCE = 34;
  const CADENCE_READ_MAX_JOE_DISTANCE = 118;
  const CADENCE_FORECAST_SECONDS = 7;
  const CADENCE_READ_COOLDOWN = 9;
  const CADENCE_READ_BONUS = 90;
  const TENSION_DIRECTOR_GRACE_SECONDS = 8;
  const TENSION_DIRECTOR_MIN_JOE_DISTANCE = 108;
  const TENSION_DIRECTOR_WARNING_SECONDS = 2.8;
  const TENSION_DIRECTOR_RELIEF_SECONDS = 5.5;
  const TENSION_DIRECTOR_MAX_INTERCEPTS = 4;
  const HORROR_DIRECTOR_GRACE_SECONDS = 11;
  const HORROR_DIRECTOR_MIN_EVENT_SECONDS = 7.5;
  const MAX_MOWER_WORLD_PARTICLES = 190;
  const MAX_PLAYER_GROUND_RESPONSES = 18;
  const COURSE_ECHO_SAMPLE_SECONDS = 0.4;
  const MAX_COURSE_ECHO_SAMPLES = 360;
  const SPRINKLER_SOAK_SECONDS = 24;
  const WET_MOWER_SPEED_MULTIPLIER = 0.68;
  const SAND_PLAYER_SPEED_MULTIPLIER = 0.72;
  const SAND_MOWER_SPEED_MULTIPLIER = 0.76;
  const KEY_POINT = { x: -48, y: 249, radius: 16 };
  const SPRINKLER_POINT = { x: -103, y: 42, radius: 18 };
  const SHED_EXIT = { x: -18, y: 710, radius: 16 };
  const DRAIN_EXIT = { x: -78, y: 699, radius: 17 };
  const SPRINT_REVIEW_RADIUS = 13;
  const SPRINT_REVIEW_FILING_REDUCTION = 0.18;
  const ESCAPE_FILING_DURATION = {
    shed: 1.35,
    drain: 1.7,
  };
  const ESCAPE_SEAL_DURATION = 0.48;
  const SPRINKLER_SOAK_ZONES = [
    { id: "west-tee", name: "WEST TEE", x: -82, y: 61, radius: 28 },
    { id: "east-relief", name: "EAST RELIEF", x: 78, y: 181, radius: 27 },
    { id: "pond-fringe", name: "POND FRINGE", x: 4, y: 226, radius: 30 },
    { id: "clubhouse-crossing", name: "CLUBHOUSE CROSSING", x: -77, y: 323, radius: 28 },
    { id: "service-lane", name: "SERVICE LANE", x: 69, y: 419, radius: 29 },
    { id: "final-approach", name: "FINAL APPROACH", x: -77, y: 503, radius: 28 },
    { id: "night-range", name: "NIGHT RANGE", x: 73, y: 588, radius: 29 },
    { id: "release-corridor", name: "RELEASE CORRIDOR", x: -72, y: 674, radius: 29 },
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
    {
      id: "clubhouse-bunker",
      name: "CLUBHOUSE BUNKER",
      x: -70,
      y: 352,
      radiusX: 36,
      radiusY: 22,
      rakeAngle: 0.16,
    },
    {
      id: "service-bunker",
      name: "SERVICE BUNKER",
      x: 72,
      y: 438,
      radiusX: 34,
      radiusY: 21,
      rakeAngle: -0.12,
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
      id: "clubhouse_crossing",
      name: "CLUBHOUSE CROSSING",
      subtitle: "OPEN KILL ZONE",
      start: 276,
      end: 366,
      fairwayHalfWidth: 64,
      tint: "38,29,18",
      cue: "CLUBHOUSE CROSSING — bright windows and open ground leave almost nowhere to disappear.",
    },
    {
      id: "maintenance_maze",
      name: "SERVICE MAZE",
      subtitle: "BACKLOG OF BLIND CORNERS",
      start: 366,
      end: 455,
      fairwayHalfWidth: 51,
      tint: "23,34,18",
      cue: "SERVICE MAZE — tight maintenance lanes reward listening and punish sprinting blind.",
    },
    {
      id: "dead_green",
      name: "THE DEAD GREEN",
      subtitle: "FALSE FINISH",
      start: 455,
      end: 545,
      fairwayHalfWidth: 62,
      tint: "44,24,14",
      cue: "THE DEAD GREEN — the old finish is gone. The release moved deeper into the dark.",
    },
    {
      id: "night_range",
      name: "NIGHT RANGE",
      subtitle: "FLOODLIGHT CROSSFIRE",
      start: 545,
      end: 635,
      fairwayHalfWidth: 66,
      tint: "16,31,37",
      cue: "NIGHT RANGE — cross the lit lanes or spend time threading the abandoned carts.",
    },
    {
      id: "release_corridor",
      name: "RELEASE CORRIDOR",
      subtitle: "SHIP OR SLIP",
      start: 635,
      end: COURSE_LENGTH + 1,
      fairwayHalfWidth: 50,
      tint: "48,21,14",
      cue: "RELEASE CORRIDOR — the exits are close, the lanes are narrow, and Joe is cutting across them.",
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
    {
      key: "A# MINOR",
      rootHz: 29.14,
      accent: "145,101,51",
    },
    {
      key: "A DIMINISHED",
      rootHz: 27.5,
      accent: "166,63,38",
    },
    {
      key: "G# LOCRIAN",
      rootHz: 25.96,
      accent: "72,123,146",
    },
    {
      key: "G DIMINISHED",
      rootHz: 24.5,
      accent: "178,55,36",
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
    { id: "clubhouse-balls", type: 3, x: -102, y: 282, scale: 0.92 },
    { id: "clubhouse-tools", type: 4, x: 104, y: 312, scale: 0.96 },
    { id: "clubhouse-bag", type: 1, x: -104, y: 348, scale: 0.9 },
    { id: "maze-stone", type: 0, x: 103, y: 378, scale: 0.86 },
    { id: "maze-hose", type: 2, x: -104, y: 402, scale: 0.93 },
    { id: "maze-tools", type: 4, x: 103, y: 438, scale: 0.98 },
    { id: "dead-balls", type: 3, x: -102, y: 468, scale: 0.92 },
    { id: "dead-bag", type: 1, x: 104, y: 494, scale: 0.94 },
    { id: "shed-clippings", type: 5, x: -105, y: 526, scale: 1.02 },
    { id: "range-balls-west", type: 3, x: -104, y: 556, scale: 0.96 },
    { id: "range-bag-east", type: 1, x: 104, y: 579, scale: 1.02 },
    { id: "range-tools-west", type: 4, x: -102, y: 607, scale: 0.96 },
    { id: "range-hose-east", type: 2, x: 105, y: 628, scale: 0.92 },
    { id: "release-stone-west", type: 0, x: -104, y: 650, scale: 0.92 },
    { id: "release-clippings-east", type: 5, x: 104, y: 676, scale: 1.06 },
    { id: "release-bag-west", type: 1, x: -103, y: 704, scale: 0.96 },
  ];
  const COURSE_VERGE_CELLS = [
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
  const COURSE_VERGE = [
    { id: "tee-ferns-west", type: 2, x: -88, y: 22, scale: 0.94 },
    { id: "tee-fescue-east", type: 0, x: 88, y: 48, scale: 0.92 },
    { id: "tee-juniper-west", type: 4, x: -87, y: 76, scale: 0.88 },
    { id: "audit-flowers-east", type: 3, x: 86, y: 104, scale: 0.92 },
    { id: "audit-ferns-west", type: 2, x: -89, y: 132, scale: 0.96 },
    { id: "audit-juniper-east", type: 4, x: 88, y: 160, scale: 0.9 },
    { id: "water-reeds-west", type: 1, x: -87, y: 194, scale: 1.02 },
    { id: "water-reeds-east", type: 1, x: 89, y: 222, scale: 0.96 },
    { id: "water-ferns-west", type: 2, x: -88, y: 248, scale: 0.92 },
    { id: "water-fescue-east", type: 0, x: 87, y: 271, scale: 0.9 },
    { id: "club-flowers-west", type: 3, x: -88, y: 295, scale: 0.96 },
    { id: "club-ferns-east", type: 2, x: 88, y: 324, scale: 0.9 },
    { id: "club-juniper-west", type: 4, x: -87, y: 354, scale: 0.94 },
    { id: "maze-ferns-east", type: 2, x: 89, y: 383, scale: 0.94 },
    { id: "maze-fescue-west", type: 0, x: -88, y: 414, scale: 0.92 },
    { id: "maze-reeds-east", type: 1, x: 87, y: 446, scale: 0.88 },
    { id: "dead-rough-west-a", type: 5, x: -88, y: 468, scale: 1.02 },
    { id: "dead-rough-east-a", type: 5, x: 89, y: 493, scale: 0.94 },
    { id: "dead-rough-west-b", type: 5, x: -87, y: 520, scale: 0.9 },
    { id: "dead-rough-east-b", type: 5, x: 88, y: 540, scale: 1.04 },
    { id: "range-juniper-west", type: 4, x: -88, y: 560, scale: 0.96 },
    { id: "range-flowers-east", type: 3, x: 89, y: 581, scale: 0.9 },
    { id: "range-ferns-west", type: 2, x: -88, y: 608, scale: 0.92 },
    { id: "range-juniper-east", type: 4, x: 87, y: 630, scale: 0.94 },
    { id: "release-rough-west", type: 5, x: -88, y: 648, scale: 0.9 },
    { id: "release-juniper-east", type: 4, x: 89, y: 672, scale: 0.92 },
    { id: "release-flowers-west", type: 3, x: -87, y: 696, scale: 0.88 },
    { id: "release-ferns-east", type: 2, x: 88, y: 716, scale: 0.96 },
  ];
  const DEAD_GREEN_SCENERY = [
    { id: "dead-grass-west", type: 0, x: -103, y: 466, scale: 1.08, landmark: "withered rough" },
    { id: "warning-flag", type: 1, x: 46, y: 478, scale: 0.96, landmark: "torn warning flag" },
    { id: "burst-sprinkler", type: 2, x: -28, y: 496, scale: 1.05, landmark: "burst sprinkler" },
    { id: "dead-grass-east", type: 0, x: 104, y: 502, scale: 1.14, landmark: "dead boundary grass" },
    { id: "dead-topiary", type: 3, x: -58, y: 513, scale: 1.02, landmark: "dead topiary" },
    { id: "finish-flag", type: 1, x: 16, y: 515, scale: 0.82, landmark: "final warning flag" },
    { id: "snapped-sign", type: 4, x: -34, y: 524, scale: 0.96, landmark: "snapped course sign" },
    { id: "mower-wreck", type: 5, x: 71, y: 526, scale: 1.08, landmark: "mower wreck" },
    { id: "dead-grass-left-finish", type: 0, x: -86, y: 535, scale: 0.92, landmark: "withered rough" },
    { id: "dead-grass-finish", type: 0, x: 106, y: 537, scale: 0.98, landmark: "withered rough" },
    { id: "range-warning-flag", type: 1, x: -48, y: 552, scale: 0.9, landmark: "range warning flag" },
    { id: "range-sprinkler", type: 2, x: 88, y: 574, scale: 0.94, landmark: "leaking range sprinkler" },
    { id: "range-topiary", type: 3, x: -92, y: 600, scale: 0.9, landmark: "range silhouette" },
    { id: "range-snapped-sign", type: 4, x: 55, y: 621, scale: 0.92, landmark: "range sign" },
    { id: "release-dead-grass-west", type: 0, x: -105, y: 642, scale: 1.08, landmark: "release rough" },
    { id: "release-warning-flag", type: 1, x: 76, y: 660, scale: 0.88, landmark: "release warning flag" },
    { id: "release-mower-wreck", type: 5, x: -62, y: 682, scale: 1.02, landmark: "abandoned mower" },
    { id: "release-dead-grass-east", type: 0, x: 104, y: 706, scale: 1.12, landmark: "finish rough" },
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
    { id: "clubhouse-cart", kit: "expanded", type: 1, x: 78, y: 293, radius: 18, radiusX: 20, radiusY: 8, coverRadius: 27, scale: 0.98, blocks: true, sight: true, landmark: "overturned cart" },
    { id: "clubhouse-arch", kit: "expanded", type: 0, x: 0, y: 310, radius: 0, scale: 1.02, blocks: false, sight: false, landmark: "clubhouse hedge tunnel" },
    { id: "clubhouse-arch-left", x: -35, y: 310, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "clubhouse hedge tunnel" },
    { id: "clubhouse-arch-right", x: 35, y: 310, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "clubhouse hedge tunnel" },
    { id: "clubhouse-board", kit: "expanded", type: 4, x: -77, y: 317, radius: 11, radiusX: 7, radiusY: 5, coverRadius: 19, scale: 0.88, blocks: true, sight: true, landmark: "audit board" },
    { id: "clubhouse-stone", asset: "stone-cover", kit: "base", type: 1, x: 54, y: 343, radius: 17, radiusX: 19, radiusY: 8, coverRadius: 24, scale: 0.96, blocks: true, sight: true, landmark: "clubhouse stone cover" },
    { id: "service-hedge-west", asset: "hedge-hide", kit: "base", type: 0, x: -87, y: 382, radius: 18, radiusX: 22, radiusY: 8, coverRadius: 28, scale: 1.04, blocks: true, sight: true, landmark: "service hedge" },
    { id: "service-pine-east", kit: "base", type: 2, x: 91, y: 397, radius: 19, radiusX: 7.5, radiusY: 7.5, coverRadius: 28, scale: 0.95, blocks: true, sight: true, landmark: "service pine" },
    { id: "maze-cart", kit: "expanded", type: 1, x: -58, y: 409, radius: 18, radiusX: 20, radiusY: 8, coverRadius: 27, scale: 1.02, blocks: true, sight: true, landmark: "abandoned service cart" },
    { id: "service-arch", kit: "expanded", type: 0, x: 12, y: 421, radius: 0, scale: 1.04, blocks: false, sight: false, landmark: "service hedge tunnel" },
    { id: "service-arch-left", x: -23, y: 421, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "service hedge tunnel" },
    { id: "service-arch-right", x: 47, y: 421, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "service hedge tunnel" },
    { id: "service-board", kit: "expanded", type: 4, x: 72, y: 444, radius: 11, radiusX: 7, radiusY: 5, coverRadius: 19, scale: 0.92, blocks: true, sight: true, landmark: "sprint board" },
    { id: "service-pond", kit: "expanded", type: 2, x: -74, y: 451, radius: 22, radiusX: 25, radiusY: 11, coverRadius: 29, scale: 1.08, blocks: true, sight: true, landmark: "service runoff" },
    { id: "final-arch", kit: "expanded", type: 0, x: 0, y: 478, radius: 0, scale: 1.02, blocks: false, sight: false, landmark: "final hedge tunnel" },
    { id: "final-arch-left", x: -35, y: 478, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "final hedge tunnel" },
    { id: "final-arch-right", x: 35, y: 478, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "final hedge tunnel" },
    { id: "final-board", kit: "expanded", type: 4, x: -77, y: 497, radius: 11, radiusX: 7, radiusY: 5, coverRadius: 19, scale: 0.88, blocks: true, sight: true, landmark: "final audit board" },
    { id: "dead-green-pine", kit: "base", type: 2, x: 94, y: 514, radius: 20, radiusX: 8, radiusY: 8, coverRadius: 29, scale: 1.03, blocks: true, sight: true, landmark: "dead pine" },
    { id: "range-entry-arch", kit: "expanded", type: 0, x: 0, y: 552, radius: 0, scale: 1.08, blocks: false, sight: false, landmark: "night range arch" },
    { id: "range-entry-left", x: -35, y: 552, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "night range arch" },
    { id: "range-entry-right", x: 35, y: 552, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "night range arch" },
    { id: "range-cart-west", kit: "expanded", type: 1, x: -63, y: 573, radius: 18, radiusX: 20, radiusY: 8, coverRadius: 27, scale: 1.04, blocks: true, sight: true, landmark: "range cart" },
    { id: "range-light-west", kit: "expanded", type: 5, x: -72, y: 592, radius: 6, radiusX: 4.5, radiusY: 4.5, coverRadius: 11, lightRadius: 54, scale: 0.98, blocks: true, sight: false, landmark: "west range floodlight" },
    { id: "range-light-center", kit: "expanded", type: 5, x: 0, y: 594, radius: 6, radiusX: 4.5, radiusY: 4.5, coverRadius: 11, lightRadius: 61, scale: 1.08, blocks: true, sight: false, landmark: "center range floodlight" },
    { id: "range-light-east", kit: "expanded", type: 5, x: 72, y: 592, radius: 6, radiusX: 4.5, radiusY: 4.5, coverRadius: 11, lightRadius: 54, scale: 0.98, blocks: true, sight: false, landmark: "east range floodlight" },
    { id: "range-cart-east", kit: "expanded", type: 1, x: 60, y: 610, radius: 18, radiusX: 20, radiusY: 8, coverRadius: 27, scale: 0.98, blocks: true, sight: true, landmark: "overturned range cart" },
    { id: "range-exit-arch", kit: "expanded", type: 0, x: 24, y: 627, radius: 0, scale: 1.06, blocks: false, sight: false, landmark: "release intake" },
    { id: "range-exit-left", x: -11, y: 627, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "release intake" },
    { id: "range-exit-right", x: 59, y: 627, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "release intake" },
    { id: "release-hedge-west", asset: "hedge-hide", kit: "base", type: 0, x: -88, y: 646, radius: 18, radiusX: 22, radiusY: 8, coverRadius: 28, scale: 1.06, blocks: true, sight: true, landmark: "release hedge" },
    { id: "release-cart", kit: "expanded", type: 1, x: -44, y: 657, radius: 18, radiusX: 20, radiusY: 8, coverRadius: 27, scale: 1.02, blocks: true, sight: true, landmark: "release cart" },
    { id: "release-board", kit: "expanded", type: 4, x: 76, y: 670, radius: 11, radiusX: 7, radiusY: 5, coverRadius: 19, scale: 0.96, blocks: true, sight: true, landmark: "release board" },
    { id: "release-stone", asset: "stone-cover", kit: "base", type: 1, x: 42, y: 680, radius: 17, radiusX: 19, radiusY: 8, coverRadius: 24, scale: 1.02, blocks: true, sight: true, landmark: "release stone cover" },
    { id: "release-arch", kit: "expanded", type: 0, x: -18, y: 694, radius: 0, scale: 1.04, blocks: false, sight: false, landmark: "final release gate" },
    { id: "release-arch-left", x: -53, y: 694, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "final release gate" },
    { id: "release-arch-right", x: 17, y: 694, radius: 15, radiusX: 15, radiusY: 7, coverRadius: 23, blocks: true, sight: true, draw: false, landmark: "final release gate" },
    { id: "release-pine", kit: "base", type: 2, x: 94, y: 702, radius: 20, radiusX: 8, radiusY: 8, coverRadius: 29, scale: 1.04, blocks: true, sight: true, landmark: "release pine" },
    { id: "shed-left-wall", x: -42, y: 710, radius: 11, radiusX: 8.5, radiusY: 8, coverRadius: 22, blocks: true, sight: true, draw: false, landmark: "shed wall" },
    { id: "shed-right-wall", x: 6, y: 710, radius: 11, radiusX: 8.5, radiusY: 8, coverRadius: 22, blocks: true, sight: true, draw: false, landmark: "shed wall" },
  ];
  const COURSE_OBSTACLE_INDEX =
    new Map();
  const COURSE_FLOODLIGHTS = [];
  for (
    let index = 0;
    index < COURSE_OBSTACLES.length;
    index += 1
  ) {
    const obstacle =
      COURSE_OBSTACLES[index];
    COURSE_OBSTACLE_INDEX.set(
      obstacle,
      index,
    );
    if (obstacle.lightRadius) {
      COURSE_FLOODLIGHTS.push({
        obstacle,
        obstacleIndex: index,
      });
    }
  }
  const PRIMARY_FLOODLIGHT =
    COURSE_OBSTACLES.find(
      (obstacle) =>
        obstacle.id === "floodlight",
    );
  const JOE_NAVIGATION_CLEARANCE = 2.2;
  const JOE_NAVIGATION_GRID = 6;
  const JOE_NAVIGATION_REPATH_SECONDS = 0.42;
  const JOE_PATROL_ROUTE = [
    { x: 44, y: 185 },
    { x: 45, y: 215 },
    { x: 0, y: 230 },
    { x: -90, y: 250 },
    { x: -82, y: 315 },
    { x: 34, y: 338 },
    { x: 92, y: 365 },
    { x: 82, y: 410 },
    { x: 0, y: 432 },
    { x: -92, y: 452 },
    { x: -82, y: 505 },
    { x: -20, y: 525 },
    { x: 54, y: 565 },
    { x: -42, y: 585 },
    { x: 86, y: 612 },
    { x: 20, y: 640 },
    { x: -76, y: 666 },
    { x: -16, y: 696 },
    { x: 58, y: 706 },
    { x: 96, y: 680 },
    { x: 74, y: 630 },
    { x: 62, y: 565 },
    { x: 96, y: 470 },
    { x: 42, y: 425 },
    { x: -82, y: 390 },
    { x: -92, y: 315 },
    { x: -102, y: 250 },
    { x: -96, y: 195 },
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
      reviews: [
        { id: "review-a", code: "REVIEW A", x: -18, y: 350, radius: SPRINT_REVIEW_RADIUS },
        { id: "review-b", code: "REVIEW B", x: 10, y: 448, radius: SPRINT_REVIEW_RADIUS },
        { id: "review-c", code: "RELEASE REVIEW", x: -42, y: 614, radius: SPRINT_REVIEW_RADIUS },
      ],
      keyHint: "FIND KEY WEST OF WATER",
      joeStart: {
        x: 44,
        y: 185,
        patrolIndex: 0,
        hold: 2.4,
      },
      statusRequest: {
        code: "SR-01",
        label: "SPRINT STATUS",
        request:
          "REPORT DELIVERY STATUS",
        triggerY: 292,
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
      reviews: [
        { id: "review-a", code: "REVIEW A", x: 18, y: 350, radius: SPRINT_REVIEW_RADIUS },
        { id: "review-b", code: "REVIEW B", x: -8, y: 448, radius: SPRINT_REVIEW_RADIUS },
        { id: "review-c", code: "RELEASE REVIEW", x: 20, y: 614, radius: SPRINT_REVIEW_RADIUS },
      ],
      keyHint: "FIND KEY BY FLOODLIGHT",
      joeStart: {
        x: -90,
        y: 250,
        patrolIndex: 4,
        hold: 1.8,
      },
      statusRequest: {
        code: "SR-02",
        label: "DEPENDENCY CHECK",
        request:
          "CONFIRM ACTIVE BLOCKERS",
        triggerY: 388,
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
      reviews: [
        { id: "review-a", code: "REVIEW A", x: 0, y: 338, radius: SPRINT_REVIEW_RADIUS },
        { id: "review-b", code: "REVIEW B", x: 18, y: 446, radius: SPRINT_REVIEW_RADIUS },
        { id: "review-c", code: "RELEASE REVIEW", x: -36, y: 610, radius: SPRINT_REVIEW_RADIUS },
      ],
      keyHint: "FIND KEY IN AUDIT ROW",
      joeStart: {
        x: 20,
        y: 345,
        patrolIndex: 7,
        hold: 1.25,
      },
      statusRequest: {
        code: "SR-03",
        label: "RELEASE READINESS",
        request:
          "CONFIRM EXIT FORECAST",
        triggerY: 486,
      },
      briefing:
        "KEY IN AUDIT ROW  •  VALVE AT EAST WATER EDGE  •  JOE GUARDS EXITS",
      accent: "#77b9aa",
    },
  ];

  function freshStatusRequest(
    variant,
  ) {
    const definition =
      variant.statusRequest;
    return {
      code: definition.code,
      label: definition.label,
      request: definition.request,
      triggerY: definition.triggerY,
      issued: false,
      active: false,
      resolved: false,
      outcome: null,
      timer: 0,
      duration:
        STATUS_REQUEST_WINDOW_SECONDS,
      responding: false,
      responseProgress: 0,
      responseDuration:
        STATUS_RESPONSE_SECONDS,
      responseCancels: 0,
      urgentCuePlayed: false,
      location: null,
      joeLine: null,
      issuedAt: null,
      resolvedAt: null,
    };
  }

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

  function activeSprintReviews() {
    return activeRunVariant()
      .reviews || [];
  }

  function sprintReviewCleared(review) {
    return Boolean(
      state.hole?.reviewsCleared?.includes(
        review.id,
      ),
    );
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

  function freshPracticeDrill(enabled) {
    return {
      active: enabled,
      completed: false,
      reclaimed: false,
      stage: enabled
        ? "chip_at_bell"
        : "already_learned",
      target: {
        ...TEE_PRACTICE_TARGET,
      },
      attempts: 0,
      misses: 0,
      landedBallId: null,
    };
  }

  function freshNavigationGuide() {
    return {
      targetId: null,
      targetLabel: null,
      targetColor: "#d8b46b",
      target: null,
      approach: null,
      path: [],
      lastPlayerX: Infinity,
      lastPlayerY: Infinity,
      refreshTimer: 0,
      direction: "STRAIGHT",
      distance: 0,
    };
  }

  function freshTensionDirector() {
    return {
      pressure: 0.08,
      quietSeconds: 0,
      beatTimer: 10.5,
      cooldownSeconds: 4,
      reliefSeconds: 0,
      pendingIntercept: null,
      beatCount: 0,
      warningCount: 0,
      interceptCount: 0,
      cancelledIntercepts: 0,
      lastInterceptZone: -1,
      observedZone: 0,
      lastBeat: "opening_grace",
      lastBeatSeconds: 0,
    };
  }

  function freshHorrorDirector() {
    return {
      intensity: 0.04,
      eventTimer: 12.5,
      fogSurgeSeconds: 0,
      lightFailureSeconds: 0,
      manifestation: null,
      eventCount: 0,
      apparitionCount: 0,
      fogSurgeCount: 0,
      lightFailureCount: 0,
      observedZone: 0,
      lastEvent: "opening_stillness",
      lastEventSeconds: 0,
    };
  }

  function freshCrosswind(
    variantIndex = 0,
  ) {
    return {
      phase: "calm",
      timer:
        13.5 +
        variantIndex * 1.8,
      direction:
        variantIndex % 2 === 0
          ? 1
          : -1,
      eventCount: 0,
      lastZone: -1,
      maskedSeconds: 0,
      currentDistance: 0,
      totalMaskedDistance: 0,
      windRuns: 0,
      awardGiven: false,
      lastTravelDistance: 0,
      lastOutcome: null,
    };
  }

  function freshNerveHold() {
    return {
      progress: 0,
      active: false,
      armed: false,
      completions: 0,
      cooldown: 0,
      lastZone: null,
      joeDistance: null,
      graceRemaining: 0,
      interruption: null,
      exitWindow: 0,
      blockedReason:
        "not_concealed",
      tutorialShown: false,
    };
  }

  function freshCadenceRead() {
    return {
      progress: 0,
      armed: false,
      active: false,
      completions: 0,
      cooldown: 0,
      lastZone: null,
      joeDistance: null,
      blockedReason:
        "not_in_shelter",
      tutorialShown: false,
      forecast: null,
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
        golfLessonCompleted:
          parsed.golfLessonCompleted === true,
        lastCaptureCause:
          CAPTURE_REVIEW_IDS.has(
            parsed.lastCaptureCause,
          )
            ? parsed.lastCaptureCause
            : null,
        captureCauseStreak:
          Number.isFinite(
            parsed.captureCauseStreak,
          )
            ? clamp(
                Math.round(
                  parsed.captureCauseStreak,
                ),
                0,
                99,
              )
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
        golfLessonCompleted: false,
        lastCaptureCause: null,
        captureCauseStreak: 0,
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
    status: "One last action item. One locked gate.",
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
      appealUsed: false,
      appealWindowSeen: false,
      appealWindowWasEligible: false,
      appealDocument: null,
      appealReviewTimer: 0,
      appealActivationDistance: null,
      reviewsCleared: [],
      reviewRewards: 0,
      filingReduction: 0,
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
      practiceDrill:
        freshPracticeDrill(
          !savedCareer.golfLessonCompleted,
        ),
      prompt: "",
      message: "South gate locked. Find the shed key — or open the drain.",
      messageTimer: 4,
      elapsed: 0,
      tutorialVisible: true,
      tutorialPage: 0,
      quickRematch: false,
      rematchTarget: null,
      hasMoved: false,
      cameraMotion:
        freshCourseCameraMotion(),
      panicMomentum: 0,
      panicTarget: 0,
      moveVector: { x: 0, y: 0 },
      moveHintTimer: 0,
      controlHintTimer: 12,
      controlHintSource: "onboarding",
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
      captureReview: null,
      lastJoeContact: null,
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
      groundResponses: [],
      playerStepSerial: 0,
      turfMarks: [],
      nextTurfMarkId: 1,
      lastPlayerTrackDistance: 0,
      tracksCreated: 0,
      tracksDiscovered: 0,
      trackTutorialShown: false,
      trailWarningTimer: 0,
      trailDiscoveryCooldown: 0,
      trailChain: 0,
      trailChainTimer: 0,
      trailTarget: null,
      trailApproachTimer: 0,
      trailBreaks: 0,
      bestTrailBreak: 0,
      trailColdTimer: 0,
      cutTraceProgress: 0,
      cutTraceCandidateId: null,
      cutTraceMemory: null,
      cutTraceLocks: 0,
      cutTraceLoggedIds: [],
      cutTraceCueCooldown: 0,
      counterRoutes: 0,
      counterRouteQuietTimer: 0,
      blindsideTransfers: 0,
      blindsideTransfer: null,
      blindsideTransferCooldown: 0,
      blindsidePreviousShelter: null,
      blindsidePreview: null,
      blindsidePreviewRefresh: 0,
      blindsideTutorialShown: false,
      nerveHold:
        freshNerveHold(),
      cadenceRead:
        freshCadenceRead(),
      zoneIndex: 0,
      zoneBannerTimer: 0,
      zoneVisits: COURSE_ZONES.map(
        (zone, index) =>
          index === 0 ? 1 : 0,
      ),
      blackoutTimer: 0,
      dreadTimer: 0,
      tensionDirector:
        freshTensionDirector(),
      horrorDirector:
        freshHorrorDirector(),
      crosswind:
        freshCrosswind(0),
      statusRequest:
        freshStatusRequest(
          RUN_VARIANTS[0],
        ),
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
      secondWindTimer: 0,
      secondWindDuration: 0,
      secondWindActivations: 0,
      deliveryChain: 0,
      deliveryPeak: 0,
      deliveryTimer: 0,
      deliveryBonus: 0,
      deliveryEvents: [],
      deliveryFamilyCounts: {},
      deliveryAward: null,
      deliveryAwardQueue: [],
      deliveryAwardOverflowMerges: 0,
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
  let lastPresentedFrame =
    lastFrame;
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
        : label.includes("SPRINT REVIEW")
          ? "review"
        : label.includes("STATUS ACKNOWLEDGED")
          ? "status"
        : label.includes("CROSSWIND")
          ? "weather"
        : label.includes("COUNTER-ROUTE")
          ? "intel"
        : label.includes("BLINDSIDE")
          ? "maneuver"
        : label.includes("NERVE HELD")
          ? "nerve"
        : label.includes("CADENCE")
          ? "cadence"
        : label.includes("RECOVERY") ||
            label.includes("BALL RECOVERED")
          ? "recovery"
          : label.includes("EVIDENCE")
            ? "evidence"
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
    const award = {
      label,
      amount,
      chain:
        hole.deliveryChain,
      multiplier,
      age: 0,
      duration: 2.15,
      mergedCount: 1,
    };
    if (!hole.deliveryAward) {
      hole.deliveryAward = award;
    } else if (
      hole.deliveryAwardQueue.length <
      DELIVERY_AWARD_QUEUE_MAX
    ) {
      hole.deliveryAwardQueue.push({
        ...award,
        duration:
          DELIVERY_AWARD_QUEUED_DURATION,
      });
    } else {
      const queuedTail =
        hole.deliveryAwardQueue[
          hole.deliveryAwardQueue.length -
            1
        ];
      queuedTail.label =
        "DELIVERY STACK";
      queuedTail.amount += amount;
      queuedTail.chain =
        award.chain;
      queuedTail.multiplier =
        award.multiplier;
      queuedTail.mergedCount += 1;
      hole.deliveryAwardOverflowMerges +=
        1;
    }
    return award;
  }

  function calculateRunResult(route) {
    const hole = state.hole;
    const variant = activeRunVariant();
    const timeBonus = Math.max(
      0,
      Math.round((270 - hole.elapsed) * 9),
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
      appealUsed: hole.appealUsed,
      appealCode:
        hole.appealDocument?.code || null,
      appealForfeitedBonus:
        hole.appealUsed
          ? CHANGE_REQUEST_BONUS
          : 0,
      appealActivationDistance:
        hole.appealActivationDistance,
      crosswindRuns:
        hole.crosswind.windRuns,
      crosswindMaskedSeconds:
        hole.crosswind.maskedSeconds,
      crosswindMaskedDistance:
        hole.crosswind.totalMaskedDistance,
      statusRequestOutcome:
        hole.statusRequest.outcome,
      statusAcknowledged:
        hole.statusRequest.outcome ===
        "acknowledged",
      statusEscalated:
        hole.statusRequest.outcome ===
        "escalated",
      statusResponseCancels:
        hole.statusRequest.responseCancels,
      statusRequestCode:
        hole.statusRequest.code,
      statusRequestLocation:
        hole.statusRequest.location
          ? {
              ...hole.statusRequest.location,
            }
          : null,
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
      nerveHolds:
        hole.nerveHold.completions,
      cadenceReads:
        hole.cadenceRead.completions,
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

  function snapshotJoeContact(
    source,
    environment,
    playerDistance,
    moving,
  ) {
    state.hole.lastJoeContact = {
      source,
      at: state.hole.elapsed,
      zoneId: environment.zone.id,
      zoneName: environment.zone.name,
      surface: environment.turfLabel,
      sprinting:
        moving &&
        !state.hole.crouched &&
        sprintHeld(),
      crouched: state.hole.crouched,
      rough: environment.effectiveRough,
      sand: environment.sand,
      wet: environment.wet,
      hardCover: environment.hardCover,
      lightExposure: Number(
        environment.lightExposure.toFixed(
          2,
        ),
      ),
      noise: Number(
        state.hole.noise.toFixed(2),
      ),
      distance: Number(
        playerDistance.toFixed(1),
      ),
    };
  }

  function createCaptureReview(
    capturedDuringFiling,
  ) {
    const hole = state.hole;
    const currentZone =
      courseZoneAt(state.player.y);
    const contact =
      hole.lastJoeContact &&
      hole.elapsed -
          hole.lastJoeContact.at <=
        6.5
        ? hole.lastJoeContact
        : null;
    const zoneName =
      contact?.zoneName ||
      currentZone.name;
    const makeReview = (
      id,
      label,
      shortLabel,
      source,
      evidence,
      counterplay,
    ) => ({
      id,
      label,
      shortLabel,
      source,
      zoneId:
        contact?.zoneId ||
        currentZone.id,
      zoneName,
      evidence,
      counterplay,
      repeatCount: 1,
    });

    if (capturedDuringFiling) {
      return makeReview(
        "unsafe_filing",
        "UNSAFE FINAL FILING",
        "CLEAR FILING",
        "objective_commitment",
        `Joe reached the exit while Final Filing was active in ${zoneName}.`,
        "Create distance or divert Joe before filing; movement can abort the attempt.",
      );
    }
    if (
      contact?.source === "sight"
    ) {
      if (
        contact.lightExposure >= 0.36
      ) {
        return makeReview(
          "floodlight_exposure",
          "FLOODLIGHT EXPOSURE",
          "LEAVE LIGHT",
          "sight",
          `The ${zoneName} light held your silhouette at ${Math.round(contact.distance)}m.`,
          "Leave the lit lane, crouch in rough, or put solid cover between you and Joe.",
        );
      }
      if (contact.sprinting) {
        return makeReview(
          "open_lane_sprint",
          "OPEN-LANE SPRINT",
          "COVER SPRINT",
          "sight",
          `Joe held sight while you sprinted across ${zoneName}.`,
          "Sprint between cover, not through Joe's view; stop once attention begins rising.",
        );
      }
      if (
        contact.rough &&
        !contact.crouched
      ) {
        return makeReview(
          "upright_rough",
          "UPRIGHT IN ROUGH",
          "CROUCH ROUGH",
          "sight",
          `Standing movement exposed you inside ${contact.surface}.`,
          "Crouch to use rough concealment, then move only after the mower turns away.",
        );
      }
      return makeReview(
        "held_sightline",
        "SIGHTLINE HELD",
        "BREAK SIGHT",
        "sight",
        `Joe maintained visual contact through ${zoneName}.`,
        "Cut behind solid cover and remain quiet until the contact-break meter clears.",
      );
    }
    if (
      contact?.source === "sound"
    ) {
      if (contact.sand) {
        return makeReview(
          "bunker_noise",
          "BUNKER NOISE",
          "LEAVE SAND",
          "sound",
          `Your ${contact.surface} crossing stayed audible at ${Math.round(contact.distance)}m.`,
          "Cross sand only after a lure; crouch or return to fairway when Joe reacts.",
        );
      }
      if (contact.sprinting) {
        return makeReview(
          "sprint_noise",
          "SPRINT NOISE",
          "CROUCH / STOP",
          "sound",
          `Your sprint remained inside Joe's hearing range in ${zoneName}.`,
          "Stop or crouch when the mower reacts; resume only after attention falls.",
        );
      }
      if (contact.rough) {
        return makeReview(
          "rough_rustle",
          "ROUGH RUSTLE",
          "CHANGE TURF",
          "sound",
          `Upright movement made ${contact.surface} betray your route.`,
          "Crouch through rough or cross onto Joe's quieter cut strip to end the noise.",
        );
      }
      return makeReview(
        "audible_movement",
        "AUDIBLE MOVEMENT",
        "STOP / LISTEN",
        "sound",
        `Joe followed movement noise through ${zoneName}.`,
        "Stop, crouch, or change direction when the mower reacts to sound.",
      );
    }
    if (
      contact?.source === "trail" ||
      hole.trailChain > 0 ||
      hole.trailWarningTimer > 0
    ) {
      return makeReview(
        "trail_chain",
        "TRAIL CHAIN",
        "CROSS CUT",
        "trail",
        `Joe followed ${Math.max(1, hole.trailChain)} physical print${hole.trailChain === 1 ? "" : "s"} into ${zoneName}.`,
        "Cross fairway or Joe's cut turf to break the print chain before hiding.",
      );
    }
    return makeReview(
      "blind_corner",
      "BLIND CORNER",
      "LISTEN FIRST",
      "proximity",
      `Joe reached you without a fresh sight, sound, or trail signal in ${zoneName}.`,
      "Use Listening Focus before blind turns and keep a second cover route available.",
    );
  }

  function recordCapture(
    review,
  ) {
    state.career.captures += 1;
    if (state.hole.overtime) {
      state.career.overtimeCaptures += 1;
    }
    if (review) {
      const repeated =
        state.career
          .lastCaptureCause ===
        review.id;
      state.career.captureCauseStreak =
        repeated
          ? Math.min(
              99,
              state.career
                .captureCauseStreak + 1,
            )
          : 1;
      state.career.lastCaptureCause =
        review.id;
      review.repeatCount =
        state.career.captureCauseStreak;
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
    state.career.lastCaptureCause =
      null;
    state.career.captureCauseStreak =
      0;
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

  const mowerWakeStampCache =
    new Map();

  function mowerWakeStamp(
    freshness,
    variant,
  ) {
    const cacheKey =
      `${freshness}:${variant}`;
    if (
      mowerWakeStampCache.has(
        cacheKey,
      )
    ) {
      return mowerWakeStampCache.get(
        cacheKey,
      );
    }
    const stamp =
      document.createElement("canvas");
    stamp.width = 192;
    stamp.height = 48;
    const stampCtx =
      stamp.getContext("2d");
    stampCtx.imageSmoothingEnabled =
      false;
    const outerColor =
      freshness === "fresh"
        ? "#111c15"
        : freshness === "warm"
          ? "#121a14"
          : "#141a15";
    const cutColor =
      freshness === "fresh"
        ? "#33472f"
        : freshness === "warm"
          ? "#2a3928"
          : "#223025";
    const centerColor =
      freshness === "fresh"
        ? "#43563a"
        : freshness === "warm"
          ? "#35452f"
          : "#29372a";
    stampCtx.fillStyle = outerColor;
    stampCtx.beginPath();
    stampCtx.moveTo(3, 22);
    stampCtx.lineTo(12, 15);
    stampCtx.lineTo(38, 11);
    stampCtx.lineTo(78, 12);
    stampCtx.lineTo(116, 10);
    stampCtx.lineTo(157, 12);
    stampCtx.lineTo(183, 17);
    stampCtx.lineTo(190, 24);
    stampCtx.lineTo(183, 31);
    stampCtx.lineTo(156, 36);
    stampCtx.lineTo(116, 38);
    stampCtx.lineTo(77, 36);
    stampCtx.lineTo(38, 37);
    stampCtx.lineTo(12, 32);
    stampCtx.lineTo(3, 26);
    stampCtx.closePath();
    stampCtx.fill();
    stampCtx.fillStyle = cutColor;
    stampCtx.beginPath();
    stampCtx.moveTo(10, 22);
    stampCtx.lineTo(24, 17);
    stampCtx.lineTo(67, 15);
    stampCtx.lineTo(112, 14);
    stampCtx.lineTo(166, 17);
    stampCtx.lineTo(183, 23);
    stampCtx.lineTo(168, 31);
    stampCtx.lineTo(114, 34);
    stampCtx.lineTo(67, 33);
    stampCtx.lineTo(24, 31);
    stampCtx.lineTo(10, 27);
    stampCtx.closePath();
    stampCtx.fill();
    stampCtx.fillStyle = centerColor;
    stampCtx.fillRect(
      18,
      21 + variant % 2,
      158,
      7,
    );
    for (
      let groove = 0;
      groove < 2;
      groove += 1
    ) {
      const seed =
        hash(
          variant * 43 +
            groove * 19,
        );
      const grooveY =
        17 +
        groove * 14 +
        Math.round(
          (
            seed -
            0.5
          ) *
            2,
        );
      stampCtx.strokeStyle =
        "rgba(5,12,9,0.84)";
      stampCtx.lineWidth = 2;
      for (
        let dash = 0;
        dash < 4;
        dash += 1
      ) {
        const dashStart =
          18 +
          dash * 42 +
          Math.round(seed * 3);
        stampCtx.beginPath();
        stampCtx.moveTo(
          dashStart,
          grooveY,
        );
        stampCtx.lineTo(
          Math.min(
            177,
            dashStart + 31,
          ),
          grooveY +
            (
              dash % 2 === 0
                ? 0
                : 1
            ),
        );
        stampCtx.stroke();
      }
    }
    const clippingColor =
      freshness === "fresh"
        ? "#748153"
        : freshness === "warm"
          ? "#596341"
          : "#3f4c34";
    for (
      let clipping = 0;
      clipping < 5;
      clipping += 1
    ) {
      const seed =
        hash(
          variant * 31 +
            clipping * 17,
        );
      const upper =
        clipping % 2 === 0;
      const clippingX =
        24 +
        Math.round(
          seed * 142,
        );
      const clippingY =
        upper
          ? 12 +
            Math.round(seed * 2)
          : 35 +
            Math.round(seed * 2);
      const clippingWidth =
        2 +
        Math.round(seed * 3);
      stampCtx.fillStyle =
        clipping === 2 &&
        freshness === "fresh"
          ? "#8b6840"
          : clippingColor;
      stampCtx.fillRect(
        clippingX,
        clippingY,
        clippingWidth,
        1,
      );
      if (
        freshness !== "fading" &&
        clipping % 3 === 0
      ) {
        stampCtx.fillStyle =
          "rgba(108,137,100,0.72)";
        stampCtx.fillRect(
          clippingX + 1,
          upper
            ? clippingY + 1
            : clippingY - 1,
          2,
          1,
        );
      }
    }
    if (freshness === "fresh") {
      stampCtx.strokeStyle =
        "rgba(122,155,131,0.5)";
      stampCtx.lineWidth = 1;
      stampCtx.beginPath();
      stampCtx.moveTo(30, 13);
      stampCtx.lineTo(73, 14);
      stampCtx.moveTo(119, 12);
      stampCtx.lineTo(161, 14);
      stampCtx.stroke();
    }
    mowerWakeStampCache.set(
      cacheKey,
      stamp,
    );
    return stamp;
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

  function cachedAtlasCell(
    image,
    cell,
  ) {
    const key =
      `${image.src}|${cell.x}|${cell.y}|${cell.width}|${cell.height}`;
    if (atlasCellCache.has(key)) {
      return atlasCellCache.get(key);
    }
    const buffer =
      document.createElement("canvas");
    const sourceMaximumDimension =
      Math.max(
        cell.width,
        cell.height,
      );
    const cacheScale = Math.min(
      1,
      ATLAS_CELL_CACHE_MAX_DIMENSION /
        sourceMaximumDimension,
    );
    const cacheWidth = Math.max(
      1,
      Math.round(
        cell.width * cacheScale,
      ),
    );
    const cacheHeight = Math.max(
      1,
      Math.round(
        cell.height * cacheScale,
      ),
    );
    buffer.width = cacheWidth;
    buffer.height = cacheHeight;
    const bufferContext =
      buffer.getContext("2d");
    bufferContext.imageSmoothingEnabled =
      false;
    bufferContext.drawImage(
      image,
      cell.x,
      cell.y,
      cell.width,
      cell.height,
      0,
      0,
      cacheWidth,
      cacheHeight,
    );
    atlasCellCache.set(key, buffer);
    return buffer;
  }

  function drawCachedAtlasCell(
    image,
    cell,
    x,
    y,
    width,
    height,
  ) {
    ctx.drawImage(
      cachedAtlasCell(
        image,
        cell,
      ),
      x,
      y,
      width,
      height,
    );
  }

  function cloudAlphaAt(
    cell,
    normalizedX,
    normalizedY,
  ) {
    if (
      normalizedX < 0 ||
      normalizedX >= 1 ||
      normalizedY < 0 ||
      normalizedY >= 1
    ) {
      return 0;
    }
    const maskX =
      normalizedX *
      (
        CLOUD_ALPHA_MASK_SIZE - 1
      );
    const maskY =
      normalizedY *
      (
        CLOUD_ALPHA_MASK_SIZE - 1
      );
    const x0 = Math.floor(maskX);
    const y0 = Math.floor(maskY);
    const x1 = Math.min(
      CLOUD_ALPHA_MASK_SIZE - 1,
      x0 + 1,
    );
    const y1 = Math.min(
      CLOUD_ALPHA_MASK_SIZE - 1,
      y0 + 1,
    );
    const blendX = maskX - x0;
    const blendY = maskY - y0;
    const rows =
      CLOUD_ALPHA_MASK_ROWS[cell];
    if (!rows) {
      return 0;
    }
    const topLeft =
      (
        rows[y0] &
        (
          1 << x0
        )
      ) !== 0
        ? 1
        : 0;
    const topRight =
      (
        rows[y0] &
        (
          1 << x1
        )
      ) !== 0
        ? 1
        : 0;
    const bottomLeft =
      (
        rows[y1] &
        (
          1 << x0
        )
      ) !== 0
        ? 1
        : 0;
    const bottomRight =
      (
        rows[y1] &
        (
          1 << x1
        )
      ) !== 0
        ? 1
        : 0;
    return lerp(
      lerp(
        topLeft,
        topRight,
        blendX,
      ),
      lerp(
        bottomLeft,
        bottomRight,
        blendX,
      ),
      blendY,
    );
  }

  function cloudLayerPlacement(
    cloud,
    progress,
    panX,
    walkBob,
  ) {
    const depthScale =
      1 +
      progress *
        cloud.parallax *
        0.28;
    const width =
      cloud.width *
      depthScale;
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
    return {
      x,
      y:
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
      height: width,
    };
  }

  function moonLayerPlacement(
    progress,
    panX,
    walkBob,
  ) {
    const size =
      126 +
      progress * 7;
    const x =
      814 +
      panX * 0.02 -
      progress * 3;
    const y =
      42 -
      progress * 2 +
      walkBob * 0.008;
    return {
      x,
      y,
      size,
      centerX: x + size * 0.5,
      centerY: y + size * 0.5,
    };
  }

  function cloudMoonlightState(
    progress,
    panX,
    walkBob,
  ) {
    const motion =
      state.reducedMotion
        ? "static"
        : "cloud_driven";
    if (
      !cloudAtlasArt.complete ||
      cloudAtlasArt.naturalWidth === 0
    ) {
      return {
        coverage: 0,
        intensity: 1,
        coveringClouds: 0,
        motion,
        gameplayEffect: "none",
      };
    }
    const moon =
      moonLayerPlacement(
        progress,
        panX,
        walkBob,
      );
    const sampleOffsets = [
      -0.26,
      0,
      0.26,
    ];
    const transmissions =
      new Float32Array(9);
    transmissions.fill(1);
    let coveringClouds = 0;
    for (
      let index = 0;
      index <
      CLOUD_INSTANCES.length;
      index += 1
    ) {
      const cloud =
        CLOUD_INSTANCES[index];
      const placement =
        cloudLayerPlacement(
          cloud,
          progress,
          panX,
          walkBob,
        );
      let maximumDensity = 0;
      let sampleIndex = 0;
      for (
        let yIndex = 0;
        yIndex <
          sampleOffsets.length;
        yIndex += 1
      ) {
        for (
          let xIndex = 0;
          xIndex <
            sampleOffsets.length;
          xIndex += 1
        ) {
          const sampleX =
            moon.centerX +
            sampleOffsets[xIndex] *
              moon.size;
          const sampleY =
            moon.centerY +
            sampleOffsets[yIndex] *
              moon.size;
          const density = clamp(
            cloudAlphaAt(
              cloud.cell,
              (
                sampleX -
                placement.x
              ) /
                placement.width,
              (
                sampleY -
                placement.y
              ) /
                placement.height,
            ) *
              cloud.alpha *
              2.7,
            0,
            0.76,
          );
          transmissions[sampleIndex] *=
            1 - density;
          maximumDensity = Math.max(
            maximumDensity,
            density,
          );
          sampleIndex += 1;
        }
      }
      if (maximumDensity > 0.025) {
        coveringClouds += 1;
      }
    }
    let coverageSum = 0;
    for (
      let index = 0;
      index <
        transmissions.length;
      index += 1
    ) {
      coverageSum +=
        1 - transmissions[index];
    }
    const coverage = clamp(
      coverageSum /
        transmissions.length,
      0,
      0.82,
    );
    return {
      coverage,
      intensity:
        1 -
        coverage * 0.62,
      coveringClouds,
      motion,
      gameplayEffect: "none",
    };
  }

  function courseMoonlightState(
    progress,
    walkBob,
  ) {
    const cameraShift =
      courseCameraMotion()
        .offsetX;
    const panX = clamp(
      -state.player.x * 0.5 +
        cameraShift * 0.18,
      -96,
      96,
    );
    return cloudMoonlightState(
      progress,
      panX,
      walkBob,
    );
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
      const placement =
        cloudLayerPlacement(
          cloud,
          progress,
          panX,
          walkBob,
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
        placement.x,
        placement.y,
        placement.width,
        placement.height,
        cloud.alpha,
      );
    }
  }

  function drawMoonLayer(
    progress,
    panX,
    walkBob,
  ) {
    const moon =
      moonLayerPlacement(
        progress,
        panX,
        walkBob,
      );
    const moonlight =
      cloudMoonlightState(
        progress,
        panX,
        walkBob,
      );
    const moonSize = moon.size;
    const moonX = moon.x;
    const moonY = moon.y;
    const centerX =
      moon.centerX;
    const centerY =
      moon.centerY;
    const pulse =
      (
        state.reducedMotion
          ? 0.12
          : 0.105 +
            Math.sin(
              state.hole.elapsed *
                0.16,
            ) *
              0.012
      ) *
      (
        0.25 +
        moonlight.intensity *
          0.75
      );
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
      0.9 *
        Math.pow(
          moonlight.intensity,
          1.55,
        ),
    );
  }

  function drawCloudMoonlightGrade(
    progress,
    walkBob,
  ) {
    const moonlight =
      courseMoonlightState(
        progress,
        walkBob,
      );
    if (moonlight.coverage < 0.015) {
      return;
    }
    const shadowAlpha = clamp(
      moonlight.coverage * 0.145,
      0,
      0.115,
    );
    ctx.save();
    const passingShadow =
      ctx.createLinearGradient(
        0,
        HEIGHT * 0.18,
        WIDTH,
        HEIGHT,
      );
    passingShadow.addColorStop(
      0,
      `rgba(2,8,15,${shadowAlpha * 0.34})`,
    );
    passingShadow.addColorStop(
      0.52,
      `rgba(2,8,14,${shadowAlpha})`,
    );
    passingShadow.addColorStop(
      1,
      `rgba(3,10,13,${shadowAlpha * 0.62})`,
    );
    ctx.fillStyle = passingShadow;
    ctx.fillRect(
      -96,
      -96,
      WIDTH + 192,
      HEIGHT + 192,
    );
    const coldAir =
      ctx.createLinearGradient(
        0,
        HEIGHT * 0.48,
        0,
        HEIGHT,
      );
    coldAir.addColorStop(
      0,
      "rgba(34,63,69,0)",
    );
    coldAir.addColorStop(
      1,
      `rgba(34,63,69,${moonlight.coverage * 0.035})`,
    );
    ctx.fillStyle = coldAir;
    ctx.fillRect(
      -96,
      HEIGHT * 0.42,
      WIDTH + 192,
      HEIGHT * 0.68,
    );
    ctx.restore();
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
      const haze =
        ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
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

  function drawEstatePerimeterLayer(
    progress,
    panX,
    walkBob,
  ) {
    const width =
      1540 *
      (
        1 +
        progress * 0.075
      );
    const height =
      width *
      ESTATE_PERIMETER_SOURCE
        .height /
      ESTATE_PERIMETER_SOURCE
        .width;
    const drift =
      state.reducedMotion
        ? 0
        : Math.sin(
            state.hole.elapsed *
              0.052,
          ) *
            1.4;
    drawParallaxAsset(
      estatePerimeterArt,
      ESTATE_PERIMETER_SOURCE,
      (
        WIDTH -
        width
      ) *
        0.5 +
        panX * 0.105 +
        drift -
        progress * 4,
      96 +
        progress * 9 +
        walkBob * 0.018,
      width,
      height,
      0.58,
    );
  }

  function drawNearCanopyShoulders(
    progress,
    panX,
    walkBob,
  ) {
    const width =
      560 *
      (
        1 +
        progress * 0.11
      );
    const height =
      384 *
      (
        1 +
        progress * 0.11
      );
    const y =
      62 +
      progress * 24 +
      walkBob * 0.12;
    const sway =
      (
        state.reducedMotion
          ? 0
          : Math.sin(
              state.hole.elapsed *
                0.19,
            ) *
              3.2
      ) +
      crosswindStrength() *
        state.hole.crosswind.direction *
        (
          state.reducedMotion
            ? 3.5
            : 11
        );
    drawParallaxAsset(
      distantTreeLineArt,
      {
        x: 9,
        y: 373,
        width: 510,
        height: 347,
      },
      -190 +
        panX * 0.34 +
        sway -
        progress * 10,
      y,
      width,
      height,
      0.27,
    );
    drawParallaxAsset(
      distantTreeLineArt,
      {
        x: 1149,
        y: 373,
        width: 510,
        height: 347,
      },
      WIDTH -
        width +
        190 +
        panX * 0.34 -
        sway +
        progress * 10,
      y + 8,
      width,
      height,
      0.25,
    );
  }

  function renderCourseBackdrop(
    progress,
    walkBob,
  ) {
    const cameraShift =
      courseCameraMotion()
        .offsetX;
    const panX = clamp(
      -state.player.x * 0.5 +
        cameraShift * 0.18,
      -96,
      96,
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
        progress * 0.05
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
        progress * 6,
      ridgeWidth,
      ridgeHeight,
      0.67,
    );

    drawEstatePerimeterLayer(
      progress,
      panX,
      walkBob,
    );

    const villasWidth =
      1190 *
      (
        1 +
        progress * 0.07
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
        progress * 8,
      184 +
        progress * 13 +
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
        progress * 0.11
      );
    const clubhouseHeight =
      clubhouseWidth *
      CLUBHOUSE_SOURCE.height /
      CLUBHOUSE_SOURCE.width;
    const clubhouseX =
      172 +
      panX * 0.24 -
      progress * 20;
    const clubhouseY =
      180 +
      progress * 17 +
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
        progress * 0.095
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
        treeSway -
        progress * 5,
      42 +
        progress * 25 +
        walkBob * 0.08,
      treeWidth,
      treeHeight,
      0.58,
    );

    drawNearCanopyShoulders(
      progress,
      panX,
      walkBob,
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

  function drawCourseBackdrop(
    progress,
    walkBob,
  ) {
    if (
      runtimePerformance.tier ===
      "high"
    ) {
      renderCourseBackdrop(
        progress,
        walkBob,
      );
      return;
    }
    const refreshInterval =
      runtimePerformance.tier ===
      "low"
        ? 1 / 12
        : 1 / 24;
    if (
      state.hole.elapsed -
        courseBackdropRenderedAt >=
        refreshInterval ||
      state.hole.elapsed <
        courseBackdropRenderedAt
    ) {
      courseBackdropCtx.setTransform(
        1,
        0,
        0,
        1,
        0,
        0,
      );
      courseBackdropCtx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT,
      );
      ctx = courseBackdropCtx;
      try {
        renderCourseBackdrop(
          progress,
          walkBob,
        );
      } finally {
        ctx = mainCtx;
      }
      courseBackdropRenderedAt =
        state.hole.elapsed;
    }
    ctx.drawImage(
      courseBackdropBuffer,
      0,
      0,
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
    const visibleCount =
      Math.max(
        6,
        Math.round(
          count *
            effectQualityScale(),
        ),
      );
    for (
      let index = 0;
      index < visibleCount;
      index += 1
    ) {
      const drift = state.reducedMotion ? 0 : Math.sin(time * 0.45 + index * 1.7) * 18;
      const x = (hash(index * 47) * WIDTH + drift + time * (4 + hash(index) * 6)) % WIDTH;
      const y = areaTop + hash(index * 83) * (HEIGHT - areaTop);
      const pulse = 0.16 + (Math.sin(time * 2.2 + index) + 1) * 0.11;
      ctx.fillStyle = `rgba(${color},${pulse})`;
      ctx.fillRect(Math.round(x), Math.round(y), index % 4 === 0 ? 3 : 2, 2);
    }
  }

  function drawScreenTexture() {
    ctx.drawImage(
      screenTextureBuffer,
      0,
      0,
    );
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
        subdetail: "Amber Reviews restore balls + shorten filing; CR adds +650.",
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
    state.status = "South gate locked. Reach an exit across the course.";
    state.hole = {
      variantIndex,
      variantId: variant.id,
      overtime,
      phase: "find_key",
      keyCollected: false,
      changeRequestCollected: false,
      appealUsed: false,
      appealWindowSeen: false,
      appealWindowWasEligible: false,
      appealDocument: null,
      appealReviewTimer: 0,
      appealActivationDistance: null,
      reviewsCleared: [],
      reviewRewards: 0,
      filingReduction: 0,
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
      practiceDrill:
        freshPracticeDrill(
          !state.career
            .golfLessonCompleted &&
            !overtime,
        ),
      prompt: "",
      message: overtime
        ? "OVERTIME AUDIT — two balls, faster Joe, stronger evidence."
        : "South gate locked. Find the shed key — or open the drain.",
      messageTimer: 4,
      elapsed: 0,
      tutorialVisible: true,
      tutorialPage: 0,
      quickRematch: false,
      rematchTarget: null,
      hasMoved: false,
      cameraMotion:
        freshCourseCameraMotion(),
      panicMomentum: 0,
      panicTarget: 0,
      moveVector: { x: 0, y: 0 },
      moveHintTimer: 0,
      controlHintTimer: 12,
      controlHintSource: "onboarding",
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
      captureReview: null,
      lastJoeContact: null,
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
      groundResponses: [],
      playerStepSerial: 0,
      turfMarks: [],
      nextTurfMarkId: 1,
      lastPlayerTrackDistance: 0,
      tracksCreated: 0,
      tracksDiscovered: 0,
      trackTutorialShown: false,
      trailWarningTimer: 0,
      trailDiscoveryCooldown: 0,
      trailChain: 0,
      trailChainTimer: 0,
      trailTarget: null,
      trailApproachTimer: 0,
      trailBreaks: 0,
      bestTrailBreak: 0,
      trailColdTimer: 0,
      cutTraceProgress: 0,
      cutTraceCandidateId: null,
      cutTraceMemory: null,
      cutTraceLocks: 0,
      cutTraceLoggedIds: [],
      cutTraceCueCooldown: 0,
      counterRoutes: 0,
      counterRouteQuietTimer: 0,
      blindsideTransfers: 0,
      blindsideTransfer: null,
      blindsideTransferCooldown: 0,
      blindsidePreviousShelter: null,
      blindsidePreview: null,
      blindsidePreviewRefresh: 0,
      blindsideTutorialShown: false,
      nerveHold:
        freshNerveHold(),
      cadenceRead:
        freshCadenceRead(),
      zoneIndex: 0,
      zoneBannerTimer: 2.8,
      zoneVisits: COURSE_ZONES.map(
        (zone, index) =>
          index === 0 ? 1 : 0,
      ),
      blackoutTimer: 0,
      dreadTimer: 0,
      tensionDirector:
        freshTensionDirector(),
      horrorDirector:
        freshHorrorDirector(),
      crosswind:
        freshCrosswind(
          variantIndex,
        ),
      statusRequest:
        freshStatusRequest(variant),
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
      secondWindTimer: 0,
      secondWindDuration: 0,
      secondWindActivations: 0,
      deliveryChain: 0,
      deliveryPeak: 0,
      deliveryTimer: 0,
      deliveryBonus: 0,
      deliveryEvents: [],
      deliveryFamilyCounts: {},
      deliveryAward: null,
      deliveryAwardQueue: [],
      deliveryAwardOverflowMerges: 0,
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
      length: options.length ?? null,
      laneWidth:
        options.laneWidth ?? null,
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
    let recentJoeCut = null;
    let mowedDistance = Infinity;
    let trackDistance = Infinity;
    let recentJoeCutDistance =
      Infinity;
    let recentJoeCutScore =
      Infinity;
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
        mark.kind === "mowed" &&
        mark.age <=
          JOE_CUT_CLUE_MAX_AGE &&
        distance <=
          JOE_CUT_CLUE_MAX_DISTANCE
      ) {
        const clueScore =
          distance +
          mark.age * 2.2;
        if (
          clueScore <
          recentJoeCutScore
        ) {
          recentJoeCut =
            mark;
          recentJoeCutDistance =
            distance;
          recentJoeCutScore =
            clueScore;
        }
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
      recentJoeCut,
      recentJoeCutDistance:
        recentJoeCut
          ? recentJoeCutDistance
          : null,
    };
  }

  function joeCutFreshness(
    mark,
  ) {
    if (!mark) {
      return "none";
    }
    if (mark.age < 7) {
      return "fresh";
    }
    if (mark.age < 17) {
      return "warm";
    }
    return "fading";
  }

  function updateCutTrace(
    dt,
    environment,
  ) {
    const hole = state.hole;
    hole.cutTraceCueCooldown =
      Math.max(
        0,
        hole.cutTraceCueCooldown -
          dt,
      );
    if (
      hole.cutTraceMemory &&
      !hole.focus
    ) {
      const memory =
        hole.cutTraceMemory;
      const displacementX =
        state.player.x -
        memory.playerX;
      const displacementY =
        state.player.y -
        memory.playerY;
      const displacement =
        Math.hypot(
          displacementX,
          displacementY,
        );
      const counterX =
        -Math.cos(
          memory.heading,
        );
      const counterY =
        -Math.sin(
          memory.heading,
        );
      const counterDistance =
        displacementX *
          counterX +
        displacementY *
          counterY;
      memory.counterDistance =
        Math.max(
          0,
          counterDistance,
        );
      memory.counterAlignment =
        displacement > 0.01
          ? counterDistance /
            displacement
          : 0;
      if (
        !memory.resolved &&
        memory.counterDistance >=
          COUNTER_ROUTE_DISTANCE &&
        memory.counterAlignment >=
          COUNTER_ROUTE_ALIGNMENT &&
        hole.joe.mode !==
          "chase" &&
        !hole.escapeFiling.active
      ) {
        memory.resolved = true;
        memory.timer = Math.min(
          memory.timer,
          0.7,
        );
        hole.counterRoutes += 1;
        hole.counterRouteQuietTimer =
          COUNTER_ROUTE_QUIET_SECONDS;
        hole.joe.alert =
          Math.max(
            0,
            hole.joe.alert -
              0.08,
          );
        awardDeliveryBeat(
          "COUNTER-ROUTE",
          COUNTER_ROUTE_BONUS,
        );
        hole.stateBanner =
          `COUNTER-ROUTE // QUIET LANE ${COUNTER_ROUTE_QUIET_SECONDS.toFixed(1)}s`;
        hole.stateBannerTimer = 2.45;
        hole.stateBannerLockTimer =
          2.45;
        setHoleMessage(
          `COUNTER-ROUTE — you cut behind Joe. Quiet steps for ${COUNTER_ROUTE_QUIET_SECONDS.toFixed(1)} seconds.`,
          3,
        );
        addWorldEffect(
          "counter_route",
          state.player.x,
          state.player.y,
          1.9,
        );
        triggerJoeBark(
          hole.joe.mode,
          "counter_route",
        );
        playUiTone(
          392,
          0.09,
          0.024,
        );
        playUiTone(
          294,
          0.16,
          0.02,
        );
      }
      hole.cutTraceMemory.timer =
        Math.max(
          0,
          hole.cutTraceMemory.timer -
            dt,
        );
      if (
        hole.cutTraceMemory.timer <=
        0
      ) {
        hole.cutTraceMemory =
          null;
      }
    }
    if (
      !hole.cutTraceMemory &&
      (
        hole.cadenceRead?.armed ||
        hole.cadenceRead?.active
      )
    ) {
      hole.cutTraceCandidateId =
        null;
      hole.cutTraceProgress = 0;
      return;
    }
    const cut =
      environment.recentJoeCut;
    if (!hole.focus || !cut) {
      hole.cutTraceCandidateId =
        null;
      hole.cutTraceProgress = 0;
      return;
    }
    if (
      hole.cutTraceLoggedIds.includes(
        cut.id,
      )
    ) {
      hole.cutTraceCandidateId =
        cut.id;
      hole.cutTraceProgress =
        CUT_TRACE_SCAN_SECONDS;
      return;
    }
    if (
      hole.cutTraceCandidateId !==
      cut.id
    ) {
      hole.cutTraceCandidateId =
        cut.id;
      hole.cutTraceProgress = 0;
    }
    hole.cutTraceProgress =
      Math.min(
        CUT_TRACE_SCAN_SECONDS,
        hole.cutTraceProgress + dt,
      );
    if (
      hole.cutTraceProgress <
      CUT_TRACE_SCAN_SECONDS
    ) {
      return;
    }
    hole.cutTraceLoggedIds.push(
      cut.id,
    );
    if (
      hole.cutTraceLoggedIds.length >
      MAX_LOGGED_CUT_TRACES
    ) {
      hole.cutTraceLoggedIds.splice(
        0,
        hole.cutTraceLoggedIds.length -
          MAX_LOGGED_CUT_TRACES,
      );
    }
    hole.cutTraceMemory = {
      markId: cut.id,
      x: cut.x,
      y: cut.y,
      heading: cut.heading,
      age: cut.age,
      freshness:
        joeCutFreshness(cut),
      timer:
        CUT_TRACE_MEMORY_SECONDS,
      duration:
        CUT_TRACE_MEMORY_SECONDS,
      playerX:
        state.player.x,
      playerY:
        state.player.y,
      counterDistance: 0,
      counterAlignment: 0,
      resolved: false,
    };
    hole.cutTraceLocks += 1;
    if (
      hole.cutTraceCueCooldown <= 0
    ) {
      hole.cutTraceCueCooldown =
        2.6;
      hole.stateBanner =
        `CUT TRACE LOGGED // ${CUT_TRACE_MEMORY_SECONDS}s MEMORY`;
      hole.stateBannerTimer = 2.3;
      hole.stateBannerLockTimer =
        2.3;
      setHoleMessage(
        inputCopy(
          `CUT TRACE LOGGED — release ${keyboardBindingLabel("focus")} and move against Joe's arrow for a quiet lane.`,
          "CUT TRACE LOGGED — release LT and move against Joe's arrow for a quiet lane.",
          "CUT TRACE LOGGED — release Listen and move against Joe's arrow for a quiet lane.",
        ),
        3.2,
      );
      addWorldEffect(
        "cut_trace",
        cut.x,
        cut.y,
        1.8,
      );
      triggerJoeBark(
        hole.joe.mode,
        "cut_trace",
      );
      playUiTone(
        348,
        0.1,
        0.024,
      );
      playUiTone(
        522,
        0.14,
        0.02,
      );
    }
  }

  function blindsideShelterState(
    environment,
  ) {
    const hole = state.hole;
    if (environment.hardCover) {
      return {
        active: true,
        id:
          `cover:${
            environment.blocker ||
            environment.nearestCover?.id ||
            "solid"
          }`,
        label:
          environment.nearestCover
            ?.landmark ||
          "hard cover",
      };
    }
    if (
      hole.crouched &&
      environment.effectiveRough &&
      hole.concealment >= 0.56
    ) {
      const lane =
        state.player.x < -24
          ? "west"
          : state.player.x > 24
            ? "east"
            : "center";
      return {
        active: true,
        id:
          `rough:${environment.zone.id}:${lane}`,
        label: `${lane} rough`,
      };
    }
    return {
      active: false,
      id: null,
      label: null,
    };
  }

  function joeBlindsideAlignment() {
    const joe = state.hole.joe;
    const deltaX =
      state.player.x - joe.x;
    const deltaY =
      state.player.y - joe.y;
    const distance = Math.max(
      0.001,
      Math.hypot(
        deltaX,
        deltaY,
      ),
    );
    return (
      Math.cos(
        joe.effectHeading,
      ) *
        deltaX +
      Math.sin(
        joe.effectHeading,
      ) *
        deltaY
    ) / distance;
  }

  function blindsideWindowEligible(
    shelter,
  ) {
    const hole = state.hole;
    const joe = hole.joe;
    const joeDistance =
      worldDistance(
        joe,
        state.player,
      );
    const nerveExitWindow =
      hole.nerveHold
        ?.exitWindow > 0;
    return Boolean(
      shelter?.active &&
      hole.blindsideTransferCooldown <=
        0 &&
      hole.secondWindTimer <= 0 &&
      !hole.riskAward &&
      (
        !hole.deliveryAward ||
        nerveExitWindow
      ) &&
      !hole.escapeFiling.active &&
      joe.mode !== "chase" &&
      joe.effectSpeed >= 3.5 &&
      joeDistance >=
        BLINDSIDE_TRANSFER_MIN_JOE_DISTANCE &&
      joeDistance <=
        BLINDSIDE_TRANSFER_MAX_JOE_DISTANCE &&
      joeBlindsideAlignment() <=
        (
          nerveExitWindow
            ? 0.12
            : -0.18
        ) &&
      hole.detection < 0.26
    );
  }

  function blindsideCoverLanding(
    obstacle,
  ) {
    const joe = state.hole.joe;
    const metricX =
      (obstacle.x - joe.x) * 0.72;
    const metricY =
      obstacle.y - joe.y;
    const joeDistance = Math.hypot(
      metricX,
      metricY,
    );
    if (joeDistance < 4) {
      return null;
    }
    const directionX =
      metricX / joeDistance;
    const directionY =
      metricY / joeDistance;
    const axes =
      obstacleFootprintAxes(
        obstacle,
      );
    const boundaryDistance =
      1 /
      Math.max(
        0.001,
        Math.hypot(
          directionX / axes.x,
          directionY / axes.y,
        ),
      );
    const landingDistance =
      boundaryDistance +
      PLAYER_COLLISION_RADIUS +
      2.2;
    const point = {
      x:
        obstacle.x +
        directionX / 0.72 *
          landingDistance,
      y:
        obstacle.y +
        directionY *
          landingDistance,
    };
    if (
      point.x <
        -COURSE_MAX_X +
          PLAYER_COLLISION_RADIUS ||
      point.x >
        COURSE_MAX_X -
          PLAYER_COLLISION_RADIUS ||
      point.y <
        COURSE_MIN_Y +
          PLAYER_COLLISION_RADIUS ||
      point.y >
        COURSE_LENGTH -
          PLAYER_COLLISION_RADIUS ||
      obstacleAtPosition(
        point.x,
        point.y,
      ) ||
      worldDistance(
        point,
        obstacle,
      ) >
        obstacle.coverRadius - 0.8 ||
      lineBlockerBetween(
        joe,
        point,
      ) !== obstacle.id
    ) {
      return null;
    }
    return point;
  }

  function blindsideDestinationOptions(
    startShelterId,
    origin = state.player,
  ) {
    const candidates = [];
    for (
      let index = 0;
      index < COURSE_OBSTACLES.length;
      index += 1
    ) {
      const obstacle =
        COURSE_OBSTACLES[index];
      if (
        !obstacle.blocks ||
        !obstacle.sight ||
        !obstacle.coverRadius ||
        `cover:${obstacle.id}` ===
          startShelterId
      ) {
        continue;
      }
      const point =
        blindsideCoverLanding(
          obstacle,
        );
      if (!point) {
        continue;
      }
      const distance =
        worldDistance(
          origin,
          point,
        );
      if (
        distance <
          BLINDSIDE_TRANSFER_DISTANCE +
            1.5 ||
        distance > 92
      ) {
        continue;
      }
      const behindDistance =
        Math.max(
          0,
          origin.y - point.y,
        );
      candidates.push({
        id: `cover:${obstacle.id}`,
        kind: "hard_cover",
        obstacleId: obstacle.id,
        label:
          obstacle.landmark ||
          "hard cover",
        x: point.x,
        y: point.y,
        distance,
        remainingDistance:
          distance,
        score:
          distance +
          behindDistance * 0.42 +
          (point.y < origin.y - 4
            ? 9
            : 0),
        requiresCrouch: false,
      });
    }
    const roughCandidatesById =
      new Map();
    const roughOffsets = [
      24,
      42,
      60,
      -30,
    ];
    const roughLanes = [
      {
        id: "west",
        direction: -1,
      },
      {
        id: "east",
        direction: 1,
      },
    ];
    for (
      let offsetIndex = 0;
      offsetIndex <
      roughOffsets.length;
      offsetIndex += 1
    ) {
      const pointY = clamp(
        origin.y +
          roughOffsets[offsetIndex],
        COURSE_MIN_Y + 8,
        COURSE_LENGTH - 8,
      );
      const zone =
        courseZoneAt(pointY);
      for (
        let laneIndex = 0;
        laneIndex <
        roughLanes.length;
        laneIndex += 1
      ) {
        const lane =
          roughLanes[laneIndex];
        const point = {
          x:
            lane.direction *
            Math.min(
              COURSE_MAX_X - 7,
              Math.max(
                48,
                zone.fairwayHalfWidth +
                  14,
              ),
            ),
          y: pointY,
        };
        const shelterId =
          `rough:${zone.id}:${lane.id}`;
        const distance =
          worldDistance(
            origin,
            point,
          );
        if (
          shelterId ===
            startShelterId ||
          distance <
            BLINDSIDE_TRANSFER_DISTANCE +
              1.5 ||
          distance > 92 ||
          obstacleAtPosition(
            point.x,
            point.y,
          ) ||
          sandStateAt(point).active ||
          turfStateAt(point).mowed
        ) {
          continue;
        }
        const behindDistance =
          Math.max(
            0,
            origin.y - point.y,
          );
        const candidate = {
          id: shelterId,
          kind: "rough",
          obstacleId: null,
          label:
            `${lane.id} rough`,
          x: point.x,
          y: point.y,
          distance,
          remainingDistance:
            distance,
          score:
            distance +
            behindDistance * 0.42 +
            (point.y < origin.y - 4
              ? 9
              : 0) +
            4,
          requiresCrouch: true,
          concealmentRequired: 0.56,
        };
        const previous =
          roughCandidatesById.get(
            shelterId,
          );
        if (
          !previous ||
          candidate.score <
            previous.score
        ) {
          roughCandidatesById.set(
            shelterId,
            candidate,
          );
        }
      }
    }
    candidates.push(
      ...roughCandidatesById.values(),
    );
    candidates.sort(
      (a, b) => a.score - b.score,
    );
    const selected = [];
    for (
      let index = 0;
      index < candidates.length &&
      selected.length < 3;
      index += 1
    ) {
      const candidate =
        candidates[index];
      if (
        selected.some(
          (existing) =>
            worldDistance(
              existing,
              candidate,
            ) < 11,
        )
      ) {
        continue;
      }
      selected.push(candidate);
    }
    const preferredRough =
      candidates.find(
        (candidate) =>
          candidate.kind ===
          "rough",
      );
    if (
      preferredRough &&
      !selected.some(
        (candidate) =>
          candidate.kind ===
          "rough",
      )
    ) {
      const insertionIndex =
        selected.length < 3
          ? selected.length
          : 2;
      const distinct =
        selected
          .slice(
            0,
            insertionIndex,
          )
          .every(
            (candidate) =>
              worldDistance(
                candidate,
                preferredRough,
              ) >= 11,
          );
      if (distinct) {
        selected[
          insertionIndex
        ] = preferredRough;
      }
    }
    return selected;
  }

  function updateBlindsideTransfer(
    dt,
    environment,
    moving,
  ) {
    const hole = state.hole;
    const joe = hole.joe;
    const shelter =
      blindsideShelterState(
        environment,
      );
    const previousShelter =
      hole.blindsidePreviousShelter;
    const joeDistance =
      worldDistance(
        joe,
        state.player,
      );
    const alignment =
      joeBlindsideAlignment();
    const active =
      hole.blindsideTransfer;

    if (
      !active &&
      (
        hole.nerveHold?.armed ||
        hole.nerveHold?.active
      )
    ) {
      hole.blindsidePreview = null;
      hole.blindsidePreviewRefresh = 0;
      hole.blindsidePreviousShelter =
        shelter;
      return;
    }

    hole.blindsidePreviewRefresh =
      Math.max(
        0,
        hole.blindsidePreviewRefresh -
          dt,
      );

    if (active) {
      active.timer = Math.max(
        0,
        active.timer - dt,
      );
      active.distance =
        worldDistance(
          {
            x: active.startX,
            y: active.startY,
          },
          state.player,
        );
      active.bestDistance =
        Math.max(
          active.bestDistance,
          active.distance,
        );
      active.joeAlignment =
        alignment;
      active.joeDistance =
        joeDistance;
      for (
        let index = 0;
        index <
        active.destinations.length;
        index += 1
      ) {
        active.destinations[
          index
        ].remainingDistance =
          worldDistance(
            state.player,
            active.destinations[
              index
            ],
          );
      }

      if (
        joe.mode === "chase" ||
        hole.detection >= 0.72
      ) {
        hole.blindsideTransfer =
          null;
        hole.blindsideTransferCooldown =
          Math.max(
            hole.blindsideTransferCooldown,
            4,
          );
      } else {
        const destinationChanged =
          shelter.active &&
          shelter.id !==
            active.startShelterId;
        if (
          destinationChanged &&
          active.distance >=
            BLINDSIDE_TRANSFER_DISTANCE &&
          hole.detection < 0.58
        ) {
          hole.blindsideTransfers += 1;
          const deliveryAward =
            awardDeliveryBeat(
              "BLINDSIDE TRANSFER",
              BLINDSIDE_TRANSFER_BONUS,
            );
          hole.blindsideTransfer =
            null;
          hole.blindsideTransferCooldown =
            BLINDSIDE_TRANSFER_COOLDOWN;
          hole.stateBanner =
            deliveryAward
              ? `BLINDSIDE TRANSFER // +${deliveryAward.amount} DELIVERY`
              : "BLINDSIDE TRANSFER // ROUTE UNSEEN";
          hole.stateBannerTimer =
            2.45;
          hole.stateBannerLockTimer =
            2.45;
          setHoleMessage(
            "COVER-TO-COVER — Joe never saw the handoff.",
            2.8,
          );
          addWorldEffect(
            "blindside_transfer",
            state.player.x,
            state.player.y,
            1.9,
          );
          triggerJoeBark(
            joe.mode,
            "blindside_transfer",
          );
          playUiTone(
            466,
            0.09,
            0.024,
          );
          playUiTone(
            698,
            0.14,
            0.02,
          );
        } else if (
          active.timer <= 0
        ) {
          hole.blindsideTransfer =
            null;
          hole.blindsideTransferCooldown =
            Math.max(
              hole.blindsideTransferCooldown,
              3.5,
            );
          if (
            joe.mode !== "chase" &&
            hole.stateBannerLockTimer <=
              0
          ) {
            setHoleMessage(
              "BLINDSIDE CLOSED — observe Joe, then move when he turns away.",
              2.4,
            );
          }
        }
      }
    } else if (
      previousShelter?.active &&
      !shelter.active &&
      moving &&
      blindsideWindowEligible(
        previousShelter,
      )
    ) {
      const previewOptions =
        hole.blindsidePreview
          ?.startShelterId ===
        previousShelter.id
          ? hole.blindsidePreview
              .options
          : blindsideDestinationOptions(
              previousShelter.id,
            );
      hole.blindsideTransfer = {
        timer:
          BLINDSIDE_TRANSFER_WINDOW,
        duration:
          BLINDSIDE_TRANSFER_WINDOW,
        startX:
          state.player.x,
        startY:
          state.player.y,
        startShelterId:
          previousShelter.id,
        startShelterLabel:
          previousShelter.label,
        distance: 0,
        bestDistance: 0,
        joeAlignment:
          alignment,
        joeDistance,
        destinations:
          previewOptions.map(
            (option) => ({
              ...option,
            }),
          ),
      };
      hole.blindsidePreview = null;
      hole.blindsidePreviewRefresh =
        0;
      addWorldEffect(
        "blindside_open",
        state.player.x,
        state.player.y,
        1.45,
      );
      playUiTone(
        370,
        0.075,
        0.018,
      );
      if (
        !hole.blindsideTutorialShown
      ) {
        hole.blindsideTutorialShown =
          true;
        setHoleMessage(
          "BLINDSIDE OPEN — reach different cover before Joe turns back.",
          3.2,
        );
      }
    }

    const previewReady =
      !hole.blindsideTransfer &&
      blindsideWindowEligible(
        shelter,
      );
    if (previewReady) {
      if (
        !hole.blindsidePreview ||
        hole.blindsidePreview
          .startShelterId !==
          shelter.id ||
        hole.blindsidePreviewRefresh <=
          0
      ) {
        hole.blindsidePreview = {
          startShelterId:
            shelter.id,
          startShelterLabel:
            shelter.label,
          options:
            blindsideDestinationOptions(
              shelter.id,
            ),
        };
        hole.blindsidePreviewRefresh =
          0.72;
      }
    } else if (
      !hole.blindsideTransfer
    ) {
      hole.blindsidePreview = null;
      hole.blindsidePreviewRefresh =
        0;
    }

    hole.blindsidePreviousShelter =
      shelter;
  }

  function nerveHoldEligibility(
    environment,
    moving,
  ) {
    const hole = state.hole;
    const nerve = hole.nerveHold;
    const zone =
      courseZoneAt(
        state.player.y,
      );
    const joeDistance =
      worldDistance(
        hole.joe,
        state.player,
      );
    let blockedReason = null;
    if (
      nerve.completions >=
      DELIVERY_FAMILY_CAPS.nerve
    ) {
      blockedReason =
        "run_cap_reached";
    } else if (
      nerve.cooldown > 0
    ) {
      blockedReason = "cooldown";
    } else if (
      nerve.lastZone === zone.id
    ) {
      blockedReason =
        "zone_already_held";
    } else if (
      !environment.effectiveRough
    ) {
      blockedReason =
        "not_in_effective_rough";
    } else if (!hole.crouched) {
      blockedReason = "not_crouched";
    } else if (
      hole.concealment < 0.56
    ) {
      blockedReason =
        "concealment_building";
    } else if (moving) {
      blockedReason = "movement";
    } else if (
      ![
        "investigate",
        "search",
        "chase",
      ].includes(
        hole.joe.mode,
      )
    ) {
      blockedReason =
        "joe_not_searching";
    } else if (
      hole.hasLineOfSight ||
      hole.detection >= 0.68
    ) {
      blockedReason = "exposed";
    } else if (
      joeDistance <
        NERVE_HOLD_MIN_JOE_DISTANCE
    ) {
      blockedReason = "too_close";
    } else if (
      joeDistance >
        NERVE_HOLD_MAX_JOE_DISTANCE
    ) {
      blockedReason = "too_far";
    } else if (
      hole.escapeFiling.active ||
      hole.statusRequest.active ||
      hole.blindsideTransfer ||
      hole.ballAim.active ||
      hole.ballFlight ||
      hole.riskAward ||
      hole.deliveryAward
    ) {
      blockedReason =
        "another_action_active";
    }
    return {
      eligible:
        blockedReason === null,
      blockedReason,
      zone,
      joeDistance,
    };
  }

  function updateNerveHold(
    dt,
    environment,
    moving,
  ) {
    const hole = state.hole;
    const nerve = hole.nerveHold;
    nerve.cooldown = Math.max(
      0,
      nerve.cooldown - dt,
    );
    nerve.exitWindow = Math.max(
      0,
      nerve.exitWindow - dt,
    );
    const eligibility =
      nerveHoldEligibility(
        environment,
        moving,
      );
    nerve.joeDistance =
      Number(
        eligibility.joeDistance.toFixed(
          2,
        ),
      );
    nerve.blockedReason =
      eligibility.blockedReason;
    const wasActive = nerve.active;
    nerve.armed =
      eligibility.eligible;
    nerve.active =
      eligibility.eligible &&
      hole.focus;
    if (!eligibility.eligible) {
      const recoverableInterruption =
        wasActive &&
        hole.focus &&
        !moving &&
        [
          "exposed",
          "too_close",
          "too_far",
        ].includes(
          eligibility.blockedReason,
        ) &&
        nerve.graceRemaining > 0;
      if (recoverableInterruption) {
        nerve.graceRemaining =
          Math.max(
            0,
            nerve.graceRemaining - dt,
          );
        nerve.armed = true;
        nerve.active = true;
        nerve.interruption =
          eligibility.blockedReason;
        nerve.blockedReason =
          `${eligibility.blockedReason}_grace`;
        return;
      }
      nerve.interruption =
        eligibility.blockedReason;
      nerve.graceRemaining = 0;
      nerve.progress =
        eligibility.blockedReason ===
          "another_action_active"
          ? nerve.progress
          : 0;
      return;
    }
    nerve.interruption = null;
    if (
      !nerve.tutorialShown &&
      hole.stateBannerLockTimer <= 0
    ) {
      nerve.tutorialShown = true;
      setHoleMessage(
        "HOLD YOUR NERVE -- stay crouched and hold Listening Focus while Joe searches nearby.",
        3.4,
      );
    }
    if (!nerve.active) {
      nerve.graceRemaining = 0;
      nerve.progress = Math.max(
        0,
        nerve.progress - dt * 1.4,
      );
      nerve.blockedReason =
        "hold_listening_focus";
      return;
    }
    nerve.graceRemaining =
      NERVE_HOLD_GRACE_SECONDS;
    if (!wasActive) {
      playUiTone(
        156,
        0.07,
        0.014,
      );
    }
    nerve.progress = Math.min(
      NERVE_HOLD_SECONDS,
      nerve.progress + dt,
    );
    if (
      nerve.progress <
      NERVE_HOLD_SECONDS
    ) {
      return;
    }
    nerve.completions += 1;
    nerve.lastZone =
      eligibility.zone.id;
    nerve.cooldown =
      NERVE_HOLD_COOLDOWN;
    nerve.exitWindow =
      NERVE_EXIT_WINDOW_SECONDS;
    nerve.progress = 0;
    nerve.active = false;
    nerve.armed = false;
    nerve.graceRemaining = 0;
    nerve.interruption = null;
    nerve.blockedReason =
      "zone_already_held";
    const deliveryAward =
      awardDeliveryBeat(
        "NERVE HELD",
        NERVE_HOLD_BONUS,
      );
    hole.stateBanner =
      deliveryAward
        ? `NERVE HELD // +${deliveryAward.amount} DELIVERY`
        : "NERVE HELD // SEARCH SURVIVED";
    hole.stateBannerTimer = 2.5;
    hole.stateBannerLockTimer = 2.5;
    setHoleMessage(
      `NERVE HELD -- Joe passed within ${Math.round(eligibility.joeDistance)}m. Watch for the mint exit lane.`,
      3.4,
    );
    pushThreatCaption(
      "MOWER PASSES WITHOUT CONFIRMING",
      hole.joe,
      "mower",
      2.2,
      "nerve_held",
    );
    playUiTone(
      392,
      0.1,
      0.022,
    );
    playUiTone(
      587,
      0.14,
      0.018,
    );
  }

  function cadenceReadEligibility(
    environment,
    moving,
  ) {
    const hole = state.hole;
    const cadence =
      hole.cadenceRead;
    const zone = courseZoneAt(
      state.player.y,
    );
    const joeDistance =
      worldDistance(
        hole.joe,
        state.player,
      );
    let blockedReason = null;
    if (cadence.forecast) {
      blockedReason =
        "forecast_active";
    } else if (
      cadence.completions >=
      DELIVERY_FAMILY_CAPS.cadence
    ) {
      blockedReason =
        "run_cap_reached";
    } else if (
      cadence.cooldown > 0
    ) {
      blockedReason = "cooldown";
    } else if (
      cadence.lastZone === zone.id
    ) {
      blockedReason =
        "zone_already_read";
    } else if (
      !environment.hardCover &&
      !environment.effectiveRough
    ) {
      blockedReason =
        "not_in_shelter";
    } else if (!hole.crouched) {
      blockedReason = "not_crouched";
    } else if (
      hole.concealment < 0.56
    ) {
      blockedReason =
        "concealment_building";
    } else if (moving) {
      blockedReason = "movement";
    } else if (
      hole.joe.mode !== "patrol"
    ) {
      blockedReason =
        "joe_not_patrolling";
    } else if (
      hole.hasLineOfSight ||
      hole.detection >= 0.2
    ) {
      blockedReason = "exposed";
    } else if (
      joeDistance <
        CADENCE_READ_MIN_JOE_DISTANCE
    ) {
      blockedReason = "too_close";
    } else if (
      joeDistance >
        CADENCE_READ_MAX_JOE_DISTANCE
    ) {
      blockedReason = "too_far";
    } else if (
      hole.escapeFiling.active ||
      hole.escapeFiling.sealing ||
      hole.statusRequest.active ||
      hole.blindsideTransfer ||
      hole.ballAim.active ||
      hole.ballFlight ||
      hole.riskAward ||
      hole.deliveryAward ||
      hole.cutTraceMemory ||
      hole.tensionDirector
        .pendingIntercept
    ) {
      blockedReason =
        "another_action_active";
    }
    return {
      eligible:
        blockedReason === null,
      blockedReason,
      zone,
      joeDistance,
    };
  }

  function cadenceForecastPath() {
    const hole = state.hole;
    const joe = hole.joe;
    const target =
      JOE_PATROL_ROUTE[
        joe.patrolIndex
      ];
    const candidates = [
      {
        x: joe.x,
        y: joe.y,
      },
      ...joe.routePath.slice(0, 7),
      {
        x: target.x,
        y: target.y,
      },
    ];
    const path = [];
    for (
      let index = 0;
      index < candidates.length;
      index += 1
    ) {
      const point = candidates[index];
      const previous =
        path[path.length - 1];
      if (
        !previous ||
        worldDistance(
          previous,
          point,
        ) > 1.25
      ) {
        path.push({
          x: point.x,
          y: point.y,
        });
      }
    }
    return path;
  }

  function updateCadenceRead(
    dt,
    environment,
    moving,
  ) {
    const hole = state.hole;
    const cadence =
      hole.cadenceRead;
    cadence.cooldown = Math.max(
      0,
      cadence.cooldown - dt,
    );
    if (cadence.forecast) {
      cadence.forecast.timer =
        Math.max(
          0,
          cadence.forecast.timer - dt,
        );
      if (
        cadence.forecast.timer <= 0 ||
        hole.joe.mode !== "patrol"
      ) {
        cadence.forecast = null;
      }
    }
    const eligibility =
      cadenceReadEligibility(
        environment,
        moving,
      );
    cadence.joeDistance = Number(
      eligibility.joeDistance.toFixed(
        2,
      ),
    );
    cadence.blockedReason =
      eligibility.blockedReason;
    const wasActive =
      cadence.active;
    cadence.armed =
      eligibility.eligible;
    cadence.active = Boolean(
      eligibility.eligible &&
      hole.focus,
    );
    if (!eligibility.eligible) {
      cadence.progress = 0;
      return;
    }
    if (
      !cadence.tutorialShown &&
      hole.stateBannerLockTimer <= 0 &&
      hole.messageTimer < 0.8
    ) {
      cadence.tutorialShown = true;
      setHoleMessage(
        "MOWER CADENCE -- stay crouched, hold Listening Focus, and read Joe's next turn.",
        3.2,
      );
    }
    if (!cadence.active) {
      cadence.progress = Math.max(
        0,
        cadence.progress - dt * 1.6,
      );
      cadence.blockedReason =
        "hold_listening_focus";
      return;
    }
    if (!wasActive) {
      playUiTone(
        132,
        0.08,
        0.014,
      );
    }
    cadence.progress = Math.min(
      CADENCE_READ_SECONDS,
      cadence.progress + dt,
    );
    if (
      cadence.progress <
      CADENCE_READ_SECONDS
    ) {
      return;
    }
    const targetIndex =
      hole.joe.patrolIndex;
    const target =
      JOE_PATROL_ROUTE[
        targetIndex
      ];
    const path =
      cadenceForecastPath();
    cadence.completions += 1;
    cadence.lastZone =
      eligibility.zone.id;
    cadence.cooldown =
      CADENCE_READ_COOLDOWN;
    cadence.progress = 0;
    cadence.active = false;
    cadence.armed = false;
    cadence.blockedReason =
      "forecast_active";
    cadence.forecast = {
      targetIndex,
      target: {
        x: target.x,
        y: target.y,
      },
      path,
      timer:
        CADENCE_FORECAST_SECONDS,
      duration:
        CADENCE_FORECAST_SECONDS,
      zone:
        courseZoneAt(
          target.y,
        ).id,
    };
    const deliveryAward =
      awardDeliveryBeat(
        "MOWER CADENCE READ",
        CADENCE_READ_BONUS,
      );
    hole.stateBanner =
      deliveryAward
        ? `CADENCE READ // +${deliveryAward.amount} DELIVERY`
        : "CADENCE READ // ROUTE FORECAST";
    hole.stateBannerTimer = 2.3;
    hole.stateBannerLockTimer = 2.3;
    setHoleMessage(
      `ROUTE FORECAST -- Joe committed to ${courseZoneAt(target.y).name}. Move before the cadence changes.`,
      3.2,
    );
    addWorldEffect(
      "cadence_read",
      target.x,
      target.y,
      1.8,
    );
    playUiTone(
      294,
      0.1,
      0.02,
    );
    playUiTone(
      440,
      0.14,
      0.016,
    );
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
    if (
      !hole.trackTutorialShown &&
      hole.joe.mode !== "chase"
    ) {
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
    const previousCut =
      joe.lastCutPoint;
    const cutDistance =
      worldDistance(
        joe,
        previousCut,
      );
    if (cutDistance < MOWED_MARK_SPACING) {
      return;
    }
    if (
      cutDistance >
      MOWED_MARK_SPACING * 3.2
    ) {
      joe.lastCutPoint = {
        x: joe.x,
        y: joe.y,
      };
      return;
    }
    const heading = Math.atan2(
      joe.y - previousCut.y,
      joe.x - previousCut.x,
    );
    addTurfMark(
      "mowed",
      lerp(
        previousCut.x,
        joe.x,
        0.5,
      ),
      lerp(
        previousCut.y,
        joe.y,
        0.5,
      ),
      {
        heading,
        radius: 7.4,
        length: clamp(
          cutDistance + 1.4,
          6.4,
          8.2,
        ),
        laneWidth: 4.4,
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

  function resolveTrailChain() {
    const hole = state.hole;
    const chainDepth =
      hole.trailChain;
    hole.trailChain = 0;
    hole.trailChainTimer = 0;
    hole.trailTarget = null;
    hole.trailApproachTimer = 0;
    if (
      chainDepth <
        TRAIL_BREAK_MIN_CHAIN ||
      hole.joe.mode === "chase" ||
      hole.escapeFiling.active ||
      hole.escapeFiling.sealing
    ) {
      return null;
    }
    hole.trailBreaks += 1;
    hole.bestTrailBreak =
      Math.max(
        hole.bestTrailBreak,
        chainDepth,
      );
    hole.trailColdTimer =
      TRAIL_COLD_SECONDS;
    hole.trailWarningTimer = 0;
    hole.detection = Math.min(
      hole.detection,
      0.08,
    );
    hole.joe.alert = Math.min(
      hole.joe.alert,
      0.16,
    );
    const deliveryAward =
      awardDeliveryBeat(
        "EVIDENCE CHAIN BROKEN",
        TRAIL_BREAK_BONUS,
      );
    hole.stateBanner =
      `EVIDENCE DENIED // ×${chainDepth} TRAIL WENT COLD`;
    hole.stateBannerTimer = 2.85;
    hole.stateBannerLockTimer =
      2.85;
    setHoleMessage(
      "TRAIL COLD — Joe lost the evidence line. Move before he resumes patrol.",
      3.15,
    );
    addWorldEffect(
      "trail_cold",
      state.player.x,
      state.player.y,
      2.25,
    );
    pushThreatCaption(
      "JOE LOSES THE TRAIL",
      hole.joe,
      "world",
      2.45,
      "trail_cold",
    );
    playUiTone(
      294,
      0.12,
      0.026,
    );
    playUiTone(
      440,
      0.18,
      0.022,
    );
    return {
      chainDepth,
      deliveryAward,
    };
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
      !state.hole
    ) {
      return 1;
    }
    let power = 1;
    if (state.hole.blackoutTimer > 0) {
      if (state.hole.blackoutTimer <= 1.2) {
        power = lerp(
          0.22,
          1,
          1 -
            state.hole.blackoutTimer / 1.2,
        );
      } else {
        const flicker = hash(
          Math.floor(
            state.hole.elapsed * 13.5,
          ) * 17.31,
        );
        power =
          flicker > 0.56 ? 0.08 : 0.52;
      }
    }
    const horror =
      state.hole.horrorDirector;
    if (
      horror &&
      horror.lightFailureSeconds > 0
    ) {
      const failurePower =
        state.reducedMotion
          ? 0.38
          : hash(
                  Math.floor(
                    state.hole.elapsed * 22,
                  ) *
                    31.7 +
                  horror.eventCount,
                ) > 0.62
            ? 0.68
            : 0.12;
      power = Math.min(
        power,
        failurePower,
      );
    }
    return power;
  }

  function floodlightPowerAt(
    obstacle,
    lightIndex = 0,
  ) {
    const basePower =
      floodlightPower();
    if (
      !obstacle ||
      !obstacle.id.startsWith(
        "range-light",
      ) ||
      !state.hole
    ) {
      return basePower;
    }
    if (state.reducedMotion) {
      return basePower * 0.84;
    }
    const cycle =
      (
        state.hole.elapsed *
          1.72 +
        lightIndex * 1.31
      ) %
      5.4;
    const brownout =
      cycle < 0.1
        ? 0.14
        : cycle < 0.2
          ? 0.48
          : cycle > 4.82 &&
              cycle < 4.92
            ? 0.34
            : 1;
    return basePower * brownout;
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
            floodlightPowerAt(
              obstacle,
              index,
            ),
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
      recentJoeCut:
        turf.recentJoeCut,
      recentJoeCutDistance:
        turf.recentJoeCutDistance,
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

  function courseCameraMotion() {
    if (
      !state.hole.cameraMotion
    ) {
      state.hole.cameraMotion =
        freshCourseCameraMotion();
    }
    return state.hole.cameraMotion;
  }

  function updateCourseCameraMotion(
    dt,
    lateralInput,
    sprinting,
  ) {
    const motion =
      courseCameraMotion();
    const input =
      Math.abs(lateralInput) < 0.04
        ? 0
        : clamp(
            lateralInput,
            -1,
            1,
          );
    let amplitude =
      state.hole.focus
        ? COURSE_CAMERA
            .lateralFocusPixels
        : state.hole.crouched
          ? COURSE_CAMERA
              .lateralCrouchPixels
          : sprinting
            ? COURSE_CAMERA
                .lateralSprintPixels
            : COURSE_CAMERA
                .lateralWalkPixels;
    if (state.reducedMotion) {
      amplitude *= 0.34;
    }
    motion.lateralInput =
      input;
    motion.targetOffsetX =
      -input *
      amplitude;
    motion.targetRoll =
      state.reducedMotion
        ? 0
        : -input *
          (
            sprinting
              ? COURSE_CAMERA
                  .sprintRollRadians
              : COURSE_CAMERA
                  .maxRollRadians
          );
    const response =
      input === 0
        ? COURSE_CAMERA
            .lateralReturnResponse
        : COURSE_CAMERA
            .lateralResponse;
    const blend =
      1 -
      Math.exp(
        -dt * response,
      );
    motion.offsetX = lerp(
      motion.offsetX,
      motion.targetOffsetX,
      blend,
    );
    motion.roll = lerp(
      motion.roll,
      motion.targetRoll,
      blend,
    );
    motion.response = blend;
    if (
      input === 0 &&
      Math.abs(motion.offsetX) <
        0.03
    ) {
      motion.offsetX = 0;
    }
    if (
      input === 0 &&
      Math.abs(motion.roll) <
        0.00002
    ) {
      motion.roll = 0;
    }
  }

  function applyCourseCameraTransform() {
    const frame =
      courseCameraFrameTransform();
    ctx.translate(
      frame.viewportShift,
      frame.verticalShift,
    );
    ctx.translate(
      WIDTH * 0.5,
      HEIGHT * 0.5,
    );
    ctx.rotate(
      frame.roll,
    );
    ctx.scale(
      frame.scale,
      frame.scale,
    );
    ctx.translate(
      -WIDTH * 0.5,
      -HEIGHT * 0.5,
    );
  }

  function courseCameraFrameTransform() {
    if (
      renderFrameCache.cameraFrame
    ) {
      return renderFrameCache.cameraFrame;
    }
    const motion =
      courseCameraMotion();
    const locomotion =
      courseLocomotionState();
    const viewportShift =
      courseViewportShiftX();
    const strength =
      clamp(
        Math.abs(
          motion.offsetX,
        ) /
          COURSE_CAMERA
            .lateralSprintPixels,
        0,
        1,
      );
    const frameRoll =
      motion.roll +
      locomotion.roll;
    const scale =
      1 +
      Math.abs(
        viewportShift,
      ) *
        2 /
        WIDTH +
      Math.abs(
        frameRoll,
      ) *
        WIDTH /
        HEIGHT +
      strength *
        0.004 +
      locomotion.zoom;
    renderFrameCache.cameraFrame = {
      viewportShift,
      verticalShift:
        locomotion.verticalShift,
      roll: frameRoll,
      scale,
    };
    return renderFrameCache.cameraFrame;
  }

  function transformCourseScreenPoint(
    point,
  ) {
    const frame =
      courseCameraFrameTransform();
    const relativeX =
      (
        point.x -
        WIDTH * 0.5
      ) *
      frame.scale;
    const relativeY =
      (
        point.y -
        HEIGHT * 0.5
      ) *
      frame.scale;
    const cosine =
      Math.cos(
        frame.roll,
      );
    const sine =
      Math.sin(
        frame.roll,
      );
    return {
      x:
        WIDTH * 0.5 +
        frame.viewportShift +
        relativeX *
          cosine -
        relativeY *
          sine,
      y:
        HEIGHT * 0.5 +
        frame.verticalShift +
        relativeX *
          sine +
        relativeY *
          cosine,
      scale:
        frame.scale,
    };
  }

  function courseViewportShiftX() {
    const motion =
      courseCameraMotion();
    return motion.offsetX *
      (
        state.reducedMotion
          ? COURSE_CAMERA
              .reducedViewportShiftRatio
          : COURSE_CAMERA
              .viewportShiftRatio
      );
  }

  function courseLocomotionState() {
    if (renderFrameCache.locomotion) {
      return renderFrameCache.locomotion;
    }
    const moving =
      state.mode === "first_hole" &&
      playerIsMoving();
    const sprinting =
      moving &&
      !state.hole.crouched &&
      !state.hole.focus &&
      sprintHeld();
    const crouched =
      moving && state.hole.crouched;
    const secondWind =
      moving &&
      state.hole.secondWindTimer > 0 &&
      !state.hole.crouched &&
      !state.hole.focus;
    const panic =
      clamp(
        state.hole.panicMomentum ||
          0,
        0,
        1,
      );
    const cadence = sprinting
      ? secondWind
        ? 14.2 +
          panic * 1.1
        : 12.7 +
          panic * 1.5
      : crouched
        ? 6.1
        : 8.9 +
          panic * 2.5;
    const phase =
      state.hole.elapsed * cadence;
    const baseBob = sprinting
      ? 5.4 +
        panic * 1.55
      : crouched
        ? 1.25
        : moving
          ? 3.15 +
            panic * 1.35
          : 0.65;
    const strideImpact =
      moving &&
      !crouched &&
      !state.reducedMotion
        ? Math.pow(
            Math.max(
              0,
              -Math.sin(
                phase,
              ),
            ),
            5,
          ) *
          panic
        : 0;
    const bob =
      state.reducedMotion
        ? 0
        : Math.sin(phase) *
            baseBob +
          Math.sin(phase * 2) *
            baseBob *
            0.22;
    renderFrameCache.locomotion = {
      moving,
      sprinting,
      crouched,
      secondWind,
      phase,
      bob,
      panic,
      strideImpact,
      cadence,
      roll:
        state.reducedMotion ||
        !moving ||
        crouched
          ? 0
          : Math.sin(
              phase * 0.5,
            ) *
            (
              sprinting
                ? 0.0048
                : 0.0029
            ) *
            (
              0.45 +
              panic * 0.55
            ),
      intensity: sprinting
        ? secondWind
          ? 1.2 +
            panic * 0.12
          : 0.96 +
            panic * 0.22
        : moving
          ? secondWind
            ? 0.78 +
              panic * 0.16
            : 0.52 +
              panic * 0.3
          : 0,
      zoom: state.reducedMotion
        ? 0
        : sprinting
          ? 0.012 +
            panic * 0.006 +
            (
              Math.sin(phase) +
              1
            ) *
              0.0025
            +
            (
              secondWind
                ? 0.004
                : 0
            )
          : moving &&
              !crouched
            ? 0.0035 +
              panic * 0.0045 +
              (
                secondWind
                  ? 0.004
                  : 0
              )
            : 0,
      verticalShift:
        state.reducedMotion
          ? 0
          : bob * 0.74 +
            strideImpact *
              (
                sprinting
                  ? 2.6
                  : 1.55
              ),
    };
    return renderFrameCache.locomotion;
  }

  function forwardMotionStreakCount(
    locomotion,
  ) {
    if (
      !locomotion.moving ||
      state.reducedMotion
    ) {
      return 0;
    }
    const base =
      locomotion.sprinting
        ? locomotion.secondWind
          ? 15
          : 12
        : locomotion.secondWind
          ? 9
          : 6;
    return (
      base +
      Math.round(
        locomotion.panic *
          (
            locomotion.sprinting
              ? 5
              : 4
          ),
      )
    );
  }

  function drawLateralCameraFeedback() {
    const motion =
      courseCameraMotion();
    const strength =
      clamp(
        Math.abs(
          motion.offsetX,
        ) /
          COURSE_CAMERA
            .lateralSprintPixels,
        0,
        1,
      );
    if (
      strength < 0.06
    ) {
      return;
    }
    const movingRight =
      motion.lateralInput > 0;
    const edgeX =
      movingRight
        ? WIDTH
        : 0;
    const innerX =
      movingRight
        ? WIDTH - 88
        : 88;
    const edgeFade =
      ctx.createLinearGradient(
        edgeX,
        0,
        innerX,
        0,
      );
    edgeFade.addColorStop(
      0,
      `rgba(128,158,119,${
        strength *
        (
          state.reducedMotion
            ? 0.055
            : 0.12
        )
      })`,
    );
    edgeFade.addColorStop(
      1,
      "rgba(128,158,119,0)",
    );
    ctx.fillStyle =
      edgeFade;
    ctx.fillRect(
      Math.min(
        edgeX,
        innerX,
      ),
      COURSE_CAMERA.horizonY,
      Math.abs(
        edgeX - innerX,
      ),
      HEIGHT -
        COURSE_CAMERA.horizonY,
    );
    if (
      state.reducedMotion
    ) {
      return;
    }
    ctx.save();
    ctx.globalAlpha =
      strength * 0.24;
    ctx.strokeStyle =
      "#a6bd88";
    ctx.lineWidth = 1.5;
    for (
      let index = 0;
      index < 5;
      index += 1
    ) {
      const y =
        HEIGHT -
        72 -
        index * 43;
      const length =
        16 +
        index * 7;
      ctx.beginPath();
      ctx.moveTo(
        movingRight
          ? WIDTH - 8
          : 8,
        y,
      );
      ctx.lineTo(
        movingRight
          ? WIDTH -
              8 -
              length
          : 8 + length,
        y -
          3 -
          index,
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawForwardMotionFeedback() {
    const locomotion =
      courseLocomotionState();
    if (
      !locomotion.moving ||
      state.reducedMotion
    ) {
      return;
    }
    const intensity =
      locomotion.intensity;
    const streakCount =
      forwardMotionStreakCount(
        locomotion,
      );
    ctx.save();
    ctx.strokeStyle =
      locomotion.secondWind
        ? "rgba(126,226,186,0.38)"
        : locomotion.sprinting
        ? `rgba(198,210,155,${
            0.3 +
            locomotion.panic * 0.09
          })`
        : `rgba(177,193,146,${
            0.17 +
            locomotion.panic * 0.09
          })`;
    ctx.lineWidth =
      locomotion.sprinting
        ? 2 +
          locomotion.panic * 0.45
        : 1 +
          locomotion.panic * 0.35;
    for (
      let index = 0;
      index < streakCount;
      index += 1
    ) {
      const side =
        index % 2 === 0
          ? -1
          : 1;
      const lane =
        94 +
        hash(index * 47 + 9) *
          460;
      const x =
        WIDTH * 0.5 +
        side * lane;
      const phase =
        (
          state.hole.elapsed *
            (
              locomotion.sprinting
                ? 480 +
                  locomotion.panic *
                    140
                : 250 +
                  locomotion.panic *
                    120
            ) +
          index * 71
        ) %
        310;
      const y =
        COURSE_CAMERA.horizonY +
        90 +
        phase;
      const length =
        (
          8 +
          phase * 0.08
        ) *
        intensity;
      ctx.beginPath();
      ctx.moveTo(
        x,
        y,
      );
      ctx.lineTo(
        x +
          side * length * 0.32,
        y + length,
      );
      ctx.stroke();
    }
    const rushCount =
      Math.max(
        4,
        Math.round(
          (
            locomotion.sprinting
              ? 16
              : 10
          ) *
            effectQualityScale(),
        ),
      );
    ctx.strokeStyle =
      `rgba(151,176,116,${
        0.1 +
        locomotion.panic * 0.18
      })`;
    for (
      let index = 0;
      index < rushCount;
      index += 1
    ) {
      const side =
        index % 2 === 0
          ? -1
          : 1;
      const edge =
        hash(index * 61 + 17);
      const x =
        side < 0
          ? 18 +
            edge * 220
          : WIDTH -
            18 -
            edge * 220;
      const travel =
        (
          state.hole.elapsed *
            (
              locomotion.sprinting
                ? 720
                : 430
            ) +
          index * 89
        ) %
        360;
      const y =
        COURSE_CAMERA.horizonY +
        88 +
        travel;
      const length =
        (
          14 +
          travel * 0.1
        ) *
        (
          0.66 +
          locomotion.panic * 0.7
        );
      ctx.beginPath();
      ctx.moveTo(
        x,
        y,
      );
      ctx.lineTo(
        x +
          side *
            length *
            0.4,
        y + length,
      );
      ctx.stroke();
    }
    if (
      !locomotion.crouched &&
      locomotion.panic > 0.22
    ) {
      const tunnel =
        ctx.createRadialGradient(
          WIDTH * 0.5,
          HEIGHT * 0.5,
          HEIGHT * 0.28,
          WIDTH * 0.5,
          HEIGHT * 0.5,
          WIDTH * 0.7,
        );
      tunnel.addColorStop(
        0,
        "rgba(7,13,8,0)",
      );
      tunnel.addColorStop(
        1,
        `rgba(5,8,5,${
          (
            locomotion.sprinting
              ? 0.1
              : 0.025
          ) +
          locomotion.panic *
            (
              locomotion.sprinting
                ? 0.085
                : 0.065
            ) +
          Math.abs(
            Math.sin(
              locomotion.phase,
            ),
          ) *
            0.035
        })`,
      );
      ctx.fillStyle = tunnel;
      ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT,
      );
    }
    ctx.restore();
  }

  function drawSecondWindFeedback() {
    const hole = state.hole;
    if (
      hole.secondWindTimer <= 0 ||
      hole.secondWindDuration <= 0 ||
      hole.riskAward
    ) {
      return;
    }
    const progress = clamp(
      hole.secondWindTimer /
        hole.secondWindDuration,
      0,
      1,
    );
    const width = 286;
    const height = 38;
    const x =
      WIDTH * 0.5 - width * 0.5;
    const y = HEIGHT - 158;
    ctx.save();
    ctx.globalAlpha =
      state.reducedMotion
        ? 0.86
        : 0.82 +
          Math.sin(
            state.hole.elapsed * 12,
          ) *
            0.08;
    ctx.fillStyle =
      "rgba(3,13,9,0.9)";
    ctx.fillRect(
      x,
      y,
      width,
      height,
    );
    strokeRect(
      x,
      y,
      width,
      height,
      "#72cfa7",
      2,
    );
    ctx.fillStyle =
      "rgba(29,55,39,0.96)";
    ctx.fillRect(
      x + 10,
      y + height - 9,
      width - 20,
      4,
    );
    ctx.fillStyle = "#82ddb7";
    ctx.fillRect(
      x + 10,
      y + height - 9,
      (
        width - 20
      ) *
        progress,
      4,
    );
    drawText(
      `SECOND WIND  ${hole.secondWindTimer.toFixed(1)}s  //  +14% PACE`,
      WIDTH * 0.5,
      y + 21,
      11,
      "#c8f0d8",
      "center",
      true,
    );
    ctx.restore();
  }

  function blindsideLaneState() {
    const hole = state.hole;
    if (hole.blindsideTransfer) {
      return {
        active: true,
        options:
          hole.blindsideTransfer
            .destinations || [],
      };
    }
    if (
      hole.blindsidePreview
        ?.options?.length > 0
    ) {
      return {
        active: false,
        options:
          hole.blindsidePreview
            .options,
      };
    }
    return null;
  }

  function blindsideLaneDirection(
    option,
  ) {
    if (!option) {
      return "COVER";
    }
    const deltaX =
      option.x - state.player.x;
    const deltaY =
      option.y - state.player.y;
    const lateral =
      Math.abs(deltaX) > 12
        ? deltaX < 0
          ? "LEFT"
          : "RIGHT"
        : "";
    if (deltaY < -5) {
      return lateral
        ? `BACK ${lateral}`
        : "BEHIND";
    }
    return lateral || "AHEAD";
  }

  function drawBlindsideEdgeCue(
    option,
    active,
    danger,
  ) {
    const direction =
      blindsideLaneDirection(
        option,
      );
    const distance =
      option.remainingDistance ??
      option.distance;
    const x =
      direction.includes("LEFT")
        ? 196
        : direction.includes(
              "RIGHT",
            )
          ? WIDTH - 454
          : WIDTH * 0.5;
    const y = HEIGHT - 286;
    const color = danger
      ? "#e09d4f"
      : "#75cda9";
    const arrowX = x - 111;
    const arrowY = y;
    ctx.save();
    ctx.globalAlpha = active
      ? 0.94
      : 0.82;
    ctx.fillStyle =
      "rgba(3,13,10,0.92)";
    ctx.fillRect(
      x - 137,
      y - 20,
      274,
      40,
    );
    strokeRect(
      x - 137,
      y - 20,
      274,
      40,
      color,
      active ? 2 : 1.5,
    );
    ctx.fillStyle = color;
    const arrowPoints =
      direction.includes("LEFT")
        ? [
            [arrowX - 8, arrowY],
            [arrowX + 5, arrowY - 8],
            [arrowX + 5, arrowY + 8],
          ]
        : direction.includes(
              "RIGHT",
            )
          ? [
              [arrowX + 8, arrowY],
              [arrowX - 5, arrowY - 8],
              [arrowX - 5, arrowY + 8],
            ]
          : direction === "BEHIND"
            ? [
                [arrowX, arrowY + 8],
                [arrowX - 8, arrowY - 5],
                [arrowX + 8, arrowY - 5],
              ]
            : [
                [arrowX, arrowY - 8],
                [arrowX - 8, arrowY + 5],
                [arrowX + 8, arrowY + 5],
              ];
    polygon(arrowPoints);
    const cueText =
      option.requiresCrouch
        ? inputCopy(
            `${keyboardBindingLabel("crouch")} CROUCH LANE // ${direction}  ${Math.ceil(distance)}m`,
            `LB CROUCH LANE // ${direction}  ${Math.ceil(distance)}m`,
            `CROUCH LANE // ${direction}  ${Math.ceil(distance)}m`,
          )
        : `MINT LANE A // ${direction}  ${Math.ceil(distance)}m`;
    drawText(
      cueText,
      x + 11,
      y + 4,
      10,
      danger
        ? "#f1bc78"
        : "#c7f0dc",
      "center",
      true,
    );
    ctx.restore();
  }

  function drawBlindsideTransferPath() {
    const transfer =
      state.hole.blindsideTransfer;
    const lane =
      blindsideLaneState();
    if (!lane) {
      return;
    }
    const player =
      worldToScreen(
        state.player.x,
        state.player.y,
      );
    const progress = transfer
      ? clamp(
          transfer.distance /
            BLINDSIDE_TRANSFER_DISTANCE,
          0,
          1,
        )
      : 0;
    const danger = Boolean(
      transfer &&
      transfer.joeAlignment > 0.12,
    );
    const color = danger
      ? "224,157,79"
      : "117,205,169";
    ctx.save();
    if (transfer) {
      const start =
        worldToScreen(
          transfer.startX,
          transfer.startY,
        );
      if (
        start.visible &&
        player.visible
      ) {
        ctx.globalAlpha =
          0.28 +
          progress * 0.28;
        ctx.strokeStyle =
          `rgba(${color},0.76)`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 7]);
        ctx.lineDashOffset =
          state.reducedMotion
            ? 0
            : -state.hole.elapsed *
                18;
        ctx.beginPath();
        ctx.moveTo(
          start.x,
          start.y,
        );
        ctx.quadraticCurveTo(
          (
            start.x +
            player.x
          ) *
            0.5,
          Math.min(
            start.y,
            player.y,
          ) -
            16,
          player.x,
          player.y,
        );
        ctx.stroke();
      }
    }
    for (
      let index =
        lane.options.length - 1;
      index >= 0;
      index -= 1
    ) {
      const option =
        lane.options[index];
      const point =
        worldToScreen(
          option.x,
          option.y,
        );
      if (
        !point.visible ||
        point.x < 70 ||
        point.x > WIDTH - 70
      ) {
        if (index === 0) {
          drawBlindsideEdgeCue(
            option,
            lane.active,
            danger,
          );
        }
        continue;
      }
      const primary = index === 0;
      const alpha = lane.active
        ? primary
          ? 0.9
          : 0.55
        : primary
          ? 0.7
          : 0.36;
      const radiusX = clamp(
        15 * point.scale,
        6,
        26,
      );
      const radiusY = clamp(
        6 * point.scale,
        3,
        12,
      );
      ctx.globalAlpha = alpha;
      ctx.strokeStyle =
        `rgba(${color},0.96)`;
      ctx.lineWidth = primary
        ? 2.5
        : 1.5;
      ctx.setLineDash(
        primary ? [] : [4, 5],
      );
      ctx.beginPath();
      ctx.moveTo(
        player.x,
        player.y - 6,
      );
      ctx.lineTo(
        point.x,
        point.y,
      );
      ctx.stroke();
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
      ctx.stroke();
      if (option.requiresCrouch) {
        ctx.strokeStyle =
          "rgba(151,205,126,0.9)";
        ctx.lineWidth = primary
          ? 2
          : 1.2;
        const bladeHeight = clamp(
          13 * point.scale,
          6,
          18,
        );
        for (
          let blade = -2;
          blade <= 2;
          blade += 1
        ) {
          const rootX =
            point.x +
            blade *
              radiusX *
              0.23;
          ctx.beginPath();
          ctx.moveTo(
            rootX,
            point.y,
          );
          ctx.lineTo(
            rootX +
              blade * 0.7,
            point.y -
              bladeHeight *
                (
                  0.72 +
                  (
                    2 -
                    Math.abs(blade)
                  ) *
                    0.1
                ),
          );
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
      const diamondSize = primary
        ? 7
        : 4.5;
      ctx.fillStyle =
        `rgba(${color},0.92)`;
      polygon([
        [
          point.x,
          point.y -
            diamondSize,
        ],
        [
          point.x +
            diamondSize,
          point.y,
        ],
        [
          point.x,
          point.y +
            diamondSize,
        ],
        [
          point.x -
            diamondSize,
          point.y,
        ],
      ]);
      if (primary) {
        const distance =
          lane.active
            ? option.remainingDistance
            : option.distance;
        const labelX = clamp(
          point.x,
          172,
          WIDTH - 322,
        );
        const labelY = clamp(
          point.y -
            radiusY -
            18,
          COURSE_CAMERA.horizonY +
            24,
          HEIGHT - 242,
        );
        ctx.globalAlpha =
          lane.active ? 0.94 : 0.82;
        ctx.fillStyle =
          "rgba(3,13,10,0.9)";
        ctx.fillRect(
          labelX - 105,
          labelY - 14,
          210,
          26,
        );
        strokeRect(
          labelX - 105,
          labelY - 14,
          210,
          26,
          danger
            ? "#e09d4f"
            : "#75cda9",
          1.5,
        );
        drawText(
          option.requiresCrouch
            ? inputCopy(
                `ROUGH A // ${keyboardBindingLabel("crouch")} CROUCH  ${Math.ceil(distance)}m`,
                `ROUGH A // LB CROUCH  ${Math.ceil(distance)}m`,
                `ROUGH A // CROUCH  ${Math.ceil(distance)}m`,
              )
            : `LANE A // ${option.label.toUpperCase()}  ${Math.ceil(distance)}m`,
          labelX,
          labelY + 4,
          9,
          danger
            ? "#f1bc78"
            : "#c7f0dc",
          "center",
          true,
        );
      }
    }
    ctx.restore();
  }

  function drawBlindsideTransferFeedback() {
    const hole = state.hole;
    const transfer =
      hole.blindsideTransfer;
    if (
      !transfer ||
      hole.joe.mode === "chase" ||
      hole.riskAward ||
      hole.deliveryAward ||
      hole.tutorialVisible
    ) {
      return;
    }
    const width = 368;
    const height = 48;
    const x =
      WIDTH * 0.5 -
      width * 0.5;
    const y = HEIGHT - 190;
    const distanceProgress =
      clamp(
        transfer.distance /
          BLINDSIDE_TRANSFER_DISTANCE,
        0,
        1,
      );
    const timeProgress =
      clamp(
        transfer.timer /
          transfer.duration,
        0,
        1,
      );
    const danger =
      transfer.joeAlignment > 0.12;
    const color = danger
      ? "#e09d4f"
      : "#75cda9";
    const primaryDestination =
      transfer.destinations?.[0];
    const primaryEnvironment =
      getPlayerEnvironmentState();
    const roughConcealmentProgress =
      primaryDestination
        ?.requiresCrouch &&
      primaryEnvironment.effectiveRough
        ? clamp(
            hole.concealment /
              (
                primaryDestination
                  .concealmentRequired ||
                0.56
              ),
            0,
            1,
          )
        : 0;
    const instruction =
      transfer.distance >=
        BLINDSIDE_TRANSFER_DISTANCE
        ? primaryDestination
          ? primaryDestination
              .requiresCrouch
            ? primaryEnvironment
                .effectiveRough
              ? inputCopy(
                  `${keyboardBindingLabel("crouch")} CROUCH // CONCEAL ${Math.round(roughConcealmentProgress * 100)}%`,
                  `LB CROUCH // CONCEAL ${Math.round(roughConcealmentProgress * 100)}%`,
                  `HOLD CROUCH // CONCEAL ${Math.round(roughConcealmentProgress * 100)}%`,
                )
              : inputCopy(
                  `${keyboardBindingLabel("crouch")} CROUCH IN ROUGH ${Math.ceil(primaryDestination.remainingDistance)}m`,
                  `LB CROUCH IN ROUGH ${Math.ceil(primaryDestination.remainingDistance)}m`,
                  `CROUCH IN ROUGH ${Math.ceil(primaryDestination.remainingDistance)}m`,
                )
            : `MINT COVER ${Math.ceil(primaryDestination.remainingDistance)}m`
          : "ENTER DIFFERENT COVER"
        : `NEW COVER ${Math.floor(
            transfer.distance,
          )}/${BLINDSIDE_TRANSFER_DISTANCE}m`;
    ctx.save();
    ctx.globalAlpha =
      state.reducedMotion
        ? 0.92
        : 0.87 +
          Math.sin(
            hole.elapsed * 9,
          ) *
            0.05;
    ctx.fillStyle =
      "rgba(3,13,10,0.92)";
    ctx.fillRect(
      x,
      y,
      width,
      height,
    );
    strokeRect(
      x,
      y,
      width,
      height,
      color,
      2,
    );
    ctx.fillStyle =
      "rgba(26,53,40,0.96)";
    ctx.fillRect(
      x + 12,
      y + height - 10,
      width - 24,
      5,
    );
    ctx.fillStyle = color;
    ctx.fillRect(
      x + 12,
      y + height - 10,
      (
        width -
        24
      ) *
        distanceProgress,
      5,
    );
    ctx.globalAlpha *=
      0.46;
    ctx.fillStyle = color;
    ctx.fillRect(
      x + 12,
      y + height - 5,
      (
        width -
        24
      ) *
        timeProgress,
      2,
    );
    ctx.globalAlpha =
      state.reducedMotion
        ? 0.92
        : 0.87 +
          Math.sin(
            hole.elapsed * 9,
          ) *
            0.05;
    drawText(
      `BLINDSIDE ${transfer.timer.toFixed(1)}s  •  ${
        danger
          ? "JOE TURNING"
          : instruction
      }`,
      WIDTH * 0.5,
      y + 25,
      11,
      danger
        ? "#f1bc78"
        : "#c7f0dc",
      "center",
      true,
    );
    ctx.restore();
  }

  function worldToScreen(x, y) {
    const cameraMotion =
      courseCameraMotion();
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
          pixelsPerMeter +
        cameraMotion.offsetX *
          0.46,
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
    const reviews =
      activeSprintReviews();
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
            .changeRequestCollected &&
          !state.hole.appealUsed,
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
    for (
      let index = 0;
      index < reviews.length;
      index += 1
    ) {
      const review =
        reviews[index];
      definitions.push({
        id: review.id,
        label: review.code,
        target: review,
        available:
          !sprintReviewCleared(
            review,
          ),
        worldImage:
          "generated-sprint-review-signage",
      });
    }
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
      if (
        effectQualityScale() < 0.55 &&
        index % 4 !== 0
      ) {
        continue;
      }
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
      existing.text = text;
      existing.age = 0;
      existing.duration = duration;
      existing.direction = directionFromPlayer(source);
      existing.category =
        category;
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

  function activeHudPresentationFocus() {
    const hole = state.hole;
    if (
      hole.escapeFiling.active ||
      hole.escapeFiling.sealing
    ) {
      return "final_filing";
    }
    if (hole.appealReviewTimer > 0) {
      return "emergency_appeal";
    }
    if (hole.statusRequest.active) {
      return "status_request";
    }
    if (hole.riskAward) {
      return "risk_premium";
    }
    if (hole.deliveryAward) {
      return "delivery_award";
    }
    if (
      hole.trailWarningTimer > 0 &&
      hole.trailChain > 0
    ) {
      return "trail_evidence";
    }
    if (
      hole.joe.mode === "chase"
    ) {
      return "pursuit";
    }
    if (hole.blindsideTransfer) {
      return "blindside_transfer";
    }
    if (hole.cadenceRead?.active) {
      return "cadence_read";
    }
    if (hole.zoneBannerTimer > 0) {
      return "zone_arrival";
    }
    return "field";
  }

  function drawThreatCaptions() {
    if (
      !state.threatCaptions ||
      !state.hole.captions?.length ||
      state.hole.tutorialVisible
    ) {
      return;
    }
    const focus =
      activeHudPresentationFocus();
    if (
      focus === "pursuit" ||
      focus ===
        "blindside_transfer" ||
      focus === "emergency_appeal" ||
      focus === "status_request"
    ) {
      return;
    }
    const focused =
      focus !== "field";
    const captions =
      state.hole.captions.slice(
        focused ? -1 : -2,
      );
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
        (
          focused
            ? 504
            : 494
        ) +
          index * 38,
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
      hole.tutorialVisible ||
      hole.riskAward ||
      hole.deliveryAward ||
      activeHudPresentationFocus() ===
        "trail_evidence" ||
      activeHudPresentationFocus() ===
        "emergency_appeal" ||
      activeHudPresentationFocus() ===
        "status_request" ||
      activeHudPresentationFocus() ===
        "cadence_read"
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

  function addPlayerGroundResponse(
    environment,
    sprinting,
  ) {
    const hole = state.hole;
    const serial =
      hole.playerStepSerial;
    const side =
      serial % 2 === 0
        ? -1
        : 1;
    const sideX =
      -Math.sin(
        state.player.heading,
      );
    const sideY =
      Math.cos(
        state.player.heading,
      );
    const footOffset =
      state.hole.crouched
        ? 0.72
        : 1.02;
    const kind =
      environment.sand
        ? "sand"
        : environment.wet
          ? "wet"
          : environment.effectiveRough
            ? "rough"
            : "fairway";
    const intensity =
      state.hole.crouched
        ? 0.46
        : sprinting
          ? 1
          : 0.72;
    hole.playerStepSerial += 1;
    hole.groundResponses.push({
      id: serial,
      kind,
      x:
        state.player.x +
        sideX *
          footOffset *
          side,
      y:
        state.player.y +
        sideY *
          footOffset *
          side,
      heading:
        state.player.heading,
      intensity,
      age: 0,
      duration:
        kind === "wet"
          ? 1.45
          : kind === "rough"
            ? 1.3
            : kind === "sand"
              ? 1.05
              : 1.12,
      seed: hash(
        serial * 47.3 +
          hole.travelDistance *
            11.7,
      ),
    });
    if (
      hole.groundResponses.length >
      MAX_PLAYER_GROUND_RESPONSES
    ) {
      hole.groundResponses.splice(
        0,
        hole.groundResponses.length -
          MAX_PLAYER_GROUND_RESPONSES,
      );
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
        hole.groundResponses.length -
        1;
      index >= 0;
      index -= 1
    ) {
      const response =
        hole.groundResponses[index];
      response.age += dt;
      if (
        response.age >=
        response.duration
      ) {
        hole.groundResponses.splice(
          index,
          1,
        );
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
    const awardQueueSeconds =
      requestedContext &&
      JOE_AWARD_QUEUED_BARK_CONTEXTS.has(
        requestedContext,
      )
        ? 2.15
        : 0;
    state.hole.joeBarkTimer =
      (
        mode === "chase"
          ? 3.2
          : 2.65
      ) + awardQueueSeconds;
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
    const trailSearch =
      mode === "search" &&
      dialogueContext === "trail";
    if (!trailSearch) {
      pushThreatCaption(
        captionLabels[mode] ||
          "JOE CHANGES COURSE",
        state.hole.joe,
        mode === "chase"
          ? "danger"
          : "mower",
        mode === "chase"
          ? 2.8
          : 2.1,
        `joe_${mode}`,
      );
      playThreatCue(mode);
    }
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
    filing.duration = Math.max(
      route === "drain"
        ? 1
        : 0.72,
      ESCAPE_FILING_DURATION[route] -
        hole.filingReduction,
    );
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

  function emergencyAppealState() {
    const hole = state.hole;
    const joeDistance = worldDistance(
      hole.joe,
      state.player,
    );
    let blockedReason = "ready";
    if (hole.appealUsed) {
      blockedReason = "already_used";
    } else if (
      !hole.changeRequestCollected
    ) {
      blockedReason = "no_change_request";
    } else if (
      hole.escapeFiling.active ||
      hole.escapeFiling.sealing
    ) {
      blockedReason = "final_filing_locked";
    } else if (
      hole.ballAim.active ||
      hole.ballFlight
    ) {
      blockedReason = "golf_ball_committed";
    } else if (
      hole.distractionTimer > 0 &&
      hole.distraction
    ) {
      blockedReason = "active_distraction";
    } else if (hole.joe.mode !== "chase") {
      blockedReason = "joe_not_chasing";
    } else if (
      joeDistance <
      EMERGENCY_APPEAL_MIN_DISTANCE
    ) {
      blockedReason = "too_close";
    } else if (
      joeDistance >
      EMERGENCY_APPEAL_MAX_DISTANCE
    ) {
      blockedReason = "too_far";
    }
    return {
      eligible: blockedReason === "ready",
      blockedReason,
      joeDistance,
      minimumDistance:
        EMERGENCY_APPEAL_MIN_DISTANCE,
      maximumDistance:
        EMERGENCY_APPEAL_MAX_DISTANCE,
      reviewSeconds:
        EMERGENCY_APPEAL_REVIEW_SECONDS,
      forfeitedBonus:
        CHANGE_REQUEST_BONUS,
      code: activeChangeRequest().code,
    };
  }

  function activateEmergencyAppeal() {
    const appeal = emergencyAppealState();
    if (!appeal.eligible) {
      return false;
    }
    const hole = state.hole;
    const document = {
      x: clamp(
        state.player.x -
          Math.cos(
            state.player.heading,
          ) *
            2.2,
        -COURSE_MAX_X,
        COURSE_MAX_X,
      ),
      y: clamp(
        state.player.y -
          Math.sin(
            state.player.heading,
          ) *
            2.2,
        4,
        COURSE_LENGTH,
      ),
      code: appeal.code,
      age: 0,
      duration:
        EMERGENCY_APPEAL_REVIEW_SECONDS,
    };
    hole.changeRequestCollected = false;
    hole.appealUsed = true;
    hole.appealDocument = document;
    hole.appealReviewTimer =
      EMERGENCY_APPEAL_REVIEW_SECONDS;
    hole.appealActivationDistance =
      appeal.joeDistance;
    hole.appealWindowWasEligible = false;
    hole.distraction = {
      x: document.x,
      y: document.y,
      kind: "appeal",
      code: document.code,
    };
    hole.distractionTimer =
      EMERGENCY_APPEAL_REVIEW_SECONDS;
    hole.lastSeenPlayer = {
      x: document.x,
      y: document.y,
    };
    hole.trailTarget = null;
    hole.trailApproachTimer = 0;
    hole.lostSightTimer = 0;
    hole.chaseClosestDistance = Infinity;
    hole.joe.mode = "investigate";
    hole.previousJoeMode = "investigate";
    hole.joe.alert = Math.max(
      0.46,
      hole.joe.alert - 0.08,
    );
    hole.detection = Math.min(
      hole.detection,
      0.48,
    );
    hole.detectionWarning = false;
    hole.tensionDirector.pendingIntercept = null;
    hole.tensionDirector.reliefSeconds =
      Math.max(
        hole.tensionDirector.reliefSeconds,
        EMERGENCY_APPEAL_REVIEW_SECONDS +
          1.4,
      );
    hole.tensionDirector.beatTimer =
      Math.max(
        hole.tensionDirector.beatTimer,
        EMERGENCY_APPEAL_REVIEW_SECONDS +
          2,
      );
    hole.stateBanner =
      `EMERGENCY APPEAL FILED // ${document.code} FORFEITED`;
    hole.stateBannerTimer = 3.1;
    hole.stateBannerLockTimer = 3.1;
    setHoleMessage(
      `JOE MUST REVIEW ${document.code} — the +${CHANGE_REQUEST_BONUS} evidence bonus is gone. Move now.`,
      3.8,
    );
    addWorldEffect(
      "emergency_appeal",
      document.x,
      document.y,
      2.4,
    );
    playEmergencyAppealCue();
    pushThreatCaption(
      "JOE STOPS TO REVIEW THE SCOPE",
      document,
      "world",
      3,
      "emergency_appeal",
    );
    announceJoeState(
      "investigate",
      "change_request",
    );
    return true;
  }

  function updateEmergencyAppealWindow() {
    const hole = state.hole;
    const appeal = emergencyAppealState();
    if (
      appeal.eligible &&
      !hole.appealWindowWasEligible &&
      !hole.appealWindowSeen
    ) {
      hole.appealWindowSeen = true;
      hole.stateBanner =
        "EMERGENCY APPEAL READY // FORFEIT EVIDENCE TO BREAK PURSUIT";
      hole.stateBannerTimer = 2.5;
      hole.stateBannerLockTimer = 2.5;
      setHoleMessage(
        `APPEAL WINDOW — file ${appeal.code} now to force a ${appeal.reviewSeconds.toFixed(1)}s review, but lose +${appeal.forfeitedBonus}.`,
        3.4,
      );
      playUiTone(
        392,
        0.08,
        0.026,
      );
    }
    hole.appealWindowWasEligible =
      appeal.eligible;
  }

  function statusRequestCanIssue() {
    const hole = state.hole;
    const request = hole.statusRequest;
    return Boolean(
      !request.issued &&
      !request.resolved &&
      state.player.y >=
        request.triggerY &&
      hole.elapsed >= 22 &&
      hole.joe.mode !== "chase" &&
      hole.detection < 0.48 &&
      hole.noise < 0.62 &&
      !hole.escapeFiling.active &&
      !hole.escapeFiling.sealing &&
      !hole.ballAim.active &&
      !hole.ballFlight &&
      !hole.distraction &&
      hole.distractionTimer <= 0 &&
      hole.appealReviewTimer <= 0 &&
      !hole.riskAward &&
      !hole.deliveryAward &&
      hole.crosswind.phase ===
        "calm" &&
      !hole.tensionDirector
        .pendingIntercept &&
      !hole.tutorialVisible
    );
  }

  function issueStatusRequest() {
    const hole = state.hole;
    const request = hole.statusRequest;
    request.issued = true;
    request.active = true;
    request.resolved = false;
    request.outcome = null;
    request.timer = request.duration;
    request.responding = false;
    request.responseProgress = 0;
    request.urgentCuePlayed = false;
    request.issuedAt = hole.elapsed;
    triggerJoeBark(
      hole.joe.mode,
      "status_request",
    );
    request.joeLine = hole.joeBark;
    hole.stateBanner =
      `${request.label} // ACKNOWLEDGE OR EXPECT ESCALATION`;
    hole.stateBannerTimer = 2.8;
    hole.stateBannerLockTimer = 2.8;
    setHoleMessage(
      `${request.code} — acknowledge and hold still for ${request.responseDuration.toFixed(2)}s, or keep moving and let Joe search your sector.`,
      4.6,
    );
    hole.detectionPulse = Math.max(
      hole.detectionPulse,
      0.42,
    );
    playStatusRequestCue(false);
  }

  function beginStatusResponse() {
    const request =
      state.hole.statusRequest;
    if (!request.active) {
      return false;
    }
    if (!request.responding) {
      request.responding = true;
      request.responseProgress = 0;
      state.hole.stateBanner =
        "SUBMITTING STATUS // HOLD POSITION";
      state.hole.stateBannerTimer = 1.7;
      state.hole.stateBannerLockTimer =
        1.7;
      setHoleMessage(
        "STATUS DRAFT OPEN — movement cancels the response; the deadline keeps running.",
        2.2,
      );
      playUiTone(
        330,
        0.08,
        0.024,
      );
    }
    return true;
  }

  function statusRequestLocation(
    gridSize,
  ) {
    return {
      x: clamp(
        Math.round(
          state.player.x / gridSize,
        ) * gridSize,
        -COURSE_MAX_X,
        COURSE_MAX_X,
      ),
      y: clamp(
        Math.round(
          state.player.y / gridSize,
        ) * gridSize,
        4,
        COURSE_LENGTH,
      ),
    };
  }

  function resolveStatusAcknowledged() {
    const hole = state.hole;
    const request = hole.statusRequest;
    const location =
      statusRequestLocation(14);
    request.active = false;
    request.resolved = true;
    request.responding = false;
    request.responseProgress =
      request.responseDuration;
    request.outcome = "acknowledged";
    request.location = location;
    request.resolvedAt = hole.elapsed;
    hole.distraction = {
      ...location,
      kind: "status_ack",
      code: request.code,
      searchSeconds: 2.8,
    };
    hole.distractionTimer =
      STATUS_ACK_PING_SECONDS;
    hole.lastSeenPlayer = {
      ...location,
    };
    hole.joe.mode = "investigate";
    hole.joe.alert = Math.max(
      hole.joe.alert,
      0.34,
    );
    hole.detection = Math.max(
      hole.detection,
      0.2,
    );
    hole.tensionDirector.pressure =
      clamp(
        hole.tensionDirector.pressure +
          0.05,
        0,
        1,
      );
    awardDeliveryBeat(
      "STATUS ACKNOWLEDGED",
      115,
    );
    hole.stateBanner =
      "STATUS ACKNOWLEDGED // ROUGH LOCATION SHARED";
    hole.stateBannerTimer = 2.7;
    hole.stateBannerLockTimer = 2.7;
    setHoleMessage(
      "STATUS ACCEPTED — you kept control, but the check-in shared your rough grid. Leave it.",
      3.6,
    );
    addWorldEffect(
      "status_ack",
      location.x,
      location.y,
      2.2,
    );
    playStatusResolveCue(false);
    announceJoeState(
      "investigate",
      "status_request",
    );
  }

  function resolveStatusEscalated() {
    const hole = state.hole;
    const request = hole.statusRequest;
    const location =
      statusRequestLocation(8);
    request.active = false;
    request.resolved = true;
    request.responding = false;
    request.outcome = "escalated";
    request.location = location;
    request.resolvedAt = hole.elapsed;
    hole.distraction = {
      ...location,
      kind: "status_escalation",
      code: request.code,
      searchSeconds: 5.6,
    };
    hole.distractionTimer =
      STATUS_ESCALATION_PING_SECONDS;
    hole.lastSeenPlayer = {
      ...location,
    };
    hole.joe.mode = "investigate";
    hole.joe.alert = Math.max(
      hole.joe.alert,
      0.64,
    );
    hole.detection = Math.max(
      hole.detection,
      0.44,
    );
    hole.tensionDirector.pressure =
      clamp(
        hole.tensionDirector.pressure +
          0.18,
        0,
        1,
      );
    hole.horrorDirector.fogSurgeSeconds =
      Math.max(
        hole.horrorDirector
          .fogSurgeSeconds,
        3.8,
      );
    hole.stateBanner =
      "STAKEHOLDER ESCALATION // JOE HAS YOUR SECTOR";
    hole.stateBannerTimer = 3.2;
    hole.stateBannerLockTimer = 3.2;
    setHoleMessage(
      "STATUS MISSED — Joe escalated the silence into a precise sector search. Break away now.",
      4,
    );
    addWorldEffect(
      "status_escalation",
      location.x,
      location.y,
      3,
    );
    playStatusResolveCue(true);
    announceJoeState(
      "investigate",
      "status_request",
    );
  }

  function supersedeStatusRequest() {
    const request =
      state.hole.statusRequest;
    request.active = false;
    request.resolved = true;
    request.responding = false;
    request.outcome =
      "superseded_by_pursuit";
    request.resolvedAt =
      state.hole.elapsed;
    setHoleMessage(
      "STATUS REQUEST CLOSED — direct pursuit superseded the check-in.",
      1.8,
    );
  }

  function updateStatusRequest(
    dt,
    moving,
  ) {
    const hole = state.hole;
    const request = hole.statusRequest;
    if (!request.issued) {
      if (statusRequestCanIssue()) {
        issueStatusRequest();
      }
      return;
    }
    if (!request.active) {
      return;
    }
    if (hole.joe.mode === "chase") {
      supersedeStatusRequest();
      return;
    }
    request.timer = Math.max(
      0,
      request.timer - dt,
    );
    if (
      request.timer <= 2 &&
      !request.urgentCuePlayed
    ) {
      request.urgentCuePlayed = true;
      playStatusRequestCue(true);
    }
    if (request.responding) {
      if (moving) {
        request.responding = false;
        request.responseProgress = 0;
        request.responseCancels += 1;
        hole.stateBanner =
          "STATUS DRAFT CANCELLED // DEADLINE CONTINUES";
        hole.stateBannerTimer = 1.7;
        hole.stateBannerLockTimer =
          1.7;
        setHoleMessage(
          "MOVEMENT CANCELLED THE UPDATE — stop and interact again, or accept escalation.",
          2.4,
        );
        playUiTone(
          196,
          0.1,
          0.025,
        );
      } else {
        request.responseProgress =
          Math.min(
            request.responseDuration,
            request.responseProgress +
              dt,
          );
        if (
          request.responseProgress >=
          request.responseDuration
        ) {
          resolveStatusAcknowledged();
          return;
        }
      }
    }
    if (request.timer <= 0) {
      resolveStatusEscalated();
    }
  }

  function collectChangeRequest(request) {
    const hole = state.hole;
    if (
      hole.changeRequestCollected ||
      hole.appealUsed ||
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
      `UNFILED CHANGE SECURED // BANK +${CHANGE_REQUEST_BONUS} OR APPEAL`;
    hole.stateBannerTimer = 3;
    hole.stateBannerLockTimer = 3;
    awardDeliveryBeat(
      "CHANGE REQUEST SECURED",
      180,
    );
    setHoleMessage(
      `${request.code} SECURED — escape to bank +${CHANGE_REQUEST_BONUS}, or sacrifice it during a close pursuit to force Joe into review.`,
      4.4,
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
    triggerJoeBark(
      hole.joe.mode,
      "change_request",
    );
    return true;
  }

  function clearSprintReview(review) {
    const hole = state.hole;
    if (
      !review ||
      sprintReviewCleared(review)
    ) {
      return false;
    }
    const previousBalls =
      hole.golfBalls;
    hole.reviewsCleared.push(
      review.id,
    );
    hole.reviewRewards += 1;
    hole.filingReduction =
      hole.reviewsCleared.length *
      SPRINT_REVIEW_FILING_REDUCTION;
    hole.golfBalls = Math.min(
      golfBallCapacity(),
      hole.golfBalls + 1,
    );
    hole.detection = Math.max(
      0,
      hole.detection - 0.12,
    );
    hole.noise = Math.max(
      hole.noise,
      0.5,
    );
    hole.joe.alert = Math.max(
      hole.joe.alert,
      0.34,
    );
    hole.stateBanner =
      `${review.code} ACCEPTED // FASTER FINAL FILING`;
    hole.stateBannerTimer = 3;
    hole.stateBannerLockTimer = 3;
    awardDeliveryBeat(
      "SPRINT REVIEW CLEARED",
      125,
    );
    setHoleMessage(
      hole.golfBalls > previousBalls
        ? `${review.code} CLEARED — golf ball restored, filing shortened, and Joe heard the review bell.`
        : `${review.code} CLEARED — filing shortened. Your pockets are full, and Joe heard the review bell.`,
      3.8,
    );
    addWorldEffect(
      "filing_stamp",
      review.x,
      review.y,
      1.2,
    );
    playEscapeFilingCue(
      Math.min(
        2,
        hole.reviewsCleared.length,
      ),
    );
    pushThreatCaption(
      "SPRINT REVIEW BELL RINGS",
      review,
      "world",
      2.2,
      `sprint_review_${review.id}`,
    );
    if (
      hole.joe.mode !== "chase"
    ) {
      hole.distraction = {
        x: review.x,
        y: review.y,
      };
      hole.distractionTimer = 2.6;
      hole.joe.mode =
        "investigate";
      announceJoeState(
        "investigate",
        "sprint_review",
      );
    } else {
      triggerJoeBark(
        hole.joe.mode,
        "sprint_review",
      );
    }
    return true;
  }

  function updateSprintReviews() {
    const reviews =
      activeSprintReviews();
    for (
      let index = 0;
      index < reviews.length;
      index += 1
    ) {
      const review =
        reviews[index];
      if (
        !sprintReviewCleared(
          review,
        ) &&
        worldDistance(
          state.player,
          review,
        ) < review.radius
      ) {
        clearSprintReview(
          review,
        );
      }
    }
  }

  function interactWithCourse() {
    if (state.mode !== "first_hole") {
      return;
    }
    if (state.hole.escapeFiling.sealing) {
      return;
    }
    if (activateEmergencyAppeal()) {
      return;
    }
    if (beginStatusResponse()) {
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
      !state.hole.appealUsed &&
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

  function practiceDrillActive() {
    const drill =
      state.hole?.practiceDrill;
    return Boolean(
      drill &&
        drill.active &&
        !drill.completed &&
        state.player.y <
          TEE_PRACTICE_EXIT_Y,
    );
  }

  function practiceShotLocked(target) {
    const drill =
      state.hole?.practiceDrill;
    return Boolean(
      target &&
        practiceDrillActive() &&
        worldDistance(
          target,
          drill.target,
        ) <= drill.target.radius,
    );
  }

  function completePracticeDrill(
    landedBall,
  ) {
    const hole = state.hole;
    const drill = hole.practiceDrill;
    drill.active = false;
    drill.completed = true;
    drill.stage = "joe_diverted";
    drill.landedBallId =
      landedBall.id;
    state.career.golfLessonCompleted =
      true;
    saveCareer();
    hole.distractionTimer = Math.max(
      hole.distractionTimer,
      5.4,
    );
    hole.stateBanner =
      "FIELD TEST PASSED // JOE TOOK THE BAIT";
    hole.stateBannerTimer = 3.4;
    hole.stateBannerLockTimer = 1.8;
    awardDeliveryBeat(
      "FIELD TEST PASSED",
      110,
    );
    addWorldEffect(
      "filing_stamp",
      drill.target.x,
      drill.target.y,
      1.25,
    );
    playPracticeBellCue();
    triggerJoeBark(
      "investigate",
      "practice_shot",
    );
  }

  function updatePracticeDrill() {
    const drill =
      state.hole.practiceDrill;
    if (
      !drill.active ||
      drill.completed ||
      state.hole.ballFlight
    ) {
      return;
    }
    if (
      state.player.y >=
      TEE_PRACTICE_EXIT_Y
    ) {
      drill.active = false;
      drill.stage = "skipped_optional";
      if (
        state.hole.message.startsWith(
          "OPTIONAL FIELD TEST",
        )
      ) {
        state.hole.messageTimer = 0;
      }
      if (
        state.hole.stateBanner ===
        "OPTIONAL FIELD TEST // RING THE STARTER BELL"
      ) {
        state.hole.stateBannerTimer = 0;
      }
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
    const drillAttempt =
      practiceDrillActive();
    const practiceHit =
      drillAttempt &&
      practiceShotLocked(target);
    hole.ballFlight = null;
    const landedBall = {
      id: hole.nextRecoverableBallId,
      x: target.x,
      y: target.y,
      landedAt: hole.elapsed,
      throwNumber: hole.ballThrowsUsed,
      wet: wetStateAt(target).active,
      practiceHit,
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
    if (drillAttempt) {
      hole.practiceDrill.attempts += 1;
      if (practiceHit) {
        completePracticeDrill(
          landedBall,
        );
        setHoleMessage(
          "STARTER BELL RANG — watch Joe divert, then reclaim the marked ball when the lane clears.",
          4.2,
        );
      } else {
        hole.practiceDrill.misses += 1;
        setHoleMessage(
          "JOE HEARD THE LANDING — the amber bell remains an optional aim test.",
          3.4,
        );
      }
    } else {
      setHoleMessage(
        hole.ballThrowsUsed >= 3
          ? "JOE RECOGNIZED THE PATTERN — reclaim the ball only if the lane clears."
          : "BALL LANDED — Joe changed course. The ball can be reclaimed.",
        3.1,
      );
    }
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
      practiceHit
        ? "STARTER BELL RINGS // JOE DIVERTED"
        : "GOLF BALL STRIKES TURF",
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
    const practiceRecovery =
      ball.practiceHit === true;
    hole.recoverableBalls =
      hole.recoverableBalls.filter(
        (candidate) =>
          candidate.id !== ball.id,
      );
    hole.golfBalls += 1;
    hole.ballsRecovered += 1;
    awardDeliveryBeat(
      practiceRecovery
        ? "TRAINING BALL RECOVERY"
        : danger.dangerous
        ? "PRESSURE RECOVERY"
        : "BALL RECOVERED",
      practiceRecovery
        ? 125
        : danger.dangerous
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
    if (practiceRecovery) {
      hole.practiceDrill.reclaimed =
        true;
      hole.practiceDrill.stage =
        "ball_reclaimed";
      hole.stateBanner =
        "TRAINING LOOP CLOSED // BALL RESTORED";
      hole.stateBannerTimer = 2.4;
      setHoleMessage(
        "BALL RECLAIMED — you can bait Joe, move through the gap, and recover the resource when it is safe.",
        3.8,
      );
    } else if (danger.dangerous) {
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
    triggerJoeBark(
      hole.joe.mode,
      "ball_recovery",
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
    const compelledAppealReview =
      distractionActive &&
      hole.distraction.kind ===
        "appeal" &&
      hole.appealReviewTimer > 0;
    const actionableSight =
      visibleNow &&
      !compelledAppealReview;
    const trailEvidence =
      !distractionActive &&
      joe.mode !== "chase" &&
      hole.trailDiscoveryCooldown <= 0
        ? trailEvidenceNearJoe()
        : null;
    if (trailEvidence) {
      const continuingTrail =
        hole.trailChainTimer > 0;
      trailEvidence.discovered = true;
      hole.tracksDiscovered += 1;
      hole.trailChain =
        continuingTrail
          ? hole.trailChain + 1
          : 1;
      hole.trailChainTimer = 5.2;
      hole.trailDiscoveryCooldown =
        lerp(
          1.25,
          0.82,
          trailEvidence.strength,
        );
      hole.trailTarget = {
        x: trailEvidence.x,
        y: trailEvidence.y,
        markId: trailEvidence.id,
      };
      hole.trailApproachTimer = 1.45;
      hole.lastSeenPlayer = {
        x: trailEvidence.x,
        y: trailEvidence.y,
      };
      hole.searchTimer = Math.max(
        hole.searchTimer,
        4.2 +
          trailEvidence.strength * 2.4 +
          Math.min(
            3,
            hole.trailChain - 1,
          ) *
            0.55,
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
      hole.trailWarningTimer = 3;
      addWorldEffect(
        "trail_found",
        trailEvidence.x,
        trailEvidence.y,
        1.8,
      );
      const announceTrail =
        hole.trailChain === 1 ||
        hole.trailChain === 3 ||
        hole.trailChain === 5;
      if (announceTrail) {
        hole.stateBanner =
          hole.trailChain === 1
            ? "EVIDENCE FOUND // JOE IS BACKTRACKING"
            : `TRAIL CHAIN ×${hole.trailChain} // CHANGE SURFACE`;
        hole.stateBannerTimer = 2.5;
        hole.stateBannerLockTimer =
          Math.max(
            hole.stateBannerLockTimer,
            2.5,
          );
        setHoleMessage(
          hole.trailChain === 1
            ? "JOE FOUND YOUR BENT-GRASS TRAIL — leave the line or reach cut turf."
            : "JOE IS FOLLOWING PRINT TO PRINT — cross fairway or cut turf to end the chain.",
          3,
        );
        playThreatCue("search");
        pushThreatCaption(
          hole.trailChain === 1
            ? "JOE CHECKS A FRESH PRINT"
            : `JOE FOLLOWS THE TRAIL ×${hole.trailChain}`,
          trailEvidence,
          "danger",
          2.7,
          "trail_found",
        );
        joeEventBarkContext =
          "trail";
      }
    }
    const directSound =
      audibleNow &&
      !distractionActive;
    const detectionGain =
      (
        actionableSight
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
        (actionableSight || directSound)
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
    hole.detectionSource = actionableSight
      ? "sight"
      : directSound
        ? "sound"
        : trailEvidence ||
            hole.trailWarningTimer > 0
          ? "trail"
          : null;
    hole.playerAudible = directSound;
    if (actionableSight) {
      snapshotJoeContact(
        "sight",
        environment,
        playerDistance,
        moving,
      );
    } else if (directSound) {
      snapshotJoeContact(
        "sound",
        environment,
        playerDistance,
        moving,
      );
    } else if (trailEvidence) {
      snapshotJoeContact(
        "trail",
        environment,
        playerDistance,
        moving,
      );
    }
    hole.visibilityRange = visibilityRange;
    hole.hearingRange = hearingRange;
    const confirmedDetection =
      hole.detection >= 0.55 ||
      playerDistance < 11;
    const canSee =
      actionableSight &&
      (confirmedDetection || joe.mode === "chase");
    const canHear =
      directSound &&
      (confirmedDetection || joe.mode === "chase");
    hole.hasLineOfSight = actionableSight;
    hole.lineBlockedBy = blocker;

    if (
      hole.detection >= 0.2 &&
      !hole.detectionWarning &&
      joe.mode !== "chase" &&
      !compelledAppealReview
    ) {
      hole.detectionWarning = true;
      hole.detectionPulse = Math.max(
        hole.detectionPulse,
        0.48,
      );
      if (!trailEvidence) {
        setHoleMessage(
          actionableSight
            ? "JOE IS LOOKING — break the sightline before attention locks."
            : "JOE HEARD THAT — stop, crouch, or change direction.",
          2.2,
        );
        playThreatCue(
          "investigate",
        );
        pushThreatCaption(
          actionableSight
            ? "MOWER TURNS TOWARD YOU"
            : "MOWER REACTS TO NOISE",
          joe,
          "danger",
          2.2,
          "detection_warning",
        );
      }
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
      (
        compelledAppealReview ||
        !(canSee && playerDistance < 15)
      )
    ) {
      hole.trailTarget = null;
      hole.trailApproachTimer = 0;
      hole.distractionTimer = Math.max(0, hole.distractionTimer - dt);
      joe.mode = "investigate";
      moveJoeToward(hole.distraction, 23, dt);
      joe.alert = Math.max(0.18, joe.alert - dt * 0.12);
      if (hole.distractionTimer === 0) {
        const completedDistraction =
          hole.distraction;
        hole.lastSeenPlayer = {
          x: completedDistraction.x,
          y: completedDistraction.y,
        };
        hole.distraction = null;
        joe.mode = "search";
        hole.searchTimer =
          completedDistraction
            .searchSeconds ??
          Math.max(
            2.8,
            5.1 -
              hole.ballThrowsUsed *
                0.45,
          );
      }
    } else if (canSee || canHear) {
      hole.trailTarget = null;
      hole.trailApproachTimer = 0;
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
        hole.trailTarget = null;
        hole.trailApproachTimer = 0;
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
      hole.trailApproachTimer =
        Math.max(
          0,
          hole.trailApproachTimer - dt,
        );
      const approachingTrail =
        hole.trailTarget &&
        hole.trailApproachTimer > 0 &&
        worldDistance(
          joe,
          hole.trailTarget,
        ) > 3.8;
      if (approachingTrail) {
        moveJoeToward(
          hole.trailTarget,
          18 +
            joe.alert * 4,
          dt,
        );
      } else {
        hole.trailApproachTimer = 0;
        const center =
          hole.lastSeenPlayer || {
            x: joe.x,
            y: joe.y,
          };
        const searchTarget = {
          x:
            center.x +
            Math.sin(
              hole.elapsed * 1.31,
            ) *
              (
                10 +
                hole.searchTimer
              ),
          y:
            center.y +
            Math.cos(
              hole.elapsed * 0.97,
            ) *
              (
                7 +
                hole.searchTimer * 0.5
              ),
        };
        moveJoeToward(
          searchTarget,
          16,
          dt,
        );
      }
      if (hole.searchTimer <= 0) {
        joe.mode = "patrol";
        hole.lastSeenPlayer = null;
        hole.lostSightTimer = 0;
        hole.trailTarget = null;
        hole.trailApproachTimer = 0;
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
      hole.tensionDirector
        .reliefSeconds =
        TENSION_DIRECTOR_RELIEF_SECONDS;
      hole.tensionDirector
        .pendingIntercept = null;
      hole.tensionDirector
        .beatTimer = Math.max(
          hole.tensionDirector
            .beatTimer,
          TENSION_DIRECTOR_RELIEF_SECONDS +
            2,
        );
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
      if (
        hole.chaseClosestDistance <
        18
      ) {
        const secondWindDuration =
          hole.chaseClosestDistance <
          12
            ? SECOND_WIND_RAZOR_SECONDS
            : SECOND_WIND_CLOSE_SECONDS;
        hole.secondWindTimer =
          Math.max(
            hole.secondWindTimer,
            secondWindDuration,
          );
        hole.secondWindDuration =
          secondWindDuration;
        hole.secondWindActivations += 1;
      }
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
            ? hole.secondWindTimer > 0
              ? `${tierLabel} // +${riskAward.amount} RISK // SECOND WIND`
              : `${tierLabel} // +${riskAward.amount} RISK PREMIUM`
            : hole.secondWindTimer > 0
              ? "CONTACT BROKEN // SECOND WIND"
              : "CONTACT BROKEN // PREMIUM CAP REACHED";
        hole.stateBannerTimer = 2.35;
        hole.stateBannerLockTimer = 2.35;
        if (
          hole.chaseClosestDistance < 12
        ) {
          setHoleMessage(
            "RAZOR CUT — premium banked. Second Wind is active.",
            2.35,
          );
        } else if (
          hole.secondWindTimer > 0
        ) {
          setHoleMessage(
            "CLOSE CUT — keep moving while Second Wind holds.",
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
    if (
      hole.trailChain > 0 &&
      hole.trailChainTimer <= 0
    ) {
      resolveTrailChain();
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
      const capturedDuringFiling =
        hole.escapeFiling.active;
      if (capturedDuringFiling) {
        hole.escapeFiling.active = false;
        hole.escapeFiling.capturedDuringFiling = true;
        hole.escapeFiling.lastInterruption =
          "CAPTURED";
      }
      hole.captureReview =
        createCaptureReview(
          capturedDuringFiling,
        );
      recordCapture(
        hole.captureReview,
      );
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

  function planJoeRoute(
    start,
    target,
    finalLegPadding = 0.8,
  ) {
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
                  ? finalLegPadding
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
          finalLegPadding,
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

  function objectiveApproachCandidates(
    target,
    origin,
  ) {
    const candidates = [];
    const baseAngle = Math.atan2(
      origin.y - target.y,
      origin.x - target.x,
    );
    const angleOffsets = [
      0,
      -Math.PI / 6,
      Math.PI / 6,
      -Math.PI / 3,
      Math.PI / 3,
      -Math.PI / 2,
      Math.PI / 2,
      Math.PI,
    ];
    const approachRadius = Math.max(
      3,
      target.radius - 1.6,
    );
    for (
      let ringIndex = 0;
      ringIndex < 2;
      ringIndex += 1
    ) {
      const ringRadius =
        approachRadius *
        (ringIndex === 0 ? 1 : 0.62);
      for (
        let angleIndex = 0;
        angleIndex < angleOffsets.length;
        angleIndex += 1
      ) {
        const angle =
          baseAngle +
          angleOffsets[angleIndex];
        const point = {
          x: clamp(
            target.x +
              Math.cos(angle) *
                ringRadius,
            -COURSE_MAX_X +
              PLAYER_COLLISION_RADIUS,
            COURSE_MAX_X -
              PLAYER_COLLISION_RADIUS,
          ),
          y: clamp(
            target.y +
              Math.sin(angle) *
                ringRadius,
            COURSE_MIN_Y +
              PLAYER_COLLISION_RADIUS,
            COURSE_LENGTH -
              PLAYER_COLLISION_RADIUS,
          ),
        };
        if (
          obstacleAtPosition(
            point.x,
            point.y,
          )
        ) {
          continue;
        }
        const clearance =
          nearestObstacleClearance(
            point,
          ) -
          PLAYER_COLLISION_RADIUS;
        candidates.push({
          point,
          clearance,
          score:
            worldDistance(
              origin,
              point,
            ) -
            Math.min(
              12,
              Math.max(0, clearance),
            ) *
              0.28,
        });
      }
    }
    candidates.sort(
      (a, b) => a.score - b.score,
    );
    return candidates;
  }

  function planObjectiveApproach(
    target,
    origin,
  ) {
    const candidates =
      objectiveApproachCandidates(
        target,
        origin,
      );
    const maximumAttempts = Math.min(
      6,
      candidates.length,
    );
    for (
      let index = 0;
      index < maximumAttempts;
      index += 1
    ) {
      const candidate =
        candidates[index];
      const path = planJoeRoute(
        origin,
        candidate.point,
        PLAYER_COLLISION_RADIUS,
      );
      if (path.length > 0) {
        return {
          point: candidate.point,
          clearance:
            candidate.clearance,
          path,
        };
      }
    }
    return {
      point: {
        x: target.x,
        y: target.y,
      },
      clearance:
        nearestObstacleClearance(
          target,
        ) -
        PLAYER_COLLISION_RADIUS,
      path: [],
    };
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
      guide.approach = null;
      guide.path = [];
      return;
    }
    const targetDistance =
      worldDistance(
        state.player,
        definition.target,
      );
    if (
      targetDistance <
      definition.target.radius
    ) {
      guide.targetId = definition.id;
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
      guide.approach = {
        x: state.player.x,
        y: state.player.y,
        clearance:
          nearestObstacleClearance(
            state.player,
          ) -
          PLAYER_COLLISION_RADIUS,
      };
      guide.path = [];
      guide.distance = targetDistance;
      guide.direction = "STRAIGHT";
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
      const approach =
        planObjectiveApproach(
          definition.target,
          state.player,
        );
      const path = approach.path;
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
      guide.approach = {
        x: approach.point.x,
        y: approach.point.y,
        clearance:
          approach.clearance,
      };
      guide.path =
        path.length > 0
          ? path
          : [
              {
                x: approach.point.x,
                y: approach.point.y,
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
    guide.distance = targetDistance;
    guide.direction =
      guidanceDirection(
        guide.path[0] ||
          definition.target,
      );
  }

  function joeVisibleInCourseView() {
    const point = worldToScreen(
      state.hole.joe.x,
      state.hole.joe.y,
    );
    return (
      point.visible &&
      point.x > -110 &&
      point.x < WIDTH + 110
    );
  }

  function tensionDirectorInterceptPoint() {
    const hole = state.hole;
    const director =
      hole.tensionDirector;
    const minimumY =
      state.player.y + 54;
    const maximumY = Math.min(
      COURSE_LENGTH - 24,
      state.player.y + 82,
    );
    if (maximumY < minimumY) {
      return null;
    }
    const targetY = lerp(
      minimumY,
      maximumY,
      hash(
        director.beatCount * 29 +
          hole.zoneIndex * 17 +
          state.player.y * 0.07,
      ),
    );
    const lanes = [
      -78,
      76,
      -42,
      40,
      0,
      -96,
      96,
    ];
    const laneOffset =
      (
        director.beatCount +
        hole.zoneIndex * 2
      ) % lanes.length;
    let best = null;
    for (
      let index = 0;
      index < lanes.length;
      index += 1
    ) {
      const x =
        lanes[
          (index + laneOffset) %
            lanes.length
        ];
      const point = {
        x,
        y: targetY,
      };
      if (
        obstacleAtPosition(
          point.x,
          point.y,
          JOE_NAVIGATION_CLEARANCE,
        )
      ) {
        continue;
      }
      const clearance =
        joeObstacleClearanceAt(
          point,
        );
      if (clearance < 7) {
        continue;
      }
      const lateralDistance =
        Math.abs(
          point.x -
            state.player.x,
        );
      const score =
        Math.abs(
          lateralDistance - 42,
        ) -
        Math.min(clearance, 18) *
          0.3;
      if (
        !best ||
        score < best.score
      ) {
        best = {
          point,
          clearance,
          score,
        };
      }
    }
    return best;
  }

  function cancelTensionIntercept(
    reason,
  ) {
    const director =
      state.hole.tensionDirector;
    if (!director.pendingIntercept) {
      return;
    }
    director.pendingIntercept = null;
    director.cancelledIntercepts += 1;
    director.lastBeat =
      `intercept_cancelled_${reason}`;
    director.lastBeatSeconds = 0;
    director.beatTimer = Math.max(
      director.beatTimer,
      6.5,
    );
    if (
      reason === "player_advanced"
    ) {
      director.reliefSeconds =
        Math.max(
          director.reliefSeconds,
          3.5,
        );
      director.pressure = Math.min(
        director.pressure,
        0.32,
      );
    }
  }

  function stageTensionIntercept(
    candidate,
  ) {
    const hole = state.hole;
    const director =
      hole.tensionDirector;
    director.pendingIntercept = {
      x: candidate.point.x,
      y: candidate.point.y,
      clearance:
        candidate.clearance,
      seconds:
        TENSION_DIRECTOR_WARNING_SECONDS,
    };
    director.warningCount += 1;
    director.lastInterceptZone =
      hole.zoneIndex;
    director.lastBeat =
      "service_gate_warning";
    director.lastBeatSeconds = 0;
    director.cooldownSeconds =
      11.5 +
      hole.zoneIndex * 0.55;
    director.beatTimer =
      10.5;
    director.pressure = Math.max(
      director.pressure,
      0.48,
    );
    hole.dreadTimer = Math.max(
      hole.dreadTimer,
      TENSION_DIRECTOR_WARNING_SECONDS +
        0.8,
    );
    hole.detectionPulse = Math.max(
      hole.detectionPulse,
      0.32,
    );
    hole.stateBanner =
      "COURSE OVERRIDE // SERVICE GATE OPENING";
    hole.stateBannerTimer = 2.7;
    hole.stateBannerLockTimer =
      Math.max(
        hole.stateBannerLockTimer,
        2.7,
      );
    setHoleMessage(
      "A SERVICE GATE CLANGS AHEAD — Joe is taking a shortcut. Pick cover now.",
      3.2,
    );
    pushThreatCaption(
      "MOWER ROUTE OPENING AHEAD",
      candidate.point,
      "danger",
      2.6,
      "director_warning",
    );
    playThreatCue("investigate");
    triggerHorrorEvent(
      "peripheral_groundskeeper",
      1.65,
    );
  }

  function executeTensionIntercept() {
    const hole = state.hole;
    const director =
      hole.tensionDirector;
    const intercept =
      director.pendingIntercept;
    if (!intercept) {
      return false;
    }
    const forwardDistance =
      intercept.y -
      state.player.y;
    if (
      forwardDistance < 44 ||
      joeVisibleInCourseView() ||
      hole.joe.mode === "chase" ||
      hole.escapeFiling.active
    ) {
      cancelTensionIntercept(
        "player_advanced",
      );
      return false;
    }
    const joe = hole.joe;
    joe.x = intercept.x;
    joe.y = intercept.y;
    joe.mode = "investigate";
    joe.alert = Math.max(
      joe.alert,
      0.28,
    );
    joe.routePath = [];
    joe.routeTarget = null;
    joe.routeObstacle = null;
    joe.repathTimer = 0;
    joe.patrolPause = 0;
    joe.stuckTimer = 0;
    joe.lastCutPoint = {
      x: joe.x,
      y: joe.y,
    };
    joe.effectLastX = joe.x;
    joe.effectLastY = joe.y;
    joe.effectSpeed = 0;
    hole.distraction = {
      x: clamp(
        state.player.x +
          (
            intercept.x >
            state.player.x
              ? 16
              : -16
          ),
        -COURSE_MAX_X + 8,
        COURSE_MAX_X - 8,
      ),
      y: clamp(
        state.player.y + 30,
        COURSE_MIN_Y + 12,
        COURSE_LENGTH - 18,
      ),
    };
    hole.distractionTimer = 4.2;
    hole.lastSeenPlayer = {
      ...hole.distraction,
    };
    hole.lastKnownJoe = {
      x: joe.x,
      y: joe.y,
    };
    hole.lastKnownJoeTimer = 5;
    director.pendingIntercept = null;
    director.interceptCount += 1;
    director.lastBeat =
      "joe_intercept";
    director.lastBeatSeconds = 0;
    director.quietSeconds = 0;
    director.pressure = Math.max(
      director.pressure,
      0.62,
    );
    hole.detectionPulse = Math.max(
      hole.detectionPulse,
      0.58,
    );
    triggerJoeBark(
      "investigate",
      "director",
    );
    playThreatCue(
      "investigate",
    );
    triggerHorrorEvent(
      "fog_surge",
      3.6,
    );
    hole.stateBanner =
      "ROUTE CHANGED // JOE IS AHEAD";
    hole.stateBannerTimer = 2.8;
    hole.stateBannerLockTimer =
      Math.max(
        hole.stateBannerLockTimer,
        2.8,
      );
    setHoleMessage(
      "THE MOWER RESTARTS AHEAD — break left or right before Joe checks your lane.",
      3.2,
    );
    addWorldEffect(
      "mower_sputter",
      joe.x,
      joe.y,
      2.1,
    );
    return true;
  }

  function playAmbientTensionBeat() {
    const hole = state.hole;
    const director =
      hole.tensionDirector;
    director.lastBeat =
      "distant_mower_echo";
    director.lastBeatSeconds = 0;
    director.beatTimer =
      8.5 +
      hash(
        director.beatCount * 31 +
          hole.zoneIndex * 13,
      ) *
        4;
    director.pressure = Math.max(
      director.pressure,
      0.34,
    );
    hole.dreadTimer = Math.max(
      hole.dreadTimer,
      2.4,
    );
    hole.detectionPulse = Math.max(
      hole.detectionPulse,
      0.17,
    );
    hole.lastKnownJoe = {
      x: hole.joe.x,
      y: hole.joe.y,
    };
    hole.lastKnownJoeTimer = 3.2;
    if (
      hole.messageTimer < 0.8 &&
      hole.stateBannerLockTimer <= 0
    ) {
      setHoleMessage(
        "THE DISTANT MOWER CHANGES PITCH — the quiet window is closing.",
        2.25,
      );
    }
    pushThreatCaption(
      "MOWER ECHOES ACROSS THE COURSE",
      hole.joe,
      "mower",
      2,
      "director_echo",
    );
    playThreatCue("search");
  }

  function updateTensionDirector(
    dt,
    moving,
  ) {
    const hole = state.hole;
    const director =
      hole.tensionDirector;
    const joeDistance =
      worldDistance(
        hole.joe,
        state.player,
      );
    const progress = clamp(
      state.player.y /
        COURSE_LENGTH,
      0,
      1,
    );
    director.cooldownSeconds =
      Math.max(
        0,
        director.cooldownSeconds - dt,
      );
    director.reliefSeconds =
      Math.max(
        0,
        director.reliefSeconds - dt,
      );
    director.lastBeatSeconds += dt;
    if (
      director.observedZone !==
      hole.zoneIndex
    ) {
      director.observedZone =
        hole.zoneIndex;
      director.pressure = Math.max(
        director.pressure,
        0.16 +
          hole.zoneIndex * 0.055,
      );
      if (hole.zoneIndex > 0) {
        director.beatTimer = Math.min(
          director.beatTimer,
          hole.zoneIndex >= 5
            ? 3.4
            : 4.6,
        );
      }
    }
    const directThreat =
      hole.joe.mode === "chase" ||
      hole.joe.mode === "search" ||
      hole.detection > 0.2 ||
      joeDistance < 78;
    if (directThreat) {
      director.quietSeconds = 0;
      director.beatTimer = Math.max(
        director.beatTimer,
        5.5,
      );
      if (
        director.pendingIntercept &&
        hole.joe.mode === "chase"
      ) {
        cancelTensionIntercept(
          "natural_contact",
        );
      }
    } else if (
      director.reliefSeconds <= 0
    ) {
      director.quietSeconds +=
        dt *
        (moving ? 1 : 0.45);
    }
    const modePressure =
      hole.joe.mode === "chase"
        ? 1
        : hole.joe.mode === "search"
          ? 0.66
          : hole.joe.mode ===
                "investigate"
            ? 0.42
            : 0;
    const proximityPressure = clamp(
      1 - joeDistance / 112,
      0,
      1,
    );
    const quietPressure = clamp(
      director.quietSeconds / 18,
      0,
      1,
    );
    const distancePressure = clamp(
      (
        joeDistance -
        TENSION_DIRECTOR_MIN_JOE_DISTANCE
      ) /
        90,
      0,
      1,
    );
    const pressureFloor =
      0.08 +
      progress * 0.28;
    const targetPressure =
      director.reliefSeconds > 0 &&
      hole.joe.mode !== "chase"
        ? Math.max(
            proximityPressure * 0.34,
            pressureFloor * 0.48,
          )
        : Math.max(
            modePressure,
            proximityPressure * 0.58,
            pressureFloor +
              quietPressure * 0.28 +
              distancePressure * 0.14 +
              (
                director.pendingIntercept
                  ? 0.18
                  : 0
              ),
          );
    director.pressure = lerp(
      director.pressure,
      clamp(targetPressure, 0, 1),
      1 -
        Math.exp(
          -dt *
            (
              targetPressure >
              director.pressure
                ? 2.4
                : 0.72
            ),
        ),
    );
    if (director.pendingIntercept) {
      director.pendingIntercept.seconds =
        Math.max(
          0,
          director.pendingIntercept.seconds -
            dt,
        );
      if (
        hole.escapeFiling.active ||
        hole.joe.mode === "chase" ||
        hole.joe.mode !== "patrol" ||
        hole.distraction
      ) {
        cancelTensionIntercept(
          "threat_changed",
        );
      } else if (
        director.pendingIntercept
          .seconds <= 0
      ) {
        executeTensionIntercept();
      }
      return;
    }
    if (
      directThreat ||
      director.reliefSeconds > 0
    ) {
      return;
    }
    director.beatTimer = Math.max(
      0,
      director.beatTimer - dt,
    );
    if (
      director.beatTimer > 0 ||
      hole.elapsed <
        TENSION_DIRECTOR_GRACE_SECONDS
    ) {
      return;
    }
    director.beatCount += 1;
    const canIntercept =
      hole.joe.mode === "patrol" &&
      !hole.distraction &&
      !hole.escapeFiling.active &&
      joeDistance >
        TENSION_DIRECTOR_MIN_JOE_DISTANCE &&
      !joeVisibleInCourseView() &&
      state.player.y > 70 &&
      state.player.y <
        COURSE_LENGTH - 40 &&
      director.quietSeconds > 5.5 &&
      director.cooldownSeconds <= 0 &&
      director.interceptCount <
        TENSION_DIRECTOR_MAX_INTERCEPTS &&
      director.lastInterceptZone !==
        hole.zoneIndex;
    const intercept =
      canIntercept
        ? tensionDirectorInterceptPoint()
        : null;
    if (intercept) {
      stageTensionIntercept(
        intercept,
      );
    } else {
      playAmbientTensionBeat();
    }
  }

  function playHorrorCue(type, side = 0) {
    if (type === "peripheral_groundskeeper") {
      playNoiseBurst(
        0.24,
        0.026,
        2400,
        "highpass",
        side * 0.82,
        0,
        dangerBusGain,
      );
      playTransientTone(
        63,
        31,
        0.72,
        0.034,
        "triangle",
        0,
        dangerBusGain,
      );
    } else if (type === "fog_surge") {
      playNoiseBurst(
        0.72,
        0.024,
        320,
        "lowpass",
        side * 0.34,
        0,
        dangerBusGain,
      );
    } else if (type === "light_failure") {
      playTransientTone(
        184,
        47,
        0.18,
        0.028,
        "square",
        0,
        dangerBusGain,
      );
      playNoiseBurst(
        0.16,
        0.022,
        1800,
        "bandpass",
        side * 0.5,
        0.08,
        dangerBusGain,
      );
    }
  }

  function triggerHorrorEvent(
    type,
    duration = null,
  ) {
    const horror =
      state.hole?.horrorDirector;
    if (!horror) {
      return;
    }
    const seed =
      horror.eventCount * 37 +
      state.hole.zoneIndex * 19 +
      Math.floor(state.player.y);
    const side =
      hash(seed + 7) < 0.5
        ? -1
        : 1;
    horror.eventCount += 1;
    horror.lastEvent = type;
    horror.lastEventSeconds = 0;
    if (type === "peripheral_groundskeeper") {
      const eventDuration =
        duration ||
        1.15 + hash(seed + 13) * 0.65;
      horror.manifestation = {
        type,
        side,
        seconds: eventDuration,
        duration: eventDuration,
        height:
          0.48 + hash(seed + 29) * 0.22,
        seed,
      };
      horror.apparitionCount += 1;
    } else if (type === "fog_surge") {
      horror.fogSurgeSeconds =
        Math.max(
          horror.fogSurgeSeconds,
          duration || 3.2,
        );
      horror.fogSurgeCount += 1;
    } else if (type === "light_failure") {
      horror.lightFailureSeconds =
        Math.max(
          horror.lightFailureSeconds,
          duration || 2.1,
        );
      horror.lightFailureCount += 1;
    }
    playHorrorCue(type, side);
  }

  function updateHorrorDirector(
    dt,
    moving,
  ) {
    const hole = state.hole;
    const horror =
      hole.horrorDirector;
    const tension =
      hole.tensionDirector;
    const zoneDepth =
      hole.zoneIndex /
      Math.max(1, COURSE_ZONES.length - 1);
    const joeDistance = worldDistance(
      hole.joe,
      state.player,
    );
    horror.lastEventSeconds += dt;
    horror.fogSurgeSeconds = Math.max(
      0,
      horror.fogSurgeSeconds - dt,
    );
    horror.lightFailureSeconds = Math.max(
      0,
      horror.lightFailureSeconds - dt,
    );
    if (horror.manifestation) {
      horror.manifestation.seconds = Math.max(
        0,
        horror.manifestation.seconds - dt,
      );
      if (
        horror.manifestation.seconds <= 0 ||
        hole.joe.mode === "chase"
      ) {
        horror.manifestation = null;
      }
    }
    const modeWeight =
      hole.joe.mode === "chase"
        ? 0.3
        : hole.joe.mode === "search"
          ? 0.18
          : hole.joe.mode === "investigate"
            ? 0.1
            : 0;
    const targetIntensity = clamp(
      0.06 +
        zoneDepth * 0.25 +
        tension.pressure * 0.4 +
        modeWeight +
        (hole.dreadTimer > 0 ? 0.08 : 0) +
        (hole.blackoutTimer > 0 ? 0.06 : 0) +
        clamp(1 - joeDistance / 96, 0, 1) *
          0.12,
      0,
      1,
    );
    const reliefScale =
      tension.reliefSeconds > 0 &&
      hole.joe.mode !== "chase"
        ? 0.58
        : 1;
    horror.intensity = lerp(
      horror.intensity,
      targetIntensity * reliefScale,
      1 - Math.exp(-dt * 1.35),
    );
    if (
      horror.observedZone !==
      hole.zoneIndex
    ) {
      horror.observedZone = hole.zoneIndex;
      if (hole.zoneIndex > 0) {
        horror.eventTimer = Math.min(
          horror.eventTimer,
          2.8,
        );
      }
    }
    if (
      hole.elapsed <
        HORROR_DIRECTOR_GRACE_SECONDS ||
      hole.escapeFiling.sealing ||
      tension.reliefSeconds > 0
    ) {
      return;
    }
    horror.eventTimer = Math.max(
      0,
      horror.eventTimer -
        dt *
          (moving ? 1 : 0.72) *
          (0.72 + horror.intensity * 0.72),
    );
    if (
      horror.eventTimer > 0 ||
      horror.manifestation
    ) {
      return;
    }
    const eventIndex =
      (
        horror.eventCount +
        hole.zoneIndex * 2
      ) % 3;
    const eventType =
      hole.joe.mode === "chase"
        ? eventIndex === 1
          ? "light_failure"
          : "fog_surge"
        : eventIndex === 0
          ? "peripheral_groundskeeper"
          : eventIndex === 1
            ? "fog_surge"
            : "light_failure";
    triggerHorrorEvent(eventType);
    horror.eventTimer =
      HORROR_DIRECTOR_MIN_EVENT_SECONDS +
      (1 - horror.intensity) * 5.5 +
      hash(
        horror.eventCount * 41 +
          hole.zoneIndex * 23,
        ) * 3.5;
  }

  function crosswindDirectionLabel() {
    return state.hole.crosswind.direction > 0
      ? "EAST"
      : "WEST";
  }

  function crosswindStrength() {
    const wind =
      state.hole?.crosswind;
    if (!wind || wind.phase === "calm") {
      return 0;
    }
    if (wind.phase === "warning") {
      return clamp(
        0.18 +
          (
            1 -
            wind.timer /
              CROSSWIND_WARNING_SECONDS
          ) *
            0.52,
        0,
        0.7,
      );
    }
    return clamp(
      Math.min(
        (
          CROSSWIND_ACTIVE_SECONDS -
          wind.timer
        ) /
          0.28,
        wind.timer / 0.52,
      ),
      0,
      1,
    );
  }

  function crosswindMasksFootsteps(
    environment,
  ) {
    const hole = state.hole;
    return Boolean(
      hole.crosswind.phase === "active" &&
      !environment.sand &&
      !hole.escapeFiling.active &&
      !hole.escapeFiling.sealing &&
      hole.joe.mode !== "chase" &&
      hole.detection < 0.72
    );
  }

  function crosswindCanStart() {
    const hole = state.hole;
    return Boolean(
      hole.crosswind.phase === "calm" &&
      hole.crosswind.timer <= 0 &&
      hole.elapsed >= 16 &&
      state.player.y >= 90 &&
      state.player.y <= 660 &&
      hole.zoneIndex !==
        hole.crosswind.lastZone &&
      hole.joe.mode === "patrol" &&
      hole.detection < 0.34 &&
      hole.noise < 0.56 &&
      hole.zoneBannerTimer <= 0 &&
      hole.stateBannerLockTimer <= 0 &&
      !hole.statusRequest.active &&
      !hole.escapeFiling.active &&
      !hole.escapeFiling.sealing &&
      !hole.ballAim.active &&
      !hole.ballFlight &&
      !hole.distraction &&
      !hole.appealReviewTimer &&
      !hole.riskAward &&
      !hole.deliveryAward &&
      !hole.blindsideTransfer &&
      !hole.tensionDirector
        .pendingIntercept
    );
  }

  function startCrosswindWarning() {
    const hole = state.hole;
    const wind = hole.crosswind;
    wind.phase = "warning";
    wind.timer =
      CROSSWIND_WARNING_SECONDS;
    wind.direction =
      (
        wind.eventCount +
        hole.variantIndex
      ) %
        2 ===
      0
        ? 1
        : -1;
    wind.lastZone =
      hole.zoneIndex;
    wind.lastOutcome =
      "warning";
    wind.currentDistance = 0;
    wind.awardGiven = false;
    wind.lastTravelDistance =
      hole.travelDistance;
    hole.stateBanner =
      `CROSSWIND BUILDING // GRASS LEANS ${crosswindDirectionLabel()}`;
    hole.stateBannerTimer = 1.55;
    setHoleMessage(
      "THE ROUGH BOWS BEFORE THE GUST — move with the rush to hide your footfalls.",
      2.2,
    );
    pushThreatCaption(
      "CROSSWIND BUILDS THROUGH THE ROUGH",
      null,
      "world",
      2.1,
      "crosswind_weather",
    );
    playCrosswindCue(false);
  }

  function beginCrosswindCover() {
    const hole = state.hole;
    const wind = hole.crosswind;
    wind.phase = "active";
    wind.timer =
      CROSSWIND_ACTIVE_SECONDS;
    wind.eventCount += 1;
    wind.currentDistance = 0;
    wind.awardGiven = false;
    wind.lastTravelDistance =
      hole.travelDistance;
    wind.lastOutcome =
      "cover_open";
    hole.stateBanner =
      "CROSSWIND COVER // FOOTSTEPS MASKED";
    hole.stateBannerTimer = 2.1;
    setHoleMessage(
      `WIND COVER — cross ${CROSSWIND_RUN_DISTANCE}m. Steps drop to 42%; sight and tracks remain.`,
      3.4,
    );
    pushThreatCaption(
      "WIND RUSHES ACROSS THE FAIRWAY",
      null,
      "world",
      2.4,
      "crosswind_weather",
    );
    playCrosswindCue(true);
  }

  function completeCrosswindRun() {
    const hole = state.hole;
    const wind = hole.crosswind;
    if (wind.awardGiven) {
      return;
    }
    wind.awardGiven = true;
    wind.windRuns += 1;
    wind.lastOutcome =
      "wind_run";
    const award = awardDeliveryBeat(
      "CROSSWIND TRAVERSE",
      CROSSWIND_RUN_BONUS,
    );
    hole.stateBanner = award
      ? "WIND RUN // DELIVERY LINKED"
      : "WIND RUN // WEATHER CAP REACHED";
    hole.stateBannerTimer = 2.2;
    setHoleMessage(
      `WIND RUN — ${Math.round(wind.currentDistance)}m crossed inside the gust without giving Joe a clean sound.`,
      2.8,
    );
    addWorldEffect(
      "crosswind_run",
      state.player.x,
      state.player.y,
      1.5,
    );
    playCrosswindRunCue();
  }

  function finishCrosswindCover() {
    const hole = state.hole;
    const wind = hole.crosswind;
    wind.phase = "calm";
    wind.timer =
      15 +
      hash(
        wind.eventCount * 47 +
          hole.variantIndex * 19,
      ) *
        6;
    wind.lastOutcome =
      wind.awardGiven
        ? "wind_run"
        : "cover_expired";
    if (
      !wind.awardGiven &&
      hole.joe.mode !== "chase" &&
      hole.stateBannerLockTimer <= 0
    ) {
      setHoleMessage(
        "THE CROSSWIND FALLS AWAY — every new footstep is audible again.",
        2.1,
      );
    }
  }

  function updateCrosswind(
    dt,
    moving,
    environment,
  ) {
    const hole = state.hole;
    const wind = hole.crosswind;
    if (wind.phase === "calm") {
      wind.timer = Math.max(
        0,
        wind.timer - dt,
      );
      if (crosswindCanStart()) {
        startCrosswindWarning();
      }
      return;
    }
    wind.timer = Math.max(
      0,
      wind.timer - dt,
    );
    if (wind.phase === "warning") {
      if (wind.timer <= 0) {
        beginCrosswindCover();
      }
      return;
    }
    const travelDelta = Math.max(
      0,
      hole.travelDistance -
        wind.lastTravelDistance,
    );
    wind.lastTravelDistance =
      hole.travelDistance;
    if (
      moving &&
      crosswindMasksFootsteps(
        environment,
      )
    ) {
      wind.maskedSeconds += dt;
      wind.currentDistance +=
        travelDelta;
      wind.totalMaskedDistance +=
        travelDelta;
      if (
        !wind.awardGiven &&
        wind.currentDistance >=
          CROSSWIND_RUN_DISTANCE &&
        hole.detection < 0.36
      ) {
        completeCrosswindRun();
      }
    }
    if (wind.timer <= 0) {
      finishCrosswindCover();
    }
  }

  function joeCoursePressureMultiplier() {
    const progress =
      clamp(
        state.player.y /
          COURSE_LENGTH,
        0,
        1,
      );
    return (
      1 +
      smoothstep(progress) *
        0.14 +
      (
        state.hole
          .reviewsCleared
          ?.length || 0
      ) *
        0.015
    );
  }

  function moveJoeToward(target, speed, dt) {
    const joe = state.hole.joe;
    const effectiveSpeed =
      speed *
      joeCoursePressureMultiplier() *
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

  function drawPracticeBell() {
    if (!practiceDrillActive()) {
      return;
    }
    const drill =
      state.hole.practiceDrill;
    const target = drill.target;
    const point = worldToScreen(
      target.x,
      target.y,
    );
    if (
      !point.visible ||
      point.x < -130 ||
      point.x > WIDTH + 130
    ) {
      return;
    }
    drawInteractionGroundRing(
      target,
      "#e9b84f",
      false,
    );
    const height = clamp(
      point.pixelsPerMeter * 2.4,
      38,
      132,
    );
    const width = height * 0.38;
    const sway = state.reducedMotion
      ? 0
      : Math.sin(state.time * 1.9) *
        0.025;
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.fillStyle =
      "rgba(0,0,0,0.34)";
    ctx.beginPath();
    ctx.ellipse(
      0,
      2,
      width * 0.84,
      Math.max(3, width * 0.18),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#243026";
    ctx.fillRect(
      -width * 0.48,
      -height * 0.08,
      width * 0.96,
      height * 0.08,
    );
    ctx.fillStyle = "#3d4a3b";
    ctx.fillRect(
      -width * 0.11,
      -height * 0.78,
      width * 0.22,
      height * 0.72,
    );
    ctx.fillStyle = "#66705a";
    ctx.fillRect(
      -width * 0.035,
      -height * 0.75,
      width * 0.07,
      height * 0.63,
    );
    ctx.save();
    ctx.translate(
      0,
      -height * 0.72,
    );
    ctx.rotate(sway);
    ctx.fillStyle = "#5a3c20";
    ctx.fillRect(
      -width * 0.56,
      -height * 0.12,
      width * 1.12,
      height * 0.12,
    );
    ctx.fillStyle = "#d59a34";
    ctx.beginPath();
    ctx.moveTo(
      -width * 0.42,
      -height * 0.06,
    );
    ctx.lineTo(
      width * 0.42,
      -height * 0.06,
    );
    ctx.lineTo(
      width * 0.58,
      height * 0.18,
    );
    ctx.lineTo(
      -width * 0.58,
      height * 0.18,
    );
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f1c55a";
    ctx.fillRect(
      -width * 0.32,
      -height * 0.025,
      width * 0.64,
      height * 0.04,
    );
    ctx.fillStyle = "#b66d29";
    ctx.fillRect(
      -width * 0.07,
      height * 0.18,
      width * 0.14,
      height * 0.08,
    );
    ctx.restore();
    ctx.restore();
    drawWorldMarker(
      target.x,
      target.y,
      "OPTIONAL FIELD TEST // CHIP HERE",
      "#e9b84f",
      "◎",
    );
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
    const transformedPoint =
      transformCourseScreenPoint(
        footprint.point,
      );
    const alpha = clamp(
      state.hole.blockedTimer * 1.65,
      0,
      1,
    );
    const targetX = clamp(
      transformedPoint.x,
      108,
      WIDTH - 108,
    );
    const targetY = clamp(
      transformedPoint.y,
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
        footprint.radiusX *
          transformedPoint.scale,
      ),
      Math.max(
        5,
        footprint.radiusY *
          transformedPoint.scale,
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
    const cameraOffset =
      -state.player.x * 3.1 +
      courseCameraMotion()
        .offsetX *
        0.62;

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
    const deadGreenZone =
      COURSE_ZONES.find(
        (zone) =>
          zone.id ===
          "dead_green",
      );
    if (
      !deadGreenZone ||
      state.player.y <
        deadGreenZone.start - 44
    ) {
      return;
    }
    const zoneStart =
      deadGreenZone.start + 2;
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
      const wet =
        wetStateAt(
          zone,
        ).active;
      const alpha = clamp(
        0.42 +
          point.scale * 0.3 +
          (active ? 0.1 : 0),
        0.4,
        0.88,
      );
      ctx.save();
      ctx.translate(
        point.x,
        point.y,
      );
      ctx.rotate(
        zone.rakeAngle * 0.22,
      );
      const groundShadow =
        ctx.createRadialGradient(
          0,
          verticalRadius * 0.1,
          horizontalRadius * 0.12,
          0,
          verticalRadius * 0.1,
          horizontalRadius * 1.12,
        );
      groundShadow.addColorStop(
        0,
        `rgba(18,14,9,${alpha * 0.26})`,
      );
      groundShadow.addColorStop(
        0.7,
        `rgba(14,11,7,${alpha * 0.34})`,
      );
      groundShadow.addColorStop(
        1,
        "rgba(8,7,5,0)",
      );
      ctx.fillStyle =
        groundShadow;
      ctx.beginPath();
      ctx.ellipse(
        0,
        verticalRadius * 0.13,
        horizontalRadius * 1.11,
        verticalRadius * 1.34,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();

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
        const source =
          BUNKER_ATLAS_SOURCES[
            atlasIndex %
              BUNKER_ATLAS_SOURCES.length
          ];
        const artWidth =
          horizontalRadius * 2.38;
        const artHeight =
          verticalRadius * 3.15;
        ctx.globalAlpha = clamp(
          alpha * 1.12,
          0.5,
          0.98,
        );
        drawCachedAtlasCell(
          bunkerAtlasArt,
          source,
          point.x -
            artWidth * 0.5,
          point.y -
            artHeight * 0.53,
          artWidth,
          artHeight,
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
        horizontalRadius * 0.88,
        verticalRadius * 0.78,
        zone.rakeAngle,
        0,
        Math.PI * 2,
      );
      ctx.clip();

      const moonWash =
        ctx.createLinearGradient(
          point.x,
          point.y -
            verticalRadius,
          point.x,
          point.y +
            verticalRadius,
        );
      moonWash.addColorStop(
        0,
        `rgba(191,183,158,${alpha * 0.08})`,
      );
      moonWash.addColorStop(
        0.48,
        `rgba(161,121,68,${alpha * 0.06})`,
      );
      moonWash.addColorStop(
        1,
        `rgba(68,42,23,${alpha * 0.14})`,
      );
      ctx.fillStyle =
        moonWash;
      ctx.fillRect(
        point.x -
          horizontalRadius,
        point.y -
          verticalRadius,
        horizontalRadius * 2,
        verticalRadius * 2,
      );

      if (wet) {
        const wetSeed =
          hash(
            index * 83.9,
          );
        const wetX =
          point.x +
          (
            wetSeed -
            0.5
          ) *
            horizontalRadius *
            0.42;
        const wetY =
          point.y +
          (
            hash(
              wetSeed * 51,
            ) -
            0.5
          ) *
            verticalRadius *
            0.36;
        const wetGradient =
          ctx.createRadialGradient(
            wetX,
            wetY,
            0,
            wetX,
            wetY,
            horizontalRadius * 0.38,
          );
        wetGradient.addColorStop(
          0,
          `rgba(50,101,105,${alpha * 0.34})`,
        );
        wetGradient.addColorStop(
          0.68,
          `rgba(30,70,72,${alpha * 0.22})`,
        );
        wetGradient.addColorStop(
          1,
          "rgba(24,56,58,0)",
        );
        ctx.fillStyle =
          wetGradient;
        ctx.beginPath();
        ctx.ellipse(
          wetX,
          wetY,
          horizontalRadius * 0.38,
          verticalRadius * 0.28,
          zone.rakeAngle,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.strokeStyle =
          `rgba(145,206,202,${alpha * 0.32})`;
        ctx.lineWidth = Math.max(
          1,
          point.scale,
        );
        ctx.beginPath();
        ctx.ellipse(
          wetX -
            horizontalRadius * 0.04,
          wetY -
            verticalRadius * 0.03,
          horizontalRadius * 0.19,
          verticalRadius * 0.08,
          zone.rakeAngle,
          Math.PI * 1.05,
          Math.PI * 1.82,
        );
        ctx.stroke();
      }

      for (
        let grain = 0;
        grain < 26;
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
            0.78;
        const grainY =
          point.y +
          (hash(seed * 71) * 2 - 1) *
            verticalRadius *
            0.66;
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
            ? `rgba(224,203,157,${alpha * 0.34})`
            : `rgba(63,48,34,${alpha * 0.3})`;
        ctx.fillRect(
          Math.round(grainX),
          Math.round(grainY),
          Math.ceil(size),
          Math.ceil(size * 0.6),
        );
      }
      if (
        !state.reducedMotion &&
        point.scale > 0.18
      ) {
        for (
          let drift = 0;
          drift < 6;
          drift += 1
        ) {
          const seed =
            hash(
              index * 211 +
                drift * 59.7,
            );
          const phase =
            (
              seed +
              state.hole.elapsed *
                (
                  0.028 +
                  drift * 0.002
                )
            ) %
            1;
          const driftX =
            point.x -
            horizontalRadius * 0.72 +
            phase *
              horizontalRadius *
              1.44;
          const driftY =
            point.y +
            (
              hash(seed * 97) -
              0.5
            ) *
              verticalRadius *
              1.1;
          const driftAlpha =
            Math.sin(
              phase *
                Math.PI,
            ) *
            alpha *
            0.24;
          ctx.strokeStyle =
            `rgba(232,215,176,${driftAlpha})`;
          ctx.lineWidth =
            Math.max(
              1,
              point.scale * 0.55,
            );
          ctx.beginPath();
          ctx.moveTo(
            driftX,
            driftY,
          );
          ctx.lineTo(
            driftX +
              Math.max(
                2,
                point.scale * 5,
              ),
            driftY -
              Math.max(
                1,
                point.scale * 0.8,
              ),
          );
          ctx.stroke();
        }
      }
      ctx.restore();

      ctx.save();
      const tuftCount =
        point.scale > 0.12
          ? 14
          : 8;
      for (
        let tuft = 0;
        tuft < tuftCount;
        tuft += 1
      ) {
        const seed =
          hash(
            index * 151 +
              tuft * 43.3,
          );
        const angle =
          seed *
          Math.PI *
          2;
        const tuftX =
          point.x +
          Math.cos(
            angle,
          ) *
            horizontalRadius *
            (
              0.94 +
              hash(seed * 19) *
                0.12
            );
        const tuftY =
          point.y +
          Math.sin(
            angle,
          ) *
            verticalRadius *
            (
              0.88 +
              hash(seed * 31) *
                0.15
            );
        const bladeHeight =
          Math.max(
            2,
            point.scale *
              (
                3 +
                hash(seed * 71) *
                  5
              ),
          );
        ctx.strokeStyle =
          tuft % 3 === 0
            ? `rgba(111,121,62,${alpha * 0.58})`
            : `rgba(43,63,34,${alpha * 0.74})`;
        ctx.lineWidth =
          Math.max(
            1,
            point.scale * 0.65,
          );
        ctx.beginPath();
        ctx.moveTo(
          tuftX,
          tuftY,
        );
        ctx.lineTo(
          tuftX +
            (
              seed -
              0.5
            ) *
              bladeHeight *
              0.55,
          tuftY -
            bladeHeight,
        );
        ctx.stroke();
      }

      if (
        active ||
        state.hole.focus
      ) {
        ctx.strokeStyle =
          active
            ? `rgba(238,190,105,${0.28 + alpha * 0.2})`
            : `rgba(191,170,112,${alpha * 0.24})`;
        ctx.lineWidth =
          Math.max(
            1,
            point.scale * 1.2,
          );
        ctx.setLineDash(
          active
            ? []
            : [
                Math.max(
                  2,
                  point.scale * 4,
                ),
                Math.max(
                  2,
                  point.scale * 3,
                ),
              ],
        );
        ctx.beginPath();
        ctx.ellipse(
          point.x,
          point.y,
          horizontalRadius * 0.94,
          verticalRadius * 0.9,
          zone.rakeAngle,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
        ctx.setLineDash([]);
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

  function drawPlayerGroundResponses() {
    const hole = state.hole;
    const quality =
      effectQualityScale();
    const responseStep =
      quality < 0.55
        ? 2
        : 1;
    const visibleResponses =
      hole.groundResponses
        .map((response) => ({
          response,
          point: worldToScreen(
            response.x,
            response.y,
          ),
        }))
        .filter(
          (entry) =>
            entry.point.visible &&
            entry.point.x > -100 &&
            entry.point.x <
              WIDTH + 100,
        )
        .sort(
          (a, b) =>
            a.point.y -
            b.point.y,
        );
    for (
      let index = 0;
      index < visibleResponses.length;
      index += responseStep
    ) {
      const entry =
        visibleResponses[index];
      const response =
        entry.response;
      const point = entry.point;
      const progress = clamp(
        response.age /
          response.duration,
        0,
        1,
      );
      const life =
        1 - smoothstep(progress);
      const arrival =
        state.reducedMotion
          ? 1
          : smoothstep(
              clamp(
                response.age / 0.16,
                0,
                1,
              ),
            );
      const baseWidth = clamp(
        (
          5.2 +
          response.intensity * 2.2
        ) *
          point.scale *
          (
            0.8 +
            arrival * 0.2
          ),
        4,
        38,
      );
      const baseHeight =
        Math.max(
          1.5,
          baseWidth * 0.19,
        );
      ctx.save();
      ctx.translate(
        point.x,
        point.y,
      );
      ctx.globalAlpha =
        life *
        clamp(
          0.38 +
            point.scale * 0.14,
          0.38,
          0.82,
        );
      ctx.fillStyle =
        response.kind === "sand"
          ? "rgba(64,45,25,0.62)"
          : response.kind === "wet"
            ? "rgba(7,34,31,0.68)"
            : "rgba(5,18,9,0.7)";
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        baseWidth,
        baseHeight,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      if (
        response.kind === "rough"
      ) {
        const bladeCount =
          quality < 0.85
            ? 6
            : 9;
        ctx.lineWidth =
          Math.max(
            1,
            point.scale * 0.5,
          );
        for (
          let blade = 0;
          blade < bladeCount;
          blade += 1
        ) {
          const seed = hash(
            response.seed * 97 +
              blade * 31.7,
          );
          const bladeX =
            (
              seed * 2 -
              1
            ) *
            baseWidth * 0.82;
          const bladeHeight =
            baseHeight *
            (
              1.4 +
              hash(seed * 43) *
                2.2
            );
          const lean =
            Math.sign(
              bladeX ||
                (
                  blade % 2 === 0
                    ? -1
                    : 1
                ),
            ) *
            bladeHeight *
            (
              0.44 +
              response.intensity *
                0.3
            ) *
            arrival;
          ctx.strokeStyle =
            blade % 3 === 0
              ? `rgba(142,151,84,${life * 0.62})`
              : `rgba(66,91,47,${life * 0.76})`;
          ctx.beginPath();
          ctx.moveTo(
            bladeX,
            0,
          );
          ctx.quadraticCurveTo(
            bladeX +
              lean * 0.38,
            -bladeHeight * 0.54,
            bladeX + lean,
            -bladeHeight * 0.18,
          );
          ctx.stroke();
        }
      } else if (
        response.kind === "wet"
      ) {
        ctx.globalCompositeOperation =
          "screen";
        ctx.strokeStyle =
          `rgba(137,213,202,${life * 0.66})`;
        ctx.lineWidth =
          Math.max(
            1,
            point.scale * 0.55,
          );
        for (
          let ripple = 0;
          ripple < 2;
          ripple += 1
        ) {
          const spread =
            0.58 +
            progress * 0.52 +
            ripple * 0.24;
          ctx.beginPath();
          ctx.ellipse(
            0,
            0,
            baseWidth * spread,
            baseHeight * spread,
            0,
            Math.PI * 0.06,
            Math.PI * 0.94,
          );
          ctx.stroke();
        }
        ctx.fillStyle =
          `rgba(191,232,216,${life * 0.72})`;
        const glintSize =
          Math.max(
            1,
            Math.round(
              point.scale * 0.65,
            ),
          );
        ctx.fillRect(
          Math.round(
            -baseWidth * 0.54,
          ),
          Math.round(
            -baseHeight * 0.6,
          ),
          glintSize,
          glintSize,
        );
        ctx.fillRect(
          Math.round(
            baseWidth * 0.42,
          ),
          Math.round(
            baseHeight * 0.22,
          ),
          glintSize,
          glintSize,
        );
      } else if (
        response.kind === "sand"
      ) {
        ctx.strokeStyle =
          `rgba(215,185,117,${life * 0.58})`;
        ctx.lineWidth =
          Math.max(
            1,
            point.scale * 0.5,
          );
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          baseWidth *
            (
              0.68 +
              progress * 0.18
            ),
          baseHeight * 0.72,
          0,
          Math.PI * 0.08,
          Math.PI * 0.92,
        );
        ctx.stroke();
        ctx.fillStyle =
          `rgba(229,202,144,${life * 0.52})`;
        for (
          let grain = 0;
          grain < 4;
          grain += 1
        ) {
          const seed = hash(
            response.seed * 61 +
              grain * 17,
          );
          ctx.fillRect(
            Math.round(
              (
                seed - 0.5
              ) *
                baseWidth * 1.5,
            ),
            Math.round(
              (
                hash(seed * 37) -
                0.5
              ) *
                baseHeight,
            ),
            Math.max(
              1,
              Math.round(
                point.scale * 0.42,
              ),
            ),
            Math.max(
              1,
              Math.round(
                point.scale * 0.42,
              ),
            ),
          );
        }
      } else {
        ctx.globalCompositeOperation =
          "screen";
        ctx.strokeStyle =
          `rgba(173,202,156,${life * 0.34})`;
        ctx.lineWidth =
          Math.max(
            1,
            point.scale * 0.42,
          );
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          baseWidth *
            (
              0.7 +
              progress * 0.25
            ),
          baseHeight * 0.82,
          0,
          Math.PI * 0.12,
          Math.PI * 0.88,
        );
        ctx.stroke();
        ctx.fillStyle =
          `rgba(194,219,188,${life * 0.48})`;
        const dewSize =
          Math.max(
            1,
            Math.round(
              point.scale * 0.48,
            ),
          );
        ctx.fillRect(
          Math.round(
            baseWidth * 0.56,
          ),
          Math.round(
            -baseHeight * 0.38,
          ),
          dewSize,
          dewSize,
        );
      }
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
        const cutClueLife =
          clamp(
            1 -
              mark.age /
                JOE_CUT_CLUE_MAX_AGE,
            0,
            1,
          );
        const bedAlpha = clamp(
          0.34 +
            point.scale * 0.2 +
            cutClueLife * 0.14,
          0.34,
          0.72,
        );
        const freshness =
          cutClueLife > 0.72
            ? "fresh"
            : cutClueLife > 0.38
              ? "warm"
              : "fading";
        const wakeLength = Math.max(
          7,
          (
            mark.length ||
            MOWED_MARK_SPACING + 1.4
          ) *
            COURSE_CAMERA
              .worldUnitMeters *
            point.pixelsPerMeter,
        );
        const wakeWidth = Math.max(
          4,
          (
            mark.laneWidth || 4.4
          ) *
            COURSE_CAMERA
              .worldUnitMeters *
            point.pixelsPerMeter,
        );
        ctx.globalAlpha = bedAlpha;
        ctx.drawImage(
          mowerWakeStamp(
            freshness,
            mark.id % 3,
          ),
          -wakeLength * 0.5,
          -wakeWidth * 0.5,
          wakeLength,
          wakeWidth,
        );
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
    if (
      hole.changeRequestCollected ||
      hole.appealUsed
    ) {
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
          `+${CHANGE_REQUEST_BONUS} ON ESCAPE // CHASE APPEAL`,
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

  function drawAppealDocument() {
    const hole = state.hole;
    const document =
      hole.appealDocument;
    if (!document) {
      return;
    }
    const point = worldToScreen(
      document.x,
      document.y,
    );
    if (
      !point.visible ||
      point.x < -100 ||
      point.x > WIDTH + 100
    ) {
      return;
    }
    const active =
      hole.appealReviewTimer > 0;
    const progress = clamp(
      hole.appealReviewTimer /
        document.duration,
      0,
      1,
    );
    const scale = clamp(
      point.scale,
      0.58,
      1.45,
    );
    const height = 42 * scale;
    const width = 29 * scale;
    const pulse =
      state.reducedMotion || !active
        ? 0
        : Math.sin(
            hole.elapsed * 7,
          ) *
          2.4;
    ctx.save();
    ctx.globalAlpha = active
      ? 1
      : 0.48;
    ctx.fillStyle = active
      ? "rgba(14,5,2,0.62)"
      : "rgba(4,7,4,0.42)";
    ctx.beginPath();
    ctx.ellipse(
      point.x,
      point.y + 2,
      width * 0.88,
      height * 0.18,
      -0.16,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    if (active) {
      ctx.strokeStyle =
        "rgba(240,151,72,0.82)";
      ctx.lineWidth = Math.max(
        1,
        2 * scale,
      );
      ctx.beginPath();
      ctx.ellipse(
        point.x,
        point.y,
        width *
          (0.92 + pulse * 0.01),
        height * 0.24,
        0,
        Math.PI * 2 *
          (1 - progress),
        Math.PI * 2,
      );
      ctx.stroke();
    }
    ctx.translate(
      point.x,
      point.y - height * 0.25,
    );
    ctx.rotate(-0.3);
    if (
      interactablePropArt.complete &&
      interactablePropArt.naturalWidth > 0
    ) {
      const cell =
        INTERACTABLE_PROP_CELLS[1];
      ctx.drawImage(
        interactablePropArt,
        cell.x,
        cell.y,
        cell.width,
        cell.height,
        -width * 0.5,
        -height * 0.78,
        width,
        height,
      );
    } else {
      ctx.fillStyle = "#d8c9a4";
      ctx.fillRect(
        -width * 0.5,
        -height * 0.72,
        width,
        height * 0.72,
      );
      ctx.fillStyle = "#b14e2c";
      ctx.fillRect(
        -width * 0.5,
        -height * 0.72,
        width,
        height * 0.16,
      );
    }
    ctx.restore();
    if (
      active ||
      (
        hole.focus &&
        worldDistance(
          state.player,
          document,
        ) < 50
      )
    ) {
      drawText(
        active
          ? `APPEAL REVIEW ${hole.appealReviewTimer.toFixed(1)}s`
          : "APPEAL FILED // EVIDENCE SPENT",
        point.x,
        point.y - height - 8,
        9,
        active
          ? "#f1b36d"
          : "#98735d",
        "center",
        true,
      );
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
    drawCachedAtlasCell(
      obstacleArt,
      cell,
      point.x - drawWidth * 0.5 + sway,
      point.y - drawHeight,
      drawWidth,
      drawHeight,
    );
    if (obstacle.lightRadius) {
      const power =
        floodlightPowerAt(
          obstacle,
          COURSE_OBSTACLE_INDEX.get(
            obstacle,
          ),
        );
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
    drawCachedAtlasCell(
      deadGreenSceneryArt,
      cell,
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

  function drawSprintReviewGate(
    review,
    reviewIndex,
  ) {
    const point =
      worldToScreen(
        review.x,
        review.y,
      );
    if (
      !point.visible ||
      point.x < -220 ||
      point.x > WIDTH + 220
    ) {
      return;
    }
    const cleared =
      sprintReviewCleared(
        review,
      );
    const distance =
      worldDistance(
        state.player,
        review,
      );
    const pulse =
      state.reducedMotion
        ? 0.72
        : 0.66 +
          Math.sin(
            state.hole.elapsed *
              4.2 +
              reviewIndex *
                1.7,
          ) *
            0.16;
    const radiusX = clamp(
      review.radius *
        COURSE_CAMERA
          .worldUnitMeters *
        point.pixelsPerMeter,
      18,
      270,
    );
    const radiusY =
      Math.max(
        4,
        radiusX * 0.12,
      );
    ctx.save();
    ctx.globalAlpha =
      cleared
        ? 0.24
        : clamp(
            0.38 +
              point.scale *
                0.52,
            0.42,
            0.96,
          );
    ctx.fillStyle =
      cleared
        ? "rgba(87,118,77,0.14)"
        : `rgba(219,167,62,${
            0.1 +
            pulse * 0.08
          })`;
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
    ctx.strokeStyle =
      cleared
        ? "#718a68"
        : "#e3b44e";
    ctx.lineWidth =
      cleared ? 1 : 2;
    ctx.setLineDash(
      cleared
        ? [4, 5]
        : [8, 5],
    );
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
    ctx.stroke();
    ctx.setLineDash([]);

    const signHeight = clamp(
      point.pixelsPerMeter *
        1.55,
      18,
      96,
    );
    const signWidth =
      signHeight * 1.08;
    ctx.fillStyle =
      "rgba(1,4,2,0.48)";
    ctx.beginPath();
    ctx.ellipse(
      point.x,
      point.y + 1,
      signWidth * 0.34,
      Math.max(
        1,
        signHeight * 0.04,
      ),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    if (
      signageAtlasArt.complete &&
      signageAtlasArt.naturalWidth >
        0
    ) {
      ctx.drawImage(
        signageAtlasArt,
        (
          reviewIndex % 3
        ) *
          SIGNAGE_ATLAS_CELL,
        SIGNAGE_ATLAS_CELL,
        SIGNAGE_ATLAS_CELL,
        SIGNAGE_ATLAS_CELL,
        point.x -
          signWidth * 0.5,
        point.y -
          signHeight,
        signWidth,
        signHeight,
      );
    } else {
      ctx.fillStyle =
        "#28371f";
      ctx.fillRect(
        point.x -
          signWidth * 0.35,
        point.y -
          signHeight * 0.76,
        signWidth * 0.7,
        signHeight * 0.38,
      );
      ctx.fillStyle =
        "#6e6541";
      ctx.fillRect(
        point.x - 2,
        point.y -
          signHeight * 0.4,
        4,
        signHeight * 0.4,
      );
    }
    if (
      point.forwardDistance <
        98 &&
      signHeight > 24
    ) {
      const labelY =
        point.y -
        signHeight -
        12;
      const labelWidth = 174;
      ctx.globalAlpha =
        cleared ? 0.54 : 0.94;
      ctx.fillStyle =
        "rgba(3,8,4,0.88)";
      ctx.fillRect(
        point.x -
          labelWidth * 0.5,
        labelY - 15,
        labelWidth,
        31,
      );
      strokeRect(
        point.x -
          labelWidth * 0.5,
        labelY - 15,
        labelWidth,
        31,
        cleared
          ? "#718a68"
          : "#d8a743",
        1.5,
      );
      drawText(
        cleared
          ? `${review.code} // ACCEPTED`
          : `${review.code} // ${Math.ceil(
              distance,
            )}m`,
        point.x,
        labelY + 4,
        10,
        cleared
          ? "#9eb195"
          : "#f1d17a",
        "center",
        true,
      );
    }
    ctx.restore();
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
    drawCachedAtlasCell(
      courseClutterArt,
      cell,
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

  function drawCourseVerge(
    verge,
    vergeIndex,
  ) {
    if (
      !courseVergeArt.complete ||
      courseVergeArt
        .naturalWidth === 0
    ) {
      return;
    }
    const point =
      worldToScreen(
        verge.x,
        verge.y,
      );
    if (
      !point.visible ||
      point.x < -190 ||
      point.x > WIDTH + 190
    ) {
      return;
    }
    const cell =
      COURSE_VERGE_CELLS[
        verge.type
      ];
    if (!cell) {
      return;
    }
    const drawHeight = clamp(
      cell.heightMeters *
        verge.scale *
        point.pixelsPerMeter,
      11,
      124,
    );
    const drawWidth =
      drawHeight *
      cell.width /
      cell.height;
    const quality =
      effectQualityScale();
    const playerDistance =
      worldDistance(
        state.player,
        verge,
      );
    const joeDistance =
      worldDistance(
        state.hole.joe,
        verge,
      );
    const playerResponse =
      clamp(
        1 -
          playerDistance / 19,
        0,
        1,
      ) *
      clamp(
        0.18 +
          state.hole
            .panicMomentum *
            1.18,
        0,
        1,
      );
    const mowerResponse =
      clamp(
        1 -
          joeDistance / 21,
        0,
        1,
      ) *
      clamp(
        0.24 +
          state.hole.joe
            .effectSpeed /
            24,
        0,
        1,
      );
    const ambientSway =
      state.reducedMotion
        ? 0
        : Math.sin(
            state.hole.elapsed *
              (
                0.58 +
                hash(
                  vergeIndex * 31 +
                    7,
                ) * 0.24
              ) +
              vergeIndex * 1.73,
          ) *
          Math.min(
            1.9,
            drawHeight * 0.018,
          );
    const weatherSway =
      crosswindStrength() *
      state.hole.crosswind.direction *
      Math.min(
        state.reducedMotion
          ? 2.4
          : 6.4,
        drawHeight * 0.045,
      );
    const proximitySway =
      state.reducedMotion
        ? 0
        : Math.sign(
            verge.x -
              (
                playerResponse >=
                mowerResponse
                  ? state.player.x
                  : state.hole.joe.x
              ) ||
              1,
          ) *
          (
            playerResponse * 4.4 +
            mowerResponse * 6.2
          );
    const sway = clamp(
      ambientSway +
        proximitySway +
        weatherSway,
      -7.2,
      7.2,
    );
    ctx.save();
    ctx.globalAlpha = clamp(
      0.52 +
        point.scale * 0.42,
      0.54,
      0.96,
    );
    ctx.fillStyle =
      verge.type === 5
        ? "rgba(18,7,4,0.48)"
        : "rgba(1,7,4,0.56)";
    ctx.beginPath();
    ctx.ellipse(
      point.x,
      point.y + 1,
      drawWidth * 0.4,
      Math.max(
        1,
        drawHeight * 0.045,
      ),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.translate(
      point.x,
      point.y,
    );
    ctx.transform(
      1,
      0,
      -sway / drawHeight,
      1,
      0,
      0,
    );
    drawCachedAtlasCell(
      courseVergeArt,
      cell,
      -drawWidth * 0.5,
      -drawHeight,
      drawWidth,
      drawHeight,
    );
    if (
      quality >= 0.55 &&
      verge.type !== 5 &&
      drawHeight >= 24
    ) {
      const glintCount =
        quality >= 0.85
          ? 2
          : 1;
      ctx.globalCompositeOperation =
        "screen";
      for (
        let glint = 0;
        glint < glintCount;
        glint += 1
      ) {
        const seed =
          vergeIndex * 53 +
          glint * 29;
        const pulse =
          state.reducedMotion
            ? 0.34
            : 0.24 +
              Math.max(
                0,
                Math.sin(
                  state.hole.elapsed *
                    1.35 +
                    seed,
                ),
              ) * 0.42 +
              Math.max(
                playerResponse,
                mowerResponse,
              ) *
                0.18;
        const glintX =
          (
            hash(seed + 5) -
            0.5
          ) *
          drawWidth * 0.54;
        const glintY =
          -drawHeight *
          (
            0.34 +
            hash(seed + 11) *
              0.4
          );
        ctx.fillStyle =
          `rgba(190,229,216,${pulse})`;
        const glintSize =
          Math.max(
            1,
            Math.round(
              point.scale * 1.15,
            ),
          );
        ctx.fillRect(
          Math.round(glintX),
          Math.round(glintY),
          glintSize,
          glintSize,
        );
      }
    }
    ctx.restore();
  }

  function queueLayeredCourseEntity(
    kind,
    item,
    itemIndex,
    y,
  ) {
    let entity =
      layeredCourseEntities[
        layeredCourseEntityCount
      ];
    if (!entity) {
      entity = {
        kind: 0,
        item: null,
        itemIndex: 0,
        y: 0,
      };
      layeredCourseEntities.push(
        entity,
      );
    }
    entity.kind = kind;
    entity.item = item;
    entity.itemIndex = itemIndex;
    entity.y = y;
    layeredCourseEntityCount += 1;
  }

  function drawLayeredCourseEntities() {
    layeredCourseEntityCount = 0;
    for (let index = 0; index < COURSE_OBSTACLES.length; index += 1) {
      const obstacle = COURSE_OBSTACLES[index];
      if (obstacle.draw === false) {
        continue;
      }
      const point = worldToScreen(obstacle.x, obstacle.y);
      if (point.visible) {
        queueLayeredCourseEntity(
          0,
          obstacle,
          index,
          point.y,
        );
      }
    }
    const reviews =
      activeSprintReviews();
    for (
      let index = 0;
      index < reviews.length;
      index += 1
    ) {
      const review =
        reviews[index];
      const point =
        worldToScreen(
          review.x,
          review.y,
        );
      if (point.visible) {
        queueLayeredCourseEntity(
          1,
          review,
          index,
          point.y,
        );
      }
    }
    for (
      let index = 0;
      index <
        COURSE_CLUTTER.length;
      index += 1
    ) {
      if (
        effectQualityScale() < 0.55 &&
        index % 3 !== 0
      ) {
        continue;
      }
      const clutter =
        COURSE_CLUTTER[index];
      const point =
        worldToScreen(
          clutter.x,
          clutter.y,
        );
      if (point.visible) {
        queueLayeredCourseEntity(
          2,
          clutter,
          index,
          point.y,
        );
      }
    }
    for (
      let index = 0;
      index <
        COURSE_VERGE.length;
      index += 1
    ) {
      if (
        effectQualityScale() < 0.55 &&
        index % 4 !== 0
      ) {
        continue;
      }
      const verge =
        COURSE_VERGE[index];
      const point =
        worldToScreen(
          verge.x,
          verge.y,
        );
      if (point.visible) {
        queueLayeredCourseEntity(
          7,
          verge,
          index,
          point.y,
        );
      }
    }
    for (let index = 0; index < DEAD_GREEN_SCENERY.length; index += 1) {
      if (
        effectQualityScale() < 0.55 &&
        index % 4 !== 0
      ) {
        continue;
      }
      const scenery = DEAD_GREEN_SCENERY[index];
      const point = worldToScreen(scenery.x, scenery.y);
      if (point.visible) {
        queueLayeredCourseEntity(
          3,
          scenery,
          index,
          point.y,
        );
      }
    }
    const joePoint = worldToScreen(state.hole.joe.x, state.hole.joe.y);
    if (joePoint.visible) {
      queueLayeredCourseEntity(
        4,
        null,
        0,
        joePoint.y,
      );
    }
    const drainPoint = worldToScreen(DRAIN_EXIT.x, DRAIN_EXIT.y);
    if (drainPoint.visible) {
      queueLayeredCourseEntity(
        5,
        null,
        0,
        drainPoint.y,
      );
    }
    const shedPoint = worldToScreen(
      SHED_EXIT.x,
      SHED_EXIT.y + 2,
    );
    if (shedPoint.visible) {
      queueLayeredCourseEntity(
        6,
        null,
        0,
        shedPoint.y,
      );
    }
    layeredCourseEntities.length =
      layeredCourseEntityCount;
    layeredCourseEntities.sort(
      (a, b) => a.y - b.y,
    );
    for (
      let index = 0;
      index <
      layeredCourseEntityCount;
      index += 1
    ) {
      const entity =
        layeredCourseEntities[index];
      if (entity.kind === 0) {
        drawCourseObstacle(
          entity.item,
        );
      } else if (entity.kind === 1) {
        drawSprintReviewGate(
          entity.item,
          entity.itemIndex,
        );
      } else if (entity.kind === 2) {
        drawCourseClutter(
          entity.item,
        );
      } else if (entity.kind === 3) {
        drawDeadGreenScenery(
          entity.item,
        );
      } else if (entity.kind === 4) {
        drawJoeOnCourse();
      } else if (entity.kind === 5) {
        drawDrainExit();
      } else if (
        entity.kind === 6
      ) {
        drawMaintenanceShed();
      } else {
        drawCourseVerge(
          entity.item,
          entity.itemIndex,
        );
      }
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
    const lateralParallax = clamp(
      -state.player.x * 12.5 +
        courseCameraMotion()
          .offsetX *
          1.35,
      -820,
      820,
    );
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

  function renderCourseMiniMap() {
    const panel = {
      x: COURSE_MAP_X,
      y: COURSE_MAP_Y,
      width: COURSE_MAP_WIDTH,
      height: COURSE_MAP_HEIGHT,
    };
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
    const reviews =
      activeSprintReviews();
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
    const blindsideLane =
      blindsideLaneState();
    if (blindsideLane) {
      for (
        let index =
          blindsideLane.options.length -
          1;
        index >= 0;
        index -= 1
      ) {
        const option =
          blindsideLane.options[index];
        const optionPoint =
          mapPoint(
            option.x,
            option.y,
          );
        const primary = index === 0;
        ctx.globalAlpha =
          blindsideLane.active
            ? primary
              ? 0.95
              : 0.62
            : primary
              ? 0.75
              : 0.42;
        ctx.strokeStyle =
          "#75cda9";
        ctx.lineWidth = primary
          ? 1.8
          : 1;
        ctx.setLineDash(
          primary ? [3, 3] : [2, 4],
        );
        ctx.beginPath();
        ctx.moveTo(
          playerPoint.x,
          playerPoint.y,
        );
        ctx.lineTo(
          optionPoint.x,
          optionPoint.y,
        );
        ctx.stroke();
        ctx.setLineDash([]);
        const size = primary
          ? 5
          : 3.5;
        ctx.fillStyle =
          option.requiresCrouch
            ? primary
              ? "#9ace78"
              : "#668f58"
            : primary
              ? "#8ce0bd"
              : "#568f78";
        polygon([
          [
            optionPoint.x,
            optionPoint.y -
              size,
          ],
          [
            optionPoint.x +
              size,
            optionPoint.y,
          ],
          [
            optionPoint.x,
            optionPoint.y +
              size,
          ],
          [
            optionPoint.x -
              size,
            optionPoint.y,
          ],
        ]);
        if (option.requiresCrouch) {
          ctx.strokeStyle =
            "#9ace78";
          ctx.lineWidth = primary
            ? 1.5
            : 1;
          ctx.beginPath();
          ctx.arc(
            optionPoint.x,
            optionPoint.y,
            size + 2.5,
            Math.PI,
            Math.PI * 2,
          );
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    const cadenceForecast =
      state.hole.cadenceRead
        ?.forecast;
    if (cadenceForecast) {
      const fade = clamp(
        cadenceForecast.timer / 0.5,
        0,
        1,
      );
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.strokeStyle =
        "#79d7b5";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      for (
        let index = 0;
        index <
          cadenceForecast.path.length;
        index += 1
      ) {
        const point = mapPoint(
          cadenceForecast.path[index]
            .x,
          cadenceForecast.path[index]
            .y,
        );
        if (index === 0) {
          ctx.moveTo(
            point.x,
            point.y,
          );
        } else {
          ctx.lineTo(
            point.x,
            point.y,
          );
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
      const targetPoint = mapPoint(
        cadenceForecast.target.x,
        cadenceForecast.target.y,
      );
      ctx.fillStyle =
        "#8de2c1";
      polygon([
        [
          targetPoint.x,
          targetPoint.y - 5,
        ],
        [
          targetPoint.x + 5,
          targetPoint.y,
        ],
        [
          targetPoint.x,
          targetPoint.y + 5,
        ],
        [
          targetPoint.x - 5,
          targetPoint.y,
        ],
      ]);
      ctx.strokeStyle =
        "#d0f1e2";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(
        targetPoint.x,
        targetPoint.y,
        7,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.restore();
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
    const focusCut =
      (
        state.hole.focus
          ? turfStateAt(
              state.player,
            ).recentJoeCut
          : null
      ) ||
      (
        state.hole
            .cutTraceMemory?.timer >
          0
          ? state.hole
              .cutTraceMemory
          : null
      );
    if (focusCut) {
      const cutPoint =
        mapPoint(
          focusCut.x,
          focusCut.y,
        );
      const freshness =
        joeCutFreshness(
          focusCut,
        );
      const cutColor =
        freshness === "fresh"
          ? "#cde080"
          : freshness === "warm"
            ? "#c9ae5f"
            : "#928d5b";
      const headingX =
        Math.cos(
          focusCut.heading,
        );
      const headingY =
        -Math.sin(
          focusCut.heading,
        );
      ctx.strokeStyle =
        cutColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(
        cutPoint.x,
        cutPoint.y,
        6,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(
        cutPoint.x -
          headingX * 7,
        cutPoint.y -
          headingY * 7,
      );
      ctx.lineTo(
        cutPoint.x +
          headingX * 9,
        cutPoint.y +
          headingY * 9,
      );
      ctx.stroke();
      ctx.fillStyle =
        cutColor;
      ctx.beginPath();
      ctx.arc(
        cutPoint.x +
          headingX * 9,
        cutPoint.y +
          headingY * 9,
        2.2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      if (
        !state.hole.focus &&
        state.hole
          .cutTraceMemory
      ) {
        const memory =
          state.hole
            .cutTraceMemory;
        const progress =
          clamp(
            memory.counterDistance /
              COUNTER_ROUTE_DISTANCE,
            0,
            1,
          );
        ctx.strokeStyle =
          "#e4b75c";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(
          cutPoint.x,
          cutPoint.y,
        );
        ctx.lineTo(
          cutPoint.x -
            headingX *
              (
                7 +
                progress * 5
              ),
          cutPoint.y -
            headingY *
              (
                7 +
                progress * 5
              ),
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(
          cutPoint.x,
          cutPoint.y,
          8,
          -Math.PI * 0.5,
          -Math.PI * 0.5 +
            Math.PI *
              2 *
              progress,
        );
        ctx.stroke();
      }
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
      !state.hole.changeRequestCollected &&
        !state.hole.appealUsed,
    );
    for (
      let index = 0;
      index < reviews.length;
      index += 1
    ) {
      const review =
        reviews[index];
      const cleared =
        sprintReviewCleared(
          review,
        );
      const reviewPoint =
        mapPoint(
          review.x,
          review.y,
        );
      drawMapInteractionRange(
        review,
        "#e1b04c",
        !cleared,
      );
      ctx.fillStyle =
        cleared
          ? "#6d8565"
          : "#e1b04c";
      ctx.beginPath();
      ctx.arc(
        reviewPoint.x,
        reviewPoint.y,
        cleared ? 3 : 4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      if (!cleared) {
        ctx.strokeStyle =
          "#f3da83";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
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
      !state.hole.changeRequestCollected &&
      !state.hole.appealUsed
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
    if (state.hole.appealDocument) {
      const appealPoint = mapPoint(
        state.hole.appealDocument.x,
        state.hole.appealDocument.y,
      );
      ctx.strokeStyle =
        state.hole.appealReviewTimer > 0
          ? "#f0a05a"
          : "#8f6851";
      ctx.lineWidth =
        state.hole.appealReviewTimer > 0
          ? 2
          : 1;
      ctx.strokeRect(
        appealPoint.x - 4,
        appealPoint.y - 3,
        8,
        6,
      );
      if (
        state.hole.appealReviewTimer > 0
      ) {
        ctx.beginPath();
        ctx.arc(
          appealPoint.x,
          appealPoint.y,
          7,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
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
    if (practiceDrillActive()) {
      const practicePoint = mapPoint(
        state.hole.practiceDrill
          .target.x,
        state.hole.practiceDrill
          .target.y,
      );
      const practicePulse =
        state.reducedMotion
          ? 4
          : 4 +
            Math.sin(state.time * 5) *
              0.8;
      ctx.strokeStyle = "#e8b451";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(
        practicePoint.x,
        practicePoint.y,
        practicePulse,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.fillStyle = "#f2cc6b";
      ctx.fillRect(
        practicePoint.x - 1.5,
        practicePoint.y - 1.5,
        3,
        3,
      );
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
      const statusSignal =
        shotTarget.kind === "status_ack" ||
        shotTarget.kind ===
          "status_escalation";
      ctx.strokeStyle = statusSignal
        ? shotTarget.kind ===
          "status_escalation"
          ? "#df6242"
          : "#76c1a4"
        : aiming
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
      cadenceForecast
        ? `CADENCE ${Math.ceil(cadenceForecast.timer)}s  â€¢  MINT = JOE'S COMMITTED ROUTE`
        : state.hole.crosswind.phase ===
        "active"
        ? `WIND ${crosswindDirectionLabel()}  •  ${Math.round(state.hole.crosswind.currentDistance)}/${CROSSWIND_RUN_DISTANCE}m  •  STEPS 42%`
        : state.hole.crosswind.phase ===
            "warning"
          ? `CROSSWIND BUILDING ${crosswindDirectionLabel()}`
          : state.hole.blindsideTransfer
            ? `BLINDSIDE ${state.hole.blindsideTransfer.timer.toFixed(1)}s  •  MINT DIAMONDS ARE COVER LANES`
            : state.hole.blindsidePreview
                ?.options?.length > 0
              ? `BLINDSIDE READY  •  ${state.hole.blindsidePreview.options.length} MINT COVER LANES`
          : "SOLID SHAPES  •  AMBER REVIEW  •  GLOW USE",
      panel.x + panel.width * 0.5,
      panel.y + panel.height - 4,
      8,
      cadenceForecast ||
        state.hole.crosswind.phase !==
          "calm" ||
        blindsideLaneState()
        ? "#9ed8b8"
        : "#9eaa88",
      "center",
      true,
    );
  }

  function drawCourseMiniMap() {
    const refreshInterval =
      runtimePerformance.tier === "low"
        ? 0.16
        : 0.12;
    if (
      state.hole.elapsed -
        miniMapRenderedAt >=
        refreshInterval ||
      state.hole.elapsed <
        miniMapRenderedAt
    ) {
      miniMapCtx.setTransform(
        1,
        0,
        0,
        1,
        0,
        0,
      );
      miniMapCtx.clearRect(
        0,
        0,
        COURSE_MAP_WIDTH,
        COURSE_MAP_HEIGHT,
      );
      miniMapCtx.save();
      miniMapCtx.translate(
        -COURSE_MAP_X,
        -COURSE_MAP_Y,
      );
      ctx = miniMapCtx;
      try {
        renderCourseMiniMap();
      } finally {
        ctx = mainCtx;
        miniMapCtx.restore();
      }
      miniMapRenderedAt =
        state.hole.elapsed;
    }
    ctx.drawImage(
      miniMapBuffer,
      COURSE_MAP_X,
      COURSE_MAP_Y,
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
        : "RUNNING";
    drawText(motionLabel, centerX, centerY + 68, 12, "#dfd29c", "center", true);
  }

  function drawMowerWorldParticles(
    layer,
  ) {
    const particles =
      state.hole.worldParticles;
    const quality =
      effectQualityScale();
    for (
      let index = 0;
      index < particles.length;
      index += 1
    ) {
      const particle =
        particles[index];
      if (
        particle.kind !==
          "mower_spark" &&
        (
          quality < 0.55
            ? index % 2 !== 0
            : quality < 0.85 &&
              index % 4 === 0
        )
      ) {
        continue;
      }
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
      } else if (
        effect.kind === "trail_cold"
      ) {
        ctx.strokeStyle =
          `rgba(151,207,159,${
            0.76 * alpha
          })`;
        ctx.lineWidth = Math.max(
          1,
          2.4 * scale,
        );
        ctx.setLineDash([
          7 * scale,
          6 * scale,
        ]);
        for (
          let ring = 0;
          ring < 3;
          ring += 1
        ) {
          const radius =
            (
              34 +
              ring * 14 +
              progress * 42
            ) *
            scale;
          ctx.beginPath();
          ctx.ellipse(
            point.x,
            point.y,
            radius,
            radius * 0.22,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.strokeStyle =
          `rgba(226,169,82,${
            0.68 * alpha
          })`;
        ctx.lineWidth = Math.max(
          1,
          2 * scale,
        );
        const split =
          (12 + progress * 19) *
          scale;
        ctx.beginPath();
        ctx.moveTo(
          point.x - split - 18 * scale,
          point.y - 2 * scale,
        );
        ctx.lineTo(
          point.x - split,
          point.y,
        );
        ctx.moveTo(
          point.x + split,
          point.y,
        );
        ctx.lineTo(
          point.x + split + 18 * scale,
          point.y - 2 * scale,
        );
        ctx.stroke();
      } else if (
        effect.kind === "cut_trace"
      ) {
        ctx.strokeStyle =
          `rgba(202,222,126,${
            0.78 * alpha
          })`;
        ctx.lineWidth = Math.max(
          1,
          2 * scale,
        );
        ctx.setLineDash([
          5 * scale,
          4 * scale,
        ]);
        for (
          let ring = 0;
          ring < 3;
          ring += 1
        ) {
          const radius =
            (
              12 +
              ring * 9 +
              progress * 25
            ) *
            scale;
          ctx.beginPath();
          ctx.ellipse(
            point.x,
            point.y,
            radius,
            radius * 0.25,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.fillStyle =
          `rgba(230,224,135,${
            0.86 * alpha
          })`;
        const lockSize =
          Math.max(
            2,
            4 * scale,
          );
        ctx.fillRect(
          point.x -
            lockSize * 0.5,
          point.y -
            lockSize * 0.5,
          lockSize,
          lockSize,
        );
      } else if (
        effect.kind ===
          "cadence_read"
      ) {
        ctx.strokeStyle =
          `rgba(121,215,181,${
            0.82 * alpha
          })`;
        ctx.lineWidth = Math.max(
          1,
          2.2 * scale,
        );
        ctx.setLineDash([
          7 * scale,
          5 * scale,
        ]);
        for (
          let ring = 0;
          ring < 3;
          ring += 1
        ) {
          const radius =
            (
              12 +
              ring * 10 +
              progress * 28
            ) *
            scale;
          ctx.beginPath();
          ctx.ellipse(
            point.x,
            point.y,
            radius,
            radius * 0.25,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.fillStyle =
          `rgba(184,238,216,${
            0.8 * alpha
          })`;
        const markerSize =
          Math.max(
            3,
            5 * scale,
          );
        polygon([
          [
            point.x,
            point.y -
              markerSize,
          ],
          [
            point.x +
              markerSize,
            point.y,
          ],
          [
            point.x,
            point.y +
              markerSize,
          ],
          [
            point.x -
              markerSize,
            point.y,
          ],
        ]);
      } else if (
        effect.kind ===
          "counter_route"
      ) {
        ctx.strokeStyle =
          `rgba(228,183,92,${
            0.82 * alpha
          })`;
        ctx.lineWidth = Math.max(
          1,
          2.3 * scale,
        );
        ctx.setLineDash([
          8 * scale,
          5 * scale,
        ]);
        for (
          let lane = 0;
          lane < 3;
          lane += 1
        ) {
          const spread =
            (
              18 +
              lane * 10 +
              progress * 34
            ) *
            scale;
          ctx.beginPath();
          ctx.moveTo(
            point.x - spread,
            point.y +
              lane *
                3 *
                scale,
          );
          ctx.lineTo(
            point.x + spread,
            point.y +
              lane *
                3 *
                scale,
          );
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.fillStyle =
          `rgba(203,224,128,${
            0.76 * alpha
          })`;
        const laneWidth =
          (
            7 +
            progress * 10
          ) *
          scale;
        polygon([
          [
            point.x -
              laneWidth,
            point.y -
              5 * scale,
          ],
          [
            point.x -
              laneWidth -
              11 * scale,
            point.y,
          ],
          [
            point.x -
              laneWidth,
            point.y +
              5 * scale,
          ],
        ]);
        polygon([
          [
            point.x +
              laneWidth,
            point.y -
              5 * scale,
          ],
          [
            point.x +
              laneWidth +
              11 * scale,
            point.y,
          ],
          [
            point.x +
              laneWidth,
            point.y +
              5 * scale,
          ],
        ]);
      } else if (
        effect.kind ===
          "blindside_open"
      ) {
        ctx.strokeStyle =
          `rgba(117,205,169,${
            0.72 * alpha
          })`;
        ctx.lineWidth = Math.max(
          1,
          2 * scale,
        );
        ctx.setLineDash([
          7 * scale,
          6 * scale,
        ]);
        const radius =
          (
            18 +
            progress * 42
          ) *
          scale;
        ctx.beginPath();
        ctx.ellipse(
          point.x,
          point.y,
          radius,
          radius * 0.22,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle =
          `rgba(202,240,220,${
            0.74 * alpha
          })`;
        polygon([
          [
            point.x -
              18 * scale,
            point.y -
              5 * scale,
          ],
          [
            point.x -
              30 * scale,
            point.y,
          ],
          [
            point.x -
              18 * scale,
            point.y +
              5 * scale,
          ],
        ]);
        polygon([
          [
            point.x +
              18 * scale,
            point.y -
              5 * scale,
          ],
          [
            point.x +
              30 * scale,
            point.y,
          ],
          [
            point.x +
              18 * scale,
            point.y +
              5 * scale,
          ],
        ]);
      } else if (
        effect.kind ===
          "blindside_transfer"
      ) {
        ctx.strokeStyle =
          `rgba(119,211,173,${
            0.82 * alpha
          })`;
        ctx.lineWidth = Math.max(
          1,
          2.4 * scale,
        );
        for (
          let ring = 0;
          ring < 3;
          ring += 1
        ) {
          const radius =
            (
              18 +
              ring * 12 +
              progress * 32
            ) *
            scale;
          ctx.beginPath();
          ctx.ellipse(
            point.x,
            point.y,
            radius,
            radius * 0.2,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
        ctx.fillStyle =
          `rgba(219,244,224,${
            0.8 * alpha
          })`;
        const lift =
          (
            10 +
            progress * 18
          ) *
          scale;
        for (
          let side = -1;
          side <= 1;
          side += 2
        ) {
          polygon([
            [
              point.x +
                side *
                  lift,
              point.y -
                7 * scale,
            ],
            [
              point.x +
                side *
                  (
                    lift +
                    12 * scale
                  ),
              point.y,
            ],
            [
              point.x +
                side *
                  lift,
              point.y +
                7 * scale,
            ],
          ]);
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
      } else if (
        effect.kind === "change_request" ||
        effect.kind === "emergency_appeal"
      ) {
        const emergencyAppeal =
          effect.kind ===
          "emergency_appeal";
        const rayCount =
          emergencyAppeal ? 14 : 10;
        ctx.strokeStyle =
          emergencyAppeal
            ? `rgba(249,165,78,${0.92 * alpha})`
            : `rgba(238,124,62,${0.82 * alpha})`;
        ctx.lineWidth = Math.max(
          1,
          2 * scale,
        );
        for (
          let ray = 0;
          ray < rayCount;
          ray += 1
        ) {
          const angle =
            ray / rayCount *
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
        if (emergencyAppeal) {
          const stampWidth =
            (82 - progress * 18) *
            scale;
          const stampHeight =
            30 * scale;
          ctx.strokeStyle =
            `rgba(226,91,45,${0.92 * alpha})`;
          ctx.lineWidth = Math.max(
            2,
            4 * scale,
          );
          ctx.strokeRect(
            point.x - stampWidth * 0.5,
            point.y -
              30 * scale -
              stampHeight * 0.5,
            stampWidth,
            stampHeight,
          );
          drawText(
            "APPEAL",
            point.x,
            point.y - 30 * scale,
            Math.max(
              8,
              12 * scale,
            ),
            `rgba(250,187,104,${alpha})`,
            "center",
            true,
          );
        }
      } else if (
        effect.kind ===
          "crosswind_run"
      ) {
        const runProgress =
          state.reducedMotion
            ? 0.46
            : progress;
        const direction =
          state.hole.crosswind
            .direction;
        ctx.strokeStyle =
          `rgba(152,220,179,${0.82 * alpha})`;
        ctx.lineWidth = Math.max(
          1,
          2.2 * scale,
        );
        for (
          let lane = 0;
          lane < 4;
          lane += 1
        ) {
          const spread =
            (
              22 +
              lane * 13 +
              runProgress * 46
            ) *
            scale;
          const y =
            point.y -
            lane * 4 * scale;
          ctx.beginPath();
          ctx.moveTo(
            point.x -
              direction *
                spread,
            y + 6 * scale,
          );
          ctx.quadraticCurveTo(
            point.x,
            y - 7 * scale,
            point.x +
              direction *
                spread,
            y,
          );
          ctx.stroke();
        }
        ctx.fillStyle =
          `rgba(211,235,171,${0.76 * alpha})`;
        const arrow =
          direction *
          (
            18 +
            runProgress * 20
          ) *
          scale;
        polygon([
          [
            point.x + arrow,
            point.y - 6 * scale,
          ],
          [
            point.x +
              arrow +
              direction *
                13 * scale,
            point.y,
          ],
          [
            point.x + arrow,
            point.y + 6 * scale,
          ],
        ]);
      } else if (
        effect.kind === "status_ack" ||
        effect.kind ===
          "status_escalation"
      ) {
        const escalated =
          effect.kind ===
          "status_escalation";
        const signalProgress =
          state.reducedMotion
            ? 0.48
            : progress;
        const signalColor = escalated
          ? "222,91,55"
          : "111,194,157";
        ctx.strokeStyle =
          `rgba(${signalColor},${0.84 * alpha})`;
        ctx.lineWidth = Math.max(
          1,
          (escalated ? 3 : 2) *
            scale,
        );
        for (
          let ring = 0;
          ring < (escalated ? 4 : 3);
          ring += 1
        ) {
          const radius =
            (
              10 +
              ring * 10 +
              signalProgress *
                (escalated ? 62 : 42)
            ) *
            scale;
          ctx.beginPath();
          ctx.ellipse(
            point.x,
            point.y,
            radius,
            radius * 0.25,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
        const bracketWidth =
          (28 +
            signalProgress * 38) *
          scale;
        const bracketHeight =
          (16 +
            signalProgress * 22) *
          scale;
        ctx.strokeRect(
          point.x - bracketWidth * 0.5,
          point.y -
            28 * scale -
            bracketHeight * 0.5,
          bracketWidth,
          bracketHeight,
        );
        if (escalated) {
          ctx.beginPath();
          ctx.moveTo(
            point.x -
              bracketWidth * 0.5,
            point.y - 28 * scale,
          );
          ctx.lineTo(
            point.x +
              bracketWidth * 0.5,
            point.y - 28 * scale,
          );
          ctx.moveTo(
            point.x,
            point.y -
              28 * scale -
              bracketHeight * 0.5,
          );
          ctx.lineTo(
            point.x,
            point.y -
              28 * scale +
              bracketHeight * 0.5,
          );
          ctx.stroke();
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

    const screenParticleStep =
      effectQualityScale() < 0.55
        ? 2
        : 1;
    for (
      let index = 0;
      index <
      hole.screenParticles.length;
      index += screenParticleStep
    ) {
      const particle =
        hole.screenParticles[index];
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
      const transformedTargetPoint =
        transformCourseScreenPoint(
          targetPoint,
        );
      const startX = WIDTH * 0.5;
      const startY = HEIGHT * 0.75;
      const targetX = clamp(
        transformedTargetPoint.x,
        492,
        WIDTH - 326,
      );
      const targetY = clamp(
        transformedTargetPoint.y,
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
    const transformedTargetPoint =
      transformCourseScreenPoint(
        targetPoint,
      );
    const targetX = clamp(
      transformedTargetPoint.x,
      492,
      WIDTH - 326,
    );
    const targetY = clamp(
      transformedTargetPoint.y,
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
    const practiceLocked =
      practiceShotLocked(target);
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

    ctx.strokeStyle = practiceLocked
      ? `rgba(116,232,186,${Math.min(1, pulse + 0.18)})`
      : `rgba(238,202,102,${pulse})`;
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
      practiceLocked
        ? "#74d9ad"
        : "#d09b48",
      2,
    );
    drawText(
      practiceLocked
        ? `FIELD TEST LOCKED  //  RELEASE AT ${actualDistance}m`
        : `CHIP SHOT  //  LANDING ${actualDistance}m`,
      WIDTH * 0.5,
      panel.y + 24,
      13,
      practiceLocked
        ? "#9ce9c3"
        : "#f0e4bd",
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
      practiceLocked
        ? "STARTER BELL LOCKED — RELEASE TO WATCH JOE DIVERT."
        : practiceDrillActive()
          ? "LAND INSIDE THE AMBER RING — JOE KEEPS MOVING."
          : "JOE KEEPS MOVING WHILE YOU LINE UP THE SHOT.",
      WIDTH * 0.5,
      panel.y + 91,
      10,
      practiceLocked
        ? "#74d9ad"
        : "#c27443",
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
    const horror =
      hole.horrorDirector;
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
    if (horror.intensity > 0.16) {
      const pulse =
        state.reducedMotion
          ? 0.82
          : 0.78 +
            Math.sin(
              state.time *
                (
                  0.8 +
                  horror.intensity * 0.7
                ),
            ) *
              0.12;
      const edgeAlpha =
        clamp(
          (horror.intensity - 0.16) *
            0.2 *
            pulse,
          0,
          0.16,
        );
      const dreadVignette =
        ctx.createRadialGradient(
          WIDTH * 0.5,
          HEIGHT * 0.48,
          Math.min(WIDTH, HEIGHT) *
            0.18,
          WIDTH * 0.5,
          HEIGHT * 0.48,
          Math.max(WIDTH, HEIGHT) *
            0.68,
        );
      dreadVignette.addColorStop(
        0,
        "rgba(0,3,2,0)",
      );
      dreadVignette.addColorStop(
        0.64,
        `rgba(1,5,3,${edgeAlpha * 0.24})`,
      );
      dreadVignette.addColorStop(
        1,
        `rgba(0,2,1,${edgeAlpha})`,
      );
      ctx.fillStyle = dreadVignette;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    if (horror.lightFailureSeconds > 0) {
      const power = floodlightPower();
      const failure = 1 - power;
      ctx.fillStyle =
        `rgba(0,6,7,${failure * 0.12})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle =
        `rgba(99,159,143,${failure * 0.12})`;
      ctx.lineWidth = 1;
      const scanCount =
        effectQualityScale() < 0.55
          ? 3
          : 6;
      for (
        let index = 0;
        index < scanCount;
        index += 1
      ) {
        const y =
          54 +
          hash(
            Math.floor(
              hole.elapsed * 17,
            ) +
              index * 43,
          ) *
            (HEIGHT - 108);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y + 1);
        ctx.stroke();
      }
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

    if (
      concealment > 0.62 &&
      !hole.riskAward &&
      !hole.deliveryAward
    ) {
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

    const nerve =
      hole.nerveHold;
    if (
      nerve &&
      (
        nerve.armed ||
        nerve.active
      ) &&
      !hole.riskAward &&
      !hole.deliveryAward
    ) {
      const progress = clamp(
        nerve.progress /
          NERVE_HOLD_SECONDS,
        0,
        1,
      );
      const interrupted =
        nerve.active &&
        nerve.interruption &&
        nerve.blockedReason?.endsWith(
          "_grace",
        );
      const pulse =
        state.reducedMotion
          ? 0
          : Math.sin(
              state.time * 7.4,
            ) *
            0.04 *
            (
              0.35 +
              progress * 0.65
            );
      const panelWidth = 326;
      const panelHeight = 58;
      const panelX =
        WIDTH * 0.5 -
        panelWidth * 0.5;
      const panelY =
        HEIGHT * 0.52 + 112;
      const color =
        interrupted
          ? "#e0a65d"
        : nerve.active
          ? "#9fd2aa"
          : "#d7bb72";
      ctx.save();
      ctx.globalAlpha =
        0.94 + pulse;
      ctx.fillStyle =
        "rgba(2,15,8,0.92)";
      ctx.fillRect(
        panelX,
        panelY,
        panelWidth,
        panelHeight,
      );
      strokeRect(
        panelX,
        panelY,
        panelWidth,
        panelHeight,
        color,
        nerve.active ? 2 : 1,
      );
      drawText(
        interrupted
          ? "SIGHTLINE SHIFT // HOLD"
        : nerve.active
          ? `HOLD YOUR NERVE // ${Math.round(progress * 100)}%`
          : inputCopy(
              `${keyboardBindingLabel("focus")} LISTEN // HOLD YOUR NERVE`,
              "LT LISTEN // HOLD YOUR NERVE",
              "LISTEN // HOLD YOUR NERVE",
            ),
        WIDTH * 0.5,
        panelY + 20,
        11,
        color,
        "center",
        true,
      );
      ctx.fillStyle = "#17271a";
      ctx.fillRect(
        panelX + 18,
        panelY + 29,
        panelWidth - 36,
        7,
      );
      ctx.fillStyle = color;
      ctx.fillRect(
        panelX + 18,
        panelY + 29,
        (
          panelWidth - 36
        ) * progress,
        7,
      );
      drawText(
        interrupted
          ? `GRACE ${nerve.graceRemaining.toFixed(2)}s // DO NOT MOVE`
          : `JOE ${Math.round(nerve.joeDistance)}m // ${hole.joe.mode.toUpperCase()} // STAY STILL`,
        WIDTH * 0.5,
        panelY + 49,
        9,
        "#b9c5aa",
        "center",
      );
      ctx.restore();
    }
  }

  function drawJoeStateBanner() {
    const hole = state.hole;
    if (
      hole.stateBannerTimer <= 0 ||
      !hole.stateBanner ||
      hole.riskAward ||
      hole.deliveryAward
    ) {
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

    ctx.fillStyle =
      "rgba(32,15,7,0.94)";
    ctx.fillRect(
      220,
      196,
      802,
      56,
    );
    strokeRect(
      220,
      196,
      802,
      56,
      "#8f5b32",
      2,
    );
    drawText(
      "5:47 PM // ONE LAST ACTION ITEM",
      WIDTH * 0.5,
      213,
      11,
      "#f0ad68",
      "center",
      true,
    );
    drawText(
      "YOU ARE JOE'S ASSOCIATE PRODUCT ANALYST. HE SENT YOU TO THE FAR-SIDE OFFICE WITH ONE LAST NIGHT ORDER.",
      WIDTH * 0.5,
      232,
      10,
      "#e7e0c7",
      "center",
    );
    drawText(
      "SOUTH GATE LOCKED. BOTH EXITS ARE AHEAD. CHANGE REQUESTS PROVE THE PILOT WAS UNSAFE.",
      WIDTH * 0.5,
      247,
      10,
      "#c99b6a",
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
        subdetail: `STAY STILL TO FILE  •  ◇ ${activeChangeRequest().code} +${CHANGE_REQUEST_BONUS} / CHASE APPEAL`,
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
      ctx.fillRect(card.x, 262, 242, 166);
      strokeRect(card.x, 262, 242, 166, "#50633e", 2);
      drawText(card.number, card.x + 22, 286, 17, "#d47431", "left", true);
      drawFieldIcon(card.icon, card.x + 121, 319, 78);
      drawText(card.title, card.x + 121, 374, 15, "#f0e8ce", "center", true);
      drawText(card.detail, card.x + 121, 398, 11, "#aebaa5", "center");
      if (card.subdetail) {
        drawText(
          card.subdetail,
          card.x + 121,
          415,
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

  function listeningSearchRead() {
    const hole = state.hole;
    const joe = hole?.joe;
    const trailCheck =
      hole?.trailTarget &&
      hole.trailApproachTimer > 0;
    const locus = trailCheck
      ? hole.trailTarget
      : hole?.lastSeenPlayer;
    const joeDistance = joe
      ? worldDistance(
          joe,
          state.player,
        )
      : Infinity;
    const active = Boolean(
      hole?.focus &&
      joe?.mode === "search" &&
      locus &&
      joeDistance <=
        LISTENING_SEARCH_READ_MAX_DISTANCE &&
      !hole.escapeFiling.active &&
      !hole.ballAim.active &&
      !hole.riskAward &&
      !hole.deliveryAward &&
      !hole.blindsideTransfer &&
      !hole.nerveHold?.armed &&
      !hole.nerveHold?.active &&
      !(
        hole.nerveHold?.exitWindow > 0
      ),
    );
    let trend = "unknown";
    let alignment = 0;
    if (joe) {
      const deltaX =
        (state.player.x - joe.x) *
        0.72;
      const deltaY =
        state.player.y - joe.y;
      const distance = Math.max(
        0.01,
        Math.hypot(
          deltaX,
          deltaY,
        ),
      );
      const headingX =
        Math.cos(
          joe.effectHeading,
        ) * 0.72;
      const headingY = Math.sin(
        joe.effectHeading,
      );
      const headingLength = Math.max(
        0.01,
        Math.hypot(
          headingX,
          headingY,
        ),
      );
      alignment =
        (
          headingX * deltaX +
          headingY * deltaY
        ) /
        (
          headingLength *
          distance
        );
      trend =
        joe.effectSpeed < 0.4
          ? "paused"
          : alignment > 0.28
            ? "closing"
            : alignment < -0.28
              ? "receding"
              : "crossing";
    }
    return {
      active,
      trend,
      alignment,
      joeDistance,
      secondsRemaining:
        hole?.searchTimer || 0,
      locus,
      locusKind: trailCheck
        ? "trail_check"
        : "last_signal",
      locusDistance: locus
        ? worldDistance(
            state.player,
            locus,
          )
        : null,
      maximumDistance:
        LISTENING_SEARCH_READ_MAX_DISTANCE,
    };
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
    const searchRead =
      listeningSearchRead();
    const cadence =
      state.hole.cadenceRead;

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
      searchRead.active
        ? `JOE ${direction} // ${Math.round(joeDistance)}m // ${searchRead.trend.toUpperCase()}`
        : `JOE ${direction}  •  ${Math.round(joeDistance)}m`,
      centerX,
      centerY + radius + 34,
      13,
      joeDistance < 45 ? "#ff9867" : "#e5cf8c",
      "center",
      true,
    );

    if (
      cadence.active ||
      cadence.armed ||
      cadence.forecast
    ) {
      const cadenceProgress =
        cadence.active
          ? clamp(
              cadence.progress /
                CADENCE_READ_SECONDS,
              0,
              1,
            )
          : cadence.forecast
            ? clamp(
                cadence.forecast.timer /
                  cadence.forecast.duration,
                0,
                1,
              )
            : 0;
      const cadenceColor =
        cadence.forecast
          ? "#8de2c1"
          : "#d8c879";
      ctx.strokeStyle =
        cadenceColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        radius + 17,
        -Math.PI * 0.5,
        -Math.PI * 0.5 +
          Math.PI * 2 *
            cadenceProgress,
      );
      ctx.stroke();
      drawText(
        cadence.active
          ? `READING MOWER CADENCE // ${Math.round(cadenceProgress * 100)}%`
          : cadence.forecast
            ? `ROUTE FORECAST // ${Math.ceil(cadence.forecast.timer)}s`
            : inputCopy(
                `CADENCE READY // HOLD ${keyboardBindingLabel("focus")}`,
                "CADENCE READY // HOLD LT",
                "CADENCE READY // HOLD LISTEN",
              ),
        centerX,
        centerY -
          radius -
          24,
        10,
        cadenceColor,
        "center",
        true,
      );
      if (cadence.forecast) {
        const targetDeltaX =
          cadence.forecast.target.x -
          state.player.x;
        const targetDeltaY =
          cadence.forecast.target.y -
          state.player.y;
        const targetAngle = Math.atan2(
          targetDeltaX * 0.72,
          -targetDeltaY,
        );
        const targetX =
          centerX +
          Math.sin(targetAngle) *
            (radius - 25);
        const targetY =
          centerY -
          Math.cos(targetAngle) *
            (radius - 25);
        ctx.fillStyle =
          cadenceColor;
        polygon([
          [targetX, targetY - 6],
          [targetX + 6, targetY],
          [targetX, targetY + 6],
          [targetX - 6, targetY],
        ]);
      }
    }

    if (searchRead.active) {
      const trendColor =
        searchRead.trend === "closing"
          ? "#ef7c4d"
          : searchRead.trend ===
                "receding"
            ? "#8fc99c"
            : searchRead.trend ===
                  "crossing"
              ? "#e0bc68"
              : "#b4b69a";
      ctx.strokeStyle = trendColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        radius + 9,
        angle -
          Math.PI * 0.5 -
          0.34,
        angle -
          Math.PI * 0.5 +
          0.34,
      );
      ctx.stroke();

      const projectedLocus =
        worldToScreen(
          searchRead.locus.x,
          searchRead.locus.y,
        );
      const locusPoint =
        transformCourseScreenPoint(
          projectedLocus,
        );
      const locusOnScreen =
        projectedLocus.visible &&
        locusPoint.x > 70 &&
        locusPoint.x < WIDTH - 330 &&
        locusPoint.y > 104 &&
        locusPoint.y < HEIGHT - 96;
      if (locusOnScreen) {
        const sweepPhase =
          state.reducedMotion
            ? 0.42
            : (
                state.time * 0.62
              ) % 1;
        const locusScale = clamp(
          projectedLocus.scale,
          0.62,
          1.35,
        );
        const sweepRadius =
          (
            20 +
            sweepPhase * 18
          ) *
          locusScale;
        ctx.strokeStyle =
          `rgba(224,188,104,${0.58 - sweepPhase * 0.28})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([7, 6]);
        ctx.beginPath();
        ctx.ellipse(
          locusPoint.x,
          locusPoint.y,
          sweepRadius,
          sweepRadius * 0.34,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle =
          "rgba(224,188,104,0.74)";
        ctx.fillRect(
          locusPoint.x - 2,
          locusPoint.y - 2,
          4,
          4,
        );
        drawText(
          `${searchRead.locusKind === "trail_check" ? "TRAIL CHECK" : "LAST TRACE"} // ${Math.round(searchRead.locusDistance)}m // ${Math.ceil(searchRead.secondsRemaining)}s`,
          locusPoint.x,
          locusPoint.y -
            sweepRadius * 0.48 -
            12,
          9,
          "#e5cd8c",
          "center",
          true,
        );
      }
    }

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
      !state.hole.appealUsed &&
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
    if (
      environment.recentJoeCut &&
      environment.recentJoeCutDistance <=
        JOE_CUT_CLUE_MAX_DISTANCE
    ) {
      const cut =
        environment.recentJoeCut;
      const cutFreshness =
        joeCutFreshness(cut);
      const cutColor =
        cutFreshness === "fresh"
          ? "#cde080"
          : cutFreshness === "warm"
            ? "#c9ae5f"
            : "#928d5b";
      const cutDeltaX =
        cut.x - state.player.x;
      const cutDeltaY =
        cut.y - state.player.y;
      const cutAngle = Math.atan2(
        cutDeltaX * 0.72,
        -cutDeltaY,
      );
      const cutRadius =
        radius - 54;
      const cutX =
        centerX +
        Math.sin(cutAngle) *
          cutRadius;
      const cutY =
        centerY -
        Math.cos(cutAngle) *
          cutRadius;
      const headingX =
        Math.cos(cut.heading);
      const headingY =
        -Math.sin(cut.heading) *
        0.55;
      const headingLength =
        Math.max(
          0.01,
          Math.hypot(
            headingX,
            headingY,
          ),
        );
      const directionX =
        headingX /
        headingLength;
      const directionY =
        headingY /
        headingLength;
      ctx.strokeStyle =
        cutColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(
        cutX -
          directionX * 11,
        cutY -
          directionY * 11,
      );
      ctx.lineTo(
        cutX +
          directionX * 11,
        cutY +
          directionY * 11,
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(
        cutX +
          directionX * 11,
        cutY +
          directionY * 11,
      );
      ctx.lineTo(
        cutX +
          directionX * 4 -
          directionY * 5,
        cutY +
          directionY * 4 +
          directionX * 5,
      );
      ctx.moveTo(
        cutX +
          directionX * 11,
        cutY +
          directionY * 11,
      );
      ctx.lineTo(
        cutX +
          directionX * 4 +
          directionY * 5,
        cutY +
          directionY * 4 -
          directionX * 5,
      );
      ctx.stroke();
      ctx.fillStyle =
        cutColor;
      ctx.fillRect(
        cutX - 2,
        cutY - 2,
        4,
        4,
      );
      const cutLogged =
        state.hole
          .cutTraceLoggedIds.includes(
            cut.id,
          );
      const traceProgress =
        cutLogged
          ? 1
          : state.hole
                .cutTraceCandidateId ===
              cut.id
            ? clamp(
                state.hole
                  .cutTraceProgress /
                  CUT_TRACE_SCAN_SECONDS,
                0,
                1,
              )
            : 0;
      if (!cutLogged) {
        ctx.strokeStyle =
          cutColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          cutX,
          cutY,
          16,
          -Math.PI * 0.5,
          -Math.PI * 0.5 +
            Math.PI *
              2 *
              traceProgress,
        );
        ctx.stroke();
      }
      drawText(
        `${cutFreshness.toUpperCase()} CUT ${Math.round(environment.recentJoeCutDistance)}m • ${Math.ceil(cut.age)}s • ${
          cutLogged
            ? "LOGGED"
            : `TRACE ${Math.round(traceProgress * 100)}%`
        }`,
        cutX,
        cutY +
          (
            cutY < centerY
              ? -16
              : 20
          ),
        9,
        cutColor,
        "center",
        true,
      );
    }
    ctx.restore();
  }

  function drawCadenceForecast() {
    const forecast =
      state.hole.cadenceRead
        ?.forecast;
    if (!forecast) {
      return;
    }
    const fade = clamp(
      Math.min(
        forecast.timer / 0.55,
        (
          forecast.duration -
          forecast.timer
        ) /
          0.22,
      ),
      0,
      1,
    );
    const pulse = state.reducedMotion
      ? 0.72
      : 0.66 +
        Math.sin(
          state.time * 4.2,
        ) *
          0.12;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.strokeStyle =
      `rgba(121,215,181,${pulse})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 7]);
    for (
      let index = 1;
      index < forecast.path.length;
      index += 1
    ) {
      const previous =
        worldToScreen(
          forecast.path[index - 1]
            .x,
          forecast.path[index - 1]
            .y,
        );
      const current = worldToScreen(
        forecast.path[index].x,
        forecast.path[index].y,
      );
      if (
        !previous.visible &&
        !current.visible
      ) {
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(
        previous.x,
        previous.y,
      );
      ctx.lineTo(
        current.x,
        current.y,
      );
      ctx.stroke();
    }
    ctx.setLineDash([]);
    const targetPoint =
      worldToScreen(
        forecast.target.x,
        forecast.target.y,
      );
    if (
      targetPoint.visible &&
      targetPoint.x > 68 &&
      targetPoint.x < WIDTH - 316
    ) {
      const scale = clamp(
        targetPoint.scale,
        0.58,
        1.55,
      );
      const ringPulse =
        state.reducedMotion
          ? 0
          : Math.sin(
              state.time * 4.2,
            ) *
            4 *
            scale;
      ctx.strokeStyle =
        "#79d7b5";
      ctx.lineWidth = Math.max(
        1,
        2.2 * scale,
      );
      ctx.beginPath();
      ctx.ellipse(
        targetPoint.x,
        targetPoint.y,
        18 * scale + ringPulse,
        6 * scale +
          ringPulse * 0.2,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.fillStyle =
        "rgba(121,215,181,0.88)";
      polygon([
        [
          targetPoint.x,
          targetPoint.y -
            9 * scale,
        ],
        [
          targetPoint.x +
            7 * scale,
          targetPoint.y,
        ],
        [
          targetPoint.x,
          targetPoint.y +
            9 * scale,
        ],
        [
          targetPoint.x -
            7 * scale,
          targetPoint.y,
        ],
      ]);
      drawText(
        `NEXT TURN // ${Math.ceil(forecast.timer)}s`,
        targetPoint.x,
        targetPoint.y -
          18 * scale,
        9,
        "#a8ead1",
        "center",
        true,
      );
    }
    ctx.restore();
  }

  function drawCadenceForecastCompass() {
    const forecast =
      state.hole.cadenceRead
        ?.forecast;
    if (
      !forecast ||
      state.hole.focus ||
      state.hole.riskAward ||
      state.hole.deliveryAward ||
      state.hole.joe.mode !==
        "patrol"
    ) {
      return;
    }
    const projected = worldToScreen(
      forecast.target.x,
      forecast.target.y,
    );
    const screenPoint =
      transformCourseScreenPoint(
        projected,
      );
    if (
      projected.visible &&
      screenPoint.x > 76 &&
      screenPoint.x < WIDTH - 316 &&
      screenPoint.y > 104 &&
      screenPoint.y < HEIGHT - 92
    ) {
      return;
    }
    const deltaX =
      forecast.target.x -
      state.player.x;
    const deltaY =
      forecast.target.y -
      state.player.y;
    const angle = Math.atan2(
      deltaX * 0.72,
      -deltaY,
    );
    const direction =
      directionFromPlayer(
        forecast.target,
      ) || "AHEAD";
    const centerX =
      WIDTH * 0.5;
    const centerY =
      HEIGHT * 0.5;
    const anchorX = clamp(
      centerX +
        Math.sin(angle) * 205,
      500,
      WIDTH - 360,
    );
    const anchorY = clamp(
      centerY -
        Math.cos(angle) * 112,
      224,
      HEIGHT - 158,
    );
    const fade = clamp(
      forecast.timer / 0.5,
      0,
      1,
    );
    const pulse = state.reducedMotion
      ? 0
      : Math.sin(
          state.time * 4.2,
        ) *
        2;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle =
      "rgba(3,12,8,0.82)";
    ctx.fillRect(
      anchorX - 94,
      anchorY - 16,
      188,
      32,
    );
    strokeRect(
      anchorX - 94,
      anchorY - 16,
      188,
      32,
      "#79d7b5",
      1,
    );
    ctx.fillStyle =
      "#8de2c1";
    polygon([
      [
        anchorX - 76,
        anchorY - 6 - pulse,
      ],
      [
        anchorX - 70 + pulse,
        anchorY,
      ],
      [
        anchorX - 76,
        anchorY + 6 + pulse,
      ],
      [
        anchorX - 82 - pulse,
        anchorY,
      ],
    ]);
    drawText(
      `JOE NEXT ${direction} // ${Math.round(worldDistance(state.player, forecast.target))}m`,
      anchorX + 10,
      anchorY + 4,
      9,
      "#b7ead5",
      "center",
      true,
    );
    ctx.restore();
  }

  function drawCutTraceMemory() {
    const hole = state.hole;
    const memory =
      hole.cutTraceMemory;
    if (
      hole.focus ||
      !memory ||
      memory.timer <= 0
    ) {
      return;
    }
    const point = worldToScreen(
      memory.x,
      memory.y,
    );
    if (
      !point.visible ||
      point.x < 70 ||
      point.x > WIDTH - 330
    ) {
      return;
    }
    const remaining =
      clamp(
        memory.timer /
          memory.duration,
        0,
        1,
      );
    const alpha =
      clamp(
        remaining / 0.22,
        0,
        1,
      );
    const color =
      memory.freshness === "fresh"
        ? "#cde080"
        : memory.freshness === "warm"
          ? "#c9ae5f"
          : "#928d5b";
    const pulse =
      state.reducedMotion
        ? 0
        : Math.sin(
            state.time * 5.5,
          ) *
          2;
    const headingX =
      Math.cos(memory.heading);
    const headingY =
      -Math.sin(
        memory.heading,
      ) *
      0.55;
    const headingLength =
      Math.max(
        0.01,
        Math.hypot(
          headingX,
          headingY,
        ),
      );
    const directionX =
      headingX /
      headingLength;
    const directionY =
      headingY /
      headingLength;
    const scale =
      clamp(
        point.scale,
        0.72,
        1.45,
      );
    ctx.save();
    ctx.globalAlpha =
      alpha *
      (
        0.62 +
        remaining * 0.3
      );
    ctx.strokeStyle =
      color;
    ctx.lineWidth = Math.max(
      1,
      2 * scale,
    );
    ctx.setLineDash([
      6 * scale,
      5 * scale,
    ]);
    ctx.beginPath();
    ctx.ellipse(
      point.x,
      point.y,
      (
        23 +
        pulse
      ) *
        scale,
      7 * scale,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(
      point.x -
        directionX *
          16 *
          scale,
      point.y -
        directionY *
          16 *
          scale,
    );
    ctx.lineTo(
      point.x +
        directionX *
          18 *
          scale,
      point.y +
        directionY *
          18 *
          scale,
    );
    ctx.stroke();
    const tipX =
      point.x +
      directionX *
        18 *
        scale;
    const tipY =
      point.y +
      directionY *
        18 *
        scale;
    ctx.fillStyle =
      color;
    polygon([
      [
        tipX,
        tipY,
      ],
      [
        tipX -
          directionX *
            8 *
            scale -
          directionY *
            5 *
            scale,
        tipY -
          directionY *
            8 *
            scale +
          directionX *
            5 *
            scale,
      ],
      [
        tipX -
          directionX *
            8 *
            scale +
          directionY *
            5 *
            scale,
        tipY -
          directionY *
            8 *
            scale -
          directionX *
            5 *
            scale,
      ],
    ]);
    const counterProgress =
      clamp(
        memory.counterDistance /
          COUNTER_ROUTE_DISTANCE,
        0,
        1,
      );
    const counterLength =
      (
        12 +
        counterProgress * 11
      ) *
      scale;
    ctx.strokeStyle =
      "#e4b75c";
    ctx.lineWidth = Math.max(
      1,
      1.6 * scale,
    );
    ctx.beginPath();
    ctx.moveTo(
      point.x,
      point.y,
    );
    ctx.lineTo(
      point.x -
        directionX *
          counterLength,
      point.y -
        directionY *
          counterLength,
    );
    ctx.stroke();
    ctx.fillStyle =
      "#e4b75c";
    ctx.beginPath();
    ctx.arc(
      point.x -
        directionX *
          counterLength,
      point.y -
        directionY *
          counterLength,
      Math.max(
        2,
        2.5 * scale,
      ),
      0,
      Math.PI * 2,
    );
    ctx.fill();
    drawText(
      memory.resolved
        ? "COUNTER-ROUTE // QUIET"
        : `CUT BACK ${Math.round(memory.counterDistance)}/${COUNTER_ROUTE_DISTANCE}m • ${Math.ceil(memory.timer)}s`,
      point.x,
      point.y -
        18 *
          scale,
      9,
      color,
      "center",
      true,
    );
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
    const joeDirection =
      directionFromPlayer(
        hole.joe,
      ) || "NEARBY";
    const appeal =
      emergencyAppealState();
    const panel = {
      x: WIDTH * 0.5 - 176,
      y: HEIGHT *
        (appeal.eligible
          ? 0.63
          : 0.67),
      width: 352,
      height:
        appeal.eligible ? 94 : 54,
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
      ? `CONTACT BREAK ${Math.round(progress * 100)}% • STAY QUIET // RISK +${riskPreview}`
      : visualContact
        ? `JOE ${joeDirection} • FIND SOLID COVER // RISK +${riskPreview}`
        : `COVER HELD • STILL AUDIBLE // RISK +${riskPreview}`;
    drawText(
      label,
      WIDTH * 0.5,
      panel.y + 22,
      11,
      breaking ? "#b8d6ad" : "#ffad78",
      "center",
      true,
    );
    if (appeal.eligible) {
      ctx.fillStyle =
        "rgba(71,29,10,0.72)";
      ctx.fillRect(
        panel.x + 2,
        panel.y + 52,
        panel.width - 4,
        40,
      );
      ctx.strokeStyle =
        "rgba(240,158,79,0.72)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(
        panel.x + 14,
        panel.y + 53,
      );
      ctx.lineTo(
        panel.x + panel.width - 14,
        panel.y + 53,
      );
      ctx.stroke();
      drawText(
        inputCopy(
          `${keyboardBindingLabel("interact")} — FILE EMERGENCY APPEAL`,
          "A — FILE EMERGENCY APPEAL",
          "TAP USE — FILE EMERGENCY APPEAL",
        ),
        WIDTH * 0.5,
        panel.y + 69,
        10,
        "#ffd08b",
        "center",
        true,
      );
      drawText(
        `${appeal.code} // FORFEIT +${appeal.forfeitedBonus} // REVIEW ${appeal.reviewSeconds.toFixed(1)}s`,
        WIDTH * 0.5,
        panel.y + 85,
        9,
        "#dba470",
        "center",
      );
    }
    ctx.restore();
  }

  function drawAppealReviewFeedback() {
    const hole = state.hole;
    const document =
      hole.appealDocument;
    if (
      !document ||
      hole.appealReviewTimer <= 0
    ) {
      return;
    }
    const progress = clamp(
      hole.appealReviewTimer /
        document.duration,
      0,
      1,
    );
    const panel = {
      x: WIDTH * 0.5 - 190,
      y: HEIGHT * 0.64,
      width: 380,
      height: 72,
    };
    const pulse = state.reducedMotion
      ? 0
      : Math.sin(
          hole.elapsed * 6.5,
        ) *
        0.08;
    ctx.save();
    ctx.fillStyle = "rgba(12,6,3,0.91)";
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
      `rgba(235,139,68,${0.82 + pulse})`,
      2,
    );
    drawText(
      `JOE REVIEWING ${document.code}  //  ${hole.appealReviewTimer.toFixed(1)}s`,
      WIDTH * 0.5,
      panel.y + 23,
      12,
      "#ffd193",
      "center",
      true,
    );
    ctx.fillStyle = "#28170e";
    ctx.fillRect(
      panel.x + 24,
      panel.y + 34,
      panel.width - 48,
      7,
    );
    ctx.fillStyle = "#e98645";
    ctx.fillRect(
      panel.x + 24,
      panel.y + 34,
      (panel.width - 48) *
        progress,
      7,
    );
    drawText(
      `EVIDENCE +${CHANGE_REQUEST_BONUS} FORFEITED  //  MOVE NOW`,
      WIDTH * 0.5,
      panel.y + 59,
      10,
      "#dfa36f",
      "center",
      true,
    );
    ctx.restore();
  }

  function drawStatusRequestFeedback() {
    const request =
      state.hole.statusRequest;
    if (!request.active) {
      return;
    }
    const deadlineProgress = clamp(
      request.timer /
        request.duration,
      0,
      1,
    );
    const responseProgress = clamp(
      request.responseProgress /
        request.responseDuration,
      0,
      1,
    );
    const urgent = request.timer < 2;
    const color = request.responding
      ? "#83c8aa"
      : urgent
        ? "#e36b45"
        : "#e4b35d";
    const pulse = state.reducedMotion
      ? 0
      : Math.sin(
          state.hole.elapsed *
            (urgent ? 8 : 4.5),
        ) *
        0.08;
    const panel = {
      x: WIDTH * 0.5 - 222,
      y: HEIGHT * 0.59,
      width: 444,
      height: 128,
    };
    ctx.save();
    ctx.fillStyle = "rgba(5,10,7,0.94)";
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
      color,
      2,
    );
    ctx.strokeStyle =
      `rgba(232,180,91,${0.45 + pulse})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(
      panel.x + 18,
      panel.y + 31,
    );
    ctx.lineTo(
      panel.x + panel.width - 18,
      panel.y + 31,
    );
    ctx.stroke();
    drawText(
      `JOE // ${request.code} — ${request.label}  ${request.timer.toFixed(1)}s`,
      WIDTH * 0.5,
      panel.y + 22,
      12,
      color,
      "center",
      true,
    );
    drawText(
      `“${request.joeLine || request.request}”`,
      WIDTH * 0.5,
      panel.y + 48,
      10,
      "#ded8bd",
      "center",
    );
    ctx.fillStyle = "#182119";
    ctx.fillRect(
      panel.x + 28,
      panel.y + 61,
      panel.width - 56,
      8,
    );
    ctx.fillStyle = color;
    ctx.fillRect(
      panel.x + 28,
      panel.y + 61,
      (panel.width - 56) *
        (
          request.responding
            ? responseProgress
            : deadlineProgress
        ),
      8,
    );
    drawText(
      request.responding
        ? `SUBMITTING ${Math.round(responseProgress * 100)}% // MOVEMENT CANCELS`
        : inputCopy(
            `${keyboardBindingLabel("interact")} — ACKNOWLEDGE // HOLD STILL ${request.responseDuration.toFixed(2)}s`,
            `A — ACKNOWLEDGE // HOLD STILL ${request.responseDuration.toFixed(2)}s`,
            `TAP USE — ACKNOWLEDGE // HOLD STILL ${request.responseDuration.toFixed(2)}s`,
          ),
      WIDTH * 0.5,
      panel.y + 88,
      11,
      request.responding
        ? "#a8dec4"
        : "#f0d69c",
      "center",
      true,
    );
    drawText(
      "ACKNOWLEDGE = ROUGH PING + DELIVERY  //  IGNORE = SECTOR SEARCH",
      WIDTH * 0.5,
      panel.y + 110,
      9,
      "#b6a47f",
      "center",
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
    if (
      !award ||
      state.hole.riskAward
    ) {
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
    const queuedAwards =
      state.hole
        .deliveryAwardQueue;
    const queuedAmount =
      queuedAwards.reduce(
        (
          total,
          queuedAward,
        ) =>
          total + queuedAward.amount,
        0,
      );
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
    if (queuedAwards.length > 0) {
      ctx.fillStyle =
        "rgba(4,20,12,0.96)";
      ctx.fillRect(
        centerX + 8,
        centerY - 47,
        134,
        14,
      );
      strokeRect(
        centerX + 8,
        centerY - 47,
        134,
        14,
        color,
        1,
      );
      drawText(
        `NEXT ${queuedAwards.length} // +${queuedAmount}`,
        centerX + 75,
        centerY - 37,
        8,
        color,
        "center",
        true,
      );
    }
    drawText(
      `${award.label}${award.mergedCount > 1 ? ` ×${award.mergedCount}` : ""} // DELIVERY ×${award.multiplier.toFixed(1)}`,
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
      hole.appealUsed
        ? "CR X APPEALED"
        : hole.changeRequestCollected
        ? emergencyAppealState().eligible
          ? "CR ! APPEAL READY"
          : `CR ✓ +${CHANGE_REQUEST_BONUS}`
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
    const windStatus =
      hole.crosswind.phase === "active"
        ? `  •  WIND ${Math.ceil(hole.crosswind.timer)}s`
        : hole.crosswind.phase === "warning"
          ? "  •  WIND BUILDING"
          : "";
    const reviewStatus =
      `  •  REVIEWS ${hole.reviewsCleared.length}/${activeSprintReviews().length}`;
    const terrainStatus =
      expandedHud
        ? `${environment.zone.name}  •  ${environment.turfLabel}${waterStatus}${windStatus}${reviewStatus}  •  ORDER ${String(variant.number).padStart(2, "0")}${masteryStatus ? `  •  ${masteryStatus}` : ""}`
        : `${environment.turfLabel}  •  ${environment.coverQuality.toUpperCase()}${waterStatus}${windStatus}`;
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
        hole.appealUsed
          ? "#b98062"
          : hole.changeRequestCollected
          ? emergencyAppealState().eligible
            ? "#f2bd67"
            : "#8fc58b"
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
        hole.appealUsed
          ? "#b98062"
          : hole.changeRequestCollected
          ? emergencyAppealState().eligible
            ? "#f2bd67"
            : "#8fc58b"
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
    const blindsideReady =
      !hole.blindsideTransfer &&
      blindsideWindowEligible(
        blindsideShelterState(
          environment,
        ),
      );
    const blindsidePrimary =
      hole.blindsidePreview
        ?.options?.[0] ||
      hole.blindsideTransfer
        ?.destinations?.[0];
    const directorWarning =
      hole.tensionDirector
        .pendingIntercept;
    const crosswindVisible =
      hole.crosswind.phase !==
      "calm";
    const searchRead =
      listeningSearchRead();
    const cadence =
      hole.cadenceRead;
    const attentionStatus =
      hole.joe.mode === "chase"
        ? "PURSUIT LOCK"
        : directorWarning
          ? `SERVICE GATE // ${directorWarning.seconds.toFixed(1)}s`
        : hole.nerveHold?.active
          ? `NERVE CHECK // ${Math.round(hole.nerveHold.progress / NERVE_HOLD_SECONDS * 100)}%`
        : hole.nerveHold?.armed
          ? inputCopy(
              `NERVE READY // ${keyboardBindingLabel("focus")} LISTEN`,
              "NERVE READY // LT LISTEN",
              "NERVE READY // LISTEN",
            )
        : hole.nerveHold
              ?.exitWindow > 0
          ? `EXIT WINDOW // ${hole.nerveHold.exitWindow.toFixed(1)}s`
        : hole.joe.mode ===
              "search"
          ? searchRead.active
            ? `SEARCH ${searchRead.trend.toUpperCase()} // ${Math.ceil(searchRead.secondsRemaining)}s`
            : "SEARCHING LAST SIGNAL"
        : hole.joe.mode ===
              "investigate"
          ? "VERIFYING DISTURBANCE"
        : cadence.active
          ? `CADENCE READ // ${Math.round(cadence.progress / CADENCE_READ_SECONDS * 100)}%`
        : cadence.forecast
          ? `ROUTE FORECAST // ${cadence.forecast.timer.toFixed(1)}s`
        : cadence.armed
          ? inputCopy(
              `CADENCE READY // ${keyboardBindingLabel("focus")} LISTEN`,
              "CADENCE READY // LT LISTEN",
              "CADENCE READY // LISTEN",
            )
        : hole.crosswind.phase ===
            "active"
          ? `WIND ${Math.round(hole.crosswind.currentDistance)}/${CROSSWIND_RUN_DISTANCE}m // ${hole.crosswind.timer.toFixed(1)}s`
        : hole.crosswind.phase ===
            "warning"
          ? `CROSSWIND // ${hole.crosswind.timer.toFixed(1)}s`
        : hole.blindsideTransfer
          ? `BLINDSIDE // ${hole.blindsideTransfer.timer.toFixed(1)}s`
        : hole.trailColdTimer > 0
          ? "TRAIL COLD // MOVE"
        : hole.counterRouteQuietTimer >
            0
          ? `QUIET LANE // ${hole.counterRouteQuietTimer.toFixed(1)}s`
        : blindsideReady
          ? blindsidePrimary
            ? blindsidePrimary
                .requiresCrouch
              ? inputCopy(
                  `BLINDSIDE // ${keyboardBindingLabel("crouch")} ROUGH ${blindsideLaneDirection(blindsidePrimary)} ${Math.ceil(blindsidePrimary.distance)}m`,
                  `BLINDSIDE // LB ROUGH ${blindsideLaneDirection(blindsidePrimary)} ${Math.ceil(blindsidePrimary.distance)}m`,
                  `BLINDSIDE // ROUGH ${blindsideLaneDirection(blindsidePrimary)} ${Math.ceil(blindsidePrimary.distance)}m`,
                )
              : `BLINDSIDE // ${blindsideLaneDirection(blindsidePrimary)} ${Math.ceil(blindsidePrimary.distance)}m`
            : "BLINDSIDE READY // MOVE"
        : hole.detectionSource === "sight"
          ? "SIGHTLINE BUILDING"
          : hole.detectionSource === "sound"
            ? "NOISE DETECTED"
            : hole.detectionSource === "trail"
              ? "TRAIL EVIDENCE FOUND"
            : environment.blocker
              ? "SIGHTLINE BLOCKED"
              : hole.tensionDirector
                    .pressure > 0.52
                ? "MOWER ROUTE SHIFTING"
                : "UNAWARE";
    drawText(
      attentionStatus,
      meterX + 18,
      119,
      11,
      attention > 0.68
        ? "#ff7045"
        : crosswindVisible
          ? "#9ed8b8"
        : attention > 0.2 ||
            directorWarning
          ? "#e8a55d"
          : "#9db293",
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

  function groundFogState() {
    const zone =
      courseZoneAt(state.player.y);
    const zoneSettings = {
      tee: {
        density: 0.98,
        light: "163,181,164",
        shadow: "91,123,109",
      },
      audit_row: {
        density: 1.06,
        light: "158,178,158",
        shadow: "86,117,101",
      },
      water_hazard: {
        density: 1.3,
        light: "154,184,181",
        shadow: "67,117,121",
      },
      clubhouse_crossing: {
        density: 1.02,
        light: "181,177,153",
        shadow: "113,111,91",
      },
      maintenance_maze: {
        density: 1.14,
        light: "157,174,151",
        shadow: "83,110,94",
      },
      dead_green: {
        density: 1.36,
        light: "183,169,145",
        shadow: "119,91,73",
      },
      night_range: {
        density: 1.24,
        light: "150,178,185",
        shadow: "70,106,122",
      },
      release_corridor: {
        density: 1.32,
        light: "184,163,143",
        shadow: "116,80,69",
      },
    };
    const settings =
      zoneSettings[zone.id] ||
      zoneSettings.tee;
    const pressure =
      threatAtmosphereState()
        .pressure;
    const horror =
      state.hole.horrorDirector;
    const surge = horror
      ? clamp(
          horror.fogSurgeSeconds / 1.15,
          0,
          1,
        )
      : 0;
    const density =
      clamp(
        settings.density +
          pressure * 0.2 +
          surge * 0.28,
        0.94,
        1.68,
      );
    const quality =
      effectQualityScale();
    return {
      zone: zone.id,
      density,
      surge,
      light: settings.light,
      shadow: settings.shadow,
      visibleLayers:
        quality < 0.55
          ? 3
          : quality < 0.85
            ? 4
            : 5,
      motion:
        state.reducedMotion
          ? "static"
          : surge > 0.05
            ? "pressure_surge"
            : "slow_drift",
    };
  }

  function drawGroundFog(
    progress,
    walkBob,
  ) {
    const quality =
      effectQualityScale();
    const fogState =
      groundFogState();
    ctx.save();
    ctx.globalCompositeOperation =
      "screen";
    for (
      let layer = 0;
      layer < 5;
      layer += 1
    ) {
      if (
        (
          quality < 0.55 &&
          layer % 2 === 1
        ) ||
        (
          quality < 0.85 &&
          quality >= 0.55 &&
          layer === 1
        )
      ) {
        continue;
      }
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
              ) +
            fogState.surge *
              Math.sin(
                state.hole.elapsed * 2.4 +
                  layer * 1.13,
              ) *
              (38 + depth * 44) +
            crosswindStrength() *
              state.hole.crosswind.direction *
              (
                state.reducedMotion
                  ? 18 + depth * 14
                  : 42 + depth * 56
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
        `rgba(${fogState.light},${(0.092 + layer * 0.017) * fogState.density})`,
      );
      fog.addColorStop(
        0.7,
        `rgba(${fogState.shadow},${(0.06 + layer * 0.012) * fogState.density})`,
      );
      fog.addColorStop(
        1,
        `rgba(${fogState.shadow},0)`,
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
        wisp <
        (
          quality < 0.55
            ? 2
            : quality < 0.85
              ? 3
              : 4
        );
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
          16 +
          depth * 20 +
          hash(seed + 17) *
            12;
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
        const mist =
          ctx.createRadialGradient(
            0,
            0,
            0,
            0,
            0,
            radiusX,
          );
        mist.addColorStop(
          0,
          `rgba(${fogState.light},${(0.115 + depth * 0.065) * fogState.density})`,
        );
        mist.addColorStop(
          0.52,
          `rgba(${fogState.shadow},${(0.055 + depth * 0.04) * fogState.density})`,
        );
        mist.addColorStop(
          1,
          `rgba(${fogState.light},0)`,
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
    ctx.restore();
  }

  function drawCrosswindWeather(
    progress,
    walkBob,
  ) {
    const wind =
      state.hole.crosswind;
    const strength =
      crosswindStrength();
    if (strength <= 0.01) {
      return;
    }
    const direction =
      wind.direction;
    const motionTime =
      state.reducedMotion
        ? 0
        : state.hole.elapsed;
    const quality =
      effectQualityScale();
    const ribbonCount =
      quality < 0.55
        ? 4
        : quality < 0.85
          ? 6
          : 8;
    const fleckCount =
      state.reducedMotion
        ? 7
        : quality < 0.55
          ? 10
          : quality < 0.85
            ? 16
            : 22;
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      24,
      116,
      WIDTH - 48,
      HEIGHT - 150,
    );
    ctx.clip();
    ctx.globalCompositeOperation =
      "screen";
    for (
      let band = 0;
      band < ribbonCount;
      band += 1
    ) {
      const seed =
        hash(
          band * 71 +
            wind.eventCount * 43,
        );
      const span =
        WIDTH + 520;
      const sweep =
        state.reducedMotion
          ? seed * span
          : (
              motionTime *
                (
                  150 +
                  seed * 120
                ) +
              seed * span
            ) % span;
      const x =
        direction > 0
          ? -260 + sweep
          : WIDTH + 260 - sweep;
      const y =
        238 +
        band *
          (
            36 +
            progress * 7
          ) +
        hash(band * 29 + 11) *
          28 +
        walkBob * 0.04;
      const reach =
        direction *
        (
          130 +
          seed * 150
        );
      ctx.strokeStyle =
        `rgba(183,210,188,${strength * (0.045 + seed * 0.045)})`;
      ctx.lineWidth =
        1 + seed * 1.4;
      ctx.beginPath();
      ctx.moveTo(
        x - reach * 0.34,
        y + 8,
      );
      ctx.quadraticCurveTo(
        x,
        y - 7,
        x + reach,
        y,
      );
      ctx.stroke();
    }
    ctx.globalCompositeOperation =
      "source-over";
    for (
      let index = 0;
      index < fleckCount;
      index += 1
    ) {
      const seed = hash(
        index * 53 +
          wind.eventCount * 97,
      );
      const span =
        WIDTH + 280;
      const sweep =
        state.reducedMotion
          ? seed * span
          : (
              motionTime *
                (
                  210 +
                  seed * 170
                ) +
              seed * span
            ) % span;
      const x =
        direction > 0
          ? -140 + sweep
          : WIDTH + 140 - sweep;
      const y =
        250 +
        hash(index * 31 + 5) *
          390;
      const size =
        2 + seed * 3;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(
        direction *
          (
            0.28 +
            seed * 0.34
          ),
      );
      ctx.globalAlpha =
        strength *
        (
          0.26 +
          seed * 0.34
        );
      ctx.fillStyle =
        index % 4 === 0
          ? "#bbc89a"
          : index % 3 === 0
            ? "#6f845a"
            : "#8fa278";
      ctx.fillRect(
        -size * 1.8,
        -1,
        size * 3.6,
        Math.max(1, size * 0.55),
      );
      ctx.restore();
    }
    ctx.strokeStyle =
      `rgba(116,145,91,${strength * 0.2})`;
    ctx.lineWidth = 1.5;
    for (
      let blade = 0;
      blade < 30;
      blade += 1
    ) {
      const seed = hash(
        blade * 37 + 19,
      );
      const x =
        34 +
        blade / 29 *
          (WIDTH - 68);
      const baseY =
        438 +
        hash(blade * 43 + 7) *
          250;
      const height =
        13 + seed * 26;
      const lean =
        direction *
        strength *
        (
          8 +
          seed * 17
        );
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.quadraticCurveTo(
        x + lean * 0.38,
        baseY - height * 0.58,
        x + lean,
        baseY - height,
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  function threatAtmosphereState() {
    if (renderFrameCache.threat) {
      return renderFrameCache.threat;
    }
    if (!state.hole) {
      return {
        distance: Infinity,
        proximity: 0,
        pressure: 0,
        direction: 0,
      };
    }
    const hole = state.hole;
    const distance =
      worldDistance(
        hole.joe,
        state.player,
      );
    const proximity =
      clamp(
        1 - distance / 138,
        0,
        1,
      );
    const chase =
      hole.joe.mode === "chase"
        ? 1
        : 0;
    const pressure =
      clamp(
        proximity * 0.5 +
          hole.detection * 0.34 +
          chase * 0.24,
        0,
        1,
      );
    renderFrameCache.threat = {
      distance,
      proximity,
      pressure,
      direction:
        clamp(
          (
            hole.joe.x -
            state.player.x
          ) /
            64,
          -1,
          1,
        ),
    };
    return renderFrameCache.threat;
  }

  const SPECTRAL_COURSE_FIGURES = [
    { x: -101, y: 151, lean: -1 },
    { x: 103, y: 331, lean: 1 },
    { x: -104, y: 507, lean: -1 },
    { x: 101, y: 611, lean: 1 },
    { x: -98, y: 682, lean: -1 },
  ];

  function drawSpectralCourseFigures() {
    const figures =
      SPECTRAL_COURSE_FIGURES;
    const threat =
      threatAtmosphereState();
    for (
      let index = 0;
      index < figures.length;
      index += 1
    ) {
      const figure =
        figures[index];
      const distance =
        worldDistance(
          state.player,
          figure,
        );
      if (
        distance < 34 ||
        distance > 126
      ) {
        continue;
      }
      const point =
        worldToScreen(
          figure.x,
          figure.y,
        );
      if (
        !point.visible ||
        point.x < -90 ||
        point.x > WIDTH + 90
      ) {
        continue;
      }
      const distanceFade =
        smoothstep(
          clamp(
            (distance - 34) / 20,
            0,
            1,
          ),
        ) *
        (
          1 -
          smoothstep(
            clamp(
              (distance - 96) /
                30,
              0,
              1,
            ),
          )
        );
      const phase =
        state.reducedMotion
          ? 0.66
          : 0.5 +
            Math.sin(
              state.hole.elapsed *
                0.53 +
                index * 2.17,
            ) *
              0.5;
      const presence =
        clamp(
          (
            phase - 0.24
          ) /
            0.76,
          0,
          1,
        );
      const alpha =
        distanceFade *
        presence *
        (
          state.reducedMotion
            ? 0.1
            : 0.08 +
              threat.pressure *
                0.08
        );
      if (alpha < 0.012) {
        continue;
      }
      const height =
        clamp(
          3.6 *
            point.pixelsPerMeter,
          24,
          172,
        );
      const width =
        height * 0.22;
      const headTurn =
        clamp(
          (
            state.player.x -
            figure.x
          ) /
            80,
          -1,
          1,
        );
      ctx.save();
      ctx.globalCompositeOperation =
        "screen";
      const groundMist =
        ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          width * 2.8,
        );
      groundMist.addColorStop(
        0,
        `rgba(126,161,145,${
          alpha * 0.52
        })`,
      );
      groundMist.addColorStop(
        1,
        "rgba(126,161,145,0)",
      );
      ctx.fillStyle =
        groundMist;
      ctx.beginPath();
      ctx.ellipse(
        point.x,
        point.y,
        width * 2.8,
        Math.max(
          3,
          width * 0.42,
        ),
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      const body =
        ctx.createLinearGradient(
          0,
          point.y - height,
          0,
          point.y,
        );
      body.addColorStop(
        0,
        `rgba(191,211,192,${
          alpha * 0.72
        })`,
      );
      body.addColorStop(
        0.48,
        `rgba(92,132,117,${
          alpha
        })`,
      );
      body.addColorStop(
        1,
        "rgba(61,92,78,0)",
      );
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(
        point.x -
          width * 0.62,
        point.y - height * 0.72,
      );
      ctx.lineTo(
        point.x +
          width * 0.54,
        point.y - height * 0.72,
      );
      ctx.lineTo(
        point.x +
          width *
            (
              0.88 +
              figure.lean * 0.08
            ),
        point.y - height * 0.08,
      );
      ctx.lineTo(
        point.x -
          width *
            (
              0.74 -
              figure.lean * 0.08
            ),
        point.y - height * 0.08,
      );
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle =
        `rgba(188,207,191,${
          alpha * 0.9
        })`;
      ctx.beginPath();
      ctx.ellipse(
        point.x +
          headTurn *
            width *
            0.24,
        point.y - height * 0.84,
        width * 0.42,
        height * 0.1,
        headTurn * 0.18,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      const dissolveCount =
        effectQualityScale() < 0.55
          ? 3
          : effectQualityScale() < 0.85
            ? 5
            : 7;
      ctx.fillStyle =
        `rgba(179,210,190,${
          alpha * 0.66
        })`;
      for (
        let mote = 0;
        mote < dissolveCount;
        mote += 1
      ) {
        const seed =
          hash(
            index * 71 +
              mote * 37,
          );
        const drift =
          state.reducedMotion
            ? 0
            : Math.sin(
                state.hole.elapsed *
                  0.8 +
                  mote,
              ) *
              width *
              0.32;
        ctx.fillRect(
          point.x +
            (
              seed - 0.5
            ) *
              width *
              2 +
            drift,
          point.y -
            height *
              (
                0.12 +
                hash(
                  mote * 53 +
                    index,
                ) *
                  0.72
              ),
          Math.max(
            1,
            point.scale * 2,
          ),
          Math.max(
            1,
            point.scale * 3,
          ),
        );
      }
      ctx.restore();
    }
  }

  function drawPeripheralHorrorManifestation() {
    const manifestation =
      state.hole.horrorDirector
        .manifestation;
    if (
      !manifestation ||
      manifestation.type !==
        "peripheral_groundskeeper"
    ) {
      return;
    }
    const progress = clamp(
      1 -
        manifestation.seconds /
          manifestation.duration,
      0,
      1,
    );
    const fadeIn = smoothstep(
      clamp(progress / 0.16, 0, 1),
    );
    const fadeOut = smoothstep(
      clamp(
        manifestation.seconds / 0.38,
        0,
        1,
      ),
    );
    const flicker =
      state.reducedMotion
        ? 0.82
        : 0.58 +
          hash(
            Math.floor(
              state.hole.elapsed * 24,
            ) +
              manifestation.seed,
          ) *
            0.42;
    const alpha =
      fadeIn * fadeOut * flicker;
    if (alpha <= 0.015) {
      return;
    }
    const side = manifestation.side;
    const baseX =
      side < 0
        ? 72
        : WIDTH - 344;
    const baseY =
      HEIGHT * manifestation.height;
    const jitter =
      state.reducedMotion
        ? 0
        : (
            hash(
              Math.floor(
                state.hole.elapsed * 18,
              ) +
                manifestation.seed * 3,
            ) - 0.5
          ) *
          5;
    ctx.save();
    ctx.globalAlpha = alpha;
    const edgeMist =
      ctx.createLinearGradient(
        side < 0 ? 0 : WIDTH,
        0,
        side < 0 ? 190 : WIDTH - 190,
        0,
      );
    edgeMist.addColorStop(
      0,
      "rgba(3,8,6,0.74)",
    );
    edgeMist.addColorStop(
      1,
      "rgba(26,48,35,0)",
    );
    ctx.fillStyle = edgeMist;
    ctx.fillRect(
      side < 0 ? 0 : WIDTH - 190,
      baseY - 176,
      190,
      226,
    );
    ctx.translate(
      baseX + jitter,
      baseY,
    );
    ctx.scale(side, 1);
    if (!state.reducedMotion) {
      ctx.globalAlpha = alpha * 0.2;
      ctx.fillStyle = "#7b1c17";
      ctx.fillRect(-32, -123, 44, 84);
      ctx.fillStyle = "#4e9b86";
      ctx.fillRect(-26, -121, 44, 82);
    }
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#030705";
    ctx.fillRect(-27, -126, 42, 74);
    ctx.fillRect(-23, -60, 13, 56);
    ctx.fillRect(3, -60, 13, 56);
    ctx.fillRect(-19, -157, 28, 31);
    ctx.fillRect(-14, -164, 19, 9);
    ctx.fillStyle = "#101a13";
    ctx.fillRect(-22, -122, 32, 5);
    ctx.fillRect(-15, -145, 19, 4);
    ctx.fillStyle = `rgba(184,205,174,${alpha * 0.74})`;
    ctx.fillRect(-11, -149, 4, 3);
    ctx.fillRect(-1, -149, 4, 3);
    ctx.strokeStyle = `rgba(3,6,4,${alpha})`;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(10, -105);
    ctx.lineTo(48, -64);
    ctx.lineTo(58, -25);
    ctx.stroke();
    ctx.fillStyle = "#020504";
    ctx.fillRect(28, -27, 58, 21);
    ctx.fillRect(39, -35, 36, 10);
    ctx.fillRect(32, -8, 10, 10);
    ctx.fillRect(73, -8, 10, 10);
    ctx.strokeStyle = `rgba(96,128,101,${alpha * 0.48})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(28, -27, 58, 21);
    const clippingCount =
      effectQualityScale() < 0.55
        ? 5
        : 10;
    ctx.fillStyle = `rgba(58,83,50,${alpha * 0.68})`;
    for (
      let index = 0;
      index < clippingCount;
      index += 1
    ) {
      const seed = hash(
        manifestation.seed + index * 31,
      );
      ctx.fillRect(
        62 + seed * 74,
        -20 -
          hash(
            manifestation.seed +
              index * 47,
          ) *
            42,
        2 + Math.round(seed * 3),
        2,
      );
    }
    ctx.restore();
  }

  function drawMowerThreatRipples() {
    const threat =
      threatAtmosphereState();
    if (
      threat.distance > 146 ||
      threat.pressure < 0.08
    ) {
      return;
    }
    const joe =
      state.hole.joe;
    const quality =
      effectQualityScale();
    const ringCount =
      quality < 0.55
        ? 1
        : quality < 0.85
          ? 2
          : 3;
    const rippleSamples =
      quality < 0.55
        ? 14
        : quality < 0.85
          ? 20
          : 34;
    ctx.save();
    ctx.lineCap = "round";
    for (
      let ring = 0;
      ring < ringCount;
      ring += 1
    ) {
      const phase =
        state.reducedMotion
          ? 0.42
          : (
              state.hole.elapsed *
                (
                  0.64 +
                  threat.pressure *
                    0.28
                ) +
              ring /
                ringCount
            ) %
            1;
      const radius =
        4 +
        phase *
          (
            18 +
            threat.pressure * 10
          );
      const alpha =
        (
          1 -
          smoothstep(phase)
        ) *
        threat.pressure *
        (
          state.reducedMotion
            ? 0.12
            : 0.26
        );
      ctx.strokeStyle =
        `rgba(181,178,91,${alpha})`;
      ctx.lineWidth =
        0.8 +
        (
          1 - phase
        ) *
          1.6;
      ctx.beginPath();
      let drawing = false;
      for (
        let sample = 0;
        sample <= rippleSamples;
        sample += 1
      ) {
        const angle =
          sample /
          rippleSamples *
          Math.PI *
          2;
        const ripplePoint =
          worldToScreen(
            joe.x +
              Math.cos(
                angle,
              ) *
                radius,
            joe.y +
              Math.sin(
                angle,
              ) *
                radius *
                0.58,
          );
        if (
          ripplePoint.visible &&
          ripplePoint.x > -80 &&
          ripplePoint.x <
            WIDTH + 80
        ) {
          if (!drawing) {
            ctx.moveTo(
              ripplePoint.x,
              ripplePoint.y,
            );
            drawing = true;
          } else {
            ctx.lineTo(
              ripplePoint.x,
              ripplePoint.y,
            );
          }
        } else {
          drawing = false;
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFloodlightAtmosphere() {
    const lights =
      COURSE_FLOODLIGHTS;
    const quality =
      effectQualityScale();
    for (
      let index = 0;
      index < lights.length;
      index += 1
    ) {
      const lightEntry =
        lights[index];
      const light =
        lightEntry.obstacle;
      const point =
        worldToScreen(
          light.x,
          light.y,
        );
      if (
        !point.visible ||
        point.x < -220 ||
        point.x > WIDTH + 220
      ) {
        continue;
      }
      const power =
        floodlightPowerAt(
          light,
          lightEntry.obstacleIndex,
        );
      const bulbY =
        point.y -
        clamp(
          4.7 *
            point.pixelsPerMeter,
          48,
          230,
        );
      const beamWidth =
        clamp(
          light.lightRadius *
            point.scale *
            2.35,
          46,
          310,
        );
      ctx.save();
      ctx.globalCompositeOperation =
        "screen";
      const beam =
        ctx.createLinearGradient(
          point.x,
          bulbY,
          point.x,
          point.y + 20,
        );
      beam.addColorStop(
        0,
        `rgba(255,205,118,${
          0.12 * power
        })`,
      );
      beam.addColorStop(
        0.58,
        `rgba(210,156,79,${
          0.052 * power
        })`,
      );
      beam.addColorStop(
        1,
        "rgba(177,122,55,0)",
      );
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(
        point.x - 4,
        bulbY,
      );
      ctx.lineTo(
        point.x -
          beamWidth,
        point.y + 24,
      );
      ctx.lineTo(
        point.x +
          beamWidth,
        point.y + 24,
      );
      ctx.lineTo(
        point.x + 4,
        bulbY,
      );
      ctx.closePath();
      ctx.fill();
      if (quality >= 0.55) {
        const groundGlow =
          ctx.createRadialGradient(
            point.x,
            point.y + 4,
            0,
            point.x,
            point.y + 4,
            beamWidth,
          );
        groundGlow.addColorStop(
          0,
          `rgba(236,183,94,${
            0.08 * power
          })`,
        );
        groundGlow.addColorStop(
          1,
          "rgba(236,183,94,0)",
        );
        ctx.fillStyle =
          groundGlow;
        ctx.beginPath();
        ctx.ellipse(
          point.x,
          point.y + 4,
          beamWidth,
          Math.max(
            8,
            beamWidth * 0.2,
          ),
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      if (
        light.id.startsWith(
          "range-light",
        )
      ) {
        const mothCount =
          quality < 0.55
            ? 3
            : quality < 0.85
              ? 6
              : 9;
        for (
          let moth = 0;
          moth < mothCount;
          moth += 1
        ) {
          const seed =
            hash(
              index * 97 +
                moth * 43,
            );
          const orbit =
            state.reducedMotion
              ? moth * 0.88
              : state.hole.elapsed *
                  (
                    1.3 +
                    seed * 2.2
                  ) +
                moth * 1.71;
          const mothX =
            point.x +
            Math.cos(orbit) *
              (
                9 +
                seed * 38
              ) *
              point.scale;
          const mothY =
            bulbY +
            Math.sin(
              orbit * 1.7,
            ) *
              (
                6 +
                seed * 22
              ) *
              point.scale;
          ctx.fillStyle =
            `rgba(255,221,149,${
              0.2 +
              power * 0.42
            })`;
          ctx.fillRect(
            Math.round(mothX),
            Math.round(mothY),
            Math.max(
              1,
              Math.round(
                point.scale * 2,
              ),
            ),
            1,
          );
        }
        if (
          power < 0.7 &&
          !state.reducedMotion
        ) {
          ctx.strokeStyle =
            `rgba(156,220,225,${
              0.18 +
              (
                1 - power
              ) *
                0.34
            })`;
          ctx.lineWidth =
            Math.max(
              1,
              point.scale * 1.4,
            );
          ctx.beginPath();
          ctx.moveTo(
            point.x - 7,
            bulbY + 2,
          );
          for (
            let arc = 1;
            arc <= 5;
            arc += 1
          ) {
            ctx.lineTo(
              point.x -
                7 +
                arc * 3 +
                (
                  hash(
                    arc * 41 +
                      index * 17 +
                      Math.floor(
                        state.hole.elapsed *
                          20,
                      )
                  ) -
                  0.5
                ) *
                  7,
              bulbY +
                arc * 3,
            );
          }
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  function drawReleaseBeacon() {
    const zone =
      courseZoneAt(
        state.player.y,
      );
    const distance =
      worldDistance(
        state.player,
        SHED_EXIT,
      );
    if (
      zone.id !==
        "release_corridor" &&
      distance > 145
    ) {
      return;
    }
    const point =
      worldToScreen(
        SHED_EXIT.x,
        SHED_EXIT.y + 2,
      );
    if (
      !point.visible ||
      point.x < -260 ||
      point.x > WIDTH + 260
    ) {
      return;
    }
    const beaconY =
      point.y -
      clamp(
        5.1 *
          point.pixelsPerMeter,
        54,
        240,
      );
    const pulse =
      state.reducedMotion
        ? 0.64
        : 0.45 +
          Math.pow(
            Math.max(
              0,
              Math.sin(
                state.hole.elapsed *
                  4.2,
              ),
            ),
            5,
          ) *
            0.55;
    const radius =
      clamp(
        54 * point.scale,
        28,
        116,
      );
    ctx.save();
    ctx.globalCompositeOperation =
      "screen";
    const halo =
      ctx.createRadialGradient(
        point.x,
        beaconY,
        0,
        point.x,
        beaconY,
        radius,
      );
    halo.addColorStop(
      0,
      `rgba(255,93,44,${
        pulse * 0.36
      })`,
    );
    halo.addColorStop(
      0.36,
      `rgba(202,43,25,${
        pulse * 0.14
      })`,
    );
    halo.addColorStop(
      1,
      "rgba(157,20,12,0)",
    );
    ctx.fillStyle = halo;
    ctx.fillRect(
      point.x - radius,
      beaconY - radius,
      radius * 2,
      radius * 2,
    );
    if (!state.reducedMotion) {
      const sweep =
        Math.sin(
          state.hole.elapsed *
            0.82,
        );
      const endX =
        point.x +
        sweep *
          clamp(
            310 *
              point.scale,
            120,
            380,
          );
      const beam =
        ctx.createLinearGradient(
          point.x,
          beaconY,
          endX,
          point.y,
        );
      beam.addColorStop(
        0,
        `rgba(255,78,37,${
          pulse * 0.13
        })`,
      );
      beam.addColorStop(
        1,
        "rgba(255,78,37,0)",
      );
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(
        point.x,
        beaconY,
      );
      ctx.lineTo(
        endX - 26,
        point.y + 10,
      );
      ctx.lineTo(
        endX + 26,
        point.y + 10,
      );
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawPlayerBreath() {
    if (
      !state.hole ||
      state.hole.tutorialVisible
    ) {
      return;
    }
    const zone =
      courseZoneAt(
        state.player.y,
      );
    const threat =
      threatAtmosphereState();
    const coldZone =
      [
        "water_hazard",
        "dead_green",
        "night_range",
        "release_corridor",
      ].includes(zone.id);
    const strength =
      clamp(
        (
          coldZone
            ? 0.48
            : 0.12
        ) +
          threat.pressure * 0.46 +
          (
            state.hole.focus
              ? 0.16
              : 0
          ),
        0,
        1,
      );
    if (strength < 0.18) {
      return;
    }
    const phase =
      state.reducedMotion
        ? 0.3
        : (
            state.hole.elapsed %
              3.6
          ) /
          3.6;
    if (
      !state.reducedMotion &&
      phase > 0.46
    ) {
      return;
    }
    const exhale =
      state.reducedMotion
        ? 0.42
        : smoothstep(
            clamp(
              phase / 0.46,
              0,
              1,
            ),
          );
    const alpha =
      strength *
      (
        state.reducedMotion
          ? 0.035
          : Math.sin(
              exhale * Math.PI,
            ) * 0.09
      );
    if (alpha <= 0.002) {
      return;
    }
    ctx.save();
    ctx.globalCompositeOperation =
      "screen";
    const puffCount =
      state.reducedMotion
        ? 2
        : 4;
    for (
      let puff = 0;
      puff < puffCount;
      puff += 1
    ) {
      const offset =
        puff /
        puffCount;
      const rise =
        exhale *
          76 +
        offset * 18;
      const drift =
        state.reducedMotion
          ? 0
          : Math.sin(
              state.hole.elapsed *
                0.9 +
                puff * 1.8,
            ) *
            (
              9 +
              puff * 4
            );
      const x =
        WIDTH * 0.5 +
        24 +
        drift +
        exhale * 34;
      const y =
        HEIGHT * 0.69 -
        rise;
      const radius =
        18 +
        exhale * 44 +
        puff * 7;
      const mist =
        ctx.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          radius,
        );
      mist.addColorStop(
        0,
        `rgba(201,226,218,${
          alpha *
          (
            0.62 -
            offset * 0.08
          )
        })`,
      );
      mist.addColorStop(
        0.52,
        `rgba(141,180,170,${
          alpha * 0.28
        })`,
      );
      mist.addColorStop(
        1,
        "rgba(141,180,170,0)",
      );
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(
        1.55 +
          exhale * 0.4,
        0.52,
      );
      ctx.fillStyle = mist;
      ctx.beginPath();
      ctx.arc(
        0,
        0,
        radius,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawThreatRefraction() {
    const threat =
      threatAtmosphereState();
    if (threat.pressure < 0.12) {
      return;
    }
    const edgeLeft =
      threat.direction <= 0;
    const edgeStrength =
      threat.pressure *
      (
        0.22 +
        Math.abs(
          threat.direction,
        ) *
          0.22
      );
    ctx.save();
    ctx.globalCompositeOperation =
      "screen";
    const mowerWash =
      ctx.createLinearGradient(
        edgeLeft ? 0 : WIDTH,
        HEIGHT * 0.5,
        edgeLeft
          ? WIDTH * 0.42
          : WIDTH * 0.58,
        HEIGHT * 0.5,
      );
    mowerWash.addColorStop(
      0,
      `rgba(239,83,38,${
        edgeStrength
      })`,
    );
    mowerWash.addColorStop(
      0.24,
      `rgba(205,126,55,${
        edgeStrength * 0.28
      })`,
    );
    mowerWash.addColorStop(
      1,
      "rgba(205,126,55,0)",
    );
    ctx.fillStyle =
      mowerWash;
    ctx.fillRect(
      edgeLeft
        ? 0
        : WIDTH * 0.58,
      HEIGHT * 0.08,
      WIDTH * 0.42,
      HEIGHT * 0.84,
    );
    if (!state.reducedMotion) {
      const bands =
        4 +
        Math.round(
          threat.pressure * 4,
        );
      for (
        let band = 0;
        band < bands;
        band += 1
      ) {
        const seed =
          hash(
            band * 71 +
              Math.floor(
                state.hole.elapsed *
                  8,
              ) *
                13,
          );
        const y =
          64 +
          seed *
            (HEIGHT - 128);
        const width =
          44 +
          hash(
            band * 29 +
              7,
          ) *
            190;
        const x =
          edgeLeft
            ? 0
            : WIDTH - width;
        ctx.fillStyle =
          `rgba(81,207,211,${
            threat.pressure *
            0.035
          })`;
        ctx.fillRect(
          x +
            (
              edgeLeft
                ? 3
                : -3
            ),
          y,
          width,
          1,
        );
        ctx.fillStyle =
          `rgba(244,68,39,${
            threat.pressure *
            0.045
          })`;
        ctx.fillRect(
          x +
            (
              edgeLeft
                ? -2
                : 2
            ),
          y + 2,
          width,
          1,
        );
      }
    }
    ctx.restore();
  }

  function drawFloodlightMoths() {
    const floodlight =
      PRIMARY_FLOODLIGHT;
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
      Math.max(
        6,
        Math.round(
          15 *
            effectQualityScale(),
        ),
      );
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
    const walkBob =
      courseLocomotionState().bob;

    ctx.fillStyle = "#07120c";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    applyCourseCameraTransform();
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
    drawPlayerGroundResponses();
    drawCourseEchoTrail();
    drawRecoverableGolfBalls();
    drawChangeRequest();
    drawAppealDocument();
    drawSpectralCourseFigures();

    drawGroundFog(
      progress,
      walkBob,
    );
    drawCrosswindWeather(
      progress,
      walkBob,
    );
    drawMowerThreatRipples();
    drawFloodlightAtmosphere();
    drawReleaseBeacon();

    drawMotes(state.time, 28, "198,173,81", HEIGHT * 0.16);
    drawCourseWayfindingStakes();
    drawWorldNavigationRibbon();
    drawCadenceForecast();
    drawCourseCollisionFootprints();
    drawMowerWorldParticles(
      "behind",
    );
    drawLayeredCourseEntities();
    drawPracticeBell();
    drawMowerWorldParticles(
      "front",
    );
    drawFloodlightMoths();
    drawCloudMoonlightGrade(
      progress,
      walkBob,
    );
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
      const distraction =
        state.hole.distraction;
      const statusAck =
        distraction.kind ===
        "status_ack";
      const statusEscalation =
        distraction.kind ===
        "status_escalation";
      drawWorldMarker(
        distraction.x,
        distraction.y,
        distraction.kind === "appeal"
          ? `APPEAL REVIEW // ${state.hole.appealReviewTimer.toFixed(1)}s`
          : statusAck
            ? `STATUS PING // ${state.hole.distractionTimer.toFixed(1)}s`
            : statusEscalation
              ? `ESCALATED SECTOR // ${state.hole.distractionTimer.toFixed(1)}s`
          : "DISTRACTION",
        distraction.kind === "appeal"
          ? "#ef9653"
          : statusAck
            ? "#76c1a4"
            : statusEscalation
              ? "#df6242"
          : "#d6a74c",
        distraction.kind === "appeal"
          ? "CR"
          : statusAck
            ? "SR"
            : statusEscalation
              ? "!!"
          : "!",
      );
    }
    const changeRequest =
      activeChangeRequest();
    if (
      !state.hole.changeRequestCollected &&
      !state.hole.appealUsed &&
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

    ctx.restore();
    drawPeripheralHorrorManifestation();
    drawLateralCameraFeedback();
    drawForwardMotionFeedback();
    drawSecondWindFeedback();
    drawCollisionContactOverlay();

    drawSuspenseEffects();
    drawPursuitEffects();
    drawThreatRefraction();
    drawNearMowerDebris();
    drawPlayerBreath();
    drawBlindsideTransferPath();
    drawConcealmentEffects();
    drawListeningFocus();
    drawCutTraceMemory();
    drawCadenceForecastCompass();
    drawContactBreakFeedback();
    drawAppealReviewFeedback();
    drawStatusRequestFeedback();
    drawBlindsideTransferFeedback();
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
        !state.hole.escapeFiling.sealing &&
        !state.hole.riskAward &&
        !state.hole.deliveryAward
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
    const captureReview =
      outcome === "defeat"
        ? state.hole.captureReview
        : null;
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
          captureReview
            ? `COUNTER // ${captureReview.shortLabel}`
            : `TARGET // ${target.shortName}`,
        description:
          captureReview
            ? captureReview.counterplay
            :
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
    const actionDescription =
      outcome === "defeat" &&
      state.resultIndex === 0 &&
      state.hole.captureReview
        ? "RETRY FILE LOADS THIS COUNTERPLAN INTO THE NEXT ATTEMPT."
        : selected.description;
    drawText(
      `NEXT ACTION // ${actionDescription}`,
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

  function escapeTableauArt(
    usedDrain,
  ) {
    return usedDrain
      ? drainEscapeTableauArt
      : shedEscapeTableauArt;
  }

  function drawVictoryTableau(
    usedDrain,
    reveal,
  ) {
    const tableau =
      escapeTableauArt(usedDrain);
    const driftX =
      state.reducedMotion
        ? 0
        : Math.sin(
            state.time * 0.22,
          ) * 3.2;
    const driftY =
      state.reducedMotion
        ? 0
        : Math.cos(
            state.time * 0.17,
          ) * 1.4;
    const zoom =
      1.008 +
      reveal * 0.014 +
      (state.reducedMotion
        ? 0
        : Math.sin(
            state.time * 0.13,
          ) * 0.0015);
    const generatedArtDrawn =
      drawImageCover(
        ctx,
        tableau,
        driftX,
        driftY,
        zoom,
      );
    if (!generatedArtDrawn) {
      drawImageCover(
        ctx,
        holeArt,
        0,
        8,
        1.05 + reveal * 0.018,
      );
    }

    const routeWash =
      ctx.createLinearGradient(
        0,
        0,
        WIDTH,
        HEIGHT,
      );
    if (usedDrain) {
      routeWash.addColorStop(
        0,
        "rgba(2,14,17,0.32)",
      );
      routeWash.addColorStop(
        0.52,
        "rgba(4,18,18,0.12)",
      );
      routeWash.addColorStop(
        1,
        "rgba(2,12,9,0.34)",
      );
    } else {
      routeWash.addColorStop(
        0,
        "rgba(18,9,2,0.24)",
      );
      routeWash.addColorStop(
        0.5,
        "rgba(4,13,8,0.13)",
      );
      routeWash.addColorStop(
        1,
        "rgba(2,10,8,0.34)",
      );
    }
    ctx.fillStyle = routeWash;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const refugeGlow =
      usedDrain
        ? ctx.createRadialGradient(
            WIDTH * 0.53,
            HEIGHT * 0.28,
            10,
            WIDTH * 0.53,
            HEIGHT * 0.28,
            WIDTH * 0.55,
          )
        : ctx.createRadialGradient(
            WIDTH * 0.13,
            HEIGHT * 0.48,
            8,
            WIDTH * 0.13,
            HEIGHT * 0.48,
            WIDTH * 0.46,
          );
    refugeGlow.addColorStop(
      0,
      usedDrain
        ? `rgba(96,198,190,${0.035 + reveal * 0.025})`
        : `rgba(230,151,66,${0.045 + reveal * 0.035})`,
    );
    refugeGlow.addColorStop(
      1,
      "rgba(0,0,0,0)",
    );
    ctx.fillStyle = refugeGlow;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const vignette =
      ctx.createRadialGradient(
        WIDTH * 0.5,
        HEIGHT * 0.45,
        HEIGHT * 0.18,
        WIDTH * 0.5,
        HEIGHT * 0.45,
        WIDTH * 0.7,
      );
    vignette.addColorStop(
      0,
      "rgba(0,0,0,0)",
    );
    vignette.addColorStop(
      1,
      "rgba(0,2,1,0.48)",
    );
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    return generatedArtDrawn;
  }

  function drawVictory() {
    const sceneReveal =
      smoothstep(
        state.time / 0.52,
      );
    const reveal = smoothstep(
      (state.time - 0.5) / 0.56,
    );
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
      (state.time - 0.74) / 0.78,
    );
    const displayedScore = Math.round(
      result.score * scoreReveal,
    );
    drawVictoryTableau(
      usedDrain,
      sceneReveal,
    );
    ctx.fillStyle = usedDrain
      ? `rgba(1,8,9,${0.2 + reveal * 0.1})`
      : `rgba(1,7,3,${0.2 + reveal * 0.11})`;
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
    ctx.translate(
      0,
      state.reducedMotion
        ? 0
        : (1 - reveal) * 28,
    );
    const panelFill =
      ctx.createLinearGradient(
        0,
        panel.y,
        0,
        panel.y + panel.height,
      );
    panelFill.addColorStop(
      0,
      usedDrain
        ? "rgba(3,17,17,0.76)"
        : "rgba(8,14,6,0.76)",
    );
    panelFill.addColorStop(
      0.58,
      usedDrain
        ? "rgba(3,15,14,0.87)"
        : "rgba(3,13,7,0.87)",
    );
    panelFill.addColorStop(
      1,
      usedDrain
        ? "rgba(2,10,9,0.96)"
        : "rgba(2,9,5,0.96)",
    );
    ctx.fillStyle = panelFill;
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
    if (result.appealUsed) {
      scoreNotes.push({
        text: `EMERGENCY APPEAL // +${result.appealForfeitedBonus.toLocaleString()} EVIDENCE FORFEITED`,
        color: "#d98255",
      });
    }
    if (result.statusAcknowledged) {
      scoreNotes.push({
        text: "STATUS ACKNOWLEDGED // ROUGH LOCATION SHARED",
        color: "#78d3bf",
      });
    }
    if (result.statusEscalated) {
      scoreNotes.push({
        text: "STATUS MISSED // STAKEHOLDER ESCALATION",
        color: "#ed746a",
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

    const barHeight = Math.round(
      (1 - sceneReveal) * 92 + 18,
    );
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
    const panelY = lerp(504, 342, textReveal);
    const captureDialogue =
      state.hole.captureDialogue ||
      JOE_CAPTURE_LINES[0];
    const captureReview =
      state.hole.captureReview || {
        label: "UNEXPLAINED CONTACT",
        source: "unknown",
        zoneName:
          courseZoneAt(
            state.player.y,
          ).name,
        evidence:
          "Joe closed the final distance before the route was clear.",
        counterplay:
          "Use Listening Focus, preserve cover, and keep a second route available.",
        repeatCount: 1,
      };
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
    const reviewX = dialogueX;
    const reviewY =
      dialogueY + 96;
    const reviewWidth =
      dialogueWidth;
    const reviewHeight = 64;
    ctx.fillStyle =
      "rgba(7,15,10,0.94)";
    ctx.fillRect(
      reviewX,
      reviewY,
      reviewWidth,
      reviewHeight,
    );
    strokeRect(
      reviewX,
      reviewY,
      reviewWidth,
      reviewHeight,
      captureReview.repeatCount > 1
        ? "#d88b3d"
        : "#66795e",
      captureReview.repeatCount > 1
        ? 2
        : 1,
    );
    drawText(
      captureReview.repeatCount > 1
        ? `INCIDENT REVIEW // ${captureReview.label} // REPEAT ISSUE x${captureReview.repeatCount}`
        : `INCIDENT REVIEW // ${captureReview.label} // ${captureReview.zoneName}`,
      reviewX + 14,
      reviewY + 17,
      10,
      captureReview.repeatCount > 1
        ? "#efb35c"
        : "#9fbb90",
      "left",
      true,
    );
    drawText(
      `EVIDENCE // ${captureReview.evidence}`,
      reviewX + 14,
      reviewY + 38,
      11,
      "#e5ddc8",
      "left",
    );
    drawText(
      `NEXT RUN // ${captureReview.counterplay}`,
      reviewX + 14,
      reviewY + 57,
      10,
      "#d5a15e",
      "left",
      true,
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
    const renderStartedAt =
      performance.now();
    renderFrameCache.cameraFrame =
      null;
    renderFrameCache.threat = null;
    renderFrameCache.locomotion = null;
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
    recordRenderPerformance(
      performance.now() -
        renderStartedAt,
    );
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
      if (
        hole.controlHintSource ===
          "onboarding" &&
        hole.travelDistance >=
          ONBOARDING_CONTROL_COLLAPSE_DISTANCE
      ) {
        hole.controlHintTimer = Math.min(
          hole.controlHintTimer,
          ONBOARDING_CONTROL_COLLAPSE_DELAY,
        );
      }
      if (hole.controlHintTimer <= 0) {
        hole.controlHintSource = null;
      }
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
        if (!hole.riskAward) {
          hole.deliveryAward.age +=
            dt;
        }
        if (
          hole.deliveryAward.age >=
          hole.deliveryAward.duration
        ) {
          hole.deliveryAward = null;
        }
      }
      if (
        !hole.deliveryAward &&
        !hole.riskAward &&
        hole.deliveryAwardQueue.length >
          0
      ) {
        hole.deliveryAward =
          hole.deliveryAwardQueue.shift();
        hole.deliveryAward.age = 0;
        playUiTone(
          330 +
            hole.deliveryAward.chain *
              22,
          0.055,
          0.012,
        );
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
      hole.secondWindTimer =
        Math.max(
          0,
          hole.secondWindTimer - dt,
        );
      hole.appealReviewTimer =
        Math.max(
          0,
          hole.appealReviewTimer - dt,
        );
      if (hole.appealDocument) {
        hole.appealDocument.age += dt;
      }
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
      hole.trailDiscoveryCooldown =
        Math.max(
          0,
          hole.trailDiscoveryCooldown -
            dt,
        );
      hole.trailChainTimer = Math.max(
        0,
        hole.trailChainTimer - dt,
      );
      hole.trailColdTimer =
        Math.max(
          0,
          hole.trailColdTimer - dt,
        );
      hole.counterRouteQuietTimer =
        Math.max(
          0,
          hole.counterRouteQuietTimer -
            dt,
        );
      hole.blindsideTransferCooldown =
        Math.max(
          0,
          hole.blindsideTransferCooldown -
            dt,
        );
      updateCourseEffects(dt);
      updateTurfMarks(dt);
      const movement = movementInput();
      if (!hole.escapeFiling.sealing) {
        updateGolfBallTactics(
          dt,
          movement,
        );
        updatePracticeDrill();
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
      const panicJoeDistance =
        worldDistance(
          hole.joe,
          state.player,
        );
      const panicThreat =
        clamp(
          (
            1 -
            panicJoeDistance / 96
          ) *
            0.42 +
            hole.detection * 0.34 +
            (
              hole.joe.mode ===
              "chase"
                ? 0.34
                : 0
            ) +
            hole.tensionDirector
              .pressure *
              0.12,
          0,
          0.62,
        );
      hole.panicTarget =
        moving &&
        !hole.crouched &&
        !hole.focus
          ? clamp(
              0.48 +
                (
                  sprinting
                    ? 0.28
                    : 0
                ) +
                panicThreat +
                (
                  hole.secondWindTimer >
                  0
                    ? 0.1
                    : 0
                ),
              0,
              1,
            )
          : 0;
      const panicResponse =
        hole.panicTarget >
        hole.panicMomentum
          ? 5.8
          : 2.7;
      hole.panicMomentum =
        lerp(
          hole.panicMomentum,
          hole.panicTarget,
          1 -
            Math.exp(
              -dt *
                panicResponse,
            ),
        );
      updateCourseCameraMotion(
        dt,
        moving ? movement.x : 0,
        sprinting,
      );
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
        (
          hole.secondWindTimer > 0 &&
          !hole.crouched &&
          !hole.focus
            ? SECOND_WIND_SPEED_MULTIPLIER
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
          const stepNoiseMultiplier =
            crosswindMasksFootsteps(
              stepEnvironment,
            )
              ? CROSSWIND_NOISE_MULTIPLIER
              : hole.counterRouteQuietTimer >
                    0 &&
                  !stepEnvironment.sand
                ? 0.54
                : 1;
          hole.lastStepDistance = hole.travelDistance;
          playFootstep(
            inStepRough,
            sprinting,
            hole.crouched,
            stepEnvironment.wet,
            stepEnvironment.sand,
            stepNoiseMultiplier,
          );
          addPlayerGroundResponse(
            stepEnvironment,
            sprinting,
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
          const enteredZone =
            COURSE_ZONES[
              zoneIndex
            ];
          if (
            enteredZone.id ===
            "water_hazard"
          ) {
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
          } else if (
            enteredZone.id ===
            "clubhouse_crossing"
          ) {
            hole.joe.alert = Math.max(
              hole.joe.alert,
              0.16,
            );
            hole.stateBanner =
              "CLUBHOUSE CROSSING // OPEN SIGHTLINES";
            hole.stateBannerTimer = 2.7;
          } else if (
            enteredZone.id ===
            "maintenance_maze"
          ) {
            hole.dreadTimer = 4.4;
            hole.joe.alert = Math.max(
              hole.joe.alert,
              0.23,
            );
            hole.stateBanner =
              "SERVICE MAZE // LISTEN BEFORE COMMITTING";
            hole.stateBannerTimer = 2.9;
          } else if (
            enteredZone.id ===
            "dead_green"
          ) {
            hole.dreadTimer = 5.2;
            hole.joe.alert = Math.max(
              hole.joe.alert,
              0.2,
            );
          }
        }
      }
      updateSprintReviews();
      hole.discoveredY = Math.max(hole.discoveredY, state.player.y + 48);
      const environment = getPlayerEnvironmentState();
      const inRough = environment.inRough;
      const effectiveRough =
        environment.effectiveRough;
      hole.environment = environment;
      updateCutTrace(
        dt,
        environment,
      );
      updateCrosswind(
        dt,
        moving,
        environment,
      );
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
      const counterRouteNoise =
        hole.counterRouteQuietTimer >
          0 &&
        !environment.sand
          ? 0.54
          : 1;
      const crosswindNoise =
        crosswindMasksFootsteps(
          environment,
        )
          ? CROSSWIND_NOISE_MULTIPLIER
          : 1;
      const targetNoise = Math.max(
        movementNoise *
          Math.min(
            counterRouteNoise,
            crosswindNoise,
          ),
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

      updateStatusRequest(
        dt,
        moving,
      );

      const key = activeKeyPoint();
      const sprinkler = activeSprinklerPoint();
      const changeRequest =
        activeChangeRequest();
      const shed = SHED_EXIT;
      const drain = DRAIN_EXIT;
      const nearestBall =
        nearestRecoverableBall();
      const appeal =
        emergencyAppealState();
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
      } else if (appeal.eligible) {
        hole.prompt = inputCopy(
          `${keyboardBindingLabel("interact")} — FILE EMERGENCY APPEAL // FORFEIT +${appeal.forfeitedBonus}`,
          `A — FILE EMERGENCY APPEAL // FORFEIT +${appeal.forfeitedBonus}`,
          `TAP USE — FILE EMERGENCY APPEAL // FORFEIT +${appeal.forfeitedBonus}`,
        );
      } else if (
        hole.statusRequest.active
      ) {
        const request =
          hole.statusRequest;
        hole.prompt = request.responding
          ? `SUBMITTING STATUS ${Math.round(
              request.responseProgress /
                request.responseDuration *
                100,
            )}% // STAY STILL`
          : inputCopy(
              `${keyboardBindingLabel("interact")} — ACKNOWLEDGE ${request.code} // HOLD STILL ${request.responseDuration.toFixed(2)}s`,
              `A — ACKNOWLEDGE ${request.code} // HOLD STILL ${request.responseDuration.toFixed(2)}s`,
              `TAP USE — ACKNOWLEDGE ${request.code} // HOLD STILL ${request.responseDuration.toFixed(2)}s`,
            );
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
        !hole.appealUsed &&
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
      } else if (practiceDrillActive()) {
        hole.prompt = inputCopy(
          `HOLD ${keyboardBindingLabel("chip")} — CHIP AT AMBER BELL (OPTIONAL)`,
          "HOLD X — CHIP AT AMBER BELL (OPTIONAL)",
          "HOLD CHIP — AIM AT AMBER BELL (OPTIONAL)",
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
        updateTensionDirector(
          dt,
          moving,
        );
        updateJoe(dt);
        if (state.mode === "first_hole") {
          updateEmergencyAppealWindow();
          updateEscapeFiling(dt);
        }
      }
      if (state.mode === "first_hole") {
        updateHorrorDirector(
          dt,
          moving,
        );
        updateNerveHold(
          dt,
          getPlayerEnvironmentState(),
          moving,
        );
        if (
          !hole.prompt &&
          (
            hole.nerveHold.active ||
            hole.nerveHold.armed
          )
        ) {
          hole.prompt =
            hole.nerveHold.active
              ? inputCopy(
                  `HOLD ${keyboardBindingLabel("crouch")} + ${keyboardBindingLabel("focus")} // DO NOT MOVE`,
                  "HOLD LB + LT // DO NOT MOVE",
                  "HOLD CROUCH + LISTEN // DO NOT MOVE",
                )
              : inputCopy(
                  `HOLD ${keyboardBindingLabel("focus")} // HOLD YOUR NERVE`,
                  "HOLD LT // HOLD YOUR NERVE",
                  "HOLD LISTEN // HOLD YOUR NERVE",
                );
        }
        updateCadenceRead(
          dt,
          getPlayerEnvironmentState(),
          moving,
        );
        if (
          !hole.prompt &&
          (
            hole.cadenceRead.active ||
            hole.cadenceRead.armed
          )
        ) {
          hole.prompt =
            hole.cadenceRead.active
              ? inputCopy(
                  `READING CADENCE ${Math.round(hole.cadenceRead.progress / CADENCE_READ_SECONDS * 100)}% // DO NOT MOVE`,
                  `READING CADENCE ${Math.round(hole.cadenceRead.progress / CADENCE_READ_SECONDS * 100)}% // DO NOT MOVE`,
                  `READING CADENCE ${Math.round(hole.cadenceRead.progress / CADENCE_READ_SECONDS * 100)}% // DO NOT MOVE`,
                )
              : inputCopy(
                  `HOLD ${keyboardBindingLabel("focus")} // READ MOWER CADENCE`,
                  "HOLD LT // READ MOWER CADENCE",
                  "HOLD LISTEN // READ MOWER CADENCE",
                );
        }
        updateBlindsideTransfer(
          dt,
          getPlayerEnvironmentState(),
          moving,
        );
        const joeDistance = worldDistance(hole.joe, state.player);
        const threatHeartbeat =
          clamp(
            Math.max(
              1 -
                joeDistance / 54 +
                (
                  hole.joe.mode ===
                  "chase"
                    ? 0.28
                    : 0
                ),
              hole.tensionDirector
                .pressure *
                0.46,
            ),
            0,
            1,
          );
        const exertionHeartbeat =
          moving &&
          !hole.crouched &&
          !hole.focus
            ? sprinting
              ? 0.31 +
                hole.panicMomentum *
                  0.25
              : 0.25 +
                hole.panicMomentum *
                  0.2
            : 0;
        const heartbeatStrength = clamp(
          Math.max(
            threatHeartbeat,
            exertionHeartbeat,
          ),
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
    state.status =
      state.career.roundsStarted === 0
        ? "5:47 PM — Joe assigned one last action item."
        : "Every blade is in scope.";
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
        state.status = "South gate locked. Reach an exit across the course.";
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
        hole.tensionDirector
          .pressure *
          0.18 +
        (
          hole.tensionDirector
            .pendingIntercept
            ? 0.08
            : 0
        ) +
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
      if (
        hole.tensionDirector
          .pressure > 0.3
      ) {
        layers.push(
          "course_pressure",
        );
      }
      if (
        hole.tensionDirector
          .pendingIntercept
      ) {
        layers.push(
          "route_override",
        );
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
            ? 0.006 +
              state.hole
                .tensionDirector
                .pressure *
                0.007
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
      const director =
        state.hole
          .tensionDirector;
      const routeOverrideGain =
        director.pendingIntercept
          ? 0.014
          : director.pressure *
            0.0045;
      setMotorLevel(
        Math.max(
          0,
          0.008 +
            proximity * 0.048 +
            modeGain +
            listeningBoost +
            cadence +
            routeStress * 0.006 +
            routeOverrideGain,
        ),
        36 +
          proximity * 46 +
          modePitch +
          cadence * 220 +
          routeStress * 7 +
          (
            director.pendingIntercept
              ? 7
              : director.pressure * 3
          ),
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
        const motorSourceX =
          director.pendingIntercept
            ? director
                .pendingIntercept.x
            : state.hole.joe.x;
        motorPanNode.pan.setTargetAtTime(
          clamp((motorSourceX - state.player.x) / 72, -0.88, 0.88),
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
    quiet = 1,
  ) {
    const panicWeight =
      crouched
        ? 1
        : 1 +
          (
            state.hole
              .panicMomentum ||
            0
          ) *
            (
              sprinting
                ? 0.24
                : 0.11
            );
    const weight =
      (
        crouched
          ? 0.45
          : sprinting
            ? 1.25
            : 1
      ) *
      panicWeight;
    const quietGain =
      typeof quiet === "number"
        ? clamp(quiet, 0, 1)
        : quiet
          ? 0.54
          : 1;
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
      ) *
        weight *
        quietGain,
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
          : 0.022) *
        weight *
        quietGain,
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

  function playEmergencyAppealCue() {
    playNoiseBurst(
      0.38,
      0.052,
      1550,
      "highpass",
    );
    playTransientTone(
      523,
      392,
      0.18,
      0.048,
      "square",
    );
    playTransientTone(
      392,
      262,
      0.26,
      0.044,
      "triangle",
      0.11,
    );
    playTransientTone(
      196,
      147,
      0.34,
      0.036,
      "sawtooth",
      0.22,
    );
  }

  function playStatusRequestCue(
    urgent,
  ) {
    const base = urgent ? 392 : 330;
    playTransientTone(
      base,
      base * 1.25,
      0.12,
      0.032,
      "square",
    );
    playTransientTone(
      base * 1.5,
      base * 1.5,
      0.1,
      0.024,
      "sine",
      0.16,
    );
    playNoiseBurst(
      0.12,
      0.018,
      1250,
      "bandpass",
      0,
      0.08,
    );
  }

  function playStatusResolveCue(
    escalated,
  ) {
    if (escalated) {
      playTransientTone(
        294,
        117,
        0.38,
        0.052,
        "sawtooth",
      );
      playNoiseBurst(
        0.34,
        0.038,
        620,
        "lowpass",
      );
      return;
    }
    playTransientTone(
      392,
      523,
      0.2,
      0.036,
      "triangle",
    );
    playTransientTone(
      523,
      659,
      0.18,
      0.026,
      "sine",
      0.12,
    );
  }

  function playCrosswindCue(active) {
    const pan =
      state.hole.crosswind.direction *
      0.48;
    playNoiseBurst(
      active ? 0.92 : 0.48,
      active ? 0.052 : 0.026,
      active ? 980 : 720,
      "bandpass",
      -pan,
      0,
      ambienceBusGain,
    );
    playNoiseBurst(
      active ? 1.18 : 0.56,
      active ? 0.042 : 0.022,
      active ? 1480 : 1050,
      "highpass",
      pan,
      active ? 0.08 : 0.04,
      ambienceBusGain,
    );
  }

  function playCrosswindRunCue() {
    playTransientTone(
      330,
      494,
      0.19,
      0.028,
      "triangle",
      0,
      effectsBusGain,
    );
    playTransientTone(
      494,
      659,
      0.22,
      0.024,
      "sine",
      0.11,
      effectsBusGain,
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

  function playPracticeBellCue() {
    playTransientTone(
      784,
      740,
      0.52,
      0.045,
      "sine",
    );
    playTransientTone(
      1174,
      1046,
      0.66,
      0.028,
      "triangle",
      0.08,
    );
    playTransientTone(
      1568,
      1396,
      0.48,
      0.016,
      "sine",
      0.16,
    );
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
    state.hole.controlHintTimer =
      ONBOARDING_CONTROL_HINT_SECONDS;
    state.hole.controlHintSource =
      "onboarding";
    state.hole.prompt = "";
    setHoleMessage(
      state.hole.overtime
        ? "OVERTIME ACTIVE — two balls, faster Joe, stronger evidence, 1.30× score."
        : "SOUTH GATE LOCKED — cross to the shed key or release the drain.",
      3.6,
    );
    if (practiceDrillActive()) {
      setHoleMessage(
        "OPTIONAL FIELD TEST — chip into the amber bell ring to watch Joe react, or move on.",
        4.8,
      );
      state.hole.stateBanner =
        "OPTIONAL FIELD TEST // RING THE STARTER BELL";
      state.hole.stateBannerTimer = 3.6;
      state.hole.stateBannerLockTimer = 1.4;
    }
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
    const captureReview =
      quickStart
        ? state.hole.captureReview
        : null;
    const target =
      captureReview
        ? {
            id:
              `counter_${captureReview.id}`,
            name:
              "INCIDENT COUNTERPLAN",
            shortName:
              captureReview.shortLabel,
            hint:
              captureReview.counterplay,
            source:
              "capture_review",
          }
        : quickStart
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
      hole.practiceDrill.active = false;
      hole.practiceDrill.stage =
        "skipped_rematch";
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
      hole.controlHintSource = "rematch";
      hole.message =
        captureReview
          ? `COUNTERPLAN // ${target.hint}${hole.courseEchoRecord ? " COURSE ECHO ACTIVE." : ""}`
          :
        `${target.name} — ${target.hint}.${hole.courseEchoRecord ? " COURSE ECHO ACTIVE." : ""}`;
      hole.messageTimer = 4.2;
      hole.stateBanner =
        captureReview
          ? `FILE REOPENED // COUNTER ${target.shortName}`
          :
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
      state.hole.controlHintTimer =
        MANUAL_CONTROL_HINT_SECONDS;
      state.hole.controlHintSource =
        "manual";
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
        state.hole.controlHintTimer =
          MANUAL_CONTROL_HINT_SECONDS;
        state.hole.controlHintSource =
          "manual";
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
    performance: {
      targetFps: 60,
      effectsTier:
        runtimePerformance.tier,
      effectScale: Number(
        effectQualityScale().toFixed(
          2,
        ),
      ),
      averageRenderMs: Number(
        runtimePerformance
          .renderAverageMs.toFixed(2),
      ),
      lastRenderMs: Number(
        runtimePerformance
          .lastRenderMs.toFixed(2),
      ),
      averagePresentationMs:
        Number(
          runtimePerformance
            .presentationAverageMs.toFixed(
              2,
            ),
        ),
      estimatedFps: Number(
        (
          1000 /
          Math.max(
            1,
            runtimePerformance
              .presentationAverageMs,
          )
        ).toFixed(1),
      ),
      renderedFrames:
        runtimePerformance
          .renderedFrames,
      refreshFramesSkipped:
        runtimePerformance
          .skippedFrames,
    },
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
    narrative: {
      title: "One Last Action Item",
      playerRole:
        PLAYER_STORY.role,
      incitingIncident:
        PLAYER_STORY.incitingIncident,
      reasonToCross:
        PLAYER_STORY.reasonToCross,
      stakes:
        PLAYER_STORY.stakes,
      courseConnection:
        PLAYER_STORY.courseConnection,
      optionalEvidence:
        PLAYER_STORY.evidence,
      immediateObjective:
        "Cross the course and escape through the maintenance shed or drainage culvert.",
    },
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
      golfLessonCompleted:
        state.career.golfLessonCompleted,
      lastCaptureCause:
        state.career.lastCaptureCause,
      captureCauseStreak:
        state.career.captureCauseStreak,
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
          worldDistance(state.hole.joe, state.player) < 36 ||
          (
            courseLocomotionState()
              .moving &&
            !courseLocomotionState()
              .crouched &&
            courseLocomotionState()
              .panic >= 0.44
          )),
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
              (
                state.hole.environment ||
                getPlayerEnvironmentState()
              ).sand
                ? SAND_PLAYER_SPEED_MULTIPLIER
                : 1
            ) *
            (
              state.hole
                  .secondWindTimer > 0 &&
              !state.hole.crouched &&
              !state.hole.focus
                ? SECOND_WIND_SPEED_MULTIPLIER
                : 1
            ),
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
          cameraMotion: {
            lateralInput: Number(
              courseCameraMotion().lateralInput.toFixed(2),
            ),
            screenShiftPixels: Number(
              courseCameraMotion().offsetX.toFixed(2),
            ),
            targetShiftPixels: Number(
              courseCameraMotion().targetOffsetX.toFixed(2),
            ),
            viewportShiftPixels: Number(
              courseViewportShiftX().toFixed(2),
            ),
            projectedWorldShiftPixels: Number(
              (
                courseCameraMotion().offsetX *
                0.46
              ).toFixed(2),
            ),
            rollDegrees: Number(
              (
                courseCameraMotion().roll *
                180 /
                Math.PI
              ).toFixed(3),
            ),
            targetRollDegrees: Number(
              (
                courseCameraMotion().targetRoll *
                180 /
                Math.PI
              ).toFixed(3),
            ),
            locomotion: {
              moving:
                courseLocomotionState()
                  .moving,
              sprinting:
                courseLocomotionState()
                  .sprinting,
              secondWind:
                courseLocomotionState()
                  .secondWind,
              panicIntensity:
                Number(
                  courseLocomotionState()
                    .panic.toFixed(
                      2,
                    ),
                ),
              panicTarget:
                Number(
                  (
                    state.hole
                      .panicTarget ||
                    0
                  ).toFixed(
                    2,
                  ),
                ),
              cadence:
                Number(
                  courseLocomotionState()
                    .cadence.toFixed(
                      2,
                    ),
                ),
              strideImpact:
                Number(
                  courseLocomotionState()
                    .strideImpact.toFixed(
                      2,
                    ),
                ),
              shoulderRollDegrees:
                Number(
                  (
                    courseLocomotionState()
                      .roll *
                    180 /
                    Math.PI
                  ).toFixed(
                    3,
                  ),
                ),
              bobPixels: Number(
                courseLocomotionState()
                  .bob.toFixed(2),
              ),
              surgeScale: Number(
                (
                  1 +
                  courseLocomotionState()
                    .zoom
                ).toFixed(3),
              ),
              forwardSpeedLines:
                forwardMotionStreakCount(
                  courseLocomotionState(),
                ),
              peripheralRush:
                !state.reducedMotion &&
                courseLocomotionState()
                  .moving
                  ? Math.max(
                      4,
                      Math.round(
                        (
                          courseLocomotionState()
                            .sprinting
                            ? 16
                            : 10
                        ) *
                          effectQualityScale(),
                      ),
                    )
                  : 0,
            },
            secondWind: {
              active:
                state.hole
                  .secondWindTimer > 0,
              remainingSeconds: Number(
                state.hole
                  .secondWindTimer.toFixed(
                    2,
                  ),
              ),
              durationSeconds:
                state.hole
                  .secondWindDuration,
              speedMultiplier:
                SECOND_WIND_SPEED_MULTIPLIER,
              activations:
                state.hole
                  .secondWindActivations,
              trigger:
                "break_chase_after_getting_within_18m",
            },
            mode: state.reducedMotion
              ? "reduced_shift_no_roll"
              : "eased_shift_with_counter_roll",
            hudAnchoring: "screen_fixed",
            worldResponse:
              "translated_viewport_with_layered_parallax",
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
            statusRequest: {
              code:
                activeRunVariant().statusRequest.code,
              label:
                activeRunVariant().statusRequest.label,
              request:
                activeRunVariant().statusRequest.request,
              triggerY:
                activeRunVariant().statusRequest.triggerY,
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
          hudExpansionReason:
            state.hole.focus
              ? "focus"
              : state.hole.controlHintTimer >
                    0.01
                ? state.hole
                    .controlHintSource ||
                  "timed"
                : "compact",
          controlHintSeconds: Number(
            state.hole.controlHintTimer.toFixed(2),
          ),
          onboardingCollapseDistance:
            ONBOARDING_CONTROL_COLLAPSE_DISTANCE,
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
            nerveHolds:
              state.hole
                .nerveHold.completions,
            cadenceReads:
              state.hole
                .cadenceRead.completions,
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
              activeAward:
                state.hole.deliveryAward
                  ? {
                      label:
                        state.hole
                          .deliveryAward.label,
                      amount:
                        state.hole
                          .deliveryAward.amount,
                      chain:
                        state.hole
                          .deliveryAward.chain,
                      mergedCount:
                        state.hole
                          .deliveryAward.mergedCount,
                      remainingSeconds:
                        Number(
                          Math.max(
                            0,
                            state.hole
                              .deliveryAward.duration -
                              state.hole
                                .deliveryAward.age,
                          ).toFixed(2),
                        ),
                    }
                  : null,
              queuedAwards:
                state.hole
                  .deliveryAwardQueue.map(
                    (
                      queuedAward,
                      index,
                    ) => ({
                      position:
                        index + 1,
                      label:
                        queuedAward.label,
                      amount:
                        queuedAward.amount,
                      chain:
                        queuedAward.chain,
                      mergedCount:
                        queuedAward.mergedCount,
                    }),
                  ),
              presentationQueueCap:
                DELIVERY_AWARD_QUEUE_MAX,
              overflowMerges:
                state.hole
                  .deliveryAwardOverflowMerges,
              familyCounts: {
                ...state.hole.deliveryFamilyCounts,
              },
              familyCaps: {
                ...DELIVERY_FAMILY_CAPS,
              },
              rule:
                "Link smart plays before the timer expires; the chain increases score but never changes survival difficulty. Simultaneous award cards play in order through a bounded five-card presentation queue, with excess cards merged visually while every scoring event remains in the ledger.",
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
          victoryPresentation:
            state.mode === "victory"
              ? {
                  route:
                    state.hole.escapeRoute,
                  generatedTableau:
                    state.hole.escapeRoute ===
                    "drain"
                      ? "rough-cut-drain-escape-tableau-v1.png"
                      : "rough-cut-shed-escape-tableau-v1.png",
                  loaded:
                    escapeTableauArt(
                      state.hole.escapeRoute ===
                        "drain",
                    ).complete,
                  scorecardTreatment:
                    "route-colored translucent after-action ledger over dedicated escape tableau",
                  ambientMotion:
                    state.reducedMotion
                      ? "static"
                      : "restrained camera drift and refuge glow",
                  fallback:
                    "existing course tableau while generated image loads",
                }
              : null,
          captureReview:
            state.hole.captureReview
              ? {
                  ...state.hole.captureReview,
                }
              : null,
          keyCollected: state.hole.keyCollected,
          changeRequest: {
            collected:
              state.hole.changeRequestCollected,
            consumedByAppeal:
              state.hole.appealUsed,
            filesOnEscape:
              !state.hole.appealUsed,
            bonus: CHANGE_REQUEST_BONUS,
            distance:
              state.hole.appealUsed
                ? null
                : Math.round(
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
          emergencyAppeal: {
            eligible:
              emergencyAppealState()
                .eligible,
            blockedReason:
              emergencyAppealState()
                .blockedReason,
            used: state.hole.appealUsed,
            oneUsePerRun: true,
            joeDistance: Number(
              emergencyAppealState()
                .joeDistance.toFixed(2),
            ),
            distanceWindow: {
              minimum:
                EMERGENCY_APPEAL_MIN_DISTANCE,
              maximum:
                EMERGENCY_APPEAL_MAX_DISTANCE,
            },
            reviewSeconds:
              EMERGENCY_APPEAL_REVIEW_SECONDS,
            reviewRemainingSeconds:
              Number(
                state.hole
                  .appealReviewTimer.toFixed(
                    2,
                  ),
              ),
            forfeitedBonus:
              state.hole.appealUsed
                ? CHANGE_REQUEST_BONUS
                : 0,
            activationDistance:
              state.hole
                .appealActivationDistance ===
              null
                ? null
                : Number(
                    state.hole
                      .appealActivationDistance.toFixed(
                        2,
                      ),
                  ),
            document:
              state.hole.appealDocument
                ? {
                    code:
                      state.hole
                        .appealDocument.code,
                    x: Number(
                      state.hole
                        .appealDocument.x.toFixed(
                          2,
                        ),
                    ),
                    y: Number(
                      state.hole
                        .appealDocument.y.toFixed(
                          2,
                        ),
                    ),
                  }
                : null,
            counterplay:
              "file Interact during a close chase to trade the unfiled-change escape bonus for a short mandatory Joe review; keep moving because point-blank contact still captures",
          },
          statusRequest: {
            code:
              state.hole.statusRequest.code,
            label:
              state.hole.statusRequest.label,
            request:
              state.hole.statusRequest.request,
            issued:
              state.hole.statusRequest.issued,
            active:
              state.hole.statusRequest.active,
            resolved:
              state.hole.statusRequest.resolved,
            outcome:
              state.hole.statusRequest.outcome,
            countdownSeconds: Number(
              state.hole.statusRequest.timer.toFixed(2),
            ),
            responseProgressPercent: Math.round(
              clamp(
                state.hole.statusRequest.responseProgress /
                  state.hole.statusRequest.responseDuration,
                0,
                1,
              ) * 100,
            ),
            responseSeconds:
              state.hole.statusRequest.responseDuration,
            responseCancels:
              state.hole.statusRequest.responseCancels,
            location:
              state.hole.statusRequest.location
                ? {
                    ...state.hole.statusRequest.location,
                  }
                : null,
            input:
              state.hole.statusRequest.active
                ? inputCopy(
                    `press ${keyboardBindingLabel("interact")}, then stay still`,
                    "press A and stay still",
                    "tap Use and stay still",
                  )
                : null,
            options: {
              acknowledge:
                "hold still for 1.15 seconds; earn a Delivery beat and share a rough location ping",
              ignore:
                "allow the deadline to expire; Joe escalates to a longer, more precise sector search",
            },
            onePerRun: true,
          },
          sprintReviews: {
            cleared:
              state.hole.reviewsCleared.length,
            total:
              activeSprintReviews().length,
            filingReductionSeconds:
              Number(
                state.hole.filingReduction.toFixed(
                  2,
                ),
              ),
            reward:
              "one golf ball plus shorter final filing",
            risk:
              "review bell redirects Joe unless he is already chasing",
            gates:
              activeSprintReviews().map(
                (review) => ({
                  id: review.id,
                  code: review.code,
                  x: review.x,
                  y: review.y,
                  radius: review.radius,
                  cleared:
                    sprintReviewCleared(
                      review,
                    ),
                  distance:
                    Number(
                      worldDistance(
                        state.player,
                        review,
                      ).toFixed(2),
                    ),
                }),
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
                  practiceHit:
                    ball.practiceHit === true,
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
          practiceDrill: {
            active:
              practiceDrillActive(),
            completed:
              state.hole.practiceDrill
                .completed,
            reclaimed:
              state.hole.practiceDrill
                .reclaimed,
            stage:
              state.hole.practiceDrill
                .stage,
            target: {
              x:
                state.hole.practiceDrill
                  .target.x,
              y:
                state.hole.practiceDrill
                  .target.y,
              radius:
                state.hole.practiceDrill
                  .target.radius,
              distance: Number(
                worldDistance(
                  state.player,
                  state.hole.practiceDrill
                    .target,
                ).toFixed(2),
              ),
            },
            attempts:
              state.hole.practiceDrill
                .attempts,
            misses:
              state.hole.practiceDrill
                .misses,
            landedBallId:
              state.hole.practiceDrill
                .landedBallId,
            optional: true,
            skipRule:
              `Move beyond ${TEE_PRACTICE_EXIT_Y}m or start a quick rematch.`,
            lesson:
              "Aim, land inside the bell ring, observe Joe investigate, then reclaim the marked ball when safe.",
          },
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
          crosswind: {
            phase:
              state.hole.crosswind.phase,
            secondsRemaining: Number(
              state.hole.crosswind.timer.toFixed(2),
            ),
            direction:
              crosswindDirectionLabel().toLowerCase(),
            strength: Number(
              crosswindStrength().toFixed(2),
            ),
            masksFootsteps:
              crosswindMasksFootsteps(
                state.hole.environment ||
                  getPlayerEnvironmentState(),
              ),
            noiseMultiplier:
              CROSSWIND_NOISE_MULTIPLIER,
            sandException: true,
            pursuitException: true,
            sightlinesRemainActive: true,
            turfTracksRemainActive: true,
            currentTraverseMeters: Number(
              state.hole.crosswind.currentDistance.toFixed(2),
            ),
            traverseTargetMeters:
              CROSSWIND_RUN_DISTANCE,
            windRuns:
              state.hole.crosswind.windRuns,
            scoredWindRunCap:
              DELIVERY_FAMILY_CAPS.weather,
            maskedSeconds: Number(
              state.hole.crosswind.maskedSeconds.toFixed(2),
            ),
            maskedDistance: Number(
              state.hole.crosswind.totalMaskedDistance.toFixed(2),
            ),
            eventCount:
              state.hole.crosswind.eventCount,
            lastOutcome:
              state.hole.crosswind.lastOutcome,
            rule:
              "After a readable warning, a 4.4-second gust reduces non-sand movement noise to 42%; cross 30 meters before it fades for a capped Weather-family Delivery beat. Joe can still see movement and later inspect tracks, while active pursuit receives no masking.",
          },
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
            footfallResponse: {
              alive:
                state.hole
                  .groundResponses.length,
              cap:
                MAX_PLAYER_GROUND_RESPONSES,
              totalSteps:
                state.hole
                  .playerStepSerial,
              currentSurface:
                (
                  state.hole
                    .groundResponses[
                    state.hole
                      .groundResponses
                      .length - 1
                  ]
                )?.kind || null,
              layers: [
                "ground_compression",
                "surface_specific_debris",
                "dew_or_water_displacement",
              ],
              motion:
                state.reducedMotion
                  ? "static_imprint_fade"
                  : "projected_footfall_burst",
            },
            trailInvestigation: {
              chain:
                state.hole.trailChain,
              chainSecondsRemaining:
                Number(
                  state.hole
                    .trailChainTimer.toFixed(
                      2,
                    ),
                ),
              discoveryCooldownSeconds:
                Number(
                  state.hole
                    .trailDiscoveryCooldown.toFixed(
                      2,
                    ),
                ),
              approachingEvidence:
                Boolean(
                  state.hole
                    .trailTarget &&
                  state.hole
                    .trailApproachTimer >
                    0,
                ),
              target:
                state.hole.trailTarget
                  ? {
                      markId:
                        state.hole
                          .trailTarget
                          .markId,
                      x: Number(
                        state.hole
                          .trailTarget.x.toFixed(
                            1,
                          ),
                      ),
                      y: Number(
                        state.hole
                          .trailTarget.y.toFixed(
                            1,
                          ),
                      ),
                    }
                  : null,
              successfulBreaks:
                state.hole.trailBreaks,
              bestBrokenChain:
                state.hole.bestTrailBreak,
              coldWindowSeconds:
                Number(
                  state.hole
                    .trailColdTimer.toFixed(
                      2,
                    ),
                ),
              breakThreshold:
                TRAIL_BREAK_MIN_CHAIN,
              deliveryBonus:
                TRAIL_BREAK_BONUS,
              deliveryFamilyCap:
                DELIVERY_FAMILY_CAPS
                  .evidence,
              rule:
                "Joe checks one physical print at a time; breaking a chain of three or more outside active pursuit grants a capped Evidence Denied recovery beat.",
            },
            recentJoeCut:
              (
                state.hole.environment ||
                getPlayerEnvironmentState()
              ).recentJoeCut
                ? {
                    distance: Number(
                      (
                        state.hole
                          .environment ||
                        getPlayerEnvironmentState()
                      ).recentJoeCutDistance.toFixed(
                        2,
                      ),
                    ),
                    ageSeconds: Number(
                      (
                        state.hole
                          .environment ||
                        getPlayerEnvironmentState()
                      ).recentJoeCut.age.toFixed(
                        2,
                      ),
                    ),
                    freshness:
                      joeCutFreshness(
                        (
                          state.hole
                            .environment ||
                          getPlayerEnvironmentState()
                        ).recentJoeCut,
                      ),
                    headingRadians: Number(
                      (
                        state.hole
                          .environment ||
                        getPlayerEnvironmentState()
                      ).recentJoeCut.heading.toFixed(
                        3,
                      ),
                    ),
                    visibleInListeningFocus:
                      state.hole.focus,
                    maxAgeSeconds:
                      JOE_CUT_CLUE_MAX_AGE,
                    maxDistance:
                      JOE_CUT_CLUE_MAX_DISTANCE,
                  }
                : null,
            cutTrace: {
              scanSeconds:
                CUT_TRACE_SCAN_SECONDS,
              scanProgress: Number(
                clamp(
                  state.hole
                    .cutTraceProgress /
                    CUT_TRACE_SCAN_SECONDS,
                  0,
                  1,
                ).toFixed(2),
              ),
              candidateMarkId:
                state.hole
                  .cutTraceCandidateId,
              locks:
                state.hole
                  .cutTraceLocks,
              loggedMarks:
                state.hole
                  .cutTraceLoggedIds
                  .length,
              counterRoutes:
                state.hole
                  .counterRoutes,
              quietLaneSeconds:
                Number(
                  state.hole
                    .counterRouteQuietTimer.toFixed(
                      2,
                    ),
                ),
              memory:
                state.hole
                    .cutTraceMemory
                  ? {
                      markId:
                        state.hole
                          .cutTraceMemory
                          .markId,
                      secondsRemaining:
                        Number(
                          state.hole
                            .cutTraceMemory
                            .timer.toFixed(
                              2,
                            ),
                        ),
                      durationSeconds:
                        state.hole
                          .cutTraceMemory
                          .duration,
                      freshness:
                        state.hole
                          .cutTraceMemory
                          .freshness,
                      headingRadians:
                        Number(
                          state.hole
                            .cutTraceMemory
                            .heading.toFixed(
                              3,
                            ),
                        ),
                      counterDistance:
                        Number(
                          state.hole
                            .cutTraceMemory
                            .counterDistance.toFixed(
                              2,
                            ),
                        ),
                      counterAlignment:
                        Number(
                          state.hole
                            .cutTraceMemory
                            .counterAlignment.toFixed(
                              2,
                            ),
                        ),
                      resolved:
                        state.hole
                          .cutTraceMemory
                          .resolved,
                      visibleAfterFocus:
                        !state.hole
                          .focus,
                    }
                  : null,
              rule:
                "Hold Listening Focus continuously on an unlogged recent cut, then travel 12m at least 62% against Joe's historical heading before memory expires to earn a brief Quiet Lane; each cut can be logged once.",
            },
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
          stealthManeuver: {
            id: "blindside_transfer",
            ready:
              !state.hole
                .blindsideTransfer &&
              blindsideWindowEligible(
                blindsideShelterState(
                  state.hole
                    .environment ||
                    getPlayerEnvironmentState(),
                ),
              ),
            completed:
              state.hole
                .blindsideTransfers,
            cooldownSeconds:
              Number(
                state.hole
                  .blindsideTransferCooldown.toFixed(
                    2,
                  ),
              ),
            currentShelter:
              blindsideShelterState(
                state.hole
                  .environment ||
                  getPlayerEnvironmentState(),
              ).id,
            laneStatus:
              state.hole
                .blindsideTransfer
                ? "active"
                : state.hole
                    .blindsidePreview
                    ?.options?.length >
                    0
                  ? "preview"
                  : "none",
            coverLanes:
              (
                state.hole
                  .blindsideTransfer
                  ?.destinations ||
                state.hole
                  .blindsidePreview
                  ?.options ||
                []
              ).map(
                (
                  option,
                  index,
                ) => ({
                  priority:
                    index === 0
                      ? "primary"
                      : "alternate",
                  id: option.id,
                  label:
                    option.label,
                  kind:
                    option.kind ||
                    "hard_cover",
                  requiresCrouch:
                    Boolean(
                      option.requiresCrouch,
                    ),
                  completionRequirement:
                    option.requiresCrouch
                      ? "hold_crouch_in_effective_rough_until_concealment_reaches_0.56"
                      : "enter_line_of_sight_blocking_hard_cover",
                  x: Number(
                    option.x.toFixed(
                      2,
                    ),
                  ),
                  y: Number(
                    option.y.toFixed(
                      2,
                    ),
                  ),
                  distance: Number(
                    (
                      option.remainingDistance ??
                      option.distance
                    ).toFixed(2),
                  ),
                  visual:
                    "mint_world_ring_and_map_diamond",
                }),
              ),
            active:
              state.hole
                .blindsideTransfer
                ? {
                    secondsRemaining:
                      Number(
                        state.hole
                          .blindsideTransfer
                          .timer.toFixed(
                            2,
                          ),
                      ),
                    distance:
                      Number(
                        state.hole
                          .blindsideTransfer
                          .distance.toFixed(
                            2,
                          ),
                      ),
                    requiredDistance:
                      BLINDSIDE_TRANSFER_DISTANCE,
                    startShelter:
                      state.hole
                        .blindsideTransfer
                        .startShelterId,
                    joeFacingAlignment:
                      Number(
                        state.hole
                          .blindsideTransfer
                          .joeAlignment.toFixed(
                            2,
                          ),
                      ),
                    joeDistance:
                      Number(
                        state.hole
                          .blindsideTransfer
                          .joeDistance.toFixed(
                            2,
                          ),
                      ),
                    guidedCoverLanes:
                      state.hole
                        .blindsideTransfer
                        .destinations
                        .length,
                    primaryLaneKind:
                      state.hole
                        .blindsideTransfer
                        .destinations?.[0]
                        ?.kind ||
                      "hard_cover",
                    primaryRequiresCrouch:
                      Boolean(
                        state.hole
                          .blindsideTransfer
                          .destinations?.[0]
                          ?.requiresCrouch,
                      ),
                    concealment:
                      Number(
                        state.hole
                          .concealment.toFixed(
                            2,
                          ),
                      ),
                  }
                : null,
            deliveryBonus:
              BLINDSIDE_TRANSFER_BONUS,
            deliveryFamilyCap:
              DELIVERY_FAMILY_CAPS
                .maneuver,
            rule:
              "When Joe moves away, mint lanes preview safe destinations. Leave shelter, travel 14m, and enter different shelter within 5.5 seconds without triggering pursuit; rough lanes require crouching until concealment reaches 0.56.",
          },
          nerveHold: {
            id: "hold_your_nerve",
            armed:
              state.hole
                .nerveHold.armed,
            active:
              state.hole
                .nerveHold.active,
            progressPercent:
              Number(
                clamp(
                  state.hole
                    .nerveHold.progress /
                    NERVE_HOLD_SECONDS,
                  0,
                  1,
                ).toFixed(2),
              ),
            requiredSeconds:
              NERVE_HOLD_SECONDS,
            completions:
              state.hole
                .nerveHold.completions,
            runCap:
              DELIVERY_FAMILY_CAPS
                .nerve,
            cooldownSeconds:
              Number(
                state.hole
                  .nerveHold.cooldown.toFixed(
                    2,
                  ),
              ),
            interruptionGraceSeconds:
              NERVE_HOLD_GRACE_SECONDS,
            graceRemainingSeconds:
              Number(
                state.hole
                  .nerveHold.graceRemaining.toFixed(
                    2,
                  ),
              ),
            interruption:
              state.hole
                .nerveHold.interruption,
            exitWindowSeconds:
              Number(
                state.hole
                  .nerveHold.exitWindow.toFixed(
                    2,
                  ),
              ),
            exitLaneReady:
              Boolean(
                state.hole
                  .nerveHold.exitWindow > 0 &&
                state.hole
                  .blindsidePreview
                  ?.options?.length > 0,
              ),
            exitWindowPurpose:
              "temporarily_allow_mint_blindside_guidance_during_delivery_feedback_when_joe_is_moving_away_or_laterally",
            lastZone:
              state.hole
                .nerveHold.lastZone,
            joeDistance:
              state.hole
                .nerveHold.joeDistance,
            distanceWindow: {
              minimum:
                NERVE_HOLD_MIN_JOE_DISTANCE,
              maximum:
                NERVE_HOLD_MAX_JOE_DISTANCE,
            },
            blockedReason:
              state.hole
                .nerveHold.blockedReason,
            input:
              inputCopy(
                `${keyboardBindingLabel("crouch")} + ${keyboardBindingLabel("focus")}`,
                "LB + LT",
                "CROUCH + LISTEN",
              ),
            deliveryBonus:
              NERVE_HOLD_BONUS,
            rule:
              "While concealed in deep rough and Joe is searching 11-42m away without line of sight, stay still and hold crouch plus Listening Focus for 1.65 seconds. Brief sightline or range flicker freezes progress for up to 0.24 seconds; movement or sustained exposure resets it. Completion opens 4.4 seconds of mint Blindside guidance during reward feedback when Joe is moving away or laterally, without changing detection or movement. Each zone can score once, with two Nerve-family awards per run.",
          },
          cadenceRead: {
            id: "mower_cadence",
            armed:
              state.hole
                .cadenceRead.armed,
            active:
              state.hole
                .cadenceRead.active,
            progressPercent:
              Number(
                clamp(
                  state.hole
                    .cadenceRead.progress /
                    CADENCE_READ_SECONDS,
                  0,
                  1,
                ).toFixed(2),
              ),
            requiredSeconds:
              CADENCE_READ_SECONDS,
            completions:
              state.hole
                .cadenceRead.completions,
            runCap:
              DELIVERY_FAMILY_CAPS
                .cadence,
            cooldownSeconds:
              Number(
                state.hole
                  .cadenceRead.cooldown.toFixed(
                    2,
                  ),
              ),
            lastZone:
              state.hole
                .cadenceRead.lastZone,
            joeDistance:
              state.hole
                .cadenceRead.joeDistance,
            distanceWindow: {
              minimum:
                CADENCE_READ_MIN_JOE_DISTANCE,
              maximum:
                CADENCE_READ_MAX_JOE_DISTANCE,
            },
            blockedReason:
              state.hole
                .cadenceRead.blockedReason,
            forecast:
              state.hole
                .cadenceRead.forecast
                ? {
                    targetIndex:
                      state.hole
                        .cadenceRead
                        .forecast
                        .targetIndex,
                    target: {
                      x: Number(
                        state.hole
                          .cadenceRead
                          .forecast
                          .target.x.toFixed(
                            2,
                          ),
                      ),
                      y: Number(
                        state.hole
                          .cadenceRead
                          .forecast
                          .target.y.toFixed(
                            2,
                          ),
                      ),
                    },
                    targetZone:
                      state.hole
                        .cadenceRead
                        .forecast.zone,
                    secondsRemaining:
                      Number(
                        state.hole
                          .cadenceRead
                          .forecast.timer.toFixed(
                            2,
                          ),
                      ),
                    durationSeconds:
                      state.hole
                        .cadenceRead
                        .forecast.duration,
                    path:
                      state.hole
                        .cadenceRead
                        .forecast.path.map(
                          (point) => ({
                            x: Number(
                              point.x.toFixed(
                                2,
                              ),
                            ),
                            y: Number(
                              point.y.toFixed(
                                2,
                              ),
                            ),
                          }),
                        ),
                    revocation:
                      "expires_or_joe_leaves_patrol",
                  }
                : null,
            input:
              inputCopy(
                `${keyboardBindingLabel("crouch")} + ${keyboardBindingLabel("focus")}`,
                "LB + LT",
                "CROUCH + LISTEN",
              ),
            deliveryBonus:
              CADENCE_READ_BONUS,
            deliveryFamilyCap:
              DELIVERY_FAMILY_CAPS
                .cadence,
            gameplayEffect:
              "information_only",
            rule:
              "While concealed and Joe patrols 34-118m away, stay crouched and still with Listening Focus for 1.25 seconds. Success snapshots Joe's immediate collision-aware patrol path for seven seconds in the world and map; movement, detection, speed, and pathing are unchanged. Each zone can score once, with three Cadence-family awards per run.",
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
            director: {
              pressure: Number(
                state.hole
                  .tensionDirector
                  .pressure.toFixed(2),
              ),
              quietSeconds: Number(
                state.hole
                  .tensionDirector
                  .quietSeconds.toFixed(
                    2,
                  ),
              ),
              beatSeconds: Number(
                state.hole
                  .tensionDirector
                  .beatTimer.toFixed(2),
              ),
              reliefSeconds: Number(
                state.hole
                  .tensionDirector
                  .reliefSeconds.toFixed(
                    2,
                  ),
              ),
              lastBeat:
                state.hole
                  .tensionDirector
                  .lastBeat,
              warnings:
                state.hole
                  .tensionDirector
                  .warningCount,
              intercepts:
                state.hole
                  .tensionDirector
                  .interceptCount,
              cancelledIntercepts:
                state.hole
                  .tensionDirector
                  .cancelledIntercepts,
              pendingIntercept:
                state.hole
                  .tensionDirector
                  .pendingIntercept
                  ? {
                      x: Number(
                        state.hole
                          .tensionDirector
                          .pendingIntercept.x.toFixed(
                            2,
                          ),
                      ),
                      y: Number(
                        state.hole
                          .tensionDirector
                          .pendingIntercept.y.toFixed(
                            2,
                          ),
                      ),
                      seconds: Number(
                        state.hole
                          .tensionDirector
                          .pendingIntercept.seconds.toFixed(
                            2,
                          ),
                      ),
                    }
                  : null,
              rule:
                "Long quiet stretches build course pressure; warned off-screen service-gate intercepts can move Joe ahead, while active pursuit and contact breaks suspend the director.",
            },
            horrorDirector: {
              intensity: Number(
                state.hole
                  .horrorDirector
                  .intensity.toFixed(2),
              ),
              nextEventSeconds: Number(
                state.hole
                  .horrorDirector
                  .eventTimer.toFixed(2),
              ),
              lastEvent:
                state.hole
                  .horrorDirector
                  .lastEvent,
              activeManifestation:
                state.hole
                  .horrorDirector
                  .manifestation
                  ? {
                      type:
                        state.hole
                          .horrorDirector
                          .manifestation.type,
                      side:
                        state.hole
                          .horrorDirector
                          .manifestation.side < 0
                          ? "left"
                          : "right",
                      seconds: Number(
                        state.hole
                          .horrorDirector
                          .manifestation.seconds.toFixed(
                            2,
                          ),
                      ),
                      collision:
                        "none_peripheral_hallucination",
                    }
                  : null,
              fogSurgeSeconds: Number(
                state.hole
                  .horrorDirector
                  .fogSurgeSeconds.toFixed(
                    2,
                  ),
              ),
              lightFailureSeconds: Number(
                state.hole
                  .horrorDirector
                  .lightFailureSeconds.toFixed(
                    2,
                  ),
              ),
              eventCounts: {
                apparitions:
                  state.hole
                    .horrorDirector
                    .apparitionCount,
                fogSurges:
                  state.hole
                    .horrorDirector
                    .fogSurgeCount,
                lightFailures:
                  state.hole
                    .horrorDirector
                    .lightFailureCount,
              },
              fairness:
                "Apparitions never collide; fog remains behind entities; light failures lower exposure while objective markers and HUD stay fully rendered.",
            },
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
          hudPresentation: {
            focus:
              activeHudPresentationFocus(),
            riskPremiumVisible:
              Boolean(
                state.hole.riskAward,
              ),
            deliveryQueued:
              Boolean(
                (
                  state.hole.riskAward &&
                  state.hole.deliveryAward
                ) ||
                state.hole
                  .deliveryAwardQueue.length >
                  0,
              ),
            deliveryVisible:
              Boolean(
                !state.hole.riskAward &&
                state.hole.deliveryAward,
              ),
            joeStateVisible:
              Boolean(
                state.hole
                    .stateBannerTimer > 0 &&
                state.hole.stateBanner &&
                !state.hole.riskAward &&
                !state.hole
                  .deliveryAward,
              ),
            maximumThreatCaptionCards:
              (
                activeHudPresentationFocus() ===
                  "pursuit" ||
                activeHudPresentationFocus() ===
                  "blindside_transfer" ||
                activeHudPresentationFocus() ===
                  "emergency_appeal" ||
                activeHudPresentationFocus() ===
                  "status_request"
              )
                ? 0
                : activeHudPresentationFocus() ===
                    "field"
                  ? 2
                  : 1,
            joeBarkVisible:
              Boolean(
                state.hole
                    .joeBarkTimer > 0 &&
                state.hole.joeBark &&
                !state.hole.riskAward &&
                !state.hole
                  .deliveryAward &&
                activeHudPresentationFocus() !==
                  "trail_evidence" &&
                activeHudPresentationFocus() !==
                  "emergency_appeal" &&
                activeHudPresentationFocus() !==
                  "status_request",
              ),
          },
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
              approach:
                state.hole
                  .navigationGuide
                  .approach
                  ? {
                      x: Number(
                        state.hole
                          .navigationGuide
                          .approach.x.toFixed(
                            2,
                          ),
                      ),
                      y: Number(
                        state.hole
                          .navigationGuide
                          .approach.y.toFixed(
                            2,
                          ),
                      ),
                      clearance: Number(
                        state.hole
                          .navigationGuide
                          .approach.clearance.toFixed(
                            2,
                          ),
                      ),
                    }
                  : null,
              targetInReach:
                Boolean(
                  state.hole
                    .navigationGuide
                    .target &&
                    state.hole
                      .navigationGuide
                      .distance <
                      state.hole
                        .navigationGuide
                        .target.radius,
                ),
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
            cloudMoonlight: (() => {
              const progress = clamp(
                state.player.y /
                  COURSE_LENGTH,
                0,
                1,
              );
              const moonlight =
                courseMoonlightState(
                  progress,
                  courseLocomotionState()
                    .bob,
                );
              return {
                coverage: Number(
                  moonlight.coverage.toFixed(
                    3,
                  ),
                ),
                intensity: Number(
                  moonlight.intensity.toFixed(
                    3,
                  ),
                ),
                coveringClouds:
                  moonlight.coveringClouds,
                motion:
                  moonlight.motion,
                gameplayEffect:
                  moonlight.gameplayEffect,
                protectedLayers: [
                  "hud",
                  "objective_markers",
                  "interaction_prompts",
                  "collision_cues",
                  "stealth_exposure",
                ],
              };
            })(),
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
                  "estate_perimeter",
                depth:
                  "far_architectural_horizon",
                source:
                  "dedicated_imagegen_panorama",
                landmarks: [
                  "pine_clusters",
                  "tudor_villas",
                  "water_tower",
                  "maintenance_sheds",
                  "perimeter_fence",
                ],
                motion:
                  state.reducedMotion
                    ? "static"
                    : "slow_independent_parallax",
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
                  "near_canopy_shoulders",
                depth:
                  "near_horizon_frame",
                placement:
                  "left_and_right_visual_anchors",
                motion:
                  state.reducedMotion
                    ? "static"
                    : "stronger_parallax_and_tree_sway",
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
            depthDesign: {
              planeCount: 10,
              lateralResponse:
                "celestial_0.02_to_ground_0.58_with_near_canopy_0.34",
              forwardResponse:
                "progressive_scale_and_vertical_separation_by_depth",
              reducedMotion:
                "all_planes_retain_depth_offsets_without_ambient_drift",
            },
            groundedFeatureArt: {
              courseSigns:
                "dedicated_six_cell_pixel_art_atlas_with_runtime_labels",
              sandTraps: {
                source:
                  "dedicated_five_cell_imagegen_atlas",
                authoredVariants:
                  BUNKER_ATLAS_SOURCES.length,
                coursePlacements:
                  BUNKER_SAND_ZONES.length,
                projection:
                  "authoritative_terrain_zone_with_irregular_alpha_silhouette",
                detailLayers: [
                  "ground_contact_shadow",
                  "authored_sod_lip",
                  "unique_rake_and_footprint_story",
                  "moon_wash",
                  "wet_sand_pooling",
                  "granular_scatter",
                  "edge_grass_tufts",
                  "windblown_sand",
                ],
                reducedMotion:
                  "static_sand_detail_without_drift",
              },
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
              ornamentalVerge: {
                source:
                  "dedicated_six_cell_imagegen_atlas",
                variants:
                  COURSE_VERGE_CELLS.length,
                placements:
                  COURSE_VERGE.length,
                projection:
                  "depth_sorted_world_perspective",
                collision:
                  "none_margin_botanical_dressing",
                motion:
                  state.reducedMotion
                    ? "static"
                    : "base_anchored_micro_sway_and_proximity_bend",
                detailLayers: [
                  "ground_contact_shadow",
                  "authored_moonlit_foliage",
                  "bounded_dew_glints",
                  "zone_specific_botanical_progression",
                  "player_and_mower_proximity_response",
                ],
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
          horrorEffects: {
            groundFog: {
              zone:
                groundFogState().zone,
              density:
                Number(
                  groundFogState()
                    .density.toFixed(
                      2,
                    ),
                ),
              surge: Number(
                groundFogState()
                  .surge.toFixed(2),
              ),
              visibleLayers:
                groundFogState()
                  .visibleLayers,
              motion:
                groundFogState().motion,
              placement:
                "ground_plane_behind_obstacles_and_characters",
              purpose:
                "persistent zone-colored mist establishes depth, cold air, and escalating threat without hiding navigation",
            },
            mowerThreatRipples: {
              active:
                threatAtmosphereState()
                  .distance <= 146 &&
                threatAtmosphereState()
                  .pressure >= 0.08,
              joeDistance:
                Number(
                  threatAtmosphereState()
                    .distance.toFixed(
                      2,
                    ),
                ),
              pressure:
                Number(
                  threatAtmosphereState()
                    .pressure.toFixed(
                      2,
                    ),
                ),
              purpose:
                "ground shockwaves reveal mower direction and escalation before Joe is fully visible",
            },
            playerBreath: {
              active:
                [
                  "water_hazard",
                  "dead_green",
                  "night_range",
                  "release_corridor",
                ].includes(
                  courseZoneAt(
                    state.player.y,
                  ).id,
                ) ||
                threatAtmosphereState()
                  .pressure >= 0.18,
              reactsTo: [
                "cold_zone",
                "joe_proximity",
                "listening_focus",
              ],
            },
            spectralFigures: {
              placements: 5,
              collision:
                "none_atmospheric_only",
              vanishRangeMeters: 34,
              maximumVisibleRangeMeters: 126,
            },
            nightRangePowerCascade: {
              lights: 3,
              powers:
                COURSE_OBSTACLES.filter(
                  (obstacle) =>
                    obstacle.id.startsWith(
                      "range-light",
                    ),
                ).map(
                  (
                    obstacle,
                    index,
                  ) =>
                    Number(
                      floodlightPowerAt(
                        obstacle,
                        COURSE_OBSTACLES.indexOf(
                          obstacle,
                        ),
                      ).toFixed(
                        2,
                      ),
                    ),
                ),
              gameplayEffect:
                "individual brownouts reduce actual light exposure and detection pressure",
            },
            releaseBeacon: {
              active:
                courseZoneAt(
                  state.player.y,
                ).id ===
                  "release_corridor" ||
                worldDistance(
                  state.player,
                  SHED_EXIT,
                ) <= 145,
              purpose:
                "diegetic final-route landmark with rotating emergency wash",
            },
            threatRefraction: {
              active:
                threatAtmosphereState()
                  .pressure >= 0.12,
              direction:
                threatAtmosphereState()
                  .direction < -0.1
                  ? "left"
                  : threatAtmosphereState()
                        .direction >
                      0.1
                    ? "right"
                    : "center",
              reducedMotion:
                state.reducedMotion
                  ? "static_directional_edge_wash"
                  : "directional_mower_wash_with_restrained_chromatic_interference",
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
            coursePressureMultiplier:
              Number(
                joeCoursePressureMultiplier().toFixed(
                  3,
                ),
              ),
            wet: state.hole.joe.wet,
            sand:
              state.hole.joe.sand,
            distance: Math.round(worldDistance(state.hole.joe, state.player)),
            hasLineOfSight: state.hole.hasLineOfSight,
            lineBlockedBy: state.hole.lineBlockedBy,
            lostSightSeconds: Number(state.hole.lostSightTimer.toFixed(2)),
            searchSecondsRemaining: Number(state.hole.searchTimer.toFixed(2)),
            listeningSearchRead: (() => {
              const read =
                listeningSearchRead();
              return {
                active: read.active,
                requiresFocus: true,
                maximumJoeDistance:
                  read.maximumDistance,
                movementTrend:
                  read.active
                    ? read.trend
                    : null,
                movementAlignment:
                  read.active
                    ? Number(
                        read.alignment.toFixed(
                          2,
                        ),
                      )
                    : null,
                locus: read.active
                  ? {
                      kind:
                        read.locusKind,
                      x: Math.round(
                        read.locus.x,
                      ),
                      y: Math.round(
                        read.locus.y,
                      ),
                      distance: Math.round(
                        read.locusDistance,
                      ),
                      searchSecondsRemaining:
                        Number(
                          read.secondsRemaining.toFixed(
                            2,
                          ),
                        ),
                    }
                  : null,
                purpose:
                  "turn_search_waiting_into_a_tactical_read_without_changing_joe_detection_speed_or_pathing",
              };
            })(),
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
      firstHole: `${keyboardMovementCopy()} move; ${keyboardBindingLabel("sprint")} sprints; hold ${keyboardBindingLabel("crouch")} to crouch; hold ${keyboardBindingLabel("focus")} for Listening Focus; bunker sand slows both player and mower but leaves loud tracks; ${keyboardBindingLabel("interact")} interacts, answers a Status Request while standing still, reclaims a ball, starts Final Filing, or sacrifices a carried Change Request as an Emergency Appeal during close pursuit; movement aborts filing or a status response; hold ${keyboardBindingLabel("chip")} and use ${keyboardBindingLabel("move_left")}/${keyboardBindingLabel("move_right")} to aim, then release to chip; ${keyboardBindingLabel("controls")} shows controls; Escape cancels a shot or pauses`,
      pause: "Arrow keys select; Enter confirms; Escape resumes",
      result: "Left/right selects Rematch File, Next Order, or Clubhouse; Enter confirms; Escape returns to the Clubhouse",
      keyboard: {
        global: "F fullscreen",
        gate: "Click, Enter, or Space",
        intro: "Click, Enter, Space, or Escape to skip",
        menu: "Up/down and Enter, or pointer; after filing all Change Requests, left/right selects a Night Order; R toggles Overtime Audit after mastery",
        firstHole: `${keyboardMovementCopy()} move; ${keyboardBindingLabel("sprint")} sprints; hold ${keyboardBindingLabel("crouch")} to crouch; hold ${keyboardBindingLabel("focus")} for Listening Focus; bunker sand slows both player and mower but leaves loud tracks; ${keyboardBindingLabel("interact")} interacts, answers a Status Request while standing still, reclaims a ball, starts Final Filing, or sacrifices a carried Change Request as an Emergency Appeal during close pursuit; movement aborts filing or a status response; hold ${keyboardBindingLabel("chip")} and use ${keyboardBindingLabel("move_left")}/${keyboardBindingLabel("move_right")} to aim, then release to chip; ${keyboardBindingLabel("controls")} shows controls; Escape cancels a shot or pauses`,
        pause: "Arrow keys select; Enter confirms; Escape resumes",
        result: "Left/right selects Rematch File, Next Order, or Clubhouse; Enter confirms; Escape returns to the Clubhouse",
      },
      gamepad: {
        menu: "D-pad up/down selects menu items; after filing all Change Requests, D-pad left/right selects a Night Order; A confirms; RB toggles Overtime Audit after mastery; B returns",
        firstHole: "Left stick or D-pad moves; RT sprints; LB crouches; LT listens; bunker sand slows both player and mower but leaves loud tracks; A interacts, answers a Status Request while standing still, reclaims a ball, starts Final Filing, or sacrifices a carried Change Request as an Emergency Appeal during close pursuit; movement aborts filing or a status response; hold X and use the left stick to aim, then release to chip; Y shows controls; B cancels a shot; Start pauses",
        pause: "D-pad selects; A confirms; B or Start resumes",
        result: "D-pad left/right selects Rematch File, Next Order, or Clubhouse; A confirms; B returns to the Clubhouse",
      },
      touch: {
        gate: "Tap to begin",
        intro: "Tap to skip",
        menu: "Tap menu items directly; after filing all Change Requests, tap a Night Order dossier; tap the Overtime card after mastery",
        firstHole: "Drag the left pad to move; hold Run while moving to sprint; hold Crouch or Listen for stealth information; tap Use to interact, answer a Status Request while standing still, reclaim a ball, start Final Filing, or sacrifice a carried Change Request as an Emergency Appeal during close pursuit; movement aborts filing or a status response; hold Chip, slide left or right to aim, and release to shoot; tap Pause to suspend the round",
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
    if (state.manualTime) {
      lastFrame = now;
      lastPresentedFrame = now;
      requestAnimationFrame(frame);
      return;
    }
    const presentationElapsed =
      now - lastPresentedFrame;
    if (
      presentationElapsed <
      TARGET_FRAME_MS -
        FRAME_PRESENTATION_TOLERANCE_MS
    ) {
      runtimePerformance
        .skippedFrames += 1;
      requestAnimationFrame(frame);
      return;
    }
    lastPresentedFrame =
      now -
      (
        presentationElapsed %
        TARGET_FRAME_MS
      );
    recordPresentationPerformance(
      presentationElapsed,
    );
    update((now - lastFrame) / 1000);
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
  estatePerimeterArt.addEventListener("load", render);
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
  courseVergeArt.addEventListener(
    "load",
    render,
  );
  const atlasPrimeQueue = [];
  let atlasPrimeScheduled = false;

  function scheduleNextAtlasPrime() {
    if (
      atlasPrimeScheduled ||
      atlasPrimeQueue.length === 0
    ) {
      return;
    }
    atlasPrimeScheduled = true;
    const work = (deadline = null) => {
      atlasPrimeScheduled = false;
      let completed = 0;
      while (
        atlasPrimeQueue.length > 0 &&
        completed < 2 &&
        (
          !deadline ||
          deadline.didTimeout ||
          deadline.timeRemaining() > 3
        )
      ) {
        const task =
          atlasPrimeQueue.shift();
        cachedAtlasCell(
          task.image,
          task.cell,
        );
        completed += 1;
      }
      scheduleNextAtlasPrime();
    };
    if (
      "requestIdleCallback" in
      window
    ) {
      window.requestIdleCallback(
        work,
        { timeout: 2500 },
      );
    } else {
      window.setTimeout(
        () => work(),
        80,
      );
    }
  }

  function scheduleAtlasCachePriming(
    image,
    cells,
  ) {
    const prime = () => {
      for (
        let index = 0;
        index < cells.length;
        index += 1
      ) {
        atlasPrimeQueue.push({
          image,
          cell: cells[index],
        });
      }
      scheduleNextAtlasPrime();
    };
    if (
      image.complete &&
      image.naturalWidth > 0
    ) {
      prime();
    } else {
      image.addEventListener(
        "load",
        prime,
        { once: true },
      );
    }
  }
  scheduleAtlasCachePriming(
    courseObstacleArt,
    COURSE_OBSTACLE_CELLS,
  );
  scheduleAtlasCachePriming(
    expandedCourseArt,
    EXPANDED_OBSTACLE_CELLS,
  );
  scheduleAtlasCachePriming(
    deadGreenSceneryArt,
    DEAD_GREEN_SCENERY_CELLS,
  );
  scheduleAtlasCachePriming(
    courseClutterArt,
    COURSE_CLUTTER_CELLS,
  );
  scheduleAtlasCachePriming(
    courseVergeArt,
    COURSE_VERGE_CELLS,
  );
  scheduleAtlasCachePriming(
    bunkerAtlasArt,
    BUNKER_ATLAS_SOURCES,
  );
  requestAnimationFrame(frame);
})();
