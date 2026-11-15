# Level 1 drainage ground integration — 2026-11-14

Partial V05/V06/V07/V09 progress in the full high-resolution pixel-art upgrade. The preceding checklist-only response was no progress toward implementation; this turn revalidated existing drainage evidence and changed the running scene. The full 35-item/V01–V21 objective remains active.

## What changed

The four service-building downpipe outlets now meet low, irregular eight-sided splash stones. Their tops fall away from the wall; connected 2 cm pixel steps shape a wider impact stain and a narrower offset runnel. This replaces the old rectangular raised dark plate. The surface uses existing stone materials and source lighting, with no new map, shader, glow, light, frame update or collision.

A shared outlet footprint clears nearby woodland cards/stones, course understory and facade moss using each decoration's radius. The exclusion follows the two mirrored outlet corners on both buildings. It does not clear whole building fronts or the central doorway. Grass visible crossing the service splash stone in the baseline close-up is absent in the matched after view; surrounding clusters remain.

The slab and stain use 24 and 36 triangles respectively, replacing two subdivided boxes. The stain sits 1 mm above the inclined stone and does not cast a separate shadow. Each original gutter/downpipe construction remains intact. Cache versions update the Level 1 module chain.

## Evidence

- `node tools/verify-building-drainage.mjs`: existing open-channel/bore/normal and central-doorway checks pass. New rays verify that every stain vertex lies 1 mm above its stone. Footprint checks cover both building sizes, mirrored corners, overlapping decoration radii, exterior clearance and unchanged central approach.
- `node tools/verify-building-drainage.cjs --ground --before`, `--ground`, and `--ground --software`: each passes 18 views, actual in-bounds walking, Escape pause/resume, reduced-motion scene, 15 camera turns with bounded warm resources and scene rebuild with exactly two drainage assemblies. No browser errors. Before routes five snapshotted source modules, preserving the immediately preceding drainage implementation.
- Viewports: 2560×1600, 1280×720, 390×844. Native internal targets are 2492×1402, 1193×671 and 379×833. Software retains its lower rendering budget. Reviewed actual service splash before/after, maintenance splash, phone and software splash images; installed-client captures review actual gameplay movement.
- Eighteen matched native views preserve all recorded light intensities, 28 path-lantern data, drainage locations, building/door anchors, rotations, hulls and door poses. `comparison.json` records 96–872 fewer rendered triangles, zero additional draws (two views save one), one extra batched geometry and no texture/program increase. Counts include shadow submissions and do not establish a frame-rate improvement.
- Warm camera-turn resources remain fixed: native 1013 geometries/113 textures, software 777/113. Scene rebuild and existing disposal ownership remain in use; no new separately owned material/texture was added.
- `verify-presented-client.mjs --level-one --building-drainage` invokes the installed develop-web-game client with two real forward/lateral bursts, in native and software modes. The maintenance approach remains inside playable bounds. These dark wall views verify input/runtime continuity, not attractive presentation of the ground detail.

Artifacts are in `output/level-one-drainage-ground`: before-native, after-native, after-software, client-native, client-software, comparison.json, five baseline modules and nine current-source snapshots with SHA-256 manifest.

## Limits and next work

This is local ground integration, not acceptance of all building craft or wet-ground art. The maintenance outlet is almost black under current lighting; the service outlet is discernible but still subdued. No ambient increase was used to expose inspection details. Native splash captures can omit the transient HUD while other views retain it; world comparisons use recorded scene data and matched poses. The service close-up is an inspection location outside playable bounds, not traversal evidence.

The retained stone material lacks a distinct wet specular response. Broad facade/ground pixel-cluster hierarchy, dark-scene focal composition, whole-route artistic review and software performance/fidelity remain unfinished. Next prioritize a route-scale composition/material review against the Level 1 reference bar rather than treating this small construction improvement as whole-level acceptance.
