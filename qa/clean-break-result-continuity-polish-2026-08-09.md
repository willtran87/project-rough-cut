# Clean Break result continuity polish

Date: 2026-08-09

## Finding

Clean Breaks had a complete field loop—named-cover confirmation, quiet hold, durable run record, Delivery score, and immediate reward—but the After-Action Review folded their points into generic Delivery. The player could finish a skillful station sequence without the result screen identifying how many signals were masked.

## Resolution

- `calculateRunResult()` derives unique valid completed station IDs from the authoritative run record.
- The result carries the completed count, the required total of three, the field-family Delivery bonus, and the perfect-mask state.
- The existing Delivery score note appends `CLEAN n/3` whenever at least one signal was masked. A perfect `3/3` uses the established gold mastery accent.
- No additional score row was introduced, preserving the result tableau, stat ledger, and action-card hierarchy at constrained sizes.
- `victoryPresentation.cleanBreakLedger` exposes the exact completed IDs, count, requirement, bonus, perfect state, and presentation mode.
- The `clean_break_result_continuity` readiness check verifies calculation and presentation parity. The static release verifier requires the same contracts.

## Native continuity evidence

Multiple ordinary keyboard runs traversed the authored map, completed station checks, followed collision-aware breakaway guidance, and attempted to continue toward the exit. These runs organically preserved one and two Clean Break records through later traversal and eventual capture. They also confirmed that earning a mask does not make the following route safe: Joe can reacquire sprint turf, close distance, and end the run.

These attempts are continuity and difficulty evidence, not a claim of a native full-route victory.

## Controlled result visual

To inspect the otherwise lengthy perfect-result composition deterministically, a temporary local fixture set the three completed station IDs, awarded their score through the real `awardDeliveryBeat()` path, and entered victory through the real `completeHole()` and `calculateRunResult()` paths. It produced `CLEAN 3/3`, a 507-point field-only Delivery bonus, and the perfect gold treatment.

The fixture existed only for visual inspection. Its window hook and temporary script were removed after capture; neither is present in the release source.

## Release evidence

- `node --check web/game.js`: passed.
- `node tools/verify-release.mjs`: passed with 48 referenced runtime images, 60.75MB, 79 valid action scenarios, zero warnings, and zero failures.
- Final official settled gameplay replay: 22/22 readiness, 60 estimated FPS, 4.1ms render p95, 30.3ms observed max, and no browser errors.
- `clean_break_result_continuity`: passed with count, required total, field-only bonus, perfect state, and compact presentation all aligned.

## Responsive visual inspection

- 2560x1600: document 2560x1600; canvas 2508x1403.75; no errors.
- 1280x720: document 1280x720; canvas 1209.38x673.27; no errors.
- Coarse-touch 390x844: document 390x844; canvas 375.22x208.67; portrait rotation prompt visible; no errors.
- The Delivery line remained legible, the perfect accent was clear, result actions remained available, and the generated escape tableau retained sufficient visual area.

## Remaining physical gates

Keyboard/mouse, standard controller, touch hardware, and a sustained 10–15 minute mid-tier device session remain human release gates. The software-side result calculation, presentation, accessibility contract, readiness check, and responsive states are implemented.
