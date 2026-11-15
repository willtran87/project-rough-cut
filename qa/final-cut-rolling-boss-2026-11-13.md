# Final Cut: rolling ambush turns and finale machine

Joe now follows continuous forward curves between ambush entries. The former waypoint stops and stationary pivots are gone. The vehicle also has a dedicated pixel-art armor treatment and a more threatening industrial-demonic silhouette.

## Motion

- Heading-matched curves connect all eight normal exits to eight entries and the bell trap: 72 baked routes. Each route checks the rig against shelters, fixtures, fences, the equipment bay and grandstand. Ordinary gameplay loads the catalog instead of searching the route graph during a turn.
- Speed is limited by curvature and acceleration across the entire route, rather than restarting at each bend. Service speed reaches 12 m/s; tested interior corner speed stays above 4.51 m/s. Joe brakes at the final staging pose for the existing 1.9/1.65-second rustle warning.
- Wheel steering follows the actual curve. Joe looks ahead along the committed road while his hands and feet remain attached to the controls.
- Normal side attacks prefer the nearby entry. North/south passes now span y=31–85 at x=22.8, allowing a rolling approach around the bay and road fence. All four attack directions remain available.
- `tools/build-final-cut-travel-routes.mjs` regenerates the checked catalog if the course or rig dimensions change. Exceptional noncatalog poses retain a runtime planner; its worst-case latency has not been profiled.

## Vehicle art

`web/final-cut-boss.js` supplies a deterministic 1024×1024 atlas with nearest filtering, chipped paint, fasteners, vent patterns, bone-colored iron and oxblood hazard panels. The rig gains a horned armored canopy, raised brow/cheek armor, grille teeth, dim-to-hot eyes, paired heat-shielded exhausts, side service plates, more detailed wing drives and rotating gears. Tires use 24 tread blocks rather than eight.

The additions use 344 modeled parts merged into nine meshes, totaling 8,202 triangles, plus two small eye meshes. They move with their mechanical parents; no independent animation timer drives the gears. The existing three-dimensional pixel-art presentation is retained. North/south reed screens have denser, taller upper foliage to conceal the crown at the closer staging positions.

## Verification

- `verify-final-cut-rolling.mjs`: 72 routes at 30/60/120/144 Hz, 347,244 integrated poses. No intermediate stops or stationary pivots; acceleration ≤6.001 m/s²; lateral displacement error below 2.3%; exact final position and heading; checked obstacle clearance.
- `verify-final-cut-rolling-boss-browser.cjs`: actual mesh translation, yaw, tire roll, opposed steering and Joe's hand/foot contacts on hardware and software renderers. Two complete diagnostic rolling routes, front/side/rear art views, pause and viewport checks. Close-view placement is a diagnostic fixture, not claimed as player traversal.
- `verify-final-cut-ambush-browser.cjs`: four rendered attack directions, actual keyboard evasion, directional rustle, lamp timing, pause and muted/reduced warnings on both renderers.
- Final paired warning screenshots, with the actual rig present versus diagnostically removed, show zero differing rig pixels in all four tested views on both renderers. An earlier pass exposed 45 pixels north and six south; the denser upper reeds resolve those glimpses. This is a check of those viewpoints, not universal concealment from every possible camera position.
- `verify-final-cut-rig-browser.cjs`: existing contact meshes and rotating reel extents pass their geometry checks. Decorative crown/armor details do not redefine the cutting banks.
- Main simulation, rig contact, mowing, drama, visual lure, balls, replay safety and four-direction ambush suites pass.
- Full browser routes: `node tools/verify-final-cut-arrival-browser.cjs --crossings --out=output/final-cut/rolling-boss/routes`. Direct 115.33 s, garage 119.22 s, drain 152.92 s; zero captures and browser errors. These use ordinary Gamepad API movement/look/Use through the crossings, pump, bell, collapse and road completion. The drain route includes ball redirection. The harness captured 65 screenshots.
- Visual checks use 2560×1600, 1280×720, 844×390 and 390×844. The installed web-game client also runs against the updated build; gameplay state and screenshot are inspected.
- All owned verification processes finished with exit 0. Final client state is ready/playing with E bound to interaction; no browser error artifact was produced.

Evidence: `output/final-cut/rolling-boss/` contains rolling rules, renderer reports/images, full-route report and client output. Four-entry warning/escape evidence is in `output/final-cut/ambush/{hardware,software}/`. Regression logs are in `output/rolling-debug/`.

This completes the requested rolling-turn and vehicle-art pass, not the entire 72-item Final Cut backlog. No sustained FPS or human fear/difficulty-rating claim is made.
