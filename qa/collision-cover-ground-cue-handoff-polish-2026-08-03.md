# Collision/Cover Ground-Cue Handoff Polish — 2026-08-03

## Problem

The same grounds cart could simultaneously render its orange collision footprint and its mint hard-cover socket with an `IN COVER` label. Both cues were individually truthful, but together they made one object appear to have two different collision boundaries at the exact moment the player needed a clear escape instruction.

## Resolution

- Active collision feedback now owns the contacted obstacle's ground geometry.
- When the contacted obstacle is also the nearest active hard cover, its mint socket ring and `IN COVER`/`COVER` label yield for the collision feedback window.
- The sprite, contact shadow, soil grounding, concealment, line-of-sight occlusion, and hard-cover simulation remain active.
- The ordinary cover cue returns automatically when collision feedback expires and remains unchanged for other nearby cover.
- `render_game_to_text` reports the cover-cue obstacle, visibility, preserved simulation state, and `collision_contact` deferral reason.

## Verification

- `node output/audit-collision-contact-layer.mjs` — 19/19 checks passed.
- Visual review covered centered and off-center grounds-cart contact at 2560x1600, 1280x720, 844x390, and Reduced Camera Motion.
- Clear-ground route frames retained their connected reflector thread and ordinary cover-cue eligibility.
- The official uninstrumented collision route reported `hardCover: true`, `nearestCover: service-cart`, `coverGroundCue.visible: false`, `statePreserved: true`, and `deferredBy: collision_contact`.
- The official capture produced no browser error artifact and recorded 1.93ms average / 1.40ms final canvas rendering across 231 frames.

## Visual evidence

- `output/collision-contact-layer-audit/01-high-resolution-centered-cart.png`
- `output/collision-contact-layer-audit/03-compact-centered-cart.png`
- `output/collision-contact-layer-audit/08-high-resolution-clear-ground-route.png`
- `output/collision-cover-cue-handoff-official-2026-08-03/shot-0.png`

## Follow-up boundary

Human-playtest repeated cover-edge bumps. If the handoff feels mistimed, tune only the existing 1.15-second collision-feedback lifetime; do not restore simultaneous orange and mint boundaries or disable the underlying cover state.
