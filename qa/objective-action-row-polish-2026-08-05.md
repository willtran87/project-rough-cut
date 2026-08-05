# Objective action-row polish — 2026-08-05

## Outcome

The expanded field dossier's Interact row now describes the next useful action instead of showing the generic `INTERACT / UNLOCK` reminder.

- Incomplete field checks produce input-aware action copy from the authoritative station definition: `RING AUDIT BELL`, `STAMP FIELD LOG`, then `SIGN RELEASE REVIEW`.
- Once checks are complete, the row points to preparing a key/valve route, filing the shed or drain route, or choosing between both prepared exits.
- Active Final Filing and release-authorized presentation retain their established progress and completion states.
- Each field-check action inherits its authored station accent, making the primary objective and action row visually agree.
- Bounded font fitting protects keyboard, controller, touch, remapped-key, and route-state copy.
- Text state exposes action phase, rendered copy, color, and target ID beneath the existing objective hierarchy.
- Compact HUD, interaction prompts, field-check behavior, navigation, exit authorization, input mapping, and scoring are unchanged.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed for source and documentation.
- Direct inspection of the official first gameplay capture confirmed the expanded dossier reads `FIELD CHECKS 0/3 // AUDIT BELL`, the separate exit-route branch, and `ENTER RING AUDIT BELL` as one coherent plan.
- The official obstacle-aware station scenario filed the Audit Bell. State advanced to `FIELD CHECKS 1/3 // FIELD LOG` and `ENTER STAMP FIELD LOG`, with `targetId = field-log` and the Field Log's mint accent.
- The official valve route opened the actual Drain Valve and activated the 24-second wet-course state. The route branch changed to `DRAIN ROUTE // VALVE OPEN`, while the action row truthfully remained `ENTER RING AUDIT BELL` because field checks were still 0/3.
- Neither scenario produced a browser-error artifact. The 630-frame station capture averaged 3.15 ms canvas render with a 3.10 ms final sample; the 430-frame valve capture averaged 2.89 ms with a 2.40 ms final sample.

## Suggested follow-up

Human-playtest the action row with a remapped Interact key and after completing all three field checks. Preserve authoritative objective ownership and tune only bounded font size or wording if necessary.
