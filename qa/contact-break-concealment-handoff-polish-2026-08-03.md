# Contact Break/concealment handoff polish — 2026-08-03

## Scope

This pass resolves one pursuit HUD collision without changing crouch, concealment, Nerve eligibility or progress, Contact Break duration, Risk Premium, Joe AI, detection, movement, Emergency Appeal, scoring, or course geometry.

## Observed issue

During an organic chase break at 31 meters, `ROUGH CONCEALMENT — STAY STILL` and the standalone Hold Your Nerve panel rendered behind the later Contact Break card. A separate bottom action rail already said `HOLD Q // HOLD YOUR NERVE`, leaving three competing reads and partially obscured text.

## Implemented

- Contact Break now owns the center presentation lane throughout pursuit.
- The ordinary concealment label and standalone Nerve panel yield visually during that interval; all underlying state and effects remain active.
- When Nerve is armed, its configured input remains on one bottom action rail.
- When Nerve becomes active, the bottom rail yields and the Contact Break card expands by 22 pixels to show Nerve percentage, configured Crouch/Listen bindings, and `DO NOT MOVE` beneath a separator.
- Emergency Appeal retains the existing larger priority treatment, and the primary pursuit line now fits within its card for unusually long direction or Risk values.
- `render_game_to_text` exposes center ownership and the current Nerve handoff state.

## Validation

- The organic input chase reached pursuit at 43 meters, produced a clean 40% Contact Break at 31 meters with `nerve_input_on_bottom_rail`, and recovered into search with no browser errors.
- Focused validation passed 20/20 checks at 2560×1600, 1280×720, 844×390, and 1280×720 with Reduced Camera Motion.
- Every armed frame retained Contact Break plus one bottom action. Every active frame reported 52% Nerve progress through `nerve_progress_integrated`, preserved chase telemetry, and contained no separate center concealment panel.
- The existing Hold Your Nerve regression retained armed, active, grace, completion, exit-window, Delivery, cap, input, and Reduced Motion behavior.
- The complete Emergency Appeal regression retained eligibility, activation, movement recovery, point-blank capture, victory accounting, and Reduced Motion behavior with no errors.
- The required official web-game client completed without an error artifact and measured 1.96ms average / 1.70ms last canvas work.

## Evidence

- `output/organic-chase-validation/02-breaking-contact.png`
- `output/contact-break-concealment-handoff-validation/01-high-resolution.png`
- `output/contact-break-concealment-handoff-validation/02-standard.png`
- `output/contact-break-concealment-handoff-validation/03-compact.png`
- `output/contact-break-concealment-handoff-validation/04-standard-reduced-motion.png`
- `output/contact-break-concealment-handoff-validation/05-standard-armed.png`
