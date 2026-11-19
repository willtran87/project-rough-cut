// Pure rules for ranking and theming Night Order threat captions.
export function hudFocusSuppressesThreatCaptions(
  focus,
) {
  return [
    "final_filing",
    "emergency_appeal",
    "status_request",
    "golf_aim",
    "practice_correction",
    "active_distraction",
    "risk_premium",
    "delivery_award",
    "pursuit",
    "opening_briefing",
    "blindside_transfer",
    "cadence_read",
    "counter_route",
    "crosswind",
    "nerve_hold",
    "cut_trace",
    "listening_search",
    "zone_arrival",
    "joe_dialogue",
  ].includes(focus);
}

/**
 * Selects one warning without reordering the live caption queue. Newer copy
 * wins ties, but a danger read cannot be displaced by later ambient flavor.
 */
export function mostUrgentThreatCaption(captions) {
  const categoryPriority = {
    world: 0,
    mower: 1,
    danger: 2,
  };
  let selected = null;
  let selectedPriority = -1;
  for (
    let index = captions.length - 1;
    index >= 0;
    index -= 1
  ) {
    const caption = captions[index];
    const priority =
      categoryPriority[caption.category] ?? 0;
    if (priority > selectedPriority) {
      selected = caption;
      selectedPriority = priority;
    }
  }
  return selected;
}

/**
 * Keeps caption text and framing on the same semantic threat palette.
 */
export function threatCaptionTheme(category) {
  if (category === "danger") {
    return {
      textColor: "#f09a69",
      frameColor:
        "rgba(240,116,65,0.86)",
      frameTheme: "danger_orange",
      minimumFrameOpacity: 0.42,
    };
  }
  if (category === "mower") {
    return {
      textColor: "#e6b06d",
      frameColor:
        "rgba(214,158,76,0.78)",
      frameTheme: "mower_amber",
      minimumFrameOpacity: 0.42,
    };
  }
  return {
    textColor: "#c9d8bd",
    frameColor:
      "rgba(132,154,111,0.72)",
    frameTheme: "world_sage",
    minimumFrameOpacity: 0.42,
  };
}
