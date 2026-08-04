# Collision-release warning-priority polish — 2026-08-04

## Outcome

The single threat card shown during a mint collision-release echo now retains the most safety-critical live warning instead of blindly selecting the newest queue entry. Danger captions outrank mower-state captions, mower-state captions outrank ambient world captions, and recency breaks equal-severity ties.

The policy is presentation-only. It does not reorder or mutate the caption queue and does not alter Joe awareness, detection, movement, AI, or warning lifetimes.

## Deterministic scenario

- Older live warning: `MOWER CREEPS INTO YOUR WAKE`, category `danger`
- Newer live warning: `COURSE LIGHTS FLICKER`, category `world`
- Expected release owner: the mower-wake danger warning
- Expected deferred caption: the ambient course-light warning
- Existing geometry requirement: one card above `CLEAR OF` with at least a 12-pixel canvas gutter

## Preserved systems

- Caption contents, queue order, age, duration, and expiry
- Ordinary two-card field stack and focused single-card behavior
- Collision geometry, correction, release echo, and dialogue handoff
- Joe awareness, wake pressure, detection, routing, and pursuit
- Route thread, cover state, map, scoring, audio, controls, and generated art

## Validation

- `node --check web/game.js` — pass
- `node --check output/validate-route-pressure-visual.mjs` — pass
- Responsive visual/state matrix — 356/356 checks passed:
  - 2560x1600 high resolution
  - 1280x720 standard desktop
  - 844x390 compact landscape
  - 1280x720 Reduced Camera Motion
- Focused movement and pursuit validation — 18/18 checks passed
- Direct inspection confirmed the danger warning is the sole release card in high-resolution, compact, and Reduced Camera Motion captures while the mint release card retains its measured gutter.
- Official uninstrumented traversal — no browser-error artifact; 4.16ms average canvas render, 4.10ms final sample, 464 rendered frames.

## Evidence

- High-resolution release: `output/route-pressure-visual-validation/01-high-resolution-collision-bark-repeated-settle.png`
- Compact release: `output/route-pressure-visual-validation/03-compact-collision-bark-repeated-settle.png`
- Reduced-motion release: `output/route-pressure-visual-validation/04-reduced-motion-collision-bark-repeated-settle.png`
- Official traversal: `output/collision-release-warning-priority-official-2026-08-04/shot-0.png`
- Official state: `output/collision-release-warning-priority-official-2026-08-04/state-0.json`
