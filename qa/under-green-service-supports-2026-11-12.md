# Under the Green — supported service fixtures

November 12, 2026. This pass advances review items 23, 24 and 29 by repairing visible fixture attachments. It does not change route geometry, movement, water schedules, enemy behavior or interaction eligibility.

## Observed problem and implementation

Matched 2560×1600 views show the gallery's pipework and lamps suspended without convincing supports, especially where the floor widens beyond the old assumed walls at x=±3. The bunker lamp floats in its open courtyard. Several direction signs likewise lack suspension.

`web/under-green-services.js` now builds attachments against the existing roof-panel and outer-wall geometry:

- Nine cross-feed arches have paired ceiling hangers and a riser joining the longitudinal supply pipe.
- Sixteen supply-pipe clamps have ceiling rods and mounting plates instead of short brackets that end in open space.
- Thirteen ordinary lamps have supports: three attach to the supply pipe, two to the cross-feed, six to actual ceilings and two to bunker retaining walls. The existing range-middle mast remains its authored support.
- The higher entrance lamp has a separate short ceiling stem above the moving door.
- Seven direction boards and the sluice-release sign have paired attachments. The entrance board hangs from its cross-feed rather than extending rods through that pipe.

The first visual iteration used ceiling stems for all covered lamps. Inspection identified that gallery stems would pass through the pipes directly above them. The final version attaches those five lamps to the pipe itself. Existing lamp positions, lighting, signs, text, target geometry and floor collision stay unchanged. New static pieces enter the existing spatial material batches; there are no new textures or per-frame fixture updates.

## Evidence and verification

`tools/verify-under-green-service-supports.cjs --baseline` retained four pre-change high-resolution views. The baseline flag now refuses to overwrite that historical evidence. The final script without the flag passes **16 rendered views plus four clearance records** at 2560×1600, 1280×720, 844×390 and 390×844. The compact contexts use touch-capable browsers with touch controls active. Each clearance record checks standing/crouched eye clearance at **802 floor positions**, with zero hits. The final support inventory and both ceiling/wall anchor modes are recorded.

Final `tools/verify-under-green-camera.cjs` passes **23,424 static and 696 dynamic camera poses**, including supported maximum pitch/FOV and gate/actor cases, with zero failures. Ordinary doorway/bank movement checks also pass. This is sampled camera coverage, not proof of all possible dynamic intersections.

The rendered Joe/tool verifier passed 12 poses, each with 14,697 sampled vertices, after the initial complete support/sign pass and before the final five gallery-lamp hanger refinements. That historical result is not presented as exhaustive final actor coverage. The final camera/eye sweeps cover the revised fittings, all of whose new support geometry is above the player/ordinary actor path.

Final installed gameplay client session 42807 exited 0: playing at 9.667 seconds, lesson crossed and zero water hits, with no error artifacts. Its latest screenshot/state were inspected. Final high-resolution entrance, portrait bunker and landscape junction captures were also inspected. Final support-browser session 52899 and camera session 62451 exited 0 with no browser errors.

Matched high-resolution rendering counts:

| View | Draw calls before → after | Triangles before → after | Textures / programs |
| --- | --- | --- | --- |
| Wide gallery | 290 → 290 | 61,008 → 64,932 | 40 / 21 unchanged |
| Junction | 104 → 105 | 38,280 → 41,436 | 40 / 21 unchanged |
| Bunker lamp | 33 → 35 | 14,598 → 16,486 | 40 / 21 unchanged |
| Pump lamp | 87 → 88 | 37,272 → 40,428 | 40 / 21 unchanged |

These are matched scene counts, not a sustained performance qualification. Artifacts are under `output/under-green/service-supports/`, with final broader camera evidence in `output/under-green/camera/`.

## Remaining scope

This repairs observed attachment defects; it does not close district recognition, overall scenery quality, human wayfinding, all-space clipping, audio listening or physical-device performance. Continue the full 44-item brief, including remaining course-themed environment coverage, actual shared-consumer gaps and cold-start/device qualification. Preserve the existing pursuit/recovery evidence rather than rerunning unchanged route studies for this decorative change.

All launched processes are terminal: initial support 14017; sign/support pass 94031; initial camera 65039; actor 47420; initial client 31850; final support 52899; final camera 62451; final client 42807. All exited 0. No test process is pending.
