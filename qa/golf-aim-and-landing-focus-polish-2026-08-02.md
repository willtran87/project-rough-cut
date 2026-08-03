# Golf aim and landing focus polish — 2026-08-02

## Outcome

Golf-ball aiming now becomes a short, explicit presentation focus without pausing Joe or hiding the persistent course map and attention meter. The aim card collapses the onboarding dossier, route-backtrack card, generic control rail, ambient world plaques, stale messages/prompts, generic Joe banners, barks, and threat captions. An untriggered noise hazard within eight meters remains the safety exception.

The charge meter now labels its authoritative percentage as `SHOT POWER`, while the existing impact/rest trajectory, terrain result, Shot Craft forecast, input-aware steering/release copy, cancel control, and Reduced Camera Motion behavior remain unchanged.

The landing consequence now owns a separate short `active_distraction` handoff. It keeps the grounded Distraction marker, one Joe character line, one mechanical consequence rail, map signal, and attention state, while the onboarding dossier, generic Joe banner, and redundant threat-caption stack yield. Normal compact HUD, field captions, navigation, and Joe search feedback return when the landing message expires.

## Validation

- `node --check web/game.js`
- `git diff --check`
- Required official aiming route confirmed the compact focus composition and labeled charge meter with no browser error artifact.
- The Shot Craft validator passed Pressure Chip priority, Deliverable Bank, Lie Switch, ordinary shots, run-cap suppression, practice suppression, cue deduplication, preview/commit parity, Reduced Camera Motion, and the new aim-focus contract. `aimFocus: true`; `noErrors: true`.
- Ordinary keyboard hold/steer/release consumed one ball, produced one grounded recoverable ball, and moved Joe into `investigate`.
- The live landing frame reported `focus: active_distraction`, `hudExpanded: false`, zero threat-caption cards, hidden generic Joe state, retained Joe dialogue, and `active_distraction_handoff` context deferral. Average canvas render work was 2.14 ms.
- An extended ordinary-input replay let the sequence settle. It returned to `focus: field`, `hudExpansionReason: compact`, normal caption capacity, and Joe's physical search with the recoverable ball still on course. Average canvas render work was 2.12 ms.

## Evidence

- `output/golf-aim-focus-polish-official-2026-08-02/shot-0.png`
- `output/shot-craft-preview/01-pressure-ready.png`
- `output/shot-craft-preview/02-bank-reduced-motion.png`
- `output/shot-craft-preview/report.json`
- `output/shot-craft-preview/focus-contract-log-2026-08-02.txt`
- `output/golf-landing-handoff-official-2026-08-02/shot-0.png`
- `output/golf-landing-handoff-official-2026-08-02/state-0.json`
- `output/golf-aim-handoff-settle-official-2026-08-02/shot-0.png`
- `output/golf-aim-handoff-settle-official-2026-08-02/state-0.json`

Every Playwright browser context closed after validation. The existing local server on port 4173 was intentionally preserved for player testing.
