# Objective-dossier hierarchy polish — 2026-08-05

## Outcome

The expanded field dossier now distinguishes the mandatory Night Order sequence from the player's exit-route choice.

- The primary line continues to own `FIELD CHECKS n/3 // <NEXT CHECK>` until all three checks are filed.
- The former numbered `1 FIND KEY...` row now reads `EXIT ROUTE // <KEY LOCATION> OR VALVE`, communicating that the key and valve are alternative route preparations rather than another numbered field check.
- Collecting the key changes the row to `SHED ROUTE // KEY ACQUIRED`.
- Opening the valve changes the row to `DRAIN ROUTE // VALVE OPEN`.
- Preparing both routes produces `EXIT ROUTES // SHED + DRAIN READY`.
- Route preparation remains subordinate to incomplete field checks in both visuals and text state. Objective order, interaction rules, exit authorization, navigation, map content, and compact-HUD behavior are unchanged.
- The row uses bounded font fitting for all three Night Order key-location variants.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed for source and documentation.
- The official first-frame capture was inspected directly. The expanded dossier showed `FIELD CHECKS 0/3 // AUDIT BELL` as the orange primary objective and `EXIT ROUTE // KEY WEST OF WATER OR VALVE` as a quieter route-choice row without the misleading task number.
- Text state reported `choose_route`, `deferredBy = field_checks`, and the shared relationship `complete_field_checks_and_prepare_one_exit_route`.
- A deterministic live route opened the actual Drain Valve through normal player input. Sprinklers activated for 24 seconds, the primary Audit Bell check remained unchanged, and the route summary became `DRAIN ROUTE // VALVE OPEN` with `drain_committed` state.
- No browser-error artifact was produced. The valve scenario completed 439 rendered frames at 2.86 ms average canvas render and 6.10 ms final canvas render.

## Suggested follow-up

Human-playtest the expanded dossier after collecting the shed key and after preparing both exits. Preserve the mandatory-versus-route hierarchy and tune only copy length or the 10-pixel minimum fitted size if a specific display needs it.
