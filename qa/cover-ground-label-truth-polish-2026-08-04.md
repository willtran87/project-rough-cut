# Cover-ground label truth polish — 2026-08-04

## Goal

Keep shelter labels truthful and subordinate while preserving the physical cover information needed for navigation.

## Finding

The maintenance-shed socket derived its `IN COVER` copy from proximity and socket occupancy, while actual concealment was governed by `state.hole.environment.hardCover` and its matching blocker. A player could therefore stand in the socket with authoritative concealment inactive while the ground claimed otherwise. During an exit attempt, that low-priority label also sat beneath the more important action or blocked-result rail. On retreat, an almost-offscreen socket could still attempt to paint its text outside the playable field.

## Change

- Centralized maintenance-shed cover geometry so its renderer, ground cue, and diagnostics use one target and radius.
- Added a shared ground-label presentation with three explicit roles:
  - `CONCEALED` only when socket occupancy and the matching authoritative hard-cover blocker are both active.
  - `AT COVER` when the player occupies the socket without authoritative concealment.
  - `COVER` while approaching the shelter.
- Deferred the small local label beneath collision contact, the exact interaction action, or the blocked-result explanation.
- Added a protected screen region so offscreen cover geometry cannot produce clipped local text.
- Preserved the projected ring and soil state even while the optional label yields.
- Exposed label text, role, visibility, screen safety, deferral owner, socket occupancy, and concealment truth through `render_game_to_text` using the same presentation function as rendering.
- Changed no cover radius, concealment calculation, collision footprint, interaction radius, rejection timing, route selection, map behavior, movement, detection, Joe AI, scoring, audio, or art asset.

## Validation

- `node --check web/game.js` passed.
- `node --check output/validate-route-pressure-visual.mjs` passed.
- `git diff --check` passed apart from expected Git line-ending notices.
- Focused gameplay validation passed 18/18 with no browser errors.
- Responsive visual/state validation passed 308/308 across isolated layouts, covering ready/action, blocked/rejection, and retreated states for both exits at:
  - 2560×1600 high resolution
  - 1280×720 standard
  - 844×390 compact
  - 1280×720 Reduced Camera Motion
- Direct inspection confirmed the blocked-result rail remains the sole explanation owner, grounded cover geometry survives beneath it, and retreat does not paint a clipped label or falsely claim concealment.
- The official uninstrumented client preserved the opening, first-steps guidance, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas rendering averaged 6.28ms with a 1.90ms final sample across 107 rendered frames.

## Evidence

- High-resolution blocked state: `output/route-pressure-visual-validation/01-high-resolution-maintenance-shed-rejection-blocked.png`
- High-resolution retreated state: `output/route-pressure-visual-validation/01-high-resolution-maintenance-shed-rejection-retreated.png`
- Compact blocked state: `output/route-pressure-visual-validation/03-compact-maintenance-shed-rejection-blocked.png`
- Compact retreated state: `output/route-pressure-visual-validation/03-compact-maintenance-shed-rejection-retreated.png`
- High-resolution assertion log: `output/cover-label-truth-high-resolution.log`
- Responsive state matrix: `output/route-pressure-visual-validation/latest-state.json`
- Official regression: `output/cover-ground-label-truth-official-2026-08-04/shot-0.png`

## Next suggested refinement

Human-playtest natural approach and retreat angles around the maintenance shed and other solid shelters. If the approach label feels too eager, tune only its presentation threshold; preserve authoritative concealment truth, exclusive action and consequence ownership, and the always-visible physical cover geometry.
