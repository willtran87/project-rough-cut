# Footing material-response polish - 2026-08-04

## Scope

This pass makes the established slow-footing choices feel physically different beneath the player while preserving their geometry, movement multipliers, noise floors, collision-clear bypasses, Joe's Vertical Pass response, controls, objectives, and both escape routes.

## Observed issues

- Thatch, mud, and roots imposed different numbers but produced nearly the same moment-to-moment ground response.
- The active bypass plaque appeared at the hazard center, so it could retire after the player passed that point even while a slow crossing remained unfinished.
- The entry explanation and active plaque could compete for the same decision, and the returned plaque's second row could land beneath the aiming reticle.

## Implemented

- Thatch footsteps bend layered fibers and cast loose straw with a lightly irregular cadence.
- Mud footsteps compress into dark wet rims, sticky ochre clods, and the slowest bounded gait response.
- Root footsteps flex into branching bark marks with brief uneven impacts and restrained body roll.
- The existing step-particle cap and ground-response cap remain authoritative; the new visuals reuse those bounded systems rather than adding unbounded emitters.
- Locomotion reports the active footing material and drag. Reduced Camera Motion zeros added lurch, bob, and roll while retaining readable projected contact marks.
- On entry, the full `SLOW FOOTING` consequence message temporarily owns the instruction lane and states the immediate collision-clear escape side.
- After the message yields, the active plaque anchors its visibility to the recommended exit, stays horizontally centered, and reports `CLEAR LEFT/RIGHT` plus remaining meters.
- The plaque moves upward when it would intersect Joe's grounded label or the center reticle.
- `render_game_to_text` now exposes material, footing drag, response mode, supported footfall surfaces, plaque visibility, and entry-feedback deferral.

## Validation

- Focused gameplay validation passed 16/16 checks. It covered exact thatch slowdown, full-speed routing, measured travel difference, distinct thatch/mud/root contact responses, material-specific cadence drag, plaque deferral and return, Vertical Pass warning/creep, hard-cover waiting, seven traversable centers, seven nearby bypasses, seven collision-clear active recommendations, and browser errors.
- Responsive presentation validation passed 36/36 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion. Every presentation preserved the briefing, hazard count, warned approach, grounded bypass, active material response, motion preference, Vertical Pass state, and zero browser errors.
- Original-resolution inspection confirmed the returned plaque clears the reticle and remains readable with the objective ribbon, map, Joe label, obstacle art, and foreground cover.
- The official uninstrumented replay naturally reached the Audit Thatch approach with a valid 12.67m-clear left bypass at 24.75m from the exit path. It produced no error artifact and measured 2.74ms average / 2.50ms final canvas work across 464 rendered frames.

## Evidence

- `output/route-pressure-validation/01-active-thatch.png`
- `output/route-pressure-validation/04-active-mud-response.png`
- `output/route-pressure-validation/05-active-root-response.png`
- `output/route-pressure-validation/06-thatch-guidance-return.png`
- `output/route-pressure-visual-validation/01-high-resolution-footing-material.png`
- `output/route-pressure-visual-validation/03-compact-footing-material.png`
- `output/route-pressure-visual-validation/04-reduced-motion-footing-material.png`
- `output/footing-material-official-final-2026-08-04/shot-0.png`

## Suggested playtest tuning

Cross mud and roots naturally without consulting the map. If their identities remain too subtle during a chase, adjust only the bounded response amplitude or cadence modulation. Preserve the authoritative 54-70% movement penalties, noise floors, collision-clear local bypass, single instruction owner, and Reduced Camera Motion behavior.
