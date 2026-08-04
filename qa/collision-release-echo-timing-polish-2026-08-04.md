# Collision-release echo timing polish — 2026-08-04

## Outcome

The positive collision-release confirmation now has a dedicated 360-millisecond lifecycle. It no longer inherits the longer collision-memory timer or occupies the field after its message is understood. Standard motion fades the mint echo smoothly; Reduced Camera Motion presents the same information statically and then removes it without interpolation.

After the echo yields, ordinary grounded obstacle guidance may return immediately when no dialogue or threat lane has higher priority.

## Preserved systems

- Authoritative collision geometry, stepped movement, and escape selection
- Active-contact emphasis and direct obstacle-transfer continuity
- Joe dialogue countdown, relevance threshold, and stable-clearance handoff
- Wake warnings, pursuit, detection, scoring, audio, map, and controls
- Existing pixel art, generated assets, and compact HUD hierarchy

## Validation

- `node --check web/game.js` — pass
- `node --check output/validate-route-pressure-visual.mjs` — pass
- Responsive visual/state matrix — 356/356 checks passed:
  - 2560x1600 high resolution
  - 1280x720 standard
  - 844x390 compact
  - 1280x720 Reduced Camera Motion
- Focused movement and pursuit validation — 18/18 checks passed
- Direct inspection covered high-resolution, compact, and Reduced Camera Motion mid-release and retired states.
- Official uninstrumented traversal — no browser-error artifact; 2.67ms average canvas render, 2.40ms final sample, 468 rendered frames.
- The first long-client attempt exceeded its command budget; its owned process was explicitly terminated before the successful bounded rerun.

## Evidence

- High-resolution mid-release: `output/route-pressure-visual-validation/01-high-resolution-collision-feedback-release.png`
- High-resolution retired state: `output/route-pressure-visual-validation/01-high-resolution-collision-feedback-retired.png`
- Compact retired state: `output/route-pressure-visual-validation/03-compact-collision-feedback-retired.png`
- Reduced-motion retired state: `output/route-pressure-visual-validation/04-reduced-motion-collision-feedback-retired.png`
- Official traversal: `output/collision-release-echo-official-short-2026-08-04/shot-0.png`
- Official state: `output/collision-release-echo-official-short-2026-08-04/state-0.json`
