# Onboarding tactical-handoff polish - 2026-08-04

## Scope

This pass cleans the transition from First Steps into ordinary tactical play and prevents onboarding cleanup from shortening unrelated gameplay warnings. Movement, objectives, controls, Joe, collision, hazards, scoring, and route geometry remain unchanged.

## Observed issues

- At ten meters, compact layouts removed the large bottom movement instruction but immediately introduced the smaller `SURROUNDINGS` panel for the remaining onboarding grace distance. The swap added clutter at the moment the course should open up.
- Any new tactical message triggered after ten meters while the onboarding source remained active was capped to 0.65 seconds. In the automated route this made the slow-footing entry explanation retire early and allowed its active plaque to render over the same decision.

## Implemented

- Compact onboarding remains on `course_view` after First Steps retires. It does not open the secondary panel unless the player deliberately enters Listening Focus.
- Desktop, high-resolution, and Reduced Camera Motion presentations continue into `surroundings_panel`.
- Added `onboardingPresentation` state with phase, owner, viewport class, secondary-panel visibility, bottom-instruction visibility, and duplicate count.
- Onboarding retirement now recognizes and clears only its own input-aware `MOVE` or `DRAG` sentence.
- New hazard, collision, Joe, objective, and other tactical messages retain their configured duration.

## Validation

- Responsive validation passed 56/56 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion. Each layout passed the briefing boundary, First Steps ownership, tactical handoff, zero late onboarding copy, route guidance, material feedback, recovery, Vertical Pass pressure, motion preference, and browser-error checks.
- The material-entry regression confirmed `SLOW FOOTING` retains its full explanation window and continues to defer the active bypass plaque until the message yields.
- Focused route-pressure validation retained all 18/18 checks.
- Original-resolution inspection confirmed desktop shows useful Surroundings context after the boundary while compact reveals the course without a replacement panel or bottom onboarding sentence.
- The official-client route reached eleven meters with `tactical_handoff`, `surroundings_panel`, no bottom instruction, zero duplicate rails, and no error artifact. Canvas work measured 7.61ms average / 2.00ms final across 95 frames.

## Evidence

- `output/route-pressure-visual-validation/01-high-resolution-onboarding-handoff.png`
- `output/route-pressure-visual-validation/03-compact-onboarding-handoff.png`
- `output/route-pressure-visual-validation/02-standard-footing-material.png`
- `output/opening-transition-official-2026-08-04/shot-0.png`

## Suggested playtest tuning

Trigger a natural gameplay warning between ten and eighteen meters on both desktop and a short landscape device. If the warning itself feels too dense, tune only its authored copy. Preserve its full timer and the compact course-view handoff.
