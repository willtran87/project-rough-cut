# Under the Green visual upgrade — pass 20

V35 and V36 accepted locally after the combined machinery/material/control work. Full objective remains 53 visual requirements and seven whole-level release gates. Local acceptance is now14/53; all seven gates remain open.

## Final prop behavior and appearance

The pump assembly has a shaped centrifugal casting, joined motor/coupling, bolted cover, rounded continuous delivery pipe, flange hardware, separate corroded feet and a fitted casing seal. Dedicated pixel materials distinguish green enamel, rubbed steel, dark iron, rust and rubber. This builds on passes2/19 and completes the local V35 construction/art criteria rather than declaring an entire district or the whole game finished.

The bypass handle is now a tapered beveled cast arm with a rounded, chipped red palm grip, closer to the intro's red control than the prior straight bar and black rectangular handle. The grip's top and maximum pivot radius remain0.48m. Rigid pieces merge into three material draws, down from four, and retain the original authoritative lever/latch/diverter animation.

Pressure dials retain512px faces and real state-driven needles, with irregular peripheral water/oxide marks. Cracks now live on a separate256px-per-face glass layer **in front of the needles**, beneath the bezel lip. Small broken rim glints and a very light glass tint avoid a bright plate over the reading. Dark gauge seals, revised fitted bezels and the pump casing seal finish the assembly. Existing brackets, labels and E reach remain intact. No new input mapping, checkpoint, navigation rule or hazard behavior.

This meets V36's worn grip, cracked glass, layered dial art, fitted mounting, identifiable E control and truthful pressure/lever state requirements. Intro/gameplay coherence for the rest of the level (V52), global material/density acceptance and complete Level1 parity remain open.

## Evidence

`tools/verify-under-green-control-finish.cjs`:

- Native26226 terminalPASS27views; software56539 terminalPASS18views. Art evidence in `output/under-green/visual-upgrade/pass20-controls/{hardware,software}`.
- Native target2560×1600; fallback960×600. Native additional1280×720,390×844,844×390.
- Before/after front, rear, casting, motor, approach, operator and keeper release; intermediate/latched pump and moving/secured release.
- Actual E, gauge levels versus water state, pause freezing, resumed latch and keeper closure pass. No console/page errors.
- Actual geometry audit: glass plane localZ0.36199999, foremost needle/hub0.35850000, gap~3.5mm; glass does not write depth. Grip maximum pivot radius0.47999999m. Material/UV tests inherited from pass19 remain valid.

`tools/verify-under-green-machinery.cjs --output=output/under-green/visual-upgrade/pass20-mechanisms`:

- Native57605 terminalPASS41screenshots and41gate fractions, actual E pump/release operations, state/pause checks,924camera placements with zero contacts, no browser errors. The tool now accepts an output directory so historical evidence is preserved.

`tools/verify-under-green-moving-clearance.cjs --dry --output=output/under-green/visual-upgrade/pass20-clearance`:

- Native47581 terminalPASS1,379rendered route frames,106actor/body/tool geometry audits, zero scenery intersections, maximum foot error2.4147e-7m. This is a replayed simulation route with geometry audits, not a human fear/pacing test.

Installed develop-web-game client90976 terminalexit0: fivepairs in `pass20-client`; final screenshot/text inspected, introcompleted, playing at(0,16.52),960×540software, new control metadata present, no error artifact.

Visually inspected native ready/moving controls at2560×1600, portrait operation, software operating view, and final client scene. Rounded worn grip and distinct face/glass/needle layers read clearly; cracks stay at the edges instead of crossing the primary scale. Prior pass19 close/front/rear material evidence remains relevant to the retained casting/pipe/feet artwork. Artwork references: `assets/cutscenes/under-green-opening/02-the-keepers-route.png`, existing Level1 material board and current native captures.

## Measured scope and limits

One new512×256glass atlas: estimated699,051bytes RGBA8+mips (~0.67MiB). At the operator view draws remain387, triangles300,070→301,350; front adds one draw/384triangles; sampled rear adds three draws/1,796triangles. Programs remain131 across paired fixtures. Fixed housing draws18; moving handle draws3. Counters bound this local change, but are not completed GPU frame-time evidence. Full software performance gate remains unmet.

No whole-level signoff from these prop tests. Keep remaining architecture, materials, floor/water, lighting, pipes, sluice, actors, effects, presentation and all release gates intact. No new raster generation this pass; existing editable canvas art and real geometry were refined. Four final production/test snapshots and hashes: `output/under-green/visual-upgrade/pass20-source/final-hashes.json`. All owned jobs terminal. No other-chapter runtime edits, commits, deployment or deletion.
