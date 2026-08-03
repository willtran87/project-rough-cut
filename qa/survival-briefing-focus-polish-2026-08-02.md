# Survival Briefing focus polish — 2026-08-02

## Scope

This pass refines the existing menu-to-briefing-to-play handoff. It changes no objective, control binding, course geometry, item, Joe behavior, detection rule, progression state, or difficulty value.

## Implemented

- Increased the full-screen briefing scrim from 0.78 to 0.92 opacity so the underlying live HUD and map no longer compete with small instructional copy.
- Deepened the briefing panel and added a restrained inset keyline to improve visual separation without introducing a new art family.
- Raised the contrast of secondary progression guidance.
- Replaced the keyboard-specific `PRESS W OR ENTER TO START` copy with `MOVE OR PRESS ENTER TO START`. The displayed Interact label still follows remapping, and any configured movement direction remains valid.
- Updated controller copy to `MOVE OR PRESS A TO START` and touch copy to `MOVE LEFT PAD OR TAP USE TO START`.
- Disabled the start-prompt opacity pulse under Reduced Camera Motion while retaining the normal restrained pulse otherwise.

## Validation

The official web-game client ran three focused routes against `http://127.0.0.1:4173/`:

1. `web/test-actions/briefing.json` visually confirmed the darker modal handoff, inset frame, improved secondary contrast, and revised start instruction.
2. `web/test-actions/first_hole.json` dismissed the briefing through movement, reached 19 meters of travel with `tutorialVisible: false`, and retained the cleaned locked-gate opening presentation.
3. `web/test-actions/briefing-reduced-motion.json` opened Settings, enabled Reduced Camera Motion, returned to the menu, and opened the briefing. Text state confirmed `reducedMotion: true` and `tutorialVisible: true`; visual review confirmed the complete layout remained intact.

All routes remained in `first_hole` and produced no console or page-error artifact. The live handoff sample averaged 3.38ms of canvas render work with a 1.3ms final render.
