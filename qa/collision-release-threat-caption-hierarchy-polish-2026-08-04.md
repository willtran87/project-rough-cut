# Collision-release threat-caption hierarchy polish — 2026-08-04

## Outcome

The bounded mint collision-release echo no longer competes with a two-row orange threat stack. While the recovery card is visible, one live threat remains on screen as a card in a geometry-derived lane above `CLEAR OF`, with a measured minimum 12-pixel canvas gutter.

This is a presentation-only hierarchy. Caption text, order, timers, and expiry continue normally; Joe's awareness, wake pressure, movement, detection, and AI are unchanged.

The retained warning is selected by safety rather than raw queue position: danger outranks mower state, mower state outranks ambient world flavor, and the newest caption wins equal-severity ties. This prevents later atmosphere copy from concealing a still-live tactical warning.

## Preserved systems

- Physical collision, obstacle geometry, escape selection, and live-input restoration
- The 360-millisecond mint release echo and 120-millisecond stable-clearance requirement
- Joe dialogue deferral, countdown, relevance threshold, and resume behavior
- Threat-caption creation, duration, queue order, and expiry
- Route thread, cover state, persistent map, scoring, audio, controls, and generated art
- Reduced Camera Motion behavior and responsive canvas scaling

## Validation

- `node --check web/game.js` — pass
- `node --check output/validate-route-pressure-visual.mjs` — pass
- `git diff --check` — pass, aside from existing Git line-ending notices
- Responsive visual/state matrix — 356/356 checks passed:
  - 2560x1600 high resolution
  - 1280x720 standard desktop
  - 844x390 compact landscape
  - 1280x720 Reduced Camera Motion
- Focused movement and pursuit validation — 18/18 checks passed
- Direct inspection covered repeated release, dialogue resume, compact release, and Reduced Camera Motion release frames.
- Official uninstrumented traversal — no browser-error artifact; 4.51ms average canvas render, 5.40ms final sample, 465 rendered frames.

## Evidence

- High-resolution release: `output/route-pressure-visual-validation/01-high-resolution-collision-bark-repeated-settle.png`
- High-resolution dialogue handoff: `output/route-pressure-visual-validation/01-high-resolution-collision-bark-resume-mid.png`
- Compact release: `output/route-pressure-visual-validation/03-compact-collision-bark-repeated-settle.png`
- Reduced-motion release: `output/route-pressure-visual-validation/04-reduced-motion-collision-bark-repeated-settle.png`
- Official traversal: `output/collision-release-threat-layout-official-2026-08-04/shot-0.png`
- Official state: `output/collision-release-threat-layout-official-2026-08-04/state-0.json`
