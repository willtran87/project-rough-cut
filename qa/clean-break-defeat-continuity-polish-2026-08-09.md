# Clean Break defeat-continuity polish

Date: 2026-08-09

## Finding

Clean Break mastery carried from the field into successful After-Action Reviews, but capture discarded its visible identity. Native attempts had already demonstrated the problem: a player could complete one or two named-cover signal masks, survive into a later course section, and lose all acknowledgment when Joe caught them. The defeat screen then asked for a retry using only failure language.

## Resolution

- `cleanBreakRunLedger()` is the shared calculation boundary for unique valid station IDs, completed count, required total, field-only Delivery bonus, and perfect state.
- `calculateRunResult()` consumes that ledger instead of independently deriving victory data.
- `cleanBreakDefeatPresentation()` maps the same ledger into a compact defeat status. One or more masks produce `DELIVERY BLOCKED // CLEAN SIGNALS n/3`; zero masks preserve `DELIVERY BLOCKED: FAILED JOE'S ACCEPTANCE REVIEW`.
- The status line receives a restrained gold treatment when mastery exists. It adds no row and leaves Joe's portrait, dialogue, Product Owner identity, Incident Review, evidence, next-run counterplan, and three result actions unchanged.
- `capturePresentation.cleanBreakLedger` exposes the completed IDs, count, required total, field-only bonus, perfect state, exact presentation contract, and explicit run-only persistence rule.
- `clean_break_defeat_continuity` validates both perfect and empty presentations. The static release verifier requires the shared failure-continuity markers.

## Retry-loop evidence

A controlled two-mask defeat entered the actual Sprint Terminated renderer and selected the real Retry File action. The next state was `first_hole` with quick start active, briefing skipped, capture presentation removed, and the station completion ledger reset from two entries to zero. This recognizes the failed run without implying permanent objective completion or weakening the next attempt.

## Controlled visual evidence

A temporary local staging hook placed two valid station IDs through the real Delivery award path, created the ordinary capture review/dialogue, and entered the existing defeat renderer. It existed only to inspect the difficult-to-reach composition deterministically and was removed before release verification.

- 2560x1600: document 2560x1600; canvas 2508x1403.75; no errors.
- 1280x720: document 1280x720; canvas 1209.38x673.27; no errors.
- Coarse-touch 844x390: document 844x390; canvas 645.5x357.92; no errors.
- Portrait-touch 390x844: document 390x844; canvas 375.22x208.67; rotation prompt visible; no errors.
- Across the result-bearing views, `CLEAN SIGNALS 2/3` remained inside the status lane and the complete incident/retry hierarchy remained available.

The temporary hook, script, captures, and browser contexts were removed after inspection.

## Release evidence

- `node --check web/game.js`: passed.
- `node tools/verify-release.mjs`: passed with 48 referenced runtime images, 60.75MB, 79 valid action scenarios, zero warnings, and zero failures.
- Final fixture-free official replay: `first_hole`, 23/23 readiness, 60 estimated FPS, 4.6ms render p95, 36.8ms observed max, and no browser errors.
- `clean_break_defeat_continuity`: passed for perfect `3/3`, empty `0/3`, placement, and fresh-run semantics.

## Remaining physical gates

Keyboard/mouse, standard controller, touch hardware, and a sustained 10–15 minute mid-tier device session remain human release gates. The software-side defeat calculation, presentation, input actions, diagnostics, readiness contract, and responsive states are implemented.
