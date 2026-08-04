# Responsive First Steps ownership polish - 2026-08-04

## Scope

This pass reduces duplicate onboarding copy in the first playable seconds while preserving movement clarity, objective navigation, route art, controls, input-specific language, and the ten-meter handoff into ordinary play.

## Observed issue

The opening repeated the same movement decision in the First Steps panel, a large bottom message, the world target plaque, route label, and persistent control footer. On desktop this obscured more course than necessary. On the short 844x390 layout, the larger bottom message was more legible than the secondary panel, so simply removing it everywhere would have reduced clarity.

The pre-round state also reported First Steps as active while the Survival Briefing still owned the visible instruction layer.

## Implemented

- Added responsive instruction ownership based on the actual browser viewport.
- Standard, high-resolution, and Reduced Camera Motion layouts use `first_steps_panel`; the duplicate bottom movement sentence is retained as deferred source state but does not render.
- Layouts up to 880 pixels wide or 460 pixels tall use `bottom_instruction_rail`; the expanded secondary panel does not render.
- The world route, target plaque, persistent controls, objective dossier, map, and course view remain unchanged.
- The onboarding movement message retires at ten meters and cannot reappear after the First Steps cue collapses.
- First Steps now requires the Survival Briefing to be dismissed.
- `render_game_to_text` reports the active owner, compact-viewport decision, zero duplicate instruction rails, actual expanded-HUD visibility, and message deferral.

## Validation

- Responsive validation passed 48/48 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion. Each layout preserved the Survival Briefing boundary, all seven hazards, one First Steps owner, movement clarity, approach guidance, material feedback, recovery, Vertical Pass pressure, motion preference, and zero browser errors.
- Focused route-pressure validation retained all 18/18 checks.
- Original-resolution inspection confirmed desktop/high-resolution layouts show the detailed First Steps panel without a bottom duplicate, while 844x390 shows the larger bottom rail without the secondary panel.
- The official-client route dismissed the Survival Briefing and stopped at zero travel with `first_steps_panel`, `hudExpanded: true`, no visible bottom message, the source message deferred by `first_steps_panel`, and `duplicateInstructionRails: 0`. No error artifact was produced; canvas work measured 5.93ms average / 2.40ms final across 103 frames.

## Evidence

- `output/route-pressure-visual-validation/01-high-resolution-first-steps.png`
- `output/route-pressure-visual-validation/02-standard-first-steps.png`
- `output/route-pressure-visual-validation/03-compact-first-steps.png`
- `output/route-pressure-visual-validation/04-reduced-motion-first-steps.png`
- `output/opening-handoff-official-final-2026-08-04/shot-0.png`

## Suggested playtest tuning

Check the opening on a physical landscape phone with browser chrome visible. If the owner changes at an awkward size, tune only the 880x460 compact boundary. Preserve one instruction owner, input-aware copy, and the ten-meter retirement.
