# Final Cut: larger industrial mower, estate detail and faster returns

Date: 2026-11-13

## Delivered

- Larger stepped chassis (3.25 m axle rails versus the former 2.6 m frame), engine housing (3.5 versus 2.8), tires (0.84 m radius versus 0.65), and cutting reels (0.46 versus 0.32). Shared collision and rendered geometry agree. The narrow central waist preserves the boarding steps; the rear axle moves back 0.45 m to clear Joe. The 10.5 m cutting span stays within the north/south irrigation corridor; Joe and his hand/foot controls retain human scale.
- 535 detail pieces in the finale atlas batches: full radiator, guarded headlights, service lids, deep engine housing, fenders, wheel hubs, gearboxes, deck ribs, fasteners, exhaust shields and bumper plates. Real industrial direction, no horns/skulls/monster face. 1024 px nearest-filtered atlas; nine merged batches, 11,474 triangles, plus the beacon.
- 1,160 structural detail pieces on existing estate structures: pitched slate/metal roofs, timber gables and fascia, gutters/downpipes, masonry coping/bond courses, shutters, caged lamps, 30 flush drains, pump gauge/grille and pipe collars. World-space material scale, Level 1 material library and discrete light shades. Roof label follows the new bunker slope. Pixel veins and root/tip shading fill out the reed screens.
- Travel speed 12 -> 18 m/s; acceleration 6 -> 12; corner acceleration limit 6.5 -> 12. Charge acceleration 4.8 -> 8.5. Cutters lift in 0.4 s (previously 1.1), next warning 1.05 s / 0.9 s after pump (previously 1.9 / 1.65). Deployment and Joe's control animation share those durations. Nearby corridor ends take priority at the far ends of the course.
- Rebuilt all 72 physical rolling routes for the enlarged machine. Across the same catalogue, mean travel is 13.619 -> 9.685 s; mean lift + travel + ordinary warning is 16.619 -> 11.135 s, a 33.0% reduction. This is an equal-weight route comparison, not a prediction of every player's attack frequency. See `output/final-cut/pressure-detail/timing.json`.
- Headlights moved ahead of the larger radiator. North/south grass screens deepened to conceal the longer nose physically; no visibility-toggle gameplay trick.

## Verification

- Rolling rules: 72 routes x 4 frame rates, 247,000 poses; no interior stops, stationary pivots or wall intersections; minimum tested corner speed 6.133 m/s and maximum lateral slip ratio 0.02171.
- Ambush rules: 32 four-direction/frame-rate capture and walking-reaction escape cases pass, plus locked commitment, pause, irrigation clearance, saved mowing, sight/noise and wet footing.
- Rig rules: 2,000 independent circle/OBB comparisons, sweep/activation behavior and frame-rate contact checks pass. Real browser geometry across eight deployed/raised poses fits the authoritative parts to floating-point tolerance. Wheel roll now derives from the new radius, including the victory handoff.
- Full skinned-mesh transfer audit: 322 boarding/dismount samples, zero body/tire contacts or support failures; maximum foot error 0.000000270 m.
- Core finale: seven ordinary-control simulation routes and mowing checks pass.
- Full browser route test fixed and passing for direct, garage and drain. Its middle-cover check now observes the brief warning when it occurs, then verifies the persistent warning event after walking into cover; it no longer expects a sub-second warning to remain visible after a four-metre walk. No live state placement during full routes. 120.280 / 103.368 / 130.074 simulated seconds, zero captures; pump, three crossings, bell, physical trap, road interaction and win cutscene all pass. Drain also uses a real ball redirect. 71 screenshots; zero browser errors.
- Hardware and SwiftShader: rolling body/wheels, Joe's supported hands/feet, four-direction rustle and audio, suppressed staging lamps, full warning escapes, pause, mute/reduced motion pass. Eight paired warning images show **zero visible rig pixels** behind physical grass; see `occlusion.json`.
- Visual review at 2560x1600, 1280x720, 844x390 and 390x844, including front/side/rear and estate close views. Desktop remains subject to the existing 1600-wide internal render cap; high-resolution textures are not a claim of native 2560 rasterization. Software retains its existing lower render cap.
- Installed develop-web-game client used with the real story/action payload; screenshot and text inspected. Its fixed 5-second pre-click can expire during software shader startup; the payload's subsequent keyboard input enters the story and playable overlook. No browser error artifact. This harness timing limit is not a blocked game control.

## Evidence and limits

`output/final-cut/pressure-detail/`: `routes/browser.json`, `hardware/report.json`, `software/report.json`, `ambush/report.json`, `ambush-software/report.json`, `occlusion.json`, `estate-report.json`, `timing.json`, and client screenshots/state. `mower-close.png` shows the final front bodywork. Hardware rolling images, refreshed estate/close images and full routes include the final recessed boarding waist and rear-axle clearance correction. Earlier software rolling images predate that geometric clearance correction; the final cardinal software pass verifies the corrected geometry remains concealed. The final eight paired frames are identical with/without the rig.

Art direction uses the same pixel materials and physical craftsmanship as Level 1. This is a substantial finale detail pass, not a claim that every backlog item or human playtesting requirement is complete. No sustained software frame-rate qualification or unfamiliar-player acceptance is claimed. Existing story frames and non-final-level work are preserved.
