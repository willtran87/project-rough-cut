# Under the Green — physical water-signal framing

This pass addresses review items 23, 24, 29 and 35: a physical crossing signal should remain visible with the bank, destination and controls, including portrait play. The previous water-audio pass exposed the root-gallery signal outside the portrait forward view despite passing HUD bounds checks.

## Changes

- Replaced edge-mounted vertical signal stacks with centered horizontal stop octagon, warning triangle and crossing chevron housings. Both faces still consume the authoritative water phase; color is accompanied by a distinct shape.
- The housing center is 2.5 m high, with its bottom at 2.33 m. Short crossings have at least 5.6 m between the two mounts so the far signal stays below the compact HUD when crouching at a narrow field of view.
- `under-green-signals.js` derives attachment points from the real floor union. Covered banks use a ceiling hanger. Outdoor signals use the nearer actual outer boundary, keeping ground posts outside walkable floor. A channel edge is not assumed to be a wall when a bank widens into a dry route.
- Portrait crossings use one compact water row at the top. Listening Focus remains visible beneath it; ordinary district/objective text returns when leaving the crossing. The full objective remains available in Pause. The lesson's bottom caption continues to supply its explanation rather than repeating it in the water card. Desktop and short-landscape HUD arrangements retain their existing layout.
- Movement, mouse direction, water timing, progression, Joe's speed/perception and capture rules are unchanged. The signal geometry reuses existing materials and fixture batches; no new textures or decorative animation are added.

## Reproductions and iteration

`tools/verify-under-green-signal-framing.cjs --baseline` reconstructs only the old signal fixture and old portrait CSS through test-only response replacements. It does not rewrite production files. Across 4,176 centered approach/phase cases, 1,085 have no fully framed, unobstructed active symbol clear of the visible HUD. These are deterministic visibility cases, not a population failure rate or a claim about human perception.

The first centered candidate left three short-crossing/FOV cases obstructed; `first-candidate.json` retains them. Increasing mount separation fixed those views. The moving-actor audit then caught five trimmer vertices within its clearance margin of a low housing during a wet-route walking pose at 25.8 seconds. That evidence is retained in `low-housing-clearance-failure.json`. The final housing was raised by 0.1 m, with short-crossing spacing increased to preserve framing.

The on-foot Focus test initially rejected the new layout because its non-overlap assertion supported only three relative directions. The assertion now also permits the water row above the Focus badge. It still rejects overlapping rectangles.

## Verified evidence

- Final framing: 4,176 cases, zero failures. Covers all eight channels, both banks, 1/2.5/5 m centered approach distances, standing/crouched eyes, 45/58/85-degree FOV and 2560x1600, 1280x720, 844x390 and 390x844 viewports. All authored periodic phases and event-controlled channel states are exercised. A real touchscreen tap activates touch layout before sampling.
- The check projects actual active-symbol geometry, requires full viewport containment, raycasts against visible scene meshes and rejects overlap with visible HUD/control rectangles. It does not certify recognition speed, arbitrary lateral/pitched views or physical-device ergonomics.
- All 16 mount descriptions pass the floor-boundary check. An additional 576 camera poses near outdoor supports pass exact rendered-triangle clearance checks.
- Actual CDP touch hold moves 7.68 m in two seconds through the first crossing at the established 3.84 m/s walk speed, with zero water hits and the lesson recorded. The final portrait crossing capture was inspected.
- Final broad camera audit passes 23,424 environment poses and 696 gate/actor poses, plus existing ordinary-input boundary checks. No console/page errors.
- Lesson browser checks pass ordinary first crossing, persistent lesson retirement, reload/retry, four viewport layouts and protected mistake recovery. Shared on-foot Focus checks pass remapped keyboard, simulated controller triggers, touch hold/release/cancellation and four viewport layouts.
- Installed standard web-game client completed ordinary movement through the lesson. Latest screenshot and state inspected: ready/playing at 7.05 seconds, lesson crossed, zero water hits. Final high-resolution and compact signal screenshots were inspected with actual touch controls, including low, warning and surge shapes.

The final full moving-actor audit passes dry, wet and checkpoint-3 routes: 3,358 rendered poses and 255 detailed rendered-geometry samples, with zero intersections and preserved hand/foot constraints. `tools/verify-under-green-signal-actor.cjs` additionally replays the actual wet-route pose prefix, then places a QA observer for 25.6/25.8/26.0-second close views. All three geometry checks and high-resolution visual inspections pass. The observer staging is explicit; it is not a human gameplay session.

The existing presentation suite also passes all water phases, bounded fixture draw counts, compact HUD bounds, danger-message priority, reduced-motion state changes and optional-record/result presentation. Final syntax checks pass.

## Scope and remaining acceptance

Evidence is in `output/under-green/signal-framing/`, with final camera results in `output/under-green/camera/` and existing Focus/lesson reports refreshed. The visibility envelope is sampled and centered; it does not prove all-space visibility or clipping freedom. Human recognition under pressure, color-vision accessibility, real phone ergonomics and broader unfamiliar-player acceptance remain open. Prior sustained performance reports describe their tested fixtures; this pass does not claim new physical-device or sustained frame-time qualification. The full 44-item goal remains active.
