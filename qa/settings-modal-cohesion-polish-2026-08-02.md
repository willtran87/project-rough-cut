# Settings modal-cohesion polish — 2026-08-02

## Scope

This pass refines only the visual focus of How to Survive / Settings and Key Bindings. It changes no setting value, default, persistence key, input mapping rule, hitbox, audio preview, accessibility behavior, gameplay control, or return target.

## Implemented

- Increased the Settings scrim from 0.74 to 0.9 opacity.
- Increased the Key Bindings scrim from 0.76 to 0.9 opacity.
- Added the same restrained inset keyline used by the Survival Briefing to both 980×556 panels.
- Preserved the underlying menu or paused-course context at low visibility rather than replacing it with a disconnected background.

## Validation

The official web-game client ran three focused routes against `http://127.0.0.1:4173/`:

1. `web/test-actions/settings.json` opened How to Survive / Settings and confirmed the assignment steps, audio rows, presentation rows, caption preview, Key Bindings button, and Return control remain visible and unobstructed.
2. `web/test-actions/keyboard_bindings_swap.json` opened Key Bindings, selected Move Forward, rebound it to A, and automatically swapped Move Left to W. The screen and text state both reported `MOVE FORWARD set to A. MOVE LEFT moved to W.`
3. `web/test-actions/keyboard_bindings_gameplay.json` returned through Settings, began the round, and used A as forward movement. The player reached 7 meters with `tutorialVisible: false`; the live control strip displayed `A/W/S/D / ARROWS`.
4. `web/test-actions/pause-settings.json` opened Settings from a suspended round. Text state retained `returnTarget: paused`, player progress at 0, and Joe patrolling at 188 meters; the visible button continued to read `RETURN TO PAUSE`.

All panels remained inside the 1280×720 canvas with clear selected-row borders and non-color selection cues. Settings averaged 3.51ms of canvas render work, Key Bindings averaged 3.17ms, and the live remapped frame ended at 1.5ms. No scenario produced a console or page-error artifact.
