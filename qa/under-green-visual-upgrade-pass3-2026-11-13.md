# Under the Green visual upgrade — roots, repairs and enclosure

The complete 53-item objective remains active. This pass implements the wall-repair treatment (V08) and advances architecture, root composition/contact, damp materials, lighting and golf-course continuity. Full Level 1 parity and all seven release gates remain unproven.

## Changes

- Six authored root systems: entrance claw, crossing strangle, junction split, bunker taproot, pump buttress and keeper corner. Each has a different branch topology; 16 substantial forks, 48 fine feeder roots on hardware (24 on software), localized moss and six broken masonry/soil entries. Broad roots have a bounded 20cm wall projection, and the original generic root count/density is reduced to create quiet stretches.
- Replaced the rectangular gallery pillar with a heavy fluted root and three intertwined secondary roots inside the existing 1×1m collider. Two ceiling forks continue its silhouette overhead. No new obstacle or navigation restriction.
- The keeper course-plan wall has a deliberate quiet area so roots no longer obscure its focal point.
- Added opaque timber/earth enclosure over the bunker and metal-supported enclosure over the range: 115 bunker panels, 70 range panels and 17 clipped support runs. Three framed, grated inspection wells retain real openings into the course. The keeper gate's separate travel pocket remains open below its existing cap.
- Increased the outer bunker bank to the new roof/turf level; moved its root fans, rake and balls consistently with that surface. Course flag positions follow the new ground height. Added one mounted bunker work lamp to the existing two-point-light selection pool, revealing the exposed root and inspection well.
- Five sealed wall repairs: bricked ventilation opening, irregular gallery mortar patch, welded pump service cover, strapped range repair and missing keeper tiles. Different materials, displaced edge pieces, bolts and shallow recesses convey different construction ages. Maximum projection is 18.3cm; no door-like traversable opening or interactive promise.
- Replaced rectangular specular masks with irregular tapered seep paths and puddle shapes. Soft wetness-mask filtering is separate from the sharp illustrated diffuse textures; no full-screen blur. This reduces bright rectangular glints while preserving material detail.

Existing E/Q controls, non-inverted look, movement, water rules, pursuit and whole-level retries are unchanged. No banner narration added.

## Evidence and verification

- `tools/verify-under-green-environment.cjs`: native hardware and SwiftShader, 2560×1600 / 1280×720 / 390×844 / 844×390. Captures all six root formations, pillar, both new district ceilings, inspection wells and all five wall repairs. Includes ordinary W/C/Q input, pause, actual 45°/85° FOV controls and Reduced Motion steady lighting.
- Exact enclosure-area accounting checks the floor union minus only the authored openings. Upward rays against rendered geometry check 172 roof positions for opaque coverage, the three well centers for actual openings and the gate pocket for clearance below its roof cap. The query begins above legacy pipe/signal supports so those cannot falsely satisfy the roof audit.
- 3,168 camera placements beside the authored roots and wall repairs, with standing/crouched heights, up/down look, both FOV extremes, portrait/wide aspect and cardinal directions: zero intersections in the rendered geometry audit.
- 21 gate travel fractions: actual swept-box and point audits remain clear of the new structure.
- Full dry-route replay: 1,379 rendered frames, 106 actor/tool mesh audits, zero scenery contacts, maximum foot error 2.42e-7m.
- Installed develop-web-game client: intro progression and ordinary movement. Final evidence under `output/under-green/visual-upgrade/pass3-client-final`.
- Captures/reports: `output/under-green/visual-upgrade/environment` and `environment-software`; geometry route report in `pass3-clearance`. Source snapshots retained under `pass3-source`; available pre-pass files under `pass3-baseline`.

No new generated raster master was needed: existing illustrated material masters are reused, with geometry and separate procedural wetness masks authored for this pass.

## Remaining acceptance

Camera and route results apply to the tested placements and route, not arbitrary future geometry. The new enclosure does not change the simulation's existing cover classification. Full shader/shadow/ghost lighting behavior still needs the later atmosphere pass.

Root and district geometry is substantially less repetitive, but the full material-variant, illustration-match and Level 1 comparisons are still open. V09 needs remaining pump/keeper overhead composition; V12/V15 need more settled construction and dirt-contact detail; V16 can be extended selectively at ceiling knots. Keep water/flood V20–V27, lighting/shadow/atmosphere, keeper story props, actor/ghost polish and UI consistency in scope.

Native representative counters: entrance 319 draws/279,052 triangles; pillar 246/260,926; bunker root 30/84,622; bunker approach 314/275,322; range 155/175,420. Software uses the existing lower-detail/culling path (e.g. bunker root 26 draws/11,306 triangles). These are render counters, not frame-time or resource-budget acceptance. The performance gate remains open.

Final jobs observed terminal: hardware and software environment verifiers each passed 30 views and 172 roof rays, zero errors, actual initial targets 2560x1600 / 960x600. Installed client finished playing at y12.68, actual960x540. Source snapshots and ledger were revalidated before pass4.
