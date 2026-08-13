import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolsDirectory, "..");
const webRoot = path.join(repositoryRoot, "web");
const failures = [];
const warnings = [];

function requireCondition(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function readUtf8(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function collectRuntimeAssetReferences(...sources) {
  const references = new Set();
  const pattern = /["'](?:\.\/)?assets\/([^"']+\.(?:png|webp|avif))["']/gu;
  for (const source of sources) {
    for (const match of source.matchAll(pattern)) {
      references.add(match[1]);
    }
  }
  return [...references].sort();
}

function pngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  const signature = "89504e470d0a1a0a";
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== signature) {
    return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function runSyntaxCheck(relativePath) {
  const result = spawnSync(process.execPath, ["--check", relativePath], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  requireCondition(
    result.status === 0,
    `${relativePath} failed node --check: ${result.stderr.trim()}`,
  );
}

async function verifyPublishedSite(rawUrl) {
  const baseUrl = new URL(rawUrl.endsWith("/") ? rawUrl : `${rawUrl}/`);
  const releaseToken = Date.now().toString(36);
  const indexResponse = await fetch(new URL(`?verify=${releaseToken}`, baseUrl));
  requireCondition(indexResponse.ok, `Published index returned ${indexResponse.status}.`);
  const publishedIndex = await indexResponse.text();
  requireCondition(publishedIndex.includes("game-status"), "Published index is missing the accessible live-status node.");

  const gameResponse = await fetch(new URL(`game.js?verify=${releaseToken}`, baseUrl));
  requireCondition(gameResponse.ok, `Published game.js returned ${gameResponse.status}.`);
  const publishedGame = await gameResponse.text();
  requireCondition(publishedGame.includes("gameplayAssetSummary"), "Published game.js is missing staged asset loading.");
  requireCondition(publishedGame.includes("highContrastNavigation"), "Published game.js is missing high-contrast route support.");

  for (const asset of [
    "assets/rough-cut-opening.png",
    "assets/rough-cut-course-ground-v4.png",
    "assets/rough-cut-night-order-objectives-v1.png",
  ]) {
    const response = await fetch(new URL(`${asset}?verify=${releaseToken}`, baseUrl));
    requireCondition(response.ok, `Published ${asset} returned ${response.status}.`);
  }
}

const indexHtml = readUtf8("web/index.html");
const stylesCss = readUtf8("web/styles.css");
const gameJs = readUtf8("web/game.js");
const dialogueJs = readUtf8("web/joe-dialogue.js");
const productClosure = readUtf8("qa/product-enhancement-closure-2026-08-08.md");
const releaseAcceptance = readUtf8("qa/release-acceptance-gates-2026-08-13.md");

runSyntaxCheck("web/game.js");
runSyntaxCheck("web/joe-dialogue.js");

requireCondition(indexHtml.includes('rel="canonical"'), "index.html is missing a canonical URL.");
requireCondition(indexHtml.includes('property="og:image"'), "index.html is missing Open Graph imagery.");
requireCondition(indexHtml.includes('aria-describedby="game-instructions game-status"'), "The canvas is not connected to its instructions and live status.");
requireCondition(indexHtml.includes('fetchpriority="high"'), "Opening art is not explicitly prioritized.");
requireCondition(stylesCss.includes("#game:focus-visible"), "The canvas is missing a visible keyboard focus treatment.");
requireCondition(stylesCss.includes(".visually-hidden"), "Screen-reader-only status styling is missing.");
requireCondition(gameJs.includes('maxConcurrentLoads: 4'), "The bounded asset loader is missing or has changed unexpectedly.");
requireCondition(gameJs.includes("beginGameplayPerformanceWindow"), "Gameplay performance-window isolation is missing.");
requireCondition(gameJs.includes("highContrastNavigation"), "High-contrast route support is missing.");
requireCondition(gameJs.includes("effectsDensity"), "Atmosphere-density control is missing.");
requireCondition(
  gameJs.includes("pursuitIntensity") &&
    gameJs.includes("joePursuitIntensityMultiplier") &&
    gameJs.includes("pursuit_intensity_player_choice") &&
    gameJs.includes("pursuitIntensityHelpPresentation") &&
    gameJs.includes("pursuit_intensity_help_clarity"),
  "The persisted Steady / Standard / Relentless Joe-pressure setting is missing.",
);
requireCondition(gameJs.includes("audit_rough_cut_readiness"), "The callable product-readiness audit is missing.");
requireCondition(gameJs.includes("zonePerformanceSummary"), "Per-zone render telemetry is missing.");
requireCondition(gameJs.includes("MAX_WORLD_EFFECTS"), "World effects are not explicitly bounded.");
requireCondition(gameJs.includes("MAX_SCREEN_PARTICLES"), "Screen particles are not explicitly bounded.");
requireCondition(gameJs.includes("visibilityAutoPauses"), "Hidden-tab lifecycle telemetry is missing.");
requireCondition(gameJs.includes("prefers-reduced-motion: reduce"), "System reduced-motion preference is not respected.");
requireCondition(gameJs.includes("product_owner_role_language"), "The Product Owner role-language readiness check is missing.");
requireCondition(
  gameJs.includes("controlRestoredImmediately") && gameJs.includes("compact_counterplan"),
  "The compact, immediate-control quick-retry contract is missing.",
);
requireCondition(
  gameJs.includes("adaptive_repeat_capture_coaching") && gameJs.includes("REPEAT_CAPTURE_COACHING"),
  "Adaptive repeat-capture coaching is missing.",
);
requireCondition(
  gameJs.includes("collisionRecoveryWaypoint") &&
    gameJs.includes("collision_guidance_handoff") &&
    gameJs.includes('"collision_escape_override"') &&
    gameJs.includes("NAVIGATION_COLLISION_RECOVERY_BOUNDARY_GUTTER") &&
    gameJs.includes('phase:\n            "clearance_followthrough"'),
  "The collision-to-objective route handoff is missing.",
);
requireCondition(
  gameJs.includes("collision_recovery_world_route_continuity") &&
    gameJs.includes("collisionRecoveryWorldRoutePresentation") &&
    gameJs.includes("drawCollisionRecoveryWorldRoute") &&
    gameJs.includes("short_collision_recovery_owns_one_near_field_route_until_clearance_then_objective_navigation_resumes"),
  "The short collision-recovery first-person route contract is missing.",
);
requireCondition(
  gameJs.includes("collision_feedback_identity_ownership") &&
    gameJs.includes("collisionStateBannerRelationship") &&
    gameJs.includes("stateBannerMatchingThreatCaption") &&
    gameJs.includes("one_physical_contact_one_visible_identity") &&
    gameJs.includes("collision_release_echo"),
  "The single-owner collision-feedback identity contract is missing.",
);
requireCondition(
  gameJs.includes("footing_escape_navigation_ownership") &&
    gameJs.includes("footingNavigationOverrideFromGuidance") &&
    gameJs.includes("activeFootingNavigationOverride") &&
    gameJs.includes("one_immediate_route_owner_short_horizon_before_long_horizon") &&
    gameJs.includes("suppress_objective_bearing_and_reflectors_until_footing_clears_then_resume_same_objective"),
  "The slow-footing immediate-route ownership contract is missing.",
);
requireCondition(
  gameJs.includes("footing_entry_signal_role_separation") &&
    gameJs.includes("footingHazardThreatCaptionSpec") &&
    gameJs.includes("footingHazardEntrySignalState") &&
    gameJs.includes("footing_entry_caption_tracks_joe_while_the_bottom_rail_and_world_route_track_the_safe_exit"),
  "The slow-footing threat-bearing and safe-route separation contract is missing.",
);
requireCondition(
  gameJs.includes("footing_escape_world_route_continuity") &&
    gameJs.includes("footingHazardRouteWorldSamples") &&
    gameJs.includes("clipFootingRouteSegment") &&
    gameJs.includes("edgeBridgeVisible") &&
    gameJs.includes("active_escape_starts_at_player_clips_wide_offscreen_segments_and_bridges_the_edge_turn_instead_of_dropping_the_route"),
  "The slow-footing first-person route-continuity contract is missing.",
);
requireCondition(
  gameJs.includes("footing_escape_post_clear_handoff") &&
    gameJs.includes("footingHazardRouteSuppressedAfterClear") &&
    gameJs.includes("recently_cleared_patch_yields_to_resumed_objective"),
  "The slow-footing post-clear objective handoff contract is missing.",
);
requireCondition(
  gameJs.includes("immediate_route_world_marker_ownership") &&
    gameJs.includes("immediateNavigationMarkerOwner") &&
    gameJs.includes("immediateRouteMarkerHierarchyPresentation") &&
    gameJs.includes("long_horizon_marker_deferred") &&
    gameJs.includes("distant_navigation_plaque_yields_while_physical_art_and_exact_use_footprint_remain") &&
    gameJs.includes("one_short_horizon_route_owns_navigation_plaques_without_hiding_physical_props_or_reachable_actions"),
  "The immediate-route world-marker ownership contract is missing.",
);
requireCondition(
  gameJs.includes("pause_immediate_route_action_continuity") &&
    gameJs.includes("immediateRouteActionPresentation") &&
    gameJs.includes("collision_clearance_owns_live_pause_and_settings_next_action_until_the_local_route_clears") &&
    gameJs.includes("slow_footing_escape_owns_live_pause_and_settings_next_action_until_full_speed_ground_returns") &&
    gameJs.includes("the_frozen_next_action_matches_the_visible_short_horizon_route_then_returns_to_the_preserved_objective_after_clearance"),
  "The pause immediate-route action-continuity contract is missing.",
);
requireCondition(
  gameJs.includes("rear_view_immediate_route_handoff") &&
    gameJs.includes("forwardImmediateRouteCameraPresentation") &&
    gameJs.includes("rearImmediateRouteHandoffPresentation") &&
    gameJs.includes("body_relative_forward_route_fades_before_rear_projection_then_returns_after_the_camera_faces_forward") &&
    gameJs.includes("rear_view_retires_mirrored_world_geometry_keeps_the_body_relative_route_on_the_map_and_names_the_release_handoff") &&
    gameJs.includes("rear_camera_never_mirrors_a_body_relative_forward_route_and_the_exact_local_decision_remains_available_until_forward_view_returns"),
  "The rear-view immediate-route camera handoff contract is missing.",
);
requireCondition(
  gameJs.includes("compact_survival_briefing_readability") &&
    gameJs.includes("tutorialBriefingViewportPresentation") &&
    gameJs.includes("drawCompactTutorialBriefing") &&
    gameJs.includes("compact_viewports_reduce_density_and_raise_critical_type_instead_of_miniaturizing_the_desktop_briefing") &&
    gameJs.includes("small_screens_receive_fewer_larger_instructions_while_desktop_keeps_the_full_visual_dossier"),
  "The compact Survival Briefing readability contract is missing.",
);
requireCondition(
  gameJs.includes("field_action_commitment_preview") &&
    gameJs.includes("fieldActionCommitmentPreview") &&
    gameJs.includes("loud_field_check_commitment") &&
    gameJs.includes("commitment_warning_precedes_activation_and_names_the_existing_counterplay") &&
    gameJs.includes("every_loud_mandatory_check_names_its_duration_and_existing_breakaway_cover_before_activation"),
  "The loud field-check pre-commitment warning contract is missing.",
);
requireCondition(
  gameJs.includes("loud_station_commitment_pressure_read") &&
    gameJs.includes("fieldActionCommitmentRiskPresentation") &&
    gameJs.includes("activeFieldActionCommitmentRisk") &&
    gameJs.includes("generated_station_pressure_label") &&
    gameJs.includes("current_joe_pressure_before_the_authored_loud_signal") &&
    gameJs.includes("pressure_informs_the_wait_or_commit_decision_rewards_long_range_diversion_and_never_removes_player_agency") &&
    gameJs.includes("the_loud_action_remains_available_while_current_joe_pressure_makes_wait_or_commit_a_legible_choice") &&
    gameJs.includes("outline_fill_and_motion_share_one_pressure_tier_while_reduced_motion_holds_the_ring_static") &&
    gameJs.includes("rgba(120,207,165,0.075)") &&
    gameJs.includes("rgba(240,116,65,0.13)") &&
    gameJs.includes("WATCH JOE // JOE 119m"),
  "The loud-station current-pressure decision read is missing.",
);
requireCondition(
  gameJs.includes("loud_station_pressure_transition_stability") &&
    gameJs.includes("freshFieldCommitmentPressure") &&
    gameJs.includes("fieldCommitmentPressureTransition") &&
    gameJs.includes("updateFieldCommitmentPressure") &&
    gameJs.includes("brief_boundary_motion_cannot_chatter_the_station_surface_while_critical_danger_escalates_immediately") &&
    gameJs.includes("fast_escalation_slow_recovery_and_immediate_critical_keep_pressure_legible_without_threshold_chatter") &&
    gameJs.includes("safety_first_hysteresis_fast_escalation_slow_recovery_and_immediate_critical"),
  "The loud-station pressure-transition stability contract is missing.",
);
requireCondition(
  gameJs.includes("in_reach_interaction_scorecard_clearance") &&
    gameJs.includes("riskPremiumAwardPresentation") &&
    gameJs.includes("risk_premium_moves_to_the_open_top_center_lane_while_an_in_reach_world_object_owns_interaction") &&
    gameJs.includes("earned_score_remains_visible_without_hiding_the_object_the_player_can_act_on") &&
    gameJs.includes("in_reach_generated_art_and_use_footprints_keep_the_center_world_lane_while_scoring_moves_without_expiring"),
  "The in-reach interaction scorecard-clearance contract is missing.",
);
requireCondition(
  gameJs.includes("in_reach_joe_bark_clearance") &&
    gameJs.includes("joeBarkSubtitlePresentation") &&
    gameJs.includes("joe_bark_moves_to_the_open_top_center_lane_while_an_in_reach_world_object_owns_interaction") &&
    gameJs.includes("joe_flavor_remains_visible_without_covering_the_object_or_action_the_player_can_commit") &&
    gameJs.includes("optional_character_dialogue_relocates_without_expiring_when_the_player_reaches_a_world_action"),
  "The in-reach Joe-bark subtitle-clearance contract is missing.",
);
requireCondition(
  gameJs.includes("activeFieldActionBreakaway") &&
    gameJs.includes("clean_break_hold_presentation") &&
    gameJs.includes("field_breakaway_hold_panel_ownership") &&
    gameJs.includes("clean_break_map_hold_continuity") &&
    gameJs.includes("clean_break_reward_resume_continuity") &&
    gameJs.includes("fieldBreakawayHoldPanelPresentation") &&
    gameJs.includes("fieldBreakawayHoldOwnsBottomRail") &&
    gameJs.includes("fieldBreakawayMapHoldPresentation") &&
    gameJs.includes("fieldBreakawayMapRefreshKey") &&
    gameJs.includes("fieldSignalBreakawayRewardDeferredBy") &&
    gameJs.includes("fieldSignalBreakawayRewardPresentation") &&
    gameJs.includes("fieldSignalBreakawayRewardCanPresent") &&
    gameJs.includes("miniMapCriticalStateKey") &&
    gameJs.includes("drawFieldBreakawayHoldPanel") &&
    gameJs.includes("screen_stable_named_cover_progress_panel_without_detached_debug_glyphs") &&
    gameJs.includes("one_reached_cover_one_hold_panel_no_duplicate_bottom_rail") &&
    gameJs.includes("persistent_map_hands_off_from_cover_distance_to_hold_progress_then_masked_state") &&
    gameJs.includes("world_hold_panel_map_header_and_clean_break_state_share_one_reached_cover_truth") &&
    gameJs.includes("earned_clean_break_lesson_queues_beneath_urgent_survival_then_resumes_for_its_full_remaining_duration") &&
    gameJs.includes("danger_keeps_priority_without_erasing_the_mastery_payoff") &&
    gameJs.includes("one_grounded_hold_panel_carries_stillness_progress_signal_time_and_success_state") &&
    gameJs.includes("field_signal_breakaway_routes") &&
    gameJs.includes("field_signal_breakaway_reward_loop") &&
    gameJs.includes("clean_break_result_continuity") &&
    gameJs.includes("clean_break_defeat_continuity") &&
    gameJs.includes("clean_break_live_hud_continuity") &&
    gameJs.includes("clean_break_miss_feedback_continuity") &&
    gameJs.includes("clean_break_miss_recovery_handoff_copy") &&
    gameJs.includes("resolved_signal_feedback_names_the_past_mistake_the_next_attempt_rule_and_the_live_followup_objective") &&
    gameJs.includes("clean_break_miss_trail_evidence_priority") &&
    gameJs.includes("trail_chain_change_surface_warning_keeps_decision_priority_before_optional_clean_break_coaching") &&
    gameJs.includes("fieldSignalBreakawayMissFocusDefers") &&
    gameJs.includes("fieldSignalBreakawayMissPresentation") &&
    gameJs.includes("fieldSignalBreakawayMissDeferredBy") &&
    gameJs.includes("fieldSignalBreakawayMissCanPresent") &&
    gameJs.includes("queued_beneath_immediate_survival_signals_then_resumes_in_the_existing_bottom_rail") &&
    gameJs.includes("first_miss_teaches_the_exact_correction_and_reveals_clean_break_mastery_without_changing_survival_or_objective_progress") &&
    gameJs.includes("signalBreakawayCount") &&
    gameJs.includes("cleanBreakLedger") &&
    gameJs.includes("CLEAN ${result.signalBreakawayCount}") &&
    gameJs.includes("CLEAN SIGNALS ${ledger.count}/${ledger.required}") &&
    gameJs.includes("integrated_into_defeat_status_line_without_replacing_incident_coaching") &&
    gameJs.includes("right_side_of_existing_objective_row") &&
    gameJs.includes("SIGNAL BREAKAWAY") &&
    gameJs.includes("signal_masked_under_named_cover") &&
    gameJs.includes('"field_signal_breakaway_override"') &&
    gameJs.includes('"mandatory_noise_breakaway"'),
  "The mandatory field-signal breakaway route handoff is missing.",
);
requireCondition(
  gameJs.includes("unfiled_change_request_hud_truth") &&
    gameJs.includes("changeRequestHudStatus") &&
    gameJs.includes("CR ✓ BANK +") &&
    gameJs.includes("secured_change_request_copy_keeps_the_unfiled_bank_condition_visible_until_exit_or_appeal"),
  "The unfiled Change Request HUD truth contract is missing.",
);
requireCondition(
  gameJs.includes("tension_director_signal_convergence") &&
    gameJs.includes("convergedThreatCaptions") &&
    gameJs.includes("tensionDirectorCaptionConvergenceState") &&
    gameJs.includes("one_tension_director_beat_one_strongest_directional_caption_without_redundant_ambient_omen") &&
    gameJs.includes("one_director_beat_keeps_one_directional_mower_caption_while_unrelated_danger_and_standalone_omens_remain_intact"),
  "The Tension Director signal-convergence contract is missing.",
);
requireCondition(
  gameJs.includes("activeStatusRequestSignal") &&
    gameJs.includes("activeStatusRequestSearch") &&
    gameJs.includes("activeStatusRequestSpatialConsequence") &&
    gameJs.includes("statusRequestSpatialPresentation") &&
    gameJs.includes("drawStatusRequestSpatialFootprint") &&
    gameJs.includes("statusRequestRearEdgeCuePresentation") &&
    gameJs.includes("drawStatusRequestRearEdgeCue") &&
    gameJs.includes("distractionSearchContext") &&
    gameJs.includes("status_request_consequence_continuity") &&
    gameJs.includes("status_request_spatial_consequence_continuity") &&
    gameJs.includes("status_choice_remains_named_through_investigation") &&
    gameJs.includes("status_choice_remains_named_through_follow_up_search") &&
    gameJs.includes("coarse_dashed_grid") &&
    gameJs.includes("tight_solid_sector_crosshair") &&
    gameJs.includes("near_field_above_existing_action_rail") &&
    gameJs.includes("none_presentation_matches_existing_search_target_and_precision") &&
    gameJs.includes("SWEEPING ROUGH STATUS GRID") &&
    gameJs.includes("SWEEPING ESCALATED SECTOR"),
  "The Status Request consequence handoff is missing.",
);
requireCondition(
  gameJs.includes("objective_action_range_truth") &&
    gameJs.includes("objectiveActionRangePresentation") &&
    gameJs.includes("binding_visible_only_inside_authoritative_interaction_radius") &&
    gameJs.includes("FOLLOW LANTERNS // ${targetLabel} ${roundedDistance}m") &&
    gameJs.includes("CLOSE IN // ${targetLabel} ${roundedDistance}m") &&
    gameJs.includes("blocked_interaction_owns_feedback_until_retreat"),
  "The range-truthful objective action contract is missing.",
);
requireCondition(
  gameJs.includes("simultaneous_interaction_prompt_ownership") &&
    gameJs.includes("courseInteractionPromptPresentation") &&
    gameJs.includes("interactionPromptRelationship") &&
    gameJs.includes("one_interact_binding_one_authoritative_target") &&
    gameJs.includes("other_interaction_priority") &&
    gameJs.includes("alternate_interaction_yields") &&
    gameJs.includes("interactionPromptOwner"),
  "The simultaneous interaction prompt-ownership contract is missing.",
);
requireCondition(
  gameJs.includes("ready_interaction_visual_focus") &&
    gameJs.includes("readyInteractionFocusPresentation") &&
    gameJs.includes("footingHazardAdvisoryFocusPresentation") &&
    gameJs.includes("ready_interaction_focus_deferred") &&
    gameJs.includes("ready_interaction_defers_distant_advisory_cards_while_world_art_and_map_truth_remain") &&
    gameJs.includes("ready_action_or_immediate_route_defers_optional_advice_but_never_silences_an_active_escape_hazard") &&
    gameJs.includes("optional_bypass_card_and_ground_route_yield_together_while_active_footing_escape_remains_authoritative") &&
    gameJs.includes("ready_action_owns_a_quiet_commitment_lane_while_world_and_urgent_route_truth_remain"),
  "The ready-interaction visual-focus contract is missing.",
);
requireCondition(
    gameJs.includes("field_signal_breakaway_destination_continuity") &&
    gameJs.includes("fieldBreakawayRouteLabels") &&
    gameJs.includes("commitment_preview_and_every_breakaway_navigation_channel_share_the_same_physical_cover_name") &&
    gameJs.includes("BREAK SIGNAL remains the reason while every navigation channel names the authored cover destination promised before activation") &&
    gameJs.includes("first_person_route_target") &&
    gameJs.includes("immediate_route_card"),
  "The field-signal breakaway destination-continuity contract is missing.",
);
requireCondition(
  gameJs.includes("field_signal_resolution_handoff_coherence") &&
    gameJs.includes("fieldSignalResolutionNavigationHandoff") &&
    gameJs.includes("applyFieldSignalResolutionNavigationHandoff") &&
    gameJs.includes("fieldSignalBreakawayRailPresentation") &&
    gameJs.includes("signal_resolution_reward_map_and_first_person_route_share_the_same_frame") &&
    gameJs.includes("earned_clean_break_uses_mint_success_hierarchy_while_misses_and_ordinary_consequences_keep_danger_trim"),
  "The same-frame field-signal resolution handoff contract is missing.",
);
requireCondition(
  !/tone:\s*["'](?:RELEASE MANAGER|PROJECT MANAGER|SCRUM MASTER|ADJUSTER)["']/u.test(dialogueJs),
  "Joe's capture-tone library contains a conflicting non-Product-Owner role.",
);

const closureItems = [...productClosure.matchAll(/^\d+\. \*\*/gmu)];
requireCondition(
  closureItems.length === 62,
  `The product enhancement closure matrix must contain exactly 62 numbered items; found ${closureItems.length}.`,
);
requireCondition(
  productClosure.includes("readiness.passed: true"),
  "The product enhancement closure matrix is missing its automated acceptance condition.",
);
requireCondition(
  releaseAcceptance.includes("57/57 readiness checks") &&
    releaseAcceptance.includes("89 deterministic fixtures") &&
    releaseAcceptance.includes("48 runtime image assets"),
  "The release-acceptance baseline is missing its auditable software qualification counts.",
);
for (const requiredGate of [
  "Keyboard and mouse",
  "Standard controller",
  "Touch device",
  "Mid-tier hardware soak",
]) {
  requireCondition(
    releaseAcceptance.includes(requiredGate),
    `The physical release-acceptance gate is missing: ${requiredGate}.`,
  );
}

const runtimeReferences = collectRuntimeAssetReferences(indexHtml, gameJs, dialogueJs);
let referencedBytes = 0;
let largestReference = null;
for (const reference of runtimeReferences) {
  const assetPath = path.join(webRoot, "assets", reference);
  requireCondition(fs.existsSync(assetPath), `Missing runtime asset: web/assets/${reference}`);
  if (!fs.existsSync(assetPath)) {
    continue;
  }
  const stats = fs.statSync(assetPath);
  referencedBytes += stats.size;
  if (!largestReference || stats.size > largestReference.bytes) {
    largestReference = { name: reference, bytes: stats.size };
  }
  if (path.extname(assetPath).toLowerCase() === ".png") {
    const dimensions = pngDimensions(assetPath);
    requireCondition(Boolean(dimensions), `Invalid PNG header: web/assets/${reference}`);
    if (dimensions) {
      requireCondition(dimensions.width > 0 && dimensions.height > 0, `Invalid PNG dimensions: web/assets/${reference}`);
    }
  }
}

const shippedSourceMasters = fs
  .readdirSync(path.join(webRoot, "assets"), { withFileTypes: true })
  .filter((entry) => entry.isFile() && (entry.name.endsWith("-chroma.png") || entry.name.endsWith(".md")))
  .map((entry) => entry.name);
requireCondition(shippedSourceMasters.length === 0, `Source-only files remain in the runtime bundle: ${shippedSourceMasters.join(", ")}`);
const unreferencedRuntimeAssets = fs
  .readdirSync(path.join(webRoot, "assets"), { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isFile() &&
      /\.(?:png|webp|avif)$/iu.test(entry.name) &&
      !runtimeReferences.includes(entry.name),
  )
  .map((entry) => entry.name);
requireCondition(
  unreferencedRuntimeAssets.length === 0,
  `Unreferenced images remain in the runtime bundle: ${unreferencedRuntimeAssets.join(", ")}`,
);

const actionDirectory = path.join(webRoot, "test-actions");
const actionFiles = fs.readdirSync(actionDirectory).filter((name) => name.endsWith(".json"));
requireCondition(
  actionFiles.includes("release-hardening-collision-route-handoff.json"),
  "The staged-load collision-route handoff regression is missing.",
);
requireCondition(
  actionFiles.includes("release-hardening-field-signal-breakaway.json"),
  "The staged-load field-signal breakaway regression is missing.",
);
requireCondition(
  actionFiles.includes("release-hardening-pursuit-intensity.json"),
  "The persisted Joe-pressure settings regression is missing.",
);
requireCondition(
  actionFiles.includes("release-hardening-pursuit-intensity-gameplay.json"),
  "The Joe-pressure setting-to-gameplay regression is missing.",
);
for (const actionFile of actionFiles) {
  try {
    const payload = JSON.parse(fs.readFileSync(path.join(actionDirectory, actionFile), "utf8"));
    requireCondition(Array.isArray(payload.steps) && payload.steps.length > 0, `${actionFile} has no action steps.`);
  } catch (error) {
    failures.push(`${actionFile} is invalid JSON: ${error.message}`);
  }
}

if (runtimeReferences.length < 20) {
  warnings.push(`Only ${runtimeReferences.length} runtime image references were detected; review the asset-reference expression.`);
}

const requestedUrlIndex = process.argv.indexOf("--url");
if (requestedUrlIndex >= 0) {
  const requestedUrl = process.argv[requestedUrlIndex + 1];
  requireCondition(Boolean(requestedUrl), "--url requires a value.");
  if (requestedUrl) {
    try {
      await verifyPublishedSite(requestedUrl);
    } catch (error) {
      failures.push(`Published-site verification failed: ${error.message}`);
    }
  }
}

const report = {
  ok: failures.length === 0,
  runtimeAssets: {
    referenced: runtimeReferences.length,
    megabytes: Number((referencedBytes / 1024 / 1024).toFixed(2)),
    largest: largestReference
      ? {
          name: largestReference.name,
          megabytes: Number((largestReference.bytes / 1024 / 1024).toFixed(2)),
        }
      : null,
    sourceMastersShipped: shippedSourceMasters.length,
    unreferencedImages:
      unreferencedRuntimeAssets.length,
  },
  actionScenarios: actionFiles.length,
  warnings,
  failures,
};

console.log(JSON.stringify(report, null, 2));
process.exitCode = report.ok ? 0 : 1;
