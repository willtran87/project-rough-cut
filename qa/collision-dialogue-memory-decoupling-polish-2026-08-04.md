# Collision-dialogue memory decoupling polish — 2026-08-04

## Outcome

Joe's preserved subtitle no longer waits for the full 1.15-second collision-memory timer after visible feedback has cleared. Active physical correction resets a 120-millisecond stable-clearance requirement; that clearance accrues during the 360-millisecond mint release echo, and relevant dialogue returns only after the echo has yielded.

Repeated contact still resets clearance immediately. Bark time is never paused or extended, stale copy cannot replay, and genuinely new contextual dialogue remains allowed.

## Preserved systems

- Player collision geometry, stepped movement, and viable escape selection
- Active-contact, sustained-scrape, release-echo, and direct-transfer visuals
- Joe bark selection, countdown, relevance threshold, and repeat history
- Wake warnings, pursuit, detection, scoring, audio, map, and controls
- Existing pixel art, generated assets, compact hierarchy, and accessibility settings

## Validation

- `node --check web/game.js` — pass
- `node --check output/validate-route-pressure-visual.mjs` — pass
- Responsive visual/state matrix — 356/356 checks passed:
  - 2560x1600 high resolution
  - 1280x720 standard
  - 844x390 compact
  - 1280x720 Reduced Camera Motion
- Focused movement and pursuit validation — 18/18 checks passed
- Direct inspection covered release start, repeated collision, resume start, resume midpoint, compact handoff, and Reduced Camera Motion handoff.
- Official uninstrumented traversal — no browser-error artifact; 2.58ms average canvas render, 2.10ms final sample, 459 rendered frames.
- One high-resolution headless-browser attempt closed its own context during a later screenshot; the identical deterministic rerun completed 89/89 and the full matrix completed 356/356.

## Evidence

- High-resolution release: `output/route-pressure-visual-validation/01-high-resolution-collision-bark-settle-start.png`
- High-resolution resume: `output/route-pressure-visual-validation/01-high-resolution-collision-bark-resume-mid.png`
- Compact resume: `output/route-pressure-visual-validation/03-compact-collision-bark-resume-mid.png`
- Reduced-motion resume: `output/route-pressure-visual-validation/04-reduced-motion-collision-bark-resume-start.png`
- Official traversal: `output/collision-dialogue-memory-decoupling-official-2026-08-04/shot-0.png`
- Official state: `output/collision-dialogue-memory-decoupling-official-2026-08-04/state-0.json`
