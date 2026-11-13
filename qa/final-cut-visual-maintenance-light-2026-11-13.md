# Final Cut opening maintenance light

Advances FV10/FV11/FV12/FV47/FV50. The full 72-item objective remains active; this is not complete Level 1 parity or character-art acceptance.

## Implementation

- Added a fixed industrial work light on the existing east access fence. Its 10cm mast lies inside the 12cm fence footprint; the raised bracket and head stay above walking clearance. The fixture has a shielded housing, recessed lens, nine guard ribs, side pivots, fasteners, fence clamps and a junction box. Thirty-one parts share one box geometry and four material batches; three materials reuse the existing authored industrial atlas. Only the dimmable lens material is new, with no new texture.
- A bounded warm spotlight illuminates the diagonal approach and boarding steps. Its origin is transformed from the actual lens plane; target and fixture orientation agree. A first visual pass illuminated the reeds too strongly, so intensity was reduced from120 to80 and the target moved toward the steps.
- The circuit fades over the final0.8 seconds before Joe finishes seating. It is fully off before the marker startup, and remains off during the reveal, later attacks and aftermath. State derives from the authoritative arrival clock, including restored saves; there is no wall-clock fade or new saved field.
- Joe's existing animated meshes now cast real shadows. Hardware uses a512 shadow map and software a256 map for this light. Shadow updates follow changed boarding state and stop when the circuit is off or the simulation is paused. This does not establish full performance acceptance.

## Verification

- Refreshed hardware native2560x1600 screenshots for walk, boarding, overlook, half-fade, markers and the fixture, plus1280x720,844x390 and390x844 boarding views. The targeted test compares actual framebuffer pixels with the light on/off and with Joe's shadow enabled/disabled, and exercises reduced motion, actual pause, reload and later-checkpoint shutdown.
- Real-input reveal browser test passes12captures/fourviewports, two unblocked marker lights, folded-to-open wing spread5.21076→10.5m, intermediate pause and completed-reveal reload. Pure reveal30/60/120Hz contracts also pass.
- All48 concealment comparisons are pixel-identical with the hidden rig shown/removed, across four directions, near/far positions, lateral offsets and crouching/standing.
- Existing light-occlusion tests pass real masonry-floor samples, exterior illumination, moving headlights, pause, reduced-motion spatial behavior, collapsed reload and shutdown.
- All three full browser routes pass real input through crossings, pump, bell, collapse and road. Four heard ball redirects total; zero captures/errors and20retained screenshots. Output: `output/final-cut/visual-timber/routes-final/browser.json`.
- Expanded targeted test exposed a harness timing issue: after reload, a real animation frame could advance the half-fade before manual stepping was enabled. The harness now enables the manual clock while still in briefing, before clicking Resume. It also completes the intro and explicitly asserts paused mode before the pause/reload check. No production timing or assertion tolerance was changed.

Final targeted hardware/software and installed-client receipts follow after terminal results. Existing reports from earlier test attempts are not substitutes for those receipts.

## Remaining

Cab bounce, Joe face/clothes/acting, remaining exterior and floodlight fixtures, engine/hydraulic detail, ground/refuge/effects/story/UI work, matched Level 1 comparisons and full performance gates remain. The boarding close view still includes physically occluding reeds and machine parts; this light improves visibility without cutting holes in the later concealment screen.

## Final receipts

- Final hardware targeted run61865 and software run53195 both exited0: six staged captures, four viewport sizes, positive actual illumination, visible actor shadows, reduced motion, paused clock, exact half-fade reload and later-stage circuit shutdown. Actor-shadow comparison changed78,123 pixels on hardware and6,777 on software. Hardware internal2560x1600; software960x600 in the same2560x1600 viewport. Inspected native hardware and software walk/boarding images, fixture close view and compact portrait. Software uses visibly coarser shadow edges; no final close-character or whole-device performance acceptance claimed.
- Installed skill client2930 exited0. Fresh screenshot/state inspected: intro completed, ready/playing, player y4.7372, arrival age0.68333, maintenance intensity80 and256 shadow map, internal960x540. No errors artifact. It covers ordinary intro/movement; targeted fixtures and full routes supply the detailed lighting and encounter evidence.
- All jobs owned by this pass are terminal. No replacement or restart of a live process was used. Ledger:13complete/28in_progress/31pending. No broad visual gate newly marked complete.
