# Survival Briefing ownership polish — 2026-08-03

## Scope

This pass resolves one pre-round presentation conflict without changing the briefing content, configured bindings, dismissal inputs, round start, onboarding timing, movement, HUD information, course art, Joe behavior, collision, objectives, scoring, or progression.

## Observed issue

At 2560x1600 and 844x390, the Survival Briefing scaled correctly but the live first-hole interface remained faintly readable behind it. The objective dossier, attention panel, course map, reticle, movement feedback, and bottom control rail formed a second instruction layer before the player had started the round.

## Implemented

- The first-hole renderer now finishes the physical course world, draws the Survival Briefing, and returns before any live tactical overlays are composed.
- The course silhouette, authored scenery, moon, fog, and visual continuity remain behind the modal.
- The objective HUD, map, contextual cards, reticle, movement feedback, subtitles, captions, and live control rail appear only after the briefing yields.
- `render_game_to_text` reports the briefing as the exclusive presentation owner while confirming that world context remains visible and the live HUD does not.

## Validation

- Focused validation passed 36/36 checks at 2560x1600, 1280x720, 844x390, 1280x720 with Reduced Camera Motion, controller-style prompts, and compact touch prompts.
- Keyboard confirm, keyboard movement, and touch dismissal all handed into the live first hole with the expanded onboarding HUD restored.
- Controller and touch briefing copy retained the correct input-specific controls.
- The established onboarding regression still expanded at zero meters, collapsed after 26 meters, reopened for manual recall, and expanded independently for Listening Focus with no browser errors.
- The official gameplay client dismissed the briefing, traveled 19 meters, retained onboarding ownership, and produced no error artifact at 4.71ms average / 1.70ms last canvas work across 128 rendered frames.

## Evidence

- `output/briefing-modal-ownership-polish-2026-08-03/shot-0.png`
- `output/survival-briefing-ownership-validation/01-high-resolution-keyboard.png`
- `output/survival-briefing-ownership-validation/02-standard-keyboard-move.png`
- `output/survival-briefing-ownership-validation/03-compact-keyboard.png`
- `output/survival-briefing-ownership-validation/04-standard-reduced-motion.png`
- `output/survival-briefing-ownership-validation/05-standard-gamepad-prompts.png`
- `output/survival-briefing-ownership-validation/06-compact-touch-prompts.png`
- `output/briefing-handoff-gameplay-regression-2026-08-03/shot-0.png`
