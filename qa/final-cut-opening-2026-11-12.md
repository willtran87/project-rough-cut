# Final Cut — physical opening and mowing pass

The full 72-item goal remains active/incomplete. This pass improves FC03/04/06/07/13/27/28/29/57/59/66. No final experiential acceptance, deployment or human listening session is claimed.

## Implemented

- Arrival faces the rig at its actual parked position. Look input remains free. The existing unlimited safe arrival and progress-triggered reveal remain. Once watched, the reveal is saved; retry starts with a fresh four-second announcement.
- Grass cutting uses the swept front reel interval, not a whole-sector proximity switch. Partial strips remove concealment only at cut locations. Separate cut intervals preserve untouched gaps. Legacy whole-sector saves still restore.
- 1,944 tufts replace rough pillars. Each tuft has three tapered bent leaves; cut tufts retain stubble. Only changed transforms update, with fixed instanced geometry. A bounded 72-piece clipping effect follows a live cut and is disabled by reduced motion.
- Four tournament props have intact collision, physical rig-triggered destruction, bounded debris and spatial crack sound. The first strip contains a table and bench; destroyed props stop blocking movement. Debris settles immediately under reduced motion and on restored saves.
- The real first-lane pass near the stone bunker triggers one protected scrape and wall reassurance. The first completed rough sector stops the synthetic PA applause/chime cycle; machinery remains. PA panning follows the grandstand's real direction. This is a procedural placeholder for recorded ceremony, not recorded human applause.
- Partial cut intervals, destruction and watched reveal are included in snapshots. Pass completion, capture and pause persist changed terrain. Existing pump/victory saves remain compatible.

## Evidence

- `node tools/verify-final-cut-mowing.mjs` passes both directions at 30/60/120 Hz: partial cutting, standing concealment, cut exposure, complete strip, two actual destroyed props, one silence beat, one protected cue, save restoration, separated cut gaps, intact/destroyed collision, seen-reveal retry and malformed geometry.
- `node tools/verify-final-cut-opening.cjs` passes actual input into reveal, rendered partial/full cut and furniture changes, surviving close pass, fixed 12 audio voices, pause freeze and normal terrain/reveal reload. Ten screenshot/state pairs, no console/page errors. Bunker observation uses an explicit positioning fixture; this is not an uninterrupted first-time route test.
- Existing rule suite passes 13 groups/seven complete simulation pilots. Walk/sprint/prepared times remain 74.88/78.69/56.87 seconds; the chapter remains too compact to represent all planned pacing.
- Existing browser and controls suites pass movement, pause, pump, reload, bell, physical trap, road completion, remapping, injected gamepad, real multi-touch release/cancellation and defeat/retry. Danger-message suite passes both directions and 30/60/120Hz.
- Installed standard client passed two iterations at `output/final-cut/standard-opening` and `standard-opening-final`; final audio-pan smoke at `standard-opening-audio-final` also completed successfully. Its latest screenshot/state were inspected: ready/playing, 8.96m traveled, fixed 12 sources, no error artifacts.
- Inspected actual arrival screenshots at 2560×1600, 1280×720, 844×390 and 390×844; deployment, partial cut, destruction, close pass, cleared route and restored terrain at 2560×1600. Mower is now in the default portrait view. Refuge pillars still obstruct some oblique views, and tall rough hides low furniture until cut; further authored staging remains needed.

Artifacts: `output/final-cut/opening/report.json`, per-shot states/screenshots, `mowing.json`, `rules.json`, `browser.json`, `controls.json`, standard-client directories. Hardware shots used RTX 3090/D3D11, internally 1600×1000 for the 2560×1600 viewport. Software client uses SwiftShader at 960×540. CPU render submission time is not GPU-completed FPS. The protected-pass sample reports 110 draws/66,320 triangles/20 geometries/16 textures; sustained profiling remains open.

## Issues resolved during verification

The first browser fixture sampled before the reels reached any grass. State showed the cut interval at x24.48–29.8 while the first patch ended at x23.5. Corrected the observation timing; did not change speed or weaken the test. Also moved the refuge observation point toward its low front wall so the approach is less hidden by the side pillar. Existing movement test now measures actual displacement because the authored arrival yaw changed.

## Remaining work

Keep the full ledger authoritative. Next: physically distinct entrance paths, Joe's equipment-bay relocation, complete overview composition and meaningful crossing decisions; then rig/terrain catastrophe and safe physical road/fence/Joe coda. Natural finished art, recorded sound, input mastery, evidence endings, credits/postcredits and full device/human/performance acceptance remain open or partial. A staged screenshot and a procedural sound flag do not establish player comprehension or emotional effect.
