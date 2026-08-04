# Collision-context cue handoff polish — 2026-08-04

## Outcome

The collision-to-dialogue transition no longer inserts a transient ambient blocker plaque. If a relevant Joe subtitle is waiting, collision ownership now remains authoritative through the existing 120-millisecond stable-clearance tail; the subtitle then resumes through its established motion policy. If no dialogue handoff is pending, ordinary blocker proximity guidance can return immediately after contact.

## Scope preserved

- Player and Joe collision geometry, obstacle routing, and escape selection
- Collision timers, sustained emphasis, and obstacle-transfer afterimages
- Joe dialogue selection, countdown, relevance threshold, and AI
- Wake, sight, hearing, detection, pursuit, scoring, audio, map, and controls
- Reduced Camera Motion behavior and all generated art

## Validation

- `node --check web/game.js` — pass
- `node --check output/validate-route-pressure-visual.mjs` — pass
- Responsive visual/state matrix — 352/352 checks passed:
  - 2560x1600 high resolution
  - 1280x720 standard
  - 844x390 compact
  - 1280x720 Reduced Camera Motion
- Focused movement and pursuit validation — 18/18 checks passed
- Directly inspected stable-clearance, repeat-gap, resume-midpoint, compact, and Reduced Camera Motion screenshots; no transient `SOLID // PINE` plaque remains.
- Official uninstrumented browser client — no browser-error artifact; 5.57ms average canvas render, 2.20ms final sample, 111 rendered frames.

## Evidence

- Feature frame: `output/route-pressure-visual-validation/01-high-resolution-collision-bark-resume-mid.png`
- Clearance frame: `output/route-pressure-visual-validation/01-high-resolution-collision-bark-settle-start.png`
- Compact clearance: `output/route-pressure-visual-validation/03-compact-collision-bark-settle-start.png`
- Reduced-motion resume: `output/route-pressure-visual-validation/04-reduced-motion-collision-bark-resume-start.png`
- Official capture: `output/collision-context-handoff-official-2026-08-04/shot-0.png`
- Official state: `output/collision-context-handoff-official-2026-08-04/state-0.json`
