# Collision obstacle-transfer continuity polish — 2026-08-04

## Goal

Make fast contact transfers between adjacent obstacles spatially understandable without presenting stale blocker names or competing escape instructions.

## Implementation

- A direct collision change to a different obstacle immediately makes the new footprint, card, tether, and escape direction authoritative.
- The prior obstacle contributes only a faint dashed footprint for 120 milliseconds.
- The retiring contact has no label, card, tether, screen wash, or input instruction.
- A further transfer replaces the one retiring footprint instead of accumulating visual history.
- Reduced Camera Motion omits the afterimage and switches instantly.
- Ambient `SOLID` proximity plaques yield while a collision correction is active, eliminating stale or duplicate obstacle names.
- Imminent noise and existing safety-critical context retain their established priority.
- Text diagnostics expose transfer state, previous obstacle, progress, duration, mode, and ambient blocker deferral ownership.

## Preserved behavior

Collision resolution, stepped movement, obstacle identity and geometry, escape selection, feedback duration and sustained emphasis, collision audio cooldown, wake and pursuit warnings, Joe dialogue and AI, detection, scoring, map, subtitles, and generated art are unchanged.

## Validation

- `node --check web/game.js`
- `node --check output/validate-route-pressure-visual.mjs`
- `node output/validate-route-pressure.mjs` — 18/18 checks passed with no browser errors.
- `node output/validate-route-pressure-visual.mjs` — 352/352 checks passed across:
  - 2560x1600 high resolution
  - 1280x720 standard
  - 844x390 compact
  - 1280x720 Reduced Camera Motion
- The visual matrix stages the water-pine to audit-board transfer at the authoritative first frame, afterimage midpoint, and settled state before continuing through all prior collision, dialogue, movement, route, interaction, and cover checks.
- High-resolution inspection found the ambient pine plaque still visible beside the new audit-board card. After the ownership correction, both high-resolution and compact captures contain only one blocker name and escape instruction.
- Official uninstrumented browser smoke:
  - screenshot/state: `output/collision-transfer-continuity-official-2026-08-04`
  - average canvas render: 8.65ms
  - final canvas render: 3.20ms
  - rendered frames: 97
  - browser-error artifact: none

## Human follow-up

Zig-zag through the densest Service Maze obstacle pairs during pursuit. If the spatial trace feels too brief or too visible, tune only its 120-millisecond duration or 28% peak opacity; keep the new obstacle authoritative immediately and preserve one instruction owner.
