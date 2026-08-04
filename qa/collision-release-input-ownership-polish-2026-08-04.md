# Collision-release input ownership polish — 2026-08-04

## Outcome

Collision correction now yields as soon as movement is no longer actively rejected. The old escape direction cannot remain on screen while the player is already moving elsewhere: a mint release echo replaces the orange correction, and the directional HUD immediately returns to current input.

Direct obstacle-transfer afterimages also require continuous active contact, preventing unrelated later impacts from inheriting a stale spatial bridge.

## Preserved systems

- Player collision geometry, stepped movement, and viable escape selection
- Sustained-contact emphasis and the readable collision-memory lifetime
- Joe dialogue countdown, collision deferral, and stable-clearance handoff
- Wake, pursuit, detection, scoring, audio, map, controls, and generated art
- Standard, compact, high-resolution, and Reduced Camera Motion presentation

## Validation

- `node --check web/game.js` — pass
- `node --check output/validate-route-pressure-visual.mjs` — pass
- Responsive visual/state matrix — 352/352 checks passed:
  - 2560x1600 high resolution
  - 1280x720 standard
  - 844x390 compact
  - 1280x720 Reduced Camera Motion
- Focused movement and pursuit validation — 18/18 checks passed
- Direct inspection confirmed the release frame contains a mint `CLEAR OF // PINE` card, `LIVE INPUT // KEEP MOVING`, a rightward live-input chevron, and no stale left escape direction.
- Official uninstrumented organic sprint/chase route — no browser-error artifact; 1.67ms average canvas render, 1.60ms final sample, 892 rendered frames.

## Evidence

- High-resolution release: `output/route-pressure-visual-validation/01-high-resolution-collision-feedback-release.png`
- Compact release: `output/route-pressure-visual-validation/03-compact-collision-feedback-release.png`
- Reduced-motion release: `output/route-pressure-visual-validation/04-reduced-motion-collision-feedback-release.png`
- Official organic run: `output/collision-release-control-official-2026-08-04/shot-0.png`
- Official state: `output/collision-release-control-official-2026-08-04/state-0.json`
