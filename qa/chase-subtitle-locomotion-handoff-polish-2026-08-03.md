# Chase subtitle/locomotion handoff polish — 2026-08-03

## Scope

This pass removes one chase HUD overlap without changing movement speed, sprint noise, input, Joe detection, pursuit timing, contact breaking, dialogue selection, subtitle duration, scoring, or course geometry.

## Observed issue

The organic chase acquisition frame displayed `SPRINTING — LOUD` and `JOE // "Your scope is being reduced!"` on nearly the same center baseline. Both remained individually valid, but their glyphs overlapped and made the presentation look corrupt during pursuit.

## Implemented

- A visible Joe bark now temporarily defers only the live locomotion label.
- Movement chevrons, the reticle, Contact Break, attention state, map, world art, and the larger bottom survival instruction remain visible and authoritative.
- If the player keeps moving, the appropriate running, sprint, crouch, or terrain label returns immediately when Joe's line retires.
- `render_game_to_text` reports the raw label, visible state, `labelDeferredBy`, and the dedicated chevrons-only handoff presentation.

## Validation

- The organic input chase reached pursuit at 43 meters, then produced a 31-meter contact-breaking frame and transitioned into search with no browser errors.
- In the acquisition frame, Joe's subtitle remained visible, `SPRINTING — LOUD` reported `labelVisible: false`, `labelDeferredBy: joe_bark`, the right movement chevron remained live, and the screen contained no overlapping center text.
- Focused validation passed 20/20 checks at 2560×1600, 1280×720, 844×390, and 1280×720 with Reduced Camera Motion. Every size restored `SPRINTING — LOUD` with its standard presentation after the bark expired.
- The existing Joe-dialogue focus regression passed all four assertions, including field fallback, and movement-feedback release retained all ten live, afterglow, sprint, crouch, sand, compact, Reduced Motion, contract, and error assertions.
- The required official web-game client completed the opening route with no error artifact and measured 2.12ms average / 1.50ms last canvas work.

## Evidence

- `output/organic-chase-validation/01-organic-chase.png`
- `output/organic-chase-validation/02-breaking-contact.png`
- `output/organic-chase-validation/03-organic-recovery.png`
- `output/chase-label-handoff-validation/01-high-resolution.png`
- `output/chase-label-handoff-validation/02-standard.png`
- `output/chase-label-handoff-validation/03-compact.png`
- `output/chase-label-handoff-validation/04-standard-reduced-motion.png`
- `output/chase-label-handoff-validation/05-standard-label-return.png`
